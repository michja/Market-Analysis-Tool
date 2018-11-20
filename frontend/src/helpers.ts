export const removeFromArray = <T>(arr: T[], value: T): T[] => {
  const idx = arr.indexOf(value)
  if (idx === -1) return arr
  return [...arr.slice(0, idx), ...arr.slice(idx + 1)]
}

export const timestampToDateString = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
}

export const hasSeenHelp = (): boolean => {
  return localStorage.getItem("seenHelp") === "1"
}

export const setSeenHelp = () => {
  localStorage.setItem("seenHelp", "1")
}

export const subtractTimeInterval = (from: number, seconds: number, limit: number = 500): number => {
  return from - (seconds * 1000 * limit)
}

export const subtract30mInterval = (from: number, limit: number = 500): number => {
  return subtractTimeInterval(from, 60 * 30, limit)
}
