import EmirateLogo from "../../assets/images/emirates.png";
import AirIndia from "../../assets/images/air-india.png";
import baggage from "../../assets/svgs/enhance-baggage.svg";
import CustomToggle from "../common/CustomToggle";
import CollapsibleCard from "./CollapsibleCard";
import CardFeaturingRow from "./CardFeaturingRow";

type FlightBookingBaggageSectionProps = {
    open: boolean;
    onToggleOpen: () => void;
    depChecked: boolean;
    retChecked: boolean;
    onToggleDep: () => void;
    onToggleRet: () => void;
};

export default function FlightBookingBaggageSection({
    open,
    onToggleOpen,
    depChecked,
    retChecked,
    onToggleDep,
    onToggleRet,
}: FlightBookingBaggageSectionProps) {
    return (
        <div className="px-3 pb-3 mt-3">
            <CollapsibleCard
                open={open}
                onToggle={onToggleOpen}
                icon={<img src={baggage} alt="baggage" className="w-6 h-6" />}
                title="Baggage"
                subtitle="Add a 20kg checked bag to avoid carry-on restrictions."
            >
                {/* Departure */}
                <div className="mb-4">
                    <div className="mb-2 text-[15px] font-semibold text-[#0A0C0F]">Departure flight</div>
                    <CardFeaturingRow
                        airline={{ logo: EmirateLogo, name: "Emirates Airlines", flight: "EK 1234 – Economy class" }}
                        blocks={[
                            { label: "Passenger", value: "01 Adult" },
                            { label: "Upgrade cost", value: <><span className="font-bold text-[15px]">$15.00</span><span className="text-[13px]">/per item</span></> },
                            { label: "Added to purchase", value: "01 · 20kg checked bag" },
                        ]}
                        right={<CustomToggle checked={depChecked} onChange={onToggleDep} />}
                        className="enhance-baggage-grid"
                    />
                </div>

                {/* Return */}
                <div>
                    <div className="mb-2 text-[15px] font-semibold text-[#0A0C0F]">Return flight</div>
                    <CardFeaturingRow
                        airline={{ logo: AirIndia, name: "Air India", flight: "AI 1452 – Economy class" }}
                        blocks={[
                            { label: "Passenger", value: "01 Adult" },
                            { label: "Upgrade cost", value: <><span className="font-bold text-[15px]">$12.00</span><span className="text-[13px]">/per item</span></> },
                            { label: "Added to purchase", value: <span className="text-[#0A0C0F]">-</span> },
                        ]}
                        right={<CustomToggle checked={retChecked} onChange={onToggleRet} />}
                        className="enhance-baggage-grid"
                    />
                </div>
            </CollapsibleCard>
        </div>
    );
}