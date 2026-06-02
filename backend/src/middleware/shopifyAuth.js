// src/middleware/shopifyAuth.js

const shopify = require('../config/shopify');
const storeService = require('../services/storeService');
const logger = require('../utils/logger');

/**
 * verifyShopifyRequest
 * Protected routes ke liye — session token verify karo
 * Header: Authorization: Bearer <sessionToken>
 * Query:  ?shop=xxx.myshopify.com
 */
async function verifyShopifyRequest(req, res, next) {
  const { shop } = req.query;

  // ── shop param check ──────────────────────────────────────────
  if (!shop) {
    return res.status(400).json({ error: 'Shop domain required' });
  }

  if (!shop.match(/^[a-z0-9-]+\.myshopify\.com$/)) {
    return res.status(400).json({ error: 'Invalid shop domain' });
  }

  // ── Authorization header check ────────────────────────────────
  const authHeader = req.headers['authorization'];
  const sessionToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!sessionToken) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    // ── JWT verify karo ───────────────────────────────────────────
    let payload;
    try {
      payload = await shopify.session.decodeSessionToken(sessionToken);
    } catch (jwtErr) {
      logger.warn(`[ShopifyAuth] Invalid token for ${shop}: ${jwtErr.message}`);
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    // ── Token ka shop aur query shop match karo ───────────────────
    const tokenShop = payload.dest?.replace('https://', '');
    if (tokenShop !== shop) {
      logger.warn(`[ShopifyAuth] Shop mismatch: token=${tokenShop}, query=${shop}`);
      return res.status(401).json({ error: 'Shop mismatch' });
    }

    // ── Firestore se store check karo ────────────────────────────
    const store = await storeService.getStore(shop);

    if (!store) {
      return res.status(401).json({ error: 'Store not found. Please reinstall the app.' });
    }

    if (!store.accessToken) {
      return res.status(401).json({ error: 'Store not authenticated' });
    }

    if (!store.isActive) {
      return res.status(403).json({ error: 'Store is inactive' });
    }

    // ── req pe attach karo ────────────────────────────────────────
    req.shop = shop;
    req.accessToken = store.accessToken;
    req.store = store;

    next();
  } catch (err) {
    logger.error(`[ShopifyAuth] Unexpected error for ${shop}:`, err);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

module.exports = { verifyShopifyRequest };