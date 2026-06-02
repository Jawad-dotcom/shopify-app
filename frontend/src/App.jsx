import { Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import Install from './pages/Install'
import Products from './pages/Products'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
      <h2>Kuch Gadbad Hui!</h2>
      <pre style={{ color: '#666', maxWidth: '500px' }}>{error.message}</pre>
      <button 
        onClick={resetErrorBoundary}
        style={{
          marginTop: '16px',
          padding: '10px 24px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Dobara Try Karo
      </button>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Routes>
        <Route path="/" element={<Install />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App