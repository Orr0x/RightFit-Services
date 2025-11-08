import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@rightfit/ui-core/styles'
import './styles/variables.css'
import './styles/accessibility.css'
import './styles/card-overrides.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
