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
    const h = mutateHeaders()
    expect(h['Content-Type']).toBe('application/json')
    expect(h['X-Role']).toBeDefined()
    expect(h['X-User']).toBeDefined()
  })

  it('includes shared secret header when configured', async () => {
    vi.stubEnv('VITE_BOGIE_API_SECRET', 'frontend-secret')
    vi.resetModules()
    const { mutateHeaders: headersWithSecret } = await import('./apiAuth.js')
    const h = headersWithSecret()
    expect(h['Content-Type']).toBe('application/json')
    expect(h['X-Bogie-Api-Key']).toBe('frontend-secret')
    expect(h['X-Role']).toBeDefined()
    expect(h['X-User']).toBeDefined()
  })
})
