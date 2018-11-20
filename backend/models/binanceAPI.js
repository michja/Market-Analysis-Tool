const axios = require("axios")
const logAPI = require("debug")("API")

apiBase = "https://api.binance.com/api/v1/"

/**
 * encodes a request into an api URL
 * @param  {String} route  [URL string]
 * @param  {Object} params [params to request]
 * @return {String}        [complete request URL]
 */
const buildURL = (route, params = "") => {
  if (params) {
    params =
      "?" +
      Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join("&")
  }
  return `${apiBase}${route}${params}`
}

/**
 * request data from binance API
 * @param  {String} route  [route]
 * @param  {String} params [params]
 * @return {Object}        [data from API]
 */
exports.request = async (route, params = "") => {
  const URL = buildURL(route, params)
  logAPI("-------------------")
  logAPI("API Request")
  logAPI("-------------------")
  logAPI("Route:", route)
  logAPI("Params:", params)
  logAPI("URL:", URL)
  logAPI("-------------------")
  return await axios.get(URL)
}
