// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import "../../assets/css/travel.css";
// import cabinIcon from "../../assets/svgs/cabin.svg";
// import highDemandIcon from "../../assets/svgs/high-demand.svg";
// import offerViewIcon from "../../assets/svgs/offer-view-icon.svg";
// import baggageIcon from "../../assets/svgs/baggage.svg";
// import durationIcon from "../../assets/svgs/duration.svg";
// import refundableIcon from "../../assets/svgs/redundable.svg";
// import SEAT_ICON from "../../assets/svgs/seat.svg";
// import PLANE_ICON from "../../assets/svgs/plane.svg";
// import CustomButton from "../common/CustomButton";
// import FlightTimingAndStops from "../atoms/FlightTimingAndStops";
// import { useNavigate } from "react-router-dom";
// import {
//   buildPerSegmentFlightDetail,
//   mapOfferForCompareMultiCity,
//   pickRandomFlightsForCompare,
//   extractFlightFeatures,
// } from "../../utils/searchFlightListingHelpers";

// const PricingDetailCard = React.lazy(() => import("./PricingDetailCard"));
// const FlightDetailsCard = React.lazy(() => import("./FlightDetailsCard"));
// const CompareCard = React.lazy(() => import("./CompareCard"));

// type TravelMultiCityProps = {
//   passData: any[];
//   passengersForRequest?: { id: string; ptc: string }[];
//   isLoadingMore?: boolean;
//   hasMore?: boolean;
//   renderLoader?: (state: {
//     isLoadingMore?: boolean;
//     hasMore?: boolean;
//   }) => React.ReactNode;
//   loadMoreRef?: React.RefObject<HTMLDivElement>;
//   emptyState?: (() => React.ReactNode) | React.ReactNode;
//   highDemandIndicators?: any[];
// };

// const TravelMultiCity: React.FC<TravelMultiCityProps> = ({
//   passData,
//   passengersForRequest,
//   isLoadingMore,
//   hasMore,
//   renderLoader,
//   loadMoreRef,
//   emptyState,
//   highDemandIndicators = [],
// }) => {
//   // const [isModalOpen, setIsModalOpen] = useState(false);
//   const [, setFilterData] = useState<any[]>([]);
//   const [filterDetail, setFilterDetail] = useState<any[]>([]);
//   const [active, setActive] = useState({ name: "", id: 0 });

//   const navigate = useNavigate();

//   useEffect(() => {
//     import("./PricingDetailCard");
//     import("./FlightDetailsCard");
//     import("./CompareCard");
//   }, []);

//   const detailById = useMemo(() => {
//     const lookup: Record<string | number, any[]> = {};
//     (passData || []).forEach((it) => {
//       if (it?.id !== undefined) lookup[it.id] = [it];
//     });
//     return lookup;
//   }, [passData]);

//   const HandlePriceOption = useCallback(
//     ({ id }: { id: number | undefined }) => {
//       const filtered = (id !== undefined && detailById[id]) || [];
//       setFilterDetail(filtered);
//       setFilterData([]);
//     },
//     [detailById],
//   );

//   const highDemandBySegment = useMemo(() => {
//     if (!highDemandIndicators || highDemandIndicators.length === 0) return [];

//     return highDemandIndicators.map((indicator) => ({
//       marketingAirline: indicator.marketingAirline,
//       totalCounts: indicator.totalCounts,
//       highDemand: indicator.highDemand,
//     }));
//   }, [highDemandIndicators]);

//   const getHighDemandInfo = useCallback(
//     (segmentAirlines: string[]) => {
//       if (!highDemandBySegment || highDemandBySegment.length === 0) return null;
//       if (segmentAirlines.length !== highDemandBySegment.length) return null;

//       // Check if ALL segments match their corresponding indicator
//       const allMatch = segmentAirlines.every((airline, index) => {
//         const indicator = highDemandBySegment[index];
//         return (
//           indicator?.highDemand === true &&
//           indicator?.marketingAirline === airline
//         );
//       });

//       if (!allMatch) return null;

//       // Calculate total count across all segments
//       const totalCount = highDemandBySegment.reduce(
//         (sum, indicator) => sum + (indicator.totalCounts || 0),
//         0,
//       );

//       return {
//         totalCount,
//         segmentCounts: highDemandBySegment.map((ind) => ind.totalCounts),
//         highDemand: true,
//       };
//     },
//     [highDemandBySegment],
//   );

//   const HandleCompareOption = useCallback(
//     ({ id }: { id: number | undefined }) => {
//       const randomFour =
//         passData?.filter((it) => it?.id !== id).slice(0, 4) ?? [];
//       setFilterDetail(randomFour);
//     },
//     [passData],
//   );

//   // const handleCancelCompare = (modalType: "compare" | "share") => {
//   //   if (modalType === "compare") setIsModalOpen(false);
//   //   else setFilterData([]);
//   // };

//   const handleOfferSelection = useCallback(
//     (offerId: string, item: any) => {
//       navigate("/flight-booking", {
//         state: {
//           offerId,
//           searchKey: item?.searchKey,
//           flightDetail: item,
//           passengersForRequest: passengersForRequest || [],
//         },
//       });
//     },
//     [navigate, passengersForRequest],
//   );

//   const renderSegmentCard = (
//     seg: any,
//     item: any,
//     segIdx: number,
//     showPrice: boolean,
//   ) => {
//     const rawSeg = seg?.rawSegment ?? seg;
//     const perSegFlightDetail = buildPerSegmentFlightDetail(
//       seg?.flight_detail || item?.flight_detail || {},
//       rawSeg,
//     );

//     const journeys = item?.raw?.journey ?? [];
//     const journeyItem = journeys[segIdx] ?? {};
//     const segs = journeyItem?.flightSegments ?? [rawSeg ? [rawSeg] : []];

//     const itemForTiming = {
//       ...seg,
//       flight_detail: perSegFlightDetail,
//       stop: seg?.stop ?? [],
//       raw: {
//         ...item?.raw,
//         journey: [
//           {
//             ...journeyItem,
//             flightSegments: Array.isArray(segs) ? segs : [segs],
//           },
//         ],
//       },
//     };

//     const visible = extractFlightFeatures(
//       rawSeg,
//       seg?.flight_detail || item?.flight_detail || {},
//       item?.raw?.fare || {},
//       {
//         cabinIcon,
//         baggageIcon,
//         mealIcon: refundableIcon,
//         durationIcon,
//         seatIcon: SEAT_ICON,
//         entertainmentIcon: PLANE_ICON,
//       },
//     );

//     const price = item?.rawTotalStartingFare ?? item?.raw?.fare?.totalFare ?? 0;
//     const currency = item?.raw?.fare?.currencyCode ?? "AED";

//     return (
//       <div
//         className="topHalfCard RoundTripCardDetail"
//         key={`multi-${item?.id}-${segIdx}`}
//       >
//         <div className="fightTitle">
//           <div className="flightIcon">
//             <img src={seg?.logo ?? item?.logo} alt="" />
//           </div>
//           <div className="nameAndDetails">
//             <h5>{seg?.name ?? item?.name}</h5>
//             <p>
//               {itemForTiming?.flight_detail?.flight_number} -{" "}
//               {itemForTiming?.flight_detail?.flight_class}
//             </p>
//           </div>
//         </div>

//         <div className="stopsOnLarge">
//           <FlightTimingAndStops passSome={itemForTiming} />
//         </div>

//         {visible.length ? (
//           <div className="featureIcons">
//             {visible.map((f) => (
//               <div className="featureIconTooltipWrap" key={f.key}>
//                 <img src={f.icon} alt={f.key} />
//                 <span className="tooltip">{f.label}</span>
//               </div>
//             ))}
//           </div>
//         ) : null}

//         <div className={`StartingPrice ${showPrice ? "" : "invisible"}`}>
//           <span>Start from</span>
//           <h5>
//             {currency} {price}
//           </h5>
//         </div>

//         <div className="stopsOnSmall">
//           <FlightTimingAndStops passSome={itemForTiming} />
//         </div>
//       </div>
//     );
//   };

//   if (!passData || passData.length === 0) {
//     return (
//       <div>
//         {typeof emptyState === "function" ? emptyState() : (emptyState ?? null)}
//         <div ref={loadMoreRef} className="min-h-[1px]" />
//       </div>
//     );
//   }

//   return (
//     <div className="">
//       {passData?.map((item: any, index: number) => {
//         const segments = item?.segments ?? [];
//         const hasMultiple = segments.length > 1;

//         return (
//           <div
//             key={index}
//             className={`flightDetailCards ${hasMultiple ? "flightDetailRoundTripCards" : ""}`}
//           >
//             <div className="forBorderBottom">
//               {segments.map((seg: any, segIdx: number) =>
//                 renderSegmentCard(seg, item, segIdx, segIdx === 0),
//               )}
//             </div>

//             <div className="bottomHalfCard">
//               <div className="bottomHalfCardflexStyle">
//                 <div className="modalOptions">
//                   <div className="tabs">
//                     <div
//                       className={`tab ${active?.name === "price" && active?.id === index ? "active" : ""}`}
//                       onClick={() => {
//                         HandlePriceOption({ id: item.id });
//                         setActive((prev) => ({
//                           ...prev,
//                           name: "price",
//                           id: index,
//                         }));
//                       }}
//                     >
//                       Price options
//                     </div>
//                     <div
//                       className={`tab ${active?.name === "flight" && active?.id === index ? "active" : ""}`}
//                       onClick={() => {
//                         HandlePriceOption({ id: item.id });
//                         setActive((prev) => ({
//                           ...prev,
//                           name: "flight",
//                           id: index,
//                         }));
//                       }}
//                     >
//                       Flight details
//                     </div>
//                     <div
//                       className={`tab ${active?.name === "compare" && active?.id === index ? "active" : ""}`}
//                       onClick={() => {
//                         HandleCompareOption({ id: item.id });
//                         setActive((prev) => ({
//                           ...prev,
//                           name: "compare",
//                           id: index,
//                         }));
//                       }}
//                     >
//                       Compare
//                     </div>
//                   </div>
//                 </div>
//                 <div className="selectPriceBtn flex items-center gap-2">
//                   {item.offerViewCount > 0 && (
//                     <div className="inline-flex items-center justify-center text-xs text-[#1A3C7A] border border-[#1A3C7A] rounded-full px-3 py-2 bg-[#A7C0EC] whitespace-nowrap">
//                       <img src={offerViewIcon} alt="icon" className="mr-1" />
//                       {item.offerViewCount} People viewing this
//                     </div>
//                   )}
//                   {(() => {
//                     // Extract marketing airline from each segment
//                     const segments = item?.segments ?? [];
//                     const segmentAirlines = segments
//                       .map((_: any, idx: number) => {
//                         const journeys = item?.raw?.journey ?? [];
//                         const journeyItem = journeys[idx] ?? {};
//                         const segs = journeyItem?.flightSegments ?? [];
//                         const currentSeg = Array.isArray(segs)
//                           ? segs[0]
//                           : (segs?.[0] ?? segs ?? null);
//                         return currentSeg?.marketingAirline ?? "";
//                       })
//                       .filter(Boolean); // Remove empty strings

//                     const highDemandInfo = getHighDemandInfo(segmentAirlines);

//                     return highDemandInfo ? (
//                       <div className="inline-flex items-center justify-center text-xs text-[#B80020] border border-[#B80020] rounded-full px-3 py-2 bg-[#FFB8C4] whitespace-nowrap">
//                         <img
//                           src={highDemandIcon}
//                           alt="icon"
//                           className="w-3 h-3 mr-1"
//                         />
//                         High-demand
//                         {/* High-demand ({highDemandInfo.totalCount}) */}
//                       </div>
//                     ) : null;
//                   })()}
//                   <CustomButton
//                     onClick={() => handleOfferSelection(item?.offerId, item)}
//                   >
//                     Select Price
//                   </CustomButton>
//                 </div>
//               </div>
//               <React.Suspense
//                 fallback={
//                   <div className="tab-loading-placeholder">Loading…</div>
//                 }
//               >
//                 {active?.name === "price" && active?.id === index ? (
//                   <PricingDetailCard passSome={filterDetail} />
//                 ) : active?.name === "flight" && active?.id === index ? (
//                   <FlightDetailsCard details={item} />
//                 ) : active?.name === "compare" && active?.id === index ? (
//                   <CompareCard
//                     currentFlight={mapOfferForCompareMultiCity(item)}
//                     availableFlights={pickRandomFlightsForCompare(
//                       passData || [],
//                       item.id,
//                       4,
//                       mapOfferForCompareMultiCity,
//                     )}
//                   />
//                 ) : null}
//               </React.Suspense>
//             </div>
//           </div>
//         );
//       })}

//       <div ref={loadMoreRef} className="min-h-[1px]">
//         {renderLoader?.({ isLoadingMore, hasMore })}
//       </div>
//     </div>
//   );
// };

// export default TravelMultiCity;
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../../assets/css/travel.css";
import cabinIcon from "../../assets/svgs/cabin.svg";
import highDemandIcon from "../../assets/svgs/high-demand.svg";
import offerViewIcon from "../../assets/svgs/offer-view-icon.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import durationIcon from "../../assets/svgs/duration.svg";
import refundableIcon from "../../assets/svgs/redundable.svg";
import SEAT_ICON from "../../assets/svgs/seat.svg";
import PLANE_ICON from "../../assets/svgs/plane.svg";
// import WIFI_ICON from "../../assets/svgs/wifi.svg"; // Add this import if available
// import POWER_ICON from "../../assets/svgs/power.svg"; // Add this import if available
// import ENTERTAINMENT_ICON from "../../assets/svgs/entertainment.svg"; // Add this import if available
import CustomButton from "../common/CustomButton";
import FlightTimingAndStops from "../atoms/FlightTimingAndStops";
import { useNavigate } from "react-router-dom";
import {
  buildPerSegmentFlightDetail,
  mapOfferForCompareMultiCity,
  pickRandomFlightsForCompare,
  extractFlightFeatures,
} from "../../utils/searchFlightListingHelpers";
import { offerHasAncillaryDetailsAvailable } from "../../utils/flightFilters";

const PricingDetailCard = React.lazy(() => import("./PricingDetailCard"));
const FlightDetailsCard = React.lazy(() => import("./FlightDetailsCard"));
const CompareCard = React.lazy(() => import("./CompareCard"));

type TravelMultiCityProps = {
  passData: any[];
  passengersForRequest?: { id: string; ptc: string }[];
  isLoadingMore?: boolean;
  hasMore?: boolean;
  renderLoader?: (state: {
    isLoadingMore?: boolean;
    hasMore?: boolean;
  }) => React.ReactNode;
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
  emptyState?: (() => React.ReactNode) | React.ReactNode;
  highDemandIndicators?: any[];
};

const TravelMultiCity: React.FC<TravelMultiCityProps> = ({
  passData,
  passengersForRequest,
  isLoadingMore,
  hasMore,
  renderLoader,
  loadMoreRef,
  emptyState,
  highDemandIndicators = [],
}) => {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setFilterData] = useState<any[]>([]);
  const [filterDetail, setFilterDetail] = useState<any[]>([]);
  const [active, setActive] = useState({ name: "", id: 0 });
  const [showTabs, setShowTabs] = useState<{ [key: number]: boolean }>({});
  const [buttonState, setButtonState] = useState<{ [key: number]: "view" | "book" }>({});

  const navigate = useNavigate();

  useEffect(() => {
    import("./PricingDetailCard");
    import("./FlightDetailsCard");
    import("./CompareCard");
  }, []);

  const detailById = useMemo(() => {
    const lookup: Record<string | number, any[]> = {};
    (passData || []).forEach((it) => {
      if (it?.id !== undefined) lookup[it.id] = [it];
    });
    return lookup;
  }, [passData]);

  const HandlePriceOption = useCallback(
    ({ id }: { id: number | undefined }) => {
      const filtered = (id !== undefined && detailById[id]) || [];
      setFilterDetail(filtered);
      setFilterData([]);
    },
    [detailById],
  );

  const highDemandBySegment = useMemo(() => {
    if (!highDemandIndicators || highDemandIndicators.length === 0) return [];

    return highDemandIndicators.map((indicator) => ({
      marketingAirline: indicator.marketingAirline,
      totalCounts: indicator.totalCounts,
      highDemand: indicator.highDemand,
    }));
  }, [highDemandIndicators]);

  const getHighDemandInfo = useCallback(
    (segmentAirlines: string[]) => {
      if (!highDemandBySegment || highDemandBySegment.length === 0) return null;
      if (segmentAirlines.length !== highDemandBySegment.length) return null;

      // Check if ALL segments match their corresponding indicator
      const allMatch = segmentAirlines.every((airline, index) => {
        const indicator = highDemandBySegment[index];
        return (
          indicator?.highDemand === true &&
          indicator?.marketingAirline === airline
        );
      });

      if (!allMatch) return null;

      // Calculate total count across all segments
      const totalCount = highDemandBySegment.reduce(
        (sum, indicator) => sum + (indicator.totalCounts || 0),
        0,
      );

      return {
        totalCount,
        segmentCounts: highDemandBySegment.map((ind) => ind.totalCounts),
        highDemand: true,
      };
    },
    [highDemandBySegment],
  );

  const HandleCompareOption = useCallback(
    ({ id }: { id: number | undefined }) => {
      const randomFour =
        passData?.filter((it) => it?.id !== id).slice(0, 4) ?? [];
      setFilterDetail(randomFour);
    },
    [passData],
  );

  // const handleCancelCompare = (modalType: "compare" | "share") => {
  //   if (modalType === "compare") setIsModalOpen(false);
  //   else setFilterData([]);
  // };

  const handleOfferSelection = useCallback(
    (offerId: string, item: any) => {
      navigate("/flight-booking", {
        state: {
          offerId,
          searchKey: item?.searchKey,
          flightDetail: item,
          passengersForRequest: passengersForRequest || [],
        },
      });
    },
    [navigate, passengersForRequest],
  );

  const handleViewDetailsClick = (itemId: number) => {
    setShowTabs((prev) => ({
      ...prev,
      [itemId]: !prev[itemId], // Toggle tabs visibility for this specific card
    }));
    // Set active tab to "price" by default when showing tabs
    setActive({ name: "price", id: itemId });
    // Load price options data
    HandlePriceOption({ id: itemId });
    // Change button to "Book Now"
    setButtonState((prev) => ({
      ...prev,
      [itemId]: "book",
    }));
  };

  const handleBookNowClick = (offerId: string, item: any) => {
    handleOfferSelection(offerId, item);
  };

  const renderSegmentCard = (
    seg: any,
    item: any,
    segIdx: number,
    showPrice: boolean,
  ) => {
    const rawSeg = seg?.rawSegment ?? seg;
    const perSegFlightDetail = buildPerSegmentFlightDetail(
      seg?.flight_detail || item?.flight_detail || {},
      rawSeg,
    );

    const journeys = item?.raw?.journey ?? [];
    const journeyItem = journeys[segIdx] ?? {};
    const segs = journeyItem?.flightSegments ?? [rawSeg ? [rawSeg] : []];

    const itemForTiming = {
      ...seg,
      flight_detail: perSegFlightDetail,
      stop: seg?.stop ?? [],
      raw: {
        ...item?.raw,
        journey: [
          {
            ...journeyItem,
            flightSegments: Array.isArray(segs) ? segs : [segs],
          },
        ],
      },
    };

    const visible = extractFlightFeatures(
      rawSeg,
      seg?.flight_detail || item?.flight_detail || {},
      item?.raw?.fare || {},
      {
        cabinIcon,
        baggageIcon,
        mealIcon: refundableIcon,
        durationIcon,
        seatIcon: SEAT_ICON,
        entertainmentIcon: PLANE_ICON,
        // wifiIcon: WIFI_ICON, // Add if available
        // powerIcon: POWER_ICON, // Add if available
      },
    );

    // Ensure icons render in the exact order requested by the product
    const desiredOrder = ["cabin", "baggage", "meal", "duration", "seats", "equipment"];
    const orderedVisible = desiredOrder.map((k) => visible.find((v: any) => v.key === k)).filter(Boolean as any) as any[];

    // Resolve airline logo from src/assets/images when a simple filename or airline code is provided
    const resolveLocalImage = (val?: string) => {
      if (!val || typeof val !== "string") return undefined;
      // if it's already an absolute/remote URL, use as-is
      if (/^https?:\/\//i.test(val) || val.startsWith("/")) return val;
      // if it looks like a filename, try to resolve from assets/images
      if (/\.(png|jpe?g|svg)$/i.test(val)) {
        try {
          return new URL(`../../assets/images/${val}`, import.meta.url).href;
        } catch {
          return val;
        }
      }
      // otherwise treat as airline code and try .png
      try {
        return new URL(`../../assets/images/${val.toLowerCase()}.png`, import.meta.url).href;
      } catch {
        return undefined;
      }
    };

    let logoSrc = resolveLocalImage(seg?.logo ?? item?.logo) ?? undefined;
    if (!logoSrc) {
      const marketing = rawSeg?.marketingAirline ?? item?.raw?.journey?.[0]?.flightSegments?.[0]?.marketingAirline;
      logoSrc = resolveLocalImage(typeof marketing === "string" ? marketing : undefined);
    }
    const finalLogo = logoSrc ?? new URL("../../assets/images/emirates.png", import.meta.url).href;

    const price = item?.rawTotalStartingFare ?? item?.raw?.fare?.totalFare ?? 0;
    const currency = item?.raw?.fare?.currencyCode ?? "AED";

    return (
      <div
        className="topHalfCard RoundTripCardDetail"
        key={`multi-${item?.id}-${segIdx}`}
        style={{ position: "relative" }}
      >
        {segIdx === 1 && (
          <div style={{ position: "absolute", right: 16, top: 12, zIndex: 5 }}>
            <CustomButton
              onClick={() => 
                buttonState[item?.id] === "book" 
                  ? handleBookNowClick(item?.offerId, item)
                  : handleViewDetailsClick(item?.id)
              }
              style={{
                backgroundColor: "#2351A3",
                color: "#FFFFFF",
                padding: "8px 18px",
                borderRadius: "100px",
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              {buttonState[item?.id] === "book" ? "Book Now" : "View Details"}
            </CustomButton>
          </div>
        )}
        {/* Airline Branding Section - Redesigned */}
        <div className="airlineBranding" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          marginBottom: "16px",
          padding: "8px 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <div className="flightIcon" style={{ marginLeft: "9px" }}>
              <img
                src={finalLogo}
                alt={seg?.name ?? item?.name}
                style={{
                  width: "54px",
                  height: "46px",
                  objectFit: "contain",
                  borderRadius: "50%",
                  marginLeft: "9px",
                  borderBottom: "none",
                }}
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.onerror = null;
                  t.src = new URL("../../assets/images/emirates.png", import.meta.url).href;
                }}
              />
            </div>
            <div className="airlineInfo" style={{ marginLeft: "12px" }}>
              <h5 style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#0A0C0F",
                marginBottom: "4px",
              }}>
                {seg?.name ?? item?.name}
              </h5>
              <p style={{
                fontSize: "14px",
                color: "#3D495C",
                margin: 0,
              }}>
                {itemForTiming?.flight_detail?.flight_number} - {itemForTiming?.flight_detail?.flight_class}
              </p>
            </div>
          </div>

          {/* Icons row directly under airline name */}
          {orderedVisible.length ? (
            <div className="featureIcons" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "3px", marginLeft: "86px" }}>
              {orderedVisible.slice(0, 6).map((f) => (
                <div className="featureIconTooltipWrap" key={f.key} style={{ position: "relative" }} title={f.label}>
                  <img src={f.icon} alt={f.key} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                  <span className="tooltip">{f.label}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Flight Timing and Stops */}
        <div className="stopsOnLarge" style={{ marginBottom: "16px" }}>
          <FlightTimingAndStops passSome={itemForTiming} />
        </div>

        
        {/* Price Section */}
        <div className={`StartingPrice ${showPrice ? "" : "invisible"}`} style={{
          marginTop: "-32px",
          textAlign: "center",
          marginRight: "41px",
        }}>
          <span style={{ fontSize: "12px", color: "#3D495C" }}>Start from</span>
          <h5 style={{ 
            fontSize: "18px", 
            fontWeight: "700", 
            color: "#2351A3",
            marginTop: "4px"
          }}>
            {currency} {price}
          </h5>
        </div>

        <div className="stopsOnSmall">
          <FlightTimingAndStops passSome={itemForTiming} />
        </div>
      </div>
    );
  };

  if (!passData || passData.length === 0) {
    return (
      <div>
        {typeof emptyState === "function" ? emptyState() : (emptyState ?? null)}
        <div ref={loadMoreRef} className="min-h-[1px]" />
      </div>
    );
  }

  return (
    <div className="">
      {passData?.map((item: any, index: number) => {
        const segments = item?.segments ?? [];
        const hasMultiple = segments.length > 1;

        return (
          <div
            key={index}
            className={`flightDetailCards ${hasMultiple ? "flightDetailRoundTripCards" : ""}`}
            style={{ 
              marginBottom: "24px",
              overflow: "hidden"
            }}
          >
            <div className="forBorderBottom">
              {segments.map((seg: any, segIdx: number) =>
                renderSegmentCard(seg, item, segIdx, segIdx === 0),
              )}
            </div>

            <div className="bottomHalfCard" style={{ padding: "16px" }}>
              <div className="bottomHalfCardflexStyle" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px"
              }}>
                <div className="modalOptions">
                  {/* Tabs - Only show when showTabs[item.id] is true */}
                  {showTabs[item.id] && (
                    <div className="tabs" style={{ display: "flex", gap: "8px", margin: 0, padding: 0 }}>
                      <div
                        className={`tab ${active?.name === "price" && active?.id === item.id ? "active" : ""}`}
                        onClick={() => {
                          HandlePriceOption({ id: item.id });
                          setActive((prev) => ({
                            ...prev,
                            name: "price",
                            id: item.id,
                          }));
                        }}
                        style={{
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: active?.name === "price" && active?.id === item.id ? "#FFFFFF" : "#3D495C",
                          padding: "8px 16px",
                          backgroundColor: active?.name === "price" && active?.id === item.id ? "#2351A3" : "#E4E4E7",
                          transition: "0.2s",
                          border: "none",
                          borderTopLeftRadius: "16px",
                          borderTopRightRadius: "16px",
                          margin: 0,
                        }}
                      >
                        Price options
                      </div>
                      <div
                        className={`tab ${active?.name === "flight" && active?.id === item.id ? "active" : ""}`}
                        onClick={() => {
                          HandlePriceOption({ id: item.id });
                          setActive((prev) => ({
                            ...prev,
                            name: "flight",
                            id: item.id,
                          }));
                        }}
                        style={{
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: active?.name === "flight" && active?.id === item.id ? "#FFFFFF" : "#3D495C",
                          padding: "8px 16px",
                          backgroundColor: active?.name === "flight" && active?.id === item.id ? "#2351A3" : "#E4E4E7",
                          transition: "0.2s",
                          border: "none",
                          borderTopLeftRadius: "16px",
                          borderTopRightRadius: "16px",
                          margin: 0,
                        }}
                      >
                        Flight details
                      </div>
                      <div
                        className={`tab ${active?.name === "compare" && active?.id === item.id ? "active" : ""}`}
                        onClick={() => {
                          HandleCompareOption({ id: item.id });
                          setActive((prev) => ({
                            ...prev,
                            name: "compare",
                            id: item.id,
                          }));
                        }}
                        style={{
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: active?.name === "compare" && active?.id === item.id ? "#FFFFFF" : "#3D495C",
                          padding: "8px 16px",
                          backgroundColor: active?.name === "compare" && active?.id === item.id ? "#2351A3" : "#E4E4E7",
                          transition: "0.2s",
                          border: "none",
                          borderTopLeftRadius: "16px",
                          borderTopRightRadius: "16px",
                          margin: 0,
                        }}
                      >
                        Compare
                      </div>
                    </div>
                  )}
                </div>
                <div className="selectPriceBtn flex items-center gap-2" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  {item.offerViewCount > 0 && (
                    <div className="inline-flex items-center justify-center text-xs text-[#1A3C7A] border border-[#1A3C7A] rounded-full px-3 py-2 bg-[#A7C0EC] whitespace-nowrap">
                      <img src={offerViewIcon} alt="icon" className="mr-1" />
                      {item.offerViewCount} People viewing this
                    </div>
                  )}
                  {offerHasAncillaryDetailsAvailable(item) ? (
                    <div className="inline-flex items-center justify-center text-xs text-[#0F5132] border border-[#A3CFBB] rounded-full px-3 py-2 bg-[#D1E7DD] whitespace-nowrap font-medium">
                      Add-ons available
                    </div>
                  ) : null}
                  {(() => {
                    // Extract marketing airline from each segment
                    const segments = item?.segments ?? [];
                    const segmentAirlines = segments
                      .map((_: any, idx: number) => {
                        const journeys = item?.raw?.journey ?? [];
                        const journeyItem = journeys[idx] ?? {};
                        const segs = journeyItem?.flightSegments ?? [];
                        const currentSeg = Array.isArray(segs)
                          ? segs[0]
                          : (segs?.[0] ?? segs ?? null);
                        return currentSeg?.marketingAirline ?? "";
                      })
                      .filter(Boolean); // Remove empty strings

                    const highDemandInfo = getHighDemandInfo(segmentAirlines);

                    return highDemandInfo ? (
                      <div className="inline-flex items-center justify-center text-xs text-[#B80020] border border-[#B80020] rounded-full px-3 py-2 bg-[#FFB8C4] whitespace-nowrap">
                        <img
                          src={highDemandIcon}
                          alt="icon"
                          className="w-3 h-3 mr-1"
                        />
                        High-demand
                        {/* High-demand ({highDemandInfo.totalCount}) */}
                      </div>
                    ) : null;
                  })()}
                  {/* Select Price button moved to top of second segment */}
                </div>
              </div>
              <React.Suspense
                fallback={
                  <div className="tab-loading-placeholder" style={{ padding: "20px", textAlign: "center" }}>Loading…</div>
                }
              >
                {active?.name === "price" && active?.id === item.id ? (
                  <PricingDetailCard passSome={filterDetail} />
                ) : active?.name === "flight" && active?.id === item.id ? (
                  <FlightDetailsCard details={item} />
                ) : active?.name === "compare" && active?.id === item.id ? (
                  <CompareCard
                    currentFlight={mapOfferForCompareMultiCity(item)}
                    availableFlights={pickRandomFlightsForCompare(
                      passData || [],
                      item.id,
                      4,
                      mapOfferForCompareMultiCity,
                    )}
                  />
                ) : null}
              </React.Suspense>
            </div>
          </div>
        );
      })}

      <div ref={loadMoreRef} className="min-h-[1px]">
        {renderLoader?.({ isLoadingMore, hasMore })}
      </div>
    </div>
  );
};

export default TravelMultiCity;