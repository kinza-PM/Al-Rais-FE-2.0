import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCountriesOptions } from "../../hooks/masterListings/listing";
import {
  destinationOptionsToDropdown,
  useActivityDestinations,
} from "../../hooks/sightseeing/useActivityDestinations";
import SearchableDropdown from "../common/SearchableDropdown";
import type { SightseeingActivityCategory } from "../../features/sightseeing/types";

import "../../assets/css/travel.css";

const ACTIVITY_CATEGORY_OPTIONS: {
  id: string;
  value: SightseeingActivityCategory | string;
  label: string;
}[] = [
  { id: "all", value: "all", label: "All Categories" },
  { id: "tours", value: "tours", label: "Tours" },
  { id: "attractions", value: "attractions", label: "Attractions" },
  { id: "experiences", value: "experiences", label: "Experiences" },
  { id: "transfers", value: "transfers", label: "Transfers" },
  { id: "events", value: "events", label: "Events" },
];

/**
 * Landing hero — Sightseeing. Country drives `destinationByOurCountry` (ISO-2);
 * destination dropdown supplies supplier codes for a later `getAvailability` step.
 */
const SightseeingHeroSectionTab: React.FC = () => {
  const navigate = useNavigate();
  const { data: countriesOptions, isLoading: isCountriesLoading } =
    useCountriesOptions();

  const [country, setCountry] = useState("");
  const [destinationCode, setDestinationCode] = useState("");
  const [cityDisplay, setCityDisplay] = useState("");
  const [category, setCategory] =
    useState<SightseeingActivityCategory | string>("all");
  const [countryError, setCountryError] = useState<string | null>(null);
  const [destinationError, setDestinationError] = useState<string | null>(null);

  const selectedCountry = useMemo(
    () => countriesOptions?.find((c) => c.label === country),
    [countriesOptions, country],
  );
  const iso2 = selectedCountry?.iso2;

  const {
    data: destinationRows,
    isLoading: isDestinationsLoading,
    isError: isDestinationsError,
    error: destinationsError,
  } = useActivityDestinations(iso2, !!iso2);

  useEffect(() => {
    if (isDestinationsError && destinationsError) {
      toast.error(
        (destinationsError as Error).message ||
          "Could not load destinations for this country",
      );
    }
  }, [isDestinationsError, destinationsError]);

  const countryDropdownOptions = useMemo(
    () =>
      countriesOptions?.map((c) => ({
        id: c.iso2,
        value: c.label,
        label: c.label,
      })) ?? [],
    [countriesOptions],
  );

  const destinationDropdownOptions = useMemo(
    () => destinationOptionsToDropdown(destinationRows),
    [destinationRows],
  );

  const labelClass =
    "mb-1 block text-[12px] font-normal text-[#3D495C]";

  const handleSearch = useCallback(() => {
    let valid = true;
    if (!country?.trim()) {
      setCountryError("Please select a country");
      valid = false;
    } else {
      setCountryError(null);
    }
    if (!destinationCode?.trim()) {
      setDestinationError("Please select a destination");
      valid = false;
    } else {
      setDestinationError(null);
    }
    if (!valid) return;

    navigate("/search-sightseeing", {
      state: {
        country: country.trim(),
        city: (cityDisplay || destinationCode).trim(),
        destinationCode: destinationCode.trim(),
        category: category || "all",
      },
    });
  }, [country, cityDisplay, destinationCode, category, navigate]);

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-5 pb-6">
      <div className="hotelSearchFilterCard">
        <div className="sightseeing-hero-grid">
          <div className="sightseeing-country w-full min-w-0">
            <label className={labelClass} htmlFor="sightseeing-country">
              Select a country
            </label>
            <SearchableDropdown
              options={countryDropdownOptions}
              value={country}
              onChange={(v) => {
                setCountry(v);
                setCountryError(null);
                setDestinationCode("");
                setCityDisplay("");
                setDestinationError(null);
              }}
              placeholder="Select a country"
              label={undefined}
              widthClass="w-full"
              searchPlaceholder="Search country"
              tooltip="Select a country for sightseeing"
              error={countryError}
              loading={isCountriesLoading}
            />
          </div>

          <div className="sightseeing-city w-full min-w-0">
            <label className={labelClass} htmlFor="sightseeing-destination">
              Select a destination
            </label>
            <SearchableDropdown
              options={destinationDropdownOptions}
              value={destinationCode}
              onChange={(code) => {
                setDestinationCode(code);
                const opt = destinationDropdownOptions.find(
                  (o) => o.value === code,
                );
                setCityDisplay(opt?.label ?? code);
                setDestinationError(null);
              }}
              placeholder="Select a destination"
              label={undefined}
              widthClass="w-full"
              searchPlaceholder="Search destination"
              tooltip="Choose a destination (from Hotel Beds activities)"
              error={destinationError}
              loading={isDestinationsLoading}
              disabled={!iso2}
              displayLabel={cityDisplay || null}
            />
          </div>

          <div className="sightseeing-category w-full min-w-0">
            <label className={labelClass} htmlFor="sightseeing-category">
              Select category of activity
            </label>
            <SearchableDropdown
              options={ACTIVITY_CATEGORY_OPTIONS.map((o) => ({
                id: o.id,
                value: o.value as string,
                label: o.label,
              }))}
              value={category as string}
              onChange={(v) => setCategory((v || "all") as string)}
              placeholder="Select category"
              label={undefined}
              widthClass="w-full"
              searchPlaceholder="Search category"
              tooltip="Filter by type of activity"
            />
          </div>

          <div className="sightseeing-search-row w-full flex justify-center">
            <button
              type="button"
              onClick={handleSearch}
              className="h-[47px] min-w-[180px] px-10 text-[16px] font-semibold text-white shadow-[0_6px_18px_rgba(35,81,163,0.35)] transition-opacity hover:opacity-[0.95]"
              style={{
                borderRadius: 100,
                background:
                  "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
              }}
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SightseeingHeroSectionTab;
