/** Anomaly stream ingest pill label. */

export function anomalyIngestPillLabel(liveConnected) {
  return liveConnected ? 'Live' : 'Sim'
}
