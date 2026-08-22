import { describe, it, expect } from 'vitest'
import { can, normalizeRole } from './rbac.js'

describe('rbac', () => {
  it('operator can only VIEW', () => {
    expect(can('operator', 'VIEW')).toBe(true)
    expect(can('operator', 'EDIT')).toBe(false)
    expect(can('operator', 'ACTION')).toBe(false)
    expect(can('operator', 'APPROVE')).toBe(false)
    expect(can('operator', 'CONFIGURE')).toBe(false)
  })
  it('maintainer can VIEW/EDIT/ACTION but not APPROVE/CONFIGURE', () => {
    expect(can('maintainer', 'VIEW')).toBe(true)
    expect(can('maintainer', 'EDIT')).toBe(true)
    expect(can('maintainer', 'ACTION')).toBe(true)
    expect(can('maintainer', 'APPROVE')).toBe(false)
    expect(can('maintainer', 'CONFIGURE')).toBe(false)
  })
  it('supervisor can APPROVE', () => {
    expect(can('supervisor', 'APPROVE')).toBe(true)
    expect(can('supervisor', 'CONFIGURE')).toBe(false)
  })
  it('admin can CONFIGURE', () => {
    expect(can('admin', 'CONFIGURE')).toBe(true)
    expect(can('admin', 'ACTION')).toBe(true)
  })
  it('normalizeRole aliases', () => {
    expect(normalizeRole('Operations')).toBe('operator')
    expect(normalizeRole('Maintenance Engineer')).toBe('maintainer')
    expect(normalizeRole('lead')).toBe('supervisor')
    expect(normalizeRole('')).toBe('operator')
  })
})
