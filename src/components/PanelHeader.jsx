/** Icon + title + one-line explainer for control-room panels. */
export default function PanelHeader({ icon, title, explainer, aside, className = '' }) {
  return (
    <div className={`panel-head panel-head-calm ${className}`.trim()}>
      <div className="panel-head-copy">
        <h2 className="panel-title-calm panel-title-display">
          {icon && <span className="material-symbols-outlined panel-icon" aria-hidden="true">{icon}</span>}
          {title}
        </h2>
        {explainer && <p className="panel-sub-calm">{explainer}</p>}
      </div>
      {aside}
    </div>
  )
}
