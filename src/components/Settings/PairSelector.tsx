import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { CURRENCY_PAIRS } from '../../types/config'
import type { CurrencyPair } from '../../types/config'

interface PairSelectorProps {
  value: CurrencyPair
  onChange: (pair: CurrencyPair) => void
}

export function PairSelector({ value, onChange }: PairSelectorProps) {
  const handleChange = (e: SelectChangeEvent) => {
    const found = CURRENCY_PAIRS.find(p => p.label === e.target.value)
    if (found) onChange(found)
  }

  return (
    <FormControl fullWidth size="small">
      <InputLabel sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>
        Currency Pair
      </InputLabel>
      <Select
        value={value.label}
        label="Currency Pair"
        onChange={handleChange}
        sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}
      >
        {CURRENCY_PAIRS.map(p => (
          <MenuItem key={p.label} value={p.label} sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}>
            {p.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
