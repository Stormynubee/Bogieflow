/**
 * @typedef {Readonly<{
 *   phase?: 'boot' | 'exit'
 *   progress?: number
 * }>} BootFlowMarkProps
 */

/** Animated ballast-cross-section emblem for the boot intro. */
export default function BootFlowMark({ phase = 'boot', progress = 0 }) {
  const spinDuration = Math.max(2.4, 6 - (progress / 100) * 3.2)

  return (
    <div
      className={`boot-mark ${phase === 'exit' ? 'boot-mark-out' : ''}`}
      aria-hidden="true"
      style={{ '--boot-mark-spin': `${spinDuration}s` }}
    >
      <svg
        className="boot-mark-svg"
        viewBox="0 0 64 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="boot-mark-rail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6b7280" />
            <stop offset="45%" stopColor="#d1d5db" />
            <stop offset="100%" stopColor="#6b7280" />
          </linearGradient>
          <linearGradient id="boot-mark-scan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
          <pattern
            id="boot-mark-hatch"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(24)"
          >
            <line x1="0" y1="0" x2="0" y2="4" stroke="#2a2d36" strokeWidth="0.75" />
          </pattern>
        </defs>

        <rect
          className="boot-mark-frame"
          x="1"
          y="1"
          width="62"
          height="126"
          rx="3"
        />

        <g className="boot-mark-strata">
          <rect x="8" y="88" width="48" height="14" className="boot-mark-layer boot-mark-layer-a" />
          <rect x="8" y="102" width="48" height="12" className="boot-mark-layer boot-mark-layer-b" />
          <rect
            x="8"
            y="114"
            width="48"
            height="10"
            className="boot-mark-layer boot-mark-layer-c"
            fill="url(#boot-mark-hatch)"
          />
        </g>

        <rect className="boot-mark-anomaly" x="36" y="96" width="10" height="10" rx="1" />

        <g className="boot-mark-track">
          <rect x="6" y="74" width="52" height="3" rx="0.5" fill="url(#boot-mark-rail)" />
          <rect x="6" y="80" width="52" height="3" rx="0.5" fill="url(#boot-mark-rail)" />
          {[14, 26, 38, 50].map((x) => (
            <rect
              key={x}
              className="boot-mark-sleeper"
              x={x - 3}
              y="72"
              width="6"
              height="12"
              rx="0.5"
            />
          ))}
        </g>

        <rect className="boot-mark-chassis" x="16" y="54" width="32" height="7" rx="1.5" />

        <g transform="translate(22 62)">
          <g className="boot-mark-wheel boot-mark-wheel-l">
            <circle className="boot-mark-wheel-ring" r="9" />
            <circle className="boot-mark-wheel-hub" r="2.5" />
            {[0, 60, 120].map((deg) => (
              <line
                key={deg}
                className="boot-mark-wheel-spoke"
                x1="0"
                y1="0"
                x2="0"
                y2="-6.5"
                transform={`rotate(${deg})`}
              />
            ))}
          </g>
        </g>

        <g transform="translate(42 62)">
          <g className="boot-mark-wheel boot-mark-wheel-r">
            <circle className="boot-mark-wheel-ring" r="9" />
            <circle className="boot-mark-wheel-hub" r="2.5" />
            {[0, 60, 120].map((deg) => (
              <line
                key={deg}
                className="boot-mark-wheel-spoke"
                x1="0"
                y1="0"
                x2="0"
                y2="-6.5"
                transform={`rotate(${deg})`}
              />
            ))}
          </g>
        </g>

        <rect className="boot-mark-scan" x="10" y="48" width="44" height="18" fill="url(#boot-mark-scan)" />

        <path
          className="boot-mark-telemetry"
          d="M12 44 H52 M12 44 L16 40 M52 44 L48 40"
        />
      </svg>
    </div>
  )
}
