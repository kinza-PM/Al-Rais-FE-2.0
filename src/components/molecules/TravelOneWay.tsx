import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../../assets/css/travel.css";

import whatsappIcon from "../../assets/svgs/Icon.png.svg";
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
import FlightTimingAndStops from "../atoms/FlightTimingAndStops";
import {
  buildPerSegmentFlightDetail,
  mapOfferForCompareOneWay,
  pickRandomFlightsForCompare,
  extractFlightFeatures,
} from "../../utils/searchFlightListingHelpers";
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
  const [shareModal, setshareModal] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"price" | "flight" | "compare">(
    "price",
  );
  const [filterData] = useState<any[]>([]);
  const [, setFilterDetail] = useState<any[]>([]);

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
          mapOfferForCompareOneWay,
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
          mapOfferForCompareOneWay,
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

  // Share UI temporarily removed.

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
      className="flex flex-col gap-3"
      style={{
        background: "transparent",
      }}
    >
      {passData?.map((item, index) => {
        return (
        <div
          className="flightDetailCards flight-ow-card"
          key={item?.id ?? index}
          style={{
            position: "relative",
            border: "1px solid #C2CAD6",
            borderRadius: "16px",
            background: "#FFFFFF",
            padding: "15px 15px 12px",
            marginBottom: "0",
            minHeight: 148,
            boxSizing: "border-box",
          }}
        >
          <div className="topHalfCardWrap" style={{ padding: 0 }}>
            {(() => {
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

              const btnMinH = 40;
              const grad =
                "linear-gradient(91.66deg, #5383DA 0%, #2351A3 50%, #081326 100%)";

              return (
                <div key={`seg-0-${currentSeg?.segmentKey || "0"}`}>
                  <div
                    className="topHalfCard"
                    style={{
                      width: "100%",
                      minHeight: 110,
                      display: "flex",
                      alignItems: "center",
                      padding: 0,
                      gap: "16px",
                      background: "transparent",
                      borderRadius: "0",
                      border: "none",
                      boxSizing: "border-box",
                      marginBottom: "0",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      className="fightTitle"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        minWidth: "180px",
                        flex: "0 1 auto",
                      }}
                    >
                      <div className="flightIcon" style={{ flexShrink: 0 }}>
                        <img
                          src={item?.logo || defaultAirlineLogo}
                          alt={item?.name || "Airline"}
                          style={{
                            width: "52px",
                            height: "52px",
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
                          gap: "5px",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div className="nameAndDetails">
                          <h5
                            style={{
                              margin: 0,
                              fontSize: "16px",
                              fontWeight: 500,
                              color: "#0A0C0F",
                              lineHeight: 1,
                            }}
                          >
                            {airlineDisplayName}
                          </h5>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              color: "#3D495C",
                              lineHeight: 1,
                              fontWeight: 400,
                            }}
                          >
                            {subtitle}
                          </p>
                        </div>

                        {visible.length ? (
                          <div
                            className="featureIcons"
                            style={{
                              display: "flex",
                              gap: "10px",
                              flexWrap: "wrap",
                            }}
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
                                    width: "20px",
                                    height: "20px",
                                    cursor: "pointer",
                                    opacity: 0.85,
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
                        flex: "1 1 220px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 0,
                      }}
                    >
                      <FlightTimingAndStops passSome={itemForTiming} />
                    </div>

                    <div
                      className="StartingPrice ow-card-price-block"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        flexWrap: "wrap",
                        gap: "24px",
                        minWidth: 0,
                        maxWidth: "100%",
                        flex: "0 1 auto",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "2px",
                          flex: "0 1 auto",
                          minWidth: 0,
                        }}
                      >
                        <p
                          className="ow-card-price-label"
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            color: "#3D495C",
                            fontWeight: 400,
                            lineHeight: 1,
                            width: "100%",
                            textAlign: "left",
                          }}
                        >
                          Starting from
                        </p>
                        <h5
                          style={{
                            margin: 0,
                            fontSize: "28px",
                            fontWeight: 600,
                            color: "#2351A3",
                            lineHeight: 1,
                            letterSpacing: 0,
                            width: "100%",
                            textAlign: "left",
                            wordBreak: "break-word",
                          }}
                        >
                          {item?.raw?.fare?.currencyCode ?? "$"}
                          {item.rawTotalStartingFare}
                        </h5>
                      </div>

                      <div
                        className="ow-card-cta-group"
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                          gap: "16px",
                          flexShrink: 0,
                        }}
                      >
                        <>
                          <button
                            type="button"
                            onClick={() => openDetailsModal(item, "price")}
                            style={{
                              minWidth: "128px",
                              minHeight: btnMinH,
                              borderRadius: "100px",
                              padding: "10px 18px",
                              boxSizing: "border-box",
                              background: "#FFFFFF",
                              color: "#2351A3",
                              fontSize: "14px",
                              fontWeight: 600,
                              letterSpacing: "0.5px",
                              border: "1.5px solid #2351A3",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleOfferSelection(item?.offerId, item)
                            }
                            style={{
                              minWidth: "118px",
                              minHeight: btnMinH,
                              background: grad,
                              borderRadius: "100px",
                              padding: "10px 18px",
                              boxSizing: "border-box",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "none",
                              cursor: "pointer",
                              color: "#F2F2F3",
                              fontSize: "14px",
                              fontWeight: 600,
                              letterSpacing: "0.5px",
                            }}
                          >
                            Book Now
                          </button>
                        </>
                      </div>
                    </div>
                  </div>

                  <div className="stopsOnSmall">
                    <FlightTimingAndStops passSome={itemForTiming} />
                  </div>

                  <div
                    className="selectPriceBtn ow-card-badge-row flex flex-wrap items-center"
                    style={{
                      marginTop: "10px",
                      gap: "10px",
                      paddingRight: "52px",
                    }}
                  >
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
                      const marketingAirline = currentSeg?.marketingAirline;
                      const highDemandInfo = getHighDemandInfo(marketingAirline);

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
                </div>
              );
            })()}
          </div>
        </div>
        );
      })}

      <div ref={loadMoreRef} className="min-h-[1px]">
        {renderLoader?.({ isLoadingMore, hasMore })}
      </div>

      <div className="reminderCard">
        <div className="reminderCardPart1">
          <div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.7501 18.125C13.7501 18.2908 13.6843 18.4498 13.567 18.567C13.4498 18.6842 13.2909 18.75 13.1251 18.75H6.8751C6.70934 18.75 6.55037 18.6842 6.43316 18.567C6.31595 18.4498 6.2501 18.2908 6.2501 18.125C6.2501 17.9593 6.31595 17.8003 6.43316 17.6831C6.55037 17.5659 6.70934 17.5 6.8751 17.5H13.1251C13.2909 17.5 13.4498 17.5659 13.567 17.6831C13.6843 17.8003 13.7501 17.9593 13.7501 18.125ZM16.8751 8.12504C16.8778 9.16695 16.6424 10.1957 16.1869 11.1328C15.7315 12.0699 15.0679 12.8905 14.247 13.5321C14.0935 13.6497 13.9689 13.8009 13.8828 13.9741C13.7967 14.1473 13.7513 14.3379 13.7501 14.5313V15C13.7501 15.3316 13.6184 15.6495 13.384 15.8839C13.1496 16.1183 12.8316 16.25 12.5001 16.25H7.5001C7.16858 16.25 6.85064 16.1183 6.61622 15.8839C6.3818 15.6495 6.2501 15.3316 6.2501 15V14.5313C6.24997 14.3402 6.20603 14.1517 6.12166 13.9802C6.03728 13.8088 5.91472 13.6589 5.76338 13.5422C4.94448 12.9045 4.28139 12.0887 3.8243 11.1568C3.36722 10.2249 3.12812 9.20128 3.1251 8.16332C3.10479 4.43989 6.11416 1.3391 9.83448 1.25004C10.7512 1.22795 11.663 1.38946 12.5163 1.72506C13.3696 2.06065 14.1472 2.56356 14.8033 3.20418C15.4593 3.84479 15.9806 4.61017 16.3364 5.45527C16.6922 6.30036 16.8754 7.2081 16.8751 8.12504ZM14.3665 7.39536C14.2044 6.49012 13.7689 5.65626 13.1186 5.00606C12.4682 4.35585 11.6343 3.92051 10.729 3.75864C10.6481 3.74499 10.5652 3.74742 10.4852 3.76579C10.4052 3.78416 10.3296 3.81811 10.2627 3.8657C10.1958 3.91329 10.139 3.97359 10.0954 4.04316C10.0518 4.11272 10.0223 4.19019 10.0087 4.27114C9.99505 4.35208 9.99748 4.43493 10.0159 4.51493C10.0342 4.59494 10.0682 4.67055 10.1158 4.73743C10.1634 4.80432 10.2237 4.86118 10.2932 4.90476C10.3628 4.94835 10.4402 4.9778 10.5212 4.99145C11.8157 5.20942 12.9142 6.30785 13.1337 7.60473C13.1584 7.75029 13.2339 7.8824 13.3467 7.97764C13.4595 8.07288 13.6025 8.1251 13.7501 8.12504C13.7854 8.12483 13.8207 8.12196 13.8556 8.11645C14.0189 8.08856 14.1645 7.99693 14.2604 7.8617C14.3562 7.72647 14.3944 7.55873 14.3665 7.39536Z"
                fill="white"
              />
            </svg>
          </div>
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
                    {item.rawTotalStartingFare}/per person
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

export default TravelOneWay;