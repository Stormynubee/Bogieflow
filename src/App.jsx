import { useState, useEffect, useCallback } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import StationMapModal from './components/StationMapModal'
import GuideCoach from './components/guide/GuideCoach'
import OverviewView from './components/views/OverviewView'
import AnalysisView from './components/views/AnalysisView'
import MaintenanceView from './components/views/MaintenanceView'
import ClimateView from './components/views/ClimateView'
import BootLoader from './components/BootLoader'
import { highestRiskSegment } from './lib/segmentUtils.js'
import { injectMonsoon } from './lib/api.js'
import { UI } from './content/uiCopy.js'

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export default function App() {
  const {
    connected,
    reconnectAttempts,
    segments,
    train,
    tickets,
    logs,
    activeRiskIndex,
    segmentHistory,
  } = useWebSocket()

  const [booted, setBooted] = useState(false)
  const [view, setView] = useState('overview')
  const [selectedSegmentId, setSelectedSegmentId] = useState('S3')
  const [stationMapOpen, setStationMapOpen] = useState(false)
  const [uptimeSec, setUptimeSec] = useState(0)
  const [sessionStart] = useState(() => Date.now())

  useEffect(() => {
    if (!connected) return
    const id = setInterval(() => {
      setUptimeSec(Math.floor((Date.now() - sessionStart) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [connected, sessionStart])

  const [scanToast, setScanToast] = useState('')

  const handleScan = async () => {
    setScanToast('')
    try {
      await injectMonsoon('S4', 0.9, 0.85)
      setScanToast(UI.simulation.sent)
      setTimeout(() => setScanToast(''), 2000)
    } catch {
      setScanToast(UI.simulation.offline)
      setTimeout(() => setScanToast(''), 2000)
    }
  }

  const handleSegmentClick = (id) => {
    setSelectedSegmentId(id)
    setView('analysis')
  }

  const goMaintenance = useCallback(() => {
    setView('maintenance')
    requestAnimationFrame(() => {
      document.getElementById('network-logs')?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [])

  const openTickets = tickets.filter((t) => t.status !== 'closed').length
  const footerSegment =
    train?.segment_id ?? highestRiskSegment(segments)?.id ?? '—'
  const uptimeLabel = connected ? formatUptime(uptimeSec) : '—'
  const agentLabel = connected ? UI.footer.agentOk : UI.footer.agentReconnecting

  const handleBootComplete = useCallback(() => setBooted(true), [])

  if (!booted) {
    return <BootLoader onComplete={handleBootComplete} />
  }

  return (
    <div className="shell">
      <Sidebar
        connected={connected}
        reconnectAttempts={reconnectAttempts}
        activeView={view}
        onNavigate={setView}
        onScan={handleScan}
      />

      <div className="workspace">
        <TopBar
          connected={connected}
          reconnectAttempts={reconnectAttempts}
          openTicketCount={openTickets}
          onNavigateMaintenance={goMaintenance}
        />

        <main
          className={`main-grid ${view === 'overview' ? 'main-grid-overview' : ''} ${view !== 'overview' ? 'main-grid-single' : ''}`}
        >
          {view === 'overview' && (
            <OverviewView
              segments={segments}
              tickets={tickets}
              logs={logs}
              train={train}
              connected={connected}
              openTicketCount={openTickets}
              activeRiskIndex={activeRiskIndex}
              segmentHistory={segmentHistory}
              onSegmentClick={handleSegmentClick}
              onOpenStationMap={() => setStationMapOpen(true)}
              onNavigate={setView}
              onGoMaintenance={goMaintenance}
            />
          )}
          {view === 'analysis' && (
            <AnalysisView
              segments={segments}
              activeRiskIndex={activeRiskIndex}
              logs={logs}
              segmentHistory={segmentHistory}
              selectedSegmentId={selectedSegmentId}
              onSelectSegment={setSelectedSegmentId}
              onNavigateMaintenance={goMaintenance}
            />
          )}
          {view === 'maintenance' && (
            <MaintenanceView tickets={tickets} logs={logs} />
          )}
          {view === 'climate' && <ClimateView segments={segments} />}
        </main>

        <footer className="app-footer" data-guide="app-footer">
          <span>
            <span className="footer-dot" />
            {UI.footer.uptime}: {uptimeLabel} | {UI.footer.agent}: {agentLabel} |{' '}
            {UI.footer.segment}: {footerSegment}
          </span>
          <span className="footer-links">
            <button type="button" className="footer-link" onClick={() => setStationMapOpen(true)} data-testid="station-map-open">
              {UI.footer.stationMap}
            </button>
            <span className="footer-sep">|</span>
            <button type="button" className="footer-link" onClick={goMaintenance}>
              {UI.footer.networkLogs}
            </button>
            <span className="footer-sep">|</span>
            <a
              className="footer-link"
              href="/sop.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              {UI.footer.sopDocs}
            </a>
          </span>
        </footer>
        {scanToast && <p className="overview-ops-toast app-scan-toast">{scanToast}</p>}
      </div>

      <GuideCoach
        view={view}
        setView={setView}
        onOpenStationMap={() => setStationMapOpen(true)}
      />

      <StationMapModal
        open={stationMapOpen}
        onClose={() => setStationMapOpen(false)}
        segments={segments}
        train={train}
      />
    </div>
  )
}
