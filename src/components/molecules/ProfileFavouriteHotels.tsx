import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import HotelImage from "../../assets/images/Hotel Image.png";
import FavrtHeart from "../../assets/images/favrt-heart.png";
import FilledStar from "../../assets/svgs/filled_star.svg";
import EmptyStar from "../../assets/svgs/empty_star.svg";
import Share from "../../assets/svgs/share-icon.svg";

import HotelPriceSummaryTooltip from "../atoms/HotelPriceSummaryTooltip";
import { useGetHotelFavourites } from "../../hooks/useHotelSearch";
import { handleHotelShare } from "../../utils/hotelHelper";
import { useHotelStore } from "../../store/UseHotelStore";

type ParsedPropertyInfo = {
  providerHotelId?: string;
  hotelName?: string;
  address?: string;
  phoneNumber?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  imageUrl?: string;
  facilities?: string[];
  propertyType?: string;
  starRating?: string;
};

type ParsedRoomRate = {
  currency?: string;
  netAmount?: number;
  rates?: Array<{
    name?: string;
    amount?: number;
    from?: string;
    rateIndex?: string;
    to?: string;
  }>;
};

type ParsedRatePlan = {
  supplierCode?: string;
  meal?: string;
  availableStatus?: string;
  cancelPolicyIndicator?: string;
  code?: string;
  isPackage?: boolean;
  fixedCombo?: boolean;
  gstAssured?: boolean;
  lastCancellationDate?: string;
};

type ParsedRoomDetails = {
  roomIndex?: number;
  roomKey?: string;
  roomId?: string;
  roomTypeName?: string;
  roomTypeDesc?: string;
  maxOccupancy?: number;
  roomFacilities?: string[];
  ratePlan?: ParsedRatePlan;
  roomRate?: ParsedRoomRate;
  rateNotes?: string;
  financialInfo?: {
    tmc?: string;
    supplier?: string;
  };
  isAllPaxInfoMandatory?: boolean;
};

type FavouriteApiItem = {
  userType?: string;
  searchKey?: string;
  propertyInfo?: string | ParsedPropertyInfo;
  roomKey?: string;
  updatedAt?: string;
  roomDetails?: string | ParsedRoomDetails[];
  hotelKey?: string;
  userId?: string;
  totalPrice?: string | number;
  createdAt?: string;
};

const safeJsonParse = <T,>(value: unknown, fallback: T): T => {
  if (!value) return fallback;
  if (typeof value !== "string") return value as T;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const ProfileFavouriteHotels: React.FC = () => {
  const navigate = useNavigate();
  const { hotel: bookingParams, clearHotel } = useHotelStore();
  const { data, isLoading, isError, error } = useGetHotelFavourites(true);

  const favourites = useMemo(() => {
    if (!data) return [];

    const raw = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.data)
        ? (data as any).data
        : [];

    return raw.map((item: FavouriteApiItem) => {
      const propertyInfo = safeJsonParse<ParsedPropertyInfo>(
        item.propertyInfo,
        {},
      );

      const roomDetails = safeJsonParse<ParsedRoomDetails[]>(
        item.roomDetails,
        [],
      );

      return {
        ...item,
        propertyInfoParsed: propertyInfo,
        roomDetailsParsed: roomDetails,
        totalPriceParsed:
          typeof item.totalPrice === "number"
            ? item.totalPrice
            : Number(item.totalPrice || 0),
      };
    });
  }, [data]);

  const renderStars = (rating: string | undefined) => {
    const numRating = rating ? parseFloat(rating) : 0;
    const fullStars = Math.floor(numRating);
    const totalStars = 7;

    return (
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: fullStars }).map((_, i) => (
          <img
            key={`filled-${i}`}
            className="w-[15px] h-[15px]"
            src={FilledStar}
            alt="filled"
          />
        ))}
        {Array.from({ length: totalStars - fullStars }).map((_, i) => (
          <img
            key={`empty-${i}`}
            className="w-[15px] h-[15px]"
            src={EmptyStar}
            alt="empty"
          />
        ))}
      </div>
    );
  };

  const handleShareClick = useCallback(
    (hotelKey: string, searchKey: string) =>
      handleHotelShare(hotelKey, searchKey, bookingParams),
    [bookingParams],
  );

  const formatDateShort = (date?: string) => {
    if (!date) return "";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;

    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const getNightPrice = (room: ParsedRoomDetails | null, totalPrice: number) => {
    const rates = room?.roomRate?.rates || [];
    if (rates.length > 0) return rates[0]?.amount || 0;

    const checkinRatesCount = rates.length;
    if (checkinRatesCount > 0) return totalPrice / checkinRatesCount;

    return totalPrice;
  };

  const getDealLabel = (room: ParsedRoomDetails | null) => {
    const meal = room?.ratePlan?.meal?.toLowerCase() || "";
    const cancel = room?.ratePlan?.cancelPolicyIndicator?.toLowerCase() || "";

    if (meal.includes("breakfast")) return "Breakfast included";
    if (cancel.includes("refundable")) return "Flexible deal";
    if (cancel.includes("non-refundable")) return "Best value";
    return "Saved deal";
  };

  const getAvailabilityMessage = (room: ParsedRoomDetails | null) => {
    const status = room?.ratePlan?.availableStatus?.toLowerCase() || "";
    if (status === "available") return null;
    return "No rooms are available on the dates you selected!";
  };

  if (isLoading) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <p className="text-sm text-[#3D495C]">Loading favourite hotels...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <p className="text-sm text-[#EA0029]">
          {(error as any)?.message || "Failed to load favourite hotels."}
        </p>
      </div>
    );
  }

  if (!favourites.length) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center">
        <p className="text-base font-semibold text-[#0A0C0F]">
          No favourite hotels found
        </p>
        <p className="mt-2 text-sm text-[#3D495C]">
          Hotels you add to favourites will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {favourites.map((hotel: any, index: number) => {
        const propertyInfo: ParsedPropertyInfo = hotel.propertyInfoParsed || {};
        const roomDetails: ParsedRoomDetails[] = hotel.roomDetailsParsed || [];
        const bestRoom = roomDetails[0] || null;

        const imageUrl = propertyInfo?.imageUrl || HotelImage;
        const hotelName = propertyInfo?.hotelName || "Hotel";
        const address = propertyInfo?.address || "";
        const location = propertyInfo?.location || "";
        const starRating = propertyInfo?.starRating || "0";

        const currency = bestRoom?.roomRate?.currency || "AED";
        const totalPrice =
          hotel.totalPriceParsed > 0
            ? hotel.totalPriceParsed
            : bestRoom?.roomRate?.netAmount || 0;

        const nightPrice = getNightPrice(bestRoom, totalPrice);
        const rates = bestRoom?.roomRate?.rates || [];
        const previewRates = rates.slice(0, 3);
        const dealLabel = getDealLabel(bestRoom);
        const availabilityMessage = getAvailabilityMessage(bestRoom);

        return (
          <div
            className="bg-[#FFFFFF] rounded-2xl overflow-hidden mb-5"
            key={`${hotel.hotelKey}-${index}`}
          >
            <div className="flex px-3 py-3">
              {/* LEFT IMAGE */}
              <div
                className="relative flex-shrink-0 mr-3"
                style={{ width: "182px", height: "162px" }}
              >
                <img
                  src={imageUrl}
                  alt={hotelName}
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => {
                    e.currentTarget.src = HotelImage;
                  }}
                />

                <button
                  className="absolute flex items-center justify-center rounded-full shadow-sm"
                  style={{
                    top: "10px",
                    left: "10px",
                    width: "30px",
                    height: "30px",
                    background: "#FFFFFFCC",
                  }}
                  aria-label="Favourite hotel"
                  onClick={() => toast("Already in favourites")}
                >
                  <img
                    src={FavrtHeart}
                    alt="favourite"
                    style={{
                      width: "16px",
                      height: "16px",
                      objectFit: "contain",
                    }}
                  />
                </button>
              </div>

              {/* MIDDLE SECTION */}
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-[15px] font-semibold text-[#0A0C0F] mb-1">
                  {hotelName}
                </h3>

                <p className="text-[11px] text-[#3D495C] mb-2 leading-[15px]">
                  {address} {location && ` • ${location}`}
                </p>

                {renderStars(starRating)}

                {bestRoom?.roomTypeDesc && (
                  <p className="text-[11px] text-[#3D495C] leading-[16px] mb-3 line-clamp-3">
                    {bestRoom.roomTypeDesc}
                  </p>
                )}

                <div className="flex items-end justify-between gap-3">
                  <div className="text-[11px] leading-[16px]">
                    {availabilityMessage ? (
                      <>
                        <p className="text-[#EA0029] font-medium">
                          {availabilityMessage}
                        </p>
                        <p className="text-[#0A0C0F] mt-1">
                          Please select other dates
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[#00B868] font-medium">
                          {bestRoom?.ratePlan?.availableStatus || "Available"}
                        </p>
                        <p className="text-[#3D495C] mt-1">
                          {bestRoom?.ratePlan?.meal || "Room only"}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center border border-[#C2CAD6] rounded-[16px] px-3 py-2 min-w-[340px]">
                    <button className="w-8 h-8 rounded-full border border-[#C2CAD6] flex items-center justify-center text-[#3D495C] text-sm flex-shrink-0">
                      ←
                    </button>

                    <div className="flex-1 flex items-stretch justify-center px-3">
                      {previewRates.length > 0 ? (
                        previewRates.map((rate: any, idx: number) => (
                          <React.Fragment key={idx}>
                            <div
                              className={`min-w-[74px] px-3 text-center ${
                                idx === 0 ? "relative" : ""
                              }`}
                            >
                              <div
                                className={`text-[11px] mb-1 ${
                                  idx === 0 ? "text-[#2351A3]" : "text-[#3D495C]"
                                }`}
                              >
                                {formatDateShort(rate?.from)}
                              </div>

                              <div
                                className={`text-[11px] font-semibold ${
                                  idx === 0 && availabilityMessage
                                    ? "text-[#EA0029]"
                                    : "text-[#0A0C0F]"
                                }`}
                              >
                                {idx === 0 && availabilityMessage
                                  ? "No rooms"
                                  : `${currency} ${Number(rate?.amount || 0).toFixed(2)}`}
                              </div>

                              {idx === 0 && (
                                <div className="absolute left-2 right-2 -bottom-[10px] h-[4px] bg-[#5383DA] rounded-full blur-[0.2px]" />
                              )}
                            </div>

                            {idx < previewRates.length - 1 && (
                              <span className="inline-block w-px bg-[#E4E4E7] self-stretch" />
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <div className="min-w-[120px] px-3 text-center">
                          <div className="text-[11px] mb-1 text-[#3D495C]">
                            No daily rates
                          </div>
                          <div className="text-[11px] font-semibold text-[#0A0C0F]">
                            {currency} {nightPrice.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>

                    <button className="w-8 h-8 rounded-full border border-[#C2CAD6] flex items-center justify-center text-[#3D495C] text-sm flex-shrink-0">
                      →
                    </button>

                    <button className="ml-2 w-8 h-8 rounded-full border border-[#C2CAD6] flex items-center justify-center text-[#2351A3] text-sm flex-shrink-0">
                      📅
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT SECTION */}
              <div className="w-[235px] flex-shrink-0 pl-4 border-l border-[#E4E4E7]">
                {/* star-based header because api does not provide guest review score */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-[#A7C0EC] rounded-full min-w-[58px] h-[38px] flex items-center justify-center">
                    <span className="text-[#2351A3] text-[15px] font-semibold">
                      {propertyInfo?.starRating || "0"}
                    </span>
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold text-[#00B868] leading-none">
                      {Number(propertyInfo?.starRating || 0) >= 4
                        ? "Excellent"
                        : Number(propertyInfo?.starRating || 0) >= 3
                          ? "Very good"
                          : "Good"}
                    </p>
                    <p className="text-[12px] text-[#3D495C] mt-1">
                      {bestRoom?.maxOccupancy && bestRoom.maxOccupancy > 0
                        ? `Up to ${bestRoom.maxOccupancy} guests`
                        : "Saved favourite"}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="bg-[#00B868] text-[#FFFFFF] text-[11px] font-semibold px-3 py-1 rounded-full inline-block">
                    {dealLabel}
                  </span>
                </div>

                <div className="text-[12px] text-[#3D495C] mb-1">
                  Starting from (including VAT)
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-end gap-1 flex-wrap">
                    <span className="text-[14px] font-bold text-[#0A0C0F]">
                      {currency} {nightPrice.toFixed(2)}
                    </span>
                    <span className="text-[12px] font-semibold text-[#0A0C0F]">
                      /Night
                    </span>
                  </div>

                  <HotelPriceSummaryTooltip
                    totalPrice={Number(totalPrice)}
                    currency={currency}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="p-1 flex-shrink-0"
                    aria-label="Share"
                    onClick={() =>
                      handleShareClick(hotel.hotelKey, hotel.searchKey)
                    }
                  >
                    <img src={Share} alt="share" className="w-4 h-4" />
                  </button>

                  <button
                    className="flex-1 text-[#F2F2F3] font-semibold rounded-[100px] transition-all"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 600,
                      padding: "12px 18px",
                      background:
                        "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
                    }}
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
                  </button>
                </div>
              </div>
            </div>

            <div className="mx-3 h-px bg-[#AFC3EE]" />
          </div>
        );
      })}
    </div>
  );
};

export default ProfileFavouriteHotels;