import React from 'react'
import { Pane } from '../Pane.jsx'
import { usePolling } from '../../hooks/usePolling.js'
import { fetchWeather, weatherEmoji } from '../../lib/openMeteo.js'
import config from '../../config.js'

const FIFTEEN_MIN = 15 * 60 * 1000

export function WeatherPane() {
  const { data, loading, error } = usePolling(() => fetchWeather(config.location), FIFTEEN_MIN)
  return (
    <Pane title="weather" badge="◍" live loading={loading && !data} error={error}>
      {data && (
        <>
          <div className="text-2xl text-gs-text" style={{ textShadow: '0 0 12px rgba(153,102,255,.4)' }}>
            {weatherEmoji(data.code)} {data.tempF}°
          </div>
          <div className="mt-1 text-[10px] leading-relaxed text-gs-dim">
            {data.desc} · h{data.hiF} · l{data.loF}<br />
            humidity {data.humidity}% · wind {data.windMph}
          </div>
        </>
      )}
    </Pane>
  )
}
