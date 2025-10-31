import React, { useState, useRef, useEffect, useMemo } from "react";
import CustomDropdownError from "./CustomDropdownError";
// import arrownDownwardIcon from "../../assets/svgs/arrow-downwards.svg";

export interface DropdownOption {
    id: string;
    value: string;
    label: string;
    disabled?: boolean;
}

interface SearchableDropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    error?: string | null;
    className?: string;
    widthClass?: string;
    searchPlaceholder?: string;
    noResultsText?: string;
    loading?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
    options = [],
    value,
    onChange,
    placeholder = "Please select",
    label,
    disabled = false,
    error = null,
    className = "",
    widthClass = "w-full",
    searchPlaceholder = "Search...",
    noResultsText = "No results found",
    loading = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showError, setShowError] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter options based on search term
    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return options;
        return options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            option.value.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    // Get selected option label
    const selectedOption = options.find(option => option.value === value);
    const displayValue = selectedOption?.label || placeholder;

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
                setShowError(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleToggle = () => {
        if (disabled || loading) return;

        if (error) {
            setShowError(!showError);
            return;
        }

        setIsOpen(!isOpen);
        setSearchTerm("");
    };

    const handleOptionSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled || loading) return;

        if (error && (e.key === " " || e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp")) {
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

    const baseClasses = `
    appearance-none h-11 w-full rounded-xl border pl-4 pr-8 text-[14px] text-[#0F172A] 
    outline-none border-[#DFE7F3]
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}
    ${error ? 'border-red-500' : ''}
  `;

    return (
        <div className={`relative ${widthClass}`} ref={dropdownRef}>
            {label && (
                <label className="block text-[12px] text-[#3D495C] mb-1">
                    {label}
                </label>
            )}

            <div className="relative">
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
                    <span className={`${!selectedOption ? 'text-[#98A4B3]' : ''}`}>
                        {loading ? 'Loading...' : displayValue}
                    </span>

                    {/* <img
                        src={arrownDownwardIcon}
                        alt="dropdown arrow"
                        className={`pointer-events-none shrink-0 absolute right-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    /> */}
                    <svg
                        className={`pointer-events-none shrink-0 absolute right-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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

                {isOpen && (
                    <div className="absolute z-30 mt-2 w-full rounded-2xl bg-white border border-[#E7EEF7] shadow-[0_8px_22px_rgba(12,40,86,0.08)] overflow-hidden">
                        {/* Search Input */}
                        <div className="p-3 border-b border-[#EDEFF6]">
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-[#DFE7F3] rounded-lg focus:outline-none"
                            />
                        </div>

                        {/* Options List */}
                        <div className="max-h-60 overflow-y-auto">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => handleOptionSelect(option.value)}
                                        disabled={option.disabled}
                                        className={`
                      w-full px-4 py-3 text-left text-sm hover:bg-[#F8FAFC] 
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      ${option.value === value ? 'bg-[#2351A3]/10 text-[#2351A3]' : 'text-[#0F172A]'}
                    `}
                                    >
                                        {option.label}
                                    </button>
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

export default SearchableDropdown;
