import React, { useState, useEffect } from 'react';
import { Card, DataTable, Text, Badge, InlineStack, BlockStack } from '@shopify/polaris';

function Usage({ shopDomain, apiUrl }) {
  const [usage, setUsage] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    loadData();
  }, [shopDomain]);

  const loadData = async () => {
    const [usageRes, invoicesRes] = await Promise.all([
      fetch(`${apiUrl}/billing/usage/${shopDomain}`),
      fetch(`${apiUrl}/billing/invoices/${shopDomain}`)
    ]);
    
    setUsage(await usageRes.json());
    setInvoices(await invoicesRes.json());
  };

  if (!usage) return <div>Loading...</div>;

  const rows = invoices.map(inv => [
    inv.id,
    inv.description,
    inv.billingPeriod,
    `$${inv.amount.toFixed(2)}`,
    <Badge tone={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
  ]);

  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="200">
          <Text variant="headingMd" as="h3">Current Month</Text>
          <InlineStack align="space-between">
            <BlockStack gap="100">
              <Text variant="headingXl">{usage.base.used}</Text>
              <Text variant="bodySm">Base Used</Text>
            </BlockStack>
            <BlockStack gap="100">
              <Text variant="headingXl">{usage.extra.used}</Text>
              <Text variant="bodySm">Extra</Text>
            </BlockStack>
            <BlockStack gap="100">
              <Text variant="headingXl" tone="critical">${usage.extra.cost.toFixed(2)}</Text>
              <Text variant="bodySm">Cost</Text>
            </BlockStack>
          </InlineStack>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="200">
          <Text variant="headingMd" as="h3">Invoices</Text>
          {invoices.length === 0 ? (
            <Text tone="subdued">No invoices yet</Text>
          ) : (
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'numeric', 'text']}
              headings={['ID', 'Description', 'Period', 'Amount', 'Status']}
              rows={rows}
            />
          )}
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

export default Usage;