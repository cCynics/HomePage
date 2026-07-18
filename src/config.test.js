import { describe, it, expect } from 'vitest'
import config from './config.js'

describe('config', () => {
  it('hardcodes Seattle for weather', () => {
    expect(config.location).toEqual({ lat: 47.6062, lon: -122.3321, label: 'Seattle, WA' })
  })
  it('gives every link an alias', () => {
    for (const l of config.links) expect(l.alias).toBeTruthy()
  })
  it('has a %s slot in every search template', () => {
    expect(config.defaultSearch).toContain('%s')
    for (const t of Object.values(config.bangs)) expect(t).toContain('%s')
  })
  it('includes Tallinn and Sydney world clocks', () => {
    const tzs = config.worldClocks.map(c => c.tz)
    expect(tzs).toContain('Europe/Tallinn')
    expect(tzs).toContain('Australia/Sydney')
  })
})
