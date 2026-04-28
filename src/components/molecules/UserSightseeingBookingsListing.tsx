import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ShareTicketModal from "../atoms/ShareTicketModal";
import { SightseeingTicketPdfContent } from "./sightseeing/SightseeingTicketPdfContent";
import type { SightseeingBookingCardItem } from "../../utils/transformBookingData";
import {
  sightseeingBookingInDateRange,
  sightseeingBookingMatchesQuery,
} from "../../utils/myBookingsClientFilters";
import type { BookingStatus } from "./UserBookingsListing";
import { generateMultiPagePDF } from "../../utils/pdfGenerator";
import {
  leadGuestDisplayFromCard,
  sightseeingCardToBookingSummary,
} from "../../utils/sightseeingVoucherFromCard";
import { readSightseeingCardPreview } from "../../features/sightseeing/sightseeingBooking";

const actionLinkClass =
  "text-[13px] font-medium text-[#5383DA] hover:underline cursor-pointer whitespace-nowrap";

function StatusPill({ status }: { status: BookingStatus }) {
  if (status === "Cancelled") {
    return (
      <span
        className="inline-flex items-center justify-center px-3 text-[11px] font-semibold text-[#9A3412]"
        style={{
          background: "#FFEDD5",
          minHeight: "28px",
          borderRadius: "100px",
        }}
      >
        Cancelled
      </span>
    );
  }

  if (status === "Confirmed") {
    return (
      <span
        className="inline-flex items-center justify-center px-3 text-[11px] font-semibold text-[#065F46]"
        style={{
          background: "#D1FAE5",
          minHeight: "28px",
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
        className="inline-flex max-w-[calc(100vw-2rem)] items-center justify-center whitespace-nowrap rounded-full bg-[#FFE4E6] px-4 py-2 text-center text-[12px] font-medium leading-none text-[#B91C1C]"
      >
        Pending payment
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center px-3 text-[11px] font-semibold text-[#3D495C]"
      style={{
        background: "#E4E4E7",
        minHeight: "28px",
        borderRadius: "100px",
      }}
    >
      Expired
    </span>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-normal leading-tight text-[#64748B] mb-1">
        {label}
      </div>
      <div className="text-[13px] font-semibold text-[#0A0C0F] leading-snug break-words">
        {value}
      </div>
    </div>
  );
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

function SightseeingBookingCard({
  booking,
  onRequestVoucherPdf,
  voucherPdfBusyId,
}: {
  booking: SightseeingBookingCardItem;
  onRequestVoucherPdf: (b: SightseeingBookingCardItem) => void;
  voucherPdfBusyId: string | null;
}) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const isConfirmed = booking.status === "Confirmed";
  const isExpired = booking.status === "Expired";
  const isCancelled = booking.status === "Cancelled";
  const detailPath = booking.activityCode
    ? `/sightseeing-detail/${encodeURIComponent(booking.activityCode)}`
    : "/search-sightseeing";

  const cardPreview = booking.activityCode
    ? readSightseeingCardPreview(booking.activityCode)
    : undefined;

  const pickupLine = [
    booking.tourDateDisplay && booking.tourDateDisplay !== "—"
      ? booking.tourDateDisplay
      : null,
    booking.pickupTimeDisplay && booking.pickupTimeDisplay !== "—"
      ? booking.pickupTimeDisplay
      : null,
  ]
    .filter(Boolean)
    .join(" • ");

  const activityTimeLine =
    booking.activityDurationDisplay?.trim() ||
    cardPreview?.durationLabel?.trim() ||
    "—";

  const packageLine =
    booking.packageSummary && booking.packageSummary !== "—"
      ? booking.packageSummary
      : "—";

  const showPrimaryActions = !isCancelled;
  const canCancel =
    isConfirmed &&
    !isCancelled &&
    !isExpired;
  const voucherGenerating = voucherPdfBusyId === booking.id;

  return (
    <div
      className={[
        "relative rounded-[16px] border border-[#E4E4E7] bg-white overflow-hidden transition shadow-sm",
        isExpired || isCancelled ? "opacity-65 [filter:grayscale(70%)]" : "",
      ].join(" ")}
      style={{ maxWidth: "1168px", width: "100%" }}
    >
      {/* Title + status pill (Pending / Confirmed / etc.) on the right */}
      <div className="px-4 sm:px-5 pt-5 pb-4 border-b border-[#E4E4E7]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <h3 className="text-[16px] sm:text-[17px] font-bold text-[#0A0C0F] leading-snug tracking-tight">
              {booking.activityTitle}
            </h3>
          </div>
          <div className="shrink-0 flex justify-end sm:justify-end sm:pt-0.5">
            <StatusPill status={booking.status} />
          </div>
        </div>
      </div>

      {/* Details grid — Figma five columns on large screens */}
      <div className="px-4 sm:px-5 py-4 border-b border-[#E4E4E7]">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-5">
          <DetailField label="Package" value={packageLine} />
          <DetailField
            label="Pickup date & time"
            value={pickupLine || "—"}
          />
          <DetailField label="Activity time" value={activityTimeLine} />
          <DetailField
            label="Travelers"
            value={booking.travellersSummary || "—"}
          />
          <DetailField
            label="Booking ref. number"
            value={
              <span className="break-all font-semibold">{booking.bookingRef}</span>
            }
          />
        </div>

        {booking.totalPaid != null && booking.totalPaid > 0 && (
          <p className="mt-4 text-[12px] text-[#64748B]">
            <span className="font-semibold text-[#0A0C0F]">Total paid:</span>{" "}
            {formatMoney(booking.totalPaid, booking.currency)}
          </p>
        )}
      </div>

      {booking.cancellationDeadline && canCancel && (
        <div className="px-4 sm:px-5 py-3 border-b border-[#E4E4E7] bg-[#FAFAFA]/80">
          <p className="text-[12px] text-[#64748B]">
            <span className="font-semibold text-[#0A0C0F]">
              Free cancellation until:
            </span>{" "}
            {booking.cancellationDeadline}
          </p>
        </div>
      )}

      {/* Action row */}
      <div className="px-4 sm:px-5 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center divide-x divide-[#E4E4E7] gap-y-2">
          {isCancelled && (
            <>
              <span className="pr-3 sm:pr-4 text-[12px] text-[#64748B]">
                This activity booking was cancelled.
              </span>
              <Link
                to="/customer-support"
                className={`${actionLinkClass} pl-3 sm:pl-4`}
              >
                Contact support
              </Link>
            </>
          )}

          {showPrimaryActions && (
            <>
              <Link
                to={detailPath}
                state={booking.activityCode ? { context: {} } : undefined}
                className={`${actionLinkClass} pr-3 sm:pr-4`}
              >
                View details
              </Link>
              <button
                type="button"
                disabled={voucherPdfBusyId !== null}
                onClick={() => onRequestVoucherPdf(booking)}
                className={`${actionLinkClass} px-3 sm:px-4 bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {voucherGenerating ? "Generating…" : "Download Voucher"}
              </button>
              <Link
                to="/customer-support"
                className={`${actionLinkClass} px-3 sm:px-4`}
              >
                Request changes
              </Link>
              {canCancel ? (
                (() => {
                  const pastDeadline =
                    booking.cancellationDeadlineDate &&
                    !Number.isNaN(
                      Date.parse(booking.cancellationDeadlineDate),
                    ) &&
                    Date.now() > Date.parse(booking.cancellationDeadlineDate);
                  if (pastDeadline) {
                    return (
                      <Tooltip title="This booking can't be cancelled">
                        <span className="inline-flex items-center pl-3 sm:pl-4 cursor-not-allowed text-[#98A4B3]">
                          <span className="font-medium text-[13px]">
                            Cancel booking
                          </span>
                          <InfoCircleOutlined
                            className="ml-1 text-[#98A4B3]"
                            style={{ fontSize: 14 }}
                          />
                        </span>
                      </Tooltip>
                    );
                  }
                  return (
                    <Link
                      to="/sightseeing-cancellation"
                      state={{
                        bookingReferenceId: booking.bookingRef,
                        activityTitle: booking.activityTitle,
                        bookingKey: booking.bookingKey || booking.id,
                        clientReference: booking.clientReference,
                        cancellationDeadline: booking.cancellationDeadline,
                        cancellationDeadlineDate:
                          booking.cancellationDeadlineDate,
                        totalPaid: booking.totalPaid,
                        nonRefundableFees: booking.nonRefundableFees,
                        cancellationPenalty: booking.cancellationPenalty,
                        currency: booking.currency,
                        tourDateDisplay: booking.tourDateDisplay,
                        pickupTimeDisplay: booking.pickupTimeDisplay,
                        travellersSummary: booking.travellersSummary,
                        packageSummary: booking.packageSummary,
                        activityDurationDisplay:
                          booking.activityDurationDisplay,
                        locationLine:
                          booking.locationLabel?.trim() ||
                          booking.countryLabel?.trim() ||
                          "",
                        bookingStatus: booking.status,
                        activityCode: booking.activityCode,
                      }}
                      className={`${actionLinkClass} pl-3 sm:pl-4 text-[#EA0029]`}
                    >
                      Cancel booking
                    </Link>
                  );
                })()
              ) : null}
            </>
          )}
        </div>

        {showPrimaryActions ? (
          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className={`${actionLinkClass} bg-transparent border-none p-0 sm:ml-auto text-left sm:text-right`}
          >
            Share
          </button>
        ) : null}
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
  searchQuery = "",
  dateFrom = "",
  dateTo = "",
}: {
  filterStatus: "All" | BookingStatus;
  bookings?: SightseeingBookingCardItem[];
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const [pdfBooking, setPdfBooking] = useState<SightseeingBookingCardItem | null>(
    null,
  );

  const list = useMemo(() => {
    if (!bookings?.length) return [];
    let rows =
      filterStatus === "All"
        ? bookings
        : bookings.filter((b) => b?.status === filterStatus);
    rows = rows.filter(
      (b) =>
        sightseeingBookingMatchesQuery(b, searchQuery) &&
        sightseeingBookingInDateRange(b, dateFrom, dateTo),
    );
    return rows;
  }, [bookings, filterStatus, searchQuery, dateFrom, dateTo]);

  useEffect(() => {
    if (!pdfBooking) return;
    let cancelled = false;
    const run = async () => {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      try {
        await generateMultiPagePDF(
          ["#sightseeing-ticket-content-clone-mbl"],
          "sightseeing-ticket-pdf-mbl",
          `sightseeing-ticket-${(pdfBooking.bookingRef || "booking").replace(/[^a-zA-Z0-9._-]+/g, "_")}.pdf`,
        );
        if (!cancelled) toast.success("PDF downloaded successfully!");
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          toast.error("Failed to generate PDF. Please try again.");
        }
      } finally {
        if (!cancelled) setPdfBooking(null);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [pdfBooking]);

  if (!list.length) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-[#E4E4E7] bg-white p-8 text-center text-[14px] text-[#3D495C]">
        No sightseeing bookings found.
      </div>
    );
  }

  const voucherBusyId = pdfBooking?.id ?? null;

  return (
    <>
      <div className="mt-6 space-y-4 flex flex-col items-center">
        {list.map((b) => (
          <div key={b.id} className="w-full max-w-[1168px]">
            <SightseeingBookingCard
              booking={b}
              onRequestVoucherPdf={setPdfBooking}
              voucherPdfBusyId={voucherBusyId}
            />
          </div>
        ))}
      </div>

      {pdfBooking ? (
        <div
          id="sightseeing-ticket-pdf-mbl"
          aria-hidden
          style={{
            position: "fixed",
            left: "-20000px",
            top: 0,
            width: "576px",
            overflow: "visible",
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <div
            id="sightseeing-ticket-content-clone-mbl"
            className="rounded-[16px] border bg-[#FFFFFF] px-2 pt-6 pb-6 font-[Inter,sans-serif]"
            style={{ borderWidth: 1, borderColor: "#C2CAD6" }}
          >
            <SightseeingTicketPdfContent
              summary={sightseeingCardToBookingSummary(pdfBooking)}
              bookingReference={pdfBooking.bookingRef}
              clientReference={pdfBooking.clientReference}
              leadTravelerDisplayName={leadGuestDisplayFromCard(pdfBooking)}
              protectionChoice="none"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
