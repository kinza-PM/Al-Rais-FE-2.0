import React from "react";
import "../../assets/css/travel.css";
import FlagUsa from "../../assets/images/Flag-usa.png";
import { Segmented, Tabs, Select, Radio, Checkbox } from "antd";
import type { CheckboxGroupProps } from "antd/es/checkbox";
import CustomTypography from "../common/CustomTypography";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
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

const options: CheckboxGroupProps<string>["options"] = [
  { label: "0", value: "0" },
  { label: "01", value: "01" },
  { label: "02", value: "02" },
];
const options2: CheckboxGroupProps<string>["options"] = [
  { label: "0-3h", value: "0-3h" },
  { label: "3-6h", value: "3-6h" },
  { label: "6-12h", value: "6-12h" },
  { label: "12h+", value: "12h+" },
  { label: "24h+", value: "24h+" },
];

const baggage: CheckboxProps["onChange"] = (e) => {
  console.log(`checked = ${e.target.checked}`);
};

type Align = "One way" | "Round trip" | "Multi-city";

const TravelTemplate: React.FC = () => {
  const [alignValue, setAlignValue] = React.useState<Align>("One way");

  const [selectedValue, setSelectedValue] = useState<string>("Lowest Price");

  const headerContent = (
    <div>
      <div style={{ fontSize: 12, fontWeight: 400, color: "#3D495C" }}>
        Sort by
      </div>
      {selectedValue && (
        <div style={{ fontSize: 16, fontWeight: 500 }}>{selectedValue}</div>
      )}
    </div>
  );

  return (
    <div className="">
      <div className="topHeaderSetting">
        <div className="tadioButtonGroupWrap">
          <div className="radioButtonGroup">
            <Segmented
              value={alignValue}
              style={{ marginBottom: 0 }}
              onChange={setAlignValue}
              options={["One way", "Round trip", "Multi-city"]}
            />
          </div>
        </div>
        <div className="topHeaderTabs">
          <Tabs
            defaultActiveKey="1"
            items={items}
            onChange={onChange}
            // indicator={{ size: (origin) => origin - 20, align: alignValue }}
          />
          {/* <CustomTypography style={{ color: "red" }}>
            hrtyerytr
          </CustomTypography>
          <CustomButton>Test</CustomButton>
          <CustomInput placeholder="sadasd" value={12} />
          <CustomSelect></CustomSelect>
          <CustomDatePicker />
          <CustomCollapse accordion defaultActiveKey={["1"]}>
            <Panel header="Section 1" key="1">
              Content for section 1
            </Panel>
            <Panel header="Section 2" key="2">
              Content for section 2
            </Panel>
          </CustomCollapse> */}
        </div>
        <div className="countrySelectAndGetHelp">
          <div>
            <Select
              className="countrySelectBox"
              defaultValue="US"
              style={{
                width: 92,
                borderRadius: 12,
                border: "1px solid var(--black-100, #C2CAD6)",
              }}
              onChange={handleChange}
              options={[
                {
                  value: "US",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={FlagUsa}
                        alt="US Flag"
                        style={{ width: 20, height: 20, marginRight: 0 }}
                      />
                      US
                    </span>
                  ),
                },
                { value: "Select", label: "Lucy" },
                { value: "Yiminghe", label: "yiminghe" },
                { value: "disabled", label: "Disabled", disabled: true },
              ]}
            />
          </div>
          <div className="smalSeparater">
            <svg
              width="1"
              height="30"
              viewBox="0 0 1 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="0.5"
                y1="2.18556e-08"
                x2="0.499999"
                y2="30"
                stroke="#E4E4E7"
              />
            </svg>
          </div>

          <div className="getHelpLink">
            <a href="#">Get help</a>
          </div>
        </div>
      </div>

      <div className="bottomHeaderSetting">
        <CustomInput />
        <div className="fromToIcon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="24" cy="24" r="24" fill="#2351A3" />
            <path
              d="M30.6922 28.1922L28.1922 30.6922C28.0749 30.8095 27.9159 30.8754 27.75 30.8754C27.5842 30.8754 27.4251 30.8095 27.3078 30.6922C27.1905 30.5749 27.1247 30.4159 27.1247 30.25C27.1247 30.0842 27.1905 29.9251 27.3078 29.8078L28.7414 28.375H17.75C17.5842 28.375 17.4253 28.3092 17.3081 28.192C17.1909 28.0747 17.125 27.9158 17.125 27.75C17.125 27.5843 17.1909 27.4253 17.3081 27.3081C17.4253 27.1909 17.5842 27.125 17.75 27.125H28.7414L27.3078 25.6922C27.1905 25.5749 27.1247 25.4159 27.1247 25.25C27.1247 25.0842 27.1905 24.9251 27.3078 24.8078C27.4251 24.6905 27.5842 24.6247 27.75 24.6247C27.9159 24.6247 28.0749 24.6905 28.1922 24.8078L30.6922 27.3078C30.7503 27.3659 30.7964 27.4348 30.8279 27.5107C30.8593 27.5865 30.8755 27.6679 30.8755 27.75C30.8755 27.8321 30.8593 27.9135 30.8279 27.9893C30.7964 28.0652 30.7503 28.1342 30.6922 28.1922ZM19.8078 23.1922C19.9251 23.3095 20.0842 23.3754 20.25 23.3754C20.4159 23.3754 20.5749 23.3095 20.6922 23.1922C20.8095 23.0749 20.8754 22.9159 20.8754 22.75C20.8754 22.5842 20.8095 22.4251 20.6922 22.3078L19.2586 20.875H30.25C30.4158 20.875 30.5747 20.8092 30.6919 20.692C30.8092 20.5747 30.875 20.4158 30.875 20.25C30.875 20.0843 30.8092 19.9253 30.6919 19.8081C30.5747 19.6909 30.4158 19.625 30.25 19.625H19.2586L20.6922 18.1922C20.8095 18.0749 20.8754 17.9159 20.8754 17.75C20.8754 17.5842 20.8095 17.4251 20.6922 17.3078C20.5749 17.1905 20.4159 17.1247 20.25 17.1247C20.0842 17.1247 19.9251 17.1905 19.8078 17.3078L17.3078 19.8078C17.2497 19.8659 17.2036 19.9348 17.1722 20.0107C17.1407 20.0865 17.1245 20.1679 17.1245 20.25C17.1245 20.3321 17.1407 20.4135 17.1722 20.4893C17.2036 20.5652 17.2497 20.6342 17.3078 20.6922L19.8078 23.1922Z"
              fill="white"
            />
          </svg>
        </div>
        <CustomInput />
        <CustomDatePicker />
        <CustomSelect />
        <CustomSelect />
        <CustomButton>Search flights </CustomButton>
      </div>
      <div className="contentWrapFlex">
        <div className="filterSectionStyle">
          <div className="">
            <CustomCollapse>
              <Panel header={headerContent} key="1">
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select an option"
                  value={selectedValue || undefined}
                  onChange={(value) => setSelectedValue(value)}
                  options={[
                    { value: "Lowest Price", label: "Lowest Price" },
                    { value: "Medium Price", label: "Medium Price" },
                    { value: "Highest Price", label: "Highest Price" },
                  ]}
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
                  options={options}
                  defaultValue="0"
                  optionType="button"
                  buttonStyle="solid"
                  className="stopsRadioStyle"
                />
              </Panel>
            </CustomCollapse>
            <CustomCollapse>
              <Panel header="Baggage" key="1">
                <Checkbox className="baggageCheckbox" onChange={baggage}>
                  Checkbox
                </Checkbox>
              </Panel>
            </CustomCollapse>

            <CustomCollapse>
              <Panel header="Transit hours" key="1">
                <Radio.Group
                  block
                  options={options2}
                  defaultValue="0-3h"
                  optionType="button"
                  buttonStyle="solid"
                  className="transitHours"
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
          {alignValue === "One way" ? (
            <TravelOneWay />
          ) : alignValue === "Round trip" ? (
            <TravelRoundTrip />
          ) : (
            <TravelMultiCity />
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelTemplate;
