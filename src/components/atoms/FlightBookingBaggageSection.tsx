import EmirateLogo from "../../assets/images/emirates.png";
import AirIndia from "../../assets/images/air-india.png";
import baggage from "../../assets/svgs/enhance-baggage.svg";

type ChevronProps = { open: boolean; onClick: () => void; className?: string };
type SwitchProps = { checked: boolean; onChange: () => void; className?: string };

type FlightBookingBaggageSectionProps = {
    CardChevron: React.ComponentType<ChevronProps>;
    FormSwitch: React.ComponentType<SwitchProps>;
    open: boolean;
    onToggleOpen: () => void;
    depChecked: boolean;
    retChecked: boolean;
    onToggleDep: () => void;
    onToggleRet: () => void;
};

export default function FlightBookingBaggageSection({
    CardChevron,
    FormSwitch,
    open,
    onToggleOpen,
    depChecked,
    retChecked,
    onToggleDep,
    onToggleRet,
}: FlightBookingBaggageSectionProps) {
    return (
        <div className="px-3 pb-3 mt-3">
            <div className="rounded-xl border border-[#E4E4E7] overflow-hidden">
                <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A7C0EC]">
                            <img src={baggage} alt="baggage" className="w-6 h-6"/>
                        </div>
                        <div>
                            <div className="text-[15px] font-medium text-[#0A0C0F]">Baggage</div>
                            <div className="text-[12px] text-[#3D495C]">
                                Add a 20kg checked bag to avoid carry-on restrictions.
                            </div>
                        </div>
                    </div>
                    <CardChevron open={open} onClick={onToggleOpen} />
                </button>

                {open && <div className="h-px bg-[#E4E4E7]" />}

                {open && (
                    <div>
                        <div className="px-4 py-3">
                            <div className="mb-2 text-[15px] font-semibold text-[#0A0C0F]">
                                Departure flight
                            </div>

                            <div className="grid grid-cols-[minmax(220px,1.1fr)_auto_auto_1fr_auto] items-center gap-8 enhance-baggage-grid">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={EmirateLogo}
                                        alt="Emirates Airlines"
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="text-[14px] font-medium text-[#0A0C0F]">Emirates Airlines</div>
                                        <div className="text-[12px] text-[#3D495C]">EK 1234 – Economy class</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[12px] text-[#3D495C]">Passenger</div>
                                    <div className="text-[#0A0C0F] font-medium text-[14px]">01 Adult</div>
                                </div>

                                <div>
                                    <div className="text-[12px] text-[#3D495C]">Upgrade cost</div>
                                    <div className="text-[#0A0C0F]">
                                        <span className="font-bold text-[15px]">$15.00</span>
                                        <span className="text-[13px]">/per item</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[#3D495C] text-[12px] ">Added to purchase</div>
                                    <div className="text-[#0A0C0F] text-[14px] font-medium">
                                        01 · 20kg checked bag
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <FormSwitch checked={depChecked} onChange={onToggleDep} className="ml-auto" />
                                </div>
                            </div>
                        </div>

                        <div className="px-4 py-3">
                            <div className="mb-2 text-[15px] font-semibold text-[#0A0C0F]">
                                Return flight
                            </div>

                            <div className="grid grid-cols-[minmax(220px,1.1fr)_auto_auto_1fr_auto] items-center gap-8 enhance-baggage-grid">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={AirIndia}
                                        alt="Air India"
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="text-[14px] font-medium text-[#0A0C0F]">Air India</div>
                                        <div className="text-[12px] text-[#3D495C]">AI 1452 – Economy class</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[12px] text-[#3D495C]">Passenger</div>
                                    <div className="text-[#0A0C0F] font-medium text-[14px]">01 Adult</div>
                                </div>

                                <div>
                                    <div className="text-[12px] text-[#3D495C]">Upgrade cost</div>
                                    <div className="text-[#0A0C0F]">
                                        <span className="font-bold text-[15px]">$12.00</span>
                                        <span className="text-[13px]">/per item</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[#3D495C] text-[12px] ">Added to purchase</div>
                                    <div className="text-[#0A0C0F] text-[14px] font-medium">
                                        -
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <FormSwitch checked={retChecked} onChange={onToggleRet} className="ml-auto" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}