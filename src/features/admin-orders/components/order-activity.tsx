'use client';

import { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { ActivityEvent } from '../audit';
import type { OrderListItemFields } from '../types';

export function RelativeTime({ at }: { at?: string }) {
  const [now, setNow] = useState<number>();
  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);
  if (!at || !Number.isFinite(Date.parse(at))) return <span>Unknown time</span>;
  const date = new Date(at);
  let label = date.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  if (now !== undefined) {
    const seconds = (date.getTime() - now) / 1000;
    const [unit, divisor]: [Intl.RelativeTimeFormatUnit, number] = Math.abs(seconds) < 60 ? ['second', 1] : Math.abs(seconds) < 3600 ? ['minute', 60] : Math.abs(seconds) < 86400 ? ['hour', 3600] : ['day', 86400];
    label = new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(Math.round(seconds / divisor), unit);
  }
  return <time dateTime={at} title={date.toUTCString()}>{label}</time>;
}
export function LastChanged({ fields: f }: { fields: OrderListItemFields }) {
  return <p className="w-full break-words text-xs leading-relaxed text-[rgb(var(--muted-foreground))]">
    {f.LastModifiedByName ? <>{f.LastModifiedSource === 'Automation' && <Bot size={14} className="mr-1 inline" />}Last changed by <strong>{f.LastModifiedByName}</strong> · <RelativeTime at={f.LastModifiedAt} />{f.LastModifiedAction && <> — {f.LastModifiedAction}</>}</> : <>Created <RelativeTime at={f.CreatedAt} /></>}
  </p>;
}
export function OrderActivity({ events = [] }: { events?: ActivityEvent[] }) {
  const [expanded, setExpanded] = useState(false);
  return <Card className="order-7 min-w-0 lg:order-none">
    <CardHeader><CardTitle className="text-lg">Activity</CardTitle></CardHeader>
    <CardContent>
      {!events.length && <p className="text-sm text-[rgb(var(--muted-foreground))]">No activity recorded yet.</p>}
      <ol className="space-y-4">{events.slice(0, expanded ? 50 : 10).map(event => <li key={event.key} className="border-b border-[rgb(var(--border))] pb-4 text-sm last:border-0">
        <div className="flex flex-wrap items-center gap-2"><span className="break-words font-medium">{event.source === 'Automation' && <Bot size={14} className="mr-1 inline" />}{event.actorName}</span><Badge variant="neutral">{event.source}</Badge></div>
        <p className="mt-1 break-words">{event.action}</p>
        <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]"><RelativeTime at={event.occurredAt} /></p>
        {event.details && <details className="mt-2"><summary className="cursor-pointer text-xs">Details</summary><p className="mt-2 whitespace-pre-wrap break-words text-xs">{event.details}</p></details>}
      </li>)}</ol>
      {events.length > 10 && <Button variant="ghost" size="sm" className="mt-3" onClick={() => setExpanded(!expanded)}>{expanded ? 'Show less' : `Show all (${events.length})`}</Button>}
    </CardContent>
  </Card>;
}
