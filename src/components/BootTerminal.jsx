import { BOOT_LOG_LINES } from '../data/bootLogs.js'

/**
 * @typedef {Readonly<{
 *   completedCount?: number
 *   progress?: number
 *   phase?: 'boot' | 'ready' | 'exit'
 *   countdown?: number
 * }>} BootTerminalProps
 */

/** Startup log panel — replaces the boot 3D preview. */
export default function BootTerminal({
  completedCount = 0,
  progress = 0,
  phase = 'boot',
  countdown = 3,
}) {
  const loading = phase === 'boot' && completedCount < BOOT_LOG_LINES.length
  const statusLabel =
    phase === 'exit'
      ? 'Entering dashboard'
      : phase === 'ready'
        ? `Ready · auto in ${countdown}s`
        : progress >= 98
          ? 'Ready'
          : 'Initializing corridor'

  return (
    <section className={`boot-terminal ${phase === 'exit' ? 'boot-terminal-out' : ''}`} aria-label="Startup log">
      <header className="boot-terminal-head">
        <div className="boot-terminal-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="boot-terminal-title">corridor-init</span>
        <span className="boot-terminal-pct">{Math.round(progress)}%</span>
      </header>

      <ol className="boot-terminal-log">
        {BOOT_LOG_LINES.map((line, index) => {
          const done = index < completedCount
          const active = index === completedCount && loading
          const pending = index > completedCount

          return (
            <li
              key={line.id}
              className={`boot-term-line ${done ? 'boot-term-done' : ''} ${active ? 'boot-term-active' : ''} ${pending ? 'boot-term-pending' : ''}`}
            >
              <span className="boot-term-status" aria-hidden="true">
                {done ? 'ok' : active ? '···' : '—'}
              </span>
              <span className="boot-term-module">{line.module}</span>
              <span className="boot-term-message">
                {line.message}
                {active && (
                  <span className="boot-term-cursor" aria-hidden="true">
                    ▋
                  </span>
                )}
              </span>
            </li>
          )
        })}
      </ol>

      <footer className="boot-terminal-foot">
        <div className="boot-progress-track" aria-hidden="true">
          <div className="boot-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="boot-terminal-status">{statusLabel}</span>
      </footer>
    </section>
  )
}
