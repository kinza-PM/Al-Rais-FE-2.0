import React, { useState, useRef, useEffect, useMemo } from "react";
import CustomDropdownError from "./CustomDropdownError";
// import arrownDownwardIcon from "../../assets/svgs/arrow-downwards.svg";

export interface DropdownOption {
  id: string;
  value: string;
  label: string;
  disabled?: boolean;
}

/** Global label cache: persists selected labels across mounts/navigations when options list changes. */
const globalLabelCache = new Map<string, string>();

interface SearchableDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  /**
   * Optional callback for remote/API-based searching.
   * When provided, local filtering is disabled and this callback
   * is invoked with the latest search term (debounced).
   * The parent component is then responsible for updating `options`
   * from the API response.
   */
  onSearchChange?: (term: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string | null;
  className?: string;
  widthClass?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  tooltip?: string | null;
  /**
   * Optional label to display when value is set.
   * When provided, overrides derived label from options/cache.
   * Use this to guarantee full label display when options list changes.
   */
  displayLabel?: string | null;
  /** Called with full option when user selects; use to persist label for display. */
  onOptionSelect?: (value: string, option: DropdownOption) => void;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options = [],
  value,
  onChange,
  onSearchChange,
  placeholder = "Please select",
  label,
  disabled = false,
  error = null,
  className = "",
  widthClass = "w-full",
  searchPlaceholder = "Search...",
  noResultsText = "No results found",
  loading = false,
  onLoadMore = () => {},
  hasMore = false,
  loadingMore = false,
  tooltip = null,
  displayLabel = null,
  onOptionSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showError, setShowError] = useState(false);
  const [searchPending, setSearchPending] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBaseRef = useRef<DropdownOption[]>([]);
  const optionCacheRef = useRef<Map<string, DropdownOption>>(new Map());

  const remoteSearch = !!onSearchChange;

  const hasGoodLabel = (o: DropdownOption) =>
    o.label && o.label.trim().length > (o.value?.length ?? 0);

  // Cache options by value so selected label doesn't disappear
  // when remote search results don't contain the selected option.
  // Also persist to global cache for cross-mount/navigation display.
  useEffect(() => {
    for (const opt of options) {
      const existing = optionCacheRef.current.get(opt.value);
      if (!existing || !hasGoodLabel(existing) || hasGoodLabel(opt)) {
        optionCacheRef.current.set(opt.value, opt);
        if (hasGoodLabel(opt)) {
          globalLabelCache.set(opt.value, opt.label);
        }
      }
    }
  }, [options]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    // In remote/API search mode, we trust the caller to provide
    // already-filtered options, so we skip local filtering.
    if (remoteSearch) {
      return options;
    }

    const baseOptions = searchTerm.trim() ? searchBaseRef.current : options;

    if (!searchTerm.trim()) return baseOptions;

    return baseOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [options, searchTerm, remoteSearch]);

  // Get selected option label (displayLabel > global cache > option/cache > code)
  const selectedOption =
    options.find((option) => option.value === value) ??
    optionCacheRef.current.get(value);
  const displayValue =
    (value && displayLabel) ||
    (value && globalLabelCache.get(value)) ||
    selectedOption?.label ||
    (value ? value : placeholder);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setShowError(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
        setShowError(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Check if error is a validation error (should not show popup)
  const isValidationError = useMemo(() => {
    if (!error) return false;
    const validationKeywords = [
      "Please select",
      "is required",
      "required",
      "Please complete",
      "flying",
    ];
    return validationKeywords.some((keyword) =>
      error.toLowerCase().includes(keyword.toLowerCase()),
    );
  }, [error]);

  const handleToggle = () => {
    // In remote search mode we should not disable the dropdown while loading,
    // otherwise it feels "jerky" while typing/searching.
    if (disabled) return;
    if (!remoteSearch && loading) return;

    // Only show popup for API errors, not validation errors
    if (error && !isValidationError) {
      setShowError(!showError);
      return;
    }

    setIsOpen(!isOpen);
    setSearchTerm("");
  };

  const handleOptionSelect = (optionValue: string) => {
    const selectedOpt =
      filteredOptions.find((o) => o.value === optionValue) ??
      options.find((o) => o.value === optionValue);
    if (selectedOpt) {
      optionCacheRef.current.set(optionValue, selectedOpt);
      if (hasGoodLabel(selectedOpt)) {
        globalLabelCache.set(optionValue, selectedOpt.label);
      }
      onOptionSelect?.(optionValue, selectedOpt);
    }
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || loading) return;

    if (
      error &&
      (e.key === " " ||
        e.key === "Enter" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowUp")
    ) {
      e.preventDefault();
      setShowError(!showError);
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
      setShowError(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (!onLoadMore || !hasMore || loadingMore) return;

    if (el.scrollHeight - el.scrollTop - el.clientHeight < 60) {
      onLoadMore();
    }
  };

  useEffect(() => {
    if (remoteSearch) return;

    if (searchTerm.trim()) {
      searchBaseRef.current = options;
    }
  }, [searchTerm, options, remoteSearch]);

  useEffect(() => {
    if (!isOpen) {
      searchBaseRef.current = [];
      setSearchTerm("");
    }
  }, [isOpen]);

  // Notify parent of search term changes for remote/API search.
  useEffect(() => {
    if (!remoteSearch || !onSearchChange) return;

    // Avoid showing "No results" immediately while user is typing.
    if (searchTerm.trim()) {
      setSearchPending(true);
    } else {
      setSearchPending(false);
    }

    const handle = setTimeout(() => {
      onSearchChange(searchTerm);
      setSearchPending(false);
    }, 300);

    return () => clearTimeout(handle);
  }, [searchTerm, remoteSearch, onSearchChange]);

  const baseClasses = `
    appearance-none h-11 w-full rounded-xl border pl-4 pr-8 text-[14px] text-[#0F172A] 
    outline-none 
    ${disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"}
    ${error && isValidationError ? "border-red-500" : "border-[#DFE7F3]"}
  `;

  return (
    <div className={`relative ${widthClass}`} ref={dropdownRef}>
      {label && (
        <label className="block text-[12px] text-[#0A0C0F] mb-1">{label}</label>
      )}

      <div className="group relative">
        <button
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`${
            className ? className : baseClasses
          } flex items-center justify-between`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={!!error}
          aria-describedby={error && showError ? "dropdown-error" : undefined}
        >
          <span>
            {/* <span className={`${!selectedOption ? "text-[#98A4B3]" : ""}`}> */}
            {displayValue}
          </span>

          {/* <img
                        src={arrownDownwardIcon}
                        alt="dropdown arrow"
                        className={`pointer-events-none shrink-0 absolute right-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    /> */}
          <svg
            className={`pointer-events-none shrink-0 absolute right-3 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 7.5l5 5 5-5"
              stroke="#2351A3"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {tooltip && (
          <div
            className={`
            pointer-events-none absolute bottom-full left-full -translate-x-1/3 mb-3
            hidden group-hover:block z-50
            px-3 py-2 text-xs leading-5 text-white
            bg-[#1E293B] rounded-lg shadow-lg
            whitespace-nowrap
            transition-all duration-150 opacity-0 group-hover:opacity-100
            before:content-[''] before:absolute before:top-full before:left-1/2
            before:-translate-x-1/2 before:border-6 before:border-transparent
            before:border-t-[#1E293B]
          `}
          >
            <div className="text-center">{value ? displayValue : tooltip}</div>
          </div>
        )}

        {isOpen && (
          <div className="absolute z-[9999] mt-2 w-full rounded-2xl bg-white border border-[#E7EEF7] shadow-[0_8px_22px_rgba(12,40,86,0.08)] overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-[#EDEFF6]">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                name={`search-${Math.random()}`}
                className="w-full px-3 py-2 text-sm border border-[#DFE7F3] rounded-lg focus:outline-none"
              />
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto" onScroll={handleScroll}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={`${option.value}-${option.id}`}
                    type="button"
                    onClick={() => handleOptionSelect(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-full px-4 py-3 text-left text-sm hover:bg-[#F8FAFC] 
                      ${
                        option.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                      ${
                        option.value === value
                          ? "bg-[#2351A3]/10 text-[#2351A3]"
                          : "text-[#0F172A]"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-[#98A4B3] text-center">
                  {loading || searchPending ? "Loading..." : noResultsText}
                </div>
              )}

              {loadingMore && (
                <div className="px-4 py-3 text-center text-sm text-[#98A4B3]">
                  Loading more...
                </div>
              )}
            </div>
          </div>
        )}

        {error && showError && !isValidationError && (
          <CustomDropdownError
            id="dropdown-error"
            title="Nothing found!"
            message={error}
          />
        )}
      </div>
      {/* Show inline error only for validation errors */}
      {error && isValidationError && (
        <p className="absolute top-full left-0 mt-1 text-[12px] text-[#E65959] whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
};

export default SearchableDropdown;
