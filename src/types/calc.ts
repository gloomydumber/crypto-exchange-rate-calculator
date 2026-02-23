export type ActiveField = 'stable' | 'fiat' | 'crypto'

export interface CalcInput {
  field: ActiveField
  value: string
}

export interface CalcValues {
  stableAmount: string
  fiatAmount: string
  cryptoAmount: string
}

export const EMPTY_VALUES: CalcValues = {
  stableAmount: '',
  fiatAmount: '',
  cryptoAmount: '',
}
