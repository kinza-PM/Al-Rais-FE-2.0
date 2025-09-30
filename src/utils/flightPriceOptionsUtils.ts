// helpers (put near top of file)
const normalizeClassKey = (raw?: string) => {
    if (!raw) return "economyStandard";
    const s = raw.toLowerCase();
    if (s.includes("lite") || s.includes("economy lite") || s.includes("eco lite")) return "economyLite";
    if (s.includes("flex") || s.includes("eco flex") || s.includes("flexible")) return "economyFlex";
    if (s.includes("standard") || s.includes("economy") || s === "economy") return "economyStandard";
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
    return map[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, ch => ch.toUpperCase());
};

const extractFeaturesFromSegment = (seg: any) => {
    if (!seg) return {};
    const checked = seg?.baggageAllowance?.checkedInBaggage?.[0];
    const carry = seg?.baggageAllowance?.carryOnBaggage?.[0];
    const checkedBaggage = checked ? `Checked Baggage: Up to ${checked.value}${checked.unit ?? ""}` : "—";
    const carryBaggage = carry ? `Carry-on (Hand Bag): Up to ${carry.value}${carry.unit ?? ""}` : "—";

    // const services = (seg?.flightServices?.flightService || []).map((s: any) => (s.name || "").toLowerCase());
    // const seatSelection = services.some((n: string) => n.includes("pre reserved") || n.includes("seat")) ? "Pre-reserved / Assigned" : "Assigned at check-in";
    // const changes = services.some((n: string) => n.includes("changeable") || n.includes("change")) ? "Changeable (fees may apply)" : "Not changeable";

    const flightServicesArray: any[] = seg?.flightServices?.flightService ?? [];
    const isIncluded = (s: any) => (s?.status || "").toString().toLowerCase() === "included";
    const seatService = flightServicesArray.find((s) =>
        /pre[-_\s]?reserved|pre reserved|prereserved|seat/i.test(s?.name || "")
    );
    let seatSelection = "Assigned at check-in";
    if (seatService) {
        seatSelection = `Pre-reserved / Assigned ${isIncluded(seatService) ? "(Included)" : "(Not included)"}`;
    }
    const changeService = flightServicesArray.find((s) =>
        /changeable|change|modifiable|ticket change/i.test(s?.name || "")
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
    const match = breakdown.find((b: any) => (b?.fareType || "").toLowerCase().includes(className.toLowerCase()));
    if (match) return match?.paxRate?.totalFare ?? match?.paxRate?.baseFare ?? null;
    return fare.totalFare ?? null;
};

export function buildFlightSearchPriceOptions(raw: any) {
    const priceObj: Record<string, any> = {};
    const journeys = raw?.journey || [];
    const firstSegOfJourney = (j: any) => j?.flightSegments?.[0] ?? null;

    const perJourneyPriceClasses: string[] = journeys.map((j: any) => {
        const seg = firstSegOfJourney(j);
        return seg?.priceClassName ?? seg?.cabinClass ?? "";
    }).filter(Boolean);

    const uniqueClasses: string[] = [];
    for (const c of perJourneyPriceClasses) {
        if (!uniqueClasses.includes(c)) uniqueClasses.push(c);
    }

    const seg0 = firstSegOfJourney(journeys[0]) ?? null;
    const cabinPart = (seg0?.cabinClass || "").toString().trim();

    const priceClassPartCombined = uniqueClasses.length > 0 ? uniqueClasses.join(" / ") : (seg0?.priceClassName ?? "");

    const primaryRawClass = uniqueClasses[0] ?? seg0?.priceClassName ?? seg0?.cabinClass ?? "economyStandard";
    const planKey = normalizeClassKey(primaryRawClass);

    const planPrice = Number(findFareForClass(raw?.fare, uniqueClasses[0] ?? undefined) ?? raw?.fare?.totalFare ?? 0);

    // build segments array: one item per journey
    const segments: any[] = journeys.map((j: any, i: number) => {
        const seg = firstSegOfJourney(j);
        const features = extractFeaturesFromSegment(seg);
        const on = j?.flight?.segmentReference?.onPoint ?? seg?.departureAirportCode ?? "";
        const off = j?.flight?.segmentReference?.offPoint ?? seg?.arrivalAirportCode ?? "";
        const segPriceClass = seg?.priceClassName ?? seg?.cabinClass ?? "";
        // const date = seg?.departureDateTime ? new Date(seg.departureDateTime).toLocaleDateString() : "";
        // const routeName = (journeys.length === 2) ? (i === 0 ? "Outbound" : "Inbound") : `Route ${i + 1}`;
        const label = `${on} → ${off}` + (segPriceClass ? ` (${segPriceClass})` : "");
        // const label = `${routeName}: ${on} → ${off}` + (date ? ` (${date})` : "") + (segPriceClass ? ` — ${segPriceClass}` : "");

        return {
            index: i,
            label,
            priceClassName: segPriceClass,
            personalItem: features?.baggageCarry ?? "—",
            baggage: features?.baggageChecked ?? "—",
            seatSelection: features?.seatSelection ?? "—",
            Changes: features?.changes ?? "—",
            Refundable: (raw?.fare?.fareType?.refundable ?? false) ? "Yes" : "No",
        };
    });

    // top-level label: "Cabin - CLASS" or "Cabin - CLASS1 / CLASS2"
    const topLabel = (cabinPart ? `${cabinPart} - ` : "") + (priceClassPartCombined || titleFromKey(planKey));

    // single plan per offer (planKey)
    priceObj[planKey] = {
        label: topLabel,
        personalItem: extractFeaturesFromSegment(seg0)?.baggageCarry ?? "—",
        baggage: extractFeaturesFromSegment(seg0)?.baggageChecked ?? "—",
        seatSelection: extractFeaturesFromSegment(seg0)?.seatSelection ?? "—",
        Changes: extractFeaturesFromSegment(seg0)?.changes ?? "—",
        Refundable: (raw?.fare?.fareType?.refundable ?? false) ? "Yes" : "No",
        price: planPrice,
        segments,
        _priceClasses: uniqueClasses, // debug/meta
        currency: raw?.fare?.currencyCode ?? null,
    };

    return priceObj;
}



