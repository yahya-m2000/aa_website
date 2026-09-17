// Provisioning script: creates the "PushSubscriptions" SharePoint list used to store Web Push
// subscriptions for admin staff (see src/core/push). Run once per environment with:
//   npx tsx scripts/create-push-subscriptions-list.ts
// Prints the new list's id — put that in .env as ADMIN_GRAPH_PUSH_SUBSCRIPTIONS_LIST_ID.
import 'dotenv/config';
import { getGraphClient } from '../src/core/graph/graph.client';
import { graphEnv } from '../src/core/graph/env';

async function main() {
  const client = getGraphClient();

  const list = await client.api(`/sites/${graphEnv.siteId}/lists`).post({
    displayName: 'PushSubscriptions',
    list: { template: 'genericList' },
  });

  // Created as separate calls, not inline in the list POST body — SharePoint rejected the
  // combined payload (400 invalidRequest) when text columns were included at list-creation time.
  const columns = ['Endpoint', 'P256dh', 'Auth', 'UserAgent', 'CreatedAt'];
  for (const name of columns) {
    await client.api(`/sites/${graphEnv.siteId}/lists/${list.id}/columns`).post({
      name,
      text: { allowMultipleLines: false },
    });
  }

  console.log('Created list:', list.id, list.displayName);
}

main().catch((error) => {
  console.error('Failed to create list:', error);
  process.exit(1);
});
