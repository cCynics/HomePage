import { describe, it, expect } from 'vitest'
import handler, { parseRss } from './rss.js'

const XML = `<?xml version="1.0"?><rss><channel>
  <item><title>First</title><link>http://a/1</link></item>
  <item><title>Second</title><link>http://a/2</link></item>
</channel></rss>`

describe('parseRss', () => {
  it('extracts items from RSS', () => {
    expect(parseRss(XML)).toEqual([
      { title: 'First', link: 'http://a/1' },
      { title: 'Second', link: 'http://a/2' },
    ])
  })
  it('handles Atom <entry> feeds', () => {
    const atom = `<feed><entry><title>A</title><link href="http://x/a"/></entry></feed>`
    expect(parseRss(atom)).toEqual([{ title: 'A', link: 'http://x/a' }])
  })
  it('extracts the first href from an Atom entry with multiple <link>s', () => {
    const atom = `<feed><entry><title>A</title>` +
      `<link rel="alternate" href="http://x/a"/>` +
      `<link rel="self" href="http://x/self"/></entry></feed>`
    expect(parseRss(atom)).toEqual([{ title: 'A', link: 'http://x/a' }])
  })
})

describe('rss handler (SSRF guard)', () => {
  const mockRes = () => {
    const res = { statusCode: 0, body: null, headers: {} }
    res.status = (c) => { res.statusCode = c; return res }
    res.json = (b) => { res.body = b; return res }
    res.setHeader = (k, v) => { res.headers[k] = v }
    return res
  }
  it('rejects a missing url with 400', async () => {
    const res = mockRes()
    await handler({ query: {} }, res)
    expect(res.statusCode).toBe(400)
  })
  it('rejects a non-allowlisted url with 400 (blocks SSRF)', async () => {
    const res = mockRes()
    await handler({ query: { url: 'http://169.254.169.254/latest/meta-data/' } }, res)
    expect(res.statusCode).toBe(400)
    expect(res.body.error).toMatch(/not allowed/)
  })
})
