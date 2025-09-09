export default function FLightFareRule() {
    return (
        <div className="mt-4 rounded-xl border border-[#E4E4E7] bg-white">
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
        </div>
    )
}