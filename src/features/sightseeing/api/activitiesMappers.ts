import type { ActivityDestinationOption } from "../../../services/api/activitiesSearch";

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
