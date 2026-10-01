const ALLOWED_IMAGE_HOSTS = ['.alicdn.com', '.taobaocdn.com'];

export function isAllowedImageUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' && ALLOWED_IMAGE_HOSTS.some((suffix) => hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

// Alibaba's CDN serves a resized copy when "_<w>x<h>q<quality>.jpg" is appended to the original
// URL (the response is still WebP whatever the extension says).
export function sizedImageUrl(url: string, size: number): string {
  if (!isAllowedImageUrl(url) || /_\d+x\d+(q\d+)?\.(jpg|png|webp)$/i.test(url)) return url;
  return `${url}_${size}x${size}q90.jpg`;
}
