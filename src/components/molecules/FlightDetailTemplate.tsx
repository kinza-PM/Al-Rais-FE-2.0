import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";

import alraisLogo from "../../assets/images/alraisLogo.png";
import planeImg from "../../assets/images/travel_plane_image.png";
import "../../assets/css/travel.css";
// import FlagUae from "../../assets/svgs/Flag-uae.svg";
// import FlagInd from "../../assets/svgs/Flag-ind.svg";
// import FlagUsa from "../../assets/svgs/Flag-usa.svg";
// import colSeparater from "../../assets/svgs/Lineseparater.svg";
import noFlights from "../../assets/svgs/no-flights.svg";
import Info from "../../assets/svgs/info-black.svg";
import { Flex, Drawer, Button, Grid } from "antd";
// import type { CheckboxGroupProps } from "antd/es/checkbox";
import CustomButton from "../common/CustomButton";
// import CustomSelect from "../common/CustomSelect";
// import CustomDatePicker from "../common/CustomDatePicker";
import FlightSearchFilter from "../atoms/FlightSearchFilter";
import TravelOneWay from "./TravelOneWay";
import TravelRoundTrip from "./TravelRoundTrip";
import TravelMultiCity from "./TravelMultiCity";

// import type { TabsProps } from "antd";
import { useState } from "react";
import { useAiprortOptions } from "../../hooks/masterListings/listing";
import { useMasterListings } from "../../hooks/masterListings/useMasterListings";
import { FilterOutlined } from "@ant-design/icons";

import PassengerCounterDropdown from "../atoms/PassengerCounterDropdown";
import type {
  AirportOption,
  PassengerSchema,
  CabinClassOption,
  TripType,
  FlightTypeOption,
} from "../../features/flights/types";
import TravelRoutePicker from "../atoms/TravelRoutePicker";
import TravelSearchPageHeader from "./TravelSearchPageHeader";
import Loader from "../atoms/Loader";
import {
  useFlightStore,
  type FlightLeg,
  type FlightSearchState,
} from "../../store/UseFlightStore";
// import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";

import { useFlightSearch } from "../../hooks/useFlightSearch";
import { useLoadMoreFlights } from "../../hooks/useLoadMoreFlights";
import type { FlightSearchRequest } from "../../services/api/flightSearch";
import { buildFlightSearchPriceOptions } from "../../utils/flightPriceOptionsUtils";
import {
  buildFilterPreferenceForFlightSearchRequest,
  formatDate,
  formatDateToLocalISO,
  formatTime,
  getMarketingAirlineDisplayName,
  timeToMinutesFromAnyString,
} from "../../utils/helpers";
import StatusMessageBanner from "../common/StatusMessageBanner";
import {
  callWithRetries,
  filterFlightsByTimeAndAirlines,
  filterOffersByAncillaryMode,
  filterOffersByCheckedBaggage,
  filterOffersByRefundableMode,
  refundableFilterModeFromCheckboxes,
  type AncillaryFilterMode,
  type RefundableFilterMode,
} from "../../utils/flightFilters";
import { sortFlightOffers } from "../../utils/flightSortUtils";
import { resolveAirlineLogoFromSegment } from "../../utils/searchFlightListingHelpers";
// import dayjs from "dayjs";
import SearchableDropdown from "../common/SearchableDropdown";
import { extractErrorFromAxiosApiError } from "../../utils/apiErrorHanlder";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";

// const onChange = (key: string) => {
//   console.log(key);
// };
// const handleChange = (value: string) => {
//   console.log(`selected ${value}`);
// };

// const items: TabsProps["items"] = [
//   { key: "1", label: "Flights", children: "" },
//   { key: "2", label: "Hotels", children: "" },
// ];

const INACTIVITY_MINUTES_MS = 15 * 60 * 1000;
const WARNING_OFFSET_MS = 2 * 60 * 1000;
const WARNING_TRIGGER_MS = INACTIVITY_MINUTES_MS - WARNING_OFFSET_MS;
const INACTIVITY_BANNER_DURATION_MS = 2 * 6000;

type InactivityWarningOptions = {
  warningDelay: number;
  expiryDelay: number;
  warningText: string;
  expiryText: string;
  onExpire: () => void;
};

const useResultInactivityWarning = ({
  warningDelay,
  expiryDelay,
  warningText,
  expiryText,
  onExpire,
}: InactivityWarningOptions) => {
  const [message, setMessage] = useState<string | null>(null);
  const [isBannerVisible, setBannerVisible] = useState(false);

  const warningTimeoutRef = useRef<number | null>(null);
  const expiryTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  const clearTimerRef = (ref: React.MutableRefObject<number | null>) => {
    if (ref.current) {
      window.clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const hideBanner = useCallback(() => {
    setBannerVisible(false);
    setMessage(null);
  }, []);

  const clearAllTimers = useCallback(() => {
    clearTimerRef(warningTimeoutRef);
    clearTimerRef(expiryTimeoutRef);
    clearTimerRef(hideTimeoutRef);
    hideBanner();
  }, [hideBanner]);

  const showBanner = useCallback(
    (text: string) => {
      setMessage(text);
      setBannerVisible(true);

      clearTimerRef(hideTimeoutRef);
      hideTimeoutRef.current = window.setTimeout(() => {
        hideBanner();
        hideTimeoutRef.current = null;
      }, INACTIVITY_BANNER_DURATION_MS);
    },
    [hideBanner],
  );

  const scheduleTimers = useCallback(() => {
    clearAllTimers();

    warningTimeoutRef.current = window.setTimeout(() => {
      showBanner(warningText);
      warningTimeoutRef.current = null;
    }, warningDelay);

    expiryTimeoutRef.current = window.setTimeout(() => {
      onExpire();
      showBanner(expiryText);
      expiryTimeoutRef.current = null;
    }, expiryDelay);
  }, [
    clearAllTimers,
    expiryDelay,
    expiryText,
    onExpire,
    showBanner,
    warningDelay,
    warningText,
  ]);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    warningMessage: message,
    isBannerVisible,
    startCountdown: scheduleTimers,
    resetCountdown: clearAllTimers,
  };
};

const buildPassengersArrayForFlightSearch = (
  order: string[],
  schema: PassengerSchema,
  paxState: any,
) => {
  const keyToPtc = new Map((schema || []).map((s: any) => [s.key, s.ptc]));
  const arr: { id: string; ptc: string }[] = [];
  let idCounter = 1;

  for (const key of order) {
    const ptc = keyToPtc.get(key) ?? "ADT";
    arr.push({ id: String(idCounter++), ptc });
  }
  const totalCounts = Object.values(paxState || {}).reduce(
    (a: number, b: any) => a + (Number(b) || 0),
    0,
  );
  if (arr.length !== totalCounts) {
    const fallback: { id: string; ptc: string }[] = [];
    let idx = 1;
    for (const s of schema || []) {
      const cnt = paxState?.[s.key] ?? 0;
      for (let i = 0; i < cnt; i++)
        fallback.push({ id: String(idx++), ptc: s.ptc });
    }
    return fallback;
  }

  return arr;
};

/** Route text for the results summary line — must match the search that produced the listed rows. */
function buildFlightRouteSummaryLabel(args: {
  trip: TripType | string;
  multicityLegs: FlightLeg[];
  fromOption: AirportOption | null;
  toOption: AirportOption | null;
  fromCode: string;
  toCode: string;
}): string {
  const { trip, multicityLegs, fromOption, toOption, fromCode, toCode } = args;
  if (trip === "multicity") {
    const legs = multicityLegs || [];
    if (legs.length > 0) {
      const leg = legs[0] as FlightLeg & {
        fromOption?: { city?: string } | null;
        toOption?: { city?: string } | null;
      };
      const fromL =
        leg.fromOption?.city?.trim() || leg.fromCode?.trim() || "";
      const toL = leg.toOption?.city?.trim() || leg.toCode?.trim() || "";
      if (fromL && toL) {
        return legs.length > 1
          ? `${fromL} → ${toL} (+${legs.length - 1} more)`
          : `${fromL} → ${toL}`;
      }
      return "Multi-city";
    }
    return "Multi-city";
  }
  const fromCity = fromOption?.city?.trim() || fromCode?.trim() || "";
  const toCity = toOption?.city?.trim() || toCode?.trim() || "";
  if (fromCity && toCity) {
    return `${fromCity} → ${toCity}`;
  }
  if (fromCode?.trim() && toCode?.trim()) {
    return `${fromCode.trim()} → ${toCode.trim()}`;
  }
  return "Flights";
}

const FlightDetailTemplate: React.FC = () => {
  const { mutateAsync, isPending } = useFlightSearch();
  const { loadMoreAsync, isLoadingMore } = useLoadMoreFlights();
  const { flight, searchState, setSearchState } = useFlightStore();

  const [responseData, setResponseData] = useState<any[]>([]);
  const [roundResponseData, setRoundResponseData] = useState<any[]>([]);
  const [multicityResponseData, setMulticityResponseData] = useState<any[]>([]);
  const originalResponseRef = useRef<any[]>([]);
  const originalRoundResponseRef = useRef<any[]>([]);
  const originalMulticityResponseRef = useRef<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [paxCounts, setPaxCounts] = useState<any>({});
  const passengerRequestOrder = useRef<string[]>([]);
  const lastRequestRef = useRef<FlightSearchRequest | null>(null);
  const [departDate, setDepartDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [multicityLegs, setMulticityLegs] = useState<FlightLeg[]>([]);
  const [highDemandIndicators, setHighDemandIndicators] = useState<any[]>([]);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const flightPageWrapRef = useRef<HTMLDivElement | null>(null);
  const flightSearchFormRef = useRef<HTMLDivElement | null>(null);
  const [ioReady, setIoReady] = useState(false);

  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedMaxConnections, setSelectedMaxConnections] =
    useState<number>(0);
  const [departureFlightRange, setDepartureFlightRange] = useState({
    start: "",
    end: "",
  });
  const [arrivalFlightRange, setArrivalFlightRange] = useState({
    start: "",
    end: "",
  });
  const [selectedAirlineIds, setSelectedAirlineIds] = useState<string[]>([]);
  const [selectedTransitRange, setSelectedTransitRange] = useState<
    string | null
  >(null);
  const [baggageIncludedOnly, setBaggageIncludedOnly] = useState(false);
  const [ancillaryAddOnsOnly, setAncillaryAddOnsOnly] = useState(false);
  const [refundFilterRefundable, setRefundFilterRefundable] = useState(false);
  const [refundFilterNonRefundable, setRefundFilterNonRefundable] =
    useState(false);
  const [priceRangeBounds, setPriceRangeBounds] = React.useState<
    [number, number]
  >([0, 1000]);
  const [selectedPriceRange, setSelectedPriceRange] = React.useState<
    [number, number]
  >([0, 1000]);
  const [priceHistogramFares, setPriceHistogramFares] = useState<number[]>([]);
  const [listingCurrencyCode, setListingCurrencyCode] = useState("$");
  const PRICE_STEP = 50;
  const filterChangeDebounceRef = useRef<number | null>(null);
  
  // Sort dropdown state
  const [sortBy, setSortBy] = useState<string>("lowest_price");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  /** Last successful search route for the summary line (draft bar edits do not change this until Search). */
  const [resultsSummaryRouteLabel, setResultsSummaryRouteLabel] = useState<
    string | null
  >(null);
  const latestSearchStateRef = useRef<FlightSearchState | null>(null);

  const handleDate = (date: any, which: "depart" | "return" = "depart") => {
    if (!date) {
      if (which === "depart") setDepartDate("");
      else setReturnDate("");
      return;
    }

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    const formatted = `${year}-${month}-${day}`; // YYYY-MM-DD

    if (which === "depart") {
      setDepartDate(formatted);
      // If new departure is after current return, clear return date
      if (returnDate && d.getTime() > new Date(returnDate).getTime()) {
        setReturnDate("");
      }
    } else {
      setReturnDate(formatted);
    }
  };

  // (moved init-from-store further below after loading is declared)

  const handlePassenger = (passanger: any) => {
    const prev = paxCounts || {};
    const next = passanger || {};

    const schemaKeys = ((passengers as any[]) || []).map((s) => s.key);
    const keys = Array.from(
      new Set([...Object.keys(prev), ...Object.keys(next), ...schemaKeys]),
    );

    // Guard: avoid infinite loops when dropdown emits identical values
    // (new object identity but same counts).
    const isSameCounts = keys.every((k) => (prev[k] ?? 0) === (next[k] ?? 0));
    if (isSameCounts) return;

    const order = passengerRequestOrder.current.slice(); // clone

    for (const k of keys) {
      const prevCount = prev[k] ?? 0;
      const nextCount = next[k] ?? 0;
      const diff = nextCount - prevCount;

      if (diff > 0) {
        for (let i = 0; i < diff; i++) order.push(k);
      } else if (diff < 0) {
        for (let i = 0; i < -diff; i++) {
          const li = order.lastIndexOf(k);
          if (li >= 0) order.splice(li, 1);
        }
      }
    }

    passengerRequestOrder.current = order; // update ref (no rerender)
    setPaxCounts(next); // still keep paxCounts in state
  };

  function formatDuration(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    

    return `${hours}h ${minutes}min`;
  }

  const formatFlightSegmentForTrips = (seg: any, journeyItem?: any) => {
    if (!seg) return null;
    return {
      id: seg.segmentKey,
      logo: resolveAirlineLogoFromSegment(seg),
      name: getMarketingAirlineDisplayName(seg),
      flight_detail: {
        flight_number: seg.flightNumber,
        flight_class: seg.cabinClass,
        start_time: formatTime(seg.departureDateTime),
        start_date: formatDate(seg.departureDateTime),
        end_time: formatTime(seg.arrivalDateTime),
        end_date: formatDate(seg.arrivalDateTime),
        duration: formatDuration(seg.departureDateTime, seg.arrivalDateTime),
        departureCode: seg.departureAirportCode,
        arrivalCode: seg.arrivalAirportCode,
        departureTerminal: seg.departureTerminal ?? seg.depTerminal,
        arrivalTerminal: seg.arrivalTerminal ?? seg.arrTerminal,
        start_time_iso: seg.departureDateTime,
        end_time_iso: seg.arrivalDateTime,
      },
      stop: journeyItem?.stops || [],
      rawSegment: seg,
    };
  };

  const logoFromFlightSegment = (seg: any) => resolveAirlineLogoFromSegment(seg);

  const mapFlightRawResponseToFormats = (
    item: any,
    idx: number,
    commonData?: { searchKey?: string; productCode?: string },
  ) => {
    const journeys = item?.journey || [];
    const seg0 = journeys[0]?.flightSegments?.[0] ?? null;
    const seg1 = journeys[1]?.flightSegments?.[0] ?? null;

    const outbound = formatFlightSegmentForTrips(seg0, journeys[0]);
    const inbound = formatFlightSegmentForTrips(seg1, journeys[1]); // may be null

    const priceOptions = buildFlightSearchPriceOptions(item);
    const searchKey = commonData?.searchKey ?? null;

    const oneWayId = outbound?.id ?? `offer-${idx}-${item?.offerId ?? ""}`;
    const oneWayObj = {
      id: oneWayId,
      offerId: item?.offerId,
      searchKey,
      logo:
        outbound?.logo ??
        logoFromFlightSegment(outbound?.rawSegment) ??
        logoFromFlightSegment(item?.journey?.[0]?.flightSegments?.[0]),
      name: outbound?.name ?? item?.offerId ?? oneWayId,
      flight_detail: outbound?.flight_detail ?? null,
      stop: outbound?.stop ?? [],
      rawTotalStartingFare: item?.fare?.totalFare,
      offerViewCount: item?.offerViewCount ?? 0,
      // price: { economyLite: { price: item?.fare?.totalFare } },
      price: priceOptions,
      raw: item,
    };

    const roundId =
      item?.offerId ?? outbound?.id ?? `offer-${idx}-${item?.offerId ?? ""}`;
    const roundObj = {
      id: roundId,
      offerId: item?.offerId,
      searchKey,
      outbound: outbound
        ? {
            ...outbound,
            logo: outbound?.logo ?? logoFromFlightSegment(outbound?.rawSegment),
          }
        : null,
      inbound: inbound
        ? {
            ...inbound,
            logo: inbound?.logo ?? logoFromFlightSegment(inbound?.rawSegment),
          }
        : null,
      price: priceOptions,
      offerViewCount: item?.offerViewCount ?? 0,
      rawTotalStartingFare: item?.fare?.totalFare ?? null,
      raw: item,
    };

    // Multicity: all journeys as segments
    const multiCitySegments = (journeys || []).map((j: any) => {
      const seg = j?.flightSegments?.[0] ?? null;
      return formatFlightSegmentForTrips(seg, j);
    });
    const firstMultiSeg = multiCitySegments[0];
    const multiCityId =
      item?.offerId ??
      firstMultiSeg?.id ??
      `offer-${idx}-${item?.offerId ?? ""}`;
    const multiCityObj = {
      id: multiCityId,
      offerId: item?.offerId,
      searchKey,
      logo:
        firstMultiSeg?.logo ??
        logoFromFlightSegment(firstMultiSeg?.rawSegment) ??
        logoFromFlightSegment(item?.journey?.[0]?.flightSegments?.[0]),
      name: firstMultiSeg?.name ?? item?.offerId ?? multiCityId,
      segments: multiCitySegments,
      flight_detail: firstMultiSeg?.flight_detail ?? null,
      rawTotalStartingFare: item?.fare?.totalFare,
      offerViewCount: item?.offerViewCount ?? 0,
      price: priceOptions,
      raw: item,
    };

    return { oneWayObj, roundObj, multiCityObj };
  };

  const processFLightSearchResults = (
    raw: any[] = [],
    commonData?: { searchKey?: string; productCode?: string },
  ) => {
    const oneWayFormatted: any[] = [];
    const roundFormatted: any[] = [];
    const multiCityFormatted: any[] = [];

    for (const [idx, item] of (raw || []).entries()) {
      const { oneWayObj, roundObj, multiCityObj } =
        mapFlightRawResponseToFormats(item, idx, commonData);
      oneWayFormatted.push(oneWayObj);
      roundFormatted.push(roundObj);
      multiCityFormatted.push(multiCityObj);
    }

    return { oneWayFormatted, roundFormatted, multiCityFormatted };
  };

  const appendUniqueItemsForLoadMoreFlights = (
    prevArray: any[],
    newArray: any[],
  ) => {
    const existing = new Set(prevArray.map((p) => p.id));
    const toAdd = newArray.filter((n) => !existing.has(n.id));
    return toAdd.length ? [...prevArray, ...toAdd] : prevArray;
  };

  const validateSearchFields = (): string | null => {
    const validationErrors: string[] = [];

    if (trip === "multicity") {
      const allLegsValid = multicityLegs.every(
        (leg) =>
          leg.fromCode?.trim() &&
          leg.toCode?.trim() &&
          leg.date &&
          (leg.cabinClassId ?? selectedCabinClassId)?.trim(),
      );
      if (!allLegsValid) validationErrors.push("legs");
    } else {
    if (!fromCode?.trim()) validationErrors.push("from");
    if (!toCode?.trim()) validationErrors.push("to");

    if (!departDate) validationErrors.push("departure");
    if (trip === "roundtrip" && !returnDate) validationErrors.push("return");
    }

    const totalPassengers = Object.values(paxCounts).reduce(
      (sum: number, count: any) => sum + (Number(count) || 0),
      0,
    );
    if (totalPassengers === 0) validationErrors.push("passengers");
    if (trip !== "multicity" && !selectedCabinClassId)
      validationErrors.push("cabin");

    if (validationErrors.length === 0) return null;

    if (validationErrors.length > 1) {
      return "Please complete all required fields before searching.";
    }

    const error = validationErrors[0];
    const messages: Record<string, string> = {
      from: "Please select where you’re flying from",
      to: "Please select where you’re flying to",
      departure: "Please select a departure date to continue.",
      return: "Please select a return date to continue.",
      passengers: "Please select at least one passenger before searching.",
      cabin: "Please select a cabin class to continue.",
      legs: "Fill all flights info: From, To and Departure date",
    };

    return messages[error] || "Please complete all required fields.";
  };

  const handleSearch = async (
    searchFilters: { maxConnections?: number; resetSidebarFilters?: boolean } = {},
  ) => {
    const validationError = validateSearchFields();
    if (validationError) {
      setSearchError(validationError);
      setHasSearched(true);
      setIsSearching(false);
      return;
    }

    const routeLabelSnapshot = buildFlightRouteSummaryLabel({
      trip,
      multicityLegs,
      fromOption,
      toOption,
      fromCode,
      toCode,
    });

    /** New search from the sticky bar: clear sidebar filters. Stops-only API refetch passes `maxConnections` and must keep filters. */
    const resetSidebar =
      searchFilters.resetSidebarFilters !== false &&
      typeof searchFilters.maxConnections === "undefined";

    if (resetSidebar) {
      setSelectedMaxConnections(0);
      setDepartureFlightRange({ start: "", end: "" });
      setArrivalFlightRange({ start: "", end: "" });
      setSelectedAirlineIds([]);
      setSelectedTransitRange(null);
      setRefundFilterRefundable(false);
      setRefundFilterNonRefundable(false);
      setSortBy("lowest_price");
    }

    const sortForFreshResults = resetSidebar ? "lowest_price" : sortBy;

    // const sortedPrice = typeof searchFilters.priceId !== "undefined" ? searchFilters.priceId : selectedPriceId;
    const sortedMaxConnections = resetSidebar
      ? 0
      : typeof searchFilters.maxConnections !== "undefined"
        ? Number(searchFilters.maxConnections)
        : (selectedMaxConnections ?? 0);

    const passengersForRequest = buildPassengersArrayForFlightSearch(
      passengerRequestOrder.current,
      passengers as PassengerSchema,
      paxCounts,
    );

    const flightSegments: any[] =
      trip === "multicity"
        ? multicityLegs
            .filter(
              (l) =>
                l.fromCode?.trim() &&
                l.toCode?.trim() &&
                l.date &&
                (l.cabinClassId ?? selectedCabinClassId)?.trim(),
            )
            .map((l) => ({
              departureAirportCode: l.fromCode,
              departureDate: l.date,
              arrivalAirportCode: l.toCode,
              cabinPreferences: [l.cabinClassId ?? selectedCabinClassId ?? "5"],
            }))
        : [
      {
        departureAirportCode: fromCode,
        departureDate: departDate,
        arrivalAirportCode: toCode,
        cabinPreferences: [selectedCabinClassId],
      },
    ];

    if (trip === "roundtrip") {
      flightSegments.push({
        departureAirportCode: toCode,
        departureDate: returnDate,
        arrivalAirportCode: fromCode,
        cabinPreferences: [selectedCabinClassId],
      });
    }

    const baseBody: any = { flightSegments, passengers: passengersForRequest };
    const searchFilterObj = buildFilterPreferenceForFlightSearchRequest(
      Number(sortedMaxConnections ?? 0),
    );
    // const searchFilterObj = buildFilterPreferenceForFlightSearchRequest(sortedPrice, Number(sortedMaxConnections ?? 0));
    const requestBody = searchFilterObj
      ? { ...baseBody, ...searchFilterObj }
      : baseBody;

    lastRequestRef.current = requestBody;
    // reset current results & inactivity timers before a fresh search
    resetInactivityCountdown();
    setResponseData([]);
    setRoundResponseData([]);
    setMulticityResponseData([]);
    setHasSearched(false);
    setIsSearching(true);
    setSearchError(null);
    setBaggageIncludedOnly(false);
    setAncillaryAddOnsOnly(false);
    try {
      // const response = await mutateAsync(requestBody);
      const response = await callWithRetries(
        () => mutateAsync(requestBody),
        2,
        500,
      );
      const raw = response.data || [];
      const commonData = response?.commonData;
      const highDemand = response?.highDemandIndicators || [];

      const { oneWayFormatted, roundFormatted, multiCityFormatted } =
        processFLightSearchResults(raw, commonData);

      originalResponseRef.current = oneWayFormatted;
      originalRoundResponseRef.current = roundFormatted;
      originalMulticityResponseRef.current = multiCityFormatted;
      setMulticityResponseData(
        trip === "multicity"
          ? sortFlightOffers(multiCityFormatted, sortForFreshResults)
          : [],
      );
      setHighDemandIndicators(highDemand);
      // start inactivity timers only based on API results
      startResultInactivityTimers();

      const fares: number[] = [
        ...oneWayFormatted.map((it) =>
          Number(it?.rawTotalStartingFare ?? it?.raw?.fare?.totalFare ?? NaN),
        ),
        ...roundFormatted.map((it) =>
          Number(it?.rawTotalStartingFare ?? it?.raw?.fare?.totalFare ?? NaN),
        ),
        ...multiCityFormatted.map((it) =>
          Number(it?.rawTotalStartingFare ?? it?.raw?.fare?.totalFare ?? NaN),
        ),
      ].filter((n) => !Number.isNaN(n) && isFinite(n));

      if (Array.isArray(raw) && raw.length > 0) {
        const cc = String(raw[0]?.fare?.currencyCode ?? "").trim();
        setListingCurrencyCode(cc || "$");
      }
      setPriceHistogramFares(fares);

      const minFare = fares.length ? Math.min(...fares) : 0;
      const maxFare = fares.length ? Math.max(...fares) : 1000;
      const roundedMax = Math.ceil(maxFare / PRICE_STEP) * PRICE_STEP;
      const roundedMin = Math.floor(minFare / PRICE_STEP) * PRICE_STEP;
      const nextBounds: [number, number] = [roundedMin, roundedMax];
      setPriceRangeBounds(nextBounds);

      const hadCustomPriceFilter =
        !resetSidebar &&
        (selectedPriceRange[0] !== priceRangeBounds[0] ||
          selectedPriceRange[1] !== priceRangeBounds[1]);
      const nextSelectedPriceRange: [number, number] = hadCustomPriceFilter
        ? ([
            Math.max(nextBounds[0], Math.min(nextBounds[1], selectedPriceRange[0])),
            Math.max(nextBounds[0], Math.min(nextBounds[1], selectedPriceRange[1])),
          ] as [number, number])
        : nextBounds;
      setSelectedPriceRange(nextSelectedPriceRange);

      // Re-apply client-side filters on fresh results (defaults when resetSidebar).
      applyFlightSearchFilters(
        resetSidebar ? { start: "", end: "" } : departureFlightRange,
        resetSidebar ? { start: "", end: "" } : arrivalFlightRange,
        resetSidebar ? [] : selectedAirlineIds,
        nextSelectedPriceRange,
        resetSidebar ? null : selectedTransitRange,
        resetSidebar ? "all" : null,
        resetSidebar ? false : null,
        resetSidebar ? "all" : null,
        sortForFreshResults,
      );

      const anyHasMore = (raw || []).some(
        (it: any) => !!it?.detail?.moreFaresAvailable,
      );
      // console.log("anyHasMore", anyHasMore, (raw.length > 0 && anyHasMore));
      setHasMore(raw.length > 0 && anyHasMore);
      // setHasMore(raw.length > 0);
      setIoReady(true);
      setResultsSummaryRouteLabel(routeLabelSnapshot);
      // Keep store so back navigation can restore inputs/results.
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      console.error("Flight search failed:", err);
      setSearchError(err);
      setHasMore(false);
    } finally {
      setHasSearched(true);
      setIsSearching(false);
    }
  };

  const handleLoadMore = async () => {
    // console.log("handleLoadMore", hasMore, isLoadingMore);
    if (!hasMore || isLoadingMore || !lastRequestRef.current) return;

    try {
      const moreResp = await loadMoreAsync(lastRequestRef.current);
      const raw = moreResp.data || [];

      if (!raw.length) {
        setHasMore(false);
        return;
      }

      const { oneWayFormatted, roundFormatted, multiCityFormatted } =
        processFLightSearchResults(raw);

      // append only unique items, then re-apply current sort
      setResponseData((prev) =>
        sortFlightOffers(
          appendUniqueItemsForLoadMoreFlights(prev, oneWayFormatted),
          sortBy,
        ),
      );
      setRoundResponseData((prev) =>
        sortFlightOffers(
          appendUniqueItemsForLoadMoreFlights(prev, roundFormatted),
          sortBy,
        ),
      );
      setMulticityResponseData((prev) =>
        sortFlightOffers(
          appendUniqueItemsForLoadMoreFlights(prev, multiCityFormatted),
          sortBy,
        ),
      );

      const extraFares = [
        ...oneWayFormatted.map((it) =>
          Number(it?.rawTotalStartingFare ?? it?.raw?.fare?.totalFare ?? NaN),
        ),
        ...roundFormatted.map((it) =>
          Number(it?.rawTotalStartingFare ?? it?.raw?.fare?.totalFare ?? NaN),
        ),
        ...multiCityFormatted.map((it) =>
          Number(it?.rawTotalStartingFare ?? it?.raw?.fare?.totalFare ?? NaN),
        ),
      ].filter((n) => !Number.isNaN(n) && isFinite(n));
      setPriceHistogramFares((prev) => [...prev, ...extraFares]);

      const anyHasMore = (raw || []).some(
        (it: any) => !!it?.detail?.moreFaresAvailable,
      );
      setHasMore(raw.length > 0 && anyHasMore);
      // setHasMore(raw.length > 0);
      setIoReady(true);
    } catch (e) {
      console.error("Load more failed:", e);
      setHasMore(false);
    }
  };

  const [fromCountriesSearchTerm, setFromCountriesSearchTerm] =
    useState<string>("");
  const [toCountriesSearchTerm, setToCountriesSearchTerm] =
    useState<string>("");

  const {
    flightTypes,
    passengers,
    cabinClasses,
    // priceSort,
    numberStops,
    transitHours,
    baggage,
    airline,
    loading,
    loadingMap,
  } = useMasterListings({
    include: [
      "flightTypes",
      "passengers",
      "cabinClasses",
      "priceSort",
      "numberStops",
      "transitHours",
      "baggage",
      "airline",
    ],
  });

  const qFromAirports = useAiprortOptions(
    true,
    fromCountriesSearchTerm,
    "from",
  );
  const qToAirports = useAiprortOptions(true, toCountriesSearchTerm, "to");

  const isInitialLoading =
    !fromCountriesSearchTerm.trim() &&
    !toCountriesSearchTerm.trim() &&
    loading &&
    (qFromAirports.data.length === 0 || qToAirports.data.length === 0);
  const countriesLoading =
    qFromAirports.isLoading ||
    qFromAirports.isFetching ||
    qToAirports.isLoading ||
    qToAirports.isFetching ||
    isInitialLoading;

  // Preserve full airport options (with labels) for display after clearFlight()
  const [preservedFromOption, setPreservedFromOption] =
    useState<AirportOption | null>(null);
  const [preservedToOption, setPreservedToOption] =
    useState<AirportOption | null>(null);

  const fromCountriesForPicker = useMemo(() => {
    const base = (qFromAirports.data as AirportOption[]) || [];
    const merged: AirportOption[] = [];
    const addUnique = (opt: AirportOption | null | undefined) => {
      if (!opt?.code) return;
      if (merged.some((x) => x.code === opt.code)) return;
      merged.push(opt);
    };
    addUnique((flight?.fromOption ?? preservedFromOption) as AirportOption);
    for (const c of base) addUnique(c);
    return merged;
  }, [
    qFromAirports.data,
    flight?.fromOption,
    preservedFromOption,
  ]);

  const toCountriesForPicker = useMemo(() => {
    const base = (qToAirports.data as AirportOption[]) || [];
    const merged: AirportOption[] = [];
    const addUnique = (opt: AirportOption | null | undefined) => {
      if (!opt?.code) return;
      if (merged.some((x) => x.code === opt.code)) return;
      merged.push(opt);
    };
    addUnique((flight?.toOption ?? preservedToOption) as AirportOption);
    for (const c of base) addUnique(c);
    return merged;
  }, [qToAirports.data, flight?.toOption, preservedToOption]);

  // Show only airlines that exist in the current flight-search response (frontend-side).
  const availableAirlineOptions = useMemo(() => {
    const codeToLabel = new Map<string, string>();
    (airline || []).forEach((a) => {
      const code = String(a?.code || "").trim().toUpperCase();
      if (code) codeToLabel.set(code, String(a?.label || code));
    });

    const gathered = new Map<string, { id: string; code: string; label: string }>();
    const addFromSegment = (seg: any) => {
      const code = String(seg?.marketingAirline || "").trim().toUpperCase();
      if (!code || gathered.has(code)) return;
      const fallbackLabel =
        String(
          seg?.marketingAirlineFullName ||
            seg?.marketingAirlineName ||
            seg?.operatingAirlineName ||
            "",
        ).trim() || code;
      gathered.set(code, {
        id: code,
        code,
        label: codeToLabel.get(code) || fallbackLabel,
      });
    };

    const addFromOffer = (offer: any) => {
      const journeys = offer?.raw?.journey || offer?.journey || [];
      (journeys || []).forEach((j: any) => {
        const segs = j?.flightSegments || [];
        (segs || []).forEach((s: any) => addFromSegment(s));
      });
    };

    const sourceData = [
      ...(originalResponseRef.current || []),
      ...(originalRoundResponseRef.current || []),
      ...(originalMulticityResponseRef.current || []),
    ];
    sourceData.forEach((it: any) => addFromOffer(it));

    return Array.from(gathered.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [airline, responseData, roundResponseData, multicityResponseData]);

  useEffect(() => {
    const allowed = new Set(availableAirlineOptions.map((a) => a.code));
    setSelectedAirlineIds((prev) => {
      const next = prev.filter((code) => allowed.has(code));
      const isSame =
        next.length === prev.length &&
        next.every((code, idx) => code === prev[idx]);

      // Avoid needless state updates (prevents "Maximum update depth" loops).
      return isSame ? prev : next;
    });
  }, [availableAirlineOptions]);

  const { useBreakpoint } = Grid;

  const [trip, setTrip] = useState<TripType>("oneway");
  const [fromCode, setFromCode] = useState<string>("");
  const [toCode, setToCode] = useState<string>("");
  const [fromOption, setFromOption] = useState<AirportOption | null>(null);
  const [toOption, setToOption] = useState<AirportOption | null>(null);
  const [selectedCabinClassId, setSelectedCabinClassId] = useState<string>("5");
  // const [showFilters, setShowFilters] = useState(false);

  const [open, setOpen] = useState(false);
  const screens = useBreakpoint(); // responsive breakpoints

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  useLayoutEffect(() => {
    const form = flightSearchFormRef.current;
    const wrap = flightPageWrapRef.current;
    if (!form || !wrap) return;
    const syncHeight = () => {
      const h = Math.ceil(form.getBoundingClientRect().height);
      wrap.style.setProperty("--flight-search-sticky-h", `${h}px`);
    };
    syncHeight();
    const ro = new ResizeObserver(syncHeight);
    ro.observe(form);
    return () => ro.disconnect();
  }, [trip, multicityLegs.length]);

  // useEffect(() => {
  //   if (!fromCode && (countries as AirportOption[])[0]) {
  //     setFromCode((countries as AirportOption[])[0].code);
  //   }
  //   if (!toCode && (countries as AirportOption[])[1]) {
  //     setToCode((countries as AirportOption[])[1].code);
  //   }
  // }, [countries, fromCode, toCode]);

  // initialize from store once after listings load
  const isHydratingFromStore = useRef(false);
  const hydratedFlightSnapshotRef = useRef<string | null>(null);
  const shouldAutoSearchRef = useRef(false);

  // hydrate full search state (inputs + results) when coming back from booking
  const hydratedSearchStateSnapshotRef = useRef<string | null>(null);
  useEffect(() => {
    if (!searchState) return;
    if (isInitialLoading) return;

    const snapshot = JSON.stringify({
      trip: searchState.trip,
      fromCode: searchState.fromCode,
      toCode: searchState.toCode,
      departDate: searchState.departDate,
      returnDate: searchState.returnDate,
      cabin: searchState.selectedCabinClassId,
      pax: searchState.paxCounts,
      sortBy: searchState.sortBy,
      hasSearched: searchState.hasSearched,
      hasResults:
        (searchState.responseData?.length ?? 0) +
          (searchState.roundResponseData?.length ?? 0) +
          (searchState.multicityResponseData?.length ?? 0) >
        0,
    });

    if (hydratedSearchStateSnapshotRef.current === snapshot) return;
    hydratedSearchStateSnapshotRef.current = snapshot;

    isHydratingFromStore.current = true;

    if (
      searchState.trip === "roundtrip" ||
      searchState.trip === "oneway" ||
      searchState.trip === "multicity"
    ) {
      setTrip(searchState.trip as TripType);
    }

    setFromCode(searchState.fromCode ?? "");
    setToCode(searchState.toCode ?? "");
    setFromOption((searchState.fromOption as AirportOption) ?? null);
    setToOption((searchState.toOption as AirportOption) ?? null);
    setSelectedCabinClassId(String(searchState.selectedCabinClassId ?? "5"));
    setDepartDate(searchState.departDate ?? "");
    setReturnDate(searchState.returnDate ?? "");
    setMulticityLegs(Array.isArray(searchState.multicityLegs) ? searchState.multicityLegs : []);
    setPaxCounts(searchState.paxCounts ?? {});
    passengerRequestOrder.current = Array.isArray(searchState.passengerOrder)
      ? searchState.passengerOrder.slice()
      : [];

    setPreservedFromOption((searchState.preservedFromOption as AirportOption) ?? null);
    setPreservedToOption((searchState.preservedToOption as AirportOption) ?? null);

    setResponseData(searchState.responseData ?? []);
    setRoundResponseData(searchState.roundResponseData ?? []);
    setMulticityResponseData(searchState.multicityResponseData ?? []);
    originalResponseRef.current = searchState.originalResponse ?? [];
    originalRoundResponseRef.current = searchState.originalRoundResponse ?? [];
    originalMulticityResponseRef.current = searchState.originalMulticityResponse ?? [];
    setHasMore(Boolean(searchState.hasMore));
    setIoReady(Boolean(searchState.ioReady));
    setHasSearched(Boolean(searchState.hasSearched));
    setIsSearching(Boolean(searchState.isSearching));
    setSearchError(searchState.searchError ?? null);
    lastRequestRef.current = (searchState.lastRequest as any) ?? null;
    setHighDemandIndicators(searchState.highDemandIndicators ?? []);

    setSelectedMaxConnections(Number(searchState.selectedMaxConnections ?? 0));
    setDepartureFlightRange(searchState.departureFlightRange ?? { start: "", end: "" });
    setArrivalFlightRange(searchState.arrivalFlightRange ?? { start: "", end: "" });
    setSelectedAirlineIds(searchState.selectedAirlineIds ?? []);
    setSelectedTransitRange(searchState.selectedTransitRange ?? null);
    setBaggageIncludedOnly(Boolean(searchState.baggageIncludedOnly));
    setAncillaryAddOnsOnly(Boolean(searchState.ancillaryAddOnsOnly));
    {
      const hasCheckbox =
        typeof searchState.refundFilterRefundable === "boolean" ||
        typeof searchState.refundFilterNonRefundable === "boolean";
      if (hasCheckbox) {
        setRefundFilterRefundable(Boolean(searchState.refundFilterRefundable));
        setRefundFilterNonRefundable(
          Boolean(searchState.refundFilterNonRefundable),
        );
      } else {
        const rf = searchState.refundableFilterMode;
        if (rf === "refundable") {
          setRefundFilterRefundable(true);
          setRefundFilterNonRefundable(false);
        } else if (rf === "non_refundable") {
          setRefundFilterRefundable(false);
          setRefundFilterNonRefundable(true);
        } else {
          setRefundFilterRefundable(false);
          setRefundFilterNonRefundable(false);
        }
      }
    }
    setPriceRangeBounds(searchState.priceRangeBounds ?? [0, 1000]);
    setSelectedPriceRange(searchState.selectedPriceRange ?? [0, 1000]);
    setSortBy(searchState.sortBy ?? "lowest_price");

    setResultsSummaryRouteLabel(
      buildFlightRouteSummaryLabel({
        trip: searchState.trip as TripType,
        multicityLegs: Array.isArray(searchState.multicityLegs)
          ? searchState.multicityLegs
          : [],
        fromOption: (searchState.fromOption as AirportOption) ?? null,
        toOption: (searchState.toOption as AirportOption) ?? null,
        fromCode: searchState.fromCode ?? "",
        toCode: searchState.toCode ?? "",
      }),
    );

    // Important: do NOT auto-search; we already restored results.
    shouldAutoSearchRef.current = false;

    const timeoutId = window.setTimeout(() => {
      isHydratingFromStore.current = false;
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [searchState, isInitialLoading]);
  useEffect(() => {
    if (!flight) return;
    if (isInitialLoading) return;
    // If we already restored full state, don't override it with bare `flight` hydration.
    if (searchState) return;

    const snapshot = JSON.stringify({
      trip: flight.trip,
      fromCode: flight?.fromCode ?? "",
      toCode: flight?.toCode ?? "",
      cabin: flight?.selectedCabinClassId ?? "",
      departure: flight?.departure ?? "",
      arrival: flight?.arrival ?? "",
      pax: flight?.next ?? {},
      order: flight?.order ?? [],
    });

    if (hydratedFlightSnapshotRef.current === snapshot) return;

    hydratedFlightSnapshotRef.current = snapshot;
    isHydratingFromStore.current = true;

    if (
      flight.trip === "roundtrip" ||
      flight.trip === "oneway" ||
      flight.trip === "multicity"
    ) {
      setTrip(flight.trip as TripType);
    }

    setFromCode(flight?.fromCode ?? "");
    setToCode(flight?.toCode ?? "");
    setFromOption((flight?.fromOption as AirportOption) ?? null);
    setToOption((flight?.toOption as AirportOption) ?? null);
    setSelectedCabinClassId(String(flight?.selectedCabinClassId ?? "5"));
    setPreservedFromOption(
      (prev) => (flight?.fromOption as AirportOption) || prev,
    );
    setPreservedToOption((prev) => (flight?.toOption as AirportOption) || prev);
    setDepartDate(
      typeof flight?.departure === "string" ? flight.departure : "",
    );
    setReturnDate(typeof flight?.arrival === "string" ? flight.arrival : "");
    setPaxCounts(flight?.next ?? {});
    setMulticityLegs(
      Array.isArray(flight?.legs) && flight.legs.length > 0
        ? flight.legs.map((l) => ({
            ...l,
            cabinClassId: l.cabinClassId ?? "5",
          }))
        : [],
    );
    passengerRequestOrder.current = Array.isArray(flight?.order)
      ? flight.order.slice()
      : [];

    setResponseData([]);
    setRoundResponseData([]);
    setMulticityResponseData([]);
    setPriceHistogramFares([]);
    setListingCurrencyCode("$");
    setHasMore(false);
    setIoReady(false);
    setHasSearched(false);
    setSearchError(null);
    lastRequestRef.current = null;
    shouldAutoSearchRef.current = true;
    setResultsSummaryRouteLabel(null);

    const timeoutId = window.setTimeout(() => {
      isHydratingFromStore.current = false;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [flight, isInitialLoading]);

  // Keep a live snapshot and save it on unmount so back navigation preserves results/inputs.
  useEffect(() => {
    latestSearchStateRef.current = {
      trip,
      fromCode,
      toCode,
      fromOption,
      toOption,
      selectedCabinClassId,
      departDate,
      returnDate,
      multicityLegs,
      paxCounts,
      passengerOrder: passengerRequestOrder.current.slice(),
      preservedFromOption,
      preservedToOption,

      responseData,
      roundResponseData,
      multicityResponseData,
      originalResponse: originalResponseRef.current,
      originalRoundResponse: originalRoundResponseRef.current,
      originalMulticityResponse: originalMulticityResponseRef.current,
      hasMore,
      ioReady,
      hasSearched,
      isSearching,
      searchError,
      lastRequest: lastRequestRef.current,
      highDemandIndicators,

      selectedMaxConnections,
      departureFlightRange,
      arrivalFlightRange,
      selectedAirlineIds,
      selectedTransitRange,
      baggageIncludedOnly,
      ancillaryAddOnsOnly,
      refundFilterRefundable,
      refundFilterNonRefundable,
      priceRangeBounds,
      selectedPriceRange,
      sortBy,
    };
  });

  useEffect(() => {
    return () => {
      // Only persist once we have either a search or user-modified inputs.
      const snap = latestSearchStateRef.current;
      if (!snap) return;
      setSearchState(snap);
    };
  }, [setSearchState]);

  const hasBasicFilters = useCallback(() => {
    const totalPassengers = Object.values(paxCounts || {}).reduce<number>(
      (sum, count) => sum + Number(count || 0),
      0,
    );
    if (trip === "multicity") {
      const allLegsValid = multicityLegs.every(
        (leg) =>
          leg.fromCode?.trim() &&
          leg.toCode?.trim() &&
          leg.date &&
          (leg.cabinClassId ?? selectedCabinClassId)?.trim(),
      );
      return allLegsValid && multicityLegs.length > 0 && totalPassengers > 0;
    }
    const hasReturnDate = trip !== "roundtrip" || Boolean(returnDate);
    return (
      Boolean(fromCode) &&
      Boolean(toCode) &&
      Boolean(selectedCabinClassId) &&
      Boolean(departDate) &&
      hasReturnDate &&
      totalPassengers > 0
    );
  }, [
    fromCode,
    toCode,
    selectedCabinClassId,
    departDate,
    returnDate,
    trip,
    paxCounts,
    multicityLegs,
  ]);

  const clearResultsForInactivity = useCallback(() => {
    setResponseData([]);
    setRoundResponseData([]);
    setMulticityResponseData([]);
    setPriceHistogramFares([]);
    setHasSearched(false);
    setHasMore(false);
    setIoReady(false);
    setSearchError(null);
    setResultsSummaryRouteLabel(null);
    originalResponseRef.current = [];
    originalRoundResponseRef.current = [];
    originalMulticityResponseRef.current = [];
    lastRequestRef.current = null;
  }, []);

  const {
    warningMessage: inactivityWarning,
    isBannerVisible: showInactivityBanner,
    startCountdown: startInactivityCountdown,
    resetCountdown: resetInactivityCountdown,
  } = useResultInactivityWarning({
    warningDelay: WARNING_TRIGGER_MS,
    expiryDelay: INACTIVITY_MINUTES_MS,
    warningText:
      "Kindly select a flight in the next 2 minutes or the results will be cleared.",
    expiryText:
      "Flight results cleared after 15 minutes of inactivity. Please search again.",
    onExpire: clearResultsForInactivity,
  });

  const startResultInactivityTimers = useCallback(() => {
    const hasResults =
      (originalResponseRef.current?.length ?? 0) > 0 ||
      (originalRoundResponseRef.current?.length ?? 0) > 0 ||
      (originalMulticityResponseRef.current?.length ?? 0) > 0;

    if (!hasResults) {
      resetInactivityCountdown();
      return;
    }

    startInactivityCountdown();
  }, [
    originalResponseRef,
    originalRoundResponseRef,
    originalMulticityResponseRef,
    resetInactivityCountdown,
    startInactivityCountdown,
  ]);

  // auto-trigger search when valid filters are present after hydration
  useEffect(() => {
    if (!shouldAutoSearchRef.current) return;
    if (isPending) return;
    if (!hasBasicFilters()) return;

    shouldAutoSearchRef.current = false;
    handleSearch();
  }, [
    fromCode,
    toCode,
    selectedCabinClassId,
    departDate,
    returnDate,
    trip,
    paxCounts,
    isPending,
    hasBasicFilters,
  ]);

  useEffect(() => {
    if (fromCode && toCode && fromCode === toCode) {
      setToCode(""); // invalid combo ko turant clear
    }
  }, [fromCode, toCode]);

  const cabinSelectOptions = useMemo(
    () => [
      { value: "", label: "Select cabin class", disabled: true },
      ...(cabinClasses as CabinClassOption[]).map((c) => ({
        value: c.id,
        label: c.label,
      })),
    ],
    [cabinClasses],
  );

  const handleAirlineToggle = (airlineCode: string, checked: boolean) => {
    const code = String(airlineCode || "")
      .trim()
      .toUpperCase();
    const next = checked
      ? Array.from(new Set([...selectedAirlineIds, code]))
      : selectedAirlineIds.filter((c) => c !== code);
    setSelectedAirlineIds(next);
    handleSearchFiltersChange({ selectedAirlines: next });
  };

  const handleSearchFiltersChange = (changes: {
    // priceId?: string | null;
    priceRange?: [number, number] | null;
    maxConnections?: number | null;
    departureFlightRange?: { start?: string; end?: string };
    arrivalFlightRange?: { start?: string; end?: string };
    selectedAirlines?: string[] | null;
  }) => {
    if (
      changes.departureFlightRange ||
      changes.arrivalFlightRange ||
      typeof changes.selectedAirlines !== "undefined" ||
      typeof changes.priceRange !== "undefined"
    ) {
      if (changes.departureFlightRange) {
        setDepartureFlightRange((prev) => ({
          start: changes.departureFlightRange?.start ?? prev.start,
          end: changes.departureFlightRange?.end ?? prev.end,
        }));
      }

      if (changes.arrivalFlightRange) {
        setArrivalFlightRange((prev) => ({
          start: changes.arrivalFlightRange?.start ?? prev.start,
          end: changes.arrivalFlightRange?.end ?? prev.end,
        }));
      }

      if (typeof changes.selectedAirlines !== "undefined") {
        setSelectedAirlineIds(changes.selectedAirlines ?? []);
      }

      const newRange =
        typeof changes.priceRange !== "undefined"
          ? (changes.priceRange ?? priceRangeBounds)
          : selectedPriceRange;

      if (typeof changes.priceRange !== "undefined") {
        setSelectedPriceRange(newRange);
      }

      applyFlightSearchFilters(
        changes.departureFlightRange ?? departureFlightRange,
        changes.arrivalFlightRange ?? arrivalFlightRange,
        typeof changes.selectedAirlines !== "undefined"
          ? changes.selectedAirlines
          : selectedAirlineIds,
        newRange,
      );

      return;
    }

    if (typeof changes.maxConnections !== "undefined") {
      setSelectedMaxConnections(changes.maxConnections ?? 0);
    }

    if (filterChangeDebounceRef.current) {
      window.clearTimeout(filterChangeDebounceRef.current);
    }

    filterChangeDebounceRef.current = window.setTimeout(() => {
      handleSearch({
        // priceId: changes.priceId ?? undefined,
        maxConnections:
          typeof changes.maxConnections !== "undefined"
            ? Number(changes.maxConnections)
            : undefined,
      });
    }, 300);
  };

  function applyFlightSearchFilters(
    depRange?: { start?: string; end?: string } | null,
    arrRange?: { start?: string; end?: string } | null,
    selectedAirlinesParam?: string[] | null,
    priceRange?: [number, number] | null,
    transitRange?: string | null,
    ancillaryMode?: AncillaryFilterMode | null,
    baggageIncludedOverride?: boolean | null,
    refundableFilterOverride?: RefundableFilterMode | null,
    sortByOverride?: string | null,
  ) {
    const sortKey = sortByOverride ?? sortBy;
    const mode: AncillaryFilterMode =
      ancillaryMode ?? (ancillaryAddOnsOnly ? "with" : "all");
    const bagOnly =
      baggageIncludedOverride !== null && baggageIncludedOverride !== undefined
        ? baggageIncludedOverride
        : baggageIncludedOnly;
    const refundableMode: RefundableFilterMode =
      refundableFilterOverride ??
      refundableFilterModeFromCheckboxes(
        refundFilterRefundable,
        refundFilterNonRefundable,
      );

    const { filteredOneWay, filteredRound } = filterFlightsByTimeAndAirlines(
      originalResponseRef.current ?? [],
      originalRoundResponseRef.current ?? [],
      depRange ?? null,
      arrRange ?? null,
      selectedAirlinesParam ?? selectedAirlineIds ?? null,
      transitRange ?? selectedTransitRange ?? null,
      timeToMinutesFromAnyString,
      { matchAllSegments: false }, // default behavior
    );

    const afterAncillaryOne = filterOffersByAncillaryMode(filteredOneWay, mode);
    const afterAncillaryRound = filterOffersByAncillaryMode(
      filteredRound,
      mode,
    );
    const afterBaggageOne = filterOffersByCheckedBaggage(
      afterAncillaryOne,
      bagOnly,
    );
    const afterBaggageRound = filterOffersByCheckedBaggage(
      afterAncillaryRound,
      bagOnly,
    );

    const afterRefundableOne = filterOffersByRefundableMode(
      afterBaggageOne,
      refundableMode,
    );
    const afterRefundableRound = filterOffersByRefundableMode(
      afterBaggageRound,
      refundableMode,
    );

    const applyPrice = (list: any[]) => {
      if (!priceRange) return list.slice();
      const [minP, maxP] = priceRange;
      return (list || []).filter((it) => {
        const fare = Number(
          it?.rawTotalStartingFare ?? it?.raw?.fare?.totalFare ?? NaN,
        );
        if (Number.isNaN(fare)) return false;
        return fare >= minP && fare <= maxP;
      });
    };

    const finalOneWay = applyPrice(afterRefundableOne);
    const finalRound = applyPrice(afterRefundableRound);

    setResponseData(sortFlightOffers(finalOneWay, sortKey));
    setRoundResponseData(sortFlightOffers(finalRound, sortKey));

    const afterAncillaryMulti = filterOffersByAncillaryMode(
      originalMulticityResponseRef.current ?? [],
      mode,
    );
    const afterBaggageMulti = filterOffersByCheckedBaggage(
      afterAncillaryMulti,
      bagOnly,
    );
    const afterRefundableMulti = filterOffersByRefundableMode(
      afterBaggageMulti,
      refundableMode,
    );
    setMulticityResponseData(
      sortFlightOffers(applyPrice(afterRefundableMulti), sortKey),
    );
  }

  useEffect(() => {
    return () => {
      if (filterChangeDebounceRef.current) {
        window.clearTimeout(filterChangeDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (!ioReady) return;

    const el = loadMoreRef.current;
    // debounce-ish guard
    let loading = false;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loading) {
          loading = true;
          // small micro-delay so consecutive intersects don’t spam
          setTimeout(async () => {
            await handleLoadMore();
            loading = false;
          }, 80);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px 400px 0px", // prefetch a bit earlier
        threshold: 0,
      },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [ioReady, hasMore, isLoadingMore]);

  const sortOptions = [
    { value: "lowest_price", label: "Lowest price" },
    { value: "shortest_duration", label: "Shortest duration" },
    { value: "earliest_departure", label: "Earliest departure" },
  ];

  const getSortLabel = (value: string) => {
    return sortOptions.find(opt => opt.value === value)?.label || "Lowest price";
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setIsSortDropdownOpen(false);

    setResponseData((prev) =>
      prev.length ? sortFlightOffers(prev, value) : prev,
    );
    setRoundResponseData((prev) =>
      prev.length ? sortFlightOffers(prev, value) : prev,
    );
    setMulticityResponseData((prev) =>
      prev.length ? sortFlightOffers(prev, value) : prev,
    );
  };

  const headerContent = (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <div 
        onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
        style={{ 
          width: "100%",
          height: '70px',
          borderRadius: '16px',
          border: '1.5px solid #3D495C',
          background: '#F2F2F3',
          padding: '12px 16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 300, color: '#64748B', display: 'block', marginBottom: '4px' }}>
        Sort by
        </span>
        <span style={{ fontSize: 16, fontWeight: 300, color: '#0F172A', display: 'block' }}>
          {getSortLabel(sortBy)}
        </span>
        <svg 
          style={{ 
            position: 'absolute', 
            right: '16px', 
            top: '50%', 
            transform: isSortDropdownOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
            transition: 'transform 0.3s ease'
          }}
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="#3D495C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      {/* Dropdown options */}
      {isSortDropdownOpen && (
        <div style={{
          position: 'absolute',
          top: '75px',
          left: 0,
          width: '100%',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #C2CAD6',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {sortOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 300,
                color: sortBy === option.value ? '#2351A3' : '#0F172A',
                background: sortBy === option.value ? '#F2F2F3' : '#FFFFFF',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (sortBy !== option.value) {
                  e.currentTarget.style.background = '#F8F9FA';
                }
              }}
              onMouseLeave={(e) => {
                if (sortBy !== option.value) {
                  e.currentTarget.style.background = '#FFFFFF';
                }
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLoadMoreApiLoader = (state: {
    isLoadingMore?: boolean;
    hasMore?: boolean;
  }) => {
    if (state.isLoadingMore) {
      return (
        <div
          className="py-4 flex flex-col items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <div
            className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[##2351A3] animate-spin"
            style={{ borderTopColor: "#2351A3" }}
          />
          <div className="mt-2 text-sm text-gray-600">
            Loading more flights…
          </div>
          <span className="sr-only">Loading more flights</span>
        </div>
      );
    }

    return null;
  };

  const noFlightsDataAvailable = () => {
    return hasSearched ? (
      <div className="py-16 flex flex-col items-center text-center">
        <img src={noFlights} alt="globe-icon" className="w-8 h-8" />
        {searchError ? (
          <>
            <p className="mt-2 text-[14px] text-[#0F172A]">
              {searchError.charAt(0).toUpperCase() + searchError.slice(1)}
            </p>
            <p className="mt-2 text-[14px] text-[#3D495C]">Please try again.</p>
          </>
        ) : (
          <>
            <p className="mt-2 text-[14px] text-[#0F172A]">
              No flights found for your route and specifications.
            </p>
            <p className="mt-2 text-[14px] text-[#3D495C]">
              Try searching again.
            </p>
          </>
        )}
      </div>
    ) : null;
  };

  useEffect(() => {
    // Skip resetting when we're hydrating values from the store
    if (isHydratingFromStore.current) return;

    setResponseData([]);
    setRoundResponseData([]);
    setMulticityResponseData([]);
    setPriceHistogramFares([]);
    setListingCurrencyCode("$");
    // setDepartDate("");
    // setReturnDate("");
    setSelectedCabinClassId("5");
    setPaxCounts({});
    setHasMore(false);
    setIoReady(false);
    setHasSearched(false);
    setSearchError(null);
    lastRequestRef.current = null;
    resetInactivityCountdown();
    if (trip === "multicity") {
      setMulticityLegs((prev) =>
        prev.length === 0
          ? [
              {
                fromCode: "",
                toCode: "",
                date: null,
                cabinClassId: "5",
              } as FlightLeg,
              {
                fromCode: "",
                toCode: "",
                date: null,
                cabinClassId: "5",
              } as FlightLeg,
            ]
          : prev,
      );
    }
  }, [trip, resetInactivityCountdown]);

  useEffect(() => {
    if (trip !== "multicity") return;
    if (multicityLegs.length < 2) return;

    setMulticityLegs((prev) => {
      const updated = [...prev];
      let hasChanges = false;

      for (let i = 0; i < updated.length - 1; i++) {
        const currentLeg = updated[i];
        const nextLeg = updated[i + 1];
        if (
          currentLeg.toCode &&
          currentLeg.toCode.trim() &&
          nextLeg.fromCode !== currentLeg.toCode
        ) {
          updated[i + 1] = {
            ...nextLeg,
            fromCode: currentLeg.toCode,
            fromOption: currentLeg.toOption,
          };
          hasChanges = true;
        }
      }
      return hasChanges ? updated : prev;
    });
  }, [trip, multicityLegs.map((leg) => leg.toCode).join(",")]);


  const flightResultsSummaryLine = useMemo(() => {
    if (!hasSearched || isSearching || searchError) return null;

    const routeLabelFromForm = buildFlightRouteSummaryLabel({
      trip,
      multicityLegs,
      fromOption,
      toOption,
      fromCode,
      toCode,
    });
    const routeLabel =
      resultsSummaryRouteLabel != null && resultsSummaryRouteLabel !== ""
        ? resultsSummaryRouteLabel
        : routeLabelFromForm;

    let n = 0;
    let total = 0;
    if (trip === "oneway") {
      n = responseData?.length ?? 0;
      total = (originalResponseRef.current || []).length;
    } else if (trip === "roundtrip") {
      n = roundResponseData?.length ?? 0;
      total = (originalRoundResponseRef.current || []).length;
    } else {
      n = multicityResponseData?.length ?? 0;
      total = (originalMulticityResponseRef.current || []).length;
    }

    if (total === 0 && n === 0) {
      return `${routeLabel}: 0 flights found`;
    }
    if (n < total) {
      return `${routeLabel}: ${n} of ${total} flights found`;
    }
    return `${routeLabel}: ${n} flights found`;
  }, [
    hasSearched,
    isSearching,
    searchError,
    trip,
    multicityLegs,
    fromOption,
    toOption,
    fromCode,
    toCode,
    resultsSummaryRouteLabel,
    responseData.length,
    roundResponseData.length,
    multicityResponseData.length,
  ]);

  return (
    <div className="">
      <Loader show={isInitialLoading} />
      <Loader
        show={isPending || isSearching}
        label="Please wait while we are looking for available flights"
      />
      <StatusMessageBanner
        visible={!!inactivityWarning && showInactivityBanner}
        message={inactivityWarning ?? ""}
        variant="warning"
        containerClassName="top-6 z-40"
      />

      <div
        ref={flightPageWrapRef}
        className="flightDetailTemplateWrap flight-search-page"
      >
        <div
          ref={flightSearchFormRef}
          className={`bottomHeaderSetting flight-search-form-sticky${trip === "multicity" ? " flight-search-form--multicity" : ""}`}
        >
          <TravelSearchPageHeader
            trip={trip}
            onTripChange={setTrip}
            flightTypeTabs={(flightTypes ?? []) as FlightTypeOption[]}
            tripTypesLoading={!!loadingMap?.flightTypes}
          />
          {trip === "multicity" ? (
            <>
              <div className="flight-search-multicity-toprow">
                <div className="flight-search-multicity-toprow-route flight-search-multicity-toprow-route--travellers-only">
                  <Flex
                    vertical
                    className="flight-search-multicity-travellers-cell min-w-0 w-full"
                  >
                    <label className="header-labels-common flex items-center gap-2">
                      Travellers
                    <span className="relative inline-flex group/info">
                      <img
                        src={Info}
                        alt="info"
                        className="w-4 h-4 inline-block align-middle"
                      />
                      <span
                        className="pointer-events-none absolute bottom-full left-full -translate-x-1/3 mb-2 hidden group-hover/info:block z-50 px-3 py-2 text-xs leading-5 text-white bg-[#1E293B] rounded-lg shadow-lg whitespace-nowrap text-center before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-6 before:border-transparent before:border-t-[#1E293B]"
                        role="tooltip"
                      >
                        Adults + Kids count cannot exceed 9
                        <br />
                        Infants cannot be more than Adults
                      </span>
                    </span>
                  </label>
                  <div style={{ minWidth: "100%", height: 44 }}>
                    <PassengerCounterDropdown
                      value={paxCounts}
                      schema={passengers as PassengerSchema}
                      maxTotal={100}
                      onChange={(value) => handlePassenger(value)}
                    />
                  </div>
                </Flex>
                </div>
              </div>

              {/* ===== SECTION 2: FLIGHT LEGS — scroll when more than 2 rows ===== */}
              <div
                className={
                  multicityLegs.length > 2
                    ? "flight-search-multicity-legs-scroll"
                    : "flight-search-multicity-legs"
                }
              >
                {multicityLegs.map((leg, idx) => (
                  <div key={idx} className="relative">
                    <div className="flight-search-multicity-legrow">
                    <div className="flight-search-multicity-route">
                      <TravelRoutePicker
                        options={[]}
                        loading={countriesLoading}
                        fromOptions={fromCountriesForPicker as AirportOption[]}
                        toOptions={toCountriesForPicker as AirportOption[]}
                        fromLoading={
                          qFromAirports.isLoading || qFromAirports.isFetching
                        }
                        toLoading={
                          qToAirports.isLoading || qToAirports.isFetching
                        }
                        onFromSearchChange={setFromCountriesSearchTerm}
                        onToSearchChange={setToCountriesSearchTerm}
                        value={{
                          fromCode: leg.fromCode,
                          toCode: leg.toCode,
                          fromOption: leg.fromOption ?? null,
                          toOption: leg.toOption ?? null,
                        }}
                        onChange={({
                          fromCode,
                          toCode,
                          fromOption,
                          toOption,
                        }) => {
                          setMulticityLegs((prev) =>
                            prev.map((l, i) =>
                              i === idx
                                ? {
                                    ...l,
                                    fromCode: fromCode ?? l.fromCode,
                                    toCode: toCode ?? l.toCode,
                                    fromOption: fromOption ?? l.fromOption,
                                    toOption: toOption ?? l.toOption,
                                  }
                                : l,
                            ),
                          );
                        }}
                        showSwap
                        labels={{ from: "From", to: "To" }}
                        placeholders={{
                          from: "Please select",
                          to: "Please select",
                        }}
                        disableSameSelection
                        widthClass="multicityFromTo"
                        swapGutter={false}
                      />
                    </div>

                    <div className="flight-search-multicity-side">
                      <label className="header-labels-common">Departure Date</label>
                      <TailiwindCustomDatePicker
                        value={leg.date ? new Date(leg.date) : null}
                        onChange={(d) => {
                          setMulticityLegs((prev) =>
                            prev.map((l, i) =>
                              i === idx
                                ? {
                                    ...l,
                                    date: d ? formatDateToLocalISO(d) : null,
                                  }
                                : l,
                            ),
                          );
                        }}
                        placeholder="Select departure date"
                        tooltip="Select departure date"
                        buttonIconSrc={true}
                        disablePastDates={true}
                        minDate={
                          idx > 0 && multicityLegs[idx - 1]?.date
                            ? new Date(multicityLegs[idx - 1].date!)
                            : undefined
                        }
                      />
                    </div>

                    <div className="flight-search-multicity-side">
                      <label className="header-labels-common">
                        Cabin Class
                      </label>
                      <SearchableDropdown
                        options={cabinSelectOptions.map((option) => ({
                          id: option.value || "placeholder",
                          value: option.value,
                          label: option.label,
                          disabled:
                            "disabled" in option ? option.disabled : false,
                        }))}
                        value={leg.cabinClassId ?? selectedCabinClassId ?? "5"}
                        onChange={(value) => {
                          setMulticityLegs((prev) =>
                            prev.map((l, i) =>
                              i === idx ? { ...l, cabinClassId: value } : l,
                            ),
                          );
                        }}
                        placeholder={
                          isInitialLoading ? "Loading…" : "Select cabin class"
                        }
                        disabled={isInitialLoading}
                        widthClass="w-full"
                        searchPlaceholder="Search cabin classes..."
                        tooltip="Select cabin class"
                      />
                    </div>
                  </div>
                  {idx >= 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        setMulticityLegs((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                      className="absolute -right-10 top-12 -translate-y-1/2 p-2 text-[#DC2626] hover:text-[#B91C1C] hover:bg-red-50 rounded transition-colors"
                      style={{ marginTop: "10px" }}
                      title="Remove flight"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          d="M6 6l8 8M14 6l-8 8"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                ))}
              </div>

              {/* ===== SECTION 3: ADD ANOTHER STOP ===== */}
              <div className="mt-0 flex w-full justify-center sm:mt-1">
                <button
                  type="button"
                  onClick={() =>
                    setMulticityLegs((prev) => [
                      ...prev,
                      {
                        fromCode: "",
                        toCode: "",
                        date: null,
                        cabinClassId: "5",
                      },
                    ])
                  }
                  className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-[14px] font-medium text-[#2351A3] hover:underline"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M8 3v10M3 8h10"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Add another stop
                </button>
              </div>

              {/* ===== SECTION 4: SEARCH ===== */}
              <div className="mt-2 flex w-full justify-center sm:mt-3">
                <CustomButton
                  className="searchFilterBtn"
                  onClick={() => handleSearch()}
                  style={{ minWidth: "200px" }}
                >
                  {isPending ? "Searching..." : "Search"}
                </CustomButton>
              </div>
            </>
          ) : (
            <div className="flight-search-detail-inputs">
              {/* DOM order = Figma left-to-right: From | Swap | To | dates | Passengers | Cabin | Search */}
              <div className="flight-search-field flight-search-field--route">
                <TravelRoutePicker
                  options={[]}
                  loading={countriesLoading}
                  fromOptions={fromCountriesForPicker as AirportOption[]}
                  toOptions={toCountriesForPicker as AirportOption[]}
                  fromLoading={
                    qFromAirports.isLoading || qFromAirports.isFetching
                  }
                  toLoading={qToAirports.isLoading || qToAirports.isFetching}
                  onFromSearchChange={setFromCountriesSearchTerm}
                  onToSearchChange={setToCountriesSearchTerm}
                  value={{
                    fromCode,
                    toCode,
                    fromOption: fromOption ?? preservedFromOption,
                    toOption: toOption ?? preservedToOption,
                  }}
                  onChange={({
                    fromCode: f,
                    toCode: t,
                    fromOption: fOpt,
                    toOption: tOpt,
                  }) => {
                    setFromCode(f);
                    setToCode(t);
                    if (fOpt !== undefined) setFromOption(fOpt);
                    if (tOpt !== undefined) setToOption(tOpt);
                  }}
                  showSwap
                  labels={{ from: "From", to: "To" }}
                  placeholders={{ from: "Please select", to: "Please select" }}
                  disableSameSelection
                  widthClass="fromToSelectWidth"
                  swapGutter={false}
                  fromError={
                    !loading &&
                    fromCountriesForPicker.length === 0
                      ? "Please try a different search."
                      : undefined
                  }
                  toError={
                    !loading &&
                    toCountriesForPicker.length === 0
                      ? "Please try a different search."
                      : undefined
                  }
                  fromOnLoadMore={qFromAirports.fetchNextPage}
                  toOnLoadMore={qToAirports.fetchNextPage}
                  fromHasMore={qFromAirports.hasNextPage}
                  toHasMore={qToAirports.hasNextPage}
                  fromLoadingMore={qFromAirports.isFetchingNextPage}
                  toLoadingMore={qToAirports.isFetchingNextPage}
                />
              </div>

              <div className="flight-search-field flight-search-field--depart">
                <label className="header-labels-common">Departure date</label>
                <TailiwindCustomDatePicker
                  value={departDate ? new Date(departDate) : null}
                  onChange={(value) => {
                    handleDate(value, "depart");
                  }}
                  placeholder="Select departure date"
                  tooltip="Select departure date"
                  buttonIconSrc={true}
                  showCalendarIconRight={true}
                  disablePastDates={true}
                />
              </div>

              {trip === "roundtrip" && (
                <div className="flight-search-field flight-search-field--return">
                  <label className="header-labels-common">Return date</label>
                  <TailiwindCustomDatePicker
                    value={returnDate ? new Date(returnDate) : null}
                    onChange={(value) => {
                      handleDate(value, "return");
                    }}
                    placeholder="Select return date"
                    tooltip="Select return date"
                    buttonIconSrc={true}
                    showCalendarIconRight={true}
                    disablePastDates={true}
                    minDate={departDate ? new Date(departDate) : null}
                  />
                </div>
              )}

              <div className="flight-search-field flight-search-field--travellers">
                <label className="header-labels-common flex items-center gap-2">
                  Passengers
                  <span className="relative inline-flex group/info">
                    <img
                      src={Info}
                      alt="info"
                      className="w-4 h-4 inline-block align-middle"
                    />
                    <span
                      className="pointer-events-none absolute bottom-full left-full -translate-x-1/3 mb-2 hidden group-hover/info:block z-50 px-3 py-2 text-xs leading-5 text-white bg-[#1E293B] rounded-lg shadow-lg whitespace-nowrap text-center before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-6 before:border-transparent before:border-t-[#1E293B]"
                      role="tooltip"
                    >
                      Adults + Kids count cannot exceed 9
                      <br />
                      Infants cannot be more than Adults
                    </span>
                  </span>
                </label>
                <div className="min-w-full min-h-0">
                  <PassengerCounterDropdown
                    value={paxCounts}
                    schema={passengers as PassengerSchema}
                    maxTotal={100}
                    onChange={(value) => {
                      handlePassenger(value);
                    }}
                  />
                </div>
              </div>

              <div className="flight-search-field flight-search-field--cabin">
                <label className="header-labels-common">Cabin class</label>
                <SearchableDropdown
                  options={cabinSelectOptions.map((option) => ({
                    id: option.value || "placeholder",
                    value: option.value,
                    label: option.label,
                    disabled: "disabled" in option ? option.disabled : false,
                  }))}
                  value={selectedCabinClassId || ""}
                  onChange={(value) => setSelectedCabinClassId(value)}
                  placeholder={
                    isInitialLoading ? "Loading…" : "Select cabin class"
                  }
                  disabled={isInitialLoading}
                  widthClass="w-full"
                  searchPlaceholder="Search cabin classes..."
                  tooltip="Select cabin class"
                />
              </div>

              <div className="flight-search-field flight-search-field--submit">
                <CustomButton
                  className="searchFilterBtn flight-search-submit-btn"
                  onClick={() => handleSearch()}
                >
                  {isPending ? "Searching..." : "Search flights"}
                </CustomButton>
              </div>
            </div>
          )}
          {/* Divider — spans inputs width only (inside the form's horizontal padding) */}
          <div className="flight-search-divider" />
        </div>

        {!screens.lg && (
          <div className="">
            <Drawer
              title="Filters"
              placement="right"
              closable={true}
              onClose={onClose}
              open={open}
              width={300}
            >
              <FlightSearchFilter
                loading={isInitialLoading}
                headerContent={headerContent}
                priceRangeBounds={priceRangeBounds}
                selectedPriceRange={selectedPriceRange}
                priceStep={PRICE_STEP}
                priceCurrencyCode={listingCurrencyCode}
                priceHistogramFares={priceHistogramFares}
                onPriceRangeChange={(next) => {
                  setSelectedPriceRange(next);
                  applyFlightSearchFilters(
                    departureFlightRange,
                    arrivalFlightRange,
                    selectedAirlineIds,
                    next,
                    selectedTransitRange,
                  );
                }}
                numberStops={numberStops}
                selectedMaxConnections={selectedMaxConnections}
                onMaxConnectionsChange={(next) =>
                  handleSearchFiltersChange({ maxConnections: next })
                }
                baggage={baggage}
                baggageIncludedOnly={baggageIncludedOnly}
                onBaggageIncludedChange={(checked) => {
                  setBaggageIncludedOnly(checked);
                  applyFlightSearchFilters(
                    departureFlightRange,
                    arrivalFlightRange,
                    selectedAirlineIds,
                    selectedPriceRange,
                    selectedTransitRange,
                    null,
                    checked,
                  );
                }}
                transitHours={transitHours}
                selectedTransitRange={selectedTransitRange}
                onTransitRangeChange={(val) => {
                  setSelectedTransitRange(val);
                  applyFlightSearchFilters(
                    departureFlightRange,
                    arrivalFlightRange,
                    selectedAirlineIds,
                    selectedPriceRange,
                    val,
                  );
                }}
                departureFlightRange={departureFlightRange}
                arrivalFlightRange={arrivalFlightRange}
                onDepartureRangeChange={(next) =>
                  handleSearchFiltersChange({ departureFlightRange: next })
                }
                onArrivalRangeChange={(next) =>
                  handleSearchFiltersChange({ arrivalFlightRange: next })
                }
                airline={availableAirlineOptions}
                selectedAirlineIds={selectedAirlineIds}
                onAirlineToggle={(code, checked) =>
                  handleAirlineToggle(code, checked)
                }
                ancillaryAddOnsOnly={ancillaryAddOnsOnly}
                onAncillaryAddOnsOnlyChange={(checked) => {
                  setAncillaryAddOnsOnly(checked);
                  applyFlightSearchFilters(
                    departureFlightRange,
                    arrivalFlightRange,
                    selectedAirlineIds,
                    selectedPriceRange,
                    selectedTransitRange,
                    checked ? "with" : "all",
                    null,
                  );
                }}
                refundFilterRefundable={refundFilterRefundable}
                refundFilterNonRefundable={refundFilterNonRefundable}
                onRefundFilterRefundableChange={(checked) => {
                  setRefundFilterRefundable(checked);
                  applyFlightSearchFilters(
                    departureFlightRange,
                    arrivalFlightRange,
                    selectedAirlineIds,
                    selectedPriceRange,
                    selectedTransitRange,
                    null,
                    null,
                    refundableFilterModeFromCheckboxes(
                      checked,
                      refundFilterNonRefundable,
                    ),
                  );
                }}
                onRefundFilterNonRefundableChange={(checked) => {
                  setRefundFilterNonRefundable(checked);
                  applyFlightSearchFilters(
                    departureFlightRange,
                    arrivalFlightRange,
                    selectedAirlineIds,
                    selectedPriceRange,
                    selectedTransitRange,
                    null,
                    null,
                    refundableFilterModeFromCheckboxes(
                      refundFilterRefundable,
                      checked,
                    ),
                  );
                }}
                onReset={() => {
                  setSelectedAirlineIds([]);
                  setSelectedMaxConnections(0);
                  setDepartureFlightRange({ start: "", end: "" });
                  setArrivalFlightRange({ start: "", end: "" });
                  setSelectedPriceRange(priceRangeBounds);
                  setSelectedTransitRange(null);
                  setBaggageIncludedOnly(false);
                  setAncillaryAddOnsOnly(false);
                  setRefundFilterRefundable(false);
                  setRefundFilterNonRefundable(false);
                  applyFlightSearchFilters(
                    { start: "", end: "" },
                    { start: "", end: "" },
                    [],
                    priceRangeBounds,
                    null,
                    "all",
                    false,
                    "all",
                    undefined,
                  );
                }}
              />
            </Drawer>
          </div>
        )}

        <div className="contentWrapFlex flight-search-content-row">
          {screens.lg && (
            <div className="flightDetailFilter flightDetailFilterOuter">
              <div className="flightDetailFilterInnerSticky">
              <FlightSearchFilter
                loading={isInitialLoading}
                headerContent={headerContent}
                priceRangeBounds={priceRangeBounds}
                selectedPriceRange={selectedPriceRange}
                priceStep={PRICE_STEP}
                priceCurrencyCode={listingCurrencyCode}
                priceHistogramFares={priceHistogramFares}
                onPriceRangeChange={(next) => {
                  setSelectedPriceRange(next);
                  applyFlightSearchFilters(
                    departureFlightRange,
                    arrivalFlightRange,
                    selectedAirlineIds,
                    next,
                    selectedTransitRange,
                  );
                }}
                numberStops={numberStops}
                selectedMaxConnections={selectedMaxConnections}
                onMaxConnectionsChange={(next) =>
                  handleSearchFiltersChange({ maxConnections: next })
                }
                baggage={baggage}
                baggageIncludedOnly={baggageIncludedOnly}
                onBaggageIncludedChange={(checked) => {
                  setBaggageIncludedOnly(checked);
                  applyFlightSearchFilters(
                    departureFlightRange,
                    arrivalFlightRange,
                    selectedAirlineIds,
                    selectedPriceRange,
                    selectedTransitRange,
                    null,
                    checked,
                  );
                }}
                transitHours={transitHours}
                selectedTransitRange={selectedTransitRange}
                onTransitRangeChange={(val) => {
                  setSelectedTransitRange(val);
                  applyFlightSearchFilters(
                    departureFlightRange,
                    arrivalFlightRange,
                    selectedAirlineIds,
                    selectedPriceRange,
                    val,
                  );
                }}
                departureFlightRange={departureFlightRange}
                arrivalFlightRange={arrivalFlightRange}
                onDepartureRangeChange={(next) =>
                  handleSearchFiltersChange({ departureFlightRange: next })
                }
                onArrivalRangeChange={(next) =>
                  handleSearchFiltersChange({ arrivalFlightRange: next })
                }
                airline={availableAirlineOptions}
                selectedAirlineIds={selectedAirlineIds}
                onAirlineToggle={(code, checked) =>
                  handleAirlineToggle(code, checked)
                }
                ancillaryAddOnsOnly={ancillaryAddOnsOnly}
                onAncillaryAddOnsOnlyChange={(checked) => {
                  setAncillaryAddOnsOnly(checked);
                  applyFlightSearchFilters(
                    departureFlightRange,
                    arrivalFlightRange,
                    selectedAirlineIds,
                    selectedPriceRange,
                    selectedTransitRange,
                    checked ? "with" : "all",
                    null,
                  );
                }}
                refundFilterRefundable={refundFilterRefundable}
                refundFilterNonRefundable={refundFilterNonRefundable}
                onRefundFilterRefundableChange={(checked) => {
                  setRefundFilterRefundable(checked);
                  applyFlightSearchFilters(
                    departureFlightRange,
                    arrivalFlightRange,
                    selectedAirlineIds,
                    selectedPriceRange,
                    selectedTransitRange,
                    null,
                    null,
                    refundableFilterModeFromCheckboxes(
                      checked,
                      refundFilterNonRefundable,
                    ),
                  );
                }}
                onRefundFilterNonRefundableChange={(checked) => {
                  setRefundFilterNonRefundable(checked);
                  applyFlightSearchFilters(
                    departureFlightRange,
                    arrivalFlightRange,
                    selectedAirlineIds,
                    selectedPriceRange,
                    selectedTransitRange,
                    null,
                    null,
                    refundableFilterModeFromCheckboxes(
                      refundFilterRefundable,
                      checked,
                    ),
                  );
                }}
                onReset={() => {
                  setSelectedAirlineIds([]);
                  setSelectedMaxConnections(0);
                  setDepartureFlightRange({ start: "", end: "" });
                  setArrivalFlightRange({ start: "", end: "" });
                  setSelectedPriceRange(priceRangeBounds);
                  setSelectedTransitRange(null);
                  setBaggageIncludedOnly(false);
                  setAncillaryAddOnsOnly(false);
                  setRefundFilterRefundable(false);
                  setRefundFilterNonRefundable(false);
                  applyFlightSearchFilters(
                    { start: "", end: "" },
                    { start: "", end: "" },
                    [],
                    priceRangeBounds,
                    null,
                    "all",
                    false,
                    "all",
                    undefined,
                  );
                }}
              />
              </div>
            </div>
          )}
          <div className="flightDetailMainContent" style={{ width: "100%" }}>
            {(!hasSearched || (responseData && responseData.length > 0)) && (
              <>
                <div className="relative w-full max-w-[1040px] m-auto">
                  <img
                    src={planeImg}
                    alt=""
                    className="absolute w-[344px] top-[-18px] left-[312px]"
                  />
                </div>
                <div className="setHeroImage">
                  <div className="heroImgDFlex">
                    <div className="partOne">
                      <div>
                        <img src={alraisLogo} alt="" />
                      </div>
                      <div>
                        <h4>30% off</h4>
                        <h6>World Flight Day Special!</h6>
                        <p className="para1">
                          Book a FlyDubai flight to Mumbai today and enjoy
                        </p>
                        <p className="para2">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 1.875C8.39303 1.875 6.82214 2.35152 5.486 3.24431C4.14985 4.1371 3.10844 5.40605 2.49348 6.8907C1.87852 8.37535 1.71762 10.009 2.03112 11.5851C2.34463 13.1612 3.11846 14.6089 4.25476 15.7452C5.39106 16.8815 6.8388 17.6554 8.4149 17.9689C9.99099 18.2824 11.6247 18.1215 13.1093 17.5065C14.594 16.8916 15.8629 15.8502 16.7557 14.514C17.6485 13.1779 18.125 11.607 18.125 10C18.1227 7.84581 17.266 5.78051 15.7427 4.25727C14.2195 2.73403 12.1542 1.87727 10 1.875ZM10 16.875C8.64026 16.875 7.31105 16.4718 6.18046 15.7164C5.04987 14.9609 4.16868 13.8872 3.64833 12.6309C3.12798 11.3747 2.99183 9.99237 3.2571 8.65875C3.52238 7.32513 4.17716 6.10013 5.13864 5.13864C6.10013 4.17716 7.32514 3.52237 8.65876 3.2571C9.99238 2.99183 11.3747 3.12798 12.631 3.64833C13.8872 4.16868 14.9609 5.04987 15.7164 6.18045C16.4718 7.31104 16.875 8.64025 16.875 10C16.8729 11.8227 16.1479 13.5702 14.8591 14.8591C13.5702 16.1479 11.8227 16.8729 10 16.875ZM11.25 13.75C11.25 13.9158 11.1842 14.0747 11.0669 14.1919C10.9497 14.3092 10.7908 14.375 10.625 14.375C10.2935 14.375 9.97554 14.2433 9.74112 14.0089C9.5067 13.7745 9.375 13.4565 9.375 13.125V10C9.20924 10 9.05027 9.93415 8.93306 9.81694C8.81585 9.69973 8.75 9.54076 8.75 9.375C8.75 9.20924 8.81585 9.05027 8.93306 8.93306C9.05027 8.81585 9.20924 8.75 9.375 8.75C9.70652 8.75 10.0245 8.8817 10.2589 9.11612C10.4933 9.35054 10.625 9.66848 10.625 10V13.125C10.7908 13.125 10.9497 13.1908 11.0669 13.3081C11.1842 13.4253 11.25 13.5842 11.25 13.75ZM8.75 6.5625C8.75 6.37708 8.80499 6.19582 8.908 6.04165C9.01101 5.88748 9.15743 5.76732 9.32874 5.69636C9.50004 5.62541 9.68854 5.60684 9.8704 5.64301C10.0523 5.67919 10.2193 5.76848 10.3504 5.89959C10.4815 6.0307 10.5708 6.19775 10.607 6.3796C10.6432 6.56146 10.6246 6.74996 10.5536 6.92127C10.4827 7.09257 10.3625 7.23899 10.2084 7.342C10.0542 7.44502 9.87292 7.5 9.6875 7.5C9.43886 7.5 9.20041 7.40123 9.02459 7.22541C8.84878 7.0496 8.75 6.81114 8.75 6.5625Z"
                              fill="#A7C0EC"
                            />
                          </svg>
                          <span>Terms and conditions apply</span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <button className="promoCodeBtn">Copy promo code</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {flightResultsSummaryLine ? (
              <p
                className="flight-search-results-summary"
                role="status"
                aria-live="polite"
              >
                {flightResultsSummaryLine}
              </p>
            ) : null}

            {!screens.lg && (
              <Button
                className="filterToggleBtn"
                type="primary"
                icon={<FilterOutlined />}
                onClick={showDrawer}
              >
                Filters
              </Button>
            )}
            {trip === "oneway" ? (
              <>
                <TravelOneWay
                  passData={responseData || []}
                  passengersForRequest={buildPassengersArrayForFlightSearch(
                    passengerRequestOrder.current,
                    passengers as PassengerSchema,
                    paxCounts,
                  )}
                  isLoadingMore={isLoadingMore}
                  hasMore={hasMore}
                  renderLoader={renderLoadMoreApiLoader}
                  loadMoreRef={loadMoreRef}
                  emptyState={noFlightsDataAvailable}
                  highDemandIndicators={highDemandIndicators}
                />
              </>
            ) : trip === "roundtrip" ? (
              <TravelRoundTrip
                passData={roundResponseData || []}
                passengersForRequest={buildPassengersArrayForFlightSearch(
                  passengerRequestOrder.current,
                  passengers as PassengerSchema,
                  paxCounts,
                )}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                renderLoader={renderLoadMoreApiLoader}
                loadMoreRef={loadMoreRef}
                emptyState={noFlightsDataAvailable}
                highDemandIndicators={highDemandIndicators}
              />
            ) : (
              <TravelMultiCity
                passData={multicityResponseData || []}
                passengersForRequest={buildPassengersArrayForFlightSearch(
                  passengerRequestOrder.current,
                  passengers as PassengerSchema,
                  paxCounts,
                )}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                renderLoader={renderLoadMoreApiLoader}
                loadMoreRef={loadMoreRef}
                emptyState={noFlightsDataAvailable}
                 highDemandIndicators={highDemandIndicators}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetailTemplate;
