/******************************
        NOTE             
*******************************/
// This canvas based class is adapted 
// from an earlier project. It's functional 
// but could be written better, with more 
// annotations. I now prefer SVG over canvas,
// so won't improve this, but will rewrite
// the component to use SVG when possible

import * as React from "react"
import { Tick } from "../../types/charts"

const green = "#88b14b";
const red = "#c23b22"
const font = "10px sans-serif";
const fontBold = "bold 10px sans-serif";

interface Coordinates {
  x: number,
  y: number
}

export const date_to_mysql = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

const add_zero = (n: number): string => (n < 10) ? `0${n}` : String(n);

export const format_time = (date: Date): string => {
  return `${add_zero(date.getHours())}:${add_zero(date.getMinutes())}`;
}
export const format_date = (date: Date): string => {
  return `${add_zero(date.getDate())}/${add_zero(date.getMonth()+1)}`;
}

const format_satoshi = (n: number): string => {
  // const val = n / 100000000;
  return n.toFixed(8);
}




interface ChartProps {
  ticks: Tick[];
  width: number;
  height: number;
  loading: boolean
  adjustChartZoom: (zoom: number) => void
  adjustChartScroll: (zoom: number) => void
  // requestMore: (cb: (ticks: Tick[]) => void) => void;
}

export class ChartBody extends React.Component<ChartProps, {}> {
  
  maxHigh: number = 0;
  minLow: number = 0;
  graphWidth: number; // width - axis labels
  graphHeight: number; // height - axis labels
  xLabelHeight = 40;
  yLabelWidth = 100;
  trackWidth: number; // px value for width of a track
  heightUnit: number; // px value for 1% of height
  heightRange: number; //top and bottom of the 
  isDragging: boolean; // are we dragging the graph?
  dragStart: Coordinates; // draggin from where?
  overlayPosition: number = 0 // is the overlay position?

  constructor(props: ChartProps) {
    super(props);
    this.graphHeight = this.props.height - this.xLabelHeight;
    this.graphWidth = this.props.width - this.yLabelWidth;
  }

  drawYLabel = (ctx: CanvasRenderingContext2D, y: number, val: number) => {
    // dont draw labels too close to the overlay
    const overlayVicinity = this.overlayPosition - y
    if (this.overlayPosition && overlayVicinity < 12 && overlayVicinity > -12) {
      return
    }
    const label = format_satoshi(val);
    ctx.textAlign = "end"; 
    ctx.fillText(label, this.props.width - 20, y);
  }

  drawXLabel = (ctx: CanvasRenderingContext2D, x: number, label: string, y: number = this.props.height - 20) => {
    ctx.textAlign = "center";
    ctx.fillText(label, x, y);
  }

  drawGridY = (ctx: CanvasRenderingContext2D) => {
    const step = this.heightRange / 10;
    ctx.font = font;
    for (let i = this.minLow; i < this.maxHigh; i = i + step) {
      const lineTop = this.graphHeight - ((i - this.minLow) / this.heightUnit);
      ctx.fillStyle = '#888';
      this.drawYLabel(ctx, lineTop, i);
      ctx.fillStyle = '#ccc';
      ctx.fillRect(0, lineTop, this.graphWidth, 1);
    }
  }

  drawGridX = (ctx: CanvasRenderingContext2D, ticks: Tick[]) => {
    const step = Math.floor(ticks.length / 10);
    let lastDate = -1;
    for (let i = 0; i < ticks.length - 1; i = i + step) {
      const lineX = this.graphWidth - (i * this.trackWidth + this.trackWidth / 2);
      ctx.fillStyle = '#ccc';
      ctx.fillRect(lineX, 0, 1, this.graphHeight);
      // don't draw a label too close to the start
      if (lineX < 20) continue;

      ctx.fillStyle = '#888';
      ctx.font = font;
      this.drawXLabel(ctx, lineX, format_time(new Date(ticks[i].openTimestamp)));
      if (lastDate !== new Date(ticks[i].openTimestamp).getDay()) {
        ctx.font = fontBold;
        this.drawXLabel(ctx, lineX, format_date(new Date(ticks[i].openTimestamp)), this.props.height - 6);
      }
      lastDate = new Date(ticks[i].openTimestamp).getDay();
    }
  }
  
  drawTick = (ctx: CanvasRenderingContext2D, trackX: number, trackW: number, tick: Tick, colour: string) => {
    const stickX = trackX + (trackW / 2) ;
    const stickTopVal = tick.high - this.minLow;
    const stickBottomVal = tick.low - this.minLow;
    const stickTopPx = this.graphHeight - (stickTopVal / this.heightUnit);
    const stickHeightPx = this.graphHeight - stickTopPx - (stickBottomVal / this.heightUnit);
    ctx.fillStyle = "#333";
    ctx.fillRect(stickX, stickTopPx, 1, stickHeightPx);
    
    const candleTopVal = Math.max(tick.open, tick.close) - this.minLow;
    const candleBottomVal = Math.min(tick.open, tick.close) - this.minLow;
    const candleTopPx = this.graphHeight - (candleTopVal / this.heightUnit);
    const candleHeightPx = this.graphHeight - candleTopPx - (candleBottomVal / this.heightUnit);
    ctx.fillStyle = colour;
    ctx.fillRect(trackX, candleTopPx, trackW, candleHeightPx);
    
  }

  drawGraphOutline = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#666';
    ctx.rect(0, 0, this.graphWidth, this.graphHeight);
  }

  drawOverlay = (y: number) => {
    // dont draw below graph
    if (y > this.graphHeight) return; 
    const overlay = this.refs.overlay as HTMLCanvasElement;
    const ctx = overlay.getContext("2d") as CanvasRenderingContext2D;
    const percentage = (y/this.graphHeight);
    const val = this.maxHigh - percentage * this.heightRange;
    ctx.fillStyle = green;
    ctx.font = font;
    this.drawYLabel(ctx, y, val);
    ctx.fillRect(0, y, this.graphWidth, 1);
    ctx.stroke();
    this.overlayPosition = y
  }
  
  clearOverlay = () => {
    const overlay = this.refs.overlay as HTMLCanvasElement;
    const ctx = overlay.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    this.overlayPosition = 0
    this.redrawChart()
  }

  initCanvas = (): HTMLCanvasElement => {
    const canvas = this.refs.canvas as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const {ticks} = this.props
    var previousClose = 0;
    this.drawGridY(ctx);
    this.drawGridX(ctx, ticks);
    this.drawGraphOutline(ctx);
    const margin = (ticks.length > 40) ? 1 : 2;

    // go backwards through ticks because colour
    // depends on the previous tick
    for (var i = ticks.length - 1; i >= 0; i--) {
      const t = ticks[i]
      const colour = (previousClose > t.close) ? red : green;
      this.drawTick(ctx, this.graphWidth - (i * this.trackWidth) + margin - this.trackWidth, this.trackWidth - margin * 2, t, colour);
      previousClose = t.close;
    }
    ctx.stroke();
    return canvas;
  }
  
  componentDidMount() {
    this.initCanvas();
    const overlay = this.refs.overlay as HTMLCanvasElement;
    overlay.addEventListener("DOMMouseScroll", this.handleScroll, false);
    overlay.addEventListener("mousedown", this.handleMouseDown);
    overlay.addEventListener("mouseup", this.handleMouseUp);
    overlay.addEventListener("mousemove", this.handleMouseMove);
    overlay.addEventListener("mouseleave", this.handleMouseLeave);
  }
  
  componentDidUpdate() {
    this.redrawChart()
  }

  redrawChart = () => {
    const canvas = this.refs.canvas as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0,0,canvas.width, canvas.height);    
    this.initCanvas();
  }
  
  handleScroll = (event: WheelEvent) => {
    this.clearOverlay();
    event.preventDefault();
    const zoom = this.props.ticks.length + event.detail;
    if (zoom < 160 && zoom > 20) {
      this.props.adjustChartZoom(zoom);
    }
  }

  handleMouseDown = (event: Event) => {
    this.dragStart = {x: event['clientX'], y: event['clientY']};
    this.isDragging = true;
  }
  
  handleMouseMove = (event: Event) => {
    this.clearOverlay();
    if (this.isDragging) {
      const dragDistance = (this.dragStart.x - event['clientX']) * -1;
      this.dragStart = {x: event['clientX'], y: event['clientY']};
      this.props.adjustChartScroll(dragDistance);
    } else {
      const canvas = this.refs.canvas as HTMLCanvasElement;
      const offset = this.refs.offset as HTMLDivElement;
      const position = event['pageY'] - canvas.offsetTop - offset.offsetTop;
      this.drawOverlay(position);
      this.redrawChart()
    }
  }

  handleMouseLeave = (event: Event) => {
    this.clearOverlay();
  }

  handleMouseUp = (event: Event) => {
    this.isDragging = false;
  }
  
  render() {
    const {ticks} = this.props
    // get the max high value and minimum low
    const {minLow, maxHigh} = ticks.reduce((acc, val: Tick, i: number) => {
      acc.minLow = ( i === 0 || val.low < acc.minLow ) ? val.low : acc.minLow;
      acc.maxHigh = ( i === 0 || val.high > acc.maxHigh ) ? val.high : acc.maxHigh;
      return acc;
    }, {minLow: 0, maxHigh: 0});
    // split these values into actual min and min + margin
    this.maxHigh = maxHigh + (maxHigh - minLow) * .05;
    this.minLow = minLow - (maxHigh - minLow) * 0.05 ;
    this.trackWidth = this.graphWidth / ticks.length;
    this.heightRange = this.maxHigh - this.minLow;
    this.heightUnit = this.heightRange / this.graphHeight;
    // graphHeight - ( value / heightUnit ) = correct pixel height
    const classNames = ['canvas-wrap']
    if (this.props.loading) classNames.push('is-loading')
    return (
      <div className={classNames.join(' ')} ref="offset">
        <canvas ref="canvas" width={this.props.width} 
               height={this.props.height} />
        <canvas className="overlay" ref="overlay" width={this.props.width} 
               height={this.props.height} />
      </div>
    );
  }
}
