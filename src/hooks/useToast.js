import { useCallback, useRef, useState } from 'react'

let toastSeq = 0

export function useToast() {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
  }, [])

  const push = useCallback(
    (message, tone = 'info', durationMs = 2600) => {
      const id = ++toastSeq
      setToasts((prev) => [...prev.slice(-2), { id, message, tone }])
      const timer = setTimeout(() => dismiss(id), durationMs)
      timers.current.set(id, timer)
    },
    [dismiss],
  )

  return { toasts, push, dismiss }
}
