import * as React from "react"
import { QuoteFilterItem } from "../../types/markets"

interface PMarketQuoteFilter {
  quotes: QuoteFilterItem[]
  onChange: (item: QuoteFilterItem) => void
}

const MarketQuoteFilter: React.StatelessComponent<PMarketQuoteFilter> = ({
  quotes,
  onChange
}) => {
  return (
    <div className="market-quote-filter">
      <header>
        <h2>Filter</h2>
      </header>
      <main>
        {quotes.map(q => (
          <QuoteFilterCheckbox
            key={`BFCB-${q.quote}`}
            item={q}
            onChange={onChange}
          />
        ))}
      </main>
    </div>
  )
}

interface PQuoteFilterCheckbox {
  item: QuoteFilterItem
  onChange: (item: QuoteFilterItem) => void
}

const QuoteFilterCheckbox: React.StatelessComponent<PQuoteFilterCheckbox> = ({
  item,
  onChange
}) => {
  const { quote, selected } = item
  const labelClass = selected ? "is-selected" : ""
  return (
    <div className="quote-filter-checkbox">
      <label data-quote-icon={quote} className={labelClass}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onChange(item)}
        />
        <span>{quote}</span>
      </label>
    </div>
  )
}

export default MarketQuoteFilter
