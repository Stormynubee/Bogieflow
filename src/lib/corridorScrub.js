export function clampFrameIndex(index, count) {
  return Math.max(0, Math.min(count - 1, index))
}

export function clampProgress(progress, count) {
  const max = Math.max(0, count - 1)
  return Math.max(0, Math.min(max, progress))
}

export function progressToBlendParts(progress, count) {
  const max = Math.max(0, count - 1)
  const p = clampProgress(progress, count)
  const indexA = Math.floor(p)
  const indexB = Math.min(indexA + 1, max)
  const blend = indexA === indexB ? 0 : p - indexA
  return { indexA, indexB, blend }
}

export function xToFrameIndex(clientX, rectLeft, rectWidth, count) {
  return Math.round(xToProgress(clientX, rectLeft, rectWidth, count))
}

export function xToProgress(clientX, rectLeft, rectWidth, count) {
  if (rectWidth <= 0 || count <= 1) return 0
  const x = clientX - rectLeft
  const t = Math.max(0, Math.min(1, x / rectWidth))
  return t * (count - 1)
}

/** @deprecated use wheelDeltaToProgress */
export function wheelDeltaToIndex(current, deltaY, count) {
  const step = deltaY > 0 ? 1 : deltaY < 0 ? -1 : 0
  return clampFrameIndex(current + step, count)
}

export function wheelDeltaToProgress(deltaY, sensitivity = 0.035) {
  if (!deltaY) return 0
  return deltaY * sensitivity
}

export function pageScrollProgress(scrollEl) {
  if (!scrollEl) return 0
  const max = scrollTravel(scrollEl)
  if (max <= 0) return 0
  return Math.max(0, Math.min(1, scrollEl.scrollTop / max))
}

export function scrollTravel(scrollEl) {
  if (!scrollEl) return 0
  return Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight)
}

export function progressToPageScrollTop(scrollEl, normalizedProgress) {
  if (!scrollEl) return 0
  const max = scrollTravel(scrollEl)
  return Math.max(0, Math.min(max, normalizedProgress * max))
}

/**
 * @param {HTMLElement} element
 * @param {HTMLElement} scrollContainer
 */
export function getContentTop(element, scrollContainer) {
  return (
    scrollContainer.scrollTop +
    element.getBoundingClientRect().top -
    scrollContainer.getBoundingClientRect().top
  )
}

/**
 * Scroll progress (0–1) for a tall shell with a sticky viewport inside a scroll container.
 * @param {HTMLElement} shellEl
 * @param {HTMLElement} scrollEl
 * @param {HTMLElement} stickyEl
 */
export function scrollDriveProgress(shellEl, scrollEl, stickyEl) {
  if (!shellEl || !scrollEl || !stickyEl) return 0
  const travel = Math.max(1, shellEl.offsetHeight - stickyEl.offsetHeight)
  const shellTop = getContentTop(shellEl, scrollEl)
  const raw = scrollEl.scrollTop - shellTop
  return Math.max(0, Math.min(1, raw / travel))
}

export function progressToScrollTop(shellEl, stickyEl, scrollEl, progress) {
  if (!shellEl || !scrollEl || !stickyEl) return 0
  const travel = Math.max(1, shellEl.offsetHeight - stickyEl.offsetHeight)
  const shellTop = getContentTop(shellEl, scrollEl)
  return shellTop + progress * travel
}

export const MIN_SHELL_DRIVE_TRAVEL = 24

export function shellDriveTravel(shellEl, stickyEl) {
  if (!shellEl || !stickyEl) return 0
  return Math.max(0, shellEl.offsetHeight - stickyEl.offsetHeight)
}

/**
 * Normalized scroll progress (0–1) for corridor frame drive.
 * Prefers sticky shell travel; falls back to full page scroll travel.
 * @param {HTMLElement | null | undefined} scrollEl
 * @param {{ shellEl?: HTMLElement | null, stickyEl?: HTMLElement | null }} [opts]
 * @returns {number | null}
 */
export function readScrollDriveProgress(scrollEl, { shellEl, stickyEl } = {}) {
  if (!scrollEl) return null

  const pageTravel = scrollTravel(scrollEl)
  if (pageTravel >= 1) {
    return pageScrollProgress(scrollEl)
  }

  const shellTravel = shellDriveTravel(shellEl, stickyEl)
  if (shellEl && stickyEl && shellTravel >= MIN_SHELL_DRIVE_TRAVEL) {
    return scrollDriveProgress(shellEl, scrollEl, stickyEl)
  }

  return null
}

/**
 * @param {HTMLElement | null | undefined} scrollEl
 * @param {number} normalizedProgress
 * @param {{ shellEl?: HTMLElement | null, stickyEl?: HTMLElement | null }} [opts]
 */
export function progressToScrollDriveTop(scrollEl, normalizedProgress, { shellEl, stickyEl } = {}) {
  if (!scrollEl) return 0

  const pageTravel = scrollTravel(scrollEl)
  if (pageTravel >= 1) {
    return progressToPageScrollTop(scrollEl, normalizedProgress)
  }

  const shellTravel = shellDriveTravel(shellEl, stickyEl)
  if (shellEl && stickyEl && shellTravel >= MIN_SHELL_DRIVE_TRAVEL) {
    return progressToScrollTop(shellEl, stickyEl, scrollEl, normalizedProgress)
  }

  return progressToPageScrollTop(scrollEl, normalizedProgress)
}

/** @param {HTMLElement | null | undefined} scrollEl */
export function scrollDriveAvailable(scrollEl, { shellEl, stickyEl } = {}) {
  if (!scrollEl) return false
  if (shellEl && stickyEl && shellDriveTravel(shellEl, stickyEl) >= MIN_SHELL_DRIVE_TRAVEL) {
    return true
  }
  return scrollTravel(scrollEl) >= 1
}

export function findScrollParent(el) {
  let node = el?.parentElement ?? null
  while (node) {
    const style = getComputedStyle(node)
    if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflowY === 'overlay') {
      // overflow-x:hidden can compute overflow-y:auto without real scroll travel — keep walking up
      if (scrollTravel(node) >= 1) {
        return node
      }
    }
    node = node.parentElement
  }
  return document.documentElement
}
