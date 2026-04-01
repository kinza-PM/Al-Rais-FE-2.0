import { useEffect, useRef, useState, type RefObject } from "react";

const DEFAULT_PAGE = 24;

/**
 * Renders long hotel lists in chunks; expands when the sentinel enters view.
 * `resetKey` should change when the user runs a new search so the window restarts at page 1.
 */
export function useProgressiveList<T>(
  items: T[],
  pageSize: number = DEFAULT_PAGE,
  resetKey?: string | number,
): {
  visible: T[];
  sentinelRef: RefObject<HTMLDivElement | null>;
  hasMore: boolean;
} {
  const [count, setCount] = useState(() =>
    Math.min(pageSize, items.length),
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCount(Math.min(pageSize, items.length));
  }, [resetKey, pageSize, items.length]);

  const hasMore = count < items.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setCount((c) => Math.min(c + pageSize, items.length));
        }
      },
      { rootMargin: "400px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [count, items.length, pageSize, hasMore]);

  return {
    visible: items.slice(0, count),
    sentinelRef,
    hasMore,
  };
}
