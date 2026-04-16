import React, { useMemo } from "react";
import DoubledArrow from "../../assets/svgs/doubled-arrow.svg";
import type { AirportOption } from "../../features/flights/types";
import SearchableDropdown from "../common/SearchableDropdown";

const airportSearchText = (o: AirportOption) => {
  return [
    o.city,
    o.country,
    o.code,
    o.airportName,
    o.label,
  ]
    .filter(Boolean)
    .join(" ");
};

type Value = {
  fromCode: string;
  toCode: string;
  fromOption?: AirportOption | null;
  toOption?: AirportOption | null;
};

type Props = {
  options?: AirportOption[];
  loading?: boolean;
  /**
   * Optional callback to perform API-based searching.
   * When provided, local filtering inside the dropdown is disabled
   * and this callback will be invoked with the current search term.
   */
  onSearchChange?: (term: string) => void;
  value: Value;
  onChange: (v: Value) => void;
  showSwap?: boolean;
  labels?: { from?: string; to?: string };
  placeholders?: { from?: string; to?: string };
  disableSameSelection?: boolean;
  widthClass?: string;
  fromError?: string | null;
  toError?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  fromOptions?: AirportOption[];
  toOptions?: AirportOption[];
  fromLoading?: boolean;
  toLoading?: boolean;
  onFromSearchChange?: (term: string) => void;
  onToSearchChange?: (term: string) => void;
  fromOnLoadMore?: () => void;
  toOnLoadMore?: () => void;
  fromHasMore?: boolean;
  toHasMore?: boolean;
  fromLoadingMore?: boolean;
  toLoadingMore?: boolean;
};

const TravelRoutePicker: React.FC<Props> = ({
  options = [],
  loading,
  onSearchChange,
  value,
  onChange,
  showSwap = true,
  labels = { from: "From", to: "To" },
  placeholders = { from: "Please select", to: "Please select" },
  disableSameSelection = true,
  widthClass = "w-[190px]",
  fromError,
  toError,
  onLoadMore = () => { },
  hasMore = false,
  loadingMore = false,
  fromOptions,
  toOptions,
  fromLoading,
  toLoading,
  onFromSearchChange,
  onToSearchChange,
  fromOnLoadMore,
  toOnLoadMore,
  fromHasMore,
  toHasMore,
  fromLoadingMore,
  toLoadingMore,
}) => {
  const { fromCode, toCode, fromOption, toOption } = value;

  // When opt is provided (from onOptionSelect), pass it so parent can update label.
  // When only code is provided (e.g. from SearchableDropdown's onChange after onOptionSelect),
  // pass undefined for option so parent does not overwrite with stale option.
  const handleFrom = (code: string, opt?: AirportOption) =>
    onChange({
      fromCode: code,
      toCode,
      fromOption: opt !== undefined ? opt : undefined,
      toOption: toOption ?? undefined,
    });
  const handleTo = (code: string, opt?: AirportOption) =>
    onChange({
      fromCode,
      toCode: code,
      fromOption: fromOption ?? undefined,
      toOption: opt !== undefined ? opt : undefined,
    });

  const swap = () => {
    if (!fromCode && !toCode) return;
    onChange({
      fromCode: toCode,
      toCode: fromCode,
      fromOption: toOption ?? null,
      toOption: fromOption ?? null,
    });
  };

  const buildDropdownOptions = useMemo(
    () => (airportOptions: AirportOption[]) =>
      airportOptions.map((option) => ({
        id: option.id,
        value: option.code,
        label: option.label,
        subLabel: option.airportName ?? "",
        searchText: airportSearchText(option),
        disabled: false,
      })),
    [],
  );

  const sourceFromOptions = fromOptions ?? options;
  const sourceToOptions = toOptions ?? options;

  const fromDropdownOptions = useMemo(
    () =>
      buildDropdownOptions(sourceFromOptions),
    [buildDropdownOptions, sourceFromOptions],
  );

  const toDropdownOptions = useMemo(
    () =>
      buildDropdownOptions(sourceToOptions),
    [buildDropdownOptions, sourceToOptions],
  );

  const fromOptionsByCode = useMemo(
    () => new Map(sourceFromOptions.map((o) => [o.code, o])),
    [sourceFromOptions],
  );
  const toOptionsByCode = useMemo(
    () => new Map(sourceToOptions.map((o) => [o.code, o])),
    [sourceToOptions],
  );

  // Filter options based on disableSameSelection
  const fromDropdownSelectableOptions = useMemo(
    () =>
      fromDropdownOptions.map((option) => ({
        ...option,
        disabled: disableSameSelection && option.value === toCode,
      })),
    [fromDropdownOptions, disableSameSelection, toCode],
  );

  const toDropdownSelectableOptions = useMemo(
    () =>
      toDropdownOptions.map((option) => ({
        ...option,
        disabled: disableSameSelection && option.value === fromCode,
      })),
    [toDropdownOptions, disableSameSelection, fromCode],
  );

  return (
    <>
      <div className={widthClass}>
        <SearchableDropdown
          options={fromDropdownSelectableOptions}
          value={fromCode}
          onChange={(code) => handleFrom(code)}
          onOptionSelect={(code, opt) => {
            const full = fromOptionsByCode.get(code) ?? {
              id: opt.id,
              code: opt.value,
              label: opt.label,
              city: "",
              country: "",
              airportName: (opt as any)?.subLabel || "",
            };
            handleFrom(code, full);
          }}
          displayLabel={fromOption?.label ?? undefined}
          onSearchChange={onFromSearchChange ?? onSearchChange}
          placeholder={placeholders.from}
          label={labels.from}
          loading={fromLoading ?? loading ?? false}
          error={fromError}
          widthClass="w-full"
          searchPlaceholder="Search destinations..."
          onLoadMore={fromOnLoadMore ?? onLoadMore}
          hasMore={fromHasMore ?? hasMore}
          loadingMore={fromLoadingMore ?? loadingMore}
          tooltip="Select where you're flying from"
          cacheKey="airport"
          panelClassName="airport-dropdown-panel"
          renderOption={(o) => (
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
          )}
        />
      </div>

      {showSwap && (
        <button
          type="button"
          onClick={swap}
          className="mx-2 flex items-center justify-center rounded-full bg-[#2351A3] text-white shadow-md border border-white fromToBtn"
          style={{ width: 47, height: 47, minWidth: 47, minHeight: 47, marginTop: 23, marginLeft: 0 }}
        >
          <img src={DoubledArrow} alt="swap-routes" />
        </button>
      )}

      <div className={widthClass}>
        <SearchableDropdown
          options={toDropdownSelectableOptions}
          value={toCode}
          onChange={(code) => handleTo(code)}
          onOptionSelect={(code, opt) => {
            const full = toOptionsByCode.get(code) ?? {
              id: opt.id,
              code: opt.value,
              label: opt.label,
              city: "",
              country: "",
              airportName: (opt as any)?.subLabel || "",
            };
            handleTo(code, full);
          }}
          displayLabel={toOption?.label ?? undefined}
          onSearchChange={onToSearchChange ?? onSearchChange}
          placeholder={placeholders.to}
          label={labels.to}
          loading={toLoading ?? loading ?? false}
          error={toError}
          widthClass="w-full"
          searchPlaceholder="Search destinations..."
          onLoadMore={toOnLoadMore ?? onLoadMore}
          hasMore={toHasMore ?? hasMore}
          loadingMore={toLoadingMore ?? loadingMore}
          tooltip="Select where you're flying to"
          cacheKey="airport"
          panelClassName="airport-dropdown-panel"
          renderOption={(o) => (
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
          )}
        />
      </div>
    </>
  );
};

export default TravelRoutePicker;
