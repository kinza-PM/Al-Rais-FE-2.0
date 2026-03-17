import React, { useCallback, useEffect, useMemo, useState } from "react";
import HotelImage from "../../../src/assets/images/Hotel Image.png";
import GreenTick from "../../../src/assets/images/tik.png";
import FilledStar from "../../../src/assets/svgs/filled_star.svg";
import EmptyStar from "../../../src/assets/svgs/empty_star.svg";
import Share from "../../../src/assets/svgs/share-icon.svg";
import HotelPriceSummaryTooltip from "../atoms/HotelPriceSummaryTooltip";
import { useNavigate } from "react-router-dom";
import { useHotelStore } from "../../store/UseHotelStore";
import { processHotelSearchListingData } from "../../utils/hotelHelper";
import Loader from "../atoms/Loader";
import toast from "react-hot-toast";
import {
  useAddHotelFavourite,
  useGetHotelFavourites,
} from "../../hooks/useHotelSearch";
import { extractErrorFromAxiosApiError } from "../../utils/apiErrorHanlder";
import ShareTicketModal from "../atoms/ShareTicketModal";

type HotelSearchListViewProps = {
  hotels: Array<any>;
};

const buildHotelShareUrl = (
  hotelKey: string,
  searchKey: string,
  bookingParams?: object | null
) => {
  const params = new URLSearchParams();

  if (searchKey) {
    params.set("searchKey", searchKey);
  }

  if (bookingParams) {
    params.set("bookingParams", JSON.stringify(bookingParams));
  }

  const queryString = params.toString();

  return `${window.location.origin}/hotel-detail/${hotelKey}${
    queryString ? `?${queryString}` : ""
  }`;
};

const HotelSearchListView: React.FC<HotelSearchListViewProps> = React.memo(
  ({ hotels }) => {
    const navigate = useNavigate();
    const { hotel: bookingParams } = useHotelStore();

    const [openShareModal, setOpenShareModal] = useState(false);
    const [selectedShareHotel, setSelectedShareHotel] = useState<any>(null);

    const {
      mutateAsync: addHotelFavouriteAsync,
      isPending: isAddFavouritePending,
    } = useAddHotelFavourite();

    const {
      data: favouriteHotelsResponse,
      isLoading: isGetFavouritesLoading,
      refetch: refetchFavourites,
    } = useGetHotelFavourites();

    const [favorites, setFavorites] = useState<Record<string, boolean>>({});

    const favouriteItems = useMemo(() => {
      if (Array.isArray(favouriteHotelsResponse)) {
        return favouriteHotelsResponse;
      }

      if (Array.isArray((favouriteHotelsResponse as any)?.data)) {
        return (favouriteHotelsResponse as any).data;
      }

      return [];
    }, [favouriteHotelsResponse]);

    useEffect(() => {
      const next: Record<string, boolean> = {};

      favouriteItems.forEach((item: any) => {
        if (item?.hotelKey) {
          next[item.hotelKey] = true;
        }
      });

      setFavorites(next);
    }, [favouriteItems]);

    const renderStars = (rating: string | undefined) => {
      const numRating = rating ? parseFloat(rating) : 0;
      const fullStars = Math.floor(numRating);
      const totalStars = 7;

      return (
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: fullStars }).map((_, i) => (
            <img
              key={`filled-${i}`}
              className="cursor-pointer"
              src={FilledStar}
              alt="filled"
            />
          ))}
          {Array.from({ length: totalStars - fullStars }).map((_, i) => (
            <img
              key={`empty-${i}`}
              className="cursor-pointer"
              src={EmptyStar}
              alt="empty"
            />
          ))}
        </div>
      );
    };

    const buildFavouritePayload = useCallback((hotel: any, flag: boolean) => {
      const rooms =
        Array.isArray(hotel?.rooms) && hotel.rooms.length > 0
          ? hotel.rooms.map((room: any) => ({
              roomIndex: room?.roomIndex ?? 1,
              roomKey: room?.roomKey ?? "",
              roomId: room?.roomId ?? "",
              roomTypeName: room?.roomTypeName ?? "",
              roomTypeDesc: room?.roomTypeDesc ?? room?.roomTypeName ?? "",
              maxOccupancy: room?.maxOccupancy ?? -1,
              roomFacilities: room?.roomFacilities ?? [],
              ratePlan: {
                supplierCode: room?.ratePlan?.supplierCode ?? "",
                meal: room?.ratePlan?.meal ?? "",
                availableStatus: room?.ratePlan?.availableStatus ?? "",
                cancelPolicyIndicator:
                  room?.ratePlan?.cancelPolicyIndicator ?? "",
                code: room?.ratePlan?.code ?? "",
                isPackage: room?.ratePlan?.isPackage ?? false,
                fixedCombo: room?.ratePlan?.fixedCombo ?? false,
                gstAssured: room?.ratePlan?.gstAssured ?? false,
                lastCancellationDate:
                  room?.ratePlan?.lastCancellationDate ?? "",
              },
              roomRate: {
                currency: room?.roomRate?.currency ?? "AED",
                netAmount: room?.roomRate?.netAmount ?? 0,
                rates: room?.roomRate?.rates ?? [],
              },
              rateNotes: room?.rateNotes ?? "",
              financialInfo: {
                tmc: room?.financialInfo?.tmc ?? "",
                supplier: room?.financialInfo?.supplier ?? "",
              },
              isAllPaxInfoMandatory: room?.isAllPaxInfoMandatory ?? false,
            }))
          : [];

      const rawFacilities = hotel?.propertyInfo?.facilities || [];
      const facilities = rawFacilities
        .map((f: any) => (typeof f === "string" ? f : f?.name))
        .filter(Boolean);

      const totalPrice =
        Number(hotel?.totalPrice) ||
        rooms.reduce(
          (sum: number, room: any) => sum + (room?.roomRate?.netAmount || 0),
          0
        );

      return {
        hotelKey: hotel?.hotelKey ?? "",
        propertyInfo: {
          providerHotelId:
            hotel?.propertyInfo?.providerHotelId?.toString() ||
            hotel?.propertyInfo?.hotelCode?.toString() ||
            "",
          hotelName: hotel?.propertyInfo?.hotelName ?? "",
          address: hotel?.propertyInfo?.address ?? "",
          phoneNumber: hotel?.propertyInfo?.phoneNumber ?? "",
          location: hotel?.propertyInfo?.location ?? "",
          latitude: hotel?.propertyInfo?.latitude?.toString() ?? "",
          longitude: hotel?.propertyInfo?.longitude?.toString() ?? "",
          imageUrl: hotel?.propertyInfo?.imageUrl ?? "",
          facilities,
          propertyType: hotel?.propertyInfo?.propertyType ?? "",
          starRating: hotel?.propertyInfo?.starRating?.toString() ?? "",
        },
        rooms,
        totalPrice,
        searchKey: hotel?.searchKey ?? "",
        flag,
      };
    }, []);

    const handleToggleFavourite = useCallback(
      async (hotel: any) => {
        const hotelKey = hotel?.hotelKey;
        if (!hotelKey) return;

        const currentlyFavourite = !!favorites[hotelKey];
        const nextFlag = !currentlyFavourite;

        const payload = buildFavouritePayload(hotel, nextFlag);

        setFavorites((prev) => ({
          ...prev,
          [hotelKey]: nextFlag,
        }));

        try {
          await addHotelFavouriteAsync(payload);

          toast.success(
            nextFlag
              ? "Hotel added to favourites"
              : "Hotel removed from favourites"
          );

          await refetchFavourites();
        } catch (error) {
          setFavorites((prev) => ({
            ...prev,
            [hotelKey]: currentlyFavourite,
          }));

          const err = extractErrorFromAxiosApiError(error);
          toast.error(err || "Failed to update favourite");
        }
      },
      [
        favorites,
        buildFavouritePayload,
        addHotelFavouriteAsync,
        refetchFavourites,
      ]
    );

    const handleShareClick = useCallback((hotel: any) => {
      setSelectedShareHotel(hotel);
      setOpenShareModal(true);
    }, []);

    const handleCheckAvailability = useCallback(
      (hotel: any) => {
        const hotelKey = hotel?.hotelKey ?? "";
        const searchKey = hotel?.searchKey ?? "";

        if (!hotelKey) return;

        const params = new URLSearchParams();

        if (searchKey) {
          params.set("searchKey", searchKey);
        }

        if (bookingParams) {
          params.set("bookingParams", JSON.stringify(bookingParams));
        }

        const queryString = params.toString();

        navigate(
          `/hotel-detail/${hotelKey}${queryString ? `?${queryString}` : ""}`
        );
      },
      [navigate, bookingParams]
    );

    if (!hotels || hotels.length === 0) {
      return (
        <>
          <Loader
            show={isAddFavouritePending || isGetFavouritesLoading}
            label={
              isGetFavouritesLoading
                ? "Loading favourites..."
                : "Updating favourites..."
            }
          />
          <div className="py-16 flex flex-col items-center text-center">
            <p className="mt-2 text-[14px] text-[#0F172A]">No hotels found</p>
          </div>
        </>
      );
    }

    return (
      <>
        <Loader
          show={isAddFavouritePending || isGetFavouritesLoading}
          label={
            isGetFavouritesLoading
              ? "Loading favourites..."
              : "Updating favourites..."
          }
        />

        <div className="min-h-screen">
          <div className="w-full">
            {hotels.map((hotel, index) => {
              const {
                hasRooms,
                isAvailable,
                bestRoom,
                currency,
                price,
                hasFreeCancellation,
                totalOriginalPrice: originalPrice,
                uniqueOfferNames,
                hasOffer,
                availableRooms,
              } = processHotelSearchListingData(hotel);

              const imageUrl = hotel.propertyInfo?.imageUrl || HotelImage;
              const hotelName = hotel.propertyInfo?.hotelName || "Hotel";
              const address = hotel.propertyInfo?.address || "";
              const locationText = hotel.propertyInfo?.location || "";
              const starRating = hotel.propertyInfo?.starRating;
              const description =
                hotel.propertyInfo?.description || bestRoom?.roomTypeDesc || "";
              const distanceFromCenter =
                hotel.propertyInfo?.distanceFromCenter ??
                hotel.propertyInfo?.distanceFromDowntown ??
                "";
              const reviewScore =
                hotel.propertyInfo?.reviewScore ??
                hotel.propertyInfo?.guestScore ??
                hotel?.reviewScore;
              const reviewCount =
                hotel.propertyInfo?.reviewCount ??
                hotel.propertyInfo?.totalReviews ??
                hotel?.reviewCount;

              const isFavourite = !!favorites[hotel.hotelKey];

              const getReviewLabel = (score: number) => {
                if (score >= 9.5) return "Exceptional";
                if (score >= 9.0) return "Excellent";
                if (score >= 8.5) return "Superb";
                if (score >= 8.0) return "Fabulous";
                if (score >= 7.5) return "Very Good";
                if (score >= 7.0) return "Good";
                return "Reviewed";
              };

              const rawFacilities = hotel.propertyInfo?.facilities || [];
              const facilityNames = rawFacilities
                .map((f: any) => (typeof f === "string" ? f : f?.name || ""))
                .filter(Boolean);

              const childMatch = facilityNames.find((n: string) =>
                /child|family|kids/i.test(n)
              );
              const internetMatch = facilityNames.find((n: string) =>
                /wifi|internet|wi-fi/i.test(n)
              );
              const parkingMatch = facilityNames.find((n: string) =>
                /parking|car park/i.test(n)
              );

              const displayAmenities: string[] = [];
              if (hasFreeCancellation) displayAmenities.push("Free cancellation");
              displayAmenities.push(childMatch || "Free child stay");
              displayAmenities.push(internetMatch || "High speed internet");
              displayAmenities.push(parkingMatch || "Free parking");

              if (displayAmenities.length < 4) {
                const used = new Set(
                  displayAmenities.map((a) => a.toLowerCase())
                );
                const extra = facilityNames.find(
                  (n: string) => !used.has(n.toLowerCase())
                );
                displayAmenities.push(extra || "Breakfast included");
              }

              const amenitiesToShow = displayAmenities.slice(0, 4);

              return (
                <div
                  className="bg-transparent overflow-hidden mb-4"
                  style={{ borderBottom: "2px solid var(--black-100, #C2CAD6)" }}
                  key={hotel.hotelKey || index}
                >
                  <div className="flex p-2">
                    <div
                      className="relative flex-shrink-0 mr-4"
                      style={{ width: "244px", height: "220px" }}
                    >
                      <img
                        src={imageUrl}
                        alt="Hotel"
                        className="w-full h-full object-cover"
                        style={{ borderRadius: "16px" }}
                        onError={(e) => {
                          e.currentTarget.src = HotelImage;
                        }}
                      />

                      <button
                        type="button"
                        className="absolute flex items-center justify-center rounded-full shadow-sm hover:scale-110 transition-transform"
                        style={{
                          top: "15px",
                          left: "15px",
                          width: "36px",
                          height: "36px",
                          background: "#FFFFFF99",
                        }}
                        aria-label="Add to favourites"
                        disabled={isAddFavouritePending}
                        onClick={() => handleToggleFavourite(hotel)}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill={isFavourite ? "#EA0029" : "white"}
                          stroke={isFavourite ? "#EA0029" : "#2351A3"}
                          strokeWidth="2"
                        >
                          <path d="M12 21s-6.716-4.35-9.193-7.146C.894 11.692 1.163 8.24 3.514 6.56c1.925-1.376 4.48-1.072 6.104.64L12 9.09l2.382-1.89c1.624-1.712 4.179-2.016 6.104-.64 2.351 1.68 2.62 5.132.707 7.294C18.716 16.65 12 21 12 21z" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-[#0A0C0F] mb-1">
                        {hotelName}
                      </h3>

                      <p className="text-xs text-[#3D495C] mb-2">
                        {address}
                        {locationText && ` • ${locationText}`}
                        {distanceFromCenter && ` • ${distanceFromCenter}`}
                      </p>

                      {renderStars(starRating)}

                      {description && (
                        <p className="text-xs text-[#3D495C] leading-relaxed mb-3 line-clamp-3">
                          {description}
                        </p>
                      )}

                      <span className="block w-full h-px bg-[#E4E4E7] mb-3 -mr-8" />

                      {hasRooms && isAvailable && bestRoom && (
                        <>
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h4 className="text-[14px] font-semibold text-[#0A0C0F] leading-tight">
                              {bestRoom.roomTypeName || ""}
                            </h4>
                            {availableRooms.length > 0 &&
                              availableRooms.length <= 5 && (
                                <span className="text-xs text-[#EA0029] font-normal">
                                  Only {availableRooms.length} room
                                  {availableRooms.length > 1 ? "s" : ""} left on
                                  Al Rais
                                </span>
                              )}
                          </div>

                          <p
                            className="mb-2"
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "12px",
                              color: "#3D495C",
                              lineHeight: "100%",
                            }}
                          >
                            {bestRoom.bedType || ""}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            {amenitiesToShow.map((amenity, aIdx) => (
                              <div
                                key={aIdx}
                                className="flex items-center gap-1.5"
                              >
                                <img
                                  src={GreenTick}
                                  alt="tick"
                                  className="w-[18px] h-[18px] flex-shrink-0"
                                />
                                <span
                                  style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "12px",
                                    color: "#3D495C",
                                  }}
                                >
                                  {amenity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {hasRooms && !isAvailable && (
                        <div className="text-xs flex flex-col gap-2 mt-3">
                          <p className="text-[#EA0029]">
                            No rooms are available on the dates you selected!
                          </p>
                          <p className="text-[#0A0C0F]">
                            Please select other dates
                          </p>
                        </div>
                      )}
                    </div>

                    <span className="inline-block w-px bg-[#E4E4E7] self-stretch -my-2" />

                    <div className="flex flex-col items-start w-72 flex-shrink-0 pl-4 pr-2">
                      {reviewScore != null && (
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="flex items-center justify-center rounded-[100px] flex-shrink-0"
                            style={{
                              background: "#A7C0EC",
                              padding: "15px 25px",
                              minWidth: "71px",
                              height: "49px",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 600,
                                fontSize: "16px",
                                lineHeight: "100%",
                                color: "#2351A3",
                              }}
                            >
                              {Number(reviewScore).toFixed(1)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 600,
                                fontSize: "14px",
                                lineHeight: "100%",
                                color: "#00B868",
                              }}
                            >
                              {getReviewLabel(Number(reviewScore))}
                            </span>
                            {reviewCount != null && (
                              <span
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: 400,
                                  fontSize: "12px",
                                  color: "#3D495C",
                                  lineHeight: "100%",
                                }}
                              >
                                {reviewCount} guest reviews
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {hasOffer && uniqueOfferNames.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {uniqueOfferNames.map((offerName, idx) => (
                            <span
                              key={idx}
                              className="bg-[#00B868] text-[#FFFFFF] text-xs font-semibold px-4 py-1.5 rounded-full inline-block max-w-full break-words"
                            >
                              {offerName}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 400,
                            fontSize: "12px",
                            color: "#3D495C",
                            lineHeight: "100%",
                          }}
                        >
                          Starting from (including VAT)
                        </span>
                        <HotelPriceSummaryTooltip
                          totalPrice={price}
                          currency={currency}
                        />
                      </div>

                      <div className="flex flex-col items-start sm:items-end gap-0.5 mb-4 w-full">
                        {hasOffer && originalPrice > price && (
                          <span
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontWeight: 700,
                              fontSize: "32px",
                              lineHeight: "100%",
                              color: "#EA0029",
                              textDecoration: "line-through",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {currency} {originalPrice.toFixed(2)}
                          </span>
                        )}
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 700,
                            fontSize: "32px",
                            lineHeight: "100%",
                            color: "#0A0C0F",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {currency} {price.toFixed(2)}
                          <span className="text-base font-normal text-[#0A0C0F] ml-0.5">
                            /Night
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 w-full">
                        <button
                          className="p-2 flex-shrink-0"
                          aria-label="Share"
                          onClick={() => handleShareClick(hotel)}
                        >
                          <img src={Share} alt="share" />
                        </button>

                        <button
                          className="flex-1 text-[#F2F2F3] font-semibold rounded-[100px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "14px",
                            fontWeight: 600,
                            padding: "14px 20px",
                            background: isAvailable
                              ? "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)"
                              : "#C2CAD6",
                          }}
                          disabled={!isAvailable}
                          onClick={() => handleCheckAvailability(hotel)}
                        >
                          Check availability
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {openShareModal && selectedShareHotel && (
          <ShareTicketModal
            closeModal={() => {
              setOpenShareModal(false);
              setSelectedShareHotel(null);
            }}
            mode="hotel"
            showPrint={false}
            shareUrl={buildHotelShareUrl(
              selectedShareHotel?.hotelKey ?? "",
              selectedShareHotel?.searchKey ?? "",
              bookingParams ?? null
            )}
            title="Share this Hotel"
            description="Send this hotel to family and friends. Share the property details and location instantly."
            cardTitle={
              selectedShareHotel?.propertyInfo?.hotelName || "Hotel details"
            }
            cardSubtitle={[
              selectedShareHotel?.propertyInfo?.address,
              selectedShareHotel?.propertyInfo?.location,
            ]
              .filter(Boolean)
              .join(", ")}
            passengerName={
              selectedShareHotel?.propertyInfo?.hotelName || "Hotel details"
            }
          />
        )}
      </>
    );
  }
);

HotelSearchListView.displayName = "HotelSearchListView";

export default HotelSearchListView;