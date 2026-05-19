import {
  formatListingStartingFare,
  getMarketingAirlineDisplayName,
} from "./helpers";
import { resolveAirlineLogoFromSegment } from "./searchFlightListingHelpers";

export type ShareFlightListingSnapshot = {
  routeTitle: string;
  infoSubtitle: string;
  /** e.g. `AED48` — same pattern as listing cards */
  priceCompact: string;
  airlineLogoUrl: string;
};

function pickDepCity(seg: any): string {
  if (!seg) return "";
  const v =
    seg.departureAirportCity ||
    seg.departureCity ||
    seg.originCity ||
    seg.origin ||
    "";
  const t = String(v).trim();
  if (t) return t;
  return String(seg.departureAirportCode || seg.departureAirport || "").trim();
}

function pickArrCity(seg: any): string {
  if (!seg) return "";
  const v =
    seg.arrivalAirportCity ||
    seg.arrivalCity ||
    seg.destinationCity ||
    seg.destination ||
    "";
  const t = String(v).trim();
  if (t) return t;
  return String(seg.arrivalAirportCode || seg.arrivalAirport || "").trim();
}

/** e.g. `Wed 30/07` (matches share-card Figma) */
function formatShareDotDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const wd = d.toLocaleDateString("en-US", { weekday: "short" });
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${wd} ${day}/${month}`;
}

function uniqueAirlineLabels(segments: any[], hostItem: any): string[] {
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const s of segments) {
    const label = getMarketingAirlineDisplayName(s, hostItem).trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  return labels;
}

function buildAirlinesSubtitle(segments: any[], hostItem: any): string {
  if (!segments.length) {
    const fallback = String(hostItem?.name ?? "").trim();
    return fallback || "Airline";
  }
  const uniq = uniqueAirlineLabels(segments, hostItem);
  if (uniq.length > 1) return "Multiple Airlines";
  return uniq[0] || "Airline";
}

/**
 * Builds the summary row for “Share this flight” on search listing cards
 * (one-way, round-trip, and multi-city offer objects).
 */
export function buildShareFlightListingSnapshot(
  item: any,
): ShareFlightListingSnapshot {
  const currency = item?.raw?.fare?.currencyCode ?? "$";
  const rawAmt = item?.rawTotalStartingFare ?? item?.raw?.fare?.totalFare;
  const priceCompact = formatListingStartingFare(currency, rawAmt);

  const isRoundTrip = !!(item?.outbound || item?.inbound);
  const rawJourneys = item?.raw?.journey;
  const isMultiCityListing =
    Array.isArray(rawJourneys) &&
    rawJourneys.length > 1 &&
    !isRoundTrip;

  if (isMultiCityListing) {
    const allSegs: any[] = [];
    for (const j of rawJourneys) {
      const fs = j?.flightSegments;
      if (Array.isArray(fs)) allSegs.push(...fs);
      else if (fs) allSegs.push(fs);
    }

    const firstJ = rawJourneys[0];
    const lastJ = rawJourneys[rawJourneys.length - 1];
    const firstJSegs = firstJ?.flightSegments;
    const lastJSegs = lastJ?.flightSegments;
    const firstSeg = Array.isArray(firstJSegs)
      ? firstJSegs[0]
      : firstJSegs ?? null;
    const lastArr = Array.isArray(lastJSegs)
      ? lastJSegs[lastJSegs.length - 1]
      : lastJSegs ?? null;

    const fromLabel =
      (firstSeg && (pickDepCity(firstSeg) || firstSeg.departureAirportCode)) ||
      "—";
    const toLabel =
      (lastArr && (pickArrCity(lastArr) || lastArr.arrivalAirportCode)) || "—";
    const routeTitle = `${fromLabel} - ${toLabel}`;

    const airlines = buildAirlinesSubtitle(allSegs, item);
    const legDates = (rawJourneys as any[])
      .map((j) => {
        const segs = j?.flightSegments;
        const s0 = Array.isArray(segs) ? segs[0] : segs ?? null;
        return formatShareDotDate(s0?.departureDateTime);
      })
      .filter(Boolean);
    const uniqDates = [...new Set(legDates)];
    const infoSubtitle = [airlines, ...uniqDates].join(" · ");

    const logo =
      resolveAirlineLogoFromSegment(firstSeg) ||
      String(item?.logo ?? "").trim();

    return {
      routeTitle,
      infoSubtitle: infoSubtitle || airlines,
      priceCompact,
      airlineLogoUrl: logo,
    };
  }

  if (isRoundTrip) {
    const outSegs: any[] =
      item?.outbound?.raw?.journey?.[0]?.flightSegments ?? [];
    const inSegs: any[] =
      item?.inbound?.raw?.journey?.[0]?.flightSegments ?? [];
    const allSegs = [
      ...(Array.isArray(outSegs) ? outSegs : []),
      ...(Array.isArray(inSegs) ? inSegs : []),
    ];

    const fo = outSegs[0];
    const lo =
      Array.isArray(outSegs) && outSegs.length > 0
        ? outSegs[outSegs.length - 1]
        : null;
    const fi = inSegs[0];

    const fromLabel =
      (fo && (pickDepCity(fo) || fo.departureAirportCode)) || "—";
    const toLabel =
      (lo && (pickArrCity(lo) || lo.arrivalAirportCode)) || "—";
    const routeTitle = `${fromLabel} - ${toLabel}`;

    const airlines = buildAirlinesSubtitle(allSegs, item);
    const d1 = formatShareDotDate(fo?.departureDateTime);
    const d2 = formatShareDotDate(fi?.departureDateTime);
    const dateBits = [d1, d2].filter(Boolean);
    const infoSubtitle = [airlines, ...dateBits].join(" · ");

    const logo =
      resolveAirlineLogoFromSegment(fo) ||
      String(item?.outbound?.logo ?? item?.logo ?? "").trim();

    return {
      routeTitle,
      infoSubtitle: infoSubtitle || airlines,
      priceCompact,
      airlineLogoUrl: logo,
    };
  }

  const segs: any[] = item?.raw?.journey?.[0]?.flightSegments ?? [];
  const first = Array.isArray(segs) && segs.length ? segs[0] : null;
  const last =
    Array.isArray(segs) && segs.length ? segs[segs.length - 1] : first;

  const fromLabel =
    pickDepCity(first) || first?.departureAirportCode || "—";
  const toLabel =
    pickArrCity(last || first) || last?.arrivalAirportCode || "—";
  const routeTitle = `${fromLabel} - ${toLabel}`;

  const airlines = buildAirlinesSubtitle(
    Array.isArray(segs) ? segs : [],
    item,
  );
  const d1 = formatShareDotDate(first?.departureDateTime);
  const d2 = formatShareDotDate(last?.arrivalDateTime);
  let dateBits: string[];
  if (d1 && d2 && d1 !== d2) dateBits = [d1, d2];
  else dateBits = d1 ? [d1] : d2 ? [d2] : [];
  const infoSubtitle = [airlines, ...dateBits].join(" · ");

  const logo =
    resolveAirlineLogoFromSegment(first) ||
    String(item?.logo ?? "").trim();

  return {
    routeTitle,
    infoSubtitle: infoSubtitle || airlines,
    priceCompact,
    airlineLogoUrl: logo,
  };
}
