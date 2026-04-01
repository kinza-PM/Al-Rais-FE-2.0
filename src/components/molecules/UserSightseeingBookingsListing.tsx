import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ShareTicketModal from "../atoms/ShareTicketModal";
import type { SightseeingBookingCardItem } from "../../utils/transformBookingData";
import type { BookingStatus } from "./UserBookingsListing";

const actionLinkClass =
  "text-[13px] font-medium text-[#5383DA] hover:underline cursor-pointer whitespace-nowrap";

function StatusPill({ status }: { status: BookingStatus }) {
  if (status === "Confirmed") {
    return (
      <span
        className="inline-flex items-center justify-center text-[11px] font-medium text-[#0A0C0F]"
        style={{
          background: "#85FFCA",
          width: "86px",
          height: "26px",
          borderRadius: "100px",
        }}
      >
        Confirmed
      </span>
    );
  }

  if (status === "Pending") {
    return (
      <span
        className="inline-flex items-center justify-center text-[11px] font-medium text-[#EA0029]"
        style={{
          background: "#FFB8C4",
          width: "116px",
          height: "26px",
          borderRadius: "100px",
        }}
      >
        Pending payment
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center text-[11px] font-medium text-[#3D495C]"
      style={{
        background: "#E4E4E7",
        width: "72px",
        height: "26px",
        borderRadius: "100px",
      }}
    >
      Expired
    </span>
  );
}

function CardDivider() {
  return <div className="-mx-4 h-px bg-[#E4E4E7]" />;
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: currency.length === 3 ? currency : "AED",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function SightseeingBookingCard({ booking }: { booking: SightseeingBookingCardItem }) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const isExpired = booking.status === "Expired";
  const detailPath = booking.activityCode
    ? `/sightseeing-detail/${encodeURIComponent(booking.activityCode)}`
    : "/search-sightseeing";

  return (
    <div
      className={[
        "relative rounded-[16px] border border-[#E4E4E7] bg-white overflow-hidden transition",
        isExpired ? "opacity-50 [filter:grayscale(100%)]" : "",
      ].join(" ")}
      style={{ maxWidth: "1168px", width: "100%" }}
    >
      <div className="absolute right-4 top-4 z-10">
        <StatusPill status={booking.status} />
      </div>

      <div className="px-4 pt-10 pb-4">
        <div className="text-[14px] font-semibold text-[#0A0C0F] mb-1">
          Activity date
        </div>
        <div className="text-[13px] font-medium text-[#0A0C0F]">
          {booking.tourDateDisplay}
          {booking.pickupTimeDisplay && booking.pickupTimeDisplay !== "—" ? (
            <span className="text-[#3D495C] font-normal">
              {" "}
              · {booking.pickupTimeDisplay}
            </span>
          ) : null}
        </div>
      </div>

      <CardDivider />

      <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-6 items-start">
        <div>
          <div className="text-[14px] font-medium text-[#0A0C0F] leading-snug">
            {booking.activityTitle}
          </div>
          <div className="text-[10px] text-[#3D495C] mt-2 leading-[14px]">
            {booking.packageSummary}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div>
            <div className="text-[10px] text-[#3D495C] mb-1">Travellers</div>
            <div className="text-[14px] font-medium text-[#0A0C0F] leading-none">
              {booking.travellersSummary}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#3D495C] mb-1">
              Booking ref. number
            </div>
            <div className="text-[14px] font-medium text-[#0A0C0F] leading-none break-all">
              {booking.bookingRef}
            </div>
          </div>
        </div>
      </div>

      {booking.totalPaid != null && booking.totalPaid > 0 && (
        <>
          <CardDivider />
          <div className="px-4 py-3 text-[13px] text-[#3D495C]">
            <span className="font-semibold text-[#0A0C0F]">Total paid:</span>{" "}
            {formatMoney(booking.totalPaid, booking.currency)}
          </div>
        </>
      )}

      <CardDivider />

      <div className="px-4 py-3 flex items-center justify-between text-[13px] font-medium flex-wrap gap-3">
        <div className="flex flex-wrap items-center divide-x divide-[#E4E4E7] gap-0">
          <Link
            to={detailPath}
            state={
              booking.activityCode
                ? {
                    context: {},
                  }
                : undefined
            }
            className={`${actionLinkClass} pr-4`}
          >
            View activity
          </Link>
          <Link
            to="/customer-support"
            className={`${actionLinkClass} px-4`}
          >
            Request changes
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setShareModalOpen(true)}
          className={`${actionLinkClass} bg-transparent border-none p-0`}
        >
          Share
        </button>
      </div>

      {shareModalOpen && (
        <ShareTicketModal
          closeModal={() => setShareModalOpen(false)}
          mode="hotel"
          cardTitle={booking.activityTitle}
          cardSubtitle={`${booking.tourDateDisplay} · Ref ${booking.bookingRef}`}
          shareUrl={`${window.location.origin}/my-bookings?ref=${encodeURIComponent(booking.bookingRef)}`}
          bookingRef={booking.bookingRef}
        />
      )}
    </div>
  );
}

export default function UserSightseeingBookingsListing({
  filterStatus,
  bookings = [],
}: {
  filterStatus: "All" | BookingStatus;
  bookings?: SightseeingBookingCardItem[];
}) {
  const list = useMemo(() => {
    if (!bookings?.length) return [];
    if (filterStatus === "All") return bookings;
    return bookings.filter((b) => b?.status === filterStatus);
  }, [bookings, filterStatus]);

  if (!list.length) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-[#E4E4E7] bg-white p-8 text-center text-[14px] text-[#3D495C]">
        No sightseeing bookings found.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4 flex flex-col items-center">
      {list.map((b) => (
        <div key={b.id} className="w-full max-w-[1168px]">
          <SightseeingBookingCard booking={b} />
        </div>
      ))}
    </div>
  );
}
