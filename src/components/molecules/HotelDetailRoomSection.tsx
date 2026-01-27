import { memo, useMemo, useState } from "react";
// import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
// import TravellersAndRoomDropdown from "../atoms/TravellersAndRoomDropdown";
// import type { PassengerSchema } from "../../features/flights/types";
// import Button from "../atoms/Button";
import HotelDetailRoom1 from "../../assets/images/hotel-detail-room-1.png";
import HotelDetailRoom2 from "../../assets/images/hotel-detail-room-2.png";
import HotelDetailRoom3 from "../../assets/images/hotel-detail-room-3.png";
import HotelDetailRoom4 from "../../assets/images/hotel-detail-room-4.png";
import GreatStayIcon from "../../assets/svgs/great_stay.svg";
import KnifeIcon from "../../assets/svgs/knife.svg";
import BedroomIcon from "../../assets/svgs/bedroom.svg";
import BathroomIcon from "../../assets/svgs/bathroom.svg";
import MediaIcon from "../../assets/svgs/media.svg";
import {
  categorizeFacilities,
  FACILITY_KEYWORDS,
  GREAT_KEYWORDS,
} from "../../utils/hotelHelper";
// import { hotelRoomDetails } from "../../utils/mockData";
// import Button from "../atoms/Button";

type HotelDetailRoomSectionProps = {
  // passengers?: PassengerSchema;
  // hotelDetail?: any;
  hotelMoreRooms?: any;
};

const DEFAULT_ROOM_IMAGES = [
  HotelDetailRoom1,
  HotelDetailRoom2,
  HotelDetailRoom3,
  HotelDetailRoom4,
];

const HotelDetailRoomSection: React.FC<HotelDetailRoomSectionProps> = ({
  // passengers,
  // hotelDetail,
  hotelMoreRooms,
}) => {
  const [selectedRoomKey, setSelectedRoomKey] = useState<string | null>(null);
  // const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  // const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  // const { amenities, roomOptions } = hotelRoomDetails;

  // Group API rooms by logical room type so UI can show:
  // 1. One card per room type (e.g. "CLASSIC DOUBLE - Normal rate")
  // 2. Inside that card, multiple pricing options (different rate plans / meal plans / cancellation policies)
  //
  // IMPORTANT: roomIndex (1, 2, etc.) represents WHICH room number, not the room type.
  // Example: "CLASSIC DOUBLE" can have roomIndex 1 AND 2 (same room type, different room numbers).
  // We group by roomTypeName and collect unique rate plans regardless of roomIndex.
  const groupedRooms = useMemo(() => {
    if (!hotelMoreRooms?.rooms || !Array.isArray(hotelMoreRooms.rooms)) {
      return [];
    }
    // Map structure:
    //   key   = roomTypeName (e.g. "CLASSIC DOUBLE - Normal rate")
    //   value = array of unique rate plans for that room type
    const roomMap = new Map<string, any[]>();

    hotelMoreRooms.rooms.forEach((room: any) => {
      const roomTypeName = room.roomTypeName || "";
      if (!roomTypeName) return; // Skip if no room type name

      // IMPORTANT: roomIndex (1, 2, etc.) represents WHICH room number, not the room type.
      // Example: "CLASSIC DOUBLE" can have roomIndex 1 AND 2 (same room type, different room numbers).
      // We group by roomTypeName and collect unique rate plans regardless of roomIndex.

      // Create a unique key for this rate plan combination
      // Same room type can have different rate plans based on:
      // - ratePlan.code
      // - isPackage (package vs non-package)
      // - meal (ROOM ONLY vs BED AND BREAKFAST)
      // - cancelPolicyIndicator (Refundable vs Non-Refundable)
      const ratePlanCode = room.ratePlan?.code || "";
      const isPackage = room.ratePlan?.isPackage || false;
      const meal = room.ratePlan?.meal || "";
      const cancelPolicy = room.ratePlan?.cancelPolicyIndicator || "";

      // Create unique identifier for this rate plan
      const ratePlanKey = `${ratePlanCode}-${isPackage}-${meal}-${cancelPolicy}`;

      // Initialize array for this room type if it doesn't exist
      if (!roomMap.has(roomTypeName)) {
        roomMap.set(roomTypeName, []);
      }

      // Check if this exact rate plan already exists for this room type
      // (regardless of roomIndex - we only want unique rate plans)
      const existingRooms = roomMap.get(roomTypeName) || [];
      const existingIndex = existingRooms.findIndex((r: any) => {
        const existingKey = `${r.ratePlan?.code || ""}-${
          r.ratePlan?.isPackage || false
        }-${r.ratePlan?.meal || ""}-${r.ratePlan?.cancelPolicyIndicator || ""}`;
        return existingKey === ratePlanKey;
      });

      // If this rate plan doesn't exist yet, add it
      if (existingIndex === -1) {
        existingRooms.push(room);
        roomMap.set(roomTypeName, existingRooms);
      } else {
        // If it exists, prefer keeping roomIndex 1 over roomIndex 2 (for consistency)
        // But if current is roomIndex 1 and existing is roomIndex 2, replace it
        if (
          room.roomIndex === 1 &&
          existingRooms[existingIndex].roomIndex !== 1
        ) {
          existingRooms[existingIndex] = room;
        }
      }
    });

    // Convert Map -> array for easier UI rendering:
    // [
    //   { roomTypeName: 'CLASSIC DOUBLE - Normal rate', rooms: [planA, planB] },
    //   { roomTypeName: 'SINGLE STANDARD - Normal rate', rooms: [...] },
    // ]
    // Each 'rooms' array contains unique rate plans (different meal/cancellation/package options)
    return Array.from(roomMap.entries()).map(([roomTypeName, rooms]) => ({
      roomTypeName,
      rooms,
    }));
  }, [hotelMoreRooms?.rooms]);

  const formatPrice = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  const handleRoomSelection = (roomKey: string) => {
    setSelectedRoomKey((prev) => (prev === roomKey ? null : roomKey));
  };

  const numberOfRooms = useMemo(() => {
    if (!hotelMoreRooms?.rooms || !Array.isArray(hotelMoreRooms.rooms)) {
      return 1; // Default to 1 room
    }
    const maxRoomIndex = Math.max(
      ...hotelMoreRooms.rooms.map((room: any) => room.roomIndex || 1)
    );
    return maxRoomIndex > 0 ? maxRoomIndex : 1;
  }, [hotelMoreRooms?.rooms]);

  // const getMaxOccupancy = (room: any) => {
  //   if (room.maxOccupancy && room.maxOccupancy > 0) {
  //     return `${room.maxOccupancy} ${
  //       room.maxOccupancy === 1 ? "Adult" : "Adults"
  //     }`;
  //   }
  //   return "2 Adults"; // Default
  // };

  return (
    <div className="mt-6">
      <h4 className="text-[#0A0C0F] text-base font-bold">Rooms availability</h4>
      {/* <div className="max-w-5xl mx-auto flex items-end mt-8 gap-5">
        <div>
          <label className="block text-[12px] text-[#3D495C] mb-1">Dates</label>
          <div className="h-11 w-full rounded-xl border border-[#DFE7F3] pl-1 pr-3 flex items-center">
            <TailiwindCustomDatePicker
              value={checkInDate}
              onChange={setCheckInDate}
              placeholder="Check-in date"
              buttonIconSrc={true}
              overridesClass={true}
              showCalendarIconRight={false}
              inputClass="h-10 w-[170px] rounded-xl border-none outline-none pl-10 pr-2 text-[14px] text-[#0F172A] bg-transparent cursor-pointer"
            />
            <span className="text-[#94A3B8] select-none">-</span>
            <TailiwindCustomDatePicker
              value={checkOutDate}
              onChange={setCheckOutDate}
              placeholder="Check-out date"
              buttonIconSrc={true}
              overridesClass={true}
              showCalendarIconRight={false}
              inputClass="h-10 w-[170px] rounded-xl border-none pl-10 outline-none text-[14px] text-[#0F172A] bg-transparent cursor-pointer"
            />
          </div>
        </div>
        <div className="w-full">
          <label className="block text-[12px] text-[#3D495C] mb-1">
            Travellers and rooms
          </label>
          <TravellersAndRoomDropdown
            maxTotal={100}
            schema={passengers as PassengerSchema}
          />
        </div>

        <Button
          type="button"
          overrideClasses
          className="bg-[#2351A3] text-[#F2F2F3] text-sm font-semibold px-12 py-3 border-none rounded-lg h-11"
        >
          Search
        </Button>
      </div> */}

      {groupedRooms.length > 0 ? (
        groupedRooms.map((group) => {
          const firstRoom = group.rooms[0];

          // Collect all images from all rooms in the group
          const allRoomImages: string[] = [];
          group.rooms.forEach((room: any) => {
            if (
              room?.roomImages?.image &&
              Array.isArray(room.roomImages.image)
            ) {
              room.roomImages.image.forEach((img: any) => {
                if (img.path && !allRoomImages.includes(img.path)) {
                  allRoomImages.push(img.path);
                }
              });
            }
          });

          // Use collected images or default static images
          const roomImages =
            allRoomImages.length > 0
              ? allRoomImages.slice(0, 4)
              : DEFAULT_ROOM_IMAGES;

          // Get categorized amenities from ALL rooms' facilities
          const categories = [
            "greatForYourStay",
            "kitchen",
            "bedrooms",
            "mediaAndTechnology",
            "bathroom",
          ];

          const allFacilities = group.rooms.flatMap(
            (room: any) => room?.roomFacilities || []
          );

          const categorizedAmenities = categorizeFacilities(
            [allFacilities],
            categories,
            FACILITY_KEYWORDS,
            GREAT_KEYWORDS
          );

          return (
            <div
              key={group.roomTypeName}
              className="relative max-w-7xl mx-auto mt-6 border border-[#E4E4E7] bg-[#FFFFFF] rounded-2xl p-3 mb-6"
            >
              <h2 className="text-base font-medium text-[#0A0C0F] mb-2">
                {firstRoom?.roomTypeName || group.roomTypeName || "Royal Suite"}
              </h2>

              <Seperator />

              <div className="grid grid-cols-[380px_1px_1fr] gap-4">
                <div>
                  <div className="mt-6">
                    <div className="flex items-center mb-3">
                      {roomImages.map((img: any, idx: number) => {
                        const fallback =
                          DEFAULT_ROOM_IMAGES[idx % DEFAULT_ROOM_IMAGES.length];

                        return (
                          <div
                            key={idx}
                            className={`relative w-32 h-32 rounded overflow-hidden cursor-pointer shadow-sm border border-white ${
                              idx > 0 ? "-ml-14" : ""
                            }`}
                          >
                            <img
                              src={img}
                              alt={`Room view ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target =
                                  e.currentTarget as HTMLImageElement;
                                if (target.src !== fallback) {
                                  target.src = fallback;
                                }
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* <p className="text-sm text-[#3D495C]">Room size: 30 m²</p> */}
                  </div>
                </div>

                <div className="border-l border-[#E4E4E7]"></div>

                <div className="py-1">
                  {Object.values(categorizedAmenities).some(
                    (arr) => arr.length > 0
                  ) ? (
                    <>
                      {(categorizedAmenities.greatForYourStay.length > 0 ||
                        categorizedAmenities.kitchen.length > 0 ||
                        categorizedAmenities.bedrooms.length > 0) && (
                        <div
                          className={`grid items-start ${
                            categorizedAmenities.greatForYourStay.length > 0 &&
                            categorizedAmenities.kitchen.length > 0 &&
                            categorizedAmenities.bedrooms.length > 0
                              ? "grid-cols-[2.7fr_1fr_1fr]"
                              : (categorizedAmenities.greatForYourStay.length >
                                  0 &&
                                  (categorizedAmenities.kitchen.length > 0 ||
                                    categorizedAmenities.bedrooms.length >
                                      0)) ||
                                (!categorizedAmenities.greatForYourStay
                                  .length &&
                                  categorizedAmenities.kitchen.length > 0 &&
                                  categorizedAmenities.bedrooms.length > 0)
                              ? "grid-cols-[2.7fr_1fr]"
                              : "grid-cols-1"
                          }`}
                        >
                          {categorizedAmenities.greatForYourStay.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 text-sm text-[#0A0C0F] font-semibold">
                                <img alt="icon" src={GreatStayIcon} />
                                <h5>Great for your stay</h5>
                              </div>
                              <div className="text-xs text-[#3D495C] font-normal flex flex-wrap items-center gap-3 mt-3">
                                {categorizedAmenities.greatForYourStay.map(
                                  (item: string) => (
                                    <span
                                      key={item}
                                      className="flex items-center gap-1 whitespace-nowrap"
                                    >
                                      <CheckIcon />
                                      <span>{item}</span>
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                          {categorizedAmenities.kitchen.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 text-sm text-[#0A0C0F] font-semibold">
                                <img alt="icon" src={KnifeIcon} />
                                <h5>Kitchen</h5>
                              </div>
                              <div className="text-xs text-[#3D495C] font-normal mt-3 flex flex-col gap-2">
                                {categorizedAmenities.kitchen.map(
                                  (it: string) => (
                                    <span
                                      key={it}
                                      className="flex items-center gap-1 whitespace-nowrap"
                                    >
                                      <CheckIcon />
                                      <span>{it}</span>
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                          {categorizedAmenities.bedrooms.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 text-sm text-[#0A0C0F] font-semibold">
                                <img alt="icon" src={BedroomIcon} />
                                <h5>Bedrooms</h5>
                              </div>
                              <div className="text-xs text-[#3D495C] font-normal mt-3 flex flex-col gap-2">
                                {categorizedAmenities.bedrooms.map(
                                  (it: string) => (
                                    <span
                                      key={it}
                                      className="flex items-center gap-1 whitespace-nowrap"
                                    >
                                      <CheckIcon />
                                      <span>{it}</span>
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {(categorizedAmenities.mediaAndTechnology.length > 0 ||
                        categorizedAmenities.bathroom.length > 0) && (
                        <div
                          className={`grid items-start mt-2 gap-2 ${
                            categorizedAmenities.mediaAndTechnology.length >
                              0 && categorizedAmenities.bathroom.length > 0
                              ? "grid-cols-[2.7fr_2fr]"
                              : "grid-cols-1"
                          }`}
                        >
                          {categorizedAmenities.mediaAndTechnology.length >
                            0 && (
                            <div>
                              <div className="flex items-center gap-2 text-sm text-[#0A0C0F] font-semibold">
                                <img alt="icon" src={MediaIcon} />
                                <h5>Media & Technology</h5>
                              </div>
                              <div className="text-xs text-[#3D495C] font-normal flex flex-wrap items-center gap-3 mt-3">
                                {categorizedAmenities.mediaAndTechnology.map(
                                  (item: string) => (
                                    <span
                                      key={item}
                                      className="flex items-center gap-1 whitespace-nowrap"
                                    >
                                      <CheckIcon />
                                      <span>{item}</span>
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                          {categorizedAmenities.bathroom.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 text-sm text-[#0A0C0F] font-semibold">
                                <img alt="icon" src={BathroomIcon} />
                                <h5>Bathroom</h5>
                              </div>
                              <div className="text-xs text-[#3D495C] font-normal mt-3 flex flex-wrap gap-2">
                                {categorizedAmenities.bathroom.map(
                                  (it: string) => (
                                    <span
                                      key={it}
                                      className="flex items-center gap-1 whitespace-nowrap"
                                    >
                                      <CheckIcon />
                                      <span>{it}</span>
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-[#94A3B8] text-xs">
                      No amenities listed
                    </span>
                  )}
                </div>
              </div>

              <Seperator />

              <h2 className="text-base font-normal text-[#000000] mb-2">
                Select an option
              </h2>

              <Seperator />

              <div>
                {group.rooms.map((room: any, index: number) => {
                  const price = room.roomRate?.netAmount || 0;
                  const currency = room.roomRate?.currency || "AED";
                  const mealPlan = room.ratePlan?.meal || "ROOM ONLY";
                  const cancelPolicy =
                    room.ratePlan?.cancelPolicyIndicator || "";
                  const offers = room.offers || [];
                  const hasOffers = offers.length > 0;
                  const originalPrice = hasOffers
                    ? price -
                      offers.reduce(
                        (sum: number, offer: any) => sum + (offer.amount || 0),
                        0
                      )
                    : price;
                  const roomKey =
                    room.roomKey || `${group.roomTypeName}-${index}`;
                  const isSelected = selectedRoomKey === roomKey;

                  return (
                    <div key={roomKey || index}>
                      {/* <div className="flex items-center justify-between gap-5 py-3"> */}
                      <div
                        onClick={() =>
                          price > 0 && handleRoomSelection(roomKey)
                        }
                        className={`flex items-center gap-5 py-4 px-4 -mx-3 rounded-xl transition-all duration-200 ${
                          price > 0
                            ? "cursor-pointer"
                            : "cursor-not-allowed opacity-60"
                        } ${
                          isSelected
                            ? "border border-[#2351A3] bg-[#F0F5FF] shadow-sm"
                            : ""
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-[#2351A3] border-[#2351A3]"
                                : "border-[#C2CAD6] bg-white"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                width="12"
                                height="10"
                                viewBox="0 0 12 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M1 5L4.5 8.5L11 1"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                        </div>

                        <div className="w-48 flex-shrink-0">
                          <h4 className="font-semibold text-sm text-[#3D495C] mb-3">
                            {mealPlan}
                          </h4>
                          <div className="space-y-2 text-sm text-[#3D495C] font-normal">
                            <div className="flex items-center gap-2">
                              <AvaialableIcon />
                              <span>{mealPlan}</span>
                            </div>
                            {cancelPolicy && (
                              <div className="flex items-center gap-2">
                                <AvaialableIcon />
                                <span>{cancelPolicy}</span>
                              </div>
                            )}
                            {hasOffers && (
                              <div className="flex items-center gap-2">
                                <AvaialableIcon />
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: offers[0]?.name || "Special offer",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <p className="text-sm text-[#3D495C] font-normal leading-relaxed">
                            {room.roomTypeDesc ||
                              room.roomTypeName ||
                              "Room description not available"}
                          </p>
                          {hasOffers && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-[#3D495C] line-through">
                                {formatPrice(originalPrice, currency)}
                              </span>
                              <span className="text-sm font-semibold text-[#EA0029]">
                                {formatPrice(price, currency)}
                              </span>
                            </div>
                          )}
                          {!hasOffers && price > 0 && (
                            <div className="mt-2">
                              <span className="text-sm font-semibold text-[#0A0C0F]">
                                {formatPrice(price, currency)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-6">
                          {/* <div className="flex items-center gap-2 text-sm text-[#3D495C] font-normal">
                            <PersonIcon />
                            <span>{getMaxOccupancy(room)}</span>
                          </div> */}
                          {room.roomRate?.rates &&
                            room.roomRate.rates.length > 1 && (
                              <div className="text-sm text-[#3D495C] font-normal">
                                {room.roomRate.rates.map(
                                  (rate: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-2 mb-1"
                                    >
                                      <span className="text-xs">
                                        {new Date(rate.from).toLocaleDateString(
                                          "en-GB",
                                          { day: "2-digit", month: "short" }
                                        )}{" "}
                                        -{" "}
                                        {new Date(rate.to).toLocaleDateString(
                                          "en-GB",
                                          { day: "2-digit", month: "short" }
                                        )}
                                      </span>
                                      <span className="text-xs font-medium">
                                        {formatPrice(
                                          rate.amount,
                                          room.roomRate.currency
                                        )}
                                        /night
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            )}

                          {price > 0 ? (
                            <div className="text-right text-sm text-[#0A0C0F] max-w-64 font-semibold">
                              <div>
                                {formatPrice(price * numberOfRooms, currency)}
                              </div>
                              <div className="text-[11px] text-[#6B7280] font-normal">
                                Total for {numberOfRooms} room
                                {numberOfRooms > 1 ? "s" : ""}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-[#EA0029] max-w-64">
                              Select dates, travelers and rooms to see prices.
                            </div>
                          )}

                          {/* Commented out +/- icons because searching is done with 2 rooms */}
                          {/* <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              className="flex items-center w-7 h-7 rounded-full justify-center text-white text-sm bg-[#C2CAD6] cursor-not-allowed"
                              overrideClasses
                            >
                              <span className="block leading-none">−</span>
                            </Button>

                            <span className="w-8 text-center font-normal text-base text-[#0A0C0F]">
                              {String(0).padStart(2, "0")}
                            </span>

                            <Button
                              type="button"
                              className="flex items-center w-7 h-7 rounded-full justify-center text-white text-sm bg-[#2351A3]"
                              overrideClasses
                            >
                              <span className="block leading-none">+</span>
                            </Button>
                          </div> */}
                        </div>
                      </div>

                      {index < group.rooms.length - 1 && <Seperator />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      ) : (
        <div className="py-6 text-center text-sm font-semibold text-[#3D495C]">
          No rooms available.
        </div>
      )}
    </div>
  );
};

export default memo(HotelDetailRoomSection);

const Seperator = () => {
  return <div className="border-t border-[#E4E4E7] -mx-3 mt-1 mb-2"></div>;
};

const CheckIcon = () => {
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 16 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.4425 1.06754L5.44254 11.0675C5.38449 11.1256 5.31556 11.1717 5.23969 11.2032C5.16381 11.2347 5.08248 11.2508 5.00035 11.2508C4.91821 11.2508 4.83688 11.2347 4.76101 11.2032C4.68514 11.1717 4.61621 11.1256 4.55816 11.0675L0.18316 6.69254C0.0658846 6.57526 0 6.4162 0 6.25035C0 6.0845 0.0658846 5.92544 0.18316 5.80816C0.300435 5.69088 0.459495 5.625 0.625347 5.625C0.7912 5.625 0.95026 5.69088 1.06753 5.80816L5.00035 9.74175L14.5582 0.18316C14.6754 0.0658843 14.8345 -1.2357e-09 15.0003 0C15.1662 1.2357e-09 15.3253 0.0658843 15.4425 0.18316C15.5598 0.300435 15.6257 0.459495 15.6257 0.625347C15.6257 0.7912 15.5598 0.95026 15.4425 1.06754Z"
        fill="#3D495C"
      />
    </svg>
  );
};

// const UnavialableIcon = () => {
//   return (
//     <svg
//       width="17"
//       height="17"
//       viewBox="0 0 17 17"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path
//         d="M8.125 0C6.51803 0 4.94714 0.476523 3.611 1.36931C2.27485 2.2621 1.23344 3.53105 0.618482 5.0157C0.00352044 6.50035 -0.157382 8.13401 0.156123 9.71011C0.469628 11.2862 1.24346 12.7339 2.37976 13.8702C3.51606 15.0065 4.9638 15.7804 6.5399 16.0939C8.11599 16.4074 9.74966 16.2465 11.2343 15.6315C12.719 15.0166 13.9879 13.9752 14.8807 12.639C15.7735 11.3029 16.25 9.73197 16.25 8.125C16.2477 5.97081 15.391 3.90551 13.8677 2.38227C12.3445 0.85903 10.2792 0.00227486 8.125 0ZM11.0672 10.1828C11.1253 10.2409 11.1713 10.3098 11.2027 10.3857C11.2342 10.4616 11.2504 10.5429 11.2504 10.625C11.2504 10.7071 11.2342 10.7884 11.2027 10.8643C11.1713 10.9402 11.1253 11.0091 11.0672 11.0672C11.0091 11.1253 10.9402 11.1713 10.8643 11.2027C10.7884 11.2342 10.7071 11.2503 10.625 11.2503C10.5429 11.2503 10.4616 11.2342 10.3857 11.2027C10.3098 11.1713 10.2409 11.1253 10.1828 11.0672L8.125 9.00859L6.06719 11.0672C6.00912 11.1253 5.94018 11.1713 5.86431 11.2027C5.78844 11.2342 5.70713 11.2503 5.625 11.2503C5.54288 11.2503 5.46156 11.2342 5.38569 11.2027C5.30982 11.1713 5.24088 11.1253 5.18282 11.0672C5.12475 11.0091 5.07868 10.9402 5.04726 10.8643C5.01583 10.7884 4.99966 10.7071 4.99966 10.625C4.99966 10.5429 5.01583 10.4616 5.04726 10.3857C5.07868 10.3098 5.12475 10.2409 5.18282 10.1828L7.24141 8.125L5.18282 6.06719C5.06554 5.94991 4.99966 5.79085 4.99966 5.625C4.99966 5.45915 5.06554 5.30009 5.18282 5.18281C5.30009 5.06554 5.45915 4.99965 5.625 4.99965C5.79086 4.99965 5.94992 5.06554 6.06719 5.18281L8.125 7.24141L10.1828 5.18281C10.2409 5.12474 10.3098 5.07868 10.3857 5.04725C10.4616 5.01583 10.5429 4.99965 10.625 4.99965C10.7071 4.99965 10.7884 5.01583 10.8643 5.04725C10.9402 5.07868 11.0091 5.12474 11.0672 5.18281C11.1253 5.24088 11.1713 5.30982 11.2027 5.38569C11.2342 5.46156 11.2504 5.54288 11.2504 5.625C11.2504 5.70712 11.2342 5.78844 11.2027 5.86431C11.1713 5.94018 11.1253 6.00912 11.0672 6.06719L9.0086 8.125L11.0672 10.1828Z"
//         fill="#EA0029"
//       />
//     </svg>
//   );
// };

const AvaialableIcon = () => {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.125 0C6.51803 0 4.94714 0.476523 3.611 1.36931C2.27485 2.2621 1.23344 3.53105 0.618482 5.0157C0.00352044 6.50035 -0.157382 8.13401 0.156123 9.71011C0.469628 11.2862 1.24346 12.7339 2.37976 13.8702C3.51606 15.0065 4.9638 15.7804 6.5399 16.0939C8.11599 16.4074 9.74966 16.2465 11.2343 15.6315C12.719 15.0166 13.9879 13.9752 14.8807 12.639C15.7735 11.3029 16.25 9.73197 16.25 8.125C16.2477 5.97081 15.391 3.90551 13.8677 2.38227C12.3445 0.85903 10.2792 0.00227486 8.125 0ZM11.6922 6.69219L7.31719 11.0672C7.25915 11.1253 7.19022 11.1714 7.11434 11.2029C7.03847 11.2343 6.95714 11.2505 6.875 11.2505C6.79287 11.2505 6.71154 11.2343 6.63567 11.2029C6.55979 11.1714 6.49086 11.1253 6.43282 11.0672L4.55782 9.19219C4.44054 9.07491 4.37466 8.91585 4.37466 8.75C4.37466 8.58415 4.44054 8.42509 4.55782 8.30781C4.67509 8.19054 4.83415 8.12465 5 8.12465C5.16586 8.12465 5.32492 8.19054 5.44219 8.30781L6.875 9.74141L10.8078 5.80781C10.8659 5.74974 10.9348 5.70368 11.0107 5.67225C11.0866 5.64083 11.1679 5.62465 11.25 5.62465C11.3321 5.62465 11.4134 5.64083 11.4893 5.67225C11.5652 5.70368 11.6341 5.74974 11.6922 5.80781C11.7503 5.86588 11.7963 5.93482 11.8277 6.01069C11.8592 6.08656 11.8754 6.16788 11.8754 6.25C11.8754 6.33212 11.8592 6.41344 11.8277 6.48931C11.7963 6.56518 11.7503 6.63412 11.6922 6.69219Z"
        fill="#00B868"
      />
    </svg>
  );
};

// const PersonIcon = () => {
//   return (
//     <svg
//       width="20"
//       height="20"
//       viewBox="0 0 20 20"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path
//         d="M9.15879 12.3374C9.99645 11.7798 10.6324 10.9674 10.9726 10.0203C11.3128 9.07325 11.3392 8.04185 11.0479 7.07862C10.7566 6.1154 10.1631 5.27149 9.35506 4.67169C8.54704 4.07189 7.56744 3.74805 6.56113 3.74805C5.55483 3.74805 4.57523 4.07189 3.76721 4.67169C2.95918 5.27149 2.36563 6.1154 2.07433 7.07862C1.78303 8.04185 1.80943 9.07325 2.14965 10.0203C2.48986 10.9674 3.12582 11.7798 3.96348 12.3374C2.44824 12.8959 1.15419 13.9293 0.274416 15.2835C0.228179 15.3523 0.196062 15.4295 0.179933 15.5107C0.163804 15.592 0.163984 15.6756 0.180464 15.7568C0.196944 15.838 0.229394 15.915 0.275928 15.9836C0.322462 16.0521 0.382151 16.1107 0.451528 16.1559C0.520904 16.2012 0.598582 16.2322 0.680048 16.2472C0.761513 16.2621 0.845141 16.2607 0.926069 16.2431C1.007 16.2255 1.08361 16.1919 1.15146 16.1444C1.21931 16.0969 1.27704 16.0364 1.32129 15.9664C1.88878 15.0935 2.66532 14.3763 3.58038 13.8798C4.49545 13.3833 5.52004 13.1232 6.56113 13.1232C7.60223 13.1232 8.62682 13.3833 9.54189 13.8798C10.457 14.3763 11.2335 15.0935 11.801 15.9664C11.8926 16.1026 12.0343 16.1973 12.1952 16.23C12.3561 16.2626 12.5234 16.2307 12.661 16.1409C12.7985 16.0512 12.8952 15.911 12.9302 15.7506C12.9652 15.5901 12.9356 15.4224 12.8479 15.2835C11.9681 13.9293 10.674 12.8959 9.15879 12.3374ZM3.12363 8.43745C3.12363 7.75758 3.32524 7.09297 3.70296 6.52768C4.08068 5.96238 4.61754 5.52179 5.24566 5.26161C5.87378 5.00144 6.56495 4.93336 7.23176 5.066C7.89857 5.19864 8.51107 5.52603 8.99181 6.00677C9.47256 6.48751 9.79995 7.10002 9.93258 7.76683C10.0652 8.43364 9.99715 9.1248 9.73697 9.75292C9.47679 10.381 9.0362 10.9179 8.47091 11.2956C7.90561 11.6733 7.24101 11.8749 6.56113 11.8749C5.64977 11.8739 4.77603 11.5114 4.1316 10.867C3.48716 10.2226 3.12467 9.34881 3.12363 8.43745ZM19.5408 16.1484C19.402 16.2389 19.2329 16.2706 19.0707 16.2365C18.9085 16.2023 18.7665 16.1052 18.676 15.9664C18.1092 15.093 17.3327 14.3755 16.4175 13.8791C15.5022 13.3828 14.4773 13.1236 13.4361 13.1249C13.2704 13.1249 13.1114 13.0591 12.9942 12.9419C12.877 12.8247 12.8111 12.6657 12.8111 12.4999C12.8111 12.3342 12.877 12.1752 12.9942 12.058C13.1114 11.9408 13.2704 11.8749 13.4361 11.8749C13.9424 11.8745 14.4422 11.7622 14.9 11.5461C15.3578 11.3301 15.7623 11.0156 16.0844 10.6251C16.4066 10.2346 16.6385 9.77779 16.7637 9.28727C16.8888 8.79676 16.9041 8.28466 16.8084 7.78756C16.7127 7.29047 16.5084 6.82064 16.2101 6.41166C15.9117 6.00268 15.5267 5.66464 15.0826 5.42169C14.6385 5.17874 14.1462 5.03688 13.6409 5.00625C13.1356 4.97562 12.6298 5.05696 12.1596 5.24448C12.0829 5.27762 12.0004 5.29506 11.9169 5.29577C11.8333 5.29647 11.7505 5.28043 11.6733 5.24859C11.5961 5.21675 11.526 5.16975 11.4673 5.11038C11.4085 5.05101 11.3623 4.98046 11.3313 4.90291C11.3003 4.82536 11.2851 4.74238 11.2867 4.65887C11.2883 4.57536 11.3066 4.49302 11.3405 4.41671C11.3745 4.3404 11.4234 4.27167 11.4844 4.21458C11.5453 4.15749 11.6171 4.1132 11.6955 4.08432C12.7717 3.65514 13.9686 3.6397 15.0555 4.04097C16.1423 4.44224 17.0421 5.23179 17.5811 6.25731C18.1202 7.28282 18.2604 8.47164 17.9746 9.59442C17.6889 10.7172 16.9975 11.6944 16.0338 12.3374C17.549 12.8959 18.8431 13.9293 19.7229 15.2835C19.8134 15.4224 19.8451 15.5915 19.8109 15.7537C19.7768 15.9158 19.6796 16.0578 19.5408 16.1484Z"
//         fill="#2351A3"
//       />
//     </svg>
//   );
// };
