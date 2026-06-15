/**
 * Status line beside the climate weather mode toggle.
 * Open-Meteo is a free public API — never phrase copy like a missing-key error.
 */
export function weatherToggleHint({ liveWeather, realConnected }) {
  if (!realConnected) {
    return 'Demo weather · Open-Meteo when backend is connected'
  }
  if (liveWeather) {
    return 'Open-Meteo · live forecast (public API)'
  }
  return 'Simulated hydrology · toggle Live weather for Open-Meteo'
}
