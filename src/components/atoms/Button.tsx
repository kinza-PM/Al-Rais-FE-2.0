import React from "react";

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  overrideClasses?: boolean;
  style?: React.CSSProperties;
  "aria-pressed"?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = "primary",
  type = "button",
  className = "",
  disabled = false,
  overrideClasses = false,
  style,
  "aria-pressed": ariaPressed,
}) => {
  const baseClasses =
    "font-semibold py-2 px-4 rounded-md transition-all whitespace-nowrap";

  const variantClasses = {
    primary: disabled
      ? "bg-gray-400 text-white cursor-not-allowed"
      : "bg-primary text-white hover:bg-opacity-90",
    secondary: disabled
      ? "bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed"
      : "bg-white text-primary border border-primary hover:bg-slate-100 hover:text-primary hover:border-primary",
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={style}
      aria-pressed={ariaPressed}
      className={
        overrideClasses
          ? className
          : `${baseClasses} ${variantClasses[variant]} ${className}`
      }
    >
      {children}
    </button>
  );
};

export default Button;
