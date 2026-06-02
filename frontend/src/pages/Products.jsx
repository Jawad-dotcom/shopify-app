import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const shop = searchParams.get('shop')

  useEffect(() => {
    let isMounted = true

    const fetchProducts = async () => {
      if (!shop) {
        if (isMounted) {
          setError('Shop parameter missing!')
          setLoading(false)
        }
        return
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products?shop=${shop}`,
          { 
            withCredentials: true,
            timeout: 10000 
          }
        )
        
        if (isMounted) {
          setProducts(response.data.products || [])
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          if (err.response?.status === 401) {
            // Unauthorized, go back to install
            navigate('/')
          } else if (err.response?.status === 404) {
            setError('Backend API nahi mila! Check karo backend running hai?')
          } else {
            setError(err.response?.data?.error || 'Products load nahi hue!')
          }
          setLoading(false)
        }
      }
    }

    fetchProducts()

    return () => {
      isMounted = false
    }
  }, [shop, navigate])

  // Loading State
  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner}>⏳</div>
        <p style={{ fontSize: '18px', color: '#666' }}>Products load ho rahe hain...</p>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div style={styles.center}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h2 style={{ marginBottom: '8px', color: '#1a1a2e' }}>Kuch Gadbad Hui!</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← Wapas Jao
        </button>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🛍️ Products</h1>
          <p style={styles.shopName}>{shop}</p>
        </div>
        <div style={styles.badge}>{products.length} products</div>
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div style={styles.centerInline}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <h2 style={{ marginBottom: '8px', color: '#1a1a2e' }}>Koi Product Nahi Mila</h2>
          <p style={{ color: '#666' }}>
            Shopify store mein products add karo pehle
          </p>
        </div>
      )}

      {/* Products Grid */}
      <div style={styles.grid}>
        {products.map(product => (
          <div key={product.id} style={styles.card}>
            {/* Product Image */}
            <div style={styles.imageContainer}>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  style={styles.image}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.querySelector('.no-image-fallback').style.display = 'flex'
                  }}
                />
              ) : null}
              <div className="no-image-fallback" style={{
                ...styles.noImage,
                display: product.image ? 'none' : 'flex'
              }}>
                📷
              </div>

              {/* Status Badge */}
              <span style={{
                ...styles.statusBadge,
                background: product.status === 'active' ? '#48bb78' : '#a0aec0'
              }}>
                {product.status || 'active'}
              </span>
            </div>

            {/* Product Info */}
            <div style={styles.info}>
              <h3 style={styles.productTitle}>{product.title}</h3>
              <p style={styles.vendor}>{product.vendor || 'Shopify Store'}</p>
              <p style={styles.price}>
                Rs. {typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f7f8fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    padding: '32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    background: 'white',
    padding: '24px 32px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 4px',
  },
  shopName: {
    color: '#667eea',
    fontSize: '14px',
    margin: 0,
    fontWeight: '500',
  },
  badge: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    }
  },
  imageContainer: {
    position: 'relative',
    height: '220px',
    background: '#f7f8fc',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noImage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    color: '#ccc',
  },
  statusBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  info: {
    padding: '16px 20px',
  },
  productTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a2e',
    margin: '0 0 4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  vendor: {
    fontSize: '13px',
    color: '#999',
    margin: '0 0 8px',
  },
  price: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#667eea',
    margin: 0,
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    textAlign: 'center',
    padding: '20px',
  },
  centerInline: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '60px 20px',
  },
  spinner: {
    fontSize: '48px',
    marginBottom: '16px',
    animation: 'spin 1s linear infinite',
  },
  backBtn: {
    padding: '10px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
  }
}

// Add animation CSS
const styleSheet = document.createElement("style")
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(styleSheet)