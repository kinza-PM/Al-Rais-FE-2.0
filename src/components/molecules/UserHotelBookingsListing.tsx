import { useMemo, useEffect, useState, useCallback } from "react";
import Button from "../atoms/Button";
import { Link, useSearchParams } from "react-router-dom";
import ShareTicketModal from "../atoms/ShareTicketModal";
import type { HotelBookingCardItem } from "../../utils/transformBookingData";
import {
  hotelBookingInDateRange,
  hotelBookingMatchesQuery,
} from "../../utils/myBookingsClientFilters";
import { markExpectMyBookingsQueryRestore } from "../../utils/myBookingsUrl";
import HotelBookingETicketSetion, {
  type HotelListDownloadParams,
} from "./HotelBookingETicketSetion";
import {
  StatusPill,
  TripCategoryPill,
  type BookingStatus,
} from "./UserBookingsListing";
import FilledStar from "../../assets/svgs/filled_star.svg";

const FIGMA_INTER = "font-[Inter,sans-serif] antialiased";

/**
 * Typography constants sourced directly from Figma node 9453:8256
 * (My Bookings – Hotel card). All line‑heights are 100% in Figma,
 * which maps to Tailwind `leading-none` for single-line elements and
 * `leading-normal` where text may wrap.
 */
const textDate = `${FIGMA_INTER} text-[11px] font-normal leading-normal text-[#3D495C]`;
const textLabel = `${FIGMA_INTER} text-[13px] font-normal leading-none text-[#3D495C]`;
const textValue = `${FIGMA_INTER} text-[15px] font-medium leading-none text-[#0A0C0F]`;
const textHeading = `${FIGMA_INTER} text-[17px] font-semibold leading-none text-[#0A0C0F]`;
const textTime = `${FIGMA_INTER} text-[15px] font-medium leading-none text-[#0A0C0F]`;
const textHotelName = `${FIGMA_INTER} text-[15px] font-medium leading-none text-[#0A0C0F]`;
const textAddress = `${FIGMA_INTER} text-[11px] font-normal leading-normal text-[#3D495C]`;
const textBtn = `${FIGMA_INTER} text-[15px] font-semibold leading-none tracking-[0.5px]`;
const textStatusMsg = `${FIGMA_INTER} text-[15px] font-medium leading-none`;

const actionLinkClass = `${FIGMA_INTER} text-[15px] font-medium leading-none tracking-normal text-[#5383DA] hover:underline cursor-pointer whitespace-nowrap`;

export type { BookingStatus };

function CardDivider() {
  return <div className="h-px bg-[#E4E4E7]" />;
}

function StayTimeline({
  checkInTime,
  checkOutTime,
  totalStay,
  checkInDate,
  checkOutDate,
}: {
  checkInTime: string;
  checkOutTime: string;
  totalStay: string;
  checkInDate: string;
  checkOutDate: string;
}) {
  const totalStayLabel = (totalStay || "").trim();
  const totalStayDisplay = !totalStayLabel
    ? ""
    : /total\s*stay\s*:/i.test(totalStayLabel)
      ? totalStayLabel
      : `Total stay: ${totalStayLabel}`;

  const hasTimeRow = Boolean(
    (checkInTime || "").trim() || (checkOutTime || "").trim(),
  );

  /**
   * Figma layout (node 9453:8256):
   *   row 1: [Check-in]          [ — ]          [Check-out]
   *   row 2: [2:00 PM – 12:00 AM] [Total stay:]  [2:00 PM – 12:00 AM]
   *          └── dot ─────────── line ────────── dot ──┘   (line sits on row 2)
   *   row 3: [date]                ∅                [date]
   */
  return (
    <div className="grid grid-cols-[auto_minmax(160px,1fr)_auto] items-start gap-6 max-[900px]:grid-cols-1 max-[900px]:gap-4">
      <div className="text-left max-[900px]:text-center">
        <div className={`whitespace-nowrap ${textHeading}`}>Check-in</div>
        {hasTimeRow ? (
          <div className={`mt-3 whitespace-nowrap ${textTime}`}>
            {checkInTime}
          </div>
        ) : null}
        <div
          className={`whitespace-nowrap ${hasTimeRow ? "mt-1" : "mt-3"} ${textDate}`}
        >
          {checkInDate}
        </div>
      </div>

      <div
        className="flex flex-col items-center justify-start max-[900px]:pt-0"
        style={{ paddingTop: hasTimeRow ? 32 : 22 }}
      >
        <div
          className={`mb-1 whitespace-nowrap text-center ${textDate}`}
        >
          {totalStayDisplay}
        </div>
        <div className="relative h-px w-full min-w-[160px] rounded-full bg-[#A7C0EC]">
          <span className="absolute -top-[4px] left-0 h-2 w-2 rounded-full bg-[#2351A3]" />
          <span className="absolute -top-[4px] right-0 h-2 w-2 rounded-full bg-[#2351A3]" />
        </div>
      </div>

      <div className="text-left max-[900px]:text-center">
        <div className={`whitespace-nowrap ${textHeading}`}>Check-out</div>
        {hasTimeRow ? (
          <div className={`mt-3 whitespace-nowrap ${textTime}`}>
            {checkOutTime}
          </div>
        ) : null}
        <div
          className={`whitespace-nowrap ${hasTimeRow ? "mt-1" : "mt-3"} ${textDate}`}
        >
          {checkOutDate}
        </div>
      </div>
    </div>
  );
}

function HotelBookingCard({
  booking,
  myBookingsSearch,
  onRequestReceiptPdf,
}: {
  booking: HotelBookingCardItem;
  myBookingsSearch: string;
  onRequestReceiptPdf: (params: HotelListDownloadParams) => void;
}) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const isPending = booking.status === "Pending";
  const isExpired = booking.status === "Expired";
  const isCancelled = booking.status === "Cancelled";

  const [countdown, setCountdown] = useState(
    booking.countdown || { hours: "00", mins: "35", secs: "49" },
  );

  useEffect(() => {
    if (!isPending) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        let h = Number(prev.hours);
        let m = Number(prev.mins);
        let s = Number(prev.secs);

        if (h === 0 && m === 0 && s === 0) return prev;

        if (s > 0) s -= 1;
        else if (m > 0) {
          m -= 1;
          s = 59;
        } else if (h > 0) {
          h -= 1;
          m = 59;
          s = 59;
        }

        return {
          hours: String(h).padStart(2, "0"),
          mins: String(m).padStart(2, "0"),
          secs: String(s).padStart(2, "0"),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPending]);

  return (
    <div
      className={[
        `${FIGMA_INTER} relative w-full max-w-[1168px] overflow-hidden rounded-[16px] border-[1.5px] bg-white shadow-sm transition`,
        isExpired || isCancelled ? "opacity-60 [filter:grayscale(80%)]" : "",
        isExpired ? "bg-[#F2F2F3]" : "bg-white",
      ].join(" ")}
      style={{
        borderColor: "#E4E4E7",
        width: "100%",
        maxWidth: "1168px",
      }}
    >
      {/* Top section */}
      <div className="relative px-5 pb-4 pt-5 max-[640px]:pt-4">
        <div className="absolute right-5 top-5 flex flex-wrap items-center justify-end gap-2 max-[640px]:static max-[640px]:mb-3">
          <TripCategoryPill label="Hotel" />
          <StatusPill status={booking.status} />
        </div>

        {/**
         * Right padding reserves room for the pills in the top-right,
         * which shifts the centered Check-in / Check-out block slightly left
         * to match the Figma layout.
         */}
        <div className="mx-auto w-full max-w-[720px] pr-[180px] max-[900px]:pr-0 max-[640px]:max-w-none">
          <StayTimeline
            checkInTime={booking.checkInTime}
            checkOutTime={booking.checkOutTime}
            totalStay={booking.totalStay || ""}
            checkInDate={booking.checkInDate}
            checkOutDate={booking.checkOutDate}
          />
        </div>
      </div>

      <CardDivider />

      {/* Details section */}
      <div className="grid grid-cols-[1.7fr_.65fr_.65fr] items-start gap-8 px-5 py-4 max-[900px]:grid-cols-1 max-[900px]:gap-4">
        <div>
          <div className="flex items-center gap-1">
            <span className={textHotelName}>{booking.hotelName}</span>

            {booking.starRating
              ? Array.from({ length: booking.starRating }).map((_, i) => (
                  <img
                    key={i}
                    src={FilledStar}
                    alt="star"
                    className="h-3 w-3"
                  />
                ))
              : null}
          </div>

          <div className={`mt-1.5 ${textAddress}`}>{booking.address}</div>
        </div>

        <div>
          <div className={`mb-1.5 ${textLabel}`}>Rooms</div>
          <div className={textValue}>{booking.roomLabel || "—"}</div>
        </div>

        <div>
          <div className={`mb-1.5 ${textLabel}`}>Booking ref. number</div>
          <div className={`break-all ${textValue}`}>
            {booking.bookingRef || "—"}
          </div>
        </div>
      </div>

      {booking.cancellationDeadline &&
        booking.status === "Confirmed" &&
        !isCancelled && (
          <>
            <CardDivider />
            <div className="px-5 py-3">
              <div className={textDate}>
                <span className="font-semibold text-[#0A0C0F]">
                  Free cancellation until:
                </span>{" "}
                {booking.cancellationDeadline}
              </div>
            </div>
          </>
        )}

      {isPending ? (
        <>
          <CardDivider />

          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 max-[640px]:flex-col max-[640px]:items-stretch">
            <div className={`flex flex-wrap items-center gap-2 ${textValue}`}>
              {countdown.hours !== "00" && (
                <>
                  <span className="rounded-lg bg-[#FFB8C4] px-2 py-1 text-[#EA0029]">
                    {countdown.hours}
                  </span>
                  <span className="text-[#EA0029]">:</span>
                </>
              )}

              <span className="rounded-lg bg-[#FFB8C4] px-2 py-1 text-[#EA0029]">
                {countdown.mins}
              </span>

              <span className="text-[#EA0029]">:</span>

              <span className="rounded-lg bg-[#FFB8C4] px-2 py-1 text-[#EA0029]">
                {countdown.secs}
              </span>

              <span className="ml-2 text-[#3D495C]">
                Until your booking expires
              </span>
            </div>

            <Button
              type="button"
              className={`text-[#F2F2F3] ${textBtn} max-[640px]:w-full`}
              style={{
                background:
                  "linear-gradient(91.86deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
                minWidth: "unset",
                borderRadius: "100px",
                padding: "10px 28px",
              }}
              overrideClasses
            >
              Pay now
            </Button>
          </div>
        </>
      ) : null}

      <CardDivider />

      {/* Actions */}
      <div className="flex items-center justify-between px-5 py-3 max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-3">
        <div className="flex flex-wrap items-center divide-x divide-[#E4E4E7] gap-0 max-[768px]:divide-x-0 max-[768px]:gap-4">
          {isCancelled && (
            <>
              <span className={`pr-4 text-[#3D495C] ${textStatusMsg}`}>
                This reservation was cancelled.
              </span>

              <Link
                to="/customer-support"
                className={`${actionLinkClass} px-4`}
              >
                Contact support
              </Link>
            </>
          )}

          {booking.status === "Confirmed" && !isCancelled && (
            <>
              <Link
                to="/hotel-booking-detail"
                onClick={markExpectMyBookingsQueryRestore}
                state={{
                  bookingReferenceId: booking.bookingRef,
                  searchKey: booking.searchKey || booking.bookingRef,
                  bookingKey: booking.bookingKey || booking.id,
                  myBookingsSearch,
                }}
                className={`${actionLinkClass} pr-4`}
              >
                View details
              </Link>

              <button
                type="button"
                className={`${actionLinkClass} border-0 bg-transparent px-4 text-left font-inherit`}
                onClick={() =>
                  onRequestReceiptPdf({
                    bookingReferenceId: booking.bookingRef,
                    searchKey: booking.searchKey || booking.bookingRef,
                    bookingKey: booking.bookingKey || booking.id,
                  })
                }
              >
                Download receipt
              </button>

              <Link
                to="/customer-support"
                className={`${actionLinkClass} px-4`}
              >
                Request changes
              </Link>

              <Link
                to="/hotel-cancellation"
                onClick={markExpectMyBookingsQueryRestore}
                state={{
                  bookingReferenceId: booking.bookingRef,
                  hotelName: booking.hotelName,
                  bookingKey: booking.bookingKey || booking.id,
                  cancellationDeadline: booking.cancellationDeadline,
                  cancellationDeadlineDate: booking.cancellationDeadlineDate,
                  totalPaid: booking.totalPaid,
                  currency: booking.currency,
                  myBookingsSearch,
                }}
                className={`${actionLinkClass} pl-4 text-[#FF5270]`}
              >
                Cancel booking
              </Link>
            </>
          )}

          {booking.status !== "Confirmed" && !isCancelled && (
            <Link
              to="/hotel-booking-detail"
              onClick={markExpectMyBookingsQueryRestore}
              state={{
                bookingReferenceId: booking.bookingRef,
                searchKey: booking.searchKey || booking.bookingRef,
                bookingKey: booking.bookingKey || booking.id,
                myBookingsSearch,
              }}
              className={actionLinkClass}
            >
              View details
            </Link>
          )}

          {isExpired && !isCancelled && (
            <span className={`pl-4 text-[#C2CAD6] ${textStatusMsg}`}>
              This booking has expired!
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShareModalOpen(true)}
          className={`${actionLinkClass} border-none bg-transparent p-0 max-[768px]:self-end`}
        >
          Share
        </button>
      </div>

      {shareModalOpen && (
        <ShareTicketModal
          closeModal={() => setShareModalOpen(false)}
          mode="hotel"
          cardTitle={booking.hotelName}
          cardSubtitle={booking.address}
          shareUrl={`${window.location.origin}/my-bookings?ref=${booking.bookingRef}`}
          bookingRef={booking.bookingRef}
        />
      )}
    </div>
  );
}

export default function UserHotelBookingsListing({
  filterStatus,
  bookings = [],
  searchQuery = "",
  dateFrom = "",
  dateTo = "",
}: {
  filterStatus: "All" | BookingStatus;
  bookings?: HotelBookingCardItem[];
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const [searchParams] = useSearchParams();
  const [receiptDownload, setReceiptDownload] =
    useState<HotelListDownloadParams | null>(null);

  const handleReceiptDownloadComplete = useCallback(() => {
    setReceiptDownload(null);
  }, []);

  const myBookingsSearch = useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `?${qs}` : "?mode=hotels&status=all";
  }, [searchParams]);

  const list = useMemo(() => {
    if (!bookings || !Array.isArray(bookings) || bookings.length === 0)
      return [];

    let rows =
      filterStatus === "All"
        ? bookings
        : bookings.filter((b) => b?.status === filterStatus);

    rows = rows.filter(
      (b) =>
        hotelBookingMatchesQuery(b, searchQuery) &&
        hotelBookingInDateRange(b, dateFrom, dateTo),
    );

    return rows;
  }, [bookings, filterStatus, searchQuery, dateFrom, dateTo]);

  if (!list.length) {
    return (
      <div
        className={`${FIGMA_INTER} mt-6 rounded-xl border border-dashed border-[#E4E4E7] bg-white p-8 text-center text-[14px] font-medium leading-normal tracking-normal text-[#3D495C]`}
      >
        No hotel bookings found.
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 flex flex-col items-center space-y-6">
        {list.map((b) => (
          <div key={b.id} className="w-full max-w-[1168px]">
            <HotelBookingCard
              booking={b}
              myBookingsSearch={myBookingsSearch}
              onRequestReceiptPdf={setReceiptDownload}
            />
          </div>
        ))}
      </div>

      {receiptDownload ? (
        <HotelBookingETicketSetion
          listDownload={receiptDownload}
          onListDownloadComplete={handleReceiptDownloadComplete}
        />
      ) : null}
    </>
  );
}
