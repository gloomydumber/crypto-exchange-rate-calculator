import { useState, useCallback, useRef } from 'react'
import { TextField, InputAdornment, IconButton, Tooltip } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { copyToClipboard } from '../../utils/clipboard'

interface CurrencyInputProps {
  label: string
  symbol: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function CurrencyInput({ label, symbol, value, onChange, disabled }: CurrencyInputProps) {
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const cleaned = raw.replace(/[^0-9.]/g, '')
    onChange(cleaned)
  }, [onChange])

  const handleCopy = useCallback(async () => {
    const plainValue = value.replace(/,/g, '')
    const ok = await copyToClipboard(plainValue)
    if (ok) {
      setCopied(true)
      clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500)
    }
  }, [value])

  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <span style={{ fontSize: '1rem', fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{symbol}</span>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Copy" arrow>
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  edge="end"
                  tabIndex={-1}
                  sx={{
                    color: copied ? 'primary.main' : 'inherit',
                    transition: 'color 0.15s',
                  }}
                >
                  <ContentCopyIcon sx={{ fontSize: '0.8rem' }} />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
          sx: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' },
        },
        inputLabel: {
          sx: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' },
        },
      }}
      sx={{ mb: 1 }}
    />
  )
}
