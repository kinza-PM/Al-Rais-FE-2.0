import { useMemo } from "react";
import CardCollapseToggle from "../common/CardCollapseToggle";
import { formatMoney } from "../../utils/helpers";

type Props = {
    open: boolean;
    onToggleOpen: () => void;
    trip?: any;
    ancillarySummary?: {
        totalAmount: number;
        currency: string;
        selectedCount: number;
        breakdown?: Array<{
            category: "baggage" | "meals" | "seats" | "other";
            label: string;
            amount: number;
            currency: string;
            ancillaryOfferId: string;
        }>;
    };
};

const PAX_LABEL: Record<string, string> = {
    ADT: "Adult",
    CHD: "Child",
    INF: "Infant",
};



export default function FLightPriceBreakdown({ open, onToggleOpen, trip, ancillarySummary }: Props) {
    const fare = trip?.fare ?? trip?.financials?.fare ?? null;
    const fareBreakdown = Array.isArray(fare?.fareBreakdown) ? fare.fareBreakdown : fare?.fareBreakdown ?? [];
    const currency = fare?.currencyCode ?? fare?.currency ?? "USD";

    const passengerGroups = useMemo(() => {
        if (!Array.isArray(fareBreakdown) || fareBreakdown.length === 0) return [];

        return fareBreakdown.map((fb: any) => {
            const paxType = fb?.paxType ?? "ADT";
            const paxCount = Array.isArray(fb?.passengerKeys) ? fb.passengerKeys.length : 1;
            const pr = fb?.paxRate ?? {};
            const baseFare = typeof pr?.baseFare === "number" ? pr.baseFare : pr?.baseFare ?? 0;
            const taxes = typeof pr?.totalTax === "number" ? pr.totalTax : pr?.totalTax ?? pr?.taxes?.reduce?.((a: any, b: any) => a + (b?.amount || 0), 0) ?? 0;
            const subtotal = typeof pr?.totalFare === "number" ? pr.totalFare : pr?.totalFare ?? (baseFare + taxes);

            return {
                paxType,
                paxLabel: PAX_LABEL[paxType] ?? paxType,
                paxCount,
                baseFare,
                taxes,
                subtotal,
            };
        });
    }, [fareBreakdown]);

    const baseTotalRaw = fare?.totalFare ?? fare?.total ?? null;
    const baseTotal = typeof baseTotalRaw === "number" ? baseTotalRaw : 0;
    const ancillaryTotal = Number(ancillarySummary?.totalAmount || 0);
    const breakdown = Array.isArray(ancillarySummary?.breakdown)
        ? ancillarySummary!.breakdown!
        : [];
    const hasAncillary = ancillaryTotal > 0 || breakdown.length > 0;
    const total = baseTotal + ancillaryTotal;

    return (
        <div className="mt-4 rounded-[16px] border-[1.5px] border-[#E4E4E7] bg-white shadow-sm max-w-[576px]">
            <div className="flex items-center justify-between px-4 py-3 border-b-[1.5px] border-[#E4E4E7]">
                <div className="text-[16px] font-semibold text-[#0A0C0F]">Price breakdown</div>
                <CardCollapseToggle open={open} onClick={onToggleOpen} />
            </div>

            <div
                className={[
                    "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                ].join(" ")}
            >
                <div className="overflow-hidden">
                    <div className="px-4 py-3 text-[13px] leading-6">
                        <div className="text-[14px] font-semibold text-[#0A0C0F]">Passengers fares</div>

                        {passengerGroups.length === 0 ? (
                            <div className="mt-2 text-[12px] text-[#3D495C]">No passenger fare breakdown available.</div>
                        ) : (
                            passengerGroups.map((pg, idx) => {
                                // raw paxRate object from fareBreakdown (per-pax values)
                                const rawPaxRate = fareBreakdown[idx]?.paxRate ?? {};
                                const custInfo = rawPaxRate?.customerAdditionalFareInfo ?? {};

                                const baseFare = Number.isFinite(pg.baseFare) ? pg.baseFare : 0;
                                const taxes = Number.isFinite(pg.taxes) ? pg.taxes : 0;
                                const transactionFee = Number.isFinite(custInfo.transactionFeeEarned) ? custInfo.transactionFeeEarned : 0;
                                const discount = Number.isFinite(custInfo.discount) ? custInfo.discount : 0;

                                const computedSubtotal = baseFare + taxes + transactionFee - discount;

                                const officialSubtotal = rawPaxRate?.totalFare ?? pg.subtotal;

                                return (
                                    <div className="mt-3" key={idx}>
                                        <div className="text-[12px] font-medium text-[#0A0C0F]">
                                            {pg.paxCount} {pg.paxLabel}{pg.paxCount > 1 ? "s" : ""}
                                        </div>

                                        <ul className="mt-1 space-y-1 text-[12px] pl-3">
                                            <li className="flex items-center justify-between">
                                                <span className="text-[#3D495C]">Base fare each</span>
                                                <span className="font-semibold text-[#0A0C0F]">{formatMoney(baseFare, currency)}</span>
                                            </li>

                                            <li className="flex items-center justify-between">
                                                <span className="text-[#3D495C]">Taxes and fees each</span>
                                                <span className="font-semibold text-[#0A0C0F]">{formatMoney(taxes, currency)}</span>
                                            </li>

                                            {Array.isArray(rawPaxRate?.taxes) && rawPaxRate.taxes.length > 0 && (
                                                <>
                                                    <li className="pt-1 text-[12px] text-[#3D495C]">Tax breakdown:</li>
                                                    {rawPaxRate.taxes.map((t: any, ti: number) => (
                                                        <li key={ti} className="flex items-center justify-between pl-3">
                                                            <span className="text-[#3D495C]">{t.taxCode ?? "Tax"}</span>
                                                            <span className="font-semibold text-[#0A0C0F]">{formatMoney(t.amount ?? 0, currency)}</span>
                                                        </li>
                                                    ))}
                                                </>
                                            )}

                                            <li className="flex items-center justify-between pt-1">
                                                <span className="text-[#3D495C]">Transaction fee</span>
                                                <span className="font-semibold text-[#0A0C0F]">{formatMoney(transactionFee, currency)}</span>
                                            </li>

                                            {/* discount (shown negative) */}
                                            <li className="flex items-center justify-between">
                                                <span className="text-[#3D495C]">Discount</span>
                                                <span className="font-semibold text-[#0A0C0F]">-{formatMoney(discount, currency)}</span>
                                            </li>

                                            {custInfo.plbearned != null && (
                                                <li className="flex items-center justify-between">
                                                    <span className="text-[#3D495C]">PLB earned (info)</span>
                                                    <span className="font-semibold text-[#0A0C0F]">{custInfo.plbearned}</span>
                                                </li>
                                            )}
                                            {custInfo.incentiveEarned != null && (
                                                <li className="flex items-center justify-between">
                                                    <span className="text-[#3D495C]">Incentive earned (info)</span>
                                                    <span className="font-semibold text-[#0A0C0F]">{custInfo.incentiveEarned}</span>
                                                </li>
                                            )}
                                            {custInfo.tdsOnIncentive != null && (
                                                <li className="flex items-center justify-between">
                                                    <span className="text-[#3D495C]">TDS on incentive</span>
                                                    <span className="font-semibold text-[#0A0C0F]">{formatMoney(custInfo.tdsOnIncentive, currency)}</span>
                                                </li>
                                            )}

                                            <li className="flex items-center justify-between">
                                                <span className="text-[#3D495C]">Subtotal (computed)</span>
                                                <span className="font-semibold text-[#0A0C0F]">{formatMoney(computedSubtotal, currency)}</span>
                                            </li>

                                            <li className="flex items-center justify-between">
                                                <span className="text-[#3D495C]">Subtotal (official)</span>
                                                <span className="font-semibold text-[#0A0C0F]">{formatMoney(officialSubtotal, currency)}</span>
                                            </li>

                                            {pg.paxCount > 1 && (
                                                <li className="flex items-center justify-between pt-1">
                                                    <span className="text-[#3D495C]">Group total</span>
                                                    <span className="font-semibold text-[#0A0C0F]">{formatMoney((officialSubtotal || computedSubtotal) * pg.paxCount, currency)}</span>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                );
                            })
                        )}

                        {hasAncillary && (
                            <div className="mt-4">
                                <div className="text-[13px] font-semibold text-[#0A0C0F]">Enhancements</div>
                                <ul className="mt-1 space-y-1 text-[12px] pl-3">
                                    {breakdown.length > 0 ? (
                                        breakdown.map((item, idx) => (
                                            <li key={`${item.ancillaryOfferId}-${idx}`} className="flex items-start justify-between gap-6">
                                                <span className="text-[#3D495C]">
                                                    {item.category.toUpperCase()} • {item.label}
                                                </span>
                                                <span className="font-semibold text-[#0A0C0F] shrink-0">
                                                    {formatMoney(
                                                        Number(item.amount || 0),
                                                        item.currency || ancillarySummary?.currency || currency
                                                    )}
                                                </span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="flex items-center justify-between">
                                            <span className="text-[#3D495C]">
                                                Ancillary selections ({ancillarySummary?.selectedCount || 0})
                                            </span>
                                            <span className="font-semibold text-[#0A0C0F]">
                                                {formatMoney(
                                                    ancillaryTotal,
                                                    ancillarySummary?.currency || currency
                                                )}
                                            </span>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {open && <div className="h-[1.5px] bg-[#E4E4E7]" />}

            <div className="flex items-center justify-between px-4 py-2">
                <span className="text-[12px] text-[#3D495C]">Total</span>
                <span className="text-[14px] font-semibold text-[#0A0C0F]">
                    {total != null ? formatMoney(total, currency) : "—"}
                </span>
            </div>
        </div>

        // <div className="mt-4 rounded-xl border border-[#E4E4E7] bg-white">
        //     <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
        //         <div className="text-[16px] font-semibold text-[#0A0C0F]">Price breakdown</div>
        //         <CardCollapseToggle open={open} onClick={onToggleOpen} />
        //     </div>

        //     <div
        //         className={[
        //             "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
        //             open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        //         ].join(" ")}
        //     >
        //         <div className="overflow-hidden">
        //             <div className="px-4 py-3 text-[13px] leading-6">
        //                 <div className="text-[14px] font-semibold text-[#0A0C0F]">Passengers fares</div>

        //                 <div className="mt-1">
        //                     <div className="text-[12px] font-medium text-[#0A0C0F]">2 Adults</div>
        //                     <ul className="mt-1 space-y-1 text-[12px] pl-3">
        //                         <li className="flex items-center justify-between">
        //                             <span className="text-[#3D495C]">Base fare each</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$300</span>
        //                         </li>
        //                         <li className="flex items-center justify-between">
        //                             <span className="text-[#3D495C]">taxes and fees each</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$100</span>
        //                         </li>
        //                         <li className="flex items-center justify-between pt-1">
        //                             <span className="text-[#3D495C]">Subtotal</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$800</span>
        //                         </li>
        //                     </ul>
        //                 </div>

        //                 <div className="mt-3">
        //                     <div className="text-[12px] font-medium text-[#0A0C0F]">1 Child</div>
        //                     <ul className="mt-1 space-y-1 text-[12px] pl-3">
        //                         <li className="flex items-center justify-between">
        //                             <span className="text-[#3D495C]">Base fare</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$250</span>
        //                         </li>
        //                         <li className="flex items-center justify-between">
        //                             <span className="text-[#3D495C]">taxes and fees</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$80</span>
        //                         </li>
        //                         <li className="flex items-center justify-between pt-1">
        //                             <span className="text-[#3D495C]">Subtotal</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$330</span>
        //                         </li>
        //                     </ul>
        //                 </div>

        //                 <div className="mt-3">
        //                     <div className="text-[12px] font-medium text-[#0A0C0F]">1 Infant</div>
        //                     <ul className="mt-1 space-y-1 text-[12px] pl-3">
        //                         <li className="flex items-center justify-between">
        //                             <span className="text-[#3D495C]">Base fare</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$25</span>
        //                         </li>
        //                         <li className="flex items-center justify-between">
        //                             <span className="text-[#3D495C]">taxes and fees</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$10</span>
        //                         </li>
        //                         <li className="flex items-center justify-between pt-1">
        //                             <span className="text-[#3D495C]">Subtotal</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$35</span>
        //                         </li>
        //                     </ul>
        //                 </div>

        //                 <div className="mt-5 text-[13px] font-semibold text-[#0A0C0F]">Enhancements</div>

        //                 <div className="mt-1">
        //                     <div className="text-[12px] font-medium text-[#0A0C0F]">Baggage</div>
        //                     <ul className="mt-1 space-y-1 text-[12px] pl-3">
        //                         <li className="flex items-center justify-between">
        //                             <span className="text-[#3D495C]">01 - 20 KGs checked bag</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$32</span>
        //                         </li>
        //                         <li className="flex items-center justify-between pt-1">
        //                             <span className="text-[#3D495C]">Subtotal</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$32</span>
        //                         </li>
        //                     </ul>
        //                 </div>

        //                 <div className="mt-3">
        //                     <div className="text-[12px] font-medium text-[#0A0C0F]">Meals &amp; drinks</div>
        //                     <ul className="mt-1 space-y-1 text-[12px] pl-3">
        //                         <li className="flex items-center justify-between">
        //                             <span className="text-[#3D495C]">(1x) Vegan burger</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$15.75</span>
        //                         </li>
        //                         <li className="flex items-center justify-between">
        //                             <span className="text-[#3D495C]">Iced green tea</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$4.50</span>
        //                         </li>
        //                         <li className="flex items-center justify-between pt-1">
        //                             <span className="text-[#3D495C]">Subtotal</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$20.25</span>
        //                         </li>
        //                     </ul>
        //                 </div>

        //                 <div className="mt-3">
        //                     <div className="text-[12px] font-medium text-[#0A0C0F]">Comfort &amp; entertainment</div>
        //                     <ul className="mt-1 space-y-1 text-[12px] pl-3">
        //                         <li className="flex items-center justify-between">
        //                             <span className="text-[#3D495C]">Faster wi-fi (10 MBPs)</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$22.50</span>
        //                         </li>
        //                         <li className="flex items-center justify-between">
        //                             <span className="text-[#3D495C]">Newly released movies selection</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$50</span>
        //                         </li>
        //                         <li className="flex items-center justify-between">
        //                             <span className="text-[#3D495C]">Spotify trending music selection</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$40</span>
        //                         </li>
        //                         <li className="flex items-center justify-between pt-1">
        //                             <span className="text-[#3D495C]">Subtotal</span>
        //                             <span className="font-semibold text-[#0A0C0F]">$112.50</span>
        //                         </li>
        //                     </ul>
        //                 </div>


        //             </div>

        //         </div>
        //     </div>

        //     {open && (<div className="h-px bg-[#E4E4E7]" />)}

        //     <div className="flex items-center justify-between px-4 py-2">
        //         <span className="text-[12px] text-[#3D495C]">Total</span>
        //         <span className="text-[14px] font-semibold text-[#0A0C0F]">$1,329.75</span>
        //     </div>
        // </div>
    );
}
