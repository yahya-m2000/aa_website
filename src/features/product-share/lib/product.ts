export interface ShareProduct {
  id: string;
  title: string;
  priceUsd: number;
  imageUrl: string | null;
}

interface ApiProduct {
  title?: unknown;
  price?: { finalAmount?: unknown };
  images?: { url?: unknown; isPrimary?: unknown }[];
}

// Matches the A&A Shop API's own product cache window, so share pages never ask for a product
// more often than the API would have re-fetched it from the supplier anyway.
export const PRODUCT_REVALIDATE_SECONDS = 1800;

const PRODUCT_ID_PATTERN = /^\d{6,20}$/;

export function isValidProductId(id: string): boolean {
  return PRODUCT_ID_PATTERN.test(id);
}

function apiConfig() {
  const key = process.env.SHOP_API_KEY;
  if (!key) throw new Error('SHOP_API_KEY is not set');
  return {
    baseUrl: (process.env.SHOP_API_BASE_URL ?? 'https://api.aatradesolutions.com').replace(/\/$/, ''),
    key,
  };
}

/**
 * Returns null when the API says the product doesn't exist. Any other failure throws, so a
 * temporary supplier/API outage is never cached as a "not found" page (Next only caches 200s).
 */
export async function getShareProduct(id: string): Promise<ShareProduct | null> {
  const { baseUrl, key } = apiConfig();
  const response = await fetch(`${baseUrl}/api/products/${id}?sourceProductId=${id}`, {
    headers: { 'X-App-Api-Key': key, Accept: 'application/json' },
    next: { revalidate: PRODUCT_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(15000),
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Product API responded ${response.status} for ${id}`);

  const body = (await response.json()) as { success?: boolean; data?: ApiProduct };
  const data = body.data;
  if (!body.success || !data || typeof data.title !== 'string') {
    throw new Error(`Unexpected product API response for ${id}`);
  }

  const priceUsd = Number(data.price?.finalAmount);
  if (!Number.isFinite(priceUsd)) throw new Error(`Product ${id} has no usable price`);

  const images = Array.isArray(data.images) ? data.images : [];
  const primary = images.find((image) => image.isPrimary) ?? images[0];
  const imageUrl = typeof primary?.url === 'string' && primary.url.startsWith('https://') ? primary.url : null;

  return { id, title: data.title, priceUsd, imageUrl };
}
