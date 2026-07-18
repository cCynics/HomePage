import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchWeather, weatherEmoji } from './openMeteo.js'

afterEach(() => vi.restoreAllMocks())

describe('openMeteo', () => {
  it('maps the API response to a flat shape', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        current: { temperature_2m: 14, relative_humidity_2m: 62, weather_code: 0, wind_speed_10m: 8 },
        daily: { temperature_2m_max: [19], temperature_2m_min: [11] },
      }),
    })
    const w = await fetchWeather({ lat: 47.6, lon: -122.3 })
    expect(w).toMatchObject({ tempF: 14, hiF: 19, loF: 11, humidity: 62, windMph: 8, code: 0 })
    expect(w.desc).toBeTruthy()
  })
  it('throws on a non-ok response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 500 })
    await expect(fetchWeather({ lat: 1, lon: 2 })).rejects.toThrow()
  })
  it('maps codes to emoji', () => {
    expect(typeof weatherEmoji(0)).toBe('string')
  })
})
