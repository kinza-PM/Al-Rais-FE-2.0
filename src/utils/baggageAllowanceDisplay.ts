/** Human-readable baggage lines from GDS-style allowance objects. */

const paxTypeLabel = (ptc?: string) => {
  const s = (ptc ?? "").toString().trim().toUpperCase();
  if (s === "ADT") return "Adult";
  if (s === "CHD") return "Child";
  if (s === "INF") return "Infant";
  return ptc ? String(ptc) : "Passenger";
};

/** GDS descriptions are often ALL CAPS; sentence-case for readability when there are no lowercase letters. */
function softenIfShouting(s: string): string {
  const t = s.trim();
  if (t.length < 20 || /[a-z]/.test(t)) return t;
  const lower = t.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const normalizeUnitWord = (unit: string) => {
  const u = unit.toUpperCase();
  if (u === "PIECE" || u === "PIECES" || u === "PC" || u === "PCS") return "piece";
  if (u === "KG" || u === "KGS") return "kg";
  /** GDS / supplier payloads sometimes send "K" as kilograms shorthand (not Kelvin). */
  if (u === "K") return "kg";
  if (u === "LB" || u === "LBS") return "lb";
  return unit || "";
};

/** e.g. value 1 + PIECE → "1 piece" */
export function formatQuantityUnit(value: unknown, unitRaw?: string) {
  const v = value === undefined || value === null ? "" : String(value).trim();
  const unit = normalizeUnitWord(String(unitRaw ?? "").trim());
  if (!v) return "";
  if (unit === "piece") {
    const n = Number(v);
    const w = Number.isFinite(n) && n === 1 ? "piece" : "pieces";
    return `${v} ${w}`;
  }
  if (unit) return `${v} ${unit}`;
  return v;
}

export function formatCarryOnAllowanceEntry(entry: any): string {
  if (!entry) return "";
  const pax = paxTypeLabel(entry.paxType);
  const qty = formatQuantityUnit(entry.value, entry.unit);
  const desc = softenIfShouting(
    String(entry.description ?? "").replace(/\s+/g, " ").trim(),
  );

  if (qty && desc) {
    return `${pax}: hand baggage ${qty} — ${desc}`;
  }
  if (desc) {
    return `${pax}: ${desc}`;
  }
  if (qty) {
    return `${pax}: hand baggage ${qty}`;
  }
  return pax;
}

export function formatCarryOnAllowanceList(arr: unknown): string {
  const list = Array.isArray(arr) ? arr : [];
  if (!list.length) return "—";
  const parts = list.map(formatCarryOnAllowanceEntry).filter(Boolean);
  return parts.length ? parts.join("·") : "—";
}

export function formatCheckedAllowanceEntry(entry: any): string {
  if (!entry) return "";
  const pax = paxTypeLabel(entry.paxType);
  const qty = formatQuantityUnit(entry.value, entry.unit);
  const desc = softenIfShouting(
    String(entry.description ?? "").replace(/\s+/g, " ").trim(),
  );
  if (qty && desc) return `${pax}: checked ${qty} — ${desc}`;
  if (qty) return `${pax}: checked ${qty}`;
  if (desc) return `${pax}: ${desc}`;
  return pax;
}

export function formatCheckedAllowanceList(arr: unknown): string {
  const list = Array.isArray(arr) ? arr : [];
  if (!list.length) return "—";
  const parts = list.map(formatCheckedAllowanceEntry).filter(Boolean);
  return parts.length ? parts.join("·") : "—";
}

export type NormalizedBaggageModalSegment = {
  fromCode?: string;
  toCode?: string;
  baggageChecked: string | null;
  baggageCarry: string | null;
};

function isMeaninglessDisplay(v: string | null | undefined): boolean {
  const t = (v ?? "").toString().trim();
  if (!t) return true;
  if (t === "—") return true;
  if (t.toLowerCase() === "none") return true;
  return false;
}

export function baggageStringsFromAllowance(
  baggageAllowance: any,
): { baggageChecked: string | null; baggageCarry: string | null } {
  if (!baggageAllowance) {
    return { baggageChecked: null, baggageCarry: null };
  }
  const checked = formatCheckedAllowanceList(
    baggageAllowance?.checkedInBaggage,
  );
  const carry = formatCarryOnAllowanceList(
    baggageAllowance?.carryOnBaggage,
  );
  return {
    baggageChecked: isMeaninglessDisplay(checked) || checked === "—" ? null : checked,
    baggageCarry: isMeaninglessDisplay(carry) || carry === "—" ? null : carry,
  };
}

function segmentHasUsableBaggageAllowance(seg: any): boolean {
  const a = seg?.baggageAllowance;
  if (!a || typeof a !== "object") return false;
  const c = a.checkedInBaggage;
  const co = a.carryOnBaggage;
  return (
    (Array.isArray(c) && c.length > 0) ||
    (Array.isArray(co) && co.length > 0)
  );
}

/**
 * Compare / listing UI segments sometimes omit `baggageAllowance` while `source.raw.journey`
 * has full flightSegments. Merge allowance onto each segment for consistent modals.
 */
export function attachBaggageAllowanceFromOffer(
  segments: any[],
  source: any,
): any[] {
  if (!Array.isArray(segments) || segments.length === 0 || !source) {
    return segments;
  }
  const journeys = source?.raw?.journey ?? source?.journey ?? [];
  const rawFlat: any[] = Array.isArray(journeys)
    ? journeys.flatMap((j: any) =>
        Array.isArray(j?.flightSegments) ? j.flightSegments : [],
      )
    : [];
  if (!rawFlat.length) return segments;

  return segments.map((seg, idx) => {
    if (segmentHasUsableBaggageAllowance(seg)) return seg;

    const dep = String(
      seg?.departureAirportCode ?? seg?.fromCode ?? "",
    ).trim();
    const arr = String(seg?.arrivalAirportCode ?? seg?.toCode ?? "").trim();
    const sk = String(seg?.segmentKey ?? "").trim();

    const raw =
      (sk &&
        rawFlat.find(
          (r: any) => String(r?.segmentKey ?? "").trim() === sk,
        )) ||
      rawFlat.find(
        (r: any) =>
          String(r?.departureAirportCode ?? "").trim() === dep &&
          String(r?.arrivalAirportCode ?? "").trim() === arr,
      ) ||
      rawFlat[idx];

    const allowance = raw?.baggageAllowance;
    if (!allowance) return seg;

    return {
      ...seg,
      baggageAllowance: allowance,
      segmentKey: seg.segmentKey ?? raw?.segmentKey,
      departureAirportCode:
        seg.departureAirportCode ?? raw?.departureAirportCode ?? seg.fromCode,
      arrivalAirportCode:
        seg.arrivalAirportCode ?? raw?.arrivalAirportCode ?? seg.toCode,
      fromCode: seg.fromCode ?? raw?.departureAirportCode,
      toCode: seg.toCode ?? raw?.arrivalAirportCode,
    };
  });
}

/**
 * Unify segments from pricing / compare / flight details / fare rules.
 * Prefer `baggageAllowance` on a raw segment; fall back to preformatted strings.
 */
export function normalizeBaggageModalSegments(
  raw: unknown,
): NormalizedBaggageModalSegment[] {
  if (!Array.isArray(raw) || !raw.length) return [];
  return raw.map((s) => {
    if (!s || typeof s !== "object") {
      return { baggageChecked: null, baggageCarry: null };
    }
    const from =
      (s as any).fromCode ??
      (s as any).departureAirportCode ??
      (s as any).departure;
    const to =
      (s as any).toCode ?? (s as any).arrivalAirportCode ?? (s as any).arrival;

    const allowance =
      (s as any).baggageAllowance ??
      (s as any).rawSegment?.baggageAllowance;

    if (allowance && typeof allowance === "object") {
      const b = baggageStringsFromAllowance(allowance);
      return {
        fromCode: from,
        toCode: to,
        baggageChecked: b.baggageChecked,
        baggageCarry: b.baggageCarry,
      };
    }

    const preC = (s as any).baggageChecked;
    const preCo = (s as any).baggageCarry;
    return {
      fromCode: from,
      toCode: to,
      baggageChecked:
        typeof preC === "string" && !isMeaninglessDisplay(preC) ? preC : null,
      baggageCarry:
        typeof preCo === "string" && !isMeaninglessDisplay(preCo) ? preCo : null,
    };
  });
}
