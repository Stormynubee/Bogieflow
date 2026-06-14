export default function Eyebrow({ children, className = '', ...props }) {
  return (
    <span className={`ink-eyebrow ${className}`.trim()} {...props}>
      {children}
    </span>
  )
}
