import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import entertainmentIcon from "../../assets/svgs/entertainment.svg";
import mealIcon from "../../assets/svgs/meals.svg";
import portIcon from "../../assets/svgs/ports.svg";
import wifiIcon from "../../assets/svgs/wifi.svg";
import arrownDownwardIcon from "../../assets/svgs/arrow-downwards.svg";
import arrownUpwardIcon from "../../assets/svgs/arrow-upwards.svg";
import EmirateLogo from "../../assets/images/emirates.png";
import { useState } from "react";
import { flightBookingReviewContactDetail, flightBookingReviewPassengerDetail, flightBookingReviewSeatDetail } from "../../utils/mockData";
import FLightPriceBreakdown from "../atoms/FlightPriceBreakdown";

type Section = "contact" | "passenger" | "seat";

function ChevronDown() {
    return (
        <img alt="arrow-icon" src={arrownDownwardIcon} className="pointer-events-none absolute right-3 top-4" />
    )
}

const CardChevron = ({
    open,
    onClick,
    className = "",
}: {
    open: boolean;
    onClick: () => void;
    className?: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={open ? "Collapse" : "Expand"}
        className={`transition-transform duration-200 ${open ? "rotate-180" : ""} ${className}`}
    >
        {open ? (
            <img alt="arrow-icon" src={arrownUpwardIcon} />
        ) : (
            <img alt="arrow-icon" src={arrownDownwardIcon} />
        )}
    </button>
);

export default function FlightBookingReviewSection() {
    const [openPrice, setOpenPrice] = useState(false);

    const [isEditing, setIsEditing] = useState<{ contact: boolean; passenger: boolean; seat: boolean }>({
        contact: false,
        passenger: false,
        seat: false,
    });

    const [values, setValues] = useState({
        contact: flightBookingReviewContactDetail,
        passenger: flightBookingReviewPassengerDetail,
        seat: flightBookingReviewSeatDetail,
    });
    const [draft, setDraft] = useState(values);

    // generic helpers
    const startEdit = (section: Section) => {
        setDraft((d) => ({ ...d, [section]: values[section] }));
        setIsEditing((s) => ({ ...s, [section]: true }));
    };
    const cancelEdit = (section: Section) =>
        setIsEditing((s) => ({ ...s, [section]: false }));
    const saveEdit = (section: Section) => {
        setValues((v) => ({ ...v, [section]: draft[section] }));
        setIsEditing((s) => ({ ...s, [section]: false }));
    };

    // partial updaters
    const setSection = <T extends Section>(section: T, partial: Partial<typeof values[T]>) =>
        setDraft((d) => ({ ...d, [section]: { ...d[section], ...partial } }));

    const setContact = (partial: Partial<typeof values.contact>) => setSection("contact", partial);
    const setPassenger = (partial: Partial<typeof values.passenger>) => setSection("passenger", partial);
    const setSeat = (partial: Partial<typeof values.seat>) => setSection("seat", partial);

    return (
        <section className="mx-auto max-w-full px-10">
            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                {/* LEFT: Forms */}
                <div className="space-y-4">
                    <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-sm">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
                            <h3 className="text-[15px] font-medium text-[#0A0C0F]">Contact person details</h3>

                            {!isEditing.contact ? (
                                <button
                                    type="button"
                                    onClick={() => startEdit("contact")}
                                    className="text-[14px] font-medium text-[#5383DA] hover:underline"
                                >
                                    Edit
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => cancelEdit("contact")}
                                        className="h-8 rounded-lg border border-[#C2CAD6] px-3 text-sm text-[#3D495C]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => saveEdit("contact")}
                                        className="h-8 rounded-lg bg-[#2351A3] px-3 text-sm font-medium text-white"
                                    >
                                        Save
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="px-5 py-4">
                            <dl className="grid grid-cols-2 gap-y-2">
                                {/* Title */}
                                <dt className="text-[12px] text-[#3D495C]">Title</dt>
                                <dd className="text-right">
                                    {!isEditing.contact ? (
                                        <span className="text-[14px] text-[#0A0C0F] font-medium">
                                            {values.contact.title || "—"}
                                        </span>
                                    ) : (
                                        <div className="inline-block w-full max-w-[320px] relative">
                                            <select
                                                value={draft.contact.title}
                                                onChange={(e) => setContact({ title: e.target.value })}
                                                className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-left text-[#0A0C0F] focus:outline-none"
                                            >
                                                <option value="">Select title</option>
                                                <option>Mr.</option>
                                                <option>Ms.</option>
                                                <option>Mrs.</option>
                                                <option>Dr.</option>
                                            </select>
                                            {/* ChevronDown or inline svg */}
                                            <ChevronDown />
                                        </div>
                                    )}
                                </dd>

                                {/* Full Name */}
                                <dt className="text-[12px] text-[#3D495C]">Full Name</dt>
                                <dd className="text-right">
                                    {!isEditing.contact ? (
                                        <span className="text-[14px] text-[#0A0C0F] font-medium">
                                            {values.contact.fullName || "—"}
                                        </span>
                                    ) : (
                                        <div className="inline-block w-full max-w-[320px]">
                                            <input
                                                type="text"
                                                value={draft.contact.fullName}
                                                onChange={(e) => setContact({ fullName: e.target.value })}
                                                placeholder="Enter your full name"
                                                className="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </dd>

                                {/* Email */}
                                <dt className="text-[12px] text-[#3D495C]">Email</dt>
                                <dd className="text-right">
                                    {!isEditing.contact ? (
                                        <span className="text-[14px] text-[#0A0C0F] font-medium">
                                            {values.contact.email || "—"}
                                        </span>
                                    ) : (
                                        <div className="inline-block w-full max-w-[320px]">
                                            <input
                                                type="email"
                                                value={draft.contact.email}
                                                onChange={(e) => setContact({ email: e.target.value })}
                                                placeholder="Enter an email"
                                                className="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </dd>

                                {/* Phone */}
                                <dt className="text-[12px] text-[#3D495C]">Phone</dt>
                                <dd className="text-right">
                                    {!isEditing.contact ? (
                                        <span className="text-[14px] text-[#0A0C0F] font-medium">
                                            {values.contact.phone || "—"}
                                        </span>
                                    ) : (
                                        <div className="inline-block w-full max-w-[320px]">
                                            <input
                                                type="tel"
                                                value={draft.contact.phone}
                                                onChange={(e) => setContact({ phone: e.target.value })}
                                                placeholder="Phone"
                                                className="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </dd>
                            </dl>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-sm">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
                            <h3 className="text-[15px] font-medium text-[#0A0C0F]">Passenger 01 details</h3>

                            {!isEditing.passenger ? (
                                <button
                                    type="button"
                                    onClick={() => startEdit("passenger")}
                                    className="text-[14px] font-medium text-[#5383DA] hover:underline"
                                >
                                    Edit
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => cancelEdit('passenger')}
                                        className="h-8 rounded-lg border border-[#C2CAD6] px-3 text-sm text-[#3D495C]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => saveEdit('passenger')}
                                        className="h-8 rounded-lg bg-[#2351A3] px-3 text-sm font-medium text-white"
                                    >
                                        Save
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="px-5 py-4">
                            <dl className="grid grid-cols-2 gap-y-2">
                                {/* Pax type */}
                                <dt className="text-[12px] text-[#3D495C]">Pax type</dt>
                                <dd className="text-right">
                                    {!isEditing.passenger ? (
                                        <span className="text-[14px] text-[#0A0C0F] font-medium">
                                            {values.passenger.paxType || "—"}
                                        </span>
                                    ) : (
                                        <div className="inline-block w-full max-w-[320px] relative">
                                            <select
                                                value={draft.passenger.paxType}
                                                onChange={(e) => setPassenger({ paxType: e.target.value })}
                                                className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-left text-[#0A0C0F] focus:outline-none"
                                            >
                                                <option value="">Select type</option>
                                                <option>Adult</option>
                                                <option>Child</option>
                                                <option>Infant</option>
                                                <option>Senior</option>
                                            </select>
                                            <svg
                                                width="12"
                                                height="7"
                                                viewBox="0 0 12 7"
                                                fill="none"
                                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                                            >
                                                <path d="M11.354 1.354L6.354 6.354a1 1 0 0 1-1.414 0L0.646 1.354" stroke="#3D495C" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    )}
                                </dd>

                                {/* Passport number */}
                                <dt className="text-[12px] text-[#3D495C]">Passport number</dt>
                                <dd className="text-right">
                                    {!isEditing.passenger ? (
                                        <span className="text-[14px] text-[#0A0C0F] font-medium">
                                            {values.passenger.passportNumber || "—"}
                                        </span>
                                    ) : (
                                        <div className="inline-block w-full max-w-[320px]">
                                            <input
                                                type="text"
                                                value={draft.passenger.passportNumber}
                                                onChange={(e) => setPassenger({ passportNumber: e.target.value })}
                                                placeholder="Enter passport number"
                                                className="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </dd>

                                {/* Issuing country */}
                                <dt className="text-[12px] text-[#3D495C]">Issuing country</dt>
                                <dd className="text-right">
                                    {!isEditing.passenger ? (
                                        <span className="text-[14px] text-[#0A0C0F] font-medium">
                                            {values.passenger.issuingCountry || "—"}
                                        </span>
                                    ) : (
                                        <div className="inline-block w-full max-w-[320px] relative">
                                            <select
                                                value={draft.passenger.issuingCountry}
                                                onChange={(e) => setPassenger({ issuingCountry: e.target.value })}
                                                className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-left text-[#0A0C0F] focus:outline-none"
                                            >
                                                <option value="">Select country</option>
                                                <option>Dubai</option>
                                                <option>Pakistan</option>
                                                <option>Saudi Arabia</option>
                                                <option>India</option>
                                            </select>
                                            <svg
                                                width="12"
                                                height="7"
                                                viewBox="0 0 12 7"
                                                fill="none"
                                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                                            >
                                                <path d="M11.354 1.354L6.354 6.354a1 1 0 0 1-1.414 0L0.646 1.354" stroke="#3D495C" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    )}
                                </dd>

                                {/* Expiry date */}
                                <dt className="text-[12px] text-[#3D495C]">Expiry date</dt>
                                <dd className="text-right">
                                    {!isEditing.passenger ? (
                                        <span className="text-[14px] text-[#0A0C0F] font-medium">
                                            {values.passenger.expiryDate || "—"}
                                        </span>
                                    ) : (
                                        <div className="inline-block w-full max-w-[320px]">
                                            <input
                                                type="text"
                                                value={draft.passenger.expiryDate}
                                                onChange={(e) => setPassenger({ expiryDate: e.target.value })}
                                                placeholder="MM/YYYY"
                                                className="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </dd>
                            </dl>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-sm">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
                            <h3 className="text-[15px] font-medium text-[#0A0C0F]">Seat</h3>

                            {!isEditing.seat ? (
                                <button
                                    type="button"
                                    onClick={() => startEdit("seat")}
                                    className="text-[14px] font-medium text-[#5383DA] hover:underline"
                                >
                                    Change
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => cancelEdit('seat')}
                                        className="h-8 rounded-lg border border-[#C2CAD6] px-3 text-sm text-[#3D495C]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => saveEdit('seat')}
                                        className="h-8 rounded-lg bg-[#2351A3] px-3 text-sm font-medium text-white"
                                    >
                                        Save
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="px-5 py-4">
                            <dl className="grid grid-cols-2 gap-y-2">
                                <dt className="text-[12px] text-[#3D495C]">Cabin class</dt>
                                <dd className="text-right">
                                    {!isEditing.seat ? (
                                        <span className="text-[14px] text-[#0A0C0F] font-medium">
                                            {values.seat.cabinClass || "—"}
                                        </span>
                                    ) : (
                                        <div className="inline-block w-full max-w-[320px] relative">
                                            <select
                                                value={draft.seat.cabinClass}
                                                onChange={(e) => setSeat({ cabinClass: e.target.value })}
                                                className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-left text-[#0A0C0F] focus:outline-none"
                                            >
                                                <option value="">Select type</option>
                                                <option>Economy</option>
                                                <option>Economy Lite</option>
                                                <option>Business</option>
                                            </select>
                                            <svg
                                                width="12"
                                                height="7"
                                                viewBox="0 0 12 7"
                                                fill="none"
                                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                                            >
                                                <path d="M11.354 1.354L6.354 6.354a1 1 0 0 1-1.414 0L0.646 1.354" stroke="#3D495C" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    )}
                                </dd>

                                <dt className="text-[12px] text-[#3D495C]">Seat no.</dt>
                                <dd className="text-right">
                                    {!isEditing.seat ? (
                                        <span className="text-[14px] text-[#0A0C0F] font-medium">
                                            {values.seat.seatNo || "—"}
                                        </span>
                                    ) : (
                                        <div className="inline-block w-full max-w-[320px]">
                                            <input
                                                type="text"
                                                value={draft.seat.seatNo}
                                                onChange={(e) => setSeat({ seatNo: e.target.value })}
                                                placeholder="Enter passport number"
                                                className="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </dd>
                            </dl>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-sm">
                        <div className="px-4 py-3 border-b border-[#E4E4E7]">
                            <h3 className="text-[15px] font-medium text-[#0A0C0F]">Got a promo code?</h3>
                        </div>

                        <div className="px-3 py-3">
                            <label className="mb-1 block text-[12px] text-[#3D495C]">Promo code</label>

                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Enter a promo code"
                                    className="h-10 w-full rounded-xl border border-[#C2CAD6] px-4 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none"
                                />
                                <button
                                    type="button"
                                    className="h-10 shrink-0 rounded-lg bg-[#2351A3] px-6 text-[15px] font-semibold text-[#F2F2F3]"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>


                    <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-sm">
                        <div className="px-4 py-3 border-b border-[#E4E4E7]">
                            <h3 className="text-[15px] font-medium text-[#0A0C0F]">Earn and redeem air miles</h3>
                        </div>

                        <div className="px-3 py-3 space-y-2">
                            <div>
                                <label className="mb-1 block text-[12px] text-[#3D495C]">Flight program</label>
                                <div className="relative">
                                    <select
                                        className="h-11 w-full appearance-none rounded-xl border border-[#C2CAD6] bg-white px-4 pr-9 text-[14px] font-medium text-[#0A0C0F] focus:outline-none"
                                        defaultValue="Emirates Skywards"
                                    >
                                        <option>Emirates Skywards</option>
                                        <option>Qatar Privilege Club</option>
                                        <option>Etihad Guest</option>
                                        <option>Turkish Miles&Smiles</option>
                                    </select>
                                    <ChevronDown />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-[12px] text-[#3D495C]">Membership ID</label>
                                <input
                                    type="text"
                                    defaultValue="ES66YTR778"
                                    className="h-11 w-full rounded-xl border border-[#C2CAD6] px-4 text-[14px] font-medium text-[#0A0C0F] placeholder:text-[#C2CAD6] focus:outline-none"
                                />
                            </div>

                            <div className="pt-3 flex justify-center">
                                <button
                                    type="button"
                                    className="h-10 rounded-lg bg-[#2351A3] px-8 text-[15px] font-semibold text-[#F2F2F3]"
                                >
                                    Fetch details
                                </button>
                            </div>
                        </div>
                    </div>

                </div>


                {/* RIGHT: Trip details */}
                <div>
                    <div className="rounded-xl border border-[#E4E4E7] bg-white">
                        <div className="flex items-center justify-between border-b border-[#E4E4E7] px-4 py-3">
                            <h3 className="text-[15px] font-medium text-[#0A0C0F]">Flight details</h3>
                            <button className="text-[15px] font-medium text-[#5383DA] hover:underline">View all</button>
                        </div>

                        <div className="px-5 py-3">
                            <div className="mb-4 text-center text-[14px] font-medium text-[#0A0C0F]">
                                Dubai (DXB) <span className="mx-2">→</span> Mumbai (BOM)
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={EmirateLogo}
                                        alt="Emirates Airlines"
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="text-[15px] font-medium text-[#0A0C0F]">
                                            Emirates Airlines
                                        </div>
                                        <div className="mt-[2px] text-[12px] text-[#3D495C]">
                                            EK 1234 – Economy class
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <img src={cabinIcon} alt="Cabin" className="h-4 w-4" title="Cabin: 1PC" />
                                    <img src={baggageIcon} alt="Baggage" className="h-4 w-4" title="Baggage: 20KG" />
                                    <img src={mealIcon} alt="Meal" className="h-4 w-4" title="Meal Included" />
                                    <img src={wifiIcon} alt="Wi-Fi" className="h-4 w-4" title="WiFi Available" />
                                    <img src={portIcon} alt="Beverage" className="h-4 w-4" title="Beverages" />
                                    <img src={entertainmentIcon} alt="Entertainment" className="h-4 w-4" title="Entertainment" />
                                </div>
                            </div>

                            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                                <div className="text-left">
                                    <div className="text-[14px] font-medium text-[#0A0C0F]">10:45 AM</div>
                                    <div className="text-[10px] text-[#3D495C]">Mon, 16 June 2025</div>
                                </div>

                                <div className="relative">
                                    <div className="absolute left-[10px] right-[10px] top-[20px] h-[2px] bg-[#A7C0EC]" />
                                    <span className="absolute left-0 top-[14px] h-[14px] w-[14px] rounded-full bg-[#2351A3]" />
                                    <span className="absolute right-0 top-[14px] h-[14px] w-[14px] rounded-full bg-[#2351A3]" />
                                    <div className="relative flex justify-center">
                                        <span className="inline-block px-3 py-1 text-[12px] text-[#3D495C] text-center">
                                            Duration: 03 hours 15 minutes
                                        </span>
                                    </div>
                                    <div className="text-center text-[12px] text-[#3D495C]">Direct</div>
                                </div>

                                <div className="text-right">
                                    <div className="text-[14px] font-medium text-[#0A0C0F]">02:00 PM</div>
                                    <div className="text-[10px] text-[#3D495C]">Mon, 16 June 2025</div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-[#E4E4E7]" />

                        <div className="px-4 py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-[#3D495C] text-[12px]">Fare family</div>
                                    <div className="font-medium text-[14px] text-[#0A0C0F]">Economy standard</div>
                                </div>
                                <button className="text-[#5383DA] hover:underline text-[14px]">Change</button>
                            </div>
                        </div>

                    </div>

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

                    <FLightPriceBreakdown
                        CardChevron={CardChevron}
                        open={openPrice}
                        onToggleOpen={() => setOpenPrice(v => !v)}
                    />
                </div>


            </div>

            <div className="mt-14 flex justify-center w-full">
                <button
                    type="button"
                    className="h-10 w-full max-w-[420px] rounded-lg bg-[#2351A3] px-8 text-[15px] font-semibold text-[#F2F2F3]"
                >
                    Continue to payment
                </button>
            </div>

        </section>
    );
}