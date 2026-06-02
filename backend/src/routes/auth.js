const express = require('express')
const router = express.Router()
const shopify = require('../config/shopify')
const { db } = require('../config/firebase')  // ← yeh missing tha!

// OAuth Start
router.get('/', shopify.auth.begin())

// OAuth Callback
router.get(
  '/callback',                        // ← comma missing tha
  shopify.auth.callback(),
  async (req, res) => {
    const session = res.locals.shopify.session

    console.log('✅ OAuth complete:', session.shop)
    console.log('🔑 Access token mila!')

    try {
      // Firebase mein save karo
      await db.collection('stores').doc(session.shop).set({
        shopDomain: session.shop,
        accessToken: session.accessToken,
        scope: session.scope,
        installedAt: new Date().toISOString(),
        isActive: true,
      }, { merge: true })

      console.log('💾 Firebase mein save hua!')

    } catch (err) {
      console.error('❌ Firebase error:', err.message)
    }

    // Frontend pe redirect
    res.redirect(
      `${process.env.FRONTEND_URL}/products?shop=${session.shop}`
    )
  }
)

module.exports = router