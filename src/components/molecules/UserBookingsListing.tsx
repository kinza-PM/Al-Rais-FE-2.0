import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../atoms/Button";
import ShareTicketModal from "../atoms/ShareTicketModal";
import { transformBookingToFlightBookingFormat } from "../../utils/transformBookingData";

export type BookingStatus = "Confirmed" | "Pending" | "Expired";
export type TripMode = "Flights" | "Hotels";

function StatusPill({ status }: { status: BookingStatus }) {
  const cfg =
    status === "Confirmed"
      ? { bg: "bg-[#85FFCA]", text: "text-[#00522E]" }
      : status === "Pending"
        ? { bg: "bg-[#FFB8C4]", text: "text-[#EA0029]" }
        : { bg: "bg-[#E4E4E7]", text: "text-[#3D495C]" };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-[12px] ${cfg.bg} ${cfg.text}`}
    >
      {status === "Pending" ? "Pending payment" : status}
    </span>
  );
}

function CardDivider() {
  return <div className="-mx-5 h-px bg-[#E4E4E7] max-[768px]:-mx-4" />;
}

// Flight timeline for single journey - shows dots with duration above for multiple segments
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

  return (
    <div className="flex flex-col items-center mb-2">
      <div className="relative w-[440px] max-w-[72vw] max-[768px]:w-full max-[768px]:max-w-full mb-1 flex items-center justify-between">
        {segments.slice(1).map((segment, idx) => {
          const layoverTime = segment.layoverTime || "";
          const position = ((idx + 1) / segments.length) * 100;

          return (
            <div
              key={idx}
              className="absolute flex flex-col items-center"
              style={{
                left: `${position}%`,
                transform: "translateX(-50%)",
              }}
            >
              {layoverTime && (
                <>
                  <span className="text-[10px] text-[#3D495C] mb-0.5 whitespace-nowrap">
                    {layoverTime}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#2351A3] mb-2" />
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="relative h-[1px] w-[440px] max-w-[72vw] rounded-full bg-[#A7C0EC] max-[768px]:w-full max-[768px]:max-w-full">
        <span className="absolute -top-[5px] left-0 h-2.5 w-2.5 rounded-full bg-[#2351A3]" />
        <span className="absolute -top-[5px] right-0 h-2.5 w-2.5 rounded-full bg-[#2351A3]" />
      </div>

      {segments.length > 2 && (
        <div className="relative w-[440px] max-w-[72vw] max-[768px]:w-full max-[768px]:max-w-full mt-1">
          {segments.slice(1, -1).map((segment, idx) => {
            const stopAirport = segment.departureAirportCode || "";
            const position = ((idx + 1) / segments.length) * 100;

            return (
              <div
                key={idx}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${position}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {stopAirport && (
                  <span className="text-[10px] text-[#3D495C] whitespace-nowrap">
                    {stopAirport}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
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
            className={`text-[15px] font-medium text-[#0A0C0F] ${journey.segments.length > 1 ? "relative bottom-3" : ""}`}
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

function BookingCard({ booking }: { booking: any }) {
  const status = booking.status;
  const isExpired = status === "Expired";
  const journeys = booking.journeys || [];
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
        "relative rounded-2xl border border-[#E4E4E7] bg-white px-5 pb-4 pt-4 shadow-sm transition max-[768px]:pt-8",
        isExpired ? "opacity-50 [filter:grayscale(100%)]" : "",
      ].join(" ")}
    >
      <div className="absolute right-4 top-2">
        <StatusPill status={status} />
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
            className="rounded-lg bg-[#2351A3] px-8 py-2 text-[#F2F2F3] text-[15px] font-semibold"
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
            className="rounded-lg bg-[#2351A3] px-8 py-2 text-[#F2F2F3] text-[15px] font-semibold"
            overrideClasses
          >
            Pay now
          </Button>
        </div>
      )}

      <CardDivider />

      <div className="mt-6 flex items-center text-[15px] font-medium">
        <div className="flex flex-wrap items-center divide-x divide-[#E4E4E7]">
          {/* <div className="pr-4">
            <Button
              type="button"
              className="text-[#5383DA] hover:underline"
              overrideClasses
            >
              View details
            </Button>
          </div> */}
          {status === "Confirmed" && (
            <>
              <div className="">
                <Button
                  type="button"
                  className="text-[#5383DA] hover:underline"
                  overrideClasses
                >
                  Download e-ticket
                </Button>
              </div>
              {/* <div className="px-4">
                <Button
                  type="button"
                  className="text-[#5383DA] hover:underline"
                  overrideClasses
                >
                  Request changes
                </Button>
              </div>
              <div className="pl-4">
                <Button
                  type="button"
                  className="text-[#FF5270] hover:underline"
                  overrideClasses
                >
                  Cancel booking
                </Button>
              </div> */}
            </>
          )}
        </div>

        {status === "Confirmed" && (
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
    // Filter by status
    if (filterStatus === "All") return bookings;
    return bookings.filter((b) => b.status === filterStatus);
  }, [bookings, filterStatus, mode]);

  if (!list.length || mode === "Hotels") {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-[#E4E4E7] bg-white p-8 text-center text-[14px] text-[#3D495C]">
        No bookings found.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {list.map((b) => (
        <BookingCard key={b.id} booking={b} />
      ))}
    </div>
  );
}
