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

type FlightDetailsCardProps = {
  details: any;
};

const FlightDetailsCard: React.FC<FlightDetailsCardProps> = ({ details }) => {
  console.log(details, "details");
  return (
    <div className="flight_detail_card">
      <Flex
        justify="start"
        className="sub_inner"
        style={{ padding: "15px 18px" }}
        gap={15}
      >
        <Flex
          style={{
            width: "fit-content ",
          }}
          vertical
          justify="space-between"
        >
          <div>
            <CustomTypography className="date_time_center_fd" variant="title">
              {details?.flight_detail?.start_time}
              <CustomTypography className="common_typography_fd">
                {details?.flight_detail?.start_date}
              </CustomTypography>
            </CustomTypography>
          </div>
          <div>
            <CustomTypography className="common_typography_fd date_time_center_fd ">
              0
              {calculateFlightDuration(
                details?.flight_detail?.start_time,
                details?.flight_detail?.start_date,
                details?.flight_detail?.end_time,
                details?.flight_detail?.end_date
              )}
              <br />
              Direct
            </CustomTypography>
          </div>
          <div>
            <CustomTypography className="date_time_center_fd" variant="title">
              {details?.flight_detail?.end_time}
              <CustomTypography className="common_typography_fd">
                {details?.flight_detail?.end_date}
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
            width: "fit-content",
          }}
          vertical
          justify="space-between"
          gap={20}
        >
          <Flex gap={20} vertical>
            <div>
              <CustomTypography
                className="airportEndPoints"
                style={{ marginBottom: 0 }}
                variant="title"
              >
                {details?.airport_details?.startAirport}
              </CustomTypography>
              <CustomTypography className="common_typography_fd">
                {details?.airport_details?.startTerminal}
              </CustomTypography>
            </div>

            <div>
              <FeaturesRender
                featuresObj={details?.flight_detail?.flight_features}
              />
            </div>
            <Flex
              wrap
              style={{
                width: "100%",
                columnGap: "30px",
                rowGap: "10px",
              }}
            >
              {details?.name && (
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
                      {details?.name}
                    </CustomTypography>
                    <CustomTypography
                      className="common_typography_fd"
                      variant="paragraph"
                    >
                      {details?.flight_detail?.flight_number},{" "}
                      {details?.flight_detail?.flight_bus}
                    </CustomTypography>
                  </Flex>
                </Flex>
              )}
              {details?.flight_detail?.flight_class && (
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
                      style={{ marginBottom: 0 }}
                      className="prefix_headings"
                      variant="title"
                    >
                      Seats Layout
                    </CustomTypography>
                    <CustomTypography
                      className="common_typography_fd"
                      variant="paragraph"
                    >
                      {details?.flight_detail?.seats_layout}
                    </CustomTypography>
                  </Flex>
                </Flex>
              )}
              {details?.flight_detail?.seats_layout && (
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
                      {details?.flight_detail?.flight_class}
                    </CustomTypography>
                  </Flex>
                </Flex>
              )}
              {details?.flight_detail?.upgradable && (
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
              className="airportEndPoints"
              style={{ marginBottom: 0 }}
              variant="title"
            >
              {details?.airport_details?.endAirport}
            </CustomTypography>
            <CustomTypography className="common_typography_fd">
              {details?.airport_details?.endTerminal}
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
    </div>
  );
};
// <LineWithPoints orientation="vertical" thickness={2} />

export default FlightDetailsCard;
