import { useMemo } from 'react'
import { Box, Typography, Switch, FormLabel } from '@mui/material'
import { useAtomValue } from 'jotai'
import { pairAtom, exchangeAIdAtom, exchangeBIdAtom, bridgeCryptoAtom, stableTokenAtom } from '../../store/configAtoms'
import { getDefaultRoutes } from '../../routes/presets'
import type { Route } from '../../routes/types'

interface FallbackChainEditorProps {
  enabledRouteIds: string[]
  onChange: (ids: string[]) => void
}

export function FallbackChainEditor({ enabledRouteIds, onChange }: FallbackChainEditorProps) {
  const pair = useAtomValue(pairAtom)
  const exchangeAId = useAtomValue(exchangeAIdAtom)
  const exchangeBId = useAtomValue(exchangeBIdAtom)
  const bridgeCrypto = useAtomValue(bridgeCryptoAtom)
  const stableToken = useAtomValue(stableTokenAtom)

  const routes = useMemo(() => {
    return getDefaultRoutes({
      pair,
      exchangeAId,
      exchangeBId,
      bridgeCrypto,
      stableToken,
      enabledRouteIds: [],
    })
  }, [pair, exchangeAId, exchangeBId, bridgeCrypto, stableToken])

  const allEnabled = enabledRouteIds.length === 0 // empty means all enabled

  const toggle = (route: Route) => {
    if (allEnabled) {
      // Switch from "all enabled" to "all except this one"
      onChange(routes.filter(r => r.id !== route.id).map(r => r.id))
    } else {
      const isEnabled = enabledRouteIds.includes(route.id)
      if (isEnabled) {
        const next = enabledRouteIds.filter(id => id !== route.id)
        onChange(next.length === 0 ? [] : next) // empty = all enabled
      } else {
        onChange([...enabledRouteIds, route.id])
      }
    }
  }

  const isRouteEnabled = (routeId: string) => {
    if (allEnabled) return true
    return enabledRouteIds.includes(routeId)
  }

  return (
    <Box>
      <FormLabel sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
        Fallback Chain
      </FormLabel>
      <Box className="cerc-scroller" sx={{ maxHeight: 200, overflow: 'auto' }}>
        {routes.map((route, i) => (
          <Box
            key={route.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 0.25,
              px: 0.5,
              borderRadius: 0.5,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem',
                opacity: isRouteEnabled(route.id) ? 1 : 0.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                mr: 1,
              }}
            >
              {i + 1}. {route.label}
            </Typography>
            <Switch
              size="small"
              checked={isRouteEnabled(route.id)}
              onChange={() => toggle(route)}
            />
          </Box>
        ))}
        {routes.length === 0 && (
          <Typography variant="caption" sx={{ opacity: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>
            No routes available for current config
          </Typography>
        )}
      </Box>
    </Box>
  )
}
