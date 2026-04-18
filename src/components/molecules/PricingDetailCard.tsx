import React, { useEffect, useMemo, useState } from "react";
import "../../assets/css/travel.css";
import CrossIcon from "../../assets/svgs/redCross.svg";
import OkCheckIcon from "../../assets/svgs/greenTic.svg";
import { Col, Row, Radio } from "antd";
import BaggageInfoModal from "../common/BaggageInfoModal";

type PricingDetailCardProps = {
  passSome: any[];
};

const PRICING_FEATURE_ROWS: readonly { key: string; label: string }[] = [
  { key: "personalItem", label: "Personal Items" },
  { key: "baggage", label: "Baggage" },
  { key: "meal", label: "Meal" },
  { key: "seatSelection", label: "Seat Selection" },
  { key: "Changes", label: "Changes" },
  { key: "Refundable", label: "Refundable" },
];

const PAX_TYPE_LEAD = /^(Adult|Child|Infant|Passenger)(\s*:\s*)/i;

function lineClampLinesForFeature(featureKey: string): number | undefined {
  if (featureKey === "personalItem" || featureKey === "baggage") return 4;
  if (featureKey === "meal" || featureKey === "seatSelection") return 2;
  if (featureKey === "Changes" || featureKey === "Refundable") return 3;
  return 3;
}

function PaxBoldChunk({ text }: { text: string }) {
  const m = text.match(PAX_TYPE_LEAD);
  if (!m) {
    return <>{text}</>;
  }
  return (
    <>
      <strong className="pricingDetailPaxType">
        {m[1]}
        {m[2]}
      </strong>
      {text.slice(m[0].length)}
    </>
  );
}

function PricingFeatureParagraph({
  value,
  featureKey,
}: {
  value: any;
  featureKey: string;
}) {
  const raw = (value ?? "").toString().trim();
  const display = raw && raw !== "—" ? raw : "No detail available";
  const lines = lineClampLinesForFeature(featureKey);
  const shouldClamp = Boolean(lines && display !== "No detail available");

  const pStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.45,
    wordBreak: "break-word",
    textAlign: "center",
    ...(shouldClamp && lines
      ? {
          display: "-webkit-box",
          WebkitLineClamp: lines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }
      : {}),
  };

  const partsRaw = display.includes("·")
    ? display
        .split(/\s*·\s*/)
        .map((c: string) => c.trim())
        .filter(Boolean)
    : [display];
  const parts = partsRaw.length ? partsRaw : [display];

  return (
    <p
      style={pStyle}
      className="pricingDetailFeatureP"
      title={display !== "No detail available" ? display : undefined}
    >
      {parts.map((chunk: string, i: number) => (
        <React.Fragment key={i}>
          {i > 0 ? <React.Fragment key={i}> &nbsp; . &nbsp; </React.Fragment> : null}
          <PaxBoldChunk text={chunk.trim()} />
        </React.Fragment>
      ))}
    </p>
  );
}

const PricingDetailCard: React.FC<PricingDetailCardProps> = ({ passSome }) => {
  const headers = useMemo(() => {
    const set = new Set<string>();
    (passSome || []).forEach((item) => {
      const p = item?.price ?? {};
      Object.keys(p).forEach((k) => set.add(k));
    });
    return Array.from(set);
  }, [passSome]);

  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    headers[0] ?? null,
  );
  const [baggageModalOpen, setBaggageModalOpen] = useState(false);
  const [baggageModalSegments, setBaggageModalSegments] = useState<
    {
      fromCode?: string;
      toCode?: string;
      baggageChecked?: string | null;
      baggageCarry?: string | null;
    }[]
  >([]);

  const openBaggageModal = (plan: any) => {
    const segs = Array.isArray(plan?.segments) ? plan.segments : [];
    const mapped = segs.map((s: any) => ({
      fromCode: s?.fromCode,
      toCode: s?.toCode,
      baggageChecked: s?.baggage && s.baggage !== "—" ? s.baggage : null,
      baggageCarry:
        s?.personalItem && s.personalItem !== "—" ? s.personalItem : null,
    }));

    if (mapped.length === 0 && (plan?.baggage || plan?.personalItem)) {
      mapped.push({
        baggageChecked:
          plan.baggage && plan.baggage !== "—" ? plan.baggage : null,
        baggageCarry:
          plan.personalItem && plan.personalItem !== "—"
            ? plan.personalItem
            : null,
      });
    }

    setBaggageModalSegments(mapped);
    setBaggageModalOpen(true);
  };

  useEffect(() => {
    if (!selectedPlan && headers.length) setSelectedPlan(headers[0]);
    if (headers.length && !headers.includes(selectedPlan ?? "")) {
      setSelectedPlan(headers[0]);
    }
  }, [headers, selectedPlan]);

  const isEmpty = !passSome || passSome.length === 0;

  const colSpan = Math.max(6, Math.floor(24 / Math.max(1, headers.length)));

  if (isEmpty) return null;

  const isFeatureIncluded = (value: any, featureKey: string) => {
    const raw = String(value ?? "").trim();
    const s = raw.toLowerCase();

    if (featureKey === "Refundable") {
      return s.startsWith("refundable");
    }
    if (featureKey === "Changes") {
      if (!s || s === "—") return false;
      return !(
        s.includes("not changeable") ||
        s.includes("not allowed") ||
        s.includes("policy not available")
      );
    }
    if (featureKey === "seatSelection") {
      if (!s || s === "—") return false;
      if (s.includes("assigned at check-in")) return false;
      if (s.includes("(not included)")) return false;
      if (
        s.includes("pre-reserved") ||
        s.includes("pre reserved") ||
        s.includes("preassigned")
      ) {
        return true;
      }
      if (s.includes("add-on") || s.includes("select seat")) return true;
      return false;
    }
    if (featureKey === "meal") {
      if (!s || s === "—") return false;
      if (s.includes("not offered")) return false;
      if (s.includes("no meal details")) return false;
      if (s.includes("(paid / optional)")) return false;
      if (s.includes("(included)") || s.includes("complimentary")) return true;
      if (s.includes("may be available as add-on")) return true;
      return false;
    }
    return Boolean(value) && value !== "—";
  };

  const renderFeature = (plan: any, featureKey: string) => {
    const segs = Array.isArray(plan?.segments) ? plan.segments : null;
    const showRouteLabel = segs && segs.length > 1;
    const isBaggage = featureKey === "baggage";

    if (segs && segs.length > 1) {
      return (
        <div
          className={`parahAlign ${
            segs && segs.length > 1 ? "parahAlignMultiSeg" : ""
          }`}
        >
          {segs.map((s: any, i: number) => (
            <div
              key={`${featureKey}-${i}-${s?.flightNumber ?? s?.segmentKey ?? "seg"}`}
              className="pricingCardRouteSegments"
              onClick={isBaggage ? () => openBaggageModal(plan) : undefined}
              style={isBaggage ? { cursor: "pointer" } : undefined}
            >
              {showRouteLabel && (
                <span className="pricingDetailRouteLbl">{s.label}</span>
              )}
              {(() => {
                const included = isFeatureIncluded(s?.[featureKey], featureKey);

                return (
                  <img
                    className="pricingDetailStatusIcon"
                    src={included ? OkCheckIcon : CrossIcon}
                    alt={included ? "included" : "not-included"}
                  />
                );
              })()}
              <PricingFeatureParagraph
                value={s?.[featureKey]}
                featureKey={featureKey}
              />
            </div>
          ))}
        </div>
      );
    }

    const content = (
      <div className="parahAlign">
        <img
          className="pricingDetailStatusIcon"
          src={
            isFeatureIncluded(plan?.[featureKey], featureKey)
              ? OkCheckIcon
              : CrossIcon
          }
          alt=""
        />
        <PricingFeatureParagraph
          value={plan?.[featureKey]}
          featureKey={featureKey}
        />
      </div>
    );

    if (isBaggage) {
      return (
        <div
          onClick={() => openBaggageModal(plan)}
          style={{ cursor: "pointer" }}
        >
          {content}
        </div>
      );
    }

    return content;
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          paddingBottom: "6px",
        }}
      >
        <div className="pricingCardsWrap" style={{ minWidth: "860px" }}>
          {passSome.map((item, blockIdx) => (
            <div
              key={`${item?.id ?? item?.offerId ?? blockIdx}-pricing-block`}
              className={
                passSome.length > 1 ? "pricingDetailMultiBlock" : undefined
              }
            >
              <Row gutter={0} className="pricingDetailSyncRow">
                <Col span={3} className="emptyLabel">
                  <p>&nbsp;</p>
                </Col>
                <Col span={21}>
                  <Row gutter={0}>
                    {headers.map((hk) => {
                      const plan = item.price?.[hk] ?? {};
                      return (
                        <Col
                          key={`head-${blockIdx}-${hk}`}
                          span={colSpan}
                          className={selectedPlan === hk ? "activeCard" : ""}
                        >
                          <div className="priceCardHeadings">
                            <p>{plan.label ?? hk}</p>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </Col>
              </Row>

              {PRICING_FEATURE_ROWS.map(({ key, label }) => (
                <Row
                  gutter={0}
                  key={`${blockIdx}-${key}`}
                  className="pricingDetailSyncRow"
                >
                  <Col
                    span={3}
                    className="priceCardLabel pricingDetailLabelCell"
                  >
                    <p>{label}</p>
                  </Col>
                  <Col span={21}>
                    <Row gutter={0}>
                      {headers.map((hk) => {
                        const plan = item.price?.[hk] ?? {};
                        return (
                          <Col
                            key={`${blockIdx}-${hk}-${key}`}
                            span={colSpan}
                            className={selectedPlan === hk ? "activeCard" : ""}
                          >
                            {renderFeature(plan, key)}
                          </Col>
                        );
                      })}
                    </Row>
                  </Col>
                </Row>
              ))}

              <Row gutter={0} className="pricingDetailSyncRow">
                <Col span={3} className="emptyLabel">
                  <p>&nbsp;</p>
                </Col>
                <Col span={21}>
                  <Row gutter={0}>
                    {headers.map((hk) => {
                      const plan = item.price?.[hk] ?? {};
                      return (
                        <Col
                          key={`foot-${blockIdx}-${hk}`}
                          span={colSpan}
                          className={selectedPlan === hk ? "activeCard" : ""}
                        >
                          <div
                            className="cardPrice"
                            style={{
                              paddingTop: "14px",
                              paddingBottom: "14px",
                            }}
                          >
                            <p>
                              {plan.price != null
                                ? `AED ${Number(plan.price).toLocaleString()}`
                                : "No detail available"}
                              <span>/per person</span>
                            </p>

                            <Radio
                              className={`baggageRadio ${
                                selectedPlan === hk ? "active" : ""
                              }`}
                              checked={selectedPlan === hk}
                              onChange={() => setSelectedPlan(hk)}
                            >
                              {selectedPlan === hk
                                ? "This option is selected"
                                : "Select this option"}
                            </Radio>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      </div>

      <BaggageInfoModal
        open={baggageModalOpen}
        onClose={() => setBaggageModalOpen(false)}
        segments={baggageModalSegments}
      />
    </>
  );
};

export default React.memo(PricingDetailCard);
