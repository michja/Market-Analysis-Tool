import * as React from "react"
import Linked from "../charts/linked.png"
import Unlinked from "../charts/unlinked.png"

interface PHelpScreen {
  close: () => void
}

const HelpScreen: React.StatelessComponent<PHelpScreen> = ({ close }) => {
  return (
    <div className="help-screen">
      <h1>Chart Sync</h1>
      <h3>Select markets from the sidebar</h3>
      <h3>Scroll to zoom</h3>
      <h3>Drag to change time period</h3>
      <p className="hs__diagram">
        <img src={Unlinked} alt="unlinked" />
        <span>→</span>
        <img src={Linked} alt="linked" />
      </p>
      <h3>Link charts together to scroll and drag in unison</h3>
      <button onClick={handleClose}>Close Help</button>
    </div>
  )

  function handleClose(e: React.SyntheticEvent) {
    e.preventDefault()
    close()
  }
}

export default HelpScreen
