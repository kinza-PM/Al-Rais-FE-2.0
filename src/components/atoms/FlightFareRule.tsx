export default function FLightFareRule({ trip }: { trip: any }) {
    const segment = trip?.journey?.[0]?.flightSegments?.[0];
    const fare = trip?.fare;

    const checked = segment?.baggageAllowance?.checkedInBaggage?.[0];
    const carryOn = segment?.baggageAllowance?.carryOnBaggage?.[0];

    const formatWeight = (b: any) => {
        if (!b) return null;
        const value = b.value ?? b.amount ?? "";
        const unit = b.unit ?? "";
        return `${value} ${unit}`.trim();
    };

    return (
        <div className="mt-4 rounded-xl border border-[#E4E4E7] bg-white">
            <div className="px-4 py-3 text-[16px] font-semibold text-[#0A0C0F]">
                Important fare rules
            </div>
            <div className="h-px bg-[#E4E4E7]" />

            <ul className="px-4 py-1">
                {checked ? (
                    <li className="flex items-center justify-between py-1">
                        <span className="text-[#3D495C] text-[12px]">Checked baggage</span>
                        <span className="text-[#0A0C0F] text-[15px] font-medium">{formatWeight(checked)}</span>
                    </li>
                ) : null}

                {carryOn && (
                    <li className="flex items-center justify-between py-1">
                        <span className="text-[#3D495C] text-[12px]">Carry on</span>
                        <span className="text-[#0A0C0F] text-[15px] font-medium">{formatWeight(carryOn)}</span>
                    </li>
                )}

                <li className="flex items-center justify-between py-1">
                    <span className="text-[#3D495C] text-[12px]">Refundable</span>
                    <span className="text-[#0A0C0F] text-[15px] font-medium">{fare?.fareType?.refundable ? "Yes" : "No"}</span>
                </li>

                {fare?.fareType?.farePreference && (
                    <li className="flex items-center justify-between py-1">
                        <span className="text-[#3D495C] text-[12px]">Fare preference</span>
                        <span className="text-[#0A0C0F] text-[15px] font-medium">{fare.fareType.farePreference}</span>
                    </li>
                )}
            </ul>
        </div>

        /* <div className="mt-4 rounded-xl border border-[#E4E4E7] bg-white">
        <div className="px-4 py-3 text-[16px] font-semibold text-[#0A0C0F]">
            Important fare rules
        </div>
        <div className="h-px bg-[#E4E4E7]" />
        
        <ul className="px-4 py-1">
            <li className="flex items-center justify-between py-1">
                <span className="text-[#3D495C] text-[12px]">Checked baggage</span>
                <span className="text-[#0A0C0F] text-[16px] font-medium">30 KGs</span>
            </li>
            <li className="flex items-center justify-between py-1">
                <span className="text-[#3D495C] text-[12px]">Change fee</span>
                <span className="text-[#0A0C0F] text-[16px] font-medium">$25</span>
            </li>
            <li className="flex items-center justify-between py-1">
                <span className="text-[#3D495C] text-[12px]">No show penalty</span>
                <span className="text-[#0A0C0F] text-[16px] font-medium">$120</span>
            </li>
            <li className="flex items-center justify-between py-1">
                <span className="text-[#3D495C] text-[12px]">Refund fee</span>
                <span className="text-[#0A0C0F] text-[16px] font-medium">$50</span>
            </li>
        </ul>
        </div> */
    );
}
