import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import entertainmentIcon from "../../assets/svgs/entertainment.svg";
import mealIcon from "../../assets/svgs/meals.svg";
import portIcon from "../../assets/svgs/ports.svg";
import wifiIcon from "../../assets/svgs/wifi.svg";
import EmirateLogo from "../../assets/images/emirates.png";
import { useState } from "react";
import FlightBookingBaggageSection from "../atoms/FlightBookingBaggageSection";
import FlightBookingMealsSection from "../atoms/FlightBookingMealsSection";
import FlightBookingComfortAirportAndTravelSection from "../atoms/FlightBookingComfortAirportAndTravelSection";

function ChevronDown() {
    return (
        <svg
            width="14"
            height="9"
            viewBox="0 0 14 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute right-3 top-3/5"
        >
            <path
                d="M13.6925 1.94217L7.44254 8.19217C7.38449 8.25028 7.31556 8.29638 7.23969 8.32783C7.16381 8.35928 7.08248 8.37547 7.00035 8.37547C6.91821 8.37547 6.83688 8.35928 6.76101 8.32783C6.68514 8.29638 6.61621 8.25028 6.55816 8.19217L0.30816 1.94217C0.190885 1.82489 0.125 1.66583 0.125 1.49998C0.125 1.33413 0.190885 1.17507 0.30816 1.05779C0.425435 0.940518 0.584495 0.874634 0.750347 0.874634C0.9162 0.874634 1.07526 0.940518 1.19253 1.05779L7.00035 6.86639L12.8082 1.05779C12.8662 0.999725 12.9352 0.953662 13.011 0.922235C13.0869 0.890809 13.1682 0.874634 13.2503 0.874634C13.3325 0.874634 13.4138 0.890809 13.4897 0.922235C13.5655 0.953662 13.6345 0.999725 13.6925 1.05779C13.7506 1.11586 13.7967 1.1848 13.8281 1.26067C13.8595 1.33654 13.8757 1.41786 13.8757 1.49998C13.8757 1.5821 13.8595 1.66342 13.8281 1.73929C13.7967 1.81516 13.7506 1.8841 13.6925 1.94217Z"
                fill="#3D495C"
            />
        </svg>
    )
}

const CardChevron = ({
    open,
    onClick,
    className = "",
}: {
    open: boolean;
    onClick: () => void;
    className?: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={open ? "Collapse" : "Expand"}
        className={`transition-transform duration-200 ${open ? "rotate-180" : ""} ${className}`}
    >
        {open ? (
            <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M13.6925 1.94217L7.44254 8.19217C7.38449 8.25028 7.31556 8.29638 7.23969 8.32783C7.16381 8.35928 7.08248 8.37547 7.00035 8.37547C6.91821 8.37547 6.83688 8.35928 6.76101 8.32783C6.68514 8.29638 6.61621 8.25028 6.55816 8.19217L0.30816 1.94217C0.190885 1.82489 0.125 1.66583 0.125 1.49998C0.125 1.33413 0.190885 1.17507 0.30816 1.05779C0.425435 0.940518 0.584495 0.874634 0.750347 0.874634C0.9162 0.874634 1.07526 0.940518 1.19253 1.05779L7.00035 6.86639L12.8082 1.05779C12.8662 0.999725 12.9352 0.953662 13.011 0.922235C13.0869 0.890809 13.1682 0.874634 13.2503 0.874634C13.3325 0.874634 13.4138 0.890809 13.4897 0.922235C13.5655 0.953662 13.6345 0.999725 13.6925 1.05779C13.7506 1.11586 13.7967 1.1848 13.8281 1.26067C13.8595 1.33654 13.8757 1.41786 13.8757 1.49998C13.8757 1.5821 13.8595 1.66342 13.8281 1.73929C13.7967 1.81516 13.7506 1.8841 13.6925 1.94217Z"
                    fill="#0A0C0F"
                />
            </svg>
        ) : (
            <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.307465 7.05783L6.55747 0.80783C6.61551 0.74972 6.68444 0.70362 6.76032 0.672168C6.83619 0.640715 6.91752 0.624527 6.99965 0.624527C7.08179 0.624527 7.16312 0.640715 7.23899 0.672168C7.31486 0.70362 7.3838 0.74972 7.44184 0.80783L13.6918 7.05783C13.8091 7.17511 13.875 7.33417 13.875 7.50002C13.875 7.66587 13.8091 7.82493 13.6918 7.94221C13.5746 8.05948 13.4155 8.12537 13.2497 8.12537C13.0838 8.12537 12.9247 8.05948 12.8075 7.94221L6.99965 2.13361L1.19184 7.94221C1.13377 8.00027 1.06483 8.04634 0.988962 8.07776C0.913092 8.10919 0.831774 8.12537 0.749652 8.12537C0.66753 8.12537 0.586212 8.10919 0.510342 8.07776C0.434471 8.04634 0.365533 8.00027 0.307465 7.94221C0.249395 7.88414 0.203333 7.8152 0.171907 7.73933C0.14048 7.66346 0.124304 7.58214 0.124304 7.50002C0.124304 7.4179 0.14048 7.33658 0.171907 7.26071C0.203333 7.18484 0.249395 7.1159 0.307465 7.05783Z" fill="#0A0C0F" />
            </svg>
        )}
    </button>
);

function FormSwitch({
    checked,
    onChange,
    label,
    disabled = false,
    className = "",
}: {
    checked: boolean;
    onChange: () => void;
    label?: string;
    disabled?: boolean;
    className?: string;
}) {
    return (
        <label
            className={`inline-flex items-center gap-2 select-none ${label ? "text-[12px] text-[#3D495C]" : ""
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
        >
            {label && <span>{label}</span>}
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                aria-checked={checked}
                role="switch"
            />
            <span
                className="
            relative block h-5 w-9 rounded-full bg-[#D7E1EF]
            transition-colors duration-300
            peer-checked:bg-[#2351A3]
            after:content-[''] after:absolute after:top-0.5 after:left-0.5
            after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm
            after:transition-transform after:duration-300
            peer-checked:after:translate-x-4
          "
            />
        </label>
    );
}

export default function FlightBookingBookSection() {
    const [openPrice, setOpenPrice] = useState(true);
    const [openBaggage, setOpenBaggage] = useState(true);
    const [openMeals, setOpenMeals] = useState(true);
    const [openCE, setOpenCE] = useState(true);
    const [openAirport, setOpenAirport] = useState(true);
    const [depBagOn, setDepBagOn] = useState(true);
    const [retBagOn, setRetBagOn] = useState(false);
    const [bookingForOther, setBookingForOther] = useState(true);
    const [openTP, setOpenTP] = useState(true);


    return (
        <section className="mx-auto max-w-full px-10">
            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                {/* LEFT: Forms */}
                <div className="space-y-4">
                    {/* Contact person details (own card) */}
                    <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-sm">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
                            <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                                Contact person details
                            </h3>
                            <FormSwitch
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

                                <div className="w-full">
                                    <label className="mb-1 block text-[12px] text-[#3D495C]">
                                        Full name (Filled based on ID/Passport/Driver’s license)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        className="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none"
                                    />
                                </div>

                                <div className="w-full">
                                    <label className="mb-1 block text-[12px] text-[#3D495C]">Phone</label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className="h-10 inline-flex items-center gap-2 rounded-lg border border-[#C2CAD6] bg-white px-3 text-sm text-[#3D495C]"
                                        >
                                            <span className="text-lg leading-none">🇺🇸</span>
                                            <span className="text-[#3D495C]">+1</span>
                                            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M11.354 1.35372L6.35403 6.35372C6.30759 6.40021 6.25245 6.43709 6.19175 6.46225C6.13105 6.48742 6.06599 6.50037 6.00028 6.50037C5.93457 6.50037 5.86951 6.48742 5.80881 6.46225C5.74811 6.43709 5.69296 6.40021 5.64653 6.35372L0.646528 1.35372C0.552708 1.2599 0.5 1.13265 0.5 0.999973C0.5 0.867291 0.552708 0.740043 0.646528 0.646223C0.740348 0.552402 0.867596 0.499695 1.00028 0.499695C1.13296 0.499695 1.26021 0.552402 1.35403 0.646223L6.00028 5.2931L10.6465 0.646223C10.693 0.599767 10.7481 0.562917 10.8088 0.537776C10.8695 0.512635 10.9346 0.499695 11.0003 0.499695C11.066 0.499695 11.131 0.512635 11.1917 0.537776C11.2524 0.562917 11.3076 0.599767 11.354 0.646223C11.4005 0.692678 11.4373 0.747828 11.4625 0.808525C11.4876 0.869221 11.5006 0.934275 11.5006 0.999973C11.5006 1.06567 11.4876 1.13072 11.4625 1.19142C11.4373 1.25212 11.4005 1.30727 11.354 1.35372Z" fill="#3D495C" />
                                            </svg>

                                        </button>
                                        <input
                                            type="tel"
                                            placeholder="Phone"
                                            className="h-10 flex-1 rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="w-full">
                                    <label className="mb-1 block text-[12px] text-[#3D495C]">Email</label>
                                    <input
                                        type="email"
                                        placeholder="Enter an email"
                                        className="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Passenger details (separate card) */}
                    <div className="rounded-xl border border-[#E4E4E7] bg-white shadow-sm">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-[#E4E4E7]">
                            <h3 className="text-[15px] font-medium text-[#0A0C0F]">
                                Passenger 01 details
                            </h3>


                        </div>

                        <div className="px-4 py-4">
                            <div className="grid gap-4 md:grid-cols-[1.2fr_1.8fr]">
                                <div className="relative w-full">
                                    <label className="mb-1 block text-[12px] text-[#3D495C]">Pax type</label>
                                    <select className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none">
                                        <option>Select title</option>
                                        <option>Adult</option>
                                    </select>
                                    <ChevronDown />
                                </div>

                                <div className="w-full">
                                    <label className="mb-1 block text-[12px] text-[#3D495C]">
                                        Passport number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter passport number"
                                        className="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none"
                                    />
                                </div>

                                <div className="relative w-full">
                                    <label className="mb-1 block text-[12px] text-[#3D495C]">Issuing country</label>
                                    <select className="h-10 w-full appearance-none rounded-lg border border-[#C2CAD6] bg-white px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none">
                                        <option>Select issuing country</option>
                                        <option>UAE</option>
                                    </select>
                                    <ChevronDown />
                                </div>

                                <div className="w-full">
                                    <label className="mb-1 block text-[12px] text-[#3D495C]">Expiry date</label>
                                    <input
                                        type="date"
                                        className="h-10 w-full rounded-lg border border-[#C2CAD6] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 pb-2 flex justify-center">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#2351A3] hover:underline"
                        >
                            Add another passenger
                        </button>
                    </div>

                    <div className="mt-6 rounded-2xl border border-[#E4E4E7] bg-white">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-[#E4E4E7]">
                            <h3 className="text-[16px] font-semibold text-[#0A0C0F]">Enhance your trip</h3>
                            <button className="text-[14px] font-medium text-[#5383DA] hover:underline">
                                Clear selection
                            </button>
                        </div>

                        {/* Baggage sub-card */}
                        <FlightBookingBaggageSection
                            CardChevron={CardChevron}
                            FormSwitch={FormSwitch}
                            open={openBaggage}
                            onToggleOpen={() => setOpenBaggage(v => !v)}
                            depChecked={depBagOn}
                            retChecked={retBagOn}
                            onToggleDep={() => setDepBagOn(v => !v)}
                            onToggleRet={() => setRetBagOn(v => !v)}
                        />

                        {/* Meals & Drinks */}
                        <FlightBookingMealsSection
                            CardChevron={CardChevron}
                            open={openMeals}
                            onToggleOpen={() => setOpenMeals(v => !v)}
                        />

                        {/* Comfort & Entertainment */}
                        <FlightBookingComfortAirportAndTravelSection
                            CardChevron={CardChevron}
                            FormSwitch={FormSwitch}
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
                    <div className="rounded-xl border border-[#E4E4E7] bg-white">
                        <div className="flex items-center justify-between border-b border-[#E4E4E7] px-4 py-3">
                            <h3 className="text-[15px] font-medium text-[#0A0C0F]">Trip details</h3>
                            <button className="text-[15px] font-medium text-[#5383DA] hover:underline">View all</button>
                        </div>

                        <div className="px-5 py-3">
                            <p className="mb-3 text-base font-semibold text-[#0A0C0F]">Departure flight</p>

                            <div className="mb-4 text-center text-[14px] font-medium text-[#0A0C0F]">
                                Dubai (DXB) <span className="mx-2">→</span> Mumbai (BOM)
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={EmirateLogo}
                                        alt="Emirates Airlines"
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="text-[15px] font-medium text-[#0A0C0F]">
                                            Emirates Airlines
                                        </div>
                                        <div className="mt-[2px] text-[12px] text-[#3D495C]">
                                            EK 1234 – Economy class
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <img src={cabinIcon} alt="Cabin" className="h-4 w-4" title="Cabin: 1PC" />
                                    <img src={baggageIcon} alt="Baggage" className="h-4 w-4" title="Baggage: 20KG" />
                                    <img src={mealIcon} alt="Meal" className="h-4 w-4" title="Meal Included" />
                                    <img src={wifiIcon} alt="Wi-Fi" className="h-4 w-4" title="WiFi Available" />
                                    <img src={portIcon} alt="Beverage" className="h-4 w-4" title="Beverages" />
                                    <img src={entertainmentIcon} alt="Entertainment" className="h-4 w-4" title="Entertainment" />
                                </div>
                            </div>

                            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                                <div className="text-left">
                                    <div className="text-[14px] font-medium text-[#0A0C0F]">10:45 AM</div>
                                    <div className="text-[10px] text-[#3D495C]">Mon, 16 June 2025</div>
                                </div>

                                <div className="relative">
                                    <div className="absolute left-[10px] right-[10px] top-[20px] h-[2px] bg-[#A7C0EC]" />
                                    <span className="absolute left-0 top-[14px] h-[14px] w-[14px] rounded-full bg-[#2351A3]" />
                                    <span className="absolute right-0 top-[14px] h-[14px] w-[14px] rounded-full bg-[#2351A3]" />
                                    <div className="relative flex justify-center">
                                        <span className="inline-block px-3 py-1 text-[12px] text-[#3D495C] text-center">
                                            Duration: 03 hours 15 minutes
                                        </span>
                                    </div>
                                    <div className="text-center text-[12px] text-[#3D495C]">Direct</div>
                                </div>

                                <div className="text-right">
                                    <div className="text-[14px] font-medium text-[#0A0C0F]">02:00 PM</div>
                                    <div className="text-[10px] text-[#3D495C]">Mon, 16 June 2025</div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-[#E4E4E7]" />

                        <div className="px-5 py-3">
                            <p className="mb-3 text-base font-semibold text-[#0A0C0F]">Return flight</p>

                            <div className="mb-4 text-center text-[14px] font-medium text-[#0A0C0F]">
                                Mumbai (BOM) <span className="mx-2">→</span> Dubai (DXB)
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={EmirateLogo}
                                        alt="Emirates Airlines"
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="text-[15px] font-medium text-[#0A0C0F]">
                                            Emirates Airlines
                                        </div>
                                        <div className="mt-[2px] text-[12px] text-[#3D495C]">
                                            EK 1234 – Economy class
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <img src={cabinIcon} alt="Cabin" className="h-4 w-4" title="Cabin: 1PC" />
                                    <img src={baggageIcon} alt="Baggage" className="h-4 w-4" title="Baggage: 20KG" />
                                    <img src={mealIcon} alt="Meal" className="h-4 w-4" title="Meal Included" />
                                    <img src={wifiIcon} alt="Wi-Fi" className="h-4 w-4" title="WiFi Available" />
                                    <img src={portIcon} alt="Beverage" className="h-4 w-4" title="Beverages" />
                                    <img src={entertainmentIcon} alt="Entertainment" className="h-4 w-4" title="Entertainment" />
                                </div>
                            </div>

                            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                                <div className="text-left">
                                    <div className="text-[14px] font-medium text-[#0A0C0F]">03:00 PM</div>
                                    <div className="text-[10px] text-[#3D495C]">Mon, 23 June 2025</div>
                                </div>

                                <div className="relative">
                                    <div className="absolute left-[10px] right-[10px] top-[20px] h-[2px] bg-[#A7C0EC]" />
                                    <span className="absolute left-0 top-[14px] h-[14px] w-[14px] rounded-full bg-[#2351A3]" />
                                    <span className="absolute right-0 top-[14px] h-[14px] w-[14px] rounded-full bg-[#2351A3]" />
                                    <div className="relative flex justify-center">
                                        <span className="inline-block px-3 py-1 text-[12px] text-[#3D495C] text-center">
                                            Duration: 03 hours 15 minutes
                                        </span>
                                    </div>
                                    <div className="text-center text-[12px] text-[#3D495C]">Direct</div>
                                </div>

                                <div className="text-right">
                                    <div className="text-[14px] font-medium text-[#0A0C0F]">06:20 PM</div>
                                    <div className="text-[10px] text-[#3D495C]">Mon, 23 June 2025</div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-[#E4E4E7]" />

                        <div className="px-4 py-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-[#3D495C] text-[12px]">Fare family</div>
                                    <div className="font-medium text-[14px] text-[#0A0C0F]">Economy standard</div>
                                </div>
                                <button className="text-[#5383DA] hover:underline text-[14px]">Change</button>
                            </div>
                        </div>

                    </div>

                    <div className="mt-4 rounded-xl border border-[#E4E4E7] bg-white">
                        <div className="px-4 py-3 text-[16px] font-semibold text-[#0A0C0F]">
                            Important fare rules
                        </div>
                        <div className="h-px bg-[#E4E4E7]" />

                        <ul className="px-4 py-1">
                            <li className="flex items-center justify-between py-1">
                                <span className="text-[#3D495C] text-[12px]">Checked baggage</span>
                                <span className="text-[#0A0C0F] text-[16px] font-medium">30 KGs</span>
                            </li>
                            <li className="flex items-center justify-between py-1">
                                <span className="text-[#3D495C] text-[12px]">Change fee</span>
                                <span className="text-[#0A0C0F] text-[16px] font-medium">$25</span>
                            </li>
                            <li className="flex items-center justify-between py-1">
                                <span className="text-[#3D495C] text-[12px]">No show penalty</span>
                                <span className="text-[#0A0C0F] text-[16px] font-medium">$120</span>
                            </li>
                            <li className="flex items-center justify-between py-1">
                                <span className="text-[#3D495C] text-[12px]">Refund fee</span>
                                <span className="text-[#0A0C0F] text-[16px] font-medium">$50</span>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-4 rounded-xl border border-[#E4E4E7] bg-white">
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className="text-[16px] font-semibold text-[#0A0C0F]">Price breakdown</div>
                            <CardChevron open={openPrice} onClick={() => setOpenPrice((v) => !v)} />
                        </div>

                        {openPrice && <div className="h-px bg-[#E4E4E7]" />}

                        <div
                            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${openPrice ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                }`}
                        >
                            <div className="overflow-hidden">
                                <ul className="px-4 py-1">
                                    <li className="flex items-center justify-between py-1">
                                        <span className="text-[12px] text-[#3D495C]">Total</span>
                                        <span className="text-[14px] font-semibold text-[#0A0C0F]">$1,329.75</span>
                                    </li>
                                    {/* yahan aur line-items add kar sakte ho if needed */}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="mt-6 mx-4 w-[calc(100%-2rem)] rounded-xl bg-[#2351A3] py-3 text-[16px] font-semibold text-[#F2F2F3] hover:brightness-95 active:brightness-90"
                    >
                        Continue
                    </button>
                </div>


            </div>
        </section>
    );
}