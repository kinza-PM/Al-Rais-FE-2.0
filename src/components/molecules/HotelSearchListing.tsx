import React, {
  useEffect,
  useRef,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";

import "../../assets/css/travel.css";
import Info from "../../assets/svgs/info-black.svg";
import { Grid, Drawer, Button } from "antd";
import CustomButton from "../common/CustomButton";
import { useMasterListings } from "../../hooks/masterListings/useMasterListings";

import type { PassengerSchema } from "../../features/flights/types";
import SearchableDropdown from "../common/SearchableDropdown";
import HotelDestinationAirportDropdown from "../atoms/HotelDestinationAirportDropdown";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
import TravellersAndRoomDropdown from "../atoms/TravellersAndRoomDropdown";
import CheckableDropdown from "../common/CheckableDropdown";
import type { HotelViewType } from "../../features/hotels/types";
import HotelsSearchFilter from "../atoms/HotelsSearchFilter";
import { FilterOutlined } from "@ant-design/icons";
import HotelSearchListView from "./HotelSearchListView";
import HotelSearchGridView from "./HotelSearchGridView";
import HotelSearchMapView from "./HotelSearchMapView";
import TravelSearchPageHeader from "./TravelSearchPageHeader";
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
  createEmptyHotelListingFilters,
  // cloneHotelListingFilters,
  type HotelFilters,
  type SortOption,
} from "../../utils/hotelFilters";
import {
  convertDateToString as formatHotelBookingDate,
  convertPaxToRooms,
  getHotelBookingValidationError,
} from "../../utils/hotelBookingParams";
import { useHotelStore } from "../../store/UseHotelStore";
import {
  useAiprortOptions,
  useCountriesOptions,
} from "../../hooks/masterListings/listing";
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

  const hotelPageWrapRef = useRef<HTMLDivElement>(null);
  const hotelSearchFormStickyRef = useRef<HTMLDivElement>(null);

  /** Keeps sidebar `position: sticky` below the sticky search card (same idea as flight search). */
  useLayoutEffect(() => {
    const form = hotelSearchFormStickyRef.current;
    const wrap = hotelPageWrapRef.current;
    if (!form || !wrap) return;
    const syncHeight = () => {
      const h = Math.ceil(form.getBoundingClientRect().height);
      wrap.style.setProperty("--hotel-search-sticky-h", `${h}px`);
    };
    syncHeight();
    const ro = new ResizeObserver(syncHeight);
    ro.observe(form);
    return () => ro.disconnect();
  }, []);

  const {
    hotel,
    setHotel,
    hotelView,
    setHotelView,
    setHotelListingFilters,
    setHotelListingSortOption,
  } = useHotelStore();

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
      starRatings: [],
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
  const [hotelResultsSerial, setHotelResultsSerial] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  /** Location label for the results line — tied to the last successful API search, not draft form edits. */
  const [resultsSummaryLocation, setResultsSummaryLocation] = useState<{
    city: string;
    country: string;
  } | null>(null);

  // Filter and sort state
  const [filters, setFilters] = useState<HotelFilters>({
    hotelName: "",
    propertyTypes: [],
    ratings: [],
    propertyFacilities: [],
    roomFacilities: [],
    roomTypes: [],
    bedPreferences: [],
    meals: [],
    cancellationPolicy: [],
  });
  const [sortOption, setSortOption] = useState<SortOption>("");

  const { data: countriesOptions, isLoading: isCountriesLoading } =
    useCountriesOptions();

  const [airportSearchTerm, setAirportSearchTerm] = useState("");
  const qAirports = useAiprortOptions(true, airportSearchTerm);

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

  const handleChildrenAgesChange = useCallback((ages: Array<number | null>) => {
    setChildAges(ages);
  }, []);

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
        starRatings:
          hotel.starRatings && hotel.starRatings.length > 0
            ? hotel.starRatings
            : hotel.minStarRating && hotel.minStarRating > 0
              ? [hotel.minStarRating]
              : [],
        minStarRating:
          hotel.starRatings && hotel.starRatings.length > 0
            ? Math.min(...hotel.starRatings)
            : hotel.minStarRating && hotel.minStarRating > 0
              ? hotel.minStarRating
              : 0,
      },
    }));
    setPaxData(hotel.paxData);
    setChildAges(hotel.childAges);
    setValidationError(null);
    setApiError(null);
    setHotelSearchResults([]);
    setHasSearched(false);
    setResultsSummaryLocation(null);
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

    const emptyFilters = createEmptyHotelListingFilters();
    setFilters(emptyFilters);
    setSortOption("");
    setHotelListingFilters(emptyFilters);
    setHotelListingSortOption("");

    const locationForResults = {
      city: searchState.city?.trim() ?? "",
      country: searchState.country?.trim() ?? "",
    };

    // console.log(searchState);
    try {
      const response = await mutateAsync(searchState);
      setResultsSummaryLocation(locationForResults);
      // console.log("hotel search api response-----------", response);
      if (response?.data && Array.isArray(response.data)) {
        const searchKey = response?.commonData?.searchKey || "";
        const formattedHotels = response.data.map((hotel: any) => ({
          ...hotel,
          searchKey: searchKey,
        }));

        setHotelSearchResults(formattedHotels);
        setHotelResultsSerial((s) => s + 1);

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
          starRatings: searchState.filters?.starRatings ?? [],
        });
      } else {
        setHotelSearchResults([]);
        setHotelResultsSerial((s) => s + 1);
      }
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      // console.log("hotel search api error------------", err);
      setApiError(err);
      setHotelSearchResults([]);
      setHotelResultsSerial((s) => s + 1);
    }
  }, [
    searchState,
    validateForm,
    mutateAsync,
    paxData,
    childAges,
    setHotel,
    setHotelListingFilters,
    setHotelListingSortOption,
  ]);

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
      // const barStarRatings = searchState.filters?.starRatings ?? [];
      // const effectiveFilters = {
      //   ...filters,
      //   ratings: barStarRatings.length > 0 ? barStarRatings : filters.ratings,
      // };
      result = filterHotels(result, filters);
    }

    // Apply sorting
    if (hasSearched && result.length > 0) {
      result = sortHotels(result, sortOption);
    }

    return result;
  }, [
    hotelSearchResults,
    filters,
    sortOption,
    hasSearched,
    searchState.filters?.starRatings,
  ]);

  const hotelResultsSummaryLine = React.useMemo(() => {
    if (!hasSearched || isPending || apiError || validationError) return null;
    const src =
      resultsSummaryLocation &&
      (resultsSummaryLocation.city || resultsSummaryLocation.country)
        ? resultsSummaryLocation
        : {
            city: searchState.city?.trim() ?? "",
            country: searchState.country?.trim() ?? "",
          };
    const city = src.city?.trim() || "";
    const country = src.country?.trim() || "";
    /** Primary label before colon (e.g. "Karachi: 564 properties found"). */
    const locationLabel = city || country || "Results";
    const total = hotelSearchResults.length;
    const n = filteredAndSortedHotels.length;

    if (total === 0) {
      return `${locationLabel}: 0 properties found`;
    }
    if (n === total) {
      return `${locationLabel}: ${total} properties found`;
    }
    return `${locationLabel}: ${n} of ${total} properties found`;
  }, [
    hasSearched,
    isPending,
    apiError,
    validationError,
    searchState.city,
    searchState.country,
    resultsSummaryLocation?.city,
    resultsSummaryLocation?.country,
    hotelSearchResults.length,
    filteredAndSortedHotels.length,
  ]);

  return (
    <div className="">
      <Loader
        show={isPending || isCountriesLoading}
        label={
          isPending
            ? "Please wait while we are looking for available hotels"
            : "Please wait while we are fetching details"
        }
      />
      <div
        ref={hotelPageWrapRef}
        className="flightDetailTemplateWrap hotel-search-listing-page"
      >
        <div
          ref={hotelSearchFormStickyRef}
          className="bottomHeaderSetting hotelSearchFilterCard hotel-search-form-sticky"
        >
          <TravelSearchPageHeader showTripSelector={false} />
          {/* Grid (xl+): single row — View | Destination | Dates | Travellers | Nationality | Star | Search */}
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
              <HotelDestinationAirportDropdown
                airports={qAirports.data || []}
                isLoading={qAirports.isLoading}
                isFetching={qAirports.isFetching}
                onSearchAirports={setAirportSearchTerm}
                onLoadMore={() => {
                  if (qAirports.hasNextPage) qAirports.fetchNextPage();
                }}
                hasMore={!!qAirports.hasNextPage}
                loadingMore={!!qAirports.isFetchingNextPage}
                valueCountry={searchState.country}
                valueCity={searchState.city}
                onChange={({ country, city }) => {
                  setSearchState((prev) => ({
                    ...prev,
                    country,
                    city,
                  }));
                }}
                label="Destination"
                placeholder="Where are you traveling to?"
                widthClass="w-full"
                tooltip="Where are you traveling to?"
              />
            </div>

            <div className="hotel-filter-dates w-full min-w-0">
              <label className="hotel-field-label">Dates</label>

              <div className="hotel-date-range-row">
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
                  inputClass="hotel-date-range-input"
                  disablePastDates={true}
                  tooltip="Select check-in date"
                />

                <span className="hotel-date-separator">—</span>

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
                  inputClass="hotel-date-range-input"
                  disablePastDates={true}
                  minDate={
                    searchState.checkIn
                      ? new Date(searchState.checkIn)
                      : undefined
                  }
                  tooltip="Select check-out date"
                />
              </div>
            </div>

            <div className="hotel-filter-travellers w-full min-w-0">
              <label className="hotel-field-label hotel-field-label--with-icon">
                Travellers and rooms
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

            <div className="hotel-filter-star w-full min-w-0">
              <CheckableDropdown
                options={starRatingOptions}
                value={(searchState.filters.starRatings ?? []).map(String)}
                onChange={(values) => {
                  const list =
                    values == null
                      ? []
                      : Array.isArray(values)
                        ? values
                        : [values];
                  const nums = list
                    .map((v) => Number(v))
                    .filter((n) => !Number.isNaN(n) && n > 0);

                  handleSearchChange("filters", {
                    ...searchState.filters,
                    starRatings: nums,
                    minStarRating: nums.length > 0 ? Math.min(...nums) : 0,
                  });
                }}
                placeholder="Select rating"
                label="Star Rating"
                singleSelect={false}
                tooltip="Select one or more star ratings"
              />
            </div>

            <div className="hotel-filter-search">
              <CustomButton
                className="searchFilterBtn hotel-search-btn-responsive hotel-search-btn-figma"
                onClick={handleSearchHotels}
              >
                {isPending ? "Searching..." : "Search hotels"}
              </CustomButton>
            </div>
          </div>
          <div className="hotel-search-divider" />
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

        <div className="contentWrapFlex flex-col lg:flex-row">
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
          <div
            className="flightDetailMainContent min-w-0"
            style={{ width: "100%" }}
          >
            {hotelResultsSummaryLine ? (
              <p
                className="hotel-search-results-summary"
                role="status"
                aria-live="polite"
              >
                {hotelResultsSummaryLine}
              </p>
            ) : null}
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
                      listResetKey={hotelResultsSerial}
                    />
                  )}
                  {hotelView === "gridview" && (
                    <HotelSearchGridView
                      key="gridview"
                      hotels={filteredAndSortedHotels}
                      listResetKey={hotelResultsSerial}
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
