import React from "react";
// import Calendar from "../../assets/svgs/calendar.svg";
import type {
  CabinClassOption,
  AirportOption,
  PassengerSchema,
} from "../../features/flights/types";
import TravelRoutePicker from "../atoms/TravelRoutePicker";
import PassengerCabinDropdown from "../atoms/PassengerCabinDropdown";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
import { sameCalendarDate } from "../../utils/helpers";

type Props = {
  countries?: AirportOption[];
  loadingCountries?: boolean;
  /**
   * Optional callback: if provided, the travel route picker's
   * search box will use this for API-based search instead of
   * doing local filtering on the already-loaded list.
   */
  onSearchCountries?: (term: string) => void;
  fromCode?: string;
  toCode?: string;
  departDateValue?: Date | null;
  arrivalDateValue?: Date | null;
  onChangeFrom?: (code: string) => void;
  onChangeTo?: (code: string) => void;
  passengerSchema?: PassengerSchema;
  loadingPassengers?: boolean;
  cabinClasses?: CabinClassOption[];
  loadingCabinClasses?: boolean;
  selectedCabinClassId?: string;
  onChangeCabinClassId?: (id: string) => void;
  onChangePassengers?: (p: { [k: string]: number }, order: string[]) => void;
  onChangeDepartDate?: (d: Date | null) => void;
  onChangeArrivalDate?: (d: Date | null) => void;
  fromError?: string;
  toError?: string;
  departDateError?: string;
  arrivalDateError?: string;
  passengersError?: string;
  cabinClassError?: string;
  countriesHasMore?: boolean;
  countriesFetchNext?: () => void;
  countriesLoadingMore?: boolean;
  fromCountries?: AirportOption[];
  toCountries?: AirportOption[];
  loadingFromCountries?: boolean;
  loadingToCountries?: boolean;
  onSearchFromCountries?: (term: string) => void;
  onSearchToCountries?: (term: string) => void;
  fromCountriesHasMore?: boolean;
  toCountriesHasMore?: boolean;
  fromCountriesFetchNext?: () => void;
  toCountriesFetchNext?: () => void;
  fromCountriesLoadingMore?: boolean;
  toCountriesLoadingMore?: boolean;
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
  onSearchCountries,
  fromCode = "",
  toCode = "",
  departDateValue = null,
  arrivalDateValue = null,
  onChangeFrom = () => { },
  onChangeTo = () => { },
  passengerSchema,
  loadingPassengers = false,
  cabinClasses = [],
  loadingCabinClasses = false,
  selectedCabinClassId = "",
  onChangeCabinClassId = () => { },
  onChangePassengers,
  onChangeDepartDate,
  onChangeArrivalDate,
  fromError = "",
  toError = "",
  departDateError = "",
  arrivalDateError = "",
  passengersError = "",
  cabinClassError = "",
  countriesHasMore = false,
  countriesFetchNext = () => { },
  countriesLoadingMore = false,
  fromCountries,
  toCountries,
  loadingFromCountries,
  loadingToCountries,
  onSearchFromCountries,
  onSearchToCountries,
  fromCountriesHasMore,
  toCountriesHasMore,
  fromCountriesFetchNext,
  toCountriesFetchNext,
  fromCountriesLoadingMore,
  toCountriesLoadingMore,
}) => {
  // const depRef = useRef<HTMLInputElement>(null);
  // const arrRef = useRef<HTMLInputElement>(null);
  const [departDate, setDepartDate] = React.useState<Date | null>(
    departDateValue,
  );
  const [arrivalDate, setArrivalDate] = React.useState<Date | null>(
    arrivalDateValue,
  );

  React.useEffect(() => {
    const next = departDateValue ?? null;
    setDepartDate((prev) =>
      sameCalendarDate(prev, next) ? prev : next,
    );
  }, [departDateValue]);

  React.useEffect(() => {
    const next = arrivalDateValue ?? null;
    setArrivalDate((prev) =>
      sameCalendarDate(prev, next) ? prev : next,
    );
  }, [arrivalDateValue]);

  const [, setPaxCounts] = React.useState<{ [k: string]: number }>({});
  const passengerRequestOrder = React.useRef<string[]>(
    ((passengerSchema as any[]) || []).map((s: any) => s.key),
  );

  const handlePaxChange = React.useCallback(
    (p: any, childOrder: string[]) => {
      const next = p || {};
      // Use fresh order coming from PassengerCabinDropdown (already fresh expansion)
      passengerRequestOrder.current = childOrder || [];
      setPaxCounts(next as any);
      onChangePassengers?.(next as any, childOrder || []);
    },
    [onChangePassengers],
  );
  return (
    <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-end xl:grid xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)] xl:items-end xl:gap-4">
      <TravelRoutePicker
        bundleRoute
        swapGutter={false}
        options={countries}
        loading={loadingCountries}
        onSearchChange={onSearchCountries}
        fromOptions={fromCountries}
        toOptions={toCountries}
        fromLoading={loadingFromCountries}
        toLoading={loadingToCountries}
        onFromSearchChange={onSearchFromCountries}
        onToSearchChange={onSearchToCountries}
        value={{ fromCode, toCode }}
        onChange={({ fromCode: f, toCode: t }) => {
          onChangeFrom(f);
          onChangeTo(t);
        }}
        showSwap={true}
        labels={{ from: "From", to: "To" }}
        placeholders={{ from: "Please select", to: "Please select" }}
        disableSameSelection
        // NOTE: when `bundleRoute` is true, the picker uses a 3-col CSS grid.
        // Forcing `w-full` on each input causes them to overlap the swap button.
        // Let the grid control widths; only keep min-width constraints.
        widthClass="min-w-0"
        fromError={fromError || undefined}
        toError={toError || undefined}
        onLoadMore={() => {
          if (countriesHasMore) {
            countriesFetchNext?.();
          }
        }}
        hasMore={countriesHasMore}
        loadingMore={countriesLoadingMore}
        fromOnLoadMore={fromCountriesFetchNext}
        toOnLoadMore={toCountriesFetchNext}
        fromHasMore={fromCountriesHasMore}
        toHasMore={toCountriesHasMore}
        fromLoadingMore={fromCountriesLoadingMore}
        toLoadingMore={toCountriesLoadingMore}
      />

      {/* Departure date */}
      <div className="relative w-full min-w-0 md:w-[240px] xl:w-full">
        <label className="block text-[12px] text-[#3D495C] mb-1">
          Departure date
        </label>
        <TailiwindCustomDatePicker
          value={departDate}
          onChange={(d) => {
            setDepartDate(d);
            onChangeDepartDate?.(d);
            // If new departure is after current return, clear return date
            if (arrivalDate && d && d.getTime() > arrivalDate.getTime()) {
              setArrivalDate(null);
              onChangeArrivalDate?.(null);
            }
          }}
          placeholder="Select departure date"
          buttonIconSrc={true}
          disablePastDates={true}
          tooltip="Select departure date"
          error={departDateError || null}
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

      <div className="relative w-full min-w-0 md:w-[240px] xl:w-full">
        <label className="block text-[12px] text-[#3D495C] mb-1">
          Return date
        </label>
        <TailiwindCustomDatePicker
          value={arrivalDate}
          onChange={(d) => {
            setArrivalDate(d);
            onChangeArrivalDate?.(d);
          }}
          placeholder="Select return date"
          buttonIconSrc={true}
          disablePastDates={true}
          minDate={departDate}
          tooltip="Select return date"
          error={arrivalDateError || null}
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
      <div className="relative w-full min-w-0 md:w-[240px] xl:w-full">
        <PassengerCabinDropdown
          schema={passengerSchema}
          loadingPassengers={loadingPassengers}
          cabinClasses={cabinClasses}
          loadingCabinClasses={loadingCabinClasses}
          selectedCabinClassId={selectedCabinClassId}
          onChangeCabinClassId={onChangeCabinClassId}
          widthClass="w-full"
          onChangePax={handlePaxChange}
          passengersError={passengersError}
          cabinClassError={cabinClassError}
        />
        {passengersError && (
          <p className="absolute top-full left-0 mt-1 text-[12px] text-[#E65959]">
            {passengersError}
          </p>
        )}
        {cabinClassError && (
          <p
            className={`absolute top-full left-0 text-[12px] text-[#E65959] ${passengersError ? "mt-6" : "mt-1"
              }`}
          >
            {cabinClassError}
          </p>
        )}
      </div>
    </div>
  );
};

export default RoundTripForm;
