const { timeToPrevInterval } = require("../helpers")

/**
 * standardises binance market data
 * @param  {baseAsset, quoteAsset}[] data [incoming data]
 * @return {base, quote}[]                [standardised data]
 */
exports.parseMarkets = data => {
  return data.symbols
    .filter(m => m.status === "TRADING")
    .map(exports.parseMarket)
}

/**
 * standardises binance market data
 * @param  {baseAsset, quoteAsset} data [incoming data]
 * @return {base, quote}                [standardised data]
 */
exports.parseMarket = market => {
  return { base: market.baseAsset, quote: market.quoteAsset }
}

/**
 * standardises binance tick data
 * @param  [
 *           Open time,
 *           Open,
 *           High,
 *           Low,
 *           Close
 *         ][] data [incoming data]
 * @return {
 *           openTimestamp,
 *           open,
 *           high,
 *           low,
 *           close
 *         }        [standardised data]
 */
exports.parseTicks = data => {
  return data.map(t => ({
    openTimestamp: timeToPrevInterval(t[0]),
    open: t[1],
    high: t[2],
    low: t[3],
    close: t[4]
  }))
}
