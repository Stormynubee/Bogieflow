/** Built-in Q&A for the guide chatbot (hybrid local layer). */

export const GUIDE_KNOWLEDGE = [
  {
    id: 'scrub',
    keywords: ['scrub', 'scroll', 'frame', 'corridor', 'wheel', 'shift', '64'],
    answer:
      'Scroll the page to move along the corridor animation. For fine control, hold Shift and wheel over the corridor image, or drag the scrub bar. The counter shows frame N / 64.',
    technical: 'scroll-linked readScrollDriveProgress · Shift+wheel · CorridorScrubRail',
  },
  {
    id: 'segments',
    keywords: ['segment', 's1', 's2', 's3', 's4', 's5', 's6', 'track'],
    answer:
      'The corridor has six segments (S1–S6). Each reports soil moisture, rainfall, vibration (vib_z), and a risk score. Click a segment card to open deep analysis.',
    technical: 'segment_id · risk_index · soil_moisture · rainfall',
  },
  {
    id: 'p1',
    keywords: ['p1', 'p2', 'ticket', 'priority', 'urgent', 'maintenance'],
    answer:
      'P1 tickets are urgent maintenance items — inspect before the next train pass. P2 is lower priority. Open the Maintenance view or click tickets in the top bar.',
    technical: 'priority P1/P2 · MaintenanceView · openTicketCount',
  },
  {
    id: 'monsoon',
    keywords: ['monsoon', 'rain', 'inject', 'simulation', 'test', 'scenario'],
    answer:
      'Use Test scenarios on Overview to inject simulated heavy rain (monsoon) or a track fault. Monsoon · S4 saturates segment S4; Anomaly · S4 triggers a vibration spike.',
    technical: 'injectMonsoon · injectAnomaly · POST /api/inject/*',
  },
  {
    id: 'metrics',
    keywords: ['vibration', 'amplitude', 'fatigue', 'bearing', 'peak', 'temp'],
    answer:
      'Peak vibration is displacement in mm. Fatigue index estimates cumulative track stress (%). Bearing temp is wheel bearing heat in °C — spikes can indicate mechanical issues.',
    technical: 'computeMetrics · peakAmplitude · fatigueIndex · bearingTemp',
  },
  {
    id: 'climate',
    keywords: ['climate', 'moisture', 'soil', 'precipitation', 'rainfall', 'wet'],
    answer:
      'Soil moisture and rainfall drive ballast stability. High moisture + rain raises mud-pumping risk. Open the Climate view for heatmaps and longevity estimates.',
    technical: 'ClimateView · soil_moisture · rainfall · hydrology model',
  },
  {
    id: 'agent',
    keywords: ['agent', 'ai', 'nominal', 'reconnect', 'websocket', 'connected'],
    answer:
      'The AI agent fuses telemetry and opens tickets when risk thresholds are crossed. “Connected” means live WebSocket data; “Reconnecting” means start the Python backend (uvicorn).',
    technical: 'WebSocket /ws · SimulationEngine · agent logs',
  },
  {
    id: 'overview',
    keywords: ['overview', 'start', 'begin', 'help', 'guide', 'tour'],
    answer:
      'Start with Overview: corridor feed, segment strip, priority plan, climate snapshot, and test scenarios. Click “Start guided tour” in this panel for a full walkthrough.',
    technical: 'OverviewView · CorridorCommandDock · CorridorBriefing',
  },
]

export const GUIDE_FALLBACK =
  'I can explain corridor scrubbing, segments S1–S6, P1 tickets, simulation inject, climate data, and the AI agent. Try a quick topic below or start the guided tour.'
