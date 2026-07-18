const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 }

export function flattenContributions(gql) {
  const cal = gql.data.user.contributionsCollection.contributionCalendar
  const days = cal.weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({ count: d.contributionCount, level: LEVEL[d.contributionLevel] ?? 0 })),
  )
  return { total: cal.totalContributions, days }
}

const QUERY = `query($user:String!){ user(login:$user){ contributionsCollection{ contributionCalendar{
  totalContributions weeks{ contributionDays{ contributionCount contributionLevel } } } } } }`

export default async function handler(req, res) {
  const user = req.query?.user
  if (!user) { res.status(400).json({ error: 'missing user' }); return }
  const token = process.env.GITHUB_TOKEN
  if (!token) { res.status(500).json({ error: 'server missing GITHUB_TOKEN' }); return }
  try {
    const gh = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { authorization: `bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { user } }),
    })
    if (!gh.ok) throw new Error(`github ${gh.status}`)
    const json = await gh.json()
    if (json.errors) throw new Error(json.errors[0]?.message ?? 'graphql error')
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate')
    res.status(200).json(flattenContributions(json))
  } catch {
    // Generic message — never echo upstream/GraphQL error text (info disclosure).
    res.status(502).json({ error: 'failed to fetch contributions' })
  }
}
