import Seat1 from '../../assets/images/travellers-seat-1.png';
import Seat2 from '../../assets/images/travellers-seat-2.png';
import EmiratesRectangular from '../../assets/images/emirates_rectangular.png';
import TravellersSeatPlaneSelection from './TravellersSeatPlaneSelection';
import Button from '../atoms/Button';

export default function TravellersSeatsSection() {

    return (
        <div className="mt-3 rounded-xl border border-[#E7ECF2] bg-white p-4 shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
            <style>
                {`.no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}
            </style>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
                {/* LEFT: Seat map (scrollable panel; plane centered full-size bg) */}
                {/* LEFT: Seat map (scrollable panel; plane centered) */}
                <div className="relative w-full flex">
                    <div className="mr-3 shrink-0">
                        <p className="text-[12px] text-[#3D3D3D] mb-2">
                            Scroll to see<br />available seats.
                        </p>
                        <svg width="16" height="18" viewBox="0 0 16 18" fill="none" className="mt-1">
                            <path d="M15.1476 10.8975L8.39763 17.6475C8.29216 17.7528 8.14919 17.812 8.00013 17.812C7.85107 17.812 7.7081 17.7528 7.60263 17.6475L0.852629 10.8975C0.753269 10.7909 0.699177 10.6498 0.701748 10.5041C0.704319 10.3584 0.763353 10.2193 0.866413 10.1163C0.969472 10.0132 1.10851 9.95419 1.25424 9.95162C1.39996 9.94905 1.541 10.0031 1.64763 10.1025L7.43763 15.8916V0.75C7.43763 0.600816 7.49689 0.457742 7.60238 0.352252C7.70787 0.246763 7.85094 0.1875 8.00013 0.1875C8.14931 0.1875 8.29239 0.246763 8.39788 0.352252C8.50337 0.457742 8.56263 0.600816 8.56263 0.75V15.8916L14.3526 10.1025C14.4593 10.0031 14.6003 9.94905 14.746 9.95162C14.8917 9.95419 15.0308 10.0132 15.1338 10.1163C15.2369 10.2193 15.2959 10.3584 15.2985 10.5041C15.3011 10.6498 15.247 10.7909 15.1476 10.8975Z" fill="#0563C1" />
                        </svg>
                    </div>

                    {/* vertical-only scroll, centered plane, no collision */}
                    <div className="relative flex-1 min-w-0 h-[640px] overflow-y-auto overflow-x-hidden no-scrollbar flex items-start justify-center py-4 px-2">
                        {/* fades so content feels within the card */}
                        <div className="pointer-events-none absolute inset-x-2 top-0 h-6 bg-gradient-to-b from-white to-transparent" />
                        <div className="pointer-events-none absolute inset-x-2 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />

                        {/* zoomed plane; stays centered */}
                        <div className="origin-top transform will-change-transform scale-[3.3] md:scale-[1.8] lg:scale-[1.9]">
                            <TravellersSeatPlaneSelection />
                        </div>
                    </div>
                </div>









                {/* RIGHT: Panels (pixel-tight) */}
                <div className="space-y-4">
                    <div className="rounded-[18px] bg-[#E8F0FF] p-5">
                        <p className="mb-4 text-[18px] font-bold text-[#3D3D3D]">Seating options</p>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="relative rounded-[16px] border border-[#E6EDF6] bg-white p-6 shadow-[0_8px_24px_rgba(16,24,40,0.06)]">
                                <img src={Seat1} alt="" className="pointer-events-none absolute right-6 top-6 h-[54px] w-[94px] object-contain" />
                                <h3 className="text-[18px] font-semibold text-[#3D3D3D]">Economy</h3>
                                <span className="mt-5 inline-block rounded-[8px] bg-[#0563C1] px-3 py-[6px] text-[12px] text-white">
                                    Selected
                                </span>
                                <p className="mt-6 max-w-[520px] text-[12px] text-[#3D3D3D]">
                                    Rest and recharge during your flight with extended leg room, personalized service, and a multi-course meal service
                                </p>
                                <div className="mt-3 h-[4px] w-12 rounded bg-[#0563C1]/70" />
                                <ul className="mt-5 space-y-3 text-[12px] text-[#3D3D3D]">
                                    <li className="flex items-start">
                                        <span className="mr-3 mt-[7px] inline-block h-2 w-2 rounded-full bg-[#0563C1]" />
                                        Built-in entertainment system
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-3 mt-[7px] inline-block h-2 w-2 rounded-full bg-[#0563C1]" />
                                        Complimentary snacks and drinks
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-3 mt-[7px] inline-block h-2 w-2 rounded-full bg-[#0563C1]" />
                                        One free carry-on and personal item
                                    </li>
                                </ul>
                            </div>

                            <div className="relative rounded-[16px] border border-[#E6EDF6] bg-white p-6 shadow-[0_8px_24px_rgba(16,24,40,0.06)]">
                                <img src={Seat2} alt="" className="pointer-events-none absolute right-6 top-6 h-[54px] w-[94px] object-contain" />
                                <h3 className="text-[18px] font-semibold text-[#3D3D3D]">Business</h3>
                                <p className="mt-12 max-w-[520px] text-[12px] text-[#3D3D3D]">
                                    Rest and recharge during your flight with extended leg room, personalized service, and a multi-course meal service
                                </p>
                                <div className="mt-3 h-[4px] w-12 rounded bg-[#3DCCB2]" />
                                <ul className="mt-5 space-y-3 text-[12px] text-[#3D3D3D]">
                                    {[
                                        "Extended leg room",
                                        "First two checked bags free",
                                        "Priority boarding",
                                        "Personalized service",
                                        "Enhanced food and drink service",
                                    ].map((t) => (
                                        <li key={t} className="flex items-start">
                                            <span className="mr-3 mt-[2px] inline-flex h-[18px] w-[18px] items-center justify-center rounded-[6px]">
                                                <svg width="17" height="14" viewBox="0 0 17 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M2 7L6.24264 11.2426L14.7279 2.75736" stroke="#5CD6C0" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>

                                            </span>
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[16px] bg-[#E8F0FF] p-4">
                        <div className="rounded-[14px] bg-white p-5 shadow-sm">
                            <div className="grid gap-6 md:grid-cols-[1fr_auto]">
                                <div>
                                    <p className="text-[16px] text-[rgba(0,0,0,0.4)]">Passenger</p>
                                    <p className="text-[24px] font-bold text-[rgba(0,0,0,1)]">Zeeshan Ali</p>
                                    <div className="mt-3 flex flex-wrap items-center gap-6 text-[12px]">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={EmiratesRectangular}
                                                alt="Emirates"
                                                className="h-5 object-contain"
                                            />
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-[13px] font-semibold text-[#000000]">EK 608</span>
                                                <span className="text-[11px] text-[rgba(0,0,0,0.4)]]">Emirates</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-[13px] font-semibold text-[#000000]">Economy</span>
                                            <span className="text-[11px] text-[rgba(0,0,0,0.4)]]">Airbus 777</span>
                                        </div>
                                    </div>
                                    <div className="mt-5">
                                        <p className="text-[16px] text-[rgba(0,0,0,0.4)]">Selected Seat</p>
                                        <p className="text-[32px] font-bold text-[#0563C1]">B9</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-4 text-[16px] text-[rgba(0,0,0,0.4)]">Legend</p>
                                    <ul className="space-y-5 text-[14px] font-semibold text-[#000000]">
                                        <li className="flex items-center gap-3">
                                            <span className="inline-block h-6 w-6 rounded-md bg-[#E9E8FC] ring-1 ring-[#E1DAFF]" />
                                            Reserved
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <span className="inline-block h-6 w-6 rounded-md bg-[#0563C1]" />
                                            Available
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <span className="grid h-6 w-6 place-items-center rounded-md bg-[#EB568C]">
                                                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1.72754 4.75781L5.4849 8.51517L12.9996 1.00045" stroke="#F6F6FE" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>

                                            </span>
                                            Selected
                                        </li>
                                    </ul>
                                </div>

                            </div>
                        </div>

                        <div className="mt-4 flex gap-4">
                            <Button type='button' className='w-[170px] rounded-[10px] border border-[#D7E4F4] bg-white py-2 text-[15px] font-semibold text-[#0563C1]' overrideClasses>
                                Cancel
                            </Button>
                            <Button type='button' className='flex-1 rounded-[10px] bg-[#0563C1] py-2 text-[15px] font-semibold text-white shadow-sm' overrideClasses>
                                Confirm Seat Selection
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}