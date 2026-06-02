const express = require('express');
const router = express.Router();
const billingService = require('../services/billingService');

// Get plans
router.get('/plans', (req, res) => {
  res.json(billingService.getPlans());
});

// Get usage
router.get('/usage/:shopDomain', async (req, res) => {
  try {
    const usage = await billingService.getCurrentUsage(req.params.shopDomain);
    res.json(usage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Subscribe
router.post('/subscribe', (req, res) => {
  try {
    const { shopDomain, planId } = req.body;
    const result = billingService.createSubscription(shopDomain, planId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Record measurement
router.post('/measure', async (req, res) => {
  try {
    const { shopDomain } = req.body;
    const result = await billingService.recordMeasurement(shopDomain);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Widget status
router.get('/widget/:shopDomain', async (req, res) => {
  try {
    const result = await billingService.checkWidgetStatus(req.params.shopDomain);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle quota
router.post('/quota', (req, res) => {
  try {
    const { shopDomain, enabled } = req.body;
    const result = billingService.toggleQuota(shopDomain, enabled);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Invoices
router.get('/invoices/:shopDomain', (req, res) => {
  try {
    const invoices = billingService.getInvoices(req.params.shopDomain);
    res.json(invoices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;