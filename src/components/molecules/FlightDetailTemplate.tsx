import React, { useEffect, useMemo, useRef, useCallback } from "react";

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
import type { CheckboxProps } from "antd";
import { useMasterListings } from "../../hooks/masterListings/useMasterListings";
import { FilterOutlined } from "@ant-design/icons";

import PassengerCounterDropdown from "../atoms/PassengerCounterDropdown";
import type {
  AirportOption,
  PassengerSchema,
  CabinClassOption,
  TripType,
} from "../../features/flights/types";
import TravelRoutePicker from "../atoms/TravelRoutePicker";
import Loader from "../atoms/Loader";
import { useFlightStore, type FlightLeg } from "../../store/UseFlightStore";
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
  timeToMinutesFromAnyString,
} from "../../utils/helpers";
import StatusMessageBanner from "../common/StatusMessageBanner";
import {
  callWithRetries,
  filterFlightsByTimeAndAirlines,
} from "../../utils/flightFilters";
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

const baggageHandler: CheckboxProps["onChange"] = (e) => {
  console.log(`checked = ${e.target.checked}`);
};

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

const FlightDetailTemplate: React.FC = () => {
  const { mutateAsync, isPending } = useFlightSearch();
  const { loadMoreAsync, isLoadingMore } = useLoadMoreFlights();
  const { flight, clearFlight } = useFlightStore();

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
  const [priceRangeBounds, setPriceRangeBounds] = React.useState<
    [number, number]
  >([0, 1000]);
  const [selectedPriceRange, setSelectedPriceRange] = React.useState<
    [number, number]
  >([0, 1000]);
  const PRICE_STEP = 50;
  const filterChangeDebounceRef = useRef<number | null>(null);
  const timeRefs = useRef<Record<string, HTMLInputElement | null>>({});
  
  // Sort dropdown state
  const [sortBy, setSortBy] = useState<string>("lowest_price");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

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
      logo: `/airlines/${seg.marketingAirline}.png`,
      name: seg.marketingAirline,
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
        start_time_iso: seg.departureDateTime,
        end_time_iso: seg.arrivalDateTime,
      },
      stop: journeyItem?.stops || [],
      rawSegment: seg,
    };
  };

  const logoFromFlightSegment = (seg: any) =>
    seg ? `/airlines/${seg.marketingAirline}.png` : "";

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
    searchFilters: { maxConnections?: number } = {},
  ) => {
    const validationError = validateSearchFields();
    if (validationError) {
      setSearchError(validationError);
      setHasSearched(true);
      setIsSearching(false);
      return;
    }
    // const sortedPrice = typeof searchFilters.priceId !== "undefined" ? searchFilters.priceId : selectedPriceId;
    const sortedMaxConnections =
      typeof searchFilters.maxConnections !== "undefined"
        ? searchFilters.maxConnections
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
      setResponseData(oneWayFormatted);
      setRoundResponseData(roundFormatted);
      setMulticityResponseData(trip === "multicity" ? multiCityFormatted : []);
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

      const minFare = fares.length ? Math.min(...fares) : 0;
      const maxFare = fares.length ? Math.max(...fares) : 1000;
      const roundedMax = Math.ceil(maxFare / PRICE_STEP) * PRICE_STEP;
      const roundedMin = Math.floor(minFare / PRICE_STEP) * PRICE_STEP;
      setPriceRangeBounds([roundedMin, roundedMax]);
      setSelectedPriceRange([roundedMin, roundedMax]);

      const anyHasMore = (raw || []).some(
        (it: any) => !!it?.detail?.moreFaresAvailable,
      );
      // console.log("anyHasMore", anyHasMore, (raw.length > 0 && anyHasMore));
      setHasMore(raw.length > 0 && anyHasMore);
      // setHasMore(raw.length > 0);
      setIoReady(true);
      // Clear flight store after first successful search to prevent auto-trigger on tab changes
      clearFlight();
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

      // append only unique items
      setResponseData((prev) =>
        appendUniqueItemsForLoadMoreFlights(prev, oneWayFormatted),
      );
      setRoundResponseData((prev) =>
        appendUniqueItemsForLoadMoreFlights(prev, roundFormatted),
      );
      setMulticityResponseData((prev) =>
        appendUniqueItemsForLoadMoreFlights(prev, multiCityFormatted),
      );

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

  const [countriesSearchTerm, setCountriesSearchTerm] = useState<string>("");

  const {
    flightTypes,
    countries,
    passengers,
    cabinClasses,
    // priceSort,
    numberStops,
    transitHours,
    baggage,
    airline,
    loading,
    loadingMap,
    countriesHasMore,
    countriesFetchNext,
    countriesIsFetchingNext,
  } = useMasterListings({
    include: [
      "flightTypes",
      "countries",
      "passengers",
      "cabinClasses",
      "priceSort",
      "numberStops",
      "transitHours",
      "baggage",
      "airline",
    ],
    countriesSearchTerm,
  });

  const isInitialLoading =
    !countriesSearchTerm.trim() &&
    loading &&
    (!countries || countries.length === 0);
  const countriesLoading = loadingMap?.countries ?? isInitialLoading;

  // Preserve full airport options (with labels) for display after clearFlight()
  const [preservedFromOption, setPreservedFromOption] =
    useState<AirportOption | null>(null);
  const [preservedToOption, setPreservedToOption] =
    useState<AirportOption | null>(null);

  const countriesForPicker = useMemo(() => {
    const base = (countries as AirportOption[]) || [];

    // When user is searching, show only API search results (e.g. "duba" → only Dubai options)
    if (countriesSearchTerm.trim()) {
      return base;
    }

    const merged: AirportOption[] = [];
    const addUnique = (opt: AirportOption | null | undefined) => {
      if (!opt?.code) return;
      if (merged.some((x) => x.code === opt.code)) return;
      merged.push(opt);
    };

    // No search: keep hero/store or preserved options so they stay in the list
    addUnique((flight?.fromOption ?? preservedFromOption) as AirportOption);
    addUnique((flight?.toOption ?? preservedToOption) as AirportOption);

    for (const c of base) addUnique(c);
    return merged;
  }, [
    countries,
    countriesSearchTerm,
    flight?.fromOption,
    flight?.toOption,
    preservedFromOption,
    preservedToOption,
  ]);

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
  useEffect(() => {
    if (!flight) return;
    if (isInitialLoading) return;

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
    setHasMore(false);
    setIoReady(false);
    setHasSearched(false);
    setSearchError(null);
    lastRequestRef.current = null;
    shouldAutoSearchRef.current = true;

    const timeoutId = window.setTimeout(() => {
      isHydratingFromStore.current = false;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [flight, isInitialLoading]);

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
    setHasSearched(false);
    setHasMore(false);
    setIoReady(false);
    setSearchError(null);
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

  // memo’d options
  const segOptions = useMemo(
    () => (flightTypes || []).map((ft) => ({ label: ft.label, value: ft.key })),
    [flightTypes],
  );

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
  ) {
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

    const finalOneWay = applyPrice(filteredOneWay);
    const finalRound = applyPrice(filteredRound);

    setResponseData(finalOneWay);
    setRoundResponseData(finalRound);
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
    { value: "highest_price", label: "Highest price" },
    { value: "shortest_duration", label: "Shortest duration" },
    { value: "earliest_departure", label: "Earliest departure" },
  ];

  const getSortLabel = (value: string) => {
    return sortOptions.find(opt => opt.value === value)?.label || "Lowest price";
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setIsSortDropdownOpen(false);
    
    // Sort the response data based on selection
    const sortData = (data: any[]) => {
      const sorted = [...data];
      switch (value) {
        case "lowest_price":
          return sorted.sort((a, b) => (a.price?.totalPrice || 0) - (b.price?.totalPrice || 0));
        case "highest_price":
          return sorted.sort((a, b) => (b.price?.totalPrice || 0) - (a.price?.totalPrice || 0));
        case "shortest_duration":
          return sorted.sort((a, b) => (a.totalDuration || 0) - (b.totalDuration || 0));
        case "earliest_departure":
          return sorted.sort((a, b) => {
            const timeA = a.segments?.[0]?.departureTime || "";
            const timeB = b.segments?.[0]?.departureTime || "";
            return timeA.localeCompare(timeB);
          });
        default:
          return sorted;
      }
    };

    if (responseData.length > 0) {
      setResponseData(sortData(responseData));
    }
    if (roundResponseData.length > 0) {
      setRoundResponseData(sortData(roundResponseData));
    }
  };

  const headerContent = (
    <div style={{ position: 'relative', width: '280px' }}>
      <div 
        onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
        style={{ 
          width: '280px',
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
        <span style={{ fontSize: 12, fontWeight: 400, color: '#64748B', display: 'block', marginBottom: '4px' }}>
        Sort by
        </span>
        <span style={{ fontSize: 16, fontWeight: 500, color: '#0F172A', display: 'block' }}>
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
          width: '280px',
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
                fontWeight: sortBy === option.value ? 600 : 400,
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
    setDepartDate("");
    setReturnDate("");
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

  const openTimePicker = (key: string) => {
    timeRefs.current[key]?.showPicker?.() || timeRefs.current[key]?.click();
  };

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
      <div className="topHeaderSetting">
        <div className="topHeaderSettingInner" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* <div className="topHeaderTabs">
            <Tabs
              defaultActiveKey="1"
              className="customIndicate"
              items={items}
              onChange={onChange}
              tabBarStyle={{ marginBottom: "16px !important" }}
            />
          </div> */}
          <div className="countrySelectAndGetHelp py-pxTopHeader" style={{ display: 'none' }}>
            {/* <div>
              <Select
                className="countrySelectBox"
                defaultValue="US"
                style={{
                  width: 100,
                  borderRadius: 12,
                  height: 44,
                }}
                onChange={handleChange}
                options={[
                  {
                    value: "US",
                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontWeight: 500,
                        }}
                      >
                        <img
                          src={FlagUsa}
                          alt="US Flag"
                          style={{ width: 28, height: 28, marginRight: 0 }}
                        />
                        US
                      </span>
                    ),
                  },

                  {
                    value: "UAE",
                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontWeight: 500,
                        }}
                      >
                        <img
                          src={FlagUae}
                          alt="UAE Flag"
                          style={{ width: 28, height: 28, marginRight: 0 }}
                        />
                        UAE
                      </span>
                    ),
                  },
                  {
                    value: "Ind",
                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontWeight: 500,
                        }}
                      >
                        <img
                          src={FlagInd}
                          alt="IND Flag"
                          style={{ width: 28, height: 28, marginRight: 0 }}
                        />
                        IND
                      </span>
                    ),
                  },
                ]}
              />
            </div>
            <div className="smalSeparater">
              <img src={colSeparater} alt="" style={{ width: 1, height: 30 }} />
            </div>

            <div className="getHelpLink">
              <a href="#">Get help</a>
            </div> */}
          </div>
        </div>
      </div>

      <div className="flightDetailTemplateWrap">
        <div className="bottomHeaderSetting">
          {trip === "multicity" ? (
            <>
              {/* First Row: Trip and Passengers */}
          <Flex className="bottomHeaderFlex">
                <Flex vertical style={{ width: "100%", maxWidth: 250 }}>
                  <label className="header-labels-common">Trip</label>
                  <SearchableDropdown
                    options={segOptions.map((option) => ({
                      id: option.value,
                      value: option.value,
                      label: option.label,
                      disabled: false,
                    }))}
                    value={trip}
                    onChange={(value) => setTrip(value as TripType)}
                    placeholder="Select trip type"
                    widthClass="w-full"
                    searchPlaceholder="Search trip type..."
                  />
                </Flex>

                <Flex vertical style={{ width: "100%", maxWidth: 250 }}>
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
              </Flex>

              {/* ===== SECTION 2: FLIGHT LEGS (CENTERED) — each row: From/To, Cabin, Date ===== */}
              {multicityLegs.map((leg, idx) => (
                <div key={idx} className="relative">
                  <Flex
                    align="center"
                    justify="center"
                    gap="middle"
                    wrap="wrap"
                  >
                    <Flex
                      align="flex-end"
                      gap="small"
                      style={{
                        flex: 1,
                        minWidth: 280,
                        maxWidth: 620,
                      }}
                    >
                      <TravelRoutePicker
                        options={countriesForPicker as AirportOption[]}
                        loading={countriesLoading}
                        onSearchChange={setCountriesSearchTerm}
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
                        widthClass="w-[280px]"
                      />
                    </Flex>

                    <Flex align="flex-end" gap="small">
                      <Flex vertical style={{ width: "100%", maxWidth: 220 }}>
                        <label className="header-labels-common">
                          Departure Date
                        </label>
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
                      </Flex>
                    </Flex>

                    <Flex vertical style={{ width: "100%", maxWidth: 220 }}>
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
                    </Flex>
                  </Flex>
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

              {/* ===== SECTION 3: ADD ANOTHER STOP BUTTON (CENTERED) ===== */}
              <Flex align="center" justify="center" className="mt-2">
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-[14px] font-medium text-[#2351A3] hover:underline"
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
              </Flex>

              {/* ===== SECTION 4: SEARCH BUTTON (BOTTOM CENTER) ===== */}
              <Flex align="center" justify="center" className="mt-4">
                <CustomButton
                  className="searchFilterBtn"
                  onClick={() => handleSearch()}
                  style={{ minWidth: "200px" }} // Minimum width for better appearance
                >
                  {isPending ? "Searching..." : "Search"}
                </CustomButton>
              </Flex>
            </>
          ) : (
            <Flex className="bottomHeaderFlex">
              {/* Trip Type Dropdown */}
              <Flex vertical style={{ width: "100%", maxWidth: 250 }}>
                <label className="header-labels-common">Trip</label>
                <SearchableDropdown
                  options={segOptions.map((option) => ({
                    id: option.value,
                    value: option.value,
                    label: option.label,
                    disabled: false,
                  }))}
                  value={trip}
                  onChange={(value) => setTrip(value as TripType)}
                  placeholder="Select trip type"
                  widthClass="w-full"
                  searchPlaceholder="Search trip type..."
                />
              </Flex>

              {/* Cabin Class Dropdown */}
              <Flex vertical style={{ width: "100%", maxWidth: 250 }}>
                <label className="header-labels-common">Cabin Class</label>
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
              </Flex>

              {/* From/To Picker */}
            <TravelRoutePicker
              options={countriesForPicker as AirportOption[]}
              loading={countriesLoading}
              onSearchChange={setCountriesSearchTerm}
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
              fromError={
                !loading && countries.length === 0
                  ? "Please try a different search."
                  : undefined
              }
              toError={
                !loading && countries.length === 0
                  ? "Please try a different search."
                  : undefined
              }
              onLoadMore={() => {
                if (countriesHasMore) {
                  countriesFetchNext?.();
                }
              }}
              hasMore={countriesHasMore}
              loadingMore={countriesIsFetchingNext}
            />
          </Flex>
          )}
          <Flex className="bottomHeaderFlex">
            {trip !== "multicity" && (
            <Flex vertical style={{ width: "100%", maxWidth: 250 }}>
              <label className="header-labels-common ">Departure Date</label>
              <TailiwindCustomDatePicker
                value={departDate ? new Date(departDate) : null}
                onChange={(value) => {
                  handleDate(value, "depart");
                }}
                placeholder="Select departure date"
                tooltip="Select departure date"
                buttonIconSrc={true}
                disablePastDates={true}
              />
            </Flex>
            )}
            {trip === "roundtrip" && (
              <Flex vertical style={{ width: "100%", maxWidth: 250 }}>
                <label className="header-labels-common ">Return Date</label>
                <TailiwindCustomDatePicker
                  value={returnDate ? new Date(returnDate) : null}
                  onChange={(value) => {
                    handleDate(value, "return");
                  }}
                  placeholder="Select return date"
                  tooltip="Select return date"
                  buttonIconSrc={true}
                  disablePastDates={true}
                  minDate={departDate ? new Date(departDate) : null}
                />
              </Flex>
            )}
            {trip !== "multicity" && (
            <Flex vertical style={{ width: "100%", maxWidth: 250 }}>
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
                  onChange={(value) => {
                    handlePassenger(value);
                  }}
                />
              </div>
            </Flex>
            )}
            {trip !== "multicity" && (
          <CustomButton
            className="searchFilterBtn"
            onClick={() => handleSearch()}
          >
                {isPending ? "Searching..." : "Search"}
          </CustomButton>
            )}
          </Flex>
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
                baggageHandler={baggageHandler}
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
                openTimePicker={openTimePicker}
                timeRefs={timeRefs}
                airline={airline}
                selectedAirlineIds={selectedAirlineIds}
                onAirlineToggle={(code, checked) =>
                  handleAirlineToggle(code, checked)
                }
                onReset={() => {
                  setSelectedAirlineIds([]);
                  setSelectedMaxConnections(0);
                  setDepartureFlightRange({ start: "", end: "" });
                  setArrivalFlightRange({ start: "", end: "" });
                  setSelectedPriceRange(priceRangeBounds);
                  setSelectedTransitRange(null);
                  applyFlightSearchFilters(
                    { start: "", end: "" },
                    { start: "", end: "" },
                    [],
                    priceRangeBounds,
                    null,
                  );
                }}
              />
            </Drawer>
          </div>
        )}

        <div className="contentWrapFlex" style={{ padding: '0 clamp(12px, 5vw, 25px)' }}>
          {screens.lg && (
            <div className="flightDetailFilter">
              <FlightSearchFilter
                loading={isInitialLoading}
                headerContent={headerContent}
                priceRangeBounds={priceRangeBounds}
                selectedPriceRange={selectedPriceRange}
                priceStep={PRICE_STEP}
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
                baggageHandler={baggageHandler}
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
                openTimePicker={openTimePicker}
                timeRefs={timeRefs}
                airline={airline}
                selectedAirlineIds={selectedAirlineIds}
                onAirlineToggle={(code, checked) =>
                  handleAirlineToggle(code, checked)
                }
                onReset={() => {
                  setSelectedAirlineIds([]);
                  setSelectedMaxConnections(0);
                  setDepartureFlightRange({ start: "", end: "" });
                  setArrivalFlightRange({ start: "", end: "" });
                  setSelectedPriceRange(priceRangeBounds);
                  setSelectedTransitRange(null);
                  applyFlightSearchFilters(
                    { start: "", end: "" },
                    { start: "", end: "" },
                    [],
                    priceRangeBounds,
                    null,
                  );
                }}
              />
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
