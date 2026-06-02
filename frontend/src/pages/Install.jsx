import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Install() {
  const [shop, setShop] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleInstall = async () => {
    if (!shop.trim()) {
      setError('Shop name daalo!')
      return
    }

    setLoading(true)
    setError('')

    const shopDomain = shop.includes('.myshopify.com')
      ? shop
      : `${shop}.myshopify.com`

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth?shop=${shopDomain}`,
        { 
          method: 'GET',
          redirect: 'manual'
        }
      )
      
      if (response.status === 302 || response.status === 301) {
        const redirectUrl = response.headers.get('Location')
        if (redirectUrl) {
          // External redirect for Shopify OAuth
          window.location.href = redirectUrl
        } else {
          setError('Redirect URL nahi mila!')
          setLoading(false)
        }
      } else if (response.ok) {
        const data = await response.json()
        if (data.redirectTo) {
          navigate(data.redirectTo)
        } else {
          // Assume success, go to products
          navigate(`/products?shop=${shopDomain}`)
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Kuch gadbad hui!')
        setLoading(false)
      }
    } catch (err) {
      console.error('Connection error:', err)
      setError('Connection error! Please check if backend is running.')
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🛍️</div>
        <h1 style={styles.title}>Product Viewer</h1>
        <p style={styles.subtitle}>
          Apna Shopify store connect karo
        </p>

        <div style={styles.inputGroup}>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              placeholder="your-store-name"
              value={shop}
              onChange={e => {
                setShop(e.target.value)
                setError('')
              }}
              onKeyDown={e => e.key === 'Enter' && !loading && handleInstall()}
              style={styles.input}
              disabled={loading}
            />
            <span style={styles.suffix}>.myshopify.com</span>
          </div>
          {error && <p style={styles.error}>{error}</p>}
        </div>

        <button 
          onClick={handleInstall} 
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Store →'}
        </button>

        <p style={styles.hint}>
          💡 Shopify Partner Dashboard se dev store ka naam daalo
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  logo: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 8px',
  },
  subtitle: {
    color: '#666',
    fontSize: '15px',
    marginBottom: '32px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  inputWrapper: {
    display: 'flex',
    border: '2px solid #e1e4e8',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '15px',
    border: 'none',
    outline: 'none',
    color: '#1a1a2e',
  },
  suffix: {
    padding: '12px 16px',
    background: '#f6f8fa',
    color: '#666',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    borderLeft: '2px solid #e1e4e8',
  },
  error: {
    color: '#e53e3e',
    fontSize: '13px',
    marginTop: '8px',
    textAlign: 'left',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '20px',
    transition: 'transform 0.2s',
  },
  hint: {
    fontSize: '13px',
    color: '#999',
    margin: 0,
  }
}