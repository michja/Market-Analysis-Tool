import { Market } from "./markets"

export interface IChart {
  market: Market
  ticksSplit: TicksSplit
  linked: boolean            // is the chart linked to others?
  ticksRequested: boolean    // have more ticks been requested?
  loading: number | boolean  // is the chart waiting on critical data?
                             // loading can be a timestamp if chart should
                             // jump to that time when the ticks arrive
}

export interface TicksSplit {
  visible: Tick[]
  before: Tick[]
  after: Tick[]
}

export interface TickRequest {
  market: Market
  from: number
  to: number
}

export interface Tick {
  openTimestamp: number
  open: number
  high: number
  close: number
  low: number
}

