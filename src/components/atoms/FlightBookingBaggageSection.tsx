import EmirateLogo from "../../assets/images/emirates.png";
import AirIndia from "../../assets/images/air-india.png";

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
                            <svg width="20" height="25" viewBox="0 0 20 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 11V23C7 23.2652 6.89464 23.5196 6.70711 23.7071C6.51957 23.8946 6.26522 24 6 24C5.73478 24 5.48043 23.8946 5.29289 23.7071C5.10536 23.5196 5 23.2652 5 23V11C5 10.7348 5.10536 10.4804 5.29289 10.2929C5.48043 10.1054 5.73478 10 6 10C6.26522 10 6.51957 10.1054 6.70711 10.2929C6.89464 10.4804 7 10.7348 7 11ZM10 10C9.73478 10 9.48043 10.1054 9.29289 10.2929C9.10536 10.4804 9 10.7348 9 11V23C9 23.2652 9.10536 23.5196 9.29289 23.7071C9.48043 23.8946 9.73478 24 10 24C10.2652 24 10.5196 23.8946 10.7071 23.7071C10.8946 23.5196 11 23.2652 11 23V11C11 10.7348 10.8946 10.4804 10.7071 10.2929C10.5196 10.1054 10.2652 10 10 10ZM14 10C13.7348 10 13.4804 10.1054 13.2929 10.2929C13.1054 10.4804 13 10.7348 13 11V23C13 23.2652 13.1054 23.5196 13.2929 23.7071C13.4804 23.8946 13.7348 24 14 24C14.2652 24 14.5196 23.8946 14.7071 23.7071C14.8946 23.5196 15 23.2652 15 23V11C15 10.7348 14.8946 10.4804 14.7071 10.2929C14.5196 10.1054 14.2652 10 14 10ZM20 8V26C20 26.5304 19.7893 27.0391 19.4142 27.4142C19.0391 27.7893 18.5304 28 18 28H16V30C16 30.2652 15.8946 30.5196 15.7071 30.7071C15.5196 30.8946 15.2652 31 15 31C14.7348 31 14.4804 30.8946 14.2929 30.7071C14.1054 30.5196 14 30.2652 14 30V28H6V30C6 30.2652 5.89464 30.5196 5.70711 30.7071C5.51957 30.8946 5.26522 31 5 31C4.73478 31 4.48043 30.8946 4.29289 30.7071C4.10536 30.5196 4 30.2652 4 30V28H2C1.46957 28 0.960859 27.7893 0.585786 27.4142C0.210714 27.0391 0 26.5304 0 26V8C0 7.46957 0.210714 6.96086 0.585786 6.58579C0.960859 6.21071 1.46957 6 2 6H5V3C5 2.20435 5.31607 1.44129 5.87868 0.87868C6.44129 0.31607 7.20435 0 8 0L12 0C12.7956 0 13.5587 0.31607 14.1213 0.87868C14.6839 1.44129 15 2.20435 15 3V6H18C18.5304 6 19.0391 6.21071 19.4142 6.58579C19.7893 6.96086 20 7.46957 20 8ZM7 6H13V3C13 2.73478 12.8946 2.48043 12.7071 2.29289C12.5196 2.10536 12.2652 2 12 2H8C7.73478 2 7.48043 2.10536 7.29289 2.29289C7.10536 2.48043 7 2.73478 7 3V6ZM18 26V8H2V26H18Z" fill="#1A3C7A" />
                            </svg>
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