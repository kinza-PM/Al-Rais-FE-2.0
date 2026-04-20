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
  disabled?: boolean;
  inputRef?: React.Ref<HTMLInputElement> | null;
  error?: string | null;
  maxLength?: number;
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
  disabled = false,
  inputRef = null,
  error = null,
  maxLength,
}: TailwindCustomInputProps) {
  const defaultClasses =
    "h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 text-sm " +
    "placeholder:text-[#C2CAD6] text-[#0A0C0F] " +
    "focus:outline-none focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/20";

  const defaultLabelClass = "mb-1 block text-[12px] text-[#0A0C0F]";

  return (
    <div className="relative w-full">
      {label ? (
        <label className={labelClass ? labelClass : defaultLabelClass}>
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      ) : null}

      <input
        ref={inputRef}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className={className ?? defaultClasses}
        disabled={disabled}
        maxLength={maxLength}
      />
      {error && (
        <p className="absolute top-full left-0 mt-1 text-[12px] text-[#E65959]">
          {/*  <p className="mt-1 text-[12px] text-[#E65959]" role="alert"> */}
          {error}
        </p>
      )}
    </div>
  );
}
