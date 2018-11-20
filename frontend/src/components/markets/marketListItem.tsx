import * as React from "react"
import {Market} from '../../types/markets'

interface PMarketListItem {
  market: Market
  onClick: (m: Market) => void
}

const MarketListItem: React.StatelessComponent<PMarketListItem> = ({
  market,
  onClick
}) => {
  return (
    <button onClick={handleClick} className="market-list__item">
      <label>
        <span>{market.base}</span>-<span>{market.quote}</span>
      </label>
    </button>
  )

  function handleClick(e: React.SyntheticEvent) {
    e.preventDefault()
    onClick(market)
  }
}

export default MarketListItem
