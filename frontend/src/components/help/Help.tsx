import * as React from "react"
import HelpScreen from "./helpScreen"
import ShowHelp from "./showHelp"

interface PHelp {
  visible: boolean
  toggle: () => void
}

const Help: React.StatelessComponent<PHelp> = ({ visible, toggle }) => {
  return visible ? <HelpScreen close={toggle} /> : <ShowHelp open={toggle} />
}

export default Help
