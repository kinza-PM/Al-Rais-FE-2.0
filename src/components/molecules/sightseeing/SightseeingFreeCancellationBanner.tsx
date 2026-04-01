import React from "react";

function InfoCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
      <path
        d="M12 11V17M12 8h.01"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const GRADIENT =
  "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)";

type Props = {
  className?: string;
};

/** Figma: full-width strip · 80px height · gradient · info + copy */
export function SightseeingFreeCancellationBanner({ className = "" }: Props) {
  return (
    <div
      className={`flex h-[80px] w-full items-center gap-4 rounded-[16px] px-4 sm:px-5 ${className}`}
      style={{ background: GRADIENT }}
    >
      <InfoCircleIcon className="shrink-0" />
      <div className="min-w-0">
        <p className="text-[15px] font-bold leading-tight text-white">
          Free cancellation
        </p>
        <p className="mt-0.5 text-[12px] font-normal leading-snug text-white/95 sm:text-[13px]">
          up to 24 hours before your tour date. Instant confirmation upon
          booking.
        </p>
      </div>
    </div>
  );
}
