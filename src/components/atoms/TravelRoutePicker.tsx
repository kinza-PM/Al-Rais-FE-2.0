import React, { useState } from "react";
import DoubledArrow from "../../assets/svgs/doubled-arrow.svg";
import type { CountryOption } from "../../features/flights/types";
import CustomDropdownError from "../common/CustomDropdownError";

type Value = { fromCode: string; toCode: string };

type Props = {
  options: CountryOption[];
  loading?: boolean;
  value: Value;
  onChange: (v: Value) => void;
  showSwap?: boolean;
  labels?: { from?: string; to?: string };
  placeholders?: { from?: string; to?: string };
  disableSameSelection?: boolean;
  widthClass?: string;
  fromError?: string | null;
  toError?: string | null;
};

const TravelRoutePicker: React.FC<Props> = ({
  options,
  loading,
  value,
  onChange,
  showSwap = true,
  labels = { from: "From", to: "To" },
  placeholders = { from: "Please select", to: "Please select" },
  disableSameSelection = true,
  widthClass = "w-[190px]",
  fromError,
  toError,
}) => {
  const { fromCode, toCode } = value;
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);

  const handleFrom = (code: string) => onChange({ fromCode: code, toCode });
  const handleTo = (code: string) => onChange({ fromCode, toCode: code });

  const swap = () => {
    if (!fromCode && !toCode) return;
    onChange({ fromCode: toCode, toCode: fromCode });
  };

  const handleToggleError = (
    e: React.MouseEvent<HTMLSelectElement> | React.KeyboardEvent<HTMLSelectElement>,
    hasError: boolean,
    open: boolean,
    setOpen: (v: boolean) => void
  ) => {
    if (!hasError) return;
    e.preventDefault(); 
    setOpen(!open);     
    (e.currentTarget as HTMLSelectElement).blur();
  };

  const baseSelect =
    "appearance-none h-11 w-full rounded-xl border pl-4 pr-8 text-[14px] text-[#0F172A] outline-none focus:ring-2 border-[#DFE7F3] focus:ring-[#2351A3]/20";

  return (
    <>
      <div className={widthClass}>
        <label className="block text-[12px] text-[#3D495C] mb-1">{labels.from}</label>
        <div className="relative">
          <select
            disabled={!!loading}
            value={fromCode}
            onChange={(e) => handleFrom(e.target.value)}
            onMouseDown={(e) => handleToggleError(e, !!fromError, openFrom, setOpenFrom)}
            onKeyDown={(e) => {
              if (fromError && (e.key === " " || e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp")) {
                handleToggleError(e, true, openFrom, setOpenFrom);
              }
            }}
            className={`${baseSelect}`}
            aria-invalid={!!fromError}
            aria-describedby={fromError && openFrom ? "from-error" : undefined}
          >
            <option value="" disabled>
              {placeholders.from}
            </option>
            {options.map((o) => (
              <option
                key={o.id}
                value={o.code}
                disabled={disableSameSelection && o.code === toCode}
              >
                {o.label}
              </option>
            ))}
          </select>


          <svg className="pointer-events-none absolute right-3 top-1/3" width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5l5 5 5-5" stroke="#2351A3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {fromError && openFrom && (
            <CustomDropdownError
              id="from-error"
              title="Nothing found!"
              message={fromError}
            />
          )}
        </div>
      </div>

      {showSwap && (
        <button
          type="button"
          onClick={swap}
          className="-mx-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#2351A3] text-white shadow-md border border-white fromToBtn"
        >
          <img src={DoubledArrow} alt="swap-routes" />
        </button>
      )}

      <div className={widthClass}>
        <label className="block text-[12px] text-[#3D495C] mb-1">{labels.to}</label>
        <div className="relative">
          <select
            disabled={!!loading}
            value={toCode}
            onChange={(e) => handleTo(e.target.value)}
            onMouseDown={(e) => handleToggleError(e, !!toError, openTo, setOpenTo)}
            onKeyDown={(e) => {
              if (toError && (e.key === " " || e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp")) {
                handleToggleError(e, true, openTo, setOpenTo);
              }
            }}
            className={`${baseSelect}`}
            aria-invalid={!!toError}
            aria-describedby={toError && openTo ? "to-error" : undefined}
          >
            <option value="" disabled>
              {placeholders.to}
            </option>
            {options.map((o) => (
              <option
                key={o.id}
                value={o.code}
                disabled={disableSameSelection && o.code === fromCode}
              >
                {o.label}
              </option>
            ))}
          </select>

          <svg className="pointer-events-none absolute right-3 top-1/3" width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5l5 5 5-5" stroke="#2351A3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {toError && openTo && (
            <CustomDropdownError
              id="to-error"
              title="Nothing found!"
              message={toError}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default TravelRoutePicker;
