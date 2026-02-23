import type { PriceAdapter, PriceResult } from '../types'
import { fetchWithRetry } from '../fetch-with-retry'

interface CoinbaseResponse {
  data: { amount: string }
}

export const coinbaseAdapter: PriceAdapter = {
  id: 'coinbase',
  name: 'Coinbase',
  supportedFiatCurrencies: ['USD'],
  supportedStableTokens: [],
  endpoints: ['https://api.coinbase.com'],

  buildMarketSymbol(base: string, quote: string): string {
    return `${base}-${quote}` // BTC-USD
  },

  async fetchPrice(market: string, signal?: AbortSignal): Promise<PriceResult> {
    const url = `${this.endpoints[0]}/v2/prices/${market}/spot`
    const data = await fetchWithRetry(url, signal) as CoinbaseResponse
    return { price: Number(data.data.amount), source: this.id }
  },
}
