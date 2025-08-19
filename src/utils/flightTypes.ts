import type { CabinClassItem, CabinClassOption, CountryItem, CountryOption, FlightTypeItem, FlightTypeOption, PassengerCategoryOption, PassengerItem, PassengerSchema, TripType } from "../features/flights/types/index";

/** "one way" | "OneWay" | "ONE-WAY" -> "oneway"; "Round Trip" -> "roundtrip"; "Multi Cities" -> "multicity" */
export function normalizeTripKey(name: string): TripType | null {
    const n = (name || "")
        .toLowerCase()
        .replace(/[_-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (/(^| )one( |-)way( |$)/.test(n) || (n.includes("one") && n.includes("way"))) return "oneway";
    if (n.includes("round") && n.includes("trip")) return "roundtrip";
    if (n.includes("multi")) return "multicity";
    return null;
}

export function toTitleCaseLabel(name: string): string {
    return (name || "")
        .toLowerCase()
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

export function buildFlightTypeOptions(items: FlightTypeItem[]): FlightTypeOption[] {
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

export function buildCountryOptions(items: CountryItem[]): CountryOption[] {
    return (items || [])
        .filter(i => i.status === 1)
        .map(i => ({
            id: i.id,
            label: `${i.city} (${i.cityCode}), ${i.country}`,
            code: i.cityCode,
            city: i.city,
            country: i.country
        }))
        // optional: stable sort by city
        .sort((a, b) => a.city.localeCompare(b.city));
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
        out.push({ key, title: TITLE[key] });
        seen.add(key);
    }

    // Preferred order
    const order: PassengerCategoryOption["key"][] = ["adults", "kids", "infants", "seniors"];
    out.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
    return out;
}

export function buildCabinClassOptions(items: CabinClassItem[]): CabinClassOption[] {
    return (items || [])
        .filter(i => i.status === 1 && i.category?.trim())
        .map(i => ({ id: i.id, label: i.category.trim() }))
        // optional stable sort by label
        .sort((a, b) => a.label.localeCompare(b.label));
}