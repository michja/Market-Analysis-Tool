import * as React from "react"
import Icon from "./search.png"

interface PSearchBox {
  value: string
  onChange: (value: string) => void
}

const SearchBox: React.StatelessComponent<PSearchBox> = ({
  value,
  onChange
}) => {
  return (
    <div className="search-box">
      <input
        type="text"
        placeholder="search"
        value={value}
        onChange={handleChange}
      />
      <button onClick={handleClear}>x</button>
      <img src={Icon} alt="Search" />
    </div>
  )

  function handleChange(e: React.SyntheticEvent) {
    onChange((e.target as HTMLInputElement).value)
  }

  function handleClear(e: React.SyntheticEvent) {
    e.preventDefault()
    onChange("")
  }
}

export default SearchBox
