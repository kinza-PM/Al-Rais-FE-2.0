import TailwindCustomInput from "../common/TailwindCustomInput";
import SearchableDropdown from "../common/SearchableDropdown";
import CustomToggle from "../common/CustomToggle";
import { useState } from "react";
import Button from "../atoms/Button";
import HotelImage from "../../../src/assets/images/Hotel Image.png";
import HotelBookingAnicllarySection from "./HotelBookingAnicllarySection";
import HotelSummaryCard from "../atoms/HotelSummaryCard";
import HotelPriceBreakdown from "../atoms/HotelPriceBreakdown";
import HotelFareRule from "../atoms/HotelFareRule";

type HotelBookingBookSectionProps = {
  onNext?: () => void;
};

export default function HotelBookingBookSection({
  onNext,
}: HotelBookingBookSectionProps) {
  const [bookingForOther, setBookingForOther] = useState(true);

  return (
    <section className="mx-auto max-w-full px-10 flight-booking-section">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr] flight-booking-grid">
        <div className="space-y-4">
          {/* CONTACT PERSON DETAILS */}
          <div className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
              <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                Contact person details
              </h3>
              <CustomToggle
                label="I’m booking for someone else"
                checked={bookingForOther}
                onChange={() => setBookingForOther((v) => !v)}
              />
            </div>

            <div className="px-4 py-4">
              <div className="grid gap-4 md:grid-cols-[1.2fr_1.8fr]">
                <div className="relative w-full">
                  <SearchableDropdown
                    options={[
                      { id: "mr", value: "MR", label: "Mr" },
                      { id: "ms", value: "MS", label: "Ms" },
                      { id: "mrs", value: "MRS", label: "Mrs" },
                    ]}
                    value=""
                    onChange={(value) => console.log(value)}
                    placeholder="Select title"
                    label="Title"
                    widthClass="w-full"
                    className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                  />
                </div>
                <TailwindCustomInput
                  type="text"
                  placeholder="Enter your full name"
                  label="Full name (Filled based on ID/Passport/Driver’s license)"
                />

                <TailwindCustomInput
                  type="text"
                  placeholder="Enter your surname"
                  label="Surname"
                />

                <div className="relative w-full">
                  <SearchableDropdown
                    options={[
                      { id: "male", value: "M", label: "Male" },
                      { id: "female", value: "F", label: "Female" },
                    ]}
                    value=""
                    onChange={(value) => console.log(value)}
                    placeholder="Select gender"
                    label="Gender"
                    widthClass="w-full"
                    className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* GUEST DETAILS */}
          <div className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
              <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                Guests details
              </h3>
            </div>

            <div className="px-4 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-[#0A0C0F] mb-2">
                    First guest
                  </p>

                  <div className="grid grid-cols-[2fr_1fr] gap-3">
                    <TailwindCustomInput
                      type="text"
                      placeholder="Enter guest full name"
                      label="Full name"
                    />

                    <div className="relative w-full">
                      <SearchableDropdown
                        label="Age group"
                        placeholder="Adult"
                        value="Adult"
                        options={[
                          { id: "adult", value: "Adult", label: "Adult" },
                          { id: "child", value: "Child", label: "Child" },
                        ]}
                        onChange={(value) => console.log(value)}
                        widthClass="w-full"
                        className="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-[#0A0C0F] mb-2">
                    Second guest
                  </p>

                  <div className="grid grid-cols-[2fr_1fr] gap-3">
                    <TailwindCustomInput
                      type="text"
                      placeholder="Enter guest full name"
                      label="Full name"
                    />

                    <div className="relative w-full">
                      <SearchableDropdown
                        label="Age group"
                        placeholder="Adult"
                        value="Adult"
                        options={[
                          { id: "adult", value: "Adult", label: "Adult" },
                          { id: "child", value: "Child", label: "Child" },
                        ]}
                        onChange={(value) => console.log(value)}
                        widthClass="w-full"
                        className="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                className="mx-auto block mt-8 text-[15px] font-semibold text-[#2351A3] hover:underline"
                overrideClasses
              >
                Add another guest
              </Button>
            </div>
          </div>

          {/* YOUR ROOM SELECTION */}
          <div className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
              <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                Your rooms
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-4 px-5 py-3">
              {Array.from({ length: 2 }).map((_, index) => {
                return (
                  <div
                    className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E4E4E7] overflow-visible mb-2"
                    key={index}
                  >
                    <div className="relative h-56 p-2">
                      <div className="flex gap-2 h-full">
                        <div className="flex-1 rounded-xl overflow-hidden">
                          <img
                            src={HotelImage}
                            alt="Hotel"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex flex-col gap-2 w-28">
                          <div className="flex-1 rounded-xl overflow-hidden">
                            <img
                              src={HotelImage}
                              alt="Hotel"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 rounded-xl overflow-hidden">
                            <img
                              src={HotelImage}
                              alt="Hotel"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                      {/* // Two Images - Split Evenly */}
                      {/* <div className="flex gap-2 h-full">
                  <div className="flex-1 rounded-xl overflow-hidden">
                    <img
                      src={HotelImage}
                      alt="Hotel"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 rounded-xl overflow-hidden">
                    <img
                      src={HotelImage}
                      alt="Hotel"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div> */}
                    </div>

                    <div className="px-2 py-1">
                      <h3 className="text-base font-medium text-[#0A0C0F]">
                        Royal Suite
                      </h3>

                      <p className="text-xs text-[#3D495C] mb-3">
                        Bed and Breakfast
                      </p>

                      <div className="grid grid-cols-[1.3fr_1.7fr] gap-3 text-xs leading-relaxed mb-3">
                        <p className="text-[#3D495C]">Rooms cleanliness</p>
                        <p className="text-[#0A0C0F] font-semibold text-right">
                          02 Adults
                        </p>
                      </div>

                      <div className="grid grid-cols-[1.3fr_1.7fr] gap-3 text-xs leading-relaxed mb-3">
                        <p className="text-[#3D495C]">Max no. of guests/room</p>
                        <p className="text-[#0A0C0F] font-semibold text-right">
                          Exceptionally clean
                        </p>
                      </div>

                      <div className="grid grid-cols-[1.3fr_1.7fr] gap-3 text-xs leading-relaxed mb-3">
                        <p className="text-[#3D495C]">Smoking</p>
                        <p className="text-[#0A0C0F] font-semibold text-right">
                          Not allowed
                        </p>
                      </div>

                      <div className="grid grid-cols-[1.3fr_1.7fr] gap-3 text-xs leading-relaxed mb-3">
                        <p className="text-[#3D495C]">Pets</p>
                        <p className="text-[#0A0C0F] font-semibold text-right">
                          Not allowed
                        </p>
                      </div>

                      <div className="grid grid-cols-[1.3fr_1.7fr] gap-3 text-xs leading-relaxed mb-3">
                        <p className="text-[#3D495C]">Cancellation cost</p>
                        <p className="text-[#0A0C0F] font-semibold text-right break-words">
                          $100 (full cost of your selection)
                        </p>
                      </div>

                      <div className="relative w-full">
                        <SearchableDropdown
                          label="Age group"
                          placeholder="Adult"
                          value="Adult"
                          options={[
                            { id: "adult", value: "Adult", label: "Adult" },
                            { id: "child", value: "Child", label: "Child" },
                          ]}
                          onChange={(value) => console.log(value)}
                          widthClass="w-full"
                          className="h-10 w-full rounded-2xl border border-[#C2CAD6] px-3 text-sm"
                        />
                      </div>

                      <Button
                        className="mx-auto block mt-6 mb-4 text-sm font-semibold text-[#EA0029]"
                        overrideClasses
                      >
                        Remove this room
                      </Button>
                    </div>
                  </div>
                );
              })}
              <div className="flex flex-col items-center justify-center bg-[#FFFFFF] rounded-2xl shadow-sm border border-dashed border-[#A7C0EC] mb-2">
                <Button
                  className="flex flex-col gap-1 items-center text-[#5383DA]"
                  overrideClasses
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.75 0C7.82164 0 5.93657 0.571828 4.33319 1.64317C2.72982 2.71451 1.48013 4.23726 0.742179 6.01884C0.00422452 7.80042 -0.188858 9.76082 0.187348 11.6521C0.563554 13.5434 1.49215 15.2807 2.85571 16.6443C4.21928 18.0079 5.95656 18.9365 7.84787 19.3127C9.73919 19.6889 11.6996 19.4958 13.4812 18.7578C15.2627 18.0199 16.7855 16.7702 17.8568 15.1668C18.9282 13.5634 19.5 11.6784 19.5 9.75C19.4973 7.16498 18.4692 4.68661 16.6413 2.85872C14.8134 1.03084 12.335 0.00272983 9.75 0ZM9.75 18C8.11831 18 6.52326 17.5161 5.16655 16.6096C3.80984 15.7031 2.75242 14.4146 2.128 12.9071C1.50358 11.3996 1.3402 9.74085 1.65853 8.1405C1.97685 6.54016 2.76259 5.07015 3.91637 3.91637C5.07016 2.76259 6.54017 1.97685 8.14051 1.65852C9.74085 1.34019 11.3997 1.50357 12.9071 2.12799C14.4146 2.75242 15.7031 3.80984 16.6096 5.16655C17.5161 6.52325 18 8.1183 18 9.75C17.9975 11.9373 17.1275 14.0343 15.5809 15.5809C14.0343 17.1275 11.9373 17.9975 9.75 18ZM14.25 9.75C14.25 9.94891 14.171 10.1397 14.0303 10.2803C13.8897 10.421 13.6989 10.5 13.5 10.5H10.5V13.5C10.5 13.6989 10.421 13.8897 10.2803 14.0303C10.1397 14.171 9.94892 14.25 9.75 14.25C9.55109 14.25 9.36033 14.171 9.21967 14.0303C9.07902 13.8897 9 13.6989 9 13.5V10.5H6C5.80109 10.5 5.61033 10.421 5.46967 10.2803C5.32902 10.1397 5.25 9.94891 5.25 9.75C5.25 9.55109 5.32902 9.36032 5.46967 9.21967C5.61033 9.07902 5.80109 9 6 9H9V6C9 5.80109 9.07902 5.61032 9.21967 5.46967C9.36033 5.32902 9.55109 5.25 9.75 5.25C9.94892 5.25 10.1397 5.32902 10.2803 5.46967C10.421 5.61032 10.5 5.80109 10.5 6V9H13.5C13.6989 9 13.8897 9.07902 14.0303 9.21967C14.171 9.36032 14.25 9.55109 14.25 9.75Z"
                      fill="#5383DA"
                    />
                  </svg>

                  <span className="text-sm font-medium">Add another room</span>
                </Button>
              </div>
            </div>
          </div>

          <HotelBookingAnicllarySection />
        </div>

        {/* RIGHT: Trip details */}
        <div>
          <HotelSummaryCard />
          <HotelFareRule />
          <HotelPriceBreakdown />

          <Button
            type="button"
            overrideClasses
            className="mt-6 mx-4 w-[calc(100%-2rem)] rounded-xl bg-[#2351A3] py-3 text-[16px] font-semibold text-[#F2F2F3] hover:brightness-95 active:brightness-90"
            onClick={() => {
              if (typeof onNext === "function") {
                onNext();
              }
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    </section>
  );
}
