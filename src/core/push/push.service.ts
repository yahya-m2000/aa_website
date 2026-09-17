import webpush from 'web-push';
import { deleteSubscription, listSubscriptions } from './subscriptions.repository';

let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  const publicKey = process.env.PUSH_VAPID_PUBLIC_KEY;
  const privateKey = process.env.PUSH_VAPID_PRIVATE_KEY;
  const subject = process.env.PUSH_VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      'Web Push is not configured: PUSH_VAPID_PUBLIC_KEY, PUSH_VAPID_PRIVATE_KEY, and PUSH_VAPID_SUBJECT must all be set.',
    );
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Broadcasts to every subscribed staff device — there's no per-role/per-user targeting in the
 * admin session today (see auth.config.ts), and "any staff member sees new orders" is the
 * actual requirement, not "the right staff member." A dead subscription (410 Gone, or 404 — the
 * push service no longer recognizes it, e.g. the browser data was cleared) is removed rather
 * than retried, matching how every other best-effort notification channel in this codebase
 * (WhatsApp, email) treats permanent delivery failures.
 */
export async function notifyStaff(payload: PushPayload): Promise<void> {
  ensureConfigured();
  const subscriptions = await listSubscriptions();
  if (subscriptions.length === 0) return;

  const body = JSON.stringify(payload);

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await deleteSubscription(sub.endpoint).catch(() => {});
        } else {
          console.error('[push] Failed to send notification:', error);
        }
      }
    }),
  );
}
