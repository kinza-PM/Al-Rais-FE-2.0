import React from "react";
// import Calendar from "../../assets/svgs/calendar.svg";
import type {
  CabinClassOption,
  CountryOption,
  PassengerSchema,
} from "../../features/flights/types";
import TravelRoutePicker from "../atoms/TravelRoutePicker";
import PassengerCabinDropdown from "../atoms/PassengerCabinDropdown";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";

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
  selectedCabinClassId?: string;
  onChangeCabinClassId?: (id: string) => void;
};

const RoundTripForm: React.FC<Props> = ({
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
  loadingPassengers = false,
  cabinClasses = [],
  loadingCabinClasses = false,
  selectedCabinClassId = "",
  onChangeCabinClassId = () => { },
}) => {
  // const depRef = useRef<HTMLInputElement>(null);
  // const arrRef = useRef<HTMLInputElement>(null);
  const [departDate, setDepartDate] = React.useState<Date | null>(new Date());
  const [arrivalDate, setArrivalDate] = React.useState<Date | null>(new Date());

  return (
    <div className="flex items-end gap-4">
      {/* From */}
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
      <div className="w-[200px]">
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

      <div className="w-[200px]">
        <label className="block text-[12px] text-[#3D495C] mb-1">
          Arrival date
        </label>
        <TailiwindCustomDatePicker
          value={arrivalDate}
          onChange={(d) => setArrivalDate(d)}
          placeholder="Please select"
          buttonIconSrc={true}
        />
        {/* <div className="relative">
          <input
            ref={arrRef}
            type="date"
            defaultValue="2025-06-16"
            className="h-11 w-full rounded-xl border border-[#DFE7F3] pl-4 pr-10 text-[14px] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2351A3]/20 hide-date-icon"
          />
          <button
            type="button"
            onClick={() => arrRef.current?.showPicker?.()}
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
      <PassengerCabinDropdown
        schema={passengerSchema}
        loadingPassengers={loadingPassengers}
        cabinClasses={cabinClasses}
        loadingCabinClasses={loadingCabinClasses}
        selectedCabinClassId={selectedCabinClassId}
        onChangeCabinClassId={onChangeCabinClassId}
        widthClass="w-[190px]"
      />
    </div>
  );
};

export default RoundTripForm;
