import React from "react";
import PassengerCounterDropdown from "../atoms/PassengerCounterDropdown";
import type {
  CabinClassOption,
  AirportOption,
  PassengerSchema,
} from "../../features/flights/types";
import TravelRoutePicker from "../atoms/TravelRoutePicker";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
import SearchableDropdown from "../common/SearchableDropdown";
import Info from "../../assets/svgs/info-black.svg";

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
  onChangeFrom?: (code: string) => void;
  onChangeTo?: (code: string) => void;
  passengerSchema?: PassengerSchema;
  loadingPassengers?: boolean;
  cabinClasses?: CabinClassOption[];
  loadingCabinClasses?: boolean;
  selectedCabinClassId?: string; // empty string means none selected
  onChangeCabinClassId?: (id: string) => void;
  // lifted state callbacks
  onChangePassengers?: (p: { [k: string]: number }, order: string[]) => void;
  onChangeDepartDate?: (d: Date | null) => void;
  fromError?: string;
  toError?: string;
  departDateError?: string;
  passengersError?: string;
  cabinClassError?: string;
  countriesHasMore?: boolean;
  countriesFetchNext?: () => void;
  countriesLoadingMore?: boolean;
};

const OneWayForm: React.FC<Props> = ({
  countries = [],
  loadingCountries = false,
  onSearchCountries,
  fromCode = "",
  toCode = "",
  departDateValue = null,
  onChangeFrom = () => {},
  onChangeTo = () => {},
  passengerSchema,
  loadingPassengers = false,
  cabinClasses = [],
  loadingCabinClasses = false,
  selectedCabinClassId = "",
  onChangeCabinClassId = () => {},
  onChangePassengers,
  onChangeDepartDate,
  fromError = "",
  toError = "",
  departDateError = "",
  passengersError = "",
  cabinClassError = "",
  countriesHasMore = false,
  countriesFetchNext = () => {},
  countriesLoadingMore = false,
}) => {
  // const depRef = useRef<HTMLInputElement>(null);
  const [departDate, setDepartDate] = React.useState<Date | null>(
    departDateValue,
  );

  // track pax counts to compute order diffs like FlightDetailTemplate
  const [paxCounts, setPaxCounts] = React.useState<{ [k: string]: number }>({});
  const passengerRequestOrder = React.useRef<string[]>([]);

  const cabinError =
    !loadingCabinClasses && (!cabinClasses || cabinClasses.length === 0)
      ? "Cabin classes are not available right now. Please try again later."
      : null;

  const prevCountsRef = React.useRef<{ [k: string]: number }>({});

  // keep prev counts in sync with current local snapshot
  React.useEffect(() => {
    prevCountsRef.current = paxCounts;
  }, [paxCounts]);
  const handlePaxChange = React.useCallback(
    (p: any) => {
      const next = p || {};

      // Check if the value actually changed compared to current state to prevent infinite loops
      const allKeys = Array.from(
        new Set([
          ...Object.keys(paxCounts || {}),
          ...Object.keys(next || {}),
          ...((passengerSchema as any[]) || []).map((s: any) => s.key),
        ]),
      );
      const hasChanged = allKeys.some((k) => {
        const prevCount = (paxCounts as any)?.[k] ?? 0;
        const nextCount = (next as any)[k] ?? 0;
        return prevCount !== nextCount;
      });

      // If nothing changed, don't update state
      if (!hasChanged) {
        return;
      }

      const schemaKeys = ((passengerSchema as any[]) || []).map(
        (s: any) => s.key,
      );
      const keys = Array.from(
        new Set([
          ...Object.keys(prevCountsRef.current || {}),
          ...Object.keys(next),
          ...schemaKeys,
        ]),
      );
      const order = passengerRequestOrder.current.slice();
      for (const k of keys) {
        const prevCount = (prevCountsRef.current as any)?.[k] ?? 0;
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
      passengerRequestOrder.current = order;
      prevCountsRef.current = next as any;
      setPaxCounts(next as any);
      onChangePassengers?.(next as any, order);
    },
    [passengerSchema, onChangePassengers, paxCounts],
  );

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4">
      <TravelRoutePicker
        options={countries}
        loading={loadingCountries}
        onSearchChange={onSearchCountries}
        value={{ fromCode, toCode }}
        onChange={({ fromCode: f, toCode: t }) => {
          onChangeFrom(f);
          onChangeTo(t);
        }}
        showSwap={true}
        labels={{ from: "From", to: "To" }}
        placeholders={{ from: "Please select", to: "Please select" }}
        disableSameSelection
        widthClass="w-full md:w-[190px]"
        fromError={fromError || undefined}
        toError={toError || undefined}
        onLoadMore={() => {
          if (countriesHasMore) {
            countriesFetchNext?.();
          }
        }}
        hasMore={countriesHasMore}
        loadingMore={countriesLoadingMore}
      />

      {/* Departure date */}
      <div className="w-full md:w-[220px]">
        <label className="block text-[12px] text-[#3D495C] mb-1">
          Departure date
        </label>
        <TailiwindCustomDatePicker
          value={departDate}
          onChange={(d) => {
            setDepartDate(d);
            onChangeDepartDate?.(d);
          }}
          placeholder="Select departure date"
          tooltip="Select departure date"
          buttonIconSrc={true}
          disablePastDates={true}
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

      {/* Passengers */}
      <div className="w-full md:w-[210px] relative">
        <label className="flex items-center gap-2 text-[12px] text-[#3D495C] mb-1">
          Passengers
          <span className="relative inline-flex group/info">
            <img
              src={Info}
              alt="info"
              className="w-4 h-4 inline-block align-middle"
            />
            <span
              className="pointer-events-none absolute bottom-full left-full -translate-x-1/3 mb-2 hidden group-hover/info:block z-50 px-3 py-2 text-xs leading-5 text-white bg-[#1E293B] rounded-lg shadow-lg text-center min-w-max before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:w-0 before:h-0 before:block before:border-4 before:border-transparent before:border-t-[#1E293B]"
              role="tooltip"
            >
              Adults + Kids count cannot exceed 9
              <br />
              Infants cannot be more than Adults
            </span>
          </span>
        </label>
        <PassengerCounterDropdown
          maxTotal={100}
          onChange={handlePaxChange}
          schema={passengerSchema}
          errorMessage={
            passengersError ||
            (!loadingPassengers &&
            (!passengerSchema || passengerSchema.length === 0)
              ? "Passenger types are not available right now. Please try again later."
              : null)
          }
        />
        {passengersError && (
          <p className="absolute top-full left-0 mt-1 text-[12px] text-[#E65959] whitespace-nowrap">
            {passengersError}
          </p>
        )}
      </div>

      {/* Cabin class */}
      <div className="w-full md:w-[210px] relative">
        <SearchableDropdown
          options={cabinClasses.map((cc) => ({
            id: cc.id,
            value: cc.id,
            label: cc.label,
          }))}
          value={selectedCabinClassId}
          onChange={onChangeCabinClassId}
          placeholder="Select cabin class"
          tooltip="Select cabin class"
          label="Cabin class"
          disabled={!!loadingCabinClasses}
          error={cabinClassError || cabinError}
          widthClass="w-full"
          searchPlaceholder="Search cabin classes..."
        />
        {cabinClassError && (
          <p className="absolute top-full left-0 mt-1 text-[12px] text-[#E65959] whitespace-nowrap">
            {cabinClassError}
          </p>
        )}
      </div>
    </div>
  );
};

export default OneWayForm;
