import React from "react";
import type { SightseeingActivity } from "../../../features/sightseeing/types";

type Props = {
  activity: SightseeingActivity;
  onBookNow?: (activity: SightseeingActivity) => void;
  /** When true, card spans the full width of its grid/flex parent (detail “You may also like” row). */
  fullWidth?: boolean;
};

/** Figma-style: USD → $120 (symbol touching amount); other codes keep “CODE 120”. */
function formatSightseeingPrice(currency: string, amount: number): string {
  const n = amount.toFixed(0);
  switch (currency.trim().toUpperCase()) {
    case "USD":
      return `$${n}`;
    case "EUR":
      return `€${n}`;
    case "GBP":
      return `£${n}`;
    default:
      return `${currency.trim()} ${n}`;
  }
}

function ClockOutlineIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#4B5563"
        strokeWidth="1.5"
      />
      <path
        d="M12 8v4l3 2"
        stroke="#4B5563"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PeopleOutlineIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke="#4B5563"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="4" stroke="#4B5563" strokeWidth="1.5" />
      <path
        d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="#4B5563"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarOutlineIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke="#D97706"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma: ~378.67 × 573, radius 16, border 1.5px #C2CAD6, gap/pb 15; badge row 40px × ~348.67 */
const SightseeingActivityCard: React.FC<Props> = ({
  activity,
  onBookNow,
  fullWidth = false,
}) => {
  const reviewsLabel = activity.reviewCount.toLocaleString();

  return (
    <article
      className={`box-border flex h-[573px] w-full flex-col gap-[15px] overflow-hidden rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-white pb-[15px] shadow-[0_2px_12px_rgba(15,23,42,0.04)] ${
        fullWidth
          ? "mx-0 max-w-none"
          : "mx-auto max-w-[378.67px]"
      }`}
    >
      <div className="sightseeing-card-image-wrap relative min-h-0 w-full flex-[1.4] basis-0 overflow-hidden bg-[#E8ECF0]">
        <img
          src={activity.imageSrc}
          alt=""
          className="sightseeing-card-image h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Figma: ~348.67 × 40, space-between (inset 15px each side of 378.67 card) */}
      <div className="shrink-0 px-[15px]">
        <div className="flex h-10 w-full items-center justify-between">
          <span className="max-w-[58%] truncate rounded-full bg-[#B9D1F9] px-4 py-1.5 text-[13px] font-semibold leading-tight text-[#345995]">
            {activity.categoryLabel}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#FFE9D5] px-4 py-1.5 text-[13px] font-semibold leading-tight text-[#D97706]">
            <StarOutlineIcon className="shrink-0" />
            {activity.rating.toFixed(1)} ({reviewsLabel})
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 basis-0 flex-col px-[15px]">
        <h3 className="line-clamp-2 text-[18px] font-bold leading-snug tracking-tight text-[#0A0C0F]">
          {activity.title}
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] font-medium text-[#4B5563]">
          <span className="inline-flex items-center gap-2">
            <ClockOutlineIcon className="shrink-0" />
            {activity.durationLabel}
          </span>
          <span className="inline-flex items-center gap-2">
            <PeopleOutlineIcon className="shrink-0" />
            {activity.groupLabel}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
          <div>
            <p className="text-[12px] font-medium text-[#6B7280]">
              Starting from
            </p>
            <p className="mt-1 text-[22px] font-bold leading-none tracking-tight text-[#1E40AF]">
              {formatSightseeingPrice(activity.currency, activity.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onBookNow?.(activity)}
            className="shrink-0 rounded-full px-8 py-3 text-[14px] font-bold text-white transition-opacity hover:opacity-95"
            style={{
              background:
                "linear-gradient(90deg, #4A7BD9 0%, #0A1D37 100%)",
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </article>
  );
};

export default SightseeingActivityCard;
