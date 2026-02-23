import type { PriceAdapter, PriceResult } from '../types'
import { fetchWithRetry } from '../fetch-with-retry'

interface BithumbTicker {
  trade_price: number
}

export const bithumbAdapter: PriceAdapter = {
  id: 'bithumb',
  name: 'Bithumb',
  supportedFiatCurrencies: ['KRW'],
  supportedStableTokens: [],
  endpoints: ['https://api.bithumb.com'],

  buildMarketSymbol(base: string, quote: string): string {
    return `${quote}-${base}` // KRW-BTC
  },

  async fetchPrice(market: string, signal?: AbortSignal): Promise<PriceResult> {
    const url = `${this.endpoints[0]}/v1/ticker?markets=${market}`
    const data = await fetchWithRetry(url, signal) as BithumbTicker[]
    return { price: data[0].trade_price, source: this.id }
  },
}
