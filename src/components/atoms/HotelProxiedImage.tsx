import React, { useEffect, useRef, useState } from "react";
import { api } from "../../services/axios";

export function isHotelRemoteImageUrl(src: string | undefined): boolean {
  if (!src || typeof src !== "string") return false;
  return /^https?:\/\//i.test(src.trim());
}

function inferMimeFromUrl(url: string): string {
  const extMatch = url.match(/\.(png|jpg|jpeg|gif|webp)$/i);
  if (!extMatch) return "jpeg";
  const e = extMatch[1].toLowerCase();
  return e === "jpg" ? "jpeg" : e;
}

export type HotelProxiedImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback: string;
};

/**
 * Loads supplier hotel images via `/imageProxy` when `src` is remote HTTPS.
 * Avoids browser TLS issues (e.g. ERR_CERT_VERIFIER_CHANGED) and reduces parallel
 * direct CDN connections. Fetches only when the image scrolls near the viewport.
 */
export const HotelProxiedImage: React.FC<HotelProxiedImageProps> = React.memo(
  ({ src, alt, className, style, fallback }) => {
    const [displaySrc, setDisplaySrc] = useState<string>(() =>
      isHotelRemoteImageUrl(src) ? fallback : src,
    );
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const doneRef = useRef(false);
    const genRef = useRef(0);

    useEffect(() => {
      const g = ++genRef.current;
      doneRef.current = false;
      if (!isHotelRemoteImageUrl(src)) {
        setDisplaySrc(src);
        return;
      }
      setDisplaySrc(fallback);

      const el = wrapRef.current;
      if (!el) return;

      let active: AbortController | null = null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting || doneRef.current) return;
          doneRef.current = true;
          active?.abort();
          active = new AbortController();
          const ac = active;
          (async () => {
            try {
              const base64 = await api.get<string>(
                "/imageProxy",
                { imageUrl: src },
                ac.signal,
              );
              if (genRef.current !== g) return;
              const mime = inferMimeFromUrl(src);
              setDisplaySrc(`data:image/${mime};base64,${base64}`);
            } catch (err: unknown) {
              const e = err as { name?: string; code?: string };
              if (e?.name === "AbortError" || e?.code === "ERR_CANCELED") return;
              if (genRef.current === g) setDisplaySrc(fallback);
            }
          })();
        },
        { rootMargin: "180px", threshold: 0.01 },
      );

      obs.observe(el);
      return () => {
        obs.disconnect();
        active?.abort();
      };
    }, [src, fallback]);

    return (
      <div ref={wrapRef} className="h-full w-full">
        <img
          src={displaySrc}
          alt={alt}
          className={className}
          style={style}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = fallback;
          }}
        />
      </div>
    );
  },
);

HotelProxiedImage.displayName = "HotelProxiedImage";
