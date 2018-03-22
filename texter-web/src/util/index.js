export const truncate = (str, maxLen = 40) => {
  if (str.length <= maxLen) {
    return str
  }

  return `${str.substring(0, maxLen - 3)}...`
}

export const formatDuration = duration => {
  const date = new Date(null)
  date.setSeconds(duration)
  return (
    date
      .toISOString()
      .substr(11, 8)
      .replace(/^[0:]+/, '') || '0:01'
  )
}

export const collateBy = f => g => xs =>
  xs.reduce((m, x) => {
    let v = f(x)
    return m.set(v, g(m.get(v), x))
  }, new Map())
