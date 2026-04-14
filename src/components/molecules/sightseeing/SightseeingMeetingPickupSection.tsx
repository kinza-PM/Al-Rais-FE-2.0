import {
  SIGHTSEEING_FIGMA_MEETING_PICKUP_FOOTER,
  SIGHTSEEING_FIGMA_MEETING_PICKUP_LINES,
  SIGHTSEEING_FIGMA_MEETING_PICKUP_TITLE,
} from "./sightseeingDetailCopy";

/** Map pin — Figma vector ~16×21, dark primary (#2351A3) on primary-100 */
function MeetingMapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={21}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"
        fill="#2351A3"
      />
    </svg>
  );
}

export function SightseeingMeetingPickupSection() {
  return (
    <div className="w-full max-w-[872px]">
      <h2 className="mb-4 text-[20px] font-bold leading-tight tracking-tight text-[#0A0C0F]">
        {SIGHTSEEING_FIGMA_MEETING_PICKUP_TITLE}
      </h2>

      <div
        className="flex h-[175px] w-full items-center justify-center rounded-2xl bg-[#A7C0EC] shadow-[0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-black/[0.04]"
        role="img"
        aria-label="Map preview — meeting point location"
      >
        <MeetingMapPinIcon className="drop-shadow-sm" />
      </div>

      <div className="mt-5 max-w-[798px] space-y-3 text-left text-[16px] font-normal leading-6 text-[#0A0C0F]">
        {SIGHTSEEING_FIGMA_MEETING_PICKUP_LINES.map((line, i) => (
          <p key={i} className="m-0">
            {line.parts.map((part, j) =>
              part.bold ? (
                <strong key={j} className="font-semibold text-[#0A0C0F]">
                  {part.text}
                </strong>
              ) : (
                <span key={j}>{part.text}</span>
              ),
            )}
          </p>
        ))}
        <p className="mb-0 mt-6 text-[13px] leading-snug text-[#94A3B8]">
          {SIGHTSEEING_FIGMA_MEETING_PICKUP_FOOTER}
        </p>
      </div>
    </div>
  );
}
