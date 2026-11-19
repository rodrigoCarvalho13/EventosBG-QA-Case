import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { initOneSignal } from '@/lib/onesignal'
import { iniciarInstalacao } from '@/lib/instalar'
import { MotionConfig } from 'framer-motion'
import { recarregarUmaVez } from '@/components/ErroPagina'

// Arquivo de página sumiu depois de um deploy: recarrega para pegar a versão nova.
window.addEventListener('vite:preloadError', (e) => {
  if (recarregarUmaVez()) e.preventDefault()
})

initOneSignal()
iniciarInstalacao()

ReactDOM.createRoot(document.getElementById('root')).render(
  // reducedMotion="user": sem animações para quem pediu menos movimento no sistema.
  <MotionConfig reducedMotion="user">
    <App />
  </MotionConfig>
)