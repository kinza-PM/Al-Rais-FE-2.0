import { useMemo, useEffect, useState, useCallback } from "react";
// import { Tooltip } from "antd";
import Button from "../atoms/Button";
import { Link, useSearchParams } from "react-router-dom";
import ShareTicketModal from "../atoms/ShareTicketModal";
// import { InfoCircleOutlined } from "@ant-design/icons";
import type { HotelBookingCardItem } from "../../utils/transformBookingData";
import { markExpectMyBookingsQueryRestore } from "../../utils/myBookingsUrl";
import HotelBookingETicketSetion, {
  type HotelListDownloadParams,
} from "./HotelBookingETicketSetion";
import type { BookingStatus } from "./UserBookingsListing";
import FilledStar from "../../assets/svgs/filled_star.svg";

const actionLinkClass =
  "text-[13px] font-medium text-[#5383DA] hover:underline cursor-pointer whitespace-nowrap";

export type { BookingStatus };

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
      <div className="text-left ml-0 lg:ml-[347px]">
        <div className="text-[14px] font-semibold text-[#0A0C0F] mb-3">
          Check-in
        </div>
        {checkInTime && (
          <div className="text-[13px] font-medium text-[#0A0C0F] leading-none">
            {checkInTime}
          </div>
        )}
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
        {checkOutTime && (
          <div className="text-[13px] font-medium text-[#0A0C0F] leading-none">
            {checkOutTime}
          </div>
        )}
        <div className="text-[10px] text-[#3D495C] mt-2">{checkOutDate}</div>
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
  /** Query string including "?", e.g. "?mode=hotels&status=all" — restored on back / in-app navigation */
  myBookingsSearch: string;
  onRequestReceiptPdf: (params: HotelListDownloadParams) => void;
}) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
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
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[14px] font-medium text-[#0A0C0F] leading-none">
              {booking.hotelName}
            </span>
            {booking.starRating
              ? Array.from({ length: booking.starRating }).map((_, i) => (
                <img key={i} src={FilledStar} alt="star" className="w-3 h-3" />
              ))
              : null}
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

      {booking.cancellationDeadline && booking.status === "Confirmed" && (
        <>
          <CardDivider />
          <div className="px-4 py-3">
            <div className="text-[12px] text-[#3D495C]">
              <span className="font-semibold text-[#0A0C0F]">Free cancellation until:</span>{" "}
              {booking.cancellationDeadline}
            </div>
          </div>
        </>
      )}

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
        <div className="flex flex-wrap items-center divide-x divide-[#E4E4E7] gap-0">
          {booking.status === "Confirmed" && (
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
                className={`${actionLinkClass} px-4 bg-transparent border-0 p-0 font-inherit text-left`}
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
              {(() => {
                // const isPastCancellationDeadline =
                //   booking.cancellationDeadlineDate &&
                //   new Date() > new Date(booking.cancellationDeadlineDate);
                // if (isPastCancellationDeadline) {
                //   return (
                //     <Tooltip title="This booking can't be cancelled">
                //       <span className="inline-flex items-center pl-4 cursor-not-allowed text-[#98A4B3]">
                //         <span className="font-medium">Cancel booking</span>
                //         <InfoCircleOutlined
                //           className="ml-1 text-[#98A4B3]"
                //           style={{ fontSize: 14 }}
                //         />
                //       </span>
                //     </Tooltip>
                //   );
                // }
                return (
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
                    className={`${actionLinkClass} pl-4 text-[#EA0029]`}
                  >
                    Cancel booking
                  </Link>
                );
              })()}
            </>
          )}

          {booking.status !== "Confirmed" && (
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
}: {
  filterStatus: "All" | BookingStatus;
  bookings?: HotelBookingCardItem[];
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
    if (filterStatus === "All") return bookings;
    return bookings.filter((b) => b?.status === filterStatus);
  }, [bookings, filterStatus]);

  if (!list.length) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-[#E4E4E7] bg-white p-8 text-center text-[14px] text-[#3D495C]">
        No hotel bookings found.
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 space-y-4 flex flex-col items-center">
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