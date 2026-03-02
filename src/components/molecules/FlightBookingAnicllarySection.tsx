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
import { useNavigate } from "react-router-dom";
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
  passengers: Array<any>;
  flightAncillarySearch?: any;
  onNext?: () => void;
  offerId?: string;
  searchKey?: string;
};

export default function FlightBookingAnicllarySection({
  trip,
  passengers = [],
  flightAncillarySearch,
  onNext,
  offerId,
  searchKey
}: FlightBookingAnicllarySectionProps) {
  const { isAuthenticated } = useAuth();
  const { getAllSelections, clearAll } = useAncillaryStore();
  const navigate = useNavigate();
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
    changeText: "Change",
    onChangeClick: () => {
      navigate("/search_flight");
    },
  };

  const handleClearAllAncillaries = () => {
    clearAll();
  };

  const handleFlightAncillaryProvBooking = async () => {
    const all = getAllSelections() as AllSelections;
    const payload = buildAncillaryPayload(all, offerId, searchKey);

    try {
      const response = await mutateAsync(payload);
      if (
        response?.meta?.success &&
        response?.meta?.statusMessage == "SUCCESS"
      ) {
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
        <div>
          <FlightSummaryCard
            title="Trip details"
            // headerActionText="View all"
            // onHeaderActionClick={() => {/* handle view all */ }}
            segments={segments}
            fare={priceFareFamily}
          />

          <FLightFareRule trip={trip.raw} />

          <FLightPriceBreakdown
            open={openPrice}
            onToggleOpen={() => setOpenPrice((v) => !v)}
            trip={trip.raw}
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
