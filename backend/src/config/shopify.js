const { shopifyApp } = require('@shopify/shopify-app-express')
const { ApiVersion } = require('@shopify/shopify-api')
require('dotenv').config()

const shopify = shopifyApp({
  api: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SHOPIFY_SCOPES.split(','),
    hostName: process.env.HOST_NAME,
    apiVersion: ApiVersion.July25,   // ← LATEST_API_VERSION ki jagah yeh
    isEmbeddedApp: true,
  },
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback',
  },
  webhooks: {
    path: '/api/webhooks',
  },
})

module.exports = shopify