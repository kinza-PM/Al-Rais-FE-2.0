import { useEffect, useMemo, useState } from "react";
import Button from "../atoms/Button";

export type BookingStatus = "Confirmed" | "Pending" | "Expired";
export type TripMode = "Flights" | "Hotels";

export type Booking = {
    id: string;
    type: "flight" | "hotel";
    airline?: {
        name: string;
        code?: string;
        flightNo?: string;
        logoUrl?: string;
        cabin?: string;
    };
    from: { city: string; code: string; time: string; dateLabel: string };
    to: { city: string; code: string; time: string; dateLabel: string };
    durationLabel?: string;
    isDirect?: boolean;
    passengersLabel: string;
    bookingRef?: string;
    status: BookingStatus;
    countdownHours?: string;
    countdownMins?: string;
    countdownSecs?: string;
};

function StatusPill({ status }: { status: BookingStatus }) {
    const cfg =
        status === "Confirmed"
            ? { bg: "bg-[#85FFCA]", text: "text-[#00522E]" }
            : status === "Pending"
                ? { bg: "bg-[#FFB8C4]", text: "text-[#EA0029]" }
                : { bg: "bg-[#E4E4E7]", text: "text-[#3D495C]" };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-[12px] ${cfg.bg} ${cfg.text}`}>
            {status === "Pending" ? "Pending payment" : status}
        </span>
    );
}

function FlightTimeline({
    durationLabel,
    direct,
}: { durationLabel?: string; direct?: boolean }) {
    return (
        <div className="flex flex-col items-center mb-2">
            {durationLabel && (
                <span className="px-2.5 py-0.5 text-[11px] text-[#3D495C]">
                    Duration: {durationLabel}
                </span>
            )}

            <div className="relative h-[1px] w-[440px] max-w-[72vw] rounded-full bg-[#A7C0EC]">
                <span className="absolute -top-[5px] left-0 h-2.5 w-2.5 rounded-full bg-[#2351A3]" />
                <span className="absolute -top-[5px] right-0 h-2.5 w-2.5 rounded-full bg-[#2351A3]" />
            </div>

            {direct && (
                <span className="text-[11px] text-[#3D495C]">Direct</span>
            )}
        </div>
    );
}

function CardDivider() {
    return (
        <div className="-mx-5 h-px bg-[#E4E4E7]" />
    )
}

function BookingCard({ booking }: { booking: Booking }) {
    const status = booking.status;
    const isExpired = status === "Expired";

    return (
        <div className={[
            "relative rounded-2xl border border-[#E4E4E7] bg-white px-5 pb-4 pt-4 shadow-sm transition",
            isExpired ? "opacity-50 [filter:grayscale(100%)]" : "",
        ].join(" ")}>
            <div className="absolute right-4 top-2">
                <StatusPill status={status} />
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-8">
                <div className="text-end mt-4">
                    <div className="text-[15px] font-medium text-[#0A0C0F]">{booking.from.time}</div>
                    <div className="text-[12px] text-[#3D495C]">{booking.from.dateLabel}</div>
                </div>

                <div className="text-center">
                    <div className="text-[15px] font-medium text-[#0A0C0F]">
                        {booking.from.city} ({booking.from.code}) <span className="mx-2">→</span> {booking.to.city} ({booking.to.code})
                    </div>

                    <div className="mt-1">
                        <FlightTimeline
                            durationLabel={booking.durationLabel}
                            direct={booking.isDirect}
                        />
                    </div>
                </div>

                <div className="text-start mt-4">
                    <div className="text-[15px] font-medium text-[#0A0C0F]">{booking.to.time}</div>
                    <div className="text-[13px] text-[#3D495C]">{booking.to.dateLabel}</div>
                </div>
            </div>

            <CardDivider />

            <div className="mt-2 mb-2 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    {booking.airline?.logoUrl ? (
                        <img src={booking.airline.logoUrl} alt="airline" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-zinc-200" />
                    )}
                    <div>
                        <div className="text-[15px] font-medium text-[#0A0C0F]">
                            {booking.airline?.name ?? "Airline"}
                        </div>
                        <div className="text-[12px] text-[#3D495C]">
                            {booking.airline?.code} {booking.airline?.flightNo}{" "}
                            {booking.airline?.cabin ? ` - ${booking.airline.cabin}` : null}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-20">
                    <div className="text-[#3D495C] text-[13px]">Passengers</div>
                    <div className="text-[#3D495C] text-[13px]">Booking ref. number</div>
                    <div className="text-[#0A0C0F] font-medium text-[15px]">{booking.passengersLabel}</div>
                    <div className="text-[#0A0C0F] font-medium text-[15px]">{booking.bookingRef}</div>

                </div>
            </div>

            <CardDivider />

            {status === "Pending" && (
                <div className="mt-4 mb-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1 text-[14px] font-medium text-[#3D495C]">
                        <span className="rounded-lg bg-[#FFB8C4] px-2 py-1 font-mono text-[#EA0029]">
                            {booking.countdownHours ?? "00"}
                        </span> :
                        <span className="rounded-lg bg-[#FFB8C4] px-2 py-1 font-mono text-[#EA0029]">
                            {booking.countdownMins ?? "35"}
                        </span> :
                        <span className="rounded-lg bg-[#FFB8C4] px-2 py-1 font-mono text-[#EA0029]">
                            {booking.countdownSecs ?? "49"}
                        </span>
                        <span>Until your booking expires</span>
                    </div>
                    <Button type="button" className="rounded-lg bg-[#2351A3] px-8 py-2 text-[#F2F2F3] text-[15px] font-semibold" overrideClasses>
                        Pay now
                    </Button>
                </div>
            )}


            {status === "Expired" && (
                <div className="mt-4 mb-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="text-[14px] font-medium text-[#3D495C]">
                        <span>This booking has expired!</span>
                    </div>
                    <Button type="button" className="rounded-lg bg-[#2351A3] px-8 py-2 text-[#F2F2F3] text-[15px] font-semibold" overrideClasses>
                        Pay now
                    </Button>
                </div>
            )}

            <CardDivider />

            <div className="mt-6 flex items-center text-[15px] font-medium">
                <div className="flex flex-wrap items-center divide-x divide-[#E4E4E7]">
                    <div className="pr-4">
                        <Button type="button" className="text-[#5383DA] hover:underline" overrideClasses>
                            View details
                        </Button>
                    </div>
                    {status === "Confirmed" && (
                        <>
                            <div className="px-4">
                                <Button type="button" className="text-[#5383DA] hover:underline" overrideClasses>
                                    Download e-ticket
                                </Button>
                            </div>
                            <div className="px-4">
                                <Button type="button" className="text-[#5383DA] hover:underline" overrideClasses>
                                    Request changes
                                </Button>
                            </div>
                            <div className="pl-4">
                                <Button type="button" className="text-[#FF5270] hover:underline" overrideClasses>
                                    Cancel booking
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                <div className="ml-auto flex items-center pl-4">
                    <Button type="button" className="text-[#5383DA] hover:underline" overrideClasses>
                        Share
                    </Button>
                </div>
            </div>

        </div>
    );
}

export default function UserBookingsListing({
    bookings,
    filterStatus,
    mode,
}: {
    bookings: Booking[];
    filterStatus: "All" | BookingStatus;
    mode: TripMode;
}) {
    const list = useMemo(() => {
        const modeFiltered = bookings.filter((b) => (mode === "Flights" ? b.type === "flight" : b.type === "hotel"));
        if (filterStatus === "All") return modeFiltered;
        return modeFiltered.filter((b) => b.status === filterStatus);
    }, [bookings, filterStatus, mode]);

    if (!list.length) {
        return (
            <div className="mt-6 rounded-xl border border-dashed border-[#E4E4E7] bg-white p-8 text-center text-[14px] text-[#3D495C]">
                No bookings found.
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-6">
            {list.map((b) => (
                <BookingCard key={b.id} booking={b} />
            ))}
        </div>
    );
}
