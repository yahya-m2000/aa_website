import { readFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

import { isAllowedImageUrl, sizedImageUrl } from './images';

const WIDTH = 1200;
const HEIGHT = 630;
const PHOTO = 500;
const PHOTO_RADIUS = 28;
const BORDER = 8;
const MAX_SOURCE_BYTES = 8 * 1024 * 1024;

const LAVENDER = '#eee6f8';
const BLOB = '#d7c2f0';

// Read at runtime, so next.config.ts's outputFileTracingIncludes must list it for Vercel.
export const PREVIEW_LOGO_FILE = 'public/images/aa-logo-ink.png';

async function fetchSourceImage(url: string): Promise<Buffer | null> {
  if (!isAllowedImageUrl(url)) return null;
  const response = await fetch(sizedImageUrl(url, 800), { signal: AbortSignal.timeout(10000) });
  if (!response.ok) return null;
  const length = Number(response.headers.get('content-length') ?? 0);
  if (length > MAX_SOURCE_BYTES) return null;
  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer.length > MAX_SOURCE_BYTES ? null : buffer;
}

function roundedRect(size: number, radius: number, fill: string): Buffer {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${fill}"/></svg>`,
  );
}

async function framedPhoto(source: Buffer): Promise<Buffer> {
  const photo = await sharp(source)
    .resize(PHOTO, PHOTO, { fit: 'cover' })
    .composite([{ input: roundedRect(PHOTO, PHOTO_RADIUS, '#000'), blend: 'dest-in' }])
    .png()
    .toBuffer();
  const framed = PHOTO + BORDER * 2;
  // Two passes: sharp always rotates before compositing within a single pipeline.
  const card = await sharp(roundedRect(framed, PHOTO_RADIUS + BORDER, '#ffffff'))
    .composite([{ input: photo, left: BORDER, top: BORDER }])
    .png()
    .toBuffer();
  return sharp(card)
    .rotate(-3, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function logo(width: number): Promise<Buffer> {
  const file = await readFile(path.join(process.cwd(), PREVIEW_LOGO_FILE));
  return sharp(file).resize({ width }).png().toBuffer();
}

/**
 * 1200x630 JPEG for WhatsApp/social link previews. Taobao's CDN only ever serves WebP, which
 * WhatsApp renders unreliably, and WhatsApp drops images over ~300KB, so this re-encodes to a
 * small JPEG. Pass null (or an unusable URL) to get the brand-only card.
 */
export async function renderPreviewImage(imageUrl: string | null): Promise<Buffer> {
  const blobSize = 600;
  const layers: sharp.OverlayOptions[] = [
    {
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${blobSize}" height="${blobSize}"><circle cx="${blobSize / 2}" cy="${blobSize / 2}" r="${blobSize / 2}" fill="${BLOB}"/></svg>`,
      ),
      left: (WIDTH - blobSize) / 2,
      top: (HEIGHT - blobSize) / 2,
    },
  ];

  const source = imageUrl ? await fetchSourceImage(imageUrl).catch(() => null) : null;
  if (source) {
    const photo = await framedPhoto(source);
    const { width = PHOTO, height = PHOTO } = await sharp(photo).metadata();
    layers.push({ input: photo, left: Math.round((WIDTH - width) / 2), top: Math.round((HEIGHT - height) / 2) });
    layers.push({ input: await logo(150), left: 56, top: HEIGHT - 56 - 45 });
  } else {
    const mark = await logo(360);
    const { height = 107 } = await sharp(mark).metadata();
    layers.push({ input: mark, left: (WIDTH - 360) / 2, top: Math.round((HEIGHT - height) / 2) });
  }

  return sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: LAVENDER } })
    .composite(layers)
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}
