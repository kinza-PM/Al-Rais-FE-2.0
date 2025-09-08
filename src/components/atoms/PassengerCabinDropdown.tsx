// components/atoms/PassengerCabinDropdown.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import PassengerCounterDropdown from "./PassengerCounterDropdown";
import type {
  PassengerSchema,
  CabinClassOption,
} from "../../features/flights/types";

type Pax = { adults: number; kids: number; infants: number; seniors?: number };

type Props = {
  // Passengers
  schema?: PassengerSchema;
  //   loadingPassengers?: boolean;
  maxTotal?: number;
  value?: Pax;
  onChangePax?: (p: Pax) => void;

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
  //   loadingPassengers,
  maxTotal = 9,
  value,
  onChangePax,
  cabinClasses = [],
  loadingCabinClasses,
  selectedCabinClassId = "",
  onChangeCabinClassId = () => {},
  widthClass = "w-[190px]",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    [pax]
  );

  // ✅ guard: if list is empty or id not matched, show "Please select"
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
            <div className="text-[12px] text-[#3D495C] mb-1">Passengers</div>
            <PassengerCounterDropdown
              value={value}
              onChange={(p) => {
                onChangePax ? onChangePax(p) : setPaxLocal(p);
              }}
              maxTotal={maxTotal}
              schema={schema}
            />
          </div>

          <div className="h-px bg-[#EDEFF6] my-2" />

          {/* Cabin class */}
          <div>
            <div className="text-[12px] text-[#3D495C] mb-1">Cabin class</div>
            <div className="relative">
              <select
                value={selectedCabinClassId}
                onChange={(e) => onChangeCabinClassId(e.target.value)}
                disabled={loadingCabinClasses}
                className="appearance-none h-11 w-full rounded-xl border border-[#DFE7F3] px-4 pr-8 text-[14px]
                           text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2351A3]/20"
              >
                <option value="">Please select</option>
                {cabinClasses.map((cc) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/3"
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 7.5l5 5 5-5"
                  stroke="#2351A3"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerCabinDropdown;
