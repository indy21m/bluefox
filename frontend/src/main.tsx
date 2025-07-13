import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './penguin-sensei-design-system.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
