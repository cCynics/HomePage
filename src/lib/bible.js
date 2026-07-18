export function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1)
  return Math.floor((date - start) / 86400000)
}

export function pickRef(refs, date) {
  return refs[dayOfYear(date) % refs.length]
}

export async function fetchVerse(ref, translation) {
  const res = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=${translation}`)
  if (!res.ok) throw new Error(`verse ${res.status}`)
  const d = await res.json()
  return { text: d.text.trim().replace(/\s+/g, ' '), reference: d.reference }
}
