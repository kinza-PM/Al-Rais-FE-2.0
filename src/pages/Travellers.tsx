import { useState } from "react";
import EmiratesRectangular from '../assets/images/emirates_rectangular.png';
import Plane from '../assets/images/plane.png';
import TravellersPassengerDetail from "../components/molecules/TravellersPassengerDetail";
import TravellersPaymentSection from "../components/molecules/TravellersPaymentSection";
import TravellersSeatsSection from "../components/molecules/TravellersSeatsSection";
import { Button } from "../components";

type TabKey = "passenger" | "seats" | "payment";

const Travellers = () => {
    const [activeTab, setActiveTab] = useState<TabKey>("passenger");
    const [showBreakup, setShowBreakup] = useState(false);
    const [showBaggage, setShowBaggage] = useState(false);

    return (
        <section className="mx-auto mt-8 max-w-6xl px-4 md:px-0">
            {/* ROW 1: BOTH CARDS (equal height) */}
            <div className="grid gap-4 md:grid-cols-[2fr_1fr] items-stretch">
                {/* LEFT: Itinerary card */}
                <div className="h-full overflow-hidden rounded-xl border border-[#E7ECF2] bg-white shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
                    <div className="flex h-[48px] items-center justify-between bg-[#0563C1] px-5">
                        <div className="flex items-center">
                            <div className="inline-flex h-8 w-[80px] items-center justify-center rounded-md bg-white px-2 shadow-sm ring-1 ring-black/5">
                                <img src={EmiratesRectangular} alt="emirates logo" className="h-[20px] w-[50px] object-contain" />
                            </div>
                        </div>
                        <span className="text-[18px] font-bold text-white tracking-[0.01em]">Economy Class</span>
                    </div>

                    <div className="py-6">
                        <div className="grid items-start md:grid-cols-3">
                            {/* depart */}
                            <div className="flex flex-col items-center">
                                <p className="mb-1 text-[14px] text-[#969696]">Depart</p>
                                <p className="tabular-nums text-[24px] font-bold leading-[32px] text-[#3D3D3D]">10:30am</p>
                                <p className="mt-1 text-[14px] font-bold text-[#3D3D3D]">5 May 2024</p>
                                <p className="mt-3 text-[14px] text-[#3D3D3D]">Boston International Airport</p>
                            </div>

                            {/* mid timeline */}
                            <div className="my-6 px-6 md:my-0">
                                <div className="relative h-[88px] w-full">
                                    <div className="absolute inset-x-0 top-1/2">
                                        <div className="relative flex items-center">
                                            <span className="h-[10px] w-[10px] rounded-full bg-[#CFE0F2]" />
                                            <div className="relative mx-3 flex-1">
                                                <div className="h-[1px] w-full border-t border-dashed border-[rgba(5,99,193,0.3)]" />
                                                <div className="absolute left-1/2 top-[10px] right-[30px] z-10 -translate-x-1/2 -translate-y-1/2">
                                                    <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-[#E6F2EC] px-4 py-1 text-[12px] font-semibold leading-none text-[#068241]">
                                                        16h 40 min
                                                    </span>
                                                </div>
                                                <img src={Plane} alt="plane" className="absolute right-[-25px] top-[-9px] h-[20px] w-[20px] opacity-30" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute left-[35%] top-[62%]">
                                        <span className="text-[14px] text-[rgba(150,150,150,1)]">Direct</span>
                                    </div>
                                </div>
                            </div>

                            {/* arrive */}
                            <div className="flex flex-col items-center md:text-right">
                                <p className="mb-1 text-[14px] text-[#969696]">Arrive</p>
                                <p className="tabular-nums text-[24px] font-semibold leading-[32px] text-[#3D3D3D]">4:30am</p>
                                <p className="mt-1 text-[14px] font-bold text-[#3D3D3D]">25 May 2024</p>
                                <p className="mt-3 text-[14px] text-[#3D3D3D]">Dubai International Airport</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Fare card */}
                <div className="h-full overflow-hidden rounded-xl border border-[#E7ECF2] bg-white shadow-[0_2px_10px_rgba(16,24,40,0.04)] flex flex-col">
                    <div className="px-5 pt-4 flex-1">
                        <div className="flex items-center justify-between">
                            <p className="text-[24px] font-bold text-[#3D3D3D]">Fare Summary</p>
                            <Button
                                type="button"
                                className="text-[16px] font-medium text-[#EC2028]"
                                overrideClasses
                            >
                                Fare Rules
                            </Button>
                        </div>
                        <div className="mt-4 space-y-[10px] text-[13px]">
                            <div className="flex items-center justify-between">
                                <span className="text-[14px] text-[#3D3D3D]">Base Fare</span>
                                <span className="tabular-nums text-[14px] text-[#3D3D3D]">800</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[14px] text-[#3D3D3D]">Airline Taxes</span>
                                <span className="tabular-nums text-[14px] text-[#3D3D3D]">400</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[14px] text-[#3D3D3D]">Additional Charges</span>
                                <span className="tabular-nums text-[14px] text-[#3D3D3D]">0.0</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 bg-[#0563C1] px-5 py-[12px] text-white">
                        <div className="flex items-center justify-between">
                            <span className="text-[18px] font-bold">Total</span>
                            <span className="tabular-nums text-[20px] font-bold">1200</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: Buttons under right card */}
            <div className="grid md:grid-cols-[2fr_1fr]">
                <div />
                <div className="flex items-center justify-between px-1 sm:px-5 py-3">
                    <Button
                        type="button"
                        onClick={() => setShowBaggage(s => !s)}
                        className={`text-[14px] hover:underline text-[#0563C1]`}
                        overrideClasses
                    >
                        {showBaggage ? "Hide Baggage Details" : "Show Baggage Details"}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => setShowBreakup((s) => !s)}
                        className={`text-[14px] text-[#EC2028] hover:underline `}
                        overrideClasses
                    >
                        {showBreakup ? "Hide Price Breakup" : "Show Price Breakup"}
                    </Button>
                </div>
            </div>
            <div className="px-2 md:px-0">
                <div className="flex gap-6 text-[16px]">
                    {[
                        { key: "passenger", label: "Passenger Details" },
                        { key: "seats", label: "Seats" },
                        { key: "payment", label: "Payment" },
                    ].map((t) => {
                        const isActive = activeTab === t.key as any;
                        return (
                            <Button
                                type="button"
                                key={t.key}
                                onClick={() => setActiveTab(t.key as any)}
                                className={`relative pb-3 focus:outline-none ${isActive ? "text-[#0563C1] font-bold" : "text-[#969696]"
                                    }`}
                                overrideClasses
                            >
                                {t.label}
                                {isActive && (
                                    <span className="absolute inset-x-0 -bottom-[2px] mx-auto h-[2px] w-full rounded bg-[#0563C1]" />
                                )}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {activeTab === "seats" ? (
                <div className="mb-5">
                    <TravellersSeatsSection />
                </div>
            ) : (
                <div className="mb-5 grid gap-4 md:grid-cols-[2fr_1fr]">
                    {/* LEFT: tabs header + form card */}
                    <div>
                        <div className="mt-3 rounded-xl border border-[#E7ECF2] bg-white shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
                            {activeTab === "passenger" && <TravellersPassengerDetail />}
                            {activeTab === "payment" && <TravellersPaymentSection />}
                        </div>
                    </div>

                    {/* RIGHT: empty to keep grid alignment */}
                    <div>
                        {showBreakup && (
                            <div className="mt-3 rounded-xl border border-[#E7ECF2] bg-white shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
                                <div className="px-5 py-4">
                                    <div className="mb-2 flex items-end justify-between">
                                        <p className="text-[16px] font-bold text-[#3D3D3D]">Fare Type</p>
                                        <p className="text-[16px] font-bold text-[#3D3D3D]">
                                            Adults <span className="text-[12px] text-[#3D3D3D] font-medium">(12+ yrs)</span>
                                        </p>
                                    </div>

                                    <div className="mt-2 space-y-3 text-[16px]">
                                        {[
                                            ["Base Fare", "800"],
                                            ["Discount", "0.00"],
                                            ["Addn charges", "0.00"],
                                            ["Tax & Fees", ""],
                                            ["ZR", "5.00"],
                                            ["BH", "40.00"],
                                            ["HM", "10.00"],
                                            ["RG", "70.00"],
                                            ["SP", "30.00"],
                                            ["YD", "40.00"],
                                            ["YQ", "200.00"],
                                            ["YR", "40.00"],
                                        ].map(([label, value], idx) => (
                                            <div
                                                key={label + idx}
                                                className={`flex items-center justify-between ${label === "Tax & Fees" ? "pt-1 font-medium text-[#3D3D3D]" : "text-[#3D3D3D]"
                                                    }`}
                                            >
                                                <span>{label}</span>
                                                <span className="tabular-nums">{value}</span>
                                            </div>
                                        ))}

                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="font-bold">Total(AED)</span>
                                            <span className="tabular-nums font-medium">1200.00</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {showBaggage && (
                            <div className="mt-3 rounded-xl border border-[#E7ECF2] bg-white shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
                                <div className="px-5 py-4">
                                    <div className="mb-3 flex items-end justify-between">
                                        <p className="text-[16px] font-bold text-[#3D3D3D]">Baggage Type</p>
                                        <p className="text-[16px] font-bold text-[#3D3D3D]">
                                            Adults <span className="text-[12px] text-[#3D3D3D] font-medium">(12+ yrs)</span>
                                        </p>
                                    </div>

                                    <div className="space-y-3 text-[16px] text-[#3D3D3D]">
                                        <div className="flex items-center justify-between">
                                            <span>Base Fare</span><span className="tabular-nums">2 Piece</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Discount</span><span className="tabular-nums">2 Piece</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-md bg-[rgba(236,32,40,0.1)] px-4 py-3">
                                        <p className="text-[12px] text-[#000000]">
                                            <span className="font-bold">Note:</span> Baggage details will get changed subject to availability.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </section>
    );
};

export default Travellers;
