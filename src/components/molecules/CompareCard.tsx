import React, { useEffect, useState } from "react";
import "../../assets/css/travel.css";
import { Col, Row, Modal } from "antd";

import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import entertainmentIcon from "../../assets/svgs/entertainment.svg";
import mealIcon from "../../assets/svgs/meals.svg";
import portsIcon from "../../assets/svgs/ports.svg";
import wifiIcon from "../../assets/svgs/wifi.svg";
import flightIcon from "../../assets/svgs/flightIcon.svg";
import seaticon from "../../assets/svgs/seatsicon.svg";

import circlePlus from "../../assets/svgs/plus-circle.svg";
type CompareCardProps = {
  availableFlights?: any[]; // items can be one-way (flight_detail) or round-trip (outbound+inbound)
};

const CompareCard: React.FC<CompareCardProps> = ({ availableFlights = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFlightData, setNewFlightData] = useState<any[]>([]);
  const [localAvailable, setLocalAvailable] = useState<any[]>([]);

  useEffect(() => {
    setLocalAvailable(Array.isArray(availableFlights) ? [...availableFlights] : []);
  }, [availableFlights]);

  const showModalCompare = () => setIsModalOpen(true);
  const handleCancelCompare = () => setIsModalOpen(false);

  const addFlightToCompare = (item: any) => {
    if (!item) return;
    // avoid duplicates
    setNewFlightData((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev;
      return [...prev, item];
    });
    // remove from modal list
    setLocalAvailable((prev) => prev.filter((p) => p.id !== item.id));
    setIsModalOpen(false);
  };

  const removeFromCompare = (itemId: any) => {
    setNewFlightData((prev) => {
      const removedItem = prev.find((p) => p.id === itemId);
      const remaining = prev.filter((p) => p.id !== itemId);
      if (removedItem) {
        setLocalAvailable((availPrev) => {
          // if it's already present in modal, don't duplicate
          if (availPrev.some((a) => a.id === removedItem.id)) return availPrev;
          return [removedItem, ...availPrev];
        });
      }
      return remaining;
    });
  };

  // helper to render a single segment (brief summary)
  const renderSegmentSummary = (seg: any) => {
    if (!seg) return null;
    const fd = seg.flight_detail ?? {};
    const flightNum = fd.flight_number ?? fd.flightNumber ?? "...";
    const flightClass = fd.flight_class ?? fd.cabinClass ?? "—";
    const startTime = fd.start_time ?? fd.startTime ?? fd.start_date ?? fd.departureDateTime ?? "—";
    const endTime = fd.end_time ?? fd.endTime ?? fd.arrivalDateTime ?? "—";
    const startDate = fd.start_date ?? fd.startDate ?? "—";
    const endDate = fd.end_date ?? fd.endDate ?? "—";
    const duration = fd.duration ?? seg.duration ?? "—";
    const logo = seg.logo ?? `/airlines/${(fd.marketingAirline || seg.name || "default")}.png`;

    return (
      <div className="RoundTripCardDetail" style={{ marginBottom: 8 }}>
        <div className="fightTitle">
          <div className="flightIcon">
            <img src={logo} alt="" />
          </div>
          <div className="nameAndDetails">
            <h5>{seg.name ?? fd.marketingAirline ?? "Airline"}</h5>
            <p>{flightNum} • {flightClass}</p>
          </div>
        </div>

        <div className="flightTiming">
          <div className="startTime">
            <h5>{startTime}</h5>
            <p>{startDate}</p>
          </div>

          <div className="FlightDirection">
            <div className="visualGuid">
              <div className="stopPoint" />
              <div className="stopsDetail">
                <span>{duration}</span>
                <div className="" />
                <span>{(seg.stop && seg.stop.length > 0) ? `${seg.stop.length} stop(s)` : "Direct"}</span>
              </div>
              <div className="stopPoint" />
            </div>
          </div>

          <div className="EndTime">
            <h5>{endTime}</h5>
            <p>{endDate}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCompareCard = (item: any) => {
    const isRound = !!(item as any).outbound || !!(item as any).inbound;
    const idKey = item.id ?? Math.random().toString(36).slice(2, 9);
    const segClass = (seg: any) => seg?.flight_detail?.flight_class ?? seg?.cabinClass ?? "Economy";
    const segBaggage = (seg: any) =>
      seg?.baggageChecked ?? seg?.baggageCarry ?? seg?.rawSegment?.baggageAllowance?.checkedInBaggage?.[0]?.value ?? "—";
    const segSeats = (seg: any) => seg?.seatsAvailable ?? seg?.rawSegment?.seatsAvailable ?? null;
    const segDuration = (seg: any) => seg?.flight_detail?.duration ?? seg?.duration ?? "—";
    const segEquipment = (seg: any) => seg?.equipment ?? seg?.rawSegment?.equipmentName ?? null;


    if (isRound) {
      const outbound = (item as any).outbound ?? null;
      const inbound = (item as any).inbound ?? null;
      const displayPrice =
        (item as any).totalFare ??
        item.price?.economyLite?.price ??
        item.totalFare ??
        "—";
      const currency = (item as any).currency ?? item.price?.currency ?? item.fare?.currencyCode ?? "";

      // choose representative small-values for the feature row (prefer outbound, fallback inbound)
      const repSeg = outbound ?? inbound ?? item;
      const cabin = segClass(repSeg);
      const baggage = segBaggage(repSeg);
      const seats = segSeats(repSeg);
      const duration = segDuration(repSeg);
      const equipment = segEquipment(repSeg);

      return (
        <Col span={8} key={idKey} className="">
          <div className="compareCard">
            <div className="cardHeader">
              This Flight
              <button
                style={{ float: "right", background: "transparent", border: "none", cursor: "pointer" }}
                onClick={() => removeFromCompare(item.id ?? item.offerId)}
                aria-label="Remove"
                title="Remove"
              >
                ✕
              </button>
            </div>

            <div className="cardBody">
              {/* outbound + inbound summaries */}
              {outbound && renderSegmentSummary(outbound)}
              {inbound && renderSegmentSummary(inbound)}

              <div className="StartingPrice" style={{ marginTop: 6 }}>
                <span>Start from</span>
                <h5>{currency} {displayPrice}</h5>
              </div>

              {/* featureImgs — same layout as your one-way block but using representative segs */}
              <div className="featureImgs" style={{ marginTop: 10 }}>
                <Row className="featureImgsFlex">
                  <Col span={10} className="featureIconText">
                    <img src={cabinIcon} alt="" />
                    <p>Cabin: {cabin}</p>
                  </Col>

                  <Col span={6} className="featureIconText">
                    <img src={baggageIcon} alt="" />
                    <p>Baggage: {baggage}</p>
                  </Col>

                  <Col span={8} className="featureIconText">
                    {seats ? (
                      <>
                        <img src={portsIcon} alt="" />
                        <p>Seats: {seats}</p>
                      </>
                    ) : null}
                  </Col>

                  <Col span={6} className="featureIconText">
                    {duration ? (
                      <>
                        <img src={wifiIcon} alt="" />
                        <p>{duration}</p>
                      </>
                    ) : null}
                  </Col>

                  <Col span={8} className="featureIconText">
                    <img src={mealIcon} alt="" />
                    <p>{item.refundable ?? outbound?.refundable ?? inbound?.refundable ? "Refundable" : "Non-Refundable"}</p>
                  </Col>

                  <Col span={8} className="featureIconText">
                    {equipment ? (
                      <>
                        <img src={entertainmentIcon} alt="" />
                        <p>{equipment}</p>
                      </>
                    ) : null}
                  </Col>
                </Row>
              </div>

              {/* small summary / seat layout */}
              <div className="flightSeats" style={{ marginTop: 12 }}>
                <div className="flightDetail">
                  <div className="flighticon"><img src={flightIcon} alt="" /></div>
                  <div>
                    <p className="parahOne">{item.name ?? "Round-trip"}</p>
                    <p className="parahTwo">
                      {outbound ? `Out: ${outbound.flight_detail?.flight_number} • ${outbound.flight_detail?.start_time} → ${outbound.flight_detail?.end_time}` : ""}
                      {outbound && inbound ? <br /> : null}
                      {inbound ? `In: ${inbound.flight_detail?.flight_number} • ${inbound.flight_detail?.start_time} → ${inbound.flight_detail?.end_time}` : ""}
                    </p>
                  </div>
                </div>

                <div className="SeatDetail">
                  <div className="seatIcon"><img src={seaticon} alt="" /></div>
                  <div>
                    <p className="parahTwo">
                      Segments: {outbound ? 1 : 0} ↔ {inbound ? 1 : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      );
    }

    // one-way card (legacy style)
    return (
      <Col span={8} key={idKey} className="">
        <div className="compareCard">
          <div className="cardHeader">
            This Flight
            <button
              style={{ float: "right", background: "transparent", border: "none", cursor: "pointer" }}
              onClick={() => removeFromCompare(item.id)}
              aria-label="Remove"
              title="Remove"
            >
              ✕
            </button>
          </div>

          <div className="cardBody">
            <div className="modalFlightDetail">
              <div className="fightTitle">
                <div className="flightIcon">
                  <img src={item.logo} alt="" />
                </div>
                <div className="nameAndDetails">
                  <h5>{item.name}</h5>
                  <p>{item.flight_detail?.flight_number} • {item.flight_detail?.flight_class}</p>
                </div>
              </div>

              <div className="StartingPrice">
                <p>Start from</p>
                <h5>
                  {item.currency ?? ""} {item.price?.economyLite?.price ?? item.totalFare ?? "—"}
                  <span>/per seat</span>
                </h5>
              </div>
            </div>

            <div className="featureImgs">
              <Row className="featureImgsFlex">
                <Col span={10} className="featureIconText">
                  <img src={cabinIcon} alt="" />
                  <p>Cabin: {item.flight_detail?.flight_class ?? "Economy"}</p>
                </Col>
                <Col span={6} className="featureIconText">
                  <img src={baggageIcon} alt="" />
                  <p>{item.baggageChecked ?? item.baggageCarry ?? "—"}</p>
                </Col>
                <Col span={8} className="featureIconText">
                  {item.seatsAvailable && <>
                    <img src={portsIcon} alt="" />
                    <p>Seats: {item.seatsAvailable}</p>
                  </>}
                </Col>
                <Col span={6} className="featureIconText">
                  {item.duration && <>
                    <img src={wifiIcon} alt="" />
                    <p>{item.duration}</p>
                  </>}
                </Col>
                <Col span={8} className="featureIconText">
                  <img src={mealIcon} alt="" />
                  <p>{item.refundable ? 'Refundable' : 'Non-Refundable'}</p>
                </Col>
                <Col span={8} className="featureIconText">
                  {item.equipment && <>
                    <img src={entertainmentIcon} alt="" />
                    <p>{item.equipment}</p>
                  </>}
                </Col>
              </Row>
            </div>

            <div className="flightSeats">
              <div className="flightDetail">
                <div className="flighticon">
                  <img src={flightIcon} alt="" />
                </div>
                <div>
                  <p className="parahOne">{item?.name}</p>
                  <p className="parahTwo">{item?.flight_detail?.flight_number}</p>
                </div>
              </div>

              <div className="SeatDetail">
                <div className="seatIcon">
                  <img src={seaticon} alt="" />
                </div>
                <div>
                  <p className="parahTwo">{item?.flight_detail?.flight_number} • {item?.flight_detail?.start_time} → {item?.flight_detail?.end_time}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Col>
    );
  };

  return (
    <div className="">
      <div className="pricingCardsWrap">
        <Row className="compareCardsFlex">
          {newFlightData.map((item) => renderCompareCard(item))}
          <Col span={8}>
            <div className="compareModalButton" onClick={showModalCompare}>
              <img src={circlePlus} alt="" />
              <p>Add another flight to compare</p>
            </div>
          </Col>
        </Row>
      </div>

      <Modal
        title={
          <div className="modalHeader" style={{ textAlign: "center" }}>
            <h2>Add another flight</h2>
            <p>Compare the flights from this listing to see what suits you best</p>
          </div>
        }
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        footer={null}
        centered
        onCancel={handleCancelCompare}
        className="compareModal"
      >
        <div className="compareModalBody">
          {(!localAvailable || localAvailable.length === 0) ? (
            <p>No other flights to show</p>
          ) : (
            localAvailable.map((item, index) => {
              const isRound = !!(item as any).outbound || !!(item as any).inbound;
              return (
                <div key={item.id ?? index} className="modalFlightDetailCard" onClick={() => addFlightToCompare(item)}>
                  <div className="modalFlightDetail">
                    {isRound ? (
                      <div style={{ display: "flex", gap: 12, flexDirection: "column", alignItems: "center" }}>
                        <div style={{ flex: 1 }}>{renderSegmentSummary((item as any).outbound ?? (item as any).outbound)}</div>
                        <div style={{ flex: 1 }}>{renderSegmentSummary((item as any).inbound ?? (item as any).inbound)}</div>
                      </div>
                    ) : (
                      <>
                        <div className="fightTitle">
                          <div className="flightIcon">
                            <img src={item.logo} alt="" />
                          </div>
                          <div className="nameAndDetails">
                            <h5>{item.name}</h5>
                            <p>{item.flight_detail?.flight_number} - {item.flight_detail?.flight_class}</p>
                          </div>
                        </div>

                        <div className="featureIcons" style={{ marginTop: 8 }}>
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            {/* <div style={{ display: "flex", alignItems: "center" }}>
                              <img src={baggageIcon} alt="" />
                              <span style={{ marginLeft: 6 }}>{item.baggageChecked ?? item.baggageCarry ?? "-"}</span>
                            </div> */}
                            <div>
                              <strong>{item.currency ?? ""} {item.price?.economyLite?.price ?? item.totalFare ?? "-"}</strong>/per seat
                              {/* <div style={{ fontSize: 12 }}>{item.refundable ? "Refundable" : "Non-refundable"}</div> */}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* timing block for single-segment items */}
                  {!isRound && item.flight_detail && (
                    <div className="modalFlightTiming">
                      <div className="flightTiming">
                        <div className="startTime">
                          <h5>{item.flight_detail?.start_time}</h5>
                          <p>{item.flight_detail?.start_date}</p>
                        </div>
                        <div className="FlightDirection">
                          <div className="visualGuid">
                            <div className="stopPoint"></div>
                            {Array.isArray(item.stop) && item.stop.length > 0 ? (
                              item.stop.map((s: any, i: number) => (
                                <div key={i} className="stopsDetail">
                                  <span>{s?.stayTime}</span>
                                  <div className="stopPoint stopDots"></div>
                                  <span>{s?.name}</span>
                                </div>
                              ))
                            ) : (
                              <div className="stopsDetail">
                                <span>{item.flight_detail?.duration ?? "—"}</span>
                                <div />
                                <span>Direct</span>
                              </div>
                            )}
                            <div className="stopPoint"></div>
                          </div>
                        </div>
                        <div className="EndTime">
                          <h5>{item.flight_detail?.end_time}</h5>
                          <p>{item.flight_detail?.end_date}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CompareCard;
