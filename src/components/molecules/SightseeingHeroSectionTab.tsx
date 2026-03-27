import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCountriesOptions } from "../../hooks/masterListings/listing";
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
 * Landing hero — Sightseeing (Figma: country, city text, category, centered Search).
 * Mirrors HotelHeroSectionTab patterns (countries hook, SearchableDropdown, tokens).
 */
const SightseeingHeroSectionTab: React.FC = () => {
  const navigate = useNavigate();
  const { data: countriesOptions, isLoading: isCountriesLoading } =
    useCountriesOptions();

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] =
    useState<SightseeingActivityCategory | string>("all");
  const [countryError, setCountryError] = useState<string | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);

  const countryDropdownOptions = useMemo(
    () =>
      countriesOptions?.map((c) => ({
        id: c.iso2,
        value: c.label,
        label: c.label,
      })) ?? [],
    [countriesOptions],
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
    if (!city?.trim()) {
      setCityError("Please enter a city");
      valid = false;
    } else {
      setCityError(null);
    }
    if (!valid) return;

    navigate("/search-sightseeing", {
      state: {
        country: country.trim(),
        city: city.trim(),
        category: category || "all",
      },
    });
  }, [country, city, category, navigate]);

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
            <label className={labelClass} htmlFor="sightseeing-city-input">
              Enter a city
            </label>
            <input
              id="sightseeing-city-input"
              type="text"
              autoComplete="off"
              placeholder="Enter a city"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setCityError(null);
              }}
              className={[
                "h-[50px] w-full min-w-0 rounded-[16px] border bg-white px-4",
                "text-[14px] text-[#0F172A] outline-none placeholder:text-[#98A4B3]",
                cityError ? "border-2 border-[#E65959]" : "border border-[#C2CAD6]",
              ].join(" ")}
              aria-invalid={!!cityError}
            />
            {cityError ? (
              <p className="mt-1.5 text-[12px] text-[#E65959]">{cityError}</p>
            ) : null}
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
