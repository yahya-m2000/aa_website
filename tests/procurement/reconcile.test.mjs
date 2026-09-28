import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
let operation;
let saved;
mock.module('../../src/core/admin-auth/session.ts', { namedExports: { requireAdminSession: async () => ({ user: { email: 'staff' } }) } });
mock.module('../../src/core/utils/http-error.ts', { namedExports: { toErrorResponse: error => { throw error; } } });
mock.module('../../src/features/admin-automation/records.ts', { namedExports: {
  findRecord: async () => operation,
  replaceRecord: async (_store, op, state, data) => { saved = { ...op, state, data }; return saved; },
}});
const { PATCH } = await import('../../src/app/api/admin/orders/[reference]/reconcile/route.ts');
function request() { return new Request('http://localhost/reconcile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'pay:one', etag: 'v1', evidence: 'Staff requested supplier evidence recheck', confirm: true }) }); }
test('staff reconciliation schedules read-only verification and cannot declare success', async () => {
  operation = { reference: 'ORD-test', etag: 'v1', state: 'Review', data: { kind: 'pay', manifest: {}, supplierIds: ['one'] } };
  const response = await PATCH(request(), { params: Promise.resolve({ reference: 'ORD-test' }) });
  assert.equal(response.status, 200); assert.equal(saved.state, 'Review'); assert.equal(saved.data.synced, false);
});
test('legacy single-ID reconciliation cannot bypass missing seller/item evidence', async () => {
  saved = undefined;
  operation = { reference: 'ORD-test', etag: 'v1', state: 'Review', data: { kind: 'pay', supplierId: 'one' } };
  const response = await PATCH(request(), { params: Promise.resolve({ reference: 'ORD-test' }) });
  assert.equal(response.status, 409); assert.equal(saved, undefined);
});
