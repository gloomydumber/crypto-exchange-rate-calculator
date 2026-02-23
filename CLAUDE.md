# Crypto Exchange Rate Calculator

Publishable npm package (`@gloomydumber/crypto-exchange-rate-calculator`). Converts between fiat currencies and crypto using live exchange APIs.

## Build & Dev

- `npm run dev` — Vite dev server (standalone harness)
- `npm run build` — TypeScript compile + Vite build
- `npm run build:lib` — Library mode build (produces dist/)
- `npm run lint` — ESLint flat config

## Architecture

- React + TypeScript + Vite + MUI 7 + Jotai
- Library mode via Vite (`src/lib.ts` entry)
- Same wrapper pattern as `premium-table-refactored`: `<Provider><ThemeProvider><Calculator /></ThemeProvider></Provider>`
- Props: `{ height?, theme?, showHeader? }` — theme inherits from host app, showHeader=false hides title for widget use
- Exchange adapters in `src/exchanges/adapters/` — each implements `PriceAdapter` interface
- Route/fallback system in `src/routes/` — auto-generated from config, first success wins
- Settings persisted via `atomWithStorage`

## Versioning

- Conventional Commits: `feat:` → MINOR, `fix:`/`perf:` → PATCH
- CI auto-publishes on version bump (`.github/workflows/publish.yml`)
