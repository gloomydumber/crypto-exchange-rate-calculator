import { atom } from 'jotai'
import type { CalcInput, CalcValues } from '../types/calc'
import { EMPTY_VALUES } from '../types/calc'
import type { RouteState } from '../routes/types'

export const calcInputAtom = atom<CalcInput>({ field: 'stable', value: '' })

export const calcValuesAtom = atom<CalcValues>(EMPTY_VALUES)

export const effectiveRateAtom = atom<number>(0)

export const fiatPriceAtom = atom<number>(0)

export const stablePriceAtom = atom<number>(0)

export const activeRouteIdAtom = atom<string>('')

export const activeRouteLabelAtom = atom<string>('')

export const routeStatesAtom = atom<RouteState[]>([])

export const isCalculatingAtom = atom<boolean>(false)

export const lastErrorAtom = atom<string>('')
