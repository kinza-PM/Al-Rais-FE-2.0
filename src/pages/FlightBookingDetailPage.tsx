import { useEffect, useMemo, useRef, useState } from "react";
import { Carousel, Tabs } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import cabinIcon from "../assets/svgs/cabin.svg";
import baggageIcon from "../assets/svgs/baggage.svg";
import durationIcon from "../assets/svgs/duration.svg";
import refundableIcon from "../assets/svgs/redundable.svg";
import SEAT_ICON from "../assets/svgs/seat.svg";
import PLANE_ICON from "../assets/svgs/plane.svg";
import EmirateLogo from "../assets/images/emirates.png";
import FlightDetailsCard from "../components/molecules/FlightDetailsCard";
import FLightFareRule from "../components/atoms/FlightFareRule";
import {
  buildFlightSegmentFromTrip,
  buildTripShapeForFlightSummaryFromBookingApi,
  getPriceCabinClassForFlightSummary,
} from "../utils/helpers";
import { buildMyBookingsUrl } from "../utils/myBookingsUrl";
import { getAirportCoords } from "../utils/geolocationHelper";
import MapInfo from "../components/organisms/MapInfo";

type MapPoint = { lat: number; lng: number; destinationName: string };

async function buildRouteLocationsForJourney(journey: any): Promise<MapPoint[]> {
  const segs: any[] = Array.isArray(journey?.flightSegments)
    ? journey.flightSegments
    : [];
  if (segs.length === 0) return [];

  const codes: string[] = [];
  for (let i = 0; i < segs.length; i++) {
    const dep = segs[i]?.departureAirportCode;
    if (dep && !codes.includes(dep)) codes.push(dep);
    if (i === segs.length - 1) {
      const arr = segs[i]?.arrivalAirportCode;
      if (arr && !codes.includes(arr)) codes.push(arr);
    }
  }

  const entries = await Promise.all(
    codes.map(async (code) => {
      const coords = await getAirportCoords(code);
      return { code, coords };
    }),
  );

  return entries
    .map((x) =>
      x.coords
        ? { lat: x.coords.lat, lng: x.coords.lng, destinationName: x.code }
        : null,
    )
    .filter(Boolean) as MapPoint[];
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

export default function FlightBookingDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sliderRef = useRef<any>(null);
  const [activeJourneyIdx, setActiveJourneyIdx] = useState(0);
  const [mapLocations, setMapLocations] = useState<MapPoint[]>([]);
  const [mapLoading, setMapLoading] = useState(false);

  const booking = (location.state as any)?.booking;

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

  const apiItem = booking?.originalApiItem;
  const passengersRaw: any[] = Array.isArray(apiItem?.request?.passengers)
    ? apiItem.request.passengers
    : [];
  const passengers = useMemo(
    () => buildPassengersWithOrdinal(passengersRaw),
    [passengersRaw],
  );

  const journeys: any[] = Array.isArray(apiItem?.request?.journey)
    ? apiItem.request.journey
    : [];

  const journeySlides = useMemo(() => {
    if (!Array.isArray(journeys) || journeys.length === 0) return [];
    const fare = apiItem?.fare;

    return journeys.map((j: any, idx: number) => {
      const details = {
        raw: { journey: [j], fare },
        journey: [j],
      };

      const price = getPriceCabinClassForFlightSummary(details);
      const fareFamilyLabel =
        price?.label ?? price?._priceClasses?.[0] ?? "Fare family";

      const heading =
        journeys.length > 1
          ? idx === 0
            ? "Departure flight"
            : "Return flight"
          : "Departure flight";

      const summarySegments = buildFlightSegmentFromTrip(details, assets).map(
        (s: any) => ({ ...s, heading: undefined }),
      );

      return { key: `${idx}`, heading, fareFamilyLabel, details, summarySegments, rawJourney: j };
    });
  }, [apiItem?.fare, assets, journeys]);

  const summaryTripAll = useMemo(() => {
    return apiItem ? buildTripShapeForFlightSummaryFromBookingApi(apiItem) : null;
  }, [apiItem]);

  const fareRulesDetails = apiItem?.fareRulesDetails ?? null;

  useEffect(() => {
    sliderRef.current?.goTo?.(0, true);
    setActiveJourneyIdx(0);
  }, []);

  useEffect(() => {
    const j = journeySlides[activeJourneyIdx]?.rawJourney;
    if (!j) {
      setMapLocations([]);
      return;
    }
    let cancelled = false;
    setMapLoading(true);
    buildRouteLocationsForJourney(j)
      .then((locs) => {
        if (cancelled) return;
        setMapLocations(locs);
      })
      .finally(() => {
        if (cancelled) return;
        setMapLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeJourneyIdx, journeySlides]);

  const bookingRef =
    booking?.bookingRef ||
    apiItem?.bookingReferenceId ||
    apiItem?.detail?.supplierLocator ||
    "—";

  if (!booking) {
    return (
      <div className="mx-auto w-full max-w-[1168px] px-6 py-8">
        <div className="rounded-[16px] border border-[#E4E4E7] bg-white p-6">
          <div className="text-[16px] font-semibold text-[#0A0C0F]">
            Flight details unavailable
          </div>
          <div className="mt-2 text-[14px] text-[#64748B]">
            Please open this page from My Bookings.
          </div>
          <button
            type="button"
            onClick={() => navigate(buildMyBookingsUrl({ mode: "flights", status: "all" }))}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-[#E4E4E7] bg-white px-4 py-2 text-[14px] font-medium text-[#2351A3] hover:bg-[#F8FAFC]"
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const flightTab = (
    <div className="space-y-4">
      {journeySlides.length === 0 ? (
        <div className="text-sm text-[#64748B]">No flight details available.</div>
      ) : (
        <Carousel
          ref={sliderRef}
          dots={journeySlides.length > 1}
          adaptiveHeight
          beforeChange={(_, next) => setActiveJourneyIdx(next)}
        >
          {journeySlides.map((slide) => (
            <div key={slide.key}>
              {/* 1) Detailed info + layover (no map inside) */}
              <div className="mt-4 rounded-[16px] border border-[#E5E7EB] bg-white p-4">
                <div className="text-[16px] font-semibold text-[#0A0C0F] mb-4">
                  Flight detailed information
                </div>
                <FlightDetailsCard
                  details={slide.details}
                  showMap={false}
                  borderless
                />
              </div>

              {/* 2) Important fare rules */}
              <FLightFareRule
                trip={summaryTripAll ?? { raw: { journey: [], fare: apiItem?.fare } }}
                ruleData={fareRulesDetails}
                wideLayout
              />

              {/* 3) Map (bottom) */}
              <div className="mt-4 rounded-[16px] border border-[#E5E7EB] bg-white p-4">
                <div className="text-[16px] font-semibold text-[#0A0C0F] mb-3">
                  Route map
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "230px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  {mapLoading ? (
                    <div className="flex items-center justify-center text-[#2351a3] h-full">
                      Loading map...
                    </div>
                  ) : mapLocations.length ? (
                    <MapInfo locations={mapLocations} />
                  ) : (
                    <div className="flex items-center justify-center text-[#64748B] h-full">
                      Map not available.
                    </div>
                  )}
                </div>
              </div>

              {/* Fare family line (kept, but positioned under summary as per design) */}
              <div className="mt-4 rounded-[16px] border border-[#E4E4E7] bg-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] text-[#3D495C]">Fare family</div>
                  <div className="text-[15px] font-medium text-[#0A0C0F] text-right">
                    {slide.fareFamilyLabel}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      )}
    </div>
  );

  const passengersTab = (
    <div className="mt-4 space-y-3">
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
                  {p.__travellerLabel ||
                    `Passenger ${String(idx + 1).padStart(2, "0")}`}
                </div>
                <div className="text-[12px] text-[#64748B]">{title || "—"}</div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-y-2 text-[13px]">
                <div className="text-[#64748B]">Full name</div>
                <div className="text-right font-medium text-[#0A0C0F]">
                  {fullName}
                </div>

                <div className="text-[#64748B]">Email</div>
                <div className="text-right font-medium text-[#0A0C0F] break-all">
                  {email}
                </div>

                <div className="text-[#64748B]">Phone</div>
                <div className="text-right font-medium text-[#0A0C0F] break-all">
                  {phone}
                </div>

                <div className="text-[#64748B]">Passport</div>
                <div className="text-right font-medium text-[#0A0C0F]">
                  {passport}
                </div>

                <div className="text-[#64748B]">Nationality</div>
                <div className="text-right font-medium text-[#0A0C0F]">
                  {nationality}
                </div>

                <div className="text-[#64748B]">Expiry date</div>
                <div className="text-right font-medium text-[#0A0C0F]">
                  {expiry}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="py-6">
      <div className="mx-auto w-full max-w-[1168px] px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-[14px] font-medium text-[#5383DA] hover:underline"
            >
              <LeftOutlined /> Back
            </button>
            <div className="mt-2 text-[20px] font-semibold text-[#0A0C0F]">
              Flight details
            </div>
            <div className="mt-1 text-[13px] text-[#64748B]">
              Booking ref: {bookingRef}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Tabs
            items={[
              { key: "flight", label: "Flight", children: flightTab },
              { key: "passengers", label: "Passengers", children: passengersTab },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

