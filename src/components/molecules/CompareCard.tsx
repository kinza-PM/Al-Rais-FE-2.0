import React, { useEffect, useState } from "react";
import "../../assets/css/travel.css";
import { Col, Row, Modal } from "antd";

import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
// import entertainmentIcon from "../../assets/svgs/entertainment.svg";
// import mealIcon from "../../assets/svgs/meals.svg";
// import portsIcon from "../../assets/svgs/ports.svg";
// import wifiIcon from "../../assets/svgs/wifi.svg";
import flightIcon from "../../assets/svgs/flightIcon.svg";
import seaticon from "../../assets/svgs/seatsicon.svg";
import durationIcon from "../../assets/svgs/duration.svg";
import refundableIcon from "../../assets/svgs/redundable.svg";
import SEAT_ICON from "../../assets/svgs/seat.svg";
import PLANE_ICON from "../../assets/svgs/plane.svg";

import circlePlus from "../../assets/svgs/plus-circle.svg";
import { formatDate, formatTime } from "../../utils/helpers";
type CompareCardProps = {
  availableFlights?: any[];
  currentFlight?: any;
};

const CompareCard: React.FC<CompareCardProps> = ({
  availableFlights = [],
  currentFlight = null,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFlightData, setNewFlightData] = useState<any[]>([]);
  const [localAvailable, setLocalAvailable] = useState<any[]>([]);
  const [isCurrentPinned, setIsCurrentPinned] = useState(false);
  // console.log("available->", availableFlights);
  const normalize = (x: any) => (x == null ? x : String(x));

  useEffect(() => {
    const base = Array.isArray(availableFlights) ? [...availableFlights] : [];
    const excludeId = normalize(
      currentFlight?.id ??
        currentFlight?.offerId ??
        currentFlight?.rawMinimal?.offerId
    );
    const filtered = base.filter((f) => {
      const fid = normalize(f?.id ?? f?.offerId ?? f?.raw?.offerId);
      return fid !== excludeId;
    });

    setLocalAvailable(filtered);
    setNewFlightData([]);
    setIsCurrentPinned(false);
  }, [availableFlights, currentFlight]);

  // Normalize any leg (outbound/inbound) into an array of segment-shaped items compatible with renderSegmentSummary
  const normalizeLegSegments = (leg: any): any[] => {
    if (!leg) return [];
    if (Array.isArray(leg.segments) && leg.segments.length > 0)
      return leg.segments;
    const rawSegs = leg?.raw?.journey?.[0]?.flightSegments;
    if (Array.isArray(rawSegs) && rawSegs.length > 0) {
      return rawSegs.map((s: any) => ({
        name: leg.name,
        logo: leg.logo,
        stop: [],
        flight_detail: {
          ...(leg.flight_detail || {}),
          flight_number: s?.flightNumber ?? leg.flight_detail?.flight_number,
          flight_class:
            s?.cabinClass ?? s?.cabin ?? leg.flight_detail?.flight_class,
          start_time: s?.departureDateTime
            ? formatTime(s?.departureDateTime)
            : leg.flight_detail?.start_time,
          start_date: s?.departureDateTime
            ? formatDate(s?.departureDateTime)
            : leg.flight_detail?.start_date,
          end_time: s?.arrivalDateTime
            ? formatTime(s?.arrivalDateTime)
            : leg.flight_detail?.end_time,
          end_date: s?.arrivalDateTime
            ? formatDate(s?.arrivalDateTime)
            : leg.flight_detail?.end_date,
          duration: s?.duration ?? leg.flight_detail?.duration,
          marketingAirline: s?.marketingAirline,
        },
        duration: s?.duration,
        fromCode: s?.departureAirportCode,
        toCode: s?.arrivalAirportCode,
        equipment: s?.equipmentName ?? s?.equipmentType ?? null,
        seatsAvailable: s?.seatsAvailable ?? null,
        refundable:
          leg?.refundable ?? leg?.raw?.fare?.fareType?.refundable ?? false,
        baggageChecked: s?.baggageAllowance?.checkedInBaggage?.[0]
          ? `${s?.baggageAllowance?.checkedInBaggage?.[0]?.value}${
              s?.baggageAllowance?.checkedInBaggage?.[0]?.unit ?? ""
            }`
          : null,
        baggageCarry: s?.baggageAllowance?.carryOnBaggage?.[0]
          ? `${s?.baggageAllowance?.carryOnBaggage?.[0]?.value}${
              s?.baggageAllowance?.carryOnBaggage?.[0]?.unit ?? ""
            }`
          : null,
      }));
    }
    return [leg];
  };

  // Normalize a one-way item into segments
  const normalizeOneWaySegments = (it: any): any[] => {
    if (!it) return [];
    if (Array.isArray(it.segments) && it.segments.length > 0)
      return it.segments;
    const rawSegs = it?.raw?.journey?.[0]?.flightSegments;
    if (Array.isArray(rawSegs) && rawSegs.length > 0) {
      return rawSegs.map((s: any) => ({
        name: it.name,
        logo: it.logo,
        stop: [],
        flight_detail: {
          ...(it.flight_detail || {}),
          flight_number: s?.flightNumber ?? it.flight_detail?.flight_number,
          flight_class:
            s?.cabinClass ?? s?.cabin ?? it.flight_detail?.flight_class,
          start_time: s?.departureDateTime
            ? formatTime(s?.departureDateTime)
            : it.flight_detail?.start_time,
          start_date: s?.departureDateTime
            ? formatDate(s?.departureDateTime)
            : it.flight_detail?.start_date,
          end_time: s?.arrivalDateTime
            ? formatTime(s?.arrivalDateTime)
            : it.flight_detail?.end_time,
          end_date: s?.arrivalDateTime
            ? formatDate(s?.arrivalDateTime)
            : it.flight_detail?.end_date,
          duration: s?.duration ?? it.flight_detail?.duration,
          marketingAirline: s?.marketingAirline,
        },
        duration: s?.duration,
        fromCode: s?.departureAirportCode,
        toCode: s?.arrivalAirportCode,
        equipment: s?.equipmentName ?? s?.equipmentType ?? null,
        seatsAvailable: s?.seatsAvailable ?? null,
        refundable:
          it?.refundable ?? it?.raw?.fare?.fareType?.refundable ?? false,
        baggageChecked: s?.baggageAllowance?.checkedInBaggage?.[0]
          ? `${s?.baggageAllowance?.checkedInBaggage?.[0]?.value}${
              s?.baggageAllowance?.checkedInBaggage?.[0]?.unit ?? ""
            }`
          : null,
        baggageCarry: s?.baggageAllowance?.carryOnBaggage?.[0]
          ? `${s?.baggageAllowance?.carryOnBaggage?.[0]?.value}${
              s?.baggageAllowance?.carryOnBaggage?.[0]?.unit ?? ""
            }`
          : null,
      }));
    }
    return [];
  };

  const showModalCompare = () => setIsModalOpen(true);
  const handleCancelCompare = () => setIsModalOpen(false);

  const addFlightToCompare = (item: any) => {
    if (!item) return;
    const itemId = normalize(
      item.id ?? item.offerId ?? item.rawMinimal?.offerId
    );

    setNewFlightData((prev) => {
      if (
        prev.some(
          (p) =>
            normalize(p.id ?? p.offerId ?? p.rawMinimal?.offerId) === itemId
        )
      )
        return prev;

      if (!isCurrentPinned && currentFlight) {
        const newArr = [currentFlight, item];
        setIsCurrentPinned(true);
        return newArr;
      }
      return [...prev, item];
    });
    setLocalAvailable((prev) =>
      prev.filter(
        (p) => normalize(p.id ?? p.offerId ?? p.raw?.offerId) !== itemId
      )
    );
    setIsModalOpen(false);
  };

  const removeFromCompare = (itemIdRaw: any) => {
    const itemId = normalize(itemIdRaw);
    const currentId = currentFlight
      ? normalize(
          currentFlight.id ??
            currentFlight.offerId ??
            currentFlight.rawMinimal?.offerId
        )
      : null;

    if (isCurrentPinned && currentId && itemId === currentId) {
      return;
    }

    setNewFlightData((prev) => {
      const removedItem = prev.find(
        (p) => normalize(p.id ?? p.offerId ?? p.rawMinimal?.offerId) === itemId
      );
      const remaining = prev.filter(
        (p) => normalize(p.id ?? p.offerId ?? p.rawMinimal?.offerId) !== itemId
      );
      if (isCurrentPinned && currentId) {
        if (
          remaining.length === 0 ||
          (remaining.length === 1 &&
            normalize(
              remaining[0].id ??
                remaining[0].offerId ??
                remaining[0].rawMinimal?.offerId
            ) === currentId)
        ) {
          setLocalAvailable((availPrev) => {
            if (!currentFlight) return availPrev;
            const curId = currentId;
            if (
              availPrev.some(
                (a) => normalize(a.id ?? a.offerId ?? a.raw?.offerId) === curId
              )
            )
              return availPrev;
            return [currentFlight, ...availPrev];
          });
          setIsCurrentPinned(false);
          return [];
        }
      }
      if (removedItem) {
        setLocalAvailable((availPrev) => {
          if (
            availPrev.some(
              (a) => normalize(a.id ?? a.offerId ?? a.raw?.offerId) === itemId
            )
          )
            return availPrev;
          return [removedItem, ...availPrev];
        });
      }

      return remaining;
    });
  };

  // helper to render a single segment (brief summary)
  const renderSegmentSummary = (seg: any, opts?: { showIcons?: boolean }) => {
    if (!seg) return null;
    const showIcons = !!opts?.showIcons;
    const fd = seg.flight_detail ?? {};
    const flightNum = fd.flight_number ?? fd.flightNumber ?? "...";
    const flightClass = fd.flight_class ?? fd.cabinClass ?? "—";
    const startTime =
      fd.start_time ??
      fd.startTime ??
      fd.start_date ??
      fd.departureDateTime ??
      "—";
    const endTime = fd.end_time ?? fd.endTime ?? fd.arrivalDateTime ?? "—";
    const startDate = fd.start_date ?? fd.startDate ?? "—";
    const endDate = fd.end_date ?? fd.endDate ?? "—";
    const duration = fd.duration ?? seg.duration ?? "—";
    const logo =
      seg.logo ??
      `/airlines/${fd.marketingAirline || seg.name || "default"}.png`;
    const route =
      seg.fromCode && seg.toCode ? `${seg.fromCode} → ${seg.toCode}` : null;

    return (
      <div className="RoundTripCardDetail" style={{ marginBottom: 8 }}>
        <div className="fightTitle">
          <div className="flightIcon">
            <img src={logo} alt="" />
          </div>
          <div className="nameAndDetails">
            <h5>
              {seg.name ?? fd.marketingAirline ?? "Airline"}
              {route ? ` - (${route})` : ""}
            </h5>
            <p>
              {flightNum} • {flightClass}
            </p>
          </div>
          {showIcons && (
            <div className="featureIcons ml-auto pr-5">
              <span className="featureIconTooltipWrap">
                <img src={cabinIcon} alt="cabin" />
                <span className="tooltip">Cabin: {flightClass}</span>
              </span>
              {seg.baggageChecked && (
                <span className="featureIconTooltipWrap">
                  <img src={baggageIcon} alt="baggage" />
                  <span className="tooltip">Baggage: {seg.baggageChecked}</span>
                </span>
              )}
              {seg.seatsAvailable && (
                <span className="featureIconTooltipWrap">
                  <img src={SEAT_ICON} alt="seats" />
                  <span className="tooltip">Seats: {seg.seatsAvailable}</span>
                </span>
              )}
              <span className="featureIconTooltipWrap">
                <img src={refundableIcon} alt="meal" />
                <span className="tooltip">
                  {seg.refundable ? "Refundable" : "Non-Refundable"}
                </span>
              </span>
              {duration && (
                <span className="featureIconTooltipWrap">
                  <img src={durationIcon} alt="duration" />
                  <span className="tooltip">Duration: {duration}</span>
                </span>
              )}
              {seg.equipment && (
                <span className="featureIconTooltipWrap">
                  <img src={PLANE_ICON} alt="equipment" />
                  <span className="tooltip">{seg.equipment}</span>
                </span>
              )}
            </div>
          )}
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
                <span>
                  {seg.stop && seg.stop.length > 0
                    ? `${seg.stop.length} stop(s)`
                    : "Direct"}
                </span>
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

  // Timing + layover summary similar to FlightTimingAndStops.tsx
  const renderTimingAndStops = (passSome: any, key: string) => {
    if (!passSome) return null;
    const flightSegments =
      passSome?.segments ??
      passSome?.raw?.journey?.[0]?.flightSegments ??
      passSome?.rawMinimal?.journey?.[0]?.flightSegments ??
      [];
    const hasMultipleSegments =
      Array.isArray(flightSegments) && flightSegments.length > 1;

    const firstSegment =
      Array.isArray(flightSegments) && flightSegments.length > 0
        ? flightSegments[0]
        : null;
    const lastSegment =
      Array.isArray(flightSegments) && flightSegments.length > 0
        ? flightSegments[flightSegments.length - 1]
        : null;

    const startTime = firstSegment?.departureDateTime
      ? formatTime(firstSegment.departureDateTime)
      : passSome?.flight_detail?.start_time ?? "";
    const startDate = firstSegment?.departureDateTime
      ? formatDate(firstSegment.departureDateTime)
      : passSome?.flight_detail?.start_date ?? "";
    const endTime = lastSegment?.arrivalDateTime
      ? formatTime(lastSegment.arrivalDateTime)
      : passSome?.flight_detail?.end_time ?? "";
    const endDate = lastSegment?.arrivalDateTime
      ? formatDate(lastSegment.arrivalDateTime)
      : passSome?.flight_detail?.end_date ?? "";

    const secondSegment = hasMultipleSegments ? flightSegments[1] : null;
    const firstDuration = firstSegment?.duration ?? "";
    const secondDuration = secondSegment?.duration ?? "";
    const layoverTime = secondSegment?.layoverTime ?? "";
    const stopAirport = secondSegment?.departureAirportCode ?? "";

    const marketingAirline =
      passSome?.flight_detail?.marketingAirline ??
      firstSegment?.marketingAirline ??
      passSome?.name ??
      "Airline";
    const operatingAirline =
      passSome?.flight_detail?.operatingAirline ??
      firstSegment?.operatingAirline ??
      null;
    const airlineDisplay = operatingAirline
      ? `${marketingAirline} / ${operatingAirline}`
      : marketingAirline;
    const flightNumber =
      passSome?.flight_detail?.flight_number ??
      firstSegment?.flightNumber ??
      "—";
    const flightClass =
      passSome?.flight_detail?.flight_class ?? firstSegment?.cabinClass ?? "—";
    const logo =
      passSome?.logo ?? `/airlines/${marketingAirline || "default"}.png`;

    const renderStops = () => {
      if (passSome?.stop?.length) {
        return passSome.stop.map((s: any, i: number) => (
          <div className="stopsDetail" key={`${key}-stop-${i}`}>
            <span>{s?.stayTime}</span>
            <div className="stopPoint stopDots" />
            <span>{s?.name}</span>
          </div>
        ));
      }
      if (hasMultipleSegments) {
        return (
          <>
            <span className="mb-5">{firstDuration}</span>
            <div className="stopsDetail mb-4">
              <span>{layoverTime || "Layover"}</span>
              <div className="stopPoint stopDots" />
              <span>{stopAirport}</span>
            </div>
            <span className="mb-5">{secondDuration}</span>
          </>
        );
      }
      return (
        <div className="stopsDetail">
          <span>
            {passSome?.flight_detail?.duration ?? firstDuration ?? "—"}
          </span>
          <div />
          <span>Direct</span>
        </div>
      );
    };

    return (
      <div style={{ marginTop: 8 }} key={key}>
        <div className="fightTitle" style={{ marginBottom: 8 }}>
          <div className="flightIcon">
            <img src={logo} alt="" />
          </div>
          <div className="nameAndDetails">
            <h5>{airlineDisplay}</h5>
            <p>
              {flightNumber} • {flightClass}
            </p>
          </div>
        </div>
        <div className="flightTiming">
          <div className="startTime">
            <h5>{startTime || "—"}</h5>
            <p>{startDate || ""}</p>
          </div>
          <div className="FlightDirection">
            <div className="visualGuid">
              <div className="stopPoint" />
              {renderStops()}
              <div className="stopPoint" />
            </div>
          </div>
          <div className="EndTime">
            <h5>{endTime || "—"}</h5>
            <p>{endDate || ""}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCompareCard = (item: any) => {
    const isRound = !!(item as any).outbound || !!(item as any).inbound;
    const idKey = item.id ?? Math.random().toString(36).slice(2, 9);
    const removeId = item.id ?? item.offerId;
    const isCurrent =
      currentFlight && (currentFlight.id ?? currentFlight.offerId) === removeId;

    // const segClass = (seg: any) => seg?.flight_detail?.flight_class ?? seg?.cabinClass ?? "Economy";
    // const segBaggage = (seg: any) =>
    //   seg?.baggageChecked ?? seg?.baggageCarry ?? seg?.rawSegment?.baggageAllowance?.checkedInBaggage?.[0]?.value ?? "—";
    // const segSeats = (seg: any) => seg?.seatsAvailable ?? seg?.rawSegment?.seatsAvailable ?? null;
    // const segDuration = (seg: any) => seg?.flight_detail?.duration ?? seg?.duration ?? "—";
    // const segEquipment = (seg: any) => seg?.equipment ?? seg?.rawSegment?.equipmentName ?? null;

    if (isRound) {
      const outbound = (item as any).outbound ?? null;
      const inbound = (item as any).inbound ?? null;
      const displayPrice =
        (item as any).totalFare ??
        item.price?.economyLite?.price ??
        item.totalFare ??
        "—";
      const currency =
        (item as any).currency ??
        item.price?.currency ??
        item.fare?.currencyCode ??
        "";

      // choose representative small-values for the feature row (prefer outbound, fallback inbound)
      // const repSeg = outbound ?? inbound ?? item;
      // const cabin = segClass(repSeg);
      // const baggage = segBaggage(repSeg);
      // const seats = segSeats(repSeg);
      // const duration = segDuration(repSeg);
      // const equipment = segEquipment(repSeg);

      const outboundSegs = normalizeLegSegments(outbound);
      const inboundSegs = normalizeLegSegments(inbound);

      return (
        <Col xs={24} sm={24} md={24} lg={12} xl={8} key={idKey} className="mb-5 compareCardCol">
          <div className="compareCard">
            <div className="cardHeader">
              {isCurrent ? "Chosen Flight" : "Comparison Flight"}
              {!isCurrent && (
                <button
                  style={{
                    float: "right",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => removeFromCompare(removeId)}
                  aria-label="Remove"
                  title="Remove"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="cardBody">
              {/* outbound + inbound summaries (multi-segment) */}
              {outboundSegs.map((seg, i) => (
                <div key={`c-out-${i}`}>
                  {renderSegmentSummary(seg, { showIcons: true })}
                </div>
              ))}
              {outboundSegs.length > 0 && inboundSegs.length > 0 && (
                <div className="compareLegDivider cardHeader">
                  Arrival Flight Group
                </div>
                // <hr className="compareLegDivider" />
              )}
              {inboundSegs.map((seg, i) => (
                <div key={`c-in-${i}`}>
                  {renderSegmentSummary(seg, { showIcons: true })}
                </div>
              ))}

              <div className="StartingPrice mt-5">
                <span>Start from</span>
                <h5>
                  {currency} {displayPrice}
                </h5>
              </div>

              {/* feature icons are now shown inline per segment title; removing old summary row */}

              {/* small summary / seat layout */}
              <div className="flightSeats" style={{ marginTop: 12 }}>
                <div className="flightDetail">
                  <div className="flighticon">
                    <img src={flightIcon} alt="" />
                  </div>
                  <div>
                    <p className="parahOne">{item.name ?? "Round-trip"}</p>
                    <p className="parahTwo">
                      {outboundSegs.length > 0
                        ? `Out segs: ${outboundSegs.length}`
                        : ""}
                      {outboundSegs.length > 0 && inboundSegs.length > 0 ? (
                        <br />
                      ) : null}
                      {inboundSegs.length > 0
                        ? `In segs: ${inboundSegs.length}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="SeatDetail">
                  <div className="seatIcon">
                    <img src={seaticon} alt="" />
                  </div>
                  <div>
                    <p className="parahTwo">
                      Segments: {outboundSegs.length} ↔ {inboundSegs.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      );
    }

    // one-way card (multi-segment if available)
    const oneWaySegs = normalizeOneWaySegments(item);
    return (
      <Col xs={24} sm={24} md={24} lg={12} xl={8} key={idKey} className="mb-5 compareCardCol">
        <div className="compareCard">
          <div className="cardHeader">
            {isCurrent ? "Chosen Flight" : "Comparison Flight"}
            {!isCurrent && (
              <button
                style={{
                  float: "right",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => removeFromCompare(removeId)}
                aria-label="Remove"
                title="Remove"
              >
                ✕
              </button>
            )}
          </div>

          <div className="cardBody">
            {oneWaySegs.length > 0 ? (
              <>
                {oneWaySegs.map((seg, i) => (
                  <div key={`c-ow-${i}`}>
                    {renderSegmentSummary(seg, { showIcons: true })}
                  </div>
                ))}
                <div className="StartingPrice mt-5">
                  <span>Start from</span>
                  <h5>
                    {item.currency ?? ""}{" "}
                    {item.price?.economyLite?.price ?? item.totalFare ?? "—"}
                  </h5>
                </div>
              </>
            ) : (
              <div className="modalFlightDetail">
                <div className="fightTitle">
                  <div className="flightIcon">
                    <img src={item.logo} alt="" />
                  </div>
                  <div className="nameAndDetails">
                    <h5>{item.name}</h5>
                    <p>
                      {item.flight_detail?.flight_number} •{" "}
                      {item.flight_detail?.flight_class}
                    </p>
                  </div>
                </div>

                <div className="StartingPrice">
                  <p>Start from</p>
                  <h5>
                    {item.currency ?? ""}{" "}
                    {item.price?.economyLite?.price ?? item.totalFare ?? "—"}
                  </h5>
                </div>
              </div>
            )}

            {/*<div className="featureImgs">
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
            </div>*/}

            <div className="flightSeats mt-3">
              <div className="flightDetail">
                <div className="flighticon">
                  <img src={flightIcon} alt="" />
                </div>
                <div>
                  <p className="parahOne">{item?.name}</p>
                  <p className="parahTwo">
                    {oneWaySegs.length > 0
                      ? `Segments: ${oneWaySegs.length}`
                      : item?.flight_detail?.flight_number}
                  </p>
                </div>
              </div>

              <div className="SeatDetail">
                {/* <div className="seatIcon">
                  <img src={seaticon} alt="" />
                </div>
                <div>
                  <p className="parahTwo">
                    {oneWaySegs.length > 0
                      ? `${oneWaySegs[0]?.flight_detail?.flight_number} • ${oneWaySegs[0]?.flight_detail?.start_time} → ${oneWaySegs[0]?.flight_detail?.end_time}`
                      : `${item?.flight_detail?.flight_number} • ${item?.flight_detail?.start_time} → ${item?.flight_detail?.end_time}`}
                  </p>
                </div> */}
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
        <Row className="compareCardsFlex" gutter={[16, 16]}>
          {newFlightData.map((item) => renderCompareCard(item))}
          <Col xs={24} sm={24} md={24} lg={12} xl={8} className="compareModalButtonCol">
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
            <p>
              Compare the flights from this listing to see what suits you best
            </p>
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
          {!localAvailable || localAvailable.length === 0 ? (
            <p>No other flights to show</p>
          ) : (
            localAvailable.map((item, index) => {
              const isRound =
                !!(item as any).outbound || !!(item as any).inbound;
              return (
                <div
                  key={item.id ?? index}
                  className="modalFlightDetailCard"
                  onClick={() => addFlightToCompare(item)}
                >
                  <div className="modalFlightDetail">
                    {isRound
                      ? (() => {
                          const outbound = (item as any).outbound ?? null;
                          const inbound = (item as any).inbound ?? null;
                          const outboundSegs = normalizeLegSegments(outbound);
                          const inboundSegs = normalizeLegSegments(inbound);
                          const outBlock =
                            renderTimingAndStops(outbound, `out-${index}`) ??
                            (outboundSegs[0]
                              ? renderSegmentSummary(outboundSegs[0])
                              : null);
                          const inBlock =
                            renderTimingAndStops(inbound, `in-${index}`) ??
                            (inboundSegs[0]
                              ? renderSegmentSummary(inboundSegs[0])
                              : null);
                          return (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                              }}
                            >
                              {outBlock}
                              {inBlock}
                            </div>
                          );
                        })()
                      : (() => {
                          const oneWaySegs = normalizeOneWaySegments(item);
                          const timingBlock = renderTimingAndStops(
                            item,
                            `ow-${index}`
                          );
                          const fallbackSeg = oneWaySegs[0]
                            ? renderSegmentSummary(oneWaySegs[0])
                            : null;
                          return timingBlock || fallbackSeg ? (
                            timingBlock || fallbackSeg
                          ) : (
                            <>
                              <div className="fightTitle">
                                <div className="flightIcon">
                                  <img src={item.logo} alt="" />
                                </div>
                                <div className="nameAndDetails">
                                  <h5>{item.name}</h5>
                                  <p>
                                    {item.flight_detail?.flight_number} -{" "}
                                    {item.flight_detail?.flight_class}
                                  </p>
                                </div>
                              </div>
                              <div
                                className="featureIcons"
                                style={{ marginTop: 8 }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 12,
                                    alignItems: "center",
                                  }}
                                >
                                  <div>
                                    <strong>
                                      {item.currency ?? ""}{" "}
                                      {item.price?.economyLite?.price ??
                                        item.totalFare ??
                                        "-"}
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                  </div>

                  {/* timing block for single-segment items */}
                  {/* {!isRound && item.flight_detail && (
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
                  )} */}
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
