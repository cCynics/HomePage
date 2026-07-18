import { useState, useEffect, useRef, useCallback } from 'react'

export function usePolling(fetcher, intervalMs) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetcherRef = useRef(fetcher)
  const mountedRef = useRef(true)

  useEffect(() => { fetcherRef.current = fetcher })

  const run = useCallback(async () => {
    try {
      const result = await fetcherRef.current()
      if (mountedRef.current) { setData(result); setError(null) }
    } catch (err) {
      if (mountedRef.current) setError(err)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    run()
    const id = setInterval(run, intervalMs)
    return () => { mountedRef.current = false; clearInterval(id) }
  }, [run, intervalMs])

  return { data, loading, error, refresh: run }
}
