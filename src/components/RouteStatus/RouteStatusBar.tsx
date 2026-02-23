import { Box, Typography, CircularProgress } from '@mui/material'
import type { RouteState } from '../../routes/types'
import { formatNumber } from '../../utils/format'

interface RouteStatusBarProps {
  rate: number
  stableToken: string
  fiatCurrency: string
  activeRouteLabel: string
  routeStates: RouteState[]
  isCalculating: boolean
  error: string
}

export function RouteStatusBar({
  rate,
  stableToken,
  fiatCurrency,
  activeRouteLabel,
  routeStates,
  isCalculating,
  error,
}: RouteStatusBarProps) {
  const hasError = error && !isCalculating
  const hasRate = rate > 0
  const hasSuccess = routeStates.some(s => s.status === 'success')

  let dotColor = 'grey'
  if (isCalculating) dotColor = 'orange'
  else if (hasError) dotColor = 'red'
  else if (hasRate) dotColor = '#4caf50'

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0.25,
      py: 0.5,
      px: 1,
      borderRadius: 1,
      bgcolor: 'action.hover',
    }}>
      {/* Rate display */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        >
          {hasRate
            ? `1 ${stableToken} = ${formatNumber(rate)} ${fiatCurrency}`
            : `${stableToken}/${fiatCurrency} — Enter a value to calculate`
          }
        </Typography>
        {isCalculating && <CircularProgress size={10} thickness={5} />}
      </Box>

      {/* Route indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: dotColor,
            flexShrink: 0,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem',
            opacity: 0.7,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {hasError
            ? `Error: ${error}`
            : hasSuccess
              ? `Route: ${activeRouteLabel}`
              : 'Ready'
          }
        </Typography>
      </Box>
    </Box>
  )
}
