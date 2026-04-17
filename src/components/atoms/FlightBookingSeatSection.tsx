import React, { useState, useMemo, useEffect, useRef } from "react";
import BookingPlane from "../../assets/images/flight-booking-plane.png";
// import EmirateLogo from "../../assets/images/emirates.png";
import INFO_ICON from "../../assets/svgs/info.svg";
import flightSeatSelection from "../../assets/svgs/flight-seat-selection-svg.svg";
import standardSeatGlyph from "../../assets/svgs/standard-seat-glyph.svg";
import extendedSeatGlyph from "../../assets/svgs/extended-seat-glyph.svg";
import seat from "../../assets/svgs/enhance-seat.svg";
import CardCollapseToggle from "../common/CardCollapseToggle";
import type { SegmentSummary } from "../../utils/flightBookingHelper";
// import toast from "react-hot-toast";
import { useAncillaryStore } from "../../store/useAncillaryStore";

export default function FlightBookingSeatSection({
  open,
  onToggleOpen,
  passengers,
  flightAncillarySearch,
  flightJourneys,
}: {
  open: boolean;
  onToggleOpen: () => void;
  passengers: Array<any>;
  flightAncillarySearch?: any;
  flightJourneys: Array<{ flightSegments: SegmentSummary[] }>;
}) {
  const { setSeatSelections, seatSelections } = useAncillaryStore();
  // Calculate eligible passengers (exclude INF)
  const eligiblePassengers = useMemo(() => {
    return passengers.filter((p) => p.ptc !== "INF");
  }, [passengers]);

  const totalSeatsNeeded = eligiblePassengers.length;
  // Get all segments from all journeys with metadata
  const allSegments = useMemo(() => {
    const segments: Array<
      SegmentSummary & {
        journeyIndex: number;
        segmentIndex: number;
        journeyType: string;
        isMultiStop: boolean;
        stopNumber: number | null;
      }
    > = [];

    flightJourneys.forEach((journey, journeyIdx) => {
      journey.flightSegments.forEach((segment, segmentIdx) => {
        segments.push({
          ...segment,
          journeyIndex: journeyIdx,
          segmentIndex: segmentIdx,
          journeyType:
            flightJourneys.length > 1
              ? journeyIdx === 0
                ? "Departure"
                : "Return"
              : "Departure",
          isMultiStop: journey.flightSegments.length > 1,
          stopNumber: journey.flightSegments.length > 1 ? segmentIdx + 1 : null,
        });
      });
    });
    return segments;
  }, [flightJourneys]);

  // Current segment being viewed
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const currentSegment = allSegments[currentSegmentIndex];

  // Store selected seats: { segmentKey: { passengerKey: seatNumber } }
  // const [selectedSeats, setSelectedSeats] = useState<
  //   Record<string, Record<string, string>>
  // >({});
  const [selectedSeats, setSelectedSeats] = useState<
    Record<
      string,
      Record<string, { seatNumber: string; ancillaryOfferId?: string }>
    >
  >(() => seatSelections || {});
  const syncingFromStoreRef = useRef(false);

  // Currently focused passenger for current segment
  const [selectedPassengerKey, setSelectedPassengerKey] = useState<
    string | null
  >(null);

  const extractSeatLetter = (seatCode = "") => {
    return seatCode.replace(/[0-9]/g, "");
  };

  // Get seat map for current segment using segmentKey
  const getSeatMapForSegment = (segmentKey: string) => {
    if (!flightAncillarySearch?.seatMap) return null;

    // Search through all seat maps to find matching segment
    for (const seatMapItem of flightAncillarySearch.seatMap) {
      for (const cabin of seatMapItem.cabin || []) {
        const mapping = cabin.segmentPassengerMapping;
        if (mapping?.segmentKeys?.includes(segmentKey)) {
          return cabin.deck?.[0];
        }
      }
    }
    return null;
  };

  const getSeatMapData = () => {
    if (!currentSegment) return null;

    const deck = getSeatMapForSegment(currentSegment.segmentKey);
    if (!deck) return null;

    const rows = deck.airRow || [];
    if (!rows.length || !rows[0]?.airSeats) {
      return { rows: [], seatLayout: null };
    }

    const seatTypeInfo = deck.airInformationRow?.seatType || [];
    let seatGroups: string[][] = [];

    if (seatTypeInfo.length > 0) {
      const firstRow = rows[0].airSeats;
      let currentGroup: string[] = [];
      let seatIndex = 0;

      seatTypeInfo.forEach((type: string) => {
        if (type === "Aisle") {
          if (currentGroup.length > 0) {
            seatGroups.push([...currentGroup]);
            currentGroup = [];
          }
        } else if (type === "Seat") {
          if (seatIndex < firstRow.length) {
            currentGroup.push(extractSeatLetter(firstRow[seatIndex].seatCode));
            seatIndex++;
          }
        }
      });
      if (currentGroup.length > 0) {
        seatGroups.push(currentGroup);
      }
    } else {
      const firstRow = rows[0].airSeats;
      const seatCodes = firstRow.map((s: any) => extractSeatLetter(s.seatCode));
      let currentGroup: string[] = [];

      firstRow.forEach((s: any) => {
        if (s.noSeat) {
          if (currentGroup.length > 0) {
            seatGroups.push([...currentGroup]);
            currentGroup = [];
          }
        } else {
          currentGroup.push(extractSeatLetter(s.seatCode));
        }
      });
      if (currentGroup.length > 0) {
        seatGroups.push(currentGroup);
      }

      if (seatGroups.length === 0 || seatGroups.length === 1) {
        const totalSeats = seatCodes.length;
        if (totalSeats <= 6) {
          seatGroups = [seatCodes.slice(0, 3), seatCodes.slice(3, 6)];
        } else if (totalSeats <= 9) {
          seatGroups = [
            seatCodes.slice(0, 3),
            seatCodes.slice(3, 6),
            seatCodes.slice(6, 9),
          ];
        } else {
          const seatsPerGroup = Math.ceil(totalSeats / 3);
          seatGroups = [
            seatCodes.slice(0, seatsPerGroup),
            seatCodes.slice(seatsPerGroup, seatsPerGroup * 2),
            seatCodes.slice(seatsPerGroup * 2),
          ];
        }
      }
    }

    return {
      rows,
      seatLayout: {
        groups: seatGroups,
        aisleCount: seatGroups.length - 1,
      },
    };
  };

  const seatMapData = getSeatMapData();

  const getSeatStatus = (seatData: any, seatNumber: string) => {
    const segmentSeats = selectedSeats[currentSegment.segmentKey] || {};

    // if (
    //   selectedPassengerKey &&
    //   segmentSeats[selectedPassengerKey] === seatNumber
    // ) {
    //   return "selected";
    // }

    // const isSelectedByAny = Object.values(segmentSeats).includes(seatNumber);
    // if (isSelectedByAny) return "occupied";

    if (
      selectedPassengerKey &&
      segmentSeats[selectedPassengerKey]?.seatNumber === seatNumber
    ) {
      return "selected";
    }

    const isSelectedByAny = Object.values(segmentSeats).some(
      (s: any) => s?.seatNumber === seatNumber
    );
    if (isSelectedByAny) return "occupied";

    if (seatData.noSeat) return "noSeat";
    if (seatData.availability === "NAV" || seatData.availability === "RES")
      return "booked";
    if (seatData.availability === "NOS") return "noSeat";
    if (
      seatData.exitRow ||
      seatData.airSeatCharacteristic?.some(
        (char: any) => char.value === "ExitRowSeat"
      )
    ) {
      return "booked";
      // return "extended";
    }
    if (
      seatData.airSeatCharacteristic?.some(
        (char: any) => char.value === "LegSpaceSeat"
      )
    ) {
      // return "booked";
      return "extended";
    }
    return "standard";
  };

  const getAncillaryOfferIdFromSeatData = (seatData: any) => {
    // Try common places where ancillary/offer id might live in your seat object.
    return (
      seatData?.ancillaryOfferId ||
      seatData?.seatOffer?.ancillaryOfferId ||
      seatData?.seatOfferId ||
      seatData?.offer?.ancillaryOfferId ||
      seatData?.offerId ||
      null
    );
  };

  const handleSeatSelect = (seatData: any) => {
    const segmentKey = currentSegment.segmentKey;
    const seatNumber =
      seatData.seatNumber || extractSeatLetter(seatData.seatCode || "");
    const ancillaryOfferId = getAncillaryOfferIdFromSeatData(seatData);

    if (!selectedPassengerKey) {
      const firstAvailablePassenger = eligiblePassengers.find(
        (p) => !selectedSeats[segmentKey]?.[p.passengerKey]
      );

      if (firstAvailablePassenger) {
        setSelectedSeats((prev) => ({
          ...prev,
          [segmentKey]: {
            ...(prev[segmentKey] || {}),
            [firstAvailablePassenger.passengerKey]: {
              seatNumber,
              ancillaryOfferId,
            },
          },
        }));

        const nextPassenger = eligiblePassengers.find(
          (p) =>
            p.passengerKey !== firstAvailablePassenger.passengerKey &&
            !selectedSeats[segmentKey]?.[p.passengerKey]
        );
        setSelectedPassengerKey(nextPassenger?.passengerKey || null);
      }
    } else {
      setSelectedSeats((prev) => ({
        ...prev,
        [segmentKey]: {
          ...(prev[segmentKey] || {}),
          [selectedPassengerKey]: { seatNumber, ancillaryOfferId },
        },
      }));

      const currentSegmentSeats = selectedSeats[segmentKey] || {};
      const nextPassenger = eligiblePassengers.find(
        (p) =>
          p.passengerKey !== selectedPassengerKey &&
          !currentSegmentSeats[p.passengerKey] &&
          seatNumber !== currentSegmentSeats[p.passengerKey]?.seatNumber
      );
      setSelectedPassengerKey(nextPassenger?.passengerKey || null);
    }
  };

  // const handleSeatSelect = (seatNumber: string) => {
  //   const segmentKey = currentSegment.segmentKey;

  //   if (!selectedPassengerKey) {
  //     const firstAvailablePassenger = eligiblePassengers.find(
  //       (p) => !selectedSeats[segmentKey]?.[p.passengerKey]
  //     );

  //     if (firstAvailablePassenger) {
  //       setSelectedSeats((prev) => ({
  //         ...prev,
  //         [segmentKey]: {
  //           ...(prev[segmentKey] || {}),
  //           [firstAvailablePassenger.passengerKey]: seatNumber,
  //         },
  //       }));

  //       const nextPassenger = eligiblePassengers.find(
  //         (p) =>
  //           p.passengerKey !== firstAvailablePassenger.passengerKey &&
  //           !selectedSeats[segmentKey]?.[p.passengerKey]
  //       );
  //       setSelectedPassengerKey(nextPassenger?.passengerKey || null);
  //     }
  //   } else {
  //     setSelectedSeats((prev) => ({
  //       ...prev,
  //       [segmentKey]: {
  //         ...(prev[segmentKey] || {}),
  //         [selectedPassengerKey]: seatNumber,
  //       },
  //     }));

  //     const currentSegmentSeats = selectedSeats[segmentKey] || {};
  //     const nextPassenger = eligiblePassengers.find(
  //       (p) =>
  //         p.passengerKey !== selectedPassengerKey &&
  //         !currentSegmentSeats[p.passengerKey] &&
  //         seatNumber !== currentSegmentSeats[p.passengerKey]
  //     );
  //     setSelectedPassengerKey(nextPassenger?.passengerKey || null);
  //   }
  // };

  const clearSeatForPassenger = (passengerKey: string) => {
    const segmentKey = currentSegment.segmentKey;
    setSelectedSeats((prev) => {
      const segmentSeats = { ...(prev[segmentKey] || {}) };
      delete segmentSeats[passengerKey];
      return {
        ...prev,
        [segmentKey]: segmentSeats,
      };
    });

    if (passengerKey === selectedPassengerKey) {
      setSelectedPassengerKey(null);
    }
  };

  const goToNextSegment = () => {
    if (currentSegmentIndex < allSegments.length - 1) {
      setCurrentSegmentIndex(currentSegmentIndex + 1);
      setSelectedPassengerKey(null);
    }
  };

  const goToPreviousSegment = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(currentSegmentIndex - 1);
      setSelectedPassengerKey(null);
    }
  };

  const getSegmentSeatsCount = (segmentKey: string) => {
    return Object.keys(selectedSeats[segmentKey] || {}).length;
  };

  // const isSegmentComplete = (segmentKey: string) => {
  //   const deck = getSeatMapForSegment(segmentKey);
  //   if (!deck) return true; // ← Yeh line add karne se jab seat map nahi hai tab bhi button enable rahega
  //   return (
  //     (selectedSeats[segmentKey]
  //       ? Object.keys(selectedSeats[segmentKey]).length
  //       : 0) === eligiblePassengers.length
  //   );
  // };

  // const isCurrentSegmentComplete = () =>
  //   isSegmentComplete(currentSegment.segmentKey);
  // const allSegmentsComplete = () =>
  //   allSegments.every((seg) => isSegmentComplete(seg.segmentKey));

  // const getSelectedSeatsSummary = () => {
  //   const result: Array<{
  //     segmentKey: string;
  //     journeyType: string;
  //     segmentInfo: SegmentSummary;
  //     selectedSeats: Array<{
  //       passengerKey: string;
  //       ptc: string;
  //       seatNumber: string; // e.g. "11-A"
  //       seatCode: string; // e.g. "A"
  //       seatType: string; // "W" (window), "A" (aisle), etc.
  //       ancillaryOfferId: string;
  //       price: {
  //         buyingCurrency: string;
  //         buyingAmount: number;
  //         sellingCurrency: string;
  //         sellingAmount: number;
  //       };
  //     }>;
  //     totalAmount: {
  //       currency: string;
  //       amount: number;
  //     };
  //   }> = [];

  //   let grandTotal = 0;
  //   let totalCurrency = "AED"; // fallback – will be overwritten by first seat

  //   allSegments.forEach((segment) => {
  //     const segmentSeats = selectedSeats[segment.segmentKey] || {};
  //     const seatsForThisSegment: (typeof result)[0]["selectedSeats"] = [];

  //     Object.entries(segmentSeats).forEach(([passengerKey, seatNumber]) => {
  //       const passenger = passengers.find(
  //         (p) => p.passengerKey === passengerKey
  //       );
  //       if (!passenger) return;

  //       // Find the actual seat data in the seat map
  //       const deck = getSeatMapForSegment(segment.segmentKey);
  //       const row = deck?.airRow?.find((r: any) =>
  //         r.airSeats?.some((s: any) => s.seatNumber === seatNumber)
  //       );
  //       const seatData = row?.airSeats?.find(
  //         (s: any) => s.seatNumber === seatNumber
  //       );

  //       if (!seatData) return;

  //       const fareObj = seatData.fare?.[0] || {
  //         buyingCurrency: "AED",
  //         buyingAmount: 0,
  //         sellingCurrency: "AED",
  //         sellingAmount: 0,
  //       };

  //       // Use selling amount as the price shown to customer
  //       const priceAmount = fareObj.sellingAmount;
  //       grandTotal += priceAmount;
  //       totalCurrency = fareObj.sellingCurrency;

  //       seatsForThisSegment.push({
  //         passengerKey,
  //         ptc: passenger.ptc,
  //         seatNumber: seatData.seatNumber,
  //         seatCode: seatData.seatCode,
  //         seatType: seatData.seatType,
  //         ancillaryOfferId: seatData.ancillaryOfferId,
  //         price: {
  //           buyingCurrency: fareObj.buyingCurrency,
  //           buyingAmount: fareObj.buyingAmount,
  //           sellingCurrency: fareObj.sellingCurrency,
  //           sellingAmount: fareObj.sellingAmount,
  //         },
  //       });
  //     });

  //     if (seatsForThisSegment.length > 0) {
  //       result.push({
  //         segmentKey: segment.segmentKey,
  //         journeyType: segment.journeyType,
  //         segmentInfo: segment,
  //         selectedSeats: seatsForThisSegment,
  //         totalAmount: {
  //           currency: totalCurrency,
  //           amount: seatsForThisSegment.reduce(
  //             (sum, s) => sum + s.price.sellingAmount,
  //             0
  //           ),
  //         },
  //       });
  //     }
  //   });

  //   // Add grand total across all segments
  //   return {
  //     segments: result,
  //     grandTotal: {
  //       currency: totalCurrency,
  //       amount: grandTotal,
  //     },
  //   };
  // };

  const handleConfirmSelection = () => {
    // if (!allSegmentsComplete()) {
    //   toast.error("Please select seats for all passengers in every segment.");
    //   return;
    // }
  };

  const Seat = ({
    seatData,
    seatNumber,
  }: {
    seatData: any;
    seatNumber: string;
  }) => {
    const status = getSeatStatus(seatData, seatNumber);

    if (status === "noSeat") {
      return <div className="h-6 w-6 md:h-7 md:w-7" aria-hidden />;
    }

    const base =
      "h-6 w-6 md:h-7 md:w-7 rounded transition ring-offset-1 relative group";
    const cls =
      status === "selected"
        ? "bg-[#2351A3]"
        : status === "occupied"
        ? "bg-[#2351A3] cursor-pointer"
        : status === "booked"
        ? "bg-[#FF5270] cursor-not-allowed"
        : status === "extended"
        ? "border border-dashed border-[#F79E1B]"
        : "border border-dashed border-[#00522E]";

    const clickable = status !== "booked";

    return (
      <button
        type="button"
        aria-label={seatNumber}
        disabled={!clickable}
        onClick={() => handleSeatSelect(seatData)}
        className={`${base} ${cls}`}
      >
        <span className="absolute bottom-2 left-3/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {seatNumber}
        </span>
      </button>
    );
  };

  const Aisle = () => <div className="w-3 md:w-4" aria-hidden />;

  const renderSeatMap = () => {
    if (!seatMapData || !seatMapData.seatLayout) {
      return (
        <div className="text-center py-8 text-[#3D495C] font-semibold">
          No seat map data available
        </div>
      );
    }

    const { rows, seatLayout } = seatMapData;
    const { groups, aisleCount } = seatLayout;

    const firstRowNumber = rows[0]?.rowNumber || 1;
    const missingRowsAbove = firstRowNumber - 1;

    const topPaddingClass = (() => {
      if (missingRowsAbove === 0) return "pt-0";
      if (missingRowsAbove <= 3) return "pt-8";
      if (missingRowsAbove <= 6) return "pt-16";
      if (missingRowsAbove <= 10) return "pt-24";
      return "pt-32";
    })();

    const gridCols = groups
      .map((group) => `repeat(${group.length},1fr)`)
      .join(" auto ");

    return (
      <div
        className={`h-full flex flex-col justify-start gap-1 overflow-y-auto scrollbar-hide min-h-0 ${topPaddingClass}`}
      >
        {rows.map((row: any) => {
          const seats = row.airSeats || [];

          return (
            <div
              key={row.rowNumber}
              className="grid items-center justify-items-center gap-1"
              style={{ gridTemplateColumns: gridCols }}
            >
              {groups.map((groupCodes, groupIdx) => (
                <React.Fragment key={`aisle-${groupIdx}`}>
                  {groupCodes.map((code) => {
                    const seatData = seats.find(
                      (s: any) => extractSeatLetter(s.seatCode) === code
                    );
                    if (!seatData) return null;
                    return (
                      <Seat
                        key={seatData.seatNumber}
                        seatData={seatData}
                        seatNumber={seatData.seatNumber}
                      />
                    );
                  })}
                  {groupIdx < aisleCount && <Aisle key={`aisle-${groupIdx}`} />}
                </React.Fragment>
              ))}
            </div>
          );
        })}
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    );
  };

  const getPassengerLabel = (ptc: string) => {
    if (ptc === "ADT") return "Adult";
    if (ptc === "CHD" || ptc === "CNN") return "Child";
    return ptc;
  };

  // useEffect(() => {
  //   setSeatSelections(selectedSeats);
  // }, [selectedSeats, setSeatSelections]);

  // useEffect(() => {
  //   if (
  //     Object.keys(seatSelections).length === 0 &&
  //     Object.keys(selectedSeats).length > 0
  //   ) {
  //     setSeatSelections({});
  //     setCurrentSegmentIndex(0);
  //   } else if (
  //     Object.keys(seatSelections).length > 0 &&
  //     Object.keys(selectedSeats).length === 0
  //   ) {
  //     setSeatSelections(seatSelections);
  //   }
  // }, [seatSelections]);
  // Hydrate local UI from store when navigating back to Enhance.
  useEffect(() => {
    const storeHas = Object.keys(seatSelections || {}).length > 0;
    const localHas = Object.keys(selectedSeats || {}).length > 0;
    const storeJSON = JSON.stringify(seatSelections || {});
    const localJSON = JSON.stringify(selectedSeats || {});

    if (storeHas && storeJSON !== localJSON) {
      syncingFromStoreRef.current = true;
      setSelectedSeats(seatSelections || {});
      // allow one render to pass before re-enabling store writes
      queueMicrotask(() => {
        syncingFromStoreRef.current = false;
      });
      return;
    }

    // If store is cleared explicitly, reflect that in UI.
    if (!storeHas && localHas) {
      syncingFromStoreRef.current = true;
      setSelectedSeats({});
      setCurrentSegmentIndex(0);
      queueMicrotask(() => {
        syncingFromStoreRef.current = false;
      });
    }
  }, [seatSelections]);

  // Persist local UI changes to store (guarded to avoid loops).
  useEffect(() => {
    if (syncingFromStoreRef.current) return;
    const storeJSON = JSON.stringify(seatSelections || {});
    const localJSON = JSON.stringify(selectedSeats || {});
    if (storeJSON !== localJSON) {
      setSeatSelections(selectedSeats);
    }
  }, [selectedSeats, seatSelections, setSeatSelections]);

  return (
    <div className="px-3 pb-3 mt-3">
      <div className="rounded-xl border border-[#E4E4E7] overflow-hidden">
        {/* header */}
        <div className="flex w-full items-center justify-between px-4 py-3 text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A7C0EC]">
              <img src={seat} alt="seat" className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[15px] font-medium text-[#0A0C0F]">
                Seats
              </div>
              <div className="text-[12px] text-[#3D495C]">
                Enjoy more legroom and choose your preferred spot.
              </div>
            </div>
          </div>
          <CardCollapseToggle open={open} onClick={onToggleOpen} />
        </div>

        {open && <div className="h-px bg-[#E4E4E7]" />}

        {open && (
          <div className="px-3 py-4">
            {/* Segment Navigation - Show only if multiple segments */}
            {allSegments.length > 1 && (
              <div className="mb-4 flex items-center justify-between bg-[#EFF6FF] px-4 py-3 rounded-xl">
                <button
                  type="button"
                  onClick={goToPreviousSegment}
                  disabled={currentSegmentIndex === 0}
                  className="flex items-center gap-1 text-[#2351A3] disabled:opacity-30 disabled:cursor-not-allowed hover:underline"
                >
                  <span className="text-[18px]">←</span>
                  <span className="text-[13px] font-medium">Previous</span>
                </button>

                <div className="text-center flex-1">
                  <div className="text-[14px] font-semibold text-[#0A0C0F]">
                    {currentSegment.journeyType} Flight
                    {currentSegment.isMultiStop &&
                      ` - Stop ${currentSegment.stopNumber}`}
                  </div>
                  <div className="text-[12px] text-[#3D495C]">
                    Segment {currentSegmentIndex + 1} of {allSegments.length} •{" "}
                    {getSegmentSeatsCount(currentSegment.segmentKey)} of{" "}
                    {totalSeatsNeeded} seats selected
                  </div>
                </div>

                <button
                  type="button"
                  onClick={goToNextSegment}
                  disabled={currentSegmentIndex === allSegments.length - 1}
                  className="flex items-center gap-1 text-[#2351A3] disabled:opacity-30 disabled:cursor-not-allowed hover:underline"
                >
                  <span className="text-[13px] font-medium">Next</span>
                  <span className="text-[18px]">→</span>
                </button>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-[minmax(320px,420px)_1fr] enhance-seat-grid">
              <div className="md:order-1">
                <div className="rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#85FFCA]">
                      <img src={standardSeatGlyph} alt="standard-seat-glyph" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-[#0A0C0F]">
                        Standard seats
                      </div>
                      <p className="text-[12px] text-[#3D495C]">
                        Seats on row 14 on all aircraft and seats on row 32 on
                        Boeing 737-800 do not recline.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#FFE2A6]">
                      <img src={extendedSeatGlyph} alt="extended-seat-glyph" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-[#0A0C0F]">
                        Extended legroom
                      </div>
                      <p className="text-[12px] text-[#3D495C]">
                        For safety reasons, seats on row 15 do not recline.
                      </p>
                    </div>
                    <div className="ml-1 grid h-6 w-6 place-items-center rounded-full">
                      <img src={INFO_ICON} alt="info-icon" />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px]">
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-[#C2CAD6]" />
                    <span className="text-[#3D495C]">Reserved</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full border border-dashed border-[#00522E]" />
                    <span className="text-[#3D495C]">Standard available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded border border-dashed border-[#F79E1B]" />
                    <span className="text-[#3D495C]">Extended Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-[#FF5270]" />
                    <span className="text-[#3D495C]">Booked</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[15px] font-semibold text-[#0A0C0F]">
                      {currentSegment.journeyType} flight
                      {currentSegment.isMultiStop &&
                        ` (Stop ${currentSegment.stopNumber})`}
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-[minmax(220px,1fr)_auto_15px] items-center gap-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={`/airlines/${currentSegment.marketingAirline}.png`}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover hidden"
                        onLoad={(e) =>
                          e.currentTarget.classList.remove("hidden")
                        }
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                      <div>
                        <div className="text-[15px] font-medium text-[#0A0C0F]">
                          {currentSegment.marketingAirline} Airlines
                        </div>
                        <div className="text-[13px] text-[#3D495C]">
                          {currentSegment.flightNumber} -{" "}
                          {currentSegment.cabinClass}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[12px] text-[#3D495C]">
                        Passengers
                      </div>
                      <div className="text-[14px] font-medium text-[#0A0C0F]">
                        {totalSeatsNeeded}{" "}
                        {totalSeatsNeeded === 1 ? "Passenger" : "Passengers"}
                      </div>
                    </div>
                  </div>

                  {/* Passengers list with seat selection for current segment */}
                  <div className="mt-4 space-y-2">
                    {eligiblePassengers.map((passenger, index) => {
                      const segmentSeats =
                        selectedSeats[currentSegment.segmentKey] || {};
                      const hasSeat = !!segmentSeats[passenger.passengerKey];
                      const isSelected =
                        selectedPassengerKey === passenger.passengerKey;

                      return (
                        <div
                          key={passenger.passengerKey}
                          className={`rounded-xl border ${
                            isSelected
                              ? "border-[#2351A3] bg-[#EFF6FF]"
                              : "border-[#E4E4E7] bg-white"
                          } px-3 py-2 transition-all`}
                        >
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPassengerKey(
                                  isSelected ? null : passenger.passengerKey
                                )
                              }
                              className="flex items-center gap-2 flex-1"
                            >
                              <div
                                className={`px-2 py-1 rounded text-[12px] font-medium ${
                                  hasSeat
                                    ? "bg-[#85FFCA] text-[#0A0C0F]"
                                    : "bg-[#F2F2F3] text-[#3D495C]"
                                }`}
                              >
                                {getPassengerLabel(passenger.ptc)} {index + 1}
                              </div>
                              <img
                                src={flightSeatSelection}
                                alt="seat"
                                className="w-4 h-4"
                              />
                              <span
                                className={`text-[14px] font-medium ${
                                  hasSeat ? "text-[#0A0C0F]" : "text-[#C2CAD6]"
                                }`}
                              >
                                {/* {segmentSeats[passenger.passengerKey] ||
                                  "No seat selected"} */}
                                {segmentSeats[passenger.passengerKey]
                                  ?.seatNumber || "No seat selected"}
                              </span>
                            </button>

                            {hasSeat && (
                              <button
                                type="button"
                                onClick={() =>
                                  clearSeatForPassenger(passenger.passengerKey)
                                }
                                className="text-[13px] font-medium text-[#5383DA] hover:underline ml-2"
                              >
                                Clear selection
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  {currentSegmentIndex < allSegments.length - 1 ? (
                    <button
                      type="button"
                      onClick={goToNextSegment}
                      // disabled={!isCurrentSegmentComplete()}
                      className="px-12 rounded-xl bg-[#2351A3] py-3 text-[16px] font-semibold text-[#F2F2F3] hover:brightness-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next segment →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConfirmSelection}
                      // disabled={!allSegmentsComplete()}
                      className="px-12 rounded-xl bg-[#2351A3] py-3 text-[16px] font-semibold text-[#F2F2F3] hover:brightness-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm selection
                    </button>
                  )}
                </div>
              </div>

              <div className="md:order-2 md:justify-self-end">
                <div
                  className="relative mx-auto w-full"
                  style={{
                    maxWidth: seatMapData?.seatLayout
                      ? `${Math.max(
                          450,
                          seatMapData.seatLayout.groups.reduce(
                            (sum, g) => sum + g.length,
                            0
                          ) *
                            65 +
                            seatMapData.seatLayout.aisleCount * 18
                        )}px`
                      : "520px",
                  }}
                >
                  <img
                    src={BookingPlane}
                    className="w-full select-none pointer-events-none"
                    alt="plane"
                  />
                  <div className="absolute left-[24%] right-[26%] top-[10%] bottom-[9%] box-border flight-seat-overlay">
                    {renderSeatMap()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
