import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Slider } from "antd";
import { formatListingStartingFare } from "../../utils/helpers";

const BIN_COUNT = 13;
const FALLBACK_NORMALIZED = [
  0.55, 0.35, 0.75, 1, 0.55, 0.65, 0.85, 1, 0.5, 0.7, 0.75, 0.4, 0.45,
];

function computeBinNormalizedHeights(
  fares: number[],
  minBound: number,
  maxBound: number,
): number[] {
  const out = Array(BIN_COUNT).fill(0);
  if (maxBound <= minBound) return FALLBACK_NORMALIZED.slice();
  const span = maxBound - minBound;
  for (const f of fares) {
    if (!Number.isFinite(f)) continue;
    const t = (f - minBound) / span;
    if (t < 0 || t > 1) continue;
    const idx = Math.min(BIN_COUNT - 1, Math.floor(t * BIN_COUNT));
    out[idx] += 1;
  }
  const maxC = Math.max(...out, 1);
  return out.map((c) => c / maxC);
}

function sanitizeInt(raw: string): string {
  return raw.replace(/[^\d-]/g, "");
}

function labelLeftPercent(v: number, minBound: number, maxBound: number): number {
  if (maxBound <= minBound) return 0;
  return ((v - minBound) / (maxBound - minBound)) * 100;
}

export type PricePerSeatHistogramSliderProps = {
  disabled?: boolean;
  minBound: number;
  maxBound: number;
  step: number;
  value: [number, number];
  onChange: (next: [number, number]) => void;
  faresForHistogram: number[];
  currencyCode: string;
};

const PricePerSeatHistogramSlider: React.FC<
  PricePerSeatHistogramSliderProps
> = ({
  disabled,
  minBound,
  maxBound,
  step,
  value,
  onChange,
  faresForHistogram,
  currencyCode,
}) => {
  const heights = useMemo(() => {
    if (!faresForHistogram.length) return FALLBACK_NORMALIZED;
    return computeBinNormalizedHeights(
      faresForHistogram,
      minBound,
      maxBound,
    );
  }, [faresForHistogram, minBound, maxBound]);

  const binEdges = useMemo(() => {
    if (maxBound <= minBound) return null;
    const span = maxBound - minBound;
    return Array.from(
      { length: BIN_COUNT + 1 },
      (_, i) => minBound + (span * i) / BIN_COUNT,
    );
  }, [minBound, maxBound]);

  const barInRange = (i: number, range: [number, number]) => {
    if (!binEdges) return false;
    const lo = binEdges[i];
    const hi = binEdges[i + 1];
    return range[1] > lo && range[0] < hi;
  };

  const snap = (n: number) => {
    const s = Math.max(minBound, Math.min(maxBound, n));
    if (step <= 0) return Math.round(s);
    const snapped = Math.round(s / step) * step;
    return Math.max(minBound, Math.min(maxBound, snapped));
  };

  const [minStr, setMinStr] = useState(String(Math.round(value[0])));
  const [maxStr, setMaxStr] = useState(String(Math.round(value[1])));

  const [liveRange, setLiveRange] = useState<[number, number]>(value);
  const draggingRef = useRef(false);
  const rafFlushRef = useRef<number | null>(null);

  useEffect(() => {
    if (!draggingRef.current) setLiveRange(value);
  }, [value[0], value[1]]);

  useEffect(() => {
    return () => {
      if (rafFlushRef.current !== null) {
        cancelAnimationFrame(rafFlushRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setMinStr(String(Math.round(value[0])));
    setMaxStr(String(Math.round(value[1])));
  }, [value[0], value[1]]);

  const flushParent = useCallback(
    (next: [number, number]) => {
      if (rafFlushRef.current !== null) {
        cancelAnimationFrame(rafFlushRef.current);
      }
      rafFlushRef.current = requestAnimationFrame(() => {
        rafFlushRef.current = null;
        onChange(next);
      });
    },
    [onChange],
  );

  const commitInputs = () => {
    let a = parseInt(sanitizeInt(minStr), 10);
    let b = parseInt(sanitizeInt(maxStr), 10);
    if (Number.isNaN(a)) a = minBound;
    if (Number.isNaN(b)) b = maxBound;
    a = snap(a);
    b = snap(b);
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    setLiveRange([lo, hi]);
    onChange([lo, hi]);
  };

  const sliderDisabled = Boolean(disabled || maxBound <= minBound);

  const p0 = labelLeftPercent(liveRange[0], minBound, maxBound);
  const p1 = labelLeftPercent(liveRange[1], minBound, maxBound);
  const labelsClose = Math.abs(p1 - p0) < 16;

  const badgeClass =
    "pointer-events-none absolute bottom-0 flex h-[31px] min-w-[61px] items-center justify-center gap-[10px] rounded-2xl border border-[#C2CAD6] bg-[#F2F2F3] px-[15px] py-2 text-[12px] font-medium leading-none text-[#3D495C] shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-[left,transform] duration-200 ease-out";

  return (
    <div className="flight-price-histogram-root w-full min-w-0 px-2.5">
      <div className="flex h-[58px] items-end justify-center gap-[4px]">
        {heights.map((h, i) => {
          const active = barInRange(i, liveRange);
          const hPx = Math.max(10, Math.round(h * 52));
          return (
            <div
              key={i}
              className="flex min-h-0 flex-1 flex-col justify-end"
              style={{ maxWidth: 22 }}
            >
              <div
                className="w-full rounded-full will-change-[height,background-color]"
                style={{
                  height: `${hPx}px`,
                  backgroundColor: active ? "#2351A3" : "#C2CAD6",
                  transition:
                    "height 0.45s cubic-bezier(0.25, 0.85, 0.25, 1), background-color 0.35s ease",
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-1 flex justify-between px-0.5 text-[11px] font-light leading-none tracking-wide text-[#94A3B8]">
        <span>{formatListingStartingFare(currencyCode, minBound)}</span>
        <span>{formatListingStartingFare(currencyCode, maxBound)}</span>
      </div>

      <div className="relative mx-0 mt-2 mb-1 h-9 w-full">
        <span
          className={`${badgeClass} z-[2]`}
          style={{
            left: `${p0}%`,
            transform: labelsClose
              ? "translate(-50%, -3px)"
              : "translate(-50%, 0)",
          }}
        >
          {formatListingStartingFare(currencyCode, liveRange[0])}
        </span>
        <span
          className={`${badgeClass} z-[3]`}
          style={{
            left: `${p1}%`,
            transform: labelsClose
              ? "translate(-50%, 3px)"
              : "translate(-50%, 0)",
          }}
        >
          {formatListingStartingFare(currencyCode, liveRange[1])}
        </span>
      </div>

      <div className="flight-price-slider-wrap -mt-0.5 pb-0.5">
        <Slider
          range
          min={minBound}
          max={maxBound}
          step={step}
          disabled={sliderDisabled}
          rootClassName="flight-price-range-slider"
          value={[liveRange[0], liveRange[1]]}
          tooltip={{ open: false }}
          onChange={(v) => {
            const arr = v as number[];
            const next: [number, number] = [snap(arr[0]), snap(arr[1])];
            draggingRef.current = true;
            setLiveRange(next);
            flushParent(next);
          }}
          onChangeComplete={(v) => {
            const arr = v as number[];
            const next: [number, number] = [snap(arr[0]), snap(arr[1])];
            draggingRef.current = false;
            setLiveRange(next);
            if (rafFlushRef.current !== null) {
              cancelAnimationFrame(rafFlushRef.current);
              rafFlushRef.current = null;
            }
            onChange(next);
          }}
          styles={{
            rail: {
              height: 8,
              borderRadius: 999,
              background: "#E4E4E7",
            },
            tracks: {
              background: "#2351A3",
            },
            track: {
              height: 8,
              borderRadius: 999,
              background: "#2351A3",
            },
            handle: {
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#ffffff",
              border: "3px solid #2351A3",
              boxShadow: "0 2px 8px rgba(35, 81, 163, 0.22)",
              transition:
                "box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
            },
          }}
        />
      </div>

      <div className="mt-3 flex w-full gap-3">
        <div className="min-w-0 flex-1">
          <label className="mb-1.5 block text-[12px] font-light leading-none text-[#64748B]">
            Min
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            disabled={sliderDisabled}
            className="box-border h-11 w-full rounded-2xl border border-[#E4E4E7] bg-white px-3 text-center text-[14px] font-light text-[#0A0C0F] outline-none transition-[border-color,box-shadow] duration-200 ease-out focus:border-[#2351A3] focus:shadow-[0_0_0_3px_rgba(35,81,163,0.12)]"
            value={minStr}
            onChange={(e) => setMinStr(sanitizeInt(e.target.value))}
            onBlur={commitInputs}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <label className="mb-1.5 block text-[12px] font-light leading-none text-[#64748B]">
            Max
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            disabled={sliderDisabled}
            className="box-border h-11 w-full rounded-2xl border border-[#E4E4E7] bg-white px-3 text-center text-[14px] font-light text-[#0A0C0F] outline-none transition-[border-color,box-shadow] duration-200 ease-out focus:border-[#2351A3] focus:shadow-[0_0_0_3px_rgba(35,81,163,0.12)]"
            value={maxStr}
            onChange={(e) => setMaxStr(sanitizeInt(e.target.value))}
            onBlur={commitInputs}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PricePerSeatHistogramSlider;
