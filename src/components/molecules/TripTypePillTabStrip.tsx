import React, { useMemo } from "react";
import type { FlightTypeOption, TripType } from "../../features/flights/types";

export type TripTypePillTabStripProps = {
  tabs: FlightTypeOption[];
  trip: TripType;
  onTripChange: (next: TripType) => void;
  loading?: boolean;
  className?: string;
};

const TripTypePillTabStrip: React.FC<TripTypePillTabStripProps> = ({
  tabs,
  trip,
  onTripChange,
  loading = false,
  className = "",
}) => {
  const tripSelectorLayout = useMemo(() => {
    const gapPx = 10;
    const padPx = 5;
    const n = Math.max(1, tabs.length);
    const rawIdx = tabs.findIndex((t) => t.key === trip);
    const fallbackIdx = ["oneway", "roundtrip", "multicity"].indexOf(trip);
    const idx =
      rawIdx >= 0
        ? Math.min(rawIdx, n - 1)
        : fallbackIdx >= 0
          ? Math.min(fallbackIdx, n - 1)
          : 0;
    const pillW = `calc((100% - ${(n - 1) * gapPx}px) / ${n})`;
    const left =
      idx === 0
        ? `${padPx}px`
        : `calc(${padPx}px + ${idx} * (((100% - ${(n - 1) * gapPx}px) / ${n}) + ${gapPx}px))`;
    return { pillW, left };
  }, [tabs, trip]);

  if (!loading && tabs.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex max-w-full justify-start overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      <div className="relative box-border h-[50px] w-[468px] min-w-[468px] shrink-0 rounded-[16px] border border-[#E4E4E7] bg-white p-[5px]">
        {loading && (
          <div className="flex h-[40px] items-center justify-center px-5 text-[13px] text-[#3A4350] opacity-60">
            Loading…
          </div>
        )}
        {!loading && tabs.length > 0 ? (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute top-[5px] z-0 h-[40px] rounded-[12px] bg-[#2351A3] transition-[left,width] duration-200 ease-out"
              style={{
                width: tripSelectorLayout.pillW,
                left: tripSelectorLayout.left,
              }}
            />
            <div
              className="relative z-[1] flex h-[40px] w-full items-stretch gap-[10px]"
              role="tablist"
              aria-label="Trip type"
            >
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={trip === t.key}
                  onClick={() => onTripChange(t.key)}
                  className={`flex min-w-0 flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-[12px] px-1 text-center text-[14px] font-medium leading-none transition-colors sm:text-[15px] ${
                    trip === t.key
                      ? "text-white"
                      : "text-[#3D495C] hover:text-[#2351A3]"
                  }`}
                  style={{ height: 40 }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TripTypePillTabStrip;
