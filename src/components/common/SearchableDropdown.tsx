import React, { useState, useRef, useEffect, useMemo } from "react";
import CustomDropdownError from "./CustomDropdownError";
import downArrowPng from "../../assets/images/Down-arrow.png";

export interface DropdownOption {
  id: string;
  value: string;
  label: string;
  disabled?: boolean;
  /** Optional extra searchable content (airport name, city, country, etc.). */
  searchText?: string;
  /** Optional second line shown by custom renderers. */
  subLabel?: string;
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
  required?: boolean;
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
  labelClass?: string;
  /**
   * Optional label to display when value is set.
   * When provided, overrides derived label from options/cache.
   * Use this to guarantee full label display when options list changes.
   */
  displayLabel?: string | null;
  /** Called with full option when user selects; use to persist label for display. */
  onOptionSelect?: (value: string, option: DropdownOption) => void;
  /** Optional namespace for global label cache to prevent cross-field collisions. */
  cacheKey?: string;
  /**
   * When true, the options list is not limited in height and does not scroll inside the panel;
   * the page/body scroll handles long lists instead.
   */
  noInnerOptionsScroll?: boolean;
  /** Custom trigger content (e.g. flag + dial code). Chevron and behavior unchanged. */
  renderSelectedContent?: (args: {
    selectedOption: DropdownOption | undefined;
    displayValue: string;
    placeholder: string;
    value: string;
  }) => React.ReactNode;
  /** Custom row in the options list. Add `sr-only` text if the visual omits searchable words. */
  renderOption?: (option: DropdownOption, isSelected: boolean) => React.ReactNode;
  /** Optional extra classes for the dropdown panel container. */
  panelClassName?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options = [],
  value,
  onChange,
  onSearchChange,
  placeholder = "Please select",
  label,
  required = false,
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
  labelClass = null,
  cacheKey,
  noInnerOptionsScroll = false,
  renderSelectedContent,
  renderOption,
  panelClassName = "",
}) => {
  const OPTIONS_CHUNK_SIZE = 150;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showError, setShowError] = useState(false);
  const [searchPending, setSearchPending] = useState(false);
  const [visibleCount, setVisibleCount] = useState(OPTIONS_CHUNK_SIZE);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBaseRef = useRef<DropdownOption[]>([]);
  const optionCacheRef = useRef<Map<string, DropdownOption>>(new Map());

  const remoteSearch = !!onSearchChange;

  const normalizeForSearch = (s: string) =>
    (s || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

  const hasGoodLabel = (o: DropdownOption) =>
    o.label && o.label.trim().length > (o.value?.length ?? 0);
  const cacheNamespace = cacheKey || label || placeholder || "default";
  const scopedCacheKey = (v: string) => `${cacheNamespace}::${v}`;

  // Cache options by value so selected label doesn't disappear
  // when remote search results don't contain the selected option.
  // Also persist to global cache for cross-mount/navigation display.
  useEffect(() => {
    for (const opt of options) {
      const existing = optionCacheRef.current.get(opt.value);
      if (!existing || !hasGoodLabel(existing) || hasGoodLabel(opt)) {
        optionCacheRef.current.set(opt.value, opt);
        if (hasGoodLabel(opt)) {
          globalLabelCache.set(scopedCacheKey(opt.value), opt.label);
        }
      }
    }
  }, [options, cacheNamespace]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    // In remote search mode, always filter the current `options` list.
    // `searchBaseRef` is only maintained for local filtering mode.
    const baseOptions = remoteSearch
      ? options
      : searchTerm.trim()
        ? searchBaseRef.current
        : options;

    if (!searchTerm.trim()) return baseOptions;

    // Always filter locally for instant feedback, even in remote mode.
    // (Remote results will update options; this still refines them.)
    const q = normalizeForSearch(searchTerm);
    const parts = q.split(" ").filter(Boolean);
    if (!parts.length) return baseOptions;

    return baseOptions.filter((option) => {
      const hay = normalizeForSearch(
        `${option.label || ""} ${option.value || ""} ${option.searchText || ""} ${option.subLabel || ""}`,
      );
      return parts.every((p) => hay.includes(p));
    });
  }, [options, searchTerm, remoteSearch]);

  // Get selected option label (displayLabel > global cache > option/cache > code)
  const selectedOption =
    options.find((option) => option.value === value) ??
    optionCacheRef.current.get(value);
  const displayValue =
    (value && displayLabel) ||
    (value && globalLabelCache.get(scopedCacheKey(value))) ||
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
      "cannot be blank",
      "blank",
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
        globalLabelCache.set(scopedCacheKey(optionValue), selectedOpt.label);
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
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    if (!nearBottom) return;

    if (!noInnerOptionsScroll && visibleCount < filteredOptions.length) {
      setVisibleCount((prev) =>
        Math.min(prev + OPTIONS_CHUNK_SIZE, filteredOptions.length),
      );
      return;
    }

    if (!onLoadMore || !hasMore || loadingMore) return;
    if (nearBottom) {
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
      setVisibleCount(OPTIONS_CHUNK_SIZE);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setVisibleCount(OPTIONS_CHUNK_SIZE);
  }, [isOpen, searchTerm, options.length]);

  const renderedOptions = useMemo(() => {
    if (noInnerOptionsScroll) return filteredOptions;
    return filteredOptions.slice(0, visibleCount);
  }, [filteredOptions, noInnerOptionsScroll, visibleCount]);

  // Notify parent of search term changes for remote/API search.
  useEffect(() => {
    if (!remoteSearch || !onSearchChange) return;

    // Avoid spamming the API for 0-1 chars; local filtering still works.
    const shouldQuery = searchTerm.trim().length >= 2;

    // Avoid showing "No results" immediately while user is typing.
    if (searchTerm.trim()) {
      setSearchPending(true);
    } else {
      setSearchPending(false);
    }

    const handle = setTimeout(() => {
      onSearchChange(shouldQuery ? searchTerm : "");
      setSearchPending(false);
    }, 220);

    return () => clearTimeout(handle);
  }, [searchTerm, remoteSearch, onSearchChange]);

  const baseClasses = `
    appearance-none h-[50px] w-full rounded-[16px] border pl-4 pr-11 text-[14px] text-[#0F172A]
    outline-none
    ${disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"}
    ${error && isValidationError ? "border-red-500" : "border-[#C2CAD6]"}
  `;

  return (
    <div className={`relative ${widthClass}`} ref={dropdownRef}>
      {label && (
        <label
          className={
            labelClass ? labelClass : "mb-1 block text-xs text-[#3D495C]"
          }
        >
          {label}
          {required && <span className="text-red-600"> *</span>}
        </label>
      )}

      <div className="group relative">
        <button
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`${
            className ? className : baseClasses
          } flex min-w-0 items-center justify-between`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={!!error}
          aria-describedby={error && showError ? "dropdown-error" : undefined}
        >
          {renderSelectedContent ? (
            <span className="min-w-0 flex-1 text-left leading-normal">
              {renderSelectedContent({
                selectedOption,
                displayValue,
                placeholder,
                value,
              })}
            </span>
          ) : (
            <span
              className={`block min-w-0 flex-1 truncate whitespace-nowrap text-left ${
                !selectedOption && !value ? "text-[#98A4B3]" : ""
              }`}
              title={typeof displayValue === "string" ? displayValue : undefined}
            >
              {displayValue}
            </span>
          )}

          <span
            className="pointer-events-none absolute right-[20px] top-[65%] flex h-[12px] w-[14px] -translate-y-1/2 items-center justify-center"
            aria-hidden
          >
            <img
              src={downArrowPng}
              alt=""
              className={`h-full w-full origin-center object-contain transition-transform duration-200 ease-out ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </span>
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
          <div
            className={`absolute z-[9999] mt-2 w-full rounded-2xl bg-white border border-[#E7EEF7] shadow-[0_8px_22px_rgba(12,40,86,0.08)] ${panelClassName} ${
              noInnerOptionsScroll ? "overflow-visible" : "overflow-hidden"
            }`}
          >
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
            <div
              className={
                noInnerOptionsScroll ? "" : "max-h-60 overflow-y-auto"
              }
              onScroll={handleScroll}
            >
              {filteredOptions.length > 0 ? (
                renderedOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={`${option.value}-${option.id}`}
                      type="button"
                      onClick={() => handleOptionSelect(option.value)}
                      disabled={option.disabled}
                      className={`
                      w-full px-4 py-2.5 text-left text-sm hover:bg-[#F8FAFC] 
                      ${
                        option.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                      ${
                        isSelected
                          ? "bg-[#2351A3]/10 text-[#2351A3]"
                          : "text-[#0F172A]"
                      }
                    `}
                    >
                      {renderOption ? (
                        <>
                          {renderOption(option, isSelected)}
                          <span className="sr-only">
                            {option.label}
                            {option.subLabel ? `, ${option.subLabel}` : ""}
                          </span>
                        </>
                      ) : (
                        option.label
                      )}
                    </button>
                  );
                })
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

              {!noInnerOptionsScroll &&
                renderedOptions.length < filteredOptions.length && (
                  <div className="px-4 py-2 text-center text-xs text-[#98A4B3]">
                    Scroll to load more options...
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
