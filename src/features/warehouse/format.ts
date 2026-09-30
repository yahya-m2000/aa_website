import type { WarehouseLang } from './i18n';

// The warehouse is in Guangzhou, so times are always shown in China Standard Time.
export function formatWarehouseDate(iso: string | undefined, lang: WarehouseLang, withTime = true): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-GB', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

export function normalizeReference(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}
