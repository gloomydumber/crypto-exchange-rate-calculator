import type { PriceAdapter, PriceResult } from '../types'
import { fetchWithRetry } from '../fetch-with-retry'

interface OkxResponse {
  data: Array<{ last: string }>
}

export const okxAdapter: PriceAdapter = {
  id: 'okx',
  name: 'OKX',
  supportedFiatCurrencies: [],
  supportedStableTokens: ['USDT', 'USDC'],
  endpoints: ['https://www.okx.com'],

  buildMarketSymbol(base: string, quote: string): string {
    return `${base}-${quote}` // BTC-USDT
  },

  async fetchPrice(market: string, signal?: AbortSignal): Promise<PriceResult> {
    const url = `${this.endpoints[0]}/api/v5/market/ticker?instId=${market}`
    const data = await fetchWithRetry(url, signal) as OkxResponse
    if (!data.data?.[0]?.last) {
      throw new Error(`OKX: no data for ${market}`)
    }
    return { price: Number(data.data[0].last), source: this.id }
  },
}
