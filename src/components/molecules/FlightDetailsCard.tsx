import { Flex } from "antd";
import LineWithPoints from "../atoms/LineWithPoints";
import CustomTypography from "../common/CustomTypography";
import { calculateFlightDuration } from "../../utils/helpers";
import FeaturesRender from "../atoms/FeaturesRender";
import PLANE_ICON from "../../assets/svgs/plane.svg";
import SEATS_LAYOUT_ICON from "../../assets/svgs/seat_layout.svg";
import SEAT_ICON from "../../assets/svgs/seat.svg";
import INFO_ICON from "../../assets/svgs/info.svg";
import MapInfo from "../organisms/MapInfo";
import { formatDate, formatTime } from "../../utils/helpers";
import React from "react";

type FlightDetailsCardProps = {
  details: any;
};

const FlightDetailsCard: React.FC<FlightDetailsCardProps> = ({ details }) => {
  const seg = details?.outbound ?? details;

  const fd = seg?.flight_detail ?? {};
  const airport = seg?.airport_details ?? {};

  // Build rows to render per journey/segment (fallback to single row)
  const displayRows = React.useMemo(() => {
    const journeys = details?.raw?.journey || [];
    const rows: any[] = [];
    for (const j of journeys || []) {
      for (const s of j?.flightSegments || []) {
        const st = s?.departureDateTime
          ? formatTime(s.departureDateTime)
          : fd?.start_time;
        const sd = s?.departureDateTime
          ? formatDate(s.departureDateTime)
          : fd?.start_date;
        const et = s?.arrivalDateTime
          ? formatTime(s.arrivalDateTime)
          : fd?.end_time;
        const ed = s?.arrivalDateTime
          ? formatDate(s.arrivalDateTime)
          : fd?.end_date;
        rows.push({
          key: `${s?.segmentKey ?? s?.flightNumber ?? st}-${sd}-${et}-${ed}`,
          start_time: st,
          start_date: sd,
          end_time: et,
          end_date: ed,
          duration: s?.duration ?? fd?.duration,
          flight_number: s?.flightNumber ?? fd?.flight_number,
          flight_class: s?.cabinClass ?? fd?.flight_class,
          startAirport: s?.departureAirportCode ?? airport?.startAirport,
          startTerminal: s?.departureTerminal ?? airport?.startTerminal,
          endAirport: s?.arrivalAirportCode ?? airport?.endAirport,
          endTerminal: s?.arrivalTerminal ?? airport?.endTerminal,
          name: seg?.name,
          seats_layout: fd?.seats_layout,
          flight_features: fd?.flight_features,
        });
      }
    }
    if (!rows.length) {
      rows.push({
        key: `single-${fd?.flight_number ?? "row"}-${fd?.start_time ?? "st"}-${
          fd?.end_time ?? "et"
        }`,
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
        flight_features: fd?.flight_features,
      });
    }
    return rows;
  }, [details]);

  return (
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
            <div>
              <CustomTypography className="common_typography_fd date_time_center_fd ">
                0
                {calculateFlightDuration(
                  row.start_time,
                  row.start_date,
                  row.end_time,
                  row.end_date
                )}
                <br />
                Direct
              </CustomTypography>
            </div>
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
            <LineWithPoints thickness={2} />
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
                  {row.startAirport}
                </CustomTypography>
              </div>

              <div>
                <FeaturesRender featuresObj={row?.flight_features} />
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

                {row?.flight_class && (
                  <Flex
                    style={{
                      width: "30%",
                      alignItems: "center",
                    }}
                    gap={8}
                    align="start"
                  >
                    <img
                      style={{ paddingTop: "0px" }}
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
                        <br />
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
                )}

                {row?.seats_layout && (
                  <Flex
                    style={{
                      width: "30%",
                      alignItems: "center",
                    }}
                    gap={8}
                    align="start"
                  >
                    <img
                      style={{ paddingTop: "0px" }}
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
                        {row?.flight_class}
                      </CustomTypography>
                    </Flex>
                  </Flex>
                )}

                {fd?.upgradable && (
                  <Flex gap={8} align="center">
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
                )}
              </Flex>
            </Flex>

            <div>
              <CustomTypography
                className="prefix_headings"
                style={{ marginBottom: 0 }}
                variant="title"
              >
                {row?.endAirport}
              </CustomTypography>
            </div>
          </Flex>

          <Flex style={{ width: "30%" }}>
            <div className="map_container">
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
            </div>
          </Flex>
        </Flex>
      ))}
    </div>
  );
};
// <LineWithPoints orientation="vertical" thickness={2} />

export default React.memo(FlightDetailsCard);
