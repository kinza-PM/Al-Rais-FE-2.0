import React, { useMemo } from "react";

export type SightseeingDetailGalleryProps = {
  imageUrls: string[];
  alt: string;
  className?: string;
};

/**
 * Figma-style gallery: one large tile + 3×2 grid. When more than seven images exist,
 * the bottom-right tile keeps the sixth thumbnail and shows “+N” for the remainder.
 */
const SightseeingDetailGallery: React.FC<SightseeingDetailGalleryProps> = ({
  imageUrls,
  alt,
  className = "",
}) => {
  const { main, gridSix, moreCount } = useMemo(() => {
    const urls = imageUrls.map((u) => u.trim()).filter(Boolean);
    if (urls.length === 0) {
      return { main: null as string | null, gridSix: [] as string[], moreCount: 0 };
    }
    const mainUrl = urls[0];
    const rest = urls.slice(1);
    const grid = rest.slice(0, 6);
    const moreCount = Math.max(0, urls.length - 7);
    return { main: mainUrl, gridSix: grid, moreCount };
  }, [imageUrls]);

  if (!main) {
    return (
      <div
        className={`flex min-h-[200px] items-center justify-center rounded-2xl bg-[#EEF2F6] text-[14px] text-[#64748B] ${className}`}
      >
        No photos for this activity yet.
      </div>
    );
  }

  const mobileThumbs = imageUrls.slice(1).slice(0, 6);
  const overlayIdx = moreCount > 0 && mobileThumbs.length > 0 ? mobileThumbs.length - 1 : -1;

  const tile = (
    src: string,
    idx: number,
    opts: { showMore?: boolean; moreCount?: number; roundedClass?: string },
  ) => (
    <div
      key={`${src}-${idx}`}
      className={`relative min-h-0 overflow-hidden ${opts.roundedClass ?? "rounded-2xl"}`}
    >
      <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      {opts.showMore && opts.moreCount != null && opts.moreCount > 0 ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-[20px] font-bold text-white sm:text-[22px]">
            +{opts.moreCount}
          </span>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className={className}>
      <div className="flex flex-col gap-3 md:hidden">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
          <img src={main} alt={alt} className="h-full w-full object-cover" loading="eager" />
        </div>
        {mobileThumbs.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {mobileThumbs.map((src, i) =>
              tile(src, i, {
                showMore: i === overlayIdx,
                moreCount,
                roundedClass: "aspect-[5/3] rounded-xl",
              }),
            )}
          </div>
        ) : null}
      </div>

      <div
        className={
          gridSix.length === 0
            ? "hidden md:block"
            : "hidden gap-4 md:grid md:h-[min(333px,calc(100vw-120px))] md:max-h-[333px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
        }
      >
        <div
          className={
            gridSix.length === 0
              ? "relative min-h-[280px] overflow-hidden rounded-2xl md:max-h-[333px]"
              : "relative min-h-[240px] overflow-hidden rounded-2xl"
          }
        >
          <img src={main} alt={alt} className="h-full w-full object-cover" loading="eager" />
        </div>
        {gridSix.length > 0 ? (
          <div className="grid min-h-0 grid-cols-3 grid-rows-2 gap-4">
            {Array.from({ length: 6 }, (_, i) => {
              const src = gridSix[i];
              if (!src) {
                return (
                  <div
                    key={`empty-${i}`}
                    className="rounded-2xl bg-[#EEF2F6]"
                    aria-hidden
                  />
                );
              }
              const isLast = i === 5;
              return (
                <div key={`${src}-${i}`} className="relative min-h-0 overflow-hidden rounded-2xl">
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  {isLast && moreCount > 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="text-[22px] font-bold text-white">+{moreCount}</span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SightseeingDetailGallery;
