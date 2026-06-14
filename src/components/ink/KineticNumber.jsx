import { useEffect, useRef, useState } from 'react'
import { formatKineticNumber, lerpKinetic } from '../../lib/kineticNumber.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

export default function KineticNumber({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 480,
  className = '',
  'data-testid': testId,
}) {
  const reduced = usePrefersReducedMotion()
  const [display, setDisplay] = useState(value ?? 0)
  const fromRef = useRef(value ?? 0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (value == null || Number.isNaN(Number(value))) {
      setDisplay(value)
      return undefined
    }

    const target = Number(value)
    if (reduced) {
      setDisplay(target)
      fromRef.current = target
      return undefined
    }

    const from = fromRef.current
    if (from === target) {
      setDisplay(target)
      return undefined
    }

    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      setDisplay(lerpKinetic(from, target, eased))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration, reduced])

  const text =
    display == null || Number.isNaN(Number(display))
      ? formatKineticNumber(null, { prefix, suffix })
      : formatKineticNumber(display, { decimals, prefix, suffix })

  return (
    <span
      className={`ink-kinetic ${className}`.trim()}
      data-testid={testId}
    >
      {text}
    </span>
  )
}
