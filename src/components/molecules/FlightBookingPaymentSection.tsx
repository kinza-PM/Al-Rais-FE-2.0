import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import entertainmentIcon from "../../assets/svgs/entertainment.svg";
import mealIcon from "../../assets/svgs/meals.svg";
import portIcon from "../../assets/svgs/ports.svg";
import wifiIcon from "../../assets/svgs/wifi.svg";
import applePay from "../../assets/svgs/ApplePay.svg";
import googlePay from "../../assets/svgs/GooglePay.svg";
import shareIcon from "../../assets/svgs/share.svg";
import secureLockIcon from "../../assets/svgs/secure-lock.svg";
import visaIcon from "../../assets/svgs/visa.svg";
import masterCardIcon from "../../assets/svgs/mastercard.svg";
import arrownDownwardIcon from "../../assets/svgs/arrow-downwards.svg";
import arrownUpwardIcon from "../../assets/svgs/arrow-upwards.svg";
import EmirateLogo from "../../assets/images/emirates.png";
import FlagUsa from "../../assets/images/Flag-usa.png";
import Tabby from "../../assets/images/tabby.png";
import Tamara from "../../assets/images/tamara.png";
import { useState } from "react";
import FLightPriceBreakdown from "../atoms/FlightPriceBreakdown";

type PaymentMethod = "card" | "apple" | "google"

function ChevronDown() {
    return (
        <img alt="arrow-icon" src={arrownDownwardIcon} className="pointer-events-none absolute right-3 top-4" />
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
            <img alt="arrow-icon" src={arrownUpwardIcon} />
        ) : (
            <img alt="arrow-icon" src={arrownDownwardIcon} />
        )}
    </button>
);

export default function FlightBookingPaymentSection() {
    const [payMethod, setPayMethod] = useState<PaymentMethod>("card");
    const [openAddress, setOpenAddress] = useState(true);
    const [openPrice, setOpenPrice] = useState(false);

    return (
        <section className="mt-10 flex items-center justify-center px-4">
            <div className="w-full max-w-[520px]">
                <div className="rounded-xl border border-[#E4E4E7] bg-white">
                    <div className="flex items-center justify-between border-b border-[#E4E4E7] px-4 py-3">
                        <h3 className="text-[15px] font-medium text-[#0A0C0F]">Flight details</h3>
                        <button className="text-[15px] font-medium text-[#5383DA] hover:underline">View all</button>
                    </div>

                    <div className="px-5 py-3">
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

                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[#3D495C] text-[12px]">Fare family</div>
                                <div className="font-medium text-[14px] text-[#0A0C0F]">Economy standard</div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mt-6">
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setPayMethod("card")}
                            aria-pressed={payMethod === "card"}
                            className={[
                                "h-12 w-full rounded-xl border px-5 text-[14px] font-semibold flex items-center justify-center",
                                payMethod === "card"
                                    ? "bg-[rgba(167,192,236,0.3)] text-[#2351A3] border-[#2351A3]"
                                    : "bg-white text-[#0A0C0F] border-[#F9F7F6] hover:bg-[#F8FAFC]"
                            ].join(" ")}
                        >
                            Pay with card
                        </button>

                        <button
                            type="button"
                            onClick={() => setPayMethod("apple")}
                            aria-pressed={payMethod === "apple"}
                            className={[
                                "h-12 w-full rounded-xl border px-5 flex items-center justify-center",
                                payMethod === "apple"
                                    ? "bg-[rgba(167,192,236,0.3)] border-[#2351A3]"
                                    : "bg-white border-[#F9F7F6] hover:bg-[#F8FAFC]"
                            ].join(" ")}
                        >
                            <img src={applePay} alt="Apple Pay" className="h-5 w-auto" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setPayMethod("google")}
                            aria-pressed={payMethod === "google"}
                            className={[
                                "h-12 w-full rounded-xl border px-5 flex items-center justify-center",
                                payMethod === "google"
                                    ? "bg-[rgba(167,192,236,0.3)] border-[#2351A3]"
                                    : "bg-white border-[#F9F7F6] hover:bg-[#F8FAFC]"
                            ].join(" ")}
                        >
                            <img src={googlePay} alt="Google Pay" className="h-5 w-auto" />
                        </button>
                    </div>

                </div>

                {payMethod === 'card' && (
                    <div className="mt-6">
                        <div className="rounded-xl border border-[#E4E4E7] bg-white">
                            <div className="px-3 py-3">
                                <div>
                                    <h3 className="text-[15px] font-medium text-[#0A0C0F]">Payment details</h3>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[13px] text-[#3D495C]">
                                            <img alt="lock-icon" src={secureLockIcon} className="h-3.5 w-3.5" />
                                            <span>Secure payment link</span>
                                        </div>
                                        <img alt="share-icon" src={shareIcon} className="h-3 w-3" />
                                    </div>
                                </div>
                                <div className="mt-5 space-y-4">
                                    <div>
                                        <label className="mb-1 block text-[12px] text-[#3D495C]">Email (Optional)</label>
                                        <input
                                            type="email"
                                            placeholder="Enter an email"
                                            className="h-12 w-full rounded-2xl border border-[#C2CAD6] px-4 text-[14px] text-[#3D495C] placeholder:text-[#C2CAD6] focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-[12px] text-[#3D495C]">Card number</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="0000 0000 0000 0000"
                                                className="h-12 w-full rounded-2xl border border-[#C2CAD6] px-4 pr-20 text-[14px] text-[#3D495C] placeholder:text-[#C2CAD6] focus:outline-none"
                                            />
                                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center gap-3">
                                                <img alt="visa-icon" src={visaIcon} className="w-4.5 h-4.5" />
                                                <img alt="mastercard-icon" src={masterCardIcon} className="w-4.5 h-4.5" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-[12px] text-[#3D495C]">Expiry date</label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                className="h-12 w-full rounded-2xl border border-[#C2CAD6] px-4 text-[14px] text-[#3D495C] placeholder:text-[#C2CAD6] focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-[12px] text-[#3D495C]">Security code</label>
                                            <input
                                                type="text"
                                                placeholder="000"
                                                className="h-12 w-full rounded-2xl border border-[#C2CAD6] px-4 text-[14px] text-[#3D495C] placeholder:text-[#C2CAD6] focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-[12px] text-[#3D495C]">Cardholder name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter cardholder name"
                                            className="h-12 w-full rounded-2xl border border-[#C2CAD6] px-4 text-[14px] text-[#3D495C] placeholder:text-[#C2CAD6] focus:outline-none"
                                        />
                                    </div>

                                    <div className="rounded-xl border border-[#C2CAD6] overflow-hidden">
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setOpenAddress(v => !v)}
                                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpenAddress(v => !v)}
                                            className="flex h-12 w-full items-center justify-between bg-white px-3"
                                        >
                                            <span className="flex items-center gap-3 text-[15px] font-medium text-[#0A0C0F]">
                                                <img src={FlagUsa} alt="usa-flag" className="h-6 w-6 rounded-full" />
                                                <span>United States of America</span>
                                            </span>

                                            <CardChevron open={openAddress} onClick={() => { }} className="pointer-events-none" />
                                        </div>

                                        {openAddress && (<div className="border-t border-[#E4E4E7]" />)}

                                        <div
                                            className={[
                                                "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                                                openAddress ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                                            ].join(" ")}
                                        >
                                            <div className="overflow-hidden">
                                                <div className="divide-y divide-[#E4E4E7]">
                                                    <div className="px-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Address line 1"
                                                            className="h-11 w-full bg-transparent px-0 text-sm text-[#0A0C0F] placeholder:text-[#C2CAD6] focus:outline-none"
                                                        />
                                                    </div>

                                                    <div className="relative">
                                                        <select
                                                            defaultValue=""
                                                            className="h-11 w-full appearance-none bg-transparent pr-6 text-sm text-[#0A0C0F] focus:outline-none px-3"
                                                        >
                                                            <option value="" disabled>Select a state</option>
                                                            <option value="AL">Alabama</option>
                                                            <option value="AK">Alaska</option>
                                                            <option value="AZ">Arizona</option>
                                                        </select>

                                                        <ChevronDown />
                                                    </div>


                                                    <div className="grid grid-cols-2">
                                                        <div className="px-3">
                                                            <input
                                                                type="text"
                                                                placeholder="City"
                                                                className="h-11 w-full bg-transparent px-0 text-sm text-[#0A0C0F] placeholder:text-[#C2CAD6] focus:outline-none"
                                                            />
                                                        </div>
                                                        <div className="border-l border-[#E4E4E7] px-3">
                                                            <input
                                                                type="text"
                                                                placeholder="Zip code"
                                                                className="h-11 w-full bg-transparent px-0 text-sm text-[#0A0C0F] placeholder:text-[#C2CAD6] focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-1 [font-variant-numeric:tabular-nums]">
                                        <div className="flex items-center justify-between text-[15px]">
                                            <span className="font-medium text-[#3D495C]">Subtotal</span>
                                            <span className="font-semibold text-[#0A0C0F] text-right">$852.45</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-[15px] font-semibold text-[#3D495C]">Total</span>
                                            <span className="text-[22px] font-bold text-[#0A0C0F] text-right">$852.45</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <FLightPriceBreakdown
                    CardChevron={CardChevron}
                    open={openPrice}
                    onToggleOpen={() => setOpenPrice(v => !v)}
                />

                <div className="mt-16 px-5">
                    <button
                        type="button"
                        className="h-11 w-full rounded-xl bg-[#2351A3] text-[#F2F2F3] text-[16px] font-semibold"
                    >
                        Pay
                    </button>

                    <div className="my-4 text-center text-[12px] text-[#3D495C]">OR</div>

                    <div>
                        <p className="text-[15px] font-medium text-[#0A0C0F]">Buy now, Pay later with:</p>
                        <div className="mt-3 flex items-center justify-center gap-4">
                            <button type="button" className="rounded-xl focus:outline-none">
                                <img src={Tabby} alt="Tabby" className="h-10 w-auto" />
                            </button>
                            <button type="button" className="rounded-xl focus:outline-none">
                                <img src={Tamara} alt="Tamara" className="h-10 w-auto" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 text-center text-[12px] text-[#3D495C]">
                        Secure payments by Al Rais • Terms • Privacy
                    </div>
                </div>


            </div>

        </section>
    );
}