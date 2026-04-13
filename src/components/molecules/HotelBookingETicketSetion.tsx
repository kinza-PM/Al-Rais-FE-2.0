import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../atoms/Button";
import ShareTicketModal from "../atoms/ShareTicketModal";
import { generateMultiPagePDF } from "../../utils/pdfGenerator";
import toast from "react-hot-toast";
import Loader from "../atoms/Loader";
import { useHotelProxyImages } from "../../hooks/useHotelProxyImages";
import { useNavigate, useLocation } from "react-router-dom";
import { useHotelRetrieve } from "../../hooks/useHotelBooking";
import { extractErrorFromAxiosApiError } from "../../utils/apiErrorHanlder";
import { buildMyBookingsUrl } from "../../utils/myBookingsUrl";

export type HotelListDownloadParams = {
  bookingReferenceId: string;
  searchKey: string;
  bookingKey: string;
};

type HotelBookingETicketSectionProps = {
  bookingResponse?: any;
  hotelDetail?: any;
  /**
   * When set (e.g. from My Bookings list), only loads data off-screen and generates the same PDF as the receipt screen — no route change.
   */
  listDownload?: HotelListDownloadParams | null;
  onListDownloadComplete?: () => void;
};

export default function HotelBookingETicketSetion({
  bookingResponse,
  hotelDetail,
  listDownload = null,
  onListDownloadComplete,
}: HotelBookingETicketSectionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const myBookingsReturn =
    (location.state as { myBookingsSearch?: string } | null)
      ?.myBookingsSearch ?? null;

  const navigateToMyBookings = () => {
    if (myBookingsReturn) {
      navigate(`/my-bookings${myBookingsReturn}`);
      return;
    }
    navigate(buildMyBookingsUrl({ mode: "hotels", status: "all" }));
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [retrieveResponse, setRetrieveResponse] = useState<any>(null);
  const listDownloadGenRef = useRef(0);

  const { mutateAsync: retrieveHotelBookingAsync, isPending: isRetrieving } =
    useHotelRetrieve();

  const stateBookingReferenceId =
    listDownload?.bookingReferenceId ||
    location.state?.bookingReferenceId ||
    location.state?.bookingResponse?.data?.[0]?.bookingReferenceId ||
    "";

  const stateSearchKey =
    listDownload?.searchKey ||
    location.state?.searchKey ||
    location.state?.bookingResponse?.searchKey ||
    location.state?.bookingResponse?.data?.[0]?.searchKey ||
    "";

  const stateBookingKey =
    listDownload?.bookingKey ?? location.state?.bookingKey ?? "";

  const fallbackBookingReferenceId =
    bookingResponse?.data?.[0]?.bookingReferenceId || "";

  const fallbackSearchKey =
    bookingResponse?.searchKey || bookingResponse?.data?.[0]?.searchKey || "";

  const bookingReferenceId =
    stateBookingReferenceId || fallbackBookingReferenceId;

  const searchKey = stateSearchKey || fallbackSearchKey;

  useEffect(() => {
    const initRetrieve = async () => {
      if (!bookingReferenceId || !searchKey) {
        if (listDownload) {
          toast.error("Missing booking information for receipt download.");
          onListDownloadComplete?.();
        }
        return;
      }

      try {
        const resp = await retrieveHotelBookingAsync({
          productType: "H",
          bookingReferenceId,
          clientReferenceId: "",
          bookingKey: stateBookingKey || "",
          searchKey,
        });
        setRetrieveResponse(resp);
      } catch (error) {
        const err = extractErrorFromAxiosApiError(error);
        toast.error(err || "Failed to retrieve booking details");
        if (listDownload) {
          onListDownloadComplete?.();
        }
      }
    };

    initRetrieve();
  }, [
    bookingReferenceId,
    searchKey,
    stateBookingKey,
    retrieveHotelBookingAsync,
    listDownload,
    onListDownloadComplete,
  ]);

  const activeResponse = retrieveResponse || bookingResponse;
  const bookingData = activeResponse?.data?.[0];

  const hotel = bookingData?.hotel;
  const passengers = bookingData?.passengers ?? [];
  const rooms = hotel?.rooms ?? [];
  const currency = hotel?.currency ?? "AED";
  const totalNet = Number(hotel?.totalNet ?? 0);
  const bookingRef = bookingData?.bookingReferenceId ?? "—";

  const displayImages = useMemo(() => {
    const roomImages = (rooms || [])
      .flatMap((r: any) => r.roomImages?.image ?? [])
      .map((img: any) => img.path)
      .filter(Boolean);

    const hotelImages =
      hotelDetail?.images?.map((img: any) => img.path).filter(Boolean) || [];

    return [...roomImages, ...hotelImages].slice(0, 5);
  }, [rooms, hotelDetail]);

  const { data: imageDataUrls = [], isLoading: imagesLoading } =
    useHotelProxyImages(displayImages);

  const imagesLoaded = !imagesLoading;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]
        } ${date.getFullYear()}`;
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
      `${p.passengerInfo?.givenName ?? ""} ${p.passengerInfo?.surname ?? ""
        }`.trim(),
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
        ? `${String(children).padStart(2, "0")} Child${children > 1 ? "ren" : ""
        }`
        : "",
    ]
      .filter(Boolean)
      .join(", ") || "—";

  const taxes = rooms[0]?.roomRate?.taxes ?? [];
  const taxTotal = taxes.reduce(
    (sum: number, t: any) => sum + (t.included ? 0 : (t.amount ?? 0)),
    0,
  );

  const totalPaid = totalNet + taxTotal;

  const hotelCardTitle = hotel?.name ?? hotelDetail?.name ?? "Hotel";
  const hotelCardSubtitle = useMemo(() => {
    if (hotelDetail?.address) {
      return [
        hotelDetail.address,
        hotelDetail.city,
        hotelDetail.country,
      ]
        .filter(Boolean)
        .join(", ");
    }
    return (hotel as any)?.address ?? "";
  }, [hotel, hotelDetail]);

  const shareBookingUrl = useMemo(() => {
    if (typeof window === "undefined" || !bookingRef || bookingRef === "—") {
      return "";
    }
    return `${window.location.origin}/my-bookings?ref=${encodeURIComponent(bookingRef)}`;
  }, [bookingRef]);

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

  useEffect(() => {
    if (!listDownload) {
      listDownloadGenRef.current += 1;
      return;
    }
    if (isRetrieving || !imagesLoaded || !bookingData) return;

    const gen = ++listDownloadGenRef.current;

    (async () => {
      try {
        await generateMultiPagePDF(
          ["#hotel-ticket-content-clone"],
          "hotel-ticket-pdf",
          `hotel-ticket-${bookingRef || "booking"}.pdf`,
        );
        if (listDownloadGenRef.current === gen) {
          toast.success("PDF downloaded successfully!");
        }
      } catch (error) {
        console.error("Error generating PDF:", error);
        if (listDownloadGenRef.current === gen) {
          toast.error("Failed to generate PDF. Please try again.");
        }
      } finally {
        if (listDownloadGenRef.current === gen) {
          onListDownloadComplete?.();
        }
      }
    })();
  }, [
    listDownload,
    isRetrieving,
    imagesLoaded,
    bookingData,
    bookingRef,
    onListDownloadComplete,
  ]);

  const NotchDivider = () => (
    <div className="relative mt-7 mb-10">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <div
          className="border-t border-dashed border-[#E4E4E7]"
          style={{ borderWidth: 1, marginTop: -10 }}
        />
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
          />
          <path
            d="M0.5 0.512695C5.51429 0.772696 9.5 4.92101 9.5 10C9.5 15.079 4.48574 19.2263 0.5 19.4863"
            fill="none"
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
            Your booking confirmation number is:{" "}
            <span className="font-semibold">{bookingRef}</span>
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
              ? `${hotelDetail.address}${hotelDetail.city ? `, ${hotelDetail.city}` : ""
              }${hotelDetail.country ? `, ${hotelDetail.country}` : ""}`
              : ""}
          </p>
        </div>

        <NotchDivider />

        <div className="grid grid-cols-12 items-start gap-4">
          <div className="col-span-4">
            <p className="text-lg font-semibold text-[#0A0C0F]">Check-in</p>
            <p
              className={`text-base font-medium text-[#0A0C0F] ${hotelDetail?.checkInTime ? "mt-4" : ""
                }`}
            >
              {hotelDetail?.checkInTime || ""}
            </p>
            <p className="text-xs text-[#3D495C] mt-1">{formatDate(checkIn)}</p>
          </div>

          <div
            className={`col-span-4 flex justify-center ${hotelDetail?.checkInTime && hotelDetail?.checkOutTime
              ? "mt-16"
              : "mt-8"
              }`}
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
              className={`text-base font-medium text-[#0A0C0F] ${hotelDetail?.checkOutTime ? "mt-4" : ""
                }`}
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
              {currency} {totalPaid.toFixed(2)}
            </span>
          </div>
        </div>
      </>
    );
  };

  const pdfExportBlock = (
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
      </div>
    </div>
  );

  if (listDownload) {
    return (
      <>
        <Loader
          show={isRetrieving || !imagesLoaded}
          label={
            isRetrieving
              ? "Please wait while we are retrieving the booking."
              : "Please wait while we are loading images."
          }
        />
        <div className="relative w-full max-w-[560px] min-h-0" aria-hidden>
          {pdfExportBlock}
        </div>
      </>
    );
  }

  return (
    <section className="mt-8 flex items-center justify-center px-4">
      <Loader
        show={isRetrieving || !imagesLoaded}
        label={
          isRetrieving
            ? "Please wait while we are retrieving the booking."
            : "Please wait while we are loading images."
        }
      />

      <div className="w-full max-w-[560px]">
        <div
          className="rounded-[16px] border bg-[#FFFFFF] px-2 pt-6 pb-6"
          style={{ borderWidth: 1, borderColor: "#C2CAD6" }}
        >
          <TicketContent />
          <NotchDivider />

          <div className="grid w-full grid-cols-3 gap-2 px-2 sm:gap-3 sm:px-4">
            <Button
              type="button"
              overrideClasses
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF || !imagesLoaded || isRetrieving}
              className="flex min-h-[44px] w-full min-w-0 items-center justify-center border-0 px-2 text-center text-[11px] font-semibold leading-tight text-[#F2F2F3] sm:min-h-[46px] sm:text-[12px] sm:leading-snug"
              style={{
                borderRadius: 100,
                background:
                  "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
              }}
            >
              <span className="block w-full truncate text-center sm:whitespace-normal sm:overflow-visible">
                {isGeneratingPDF ? "Generating…" : "Download as PDF"}
              </span>
            </Button>

            <Button
              type="button"
              overrideClasses
              onClick={() => setShareModalOpen(true)}
              disabled={isRetrieving || !bookingRef || bookingRef === "—"}
              className="flex min-h-[44px] w-full min-w-0 items-center justify-center border border-[#2351A3] bg-white px-2 text-center text-[11px] font-semibold leading-tight text-[#2351A3] hover:bg-[#EEF4FF] sm:min-h-[46px] sm:text-[13px]"
              style={{
                borderRadius: 100,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Share
            </Button>

            <Button
              type="button"
              overrideClasses
              onClick={navigateToMyBookings}
              className="flex min-h-[44px] w-full min-w-0 items-center justify-center border border-[#C2CAD6] bg-[#F8FAFC] px-2 text-center text-[11px] font-semibold leading-tight text-[#2351A3] hover:border-[#2351A3] hover:bg-[#EEF4FF] sm:min-h-[46px] sm:text-[12px] sm:leading-snug"
              style={{
                borderRadius: 100,
                fontFamily: "Inter, sans-serif",
              }}
            >
              <span className="block w-full truncate text-center sm:whitespace-normal sm:overflow-visible">
                Manage bookings
              </span>
            </Button>
          </div>
        </div>

        {shareModalOpen && (
          <ShareTicketModal
            closeModal={() => setShareModalOpen(false)}
            mode="hotel"
            bookingRef={bookingRef}
            cardTitle={hotelCardTitle}
            cardSubtitle={hotelCardSubtitle || "Hotel booking"}
            shareUrl={shareBookingUrl || window.location.href}
            title="Share booking confirmation"
            description="Share your confirmation number and trip details with travel companions."
            showPrint={false}
          />
        )}

        {pdfExportBlock}
      </div>
    </section>
  );
}