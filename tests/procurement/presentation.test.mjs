import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProcurementSummary, procurementStatusLabel } from '../../src/features/admin-automation/procurement-summary.tsx';
test('legacy successful operations are visibly unverified instead of complete', () => {
  assert.equal(procurementStatusLabel('Succeeded', { kind: 'pay', orderContentsIdentity: 'current' }, 'current'), 'Unverified - review required');
  assert.equal(procurementStatusLabel('Succeeded', { kind: 'create', orderContentsIdentity: 'current' }, 'current'), 'Unverified - review required');
  assert.equal(procurementStatusLabel('Review', { kind: 'pay' }, 'current'), 'Needs review');
});

test('partial-payment summary renders recorded purchases, actual settlement currency and blocked fulfillment', () => {
  const data = { kind: 'pay', orderContentsIdentity: 'current', manifest: { version: 1, expectedTotalCnyMinor: 3500,
    sellers: [{ sellerId: 'a', lines: [{ productId: 'a', skuId: 'a', quantity: 1 }] }, { sellerId: 'b', lines: [{ productId: 'b', skuId: 'b', quantity: 1 }] }],
    orders: [{ orderId: 'one', purchaseCnyMinor: 1750, lines: [{ productId: 'a', skuId: 'a', quantity: 1 }], payment: { state: 'Paid', paidAt: new Date().toISOString(), settledAmountMinor: 262, settledCurrency: 'USD' } },
      { orderId: 'two', purchaseCnyMinor: 1750, lines: [{ productId: 'b', skuId: 'b', quantity: 1 }], payment: { state: 'Unpaid' } }] } };
  const html = renderToStaticMarkup(createElement(ProcurementSummary, { data, contentsIdentity: 'current' }));
  assert.match(html, /2 supplier purchases recorded; 1 paid/);
  assert.match(html, /CNY 35.00/); assert.match(html, /settled USD 2.62/); assert.match(html, /Fulfillment is blocked/);
});
