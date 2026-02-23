import { useState, useCallback } from 'react'
import { Box, Typography, IconButton, Tooltip } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import { CurrencyInput } from './CurrencyInput'
import { RouteStatusBar } from '../RouteStatus'
import { SettingsDialog } from '../Settings'
import { useExchangeCalc } from '../../hooks/useExchangeCalc'
import { FIAT_SYMBOLS, STABLE_SYMBOLS, BRIDGE_SYMBOLS } from '../../types/config'
import type { FiatCurrency } from '../../types/config'

interface CalculatorProps {
  showHeader?: boolean
  onCopy?: (label: string, value: string) => void
}

export function Calculator({ showHeader = true, onCopy }: CalculatorProps) {
  const {
    calcValues,
    effectiveRate,
    activeRouteLabel,
    routeStates,
    isCalculating,
    lastError,
    updateField,
    pair,
    bridgeCrypto,
    stableToken,
    isFiatFiat,
  } = useExchangeCalc()

  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleStableChange = useCallback((v: string) => updateField('stable', v), [updateField])
  const handleFiatChange = useCallback((v: string) => updateField('fiat', v), [updateField])
  const handleCryptoChange = useCallback((v: string) => updateField('crypto', v), [updateField])

  const fiatSymbol = FIAT_SYMBOLS[pair.fiat] ?? pair.fiat
  const bridgeSymbol = BRIDGE_SYMBOLS[bridgeCrypto] ?? bridgeCrypto

  // For fiat-to-fiat: top field is fiatB (e.g. JPY), middle field is fiatA (e.g. KRW)
  // For fiat-to-stable: top field is stable token (USDT), middle field is fiat (KRW)
  const topLabel = isFiatFiat ? pair.stable : stableToken
  const topSymbol = isFiatFiat
    ? (FIAT_SYMBOLS[pair.stable as FiatCurrency] ?? pair.stable)
    : (STABLE_SYMBOLS[stableToken] ?? stableToken)

  // Rate display labels
  const rateLeftLabel = isFiatFiat ? pair.stable : stableToken
  const rateRightLabel = pair.fiat

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1.5, overflow: 'hidden' }}>
      {/* Header — hidden when used as widget (host provides its own title bar) */}
      {showHeader && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.03em' }}
          >
            Exchange Calculator
          </Typography>
          <Tooltip title="Settings" arrow>
            <IconButton size="small" onClick={() => setSettingsOpen(true)} sx={{ color: 'text.secondary' }}>
              <SettingsIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Route Status + inline settings gear when header is hidden */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: showHeader ? 0 : 1 }}>
        <Box sx={{ flex: 1 }}>
          <RouteStatusBar
            rate={effectiveRate}
            stableToken={rateLeftLabel}
            fiatCurrency={rateRightLabel}
            activeRouteLabel={activeRouteLabel}
            routeStates={routeStates}
            isCalculating={isCalculating}
            error={lastError}
          />
        </Box>
        {!showHeader && (
          <Tooltip title="Settings" arrow>
            <IconButton size="small" onClick={() => setSettingsOpen(true)} sx={{ flexShrink: 0, color: 'text.secondary' }}>
              <SettingsIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Input fields */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.5, mt: 1 }}>
        <CurrencyInput
          label={topLabel}
          symbol={topSymbol}
          value={calcValues.stableAmount}
          onChange={handleStableChange}
          onCopy={onCopy}
        />
        <CurrencyInput
          label={pair.fiat}
          symbol={fiatSymbol}
          value={calcValues.fiatAmount}
          onChange={handleFiatChange}
          onCopy={onCopy}
        />
        <CurrencyInput
          label={bridgeCrypto}
          symbol={bridgeSymbol}
          value={calcValues.cryptoAmount}
          onChange={handleCryptoChange}
          onCopy={onCopy}
        />
      </Box>

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Box>
  )
}
