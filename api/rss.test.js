import { describe, it, expect } from 'vitest'
import { parseRss } from './rss.js'

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
})
