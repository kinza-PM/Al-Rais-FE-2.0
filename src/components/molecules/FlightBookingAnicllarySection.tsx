import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
// import entertainmentIcon from "../../assets/svgs/entertainment.svg";
// import mealIcon from "../../assets/svgs/meals.svg";
// import portIcon from "../../assets/svgs/ports.svg";
// import wifiIcon from "../../assets/svgs/wifi.svg";
import EmirateLogo from "../../assets/images/emirates.png";
import { useMemo, useState } from "react";
import FlightBookingBaggageSection from "../atoms/FlightBookingBaggageSection";
import FlightBookingMealsSection from "../atoms/FlightBookingMealsSection";
import FlightBookingComfortAirportAndTravelSection from "../atoms/FlightBookingComfortAirportAndTravelSection";
import FlightBookingSeatSection from "../atoms/FlightBookingSeatSection";
import FLightPriceBreakdown from "../atoms/FlightPriceBreakdown";
import Button from "../atoms/Button";
// import CustomToggle from "../common/CustomToggle";
import FlightSummaryCard from "../atoms/FlightSummaryCard";
import FLightFareRule from "../atoms/FlightFareRule";
import {
  buildFlightSegmentFromTrip,
  getPriceCabinClassForFlightSummary,
} from "../../utils/helpers";
import {
  buildAncillaryPayload,
  transformFlightJourneysToObjects,
} from "../../utils/flightBookingHelper";
import LoginModal from "../common/LoginModal";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  useAncillaryStore,
  type AllSelections,
} from "../../store/useAncillaryStore";
import toast from "react-hot-toast";
import { extractErrorFromAxiosApiError } from "../../utils/apiErrorHanlder";
import { useFlightAncillaryBooking } from "../../hooks/useFlightBooking";
import durationIcon from "../../assets/svgs/duration.svg";
import refundableIcon from "../../assets/svgs/redundable.svg";
import SEAT_ICON from "../../assets/svgs/seat.svg";
import PLANE_ICON from "../../assets/svgs/plane.svg";

type FlightBookingAnicllarySectionProps = {
  trip: any;
  fareRuleData?: any;
  passengers: Array<any>;
  flightAncillarySearch?: any;
  onNext?: () => void;
  offerId?: string;
  searchKey?: string;
  onChangeFlight?: () => void;
  onAncillarySelectionResolved?: (summary: {
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
  }) => void;
};

export default function FlightBookingAnicllarySection({
  trip,
  fareRuleData,
  passengers = [],
  flightAncillarySearch,
  onNext,
  offerId,
  searchKey,
  onChangeFlight,
  onAncillarySelectionResolved,
}: FlightBookingAnicllarySectionProps) {
  const { isAuthenticated } = useAuth();
  const { getAllSelections, clearAll } = useAncillaryStore();
  const [openPrice, setOpenPrice] = useState(false);
  const [openBaggage, setOpenBaggage] = useState(true);
  const [openSeats, setOpenSeats] = useState(true);
  const [openMeals, setOpenMeals] = useState(true);
  // const [openCE, setOpenCE] = useState(true);
  // const [openAirport, setOpenAirport] = useState(true);
  // const [depBagOn, setDepBagOn] = useState(true);
  // const [retBagOn, setRetBagOn] = useState(false);
  // const [bookingForOther, setBookingForOther] = useState(true);
  // const [openTP, setOpenTP] = useState(true);

  const { mutateAsync, isPending } = useFlightAncillaryBooking();

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
  const flightJourneys = useMemo(
    () => transformFlightJourneysToObjects(trip?.raw?.journey),
    [trip]
  );
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

  const handleClearAllAncillaries = () => {
    clearAll();
    onAncillarySelectionResolved?.({
      totalAmount: 0,
      currency:
        trip?.raw?.fare?.currencyCode ??
        trip?.raw?.fare?.currency ??
        "USD",
      selectedCount: 0,
      breakdown: [],
    });
  };

  const buildOfferIdToDescriptionMap = () => {
    const map = new Map<string, string>();

    const pushFromList = (list: any[]) => {
      list.forEach((item: any) => {
        const id = item?.ancillary?.ancillaryOfferId;
        const desc =
          item?.ancillary?.ancillaryDescription ||
          item?.ancillary?.ancillaryCode ||
          "";
        if (id && desc && !map.has(id)) {
          map.set(id, desc);
        }
      });
    };

    if (Array.isArray(flightAncillarySearch?.baggages)) {
      pushFromList(flightAncillarySearch.baggages);
    }
    if (Array.isArray(flightAncillarySearch?.meals)) {
      pushFromList(flightAncillarySearch.meals);
    }
    if (Array.isArray(flightAncillarySearch?.otherAncillaries)) {
      pushFromList(flightAncillarySearch.otherAncillaries);
    }

    return map;
  };

  const buildSelectedOfferIdContext = () => {
    const all = getAllSelections() as AllSelections;
    const context = new Map<
      string,
      { category: "baggage" | "meals" | "seats" | "other"; seatNumber?: string }
    >();

    // baggage: segment -> passenger -> offerId
    Object.values(all?.baggage ?? {}).forEach((passengers: any) => {
      Object.values(passengers ?? {}).forEach((offerId: any) => {
        if (offerId) context.set(String(offerId), { category: "baggage" });
      });
    });

    // meals: segment -> passenger -> mealTypeKey -> offerId -> qty
    Object.values(all?.meals ?? {}).forEach((passengers: any) => {
      Object.values(passengers ?? {}).forEach((mealTypes: any) => {
        Object.values(mealTypes ?? {}).forEach((ancillaryMap: any) => {
          Object.entries(ancillaryMap ?? {}).forEach(([offerId, qty]) => {
            const q = Number(qty) || 0;
            for (let i = 0; i < q; i++) {
              // if qty>1, it will appear multiple times in payload; breakdown can just show once (API returns per item)
              if (offerId) context.set(String(offerId), { category: "meals" });
            }
          });
        });
      });
    });

    // seats: segment -> passenger -> { seatNumber, ancillaryOfferId }
    Object.entries(all?.seats ?? {}).forEach(([_, passengers]: any) => {
      Object.values(passengers ?? {}).forEach((seatInfo: any) => {
        const offerId = seatInfo?.ancillaryOfferId;
        if (offerId) {
          context.set(String(offerId), {
            category: "seats",
            seatNumber: seatInfo?.seatNumber,
          });
        }
      });
    });

    // other: segment -> passenger -> offerId -> boolean
    Object.values(all?.otherAncillaries ?? {}).forEach((passengers: any) => {
      Object.values(passengers ?? {}).forEach((services: any) => {
        Object.entries(services ?? {}).forEach(([offerId, selected]) => {
          if (selected && offerId) {
            context.set(String(offerId), { category: "other" });
          }
        });
      });
    });

    return context;
  };

  const liveAncillarySummary = useMemo(() => {
    const all = getAllSelections() as AllSelections;
    const payload = buildAncillaryPayload(all, offerId, searchKey);
    const selected = payload?.data?.selectedAncillaries || [];
    const fallbackCurrency =
      trip?.raw?.fare?.currencyCode ?? trip?.raw?.fare?.currency ?? "USD";
    return {
      totalAmount: 0,
      currency: fallbackCurrency,
      selectedCount: selected.length,
    };
  }, [getAllSelections, offerId, searchKey, trip]);

  const handleFlightAncillaryProvBooking = async () => {
    const all = getAllSelections() as AllSelections;
    const payload = buildAncillaryPayload(all, offerId, searchKey);
    const selectedAncillaries = payload?.data?.selectedAncillaries || [];
    if (!selectedAncillaries.length) {
      onAncillarySelectionResolved?.({
        totalAmount: 0,
        currency:
          trip?.raw?.fare?.currencyCode ??
          trip?.raw?.fare?.currency ??
          "USD",
        selectedCount: 0,
        breakdown: [],
      });
      if (typeof onNext === "function") {
        onNext();
      }
      return;
    }

    try {
      const response = await mutateAsync(payload);
      if (
        response?.meta?.success &&
        response?.meta?.statusMessage == "SUCCESS"
      ) {
        const offerIdToDesc = buildOfferIdToDescriptionMap();
        const selectedCtx = buildSelectedOfferIdContext();
        const booked = Array.isArray(response?.data) ? response.data : [];

        const breakdown = booked
          .filter((b: any) => !!b?.ancillaryOfferId && !!b?.fare)
          .map((b: any) => {
            const id = String(b.ancillaryOfferId);
            const ctx = selectedCtx.get(id);
            const category = ctx?.category ?? "other";
            const seatNumber = ctx?.seatNumber;
            const label =
              category === "seats" && seatNumber
                ? `Seat ${seatNumber}`
                : offerIdToDesc.get(id) || id;
            const amount = Number(b?.fare?.sellingAmount || 0);
            const currency = b?.fare?.sellingCurrency || "USD";
            return {
              category,
              label,
              amount,
              currency,
              ancillaryOfferId: id,
            };
          });

        const fallbackCurrency =
          trip?.raw?.fare?.currencyCode ?? trip?.raw?.fare?.currency ?? "USD";
        const currency =
          breakdown?.[0]?.currency || fallbackCurrency;
        const totalAmount = breakdown.reduce(
          (sum: number, item: { amount: number }) => sum + Number(item.amount || 0),
          0,
        );

        onAncillarySelectionResolved?.({
          totalAmount,
          currency,
          selectedCount: breakdown.length,
          breakdown,
        });

        toast.success(response?.meta?.actionType);
        if (typeof onNext === "function") {
          onNext();
        }
      }
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err);
    }
  };
  return (
    <section className="mx-auto max-w-full px-10 flight-booking-section">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr] flight-booking-grid">
        <div className="space-y-4">
          <div className="mt-6 rounded-2xl border border-[#E4E4E7] bg-white">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#E4E4E7]">
              <h3 className="text-[16px] font-semibold text-[#0A0C0F]">
                Enhance your trip
              </h3>
              <Button
                overrideClasses
                className="text-[14px] font-medium text-[#5383DA] hover:underline"
                onClick={handleClearAllAncillaries}
              >
                Clear selection
              </Button>
            </div>

            {flightAncillarySearch?.baggages && (
              <FlightBookingBaggageSection
                open={openBaggage}
                onToggleOpen={() => setOpenBaggage((v) => !v)}
                // depChecked={depBagOn}
                // retChecked={retBagOn}
                // onToggleDep={() => setDepBagOn((v) => !v)}
                // onToggleRet={() => setRetBagOn((v) => !v)}
                flightAncillarySearch={flightAncillarySearch}
                flightPassengers={passengers}
                flightJourneys={flightJourneys}
              />
            )}

            {flightAncillarySearch?.seatMap && (
              <FlightBookingSeatSection
                open={openSeats}
                onToggleOpen={() => setOpenSeats((v) => !v)}
                flightAncillarySearch={flightAncillarySearch}
                passengers={passengers}
                flightJourneys={flightJourneys}
              />
            )}

            {flightAncillarySearch?.meals && (
              <FlightBookingMealsSection
                open={openMeals}
                onToggleOpen={() => setOpenMeals((v) => !v)}
                flightAncillarySearch={flightAncillarySearch}
                flightPassengers={passengers}
                flightJourneys={flightJourneys}
              />
            )}

            {flightAncillarySearch?.otherAncillaries && (
              <FlightBookingComfortAirportAndTravelSection
                // openComfort={openCE}
                // switchComfort={() => setOpenCE((v) => !v)}
                // openAirport={openAirport}
                // switchAirport={() => setOpenAirport((v) => !v)}
                // openProtection={openTP}
                // switchProtection={() => setOpenTP((v) => !v)}
                flightAncillarySearch={flightAncillarySearch}
                flightPassengers={passengers}
                flightJourneys={flightJourneys}
              />
            )}
          </div>
        </div>

        {/* RIGHT: Trip details */}
        <div className="md:sticky md:top-6 self-start md:max-h-[calc(100vh-3rem)] md:overflow-auto">
          <FlightSummaryCard
            title="Trip details"
            // headerActionText="View all"
            // onHeaderActionClick={() => {/* handle view all */ }}
            segments={segments}
            fare={priceFareFamily}
          />

          <FLightFareRule trip={trip.raw} ruleData={fareRuleData} />

          <FLightPriceBreakdown
            open={openPrice}
            onToggleOpen={() => setOpenPrice((v) => !v)}
            trip={trip.raw}
            ancillarySummary={liveAncillarySummary}
          />

          <Button
            type="button"
            overrideClasses
            className="mt-6 mx-4 w-[calc(100%-2rem)] rounded-xl bg-[#2351A3] py-3 text-[16px] font-semibold text-[#F2F2F3] hover:brightness-95 active:brightness-90"
            onClick={() => handleFlightAncillaryProvBooking()}
            disabled={isPending}
          >
            {isPending ? "Loading..." : "Continue"}
          </Button>
        </div>

        {!isAuthenticated && <LoginModal showModal={!isAuthenticated} />}
      </div>
    </section>
  );
}
