import React, { useState, useCallback } from "react";
import PenidaIsland from "../../assets/images/penida_island.png";
import MerlionPark from "../../assets/images/merlion_park.png";
import KoSamui from "../../assets/images/ko_samui.png";
import Switzerland from "../../assets/images/switzerland.png";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

type Destination = {
    id: string;
    title: string;
    subtitle: string;
    image: string;
};

const DESTINATIONS: Destination[] = [
    {
        id: "1",
        title: "Penida island",
        subtitle: "Bali, Indonesia",
        image: PenidaIsland,
    },
    {
        id: "2",
        title: "Merlion Park",
        subtitle: "One Fullerton, Singapore",
        image: MerlionPark,
    },
    {
        id: "3",
        title: "Ko Samui",
        subtitle: "Ko Samui, Thailand",
        image: KoSamui,
    },
    {
        id: "4",
        title: "Switzerland",
        subtitle: "Interlaken, Switzerland",
        image: Switzerland,
    },
];

const CARD_WIDTH = 477;
const CARD_HEIGHT = 520;
const CARD_GAP = 28;

function DestinationCard({ d }: { d: Destination }) {
    return (
        <div
            className="flex flex-col bg-white rounded-[15px] shadow-[0_1px_4px_rgba(15,23,42,0.12)] border border-[#E4E4E7] overflow-hidden w-full max-w-[477px] mx-auto"
            style={{
                aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}`,
                maxHeight: CARD_HEIGHT,
                borderBottomLeftRadius: 15,
                borderBottomRightRadius: 15,
            }}
        >
            <img
                src={d.image}
                alt={d.title}
                className="w-full object-cover flex-1 min-h-0"
                style={{
                    height: "calc(100% - 100px)",
                    borderBottomLeftRadius: 15,
                    borderBottomRightRadius: 15,
                }}
            />
            <div className="flex items-center justify-between gap-4 px-3 sm:px-4 py-4 h-[100px] shrink-0">
                <div className="flex flex-col justify-center gap-0.5 min-w-0 flex-1 text-left">
                    <h3 className="text-[16px] font-semibold text-[#0A0C0F] truncate leading-tight">
                        {d.title}
                    </h3>
                    <p className="text-[13px] text-[#3D495C] truncate leading-tight">{d.subtitle}</p>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center justify-center text-[12px] font-medium text-white transition-colors shrink-0 hover:opacity-90 active:opacity-95"
                    style={{
                        width: 87,
                        height: 39,
                        borderRadius: 8,
                        padding: "10px 20px",
                        backgroundColor: "#2351A3",
                    }}
                >
                    Explore
                </button>
            </div>
        </div>
    );
}



type SplideInstance = { go: (dir: string) => void } | null;

const PopularDestinationsFlexRow: React.FC = () => {
    const [splide, setSplide] = useState<SplideInstance>(null);
    const goPrev = useCallback(() => splide?.go("<"), [splide]);
    const goNext = useCallback(() => splide?.go(">"), [splide]);

    return (
        <div className="mx-auto max-w-[1464px] px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-16 pb-10">
            {/* Title aligned with card start */}
            <div className="ml-[68px] sm:ml-[64px] lg:ml-[72px]">
                <p className="text-sm text-[rgba(61,73,92,1)]">Popular destinations</p>
                <h2 className="mt-3 text-3xl sm:text-5xl font-medium text-[rgba(10,12,15,1)]">
                    Find your next adventure
                </h2>
            </div>

            {/* Outer wrapper: arrows outside the slider track (title aligns with track start) */}
            <div className="mt-6 flex items-center gap-3 sm:gap-4 lg:gap-6 w-full">
                <button
                    type="button"
                    aria-label="Previous destinations"
                    onClick={goPrev}
                    className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#0A0C0F] hover:border-[#D4D4D8] transition-colors flex items-center justify-center shadow-sm"
                >
                    <span className="text-xl sm:text-2xl font-light leading-none">‹</span>
                </button>

                <div className="flex-1 min-w-0 overflow-hidden">
                    <Splide
                        aria-label="Popular destinations"
                        options={{
                            type: "loop",
                            perPage: 3,
                            focus: "center",
                            gap: `${CARD_GAP}px`,
                            pagination: false,
                            arrows: false,
                            breakpoints: {
                                1280: {
                                    perPage: 2,
                                    focus: "center",
                                    gap: `${CARD_GAP}px`,
                                },
                                768: {
                                    perPage: 1,
                                    focus: "center",
                                    gap: `${CARD_GAP}px`,
                                },
                                640: {
                                    perPage: 1,
                                    focus: 0,
                                    gap: "16px",
                                },
                            },
                        }}
                        onMounted={(instance: SplideInstance) => setSplide(instance)}
                    >
                        {DESTINATIONS.map((d) => (
                            <SplideSlide key={d.id}>
                                <DestinationCard d={d} />
                            </SplideSlide>
                        ))}
                    </Splide>
                </div>

                <button
                    type="button"
                    aria-label="Next destinations"
                    onClick={goNext}
                    className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#0A0C0F] hover:border-[#D4D4D8] transition-colors flex items-center justify-center shadow-sm"
                >
                    <span className="text-xl sm:text-2xl font-light leading-none">›</span>
                </button>
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    type="button"
                    className="rounded-lg px-6 py-2 text-white bg-[rgba(35,81,163,1)] hover:bg-[rgba(35,81,163,0.92)] active:bg-[rgba(35,81,163,0.88)] shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-[rgba(35,81,163,0.5)]"
                >
                    Book a flight
                </button>
            </div>
        </div>
    );
};

export default PopularDestinationsFlexRow;
