import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { orderContentsIdentity } from '../../src/features/admin-automation/procurement-contract.ts';
let records;
let writes;
mock.module('../../src/features/admin-automation/records.ts', { namedExports: {
  operationKey: (kind, reference, id) => `${kind}:${kind === 'pay' ? id : reference}`,
  findRecord: async (_store, key) => records.get(key) ?? null,
  workerControl: async () => ({ data: { enabled: true, heartbeat: new Date().toISOString() } }),
  createRecord: async (_store, key, state, reference, data) => { writes++; const op = { key, state, reference, data }; records.set(key, op); return op; },
}});
const { requestOperation } = await import('../../src/features/admin-automation/commands.ts');
const { requireVerifiedSupplierPayment } = await import('../../src/features/admin-automation/payment-evidence.ts');
const fields = { OrderReference: 'ORD-test', InternalStatus: 'Order Created', HiobuyOrderId: 'one', LineItemsJson: '[]', SubtotalUsd: 10, MarkupUsd: 1, ServiceFeeUsd: 1 };
const item = { fields, '@odata.etag': 'v1' };
function setup(paid = false) {
  records = new Map(); writes = 0;
  const line = { productId: 'item', skuId: 'sku', quantity: 1 };
  const manifest = { version: 1, expectedTotalCnyMinor: 100, sellers: [{ sellerId: 'seller', lines: [line] }],
    orders: [{ orderId: 'one', purchaseCnyMinor: 100, lines: [line], payment: paid ? { state: 'Paid', paidAt: new Date().toISOString(), settledAmountMinor: 15, settledCurrency: 'USD' } : { state: 'Unpaid' } }] };
  const data = { kind: 'create', synced: true, supplierId: 'one', manifest, orderContentsIdentity: orderContentsIdentity(fields) };
  records.set('create:ORD-test', { reference: 'ORD-test', state: 'Succeeded', data });
  return data;
}
test('Pay Now binds every purchase and its approved identity to the queued payment', async () => {
  setup(); const op = await requestOperation('pay', item, { name: 'Staff member', email: 'staff', source: 'Admin portal' }, 'v1');
  assert.equal(writes, 1); assert.deepEqual(op.data.supplierIds, ['one']);
  assert.ok(op.data.approvedManifestIdentity); assert.equal(op.data.manifest.orders.length, 1);
  await requestOperation('pay', item, { name: 'Staff member', email: 'staff', source: 'Admin portal' }, 'v1'); assert.equal(writes, 1);
});
test('Pay Now rejects missing evidence, incomplete item coverage and changed customer order contents', async () => {
  for (const kind of ['missing', 'incomplete', 'changed']) {
    const data = setup();
    if (kind === 'missing') delete data.manifest;
    if (kind === 'incomplete') data.manifest.orders[0].lines = [];
    if (kind === 'changed') data.orderContentsIdentity = 'different';
    await assert.rejects(requestOperation('pay', item, { name: 'Staff member', email: 'staff', source: 'Admin portal' }, 'v1'));
    assert.equal(writes, 0);
  }
});
test('all fulfillment callers require verified payment and matching order contents', async () => {
  const data = setup(true);
  records.set('pay:one', { reference: 'ORD-test', state: 'Succeeded', data: { ...data, kind: 'pay' } });
  await requireVerifiedSupplierPayment('ORD-test', fields);
  await assert.rejects(requireVerifiedSupplierPayment('ORD-test', { ...fields, LineItemsJson: '["changed"]' }));
  data.manifest.orders[0].payment.state = 'Review';
  await assert.rejects(requireVerifiedSupplierPayment('ORD-test', fields));
});
