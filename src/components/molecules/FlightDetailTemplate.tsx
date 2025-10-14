import React, { useEffect, useMemo, useRef } from "react";

import alraisLogo from "../../assets/images/alraisLogo.png";
import planeImg from "../../assets/images/travel_plane_image.png";
import "../../assets/css/travel.css";
import FlagUae from "../../assets/svgs/Flag-uae.svg";
import FlagInd from "../../assets/svgs/Flag-ind.svg";
import FlagUsa from "../../assets/svgs/Flag-usa.svg";
import colSeparater from "../../assets/svgs/Lineseparater.svg";
import noFlights from "../../assets/svgs/no-flights.svg";
import {
  Segmented,
  Tabs,
  Select,
  Radio,
  Checkbox,
  Flex,
  Drawer,
  Button,
  Grid,
  Slider,
} from "antd";
// import type { CheckboxGroupProps } from "antd/es/checkbox";
import CustomButton from "../common/CustomButton";
import CustomSelect from "../common/CustomSelect";
import CustomDatePicker from "../common/CustomDatePicker";
import CustomCollapse from "../common/CustomCollapse";
import TravelOneWay from "./TravelOneWay";
import TravelRoundTrip from "./TravelRoundTrip";
import TravelMultiCity from "./TravelMultiCity";
import { Collapse } from "antd";
import type { TabsProps } from "antd";
import { useState } from "react";
import type { CheckboxProps } from "antd";
import { useMasterListings } from "../../hooks/masterListings/useMasterListings";
import { FilterOutlined } from "@ant-design/icons";

import PassengerCounterDropdown from "../atoms/PassengerCounterDropdown";
import type {
  CountryOption,
  PassengerSchema,
  CabinClassOption,
  TripType,
} from "../../features/flights/types";
import TravelRoutePicker from "../atoms/TravelRoutePicker";
import Loader from "../atoms/Loader";
// import { useFlightStore } from "../../store/UseFlightStore";
// import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";

import { useFlightSearch } from "../../hooks/useFlightSearch";
import { useLoadMoreFlights } from "../../hooks/useLoadMoreFlights";
import type { FlightSearchRequest } from "../../services/api/flightSearch";
import { buildFlightSearchPriceOptions } from "../../utils/flightPriceOptionsUtils";
import { buildFilterPreferenceForFlightSearchRequest, formatDate, formatTime, timeToMinutesFromAnyString } from "../../utils/helpers";
import { filterFlightsByTimeAndAirlines } from "../../utils/flightFilters";

const { Panel } = Collapse;

const onChange = (key: string) => {
  console.log(key);
};
const handleChange = (value: string) => {
  console.log(`selected ${value}`);
};

const items: TabsProps["items"] = [
  { key: "1", label: "Flights", children: "" },
  { key: "2", label: "Hotels", children: "" },
];

const baggageHandler: CheckboxProps["onChange"] = (e) => {
  console.log(`checked = ${e.target.checked}`);
};

const buildPassengersArrayForFlightSearch = (order: string[], schema: PassengerSchema, paxState: any) => {
  const keyToPtc = new Map((schema || []).map((s: any) => [s.key, s.ptc]));
  const arr: { id: string; ptc: string }[] = [];
  let idCounter = 1;

  for (const key of order) {
    const ptc = keyToPtc.get(key) ?? "ADT";
    arr.push({ id: String(idCounter++), ptc });
  }
  const totalCounts = Object.values(paxState || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
  if (arr.length !== totalCounts) {
    const fallback: { id: string; ptc: string }[] = [];
    let idx = 1;
    for (const s of schema || []) {
      const cnt = paxState?.[s.key] ?? 0;
      for (let i = 0; i < cnt; i++) fallback.push({ id: String(idx++), ptc: s.ptc });
    }
    return fallback;
  }

  return arr;
};

// type Align = "One way" | "Round trip" | "Multi-city";

const FlightDetailTemplate: React.FC = () => {
  // const [alignValue, setAlignValue] = useState<Align>("One way");

  const { mutateAsync, isPending } = useFlightSearch();
  const { loadMoreAsync, isLoadingMore } = useLoadMoreFlights();

  const [responseData, setResponseData] = useState<any[]>([]);
  const [roundResponseData, setRoundResponseData] = useState<any[]>([]);
  const originalResponseRef = useRef<any[]>([]);
  const originalRoundResponseRef = useRef<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [paxCounts, setPaxCounts] = useState<any>({});
  const passengerRequestOrder = useRef<string[]>([]);
  const lastRequestRef = useRef<FlightSearchRequest | null>(null);
  const [departDate, setDepartDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [ioReady, setIoReady] = useState(false);

  const [hasSearched, setHasSearched] = useState(false);
  const [selectedMaxConnections, setSelectedMaxConnections] = useState<number>(0);
  const [departureFlightRange, setDepartureFlightRange] = useState({ start: "", end: "" });
  const [arrivalFlightRange, setArrivalFlightRange] = useState({ start: "", end: "" });
  const [selectedAirlineIds, setSelectedAirlineIds] = useState<string[]>([]);
  const [priceRangeBounds, setPriceRangeBounds] = React.useState<[number, number]>([0, 1000]);
  const [selectedPriceRange, setSelectedPriceRange] = React.useState<[number, number]>([0, 1000]);
  const PRICE_STEP = 50;
  const filterChangeDebounceRef = useRef<number | null>(null);
  const timeRefs = useRef<Record<string, HTMLInputElement | null>>({});


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

    if (which === "depart") setDepartDate(formatted);
    else setReturnDate(formatted);
  };

  const handlePassenger = (passanger: any) => {
    const prev = paxCounts || {};
    const next = passanger || {};

    const schemaKeys = (passengers as any[] || []).map((s) => s.key);
    const keys = Array.from(new Set([...Object.keys(prev), ...Object.keys(next), ...schemaKeys]));

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

  const logoFromFlightSegment = (seg: any) => (seg ? `/airlines/${seg.marketingAirline}.png` : "");

  const mapFlightRawResponseToFormats = (item: any, idx: number) => {
    const journeys = item?.journey || [];
    const seg0 = journeys[0]?.flightSegments?.[0] ?? null;
    const seg1 = journeys[1]?.flightSegments?.[0] ?? null;

    const outbound = formatFlightSegmentForTrips(seg0, journeys[0]);
    const inbound = formatFlightSegmentForTrips(seg1, journeys[1]); // may be null

    const priceOptions = buildFlightSearchPriceOptions(item);

    const oneWayId = outbound?.id ?? `offer-${idx}-${item?.offerId ?? ""}`;
    const oneWayObj = {
      id: oneWayId,
      offerId: item?.offerId,
      logo:
        outbound?.logo ??
        logoFromFlightSegment(outbound?.rawSegment) ??
        logoFromFlightSegment(item?.journey?.[0]?.flightSegments?.[0]),
      name: outbound?.name ?? item?.offerId ?? oneWayId,
      flight_detail: outbound?.flight_detail ?? null,
      stop: outbound?.stop ?? [],
      rawTotalStartingFare: item?.fare?.totalFare,
      // price: { economyLite: { price: item?.fare?.totalFare } },
      price: priceOptions,
      raw: item,
    };

    const roundId = item?.offerId ?? outbound?.id ?? `offer-${idx}-${item?.offerId ?? ""}`;
    const roundObj = {
      id: roundId,
      offerId: item?.offerId,
      outbound: outbound ? { ...outbound, logo: outbound?.logo ?? logoFromFlightSegment(outbound?.rawSegment) } : null,
      inbound: inbound ? { ...inbound, logo: inbound?.logo ?? logoFromFlightSegment(inbound?.rawSegment) } : null,
      // price: { economyLite: { price: item?.fare?.totalFare } },
      price: priceOptions,
      rawTotalStartingFare: item?.fare?.totalFare ?? null,
      raw: item,
    };

    return { oneWayObj, roundObj };
  };

  const processFLightSearchResults = (raw: any[] = []) => {
    const oneWayFormatted: any[] = [];
    const roundFormatted: any[] = [];

    for (const [idx, item] of (raw || []).entries()) {
      const { oneWayObj, roundObj } = mapFlightRawResponseToFormats(item, idx);
      oneWayFormatted.push(oneWayObj);
      roundFormatted.push(roundObj);
    }

    return { oneWayFormatted, roundFormatted };
  };

  const appendUniqueItemsForLoadMoreFlights = (prevArray: any[], newArray: any[]) => {
    const existing = new Set(prevArray.map((p) => p.id));
    const toAdd = newArray.filter((n) => !existing.has(n.id));
    return toAdd.length ? [...prevArray, ...toAdd] : prevArray;
  };

  const handleSearch = async (searchFilters: { maxConnections?: number } = {}) => {
    // const sortedPrice = typeof searchFilters.priceId !== "undefined" ? searchFilters.priceId : selectedPriceId;
    const sortedMaxConnections =
      typeof searchFilters.maxConnections !== "undefined" ? searchFilters.maxConnections : (selectedMaxConnections ?? 0);

    const passengersForRequest = buildPassengersArrayForFlightSearch(passengerRequestOrder.current, passengers as PassengerSchema, paxCounts);
    const flightSegments: any[] = [
      {
        // departureAirportCode: fromCode,
        departureAirportCode: "DXB",
        departureDate: departDate,
        // arrivalAirportCode: toCode,
        arrivalAirportCode: "DEL",
        cabinPreferences: [selectedCabinClassId]
      }
    ];
    if (trip === "roundtrip") {
      flightSegments.push({
        departureAirportCode: "DEL",
        // departureAirportCode: toCode,
        departureDate: returnDate,
        // arrivalAirportCode: fromCode,
        arrivalAirportCode: "DXB",
        cabinPreferences: [selectedCabinClassId]
      });
    }

    const baseBody: any = { flightSegments, passengers: passengersForRequest };
    const searchFilterObj = buildFilterPreferenceForFlightSearchRequest(Number(sortedMaxConnections ?? 0));
    // const searchFilterObj = buildFilterPreferenceForFlightSearchRequest(sortedPrice, Number(sortedMaxConnections ?? 0));
    const requestBody = searchFilterObj ? { ...baseBody, ...searchFilterObj } : baseBody;

    lastRequestRef.current = requestBody;
    // setHasMore(true);
    setResponseData([]);
    setRoundResponseData([]);
    setHasSearched(false);

    try {
      const response = await mutateAsync(requestBody);
      const raw = response.data || [];

      const { oneWayFormatted, roundFormatted } = processFLightSearchResults(raw);

      originalResponseRef.current = oneWayFormatted;
      originalRoundResponseRef.current = roundFormatted;
      setResponseData(oneWayFormatted);
      setRoundResponseData(roundFormatted);

      const fares: number[] = [
        ...oneWayFormatted.map(it => Number(it?.rawTotalStartingFare ?? it?.raw?.fare?.totalFare ?? NaN)),
        ...roundFormatted.map(it => Number(it?.rawTotalStartingFare ?? it?.raw?.fare?.totalFare ?? NaN)),
      ].filter(n => !Number.isNaN(n) && isFinite(n));

      const minFare = fares.length ? Math.min(...fares) : 0;
      const maxFare = fares.length ? Math.max(...fares) : 1000;
      const roundedMax = Math.ceil(maxFare / PRICE_STEP) * PRICE_STEP;
      const roundedMin = Math.floor(minFare / PRICE_STEP) * PRICE_STEP;
      setPriceRangeBounds([roundedMin, roundedMax]);
      setSelectedPriceRange([roundedMin, roundedMax]);

      const anyHasMore = (raw || []).some((it: any) => !!it?.detail?.moreFaresAvailable);
      // console.log("anyHasMore", anyHasMore, (raw.length > 0 && anyHasMore));
      setHasMore(raw.length > 0 && anyHasMore);
      // setHasMore(raw.length > 0);
      setIoReady(true);
    } catch (error) {
      console.error("Flight search failed:", error);
      setHasMore(false);
    } finally {
      setHasSearched(true);
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

      const { oneWayFormatted, roundFormatted } = processFLightSearchResults(raw);

      // append only unique items
      setResponseData((prev) => appendUniqueItemsForLoadMoreFlights(prev, oneWayFormatted));
      setRoundResponseData((prev) => appendUniqueItemsForLoadMoreFlights(prev, roundFormatted));

      const anyHasMore = (raw || []).some((it: any) => !!it?.detail?.moreFaresAvailable);
      setHasMore(raw.length > 0 && anyHasMore);
      // setHasMore(raw.length > 0);
      setIoReady(true);
    } catch (e) {
      console.error("Load more failed:", e);
      setHasMore(false);
    }
  };



  const {
    flightTypes,
    countries,
    passengers,
    cabinClasses,
    priceSort,
    numberStops,
    transitHours,
    baggage,
    airline,
    loading,
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
  });

  const { useBreakpoint } = Grid;

  const [trip, setTrip] = useState<TripType>("oneway");
  const [fromCode, setFromCode] = useState<string>("");
  const [toCode, setToCode] = useState<string>("");
  const [selectedCabinClassId, setSelectedCabinClassId] = useState<string>("");
  const [selectedPriceId, setSelectedPriceId] = useState<string>("");

  // const [showFilters, setShowFilters] = useState(false);

  const [open, setOpen] = useState(false);
  const screens = useBreakpoint(); // responsive breakpoints

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  useEffect(() => {
    if (!fromCode && (countries as CountryOption[])[0]) {
      setFromCode((countries as CountryOption[])[0].code);
    }
    if (!toCode && (countries as CountryOption[])[1]) {
      setToCode((countries as CountryOption[])[1].code);
    }
  }, [countries, fromCode, toCode]);

  useEffect(() => {
    if (fromCode && toCode && fromCode === toCode) {
      setToCode(""); // invalid combo ko turant clear
    }
  }, [fromCode, toCode]);

  // memo’d options
  const segOptions = useMemo(
    () => (flightTypes || []).map((ft) => ({ label: ft.label, value: ft.key })),
    [flightTypes]
  );

  const cabinSelectOptions = useMemo(
    () => [
      { value: "", label: "Please select", disabled: true },
      ...(cabinClasses as CabinClassOption[]).map((c) => ({
        value: c.id,
        label: c.label,
      })),
    ],
    [cabinClasses]
  );

  const filterSortPriceOptions = useMemo(
    () =>
      (priceSort && priceSort.length
        ? priceSort
        : []) as { value: string; label: string }[],
    [priceSort]
  );
  const selectedPriceLabel = useMemo(
    () => filterSortPriceOptions.find((o) => o.value === selectedPriceId)?.label ?? "",
    [filterSortPriceOptions, selectedPriceId]
  );

  const handleAirlineToggle = (airlineCode: string, checked: boolean) => {
    const code = String(airlineCode || "").trim().toUpperCase();
    const next = checked ? Array.from(new Set([...selectedAirlineIds, code])) : selectedAirlineIds.filter((c) => c !== code);
    setSelectedAirlineIds(next);
    handleSearchFiltersChange({ selectedAirlines: next });
  };

  const handleSearchFiltersChange = (changes: {
    // priceId?: string | null;
    priceRange?: [number, number] | null;
    maxConnections?: number | null;
    departureFlightRange?: { start?: string, end?: string };
    arrivalFlightRange?: { start?: string, end?: string };
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
        typeof changes.selectedAirlines !== "undefined" ? changes.selectedAirlines : selectedAirlineIds,
        newRange,
      );

      return;
    }


    // if (typeof changes.priceId !== "undefined") {
    //   setSelectedPriceId(changes.priceId ?? "");
    // }

    if (typeof changes.maxConnections !== "undefined") {
      setSelectedMaxConnections(changes.maxConnections ?? 0);
    }

    if (filterChangeDebounceRef.current) {
      window.clearTimeout(filterChangeDebounceRef.current);
    }

    filterChangeDebounceRef.current = window.setTimeout(() => {
      handleSearch({
        // priceId: changes.priceId ?? undefined,
        maxConnections: typeof changes.maxConnections !== "undefined" ? Number(changes.maxConnections) : undefined,
      });
    }, 300);
  };

  function applyFlightSearchFilters(
    depRange?: { start?: string; end?: string } | null,
    arrRange?: { start?: string; end?: string } | null,
    selectedAirlinesParam?: string[] | null,
    priceRange?: [number, number] | null
  ) {
    const { filteredOneWay, filteredRound } = filterFlightsByTimeAndAirlines(
      originalResponseRef.current ?? [],
      originalRoundResponseRef.current ?? [],
      depRange ?? null,
      arrRange ?? null,
      selectedAirlinesParam ?? selectedAirlineIds ?? null,
      timeToMinutesFromAnyString,
      { matchAllSegments: false } // default behavior
    );

    const applyPrice = (list: any[]) => {
      if (!priceRange) return list.slice();
      const [minP, maxP] = priceRange;
      return (list || []).filter((it) => {
        const fare = Number(it?.rawTotalStartingFare ?? it?.raw?.fare?.totalFare ?? NaN);
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
      }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [ioReady, hasMore, isLoadingMore]);

  // const { flight } = useFlightStore();
  // const { cabinClasses } = useMasterListings();

  const headerContent = (
    <div>
      <div style={{ fontSize: 12, fontWeight: 400, color: "#3D495C" }}>
        Sort by
      </div>
      {selectedPriceLabel && (
        <div style={{ fontSize: 16, fontWeight: 500 }}>
          {selectedPriceLabel}
        </div>
      )}
    </div>
  );

  const renderLoadMoreApiLoader = (state: { isLoadingMore?: boolean; hasMore?: boolean }) => {
    if (state.isLoadingMore) {
      return (
        <div className="py-4 flex flex-col items-center justify-center" role="status" aria-live="polite">
          <div
            className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[##2351A3] animate-spin"
            style={{ borderTopColor: "#2351A3" }}
          />
          <div className="mt-2 text-sm text-gray-600">Loading more flights…</div>
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
        <p className="mt-2 text-[14px] text-[#0F172A]">No flights found for your route and specifications.</p>
        <p className="mt-2 text-[14px] text-[#3D495C]">
          Try searching again.
        </p>
      </div>
    ) : null
  }

  useEffect(() => {
    setResponseData([]);
    setRoundResponseData([]);
    setHasMore(false);
    setIoReady(false);
    setHasSearched(false);
    lastRequestRef.current = null;
  }, [trip]);

  const openTimePicker = (key: string) => {
    timeRefs.current[key]?.showPicker?.() || timeRefs.current[key]?.click();
  };

  return (
    <div className="">
      <Loader show={loading} />
      <Loader show={isPending} label="Please wait while we are looking for available flights" />
      <div className="topHeaderSetting">
        <div className="topHeaderSettingInner">
          <div className="tadioButtonGroupWrap py-pxTopHeader">
            <div className="radioButtonGroup">
              <Segmented
                value={trip}
                style={{ marginBottom: 0 }}
                onChange={(v) => setTrip(v as TripType)}
                options={
                  segOptions.length
                    ? segOptions
                    : [
                      { label: "One way", value: "oneway" },
                      { label: "Round trip", value: "roundtrip" },
                      { label: "Multi-city", value: "multicity" },
                    ]
                }
                disabled={loading && !segOptions.length}
              />
            </div>
          </div>
          <div className="topHeaderTabs">
            <Tabs
              defaultActiveKey="1"
              className="customIndicate"
              items={items}
              onChange={onChange}
              tabBarStyle={{ marginBottom: "16px !important" }}
            // indicator={{ size: (origin) => origin - 20, align: alignValue }}
            />
          </div>
          <div className="countrySelectAndGetHelp py-pxTopHeader">
            <div>
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
            </div>
          </div>
        </div>
      </div>

      <div className="flightDetailTemplateWrap">
        <div className="bottomHeaderSetting">
          <Flex className="bottomHeaderFlex">
            <TravelRoutePicker
              options={countries as CountryOption[]}
              loading={loading}
              value={{ fromCode, toCode }}
              onChange={({ fromCode: f, toCode: t }) => {
                setFromCode(f);
                setToCode(t);
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
            />
          </Flex>
          <Flex className="bottomHeaderFlex">
            <Flex vertical style={{ width: "100%", maxWidth: 250 }}>
              <label className="header-labels-common ">Departure Date</label>
              <CustomDatePicker
                format={"dddd, DD MMM YYYY "}
                style={{ width: "100%", height: 44 }}
                className="header-input-common ant-input-select"
                onChange={(value) => {
                  handleDate(value, "depart");
                }}
              />
            </Flex>
            {trip === 'roundtrip' && (
              <Flex vertical style={{ width: "100%", maxWidth: 250 }}>
                <label className="header-labels-common ">Arrival Date</label>
                <CustomDatePicker
                  format={"dddd, DD MMM YYYY "}
                  style={{ width: "100%", height: 44 }}
                  className="header-input-common ant-input-select"
                  onChange={(value) => {
                    handleDate(value, "return");
                  }}
                />
              </Flex>
            )}
            <Flex vertical style={{ width: "100%", maxWidth: 250 }}>
              <label className="header-labels-common ">Passengers</label>
              <div style={{ minWidth: "100%", height: 44 }}>
                <PassengerCounterDropdown
                  schema={passengers as PassengerSchema}
                  maxTotal={9}
                  onChange={(value) => {
                    handlePassenger(value);
                  }}
                />
              </div>
            </Flex>
            <Flex vertical style={{ width: "100%", maxWidth: 250 }}>
              <label className="header-labels-common ">Cabin Class</label>
              <CustomSelect
                placeholder={loading ? "Loading…" : "Please select"}
                options={cabinSelectOptions}
                className="header-sub-inputs-common"
                style={{ minWidth: "100%", height: 44 }}
                // value={findedCabine}
                value={selectedCabinClassId || undefined}
                onChange={(v: string) => setSelectedCabinClassId(v)}
                disabled={loading}
              />
            </Flex>
          </Flex>
          <CustomButton className="searchFilterBtn" onClick={() => handleSearch()}>
            {isPending ? "Searching..." : "Search flights"}
          </CustomButton>
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
              {/* <button
              className="filterToggleBtn"
              onClick={() => setShowFilters(!showFilters)}
            > */}
              {/* <FilterOutlined />
            </button> */}
              <div className="filterSectionStyle">
                <div className="">
                  <CustomCollapse>
                    <Panel header={headerContent} key="1">
                      <Slider
                        range
                        defaultValue={[priceRangeBounds[0], priceRangeBounds[1]]}
                        aria-label="price-range-slider"
                        min={priceRangeBounds[0]}
                        max={priceRangeBounds[1]}
                        step={PRICE_STEP}
                        value={selectedPriceRange}
                        onChange={(val) => {
                          const next = val as [number, number];
                          setSelectedPriceRange(next);
                          applyFlightSearchFilters(
                            departureFlightRange,
                            arrivalFlightRange,
                            selectedAirlineIds,
                            next,
                          );
                        }}
                      />
                      {/* <Select
                        style={{ width: "100%" }}
                        placeholder="Select an option"
                        value={selectedPriceId || undefined}
                        // onChange={(value) => setSelectedPriceId(value)}
                        onChange={(value) => handleSearchFiltersChange({ priceId: value })}
                        options={filterSortPriceOptions}
                        disabled={loading && !filterSortPriceOptions.length}
                      /> */}
                    </Panel>
                  </CustomCollapse>
                </div>
                <div className="filterStyle">
                  <div className="filterHeading">
                    <div>
                      <h4>
                        Filters
                        <span className="smallDot">•</span>
                        <span className="lightActiveText">{0} Active</span>
                      </h4>
                    </div>
                    <div className="resetAllBtn">
                      <a href="#">Reset all</a>
                    </div>
                  </div>
                  <CustomCollapse>
                    <Panel header="Number of stops" key="1">
                      <Radio.Group
                        block
                        options={
                          numberStops && numberStops.length
                            ? numberStops
                            : [{ label: "0", value: "0" }]
                        }
                        value={String(selectedMaxConnections)}
                        optionType="button"
                        buttonStyle="solid"
                        className="stopsRadioStyle"
                        disabled={loading && !numberStops.length}
                        onChange={(e) => handleSearchFiltersChange({ maxConnections: e?.target?.value ?? e })}
                      />
                    </Panel>
                  </CustomCollapse>
                  <CustomCollapse>
                    <Panel header="Baggage" key="1">
                      <Checkbox
                        className="baggageCheckbox"
                        onChange={baggageHandler}
                        disabled={loading && !baggage.length}
                      >
                        {(baggage && baggage[0]?.label) ||
                          "Checked baggage included"}
                      </Checkbox>
                    </Panel>
                  </CustomCollapse>

                  <CustomCollapse>
                    <Panel header="Transit hours" key="1">
                      <Radio.Group
                        block
                        options={
                          transitHours && transitHours.length
                            ? transitHours
                            : [{ label: "0-3h", value: "0-3h" }]
                        }
                        defaultValue={
                          (transitHours && transitHours[0]?.value) ?? "0-3h"
                        }
                        optionType="button"
                        buttonStyle="solid"
                        className="transitHours"
                        disabled={loading && !transitHours.length}
                      />
                    </Panel>
                  </CustomCollapse>

                  <CustomCollapse>
                    <Panel header="Flight time" key="1">
                      <p
                        className="departureArrivalHeading"
                        style={{ paddingTop: 0 }}
                      >
                        Departure
                      </p>
                      <div className="departureArrival">
                        {/* <div className="timeBox">11:00AM</div> */}
                        <input
                          type="time"
                          className="timeBox"
                          ref={(el) => { timeRefs.current["departureFlightStartTime"] = el; }}
                          onClick={() => openTimePicker("departureFlightStartTime")}
                        />
                        <div className="rightArrow">

                        </div>
                        <input
                          type="time"
                          className="timeBox"
                          ref={(el) => { timeRefs.current["departureFlightEndTime"] = el; }}
                          onClick={() => openTimePicker("departureFlightEndTime")}
                        />
                      </div>

                      <p className="departureArrivalHeading">Arrival</p>
                      <div className="departureArrival">
                        <input
                          type="time"
                          className="timeBox"
                          ref={(el) => { timeRefs.current["arrivalFlightStartTime"] = el; }}
                          onClick={() => openTimePicker("arrivalFlightStartTime")}
                        />
                        <div className="rightArrow">

                        </div>
                        <input
                          type="time"
                          className="timeBox"
                          ref={(el) => { timeRefs.current["arrivalFlightEndTime"] = el; }}
                          onClick={() => openTimePicker("arrivalFlightEndTime")}
                        />
                      </div>
                    </Panel>
                  </CustomCollapse>

                  <CustomCollapse>
                    <Panel header="Airlines" key="1">
                      <div className="flex flex-col gap-2">
                        {airline.map((a) => (
                          <Checkbox
                            key={a.id}
                            className="baggageCheckbox"
                            disabled={loading && !airline.length}
                            onChange={(e: any) => handleAirlineToggle(a.code, e?.target?.checked ?? !!e)}
                            checked={selectedAirlineIds.includes(a.code)}
                          >
                            {a.label}
                          </Checkbox>
                        ))}
                      </div>
                    </Panel>
                  </CustomCollapse>
                </div>
              </div>
            </Drawer>
          </div>
        )}

        <div className="contentWrapFlex">
          {screens.lg && (
            <div className="flightDetailFilter">
              <div className="filterSectionStyle">
                <div className="">
                  <CustomCollapse>
                    <Panel header={headerContent} key="1">
                      <Slider
                        range
                        defaultValue={[priceRangeBounds[0], priceRangeBounds[1]]}
                        aria-label="price-range-slider"
                        min={priceRangeBounds[0]}
                        max={priceRangeBounds[1]}
                        step={PRICE_STEP}
                        value={selectedPriceRange}
                        onChange={(val) => {
                          const next = val as [number, number];
                          setSelectedPriceRange(next);
                          applyFlightSearchFilters(
                            departureFlightRange,
                            arrivalFlightRange,
                            selectedAirlineIds,
                            next,
                          );
                        }}
                      />
                      {/* <Select
                        style={{ width: "100%" }}
                        placeholder="Select an option"
                        value={selectedPriceId || undefined}
                        // onChange={(value) => setSelectedPriceId(value)}
                        onChange={(value) => handleSearchFiltersChange({ priceId: value })}
                        options={filterSortPriceOptions}
                        disabled={loading && !filterSortPriceOptions.length}
                      /> */}
                    </Panel>
                  </CustomCollapse>
                </div>
                <div className="filterStyle">
                  <div className="filterHeading">
                    <div>
                      <h4>
                        Filters
                        <span className="smallDot">•</span>
                        <span className="lightActiveText">{0} Active</span>
                      </h4>
                    </div>
                    <div className="resetAllBtn">
                      <a href="#">Reset all</a>
                    </div>
                  </div>
                  <CustomCollapse>
                    <Panel header="Number of stops" key="1">
                      <Radio.Group
                        block
                        options={
                          numberStops && numberStops.length
                            ? numberStops
                            : [{ label: "0", value: "0" }]
                        }
                        value={String(selectedMaxConnections)}
                        optionType="button"
                        buttonStyle="solid"
                        className="stopsRadioStyle"
                        disabled={loading && !numberStops.length}
                        onChange={(e) => handleSearchFiltersChange({ maxConnections: e?.target?.value ?? e })}
                      />
                    </Panel>
                  </CustomCollapse>
                  <CustomCollapse>
                    <Panel header="Baggage" key="1">
                      <Checkbox
                        className="baggageCheckbox"
                        onChange={baggageHandler}
                        disabled={loading && !baggage.length}
                      >
                        {(baggage && baggage[0]?.label) ||
                          "Checked baggage included"}
                      </Checkbox>
                    </Panel>
                  </CustomCollapse>

                  <CustomCollapse>
                    <Panel header="Transit hours" key="1">
                      <Radio.Group
                        block
                        options={
                          transitHours && transitHours.length
                            ? transitHours
                            : [{ label: "0-3h", value: "0-3h" }]
                        }
                        defaultValue={
                          (transitHours && transitHours[0]?.value) ?? "0-3h"
                        }
                        optionType="button"
                        buttonStyle="solid"
                        className="transitHours"
                        disabled={loading && !transitHours.length}
                      />
                    </Panel>
                  </CustomCollapse>

                  <CustomCollapse>
                    <Panel header="Flight time" key="1">
                      <p
                        className="departureArrivalHeading"
                        style={{ paddingTop: 0 }}
                      >
                        Departure
                      </p>
                      <div className="departureArrival">
                        {/* <div className="timeBox">11:00AM</div> */}
                        <input
                          type="time"
                          className="timeBox"
                          ref={(el) => { timeRefs.current["departureFlightStartTime"] = el; }}
                          onClick={() => openTimePicker("departureFlightStartTime")}
                          onChange={(e) => handleSearchFiltersChange({
                            departureFlightRange: {
                              start: e.target.value,
                              end: departureFlightRange.end
                            }
                          })}
                        />
                        <div className="rightArrow">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.8538 8.35378L9.35375 12.8538C9.25993 12.9476 9.13268 13.0003 9 13.0003C8.86732 13.0003 8.74007 12.9476 8.64625 12.8538C8.55243 12.76 8.49972 12.6327 8.49972 12.5C8.49972 12.3674 8.55243 12.2401 8.64625 12.1463L12.2931 8.50003H2.5C2.36739 8.50003 2.24021 8.44736 2.14645 8.35359C2.05268 8.25982 2 8.13264 2 8.00003C2 7.86743 2.05268 7.74025 2.14645 7.64648C2.24021 7.55271 2.36739 7.50003 2.5 7.50003H12.2931L8.64625 3.85378C8.55243 3.75996 8.49972 3.63272 8.49972 3.50003C8.49972 3.36735 8.55243 3.2401 8.64625 3.14628C8.74007 3.05246 8.86732 2.99976 9 2.99976C9.13268 2.99976 9.25993 3.05246 9.35375 3.14628L13.8538 7.64628C13.9002 7.69272 13.9371 7.74786 13.9623 7.80856C13.9874 7.86926 14.0004 7.93433 14.0004 8.00003C14.0004 8.06574 13.9874 8.13081 13.9623 8.1915C13.9371 8.2522 13.9002 8.30735 13.8538 8.35378Z"
                              fill="#0A0C0F"
                            />
                          </svg>
                        </div>
                        <input
                          type="time"
                          className="timeBox"
                          ref={(el) => { timeRefs.current["departureFlightEndTime"] = el; }}
                          onClick={() => openTimePicker("departureFlightEndTime")}
                          onChange={(e) => handleSearchFiltersChange({
                            departureFlightRange: {
                              start: departureFlightRange.start,
                              end: e.target.value
                            }
                          })}
                        />
                      </div>

                      <p className="departureArrivalHeading">Arrival</p>
                      <div className="departureArrival">
                        <input
                          type="time"
                          className="timeBox"
                          ref={(el) => { timeRefs.current["arrivalFlightStartTime"] = el; }}
                          onClick={() => openTimePicker("arrivalFlightStartTime")}
                          onChange={(e) => handleSearchFiltersChange({
                            arrivalFlightRange: {
                              start: e.target.value,
                              end: arrivalFlightRange.end
                            }
                          })}
                        />
                        <div className="rightArrow">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.8538 8.35378L9.35375 12.8538C9.25993 12.9476 9.13268 13.0003 9 13.0003C8.86732 13.0003 8.74007 12.9476 8.64625 12.8538C8.55243 12.76 8.49972 12.6327 8.49972 12.5C8.49972 12.3674 8.55243 12.2401 8.64625 12.1463L12.2931 8.50003H2.5C2.36739 8.50003 2.24021 8.44736 2.14645 8.35359C2.05268 8.25982 2 8.13264 2 8.00003C2 7.86743 2.05268 7.74025 2.14645 7.64648C2.24021 7.55271 2.36739 7.50003 2.5 7.50003H12.2931L8.64625 3.85378C8.55243 3.75996 8.49972 3.63272 8.49972 3.50003C8.49972 3.36735 8.55243 3.2401 8.64625 3.14628C8.74007 3.05246 8.86732 2.99976 9 2.99976C9.13268 2.99976 9.25993 3.05246 9.35375 3.14628L13.8538 7.64628C13.9002 7.69272 13.9371 7.74786 13.9623 7.80856C13.9874 7.86926 14.0004 7.93433 14.0004 8.00003C14.0004 8.06574 13.9874 8.13081 13.9623 8.1915C13.9371 8.2522 13.9002 8.30735 13.8538 8.35378Z"
                              fill="#0A0C0F"
                            />
                          </svg>
                        </div>
                        <input
                          type="time"
                          className="timeBox"
                          ref={(el) => { timeRefs.current["arrivalFlightEndTime"] = el; }}
                          onClick={() => openTimePicker("arrivalFlightEndTime")}
                          onChange={(e) => handleSearchFiltersChange({
                            arrivalFlightRange: {
                              start: arrivalFlightRange.start,
                              end: e.target.value
                            }
                          })}
                        />
                      </div>
                    </Panel>
                  </CustomCollapse>

                  <CustomCollapse>
                    <Panel header="Airlines" key="1">
                      <div className="flex flex-col gap-2">
                        {airline.map((a) => (
                          <Checkbox
                            key={a.id}
                            className="baggageCheckbox"
                            disabled={loading && !airline.length}
                            onChange={(e: any) => handleAirlineToggle(a.code, e?.target?.checked ?? !!e)}
                            checked={selectedAirlineIds.includes(a.code)}
                          >
                            {a.label}
                          </Checkbox>
                        ))}
                      </div>
                    </Panel>
                  </CustomCollapse>
                </div>
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
                  isLoadingMore={isLoadingMore}
                  hasMore={hasMore}
                  renderLoader={renderLoadMoreApiLoader}
                  loadMoreRef={loadMoreRef}
                  emptyState={noFlightsDataAvailable} />
              </>
            ) : trip === "roundtrip" ? (
              <TravelRoundTrip
                passData={roundResponseData || []}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                renderLoader={renderLoadMoreApiLoader}
                loadMoreRef={loadMoreRef}
                emptyState={noFlightsDataAvailable} />
            ) : (
              <TravelMultiCity />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetailTemplate;
