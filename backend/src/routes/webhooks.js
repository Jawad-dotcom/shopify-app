// src/routes/webhooks.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const storeService = require('../services/storeService');
const billingService = require('../services/billingService');
const logger = require('../utils/logger');

// ─── Middleware to capture raw body (CRITICAL for HMAC) ───
router.use((req, res, next) => {
  let rawBody = '';
  req.setEncoding('utf8');
  
  req.on('data', (chunk) => {
    rawBody += chunk;
  });
  
  req.on('end', () => {
    req.rawBody = rawBody;
    next();
  });
});

// ─── HMAC Verifier ─────────────────────────────────────────
function verifyWebhookHmac(req, res, next) {
  const hmacHeader = req.headers['x-shopify-hmac-sha256'];
  
  if (!hmacHeader || !process.env.SHOPIFY_API_SECRET) {
    logger.warn('[Webhook] Missing HMAC or secret');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const digest = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(req.rawBody || '', 'utf8')
    .digest('base64');

  const digestBuf = Buffer.from(digest);
  const hmacBuf = Buffer.from(hmacHeader);
  const isValid = digestBuf.length === hmacBuf.length && 
                  crypto.timingSafeEqual(digestBuf, hmacBuf);

  if (!isValid) {
    logger.warn('[Webhook] Invalid HMAC signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
}

// ─── APP UNINSTALLED ───────────────────────────────────────
router.post('/app-uninstalled', verifyWebhookHmac, async (req, res) => {
  try {
    const shopDomain = req.headers['x-shopify-shop-domain'];
    
    if (!shopDomain) {
      return res.status(400).json({ error: 'Missing shop domain' });
    }

    await storeService.deactivateStore(shopDomain);
    logger.info(`✅ APP_UNINSTALLED: ${shopDomain}`);

    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error('[Webhook] APP_UNINSTALLED error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ─── SUBSCRIPTIONS UPDATE ──────────────────────────────────
router.post('/app-subscriptions-update', verifyWebhookHmac, async (req, res) => {
  try {
    const shopDomain = req.headers['x-shopify-shop-domain'];
    
    if (!shopDomain) {
      return res.status(400).json({ error: 'Missing shop domain' });
    }

    // Parse body - req.body already parsed by express.json()
    // But since we have rawBody, we need to parse it
    let payload = req.body;
    if (typeof payload === 'string') {
      payload = JSON.parse(payload);
    }
    
    const { app_subscription } = payload;
    if (!app_subscription) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    const { status, admin_graphql_api_id } = app_subscription;

    await storeService.syncBillingStatus(shopDomain, status, admin_graphql_api_id);
    logger.info(`✅ SUBSCRIPTIONS_UPDATE: ${shopDomain} -> ${status}`);

    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error('[Webhook] SUBSCRIPTIONS_UPDATE error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ─── APP SUBSCRIPTIONS APPROACHING CAPPED AMOUNT ────────────
router.post('/subscriptions/approaching-capped-amount', verifyWebhookHmac, async (req, res) => {
  try {
    const shopDomain = req.headers['x-shopify-shop-domain'];
    logger.info(`⚠️ Approaching capped amount for ${shopDomain}`);
    
    // Send email notification to merchant
    // Or trigger in-app notification
    
    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error('[Webhook] Approaching capped amount error:', err);
    return res.status(500).json({ error: 'Processing failed' });
  }
});

module.exports = router;