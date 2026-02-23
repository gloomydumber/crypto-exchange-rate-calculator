import { Dialog, DialogTitle, DialogContent, Box, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useAtom } from 'jotai'
import {
  pairAtom,
  exchangeAIdAtom,
  exchangeBIdAtom,
  bridgeCryptoAtom,
  stableTokenAtom,
  enabledRouteIdsAtom,
} from '../../store/configAtoms'
import { isFiatToFiat } from '../../types/config'
import { getAdaptersForFiat, getAdaptersForStable, getAdapterById } from '../../exchanges/registry'
import { PairSelector } from './PairSelector'
import { ProviderSelector } from './ProviderSelector'
import { BridgeCryptoSelector } from './BridgeCryptoSelector'
import { StableTokenSelector } from './StableTokenSelector'
import { FallbackChainEditor } from './FallbackChainEditor'
import type { CurrencyPair, BridgeCrypto, StableToken } from '../../types/config'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const [pair, setPair] = useAtom(pairAtom)
  const [exchangeAId, setExchangeAId] = useAtom(exchangeAIdAtom)
  const [exchangeBId, setExchangeBId] = useAtom(exchangeBIdAtom)
  const [bridgeCrypto, setBridgeCrypto] = useAtom(bridgeCryptoAtom)
  const [stableToken, setStableToken] = useAtom(stableTokenAtom)
  const [enabledRouteIds, setEnabledRouteIds] = useAtom(enabledRouteIdsAtom)

  const isFiatFiat = isFiatToFiat(pair)

  // Exchange A always serves the left side of the pair (pair.fiat)
  const exchangeAAdapters = getAdaptersForFiat(pair.fiat)

  // Exchange B serves the right side: another fiat exchange (fiat-to-fiat) or a stable-token exchange
  const exchangeBAdapters = isFiatFiat
    ? getAdaptersForFiat(pair.stable)
    : getAdaptersForStable(stableToken)

  // Available stable tokens from selected exchange B
  const selectedBAdapter = getAdapterById(exchangeBId)
  const availableStableTokens = selectedBAdapter?.supportedStableTokens ?? ['USDT']

  const handlePairChange = (p: CurrencyPair) => {
    setPair(p)
    // Auto-select exchange A for the new fiat currency
    const newAAdapters = getAdaptersForFiat(p.fiat)
    if (newAAdapters.length > 0 && !newAAdapters.some(a => a.id === exchangeAId)) {
      setExchangeAId(newAAdapters[0].id)
    }
    // Auto-select exchange B for the new right-side currency
    if (isFiatToFiat(p)) {
      const bAdapters = getAdaptersForFiat(p.stable)
      if (bAdapters.length > 0 && !bAdapters.some(a => a.id === exchangeBId)) {
        setExchangeBId(bAdapters[0].id)
      }
    } else {
      const bAdapters = getAdaptersForStable(stableToken)
      if (bAdapters.length > 0 && !bAdapters.some(a => a.id === exchangeBId)) {
        setExchangeBId(bAdapters[0].id)
      }
    }
    setEnabledRouteIds([])
  }

  const handleExchangeBChange = (id: string) => {
    setExchangeBId(id)
    if (!isFiatFiat) {
      // Check if current stable token is still supported by the new exchange
      const adapter = getAdapterById(id)
      if (adapter && !adapter.supportedStableTokens.includes(stableToken)) {
        setStableToken(adapter.supportedStableTokens[0] as StableToken)
      }
    }
    setEnabledRouteIds([])
  }

  // Labels for the two exchange selectors
  const labelA = `${pair.fiat} Source`
  const labelB = isFiatFiat ? `${pair.stable} Source` : `${stableToken} Source`

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: { fontFamily: "'JetBrains Mono', monospace", height: 600 },
        },
      }}
    >
      <DialogTitle sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Settings
        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </DialogTitle>
      <DialogContent className="cerc-scroller">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1.5 }}>
          <PairSelector value={pair} onChange={handlePairChange} />

          <ProviderSelector
            label={labelA}
            value={exchangeAId}
            adapters={exchangeAAdapters}
            onChange={(id) => { setExchangeAId(id); setEnabledRouteIds([]) }}
          />

          <ProviderSelector
            label={labelB}
            value={exchangeBId}
            adapters={exchangeBAdapters}
            onChange={handleExchangeBChange}
          />

          {/* Stable token selector — only for fiat-to-stable mode */}
          {!isFiatFiat && (
            <StableTokenSelector
              value={stableToken}
              availableTokens={availableStableTokens}
              onChange={(t) => { setStableToken(t); setEnabledRouteIds([]) }}
            />
          )}

          <BridgeCryptoSelector
            value={bridgeCrypto}
            onChange={(c: BridgeCrypto) => { setBridgeCrypto(c); setEnabledRouteIds([]) }}
          />

          <FallbackChainEditor
            enabledRouteIds={enabledRouteIds}
            onChange={setEnabledRouteIds}
          />
        </Box>
      </DialogContent>
    </Dialog>
  )
}
