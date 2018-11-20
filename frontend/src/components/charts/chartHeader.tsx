import * as React from "react"
import Linked from "./linked.png"
import Unlinked from "./unlinked.png"
import CloseChart from "./chart-close.png"

interface PChartHeader {
  title: string
  time: string
  linked: boolean
  close: () => void
  toggleLink: () => void
}

const ChartHeader: React.StatelessComponent<PChartHeader> = ({
  title,
  time,
  linked,
  close,
  toggleLink
}) => {
  const classNames = ["chart-header"]
  if (linked) classNames.push("is-linked")
  const linkIcon = linked ? Linked : Unlinked
  return (
    <header className={classNames.join(" ")}>
      <h2>
        <span>{title}</span>
        <time>({time})</time>
      </h2>
      <div className="ch__controls">
        <button className="ch__link" onClick={handleToggleLink}>
          <img src={linkIcon} alt="Toggle link" />
        </button>
        <button onClick={handleClose}>
          <img src={CloseChart} alt="Close chart" />
        </button>
      </div>
    </header>
  )

  function handleClose(e: React.SyntheticEvent) {
    e.preventDefault()
    close()
  }

  function handleToggleLink(e: React.SyntheticEvent) {
    e.preventDefault()
    toggleLink()
  }
}

export default ChartHeader
