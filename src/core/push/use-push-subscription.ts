'use client';

import { useEffect, useState } from 'react';

export type PushSubscriptionStatus =
  | 'unsupported'
  | 'idle'
  | 'subscribing'
  | 'subscribed'
  | 'denied'
  | 'error';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const bytes = Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  return bytes.buffer;
}

async function registerAndSubscribe(vapidPublicKey: string): Promise<void> {
  const registration = await navigator.serviceWorker.register('/push-sw.js');
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  await fetch('/api/admin/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
  });
}

// Auto-subscribes staff to "new order" push notifications the first time they land on the
// admin portal with a browser that supports it and hasn't already denied permission — no
// separate opt-in UI, since every admin user is expected to want this (internal tool, not a
// public site where unsolicited permission prompts would be hostile). Safe to call on every
// admin page load: browsers no-op a permission request that was already granted or denied, and
// registerAndSubscribe reuses any existing subscription instead of creating a new one.
export function usePushSubscription(): PushSubscriptionStatus {
  const [status, setStatus] = useState<PushSubscriptionStatus>('idle');

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      setStatus('unsupported');
      return;
    }

    if (Notification.permission === 'denied') {
      setStatus('denied');
      return;
    }

    let cancelled = false;
    setStatus('subscribing');

    (async () => {
      const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
      if (cancelled) return;
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      try {
        await registerAndSubscribe(vapidPublicKey);
        if (!cancelled) setStatus('subscribed');
      } catch (error) {
        console.error('[push] Failed to subscribe:', error);
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
