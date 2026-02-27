// components/common/PassengerCounterDropdown.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { PassengerSchema, PaxKey } from "../../features/flights/types";
import CustomDropdownError from "../common/CustomDropdownError";

type Pax = {
  adults?: number;
  kids?: number;
  infants?: number;
  seniors?: number;
};

type Props = {
  value?: Pax;
  onChange?: (p: Pax) => void;
  maxTotal?: number;
  schema?: PassengerSchema;
  errorMessage?: string | null;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const DEFAULT_SUBTITLES: Record<string, string> = {
  adults: "Above 12 yrs",
  kids: "2 – 12 yrs",
  children: "2 – 12 yrs",
  infants: "0 – 2 yrs",
  seniors: "60+ yrs",
};

const IconBtn: React.FC<{
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}> = ({ disabled, onClick, label, children }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[14px] ${
      disabled
        ? "bg-[#E6EEFF] text-[#9BB3E8] cursor-not-allowed"
        : "bg-[#2351A3]"
    }`}
  >
    <span className="block leading-none transform -translate-y-px">
      {children}
    </span>
  </button>
);

const Row: React.FC<{
  title: string;
  subtitle?: string;
  count: number;
  dec: () => void;
  inc: () => void;
  disableDec?: boolean;
  disableInc?: boolean;
}> = ({ title, subtitle, count, dec, inc, disableDec, disableInc }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex flex-col leading-tight">
      <span className="text-[13px] text-[#0F172A]">{title}</span>
      {subtitle && (
        <span className="text-[11px] text-[#94A3B8] mt-0.5">{subtitle}</span>
      )}
    </div>
    <div className="flex items-center gap-3">
      <IconBtn label="decrease" onClick={dec} disabled={disableDec}>
        –
      </IconBtn>
      <span className="w-6 text-center text-[13px] text-[#0F172A]">
        {pad2(count)}
      </span>
      <IconBtn label="increase" onClick={inc} disabled={disableInc}>
        +
      </IconBtn>
    </div>
  </div>
);

const PassengerCounterDropdown: React.FC<Props> = ({
  value,
  onChange,
  maxTotal = 100,
  schema,
  errorMessage,
}) => {
  // ✅ Only use API schema
  const rows = useMemo(() => schema ?? [], [schema]);

  // init pax keys from schema (no hardcoded defaults)
  const initialPax = useMemo<Pax>(() => {
    const p: Pax = {};
    for (const r of rows) {
      (p as any)[r.key] = r.key === "adults" ? 1 : 0;
    }
    return p;
  }, [rows]);

  const [pax, setPax] = useState<Pax>(initialPax);
  const [open, setOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isUpdatingFromProps = useRef(false);

  const total = useMemo(
    () => rows.reduce((acc, r) => acc + ((pax as any)[r.key] || 0), 0),
    [rows, pax],
  );

  // Tooltip text: show "Select Passengers" when empty, else "1 Adult, 2 Children" etc.
  const tooltipLabel = useMemo(() => {
    const singularMap: Record<string, string> = {
      adults: "Adult",
      kids: "Kid",
      children: "Child",
      infants: "Infant",
      seniors: "Senior",
    };
    const parts = rows
      .filter((r) => ((pax as any)[r.key] || 0) > 0)
      .map((r) => {
        const count = (pax as any)[r.key] || 0;
        const title = r.title || r.key;
        const singular = singularMap[r.key] ?? title.replace(/s$/, "") ?? title;
        return count === 1 ? `1 ${singular}` : `${count} ${title}`;
      });
    return parts.length > 0 ? parts.join(", ") : "Select Passengers";
  }, [rows, pax]);

  // Calculate adults + kids total (max 9)
  const adultsKidsTotal = useMemo(
    () => (pax.adults || 0) + (pax.kids || 0),
    [pax],
  );

  // keep pax shape in sync if schema arrives later
  // useEffect(() => setPax(initialPax), [initialPax]);
  useEffect(() => {
    // incoming from props (may be undefined)
    const incoming = value ?? {};
    // merge with defaults so missing keys fall back to initialPax
    const merged = { ...initialPax, ...incoming };

    // shallow-compare via JSON (ok for this small object)
    if (JSON.stringify(merged) !== JSON.stringify(pax)) {
      isUpdatingFromProps.current = true;
      setPax(merged);
    }
  }, [value, initialPax]);

  // outside click → close panels
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
        setShowError(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // useEffect(() => void onChange?.(pax), [pax, onChange]);
  useEffect(() => {
    if (onChange && !isUpdatingFromProps.current) {
      onChange(pax);
    }
    isUpdatingFromProps.current = false;
  }, [pax, onChange]);

  // const canInc = (_k: PaxKey) => total < maxTotal;
  const canInc = (k: PaxKey) => {
    // Adults + Kids cannot exceed 9
    if (k === "adults" || k === "kids") {
      return adultsKidsTotal < 9;
    }
    // Infants cannot exceed adults count
    if (k === "infants") {
      return (pax.infants || 0) < (pax.adults || 0);
    }
    // Other passengers (seniors) - check total limit
    return total < maxTotal;
  };

  const inc = (k: PaxKey) =>
    canInc(k) && setPax((p) => ({ ...p, [k]: ((p as any)[k] || 0) + 1 }));
  const dec = (k: PaxKey) =>
    setPax((p) => {
      const cur = (p as any)[k] || 0;
      const newVal = Math.max(0, cur - 1);
      // If decreasing adults, also decrease infants if needed
      if (k === "adults" && newVal < (p.infants || 0)) {
        return { ...p, [k]: newVal, infants: newVal };
      }
      return { ...p, [k]: newVal };
    });

  // Check if error is a validation error (should not show popup)
  const isValidationError = React.useMemo(() => {
    if (!errorMessage) return false;
    const validationKeywords = [
      "Please select",
      "is required",
      "required",
      "Please complete",
    ];
    return validationKeywords.some((keyword) =>
      errorMessage.toLowerCase().includes(keyword.toLowerCase()),
    );
  }, [errorMessage]);

  // block native "menu" (it's a button) and toggle error vs list
  const handleToggle = () => {
    // Only show popup for API errors, not validation errors
    const hasApiError = !!errorMessage && !isValidationError;
    const hasNoSchema = rows.length === 0;

    if (hasApiError || hasNoSchema) {
      setShowError((s) => !s);
      setOpen(false);
    } else {
      setOpen((s) => !s);
      setShowError(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <div className="group relative">
        <button
          type="button"
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setShowError(false);
            }
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggle();
            }
          }}
          // className={`h-11 w-full rounded-xl border px-4 text-[14px] text-[#0F172A] flex items-center justify-between leading-none border-[#DFE7F3]`}
          className={`h-11 w-full rounded-xl border px-4 text-[14px] text-[#0F172A] flex items-center justify-between leading-none border-[#DFE7F3] transition-all
            group-hover:shadow-sm`}
          aria-haspopup="dialog"
          aria-expanded={open || showError}
          aria-invalid={showError}
          aria-describedby={showError ? "pax-error" : undefined}
        >
          <span className="tabular-nums">{pad2(total)} Passenger(s)</span>
          <svg
            className="shrink-0"
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 7.5l5 5 5-5"
              stroke="#2351A3"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div
          className={`
            pointer-events-none absolute bottom-full left-full -translate-x-1/3 mb-3
            hidden group-hover:block z-50
            px-3 py-2 text-xs leading-5 text-white
            bg-[#1E293B] rounded-lg shadow-lg
            whitespace-nowrap
            transition-all duration-150 opacity-0 group-hover:opacity-100
            before:content-[''] before:absolute before:top-full before:left-1/2
            before:-translate-x-1/2 before:border-6 before:border-transparent
            before:border-t-[#1E293B]
          `}
        >
          {tooltipLabel}
        </div>
      </div>

      {/* Error panel (like From/To) - only for API errors, not validation */}
      {showError && !isValidationError && (
        <CustomDropdownError
          id="pax-error"
          title="Nothing found!"
          message={errorMessage ?? "Please try again later."}
        />
      )}

      {/* Counter list */}
      {open && (
        <div className="absolute z-[9999] mt-2 w-[300px] rounded-2xl bg-white border border-[#E7EEF7] shadow-[0_8px_22px_rgba(12,40,86,0.08)] p-3">
          {rows.map((r, idx) => (
            <React.Fragment key={r.key}>
              <Row
                title={r.title}
                subtitle={(r as any).subtitle ?? DEFAULT_SUBTITLES[r.key]}
                count={(pax as any)[r.key] || 0}
                dec={() => dec(r.key)}
                inc={() => inc(r.key)}
                disableDec={((pax as any)[r.key] || 0) <= 0}
                disableInc={!canInc(r.key)}
              />
              {idx < rows.length - 1 && <div className="h-px bg-[#EDEFF6]" />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default PassengerCounterDropdown;
