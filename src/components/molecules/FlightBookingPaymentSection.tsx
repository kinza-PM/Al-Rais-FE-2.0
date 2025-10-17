import cabinIcon from "../../assets/svgs/cabin.svg";
import baggageIcon from "../../assets/svgs/baggage.svg";
import entertainmentIcon from "../../assets/svgs/entertainment.svg";
import mealIcon from "../../assets/svgs/meals.svg";
import portIcon from "../../assets/svgs/ports.svg";
import wifiIcon from "../../assets/svgs/wifi.svg";
// import applePay from "../../assets/svgs/ApplePay.svg";
// import googlePay from "../../assets/svgs/GooglePay.svg";
import shareIcon from "../../assets/svgs/share.svg";
import secureLockIcon from "../../assets/svgs/secure-lock.svg";
import visaIcon from "../../assets/svgs/visa.svg";
import masterCardIcon from "../../assets/svgs/mastercard.svg";
import arrownDownwardIcon from "../../assets/svgs/arrow-downwards.svg";
import EmirateLogo from "../../assets/images/emirates.png";
// import FlagUsa from "../../assets/images/Flag-usa.png";
import FlagUae from "../../assets/svgs/Flag-uae.svg";
import Tabby from "../../assets/images/tabby.png";
import Tamara from "../../assets/images/tamara.png";
import { useEffect, useState } from "react";
import FLightPriceBreakdown from "../atoms/FlightPriceBreakdown";
import CardCollapseToggle from "../common/CardCollapseToggle";
import Button from "../atoms/Button";
import FlightSummaryCard from "../atoms/FlightSummaryCard";
import TailwindCustomInput from "../common/TailwindCustomInput";
import { buildFlightSegmentFromTrip, formatMoney, getPriceCabinClassForFlightSummary } from "../../utils/helpers";
import { useFlightReservationBooking } from "../../hooks/useFlightBooking";
import toast from "react-hot-toast";
import { extractErrorFromAxiosApiError } from "../../utils/apiErrorHanlder";

type PaymentMethod = "card" | "apple" | "google"

type FlightBookingPaymentSectionProps = {
    trip: any;
    cities: Array<{ id: string; code: string; label: string; city: string; }>;
    reservation?: any;
    onReservationChange: (
        eOrPath:
            | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
            | string,
        maybeValue?: any
    ) => void;
}

function ChevronDown() {
    return (
        <img alt="arrow-icon" src={arrownDownwardIcon} className="pointer-events-none absolute right-3 top-4" />
    )
}

export default function FlightBookingPaymentSection({
    trip,
    cities,
    reservation,
    onReservationChange,
}: FlightBookingPaymentSectionProps) {
    const [payMethod, setPayMethod] = useState<PaymentMethod>("card");
    const [openAddress, setOpenAddress] = useState(true);
    const [openPrice, setOpenPrice] = useState(false);

    const { mutateAsync, isPending } = useFlightReservationBooking();

    const assets = { EmirateLogo, cabinIcon, baggageIcon, mealIcon, wifiIcon, portIcon, entertainmentIcon };
    const segments = buildFlightSegmentFromTrip(trip, assets);
    const address = reservation?.paymentDetails?.address ?? {};

    const firstPrice = getPriceCabinClassForFlightSummary(trip);

    const fare = trip?.raw?.fare ?? trip?.raw?.financials?.fare ?? null;
    const currency = fare?.currencyCode ?? fare?.currency ?? "USD";
    const total = fare?.totalFare ?? fare?.total ?? null;

    const priceFareFamily = {
        label: "Fare family",
        value: firstPrice?.label ?? firstPrice?._priceClasses?.[0] ?? "Fare family",
    };

    const handleReservationFlightBooking = async () => {
        console.log('reservation-----------', reservation);
        try {
            const response = await mutateAsync(reservation);
            if (response?.meta?.success && response?.meta?.statusMessage == "SUCCESS") {
                toast.success(response?.meta?.actionType);
                // if (typeof onNext === "function") {
                //     onNext();
                // }
            }
        } catch (error) {
            const err = extractErrorFromAxiosApiError(error);
            toast.error(err);
        }
    }

    useEffect(() => {
        if (total === null) return;
        const existing = reservation?.paymentDetails?.transactionAmount;
        if (existing !== total) {
            onReservationChange?.("paymentDetails.transactionAmount", total);
        }
    }, [total, reservation?.paymentDetails?.transactionAmount, onReservationChange]);

    return (
        <section className="mt-10 flex items-center justify-center px-4">
            <div className="w-full max-w-[520px]">
                <FlightSummaryCard
                    title="Flight details"
                    segments={segments}
                    fare={priceFareFamily}
                />

                <div className="mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* <div className="grid grid-cols-3 sm:grid-cols-3 gap-3"> */}
                        <Button
                            type="button"
                            onClick={() => setPayMethod("card")}
                            aria-pressed={payMethod === "card"}
                            className={[
                                "h-12 w-full rounded-xl border px-5 text-[14px] font-semibold flex items-center justify-center",
                                payMethod === "card"
                                    ? "bg-[rgba(167,192,236,0.3)] text-[#2351A3] border-[#2351A3]"
                                    : "bg-white text-[#0A0C0F] border-[#F9F7F6] hover:bg-[#F8FAFC]"
                            ].join(" ")}
                            overrideClasses
                        >
                            Pay with card
                        </Button>

                        {/* <Button
                            type="button"
                            onClick={() => setPayMethod("apple")}
                            aria-pressed={payMethod === "apple"}
                            className={[
                                "h-12 w-full rounded-xl border px-5 flex items-center justify-center",
                                payMethod === "apple"
                                    ? "bg-[rgba(167,192,236,0.3)] border-[#2351A3]"
                                    : "bg-white border-[#F9F7F6] hover:bg-[#F8FAFC]"
                            ].join(" ")}
                            overrideClasses
                        >
                            <img src={applePay} alt="Apple Pay" className="h-5 w-auto" />
                        </Button>

                        <Button
                            type="button"
                            onClick={() => setPayMethod("google")}
                            aria-pressed={payMethod === "google"}
                            className={[
                                "h-12 w-full rounded-xl border px-5 flex items-center justify-center",
                                payMethod === "google"
                                    ? "bg-[rgba(167,192,236,0.3)] border-[#2351A3]"
                                    : "bg-white border-[#F9F7F6] hover:bg-[#F8FAFC]"
                            ].join(" ")}
                            overrideClasses
                        >
                            <img src={googlePay} alt="Google Pay" className="h-5 w-auto" />
                        </Button> */}
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
                                    <TailwindCustomInput
                                        type="email"
                                        placeholder="Enter an email"
                                        className="h-12 w-full rounded-2xl border border-[#C2CAD6] px-4 text-[14px] text-[#3D495C] placeholder:text-[#C2CAD6] focus:outline-none"
                                        label="Email (Optional)"
                                        name="customerInfo.emailAddress"
                                        value={reservation?.customerInfo?.emailAddress ?? ""}
                                        onChange={onReservationChange}
                                    />

                                    <div>
                                        <label className="mb-1 block text-[12px] text-[#3D495C]">Card number</label>
                                        <div className="relative">
                                            <TailwindCustomInput
                                                type="email"
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
                                        <TailwindCustomInput
                                            type="email"
                                            placeholder="MM/YY"
                                            className="h-12 w-full rounded-2xl border border-[#C2CAD6] px-4 text-[14px] text-[#3D495C] placeholder:text-[#C2CAD6] focus:outline-none"
                                            label="Expiry date"
                                        />
                                        <TailwindCustomInput
                                            type="email"
                                            placeholder="000"
                                            className="h-12 w-full rounded-2xl border border-[#C2CAD6] px-4 text-[14px] text-[#3D495C] placeholder:text-[#C2CAD6] focus:outline-none"
                                            label="Security code"
                                        />
                                    </div>

                                    <TailwindCustomInput
                                        type="email"
                                        placeholder="Enter cardholder name"
                                        className="h-12 w-full rounded-2xl border border-[#C2CAD6] px-4 text-[14px] text-[#3D495C] placeholder:text-[#C2CAD6] focus:outline-none"
                                        label="Cardholder name"
                                    />

                                    <div className="rounded-xl border border-[#C2CAD6] overflow-hidden">
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setOpenAddress(v => !v)}
                                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpenAddress(v => !v)}
                                            className="flex h-12 w-full items-center justify-between bg-white px-3"
                                        >
                                            <span className="flex items-center gap-3 text-[15px] font-medium text-[#0A0C0F]">
                                                <img src={FlagUae} alt="usa-flag" className="h-6 w-6 rounded-full" />
                                                <span>United Arab Emirates</span>
                                            </span>

                                            <CardCollapseToggle open={openAddress} onClick={() => { }} className="pointer-events-none" />
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
                                                        <TailwindCustomInput
                                                            type="text"
                                                            placeholder="Address line 1"
                                                            className="h-11 w-full bg-transparent px-0 text-sm text-[#0A0C0F] placeholder:text-[#C2CAD6] focus:outline-none"
                                                            name="paymentDetails.address.street.0"
                                                            value={Array.isArray(address.street) ? address.street[0] ?? "" : ""}
                                                            onChange={onReservationChange}
                                                        />
                                                    </div>

                                                    <div className="relative">
                                                        <select
                                                            defaultValue=""
                                                            className="h-11 w-full appearance-none bg-transparent pr-6 text-sm text-[#0A0C0F] focus:outline-none px-3"
                                                            value={address.countryCode ?? ""}
                                                            name="paymentDetails.address.countryCode"
                                                            onChange={onReservationChange}
                                                        >
                                                            <option value="" disabled>Select a country</option>
                                                            <option value="UAE">United Arab Emirates</option>
                                                        </select>

                                                        <ChevronDown />
                                                    </div>


                                                    <div className="grid grid-cols-2">
                                                        <div className="px-3 relative">
                                                            <select
                                                                defaultValue=""
                                                                className="h-11 w-full appearance-none bg-transparent pr-6 text-sm text-[#0A0C0F] focus:outline-none px-3"
                                                                value={address.cityName ?? ""}
                                                                onChange={onReservationChange}
                                                                name="paymentDetails.address.cityName"
                                                            >
                                                                <option value="" disabled>Select a city</option>
                                                                {cities?.map((c) => (
                                                                    <option key={c.code} value={c.code}>
                                                                        {c.city}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            <ChevronDown />
                                                        </div>
                                                        <div className="border-l border-[#E4E4E7] px-3">
                                                            <TailwindCustomInput
                                                                type="text"
                                                                placeholder="Zip code"
                                                                className="h-11 w-full bg-transparent px-0 text-sm text-[#0A0C0F] placeholder:text-[#C2CAD6] focus:outline-none"
                                                                name="paymentDetails.address.postalCode"
                                                                value={address.postalCode ?? ""}
                                                                onChange={onReservationChange}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-1 [font-variant-numeric:tabular-nums]">
                                        {/* <div className="flex items-center justify-between text-[15px]">
                                            <span className="font-medium text-[#3D495C]">Subtotal</span>
                                            <span className="font-semibold text-[#0A0C0F] text-right">$852.45</span>
                                        </div> */}

                                        <div className="flex items-center justify-between">
                                            <span className="text-[15px] font-semibold text-[#3D495C]">Total</span>
                                            <span className="text-[22px] font-bold text-[#0A0C0F] text-right"> {total != null ? formatMoney(total, currency) : "—"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <FLightPriceBreakdown
                    open={openPrice}
                    onToggleOpen={() => setOpenPrice(v => !v)}
                    trip={trip.raw}
                />

                <div className="mt-16 px-5">
                    <Button
                        type="button"
                        className="h-11 w-full rounded-xl bg-[#2351A3] text-[#F2F2F3] text-[16px] font-semibold"
                        overrideClasses
                        onClick={() => handleReservationFlightBooking()}
                    >
                        {isPending ? 'Loading...' : 'Pay'}
                    </Button>

                    <div className="my-4 text-center text-[12px] text-[#3D495C]">OR</div>

                    <div>
                        <p className="text-[15px] font-medium text-[#0A0C0F]">Buy now, Pay later with:</p>
                        <div className="mt-3 flex items-center justify-center gap-4">
                            <Button type="button" className="rounded-xl focus:outline-none" overrideClasses>
                                <img src={Tabby} alt="Tabby" className="h-10 w-auto" />
                            </Button>
                            <Button type="button" className="rounded-xl focus:outline-none" overrideClasses>
                                <img src={Tamara} alt="Tamara" className="h-10 w-auto" />
                            </Button>
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