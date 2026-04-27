import { useEffect, useMemo, useRef } from "react";
import { Carousel, Modal, Tabs } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
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
  buildTripShapeForFlightSummaryFromBookingApi,
  getPriceCabinClassForFlightSummary,
} from "../../utils/helpers";

type Props = {
  open: boolean;
  onClose: () => void;
  booking: any;
};

function readPassengers(booking: any): any[] {
  return Array.isArray(booking?.originalApiItem?.request?.passengers)
    ? booking.originalApiItem.request.passengers
    : [];
}

function readJourneys(booking: any): any[] {
  return Array.isArray(booking?.originalApiItem?.request?.journey)
    ? booking.originalApiItem.request.journey
    : Array.isArray(booking?.journeys)
      ? booking.journeys
      : [];
}

function ptcLabel(ptc?: string): "Adult" | "Child" | "Infant" | "Passenger" {
  const s = (ptc ?? "").toString().trim().toUpperCase();
  if (s === "ADT") return "Adult";
  if (s === "CHD") return "Child";
  if (s === "INF" || s === "INS") return "Infant";
  return "Passenger";
}

function buildTravellerLabel(ptc: string, ord: number): string {
  return `${ptcLabel(ptc)} ${String(ord).padStart(2, "0")}`;
}

function buildPassengersWithOrdinal(passengers: any[]) {
  const counters = new Map<string, number>();
  return passengers.map((p) => {
    const key = (p?.ptc ?? "ADT").toString().trim().toUpperCase() || "ADT";
    const next = (counters.get(key) ?? 0) + 1;
    counters.set(key, next);
    return { ...p, __travellerLabel: buildTravellerLabel(key, next) };
  });
}

export default function FlightBookingDetailsModal({ open, onClose, booking }: Props) {
  const sliderRef = useRef<any>(null);
  const passengers = useMemo(
    () => buildPassengersWithOrdinal(readPassengers(booking)),
    [booking],
  );
  const journeys = useMemo(() => readJourneys(booking), [booking]);

  useEffect(() => {
    if (!open) return;
    // reset carousel position if already mounted
    sliderRef.current?.goTo?.(0, true);
  }, [open]);

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

  const summaryTripAll = useMemo(() => {
    const api = booking?.originalApiItem;
    return api ? buildTripShapeForFlightSummaryFromBookingApi(api) : null;
  }, [booking]);

  const fareRulesDetails = booking?.originalApiItem?.fareRulesDetails ?? null;

  const journeySlides = useMemo(() => {
    if (!Array.isArray(journeys) || journeys.length === 0) return [];
    const api = booking?.originalApiItem;
    const fare = api?.fare;
    return journeys.map((j: any, idx: number) => {
      const rawJourney = j?.flightSegments ? j : api?.request?.journey?.[idx] ?? j;
      const tripForThisJourney = {
        raw: { journey: [rawJourney], fare },
        journey: [rawJourney],
      };
      const segments = buildFlightSegmentFromTrip(tripForThisJourney, assets).map(
        (s: any) => ({
          ...s,
          heading:
            journeys.length > 1
              ? idx === 0
                ? "Departure flight"
                : "Return flight"
              : "Departure flight",
        }),
      );
      const price = getPriceCabinClassForFlightSummary(tripForThisJourney);
      const fareRow = {
        label: "Fare family",
        value: price?.label ?? price?._priceClasses?.[0] ?? "Fare family",
        // keep same UI as flight search; if you want "Modify search" to actually navigate,
        // we can wire it later.
        changeText: undefined,
        onChangeClick: undefined,
      };
      return {
        key: `${idx}`,
        title:
          journeys.length > 1
            ? idx === 0
              ? "Departure flight"
              : "Return flight"
            : "Departure flight",
        segments,
        fareRow,
        tripForThisJourney,
      };
    });
  }, [assets, booking, journeys]);

  const flightTab = (
    <div className="space-y-4">
      {journeySlides.length === 0 ? (
        <div className="text-sm text-[#64748B]">No flight details available.</div>
      ) : (
        <div className="relative">
          {journeySlides.length > 1 ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[14px] font-semibold text-[#0A0C0F]">
                  Trip details
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4E4E7] text-[#64748B] hover:bg-[#F8FAFC]"
                    aria-label="Previous journey"
                    onClick={() => sliderRef.current?.prev?.()}
                  >
                    <LeftOutlined />
                  </button>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4E4E7] text-[#64748B] hover:bg-[#F8FAFC]"
                    aria-label="Next journey"
                    onClick={() => sliderRef.current?.next?.()}
                  >
                    <RightOutlined />
                  </button>
                </div>
              </div>
            </>
          ) : null}

          <Carousel
            ref={sliderRef}
            dots={journeySlides.length > 1}
            adaptiveHeight
          >
            {journeySlides.map((slide) => (
              <div key={slide.key}>
                <FlightSummaryCard
                  title="Trip details"
                  segments={slide.segments}
                  fare={slide.fareRow}
                />
              </div>
            ))}
          </Carousel>
        </div>
      )}

      <FLightFareRule
        trip={summaryTripAll ?? { raw: { journey: [], fare: booking?.originalApiItem?.fare } }}
        ruleData={fareRulesDetails}
        wideLayout
      />
    </div>
  );

  const passengersTab = (
    <div className="space-y-3">
      {passengers.length === 0 ? (
        <div className="text-sm text-[#64748B]">No passenger details available.</div>
      ) : (
        passengers.map((p: any, idx: number) => {
          const title = (p?.passengerInfo?.nameTitle ?? "").toString().trim();
          const given = (p?.passengerInfo?.givenName ?? "").toString().trim();
          const surname = (p?.passengerInfo?.surname ?? "").toString().trim();
          const fullName = `${title} ${given} ${surname}`.trim() || "—";
          const email =
            p?.contact?.contactsProvided?.[0]?.emailAddress?.[0] || "—";
          const phoneArea =
            p?.contact?.contactsProvided?.[0]?.phone?.[0]?.areaCode || "";
          const phoneNum =
            p?.contact?.contactsProvided?.[0]?.phone?.[0]?.phoneNumber || "";
          const phone = [phoneArea, phoneNum].filter(Boolean).join("-") || "—";
          const passport = p?.identityDocuments?.[0]?.idDocumentNumber || "—";
          const nationality =
            p?.passengerInfo?.nationalityCode ||
            p?.identityDocuments?.[0]?.issuingCountryCode ||
            "—";
          const expiry = p?.identityDocuments?.[0]?.expiryDate || "—";

          return (
            <div
              key={p?.passengerKey || `${idx}`}
              className="rounded-[14px] border border-[#E4E4E7] bg-white px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-[14px] font-semibold text-[#0A0C0F]">
                  {p.__travellerLabel || `Passenger ${String(idx + 1).padStart(2, "0")}`}
                </div>
                <div className="text-[12px] text-[#64748B]">{title || "—"}</div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-y-2 text-[13px]">
                <div className="text-[#64748B]">Full name</div>
                <div className="text-right font-medium text-[#0A0C0F]">{fullName}</div>

                <div className="text-[#64748B]">Email</div>
                <div className="text-right font-medium text-[#0A0C0F] break-all">
                  {email}
                </div>

                <div className="text-[#64748B]">Phone</div>
                <div className="text-right font-medium text-[#0A0C0F] break-all">
                  {phone}
                </div>

                <div className="text-[#64748B]">Passport</div>
                <div className="text-right font-medium text-[#0A0C0F]">{passport}</div>

                <div className="text-[#64748B]">Nationality</div>
                <div className="text-right font-medium text-[#0A0C0F]">{nationality}</div>

                <div className="text-[#64748B]">Expiry date</div>
                <div className="text-right font-medium text-[#0A0C0F]">{expiry}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const bookingRef =
    booking?.bookingRef ||
    booking?.originalApiItem?.bookingReferenceId ||
    booking?.originalApiItem?.detail?.supplierLocator ||
    "—";

  return (
    <Modal
      title={
        <div className="min-w-0">
          <div className="text-[16px] font-semibold text-[#0A0C0F]">
            Flight details
          </div>
          <div className="mt-1 text-[13px] font-normal text-[#64748B]">
            Booking ref: {bookingRef}
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={920}
      centered
      destroyOnClose
      styles={{
        body: { padding: "16px 20px 22px" },
        header: { padding: "16px 20px", borderBottom: "1px solid #E5E7EB" },
      }}
    >
      <Tabs
        items={[
          { key: "flight", label: "Flight", children: flightTab },
          { key: "passengers", label: "Passengers", children: passengersTab },
        ]}
      />
    </Modal>
  );
}

