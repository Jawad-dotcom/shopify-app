const express = require('express')
const router = express.Router()
const { db } = require('../config/firebase')

// GET /api/products?shop=your-store.myshopify.com
router.get('/products', async (req, res) => {
  const { shop } = req.query

  if (!shop) {
    return res.status(400).json({
      error: 'Shop parameter missing',
      hint: '?shop=your-store.myshopify.com add karo'
    })
  }

  try {
    // Firebase se access token lo
    const storeDoc = await db.collection('stores').doc(shop).get()

    if (!storeDoc.exists) {
      return res.status(401).json({
        error: 'Store not found',
        installUrl: `https://${process.env.HOST_NAME}/api/auth?shop=${shop}`
      })
    }

    const { accessToken } = storeDoc.data()

    // Shopify se products fetch karo
    const response = await fetch(
      `https://${shop}/admin/api/2024-01/products.json?limit=20`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`)
    }

    const data = await response.json()

    const products = data.products.map(p => ({
      id: p.id,
      title: p.title,
      vendor: p.vendor,
      price: p.variants[0]?.price || '0.00',
      image: p.images[0]?.src || null,
      status: p.status,
    }))

    res.json({
      success: true,
      shop,
      count: products.length,
      products,
    })

  } catch (err) {
    console.error('Products error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router