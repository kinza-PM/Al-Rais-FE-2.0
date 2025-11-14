import React from "react";
import PassengerCounterDropdown from "../atoms/PassengerCounterDropdown";
import type {
  CabinClassOption,
  CountryOption,
  PassengerSchema,
} from "../../features/flights/types";
import TravelRoutePicker from "../atoms/TravelRoutePicker";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
import SearchableDropdown from "../common/SearchableDropdown";

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
  // lifted state callbacks
  onChangePassengers?: (p: { [k: string]: number }, order: string[]) => void;
  onChangeDepartDate?: (d: Date | null) => void;
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
  onChangePassengers,
  onChangeDepartDate,
}) => {
  // const depRef = useRef<HTMLInputElement>(null);
  const [departDate, setDepartDate] = React.useState<Date | null>(null);

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
  const handlePaxChange = React.useCallback((p: any) => {
    const next = p || {};
    
    // Check if the value actually changed compared to current state to prevent infinite loops
    const allKeys = Array.from(new Set([
      ...Object.keys(paxCounts || {}),
      ...Object.keys(next || {}),
      ...((passengerSchema as any[] || []).map((s: any) => s.key))
    ]));
    const hasChanged = allKeys.some((k) => {
      const prevCount = (paxCounts as any)?.[k] ?? 0;
      const nextCount = (next as any)[k] ?? 0;
      return prevCount !== nextCount;
    });
    
    // If nothing changed, don't update state
    if (!hasChanged) {
      return;
    }
    
    const schemaKeys = (passengerSchema as any[] || []).map((s: any) => s.key);
    const keys = Array.from(new Set([...Object.keys(prevCountsRef.current || {}), ...Object.keys(next), ...schemaKeys]));
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
  }, [passengerSchema, onChangePassengers, paxCounts]);

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
          onChange={(d) => {
            setDepartDate(d);
            onChangeDepartDate?.(d);
          }}
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
          onChange={handlePaxChange}
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
        <SearchableDropdown
          options={cabinClasses.map(cc => ({
            id: cc.id,
            value: cc.id,
            label: cc.label
          }))}
          value={selectedCabinClassId}
          onChange={onChangeCabinClassId}
          placeholder="Please select"
          label="Cabin class"
          disabled={!!loadingCabinClasses}
          error={cabinError}
          widthClass="w-full"
          searchPlaceholder="Search cabin classes..."
        />
      </div>

    </div>
  );
};

export default OneWayForm;
