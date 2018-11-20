import * as React from "react"

interface PShowHelp {
  open: () => void
}

const ShowHelp: React.StatelessComponent<PShowHelp> = ({ open }) => {
  return (
    <button className="show-help" onClick={handleOpen}>
      Help
    </button>
  )

  function handleOpen(e: React.SyntheticEvent) {
    e.preventDefault()
    open()
  }
}

export default ShowHelp
