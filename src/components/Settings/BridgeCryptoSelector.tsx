import { ToggleButtonGroup, ToggleButton, FormLabel, Box } from '@mui/material'
import type { BridgeCrypto } from '../../types/config'

interface BridgeCryptoSelectorProps {
  value: BridgeCrypto
  onChange: (crypto: BridgeCrypto) => void
}

const OPTIONS: BridgeCrypto[] = ['BTC', 'ETH']

export function BridgeCryptoSelector({ value, onChange }: BridgeCryptoSelectorProps) {
  return (
    <Box>
      <FormLabel sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
        Bridge Crypto
      </FormLabel>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, v) => { if (v) onChange(v as BridgeCrypto) }}
        size="small"
        fullWidth
      >
        {OPTIONS.map(opt => (
          <ToggleButton
            key={opt}
            value={opt}
            sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', py: 0.5 }}
          >
            {opt}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  )
}
