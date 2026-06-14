import { useState, useEffect, useRef, useCallback } from 'react'
import BootFlowMark from './BootFlowMark'
import BootTerminal from './BootTerminal'
import BootContinueButton from './BootContinueButton'
import { BOOT_LOG_LINES } from '../data/bootLogs.js'

const BOOT_MS = 3200
const AUTO_MS = 3000
const FADE_MS = 420

export default function BootLoader({ onComplete }) {
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const handoffStartedRef = useRef(false)

  const [completedCount, setCompletedCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('boot')
  const [countdown, setCountdown] = useState(3)

  const handoff = useCallback(() => {
    if (handoffStartedRef.current) return
    handoffStartedRef.current = true
    setPhase('exit')
    window.setTimeout(() => onCompleteRef.current?.(), FADE_MS)
  }, [])

  useEffect(() => {
    const stepTimers = BOOT_LOG_LINES.map(({ at }, index) =>
      window.setTimeout(() => setCompletedCount(index + 1), at),
    )

    const started = Date.now()
    const progressTimer = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - started) / BOOT_MS) * 100)
      setProgress(pct)
    }, 40)

    const readyTimer = window.setTimeout(() => {
      setCompletedCount(BOOT_LOG_LINES.length)
      setProgress(100)
      setPhase('ready')
    }, BOOT_MS)

    return () => {
      stepTimers.forEach(clearTimeout)
      clearInterval(progressTimer)
      clearTimeout(readyTimer)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'ready') return

    setCountdown(3)
    const autoTimer = window.setTimeout(handoff, AUTO_MS)
    const tickTimer = window.setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => {
      clearTimeout(autoTimer)
      clearInterval(tickTimer)
    }
  }, [phase, handoff])

  return (
    <div
      className={`boot-screen ${phase === 'exit' ? 'boot-screen-out' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Bogieflow"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="boot-shell">
        <header className="boot-brand">
          <BootFlowMark phase={phase} progress={progress} />
          <div className="boot-brand-copy">
            <h1 className="boot-title">Bogieflow</h1>
            <p className="boot-tagline">
              Others monitor the rail.
              <br />
              We monitor the ballast.
            </p>
          </div>
        </header>

        <BootTerminal
          completedCount={completedCount}
          progress={progress}
          phase={phase}
          countdown={countdown}
        />

        <BootContinueButton
          visible={phase === 'ready' || phase === 'exit'}
          countdown={countdown}
          onContinue={handoff}
        />
      </div>
    </div>
  )
}
