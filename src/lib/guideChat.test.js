import { describe, it, expect } from 'vitest'
import { keywordScore, resolveLocalGuideMessage } from './guideChat.js'

describe('guideChat', () => {
  it('scores keyword overlap', () => {
    expect(keywordScore('how do I scrub frames', ['scrub', 'frame'])).toBe(2)
    expect(keywordScore('hello', ['scrub'])).toBe(0)
  })

  it('resolves scrub questions locally', () => {
    const result = resolveLocalGuideMessage('How do I scrub the corridor?')
    expect(result?.source).toBe('local')
    expect(result?.confidence).toBeGreaterThan(0)
    expect(result?.answer).toMatch(/64/)
  })

  it('returns fallback for unknown topics', () => {
    const result = resolveLocalGuideMessage('xyzzy plugh')
    expect(result?.confidence).toBe(0)
    expect(result?.answer).toMatch(/guided tour/i)
  })

  it('explains P1 tickets', () => {
    const result = resolveLocalGuideMessage('What is P1?')
    expect(result?.answer).toMatch(/urgent/i)
    expect(result?.technical).toMatch(/P1/)
  })
})
