/**
 * Derives cancellation fee / refund hints from stored booking `fareRulesDetails`
 * when the live cancellation-charges API has no usable payload.
 *
 * Mini fare rules penalties are treated as **per passenger** for the matching `paxType`.
 * Aligns with `findPenaltySummary` logic (amount -1 = not auto-priced).
 */

export type FareRulesCancellationFeeModel = {
  currency: string;
  /** Best-case min positive cancellation fee per passenger type (from fare rules). */
  feeByPtc: Partial<Record<string, number>>;
  hasNegOne: boolean;
  notes: string[];
};

export type FareRulesCancellationExtract = {
  amounts: { amount: number; currency: string }[];
  hasNegOne: boolean;
};

/** Normalize passenger type codes for lookup (miniFareRules often uses ADT/CHD). */
export function normalizeFareRulePtc(raw: unknown): string {
  const u = String(raw ?? "ADT").trim().toUpperCase();
  if (u === "CNN" || u === "CH") return "CHD";
  if (u === "IN" || u === "INS") return "INF";
  return u;
}

/** Collect raw amounts from Cancellation penalties (flat list — legacy helper). */
export function extractCancellationPenaltyAmounts(
  fareRulesDetails: unknown,
): FareRulesCancellationExtract {
  const root = fareRulesDetails as Record<string, unknown> | null;
  const mini = Array.isArray(root?.miniFareRules)
    ? (root!.miniFareRules as unknown[])
    : [];
  let hasNegOne = false;
  const amounts: { amount: number; currency: string }[] = [];

  for (const rule of mini) {
    const penalties = Array.isArray((rule as any)?.penalties)
      ? ((rule as any).penalties as unknown[])
      : [];
    for (const pen of penalties) {
      if (
        String((pen as any)?.type ?? "")
          .toLowerCase()
          .trim() !== "cancellation"
      ) {
        continue;
      }
      const infos = Array.isArray((pen as any)?.penaltyInfo)
        ? ((pen as any).penaltyInfo as unknown[])
        : [];
      for (const pi of infos) {
        const amts = Array.isArray((pi as any)?.amounts)
          ? ((pi as any).amounts as unknown[])
          : [];
        for (const a of amts) {
          const n = Number((a as any)?.amount);
          if (!Number.isFinite(n)) continue;
          if (n === -1) {
            hasNegOne = true;
            continue;
          }
          if (n >= 0) {
            amounts.push({
              amount: n,
              currency: String((a as any)?.currency ?? "").trim(),
            });
          }
        }
      }
    }
  }

  return { amounts, hasNegOne };
}

function minPositiveCancellationFeeForMiniRule(rule: unknown): {
  minFee: number | null;
  currency: string;
  hasNegOne: boolean;
} {
  let hasNegOne = false;
  let minPos: number | null = null;
  let currency = "";

  const penalties = Array.isArray((rule as any)?.penalties)
    ? ((rule as any).penalties as unknown[])
    : [];
  for (const pen of penalties) {
    if (
      String((pen as any)?.type ?? "")
        .toLowerCase()
        .trim() !== "cancellation"
    ) {
      continue;
    }
    const infos = Array.isArray((pen as any)?.penaltyInfo)
      ? ((pen as any).penaltyInfo as unknown[])
      : [];
    for (const pi of infos) {
      const amts = Array.isArray((pi as any)?.amounts)
        ? ((pi as any).amounts as unknown[])
        : [];
      for (const a of amts) {
        const n = Number((a as any)?.amount);
        if (!Number.isFinite(n)) continue;
        if (n === -1) {
          hasNegOne = true;
          continue;
        }
        if (n >= 0) {
          const cur = String((a as any)?.currency ?? "").trim();
          if (minPos === null || n < minPos) {
            minPos = n;
            currency = cur;
          }
        }
      }
    }
  }

  return { minFee: minPos, currency, hasNegOne };
}

/**
 * Builds per–passenger-type cancellation fees from `miniFareRules` (Sabre-style payload).
 * When several rows exist for the same `paxType`, the **lowest** positive fee is kept (best-case).
 */
export function buildFareRulesCancellationFeeModel(
  fareRulesDetails: unknown,
  currencyFallback: string,
): FareRulesCancellationFeeModel {
  const fb = String(currencyFallback ?? "").trim() || "USD";
  const root = fareRulesDetails as Record<string, unknown> | null;
  const mini = Array.isArray(root?.miniFareRules)
    ? (root!.miniFareRules as unknown[])
    : [];

  const feeByPtc: Partial<Record<string, number>> = {};
  let anyNegOne = false;
  let currency = fb;

  for (const rule of mini) {
    const { minFee, currency: rowCur, hasNegOne } =
      minPositiveCancellationFeeForMiniRule(rule);
    if (hasNegOne) anyNegOne = true;
    if (minFee === null || minFee < 0) continue;

    const ptc = normalizeFareRulePtc((rule as any)?.paxType);
    const prev = feeByPtc[ptc];
    feeByPtc[ptc] =
      prev !== undefined ? Math.min(prev, minFee) : minFee;

    const preferCur =
      rowCur && rowCur.toUpperCase() === fb.toUpperCase() ? rowCur : rowCur || "";
    if (preferCur) currency = preferCur;
  }

  const notes: string[] = [];

  const { amounts, hasNegOne: flatNeg } =
    extractCancellationPenaltyAmounts(fareRulesDetails);
  if (flatNeg || anyNegOne) {
    notes.push(
      "Some fare-rule penalty rows are not auto-priced (−1). The airline may apply different fees depending on timing, channel, or ticket status.",
    );
  }

  const values = Object.values(feeByPtc).filter(
    (v): v is number => typeof v === "number" && Number.isFinite(v),
  );
  const minFee = values.length ? Math.min(...values) : 0;
  const maxFee = values.length ? Math.max(...values) : 0;

  if (values.length > 1 && maxFee > minFee) {
    notes.push(
      `Fare rules list different cancellation penalties by passenger type (${currency} ${minFee.toFixed(2)}–${maxFee.toFixed(2)}). Totals below sum each traveller’s applicable fee.`,
    );
  }

  const flatPos = amounts.map((a) => a.amount).filter((n) => n >= 0 && n !== -1);
  const flatMin = flatPos.length ? Math.min(...flatPos) : 0;
  const flatMax = flatPos.length ? Math.max(...flatPos) : 0;
  if (
    flatPos.length > 1 &&
    flatMax > flatMin &&
    values.length <= 1
  ) {
    notes.push(
      `Fare rules list cancellation penalties from ${currency} ${flatMin.toFixed(2)} to ${currency} ${flatMax.toFixed(2)}. The estimate uses the lowest listed penalty per passenger type where applicable.`,
    );
  }

  if (!values.length && (flatNeg || anyNegOne)) {
    notes.push(
      "A fixed cancellation fee could not be read from fare rules; refund amount is uncertain.",
    );
  }

  if (!values.length && !flatNeg && !anyNegOne) {
    notes.push(
      "No cancellation penalty amounts were found in fare rules for this booking.",
    );
  }

  if (values.length > 0) {
    notes.push(
      "Penalty amounts from fare rules are applied per passenger being cancelled.",
    );
  }

  return {
    currency: currency || fb,
    feeByPtc,
    hasNegOne: flatNeg || anyNegOne,
    notes,
  };
}

export function resolveCancellationFeeForPassenger(
  ptcRaw: unknown,
  model: FareRulesCancellationFeeModel,
): number {
  const ptc = normalizeFareRulePtc(ptcRaw);
  const direct = model.feeByPtc[ptc];
  if (direct !== undefined && direct >= 0) return direct;

  const adt = model.feeByPtc["ADT"];
  if (adt !== undefined && adt >= 0) return adt;

  const nums = Object.values(model.feeByPtc).filter(
    (n): n is number => typeof n === "number" && n >= 0,
  );
  return nums.length ? Math.min(...nums) : 0;
}

/** Sum per-passenger cancellation fees for the travellers being cancelled. */
export function sumCancellationFeesForPassengers(
  passengers: { ptc?: string }[],
  model: FareRulesCancellationFeeModel,
): number {
  let sum = 0;
  for (const p of passengers) {
    sum += resolveCancellationFeeForPassenger(p?.ptc, model);
  }
  return sum;
}

/** Same shape as `parseFlightCancellationChargesResponse` plus fare-rule notes (single-passenger legacy total). */
export function parseFareRulesCancellationCharges(
  fareRulesDetails: unknown,
  currencyFallback: string,
): {
  currency: string;
  supplierCancellationCharge: number;
  adminCancellationCharge: number;
  totalCancellationCharges: number;
  isSupplierRefundApplicable: boolean;
  notes: string[];
} {
  const model = buildFareRulesCancellationFeeModel(
    fareRulesDetails,
    currencyFallback,
  );
  const singlePax: { ptc?: string }[] = [{ ptc: "ADT" }];
  const supplier = sumCancellationFeesForPassengers(singlePax, model);
  const admin = 0;
  const total = supplier + admin;
  const values = Object.values(model.feeByPtc).filter(
    (n): n is number => typeof n === "number" && n > 0,
  );

  return {
    currency: model.currency,
    supplierCancellationCharge: supplier,
    adminCancellationCharge: admin,
    totalCancellationCharges: total,
    isSupplierRefundApplicable: values.length > 0 || model.hasNegOne,
    notes: model.notes,
  };
}
