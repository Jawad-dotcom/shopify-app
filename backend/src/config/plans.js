const PLANS = {
  bronze: {
    id: 'bronze',
    name: 'Bronze',
    basePrice: 20.00,
    baseMeasurements: 100,
    extraPrice: 0.12
  },
  silver: {
    id: 'silver',
    name: 'Silver',
    basePrice: 40.00,
    baseMeasurements: 300,
    extraPrice: 0.10
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    basePrice: 60.00,
    baseMeasurements: 500,
    extraPrice: 0.08
  }
};

module.exports = { PLANS };