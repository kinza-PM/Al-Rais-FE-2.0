// helpers (put near top of file)
const normalizeClassKey = (raw?: string) => {
  if (!raw) return "economyStandard";
  const s = raw.toLowerCase();
  if (
    s.includes("lite") ||
    s.includes("economy lite") ||
    s.includes("eco lite")
  )
    return "economyLite";
  if (s.includes("flex") || s.includes("eco flex") || s.includes("flexible"))
    return "economyFlex";
  if (s.includes("standard") || s.includes("economy") || s === "economy")
    return "economyStandard";
  if (s.includes("business")) return "business";
  if (s.includes("first")) return "first";
  return s.replace(/\s+/g, "");
};

const titleFromKey = (key: string) => {
  const map: Record<string, string> = {
    economyLite: "Economy Lite",
    economyStandard: "Economy Standard",
    economyFlex: "Economy Flex",
    business: "Business",
    first: "First",
  };
  return (
    map[key] ??
    key.replace(/([A-Z])/g, " $1").replace(/^./, (ch) => ch.toUpperCase())
  );
};

const extractFeaturesFromSegment = (seg: any) => {
  if (!seg) return {};
  const paxTypeToLabel = (ptc?: string) => {
    const s = (ptc ?? "").toString().trim().toUpperCase();
    if (s === "ADT") return "Adult";
    if (s === "CHD") return "Child";
    if (s === "INF") return "Infant";
    return ptc ?? "PAX";
  };

  const formatAllowance = (arr: any[] | undefined) => {
    const list = Array.isArray(arr) ? arr : [];
    if (list.length === 0) return "—";

    const parts = list
      .map((n: any) => {
        const label = paxTypeToLabel(n?.paxType);
        const value = n?.value;
        const unit = n?.unit ?? "";
        if (value === undefined || value === null || value === "")
          return `${label}`;
        return `${label}: ${value}${unit}`;
      })
      .filter(Boolean);

    return parts.length ? parts.join(", ") : "—";
  };

  const checkedBaggageRaw = formatAllowance(
    seg?.baggageAllowance?.checkedInBaggage,
  );
  const carryBaggageRaw = formatAllowance(
    seg?.baggageAllowance?.carryOnBaggage,
  );
  
  const checkedBaggage =
    checkedBaggageRaw !== "—" ? `Checked Baggage: ${checkedBaggageRaw}` : "—";
  const carryBaggage =
    carryBaggageRaw !== "—" ? `Carry-on (Hand Bag): ${carryBaggageRaw}` : "—";

  // const services = (seg?.flightServices?.flightService || []).map((s: any) => (s.name || "").toLowerCase());
  // const seatSelection = services.some((n: string) => n.includes("pre reserved") || n.includes("seat")) ? "Pre-reserved / Assigned" : "Assigned at check-in";
  // const changes = services.some((n: string) => n.includes("changeable") || n.includes("change")) ? "Changeable (fees may apply)" : "Not changeable";

  const flightServicesArray: any[] = seg?.flightServices?.flightService ?? [];
  const isIncluded = (s: any) =>
    (s?.status || "").toString().toLowerCase() === "included";
  const seatService = flightServicesArray.find((s) =>
    /pre[-_\s]?reserved|pre reserved|prereserved|seat/i.test(s?.name || ""),
  );
  let seatSelection = "Assigned at check-in";
  if (seatService) {
    seatSelection = `Pre-reserved / Assigned ${isIncluded(seatService) ? "(Included)" : "(Not included)"}`;
  }
  const changeService = flightServicesArray.find((s) =>
    /changeable|change|modifiable|ticket change/i.test(s?.name || ""),
  );
  let changes = "Not changeable";
  if (changeService) {
    changes = isIncluded(changeService)
      ? "Ticket changes: Included"
      : "Ticket changes: May apply (fees)";
  }
  return {
    baggageChecked: checkedBaggage,
    baggageCarry: carryBaggage,
    seatSelection,
    changes,
  };
};

const findFareForClass = (fare: any, className?: string) => {
  if (!fare) return null;
  const breakdown = fare?.fareBreakdown ?? [];
  if (!className) return fare.totalFare ?? null;
  // find matching fareBreakdown where fareType equals className (case-insensitive)
  const match = breakdown.find((b: any) =>
    (b?.fareType || "").toLowerCase().includes(className.toLowerCase()),
  );
  if (match)
    return match?.paxRate?.totalFare ?? match?.paxRate?.baseFare ?? null;
  return fare.totalFare ?? null;
};

export function buildFlightSearchPriceOptions(raw: any) {
  const priceObj: Record<string, any> = {};
  const journeys = raw?.journey || [];
  const firstSegOfJourney = (j: any) => j?.flightSegments?.[0] ?? null;

  // Collect class names from ALL segments across all journeys (not just first segment)
  const perJourneyPriceClasses: string[] = (journeys || [])
    .flatMap((j: any) =>
      (j?.flightSegments || []).map(
        (seg: any) => seg?.priceClassName ?? seg?.cabinClass ?? "",
      ),
    )
    .filter(Boolean);

  const uniqueClasses: string[] = [];
  for (const c of perJourneyPriceClasses) {
    if (!uniqueClasses.includes(c)) uniqueClasses.push(c);
  }

  const seg0 = firstSegOfJourney(journeys[0]) ?? null;
  const cabinPart = (seg0?.cabinClass || "").toString().trim();

  const priceClassPartCombined =
    uniqueClasses.length > 0
      ? uniqueClasses.join(" / ")
      : (seg0?.priceClassName ?? "");

  const primaryRawClass =
    uniqueClasses[0] ??
    seg0?.priceClassName ??
    seg0?.cabinClass ??
    "economyStandard";
  const planKey = normalizeClassKey(primaryRawClass);

  const planPrice = Number(
    findFareForClass(raw?.fare, uniqueClasses[0] ?? undefined) ??
      raw?.fare?.totalFare ??
      0,
  );

  // build segments array: include ALL flightSegments across journeys
  let segCounter = 0;
  const segments: any[] = (journeys || []).flatMap((j: any, jIdx: number) => {
    const fs: any[] = j?.flightSegments || [];
    return fs.map((seg: any, sIdx: number) => {
      const features = extractFeaturesFromSegment(seg);
      // For per-segment rows, always use the segment's own endpoints
      const on =
        seg?.departureAirportCode ?? j?.flight?.segmentReference?.onPoint ?? "";
      const off =
        seg?.arrivalAirportCode ?? j?.flight?.segmentReference?.offPoint ?? "";
      const segPriceClass = seg?.priceClassName ?? seg?.cabinClass ?? "";
      const label =
        `${on} → ${off}` + (segPriceClass ? ` (${segPriceClass})` : "");
      return {
        index: segCounter++,
        journeyIndex: jIdx,
        segmentIndex: sIdx,
        label,
        fromCode: on,
        toCode: off,
        priceClassName: segPriceClass,
        personalItem: features?.baggageCarry ?? "—",
        baggage: features?.baggageChecked ?? "—",
        seatSelection: features?.seatSelection ?? "—",
        Changes: features?.changes ?? "—",
        Refundable:
          raw?.fare?.fareType?.refundable === true
            ? "Refundable"
            : "Non Refundable",
      };
    });
  });

  // top-level label: "Cabin - CLASS" or "Cabin - CLASS1 / CLASS2"
  const topLabel =
    (cabinPart ? `${cabinPart} - ` : "") +
    (priceClassPartCombined || titleFromKey(planKey));

  // single plan per offer (planKey)
  priceObj[planKey] = {
    label: topLabel,
    personalItem: extractFeaturesFromSegment(seg0)?.baggageCarry ?? "—",
    baggage: extractFeaturesFromSegment(seg0)?.baggageChecked ?? "—",
    seatSelection: extractFeaturesFromSegment(seg0)?.seatSelection ?? "—",
    Changes: extractFeaturesFromSegment(seg0)?.changes ?? "—",
    Refundable:
      raw?.fare?.fareType?.refundable === true
        ? "Refundable"
        : "Non Refundable",
    price: planPrice,
    segments,
    _priceClasses: uniqueClasses, // debug/meta
    currency: raw?.fare?.currencyCode ?? null,
  };

  return priceObj;
}
