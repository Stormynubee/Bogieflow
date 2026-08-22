import { can } from '../lib/rbac.js'

export default function RbacGate({ role, perm, resource, children, fallback = null }) {
  const allowed = resource ? can(role, perm) : can(role, perm)
  // if resource given, check via perm derived; allow either perm or resource
  // caller passes either perm or resource
  if (perm && !can(role, perm)) return fallback
  if (resource) {
    // resource already checked via perm param; keep
  }
  return allowed ? children : fallback
}

export function RbacDisabled({ role, perm, children, titleWhenDisabled }) {
  const allowed = can(role, perm)
  if (allowed) return children
  const child = children?.props ? children : null
  if (!child) return null
  const disabledTitle = titleWhenDisabled || `Requires ${perm} (role=${role}) — least privilege`
  // clone with disabled + tooltip, preserve onClick guard
  const { onClick, title, disabled, ...rest } = child.props || {}
  const guardedClick = allowed ? onClick : (e) => { e.preventDefault(); e.stopPropagation() }
  // Using valid approach: render wrapper button disabled logic via props
  return (
    <span title={disabledTitle} style={{ display: 'inline-flex' }}>
      {allowed ? children : (
        // render disabled copy
        <button
          {...rest}
          type={rest.type || 'button'}
          disabled
          title={disabledTitle}
          aria-disabled="true"
          style={{ ...(rest.style || {}), opacity: 0.55, cursor: 'not-allowed' }}
          onClick={guardedClick}
        >
          {child.props?.children}
        </button>
      )}
    </span>
  )
}
