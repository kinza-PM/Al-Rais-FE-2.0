import { Flex } from "antd";
import LineWithPoints from "../atoms/LineWithPoints";
import CustomTypography from "../common/CustomTypography";
import { calculateFlightDuration } from "../../utils/helpers";
import PLANE_ICON from "../../assets/svgs/plane.svg";
import SEAT_ICON from "../../assets/svgs/seat.svg";
import INFO_ICON from "../../assets/svgs/info.svg";
import STOP_ICON from "../../assets/svgs/stop.svg";
import MapInfo from "../organisms/MapInfo";
import { formatDate, formatTime } from "../../utils/helpers";
import React from "react";
import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import refundableIcon from "../../assets/svgs/redundable.svg";
// import mealIcon from "../../assets/svgs/meals.svg";
import durationIcon from "../../assets/svgs/duration.svg";
// import wifiIcon from "../../assets/svgs/wifi.svg";
import { extractFlightFeatures } from "../../utils/searchFlightListingHelpers";
import { getAirportCoords } from "../../utils/geolocationHelper";
import BaggageInfoModal from "../common/BaggageInfoModal";

/** Maps short terminal codes to proper display labels (e.g. M → Main, 2 → Terminal 2) */
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
  const [baggageModalSegments, setBaggageModalSegments] = React.useState<any[]>([]);

  const seg = details?.outbound ?? details;

  const fd = seg?.flight_detail ?? {};
  const airport = seg?.airport_details ?? {};

  // Build rows to render per journey (not per segment) - show multiple journeys only
  const displayRows = React.useMemo(() => {
    const journeys = details?.raw?.journey || [];
    const rows: any[] = [];

    // Loop through journeys (outbound/inbound), not segments
    for (let jIdx = 0; jIdx < journeys.length; jIdx++) {
      const j = journeys[jIdx];
      const segments = j?.flightSegments || [];

      if (segments.length === 0) continue;

      // Get first and last segments for start/end times and airports
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];

      // Start time/date from first segment
      const st = firstSegment?.departureDateTime
        ? formatTime(firstSegment.departureDateTime)
        : fd?.start_time;
      const sd = firstSegment?.departureDateTime
        ? formatDate(firstSegment.departureDateTime)
        : fd?.start_date;

      // End time/date from last segment
      const et = lastSegment?.arrivalDateTime
        ? formatTime(lastSegment.arrivalDateTime)
        : fd?.end_time;
      const ed = lastSegment?.arrivalDateTime
        ? formatDate(lastSegment.arrivalDateTime)
        : fd?.end_date;

      // Get airports and terminals from segments (support common API field names)
      const startAirport = firstSegment?.departureAirportCode ?? airport?.startAirport;
      const startTerminal =
        firstSegment?.departureTerminal ??
        firstSegment?.depTerminal ??
        airport?.startTerminal;
      const endAirport = lastSegment?.arrivalAirportCode ?? airport?.endAirport;
      const endTerminal =
        lastSegment?.arrivalTerminal ??
        lastSegment?.arrTerminal ??
        airport?.endTerminal;

      // Use shared function to extract features
      const visibleFeatures = extractFlightFeatures(
        firstSegment,
        seg?.flight_detail || fd || {},
        details?.raw?.fare || {},
        {
          cabinIcon,
          baggageIcon,
          mealIcon: refundableIcon,
          durationIcon ,
          seatIcon: SEAT_ICON,
          entertainmentIcon: PLANE_ICON,
        }
      );

      // Get cabin and duration from features or segment
      const cabinRaw = firstSegment?.cabinClass ?? firstSegment?.cabin ?? seg?.flight_detail?.flight_class ?? null;
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
        segments: segments, // Keep segments for reference if needed
      });
    }

    // Fallback if no journeys found
    if (!rows.length) {
      // Use shared function to extract features (with null segment for fallback)
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
        }
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
          // Collect all unique airports from segments
          const allAirports: string[] = [];

          if (row.segments && row.segments.length > 1) {
            // Multiple segments - add all departure and arrival airports
            row.segments.forEach((segment: any, idx: number) => {
              // Add departure airport
              const depAirport = segment?.departureAirportCode;
              if (depAirport && !allAirports.includes(depAirport)) {
                allAirports.push(depAirport);
              }

              // Add arrival airport (for last segment)
              if (idx === row.segments.length - 1) {
                const arrAirport = segment?.arrivalAirportCode;
                if (arrAirport && !allAirports.includes(arrAirport)) {
                  allAirports.push(arrAirport);
                }
              }
            });
          } else {
            // Direct flight - just start and end
            allAirports.push(row.startAirport, row.endAirport);
          }

          // Fetch coordinates for all airports
          await new Promise(resolve => setTimeout(resolve, 500));

          const airportCoords = await Promise.all(
            allAirports.map(async (airportCode) => {
              const coords = await getAirportCoords(airportCode);
              return {
                lat: coords.lat,
                lng: coords.lng,
                destinationName: airportCode
              };
            })
          );

          return airportCoords;
        })
      );

      setMapLocations(locations);
    };

    if (displayRows.length > 0) {
      fetchCoordinates();
    }
  }, [displayRows]);

  return (
    <>
    <div className="flight_detail_card">
      {displayRows.map((row: any, idx: number) => (
        <Flex
          key={row.key ?? idx}
          justify="start"
          className="sub_inner"
          style={{ padding: "15px 18px" }}
          gap={15}
        >
          <Flex
            style={{
              width: "auto",
              minWidth: 180,
            }}
            vertical
            justify="space-between"
          >
            <div>
              <CustomTypography className="date_time_center_fd" variant="title">
                {row.start_time}
                <CustomTypography className="common_typography_fd">
                  {row.start_date}
                </CustomTypography>
              </CustomTypography>
            </div>

            {/* Durations and stops - positioned between dots */}
            {row.segments?.length > 1 ? (
              <>
                {row.segments.map((segment: any, segIndex: number) => (
                  <React.Fragment key={segIndex}>
                    {/* Segment duration */}
                    {segment?.duration && (
                      <div>
                        <CustomTypography className="common_typography_fd date_time_center_fd">
                          {segment.duration}
                        </CustomTypography>
                      </div>
                    )}

                    {/* Stop with layover time (show between segments, not after last segment) */}
                    {segIndex < row.segments.length - 1 && row.segments[segIndex + 1]?.layoverTime && (
                      <div>
                        <CustomTypography className="common_typography_fd date_time_center_fd">
                          {row.segments[segIndex + 1].layoverTime}
                          <br />
                          {row.segments[segIndex + 1]?.departureAirportCode ?? "Stop"}
                        </CustomTypography>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </>
            ) : (
              <div>
                <CustomTypography className="common_typography_fd date_time_center_fd">
                  {row.duration ?? calculateFlightDuration(
                    row.start_time,
                    row.start_date,
                    row.end_time,
                    row.end_date
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

          <Flex
            style={{
              width: "fit-content",
            }}
            vertical
          >
            <LineWithPoints thickness={2} segments={row.segments} />
          </Flex>

          <Flex
            style={{
              width: "auto",
              minWidth: 220,
            }}
            vertical
            justify="space-between"
            gap={20}
          >
            <Flex gap={20} vertical>
              <div>
                <CustomTypography
                  className="prefix_headings"
                  style={{ marginBottom: 0 }}
                  variant="title"
                >
                  {row.startAirport} <br />
                  <span className="common_typography_fd">Terminal: {formatTerminalLabel(row.startTerminal)}</span>
                </CustomTypography>
              </div>

              <div className="mt-2 mb-2">
                <Flex
                  wrap
                  style={{
                    width: "100%",
                    columnGap: "30px",
                    rowGap: "10px",
                  }}
                >
                  {row?.features?.map((f: any) => {
                    const isBaggage = f.key === "baggage";
                    const openBaggage = () => {
                      const rawSegs = row?.segments ?? [];
                      const mapped = rawSegs.map((s: any) => {
                        const checked = s?.baggageAllowance?.checkedInBaggage?.[0];
                        const carry = s?.baggageAllowance?.carryOnBaggage?.[0];
                        return {
                          fromCode: s?.departureAirportCode,
                          toCode: s?.arrivalAirportCode,
                          baggageChecked: checked ? `${checked.value}${checked.unit ?? ""}` : null,
                          baggageCarry: carry ? `${carry.value}${carry.unit ?? ""}` : null,
                        };
                      });
                      setBaggageModalSegments(mapped);
                      setBaggageModalOpen(true);
                    };
                    return (
                      <Flex
                        key={f.key}
                        style={{
                          width: "30%",
                          cursor: isBaggage ? "pointer" : undefined,
                        }}
                        gap={5}
                        align="center"
                        onClick={isBaggage ? openBaggage : undefined}
                        onKeyDown={isBaggage ? (e) => e.key === "Enter" && openBaggage() : undefined}
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
              </div>

              <Flex
                wrap
                style={{
                  width: "100%",
                  columnGap: "30px",
                  rowGap: "10px",
                }}
              >
                {row?.name && (
                  <Flex
                    style={{
                      width: "30%",
                      alignItems: "center",
                    }}
                    gap={5}
                    align="start"
                  >
                    <img
                      style={{ paddingTop: "0px" }}
                      width={20}
                      height={20}
                      src={PLANE_ICON}
                      alt="cabin"
                    />
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

                {/* {row?.flight_class && (
                  <Flex
                    style={{
                      width: "30%",
                      alignItems: "center",
                    }}
                    gap={8}
                    align="start"
                  >
                    <img
                      style={{ paddingTop: "0px", marginBottom: "10px" }}
                      width={18}
                      height={18}
                      src={SEATS_LAYOUT_ICON}
                      alt="seatsLayout"
                    />
                    <Flex vertical>
                      <CustomTypography
                        style={{ marginBottom: 0, whiteSpace: "nowrap" }}
                        className="prefix_headings"
                        variant="title"
                      >
                        Seats
                        Layout
                      </CustomTypography>
                      <CustomTypography
                        className="common_typography_fd"
                        variant="paragraph"
                      >
                        {row?.seats_layout}
                      </CustomTypography>
                    </Flex>
                  </Flex>
                )} */}

                <Flex
                  style={{
                    width: "30%",
                    alignItems: "center",
                  }}
                  gap={8}
                  align="start"
                >
                  <img
                    style={{ paddingTop: "0px", marginBottom: "10px" }}
                    width={18}
                    height={18}
                    src={SEAT_ICON}
                    alt="seatsLayout"
                  />
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

                <Flex gap={8} align="center" className="mt-5 mb-2">
                  <img
                    width={18}
                    height={18}
                    src={INFO_ICON}
                    alt="seatsLayout"
                  />

                  <CustomTypography
                    style={{ marginBottom: 0 }}
                    className="common_typography_fd"
                  >
                    Seat can be upgraded by selecting a different cabin class.
                  </CustomTypography>
                </Flex>
              </Flex>

              {/* Show layover details only if there are multiple segments */}
              {row.segments?.length > 1 && (
                <div className="mb-5">
                  <CustomTypography
                    className="prefix_headings"
                    variant="title"
                  >
                    Layover details:
                  </CustomTypography>

                  {/* Loop through segments and show layover info for each stop */}
                  {row.segments.map((segment: any, segIndex: number) => {
                    // Skip last segment as there's no layover after it
                    if (segIndex >= row.segments.length - 1) return null;

                    const nextSegment = row.segments[segIndex + 1];
                    const layoverTime = nextSegment?.layoverTime ?? '';
                    const stopAirport = nextSegment?.departureAirportCode ?? '';
                    const arrivalTime = segment?.arrivalDateTime ? formatTime(segment.arrivalDateTime) : '';
                    const arrivalDate = segment?.arrivalDateTime ? formatDate(segment.arrivalDateTime) : '';
                    const departureTime = nextSegment?.departureDateTime ? formatTime(nextSegment.departureDateTime) : '';
                    const departureDate = nextSegment?.departureDateTime ? formatDate(nextSegment.departureDateTime) : '';
                    const connectingFlight = nextSegment?.flightNumber ?? '';
                    const airlineName = row?.name ?? '';

                    // Use shared function to extract features for connecting segment
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
                      }
                    );

                    return (
                      <div key={segIndex} style={{ marginBottom: segIndex < row.segments.length - 2 ? "20px" : "0" }}>
                        <Flex
                          wrap
                          style={{
                            width: "100%",
                            columnGap: "30px",
                            rowGap: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          {/* Stop Airport */}
                          {stopAirport && (
                            <Flex
                              style={{
                                width: "30%",
                                alignItems: "center",
                              }}
                              gap={8}
                              align="start"
                            >
                              <img
                                style={{ paddingTop: "0px", marginBottom: "10px" }}
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

                          {/* Layover Duration */}
                          {layoverTime && (
                            <Flex
                              style={{
                                width: "30%",
                                alignItems: "center",
                              }}
                              gap={8}
                              align="start"
                            >
                              <img
                                style={{ paddingTop: "0px", marginBottom: "10px" }}
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

                        {/* Detailed layover information */}
                        <Flex
                          wrap
                          style={{
                            width: "100%",
                            columnGap: "10px",
                            rowGap: "5px",
                          }}
                        >
                          {layoverTime && (
                            <Flex
                              style={{
                                width: "45%",
                              }}
                              gap={5}
                              align="center"
                            >
                              <CustomTypography className="common_typography_fd">
                                Duration: {layoverTime}
                              </CustomTypography>
                            </Flex>
                          )}

                          {arrivalTime && arrivalDate && (
                            <Flex
                              style={{
                                width: "45%",
                              }}
                              gap={5}
                              align="center"
                            >
                              <CustomTypography className="common_typography_fd">
                                Arrival: {arrivalDate} - {arrivalTime}
                              </CustomTypography>
                            </Flex>
                          )}

                          {connectingFlight && airlineName && (
                            <Flex
                              style={{
                                width: "45%",
                              }}
                              gap={5}
                              align="center"
                            >
                              <CustomTypography className="common_typography_fd">
                                Connecting flight: {connectingFlight}, {airlineName}
                              </CustomTypography>
                            </Flex>
                          )}

                          {departureTime && departureDate && (
                            <Flex
                              style={{
                                width: "45%",
                              }}
                              gap={5}
                              align="center"
                            >
                              <CustomTypography className="common_typography_fd">
                                Departure: {departureDate} - {departureTime}
                              </CustomTypography>
                            </Flex>
                          )}
                        </Flex>

                        {/* Amenities for connecting flight segment */}
                        {visibleConnectingFeatures.length > 0 && (
                          <div className="mt-3 mb-2">
                            <div className="flex items-center gap-5">
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
            </Flex>

            <div>
              <CustomTypography
                className="prefix_headings"
                style={{ marginBottom: 0 }}
                variant="title"
              >
                {row?.endAirport} <br />
                <span className="common_typography_fd">Terminal: {formatTerminalLabel(row?.endTerminal)}</span>
              </CustomTypography>
            </div>
          </Flex>

          <Flex style={{ width: "40%" }}>
            {/* <div className="map_container">
              <MapInfo
                locations={[
                  {
                    lat: 48.8566,
                    lng: 2.3522,
                    countryFlag: "https://flagcdn.com/fr.svg",
                    destinationName: "Paris",
                  },
                  {
                    lat: 40.7128,
                    lng: -74.006,
                    countryFlag: "https://flagcdn.com/us.svg",
                    destinationName: "New York",
                  },
                ]}
              />
            </div> */}
            <div className="map_container">
              {mapLocations[idx] ? (
                <MapInfo locations={mapLocations[idx]} />
              ) : (
                <div className="flex items-center justify-center text-[#2351a3] h-full">
                  Loading map...
                </div>
              )}
            </div>
          </Flex>
        </Flex>
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
// <LineWithPoints orientation="vertical" thickness={2} />

export default React.memo(FlightDetailsCard);
