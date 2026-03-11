import { useMemo, useEffect, useState } from "react";
import Button from "../atoms/Button";

export type BookingStatus = "Confirmed" | "Pending" | "Expired";

type HotelBookingCardItem = {
  id: string;
  status: BookingStatus;
  hotelName: string;
  address: string;
  checkInTime: string;
  checkInDate: string;
  checkOutTime: string;
  checkOutDate: string;
  totalStay: string;
  roomLabel: string;
  bookingRef: string;
  countdown?: {
    hours: string;
    mins: string;
    secs: string;
  };
};

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
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-10 px-2">
      <div className="text-left">
        <div className="text-[14px] font-semibold text-[#0A0C0F] mb-3">
          Check-in
        </div>
        <div className="text-[13px] font-medium text-[#0A0C0F] leading-none">
          {checkInTime}
        </div>
        <div className="text-[10px] text-[#3D495C] mt-2">{checkInDate}</div>
      </div>

      <div className="flex flex-col items-center justify-center pt-7">
        <div className="text-[9px] text-[#3D495C] mb-1">{totalStay}</div>
        <div className="relative h-[1px] w-[158px] rounded-full bg-[#A7C0EC]">
          <span className="absolute -top-[3px] left-0 h-[7px] w-[7px] rounded-full bg-[#2351A3]" />
          <span className="absolute -top-[3px] right-0 h-[7px] w-[7px] rounded-full bg-[#2351A3]" />
        </div>
      </div>

      <div className="text-left">
        <div className="text-[14px] font-semibold text-[#0A0C0F] mb-3">
          Check-out
        </div>
        <div className="text-[13px] font-medium text-[#0A0C0F] leading-none">
          {checkOutTime}
        </div>
        <div className="text-[10px] text-[#3D495C] mt-2">{checkOutDate}</div>
      </div>
    </div>
  );
}

function HotelBookingCard({ booking }: { booking: HotelBookingCardItem }) {
  const isPending = booking.status === "Pending";
  const isExpired = booking.status === "Expired";
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
        "relative rounded-[16px] border border-[#E4E4E7] bg-white overflow-hidden transition",
        isExpired ? "opacity-50 [filter:grayscale(100%)]" : "",
      ].join(" ")}
      style={{
        maxWidth: "1168px",
        width: "100%",
      }}
    >
      <div className="absolute right-4 top-4 z-10">
        <StatusPill status={booking.status} />
      </div>

      <div className="px-4 pt-10 pb-4">
        <StayTimeline
          checkInTime={booking.checkInTime}
          checkOutTime={booking.checkOutTime}
          totalStay={booking.totalStay}
          checkInDate={booking.checkInDate}
          checkOutDate={booking.checkOutDate}
        />
      </div>

      <CardDivider />

      <div className="px-4 py-3 grid grid-cols-[1.5fr_.6fr_.45fr] gap-6 items-start">
        <div>
          <div className="text-[14px] font-medium text-[#0A0C0F] leading-none">
            {booking.hotelName}
          </div>
          <div className="text-[10px] text-[#3D495C] mt-2 leading-[14px]">
            {booking.address}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-[#3D495C] mb-1">Rooms</div>
          <div className="text-[14px] font-medium text-[#0A0C0F] leading-none">
            {booking.roomLabel}
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

      {(isPending || isExpired) && <CardDivider />}

      {isPending && (
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#3D495C]">
            <span className="rounded-[6px] bg-[#FFB8C4] px-1.5 py-1 font-mono text-[#EA0029] text-[12px] leading-none">
              {countdown.hours}
            </span>
            <span className="rounded-[6px] bg-[#FFB8C4] px-1.5 py-1 font-mono text-[#EA0029] text-[12px] leading-none">
              {countdown.mins}
            </span>
            <span className="rounded-[6px] bg-[#FFB8C4] px-1.5 py-1 font-mono text-[#EA0029] text-[12px] leading-none">
              {countdown.secs}
            </span>
            <span>Until your booking expires</span>
          </div>

          <Button
            type="button"
            className="text-[#F2F2F3] text-[14px] font-semibold"
            style={{
              background:
                "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
              width: "126px",
              height: "37px",
              borderRadius: "100px",
            }}
            overrideClasses
          >
            Pay now
          </Button>
        </div>
      )}

      {isExpired && (
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="text-[13px] font-medium text-[#3D495C]">
            This booking has expired!
          </div>

          <Button
            type="button"
            disabled
            className="text-[#F2F2F3] text-[14px] font-semibold opacity-50 cursor-not-allowed"
            style={{
              background: "#2351A3",
              width: "109px",
              height: "37px",
              borderRadius: "100px",
            }}
            overrideClasses
          >
            Pay now
          </Button>
        </div>
      )}

      <CardDivider />

      <div className="px-4 py-3 flex items-center justify-between text-[13px] font-medium">
        <div className="flex flex-wrap items-center divide-x divide-[#E4E4E7]">
          {booking.status === "Confirmed" && (
            <>
              <Button
                type="button"
                className="pr-4 text-[#5383DA] hover:underline"
                overrideClasses
              >
                View details
              </Button>
              <Button
                type="button"
                className="px-4 text-[#5383DA] hover:underline"
                overrideClasses
              >
                Download receipt
              </Button>
              <Button
                type="button"
                className="px-4 text-[#5383DA] hover:underline"
                overrideClasses
              >
                Request changes
              </Button>
              <Button
                type="button"
                className="pl-4 text-[#EA0029] hover:underline"
                overrideClasses
              >
                Cancel booking
              </Button>
            </>
          )}

          {booking.status !== "Confirmed" && (
            <Button
              type="button"
              className="text-[#5383DA] hover:underline"
              overrideClasses
            >
              View details
            </Button>
          )}
        </div>

        <Button
          type="button"
          className="text-[#5383DA] hover:underline"
          overrideClasses
        >
          Share
        </Button>
      </div>
    </div>
  );
}

const staticHotelBookings: HotelBookingCardItem[] = [
  {
    id: "hotel-confirmed-1",
    status: "Confirmed",
    hotelName: "The Nishat Hotel",
    address: "Abdul Haque Road, Johar Town, 54600 Lahore, Pakistan",
    checkInTime: "2:00 PM – 12:00 AM",
    checkInDate: "Fri, 22 August 2025",
    checkOutTime: "2:00 PM – 12:00 AM",
    checkOutDate: "Fri, 22 August 2025",
    totalStay: "Total stay: 1 night",
    roomLabel: "01, Royal Deluxe",
    bookingRef: "6DFFX8901HAE",
  },
  {
    id: "hotel-pending-1",
    status: "Pending",
    hotelName: "The Nishat Hotel",
    address: "Abdul Haque Road, Johar Town, 54600 Lahore, Pakistan",
    checkInTime: "2:00 PM – 12:00 AM",
    checkInDate: "Fri, 22 August 2025",
    checkOutTime: "2:00 PM – 12:00 AM",
    checkOutDate: "Fri, 22 August 2025",
    totalStay: "Total stay: 1 night",
    roomLabel: "02, Superior Rooms",
    bookingRef: "6DFFX8901HAE",
    countdown: {
      hours: "00",
      mins: "35",
      secs: "49",
    },
  },
  {
    id: "hotel-expired-1",
    status: "Expired",
    hotelName: "The Nishat Hotel",
    address: "Abdul Haque Road, Johar Town, 54600 Lahore, Pakistan",
    checkInTime: "2:00 PM – 12:00 AM",
    checkInDate: "Fri, 22 August 2025",
    checkOutTime: "2:00 PM – 12:00 AM",
    checkOutDate: "Fri, 22 August 2025",
    totalStay: "Total stay: 1 night",
    roomLabel: "02, Superior Rooms",
    bookingRef: "6DFFX8901HAE",
  },
];

export default function UserHotelBookingsListing({
  filterStatus,
}: {
  filterStatus: "All" | BookingStatus;
}) {
  const list = useMemo(() => {
    if (filterStatus === "All") return staticHotelBookings;
    return staticHotelBookings.filter((b) => b.status === filterStatus);
  }, [filterStatus]);

  if (!list.length) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-[#E4E4E7] bg-white p-8 text-center text-[14px] text-[#3D495C]">
        No hotel bookings found.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4 flex flex-col items-center">
      {list.map((b) => (
        <div key={b.id} className="w-full max-w-[1168px]">
          <HotelBookingCard booking={b} />
        </div>
      ))}
    </div>
  );
}