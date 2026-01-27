import React from "react";

type StatusVariant = "warning" | "error" | "info" | "success";

interface StatusMessageBannerProps {
  visible: boolean;
  message: React.ReactNode;
  variant?: StatusVariant;
  /**
   * Optional extra classes for the outer fixed container,
   * e.g. to tweak the top offset (default: top-4).
   */
  containerClassName?: string;
}

const variantClasses: Record<StatusVariant, string> = {
  warning: "bg-amber-100 text-[#3D2E00] border-amber-300",
  error: "bg-red-100 text-[#7F1D1D] border-red-300",
  info: "bg-blue-100 text-[#0B2C4A] border-blue-300",
  success: "bg-emerald-100 text-[#064E3B] border-emerald-300",
};

const StatusMessageBanner: React.FC<StatusMessageBannerProps> = ({
  visible,
  message,
  variant = "warning",
  containerClassName = "",
}) => {
  const baseVariant = variantClasses[variant] ?? variantClasses.warning;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      // className={`fixed top-4 inset-x-0 z-50 pointer-events-none flex justify-center ${containerClassName}`}
      className={`fixed top-4 inset-x-0 z-50 flex justify-center ${
        visible ? "pointer-events-none" : "pointer-events-none invisible"
      } ${containerClassName}`}
    >
      <div
        className={
          "pointer-events-auto transition-all duration-300 ease-out transform-gpu " +
          (visible ? "opacity-100 translate-y-0" : "-translate-y-4 opacity-0")
        }
        style={{ willChange: "transform, opacity" }}
      >
        <div
          className={`${baseVariant} text-sm px-4 py-2 rounded-lg shadow-md border flex items-center gap-3`}
        >
          <span className="leading-tight">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusMessageBanner;
