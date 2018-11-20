import * as React from "react"
import { socket } from "./WebSocket"
import { Market } from "./types/markets"
import { IChart, Tick, TicksSplit } from "./types/charts"
import Charts from "./components/charts/charts"
import { Store } from "./types/store"
import socketService from "./services/socketService"
import { hasSeenHelp, setSeenHelp, subtract30mInterval } from "./helpers"
import Help from "./components/help/Help"
import MarketsSidebar from "./components/markets/marketsSidebar"


class App extends React.Component<{}, Store> {
  constructor(props: object) {
    super(props)

    // show the help onload once
    const helpVisible = !hasSeenHelp()
    setSeenHelp()
    this.state = {
      helpVisible,
      markets: [],
      charts: []
    }
  }

  render() {
    const { markets, charts, helpVisible } = this.state

    // get the markets not open for sidebar
    const marketsOpen = new Set<string>(
      charts.map(c => c.market.base + c.market.quote)
    )
    const marketsNotOpen = markets.filter(
      m => !marketsOpen.has(m.base + m.quote)
    )
    return (
      <div className="app">
        <MarketsSidebar markets={marketsNotOpen} />
        <Charts
          charts={charts}
          adjustChartZoom={this.adjustChartZoom}
          adjustChartScroll={this.adjustChartScroll}
          closeChart={this.closeChart}
          toggleLink={this.toggleLink}
        />
        <Help visible={helpVisible} toggle={this.toggleHelp} />
      </div>
    )
  }

  /******************************
          lifecycle             
  *******************************/

  componentDidMount = () => {
    // hook in socket callbacks
    socketService.setChartDataCB(this.receivedChartData)
    socketService.setMarketDataCB(this.receivedMarketData)
    socket.setResponseCB(socketService.parseMessage)
  }

  componentWillUnmount = () => {
    socket.leave()
  }

  /******************************
          help screen             
  *******************************/
  
  /**
   * set the help screen as visible or not
   * @return {void}
   */
  toggleHelp = () => {
    this.setState({ helpVisible: !this.state.helpVisible })
  }

  /******************************
          socket callbacks             
  *******************************/

  /**
   * handle new markets data - overwrite previous
   * @param  markets: Market[]  [new markets]
   * @return {void}
   */
  receivedMarketData = (markets: Market[]) => {
    this.setState({ markets })
  }

  /**
   * handle new charts data
   * either add to an open chart
   * or create a new one if not open
   * @param  market: Market  [market]
   * @param  ticks:  Tick[]  [tick data]
   * @return {void}
   */
  receivedChartData = (market: Market, ticks: Tick[]) => {
    const index = this.locateChartIndex(market)
    if (index > -1) {
      this.insertMoreTicks(index, ticks)
    } else {
      this.addChart(market)
    }
  }

  /******************************
          charts - ticks             
  *******************************/

  insertMoreTicks = (index: number, ticks: Tick[]) => {
    const chart = this.state.charts[index]
    if (ticks.length > 0) {
      chart.ticksRequested = false
    }
    // get the current zoom or default
    const zoom = chart.ticksSplit.visible.length || 30
    chart.ticksSplit.before.push(...ticks)

    if (typeof chart.loading === "number") {
      const nextTicksSplit = this.scrollToTime(chart.ticksSplit, chart.loading)
      if (nextTicksSplit) chart.ticksSplit = nextTicksSplit
    } else {
      const nextChart = this.reZoomTicksSplit(chart, zoom)
      chart.ticksSplit = nextChart.ticksSplit
    }
    chart.loading = false
    this.updateChart(index, chart)
  }

  /**
   * create a new chart and add it into state
   * @param  market: Market  [market]
   * @return {void}
   */
  addChart = (market: Market) => {
    const { charts } = this.state
    const newChart = this.newChart(market)
    this.setState({ charts: [...charts, newChart] })
  }

  /**
   * generate the data structure for a new chart
   * @param  market: Market  [market]
   * @return {Chart}         [new chart]
   */
  newChart = (market: Market): IChart => {
    const chart = {
      market,
      ticksSplit: { visible: [], before: [], after: [] },
      linked: false,
      ticksRequested: true,
      loading: true
    }
    return chart
  }

  /**
   * Close a chart by market
   * @param  market: Market  [market]
   * @return {void}
   */
  closeChart = (market: Market) => {
    const index = this.locateChartIndex(market)
    if (index === -1) {
      console.error("Tried to close unknown chart:", market)
      return
    }

    const { charts } = this.state
    this.setState({
      charts: [...charts.slice(0, index), ...charts.slice(index + 1)]
    })
  }

  /**
   * replace a chart in state
   * @param  index: number  [array index]
   * @param  chart: Chart   [new chart]
   * @return {void}
   */
  updateChart = (index: number, chart: IChart) => {
    const { charts } = this.state
    this.setState({
      charts: [...charts.slice(0, index), chart, ...charts.slice(index + 1)]
    })
  }

  /**
   * find the array index of a chart from market data
   * @param  market: Market  [market]
   * @return {void}
   */
  locateChartIndex = (market: Market) => {
    const { charts } = this.state
    return charts.findIndex(
      c => c.market.base === market.base && c.market.quote === market.quote
    )
  }

  /**
   * change a chart zoom level (number of visible ticks)
   * @param  market: Market  [which chart?]
   * @param  zoom:   number  [new zoom]
   * @return void
   */
  adjustChartZoom = (market: Market, zoom: number) => {
    const index = this.locateChartIndex(market)
    if (index === -1) {
      console.error("Tried to zoom unknown chart:", market)
      return
    }

    const chart = this.state.charts[index]
    // is the chart linked?
    if (chart.linked) {
      // yes -> adjust every linked chart
      this.adjustLinkedChartsZoom(zoom)
    } else {
      // no -> adjust only this chart
      this.updateChart(index, this.reZoomTicksSplit(chart, zoom))
    }
  }

  /**
   * change the zoom level (number of visible ticks) of all linked charts
   * @param  zoom: number  [new zoom]
   * @return {void}
   */
  adjustLinkedChartsZoom = (zoom: number) => {
    const { charts } = this.state
    const nextCharts = charts.map(c => {
      if (c.linked) c = this.reZoomTicksSplit(c, zoom)
      return c
    })
    this.setState({ charts: nextCharts })
  }

  /**
   * recombines ticks based on a new zoom level
   * where zoom = number of visible ticks
   * will fire off request for more data if needed
   * @param   chart: IChart  [old chart]
   * @param   zoom:  number  [new zoom level]
   * @return  Chart          [new chart]
   */
  reZoomTicksSplit = (chart: IChart, zoom: number): IChart => {
    const { visible, before, after } = chart.ticksSplit
    const combined = [...visible, ...before]

    // should we request more ticks?
    chart.ticksRequested = this.maybeRequestMoreTicks(chart)

    chart.ticksSplit = {
      visible: combined.slice(0, zoom),
      before: combined.slice(zoom),
      after
    }
    return chart
  }

  maybeRequestMoreTicks = (chart: IChart): boolean => {
    // don't make more than one request
    if (chart.ticksRequested) return chart.ticksRequested

    const { visible, before } = chart.ticksSplit
    const combined = [...visible, ...before]

    // should we request more ticks?
    if (combined.length < 300) {
      const from = combined[combined.length - 1].openTimestamp
      chart.ticksRequested = true
      socketService.getTicksBefore(chart.market, from)
    }

    return chart.ticksRequested
  }

  /**
   * Apply current zoom level of linked charts to a chart
   * @param  chart: IChart  [chart to zoom]
   * @return {IChart}       [chart with new zoom]
   */
  matchLinkedZoom = (chart: IChart): IChart => {
    const linkedCharts = this.state.charts.filter(c => c.linked)

    // no charts already linked
    if (!linkedCharts.length) {
      return chart
    }

    // get the current zoom
    const zoom = linkedCharts[0].ticksSplit.visible.length
    // apply
    chart = this.reZoomTicksSplit(chart, zoom)
    return chart
  }

  matchLinkedZoomAndTime = (chart: IChart): IChart => {
    const zoomedChart = this.matchLinkedZoom(chart)
    return this.matchLinkedTimestamp(zoomedChart)
  }

  /**
   * scroll along a chart into future or past
   * @param  market: Market  [which chart?]
   * @param  amount: number  [how far?]
   * @return {void}
   */
  adjustChartScroll = (market: Market, amount: number) => {
    const index = this.locateChartIndex(market)
    if (index === -1) {
      console.error("Tried to adjust unknown chart:", market)
      return
    }

    const chart = this.state.charts[index]
    // is the chart linked?
    if (chart.linked) {
      // yes -> adjust every linked chart
      this.adjustLinkedChartScroll(amount)
    } else {
      // no -> adjust only this chart
      const nextChart = this.scrollTicksSplit(chart, amount)
      this.updateChart(index, nextChart)
    }
  }

  /**
   * scroll the visible time of all linked charts
   * @param  amount: number  [how far?]
   * @return {void}
   */
  adjustLinkedChartScroll = (amount: number) => {
    const { charts } = this.state
    const nextCharts = charts.map(c => {
      if (c.linked) c = this.scrollTicksSplit(c, amount)
      return c
    })
    this.setState({ charts: nextCharts })
  }

  /**
   * scrolls the visible selection in a ticksSplit
   * will fire off request for more data if needed
   * @param  chart: IChart   [old chart]
   * @param  amount: number  [how far?]
   * @return {IChart}    [new chart]
   */
  scrollTicksSplit = (chart: IChart, amount: number): IChart => {
    const { visible, before, after } = chart.ticksSplit

    // which direction are we moving?
    if (amount > 0 && after.length >= amount) {
      // forward -> show later ticks
      const afterIndex = after.length - amount
      const visibleIndex = visible.length - amount
      // reslice the ticks
      chart.ticksSplit = {
        visible: [
          ...after.slice(afterIndex),
          ...visible.slice(0, visibleIndex)
        ],
        before: [...visible.slice(visibleIndex), ...before],
        after: after.slice(0, afterIndex)
      }
    } else if (amount < 0 && before.length >= amount * -1) {
      // back -> show earlier ticks
      amount = amount * -1
      // reslice the ticks
      const nextTicksSplit = {
        visible: [...visible.slice(amount), ...before.slice(0, amount)],
        before: before.slice(amount),
        after: [...after, ...visible.slice(0, amount)]
      }

      // should we request more ticks?
      chart.ticksRequested = this.maybeRequestMoreTicks(chart)

      chart.ticksSplit = nextTicksSplit
    }

    // failed conditionals, return input untouched
    return chart
  }

  matchLinkedTimestamp = (chart: IChart): IChart => {
    const linkedCharts = this.state.charts.filter(c => c.linked)

    // no charts already linked
    if (!linkedCharts.length) {
      return chart
    }

    const openTimestamp = linkedCharts[0].ticksSplit.visible[0].openTimestamp
    const nextTicksSplit = this.scrollToTime(chart.ticksSplit, openTimestamp)

    // can't find timestamp
    if (!nextTicksSplit) {
      return this.requestHistoricTicks(chart, openTimestamp)
    }

    chart.ticksSplit = nextTicksSplit

    return chart
  }

  requestHistoricTicks = (chart: IChart, from: number): IChart => {
    // get the oldest current time
    const { visible, before } = chart.ticksSplit
    const combined = [...visible, ...before]

    // if no current ticks just return
    if (!combined.length) return chart

    // save the request so we can jump to it when the ticks arrive
    chart.loading = from
    // construct range from 500 before target to 1 before current
    from = subtract30mInterval(from)
    const to = combined[combined.length - 1].openTimestamp
    // send the request
    socketService.getTicks({ market: chart.market, to, from })
    return chart
  }

  scrollToTime = (
    ticksSplit: TicksSplit,
    openTimestamp: number
  ): TicksSplit | false => {
    const { visible, before, after } = ticksSplit
    // get the current zoom
    const zoom = visible.length
    const combined = [...after, ...visible, ...before]
    // find the index of the desired timestamp
    const index = combined.findIndex(t => t.openTimestamp === openTimestamp)

    // can't find timestamp
    if (index === -1) {
      return false
    }

    // resplit using new index and old zoom
    const nextVisible = combined.slice(index, index + zoom)
    const nextBefore = combined.slice(index + zoom)
    const nextAfter = combined.slice(0, index)

    return {
      visible: nextVisible,
      before: nextBefore,
      after: nextAfter
    }
  }

  /******************************
        charts - link state             
   *******************************/

  /**
   * set or clear a chart link state
   * @param  market: Market  [the market]
   * @return {void}
   */
  toggleLink = (market: Market) => {
    const index = this.locateChartIndex(market)
    if (index === -1) {
      console.error("Tried to toggle link on unknown chart:", market)
      return
    }

    const { charts } = this.state
    // is the chart being linked?
    const chart = !charts[index].linked
      ? // yes -> match the zoom and time
        this.matchLinkedZoomAndTime(charts[index])
      : // no -> just grab the chart
        charts[index]

    // flip linked status
    chart.linked = !chart.linked
    this.updateChart(index, chart)
  }
}

export default App
