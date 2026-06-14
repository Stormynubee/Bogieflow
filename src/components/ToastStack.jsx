export default function ToastStack({ toasts = [] }) {
  if (!toasts.length) return null
  return (
    <div className="toast-stack" aria-live="polite" data-testid="toast-stack">
      {toasts.map((t) => (
        <p key={t.id} className={`toast-item toast-${t.tone ?? 'info'}`}>
          {t.message}
        </p>
      ))}
    </div>
  )
}
