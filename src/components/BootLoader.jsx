import { useState, useEffect } from 'react'

export default function BootLoader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState([])
  const [complete, setComplete] = useState(false)

  const diagnosticSteps = [
    { time: 300, msg: 'BF_SYSTEMS CORE: INITIALIZATION SEQUENCE INITIATED...' },
    { time: 700, msg: 'WEBGL_PIPELINE: COMPILING SHADERS & GEOMETRY...' },
    { time: 1200, msg: 'WEBGL_PIPELINE: TRACK_MODEL & BOGIE_MODEL LOADED [OK]' },
    { time: 1800, msg: 'ML_ENGINE: GRADIENT_BOOSTING MODEL WEIGHTS VERIFIED [OK]' },
    { time: 2400, msg: 'WEBSOCKET_BRIDGE: ESTABLISHING LINK TO FASTAPI...' },
    { time: 3000, msg: 'WEBSOCKET_BRIDGE: LINK ESTABLISHED [OK]' },
    { time: 3500, msg: 'SYSTEM_STATUS: ALL MULTI-AGENT CORRIDORS OPERATIONAL [NOMINAL]' },
  ]

  useEffect(() => {
    // Animate progress bar
    const duration = 4000
    const intervalTime = 50
    const step = 100 / (duration / intervalTime)

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + step)
        if (next >= 100) {
          clearInterval(timer)
          setComplete(true)
        }
        return next
      })
    }, intervalTime)

    // Staggered logs
    const logTimers = diagnosticSteps.map((step) => {
      return setTimeout(() => {
        setLogs((prev) => [...prev, step.msg])
      }, step.time)
    })

    return () => {
      clearInterval(timer)
      logTimers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div className="boot-overlay" role="dialog" aria-modal="true" aria-label="System Boot Sequence">
      <div className="boot-grid" aria-hidden="true" />
      <div className="boot-card">
        <header className="boot-header">
          <span className="boot-tag">BF_SYSTEMS // SECURE_BOOT</span>
          <span className="boot-ver">v1.2.0</span>
        </header>

        <div className="boot-terminal">
          <ul className="boot-log-list">
            {logs.map((log, idx) => (
              <li key={idx} className="boot-log-item">
                <span className="boot-prefix">&gt;&gt;</span> {log}
              </li>
            ))}
          </ul>
        </div>

        <div className="boot-progress-section">
          <div className="boot-progress-meta">
            <span className="boot-loading-text">
              {complete ? 'SYSTEMS LOADED' : 'EXECUTING DIAGNOSTIC MODULES...'}
            </span>
            <span className="boot-percent">{Math.round(progress)}%</span>
          </div>
          <div className="boot-progress-track">
            <div className="boot-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="boot-action-area">
          <button
            type="button"
            className={`btn-engage ${complete ? 'engage-ready' : ''}`}
            onClick={complete ? onComplete : undefined}
            disabled={!complete}
          >
            {complete ? 'ENGAGE COMMAND CENTER' : 'INITIALIZING TELEMETRY...'}
          </button>
        </div>
      </div>
    </div>
  )
}
