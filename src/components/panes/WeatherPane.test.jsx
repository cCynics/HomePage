import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { WeatherPane } from './WeatherPane.jsx'

afterEach(() => vi.restoreAllMocks())

describe('WeatherPane', () => {
  it('renders the temperature after fetch', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        current: { temperature_2m: 14, relative_humidity_2m: 62, weather_code: 0, wind_speed_10m: 8 },
        daily: { temperature_2m_max: [19], temperature_2m_min: [11] },
      }),
    })
    render(<WeatherPane />)
    await waitFor(() => expect(screen.getByText(/14°/)).toBeInTheDocument())
    expect(screen.getByText(/h19 · l11/)).toBeInTheDocument()
  })
})
