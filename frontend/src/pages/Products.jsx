import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const shop = searchParams.get('shop')

  useEffect(() => {
    if (!shop) {
      setError('Shop parameter missing!')
      setLoading(false)
      return
    }

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/products?shop=${shop}`, {
        withCredentials: true,
      })
      .then(res => {
        setProducts(res.data.products)
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Products load nahi hue!')
        setLoading(false)
      })
  }, [shop])

  // Loading State
  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner}>⏳</div>
        <p>Products load ho rahe hain...</p>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div style={styles.center}>
        <p style={{ fontSize: '48px' }}>❌</p>
        <h2>Kuch Gadbad Hui!</h2>
        <p style={{ color: '#666' }}>{error}</p>
        <a href="/" style={styles.backBtn}>← Wapas Jao</a>
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
        <div style={styles.center}>
          <p style={{ fontSize: '48px' }}>📦</p>
          <h2>Koi Product Nahi Mila</h2>
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
                />
              ) : (
                <div style={styles.noImage}>📷</div>
              )}

              {/* Status Badge */}
              <span style={{
                ...styles.statusBadge,
                background: product.status === 'active' ? '#48bb78' : '#a0aec0'
              }}>
                {product.status}
              </span>
            </div>

            {/* Product Info */}
            <div style={styles.info}>
              <h3 style={styles.productTitle}>{product.title}</h3>
              <p style={styles.vendor}>{product.vendor}</p>
              <p style={styles.price}>Rs. {product.price}</p>
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
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
    fontSize: '15px',
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
  },
  spinner: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  backBtn: {
    marginTop: '16px',
    padding: '10px 24px',
    background: '#667eea',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
  }
}