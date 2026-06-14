import { useEffect, useState } from 'react'

export function formatTicketAge(firstSeenMs) {
  if (!firstSeenMs) return '—'
  const sec = Math.floor((Date.now() - firstSeenMs) / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  return `${hr}h ago`
}

export function useTicketAge(tickets) {
  const [firstSeen, setFirstSeen] = useState({})

  useEffect(() => {
    const now = Date.now()
    setFirstSeen((prev) => {
      let changed = false
      const next = { ...prev }
      for (const t of tickets) {
        if (t.id && !next[t.id]) {
          next[t.id] = now
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [tickets])

  return firstSeen
}
