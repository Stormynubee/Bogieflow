import { describe, it, expect } from 'vitest'
import { parseWebSocketMessage } from './wsMessage.js'

describe('parseWebSocketMessage', () => {
  it('parses valid JSON frames', () => {
    const result = parseWebSocketMessage('{"type":"state_snapshot","segments":[]}')
    expect(result.ok).toBe(true)
    expect(result.message.type).toBe('state_snapshot')
  })

  it('returns ok false for malformed JSON without throwing', () => {
    const result = parseWebSocketMessage('not-json{')
    expect(result.ok).toBe(false)
    expect(result.message).toBeUndefined()
  })
})
