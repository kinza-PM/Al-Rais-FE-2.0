import axios from "axios";

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
    transitHoursRange?: string | null,
    timeParser?: (t?: string | null) => number | null,
    airlineOptions?: Omit<AirlineFilterOptions, "selectedAirlines">
): AirlineFilterResult {
    const timeFiltered = filterFlightsByTime(oneWayList, roundList, depRange ?? null, arrRange ?? null, timeParser);

    const { one: afterTransitOne, round: afterTransitRound } = applyTransitHoursFilter(
        timeFiltered.filteredOneWay,
        timeFiltered.filteredRound,
        transitHoursRange ?? null
    );

    const airlineFiltered = filterFlightsByAirlines(afterTransitOne, afterTransitRound, {
        selectedAirlines,
        ...(airlineOptions || {}),
    });
    return airlineFiltered;
}

function parseLayoverStringToMinutes(layover?: string | null): number | null {
    if (!layover || typeof layover !== "string") return null;
    // formats like "2H50M", "45M", "1H"
    const hMatch = layover.match(/(\d+)\s*H/i);
    const mMatch = layover.match(/(\d+)\s*M/i);
    const h = hMatch ? Number(hMatch[1]) : 0;
    const m = mMatch ? Number(mMatch[1]) : 0;
    const total = h * 60 + m;
    return Number.isFinite(total) ? total : null;
}

function computeMaxLayoverMinutesFromJourney(journey: any): number | null {
    if (!journey) return null;
    const segs = journey?.flightSegments || [];
    if (!Array.isArray(segs) || segs.length <= 1) return 0; // no stops
    let maxLayover = 0;
    for (let i = 0; i < segs.length - 1; i++) {
        const nextSeg = segs[i + 1];
        const fromLayStr = nextSeg?.layoverTime ?? null; // many APIs attach layover to next segment
        let mins = parseLayoverStringToMinutes(fromLayStr);
        if (mins === null) {
            // fallback: compute from times if available
            const arrIso = segs[i]?.arrivalDateTime ?? null;
            const depIso = nextSeg?.departureDateTime ?? null;
            if (arrIso && depIso) {
                const arr = new Date(arrIso).getTime();
                const dep = new Date(depIso).getTime();
                if (isFinite(arr) && isFinite(dep) && dep > arr) {
                    mins = Math.floor((dep - arr) / 60000);
                }
            }
        }
        if (mins !== null && mins > maxLayover) maxLayover = mins;
    }
    return maxLayover;
}

function parseTransitRange(range?: string | null): [number, number] | null {
    if (!range || typeof range !== "string") return null;
    // formats like "0-3h", "3-6h", "6-12h", "12h+"
    const plus = range.match(/^(\d+)\s*h\s*\+$/i);
    if (plus) {
        const minH = Number(plus[1]);
        return [minH * 60, Number.POSITIVE_INFINITY];
    }
    const m = range.match(/^(\d+)\s*-\s*(\d+)\s*h$/i);
    if (m) {
        const a = Number(m[1]);
        const b = Number(m[2]);
        if (Number.isFinite(a) && Number.isFinite(b)) return [a * 60, b * 60];
    }
    return null;
}

function applyTransitHoursFilter(oneWay: any[] = [], round: any[] = [], range?: string | null): { one: any[]; round: any[] } {
    const bounds = parseTransitRange(range ?? null);
    if (!bounds) return { one: oneWay.slice(), round: round.slice() };
    const [minM, maxM] = bounds;
    const within = (mins: number | null) => mins !== null && mins >= minM && (maxM === Number.POSITIVE_INFINITY || mins <= maxM);

    const oneFiltered = (oneWay || []).filter((it) => {
        const journey = it?.raw?.journey?.[0] ?? null;
        const maxLay = computeMaxLayoverMinutesFromJourney(journey);
        return within(maxLay);
    });

    const roundFiltered = (round || []).filter((it) => {
        const outJ = it?.raw?.journey?.[0] ?? null;
        const inJ = it?.raw?.journey?.[1] ?? null;
        const outLay = computeMaxLayoverMinutesFromJourney(outJ);
        const inLay = computeMaxLayoverMinutesFromJourney(inJ);
        // keep if either direction matches
        return within(outLay) || within(inLay);
    });

    return { one: oneFiltered, round: roundFiltered };
}

/** Client-side filter for listings: `raw.detail.ancillaryDetailsAvailable` (see FlightBooking offer shape). */
export type AncillaryFilterMode = "all" | "with" | "without";

export function offerHasAncillaryDetailsAvailable(item: any): boolean {
    if (!item) return false;
    const d = item?.raw?.detail ?? item?.raw?.details;
    return d?.ancillaryDetailsAvailable === true;
}

export function filterOffersByAncillaryMode<T extends any>(
    list: T[] | undefined,
    mode: AncillaryFilterMode,
): T[] {
    const arr = list || [];
    if (mode === "all") return arr.slice();
    if (mode === "with") return arr.filter((it) => offerHasAncillaryDetailsAvailable(it));
    return arr.filter((it) => !offerHasAncillaryDetailsAvailable(it));
}

function segmentHasCheckedBaggage(seg: any): boolean {
    const arr = seg?.baggageAllowance?.checkedInBaggage;
    if (!Array.isArray(arr) || arr.length === 0) return false;
    const first = arr[0];
    if (!first) return false;
    const v = first.value;
    if (v === undefined || v === null) return false;
    if (typeof v === "number") return v > 0;
    const s = String(v).trim().toLowerCase();
    if (s === "" || s === "0") return false;
    return true;
}

/** True if any segment in `raw.journey` includes checked baggage allowance data. */
export function offerHasCheckedBaggageIncluded(item: any): boolean {
    const journeys = item?.raw?.journey;
    if (!Array.isArray(journeys)) return false;
    for (const j of journeys) {
        const segs = j?.flightSegments;
        if (!Array.isArray(segs)) continue;
        for (const s of segs) {
            if (segmentHasCheckedBaggage(s)) return true;
        }
    }
    return false;
}

export function filterOffersByCheckedBaggage<T extends any>(
    list: T[] | undefined,
    onlyWithCheckedBaggage: boolean,
): T[] {
    const arr = list || [];
    if (!onlyWithCheckedBaggage) return arr.slice();
    return arr.filter((it) => offerHasCheckedBaggageIncluded(it));
}

/** Client-side filter on `raw.fare.fareType.refundable` from search results. */
export type RefundableFilterMode = "all" | "refundable" | "non_refundable";

export function offerFareRefundable(item: any): boolean {
    return item?.raw?.fare?.fareType?.refundable === true;
}

export function filterOffersByRefundableMode<T extends any>(
    list: T[] | undefined,
    mode: RefundableFilterMode,
): T[] {
    const arr = list || [];
    if (mode === "all") return arr.slice();
    if (mode === "refundable") {
        return arr.filter((it) => offerFareRefundable(it));
    }
    return arr.filter((it) => !offerFareRefundable(it));
}

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
export async function callWithRetries<T>(
    fn: () => Promise<T>,
    retries = 2,
    baseDelayMs = 500
): Promise<T> {
    let attempt = 0;
    while (true) {
        try {
            return await fn();
        } catch (err: any) {
            attempt++;
            const msg = (err && (err.message ?? String(err))) || "";
            const isSocketProblem =
                /socket hang up/i.test(msg) ||
                (axios.isAxiosError(err) &&
                    (err.code === "ECONNRESET" || err.code === "ECONNABORTED"));

            // If not a socket problem or we exhausted retries -> rethrow
            if (!isSocketProblem || attempt > retries) {
                throw err;
            }

            // backoff: increase delay with attempt count
            const delay = baseDelayMs * attempt;
            console.warn(
                `callWithRetries: attempt ${attempt} failed with socket issue — retrying after ${delay}ms...`
            );
            await sleep(delay);
            // loop to retry
        }
    }
} 