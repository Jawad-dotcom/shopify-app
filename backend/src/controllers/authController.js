// // src/controllers/authController.js

// const shopify = require('../config/shopify');
// const storeService = require('../services/storeService');
// const billingService = require('../services/billingService');
// const logger = require('../utils/logger');

// /**
//  * POST /api/auth/register
//  * Body: { sessionToken: string, shop: string }
//  */
// async function register(req, res) {
//   const { sessionToken, shop } = req.body;

//   // ── Validate input ────────────────────────────────────────────
//   if (!sessionToken || !shop) {
//     return res.status(400).json({
//       error: 'MISSING_PARAMS',
//       message: '`sessionToken` and `shop` are required.',
//     });
//   }

//   if (!shop.match(/^[a-z0-9-]+\.myshopify\.com$/)) {
//     return res.status(400).json({
//       error: 'INVALID_SHOP',
//       message: 'Invalid shop domain format.',
//     });
//   }

//   try {
//     // ── Step 1: Verify Session Token (JWT) ────────────────────────
//     let payload;
//     try {
//       payload = await shopify.session.decodeSessionToken(sessionToken);
//     } catch (jwtErr) {
//       logger.warn(`[Auth] Invalid session token for ${shop}: ${jwtErr.message}`);
//       return res.status(401).json({
//         error: 'INVALID_TOKEN',
//         message: 'Session token is invalid or expired.',
//       });
//     }

//     // Token aur shop match karo
//     const tokenShop = payload.dest?.replace('https://', '');
//     if (tokenShop !== shop) {
//       return res.status(401).json({
//         error: 'SHOP_MISMATCH',
//         message: 'Session token does not match the provided shop.',
//       });
//     }

//     // ── Step 2: Token Exchange → offline access token ─────────────
//     let accessToken;
//     try {
//       const exchangeResponse = await shopify.auth.tokenExchange({
//         sessionToken,
//         shop,
//         requestedTokenType: 'urn:shopify:params:oauth:token-type:offline-access-token',
//       });
//       accessToken = exchangeResponse.session?.accessToken;
//     } catch (exchangeErr) {
//       logger.error(`[Auth] Token exchange failed for ${shop}: ${exchangeErr.message}`);
//       return res.status(502).json({
//         error: 'TOKEN_EXCHANGE_FAILED',
//         message: 'Could not obtain access token from Shopify.',
//       });
//     }

//     if (!accessToken) {
//       return res.status(502).json({
//         error: 'TOKEN_EXCHANGE_FAILED',
//         message: 'Shopify returned an empty access token.',
//       });
//     }

//     // ── Step 3: Shop info fetch → test shop check ─────────────────
//     logger.info(`[Auth] Fetching shop info for ${shop}...`);

//     const client = new shopify.clients.Graphql({
//       session: { shop, accessToken },
//     });

//     let isTestShop = false;
//     try {
//       const shopResponse = await client.query({
//         data: `query {
//           shop {
//             name
//             plan {
//               displayName
//               shopifyPlus
//             }
//           }
//         }`,
//       });

//       const planName = shopResponse.body.data.shop.plan.displayName.toLowerCase();
//       if (
//         planName.includes('test') ||
//         planName.includes('partner') ||
//         planName.includes('affiliate')
//       ) {
//         isTestShop = true;
//         logger.info(`[Auth] ${shop} identified as TEST/PARTNER shop. Overage charges skipped.`);
//       }
//     } catch (shopErr) {
//       logger.error(`[Auth] Failed to fetch shop info for ${shop}: ${shopErr.message}`);
//       // Non-fatal — continue with isTestShop = false
//     }

//     // ── Step 4: Store Firestore mein persist karo ─────────────────
//     const store = await storeService.registerStore({
//       shopDomain: shop,
//       accessToken,
//       shopifyId: payload.sub || null,
//       isTestShop,
//     });

//     logger.info(`[Auth] Store registered for ${shop}`, {
//       planId: store.planId,
//       isTestShop: store.isTestShop,
//       billingActive: store.billingActive,
//     });

//     return res.status(200).json({
//       success: true,
//       shop: store.shopDomain,
//       planId: store.planId,
//       billingActive: store.billingActive,
//       quotaEnabled: store.quotaEnabled,
//       isTestShop: store.isTestShop,
//     });

//   } catch (err) {
//     logger.error(`[Auth] Unexpected error for ${shop}:`, err);
//     return res.status(500).json({
//       error: 'SERVER_ERROR',
//       message: 'An unexpected error occurred during registration.',
//     });
//   }
// }

// /**
//  * GET /api/auth/me
//  * Headers: { x-shop-domain: string, x-session-token: string }
//  */
// async function me(req, res) {
//   const shop = req.shopDomain; // verifySession middleware se aata hai

//   try {
//     const usage = await billingService.getCurrentUsage(shop);

//     return res.status(200).json({
//       success: true,
//       shop,
//       ...usage,
//     });
//   } catch (err) {
//     logger.error(`[Auth] /me failed for ${shop}:`, err);
//     return res.status(500).json({
//       error: 'SERVER_ERROR',
//       message: 'Could not fetch store info.',
//     });
//   }
// }

// module.exports = { register, me };