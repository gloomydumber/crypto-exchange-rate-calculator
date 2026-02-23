import type { Route } from './types'
import type { CalcConfig } from '../types/config'
import { isFiatToFiat } from '../types/config'
import { getAdaptersForFiat, getAdaptersForStable, getAdapterById } from '../exchanges/registry'

/**
 * Known direct stable/fiat markets per exchange.
 * Only exchanges explicitly listed here generate direct routes.
 * e.g. Upbit has KRW-USDT; bitbank does NOT have JPY-USDT.
 */
const DIRECT_STABLE_MARKETS: Record<string, Record<string, string[]>> = {
  upbit: { KRW: ['USDT'] },
  bithumb: { KRW: ['USDT'] },
}

export function buildRoutesForPair(config: CalcConfig): Route[] {
  if (isFiatToFiat(config.pair)) {
    return buildFiatToFiatRoutes(config)
  }
  return buildFiatToStableRoutes(config)
}

/**
 * Fiat-to-stable pairs (KRW-USD, JPY-USD, EUR-USD).
 * Routes convert between a fiat currency and a stable token (USDT etc.)
 */
function buildFiatToStableRoutes(config: CalcConfig): Route[] {
  const { pair, bridgeCrypto, stableToken, exchangeAId, exchangeBId } = config
  const fiatCurrency = pair.fiat
  const routes: Route[] = []

  const fiatAdapters = getAdaptersForFiat(fiatCurrency)
  const stableAdapters = getAdaptersForStable(stableToken)

  // 1. Direct routes — only for exchanges with known direct stable/fiat markets
  for (const fiatAdapter of fiatAdapters) {
    const knownTokens = DIRECT_STABLE_MARKETS[fiatAdapter.id]?.[fiatCurrency]
    if (knownTokens?.includes(stableToken)) {
      const market = fiatAdapter.buildMarketSymbol(stableToken, fiatCurrency)
      routes.push({
        id: `${fiatAdapter.id}-direct`,
        label: `${fiatAdapter.name} Direct — ${stableToken}/${fiatCurrency}`,
        kind: 'direct',
        steps: [{ adapterId: fiatAdapter.id, market }],
      })
    }
  }

  // 2. Cross-rate routes: bridge/fiat + bridge/stable
  for (const fiatAdapter of fiatAdapters) {
    const fiatMarket = fiatAdapter.buildMarketSymbol(bridgeCrypto, fiatCurrency)

    for (const stableAdapter of stableAdapters) {
      const stableMarket = stableAdapter.buildMarketSymbol(bridgeCrypto, stableToken)
      routes.push({
        id: `${fiatAdapter.id}-${stableAdapter.id}-cross`,
        label: `${fiatAdapter.name} + ${stableAdapter.name} — ${bridgeCrypto}/${fiatCurrency} × ${bridgeCrypto}/${stableToken}`,
        kind: 'cross',
        steps: [
          { adapterId: fiatAdapter.id, market: fiatMarket },
          { adapterId: stableAdapter.id, market: stableMarket },
        ],
      })
    }
  }

  routes.sort((a, b) => {
    const aScore = routePriority(a, exchangeAId, exchangeBId)
    const bScore = routePriority(b, exchangeAId, exchangeBId)
    return aScore - bScore
  })

  return routes
}

/**
 * Fiat-to-fiat pairs (KRW-JPY, KRW-EUR, etc.)
 * Routes use bridge crypto prices from both fiat sides:
 *   rate = bridge/fiatA ÷ bridge/fiatB
 * e.g. BTC/KRW (Upbit) ÷ BTC/JPY (bitbank) = JPY per KRW
 */
function buildFiatToFiatRoutes(config: CalcConfig): Route[] {
  const { pair, bridgeCrypto, exchangeAId, exchangeBId } = config
  const fiatA = pair.fiat
  const fiatB = pair.stable // For fiat-to-fiat, 'stable' field holds the second fiat
  const routes: Route[] = []

  const adaptersA = getAdaptersForFiat(fiatA)
  const adaptersB = getAdaptersForFiat(fiatB)

  // Only cross-rate routes — no direct markets exist between two fiats
  for (const adapterA of adaptersA) {
    const marketA = adapterA.buildMarketSymbol(bridgeCrypto, fiatA)

    for (const adapterB of adaptersB) {
      const marketB = adapterB.buildMarketSymbol(bridgeCrypto, fiatB)
      routes.push({
        id: `${adapterA.id}-${adapterB.id}-cross`,
        label: `${adapterA.name} + ${adapterB.name} — ${bridgeCrypto}/${fiatA} × ${bridgeCrypto}/${fiatB}`,
        kind: 'cross',
        steps: [
          { adapterId: adapterA.id, market: marketA },
          { adapterId: adapterB.id, market: marketB },
        ],
      })
    }
  }

  routes.sort((a, b) => {
    const aScore = routePriority(a, exchangeAId, exchangeBId)
    const bScore = routePriority(b, exchangeAId, exchangeBId)
    return aScore - bScore
  })

  return routes
}

function routePriority(route: Route, primaryExId: string, secondaryExId: string): number {
  if (route.kind === 'direct') {
    if (route.steps[0].adapterId === primaryExId) return 0
    return 1
  }
  const hasPrimary = route.steps.some(s => s.adapterId === primaryExId)
  const hasSecondary = route.steps.some(s => s.adapterId === secondaryExId)
  if (hasPrimary && hasSecondary) return 2
  if (hasPrimary || hasSecondary) return 3
  return 4
}

export function getDefaultRoutes(config: CalcConfig): Route[] {
  const routes = buildRoutesForPair(config)
  return routes.filter(r =>
    r.steps.every(s => getAdapterById(s.adapterId) !== undefined),
  )
}
