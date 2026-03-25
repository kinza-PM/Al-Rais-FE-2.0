import React, { useMemo, useEffect, useRef } from "react";

import "../../assets/css/travel.css";
import Info from "../../assets/svgs/info-black.svg";
import { Grid, Drawer, Button } from "antd";
import CustomButton from "../common/CustomButton";

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
import {
  convertDateToString as formatHotelBookingDate,
  convertPaxToRooms,
  getHotelBookingValidationError,
} from "../../utils/hotelBookingParams";
import { useHotelStore } from "../../store/UseHotelStore";
import { useCountriesOptions } from "../../hooks/masterListings/listing";
import { useCitiesOptions } from "../../hooks/masterListings/useQueryListing";
// import {
//   getCitiesByCountry,
//   getNationalityOptions,
//   getUniqueCountries,
// } from "../../utils/dropdownHelper";

// const items: TabsProps["items"] = [
//   { key: "1", label: "Flights", children: "" },
//   { key: "2", label: "Hotels", children: "" },
// ];

const starRatingOptions = [
  { id: "0", value: "", label: "Clear rating", hideSelectionIcon: true },
  { id: "1", value: "1", label: "1 star" },
  { id: "2", value: "2", label: "2 stars" },
  { id: "3", value: "3", label: "3 stars" },
  { id: "4", value: "4", label: "4 stars" },
  { id: "5", value: "5", label: "5 stars" },
  { id: "6", value: "6", label: "6 stars" },
  { id: "7", value: "7", label: "7 stars" },
];

const hotelViewTypes = [
  { label: "List view", value: "listview" },
  { label: "Grid view", value: "gridview" },
  { label: "Map view", value: "mapview" },
];

const HotelSearchListing: React.FC = () => {
  const [open, setOpen] = useState(false);
  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const { hotel, setHotel, hotelView, setHotelView } = useHotelStore();

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

  const { data: countriesOptions, isLoading: isCountriesLoading } =
    useCountriesOptions();

  const selectedCountry = useMemo(
    () => countriesOptions?.find((c) => c.label === searchState.country),
    [countriesOptions, searchState.country],
  );

  const { data: citiesData, isLoading: isCitiesLoading } = useCitiesOptions(
    selectedCountry?.label || "",
    !!selectedCountry?.label,
  );

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
    [],
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
    [],
  );

  const convertDateToString = useCallback(
    (date: Date | null): string => formatHotelBookingDate(date),
    [],
  );

  const convertPaxToRoom = useCallback(
    (
      pax: {
        adults?: number;
        kids?: number;
        children?: number;
        rooms?: number;
      },
      ages: Array<number | null>,
    ): RoomData[] => convertPaxToRooms(pax, ages),
    [],
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
    },
    [],
  );

  const handleChildrenAgesChange = useCallback(
    (ages: Array<number | null>) => {
      setChildAges(ages);
    },
    [],
  );

  useEffect(() => {
    const nextRooms = convertPaxToRoom(paxData, childAges);

    setSearchState((prev) => {
      const currentRooms = JSON.stringify(prev.rooms ?? []);
      const upcomingRooms = JSON.stringify(nextRooms);

      if (currentRooms === upcomingRooms) {
        return prev;
      }

      return {
        ...prev,
        rooms: nextRooms,
      };
    });
  }, [paxData, childAges, convertPaxToRoom]);

  // Hydrate from store when coming from HotelHeroSectionTab or when returning from hotel detail (back button)
  // Store is preserved on navigate to detail so back button restores search context
  const hydratedHotelSnapshotRef = useRef<string | null>(null);
  const shouldAutoSearchRef = useRef(false);

  useEffect(() => {
    if (!hotel) return;

    const snapshot = JSON.stringify({
      country: hotel.country,
      city: hotel.city,
      checkIn: hotel.checkIn,
      checkOut: hotel.checkOut,
    });

    if (hydratedHotelSnapshotRef.current === snapshot) return;

    hydratedHotelSnapshotRef.current = snapshot;

    setSearchState((prev) => ({
      ...prev,
      country: hotel.country,
      city: hotel.city,
      checkIn: hotel.checkIn,
      checkOut: hotel.checkOut,
      travelerCountryOfResidence: hotel.travelerCountryOfResidence,
      travelerNationality: hotel.travelerNationality,
      rooms: convertPaxToRoom(hotel.paxData, hotel.childAges),
      filters: {
        ...prev.filters,
        minStarRating: hotel.minStarRating ?? 0,
      },
    }));
    setPaxData(hotel.paxData);
    setChildAges(hotel.childAges);
    setValidationError(null);
    setApiError(null);
    setHotelSearchResults([]);
    setHasSearched(false);
    shouldAutoSearchRef.current = true;
  }, [hotel, convertPaxToRoom]);

  const validateForm = useCallback((): boolean => {
    const validationMessage = getHotelBookingValidationError({
      country: searchState.country,
      city: searchState.city,
      checkIn: searchState.checkIn,
      checkOut: searchState.checkOut,
      travelerCountryOfResidence: searchState.travelerCountryOfResidence,
      paxData,
      childAges,
      requireSearchContext: true,
    });

    if (validationMessage) {
      setValidationError(validationMessage);
      return false;
    }

    setValidationError(null);
    return true;
  }, [searchState, paxData, childAges]);

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

        // Sync store with current search params so ListView passes correct pax when navigating
        setHotel({
          country: searchState.country,
          city: searchState.city,
          checkIn: searchState.checkIn,
          checkOut: searchState.checkOut,
          travelerCountryOfResidence: searchState.travelerCountryOfResidence,
          travelerNationality: searchState.travelerNationality,
          paxData,
          childAges,
          minStarRating: searchState.filters?.minStarRating ?? 0,
        });
      } else {
        setHotelSearchResults([]);
      }
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      // console.log("hotel search api error------------", err);
      setApiError(err);
      setHotelSearchResults([]);
    }
  }, [searchState, validateForm, mutateAsync, paxData, childAges, setHotel]);

  // Auto-trigger search when form is pre-filled from store (first visit from hero)
  useEffect(() => {
    if (!shouldAutoSearchRef.current) return;
    if (isPending) return;
    if (
      !searchState.country?.trim() ||
      !searchState.city?.trim() ||
      !searchState.checkIn?.trim() ||
      !searchState.checkOut?.trim() ||
      !searchState.travelerCountryOfResidence?.trim()
    ) {
      return;
    }

    shouldAutoSearchRef.current = false;
    handleSearchHotels();
  }, [
    searchState.country,
    searchState.city,
    searchState.checkIn,
    searchState.checkOut,
    searchState.travelerCountryOfResidence,
    isPending,
    handleSearchHotels,
  ]);

  // Apply filters and sorting to results
  const filteredAndSortedHotels = React.useMemo(() => {
    let result = [...hotelSearchResults];

    // Apply filters (merge star rating from search bar into filters)
    if (hasSearched && result.length > 0) {
      const minStarRating = searchState.filters?.minStarRating ?? 0;
      const effectiveFilters = {
        ...filters,
        ratings:
          minStarRating > 0 ? [minStarRating] : filters.ratings,
      };
      result = filterHotels(result, effectiveFilters);
    }

    // Apply sorting
    if (hasSearched && result.length > 0) {
      result = sortHotels(result, sortOption);
    }

    return result;
  }, [hotelSearchResults, filters, sortOption, hasSearched, searchState.filters?.minStarRating]);

  return (
    <div className="">
      <Loader
        show={isPending || isCountriesLoading || isCitiesLoading}
        label={`${isPending
          ? "Please wait while we are looking for available hotels"
          : isCitiesLoading
            ? "Loading cities..."
            : "Please wait while we are fetching details"
          }`}
      />
      <div className="topHeaderSetting"></div>

      <div className="flightDetailTemplateWrap">
        <div className="bottomHeaderSetting hotelSearchFilterCard">
          {/* Grid: Row 1 (View, Country, City, Dates) | Row 2 (Nationality, Travellers, Star Rating, Search) - widths aligned */}
          <div className="hotel-filter-grid">
            <div className="hotel-filter-view w-full min-w-0">
              <SearchableDropdown
                options={hotelViewTypes.map((t) => ({
                  id: t.value,
                  value: t.value,
                  label: t.label,
                }))}
                value={hotelView}
                onChange={(v) => setHotelView(v as HotelViewType)}
                label="View"
                widthClass="w-full"
                searchPlaceholder="Search"
              />
            </div>
            <div className="hotel-filter-country w-full min-w-0">
              <SearchableDropdown
                options={
                  countriesOptions?.map((c) => ({
                    id: c.iso2,
                    value: c.label,
                    label: c.label,
                  })) || []
                }
                value={searchState.country}
                onChange={(value) => {
                  handleSearchChange("country", value);
                  handleSearchChange("city", "");
                }}
                placeholder="Where are you traveling to?"
                label="Country"
                widthClass="w-full"
                searchPlaceholder="Search"
                tooltip="Where are you traveling to?"
              />
            </div>
            <div className="hotel-filter-city w-full min-w-0">
              <SearchableDropdown
                options={
                  citiesData?.map((c, index) => ({
                    id: `${index}-${c.value}`,
                    value: c.value,
                    label: c.label,
                  })) || []
                }
                value={searchState.city}
                onChange={(value) => handleSearchChange("city", value)}
                placeholder="Where are you traveling to?"
                label="City"
                widthClass="w-full"
                searchPlaceholder="Search"
                tooltip="Where are you traveling to?"
              />
            </div>
            <div className="hotel-filter-dates w-full min-w-0">
              <label className="block text-[12px] text-[#3D495C] mb-1">
                Dates
              </label>
              <div
                className="h-[50px] w-full min-w-0 rounded-[16px] border border-[#C2CAD6] px-2 flex items-center"
                style={{ background: "var(--white-200, #FFFFFF)" }}
              >
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
                  inputClass="h-[50px] flex-1 min-w-0 rounded-[16px] border-none outline-none pl-10 pr-1 text-[12px] sm:text-[14px] text-[#0F172A] bg-transparent cursor-pointer w-full"
                  disablePastDates={true}
                  tooltip="Select check-in date"
                />
                <span className="text-[#94A3B8] select-none px-1 flex-shrink-0">
                  —
                </span>
                <TailiwindCustomDatePicker
                  value={
                    searchState.checkOut ? new Date(searchState.checkOut) : null
                  }
                  onChange={(date) => {
                    const dateStr = convertDateToString(date);
                    handleSearchChange("checkOut", dateStr);
                  }}
                  placeholder="Check-out date"
                  buttonIconSrc={true}
                  overridesClass={true}
                  showCalendarIconRight={false}
                  inputClass="h-[50px] flex-1 min-w-0 rounded-[16px] border-none pl-10 pr-2 outline-none text-[12px] sm:text-[14px] text-[#0F172A] bg-transparent cursor-pointer w-full"
                  disablePastDates={true}
                  minDate={new Date(searchState.checkIn)}
                  tooltip="Select check-out date"
                />
              </div>
            </div>

            <div className="hotel-filter-nationality w-full min-w-0">
              <SearchableDropdown
                options={
                  countriesOptions?.map((c) => ({
                    id: c.iso2,
                    value: `${c.label},${c.iso2}`,
                    label: c.label,
                  })) || []
                }
                value={searchState.travelerNationality}
                onChange={(value) => {
                  handleSearchChange("travelerNationality", value);
                  handleSearchChange("travelerCountryOfResidence", value);
                }}
                placeholder="Country of Residence?"
                label="Nationality"
                widthClass="w-full"
                searchPlaceholder="Search"
                tooltip="Select your country of residence"
              />
            </div>
            <div className="hotel-filter-travellers w-full min-w-0">
              <label className="block text-[12px] text-[#3D495C] mb-1 flex items-center gap-2">
                Travellers and rooms{" "}
                <span className="relative inline-flex group/info">
                  <img
                    src={Info}
                    alt="info"
                    className="w-4 h-4 inline-block align-middle flex-shrink-0"
                  />
                  <span
                    className="pointer-events-none absolute bottom-full left-full -translate-x-1/3 mb-2 hidden group-hover/info:block z-50 px-3 py-2 text-xs leading-5 text-white bg-[#1E293B] rounded-lg shadow-lg whitespace-nowrap text-center before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-6 before:border-transparent before:border-t-[#1E293B]"
                    role="tooltip"
                  >
                    Minimum 1 adult required per room <br />
                    Maximum 2 adults allowed per room <br />
                    Maximum 2 children allowed per room <br />
                    Child age must be within 2 and 12 years
                  </span>
                </span>
              </label>
              <TravellersAndRoomDropdown
                maxTotal={100}
                schema={passengers as PassengerSchema}
                value={paxData}
                onChange={handlePaxChange}
                initialChildAges={childAges}
                onChildrenAgesChange={handleChildrenAgesChange}
                tooltip="Select passengers and rooms"
              />
            </div>
            <div className="hotel-filter-star w-full min-w-0">
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
                tooltip="Select star rating"
              />
            </div>
            <div className="hotel-filter-search">
              <CustomButton
                className="searchFilterBtn hotel-search-btn-responsive"
                onClick={handleSearchHotels}
              >
                {isPending ? "Searching..." : "Search Hotels"}
              </CustomButton>
            </div>
          </div>
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

        <div
          className="contentWrapFlex flex-col lg:flex-row"
          style={{ marginLeft: screens.lg ? "30px" : "0px" }}
        >
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
          <div className="flightDetailMainContent min-w-0" style={{ width: "100%" }}>
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
