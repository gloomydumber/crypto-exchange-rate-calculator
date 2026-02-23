import { Provider } from 'jotai'
import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import type { Theme } from '@mui/material'
import { Calculator } from '../Calculator'
import { defaultTheme } from './theme'

export interface ExchangeCalcProps {
  height?: string | number
  theme?: Theme
  showHeader?: boolean
}

export function ExchangeCalc({ height = '100vh', theme, showHeader = true }: ExchangeCalcProps) {
  const resolvedTheme = theme ?? defaultTheme
  const isDark = resolvedTheme.palette.mode === 'dark'

  return (
    <Provider>
      <ThemeProvider theme={resolvedTheme}>
        <CssBaseline />
        <Box data-cerc-theme={isDark ? 'dark' : 'light'} sx={{ width: '100%', height }}>
          <Calculator showHeader={showHeader} />
        </Box>
      </ThemeProvider>
    </Provider>
  )
}
