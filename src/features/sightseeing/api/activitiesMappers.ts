import type { ActivityDestinationOption } from "../../../services/api/activitiesSearch";
import type {
  SightseeingActivity,
  SightseeingActivityDetailRate,
  SightseeingActivityDetailView,
  SightseeingActivityHours,
  SightseeingQuickFilterId,
  SightseeingGroupSize,
} from "../types";
import fallbackActivityImg from "../../../assets/images/tripimagecard1.jpg";

/**
 * Normalises `destinationByOurCountry` JSON into dropdown rows (`code` → getAvailability `destination`).
 */
export function parseActivityDestinations(raw: unknown): ActivityDestinationOption[] {
  if (raw == null) return [];

  const asArray = (value: unknown): unknown[] => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      const o = value as Record<string, unknown>;
      const nested =
        o.destinations ??
        o.data ??
        o.items ??
        o.results ??
        o.content;
      if (Array.isArray(nested)) return nested;
    }
    return [];
  };

  const rows = asArray(raw);
  const out: ActivityDestinationOption[] = [];

  for (const item of rows) {
    if (item == null || typeof item !== "object") continue;
    const x = item as Record<string, unknown>;
    const code = String(
      x.code ?? x.destinationCode ?? x.id ?? "",
    ).trim();
    const label = String(
      x.name ??
        x.label ??
        x.city ??
        x.destinationName ??
        x.description ??
        code,
    ).trim();
    if (!code && !label) continue;
    out.push({
      code: code || label,
      label: label || code,
      raw: item,
    });
  }

  return out;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return null;
}

/** API Gateway / Lambda sometimes wraps JSON in `body` string. */
function unwrapAvailabilityPayload(raw: unknown): unknown {
  if (raw == null) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return raw;
    }
  }
  const o = asRecord(raw);
  if (o && typeof o.body === "string") {
    try {
      return JSON.parse(o.body) as unknown;
    } catch {
      /* ignore */
    }
  }
  return raw;
}

function pickActivitiesArray(raw: unknown): unknown[] {
  const unwrapped = unwrapAvailabilityPayload(raw);
  if (unwrapped == null) return [];
  if (Array.isArray(unwrapped)) return unwrapped;
  const root = asRecord(unwrapped);
  if (!root) return [];
  const direct =
    root.activities ??
    root.activityList ??
    root.items ??
    root.results ??
    root.data ??
    root.content;
  if (Array.isArray(direct)) return direct;
  const avail = asRecord(root.availability);
  if (avail && Array.isArray(avail.activities)) return avail.activities;
  const dataObj = asRecord(root.data);
  if (dataObj && Array.isArray(dataObj.activities)) return dataObj.activities;
  return [];
}

function findFirstHttpUrl(obj: unknown, depth = 0): string | null {
  if (depth > 6 || obj == null) return null;
  if (typeof obj === "string" && /^https?:\/\//i.test(obj)) return obj;
  if (Array.isArray(obj)) {
    for (const x of obj) {
      const u = findFirstHttpUrl(x, depth + 1);
      if (u) return u;
    }
    return null;
  }
  if (typeof obj === "object") {
    for (const v of Object.values(obj as Record<string, unknown>)) {
      const u = findFirstHttpUrl(v, depth + 1);
      if (u) return u;
    }
  }
  return null;
}

function minPriceFromModalityLike(mod: Record<string, unknown>): {
  amount: number;
  currency: string;
} | null {
  const rates = mod.rates;
  if (!Array.isArray(rates)) return null;
  let best: { amount: number; currency: string } | null = null;

  const bump = (total: Record<string, unknown> | null | undefined) => {
    if (!total) return;
    const amount = Number(total.amount);
    const currency = String(total.currency ?? "USD");
    if (Number.isNaN(amount)) return;
    if (!best || amount < best.amount) best = { amount, currency };
  };

  for (const r of rates) {
    const ro = asRecord(r);
    if (!ro) continue;
    const rdRaw = ro.rateDetails;
    /** APITUDE / mocks: `rateDetails` is an array of rows with `totalAmount`. */
    if (Array.isArray(rdRaw)) {
      for (const row of rdRaw) {
        const rd = asRecord(row);
        if (!rd) continue;
        bump(asRecord(rd.totalAmount));
      }
    } else {
      const rd = asRecord(rdRaw);
      if (!rd) continue;
      bump(asRecord(rd.totalAmount));
    }
  }
  return best;
}

function bestPriceFromActivity(act: Record<string, unknown>): {
  amount: number;
  currency: string;
} | null {
  const modalities = act.modalities;
  if (!Array.isArray(modalities)) return null;
  let best: { amount: number; currency: string } | null = null;
  for (const m of modalities) {
    const mo = asRecord(m);
    if (!mo) continue;
    const p = minPriceFromModalityLike(mo);
    if (p && (!best || p.amount < best.amount)) best = p;
  }
  return best;
}

function hoursFromDurationDays(days: number): SightseeingActivityHours {
  if (!Number.isFinite(days) || days <= 0) return "3-6h";
  /** Sub-day durations from APITUDE are in days; map by clock hours for filters. */
  if (days < 1) {
    const h = days * 24;
    if (h <= 3) return "0-3h";
    if (h <= 6) return "3-6h";
    if (h <= 12) return "6-12h";
    return "12h+";
  }
  const d = Math.round(days * 10) / 10;
  if (d <= 1) return "3-6h";
  if (d < 2) return "6-12h";
  return "12h+";
}

function inferQuickFilter(
  title: string,
  categoryHint: string,
): SightseeingQuickFilterId {
  const t = `${title} ${categoryHint}`.toLowerCase();
  if (t.includes("shop") || t.includes("mall")) return "shopping";
  if (
    t.includes("beach") ||
    t.includes("resort") ||
    t.includes("snorkel") ||
    t.includes("dive")
  )
    return "beaches";
  if (
    t.includes("helicopter") ||
    t.includes("jet ski") ||
    t.includes("safari") ||
    t.includes("adventure") ||
    t.includes("ski ") ||
    t.includes("zip")
  )
    return "adventure";
  if (
    t.includes("family") ||
    t.includes("theme park") ||
    t.includes("aquarium") ||
    t.includes("zoo")
  )
    return "family";
  if (
    t.includes("hike") ||
    t.includes("park") ||
    t.includes("mountain") ||
    t.includes("nature") ||
    t.includes("island")
  )
    return "nature";
  return "cultural";
}

function modalityMeta(
  modalities: unknown,
): {
  durationDays: number | null;
  groupSize: SightseeingGroupSize;
  groupLabel: string;
} {
  if (!Array.isArray(modalities) || modalities.length === 0) {
    return {
      durationDays: null,
      groupSize: "small",
      groupLabel: "Small group",
    };
  }
  const first = asRecord(modalities[0]);
  const durNode = first?.duration;
  let durationDays: number | null = null;
  if (typeof durNode === "number" && Number.isFinite(durNode)) {
    durationDays = durNode;
  } else if (durNode && typeof durNode === "object") {
    const d = durNode as Record<string, unknown>;
    const n = Number(d.days ?? d.number ?? d.value);
    if (Number.isFinite(n)) durationDays = n;
  }

  const rawName = first ? String(first.name ?? "").trim() : "";
  const name = rawName.toLowerCase();
  let groupSize: SightseeingGroupSize = "small";
  if (name.includes("private")) {
    groupSize = "private";
  } else if (name.includes("individual") || name.includes("ticket")) {
    groupSize = "individual";
  } else if (name.includes("large") || name.includes("coach")) {
    groupSize = "large";
  }

  let groupLabel = rawName;
  if (!groupLabel) {
    if (groupSize === "private") groupLabel = "Private group";
    else if (groupSize === "individual") groupLabel = "Individual";
    else if (groupSize === "large") groupLabel = "Large group";
    else groupLabel = "Small group";
  }

  return { durationDays, groupSize, groupLabel };
}

function mapOneAvailabilityActivity(
  item: unknown,
  index: number,
): SightseeingActivity | null {
  const act = asRecord(item);
  if (!act) return null;
  const content = asRecord(act.content);
  const activityCode = String(
    act.activityCode ?? act.code ?? act.serviceCode ?? `activity-${index}`,
  ).trim();
  const title = String(
    act.name ??
      act.headline ??
      act.title ??
      content?.marketingName ??
      content?.name ??
      content?.title ??
      act.activityName ??
      "Activity",
  ).trim();
  if (!title) return null;

  const countryBlock = asRecord(act.country);
  let destinationHint = "";
  const destRaw = countryBlock?.destinations;
  if (Array.isArray(destRaw) && destRaw[0]) {
    const d0 = asRecord(destRaw[0]);
    destinationHint = String(d0?.name ?? "");
  } else if (destRaw && typeof destRaw === "object") {
    const d0 = asRecord(destRaw);
    destinationHint = String(d0?.name ?? "");
  }
  const categoryLabel = String(
    act.category ??
      act.segmentName ??
      content?.category ??
      content?.segmentName ??
      (destinationHint || "Sightseeing"),
  ).trim();

  const modalities = act.modalities;
  const { durationDays, groupSize, groupLabel } = modalityMeta(modalities);
  const durationLabel =
    durationDays != null && durationDays > 0
      ? durationDays >= 1
        ? `${durationDays} day${durationDays === 1 ? "" : "s"}`
        : (() => {
            const hours = durationDays * 24;
            const rounded = Math.round(hours);
            if (Math.abs(hours - rounded) < 0.05) {
              return `${rounded} Hours`;
            }
            return `${Math.round(hours)}h (~${durationDays} day${durationDays === 1 ? "" : "s"})`;
          })()
      : "Duration on request";

  const priceInfo = bestPriceFromActivity(act);
  const amount = priceInfo?.amount ?? 0;
  const currency = priceInfo?.currency ?? "USD";

  const imageCandidate =
    (content && (findFirstHttpUrl(content.media) ?? findFirstHttpUrl(content)))
      ?? findFirstHttpUrl(act.media)
      ?? findFirstHttpUrl(act);
  const imageSrc = imageCandidate ?? fallbackActivityImg;

  const rating = Number(act.rating ?? act.averageRating ?? content?.rating);
  const safeRating = Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 4.5;
  const reviewCount = Number(act.reviewCount ?? act.reviews ?? 0);
  const safeReviews = Number.isFinite(reviewCount)
    ? Math.max(0, Math.floor(reviewCount))
    : 0;

  return {
    id: activityCode || `ss-api-${index}`,
    title,
    categoryLabel,
    quickFilter: inferQuickFilter(title, categoryLabel),
    imageSrc,
    rating: safeRating,
    reviewCount: safeReviews,
    durationLabel,
    groupLabel,
    groupSize,
    starLevel: Math.round(safeRating),
    hours: hoursFromDurationDays(durationDays ?? 0.5),
    allowsChildren: true,
    allowsTeens: true,
    allowsAdults: true,
    price: amount,
    currency,
  };
}

/**
 * Maps Hotel Beds `getAvailability` JSON to listing cards (`SightseeingActivity`).
 */
export function mapAvailabilityToSightseeingActivities(
  raw: unknown,
): SightseeingActivity[] {
  const rows = pickActivitiesArray(raw);
  const out: SightseeingActivity[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = mapOneAvailabilityActivity(rows[i], i);
    if (row) out.push(row);
  }
  return out;
}

function unwrapDetailPayload(raw: unknown): unknown {
  if (raw == null) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return raw;
    }
  }
  const o = asRecord(raw);
  if (o && typeof o.body === "string") {
    try {
      return JSON.parse(o.body) as unknown;
    } catch {
      /* ignore */
    }
  }
  return raw;
}

/**
 * Maps Hotel Beds `activitiesDetail` JSON to a small UI model (rateKey pickers for preconfirm/confirm).
 */
export function mapActivitiesDetailResponse(
  raw: unknown,
): SightseeingActivityDetailView {
  const unwrapped = unwrapDetailPayload(raw);
  const root = asRecord(unwrapped);
  const actNode = root?.activity ?? unwrapped;
  const ar = asRecord(actNode);
  if (!ar) {
    return {
      code: "",
      name: "Activity",
      currency: "USD",
      rateOptions: [],
      raw,
    };
  }
  const code = String(ar.code ?? "").trim();
  const name = String(ar.name ?? code ?? "Activity").trim();
  const currency = String(ar.currency ?? "USD").trim() || "USD";
  const type = typeof ar.type === "string" ? ar.type : undefined;
  const rateOptions: SightseeingActivityDetailRate[] = [];

  const modalities = ar.modalities;
  if (Array.isArray(modalities)) {
    for (const m of modalities) {
      const mo = asRecord(m);
      if (!mo) continue;
      const mc = String(mo.code ?? "MOD").trim() || "MOD";
      const mn = String(mo.name ?? mc).trim() || mc;
      const rates = mo.rates;
      if (!Array.isArray(rates)) continue;
      for (const r of rates) {
        const ro = asRecord(r);
        if (!ro) continue;
        const details = ro.rateDetails;
        if (!Array.isArray(details)) continue;
        for (const d of details) {
          const drec = asRecord(d);
          if (!drec) continue;
          const rateKey = String(drec.rateKey ?? "").trim();
          if (!rateKey) continue;
          const total = asRecord(drec.totalAmount);
          const amount = Number(total?.amount ?? NaN);
          const cur = String(total?.currency ?? currency);
          const safeAmount = Number.isFinite(amount) ? amount : 0;
          rateOptions.push({
            rateKey,
            modalityCode: mc,
            modalityName: mn,
            amount: safeAmount,
            currency: cur,
            label: `${mn} — ${cur} ${safeAmount}`,
          });
        }
      }
    }
  }

  return { code: code || name, name, currency, type, rateOptions, raw };
}
