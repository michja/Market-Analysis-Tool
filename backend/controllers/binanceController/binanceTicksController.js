const binanceAdapter = require("../../adapters/binanceAdapter")
const Ticks = require("../../models/Ticks")
const {
  currentTimestamp,
  subtract30mInterval,
  timeout
} = require("../../helpers")
const { request } = require("../../models/binanceAPI")

/**
 * fetch and parse ticks from the exchange
 * @param  {Market} market  [which market]
 * @param  {Number} endTime [until when]
 * @return {Tick[]}         [ticks]
 */
exports.fetchTicks = async (market, endTime, limit = 500, interval = "30m") => {
  const symbol = market.toString()
  const params = { symbol, interval, limit, endTime }
  const result = await request("klines", params)
  return binanceAdapter.parseTicks(result.data)
}

/**
 * fetch a range of ticks from the exchange
 * @param  {Market} market   [market]
 * @param  {Number} from     [timestamp from when?]
 * @param  {Number} to       [timestamp to when?]
 * @param  {Number} limit    [how many per fetch?]
 * @param  {String} interval [interval]
 * @return {Tick[]}          [ticks]
 */
exports.recursiveFetchTicks = async (
  market,
  from,
  to,
  limit = 500,
  interval = "30m",
  cooldown = 0
) => {
  // get some ticks
  const ticks = await exports.fetchTicks(market, to, limit, interval)
  // got the full set?
  if (ticks[0].openTimestamp < from) {
    // yes -> give them back
    return ticks
  } else {
    // no -> get more
    // starting from one interval before the last time
    const nextTo = subtract30mInterval(ticks[ticks.length - 1].openTimestamp)

    // cooldown 1s every 3 function calls to be kind to the api
    cooldown++
    const timeoutMs = cooldown % 3 === 0 ? 1000 : 0

    // promise all will hold up the flow until
    // timeout has run down for timeoutMs milliseconds
    const [nextTicks] = await Promise.all([
      exports.recursiveFetchTicks(
        market,
        from,
        nextTo,
        limit,
        interval,
        cooldown
      ),
      timeout(timeoutMs)
    ])

    return [...ticks, ...nextTicks]
  }
}

/**
 * checks whether ticks run from provided to time provided
 * @param  {Tick[]} ticks [ticks]
 * @param  {Number} from  [timestamp]
 * @param  {Number} to    [timestamp]
 * @return {Boolean}      [complete?]
 */
exports.isCompleteSet = (ticks, from, to) => {
  // do we have any ticks?
  if (!ticks.length) return false

  // do the first and last match the expected times?
  const end = to === ticks[0].openTimestamp
  const start = from === ticks[ticks.length - 1].openTimestamp
  return end && start
}

/**
 * Gets ticks within a range
 * Initially from db but will call API if
 * ticks are missing from db
 * @param  {Market} market [market]
 * @param  {Number} from   [timestamp]
 * @param  {Number} to     [timestamp]
 * @return {Tick[]}        [ticks]
 */
exports.getTicks = async (market, from, to) => {
  // make sure the table exists
  await Ticks.tableCreate(market)

  // attempt to get ticks from db
  const dbTicks = await Ticks.getTicks(market, from, to)
  // do we have the whole set in the db?
  const complete = exports.isCompleteSet(dbTicks, from, to)
  // yes -> return them
  if (complete) return dbTicks
  // no -> get them from the exchange
  const exchangeTicks = await exports.recursiveFetchTicks(market, from, to)
  // save to db
  await Ticks.saveTicks(market, exchangeTicks)
  // fetch from db
  // better to get them again from db for formatting reasons
  return await exports.getTicks(market, from, to)
}

/**
 * straight selection of 500 ticks from the db
 * @param  {Market} market   [market]
 * @param  {Number} lastTick [last timestamp]
 * @return {Tick[]}          [ticks]
 */
exports.selectTicks = async (market, lastTick) => {
  return await Ticks.getTicks(market, lastTick)
}
