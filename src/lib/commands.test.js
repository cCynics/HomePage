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
})
