import React from "react";
import { Link } from "react-router-dom";
import HeroTabUnderline from "../atoms/HeroTabUnderline";
import TripTypePillTabStrip from "./TripTypePillTabStrip";
import type { FlightTypeOption, TripType } from "../../features/flights/types";

export type TravelSearchPageHeaderProps = {
  activeScope: "flights" | "hotels";
  showTripSelector?: boolean;
  trip?: TripType;
  onTripChange?: (next: TripType) => void;
  flightTypeTabs?: FlightTypeOption[];
  tripTypesLoading?: boolean;
};

const TravelSearchPageHeader: React.FC<TravelSearchPageHeaderProps> = ({
  activeScope,
  showTripSelector = true,
  trip = "oneway",
  onTripChange,
  flightTypeTabs = [],
  tripTypesLoading = false,
}) => {
  return (
    <div className="w-full min-w-0 bg-white">
      <div className="mx-auto grid w-full max-w-[1360px] grid-cols-1 items-center gap-3 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-4 sm:px-5 sm:py-3">
        <div className="min-w-0 justify-self-start sm:max-w-full">
          {showTripSelector && onTripChange ? (
            <TripTypePillTabStrip
              tabs={flightTypeTabs}
              trip={trip}
              onTripChange={onTripChange}
              loading={tripTypesLoading}
            />
          ) : (
            <div className="hidden min-h-0 min-w-0 sm:block" aria-hidden />
          )}
        </div>

        <div className="flex items-end justify-center gap-8 sm:gap-14">
          <Link
            to="/search_flight"
            className={`relative flex w-max flex-col items-center justify-end pb-3 pt-1 text-center font-sans text-[16px] font-medium leading-none tracking-normal transition-colors ${
              activeScope === "flights"
                ? "text-[#2351A3]"
                : "text-[#3D495C] hover:text-[#2351A3]"
            }`}
          >
            <span className="inline-block whitespace-nowrap">Flights</span>
            {activeScope === "flights" ? <HeroTabUnderline /> : null}
          </Link>
          <Link
            to="/search-hotel"
            className={`relative flex w-max flex-col items-center justify-end pb-3 pt-1 text-center font-sans text-[16px] font-medium leading-none tracking-normal transition-colors ${
              activeScope === "hotels"
                ? "text-[#2351A3]"
                : "text-[#3D495C] hover:text-[#2351A3]"
            }`}
          >
            <span className="inline-block whitespace-nowrap">Hotels</span>
            {activeScope === "hotels" ? <HeroTabUnderline /> : null}
          </Link>
        </div>

        <div className="flex justify-end text-right max-sm:justify-center">
          <Link
            to="/customer-support"
            className="text-[15px] font-medium text-[#2351A3] transition-colors hover:text-[#1a3d7a]"
          >
            Get help
          </Link>
        </div>
      </div>
      <div className="border-b border-[#E8EDF5]" />
    </div>
  );
};

export default TravelSearchPageHeader;
