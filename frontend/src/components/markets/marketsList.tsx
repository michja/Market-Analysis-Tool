import * as React from "react"
import { Market, QuoteFilterItem } from "../../types/markets"
import SearchBox from "../generic/searchBox"
import MarketListHeader from "./marketListHeader"
import MarketListItem from "./marketListItem"
import MarketQuoteFilter from "./marketsQuoteFilter"
import socketService from "../../services/socketService"

interface PMarketsList {
  markets: Market[]
}

interface SMarketsList {
  textFilter: string
  quoteFilter: QuoteFilterItem[]
  prevMarkets: Market[]
}

class MarketsList extends React.Component<PMarketsList, SMarketsList> {
  constructor(props: PMarketsList) {
    super(props)
    this.state = { textFilter: "", quoteFilter: [], prevMarkets: [] }
  }

  render() {
    const { markets } = this.props
    const { textFilter, quoteFilter } = this.state

    // filter the markets by search string then quote selection
    const filteredMarkets = markets
      .filter(this.applyTextFilter(textFilter))
      .filter(this.applyQuoteFilter(quoteFilter))

    return (
      <div className="markets-list">
        <MarketListHeader />
        <SearchBox value={textFilter} onChange={this.updateTextFilter} />
        <div className="markets">
          {filteredMarkets.map(m => (
            <MarketListItem
              key={`${m.base}-${m.quote}`}
              onClick={socketService.getLatestTicks}
              market={m}
            />
          ))}
        </div>
        <MarketQuoteFilter
          quotes={quoteFilter}
          onChange={this.toggleQuoteFilter}
        />
      </div>
    )
  }

  static getDerivedStateFromProps = (
    props: PMarketsList,
    state: SMarketsList
  ) => {
    // make sure a quote filter is on first time it appears
    const { markets } = props
    // if markets didnt change then return early
    if (markets === state.prevMarkets) {
      return null
    }

    // get distinct quotes
    const quotes = new Set<String>(markets.map(m => m.quote))
    // are any new?
    const newQuotes = Array.from(quotes).filter(
      quote => state.quoteFilter.findIndex(q => q.quote === quote) === -1
    )
    // make quote filter item object
    const newQuotesSelected = newQuotes.map(quote => ({
      quote,
      selected: true
    }))
    // merge with existing
    const quoteFilter = [...state.quoteFilter, ...newQuotesSelected]

    return {
      ...state,
      prevMarkets: markets,
      quoteFilter
    }
  }

  /**
   * update the text filter in state
   * @param  textFilter: string  [new value]
   * @return {void}
   */
  updateTextFilter = (textFilter: string) => {
    this.setState({ textFilter })
  }

  /**
   * Add or remove a filter depending on the selected prop
   * @param  changedItem: QuoteFilterItem [the new value]
   * @return : void
   */
  toggleQuoteFilter = (item: QuoteFilterItem) => {
    const { quoteFilter } = this.state
    const { quote, selected } = item

    // find the item and invert the selected prop
    const nextQuoteFilter = quoteFilter.map(i => {
      if (i.quote === quote) i.selected = !selected
      return i
    })
    this.setState({ quoteFilter: nextQuoteFilter })
  }

  /**
   * currys a filter function that match chars in uppercase
   * if no text is passed don't filter
   * @param  text: string            [the filter string]
   * @return (m: Market) => boolean  [the filter function]
   */
  applyTextFilter = (text: string) => {
    text = text.toUpperCase()
    return text.length === 0
      ? (m: Market): boolean => true
      : (m: Market): boolean => m.base.toUpperCase().includes(text)
  }

  /**
   * currys a filter function that checks for a quote in an array
   * @param  quotes: string[]         [the filter array]
   * @return (m: Market) => boolean  [the filter function]
   */
  applyQuoteFilter = (QuoteFilter: QuoteFilterItem[]) => {
    // build a string array of selected quotes
    const quotes = QuoteFilter.reduce<string[]>((arr, b) => {
      if (b.selected) arr.push(b.quote)
      return arr
    }, [])
    return (m: Market): boolean => quotes.indexOf(m.quote) > -1
  }
}

export default MarketsList
