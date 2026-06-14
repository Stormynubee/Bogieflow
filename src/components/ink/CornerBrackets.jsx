export default function CornerBrackets({
  children,
  className = '',
  full = true,
  ...props
}) {
  return (
    <div
      className={`ink-brackets ${full ? 'ink-brackets-full' : ''} ${className}`.trim()}
      {...props}
    >
      <div className="ink-brackets-inner">{children}</div>
    </div>
  )
}
