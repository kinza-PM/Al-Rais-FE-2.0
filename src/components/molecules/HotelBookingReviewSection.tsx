import HotelSummaryCard from "../atoms/HotelSummaryCard";
import HotelPriceBreakdown from "../atoms/HotelPriceBreakdown";
import HotelFareRule from "../atoms/HotelFareRule";
import Button from "../atoms/Button";
import React from "react";

const CardShell = ({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm">
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
      <h3 className="text-[15px] font-medium text-[#0A0C0F]">{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

const HeaderActions = ({
  onEdit,
  editLabel = "Edit",
}: {
  onEdit: () => void;
  editLabel?: string;
}) => (
  <Button
    type="button"
    onClick={onEdit}
    className="text-sm font-medium text-[#5383DA] hover:underline"
    overrideClasses
  >
    {editLabel}
  </Button>
);

const rooms = [
  {
    name: "Royal Suite",
    option: "Bed and Breakfast",
    maxGuests: "02 Adults",
    rooms: "Exceptionally clean",
    smoking: "Not allowed",
    pets: "Not allowed",
    cancellationCost: "$100",
  },
  {
    name: "Deluxe Room",
    option: "Half Board",
    maxGuests: "02 Adults",
    rooms: "Exceptionally clean",
    smoking: "Not allowed",
    pets: "Not allowed",
    cancellationCost: "$120",
  },
];

type HotelBookingReviewSectionProps = {
  onNext?: () => void;
  hotelDetail?: any;
  bookingInfo?: any;
  selectedRooms?: any[];
  totalPrice?: number;
  currency?: string;
};

export default function HotelBookingReviewSection({
  onNext,
  hotelDetail,
  bookingInfo,
  selectedRooms = [],
  totalPrice = 0,
  currency = "AED",
}: HotelBookingReviewSectionProps) {
  return (
    <section className="mx-auto max-w-full px-10 flight-booking-section">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr] flight-booking-grid">
        <div className="space-y-4">
          <CardShell
            title="Contact person details"
            right={<HeaderActions onEdit={() => {}} editLabel="Edit" />}
          >
            <div className="px-4 py-3">
              <dl className="grid grid-cols-2 gap-y-2">
                <dt className="text-xs text-[#3D495C]">Title</dt>
                <dd className="text-right">
                  <span className="text-sm text-[#0A0C0F] font-medium">
                    Mr.
                  </span>
                </dd>

                <dt className="text-xs text-[#3D495C]">Full Name</dt>
                <dd className="text-right">
                  <span className="text-sm text-[#0A0C0F] font-medium">
                    Zeeshan Ahmad
                  </span>
                </dd>
                <>
                  <dt className="text-xs text-[#3D495C]">Email</dt>
                  <dd className="text-right">
                    <span className="text-sm text-[#0A0C0F] font-medium">
                      zeeshan.ahmad@email.com
                    </span>
                  </dd>
                </>
                <>
                  <dt className="text-xs text-[#3D495C]">Phone</dt>
                  <dd className="text-right">+12 345 67890</dd>
                </>
              </dl>
            </div>
          </CardShell>

          <CardShell
            title="Guests details"
            right={<HeaderActions onEdit={() => {}} editLabel="Edit" />}
          >
            <div className="px-4 py-3">
              <dl className="grid grid-cols-2 gap-y-2">
                <dt className="text-xs text-[#3D495C]">
                  Full name and age group
                </dt>
                <dd className="text-right">
                  <span className="text-sm text-[#0A0C0F] font-medium">
                    Zeeshan Ahmad (Adult)
                  </span>
                </dd>

                <dt className="text-xs text-[#3D495C]">
                  Full name and age group
                </dt>
                <dd className="text-right">
                  <span className="text-sm text-[#0A0C0F] font-medium">
                    Nafay Arsahd (Adult)
                  </span>
                </dd>
              </dl>
            </div>
          </CardShell>

          <CardShell
            title="Your rooms"
            right={
              <HeaderActions onEdit={() => {}} editLabel="View all details" />
            }
          >
            <div className="px-4 py-3">
              {rooms.map((room, index) => {
                return (
                  <div
                    key={index}
                    className={`${index > rooms.length - 1 ? "" : "mb-5"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold text-[#0A0C0F]">
                          {room.name} •{" "}
                        </h4>
                        <Button
                          className="text-sm font-medium text-[#FF5270] bg-transparent border-0 cursor-pointer"
                          overrideClasses
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-x-8">
                      <div className="flex-[1.5]">
                        <div className="text-[#3D495C] text-xs">
                          Room option
                        </div>
                        <div className="text-[#0A0C0F] text-sm font-medium">
                          {room.option}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="text-[#3D495C] text-xs">
                          Max no. of guests/room
                        </div>
                        <div className="text-[#0A0C0F] text-sm font-medium">
                          {room.maxGuests}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="text-[#3D495C] text-xs">Rooms</div>
                        <div className="text-[#0A0C0F] text-sm font-medium">
                          {room.rooms}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="text-[#3D495C] text-xs">Smoking</div>
                        <div className="text-[#0A0C0F] text-sm font-medium">
                          {room.smoking}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="text-[#3D495C] text-xs">Pets</div>
                        <div className="text-[#0A0C0F] text-sm font-medium">
                          {room.pets}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="text-[#3D495C] text-xs">
                          Cancellation cost
                        </div>
                        <div className="text-[#0A0C0F] text-sm font-semibold">
                          {room.cancellationCost}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardShell>

          <CardShell
            title="Enhancements"
            right={<HeaderActions onEdit={() => {}} editLabel="Change" />}
          >
            <div className="px-4 py-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-xl bg-[#A7C0EC] flex items-center justify-center flex-shrink-0">
                  <AirportShuttleIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-[#0A0C0F]">
                    Airport shuttle (Free)
                  </h4>
                </div>
              </div>
            </div>
          </CardShell>

          <CardShell
            title="Special requests"
            right={<HeaderActions onEdit={() => {}} editLabel="Edit" />}
          >
            <div className="px-4 py-3">
              <p className="text-xs text-[#3D495C]">
                We would love to know if it's possible to arrange a small
                surprise, such as a bottle of sparkling wine, some chocolates,
                or a small cake to be placed in the room upon our arrival. We
                are also happy to pay for any additional costs this may incur.
                <br />
                <br />
                Additionally, we would appreciate a room on a higher floor with
                a nice view, if available, to make our stay even more special.
              </p>
            </div>
          </CardShell>

          <CardShell
            title="Your arrival time"
            right={<HeaderActions onEdit={() => {}} editLabel="Edit" />}
          >
            <div className="px-4 py-3">
              <dl className="grid grid-cols-2 gap-y-2">
                <dt className="text-xs text-[#3D495C]">Time and date</dt>
                <dd className="text-right">
                  <span className="text-sm text-[#0A0C0F] font-medium">
                    9:30 PM, 27th August 2025
                  </span>
                </dd>
              </dl>
            </div>
          </CardShell>
        </div>

        {/* RIGHT: Trip details */}
        <div>
          <HotelSummaryCard
            hotelDetail={hotelDetail}
            bookingInfo={bookingInfo}
          />
          <HotelFareRule
            selectedRooms={selectedRooms}
            totalPrice={totalPrice}
            currency={currency}
            hotelDetail={hotelDetail}
          />
          <HotelPriceBreakdown totalPrice={totalPrice} currency={currency} />
        </div>
      </div>

      <div className="mt-5 flex justify-center w-full">
        <Button
          type="button"
          className="h-10 w-full max-w-lg rounded-lg bg-[#2351A3] px-8 text-[15px] font-semibold text-[#F2F2F3]"
          overrideClasses
          onClick={() => {
            if (typeof onNext === "function") {
              onNext();
            }
          }}
        >
          Continue to payment
        </Button>
      </div>
    </section>
  );
}

const AirportShuttleIcon = () => {
  return (
    <svg
      width="30"
      height="24"
      viewBox="0 0 30 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 0H8C6.93913 0 5.92172 0.421427 5.17157 1.17157C4.42143 1.92172 4 2.93913 4 4V22C4 22.5304 4.21071 23.0391 4.58579 23.4142C4.96086 23.7893 5.46957 24 6 24H9C9.53043 24 10.0391 23.7893 10.4142 23.4142C10.7893 23.0391 11 22.5304 11 22V20H19V22C19 22.5304 19.2107 23.0391 19.5858 23.4142C19.9609 23.7893 20.4696 24 21 24H24C24.5304 24 25.0391 23.7893 25.4142 23.4142C25.7893 23.0391 26 22.5304 26 22V4C26 2.93913 25.5786 1.92172 24.8284 1.17157C24.0783 0.421427 23.0609 0 22 0ZM6 18V11H24V18H6ZM6 6H24V9H6V6ZM8 2H22C22.5304 2 23.0391 2.21071 23.4142 2.58579C23.7893 2.96086 24 3.46957 24 4H6C6 3.46957 6.21071 2.96086 6.58579 2.58579C6.96086 2.21071 7.46957 2 8 2ZM9 22H6V20H9V22ZM21 22V20H24V22H21ZM12 14.5C12 14.7967 11.912 15.0867 11.7472 15.3334C11.5824 15.58 11.3481 15.7723 11.074 15.8858C10.7999 15.9993 10.4983 16.0291 10.2074 15.9712C9.91639 15.9133 9.64912 15.7704 9.43934 15.5607C9.22956 15.3509 9.0867 15.0836 9.02882 14.7926C8.97094 14.5017 9.00065 14.2001 9.11418 13.926C9.22771 13.6519 9.41997 13.4176 9.66665 13.2528C9.91332 13.088 10.2033 13 10.5 13C10.8978 13 11.2794 13.158 11.5607 13.4393C11.842 13.7206 12 14.1022 12 14.5ZM21 14.5C21 14.7967 20.912 15.0867 20.7472 15.3334C20.5824 15.58 20.3481 15.7723 20.074 15.8858C19.7999 15.9993 19.4983 16.0291 19.2074 15.9712C18.9164 15.9133 18.6491 15.7704 18.4393 15.5607C18.2296 15.3509 18.0867 15.0836 18.0288 14.7926C17.9709 14.5017 18.0007 14.2001 18.1142 13.926C18.2277 13.6519 18.42 13.4176 18.6666 13.2528C18.9133 13.088 19.2033 13 19.5 13C19.8978 13 20.2794 13.158 20.5607 13.4393C20.842 13.7206 21 14.1022 21 14.5ZM30 6V9C30 9.26522 29.8946 9.51957 29.7071 9.70711C29.5196 9.89464 29.2652 10 29 10C28.7348 10 28.4804 9.89464 28.2929 9.70711C28.1054 9.51957 28 9.26522 28 9V6C28 5.73478 28.1054 5.48043 28.2929 5.29289C28.4804 5.10536 28.7348 5 29 5C29.2652 5 29.5196 5.10536 29.7071 5.29289C29.8946 5.48043 30 5.73478 30 6ZM2 6V9C2 9.26522 1.89464 9.51957 1.70711 9.70711C1.51957 9.89464 1.26522 10 1 10C0.734784 10 0.48043 9.89464 0.292893 9.70711C0.105357 9.51957 0 9.26522 0 9V6C0 5.73478 0.105357 5.48043 0.292893 5.29289C0.48043 5.10536 0.734784 5 1 5C1.26522 5 1.51957 5.10536 1.70711 5.29289C1.89464 5.48043 2 5.73478 2 6Z"
        fill="#1A3C7A"
      />
    </svg>
  );
};
