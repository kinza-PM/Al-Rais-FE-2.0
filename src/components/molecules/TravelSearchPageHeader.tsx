import React from "react";
import { Link } from "react-router-dom";
import TripTypePillTabStrip from "./TripTypePillTabStrip";
import type { FlightTypeOption, TripType } from "../../features/flights/types";

export type TravelSearchPageHeaderProps = {
  showTripSelector?: boolean;
  trip?: TripType;
  onTripChange?: (next: TripType) => void;
  flightTypeTabs?: FlightTypeOption[];
  tripTypesLoading?: boolean;
};

const TravelSearchPageHeader: React.FC<TravelSearchPageHeaderProps> = ({
  showTripSelector = true,
  trip = "oneway",
  onTripChange,
  flightTypeTabs = [],
  tripTypesLoading = false,
}) => {
  return (
    <div className="w-full min-w-0 bg-white">
      <div className="mx-auto flex w-full max-w-[1360px] flex-wrap items-center justify-between gap-3 px-3 py-2.5 sm:gap-4 sm:px-5 sm:py-3">
        <div className="min-w-0 flex flex-1 justify-start">
          {showTripSelector && onTripChange ? (
            <TripTypePillTabStrip
              tabs={flightTypeTabs}
              trip={trip}
              onTripChange={onTripChange}
              loading={tripTypesLoading}
            />
          ) : (
            <div className="min-h-0 min-w-0 flex-1" aria-hidden />
          )}
        </div>

        <div className="flex shrink-0 justify-end">
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
