import { memo, useMemo, useState, useEffect, useRef, useCallback } from "react";
// import { useMasterListings } from "../../hooks/masterListings/useMasterListings";
// import type { PassengerSchema } from "../../features/flights/types";
import HotelDetailRoom1 from "../../assets/images/hotel-detail-room-1.png";
import HotelDetailRoom2 from "../../assets/images/hotel-detail-room-2.png";
import HotelDetailRoom3 from "../../assets/images/hotel-detail-room-3.png";
import HotelDetailRoom4 from "../../assets/images/hotel-detail-room-4.png";
// import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
// import TravellersAndRoomDropdown from "../atoms/TravellersAndRoomDropdown";
import RoomImageGalleryModal from "../common/RoomImageGalleryModal";
// import Info from "../../assets/svgs/info-black.svg";
import GreatStayIcon from "../../assets/svgs/great_stay.svg";
import KnifeIcon from "../../assets/svgs/knife.svg";
import BedroomIcon from "../../assets/svgs/bedroom.svg";
import BathroomIcon from "../../assets/svgs/bathroom.svg";
import MediaIcon from "../../assets/svgs/media.svg";
import {
  categorizeFacilities,
  FACILITY_KEYWORDS,
  GREAT_KEYWORDS,
  resolveHotelStayNightCount,
} from "../../utils/hotelHelper";
import {
  // convertDateToString,
  // getHotelBookingValidationError,
  normalizeHotelBookingParams,
  type HotelBookingParams,
} from "../../utils/hotelBookingParams";

type SelectedRoom = {
  roomKey: string;
  room: any;
  count: number;
  selectedAt?: number;
};

type HotelDetailRoomSectionProps = {
  bookingParams?: HotelBookingParams;
  hotelDetail?: any;
  hotelMoreRooms?: any;
  selectedRooms?: SelectedRoom[];
  onRoomsChange?: (selectedRooms: SelectedRoom[]) => void;
  onBookingParamsChange?: (bookingParams: HotelBookingParams) => void;
  isSearching?: boolean;
};

function buildGroupedRoomsForRooms(
  rooms: any[],
): { roomTypeName: string; rooms: any[] }[] {
  const roomMap = new Map<string, any[]>();

  rooms.forEach((room: any) => {
    const roomTypeName = room.roomTypeName || "";
    if (!roomTypeName) return;

    const ratePlanCode = room.ratePlan?.code || "";
    const isPackage = room.ratePlan?.isPackage || false;
    const meal = room.ratePlan?.meal || "";
    const cancelPolicy = room.ratePlan?.cancelPolicyIndicator || "";
    const ratePlanKey = `${ratePlanCode}-${isPackage}-${meal}-${cancelPolicy}`;

    if (!roomMap.has(roomTypeName)) roomMap.set(roomTypeName, []);
    const existingRooms = roomMap.get(roomTypeName) || [];

    const existingIndex = existingRooms.findIndex((r: any) => {
      const k = `${r.ratePlan?.code || ""}-${r.ratePlan?.isPackage || false}-${r.ratePlan?.meal || ""}-${r.ratePlan?.cancelPolicyIndicator || ""}`;
      return k === ratePlanKey;
    });

    if (existingIndex === -1) {
      existingRooms.push(room);
      roomMap.set(roomTypeName, existingRooms);
    } else if (
      room.roomIndex === 1 &&
      existingRooms[existingIndex].roomIndex !== 1
    ) {
      existingRooms[existingIndex] = room;
    }
  });

  return Array.from(roomMap.entries()).map(([roomTypeName, rooms]) => ({
    roomTypeName,
    rooms,
  }));
}

const DEFAULT_ROOM_IMAGES = [
  HotelDetailRoom1,
  HotelDetailRoom2,
  HotelDetailRoom3,
  HotelDetailRoom4,
];

function selectedRoomsToMap(
  selectedRooms: SelectedRoom[] | undefined,
): Map<number, { roomKey: string; room: any }> {
  const map = new Map<number, { roomKey: string; room: any }>();
  if (!selectedRooms?.length) return map;

  selectedRooms.forEach((s) => {
    const ri = s.room?.roomIndex ?? 1;
    map.set(ri, { roomKey: s.roomKey, room: s.room });
  });

  return map;
}

const HotelDetailRoomSection: React.FC<HotelDetailRoomSectionProps> = ({
  bookingParams,
  hotelDetail,
  hotelMoreRooms,
  selectedRooms: selectedRoomsFromParent,
  onRoomsChange,
  // onBookingParamsChange,
  // isSearching = false,
}) => {
  // const { passengers } = useMasterListings({
  //   include: ["passengers"],
  // });
  const normalizedBookingParams = useMemo(
    () => normalizeHotelBookingParams(bookingParams),
    [bookingParams],
  );
  const selectionByRoomIndex = useMemo(
    () => selectedRoomsToMap(selectedRoomsFromParent),
    [selectedRoomsFromParent],
  );

  const [expandedRoomIndices, setExpandedRoomIndices] = useState<Set<number>>(
    new Set([1]),
  );

  const roomSectionRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  const numberOfRooms = useMemo(() => {
    if (!hotelMoreRooms?.rooms || !Array.isArray(hotelMoreRooms.rooms)) {
      return 1;
    }

    const maxRoomIndex = Math.max(
      ...hotelMoreRooms.rooms.map((room: any) => room.roomIndex || 1),
    );

    return maxRoomIndex > 0 ? maxRoomIndex : 1;
  }, [hotelMoreRooms?.rooms]);

  const roomIndices = useMemo(
    () => Array.from({ length: numberOfRooms }, (_, i) => i + 1),
    [numberOfRooms],
  );

  const roomsByRoomIndex = useMemo(() => {
    if (!hotelMoreRooms?.rooms || !Array.isArray(hotelMoreRooms.rooms)) {
      return new Map<number, { roomTypeName: string; rooms: any[] }[]>();
    }

    const byIndex = new Map<number, any[]>();

    hotelMoreRooms.rooms.forEach((room: any) => {
      const idx = room.roomIndex ?? 1;
      if (!byIndex.has(idx)) byIndex.set(idx, []);
      byIndex.get(idx)!.push(room);
    });

    const result = new Map<number, { roomTypeName: string; rooms: any[] }[]>();
    byIndex.forEach((rooms, idx) => {
      result.set(idx, buildGroupedRoomsForRooms(rooms));
    });

    return result;
  }, [hotelMoreRooms?.rooms]);

  const formatPrice = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  useEffect(() => {
    const nextUnselected = roomIndices.find(
      (ri) => !selectionByRoomIndex.has(ri),
    );

    setExpandedRoomIndices((prev) => {
      const next = new Set<number>();
      if (nextUnselected != null) next.add(nextUnselected);

      prev.forEach((ri) => {
        if (ri === nextUnselected) return;
        if (!selectionByRoomIndex.has(ri)) next.add(ri);
      });

      return next.size > 0 ? next : new Set();
    });
  }, [selectionByRoomIndex, roomIndices]);

  const scrollToRoom = useCallback((roomIndex: number) => {
    setExpandedRoomIndices((prev) => new Set(prev).add(roomIndex));

    setTimeout(() => {
      const el = roomSectionRefs.current.get(roomIndex);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const headerOffset = 140;
      const absoluteY = window.scrollY + rect.top - headerOffset;
      window.scrollTo({ top: Math.max(0, absoluteY), behavior: "smooth" });
    }, 50);
  }, []);

  const toggleExpanded = useCallback((roomIndex: number) => {
    setExpandedRoomIndices((prev) => {
      const next = new Set(prev);
      if (next.has(roomIndex)) next.delete(roomIndex);
      else next.add(roomIndex);
      return next;
    });
  }, []);

  const getSelectedItem = useCallback(
    (roomIndex: number, roomKey: string) => {
      return (selectedRoomsFromParent ?? []).find(
        (s) => (s.room?.roomIndex ?? 1) === roomIndex && s.roomKey === roomKey,
      );
    },
    [selectedRoomsFromParent],
  );

  const updateRoomCount = useCallback(
    (roomIndex: number, roomKey: string, room: any, delta: number) => {
      if (!onRoomsChange) return;

      const current = (selectedRoomsFromParent ?? []).slice();
      const idx = current.findIndex(
        (s) => (s.room?.roomIndex ?? 1) === roomIndex && s.roomKey === roomKey,
      );

      if (idx === -1) {
        if (delta <= 0) return;

        const withoutThisRoomIndex = current.filter(
          (s) => (s.room?.roomIndex ?? 1) !== roomIndex,
        );

        const next = [
          ...withoutThisRoomIndex,
          { roomKey, room, count: 1, selectedAt: Date.now() } as SelectedRoom,
        ];

        next.sort((a, b) => (a.room?.roomIndex ?? 1) - (b.room?.roomIndex ?? 1));
        onRoomsChange(next);
        return;
      }

      const nextCount = (current[idx].count ?? 1) + delta;

      if (nextCount <= 0) {
        const next = current.filter((_, i) => i !== idx);
        onRoomsChange(next);
        return;
      }

      current[idx] = { ...current[idx], count: nextCount };
      onRoomsChange(current);
    },
    [onRoomsChange, selectedRoomsFromParent],
  );

  const isNegativePolicy = (text?: string) => {
    const t = (text ?? "").toLowerCase();
    return (
      t.includes("non refundable") ||
      t.includes("non-refundable") ||
      t.includes("no amendments")
    );
  };

  // const getAvailabilityCount = (room: any) => {
  //   const matchingAvailableRooms = (hotelMoreRooms?.rooms || []).filter(
  //     (candidate: any) => {
  //       const candidateRatePlan = candidate?.ratePlan || {};
  //       const roomRatePlan = room?.ratePlan || {};

  //       return (
  //         candidate?.roomTypeName === room?.roomTypeName &&
  //         (candidateRatePlan?.meal || "") === (roomRatePlan?.meal || "") &&
  //         (candidateRatePlan?.code || "") === (roomRatePlan?.code || "") &&
  //         (candidateRatePlan?.cancelPolicyIndicator || "") ===
  //         (roomRatePlan?.cancelPolicyIndicator || "") &&
  //         candidateRatePlan?.availableStatus === "Available"
  //       );
  //     },
  //   ).length;

  //   if (matchingAvailableRooms > 0) {
  //     return matchingAvailableRooms;
  //   }

  //   const candidates = [
  //     room?.availableRooms?.length,
  //     room?.availableRoomsCount,
  //     room?.availableRoomCount,
  //     room?.roomRate?.availableRoomsCount,
  //     room?.roomRate?.remainingRooms,
  //     room?.roomRate?.allotment,
  //     room?.allotment,
  //   ];

  //   return (
  //     candidates.find((value) => typeof value === "number" && value > 0) ?? null
  //   );
  // };

  const getRoomDescription = (room: any) =>
    room?.roomTypeDesc ||
    room?.description ||
    room?.roomTypeName ||
    "Room description not available";

  const getRoomSize = (room: any) => room?.roomSize || room?.size || "25 m²";

  const getMealPlanLabel = (room: any) =>
    room?.ratePlan?.meal?.trim() || "Room Only";

  const getPlanHighlights = (room: any, mealPlan: string) => {
    const items: Array<{
      text: string;
      negative?: boolean;
      html?: boolean;
    }> = [];

    if (mealPlan) {
      items.push({ text: mealPlan });
    }

    if (room?.ratePlan?.cancelPolicyIndicator) {
      items.push({
        text: room.ratePlan.cancelPolicyIndicator,
        negative: isNegativePolicy(room.ratePlan.cancelPolicyIndicator),
      });
    }

    if (Array.isArray(room?.offers)) {
      room.offers.forEach((offer: any) => {
        if (offer?.name) {
          items.push({
            text: offer.name,
            html: true,
          });
        }
      });
    }

    return items.slice(0, 5);
  };

  // const [checkInDate, setCheckInDate] = useState<Date | null>(
  //   normalizedBookingParams?.checkIn
  //     ? new Date(normalizedBookingParams.checkIn)
  //     : null,
  // );
  // const [checkOutDate, setCheckOutDate] = useState<Date | null>(
  //   normalizedBookingParams?.checkOut
  //     ? new Date(normalizedBookingParams.checkOut)
  //     : null,
  // );
  // const [paxData, setPaxData] = useState<{
  //   adults?: number;
  //   kids?: number;
  //   children?: number;
  //   rooms?: number;
  // }>({
  //   adults: normalizedBookingParams?.paxData?.adults ?? 1,
  //   kids:
  //     normalizedBookingParams?.paxData?.kids ??
  //     normalizedBookingParams?.paxData?.children ??
  //     0,
  //   children:
  //     normalizedBookingParams?.paxData?.children ??
  //     normalizedBookingParams?.paxData?.kids ??
  //     0,
  //   rooms: normalizedBookingParams?.paxData?.rooms ?? numberOfRooms ?? 1,
  // });
  // const [childAges, setChildAges] = useState<Array<number | null>>(
  //   normalizedBookingParams?.childAges ?? [],
  // );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  const [galleryRoomTitle, setGalleryRoomTitle] = useState("Room images");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [expandedOptionGroups, setExpandedOptionGroups] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    // setCheckInDate(
    //   normalizedBookingParams?.checkIn
    //     ? new Date(normalizedBookingParams.checkIn)
    //     : null,
    // );
    // setCheckOutDate(
    //   normalizedBookingParams?.checkOut
    //     ? new Date(normalizedBookingParams.checkOut)
    //     : null,
    // );
    // setPaxData({
    //   adults: normalizedBookingParams?.paxData?.adults ?? 1,
    //   kids:
    //     normalizedBookingParams?.paxData?.kids ??
    //     normalizedBookingParams?.paxData?.children ??
    //     0,
    //   children:
    //     normalizedBookingParams?.paxData?.children ??
    //     normalizedBookingParams?.paxData?.kids ??
    //     0,
    //   rooms: normalizedBookingParams?.paxData?.rooms ?? numberOfRooms ?? 1,
    // });
    // setChildAges(normalizedBookingParams?.childAges ?? []);
    setValidationError(null);
  }, [normalizedBookingParams, numberOfRooms]);

  // const handlePaxChange = useCallback(
  //   (nextPax: {
  //     adults?: number;
  //     kids?: number;
  //     children?: number;
  //     rooms?: number;
  //   }) => {
  //     setPaxData(nextPax);
  //   },
  //   [],
  // );

  // const handleChildrenAgesChange = useCallback(
  //   (ages: Array<number | null>) => {
  //     setChildAges(ages);
  //   },
  //   [],
  // );

  // const validateToolbarSearch = useCallback(() => {
  //   const validationMessage = getHotelBookingValidationError({
  //     country: normalizedBookingParams?.country,
  //     city: normalizedBookingParams?.city,
  //     checkIn: convertDateToString(checkInDate),
  //     checkOut: convertDateToString(checkOutDate),
  //     travelerCountryOfResidence:
  //       normalizedBookingParams?.travelerCountryOfResidence,
  //     paxData,
  //     childAges,
  //     requireSearchContext: true,
  //   });

  //   if (validationMessage) {
  //     setValidationError(validationMessage);
  //     return false;
  //   }

  //   setValidationError(null);
  //   return true;
  // }, [
  //   normalizedBookingParams?.country,
  //   normalizedBookingParams?.city,
  //   normalizedBookingParams?.travelerCountryOfResidence,
  //   checkInDate,
  //   checkOutDate,
  //   paxData,
  //   childAges,
  // ]);

  // const handleToolbarSearch = useCallback(() => {
  //   if (!validateToolbarSearch()) {
  //     return;
  //   }

  //   onBookingParamsChange?.({
  //     ...normalizedBookingParams,
  //     checkIn: convertDateToString(checkInDate),
  //     checkOut: convertDateToString(checkOutDate),
  //     paxData: {
  //       adults: paxData.adults ?? 1,
  //       children: paxData.children ?? paxData.kids ?? 0,
  //       kids: paxData.kids ?? paxData.children ?? 0,
  //       rooms: paxData.rooms ?? 1,
  //     },
  //     childAges,
  //   });
  // }, [
  //   validateToolbarSearch,
  //   normalizedBookingParams,
  //   checkInDate,
  //   checkOutDate,
  //   paxData,
  //   childAges,
  //   onBookingParamsChange,
  // ]);

  const openRoomImageGallery = useCallback(
    (images: string[], initialIndex: number, roomTitle?: string) => {
      setGalleryImages(images);
      setGalleryInitialIndex(initialIndex);
      setGalleryRoomTitle(roomTitle || "Room images");
      setIsGalleryOpen(true);
    },
    [],
  );

  return (
    <div className="mt-6">
      <div className="mx-auto max-w-8xl">
        <h4 className="text-[#0A0C0F] text-base font-bold">Rooms availability</h4>
        <div className="mt-2 border-t border-[#E4E4E7]" />

        {/* <div className="mt-8 flex flex-col items-stretch justify-start gap-4 lg:flex-row lg:items-end">
          <div className="hotel-filter-dates w-full min-w-0 lg:max-w-[460px]">
            <div className="mb-2 text-[12px] font-normal text-[#3D495C]">Dates</div>
            <div
              className="h-[50px] w-full min-w-0 rounded-[16px] border border-[#C2CAD6] px-2 flex items-center"
              style={{ background: "var(--white-200, #FFFFFF)", pointerEvents: "none" }}
            >
              <TailiwindCustomDatePicker
                value={checkInDate}
                onChange={setCheckInDate}
                placeholder="Check-in date"
                buttonIconSrc={true}
                overridesClass={true}
                showCalendarIconRight={false}
                inputClass="h-[50px] flex-1 min-w-0 rounded-[16px] border-none outline-none pl-10 pr-1 text-[12px] sm:text-[14px] text-[#0F172A] bg-transparent cursor-pointer w-full"
                disablePastDates={true}
              />
              <span className="select-none px-1 text-[#94A3B8]">—</span>
              <TailiwindCustomDatePicker
                value={checkOutDate}
                onChange={setCheckOutDate}
                placeholder="Check-out date"
                buttonIconSrc={true}
                overridesClass={true}
                showCalendarIconRight={false}
                inputClass="h-[50px] flex-1 min-w-0 rounded-[16px] border-none outline-none pl-10 pr-2 text-[12px] sm:text-[14px] text-[#0F172A] bg-transparent cursor-pointer w-full"
                disablePastDates={true}
                minDate={checkInDate || undefined}
              />
            </div>
          </div>

          <div className="hotel-filter-travellers w-full min-w-0 lg:max-w-[360px]">
            <label className="block text-[12px] text-[#3D495C] mb-1 flex items-center gap-2">
              Travellers and rooms{" "}
              <span className="relative inline-flex group/info">
                <img
                  src={Info}
                  alt="info"
                  className="w-4 h-4 inline-block align-middle flex-shrink-0"
                />
                <span
                  className="pointer-events-none absolute bottom-full left-full -translate-x-1/3 mb-2 hidden group-hover/info:block z-50 px-3 py-2 text-xs leading-5 text-white bg-[#1E293B] rounded-lg shadow-lg whitespace-nowrap text-center before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-6 before:border-transparent before:border-t-[#1E293B]"
                  role="tooltip"
                >
                  Minimum 1 adult required per room <br />
                  Maximum 2 adults allowed per room <br />
                  Maximum 2 children allowed per room <br />
                  Child age must be within 2 and 12 years
                </span>
              </span>
            </label>
            <div style={{ pointerEvents: "none" }}>
              <TravellersAndRoomDropdown
                maxTotal={100}
                schema={passengers as PassengerSchema}
                value={paxData}
                onChange={handlePaxChange}
                initialChildAges={childAges}
                onChildrenAgesChange={handleChildrenAgesChange}
                errorMessage={
                  validationError &&
                    /adult|required for|children|ages|room/i.test(validationError)
                    ? validationError
                    : null
                }
              />
            </div>
          </div>

         
        </div> */}

        {validationError && (
          <p className="mt-3 text-[12px] text-[#E65959]">{validationError}</p>
        )}

        {numberOfRooms > 1 &&
          (() => {
            const hasAnyRooms = Array.from(roomsByRoomIndex.values()).some(
              (arr) => arr.length > 0,
            );
            if (!hasAnyRooms) return null;

            return (
              <div className="sticky top-0 z-10 mt-4 mb-4 py-2 px-3 bg-[#F8FAFC] border border-[#E4E4E7] rounded-xl flex items-center gap-2 shadow-sm overflow-x-auto">
                {roomIndices.map((ri) => {
                  const isSelected = selectionByRoomIndex.has(ri);
                  const isExpanded = expandedRoomIndices.has(ri);

                  return (
                    <button
                      key={ri}
                      type="button"
                      onClick={() => scrollToRoom(ri)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isSelected
                        ? "bg-[#2351A3] text-white"
                        : isExpanded
                          ? "bg-[#E8EEF7] text-[#2351A3] ring-1 ring-[#2351A3]"
                          : "bg-white text-[#3D495C] hover:bg-[#E4E4E7] border border-[#E4E4E7]"
                        }`}
                    >
                      <span>Room {ri}</span>
                      {isSelected && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          className="flex-shrink-0"
                        >
                          <path
                            d="M11.5 4L5.5 10L2.5 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {!isSelected && isExpanded && (
                        <span className="text-[10px]">→</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })()}

        {(() => {
          const hasAnyRooms = Array.from(roomsByRoomIndex.values()).some(
            (arr) => arr.length > 0,
          );

          if (!hasAnyRooms) {
            return (
              <div className="py-6 text-center text-sm font-semibold text-[#3D495C]">
                No rooms available.
              </div>
            );
          }

          return roomIndices.map((roomIndex) => {
            const groupedRoomsForIndex = roomsByRoomIndex.get(roomIndex) || [];
            if (groupedRoomsForIndex.length === 0) return null;

            const selectedForRoom = selectionByRoomIndex.get(roomIndex);
            const isExpanded = expandedRoomIndices.has(roomIndex);
            const isSelected = !!selectedForRoom;
            const showCollapsed = isSelected && !isExpanded;
            const showExpanded = isExpanded || !isSelected;

            return (
              <div
                key={`room-index-${roomIndex}`}
                ref={(el) => {
                  roomSectionRefs.current.set(roomIndex, el);
                }}
                className="relative max-w-7xl mx-auto mt-6 mb-6 scroll-mt-24"
              >
                {showCollapsed && (
                  <div
                    onClick={() => toggleExpanded(roomIndex)}
                    className="border border-[#2351A3] bg-[#F0F5FF] rounded-xl p-4 cursor-pointer hover:bg-[#E8EEF7] transition-colors flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="flex-shrink-0 text-[#2351A3]"
                      >
                        <path
                          d="M11.5 4L5.5 10L2.5 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="font-semibold text-[#0A0C0F]">
                        Room {roomIndex}
                      </span>
                      <span className="text-[#3D495C]">—</span>
                      <span className="text-sm text-[#3D495C] truncate max-w-[200px]">
                        {selectedForRoom?.room?.roomTypeName || "Room"}
                      </span>
                      <span className="text-sm text-[#3D495C]">
                        • {selectedForRoom?.room?.ratePlan?.meal || "ROOM ONLY"}
                      </span>
                      <span className="text-sm font-semibold text-[#0A0C0F]">
                        {formatPrice(
                          (selectedForRoom?.room?.roomRate?.netAmount || 0) /
                            Math.max(
                              1,
                              resolveHotelStayNightCount(
                                selectedForRoom?.room,
                                normalizedBookingParams,
                              ),
                            ),
                          selectedForRoom?.room?.roomRate?.currency || "AED",
                        )}
                        <span className="ml-[4px] text-xs font-normal text-[#3D495C]">
                          /night
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#2351A3]">
                        Change
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className={`transition-transform ${isExpanded ? "rotate-180" : ""
                          }`}
                      >
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {showExpanded && (
                  <>
                    <div
                      role="button"
                      tabIndex={0}
                      className="flex items-center justify-between gap-3 mb-3 py-1 -mx-1 px-1 rounded-lg cursor-pointer transition-colors group"
                      aria-expanded="true"
                      aria-label={`Collapse Room ${roomIndex}`}
                    >
                      <h3 className="text-base font-semibold text-[#0A0C0F]">
                        Room {roomIndex} — Select one option
                      </h3>
                    </div>

                    {groupedRoomsForIndex.map((group, groupIndex) => {
                      const firstRoom = group.rooms[0];
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

                      const gallerySourceImages =
                        allRoomImages.length > 0 ? allRoomImages : DEFAULT_ROOM_IMAGES;
                      const roomImages = gallerySourceImages.slice(0, 4);

                      const categories = [
                        "greatForYourStay",
                        "kitchen",
                        "bedrooms",
                        "mediaAndTechnology",
                        "bathroom",
                      ];

                      const unwantedKeywords = [
                        "total number",
                        "hotel",
                        "american express",
                        "mastercard",
                        "visa",
                        "identification",
                        "**",
                        "payment",
                        "card",
                      ];
                      const roomFacilities = group.rooms.flatMap(
                        (room: any) => room?.roomFacilities || [],
                      );
                      const hotelFacilities = hotelDetail?.hotelFacilities || [];
                      const rawFacilities =
                        roomFacilities.length > 0
                          ? [...hotelFacilities, ...roomFacilities]
                          : hotelFacilities;
                      const allFacilities = rawFacilities.filter((facility: any) => {
                        const cleanName = facility?.name?.replace(/\*\*/g, "").trim();
                        const lowerName = cleanName?.toLowerCase() || "";

                        return (
                          cleanName &&
                          !unwantedKeywords.some((keyword) =>
                            lowerName.includes(keyword),
                          )
                        );
                      });

                      const categorizedAmenities = categorizeFacilities(
                        [allFacilities],
                        categories,
                        FACILITY_KEYWORDS,
                        GREAT_KEYWORDS,
                      );

                      const optionGroupKey = `${roomIndex}-${group.roomTypeName}`;
                      const hasMoreOptions = group.rooms.length > 3;
                      const isOptionGroupExpanded =
                        expandedOptionGroups[optionGroupKey] ?? false;
                      const visibleRooms = isOptionGroupExpanded
                        ? group.rooms
                        : group.rooms.slice(0, 3);

                      return (
                        <div
                          key={`${roomIndex}-${group.roomTypeName}`}
                          className={`overflow-hidden rounded-[16px] border border-[#E4E4E7] bg-white ${groupIndex > 0 ? "mt-6" : ""
                            }`}
                        >
                          <div className="flex items-center justify-between px-[15px] py-[14px]">
                            <h2 className="text-[16px] font-medium text-[#0A0C0F]">
                              {firstRoom?.roomTypeName || group.roomTypeName || "Room"}
                            </h2>
                            {/* <button
                              type="button"
                              className="text-[16px] font-normal text-[#5383DA] hover:underline"
                            >
                              View details
                            </button> */}
                          </div>

                          <div className="border-t border-[#E4E4E7]" />

                          <div className="grid grid-cols-1 gap-4 px-[15px] py-[12px] lg:grid-cols-[340px_1px_minmax(0,1fr)]">
                            <div>
                              <div className="flex items-start overflow-hidden">
                                {roomImages.slice(0, 4).map((image, imageIndex) => (
                                  <button
                                    key={`${image}-${imageIndex}`}
                                    type="button"
                                    onClick={() =>
                                      openRoomImageGallery(
                                        gallerySourceImages,
                                        imageIndex,
                                        firstRoom?.roomTypeName ||
                                        group.roomTypeName ||
                                        "Room images",
                                      )
                                    }
                                    className={`h-[100px] w-[100px] sm:h-[115px] sm:w-[115px] lg:h-[130px] lg:w-[130px] shrink-0 overflow-hidden rounded-[10px] border border-white bg-[#F1F5F9] ${imageIndex === 0 ? "" : "-ml-[35px] sm:-ml-[48px] lg:-ml-[65px]"
                                      } cursor-zoom-in`}
                                  >
                                    <img
                                      src={image}
                                      alt="Room"
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        const t = e.currentTarget as HTMLImageElement;
                                        t.src =
                                          DEFAULT_ROOM_IMAGES[
                                          imageIndex % DEFAULT_ROOM_IMAGES.length
                                          ];
                                      }}
                                    />
                                  </button>
                                ))}
                              </div>

                              <div className="mt-[8px] text-[14px] font-normal text-[#3D495C]">
                                Room size: {getRoomSize(firstRoom)}
                              </div>
                            </div>

                            <div className="hidden lg:block my-[4px] bg-[#E4E4E7]" />

                            <div className="min-w-0 py-[2px]">
                              {Object.values(categorizedAmenities).some(
                                (arr) => arr.length > 0,
                              ) ? (
                                <div className="grid grid-cols-1 gap-x-[28px] gap-y-[12px] sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
                                  <div className="min-w-0">
                                    <SectionHeading icon={GreatStayIcon} title="Great for your stay" />
                                    <AmenitiesInlineList
                                      items={categorizedAmenities.greatForYourStay.slice(0, 7)}
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <SectionHeading icon={KnifeIcon} title="Kitchen" />
                                    <AmenitiesStackList
                                      items={categorizedAmenities.kitchen.slice(0, 6)}
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <SectionHeading icon={BedroomIcon} title="Bedrooms" />
                                    <AmenitiesStackList
                                      items={categorizedAmenities.bedrooms.slice(0, 6)}
                                    />
                                  </div>

                                  <div className="min-w-0 sm:col-span-2 lg:col-span-2">
                                    <SectionHeading icon={MediaIcon} title="Media & Technology" />
                                    <AmenitiesInlineList
                                      items={categorizedAmenities.mediaAndTechnology.slice(0, 8)}
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <SectionHeading icon={BathroomIcon} title="Bathroom" />
                                    <AmenitiesInlineList
                                      items={categorizedAmenities.bathroom.slice(0, 9)}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-[#94A3B8]">
                                  No amenities listed
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-[#E4E4E7]" />

                          <div className="px-[15px] py-[14px] text-[16px] font-normal text-[#0A0C0F]">
                            Select an option
                          </div>

                          <div className="border-t border-[#E4E4E7]" />

                          <div className="divide-y divide-[#E4E4E7]">
                            {visibleRooms.map((room: any, index: number) => {
                              const currency = room.roomRate?.currency || "AED";
                              const mealPlan = getMealPlanLabel(room);
                              const highlights = getPlanHighlights(room, mealPlan);
                              const hasOffers = Array.isArray(room?.offers) && room.offers.length > 0;
                              const netStay = room.roomRate?.netAmount || 0;
                              const nights = Math.max(
                                1,
                                resolveHotelStayNightCount(
                                  room,
                                  normalizedBookingParams,
                                ),
                              );
                              const offerTotal = hasOffers
                                ? room.offers.reduce(
                                    (sum: number, offer: any) =>
                                      sum + (offer.amount || 0),
                                    0,
                                  )
                                : 0;
                              const originalStay = hasOffers
                                ? netStay - offerTotal
                                : netStay;
                              const price = netStay / nights;
                              const originalPrice = originalStay / nights;
                              // const availabilityCount = getAvailabilityCount(room);

                              const roomKey =
                                room.roomKey ||
                                `${group.roomTypeName}-${roomIndex}-${index}`;

                              const selectedItem = getSelectedItem(
                                roomIndex,
                                roomKey,
                              );
                              const count = selectedItem?.count ?? 0;

                              return (
                                <div
                                  key={roomKey}
                                  className="grid grid-cols-1 gap-4 px-[15px] py-[18px] lg:grid-cols-[170px_minmax(0,1fr)_100px_220px_40px_116px] lg:items-center lg:gap-6"
                                >
                                  <div className="min-w-0">
                                    <div className="text-[14px] font-semibold text-[#3D495C]">
                                      {mealPlan}
                                    </div>

                                    <div className="mt-[12px] space-y-[6px] text-[14px] text-[#3D495C]">
                                      {highlights.map((item) => (
                                        <div
                                          key={`${mealPlan}-${item.text}`}
                                          className="flex items-center gap-2"
                                        >
                                          {item.negative ? (
                                            <UnavailableIcon />
                                          ) : (
                                            <AvaialableIcon />
                                          )}
                                          {item.html ? (
                                            <span
                                              className="truncate"
                                              dangerouslySetInnerHTML={{
                                                __html: item.text,
                                              }}
                                            />
                                          ) : (
                                            <span className="truncate">{item.text}</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="min-w-0 text-[14px] leading-[20px] text-[#3D495C]">
                                    {getRoomDescription(room)}
                                  </div>

                                  <div className="flex items-center gap-[5px] whitespace-nowrap text-[14px] text-[#3D495C]">
                                    <GuestsIcon />
                                    <span>
                                      {room?.maxOccupancy && room?.maxOccupancy > 0
                                        ? `${room.maxOccupancy} Adults`
                                        : "2 Adults"}
                                    </span>
                                  </div>

                                  <div className="min-w-0">
                                    {price > 0 ? (
                                      <div className="text-left">
                                        {hasOffers ? (
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[12px] text-[#EA0029] line-through">
                                              {formatPrice(originalPrice, currency)}
                                              <span className="ml-[2px] text-[11px] font-normal text-[#EA0029]">
                                                /night
                                              </span>
                                            </span>
                                            <span className="text-[18px] font-bold text-[#0A0C0F]">
                                              {formatPrice(price, currency)}
                                              <span className="ml-[2px] text-[12px] font-normal text-[#3D495C]">
                                                /night
                                              </span>
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="text-[18px] font-bold text-[#0A0C0F]">
                                            {formatPrice(price, currency)}
                                            <span className="ml-[2px] text-[12px] font-normal text-[#3D495C]">
                                              /night
                                            </span>
                                          </div>
                                        )}

                                        {/* {availabilityCount && availabilityCount <= 5 ? (
                                          <div className="mt-[3px] text-[12px] text-[#EA0029]">
                                            Only {availabilityCount} room
                                            {availabilityCount > 1 ? "s" : ""} left on Al Rais
                                          </div>
                                        ) : null} */}
                                      </div>
                                    ) : (
                                      <div className="text-[14px] text-[#EA0029]">
                                        Select dates, travelers and rooms to see
                                        prices.
                                      </div>
                                    )}
                                  </div>

                                  <div className="hidden lg:flex justify-center">
                                    <InfoIcon />
                                  </div>

                                  <div className="flex items-center justify-start gap-[10px] lg:justify-end">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateRoomCount(
                                          roomIndex,
                                          roomKey,
                                          room,
                                          -1,
                                        )
                                      }
                                      disabled={count <= 0}
                                      className={`flex h-[32px] w-[32px] items-center justify-center rounded-full text-[20px] leading-none ${count > 0
                                        ? "bg-[#2351A3] text-white"
                                        : "bg-[#C2CAD6] text-white cursor-not-allowed"
                                        }`}
                                    >
                                      –
                                    </button>

                                    <div className="w-[22px] text-center text-[16px] font-normal text-[#0A0C0F]">
                                      {String(count).padStart(2, "0")}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateRoomCount(
                                          roomIndex,
                                          roomKey,
                                          room,
                                          +1,
                                        )
                                      }
                                      disabled={count >= 1}
                                      className={`flex h-[32px] w-[32px] items-center justify-center rounded-full text-[20px] leading-none ${count < 1
                                        ? "bg-[#2351A3] text-white"
                                        : "bg-[#C2CAD6] text-white cursor-not-allowed"
                                        }`}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {hasMoreOptions && (
                            <div className="border-t border-[#E4E4E7] px-[15px] py-[14px]">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedOptionGroups((prev) => ({
                                    ...prev,
                                    [optionGroupKey]: !isOptionGroupExpanded,
                                  }))
                                }
                                className="mx-auto flex items-center gap-[6px] rounded-full border border-[#E4E4E7] bg-white px-[16px] py-[8px] text-[13px] font-semibold text-[#2351A3] shadow-[0_2px_8px_rgba(10,12,15,0.05)] transition hover:bg-[#F8FAFC]"
                              >
                                <span>
                                  {isOptionGroupExpanded ? "See less" : "See more"}
                                </span>
                                <ChevronIcon direction={isOptionGroupExpanded ? "up" : "down"} />
                              </button>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            );
          });
        })()}
      </div>

      <RoomImageGalleryModal
        open={isGalleryOpen}
        images={galleryImages}
        initialIndex={galleryInitialIndex}
        roomTitle={galleryRoomTitle}
        onClose={() => setIsGalleryOpen(false)}
      />
    </div>
  );
};

export default memo(HotelDetailRoomSection);

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

const UnavailableIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
    <path
      d="M8.5 0C3.805 0 0 3.805 0 8.5S3.805 17 8.5 17 17 13.195 17 8.5 13.195 0 8.5 0Zm2.74 11.24a.9.9 0 0 1-1.273 0L8.5 9.773 7.033 11.24a.9.9 0 1 1-1.273-1.273L7.227 8.5 5.76 7.033a.9.9 0 1 1 1.273-1.273L8.5 7.227l1.467-1.467a.9.9 0 1 1 1.273 1.273L9.773 8.5l1.467 1.467a.9.9 0 0 1 0 1.273Z"
      fill="#EA0029"
    />
  </svg>
);

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

const SectionHeading = ({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) => (
  <div className="flex items-center gap-[5px] text-[14px] font-semibold text-[#0A0C0F]">
    <img alt="" src={icon} className="h-5 w-5 shrink-0" />
    <span>{title}</span>
  </div>
);

const EmptyAmenitiesMessage = () => (
  <div className="mt-[10px] text-[12px] text-[#94A3B8]">No details available</div>
);

const AmenitiesInlineList = ({ items }: { items: string[] }) =>
  items.length > 0 ? (
    <div className="mt-[10px] flex flex-wrap gap-x-[14px] gap-y-[8px] text-[12px] text-[#3D495C]">
      {items.map((item) => (
        <span key={item} className="flex items-center gap-[5px] whitespace-nowrap">
          <CheckIcon />
          <span className="truncate">{item}</span>
        </span>
      ))}
    </div>
  ) : (
    <EmptyAmenitiesMessage />
  );

const AmenitiesStackList = ({ items }: { items: string[] }) =>
  items.length > 0 ? (
    <div className="mt-[10px] flex flex-col gap-[8px] text-[12px] text-[#3D495C]">
      {items.map((item) => (
        <span key={item} className="flex items-center gap-[5px] whitespace-nowrap">
          <CheckIcon />
          <span className="truncate">{item}</span>
        </span>
      ))}
    </div>
  ) : (
    <EmptyAmenitiesMessage />
  );

const GuestsIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.25 9.16667C7.86083 9.16667 9.16667 7.86083 9.16667 6.25C9.16667 4.63917 7.86083 3.33333 6.25 3.33333C4.63917 3.33333 3.33333 4.63917 3.33333 6.25C3.33333 7.86083 4.63917 9.16667 6.25 9.16667Z"
      stroke="#2351A3"
      strokeWidth="1.5"
    />
    <path
      d="M11.6667 8.33333C12.8173 8.33333 13.75 7.40059 13.75 6.25C13.75 5.09941 12.8173 4.16667 11.6667 4.16667"
      stroke="#2351A3"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M1.66667 15.8333C1.66667 13.9924 3.15905 12.5 5 12.5H7.5C9.34095 12.5 10.8333 13.9924 10.8333 15.8333"
      stroke="#2351A3"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M11.6667 12.5H12.5C14.341 12.5 15.8333 13.9924 15.8333 15.8333"
      stroke="#2351A3"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const InfoIcon = () => (
  <button
    type="button"
    className="flex h-8 w-8 items-center justify-center rounded-full text-[#2351A3]"
    aria-label="Room information"
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" />
      <path
        d="M10 9V13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="6.5" r="1" fill="currentColor" />
    </svg>
  </button>
);

const ChevronIcon = ({
  direction,
}: {
  direction: "up" | "down";
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d={direction === "up" ? "M5 12.5L10 7.5L15 12.5" : "M5 7.5L10 12.5L15 7.5"}
      stroke="#2351A3"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);