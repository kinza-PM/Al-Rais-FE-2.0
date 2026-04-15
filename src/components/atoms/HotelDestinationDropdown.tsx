import React, { useMemo, useState } from "react";
import SearchableDropdown, {
  type DropdownOption,
} from "../common/SearchableDropdown";
import type { CityOption, CountryOption } from "../../features/flights/types";

type Mode = "country" | "city";

type Props = {
  countries: CountryOption[];
  cities: CityOption[];
  countryValue: string;
  cityValue: string;
  onChangeCountry: (country: string) => void;
  onChangeCity: (city: string) => void;
  label?: string;
  placeholder?: string;
  error?: string | null;
  tooltip?: string | null;
  widthClass?: string;
};

const BACK_VALUE = "__back__";

export default function HotelDestinationDropdown({
  countries,
  cities,
  countryValue,
  cityValue,
  onChangeCountry,
  onChangeCity,
  label = "Destination",
  placeholder = "Where are you traveling to?",
  error = null,
  tooltip = null,
  widthClass = "w-full",
}: Props) {
  const [mode, setMode] = useState<Mode>(countryValue ? "city" : "country");

  const selectedText = useMemo(() => {
    if (cityValue?.trim() && countryValue?.trim()) {
      return `${cityValue}, ${countryValue}`;
    }
    if (countryValue?.trim()) return countryValue;
    return "";
  }, [cityValue, countryValue]);

  const options: DropdownOption[] = useMemo(() => {
    if (mode === "country") {
      return (countries || []).map((c) => ({
        id: c.iso2,
        value: c.label,
        label: c.label,
        searchText: c.label,
      }));
    }

    const back: DropdownOption = {
      id: BACK_VALUE,
      value: BACK_VALUE,
      label: "Back to countries",
      searchText: "back countries",
    };

    const cityOpts = (cities || []).map((c, idx) => ({
      id: `${idx}-${c.value}`,
      value: c.value,
      label: `${c.label}, ${countryValue}`,
      subLabel: countryValue,
      searchText: `${c.label} ${countryValue}`,
    }));

    return [back, ...cityOpts];
  }, [mode, countries, cities, countryValue]);

  const value = mode === "country" ? countryValue : cityValue || "";

  return (
    <SearchableDropdown
      options={options}
      value={value}
      onChange={(v) => {
        if (mode === "country") {
          onChangeCountry(v);
          onChangeCity("");
          setMode("city");
          return;
        }

        if (v === BACK_VALUE) {
          setMode("country");
          onChangeCity("");
          return;
        }

        onChangeCity(v);
      }}
      placeholder={placeholder}
      label={label}
      widthClass={widthClass}
      searchPlaceholder="Search"
      tooltip={tooltip}
      error={error}
      cacheKey="hotel-destination"
      panelClassName="hotel-destination-dropdown-panel"
      renderSelectedContent={({ displayValue, placeholder: ph }) => (
        <span
          className={`block min-w-0 flex-1 truncate whitespace-nowrap text-left ${
            !selectedText ? "text-[#98A4B3]" : ""
          }`}
          title={selectedText || undefined}
        >
          {selectedText || ph || displayValue}
        </span>
      )}
      renderOption={(o) => {
        if (mode === "city" && o.value === BACK_VALUE) {
          return (
            <div className="text-[13px] font-medium text-[#2351A3]">
              ← Back to countries
            </div>
          );
        }

        if (mode === "country") {
          return (
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold text-[#0F172A]">
                {o.label}
              </div>
            </div>
          );
        }

        // City mode rows: City, Country + country subtitle (simple 2 lines)
        return (
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold text-[#0F172A]">
              {o.label}
            </div>
            {o.subLabel ? (
              <div className="truncate text-[12px] font-normal text-[#64748B]">
                {o.subLabel}
              </div>
            ) : null}
          </div>
        );
      }}
    />
  );
}

