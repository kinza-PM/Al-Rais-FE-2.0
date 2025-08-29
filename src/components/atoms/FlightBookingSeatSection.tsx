import { useState } from "react";
import BookingPlane from "../../assets/images/flight-booking-plane.png";
import EmirateLogo from "../../assets/images/emirates.png";
import AirIndia from "../../assets/images/air-india.png";
import INFO_ICON from "../../assets/svgs/info.svg"

export default function FlightBookingSeatSection({
    CardChevron,
    open,
    onToggleOpen,
}: {
    CardChevron: React.ComponentType<{ open: boolean; onClick: () => void; className?: string }>;
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

    const StandardSeatGlyph = () => (
        <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 17.125C14.5 17.2908 14.4341 17.4498 14.3169 17.567C14.1997 17.6842 14.0407 17.75 13.875 17.75H5.74998C5.58422 17.75 5.42525 17.6842 5.30804 17.567C5.19083 17.4498 5.12498 17.2908 5.12498 17.125C5.12498 16.9593 5.19083 16.8003 5.30804 16.6831C5.42525 16.5659 5.58422 16.5 5.74998 16.5H13.875C14.0407 16.5 14.1997 16.5659 14.3169 16.6831C14.4341 16.8003 14.5 16.9593 14.5 17.125ZM14.5 11.5V14C14.5 14.3316 14.3683 14.6495 14.1339 14.8839C13.8994 15.1183 13.5815 15.25 13.25 15.25H5.91482C5.68238 15.2508 5.45439 15.1864 5.25666 15.0642C5.05893 14.942 4.89938 14.7669 4.79607 14.5586L0.256228 5.49614C0.169914 5.3223 0.125 5.13085 0.125 4.93676C0.125 4.74268 0.169914 4.55122 0.256228 4.37739L1.98435 0.939886C2.13103 0.647164 2.38671 0.423678 2.69642 0.317471C3.00613 0.211263 3.34515 0.230813 3.6406 0.371917L6.27263 1.48285L6.30935 1.50004C6.60567 1.64838 6.83097 1.90831 6.93571 2.22269C7.04046 2.53707 7.01608 2.88019 6.86795 3.1766C6.86555 3.18256 6.86268 3.18831 6.85935 3.19379L5.74998 5.25004L8.23279 10.25H13.25C13.5815 10.25 13.8994 10.3817 14.1339 10.6162C14.3683 10.8506 14.5 11.1685 14.5 11.5ZM13.25 11.5H8.23201C7.99967 11.5008 7.77176 11.4364 7.57415 11.3142C7.37654 11.192 7.21714 11.0169 7.11404 10.8086L4.63045 5.80864C4.54434 5.63516 4.49953 5.44411 4.49953 5.25043C4.49953 5.05676 4.54434 4.86571 4.63045 4.69223L4.63982 4.67504L5.74998 2.61879L3.13826 1.51645C3.12574 1.51163 3.11348 1.50616 3.10154 1.50004L1.37498 4.93754L5.91404 14H13.25V11.5Z" fill="#00522E" />
        </svg>
    );

    const ExtendedSeatGlyph = () => (
        <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 17.125C14.5 17.2908 14.4341 17.4498 14.3169 17.567C14.1997 17.6842 14.0407 17.75 13.875 17.75H5.74998C5.58422 17.75 5.42525 17.6842 5.30804 17.567C5.19083 17.4498 5.12498 17.2908 5.12498 17.125C5.12498 16.9593 5.19083 16.8003 5.30804 16.6831C5.42525 16.5659 5.58422 16.5 5.74998 16.5H13.875C14.0407 16.5 14.1997 16.5659 14.3169 16.6831C14.4341 16.8003 14.5 16.9593 14.5 17.125ZM14.5 11.5V14C14.5 14.3316 14.3683 14.6495 14.1339 14.8839C13.8994 15.1183 13.5815 15.25 13.25 15.25H5.91482C5.68238 15.2508 5.45439 15.1864 5.25666 15.0642C5.05893 14.942 4.89938 14.7669 4.79607 14.5586L0.256228 5.49614C0.169914 5.3223 0.125 5.13085 0.125 4.93676C0.125 4.74268 0.169914 4.55122 0.256228 4.37739L1.98435 0.939886C2.13103 0.647164 2.38671 0.423678 2.69642 0.317471C3.00613 0.211263 3.34515 0.230813 3.6406 0.371917L6.27263 1.48285L6.30935 1.50004C6.60567 1.64838 6.83097 1.90831 6.93571 2.22269C7.04046 2.53707 7.01608 2.88019 6.86795 3.1766C6.86555 3.18256 6.86268 3.18831 6.85935 3.19379L5.74998 5.25004L8.23279 10.25H13.25C13.5815 10.25 13.8994 10.3817 14.1339 10.6162C14.3683 10.8506 14.5 11.1685 14.5 11.5ZM13.25 11.5H8.23201C7.99967 11.5008 7.77176 11.4364 7.57415 11.3142C7.37654 11.192 7.21714 11.0169 7.11404 10.8086L4.63045 5.80864C4.54434 5.63516 4.49953 5.44411 4.49953 5.25043C4.49953 5.05676 4.54434 4.86571 4.63045 4.69223L4.63982 4.67504L5.74998 2.61879L3.13826 1.51645C3.12574 1.51163 3.11348 1.50616 3.10154 1.50004L1.37498 4.93754L5.91404 14H13.25V11.5Z" fill="#F79E1B" />
        </svg>
    );

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
                            <svg width="23" height="25" viewBox="0 0 23 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23 27C23 27.2652 22.8946 27.5196 22.7071 27.7071C22.5195 27.8947 22.2652 28 22 28H8.99997C8.73475 28 8.48039 27.8947 8.29286 27.7071C8.10532 27.5196 7.99997 27.2652 7.99997 27C7.99997 26.7348 8.10532 26.4804 8.29286 26.2929C8.48039 26.1054 8.73475 26 8.99997 26H22C22.2652 26 22.5195 26.1054 22.7071 26.2929C22.8946 26.4804 23 26.7348 23 27ZM23 18V22C23 22.5305 22.7893 23.0392 22.4142 23.4142C22.0391 23.7893 21.5304 24 21 24H9.26372C8.89181 24.0012 8.52702 23.8982 8.21065 23.7027C7.89429 23.5071 7.639 23.2269 7.47372 22.8938L0.209965 8.39377C0.0718631 8.11563 0 7.80931 0 7.49877C0 7.18823 0.0718631 6.88191 0.209965 6.60377L2.97497 1.10377C3.20965 0.635413 3.61874 0.277837 4.11428 0.107904C4.60981 -0.0620281 5.15224 -0.0307488 5.62497 0.195018L9.83622 1.97252L9.89497 2.00002C10.3691 2.23736 10.7295 2.65324 10.8971 3.15626C11.0647 3.65927 11.0257 4.20825 10.7887 4.68252C10.7849 4.69204 10.7803 4.70124 10.775 4.71002L8.99997 8.00002L12.9725 16H21C21.5304 16 22.0391 16.2107 22.4142 16.5858C22.7893 16.9609 23 17.4696 23 18ZM21 18H12.9712C12.5995 18.0012 12.2348 17.8982 11.9186 17.7027C11.6025 17.5072 11.3474 17.2269 11.1825 16.8938L7.20871 8.89377C7.07094 8.6162 6.99924 8.31052 6.99924 8.00064C6.99924 7.69076 7.07094 7.38508 7.20871 7.10752L7.22372 7.08002L8.99997 3.79002L4.82122 2.02627C4.80118 2.01857 4.78157 2.0098 4.76247 2.00002L1.99997 7.50002L9.26246 22H21V18Z" fill="#1A3C7A" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-[15px] font-medium text-[#0A0C0F]">Seats</div>
                            <div className="text-[12px] text-[#3D495C]">
                                Enjoy more legroom and choose your preferred spot.
                            </div>
                        </div>
                    </div>
                    <CardChevron open={open} onClick={onToggleOpen} />
                </button>

                {open && <div className="h-px bg-[#E4E4E7]" />}

                {open && (
                    <div className="px-3 py-4 grid gap-6 md:grid-cols-[minmax(320px,420px)_1fr]">
                        <div className="md:order-1">
                            <div className="rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#85FFCA]">
                                        <StandardSeatGlyph />
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
                                        <ExtendedSeatGlyph />
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
                                        <svg width="15" height="18" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 20.75C18 20.9489 17.921 21.1396 17.7803 21.2803C17.6397 21.4209 17.4489 21.5 17.25 21.5H7.49997C7.30106 21.5 7.1103 21.4209 6.96964 21.2803C6.82899 21.1396 6.74997 20.9489 6.74997 20.75C6.74997 20.551 6.82899 20.3603 6.96964 20.2196C7.1103 20.079 7.30106 20 7.49997 20H17.25C17.4489 20 17.6397 20.079 17.7803 20.2196C17.921 20.3603 18 20.551 18 20.75ZM18 14V17C18 17.3978 17.8419 17.7793 17.5606 18.0606C17.2793 18.3419 16.8978 18.5 16.5 18.5H7.69779C7.41886 18.5008 7.14526 18.4236 6.90799 18.2769C6.67072 18.1303 6.47925 17.9201 6.35529 17.6703L0.907474 6.79527C0.803897 6.58666 0.75 6.35692 0.75 6.12402C0.75 5.89111 0.803897 5.66137 0.907474 5.45277L2.98122 1.32777C3.15724 0.976499 3.46405 0.708316 3.83571 0.580867C4.20736 0.453418 4.61418 0.476877 4.96872 0.646203L8.12716 1.97933L8.17122 1.99995C8.52681 2.17796 8.79716 2.48987 8.92285 2.86713C9.04855 3.24439 9.0193 3.65612 8.84154 4.01183C8.83867 4.01897 8.83522 4.02587 8.83122 4.03245L7.49997 6.49995L10.4793 12.5H16.5C16.8978 12.5 17.2793 12.658 17.5606 12.9393C17.8419 13.2206 18 13.6021 18 14ZM16.5 14H10.4784C10.1996 14.0009 9.92611 13.9236 9.68898 13.777C9.45185 13.6303 9.26057 13.4201 9.13685 13.1703L6.15654 7.17027C6.0532 6.96209 5.99943 6.73283 5.99943 6.50042C5.99943 6.26801 6.0532 6.03875 6.15654 5.83058L6.16779 5.80995L7.49997 3.34245L4.36591 2.01964C4.35088 2.01386 4.33618 2.00729 4.32185 1.99995L2.24997 6.12495L7.69685 17H16.5V14Z" fill="#2351A3" />
                                        </svg>
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
                                        <svg width="15" height="18" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 20.75C18 20.9489 17.921 21.1396 17.7803 21.2803C17.6397 21.4209 17.4489 21.5 17.25 21.5H7.49997C7.30106 21.5 7.1103 21.4209 6.96964 21.2803C6.82899 21.1396 6.74997 20.9489 6.74997 20.75C6.74997 20.551 6.82899 20.3603 6.96964 20.2196C7.1103 20.079 7.30106 20 7.49997 20H17.25C17.4489 20 17.6397 20.079 17.7803 20.2196C17.921 20.3603 18 20.551 18 20.75ZM18 14V17C18 17.3978 17.8419 17.7793 17.5606 18.0606C17.2793 18.3419 16.8978 18.5 16.5 18.5H7.69779C7.41886 18.5008 7.14526 18.4236 6.90799 18.2769C6.67072 18.1303 6.47925 17.9201 6.35529 17.6703L0.907474 6.79527C0.803897 6.58666 0.75 6.35692 0.75 6.12402C0.75 5.89111 0.803897 5.66137 0.907474 5.45277L2.98122 1.32777C3.15724 0.976499 3.46405 0.708316 3.83571 0.580867C4.20736 0.453418 4.61418 0.476877 4.96872 0.646203L8.12716 1.97933L8.17122 1.99995C8.52681 2.17796 8.79716 2.48987 8.92285 2.86713C9.04855 3.24439 9.0193 3.65612 8.84154 4.01183C8.83867 4.01897 8.83522 4.02587 8.83122 4.03245L7.49997 6.49995L10.4793 12.5H16.5C16.8978 12.5 17.2793 12.658 17.5606 12.9393C17.8419 13.2206 18 13.6021 18 14ZM16.5 14H10.4784C10.1996 14.0009 9.92611 13.9236 9.68898 13.777C9.45185 13.6303 9.26057 13.4201 9.13685 13.1703L6.15654 7.17027C6.0532 6.96209 5.99943 6.73283 5.99943 6.50042C5.99943 6.26801 6.0532 6.03875 6.15654 5.83058L6.16779 5.80995L7.49997 3.34245L4.36591 2.01964C4.35088 2.01386 4.33618 2.00729 4.32185 1.99995L2.24997 6.12495L7.69685 17H16.5V14Z" fill="#2351A3" />
                                        </svg>
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

                                <div className="absolute left-[24%] right-[26%] top-[10%] bottom-[9%] box-border">
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
