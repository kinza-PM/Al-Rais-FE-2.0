import HotelImage1 from "../../assets/images/HotelImage1.png";
import HotelImage2 from "../../assets/images/HotelImage2.png";
import HotelImage3 from "../../assets/images/HotelImage3.png";
import HotelImage4 from "../../assets/images/HotelImage4.png";

type HotelSummaryCardProps = {
  paymentPage?: boolean;
};

export default function HotelSummaryCard({
  paymentPage = false,
}: HotelSummaryCardProps) {
  return (
    <div>
      <div className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm p-2 mb-4">
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

        <div className="mt-4 mb-2">
          <h3 className="text-base font-medium text-[#0A0C0F]">
            The Nishat Hotel
          </h3>
          <p className="text-xs text-[#3D495C]">
            Abdul Haque Road,Johar Town, 54600 Lahore, Pakistan
          </p>
        </div>

        {paymentPage && (
          <>
            <div className="border-t border-[#E4E4E7] mt-4 -mx-2"></div>
            <HotelBookingDetailContent
              paymentPage={paymentPage}
              borderClass="-mx-2"
            />
          </>
        )}
      </div>
      {!paymentPage && (
        <div className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E4E4E7]">
            <h3 className="text-[15px] font-medium text-[#0A0C0F]">
              Booking details
            </h3>
          </div>

          <HotelBookingDetailContent paymentPage={paymentPage} />
        </div>
      )}
    </div>
  );
}

const HotelBookingDetailContent = ({
  borderClass = "",
  paymentPage = false,
}) => {
  return (
    <>
      <div className={paymentPage ? "px-2 py-3" : "px-4 py-6"}>
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
            <p className="text-base font-semibold text-[#0A0C0F]">Check-out</p>
            <p className="mt-4 text-base font-medium text-[#0A0C0F]">
              2:00 PM – 12:00 AM
            </p>
            <p className="text-xs text-[#3D495C] mt-1">Sat, 23 August 2025</p>
          </div>
        </div>
      </div>

      <div className={`border-t border-[#E4E4E7] ${borderClass}`}></div>

      <div className={paymentPage ? "px-2 pt-6 pb-1" : "px-4 pt-6 pb-3"}>
        <p className="text-xs text-[#3D495C]">Your selection</p>
        <p className="text-base font-medium text-[#0A0C0F]">
          02 rooms for 02 adults
        </p>
      </div>
    </>
  );
};
