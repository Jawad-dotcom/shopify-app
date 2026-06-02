const { db, saveDB } = require('../config/store');
const { PLANS } = require('../config/plans');

class BillingService {
  
  getCurrentYearMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  async getOrCreateStore(shopDomain) {
    if (!db.stores[shopDomain]) {
      db.stores[shopDomain] = {
        shopDomain,
        planId: 'bronze',
        billingActive: false,
        subscriptionId: null,
        accessToken: null,
        quotaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveDB();
    }
    return db.stores[shopDomain];
  }

  updateStore(shopDomain, updates) {
    db.stores[shopDomain] = {
      ...db.stores[shopDomain],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDB();
    return db.stores[shopDomain];
  }

  async getOrCreateUsageRecord(shopDomain) {
    const yearMonth = this.getCurrentYearMonth();
    const usageId = `${shopDomain}_${yearMonth}`;
    
    if (!db.usageRecords[usageId]) {
      db.usageRecords[usageId] = {
        id: usageId,
        shopDomain,
        yearMonth,
        baseMeasurementsUsed: 0,
        extraMeasurementsUsed: 0,
        totalCost: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveDB();
    }
    return db.usageRecords[usageId];
  }

  async recordMeasurement(shopDomain) {
    const store = await this.getOrCreateStore(shopDomain);
    const plan = PLANS[store.planId] || PLANS.bronze;
    const usage = await this.getOrCreateUsageRecord(shopDomain);

    let isExtra = false;

    if (usage.baseMeasurementsUsed < plan.baseMeasurements) {
      usage.baseMeasurementsUsed++;
    } else {
      usage.extraMeasurementsUsed++;
      usage.totalCost += plan.extraPrice;
      isExtra = true;
    }

    usage.updatedAt = new Date().toISOString();
    db.usageRecords[usage.id] = usage;
    saveDB();

    // Log
    db.logs.push({ shopDomain, timestamp: new Date().toISOString() });
    saveDB();

    return {
      success: true,
      baseRemaining: Math.max(0, plan.baseMeasurements - usage.baseMeasurementsUsed),
      baseUsed: usage.baseMeasurementsUsed,
      baseLimit: plan.baseMeasurements,
      extraUsed: usage.extraMeasurementsUsed,
      extraCost: usage.totalCost,
      isExtra,
      quotaReached: store.quotaEnabled && usage.baseMeasurementsUsed >= plan.baseMeasurements
    };
  }

  createSubscription(shopDomain, planId) {
    const plan = PLANS[planId];
    if (!plan) throw new Error('Invalid plan');

    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.updateStore(shopDomain, {
      planId,
      subscriptionId,
      billingActive: true
    });

    // Invoice
    const invoiceId = `INV_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    db.invoices[invoiceId] = {
      id: invoiceId,
      shopDomain,
      subscriptionId,
      planId,
      amount: plan.basePrice,
      description: `Initial subscription: ${plan.name} Plan`,
      billingPeriod: this.getCurrentYearMonth(),
      status: 'PAID',
      createdAt: new Date().toISOString()
    };
    saveDB();

    return {
      success: true,
      subscriptionId,
      confirmationUrl: `${process.env.HOST_NAME}/api/billing/success?shop=${shopDomain}`
    };
  }

  async checkWidgetStatus(shopDomain) {
    const store = await this.getOrCreateStore(shopDomain);
    if (!store.quotaEnabled) {
      return { showWidget: true, quotaEnabled: false };
    }

    const plan = PLANS[store.planId];
    const usage = await this.getOrCreateUsageRecord(shopDomain);
    const baseRemaining = Math.max(0, plan.baseMeasurements - usage.baseMeasurementsUsed);

    return {
      showWidget: baseRemaining > 0,
      quotaEnabled: true,
      usage: {
        used: usage.baseMeasurementsUsed,
        limit: plan.baseMeasurements,
        remaining: baseRemaining,
        percentage: Math.round((usage.baseMeasurementsUsed / plan.baseMeasurements) * 100)
      }
    };
  }

  async getCurrentUsage(shopDomain) {
    const store = await this.getOrCreateStore(shopDomain);
    const plan = PLANS[store.planId];
    const usage = await this.getOrCreateUsageRecord(shopDomain);

    return {
      plan: plan.name,
      planId: store.planId,
      billingActive: store.billingActive,
      quotaEnabled: store.quotaEnabled,
      month: this.getCurrentYearMonth(),
      base: {
        used: usage.baseMeasurementsUsed,
        limit: plan.baseMeasurements,
        remaining: Math.max(0, plan.baseMeasurements - usage.baseMeasurementsUsed),
        percentage: Math.round((usage.baseMeasurementsUsed / plan.baseMeasurements) * 100)
      },
      extra: {
        used: usage.extraMeasurementsUsed,
        cost: usage.totalCost,
        price: plan.extraPrice
      }
    };
  }

  toggleQuota(shopDomain, enabled) {
    this.updateStore(shopDomain, { quotaEnabled: enabled });
    return { success: true, quotaEnabled: enabled };
  }

  getPlans() {
    return Object.values(PLANS);
  }

  getInvoices(shopDomain) {
    return Object.values(db.invoices).filter(inv => inv.shopDomain === shopDomain);
  }
}

module.exports = new BillingService();