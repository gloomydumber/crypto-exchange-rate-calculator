// Library styles
import './lib-styles.css'

// Main component
export { ExchangeCalc } from './components/ExchangeCalc'
export type { ExchangeCalcProps } from './components/ExchangeCalc'

// Types (for host app integration)
export type { CalcConfig, CurrencyPair, FiatCurrency, StableToken, BridgeCrypto } from './types/config'
export type { CalcValues, CalcInput, ActiveField } from './types/calc'
export type { PriceAdapter, PriceResult } from './exchanges/types'
export type { Route, RouteState, RouteStatus } from './routes/types'

// Exchange adapters (for custom usage)
export { upbitAdapter } from './exchanges/adapters/upbit'
export { bithumbAdapter } from './exchanges/adapters/bithumb'
export { binanceAdapter } from './exchanges/adapters/binance'
export { okxAdapter } from './exchanges/adapters/okx'
export { bitbankAdapter } from './exchanges/adapters/bitbank'
export { krakenAdapter } from './exchanges/adapters/kraken'
export { coinbaseAdapter } from './exchanges/adapters/coinbase'

// Registry helpers
export { getAdapterById, getAdaptersForFiat, getAdaptersForStable, getAllAdapters } from './exchanges/registry'

// Constants & helpers
export { CURRENCY_PAIRS, FIAT_SYMBOLS, STABLE_SYMBOLS, BRIDGE_SYMBOLS, isFiatToFiat } from './types/config'
