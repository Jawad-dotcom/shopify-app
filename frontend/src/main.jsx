import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
// In main.jsx, update AppBridge configuration
const host = new URL(window.location.href).searchParams.get('host')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppBridgeProvider config={{
      apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
      host: host,
      forceRedirect: true,
    }}>
      <PolarisProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PolarisProvider>
    </AppBridgeProvider>
  </StrictMode>
)