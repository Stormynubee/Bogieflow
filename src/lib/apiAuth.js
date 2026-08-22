/** Shared secret header for mutating backend routes + RBAC identity. */
import { getStoredRole } from './rbac.js'

export function mutateHeaders(extra = {}) {
  const secret = import.meta.env.VITE_BOGIE_API_SECRET ?? ''
  const headers = {
    'Content-Type': 'application/json',
    ...extra,
  }
  if (secret) {
    headers['X-Bogie-Api-Key'] = secret
  }
  try {
    const role = getStoredRole()
    headers['X-Role'] = role
    headers['X-User'] = `${role}@local`
  } catch {}
  return headers
}

export function viewHeaders(extra = {}) {
  try {
    return { 'X-Role': getStoredRole(), 'X-User': `${getStoredRole()}@local`, ...extra }
  } catch {
    return extra
  }
}
