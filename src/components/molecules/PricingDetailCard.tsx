import React, { useEffect, useMemo, useState } from "react";
import "../../assets/css/travel.css";
import CrossIcon from "../../assets/svgs/redCross.svg";
import OkCheckIcon from "../../assets/svgs/greenTic.svg";
import { Col, Row, Radio } from "antd";
import BaggageInfoModal from "../common/BaggageInfoModal";

type PricingDetailCardProps = {
  passSome: any[];
};

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

  if (!passSome || passSome.length === 0) return null;

  const colSpan = Math.max(6, Math.floor(24 / Math.max(1, headers.length)));

  const maxSegs = useMemo(() => {
    let max = 0;
    passSome.forEach((item) => {
      const p = item?.price ?? {};
      Object.values(p).forEach((plan: any) => {
        const len = Array.isArray(plan?.segments) ? plan.segments.length : 0;
        if (len > max) max = len;
      });
    });
    return max;
  }, [passSome]);

  const getHeightClass = (segs: number) => {
    if (segs <= 1) return "min-h-[72.8px]";
    if (segs === 2) return "min-h-[100px]";
    if (segs === 3) return "min-h-[130px]";
    return "min-h-[160px]";
  };

  const rowHeightClass = getHeightClass(maxSegs);
  const fixedHeightClass = "min-h-[72.8px] flex items-center";

  const displayOrNoDetail = (v: any) => {
    const s = (v ?? "").toString().trim();
    return s && s !== "—" ? s : "No detail available";
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
              {showRouteLabel && <span>{s.label}</span>}
              <img
                src={
                  s[featureKey] && s[featureKey] !== "—"
                    ? OkCheckIcon
                    : CrossIcon
                }
                alt={
                  s[featureKey] && s[featureKey] !== "—"
                    ? "included"
                    : "not-included"
                }
              />
              <p style={{ margin: 0 }}>{displayOrNoDetail(s?.[featureKey])}</p>
            </div>
          ))}
        </div>
      );
    }

    const content = (
      <div className="parahAlign">
        <img
          src={
            plan?.[featureKey] && plan[featureKey] !== "—"
              ? OkCheckIcon
              : CrossIcon
          }
          alt=""
        />
        <p>{displayOrNoDetail(plan?.[featureKey])}</p>
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
          <Row gutter={0}>
            <Col span={3}>
              <div className={`emptyLabel ${fixedHeightClass}`}>
                <p>&nbsp;</p>
              </div>

              <div className={`priceCardLabel ${rowHeightClass}`}>
                <p>Personal Items</p>
              </div>

              <div className={`priceCardLabel ${rowHeightClass}`}>
                <p>Baggage</p>
              </div>

              <div className={`priceCardLabel ${rowHeightClass}`}>
                <p>Seat Selection</p>
              </div>

              <div className={`priceCardLabel ${rowHeightClass}`}>
                <p>Changes</p>
              </div>

              <div className={`priceCardLabel ${rowHeightClass}`}>
                <p>Refundable</p>
              </div>

              <div className={`emptyLabel ${fixedHeightClass}`}>
                <p>&nbsp;</p>
              </div>
            </Col>

            <Col span={21}>
              {passSome.map((item, idx) => (
                <Row key={`${item?.id ?? item?.offerId ?? idx}`} gutter={0}>
                  {headers.map((hk) => {
                    const plan = item.price?.[hk] ?? {};

                    return (
                      <Col
                        key={`${idx}-${hk}`}
                        span={colSpan}
                        className={selectedPlan === hk ? "activeCard" : ""}
                      >
                        <div className="priceCardHeadings">
                          <p>{plan.label ?? hk}</p>
                        </div>

                        {renderFeature(plan, "personalItem")}
                        {renderFeature(plan, "baggage")}
                        {renderFeature(plan, "seatSelection")}
                        {renderFeature(plan, "Changes")}
                        {renderFeature(plan, "Refundable")}

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
              ))}
            </Col>
          </Row>
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