import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import entertainmentIcon from "../../assets/svgs/entertainment.svg";
import mealIcon from "../../assets/svgs/meals.svg";
import portIcon from "../../assets/svgs/ports.svg";
import wifiIcon from "../../assets/svgs/wifi.svg";
import arrownDownwardIcon from "../../assets/svgs/arrow-downwards.svg";
import EmirateLogo from "../../assets/images/emirates.png";
import { useState } from "react";
import FlightBookingBaggageSection from "../atoms/FlightBookingBaggageSection";
import FlightBookingMealsSection from "../atoms/FlightBookingMealsSection";
import FlightBookingComfortAirportAndTravelSection from "../atoms/FlightBookingComfortAirportAndTravelSection";
import FlightBookingSeatSection from "../atoms/FlightBookingSeatSection";
import FLightPriceBreakdown from "../atoms/FlightPriceBreakdown";
import Button from "../atoms/Button";
import CustomToggle from "../common/CustomToggle";
import FlightSummaryCard from "../atoms/FlightSummaryCard";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
import TailwindCustomInput from "../common/TailwindCustomInput";
import FLightFareRule from "../atoms/FlightFareRule";
import { buildFlightSegmentFromTrip, formatDate, formatTime, getPriceCabinClassForFlightSummary } from "../../utils/helpers";

function ChevronDown() {
    return (
        <img alt="arrow-icon" src={arrownDownwardIcon} className="pointer-events-none absolute right-3 top-3/5" />
    )
}

const defaultPassenger = () => ({
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    paxType: "",
    passportNumber: "",
    issuingCountry: "",
    expiryDate: null,
});

export default function FlightBookingBookSection({ trip }: { trip: any }) {
    const [openPrice, setOpenPrice] = useState(false);
    const [openBaggage, setOpenBaggage] = useState(true);
    const [openSeats, setOpenSeats] = useState(true);
    const [openMeals, setOpenMeals] = useState(true);
    const [openCE, setOpenCE] = useState(true);
    const [openAirport, setOpenAirport] = useState(true);
    const [depBagOn, setDepBagOn] = useState(true);
    const [retBagOn, setRetBagOn] = useState(false);
    const [bookingForOther, setBookingForOther] = useState(true);
    const [openTP, setOpenTP] = useState(true);

    const [passengers, setPassengers] = useState([defaultPassenger()]);

    const updatePassengers = (next: ReturnType<typeof defaultPassenger>[]) => {
        setPassengers(next);
    };

    const handlePassengerFieldChange = (index: number, field: "paxType" | "passportNumber" | "issuingCountry" | "expiryDate", value: any) => {
        updatePassengers(
            passengers.map((p, i) => (i === index ? { ...p, [field]: value } : p))
        );
    };

    const addPassenger = () => {
        updatePassengers([...passengers, defaultPassenger()]);
    };

    const removePassenger = (index: number) => {
        if (passengers.length === 1) return;
        updatePassengers(passengers.filter((_, i) => i !== index));
    };

    const assets = { EmirateLogo, cabinIcon, baggageIcon, mealIcon, wifiIcon, portIcon, entertainmentIcon };
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

    return (
        <section className="mx-auto max-w-full px-10 flight-booking-section">
            <div className="grid gap-4 md:grid-cols-[2fr_1fr] flight-booking-grid">
                {/* LEFT: Forms */}
                <div className="space-y-4">
                    {/* Contact person details (own card) */}
                    <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-sm">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
                            <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                                Contact person details
                            </h3>
                            <CustomToggle
                                label="I’m booking for someone else"
                                checked={bookingForOther}
                                onChange={() => setBookingForOther((v) => !v)}
                            />


                        </div>

                        <div className="px-4 py-4">
                            <div className="grid gap-4 md:grid-cols-[1.2fr_1.8fr]">
                                <div className="relative w-full">
                                    <label className="mb-1 block text-[12px] text-[#3D495C]">Title</label>
                                    <select className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none">
                                        <option>Select title</option>
                                        <option>Mr</option>
                                        <option>Ms</option>
                                        <option>Mrs</option>
                                    </select>
                                    <ChevronDown />
                                </div>
                                <TailwindCustomInput
                                    type="text"
                                    placeholder="Enter your full name"
                                    label="Full name (Filled based on ID/Passport/Driver’s license)"
                                />

                                <div className="w-full">
                                    <label className="mb-1 block text-[12px] text-[#3D495C]">Phone</label>
                                    <div className="flex gap-2">
                                        <Button
                                            overrideClasses
                                            type="button"
                                            className="h-10 inline-flex items-center gap-2 rounded-lg border border-[#C2CAD6] bg-white px-3 text-sm text-[#3D495C]"
                                        >
                                            <span className="text-lg leading-none">🇺🇸</span>
                                            <span className="text-[#3D495C]">+1</span>
                                            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M11.354 1.35372L6.35403 6.35372C6.30759 6.40021 6.25245 6.43709 6.19175 6.46225C6.13105 6.48742 6.06599 6.50037 6.00028 6.50037C5.93457 6.50037 5.86951 6.48742 5.80881 6.46225C5.74811 6.43709 5.69296 6.40021 5.64653 6.35372L0.646528 1.35372C0.552708 1.2599 0.5 1.13265 0.5 0.999973C0.5 0.867291 0.552708 0.740043 0.646528 0.646223C0.740348 0.552402 0.867596 0.499695 1.00028 0.499695C1.13296 0.499695 1.26021 0.552402 1.35403 0.646223L6.00028 5.2931L10.6465 0.646223C10.693 0.599767 10.7481 0.562917 10.8088 0.537776C10.8695 0.512635 10.9346 0.499695 11.0003 0.499695C11.066 0.499695 11.131 0.512635 11.1917 0.537776C11.2524 0.562917 11.3076 0.599767 11.354 0.646223C11.4005 0.692678 11.4373 0.747828 11.4625 0.808525C11.4876 0.869221 11.5006 0.934275 11.5006 0.999973C11.5006 1.06567 11.4876 1.13072 11.4625 1.19142C11.4373 1.25212 11.4005 1.30727 11.354 1.35372Z" fill="#3D495C" />
                                            </svg>

                                        </Button>
                                        <TailwindCustomInput
                                            type="text"
                                            placeholder="Phone"
                                        />
                                    </div>
                                </div>
                                <TailwindCustomInput
                                    type="text"
                                    placeholder="Enter an email"
                                    label="Email"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Passenger details (separate card) */}
                    {passengers.map((p, idx) => (
                        <div key={p.id} className="rounded-xl border border-[#E4E4E7] bg-white shadow-sm">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-[#E4E4E7]">
                                <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                                    Passenger {String(idx + 1).padStart(2, "0")} details
                                </h3>

                                {passengers.length > 1 && idx > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => removePassenger(idx)}
                                        className="text-sm text-red-600 hover:underline"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <div className="px-4 py-4">
                                <div className="grid gap-4 md:grid-cols-[1.2fr_1.8fr]">
                                    <div className="relative w-full">
                                        <label className="mb-1 block text-[12px] text-[#3D495C]">Pax type</label>
                                        <select
                                            className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                                            value={p.paxType}
                                            onChange={(e) => handlePassengerFieldChange(idx, "paxType", e.target.value)}
                                        >
                                            <option value="">Select title</option>
                                            <option value="Adult">Adult</option>
                                            <option value="Child">Child</option>
                                            <option value="Infant">Infant</option>
                                        </select>
                                        <ChevronDown />
                                    </div>

                                    <TailwindCustomInput
                                        type="text"
                                        placeholder="Enter passport number"
                                        label="Passport number"
                                        value={p.passportNumber}
                                        onChange={(evOrVal) => {
                                            const v = evOrVal && evOrVal.target ? evOrVal.target.value : evOrVal;
                                            handlePassengerFieldChange(idx, "passportNumber", v ?? "");
                                        }}
                                    />

                                    <div className="relative w-full">
                                        <label className="mb-1 block text-[12px] text-[#3D495C]">Issuing country</label>
                                        <select
                                            className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
                                            value={p.issuingCountry}
                                            onChange={(e) => handlePassengerFieldChange(idx, "issuingCountry", e.target.value)}
                                        >
                                            <option value="">Select issuing country</option>
                                            <option value="UAE">UAE</option>
                                            <option value="PK">Pakistan</option>
                                            <option value="US">United States</option>
                                            {/* ya ap countries list map kar do */}
                                        </select>
                                        <ChevronDown />
                                    </div>

                                    <div className="w-full">
                                        <label className="mb-1 block text-[12px] text-[#3D495C]">Expiry date</label>
                                        <TailiwindCustomDatePicker
                                            value={p.expiryDate}
                                            onChange={(date) => handlePassengerFieldChange(idx, "expiryDate", date)}
                                            placeholder="Please select"
                                            buttonIconSrc={true}
                                            overridesClass
                                            inputClass="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="pt-4 pb-2 flex justify-center">
                        <Button
                            overrideClasses
                            type="button"
                            onClick={addPassenger}
                            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#2351A3] hover:underline"
                        >
                            Add another passenger
                        </Button>
                    </div>

                    <div className="mt-6 rounded-2xl border border-[#E4E4E7] bg-white">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-[#E4E4E7]">
                            <h3 className="text-[16px] font-semibold text-[#0A0C0F]">Enhance your trip</h3>
                            <Button overrideClasses className="text-[14px] font-medium text-[#5383DA] hover:underline">
                                Clear selection
                            </Button>
                        </div>

                        {/* Baggage sub-card */}
                        <FlightBookingBaggageSection
                            open={openBaggage}
                            onToggleOpen={() => setOpenBaggage(v => !v)}
                            depChecked={depBagOn}
                            retChecked={retBagOn}
                            onToggleDep={() => setDepBagOn(v => !v)}
                            onToggleRet={() => setRetBagOn(v => !v)}
                        />

                        <FlightBookingSeatSection
                            open={openSeats}
                            onToggleOpen={() => setOpenSeats(v => !v)}
                        />

                        {/* Meals & Drinks */}
                        <FlightBookingMealsSection
                            open={openMeals}
                            onToggleOpen={() => setOpenMeals(v => !v)}
                        />

                        {/* Comfort & Entertainment */}
                        <FlightBookingComfortAirportAndTravelSection
                            openComfort={openCE}
                            switchComfort={() => setOpenCE(v => !v)}
                            openAirport={openAirport}
                            switchAirport={() => setOpenAirport(v => !v)}
                            openProtection={openTP}
                            switchProtection={() => setOpenTP(v => !v)}
                        />

                    </div>
                </div>


                {/* RIGHT: Trip details */}
                <div>
                    <FlightSummaryCard
                        title="Trip details"
                        headerActionText="View all"
                        onHeaderActionClick={() => {/* handle view all */ }}
                        segments={segments}
                        fare={priceFareFamily}
                    />


                    <FLightFareRule trip={trip.raw} />

                    <FLightPriceBreakdown
                        open={openPrice}
                        onToggleOpen={() => setOpenPrice(v => !v)}
                        trip={trip.raw}
                    />


                    <Button
                        type="button"
                        overrideClasses
                        className="mt-6 mx-4 w-[calc(100%-2rem)] rounded-xl bg-[#2351A3] py-3 text-[16px] font-semibold text-[#F2F2F3] hover:brightness-95 active:brightness-90"
                    >
                        Continue
                    </Button>
                </div>


            </div>
        </section>
    );
}