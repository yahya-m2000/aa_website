import { getGraphClient } from '@/core/graph/graph.client';
import { graphEnv } from '@/core/graph/env';
import type { OrderLineItem } from '@/features/admin-orders/types';

// Chinese product text for orders placed before checkout started keeping it. Stored in its own
// list rather than on the order: LineItemsJson is part of the procurement identity check, so it
// must never be rewritten on an existing order.
export const TRANSLATIONS_LIST_NAME = 'Product Translations';

export interface ProductTranslation {
  titleZh?: string;
  variantZh?: string;
}

export function translationKey(line: Pick<OrderLineItem, 'sourceProductId' | 'productId' | 'skuId'>): string {
  return `${line.sourceProductId || line.productId}:${line.skuId ?? ''}`;
}

let cachedListId: Promise<string | null> | undefined;
function listId(): Promise<string | null> {
  if (process.env.ADMIN_GRAPH_TRANSLATIONS_LIST_ID) return Promise.resolve(process.env.ADMIN_GRAPH_TRANSLATIONS_LIST_ID);
  cachedListId ??= getGraphClient()
    .api(`/sites/${graphEnv.siteId}/lists`)
    .filter(`displayName eq '${TRANSLATIONS_LIST_NAME}'`)
    .select('id')
    .get()
    .then((page: { value?: Array<{ id: string }> }) => page.value?.[0]?.id ?? null)
    .catch(() => {
      cachedListId = undefined;
      return null;
    });
  return cachedListId;
}

export async function loadTranslations(keys: string[]): Promise<Map<string, ProductTranslation>> {
  const found = new Map<string, ProductTranslation>();
  const unique = [...new Set(keys)].filter(Boolean);
  if (!unique.length) return found;
  try {
    const id = await listId();
    if (!id) return found;
    for (let start = 0; start < unique.length; start += 15) {
      const filter = unique
        .slice(start, start + 15)
        .map((key) => `fields/TranslationKey eq '${key.replace(/'/g, "''")}'`)
        .join(' or ');
      const page: { value?: Array<{ fields: Record<string, string | undefined> }> } = await getGraphClient()
        .api(`/sites/${graphEnv.siteId}/lists/${id}/items`)
        .expand('fields')
        .filter(filter)
        .top(50)
        .get();
      for (const item of page.value ?? []) {
        const f = item.fields;
        if (f.TranslationKey) found.set(f.TranslationKey, { titleZh: f.TitleZh || undefined, variantZh: f.VariantZh || undefined });
      }
    }
  } catch (error) {
    // Chinese text is a convenience; the page still works in English without it.
    console.error('[warehouse] Could not load product translations', error);
  }
  return found;
}
