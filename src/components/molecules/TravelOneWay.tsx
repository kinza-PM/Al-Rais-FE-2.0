import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../../assets/css/travel.css";

import offerViewIcon from "../../assets/svgs/offer-view-icon.svg";
import defaultAirlineLogo from "../../assets/images/emirates.png";

import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import durationIcon from "../../assets/svgs/duration.svg";
import refundableIcon from "../../assets/svgs/redundable.svg";
import SEAT_ICON from "../../assets/svgs/seat.svg";
import PLANE_ICON from "../../assets/svgs/plane.svg";
import { Switch, Modal } from "antd";

import { useNavigate } from "react-router-dom";
import { travelData } from "../../utils/mockData";
import {
  formatListingStartingFare,
  getMarketingAirlineDisplayName,
} from "../../utils/helpers";
import FlightTimingAndStops from "../atoms/FlightTimingAndStops";
import Loader from "../atoms/Loader";
import {
  buildPerSegmentFlightDetail,
  mapOfferForCompareOneWay,
  pickRandomFlightsForCompare,
  extractFlightFeatures,
  resolveAirlineLogoFromSegment,
} from "../../utils/searchFlightListingHelpers";
import { buildFlightSearchPriceOptions } from "../../utils/flightPriceOptionsUtils";
import { useFlightFareRuleSearch } from "../../hooks/useFlightBooking";
import { offerHasAncillaryDetailsAvailable } from "../../utils/flightFilters";

const PricingDetailCard = React.lazy(() => import("./PricingDetailCard"));
const CompareCard = React.lazy(() => import("./CompareCard"));
const FlightDetailsCard = React.lazy(() => import("./FlightDetailsCard"));

type TravelOneWayProps = {
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

const radioReminder = (checked: boolean) => {
  console.log(`switch to ${checked}`);
};

const getAirlineDisplayName = (item: any, seg?: any) =>
  getMarketingAirlineDisplayName(seg, item);

const TravelOneWay: React.FC<TravelOneWayProps> = ({
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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"price" | "flight" | "compare">(
    "price",
  );
  const [, setFilterDetail] = useState<any[]>([]);
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
        const key = String(it?.offerId ?? "");
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
    if (!highDemandIndicators || highDemandIndicators.length === 0) {
      return new Map();
    }

    const lookup = new Map();
    highDemandIndicators.forEach((indicator) => {
      if (indicator.highDemand === true && indicator.marketingAirline) {
        lookup.set(indicator.marketingAirline, {
          totalCounts: indicator.totalCounts,
          highDemand: indicator.highDemand,
        });
      }
    });

    return lookup;
  }, [highDemandIndicators]);

  const getHighDemandInfo = useCallback(
    (marketingAirline: string) => {
      return highDemandLookup.get(marketingAirline) || null;
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
            mapOfferForCompareOneWay,
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
          mapOfferForCompareOneWay,
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
      {passData?.map((item, index) => {
        const segs: any[] = item?.raw?.journey?.[0]?.flightSegments ?? [];
        const currentSeg = Array.isArray(segs)
          ? segs[0]
          : (segs?.[0] ?? segs ?? null);

        const airlineDisplayName = getAirlineDisplayName(item, currentSeg);

        const perSegFlightDetail = buildPerSegmentFlightDetail(
          item?.flight_detail || {},
          currentSeg,
        );

        const itemForTiming = {
          ...item,
          flight_detail: perSegFlightDetail,
          stop: [],
          raw: {
            ...item.raw,
            journey: [
              {
                ...(item.raw?.journey?.[0] || {}),
                flightSegments: Array.isArray(segs)
                  ? segs
                  : segs
                    ? [segs]
                    : [],
              },
            ],
          },
        };

        const visible = extractFlightFeatures(
          currentSeg,
          item?.flight_detail || {},
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

        const flightNo = itemForTiming?.flight_detail?.flight_number;
        const flightClass = itemForTiming?.flight_detail?.flight_class;
        const subtitle =
          flightNo && flightClass
            ? `${flightNo} - ${flightClass}`
            : [flightNo, flightClass].filter(Boolean).join(" • ") ||
              airlineDisplayName;

        const marketingAirline = currentSeg?.marketingAirline;
        const highDemandInfo = getHighDemandInfo(marketingAirline);

        const listingAirlineLogo =
          resolveAirlineLogoFromSegment(currentSeg) ||
          String(item?.logo ?? "").trim();

        return (
          <div
            className="flightDetailCards flight-ow-card"
            key={item?.id ?? index}
          >
            <div className="topHalfCardWrap ow-card-wrap">
              <div className="topHalfCard ow-card-main-row">
                <div className="fightTitle ow-card-airline-col">
                  <div className="flightIcon ow-card-airline-logo">
                    <img
                      src={listingAirlineLogo || defaultAirlineLogo}
                      alt={item?.name || "Airline"}
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

              <div className="stopsOnSmall ow-card-timing-mobile">
                <FlightTimingAndStops passSome={itemForTiming} />
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

                {highDemandInfo ? (
                  <div
                    className="inline-flex items-center justify-center whitespace-nowrap bg-[#FFB8C4] px-3 py-1.5 text-[12px] font-medium uppercase text-[#B80020]"
                    style={{ borderRadius: "6px" }}
                  >
                    HIGH DEMAND
                  </div>
                ) : null}
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

      <div className="reminderCard">
        <div className="reminderCardPart1">
          <div className="textSection">
            <h5>Keep me posted about this search</h5>
            <p>
              Get important updates about price alerts, weather alerts and other
              updates in your inbox
            </p>
          </div>
        </div>
        <div>
          <Switch defaultChecked onChange={radioReminder} />
        </div>
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
        width="100%"
        destroyOnClose
        className="flight-details-popup"
        styles={{
          content: {
            maxWidth: 1180,
            width: "100%",
            margin: "0 auto",
          },
          body: {
            maxHeight: "92vh",
            overflowY: "auto",
            overflowX: "hidden",
            padding: "16px 24px 20px",
            minWidth: 0,
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
            <div className="flight-details-modal-toolbar">
              <div
                className="flight-details-modal-toolbar__tabs"
                style={{ display: "flex", gap: "8px" }}
              >
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

              <div
                className="flight-details-modal-toolbar__actions"
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                {selectedItem.offerViewCount > 0 && (
                  <div className="inline-flex items-center justify-center text-xs text-[#1A3C7A] border border-[#1A3C7A] rounded-full px-3 py-2 bg-[#A7C0EC] whitespace-nowrap">
                    <img src={offerViewIcon} alt="icon" className="mr-1" />
                    {selectedItem.offerViewCount} People viewing this
                  </div>
                )}

                <button
                  type="button"
                  className="flight-details-book-now-btn flight-details-book-now-desktop"
                  onClick={() =>
                    handleOfferSelection(selectedItem?.offerId, selectedItem)
                  }
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
                  currentFlight={mapOfferForCompareOneWay(selectedItem)}
                  availableFlights={pickRandomFlightsForCompare(
                    passData || [],
                    selectedItem.id,
                    4,
                    mapOfferForCompareOneWay,
                  )}
                />
              )}
            </React.Suspense>

            <div className="flight-details-book-now-mobile">
              <button
                type="button"
                className="flight-details-book-now-btn"
                onClick={() =>
                  handleOfferSelection(selectedItem?.offerId, selectedItem)
                }
              >
                Book Now
              </button>
            </div>
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
        centered
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

export default TravelOneWay;