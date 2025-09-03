import React from "react";
import PassengerCounterDropdown from "../atoms/PassengerCounterDropdown";
import type {
  CabinClassOption,
  CountryOption,
  PassengerSchema,
} from "../../features/flights/types";
import TravelRoutePicker from "../atoms/TravelRoutePicker";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
import CustomDropdownError from "../common/CustomDropdownError";

type Props = {
  countries?: CountryOption[];
  loadingCountries?: boolean;
  fromCode?: string;
  toCode?: string;
  onChangeFrom?: (code: string) => void;
  onChangeTo?: (code: string) => void;
  passengerSchema?: PassengerSchema;
  loadingPassengers?: boolean;
  cabinClasses?: CabinClassOption[];
  loadingCabinClasses?: boolean;
  selectedCabinClassId?: string; // empty string means none selected
  onChangeCabinClassId?: (id: string) => void;
};

const OneWayForm: React.FC<Props> = ({
  countries = [],
  loadingCountries = false,
  fromCode = "",
  toCode = "",
  onChangeFrom = () => { },
  onChangeTo = () => { },
  passengerSchema,
  loadingPassengers = false,
  cabinClasses = [],
  loadingCabinClasses = false,
  selectedCabinClassId = "",
  onChangeCabinClassId = () => { },
}) => {
  // const depRef = useRef<HTMLInputElement>(null);
  const [departDate, setDepartDate] = React.useState<Date | null>(new Date());
  const [openCabinError, setOpenCabinError] = React.useState(false);

  const cabinError =
    !loadingCabinClasses && (!cabinClasses || cabinClasses.length === 0)
      ? "Cabin classes are not available right now. Please try again later."
      : null;

  const handleCabinToggle = (
    e: React.MouseEvent<HTMLSelectElement> | React.KeyboardEvent<HTMLSelectElement>
  ) => {
    if (!cabinError) return;
    e.preventDefault();
    setOpenCabinError((v) => !v);
    (e.currentTarget as HTMLSelectElement).blur();
  };

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
        fromError={
          !loadingCountries && countries.length === 0
            ? "Please try a different search."
            : undefined
        }
        toError={
          !loadingCountries && countries.length === 0
            ? "Please try a different search."
            : undefined
        }
      />

      {/* Departure date */}
      <div className="w-[220px]">
        <label className="block text-[12px] text-[#3D495C] mb-1">
          Departure date
        </label>
        <TailiwindCustomDatePicker
          value={departDate}
          onChange={(d) => setDepartDate(d)}
          placeholder="Please select"
          buttonIconSrc={true}
        />
        {/* <div className="relative">
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
        </div> */}
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
          errorMessage={
            (!loadingPassengers && (!passengerSchema || passengerSchema.length === 0))
              ? "Passenger types are not available right now. Please try again later."
              : null
          }
        />
      </div>

      {/* Cabin class */}
      <div className="w-[150px]">
        <label className="block text-[12px] text-[#3D495C] mb-1">
          Cabin class
        </label>
        <div className="relative">
          <select
            disabled={!!loadingCabinClasses}
            value={selectedCabinClassId}
            onChange={(e) => onChangeCabinClassId(e.target.value)}
            className=" appearance-none h-11 w-full rounded-xl border px-4 pr-8 text-[14px] text-[#0F172A] outline-none focus:ring-2border-[#DFE7F3] focus:ring-[#2351A3]/20"
            aria-invalid={!!cabinError}
            aria-describedby={cabinError && openCabinError ? "cabin-error" : undefined}
            onMouseDown={handleCabinToggle}
            onKeyDown={(e) => {
              if (cabinError && (e.key === " " || e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp")) {
                handleCabinToggle(e);
              }
              if (e.key === "Escape") setOpenCabinError(false);
            }}
          >
            <option value="" disabled>
              Please select
            </option>
            {cabinClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <svg
            className="pointer-events-none absolute right-3 top-1/3"
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

          {cabinError && openCabinError && (
            <div className="absolute z-30 mt-2 w-[220px]">
              <CustomDropdownError
                id="cabin-error"
                title="Nothing found!"
                message={cabinError}
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default OneWayForm;
