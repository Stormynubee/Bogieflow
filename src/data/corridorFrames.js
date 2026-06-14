/** Canonical corridor frame sequence (ordered export from ezgif). */
export const CORRIDOR_FRAME_COUNT = 64
export const CORRIDOR_FRAME_EXT = 'jpg'

export function corridorFrameUrl(index) {
  const n = String(index + 1).padStart(3, '0')
  return `/corridor-frames/frame-${n}.${CORRIDOR_FRAME_EXT}`
}

export function corridorFrameUrls() {
  return Array.from({ length: CORRIDOR_FRAME_COUNT }, (_, i) => corridorFrameUrl(i))
}
