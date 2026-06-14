import Eyebrow from './Eyebrow.jsx'
import Hairline from './Hairline.jsx'

export default function PageHeader({
  eyebrow,
  title,
  lede,
  className = '',
  'data-testid': testId,
}) {
  return (
    <header className={`ink-page-header ${className}`.trim()} data-testid={testId}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      {title ? <h1 className="ink-page-title">{title}</h1> : null}
      {lede ? <p className="ink-page-lede">{lede}</p> : null}
    </header>
  )
}
