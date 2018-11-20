import { SocketMessage, ResponseMarkets, ResponseTicks } from "../types/socket"
import { Market } from "../types/markets"
import { Tick, TickRequest } from "../types/charts"
import { socket } from "../WebSocket"
import { subtract30mInterval } from "../helpers"

export class SocketService {
  _chartDataCB: (market: Market, ticks: Tick[]) => void
  _marketDataCB: (markets: Market[]) => void

  /******************************
          request             
  *******************************/
  /**
   * Get all markets
   * @return {void}
   */
  getMarkets = () => {
    socket.send("MARKETS_GET")
  }

  /**
   * Drop current markets, get new list from exchange
   * @return {void}
   */
  refreshMarkets = () => {
    socket.send("MARKETS_UPDATE")
  }

  /**
   * Get ticks in range
   * @param request: TickRequest [{market, to, from}]
   * @return {void}
   */
  getTicks = (request: TickRequest) => {
    socket.send("TICKS_GET", request)
  }

  /**
   * Get most recent ticks
   * @param market: Market [market]
   * @return {void}
   */
  getLatestTicks = (market: Market) => {
    // calc time range
    const to = new Date().getTime()
    const from = subtract30mInterval(to)
    // ensure the chart is open and waiting
    this.relayChartData(market, [])
    this.getTicks({ market, to, from })
  }

  /**
   * Get a block of 500 ticks from the given timestamp
   * @param market: Market [market]
   * @param prev: number   [timestamp]
   * @type {void}
   */
  getTicksBefore = (market: Market, prev: number) => {
    const to = subtract30mInterval(prev, 1)
    const from = subtract30mInterval(to)
    this.getTicks({ market, to, from })
  }

  /******************************
          response             
  *******************************/

  /**
   * parse and route an incoming message
   * @param message: SocketMessage  [message]
   * @return {void}
   */
  parseMessage = (message: SocketMessage) => {
    switch (message.type) {
      case "MARKETS":
        const markets = (message as ResponseMarkets).data
        this.relayMarketData(markets)
        break

      case "TICKS":
        const data = (message as ResponseTicks).data
        const { market, ticks } = data
        this.relayChartData(market, ticks)
        break

      default:
        console.error("Unknown message type:", message.type)
    }
  }

  /**
   * Store a new chart data response callback
   * @param cb: (market: Market, ticks: Tick[]) => void  [the callback]
   * @return {void}
   */
  setChartDataCB = (cb: (market: Market, ticks: Tick[]) => void) => {
    this._chartDataCB = cb
  }

  /**
   * Store a new market data response callback
   * @param cb: (markets: Market[]) => void  [the callback]
   * @return {void}
   */
  setMarketDataCB = (cb: (markets: Market[]) => void) => {
    this._marketDataCB = cb
  }

  /**
   * Pass market data to callback if set
   * @param markets: Market  [data]
   * @return {void}
   */
  relayMarketData = (markets: Market[]) => {
    if (this._marketDataCB) this._marketDataCB(markets)
  }

  /**
   * Pass chart data to callback if set
   * @param market: Market  [market]
   * @param ticks: Tick[]   [ticks]
   * @return {void}
   */
  relayChartData = (market: Market, ticks: Tick[]) => {
    if (this._chartDataCB) this._chartDataCB(market, ticks)
  }
}

const socketService = new SocketService()
export default socketService
