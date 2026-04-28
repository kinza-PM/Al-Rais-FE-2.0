/**
 * Normalizes hotel image entries from various API shapes (path, url, imageUrl, or raw string).
 */
export function resolveHotelImageUrl(img: unknown): string | undefined {
  if (img == null) return undefined;
  if (typeof img === "string" && img.trim()) return img.trim();
  if (typeof img === "object") {
    const o = img as Record<string, unknown>;
    const u = o.path ?? o.url ?? o.imageUrl;
    if (typeof u === "string" && u.trim()) return u.trim();
  }
  return undefined;
}

/**
 * Collects up to `max` unique image URLs from common hotel detail shapes.
 */
export function collectHotelGalleryUrls(hotelDetail: unknown, max = 5): string[] {
  const h = hotelDetail as Record<string, unknown> | null | undefined;
  if (!h) return [];
  const raw = [
    ...(Array.isArray(h.images) ? h.images : []),
    ...(Array.isArray((h.propertyInfo as Record<string, unknown>)?.images)
      ? ((h.propertyInfo as Record<string, unknown>).images as unknown[])
      : []),
  ];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const u = resolveHotelImageUrl(item);
    if (u && !seen.has(u)) {
      seen.add(u);
      out.push(u);
      if (out.length >= max) break;
    }
  }
  return out;
}
