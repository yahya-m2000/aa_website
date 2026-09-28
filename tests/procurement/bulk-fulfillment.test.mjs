import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
let checks = 0, writes = 0;
mock.module('../../src/features/admin-automation/payment-evidence.ts', { namedExports: {
  requireVerifiedSupplierPayment: async () => { checks++; throw new Error('Incomplete supplier payment'); },
}});
mock.module('../../src/features/admin-automation/records.ts', { namedExports: { listRecords: async () => [], findRecord: async () => null } });
mock.module('../../src/core/graph/env.ts', { namedExports: { graphEnv: { siteId: 'site', ordersListId: 'orders' } } });
mock.module('../../src/core/graph/graph.client.ts', { namedExports: {
  GraphConflictError: class extends Error {}, GraphRequestError: class extends Error {},
  getGraphClient: () => ({ api: () => {
    const req = { expand: () => req, filter: () => req, top: () => req, header: () => req,
      get: async () => ({ value: [{ id: 'one', '@odata.etag': 'v1', fields: { OrderReference: 'ORD-test', InternalStatus: 'Payment Confirmed', HiobuyPurchaseStatus: 'Paid' } }] }),
      patch: async () => { writes++; } };
    return req;
  } }),
}});
mock.module('../../src/core/whatsapp/whatsapp.service.ts', { namedExports: { sendOrderStatusWhatsApp: async () => { throw new Error('Unexpected notification'); } } });
const { bulkUpdateInternalStatus } = await import('../../src/features/admin-orders/orders.repository.ts');
for (const status of ['Shipped', 'Completed']) test(`bulk ${status} refuses incomplete supplier payments without changing records`, async () => {
  checks = 0; writes = 0;
  const results = await bulkUpdateInternalStatus(['ORD-test'], status, { name: 'Staff', source: 'Admin portal' });
  assert.equal(results[0].ok, false); assert.match(results[0].errorMessage, /Incomplete supplier payment/);
  assert.equal(checks, 1); assert.equal(writes, 0);
});
