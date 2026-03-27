import React, { useMemo, useState, useEffect } from "react";
import { useCountriesOptions } from "../../../hooks/masterListings/listing";
import { useCitiesOptions } from "../../../hooks/masterListings/useQueryListing";
import SearchableDropdown from "../../common/SearchableDropdown";
import type { SightseeingActivityCategory } from "../../../features/sightseeing/types";

const ACTIVITY_CATEGORY_OPTIONS = [
  { id: "all", value: "all", label: "All Categories" },
  { id: "tours", value: "tours", label: "Tours" },
  { id: "attractions", value: "attractions", label: "Attractions" },
  { id: "experiences", value: "experiences", label: "Experiences" },
  { id: "transfers", value: "transfers", label: "Transfers" },
  { id: "events", value: "events", label: "Events" },
];

/** Figma: 50px height, 16px radius, 1.5px #C2CAD6, white fill */
const FIELD_BUTTON_CLASS =
  "appearance-none h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-white pl-4 pr-11 text-[14px] text-[#0F172A] outline-none flex items-center cursor-pointer disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-70";

export type SightseeingToolbarValues = {
  country: string;
  city: string;
  category: SightseeingActivityCategory | string;
};

type Props = {
  initial: SightseeingToolbarValues;
  onSearch: (values: SightseeingToolbarValues) => void;
};

const labelClass = "mb-1 block text-[12px] font-normal text-[#3D495C]";

const SightseeingListingToolbar: React.FC<Props> = ({ initial, onSearch }) => {
  const [country, setCountry] = useState(initial.country);
  const [city, setCity] = useState(initial.city);
  const [category, setCategory] = useState<string>(initial.category || "all");

  useEffect(() => {
    setCountry(initial.country);
    setCity(initial.city);
    setCategory(initial.category || "all");
  }, [initial.country, initial.city, initial.category]);

  const { data: countriesOptions, isLoading: isCountriesLoading } =
    useCountriesOptions();

  const selectedCountry = useMemo(
    () => countriesOptions?.find((c) => c.label === country),
    [countriesOptions, country],
  );

  const { data: citiesData, isLoading: isCitiesLoading } = useCitiesOptions(
    selectedCountry?.label || "",
    !!selectedCountry?.label,
  );

  const countryOptions = useMemo(
    () =>
      countriesOptions?.map((c) => ({
        id: c.iso2,
        value: c.label,
        label: c.label,
      })) ?? [],
    [countriesOptions],
  );

  const cityOptions = useMemo(() => {
    const fromApi =
      citiesData?.map((c, index) => ({
        id: `${index}-${c.value}`,
        value: c.label,
        label: c.label,
      })) ?? [];
    const trimmed = city.trim();
    if (trimmed && !fromApi.some((o) => o.value === trimmed)) {
      return [
        { id: "custom-city", value: trimmed, label: trimmed },
        ...fromApi,
      ];
    }
    return fromApi;
  }, [citiesData, city]);

  const handleSubmit = () => {
    onSearch({
      country: country.trim(),
      city: city.trim(),
      category: category || "all",
    });
  };

  /** Toolbar fields: 360×50, single row */
  const fieldWrapStyle: React.CSSProperties = {
    width: 360,
    flexShrink: 0,
  };

  return (
    <div className="sightseeing-listing-toolbar w-full bg-transparent">
      <div className="flex flex-nowrap items-end justify-start gap-4">
          <div className="shrink-0" style={fieldWrapStyle}>
            <label className={labelClass}>Select a Country</label>
            <SearchableDropdown
              options={countryOptions}
              value={country}
              onChange={(v) => {
                setCountry(v);
                setCity("");
              }}
              placeholder="Select a country"
              label={undefined}
              widthClass="w-full"
              searchPlaceholder="Search"
              loading={isCountriesLoading}
              className={FIELD_BUTTON_CLASS}
            />
          </div>

          <div className="shrink-0" style={fieldWrapStyle}>
            <label className={labelClass}>Enter a City</label>
            <SearchableDropdown
              options={cityOptions}
              value={city}
              onChange={setCity}
              placeholder="Enter a city"
              label={undefined}
              widthClass="w-full"
              searchPlaceholder="Search city"
              loading={isCitiesLoading}
              disabled={!selectedCountry?.label}
              className={FIELD_BUTTON_CLASS}
            />
          </div>

          <div className="shrink-0" style={fieldWrapStyle}>
            <label className={labelClass}>Select category of activity</label>
            <SearchableDropdown
              options={ACTIVITY_CATEGORY_OPTIONS}
              value={category}
              onChange={(v) => setCategory(v || "all")}
              placeholder="All Categories"
              label={undefined}
              widthClass="w-full"
              searchPlaceholder="Search"
              className={FIELD_BUTTON_CLASS}
            />
          </div>

          <div className="flex shrink-0 items-end pb-[3px]">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center justify-center text-[15px] font-semibold leading-none text-white transition-opacity hover:opacity-95"
              style={{
                width: 137,
                height: 47,
                maxWidth: "100%",
                padding: "14px 40px",
                gap: 10,
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
  );
};

export default SightseeingListingToolbar;
