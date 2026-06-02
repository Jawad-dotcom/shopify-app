const shopify = require('../config/shopify');
const storeService = require('../services/storeService');

async function verifySession(req, res, next) {
  const authHeader = req.headers['authorization'];
  const sessionToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!sessionToken) return res.status(401).json({ error: 'MISSING_TOKEN' });

  try {
    const payload = await shopify.session.decodeSessionToken(sessionToken);
    const shop = payload.dest?.replace('https://', '');

    const store = await storeService.getStore(shop);
    if (!store || !store.accessToken) {
      return res.status(401).json({ error: 'NOT_REGISTERED' });
    }

    req.shopDomain = shop;
    req.accessToken = store.accessToken;
    req.store = store;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}

module.exports = { verifySession };