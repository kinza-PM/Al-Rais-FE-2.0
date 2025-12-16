import React, { useCallback, useEffect, useMemo, useState } from "react";
import OneWayForm from "./OneWayForm";
import RoundTripForm from "./RoundTripForm";
import MultiCityForm from "./MultiCityForm";
import type {
  TripType,
  FlightTypeOption,
  CountryOption,
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
  const [selectedCabinClassId, setSelectedCabinClassId] = useState<string>("");
  const [paxCounts, setPaxCounts] = useState<Record<string, number>>({});
  const [paxOrder, setPaxOrder] = useState<string[]>([]);
  const [departDate, setDepartDate] = useState<Date | null>(new Date());
  const [arrivalDate, setArrivalDate] = useState<Date | null>(new Date());

  const [validationErrors, setValidationErrors] = useState({
    departDate: "",
    arrivalDate: "",
    passengers: "",
    cabinClass: "",
  });

  const handlePassengers = useCallback(
    (next: Record<string, number>, order: string[]) => {
      setPaxCounts(next);
      setPaxOrder(order);
    },
    []
  );

  const handleDepartDate = useCallback(
    (d: Date | null) => setDepartDate(d),
    []
  );
  const handleArrivalDate = useCallback(
    (d: Date | null) => setArrivalDate(d),
    []
  );

  const {
    flightTypes,
    countries,
    passengers,
    cabinClasses,
    loading,
    errorMap,
  } = useMasterListings();

  const navigate = useNavigate();
  const { setFlight } = useFlightStore();

  const tabs = useMemo<FlightTypeOption[]>(() => flightTypes, [flightTypes]);

  const nsLoading = useMemo(
    () => ({
      flightTypes: loading,
      countries: loading,
      passengers: loading,
      cabinClasses: loading,
    }),
    [loading]
  );

  useEffect(() => {
    if (!fromCode && countries[0]) setFromCode(countries[0].code);
    if (!toCode && countries[1]) setToCode(countries[1].code);
  }, [countries, fromCode, toCode]);

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
    setSelectedCabinClassId("");
    setDepartDate(null);
    setArrivalDate(null);
  }, [trip]);

  const validateForm = (): boolean => {
    const errors = {
      departDate: "",
      arrivalDate: "",
      passengers: "",
      cabinClass: "",
    };
    let isValid = true;
    if (!departDate) {
      errors.departDate = "Departure date is required";
      isValid = false;
    }
    if (trip === "roundtrip" && !arrivalDate) {
      errors.arrivalDate = "Arrival date is required";
      isValid = false;
    }
    const totalPassengers = Object.values(paxCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    if (totalPassengers === 0) {
      errors.passengers = "Passenger is required";
      isValid = false;
    }
    if (!selectedCabinClassId) {
      errors.cabinClass = "Cabin class is required";
      isValid = false;
    }
    setValidationErrors(errors);
    return isValid;
  };

  const handleSearch = () => {
    if (!validateForm()) {
      return;
    }
    const departureStr = formatDateToLocalISO(departDate);
    const arrivalStr = formatDateToLocalISO(arrivalDate);

    setFlight({
      fromCode,
      toCode,
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
      <Loader show={loading} />

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
            <div className="flex items-center rounded-xl ring-1 ring-[#D9E2EF] p-1">
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
                    className={`px-6 py-2 text-[14px] rounded-xl transition-colors ${
                      trip === t.key
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
          <div className="px-6 pb-6 pt-6">
            {trip === "oneway" && (
              <OneWayForm
                countries={countries as CountryOption[]}
                loadingCountries={nsLoading.countries}
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
                //ERRORS
                departDateError={validationErrors.departDate}
                passengersError={validationErrors.passengers}
                cabinClassError={validationErrors.cabinClass}
              />
            )}

            {trip === "roundtrip" && (
              <RoundTripForm
                countries={countries as CountryOption[]}
                loadingCountries={nsLoading.countries}
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
                //ERRORS
                departDateError={validationErrors.departDate}
                arrivalDateError={validationErrors.arrivalDate}
                passengersError={validationErrors.passengers}
                cabinClassError={validationErrors.cabinClass}
              />
            )}

            {trip === "multicity" && (
              <MultiCityForm
                countries={countries as CountryOption[]}
                loadingCountries={nsLoading.countries}
                passengerSchema={passengers as PassengerSchema}
                loadingPassengers={nsLoading.passengers}
                cabinClasses={cabinClasses as CabinClassOption[]}
                loadingCabinClasses={nsLoading.cabinClasses}
                selectedCabinClassId={selectedCabinClassId}
                onChangeCabinClassId={setSelectedCabinClassId}
              />
            )}

            {/* Search */}
            <div className="flex justify-center mt-8">
              <button
                className="h-10 px-8 rounded-md bg-[#2351A3] text-white text-[14px] font-medium shadow-sm"
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
