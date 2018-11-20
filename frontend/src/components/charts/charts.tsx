import * as React from "react"
import Chart from "./chart"
import { IChart } from "../../types/charts"
import { Market } from "../../types/markets"

interface PCharts {
  charts: IChart[]
  adjustChartZoom: (market: Market, zoom: number) => void
  adjustChartScroll: (market: Market, amount: number) => void
  closeChart: (market: Market) => void
  toggleLink: (market: Market) => void
}

const Charts: React.StatelessComponent<PCharts> = ({
  charts,
  adjustChartZoom,
  adjustChartScroll,
  closeChart,
  toggleLink
}) => {
  return (
    <div className="charts">
      {charts.map(c => {
        const { base, quote } = c.market
        const title = `${base}-${quote}`
        return (
          <Chart
            chart={c}
            key={title}
            title={title}
            adjustChartZoom={adjustChartZoom}
            adjustChartScroll={adjustChartScroll}
            closeChart={closeChart}
            toggleLink={toggleLink}
          />
        )
      })}
    </div>
  )
}

export default Charts
