import type {
  AirlineItem,
  AirlineOption,
  BaggageItem,
  BaggageOption,
  CabinClassItem,
  CabinClassOption,
  AirportItem,
  AirportOption,
  FlightTypeItem,
  FlightTypeOption,
  NumberStopsItem,
  NumberStopsOption,
  PassengerCategoryOption,
  PassengerItem,
  PassengerSchema,
  PriceSortItem,
  PriceSortOption,
  TransitHoursItem,
  TransitHoursOption,
  TripType,
  CountryItem,
  CountryOption,
  CityOption,
  FlightCancelReasonItem,
  FlightCancelReasonSelectOption,
} from "../features/flights/types/index";

export function normalizeTripKey(name: string): TripType | null {
  const n = (name || "")
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (
    /(^| )one( |-)way( |$)/.test(n) ||
    (n.includes("one") && n.includes("way"))
  )
    return "oneway";
  if (n.includes("round") && n.includes("trip")) return "roundtrip";
  if (n.includes("multi")) return "multicity";
  return null;
}

export function toTitleCaseLabel(name: string): string {
  return (name || "")
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function buildFlightTypeOptions(
  items: FlightTypeItem[]
): FlightTypeOption[] {
  const seen = new Set<TripType>();
  const options: FlightTypeOption[] = [];

  for (const it of items || []) {
    if (it.status !== 1) continue;
    const key = normalizeTripKey(it.name);
    if (!key || seen.has(key)) continue;

    options.push({
      id: it.id,
      key,
      label: toTitleCaseLabel(it.name),
    });
    seen.add(key);
  }

  // Fallback if API empty/missing:
  if (!options.length) {
    return [
      { id: "oneway", key: "oneway", label: "One Way" },
      { id: "roundtrip", key: "roundtrip", label: "Round Trip" },
      { id: "multicity", key: "multicity", label: "Multi-City" },
    ];
  }

  // Optional: stable sort (One Way, Round Trip, Multi-City)
  const order: TripType[] = ["oneway", "roundtrip", "multicity"];
  options.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));

  return options;
}

export function buildAirportOptions(items: AirportItem[]): AirportOption[] {
  return (
    (items || [])
      // .filter(i => i.status === 1)
      .filter(i => i.city && i.city.toLowerCase() !== "unknown")
      .map((i, key) => {
        const cleanCity = i.city.split("-")[0].trim(); 
        return {
          id: `${key}`,
          label: `${cleanCity}, ${i.country} (${i.iataCode})`,
          code: i.iataCode,
          // code: i.cityCode,
          city: i.city,
          country: i.country,
          airportName: i.airportName || undefined,
          countryCode: i.countryCode,
        }
      })
    // optional: stable sort by city
    // .sort((a, b) => a.city.localeCompare(b.city))
  );
}

const mapKey = (c: string): PassengerCategoryOption["key"] | null => {
  const k = c.toLowerCase();
  if (k.includes("adult")) return "adults";
  if (k.includes("child")) return "kids";
  if (k.includes("infant")) return "infants";
  if (k.includes("senior")) return "seniors";
  return null;
};

const TITLE: Record<PassengerCategoryOption["key"], string> = {
  adults: "Adults",
  kids: "Children",
  infants: "Infants",
  seniors: "Seniors",
};

export function buildPassengerSchema(items: PassengerItem[]): PassengerSchema {
  const seen = new Set<string>();
  const out: PassengerSchema = [];

  for (const it of items || []) {
    if (it.status !== 1) continue;
    const key = mapKey(it.category);
    if (!key || seen.has(key)) continue;
    out.push({ key, title: TITLE[key], ptc: it.ptc });
    seen.add(key);
  }

  // Preferred order
  const order: PassengerCategoryOption["key"][] = [
    "adults",
    "kids",
    "infants",
    "seniors",
  ];
  out.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  return out;
}

export function buildCabinClassOptions(
  items: CabinClassItem[]
): CabinClassOption[] {
  return (
    (items || [])
      .filter((i) => i.status === 1 && i.category?.trim())
      .map((i) => ({ id: String(i.id), label: i.category.trim() }))
    // optional stable sort by label
    // .sort((a, b) => a.label.localeCompare(b.label))
  );
}

export function buildPriceSortOptions(
  items: PriceSortItem[]
): PriceSortOption[] {
  const opts = (items || [])
    .filter((i) => i.status === 1 && i.category?.trim())
    .map((i) => ({ value: i.value, label: i.category.trim() }));

  // Fallback if API empty:
  if (!opts.length) {
    return [];
  }

  // Stable order (optional)
  const order = ["lowest", "low", "lower", "medium", "mid", "highest", "high"];
  const rank = (s: string) => {
    const n = s.toLowerCase();
    for (let i = 0; i < order.length; i++) if (n.includes(order[i])) return i;
    return 999;
  };
  return opts.sort((a, b) => rank(a.label) - rank(b.label));
}

const STOPS_LABEL_MAP: Record<string, string> = {
  "0": "non stop",
  "01": "1 stop",
  "1": "1 stop",
  "02": "2 stop",
  "2": "2 stop",
  // API may return human-readable strings as category values
  "Non-stop": "non stop",
  "non-stop": "non stop",
  "nonstop": "non stop",
  "1 Stop": "1 stop",
  "1 stop": "1 stop",
  "2 Stops": "2 stop",
  "2 stops": "2 stop",
};

export function buildNumberStopsOptions(
  items: NumberStopsItem[]
): NumberStopsOption[] {
  const opts = (items || [])
    .filter((i) => i.status === 1 && i.category?.trim())
    .map((i) => {
      const val = i.category.trim();
      const numVal = parseInt(val, 10);
      const label =
        STOPS_LABEL_MAP[val] ??
        (Number.isNaN(numVal)
          ? val
          : numVal === 0
            ? "non-stop"
            : numVal === 1
              ? "one-stop"
              : numVal === 2
                ? "two-stop"
                : String(numVal).padStart(2, "0"));
      return { label, value: val };
    });
  if (!opts.length) return [{ label: "non-stop", value: "0" }];
  return opts.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
}

export function buildTransitHourOptions(
  items: TransitHoursItem[]
): TransitHoursOption[] {
  const opts = (items || [])
    .filter((i) => i.status === 1 && i.category?.trim())
    .map((i) => ({ label: i.category.trim(), value: i.category.trim() }));
  if (!opts.length) return [];
  const rank = (s: string) => {
    const m = s.match(/^(\d+)/); // take starting number
    return m ? parseInt(m[1], 10) : 9999;
  };
  return opts.sort((a, b) => rank(a.value) - rank(b.value));
}

const humanize = (s: string) =>
  s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function buildBaggageOptions(items: BaggageItem[]): BaggageOption[] {
  const opts = (items || [])
    .filter((i) => i.status === 1 && i.category?.trim())
    .map((i) => ({
      value: i.id,
      label: humanize(i.category.trim()),
    }));
  if (!opts.length)
    return [{ value: "checked", label: "Checked baggage included" }];
  return opts;
}

export function buildAirlineOptions(items: AirlineItem[]): AirlineOption[] {
  return (items || [])
    .filter((i) => i.status === 1 && i.name?.trim())
    .map((i) => ({ id: i.id, label: i.name.trim(), code: i.code.trim() }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function buildCountryOptions(items: CountryItem[]): CountryOption[] {
  return (items || [])
    .map((item) => ({
      iso2: item.iso2,
      iso3: item.iso3,
      label: item.country,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function buildCityOptions(cities: string[]): CityOption[] {
  return (cities || [])
    .map((city) => ({
      value: city,
      label: city,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function buildFlightCancelReasonOptions(
  items: FlightCancelReasonItem[],
): FlightCancelReasonSelectOption[] {
  const active = (items || []).filter((it) => it.status === 1);
  /** One option per distinct reason label; first row wins when labels duplicate (same id sent for that label). */
  const byReasonKey = new Map<string, FlightCancelReasonItem>();
  for (const it of active) {
    const label = String(it.reason ?? "").trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (!byReasonKey.has(key)) byReasonKey.set(key, it);
  }
  const list = [...byReasonKey.values()];
  const isOther = (s: string) => s.trim().toLowerCase() === "other";
  list.sort((a, b) => {
    const ra = String(a.reason ?? "").trim();
    const rb = String(b.reason ?? "").trim();
    const oa = isOther(ra);
    const ob = isOther(rb);
    if (oa !== ob) return oa ? 1 : -1;
    return ra.localeCompare(rb, undefined, { sensitivity: "base" });
  });
  return list.map((it) => ({
    value: String(it.id ?? "").trim(),
    label: String(it.reason ?? "").trim(),
  }));
}