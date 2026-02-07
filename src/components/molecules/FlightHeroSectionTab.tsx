import React, { useCallback, useEffect, useMemo, useState } from "react";
import OneWayForm from "./OneWayForm";
import RoundTripForm from "./RoundTripForm";
// import MultiCityForm from "./MultiCityForm";
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
  const [departDate, setDepartDate] = useState<Date | null>(new Date());
  const [arrivalDate, setArrivalDate] = useState<Date | null>(new Date());
  const [countriesSearchTerm, setCountriesSearchTerm] = useState<string>("");
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
    setDepartDate(null);
    setArrivalDate(null);
    setCountriesSearchTerm("");
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
      if (fromCode?.trim() && prev.fromCode) {
        updated.fromCode = "";
      }
      if (toCode?.trim() && prev.toCode) {
        updated.toCode = "";
      }
      if (departDate && prev.departDate) {
        updated.departDate = "";
      }
      if (trip === "roundtrip" && arrivalDate && prev.arrivalDate) {
        updated.arrivalDate = "";
      }
      const totalPassengers = Object.values(paxCounts).reduce(
        (sum, count) => sum + count,
        0,
      );
      const totalPassengersFinal =
        Object.keys(paxCounts).length === 0 ? 1 : totalPassengers;
      if (totalPassengersFinal > 0 && prev.passengers) {
        updated.passengers = "";
      }
      if (selectedCabinClassId && prev.cabinClass) {
        updated.cabinClass = "";
      }
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
  ]);

  const handleSearch = () => {
    setHasAttemptedValidation(true);
    if (!validateForm()) {
      return;
    }
    const departureStr = formatDateToLocalISO(departDate);
    const arrivalStr = formatDateToLocalISO(arrivalDate);

    const fromOpt =
      (countries as AirportOption[]).find((c) => c.code === fromCode) ?? null;
    const toOpt =
      (countries as AirportOption[]).find((c) => c.code === toCode) ?? null;

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
          <div className="flex justify-center mt-4">
            <div className="flex items-center rounded-xl ring-1 ring-[#D9E2EF] p-1 bg-white">
              {nsLoading.flightTypes && (
                <div className="px-6 py-2 text-[14px] rounded-xl text-[#3A4350] opacity-60">
                  Loading…
                </div>
              )}
              {!nsLoading.flightTypes &&
                tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrip(t.key)}
                    className={`px-6 py-2 text-[14px] rounded-xl transition-colors ${trip === t.key
                        ? "bg-[#2351A3] text-white"
                        : "text-[#3A4350] hover:bg-[#F4F7FD]"
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
            </div>
          </div>

          {/* Form row */}
          <div className="px-10 pb-8 pt-6">
            {trip === "oneway" && (
              <OneWayForm
                countries={countries as AirportOption[]}
                loadingCountries={nsLoading.countries}
                onSearchCountries={setCountriesSearchTerm}
                fromCode={fromCode}
                toCode={toCode}
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

            {/* {trip === "multicity" && (
              <MultiCityForm
                countries={countries as AirportOption[]}
                loadingCountries={nsLoading.countries}
                passengerSchema={passengers as PassengerSchema}
                loadingPassengers={nsLoading.passengers}
                cabinClasses={cabinClasses as CabinClassOption[]}
                loadingCabinClasses={nsLoading.cabinClasses}
                selectedCabinClassId={selectedCabinClassId}
                onChangeCabinClassId={setSelectedCabinClassId}
              />
            )} */}

            {/* Search */}
            <div className="flex justify-center mt-8">
              <button
                className="text-[16px] font-medium text-white"
                style={{
                  width: 137,
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
