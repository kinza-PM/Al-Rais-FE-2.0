import { Flex } from "antd";
import LineWithPoints from "../atoms/LineWithPoints";
import CustomTypography from "../common/CustomTypography";
import {
  calculateFlightDuration,
  formatDate,
  formatTime,
} from "../../utils/helpers";
import PLANE_ICON from "../../assets/svgs/plane.svg";
import SEAT_ICON from "../../assets/svgs/seat.svg";
import INFO_ICON from "../../assets/svgs/info.svg";
import STOP_ICON from "../../assets/svgs/stop.svg";
import MapInfo from "../organisms/MapInfo";
import React from "react";
import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import refundableIcon from "../../assets/svgs/redundable.svg";
import durationIcon from "../../assets/svgs/duration.svg";
import { extractFlightFeatures } from "../../utils/searchFlightListingHelpers";
import { getAirportCoords } from "../../utils/geolocationHelper";
import BaggageInfoModal from "../common/BaggageInfoModal";

const formatTerminalLabel = (code: string | null | undefined): string => {
  if (!code || String(code).trim() === "") return "—";
  const val = String(code).trim();
  const valUpper = val.toUpperCase();
  const singleLetterMap: Record<string, string> = {
    M: "Main",
    A: "Terminal A",
    B: "Terminal B",
    C: "Terminal C",
    D: "Terminal D",
    E: "Terminal E",
    F: "Terminal F",
  };
  if (singleLetterMap[valUpper]) return singleLetterMap[valUpper];
  if (/^T\d+$/i.test(val)) return `Terminal ${val.slice(1)}`;
  if (/^\d+$/.test(val)) return `Terminal ${val}`;
  if (/^terminal\s+/i.test(val) || /^main$/i.test(val)) return val;
  return `Terminal ${val}`;
};

type FlightDetailsCardProps = {
  details: any;
};

const FlightDetailsCard: React.FC<FlightDetailsCardProps> = ({ details }) => {
  const [mapLocations, setMapLocations] = React.useState<any[]>([]);
  const [baggageModalOpen, setBaggageModalOpen] = React.useState(false);
  const [baggageModalSegments, setBaggageModalSegments] = React.useState<any[]>(
    [],
  );

  const seg = details?.outbound ?? details;
  const fd = seg?.flight_detail ?? {};
  const airport = seg?.airport_details ?? {};

  const displayRows = React.useMemo(() => {
    const journeys = details?.raw?.journey || [];
    const rows: any[] = [];

    for (let jIdx = 0; jIdx < journeys.length; jIdx++) {
      const j = journeys[jIdx];
      const segments = j?.flightSegments || [];
      if (segments.length === 0) continue;

      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];

      const st = firstSegment?.departureDateTime
        ? formatTime(firstSegment.departureDateTime)
        : fd?.start_time;
      const sd = firstSegment?.departureDateTime
        ? formatDate(firstSegment.departureDateTime)
        : fd?.start_date;

      const et = lastSegment?.arrivalDateTime
        ? formatTime(lastSegment.arrivalDateTime)
        : fd?.end_time;
      const ed = lastSegment?.arrivalDateTime
        ? formatDate(lastSegment.arrivalDateTime)
        : fd?.end_date;

      const startAirport =
        firstSegment?.departureAirportCode ?? airport?.startAirport;
      const startTerminal =
        firstSegment?.departureTerminal ??
        firstSegment?.depTerminal ??
        airport?.startTerminal;

      const endAirport = lastSegment?.arrivalAirportCode ?? airport?.endAirport;
      const endTerminal =
        lastSegment?.arrivalTerminal ??
        lastSegment?.arrTerminal ??
        airport?.endTerminal;

      const visibleFeatures = extractFlightFeatures(
        firstSegment,
        seg?.flight_detail || fd || {},
        details?.raw?.fare || {},
        {
          cabinIcon,
          baggageIcon,
          mealIcon: refundableIcon,
          durationIcon,
          seatIcon: SEAT_ICON,
          entertainmentIcon: PLANE_ICON,
        },
      );

      const cabinRaw =
        firstSegment?.cabinClass ??
        firstSegment?.cabin ??
        seg?.flight_detail?.flight_class ??
        null;

      const durationVal = firstSegment?.duration ?? fd?.duration ?? null;

      rows.push({
        key: `journey-${jIdx}-${st}-${et}`,
        start_time: st,
        start_date: sd,
        end_time: et,
        end_date: ed,
        duration: durationVal,
        flight_number: firstSegment?.flightNumber ?? fd?.flight_number,
        flight_class: cabinRaw,
        startAirport,
        startTerminal,
        endAirport,
        endTerminal,
        name: seg?.name,
        seats_layout: fd?.seats_layout,
        features: visibleFeatures,
        segments,
      });
    }

    if (!rows.length) {
      const visibleFeatures = extractFlightFeatures(
        null,
        fd || {},
        details?.raw?.fare || {},
        {
          cabinIcon,
          baggageIcon,
          mealIcon: refundableIcon,
          durationIcon,
          seatIcon: SEAT_ICON,
          entertainmentIcon: PLANE_ICON,
        },
      );

      rows.push({
        key: `single-${fd?.flight_number ?? "row"}-${fd?.start_time ?? "st"}-${fd?.end_time ?? "et"}`,
        start_time: fd?.start_time,
        start_date: fd?.start_date,
        end_time: fd?.end_time,
        end_date: fd?.end_date,
        duration: fd?.duration,
        flight_number: fd?.flight_number,
        flight_class: fd?.flight_class,
        startAirport: airport?.startAirport,
        startTerminal: airport?.startTerminal,
        endAirport: airport?.endAirport,
        endTerminal: airport?.endTerminal,
        name: seg?.name,
        seats_layout: fd?.seats_layout,
        features: visibleFeatures,
      });
    }

    return rows;
  }, [details, fd, airport, seg]);

  React.useEffect(() => {
    const fetchCoordinates = async () => {
      const locations = await Promise.all(
        displayRows.map(async (row) => {
          const allAirports: string[] = [];

          if (row.segments && row.segments.length > 1) {
            row.segments.forEach((segment: any, idx: number) => {
              const depAirport = segment?.departureAirportCode;
              if (depAirport && !allAirports.includes(depAirport)) {
                allAirports.push(depAirport);
              }

              if (idx === row.segments.length - 1) {
                const arrAirport = segment?.arrivalAirportCode;
                if (arrAirport && !allAirports.includes(arrAirport)) {
                  allAirports.push(arrAirport);
                }
              }
            });
          } else {
            if (row.startAirport) allAirports.push(row.startAirport);
            if (row.endAirport && !allAirports.includes(row.endAirport)) {
              allAirports.push(row.endAirport);
            }
          }

          await new Promise((resolve) => setTimeout(resolve, 250));

          const airportCoords = await Promise.all(
            allAirports.map(async (airportCode) => {
              const coords = await getAirportCoords(airportCode);
              return {
                lat: coords.lat,
                lng: coords.lng,
                destinationName: airportCode,
              };
            }),
          );

          return airportCoords;
        }),
      );

      setMapLocations(locations);
    };

    if (displayRows.length > 0) {
      fetchCoordinates();
    }
  }, [displayRows]);

  return (
    <>
      <div
        className="flight_detail_card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {displayRows.map((row: any, idx: number) => (
          <div
            key={row.key ?? idx}
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: "20px",
              padding: "18px",
              background: "#FFFFFF",
            }}
          >
            <div className="flight-details-modal-grid">
              <Flex
                justify="start"
                gap={16}
                style={{ width: "100%", minWidth: 0 }}
              >
                <Flex vertical justify="space-between" style={{ minWidth: 120 }}>
                  <div>
                    <CustomTypography className="date_time_center_fd" variant="title">
                      {row.start_time}
                      <CustomTypography className="common_typography_fd">
                        {row.start_date}
                      </CustomTypography>
                    </CustomTypography>
                  </div>

                  {row.segments?.length > 1 ? (
                    <>
                      {row.segments.map((segment: any, segIndex: number) => (
                        <React.Fragment key={segIndex}>
                          {segment?.duration && (
                            <div>
                              <CustomTypography className="common_typography_fd date_time_center_fd">
                                {segment.duration}
                              </CustomTypography>
                            </div>
                          )}

                          {segIndex < row.segments.length - 1 &&
                            row.segments[segIndex + 1]?.layoverTime && (
                              <div>
                                <CustomTypography className="common_typography_fd date_time_center_fd">
                                  {row.segments[segIndex + 1].layoverTime}
                                  <br />
                                  {row.segments[segIndex + 1]?.departureAirportCode ??
                                    "Stop"}
                                </CustomTypography>
                              </div>
                            )}
                        </React.Fragment>
                      ))}
                    </>
                  ) : (
                    <div>
                      <CustomTypography className="common_typography_fd date_time_center_fd">
                        {row.duration ??
                          calculateFlightDuration(
                            row.start_time,
                            row.start_date,
                            row.end_time,
                            row.end_date,
                          )}
                        <br />
                        Direct
                      </CustomTypography>
                    </div>
                  )}

                  <div>
                    <CustomTypography className="date_time_center_fd" variant="title">
                      {row.end_time}
                      <CustomTypography className="common_typography_fd">
                        {row.end_date}
                      </CustomTypography>
                    </CustomTypography>
                  </div>
                </Flex>

                <Flex vertical style={{ width: "fit-content" }}>
                  <LineWithPoints thickness={2} segments={row.segments} />
                </Flex>

                <Flex
                  vertical
                  justify="space-between"
                  gap={18}
                  style={{ minWidth: 0, flex: 1 }}
                >
                  <div>
                    <CustomTypography
                      className="prefix_headings"
                      style={{ marginBottom: 0 }}
                      variant="title"
                    >
                      {row.startAirport}
                      <br />
                      <span className="common_typography_fd">
                        Terminal: {formatTerminalLabel(row.startTerminal)}
                      </span>
                    </CustomTypography>
                  </div>

                  <Flex
                    wrap
                    style={{
                      width: "100%",
                      columnGap: "22px",
                      rowGap: "10px",
                    }}
                  >
                    {row?.features?.map((f: any) => {
                      const isBaggage = f.key === "baggage";

                      const openBaggage = () => {
                        const rawSegs = row?.segments ?? [];
                        const mapped = rawSegs.map((s: any) => {
                          const checked =
                            s?.baggageAllowance?.checkedInBaggage?.[0];
                          const carry =
                            s?.baggageAllowance?.carryOnBaggage?.[0];
                          return {
                            fromCode: s?.departureAirportCode,
                            toCode: s?.arrivalAirportCode,
                            baggageChecked: checked
                              ? `${checked.value}${checked.unit ?? ""}`
                              : null,
                            baggageCarry: carry
                              ? `${carry.value}${carry.unit ?? ""}`
                              : null,
                          };
                        });
                        setBaggageModalSegments(mapped);
                        setBaggageModalOpen(true);
                      };

                      return (
                        <Flex
                          key={f.key}
                          gap={6}
                          align="center"
                          style={{
                            minWidth: "160px",
                            cursor: isBaggage ? "pointer" : undefined,
                          }}
                          onClick={isBaggage ? openBaggage : undefined}
                          onKeyDown={
                            isBaggage
                              ? (e) => e.key === "Enter" && openBaggage()
                              : undefined
                          }
                          role={isBaggage ? "button" : undefined}
                          tabIndex={isBaggage ? 0 : undefined}
                        >
                          <img src={f.icon} alt={f.key} />
                          <CustomTypography className="common_typography_fd">
                            {f.label}
                          </CustomTypography>
                        </Flex>
                      );
                    })}
                  </Flex>

                  <Flex
                    wrap
                    style={{
                      width: "100%",
                      columnGap: "22px",
                      rowGap: "12px",
                    }}
                  >
                    {row?.name && (
                      <Flex gap={8} align="start" style={{ minWidth: "180px" }}>
                        <img width={20} height={20} src={PLANE_ICON} alt="plane" />
                        <Flex vertical>
                          <CustomTypography
                            style={{ marginBottom: 0 }}
                            className="prefix_headings"
                            variant="title"
                          >
                            {row?.name}
                          </CustomTypography>
                          <CustomTypography
                            className="common_typography_fd"
                            variant="paragraph"
                          >
                            {row?.flight_number}
                          </CustomTypography>
                        </Flex>
                      </Flex>
                    )}

                    <Flex gap={8} align="start" style={{ minWidth: "160px" }}>
                      <img width={18} height={18} src={SEAT_ICON} alt="seat" />
                      <Flex vertical>
                        <CustomTypography
                          style={{ marginBottom: 0 }}
                          className="prefix_headings"
                          variant="title"
                        >
                          Your Seat
                        </CustomTypography>
                        <CustomTypography
                          className="common_typography_fd"
                          variant="paragraph"
                        >
                          Economy
                        </CustomTypography>
                      </Flex>
                    </Flex>

                    <Flex gap={8} align="center" style={{ width: "100%" }}>
                      <img width={18} height={18} src={INFO_ICON} alt="info" />
                      <CustomTypography
                        style={{ marginBottom: 0 }}
                        className="common_typography_fd"
                      >
                        Seat can be upgraded by selecting a different cabin class.
                      </CustomTypography>
                    </Flex>
                  </Flex>

                  {row.segments?.length > 1 && (
                    <div>
                      <CustomTypography className="prefix_headings" variant="title">
                        Layover details:
                      </CustomTypography>

                      {row.segments.map((segment: any, segIndex: number) => {
                        if (segIndex >= row.segments.length - 1) return null;

                        const nextSegment = row.segments[segIndex + 1];
                        const layoverTime = nextSegment?.layoverTime ?? "";
                        const stopAirport =
                          nextSegment?.departureAirportCode ?? "";
                        const arrivalTime = segment?.arrivalDateTime
                          ? formatTime(segment.arrivalDateTime)
                          : "";
                        const arrivalDate = segment?.arrivalDateTime
                          ? formatDate(segment.arrivalDateTime)
                          : "";
                        const departureTime = nextSegment?.departureDateTime
                          ? formatTime(nextSegment.departureDateTime)
                          : "";
                        const departureDate = nextSegment?.departureDateTime
                          ? formatDate(nextSegment.departureDateTime)
                          : "";
                        const connectingFlight = nextSegment?.flightNumber ?? "";
                        const airlineName = row?.name ?? "";

                        const visibleConnectingFeatures = extractFlightFeatures(
                          nextSegment,
                          {},
                          details?.raw?.fare || {},
                          {
                            cabinIcon,
                            baggageIcon,
                            mealIcon: refundableIcon,
                            durationIcon,
                            seatIcon: SEAT_ICON,
                            entertainmentIcon: PLANE_ICON,
                          },
                        );

                        return (
                          <div
                            key={segIndex}
                            style={{
                              marginTop: "10px",
                              padding: "14px",
                              border: "1px solid #E5E7EB",
                              borderRadius: "14px",
                              background: "#F8FAFC",
                            }}
                          >
                            <Flex
                              wrap
                              style={{
                                width: "100%",
                                columnGap: "20px",
                                rowGap: "10px",
                                marginBottom: "10px",
                              }}
                            >
                              {stopAirport && (
                                <Flex gap={8} align="start" style={{ minWidth: "150px" }}>
                                  <img
                                    width={18}
                                    height={18}
                                    src={STOP_ICON}
                                    alt="stop"
                                  />
                                  <Flex vertical>
                                    <CustomTypography
                                      style={{ marginBottom: 0 }}
                                      className="prefix_headings"
                                      variant="title"
                                    >
                                      Stop
                                    </CustomTypography>
                                    <CustomTypography
                                      className="common_typography_fd"
                                      variant="paragraph"
                                    >
                                      {stopAirport}
                                    </CustomTypography>
                                  </Flex>
                                </Flex>
                              )}

                              {layoverTime && (
                                <Flex gap={8} align="start" style={{ minWidth: "150px" }}>
                                  <img
                                    width={18}
                                    height={18}
                                    src={STOP_ICON}
                                    alt="duration"
                                  />
                                  <Flex vertical>
                                    <CustomTypography
                                      style={{ marginBottom: 0 }}
                                      className="prefix_headings"
                                      variant="title"
                                    >
                                      Duration
                                    </CustomTypography>
                                    <CustomTypography
                                      className="common_typography_fd"
                                      variant="paragraph"
                                    >
                                      {layoverTime}
                                    </CustomTypography>
                                  </Flex>
                                </Flex>
                              )}
                            </Flex>

                            <Flex
                              wrap
                              style={{
                                width: "100%",
                                columnGap: "16px",
                                rowGap: "8px",
                              }}
                            >
                              {layoverTime && (
                                <CustomTypography className="common_typography_fd">
                                  Duration: {layoverTime}
                                </CustomTypography>
                              )}

                              {arrivalTime && arrivalDate && (
                                <CustomTypography className="common_typography_fd">
                                  Arrival: {arrivalDate} - {arrivalTime}
                                </CustomTypography>
                              )}

                              {connectingFlight && airlineName && (
                                <CustomTypography className="common_typography_fd">
                                  Connecting flight: {connectingFlight}, {airlineName}
                                </CustomTypography>
                              )}

                              {departureTime && departureDate && (
                                <CustomTypography className="common_typography_fd">
                                  Departure: {departureDate} - {departureTime}
                                </CustomTypography>
                              )}
                            </Flex>

                            {visibleConnectingFeatures.length > 0 && (
                              <div style={{ marginTop: "12px" }}>
                                <div className="flex items-center gap-5 flex-wrap">
                                  {visibleConnectingFeatures.map((f: any) => (
                                    <div className="featureIconTooltipWrap" key={f.key}>
                                      <img src={f.icon} alt={f.key} />
                                      <span className="tooltip">{f.label}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div>
                    <CustomTypography
                      className="prefix_headings"
                      style={{ marginBottom: 0 }}
                      variant="title"
                    >
                      {row?.endAirport}
                      <br />
                      <span className="common_typography_fd">
                        Terminal: {formatTerminalLabel(row?.endTerminal)}
                      </span>
                    </CustomTypography>
                  </div>
                </Flex>
              </Flex>

              <div
                style={{
                  width: "100%",
                  minHeight: "240px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid #E5E7EB",
                }}
              >
                {mapLocations[idx] ? (
                  <MapInfo locations={mapLocations[idx]} />
                ) : (
                  <div className="flex items-center justify-center text-[#2351a3] h-full">
                    Loading map...
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <BaggageInfoModal
        open={baggageModalOpen}
        onClose={() => setBaggageModalOpen(false)}
        segments={baggageModalSegments}
      />
    </>
  );
};

export default React.memo(FlightDetailsCard);