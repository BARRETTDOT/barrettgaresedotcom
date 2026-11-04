import { createImageUrlBuilder } from '@sanity/image-url';
import { sanity } from './sanity';

const builder = createImageUrlBuilder(sanity);

/** Fixture images (pre-import) carry `_sanityAsset: "image@<url>"`; use the original URL directly. */
function fixtureUrl(src: any): string | undefined {
  const a = src?._sanityAsset as string | undefined;
  return a?.startsWith('image@') ? a.slice(6) : undefined;
}

export function hasImage(src: any): boolean {
  return Boolean(src?.asset || src?._sanityAsset);
}

/** One URL at a given width (and optional height, which crops around the hotspot). */
export function imageUrl(src: any, width: number, height?: number): string {
  const f = fixtureUrl(src);
  if (f) {
    const sq = [300, 500, 750, 1000, 1500, 2500].find((w) => w >= width) ?? 2500; // Squarespace's fixed sizes
    return f.replace('format=original', `format=${sq}w`);
  }
  let b = builder.image(src).width(width).auto('format').quality(80);
  if (height) b = b.height(height).fit('crop');
  return b.url();
}

/** srcset across sensible widths; `ratio` (h/w) crops when given. */
export function srcset(src: any, widths: number[], ratio?: number): string {
  return widths.map((w) => `${imageUrl(src, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`).join(', ');
}

/** Bundle for the shared body renderer. */
export const siteImages = { imageUrl, srcset, hasImage };
