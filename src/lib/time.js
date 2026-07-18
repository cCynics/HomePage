export const pad2 = (n) => String(n).padStart(2, '0')

export function clockParts(date) {
  return { hh: pad2(date.getHours()), mm: pad2(date.getMinutes()), ss: pad2(date.getSeconds()) }
}

export function greeting(date) {
  const h = date.getHours()
  if (h < 12) return 'good morning'
  if (h < 18) return 'good afternoon'
  return 'good evening'
}

export function msUntilMidnight(date) {
  const next = new Date(date)
  next.setHours(24, 0, 0, 0)
  return next.getTime() - date.getTime()
}

export function formatDuration(ms) {
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${h}h ${m}m`
}

export function timeInZone(date, tz) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(date)
}
