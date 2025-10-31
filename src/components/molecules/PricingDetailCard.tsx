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

  const [selectedPlan, setSelectedPlan] = useState<string | null>(headers[0] ?? null);

  useEffect(() => {
    if (!selectedPlan && headers.length) setSelectedPlan(headers[0]);
    if (headers.length && !headers.includes(selectedPlan ?? "")) setSelectedPlan(headers[0]);
  }, [headers]);

  if (!passSome || passSome.length === 0) return null;

  const colSpan = Math.max(6, Math.floor(24 / Math.max(1, headers.length)));

  const renderFeature = (plan: any, featureKey: string) => {
    const segs = Array.isArray(plan?.segments) ? plan.segments : null;
    const showRouteLabel = segs && segs.length > 1;

    if (segs && segs.length > 1) {
      return (
        <div className="parahAlign">
          {segs.map((s: any, i: number) => (
              <div key={`${featureKey}-${i}-${s?.flightNumber ?? s?.segmentKey ?? "seg"}`} className="pricingCardRouteSegments">
                {showRouteLabel && (
                  <span>
                    {s.label}
                  </span>
                )}
                <img
                  src={s[featureKey] && s[featureKey] !== "—" ? OkCheckIcon : CrossIcon}
                  alt={s[featureKey] && s[featureKey] !== "—" ? "included" : "not-included"}
                />
                <p style={{ margin: 0 }}>{s[featureKey] ?? "—"}</p>
              </div>
          ))}
        </div>
      );
    }


    return (
      <div className="parahAlign">
        <img src={plan?.[featureKey] && plan[featureKey] !== "—" ? OkCheckIcon : CrossIcon} alt="" />
        <p>{plan?.[featureKey] ?? "—"}</p>
      </div>
    );
  };

  return (
    <div>
      <div className="pricingCardsWrap">
        <Row>
          <Col span={3}>
            <div className="emptyLabel">
              <p>&nbsp;</p>
            </div>
            <div className="priceCardLabel"><p>Personal Items</p></div>
            <div className="priceCardLabel"><p>Baggage</p></div>
            <div className="priceCardLabel"><p>Seat Selection</p></div>
            <div className="priceCardLabel"><p>Changes</p></div>
            <div className="priceCardLabel"><p>Refundable</p></div>
            <div className="priceCardLabel"><p>&nbsp;</p></div>
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
                          className={`baggageRadio ${selectedPlan === hk ? "active" : ""}`}
                          checked={selectedPlan === hk}
                          onChange={() => setSelectedPlan(hk)}
                        >
                          {selectedPlan === hk ? "This option is selected" : "Select this option"}
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

// import React, { useEffect, useMemo, useState } from "react";
// import "../../assets/css/travel.css";
// import CrossIcon from "../../assets/svgs/redCross.svg";
// import OkCheckIcon from "../../assets/svgs/greenTic.svg";
// import { Col, Row, Radio } from "antd";

// type PricingDetailCardProps = {
//   passSome: any[];
// };

// const PricingDetailCard: React.FC<PricingDetailCardProps> = ({ passSome }) => {
//   const headers = useMemo(() => {
//     const set = new Set<string>();
//     (passSome || []).forEach((item) => {
//       const p = item?.price ?? {};
//       Object.keys(p).forEach((k) => set.add(k));
//     });
//     return Array.from(set);
//   }, [passSome]);

//   const [selectedPlan, setSelectedPlan] = useState<string | null>(headers[0] ?? null);

//   // keep selectedPlan in sync when headers change
//   useEffect(() => {
//     if (!selectedPlan && headers.length) setSelectedPlan(headers[0]);
//     if (headers.length && !headers.includes(selectedPlan ?? "")) setSelectedPlan(headers[0]);
//   }, [headers]);

//   if (!passSome || passSome.length === 0) return null;

//   const colSpan = Math.max(6, Math.floor(24 / Math.max(1, headers.length)));

//   return (
//     <div className="">
//       <div className="pricingCardsWrap">
//         <Row>
//           <Col span={3} className="">
//             <div className="emptyLabel">
//               <p>&nbsp;</p>
//             </div>
//             <div className="priceCardLabel">
//               <p>Personal Items</p>
//             </div>
//             <div className="priceCardLabel">
//               <p>Baggage</p>
//             </div>
//             <div className="priceCardLabel">
//               <p>Seat Selection</p>
//             </div>
//             <div className="priceCardLabel">
//               <p>Changes</p>
//             </div>
//             <div className="priceCardLabel">
//               <p>Refundable</p>
//             </div>
//             <div className="priceCardLabel">
//               <p>&nbsp;</p>
//             </div>
//           </Col>
//           <Col span={21} className="">
//             {passSome.map((item, idx) => (
//               <Row key={idx}>
//                 {headers.map((hk) => {
//                   const plan = item.price?.[hk] ?? {};
//                   return (
//                     <Col key={`${idx}-${hk}`} span={colSpan} className={selectedPlan === hk ? "activeCard" : ""}>
//                       <div className="priceCardHeadings">
//                         <p>{plan.label ?? hk}</p>
//                       </div>

//                       <div className="parahAlign">
//                         <img src={plan.personalItem && plan.personalItem !== "—" ? OkCheckIcon : CrossIcon} alt="" />
//                         <p>{plan.personalItem ?? "—"}</p>
//                       </div>

//                       <div className="parahAlign">
//                         <img src={plan.baggage && plan.baggage !== "—" ? OkCheckIcon : CrossIcon} alt="" />
//                         <p>{plan.baggage ?? "—"}</p>
//                       </div>

//                       <div className="parahAlign">
//                         <img src={plan.seatSelection && plan.seatSelection !== "—" ? OkCheckIcon : CrossIcon} alt="" />
//                         <p>{plan.seatSelection ?? "—"}</p>
//                       </div>

//                       <div className="parahAlign">
//                         <img src={plan.Changes && plan.Changes !== "—" ? OkCheckIcon : CrossIcon} alt="" />
//                         <p>{plan.Changes ?? "—"}</p>
//                       </div>

//                       <div className="parahAlign">
//                         <img src={plan.Refundable && plan.Refundable !== "No" ? OkCheckIcon : CrossIcon} alt="" />
//                         <p>{plan.Refundable ?? "No"}</p>
//                       </div>

//                       <div className="cardPrice">
//                         <p>
//                           {plan.price != null ? `$${plan.price}` : "—"}
//                           <span>/per seat</span>
//                         </p>

//                         <Radio
//                           className={`baggageRadio ${selectedPlan === hk ? "active" : ""}`}
//                           checked={selectedPlan === hk}
//                           onChange={() => setSelectedPlan(hk)}
//                         >
//                           {selectedPlan === hk ? "This option is selected" : "Select this option"}
//                         </Radio>
//                       </div>
//                     </Col>
//                   );
//                 })}
//               </Row>
//             ))}
//             {/* {passSome.map((item, index) => (
//               <Row>
//                 <Col
//                   key={index}
//                   span={8}
//                   className={selectedPlan === "economyLite" ? "activeCard" : ""}
//                 >
//                   <div className="priceCardHeadings">
//                     <p>Economy lite</p>
//                   </div>
//                   <div className="parahAlign">
//                     <img src={OkCheckIcon} alt="" />
//                     <p>{item.price.economyLite.personalItem}</p>
//                   </div>
//                   <div className="parahAlign">
//                     <img src={CrossIcon} alt="" />
//                     <p>{item.price.economyLite.baggage}</p>
//                   </div>
//                   <div className="parahAlign">
//                     <img src={CrossIcon} alt="" />
//                     <p>{item.price.economyLite.seatSelection}</p>
//                   </div>
//                   <div className="parahAlign">
//                     <img src={CrossIcon} alt="" />
//                     <p>{item.price.economyLite.Changes}</p>
//                   </div>
//                   <div className="parahAlign">
//                     <img src={CrossIcon} alt="" />
//                     <p>{item.price.economyLite.Refundable}</p>
//                   </div>

//                   <div className="cardPrice">
//                     <p>
//                       ${item.price.economyLite.price}
//                       <span>/per seat</span>
//                     </p>
//                     <Radio
//                       className={`baggageRadio ${selectedPlan === "economyLite" ? "active" : ""
//                         }`}
//                       checked={selectedPlan === "economyLite"}
//                       onChange={() => setSelectedPlan("economyLite")}
//                     >
//                       {selectedPlan === "economyLite"
//                         ? "This option is selected"
//                         : "Select this option"}
//                     </Radio>
//                   </div>
//                 </Col>
//                 <Col
//                   key={index}
//                   span={8}
//                   className={
//                     selectedPlan === "economyStandard" ? "activeCard" : ""
//                   }
//                 >
//                   <div className="priceCardHeadings">
//                     <p>Economy Standard</p>
//                   </div>
//                   <div className="parahAlign">
//                     <img src={OkCheckIcon} alt="" />
//                     <p>{item.price.economyStandard.personalItem}</p>
//                   </div>
//                   <div className="parahAlign">
//                     <img src={CrossIcon} alt="" />
//                     <p>{item.price.economyStandard.baggage}</p>
//                   </div>
//                   <div className="parahAlign">
//                     <img src={OkCheckIcon} alt="" />
//                     <p>{item.price.economyStandard.seatSelection}</p>
//                   </div>
//                   <div className="parahAlign">
//                     <img src={OkCheckIcon} alt="" />
//                     <p>{item.price.economyStandard.Changes}</p>
//                   </div>
//                   <div className="parahAlign">
//                     <img src={CrossIcon} alt="" />
//                     {item.price.economyStandard.Refundable}
//                   </div>

//                   <div className="cardPrice">
//                     <p>
//                       ${item.price.economyStandard.price}
//                       <span>/per seat</span>
//                     </p>
//                     <Radio
//                       className={`baggageRadio ${selectedPlan === "economyStandard" ? "active" : ""
//                         }`}
//                       checked={selectedPlan === "economyStandard"}
//                       onChange={() => setSelectedPlan("economyStandard")}
//                     >
//                       {selectedPlan === "economyStandard"
//                         ? "This option is selected"
//                         : "Select this option"}
//                     </Radio>
//                   </div>
//                 </Col>
//                 <Col
//                   key={index}
//                   span={8}
//                   className={selectedPlan === "economyFlex" ? "activeCard" : ""}
//                 >
//                   <div className="priceCardHeadings">
//                     <p>Economy Flex</p>
//                   </div>
//                   <div className="parahAlign">
//                     <img src={OkCheckIcon} alt="" />
//                     <p>{item.price.economyFlex.personalItem}</p>
//                   </div>
//                   <div className="parahAlign">
//                     <img src={CrossIcon} alt="" />
//                     <p>{item.price.economyFlex.baggage}</p>
//                   </div>
//                   <div className="parahAlign">
//                     <img src={OkCheckIcon} alt="" />
//                     <p>{item.price.economyFlex.seatSelection}</p>
//                   </div>
//                   <div className="parahAlign">
//                     <img src={OkCheckIcon} alt="" />
//                     <p>{item.price.economyFlex.Changes}</p>
//                   </div>
//                   <div className="parahAlign">
//                     <img src={OkCheckIcon} alt="" />
//                     <p>{item.price.economyFlex.Refundable}</p>
//                   </div>

//                   <div className="cardPrice">
//                     <p>
//                       ${item.price.economyFlex.price}
//                       <span>/per seat</span>
//                     </p>
//                     <Radio
//                       className={`baggageRadio ${selectedPlan === "economyFlex" ? "active" : ""
//                         }`}
//                       checked={selectedPlan === "economyFlex"}
//                       onChange={() => setSelectedPlan("economyFlex")}
//                     >
//                       {selectedPlan === "economyFlex"
//                         ? "This option is selected"
//                         : "Select this option"}
//                     </Radio>
//                   </div>
//                 </Col>
//               </Row>
//             ))} */}
//           </Col>
//         </Row>
//       </div>
//     </div>
//   );
// };

// export default PricingDetailCard;
