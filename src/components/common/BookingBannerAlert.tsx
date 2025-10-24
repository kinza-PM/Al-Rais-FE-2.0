import React, { useEffect, useRef, useState } from "react";
import { warningToast } from "../../utils/helpers";

interface BookingBannerAlertProps {
    message: string;
    time: string; // "HH:MM:SS" or "MM:SS"
    bgColor?: string;
    textColor?: string;
    onExpire?: () => void;
}

const parseTimeToSeconds = (timeStr: string) => {
    const parts = timeStr.split(":").map((p) => Number(p.trim()) || 0);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    return 0;
};

const formatTwo = (n: number) => String(n).padStart(2, "0");

const BookingBannerAlert: React.FC<BookingBannerAlertProps> = ({
    message,
    time,
    bgColor = "bg-[#EA0029]",
    textColor = "text-white",
    onExpire,
}) => {
    const initialSeconds = parseTimeToSeconds(time);
    const [remaining, setRemaining] = useState<number>(initialSeconds);

    const oneMinuteLoggedRef = useRef(false);
    const expiredRef = useRef(false);

    useEffect(() => {
        setRemaining(parseTimeToSeconds(time));
        oneMinuteLoggedRef.current = false;
        expiredRef.current = false;
    }, [time]);

    useEffect(() => {
        if (remaining === 0) return;

        const id = setInterval(() => {
            setRemaining((prev) => {
                const next = Math.max(prev - 1, 0);
                return next;
            });
        }, 1000);

        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (remaining === 120 && !oneMinuteLoggedRef.current) {
            warningToast('Two minutes remaining, confirm your booking now to avoid being redirected.');
            oneMinuteLoggedRef.current = true;
        }

        if (remaining === 0 && !expiredRef.current) {
            expiredRef.current = true;
            if (typeof onExpire === "function") onExpire();
        }
    }, [remaining]);

    const hrs = Math.floor(remaining / 3600);
    const mins = Math.floor((remaining % 3600) / 60);
    const secs = remaining % 60;

    const segments = hrs > 0 ? [hrs, mins, secs] : [mins, secs]; // if no hours, show mm:ss

    return (
        <div className={`inset-x-0 z-50 ${bgColor}`}>
            <div
                className={`mx-auto max-w-screen-2xl px-4 py-2 flex items-center justify-center gap-2 ${textColor}`}
            >
                <span className="text-[15px] font-medium">{message}</span>

                <span className="ml-2 inline-flex items-center gap-1 align-middle">
                    {segments.map((value, idx) => (
                        <React.Fragment key={idx}>
                            <span className="rounded-md bg-[#B80020] px-1 py-1 text-[13px] font-semibold leading-none">
                                {formatTwo(value)}
                            </span>
                            {idx < segments.length - 1 && (
                                <span className="text-[13px] leading-none">:</span>
                            )}
                        </React.Fragment>
                    ))}
                </span>
            </div>
        </div>
    );
};

export default BookingBannerAlert;
