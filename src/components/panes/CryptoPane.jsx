import { Pane } from '../Pane.jsx'
import { usePolling } from '../../hooks/usePolling.js'
import { fetchCrypto, fmtPrice } from '../../lib/coingecko.js'
import config from '../../config.js'

export function CryptoPane() {
  const { data, loading, error } = usePolling(() => fetchCrypto(config.cryptoCoins), 60 * 1000)
  return (
    <Pane title="crypto" badge="$" live loading={loading && !data} error={error && !data}>
      {data && data.map((c) => {
        const up = c.change24h >= 0
        return (
          <div key={c.id} className="flex justify-between py-0.5 text-gs-text">
            <span>{c.label}</span>
            <span className={up ? 'text-gs-up' : 'text-gs-down'}>
              {fmtPrice(c.price)} {up ? '▲' : '▼'}{Math.abs(c.change24h).toFixed(1)}%
            </span>
          </div>
        )
      })}
    </Pane>
  )
}
