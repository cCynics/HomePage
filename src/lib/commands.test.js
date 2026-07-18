import { describe, it, expect } from 'vitest'
import { resolveCommand } from './commands.js'
import config from '../config.js'

describe('resolveCommand', () => {
  it('returns null for empty input', () => {
    expect(resolveCommand('   ', config)).toBeNull()
  })
  it('navigates on an exact alias', () => {
    expect(resolveCommand('gh', config)).toEqual({ url: 'https://github.com' })
  })
  it('searches with a bang prefix', () => {
    expect(resolveCommand('yt lofi beats', config))
      .toEqual({ url: 'https://www.youtube.com/results?search_query=lofi%20beats' })
  })
  it('falls back to the default search', () => {
    expect(resolveCommand('rust async', config))
      .toEqual({ url: 'https://www.google.com/search?q=rust%20async' })
  })
  it('searches (not navigates) when an alias token is followed by a query — the gh overlap case', () => {
    expect(resolveCommand('gh octocat', config))
      .toEqual({ url: 'https://github.com/search?q=octocat' })
  })
  it('falls back to default search for a bare bang token with no query', () => {
    expect(resolveCommand('g', config))
      .toEqual({ url: 'https://www.google.com/search?q=g' })
  })
})
