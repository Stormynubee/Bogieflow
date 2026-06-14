export function progressToPercent(progress, frameCount) {
  const max = Math.max(1, frameCount - 1)
  return Math.min(100, Math.max(0, (progress / max) * 100))
}

export function formatFrameReadout(frame, frameCount) {
  return `${frame} / ${frameCount}`
}
