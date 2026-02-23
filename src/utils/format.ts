/**
 * Format a number for display, avoiding scientific notation.
 * Preserves meaningful decimal places.
 */
export function formatNumber(num: number): string {
  if (num === 0) return '0'
  if (!isFinite(num)) return ''

  const abs = Math.abs(num)

  // Very small numbers (crypto amounts like 0.00001234)
  if (abs < 0.01) {
    return num.toFixed(8).replace(/0+$/, '').replace(/\.$/, '')
  }

  // Small numbers (crypto amounts like 0.12345)
  if (abs < 1) {
    return num.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
  }

  // Medium numbers (1 - 999)
  if (abs < 1000) {
    return num.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
  }

  // Large numbers — use locale formatting with 2 decimals
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Parse a formatted number string back to a number.
 * Removes commas and whitespace.
 */
export function parseFormattedNumber(str: string): number {
  const cleaned = str.replace(/,/g, '').trim()
  const num = Number(cleaned)
  return isNaN(num) ? 0 : num
}
