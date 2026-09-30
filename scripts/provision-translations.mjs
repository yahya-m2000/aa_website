// Additive, repeatable provisioning for Chinese product text on orders placed before checkout
// started keeping it. Creates the "Product Translations" list if missing. Never touches orders.
import nextEnv from '@next/env';
import { ClientSecretCredential } from '@azure/identity';
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
async function all(path) { const rows = []; while (path) { const page = await graph(path.replace('https://graph.microsoft.com/v1.0', '')); rows.push(...page.value); path = page['@odata.nextLink']; } return rows; }

const displayName = 'Product Translations';
const lists = await all(`/sites/${site}/lists?$select=id,displayName`);
let list = lists.find(l => l.displayName === displayName);
if (!list) list = await graph(`/sites/${site}/lists`, 'POST', { displayName, list: { template: 'genericList' } });
const columns = await all(`/sites/${site}/lists/${list.id}/columns`);
const definitions = [
  // "<sourceProductId>:<skuId>" — one row per product variant, shared by every order containing it.
  { name: 'TranslationKey', text: {}, indexed: true, enforceUniqueValues: true, required: true },
  { name: 'SourceProductId', text: {} },
  { name: 'SkuId', text: {} },
  { name: 'TitleZh', text: {} },
  { name: 'VariantZh', text: {} },
];
for (const column of definitions) {
  const existing = columns.find(c => c.name === column.name);
  if (!existing) {
    await graph(`/sites/${site}/lists/${list.id}/columns`, 'POST', column);
    console.log(`  added column ${column.name}`);
  } else if (column.enforceUniqueValues && (!existing.enforceUniqueValues || !existing.indexed)) {
    throw new Error(`${displayName}: TranslationKey must be unique and indexed`);
  }
}
console.log(`${displayName}: ready (${list.id})`);
console.log('The website finds this list by name; no environment variable is required.');
