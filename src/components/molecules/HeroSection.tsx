// HeroSection.tsx
import React, { useEffect, useMemo, useState } from "react";
import OneWayForm from "./OneWayForm";
import RoundTripForm from "./RoundTripForm";
import MultiCityForm from "./MultiCityForm";
import Celebration from "../../assets/svgs/celebration.svg";

import type {
    TripType,
    FlightTypeOption,
    CountryOption,
    PassengerSchema,
    CabinClassOption,
} from "../../features/flights/types";

// ⬇️ NEW: use the hook
import { useMasterListings } from "../../hooks/masterListings/useMasterListings";
import { useFlightStore } from "../../store/UseFlightStore";
import { useNavigate } from "react-router-dom";
import Loader from "../atoms/Loader";

const HeroSection: React.FC = () => {
    const [trip, setTrip] = useState<TripType>("oneway");

    const [fromCode, setFromCode] = useState<string>("");
    const [toCode, setToCode] = useState<string>("");
    const [selectedCabinClassId, setSelectedCabinClassId] = useState<string>("");

    const {
        flightTypes,
        countries,
        passengers, // PassengerSchema
        cabinClasses,
        loading,
        // error,
    } = useMasterListings();

    const navigate = useNavigate();

    const { flight, setFlight } = useFlightStore();
    console.log(flight, "flight");
    // keep your "tabs" memo
    const tabs = useMemo<FlightTypeOption[]>(() => flightTypes, [flightTypes]);

    // If you want to keep the old "namespaced" loading shape for child props:
    const nsLoading = useMemo(
        () => ({
            flightTypes: loading,
            countries: loading,
            passengers: loading,
            cabinClasses: loading,
        }),
        [loading]
    );

    // initialize defaults for from/to once countries arrive (same behavior you had)
    useEffect(() => {
        if (!fromCode && countries[0]) setFromCode(countries[0].code);
        if (!toCode && countries[1]) setToCode(countries[1].code);
    }, [countries, fromCode, toCode]);

    // ensure current trip is valid when flightTypes change
    useEffect(() => {
        if (tabs.length && !tabs.find((t) => t.key === trip)) {
            setTrip(tabs[0].key);
        }
    }, [tabs, trip]);

    return (
        <div>
            <Loader show={loading} />
            <div className="w-full flex justify-center px-4 mt-10">
                <div className="w-full max-w-[1040px] bg-white rounded-xl border border-[#E7EEF7] shadow-[0_8px_28px_rgba(12,40,86,0.08)]">
                    <div className="relative h-[50px] px-6">
                        {/* labels */}
                        <div className="absolute inset-x-0 top-3 flex justify-center gap-10 text-[16px]">
                            <span className="font-medium text-[#2351A3]">Flights</span>
                            <span className="text-[#3D495C] opacity-70">Hotels</span>
                        </div>

                        {/* divider line */}
                        <div className="absolute left-0 right-0 bottom-0 h-px bg-[#E4E4E7]" />

                        {/* active underline (on the divider) */}
                        <span
                            className="absolute bottom-0 h-[4px] w-[55px] rounded-full bg-[#5383DA] underline-blur"
                            style={{ left: "calc(51% - 26px - 55px)" }} // under “Flights”
                        />
                    </div>

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
                        <div className="flex justify-center mt-6">
                            <button
                                className="h-10 px-8 rounded-md bg-[#2351A3] text-white text-[14px] font-medium shadow-sm"
                                onClick={() => {
                                    setFlight({
                                        fromCode: fromCode,
                                        toCode: toCode,
                                        selectedCabinClassId: selectedCabinClassId,
                                    });
                                    navigate("search_flight");
                                }}
                            >
                                Search
                            </button>
                        </div>

                        {/* (optional) a tiny error line, if hook failed */}
                        {/* {error && (
                            <p className="mt-3 text-center text-[12px] text-red-600 opacity-80">
                                {error}
                            </p>
                        )} */}
                    </div>
                </div>
            </div>

            {/* cards */}
            <div className="w-full flex mt-8 px-12">
                <div className="w-full grid md:grid-cols-3 gap-4">
                    {/* Card 1 — Welcome gift */}
                    <div className="relative rounded-2xl border border-[#E7EEF7] bg-white px-4 py-4 min-h-[160px] shadow-[0_1px_2px_rgba(12,40,86,0.05)] flex items-center justify-between gap-4">
                        <span
                            className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-white text-[12px] font-medium
              bg-[linear-gradient(90.59deg,#5383DA_0%,#2351A3_50%,#081326_100%)] shadow-[0_2px_8px_rgba(12,40,86,0.18)]"
                        >
                            <img
                                src={Celebration}
                                alt="celebration"
                                className="w-[16px] h-[16px] shrink-0"
                            />
                            Welcome gift
                        </span>
                        <div className="pt-2">
                            <h3 className="text-[26px] leading-6 text-[rgba(10, 12, 15, 1)]">
                                Get 25% off on your first booking
                            </h3>
                        </div>
                        <button className="shrink-0 h-10 px-5 rounded-lg bg-[rgba(35,81,163,1)] text-white text-[14px] font-medium shadow-sm">
                            Sign in to claim
                        </button>
                    </div>

                    {/* Card 2 — Did you know */}
                    <div
                        className="rounded-2xl px-4 py-4 min-h-[160px] text-white shadow-[0_8px_28px_rgba(12,40,86,0.08)]
            bg-[linear-gradient(90.59deg,#5383DA_0%,#2351A3_50%,#081326_100%)] flex items-center justify-between gap-4"
                    >
                        <div>
                            <p className="text-[12px] opacity-80">Did you know?</p>
                            <p className="mt-2 text-[14px] leading-6 opacity-95">
                                Al-Rais members get better deals and prices on Flights and
                                Hotels.
                            </p>
                        </div>
                        <button className="shrink-0 h-10 px-5 rounded-lg bg-white text-[#153C8E] text-[13px] font-semibold border border-white/70">
                            Create an account
                        </button>
                    </div>

                    {/* Card 3 — Companion */}
                    <div className="rounded-2xl border border-[#E7EEF7] bg-white px-4 py-4 min-h-[160px] shadow-[0_1px_2px_rgba(12,40,86,0.05)] flex items-center justify-between gap-4">
                        <h3 className="text-[26px] leading-6 text-[rgba(10, 12, 15, 1)]">
                            Your all-in-one travel booking companion!
                        </h3>
                        <button className="shrink-0 h-10 px-5 rounded-lg bg-[#2351A3] text-white text-[14px] font-medium shadow-sm">
                            Explore now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
