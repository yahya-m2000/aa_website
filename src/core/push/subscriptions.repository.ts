import { graphEnv } from '@/core/graph/env';
import { GraphRequestError, getGraphClient } from '@/core/graph/graph.client';

function listBase(): string {
  return `/sites/${graphEnv.siteId}/lists/${graphEnv.pushSubscriptionsListId}`;
}

export interface StoredPushSubscription {
  itemId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface PushSubscriptionFields {
  Endpoint: string;
  P256dh: string;
  Auth: string;
  UserAgent?: string;
  CreatedAt: string;
}

// Endpoint URLs are unique per browser install, so they double as the natural de-dupe key —
// re-subscribing the same device (e.g. after clearing the service worker) should update the
// existing row rather than accumulate duplicates that'd each get a separate push attempt.
export async function saveSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
}): Promise<void> {
  const client = getGraphClient();
  try {
    const escaped = subscription.endpoint.replace(/'/g, "''");
    const existing = await client
      .api(`${listBase()}/items`)
      .filter(`fields/Endpoint eq '${escaped}'`)
      .expand('fields')
      .get();

    const fields: PushSubscriptionFields = {
      Endpoint: subscription.endpoint,
      P256dh: subscription.keys.p256dh,
      Auth: subscription.keys.auth,
      UserAgent: subscription.userAgent,
      CreatedAt: new Date().toISOString(),
    };

    const items = existing.value ?? [];
    if (items.length > 0) {
      await client.api(`${listBase()}/items/${items[0].id}`).patch({ fields });
    } else {
      await client.api(`${listBase()}/items`).post({ fields });
    }
  } catch (error) {
    throw new GraphRequestError('Failed to save push subscription', undefined, error);
  }
}

export async function deleteSubscription(endpoint: string): Promise<void> {
  const client = getGraphClient();
  try {
    const escaped = endpoint.replace(/'/g, "''");
    const existing = await client
      .api(`${listBase()}/items`)
      .filter(`fields/Endpoint eq '${escaped}'`)
      .get();

    for (const item of existing.value ?? []) {
      await client.api(`${listBase()}/items/${item.id}`).delete();
    }
  } catch (error) {
    throw new GraphRequestError('Failed to delete push subscription', undefined, error);
  }
}

export async function listSubscriptions(): Promise<StoredPushSubscription[]> {
  const client = getGraphClient();
  try {
    const result = await client.api(`${listBase()}/items`).expand('fields').get();
    const items = (result.value ?? []) as Array<{ id: string; fields: PushSubscriptionFields }>;
    return items.map((item) => ({
      itemId: item.id,
      endpoint: item.fields.Endpoint,
      p256dh: item.fields.P256dh,
      auth: item.fields.Auth,
    }));
  } catch (error) {
    throw new GraphRequestError('Failed to list push subscriptions', undefined, error);
  }
}
