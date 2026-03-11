import React from "react";
import HotelImage from "../../../src/assets/images/Hotel Image.png";
import HotelImage2 from "../../../src/assets/images/hotel-detail-room-1.png";
import HotelImage3 from "../../../src/assets/images/hotel-detail-room-2.png";
import FavrtHeart from "../../../src/assets/images/favrt-heart.png";
import GreenTick from "../../../src/assets/images/tik.png";
import FilledStar from "../../../src/assets/svgs/filled_star.svg";
import EmptyStar from "../../../src/assets/svgs/empty_star.svg";
import Share from "../../../src/assets/svgs/share-icon.svg";
import HotelPriceSummaryTooltip from "./HotelPriceSummaryTooltip";
import { processHotelSearchListingData } from "../../utils/hotelHelper";
// import { useNavigate } from "react-router-dom";
// import { useHotelStore } from "../../store/UseHotelStore";

type HotellGridCardProps = {
  hotel?: any;
  toggleFavorite?: (hotelKey: string) => void;
  favorites?: { [key: string]: boolean };
  hotelKey?: string;
  onShare?: () => void;
};

const getReviewLabel = (score: number): string => {
  if (score >= 9.5) return "Exceptional";
  if (score >= 9.0) return "Excellent";
  if (score >= 8.5) return "Superb";
  if (score >= 8.0) return "Fabulous";
  if (score >= 7.5) return "Very Good";
  if (score >= 7.0) return "Good";
  if (score >= 6.5) return "Pleasant";
  return "Reviewed";
};

const HotellGridCard: React.FC<HotellGridCardProps> = React.memo(
  ({ hotel, onShare }) => {
    // const navigate = useNavigate();
    // const { hotel: bookingParams, clearHotel } = useHotelStore();

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

    // Pull up to 3 distinct images from the API (images array or imageUrl fallback)
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
    const description =
      bestRoom?.roomTypeDesc || hotel?.propertyInfo?.description || "";

    const reviewScore: number | undefined =
      hotel?.propertyInfo?.reviewScore ??
      hotel?.propertyInfo?.guestScore ??
      hotel?.reviewScore ??
      undefined;
    const reviewCount: number | undefined =
      hotel?.propertyInfo?.reviewCount ??
      hotel?.propertyInfo?.totalReviews ??
      hotel?.reviewCount ??
      undefined;

    // Room details
    const roomTypeName = bestRoom?.roomTypeName || "";
    const bedType = bestRoom?.bedType || "";

    // Facilities — Figma: Free cancellation, Free child stay, High speed internet, Free parking
    const rawFacilities = hotel?.propertyInfo?.facilities || [];
    const facilityNames = rawFacilities.map((f: any) =>
      typeof f === "string" ? f : f?.name || ""
    ).filter(Boolean);
    const displayAmenities: string[] = [];
    if (hasFreeCancellation) displayAmenities.push("Free cancellation");
    const childMatch = facilityNames.find((n: string) => /child|family|kids/i.test(n));
    const internetMatch = facilityNames.find((n: string) => /wifi|internet|wi-fi/i.test(n));
    const parkingMatch = facilityNames.find((n: string) => /parking|car park/i.test(n));
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
        className="w-full min-w-0 bg-transparent overflow-hidden flex flex-col rounded-2xl"
        style={{
          border: "1px solid var(--white-300, #E4E4E7)",
        }}
      >
        {/* ── Image section ── */}
        <div
          className="relative flex-shrink-0 w-full"
          style={{ padding: "10px" }}
        >
          <div className="flex w-full aspect-[260/210]" style={{ gap: "5px" }}>
            {/* Main image: ~56% width */}
            <div
              className="flex-1 min-w-0 overflow-hidden rounded-2xl"
            >
              <img
                src={imageUrl}
                alt={hotelName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = HotelImage;
                }}
              />
            </div>

            {/* Right column: two stacked images */}
            <div
              className="flex flex-col flex-[0_0_42%] min-w-0 gap-1.5"
            >
              {/* 2nd image */}
              <div
                className="overflow-hidden flex-1 min-h-0 rounded-2xl"
              >
                <img
                  src={imageUrl2}
                  alt={hotelName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = HotelImage2;
                  }}
                />
              </div>
              {/* 3rd image */}
              <div
                className="overflow-hidden flex-1 min-h-0 rounded-2xl"
              >
                <img
                  src={imageUrl3}
                  alt={hotelName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = HotelImage3;
                  }}
                />
              </div>
            </div>
          </div>

          {/* Heart button — top: 10+12=22, left: 10+12=22 */}
          <button
            className="absolute flex items-center justify-center rounded-full shadow-sm hover:scale-110 transition-transform"
            style={{
              top: "22px",
              left: "22px",
              width: "36px",
              height: "36px",
              background: "rgba(255,255,255,0.6)",
            }}
            aria-label="Add to favourites"
          >
            <img
              src={FavrtHeart}
              alt="favourite"
              style={{ width: "20px", height: "20px", objectFit: "contain" }}
            />
          </button>

          {/* Share button */}
          <button
            className="absolute flex items-center justify-center rounded-full shadow-sm hover:scale-110 transition-transform"
            style={{
              top: "22px",
              left: "64px",
              width: "36px",
              height: "36px",
              background: "rgba(255,255,255,0.6)",
            }}
            aria-label="Share"
            onClick={onShare}
          >
            <img
              src={Share}
              alt="share"
              style={{ width: "18px", height: "18px", objectFit: "contain" }}
            />
          </button>
        </div>

        {/* ── Card body ── */}
        <div className="flex flex-col flex-1 px-3 pb-3 pt-2">
          {/* Hotel name */}
          <h3
            className="mb-0.5"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              color: "#0A0C0F",
              lineHeight: "130%",
            }}
          >
            {hotelName}
          </h3>

          {/* Address */}
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

          {/* Stars */}
          {renderStars(starRating)}

          {/* Rating + Excellent + reviews */}
          {reviewScore != null && (
            <div className="flex items-center gap-2 mb-2">
              <div
                className="flex items-center justify-center rounded-[100px] flex-shrink-0"
                style={{
                  background: "#A7C0EC",
                  padding: "8px 14px",
                  minWidth: "48px",
                  height: "36px",
                }}
              >
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#2351A3",
                    lineHeight: "100%",
                  }}
                >
                  {reviewScore.toFixed(1)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: "13px",
                    color: "#00B868",
                    lineHeight: "100%",
                  }}
                >
                  {getReviewLabel(reviewScore)}
                </span>
                {reviewCount != null && (
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 400,
                      fontSize: "11px",
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

          {/* Description */}
          {description && (
            <p
              className="mb-3 line-clamp-3"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: "12px",
                color: "#3D495C",
                lineHeight: "150%",
              }}
            >
              {description}
            </p>
          )}

          {/* Offer badge */}
          {hasOffer && uniqueOfferNames.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {uniqueOfferNames.map((offerName, idx) => (
                <span
                  key={idx}
                  // style={{
                  //   background: "#00B868",
                  //   color: "#FFFFFF",
                  //   fontFamily: "Inter, sans-serif",
                  //   fontWeight: 600,
                  //   fontSize: "11px",
                  //   borderRadius: "100px",
                  //   padding: "5px 12px",
                  //   display: "inline-block",
                  //   whiteSpace: "nowrap",
                  // }}
                  className="bg-[#00B868] text-[#FFFFFF] text-xs font-semibold px-4 py-1.5 rounded-full inline-block max-w-full break-words"
                >
                  {offerName}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-[#E4E4E7] my-2" />

          {/* Price section */}
          <div className="mb-2">
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
            <div className="flex items-center gap-1.5">
              <div className="flex items-baseline gap-1">
                {hasOffer && originalPrice > price && (
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: "22px",
                      color: "#EA0029",
                      textDecoration: "line-through",
                      lineHeight: "100%",
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
                    fontSize: "22px",
                    color: "#0A0C0F",
                    lineHeight: "100%",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currency} {price.toFixed(2)}
                </span>
                {/* <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "11px",
                    color: "#0A0C0F",
                    lineHeight: "100%",
                  }}
                >
                  /Night
                </span> */}
              </div>
              <HotelPriceSummaryTooltip
                totalPrice={price}
                currency={currency}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#E4E4E7] my-2" />

          {/* Room name + rooms left */}
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
            {isAvailable && availableRooms.length > 0 && availableRooms.length <= 5 && (
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: "11px",
                  color: "#EA0029",
                  lineHeight: "100%",
                }}
              >
                Only {availableRooms.length} room{availableRooms.length > 1 ? "s" : ""} left on Al Rais
              </span>
            )}
          </div>

          {/* Bed type */}
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

          {/* Amenities with green ticks — Figma design */}
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

          {/* Check availability button */}
          {/* <button
            className="w-full mt-3 text-white font-semibold rounded-[100px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              padding: "12px 20px",
              background: isAvailable
                ? "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)"
                : "#C2CAD6",
            }}
            disabled={!isAvailable}
            onClick={() => {
              navigate(`/hotel-detail/${hotel.hotelKey}`, {
                state: {
                  searchKey: hotel.searchKey,
                  bookingParams: bookingParams ?? undefined,
                },
              });
              clearHotel();
            }}
          >
            Check availability
          </button> */}
        </div>
      </div>
    );
  },
);

HotellGridCard.displayName = "HotellGridCard";

export default HotellGridCard;
