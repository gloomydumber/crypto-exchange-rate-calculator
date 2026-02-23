export type FiatCurrency = 'KRW' | 'JPY' | 'EUR' | 'USD'

export type StableToken = 'USDT' | 'USDC' | 'BUSD' | 'DAI' | 'FDUSD'

export type BridgeCrypto = 'BTC' | 'ETH'

export interface CurrencyPair {
  fiat: FiatCurrency
  stable: FiatCurrency | 'USD'
  label: string // e.g. 'KRW-USD'
}

export const CURRENCY_PAIRS: CurrencyPair[] = [
  { fiat: 'KRW', stable: 'USD', label: 'KRW-USD' },
  { fiat: 'JPY', stable: 'USD', label: 'JPY-USD' },
  { fiat: 'EUR', stable: 'USD', label: 'EUR-USD' },
  { fiat: 'KRW', stable: 'JPY', label: 'KRW-JPY' },
]

export const FIAT_SYMBOLS: Record<FiatCurrency, string> = {
  KRW: '₩',
  JPY: '¥',
  EUR: '€',
  USD: '$',
}

export const STABLE_SYMBOLS: Record<StableToken, string> = {
  USDT: '₮',
  USDC: '$',
  BUSD: '$',
  DAI: '◈',
  FDUSD: '$',
}

export const BRIDGE_SYMBOLS: Record<BridgeCrypto, string> = {
  BTC: '₿',
  ETH: 'Ξ',
}

/** True when both sides are fiat currencies (e.g. KRW-JPY), not fiat-to-stable (KRW-USD) */
export function isFiatToFiat(pair: CurrencyPair): boolean {
  return pair.stable !== 'USD'
}

export interface CalcConfig {
  pair: CurrencyPair
  exchangeAId: string
  exchangeBId: string
  bridgeCrypto: BridgeCrypto
  stableToken: StableToken
  enabledRouteIds: string[]
}

export const DEFAULT_CONFIG: CalcConfig = {
  pair: CURRENCY_PAIRS[0],
  exchangeAId: 'upbit',
  exchangeBId: 'binance',
  bridgeCrypto: 'BTC',
  stableToken: 'USDT',
  enabledRouteIds: [],
}
