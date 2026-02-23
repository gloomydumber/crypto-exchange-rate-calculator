import type { Route, RouteState } from './types'
import { getAdapterById } from '../exchanges/registry'

export interface RouteExecutionResult {
  /** Derived exchange rate: 1 stable token = X fiat */
  rate: number
  /** Price of bridge crypto in fiat (for direct routes, this is the rate itself) */
  fiatPrice: number
  /** Price of bridge crypto in stable token (for direct routes, this is 1) */
  stablePrice: number
  /** Which route succeeded */
  activeRouteId: string
  /** States of all attempted routes */
  routeStates: RouteState[]
}

export async function executeRouteChain(
  routes: Route[],
  enabledRouteIds: string[],
  signal?: AbortSignal,
): Promise<RouteExecutionResult> {
  const filteredRoutes = enabledRouteIds.length > 0
    ? routes.filter(r => enabledRouteIds.includes(r.id))
    : routes

  const routeStates: RouteState[] = []

  for (const route of filteredRoutes) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }

    try {
      if (route.kind === 'direct') {
        const adapter = getAdapterById(route.steps[0].adapterId)
        if (!adapter) throw new Error(`Adapter ${route.steps[0].adapterId} not found`)

        const result = await adapter.fetchPrice(route.steps[0].market, signal)

        routeStates.push({ routeId: route.id, status: 'success' })
        return {
          rate: result.price,
          fiatPrice: result.price,
          stablePrice: 1,
          activeRouteId: route.id,
          routeStates,
        }
      }

      if (route.kind === 'cross') {
        const [fiatStep, stableStep] = route.steps
        const fiatAdapter = getAdapterById(fiatStep.adapterId)
        const stableAdapter = getAdapterById(stableStep.adapterId)
        if (!fiatAdapter || !stableAdapter) throw new Error('Adapter not found')

        // Fetch both prices in parallel
        const [fiatResult, stableResult] = await Promise.all([
          fiatAdapter.fetchPrice(fiatStep.market, signal),
          stableAdapter.fetchPrice(stableStep.market, signal),
        ])

        // rate = fiatPrice / stablePrice (e.g. BTC/KRW ÷ BTC/USDT = USDT/KRW)
        const rate = fiatResult.price / stableResult.price

        routeStates.push({ routeId: route.id, status: 'success' })
        return {
          rate,
          fiatPrice: fiatResult.price,
          stablePrice: stableResult.price,
          activeRouteId: route.id,
          routeStates,
        }
      }

      throw new Error(`Unknown route kind: ${route.kind}`)
    } catch (err) {
      if (signal?.aborted) throw err
      routeStates.push({
        routeId: route.id,
        status: 'error',
        error: (err as Error).message,
      })
    }
  }

  throw new Error('All routes failed')
}
