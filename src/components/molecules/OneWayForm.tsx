import React, { useRef } from "react";
import Calendar from "../../assets/svgs/calendar.svg";
import PassengerCounterDropdown from "../atoms/PassengerCounterDropdown";
import type {
  CabinClassOption,
  CountryOption,
  PassengerSchema,
} from "../../features/flights/types";
import TravelRoutePicker from "../atoms/TravelRoutePicker";

type Props = {
  countries?: CountryOption[];
  loadingCountries?: boolean;
  fromCode?: string;
  toCode?: string;
  onChangeFrom?: (code: string) => void;
  onChangeTo?: (code: string) => void;
  passengerSchema?: PassengerSchema;
  // loadingPassengers?: boolean;
  cabinClasses?: CabinClassOption[];
  loadingCabinClasses?: boolean;
  selectedCabinClassId?: string; // empty string means none selected
  onChangeCabinClassId?: (id: string) => void;
};

const OneWayForm: React.FC<Props> = ({
  // countries,
  // loadingCountries,
  // fromCode,
  // toCode,
  // onChangeFrom,
  // onChangeTo,
  // passengerSchema,
  // loadingPassengers,
  // cabinClasses,
  // loadingCabinClasses,
  // selectedCabinClassId,
  // onChangeCabinClassId,
  countries = [],
  loadingCountries = false,
  fromCode = "",
  toCode = "",
  onChangeFrom = () => { },
  onChangeTo = () => { },
  passengerSchema,
  // loadingPassengers = false,
  cabinClasses = [],
  loadingCabinClasses = false,
  selectedCabinClassId = "",
  onChangeCabinClassId = () => { },
}) => {
  const depRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-end gap-4">
      <TravelRoutePicker
        options={countries}
        loading={loadingCountries}
        value={{ fromCode, toCode }}
        onChange={({ fromCode: f, toCode: t }) => {
          onChangeFrom(f);
          onChangeTo(t);
        }}
        showSwap={true}
        labels={{ from: "From", to: "To" }}
        placeholders={{ from: "Please select", to: "Please select" }}
        disableSameSelection
        widthClass="w-[190px]"
      />

      {/* Departure date */}
      <div className="w-[220px]">
        <label className="block text-[12px] text-[#3D495C] mb-1">
          Departure date
        </label>
        <div className="relative">
          <input
            ref={depRef}
            type="date"
            defaultValue="2025-06-16"
            className="h-11 w-full rounded-xl border border-[#DFE7F3] pl-4 pr-10 text-[14px] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2351A3]/20 hide-date-icon"
          />
          <button
            type="button"
            onClick={() => depRef.current?.showPicker?.()}
            className="absolute inset-y-0 right-3 flex items-center"
            aria-label="Open calendar"
          >
            <img
              src={Calendar}
              alt="calendar-icon"
              className="w-[16px] h-[16px]"
            />
          </button>
        </div>
      </div>

      {/* Passengers */}
      <div className="w-[170px]">
        <label className="block text-[12px] text-[#3D495C] mb-1">
          Passengers
        </label>
        <PassengerCounterDropdown
          maxTotal={9}
          onChange={(p) => console.log(p)}
          schema={passengerSchema}
        />
      </div>

      {/* Cabin class */}
      <div className="w-[150px]">
        <label className="block text-[12px] text-[#3D495C] mb-1">
          Cabin class
        </label>
        <div className="relative">
          <select
            value={selectedCabinClassId}          // "" by default
            onChange={(e) => onChangeCabinClassId(e.target.value)}
            className="appearance-none h-11 w-full rounded-xl border border-[#DFE7F3] px-4 pr-8 text-[14px] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2351A3]/20"
          >
            <option value="">{loadingCabinClasses ? "Loading…" : "Please select"}</option>
            {cabinClasses.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/3" width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5l5 5 5-5" stroke="#2351A3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default OneWayForm;
