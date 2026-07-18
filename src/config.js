const config = {
  bannerText: 'ghost-shell',
  name: 'nick',
  hour12: true, // 12-hour clock (am/pm); set false for 24-hour
  location: { lat: 47.6062, lon: -122.3321, label: 'Seattle, WA' },

  links: [
    { label: 'github',  url: 'https://github.com',      alias: 'gh' },
    { label: 'youtube', url: 'https://youtube.com',      alias: 'yt' },
    { label: 'reddit',  url: 'https://reddit.com',       alias: 'r'  },
    { label: 'claude',  url: 'https://claude.ai',        alias: 'ai' },
    { label: 'mail',    url: 'https://mail.google.com',  alias: 'm'  },
  ],

  // "yt lofi" → youtube search. %s is url-encoded query.
  bangs: {
    g:  'https://www.google.com/search?q=%s',
    yt: 'https://www.youtube.com/results?search_query=%s',
    gh: 'https://github.com/search?q=%s',
    r:  'https://www.reddit.com/search/?q=%s',
  },
  defaultSearch: 'https://www.google.com/search?q=%s',

  worldClocks: [
    { label: 'SF',      tz: 'America/Los_Angeles', flag: '🇺🇸' },
    { label: 'NYC',     tz: 'America/New_York',    flag: '🇺🇸' },
    { label: 'Tallinn', tz: 'Europe/Tallinn',      flag: '🇪🇪' },
    { label: 'Sydney',  tz: 'Australia/Sydney',    flag: '🇦🇺' },
    { label: 'Tokyo',   tz: 'Asia/Tokyo',          flag: '🇯🇵' },
  ],

  cryptoCoins: ['bitcoin', 'ethereum', 'solana', 'dogecoin'],

  rssSources: [
    { label: 'the verge', url: 'https://www.theverge.com/rss/index.xml' },
    { label: 'bbc',       url: 'https://feeds.bbci.co.uk/news/rss.xml' },
    { label: 'ars',       url: 'https://feeds.arstechnica.com/arstechnica/index' },
  ],

  githubUsername: 'cCynics',

  // verse-of-the-day rotates through these by day-of-year
  bibleRefs: ['Proverbs 3:5-6', 'Psalm 23:1-4', 'Philippians 4:6-7', 'Isaiah 40:31', 'John 3:16'],
  bibleTranslation: 'kjv',

  // manual calendar agenda: { 'YYYY-MM-DD': ['14:00 standup', ...] }
  agenda: {},
}

export default config
