import { useEffect, useRef, useState } from 'react'
import { getStoredRole, setStoredRole } from '../lib/rbac.js'

const OPTIONS = [
  { value: 'operator', label: 'Operator', sub: 'VIEW · Monitor only' },
  { value: 'maintainer', label: 'Maintenance', sub: 'VIEW + EDIT · Operate' },
  { value: 'supervisor', label: 'Supervisor', sub: 'APPROVE · Authorize' },
  { value: 'admin', label: 'Admin', sub: 'CONFIGURE · Full control' },
]

export default function RoleSelect() {
  const [role, setRole] = useState(() => getStoredRole())
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => setRole(e.detail || getStoredRole())
    window.addEventListener('bogie:role-change', h)
    return () => window.removeEventListener('bogie:role-change', h)
  }, [])

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const current = OPTIONS.find((o) => o.value === role) || OPTIONS[0]

  return (
    <div className="role-select-wrap" ref={ref} data-testid="role-switcher">
      <button
        type="button"
        className="role-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select role"
        data-testid="role-select"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="role-active-dot" aria-hidden="true" />
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>shield_person</span>
        <span className="role-select-value">{current.label}</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{open ? 'expand_less' : 'expand_more'}</span>
      </button>
      {open && (
        <div className="role-select-menu" role="listbox" aria-label="Roles">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={role === opt.value}
              data-testid={`role-option-${opt.value}`}
              className={`role-option ${role === opt.value ? 'role-option-active' : ''}`}
              onClick={() => {
                setStoredRole(opt.value)
                setOpen(false)
              }}
            >
              <span className="role-option-label">{opt.label}</span>
              <span className="role-option-sub">{opt.sub}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
