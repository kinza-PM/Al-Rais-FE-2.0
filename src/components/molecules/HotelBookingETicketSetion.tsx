import { useState } from "react";
import Button from "../atoms/Button";
import { generateMultiPagePDF } from "../../utils/pdfGenerator";
import toast from "react-hot-toast";
// import HotelImage1 from "../../assets/images/HotelImage1.png";
// import HotelImage2 from "../../assets/images/HotelImage2.png";
// import HotelImage3 from "../../assets/images/HotelImage3.png";
// import HotelImage4 from "../../assets/images/HotelImage4.png";

const IMAGE_PROXY_BASE =
  "https://hfus5c7uw2.execute-api.eu-west-1.amazonaws.com/dev/imageProxy?url=";
// const IMAGE_PROXY_BASE = "http://localhost:5000/image-proxy?url=";

type HotelBookingETicketSectionProps = {
  bookingResponse?: any;
  hotelDetail?: any;
};

export default function HotelBookingETicketSetion({
  bookingResponse,
  hotelDetail,
}: HotelBookingETicketSectionProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const bookingData = bookingResponse?.data?.[0];
  const hotel = bookingData?.hotel;
  const passengers = bookingData?.passengers ?? [];
  const rooms = hotel?.rooms ?? [];
  const currency = hotel?.currency ?? "AED";
  const totalNet = hotel?.totalNet ?? 0;
  const bookingRef = bookingData?.bookingReferenceId ?? "—";
  // const bookingStatus = bookingData?.bookingStatus ?? "—";

  // Images — prebook room images ya hotelDetail images
  const roomImages = rooms
    .flatMap((r: any) => r.roomImages?.image ?? [])
    .map((img: any) => img.path)
    .filter(Boolean);
  const hotelImages =
    hotelDetail?.images?.map((img: any) => img.path).filter(Boolean) ?? [];
  const displayImages = [...roomImages, ...hotelImages].slice(0, 5);

  // Fallback images
  // const imgSrc = (idx: number) => displayImages[idx] ?? "";
  const imgSrc = (idx: number) => {
    const original = displayImages[idx];
    if (!original) return "";

    return `${IMAGE_PROXY_BASE}${encodeURIComponent(original)}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return dateString ?? "—";
    }
  };

  const checkIn = hotel?.checkInDate;
  const checkOut = hotel?.checkOutDate;
  const totalNights = (() => {
    if (!checkIn || !checkOut) return 1;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.ceil(
      Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? diff : 1;
  })();

  const guestNames = passengers
    .map((p: any) =>
      `${p.passengerInfo?.givenName ?? ""} ${p.passengerInfo?.surname ?? ""}`.trim(),
    )
    .filter(Boolean)
    .join(", ");

  const adults = passengers.filter(
    (p: any) => (p.ptc ?? "").toUpperCase() === "ADT",
  ).length;
  const children = passengers.filter(
    (p: any) => (p.ptc ?? "").toUpperCase() === "CHD",
  ).length;

  const travelersText =
    [
      adults > 0
        ? `${String(adults).padStart(2, "0")} Adult${adults > 1 ? "s" : ""}`
        : "",
      children > 0
        ? `${String(children).padStart(2, "0")} Child${children > 1 ? "ren" : ""}`
        : "",
    ]
      .filter(Boolean)
      .join(", ") || "—";

  const taxes = rooms[0]?.roomRate?.taxes ?? [];
  const taxTotal = taxes.reduce(
    (sum: number, t: any) => sum + (t.included ? 0 : (t.amount ?? 0)),
    0,
  );

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateMultiPagePDF(
        ["#hotel-ticket-content-clone"],
        "hotel-ticket-pdf",
        `hotel-ticket-${bookingRef || "booking"}.pdf`,
      );
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const NotchDivider = () => (
    <div className="relative mt-7 mb-10">
      <div className="absolute inset-x-0 bottom-2">
        <div className="border-t border-dashed border-[#E4E4E7]" />
      </div>

      <span
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2"
        style={{ transform: "translate(-9px, -50%)" }}
      >
        <svg
          width="10"
          height="20"
          viewBox="0 0 10 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.5 0.512695C5.51429 0.772696 9.5 4.92101 9.5 10C9.5 15.079 5.51426 19.2263 0.5 19.4863V0.512695Z"
            fill="white"
            stroke="#C2CAD6"
          />
        </svg>
      </span>

      <span
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
        style={{ transform: "translate(9px, -50%)" }}
      >
        <svg
          width="10"
          height="20"
          viewBox="0 0 10 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.5 0.512695C4.48571 0.772696 0.5 4.92101 0.5 10C0.5 15.079 4.48574 19.2263 9.5 19.4863V0.512695Z"
            fill="white"
            stroke="#C2CAD6"
          />
        </svg>
      </span>
    </div>
  );

  const TicketContent = () => {
    return (
      <>
        {displayImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2 auto-rows-fr">
            <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl h-50">
              <img
                src={imgSrc(0)}
                alt="Hotel"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="col-span-1 relative overflow-hidden rounded-2xl h-24"
              >
                <img
                  src={imgSrc(i)}
                  alt="Hotel"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center justify-center mt-10 text-[#0A0C0F]">
          <h2 className="text-lg font-bold">Your Trip is Booked!</h2>
          <h5 className="text-sm mt-3">
            Your booking confirmation number is: {bookingRef}
          </h5>
          <p className="text-[#3D495C] text-xs mt-5 mb-3">
            We've sent a copy of this receipt to your email address.
          </p>
        </div>

        <NotchDivider />

        <div>
          <h3 className="text-base font-medium text-[#0A0C0F]">
            {hotel?.name ?? hotelDetail?.name ?? "Hotel"}
          </h3>
          <p className="text-xs text-[#3D495C]">
            {hotelDetail?.address
              ? `${hotelDetail.address}${hotelDetail.city ? `, ${hotelDetail.city}` : ""}${hotelDetail.country ? `, ${hotelDetail.country}` : ""}`
              : ""}
          </p>
        </div>

        <NotchDivider />

        <div className="grid grid-cols-12 items-start gap-4">
          <div className="col-span-4">
            <p className="text-lg font-semibold text-[#0A0C0F]">Check-in</p>
            <p
              className={`text-base font-medium text-[#0A0C0F] ${hotelDetail?.checkInTime ? "mt-4" : ""}`}
            >
              {hotelDetail?.checkInTime || ""}
            </p>
            <p className="text-xs text-[#3D495C] mt-1">{formatDate(checkIn)}</p>
          </div>

          <div className={`col-span-4 flex justify-center ${hotelDetail?.checkInTime && hotelDetail?.checkOutTime ? "mt-16" : "mt-8"}`}>
            <div className="FlightDirection">
              <div className="hotelVisualGuid">
                <div className="stopPoint"></div>

                <div className="stopsDetail">
                  <span className="mb-5">
                    Total stay: {totalNights}{" "}
                    {totalNights === 1 ? "night" : "nights"}
                  </span>
                </div>

                <div className="stopPoint"></div>
              </div>
            </div>
          </div>

          <div className="col-span-4 text-left">
            <p className="text-base font-semibold text-[#0A0C0F]">Check-out</p>
            <p
              className={`text-base font-medium text-[#0A0C0F] ${hotelDetail?.checkOutTime ? "mt-4" : ""}`}
            >
              {hotelDetail?.checkOutTime || ""}
            </p>
            <p className="text-xs text-[#3D495C] mt-1">
              {formatDate(checkOut)}
            </p>
          </div>
        </div>

        <NotchDivider />

        <div className="mt-4 mb-4 flex items-start justify-between gap-10">
          <div className="min-w-0">
            <div className="text-[13px] text-[#3D495C]">Guest name(s)</div>
            <div className="text-[15px] font-medium text-[#0A0C0F] break-words">
              {guestNames || "—"}
            </div>
          </div>

          {/* Fixed width blocks */}
          <div className="shrink-0">
            <div className="text-[13px] text-[#3D495C]">Travelers</div>
            <div className="text-[15px] font-medium text-[#0A0C0F]">
              {travelersText}
            </div>
          </div>

          <div className="shrink-0">
            <div className="text-[13px] text-[#3D495C]">Rooms</div>
            <div className="text-[15px] font-medium text-[#0A0C0F]">
              {String(rooms.length).padStart(2, "0")}
            </div>
          </div>
        </div>

        <NotchDivider />

        <div>
          {rooms.map((room: any, index: number) => (
            <div
              key={room.roomKey || index}
              className="mt-4 mb-4 flex items-center justify-between gap-10"
            >
              <div>
                <div className="text-[13px] text-[#3D495C]">Room type</div>
                <div className="text-[15px] font-medium text-[#0A0C0F]">
                  {room.roomTypeName || "—"}
                </div>
              </div>
              <div>
                <div className="text-[13px] text-[#3D495C]">
                  Your selected option
                </div>
                <div className="text-[15px] font-medium text-[#0A0C0F]">
                  {room.ratePlan?.meal || "Room Only"}
                </div>
              </div>
              <div>
                <div className="text-[13px] text-[#3D495C]">
                  Cancellation policy
                </div>
                <div className="text-[15px] font-medium text-[#0A0C0F]">
                  {room.ratePlan?.cancelPolicyIndicator || "—"}
                </div>
              </div>
            </div>
          ))}
        </div>

        <NotchDivider />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.4fr]">
          <div className="grid grid-cols-[1fr_auto] items-center gap-y-2">
            <div className="text-xs text-[#3D495C]">Subtotal</div>
            <div className="text-[15px] font-medium text-[#0A0C0F] text-right">
              {currency} {totalNet.toFixed(2)}
            </div>

            {taxTotal > 0 && (
              <>
                <div className="text-xs text-[#3D495C]">Taxes and fees</div>
                <div className="text-[15px] font-medium text-[#0A0C0F] text-right">
                  {currency} {taxTotal.toFixed(2)}
                </div>
              </>
            )}

            <div className="text-xs text-[#3D495C]">Total Paid</div>
            <div className="text-[15px] font-medium text-[#0A0C0F] text-right">
              {currency} {(totalNet + taxTotal).toFixed(2)}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <section className="mt-8 flex items-center justify-center px-4">
      <div className="w-full max-w-[580px]">
        <div className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm px-2 pt-2 pb-2">
          <TicketContent />
          <NotchDivider />

          <div className="pb-2 flex items-center justify-center gap-8">
            <Button
              type="button"
              overrideClasses
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="h-11 px-12 rounded-lg bg-[#2351A3] border border-[#2351A3] text-[#F2F2F3] text-[15px] font-semibold"
            >
              {isGeneratingPDF ? "Generating PDF..." : "Download as PDF"}
            </Button>
            <Button
              type="button"
              className="text-[15px] font-medium text-[#5383DA] hover:underline"
              overrideClasses
            >
              Manage bookings
            </Button>
          </div>
        </div>
        <div
          id="hotel-ticket-pdf"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-20000px",
            top: 0,
            width: "580px",
            overflow: "visible",
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <div
            id="hotel-ticket-content-clone"
            className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm px-2 pt-2 pb-2"
          >
            <TicketContent />
          </div>
        </div>
      </div>
    </section>
  );
}
