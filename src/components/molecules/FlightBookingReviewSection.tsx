import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
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
import TailwindCustomInput from "../common/TailwindCustomInput";
import {
  buildFlightSegmentFromTrip,
  getPriceCabinClassForFlightSummary,
} from "../../utils/helpers";
import type { CountryOption } from "../../features/flights/types";

const PTC_LABEL: Record<string, string> = {
  ADT: "Adult",
  CHD: "Child",
  INF: "Infant",
};

const CardShell = ({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="rounded-[12px] border border-[#E4E4E7] bg-white">
    <div className="flex items-center justify-between gap-3 border-b border-[#E4E4E7] px-5 py-4">
      <h3 className="text-[16px] font-semibold leading-tight text-[#0A0C0F]">
        {title}
      </h3>
      {right}
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>
);

type FlightBookingReviewSectionProps = {
  trip: any;
  fareBookingSearchRules?: any;
  fareRuleData?: any;
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
  seatAddOnAvailable?: boolean;
  onAddAddOns?: () => void;
};

export default function FlightBookingReviewSection({
  trip,
  fareRuleData,
  flightBookingPayload,
  countries = [],
  onNext,
  onEditDetails,
  onChangeFlight,
  ancillarySummary,
  seatAddOnAvailable = false,
  onAddAddOns,
}: FlightBookingReviewSectionProps) {
  const [openPrice, setOpenPrice] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoAppliedHint, setPromoAppliedHint] = useState<string | null>(null);

  const passengers = flightBookingPayload?.passengers || [];
  const contactLead = passengers[0];

  const startEdit = () => {
    if (typeof onEditDetails === "function") onEditDetails();
  };

  const editLink =
    typeof onEditDetails === "function" ? (
      <Button
        type="button"
        onClick={startEdit}
        className="text-[14px] font-medium text-[#2351A3] hover:underline"
        overrideClasses
      >
        Edit
      </Button>
    ) : null;

  const seatChangeControl =
    typeof onAddAddOns === "function" && seatAddOnAvailable ? (
      <Button
        type="button"
        onClick={() => onAddAddOns()}
        className="text-[14px] font-medium text-[#2351A3] hover:underline"
        overrideClasses
      >
        Change
      </Button>
    ) : editLink;

  const assets = {
    EmirateLogo,
    cabinIcon,
    baggageIcon,
    mealIcon: refundableIcon,
    wifiIcon: durationIcon,
    portIcon: SEAT_ICON,
    entertainmentIcon: PLANE_ICON,
  };
  const segments = buildFlightSegmentFromTrip(trip, assets);

  const firstPrice = getPriceCabinClassForFlightSummary(trip);

  const priceFareFamily = {
    label: "Fare family",
    value: firstPrice?.label ?? firstPrice?._priceClasses?.[0] ?? "Fare family",
    changeText: "Modify search",
    onChangeClick: () => {
      if (typeof onChangeFlight === "function") onChangeFlight();
    },
  };

  const continueToPayment = () => {
    if (typeof onNext === "function") onNext();
  };

  const showAddAddOnsBanner =
    typeof onAddAddOns === "function" &&
    (ancillarySummary?.selectedCount ?? 0) === 0;

  const cabinClassLabel = (() => {
    const journeys = trip?.raw?.journey ?? trip?.journey ?? [];
    const firstSeg = journeys?.[0]?.flightSegments?.[0];
    return firstSeg?.cabinClass ?? firstSeg?.cabin ?? "—";
  })();

  const seatLabelsFromAncillaries = (ancillarySummary?.breakdown || [])
    .filter((b) => b?.category === "seats" && String(b?.label || "").trim())
    .map((b) => String(b.label).trim());

  const seatLabelsFromPassengers = (passengers || [])
    .map((p: any) => String(p?.seat || "").trim())
    .filter(Boolean)
    .map((s: string) =>
      s.toLowerCase().startsWith("seat ") ? s : `Seat ${s}`,
    );

  const seatDisplayText = seatLabelsFromAncillaries.length
    ? seatLabelsFromAncillaries.join(", ")
    : seatLabelsFromPassengers.length
      ? seatLabelsFromPassengers.join(", ")
      : "";

  const seatLabel =
    seatDisplayText ||
    (seatAddOnAvailable ? "No seat selected" : "Assigned at check-in");

  const fullName = (p: any) => {
    const g = String(p?.passengerInfo?.givenName ?? "").trim();
    const s = String(p?.passengerInfo?.surname ?? "").trim();
    const both = [g, s].filter(Boolean).join(" ");
    return both || "—";
  };

  const issuingCountryLabel = (p: any) => {
    const code = p?.identityDocuments?.[0]?.issuingCountryCode;
    const hit = countries.find((c) => c.iso3 === code);
    return hit?.label || hit?.iso3 || code || "—";
  };

  const paxTypeLabel = (p: any) =>
    PTC_LABEL[String(p?.ptc ?? "").toUpperCase()] || p?.ptc || "—";

  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 pb-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(400px,38%)]">
        <div className="flex flex-col gap-6">
          {contactLead ? (
            <CardShell title="Contact person details" right={editLink}>
              <dl className="m-0 grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-6">
                <dt className="text-[12px] font-normal text-[#3D495C]">Title</dt>
                <dd className="text-right sm:col-start-2">
                  <span className="text-[14px] font-medium text-[#0A0C0F]">
                    {contactLead.passengerInfo?.nameTitle || "—"}
                  </span>
                </dd>

                <dt className="text-[12px] font-normal text-[#3D495C]">
                  Full Name
                </dt>
                <dd className="text-right sm:col-start-2">
                  <span className="text-[14px] font-medium text-[#0A0C0F]">
                    {fullName(contactLead)}
                  </span>
                </dd>

                <dt className="text-[12px] font-normal text-[#3D495C]">Email</dt>
                <dd className="text-right sm:col-start-2">
                  <span className="text-[14px] font-medium text-[#0A0C0F]">
                    {contactLead.contact?.contactsProvided?.[0]
                      ?.emailAddress?.[0] || "—"}
                  </span>
                </dd>

                <dt className="text-[12px] font-normal text-[#3D495C]">Phone</dt>
                <dd className="text-right sm:col-start-2">
                  <span className="text-[14px] font-medium text-[#0A0C0F]">
                    {contactLead.contact?.contactsProvided?.[0]?.phone?.[0]
                      ?.phoneNumber
                      ? `${contactLead.contact.contactsProvided[0].phone[0].areaCode ? `${contactLead.contact.contactsProvided[0].phone[0].areaCode}-` : ""}${contactLead.contact.contactsProvided[0].phone[0].phoneNumber}`
                      : "—"}
                  </span>
                </dd>
              </dl>
            </CardShell>
          ) : null}

          {passengers.map((p: any, idx: number) => (
            <CardShell
              key={p.passengerKey || idx}
              title={`Passenger ${String(idx + 1).padStart(2, "0")} details`}
              right={editLink}
            >
              <dl className="m-0 grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-6">
                <dt className="text-[12px] font-normal text-[#3D495C]">
                  Pax type
                </dt>
                <dd className="text-right sm:col-start-2">
                  <span className="text-[14px] font-medium text-[#0A0C0F]">
                    {paxTypeLabel(p)}
                  </span>
                </dd>

                <dt className="text-[12px] font-normal text-[#3D495C]">
                  Passport number
                </dt>
                <dd className="text-right sm:col-start-2">
                  <span className="text-[14px] font-medium text-[#0A0C0F]">
                    {p.identityDocuments?.[0]?.idDocumentNumber || "—"}
                  </span>
                </dd>

                <dt className="text-[12px] font-normal text-[#3D495C]">
                  Issuing country
                </dt>
                <dd className="text-right sm:col-start-2">
                  <span className="text-[14px] font-medium text-[#0A0C0F]">
                    {issuingCountryLabel(p)}
                  </span>
                </dd>

                <dt className="text-[12px] font-normal text-[#3D495C]">
                  Expiry date
                </dt>
                <dd className="text-right sm:col-start-2">
                  <span className="text-[14px] font-medium text-[#0A0C0F]">
                    {p.identityDocuments?.[0]?.expiryDate || "—"}
                  </span>
                </dd>
              </dl>
            </CardShell>
          ))}

          <CardShell title="Seat" right={seatChangeControl}>
            <dl className="m-0 grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-6">
              <dt className="text-[12px] font-normal text-[#3D495C]">
                Cabin class
              </dt>
              <dd className="text-right sm:col-start-2">
                <span className="text-[14px] font-medium text-[#0A0C0F]">
                  {cabinClassLabel || "—"}
                </span>
              </dd>

              <dt className="text-[12px] font-normal text-[#3D495C]">
                Seat no.
              </dt>
              <dd className="text-right sm:col-start-2">
                <span className="text-[14px] font-medium text-[#0A0C0F]">
                  {seatLabel}
                </span>
              </dd>
            </dl>
          </CardShell>

          <CardShell
            title="Got a promo code?"
            right={
              promoAppliedHint ? (
                <span className="text-[12px] font-medium text-[#2351A3]">
                  {promoAppliedHint}
                </span>
              ) : null
            }
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <TailwindCustomInput
                type="text"
                value={promoCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPromoCode(e.target.value)
                }
                placeholder="Enter a promo code"
                className="h-11 min-h-[44px] w-full flex-1 rounded-[12px] border border-[#E4E4E7] px-4 text-[14px] text-[#0A0C0F] placeholder:text-[#94A3B8] focus:border-[#2351A3] focus:outline-none focus:ring-2 focus:ring-[#2351A3]/15"
              />
              <Button
                type="button"
                overrideClasses
                onClick={() => {
                  const t = promoCode.trim();
                  if (!t) {
                    setPromoAppliedHint(null);
                    return;
                  }
                  setPromoAppliedHint("Promo is not available for this booking yet.");
                }}
                className="h-11 shrink-0 rounded-[12px] bg-[#2351A3] px-6 text-[15px] font-semibold text-white hover:opacity-95 sm:min-w-[120px]"
              >
                Apply
              </Button>
            </div>
          </CardShell>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex max-h-none flex-col gap-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:overflow-x-hidden lg:pr-1">
            <FlightSummaryCard
              title="Flight details"
              headerActionText="Change"
              onHeaderActionClick={() => {
                if (typeof onChangeFlight === "function") onChangeFlight();
              }}
              segments={segments}
              fare={priceFareFamily}
            />

            <FLightFareRule
              trip={trip.raw}
              ruleData={fareRuleData}
              wideLayout
              presentation="review"
            />

            <FLightPriceBreakdown
              cardTone="review"
              open={openPrice}
              onToggleOpen={() => setOpenPrice((v) => !v)}
              trip={trip.raw}
              ancillarySummary={ancillarySummary}
            />
          </div>

          {showAddAddOnsBanner && (
            <div className="mt-6 rounded-[12px] border border-dashed border-[#C2CAD6] bg-[#F9FAFB] px-4 py-3">
              <p className="m-0 text-[12px] leading-5 text-[#3D495C]">
                Skipped optional add-ons? You can still choose seats, baggage,
                or meals before payment.
              </p>
              <Button
                type="button"
                overrideClasses
                onClick={() => onAddAddOns?.()}
                className="mt-3 h-10 w-full rounded-[12px] border border-[#2351A3] bg-white text-[14px] font-semibold text-[#2351A3] hover:bg-[#2351A3]/5"
              >
                Add ancillaries
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex w-full justify-center">
        <Button
          type="button"
          overrideClasses
          onClick={() => continueToPayment()}
          className="flex h-[47px] w-full max-w-[320px] items-center justify-center gap-[10px] rounded-[100px] bg-[linear-gradient(90.59deg,#5383DA_0%,#2351A3_50%,#081326_100%)] px-10 text-[16px] font-semibold text-white sm:w-[252px]"
        >
          Continue to payment
        </Button>
      </div>
    </section>
  );
}
