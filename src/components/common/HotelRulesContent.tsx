export default function HotelRulesContent({ separatorMargin = "mx-5" }) {
  return (
    <div className="rounded-2xl">
      <div>
        <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">Check-in</h3>
        <Separator marginX={separatorMargin} />
        <p className="text-sm font-normal text-[#3D495C] mb-2 mt-3">
          From <span className="text-[#0A0C0F]">2:00 PM</span> to{" "}
          <span className="text-[#0A0C0F]">12:00 AM</span>
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

      <div>
        <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">
          Cancellation/Prepayment
        </h3>
        <Separator marginX={separatorMargin} />
        <p className="text-xs font-normal text-[#3D495C] mb-2 mt-3">
          Cancellation and prepayment policies vary according to accommodation
          type.
        </p>
      </div>

      <Separator marginX={separatorMargin} />

      <div>
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

      <Separator marginX={separatorMargin} />

      <div>
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
      </div>

      <Separator marginX={separatorMargin} />

      <div>
        <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">
          Age restriction
        </h3>
        <Separator marginX={separatorMargin} />
        <p className="text-xs text-[#3D495C]">
          The minimum age for check-in is 18
        </p>
      </div>

      <Separator marginX={separatorMargin} />

      <div>
        <h3 className="text-sm font-medium text-[#0A0C0F] mb-3">Pets</h3>
        <Separator marginX={separatorMargin} />
        <p className="text-xs text-[#3D495C]">Pets are not allowed</p>
      </div>
    </div>
  );
}

const Separator = ({ marginX = "mx-5" }) => {
  return <div className={`border-t border-[#E4E4E7] -${marginX} mt-4 mb-4`} />;
};
