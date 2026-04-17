import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../../assets/css/travel.css";

import offerViewIcon from "../../assets/svgs/offer-view-icon.svg";
import defaultAirlineLogo from "../../assets/images/emirates.png";

import { Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { travelData } from "../../utils/mockData";
import { formatListingStartingFare } from "../../utils/helpers";

const PricingDetailCard = React.lazy(() => import("./PricingDetailCard"));
const FlightDetailsCard = React.lazy(() => import("./FlightDetailsCard"));
const CompareCard = React.lazy(() => import("./CompareCard"));

import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import durationIcon from "../../assets/svgs/duration.svg";
import refundableIcon from "../../assets/svgs/redundable.svg";
import SEAT_ICON from "../../assets/svgs/seat.svg";
import PLANE_ICON from "../../assets/svgs/plane.svg";
import FlightTimingAndStops from "../atoms/FlightTimingAndStops";
import Loader from "../atoms/Loader";

import {
  buildPerSegmentFlightDetail,
  mapOfferForCompareRoundTrip,
  pickRandomFlightsForCompare,
  extractFlightFeatures,
  resolveAirlineLogoFromSegment,
} from "../../utils/searchFlightListingHelpers";
import { offerHasAncillaryDetailsAvailable } from "../../utils/flightFilters";
import { buildFlightSearchPriceOptions } from "../../utils/flightPriceOptionsUtils";
import { useFlightFareRuleSearch } from "../../hooks/useFlightBooking";

type TravelRoundTripProps = {
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

const TravelRoundTrip: React.FC<TravelRoundTripProps> = ({
  passData,
  passengersForRequest,
  isLoadingMore,
  hasMore,
  renderLoader,
  loadMoreRef,
  emptyState,
  highDemandIndicators = [],
}) => {
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [, setFilterDetail] = useState<any[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"price" | "flight" | "compare">(
    "price",
  );
  const [fareRulePriceByOfferId, setFareRulePriceByOfferId] = useState<
    Record<string, any>
  >({});
  const [fareRuleLoadingOfferId, setFareRuleLoadingOfferId] = useState<string | null>(null);
  const fareRuleInFlightRef = useRef<Record<string, boolean>>({});
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

  const highDemandLookup = useMemo(() => {
    if (!highDemandIndicators || highDemandIndicators.length === 0) return null;

    return {
      outbound: highDemandIndicators[0] || null,
      inbound: highDemandIndicators[1] || null,
    };
  }, [highDemandIndicators]);

  const getHighDemandInfo = useCallback(
    (outboundAirline: string, inboundAirline: string | null) => {
      if (!highDemandLookup) return null;

      const { outbound, inbound } = highDemandLookup;

      const outboundMatches =
        outbound?.highDemand === true &&
        outbound?.marketingAirline === outboundAirline;

      const inboundMatches =
        inbound?.highDemand === true &&
        inbound?.marketingAirline === inboundAirline;

      if (outboundMatches && inboundMatches) {
        return {
          outboundCount: outbound.totalCounts,
          inboundCount: inbound.totalCounts,
          totalCount: outbound.totalCounts + inbound.totalCounts,
          highDemand: true,
        };
      }

      return null;
    },
    [highDemandLookup],
  );

  const openDetailsModal = useCallback(
    (item: any, tab: "price" | "flight" | "compare" = "price") => {
      setActiveTab(tab);
      setIsDetailsModalOpen(true);
      // Open modal first, then mount heavy content/fetches.
      window.setTimeout(() => {
        setSelectedItem(item);
        if (tab === "price") {
          const filtered = (item?.id !== undefined && detailById[item.id]) || [];
          setFilterDetail(filtered);
          void hydrateFareRulesForItem(item);
        } else if (tab === "compare") {
          const compareList = pickRandomFlightsForCompare(
            passData || [],
            item?.id,
            4,
            mapOfferForCompareRoundTrip,
          );
          setFilterDetail(compareList);
        }
      }, 0);
    },
    [detailById, passData, hydrateFareRulesForItem],
  );

  const handleTabChange = useCallback(
    (tab: "price" | "flight" | "compare") => {
      if (!selectedItem) return;

      setActiveTab(tab);

      if (tab === "price") {
        const filtered =
          (selectedItem?.id !== undefined && detailById[selectedItem.id]) || [];
        setFilterDetail(filtered);
        window.setTimeout(() => {
          void hydrateFareRulesForItem(selectedItem);
        }, 0);
      }

      if (tab === "compare") {
        const compareList = pickRandomFlightsForCompare(
          passData || [],
          selectedItem?.id,
          4,
          mapOfferForCompareRoundTrip,
        );
        setFilterDetail(compareList);
      }
    },
    [selectedItem, detailById, passData, hydrateFareRulesForItem],
  );

  const handleCancelCompare = () => {
    setIsCompareModalOpen(false);
  };

  const handleOfferSelection = React.useCallback(
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
      {passData?.map((item: any, index: number) => {
        const renderRoundTopCard = (display: any, parent: any) => {
          const d = display ?? parent;
          const raw = d?.raw ?? parent?.raw ?? {};
          const parentJourneys = parent?.raw?.journey ?? raw?.journey ?? [];
          let journeyIndex = 0;

          if (Array.isArray(parentJourneys) && parentJourneys.length > 1) {
            if (display === parent?.inbound) journeyIndex = 1;
            else if (display === parent?.outbound) journeyIndex = 0;
          }

          const segs = raw?.journey?.[journeyIndex]?.flightSegments ?? [];
          const hasSegs = Array.isArray(segs) && segs.length > 0;
          const currentSeg = hasSegs ? segs[0] : null;

          const perSegFlightDetail = buildPerSegmentFlightDetail(
            d?.flight_detail || {},
            currentSeg,
          );

          const itemForTiming = {
            ...d,
            flight_detail: perSegFlightDetail,
            stop: [],
            raw: {
              ...raw,
              journey: [
                {
                  ...(raw?.journey?.[journeyIndex] || {}),
                  flightSegments: Array.isArray(segs)
                    ? segs
                    : segs
                      ? [segs]
                      : [],
                },
              ],
            },
          };

          const baseFeatures = extractFlightFeatures(
            currentSeg,
            d?.flight_detail || {},
            parent?.raw?.fare || d?.raw?.fare || {},
            {
              cabinIcon,
              baggageIcon,
              mealIcon: refundableIcon,
              durationIcon,
              seatIcon: SEAT_ICON,
              entertainmentIcon: PLANE_ICON,
            },
          );

          const visible = baseFeatures.map((f) => ({
            ...f,
            label: f.label,
          }));

          const flightNo = itemForTiming?.flight_detail?.flight_number;
          const flightClass = itemForTiming?.flight_detail?.flight_class;
          const airlineDisplayName = getAirlineDisplayName(d, currentSeg);
          const subtitle =
            flightNo && flightClass
              ? `${flightNo} - ${flightClass}`
              : [flightNo, flightClass].filter(Boolean).join(" • ") ||
                airlineDisplayName;

          const listingAirlineLogo =
            resolveAirlineLogoFromSegment(currentSeg) ||
            String(d?.logo ?? "").trim();

          return (
            <div
              className="ow-card-rt-leg RoundTripCardDetail"
              key={`round-${d?.id || parent?.id || journeyIndex}`}
            >
              <div className="fightTitle ow-card-airline-col">
                <div className="flightIcon ow-card-airline-logo">
                  <img
                    src={listingAirlineLogo || defaultAirlineLogo}
                    alt={airlineDisplayName}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = defaultAirlineLogo;
                    }}
                  />
                </div>

                <div className="ow-card-airline-content">
                  <div className="nameAndDetails ow-card-name-group">
                    <h5>{airlineDisplayName}</h5>
                    <p>{subtitle}</p>
                  </div>

                  {visible.length ? (
                    <div className="featureIcons ow-card-feature-icons">
                      {visible.slice(0, 6).map((f) => (
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

        const outbound = item?.outbound ?? null;
        const inbound = item?.inbound ?? null;

        return (
          <div
            key={item?.id ?? index}
            className={`flightDetailCards flight-ow-card ${
              inbound ? "flightDetailRoundTripCards" : ""
            }`}
          >
            <div className="topHalfCardWrap ow-card-wrap">
              <div className="topHalfCard ow-card-main-row ow-card-rt-main">
                <div className="ow-card-rt-legs">
                  {renderRoundTopCard(outbound ?? item, item)}
                  {inbound ? renderRoundTopCard(inbound, item) : null}
                </div>

                <div className="StartingPrice ow-card-price-block">
                  <div className="ow-card-price-actions-row">
                    <div className="ow-card-price-copy">
                      <p className="ow-card-price-label">Starting from</p>
                      <h5>
                        {formatListingStartingFare(
                          item?.raw?.fare?.currencyCode ?? "$",
                          item.rawTotalStartingFare,
                        )}
                      </h5>
                    </div>

                    <div className="ow-card-cta-group">
                      <button
                        type="button"
                        className="ow-card-btn ow-card-btn-outline"
                        onClick={() => openDetailsModal(item, "price")}
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
                  const outboundSegs =
                    item?.outbound?.raw?.journey?.[0]?.flightSegments ??
                    item?.raw?.journey?.[0]?.flightSegments ??
                    [];
                  const outboundSeg = Array.isArray(outboundSegs)
                    ? outboundSegs[0]
                    : (outboundSegs?.[0] ?? outboundSegs ?? null);
                  const outboundAirline = outboundSeg?.marketingAirline;

                  const inboundSegs =
                    item?.inbound?.raw?.journey?.[0]?.flightSegments ??
                    item?.raw?.journey?.[1]?.flightSegments ??
                    [];
                  const inboundSeg = Array.isArray(inboundSegs)
                    ? inboundSegs[0]
                    : (inboundSegs?.[0] ?? inboundSegs ?? null);
                  const inboundAirline = inboundSeg?.marketingAirline;

                  const highDemandInfo = getHighDemandInfo(
                    outboundAirline,
                    inboundAirline,
                  );

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
          </div>
        );
      })}

      <div ref={loadMoreRef} className="min-h-[1px]">
        {renderLoader?.({ isLoadingMore, hasMore })}
      </div>

      <Modal
        open={isDetailsModalOpen}
        onCancel={() => {
          setIsDetailsModalOpen(false);
          setSelectedItem(null);
          setActiveTab("price");
          setFilterDetail([]);
        }}
        footer={null}
        centered
        width={1180}
        destroyOnClose
        className="flight-details-popup"
        styles={{
          body: {
            maxHeight: "92vh",
            overflowY: "auto",
            padding: "16px 24px 20px",
          },
        }}
        title={
          <div style={{ textAlign: "center", paddingTop: 4 }}>
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
              Flight details
            </h2>
            <p style={{ margin: "6px 0 0", color: "#64748B" }}>
              Review price options, flight details and compare flights
            </p>
          </div>
        }
      >
        <Loader
          show={
            activeTab === "price" &&
            fareRuleLoadingOfferId === String(selectedItem?.offerId ?? "").trim()
          }
          label="Loading fare rules..."
        />
        {selectedItem && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { key: "price", label: "Price options" },
                  { key: "flight", label: "Flight details" },
                  { key: "compare", label: "Compare" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() =>
                      handleTabChange(tab.key as "price" | "flight" | "compare")
                    }
                    style={{
                      height: "38px",
                      padding: "0 16px",
                      borderRadius: "14px 14px 0 0",
                      border: "none",
                      cursor: "pointer",
                      background: activeTab === tab.key ? "#2351A3" : "#F1F5F9",
                      color: activeTab === tab.key ? "#FFFFFF" : "#64748B",
                      fontWeight: 500,
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {selectedItem.offerViewCount > 0 && (
                  <div className="inline-flex items-center justify-center text-xs text-[#1A3C7A] border border-[#1A3C7A] rounded-full px-3 py-2 bg-[#A7C0EC] whitespace-nowrap">
                    <img src={offerViewIcon} alt="icon" className="mr-1" />
                    {selectedItem.offerViewCount} People viewing this
                  </div>
                )}

                <button
                  onClick={() =>
                    handleOfferSelection(selectedItem?.offerId, selectedItem)
                  }
                  style={{
                    width: "130px",
                    height: "44px",
                    background:
                      "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
                    borderRadius: "100px",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>

            <React.Suspense fallback={<div>Loading…</div>}>
              {activeTab === "price" ? (
                <>
                  <PricingDetailCard passSome={detailById[selectedItem.id] || []} />
                </>
              ) : activeTab === "flight" ? (
                <FlightDetailsCard details={selectedItem} />
              ) : (
                <CompareCard
                  currentFlight={mapOfferForCompareRoundTrip(selectedItem)}
                  availableFlights={pickRandomFlightsForCompare(
                    passData || [],
                    selectedItem.id,
                    4,
                    mapOfferForCompareRoundTrip,
                  )}
                />
              )}
            </React.Suspense>
          </>
        )}
      </Modal>

      <Modal
        title={
          <div className="modalHeader" style={{ textAlign: "center" }}>
            <h2>Add another flight</h2>
            <p>
              Compare the flights from this listing to see what suits you best
            </p>
          </div>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={isCompareModalOpen}
        footer={null}
        centered={true}
        onCancel={handleCancelCompare}
        className="compareModal"
      >
        {travelData?.map((item) => (
          <div className="modalFlightDetailCard" key={item?.id}>
            <div className="modalFlightDetail">
              <div className="fightTitle">
                <div className="flightIcon">
                  <img src={item?.logo} alt="" />
                </div>
                <div className="nameAndDetails">
                  <h5>{item?.name}</h5>
                  <p>
                    {item?.flight_detail?.flight_number} -{" "}
                    {item?.flight_detail?.flight_class}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Modal>
    </div>
  );
};

export default TravelRoundTrip;