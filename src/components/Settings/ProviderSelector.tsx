import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import type { PriceAdapter } from '../../exchanges/types'

interface ProviderSelectorProps {
  label: string
  value: string
  adapters: PriceAdapter[]
  onChange: (id: string) => void
}

export function ProviderSelector({ label, value, adapters, onChange }: ProviderSelectorProps) {
  const handleChange = (e: SelectChangeEvent) => {
    onChange(e.target.value)
  }

  return (
    <FormControl fullWidth size="small">
      <InputLabel sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>
        {label}
      </InputLabel>
      <Select
        value={adapters.some(a => a.id === value) ? value : (adapters[0]?.id ?? '')}
        label={label}
        onChange={handleChange}
        sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}
      >
        {adapters.map(a => (
          <MenuItem key={a.id} value={a.id} sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}>
            {a.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
