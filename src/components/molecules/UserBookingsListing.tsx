import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../atoms/Button";
import ShareTicketModal from "../atoms/ShareTicketModal";
import { transformBookingToFlightBookingFormat } from "../../utils/transformBookingData";
import airlineDefault from "../../assets/images/emirates.png";

export type BookingStatus = "Confirmed" | "Pending" | "Expired" | "Cancelled";
export type TripMode = "Flights" | "Hotels";

function StatusPill({ status }: { status: BookingStatus }) {
  if (status === "Cancelled") {
    return (
      <span
        className="inline-flex items-center justify-center text-[12px] font-medium text-[#9A3412]"
        style={{
          background: "#FFEDD5",
          lineHeight: "15px",
          minWidth: "90px",
          height: "31px",
          borderRadius: "100px",
          padding: "8px 15px",
          gap: "10px",
        }}
      >
        Cancelled
      </span>
    );
  }

  if (status === "Confirmed") {
    return (
      <span
        className="inline-flex items-center justify-center text-[12px] font-normal text-white"
        style={{
          background: "#85FFCA",
          lineHeight: "15px",
          width: "90px",
          height: "31px",
          borderRadius: "100px",
          padding: "8px 15px",
          gap: "10px",
          color: "black",
        }}
      >
        Confirmed
      </span>
    );
  }

  if (status === "Pending") {
    return (
      <span
        className="inline-flex items-center justify-center text-[12px] font-normal text-[#EA0029]"
        style={{
          background: "#FFB8C4",
          width: "129px",
          height: "31px",
          borderRadius: "100px",
          padding: "8px 15px",
          gap: "10px",
        }}
      >
        Pending payment
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center text-[12px] font-normal text-[#3D495C]"
      style={{
        background: "#E4E4E7",
        width: "73px",
        height: "31px",
        borderRadius: "100px",
        padding: "8px 15px",
        gap: "10px",
      }}
    >
      Expired
    </span>
  );
}

function CardDivider() {
  return <div className="-mx-5 h-px bg-[#E4E4E7] max-[768px]:-mx-4" />;
}

// Flight timeline for single journey - shows segment durations and layovers for multi-stop
function FlightTimeline({ segments }: { segments: any[] }) {
  const hasMultipleSegments = segments.length > 1;

  if (!hasMultipleSegments) {
    // Direct flight - show duration
    const duration = segments[0]?.duration || "";
    return (
      <div className="flex flex-col items-center mb-2">
        {duration && (
          <span className="text-[10px] text-[#3D495C] mb-1">
            Duration {duration}
          </span>
        )}
        <div className="relative h-[1px] w-[440px] max-w-[72vw] rounded-full bg-[#A7C0EC] max-[768px]:w-full max-[768px]:max-w-full">
          <span className="absolute -top-[5px] left-0 h-2.5 w-2.5 rounded-full bg-[#2351A3]" />
          <span className="absolute -top-[5px] right-0 h-2.5 w-2.5 rounded-full bg-[#2351A3]" />
        </div>
        <span className="text-[11px] text-[#3D495C]">Direct</span>
      </div>
    );
  }

  // Multi-segment: above line = each leg duration (departure→stop, stop→arrival); below line at each stop = layover + airport
  const lineClass =
    "relative h-[1px] w-[440px] max-w-[72vw] rounded-full bg-[#A7C0EC] max-[768px]:w-full max-[768px]:max-w-full";
  const n = segments.length;

  return (
    <div className="flex flex-col items-center mb-2">
      {/* Above line: each segment duration centred between consecutive dots */}
      <div
        className="relative w-[440px] max-w-[72vw] max-[768px]:w-full max-[768px]:max-w-full mb-1"
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
                <span className="text-[10px] text-[#3D495C] whitespace-nowrap">
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
        className="relative w-[440px] max-w-[72vw] max-[768px]:w-full max-[768px]:max-w-full mt-1"
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
                <span className="text-[9px] text-[#3D495C] whitespace-nowrap text-center">
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
  return (
    <>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-8 max-[768px]:grid-cols-[.5fr_auto_.5fr]">
        <div className="text-end mt-4">
          <div className="text-[15px] font-medium text-[#0A0C0F]">
            {journey.from.time}
          </div>
          <div className="text-[12px] text-[#3D495C]">
            {journey.from.dateLabel}
          </div>
        </div>

        <div className="text-center">
          <div
            className={`text-[15px] font-medium text-[#0A0C0F] ${journey.segments.length > 1 ? "relative" : ""}`}
          >
            {journey.from.code} <span className="mx-2">→</span>{" "}
            {journey.to.code}
          </div>

          <div className="mt-1">
            <FlightTimeline segments={journey.segments} />
          </div>
        </div>

        <div className="text-start mt-4">
          <div className="text-[15px] font-medium text-[#0A0C0F]">
            {journey.to.time}
          </div>
          <div className="text-[13px] text-[#3D495C]">
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

  const handlePayNow = () => {
    // Transform booking to FlightBooking format
    const flightBookingData = transformBookingToFlightBookingFormat(booking);
    if (flightBookingData) {
      navigate("/flight-booking", {
        state: flightBookingData,
      });
    }
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

  return (
    <div
      className={[
        "relative rounded-[16px] border-[1.5px] px-6 pb-4 pt-6 shadow-sm transition max-w-[1168px] w-full",
        isExpired || isCancelled
          ? "opacity-50 [filter:grayscale(100%)]"
          : "",
        isPending ? "bg-white" : "bg-[#F2F2F3]",
      ].join(" ")}
      style={{
        borderColor: "#E4E4E7",
        minHeight: "229px",
        width: "1168px",
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

      <div className="absolute right-4 top-2">
        <StatusPill status={status as BookingStatus} />
      </div>

      {/* Render all journeys in the same card */}
      {journeys.map((journey: any, idx: number) => (
        <FlightJourneyCard
          key={journey.journeyIndex}
          journey={journey}
          isLast={idx === journeys.length - 1}
        />
      ))}

      <CardDivider />

      <div className="mt-2 mb-2 flex items-start justify-between gap-4 max-[768px]:flex-col">
        {/* Airline info from first journey */}
        {journeys.length > 0 && (
          <div className="flex items-center gap-3">
            {/* Airline logo/profile */}
            <div className="flex-shrink-0">
              <img
                src={airlineDefault}
                alt={journeys[0].airline?.name || "Airline"}
                className="h-12 w-12 rounded-full object-cover"
              />
            </div>

            <div>
              <div className="text-[15px] font-medium text-[#0A0C0F]">
                {journeys[0].airline?.name ?? "Airline"}
              </div>
              <div className="text-[12px] text-[#3D495C]">
                {journeys[0].airline?.code} {journeys[0].airline?.flightNo}{" "}
                {journeys[0].airline?.cabin
                  ? ` - ${journeys[0].airline.cabin}`
                  : null}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-20">
          <div className="text-[#3D495C] text-[13px]">Passengers</div>
          {booking.bookingRef ? (
            <div className="text-[#3D495C] text-[13px]">
              Booking ref. number
            </div>
          ) : (
            <div></div>
          )}
          <div className="text-[#0A0C0F] font-medium text-[15px]">
            {booking.passengersLabel}
          </div>
          {booking.bookingRef && (
            <div className="text-[#0A0C0F] font-medium text-[15px]">
              {booking.bookingRef}
            </div>
          )}
        </div>
      </div>

      <CardDivider />

      {status === "Pending" && countdown && (
        <div className="mt-4 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-[14px] font-medium text-[#3D495C]">
            <span className="rounded-lg bg-[#FFB8C4] px-2 py-1 font-mono text-[#EA0029]">
              {countdown.hours}
            </span>{" "}
            :
            <span className="rounded-lg bg-[#FFB8C4] px-2 py-1 font-mono text-[#EA0029]">
              {countdown.mins}
            </span>{" "}
            :
            <span className="rounded-lg bg-[#FFB8C4] px-2 py-1 font-mono text-[#EA0029]">
              {countdown.secs}
            </span>
            <span>Until your booking expires</span>
          </div>
          <Button
            type="button"
            onClick={handlePayNow}
            className="text-[#F2F2F3] text-[15px] font-semibold"
            style={{
              background:
                "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
              width: "148px",
              height: "47px",
              borderRadius: "100px",
              padding: "14px 40px",
              gap: "10px",
            }}
            overrideClasses
          >
            Pay now
          </Button>
        </div>
      )}

      {status === "Expired" && (
        <div className="mt-4 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-[14px] font-medium text-[#3D495C]">
            <span>This booking has expired!</span>
          </div>
          <Button
            type="button"
            disabled={true}
            className="text-[#F2F2F3] text-[15px] font-semibold opacity-50 cursor-not-allowed"
            style={{
              background: "rgb(35, 81, 163)",
              width: "109px",
              height: "38px",
              borderRadius: "100px",
              // padding: "14px 40px",
              gap: "10px",
            }}
            overrideClasses
          >
            Pay now
          </Button>
        </div>
      )}

      {isCancelled && (
        <div className="mt-4 mb-4 flex flex-wrap items-center gap-4">
          <div className="text-[14px] font-medium text-[#3D495C]">
            This booking has been cancelled.
          </div>
        </div>
      )}

      <CardDivider />

      <div className="mt-6 flex items-center text-[15px] font-medium">
        <div className="flex flex-wrap items-center divide-x divide-[#E4E4E7]">
          {status === "Confirmed" && !isCancelled && (
            <>
              <div className="pr-4">
                <Button
                  type="button"
                  className="text-[#5383DA] hover:underline"
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
                    className="text-[#EA0029] hover:underline"
                    overrideClasses
                    onClick={() => {
                      const firstJourney = booking?.journeys?.[0];

                      const passengersCount =
                        booking?.originalApiItem?.request?.passengers
                          ?.length || 0;
                      const passengersLabel =
                        passengersCount > 0
                          ? `${passengersCount.toString().padStart(2, "0")} ${
                              passengersCount === 1 ? "Adult" : "Adults"
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

        {status === "Confirmed" && !isCancelled && (
          <div className="ml-auto flex items-center pl-4">
            <Button
              type="button"
              className="text-[#5383DA] hover:underline"
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
          bookingRef={booking.bookingRef || "N/A"}
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
}: {
  bookings: any[];
  filterStatus: "All" | BookingStatus;
  mode: TripMode;
}) {
  const list = useMemo(() => {
    if (filterStatus === "All") return bookings;
    return bookings.filter(
      (b) => normalizeFlightBookingStatus(b.status) === filterStatus,
    );
  }, [bookings, filterStatus, mode]);

  if (!list.length || mode === "Hotels") {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-[#E4E4E7] bg-white p-8 text-center text-[14px] text-[#3D495C]">
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
