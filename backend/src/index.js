require('dotenv').config()
const express = require('express')
const cors = require('cors')
const shopify = require('./config/shopify')
const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')

const app = express()

// Shopify middleware — sabse pehle
app.use(shopify.cspHeaders())

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}))

app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api', productRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: '🚀 Server chal raha hai!',
    host: process.env.HOST_NAME,
    env: process.env.NODE_ENV,
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`✅ Server: http://localhost:${PORT}`)
  console.log(`🌐 Ngrok: https://${process.env.HOST_NAME}`)
  console.log(`📦 Health: http://localhost:${PORT}/health`)
})