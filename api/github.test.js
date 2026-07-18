import { describe, it, expect } from 'vitest'
import { flattenContributions } from './github.js'

const GQL = {
  data: { user: { contributionsCollection: { contributionCalendar: {
    totalContributions: 128,
    weeks: [
      { contributionDays: [{ contributionCount: 0, contributionLevel: 'NONE' }, { contributionCount: 3, contributionLevel: 'SECOND_QUARTILE' }] },
      { contributionDays: [{ contributionCount: 9, contributionLevel: 'FOURTH_QUARTILE' }] },
    ],
  } } } },
}

describe('flattenContributions', () => {
  it('flattens weeks into a day list with numeric levels', () => {
    const out = flattenContributions(GQL)
    expect(out.total).toBe(128)
    expect(out.days).toHaveLength(3)
    expect(out.days[0]).toEqual({ count: 0, level: 0 })
    expect(out.days[1]).toEqual({ count: 3, level: 2 })
    expect(out.days[2]).toEqual({ count: 9, level: 4 })
  })
})
