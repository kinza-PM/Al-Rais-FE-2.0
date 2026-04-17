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

const isFiniteNonNegative = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n) && n >= 0;

const findPenaltySummary = (fareRuleItem: any, type: "Reissue" | "Cancellation") => {
  const miniFareRules = Array.isArray(fareRuleItem?.miniFareRules)
    ? fareRuleItem.miniFareRules
    : [];
  const penalties = miniFareRules.flatMap((r: any) =>
    Array.isArray(r?.penalties) ? r.penalties : [],
  );
  const selected = penalties.find(
    (p: any) => String(p?.type ?? "").toLowerCase() === type.toLowerCase(),
  );
  if (!selected) return null;

  const amounts = (Array.isArray(selected?.penaltyInfo) ? selected.penaltyInfo : []).flatMap(
    (pi: any) => (Array.isArray(pi?.amounts) ? pi.amounts : []),
  );
  const allowed = amounts.some((a: any) => isFiniteNonNegative(a?.amount));
  const nonNegative = amounts
    .map((a: any) => ({ amount: Number(a?.amount), currency: String(a?.currency ?? "").trim() }))
    .filter((a: any) => isFiniteNonNegative(a.amount));

  if (!allowed) {
    return {
      allowed: false,
      label: type === "Reissue" ? "Changes not allowed" : "Non-refundable",
    };
  }

  const minAmount = nonNegative.reduce(
    (min: number, cur: any) => (cur.amount < min ? cur.amount : min),
    nonNegative[0]?.amount ?? 0,
  );
  const currency = nonNegative.find((x: any) => x.currency)?.currency ?? "";
  const feePart = `${currency ? `${currency} ` : ""}${minAmount}`;

  if (type === "Reissue") {
    return {
      allowed: true,
      label: minAmount === 0 ? "Changes allowed (no fee)" : `Changes allowed (fee from ${feePart})`,
    };
  }

  return {
    allowed: true,
    label: minAmount === 0 ? "Refundable (no fee)" : `Refundable (fee from ${feePart})`,
  };
};

const getFareRuleFeatureLabels = (fareRuleItem?: any) => {
  if (!fareRuleItem) {
    return null;
  }
  const changeSummary = findPenaltySummary(fareRuleItem, "Reissue");
  const cancelSummary = findPenaltySummary(fareRuleItem, "Cancellation");
  return {
    changes: changeSummary?.label ?? "No change policy found",
    refundable: cancelSummary?.label ?? "Refund policy not available",
  };
};

const extractFeaturesFromSegment = (seg: any, rawOffer?: any) => {
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
  const ancillaryAvailable = Boolean(rawOffer?.detail?.ancillaryDetailsAvailable);
  let seatSelection = ancillaryAvailable
    ? "Seat selection available as add-on"
    : "Assigned at check-in";
  if (seatService) {
    seatSelection = `Pre-reserved / Assigned ${isIncluded(seatService) ? "(Included)" : "(Not included)"}`;
  } else if (ancillaryAvailable) {
    seatSelection = "Select seat from add-ons";
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

export function buildFlightSearchPriceOptions(raw: any, fareRuleItem?: any) {
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
  const fareRuleFeatures = getFareRuleFeatureLabels(fareRuleItem);

  // build segments array: include ALL flightSegments across journeys
  let segCounter = 0;
  const segments: any[] = (journeys || []).flatMap((j: any, jIdx: number) => {
    const fs: any[] = j?.flightSegments || [];
    return fs.map((seg: any, sIdx: number) => {
      const features = extractFeaturesFromSegment(seg, raw);
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
        Changes: fareRuleFeatures?.changes ?? (features?.changes ?? "—"),
        Refundable:
          fareRuleFeatures?.refundable ??
          (raw?.fare?.fareType?.refundable === true ? "Refundable" : "Non Refundable"),
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
    personalItem: extractFeaturesFromSegment(seg0, raw)?.baggageCarry ?? "—",
    baggage: extractFeaturesFromSegment(seg0, raw)?.baggageChecked ?? "—",
    seatSelection: extractFeaturesFromSegment(seg0, raw)?.seatSelection ?? "—",
    Changes: fareRuleFeatures?.changes ?? (extractFeaturesFromSegment(seg0, raw)?.changes ?? "—"),
    Refundable:
      fareRuleFeatures?.refundable ??
      (raw?.fare?.fareType?.refundable === true ? "Refundable" : "Non Refundable"),
    price: planPrice,
    segments,
    _priceClasses: uniqueClasses, // debug/meta
    currency: raw?.fare?.currencyCode ?? null,
  };

  return priceObj;
}
