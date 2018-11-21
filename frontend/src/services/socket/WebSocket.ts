import { SocketMessage } from "../../types/socket"

class WS {
  _ws: WebSocket
  /**
   * Function to pipe all incoming socket messages to
   */
  _responseCB: (data: object) => void

  /**
   * Store a new response callback
   * @param   cb: (data: object) [the callback]
   * @return : void
   */
  setResponseCB = (cb: (data: object) => void) => {
    this._responseCB = cb
  }

  /**
   * Pass message to callback if set
   * @param   data: object  [the data]
   * @return : void
   */
  relayResponse = (data: object) => {
    if (this._responseCB) {
      this._responseCB(data)
    } else {
      console.error("Received socket response before callback was registered:", data)
    }
  }
  
  constructor() {
    const WS_HOST = process.env.NODE_ENV === 'production' ? 'ws://michja.com:8080' : 'ws://localhost:8080';
    this._ws = new WebSocket(WS_HOST)

    // Convert all messages from JSON and send them on
    this._ws.onmessage = (e: MessageEvent) => {
      const message = this.validateResponse(e.data)
      if (!message) return
      this.relayResponse(message)
    }

    // request data for intialisation
    this._ws.onopen = () => {
      this.send("MARKETS_GET")
    }
  }

  /**
   * close the websocket
   * @return {void}
   */
  leave = () => {
    this._ws.close()
  }

  /**
   * Encode action as a JSON object and send it
   * @param  action: string [the action]
   * @return : void
   */
  send = (action: string, data: object = {}) => {
    this._ws.send(JSON.stringify({ action, data }))
  }

  /**
   * Parse message and check it has a type and some data
   * @param  data: string [the incoming message]
   * @return : SocketMessage [the data as an Object]
   */
  validateResponse = (data: string): SocketMessage | null => {
    let result = {}
    try {
      result = JSON.parse(data)
    } catch (e) {
      console.error("Badly formed JSON from socket")
    }

    // return if parse failed
    if (typeof result !== "object") {
      return null
    }

    // return if object is malformed
    if (!("type" in result) || !("data" in result)) {
      console.error("Bad response from socket:", data)
      return null
    }

    // return vaildated object
    return result
  }
}

const socket = new WS()

export { socket }
