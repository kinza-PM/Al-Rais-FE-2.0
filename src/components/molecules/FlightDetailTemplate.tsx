import React, { useEffect, useMemo } from "react";

import alraisLogo from "../../assets/images/alraisLogo.png";
import planeImg from "../../assets/images/travel_plane_image.png";
import "../../assets/css/travel.css";
import FlagUae from "../../assets/svgs/Flag-uae.svg";
import FlagInd from "../../assets/svgs/Flag-ind.svg";
import FlagUsa from "../../assets/svgs/Flag-usa.svg";
import colSeparater from "../../assets/svgs/Lineseparater.svg";
import {
  Segmented,
  Tabs,
  Select,
  Radio,
  Checkbox,
  Flex,
  Drawer,
  Button,
  Grid,
} from "antd";
// import type { CheckboxGroupProps } from "antd/es/checkbox";
import CustomButton from "../common/CustomButton";
import CustomSelect from "../common/CustomSelect";
import CustomDatePicker from "../common/CustomDatePicker";
import CustomCollapse from "../common/CustomCollapse";
import TravelOneWay from "./TravelOneWay";
import TravelRoundTrip from "./TravelRoundTrip";
import TravelMultiCity from "./TravelMultiCity";
import { Collapse } from "antd";
import type { TabsProps } from "antd";
import { useState } from "react";
import type { CheckboxProps } from "antd";
import { useMasterListings } from "../../hooks/useMasterListings";
import { FilterOutlined } from "@ant-design/icons";

import PassengerCounterDropdown from "../atoms/PassengerCounterDropdown";
import type {
  CountryOption,
  PassengerSchema,
  CabinClassOption,
  TripType,
} from "../../features/flights/types";
import TravelRoutePicker from "../atoms/TravelRoutePicker";

import { useFlightSearch } from "../../hooks/useFlightSearch";

const { Panel } = Collapse;

const onChange = (key: string) => {
  console.log(key);
};
const handleChange = (value: string) => {
  console.log(`selected ${value}`);
};

const items: TabsProps["items"] = [
  { key: "1", label: "Flights", children: "" },
  { key: "2", label: "Hotels", children: "" },
];

const baggageHandler: CheckboxProps["onChange"] = (e) => {
  console.log(`checked = ${e.target.checked}`);
};

// type Align = "One way" | "Round trip" | "Multi-city";

const FlightDetailTemplate: React.FC = () => {
  // const [alignValue, setAlignValue] = useState<Align>("One way");

  const { mutateAsync, isPending } = useFlightSearch();

  const [responseData, setResponseData] = useState<any[]>([]);
  const [dateTime, setDateTime] = useState("");
  const handleDate = (date: any) => {
    if (!date) return;

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    const formatted = `${year}-${month}-${day}`;

    setDateTime(formatted);
  };
  const handlePassanger = (passanger: any) => {
    // setDateTime(date)
  };

  function formatDuration(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    return `${hours}h ${minutes}min`;
  }

  function formatTime(dateStr: string) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short", // Mon
      day: "2-digit", // 16
      month: "long", // June
      year: "numeric", // 2025
    });
  }

  const handleSearch = async () => {
    const requestBody = {
      departureAirportCode: fromCode,
      departureDate: dateTime,
      arrivalAirportCode: "DEL",
      // arrivalAirportCode: toCode,
      cabinPreferences: [selectedCabinClassId],
      passengers: [
        {
          id: "1",
          ptc: "ADT",
        },
      ],
    };

    try {
      const response = await mutateAsync(requestBody);

      console.log("RESPONSE", response);

      const formattedData = response.data.map((item: any, index: number) => {
        const segment = item?.journey?.[0]?.flightSegments?.[0];
        return {
          id: index + 1,
          logo: `/airlines/${segment?.marketingAirline}.png`,
          name: segment?.marketingAirline,
          flight_detail: {
            flight_number: segment?.flightNumber,
            flight_class: segment?.cabinClass,
            start_time: formatTime(segment?.departureDateTime),
            start_date: formatDate(segment?.departureDateTime),
            end_time: formatTime(segment?.arrivalDateTime),
            end_date: formatDate(segment?.arrivalDateTime),
            duration: formatDuration(
              segment?.departureDateTime,
              segment?.arrivalDateTime
            ),
            seats_layout: segment?.seatsAvailable,
            flight_features: {
              cabin: 1,
              baggage: "40KGs",
              usb_power: true,
              free_meal: true,
              wifi: true,
              entertainment: true,
            },
          },
          airport_details: {
            startAirport: segment?.departureAirportCode,
            startTerminal: `Terminal ${segment?.departureTerminal}`,
            endAirport: segment?.arrivalAirportCode,
            endTerminal: `Terminal ${segment?.arrivalTerminal}`,
          },
          stop: item?.journey?.[0]?.stops || [], // agar stops array aaye toh dynamic
          price: {
            economyLite: {
              price: item?.fare?.totalFare,
            },
          },
          priceTemporary: {
            economyLite: {
              personalItem: "01 item (e.g., small backpack, laptop bag)",
              baggage: "",
              seatSelection: "Assigned at check-in",
              Changes: "with very high fee",
              Refundable: "",
              price: "48",
            },
            economyStandard: {
              personalItem: "01 item (e.g., small backpack, laptop bag)",
              baggage: "01 item (up to 20kg)",
              seatSelection: "Standard (free)",
              Changes: "$4 + fare difference",
              Refundable: "",
              price: "52",
            },
            economyFlex: {
              personalItem: "01 item (e.g., small backpack, laptop bag)",
              baggage: "02 items (up to 20kg each)",
              seatSelection: "Any (free, including preferred seats)",
              Changes: "Free (fare differences may apply)",
              Refundable: "with a small fee",
              price: "66",
            },
          },
        };
      });

      setResponseData(formattedData);
    } catch (error) {
      console.error("Flight search failed:", error);
    }

    // mutate(requestBody);
  };

  const {
    flightTypes,
    countries,
    passengers,
    cabinClasses,
    priceSort,
    numberStops,
    transitHours,
    baggage,
    loading,
  } = useMasterListings({
    include: [
      "flightTypes",
      "countries",
      "passengers",
      "cabinClasses",
      "priceSort",
      "numberStops",
      "transitHours",
      "baggage",
    ],
  });

  const { useBreakpoint } = Grid;

  const [trip, setTrip] = useState<TripType>("oneway");
  const [fromCode, setFromCode] = useState<string>("");
  const [toCode, setToCode] = useState<string>("");
  const [selectedCabinClassId, setSelectedCabinClassId] = useState<string>("");
  const [selectedPriceId, setSelectedPriceId] = useState<string>("");

  // const [showFilters, setShowFilters] = useState(false);

  const [open, setOpen] = useState(false);
  const screens = useBreakpoint(); // responsive breakpoints

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  useEffect(() => {
    if (!fromCode && (countries as CountryOption[])[0]) {
      setFromCode((countries as CountryOption[])[0].code);
    }
    if (!toCode && (countries as CountryOption[])[1]) {
      setToCode((countries as CountryOption[])[1].code);
    }
  }, [countries, fromCode, toCode]);

  useEffect(() => {
    if (fromCode && toCode && fromCode === toCode) {
      setToCode(""); // invalid combo ko turant clear
    }
  }, [fromCode, toCode]);

  // memo’d options
  const segOptions = useMemo(
    () => (flightTypes || []).map((ft) => ({ label: ft.label, value: ft.key })),
    [flightTypes]
  );

  const cabinSelectOptions = useMemo(
    () => [
      { value: "", label: "Please select", disabled: true },
      ...(cabinClasses as CabinClassOption[]).map((c) => ({
        value: c.id,
        label: c.label,
      })),
    ],
    [cabinClasses]
  );

  const priceOptions = useMemo(
    () =>
      (priceSort && priceSort.length
        ? priceSort
        : [
            { value: "lowest", label: "Lowest Price" },
            { value: "medium", label: "Medium Price" },
            { value: "highest", label: "Highest Price" },
          ]) as { value: string; label: string }[],
    [priceSort]
  );

  const selectedPriceLabel = useMemo(
    () => priceOptions.find((o) => o.value === selectedPriceId)?.label ?? "",
    [priceOptions, selectedPriceId]
  );

  // const { cabinClasses } = useMasterListings();

  const headerContent = (
    <div>
      <div style={{ fontSize: 12, fontWeight: 400, color: "#3D495C" }}>
        Sort by
      </div>
      {selectedPriceLabel && (
        <div style={{ fontSize: 16, fontWeight: 500 }}>
          {selectedPriceLabel}
        </div>
      )}
    </div>
  );

  // const findedCabine = cabinClasses?.find(
  //   (item) => item.id === flight?.selectedCabinClassId
  // );

  return (
    <div className="">
      <div className="topHeaderSetting">
        <div className="topHeaderSettingInner">
          <div className="tadioButtonGroupWrap py-pxTopHeader">
            <div className="radioButtonGroup">
              <Segmented
                value={trip}
                style={{ marginBottom: 0 }}
                onChange={(v) => setTrip(v as TripType)}
                options={
                  segOptions.length
                    ? segOptions
                    : [
                        { label: "One way", value: "oneway" },
                        { label: "Round trip", value: "roundtrip" },
                        { label: "Multi-city", value: "multicity" },
                      ]
                }
                disabled={loading && !segOptions.length}
              />
            </div>
          </div>
          <div className="topHeaderTabs">
            <Tabs
              defaultActiveKey="1"
              className="customIndicate"
              items={items}
              onChange={onChange}
              tabBarStyle={{ marginBottom: "16px !important" }}
              // indicator={{ size: (origin) => origin - 20, align: alignValue }}
            />
          </div>
          <div className="countrySelectAndGetHelp py-pxTopHeader">
            <div>
              <Select
                className="countrySelectBox"
                defaultValue="US"
                style={{
                  width: 100,
                  borderRadius: 12,
                  height: 44,
                }}
                onChange={handleChange}
                options={[
                  {
                    value: "US",
                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontWeight: 500,
                        }}
                      >
                        <img
                          src={FlagUsa}
                          alt="US Flag"
                          style={{ width: 28, height: 28, marginRight: 0 }}
                        />
                        US
                      </span>
                    ),
                  },

                  {
                    value: "UAE",
                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontWeight: 500,
                        }}
                      >
                        <img
                          src={FlagUae}
                          alt="UAE Flag"
                          style={{ width: 28, height: 28, marginRight: 0 }}
                        />
                        UAE
                      </span>
                    ),
                  },
                  {
                    value: "Ind",
                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontWeight: 500,
                        }}
                      >
                        <img
                          src={FlagInd}
                          alt="IND Flag"
                          style={{ width: 28, height: 28, marginRight: 0 }}
                        />
                        IND
                      </span>
                    ),
                  },
                ]}
              />
            </div>
            <div className="smalSeparater">
              <img src={colSeparater} alt="" style={{ width: 1, height: 30 }} />
            </div>

            <div className="getHelpLink">
              <a href="#">Get help</a>
            </div>
          </div>
        </div>
      </div>

      <div className="flightDetailTemplateWrap">
        <div className="bottomHeaderSetting">
          <Flex className="bottomHeaderFlex">
            <TravelRoutePicker
              options={countries as CountryOption[]}
              loading={loading}
              value={{ fromCode, toCode }}
              onChange={({ fromCode: f, toCode: t }) => {
                setFromCode(f);
                setToCode(t);
              }}
              showSwap
              labels={{ from: "From", to: "To" }}
              placeholders={{ from: "Please select", to: "Please select" }}
              disableSameSelection
              widthClass="fromToSelectWidth" // same as OneWayForm; chaho to "w-full" bhi de sakte ho
            />
          </Flex>
          <Flex className="bottomHeaderFlex">
            <Flex vertical style={{ width: "100%", maxWidth: 200 }}>
              <label className="header-labels-common ">Departure Date</label>
              <CustomDatePicker
                format={"dddd, DD MMM YYYY "}
                style={{ width: "100%", height: 44 }}
                className="header-input-common ant-input-select"
                onChange={(value) => {
                  handleDate(value);
                }}
              />
            </Flex>
            <Flex vertical style={{ width: "100%", maxWidth: 200 }}>
              <label className="header-labels-common ">Passengers</label>
              <div style={{ minWidth: "100%", height: 44 }}>
                <PassengerCounterDropdown
                  schema={passengers as PassengerSchema}
                  maxTotal={9}
                  onChange={(value) => {
                    handlePassanger(value);
                  }}
                />
              </div>
            </Flex>
            <Flex vertical style={{ width: "100%", maxWidth: 200 }}>
              <label className="header-labels-common ">Cabin Class</label>
              <CustomSelect
                placeholder={loading ? "Loading…" : "Please select"}
                options={cabinSelectOptions}
                className="header-sub-inputs-common"
                style={{ minWidth: "100%", height: 44 }}
                // value={findedCabine}
                value={selectedCabinClassId || undefined}
                onChange={(v: string) => setSelectedCabinClassId(v)}
                disabled={loading}
              />
            </Flex>
          </Flex>
          <CustomButton className="searchFilterBtn" onClick={handleSearch}>
            {isPending ? "Searching..." : "Search flights"}
          </CustomButton>
        </div>

        {!screens.lg && (
          <div className="">
            <Drawer
              title="Filters"
              placement="right"
              closable={true}
              onClose={onClose}
              open={open}
              width={300}
            >
              {/* <button
              className="filterToggleBtn"
              onClick={() => setShowFilters(!showFilters)}
            > */}
              {/* <FilterOutlined />
            </button> */}
              <div className="filterSectionStyle">
                <div className="">
                  <CustomCollapse>
                    <Panel header={headerContent} key="1">
                      <Select
                        style={{ width: "100%" }}
                        placeholder="Select an option"
                        value={selectedPriceId || undefined}
                        onChange={(value) => setSelectedPriceId(value)}
                        options={priceOptions}
                        disabled={loading && !priceOptions.length}
                      />
                    </Panel>
                  </CustomCollapse>
                </div>
                <div className="filterStyle">
                  <div className="filterHeading">
                    <div>
                      <h4>
                        Filters
                        <span className="smallDot">•</span>
                        <span className="lightActiveText">{0} Active</span>
                      </h4>
                    </div>
                    <div className="resetAllBtn">
                      <a href="#">Reset all</a>
                    </div>
                  </div>
                  <CustomCollapse>
                    <Panel header="Number of stops" key="1">
                      <Radio.Group
                        block
                        options={
                          numberStops && numberStops.length
                            ? numberStops
                            : [{ label: "0", value: "0" }]
                        }
                        defaultValue={
                          (numberStops && numberStops[0]?.value) ?? "0"
                        }
                        optionType="button"
                        buttonStyle="solid"
                        className="stopsRadioStyle"
                        disabled={loading && !numberStops.length}
                      />
                    </Panel>
                  </CustomCollapse>
                  <CustomCollapse>
                    <Panel header="Baggage" key="1">
                      <Checkbox
                        className="baggageCheckbox"
                        onChange={baggageHandler}
                        disabled={loading && !baggage.length}
                      >
                        {(baggage && baggage[0]?.label) ||
                          "Checked baggage included"}
                      </Checkbox>
                    </Panel>
                  </CustomCollapse>

                  <CustomCollapse>
                    <Panel header="Transit hours" key="1">
                      <Radio.Group
                        block
                        options={
                          transitHours && transitHours.length
                            ? transitHours
                            : [{ label: "0-3h", value: "0-3h" }]
                        }
                        defaultValue={
                          (transitHours && transitHours[0]?.value) ?? "0-3h"
                        }
                        optionType="button"
                        buttonStyle="solid"
                        className="transitHours"
                        disabled={loading && !transitHours.length}
                      />
                    </Panel>
                  </CustomCollapse>

                  <CustomCollapse>
                    <Panel header="Flight time" key="1">
                      <p
                        className="departureArrivalHeading"
                        style={{ paddingTop: 0 }}
                      >
                        Departure
                      </p>
                      <div className="departureArrival">
                        <div className="timeBox">11:00AM</div>
                        <div className="rightArrow">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.8538 8.35378L9.35375 12.8538C9.25993 12.9476 9.13268 13.0003 9 13.0003C8.86732 13.0003 8.74007 12.9476 8.64625 12.8538C8.55243 12.76 8.49972 12.6327 8.49972 12.5C8.49972 12.3674 8.55243 12.2401 8.64625 12.1463L12.2931 8.50003H2.5C2.36739 8.50003 2.24021 8.44736 2.14645 8.35359C2.05268 8.25982 2 8.13264 2 8.00003C2 7.86743 2.05268 7.74025 2.14645 7.64648C2.24021 7.55271 2.36739 7.50003 2.5 7.50003H12.2931L8.64625 3.85378C8.55243 3.75996 8.49972 3.63272 8.49972 3.50003C8.49972 3.36735 8.55243 3.2401 8.64625 3.14628C8.74007 3.05246 8.86732 2.99976 9 2.99976C9.13268 2.99976 9.25993 3.05246 9.35375 3.14628L13.8538 7.64628C13.9002 7.69272 13.9371 7.74786 13.9623 7.80856C13.9874 7.86926 14.0004 7.93433 14.0004 8.00003C14.0004 8.06574 13.9874 8.13081 13.9623 8.1915C13.9371 8.2522 13.9002 8.30735 13.8538 8.35378Z"
                              fill="#0A0C0F"
                            />
                          </svg>
                        </div>
                        <div className="timeBox">02:00PM</div>
                      </div>

                      <p className="departureArrivalHeading">Arrival</p>
                      <div className="departureArrival">
                        <div className="timeBox">11:00AM</div>
                        <div className="rightArrow">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.8538 8.35378L9.35375 12.8538C9.25993 12.9476 9.13268 13.0003 9 13.0003C8.86732 13.0003 8.74007 12.9476 8.64625 12.8538C8.55243 12.76 8.49972 12.6327 8.49972 12.5C8.49972 12.3674 8.55243 12.2401 8.64625 12.1463L12.2931 8.50003H2.5C2.36739 8.50003 2.24021 8.44736 2.14645 8.35359C2.05268 8.25982 2 8.13264 2 8.00003C2 7.86743 2.05268 7.74025 2.14645 7.64648C2.24021 7.55271 2.36739 7.50003 2.5 7.50003H12.2931L8.64625 3.85378C8.55243 3.75996 8.49972 3.63272 8.49972 3.50003C8.49972 3.36735 8.55243 3.2401 8.64625 3.14628C8.74007 3.05246 8.86732 2.99976 9 2.99976C9.13268 2.99976 9.25993 3.05246 9.35375 3.14628L13.8538 7.64628C13.9002 7.69272 13.9371 7.74786 13.9623 7.80856C13.9874 7.86926 14.0004 7.93433 14.0004 8.00003C14.0004 8.06574 13.9874 8.13081 13.9623 8.1915C13.9371 8.2522 13.9002 8.30735 13.8538 8.35378Z"
                              fill="#0A0C0F"
                            />
                          </svg>
                        </div>
                        <div className="timeBox">02:00PM</div>
                      </div>
                    </Panel>
                  </CustomCollapse>
                </div>
              </div>
            </Drawer>
          </div>
        )}

        <div className="contentWrapFlex">
          {screens.lg && (
            <div className="flightDetailFilter">
              <div className="filterSectionStyle">
                <div className="">
                  <CustomCollapse>
                    <Panel header={headerContent} key="1">
                      <Select
                        style={{ width: "100%" }}
                        placeholder="Select an option"
                        value={selectedPriceId || undefined}
                        onChange={(value) => setSelectedPriceId(value)}
                        options={priceOptions}
                        disabled={loading && !priceOptions.length}
                      />
                    </Panel>
                  </CustomCollapse>
                </div>
                <div className="filterStyle">
                  <div className="filterHeading">
                    <div>
                      <h4>
                        Filters
                        <span className="smallDot">•</span>
                        <span className="lightActiveText">{0} Active</span>
                      </h4>
                    </div>
                    <div className="resetAllBtn">
                      <a href="#">Reset all</a>
                    </div>
                  </div>
                  <CustomCollapse>
                    <Panel header="Number of stops" key="1">
                      <Radio.Group
                        block
                        options={
                          numberStops && numberStops.length
                            ? numberStops
                            : [{ label: "0", value: "0" }]
                        }
                        defaultValue={
                          (numberStops && numberStops[0]?.value) ?? "0"
                        }
                        optionType="button"
                        buttonStyle="solid"
                        className="stopsRadioStyle"
                        disabled={loading && !numberStops.length}
                      />
                    </Panel>
                  </CustomCollapse>
                  <CustomCollapse>
                    <Panel header="Baggage" key="1">
                      <Checkbox
                        className="baggageCheckbox"
                        onChange={baggageHandler}
                        disabled={loading && !baggage.length}
                      >
                        {(baggage && baggage[0]?.label) ||
                          "Checked baggage included"}
                      </Checkbox>
                    </Panel>
                  </CustomCollapse>

                  <CustomCollapse>
                    <Panel header="Transit hours" key="1">
                      <Radio.Group
                        block
                        options={
                          transitHours && transitHours.length
                            ? transitHours
                            : [{ label: "0-3h", value: "0-3h" }]
                        }
                        defaultValue={
                          (transitHours && transitHours[0]?.value) ?? "0-3h"
                        }
                        optionType="button"
                        buttonStyle="solid"
                        className="transitHours"
                        disabled={loading && !transitHours.length}
                      />
                    </Panel>
                  </CustomCollapse>

                  <CustomCollapse>
                    <Panel header="Flight time" key="1">
                      <p
                        className="departureArrivalHeading"
                        style={{ paddingTop: 0 }}
                      >
                        Departure
                      </p>
                      <div className="departureArrival">
                        <div className="timeBox">11:00AM</div>
                        <div className="rightArrow">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.8538 8.35378L9.35375 12.8538C9.25993 12.9476 9.13268 13.0003 9 13.0003C8.86732 13.0003 8.74007 12.9476 8.64625 12.8538C8.55243 12.76 8.49972 12.6327 8.49972 12.5C8.49972 12.3674 8.55243 12.2401 8.64625 12.1463L12.2931 8.50003H2.5C2.36739 8.50003 2.24021 8.44736 2.14645 8.35359C2.05268 8.25982 2 8.13264 2 8.00003C2 7.86743 2.05268 7.74025 2.14645 7.64648C2.24021 7.55271 2.36739 7.50003 2.5 7.50003H12.2931L8.64625 3.85378C8.55243 3.75996 8.49972 3.63272 8.49972 3.50003C8.49972 3.36735 8.55243 3.2401 8.64625 3.14628C8.74007 3.05246 8.86732 2.99976 9 2.99976C9.13268 2.99976 9.25993 3.05246 9.35375 3.14628L13.8538 7.64628C13.9002 7.69272 13.9371 7.74786 13.9623 7.80856C13.9874 7.86926 14.0004 7.93433 14.0004 8.00003C14.0004 8.06574 13.9874 8.13081 13.9623 8.1915C13.9371 8.2522 13.9002 8.30735 13.8538 8.35378Z"
                              fill="#0A0C0F"
                            />
                          </svg>
                        </div>
                        <div className="timeBox">02:00PM</div>
                      </div>

                      <p className="departureArrivalHeading">Arrival</p>
                      <div className="departureArrival">
                        <div className="timeBox">11:00AM</div>
                        <div className="rightArrow">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.8538 8.35378L9.35375 12.8538C9.25993 12.9476 9.13268 13.0003 9 13.0003C8.86732 13.0003 8.74007 12.9476 8.64625 12.8538C8.55243 12.76 8.49972 12.6327 8.49972 12.5C8.49972 12.3674 8.55243 12.2401 8.64625 12.1463L12.2931 8.50003H2.5C2.36739 8.50003 2.24021 8.44736 2.14645 8.35359C2.05268 8.25982 2 8.13264 2 8.00003C2 7.86743 2.05268 7.74025 2.14645 7.64648C2.24021 7.55271 2.36739 7.50003 2.5 7.50003H12.2931L8.64625 3.85378C8.55243 3.75996 8.49972 3.63272 8.49972 3.50003C8.49972 3.36735 8.55243 3.2401 8.64625 3.14628C8.74007 3.05246 8.86732 2.99976 9 2.99976C9.13268 2.99976 9.25993 3.05246 9.35375 3.14628L13.8538 7.64628C13.9002 7.69272 13.9371 7.74786 13.9623 7.80856C13.9874 7.86926 14.0004 7.93433 14.0004 8.00003C14.0004 8.06574 13.9874 8.13081 13.9623 8.1915C13.9371 8.2522 13.9002 8.30735 13.8538 8.35378Z"
                              fill="#0A0C0F"
                            />
                          </svg>
                        </div>
                        <div className="timeBox">02:00PM</div>
                      </div>
                    </Panel>
                  </CustomCollapse>
                </div>
              </div>
            </div>
          )}
          <div className="flightDetailMainContent" style={{ width: "100%" }}>
            <div className="relative w-full max-w-[1040px] m-auto">
              <img
                src={planeImg}
                alt=""
                className="absolute w-[344px] top-[-18px] left-[312px]"
              />
            </div>
            <div className="setHeroImage">
              <div className="heroImgDFlex">
                <div className="partOne">
                  <div>
                    <img src={alraisLogo} alt="" />
                  </div>
                  <div>
                    <h4>30% off</h4>
                    <h6>World Flight Day Special!</h6>
                    <p className="para1">
                      Book a FlyDubai flight to Mumbai today and enjoy
                    </p>
                    <p className="para2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 1.875C8.39303 1.875 6.82214 2.35152 5.486 3.24431C4.14985 4.1371 3.10844 5.40605 2.49348 6.8907C1.87852 8.37535 1.71762 10.009 2.03112 11.5851C2.34463 13.1612 3.11846 14.6089 4.25476 15.7452C5.39106 16.8815 6.8388 17.6554 8.4149 17.9689C9.99099 18.2824 11.6247 18.1215 13.1093 17.5065C14.594 16.8916 15.8629 15.8502 16.7557 14.514C17.6485 13.1779 18.125 11.607 18.125 10C18.1227 7.84581 17.266 5.78051 15.7427 4.25727C14.2195 2.73403 12.1542 1.87727 10 1.875ZM10 16.875C8.64026 16.875 7.31105 16.4718 6.18046 15.7164C5.04987 14.9609 4.16868 13.8872 3.64833 12.6309C3.12798 11.3747 2.99183 9.99237 3.2571 8.65875C3.52238 7.32513 4.17716 6.10013 5.13864 5.13864C6.10013 4.17716 7.32514 3.52237 8.65876 3.2571C9.99238 2.99183 11.3747 3.12798 12.631 3.64833C13.8872 4.16868 14.9609 5.04987 15.7164 6.18045C16.4718 7.31104 16.875 8.64025 16.875 10C16.8729 11.8227 16.1479 13.5702 14.8591 14.8591C13.5702 16.1479 11.8227 16.8729 10 16.875ZM11.25 13.75C11.25 13.9158 11.1842 14.0747 11.0669 14.1919C10.9497 14.3092 10.7908 14.375 10.625 14.375C10.2935 14.375 9.97554 14.2433 9.74112 14.0089C9.5067 13.7745 9.375 13.4565 9.375 13.125V10C9.20924 10 9.05027 9.93415 8.93306 9.81694C8.81585 9.69973 8.75 9.54076 8.75 9.375C8.75 9.20924 8.81585 9.05027 8.93306 8.93306C9.05027 8.81585 9.20924 8.75 9.375 8.75C9.70652 8.75 10.0245 8.8817 10.2589 9.11612C10.4933 9.35054 10.625 9.66848 10.625 10V13.125C10.7908 13.125 10.9497 13.1908 11.0669 13.3081C11.1842 13.4253 11.25 13.5842 11.25 13.75ZM8.75 6.5625C8.75 6.37708 8.80499 6.19582 8.908 6.04165C9.01101 5.88748 9.15743 5.76732 9.32874 5.69636C9.50004 5.62541 9.68854 5.60684 9.8704 5.64301C10.0523 5.67919 10.2193 5.76848 10.3504 5.89959C10.4815 6.0307 10.5708 6.19775 10.607 6.3796C10.6432 6.56146 10.6246 6.74996 10.5536 6.92127C10.4827 7.09257 10.3625 7.23899 10.2084 7.342C10.0542 7.44502 9.87292 7.5 9.6875 7.5C9.43886 7.5 9.20041 7.40123 9.02459 7.22541C8.84878 7.0496 8.75 6.81114 8.75 6.5625Z"
                          fill="#A7C0EC"
                        />
                      </svg>
                      <span>Terms and conditions apply</span>
                    </p>
                  </div>
                </div>

                <div>
                  <button className="promoCodeBtn">Copy promo code</button>
                </div>
              </div>
            </div>

            {!screens.lg && (
              <Button
                className="filterToggleBtn"
                type="primary"
                icon={<FilterOutlined />}
                onClick={showDrawer}
              >
                Filters
              </Button>
            )}
            {trip === "oneway" ? (
              <TravelOneWay passData={responseData || []} />
            ) : trip === "roundtrip" ? (
              <TravelRoundTrip />
            ) : (
              <TravelMultiCity />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetailTemplate;
