import type { PriceAdapter } from './types'
import {
  upbitAdapter,
  bithumbAdapter,
  binanceAdapter,
  okxAdapter,
  bitbankAdapter,
  krakenAdapter,
  coinbaseAdapter,
} from './adapters'

const ALL_ADAPTERS: PriceAdapter[] = [
  upbitAdapter,
  bithumbAdapter,
  binanceAdapter,
  okxAdapter,
  bitbankAdapter,
  krakenAdapter,
  coinbaseAdapter,
]

const adapterMap = new Map<string, PriceAdapter>(
  ALL_ADAPTERS.map(a => [a.id, a]),
)

export function getAdapterById(id: string): PriceAdapter | undefined {
  return adapterMap.get(id)
}

export function getAdaptersForFiat(currency: string): PriceAdapter[] {
  return ALL_ADAPTERS.filter(a =>
    a.supportedFiatCurrencies.includes(currency),
  )
}

export function getAdaptersForStable(token: string): PriceAdapter[] {
  return ALL_ADAPTERS.filter(a =>
    a.supportedStableTokens.includes(token),
  )
}

export function getAllAdapters(): PriceAdapter[] {
  return ALL_ADAPTERS
}
