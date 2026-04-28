import React, { useEffect, useRef, useState } from "react";
import StatusMessageBanner from "./StatusMessageBanner";

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
  const warningBannerTimeoutRef = useRef<number | null>(null);
  const [showWarningBanner, setShowWarningBanner] = useState(false);

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
      // warningToast('Two minutes remaining, confirm your booking now to avoid being redirected.');
      // oneMinuteLoggedRef.current = true;
      oneMinuteLoggedRef.current = true;
      setShowWarningBanner(true);
      if (warningBannerTimeoutRef.current) {
        window.clearTimeout(warningBannerTimeoutRef.current);
      }
      warningBannerTimeoutRef.current = window.setTimeout(() => {
        setShowWarningBanner(false);
        warningBannerTimeoutRef.current = null;
      }, 6000);
    }

    if (remaining === 0 && !expiredRef.current) {
      expiredRef.current = true;
      if (typeof onExpire === "function") onExpire();
    }
  }, [remaining]);

  useEffect(() => {
    return () => {
      if (warningBannerTimeoutRef.current) {
        window.clearTimeout(warningBannerTimeoutRef.current);
        warningBannerTimeoutRef.current = null;
      }
    };
  }, []);

  const hrs = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;

  const segments = hrs > 0 ? [hrs, mins, secs] : [mins, secs]; // if no hours, show mm:ss

  return (
    <>
      <StatusMessageBanner
        visible={showWarningBanner}
        message="Two minutes remaining, confirm your booking now to avoid being redirected."
        variant="warning"
      />
      <div className="inset-x-0 z-50 flex justify-center py-4">
        <div
          className={`mx-auto w-full max-w-[470px] h-[50px] px-4 flex items-center justify-center gap-2 rounded-[100px] ${bgColor} ${textColor}`}
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
    </>
  );
};

export default BookingBannerAlert;
