import React, { useEffect, useMemo, useState } from "react";
import "../../assets/css/travel.css";
import CrossIcon from "../../assets/svgs/redCross.svg";
import OkCheckIcon from "../../assets/svgs/greenTic.svg";
import { Col, Row, Radio } from "antd";

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
    headers[0] ?? null
  );

  useEffect(() => {
    if (!selectedPlan && headers.length) setSelectedPlan(headers[0]);
    if (headers.length && !headers.includes(selectedPlan ?? ""))
      setSelectedPlan(headers[0]);
  }, [headers]);

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

  const renderFeature = (plan: any, featureKey: string) => {
    const segs = Array.isArray(plan?.segments) ? plan.segments : null;
    const showRouteLabel = segs && segs.length > 1;

    if (segs && segs.length > 1) {
      return (
        <div
          className={`parahAlign ${
            segs && segs.length > 1 ? "parahAlignMultiSeg" : ""
          }`}
        >
          {segs.map((s: any, i: number) => (
            <div
              key={`${featureKey}-${i}-${
                s?.flightNumber ?? s?.segmentKey ?? "seg"
              }`}
              className="pricingCardRouteSegments"
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
              <p style={{ margin: 0 }}>{s[featureKey] ?? "—"}</p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="parahAlign">
        <img
          src={
            plan?.[featureKey] && plan[featureKey] !== "—"
              ? OkCheckIcon
              : CrossIcon
          }
          alt=""
        />
        <p>{plan?.[featureKey] ?? "—"}</p>
      </div>
    );
  };

  return (
    <div>
      <div className="pricingCardsWrap">
        <Row>
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
              <Row key={`${item?.id ?? item?.offerId ?? idx}`}>
                {headers.map((hk) => {
                  const plan = item.price?.[hk] ?? {};
                  // const hasSegments = Array.isArray(plan?.segments) && plan.segments.length > 0;

                  return (
                    <Col
                      key={`${idx}-${hk}`}
                      span={colSpan}
                      className={selectedPlan === hk ? "activeCard" : ""}
                    >
                      <div className="priceCardHeadings">
                        <p>{plan.label ?? hk}</p>
                      </div>

                      {/* Personal items */}
                      {renderFeature(plan, "personalItem")}

                      {/* Baggage */}
                      {renderFeature(plan, "baggage")}

                      {/* Seat Selection */}
                      {renderFeature(plan, "seatSelection")}

                      {/* Changes */}
                      {renderFeature(plan, "Changes")}

                      {/* Refundable */}
                      {renderFeature(plan, "Refundable")}

                      {/* Price & Radio */}
                      <div className="cardPrice">
                        <p>
                          {plan.price != null ? `$${plan.price}` : "—"}
                          <span>/per seat</span>
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
  );
};

export default React.memo(PricingDetailCard);
