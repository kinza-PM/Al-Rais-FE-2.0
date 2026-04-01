import React from "react";

interface CustomToggleProps {
    checked: boolean;
    onChange: () => void;
    label?: string;
    disabled?: boolean;
    className?: string;
}

const CustomToggle: React.FC<CustomToggleProps> = ({
    checked,
    onChange,
    label,
    disabled = false,
    className = "",
}) => {
    return (
        <label
            className={`inline-flex items-center gap-2 select-none ${label ? "text-[12px] text-[#3D495C]" : ""
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
        >
            {label && <span>{label}</span>}

            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                aria-checked={checked}
                role="switch"
            />

            <span
                className="
          relative block h-5 w-9 rounded-full bg-[#D7E1EF]
          transition-colors duration-300
          peer-checked:bg-[#2351A3]
          after:content-[''] after:absolute after:top-0.5 after:left-0.5
          after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm
          after:transition-transform after:duration-300
          peer-checked:after:translate-x-2
        "
            />
        </label>
    );
};

export default CustomToggle;
