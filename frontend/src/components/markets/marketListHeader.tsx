import * as React from "react"
import socketService from "../../services/socket"
import Refresh from "./refresh.png"

const MarketListHeader: React.StatelessComponent = () => {
  return (
    <header className="ml__header">
      <h2>Markets</h2>
      <button
        onClick={handleFetchMarkets}
        title="Fetch the current list of markets from the exchange"
      >
        <img src={Refresh} alt="Refresh markets" />
      </button>
    </header>
  )

  /**
   * Click handler for fetch markets
   * @param  e: React.SyntheticEvent [event]
   * @return {void}
   */
  function handleFetchMarkets(e: React.SyntheticEvent) {
    e.preventDefault()
    socketService.refreshMarkets()
  }
}

export default MarketListHeader
