import React, { useCallback, useEffect, useMemo, useState } from "react";
import HotelImage from "../../../src/assets/images/Hotel Image.png";
import GreenTick from "../../../src/assets/images/tik.png";
import FilledStar from "../../../src/assets/svgs/filled_star.svg";
import EmptyStar from "../../../src/assets/svgs/empty_star.svg";
import Share from "../../../src/assets/svgs/share-icon.svg";
import HotelPriceSummaryTooltip from "../atoms/HotelPriceSummaryTooltip";
import { aggregateHotelTaxesFromRoomArray } from "../../utils/hotelBookingHelper";
import { useNavigate } from "react-router-dom";
import { useHotelStore } from "../../store/UseHotelStore";
import {
  processHotelSearchListingData,
  getHotelGuestReviewMeta,
  getHotelListingDescription,
  resolveHotelListingReviewDisplay,
  HOTEL_LISTING_REVIEW_FALLBACK,
} from "../../utils/hotelHelper";
import Loader from "../atoms/Loader";
import toast from "react-hot-toast";
import {
  useAddHotelFavourite,
  useGetHotelFavourites,
} from "../../hooks/useHotelSearch";
import { extractErrorFromAxiosApiError } from "../../utils/apiErrorHanlder";
import ShareTicketModal from "../atoms/ShareTicketModal";
import { HotelProxiedImage } from "../atoms/HotelProxiedImage";
import { useProgressiveList } from "../../hooks/useProgressiveList";

type HotelSearchListViewProps = {
  hotels: Array<any>;
  listResetKey?: number;
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

  return `${window.location.origin}/hotel-detail/${hotelKey}${queryString ? `?${queryString}` : ""
    }`;
};

const HotelSearchListView: React.FC<HotelSearchListViewProps> = React.memo(
  ({ hotels, listResetKey = 0 }) => {
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
    } = useGetHotelFavourites(hotels.length > 0);

    const { visible, sentinelRef, hasMore } = useProgressiveList(
      hotels,
      24,
      listResetKey,
    );

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
        <div className="mb-3 flex items-center gap-[5px]">
          {Array.from({ length: fullStars }).map((_, i) => (
            <img
              key={`filled-${i}`}
              className="h-5 w-5"
              src={FilledStar}
              alt="filled"
            />
          ))}
          {Array.from({ length: totalStars - fullStars }).map((_, i) => (
            <img
              key={`empty-${i}`}
              className="h-5 w-5"
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
              taxes: room?.roomRate?.taxes ?? [],
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

        const detailUrl = buildHotelShareUrl(
          hotelKey,
          searchKey,
          bookingParams ?? null
        );
        const url = new URL(detailUrl);
        navigate(`${url.pathname}${url.search}`, {
          state: {
            searchKey,
            bookingParams: bookingParams ?? undefined,
          },
        });
      },
      [navigate, bookingParams]
    );

    if (!hotels || hotels.length === 0) {
      return (
        <>
          <Loader
            show={
              isAddFavouritePending ||
              (isGetFavouritesLoading && favouriteHotelsResponse == null)
            }
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
          show={
            isAddFavouritePending ||
            (isGetFavouritesLoading && favouriteHotelsResponse == null)
          }
          label={
            isGetFavouritesLoading
              ? "Loading favourites..."
              : "Updating favourites..."
          }
        />

        <div className="min-h-screen">
          <div className="w-full">
            {visible.map((hotel, index) => {
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

              const apiImages: string[] =
                hotel?.propertyInfo?.images
                  ?.map((img: any) => img?.url || img?.imageUrl || img)
                  ?.filter(
                    (u: any) => typeof u === "string" && u.length > 0,
                  ) || [];
              const imageUrl =
                apiImages[0] || hotel.propertyInfo?.imageUrl || HotelImage;
              const hotelName = hotel.propertyInfo?.hotelName || "Hotel";
              const address = hotel.propertyInfo?.address || "";
              const locationText = hotel.propertyInfo?.location || "";
              const starRating = hotel.propertyInfo?.starRating;
              const listingDescription = getHotelListingDescription(
                hotel,
                bestRoom,
              );
              const distanceFromCenter =
                hotel.propertyInfo?.distanceFromCenter ??
                hotel.propertyInfo?.distanceFromDowntown ??
                "";
              const { reviewScore, reviewCount } = getHotelGuestReviewMeta(hotel);

              const isFavourite = !!favorites[hotel.hotelKey];

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
              const reviewDisplay = resolveHotelListingReviewDisplay(
                reviewScore,
                reviewCount,
              );
              const dealBadgeLabel =
                uniqueOfferNames.length > 0
                  ? uniqueOfferNames[0]
                  : HOTEL_LISTING_REVIEW_FALLBACK.dealLabel;

              return (
                <div
                  className="mb-4 bg-transparent relative"
                  style={{ borderBottom: "2px solid var(--black-100, #C2CAD6)" }}
                  key={hotel.hotelKey || index}
                >
                  <div className="flex flex-col lg:flex-row gap-4 p-[10px]">
                    <div
                      className="relative h-[220px] w-full lg:w-[244px] lg:flex-shrink-0"
                    >
                      <HotelProxiedImage
                        src={imageUrl}
                        alt="Hotel"
                        className="w-full h-full object-cover"
                        style={{ borderRadius: "16px" }}
                        fallback={HotelImage}
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
                      <h3 className="mb-[6px] text-[16px] font-medium leading-none text-[#0A0C0F]">
                        {hotelName}
                      </h3>

                      <div className="mb-3 flex flex-wrap items-center gap-[5px] text-[12px] leading-none text-[#3D495C]">
                        {address ? <span>{address}</span> : null}
                        {locationText ? (
                          <>
                            <span className="h-1 w-1 rounded-full bg-[#3D495C]" />
                            <span>{locationText}</span>
                          </>
                        ) : null}
                        {distanceFromCenter ? (
                          <>
                            <span className="h-1 w-1 rounded-full bg-[#3D495C]" />
                            <span>{distanceFromCenter}</span>
                          </>
                        ) : null}
                      </div>

                      {renderStars(starRating)}

                      {listingDescription.trim() ? (
                        <p
                          className="mb-4 line-clamp-3 max-w-[568px] overflow-hidden text-[12px] font-normal text-[#3D495C]"
                          style={{
                            fontFamily: "Inter, sans-serif",
                            lineHeight: "1.45",
                          }}
                        >
                          {listingDescription}
                        </p>
                      ) : null}

                      <span className="mb-3 block h-px w-full bg-[#E4E4E7]" />

                      {hasRooms && isAvailable && bestRoom && (
                        <>
                          <div className="mb-1 flex flex-wrap items-center gap-[8px]">
                            <h4 className="text-[16px] font-semibold leading-none text-[#0A0C0F]">
                              {bestRoom.roomTypeName || ""}
                            </h4>
                            {availableRooms.length > 0 &&
                              availableRooms.length <= 5 && (
                                <span className="text-[12px] font-normal leading-none text-[#EA0029]">
                                  Only {availableRooms.length} room
                                  {availableRooms.length > 1 ? "s" : ""} left on
                                  {" "}Al Rais
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

                          <div className="flex flex-wrap items-center gap-x-[15px] gap-y-[6px]">
                            {amenitiesToShow.map((amenity, aIdx) => (
                              <div
                                key={aIdx}
                                className="flex items-center gap-[5px]"
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
                                    lineHeight: "100%",
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

                    <span
                      className="hidden lg:inline-block self-stretch bg-[#E4E4E7]"
                      style={{ width: "1px" }}
                    />

                    <div className="flex w-[300px] flex-shrink-0 flex-col items-end text-right">
                    {/* <div className="flex w-[272px] flex-shrink-0 flex-col items-end text-right"> */}
                      {/* Figma: guest score row + deal pill above price (right-aligned) */}
                      <div className="mb-[14px] flex w-full flex-col items-baseline gap-[10px]">
                        {/* Figma: score pill 71×49, #A7C0EC, gap 10px to copy */}
                        {reviewDisplay.score !== null && (
                          <div className="flex items-start justify-end gap-[10px]">
                            <div
                              className="flex flex-shrink-0 items-center justify-center rounded-[100px] box-border"
                              style={{
                                background: "#A7C0EC",
                                minWidth: "71px",
                                minHeight: "49px",
                                padding: "15px 25px",
                                boxSizing: "border-box",
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: 600,
                                  fontSize: "16px",
                                  lineHeight: "100%",
                                  color: "#2351A3",
                                  verticalAlign: "middle",
                                }}
                              >
                                {reviewDisplay.score.toFixed(1)}
                              </span>
                            </div>
                            <div className="flex flex-col gap-[6px] pt-[5px] text-justify">
                              <span
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: 600,
                                  fontSize: "14px",
                                  lineHeight: "100%",
                                  color: "#00B868",
                                  verticalAlign: "middle",
                                }}
                              >
                                {reviewDisplay.label}
                              </span>
                              {reviewDisplay.count != null && (
                                <span
                                  style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontWeight: 400,
                                    fontSize: "14px",
                                    lineHeight: "100%",
                                    color: "#3D495C",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  {reviewDisplay.count} guest reviews
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        <span
                          className="inline-flex max-w-full items-center justify-center rounded-[100px] bg-[#00B868] box-border"
                          style={{
                            padding: "8px 15px",
                            minHeight: "31px",
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 600,
                            fontSize: "12px",
                            lineHeight: "100%",
                            color: "#FFFFFF",
                            verticalAlign: "middle",
                          }}
                        >
                          {dealBadgeLabel}
                        </span>
                      </div>

                      <div className="mb-[2px] flex w-full items-center justify-end gap-[8px]">
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
                          taxes={aggregateHotelTaxesFromRoomArray(
                            Array.isArray(hotel?.rooms) && hotel.rooms.length > 0
                              ? hotel.rooms
                              : bestRoom
                                ? [bestRoom]
                                : [],
                          )}
                        />
                      </div>

                      <div className="mb-[22px] flex w-full flex-col items-start gap-[2px]">
                        {hasOffer && originalPrice > price && (
                          <span
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontWeight: 700,
                              fontSize: "32px",
                              lineHeight: "100%",
                              color: "#EA0029",
                              textDecoration: "line-through",
                              maxWidth: "100%",
                              wordBreak: "break-word",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {currency} {originalPrice.toFixed(2)}
                          </span>
                        )}
                        <div className="flex max-w-full flex-wrap items-end gap-y-[6px]">
                          <span
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontWeight: 700,
                              fontSize: "32px",
                              lineHeight: "100%",
                              color: "#0A0C0F",
                              maxWidth: "100%",
                              wordBreak: "break-word",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {currency} {price.toFixed(2)}
                          </span>
                          <span className="text-[12px] font-bold leading-none text-[#3D495C]">
                            /Night
                          </span>
                        </div>
                      </div>

                      <div className="flex w-full items-center justify-end gap-[18px]">
                        <button
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                          aria-label="Share"
                          onClick={() => handleShareClick(hotel)}
                        >
                          <img src={Share} alt="share" />
                        </button>

                        <button
                          className="flex-1 text-[#F2F2F3] font-semibold rounded-[100px] disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
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
            {hasMore ? (
              <div
                ref={sentinelRef}
                className="h-10 w-full shrink-0"
                aria-hidden
              />
            ) : null}
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