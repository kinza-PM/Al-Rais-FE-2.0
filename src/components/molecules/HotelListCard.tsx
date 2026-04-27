import React from "react";
import HotelImage from "../../../src/assets/images/Hotel Image.png";
import GreenTick from "../../../src/assets/images/tik.png";
import FilledStar from "../../../src/assets/svgs/filled_star.svg";
import EmptyStar from "../../../src/assets/svgs/empty_star.svg";
import Heart from "../../../src/assets/svgs/heart.svg";
import RedHeart from "../../../src/assets/svgs/red-heart.svg";
import Share from "../../../src/assets/svgs/share-icon.svg";
import HotelPriceSummaryTooltip from "../atoms/HotelPriceSummaryTooltip";
import { aggregateHotelTaxesFromRoomArray } from "../../utils/hotelBookingHelper";
import {
  processHotelSearchListingData,
  getHotelGuestReviewMeta,
  getHotelListingDescription,
  resolveHotelListingReviewDisplay,
  // HOTEL_LISTING_REVIEW_FALLBACK,
} from "../../utils/hotelHelper";
import { HotelProxiedImage } from "../atoms/HotelProxiedImage";
import { useHotelStore } from "../../store/UseHotelStore";

type HotelListCardProps = {
  hotel: any;
  isFavourite: boolean;
  isAddFavouritePending?: boolean;
  onToggleFavourite: (hotel: any) => void;
  onShare: (hotel: any) => void;
  onCheckAvailability: (hotel: any) => void;
};

const HotelListCard: React.FC<HotelListCardProps> = ({
  hotel,
  isFavourite,
  isAddFavouritePending = false,
  onToggleFavourite,
  onShare,
  onCheckAvailability,
}) => {
  const { hotel: bookingParams } = useHotelStore();
  const {
    hasRooms,
    isAvailable,
    bestRoom,
    currency,
    price,
    totalStayPrice,
    hasFreeCancellation,
    totalOriginalPrice: originalPrice,
    uniqueOfferNames,
    hasOffer,
  } = processHotelSearchListingData(hotel, bookingParams ?? null);

  const apiImages: string[] =
    hotel?.propertyInfo?.images
      ?.map((img: any) => img?.url || img?.imageUrl || img)
      ?.filter((u: any) => typeof u === "string" && u.length > 0) || [];
  const imageUrl = apiImages[0] || hotel.propertyInfo?.imageUrl || HotelImage;
  const hotelName = hotel.propertyInfo?.hotelName || "Hotel";
  const address = hotel.propertyInfo?.address || "";
  const locationText = hotel.propertyInfo?.location || "";
  const starRating = hotel.propertyInfo?.starRating;
  const listingDescription = getHotelListingDescription(hotel, bestRoom);
  const distanceFromCenter =
    hotel.propertyInfo?.distanceFromCenter ??
    hotel.propertyInfo?.distanceFromDowntown ??
    "";
  const { reviewScore, reviewCount } = getHotelGuestReviewMeta(hotel);

  const rawFacilities = hotel.propertyInfo?.facilities || [];
  const facilityNames = rawFacilities
    .map((f: any) => (typeof f === "string" ? f : f?.name || ""))
    .filter(Boolean);

  const childMatch = facilityNames.find((n: string) =>
    /child|family|kids/i.test(n),
  );
  const internetMatch = facilityNames.find((n: string) =>
    /wifi|internet|wi-fi/i.test(n),
  );
  const parkingMatch = facilityNames.find((n: string) =>
    /parking|car park/i.test(n),
  );

  const displayAmenities: string[] = [];
  if (hasFreeCancellation) displayAmenities.push("Free cancellation");
  displayAmenities.push(childMatch || "Free child stay");
  displayAmenities.push(internetMatch || "High speed internet");
  displayAmenities.push(parkingMatch || "Free parking");

  if (displayAmenities.length < 4) {
    const used = new Set(displayAmenities.map((a) => a.toLowerCase()));
    const extra = facilityNames.find((n: string) => !used.has(n.toLowerCase()));
    displayAmenities.push(extra || "Breakfast included");
  }

  const amenitiesToShow = displayAmenities.slice(0, 4);
  const reviewDisplay = resolveHotelListingReviewDisplay(
    reviewScore,
    reviewCount,
  );
  // const dealBadgeLabel =
  //   uniqueOfferNames.length > 0
  //     ? uniqueOfferNames[0]
  //     : HOTEL_LISTING_REVIEW_FALLBACK.dealLabel;

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

  return (
    <div
      className="mb-4 bg-transparent relative"
      style={{ borderBottom: "2px solid var(--black-100, #C2CAD6)" }}
    >
      <div className="flex flex-col lg:flex-row gap-4 p-[10px]">
        <div className="relative h-[220px] w-full lg:w-[244px] lg:flex-shrink-0">
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
              top: "7px",
              left: "7px",
              width: "36px",
              height: "36px",
              background: "#FFFFFF99",
            }}
            aria-label="Add to favourites"
            disabled={isAddFavouritePending}
            onClick={() => onToggleFavourite(hotel)}
          >
            {isFavourite ? (
              <img src={RedHeart} alt="Heart" />
            ) : (
              <img src={Heart} alt="Heart" />
            )}
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
                  <div key={aIdx} className="flex items-center gap-[5px]">
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
              <p className="text-[#0A0C0F]">Please select other dates</p>
            </div>
          )}
        </div>

        <span
          className="hidden lg:inline-block self-stretch bg-[#E4E4E7]"
          style={{ width: "1px" }}
        />

        <div className="flex w-[300px] flex-shrink-0 flex-col items-end text-right">
          <div className="mb-[14px] flex w-full flex-col items-baseline gap-[10px]">
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
            {uniqueOfferNames.length > 0 && (
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
                {uniqueOfferNames[0]}
              </span>
            )}
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
              totalPrice={totalStayPrice}
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
                /Room/Night
              </span>
            </div>
          </div>

          <div className="flex w-full items-center justify-end gap-[18px]">
            <button
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
              aria-label="Share"
              onClick={() => onShare(hotel)}
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
              onClick={() => onCheckAvailability(hotel)}
            >
              Select Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelListCard;
