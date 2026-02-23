# Handoff — crypto-exchange-rate-calculator

## What This Is

`@gloomydumber/crypto-exchange-rate-calculator` — publishable npm package (GitHub Packages) that converts between fiat currencies (KRW, JPY, EUR, USD) and crypto (BTC/ETH) using live exchange REST APIs. Same build/publish pattern as `@gloomydumber/premium-table`.

## Current Status

**v0.0.3** — Published and integrated into wts-frontend. CI auto-publishes on version bump.

### What Works
- Three synchronized input fields (stable/fiatB, fiat, bridge crypto) with live calculation
- 7 exchange adapters: Upbit, Bithumb, Binance, OKX, **bitbank** (JPY), Kraken, Coinbase
- Auto-generated route/fallback chains per currency pair
- Settings dialog: pair selector, exchange A/B selectors, stable token, bridge crypto, fallback chain editor
- `showHeader` prop — `true` for standalone, `false` when used as widget (host provides title bar)
- `theme` prop — inherits host theme, standalone uses dark green-on-black default
- `onCopy` callback prop — host app can log copy events (wts-frontend logs to ConsoleWidget)
- Standalone dev mode (`npm run dev`) and library build (`npm run build:lib`)
- wts-frontend integration live — default layout `w:3, h:9`, `defaultVisible: true`

## Architecture

### Dual Build Mode
- `npm run dev` — full Vite dev server with `main.tsx` → `App.tsx` → `<ExchangeCalc />`
- `npm run build:lib` — library mode from `src/lib.ts`, externalized peer deps, outputs `dist/index.js`, `dist/index.d.ts`, `dist/index.css`

### Component Hierarchy
```
ExchangeCalc (Provider + ThemeProvider + CssBaseline)
  └─ Calculator (showHeader, onCopy)
       ├─ Header (title + gear icon) — conditional via showHeader
       ├─ RouteStatusBar (rate display + route indicator + inline gear when no header)
       ├─ CurrencyInput × 3 (stable/fiatB, fiat, bridge crypto) — each has onCopy callback
       └─ SettingsDialog (modal)
            ├─ PairSelector
            ├─ ProviderSelector × 2 (Exchange A, Exchange B)
            ├─ StableTokenSelector (fiat-to-stable mode only)
            ├─ BridgeCryptoSelector
            └─ FallbackChainEditor
```

### Props (`ExchangeCalcProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `string \| number` | `'100vh'` | Container height |
| `theme` | `Theme` | Internal dark theme | MUI theme object. Pass host theme for integration. |
| `showHeader` | `boolean` | `true` | Show title bar + settings icon. Set `false` when host provides its own title. |
| `onCopy` | `(label: string, value: string) => void` | — | Callback when user copies a value. Used by wts-frontend for logger integration. |

### Exchange Adapters (`src/exchanges/adapters/`)

Each implements `PriceAdapter` interface with `fetchPrice()`, `buildMarketSymbol()`.

| Adapter | Fiat | Stable Tokens | API |
|---------|------|---------------|-----|
| `upbit` | KRW | — | `/v1/ticker?markets={market}` → `trade_price` |
| `bithumb` | KRW | — | `/v1/ticker?markets={market}` → `trade_price` |
| `binance` | — | USDT, USDC, BUSD, FDUSD | `/api/v3/ticker/price?symbol={symbol}` → `price` (6 endpoint failover) |
| `okx` | — | USDT, USDC | `/api/v5/market/ticker?instId={symbol}` → `data[0].last` |
| `bitbank` | JPY | — | `/{pair}/ticker` → `data.last` (lowercase pairs: `btc_jpy`) |
| `kraken` | EUR, USD | — | `/0/public/Ticker?pair={pair}` → `c[0]` |
| `coinbase` | USD | — | `/v2/prices/{pair}/spot` → `amount` |

**bitflyer was replaced with bitbank** — bitflyer has CORS issues from browser.

### Naming Convention: `exchangeAId` / `exchangeBId`

All exchanges are just "exchanges" (CEXes). No fiat/stable categorization of the exchange itself.
- **Exchange A** = left side of pair (e.g., KRW side → Upbit)
- **Exchange B** = right side of pair (e.g., USD/USDT side → Binance, or JPY side → bitbank)
- `CalcConfig.exchangeAId` / `CalcConfig.exchangeBId`
- Atoms: `exchangeAIdAtom` / `exchangeBIdAtom` (localStorage keys: `cerc-exchange-a`, `cerc-exchange-b`)

### Route System (`src/routes/`)

- **Direct routes**: single API call (e.g., USDT/KRW on Upbit). Only whitelisted in `DIRECT_STABLE_MARKETS`.
- **Cross-rate routes**: two parallel API calls (e.g., BTC/KRW on Upbit + BTC/USDT on Binance → derived rate).
- `presets.ts`: `buildRoutesForPair()` auto-generates routes from adapter registry. Two paths: `buildFiatToStableRoutes()` and `buildFiatToFiatRoutes()`.
- `route-executor.ts`: tries routes in priority order, first success wins.
- `routePriority()`: sorts by user-configured exchange preference.

### Pair Modes

Determined by `isFiatToFiat(pair)` — returns `true` when `pair.stable !== 'USD'`.

| Mode | Example | Exchange A | Exchange B | Stable Token |
|------|---------|-----------|-----------|--------------|
| Fiat-to-stable | KRW-USD | Upbit (KRW) | Binance (USDT) | Selectable |
| Fiat-to-fiat | KRW-JPY | Upbit (KRW) | bitbank (JPY) | Hidden |

**Critical**: `handlePairChange()` in SettingsDialog resets `exchangeBId` for **both** transitions (fiat-to-fiat → fiat-to-stable and vice versa). This prevents stale exchange IDs (e.g., bitbank staying selected when switching from KRW-JPY to KRW-USD, which would cause 404s on `btc_usdt` from bitbank).

### State (Jotai)

**Persisted** (`atomWithStorage`):
- `pairAtom` (`cerc-pair`) — e.g., `{ fiat: 'KRW', stable: 'USD', label: 'KRW-USD' }`
- `exchangeAIdAtom` (`cerc-exchange-a`) — e.g., `'upbit'`
- `exchangeBIdAtom` (`cerc-exchange-b`) — e.g., `'binance'`
- `bridgeCryptoAtom` (`cerc-bridge-crypto`) — `'BTC'` or `'ETH'`
- `stableTokenAtom` (`cerc-stable-token`) — `'USDT'`, `'USDC'`, etc.
- `enabledRouteIdsAtom` (`cerc-enabled-routes`) — empty = all enabled

**Runtime** (plain `atom` in `rateAtoms.ts`):
- `calcInputAtom`, `calcValuesAtom`, `effectiveRateAtom`, `fiatPriceAtom`, `stablePriceAtom`
- `activeRouteIdAtom`, `activeRouteLabelAtom`, `routeStatesAtom`
- `isCalculatingAtom`, `lastErrorAtom`

### Calculation Flow (`useExchangeCalc` hook)

1. User types in any field → `updateField()` sets `calcInputAtom`
2. 400ms debounce via `useDebounce`
3. AbortController cancels in-flight requests
4. Parallel fetch: `executeRouteChain()` + `fetchBridgePricesTwoSides()`
5. Calculate other two fields from the result
6. Update all atoms

### UI Details

- **Default state** (no input): rate line shows `USDT/KRW — Enter a value to calculate`, route line shows grey dot + `Ready`
- **RouteStatusBar**: `px: 1` padding, `gap: 0.75` between dot and text; top margin `mt: 1` when `showHeader={false}` (widget mode) to avoid crowding the host title bar
- **Copy icon**: always `primary.main` (lime) — no transition effect
- **Settings gear**: `color: 'text.secondary'` matching DEX widget style
- **Tooltip theme** (standalone dark mode): `bg: rgba(0,0,0,0.92)`, `color: #00ff00`, `border: 1px solid rgba(0,255,0,0.3)`, monospace `0.75rem`
- **Scrollbar**: `.cerc-scroller` class with `[data-cerc-theme]` light/dark variants, applied to `DialogContent` and `FallbackChainEditor`
- **Settings dialog**: fixed `height: 600`, `cerc-scroller` class on DialogContent

## wts-frontend Integration

Widget file: `src/components/widgets/ExchangeCalcWidget/index.tsx`

```tsx
import { useCallback } from 'react'
import { ExchangeCalc } from '@gloomydumber/crypto-exchange-rate-calculator'
import '@gloomydumber/crypto-exchange-rate-calculator/style.css'
import { useTheme } from '@mui/material/styles'
import { log } from '../../../services/logger'

export default function ExchangeCalcWidget() {
  const theme = useTheme()

  const handleCopy = useCallback((label: string, value: string) => {
    log({
      level: 'INFO',
      category: 'SYSTEM',
      source: 'exchange-calc',
      message: `Copied ${label}: ${value}`,
      data: { label, value },
    })
  }, [])

  return <ExchangeCalc height="100%" theme={theme} showHeader={false} onCopy={handleCopy} />
}
```

- Registered in widget system: `id: 'ExchangeCalc'`, `label: 'Exchange Calculator'`, `defaultVisible: true`
- Default layout: `w: 3, h: 9` across all breakpoints
- Copy events logged to ConsoleWidget via centralized logger (category `SYSTEM`, source `exchange-calc`)

## Known Issues / Gotchas

1. **localStorage migration**: Atom storage keys changed from `cerc-fiat-exchange`/`cerc-stable-exchange` to `cerc-exchange-a`/`cerc-exchange-b`. Clear localStorage after upgrading from earlier builds.
2. **OKX defensive check**: `if (!data.data?.[0]?.last)` — OKX can return empty data array.
3. **bitbank lowercase markets**: `buildMarketSymbol` returns `btc_jpy` not `BTC_JPY`.
4. **DIRECT_STABLE_MARKETS whitelist**: Only Upbit and Bithumb have confirmed direct USDT/KRW markets. Don't add exchanges without verifying.
5. **CORS**: All current adapters work from browser. If adding new exchanges, verify CORS on public endpoints first. bitflyer was removed for this reason.

## Version History

| Version | Changes |
|---------|---------|
| 0.0.3 | Copy icon always lime, settings gear `text.secondary`, added `onCopy` callback prop |
| 0.0.2 | Top margin on info block in widget mode |
| 0.1.0 | Initial release — full calculator with 7 adapters, route system, settings |

## File Map

```
src/
  lib.ts                          — Library entry point (exports component + types + adapters)
  lib-styles.css                  — Scrollbar CSS (.cerc-scroller, dark/light variants)
  main.tsx / App.tsx              — Dev harness only (not in library build)

  types/
    config.ts                     — CurrencyPair, CalcConfig, FiatCurrency, StableToken, BridgeCrypto, isFiatToFiat()
    calc.ts                       — CalcValues, CalcInput, ActiveField

  exchanges/
    types.ts                      — PriceAdapter interface, PriceResult
    registry.ts                   — ALL_ADAPTERS array, getAdapterById(), getAdaptersForFiat(), getAdaptersForStable()
    fetch-with-retry.ts           — Generic fetch with retry + timeout + AbortController
    adapters/                     — upbit, bithumb, binance, okx, bitbank, kraken, coinbase

  routes/
    types.ts                      — Route, RouteStep, RouteState, RouteStatus
    presets.ts                    — buildRoutesForPair(), DIRECT_STABLE_MARKETS whitelist
    route-executor.ts             — executeRouteChain() — tries routes in order, first success wins

  store/
    configAtoms.ts                — Persisted settings (pair, exchangeAId, exchangeBId, bridgeCrypto, stableToken)
    rateAtoms.ts                  — Runtime state (calcValues, rate, route status, errors)

  hooks/
    useDebounce.ts                — Custom debounce hook (400ms)
    useExchangeCalc.ts            — Core hook: input → debounce → API → calculate → output

  components/
    ExchangeCalc/                 — Main wrapper (Provider + ThemeProvider), exports ExchangeCalcProps
    Calculator/                   — 3 input fields + route status + settings gear
    RouteStatus/                  — Rate display + route indicator dot
    Settings/                     — SettingsDialog + PairSelector + ProviderSelector + BridgeCryptoSelector + StableTokenSelector + FallbackChainEditor

  utils/
    format.ts                     — formatNumber() (comma-separated, no scientific notation)
    clipboard.ts                  — copyToClipboard()
```

## Next Steps

1. Consider adding more currency pairs (KRW-EUR, JPY-EUR, etc.)
2. Consider WebSocket-based live price updates (currently REST poll on input change only)
3. Test widget in grid layout with theme switching (dark/light)
