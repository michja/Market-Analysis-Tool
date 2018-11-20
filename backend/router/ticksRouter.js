const Ticks = require("../models/Ticks")
const Markets = require("../models/Markets")
const { timeToPrevInterval } = require("../helpers")
const binanceController = require("../controllers/binanceController")
const { Market } = Markets

const ticksRouter = async (request, response) => {
  const type = "TICKS"

  // unpack the request
  const { data, action } = request
  if ("market" in data) {
    data.market = new Market(data.market)
  }

  // formatted response
  const r = response
  response = ticks => r(type, { market: data.market, ticks })

  switch (action) {
    case "TICKS_GET":
      response(
        await binanceController.getTicks(
          data.market,
          timeToPrevInterval(data.from),
          timeToPrevInterval(data.to)
        )
      )
      return true
      break

    case "TICKS_SELECT":
      response(await binanceController.selectTicks(data.market))
      return true
      break

    default:
      return false
  }
}

module.exports = ticksRouter
