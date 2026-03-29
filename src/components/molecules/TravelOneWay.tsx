import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../../assets/css/travel.css";

import whatsappIcon from "../../assets/svgs/Icon.png.svg";
import highDemandIcon from "../../assets/svgs/high-demand.svg";
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
  const [filterData, setFilterData] = useState<any[]>([]);
  const [filterDetail, setFilterDetail] = useState<any[]>([]);

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
      {passData?.map((item, index) => (
        
        <div
          className="flightDetailCards"
          key={index}
          style={{
            border: "none",
            marginBottom: "0",
            paddingBottom: "0",
            borderBottom:
              index < passData.length - 1 ? "2px solid #E4E4E7" : "none",
          }}
        >
          <div className="topHalfCardWrap">
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

              return (
                <div key={`seg-0-${currentSeg?.segmentKey || "0"}`}>
                  <div
                    className="topHalfCard"
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
                          src={item?.logo || defaultAirlineLogo}
                          alt={item?.name || "Airline"}
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
  {airlineDisplayName}
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
  {airlineDisplayName} • {itemForTiming?.flight_detail?.flight_number} •{" "}
  {itemForTiming?.flight_detail?.flight_class}
</p>
                        </div>

                        {visible.length ? (
                          <div
                            className="featureIcons"
                            style={{
                              display: "flex",
                              gap: "8px",
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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            cursor: "pointer",
                            color: "#FFFFFF",
                            fontSize: "14px",
                            fontWeight: 600,
                            boxShadow: "0 2px 8px rgba(35, 81, 163, 0.3)",
                            flexShrink: 0,
                          }}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="stopsOnSmall">
                    <FlightTimingAndStops passSome={itemForTiming} />
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="selectPriceBtn flex items-center gap-2 mt-2 mb-4">
            {item.offerViewCount > 0 && (
              <div className="inline-flex items-center justify-center text-xs text-[#1A3C7A] border border-[#1A3C7A] rounded-full px-3 py-2 bg-[#A7C0EC] whitespace-nowrap">
                <img src={offerViewIcon} alt="icon" className="mr-1" />
                {item.offerViewCount} People viewing this
              </div>
            )}

            {(() => {
              const segs: any[] = item?.raw?.journey?.[0]?.flightSegments ?? [];
              const currentSeg = Array.isArray(segs)
                ? segs[0]
                : (segs?.[0] ?? segs ?? null);
                
              const marketingAirline = currentSeg?.marketingAirline;
              const highDemandInfo = getHighDemandInfo(marketingAirline);

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
      ))}

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