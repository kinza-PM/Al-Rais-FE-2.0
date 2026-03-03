import React from "react";
import HotelImage from "../../../src/assets/images/Hotel Image.png";
// import Heart from "../../../src/assets/svgs/heart.svg";
// import RedHeart from "../../../src/assets/svgs/red-heart.svg";
import FilledStar from "../../../src/assets/svgs/filled_star.svg";
import EmptyStar from "../../../src/assets/svgs/empty_star.svg";
import Share from "../../../src/assets/svgs/share-icon.svg";
import AvailableTick from "../../../src/assets/svgs/available-tick.svg";
import HotelPriceSummaryTooltip from "./HotelPriceSummaryTooltip";
import { processHotelSearchListingData } from "../../utils/hotelHelper";

type HotellGridCardProps = {
  hotel?: any;
  toggleFavorite?: (hotelKey: string) => void;
  favorites?: { [key: string]: boolean };
  hotelKey?: string;
  onShare?: () => void;
};

const HotellGridCard: React.FC<HotellGridCardProps> = React.memo(
  ({
    hotel,
    // toggleFavorite,
    // favorites,
    // hotelKey = "",
    onShare,
  }) => {
    // Process hotel data using utility function
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
    } = processHotelSearchListingData(hotel);

    const imageUrl = hotel?.propertyInfo?.imageUrl || HotelImage;
    const hotelName = hotel?.propertyInfo?.hotelName || "Hotel";
    const address = hotel?.propertyInfo?.address || "";
    const location = hotel?.propertyInfo?.location || "";
    const starRating = hotel?.propertyInfo?.starRating;
    const roomTypeName = bestRoom?.roomTypeName || "";

    const renderStars = (rating: string | undefined) => {
      const numRating = rating ? parseFloat(rating) : 0;
      const fullStars = Math.floor(numRating);
      const totalStars = 7;

      return (
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: fullStars }).map((_, i) => (
            <img src={FilledStar} alt="filled" key={`filled-${i}`} />
          ))}
          {Array.from({ length: totalStars - fullStars }).map((_, i) => (
            <img src={EmptyStar} alt="empty" key={`empty-${i}`} />
          ))}
        </div>
      );
    };

    if (!hotel) {
      return null;
    }
    return (
      <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E4E4E7] overflow-hidden mb-2">
        <div className="relative h-56 p-2">
          <div className="flex gap-2 h-full">
            <div className="flex-1 rounded-xl overflow-hidden">
              <img
                src={imageUrl}
                alt={hotelName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = HotelImage;
                }}
              />
            </div>

            {/* <div className="flex flex-col gap-2 w-28">
            <div className="flex-1 rounded-xl overflow-hidden">
              <img
                src={imageUrl}
                alt={hotelName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = HotelImage;
                }}
              />
            </div>
            <div className="flex-1 rounded-xl overflow-hidden">
              <img
                src={imageUrl}
                alt={hotelName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = HotelImage;
                }}
              />
            </div>
          </div> */}
          </div>
          {/* <button
          className="absolute top-4 left-3.5 w-10 h-10 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white/70 transition"
          onClick={() => toggleFavorite?.(hotelKey)}
        >
          <img src={favorites?.[hotelKey] ? RedHeart : Heart} alt="heart" />
        </button> */}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between">
            <h3 className="text-base font-medium text-[#0A0C0F] flex-1">
              {hotelName}
            </h3>
            <button className="p-1" onClick={onShare}>
              <img src={Share} alt="icon" />
            </button>
          </div>

          <p className="text-xs text-[#3D495C] mb-1">
            {address} {location && ` • ${location}`}
          </p>

          {renderStars(starRating)}

          {bestRoom?.roomTypeDesc && (
            <p className="text-xs text-[#3D495C] leading-relaxed mb-3">
              {bestRoom.roomTypeDesc}
            </p>
          )}

          <div className="border-t border-[#E4E4E7] pt-4 -mx-4" />

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

          <div className="mb-3">
            <div className="text-xs text-[#3D495C] mb-1">
              Starting from (including VAT)
            </div>
            <div className="flex items-center gap-2">
              {hasOffer && originalPrice > price && (
                <span className="text-[#EA0029] line-through text-lg font-bold">
                  {currency} {originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-lg font-bold text-[#0A0C0F]">
                {currency} {price.toFixed(2)}
                {/* <span className="text-xs font-normal">/Night</span> */}
              </span>
              <HotelPriceSummaryTooltip
                totalPrice={price}
                currency={currency}
              />
            </div>
          </div>

          {hasRooms && isAvailable && (
            <>
              <div className="border-t border-[#E4E4E7] pt-4 -mx-4" />
              <div className="mb-3">
                <h4 className="text-base font-semibold text-[#0A0C0F]">
                  {roomTypeName}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {hasFreeCancellation && (
                  <div className="flex items-center gap-1.5">
                    <img src={AvailableTick} alt="icon" />
                    <p className="text-[#3D495C] text-xs leading-none">
                      Free cancellation
                    </p>
                  </div>
                )}
                {hotel?.propertyInfo?.facilities &&
                  hotel.propertyInfo.facilities.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <img src={AvailableTick} alt="icon" />
                      <p className="text-[#3D495C] text-xs leading-none">
                        Facilities available
                      </p>
                    </div>
                  )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);

HotellGridCard.displayName = "HotellGridCard";

export default HotellGridCard;
