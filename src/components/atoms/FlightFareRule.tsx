export default function FLightFareRule({ trip }: { trip: any }) {
    const fare = trip?.fare;

    const journeys: any[] = trip?.raw?.journey ?? trip?.journey ?? [];
    const segments: any[] = Array.isArray(journeys) && journeys.length > 0
        ? journeys.flatMap((j: any) => Array.isArray(j?.flightSegments) ? j.flightSegments : [])
        : (trip?.journey?.[0]?.flightSegments ?? []);

    const formatWeight = (b: any) => {
        if (!b) return null;
        const value = b.value ?? b.amount ?? "";
        const unit = b.unit ?? "";
        return `${value} ${unit}`.trim();
    };

    const entries = (segments || []).map((seg: any) => {
        const route = `${seg?.departureAirportCode ?? ""} → ${seg?.arrivalAirportCode ?? ""}`.trim();
        const checked = seg?.baggageAllowance?.checkedInBaggage?.[0] ?? null;
        const carryOn = seg?.baggageAllowance?.carryOnBaggage?.[0] ?? null;
        return { route, checked, carryOn };
    });

    // Fallback to a single segment if nothing found
    const singleSegment = !entries.length ? (trip?.journey?.[0]?.flightSegments?.[0] ?? null) : null;
    const singleEntry = singleSegment ? {
        route: `${singleSegment?.departureAirportCode ?? ""} → ${singleSegment?.arrivalAirportCode ?? ""}`.trim(),
        checked: singleSegment?.baggageAllowance?.checkedInBaggage?.[0] ?? null,
        carryOn: singleSegment?.baggageAllowance?.carryOnBaggage?.[0] ?? null,
    } : null;

    const list = entries.length ? entries : (singleEntry ? [singleEntry] : []);

    return (
        <div className="mt-4 rounded-xl border border-[#E4E4E7] bg-white">
            <div className="px-4 py-3 text-[16px] font-semibold text-[#0A0C0F]">
                Important fare rules
            </div>
            <div className="h-px bg-[#E4E4E7]" />

            <ul className="px-4 py-1">
                {list.map((e, idx) => (
                    <>
                        {e.checked ? (
                            <li key={`checked-${idx}`} className="flex items-center justify-between py-1">
                                <span className="text-[#3D495C] text-[12px]">Checked baggage ({e.route})</span>
                                <span className="text-[#0A0C0F] text-[15px] font-medium">{formatWeight(e.checked)}</span>
                            </li>
                        ) : null}
                        {e.carryOn ? (
                            <li key={`carry-${idx}`} className="flex items-center justify-between py-1">
                                <span className="text-[#3D495C] text-[12px]">Carry on ({e.route})</span>
                                <span className="text-[#0A0C0F] text-[15px] font-medium">{formatWeight(e.carryOn)}</span>
                            </li>
                        ) : null}
                    </>
                ))}

                <li className="flex items-center justify-between py-1">
                    <span className="text-[#3D495C] text-[12px]">Refundable</span>
                    <span className="text-[#0A0C0F] text-[15px] font-medium">{fare?.fareType?.refundable ? "Yes" : "No"}</span>
                </li>

                {fare?.fareType?.farePreference && (
                    <li className="flex items-center justify-between py-1">
                        <span className="text-[#3D495C] text-[12px]">Fare preference</span>
                        <span className="text-[#0A0C0F] text-[15px] font-medium">{fare.fareType.farePreference}</span>
                    </li>
                )}
            </ul>
        </div>
    );
}
