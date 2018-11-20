exports.timeToPrevInterval = (time, interval = 1800000) => {
  return time - time % interval
}

exports.currentInterval = (interval = 1800000) => {
  return exports.timeToPrevInterval(new Date().getTime(), interval)
}

/**
 * use limit and interval to calculate the startTimestamp from
 * an endTimestamp
 * @param  {Number} endTimestamp [end time]
 * @param  {Number} interval     [how many milliseconds per tick?]
 * @param  {Number} limit        [how many ticks?]
 * @return {Number}              [start time]
 */
exports.calculateStartTime = (
  endTimestamp,
  interval = 1800000,
  limit = 500
) => {
  return endTimestamp - limit * interval
}

exports.subtractTimeInterval = (from, seconds, limit = 500) => {
  return from - seconds * 1000 * limit
}

exports.subtract30mInterval = (from, limit = 500) => {
  return exports.subtractTimeInterval(from, 60 * 30, limit)
}
