# @gloomydumber/crypto-exchange-rate-calculator

Crypto exchange rate calculator widget. Converts between fiat currencies (KRW, JPY, EUR, USD) and crypto (BTC/ETH) using live exchange REST APIs.

Publishable npm package for [GitHub Packages](https://github.com/features/packages). Designed for standalone use or as a widget inside [wts-frontend](https://github.com/gloomydumber/wts-frontend).

## Usage

### As a widget (wts-frontend)

```tsx
import { ExchangeCalc } from '@gloomydumber/crypto-exchange-rate-calculator'
import '@gloomydumber/crypto-exchange-rate-calculator/style.css'
import { useTheme } from '@mui/material/styles'

export default function ExchangeCalcWidget() {
  const theme = useTheme()
  return <ExchangeCalc height="100%" theme={theme} showHeader={false} />
}
```

### Standalone

```tsx
import { ExchangeCalc } from '@gloomydumber/crypto-exchange-rate-calculator'
import '@gloomydumber/crypto-exchange-rate-calculator/style.css'

function App() {
  return <ExchangeCalc />
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `string \| number` | `'100vh'` | Container height |
| `theme` | `Theme` | Internal dark theme | MUI theme object. Pass host theme for integration. |
| `showHeader` | `boolean` | `true` | Show title bar + settings icon. Set `false` when host provides its own title (e.g. react-grid-layout). |

## Supported Exchanges

| Exchange | Currencies | API |
|----------|-----------|-----|
| Upbit | KRW | REST |
| Bithumb | KRW | REST |
| Binance | USDT, USDC, BUSD, FDUSD | REST (6-endpoint failover) |
| OKX | USDT, USDC | REST |
| bitbank | JPY | REST |
| Kraken | EUR, USD | REST |
| Coinbase | USD | REST |

## Currency Pairs

- KRW-USD (fiat-to-stable)
- JPY-USD (fiat-to-stable)
- EUR-USD (fiat-to-stable)
- KRW-JPY (fiat-to-fiat)

## Development

```bash
npm run dev        # Vite dev server (standalone harness)
npm run build      # TypeScript compile + Vite build
npm run build:lib  # Library mode build (dist/)
npm run lint       # ESLint
```

## Peer Dependencies

- `react` ^18 || ^19
- `react-dom` ^18 || ^19
- `@mui/material` ^6 || ^7
- `@mui/icons-material` ^6 || ^7
- `@emotion/react` ^11
- `@emotion/styled` ^11
- `jotai` ^2

## License

MIT
