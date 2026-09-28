import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { productImageUrl, taobaoItemUrl } from '../../src/features/admin-orders/product-media.ts';

const events = new Map();
let fail = false;
let lostResponse = false;
let filter;
mock.module('../../src/core/graph/graph.client.ts', { namedExports: {
  getGraphClient: () => ({ api: () => {
    const request = {
      expand: () => request, top: () => request, header: () => request, orderby: () => request,
      filter: value => { filter = value; return request; },
      post: async ({ fields }) => {
        if (fail) throw new Error('Graph unavailable');
        if (events.has(fields.EventKey)) throw new Error('Unique key conflict');
        events.set(fields.EventKey, fields);
        if (lostResponse) throw new Error('Response lost');
        return {};
      },
      get: async () => {
        if (fail) throw new Error('Graph unavailable');
        const key = filter.match(/eq '(.*)'/)?.[1]?.replaceAll("''", "'");
        return { value: events.has(key) ? [{ fields: events.get(key) }] : [] };
      },
    };
    return request;
  } }),
} });
const { actorFromSession, auditFields, recordActivity, listActivity } = await import('../../src/features/admin-orders/audit.ts');
const actor = { name: 'Test Staff', email: 'staff@example.invalid', source: 'Admin portal' };
test('image URLs normalize protocol-relative sources and reject unsafe or missing values', () => {
  assert.equal(productImageUrl({ imageUrl: '//img.alicdn.com/a.jpg' }), 'https://img.alicdn.com/a.jpg');
  for (const imageUrl of [undefined, '', 'javascript:alert(1)', 'data:image/png;base64,test', '/local', 'not a URL', 'https://user:password@example.com/a']) {
    assert.equal(productImageUrl({ imageUrl }), undefined);
  }
  assert.equal(productImageUrl({ imageUrl: 'http://img.alicdn.com/a.jpg' }), 'http://img.alicdn.com/a.jpg');
  assert.equal(taobaoItemUrl({ sourceProductId: '123456' }), 'https://item.taobao.com/item.htm?id=123456');
  for (const sourceProductId of [undefined, 'abc', '12&other=1', '1.5', '']) assert.equal(taobaoItemUrl({ sourceProductId }), undefined);
});
test('audit fields cap all single-line strings and preserve actor source and time', () => {
  const fields = auditFields({ ...actor, name: 'n'.repeat(400), email: 'e'.repeat(300) }, 'a'.repeat(800), '2026-09-28T12:00:00Z');
  assert.equal(fields.LastModifiedByName.length, 255);
  assert.equal(fields.LastModifiedByEmail.length, 255);
  assert.equal(fields.LastModifiedAction.length, 255);
  assert.equal(fields.LastModifiedSource, 'Admin portal');
  assert.equal(fields.LastModifiedAt, '2026-09-28T12:00:00Z');
  assert.equal(actorFromSession({ user: { email: 'fallback' } }).name, 'fallback');
  assert.equal(actorFromSession({}).name, 'Unknown staff');
});
test('activity tolerates outage, missing configuration, duplicate keys and a lost create response', async () => {
  process.env.ADMIN_GRAPH_ACTIVITY_LIST_ID = 'mock';
  const input = { reference: 'ORD-test', actor, action: 'Changed status', eventKey: "op:test's:success" };
  lostResponse = true;
  await recordActivity(input);
  await recordActivity(input);
  assert.equal(events.size, 1);
  assert.equal(events.get(input.eventKey).ActorName, actor.name);
  fail = true;
  await assert.doesNotReject(recordActivity({ ...input, eventKey: 'another' }));
  assert.deepEqual(await listActivity(input.reference), []);
  delete process.env.ADMIN_GRAPH_ACTIVITY_LIST_ID;
  await assert.doesNotReject(recordActivity(input));
});
