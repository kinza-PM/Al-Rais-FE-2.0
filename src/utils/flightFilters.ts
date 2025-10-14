export type TimeRange = { start?: string; end?: string } | null;

export interface FilterResult {
    filteredOneWay: any[];
    filteredRound: any[];
}

export type AirlineFilterOptions = {
    selectedAirlines?: string[] | null;
    matchAllSegments?: boolean;
    getAirlinesFromOneWay?: (oneWayItem: any) => string[];
    getAirlinesFromRound?: (roundItem: any) => string[];
};

export interface AirlineFilterResult {
    filteredOneWay: any[];
    filteredRound: any[];
}

const defaultGetAirlinesFromOneWay = (it: any): string[] => {
    if (!it) return [];
    const s = new Set<string>();

    if (typeof it.name === "string" && it.name.trim()) s.add(it.name.trim());
    // try raw segment paths
    const seg =
        it?.raw?.journey?.[0]?.flightSegments?.[0] ??
        it?.flight_detail?.rawSegment ??
        it?.raw?.journey?.[0]?.flight?.segmentReference;
    if (seg) {
        if (seg.marketingAirline) s.add(String(seg.marketingAirline));
        if (seg.operatingAirline) s.add(String(seg.operatingAirline));
    }
    // fallback: logo path like /airlines/EK.png
    const logo = it?.logo ?? "";
    const m = (logo.match(/\/airlines\/([^.\/]+)\.png/) || [])[1];
    if (m) s.add(m);

    return Array.from(s).filter(Boolean);
};

/** default extractor for round items */
const defaultGetAirlinesFromRound = (it: any): string[] => {
    if (!it) return [];
    const s = new Set<string>();

    const tryAdd = (obj: any) => {
        if (!obj) return;
        if (typeof obj.name === "string" && obj.name.trim()) s.add(obj.name.trim());
        const seg = obj?.rawSegment ?? obj?.flight_detail?.rawSegment;
        if (seg) {
            if (seg.marketingAirline) s.add(String(seg.marketingAirline));
            if (seg.operatingAirline) s.add(String(seg.operatingAirline));
        }
        const logo = obj?.logo ?? "";
        const m = (logo.match(/\/airlines\/([^.\/]+)\.png/) || [])[1];
        if (m) s.add(m);
    };

    tryAdd(it?.outbound);
    tryAdd(it?.inbound);

    if (typeof it.name === "string" && it.name.trim()) s.add(it.name.trim());
    const segTop = it?.raw?.journey?.[0]?.flightSegments?.[0];
    if (segTop?.marketingAirline) s.add(segTop.marketingAirline);

    return Array.from(s).filter(Boolean);
};

/** Pure airline filter */
export function filterFlightsByAirlines(
    oneWayList: any[] = [],
    roundList: any[] = [],
    options: AirlineFilterOptions = {}
): AirlineFilterResult {
    const {
        selectedAirlines = null,
        matchAllSegments = false,
        getAirlinesFromOneWay = defaultGetAirlinesFromOneWay,
        getAirlinesFromRound = defaultGetAirlinesFromRound,
    } = options || {};

    if (!selectedAirlines || !selectedAirlines.length) {
        return { filteredOneWay: oneWayList.slice(), filteredRound: roundList.slice() };
    }

    const selectedSet = new Set(selectedAirlines.map((s) => String(s || "").trim().toUpperCase()));

    const oneWayFiltered = (oneWayList || []).filter((item) => {
        const airlines = (getAirlinesFromOneWay(item) || []).map((a) => String(a || "").trim().toUpperCase());
        if (!airlines.length) return false; // cannot decide -> drop
        if (matchAllSegments) return airlines.every((a) => selectedSet.has(a));
        return airlines.some((a) => selectedSet.has(a));
    });

    const roundFiltered = (roundList || []).filter((item) => {
        const airlines = (getAirlinesFromRound(item) || []).map((a) => String(a || "").trim().toUpperCase());
        if (!airlines.length) return false;
        if (matchAllSegments) return airlines.every((a) => selectedSet.has(a));
        return airlines.some((a) => selectedSet.has(a));
    });

    return { filteredOneWay: oneWayFiltered, filteredRound: roundFiltered };
}

export function filterFlightsByTime(
    oneWayList: any[] = [],
    roundList: any[] = [],
    depRange?: TimeRange,
    arrRange?: TimeRange,
    timeParser?: (t?: string | null) => number | null
): FilterResult {
    // choose parser: prefer provided, otherwise try to use global (same-file) timeToMinutesFromAnyString
    const parse = timeParser ?? (typeof (globalThis as any).timeToMinutesFromAnyString === "function"
        ? (globalThis as any).timeToMinutesFromAnyString
        : undefined);

    if (!parse) {
        throw new Error("No time parser provided. Pass timeToMinutesFromAnyString as 5th arg.");
    }

    const depStartStr = depRange?.start ?? null;
    const depEndStr = depRange?.end ?? null;
    const arrStartStr = arrRange?.start ?? null;
    const arrEndStr = arrRange?.end ?? null;

    const depStart = depStartStr ? parse(depStartStr) : null;
    const depEnd = depEndStr ? parse(depEndStr) : null;
    const arrStart = arrStartStr ? parse(arrStartStr) : null;
    const arrEnd = arrEndStr ? parse(arrEndStr) : null;

    const noDepFilter = depStart === null && depEnd === null;
    const noArrFilter = arrStart === null && arrEnd === null;
    if (noDepFilter && noArrFilter) {
        return { filteredOneWay: oneWayList.slice(), filteredRound: roundList.slice() };
    }

    const getMinutes = (iso?: string | null, formatted?: string | null) => {
        if (iso) {
            const m = parse(iso);
            if (m !== null) return m;
        }
        if (formatted) {
            return parse(formatted);
        }
        return null;
    };

    const filteredOneWay = (oneWayList || []).filter((f: any) => {
        const depMins = getMinutes(f?.flight_detail?.start_time_iso, f?.flight_detail?.start_time);
        const arrMins = getMinutes(f?.flight_detail?.end_time_iso, f?.flight_detail?.end_time);

        // if a filter exists but we can't compute minutes, drop the item
        if ((depStart !== null || depEnd !== null) && depMins === null) return false;
        if ((arrStart !== null || arrEnd !== null) && arrMins === null) return false;

        const matchesDep =
            depStart === null || (depMins !== null && depMins >= depStart)
                ? depEnd === null || (depMins !== null && depMins <= depEnd)
                : false;

        const matchesArr =
            arrStart === null || (arrMins !== null && arrMins >= arrStart)
                ? arrEnd === null || (arrMins !== null && arrMins <= arrEnd)
                : false;

        if (!noDepFilter && !noArrFilter) return matchesDep && matchesArr;
        if (!noDepFilter) return matchesDep;
        return matchesArr;
    });

    const filteredRound = (roundList || []).filter((f: any) => {
        const outbound = f?.outbound;
        const inbound = f?.inbound;

        const depMins = getMinutes(outbound?.flight_detail?.start_time_iso, outbound?.flight_detail?.start_time);
        const arrMins = getMinutes(inbound?.flight_detail?.end_time_iso, inbound?.flight_detail?.end_time);

        if ((depStart !== null || depEnd !== null) && depMins === null) return false;
        if ((arrStart !== null || arrEnd !== null) && arrMins === null) return false;

        const matchesDep =
            depStart === null || (depMins !== null && depMins >= depStart)
                ? depEnd === null || (depMins !== null && depMins <= depEnd)
                : false;

        const matchesArr =
            arrStart === null || (arrMins !== null && arrMins >= arrStart)
                ? arrEnd === null || (arrMins !== null && arrMins <= arrEnd)
                : false;

        if (!noDepFilter && !noArrFilter) return matchesDep && matchesArr;
        if (!noDepFilter) return matchesDep;
        return matchesArr;
    });

    return { filteredOneWay, filteredRound };
}


export function filterFlightsByTimeAndAirlines(
    oneWayList: any[] = [],
    roundList: any[] = [],
    depRange?: { start?: string; end?: string } | null,
    arrRange?: { start?: string; end?: string } | null,
    selectedAirlines?: string[] | null,
    timeParser?: (t?: string | null) => number | null,
    airlineOptions?: Omit<AirlineFilterOptions, "selectedAirlines">
): AirlineFilterResult {
    const timeFiltered = filterFlightsByTime(oneWayList, roundList, depRange ?? null, arrRange ?? null, timeParser);
    const airlineFiltered = filterFlightsByAirlines(timeFiltered.filteredOneWay, timeFiltered.filteredRound, {
        selectedAirlines,
        ...(airlineOptions || {}),
    });
    return airlineFiltered;
}