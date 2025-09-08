// components/common/PassengerCounterDropdown.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { PassengerSchema, PaxKey } from "../../features/flights/types";
import CustomDropdownError from "../common/CustomDropdownError";

type Pax = { adults?: number; kids?: number; infants?: number; seniors?: number };

type Props = {
  value?: Pax;
  onChange?: (p: Pax) => void;
  maxTotal?: number;
  schema?: PassengerSchema;
  errorMessage?: string | null;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

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
    className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[14px] ${disabled ? "bg-[#E6EEFF] text-[#9BB3E8] cursor-not-allowed" : "bg-[#2351A3]"
      }`}
  >
    {children}
  </button>
);

const Row: React.FC<{
  title: string;
  count: number;
  dec: () => void;
  inc: () => void;
  disableDec?: boolean;
  disableInc?: boolean;
}> = ({ title, count, dec, inc, disableDec, disableInc }) => (
  <div className="flex items-center justify-between py-2">
    <div className="text-[13px] leading-5 text-[#0F172A]">{title}</div>
    <div className="flex items-center gap-3">
      <IconBtn label="decrease" onClick={dec} disabled={disableDec}>
        –
      </IconBtn>
      <span className="w-6 text-center text-[13px] text-[#0F172A]">{pad2(count)}</span>
      <IconBtn label="increase" onClick={inc} disabled={disableInc}>
        +
      </IconBtn>
    </div>
  </div>
);

const PassengerCounterDropdown: React.FC<Props> = ({
  value,
  onChange,
  maxTotal = 9,
  schema,
  errorMessage,
}) => {
  // ✅ Only use API schema
  const rows = useMemo(() => schema ?? [], [schema]);

  // init pax keys from schema (no hardcoded defaults)
  const initialPax = useMemo<Pax>(() => {
    const p: Pax = {};
    for (const r of rows) (p as any)[r.key] = (value as any)?.[r.key] ?? 0;
    return p;
  }, [rows, value]);

  const [pax, setPax] = useState<Pax>(initialPax);
  const [open, setOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const total = useMemo(
    () => rows.reduce((acc, r) => acc + ((pax as any)[r.key] || 0), 0),
    [rows, pax]
  );

  // keep pax shape in sync if schema arrives later
  useEffect(() => setPax(initialPax), [initialPax]);

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

  useEffect(() => void onChange?.(pax), [pax, onChange]);

  const canInc = (_k: PaxKey) => total < maxTotal;

  const inc = (k: PaxKey) => canInc(k) && setPax(p => ({ ...p, [k]: ((p as any)[k] || 0) + 1 }));
  const dec = (k: PaxKey) =>
    setPax(p => {
      const cur = (p as any)[k] || 0;
      return { ...p, [k]: Math.max(0, cur - 1) };
    });

  // block native “menu” (it’s a button) and toggle error vs list
  const handleToggle = () => {
    const hasError = !!errorMessage || rows.length === 0;
    if (hasError) {
      setShowError(s => !s);
      setOpen(false);
    } else {
      setOpen(s => !s);
      setShowError(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
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
        className={`h-11 w-full rounded-xl border px-4 text-[14px] text-[#0F172A] focus:ring-2 flex items-center justify-between leading-none border-[#DFE7F3] focus:ring-[#2351A3]/20`}
        aria-haspopup="dialog"
        aria-expanded={open || showError}
        aria-invalid={showError}
        aria-describedby={showError ? "pax-error" : undefined}
      >
        <span className="tabular-nums">{pad2(total)} Passenger(s)</span>
        <svg className="shrink-0" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 7.5l5 5 5-5" stroke="#2351A3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Error panel (like From/To) */}
      {showError && (
        // <div className="absolute z-30 mt-2 w-[250px]">
        <CustomDropdownError
          id="pax-error"
          title="Nothing found!"
          message={
            errorMessage ?? "Please try again later."
          }
        />
        // </div>
      )}

      {/* Counter list */}
      {open && (
        <div className="absolute z-30 mt-2 w-[300px] rounded-2xl bg-white border border-[#E7EEF7] shadow-[0_8px_22px_rgba(12,40,86,0.08)] p-3">
          {rows.map((r, idx) => (
            <React.Fragment key={r.key}>
              <Row
                title={r.title}
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
