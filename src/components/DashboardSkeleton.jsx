export default function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" data-testid="dashboard-skeleton" aria-busy="true" aria-label="Loading corridor data">
      <div className="skeleton-hero">
        <div className="skeleton-line skeleton-line-wide" />
        <div className="skeleton-gauge" />
      </div>
      <div className="skeleton-panel">
        <div className="skeleton-line" />
        <div className="skeleton-block skeleton-block-tall" />
      </div>
      <div className="skeleton-strip">
        {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((id) => (
          <div key={id} className="skeleton-cell" />
        ))}
      </div>
    </div>
  )
}
