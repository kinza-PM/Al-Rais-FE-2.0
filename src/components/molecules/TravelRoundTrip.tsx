import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../../assets/css/travel.css";

import defaultAirlineLogo from "../../assets/images/emirates.png";

import { Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import LoginModal from "../common/LoginModal";
import { travelData } from "../../utils/mockData";
import {
  formatListingStartingFare,
  getMarketingAirlineDisplayName,
} from "../../utils/helpers";

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
import { buildShareFlightListingSnapshot } from "../../utils/shareFlightListingContext";
import ShareFlightListingModal from "../atoms/ShareFlightListingModal";

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

const getAirlineDisplayName = (item: any, seg?: any) =>
  getMarketingAirlineDisplayName(seg, item);

const listingCardKey = (item: any) => String(item?.offerId ?? item?.id ?? "");

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
  const [inlinePanel, setInlinePanel] = useState<{
    key: string;
    tab: "price" | "flight" | "compare";
  } | null>(null);
  const [fareRulePriceByOfferId, setFareRulePriceByOfferId] = useState<
    Record<string, any>
  >({});
  const [fareRuleLoadingOfferId, setFareRuleLoadingOfferId] = useState<string | null>(null);
  const fareRuleInFlightRef = useRef<Record<string, boolean>>({});
  const [shareListingItem, setShareListingItem] = useState<any | null>(null);
  const { mutateAsync: fetchFareRules } = useFlightFareRuleSearch();

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Pending booking action — set when user clicks Book Now without being logged in.
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

  // Once login succeeds, resume the pending booking navigation.
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

  const handleCancelCompare = () => {
    setIsCompareModalOpen(false);
  };

  const handleOfferSelection = React.useCallback(
    (offerId: string, item: any) => {
      if (!isAuthenticated) {
        // Guard: show login modal and queue the action for after sign-in.
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
          const flightClassMeta = (() => {
            const c = String(flightClass ?? "").trim();
            if (!c) return "";
            return /\bclass\b/i.test(c) ? c : `${c} class`;
          })();
          const airlineDisplayName = getAirlineDisplayName(d, currentSeg);
          const subtitle =
            flightNo && flightClassMeta
              ? `${flightNo} - ${flightClassMeta}`
              : [flightNo, flightClassMeta].filter(Boolean).join(" • ") ||
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
                </div>
              </div>

              <div className="stopsOnLarge ow-card-timing-col">
                <FlightTimingAndStops
                  passSome={itemForTiming}
                  listingStyle
                />
              </div>

              {visible.length ? (
                <div
                  className="featureIcons ow-card-feature-icons ow-card-feature-icons--listing"
                  aria-label="Flight amenities"
                >
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

        const outbound = item?.outbound ?? null;
        const inbound = item?.inbound ?? null;

        const outboundSegsRt =
          item?.outbound?.raw?.journey?.[0]?.flightSegments ??
          item?.raw?.journey?.[0]?.flightSegments ??
          [];
        const outboundSegRt = Array.isArray(outboundSegsRt)
          ? outboundSegsRt[0]
          : (outboundSegsRt?.[0] ?? outboundSegsRt ?? null);
        const outboundAirlineRt = outboundSegRt?.marketingAirline;

        const inboundSegsRt =
          item?.inbound?.raw?.journey?.[0]?.flightSegments ??
          item?.raw?.journey?.[1]?.flightSegments ??
          [];
        const inboundSegRt = Array.isArray(inboundSegsRt)
          ? inboundSegsRt[0]
          : (inboundSegsRt?.[0] ?? inboundSegsRt ?? null);
        const inboundAirlineRt = inboundSegRt?.marketingAirline;

        const roundTripHighDemand = getHighDemandInfo(
          outboundAirlineRt,
          inboundAirlineRt,
        );

        const listingKey = listingCardKey(item);

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

                <div className="StartingPrice ow-card-price-block ow-card-price-block--top">
                  <div className="ow-card-price-copy">
                    <p className="ow-card-price-label">Starting from</p>
                    <h5>
                      {formatListingStartingFare(
                        item?.raw?.fare?.currencyCode ?? "$",
                        item.rawTotalStartingFare,
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

                    {roundTripHighDemand ? (
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
                    onClick={() =>
                      handleOfferSelection(item?.offerId, item)
                    }
                  >
                    Select price
                  </button>
                </div>
              </div>

              {inlinePanel?.key === listingKey ? (
                <div
                  className="ow-card-inline-expand"
                  id={`flight-listing-expand-rt-${listingKey}`}
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
                        currentFlight={mapOfferForCompareRoundTrip(item)}
                        availableFlights={pickRandomFlightsForCompare(
                          passData || [],
                          item.id,
                          4,
                          mapOfferForCompareRoundTrip,
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
                  onClick={() =>
                    handleOfferSelection(item?.offerId, item)
                  }
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

      {shareListingItem ? (
        <ShareFlightListingModal
          closeModal={() => setShareListingItem(null)}
          snapshot={buildShareFlightListingSnapshot(shareListingItem)}
        />
      ) : null}

      {/* Login required — shown when an unauthenticated user clicks Book Now.
          Closing without logging in cancels the booking action. */}
      <LoginModal
        showModal={loginModalOpen}
        showGoBack
        onAuthSuccess={resumePendingBooking}
        onClose={() => {
          // User dismissed without logging in — cancel the pending booking.
          pendingBookingRef.current = null;
          setLoginModalOpen(false);
        }}
      />
    </div>
  );
};

export default TravelRoundTrip;