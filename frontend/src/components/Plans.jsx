import React, { useState, useEffect } from 'react';
import { Card, Button, Text, Badge, InlineStack, BlockStack, Banner } from '@shopify/polaris';

function Plans({ shopDomain, apiUrl }) {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPlans();
    loadCurrentPlan();
  }, [shopDomain]);

  const loadPlans = async () => {
    const res = await fetch(`${apiUrl}/billing/plans`);
    const data = await res.json();
    setPlans(data);
  };

  const loadCurrentPlan = async () => {
    const res = await fetch(`${apiUrl}/billing/usage/${shopDomain}`);
    const data = await res.json();
    setCurrentPlan(data.planId);
  };

  const handleSubscribe = async (planId) => {
    const res = await fetch(`${apiUrl}/billing/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopDomain, planId })
    });
    const result = await res.json();
    
    if (result.success) {
      setMessage(`✅ Subscribed to ${planId.toUpperCase()}!`);
      loadCurrentPlan();
    }
  };

  const getIcon = (id) => id === 'bronze' ? '🥉' : id === 'silver' ? '🥈' : '🥇';

  return (
    <BlockStack gap="400">
      {message && <Banner tone="success" onDismiss={() => setMessage('')}>{message}</Banner>}

      <InlineStack align="space-between" gap="400">
        {plans.map(plan => {
          const isCurrent = currentPlan === plan.id;
          return (
            <Card key={plan.id}>
              <BlockStack gap="300">
                <Text variant="headingXl" as="h2">{getIcon(plan.id)} {plan.name}</Text>
                <Text variant="heading2xl" as="h3">${plan.basePrice}</Text>
                <Text variant="bodyMd" tone="subdued">per month</Text>
                <Text variant="bodyMd">✅ {plan.baseMeasurements} free</Text>
                <Text variant="bodyMd">💰 ${plan.extraPrice} per extra</Text>
                {isCurrent && <Badge tone="success">CURRENT</Badge>}
                <Button 
                  variant={isCurrent ? 'secondary' : 'primary'} 
                  disabled={isCurrent} 
                  onClick={() => handleSubscribe(plan.id)}
                  fullWidth
                >
                  {isCurrent ? 'Current Plan' : `Select ${plan.name}`}
                </Button>
              </BlockStack>
            </Card>
          );
        })}
      </InlineStack>
    </BlockStack>
  );
}

export default Plans;