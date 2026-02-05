// components/atoms/PassengerCabinDropdown.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import PassengerCounterDropdown from "./PassengerCounterDropdown";
import type {
  PassengerSchema,
  CabinClassOption,
} from "../../features/flights/types";
import SearchableDropdown from "../common/SearchableDropdown";
import Info from "../../assets/svgs/info-black.svg";

type Pax = { adults: number; kids: number; infants: number; seniors?: number };

type Props = {
  // Passengers
  schema?: PassengerSchema;
  loadingPassengers?: boolean;
  maxTotal?: number;
  value?: Pax;
  onChangePax?: (p: Pax, order: string[]) => void;

  // Cabin
  cabinClasses?: CabinClassOption[]; // 👈 made optional
  loadingCabinClasses?: boolean;
  selectedCabinClassId?: string; // 👈 made optional
  onChangeCabinClassId?: (id: string) => void; // 👈 made optional

  // UI
  widthClass?: string;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const PassengerCabinDropdown: React.FC<Props> = ({
  schema = [],
  loadingPassengers,
  maxTotal = 100,
  value,
  onChangePax,
  cabinClasses = [], // ✅ default to []
  loadingCabinClasses,
  selectedCabinClassId = "", // ✅ default to ""
  onChangeCabinClassId = () => {}, // ✅ no-op default
  widthClass = "w-[190px]",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const passengerRequestOrder = useRef<string[]>([]);
  const prevCountsRef = useRef<Pax>({
    adults: 0,
    kids: 0,
    infants: 0,
    seniors: undefined,
  });

  const cabinError =
    !loadingCabinClasses && (!cabinClasses || cabinClasses.length === 0)
      ? "Cabin classes are not available right now. Please try again later."
      : null;

  const [paxLocal, setPaxLocal] = useState<Pax>({
    adults: 1,
    kids: 0,
    infants: 0,
    seniors: undefined,
  });
  const pax = value ?? paxLocal;

  const total = useMemo(
    () =>
      (pax.adults || 0) +
      (pax.kids || 0) +
      (pax.infants || 0) +
      (pax.seniors || 0),
    [pax],
  );

  const toStrictPax = (p: Partial<Pax> | undefined): Pax => ({
    adults: p?.adults ?? 0,
    kids: p?.kids ?? 0,
    infants: p?.infants ?? 0,
    seniors: p?.seniors ?? undefined,
  });

  const selectedCabinLabel =
    cabinClasses.find((c) => c.id === selectedCabinClassId)?.label ||
    "Please select";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // keep prev counts in sync with current pax (handles initial mount and controlled updates)
  useEffect(() => {
    prevCountsRef.current = pax;
  }, [pax]);

  const handleInternalChange = (nextRaw: Partial<Pax> | undefined) => {
    const next = toStrictPax(nextRaw);
    const prev = prevCountsRef.current; // use stable last counts
    const schemaKeys = (schema || []).map((s) => (s as any).key);
    const keys = Array.from(
      new Set([
        ...Object.keys(prev || {}),
        ...Object.keys(next || {}),
        ...schemaKeys,
      ]),
    );

    const order = passengerRequestOrder.current.slice();

    for (const k of keys) {
      const prevCount = (prev as any)?.[k] ?? 0;
      const nextCount = (next as any)[k] ?? 0;
      const diff = nextCount - prevCount;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) order.push(k);
      } else if (diff < 0) {
        for (let i = 0; i < -diff; i++) {
          const li = order.lastIndexOf(k);
          if (li >= 0) order.splice(li, 1);
        }
      }
    }

    // compare before setting to prevent loops with controlled child
    const allKeys = Array.from(
      new Set([...Object.keys(prev || {}), ...Object.keys(next || {})]),
    );
    const changed = allKeys.some(
      (k) => (prev as any)?.[k] !== (next as any)[k],
    );

    if (!changed) return; // nothing to do

    passengerRequestOrder.current = order;
    prevCountsRef.current = next;

    // uncontrolled -> update local state
    if (value === undefined) {
      setPaxLocal(next);
    }

    // emit both next and order
    onChangePax?.(next, order);
  };

  return (
    <div className={`relative ${widthClass}`} ref={ref}>
      <label className="block text-[12px] text-[#3D495C] mb-1">
        Passengers &amp; cabin class
      </label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-11 w-full rounded-xl border border-[#DFE7F3] px-4 text-[14px] text-[#0F172A]
                   focus:ring-2 focus:ring-[#2351A3]/20 flex items-center justify-between"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="tabular-nums">
          {pad2(total)} Passengers, {selectedCabinLabel}
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

      {open && (
        <div
          className="absolute z-30 mt-2 w-[320px] rounded-2xl bg-white border border-[#E7EEF7]
                        shadow-[0_8px_22px_rgba(12,40,86,0.08)] p-3"
        >
          {/* Passengers */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-[12px] text-[#3D495C] mb-1">
              Passengers
              <span className="relative inline-flex group/info">
                <img
                  src={Info}
                  alt="info"
                  className="w-4 h-4 inline-block align-middle"
                />
                <span
                  className="pointer-events-none absolute bottom-full left-full -translate-x-1/3 mb-2 hidden group-hover/info:block z-50 px-3 py-2 text-xs leading-5 text-white bg-[#1E293B] rounded-lg shadow-lg whitespace-nowrap text-center before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-6 before:border-transparent before:border-t-[#1E293B]"
                  role="tooltip"
                >
                  Adults + Kids count cannot exceed 9
                  <br />
                  Infants cannot be more than Adults
                </span>
              </span>
            </div>
            <PassengerCounterDropdown
              value={pax}
              // onChange={(p) => {
              //   const normalized = toStrictPax(p);
              //   onChangePax ? onChangePax(normalized) : setPaxLocal(normalized);
              // }}
              onChange={(p) => handleInternalChange(p)}
              maxTotal={maxTotal}
              schema={schema}
              errorMessage={
                !loadingPassengers && (!schema || schema.length === 0)
                  ? "Passenger types are not available right now. Please try again later."
                  : null
              }
            />
          </div>

          <div className="h-px bg-[#EDEFF6] my-2" />

          {/* Cabin class */}
          <div>
            <div className="text-[12px] text-[#3D495C] mb-1">Cabin class</div>
            <SearchableDropdown
              options={cabinClasses.map((cc) => ({
                id: cc.id,
                value: cc.id,
                label: cc.label,
              }))}
              value={selectedCabinClassId}
              onChange={onChangeCabinClassId}
              placeholder="Select cabin class"
              disabled={loadingCabinClasses}
              error={cabinError}
              widthClass="w-full"
              searchPlaceholder="Search cabin classes..."
              tooltip="Select cabin class"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerCabinDropdown;
