import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import CustomDropdownError from "./CustomDropdownError";

export interface DropdownOption {
  id: string;
  value: string;
  label: string;
  disabled?: boolean;
}

interface Props {
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

const CardOverlaySearchableDropdown: React.FC<Props> = ({
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showError, setShowError] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // calculate overlay position
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: r.bottom + window.scrollY + 6,
        left: r.left + window.scrollX,
        width: r.width,
      });
    }
  }, [isOpen]);

  // outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setShowError(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // focus search
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const selectedOption = options.find((o) => o.value === value);
  const displayValue = selectedOption?.label || placeholder;

  const handleToggle = () => {
    if (disabled || loading) return;

    if (error) {
      setShowError((s) => !s);
      return;
    }

    setIsOpen((v) => !v);
    setSearchTerm("");
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  const baseClasses = `
      appearance-none h-11 w-full rounded-xl border pl-4 pr-8 text-[14px] text-[#0F172A]
      outline-none border-[#DFE7F3]
      ${disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"}
      ${error ? "border-red-500" : ""}
    `;

  return (
    <div className={`relative ${widthClass}`}>
      {label && (
        <label className="block text-[12px] text-[#3D495C] mb-1">{label}</label>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled || loading}
        className={`${
          className || baseClasses
        } flex items-center justify-between relative`}
        aria-expanded={isOpen}
      >
        <span className={!selectedOption ? "text-[#98A4B3]" : ""}>
          {loading ? "Loading..." : displayValue}
        </span>

        <svg
          className={`pointer-events-none absolute right-3 transition-transform ${
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

      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "absolute",
              top: position.top,
              left: position.left,
              width: position.width,
              zIndex: 9999,
            }}
            className="rounded-2xl bg-white border border-[#E7EEF7] shadow-[0_8px_22px_rgba(12,40,86,0.08)] overflow-hidden"
          >
            {/* Search */}
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

            {/* Options */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    className={`
                        w-full px-4 py-3 text-left text-sm hover:bg-[#F8FAFC]
                        ${
                          opt.disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }
                        ${
                          opt.value === value
                            ? "bg-[#2351A3]/10 text-[#2351A3]"
                            : "text-[#0F172A]"
                        }
                      `}
                  >
                    {opt.label}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-[#98A4B3] text-center">
                  {noResultsText}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {error && showError && (
        <CustomDropdownError title="Nothing found!" message={error} />
      )}
    </div>
  );
};

export default CardOverlaySearchableDropdown;
