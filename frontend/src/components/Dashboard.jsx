import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  ProgressBar, 
  Text, 
  Badge, 
  Banner, 
  InlineStack, 
  BlockStack 
} from '@shopify/polaris';

function Dashboard({ shopDomain, apiUrl }) {
  const [usage, setUsage] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUsage();
  }, [shopDomain]);

  const loadUsage = async () => {
    try {
      const res = await fetch(`${apiUrl}/billing/usage/${shopDomain}`);
      const data = await res.json();
      setUsage(data);
    } catch (e) {
      console.error('Error:', e);
    }
  };

  const handleMeasure = async () => {
    try {
      const res = await fetch(`${apiUrl}/billing/measure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopDomain })
      });
      const result = await res.json();
      
      if (result.isExtra) {
        setMessage(`⚠️ Extra charge: $${result.extraCost.toFixed(2)}`);
      } else {
        setMessage(`✅ Free! ${result.baseRemaining} remaining`);
      }
      loadUsage();
    } catch (e) {
      setMessage('❌ Error');
    }
  };

  const toggleQuota = async () => {
    const newState = !usage?.quotaEnabled;
    await fetch(`${apiUrl}/billing/quota`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopDomain, enabled: newState })
    });
    loadUsage();
  };

  if (!usage) return <div>Loading...</div>;

  return (
    <BlockStack gap="400">
      {message && (
        <Banner status={message.includes('❌') ? 'critical' : 'success'} onDismiss={() => setMessage('')}>
          {message}
        </Banner>
      )}

      <Card>
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingLg" as="h2">{usage.plan}</Text>
          <Badge tone={usage.billingActive ? 'success' : 'warning'}>
            {usage.billingActive ? 'Active' : 'Inactive'}
          </Badge>
        </InlineStack>
      </Card>

      <Card>
        <BlockStack gap="200">
          <Text variant="headingMd" as="h3">Base Usage</Text>
          <ProgressBar 
            progress={usage.base.percentage} 
            size="medium"
            tone={usage.base.percentage > 90 ? 'critical' : 'primary'}
          />
          <Text variant="bodyMd">
            {usage.base.used} / {usage.base.limit} ({usage.base.percentage}%)
          </Text>
          <Text variant="bodySm" tone="subdued">
            {usage.base.remaining} remaining
          </Text>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="200">
          <Text variant="headingMd" as="h3">Extra Usage</Text>
          <InlineStack align="space-between">
            <BlockStack gap="100">
              <Text variant="headingMd">{usage.extra.used}</Text>
              <Text variant="bodySm" tone="subdued">Extra</Text>
            </BlockStack>
            <BlockStack gap="100">
              <Text variant="headingMd" tone="critical">${usage.extra.cost.toFixed(2)}</Text>
              <Text variant="bodySm" tone="subdued">Cost</Text>
            </BlockStack>
            <BlockStack gap="100">
              <Text variant="headingMd">${usage.extra.price}</Text>
              <Text variant="bodySm" tone="subdued">Per extra</Text>
            </BlockStack>
          </InlineStack>
        </BlockStack>
      </Card>

      <Card>
        <InlineStack align="space-between">
          <Button variant="primary" onClick={handleMeasure} size="large">
            📏 Record Measurement
          </Button>
          <Button 
            tone={usage.quotaEnabled ? 'critical' : 'success'} 
            onClick={toggleQuota}
          >
            {usage.quotaEnabled ? '🚫 Disable Quota' : '✅ Enable Quota'}
          </Button>
        </InlineStack>
      </Card>
    </BlockStack>
  );
}

export default Dashboard;