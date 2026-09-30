// Additive, repeatable provisioning for warehouse staff sign-in. Creates the "Staff Accounts"
// list and its columns if missing. Never creates accounts or changes existing values.
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

const displayName = 'Staff Accounts';
const lists = await all(`/sites/${site}/lists?$select=id,displayName`);
let list = lists.find(l => l.displayName === displayName);
if (!list) list = await graph(`/sites/${site}/lists`, 'POST', { displayName, list: { template: 'genericList' } });
const columns = await all(`/sites/${site}/lists/${list.id}/columns`);
// All single-line: every account write is a partial PATCH, and SharePoint drops multi-line
// columns omitted from partial PATCHes.
const definitions = [
  { name: 'Username', text: {}, indexed: true, enforceUniqueValues: true, required: true },
  // Not "DisplayName": SharePoint accepts writes to a column with that name but silently drops them.
  { name: 'StaffName', text: {} },
  { name: 'Role', text: {} },
  { name: 'PasswordHash', text: {} },
  { name: 'Active', boolean: {} },
  { name: 'MustChangePassword', boolean: {} },
  { name: 'FailedAttempts', number: {} },
  { name: 'LockedUntil', dateTime: {} },
  { name: 'SessionVersion', number: {} },
  { name: 'LastSignInAt', dateTime: {} },
  { name: 'PasswordChangedAt', dateTime: {} },
];
for (const column of definitions) {
  const existing = columns.find(c => c.name === column.name);
  if (!existing) {
    await graph(`/sites/${site}/lists/${list.id}/columns`, 'POST', column);
    console.log(`  added column ${column.name}`);
  } else if (column.enforceUniqueValues && (!existing.enforceUniqueValues || !existing.indexed)) {
    throw new Error(`${displayName}: Username must be unique and indexed`);
  }
}
console.log(`${displayName}: ready`);
console.log(`Set ADMIN_GRAPH_STAFF_LIST_ID=${list.id}`);
console.log('No accounts were created. Add them from the admin portal Staff page.');
