import { randomUUID } from 'node:crypto';
import { getGraphClient } from '@/core/graph/graph.client';
import { graphEnv } from '@/core/graph/env';

export type Actor = { name: string; email?: string; source: 'Admin portal' | 'Warehouse' | 'Automation' | 'Customer' };
export interface ActivityEvent {
  key: string;
  occurredAt: string;
  actorName: string;
  actorEmail?: string;
  source: Actor['source'];
  action: string;
  details?: string;
}
export const automationActor: Actor = { name: 'A&A automation', source: 'Automation' };
export function actorFromSession(session: { user?: { name?: string | null; email?: string | null } }) : Actor {
  return { name: session.user?.name || session.user?.email || 'Unknown staff', email: session.user?.email || undefined, source: 'Admin portal' };
}
export function auditFields(actor: Actor, action: string, at = new Date().toISOString()) {
  return {
    LastModifiedByName: actor.name.slice(0, 255),
    LastModifiedByEmail: (actor.email ?? '').slice(0, 255),
    LastModifiedAt: at,
    LastModifiedAction: action.slice(0, 255),
    LastModifiedSource: actor.source,
  };
}
async function bounded<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([promise, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Activity request timed out')), 5000);
    })]);
  } finally { clearTimeout(timer); }
}
function base() {
  return `/sites/${graphEnv.siteId}/lists/${process.env.ADMIN_GRAPH_ACTIVITY_LIST_ID}/items`;
}
export async function recordActivity(input: {
  reference: string; actor: Actor; action: string; details?: string; eventKey?: string; occurredAt?: string;
}): Promise<void> {
  if (!process.env.ADMIN_GRAPH_ACTIVITY_LIST_ID) return;
  try {
    const key = input.eventKey ?? randomUUID();
    // Never truncate a deduplication key: that could merge unrelated events.
    if (key.length > 255) throw new Error('Activity key exceeds SharePoint limit');
    const client = getGraphClient();
    try {
      await bounded(client.api(base()).post({ fields: {
        Title: key, EventKey: key, OrderReference: input.reference,
        OccurredAt: input.occurredAt ?? new Date().toISOString(),
        ActorName: input.actor.name.slice(0, 255), ActorEmail: (input.actor.email ?? '').slice(0, 255),
        Source: input.actor.source, Action: input.action.slice(0, 255), Details: input.details ?? '',
      } }));
    } catch (error) {
      // Both uniqueness conflicts and lost POST responses are resolved by the same key.
      const existing = await bounded(client.api(base()).expand('fields')
        .filter(`fields/EventKey eq '${key.replace(/'/g, "''")}'`).get());
      if (!existing.value?.length) throw error;
    }
  } catch (error) { console.error('[order-activity] Could not record activity', error); }
}
export async function listActivity(reference: string, limit = 50): Promise<ActivityEvent[]> {
  if (!process.env.ADMIN_GRAPH_ACTIVITY_LIST_ID) return [];
  const events: ActivityEvent[] = [];
  try {
    const count = Math.max(1, Math.min(50, limit));
    let next: string | undefined = base();
    const seen = new Set<string>();
    while (next && events.length < count && !seen.has(next)) {
      seen.add(next);
      let request = getGraphClient().api(next).expand('fields').top(count - events.length)
        .header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly');
      if (seen.size === 1) request = request.filter(`fields/OrderReference eq '${reference.replace(/'/g, "''")}'`).orderby('fields/OccurredAt desc');
      const page: { value?: Array<{ fields: Record<string, string> }>; '@odata.nextLink'?: string } = await bounded(request.get());
      for (const item of page.value ?? []) {
        const f = item.fields;
        events.push({ key: f.EventKey, occurredAt: f.OccurredAt, actorName: f.ActorName,
          actorEmail: f.ActorEmail, source: f.Source as Actor['source'], action: f.Action, details: f.Details });
      }
      next = page['@odata.nextLink'];
    }
    return events.slice(0, count);
  } catch (error) {
    console.error('[order-activity] Could not read activity', error);
    return events;
  }
}
