// import AirlineMini from "./AirlineMini";

type CardFeaturingRowProps = {
    airline: { logo: string; name: string; flight: string };
    blocks: Array<{ label: string; value: React.ReactNode }>; // e.g. Passenger, Cost, etc
    right?: React.ReactNode; // e.g. <CustomToggle />
    className?: string;
};

type AirlineMiniProps = {
    logo: string;
    airline: string;
    flight: string;
    alt?: string;
};


function AirlineMini({ logo, airline, flight, alt }: AirlineMiniProps) {
    return (
        <div className="flex items-center gap-3">
            <img src={logo} alt={alt ?? airline} className="h-10 w-10 rounded-full object-cover" />
            <div>
                <div className="text-[14px] font-medium text-[#0A0C0F]">{airline}</div>
                <div className="text-[12px] text-[#3D495C]">{flight}</div>
            </div>
        </div>
    );
}

export default function CardFeaturingRow({ airline, blocks, right, className = "" }: CardFeaturingRowProps) {
    return (
        <div className={`grid grid-cols-[minmax(220px,1.1fr)_auto_auto_1fr_auto] items-center gap-8 ${className}`}>
            <AirlineMini logo={airline.logo} airline={airline.name} flight={airline.flight} />
            {blocks.slice(0, 3).map((b, i) => (
                <div key={i}>
                    <div className="text-[12px] text-[#3D495C]">{b.label}</div>
                    <div className="text-[14px] font-medium text-[#0A0C0F]">{b.value}</div>
                </div>
            ))}
            <div className="flex justify-end">{right}</div>
        </div>
    );
}
