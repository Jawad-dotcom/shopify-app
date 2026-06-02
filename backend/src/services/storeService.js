const { db } = require('../config/firestore');

async function getStore(shopDomain) {
  const doc = await db.collection('stores').doc(shopDomain).get();
  return doc.exists ? doc.data() : null;
}

async function registerStore({ shopDomain, accessToken, isTestShop = false }) {
  const ref = db.collection('stores').doc(shopDomain);
  const now = new Date().toISOString();

  const storeData = {
    shopDomain,
    accessToken,
    isTestShop,
    planId: null,
    billingActive: false,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  await ref.set(storeData, { merge: true });
  return storeData;
}

module.exports = { getStore, registerStore };