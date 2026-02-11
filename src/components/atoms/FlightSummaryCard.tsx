import React, { useState } from "react";
import Button from "../atoms/Button"; // path adjust kar lena
import EmirateLogo from "../../assets/images/emirates.png";

type AmenityIcon = {
    src: string;
    alt: string;
    title?: string;
};

type Segment = {
    heading?: string;                // e.g. "Departure flight" / "Return flight"
    route: React.ReactNode;          // e.g. <>Dubai (DXB) <span className="mx-2">→</span> Mumbai (BOM)</>
    airlineLogo: string;
    airlineName: string;
    flightMeta: string;              // e.g. "EK 1234 – Economy class"
    amenities?: AmenityIcon[];
    dep: { time: string; date: string };
    arr: { time: string; date: string };
    durationLabel: string;           // e.g. "Duration: 03 hours 15 minutes"
    tag?: string;                    // e.g. "Direct"
};

type FareRow = {
    label?: string;                  // default: "Fare family"
    value: React.ReactNode;          // e.g. "Economy standard"
    changeText?: string;             // e.g. "Change"
    onChangeClick?: () => void;
};

type FlightSummaryCardProps = {
    title: string;                   // e.g. "Trip details" / "Flight details"
    headerActionText?: string;       // e.g. "View all"
    onHeaderActionClick?: () => void;
    segments: Segment[];
    fare?: FareRow;
    className?: string;
};

export default function FlightSummaryCard({
    title,
    headerActionText,
    onHeaderActionClick,
    segments,
    fare,
    className = "",
}: FlightSummaryCardProps) {
    const [failedLogos, setFailedLogos] = useState<Set<number>>(new Set());

    const handleImageError = (index: number) => {
        setFailedLogos(prev => new Set(prev).add(index));
    };

    return (
        <div className={`rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#efefef] shadow-sm ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b-[1.5px] border-[#C2CAD6] px-4 py-3">
                <h3 className="text-[15px] font-semibold text-[#0A0C0F]">{title}</h3>

                {headerActionText && (
                    <Button
                        type="button"
                        onClick={onHeaderActionClick}
                        className="text-[14px] font-medium text-[#5383DA] hover:underline"
                        overrideClasses
                    >
                        {headerActionText}
                    </Button>
                )}
            </div>

            {/* Segments */}
            {segments.map((seg, i) => (
                <React.Fragment key={i}>
                    <div className="px-5 py-3">
                        {seg.heading && (
                            <p className="mb-3 text-base font-semibold text-[#0A0C0F]">{seg.heading}</p>
                        )}

                        <div className="mb-4 text-center text-[14px] font-medium text-[#0A0C0F]">
                            {seg.route}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                                    <img
                                        src={failedLogos.has(i) || !seg.airlineLogo ? EmirateLogo : seg.airlineLogo}
                                        alt={seg.airlineName}
                                        className="h-full w-full object-cover"
                                        onError={() => handleImageError(i)}
                                    />
                                </div>

                                <div>
                                    <div className="text-[15px] font-semibold text-[#0A0C0F]">
                                        {seg.airlineName}
                                    </div>
                                    <div className="mt-[2px] text-[13px] text-[#3D495C]">
                                        {seg.flightMeta}
                                    </div>
                                </div>
                            </div>

                            {seg.amenities && seg.amenities.length > 0 && (
                                <div className="flex items-center gap-3">
                                    {seg.amenities.map((a, idx) => (
                                        <img key={idx} src={a.src} alt={a.alt} className="h-4 w-4" title={a.title} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                            <div className="text-left">
                                <div className="text-[14px] font-medium text-[#0A0C0F]">{seg.dep.time}</div>
                                <div className="text-[10px] text-[#3D495C]">{seg.dep.date}</div>
                            </div>

                            <div className="relative min-w-[200px]">
                                <div className="absolute left-[10px] right-[10px] top-[20px] h-[2px] bg-[#A7C0EC]" />
                                <span className="absolute left-0 top-[14px] h-[14px] w-[14px] rounded-full bg-[#2351A3]" />
                                <span className="absolute right-0 top-[14px] h-[14px] w-[14px] rounded-full bg-[#2351A3]" />
                                <div className="relative flex justify-center">
                                    <span className="inline-block px-3 py-1 text-[12px] text-[#3D495C] text-center">
                                        Duration: {seg.durationLabel}
                                    </span>
                                </div>
                                {seg.tag && (
                                    <div className="text-center text-[12px] text-[#3D495C]">{seg.tag}</div>
                                )}
                            </div>

                            <div className="text-right">
                                <div className="text-[14px] font-medium text-[#0A0C0F]">{seg.arr.time}</div>
                                <div className="text-[10px] text-[#3D495C]">{seg.arr.date}</div>
                            </div>
                        </div>
                    </div>

                    {/* divider between segments */}
                    {i < segments.length - 1 && <div className="border-t-[1.5px] border-[#C2CAD6]" />}
                </React.Fragment>
            ))}

            {/* Fare row */}
            {fare && (
                <>
                    <div className="border-t-[1.5px] border-[#C2CAD6]" />
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[#3D495C] text-[12px]">{fare.label ?? "Fare family"}</div>
                                <div className="font-medium text-[14px] text-[#0A0C0F]">{fare.value}</div>
                            </div>

                            {fare.changeText && (
                                <Button
                                    type="button"
                                    onClick={fare.onChangeClick}
                                    className="text-[#5383DA] hover:underline text-[14px]"
                                    overrideClasses
                                >
                                    {fare.changeText}
                                </Button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
