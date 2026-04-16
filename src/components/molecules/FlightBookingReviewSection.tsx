import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
// import entertainmentIcon from "../../assets/svgs/entertainment.svg";
// import mealIcon from "../../assets/svgs/meals.svg";
// import portIcon from "../../assets/svgs/ports.svg";
// import wifiIcon from "../../assets/svgs/wifi.svg";
import durationIcon from "../../assets/svgs/duration.svg";
import refundableIcon from "../../assets/svgs/redundable.svg";
import SEAT_ICON from "../../assets/svgs/seat.svg";
import PLANE_ICON from "../../assets/svgs/plane.svg";
import EmirateLogo from "../../assets/images/emirates.png";
import React, { useState } from "react";
import FLightPriceBreakdown from "../atoms/FlightPriceBreakdown";
import Button from "../atoms/Button";
import FlightSummaryCard from "../atoms/FlightSummaryCard";
import FLightFareRule from "../atoms/FlightFareRule";
import {
    buildFlightSegmentFromTrip,
    getPriceCabinClassForFlightSummary,
} from "../../utils/helpers";
import type { CountryOption } from "../../features/flights/types";

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

// const HeaderActions = ({
//     onEdit,
//     editLabel = "Edit",
// }: {
//     onEdit: () => void;
//     editLabel?: string;
// }) =>
//     <Button
//         type="button"
//         onClick={onEdit}
//         className="text-[14px] font-medium text-[#5383DA] hover:underline"
//         overrideClasses
//     >
//         {editLabel}
//     </Button>

type FlightBookingReviewSectionProps = {
    trip: any;
    fareBookingSearchRules?: any;
    flightBookingPayload?: any;
    countries: CountryOption[];
    onNext?: () => void;
    onEditDetails?: () => void;
    onChangeFlight?: () => void;
    ancillarySummary?: {
        totalAmount: number;
        currency: string;
        selectedCount: number;
        breakdown?: Array<{
            category: "baggage" | "meals" | "seats" | "other";
            label: string;
            amount: number;
            currency: string;
            ancillaryOfferId: string;
        }>;
    };
};

export default function FlightBookingReviewSection({
    trip,
    flightBookingPayload,
    countries = [],
    onNext,
    // onEditDetails,
    onChangeFlight,
    ancillarySummary,
}: FlightBookingReviewSectionProps) {
    const [openPrice, setOpenPrice] = useState(false);
    const passengers = flightBookingPayload?.passengers || [];

    // const startEdit = () => {
    //     if (typeof onEditDetails === "function") {
    //         onEditDetails();
    //     }
    // };

    const assets = {
        EmirateLogo,
        cabinIcon,
        baggageIcon,
        mealIcon: refundableIcon,
        wifiIcon: durationIcon,
        portIcon: SEAT_ICON,
        entertainmentIcon: PLANE_ICON
    };
    const segments = buildFlightSegmentFromTrip(trip, assets);

    const firstPrice = getPriceCabinClassForFlightSummary(trip);

    const priceFareFamily = {
        label: "Fare family",
        value: firstPrice?.label ?? firstPrice?._priceClasses?.[0] ?? "Fare family",
        changeText: "Modify search",
        onChangeClick: () => {
            if (typeof onChangeFlight === "function") {
                onChangeFlight();
            }
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
                        <React.Fragment key={p.passengerKey || idx}>
                            <CardShell
                                title={`Contact person ${String(idx + 1).padStart(
                                    2,
                                    "0"
                                )} details`}
                            // right={
                            //     <HeaderActions
                            //         onEdit={() => startEdit()}
                            //         editLabel="Edit"
                            //     />
                            // }
                            >
                                <div className="px-5 py-4">
                                    <dl className="grid grid-cols-2 gap-y-2">
                                        {/* Title */}
                                        <dt className="text-[12px] text-[#3D495C]">Title</dt>
                                        <dd className="text-right">
                                            <span className="text-[14px] text-[#0A0C0F] font-medium">
                                                {p.passengerInfo?.nameTitle || "—"}
                                            </span>
                                        </dd>

                                        {/* Full Name */}
                                        <dt className="text-[12px] text-[#3D495C]">Full Name</dt>
                                        <dd className="text-right">
                                            <span className="text-[14px] text-[#0A0C0F] font-medium">
                                                {p.passengerInfo?.givenName
                                                    ? `${p.passengerInfo.givenName}`
                                                    : "—"}
                                            </span>
                                        </dd>

                                        {/* Email - only show if required by fare rules */}
                                        {/* {fareBookingSearchRules?.isLeadEmailAddressMandatory && ( */}
                                        <>
                                            <dt className="text-[12px] text-[#3D495C]">Email</dt>
                                            <dd className="text-right">
                                                <span className="text-[14px] text-[#0A0C0F] font-medium">
                                                    {p.contact?.contactsProvided?.[0]
                                                        ?.emailAddress?.[0] || "—"}
                                                </span>
                                            </dd>
                                        </>
                                        {/* )} */}

                                        {/* Phone - only show if required by fare rules */}
                                        {/* {fareBookingSearchRules?.isLeadPhoneNumberMandatory && ( */}
                                        <>
                                            <dt className="text-[12px] text-[#3D495C]">Phone</dt>
                                            <dd className="text-right">
                                                {p.contact?.contactsProvided?.[0]?.phone?.[0]
                                                    ?.phoneNumber
                                                    ? `${p.contact.contactsProvided[0].phone[0].phoneNumber}`
                                                    : "—"}
                                            </dd>
                                        </>
                                        {/* )} */}
                                    </dl>
                                </div>
                            </CardShell>
                            <CardShell
                                key={`passenger-${p.passengerKey || idx}`}
                                title={`Traveler ${String(idx + 1).padStart(2, "0")} details`}
                            // right={
                            //     <HeaderActions
                            //         onEdit={() => startEdit()}
                            //         editLabel="Edit"
                            //     />
                            // }
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
                                        {/* {fareBookingSearchRules?.passengerRules?.[0]
                                            ?.isDocumentNumberMandatory && ( */}
                                        <>
                                            <dt className="text-[12px] text-[#3D495C]">
                                                Passport number
                                            </dt>
                                            <dd className="text-right">
                                                <span className="text-[14px] text-[#0A0C0F] font-medium">
                                                    {p.identityDocuments?.[0]?.idDocumentNumber || "—"}
                                                </span>
                                            </dd>
                                        </>
                                        {/* )} */}

                                        {/* {fareBookingSearchRules?.passengerRules?.[0]
                                            ?.isIssuingCountryCodeMandatory && ( */}
                                        <>
                                            <dt className="text-[12px] text-[#3D495C]">
                                                Issuing country
                                            </dt>
                                            <dd className="text-right">
                                                <span className="text-[14px] text-[#0A0C0F] font-medium">
                                                    {countries.find(
                                                        (c) =>
                                                            c.iso3 ===
                                                            p.identityDocuments?.[0]?.issuingCountryCode
                                                        // )?.label ||
                                                    )?.iso3 ||
                                                        p.identityDocuments?.[0]?.issuingCountryCode ||
                                                        "—"}
                                                </span>
                                            </dd>
                                        </>
                                        {/* )} */}

                                        {/* {fareBookingSearchRules?.passengerRules?.[0]
                                            ?.isExpiryDateMandatory && ( */}
                                        <>
                                            <dt className="text-[12px] text-[#3D495C]">
                                                Expiry date
                                            </dt>
                                            <dd className="text-right">
                                                <span className="text-[14px] text-[#0A0C0F] font-medium">
                                                    {p.identityDocuments?.[0]?.expiryDate || "—"}
                                                </span>
                                            </dd>
                                        </>
                                        {/* )} */}
                                    </dl>
                                </div>
                            </CardShell>
                        </React.Fragment>
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

                    {/* <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-sm">
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
                    </div> */}
                </div>

                {/* RIGHT: Trip details */}
                <div>
                    <FlightSummaryCard
                        title="Flight details"
                        headerActionText="Change"
                        onHeaderActionClick={() => {
                            if (typeof onChangeFlight === "function") onChangeFlight();
                        }}
                        segments={segments}
                        fare={priceFareFamily}
                    />

                    <FLightFareRule trip={trip.raw} />

                    <FLightPriceBreakdown
                        open={openPrice}
                        onToggleOpen={() => setOpenPrice((v) => !v)}
                        trip={trip.raw}
                        ancillarySummary={ancillarySummary}
                    />
                </div>
            </div>

            <div className="mt-5 flex justify-center w-full">
                <Button
                    type="button"
                    overrideClasses
                    onClick={() => continueToPayment()}
                    className="
      h-[47px]
      w-[252px]
      px-[40px]
      rounded-[100px]
      text-[16px]
      font-semibold
      text-white
      flex items-center justify-center gap-[10px]
      bg-[linear-gradient(90.59deg,#5383DA_0%,#2351A3_50%,#081326_100%)]
    "
                >
                    Continue to payment
                </Button>
            </div>

        </section>
    );
}