export const ROLES = ['operator', 'maintainer', 'supervisor', 'admin']

export const ROLE_LABELS = {
  operator: 'Operations / Control Room',
  maintainer: 'Maintenance Engineer',
  supervisor: 'Supervisor / Lead',
  admin: 'Admin / System Engineer',
}

export const ROLE_PERMS = {
  operator: new Set(['VIEW']),
  maintainer: new Set(['VIEW', 'EDIT', 'ACTION']),
  supervisor: new Set(['VIEW', 'EDIT', 'ACTION', 'APPROVE']),
  admin: new Set(['VIEW', 'EDIT', 'ACTION', 'APPROVE', 'CONFIGURE']),
}

export const ROLE_HOME = {
  operator: 'overview',
  maintainer: 'maintenance',
  supervisor: 'maintenance',
  admin: 'climate',
}

export const ROLE_VIEWS = {
  operator: ['overview', 'analysis'],
  maintainer: ['overview', 'analysis', 'maintenance'],
  supervisor: ['overview', 'analysis', 'maintenance'],
  admin: ['overview', 'analysis', 'maintenance', 'climate'],
}

export function normalizeRole(role) {
  if (!role) return 'operator'
  const r = String(role).trim().toLowerCase()
  const aliases = {
    operations: 'operator',
    'control room': 'operator',
    control: 'operator',
    engineer: 'maintainer',
    maintenance: 'maintainer',
    'maintenance engineer': 'maintainer',
    maintainer: 'maintainer',
    lead: 'supervisor',
    supervisor: 'supervisor',
    admin: 'admin',
    system: 'admin',
    'system engineer': 'admin',
  }
  if (ROLE_PERMS[r]) return r
  return aliases[r] || 'operator'
}

export function can(role, perm) {
  const r = normalizeRole(role)
  return ROLE_PERMS[r]?.has(perm) ?? false
}

export function canResource(role, resource) {
  const map = {
    track_map: 'VIEW',
    risk_gauge: 'VIEW',
    telemetry: 'VIEW',
    logs: 'VIEW',
    queue: 'VIEW',
    evidence: 'VIEW',
    ticket_ack: 'EDIT',
    ticket_status: 'EDIT',
    ticket_notes: 'EDIT',
    ticket_action: 'ACTION',
    ticket_approve: 'APPROVE',
    ticket_assign: 'APPROVE',
    ticket_close: 'APPROVE',
    user_roles: 'CONFIGURE',
    thresholds: 'CONFIGURE',
    system_settings: 'CONFIGURE',
    audit_logs: 'CONFIGURE',
    model_version: 'CONFIGURE',
    inject: 'ACTION',
    reset: 'CONFIGURE',
    weather_mode: 'CONFIGURE',
  }
  const perm = map[resource]
  if (!perm) return can(role, 'VIEW')
  return can(role, perm)
}

export const STORAGE_KEY = 'bogie-role'
export const STORAGE_CHOSEN = 'bogie-role-chosen'
export function getStoredRole() {
  try {
    return normalizeRole(localStorage.getItem(STORAGE_KEY) || 'operator')
  } catch {
    return 'operator'
  }
}
export function hasChosenRole() {
  try {
    return localStorage.getItem(STORAGE_CHOSEN) === '1'
  } catch {
    return false
  }
}
export function setStoredRole(role) {
  try {
    localStorage.setItem(STORAGE_KEY, normalizeRole(role))
    localStorage.setItem(STORAGE_CHOSEN, '1')
    window.dispatchEvent(new CustomEvent('bogie:role-change', { detail: normalizeRole(role) }))
  } catch {}
}
export function clearChosen() {
  try {
    localStorage.removeItem(STORAGE_CHOSEN)
  } catch {}
}
