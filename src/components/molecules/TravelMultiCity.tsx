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
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import LoginModal from "../common/LoginModal";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { buildShareFlightListingSnapshot } from "../../utils/shareFlightListingContext";
import ShareFlightListingModal from "../atoms/ShareFlightListingModal";
import { useNavigate } from "react-router-dom";
import {
  formatListingStartingFare,
  getMarketingAirlineDisplayName,
} from "../../utils/helpers";
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

const getAirlineDisplayName = (item: any, seg?: any) =>
  getMarketingAirlineDisplayName(seg, item);

const listingCardKey = (item: any) => String(item?.offerId ?? item?.id ?? "");

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
  const [inlinePanel, setInlinePanel] = useState<{
    key: string;
    tab: "price" | "flight" | "compare";
  } | null>(null);
  const [shareListingItem, setShareListingItem] = useState<any | null>(null);
  const [fareRulePriceByOfferId, setFareRulePriceByOfferId] = useState<
    Record<string, any>
  >({});
  const [fareRuleLoadingOfferId, setFareRuleLoadingOfferId] = useState<string | null>(null);
  const fareRuleInFlightRef = useRef<Record<string, boolean>>({});
  const { mutateAsync: fetchFareRules } = useFlightFareRuleSearch();

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const pendingBookingRef = useRef<{ offerId: string; item: any } | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const resumePendingBooking = useCallback(() => {
    if (!pendingBookingRef.current) return;

    const { offerId, item } = pendingBookingRef.current;
    pendingBookingRef.current = null;
    setLoginModalOpen(false);
    navigate("/flight-booking", {
      state: {
        offerId,
        searchKey: item?.searchKey,
        flightDetail: item,
        passengersForRequest: passengersForRequest || [],
      },
    });
  }, [navigate, passengersForRequest]);

  useEffect(() => {
    if (isAuthenticated) {
      resumePendingBooking();
    }
  }, [isAuthenticated, resumePendingBooking]);

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
      if (
        !offerId ||
        !searchKey ||
        fareRulePriceByOfferId[offerId] ||
        fareRuleInFlightRef.current[offerId]
      ) {
        return;
      }
      try {
        fareRuleInFlightRef.current[offerId] = true;
        setFareRuleLoadingOfferId(offerId);
        const response = await fetchFareRules({ offerId, searchKey });
        const fareRuleItem = response?.data?.[0];
        if (!fareRuleItem) return;
        const nextPrice = buildFlightSearchPriceOptions(item?.raw, fareRuleItem);
        setFareRulePriceByOfferId((prev) => ({ ...prev, [offerId]: nextPrice }));
      } catch {
        // Keep base listing data if fare-rule fetch fails.
      } finally {
        delete fareRuleInFlightRef.current[offerId];
        setFareRuleLoadingOfferId((prev) => (prev === offerId ? null : prev));
      }
    },
    [fareRulePriceByOfferId, fetchFareRules],
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

  // const handleCancelCompare = (modalType: "compare" | "share") => {
  //   if (modalType === "compare") setIsModalOpen(false);
  //   else setFilterData([]);
  // };

  const handleOfferSelection = useCallback(
    (offerId: string, item: any) => {
      if (!isAuthenticated) {
        pendingBookingRef.current = { offerId, item };
        setLoginModalOpen(true);
        return;
      }
      navigate("/flight-booking", {
        state: {
          offerId,
          searchKey: item?.searchKey,
          flightDetail: item,
          passengersForRequest: passengersForRequest || [],
        },
      });
    },
    [navigate, passengersForRequest, isAuthenticated],
  );

  const onListingTabClick = useCallback(
    (item: any, tab: "price" | "flight" | "compare") => {
      const key = listingCardKey(item);
      setInlinePanel((prev) => {
        if (prev?.key === key && prev.tab === tab) return null;
        return { key, tab };
      });
    },
    [],
  );

  useEffect(() => {
    if (!inlinePanel || inlinePanel.tab !== "price") return;
    const item = (passData || []).find(
      (p) => listingCardKey(p) === inlinePanel.key,
    );
    if (item) void hydrateFareRulesForItem(item);
  }, [inlinePanel, passData, hydrateFareRulesForItem]);

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
    const flightClassMeta = (() => {
      const c = String(flightClass ?? "").trim();
      if (!c) return "";
      return /\bclass\b/i.test(c) ? c : `${c} class`;
    })();
    const airlineDisplayName = getAirlineDisplayName(seg, rawSeg);
    const subtitle =
      flightNo && flightClassMeta
        ? `${flightNo} - ${flightClassMeta}`
        : [flightNo, flightClassMeta].filter(Boolean).join(" • ") ||
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
          </div>
        </div>

        <div className="stopsOnLarge ow-card-timing-col">
          <FlightTimingAndStops
            passSome={itemForTiming}
            listingStyle
          />
        </div>

        {orderedVisible.length ? (
          <div
            className="featureIcons ow-card-feature-icons ow-card-feature-icons--listing"
            aria-label="Flight amenities"
          >
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
        ) : (
          <div
            className="ow-card-feature-icons ow-card-feature-icons--listing ow-card-feature-icons--empty"
            aria-hidden
          />
        )}

        <div className="stopsOnSmall ow-card-timing-mobile">
          <FlightTimingAndStops
            passSome={itemForTiming}
            listingStyle
          />
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
        const listingKey = listingCardKey(item);

        const segmentAirlines = segments
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

        const multiCityHighDemand = getHighDemandInfo(segmentAirlines);

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

                <div className="StartingPrice ow-card-price-block ow-card-price-block--top">
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
                </div>
              </div>

              <div className="ow-card-listing-divider" aria-hidden />

              <div className="ow-card-bottom-bar">
                <nav
                  className="ow-card-tab-links"
                  aria-label="Flight listing actions"
                >
                  <button
                    type="button"
                    className={`ow-card-tab-link${
                      inlinePanel?.key === listingKey &&
                      inlinePanel.tab === "price"
                        ? " ow-card-tab-link--active"
                        : ""
                    }`}
                    onClick={() => onListingTabClick(item, "price")}
                  >
                    Price options
                  </button>
                  <button
                    type="button"
                    className={`ow-card-tab-link${
                      inlinePanel?.key === listingKey &&
                      inlinePanel.tab === "flight"
                        ? " ow-card-tab-link--active"
                        : ""
                    }`}
                    onClick={() => onListingTabClick(item, "flight")}
                  >
                    Flight details
                  </button>
                  <button
                    type="button"
                    className={`ow-card-tab-link${
                      inlinePanel?.key === listingKey &&
                      inlinePanel.tab === "compare"
                        ? " ow-card-tab-link--active"
                        : ""
                    }`}
                    onClick={() => onListingTabClick(item, "compare")}
                  >
                    Compare
                  </button>
                  <span className="ow-card-tab-sep" aria-hidden />
                  <button
                    type="button"
                    className="ow-card-tab-link ow-card-tab-link--share"
                    onClick={() => setShareListingItem(item)}
                  >
                    Share
                  </button>
                </nav>

                <div className="ow-card-bottom-right">
                  <div className="ow-card-bottom-badges">
                    {item.offerViewCount > 0 ? (
                      <div className="ow-card-figma-badge ow-card-figma-badge--viewing">
                        {item.offerViewCount} viewing
                      </div>
                    ) : null}

                    {offerHasAncillaryDetailsAvailable(item) ? (
                      <div className="ow-card-figma-badge ow-card-figma-badge--addons">
                        Add-ons available
                      </div>
                    ) : null}

                    {multiCityHighDemand ? (
                      <div className="ow-card-figma-badge ow-card-figma-badge--high-demand">
                        <svg
                          className="ow-card-high-demand-icon"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M4 14 L9 9 L14 12 L20 6"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16 6h4v4"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        High-demand
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className="ow-card-btn ow-card-btn-primary ow-card-select-price ow-card-select-price--desktop"
                    onClick={() => handleOfferSelection(item?.offerId, item)}
                  >
                    Select price
                  </button>
                </div>
              </div>

              {inlinePanel?.key === listingKey ? (
                <div
                  className="ow-card-inline-expand"
                  id={`flight-listing-expand-mc-${listingKey}`}
                >
                  <Loader
                    show={
                      inlinePanel.tab === "price" &&
                      fareRuleLoadingOfferId ===
                        String(item?.offerId ?? "").trim()
                    }
                    label="Loading fare rules..."
                  />
                  <React.Suspense
                    fallback={
                      <div className="py-4 text-center text-sm text-[#64748B]">
                        Loading…
                      </div>
                    }
                  >
                    {inlinePanel.tab === "price" ? (
                      <PricingDetailCard
                        passSome={detailById[item.id] || []}
                      />
                    ) : inlinePanel.tab === "flight" ? (
                      <FlightDetailsCard details={item} listingLayout />
                    ) : (
                      <CompareCard
                        currentFlight={mapOfferForCompareMultiCity(item)}
                        availableFlights={pickRandomFlightsForCompare(
                          passData || [],
                          item.id,
                          4,
                          mapOfferForCompareMultiCity,
                        )}
                      />
                    )}
                  </React.Suspense>
                </div>
              ) : null}

              <div className="ow-card-mobile-book-now">
                <button
                  type="button"
                  className="ow-card-btn ow-card-btn-primary ow-card-book-now--footer"
                  onClick={() => handleOfferSelection(item?.offerId, item)}
                >
                  Select price
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <div ref={loadMoreRef} className="min-h-[1px]">
        {renderLoader?.({ isLoadingMore, hasMore })}
      </div>

      {shareListingItem ? (
        <ShareFlightListingModal
          closeModal={() => setShareListingItem(null)}
          snapshot={buildShareFlightListingSnapshot(shareListingItem)}
        />
      ) : null}

      <LoginModal
        showModal={loginModalOpen}
        showGoBack
        onAuthSuccess={resumePendingBooking}
        onClose={() => {
          pendingBookingRef.current = null;
          setLoginModalOpen(false);
        }}
      />
    </div>
  );
};

export default TravelMultiCity;