import { progressToBlendParts } from './corridorScrub.js'

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement} img
 * @param {number} w
 * @param {number} h
 */
export function drawCoverImage(ctx, img, w, h) {
  const scale = Math.max(w / img.width, h / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  const dx = (w - dw) / 2
  const dy = (h - dh) / 2
  ctx.drawImage(img, dx, dy, dw, dh)
}

/** Letterbox fit — shows full frame without cropping (preferred for corridor scrub). */
export function drawContainImage(ctx, img, w, h) {
  const scale = Math.min(w / img.width, h / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  const dx = (w - dw) / 2
  const dy = (h - dh) / 2
  ctx.drawImage(img, dx, dy, dw, dh)
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement[]} images
 * @param {number} progress
 * @param {number} w
 * @param {number} h
 * @param {number} count
 */
export function drawBlendedFrame(ctx, images, progress, w, h, count) {
  const { indexA, indexB, blend } = progressToBlendParts(progress, count)
  const imgA = images[indexA]
  if (!imgA) return

  ctx.fillStyle = '#0a0a0b'
  ctx.fillRect(0, 0, w, h)
  drawContainImage(ctx, imgA, w, h)

  if (blend > 0.001 && indexB !== indexA) {
    const imgB = images[indexB]
    if (imgB) {
      ctx.globalAlpha = blend
      drawContainImage(ctx, imgB, w, h)
      ctx.globalAlpha = 1
    }
  }
}
