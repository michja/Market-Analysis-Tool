const Ticks = require("../models/Ticks")
const Markets = require("../models/Markets")
const logDebug = require("debug")("DEBUG")
const { Market } = Markets

const debugRouter = async (request, response) => {
  // unpackage some data
  const { data, action } = request
  if ("market" in data) {
    data.market = new Market(data.market)
  }

  // formatted response
  const r = response
  response = data => r(type, data)

  switch (action) {
    case "SHOW_TABLES":
      const tables = await Markets.showTables()
      logDebug("-------------------")
      logDebug("All tables")
      logDebug("-------------------")
      logDebug(tables)
      logDebug("-------------------")
      repsonse(tables)
      return true
      break

    case "CREATE_MARKETS_TABLE":
      await Markets.createMarketsTable()
      logDebug("Created markets table")
      return true
      break

    case "TEST_SAVE_MARKET":
      logDebug("Saved test market BTCETH")
      await Markets.saveMarkets([{ base: "BTC", quote: "ETH" }])
      return true
      break

    case "TABLE_EXISTS":
      logDebug("Does table exists for", data.market)
      const exists = await Ticks.tableExists(data.market)
      logDebug(exists)
      response(exists)
      return true
      break

    case "TABLE_CREATE":
      logDebug("Made table for", data.market)
      await Ticks.tableCreate(data.market)
      return true
      break

    default:
      return false
  }
}

module.exports = debugRouter
