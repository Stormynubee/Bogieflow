import { GUIDE_KNOWLEDGE, GUIDE_FALLBACK } from '../data/guideKnowledge.js'

/**
 * Score keyword overlap for local knowledge retrieval.
 * @param {string} message
 * @param {string[]} keywords
 */
export function keywordScore(message, keywords) {
  const lower = message.toLowerCase()
  let score = 0
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) score += 1
  }
  return score
}

/**
 * @param {string} message
 * @returns {{ answer: string, technical?: string, source: 'local', confidence: number } | null}
 */
export function resolveLocalGuideMessage(message) {
  const trimmed = message?.trim()
  if (!trimmed) return null

  let best = null
  let bestScore = 0

  for (const entry of GUIDE_KNOWLEDGE) {
    const score = keywordScore(trimmed, entry.keywords)
    if (score > bestScore) {
      bestScore = score
      best = entry
    }
  }

  if (!best || bestScore === 0) {
    return {
      answer: GUIDE_FALLBACK,
      source: 'local',
      confidence: 0,
    }
  }

  return {
    answer: best.answer,
    technical: best.technical,
    source: 'local',
    confidence: bestScore,
  }
}

/**
 * @param {string} message
 * @param {{ history?: Array<{ role: string, content: string }> }} [opts]
 */
export async function fetchAiGuideMessage(message, { history = [] } = {}) {
  try {
    const res = await fetch('/api/guide/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.answer) return null
    return {
      answer: data.answer,
      technical: data.technical,
      source: data.source ?? 'ai',
      confidence: 1,
    }
  } catch {
    return null
  }
}

/**
 * Hybrid: local first; AI when local confidence is low and backend supports it.
 * @param {string} message
 * @param {{ preferAi?: boolean, history?: Array<{ role: string, content: string }> }} [opts]
 */
export async function resolveGuideMessage(message, { preferAi = false, history = [] } = {}) {
  const local = resolveLocalGuideMessage(message)

  if (preferAi) {
    const ai = await fetchAiGuideMessage(message, { history })
    if (ai) return ai
  }

  if (local && local.confidence >= 2) return local

  const ai = await fetchAiGuideMessage(message, { history })
  if (ai) return ai

  return local ?? { answer: GUIDE_FALLBACK, source: 'local', confidence: 0 }
}
