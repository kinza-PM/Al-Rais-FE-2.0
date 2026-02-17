import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../../assets/css/travel.css";
import cabinIcon from "../../assets/svgs/cabin.svg";
import highDemandIcon from "../../assets/svgs/high-demand.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import durationIcon from "../../assets/svgs/duration.svg";
import refundableIcon from "../../assets/svgs/redundable.svg";
import SEAT_ICON from "../../assets/svgs/seat.svg";
import PLANE_ICON from "../../assets/svgs/plane.svg";
import CustomButton from "../common/CustomButton";
import FlightTimingAndStops from "../atoms/FlightTimingAndStops";
import { useNavigate } from "react-router-dom";
import {
  buildPerSegmentFlightDetail,
  mapOfferForCompareMultiCity,
  pickRandomFlightsForCompare,
  extractFlightFeatures,
} from "../../utils/searchFlightListingHelpers";

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

  const getHighDemandInfo = useCallback((segmentAirlines: string[]) => {
    if (!highDemandBySegment || highDemandBySegment.length === 0) return null;
    if (segmentAirlines.length !== highDemandBySegment.length) return null;

    // Check if ALL segments match their corresponding indicator
    const allMatch = segmentAirlines.every((airline, index) => {
      const indicator = highDemandBySegment[index];
      return indicator?.highDemand === true && indicator?.marketingAirline === airline;
    });

    if (!allMatch) return null;

    // Calculate total count across all segments
    const totalCount = highDemandBySegment.reduce(
      (sum, indicator) => sum + (indicator.totalCounts || 0),
      0
    );

    return {
      totalCount,
      segmentCounts: highDemandBySegment.map((ind) => ind.totalCounts),
      highDemand: true,
    };
  }, [highDemandBySegment]);

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
      },
    );

    const price = item?.rawTotalStartingFare ?? item?.raw?.fare?.totalFare ?? 0;
    const currency = item?.raw?.fare?.currencyCode ?? "AED";

    return (
      <div
        className="topHalfCard RoundTripCardDetail"
        key={`multi-${item?.id}-${segIdx}`}
      >
        <div className="fightTitle">
          <div className="flightIcon">
            <img src={seg?.logo ?? item?.logo} alt="" />
          </div>
          <div className="nameAndDetails">
            <h5>{seg?.name ?? item?.name}</h5>
            <p>
              {itemForTiming?.flight_detail?.flight_number} -{" "}
              {itemForTiming?.flight_detail?.flight_class}
            </p>
          </div>
        </div>

        <div className="stopsOnLarge">
          <FlightTimingAndStops passSome={itemForTiming} />
        </div>

        {visible.length ? (
          <div className="featureIcons">
            {visible.map((f) => (
              <div className="featureIconTooltipWrap" key={f.key}>
                <img src={f.icon} alt={f.key} />
                <span className="tooltip">{f.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className={`StartingPrice ${showPrice ? "" : "invisible"}`}>
          <span>Start from</span>
          <h5>
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
          >
            <div className="forBorderBottom">
              {segments.map((seg: any, segIdx: number) =>
                renderSegmentCard(seg, item, segIdx, segIdx === 0),
              )}
            </div>

            <div className="bottomHalfCard">
              <div className="bottomHalfCardflexStyle">
                <div className="modalOptions">
                  <div className="tabs">
                    <div
                      className={`tab ${active?.name === "price" && active?.id === index ? "active" : ""}`}
                      onClick={() => {
                        HandlePriceOption({ id: item.id });
                        setActive((prev) => ({
                          ...prev,
                          name: "price",
                          id: index,
                        }));
                      }}
                    >
                      Price options
                    </div>
                    <div
                      className={`tab ${active?.name === "flight" && active?.id === index ? "active" : ""}`}
                      onClick={() => {
                        HandlePriceOption({ id: item.id });
                        setActive((prev) => ({
                          ...prev,
                          name: "flight",
                          id: index,
                        }));
                      }}
                    >
                      Flight details
                    </div>
                    <div
                      className={`tab ${active?.name === "compare" && active?.id === index ? "active" : ""}`}
                      onClick={() => {
                        HandleCompareOption({ id: item.id });
                        setActive((prev) => ({
                          ...prev,
                          name: "compare",
                          id: index,
                        }));
                      }}
                    >
                      Compare
                    </div>
                  </div>
                </div>
                <div className="selectPriceBtn flex items-center gap-2" >
                  {(() => {
                    // Extract marketing airline from each segment
                    const segments = item?.segments ?? [];
                    const segmentAirlines = segments.map((_: any, idx: number) => {
                      const journeys = item?.raw?.journey ?? [];
                      const journeyItem = journeys[idx] ?? {};
                      const segs = journeyItem?.flightSegments ?? [];
                      const currentSeg = Array.isArray(segs) ? segs[0] : segs?.[0] ?? segs ?? null;
                      return currentSeg?.marketingAirline ?? '';
                    }).filter(Boolean); // Remove empty strings

                    const highDemandInfo = getHighDemandInfo(segmentAirlines);

                    return highDemandInfo ? (
                      <div className="inline-flex items-center justify-center text-xs text-[#B80020] border border-[#B80020] rounded-full px-3 py-2 bg-[#FFB8C4] whitespace-nowrap">
                        <img src={highDemandIcon} alt="icon" className="w-3 h-3 mr-1" />
                        High-demand
                        {/* High-demand ({highDemandInfo.totalCount}) */}
                      </div>
                    ) : null;
                  })()}
                  <CustomButton onClick={() => handleOfferSelection(item?.offerId, item)}>Select Price</CustomButton>
                </div>
              </div>
              <React.Suspense
                fallback={
                  <div className="tab-loading-placeholder">Loading…</div>
                }
              >
                {active?.name === "price" && active?.id === index ? (
                  <PricingDetailCard passSome={filterDetail} />
                ) : active?.name === "flight" && active?.id === index ? (
                  <FlightDetailsCard details={item} />
                ) : active?.name === "compare" && active?.id === index ? (
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
