import React, { useCallback } from "react";
import HotelImage from "../../../src/assets/images/Hotel Image.png";
import FavrtHeart from "../../../src/assets/images/favrt-heart.png";
import GreenTick from "../../../src/assets/images/tik.png";
import FilledStar from "../../../src/assets/svgs/filled_star.svg";
import EmptyStar from "../../../src/assets/svgs/empty_star.svg";
import Share from "../../../src/assets/svgs/share-icon.svg";
import HotelPriceSummaryTooltip from "../atoms/HotelPriceSummaryTooltip";
import { useNavigate } from "react-router-dom";
import { useHotelStore } from "../../store/UseHotelStore";
import {
  handleHotelShare,
  processHotelSearchListingData,
} from "../../utils/hotelHelper";

type HotelSearchListViewProps = {
  hotels: Array<any>;
};

const HotelSearchListView: React.FC<HotelSearchListViewProps> = React.memo(
  ({ hotels }) => {
    const navigate = useNavigate();
    const { hotel: bookingParams, clearHotel } = useHotelStore();
    // const [favorites, setFavorites] = React.useState<{ [key: string]: boolean }>(
    //   {}
    // );

    // const toggleFavorite = (hotelKey: string) => {
    //   setFavorites((prev) => ({
    //     ...prev,
    //     [hotelKey]: !prev[hotelKey],
    //   }));
    // };

    const renderStars = (rating: string | undefined) => {
      const numRating = rating ? parseFloat(rating) : 0;
      const fullStars = Math.floor(numRating);
      const totalStars = 7; // 7 stars total as per design

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

    const handleShare = useCallback(
      (hotelKey: string, searchKey: string) =>
        handleHotelShare(hotelKey, searchKey, bookingParams),
      [bookingParams],
    );

    if (!hotels || hotels.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center text-center">
          <p className="mt-2 text-[14px] text-[#0F172A]">No hotels found</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen">
        <div className="w-full">
          {hotels.map((hotel, index) => {
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

            const imageUrl = hotel.propertyInfo?.imageUrl || HotelImage;
            const hotelName = hotel.propertyInfo?.hotelName || "Hotel";
            const address = hotel.propertyInfo?.address || "";
            const location = hotel.propertyInfo?.location || "";
            const starRating = hotel.propertyInfo?.starRating;

            return (
              <div
                className="bg-[#FFFFFF] rounded-2xl shadow-sm overflow-hidden mb-4"
                key={index}
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
                    {/* Heart / Favourite button — Figma: 36×36, top:15px, left:15px */}
                    <button
                      className="absolute flex items-center justify-center rounded-full shadow-sm hover:scale-110 transition-transform"
                      style={{
                        top: "15px",
                        left: "15px",
                        width: "36px",
                        height: "36px",
                        background: "#FFFFFF99",
                      }}
                      aria-label="Add to favourites"
                    >
                      <img
                        src={FavrtHeart}
                        alt="favourite"
                        style={{
                          width: "20px",
                          height: "20px",
                          objectFit: "contain",
                        }}
                      />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-[#0A0C0F] mb-1">
                      {hotelName}
                    </h3>

                    <p className="text-xs text-[#3D495C] mb-3">
                      {address} {location && ` • ${location}`}
                    </p>

                    {renderStars(starRating)}

                    {bestRoom?.roomTypeDesc && (
                      <p className="text-xs text-[#3D495C] leading-relaxed mb-3">
                        {bestRoom.roomTypeDesc}
                      </p>
                    )}

                    <span className="block w-full h-px bg-[#E4E4E7] mb-3 -mr-8" />

                    {hasRooms && isAvailable && bestRoom && (
                      <>
                        {/* Row 1: Room name + "Only X rooms left on Al Rais" */}
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h4 className="text-[14px] font-semibold text-[#0A0C0F] leading-tight">
                            {bestRoom.roomTypeName || ""}
                          </h4>
                          {/* <span
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontWeight: 400,
                              fontSize: "12px",
                              lineHeight: "100%",
                              letterSpacing: "0%",
                              color: "#EA0029",
                            }}
                          >
                            Only 2 rooms left on Al Rais
                          </span> */}
                        </div>

                        {/* Row 2: Bed type */}
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

                        {/* Row 3: Amenities with green tick — exactly 4 items as per Figma */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          {/* Free cancellation - always show if hasFreeCancellation, else show as static */}
                          {hasFreeCancellation && (
                            <div className="flex items-center gap-1.5">
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
                                Free cancellation
                              </span>
                            </div>
                          )}

                          {hotel.propertyInfo?.facilities &&
                          hotel.propertyInfo.facilities.length > 0 ? (
                            hotel.propertyInfo.facilities
                              .slice(0, 3)
                              .map((facility: string, fIdx: number) => (
                                <div
                                  key={fIdx}
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
                                    {facility}
                                  </span>
                                </div>
                              ))
                          ) : (
                            <>
                            </>
                          )}
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
                    {/* {index !== 1 && (
                    <>
                      <div>
                        <h4 className="text-base font-semibold text-[#0A0C0F]">
                          Deluxe room{" "}
                          <span className="text-xs text-[#EA0029] font-normal ml-2">
                            Only 2 rooms left on AI Rais
                          </span>
                        </h4>
                      </div>

                      <p className="text-xs text-[#3D495C] font-normal mb-3">
                        1 king bed
                      </p>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1">
                          <div className="flex items-center justify-center">
                            <img src={AvailableTick} alt="icon" />
                          </div>
                          <p className="text-[#3D495C] text-xs leading-none">
                            Free cancellation
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center">
                            <img src={AvailableTick} alt="icon" />
                          </div>
                          <p className="text-[#3D495C] text-xs leading-none">
                            Free child stay
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center">
                            <img src={AvailableTick} alt="icon" />
                          </div>
                          <p className="text-[#3D495C] text-xs leading-none">
                            High speed internet
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center">
                            <img src={AvailableTick} alt="icon" />
                          </div>
                          <p className="text-[#3D495C] text-xs leading-none">
                            Free parking
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {index === 1 && (
                    <div className="flex items-center justify-between gap-6">
                      <div className="text-xs flex flex-col gap-2">
                        <p className="text-[#EA0029] ">
                          No rooms are available on the dates you selected!
                        </p>
                        <p className="text-[#0A0C0F]">
                          Please select other dates
                        </p>
                      </div>

                      <div className="border border-[#C2CAD6] rounded-3xl w-auto mr-6 py-4 px-3">
                        <div className="flex items-center gap-4">
                          <button className="rounded-full border border-[#C2CAD6] flex items-center justify-center p-3">
                            <svg
                              width="15"
                              height="13"
                              viewBox="0 0 15 13"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M15.0005 6.25035C15.0005 6.41611 14.9346 6.57508 14.8174 6.69229C14.7002 6.8095 14.5413 6.87535 14.3755 6.87535H2.13409L6.69268 11.4332C6.75075 11.4912 6.79681 11.5602 6.82824 11.636C6.85966 11.7119 6.87584 11.7932 6.87584 11.8753C6.87584 11.9575 6.85966 12.0388 6.82824 12.1147C6.79681 12.1905 6.75075 12.2595 6.69268 12.3175C6.63461 12.3756 6.56567 12.4217 6.4898 12.4531C6.41393 12.4845 6.33261 12.5007 6.25049 12.5007C6.16837 12.5007 6.08705 12.4845 6.01118 12.4531C5.93531 12.4217 5.86637 12.3756 5.8083 12.3175L0.183304 6.69254C0.125194 6.63449 0.0790945 6.56556 0.0476418 6.48969C0.0161892 6.41381 0 6.33248 0 6.25035C0 6.16821 0.0161892 6.08688 0.0476418 6.01101C0.0790945 5.93514 0.125194 5.86621 0.183304 5.80816L5.8083 0.18316C5.92558 0.0658846 6.08464 -1.2357e-09 6.25049 0C6.41634 1.2357e-09 6.5754 0.0658846 6.69268 0.18316C6.80996 0.300435 6.87584 0.459495 6.87584 0.625347C6.87584 0.7912 6.80996 0.95026 6.69268 1.06753L2.13409 5.62535H14.3755C14.5413 5.62535 14.7002 5.6912 14.8174 5.80841C14.9346 5.92562 15.0005 6.08459 15.0005 6.25035Z"
                                fill="#3D495C"
                              />
                            </svg>
                          </button>

                          <div className="flex gap-3">
                            <div className="flex flex-col items-center pb-2 -mb-5 relative">
                              <span className="text-xs text-[#2351A3] mb-1">
                                Wed, 11 Jun
                              </span>
                              <span className="text-xs font-semibold text-[#EA0029]">
                                No rooms
                              </span>
                              <div
                                className="absolute bottom-0 left-0 right-0 h-1 bg-[#5383DA] rounded-full"
                                style={{ filter: "blur(1px)" }}
                              ></div>
                            </div>
                            <span className="inline-block w-px bg-[#E4E4E7] self-stretch -my-2" />
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-[#3D495C] mb-1">
                                Fri, 13 Jun
                              </span>
                              <span className="text-xs font-semibold text-[#0A0C0F]">
                                $62
                              </span>
                            </div>
                            <span className="inline-block w-px bg-[#E4E4E7] self-stretch -my-2" />
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-[#3D495C] mb-1">
                                Sun, 15 Jun
                              </span>
                              <span className="text-xs font-semibold text-[#0A0C0F]">
                                $70
                              </span>
                            </div>
                            <span className="inline-block w-px bg-[#E4E4E7] self-stretch -my-2" />
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-[#3D495C] mb-1">
                                Mon, 16 Jun
                              </span>
                              <span className="text-xs font-semibold text-[#0A0C0F]">
                                $48
                              </span>
                            </div>
                          </div>

                          <button className="rounded-full border border-[#C2CAD6] flex items-center justify-center p-3">
                            <svg
                              width="15"
                              height="13"
                              viewBox="0 0 15 13"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.8172 6.69254L9.19219 12.3175C9.07491 12.4348 8.91585 12.5007 8.75 12.5007C8.58415 12.5007 8.42509 12.4348 8.30781 12.3175C8.19054 12.2003 8.12465 12.0412 8.12465 11.8753C8.12465 11.7095 8.19054 11.5504 8.30781 11.4332L12.8664 6.87535H0.625C0.45924 6.87535 0.300269 6.8095 0.183058 6.69229C0.0658481 6.57508 0 6.41611 0 6.25035C0 6.08459 0.0658481 5.92562 0.183058 5.80841C0.300269 5.6912 0.45924 5.62535 0.625 5.62535H12.8664L8.30781 1.06753C8.19054 0.95026 8.12465 0.7912 8.12465 0.625347C8.12465 0.459495 8.19054 0.300435 8.30781 0.18316C8.42509 0.0658846 8.58415 0 8.75 0C8.91585 0 9.07491 0.0658846 9.19219 0.18316L14.8172 5.80816C14.8753 5.86621 14.9214 5.93514 14.9528 6.01101C14.9843 6.08688 15.0005 6.16821 15.0005 6.25035C15.0005 6.33248 14.9843 6.41381 14.9528 6.48969C14.9214 6.56556 14.8753 6.63449 14.8172 6.69254Z"
                                fill="#3D495C"
                              />
                            </svg>
                          </button>

                          <button className="rounded-full border border-[#C2CAD6] flex items-center justify-center p-3">
                            <svg
                              width="15"
                              height="17"
                              viewBox="0 0 15 17"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M13.75 1.25H11.875V0.625C11.875 0.45924 11.8092 0.300268 11.6919 0.183058C11.5747 0.065848 11.4158 0 11.25 0C11.0842 0 10.9253 0.065848 10.8081 0.183058C10.6908 0.300268 10.625 0.45924 10.625 0.625V1.25H4.375V0.625C4.375 0.45924 4.30915 0.300268 4.19194 0.183058C4.07473 0.065848 3.91576 0 3.75 0C3.58424 0 3.42527 0.065848 3.30806 0.183058C3.19085 0.300268 3.125 0.45924 3.125 0.625V1.25H1.25C0.918479 1.25 0.600537 1.3817 0.366116 1.61612C0.131696 1.85054 0 2.16848 0 2.5V15C0 15.3315 0.131696 15.6495 0.366116 15.8839C0.600537 16.1183 0.918479 16.25 1.25 16.25H13.75C14.0815 16.25 14.3995 16.1183 14.6339 15.8839C14.8683 15.6495 15 15.3315 15 15V2.5C15 2.16848 14.8683 1.85054 14.6339 1.61612C14.3995 1.3817 14.0815 1.25 13.75 1.25ZM3.125 2.5V3.125C3.125 3.29076 3.19085 3.44973 3.30806 3.56694C3.42527 3.68415 3.58424 3.75 3.75 3.75C3.91576 3.75 4.07473 3.68415 4.19194 3.56694C4.30915 3.44973 4.375 3.29076 4.375 3.125V2.5H10.625V3.125C10.625 3.29076 10.6908 3.44973 10.8081 3.56694C10.9253 3.68415 11.0842 3.75 11.25 3.75C11.4158 3.75 11.5747 3.68415 11.6919 3.56694C11.8092 3.44973 11.875 3.29076 11.875 3.125V2.5H13.75V5H1.25V2.5H3.125ZM13.75 15H1.25V6.25H13.75V15ZM8.4375 9.0625C8.4375 9.24792 8.38252 9.42918 8.2795 9.58335C8.17649 9.73752 8.03007 9.85768 7.85877 9.92864C7.68746 9.99959 7.49896 10.0182 7.3171 9.98199C7.13525 9.94581 6.9682 9.85652 6.83709 9.72541C6.70598 9.5943 6.61669 9.42725 6.58051 9.2454C6.54434 9.06354 6.56291 8.87504 6.63386 8.70373C6.70482 8.53243 6.82498 8.38601 6.97915 8.283C7.13332 8.17998 7.31458 8.125 7.5 8.125C7.74864 8.125 7.9871 8.22377 8.16291 8.39959C8.33873 8.5754 8.4375 8.81386 8.4375 9.0625ZM11.875 9.0625C11.875 9.24792 11.82 9.42918 11.717 9.58335C11.614 9.73752 11.4676 9.85768 11.2963 9.92864C11.125 9.99959 10.9365 10.0182 10.7546 9.98199C10.5727 9.94581 10.4057 9.85652 10.2746 9.72541C10.1435 9.5943 10.0542 9.42725 10.018 9.2454C9.98184 9.06354 10.0004 8.87504 10.0714 8.70373C10.1423 8.53243 10.2625 8.38601 10.4167 8.283C10.5708 8.17998 10.7521 8.125 10.9375 8.125C11.1861 8.125 11.4246 8.22377 11.6004 8.39959C11.7762 8.5754 11.875 8.81386 11.875 9.0625ZM5 12.1875C5 12.3729 4.94502 12.5542 4.842 12.7083C4.73899 12.8625 4.59257 12.9827 4.42127 13.0536C4.24996 13.1246 4.06146 13.1432 3.8796 13.107C3.69775 13.0708 3.5307 12.9815 3.39959 12.8504C3.26848 12.7193 3.17919 12.5523 3.14301 12.3704C3.10684 12.1885 3.12541 12 3.19636 11.8287C3.26732 11.6574 3.38748 11.511 3.54165 11.408C3.69582 11.305 3.87708 11.25 4.0625 11.25C4.31114 11.25 4.5496 11.3488 4.72541 11.5246C4.90123 11.7004 5 11.9389 5 12.1875ZM8.4375 12.1875C8.4375 12.3729 8.38252 12.5542 8.2795 12.7083C8.17649 12.8625 8.03007 12.9827 7.85877 13.0536C7.68746 13.1246 7.49896 13.1432 7.3171 13.107C7.13525 13.0708 6.9682 12.9815 6.83709 12.8504C6.70598 12.7193 6.61669 12.5523 6.58051 12.3704C6.54434 12.1885 6.56291 12 6.63386 11.8287C6.70482 11.6574 6.82498 11.511 6.97915 11.408C7.13332 11.305 7.31458 11.25 7.5 11.25C7.74864 11.25 7.9871 11.3488 8.16291 11.5246C8.33873 11.7004 8.4375 11.9389 8.4375 12.1875ZM11.875 12.1875C11.875 12.3729 11.82 12.5542 11.717 12.7083C11.614 12.8625 11.4676 12.9827 11.2963 13.0536C11.125 13.1246 10.9365 13.1432 10.7546 13.107C10.5727 13.0708 10.4057 12.9815 10.2746 12.8504C10.1435 12.7193 10.0542 12.5523 10.018 12.3704C9.98184 12.1885 10.0004 12 10.0714 11.8287C10.1423 11.6574 10.2625 11.511 10.4167 11.408C10.5708 11.305 10.7521 11.25 10.9375 11.25C11.1861 11.25 11.4246 11.3488 11.6004 11.5246C11.7762 11.7004 11.875 11.9389 11.875 12.1875Z"
                                fill="#2351A3"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )} */}
                  </div>

                  <span className="inline-block w-px bg-[#E4E4E7] self-stretch -my-2" />

                  {/* ── Right panel ── */}
                  <div className="flex flex-col items-start w-72 flex-shrink-0 pl-4 pr-2">
                    {/* Row 1: Rating badge + Excellent + guest reviews */}
                    {/* <div className="flex items-center gap-3 mb-3">
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
                          9.1
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
                          Excellent
                        </span>
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 400,
                            fontSize: "12px",
                            color: "#3D495C",
                            lineHeight: "100%",
                          }}
                        >
                          283 guest reviews
                        </span>
                      </div>
                    </div> */}

                    {/* Row 2: Smashing deal / offer badge */}
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

                    {/* Row 3: "Starting from (including VAT)" label */}
                    <div
                      className="mb-1"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: "12px",
                        color: "#3D495C",
                        lineHeight: "100%",
                      }}
                    >
                      Starting from (including VAT)
                    </div>

                    {/* Row 4: Prices — strikethrough original + current /Night + tooltip */}
                    <div className="flex items-center gap-2 mb-4 w-full">
                      <div className="flex flex-col items-start sm:items-end gap-0.5">
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
                        </span>
                        {/* <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 700,
                            fontSize: "12px",
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

                    {/* Row 5: Share icon + Check availability button */}
                    <div className="flex items-center gap-3 w-full">
                      <button
                        className="p-2 flex-shrink-0"
                        aria-label="Share"
                        onClick={() =>
                          handleShare(hotel.hotelKey, hotel.searchKey)
                        }
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
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

HotelSearchListView.displayName = "HotelSearchListView";

export default HotelSearchListView;
