import type { SightseeingBookingSummary } from "../../../features/sightseeing/sightseeingBooking";
import type { SightseeingProtectionChoice } from "./SightseeingGetProtectionSection";

export function formatSightseeingTicketMoney(currency: string, amount: number): string {
  const n = amount.toFixed(2);
  const c = currency.trim().toUpperCase();
  if (c === "USD") return `$${n}`;
  if (c === "EUR") return `€${n}`;
  if (c === "GBP") return `£${n}`;
  return `${currency.trim()} ${n}`;
}

export function SightseeingNotchDivider() {
  return (
    <div className="relative mt-7 mb-10">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <div
          className="border-t border-dashed border-[#E4E4E7]"
          style={{ borderWidth: 1, marginTop: -10 }}
        />
      </div>
      <span
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2"
        style={{ transform: "translate(-9px, -50%)" }}
      >
        <svg
          width="9.14"
          height="20"
          viewBox="0 0 10 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.5 0.512695C5.51429 0.772696 9.5 4.92101 9.5 10C9.5 15.079 5.51426 19.2263 0.5 19.4863V0.512695Z"
            fill="#FFFFFF"
          />
          <path
            d="M0.5 0.512695C5.51429 0.772696 9.5 4.92101 9.5 10C9.5 15.079 4.48574 19.2263 0.5 19.4863"
            fill="none"
            stroke="#C2CAD6"
            strokeWidth="1"
          />
        </svg>
      </span>
      <span
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
        style={{ transform: "translate(9px, -50%)" }}
      >
        <svg
          width="9.14"
          height="20"
          viewBox="0 0 10 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.5 0.512695C4.48571 0.772696 0.5 4.92101 0.5 10C0.5 15.079 4.48574 19.2263 9.5 19.4863V0.512695Z"
            fill="#FFFFFF"
            stroke="#C2CAD6"
            strokeWidth="1"
          />
        </svg>
      </span>
    </div>
  );
}

export type SightseeingTicketPdfContentProps = {
  summary: SightseeingBookingSummary;
  bookingReference: string;
  clientReference?: string;
  leadTravelerDisplayName: string;
  protectionChoice: SightseeingProtectionChoice;
};

/**
 * Visual ticket body used on the confirmation screen and for PDF / My Bookings voucher download.
 */
export function SightseeingTicketPdfContent({
  summary,
  bookingReference,
  clientReference,
  leadTravelerDisplayName,
  protectionChoice,
}: SightseeingTicketPdfContentProps) {
  const pickupLine = [summary.pickupDateDisplay, summary.pickupTimeDisplay]
    .filter(Boolean)
    .join(" · ");

  const protectionLine =
    protectionChoice === "damage"
      ? "Rental car damage protection was added to this booking."
      : "No add-on protection was selected for this booking.";

  return (
    <>
      {summary.imageSrc ? (
        <div className="relative h-48 overflow-hidden rounded-2xl">
          <img
            src={summary.imageSrc}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-8 flex flex-col items-center justify-center text-center text-[#0A0C0F]">
        <h2 className="text-lg font-bold">Your experience is booked!</h2>
        <h5 className="mt-3 text-sm">
          Confirmation:{" "}
          <span className="font-semibold">{bookingReference || "—"}</span>
        </h5>
        <p className="mb-3 mt-5 text-xs text-[#3D495C]">
          We&apos;ve sent a receipt to the email used at payment.
        </p>
        {clientReference ? (
          <p className="text-[11px] text-[#98A4B3]">
            Reference: {clientReference}
          </p>
        ) : null}
      </div>

      <SightseeingNotchDivider />

      <div>
        <h3 className="text-base font-bold text-[#0A0C0F]">{summary.title}</h3>
        <p className="mt-1 text-xs text-[#3D495C]">{summary.categoryLabel}</p>
      </div>

      <SightseeingNotchDivider />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[13px] text-[#3D495C]">Pickup date &amp; time</p>
          <p className="mt-1 text-[15px] font-medium text-[#0A0C0F]">
            {pickupLine || "—"}
          </p>
        </div>
        <div>
          <p className="text-[13px] text-[#3D495C]">Package</p>
          <p className="mt-1 text-[15px] font-medium text-[#0A0C0F]">
            {summary.packageSummary}
          </p>
        </div>
      </div>

      <SightseeingNotchDivider />

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="text-[13px] text-[#3D495C]">Lead guest</div>
          <div className="mt-1 break-words text-[15px] font-medium text-[#0A0C0F]">
            {leadTravelerDisplayName || "—"}
          </div>
        </div>
        <div className="shrink-0">
          <div className="text-[13px] text-[#3D495C]">Travellers</div>
          <div className="mt-1 text-[15px] font-medium text-[#0A0C0F]">
            {summary.travellersSummary}
          </div>
        </div>
      </div>

      <SightseeingNotchDivider />

      <div className="text-[13px] text-[#64748B]">{protectionLine}</div>

      <SightseeingNotchDivider />

      <div className="flex items-center justify-between">
        <span className="text-xs text-[#3D495C]">Total paid</span>
        <span className="text-[15px] font-semibold text-[#0A0C0F]">
          {formatSightseeingTicketMoney(summary.currency, summary.grandTotal)}
        </span>
      </div>
    </>
  );
}
