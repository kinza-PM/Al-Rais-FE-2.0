import HotelImage1 from "../../assets/images/HotelImage1.png";
import HotelImage2 from "../../assets/images/HotelImage2.png";
import HotelImage3 from "../../assets/images/HotelImage3.png";
import HotelImage4 from "../../assets/images/HotelImage4.png";
import { collectHotelGalleryUrls } from "../../utils/hotelImages";

type HotelSummaryCardProps = {
  paymentPage?: boolean;
  hotelDetail?: any;
  bookingInfo?: any;
  selectedRooms?: any[];
};

export default function HotelSummaryCard({
  paymentPage = false,
  hotelDetail,
  bookingInfo,
  selectedRooms = [],
}: HotelSummaryCardProps) {
  const FALLBACK_GALLERY = [
    HotelImage1,
    HotelImage2,
    HotelImage3,
    HotelImage4,
    HotelImage2,
  ];
  const apiUrls = collectHotelGalleryUrls(hotelDetail, 5);
  const displayImages: string[] = [];
  for (let i = 0; i < 5; i++) {
    displayImages.push(apiUrls[i] ?? FALLBACK_GALLERY[i]);
  }

  const hotelName = hotelDetail?.name || "Hotel";
  const hotelLocation = hotelDetail?.address
    ? `${hotelDetail.address}${hotelDetail.city ? `, ${hotelDetail.city}` : ""}${
        hotelDetail.country ? `, ${hotelDetail.country}` : ""
      }`
    : hotelDetail?.city && hotelDetail?.country
      ? `${hotelDetail.city}, ${hotelDetail.country}`
      : "";

  // const formatGuests = (count?: number) => {
  //   if (!count || count <= 0) return "—";
  //   return `${String(count).padStart(2, "0")} guest${count > 1 ? "s" : ""}`;
  // };

  const adults = Number(bookingInfo?.adults ?? 0) || 0;
  const children = Number(bookingInfo?.children ?? 0) || 0;
  const totalGuests = adults + children;
  const occupancyText =
    totalGuests > 0
      ? children > 0
        ? `${String(adults).padStart(2, "0")} adult${
            adults === 1 ? "" : "s"
          }, ${String(children).padStart(2, "0")} child${
            children === 1 ? "" : "ren"
          }`
        : `${String(adults).padStart(2, "0")} adult${adults === 1 ? "" : "s"}`
      : "—";

  const roomSummaries = (selectedRooms ?? [])
    .filter(Boolean)
    .map((sr: any, idx: number) => {
      const room = sr?.room ?? {};
      const ratePlan = room?.ratePlan ?? {};
      const roomType = room?.roomTypeName || room?.name || `Room ${idx + 1}`;
      const meal = ratePlan?.meal || ratePlan?.boardType || "";
      const refundability = ratePlan?.cancelPolicyIndicator || "";
      const maxGuests =
        room?.maxGuests ??
        room?.occupancy?.max ??
        room?.occupancy?.maxGuests ??
        undefined;
      const count = sr?.count ?? 1;

      return {
        key: sr?.roomKey || `${idx}`,
        title: roomType,
        meal,
        refundability,
        maxGuests,
        count,
      };
    });

  return (
    <div>
      <div className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm p-2 mb-4">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 min-h-[200px]">
          <div className="col-span-2 row-span-2 relative min-h-[160px] overflow-hidden rounded-2xl bg-[#F4F4F5]">
            <img
              src={displayImages[0] || HotelImage1}
              alt="Hotel room"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="col-span-1 relative min-h-[76px] overflow-hidden rounded-2xl bg-[#F4F4F5]">
            <img
              src={displayImages[1] || HotelImage2}
              alt="Hotel interior"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="col-span-1 relative min-h-[76px] overflow-hidden rounded-2xl bg-[#F4F4F5]">
            <img
              src={displayImages[2] || HotelImage3}
              alt="Hotel pool"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="col-span-1 relative min-h-[76px] overflow-hidden rounded-2xl bg-[#F4F4F5]">
            <img
              src={displayImages[3] || HotelImage2}
              alt="Hotel interior"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="col-span-1 relative min-h-[76px] overflow-hidden rounded-2xl bg-[#F4F4F5]">
            <img
              src={displayImages[4] || HotelImage4}
              alt="Hotel pool"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div className="mt-4 mb-2">
          <h3 className="text-base font-medium text-[#0A0C0F]">{hotelName}</h3>
          {hotelLocation && (
            <p className="text-xs text-[#3D495C]">{hotelLocation}</p>
          )}
        </div>

        {paymentPage && (
          <>
            <div className="border-t border-[#E4E4E7] mt-4 -mx-2"></div>
            <HotelBookingDetailContent
              paymentPage={paymentPage}
              borderClass="-mx-2"
              bookingInfo={bookingInfo}
            />

            {roomSummaries.length > 0 && (
              <>
                <div className="border-t border-[#E4E4E7] mt-4 -mx-2"></div>
                <div className="px-2 pt-4 pb-2">
                  <p className="text-xs text-[#3D495C]">Room details</p>
                  <div className="mt-2 space-y-3">
                    {roomSummaries.map((r: any, i: number) => {
                      const mealText = r.meal ? String(r.meal) : "—";
                      const refundText = r.refundability
                        ? String(r.refundability)
                        : "—";
                      // const maxGuestsText =
                      //   r.maxGuests !== undefined && r.maxGuests !== null && r.maxGuests !== ""
                      //     ? formatGuests(Number(r.maxGuests))
                      //     : "—";
                      const roomsQtyText =
                        r.count && Number(r.count) > 0
                          ? `${String(Number(r.count)).padStart(2, "0")} room${
                              Number(r.count) > 1 ? "s" : ""
                            }`
                          : "—";

                      return (
                        <div
                          key={r.key ?? i}
                          className=""
                        >
                          <p className="text-sm font-semibold text-[#0A0C0F]">
                            {r.title || "Room"}
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                            <div>
                              <p className="text-[11px] text-[#3D495C]">Rooms</p>
                              <p className="text-sm font-medium text-[#0A0C0F]">
                                {roomsQtyText}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] text-[#3D495C]">
                                Meal plan
                              </p>
                              <p className="text-sm font-medium text-[#0A0C0F]">
                                {mealText}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] text-[#3D495C]">
                                Refundability
                              </p>
                              <p className="text-sm font-medium text-[#0A0C0F]">
                                {refundText}
                              </p>
                            </div>
                            {/* <div>
                              <p className="text-[11px] text-[#3D495C]">
                                Max guests
                              </p>
                              <p className="text-sm font-medium text-[#0A0C0F]">
                                {maxGuestsText}
                              </p>
                            </div> */}
                            <div>
                              <p className="text-[11px] text-[#3D495C]">
                                Occupancy
                              </p>
                              <p className="text-sm font-medium text-[#0A0C0F]">
                                {occupancyText}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
      {!paymentPage && (
        <div className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E4E4E7]">
            <h3 className="text-[15px] font-medium text-[#0A0C0F]">
              Booking details
            </h3>
          </div>

          <HotelBookingDetailContent
            paymentPage={paymentPage}
            bookingInfo={bookingInfo}
          />
        </div>
      )}
    </div>
  );
}

const HotelBookingDetailContent = ({
  borderClass = "",
  paymentPage = false,
  bookingInfo,
}: {
  borderClass?: string;
  paymentPage?: boolean;
  bookingInfo?: any;
}) => {
  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
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
      return `${days[date.getDay()]}, ${date.getDate()} ${
        months[date.getMonth()]
      } ${date.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  const checkInDate = bookingInfo?.checkIn || "";
  const checkOutDate = bookingInfo?.checkOut || "";
  const checkInTime = bookingInfo?.checkInTime || "";
  const checkOutTime = bookingInfo?.checkOutTime || "";
  const totalNights = bookingInfo?.totalNights || 1;
  const rooms = bookingInfo?.rooms || 0;
  const adults = bookingInfo?.adults || 0;
  const children = bookingInfo?.children ?? 0;

  const selectionText =
    rooms > 0 && (adults > 0 || children > 0)
      ? (() => {
          const r = `${rooms.toString().padStart(2, "0")} room${rooms > 1 ? "s" : ""}`;
          const a =
            adults > 0
              ? `${adults.toString().padStart(2, "0")} adult${adults > 1 ? "s" : ""}`
              : "";
          const c =
            children > 0
              ? `${children.toString().padStart(2, "0")} child${children > 1 ? "ren" : ""}`
              : "";
          if (a && c) return `${r} for ${a} and ${c}`;
          if (a) return `${r} for ${a}`;
          if (c) return `${r} for ${c}`;
          return r;
        })()
      : "Select rooms and guests";

  return (
    <>
      <div className={paymentPage ? "px-2 py-3" : "px-4 py-6"}>
        <div className="grid grid-cols-12 items-start gap-4">
          <div className="col-span-4">
            <p className="text-lg font-semibold text-[#0A0C0F]">Check-in</p>
            <p className="mt-4 text-base font-medium text-[#0A0C0F]">
              {checkInTime}
            </p>
            {checkInDate && (
              <p className="text-xs text-[#3D495C] mt-1">
                {formatDate(checkInDate)}
              </p>
            )}
          </div>

          <div className="col-span-4 flex justify-center mt-16">
            <div className="FlightDirection">
              <div className="hotelVisualGuid">
                <div className="stopPoint"></div>

                <div className="stopsDetail">
                  <span className="mb-5">
                    <span style={{ fontWeight: "bold" }} className="text-xl font-extrabold">Total stay:</span>{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {totalNights} {totalNights === 1 ? "night" : "nights"}
                    </span>
                  </span>
                </div>

                <div className="stopPoint"></div>
              </div>
            </div>
          </div>

          <div className="col-span-4 text-left">
            <p className="text-base font-semibold text-[#0A0C0F]">Check-out</p>
            <p className="mt-4 text-base font-medium text-[#0A0C0F]">
              {checkOutTime}
            </p>
            {checkOutDate && (
              <p className="text-xs text-[#3D495C] mt-1">
                {formatDate(checkOutDate)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={`border-t border-[#E4E4E7] ${borderClass}`}></div>

      <div className={paymentPage ? "px-2 pt-6 pb-1" : "px-4 pt-6 pb-3"}>
        <p className="text-xs text-[#3D495C]">Your selection</p>
        <p className="text-base font-medium text-[#0A0C0F]">{selectionText}</p>
      </div>
    </>
  );
};
