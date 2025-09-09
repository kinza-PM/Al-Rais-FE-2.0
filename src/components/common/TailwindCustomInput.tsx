type TailwindCustomInputProps = {
    label?: string;
    placeholder?: string;
    type?: string;
    required?: boolean;
    className?: string | null; // applied to the <input>
    labelClass?: string | null; // applied to the <input>
    value?: string | number | undefined;
    onChange?: ((e: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
    name?: string | undefined;
};

export default function TailwindCustomInput({
    label,
    placeholder,
    type = "text",
    required = false,
    className = null,
    labelClass = null,
    value = undefined,
    onChange = undefined,
    name = undefined,
}: TailwindCustomInputProps) {

    const defaultClasses =
        "h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm " +
        "placeholder:text-[#C2CAD6] text-[#0A0C0F] " +
        "focus:outline-none focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/20";

    const defaultLabelClass =
        "mb-1 block text-[12px] text-[#3D495C]";

    return (
        <div className="w-full">
            {label ? (
                <label className={labelClass ? labelClass : defaultLabelClass}>
                    {label} {required && <span className="text-red-600">*</span>}
                </label>
            ) : null}

            <input
                name={name}
                type={type}
                placeholder={placeholder}
                required={required}
                value={value}
                onChange={onChange}
                className={className ?? defaultClasses}
            />
        </div>
    );
}
