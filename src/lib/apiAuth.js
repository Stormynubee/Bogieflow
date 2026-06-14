/** Shared secret header for mutating backend routes. */

export function mutateHeaders(extra = {}) {
  const secret = import.meta.env.VITE_BOGIE_API_SECRET ?? ''
  const headers = {
    'Content-Type': 'application/json',
    ...extra,
  }
  if (secret) {
    headers['X-Bogie-Api-Key'] = secret
  }
  return headers
}
