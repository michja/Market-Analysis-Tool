const Markets = require("../models/Markets")
const binanceController = require("../controllers/binanceController")
const { Market } = Markets

const marketsRouter = async (request, response) => {
  const type = "MARKETS"
  const { action } = request

  // formatted response
  const r = response
  response = markets => r(type, markets)

  switch (action) {
    case "MARKETS_UPDATE":
      response(await binanceController.updateMarkets())
      return true
      break

    case "MARKETS_GET":
      response(await binanceController.getMarkets())
      return true
      break
      
    default:
      return false
  }
}

module.exports = marketsRouter
