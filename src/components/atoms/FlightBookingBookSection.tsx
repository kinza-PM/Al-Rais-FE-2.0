import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import entertainmentIcon from "../../assets/svgs/entertainment.svg";
import mealIcon from "../../assets/svgs/meals.svg";
import portIcon from "../../assets/svgs/ports.svg";
import wifiIcon from "../../assets/svgs/wifi.svg";
import EmirateLogo from "../../assets/images/emirates.png";
import { useState } from "react";
import { flightBookingAirportServices, flightBookingComfortAndEntertainment } from "../../utils/mockData";
import FlightBookingBaggageSection from "../atoms/FlightBookingBaggageSection";
import FlightBookingMealsSection from "../atoms/FlightBookingMealsSection";

type RowBase = {
    leg: "Departure flight" | "Return flight";
    logo: string;
    airline: string;
    flight: string;
    passenger: string;
    cost: number;
    checked: boolean;
};

type WifiRow = RowBase & { speed: string };
type MoviesRow = RowBase & { selection: string };
type MusicRow = RowBase & { selection: string };
type LoungeAccessRow = RowBase;
type FastTrackRow = RowBase;
type PriorityBoardingRow = RowBase;

type CeState = {
    wifi: WifiRow[];
    movies: MoviesRow[];
    music: MusicRow[];
};

type AirportState = {
    lounge_access: LoungeAccessRow[];
    fast_track: FastTrackRow[];
    priority_boarding: PriorityBoardingRow[];
};

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
    const [tpState, setTpState] = useState({
        departure: {
            logo: EmirateLogo, // your logo import
            airline: "Emirates Airlines",
            flight: "EK 1234 – Economy class",
            passenger: "01 Adult",
            cost: 48,
            checked: true,
        },
    });

    const [ceState, setCeState] = useState<CeState>(
        flightBookingComfortAndEntertainment as CeState
    );
    const [airportState, setAirportState] = useState<AirportState>(
        flightBookingAirportServices as AirportState
    );
    const comfortSectionsOrder: (keyof CeState)[] = ["wifi", "movies", "music"];
    const airportSectionsOrder: (keyof AirportState)[] = ["lounge_access", "fast_track", "priority_boarding"];

    const ceConfig: Record<
        keyof CeState,
        { title: string; valueLabel: string; valueKey: "speed" | "selection" }
    > = {
        wifi: { title: "Wi-Fi upgrade", valueLabel: "Faster wi-fi", valueKey: "speed" },
        movies: { title: "Movies", valueLabel: "Movies selection", valueKey: "selection" },
        music: { title: "Music", valueLabel: "Music selection", valueKey: "selection" },
    };

    const airportConfig: Record<
        keyof AirportState,
        { title: string }
    > = {
        lounge_access: { title: "Lounge access" },
        fast_track: { title: "Fast track security checks" },
        priority_boarding: { title: "Priority boarding" },
    };





    const toggleCE = <S extends keyof CeState>(section: S, i: number) =>
        setCeState(prev => ({
            ...prev,
            [section]: prev[section].map((row, idx) =>
                idx === i ? { ...row, checked: !row.checked } : row
            ) as CeState[S],
        }));

    const toggleAirport = <S extends keyof AirportState>(section: S, i: number) =>
        setAirportState(prev => ({
            ...prev,
            [section]: prev[section].map((row, idx) =>
                idx === i ? { ...row, checked: !row.checked } : row
            ) as AirportState[S],
        }));

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
                        <div className="px-3 pb-3 mt-3">
                            <div className="rounded-xl border border-[#E4E4E7] overflow-hidden">
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A7C0EC]">
                                            <svg width="25" height="25" viewBox="0 0 28 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M15.5005 19.4999C15.5005 19.7966 15.4125 20.0866 15.2477 20.3333C15.0829 20.5799 14.8486 20.7722 14.5745 20.8857C14.3004 20.9993 13.9988 21.029 13.7078 20.9711C13.4169 20.9132 13.1496 20.7703 12.9398 20.5606C12.73 20.3508 12.5872 20.0835 12.5293 19.7925C12.4714 19.5016 12.5011 19.2 12.6147 18.9259C12.7282 18.6518 12.9204 18.4175 13.1671 18.2527C13.4138 18.0879 13.7038 17.9999 14.0005 17.9999C14.3983 17.9999 14.7798 18.1579 15.0611 18.4393C15.3424 18.7206 15.5005 19.1021 15.5005 19.4999ZM27.6355 4.87491C23.7911 1.72164 18.9726 -0.00170898 14.0005 -0.00170898C9.02831 -0.00170898 4.20985 1.72164 0.365474 4.87491C0.263945 4.9583 0.179836 5.06087 0.117948 5.17677C0.0560597 5.29266 0.0176049 5.41961 0.00477885 5.55037C-0.00804724 5.68112 0.00500665 5.81313 0.0431952 5.93884C0.0813838 6.06455 0.143959 6.18151 0.227349 6.28304C0.310738 6.38456 0.413308 6.46867 0.529203 6.53056C0.645098 6.59245 0.772048 6.6309 0.902804 6.64373C1.16688 6.66963 1.43043 6.58957 1.63547 6.42116C5.12198 3.56205 9.49156 1.99952 14.0005 1.99952C18.5094 1.99952 22.879 3.56205 26.3655 6.42116C26.5705 6.58957 26.8341 6.66963 27.0981 6.64373C27.3622 6.61783 27.6052 6.48808 27.7736 6.28304C27.942 6.07799 28.0221 5.81444 27.9962 5.55037C27.9703 5.28629 27.8405 5.04332 27.6355 4.87491ZM23.6255 9.34616C20.8871 7.17819 17.4969 5.99859 14.0042 5.99859C10.5116 5.99859 7.1213 7.17819 4.38297 9.34616C4.17511 9.51093 4.04121 9.75152 4.01074 10.015C3.98026 10.2785 4.05571 10.5433 4.22047 10.7512C4.38524 10.959 4.62583 11.0929 4.88932 11.1234C5.15281 11.1539 5.41761 11.0784 5.62547 10.9137C8.0103 9.02594 10.9627 7.99887 14.0042 7.99887C17.0457 7.99887 19.9981 9.02594 22.383 10.9137C22.4859 10.9953 22.6039 11.0558 22.7302 11.0918C22.8565 11.1278 22.9887 11.1385 23.1191 11.1234C23.2496 11.1083 23.3758 11.0677 23.4906 11.0038C23.6053 10.94 23.7064 10.8541 23.788 10.7512C23.8696 10.6482 23.9301 10.5303 23.9661 10.4039C24.0021 10.2776 24.0128 10.1455 23.9978 10.015C23.9827 9.88453 23.942 9.75831 23.8781 9.64355C23.8143 9.52879 23.7284 9.42774 23.6255 9.34616ZM19.593 13.8162C17.9686 12.6357 16.0122 11.9998 14.0042 11.9998C11.9962 11.9998 10.0398 12.6357 8.41547 13.8162C8.20098 13.9723 8.0573 14.2073 8.01604 14.4693C7.97478 14.7314 8.03933 14.9992 8.19547 15.2137C8.35162 15.4282 8.58658 15.5718 8.84866 15.6131C9.11074 15.6544 9.37848 15.5898 9.59297 15.4337C10.8749 14.5014 12.4192 13.9992 14.0042 13.9992C15.5893 13.9992 17.1336 14.5014 18.4155 15.4337C18.5217 15.511 18.6421 15.5666 18.7698 15.5974C18.8975 15.6282 19.03 15.6335 19.1598 15.6131C19.2896 15.5927 19.414 15.5469 19.5261 15.4783C19.6382 15.4098 19.7357 15.3199 19.813 15.2137C19.8903 15.1075 19.9459 14.9871 19.9767 14.8593C20.0075 14.7316 20.0128 14.5991 19.9924 14.4693C19.972 14.3396 19.9262 14.2151 19.8577 14.103C19.7891 13.991 19.6992 13.8935 19.593 13.8162Z" fill="#1A3C7A" />
                                            </svg>

                                        </div>
                                        <div>
                                            <div className="text-[15px] font-medium text-[#0A0C0F]">Comfort & entertainment</div>
                                            <div className="text-[12px] text-[#3D495C]">
                                                Enjoy a selection of movies & music, higher speed of wi-fi.
                                            </div>
                                        </div>
                                    </div>
                                    <CardChevron open={openCE} onClick={() => setOpenCE((v) => !v)} />
                                </button>

                                {openCE && <div className="h-px bg-[#E4E4E7]" />}

                                {openCE && (
                                    <div className="px-4 py-4">
                                        {comfortSectionsOrder.map((sectionKey, secIndex) => {
                                            const cfg = ceConfig[sectionKey];

                                            return (
                                                <div key={sectionKey} className={secIndex === 0 ? "" : "mt-6"}>
                                                    <div className="text-[16px] text-[#0A0C0F]">{cfg.title}</div>

                                                    {ceState[sectionKey].map((row, i) => {
                                                        // row[cfg.valueKey] ko read karne ke liye yeh line
                                                        const value = (row as any)[cfg.valueKey] as string;

                                                        return (
                                                            <div key={`${sectionKey}-${i}`} className="mt-3">
                                                                <div className="mb-2 text-[15px] font-semibold text-[#0A0C0F]">
                                                                    {row.leg}
                                                                </div>

                                                                <div className="grid grid-cols-[minmax(220px,1.1fr)_auto_auto_1fr_auto] items-center gap-10">
                                                                    {/* airline */}
                                                                    <div className="flex items-center gap-3">
                                                                        <img src={row.logo} alt={row.airline} className="h-10 w-10 rounded-full object-cover" />
                                                                        <div>
                                                                            <div className="text-[14px] font-medium text-[#0A0C0F]">{row.airline}</div>
                                                                            <div className="text-[12px] text-[#3D495C]">{row.flight}</div>
                                                                        </div>
                                                                    </div>

                                                                    {/* passenger */}
                                                                    <div>
                                                                        <div className="text-[#3D495C] text-[12px]">Passenger</div>
                                                                        <div className="text-[#0A0C0F] text-[14px] font-medium">01 Adult</div>
                                                                    </div>

                                                                    {/* dynamic value (speed / selection) */}
                                                                    <div>
                                                                        <div className="text-[#3D495C] text-[12px]">{cfg.valueLabel}</div>
                                                                        <div className="text-[#0A0C0F] text-[14px] font-medium">{value}</div>
                                                                    </div>

                                                                    {/* cost */}
                                                                    <div>
                                                                        <div className="text-[#3D495C] text-[12px]">Upgrade cost</div>
                                                                        <div className="text-[#0A0C0F] text-[14px] font-bold">${row.cost.toFixed(2)}</div>
                                                                    </div>

                                                                    {/* switch: dynamic section key pass karo */}
                                                                    <div className="flex justify-end">
                                                                        <FormSwitch
                                                                            checked={row.checked}
                                                                            onChange={() => toggleCE(sectionKey, i)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}

                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Airport Services */}
                        <div className="px-3 pb-3 mt-3">
                            <div className="rounded-xl border border-[#E4E4E7] overflow-hidden">
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A7C0EC]">
                                            <svg width="26" height="25" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M25.6391 6.8525C25.4546 6.58913 25.2094 6.37413 24.9241 6.22572C24.6388 6.07732 24.322 5.99989 24.0004 6H14.0004V2H16.0004C16.2656 2 16.52 1.89464 16.7075 1.70711C16.895 1.51957 17.0004 1.26522 17.0004 1C17.0004 0.734784 16.895 0.48043 16.7075 0.292893C16.52 0.105357 16.2656 0 16.0004 0H10.0004C9.73518 0 9.48082 0.105357 9.29329 0.292893C9.10575 0.48043 9.00039 0.734784 9.00039 1C9.00039 1.26522 9.10575 1.51957 9.29329 1.70711C9.48082 1.89464 9.73518 2 10.0004 2H12.0004V6H2.00039C1.67928 6.00072 1.36306 6.07875 1.07847 6.2275C0.793879 6.37624 0.549289 6.59132 0.36538 6.85456C0.18147 7.11779 0.0636486 7.42144 0.0218769 7.73983C-0.0198948 8.05822 0.0156117 8.38198 0.125394 8.68375L3.39914 17.6838C3.53922 18.0688 3.79417 18.4015 4.12952 18.6369C4.46486 18.8723 4.86442 18.9991 5.27414 19H9.00039V27C9.00039 27.2652 9.10575 27.5196 9.29329 27.7071C9.48082 27.8946 9.73518 28 10.0004 28C10.2656 28 10.52 27.8946 10.7075 27.7071C10.895 27.5196 11.0004 27.2652 11.0004 27V19H15.0004V27C15.0004 27.2652 15.1058 27.5196 15.2933 27.7071C15.4808 27.8946 15.7352 28 16.0004 28C16.2656 28 16.52 27.8946 16.7075 27.7071C16.895 27.5196 17.0004 27.2652 17.0004 27V19H20.7279C21.1376 18.9991 21.5372 18.8723 21.8725 18.6369C22.2079 18.4015 22.4628 18.0688 22.6029 17.6838L25.8766 8.68375C25.9871 8.38189 26.0232 8.05785 25.9819 7.73907C25.9405 7.4203 25.823 7.11619 25.6391 6.8525ZM10.8354 17L9.19789 8H16.8029L15.1654 17H10.8354ZM2.00039 8H7.16539L8.80164 17H5.27289L2.00039 8ZM20.7279 17H17.1991L18.8354 8H24.0004L20.7279 17Z" fill="#1A3C7A" />
                                            </svg>


                                        </div>
                                        <div>
                                            <div className="text-[15px] font-medium text-[#0A0C0F]">Airport Services</div>
                                            <div className="text-[12px] text-[#3D495C]">
                                                Get lounge access, fast track security and priority boarding.
                                            </div>
                                        </div>
                                    </div>
                                    <CardChevron open={openAirport} onClick={() => setOpenAirport((v) => !v)} />
                                </button>

                                {openAirport && <div className="h-px bg-[#E4E4E7]" />}

                                {openAirport && (
                                    <div className="px-4 py-4">
                                        {airportSectionsOrder.map((sectionKey, secIndex) => {
                                            const cfg = airportConfig[sectionKey];

                                            return (
                                                <div key={sectionKey} className={secIndex === 0 ? "" : "mt-6"}>
                                                    <div className="text-[16px] text-[#0A0C0F]">{cfg.title}</div>

                                                    {airportState[sectionKey].map((row, i) => {
                                                        return (
                                                            <div key={`${sectionKey}-${i}`} className="mt-3">
                                                                <div className="mb-2 text-[15px] font-semibold text-[#0A0C0F]">
                                                                    {row.leg}
                                                                </div>

                                                                <div className="grid grid-cols-[minmax(220px,1.1fr)_auto_auto_1fr_auto] items-center gap-10">
                                                                    <div className="flex items-center gap-3">
                                                                        <img src={row.logo} alt={row.airline} className="h-10 w-10 rounded-full object-cover" />
                                                                        <div>
                                                                            <div className="text-[14px] font-medium text-[#0A0C0F]">{row.airline}</div>
                                                                            <div className="text-[12px] text-[#3D495C]">{row.flight}</div>
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <div className="text-[#3D495C] text-[12px]">Passenger</div>
                                                                        <div className="text-[#0A0C0F] text-[14px] font-medium">01 Adult</div>
                                                                    </div>

                                                                    <div>
                                                                        <div className="text-[#3D495C] text-[12px]">Upgrade cost</div>
                                                                        <div className="text-[#0A0C0F] text-[14px] font-bold">${row.cost.toFixed(2)}</div>
                                                                    </div>

                                                                    {/* switch: dynamic section key pass karo */}
                                                                    <div className="flex justify-end">
                                                                        <FormSwitch
                                                                            checked={row.checked}
                                                                            onChange={() => toggleAirport(sectionKey, i)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}

                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-3 pb-3 mt-3">
                            <div className="rounded-xl border border-[#E4E4E7] overflow-hidden">
                                {/* Header */}
                                <button
                                    type="button"
                                    onClick={() => setOpenTP(v => !v)}
                                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A7C0EC]">
                                            <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22 0H2C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2V9C0 15.59 3.19 19.5837 5.86625 21.7738C8.74875 24.1313 11.6163 24.9325 11.7413 24.965C11.9131 25.0118 12.0944 25.0118 12.2663 24.965C12.3913 24.9325 15.255 24.1313 18.1413 21.7738C20.81 19.5837 24 15.59 24 9V2C24 1.46957 23.7893 0.960859 23.4142 0.585786C23.0391 0.210714 22.5304 0 22 0ZM22 9C22 13.6337 20.2925 17.395 16.925 20.1775C15.4591 21.3846 13.7919 22.324 12 22.9525C10.2315 22.335 8.58494 21.4123 7.135 20.2262C3.7275 17.4387 2 13.6625 2 9V2H22V9Z" fill="#1A3C7A" />
                                            </svg>

                                        </div>
                                        <div>
                                            <div className="text-[15px] font-medium text-[#0A0C0F]">Travel protection</div>
                                            <div className="text-[12px] text-[#3D495C]">
                                                Get refund options for your tickets, seat and date change options.
                                            </div>
                                        </div>
                                    </div>
                                    <CardChevron open={openTP} onClick={() => setOpenTP(v => !v)} />
                                </button>

                                {openTP && <div className="h-px bg-[#E4E4E7]" />}

                                {openTP && (
                                    <div className="px-4 py-4">
                                        <div className="text-[16px] text-[#0A0C0F]">Refund options</div>

                                        <div className="mt-5">
                                            <div className="mb-2 text-[15px] font-semibold text-[#0A0C0F]">Departure flight</div>

                                            <div className="grid grid-cols-[minmax(220px,1.1fr)_auto_1fr_auto] items-center gap-10">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={tpState.departure.logo}
                                                        alt={tpState.departure.airline}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <div className="text-[14px] font-medium text-[#0A0C0F]">{tpState.departure.airline}</div>
                                                        <div className="text-[12px] text-[#3D495C]">{tpState.departure.flight}</div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="text-[12px] text-[#3D495C]">Passenger</div>
                                                    <div className="text-[14px] font-medium text-[#0A0C0F]">{tpState.departure.passenger}</div>
                                                </div>

                                                <div>
                                                    <div className="text-[12px] text-[#3D495C]">Get refund options</div>
                                                    <div className="text-[14px] font-bold text-[#0A0C0F]">${tpState.departure.cost}</div>
                                                </div>

                                                <div className="flex justify-end">
                                                    <FormSwitch
                                                        checked={tpState.departure.checked}
                                                        onChange={() =>
                                                            setTpState(prev => ({
                                                                ...prev,
                                                                departure: { ...prev.departure, checked: !prev.departure.checked },
                                                            }))
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-10">
                                            <div className="mb-6 text-[16px] font-semibold text-[#0A0C0F]">Return flight</div>
                                            <div className="text-center text-[12px] text-[#3D495C]">
                                                Your flight covers refunds in the price family that you have selected.
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-start justify-center gap-2 text-[12px] text-[#3D495C]">
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 0.875C7.39303 0.875 5.82214 1.35152 4.486 2.24431C3.14985 3.1371 2.10844 4.40605 1.49348 5.8907C0.87852 7.37535 0.717618 9.00901 1.03112 10.5851C1.34463 12.1612 2.11846 13.6089 3.25476 14.7452C4.39106 15.8815 5.8388 16.6554 7.4149 16.9689C8.99099 17.2824 10.6247 17.1215 12.1093 16.5065C13.594 15.8916 14.8629 14.8502 15.7557 13.514C16.6485 12.1779 17.125 10.607 17.125 9C17.1227 6.84581 16.266 4.78051 14.7427 3.25727C13.2195 1.73403 11.1542 0.877275 9 0.875ZM9 15.875C7.64026 15.875 6.31105 15.4718 5.18046 14.7164C4.04987 13.9609 3.16868 12.8872 2.64833 11.6309C2.12798 10.3747 1.99183 8.99237 2.2571 7.65875C2.52238 6.32513 3.17716 5.10013 4.13864 4.13864C5.10013 3.17716 6.32514 2.52237 7.65876 2.2571C8.99238 1.99183 10.3747 2.12798 11.631 2.64833C12.8872 3.16868 13.9609 4.04987 14.7164 5.18045C15.4718 6.31104 15.875 7.64025 15.875 9C15.8729 10.8227 15.1479 12.5702 13.8591 13.8591C12.5702 15.1479 10.8227 15.8729 9 15.875ZM10.25 12.75C10.25 12.9158 10.1842 13.0747 10.0669 13.1919C9.94974 13.3092 9.79076 13.375 9.625 13.375C9.29348 13.375 8.97554 13.2433 8.74112 13.0089C8.5067 12.7745 8.375 12.4565 8.375 12.125V9C8.20924 9 8.05027 8.93415 7.93306 8.81694C7.81585 8.69973 7.75 8.54076 7.75 8.375C7.75 8.20924 7.81585 8.05027 7.93306 7.93306C8.05027 7.81585 8.20924 7.75 8.375 7.75C8.70652 7.75 9.02447 7.8817 9.25889 8.11612C9.49331 8.35054 9.625 8.66848 9.625 9V12.125C9.79076 12.125 9.94974 12.1908 10.0669 12.3081C10.1842 12.4253 10.25 12.5842 10.25 12.75ZM7.75 5.5625C7.75 5.37708 7.80499 5.19582 7.908 5.04165C8.01101 4.88748 8.15743 4.76732 8.32874 4.69636C8.50004 4.62541 8.68854 4.60684 8.8704 4.64301C9.05226 4.67919 9.2193 4.76848 9.35042 4.89959C9.48153 5.0307 9.57082 5.19775 9.60699 5.3796C9.64316 5.56146 9.6246 5.74996 9.55364 5.92127C9.48268 6.09257 9.36252 6.23899 9.20835 6.342C9.05418 6.44502 8.87292 6.5 8.6875 6.5C8.43886 6.5 8.20041 6.40123 8.02459 6.22541C7.84878 6.0496 7.75 5.81114 7.75 5.5625Z" fill="#A7C0EC" />
                                            </svg>

                                            <span>
                                                Cancellations, Refunds and Seat updates can be done through ‘My Bookings’ page
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

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