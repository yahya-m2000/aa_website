import { renderPreviewImage } from '@/features/product-share/lib/preview-image';
import { getShareProduct, isValidProductId } from '@/features/product-share/lib/product';

export const runtime = 'nodejs';

const CACHE_SUCCESS = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';
const CACHE_FALLBACK = 'public, max-age=60, s-maxage=60';

function jpeg(body: Buffer, cacheControl: string, status = 200): Response {
  return new Response(new Uint8Array(body), {
    status,
    headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': cacheControl },
  });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidProductId(id)) return new Response('Not found', { status: 404 });

  try {
    const product = await getShareProduct(id);
    if (!product) return jpeg(await renderPreviewImage(null), CACHE_FALLBACK, 404);
    return jpeg(await renderPreviewImage(product.imageUrl), CACHE_SUCCESS);
  } catch (error) {
    console.error(`[preview.jpg] ${id}:`, error);
    return jpeg(await renderPreviewImage(null), CACHE_FALLBACK);
  }
}
