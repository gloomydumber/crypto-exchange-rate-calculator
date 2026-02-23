import type { PriceAdapter, PriceResult } from '../types'
import { fetchWithRetry } from '../fetch-with-retry'

interface KrakenResponse {
  result: Record<string, { c: [string, string] }>
}

export const krakenAdapter: PriceAdapter = {
  id: 'kraken',
  name: 'Kraken',
  supportedFiatCurrencies: ['EUR', 'USD'],
  supportedStableTokens: [],
  endpoints: ['https://api.kraken.com'],

  buildMarketSymbol(base: string, quote: string): string {
    // Kraken uses XBT for BTC
    const krakenBase = base === 'BTC' ? 'XBT' : base
    return `${krakenBase}${quote}` // XBTEUR, XBTUSD
  },

  async fetchPrice(market: string, signal?: AbortSignal): Promise<PriceResult> {
    const url = `${this.endpoints[0]}/0/public/Ticker?pair=${market}`
    const data = await fetchWithRetry(url, signal) as KrakenResponse
    const key = Object.keys(data.result)[0]
    return { price: Number(data.result[key].c[0]), source: this.id }
  },
}
