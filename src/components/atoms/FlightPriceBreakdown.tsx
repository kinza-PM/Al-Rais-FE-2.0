type ChevronProps = { open: boolean; onClick: () => void; className?: string };

type FlightBookingBaggageSectionProps = {
    CardChevron: React.ComponentType<ChevronProps>;
    open: boolean;
    onToggleOpen: () => void;
};

export default function FLightPriceBreakdown({ CardChevron, open, onToggleOpen }: FlightBookingBaggageSectionProps) {
    return (
        <div className="mt-4 rounded-xl border border-[#E4E4E7] bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
                <div className="text-[16px] font-semibold text-[#0A0C0F]">Price breakdown</div>
                <CardChevron open={open} onClick={onToggleOpen} />
            </div>

            <div
                className={[
                    "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                ].join(" ")}
            >
                <div className="overflow-hidden">
                    <div className="px-4 py-3 text-[13px] leading-6">
                        <div className="text-[14px] font-semibold text-[#0A0C0F]">Passengers fares</div>

                        <div className="mt-1">
                            <div className="text-[12px] font-medium text-[#0A0C0F]">2 Adults</div>
                            <ul className="mt-1 space-y-1 text-[12px] pl-3">
                                <li className="flex items-center justify-between">
                                    <span className="text-[#3D495C]">Base fare each</span>
                                    <span className="font-semibold text-[#0A0C0F]">$300</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-[#3D495C]">taxes and fees each</span>
                                    <span className="font-semibold text-[#0A0C0F]">$100</span>
                                </li>
                                <li className="flex items-center justify-between pt-1">
                                    <span className="text-[#3D495C]">Subtotal</span>
                                    <span className="font-semibold text-[#0A0C0F]">$800</span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-3">
                            <div className="text-[12px] font-medium text-[#0A0C0F]">1 Child</div>
                            <ul className="mt-1 space-y-1 text-[12px] pl-3">
                                <li className="flex items-center justify-between">
                                    <span className="text-[#3D495C]">Base fare</span>
                                    <span className="font-semibold text-[#0A0C0F]">$250</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-[#3D495C]">taxes and fees</span>
                                    <span className="font-semibold text-[#0A0C0F]">$80</span>
                                </li>
                                <li className="flex items-center justify-between pt-1">
                                    <span className="text-[#3D495C]">Subtotal</span>
                                    <span className="font-semibold text-[#0A0C0F]">$330</span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-3">
                            <div className="text-[12px] font-medium text-[#0A0C0F]">1 Infant</div>
                            <ul className="mt-1 space-y-1 text-[12px] pl-3">
                                <li className="flex items-center justify-between">
                                    <span className="text-[#3D495C]">Base fare</span>
                                    <span className="font-semibold text-[#0A0C0F]">$25</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-[#3D495C]">taxes and fees</span>
                                    <span className="font-semibold text-[#0A0C0F]">$10</span>
                                </li>
                                <li className="flex items-center justify-between pt-1">
                                    <span className="text-[#3D495C]">Subtotal</span>
                                    <span className="font-semibold text-[#0A0C0F]">$35</span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-5 text-[13px] font-semibold text-[#0A0C0F]">Enhancements</div>

                        <div className="mt-1">
                            <div className="text-[12px] font-medium text-[#0A0C0F]">Baggage</div>
                            <ul className="mt-1 space-y-1 text-[12px] pl-3">
                                <li className="flex items-center justify-between">
                                    <span className="text-[#3D495C]">01 - 20 KGs checked bag</span>
                                    <span className="font-semibold text-[#0A0C0F]">$32</span>
                                </li>
                                <li className="flex items-center justify-between pt-1">
                                    <span className="text-[#3D495C]">Subtotal</span>
                                    <span className="font-semibold text-[#0A0C0F]">$32</span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-3">
                            <div className="text-[12px] font-medium text-[#0A0C0F]">Meals &amp; drinks</div>
                            <ul className="mt-1 space-y-1 text-[12px] pl-3">
                                <li className="flex items-center justify-between">
                                    <span className="text-[#3D495C]">(1x) Vegan burger</span>
                                    <span className="font-semibold text-[#0A0C0F]">$15.75</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-[#3D495C]">Iced green tea</span>
                                    <span className="font-semibold text-[#0A0C0F]">$4.50</span>
                                </li>
                                <li className="flex items-center justify-between pt-1">
                                    <span className="text-[#3D495C]">Subtotal</span>
                                    <span className="font-semibold text-[#0A0C0F]">$20.25</span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-3">
                            <div className="text-[12px] font-medium text-[#0A0C0F]">Comfort &amp; entertainment</div>
                            <ul className="mt-1 space-y-1 text-[12px] pl-3">
                                <li className="flex items-center justify-between">
                                    <span className="text-[#3D495C]">Faster wi-fi (10 MBPs)</span>
                                    <span className="font-semibold text-[#0A0C0F]">$22.50</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-[#3D495C]">Newly released movies selection</span>
                                    <span className="font-semibold text-[#0A0C0F]">$50</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-[#3D495C]">Spotify trending music selection</span>
                                    <span className="font-semibold text-[#0A0C0F]">$40</span>
                                </li>
                                <li className="flex items-center justify-between pt-1">
                                    <span className="text-[#3D495C]">Subtotal</span>
                                    <span className="font-semibold text-[#0A0C0F]">$112.50</span>
                                </li>
                            </ul>
                        </div>


                    </div>

                </div>
            </div>

            {open && (<div className="h-px bg-[#E4E4E7]" />)}

            <div className="flex items-center justify-between px-4 py-2">
                <span className="text-[12px] text-[#3D495C]">Total</span>
                <span className="text-[14px] font-semibold text-[#0A0C0F]">$1,329.75</span>
            </div>
        </div>
    )
}