import React from "react";

interface BookingBannerAlertProps {
    message: string;
    time: string;
    bgColor?: string;
    textColor?: string;
}

const BookingBannerAlert: React.FC<BookingBannerAlertProps> = ({
    message,
    time,
    bgColor = "bg-[#EA0029]",
    textColor = "text-white",
}) => {
    return (
        <div className={`inset-x-0 z-50 ${bgColor}`}>
            <div
                className={`mx-auto max-w-screen-2xl px-4 py-2 flex items-center justify-center gap-2 ${textColor}`}
            >
                <span className="text-[15px] font-medium">{message}</span>

                <span className="ml-2 inline-flex items-center gap-1 align-middle">
                    {time.split(":").map((part, idx) => (
                        <React.Fragment key={idx}>
                            <span className="rounded-md bg-[#B80020] px-1 py-1 text-[13px] font-semibold leading-none">
                                {part}
                            </span>
                            {idx < time.split(":").length - 1 && (
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
