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
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    error?: string | null;
    className?: string;
    widthClass?: string;
    noResultsText?: string;
    loading?: boolean;
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
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showError, setShowError] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get selected options labels
    const selectedOptions = options.filter(option => value.includes(option.value));
    const displayValue = selectedOptions.length > 0
        ? selectedOptions.map(option => option.label).join(", ")
        : placeholder;

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
        const newValue = value.includes(optionValue)
            ? value.filter(val => val !== optionValue) // Remove if already selected
            : [...value, optionValue]; // Add if not selected

        onChange(newValue);
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

        if (error && (e.key === " " || e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp")) {
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
                    <span className={`${selectedOptions.length === 0 ? 'text-[#98A4B3]' : ''} truncate`}>
                        {loading ? 'Loading...' : displayValue}
                    </span>

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
                                            ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                            ${value.includes(option.value) ? 'bg-[#2351A3]/5' : ''}
                                        `}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={value.includes(option.value)}
                                            onChange={() => handleOptionToggle(option.value)}
                                            disabled={option.disabled}
                                            className="h-4 w-4 text-[#2351A3] border-[#DFE7F3] rounded focus:ring-[#2351A3] focus:ring-offset-0"
                                        />
                                        <span className={`ml-3 ${value.includes(option.value) ? 'text-[#2351A3] font-medium' : 'text-[#0F172A]'}`}>
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