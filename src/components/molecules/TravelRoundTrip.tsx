import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../../assets/css/travel.css";

import highDemandIcon from "../../assets/svgs/high-demand.svg";
import offerViewIcon from "../../assets/svgs/offer-view-icon.svg";
import whatsappIcon from "../../assets/svgs/Icon.png.svg";
import defaultAirlineLogo from "../../assets/images/alRaisLogo.jpg";

import { Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { travelData } from "../../utils/mockData";

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

import {
  buildPerSegmentFlightDetail,
  mapOfferForCompareRoundTrip,
  pickRandomFlightsForCompare,
  extractFlightFeatures,
} from "../../utils/searchFlightListingHelpers";
import { offerHasAncillaryDetailsAvailable } from "../../utils/flightFilters";

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
  const [shareModal, setshareModal] = useState(false);
  const [filterData] = useState<any[]>([]);
  const [, setFilterDetail] = useState<any[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"price" | "flight" | "compare">(
    "price",
  );

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
        lookup[it.id] = [it];
      }
    });
    return lookup;
  }, [passData]);

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
      setSelectedItem(item);
      setActiveTab(tab);

      if (tab === "price") {
        const filtered = (item?.id !== undefined && detailById[item.id]) || [];
        setFilterDetail(filtered);
      }

      if (tab === "compare") {
        const compareList = pickRandomFlightsForCompare(
          passData || [],
          item?.id,
          4,
          mapOfferForCompareRoundTrip,
        );
        setFilterDetail(compareList);
      }

      setIsDetailsModalOpen(true);
    },
    [detailById, passData],
  );

  const handleTabChange = useCallback(
    (tab: "price" | "flight" | "compare") => {
      if (!selectedItem) return;

      setActiveTab(tab);

      if (tab === "price") {
        const filtered =
          (selectedItem?.id !== undefined && detailById[selectedItem.id]) || [];
        setFilterDetail(filtered);
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
    [selectedItem, detailById, passData],
  );

  const handleCancelCompare = (modalType: "compare" | "share") => {
    if (modalType === "compare") {
      setIsCompareModalOpen(false);
    } else {
      setshareModal(false);
    }
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
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
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

          return (
            <div
              className="topHalfCard RoundTripCardDetail"
              key={`round-${d?.id || parent?.id || Math.random()}`}
              style={{
                width: "100%",
                minHeight: "101px",
                display: "flex",
                alignItems: "center",
                padding: "20px 0",
                gap: "24px",
                background: "transparent",
                borderRadius: "0",
                border: "none",
                boxSizing: "border-box",
                marginBottom: "0",
              }}
            >
              <div
                className="fightTitle"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1px",
                  minWidth: "201px",
                }}
              >
                <div className="flightIcon" style={{ flexShrink: 0 }}>
                  <img
                    src={d?.logo || defaultAirlineLogo}
                    alt={d?.name || "Airline"}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = defaultAirlineLogo;
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    flex: 1,
                  }}
                >
                  <div className="nameAndDetails">
                    <h5
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#0F172A",
                        lineHeight: 1.3,
                      }}
                    >
                      {d?.name}
                    </h5>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        color: "#64748B",
                        lineHeight: 1.3,
                        marginTop: "2px",
                      }}
                    >
                      {itemForTiming?.flight_detail?.flight_number} -{" "}
                      {itemForTiming?.flight_detail?.flight_class}
                    </p>
                  </div>

                  {visible.length ? (
                    <div
                      className="featureIcons"
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {visible.slice(0, 6).map((f) => (
                        <div
                          className="featureIconTooltipWrap"
                          key={f.key}
                          style={{ position: "relative" }}
                        >
                          <img
                            src={f.icon}
                            alt={f.key}
                            style={{
                              width: "18px",
                              height: "18px",
                              cursor: "pointer",
                            }}
                          />
                          <span className="tooltip">{f.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div
                className="stopsOnLarge"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FlightTimingAndStops passSome={itemForTiming} />
              </div>

              <div className="stopsOnSmall">
                <FlightTimingAndStops passSome={itemForTiming} />
              </div>
            </div>
          );
        };

        const outbound = item?.outbound ?? null;
        const inbound = item?.inbound ?? null;

        return (
          <div
            key={index}
            className={`flightDetailCards ${
              inbound ? "flightDetailRoundTripCards" : ""
            }`}
            style={{
              border: "none",
              marginBottom: "0",
              paddingBottom: "0",
              borderBottom:
                index < passData.length - 1 ? "2px solid #E4E4E7" : "none",
            }}
          >
            <div
              className="topHalfCardWrap"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                padding: "20px 0",
              }}
            >
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {renderRoundTopCard(outbound ?? item, item)}
                {inbound && renderRoundTopCard(inbound, item)}
              </div>

              <div
                className="StartingPrice"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "8px",
                  minWidth: "320px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#64748B",
                    fontWeight: 400,
                    alignSelf: "flex-start",
                  }}
                >
                  Starting from
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <h5
                    style={{
                      margin: 0,
                      fontSize: "27px",
                      fontWeight: 700,
                      color: "#2351A3",
                      lineHeight: 1,
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {item?.raw?.fare?.currencyCode ?? "$"}
                    {item.rawTotalStartingFare}
                  </h5>

                  <button
                    onClick={() => openDetailsModal(item, "price")}
                    style={{
                      width: "150px",
                      height: "47px",
                      borderRadius: "100px",
                      padding: "14px 25px",
                      background:
                        "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
                      color: "#FFFFFF",
                      fontSize: "15px",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(35, 81, 163, 0.3)",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    View details
                  </button>

                  <button
                    onClick={() => handleOfferSelection(item?.offerId, item)}
                    style={{
                      width: "130px",
                      height: "47px",
                      background:
                        "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
                      borderRadius: "100px",
                      padding: "14px 25px",
                      border: "none",
                      cursor: "pointer",
                      color: "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>

            <div className="selectPriceBtn flex items-center gap-2 mb-4">
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
                  <div className="inline-flex items-center justify-center text-xs text-[#B80020] border border-[#B80020] rounded-full px-3 py-2 bg-[#FFB8C4] whitespace-nowrap">
                    <img
                      src={highDemandIcon}
                      alt="icon"
                      className="w-3 h-3 mr-1"
                    />
                    High-demand
                  </div>
                ) : null;
              })()}
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
            maxHeight: "80vh",
            overflowY: "auto",
            padding: "20px 24px 24px",
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
                <PricingDetailCard passSome={detailById[selectedItem.id] || []} />
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
        onCancel={() => {
          handleCancelCompare("compare");
        }}
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

      <Modal
        title={
          <div className="modalHeader" style={{ textAlign: "center" }}>
            <h2>Share this flight</h2>
          </div>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={shareModal}
        footer={null}
        centered={true}
        onCancel={() => {
          handleCancelCompare("share");
        }}
        className="compareModal"
      >
        {filterData?.map((item) => (
          <div key={item?.id}>
            <div className="modalFlightDetailCard">
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
                <div className="StartingPrice">
                  <p>Start from</p>
                  <h5>
                    {item?.raw?.fare?.currencyCode ?? "$"}
                    {item.rawTotalStartingFare}
                  </h5>
                </div>
              </div>
            </div>

            <div className="copyMailWhatsappBtn">
              <div className="textCenter">
                <button className="copyEmailBtn btnClass">Copy</button>
                <p>Copy link</p>
              </div>
              <div className="textCenter">
                <button className="copyEmailBtn btnClass">Email</button>
                <p>Email</p>
              </div>
              <div className="textCenter">
                <button className="btnClass">
                  <img src={whatsappIcon} alt="" />
                </button>
                <p>WhatsApp</p>
              </div>
            </div>
          </div>
        ))}
      </Modal>
    </div>
  );
};

export default TravelRoundTrip;