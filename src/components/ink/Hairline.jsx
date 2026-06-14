export default function Hairline({ className = '', ...props }) {
  return <hr className={`ink-hairline ${className}`.trim()} {...props} />
}
