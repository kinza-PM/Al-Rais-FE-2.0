import { useEffect, useMemo, useState } from "react";
import { Collapse, Modal, Tabs } from "antd";
import BaggageInfoModal from "../common/BaggageInfoModal";

/** Strip tags for display; keep `<br>` as newlines inside the same block (not separate bullets). */
function stripFareRuleHtmlKeepBreaks(raw: string): string {
  return String(raw ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

/**
 * One bullet per API paragraph block. Line breaks from `<br>` / newlines stay inside that bullet.
 */
function paragraphsToBulletItems(paragraphs: string[]): string[] {
  const out: string[] = [];
  for (const raw of paragraphs) {
    const s = stripFareRuleHtmlKeepBreaks(raw);
    if (s) out.push(s);
  }
  return out;
}

function appCodeLabel(code: string | number): string {
  return String(code) === "2" ? "After departure" : "Before departure";
}

function formatTimeRange(start?: string, end?: string, unit?: string): string {
  if (!start && !end) return "";
  const u = String(unit ?? "").trim().toUpperCase().startsWith("H") ? "hrs" : (unit ?? "").trim();
  const endNum = Number(end);
  // 9999 = no upper bound (open-ended)
  if (endNum >= 9999) return `${start}+ ${u} before departure`;
  return `${start}–${end} ${u} before departure`;
}

/** Modal / policy body: readable size and rhythm (matches common 14px / 1.6 UI copy). */
const fareRulesModalCopyClass =
  "font-sans text-[13px] leading-[1.65] text-[#3D495C] font-normal tracking-normal antialiased";

const fareRulesBulletListClass = `${fareRulesModalCopyClass} mt-2 mb-0 list-disc space-y-2.5 pl-5 [list-style-position:outside] marker:text-[#9CA3AF] break-words`;

export default function FLightFareRule({
  trip,
  ruleData,
  wideLayout,
  externalModalOpen,
  onExternalModalClose,
}: {
  trip: any;
  ruleData?: any;
  /** Use inside wide parents (e.g. review modal) so the card is not capped at 576px. */
  wideLayout?: boolean;
  externalModalOpen?: boolean;
  onExternalModalClose?: () => void;
}) {
  const [baggageModalOpen, setBaggageModalOpen] = useState(false);
  const [fareRulesModalOpen, setFareRulesModalOpen] = useState(false);
  const [fareRulesModalTab, setFareRulesModalTab] = useState<
    "penalties" | "policies"
  >("penalties");

  const isModalOpen = !!externalModalOpen || fareRulesModalOpen;

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
          // const when = whenParts.join(" ");
          let feeText = "Policy not available";
          if (Number.isFinite(amountNum)) {
            feeText =
              amountNum < 0
                ? "Full fare forfeited"
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
            appCode: String(a?.applicationCode ?? pi?.applicationCode ?? "1"),  // add this
            when: formatTimeRange(pi?.startTime, pi?.endTime, pi?.unit),         // use new formatter
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
      const k =
        String(r.type ?? "")
          .toLowerCase()
          .trim() || "policy";
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
      // rows: byKey.get(k)!.filter((row: (typeof penaltyRows)[0], idx: number, arr: typeof penaltyRows) =>
      //   arr.findIndex((r: (typeof penaltyRows)[0]) => r.appCode === row.appCode && r.feeText === row.feeText && r.remark === row.remark) === idx
      // ),
    }));
  }, [penaltyRows]);

  useEffect(() => {
    if (!isModalOpen) return;
    setFareRulesModalTab(
      penaltyRowGroups.length > 0 ? "penalties" : "policies",
    );
  }, [isModalOpen, penaltyRowGroups.length]);

  const policyCollapseItems = useMemo(
    () =>
      mergedFareRuleSections.map((rule: any, idx: number) => {
        const items = paragraphsToBulletItems(rule.paragraphs);
        return {
          key: String(idx),
          label: (
            <span className="block max-w-full text-left text-[14px] font-semibold leading-snug text-[#0A0C0F] line-clamp-2">
              {rule.title}
            </span>
          ),
          children:
            items.length === 0 ? (
              <p className={`m-0 ${fareRulesModalCopyClass} text-[#64748B]`}>
                No details available
              </p>
            ) : (
              <ul className={`${fareRulesBulletListClass} m-0`}>
                {items.map((text: string, pIdx: number) => (
                  <li
                    key={`policy-${idx}-b-${pIdx}`}
                    className="whitespace-pre-wrap [padding-inline-start:0.125rem]"
                  >
                    {text}
                  </li>
                ))}
              </ul>
            ),
        };
      }),
    [mergedFareRuleSections],
  );

  const penaltyCollapseItems = useMemo(
    () =>
      penaltyRowGroups.map((group, gIdx: number) => ({
        key: `penalty-${gIdx}`,
        label: (
          <span className="text-[14px] font-semibold text-[#0A0C0F]">
            {group.typeLabel}
          </span>
        ),
        children: (
          <ul className={`${fareRulesBulletListClass} m-0`}>
            {group.rows.map((r: any, idx: number) => (
              <li
                key={`modal-penalty-${gIdx}-${idx}`}
                className="[padding-inline-start:0.125rem]"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* Application timing badge */}
                    <span className="inline-block mb-1 rounded-full bg-[#A7C0EC] px-3.5 py-0.5 text-[11px] font-semibold text-[#1A3C7A]">
                      {appCodeLabel(r.appCode)}
                    </span>
                    <span className={`block break-words ${fareRulesModalCopyClass}`}>
                      {[r.when, r.remark].filter(Boolean).join(" · ") || "Policy details"}
                    </span>
                  </div>
                  <span className={`shrink-0 text-right text-[13px] font-semibold tabular-nums ${r.feeText === "Full fare forfeited" ? "text-[#FF5270]" : "text-[#0A0C0F]"
                    }`}>
                    {r.feeText}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ),
      })),
    [penaltyRowGroups],
  );

  const closeModal = () => {
    setFareRulesModalOpen(false);
    onExternalModalClose?.();
  };

  return (
    <div
      className={`mt-4 rounded-[16px] border-[1.5px] border-[#E4E4E7] bg-white shadow-sm ${wideLayout ? "w-full max-w-full" : "max-w-[576px]"}`}
    >
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
        {/* {fare?.fareType?.farePreference && (
          <li className="flex items-center justify-between py-1">
            <span className="text-[#3D495C] text-[12px]">Fare preference</span>
            <span className="text-[#0A0C0F] text-[14px] font-medium">
              {fare.fareType.farePreference}
            </span>
          </li>
        )} */}
      </ul>

      <BaggageInfoModal
        open={baggageModalOpen}
        onClose={() => setBaggageModalOpen(false)}
        segments={segments}
      />

      <Modal
        title={
          <>
            <span className="text-[17px] font-semibold leading-tight text-[#0F172A]">
              Fare rules
            </span>
            <p
              className={`m-0 mt-1.5 ${fareRulesModalCopyClass} text-[#64748B]`}
            >
              Airline policy details for changes, cancellations and fare
              conditions.
            </p>
          </>
        }
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={720}
        centered
        styles={{
          header: { padding: "16px 20px 12px" },
          body: {
            padding: "4px 20px 20px",
            maxHeight: "min(78vh, 720px)",
          },
        }}
      >
        <Tabs
          size="middle"
          activeKey={fareRulesModalTab}
          onChange={(k) => setFareRulesModalTab(k as "penalties" | "policies")}
          className={`fare-rules-fare-modal-tabs ${fareRulesModalCopyClass} max-h-[min(68vh,620px)] [&_.ant-tabs-tab]:px-3 [&_.ant-tabs-tab]:text-[13px] [&_.ant-tabs-nav]:mb-2 [&_.ant-tabs-content]:max-h-[min(58vh,520px)] [&_.ant-tabs-content]:overflow-y-auto [&_.ant-tabs-content]:overflow-x-hidden [&_.ant-tabs-content]:pr-1`}
          items={[
            {
              key: "penalties",
              label: "Penalties",
              children: (
                <div className="rounded-[12px] px-1.5 py-1.5">
                  {/* <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-1.5"> */}
                  {penaltyCollapseItems.length > 0 ? (
                    <Collapse
                      bordered={false}
                      accordion
                      expandIconPosition="end"
                      className="fare-rules-penalty-collapse bg-transparent [&_.ant-collapse-item]:mb-1.5 [&_.ant-collapse-item]:overflow-hidden [&_.ant-collapse-item]:rounded-[10px] [&_.ant-collapse-item]:border [&_.ant-collapse-item]:border-[#E2E8F0] [&_.ant-collapse-item]:bg-white [&_.ant-collapse-item]:shadow-sm [&_.ant-collapse-item]:last:mb-0 [&_.ant-collapse-header]:items-center [&_.ant-collapse-header]:py-3 [&_.ant-collapse-header]:pl-3.5 [&_.ant-collapse-header]:pr-2 [&_.ant-collapse-content-box]:border-t [&_.ant-collapse-content-box]:border-[#F1F5F9] [&_.ant-collapse-content-box]:px-3.5 [&_.ant-collapse-content-box]:pb-3 [&_.ant-collapse-content-box]:pt-3"
                      items={penaltyCollapseItems}
                    />
                  ) : (
                    <p
                      className={`px-3 py-5 text-center m-0 ${fareRulesModalCopyClass} text-[#64748B]`}
                    >
                      No penalties available.
                    </p>
                  )}
                </div>
              ),
            },
            {
              key: "policies",
              label: "Policies",
              // mergedFareRuleSections.length > 0
              //   ? `Policies (${mergedFareRuleSections.length})`
              //   : "Policies",
              children: (
                <div className="rounded-[12px] px-1.5 py-1.5">
                  {/* <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-1.5"> */}
                  {policyCollapseItems.length > 0 ? (
                    <Collapse
                      bordered={false}
                      accordion
                      expandIconPosition="end"
                      className="fare-rules-policy-collapse bg-transparent [&_.ant-collapse-item]:mb-1.5 [&_.ant-collapse-item]:overflow-hidden [&_.ant-collapse-item]:rounded-[10px] [&_.ant-collapse-item]:border [&_.ant-collapse-item]:border-[#E2E8F0] [&_.ant-collapse-item]:bg-white [&_.ant-collapse-item]:shadow-sm [&_.ant-collapse-item]:last:mb-0 [&_.ant-collapse-header]:items-start [&_.ant-collapse-header]:py-3 [&_.ant-collapse-header]:pl-3.5 [&_.ant-collapse-header]:pr-2 [&_.ant-collapse-content-box]:border-t [&_.ant-collapse-content-box]:border-[#F1F5F9] [&_.ant-collapse-content-box]:px-3.5 [&_.ant-collapse-content-box]:pb-3 [&_.ant-collapse-content-box]:pt-3"
                      items={policyCollapseItems}
                    />
                  ) : (
                    <p
                      className={`px-3 py-5 text-center m-0 ${fareRulesModalCopyClass} text-[#64748B]`}
                    >
                      No policy sections available.
                    </p>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}
