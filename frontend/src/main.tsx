import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './penguin-sensei-design-system.css'
import './index.css'
import 'reactflow/dist/style.css'
import './compact-override.css'
import App from './App.tsx'

console.log('Main.tsx loading');
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} else {
  console.error('Root element not found!');
}
