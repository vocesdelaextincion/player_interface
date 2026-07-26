import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Cursor stays visible in dev (mouse-driven); hidden in the packaged kiosk build (touch-driven).
if (import.meta.env.PROD) {
  document.body.classList.add('kiosk')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
