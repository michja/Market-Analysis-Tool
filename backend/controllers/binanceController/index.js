const binanceMarketsController = require("./binanceMarketsController")
const binanceTicksController = require("./binanceTicksController")

module.exports = {
  ...module.exports,
  ...binanceMarketsController,
  ...binanceTicksController
}
