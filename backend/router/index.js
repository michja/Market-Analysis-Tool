const router = async (request, response) => {
  const routers = [
    require("./marketsRouter"),
    require("./ticksRouter"),
    // require("./debugRouter")
  ]

  // loop through routes, break on response
  for (let r of routers) {
    if (await r(request, response)) break
  }
}

module.exports = router
