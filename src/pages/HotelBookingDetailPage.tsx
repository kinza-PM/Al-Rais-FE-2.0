import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import Loader from "../components/atoms/Loader";
import { useHotelRetrieve } from "../hooks/useHotelBooking";
import { extractErrorFromAxiosApiError } from "../utils/apiErrorHanlder";
import toast from "react-hot-toast";
import { useHotelProxyImages } from "../hooks/useHotelProxyImages";
import { buildMyBookingsUrl } from "../utils/myBookingsUrl";
import type { HotelBookingCardItem } from "../utils/transformBookingData";

/**
 * Page to view hotel booking details (receipt) from My Bookings.
 * Receives bookingReferenceId, searchKey, bookingKey from location.state.
 */
const HotelBookingDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as {
    bookingReferenceId?: string;
    searchKey?: string;
    bookingKey?: string;
    /** e.g. "?mode=hotels&status=pending" — matches URL when leaving My Bookings */
    myBookingsSearch?: string;
    /** Fallback data from My Bookings card (when retrieve API has no details) */
    fallbackBooking?: HotelBookingCardItem;
  };

  const { bookingReferenceId, searchKey } = state;

  const navigateBackToMyBookings = () => {
    if (state.myBookingsSearch) {
      navigate(`/my-bookings${state.myBookingsSearch}`);
      return;
    }
    navigate(buildMyBookingsUrl({ mode: "hotels", status: "all" }));
  };

  const { mutateAsync: retrieveHotelBookingAsync, isPending: isRetrieving } =
    useHotelRetrieve();

  const bookingKey = state.bookingKey ?? "";

  const [retrieveResponse, setRetrieveResponse] = useState<any>(null);
  const [retrieveError, setRetrieveError] = useState<string | null>(null);

  const fallback = state.fallbackBooking;
  const canRetrieve = Boolean(bookingReferenceId && searchKey);

  useEffect(() => {
    if (!canRetrieve) return;
    let mounted = true;
    (async () => {
      try {
        setRetrieveError(null);
        const resp = await retrieveHotelBookingAsync({
          productType: "H",
          bookingReferenceId: bookingReferenceId!,
          clientReferenceId: "",
          bookingKey: bookingKey || "",
          searchKey: searchKey!,
        });
        if (!mounted) return;
        setRetrieveResponse(resp);
      } catch (error) {
        const err = extractErrorFromAxiosApiError(error);
        toast.error(err || "Failed to retrieve booking details");
        if (!mounted) return;
        setRetrieveError(err || "Failed to retrieve booking details");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [
    canRetrieve,
    bookingReferenceId,
    bookingKey,
    retrieveHotelBookingAsync,
    searchKey,
    setRetrieveResponse,
  ]);

  const bookingData = retrieveResponse?.data?.[0];
  const hotel = bookingData?.hotel;
  const rooms: any[] = hotel?.rooms ?? [];
  const hasHotelDetails = Boolean(hotel);

  const displayImages = useMemo(() => {
    const roomImages = (rooms || [])
      .flatMap((r: any) => r.roomImages?.image ?? [])
      .map((img: any) => img.path)
      .filter(Boolean);
    const hotelImages = (hotel?.images ?? hotel?.hotelImages ?? [])
      .flatMap((x: any) => (Array.isArray(x?.image) ? x.image : [x]))
      .map((img: any) => img?.path ?? img?.url)
      .filter(Boolean);
    const fallbackImages = fallback?.imageUrl ? [fallback.imageUrl] : [];
    const merged = [...roomImages, ...hotelImages, ...fallbackImages].filter(
      Boolean,
    );
    return merged.slice(0, 5);
  }, [rooms, hotel, fallback?.imageUrl]);

  const { data: imageDataUrls = [], isLoading: imagesLoading } =
    useHotelProxyImages(displayImages);

  const hotelName = hotel?.name ?? fallback?.hotelName ?? "Hotel";
  const hotelAddress =
    hotel?.address ??
    [hotel?.addressLine1, hotel?.city, hotel?.country].filter(Boolean).join(", ") ??
    fallback?.address ??
    "";

  const coords = useMemo(() => {
    const latRaw =
      hotel?.latitude ?? hotel?.lat ?? hotel?.location?.lat ?? hotel?.geo?.lat;
    const lngRaw =
      hotel?.longitude ?? hotel?.lng ?? hotel?.location?.lng ?? hotel?.geo?.lng;
    const lat = typeof latRaw === "number" ? latRaw : Number(String(latRaw ?? ""));
    const lng = typeof lngRaw === "number" ? lngRaw : Number(String(lngRaw ?? ""));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [hotel]);

  const selectedRoom = rooms?.[0];
  const currency = hotel?.currency ?? "AED";
  const totalNet = Number(hotel?.totalNet ?? 0);

  const adults = (bookingData?.passengers ?? []).filter(
    (p: any) => (p.ptc ?? "").toUpperCase() === "ADT",
  ).length;
  const children = (bookingData?.passengers ?? []).filter(
    (p: any) => (p.ptc ?? "").toUpperCase() === "CHD",
  ).length;

  return (
    <div className="py-8 px-6">
      <div className="mb-6">
        <Button
          type="button"
          onClick={navigateBackToMyBookings}
          className="text-[#5383DA] hover:underline bg-transparent border-none"
          overrideClasses
        >
          ← Back to My Bookings
        </Button>
      </div>

      <Loader
        show={
          (canRetrieve &&
            (isRetrieving || (!retrieveResponse && !retrieveError))) ||
          imagesLoading
        }
        label={
          isRetrieving
            ? "Please wait while we are retrieving the booking."
            : "Please wait while we are loading images."
        }
      />

      {/* Top: gallery + hotel name + show on map */}
      <div className="mx-auto w-full max-w-[1168px]">
        {retrieveError ? (
          <div className="mb-6 rounded-2xl border border-[#E4E4E7] bg-white p-6">
            <div className="text-[16px] font-semibold text-[#0A0C0F]">
              Unable to load booking details
            </div>
            <div className="mt-2 text-[14px] text-[#64748B]">{retrieveError}</div>
          </div>
        ) : null}

        {canRetrieve && !isRetrieving && !retrieveError && !bookingData ? (
          <div className="mb-6 rounded-2xl border border-[#E4E4E7] bg-white p-6">
            <div className="text-[16px] font-semibold text-[#0A0C0F]">
              No booking details returned
            </div>
            <div className="mt-2 text-[14px] text-[#64748B]">
              We couldn’t find hotel data for this booking. Showing the info we
              have below.
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 text-[13px] text-[#3D495C] sm:grid-cols-3">
              <div>
                <div className="text-[12px] text-[#64748B]">Booking ref</div>
                <div className="font-medium text-[#0A0C0F] break-all">
                  {bookingReferenceId}
                </div>
              </div>
              <div>
                <div className="text-[12px] text-[#64748B]">Search key</div>
                <div className="font-medium text-[#0A0C0F] break-all">
                  {searchKey}
                </div>
              </div>
              <div>
                <div className="text-[12px] text-[#64748B]">Booking key</div>
                <div className="font-medium text-[#0A0C0F] break-all">
                  {bookingKey || "—"}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {!canRetrieve && fallback ? (
          <div className="mb-6 rounded-2xl border border-[#E4E4E7] bg-white p-6">
            <div className="text-[16px] font-semibold text-[#0A0C0F]">
              Limited details available
            </div>
            <div className="mt-2 text-[14px] text-[#64748B]">
              This booking doesn’t include the keys required to fetch full
              details. Showing what we have from My Bookings.
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 text-[13px] text-[#3D495C] sm:grid-cols-3">
              <div>
                <div className="text-[12px] text-[#64748B]">Status</div>
                <div className="font-medium text-[#0A0C0F] break-all">
                  {fallback.status}
                </div>
              </div>
              <div>
                <div className="text-[12px] text-[#64748B]">Booking ref</div>
                <div className="font-medium text-[#0A0C0F] break-all">
                  {fallback.bookingRef || "—"}
                </div>
              </div>
              <div>
                <div className="text-[12px] text-[#64748B]">Room</div>
                <div className="font-medium text-[#0A0C0F] break-all">
                  {fallback.roomLabel || "—"}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {!canRetrieve && !fallback ? (
          <div className="mb-6 rounded-2xl border border-[#E4E4E7] bg-white p-6">
            <div className="text-[16px] font-semibold text-[#0A0C0F]">
              Missing booking information
            </div>
            <div className="mt-2 text-[14px] text-[#64748B]">
              Please go back to My Bookings and open the booking again.
            </div>
            <div className="mt-4">
              <Button
                type="button"
                onClick={navigateBackToMyBookings}
                overrideClasses
              >
                Back to My Bookings
              </Button>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm p-2">
          {imageDataUrls.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 auto-rows-fr">
              {imageDataUrls[0] ? (
                <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl min-h-[220px] bg-[#F4F4F5]">
                  <img
                    src={imageDataUrls[0]}
                    alt="Hotel"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ) : null}
              {[1, 2, 3, 4].map((i) =>
                imageDataUrls[i] ? (
                  <div
                    key={i}
                    className="col-span-1 relative overflow-hidden rounded-2xl h-[106px] bg-[#F4F4F5]"
                  >
                    <img
                      src={imageDataUrls[i]}
                      alt="Hotel"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                ) : null,
              )}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 auto-rows-fr">
              <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl min-h-[220px] bg-[#F4F4F5]" />
              <div className="col-span-1 relative overflow-hidden rounded-2xl h-[106px] bg-[#F4F4F5]" />
              <div className="col-span-1 relative overflow-hidden rounded-2xl h-[106px] bg-[#F4F4F5]" />
              <div className="col-span-1 relative overflow-hidden rounded-2xl h-[106px] bg-[#F4F4F5]" />
              <div className="col-span-1 relative overflow-hidden rounded-2xl h-[106px] bg-[#F4F4F5]" />
            </div>
          )}

          <div className="mt-4 mb-2 flex items-start justify-between gap-4 px-2">
            <div className="min-w-0">
              <h1 className="text-[22px] leading-[30px] font-bold text-[#0A0C0F]">
                {hotelName}
              </h1>
              {hotelAddress ? (
                <div className="mt-1 text-[13px] text-[#3D495C] break-words">
                  {hotelAddress}
                  {coords ? (
                    <>
                      <span className="text-[#7C8899] font-medium mx-2">-</span>
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps?q=${coords.lat},${coords.lng}`,
                            "_blank",
                          )
                        }
                        className="text-[#2351A3] text-[15px] font-bold hover:underline underline-offset-2"
                      >
                        Show on map
                      </button>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Selected room card */}
        {selectedRoom ? (
          <div className="mt-6 rounded-2xl border border-[#E4E4E7] bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E4E4E7]">
              <h2 className="text-[15px] font-semibold text-[#0A0C0F]">
                {selectedRoom.roomTypeName || "Selected room"}{" "}
                {selectedRoom?.ratePlan?.cancelPolicyIndicator
                  ? `- ${selectedRoom.ratePlan.cancelPolicyIndicator}`
                  : ""}
              </h2>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
                <div className="flex items-start overflow-hidden">
                  {(selectedRoom?.roomImages?.image ?? [])
                    .map((img: any) => img?.path)
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((src: string, idx: number) => (
                      <div
                        key={`${src}-${idx}`}
                        className={`h-[100px] w-[100px] shrink-0 overflow-hidden rounded-[10px] border border-white bg-[#F1F5F9] ${
                          idx === 0 ? "" : "-ml-[35px]"
                        }`}
                      >
                        <img
                          src={src}
                          alt="Room"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                </div>

                <div className="min-w-0">
                  <div className="text-[14px] text-[#3D495C]">
                    {selectedRoom?.ratePlan?.meal || "Room Only"}
                  </div>
                  <div className="mt-2 text-[14px] text-[#3D495C] break-words">
                    {selectedRoom?.roomTypeDesc ||
                      selectedRoom?.description ||
                      "—"}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-[#3D495C]">
                    <span>
                      {String(adults).padStart(2, "0")} Adult
                      {adults === 1 ? "" : "s"}
                      {children
                        ? `, ${String(children).padStart(2, "0")} Child${
                            children === 1 ? "" : "ren"
                          }`
                        : ""}
                    </span>
                    <span className="font-semibold text-[#0A0C0F]">
                      {currency} {totalNet.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-[#E4E4E7] bg-white shadow-sm p-5">
            <div className="text-[15px] font-semibold text-[#0A0C0F]">
              Selected room
            </div>
            <div className="mt-2 text-[13px] text-[#64748B]">
              {hasHotelDetails
                ? "No room details found in this booking."
                : fallback?.roomLabel
                  ? `From My Bookings: ${fallback.roomLabel}`
                  : "Hotel details were not returned by the server, so room details aren’t available."}
            </div>
            {bookingData?.passengers ? (
              <div className="mt-4 text-[14px] text-[#3D495C]">
                Travellers:{" "}
                <span className="font-medium text-[#0A0C0F]">
                  {String(adults).padStart(2, "0")} Adult
                  {adults === 1 ? "" : "s"}
                  {children
                    ? `, ${String(children).padStart(2, "0")} Child${
                        children === 1 ? "" : "ren"
                      }`
                    : ""}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelBookingDetailPage;
