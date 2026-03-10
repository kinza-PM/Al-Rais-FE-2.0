import { useMemo, useState } from "react";
import Button from "../atoms/Button";
import { generateMultiPagePDF } from "../../utils/pdfGenerator";
import toast from "react-hot-toast";
import Loader from "../atoms/Loader";
import { useHotelProxyImages } from "../../hooks/useHotelProxyImages";
import { useNavigate } from "react-router-dom";

type HotelBookingETicketSectionProps = {
  bookingResponse?: any;
  hotelDetail?: any;
};

export default function HotelBookingETicketSetion({
  bookingResponse,
  hotelDetail,
}: HotelBookingETicketSectionProps) {
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const bookingData = bookingResponse?.data?.[0];
  const hotel = bookingData?.hotel;
  const passengers = bookingData?.passengers ?? [];
  const rooms = hotel?.rooms ?? [];
  const currency = hotel?.currency ?? "AED";
  const totalNet = hotel?.totalNet ?? 0;
  const bookingRef = bookingData?.bookingReferenceId ?? "—";

  // Images — prebook room images ya hotelDetail images
  const displayImages = useMemo(() => {
    const roomImages = (rooms || [])
      .flatMap((r: any) => r.roomImages?.image ?? [])
      .map((img: any) => img.path)
      .filter(Boolean);
    const hotelImages =
      hotelDetail?.images?.map((img: any) => img.path).filter(Boolean) || [];
    return [...roomImages, ...hotelImages].slice(0, 5);
  }, [rooms, hotelDetail]);

  // React Query based image fetching — follows project pattern
  const { data: imageDataUrls = [], isLoading: imagesLoading } =
    useHotelProxyImages(displayImages);
  const imagesLoaded = !imagesLoading;

  // Fallback images
  // const imgSrc = (idx: number) => displayImages[idx] ?? "";
  // const imgSrc = (idx: number) => {
  //   const original = displayImages[idx];
  //   if (!original) return "";

  //   return `${IMAGE_PROXY_BASE}${encodeURIComponent(original)}`;
  // };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
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
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <div className="border-t border-dashed border-[#E4E4E7]" style={{ borderWidth: 1, marginTop: -10 }} />
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

  const TicketContent = () => {
    return (
      <>
        {displayImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2 auto-rows-fr">
            {imageDataUrls[0] && (
              <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl h-50">
                <img
                  src={imageDataUrls[0]}
                  alt="Hotel"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {[1, 2, 3, 4].map((i) =>
              imageDataUrls[i] ? (
                <div
                  key={i}
                  className="col-span-1 relative overflow-hidden rounded-2xl h-24"
                >
                  <img
                    src={imageDataUrls[i]}
                    alt="Hotel"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null,
            )}
          </div>
        )}

        <div className="flex flex-col items-center justify-center mt-10 text-[#0A0C0F] text-center">
          <h2 className="text-lg font-bold">Your Trip is Booked!</h2>
          <h5 className="text-sm mt-3">
            Your booking confirmation number is: <span className="font-semibold">{bookingRef}</span>
          </h5>
          <p className="text-[#3D495C] text-xs mt-5 mb-3">
            We've sent a copy of this receipt to your email address.
          </p>
        </div>

        <NotchDivider />

        <div>
          <h3 className="text-base font-bold text-[#0A0C0F]">
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

          <div
            className={`col-span-4 flex justify-center ${hotelDetail?.checkInTime && hotelDetail?.checkOutTime ? "mt-16" : "mt-8"}`}
          >
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

          <div className="col-span-4 text-right">
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

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#3D495C]">Subtotal</span>
            <span className="text-[15px] font-medium text-[#0A0C0F]">
              {currency} {totalNet.toFixed(2)}
            </span>
          </div>
          {taxTotal > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#3D495C]">Taxes and fees</span>
              <span className="text-[15px] font-medium text-[#0A0C0F]">
                {currency} {taxTotal.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#3D495C]">Total Paid</span>
            <span className="text-[15px] font-semibold text-[#0A0C0F]">
              {currency} {(totalNet + taxTotal).toFixed(2)}
            </span>
          </div>
        </div>
      </>
    );
  };

  return (
    <section className="mt-8 flex items-center justify-center px-4">
      <Loader
        show={!imagesLoaded}
        label="Please wait while we are retrieving the booking."
      />
      <div className="w-full max-w-[476px]">
        <div
          className="rounded-[16px] border bg-[#FFFFFF] px-2 pt-6 pb-6"
          style={{ borderWidth: 1, borderColor: "#C2CAD6" }}
        >
          <TicketContent />
          <NotchDivider />

          <div className="flex items-center justify-between gap-6">
            <Button
              type="button"
              overrideClasses
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF || !imagesLoaded}
              className="flex items-center justify-center gap-2.5 text-[#F2F2F3] border-0"
              style={{
                width: 222,
                height: 47,
                padding: "14px 40px",
                borderRadius: 100,
                background: "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
              }}
            >
              {isGeneratingPDF ? "Generating PDF..." : "Download as PDF"}
            </Button>
            <Button
              type="button"
              overrideClasses
              onClick={() => navigate("/my-bookings")}
              className="flex items-center justify-center gap-2.5 bg-transparent border-0 text-[#5383DA] hover:underline"
              style={{
                width: 225,
                height: 47,
                // padding: "14px 40px",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 16,
                lineHeight: "100%",
                letterSpacing: "0.5px",
                textAlign: "center",
              }}
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
            width: "576px",
            overflow: "visible",
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <div
            id="hotel-ticket-content-clone"
            className="rounded-[16px] border bg-[#FFFFFF] px-2 pt-6 pb-6"
            style={{ borderWidth: 1, borderColor: "#C2CAD6" }}
          >
            <TicketContent />
            <NotchDivider />
            <div className="flex items-center justify-between gap-6">
              <span
                className="flex items-center justify-center gap-2.5 text-[#F2F2F3]"
                style={{
                  width: 222,
                  height: 47,
                  padding: "14px 40px",
                  borderRadius: 100,
                  background: "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
                }}
              >
                Download as PDF
              </span>
              <span
                className="flex items-center justify-center"
                style={{
                  width: 225,
                  height: 47,
                  padding: "14px 40px",
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: 16,
                  lineHeight: "100%",
                  letterSpacing: "0.5px",
                  textAlign: "center",
                  color: "#5383DA",
                }}
              >
                Manage bookings
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
