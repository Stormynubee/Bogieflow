import { useState } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import OverviewView from './components/views/OverviewView'
import AnalysisView from './components/views/AnalysisView'
import MaintenanceView from './components/views/MaintenanceView'
import ClimateView from './components/views/ClimateView'

export default function App() {
  const { connected, segments, train, tickets, logs, activeRiskIndex } =
    useWebSocket()

  const [view, setView] = useState('overview')
  const [selectedSegmentId, setSelectedSegmentId] = useState('S3')

  const handleScan = async () => {
    try {
      await fetch('/api/inject/monsoon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segment_id: 'S4',
          rainfall: 0.9,
          soil_moisture: 0.85,
        }),
      })
    } catch {
      document.getElementById('controls-panel')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSegmentClick = (id) => {
    setSelectedSegmentId(id)
    setView('analysis')
  }

  return (
    <div className="shell">
      <div className="scanline" aria-hidden="true" />
      <Sidebar
        connected={connected}
        activeView={view}
        onNavigate={setView}
        onScan={handleScan}
      />

      <div className="workspace">
        <TopBar connected={connected} />

        <main className={`main-grid ${view !== 'overview' ? 'main-grid-single' : ''}`}>
          {view === 'overview' && (
            <OverviewView
              segments={segments}
              train={train}
              tickets={tickets}
              logs={logs}
              activeRiskIndex={activeRiskIndex}
              onSegmentClick={handleSegmentClick}
            />
          )}
          {view === 'analysis' && (
            <AnalysisView
              segments={segments}
              activeRiskIndex={activeRiskIndex}
              logs={logs}
              selectedSegmentId={selectedSegmentId}
              onSelectSegment={setSelectedSegmentId}
            />
          )}
          {view === 'maintenance' && (
            <MaintenanceView tickets={tickets} logs={logs} />
          )}
          {view === 'climate' && <ClimateView segments={segments} />}
        </main>

        <footer className="app-footer">
          <span>
            <span className="footer-dot" />
            UPTIME: 99.98% | AGENT: NOMINAL | SEGMENT: A-104
          </span>
          <span className="footer-links">
            <a href="#station">STATION_MAP</a>
            <span className="footer-sep">|</span>
            <a href="#logs">NETWORK_LOGS</a>
            <span className="footer-sep">|</span>
            <a href="#sop">SOP_DOCS</a>
          </span>
        </footer>
      </div>
    </div>
  )
}
