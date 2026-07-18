// Returns url only if it's an http(s) URL; otherwise returns fallback.
// Guards against javascript:, data:, and other dangerous/relative schemes in
// hrefs built from untrusted sources (API feeds, RSS).
export function safeHttpUrl(url, fallback) {
  try {
    const u = new URL(url)
    return (u.protocol === 'http:' || u.protocol === 'https:') ? url : fallback
  } catch {
    return fallback
  }
}
