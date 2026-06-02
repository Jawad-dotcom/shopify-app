const { Firestore } = require('@google-cloud/firestore');

// Simple initialization
const db = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'review-app',
});

// Simple functions - jitna required utna hi

// Store operations
async function getStore(shop) {
  const doc = await db.collection('stores').doc(shop).get();
  return doc.exists ? doc.data() : null;
}

async function saveStore(shop, data) {
  await db.collection('stores').doc(shop).set(data, { merge: true });
}

// Usage operations
async function getUsage(shop, month) {
  const id = `${shop}_${month}`;
  const doc = await db.collection('usage').doc(id).get();
  return doc.exists ? doc.data() : { reviewsUsed: 0, extraUsed: 0 };
}

async function saveUsage(id, data) {
  await db.collection('usage').doc(id).set(data, { merge: true });
}

module.exports = { getStore, saveStore, getUsage, saveUsage };