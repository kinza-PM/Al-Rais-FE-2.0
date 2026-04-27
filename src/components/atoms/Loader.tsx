import React from "react";
import Logo from "../../assets/images/logo-small.png";

type Props = {
    show: boolean;
    label?: string;
};

const Loader: React.FC<Props> = ({
    show,
    label = "Loading, please wait...",
}) => {

    if (!show) return null;

    return (
        <div
            className="
        fixed inset-0 z-[9999] flex items-center justify-center
        bg-white/40 backdrop-blur-[4px] 
      "
            aria-hidden="true"
        >
            <div
                className="pointer-events-auto flex flex-col items-center gap-2"
                role="status"
                aria-live="polite"
            >
                <img
                    src={Logo}
                    alt="loading"
                    className="h-20 w-20 object-contain sm:h-20 sm:w-20"
                    draggable={false}
                />
                <p className="text-[16px] text-[#081326] text-center">
                    {label}
                </p>
            </div>
        </div>
    );
};

export default Loader;
