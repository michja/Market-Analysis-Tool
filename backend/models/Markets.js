const { dbPromise } = require("../database")

/**
 * Wrapper for markets with a toString method
 * @type {Market}
 */
exports.Market = class Market {
  constructor(market) {
    this.base = market.base
    this.quote = market.quote
  }

  toString() {
    return `${this.base}${this.quote}`
  }
}

/**
 * Saves markets into the markets table
 * @param  {Market[]} markets [markets]
 * @return {void}
 */
exports.saveMarkets = async markets => {
  const db = await dbPromise
  const vals = markets.map(m => `('${m.base}', '${m.quote}')`).join()
  const sql = `INSERT INTO markets (base, quote) VALUES ${vals}`
  return await db.run(sql)
}

/**
 * Returns a full list of markets
 * @return {Market[]} [markets]
 */
exports.getMarkets = async () => {
  const db = await dbPromise
  return await db.all("SELECT * FROM markets order by base, quote")
}

/**
 * Drop and re-create the markets table
 * @return {void}
 */
exports.clearMarketsTable = async () => {
  await exports.dropMarketsTable()
  await exports.createMarketsTable()
}

/**
 * Create the markets table
 * @return {void}
 */
exports.createMarketsTable = async () => {
  const db = await dbPromise
  await db.run("create table markets(base TEXT, quote TEXT)")
}

/**
 * Drop the markets table
 * @return {void}
 */
exports.dropMarketsTable = async () => {
  const db = await dbPromise
  await db.run("drop table if exists markets")
}

/**
 * List all tables
 * @return {String[]} [all tables]
 */
exports.showTables = async () => {
  const db = await dbPromise
  const tables = await db.all(
    "select name from sqlite_master where type='table'"
  )
  return tables
}

/**
 * Drop all tables except the markets table
 * @return {void}
 */
const DEBUG_CLEAR_TABLES = async () => {
  const db = await dbPromise
  exports.showTables().then(r =>
    r.map(async m => {
      if (m.name !== "markets") {
        await db.run(`drop table [${m.name}]`)
      }
    })
  )
}
