const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'https://shopify-app-mocha-rho.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

app.get('/api/auth', (req, res) => {
  const { shop } = req.query;
  
  if (!shop) {
    return res.status(400).json({ error: 'Shop parameter required' });
  }
  
  const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
  const redirectUri = `${process.env.HOST_NAME}/api/auth/callback`;
  const authUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SHOPIFY_SCOPES}&redirect_uri=${redirectUri}`;
  
  res.redirect(authUrl);
});

app.get('/api/auth/callback', async (req, res) => {
  const { shop, code } = req.query;
  
  if (!shop || !code) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  
  try {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code: code
      })
    });
    
    const data = await response.json();
    
    if (data.access_token) {
      console.log('Auth successful for:', shop);
      const frontendUrl = process.env.FRONTEND_URL;
      res.redirect(`${frontendUrl}/products?shop=${shop}`);
    } else {
      res.status(401).json({ error: 'Auth failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/products', (req, res) => {
  // Mock products for now
  res.json({
    products: [
      { id: 1, title: 'Sample Product', vendor: 'Test', price: 99.99, status: 'active', image: null }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});