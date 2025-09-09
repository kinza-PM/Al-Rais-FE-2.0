import { useState } from "react";
import { flightBookingDrinks, flightBookingMeals } from "../../utils/mockData";
import CollapsibleCard from "./CollapsibleCard";
import MealQuantityStepper from "./MealQuantityStepper";


type FlightBookingMealSectionProps = {
    open: boolean;
    onToggleOpen: () => void
};

export default function FlightBookingMealsSection({
    open,
    onToggleOpen,
}: FlightBookingMealSectionProps) {
    const passengers = ["Passenger 01", "Passenger 02"];
    const [activePax, setActivePax] = useState(0);

    const [picks, setPicks] = useState(
        passengers.map(() => ({ meals: {} as Record<string, number>, drinks: {} as Record<string, number> }))
    );

    const isChecked = (cat: "meals" | "drinks", item: string) =>
        (picks[activePax][cat] as Record<string, number>)[item] > 0;

    const toggleItem = (cat: "meals" | "drinks", item: string) => {
        setPicks(prev => {
            const next = [...prev];
            const bag = { ...next[activePax][cat] } as Record<string, number>;
            if (bag[item]) delete bag[item];
            else bag[item] = 1;
            next[activePax] = { ...next[activePax], [cat]: bag };
            return next;
        });
    };

    const changeQty = (cat: "meals" | "drinks", item: string, delta: 1 | -1) => {
        setPicks(prev => {
            const next = [...prev];
            const bag = { ...next[activePax][cat] } as Record<string, number>;
            const cur = bag[item] || 0;
            const v = cur + delta;
            if (v <= 0) delete bag[item];
            else bag[item] = v;
            next[activePax] = { ...next[activePax], [cat]: bag };
            return next;
        });
    };

    const RoundCheck = ({ checked }: { checked: boolean }) => (
        <span
            className={`relative inline-flex h-[18px] w-[18px] items-center justify-center rounded-lg border ${checked ? "bg-[#2351A3] border-[#2351A3]" : "border-[#A7C0EC] bg-white"
                }`}
        >
            {checked && (
                <svg width="10" height="8" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.354 0.853784L4.35403 8.85378C4.30759 8.90027 4.25245 8.93715 4.19175 8.96231C4.13105 8.98748 4.06599 9.00043 4.00028 9.00043C3.93457 9.00043 3.86951 8.98748 3.80881 8.96231C3.74811 8.93715 3.69296 8.90027 3.64653 8.85378L0.146528 5.35378C0.0527077 5.25996 0 5.13272 0 5.00003C0 4.86735 0.0527077 4.7401 0.146528 4.64628C0.240348 4.55246 0.367596 4.49976 0.500278 4.49976C0.63296 4.49976 0.760208 4.55246 0.854028 4.64628L4.00028 7.79316L11.6465 0.146284C11.7403 0.0524633 11.8676 -0.000244142 12.0003 -0.000244141C12.133 -0.00024414 12.2602 0.0524633 12.354 0.146284C12.4478 0.240104 12.5006 0.367352 12.5006 0.500034C12.5006 0.632716 12.4478 0.759964 12.354 0.853784Z" fill="white" />
                </svg>

            )}
        </span>
    );

    return (
        <div className="px-3 pb-3 mt-3">
            <CollapsibleCard
                open={open}
                onToggle={onToggleOpen}
                icon={
                    <svg width="26" height="25" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25 9.99992H23.9538C23.7025 7.26851 22.4398 4.72952 20.4134 2.88094C18.3869 1.03236 15.7429 0.00756836 13 0.00756836C10.2571 0.00756836 7.61308 1.03236 5.58664 2.88094C3.5602 4.72952 2.29752 7.26851 2.04625 9.99992H1C0.734784 9.99992 0.48043 10.1053 0.292893 10.2928C0.105357 10.4803 0 10.7347 0 10.9999C0.00439376 13.3781 0.658866 15.7098 1.89264 17.7428C3.12641 19.7759 4.89253 21.433 7 22.5349V22.9999C7 23.5304 7.21071 24.0391 7.58579 24.4141C7.96086 24.7892 8.46957 24.9999 9 24.9999H17C17.5304 24.9999 18.0391 24.7892 18.4142 24.4141C18.7893 24.0391 19 23.5304 19 22.9999V22.5349C21.1075 21.433 22.8736 19.7759 24.1074 17.7428C25.3411 15.7098 25.9956 13.3781 26 10.9999C26 10.7347 25.8946 10.4803 25.7071 10.2928C25.5196 10.1053 25.2652 9.99992 25 9.99992ZM21.9425 9.99992H15.515C16.7274 8.18102 18.5616 6.86681 20.6737 6.30367C21.3643 7.42698 21.7976 8.68928 21.9425 9.99992ZM18.685 4.02867C18.9142 4.21617 19.1338 4.41408 19.3438 4.62242C16.6817 5.55886 14.4819 7.48342 13.2 9.99742H9.5125C10.1375 8.24545 11.2882 6.72917 12.8073 5.65572C14.3264 4.58227 16.1399 4.004 18 3.99992C18.2288 3.99992 18.4575 4.01117 18.685 4.02867ZM13 1.99992C13.8025 2.00045 14.6012 2.10849 15.375 2.32117C13.4905 2.78863 11.7626 3.74459 10.3653 5.09269C8.96809 6.44079 7.95088 8.1334 7.41625 9.99992H4.0575C4.30556 7.80099 5.35415 5.77025 7.00338 4.29484C8.65262 2.81944 10.7871 2.00255 13 1.99992ZM17.5825 20.9999C17.4081 21.0801 17.2604 21.2087 17.1571 21.3705C17.0538 21.5323 16.9993 21.7205 17 21.9124V22.9999H9V21.9124C9.00073 21.7205 8.9462 21.5323 8.84291 21.3705C8.73962 21.2087 8.59194 21.0801 8.4175 20.9999C6.6589 20.1907 5.1441 18.9331 4.02513 17.3534C2.90617 15.7737 2.22242 13.9274 2.0425 11.9999H23.9538C23.7742 13.927 23.091 15.773 21.9727 17.3527C20.8544 18.9323 19.3404 20.1902 17.5825 20.9999Z" fill="#1A3C7A" />
                    </svg>
                }
                title="Meals & Drinks"
                subtitle="Choose from a selection of hot meals and cold drinks served during your flight."
            >
                {/* Passenger switcher */}
                <div className="mb-5 flex justify-center">
                    <div className="inline-flex items-center gap-1 rounded-xl border border-[#C2CAD6] bg-white p-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
                        {passengers.map((p, i) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setActivePax(i)}
                                className={`px-4 py-1.5 text-[14px] font-medium rounded-xl transition ${activePax === i ? "bg-[#2351A3] text-white shadow-sm" : "text-[#3D495C] hover:bg-[#F2F6FF]"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lists */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Meals */}
                    <div>
                        <div className="mb-3 text-[16px] font-semibold text-[#0A0C0F]">Meals</div>
                        <ul>
                            {flightBookingMeals.map(m => {
                                const checked = isChecked("meals", m.name);
                                const qty = (picks[activePax].meals as Record<string, number>)[m.name] || 0;
                                return (
                                    <li key={m.name} className="flex items-center justify-between py-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleItem("meals", m.name)}
                                            className="group flex items-start gap-3"
                                        >
                                            <RoundCheck checked={checked} />
                                            <div className="text-left">
                                                <div className="text-[14px] text-[#0A0C0F] font-medium">{m.name}</div>
                                                <div className="text-[12px] text-[#3D495C]">${m.price.toFixed(2)}</div>
                                            </div>
                                        </button>

                                        <MealQuantityStepper
                                            qty={qty}
                                            onInc={() => changeQty("meals", m.name, 1)}
                                            onDec={() => changeQty("meals", m.name, -1)}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Drinks */}
                    <div>
                        <div className="mb-3 text-[16px] font-semibold text-[#0A0C0F]">Drinks</div>
                        <ul>
                            {flightBookingDrinks.map(d => {
                                const checked = isChecked("drinks", d.name);
                                const qty = (picks[activePax].drinks as Record<string, number>)[d.name] || 0;
                                return (
                                    <li key={d.name} className="flex items-center justify-between py-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleItem("drinks", d.name)}
                                            className="group flex items-start gap-3"
                                        >
                                            <RoundCheck checked={checked} />
                                            <div className="text-left">
                                                <div className="text-[14px] text-[#0A0C0F] font-medium">{d.name}</div>
                                                <div className="text-[12px] text-[#3D495C]">${d.price.toFixed(2)}</div>
                                            </div>
                                        </button>

                                        <MealQuantityStepper
                                            qty={qty}
                                            onInc={() => changeQty("drinks", d.name, 1)}
                                            onDec={() => changeQty("drinks", d.name, -1)}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </CollapsibleCard>
        </div>
    );
}