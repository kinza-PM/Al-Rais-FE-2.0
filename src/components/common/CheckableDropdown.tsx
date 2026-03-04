import React, { useState, useRef, useEffect } from "react";
import CustomDropdownError from "./CustomDropdownError";

export interface DropdownOption {
  id: string;
  value: string;
  label: string;
  disabled?: boolean;
}

interface CheckableDropdownProps {
  options: DropdownOption[];
  value: string[] | string;
  onChange: (value: string[] | string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string | null;
  className?: string;
  widthClass?: string;
  noResultsText?: string;
  loading?: boolean;
  singleSelect?: boolean;
  tooltip?: string | null;
}

const CheckableDropdown: React.FC<CheckableDropdownProps> = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Please select",
  label,
  disabled = false,
  error = null,
  className = "",
  widthClass = "w-full",
  noResultsText = "No options available",
  loading = false,
  singleSelect = false,
  tooltip = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected options labels
  const isMultiSelect = !singleSelect;
  const valueArray = isMultiSelect
    ? (value as string[])
    : value
      ? [value as string]
      : [];
  const selectedOptions = options.filter((option) =>
    valueArray.includes(option.value),
  );
  const displayValue =
    selectedOptions.length > 0
      ? selectedOptions.map((option) => option.label).join(", ")
      : placeholder;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowError(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (disabled || loading) return;

    if (error) {
      setShowError(!showError);
      return;
    }

    setIsOpen(!isOpen);
  };

  const handleOptionToggle = (optionValue: string) => {
    if (singleSelect) {
      // Radio-like behavior: select only this option
      const newValue = value === optionValue ? "" : optionValue;
      onChange(newValue);
    } else {
      // Multi-select behavior: toggle option
      const currentValue = value as string[];
      const newValue = currentValue.includes(optionValue)
        ? currentValue.filter((val) => val !== optionValue) // Remove if already selected
        : [...currentValue, optionValue]; // Add if not selected

      onChange(newValue);
    }
  };

  // const handleSelectAll = () => {
  //     const allValues = options.filter(opt => !opt.disabled).map(opt => opt.value);
  //     onChange(allValues);
  // };

  // const handleClearAll = () => {
  //     onChange([]);
  // };

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
      setShowError(false);
    }
  };

  const baseClasses = `
        appearance-none h-[50px] w-full rounded-[16px] border pl-4 pr-8 text-[14px] text-[#0F172A]
        outline-none border-[#C2CAD6]
        ${disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"}
        ${error ? "border-red-500" : ""}
    `;

  return (
    <div className={`relative ${widthClass}`} ref={dropdownRef}>
      {label && (
        <label className="block text-[12px] text-[#3D495C] mb-1">{label}</label>
      )}

      <div className="group relative">
        <button
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          className={`${className ? className : baseClasses} flex items-center justify-between`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={!!error}
          aria-describedby={error && showError ? "dropdown-error" : undefined}
        >
          <span
            className={`${selectedOptions.length === 0 ? "text-[#98A4B3]" : ""} truncate`}
          >
            {loading ? "Loading..." : displayValue}
          </span>

          <svg
            className={`pointer-events-none shrink-0 absolute right-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
            <div className="text-center">
              {selectedOptions.length > 0 ? displayValue : tooltip}
            </div>
          </div>
        )}

        {isOpen && (
          <div className="absolute z-30 mt-2 w-full rounded-2xl bg-white border border-[#E7EEF7] shadow-[0_8px_22px_rgba(12,40,86,0.08)] overflow-hidden">
            {/* Select All / Clear All Actions */}
            {/* {options.length > 0 && (
                            <div className="flex justify-between p-3 border-b border-[#EDEFF6]">
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className="text-xs text-[#2351A3] hover:text-[#1a3a7a] font-medium"
                                >
                                    Select All
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearAll}
                                    className="text-xs text-[#64748B] hover:text-[#475569] font-medium"
                                >
                                    Clear All
                                </button>
                            </div>
                        )} */}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto">
              {options.length > 0 ? (
                options.map((option) => (
                  <label
                    key={option.id}
                    className={`
                                            flex items-center w-full px-4 py-3 text-left text-sm hover:bg-[#F8FAFC] 
                                            ${option.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                            ${valueArray.includes(option.value) ? "bg-[#2351A3]/5" : ""}
                                        `}
                  >
                    <input
                      type={singleSelect ? "radio" : "checkbox"}
                      name={singleSelect ? "radio-group" : undefined}
                      checked={valueArray.includes(option.value)}
                      onChange={() => handleOptionToggle(option.value)}
                      disabled={option.disabled}
                      className={
                        singleSelect
                          ? "h-4 w-4 text-[#2351A3] border-[#DFE7F3] focus:ring-[#2351A3] focus:ring-offset-0"
                          : "h-4 w-4 text-[#2351A3] border-[#DFE7F3] rounded focus:ring-[#2351A3] focus:ring-offset-0"
                      }
                    />
                    <span
                      className={`ml-3 ${valueArray.includes(option.value) ? "text-[#2351A3] font-medium" : "text-[#0F172A]"}`}
                    >
                      {option.label}
                    </span>
                  </label>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-[#98A4B3] text-center">
                  {noResultsText}
                </div>
              )}
            </div>
          </div>
        )}

        {error && showError && (
          <CustomDropdownError
            id="dropdown-error"
            title="Nothing found!"
            message={error}
          />
        )}
      </div>
    </div>
  );
};

export default CheckableDropdown;
