import { useMemo } from "react";
import { Modal, Tabs } from "antd";
import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import durationIcon from "../../assets/svgs/duration.svg";
import refundableIcon from "../../assets/svgs/redundable.svg";
import SEAT_ICON from "../../assets/svgs/seat.svg";
import PLANE_ICON from "../../assets/svgs/plane.svg";
import EmirateLogo from "../../assets/images/emirates.png";
import FlightSummaryCard from "../atoms/FlightSummaryCard";
import FLightFareRule from "../atoms/FlightFareRule";
import {
  buildFlightSegmentFromTrip,
  getPriceCabinClassForFlightSummary,
} from "../../utils/helpers";
import type { CountryOption } from "../../features/flights/types";

type FlightBookingReviewModalProps = {
  open: boolean;
  onClose: () => void;
  trip: any;
  fareRuleData?: any;
  passengers: any[];
  countries: CountryOption[];
  onChangeFlight?: () => void;
};

export default function FlightBookingReviewModal({
  open,
  onClose,
  trip,
  fareRuleData,
  passengers,
  countries,
  onChangeFlight,
}: FlightBookingReviewModalProps) {
  const assets = useMemo(
    () => ({
      EmirateLogo,
      cabinIcon,
      baggageIcon,
      mealIcon: refundableIcon,
      wifiIcon: durationIcon,
      portIcon: SEAT_ICON,
      entertainmentIcon: PLANE_ICON,
    }),
    [],
  );

  const segments = useMemo(
    () => buildFlightSegmentFromTrip(trip, assets),
    [trip, assets],
  );
  const firstPrice = useMemo(
    () => getPriceCabinClassForFlightSummary(trip),
    [trip],
  );
  const priceFareFamily = useMemo(
    () => ({
      label: "Fare family",
      value:
        firstPrice?.label ?? firstPrice?._priceClasses?.[0] ?? "Fare family",
      changeText:
        typeof onChangeFlight === "function" ? "Modify search" : undefined,
      onChangeClick:
        typeof onChangeFlight === "function" ? onChangeFlight : undefined,
    }),
    [firstPrice, onChangeFlight],
  );

  const countryLabel = (code?: string) => {
    if (!code) return "—";
    return (
      countries.find((c) => c.iso3 === code || c.iso2 === code)?.label ?? code
    );
  };

  const travellersTab = (
    <div className="space-y-3">
      {(passengers || []).length === 0 ? (
        <div className="text-sm text-[#64748B]">
          No traveller details available.
        </div>
      ) : (
        passengers.map((p: any, idx: number) => (
          <div
            key={p.passengerKey || idx}
            className="rounded-[14px] border border-[#E4E4E7] bg-white px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div className="text-[14px] font-semibold text-[#0A0C0F]">
                Traveler {String(idx + 1).padStart(2, "0")} ({p.ptc || "—"})
              </div>
              <div className="text-[12px] text-[#64748B]">
                {p.passengerInfo?.nameTitle || "—"}
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-y-2 text-[13px]">
              <div className="text-[#64748B]">Full name</div>
              <div className="text-right font-medium text-[#0A0C0F]">
                {p.passengerInfo?.givenName || p.passengerInfo?.surname
                  ? `${p.passengerInfo?.givenName ?? ""} ${p.passengerInfo?.surname ?? ""}`.trim()
                  : "—"}
              </div>

              <div className="text-[#64748B]">Email</div>
              <div className="text-right font-medium text-[#0A0C0F]">
                {p.contact?.contactsProvided?.[0]?.emailAddress?.[0] || "—"}
              </div>

              <div className="text-[#64748B]">Phone</div>
              <div className="text-right font-medium text-[#0A0C0F]">
                {p.contact?.contactsProvided?.[0]?.phone?.[0]?.areaCode
                  ? `${p.contact?.contactsProvided?.[0]?.phone?.[0]?.areaCode}-`
                  : ""}
                {p.contact?.contactsProvided?.[0]?.phone?.[0]?.phoneNumber ||
                  "—"}
              </div>

              <div className="text-[#64748B]">Passport</div>
              <div className="text-right font-medium text-[#0A0C0F]">
                {p.identityDocuments?.[0]?.idDocumentNumber || "—"}
              </div>

              <div className="text-[#64748B]">Issuing country</div>
              <div className="text-right font-medium text-[#0A0C0F]">
                {countryLabel(p.identityDocuments?.[0]?.issuingCountryCode)}
              </div>

              <div className="text-[#64748B]">Expiry date</div>
              <div className="text-right font-medium text-[#0A0C0F]">
                {p.identityDocuments?.[0]?.expiryDate || "—"}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const flightTab = (
    <div className="space-y-4">
      <FlightSummaryCard
        title="Flight details"
        headerActionText={
          typeof onChangeFlight === "function" ? "Change" : undefined
        }
        onHeaderActionClick={
          typeof onChangeFlight === "function" ? onChangeFlight : undefined
        }
        segments={segments}
        fare={priceFareFamily}
      />
    </div>
  );

  const baggageTab = (
    <div className="space-y-4">
      <FLightFareRule
        trip={trip?.raw}
        ruleData={fareRuleData}
        wideLayout
      />
    </div>
  );

  return (
    <Modal
      title="Review details"
      open={open}
      onCancel={onClose}
      footer={null}
      width={820}
      centered
      destroyOnClose
      styles={{
        body: { padding: "16px 20px 22px" },
        header: { padding: "16px 20px", borderBottom: "1px solid #E5E7EB" },
      }}
    >
      <Tabs
        items={[
          { key: "travellers", label: "Travellers", children: travellersTab },
          { key: "flight", label: "Flight details", children: flightTab },
          { key: "baggage", label: "Baggage rules", children: baggageTab },
        ]}
      />
    </Modal>
  );
}
