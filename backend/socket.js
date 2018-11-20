const WebSocket = require("ws")
const router = require("./router")

class Socket {
  constructor() {
    const wss = new WebSocket.Server({ port: 8080 })
    wss.on("connection", async ws => {
      /**
       * send a response as JSON
       * @param  {any} data [data]
       */
      const sendJSON = data => {
        if (data) {
          ws.send(JSON.stringify(data))
        }
      }

      /**
       * response helper with expected formatting
       * @param  {String} type  [message type]
       * @param  {any}    data  [data]
       */
      const response = (type, data) => {
        sendJSON({ type, data })
      }

      // incoming message
      ws.on("message", async message => {
        // parse message and validate request
        const request = this.parseMessage(message)
        if (!this.isValidRequest(request)) {
          console.error("Badly formed request:", request)
          return
        }
        // route request
        await router(request, response)
      })
    })
  }

  /**
   * Parses an incoming message string into an object
   * @param  {String}  message  [message]
   * @return {Object}  request  [request]
   */
  parseMessage(message) {
    let request = null
    try {
      request = JSON.parse(message)
    } catch (e) {
      console.error("Request not valid JSON")
    }
    return request
  }

  /**
   * Checks that data is a valid object with an action property
   * @param  {any}  request  [request]
   * @return {Boolean}
   */
  isValidRequest(request) {
    return typeof request === "object" && "action" in request
  }
}

module.exports = new Socket()
