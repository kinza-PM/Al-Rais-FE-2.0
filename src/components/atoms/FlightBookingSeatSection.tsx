import { useState } from "react";
import BookingPlane from "../../assets/images/flight-booking-plane.png";
import EmirateLogo from "../../assets/images/emirates.png";
import AirIndia from "../../assets/images/air-india.png";
import INFO_ICON from "../../assets/svgs/info.svg"
import flightSeatSelection from "../../assets/svgs/flight-seat-selection-svg.svg"
import standardSeatGlyph from "../../assets/svgs/standard-seat-glyph.svg"
import extendedSeatGlyph from "../../assets/svgs/extended-seat-glyph.svg"
import seat from "../../assets/svgs/enhance-seat.svg"
import CardCollapseToggle from "../common/CardCollapseToggle";

export default function FlightBookingSeatSection({
    open,
    onToggleOpen,
}: {
    open: boolean;
    onToggleOpen: () => void;
}) {
    // mock/local state for left panel
    const [depSeat, setDepSeat] = useState<string | null>("B4");

    const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const letters = ["A", "B", "C", "D", "E", "F"]; // 3 + aisle + 3
    const booked = new Set(["A2", "B2", "E3", "F3", "C1", "D1"]);       // mock
    const reserved = new Set(["A7", "F7", "A10", "F10"]);             // mock
    const extended = new Set(letters.map(l => `${l}1`));           // row 1 extended

    const seatStatus = (id: string) =>
        depSeat === id ? "selected"
            : booked.has(id) ? "booked"
                : reserved.has(id) ? "reserved"
                    : extended.has(id) ? "extended"
                        : "standard";

    const Seat = ({ id }: { id: string }) => {
        const status = seatStatus(id);
        const base = "h-6 w-6 md:h-7 md:w-7 rounded transition ring-offset-1";
        const cls =
            status === "selected" ? "bg-[#2351A3]"
                : status === "booked" ? "bg-[#FF5270] cursor-not-allowed"
                    : status === "reserved" ? "bg-[#C2CAD6] cursor-not-allowed"
                        : status === "extended" ? "border border-dashed border-[#F79E1B]"
                            : "border border-dashed border-[#00522E]";

        const clickable = !(status === "booked" || status === "reserved");
        return (
            <button
                type="button"
                aria-label={id}
                disabled={!clickable}
                onClick={() => setDepSeat(id)}
                className={`${base} ${cls}`}
            />
        );
    };

    const Aisle = () => <div className="w-6 md:w-7" aria-hidden />;

    return (
        <div className="px-3 pb-3 mt-3">
            <div className="rounded-xl border border-[#E4E4E7] overflow-hidden">
                {/* header */}
                <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A7C0EC]">
                            <img src={seat} alt="seat" className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[15px] font-medium text-[#0A0C0F]">Seats</div>
                            <div className="text-[12px] text-[#3D495C]">
                                Enjoy more legroom and choose your preferred spot.
                            </div>
                        </div>
                    </div>
                    <CardCollapseToggle open={open} onClick={onToggleOpen} />
                </button>

                {open && <div className="h-px bg-[#E4E4E7]" />}

                {open && (
                    <div className="px-3 py-4 grid gap-6 md:grid-cols-[minmax(320px,420px)_1fr] enhance-seat-grid">
                        <div className="md:order-1">
                            <div className="rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#85FFCA]">
                                        <img src={standardSeatGlyph} alt="standard-seat-glyph" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[14px] font-medium text-[#0A0C0F]">Standard seats</div>
                                        <p className="text-[12px] text-[#3D495C]">
                                            Seats on row 14 on all aircraft and seats on row 32 on Boeing 737-800 do not recline.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#FFE2A6]">
                                        <img src={extendedSeatGlyph} alt="extended-seat-glyph" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[14px] font-medium text-[#0A0C0F]">Extended legroom</div>
                                        <p className="text-[12px] text-[#3D495C]">
                                            For safety reasons, seats on row 15 do not recline.
                                        </p>
                                    </div>
                                    <div className="ml-1 grid h-6 w-6 place-items-center rounded-full">
                                        <img src={INFO_ICON} alt="info-icon" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px]">
                                <div className="flex items-center gap-1">
                                    <span className="h-3 w-3 rounded-full bg-[#C2CAD6]" />
                                    <span className="text-[#3D495C]">Reserved</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="h-3 w-3 rounded-full border border-dashed border-[#00522E]" />
                                    <span className="text-[#3D495C]">Standard available</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="h-3 w-3 rounded border border-dashed border-[#F79E1B]" />
                                    <span className="text-[#3D495C]">Extended Available</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="h-3 w-3 rounded bg-[#FF5270]" />
                                    <span className="text-[#3D495C]">Booked</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="text-[15px] font-semibold text-[#0A0C0F]">Departure flight</div>

                                <div className="mt-2 grid grid-cols-[minmax(220px,1fr)_auto_15px] items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <img src={EmirateLogo} alt="Emirates Airlines" className="h-10 w-10 rounded-full object-cover" />
                                        <div>
                                            <div className="text-[15px] font-medium text-[#0A0C0F]">Emirates Airlines</div>
                                            <div className="text-[13px] text-[#3D495C]">EK 1234 – Economy class</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[12px] text-[#3D495C]">Passenger</div>
                                        <div className="text-[14px] font-medium text-[#0A0C0F]">01 Adult</div>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between rounded-xl border border-[#E4E4E7] bg-white px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <img src={flightSeatSelection} alt="flight-seat-selection" className="w-4 h-4" />
                                        <span className="text-[15px] font-semibold text-[#0A0C0F]">{depSeat}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setDepSeat(null)}
                                        className="text-[14px] font-medium text-[#5383DA] hover:underline"
                                    >
                                        Clear selection
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="text-[15px] font-semibold text-[#0A0C0F]">Return flight</div>

                                <div className="mt-2 grid grid-cols-[minmax(220px,1fr)_auto_15px] items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <img src={AirIndia} alt="Air India" className="h-10 w-10 rounded-full object-cover" />
                                        <div>
                                            <div className="text-[15px] font-medium text-[#0A0C0F]">Air India</div>
                                            <div className="text-[13px] text-[#3D495C]">AI 1452 – Economy class</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[12px] text-[#3D495C]">Passenger</div>
                                        <div className="text-[14px] font-medium text-[#0A0C0F]">01 Adult</div>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between rounded-xl border border-[#E4E4E7] bg-white px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <img src={flightSeatSelection} alt="flight-seat-selection" className="w-4 h-4" />
                                        <span className="text-[14px] text-[#C2CAD6]">No seat selected!</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-[25%] flex justify-center">
                                <button
                                    type="button"
                                    className="px-12 rounded-xl bg-[#2351A3] py-3 text-[16px] font-semibold text-[#F2F2F3] hover:brightness-95 active:brightness-90"
                                >
                                    Confirm selection
                                </button>
                            </div>
                        </div>


                        <div className="md:order-2 md:justify-self-end">
                            <div className="relative mx-auto max-w-[520px]">
                                <img src={BookingPlane} className="w-full select-none pointer-events-none" alt="plane" />

                                <div className="absolute left-[24%] right-[26%] top-[10%] bottom-[9%] box-border flight-seat-overlay">
                                    <div className="h-full flex flex-col justify-between">
                                        {rows.map((r) => (
                                            <div
                                                key={r}
                                                className="grid grid-cols-[repeat(3,1fr)_10px_repeat(3,1fr)] items-center justify-items-center gap-2"
                                            >
                                                {(["A", "B", "C"] as const).map((L) => <Seat key={`${L}${r}`} id={`${L}${r}`} />)}
                                                <Aisle />
                                                {(["D", "E", "F"] as const).map((L) => <Seat key={`${L}${r}`} id={`${L}${r}`} />)}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
