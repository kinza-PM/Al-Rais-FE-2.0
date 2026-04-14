import { formatDate } from "../../utils/helpers";

type HotelRulesContentProps = {
  separatorMargin?: string;
  hotelDetail?: any;
  selectedRooms?: any[];
  currency?: string;
  // totalPrice?: number;
};

export default function HotelRulesContent({
  separatorMargin = "mx-5",
  hotelDetail,
  selectedRooms = [],
  currency = "AED",
  // totalPrice = 0,
}: HotelRulesContentProps) {
  const checkInTime = hotelDetail?.checkInTime || "";
  const checkOutTime = hotelDetail?.checkOutTime || "";
  const childPolicy = hotelDetail?.childPolicy || "";
  return (
    <div className="rounded-2xl">
      <div>
        <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">Check-in</h3>
        <Separator marginX={separatorMargin} />
        <p className="text-sm font-normal text-[#3D495C] mb-2 mt-3">
          {checkInTime && (
            <>
              From <span className="text-[#0A0C0F]">{checkInTime}</span>{" "}
            </>
          )}
          {checkInTime && (
            <>
              to <span className="text-[#0A0C0F]">{checkOutTime}</span>
            </>
          )}
        </p>
        <p className="text-xs text-[#3D495C] leading-relaxed max-w-md">
          Guests are required to show a photo ID and credit card at check-in.
          You need to let the property know what time you'll be arriving in
          advance.
        </p>
      </div>

      <Separator marginX={separatorMargin} />

      <div>
        <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">Check-out</h3>
        <Separator marginX={separatorMargin} />
        <p className="text-sm font-normal text-[#3D495C] mb-2 mt-3">
          Available 24 hours
        </p>
      </div>

      <Separator marginX={separatorMargin} />

      {/* <div>
        <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">
          Cancellation/Prepayment
        </h3>
        <Separator marginX={separatorMargin} />
        <p className="text-xs font-normal text-[#3D495C] mb-2 mt-3">
          Cancellation and prepayment policies vary according to accommodation
          type.
        </p>
      </div> */}
      <div>
        <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">
          Cancellation / Prepayment
        </h3>
        <Separator marginX={separatorMargin} />

        <div className="mt-3 space-y-4">
          {selectedRooms.length === 0 && (
            <p className="text-xs text-[#3D495C]">
              Cancellation and prepayment policies vary according to
              accommodation type.
            </p>
          )}

          {selectedRooms.map((selectedRoom, index) => {
            const room = selectedRoom?.room;
            const ratePlan = room?.ratePlan;
            const roomRate = room?.roomRate;
            const isNonRefundable =
              ratePlan?.cancelPolicyIndicator === "Non-Refundable";
            const roomTotalPrice =
              (roomRate?.netAmount || 0) * (selectedRoom?.count || 1);

            return (
              <div
                key={selectedRoom?.roomKey || index}
                className={`${
                  selectedRooms.length > 1
                    ? "p-3 rounded-xl border border-[#E4E4E7] bg-[#F8F9FB]"
                    : ""
                }`}
              >
                {/* Room name — multiple rooms hon to show */}
                {selectedRooms.length > 1 && (
                  <p className="text-xs font-semibold text-[#0A0C0F] mb-2">
                    Room {index + 1}:{" "}
                    {room?.roomTypeName || `Room ${index + 1}`}
                  </p>
                )}

                <div className="space-y-1">
                  <p className="text-xs text-[#3D495C]">
                    Policy:{" "}
                    <span
                      className={`font-medium ${
                        isNonRefundable ? "text-[#EA0029]" : "text-[#1A7F4B]"
                      }`}
                    >
                      {ratePlan?.cancelPolicyIndicator || "See property policy"}
                    </span>
                  </p>

                  {isNonRefundable && roomTotalPrice > 0 && (
                    <p className="text-xs text-[#3D495C]">
                      Cancellation fee:{" "}
                      <span className="font-medium text-[#EA0029]">
                        {currency} {roomTotalPrice.toFixed(2)}
                      </span>
                    </p>
                  )}

                  {ratePlan?.lastCancellationDate && (
                    <p className="text-xs text-[#3D495C]">
                      Last free cancellation:{" "}
                      <span className="font-medium text-[#0A0C0F]">
                        {formatDate(ratePlan.lastCancellationDate)}
                      </span>
                    </p>
                  )}

                  {/* {ratePlan?.meal && (
                    <p className="text-xs text-[#3D495C]">
                      Meal plan:{" "}
                      <span className="font-medium text-[#0A0C0F]">
                        {ratePlan.meal}
                      </span>
                    </p>
                  )} */}
                </div>
              </div>
            );
          })}

          {/* Multiple rooms ho to total cancellation fee */}
          {/* {selectedRooms.length > 1 && totalPrice > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-[#E4E4E7]">
              <span className="text-xs text-[#3D495C]">
                Total cancellation fee (if applicable)
              </span>
              <span className="text-sm font-semibold text-[#EA0029]">
                {currency} {totalPrice.toFixed(2)}
              </span>
            </div>
          )} */}
        </div>
      </div>

      <Separator marginX={separatorMargin} />

      {/* <div>
        <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">
          Refundable damage deposit
        </h3>
        <Separator marginX={separatorMargin} />
        <p className="text-xs text-[#3D495C] leading-relaxed max-w-lg">
          A damage deposit of PKR 5,000 is required on arrival. This will be
          collected by credit card. You should be reimbursed on check-out. Your
          deposit will be refunded in full by credit card, subject to an
          inspection of the property.
        </p>
      </div>

      <Separator marginX={separatorMargin} /> */}

      {/* <div>
        <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">
          Children & Beds
        </h3>
        <Separator marginX={separatorMargin} />
        <h4 className="text-xs font-medium text-[#0A0C0F] mb-2">
          Child policies
        </h4>
        <div className="text-xs text-[#3D495C] leading-relaxed">
          <p className="mb-3">Children of all ages are welcome.</p>
          <p className="mb-3">
            Children 16 and above will be charged as adults at this property.
          </p>
          <p className="mb-5">
            To see correct prices and occupancy info, add the number and ages of
            children in your group to your search.
          </p>
        </div>

        <h4 className="text-xs font-medium text-[#0A0C0F] mb-2">
          Crib and extra bed policies
        </h4>
        <div className="space-y-1 mb-3">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-[#3D495C]">Extra bed upon request</p>
            <p className="text-sm text-[#0A0C0F] font-medium">
              PKR 2,500/child, per night
            </p>
          </div>
          <div className="flex justify-between items-start">
            <p className="text-xs text-[#3D495C]">Crib upon request</p>
            <p className="text-sm text-[#0A0C0F] font-medium">
              PKR 2,000/child, per night
            </p>
          </div>
        </div>
        <div className="text-xs text-[#3D495C]">
          <p className="mb-3">
            Prices for cribs and extra beds aren't included in the total price.
          </p>
          <p className="mb-3">
            They'll have to be paid for separately during your stay.
          </p>
          <p className="mb-3">
            The number of extra beds and cribs allowed depends on the option you
            choose. Check your selected option for more info.
          </p>
          <p>All cribs and extra beds are subject to availability.</p>
        </div>
      </div> */}
      <div>
        <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">
          Children & Beds
        </h3>
        <Separator marginX={separatorMargin} />
        <p className="text-xs text-[#3D495C] leading-relaxed mt-3">
          {childPolicy ||
            "Children of all ages are welcome. Please check with the property for specific policies."}
        </p>
      </div>

      {/* <Separator marginX={separatorMargin} /> */}

      {/* <div>
        <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">
          Age restriction
        </h3>
        <Separator marginX={separatorMargin} />
        <p className="text-xs text-[#3D495C]">
          The minimum age for check-in is 18
        </p>
      </div>

      <Separator marginX={separatorMargin} /> */}

      {/* <div>
        <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">Pets</h3>
        <Separator marginX={separatorMargin} />
        <p className="text-xs text-[#3D495C]">Pets are not allowed</p>
      </div> */}
    </div>
  );
}

const Separator = ({ marginX = "mx-5" }) => {
  return <div className={`border-t border-[#E4E4E7] -${marginX} mt-4 mb-4`} />;
};
