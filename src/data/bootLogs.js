/** @typedef {{ id: string, module: string, message: string, at: number }} BootLogLine */

/** @type {readonly BootLogLine[]} */
export const BOOT_LOG_LINES = [
  { id: 'link', module: 'corridor', message: 'telemetry bridge open', at: 450 },
  { id: 'track', module: 'track', message: 'geometry compiled', at: 480 },
  { id: 'bogie', module: 'bogie', message: 'wheel pair mounted', at: 960 },
  { id: 'segments', module: 'segments', message: 'S1–S6 baseline nominal', at: 1440 },
  { id: 'stream', module: 'telemetry', message: 'live packets streaming', at: 2100 },
  { id: 'handoff', module: 'dashboard', message: 'overview ready', at: 2900 },
]
