import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../atoms/Button";
import ShareTicketModal from "../atoms/ShareTicketModal";
import { transformBookingToFlightBookingFormat } from "../../utils/transformBookingData";
import { buildTripShapeForFlightSummaryFromBookingApi } from "../../utils/helpers";
import { markExpectMyBookingsQueryRestore } from "../../utils/myBookingsUrl";
import {
  flightBookingInDateRange,
  flightBookingMatchesQuery,
} from "../../utils/myBookingsClientFilters";
import airlineDefault from "../../assets/images/emirates.png";

export type BookingStatus = "Confirmed" | "Pending" | "Expired" | "Cancelled";
export type TripMode = "Flights" | "Hotels";

/** Figma 5099:16949 — Inter + design text styles (line-height 100% on single-line tokens). */
const FIGMA_INTER = "font-[Inter,sans-serif] antialiased";
const textXs400 = `${FIGMA_INTER} text-[12px] font-normal leading-none tracking-normal`;
const textSm500 = `${FIGMA_INTER} text-[14px] font-medium leading-none tracking-normal`;
const textBase500 = `${FIGMA_INTER} text-[16px] font-medium leading-none tracking-normal`;
const textBase500Relaxed = `${FIGMA_INTER} text-[16px] font-medium leading-normal tracking-normal`;
const textBtn = `${FIGMA_INTER} text-[16px] font-semibold leading-none tracking-[0.5px]`;

export function StatusPill({ status }: { status: BookingStatus }) {
  /** My Bookings status chips — Figma: Text/Extra Small/400 (12 Regular). */
  const pillBase = `inline-flex h-[31px] shrink-0 items-center justify-center whitespace-nowrap rounded-full px-[15px] py-[8px] ${textXs400}`;

  if (status === "Cancelled") {
    return (
      <span
        className={`${pillBase} min-w-[90px] bg-[#FFEDD5] text-[#9A3412]`}
      >
        Cancelled
      </span>
    );
  }

  if (status === "Confirmed") {
    return (
      <span className={`${pillBase} w-[90px] bg-[#85FFCA] text-[#00522E]`}>
        Confirmed
      </span>
    );
  }

  if (status === "Pending") {
    return (
      <span
        className={`${pillBase} max-w-[calc(100vw-2rem)] bg-[#FFB8C4] text-[#EA0029]`}
      >
        Pending payment
      </span>
    );
  }

  return (
    <span className={`${pillBase} w-[73px] bg-[#E4E4E7] text-[#3D495C]`}>
      Expired
    </span>
  );
}

/**
 * Flight / Hotel category chip — Figma: white fill, 1.5px border primary-brand-200 (#5383DA),
 * label 12px regular primary-brand-300 (#2351A3). Node 9453:8373 / 9453:8359.
 */
export function TripCategoryPill({ label }: { label: "Flight" | "Hotel" }) {
  return (
    <span
      className={`inline-flex h-[31px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-solid border-[#5383DA] bg-white px-[15px] py-[8px] text-[#2351A3] ${textXs400}`}
      role="img"
      aria-label={label}
    >
      {label}
    </span>
  );
}

function CardDivider() {
  return <div className="-mx-6 h-px bg-[#E4E4E7] max-[768px]:-mx-4" />;
}

// Flight timeline for single journey - shows segment durations and layovers for multi-stop
function FlightTimeline({
  segments,
  formattedJourneyDuration,
}: {
  segments: any[];
  /** Whole-journey duration copy (e.g. "03 hours 15 minutes") — Figma node 5099:16949. */
  formattedJourneyDuration?: string;
}) {
  const hasMultipleSegments = segments.length > 1;

  if (!hasMultipleSegments) {
    // Direct flight - show duration
    const duration =
      (formattedJourneyDuration && String(formattedJourneyDuration).trim()) ||
      segments[0]?.duration ||
      "";
    return (
      <div className="mb-0 flex flex-col items-center">
        {duration && (
          <span className={`mb-0.5 text-[#3D495C] ${textXs400}`}>
            Duration: {duration}
          </span>
        )}
        <div className="relative h-px w-[352px] max-w-[min(352px,72vw)] rounded-full bg-[#A7C0EC] max-[768px]:w-full max-[768px]:max-w-full">
          <span className="absolute -top-[5px] left-0 h-2.5 w-2.5 rounded-full bg-[#2351A3]" />
          <span className="absolute -top-[5px] right-0 h-2.5 w-2.5 rounded-full bg-[#2351A3]" />
        </div>
        <span className={`mt-0.5 text-[#3D495C] ${textXs400}`}>Direct</span>
      </div>
    );
  }

  // Multi-segment: above line = each leg duration (departure→stop, stop→arrival); below line at each stop = layover + airport
  const lineClass =
    "relative h-px w-[352px] max-w-[min(352px,72vw)] rounded-full bg-[#A7C0EC] max-[768px]:w-full max-[768px]:max-w-full";
  const n = segments.length;

  return (
    <div className="mb-0 flex flex-col items-center">
      {/* Above line: each segment duration centred between consecutive dots */}
      <div
        className="relative mb-0.5 w-[352px] max-w-[min(352px,72vw)] max-[768px]:w-full max-[768px]:max-w-full"
        style={{ height: "18px" }}
      >
        {segments.map((segment, idx) => {
          const duration = segment.duration || "";
          const startPct = (idx / n) * 100;
          const endPct = ((idx + 1) / n) * 100;
          return (
            <div
              key={idx}
              className="absolute flex justify-center top-0"
              style={{
                left: `${startPct}%`,
                width: `${endPct - startPct}%`,
              }}
            >
              {duration && (
                <span className={`whitespace-nowrap text-[#3D495C] ${textXs400}`}>
                  {duration}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Horizontal line with dots at start, each stop, and end */}
      <div className={lineClass}>
        <span className="absolute -top-[5px] left-0 h-2.5 w-2.5 rounded-full bg-[#2351A3]" />
        {segments.slice(1).map((_, idx) => {
          const position = ((idx + 1) / n) * 100;
          return (
            <span
              key={idx}
              className="absolute -top-[5px] h-2.5 w-2.5 rounded-full bg-[#2351A3]"
              style={{ left: `${position}%`, transform: "translateX(-50%)" }}
            />
          );
        })}
        <span className="absolute -top-[5px] right-0 h-2.5 w-2.5 rounded-full bg-[#2351A3]" />
      </div>

      {/* Below line: at each stop dot show layover + airport */}
      <div
        className="relative mt-0.5 w-[352px] max-w-[min(352px,72vw)] max-[768px]:w-full max-[768px]:max-w-full"
        style={{ height: "16px" }}
      >
        {segments.slice(1).map((segment, idx) => {
          const layoverTime = segment.layoverTime || "";
          const stopAirport = segment.departureAirportCode || "";
          const position = ((idx + 1) / n) * 100;
          return (
            <div
              key={idx}
              className="absolute flex flex-col items-center bottom-7 -translate-x-1/4"
              style={{ left: `${position}%` }}
            >
              {(layoverTime || stopAirport) && (
                <span
                  className={`whitespace-nowrap text-center text-[#3D495C] ${textXs400}`}
                >
                  {layoverTime && stopAirport
                    ? `${stopAirport} (${layoverTime})`
                    : layoverTime || stopAirport}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Single flight journey card
function FlightJourneyCard({
  journey,
  isLast: _isLast,
}: {
  journey: any;
  isLast: boolean;
}) {
  const fromCity = (journey.from?.city as string | undefined)?.trim();
  const toCity = (journey.to?.city as string | undefined)?.trim();
  const fromRoute =
    fromCity && journey.from?.code
      ? `${fromCity} (${journey.from.code})`
      : journey.from?.code ?? "";
  const toRoute =
    toCity && journey.to?.code
      ? `${toCity} (${journey.to.code})`
      : journey.to?.code ?? "";

  return (
    <>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 max-[768px]:grid-cols-[.5fr_auto_.5fr] max-[768px]:gap-2">
        <div className="mt-2 text-end">
          <div className={`text-[#0A0C0F] ${textBase500}`}>{journey.from.time}</div>
          <div className={`mt-0.5 text-[#3D495C] ${textXs400}`}>
            {journey.from.dateLabel}
          </div>
        </div>

        <div className="text-center">
          <div
            className={`flex items-center justify-center gap-4 text-[#0A0C0F] max-[768px]:gap-2 max-[768px]:text-[14px] max-[768px]:font-medium ${textBase500} ${journey.segments.length > 1 ? "relative" : ""}`}
          >
            <span className="whitespace-nowrap">{fromRoute}</span>
            <span className="shrink-0" aria-hidden="true">
              →
            </span>
            <span className="whitespace-nowrap">{toRoute}</span>
          </div>

          <div className="mt-1.5">
            <FlightTimeline
              segments={journey.segments}
              formattedJourneyDuration={journey.durationLabel}
            />
          </div>
        </div>

        <div className="mt-2 text-start">
          <div className={`text-[#0A0C0F] ${textBase500}`}>{journey.to.time}</div>
          <div className={`mt-0.5 text-[#3D495C] ${textXs400}`}>
            {journey.to.dateLabel}
          </div>
        </div>
      </div>

      {/* {!isLast && <CardDivider />} */}
    </>
  );
}

function getPassengerNameFromBooking(booking: any): string {
  const p = booking?.originalApiItem?.request?.passengers?.[0];
  if (!p?.passengerInfo) return "Valued Customer";
  const title = p.passengerInfo?.nameTitle || "";
  const given = p.passengerInfo?.givenName || "";
  const surname = p.passengerInfo?.surname || "";
  const name = `${title} ${given} ${surname}`.trim();
  return name || "Valued Customer";
}

function getFlightCancellationNavigationState(booking: any) {
  const api = booking?.originalApiItem;
  const bookingReferenceId = String(api?.bookingReferenceId ?? "").trim();
  const supplierLocator = String(api?.detail?.supplierLocator ?? "").trim();
  const rawIssueDate = booking?.createdAt || "";
  let issueDate = "";
  if (rawIssueDate) {
    const d = new Date(rawIssueDate);
    issueDate = Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleDateString("en-GB");
  }
  const hasRequiredCancellationFields =
    !!bookingReferenceId && !!supplierLocator && !!issueDate;

  const currencyCode =
    api?.fare?.currencyCode ?? booking?.price?.currencyCode ?? "USD";
  const totalAmount = Number(
    api?.fare?.totalFare ?? booking?.price?.totalFare ?? 0,
  );

  return {
    bookingReferenceId,
    supplierLocator,
    issueDate,
    hasRequiredCancellationFields,
    currencyCode,
    totalAmount,
    bookingPassengers: api?.request?.passengers ?? [],
  };
}

function normalizeFlightBookingStatus(raw: unknown): BookingStatus {
  if (typeof raw !== "string") return raw as BookingStatus;
  const s = raw.trim().toLowerCase();
  if (s === "cancelled" || s === "canceled") return "Cancelled";
  if (s === "confirmed" || s === "completed" || s === "active")
    return "Confirmed";
  if (s === "pending") return "Pending";
  if (s === "expired") return "Expired";
  return raw as BookingStatus;
}

function BookingCard({ booking }: { booking: any }) {
  const status = normalizeFlightBookingStatus(booking.status);
  const isExpired = status === "Expired";
  const isCancelled = status === "Cancelled";
  const isPending = status === "Pending";
  const journeys = booking.journeys || [];
  const cancellationNav = useMemo(
    () => getFlightCancellationNavigationState(booking),
    [booking],
  );
  const [countdown, setCountdown] = useState(booking.countdown);
  const [openShareModal, setOpenShareModal] = useState(false);
  const navigate = useNavigate();

  const goToFlightBookingFromCard = () => {
    const flightBookingData = transformBookingToFlightBookingFormat(booking);
    if (flightBookingData) {
      navigate("/flight-booking", { state: flightBookingData });
    }
  };

  const openViewDetails = () => {
    markExpectMyBookingsQueryRestore();
    navigate("/flight-booking-detail", { state: { booking } });
  };

  const handlePayNow = () => {
    goToFlightBookingFromCard();
  };

  // Update countdown in real-time for pending bookings
  useEffect(() => {
    if (status !== "Pending" || !booking.createdAt) return;

    const updateCountdown = () => {
      const createdTime = new Date(booking.createdAt).getTime();
      const currentTime = new Date().getTime();
      const elapsedMs = currentTime - createdTime;

      // Total booking time is 15 minutes (900000 ms)
      const totalMs = 15 * 60 * 1000;
      const remainingMs = Math.max(0, totalMs - elapsedMs);

      if (remainingMs <= 0) {
        setCountdown({ hours: "00", mins: "00", secs: "00" });
        return;
      }

      const remainingMinutes = Math.floor(remainingMs / 60000);
      const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);

      const hours = Math.floor(remainingMinutes / 60);
      const mins = remainingMinutes % 60;
      const secs = remainingSeconds;

      setCountdown({
        hours: String(hours).padStart(2, "0"),
        mins: String(mins).padStart(2, "0"),
        secs: String(secs).padStart(2, "0"),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [status, booking.createdAt]);

  const bookingRefDisplay =
    booking.bookingRef && String(booking.bookingRef).trim()
      ? String(booking.bookingRef).trim()
      : "—";

  const cabinRaw = journeys[0]?.airline?.cabin;
  const cabinLine =
    cabinRaw && String(cabinRaw).trim()
      ? /\bclass\b/i.test(String(cabinRaw))
        ? String(cabinRaw).trim()
        : `${String(cabinRaw).trim()} class`
      : "";

  const footerMuted =
    isExpired || isCancelled
      ? "text-[#C2CAD6]"
      : "text-[#5383DA] hover:underline";

  return (
    <div
      className={[
        `${FIGMA_INTER} relative w-full max-w-[1168px] rounded-[16px] border-[1.5px] px-6 pb-3 pt-12 shadow-sm transition`,
        isExpired || isCancelled
          ? "opacity-50 [filter:grayscale(100%)]"
          : "",
        isExpired ? "bg-[#F2F2F3]" : "bg-white",
      ].join(" ")}
      style={{
        borderColor: "#E4E4E7",
        width: "100%",
        maxWidth: "1168px",
        borderRadius: "16px",
        borderWidth: "1.5px",
      }}
    >
      {/* Gradient bar at the top of the card */}
      <div
        className="flex justify-center w-full absolute top-0 left-0"
        style={{ marginTop: "0px" }}
      >
        <div
          className="rounded-tl-[16px] rounded-tr-[16px]"
          aria-hidden="true"
          style={
            {
              // width: "1168px",
              // maxWidth: "100%",
              // height: "10px",
              // background: "linear-gradient(rgb(196, 207, 225) 0%, rgb(222, 247, 254) 100%)",
              // backdropFilter: "blur(10px)"
            }
          }
        />
      </div>

      <div className="absolute right-6 top-4 z-10 flex flex-wrap items-center justify-end gap-2 sm:right-6 sm:top-4">
        <TripCategoryPill label="Flight" />
        <StatusPill status={status as BookingStatus} />
      </div>

      {/* Render all journeys in the same card */}
      <div className="pb-4 max-[768px]:pb-3">
        {journeys.map((journey: any, idx: number) => (
          <FlightJourneyCard
            key={journey.journeyIndex}
            journey={journey}
            isLast={idx === journeys.length - 1}
          />
        ))}
      </div>

      <CardDivider />

      <div className="flex items-start justify-between gap-8 py-3 max-[768px]:flex-col max-[768px]:gap-5">
        {/* Airline info from first journey */}
        {journeys.length > 0 && (
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full">
              <img
                src={airlineDefault}
                alt={journeys[0].airline?.name || "Airline"}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className={`text-[#0A0C0F] ${textBase500}`}>
                {journeys[0].airline?.name ?? "Airline"}
              </div>
              <div className={`mt-0.5 text-[#3D495C] ${textXs400}`}>
                {journeys[0].airline?.code} {journeys[0].airline?.flightNo}
                {cabinLine ? ` - ${cabinLine}` : ""}
              </div>
            </div>
          </div>
        )}

        <div className="flex shrink-0 gap-12 max-[768px]:w-full max-[768px]:justify-between sm:gap-16">
          <div className="text-end sm:text-start">
            <div className={`text-[#3D495C] ${textSm500}`}>Passengers</div>
            <div className={`mt-1 text-[#0A0C0F] ${textBase500Relaxed}`}>
              {booking.passengersLabel}
            </div>
          </div>
          <div className="text-end">
            <div className={`text-[#3D495C] ${textSm500}`}>Booking ref. number</div>
            <div
              className={`mt-1 max-w-[220px] break-all text-[#0A0C0F] max-[768px]:max-w-none ${textBase500Relaxed}`}
            >
              {bookingRefDisplay}
            </div>
          </div>
        </div>
      </div>

      {status === "Pending" && countdown ? (
        <>
          <CardDivider />
          <div className="flex flex-wrap items-center justify-between gap-4 py-3">
            <div
              className={`flex flex-wrap items-center gap-1.5 text-[#3D495C] ${textBase500Relaxed}`}
            >
              {countdown.hours !== "00" && (
                <>
                  <span
                    className={`rounded-lg bg-[#FFB8C4] p-[5px] text-[#EA0029] ${textBase500}`}
                  >
                    {countdown.hours}
                  </span>
                  <span className={`text-[#EA0029] ${textBase500}`}>:</span>
                </>
              )}
              <span
                className={`rounded-lg bg-[#FFB8C4] p-[5px] text-[#EA0029] ${textBase500}`}
              >
                {countdown.mins}
              </span>
              <span className={`text-[#EA0029] ${textBase500}`}>:</span>
              <span
                className={`rounded-lg bg-[#FFB8C4] p-[5px] text-[#EA0029] ${textBase500}`}
              >
                {countdown.secs}
              </span>
              <span className={`ml-1 text-[#3D495C] ${textBase500Relaxed}`}>
                Until your booking expires
              </span>
            </div>
            <Button
              type="button"
              onClick={handlePayNow}
              className={`text-[#F2F2F3] ${textBtn}`}
              style={{
                background:
                  "linear-gradient(91.86deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
                minWidth: "148px",
                borderRadius: "100px",
                padding: "14px 40px",
              }}
              overrideClasses
            >
              Pay now
            </Button>
          </div>
        </>
      ) : null}

      <CardDivider />

      <div
        className={`mt-2 flex flex-wrap items-center justify-between gap-4 pb-2 pt-3 ${textBase500Relaxed}`}
      >
        <div className="flex flex-wrap items-center divide-x divide-[#E4E4E7]">
          {isExpired && (
            <div className={`pr-4 text-[#C2CAD6] ${textBase500Relaxed}`}>
              This booking has expired!
            </div>
          )}
          {isCancelled && (
            <div className={`pr-4 text-[#3D495C] ${textBase500Relaxed}`}>
              This booking has been cancelled.
            </div>
          )}
          {(isPending || isExpired || (status === "Confirmed" && !isCancelled)) && (
            <div className={isExpired ? "px-4" : "pr-4"}>
              <Button
                type="button"
                className={`${footerMuted} ${FIGMA_INTER} text-[16px] font-medium leading-normal tracking-normal`}
                overrideClasses
                onClick={openViewDetails}
              >
                View details
              </Button>
            </div>
          )}
          {status === "Confirmed" && !isCancelled && (
            <>
              <div className="px-4">
                <Button
                  type="button"
                  className={`${FIGMA_INTER} text-[16px] font-medium leading-normal tracking-normal text-[#5383DA] hover:underline`}
                  overrideClasses
                  onClick={async () => {
                    if (!booking.ticketImage) return;
                    try {
                      const res = await fetch(booking.ticketImage, {
                        mode: "cors",
                      });
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `e-ticket-${booking.bookingRef || "ticket"}.pdf`;
                      a.click();
                      URL.revokeObjectURL(url);
                    } catch {
                      window.open(booking.ticketImage, "_blank");
                    }
                  }}
                >
                  Download e-ticket
                </Button>
              </div>

              {cancellationNav.hasRequiredCancellationFields && (
                <div className="px-4">
                  <Button
                    type="button"
                    className={`${FIGMA_INTER} text-[16px] font-medium leading-normal tracking-normal text-[#EA0029] hover:underline`}
                    overrideClasses
                    onClick={() => {
                      const firstJourney = booking?.journeys?.[0];

                      const passengersCount =
                        booking?.originalApiItem?.request?.passengers
                          ?.length || 0;
                      const passengersLabel =
                        passengersCount > 0
                          ? `${passengersCount.toString().padStart(2, "0")} ${passengersCount === 1 ? "Adult" : "Adults"
                          }`
                          : booking?.passengersLabel || "";

                      navigate("/flight-cancellation", {
                        state: {
                          bookingReferenceId: cancellationNav.bookingReferenceId,
                          supplierLocator: cancellationNav.supplierLocator,
                          issueDate: cancellationNav.issueDate,
                          bookingId: booking?.offerId || booking?.id || "",
                          offerId:
                            booking?.originalApiItem?.offerId ??
                            booking?.offerId ??
                            "",
                          fareRulesDetails:
                            booking?.originalApiItem?.fareRulesDetails ??
                            null,
                          airlineName: firstJourney?.airline?.name || "Airline",
                          routeLabel: firstJourney
                            ? `${firstJourney?.from?.code || ""} → ${firstJourney?.to?.code || ""}`
                            : "Flight booking",
                          passengersLabel,
                          totalAmount: cancellationNav.totalAmount,
                          currencyCode: cancellationNav.currencyCode,
                          bookingPassengers: cancellationNav.bookingPassengers,
                          tripForSummary:
                            buildTripShapeForFlightSummaryFromBookingApi(
                              booking?.originalApiItem,
                            ),
                          displayBookingRef:
                            booking?.bookingRef ??
                            cancellationNav.bookingReferenceId ??
                            "",
                        },
                      });
                    }}
                  >
                    Cancel booking
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {(isPending ||
          isExpired ||
          (status === "Confirmed" && !isCancelled)) && (
          <div className="flex items-center sm:ml-auto">
            <Button
              type="button"
              className={`${footerMuted} ${FIGMA_INTER} text-[16px] font-medium leading-normal tracking-normal`}
              overrideClasses
              onClick={() => setOpenShareModal(true)}
            >
              Share
            </Button>
          </div>
        )}
      </div>

      {openShareModal && (
        <ShareTicketModal
          closeModal={() => setOpenShareModal(false)}
          bookingRef={bookingRefDisplay === "—" ? "N/A" : bookingRefDisplay}
          passengerName={getPassengerNameFromBooking(booking)}
          ticketPdfUrl={booking.ticketImage ?? undefined}
          showPrint={false}
        />
      )}
    </div>
  );
}

export default function UserBookingsListing({
  bookings,
  filterStatus,
  mode,
  searchQuery = "",
  dateFrom = "",
  dateTo = "",
}: {
  bookings: any[];
  filterStatus: "All" | BookingStatus;
  mode: TripMode;
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const list = useMemo(() => {
    let rows = bookings;
    if (filterStatus !== "All") {
      rows = rows.filter(
        (b) => normalizeFlightBookingStatus(b.status) === filterStatus,
      );
    }
    rows = rows.filter(
      (b) =>
        flightBookingMatchesQuery(b, searchQuery) &&
        flightBookingInDateRange(b, dateFrom, dateTo),
    );
    return rows;
  }, [bookings, filterStatus, mode, searchQuery, dateFrom, dateTo]);

  if (!list.length || mode === "Hotels") {
    return (
      <div
        className={`mt-6 rounded-xl border border-dashed border-[#E4E4E7] bg-white p-8 text-center text-[14px] font-medium leading-normal tracking-normal text-[#3D495C] ${FIGMA_INTER}`}
      >
        No bookings found.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6 flex flex-col items-center">
      {list.map((b) => (
        <div key={b.id} className="w-full max-w-[1168px]">
          <BookingCard booking={b} />
        </div>
      ))}
    </div>
  );
}
