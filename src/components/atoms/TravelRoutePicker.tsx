import React from "react";
import DoubledArrow from "../../assets/svgs/doubled-arrow.svg";
import type { AirportOption } from "../../features/flights/types";
import SearchableDropdown from "../common/SearchableDropdown";

type Value = { fromCode: string; toCode: string };

type Props = {
  options: AirportOption[];
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
};

const TravelRoutePicker: React.FC<Props> = ({
  options,
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
}) => {
  const { fromCode, toCode } = value;

  const handleFrom = (code: string) => onChange({ fromCode: code, toCode });
  const handleTo = (code: string) => onChange({ fromCode, toCode: code });

  const swap = () => {
    if (!fromCode && !toCode) return;
    onChange({ fromCode: toCode, toCode: fromCode });
  };

  // Convert CountryOption to DropdownOption format
  const dropdownOptions = options.map((option) => ({
    id: option.id,
    value: option.code,
    label: option.label,
    disabled: false,
  }));

  // Filter options based on disableSameSelection
  const fromOptions = dropdownOptions.map((option) => ({
    ...option,
    disabled: disableSameSelection && option.value === toCode,
  }));

  const toOptions = dropdownOptions.map((option) => ({
    ...option,
    disabled: disableSameSelection && option.value === fromCode,
  }));

  return (
    <>
      <div className={widthClass}>
        <SearchableDropdown
          options={fromOptions}
          value={fromCode}
          onChange={handleFrom}
          onSearchChange={onSearchChange}
          placeholder={placeholders.from}
          label={labels.from}
          loading={!!loading}
          error={fromError}
          widthClass="w-full"
          searchPlaceholder="Search destinations..."
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
          tooltip="Select where you’re flying from"
        />
      </div>

      {showSwap && (
        <button
          type="button"
          onClick={swap}
          className="-mx-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#2351A3] text-white shadow-md border border-white fromToBtn"
        >
          <img src={DoubledArrow} alt="swap-routes" />
        </button>
      )}

      <div className={widthClass}>
        <SearchableDropdown
          options={toOptions}
          value={toCode}
          onChange={handleTo}
          onSearchChange={onSearchChange}
          placeholder={placeholders.to}
          label={labels.to}
          loading={!!loading}
          error={toError}
          widthClass="w-full"
          searchPlaceholder="Search destinations..."
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
          tooltip="Select where you’re flying to"
        />
      </div>
    </>
  );
};

export default TravelRoutePicker;
