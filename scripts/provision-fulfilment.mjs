// Additive, repeatable provisioning. Never updates existing order values or enables purchasing.
import nextEnv from '@next/env';
import { ClientSecretCredential } from '@azure/identity';
import fs from 'node:fs/promises';
nextEnv.loadEnvConfig(process.cwd());
const credential = new ClientSecretCredential(process.env.ADMIN_GRAPH_TENANT_ID, process.env.ADMIN_GRAPH_CLIENT_ID, process.env.ADMIN_GRAPH_CLIENT_SECRET);
const token = await credential.getToken('https://graph.microsoft.com/.default');
const site = process.env.ADMIN_GRAPH_SITE_ID;
async function graph(path, method = 'GET', body) {
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, { method, headers: { Authorization: `Bearer ${token.token}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const value = await response.json();
  if (!response.ok) throw new Error(`${method} ${response.status}: ${value.error?.message}`);
  return value;
}
async function all(path) { const rows = []; while (path) { const page = await graph(path.replace('https://graph.microsoft.com/v1.0','')); rows.push(...page.value); path = page['@odata.nextLink']; } return rows; }
const lists = await all(`/sites/${site}/lists?$select=id,displayName`);
const ids = {};
for (const [key, displayName] of [['operations', 'Automation Operations'], ['deliveries', 'Deliveries']]) {
  let list = lists.find(l => l.displayName === displayName);
  if (!list) list = await graph(`/sites/${site}/lists`, 'POST', { displayName, list: { template: 'genericList' } });
  const columns = await all(`/sites/${site}/lists/${list.id}/columns`);
  const definitions = [
    { name: 'RecordKey', text: {}, indexed: true, enforceUniqueValues: true, required: true },
    { name: 'RecordState', text: {}, indexed: true },
    { name: 'RecordPending', boolean: {}, indexed: true },
    { name: 'OrderReference', text: {}, indexed: true },
    { name: 'RecordData', text: { allowMultipleLines: true, appendChangesToExistingText: false, textType: 'plain' } },
  ];
  for (const column of definitions) {
    const existing = columns.find(c => c.name === column.name);
    if (!existing) await graph(`/sites/${site}/lists/${list.id}/columns`, 'POST', column);
    else if (column.enforceUniqueValues && (!existing.enforceUniqueValues || !existing.indexed)) throw new Error(`${displayName}: RecordKey must be unique and indexed`);
  }
  ids[key] = list.id;
  console.log(`${displayName}: ready (${list.id})`);
}
const orderColumns = await all(`/sites/${site}/lists/${process.env.ADMIN_GRAPH_ORDERS_LIST_ID}/columns`);
if (!orderColumns.some(c => c.name === 'DeliveryGroupId')) await graph(`/sites/${site}/lists/${process.env.ADMIN_GRAPH_ORDERS_LIST_ID}/columns`, 'POST', { name: 'DeliveryGroupId', text: {}, indexed: true });
const control = await graph(`/sites/${site}/lists/${ids.operations}/items?$expand=fields&$filter=fields/RecordKey eq 'control'`);
if (!control.value.length) await graph(`/sites/${site}/lists/${ids.operations}/items`, 'POST', { fields: { Title: 'Worker control', RecordKey: 'control', RecordState: 'Control', RecordData: JSON.stringify({ enabled: false, updatedAt: new Date().toISOString() }) } });
await fs.mkdir('.next/cache', { recursive: true });
await fs.writeFile('.next/cache/fulfilment-lists.json', JSON.stringify(ids, null, 2));
console.log('Purchasing remains disabled. No existing orders changed.');
