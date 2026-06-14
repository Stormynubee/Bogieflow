/**
 * Format a numeric value for tabular display.
 * @param {number|null|undefined} value
 * @param {{ decimals?: number, prefix?: string, suffix?: string }} [opts]
 */
export function formatKineticNumber(value, opts = {}) {
  const { decimals = 0, prefix = '', suffix = '' } = opts
  if (value == null || Number.isNaN(Number(value))) {
    return `${prefix}—${suffix}`
  }
  const n = Number(value)
  const formatted =
    decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString('en-US')
  return `${prefix}${formatted}${suffix}`
}

/**
 * Linear interpolation for count-up animation.
 * @param {number} from
 * @param {number} to
 * @param {number} t 0..1
 */
export function lerpKinetic(from, to, t) {
  return from + (to - from) * t
}
