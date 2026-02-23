export type RouteKind = 'direct' | 'cross'

export interface RouteStep {
  adapterId: string
  market: string // built symbol, e.g. 'KRW-USDT' or 'BTCUSDT'
}

export interface Route {
  id: string
  label: string
  kind: RouteKind
  steps: RouteStep[] // 1 for direct, 2 for cross
}

export type RouteStatus = 'idle' | 'loading' | 'success' | 'error'

export interface RouteState {
  routeId: string
  status: RouteStatus
  error?: string
}
