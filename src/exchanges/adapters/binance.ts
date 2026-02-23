import type { PriceAdapter, PriceResult } from '../types'
import { fetchWithRetry } from '../fetch-with-retry'

interface BinanceTicker {
  price: string
}

export const binanceAdapter: PriceAdapter = {
  id: 'binance',
  name: 'Binance',
  supportedFiatCurrencies: [],
  supportedStableTokens: ['USDT', 'USDC', 'BUSD', 'FDUSD'],
  endpoints: [
    'https://api.binance.com',
    'https://api1.binance.com',
    'https://api2.binance.com',
    'https://api3.binance.com',
    'https://api4.binance.com',
    'https://data-api.binance.vision',
  ],

  buildMarketSymbol(base: string, quote: string): string {
    return `${base}${quote}` // BTCUSDT
  },

  async fetchPrice(market: string, signal?: AbortSignal): Promise<PriceResult> {
    let lastError: Error | null = null
    for (const endpoint of this.endpoints) {
      try {
        const url = `${endpoint}/api/v3/ticker/price?symbol=${market}`
        const data = await fetchWithRetry(url, signal, 1, 3000) as BinanceTicker
        return { price: Number(data.price), source: this.id }
      } catch (err) {
        lastError = err as Error
        if (signal?.aborted) throw lastError
      }
    }
    throw lastError!
  },
}
