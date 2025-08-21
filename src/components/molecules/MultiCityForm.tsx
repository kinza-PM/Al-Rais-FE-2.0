import React, { useState } from "react";
import Calendar from "../../assets/svgs/calendar.svg";
import PassengerCounterDropdown from "../atoms/PassengerCounterDropdown";
import type { CabinClassOption, CountryOption, PassengerSchema } from "../../features/flights/types";
import TravelRoutePicker from "../atoms/TravelRoutePicker";

type Leg = { fromCode: string; toCode: string; date?: string };

type Props = {
    countries: CountryOption[];
    loadingCountries?: boolean;
    passengerSchema?: PassengerSchema;
    loadingPassengers?: boolean;
    cabinClasses: CabinClassOption[];
    loadingCabinClasses?: boolean;
    selectedCabinClassId: string;                 // empty string means none selected
    onChangeCabinClassId: (id: string) => void;
};

const MultiCityForm: React.FC<Props> = ({
    countries,
    loadingCountries,
    passengerSchema,
    loadingPassengers,
    cabinClasses,
    loadingCabinClasses,
    selectedCabinClassId,
    onChangeCabinClassId,
}) => {
    const [legs, setLegs] = useState<Leg[]>([
        { fromCode: "", toCode: "", date: "" },
        { fromCode: "", toCode: "", date: "" },
    ]);

    const updateLeg = (i: number, next: Partial<Leg>) =>
        setLegs(prev => prev.map((l, idx) => (idx === i ? { ...l, ...next } : l)));

    return (
        <div className="px-6 pb-6 pt-3">
            {/* ROW 1 — Passengers & Cabin class */}
            <div className="flex gap-3 mb-5 justify-center">
                {/* Passengers (faux select) */}
                <div className="w-[250px]">
                    <label className="block text-[12px] text-[#3D495C] mb-1">Passengers</label>
                    <PassengerCounterDropdown maxTotal={9} onChange={(p) => console.log(p)} schema={passengerSchema} />
                    {/* <div className="relative">
                        <select
                            defaultValue="1"
                            className="appearance-none h-11 w-full rounded-xl border border-[#DFE7F3] px-4 pr-8 text-[14px] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2351A3]/20"
                        >
                            {Array.from({ length: 9 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {String(i + 1).padStart(2, '0')} Adult(s)
                                </option>
                            ))}
                        </select>
                        <svg className="pointer-events-none absolute right-3 top-1/3" width="16" height="16" viewBox="0 0 20 20" fill="none">
                            <path d="M5 7.5l5 5 5-5" stroke="#2351A3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div> */}
                </div>


                {/* Cabin class (faux select) */}
                <div className="w-[250px]">
                    <label className="block text-[12px] text-[#3D495C] mb-1">
                        Cabin class
                    </label>
                    <div className="relative">
                        <select
                            value={selectedCabinClassId}          // "" by default
                            onChange={(e) => onChangeCabinClassId(e.target.value)}
                            className="appearance-none h-11 w-full rounded-xl border border-[#DFE7F3] px-4 pr-8 text-[14px] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2351A3]/20"
                        >
                            <option value="">{loadingCabinClasses ? "Loading…" : "Please select"}</option>
                            {cabinClasses.map((c) => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                        <svg className="pointer-events-none absolute right-3 top-1/3 " width="16" height="16" viewBox="0 0 20 20" fill="none">
                            <path d="M5 7.5l5 5 5-5" stroke="#2351A3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* ROW 2 — Flight 01 */}
            <div className="space-y-2 mb-8">
                <p className="text-[14px] text-[#11253E] font-medium">Flight 01</p>
                <div className="grid items-end gap-3 md:gap-4 md:grid-cols-[290px_30px_minmax(290px,1fr)_290px]">
                    {/* From */}
                    <TravelRoutePicker
                        options={countries}
                        loading={loadingCountries}
                        value={{ fromCode: legs[0].fromCode, toCode: legs[0].toCode }}
                        onChange={({ fromCode, toCode }) => updateLeg(0, { fromCode, toCode })}
                        showSwap
                        labels={{ from: "From", to: "To" }}
                        placeholders={{ from: "Please select", to: "Please select" }}
                        disableSameSelection
                        widthClass="w-[290px]"
                    />

                    {/* Departure date (faux) */}
                    <div>
                        <label className="block text-[12px] text-[#3D495C] mb-1">Departure date</label>
                        <div className="relative">
                            <input
                                readOnly
                                defaultValue="Monday, 16 June 2025"
                                className="h-11 w-full rounded-xl border border-[#DFE7F3] pl-4 pr-10 text-[14px] text-[#0F172A] outline-none"
                            />
                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <img src={Calendar} alt="calendar" className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 3 — Flight 02 */}
            <div className="space-y-2 mb-5">
                <p className="text-[14px] text-[#11253E] font-medium">Flight 02</p>
                <div className="grid items-end gap-3 md:gap-4 md:grid-cols-[290px_30px_minmax(290px,1fr)_290px]">
                    {/* From */}
                    <TravelRoutePicker
                        options={countries}
                        loading={loadingCountries}
                        value={{ fromCode: legs[1].fromCode, toCode: legs[1].toCode }}
                        onChange={({ fromCode, toCode }) => updateLeg(1, { fromCode, toCode })}
                        showSwap
                        labels={{ from: "From", to: "To" }}
                        placeholders={{ from: "Please select", to: "Please select" }}
                        disableSameSelection
                        widthClass="w-[290px]"
                    />

                    {/* Departure date (faux) */}
                    <div>
                        <label className="block text-[12px] text-[#3D495C] mb-1">Departure date</label>
                        <div className="relative">
                            <input
                                readOnly
                                defaultValue="Monday, 16 June 2025"
                                className="h-11 w-full rounded-xl border border-[#DFE7F3] pl-4 pr-10 text-[14px] text-[#0F172A] outline-none"
                            />
                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <img src={Calendar} alt="calendar" className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiCityForm;
