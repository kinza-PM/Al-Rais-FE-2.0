import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import OneWayForm from "./OneWayForm";
import RoundTripForm from "./RoundTripForm";
import MultiCityForm, { type MultiCityLeg } from "./MultiCityForm";
import type {
  TripType,
  FlightTypeOption,
  AirportOption,
  PassengerSchema,
  CabinClassOption,
} from "../../features/flights/types";
import { useAiprortOptions } from "../../hooks/masterListings/listing";
import { useMasterListings } from "../../hooks/masterListings/useMasterListings";
import { useFlightStore } from "../../store/UseFlightStore";
import { useNavigate } from "react-router-dom";
import Loader from "../atoms/Loader";
import { formatDateToLocalISO, parseLocalDateString } from "../../utils/helpers";
import noInternet from "../../assets/svgs/no-internet.svg";

const FlightHeroSection: React.FC = () => {
  const [trip, setTrip] = useState<TripType>("oneway");
  const [fromCode, setFromCode] = useState<string>("");
  const [toCode, setToCode] = useState<string>("");
  const [selectedCabinClassId, setSelectedCabinClassId] = useState<string>("5");
  const [paxCounts, setPaxCounts] = useState<Record<string, number>>({});
  const [paxOrder, setPaxOrder] = useState<string[]>([]);
  // const [departDate, setDepartDate] = useState<Date | null>(new Date());
  // const [arrivalDate, setArrivalDate] = useState<Date | null>(new Date());
  const [departDate, setDepartDate] = useState<Date | null>(null);
  const [arrivalDate, setArrivalDate] = useState<Date | null>(null);
  const [fromCountriesSearchTerm, setFromCountriesSearchTerm] =
    useState<string>("");
  const [toCountriesSearchTerm, setToCountriesSearchTerm] =
    useState<string>("");
  const [multicityLegs, setMulticityLegs] = useState<MultiCityLeg[]>([
    { fromCode: "", toCode: "", date: null, cabinClassId: "5" },
    { fromCode: "", toCode: "", date: null, cabinClassId: "5" },
  ]);
  const [validationErrors, setValidationErrors] = useState({
    fromCode: "",
    toCode: "",
    departDate: "",
    arrivalDate: "",
    passengers: "",
    cabinClass: "",
  });
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);

  const handlePassengers = useCallback(
    (next: Record<string, number>, order: string[]) => {
      setPaxCounts(next);
      setPaxOrder(order);
    },
    [],
  );

  const handleDepartDate = useCallback(
    (d: Date | null) => setDepartDate(d),
    [],
  );
  const handleArrivalDate = useCallback(
    (d: Date | null) => setArrivalDate(d),
    [],
  );

  const {
    flightTypes,
    passengers,
    cabinClasses,
    loading,
    loadingMap,
    errorMap,
  } = useMasterListings({
    include: ["flightTypes", "passengers", "cabinClasses"],
  });

  const qFromAirports = useAiprortOptions(true, fromCountriesSearchTerm, "from");
  const qToAirports = useAiprortOptions(true, toCountriesSearchTerm, "to");

  const navigate = useNavigate();
  const { flight, setFlight } = useFlightStore();
  const lastFlightSnapshotRef = useRef<string | null>(null);

  const tabs = useMemo<FlightTypeOption[]>(() => flightTypes, [flightTypes]);

  // Don't block the whole page with loader while user is typing/searching in From/To.
  const isInitialLoading =
    !fromCountriesSearchTerm.trim() &&
    !toCountriesSearchTerm.trim() &&
    loading &&
    (qFromAirports.data.length === 0 || qToAirports.data.length === 0);

  const nsLoading = useMemo(
    () => ({
      flightTypes: isInitialLoading,
      // For countries, use field-level loading so the dropdown
      // can show a loading state during search as well.
      countries:
        qFromAirports.isLoading ||
        qFromAirports.isFetching ||
        qToAirports.isLoading ||
        qToAirports.isFetching ||
        isInitialLoading,
      passengers: isInitialLoading,
      cabinClasses: isInitialLoading,
    }),
    [isInitialLoading, loadingMap],
  );

  // useEffect(() => {
  //   if (!fromCode && countries[0]) setFromCode(countries[0].code);
  //   if (!toCode && countries[1]) setToCode(countries[1].code);
  // }, [countries, fromCode, toCode]);

  const flightTypesFailed =
    !!errorMap?.flightTypes ||
    (!loading && (!flightTypes || flightTypes.length === 0));

  useEffect(() => {
    if (tabs.length && !tabs.find((t) => t.key === trip)) {
      setTrip(tabs[0].key);
    }
  }, [tabs, trip]);

  /** Re-apply last search from the global store when returning from /search_flight (runs before trip-reset effect). */
  useLayoutEffect(() => {
    if (!flight) return;
    const snap = JSON.stringify({
      t: flight.trip,
      fc: flight.fromCode,
      tc: flight.toCode,
      dep: flight.departure,
      arr: flight.arrival,
      cc: flight.selectedCabinClassId,
      legs: flight.legs,
      next: flight.next,
      order: flight.order,
    });
    if (lastFlightSnapshotRef.current === snap) return;
    lastFlightSnapshotRef.current = snap;

    setTrip((flight.trip as TripType) || "oneway");
    setFromCode(flight.fromCode || "");
    setToCode(flight.toCode || "");
    setSelectedCabinClassId(String(flight.selectedCabinClassId ?? "5"));
    setPaxCounts(flight.next ? { ...flight.next } : {});
    setPaxOrder(flight.order?.slice() ?? []);
    setDepartDate(parseLocalDateString(flight.departure ?? undefined));
    setArrivalDate(parseLocalDateString(flight.arrival ?? undefined));
    if (
      flight.trip === "multicity" &&
      Array.isArray(flight.legs) &&
      flight.legs.length > 0
    ) {
      setMulticityLegs(
        flight.legs.map((l) => ({
          fromCode: l.fromCode,
          toCode: l.toCode,
          date: parseLocalDateString(l.date ?? undefined),
          cabinClassId: l.cabinClassId ?? "5",
          fromOption: l.fromOption ?? null,
          toOption: l.toOption ?? null,
        })),
      );
    } else {
      setMulticityLegs([
        { fromCode: "", toCode: "", date: null, cabinClassId: "5" },
        { fromCode: "", toCode: "", date: null, cabinClassId: "5" },
      ]);
    }
    setFromCountriesSearchTerm("");
    setToCountriesSearchTerm("");
    setHasAttemptedValidation(false);
    setValidationErrors({
      fromCode: "",
      toCode: "",
      departDate: "",
      arrivalDate: "",
      passengers: "",
      cabinClass: "",
    });
  }, [flight]);

  const isFirstTripEffect = useRef(true);
  const prevTripRef = useRef<TripType | null>(null);

  useEffect(() => {
    if (isFirstTripEffect.current) {
      isFirstTripEffect.current = false;
      prevTripRef.current = trip;
      return;
    }
    if (prevTripRef.current === trip) return;
    prevTripRef.current = trip;

    setPaxCounts({});
    setPaxOrder([]);
    setSelectedCabinClassId("5");
    setFromCountriesSearchTerm("");
    setToCountriesSearchTerm("");
    setMulticityLegs([
      { fromCode: "", toCode: "", date: null, cabinClassId: "5" },
      { fromCode: "", toCode: "", date: null, cabinClassId: "5" },
    ]);
    setHasAttemptedValidation(false);
    setValidationErrors({
      fromCode: "",
      toCode: "",
      departDate: "",
      arrivalDate: "",
      passengers: "",
      cabinClass: "",
    });
  }, [trip]);

  // const validateForm = (): boolean => {
  //   const errors = {
  //     departDate: "",
  //     arrivalDate: "",
  //     passengers: "",
  //     cabinClass: "",
  //   };
  //   let isValid = true;
  //   if (!departDate) {
  //     errors.departDate = "Departure date is required";
  //     isValid = false;
  //   }
  //   if (trip === "roundtrip" && !arrivalDate) {
  //     errors.arrivalDate = "Arrival date is required";
  //     isValid = false;
  //   }
  //   const totalPassengers = Object.values(paxCounts).reduce(
  //     (sum, count) => sum + count,
  //     0
  //   );
  //   if (totalPassengers === 0) {
  //     errors.passengers = "Passenger is required";
  //     isValid = false;
  //   }
  //   if (!selectedCabinClassId) {
  //     errors.cabinClass = "Cabin class is required";
  //     isValid = false;
  //   }
  //   setValidationErrors(errors);
  //   return isValid;
  // };
  const validateForm = (): boolean => {
    const errors = {
      fromCode: "",
      toCode: "",
      departDate: "",
      arrivalDate: "",
      passengers: "",
      cabinClass: "",
    };
    let isValid = true;

    if (trip === "multicity") {
      const hasInvalidLeg = multicityLegs.some(
        (leg) =>
          !leg.fromCode?.trim() ||
          !leg.toCode?.trim() ||
          !leg.date ||
          !leg.cabinClassId?.trim(),
      );

      if (hasInvalidLeg) {
        if (multicityLegs.some((leg) => !leg.fromCode?.trim())) {
          errors.fromCode = "Select where you're flying from";
        }
        if (multicityLegs.some((leg) => !leg.toCode?.trim())) {
          errors.toCode = "Select where you're flying to";
        }
        if (multicityLegs.some((leg) => !leg.date)) {
          errors.departDate = "Departure date is required";
        }
        if (multicityLegs.some((leg) => !leg.cabinClassId?.trim())) {
          errors.cabinClass = "Cabin class is required";
        }
        isValid = false;
      }
    } else {
      if (!fromCode?.trim()) {
        errors.fromCode = "Select where you're flying from";
        isValid = false;
      }
      if (!toCode?.trim()) {
        errors.toCode = "Select where you're flying to";
        isValid = false;
      }

      if (!departDate) {
        errors.departDate = "Departure date is required";
        isValid = false;
      }
      if (trip === "roundtrip" && !arrivalDate) {
        errors.arrivalDate = "Return date is required";
        isValid = false;
      }
    }

    // If no passenger selection has been propagated yet, treat default UI (1 adult) as selected
    const totalPassengersRaw = Object.values(paxCounts).reduce(
      (sum, count) => sum + count,
      0,
    );
    const totalPassengers =
      Object.keys(paxCounts).length === 0 ? 1 : totalPassengersRaw;

    if (totalPassengers === 0) {
      errors.passengers = "Passenger is required";
      isValid = false;
    }
    if (!selectedCabinClassId || selectedCabinClassId.trim() === "") {
      errors.cabinClass = "Cabin class is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Clear errors when values are filled
  useEffect(() => {
    if (!hasAttemptedValidation) return;

    setValidationErrors((prev) => {
      const updated = { ...prev };
      if (trip === "multicity") {
        const allLegsValid = multicityLegs.every(
          (leg) =>
            leg.fromCode?.trim() &&
            leg.toCode?.trim() &&
            leg.date &&
            leg.cabinClassId?.trim(),
        );
        if (allLegsValid && prev.fromCode) updated.fromCode = "";
        if (allLegsValid && prev.cabinClass) updated.cabinClass = "";
      } else {
        if (fromCode?.trim() && prev.fromCode) updated.fromCode = "";
        if (toCode?.trim() && prev.toCode) updated.toCode = "";
        if (departDate && prev.departDate) updated.departDate = "";
        if (trip === "roundtrip" && arrivalDate && prev.arrivalDate) {
          updated.arrivalDate = "";
        }
      }
      const totalPassengers = Object.values(paxCounts).reduce(
        (sum, count) => sum + count,
        0,
      );
      const totalPassengersFinal =
        Object.keys(paxCounts).length === 0 ? 1 : totalPassengers;
      if (totalPassengersFinal > 0 && prev.passengers) updated.passengers = "";
      if (selectedCabinClassId && prev.cabinClass) updated.cabinClass = "";
      return updated;
    });
  }, [
    fromCode,
    toCode,
    departDate,
    arrivalDate,
    paxCounts,
    selectedCabinClassId,
    trip,
    hasAttemptedValidation,
    multicityLegs,
  ]);

  const handleSearch = () => {
    setHasAttemptedValidation(true);
    if (!validateForm()) {
      return;
    }

    const countriesArr = [
      ...(qFromAirports.data as AirportOption[]),
      ...(qToAirports.data as AirportOption[]),
    ];

    if (trip === "multicity") {
      const legsForStore = multicityLegs
        .filter(
          (l) =>
            l.fromCode?.trim() &&
            l.toCode?.trim() &&
            l.date &&
            l.cabinClassId?.trim(),
        )
        .map((l) => ({
          fromCode: l.fromCode,
          toCode: l.toCode,
          date: formatDateToLocalISO(l.date),
          cabinClassId: l.cabinClassId ?? "5",
          fromOption:
            countriesArr.find((c) => c.code === l.fromCode) ??
            l.fromOption ??
            null,
          toOption:
            countriesArr.find((c) => c.code === l.toCode) ?? l.toOption ?? null,
        }));
      const firstLeg = legsForStore[0];
      const lastLeg = legsForStore[legsForStore.length - 1];

      setFlight({
        fromCode: firstLeg?.fromCode ?? "",
        toCode: lastLeg?.toCode ?? "",
        fromOption: firstLeg?.fromOption ?? null,
        toOption: lastLeg?.toOption ?? null,
        selectedCabinClassId: firstLeg?.cabinClassId ?? "5",
        trip,
        order: paxOrder,
        next: paxCounts,
        departure: null,
        arrival: null,
        legs: legsForStore,
        flight_filters: {},
      });
    } else {
      const departureStr = formatDateToLocalISO(departDate);
      const arrivalStr = formatDateToLocalISO(arrivalDate);

      const fromOpt = countriesArr.find((c) => c.code === fromCode) ?? null;
      const toOpt = countriesArr.find((c) => c.code === toCode) ?? null;

      setFlight({
        fromCode,
        toCode,
        fromOption: fromOpt,
        toOption: toOpt,
        selectedCabinClassId,
        trip,
        order: paxOrder,
        next: paxCounts,
        departure: departureStr,
        arrival: trip === "roundtrip" ? arrivalStr : null,
        flight_filters: {},
      });
    }

    navigate("/search_flight");
  };

  return (
    <>
      <Loader show={isInitialLoading} />

      {flightTypesFailed ? (
        <div className="py-16 flex flex-col items-center text-center">
          <img src={noInternet} alt="globe-icon" className="w-5 h-5" />
          <p className="mt-4 text-[14px] text-[#0F172A]">
            The server encountered an error and could not complete your request.
          </p>
          <p className="mt-2 text-[14px] text-[#3D495C]">
            Please reload this page, or click{" "}
            <button
              type="button"
              className="text-[#2351A3] underline underline-offset-2"
              onClick={() => window.location.reload()}
            >
              try again
            </button>
            .
          </p>
        </div>
      ) : (
        <>
          {/* ── Trip type segmented control ── */}
          <div className="mt-0.5 flex justify-center px-1">
            <div className="flex max-w-full flex-wrap items-center justify-center gap-2 rounded-xl bg-white p-1">
              {nsLoading.flightTypes && (
                <div className="rounded-xl px-6 py-2 text-[14px] text-[#3A4350] opacity-60">
                  Loading…
                </div>
              )}
              {!nsLoading.flightTypes &&
                tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrip(t.key)}
                    className={[
                      "min-w-0 flex-1 sm:flex-none sm:w-[115px]",
                      "text-[12px] sm:text-[14px] font-medium",
                      "flex cursor-pointer items-center justify-center",
                      // smooth all: bg, color, shadow, transform
                      "transition-all duration-200 ease-out",
                      // press feedback
                      "active:scale-95",
                      // active lift
                      trip === t.key ? "-translate-y-[1px]" : "translate-y-0",
                      trip === t.key ? "text-white" : "text-[#3A4350] hover:text-[#2351A3]",
                    ].join(" ")}
                    style={{
                      height: 35,
                      padding: "0 8px",
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                      background:
                        trip === t.key
                          ? "var(--primary-300, #2351A3)"
                          : "#F2F2F3",
                      boxShadow:
                        trip === t.key
                          ? "0 4px 12px rgba(35,81,163,0.30)"
                          : "none",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
            </div>
          </div>

          {/* ── Form fields + Search button ── */}
          {/* animate-in: fade + slide up on every tab switch */}
          <div
            key={trip}
            className="animate-[fadeSlideUp_220ms_ease-out_both] px-4 pt-5 pb-5 sm:px-6 md:px-10 lg:pt-4 lg:pb-4"
          >
            {trip === "oneway" && (
              <OneWayForm
                loadingCountries={nsLoading.countries}
                fromCode={fromCode}
                toCode={toCode}
                fromCountries={qFromAirports.data as AirportOption[]}
                toCountries={qToAirports.data as AirportOption[]}
                loadingFromCountries={
                  qFromAirports.isLoading || qFromAirports.isFetching
                }
                loadingToCountries={
                  qToAirports.isLoading || qToAirports.isFetching
                }
                onSearchFromCountries={setFromCountriesSearchTerm}
                onSearchToCountries={setToCountriesSearchTerm}
                departDateValue={departDate}
                onChangeFrom={setFromCode}
                onChangeTo={setToCode}
                passengerSchema={passengers as PassengerSchema}
                loadingPassengers={nsLoading.passengers}
                cabinClasses={cabinClasses as CabinClassOption[]}
                loadingCabinClasses={nsLoading.cabinClasses}
                selectedCabinClassId={selectedCabinClassId}
                onChangeCabinClassId={setSelectedCabinClassId}
                onChangePassengers={handlePassengers}
                onChangeDepartDate={handleDepartDate}
                fromError={
                  hasAttemptedValidation
                    ? validationErrors.fromCode
                    : qFromAirports.error?.message || ""
                }
                toError={
                  hasAttemptedValidation
                    ? validationErrors.toCode
                    : qToAirports.error?.message || ""
                }
                departDateError={
                  hasAttemptedValidation ? validationErrors.departDate : ""
                }
                passengersError={
                  hasAttemptedValidation ? validationErrors.passengers : ""
                }
                cabinClassError={
                  hasAttemptedValidation ? validationErrors.cabinClass : ""
                }
                fromCountriesHasMore={qFromAirports.hasNextPage}
                toCountriesHasMore={qToAirports.hasNextPage}
                fromCountriesFetchNext={qFromAirports.fetchNextPage}
                toCountriesFetchNext={qToAirports.fetchNextPage}
                fromCountriesLoadingMore={qFromAirports.isFetchingNextPage}
                toCountriesLoadingMore={qToAirports.isFetchingNextPage}
              />
            )}

            {trip === "roundtrip" && (
              <RoundTripForm
                loadingCountries={nsLoading.countries}
                fromCode={fromCode}
                toCode={toCode}
                fromCountries={qFromAirports.data as AirportOption[]}
                toCountries={qToAirports.data as AirportOption[]}
                loadingFromCountries={
                  qFromAirports.isLoading || qFromAirports.isFetching
                }
                loadingToCountries={
                  qToAirports.isLoading || qToAirports.isFetching
                }
                onSearchFromCountries={setFromCountriesSearchTerm}
                onSearchToCountries={setToCountriesSearchTerm}
                departDateValue={departDate}
                arrivalDateValue={arrivalDate}
                onChangeFrom={setFromCode}
                onChangeTo={setToCode}
                passengerSchema={passengers as PassengerSchema}
                loadingPassengers={nsLoading.passengers}
                cabinClasses={cabinClasses as CabinClassOption[]}
                loadingCabinClasses={nsLoading.cabinClasses}
                selectedCabinClassId={selectedCabinClassId}
                onChangeCabinClassId={setSelectedCabinClassId}
                onChangePassengers={handlePassengers}
                onChangeDepartDate={handleDepartDate}
                onChangeArrivalDate={handleArrivalDate}
                fromError={
                  hasAttemptedValidation
                    ? validationErrors.fromCode
                    : qFromAirports.error?.message || ""
                }
                toError={
                  hasAttemptedValidation
                    ? validationErrors.toCode
                    : qToAirports.error?.message || ""
                }
                departDateError={
                  hasAttemptedValidation ? validationErrors.departDate : ""
                }
                arrivalDateError={
                  hasAttemptedValidation ? validationErrors.arrivalDate : ""
                }
                passengersError={
                  hasAttemptedValidation ? validationErrors.passengers : ""
                }
                cabinClassError={
                  hasAttemptedValidation ? validationErrors.cabinClass : ""
                }
                fromCountriesHasMore={qFromAirports.hasNextPage}
                toCountriesHasMore={qToAirports.hasNextPage}
                fromCountriesFetchNext={qFromAirports.fetchNextPage}
                toCountriesFetchNext={qToAirports.fetchNextPage}
                fromCountriesLoadingMore={qFromAirports.isFetchingNextPage}
                toCountriesLoadingMore={qToAirports.isFetchingNextPage}
              />
            )}

            {trip === "multicity" && (
              <MultiCityForm
                loadingCountries={nsLoading.countries}
                fromCountries={qFromAirports.data as AirportOption[]}
                toCountries={qToAirports.data as AirportOption[]}
                loadingFromCountries={
                  qFromAirports.isLoading || qFromAirports.isFetching
                }
                loadingToCountries={
                  qToAirports.isLoading || qToAirports.isFetching
                }
                onSearchFromCountries={setFromCountriesSearchTerm}
                onSearchToCountries={setToCountriesSearchTerm}
                passengerSchema={passengers as PassengerSchema}
                loadingPassengers={nsLoading.passengers}
                cabinClasses={cabinClasses as CabinClassOption[]}
                loadingCabinClasses={nsLoading.cabinClasses}
                legs={multicityLegs}
                onChangeLegs={setMulticityLegs}
                onChangePassengers={handlePassengers}
                fromError={
                  hasAttemptedValidation
                    ? validationErrors.fromCode
                    : qFromAirports.error?.message || ""
                }
                toError={
                  hasAttemptedValidation
                    ? validationErrors.toCode
                    : qToAirports.error?.message || ""
                }
                departDateError={
                  hasAttemptedValidation ? validationErrors.departDate : ""
                }
                passengersError={
                  hasAttemptedValidation ? validationErrors.passengers : ""
                }
                cabinClassError={
                  hasAttemptedValidation ? validationErrors.cabinClass : ""
                }
                fromCountriesHasMore={qFromAirports.hasNextPage}
                toCountriesHasMore={qToAirports.hasNextPage}
                fromCountriesFetchNext={qFromAirports.fetchNextPage}
                toCountriesFetchNext={qToAirports.fetchNextPage}
                fromCountriesLoadingMore={qFromAirports.isFetchingNextPage}
                toCountriesLoadingMore={qToAirports.isFetchingNextPage}
              />
            )}

            {/* ── Search button ── */}
            <div
              className={`flex justify-center ${!hasAttemptedValidation ? "mt-4 lg:mt-3" : "mt-8 lg:mt-6"}`}
            >
              <button
                type="button"
                className={[
                  "text-[16px] font-medium text-white",
                  "w-full sm:w-auto",
                  // smooth transitions
                  "transition-all duration-200 ease-out",
                  // press scale
                  "active:scale-95",
                  // hover: slight lift + glow
                  "hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(35,81,163,0.45)]",
                  // focus ring
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5383DA] focus-visible:ring-offset-2",
                ].join(" ")}
                style={{
                  minWidth: 137,
                  height: 47,
                  borderRadius: 100,
                  padding: "14px 40px",
                  background:
                    "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
                }}
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FlightHeroSection;
