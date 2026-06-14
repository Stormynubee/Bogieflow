import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mutateHeaders } from './apiAuth.js'

describe('mutateHeaders', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_BOGIE_API_SECRET', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns only content-type when secret is unset', () => {
    expect(mutateHeaders()).toEqual({ 'Content-Type': 'application/json' })
  })

  it('includes shared secret header when configured', async () => {
    vi.stubEnv('VITE_BOGIE_API_SECRET', 'frontend-secret')
    vi.resetModules()
    const { mutateHeaders: headersWithSecret } = await import('./apiAuth.js')
    expect(headersWithSecret()).toEqual({
      'Content-Type': 'application/json',
      'X-Bogie-Api-Key': 'frontend-secret',
    })
  })
})
