import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
let checks = 0, writes = 0, group = false, complete = false;
mock.module('../../src/features/admin-automation/payment-evidence.ts', { namedExports: {
  requireVerifiedSupplierPayment: async () => { checks++; throw new Error('Incomplete supplier payment'); },
}});
mock.module('../../src/core/admin-auth/session.ts', { namedExports: { requireAdminSession: async () => ({ user: { email: 'staff' } }) } });
mock.module('../../src/core/utils/http-error.ts', { namedExports: { toErrorResponse: error => { throw error; } } });
mock.module('../../src/core/whatsapp/whatsapp.service.ts', { namedExports: { sendOrderStatusWhatsApp: async () => { throw new Error('Unexpected notification'); } } });
mock.module('../../src/features/admin-automation/commands.ts', { namedExports: { requestOperation: async () => { throw new Error('Unexpected procurement'); } } });
mock.module('../../src/features/admin-automation/records.ts', { namedExports: {
  listRecords: async () => [],
  findRecord: async () => ({ key: 'delivery', etag: 'v1', state: complete ? 'Shipped' : 'Ready', data: { references: ['ORD-test'], paidAt: 'now', history: [] } }),
  createRecord: async () => { throw new Error('Unexpected creation'); },
  replaceRecord: async () => { writes++; },
}});
mock.module('../../src/features/admin-orders/orders.repository.ts', { namedExports: {
  getOrderItemByReference: async () => ({ id: 'one', '@odata.etag': 'v1', fields: { OrderReference: 'ORD-test', InternalStatus: complete ? 'Shipped' : 'Payment Confirmed', HiobuyPurchaseStatus: 'Paid', DeliveryGroupId: group ? 'delivery' : undefined } }),
  updateOrderItemFields: async () => { writes++; },
}});
const { PATCH } = await import('../../src/app/api/admin/orders/[reference]/status/route.ts');
const { updateDelivery } = await import('../../src/features/admin-automation/deliveries.ts');
for (const status of ['Shipped', 'Completed']) test(`manual ${status} cannot bypass supplier evidence with an old Paid flag`, async () => {
  checks = 0; writes = 0; group = false; complete = false;
  const request = new Request('http://localhost/status', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ etag: 'v1', internalStatus: status }) });
  await assert.rejects(PATCH(request, { params: Promise.resolve({ reference: 'ORD-test' }) }), /Incomplete supplier payment/);
  assert.equal(checks, 1); assert.equal(writes, 0);
});
for (const action of ['ship', 'complete']) test(`combined delivery ${action} requires complete payment evidence`, async () => {
  checks = 0; writes = 0; group = true; complete = action === 'complete';
  await assert.rejects(updateDelivery('delivery', 'v1', action, { name: 'Staff member', email: 'staff', source: 'Admin portal' }, undefined, 'tracking'), /Incomplete supplier payment/);
  assert.equal(checks, 1); assert.equal(writes, 0);
});
