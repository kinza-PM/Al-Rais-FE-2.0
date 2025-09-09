import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import entertainmentIcon from "../../assets/svgs/entertainment.svg";
import mealIcon from "../../assets/svgs/meals.svg";
import portIcon from "../../assets/svgs/ports.svg";
import wifiIcon from "../../assets/svgs/wifi.svg";
import arrownDownwardIcon from "../../assets/svgs/arrow-downwards.svg";
import EmirateLogo from "../../assets/images/emirates.png";
import { useState } from "react";
import { flightBookingReviewContactDetail, flightBookingReviewPassengerDetail, flightBookingReviewSeatDetail } from "../../utils/mockData";
import FLightPriceBreakdown from "../atoms/FlightPriceBreakdown";
import Button from "../atoms/Button";
import FlightSummaryCard from "../atoms/FlightSummaryCard";
import TailwindCustomInput from "../common/TailwindCustomInput";
import FLightFareRule from "../atoms/FlightFareRule";

type Section = "contact" | "passenger" | "seat";

function ChevronDown() {
    return (
        <img alt="arrow-icon" src={arrownDownwardIcon} className="pointer-events-none absolute right-3 top-4" />
    )
}

const CardShell = ({
    title,
    right,
    children,
}: {
    title: string;
    right?: React.ReactNode;
    children: React.ReactNode;
}) => (
    <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
            <h3 className="text-[15px] font-medium text-[#0A0C0F]">{title}</h3>
            {right}
        </div>
        {children}
    </div>
);

const HeaderActions = ({
    editing,
    onEdit,
    onCancel,
    onSave,
    editLabel = "Edit",
    saveLabel = "Save",
}: {
    editing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    editLabel?: string;
    saveLabel?: string;
}) =>
    !editing ? (
        <Button
            type="button"
            onClick={onEdit}
            className="text-[14px] font-medium text-[#5383DA] hover:underline"
            overrideClasses
        >
            {editLabel}
        </Button>
    ) : (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                onClick={onCancel}
                className="h-8 rounded-lg border border-[#C2CAD6] px-3 text-sm text-[#3D495C]"
                overrideClasses
            >
                Cancel
            </Button>
            <Button
                type="button"
                onClick={onSave}
                className="h-8 rounded-lg bg-[#2351A3] px-3 text-sm font-medium text-white"
                overrideClasses
            >
                {saveLabel}
            </Button>
        </div>
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
                    <CardShell
                        title="Contact person details"
                        right={
                            <HeaderActions
                                editing={isEditing.contact}
                                onEdit={() => startEdit("contact")}
                                onCancel={() => cancelEdit("contact")}
                                onSave={() => saveEdit("contact")}
                                editLabel="Edit"
                            />
                        }
                    >
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
                                            <TailwindCustomInput
                                                type="text"
                                                placeholder="Enter your full name"
                                                value={draft.contact.fullName}
                                                onChange={(e) => setContact({ fullName: e.target.value })}
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
                                            <TailwindCustomInput
                                                type="email"
                                                placeholder="Enter an email"
                                                value={draft.contact.email}
                                                onChange={(e) => setContact({ email: e.target.value })}
                                                className="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/20"
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
                                            <TailwindCustomInput
                                                type="tel"
                                                placeholder="Phone"
                                                value={draft.contact.phone}
                                                onChange={(e) => setContact({ phone: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </dd>
                            </dl>
                        </div>
                    </CardShell>

                    <CardShell
                        title="Passenger 01 details"
                        right={
                            <HeaderActions
                                editing={isEditing.passenger}
                                onEdit={() => startEdit("passenger")}
                                onCancel={() => cancelEdit("passenger")}
                                onSave={() => saveEdit("passenger")}
                                editLabel="Edit"
                            />
                        }
                    >
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
                                            <TailwindCustomInput
                                                type="text"
                                                placeholder="Enter passport number"
                                                value={draft.passenger.passportNumber}
                                                onChange={(e) => setPassenger({ passportNumber: e.target.value })}
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
                    </CardShell>

                    <CardShell
                        title="Seat"
                        right={
                            <HeaderActions
                                editing={isEditing.seat}
                                onEdit={() => startEdit("seat")}
                                onCancel={() => cancelEdit("seat")}
                                onSave={() => saveEdit("seat")}
                                editLabel="Change"
                            />
                        }
                    >
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
                                            <TailwindCustomInput
                                                type="text"
                                                placeholder="Enter passport number"
                                                value={draft.seat.seatNo}
                                                onChange={(e) => setSeat({ seatNo: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </dd>
                            </dl>
                        </div>
                    </CardShell>

                    <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-sm">
                        <div className="px-4 py-3 border-b border-[#E4E4E7]">
                            <h3 className="text-[15px] font-medium text-[#0A0C0F]">Got a promo code?</h3>
                        </div>

                        <div className="px-3 py-3">
                            <label className="mb-1 block text-[12px] text-[#3D495C]">Promo code</label>

                            <div className="flex items-center gap-3">
                                <TailwindCustomInput
                                    type="text"
                                    placeholder="Enter a promo code"
                                    className="h-10 w-full rounded-xl border border-[#C2CAD6] px-4 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/20"
                                />
                                <Button
                                    type="button"
                                    className="h-10 shrink-0 rounded-lg bg-[#2351A3] px-6 text-[15px] font-semibold text-[#F2F2F3]"
                                    overrideClasses
                                >
                                    Apply
                                </Button>
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

                            <TailwindCustomInput
                                type="text"
                                placeholder="ES66YTR778"
                                className="h-11 w-full rounded-xl border border-[#C2CAD6] px-4 text-[14px] font-medium text-[#0A0C0F] placeholder:text-[#C2CAD6] focus:outline-none focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/20"
                                label="Membership ID"
                                labelClass="mb-1 block text-[12px] text-[#3D495C]"
                            />

                            <div className="pt-3 flex justify-center">
                                <Button
                                    type="button"
                                    className="h-10 rounded-lg bg-[#2351A3] px-8 text-[15px] font-semibold text-[#F2F2F3]"
                                    overrideClasses
                                >
                                    Fetch details
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>


                {/* RIGHT: Trip details */}
                <div>
                    <FlightSummaryCard
                        title="Flight details"
                        headerActionText="View all"
                        onHeaderActionClick={() => {/* handle view all */ }}
                        segments={[
                            {
                                route: <>Dubai (DXB) <span className="mx-2">→</span> Mumbai (BOM)</>,
                                airlineLogo: EmirateLogo,
                                airlineName: "Emirates Airlines",
                                flightMeta: "EK 1234 – Economy class",
                                amenities: [
                                    { src: cabinIcon, alt: "Cabin", title: "Cabin: 1PC" },
                                    { src: baggageIcon, alt: "Baggage", title: "Baggage: 20KG" },
                                    { src: mealIcon, alt: "Meal", title: "Meal Included" },
                                    { src: wifiIcon, alt: "Wi-Fi", title: "WiFi Available" },
                                    { src: portIcon, alt: "Beverage", title: "Beverages" },
                                    { src: entertainmentIcon, alt: "Entertainment", title: "Entertainment" },
                                ],
                                dep: { time: "10:45 AM", date: "Mon, 16 June 2025" },
                                arr: { time: "02:00 PM", date: "Mon, 16 June 2025" },
                                durationLabel: "Duration: 03 hours 15 minutes",
                                tag: "Direct",
                            },
                        ]}
                        fare={{
                            value: "Economy standard",
                            changeText: "Change",
                            onChangeClick: () => {/* open fare change */ },
                        }}
                    />

                    <FLightFareRule />

                    <FLightPriceBreakdown
                        open={openPrice}
                        onToggleOpen={() => setOpenPrice(v => !v)}
                    />
                </div>


            </div>

            <div className="mt-14 flex justify-center w-full">
                <Button
                    type="button"
                    className="h-10 w-full max-w-[420px] rounded-lg bg-[#2351A3] px-8 text-[15px] font-semibold text-[#F2F2F3]"
                    overrideClasses
                >
                    Continue to payment
                </Button>
            </div>

        </section>
    );
}