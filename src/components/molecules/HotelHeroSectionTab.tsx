import React, {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { useMasterListings } from "../../hooks/masterListings/useMasterListings";
import { useCountriesOptions } from "../../hooks/masterListings/listing";
import { useCitiesOptions } from "../../hooks/masterListings/useQueryListing";
import SearchableDropdown from "../common/SearchableDropdown";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
import TravellersAndRoomDropdown from "../atoms/TravellersAndRoomDropdown";
import CheckableDropdown from "../common/CheckableDropdown";
import type { PassengerSchema } from "../../features/flights/types";
import { useHotelStore } from "../../store/UseHotelStore";
import Info from "../../assets/svgs/info-black.svg";
import Loader from "../atoms/Loader";
import { parseLocalDateString } from "../../utils/helpers";

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

const convertDateToString = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const HotelHeroSectionTab: React.FC = () => {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [nationality, setNationality] = useState("");
  const [paxData, setPaxData] = useState<{
    adults?: number;
    kids?: number;
    children?: number;
    rooms?: number;
  }>({ adults: 1, rooms: 1 });
  const [childAges, setChildAges] = useState<Array<number | null>>([]);
  const [starRatings, setStarRatings] = useState<string[]>([]);

  const [validationErrors, setValidationErrors] = useState({
    country: "",
    city: "",
    checkIn: "",
    checkOut: "",
    nationality: "",
    travellers: "",
  });
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);

  const { passengers } = useMasterListings({
    include: ["passengers"],
  });
  const navigate = useNavigate();
  const { hotel, setHotel } = useHotelStore();
  const lastHotelSnapshotRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (!hotel) return;
    const snap = JSON.stringify({
      country: hotel.country,
      city: hotel.city,
      checkIn: hotel.checkIn,
      checkOut: hotel.checkOut,
      nat: hotel.travelerNationality,
      pax: hotel.paxData,
      ages: hotel.childAges,
      stars: hotel.starRatings,
      minStar: hotel.minStarRating,
    });
    if (lastHotelSnapshotRef.current === snap) return;
    lastHotelSnapshotRef.current = snap;

    setCountry(hotel.country || "");
    setCity(hotel.city || "");
    setCheckInDate(parseLocalDateString(hotel.checkIn));
    setCheckOutDate(parseLocalDateString(hotel.checkOut));
    setNationality(hotel.travelerNationality || hotel.travelerCountryOfResidence || "");
    setPaxData(
      hotel.paxData && Object.keys(hotel.paxData).length
        ? { ...hotel.paxData }
        : { adults: 1, rooms: 1 },
    );
    setChildAges(
      Array.isArray(hotel.childAges) ? [...hotel.childAges] : [],
    );
    setStarRatings(
      hotel.starRatings?.length
        ? hotel.starRatings.map(String)
        : [],
    );
    setHasAttemptedValidation(false);
    setValidationErrors({
      country: "",
      city: "",
      checkIn: "",
      checkOut: "",
      nationality: "",
      travellers: "",
    });
  }, [hotel]);

  const { data: countriesOptions } = useCountriesOptions();
  const selectedCountry = useMemo(
    () => countriesOptions?.find((c) => c.label === country),
    [countriesOptions, country],
  );
  const {
    data: citiesData,
    isLoading: isCitiesLoading,
    isFetching: isCitiesFetching,
  } = useCitiesOptions(selectedCountry?.label || "", !!selectedCountry?.label);
  const isCityOptionsLoading = isCitiesLoading || isCitiesFetching;

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

  const validateForm = useCallback((): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const errors = {
      country: "",
      city: "",
      checkIn: "",
      checkOut: "",
      nationality: "",
      travellers: "",
    };
    let isValid = true;

    if (!country?.trim()) {
      errors.country = "Country is required";
      isValid = false;
    }
    if (!city?.trim()) {
      errors.city = "City is required";
      isValid = false;
    }
    if (!checkInDate) {
      errors.checkIn = "Check-in date is required";
      isValid = false;
    } else {
      const checkIn = new Date(checkInDate);
      checkIn.setHours(0, 0, 0, 0);
      if (checkIn < today) {
        errors.checkIn = "Check-in date cannot be in the past";
        isValid = false;
      }
    }
    if (!checkOutDate) {
      errors.checkOut = "Check-out date is required";
      isValid = false;
    } else {
      const checkOut = new Date(checkOutDate);
      checkOut.setHours(0, 0, 0, 0);
      if (checkOut < today) {
        errors.checkOut = "Check-out date cannot be in the past";
        isValid = false;
      }
      if (checkInDate && checkOut <= new Date(checkInDate)) {
        errors.checkOut = "Check-out date must be after check-in date";
        isValid = false;
      }
    }
    if (!nationality?.trim()) {
      errors.nationality = "Nationality is required";
      isValid = false;
    }

    const numRooms = paxData.rooms || 1;
    const totalAdults = paxData.adults || 0;
    const totalChildren = paxData.kids || paxData.children || 0;
    const maxAdultsAllowed = numRooms * 2;
    const maxChildrenAllowed = numRooms * 2;

    if (totalAdults < numRooms) {
      errors.travellers = `Minimum ${numRooms} adult${numRooms > 1 ? "s" : ""} required for ${numRooms} room${numRooms > 1 ? "s" : ""} (1 per room)`;
      isValid = false;
    } else if (totalAdults > maxAdultsAllowed) {
      errors.travellers = `Maximum ${maxAdultsAllowed} adults allowed for ${numRooms} room${numRooms > 1 ? "s" : ""} (2 per room)`;
      isValid = false;
    } else if (totalChildren > maxChildrenAllowed) {
      errors.travellers = `Maximum ${maxChildrenAllowed} children allowed for ${numRooms} room${numRooms > 1 ? "s" : ""} (2 per room)`;
      isValid = false;
    } else if (totalChildren > 0) {
      const validChildAges = childAges.filter(
        (age): age is number => age !== null,
      );
      if (validChildAges.length !== totalChildren) {
        errors.travellers = "Please specify ages for all children";
        isValid = false;
      }
    }

    setValidationErrors(errors);
    return isValid;
  }, [
    country,
    city,
    checkInDate,
    checkOutDate,
    nationality,
    paxData,
    childAges,
  ]);

  // Clear errors when user fills fields
  useEffect(() => {
    if (!hasAttemptedValidation) return;

    setValidationErrors((prev) => {
      const updated = { ...prev };
      if (country?.trim() && prev.country) updated.country = "";
      if (city?.trim() && prev.city) updated.city = "";
      if (checkInDate && prev.checkIn) updated.checkIn = "";
      if (checkOutDate && prev.checkOut) updated.checkOut = "";
      if (nationality?.trim() && prev.nationality) updated.nationality = "";
      const numRooms = paxData.rooms || 1;
      const totalAdults = paxData.adults || 0;
      const totalChildren = paxData.kids || paxData.children || 0;
      const validChildAges = childAges.filter(
        (age): age is number => age !== null,
      );
      const maxAdults = numRooms * 2;
      const maxChildren = numRooms * 2;
      const paxValid =
        totalAdults >= numRooms &&
        totalAdults <= maxAdults &&
        totalChildren <= maxChildren &&
        (totalChildren === 0 || validChildAges.length === totalChildren);
      if (paxValid && prev.travellers) updated.travellers = "";
      return updated;
    });
  }, [
    hasAttemptedValidation,
    country,
    city,
    checkInDate,
    checkOutDate,
    nationality,
    paxData,
    childAges,
  ]);

  const handleSearch = useCallback(() => {
    setHasAttemptedValidation(true);
    if (!validateForm()) return;

    const checkInStr = convertDateToString(checkInDate);
    const checkOutStr = convertDateToString(checkOutDate);

    // travelerCountryOfResidence and travelerNationality use same value (country,code format from dropdown)
    const resolvedStarRatings = (() => {
      const nums = starRatings
        .map(Number)
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= 7);
      return [...new Set(nums)].sort((a, b) => a - b);
    })();

    setHotel({
      country,
      city,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      travelerCountryOfResidence: nationality,
      travelerNationality: nationality,
      paxData,
      childAges,
      starRatings: resolvedStarRatings,
      minStarRating: resolvedStarRatings.length
        ? Math.min(...resolvedStarRatings)
        : 0,
    });

    navigate("/search-hotel");
  }, [
    country,
    city,
    checkInDate,
    checkOutDate,
    nationality,
    paxData,
    childAges,
    starRatings,
    validateForm,
    setHotel,
    navigate,
  ]);

  const countryError = hasAttemptedValidation ? validationErrors.country : "";
  const cityError = hasAttemptedValidation ? validationErrors.city : "";
  const checkInError = hasAttemptedValidation ? validationErrors.checkIn : "";
  const checkOutError = hasAttemptedValidation ? validationErrors.checkOut : "";
  const nationalityError = hasAttemptedValidation
    ? validationErrors.nationality
    : "";
  const travellersError = hasAttemptedValidation
    ? validationErrors.travellers
    : "";

  const datesContainerError = checkInError || checkOutError;

  const hasErrorRow1 = Boolean(countryError || cityError || datesContainerError);
  const hasErrorRow2 = Boolean(
    nationalityError || travellersError || validationErrors.travellers,
  );

  const labelBaseClass = "block text-[12px] text-[#3D495C]";

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-5 pb-5">
      <Loader show={isCityOptionsLoading} label="Loading cities..." />
      <div className="hotelSearchFilterCard">
        <div className={`hotel-filter-grid-hero ${hasErrorRow1 || hasErrorRow2 ? "pb-4" : ""}`}>
          <div className="hero-country w-full min-w-0">
            <label className={labelBaseClass}>Country</label>
            <SearchableDropdown
              options={
                countriesOptions?.map((c) => ({
                  id: c.iso2,
                  value: c.label,
                  label: c.label,
                })) || []
              }
              value={country}
              onChange={(value) => {
                setCountry(value);
                setCity("");
              }}
              placeholder="Where are you traveling to?"
              label={undefined}
              widthClass="w-full"
              searchPlaceholder="Search"
              tooltip="Select country where you want to stay"
              error={countryError || null}
            />
          </div>

          <div className="hero-city w-full min-w-0">
            <label className={labelBaseClass}>City</label>
            <SearchableDropdown
              options={
                citiesData?.map((c, index) => ({
                  id: `${index}-${c.value}`,
                  value: c.value,
                  label: c.label,
                })) || []
              }
              value={city}
              onChange={setCity}
              placeholder="Where are you traveling to?"
              label={undefined}
              widthClass="w-full"
              searchPlaceholder="Search"
              tooltip="Select your destination city to view hotels"
              error={cityError || null}
            />
          </div>

          <div className="hero-dates w-full min-w-0">
            <label className={labelBaseClass}>Dates</label>
            <div
              className={`h-[50px] w-full rounded-[16px] px-2 flex items-center ${datesContainerError
                ? "border-2 border-[#E65959]"
                : "border border-[#C2CAD6]"
                }`}
            >
              <div className="flex-1 min-w-0">
                <TailiwindCustomDatePicker
                  value={checkInDate}
                  onChange={setCheckInDate}
                  placeholder="Check-in date"
                  buttonIconSrc={true}
                  overridesClass={true}
                  showCalendarIconRight={false}
                  inputClass="h-[50px] w-full min-w-0 rounded-[16px] border-none outline-none pl-10 pr-1 text-[14px] text-[#0F172A] bg-transparent cursor-pointer"
                  disablePastDates={true}
                  tooltip="Select check-in date"
                  error={checkInError || null}
                />
              </div>
              <span className="text-[#94A3B8] select-none px-1 flex-shrink-0">—</span>
              <div className="flex-1 min-w-0">
                <TailiwindCustomDatePicker
                  value={checkOutDate}
                  onChange={setCheckOutDate}
                  placeholder="Check-out date"
                  buttonIconSrc={true}
                  overridesClass={true}
                  showCalendarIconRight={false}
                  inputClass="h-[50px] w-full min-w-0 rounded-[16px] border-none pl-10 pr-2 outline-none text-[14px] text-[#0F172A] bg-transparent cursor-pointer"
                  disablePastDates={true}
                  minDate={checkInDate}
                  tooltip="Select check-out date"
                  error={checkOutError || null}
                />
              </div>
            </div>
          </div>

          <div className="hero-nationality w-full min-w-0">
            <label className={labelBaseClass}>Nationality</label>
            <SearchableDropdown
              options={
                countriesOptions?.map((c) => ({
                  id: c.iso2,
                  value: `${c.label},${c.iso2}`,
                  label: c.label,
                })) || []
              }
              value={nationality}
              onChange={setNationality}
              placeholder="Country of residence?"
              label={undefined}
              widthClass="w-full"
              searchPlaceholder="Search"
              tooltip="Select your country of residence"
              error={nationalityError || null}
            />
          </div>

          <div className="hero-travellers w-full min-w-0">
            <div className="relative">
              <label className={`${labelBaseClass} flex items-center gap-2`}>
                Travellers and rooms{" "}
                <span className="relative inline-flex group/info">
                  <img
                    src={Info}
                    alt="info"
                    className="w-4 h-4 inline-block align-middle"
                  />
                  <span
                    className="pointer-events-none absolute bottom-full left-full -translate-x-1/3 mb-2 hidden group-hover/info:block z-50 px-3 py-2 text-xs leading-5 text-white bg-[#1E293B] rounded-lg shadow-lg whitespace-nowrap text-center before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-6 before:border-transparent before:border-t-[#1E293B]"
                    role="tooltip"
                  >
                    Minimum 1 adult required per room <br />
                    Maximum 2 adults allowed per room
                    <br />
                    Maximum 2 children allowed per room
                    <br />
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
                errorMessage={travellersError || null}
              />
              {travellersError && (
                <p className="absolute top-full left-0 mt-2 text-[12px] text-[#E65959] whitespace-nowrap">
                  {travellersError}
                </p>
              )}
            </div>
          </div>

          <div className="hero-star w-full min-w-0">
            <CheckableDropdown
              options={starRatingOptions}
              value={starRatings}
              onChange={(v) =>
                setStarRatings(Array.isArray(v) ? v : v ? [v] : [])
              }
              placeholder="Select rating"
              label="Star Rating"
              singleSelect={false}
              tooltip="Select one or more star ratings"
            />
          </div>

          <div className="hero-search">
            <button
              className="w-full xl:w-[137px] h-[47px] text-[14px] sm:text-[16px] font-medium text-white whitespace-nowrap rounded-[100px] px-6 xl:px-10 hotel-search-btn-responsive"
              style={{
                background:
                  "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
              }}
              onClick={handleSearch}
            >
              Search Hotels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelHeroSectionTab;
