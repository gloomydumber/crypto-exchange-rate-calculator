import type { PriceAdapter, PriceResult } from '../types'
import { fetchWithRetry } from '../fetch-with-retry'

interface BitbankTicker {
  success: number
  data: {
    last: string
  }
}

export const bitbankAdapter: PriceAdapter = {
  id: 'bitbank',
  name: 'bitbank',
  supportedFiatCurrencies: ['JPY'],
  supportedStableTokens: [],
  endpoints: ['https://public.bitbank.cc'],

  buildMarketSymbol(base: string, quote: string): string {
    // bitbank uses lowercase pair format: btc_jpy
    return `${base.toLowerCase()}_${quote.toLowerCase()}`
  },

  async fetchPrice(market: string, signal?: AbortSignal): Promise<PriceResult> {
    const url = `${this.endpoints[0]}/${market}/ticker`
    const data = await fetchWithRetry(url, signal) as BitbankTicker
    if (!data.data?.last) {
      throw new Error(`bitbank: no data for ${market}`)
    }
    return { price: Number(data.data.last), source: this.id }
  },
}
