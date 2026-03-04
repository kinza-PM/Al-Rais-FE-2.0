import React, { useState, useCallback } from "react";
import { Collapse, Checkbox, Input } from "antd";
import CustomCollapse from "../common/CustomCollapse";
import type { HotelFilters, SortOption } from "../../utils/hotelFilters";
import { getActiveFilterCount } from "../../utils/hotelFilters";

const { Panel } = Collapse;

export type HotelsSearchFilterProps = {
  filters: HotelFilters;
  onFiltersChange: (filters: HotelFilters) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  hotels?: any[]; // Hotel data to extract dynamic filters
};

const HotelsSearchFilter: React.FC<HotelsSearchFilterProps> = ({
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  hotels = [],
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);

  const activeFilterCount = getActiveFilterCount(filters);

  // Extract unique facilities from hotels data
  const { propertyFacilities, roomFacilities, meals } = React.useMemo(() => {
    const propertyFacSet = new Set<string>();
    const roomFacSet = new Set<string>();
    const mealsSet = new Set<string>();

    hotels.forEach((hotel) => {
      // Property facilities
      if (hotel?.propertyInfo?.facilities) {
        hotel.propertyInfo.facilities.forEach((facility: any) => {
          const name = facility?.name || facility;
          if (name && typeof name === "string") {
            propertyFacSet.add(name);
          }
        });
      }

      // Room facilities
      if (hotel?.rooms) {
        hotel.rooms.forEach((room: any) => {
          if (room?.roomFacilities) {
            room.roomFacilities.forEach((facility: any) => {
              const name = facility?.name || facility;
              if (name && typeof name === "string") {
                roomFacSet.add(name);
              }
            });
          }

          // Meals
          if (room?.ratePlan?.meal) {
            const meal = room.ratePlan.meal.trim();
            if (meal) {
              // Convert to title case (first letter uppercase, rest lowercase)
              const normalizedMeal = meal
                .toLowerCase()
                .split(" ")
                .map(
                  (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" ");
              mealsSet.add(normalizedMeal);
            }
          }
        });
      }
    });

    // Remove duplicates between property and room facilities
    const roomFacilitiesArray = Array.from(roomFacSet).filter(
      (facility) => !propertyFacSet.has(facility)
    );

    return {
      propertyFacilities: Array.from(propertyFacSet).sort(),
      roomFacilities: roomFacilitiesArray.sort(),
      meals: Array.from(mealsSet).sort(),
    };
  }, [hotels]);

  const handleFilterChange = useCallback(
    (
      filterType: keyof HotelFilters,
      value: string | number,
      isChecked?: boolean
    ) => {
      const newFilters = { ...filters };

      if (filterType === "hotelName") {
        newFilters.hotelName = value as string;
      } else if (filterType === "ratings") {
        const currentArray = newFilters.ratings;
        if (isChecked !== undefined) {
          if (isChecked) {
            newFilters.ratings = [...currentArray, value as number];
          } else {
            newFilters.ratings = currentArray.filter((item) => item !== value);
          }
        }
      } else {
        const currentArray = newFilters[filterType] as string[];
        if (isChecked !== undefined) {
          if (isChecked) {
            newFilters[filterType] = [...currentArray, value as string] as any;
          } else {
            newFilters[filterType] = currentArray.filter(
              (item) => item !== value
            ) as any;
          }
        }
      }

      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const handleResetAll = useCallback(() => {
    onFiltersChange({
      hotelName: "",
      propertyTypes: [],
      ratings: [],
      propertyFacilities: [],
      roomFacilities: [],
      bedPreferences: [],
      meals: [],
      cancellationPolicy: [],
    });
  }, [onFiltersChange]);

  const sortOptions = [
    { label: "Please Select", value: "" as SortOption },
    { label: "Price (lowest first)", value: "price_low" as SortOption },
    { label: "Price (Highest first)", value: "price_high" as SortOption },
    {
      label: "Property rating (high to low)",
      value: "rating_high" as SortOption,
    },
    {
      label: "Property rating (low to high)",
      value: "rating_low" as SortOption,
    },
    // { label: "Top picks for families", value: "top_picks" },
    // { label: "Homes & apartments first", value: "homes_first" },
    // { label: "Best reviewed & lowest price", value: "best_reviewed" },
    // { label: "Property rating & price", value: "rating_price" },
    // { label: "Distance from downtown", value: "distance" },
    // { label: "Top reviewed", value: "top_reviewed" },
    // { label: "Discounts first", value: "discounts" },
    // { label: "Closest to the beach", value: "beach" },
  ];

  const selectedLabel =
    sortOptions.find((opt) => opt.value === sortOption)?.label ||
    "Please Select";
  return (
    <div className="filterSectionStyle">
      <div className="relative">
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="w-full bg-white text-left flex flex-col justify-center"
          style={{
            height: '70px',
            borderRadius: '16px',
            border: '1px solid #C2CAD6',
            padding: '12px 16px',
          }}
        >
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              color: '#3D495C',
              lineHeight: '100%',
              marginBottom: '6px',
            }}
          >
            Sort by
          </div>
          <div className="flex items-center justify-between">
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#0A0C0F',
                lineHeight: '100%',
              }}
            >
              {selectedLabel}
            </span>
            <svg
              className={`w-5 h-5 transition-transform flex-shrink-0 ${isSortOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="#3D495C"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isSortOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#F2F2F3] rounded-2xl border border-[#F2F2F3] shadow-lg z-10 overflow-hidden">
            {sortOptions.map((option, index) => (
              <div
                key={option.value}
                onClick={() => {
                  // if (option.value) {
                  onSortChange(option.value);
                  // }
                  setIsSortOpen(false);
                }}
                className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                  index !== sortOptions.length - 1
                    ? "border-b border-[#E4E4E7]"
                    : ""
                }`}
              >
                <span
                  style={{ color: "#0A0C0F", fontSize: 14, fontWeight: 400 }}
                >
                  {option.label}
                </span>

                {/* Tick Icon */}
                {sortOption === option.value && (
                  <svg
                    width="16"
                    height="12"
                    viewBox="0 0 16 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.4425 1.06754L5.44254 11.0675C5.38449 11.1256 5.31556 11.1717 5.23969 11.2032C5.16381 11.2347 5.08248 11.2508 5.00035 11.2508C4.91821 11.2508 4.83688 11.2347 4.76101 11.2032C4.68514 11.1717 4.61621 11.1256 4.55816 11.0675L0.18316 6.69254C0.0658846 6.57526 0 6.4162 0 6.25035C0 6.0845 0.0658846 5.92544 0.18316 5.80816C0.300435 5.69088 0.459495 5.625 0.625347 5.625C0.7912 5.625 0.95026 5.69088 1.06753 5.80816L5.00035 9.74175L14.5582 0.18316C14.6754 0.0658843 14.8345 -1.2357e-09 15.0003 0C15.1662 1.2357e-09 15.3253 0.0658843 15.4425 0.18316C15.5598 0.300435 15.6257 0.459495 15.6257 0.625347C15.6257 0.7912 15.5598 0.95026 15.4425 1.06754Z"
                      fill="#2351A3"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="filterStyle max-h-[calc(100vh-50vh)] overflow-y-auto overflow-x-hidden scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="filterHeading">
          <div>
            <h4>
              Filters
              <span className="smallDot">•</span>
              <span className="lightActiveText">
                {activeFilterCount} Active
              </span>
            </h4>
          </div>
          <div className="resetAllBtn">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleResetAll();
              }}
            >
              Reset all
            </a>
          </div>
        </div>

        <CustomCollapse>
          <Panel header="Hotel name" key="hotel_name">
            <Input
              placeholder="Search for a hotel"
              value={filters.hotelName}
              onChange={(e) => handleFilterChange("hotelName", e.target.value)}
              style={{
                height: '50px',
                borderRadius: '16px',
                border: '1px solid #C2CAD6',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '16px',
                color: '#0A0C0F',
                width: '100%',
                paddingLeft: '16px',
                boxShadow: 'none',
              }}
            />
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Point of interest" key="point_interest">
            <Input
              placeholder="Enter a location"
              style={{
                height: '50px',
                borderRadius: '16px',
                border: '1px solid #C2CAD6',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '16px',
                color: '#0A0C0F',
                width: '100%',
                paddingLeft: '16px',
                boxShadow: 'none',
              }}
            />
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Previously used filters" key="previously">
            <div className="flex flex-col gap-[10px]">
              <Checkbox className="baggageCheckbox">Top reviewed</Checkbox>
              <Checkbox className="baggageCheckbox">Discounts first</Checkbox>
              <Checkbox className="baggageCheckbox">Closest from downtown</Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Property type" key="property">
            <div className="flex flex-col gap-2">
              <Checkbox
                className="baggageCheckbox"
                checked={filters.propertyTypes.includes("Hotels")}
                onChange={(e) =>
                  handleFilterChange(
                    "propertyTypes",
                    "Hotels",
                    e.target.checked
                  )
                }
              >
                Hotels
              </Checkbox>
              <Checkbox
                className="baggageCheckbox"
                checked={filters.propertyTypes.includes("Pension/Property")}
                onChange={(e) =>
                  handleFilterChange(
                    "propertyTypes",
                    "Pension/Property",
                    e.target.checked
                  )
                }
              >
                Pension/Property
              </Checkbox>
              {/* {[
                "Apartments",
                "Guesthouses",
                "Vacation homes",
                "Villas",
                "Bed and breakfasts",
                "Hostels",
                "Farm stays",
                "Campgrounds",
                "Resorts",
                "Resort Villages",
                "Capsule Hotels",
                "Motels",
                "Lodges",
                "Country Houses",
                "Love Hotels",
              ].map((type) => (
                <Checkbox
                  key={type}
                  className="baggageCheckbox"
                  checked={filters.propertyTypes.includes(type)}
                  onChange={(e) =>
                    handleFilterChange("propertyTypes", type, e.target.checked)
                  }
                >
                  {type}
                </Checkbox>
              ))} */}
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Rating" key="rating">
            <div className="flex flex-col gap-2">
              {[7, 6, 5, 4, 3, 2, 1].map((rating) => (
                <Checkbox
                  key={rating}
                  className="baggageCheckbox"
                  checked={filters.ratings.includes(rating)}
                  onChange={(e) =>
                    handleFilterChange("ratings", rating, e.target.checked)
                  }
                >
                  {rating} {rating === 1 ? "Star" : "Stars"}
                </Checkbox>
              ))}
            </div>
          </Panel>
        </CustomCollapse>

        {propertyFacilities.length > 0 && (
          <CustomCollapse>
            <Panel header="Property facilities" key="facilities">
              <div className="flex flex-col gap-2">
                {propertyFacilities.map((facility) => (
                  <Checkbox
                    key={facility}
                    className="baggageCheckbox"
                    checked={filters.propertyFacilities.includes(facility)}
                    onChange={(e) =>
                      handleFilterChange(
                        "propertyFacilities",
                        facility,
                        e.target.checked
                      )
                    }
                  >
                    {facility}
                  </Checkbox>
                ))}
              </div>
            </Panel>
          </CustomCollapse>
        )}

        {roomFacilities.length > 0 && (
          <CustomCollapse>
            <Panel header="Room facilities " key="room_facilities">
              <div className="flex flex-col gap-2">
                {roomFacilities.map((facility) => (
                  <Checkbox
                    key={facility}
                    className="baggageCheckbox"
                    checked={filters.roomFacilities.includes(facility)}
                    onChange={(e) =>
                      handleFilterChange(
                        "roomFacilities",
                        facility,
                        e.target.checked
                      )
                    }
                  >
                    {facility}
                  </Checkbox>
                ))}
              </div>
            </Panel>
          </CustomCollapse>
        )}

        {/* <CustomCollapse>
          <Panel header="Neighborhood " key="neighborhood">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Gulberg</Checkbox>
              <Checkbox className="baggageCheckbox">Johar Town</Checkbox>
              <Checkbox className="baggageCheckbox">M.M. Alam Road</Checkbox>
              <Checkbox className="baggageCheckbox">Model Town</Checkbox>
              <Checkbox className="baggageCheckbox">Mall Road</Checkbox>
              <Checkbox className="baggageCheckbox">Township</Checkbox>
            </div>
          </Panel>
        </CustomCollapse> */}

        {/* <CustomCollapse>
          <Panel header="Review score " key="review_score">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Wonderful: 9+</Checkbox>
              <Checkbox className="baggageCheckbox">Very good: 8+</Checkbox>
              <Checkbox className="baggageCheckbox">Good: 7+</Checkbox>
              <Checkbox className="baggageCheckbox">Pleasant: 6+</Checkbox>
            </div>
          </Panel>
        </CustomCollapse> */}

        {/* <CustomCollapse>
          <Panel header="Fun things to do" key="fun">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Playground</Checkbox>
              <Checkbox className="baggageCheckbox">Fitness</Checkbox>
              <Checkbox className="baggageCheckbox">Tennis equipment</Checkbox>
              <Checkbox className="baggageCheckbox">Themed dinners</Checkbox>
              <Checkbox className="baggageCheckbox">Movie nights</Checkbox>
            </div>
          </Panel>
        </CustomCollapse> */}

        {/* <CustomCollapse>
          <Panel header="Distance from the city center" key="distance">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">{"< 1 km"}</Checkbox>
              <Checkbox className="baggageCheckbox">{"< 3 km"}</Checkbox>
              <Checkbox className="baggageCheckbox">{"< 5 km"}</Checkbox>
            </div>
          </Panel>
        </CustomCollapse> */}

        {/* <CustomCollapse>
          <Panel header="Travel group" key="travel">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Pet friendly</Checkbox>
              <Checkbox className="baggageCheckbox">Adults only</Checkbox>
            </div>
          </Panel>
        </CustomCollapse> */}

        {/* <CustomCollapse>
          <Panel header="Landmarks" key="landmarks">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Badshahi Mosque</Checkbox>
              <Checkbox className="baggageCheckbox">Lahore Fort</Checkbox>
            </div>
          </Panel>
        </CustomCollapse> */}

        {/* <CustomCollapse>
          <Panel header="Highly rated features" key="features">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">
                Very good breakfast
              </Checkbox>
            </div>
          </Panel>
        </CustomCollapse> */}

        {/* <CustomCollapse>
          <Panel header="Bed preferences" key="bed">
            <div className="flex flex-col gap-2">
              {["Twin beds", "Double bed"].map((preference) => (
                <Checkbox
                  key={preference}
                  className="baggageCheckbox"
                  checked={filters.bedPreferences.includes(preference)}
                  onChange={(e) =>
                    handleFilterChange(
                      "bedPreferences",
                      preference,
                      e.target.checked
                    )
                  }
                >
                  {preference}
                </Checkbox>
              ))}
            </div>
          </Panel>
        </CustomCollapse> */}

        {meals.length > 0 && (
          <CustomCollapse>
            <Panel header="Meals" key="meals">
              <div className="flex flex-col gap-2">
                {meals.map((meal) => (
                  <Checkbox
                    key={meal}
                    className="baggageCheckbox"
                    checked={filters.meals.includes(meal)}
                    onChange={(e) =>
                      handleFilterChange("meals", meal, e.target.checked)
                    }
                  >
                    {meal}
                  </Checkbox>
                ))}
              </div>
            </Panel>
          </CustomCollapse>
        )}

        <CustomCollapse>
          <Panel header="Cancellation policy" key="cancellation">
            <div className="flex flex-col gap-2">
              <Checkbox
                className="baggageCheckbox"
                checked={filters.cancellationPolicy.includes(
                  "Free cancellation"
                )}
                onChange={(e) =>
                  handleFilterChange(
                    "cancellationPolicy",
                    "Free cancellation",
                    e.target.checked
                  )
                }
              >
                Free cancellation
              </Checkbox>
              <Checkbox
                className="baggageCheckbox"
                checked={filters.cancellationPolicy.includes("Non-refundable")}
                onChange={(e) =>
                  handleFilterChange(
                    "cancellationPolicy",
                    "Non-refundable",
                    e.target.checked
                  )
                }
              >
                Non-refundable
              </Checkbox>
              {/* <Checkbox
                className="baggageCheckbox"
                checked={filters.cancellationPolicy.includes(
                  "Book without credit card"
                )}
                onChange={(e) =>
                  handleFilterChange(
                    "cancellationPolicy",
                    "Book without credit card",
                    e.target.checked
                  )
                }
              >
                Book without credit card
              </Checkbox> */}
              {/* <Checkbox
                className="baggageCheckbox"
                checked={filters.cancellationPolicy.includes("No prepayment")}
                onChange={(e) =>
                  handleFilterChange(
                    "cancellationPolicy",
                    "No prepayment",
                    e.target.checked
                  )
                }
              >
                No prepayment
              </Checkbox> */}
            </div>
          </Panel>
        </CustomCollapse>
        {/* 
        <CustomCollapse>
          <Panel header="Brands" key="brands">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Ramada</Checkbox>
              <Checkbox className="baggageCheckbox">
                Best Western Premier
              </Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Property accessibility" key="accessibility">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">
                Toilet with grab rails
              </Checkbox>
              <Checkbox className="baggageCheckbox">Raised toilet</Checkbox>
              <Checkbox className="baggageCheckbox">Lowered sink</Checkbox>
              <Checkbox className="baggageCheckbox">
                Bathroom emergency cord
              </Checkbox>
              <Checkbox className="baggageCheckbox">
                Visual aids (Braille)
              </Checkbox>
              <Checkbox className="baggageCheckbox">
                Visual aids (tactile signs)
              </Checkbox>
              <Checkbox className="baggageCheckbox">Auditory guidance</Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Room accessibility" key="room_accessibility">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">
                Entire unit on ground floor
              </Checkbox>
              <Checkbox className="baggageCheckbox">Elevators</Checkbox>
              <Checkbox className="baggageCheckbox">
                Wheelchair accessible
              </Checkbox>
              <Checkbox className="baggageCheckbox">
                Toilet with grab rails
              </Checkbox>
              <Checkbox className="baggageCheckbox">Adapted bath</Checkbox>
              <Checkbox className="baggageCheckbox">Roll-in shower</Checkbox>
              <Checkbox className="baggageCheckbox">Walk-in shower</Checkbox>
              <Checkbox className="baggageCheckbox">Raised toilet</Checkbox>
              <Checkbox className="baggageCheckbox">Lower sink</Checkbox>
            </div>
          </Panel>
        </CustomCollapse> */}
      </div>
    </div>
  );
};

export default HotelsSearchFilter;
