import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import type { StableToken } from '../../types/config'

interface StableTokenSelectorProps {
  value: StableToken
  availableTokens: string[]
  onChange: (token: StableToken) => void
}

export function StableTokenSelector({ value, availableTokens, onChange }: StableTokenSelectorProps) {
  const handleChange = (e: SelectChangeEvent) => {
    onChange(e.target.value as StableToken)
  }

  return (
    <FormControl fullWidth size="small">
      <InputLabel sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>
        Stable Token
      </InputLabel>
      <Select
        value={availableTokens.includes(value) ? value : (availableTokens[0] ?? 'USDT')}
        label="Stable Token"
        onChange={handleChange}
        sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}
      >
        {availableTokens.map(t => (
          <MenuItem key={t} value={t} sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}>
            {t}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
