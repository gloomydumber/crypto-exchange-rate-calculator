export interface PriceResult {
  price: number
  source: string // adapter id
}

export interface PriceAdapter {
  id: string
  name: string
  supportedFiatCurrencies: string[]
  supportedStableTokens: string[]
  endpoints: string[]

  fetchPrice(market: string, signal?: AbortSignal): Promise<PriceResult>
  buildMarketSymbol(base: string, quote: string): string
}
