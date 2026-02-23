import { createTheme } from '@mui/material'

const MONO_FONT = "'JetBrains Mono', 'Fira Code', Consolas, monospace"

export const defaultTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00ff00' },
    background: { default: '#0a0a0a', paper: '#111111' },
    text: { primary: '#00ff00', secondary: 'rgba(0, 255, 0, 0.4)' },
    divider: 'rgba(0, 255, 0, 0.06)',
  },
  typography: {
    fontFamily: MONO_FONT,
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            fontSize: '0.85rem',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
          fontFamily: MONO_FONT,
          backgroundColor: 'rgba(0, 0, 0, 0.92)',
          color: '#00ff00',
          border: '1px solid rgba(0, 255, 0, 0.3)',
        },
        arrow: {
          color: 'rgba(0, 0, 0, 0.92)',
          '&::before': {
            border: '1px solid rgba(0, 255, 0, 0.3)',
          },
        },
      },
    },
  },
})
