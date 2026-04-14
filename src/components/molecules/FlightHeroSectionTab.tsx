import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { useMasterListings } from "../../hooks/masterListings/useMasterListings";
import { useFlightStore } from "../../store/UseFlightStore";
import { useNavigate } from "react-router-dom";
import Loader from "../atoms/Loader";
import { formatDateToLocalISO } from "../../utils/helpers";
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
  const [countriesSearchTerm, setCountriesSearchTerm] = useState<string>("");
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
    countries,
    passengers,
    cabinClasses,
    loading,
    loadingMap,
    errorMap,
    countriesHasMore,
    countriesFetchNext,
    countriesIsFetchingNext,
  } = useMasterListings({ countriesSearchTerm });

  const navigate = useNavigate();
  const { setFlight } = useFlightStore();

  const tabs = useMemo<FlightTypeOption[]>(() => flightTypes, [flightTypes]);

  // Don't block the whole page with loader while user is typing/searching in From/To.
  const isInitialLoading =
    !countriesSearchTerm.trim() && loading && countries.length === 0;

  const nsLoading = useMemo(
    () => ({
      flightTypes: isInitialLoading,
      // For countries, use field-level loading so the dropdown
      // can show a loading state during search as well.
      countries: loadingMap?.countries ?? isInitialLoading,
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

  useEffect(() => {
    setPaxCounts({});
    setPaxOrder([]);
    setSelectedCabinClassId("5");
    // setDepartDate(null);
    // setArrivalDate(null);
    setCountriesSearchTerm("");
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

    const countriesArr = countries as AirportOption[];

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
          {/* Trip type segmented control */}
          {/* Trip type segmented control */}
          {/* Trip type segmented control */}
          <div className="flex justify-center mt-0.5"> {/* Changed from mt-1 to mt-0.5 */}
            <div className="flex items-center rounded-xl p-1 bg-white">
              {nsLoading.flightTypes && (
                <div className="px-6 py-2 text-[14px] rounded-xl text-[#3A4350] opacity-60">
                  Loading…
                </div>
              )}
              {!nsLoading.flightTypes &&
                tabs.map((t, index) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrip(t.key)}
                    className={`text-[14px] transition-colors cursor-pointer flex items-center justify-center ${trip === t.key ? "text-white" : "text-[#3A4350]"
                      }`}
                    style={{
                      width: 115,
                      height: 35,
                      padding: "0 16px",
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                      background: trip === t.key ? "var(--primary-300, #2351A3)" : "#F2F2F3",
                      opacity: 1,
                      transform: "rotate(0deg)",
                      marginRight: index < tabs.length - 1 ? 8 : 0,
                    }}
                  >
                    {t.label}
                  </button>
                ))}
            </div>
          </div>

          {/* ── Form fields + Search button ── */}
          <div className="px-4 sm:px-6 md:px-10 pt-5 pb-5">
            {trip === "oneway" && (
              <OneWayForm
                countries={countries as AirportOption[]}
                loadingCountries={nsLoading.countries}
                onSearchCountries={setCountriesSearchTerm}
                fromCode={fromCode}
                toCode={toCode}
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
                    : errorMap?.countries || ""
                }
                toError={
                  hasAttemptedValidation
                    ? validationErrors.toCode
                    : errorMap?.countries || ""
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
                countriesHasMore={countriesHasMore}
                countriesFetchNext={countriesFetchNext}
                countriesLoadingMore={countriesIsFetchingNext}
              />
            )}

            {trip === "roundtrip" && (
              <RoundTripForm
                countries={countries as AirportOption[]}
                loadingCountries={nsLoading.countries}
                onSearchCountries={setCountriesSearchTerm}
                fromCode={fromCode}
                toCode={toCode}
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
                    : errorMap?.countries || ""
                }
                toError={
                  hasAttemptedValidation
                    ? validationErrors.toCode
                    : errorMap?.countries || ""
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
                countriesHasMore={countriesHasMore}
                countriesFetchNext={countriesFetchNext}
                countriesLoadingMore={countriesIsFetchingNext}
              />
            )}

            {trip === "multicity" && (
              <MultiCityForm
                countries={countries as AirportOption[]}
                loadingCountries={nsLoading.countries}
                onSearchCountries={setCountriesSearchTerm}
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
                    : errorMap?.countries || ""
                }
                toError={
                  hasAttemptedValidation
                    ? validationErrors.toCode
                    : errorMap?.countries || ""
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
                countriesHasMore={countriesHasMore}
                countriesFetchNext={countriesFetchNext}
                countriesLoadingMore={countriesIsFetchingNext}
              />
            )}

            {/* ── Search button ── */}
            <div
              className={`flex justify-center ${!hasAttemptedValidation ? "mt-4" : "mt-8"}`}
            >
              <button
                className="text-[16px] font-medium text-white w-full sm:w-auto"
                style={{
                  width: "auto",
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
