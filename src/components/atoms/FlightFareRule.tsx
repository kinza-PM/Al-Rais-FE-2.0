import { useMemo, useState } from "react";
import { Modal } from "antd";
import BaggageInfoModal from "../common/BaggageInfoModal";

/**
 * One bullet per API paragraph block. `<br>` / newlines inside that block stay as line breaks
 * inside the same bullet (not separate bullets).
 */
function paragraphsToBulletItems(paragraphs: string[]): string[] {
  const out: string[] = [];
  for (const raw of paragraphs) {
    const s = String(raw ?? "").replace(/<br\s*\/?>/gi, "\n").trim();
    if (s) out.push(s);
  }
  return out;
}

const fareRulesBulletListClass =
  "mt-1.5 mb-0 list-disc space-y-1.5 pl-5 text-[12px] leading-relaxed text-[#3D495C] [list-style-position:outside] marker:text-[#9CA3AF]";

export default function FLightFareRule({
  trip,
  ruleData,
}: {
  trip: any;
  ruleData?: any;
}) {
  const [baggageModalOpen, setBaggageModalOpen] = useState(false);
  const [fareRulesModalOpen, setFareRulesModalOpen] = useState(false);
  const sourceRule = ruleData ?? trip ?? {};
  const fare = trip?.fare ?? sourceRule?.fare;

  const journeys: any[] = trip?.raw?.journey ?? trip?.journey ?? [];
  const segmentsFromJourneys =
    Array.isArray(journeys) && journeys.length > 0
      ? journeys.flatMap((j: any) =>
          Array.isArray(j?.flightSegments) ? j.flightSegments : [],
        )
      : [];
  const segmentsFallback =
    trip?.raw?.journey?.[0]?.flightSegments ??
    trip?.journey?.[0]?.flightSegments ??
    [];
  const segments: any[] =
    segmentsFromJourneys.length > 0 ? segmentsFromJourneys : segmentsFallback;

  const hasBaggageInfo = segments.some((seg: any) => {
    const a = seg?.baggageAllowance;
    return (
      (Array.isArray(a?.checkedInBaggage) && a.checkedInBaggage.length > 0) ||
      (Array.isArray(a?.carryOnBaggage) && a.carryOnBaggage.length > 0)
    );
  });

  const miniFarePenaltySummaries = useMemo(() => {
    const miniFareRules = Array.isArray(sourceRule?.miniFareRules)
      ? sourceRule.miniFareRules
      : [];
    const penalties = miniFareRules.flatMap((r: any) =>
      Array.isArray(r?.penalties) ? r.penalties : [],
    );

    const summarize = (type: "Reissue" | "Cancellation" | "NoShow") => {
      const target = penalties.find(
        (p: any) => String(p?.type ?? "").toLowerCase() === type.toLowerCase(),
      );
      if (!target) return null;
      const amounts = (
        Array.isArray(target?.penaltyInfo) ? target.penaltyInfo : []
      ).flatMap((pi: any) => (Array.isArray(pi?.amounts) ? pi.amounts : []));
      const positiveOrZero = amounts
        .map((a: any) => ({
          amount: Number(a?.amount),
          currency: String(a?.currency ?? "").trim(),
        }))
        .filter((x: any) => Number.isFinite(x.amount) && x.amount >= 0);
      const hasDenied = amounts.some((a: any) => Number(a?.amount) < 0);
      if (!positiveOrZero.length && hasDenied) {
        return `${type === "Cancellation" ? "Non-refundable" : "Not allowed"}`;
      }
      if (!positiveOrZero.length) return null;
      const min = positiveOrZero.reduce(
        (prev: number, cur: any) => (cur.amount < prev ? cur.amount : prev),
        positiveOrZero[0].amount,
      );
      const currency =
        positiveOrZero.find((x: any) => x.currency)?.currency ?? "";
      const fee = `${currency ? `${currency} ` : ""}${min}`;
      if (type === "Cancellation")
        return min === 0 ? "Refundable (no fee)" : `Refundable (from ${fee})`;
      if (type === "NoShow")
        return min === 0 ? "No-show: no fee" : `No-show fee from ${fee}`;
      return min === 0
        ? "Changes allowed (no fee)"
        : `Changes allowed (from ${fee})`;
    };

    return {
      reissue: summarize("Reissue"),
      cancellation: summarize("Cancellation"),
      noShow: summarize("NoShow"),
    };
  }, [sourceRule]);

  const penaltyRows = useMemo(() => {
    const miniFareRules = Array.isArray(sourceRule?.miniFareRules)
      ? sourceRule.miniFareRules
      : [];
    const penalties = miniFareRules.flatMap((r: any) =>
      Array.isArray(r?.penalties) ? r.penalties : [],
    );
    return penalties.flatMap((p: any) => {
      const type = String(p?.type ?? "").trim() || "Policy";
      const infos = Array.isArray(p?.penaltyInfo) ? p.penaltyInfo : [];
      return infos.flatMap((pi: any) => {
        const amounts = Array.isArray(pi?.amounts) ? pi.amounts : [];
        return amounts.map((a: any) => {
          const amountNum = Number(a?.amount);
          const currency = String(a?.currency ?? "").trim();
          const remark =
            Array.isArray(a?.applicableFeeRemarks) &&
            a.applicableFeeRemarks.length > 0
              ? String(a.applicableFeeRemarks[0]?.value ?? "").trim()
              : "";
          const whenParts = [];
          if (pi?.startTime && pi?.endTime)
            whenParts.push(
              `${pi.startTime}-${pi.endTime}${String(pi?.unit ?? "").trim()}`,
            );
          const when = whenParts.join(" ");
          let feeText = "Policy not available";
          if (Number.isFinite(amountNum)) {
            feeText =
              amountNum < 0
                ? "Not allowed"
                : `${currency ? `${currency} ` : ""}${amountNum}`;
          }
          // Some suppliers send `amount: -1` (not allowed) but still include stale fee text
          // in remark (e.g. "- AED 90"). Remove conflicting fee fragment for clarity.
          const safeRemark =
            Number.isFinite(amountNum) && amountNum < 0
              ? remark.replace(/\s*-\s*[A-Z]{3}\s*[\d.,]+/gi, "").trim()
              : remark;
          return {
            type,
            when,
            feeText,
            remark: safeRemark,
          };
        });
      });
    });
  }, [sourceRule]);

  const fallbackRefundable =
    fare?.fareType?.refundable === true ? "Refundable" : "Non-refundable";
  const refundableText =
    miniFarePenaltySummaries.cancellation ?? fallbackRefundable;
  const changesText =
    miniFarePenaltySummaries.reissue ?? "Change policy not available";
  const noShowText =
    miniFarePenaltySummaries.noShow ?? "No-show policy not available";

  const fareRuleSections = useMemo(() => {
    const fareRules = Array.isArray(sourceRule?.fareRules)
      ? sourceRule.fareRules
      : [];
    const subSections = fareRules.flatMap((fr: any) =>
      Array.isArray(fr?.subSection) ? fr.subSection : [],
    );
    return subSections
      .map((s: any) => ({
        title: String(s?.subTitle ?? s?.subCode ?? "Policy").trim(),
        paragraph: String(s?.paragraph ?? "")
          .replace(/<br\s*\/?>/gi, "\n")
          .trim(),
      }))
      .filter((x: any) => x.title || x.paragraph);
  }, [sourceRule]);

  /** Same policy title repeated (e.g. multiple Cancellation blocks) → one heading, bullets keep every paragraph. */
  const mergedFareRuleSections = useMemo(() => {
    const order: string[] = [];
    const groups = new Map<string, { title: string; paragraphs: string[] }>();
    for (const rule of fareRuleSections) {
      const norm = (rule.title || "Policy").toLowerCase().trim();
      if (!groups.has(norm)) {
        groups.set(norm, { title: rule.title || "Policy", paragraphs: [] });
        order.push(norm);
      }
      const g = groups.get(norm)!;
      const para = rule.paragraph?.trim();
      if (para) g.paragraphs.push(para);
    }
    return order.map((norm) => {
      const g = groups.get(norm)!;
      const seen = new Set<string>();
      const unique = g.paragraphs.filter((p) => {
        if (seen.has(p)) return false;
        seen.add(p);
        return true;
      });
      return { title: g.title, paragraphs: unique };
    });
  }, [fareRuleSections]);

  const penaltyRowGroups = useMemo(() => {
    const order: string[] = [];
    const byKey = new Map<string, typeof penaltyRows>();
    for (const r of penaltyRows) {
      const k = String(r.type ?? "").toLowerCase().trim() || "policy";
      if (!byKey.has(k)) {
        byKey.set(k, []);
        order.push(k);
      }
      byKey.get(k)!.push(r);
    }
    return order.map((k) => ({
      key: k,
      typeLabel: byKey.get(k)![0].type,
      rows: byKey.get(k)!,
    }));
  }, [penaltyRows]);

  return (
    <div className="mt-4 rounded-[16px] border-[1.5px] border-[#E4E4E7] bg-white shadow-sm max-w-[576px]">
      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-[16px] font-semibold text-[#0A0C0F]">
          Important fare rules
        </span>
        <div className="flex items-center gap-3">
          {(mergedFareRuleSections.length > 0 || penaltyRows.length > 0) && (
            <button
              type="button"
              onClick={() => setFareRulesModalOpen(true)}
              className="text-[12px] text-[#2563EB] hover:underline cursor-pointer"
            >
              Show fare rules
            </button>
          )}
          {hasBaggageInfo && (
            <button
              type="button"
              onClick={() => setBaggageModalOpen(true)}
              className="text-[12px] text-[#2563EB] hover:underline cursor-pointer"
            >
              View baggage details
            </button>
          )}
        </div>
      </div>
      <div className="h-[1.5px] bg-[#E4E4E7]" />

      <ul className="px-4 py-2 space-y-1">
        <li className="flex items-center justify-between py-1">
          <span className="text-[#3D495C] text-[12px]">Changes</span>
          <span className="text-[#0A0C0F] text-[14px] font-medium">
            {changesText}
          </span>
        </li>
        <li className="flex items-center justify-between py-1">
          <span className="text-[#3D495C] text-[12px]">Refundability</span>
          <span className="text-[#0A0C0F] text-[14px] font-medium">
            {refundableText}
          </span>
        </li>
        <li className="flex items-center justify-between py-1">
          <span className="text-[#3D495C] text-[12px]">No-show</span>
          <span className="text-[#0A0C0F] text-[14px] font-medium">
            {noShowText}
          </span>
        </li>
        {fare?.fareType?.farePreference && (
          <li className="flex items-center justify-between py-1">
            <span className="text-[#3D495C] text-[12px]">Fare preference</span>
            <span className="text-[#0A0C0F] text-[14px] font-medium">
              {fare.fareType.farePreference}
            </span>
          </li>
        )}
      </ul>

      <BaggageInfoModal
        open={baggageModalOpen}
        onClose={() => setBaggageModalOpen(false)}
        segments={segments}
      />

      <Modal
        title={
          <>
            <span className="text-[16px] font-semibold text-[#0A0C0F]">
              Fare rules
            </span>
            <p className="text-[12px] text-[#3D495C]">
              Airline policy details for changes, cancellations and fare
              conditions.
            </p>
          </>
        }
        open={fareRulesModalOpen}
        onCancel={() => setFareRulesModalOpen(false)}
        footer={null}
        width={720}
        centered
        styles={{
          header: { padding: "14px 16px" },
          body: { padding: "12px 16px 16px" },
        }}
      >
        <div className="space-y-3 max-h-[68vh] overflow-y-auto pr-1">
          <div className="rounded-[16px] border-[1.5px] border-[#E4E4E7] bg-white">
            <div className="px-4 py-3 border-b-[1.5px] border-[#E4E4E7]">
              <h3 className="text-[14px] font-semibold text-[#0A0C0F] m-0">
                Penalties
              </h3>
            </div>
            {penaltyRowGroups.length > 0 ? (
              <ul className="px-4 py-2 space-y-3 m-0 list-none">
                {penaltyRowGroups.map((group, gIdx: number) => (
                  <li key={`modal-penalty-group-${gIdx}`} className="py-1">
                    <div className="text-[12px] font-semibold text-[#0A0C0F]">
                      {group.typeLabel}
                    </div>
                    <ul className={`${fareRulesBulletListClass} m-0`}>
                      {group.rows.map((r: any, idx: number) => (
                        <li
                          key={`modal-penalty-${gIdx}-${idx}`}
                          className="[padding-inline-start:0.125rem]"
                        >
                          <div className="flex min-w-0 items-start justify-between gap-3 pr-0.5">
                            <p className="m-0 min-w-0 flex-1 whitespace-pre-wrap">
                              {[r.when, r.remark].filter(Boolean).join(" - ") ||
                                "Policy details"}
                            </p>
                            <span className="shrink-0 text-right text-[12px] font-semibold tabular-nums text-[#0A0C0F]">
                              {r.feeText}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-3 text-[12px] text-[#6B7280] m-0">
                No penalties available.
              </p>
            )}
          </div>

          <div className="rounded-[16px] border-[1.5px] border-[#E4E4E7] bg-white">
            <div className="px-4 py-3 border-b-[1.5px] border-[#E4E4E7]">
              <h3 className="text-[14px] font-semibold text-[#0A0C0F] m-0">
                Policies
              </h3>
            </div>
            {mergedFareRuleSections.length > 0 ? (
              <ul className="px-4 py-2 space-y-2 m-0 list-none">
                {mergedFareRuleSections.map((rule: any, idx: number) => (
                  <li key={`modal-policy-${idx}`} className="py-1">
                    <div className="text-[12px] font-semibold text-[#0A0C0F]">
                      {rule.title}
                    </div>
                    {(() => {
                      const items = paragraphsToBulletItems(rule.paragraphs);
                      if (items.length === 0) {
                        return (
                          <p className="mt-1 mb-0 text-[12px] text-[#6B7280] leading-5">
                            No details available
                          </p>
                        );
                      }
                      return (
                        <ul className={`${fareRulesBulletListClass} m-0`}>
                          {items.map((text: string, pIdx: number) => (
                            <li
                              key={`modal-policy-${idx}-b-${pIdx}`}
                              className="whitespace-pre-line [padding-inline-start:0.125rem]"
                            >
                              {text}
                            </li>
                          ))}
                        </ul>
                      );
                    })()}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-3 text-[12px] text-[#6B7280] m-0">
                No policy sections available.
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
