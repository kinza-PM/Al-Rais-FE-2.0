import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import entertainmentIcon from "../../assets/svgs/entertainment.svg";
import mealIcon from "../../assets/svgs/meals.svg";
import portIcon from "../../assets/svgs/ports.svg";
import wifiIcon from "../../assets/svgs/wifi.svg";
import arrownDownwardIcon from "../../assets/svgs/arrow-downwards.svg";
import EmirateLogo from "../../assets/images/emirates.png";
import { useState } from "react";
import { flightBookingReviewSeatDetail } from "../../utils/mockData";
import FLightPriceBreakdown from "../atoms/FlightPriceBreakdown";
import Button from "../atoms/Button";
import FlightSummaryCard from "../atoms/FlightSummaryCard";
import TailwindCustomInput from "../common/TailwindCustomInput";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
import FLightFareRule from "../atoms/FlightFareRule";
import {
    buildFlightSegmentFromTrip,
    formatDateToLocalISO,
    getPriceCabinClassForFlightSummary,
    parseLocalDateString,
} from "../../utils/helpers";

function ChevronDown() {
    return (
        <img
            alt="arrow-icon"
            src={arrownDownwardIcon}
            className="pointer-events-none absolute right-3 top-4"
        />
    );
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
    showSave = true,
}: {
    editing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    editLabel?: string;
    saveLabel?: string;
    showSave?: boolean;
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
            {showSave && (
                <Button
                    type="button"
                    onClick={onSave}
                    className="h-8 rounded-lg bg-[#2351A3] px-3 text-sm font-medium text-white"
                    overrideClasses
                >
                    {saveLabel}
                </Button>
            )}
        </div>
    );

type FlightBookingReviewSectionProps = {
    trip: any;
    fareBookingSearchRules?: any;
    flightBookingPayload?: any;
    onPassengerFieldChange?: (index: number, path: string, value: any) => void;
    cities?: Array<{ id: string; code: string; label: string; city: string }>;
    onNext?: () => void;
};

export default function FlightBookingReviewSection({
    trip,
    fareBookingSearchRules,
    flightBookingPayload,
    onPassengerFieldChange,
    cities = [],
    onNext,
}: FlightBookingReviewSectionProps) {
    const [openPrice, setOpenPrice] = useState(false);

    const [isEditing, setIsEditing] = useState<{
        contact: boolean;
        passenger: boolean;
        seat: boolean;
    }>({
        contact: false,
        passenger: false,
        seat: false,
    });

    const passengers = flightBookingPayload?.passengers || [];

    const [values, setValues] = useState({
        seat: flightBookingReviewSeatDetail,
    });
    const [draft, setDraft] = useState(values);

    // generic helpers
    const startEdit = (section: "contact" | "passenger" | "seat") => {
        if (section === "seat") {
            setDraft((d) => ({ ...d, [section]: values[section] }));
        }
        setIsEditing((s) => ({ ...s, [section]: true }));
    };
    const cancelEdit = (section: "contact" | "passenger" | "seat") =>
        setIsEditing((s) => ({ ...s, [section]: false }));
    const saveEdit = (section: "contact" | "passenger" | "seat") => {
        if (section === "seat") {
            setValues((v) => ({ ...v, [section]: draft[section] }));
        }
        setIsEditing((s) => ({ ...s, [section]: false }));
    };

    const assets = {
        EmirateLogo,
        cabinIcon,
        baggageIcon,
        mealIcon,
        wifiIcon,
        portIcon,
        entertainmentIcon,
    };
    const segments = buildFlightSegmentFromTrip(trip, assets);

    const firstPrice = getPriceCabinClassForFlightSummary(trip);

    const priceFareFamily = {
        label: "Fare family",
        value: firstPrice?.label ?? firstPrice?._priceClasses?.[0] ?? "Fare family",
        changeText: "Change",
        onChangeClick: () => {
            console.log("open fare change");
        },
    };

    const continueToPayment = () => {
        if (typeof onNext === "function") {
            onNext();
        }
    }

    return (
        <section className="mx-auto max-w-full px-10">
            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                {/* LEFT: Forms */}
                <div className="space-y-4">
                    {passengers.map((p: any, idx: number) => (
                        <>
                            <CardShell
                                key={p.passengerKey || idx}
                                title={`Contact person ${String(idx + 1).padStart(
                                    2,
                                    "0"
                                )} details`}
                                right={
                                    <HeaderActions
                                        editing={isEditing.contact}
                                        onEdit={() => startEdit("contact")}
                                        onCancel={() => cancelEdit("contact")}
                                        onSave={() => saveEdit("contact")}
                                        editLabel="Edit"
                                        showSave={false}
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
                                                    {p.passengerInfo?.nameTitle || "—"}
                                                </span>
                                            ) : (
                                                <div className="inline-block w-full max-w-[320px] relative">
                                                    <select
                                                        value={p.passengerInfo?.nameTitle || ""}
                                                        onChange={(e) =>
                                                            onPassengerFieldChange?.(
                                                                idx,
                                                                "passengerInfo.nameTitle",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-left text-[#0A0C0F] focus:outline-none"
                                                    >
                                                        <option value="">Select title</option>
                                                        <option value="MR">Mr</option>
                                                        <option value="MS">Ms</option>
                                                        <option value="MRS">Mrs</option>
                                                    </select>
                                                    <ChevronDown />
                                                </div>
                                            )}
                                        </dd>

                                        {/* Full Name */}
                                        <dt className="text-[12px] text-[#3D495C]">Full Name</dt>
                                        <dd className="text-right">
                                            {!isEditing.contact ? (
                                                <span className="text-[14px] text-[#0A0C0F] font-medium">
                                                    {p.passengerInfo?.givenName
                                                        ? `${p.passengerInfo.givenName}`
                                                        : "—"}
                                                </span>
                                            ) : (
                                                <div className="inline-block w-full max-w-[320px]">
                                                    <TailwindCustomInput
                                                        type="text"
                                                        placeholder="Enter your full name"
                                                        value={
                                                            p.passengerInfo?.givenName
                                                                ? `${p.passengerInfo?.givenName}`
                                                                : ""
                                                        }
                                                        onChange={(e) => {
                                                            onPassengerFieldChange?.(
                                                                idx,
                                                                "passengerInfo.givenName",
                                                                e.target.value
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </dd>

                                        {/* Email - only show if required by fare rules */}
                                        {fareBookingSearchRules?.isLeadEmailAddressMandatory && (
                                            <>
                                                <dt className="text-[12px] text-[#3D495C]">Email</dt>
                                                <dd className="text-right">
                                                    {!isEditing.contact ? (
                                                        <span className="text-[14px] text-[#0A0C0F] font-medium">
                                                            {p.contact?.contactsProvided?.[0]
                                                                ?.emailAddress?.[0] || "—"}
                                                        </span>
                                                    ) : (
                                                        <div className="inline-block w-full max-w-[320px]">
                                                            <TailwindCustomInput
                                                                type="email"
                                                                placeholder="Enter an email"
                                                                value={
                                                                    p.contact?.contactsProvided?.[0]
                                                                        ?.emailAddress?.[0] || ""
                                                                }
                                                                onChange={(e) =>
                                                                    onPassengerFieldChange?.(
                                                                        idx,
                                                                        "contact.contactsProvided.0.emailAddress.0",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/20"
                                                            />
                                                        </div>
                                                    )}
                                                </dd>
                                            </>
                                        )}

                                        {/* Phone - only show if required by fare rules */}
                                        {fareBookingSearchRules?.isLeadPhoneNumberMandatory && (
                                            <>
                                                <dt className="text-[12px] text-[#3D495C]">Phone</dt>
                                                <dd className="text-right">
                                                    {!isEditing.contact ? (
                                                        <span className="text-[14px] text-[#0A0C0F] font-medium">
                                                            {p.contact?.contactsProvided?.[0]?.phone?.[0]
                                                                ?.phoneNumber
                                                                ? `${p.contact.contactsProvided[0].phone[0].phoneNumber}`
                                                                : "—"}
                                                        </span>
                                                    ) : (
                                                        <div className="inline-block w-full max-w-[320px]">
                                                            <TailwindCustomInput
                                                                type="tel"
                                                                placeholder="Phone"
                                                                value={
                                                                    p.contact?.contactsProvided?.[0]?.phone?.[0]
                                                                        ?.phoneNumber || ""
                                                                }
                                                                onChange={(e) =>
                                                                    onPassengerFieldChange?.(
                                                                        idx,
                                                                        "contact.contactsProvided.0.phone.0.phoneNumber",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </dd>
                                            </>
                                        )}
                                    </dl>
                                </div>
                            </CardShell>
                            <CardShell
                                key={`passenger-${p.passengerKey || idx}`}
                                title={`Passenger ${String(idx + 1).padStart(2, "0")} details`}
                                right={
                                    <HeaderActions
                                        editing={isEditing.passenger}
                                        onEdit={() => startEdit("passenger")}
                                        onCancel={() => cancelEdit("passenger")}
                                        onSave={() => saveEdit("passenger")}
                                        editLabel="Edit"
                                        showSave={false}
                                    />
                                }
                            >
                                <div className="px-5 py-4">
                                    <dl className="grid grid-cols-2 gap-y-2">
                                        {/* Pax type - disabled */}
                                        <dt className="text-[12px] text-[#3D495C]">Pax type</dt>
                                        <dd className="text-right">
                                            <span className="text-[14px] text-[#0A0C0F] font-medium">
                                                {p.ptc || "—"}
                                            </span>
                                        </dd>

                                        {/* Passport number - only show if required by fare rules */}
                                        {fareBookingSearchRules?.passengerRules?.[0]
                                            ?.isDocumentNumberMandatory && (
                                                <>
                                                    <dt className="text-[12px] text-[#3D495C]">
                                                        Passport number
                                                    </dt>
                                                    <dd className="text-right">
                                                        {!isEditing.passenger ? (
                                                            <span className="text-[14px] text-[#0A0C0F] font-medium">
                                                                {p.identityDocuments?.[0]?.idDocumentNumber || "—"}
                                                            </span>
                                                        ) : (
                                                            <div className="inline-block w-full max-w-[320px]">
                                                                <TailwindCustomInput
                                                                    type="text"
                                                                    placeholder="Enter passport number"
                                                                    value={
                                                                        p.identityDocuments?.[0]?.idDocumentNumber || ""
                                                                    }
                                                                    onChange={(e) =>
                                                                        onPassengerFieldChange?.(
                                                                            idx,
                                                                            "identityDocuments.0.idDocumentNumber",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                    </dd>
                                                </>
                                            )}

                                        {fareBookingSearchRules?.passengerRules?.[0]
                                            ?.isIssuingCountryCodeMandatory && (
                                                <>
                                                    <dt className="text-[12px] text-[#3D495C]">
                                                        Issuing country
                                                    </dt>
                                                    <dd className="text-right">
                                                        {!isEditing.passenger ? (
                                                            <span className="text-[14px] text-[#0A0C0F] font-medium">
                                                                {cities.find(
                                                                    (c) =>
                                                                        c.code ===
                                                                        p.identityDocuments?.[0]?.issuingCountryCode
                                                                )?.city ||
                                                                    p.identityDocuments?.[0]?.issuingCountryCode ||
                                                                    "—"}
                                                            </span>
                                                        ) : (
                                                            <div className="inline-block w-full max-w-[320px] relative">
                                                                <select
                                                                    value={
                                                                        p.identityDocuments?.[0]?.issuingCountryCode ||
                                                                        ""
                                                                    }
                                                                    onChange={(e) =>
                                                                        onPassengerFieldChange?.(
                                                                            idx,
                                                                            "identityDocuments.0.issuingCountryCode",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-left text-[#0A0C0F] focus:outline-none"
                                                                >
                                                                    <option value="">Select country</option>
                                                                    {cities?.map((c) => (
                                                                        <option key={c.code} value={c.code}>
                                                                            {c.city}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <svg
                                                                    width="12"
                                                                    height="7"
                                                                    viewBox="0 0 12 7"
                                                                    fill="none"
                                                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                                                                >
                                                                    <path
                                                                        d="M11.354 1.354L6.354 6.354a1 1 0 0 1-1.414 0L0.646 1.354"
                                                                        stroke="#3D495C"
                                                                        strokeWidth="1"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </dd>
                                                </>
                                            )}

                                        {fareBookingSearchRules?.passengerRules?.[0]
                                            ?.isExpiryDateMandatory && (
                                                <>
                                                    <dt className="text-[12px] text-[#3D495C]">
                                                        Expiry date
                                                    </dt>
                                                    <dd className="text-right">
                                                        {!isEditing.passenger ? (
                                                            <span className="text-[14px] text-[#0A0C0F] font-medium">
                                                                {p.identityDocuments?.[0]?.expiryDate || "—"}
                                                            </span>
                                                        ) : (
                                                            <div className="inline-block w-full max-w-[320px]">
                                                                <TailiwindCustomDatePicker
                                                                    value={p.identityDocuments?.[0]?.expiryDate ? parseLocalDateString(p.identityDocuments?.[0]?.expiryDate) : null}
                                                                    onChange={(date) => {
                                                                        const iso = formatDateToLocalISO(date);
                                                                        onPassengerFieldChange?.(idx, "identityDocuments.0.expiryDate", iso);
                                                                    }}
                                                                    placeholder="Please select"
                                                                    overridesClass
                                                                    inputClass="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none"
                                                                />
                                                            </div>
                                                        )}
                                                    </dd>
                                                </>
                                            )}
                                    </dl>
                                </div>
                            </CardShell>
                        </>
                    ))}

                    {/* <CardShell
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
                                                onChange={(e) =>
                                                    setDraft((d) => ({ ...d, seat: { ...d.seat, cabinClass: e.target.value } }))
                                                }
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
                                                <path
                                                    d="M11.354 1.354L6.354 6.354a1 1 0 0 1-1.414 0L0.646 1.354"
                                                    stroke="#3D495C"
                                                    strokeWidth="1"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
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
                                                onChange={(e) => setDraft((d) => ({ ...d, seat: { ...d.seat, seatNo: e.target.value } }))}
                                            />
                                        </div>
                                    )}
                                </dd>
                            </dl>
                        </div>
                    </CardShell> */}

                    <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-sm">
                        <div className="px-4 py-3 border-b border-[#E4E4E7]">
                            <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                                Got a promo code?
                            </h3>
                        </div>

                        <div className="px-3 py-3">
                            <label className="mb-1 block text-[12px] text-[#3D495C]">
                                Promo code
                            </label>

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
                            <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                                Earn and redeem air miles
                            </h3>
                        </div>

                        <div className="px-3 py-3 space-y-2">
                            <div>
                                <label className="mb-1 block text-[12px] text-[#3D495C]">
                                    Flight program
                                </label>
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
                        onHeaderActionClick={() => {
                            /* handle view all */
                        }}
                        segments={segments}
                        fare={priceFareFamily}
                    />

                    <FLightFareRule trip={trip.raw} />

                    <FLightPriceBreakdown
                        open={openPrice}
                        onToggleOpen={() => setOpenPrice((v) => !v)}
                        trip={trip.raw}
                    />
                </div>
            </div>

            <div className="mt-14 flex justify-center w-full">
                <Button
                    type="button"
                    className="h-10 w-full max-w-[420px] rounded-lg bg-[#2351A3] px-8 text-[15px] font-semibold text-[#F2F2F3]"
                    overrideClasses
                    onClick={() => continueToPayment()}
                >
                    Continue to payment
                </Button>
            </div>
        </section>
    );
}