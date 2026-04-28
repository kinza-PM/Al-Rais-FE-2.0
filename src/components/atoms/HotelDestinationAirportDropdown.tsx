import { useMemo } from "react";
import SearchableDropdown, {
  type DropdownOption,
} from "../common/SearchableDropdown";
import type { AirportOption } from "../../features/flights/types";

/** Location marker — outline style aligned with common DS / Figma map-pin */
function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="10"
        r="2.75"
        stroke="currentColor"
        strokeWidth="1.75"
        fill="none"
      />
    </svg>
  );
}

type Props = {
  airports: AirportOption[];
  isLoading?: boolean;
  isFetching?: boolean;
  onSearchAirports?: (term: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  valueCountry: string;
  valueCity: string;
  onChange: (next: { country: string; city: string }) => void;
  label?: string;
  placeholder?: string;
  tooltip?: string | null;
  error?: string | null;
  widthClass?: string;
};

const keyFor = (city: string, country: string) => `${city}||${country}`;

export default function HotelDestinationAirportDropdown({
  airports,
  isLoading,
  isFetching,
  onSearchAirports,
  onLoadMore,
  hasMore,
  loadingMore,
  valueCountry,
  valueCity,
  onChange,
  label = "Destination",
  placeholder = "Where are you traveling to?",
  tooltip = "Select destination",
  error = null,
  widthClass = "w-full",
}: Props) {
  const options: DropdownOption[] = useMemo(() => {
    const seen = new Set<string>();
    const list: DropdownOption[] = [];
    for (const a of airports || []) {
      const value = keyFor(a.city, a.country);
      if (seen.has(value)) continue;
      seen.add(value);
      list.push({
        id: a.id,
        value,
        label: (a.city || "").trim(),
        subLabel: (a.country || "").trim(),
        searchText: [a.city, a.country, a.code, a.airportName]
          .filter(Boolean)
          .join(" "),
      });
    }
    return list;
  }, [airports]);

  const selectedValue =
    valueCity?.trim() && valueCountry?.trim()
      ? keyFor(valueCity.trim(), valueCountry.trim())
      : "";

  const resolvedDisplayLabel =
    valueCity?.trim() && valueCountry?.trim()
      ? `${valueCity.trim()}, ${valueCountry.trim()}`
      : null;

  return (
    <SearchableDropdown
      options={options}
      value={selectedValue}
      displayLabel={resolvedDisplayLabel}
      onChange={(v) => {
        const found = options.find((o) => o.value === v);
        if (!found) return;
        const [city, country] = String(found.value).split("||");
        onChange({ city: city || "", country: country || "" });
      }}
      onSearchChange={onSearchAirports}
      onLoadMore={onLoadMore}
      hasMore={!!hasMore}
      loadingMore={!!loadingMore}
      loading={!!(isLoading || isFetching)}
      placeholder={placeholder}
      label={label}
      widthClass={widthClass}
      searchPlaceholder="Search"
      tooltip={tooltip}
      error={error}
      cacheKey="hotel-destination-airports"
      panelClassName="hotel-destination-dropdown-panel"
      renderOption={(o) => (
        <div className="hotel-destination-option-row flex w-full min-w-0 items-start gap-2.5">
          <span className="mt-0.5 flex shrink-0 text-[#64748B]" aria-hidden>
            <MapPinIcon />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-bold leading-tight text-[#0F172A]">
              {o.label}
            </div>
            {o.subLabel ? (
              <div className="mt-0.5 truncate text-[13px] font-normal leading-tight text-[#475569]">
                {o.subLabel}
              </div>
            ) : null}
          </div>
        </div>
      )}
    />
  );
}

