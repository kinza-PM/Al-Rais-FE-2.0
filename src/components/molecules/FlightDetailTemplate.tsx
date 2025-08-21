import React, { useEffect, useMemo } from "react";
import "../../assets/css/travel.css";
import FlagUae from "../../assets/svgs/Flag-uae.svg";
import FlagInd from "../../assets/svgs/Flag-ind.svg";
import FlagUsa from "../../assets/svgs/Flag-usa.svg";
import colSeparater from "../../assets/svgs/Lineseparater.svg";
import { Segmented, Tabs, Select, Radio, Checkbox, Flex } from "antd";
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
import { useFlightStore } from "../../store/UseFlightStore";
import { useMasterListings } from "../../hooks/useMasterListings";

import PassengerCounterDropdown from "../atoms/PassengerCounterDropdown";
import type {
  CountryOption,
  PassengerSchema,
  CabinClassOption,
  TripType,
} from "../../features/flights/types";
import TravelRoutePicker from "../atoms/TravelRoutePicker";

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

  const [trip, setTrip] = useState<TripType>("oneway");
  const [fromCode, setFromCode] = useState<string>("");
  const [toCode, setToCode] = useState<string>("");
  const [selectedCabinClassId, setSelectedCabinClassId] = useState<string>("");
  const [selectedPriceId, setSelectedPriceId] = useState<string>("");

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

  const { flight } = useFlightStore();

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

  const findedCabine = cabinClasses?.find(
    (item) => item.id === flight?.selectedCabinClassId
  );

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
                  borderRadius: 16,
                  height: 50,
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

      <div
        style={{
          padding: "0px 32px",
        }}
      >
        <div className="bottomHeaderSetting ">
          <Flex align="end" gap={16} style={{ width: "40%" }}>
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
              widthClass="w-[260px]" // same as OneWayForm; chaho to "w-full" bhi de sakte ho
            />
          </Flex>
          <Flex align="end" style={{ width: "45%" }} gap={16}>
            <Flex vertical style={{ width: "100%" }} flex={1}>
              <label className="header-labels-common ">Departure Date</label>
              <CustomDatePicker
                format={"dddd, DD MMM YYYY "}
                style={{ minWidth: "100%" }}
                className="header-input-common ant-input-select"
              />
            </Flex>
            <Flex vertical style={{ width: "100%" }} flex={1}>
              <label className="header-labels-common ">Passengers</label>
              <div style={{ minWidth: "100%", height: 50 }}>
                <PassengerCounterDropdown
                  schema={passengers as PassengerSchema}
                  maxTotal={9}
                />
              </div>
            </Flex>
            <Flex vertical style={{ width: "100%" }} flex={1}>
              <label className="header-labels-common ">Cabin Class</label>
              <CustomSelect
                placeholder={loading ? "Loading…" : "Please select"}
                options={cabinSelectOptions}
                className="header-sub-inputs-common"
                style={{ minWidth: "100%", height: "50px" }}
                // value={findedCabine}
                value={selectedCabinClassId || undefined}
                onChange={(v: string) => setSelectedCabinClassId(v)}
                disabled={loading}
              />
            </Flex>
          </Flex>
          <CustomButton
            style={{
              minWidth: 200,
              borderRadius: 8,
              marginLeft: 29,
              flex: 1,
            }}
          >
            Search flights
          </CustomButton>
        </div>
        <div className="contentWrapFlex">
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
                    defaultValue={(numberStops && numberStops[0]?.value) ?? "0"}
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
          <div className="" style={{ width: "100%" }}>
            {trip === "oneway" ? (
              <TravelOneWay />
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
