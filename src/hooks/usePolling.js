import { useState, useEffect, useRef, useCallback } from 'react'

export function usePolling(fetcher, intervalMs) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const run = useCallback(async () => {
    try {
      const result = await fetcherRef.current()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let alive = true
    const tick = async () => { if (alive) await run() }
    tick()
    const id = setInterval(tick, intervalMs)
    return () => { alive = false; clearInterval(id) }
  }, [run, intervalMs])

  return { data, loading, error, refresh: run }
}
