import React, { useMemo, useState, useEffect } from "react";
import { useCountriesOptions } from "../../../hooks/masterListings/listing";
import {
  destinationOptionsToDropdown,
  useActivityDestinations,
} from "../../../hooks/sightseeing/useActivityDestinations";
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
  /** City / destination label for display */
  city: string;
  /** Hotel Beds activities destination code (getAvailability filter). */
  destinationCode: string;
  category: SightseeingActivityCategory | string;
};

type Props = {
  initial: SightseeingToolbarValues;
  onSearch: (values: SightseeingToolbarValues) => void;
};

const labelClass = "mb-1 block text-[12px] font-normal text-[#3D495C]";

const SightseeingListingToolbar: React.FC<Props> = ({ initial, onSearch }) => {
  const [country, setCountry] = useState(initial.country);
  const [cityDisplay, setCityDisplay] = useState(initial.city);
  const [destinationCode, setDestinationCode] = useState(
    initial.destinationCode ?? "",
  );
  const [category, setCategory] = useState<string>(initial.category || "all");

  useEffect(() => {
    setCountry(initial.country);
    setCityDisplay(initial.city);
    setDestinationCode(initial.destinationCode ?? "");
    setCategory(initial.category || "all");
  }, [
    initial.country,
    initial.city,
    initial.destinationCode,
    initial.category,
  ]);

  const { data: countriesOptions, isLoading: isCountriesLoading } =
    useCountriesOptions();

  const selectedCountry = useMemo(
    () => countriesOptions?.find((c) => c.label === country),
    [countriesOptions, country],
  );
  const iso2 = selectedCountry?.iso2;

  const {
    data: destinationRows,
    isLoading: isDestinationsLoading,
  } = useActivityDestinations(iso2, !!iso2);

  const destinationDropdownOptions = useMemo(
    () => destinationOptionsToDropdown(destinationRows),
    [destinationRows],
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

  const handleSubmit = () => {
    onSearch({
      country: country.trim(),
      city: (cityDisplay || destinationCode).trim(),
      destinationCode: destinationCode.trim(),
      category: category || "all",
    });
  };

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
              setDestinationCode("");
              setCityDisplay("");
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
          <label className={labelClass}>Select a destination</label>
          <SearchableDropdown
            options={destinationDropdownOptions}
            value={destinationCode}
            onChange={(code) => {
              setDestinationCode(code);
              const opt = destinationDropdownOptions.find((o) => o.value === code);
              setCityDisplay(opt?.label ?? code);
            }}
            placeholder="Select a destination"
            label={undefined}
            widthClass="w-full"
            searchPlaceholder="Search destination"
            loading={isDestinationsLoading}
            disabled={!iso2}
            displayLabel={cityDisplay || null}
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
