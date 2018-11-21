export const hasSeenHelp = (): boolean => {
  return localStorage.getItem("seenHelp") === "1"
}

export const setSeenHelp = () => {
  localStorage.setItem("seenHelp", "1")
}
