export async function fetchGithub(user) {
  const res = await fetch(`/api/github?user=${encodeURIComponent(user)}`)
  if (!res.ok) throw new Error(`github ${res.status}`)
  return res.json()
}

const LEVEL_BG = ['bg-gs-violet/10', 'bg-gs-violet/30', 'bg-gs-violet/50', 'bg-gs-violet/70', 'bg-gs-violet']
export const levelClass = (level) => LEVEL_BG[level] ?? LEVEL_BG[0]
