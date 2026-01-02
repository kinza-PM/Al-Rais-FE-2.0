import React from "react";

import "../../assets/css/travel.css";
import FlagUae from "../../assets/svgs/Flag-uae.svg";
import FlagInd from "../../assets/svgs/Flag-ind.svg";
import FlagUsa from "../../assets/svgs/Flag-usa.svg";
import colSeparater from "../../assets/svgs/Lineseparater.svg";
import { Segmented, Tabs, Select, Flex, Grid, Drawer, Button } from "antd";
import CustomButton from "../common/CustomButton";

import type { TabsProps } from "antd";
import { useState } from "react";
import { useMasterListings } from "../../hooks/masterListings/useMasterListings";

import type { PassengerSchema } from "../../features/flights/types";
import SearchableDropdown from "../common/SearchableDropdown";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
import TravellersAndRoomDropdown from "../atoms/TravellersAndRoomDropdown";
import CheckableDropdown from "../common/CheckableDropdown";
import type { HotelViewType } from "../../features/hotels/types";
import HotelsSearchFilter from "../atoms/HotelsSearchFilter";
import { FilterOutlined } from "@ant-design/icons";
import HotelSearchListView from "./HotelSearchListView";
import HotelSearchGridView from "./HotelSearchGridView";
import HotelSearchMapView from "./HotelSearchMapView";

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

const locationOptions = [
  { id: "1", value: "USA", label: "United States" },
  { id: "2", value: "UK", label: "United Kingdom" },
  { id: "3", value: "UAE", label: "United Arab Emirates" },
  // Add more locations as needed
];

const starRatingOptions = [
  { id: "1", value: "1", label: "1 star" },
  { id: "2", value: "2", label: "2 stars" },
  { id: "3", value: "3", label: "3 stars" },
  { id: "4", value: "4", label: "4 stars" },
  { id: "5", value: "5", label: "5 stars" },
];

const hotelViewTypes = [
  { label: "List view", value: "listview" },
  { label: "Grid view", value: "gridview" },
  { label: "Map view", value: "mapview" },
];

const HotelSearchListing: React.FC = () => {
  const [hotelView, setHotelView] = useState<HotelViewType>("listview");
  const [location, setLocation] = useState<string>("");
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const [open, setOpen] = useState(false);

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const { passengers } = useMasterListings({
    include: ["passengers"],
  });

  return (
    <div className="">
      <div className="topHeaderSetting">
        <div className="topHeaderSettingInner">
          <div className="tadioButtonGroupWrap py-pxTopHeader">
            <div className="radioButtonGroup">
              <Segmented
                value={hotelView}
                style={{ marginBottom: 0 }}
                onChange={(v) => setHotelView(v as HotelViewType)}
                options={hotelViewTypes}
              />
            </div>
          </div>
          <div className="topHeaderTabs">
            <Tabs
              defaultActiveKey="2"
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
            <Flex vertical style={{ width: "100%", maxWidth: 380 }}>
              <div>
                <SearchableDropdown
                  options={locationOptions}
                  value={location}
                  onChange={setLocation}
                  placeholder="Where are you traveling to?"
                  label="Location"
                  widthClass="w-full"
                  searchPlaceholder="Search"
                />
              </div>
            </Flex>
            <Flex vertical style={{ width: "100%", maxWidth: 380 }}>
              <div>
                <label className="block text-[12px] text-[#3D495C] mb-1">
                  Dates
                </label>
                <div className="h-11 w-full rounded-xl border border-[#DFE7F3] px-3 flex items-center">
                  <TailiwindCustomDatePicker
                    value={checkInDate}
                    onChange={setCheckInDate}
                    placeholder="Check-in date"
                    buttonIconSrc={true}
                    overridesClass={true}
                    showCalendarIconRight={false}
                    inputClass="h-10 w-[150px] rounded-xl border-none outline-none pl-10 pr-1 text-[14px] text-[#0F172A] bg-transparent cursor-pointer"
                  />
                  <span className="text-[#94A3B8] select-none">-</span>
                  <TailiwindCustomDatePicker
                    value={checkOutDate}
                    onChange={setCheckOutDate}
                    placeholder="Check-out date"
                    buttonIconSrc={true}
                    overridesClass={true}
                    showCalendarIconRight={false}
                    inputClass="h-10 w-[150px] rounded-xl border-none pl-10 outline-none text-[14px] text-[#0F172A] bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            </Flex>
          </Flex>
          <Flex className="bottomHeaderFlex">
            <div className="w-full">
              <label className="block text-[12px] text-[#3D495C] mb-1">
                Travellers and rooms
              </label>
              <TravellersAndRoomDropdown
                maxTotal={100}
                schema={passengers as PassengerSchema}
              />
            </div>

            <Flex vertical style={{ width: "100%", maxWidth: 300 }}>
              <div>
                <CheckableDropdown
                  options={starRatingOptions}
                  value={selectedValues}
                  onChange={setSelectedValues}
                  placeholder="Select ratings"
                  label="Star Rating"
                />
              </div>
            </Flex>
          </Flex>
          <CustomButton className="searchFilterBtn">Search Hotels</CustomButton>
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
              <HotelsSearchFilter />
            </Drawer>
          </div>
        )}

        <div className="contentWrapFlex">
          {screens.lg && (
            <div className="flightDetailFilter">
              <HotelsSearchFilter />
            </div>
          )}
          <div className="flightDetailMainContent" style={{ width: "100%" }}>
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

            {hotelView === "listview" && <HotelSearchListView />}
            {hotelView === "gridview" && <HotelSearchGridView />}
            {hotelView === "mapview" && <HotelSearchMapView />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelSearchListing;
