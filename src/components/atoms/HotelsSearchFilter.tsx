import React, { useState, useCallback, useRef, useEffect } from "react";
import { Collapse, Checkbox, Input } from "antd";
import CustomCollapse from "../common/CustomCollapse";
import type { HotelFilters, SortOption } from "../../utils/hotelFilters";
import {
  getActiveFilterCount,
  getHotelPropertyFacilitiesList,
  PROPERTY_TYPE_MAPPINGS,
  canonicalRoomTypeLabel,
} from "../../utils/hotelFilters";

const { Panel } = Collapse;

export type HotelsSearchFilterProps = {
  filters: HotelFilters;
  onFiltersChange: (filters: HotelFilters) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  hotels?: any[];
};

const CountBadge: React.FC<{ count: number }> = ({ count }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "26px",
      minHeight: "23px",
      borderRadius: "100px",
      backgroundColor: "#F2F2F3",
      color: "#3D495C",
      fontFamily: "Inter, sans-serif",
      fontSize: "11px",
      fontWeight: 300,
      lineHeight: "100%",
      padding: "5px 10px",
      flexShrink: 0,
    }}
  >
    {count.toLocaleString()}
  </span>
);

/** Long checkbox lists: cap height and show a vertical scrollbar when needed. */
const FILTER_CHECKLIST_SCROLL =
  "flex max-h-[min(280px,45vh)] flex-col gap-2 overflow-y-auto overscroll-y-contain pr-1 [-webkit-overflow-scrolling:touch]";

const FilterCheckboxRow: React.FC<{
  label: string;
  count?: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, count, checked, onChange }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px",
    }}
  >
    <Checkbox
      className="baggageCheckbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      style={{ flex: 1, minWidth: 0 }}
    >
      {label}
    </Checkbox>
    {count !== undefined && count > 0 && <CountBadge count={count} />}
  </div>
);

const HotelsSearchFilter: React.FC<HotelsSearchFilterProps> = ({
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  hotels = [],
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const activeFilterCount = getActiveFilterCount(filters);

  const {
    propertyFacilities,
    roomFacilities,
    roomTypes,
    meals,
    propertyTypes,
    cancellationPolicies,
  } = React.useMemo(() => {
    const propertyFacSet = new Set<string>();
    const propertyFacLcSet = new Set<string>();
    const roomFacSet = new Set<string>();
    const mealsSet = new Set<string>();

    const propertyFacCountMap: Record<string, number> = {};
    const roomFacCountMap: Record<string, number> = {};
    const mealCountMap: Record<string, number> = {};
    const roomTypeCountMap: Record<string, number> = {};
    /** Lowercase key → display label (first seen spelling from API). */
    const roomTypeLabelByKey: Record<string, string> = {};
    const propertyTypeCountMap: Record<string, number> = {};
    const cancellationCountMap: Record<string, number> = {};

    hotels.forEach((hotel) => {
      const rawCode = (hotel?.propertyInfo?.propertyType || "")
        .trim()
        .toUpperCase();

      if (rawCode) {
        const readableLabel = PROPERTY_TYPE_MAPPINGS[rawCode] || rawCode;
        propertyTypeCountMap[readableLabel] =
          (propertyTypeCountMap[readableLabel] ?? 0) + 1;
      }

      getHotelPropertyFacilitiesList(hotel).forEach((facility: any) => {
        const name = facility?.name || facility;
        if (name && typeof name === "string") {
          const trimmed = name.trim();
          if (!trimmed) return;
          propertyFacSet.add(trimmed);
          propertyFacLcSet.add(trimmed.toLowerCase());
          propertyFacCountMap[trimmed] =
            (propertyFacCountMap[trimmed] ?? 0) + 1;
        }
      });

      if (hotel?.rooms) {
        const roomTypesSeenThisHotel = new Set<string>();
        hotel.rooms.forEach((room: any) => {
          const rType = canonicalRoomTypeLabel(room?.roomTypeName || "");
          if (rType) {
            const k = rType.toLowerCase();
            if (!roomTypeLabelByKey[k]) roomTypeLabelByKey[k] = rType;
            roomTypesSeenThisHotel.add(k);
          }

          if (room?.roomFacilities) {
            room.roomFacilities.forEach((facility: any) => {
              const name = facility?.name || facility;
              if (name && typeof name === "string") {
                roomFacSet.add(name);
                roomFacCountMap[name] = (roomFacCountMap[name] ?? 0) + 1;
              }
            });
          }

          if (room?.ratePlan?.meal) {
            const meal = room.ratePlan.meal.trim();
            if (meal) {
              const normalizedMeal = meal
                .toLowerCase()
                .split(" ")
                .map(
                  (word: string) =>
                    word.charAt(0).toUpperCase() + word.slice(1),
                )
                .join(" ");

              mealsSet.add(normalizedMeal);
              mealCountMap[normalizedMeal] =
                (mealCountMap[normalizedMeal] ?? 0) + 1;
            }
          }

          const rawPolicy = (
            room?.ratePlan?.cancellationPolicy ||
            room?.ratePlan?.cancelPolicyIndicator ||
            room?.rateNotes ||
            ""
          ).trim();

          if (rawPolicy) {
            const lc = rawPolicy.toLowerCase();
            let normalizedPolicy = "";

            if (
              lc.includes("free cancellation") ||
              (lc.includes("refundable") && !lc.includes("non-refundable"))
            ) {
              normalizedPolicy = "Free cancellation";
            } else if (
              lc.includes("non-refundable") ||
              lc.includes("non refundable") ||
              lc.includes("no refund")
            ) {
              normalizedPolicy = "Non-refundable";
            }

            if (normalizedPolicy) {
              cancellationCountMap[normalizedPolicy] =
                (cancellationCountMap[normalizedPolicy] ?? 0) + 1;
            }
          }
        });

        roomTypesSeenThisHotel.forEach((k) => {
          const label = roomTypeLabelByKey[k];
          roomTypeCountMap[label] = (roomTypeCountMap[label] ?? 0) + 1;
        });
      }
    });

    const roomFacilitiesArray = Array.from(roomFacSet).filter(
      (f) => !propertyFacLcSet.has(f.toLowerCase()),
    );

    return {
      propertyFacilities: Array.from(propertyFacSet)
        .sort()
        .map((name) => ({ name, count: propertyFacCountMap[name] ?? 0 })),
      roomFacilities: roomFacilitiesArray
        .sort()
        .map((name) => ({ name, count: roomFacCountMap[name] ?? 0 })),
      roomTypes: Object.entries(roomTypeCountMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => ({ name, count })),
      meals: Array.from(mealsSet)
        .sort()
        .map((name) => ({ name, count: mealCountMap[name] ?? 0 })),
      propertyTypes: Object.entries(propertyTypeCountMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => ({ name, count })),
      cancellationPolicies: Object.entries(cancellationCountMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => ({ name, count })),
    };
  }, [hotels]);

  const handleFilterChange = useCallback(
    (
      filterType: keyof HotelFilters,
      value: string | number,
      isChecked?: boolean,
    ) => {
      const newFilters = { ...filters };

      if (filterType === "hotelName") {
        newFilters.hotelName = value as string;
      } else if (filterType === "ratings") {
        const currentArray = newFilters.ratings;
        if (isChecked !== undefined) {
          newFilters.ratings = isChecked
            ? [...currentArray, value as number]
            : currentArray.filter((item) => item !== value);
        }
      } else {
        const currentArray = newFilters[filterType] as string[];
        if (isChecked !== undefined) {
          newFilters[filterType] = (
            isChecked
              ? [...currentArray, value as string]
              : currentArray.filter((item) => item !== value)
          ) as any;
        }
      }

      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange],
  );

  const handleResetAll = useCallback(() => {
    onFiltersChange({
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
  ];

  const selectedLabel =
    sortOptions.find((opt) => opt.value === sortOption)?.label ||
    "Please Select";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortOpen]);

  return (
    <div className="filterSectionStyle hotel-search-filter-root">
      <div className="relative" ref={sortDropdownRef}>
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="w-full bg-white text-left flex flex-col justify-center"
          style={{
            height: "70px",
            borderRadius: "16px",
            border: "1px solid #C2CAD6",
            padding: "12px 16px",
          }}
        >
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 300,
              color: "#3D495C",
              lineHeight: "100%",
              marginBottom: "6px",
            }}
          >
            Sort by
          </div>
          <div className="flex items-center justify-between">
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 300,
                color: "#0A0C0F",
                lineHeight: "100%",
              }}
            >
              {selectedLabel}
            </span>
            <svg
              className={`w-5 h-5 transition-transform flex-shrink-0 ${
                isSortOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="#3D495C"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {isSortOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#F2F2F3] rounded-2xl border border-[#F2F2F3] shadow-lg z-10 overflow-hidden">
            {sortOptions.map((option, index) => (
              <div
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  setIsSortOpen(false);
                }}
                className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                  index !== sortOptions.length - 1
                    ? "border-b border-[#E4E4E7]"
                    : ""
                }`}
              >
                <span
                  style={{ color: "#0A0C0F", fontSize: 13, fontWeight: 300 }}
                >
                  {option.label}
                </span>
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

      <div className="filterStyle max-h-[calc(100vh-40vh)] overflow-y-auto overflow-x-hidden overscroll-y-contain pr-1 pb-14 [scrollbar-gutter:stable]">
        <div className="filterHeading">
          <div>
            <h4>
              <span className="hotelFilterHeadingTitle">Filters</span>
              {activeFilterCount > 0 && (
                <>
                  <span className="smallDot" aria-hidden>
                    •
                  </span>
                  <span className="lightActiveText">
                    {activeFilterCount} Active
                  </span>
                </>
              )}
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
              allowClear={{
                clearIcon: (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#D9DEE7",
                      color: "#3D495C",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </span>
                ),
              }}
              placeholder="Search for a hotel"
              value={filters.hotelName}
              onChange={(e) => handleFilterChange("hotelName", e.target.value)}
              style={{
                height: "50px",
                borderRadius: "16px",
                border: "1px solid #C2CAD6",
                fontFamily: "Inter, sans-serif",
                fontWeight: 300,
                fontSize: "14px",
                color: "#0A0C0F",
                width: "100%",
                paddingLeft: "16px",
                boxShadow: "none",
              }}
            />
          </Panel>
        </CustomCollapse>

        {/* <CustomCollapse>
          <Panel header="Point of interest" key="point_interest">
            <Input
              allowClear={{
                clearIcon: (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#D9DEE7",
                      color: "#3D495C",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </span>
                ),
              }}
              placeholder="Enter a location"
              value={pointOfInterest}
              onChange={(e) => setPointOfInterest(e.target.value)}
              style={{
                height: "50px",
                borderRadius: "16px",
                border: "1px solid #C2CAD6",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "16px",
                color: "#0A0C0F",
                width: "100%",
                paddingLeft: "16px",
                boxShadow: "none",
              }}
            />
          </Panel>
        </CustomCollapse> */}
        {/* 
        <CustomCollapse>
          <Panel header="Previously used filters" key="previously">
            <div className="flex flex-col gap-[10px]">
              <Checkbox className="baggageCheckbox">Top reviewed</Checkbox>
              <Checkbox className="baggageCheckbox">Discounts first</Checkbox>
              <Checkbox className="baggageCheckbox">
                Closest from downtown
              </Checkbox>
            </div>
          </Panel>
        </CustomCollapse> */}

        {propertyTypes.length > 0 && (
          <CustomCollapse>
            <Panel header="Property type" key="property">
              <div className={FILTER_CHECKLIST_SCROLL}>
                {propertyTypes.map(({ name, count }) => (
                  <FilterCheckboxRow
                    key={name}
                    label={name}
                    count={count}
                    checked={filters.propertyTypes.includes(name)}
                    onChange={(checked) =>
                      handleFilterChange("propertyTypes", name, checked)
                    }
                  />
                ))}
              </div>
            </Panel>
          </CustomCollapse>
        )}

        {propertyFacilities.length > 0 && (
          <CustomCollapse>
            <Panel header="Property facilities" key="facilities">
              <div className={FILTER_CHECKLIST_SCROLL}>
                {propertyFacilities.map(({ name, count }) => (
                  <FilterCheckboxRow
                    key={name}
                    label={name}
                    count={count}
                    checked={filters.propertyFacilities.includes(name)}
                    onChange={(checked) =>
                      handleFilterChange("propertyFacilities", name, checked)
                    }
                  />
                ))}
              </div>
            </Panel>
          </CustomCollapse>
        )}

        {roomFacilities.length > 0 && (
          <CustomCollapse>
            <Panel header="Room facilities" key="room_facilities">
              <div className={FILTER_CHECKLIST_SCROLL}>
                {roomFacilities.map(({ name, count }) => (
                  <FilterCheckboxRow
                    key={name}
                    label={name}
                    count={count}
                    checked={filters.roomFacilities.includes(name)}
                    onChange={(checked) =>
                      handleFilterChange("roomFacilities", name, checked)
                    }
                  />
                ))}
              </div>
            </Panel>
          </CustomCollapse>
        )}

        {roomTypes.length > 0 && (
          <CustomCollapse>
            <Panel header="Room type" key="room_type">
              <div className={FILTER_CHECKLIST_SCROLL}>
                {roomTypes.map(({ name, count }) => (
                  <FilterCheckboxRow
                    key={name}
                    label={name}
                    count={count}
                    checked={filters.roomTypes.includes(name)}
                    onChange={(checked) =>
                      handleFilterChange("roomTypes", name, checked)
                    }
                  />
                ))}
              </div>
            </Panel>
          </CustomCollapse>
        )}

        {meals.length > 0 && (
          <CustomCollapse>
            <Panel header="Meals" key="meals">
              <div className={FILTER_CHECKLIST_SCROLL}>
                {meals.map(({ name, count }) => (
                  <FilterCheckboxRow
                    key={name}
                    label={name}
                    count={count}
                    checked={filters.meals.includes(name)}
                    onChange={(checked) =>
                      handleFilterChange("meals", name, checked)
                    }
                  />
                ))}
              </div>
            </Panel>
          </CustomCollapse>
        )}

        {cancellationPolicies.length > 0 && (
          <CustomCollapse>
            <Panel header="Cancellation policy" key="cancellation">
              <div className={FILTER_CHECKLIST_SCROLL}>
                {cancellationPolicies.map(({ name, count }) => (
                  <FilterCheckboxRow
                    key={name}
                    label={name}
                    count={count}
                    checked={filters.cancellationPolicy.includes(name)}
                    onChange={(checked) =>
                      handleFilterChange("cancellationPolicy", name, checked)
                    }
                  />
                ))}
              </div>
            </Panel>
          </CustomCollapse>
        )}
      </div>
    </div>
  );
};

export default HotelsSearchFilter;
