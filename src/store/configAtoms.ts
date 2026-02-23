import { atomWithStorage } from 'jotai/utils'
import { DEFAULT_CONFIG } from '../types/config'
import type { CalcConfig, CurrencyPair, BridgeCrypto, StableToken } from '../types/config'

export const configAtom = atomWithStorage<CalcConfig>(
  'cerc-config',
  DEFAULT_CONFIG,
)

// Convenience derived writers
export const pairAtom = atomWithStorage<CurrencyPair>(
  'cerc-pair',
  DEFAULT_CONFIG.pair,
)

export const exchangeAIdAtom = atomWithStorage<string>(
  'cerc-exchange-a',
  DEFAULT_CONFIG.exchangeAId,
)

export const exchangeBIdAtom = atomWithStorage<string>(
  'cerc-exchange-b',
  DEFAULT_CONFIG.exchangeBId,
)

export const bridgeCryptoAtom = atomWithStorage<BridgeCrypto>(
  'cerc-bridge-crypto',
  DEFAULT_CONFIG.bridgeCrypto,
)

export const stableTokenAtom = atomWithStorage<StableToken>(
  'cerc-stable-token',
  DEFAULT_CONFIG.stableToken,
)

export const enabledRouteIdsAtom = atomWithStorage<string[]>(
  'cerc-enabled-routes',
  [],
)
