export type HeroCarouselSlide = {
  id: string;
  title?: string;
  message?: string;
  ctaTabs?: string[];
  imageUrl: string;
  altText?: string;
  overlayColor?: string;
  enabled?: boolean;
  order?: number;
};

type Cache = { ts: number; items: HeroCarouselSlide[] } | null;
let cache: Cache = null;

function baseUrl(): string {
  const raw =
    (import.meta.env.VITE_CONTENT_API_BASE as string | undefined)?.trim() ||
    (import.meta.env.VITE_CONTENT_SVC_BASE_URL as string | undefined)?.trim();
  return (raw || "").replace(/\/+$/, "");
}

export async function fetchPublicHeroCarousel(opts?: { force?: boolean }): Promise<HeroCarouselSlide[]> {
  const ttlMs = 5 * 60 * 1000;
  if (!opts?.force && cache && Date.now() - cache.ts < ttlMs) return cache.items;

  const b = baseUrl();
  if (!b) throw new Error("Missing content service base URL (set VITE_CONTENT_API_BASE)");

  const res = await fetch(`${b}/public/hero-carousel`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to load hero carousel");
  const data = (await res.json()) as any;
  const items = Array.isArray(data?.items) ? (data.items as HeroCarouselSlide[]) : [];
  cache = { ts: Date.now(), items };
  return items;
}

