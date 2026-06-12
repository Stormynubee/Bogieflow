async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export default function ControlPanel() {
  const injectMonsoon = () =>
    post('/api/inject/monsoon', {
      segment_id: 'S4',
      rainfall: 0.9,
      soil_moisture: 0.85,
    })

  const forceAnomaly = () =>
    post('/api/inject/anomaly', { segment_id: 'S4' })

  return (
    <div className="controls">
      <button type="button" onClick={injectMonsoon}>
        Inject Severe Monsoon on S4
      </button>
      <button type="button" className="secondary" onClick={forceAnomaly}>
        Force Anomaly S4 (diagnostic)
      </button>
    </div>
  )
}
