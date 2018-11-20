const binanceAdapter = require("../../adapters/binanceAdapter")
const Markets = require("../../models/Markets")
const { request } = require("../../models/binanceAPI")

/**
 * delete markets and re-download from exchange
 * @return {Market[]} [markets]
 */
exports.updateMarkets = async () => {
  await Markets.clearMarketsTable()
  await Markets.saveMarkets(await exports.fetchMarkets())
  return await exports.getMarkets()
}

/**
 * get markets from database
 * @return {Market[]} [markets]
 */
exports.getMarkets = async () => {
  return await Markets.getMarkets()
}

/**
 * fetch and parse markets from exchange
 * @return {Market[]} [markets]
 */
exports.fetchMarkets = async () => {
  const result = await request("exchangeInfo")
  return binanceAdapter.parseMarkets(result.data)
}
