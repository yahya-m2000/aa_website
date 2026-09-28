import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
let filters = [];
let rows = [];
mock.module('../../src/core/graph/graph.client.ts', { namedExports: {
  GraphRequestError: class extends Error {}, GraphConflictError: class extends Error {},
  getGraphClient: () => ({ api: () => {
    const request = { expand: () => request, header: () => request, top: () => request, orderby: () => request,
      filter: () => request, get: async () => ({ value: rows }) };
    return request;
  } }),
} });
mock.module('../../src/core/whatsapp/whatsapp.service.ts', { namedExports: { sendOrderStatusWhatsApp: async () => {} } });
mock.module('../../src/features/admin-automation/records.ts', { namedExports: {
  findRecord: async () => { throw new Error('Unexpected per-row query'); },
  listRecords: async (_store, filter) => { filters.push(filter); return [{ key: "create:ORD-'quoted" }]; },
} });
const { listOrders } = await import('../../src/features/admin-orders/orders.repository.ts');
test('order list batches 25 references, escapes quotes, and derives media and attribution from fetched fields', async () => {
  process.env.ADMIN_GRAPH_OPERATIONS_LIST_ID = 'mock';
  rows = Array.from({ length: 25 }, (_, index) => ({ id: String(index), '@odata.etag': 'v1', fields: {
    OrderReference: index ? `ORD-${index}` : "ORD-'quoted", CustomerFullName: 'Customer',
    LineItemsJson: '[{"imageUrl":"//img.alicdn.com/a.jpg","quantity":2}]',
    LastModifiedByName: 'Staff', LastModifiedAt: '2026-09-28T12:00:00Z', LastModifiedSource: 'Admin portal',
  } }));
  filters = [];
  const result = await listOrders({ pageSize: 25 });
  assert.equal(filters.length, 1);
  assert.match(filters[0], /create:ORD-''quoted/);
  assert.equal(result.items[0].paymentRequested, true);
  assert.equal(result.items[1].paymentRequested, false);
  assert.equal(result.items[0].thumbnailUrl, 'https://img.alicdn.com/a.jpg');
  assert.equal(result.items[0].itemCount, 2);
  assert.equal(result.items[0].lastModifiedByName, 'Staff');
});
test('empty pages and optional operations configuration make no operation queries', async () => {
  filters = []; rows = [];
  await listOrders({ pageSize: 25 });
  delete process.env.ADMIN_GRAPH_OPERATIONS_LIST_ID;
  rows = [{ id: '1', fields: { OrderReference: 'ORD-1', LineItemsJson: '[]' } }];
  await listOrders({ pageSize: 25 });
  assert.equal(filters.length, 0);
});
