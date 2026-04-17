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
import defaultAirlineLogo from "../../assets/images/emirates.png";
import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import durationIcon from "../../assets/svgs/duration.svg";
import refundableIcon from "../../assets/svgs/redundable.svg";
import SEAT_ICON from "../../assets/svgs/seat.svg";
import PLANE_ICON from "../../assets/svgs/plane.svg";
import FlightTimingAndStops from "../atoms/FlightTimingAndStops";
import Loader from "../atoms/Loader";
import { useNavigate } from "react-router-dom";
import { formatListingStartingFare } from "../../utils/helpers";
import {
  buildPerSegmentFlightDetail,
  mapOfferForCompareMultiCity,
  pickRandomFlightsForCompare,
  extractFlightFeatures,
  resolveAirlineLogoFromSegment,
} from "../../utils/searchFlightListingHelpers";
import { offerHasAncillaryDetailsAvailable } from "../../utils/flightFilters";
import { buildFlightSearchPriceOptions } from "../../utils/flightPriceOptionsUtils";
import { useFlightFareRuleSearch } from "../../hooks/useFlightBooking";

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

const getAirlineDisplayName = (item: any, seg?: any) => {
  return (
    item?.airlineName ||
    seg?.marketingAirlineName ||
    seg?.operatingAirlineName ||
    item?.name ||
    seg?.marketingAirline ||
    "Airline"
  );
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
  const [fareRulePriceByOfferId, setFareRulePriceByOfferId] = useState<
    Record<string, any>
  >({});
  const [fareRuleLoadingOfferId, setFareRuleLoadingOfferId] = useState<string | null>(null);
  const { mutateAsync: fetchFareRules } = useFlightFareRuleSearch();

  const navigate = useNavigate();

  useEffect(() => {
    import("./PricingDetailCard");
    import("./FlightDetailsCard");
    import("./CompareCard");
  }, []);

  const detailById = useMemo(() => {
    const lookup: Record<string | number, any[]> = {};
    (passData || []).forEach((it) => {
      if (it?.id !== undefined) {
        const key = String(it?.offerId ?? "").trim();
        const mergedPrice = key ? fareRulePriceByOfferId[key] : null;
        lookup[it.id] = [
          mergedPrice
            ? {
                ...it,
                price: mergedPrice,
              }
            : it,
        ];
      }
    });
    return lookup;
  }, [passData, fareRulePriceByOfferId]);

  const hydrateFareRulesForItem = useCallback(
    async (item: any) => {
      const offerId = String(item?.offerId ?? "").trim();
      const searchKey = String(item?.searchKey ?? "").trim();
      if (!offerId || !searchKey || fareRulePriceByOfferId[offerId]) return;
      try {
        setFareRuleLoadingOfferId(offerId);
        const response = await fetchFareRules({ offerId, searchKey });
        const fareRuleItem = response?.data?.[0];
        if (!fareRuleItem) return;
        const nextPrice = buildFlightSearchPriceOptions(item?.raw, fareRuleItem);
        setFareRulePriceByOfferId((prev) => ({ ...prev, [offerId]: nextPrice }));
      } catch {
        // Keep base listing data if fare-rule fetch fails.
      } finally {
        setFareRuleLoadingOfferId((prev) => (prev === offerId ? null : prev));
      }
    },
    [fareRulePriceByOfferId, fetchFareRules],
  );

  const HandlePriceOption = useCallback(
    ({ id }: { id: number | undefined }) => {
      const filtered = (id !== undefined && detailById[id]) || [];
      setFilterDetail(filtered);
      setFilterData([]);
      const target = filtered?.[0];
      if (target) {
        hydrateFareRulesForItem(target);
      }
    },
    [detailById, hydrateFareRulesForItem],
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
      [itemId]: !prev[itemId],
    }));
    setActive({ name: "price", id: itemId });
    HandlePriceOption({ id: itemId });
  };

  const renderMultiCityLeg = (seg: any, item: any, segIdx: number) => {
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
      },
    );

    const desiredOrder = [
      "cabin",
      "baggage",
      "meal",
      "duration",
      "seats",
      "equipment",
    ];
    const orderedVisible = desiredOrder
      .map((k) => visible.find((v: any) => v.key === k))
      .filter(Boolean) as any[];

    const flightNo = itemForTiming?.flight_detail?.flight_number;
    const flightClass = itemForTiming?.flight_detail?.flight_class;
    const airlineDisplayName = getAirlineDisplayName(seg, rawSeg);
    const subtitle =
      flightNo && flightClass
        ? `${flightNo} - ${flightClass}`
        : [flightNo, flightClass].filter(Boolean).join(" • ") ||
          airlineDisplayName;

    const listingAirlineLogo =
      resolveAirlineLogoFromSegment(rawSeg) || String(seg?.logo ?? "").trim();

    return (
      <div
        className="ow-card-rt-leg RoundTripCardDetail"
        key={`multi-${item?.id}-${segIdx}`}
      >
        <div className="fightTitle ow-card-airline-col">
          <div className="flightIcon ow-card-airline-logo">
            <img
              src={listingAirlineLogo || defaultAirlineLogo}
              alt={airlineDisplayName}
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.onerror = null;
                t.src = defaultAirlineLogo;
              }}
            />
          </div>

          <div className="ow-card-airline-content">
            <div className="nameAndDetails ow-card-name-group">
              <h5>{airlineDisplayName}</h5>
              <p>{subtitle}</p>
            </div>

            {orderedVisible.length ? (
              <div className="featureIcons ow-card-feature-icons">
                {orderedVisible.slice(0, 6).map((f) => (
                  <div
                    className="featureIconTooltipWrap"
                    key={f.key}
                    style={{ position: "relative" }}
                  >
                    <img src={f.icon} alt={f.key} />
                    <span className="tooltip">{f.label}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="stopsOnLarge ow-card-timing-col">
          <FlightTimingAndStops passSome={itemForTiming} />
        </div>

        <div className="stopsOnSmall ow-card-timing-mobile">
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
    <div className="flex flex-col gap-0" style={{ background: "transparent" }}>
      <Loader
        show={!!fareRuleLoadingOfferId}
        label="Loading fare rules..."
      />
      {passData?.map((item: any, index: number) => {
        const segments = item?.segments ?? [];

        return (
          <div
            key={item?.id ?? index}
            className="flightDetailCards flight-ow-card flightDetailMultiCityCards"
          >
            <div className="topHalfCardWrap ow-card-wrap">
              <div className="topHalfCard ow-card-main-row ow-card-rt-main">
                <div className="ow-card-rt-legs">
                  {segments.map((seg: any, segIdx: number) =>
                    renderMultiCityLeg(seg, item, segIdx),
                  )}
                </div>

                <div className="StartingPrice ow-card-price-block">
                  <div className="ow-card-price-actions-row">
                    <div className="ow-card-price-copy">
                      <p className="ow-card-price-label">Starting from</p>
                      <h5>
                        {formatListingStartingFare(
                          item?.raw?.fare?.currencyCode ?? "$",
                          item.rawTotalStartingFare ??
                            item?.raw?.fare?.totalFare ??
                            0,
                        )}
                      </h5>
                    </div>

                    <div className="ow-card-cta-group">
                      <button
                        type="button"
                        className="ow-card-btn ow-card-btn-outline"
                        onClick={() => handleViewDetailsClick(item.id)}
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        className="ow-card-btn ow-card-btn-primary ow-card-book-now--inrow"
                        onClick={() =>
                          handleOfferSelection(item?.offerId, item)
                        }
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="selectPriceBtn ow-card-badge-row">
                {item.offerViewCount > 0 ? (
                  <div
                    className="inline-flex items-center justify-center whitespace-nowrap bg-[#A7C0EC] px-3 py-1.5 text-[12px] font-medium uppercase text-[#1A3C7A]"
                    style={{ borderRadius: "6px" }}
                  >
                    {item.offerViewCount} PEOPLE VIEWING
                  </div>
                ) : null}

                {offerHasAncillaryDetailsAvailable(item) ? (
                  <div
                    className="inline-flex items-center justify-center whitespace-nowrap bg-[#D1E7DD] px-3 py-1.5 text-[12px] font-medium uppercase text-[#0F5132]"
                    style={{ borderRadius: "6px" }}
                  >
                    Add-ons available
                  </div>
                ) : null}

                {(() => {
                  const segsList = item?.segments ?? [];
                  const segmentAirlines = segsList
                    .map((_: any, idx: number) => {
                      const journeys = item?.raw?.journey ?? [];
                      const journeyItem = journeys[idx] ?? {};
                      const segsFs = journeyItem?.flightSegments ?? [];
                      const currentSeg = Array.isArray(segsFs)
                        ? segsFs[0]
                        : (segsFs?.[0] ?? segsFs ?? null);
                      return currentSeg?.marketingAirline ?? "";
                    })
                    .filter(Boolean);

                  const highDemandInfo = getHighDemandInfo(segmentAirlines);

                  return highDemandInfo ? (
                    <div
                      className="inline-flex items-center justify-center whitespace-nowrap bg-[#FFB8C4] px-3 py-1.5 text-[12px] font-medium uppercase text-[#B80020]"
                      style={{ borderRadius: "6px" }}
                    >
                      HIGH DEMAND
                    </div>
                  ) : null;
                })()}
              </div>

              <div className="ow-card-mobile-book-now">
                <button
                  type="button"
                  className="ow-card-btn ow-card-btn-primary ow-card-book-now--footer"
                  onClick={() =>
                    handleOfferSelection(item?.offerId, item)
                  }
                >
                  Book Now
                </button>
              </div>
            </div>

            <div className="bottomHalfCard border-t border-[var(--black-100,#c2cad6)] bg-white px-4 py-4">
              {showTabs[item.id] ? (
                <>
                  <div className="modalOptions mb-4">
                    <div className="tabs flex gap-2 p-0 m-0">
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
                          color:
                            active?.name === "price" && active?.id === item.id
                              ? "#FFFFFF"
                              : "#3D495C",
                          padding: "8px 16px",
                          backgroundColor:
                            active?.name === "price" && active?.id === item.id
                              ? "#2351A3"
                              : "#E4E4E7",
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
                          color:
                            active?.name === "flight" && active?.id === item.id
                              ? "#FFFFFF"
                              : "#3D495C",
                          padding: "8px 16px",
                          backgroundColor:
                            active?.name === "flight" && active?.id === item.id
                              ? "#2351A3"
                              : "#E4E4E7",
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
                          color:
                            active?.name === "compare" && active?.id === item.id
                              ? "#FFFFFF"
                              : "#3D495C",
                          padding: "8px 16px",
                          backgroundColor:
                            active?.name === "compare" && active?.id === item.id
                              ? "#2351A3"
                              : "#E4E4E7",
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
                  </div>
                  <React.Suspense
                    fallback={
                      <div
                        className="tab-loading-placeholder"
                        style={{ padding: "20px", textAlign: "center" }}
                      >
                        Loading…
                      </div>
                    }
                  >
                    {active?.name === "price" && active?.id === item.id ? (
                      <>
                        <PricingDetailCard passSome={filterDetail} />
                      </>
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
                </>
              ) : null}
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