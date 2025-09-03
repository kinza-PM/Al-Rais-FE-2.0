import React from "react";

type Props = { show: boolean; label?: string };

const Loader: React.FC<Props> = ({ show, label = "Loading…" }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/50">
            <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full border-4 border-[#E6EEFF] border-t-[#2351A3] animate-spin" />
                <p className="text-sm font-medium text-[#2351A3]">{label}</p>
            </div>
        </div>
    );
};

export default Loader;
