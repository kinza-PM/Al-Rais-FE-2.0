import Button from "../atoms/Button";
import HotelImage1 from "../../assets/images/HotelImage1.png";
import HotelImage2 from "../../assets/images/HotelImage2.png";
import HotelImage3 from "../../assets/images/HotelImage3.png";
import HotelImage4 from "../../assets/images/HotelImage4.png";

export default function HotelBookingETicketSetion() {
  const NotchDivider = () => (
    <div className="relative mt-7 mb-10">
      <div className="absolute inset-x-0 bottom-2">
        <div className="border-t border-dashed border-[#E4E4E7]" />
      </div>

      <span
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2"
        style={{ transform: "translate(-9px, -50%)" }}
      >
        <svg
          width="10"
          height="20"
          viewBox="0 0 10 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.5 0.512695C5.51429 0.772696 9.5 4.92101 9.5 10C9.5 15.079 5.51426 19.2263 0.5 19.4863V0.512695Z"
            fill="white"
            stroke="#C2CAD6"
          />
        </svg>
      </span>

      <span
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
        style={{ transform: "translate(9px, -50%)" }}
      >
        <svg
          width="10"
          height="20"
          viewBox="0 0 10 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.5 0.512695C4.48571 0.772696 0.5 4.92101 0.5 10C0.5 15.079 4.48574 19.2263 9.5 19.4863V0.512695Z"
            fill="white"
            stroke="#C2CAD6"
          />
        </svg>
      </span>
    </div>
  );

  return (
    <section className="mt-8 flex items-center justify-center px-4">
      <div className="w-full max-w-[580px]">
        <div className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm px-2 pt-2 pb-2">
          <div className="grid grid-cols-4 gap-2 auto-rows-fr">
            <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl">
              <img
                src={HotelImage1}
                alt="Hotel room"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="col-span-1 relative overflow-hidden rounded-2xl">
              <img
                src={HotelImage2}
                alt="Hotel interior"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="col-span-1 relative overflow-hidden rounded-2xl">
              <img
                src={HotelImage3}
                alt="Hotel pool"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="col-span-1 relative overflow-hidden rounded-2xl">
              <img
                src={HotelImage2}
                alt="Hotel interior"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="col-span-1 relative overflow-hidden rounded-2xl">
              <img
                src={HotelImage4}
                alt="Hotel pool"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center mt-10 text-[#0A0C0F]">
            <h2 className="text-lg font-bold">Your Trip is Booked!</h2>
            <h5 className="text-sm mt-3">
              Your booking confirmation number is: 78UI9953
            </h5>
            <p className="text-[#3D495C] text-xs mt-5 mb-3">
              We've sent a copy of this receipt to your email address.
            </p>
          </div>

          <NotchDivider />

          <div>
            <h3 className="text-base font-medium text-[#0A0C0F]">
              The Nishat Hotel
            </h3>
            <p className="text-xs text-[#3D495C]">
              Abdul Haque Road,Johar Town, 54600 Lahore, Pakistan
            </p>
          </div>

          <NotchDivider />

          <div className="grid grid-cols-12 items-start gap-4">
            <div className="col-span-4">
              <p className="text-lg font-semibold text-[#0A0C0F]">Check-in</p>
              <p className="mt-4 text-base font-medium text-[#0A0C0F]">
                2:00 PM – 12:00 AM
              </p>
              <p className="text-xs text-[#3D495C] mt-1">Fri, 22 August 2025</p>
            </div>

            <div className="col-span-4 flex justify-center mt-16">
              <div className="FlightDirection">
                <div className="hotelVisualGuid">
                  <div className="stopPoint"></div>

                  <div className="stopsDetail">
                    <span className="mb-5">Total stay: 1 night</span>
                  </div>

                  <div className="stopPoint"></div>
                </div>
              </div>
            </div>

            <div className="col-span-4 text-left">
              <p className="text-base font-semibold text-[#0A0C0F]">
                Check-out
              </p>
              <p className="mt-4 text-base font-medium text-[#0A0C0F]">
                2:00 PM – 12:00 AM
              </p>
              <p className="text-xs text-[#3D495C] mt-1">Sat, 23 August 2025</p>
            </div>
          </div>

          <NotchDivider />

          <div className="mt-4 mb-4 flex items-start justify-between gap-10">
            <div className="min-w-0">
              <div className="text-[13px] text-[#3D495C]">Guest name(s)</div>
              <div className="text-[15px] font-medium text-[#0A0C0F] break-words">
                Zeeshan Ahmad, Nafay Arshad
              </div>
            </div>

            {/* Fixed width blocks */}
            <div className="shrink-0">
              <div className="text-[13px] text-[#3D495C]">Travelers</div>
              <div className="text-[15px] font-medium text-[#0A0C0F]">
                02 Adults
              </div>
            </div>

            <div className="shrink-0">
              <div className="text-[13px] text-[#3D495C]">Rooms</div>
              <div className="text-[15px] font-medium text-[#0A0C0F]">02</div>
            </div>
          </div>

          <NotchDivider />

          <div>
            {Array.from({ length: 2 }).map((_, index) => {
              return (
                <div
                  className="mt-4 mb-4 flex items-center justify-between gap-10"
                  key={index}
                >
                  <div>
                    <div className="text-[13px] text-[#3D495C]">Room type</div>
                    <div className="text-[15px] font-medium text-[#0A0C0F]">
                      Royal Suite
                    </div>
                  </div>
                  <div>
                    <div className="text-[13px] text-[#3D495C]">
                      Your selected option
                    </div>
                    <div className="text-[15px] font-medium text-[#0A0C0F]">
                      Bed and Breakfast
                    </div>
                  </div>
                  <div>
                    <div className="text-[13px] text-[#3D495C]">
                      Cancellation policy
                    </div>
                    <div className="text-[15px] font-medium text-[#0A0C0F]">
                      100% of the price
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <NotchDivider />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.4fr]">
            <div className="grid grid-cols-[1fr_auto] items-center gap-y-2">
              <div className="text-xs text-[#3D495C]">Subtotal</div>
              <div className="text-[15px] font-medium text-[#0A0C0F] text-right">
                $120
              </div>

              <div className="text-xs text-[#3D495C]">Taxes and fees</div>
              <div className="text-[15px] font-medium text-[#0A0C0F] text-right">
                $60
              </div>

              <div className="text-xs text-[#3D495C]">Total Paid</div>
              <div className="text-[15px] font-medium text-[#0A0C0F] text-right">
                $180
              </div>
            </div>
          </div>

          <NotchDivider />

          <div className="pb-2 flex items-center justify-center gap-8">
            <Button
              type="button"
              overrideClasses
              className="h-11 px-12 rounded-lg bg-[#2351A3] border border-[#2351A3] text-[#F2F2F3] text-[15px] font-semibold"
            >
              Download as PDF
            </Button>
            <Button
              type="button"
              className="text-[15px] font-medium text-[#5383DA] hover:underline"
              overrideClasses
            >
              Manage bookings
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
