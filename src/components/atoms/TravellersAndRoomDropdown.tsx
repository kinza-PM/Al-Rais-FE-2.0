import React, { useEffect, useMemo, useRef, useState } from "react";
import type { PassengerSchema, PaxKey } from "../../features/flights/types";
import CustomDropdownError from "../common/CustomDropdownError";

type Pax = {
  adults?: number;
  kids?: number;
  children?: number;
  infants?: number;
  seniors?: number;
  rooms?: number;
};

type Props = {
  value?: Pax;
  onChange?: (p: Pax) => void;
  maxTotal?: number;
  schema?: PassengerSchema;
  errorMessage?: string | null;
  // optional callback to return children ages to parent
  onChildrenAgesChange?: (ages: Array<number | null>) => void;
  tooltip?: string | null;
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
      <span className="w-6 text-center text-[13px] text-[#0F172A]">
        {pad2(count)}
      </span>
      <IconBtn label="increase" onClick={inc} disabled={disableInc}>
        +
      </IconBtn>
    </div>
  </div>
);

const TravellersAndRoomDropdown: React.FC<Props> = ({
  value,
  onChange,
  maxTotal = 100,
  schema,
  errorMessage,
  onChildrenAgesChange,
  tooltip = null,
}) => {
  // schema rows (from API)
  const rows = useMemo(() => schema ?? [], [schema]);

  // initial pax state (keeps shape from schema)
  const initialPax = useMemo<Pax>(() => {
    const p: Pax = { rooms: value?.rooms ?? 0 };
    for (const r of rows) (p as any)[r.key] = (value as any)?.[r.key] ?? 0;
    return p;
  }, [rows, value]);

  const [pax, setPax] = useState<Pax>(initialPax);
  const [open, setOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isUpdatingFromProps = useRef(false);

  // total passengers (sum of rows keys)
  const total = useMemo(
    () => rows.reduce((acc, r) => acc + ((pax as any)[r.key] || 0), 0),
    [rows, pax],
  );

  useEffect(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(pax)) {
      isUpdatingFromProps.current = true;
      setPax(initialPax);
    }
  }, [value, initialPax]);

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

  useEffect(() => {
    if (onChange && !isUpdatingFromProps.current) {
      onChange(pax);
    }
    isUpdatingFromProps.current = false;
  }, [pax, onChange]);

  const canInc = (_k: PaxKey) => total < maxTotal;
  const inc = (k: PaxKey) =>
    canInc(k) && setPax((p) => ({ ...p, [k]: ((p as any)[k] || 0) + 1 }));
  const dec = (k: PaxKey) =>
    setPax((p) => {
      const cur = (p as any)[k] || 0;
      return { ...p, [k]: Math.max(0, cur - 1) };
    });
  const incRooms = () => setPax((p) => ({ ...p, rooms: (p.rooms ?? 1) + 1 }));
  const decRooms = () =>
    setPax((p) => ({ ...p, rooms: Math.max(1, (p.rooms ?? 1) - 1) }));

  const isValidationError = React.useMemo(() => {
    if (!errorMessage) return false;
    const validationKeywords = [
      "Please select",
      "is required",
      "required",
      "Please complete",
      "Maximum",
    ];
    return validationKeywords.some((keyword) =>
      errorMessage.toLowerCase().includes(keyword.toLowerCase()),
    );
  }, [errorMessage]);

  const handleToggle = () => {
    // const hasError = !!errorMessage || rows.length === 0;
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

  // --- CHILDREN AGES HANDLING ---
  // detect children key in schema (support 'kids' or 'children')
  const childRowKey = useMemo(
    () =>
      rows.find((r) => r.key === "kids")?.key as
        | (keyof Pax & string)
        | undefined,
    [rows],
  );

  const childCount = (childRowKey && ((pax as any)[childRowKey] || 0)) || 0;

  // local ages array for children (null means not set)
  const [childAges, setChildAges] = useState<Array<number | null>>([]);

  // sync childAges length when childCount changes
  useEffect(() => {
    setChildAges((prev) => {
      if (childCount > prev.length) {
        return [...prev, ...Array(childCount - prev.length).fill(null)];
      } else {
        return prev.slice(0, childCount);
      }
    });
  }, [childCount]);

  // notify parent ages changed (optional)
  useEffect(() => {
    onChildrenAgesChange?.(childAges);
  }, [childAges, onChildrenAgesChange]);

  const handleChildAgeChange = (index: number, value: string) => {
    const num = value === "" ? null : Math.max(2, Math.min(12, Number(value)));
    setChildAges((prev) => {
      const next = [...prev];
      next[index] = num;
      return next;
    });
  };

  // --- filter out infants visually ---
  const visibleRows = useMemo(
    () => rows.filter((r) => r.key !== "infants"),
    [rows],
  );

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
          className={`h-11 w-full rounded-xl border px-4 text-[14px] text-[#0F172A] flex items-center justify-between leading-none ${errorMessage && isValidationError ? "border-red-500" : "border-[#DFE7F3]"}`}
          aria-haspopup="dialog"
          aria-expanded={open || showError}
          aria-invalid={showError}
          aria-describedby={showError ? "pax-error" : undefined}
        >
          <span className="tabular-nums">
            {pad2(total)} Passenger{total !== 1 ? "s" : ""} and{" "}
            {pad2(pax.rooms ?? 1)} Room{(pax.rooms ?? 1) !== 1 ? "s" : ""}
          </span>
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
        {tooltip && (
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
            <div className="text-center">
              {total > 0
                ? `${pad2(total)} Passenger${total !== 1 ? "s" : ""} and ${pad2(pax.rooms ?? 1)} Room${(pax.rooms ?? 1) !== 1 ? "s" : ""}`
                : tooltip}
            </div>
          </div>
        )}
      </div>

      {/* Error panel */}
      {showError && !isValidationError && (
        <CustomDropdownError
          id="pax-error"
          title="Nothing found!"
          message={errorMessage ?? "Please try again later."}
        />
      )}

      {/* Counter list + children ages */}
      {open && (
        <div className="absolute z-30 mt-2 w-[320px] rounded-2xl bg-white border border-[#E7EEF7] shadow-[0_8px_22px_rgba(12,40,86,0.08)] p-3">
          {visibleRows.map((r, idx) => (
            <React.Fragment key={r.key}>
              <Row
                title={r.title}
                count={(pax as any)[r.key] || 0}
                dec={() => dec(r.key as PaxKey)}
                inc={() => inc(r.key as PaxKey)}
                disableDec={((pax as any)[r.key] || 0) <= 0}
                disableInc={!canInc(r.key as PaxKey)}
              />
              {idx < visibleRows.length - 1 && (
                <div className="h-px bg-[#EDEFF6]" />
              )}
            </React.Fragment>
          ))}

          {childCount > 0 && (
            <>
              <div className="h-px bg-[#EDEFF6] mb-2" />
              <div className="mb-2">
                <div className="text-xs font-semibold text-[#3D495C]">
                  How old are your children?
                </div>
                <div className="text-xs text-[#3D495C]">
                  Let us know their ages so we can show how much their stay will
                  cost you.
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {Array.from({ length: childCount }).map((_, i) => (
                  <input
                    key={i}
                    type="number"
                    min={2}
                    max={12}
                    inputMode="numeric"
                    aria-label={`child-${i + 1}-age`}
                    placeholder="Age"
                    value={
                      childAges[i] === null || childAges[i] === undefined
                        ? ""
                        : String(childAges[i])
                    }
                    onChange={(e) => handleChildAgeChange(i, e.target.value)}
                    className="w-20 h-9 rounded-xl border border-[#EDEFF6] pl-3 text-[14px] text-[#0F172A] bg-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-0"
                  />
                ))}
              </div>
            </>
          )}
          {visibleRows.length > 0 && <div className="h-px bg-[#EDEFF6] mt-1" />}

          <Row
            title="Rooms"
            count={pax.rooms ?? 1}
            dec={decRooms}
            inc={incRooms}
            disableDec={(pax.rooms ?? 1) <= 1}
            disableInc={false}
          />
        </div>
      )}
    </div>
  );
};

export default TravellersAndRoomDropdown;
