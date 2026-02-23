import { useEffect, useRef, useCallback } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import {
  calcInputAtom,
  calcValuesAtom,
  effectiveRateAtom,
  fiatPriceAtom,
  stablePriceAtom,
  activeRouteIdAtom,
  activeRouteLabelAtom,
  routeStatesAtom,
  isCalculatingAtom,
  lastErrorAtom,
} from '../store/rateAtoms'
import {
  pairAtom,
  exchangeAIdAtom,
  exchangeBIdAtom,
  bridgeCryptoAtom,
  stableTokenAtom,
  enabledRouteIdsAtom,
} from '../store/configAtoms'
import { isFiatToFiat } from '../types/config'
import { useDebounce } from './useDebounce'
import { getDefaultRoutes } from '../routes/presets'
import { executeRouteChain } from '../routes/route-executor'
import { getAdapterById } from '../exchanges/registry'
import type { ActiveField } from '../types/calc'
import type { CalcConfig } from '../types/config'
import type { Route } from '../routes/types'
import { formatNumber } from '../utils/format'

async function fetchBridgePricesTwoSides(
  bridgeCrypto: string,
  currencyA: string,
  currencyB: string,
  exchangeAId: string,
  exchangeBId: string,
  signal?: AbortSignal,
): Promise<{ priceA: number; priceB: number }> {
  const adapterA = getAdapterById(exchangeAId)
  const adapterB = getAdapterById(exchangeBId)
  if (!adapterA || !adapterB) {
    throw new Error(`Exchange not found: ${!adapterA ? exchangeAId : exchangeBId}`)
  }

  const marketA = adapterA.buildMarketSymbol(bridgeCrypto, currencyA)
  const marketB = adapterB.buildMarketSymbol(bridgeCrypto, currencyB)

  const [resultA, resultB] = await Promise.all([
    adapterA.fetchPrice(marketA, signal),
    adapterB.fetchPrice(marketB, signal),
  ])

  return {
    priceA: resultA.price,
    priceB: resultB.price,
  }
}

export function useExchangeCalc() {
  const [calcInput, setCalcInput] = useAtom(calcInputAtom)
  const [calcValues, setCalcValues] = useAtom(calcValuesAtom)
  const [effectiveRate, setEffectiveRate] = useAtom(effectiveRateAtom)
  const [fiatPrice, setFiatPrice] = useAtom(fiatPriceAtom)
  const [stablePrice, setStablePrice] = useAtom(stablePriceAtom)
  const [activeRouteId, setActiveRouteId] = useAtom(activeRouteIdAtom)
  const [activeRouteLabel, setActiveRouteLabel] = useAtom(activeRouteLabelAtom)
  const [routeStates, setRouteStates] = useAtom(routeStatesAtom)
  const [isCalculating, setIsCalculating] = useAtom(isCalculatingAtom)
  const [lastError, setLastError] = useAtom(lastErrorAtom)

  const pair = useAtomValue(pairAtom)
  const exchangeAId = useAtomValue(exchangeAIdAtom)
  const exchangeBId = useAtomValue(exchangeBIdAtom)
  const bridgeCrypto = useAtomValue(bridgeCryptoAtom)
  const stableToken = useAtomValue(stableTokenAtom)
  const enabledRouteIds = useAtomValue(enabledRouteIdsAtom)

  const abortRef = useRef<AbortController | null>(null)
  const debouncedInput = useDebounce(calcInput, 400)
  const isFiatFiat = isFiatToFiat(pair)

  const updateField = useCallback((field: ActiveField, value: string) => {
    setCalcInput({ field, value })
    setCalcValues(prev => {
      const next = { ...prev }
      if (field === 'stable') next.stableAmount = value
      else if (field === 'fiat') next.fiatAmount = value
      else next.cryptoAmount = value
      return next
    })
  }, [setCalcInput, setCalcValues])

  useEffect(() => {
    const { field, value } = debouncedInput
    if (!value || Number(value) === 0) {
      setCalcValues({ stableAmount: '', fiatAmount: '', cryptoAmount: '' })
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const config: CalcConfig = {
      pair,
      exchangeAId,
      exchangeBId,
      bridgeCrypto,
      stableToken,
      enabledRouteIds,
    }

    const routes = getDefaultRoutes(config)

    setIsCalculating(true)
    setLastError('')

    const findLabel = (routes: Route[], id: string) =>
      routes.find(r => r.id === id)?.label ?? id

    // Determine currencies for bridge price fetch
    const currencyA = pair.fiat
    const currencyB = isFiatFiat ? pair.stable : stableToken

    Promise.all([
      executeRouteChain(routes, enabledRouteIds, controller.signal),
      fetchBridgePricesTwoSides(
        bridgeCrypto, currencyA, currencyB,
        exchangeAId, exchangeBId,
        controller.signal,
      ),
    ])
      .then(([routeResult, bridgePrices]) => {
        if (controller.signal.aborted) return

        const { priceA, priceB } = bridgePrices
        const rate = routeResult.rate

        setEffectiveRate(rate)
        setFiatPrice(priceA)
        setStablePrice(priceB)
        setActiveRouteId(routeResult.activeRouteId)
        setActiveRouteLabel(findLabel(routes, routeResult.activeRouteId))
        setRouteStates(routeResult.routeStates)

        const num = Number(value)

        if (field === 'stable') {
          // Top field (stable token or fiatB)
          setCalcValues({
            stableAmount: value,
            fiatAmount: formatNumber(num * rate),
            cryptoAmount: formatNumber(num / priceB),
          })
        } else if (field === 'fiat') {
          // Middle field (fiatA)
          setCalcValues({
            stableAmount: formatNumber(num / rate),
            fiatAmount: value,
            cryptoAmount: formatNumber(num / priceA),
          })
        } else {
          // Bottom field (bridge crypto)
          setCalcValues({
            stableAmount: formatNumber(num * priceB),
            fiatAmount: formatNumber(num * priceA),
            cryptoAmount: value,
          })
        }

        setIsCalculating(false)
      })
      .catch(err => {
        if (controller.signal.aborted) return
        setLastError((err as Error).message)
        setIsCalculating(false)
      })

    return () => {
      controller.abort()
    }
  }, [
    debouncedInput, isFiatFiat,
    pair, exchangeAId, exchangeBId,
    bridgeCrypto, stableToken, enabledRouteIds,
    setCalcValues, setEffectiveRate, setFiatPrice, setStablePrice,
    setActiveRouteId, setActiveRouteLabel, setRouteStates, setIsCalculating, setLastError,
  ])

  return {
    calcValues,
    effectiveRate,
    fiatPrice,
    stablePrice,
    activeRouteId,
    activeRouteLabel,
    routeStates,
    isCalculating,
    lastError,
    updateField,
    pair,
    bridgeCrypto,
    stableToken,
    isFiatFiat,
  }
}
