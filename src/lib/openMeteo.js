const DESC = {
  0: 'clear', 1: 'mostly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'fog', 48: 'rime fog', 51: 'light drizzle', 61: 'rain', 63: 'rain',
  71: 'snow', 80: 'showers', 95: 'thunderstorm',
}
const EMOJI = { 0: '☀', 1: '🌤', 2: '⛅', 3: '☁', 45: '🌫', 61: '🌧', 71: '❄', 80: '🌦', 95: '⛈' }

export const weatherEmoji = (code) => EMOJI[code] ?? '☁'

export async function fetchWeather({ lat, lon }) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
    + `&daily=temperature_2m_max,temperature_2m_min`
    + `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=1`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`weather ${res.status}`)
  const d = await res.json()
  const code = d.current.weather_code
  return {
    tempF: Math.round(d.current.temperature_2m),
    hiF: Math.round(d.daily.temperature_2m_max[0]),
    loF: Math.round(d.daily.temperature_2m_min[0]),
    humidity: d.current.relative_humidity_2m,
    windMph: Math.round(d.current.wind_speed_10m),
    code,
    desc: DESC[code] ?? 'clear',
  }
}
