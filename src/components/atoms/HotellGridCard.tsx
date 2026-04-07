import React from "react";
import HotelImage from "../../../src/assets/images/Hotel Image.png";
import HotelImage2 from "../../../src/assets/images/hotel-detail-room-1.png";
import HotelImage3 from "../../../src/assets/images/hotel-detail-room-2.png";
import GreenTick from "../../../src/assets/images/tik.png";
import FilledStar from "../../../src/assets/svgs/filled_star.svg";
import EmptyStar from "../../../src/assets/svgs/empty_star.svg";
import Share from "../../../src/assets/svgs/share-icon.svg";
import HotelPriceSummaryTooltip from "./HotelPriceSummaryTooltip";
import { HotelProxiedImage } from "./HotelProxiedImage";
import { aggregateHotelTaxesFromRoomArray } from "../../utils/hotelBookingHelper";
import {
  processHotelSearchListingData,
  getHotelGuestReviewMeta,
  getHotelListingDescription,
  resolveHotelListingReviewDisplay,
  HOTEL_LISTING_REVIEW_FALLBACK,
} from "../../utils/hotelHelper";
import { useNavigate } from "react-router-dom";
import { useHotelStore } from "../../store/UseHotelStore";

type HotellGridCardProps = {
  hotel?: any;
  isFavourite?: boolean;
  isFavouriteLoading?: boolean;
  onToggleFavourite?: () => void;
  onShare?: () => void;
};

const HotellGridCard: React.FC<HotellGridCardProps> = React.memo(
  ({
    hotel,
    onShare,
    onToggleFavourite,
    isFavourite = false,
    isFavouriteLoading = false,
  }) => {
    const navigate = useNavigate();
    const { hotel: bookingParams } = useHotelStore();

    const handleNavigateToDetail = () => {
      if (!hotel?.hotelKey) return;

      const params = new URLSearchParams();

      if (hotel?.searchKey) {
        params.set("searchKey", hotel.searchKey);
      }

      if (bookingParams) {
        params.set("bookingParams", JSON.stringify(bookingParams));
      }

      const queryString = params.toString();

      navigate(
        `/hotel-detail/${hotel.hotelKey}${queryString ? `?${queryString}` : ""}`,
        {
          state: {
            searchKey: hotel.searchKey,
            bookingParams: bookingParams ?? undefined,
          },
        },
      );
    };

    const {
      isAvailable,
      bestRoom,
      currency,
      price,
      totalOriginalPrice: originalPrice,
      uniqueOfferNames,
      hasOffer,
      hasFreeCancellation,
      availableRooms,
    } = processHotelSearchListingData(hotel);

    const apiImages: string[] =
      hotel?.propertyInfo?.images
        ?.map((img: any) => img?.url || img?.imageUrl || img)
        ?.filter((u: any) => typeof u === "string" && u.length > 0) || [];

    const imageUrl =
      apiImages[0] || hotel?.propertyInfo?.imageUrl || HotelImage;
    const imageUrl2 =
      apiImages[1] || hotel?.propertyInfo?.imageUrl2 || HotelImage2;
    const imageUrl3 =
      apiImages[2] || hotel?.propertyInfo?.imageUrl3 || HotelImage3;

    const hotelName = hotel?.propertyInfo?.hotelName || "Hotel";
    const address = hotel?.propertyInfo?.address || "";
    const location = hotel?.propertyInfo?.location || "";
    const starRating = hotel?.propertyInfo?.starRating;
    const listingDescription = getHotelListingDescription(hotel, bestRoom);

    const { reviewScore, reviewCount } = getHotelGuestReviewMeta(hotel);
    const reviewDisplay = resolveHotelListingReviewDisplay(
      reviewScore,
      reviewCount,
    );
    const dealBadgeLabel =
      uniqueOfferNames.length > 0
        ? uniqueOfferNames[0]
        : HOTEL_LISTING_REVIEW_FALLBACK.dealLabel;

    const roomTypeName = bestRoom?.roomTypeName || "";
    const bedType = bestRoom?.bedType || "";

    const rawFacilities = hotel?.propertyInfo?.facilities || [];
    const facilityNames = rawFacilities
      .map((f: any) => (typeof f === "string" ? f : f?.name || ""))
      .filter(Boolean);

    const displayAmenities: string[] = [];
    if (hasFreeCancellation) displayAmenities.push("Free cancellation");

    const childMatch = facilityNames.find((n: string) =>
      /child|family|kids/i.test(n),
    );
    const internetMatch = facilityNames.find((n: string) =>
      /wifi|internet|wi-fi/i.test(n),
    );
    const parkingMatch = facilityNames.find((n: string) =>
      /parking|car park/i.test(n),
    );

    if (childMatch) displayAmenities.push(childMatch);
    else displayAmenities.push("Free child stay");

    if (internetMatch) displayAmenities.push(internetMatch);
    else displayAmenities.push("High internet");

    if (parkingMatch) displayAmenities.push(parkingMatch);
    else displayAmenities.push("Free parking");

    const amenitiesToShow = displayAmenities.slice(0, 4);

    const renderStars = (rating: string | undefined) => {
      const num = rating ? parseFloat(rating) : 0;
      const full = Math.floor(num);
      const total = 7;
      return (
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: full }).map((_, i) => (
            <img src={FilledStar} alt="filled" key={`f-${i}`} />
          ))}
          {Array.from({ length: total - full }).map((_, i) => (
            <img src={EmptyStar} alt="empty" key={`e-${i}`} />
          ))}
        </div>
      );
    };

    if (!hotel) return null;

    return (
      <div
        className="w-full min-w-0 bg-transparent flex flex-col rounded-2xl relative"
        style={{
          border: "1px solid var(--white-300, #E4E4E7)",
        }}
      >
        <div
          className="relative flex-shrink-0 w-full"
          style={{ padding: "10px" }}
        >
          <div
            className="flex w-full aspect-[260/210] cursor-pointer"
            style={{ gap: "5px" }}
            onClick={handleNavigateToDetail}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleNavigateToDetail();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`View ${hotelName} details`}
          >
            <div className="flex-1 min-w-0 overflow-hidden rounded-2xl">
              <HotelProxiedImage
                src={imageUrl}
                alt={hotelName}
                className="w-full h-full object-cover"
                fallback={HotelImage}
              />
            </div>

            <div className="flex flex-col flex-[0_0_42%] min-w-0 gap-1.5">
              <div className="overflow-hidden flex-1 min-h-0 rounded-2xl">
                <HotelProxiedImage
                  src={imageUrl2}
                  alt={hotelName}
                  className="w-full h-full object-cover"
                  fallback={HotelImage2}
                />
              </div>

              <div className="overflow-hidden flex-1 min-h-0 rounded-2xl">
                <HotelProxiedImage
                  src={imageUrl3}
                  alt={hotelName}
                  className="w-full h-full object-cover"
                  fallback={HotelImage3}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="absolute flex items-center justify-center rounded-full shadow-sm hover:scale-110 transition-transform disabled:opacity-60"
            style={{
              top: "22px",
              left: "22px",
              width: "36px",
              height: "36px",
              background: "rgba(255,255,255,0.6)",
            }}
            aria-label="Add to favourites"
            disabled={isFavouriteLoading}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavourite?.();
            }}
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

          <button
            type="button"
            className="absolute flex items-center justify-center rounded-full shadow-sm hover:scale-110 transition-transform"
            style={{
              top: "22px",
              left: "64px",
              width: "36px",
              height: "36px",
              background: "rgba(255,255,255,0.6)",
            }}
            aria-label="Share"
            onClick={(e) => {
              e.stopPropagation();
              onShare?.();
            }}
          >
            <img
              src={Share}
              alt="share"
              style={{ width: "18px", height: "18px", objectFit: "contain" }}
            />
          </button>
        </div>

        <div className="flex flex-col flex-1 px-3 pb-3 pt-2">
          <h3
            className="mb-0.5 cursor-pointer hover:underline hover:text-[#2351A3] transition-colors"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              color: "#0A0C0F",
              lineHeight: "130%",
            }}
            onClick={handleNavigateToDetail}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleNavigateToDetail();
              }
            }}
            role="button"
            tabIndex={0}
          >
            {hotelName}
          </h3>

          <p
            className="mb-2"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: "12px",
              color: "#3D495C",
              lineHeight: "100%",
            }}
          >
            {address}
            {location && ` • ${location}`}
          </p>

          {renderStars(starRating)}

          {listingDescription.trim() ? (
            <p
              className="mb-3 line-clamp-3 w-full max-w-[568px] overflow-hidden"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: "12px",
                color: "#3D495C",
                lineHeight: "1.45",
              }}
            >
              {listingDescription}
            </p>
          ) : null}

          <div className="border-t border-[#E4E4E7] my-2" />

          {/* Figma: same tokens as list (scaled for grid) */}
          <div className="mb-3 flex w-full flex-col items-baseline gap-[10px]">
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
                    }}
                  >
                    {reviewDisplay.score.toFixed(1)}
                  </span>
                </div>
                <div className="flex max-w-[160px] flex-col gap-[6px] pt-[5px] text-justify">
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: "14px",
                      lineHeight: "100%",
                      color: "#00B868",
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
              }}
            >
              {dealBadgeLabel}
            </span>
          </div>

          <div className="mb-2 text-left">
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: "11px",
                color: "#3D495C",
                lineHeight: "100%",
                marginBottom: "4px",
              }}
            >
              Starting from (including VAT)
            </div>
            <div className="flex items-start justify-end gap-1.5">
              <div className="min-w-0 text-left mt-1">
                {hasOffer && originalPrice > price && (
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: "22px",
                      color: "#EA0029",
                      textDecoration: "line-through",
                      lineHeight: "100%",
                      maxWidth: "100%",
                      overflowWrap: "anywhere",
                      whiteSpace: "nowrap",
                      display: "block",
                    }}
                  >
                    {currency} {originalPrice.toFixed(2)}
                  </span>
                )}
                {/* <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "22px",
                    color: "#0A0C0F",
                    lineHeight: "100%",
                    maxWidth: "100%",
                    overflowWrap: "anywhere",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {currency} {price.toFixed(2)}
                </span>
                <span className="text-[12px] font-bold leading-none text-[#3D495C]">
                  /Night
                </span> */}
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
          </div>

          <div className="border-t border-[#E4E4E7] my-2" />

          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-1">
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                color: "#0A0C0F",
                lineHeight: "100%",
              }}
            >
              {roomTypeName}
            </span>
            {isAvailable &&
              availableRooms.length > 0 &&
              availableRooms.length <= 5 && (
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: "11px",
                    color: "#EA0029",
                    lineHeight: "100%",
                  }}
                >
                  Only {availableRooms.length} room
                  {availableRooms.length > 1 ? "s" : ""} left on Al Rais
                </span>
              )}
          </div>

          <p
            className="mb-2"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: "12px",
              color: "#3D495C",
              lineHeight: "100%",
            }}
          >
            {bedType}
          </p>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
            {amenitiesToShow.map((amenity, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <img
                  src={GreenTick}
                  alt="tick"
                  style={{ width: "16px", height: "16px", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    color: "#3D495C",
                    lineHeight: "100%",
                  }}
                >
                  {amenity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

HotellGridCard.displayName = "HotellGridCard";

export default HotellGridCard;
