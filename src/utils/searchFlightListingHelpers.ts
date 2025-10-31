import { formatDate, formatTime } from "./helpers";

export const buildPerSegmentFlightDetail = (baseDetail: any = {}, seg: any = {}) => {
  return {
    ...baseDetail,
    flight_number: seg?.flightNumber ?? baseDetail?.flight_number,
    flight_class: seg?.cabinClass ?? seg?.cabin ?? baseDetail?.flight_class,
    start_time: seg?.departureDateTime ? formatTime(seg?.departureDateTime) : baseDetail?.start_time,
    start_date: seg?.departureDateTime ? formatDate(seg?.departureDateTime) : baseDetail?.start_date,
    end_time: seg?.arrivalDateTime ? formatTime(seg?.arrivalDateTime) : baseDetail?.end_time,
    end_date: seg?.arrivalDateTime ? formatDate(seg?.arrivalDateTime) : baseDetail?.end_date,
    duration: seg?.duration ?? baseDetail?.duration,
    marketingAirline: seg?.marketingAirline ?? baseDetail?.marketingAirline,
  };
};

// One-way compare mapper: flattens all outbound segments into `segments`
export const mapOfferForCompareOneWay = (f: any) => {
  if (!f) return null;
  const raw = f.raw ?? {};

  const allSegments: any[] = Array.isArray(raw?.journey?.[0]?.flightSegments)
    ? raw.journey[0].flightSegments
    : (raw?.outbound?.rawSegment ? [raw.outbound.rawSegment] : []);

  const mappedSegments = allSegments.map((s: any) => {
    const checked = s?.baggageAllowance?.checkedInBaggage?.[0];
    const carry = s?.baggageAllowance?.carryOnBaggage?.[0];
    return {
      name: f.name,
      logo: f.logo,
      flight_detail: buildPerSegmentFlightDetail(f?.flight_detail || {}, s),
      duration: s?.duration ?? null,
      fromCode: s?.departureAirportCode,
      toCode: s?.arrivalAirportCode,
      equipment: s?.equipmentName ?? s?.equipmentType ?? null,
      seatsAvailable: s?.seatsAvailable ?? null,
      baggageChecked: checked ? `${checked.value}${checked.unit ?? ""}` : null,
      baggageCarry: carry ? `${carry.value}${carry.unit ?? ""}` : null,
      refundable: raw?.fare?.fareType?.refundable ?? false,
    };
  });

  const firstSeg = mappedSegments?.[0];
  const totalFare = raw?.fare?.totalFare ?? f?.price?.economyLite?.price ?? null;
  const currency = raw?.fare?.currencyCode ?? f?.currency ?? "AED";

  return {
    id: f.id ?? f.offerId ?? raw?.offerId,
    logo: f.logo,
    name: f.name,
    flight_detail: f.flight_detail,
    price: f.price,
    totalFare,
    currency,
    duration: f?.flight_detail?.duration ?? firstSeg?.duration ?? null,
    equipment: firstSeg?.equipment ?? null,
    seatsAvailable: firstSeg?.seatsAvailable ?? null,
    baggageChecked: firstSeg?.baggageChecked ?? null,
    baggageCarry: firstSeg?.baggageCarry ?? null,
    refundable: raw?.fare?.fareType?.refundable ?? false,
    segments: mappedSegments,
    rawMinimal: {
      offerId: raw?.offerId ?? f.offerId ?? f.id,
      supplier: raw?.financialInfo?.supplier ?? raw?.financialInfo ?? null,
    },
  };
};

// Round-trip compare mapper: separates outbound/inbound segments
export const mapOfferForCompareRoundTrip = (f: any) => {
  if (!f) return null;
  const raw = f.raw ?? {};

  const outboundSegments = Array.isArray(raw?.journey?.[0]?.flightSegments)
    ? raw.journey[0].flightSegments
    : (f.outbound?.rawSegment ? [f.outbound.rawSegment] : []);

  const inboundSegments = Array.isArray(raw?.journey?.[1]?.flightSegments)
    ? raw.journey[1].flightSegments
    : (f.inbound?.rawSegment ? [f.inbound.rawSegment] : []);

  const mappedOutbound = outboundSegments.map((seg: any) => {
    const checked = seg?.baggageAllowance?.checkedInBaggage?.[0];
    const carry = seg?.baggageAllowance?.carryOnBaggage?.[0];
    return {
      name: f.name,
      logo: f.logo,
      flight_detail: buildPerSegmentFlightDetail(f?.outbound?.flight_detail || {}, seg),
      duration: seg?.duration ?? null,
      fromCode: seg?.departureAirportCode,
      toCode: seg?.arrivalAirportCode,
      equipment: seg?.equipmentName ?? seg?.equipmentType ?? null,
      seatsAvailable: seg?.seatsAvailable ?? null,
      baggageChecked: checked ? `${checked.value}${checked.unit ?? ""}` : null,
      baggageCarry: carry ? `${carry.value}${carry.unit ?? ""}` : null,
      refundable: raw?.fare?.fareType?.refundable ?? false,
    };
  });

  const mappedInbound = inboundSegments.map((seg: any) => {
    const checked = seg?.baggageAllowance?.checkedInBaggage?.[0];
    const carry = seg?.baggageAllowance?.carryOnBaggage?.[0];
    return {
      name: f.name,
      logo: f.logo,
      flight_detail: buildPerSegmentFlightDetail(f?.inbound?.flight_detail || {}, seg),
      duration: seg?.duration ?? null,
      fromCode: seg?.departureAirportCode,
      toCode: seg?.arrivalAirportCode,
      equipment: seg?.equipmentName ?? seg?.equipmentType ?? null,
      seatsAvailable: seg?.seatsAvailable ?? null,
      baggageChecked: checked ? `${checked.value}${checked.unit ?? ""}` : null,
      baggageCarry: carry ? `${carry.value}${carry.unit ?? ""}` : null,
      refundable: raw?.fare?.fareType?.refundable ?? false,
    };
  });

  const totalFare = raw?.fare?.totalFare ?? f?.price?.economyLite?.price ?? null;
  const currency = raw?.fare?.currencyCode ?? f?.currency ?? "AED";

  const chooseLogo = (segments: any[]) => `/airlines/${segments?.[0]?.marketingAirline ?? "default"}.png`;

  return {
    id: f.id ?? f.offerId ?? raw?.offerId,
    offerId: raw?.offerId ?? f.offerId ?? f.id,
    logo: f.logo ?? chooseLogo(outboundSegments),
    name: f.name ?? raw?.offerId ?? `Offer ${f.id}`,
    outbound: {
      segments: mappedOutbound,
      logo: f.logo ?? chooseLogo(outboundSegments),
    },
    inbound: {
      segments: mappedInbound,
      logo: f.logo ?? chooseLogo(inboundSegments),
    },
    price: f.price ?? { economyLite: { price: totalFare } },
    totalFare,
    currency,
    refundable: !!(raw?.fare?.fareType?.refundable || f?.refundable),
    rawMinimal: {
      supplier: raw?.financialInfo?.supplier ?? null,
    },
  };
};

export const pickRandomFlightsForCompare = (
  all: any[] = [],
  excludeId: any,
  count = 4,
  mapper: (f: any) => any
) => {
  if (!Array.isArray(all) || all.length === 0) return [];
  const candidates = all.filter((f) => f && f.id !== excludeId);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, count).map((f) => mapper(f)).filter(Boolean);
};


