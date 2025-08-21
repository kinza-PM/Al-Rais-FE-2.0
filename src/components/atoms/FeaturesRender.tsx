import { Flex } from "antd";
import CABIN_ICON from "../../assets/svgs/cabin.svg";
import BAGGAGE_ICON from "../../assets/svgs/baggage.svg";
import USB_ICON from "../../assets/svgs/power_usb.svg";
import MEAL_ICON from "../../assets/svgs/meal.svg";
import WIFI_ICON from "../../assets/svgs/wifi.svg";
import ENTERTAINMENT_ICON from "../../assets/svgs/entertainment.svg";
import CustomTypography from "../common/CustomTypography";

type FeaturesRenderProp = {
  featuresObj: {
    cabin?: number;
    baggage?: string;
    usb_power?: boolean;
    free_meal?: boolean;
    wifi?: boolean;
    entertainment?: boolean;
  };
};

const FeaturesRender: React.FC<FeaturesRenderProp> = ({ featuresObj }) => {
  const { cabin, baggage, usb_power, free_meal, wifi, entertainment } =
    featuresObj || {};

  return (
    <Flex
      wrap
      style={{
        width: "100%",
        columnGap: "30px",
        rowGap: "10px",
      }}
    >
      {cabin && (
        <Flex
          style={{
            width: "30%",
          }}
          gap={5}
          align="center"
        >
          <img src={CABIN_ICON} alt="cabin" />
          <CustomTypography className="common_typography_fd">
            Cabin: {cabin} PC
          </CustomTypography>
        </Flex>
      )}

      {baggage && (
        <Flex
          style={{
            width: "30%",
          }}
          gap={5}
          align="center"
        >
          <img src={BAGGAGE_ICON} alt="baggage" />
          <CustomTypography className="common_typography_fd">
            Baggage: up to {baggage}
          </CustomTypography>
        </Flex>
      )}

      {usb_power && (
        <Flex
          style={{
            width: "30%",
          }}
          gap={5}
          align="center"
        >
          <img src={USB_ICON} alt="usb power" />
          <CustomTypography className="common_typography_fd">
            Power/USB Ports
          </CustomTypography>
        </Flex>
      )}

      {free_meal && (
        <Flex style={{ width: "30%" }} gap={5} align="center">
          <img src={MEAL_ICON} alt="meal" />
          <CustomTypography className="common_typography_fd">
            Free in-flight meal
          </CustomTypography>
        </Flex>
      )}

      {wifi && (
        <Flex style={{ width: "30%" }} gap={5} align="center">
          <img src={WIFI_ICON} alt="wifi" />
          <CustomTypography className="common_typography_fd">
            WiFi
          </CustomTypography>
        </Flex>
      )}

      {entertainment && (
        <Flex style={{ width: "30%" }} gap={5} align="center">
          <img src={ENTERTAINMENT_ICON} alt="entertainment" />
          <CustomTypography className="common_typography_fd">
            In-flight Entertainment
          </CustomTypography>
        </Flex>
      )}
    </Flex>
  );
};

export default FeaturesRender;
