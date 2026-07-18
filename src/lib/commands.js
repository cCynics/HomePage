export function resolveCommand(input, config) {
  const text = input.trim()
  if (!text) return null

  const alias = config.links.find((l) => l.alias === text)
  if (alias) return { url: alias.url }

  const [first, ...rest] = text.split(/\s+/)
  const tmpl = config.bangs[first]
  if (tmpl && rest.length) {
    return { url: tmpl.replace('%s', encodeURIComponent(rest.join(' '))) }
  }

  return { url: config.defaultSearch.replace('%s', encodeURIComponent(text)) }
}
