const { dbPromise } = require("../database")
const { roundTimestampHalfHour, calculateStartTime, currentTimestamp } = require("../helpers")

/**
 * Checks whether a market table exists in the database
 * @param  {Market} market [market]
 * @return {Boolean} 
 */
exports.tableExists = async market => {
  const db = await dbPromise
  const table = await db.all(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='${market}';`
  )
  return table.length > 0
}

/**
 * Create a market table
 * @param  {Market} market [market]
 * @return {void}        
 */
exports.tableCreate = async market => {
  const db = await dbPromise
  return await db.run(
    `CREATE TABLE IF NOT EXISTS ${market} (openTimestamp INTERGER PRIMARY KEY, open INTERGER, high INTERGER, low INTERGER, close INTERGER)`
  )
}

/**
 * Save ticks to a market table
 * @param  {Market} market [market]
 * @param  {Tick[]} ticks  [ticks to save]
 * @return {void}        
 */
exports.saveTicks = async (market, ticks) => {
  const db = await dbPromise
  const vals = ticks
    .map(
      t =>
        `('${t.openTimestamp}', '${t.open}', '${t.high}', '${t.low}', '${
          t.close
        }')`
    )
    .join()
  const sql = `REPLACE INTO ${market} (openTimestamp, open, high, low, close) VALUES ${vals}`
  return await db.run(sql)
}

/**
 * does the database have the full set of ticks requested?
 * @param  {Market} market       [market]
 * @param  {Number} endTimestamp [latest tick]
 * @param  {Number} limit        [size of range wanted]
 * @return {Boolean}             [are all ticks in db?]
 */
exports.hasTickRange = async (market, endTimestamp, limit = 500) => {
  const startTimestamp = calculateStartTime(endTimestamp)
  return (
    (await exports.hasTick(market, endTimestamp)) &&
    (await exports.hasTick(market, startTimestamp))
  )
}

/**
 * return the oldest timestemp for a market
 * @param  {Market} market [market]
 * @return {Tick}          [tick]
 */
exports.oldestTimestamp = async market => {
  const db = await dbPromise
  const oldest = await db.get(
    `SELECT openTimestamp FROM ${market} ORDER BY openTimestamp ASC LIMIT 1`
  )

  return oldest ? oldest.openTimestamp : currentTimestamp()
}

/**
 * does the database have a single tick at the given timestamp?
 * @param  {Market} market    [market]
 * @param  {Number} timestamp [timestamp]
 * @return {Boolean}          [is the tick in the db?]
 */
exports.hasTick = async (market, timestamp) => {
  const db = await dbPromise
  const tick = await db.all(
    `SELECT * FROM ${market} WHERE openTimestamp='${timestamp}'`
  )
  return tick.length > 0
}

/**
 * Get the most recent ticks from db
 * Default 500 ticks
 * @param  {Market} market [market]
 * @param  {Number} limit  [how many?]
 * @return {Tick[]}        [ticks]
 */
exports.latestTicks = async (market, limit = 500) => {
  const db = await dbPromise
  return await db.all(
    `SELECT * FROM ${market} ORDER BY openTimestamp DESC LIMIT ${limit}`
  )
}

/**
 * Get a range of ticks from one time to another from db
 * @param  {Market} market [market]
 * @param  {Number} from   [timestamp]
 * @param  {Number} to     [timestamp]
 * @return {Tick[]}        [ticks]
 */
exports.getTicks = async (market, from, to) => {
  const db = await dbPromise
  return await db.all(
    `SELECT * FROM ${market} WHERE openTimestamp >= '${from}' and openTimestamp <= ${to} ORDER BY openTimestamp DESC`
  )
}
