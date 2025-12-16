import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMasterListings } from "../../hooks/masterListings/useMasterListings";
import SearchableDropdown from "../common/SearchableDropdown";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
import PassengerCounterDropdown from "../atoms/PassengerCounterDropdown";
import CheckableDropdown from "../common/CheckableDropdown";
import type { PassengerSchema } from "../../features/flights/types";

const HotelHeroSection: React.FC = () => {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [location, setLocation] = useState<string>("");
    const [checkInDate, setCheckInDate] = useState<Date | null>(null);
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

    const { passengers } = useMasterListings();
    const navigate = useNavigate();

    const starRatingOptions = [
        { id: "1", value: "1", label: "1 star" },
        { id: "2", value: "2", label: "2 stars" },
        { id: "3", value: "3", label: "3 stars" },
        { id: "4", value: "4", label: "4 stars" },
        { id: "5", value: "5", label: "5 stars" },
    ];

    const locationOptions = [
        { id: "1", value: "USA", label: "United States" },
        { id: "2", value: "UK", label: "United Kingdom" },
        { id: "3", value: "UAE", label: "United Arab Emirates" },
        // Add more locations as needed
    ];

    return (
        <div className="px-6 pb-6 pt-6">
            <div className="flex items-end gap-4">
                <div className="w-[250px]">
                    <SearchableDropdown
                        options={locationOptions}
                        value={location}
                        onChange={setLocation}
                        placeholder="Where are you traveling to?"
                        label="Location"
                        widthClass="w-full"
                        searchPlaceholder="Search"
                    />
                </div>

                <div className="w-[320px]">
                    <label className="block text-[12px] text-[#3D495C] mb-1">
                        Dates
                    </label>
                    <div className="h-11 w-full rounded-xl border border-[#DFE7F3] px-1 flex items-center">
                        <TailiwindCustomDatePicker
                            value={checkInDate}
                            onChange={setCheckInDate}
                            placeholder="Check-in date"
                            buttonIconSrc={true}
                            overridesClass={true}
                            showCalendarIconRight={false}
                            inputClass="h-10 w-[150px] rounded-xl border-none outline-none pl-10 text-[14px] text-[#94A3B8] bg-transparent cursor-pointer"
                        />
                        <span className="text-[#94A3B8] select-none">-</span>
                        <TailiwindCustomDatePicker
                            value={checkOutDate}
                            onChange={setCheckOutDate}
                            placeholder="Check-out date"
                            buttonIconSrc={true}
                            overridesClass={true}
                            showCalendarIconRight={false}
                            inputClass="h-10 w-[150px] rounded-xl border-none pl-10 pr-2 outline-none text-[14px] text-[#94A3B8] bg-transparent cursor-pointer"
                        />
                    </div>
                </div>

                <div className="w-[170px]">
                    <label className="block text-[12px] text-[#3D495C] mb-1">
                        Guests & Rooms
                    </label>
                    <PassengerCounterDropdown
                        maxTotal={100}
                        schema={passengers as PassengerSchema}
                    // Add any additional hotel-specific passenger handling
                    />
                </div>

                <div className="w-[200px]">
                    <CheckableDropdown
                        options={starRatingOptions}
                        value={selectedValues}
                        onChange={setSelectedValues}
                        placeholder="Select ratings"
                        label="Star Rating"
                    />
                </div>
            </div>

            <div className="flex justify-center mt-6">
                <button
                    className="h-10 px-8 rounded-md bg-[#2351A3] text-white text-[14px] font-medium shadow-sm"
                    onClick={() => navigate("/search_flight")} 
                >
                    Search
                </button>
            </div>
        </div>
    );
};

export default HotelHeroSection;