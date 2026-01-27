import React from "react";

import "../../assets/css/travel.css";
import FlagUae from "../../assets/svgs/Flag-uae.svg";
import FlagInd from "../../assets/svgs/Flag-ind.svg";
import FlagUsa from "../../assets/svgs/Flag-usa.svg";
import colSeparater from "../../assets/svgs/Lineseparater.svg";
import { Segmented, Tabs, Select, Flex, Grid, Drawer, Button } from "antd";
import CustomButton from "../common/CustomButton";

import type { TabsProps } from "antd";
import { useState, useCallback } from "react";
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
import type {
  HotelSearchRequest,
  RoomData,
} from "../../services/api/hotelSearch";
import { useHotelSearch } from "../../hooks/useHotelSearch";
import { extractErrorFromAxiosApiError } from "../../utils/apiErrorHanlder";
import Loader from "../atoms/Loader";
import {
  filterHotels,
  sortHotels,
  type HotelFilters,
  type SortOption,
} from "../../utils/hotelFilters";
// import {
//   getCitiesByCountry,
//   getNationalityOptions,
//   getUniqueCountries,
// } from "../../utils/dropdownHelper";

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
  const [open, setOpen] = useState(false);
  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const { passengers } = useMasterListings({
    include: ["passengers"],
  });
  const { mutateAsync, isPending } = useHotelSearch();

  const [searchState, setSearchState] = useState<HotelSearchRequest>({
    country: "",
    city: "",
    checkIn: "",
    checkOut: "",
    rooms: [
      {
        adult: 1,
        child: 0,
        childAge: [],
        roomIndex: 1,
      },
    ],
    travelerCountryOfResidence: "",
    travelerNationality: "",
    culture: "en",
    filters: {
      currency: "AED",
      minStarRating: 0,
    },
  });
  // Local state for TravellersAndRoomDropdown (Pax format)
  const [paxData, setPaxData] = useState<{
    adults?: number;
    kids?: number;
    children?: number;
    rooms?: number;
  }>({
    adults: 1,
    rooms: 1,
  });
  const [childAges, setChildAges] = useState<Array<number | null>>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [hotelSearchResults, setHotelSearchResults] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filter and sort state
  const [filters, setFilters] = useState<HotelFilters>({
    hotelName: "",
    propertyTypes: [],
    ratings: [],
    propertyFacilities: [],
    roomFacilities: [],
    bedPreferences: [],
    meals: [],
    cancellationPolicy: [],
  });
  const [sortOption, setSortOption] = useState<SortOption>("");

  // const countryOptions = useMemo(() => {
  //   return getUniqueCountries(countries);
  // }, [countries]);

  // const cityOptions = useMemo(() => {
  //   return getCitiesByCountry(countries, searchState.country);
  // }, [countries, searchState.country]);

  // const nationalityOptions = useMemo(() => {
  //   return getNationalityOptions(countries);
  // }, [countries]);

  const handleSearchChange = useCallback(
    (field: keyof HotelSearchRequest, value: any) => {
      setSearchState((prev) => ({
        ...prev,
        [field]: value,
      }));
      // Clear validation error when user starts filling fields
      // if (validationError) {
      //   setValidationError(null);
      // }
    },
    [validationError]
  );

  // Handle nested filter changes
  const handleFilterChange = useCallback(
    (field: keyof HotelSearchRequest["filters"], value: any) => {
      setSearchState((prev) => ({
        ...prev,
        filters: {
          ...prev.filters,
          [field]: value,
        },
      }));
    },
    []
  );

  const convertDateToString = useCallback((date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const convertPaxToRoom = useCallback(
    (
      pax: {
        adults?: number;
        kids?: number;
        children?: number;
        rooms?: number;
      },
      ages: Array<number | null>
    ): RoomData[] => {
      const numRooms = pax.rooms || 1;
      const totalAdults = pax.adults || 0;
      const totalChildren = pax.kids || pax.children || 0;

      const childAgeArray: number[] = ages
        .filter((age): age is number => age !== null)
        .slice(0, totalChildren);

      const rooms: RoomData[] = [];

      const baseAdultsPerRoom = Math.floor(totalAdults / numRooms);
      const extraAdults = totalAdults % numRooms;

      const baseChildrenPerRoom = Math.floor(totalChildren / numRooms);
      const extraChildren = totalChildren % numRooms;

      let childAgeIndex = 0;

      for (let i = 0; i < numRooms; i++) {
        const adultsInRoom = Math.min(
          baseAdultsPerRoom + (i < extraAdults ? 1 : 0),
          2 // Max 2 per room
        );

        // Distribute children: base + 1 extra for first few rooms
        const childrenInRoom = Math.min(
          baseChildrenPerRoom + (i < extraChildren ? 1 : 0),
          2 // Max 2 per room
        );

        const childAgesForRoom: number[] = [];
        for (let j = 0; j < childrenInRoom; j++) {
          if (childAgeIndex < childAgeArray.length) {
            childAgesForRoom.push(childAgeArray[childAgeIndex]);
            childAgeIndex++;
          }
        }

        rooms.push({
          adult: adultsInRoom,
          child: childrenInRoom,
          childAge: childAgesForRoom,
          roomIndex: i + 1,
        });
      }

      return rooms;
    },
    []
  );

  // Handle TravellersAndRoomDropdown onChange
  const handlePaxChange = useCallback(
    (pax: {
      adults?: number;
      kids?: number;
      children?: number;
      rooms?: number;
    }) => {
      setPaxData(pax);
      const room = convertPaxToRoom(pax, childAges);
      handleSearchChange("rooms", room);
    },
    [childAges, convertPaxToRoom, handleSearchChange]
  );

  const handleChildrenAgesChange = useCallback(
    (ages: Array<number | null>) => {
      setChildAges(ages);
      const room = convertPaxToRoom(paxData, ages);
      handleSearchChange("rooms", room);
    },
    [paxData, convertPaxToRoom, handleSearchChange]
  );

  const validateForm = useCallback((): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!searchState.country || searchState.country.trim() === "") {
      setValidationError("Country is required");
      return false;
    }

    if (!searchState.city || searchState.city.trim() === "") {
      setValidationError("City is required");
      return false;
    }

    if (!searchState.checkIn || searchState.checkIn.trim() === "") {
      setValidationError("Check-in date is required");
      return false;
    }

    if (!searchState.checkOut || searchState.checkOut.trim() === "") {
      setValidationError("Check-out date is required");
      return false;
    }

    const checkInDate = new Date(searchState.checkIn);
    checkInDate.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      setValidationError("Check-in date cannot be in the past");
      return false;
    }

    const checkOutDate = new Date(searchState.checkOut);
    checkOutDate.setHours(0, 0, 0, 0);
    if (checkOutDate < today) {
      setValidationError("Check-out date cannot be in the past");
      return false;
    }

    if (checkOutDate <= checkInDate) {
      setValidationError("Check-out date must be after check-in date");
      return false;
    }

    if (
      !searchState.travelerCountryOfResidence ||
      searchState.travelerCountryOfResidence.trim() === ""
    ) {
      setValidationError("Nationality is required");
      return false;
    }

    const numRooms = paxData.rooms || 1;
    const totalAdults = paxData.adults || 0;
    const totalChildren = paxData.kids || paxData.children || 0;

    // Check if adults exceed room capacity (2 per room)
    const maxAdultsAllowed = numRooms * 2;
    if (totalAdults > maxAdultsAllowed) {
      setValidationError(
        `Maximum ${maxAdultsAllowed} adults allowed for ${numRooms} room${
          numRooms > 1 ? "s" : ""
        } (2 per room)`
      );
      return false;
    }

    // Check if children exceed room capacity (2 per room)
    const maxChildrenAllowed = numRooms * 2;
    if (totalChildren > maxChildrenAllowed) {
      setValidationError(
        `Maximum ${maxChildrenAllowed} children allowed for ${numRooms} room${
          numRooms > 1 ? "s" : ""
        } (2 per room)`
      );
      return false;
    }

    // Validate child ages - all children must have ages specified
    if (totalChildren > 0) {
      const validChildAges = childAges.filter(
        (age): age is number => age !== null
      );
      if (validChildAges.length !== totalChildren) {
        setValidationError(`Please specify ages for all children`);
        return false;
      }
    }

    setValidationError(null);
    return true;
  }, [searchState]);

  // Handle search button click
  const handleSearchHotels = useCallback(async () => {
    setHasSearched(true);
    setApiError(null);
    setHotelSearchResults([]);

    if (!validateForm()) {
      return;
    }

    setValidationError(null);
    // console.log(searchState);
    try {
      const response = await mutateAsync(searchState);
      // console.log("hotel search api response-----------", response);
      if (response?.data && Array.isArray(response.data)) {
        const searchKey = response?.commonData?.searchKey || "";
        const formattedHotels = response.data.map((hotel: any) => ({
          ...hotel,
          searchKey: searchKey,
        }));

        setHotelSearchResults(formattedHotels);
      } else {
        setHotelSearchResults([]);
      }
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      // console.log("hotel search api error------------", err);
      setApiError(err);
      setHotelSearchResults([]);
    }
  }, [searchState, validateForm, mutateAsync]);

  // Apply filters and sorting to results
  const filteredAndSortedHotels = React.useMemo(() => {
    let result = [...hotelSearchResults];

    // Apply filters
    if (hasSearched && result.length > 0) {
      result = filterHotels(result, filters);
    }

    // Apply sorting
    if (hasSearched && result.length > 0) {
      result = sortHotels(result, sortOption);
    }

    return result;
  }, [hotelSearchResults, filters, sortOption, hasSearched]);

  return (
    <div className="">
      <Loader
        show={isPending}
        label="Please wait while we are looking for available hotels"
      />
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
            <Flex vertical style={{ width: "100%", maxWidth: 450 }}>
              <div>
                <SearchableDropdown
                  // options={countryOptions}
                  options={[{ id: "1", value: "France", label: "France" }]}
                  value={searchState.country}
                  // onChange={(value) => {
                  //   handleSearchChange("country", value);
                  //   handleSearchChange("city", "");
                  // }}
                  onChange={(value) => handleSearchChange("country", value)}
                  placeholder="Where are you traveling to?"
                  label="Country"
                  widthClass="w-full"
                  searchPlaceholder="Search"
                />
              </div>
            </Flex>
            <Flex vertical style={{ width: "100%", maxWidth: 450 }}>
              <div>
                <SearchableDropdown
                  // options={cityOptions}
                  options={[{ id: "1", value: "Paris", label: "Paris" }]}
                  value={searchState.city}
                  onChange={(value) => handleSearchChange("city", value)}
                  placeholder="Where are you traveling to?"
                  label="City"
                  widthClass="w-full"
                  searchPlaceholder="Search"
                />
              </div>
            </Flex>
            <Flex vertical style={{ width: "100%", maxWidth: 430 }}>
              <div>
                <label className="block text-[12px] text-[#3D495C] mb-1">
                  Dates
                </label>
                <div className="h-11 w-full rounded-xl border border-[#DFE7F3] px-3 flex items-center">
                  <TailiwindCustomDatePicker
                    value={
                      searchState.checkIn ? new Date(searchState.checkIn) : null
                    }
                    onChange={(date) => {
                      const dateStr = convertDateToString(date);
                      handleSearchChange("checkIn", dateStr);
                    }}
                    placeholder="Check-in date"
                    buttonIconSrc={true}
                    overridesClass={true}
                    showCalendarIconRight={false}
                    inputClass="h-10 w-[165px] rounded-xl border-none outline-none pl-10 pr-1 text-[14px] text-[#0F172A] bg-transparent cursor-pointer"
                  />
                  <span className="text-[#94A3B8] select-none">-</span>
                  <TailiwindCustomDatePicker
                    value={
                      searchState.checkOut
                        ? new Date(searchState.checkOut)
                        : null
                    }
                    onChange={(date) => {
                      const dateStr = convertDateToString(date);
                      handleSearchChange("checkOut", dateStr);
                    }}
                    placeholder="Check-out date"
                    buttonIconSrc={true}
                    overridesClass={true}
                    showCalendarIconRight={false}
                    inputClass="h-10 w-[165px] rounded-xl border-none pl-10 outline-none text-[14px] text-[#0F172A] bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            </Flex>
            <Flex vertical style={{ width: "100%", maxWidth: 380 }}>
              <div>
                <SearchableDropdown
                  // options={nationalityOptions}
                  options={[{ id: "1", value: "INDIA,IN", label: "INDIA" }]}
                  value={searchState.travelerNationality}
                  onChange={(value) => {
                    handleSearchChange("travelerNationality", value);
                    handleSearchChange("travelerCountryOfResidence", value);
                  }}
                  placeholder="Country of Residence?"
                  label="Nationality"
                  widthClass="w-full"
                  searchPlaceholder="Search"
                />
              </div>
            </Flex>
            <div className="w-full">
              <label className="block text-[12px] text-[#3D495C] mb-1">
                Travellers and rooms
              </label>
              <TravellersAndRoomDropdown
                maxTotal={100}
                schema={passengers as PassengerSchema}
                value={paxData}
                onChange={handlePaxChange}
                onChildrenAgesChange={handleChildrenAgesChange}
              />
            </div>
            <Flex vertical style={{ width: "100%", maxWidth: 350 }}>
              <div>
                <CheckableDropdown
                  options={starRatingOptions}
                  value={
                    searchState.filters.minStarRating === 0
                      ? ""
                      : String(searchState.filters.minStarRating)
                  }
                  onChange={(value) => {
                    const rating = value === "" ? 0 : Number(value);
                    handleFilterChange("minStarRating", rating);
                  }}
                  placeholder="Select rating"
                  label="Star Rating"
                  singleSelect={true}
                />
              </div>
            </Flex>
            <CustomButton
              className="searchFilterBtn"
              onClick={handleSearchHotels}
            >
              {isPending ? "Searching..." : "Search Hotels"}
            </CustomButton>
          </Flex>
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
              <HotelsSearchFilter
                filters={filters}
                onFiltersChange={setFilters}
                sortOption={sortOption}
                onSortChange={setSortOption}
                hotels={hotelSearchResults}
              />
            </Drawer>
          </div>
        )}

        <div className="contentWrapFlex">
          {screens.lg && (
            <div className="flightDetailFilter">
              <HotelsSearchFilter
                filters={filters}
                onFiltersChange={setFilters}
                sortOption={sortOption}
                onSortChange={setSortOption}
                hotels={hotelSearchResults}
              />
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
            {hasSearched ? (
              apiError ? (
                <div className="py-16 flex flex-col items-center text-center">
                  <p className="mt-2 text-[14px] text-[#0F172A]">
                    {apiError.charAt(0).toUpperCase() + apiError.slice(1)}
                  </p>
                  <p className="mt-2 text-[14px] text-[#3D495C]">
                    Please try again.
                  </p>
                </div>
              ) : validationError ? (
                <div className="py-16 flex flex-col items-center text-center">
                  <p className="mt-2 text-[14px] text-[#0F172A]">
                    {validationError.charAt(0).toUpperCase() +
                      validationError.slice(1)}
                  </p>
                  <p className="mt-2 text-[14px] text-[#3D495C]">
                    Please try again.
                  </p>
                </div>
              ) : !isPending && hotelSearchResults.length === 0 ? (
                <div className="py-16 flex flex-col items-center text-center">
                  <p className="mt-2 text-[14px] text-[#0F172A]">
                    No hotel found for your route and specifications.
                  </p>
                  <p className="mt-2 text-[14px] text-[#3D495C]">
                    Try searching again.
                  </p>
                </div>
              ) : !isPending && hotelSearchResults.length > 0 ? (
                <>
                  {hotelView === "listview" && (
                    <HotelSearchListView
                      key="listview"
                      hotels={filteredAndSortedHotels}
                    />
                  )}
                  {hotelView === "gridview" && (
                    <HotelSearchGridView
                      key="gridview"
                      hotels={filteredAndSortedHotels}
                    />
                  )}
                  {hotelView === "mapview" && (
                    <HotelSearchMapView
                      key="mapview"
                      hotels={filteredAndSortedHotels}
                    />
                  )}
                </>
              ) : null
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelSearchListing;
