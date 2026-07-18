const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december']

export function isoDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function monthGrid(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDow = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  return { monthLabel: MONTHS[month], days, todayDate: date.getDate() }
}
