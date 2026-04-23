import React, { useState } from "react";
import Button from "./Button";
import EmirateLogo from "../../assets/images/emirates.png";

type AmenityIcon = {
    src: string;
    alt: string;
    title?: string;
};

type Segment = {
    heading?: string;
    route: React.ReactNode;
    airlineLogo: string;
    airlineName: string;
    flightMeta: string;
    amenities?: AmenityIcon[];
    dep: { time: string; date: string };
    arr: { time: string; date: string };
    durationLabel: string;
    tag?: string;
};

type FareRow = {
    label?: string;
    value: React.ReactNode;
    changeText?: string;
    onChangeClick?: () => void;
};

type FooterColumn = {
    label?: string;
    value: React.ReactNode;
};

type FlightSummaryCardProps = {
    title: string;
    /** Booking flow: gray card + classic fare row. Cancellation: white card, optional footer strip. */
    variant?: "default" | "cancellation";
    statusPill?: string;
    headerActionText?: string;
    onHeaderActionClick?: () => void;
    segments: Segment[];
    fare?: FareRow;
    footerPassengers?: FooterColumn;
    footerBookingRef?: FooterColumn;
    className?: string;
};

export default function FlightSummaryCard({
    title,
    variant = "default",
    statusPill,
    headerActionText,
    onHeaderActionClick,
    segments,
    fare,
    footerPassengers,
    footerBookingRef,
    className = "",
}: FlightSummaryCardProps) {
    const [failedLogos, setFailedLogos] = useState<Set<number>>(new Set());

    const handleImageError = (index: number) => {
        setFailedLogos((prev) => new Set(prev).add(index));
    };

    const isCancellation = variant === "cancellation";

    const showCancellationFooter =
        isCancellation &&
        (!!fare || !!footerPassengers || !!footerBookingRef);

    const shellClass = isCancellation
        ? "rounded-[16px] border border-[#E4E4E7] bg-white shadow-sm"
        : "rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#efefef] shadow-sm";

    const headerDividerClass = isCancellation
        ? "border-b border-[#E4E4E7]"
        : "border-b-[1.5px] border-[#C2CAD6]";

    const segmentDividerClass = isCancellation
        ? "border-t border-[#E4E4E7]"
        : "border-t-[1.5px] border-[#C2CAD6]";

    return (
        <div className={`${shellClass} ${className}`}>
            {/* Header */}
            <div
                className={`flex items-center justify-between gap-3 px-4 py-3 ${headerDividerClass}`}
            >
                <h3 className="text-[15px] font-semibold text-[#0A0C0F]">
                    {title}
                </h3>

                {isCancellation ? (
                    <div className="flex shrink-0 items-center gap-2">
                        {statusPill ? (
                            <span
                                className="inline-flex items-center rounded-full bg-[#85FFCA] px-3 py-1 text-[12px] font-medium text-[#00522E]"
                                role="status"
                            >
                                {statusPill}
                            </span>
                        ) : null}
                        {headerActionText ? (
                            <Button
                                type="button"
                                onClick={onHeaderActionClick}
                                className="text-[14px] font-medium text-[#5383DA] hover:underline"
                                overrideClasses
                            >
                                {headerActionText}
                            </Button>
                        ) : null}
                    </div>
                ) : (
                    headerActionText && (
                        <Button
                            type="button"
                            onClick={onHeaderActionClick}
                            className="text-[14px] font-medium text-[#5383DA] hover:underline"
                            overrideClasses
                        >
                            {headerActionText}
                        </Button>
                    )
                )}
            </div>

            {/* Segments */}
            {segments.map((seg, i) => (
                <React.Fragment key={i}>
                    <div className="px-5 py-3">
                        {seg.heading && (
                            <p className="mb-3 text-base font-semibold text-[#0A0C0F]">
                                {seg.heading}
                            </p>
                        )}

                        <div className="mb-4 text-center text-[14px] font-medium text-[#0A0C0F]">
                            {seg.route}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                                    <img
                                        src={
                                            failedLogos.has(i) || !seg.airlineLogo
                                                ? EmirateLogo
                                                : seg.airlineLogo
                                        }
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
                                        <img
                                            key={idx}
                                            src={a.src}
                                            alt={a.alt}
                                            className="h-4 w-4"
                                            title={a.title}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                            <div className="text-left">
                                <div className="text-[14px] font-medium text-[#0A0C0F]">
                                    {seg.dep.time}
                                </div>
                                <div className="text-[10px] text-[#3D495C]">
                                    {seg.dep.date}
                                </div>
                            </div>

                            <div className="relative min-w-[200px]">
                                <div className="absolute left-[10px] right-[10px] top-[20px] h-[2px] bg-[#A7C0EC]" />
                                <span className="absolute left-0 top-[14px] h-[14px] w-[14px] rounded-full bg-[#2351A3]" />
                                <span className="absolute right-0 top-[14px] h-[14px] w-[14px] rounded-full bg-[#2351A3]" />
                                <div className="relative flex justify-center">
                                    <span className="inline-block px-3 py-1 text-center text-[12px] text-[#3D495C]">
                                        Duration: {seg.durationLabel}
                                    </span>
                                </div>
                                {seg.tag && (
                                    <div className="text-center text-[12px] text-[#3D495C]">
                                        {seg.tag}
                                    </div>
                                )}
                            </div>

                            <div className="text-right">
                                <div className="text-[14px] font-medium text-[#0A0C0F]">
                                    {seg.arr.time}
                                </div>
                                <div className="text-[10px] text-[#3D495C]">
                                    {seg.arr.date}
                                </div>
                            </div>
                        </div>
                    </div>

                    {i < segments.length - 1 && (
                        <div className={segmentDividerClass} />
                    )}
                </React.Fragment>
            ))}

            {/* Default: single fare row (booking flow) */}
            {!isCancellation && fare && (
                <>
                    <div className="border-t-[1.5px] border-[#C2CAD6]" />
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[12px] text-[#3D495C]">
                                    {fare.label ?? "Fare family"}
                                </div>
                                <div className="text-[14px] font-medium text-[#0A0C0F]">
                                    {fare.value}
                                </div>
                            </div>

                            {fare.changeText && (
                                <Button
                                    type="button"
                                    onClick={fare.onChangeClick}
                                    className="text-[14px] text-[#5383DA] hover:underline"
                                    overrideClasses
                                >
                                    {fare.changeText}
                                </Button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Cancellation: footer strip (muted bg) + compact passenger / ref columns */}
            {showCancellationFooter && (
                <>
                    <div className={segmentDividerClass} />
                    <div className="rounded-b-[16px] px-4 py-3">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                            {fare ? (
                                <div className="min-w-0 flex-1">
                                    <div className="text-[12px] text-[#3D495C]">
                                        {fare.label ?? "Fare family"}
                                    </div>
                                    <div className="mt-1 text-[14px] font-medium text-[#0A0C0F]">
                                        {fare.value}
                                    </div>
                                    {fare.changeText ? (
                                        <Button
                                            type="button"
                                            onClick={fare.onChangeClick}
                                            className="mt-2 text-[14px] font-medium text-[#5383DA] hover:underline"
                                            overrideClasses
                                        >
                                            {fare.changeText}
                                        </Button>
                                    ) : null}
                                </div>
                            ) : null}

                            {(footerPassengers || footerBookingRef) && (
                                <div className="flex shrink-0 gap-4 sm:gap-5">
                                    {footerPassengers ? (
                                        <div className="w-[min(112px,40vw)] shrink-0 sm:w-[118px]">
                                            <div className="text-[12px] text-[#3D495C]">
                                                {footerPassengers.label ??
                                                    "Passengers"}
                                            </div>
                                            <div className="mt-1 text-[13px] font-medium leading-tight text-[#0A0C0F]">
                                                {footerPassengers.value}
                                            </div>
                                        </div>
                                    ) : null}
                                    {footerBookingRef ? (
                                        <div className="w-[min(124px,44vw)] min-w-0 shrink-0 sm:w-[130px]">
                                            <div className="text-[12px] text-[#3D495C]">
                                                {footerBookingRef.label ??
                                                    "Booking ref. number"}
                                            </div>
                                            <div className="mt-1 break-all text-[13px] font-medium leading-tight text-[#0A0C0F]">
                                                {footerBookingRef.value}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
