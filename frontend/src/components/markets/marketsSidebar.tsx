import * as React from "react"
import MarketsList from "./marketsList"
import { Market } from "../../types/markets"

interface PMarketsSidebar {
  markets: Market[]
}

const MarketsSidebar: React.StatelessComponent<PMarketsSidebar> = ({
  markets
}) => {
  return (
    <aside className="sidebar-markets">
      <MarketsList markets={markets} />
    </aside>
  )
}

export default MarketsSidebar
