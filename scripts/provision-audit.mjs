// Additive and repeatable: schema only; never writes orders or worker control.
import nextEnv from '@next/env';
import { ClientSecretCredential } from '@azure/identity';
nextEnv.loadEnvConfig(process.cwd());
const required = ['ADMIN_GRAPH_TENANT_ID', 'ADMIN_GRAPH_CLIENT_ID', 'ADMIN_GRAPH_CLIENT_SECRET', 'ADMIN_GRAPH_SITE_ID', 'ADMIN_GRAPH_ORDERS_LIST_ID'];
for (const key of required) if (!process.env[key]) throw new Error(`Missing ${key}`);
const credential = new ClientSecretCredential(process.env.ADMIN_GRAPH_TENANT_ID, process.env.ADMIN_GRAPH_CLIENT_ID, process.env.ADMIN_GRAPH_CLIENT_SECRET);
const token = await credential.getToken('https://graph.microsoft.com/.default');
const site = `/sites/${process.env.ADMIN_GRAPH_SITE_ID}`;
async function graph(path, method = 'GET', body) {
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    method, headers: { Authorization: `Bearer ${token.token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const value = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(`${method} ${response.status}: ${value.error?.message}`);
  return value;
}
async function all(path) {
  const rows = [];
  while (path) {
    const page = await graph(path.replace('https://graph.microsoft.com/v1.0', ''));
    rows.push(...page.value); path = page['@odata.nextLink'];
  }
  return rows;
}
const singleLine = { allowMultipleLines: false, maxLength: 255 };
async function ensureColumns(base, definitions) {
  const columns = await all(`${base}/columns`);
  for (const definition of definitions) {
    const existing = columns.find(c => c.name === definition.name);
    if (!existing) {
      await graph(`${base}/columns`, 'POST', definition);
      console.log(`Created ${definition.name}`);
    } else {
      if (definition.text && (!existing.text || Boolean(existing.text.allowMultipleLines) !== Boolean(definition.text.allowMultipleLines)))
        throw new Error(`${definition.name}: unexpected column type; manual review required`);
      if (definition.dateTime && !existing.dateTime) throw new Error(`${definition.name}: expected dateTime`);
      if (definition.enforceUniqueValues && (!existing.enforceUniqueValues || !existing.indexed || !existing.required))
        throw new Error(`${definition.name} must be unique, required and indexed`);
      if (definition.indexed && !existing.indexed) await graph(`${base}/columns/${existing.id}`, 'PATCH', { indexed: true });
    }
  }
  return columns;
}
const orders = `${site}/lists/${process.env.ADMIN_GRAPH_ORDERS_LIST_ID}`;
const columns = await ensureColumns(orders, [
  ...['LastModifiedByName', 'LastModifiedByEmail', 'LastModifiedAction', 'LastModifiedSource'].map(name => ({ name, text: singleLine })),
  { name: 'LastModifiedAt', dateTime: { format: 'dateTime' } },
]);
for (const name of ['InternalStatus', 'CreatedAt']) {
  const column = columns.find(c => c.name === name);
  if (!column) throw new Error(`Orders column ${name} is missing`);
  if (!column.indexed) {
    await graph(`${orders}/columns/${column.id}`, 'PATCH', { indexed: true });
    console.log(`Indexed ${name}`);
  }
}
const lists = await all(`${site}/lists?$select=id,displayName`);
const activity = lists.find(list => list.displayName === 'Order Activity') ?? await graph(`${site}/lists`, 'POST', { displayName: 'Order Activity', list: { template: 'genericList' } });
await ensureColumns(`${site}/lists/${activity.id}`, [
  { name: 'EventKey', text: singleLine, indexed: true, enforceUniqueValues: true, required: true },
  { name: 'OrderReference', text: singleLine, indexed: true },
  { name: 'OccurredAt', dateTime: { format: 'dateTime' }, indexed: true },
  ...['ActorName', 'ActorEmail', 'Source', 'Action'].map(name => ({ name, text: singleLine })),
  { name: 'Details', text: { allowMultipleLines: true, appendChangesToExistingText: false, textType: 'plain' } },
]);
console.log(`ADMIN_GRAPH_ACTIVITY_LIST_ID=${activity.id}\nGRAPH_ACTIVITY_LIST_ID=${activity.id}`);
console.log('Audit schema ready. No order values or purchasing controls changed.');
