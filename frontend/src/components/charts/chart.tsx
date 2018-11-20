import * as React from "react"
import ChartHeader from "./chartHeader"
import { ChartBody } from "./chartBody"
import { IChart } from "../../types/charts"
import { Market } from "../../types/markets"
import { timestampToDateString } from "../../helpers"

interface PChart {
  title: string
  chart: IChart
  adjustChartZoom: (market: Market, zoom: number) => void
  adjustChartScroll: (market: Market, amount: number) => void
  closeChart: (market: Market) => void
  toggleLink: (market: Market) => void
}

const Chart: React.StatelessComponent<PChart> = ({
  title,
  chart,
  adjustChartZoom,
  adjustChartScroll,
  closeChart,
  toggleLink
}) => {
  const { market, ticksSplit, linked, loading } = chart
  const time = ticksSplit.visible.length
    ? timestampToDateString(ticksSplit.visible[0].openTimestamp)
    : ""
  return (
    <div className="chart">
      <ChartHeader
        title={title}
        linked={linked}
        time={time}
        close={() => closeChart(market)}
        toggleLink={() => toggleLink(market)}
      />
      <ChartBody
        adjustChartZoom={(zoom: number) => adjustChartZoom(market, zoom)}
        adjustChartScroll={(amount: number) =>
          adjustChartScroll(market, amount)
        }
        loading={loading !== false}
        ticks={ticksSplit.visible}
        width={800}
        height={200}
      />
    </div>
  )
}

export default Chart
