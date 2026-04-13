import React, { useEffect, useState } from "react";
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

export type MultiCityLeg = {
  fromCode: string;
  toCode: string;
  date: Date | null;
  cabinClassId?: string;
  fromOption?: AirportOption | null;
  toOption?: AirportOption | null;
};

type Props = {
  countries?: AirportOption[];
  loadingCountries?: boolean;
  onSearchCountries?: (term: string) => void;
  passengerSchema?: PassengerSchema;
  loadingPassengers?: boolean;
  cabinClasses?: CabinClassOption[];
  loadingCabinClasses?: boolean;
  legs?: MultiCityLeg[];
  onChangeLegs?: (legs: MultiCityLeg[]) => void;
  onChangePassengers?: (p: Record<string, number>, order: string[]) => void;
  fromError?: string;
  toError?: string;
  departDateError?: string;
  passengersError?: string;
  cabinClassError?: string;
  countriesHasMore?: boolean;
  countriesFetchNext?: () => void;
  countriesLoadingMore?: boolean;
};

const DEFAULT_CABIN_ID = "5";
const INITIAL_LEG: MultiCityLeg = {
  fromCode: "",
  toCode: "",
  date: null,
  cabinClassId: DEFAULT_CABIN_ID,
};

const MultiCityForm: React.FC<Props> = ({
  countries = [],
  loadingCountries = false,
  onSearchCountries,
  passengerSchema = [],
  loadingPassengers = false,
  cabinClasses = [],
  loadingCabinClasses = false,
  legs: controlledLegs,
  onChangeLegs,
  onChangePassengers,
  fromError = "",
  toError = "",
  departDateError = "",
  passengersError = "",
  cabinClassError = "",
  countriesHasMore = false,
  countriesFetchNext = () => {},
  countriesLoadingMore = false,
}) => {
  const [internalLegs, setInternalLegs] = useState<MultiCityLeg[]>([
    { ...INITIAL_LEG },
    { ...INITIAL_LEG },
  ]);

  const legs = controlledLegs ?? internalLegs;
  const setLegs = (
    next: MultiCityLeg[] | ((prev: MultiCityLeg[]) => MultiCityLeg[]),
  ) => {
    const resolved = typeof next === "function" ? next(legs) : next;
    onChangeLegs?.(resolved);
    if (!controlledLegs) setInternalLegs(resolved);
  };

  const [paxCounts, setPaxCounts] = useState<Record<string, number>>({});
  const passengerRequestOrder = React.useRef<string[]>([]);

  const updateLeg = (i: number, next: Partial<MultiCityLeg>) => {
    setLegs((prev) =>
      prev.map((l, idx) =>
        idx === i
          ? {
              ...l,
              ...next,
            }
          : l,
      ),
    );
  };

  const removeLeg = (i: number) => {
    setLegs((prev) => prev.filter((_, idx) => idx !== i));
  };

  const addAnotherStop = () => {
    setLegs((prev) => [...prev, { ...INITIAL_LEG }]);
  };

  const handlePaxChange = React.useCallback(
    (p: any) => {
      const next = p || {};
      const schemaKeys = ((passengerSchema as any[]) || []).map(
        (s: any) => s.key,
      );
      const keys = Array.from(
        new Set([
          ...Object.keys(paxCounts || {}),
          ...Object.keys(next),
          ...schemaKeys,
        ]),
      );
      const order = passengerRequestOrder.current.slice();
      const prev = paxCounts || {};
      for (const k of keys) {
        const prevCount = prev[k] ?? 0;
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
      setPaxCounts(next as any);
      onChangePassengers?.(next as any, order);
    },
    [passengerSchema, onChangePassengers, paxCounts],
  );

  useEffect(() => {
    setLegs((prev) => {
      const updated = [...prev];
      let hasChanges = false;

      for (let i = 0; i < updated.length - 1; i++) {
        const currentLeg = updated[i];
        const nextLeg = updated[i + 1];
        if (
          currentLeg.toCode &&
          currentLeg.toCode.trim() &&
          nextLeg.fromCode !== currentLeg.toCode
        ) {
          updated[i + 1] = {
            ...nextLeg,
            fromCode: currentLeg.toCode,
            fromOption: currentLeg.toOption, 
          };
          hasChanges = true;
        }
      }

      return hasChanges ? updated : prev;
    });
  }, [legs.map((leg) => leg.toCode).join(",")]);

  const cabinError =
    !loadingCabinClasses && (!cabinClasses || cabinClasses.length === 0)
      ? "Cabin classes are not available right now. Please try again later."
      : null;

  return (
    <div className="px-6 pb-6 pt-3">
      {/* ROW 1 — Passengers only (cabin is per flight row below) */}
      <div className="flex gap-3 mb-5 justify-center">
        <div className="relative w-full sm:w-[200px]">
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
      </div>

      {/* Dynamic legs */}
      {legs.map((leg, idx) => (
        <div key={idx} className="space-y-4 mb-6">
          <p className="text-[14px] text-[#11253E] font-medium">
            Flight {String(idx + 1).padStart(2, "0")}
          </p>
          {/* grid: From | swap | To (flex) | Departure date | Cabin | Remove */}
          <div className="grid grid-cols-1 items-center gap-3 md:gap-4 md:grid-cols-[230px_47px_minmax(230px,1fr)_230px_220px_40px]">
            <TravelRoutePicker
              options={countries}
              loading={loadingCountries}
              onSearchChange={onSearchCountries}
              value={{
                fromCode: leg.fromCode,
                toCode: leg.toCode,
                fromOption: leg.fromOption ?? null,
                toOption: leg.toOption ?? null,
              }}
              onChange={({ fromCode, toCode, fromOption, toOption }) =>
                updateLeg(idx, {
                  fromCode,
                  toCode,
                  fromOption: fromOption ?? leg.fromOption,
                  toOption: toOption ?? leg.toOption,
                })
              }
              showSwap
              labels={{ from: "From", to: "To" }}
              placeholders={{ from: "Please select", to: "Please select" }}
              disableSameSelection
              widthClass="w-full md:w-[230px]"
              fromError={(!leg.fromCode?.trim() && fromError) || undefined}
              toError={(!leg.toCode?.trim() && toError) || undefined}
              onLoadMore={() => {
                if (countriesHasMore) countriesFetchNext?.();
              }}
              hasMore={countriesHasMore}
              loadingMore={countriesLoadingMore}
            />

            <div className="w-full md:w-[230px]">
              <label className="block text-[12px] text-[#3D495C] mb-1">
                Departure date
              </label>
              <TailiwindCustomDatePicker
                value={leg.date}
                onChange={(d) => updateLeg(idx, { date: d })}
                placeholder="Select departure date"
                tooltip="Select departure date"
                buttonIconSrc={true}
                disablePastDates={true}
                minDate={
                  idx > 0 && legs[idx - 1]?.date
                    ? (legs[idx - 1].date ?? undefined)
                    : undefined
                }
                error={(!leg.date && departDateError) || null}
              />
            </div>

            <div className="w-full md:w-[220px]">
              <SearchableDropdown
                options={cabinClasses.map((cc) => ({
                  id: cc.id,
                  value: cc.id,
                  label: cc.label,
                }))}
                value={leg.cabinClassId ?? DEFAULT_CABIN_ID}
                onChange={(id) => updateLeg(idx, { cabinClassId: id })}
                placeholder={loadingCabinClasses ? "Loading…" : "Please select"}
                label="Cabin class"
                disabled={!!loadingCabinClasses}
                error={cabinClassError || cabinError}
                widthClass="w-full"
                searchPlaceholder="Search cabin classes..."
                tooltip="Select cabin class"
              />
            </div>

            {idx >= 2 && (
              <button
                type="button"
                onClick={() => removeLeg(idx)}
                className="p-2 text-[#DC2626] hover:text-[#B91C1C] hover:bg-red-50 rounded transition-colors"
                aria-label={`Remove flight ${idx + 1}`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add another stop */}
      <div className="flex justify-center mb-4">
        <button
          type="button"
          onClick={addAnotherStop}
          className="text-[14px] font-medium text-[#2351A3] hover:underline underline-offset-2"
        >
          + Add another stop
        </button>
      </div>
    </div>
  );
};

export default MultiCityForm;
