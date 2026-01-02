import React, { useState } from "react";
import { Collapse, Checkbox, Input } from "antd";
import CustomCollapse from "../common/CustomCollapse";

const { Panel } = Collapse;

export type HotelsSearchFilterProps = {};

const HotelsSearchFilter: React.FC<HotelsSearchFilterProps> = ({}) => {
  const [selectedSort, setSelectedSort] = useState<string>("top_picks");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortOptions = [
    { label: "Top picks for families", value: "top_picks" },
    { label: "Homes & apartments first", value: "homes_first" },
    { label: "Price (lowest first)", value: "price_low" },
    { label: "Price (Highest first)", value: "price_high" },
    { label: "Best reviewed & lowest price", value: "best_reviewed" },
    { label: "Property rating (high to low)", value: "rating_high" },
    { label: "Property rating (low to high)", value: "rating_low" },
    { label: "Property rating & price", value: "rating_price" },
    { label: "Distance from downtown", value: "distance" },
    { label: "Top reviewed", value: "top_reviewed" },
    { label: "Discounts first", value: "discounts" },
    { label: "Closest to the beach", value: "beach" },
  ];

  const selectedLabel =
    sortOptions.find((opt) => opt.value === selectedSort)?.label ||
    "Top picks for families";
  return (
    <div className="filterSectionStyle">
      <div className="relative">
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="w-full bg-white rounded-2xl border border-[#E7EEF7] px-4 py-3 text-left"
        >
          <div style={{ fontSize: 12, fontWeight: 400, color: "#3D495C" }}>
            Sort by
          </div>
          <div className="flex items-center justify-between mt-1">
            <span style={{ fontSize: 14, fontWeight: 500, color: "#0A0C0F" }}>
              {selectedLabel}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${
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

        {/* Dropdown Menu */}
        {isSortOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#F2F2F3] rounded-2xl border border-[#F2F2F3] shadow-lg z-10 overflow-hidden">
            {sortOptions.map((option, index) => (
              <div
                key={option.value}
                onClick={() => {
                  setSelectedSort(option.value);
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

                {/* Tick Icon - Replace this SVG with your actual icon */}
                {selectedSort === option.value && (
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
              <span className="lightActiveText">0 Active</span>
            </h4>
          </div>
          <div className="resetAllBtn">
            <a href="#">Reset all</a>
          </div>
        </div>

        <CustomCollapse>
          <Panel header="Hotel name" key="hotel_name">
            <Input
              placeholder="Search for a hotel"
              className="w-full border border-[#C2CAD6] focus:outline-none focus:ring-0 focus:border-[#C2CAD6]"
            />
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Point of interest" key="point_intereset">
            <Input
              placeholder="Enter a location"
              className="w-full border border-[#C2CAD6] focus:outline-none focus:ring-0 focus:border-[#C2CAD6]"
            />
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Previously used filters" key="previously">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Top reviewed</Checkbox>
              <Checkbox className="baggageCheckbox">Discounts first</Checkbox>
              <Checkbox className="baggageCheckbox">
                Closest from downtown
              </Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Popular filters" key="popular">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">5 stars</Checkbox>
              <Checkbox className="baggageCheckbox">Vacation homes</Checkbox>
              <Checkbox className="baggageCheckbox">Spa</Checkbox>
              <Checkbox className="baggageCheckbox">Guesthouses</Checkbox>
              <Checkbox className="baggageCheckbox">Villas</Checkbox>
              <Checkbox className="baggageCheckbox">Restaurants</Checkbox>
              <Checkbox className="baggageCheckbox">Hotels</Checkbox>
              <Checkbox className="baggageCheckbox">Air conditioning</Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Property type" key="property">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Apartments</Checkbox>
              <Checkbox className="baggageCheckbox">Hotels</Checkbox>
              <Checkbox className="baggageCheckbox">Guesthouses</Checkbox>
              <Checkbox className="baggageCheckbox">Vacation homes</Checkbox>
              <Checkbox className="baggageCheckbox">Villas</Checkbox>
              <Checkbox className="baggageCheckbox">
                Bed and breakfasts
              </Checkbox>
              <Checkbox className="baggageCheckbox">Hostels</Checkbox>
              <Checkbox className="baggageCheckbox">Farm stays</Checkbox>
              <Checkbox className="baggageCheckbox">Campgrounds</Checkbox>
              <Checkbox className="baggageCheckbox">Resorts</Checkbox>
              <Checkbox className="baggageCheckbox">Resort Villages</Checkbox>
              <Checkbox className="baggageCheckbox">Capsule Hotels</Checkbox>
              <Checkbox className="baggageCheckbox">Motels</Checkbox>
              <Checkbox className="baggageCheckbox">Lodges</Checkbox>
              <Checkbox className="baggageCheckbox">Country Houses</Checkbox>
              <Checkbox className="baggageCheckbox">Love Hotels</Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Rating" key="rating">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">7 Stars</Checkbox>
              <Checkbox className="baggageCheckbox">6 Stars</Checkbox>
              <Checkbox className="baggageCheckbox">5 Stars</Checkbox>
              <Checkbox className="baggageCheckbox">4 Stars</Checkbox>
              <Checkbox className="baggageCheckbox">3 Stars</Checkbox>
              <Checkbox className="baggageCheckbox">2 Stars</Checkbox>
              <Checkbox className="baggageCheckbox">1 Star</Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Property facilities" key="facilities">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Free WIFI</Checkbox>
              <Checkbox className="baggageCheckbox">Parking</Checkbox>
              <Checkbox className="baggageCheckbox">Non-smoking rooms</Checkbox>
              <Checkbox className="baggageCheckbox">Airport Shuttle</Checkbox>
              <Checkbox className="baggageCheckbox">Swimming pool</Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Room facilities " key="room_facilities">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Private pool</Checkbox>
              <Checkbox className="baggageCheckbox">Sea view</Checkbox>
              <Checkbox className="baggageCheckbox">Balcony</Checkbox>
              <Checkbox className="baggageCheckbox">Private bathroom</Checkbox>
              <Checkbox className="baggageCheckbox">Air conditioning</Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
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
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Review score " key="review_score">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Wonderful: 9+</Checkbox>
              <Checkbox className="baggageCheckbox">Very good: 8+</Checkbox>
              <Checkbox className="baggageCheckbox">Good: 7+</Checkbox>
              <Checkbox className="baggageCheckbox">Pleasant: 6+</Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Fun things to do" key="fun">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Playground</Checkbox>
              <Checkbox className="baggageCheckbox">Fitness</Checkbox>
              <Checkbox className="baggageCheckbox">Tennis equipment</Checkbox>
              <Checkbox className="baggageCheckbox">Themed dinners</Checkbox>
              <Checkbox className="baggageCheckbox">Movie nights</Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Distance from the city center" key="distance">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">{"< 1 km"}</Checkbox>
              <Checkbox className="baggageCheckbox">{"< 3 km"}</Checkbox>
              <Checkbox className="baggageCheckbox">{"< 5 km"}</Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Travel group" key="travel">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Pet friendly</Checkbox>
              <Checkbox className="baggageCheckbox">Adults only</Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Landmarks" key="landmarks">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Badshahi Mosque</Checkbox>
              <Checkbox className="baggageCheckbox">Lahore Fort</Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Highly rated features" key="features">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">
                Very good breakfast
              </Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Bed preferences" key="bed">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Twin beds</Checkbox>
              <Checkbox className="baggageCheckbox">Double bed</Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Meals" key="meals">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">
                Kitchen facilities
              </Checkbox>
              <Checkbox className="baggageCheckbox">
                Breakfast included
              </Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

        <CustomCollapse>
          <Panel header="Reservation policy" key="reservation">
            <div className="flex flex-col gap-2">
              <Checkbox className="baggageCheckbox">Free cancellation</Checkbox>
              <Checkbox className="baggageCheckbox">
                Book without credit card
              </Checkbox>
              <Checkbox className="baggageCheckbox">No prepayment</Checkbox>
            </div>
          </Panel>
        </CustomCollapse>

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
        </CustomCollapse>
      </div>
    </div>
  );
};

export default HotelsSearchFilter;
