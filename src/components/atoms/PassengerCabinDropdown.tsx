// components/atoms/PassengerCabinDropdown.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import PassengerCounterDropdown from "./PassengerCounterDropdown";
import type {
  PassengerSchema,
  CabinClassOption,
} from "../../features/flights/types";
import CustomDropdownError from "../common/CustomDropdownError";

type Pax = { adults: number; kids: number; infants: number; seniors?: number };

type Props = {
  // Passengers
  schema?: PassengerSchema;
  loadingPassengers?: boolean;
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
  loadingPassengers,
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
  const [openCabinError, setOpenCabinError] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const cabinError =
    !loadingCabinClasses && (!cabinClasses || cabinClasses.length === 0)
      ? "Cabin classes are not available right now. Please try again later."
      : null;

  const handleCabinToggle = (
    e:
      | React.MouseEvent<HTMLSelectElement>
      | React.KeyboardEvent<HTMLSelectElement>
  ) => {
    if (!cabinError) return;
    e.preventDefault();
    setOpenCabinError((v) => !v);
    (e.currentTarget as HTMLSelectElement).blur();
  };

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
                const normalized = toStrictPax(p);
                onChangePax ? onChangePax(normalized) : setPaxLocal(normalized);
              }}
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
            <div className="relative">
              <select
                value={selectedCabinClassId}
                onChange={(e) => onChangeCabinClassId(e.target.value)}
                disabled={loadingCabinClasses}
                className="appearance-none h-11 w-full rounded-xl border border-[#DFE7F3] px-4 pr-8 text-[14px]
                           text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2351A3]/20"
                aria-invalid={!!cabinError}
                aria-describedby={
                  cabinError && openCabinError ? "cabin-error" : undefined
                }
                onMouseDown={handleCabinToggle}
                onKeyDown={(e) => {
                  if (
                    cabinError &&
                    (e.key === " " ||
                      e.key === "Enter" ||
                      e.key === "ArrowDown" ||
                      e.key === "ArrowUp")
                  ) {
                    handleCabinToggle(e);
                  }
                  if (e.key === "Escape") setOpenCabinError(false);
                }}
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

              {cabinError && openCabinError && (
                // <div className="absolute z-30 mt-2 w-[220px]">
                <CustomDropdownError
                  id="cabin-error"
                  title="Nothing found!"
                  message={cabinError}
                />
                // </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerCabinDropdown;
