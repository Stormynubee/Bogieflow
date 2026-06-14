import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/ink-tokens.css'
import './styles/ink-motifs.css'
import './styles/ink-reskin.css'
import './styles/ink-overrides.css'
import './index.css'
import './styles/overview-split.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
