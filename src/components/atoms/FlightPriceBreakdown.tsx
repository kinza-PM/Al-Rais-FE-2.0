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

const PAX_ORDER = ["ADT", "CHD", "INF"];

function sortPassengerGroups<T extends { paxType: string }>(groups: T[]): T[] {
    return [...groups].sort(
        (a, b) => PAX_ORDER.indexOf(a.paxType) - PAX_ORDER.indexOf(b.paxType),
    );
}

/** Collapsed summary label: "2 X Adults", "1 X Child", … */
function collapsedPaxLabel(paxType: string, count: number, fallbackLabel: string): string {
    if (paxType === "ADT") return `${count} X ${count > 1 ? "Adults" : "Adult"}`;
    if (paxType === "CHD") return `${count} X ${count > 1 ? "Children" : "Child"}`;
    if (paxType === "INF") return `${count} X ${count > 1 ? "Infants" : "Infant"}`;
    return `${count} X ${fallbackLabel}${count > 1 ? "s" : ""}`;
}

function groupBaseFareTotal(pg: {
    baseFareEach: number;
    paxCount: number;
}): number {
    return pg.baseFareEach * pg.paxCount;
}

function groupTaxesFeesNet(pg: {
    taxesEach: number;
    transactionFeeEach: number;
    discountEach: number;
    paxCount: number;
}): number {
    return (
        pg.taxesEach * pg.paxCount +
        pg.transactionFeeEach * pg.paxCount -
        pg.discountEach * pg.paxCount
    );
}

export default function FLightPriceBreakdown({ open, onToggleOpen, trip, ancillarySummary }: Props) {
    const fare = trip?.fare ?? trip?.financials?.fare ?? null;
    const fareBreakdown = Array.isArray(fare?.fareBreakdown) ? fare.fareBreakdown : fare?.fareBreakdown ?? [];
    const currency = fare?.currencyCode ?? fare?.currency ?? "USD";

    /** Trip-level fare totals from the API (same as sum of fareBreakdown when data is consistent). */
    const fareBaseRoot =
        typeof fare?.baseFare === "number" && Number.isFinite(fare.baseFare)
            ? fare.baseFare
            : null;
    const fareTaxRoot =
        typeof fare?.totalTax === "number" && Number.isFinite(fare.totalTax)
            ? fare.totalTax
            : null;

    const passengerGroups = useMemo(() => {
        if (!Array.isArray(fareBreakdown) || fareBreakdown.length === 0) return [];

        // Aggregate by paxType so Adult/Child/Infant are shown once each.
        const byType = new Map<
            string,
            {
                paxType: string;
                paxLabel: string;
                paxCount: number;
                baseFareSum: number;
                taxesSum: number;
                transactionFeeSum: number;
                discountSum: number;
                officialSubtotalSum: number;
                taxLines: Array<{ taxCode?: string; amount?: number }>;
            }
        >();

        for (const fb of fareBreakdown) {
            const paxType = fb?.paxType ?? "ADT";
            const paxCount = Array.isArray(fb?.passengerKeys) ? fb.passengerKeys.length : 1;
            const pr = fb?.paxRate ?? {};
            const custInfo = pr?.customerAdditionalFareInfo ?? {};

            const baseFareEach = Number(pr?.baseFare ?? 0) || 0;
            // Prefer paxRate.totalTax when present; only sum taxes[] if totalTax is absent.
            const prTotalTax = pr?.totalTax;
            const taxesEach =
                prTotalTax != null && prTotalTax !== ""
                    ? Number(prTotalTax) || 0
                    : Number(
                          pr?.taxes?.reduce?.(
                              (a: number, b: any) => a + (Number(b?.amount) || 0),
                              0,
                          ) ?? 0,
                      ) || 0;
            const transactionFeeEach = Number(custInfo?.transactionFeeEarned ?? 0) || 0;
            const discountEach = Number(custInfo?.discount ?? 0) || 0;
            const officialSubtotalEach = Number(pr?.totalFare ?? (baseFareEach + taxesEach)) || 0;

            const existing =
                byType.get(paxType) ??
                ({
                    paxType,
                    paxLabel: PAX_LABEL[paxType] ?? paxType,
                    paxCount: 0,
                    baseFareSum: 0,
                    taxesSum: 0,
                    transactionFeeSum: 0,
                    discountSum: 0,
                    officialSubtotalSum: 0,
                    taxLines: [],
                } as const);

            const next = {
                ...existing,
                paxCount: existing.paxCount + paxCount,
                baseFareSum: existing.baseFareSum + baseFareEach * paxCount,
                taxesSum: existing.taxesSum + taxesEach * paxCount,
                transactionFeeSum: existing.transactionFeeSum + transactionFeeEach * paxCount,
                discountSum: existing.discountSum + discountEach * paxCount,
                officialSubtotalSum: existing.officialSubtotalSum + officialSubtotalEach * paxCount,
                taxLines: Array.isArray(pr?.taxes) && pr.taxes.length ? pr.taxes : existing.taxLines,
            };

            byType.set(paxType, next);
        }

        return Array.from(byType.values()).map((g) => {
            const count = g.paxCount || 1;
            const baseFareEach = g.baseFareSum / count;
            const taxesEach = g.taxesSum / count;
            const transactionFeeEach = g.transactionFeeSum / count;
            const discountEach = g.discountSum / count;
            const officialSubtotalEach = g.officialSubtotalSum / count;
            const computedSubtotalEach = baseFareEach + taxesEach + transactionFeeEach - discountEach;

            return {
                paxType: g.paxType,
                paxLabel: g.paxLabel,
                paxCount: g.paxCount,
                baseFareEach,
                taxesEach,
                transactionFeeEach,
                discountEach,
                computedSubtotalEach,
                officialSubtotalEach,
                groupTotal: g.officialSubtotalSum || computedSubtotalEach * g.paxCount,
                taxLines: g.taxLines,
            };
        });
    }, [fareBreakdown]);

    const sortedPassengerGroups = useMemo(
        () => sortPassengerGroups(passengerGroups),
        [passengerGroups],
    );

    const adtGroup = sortedPassengerGroups.find((g) => g.paxType === "ADT");
    const hasChd = sortedPassengerGroups.some((g) => g.paxType === "CHD");
    const hasInf = sortedPassengerGroups.some((g) => g.paxType === "INF");

    const isSingleAdultOnly =
        sortedPassengerGroups.length === 1 &&
        !!adtGroup &&
        adtGroup.paxCount === 1 &&
        !hasChd &&
        !hasInf;

    const hasOnlyMultipleAdults =
        sortedPassengerGroups.length === 1 &&
        !!adtGroup &&
        adtGroup.paxCount > 1 &&
        !hasChd &&
        !hasInf;

    const airportTaxAndSurchargeTotal = useMemo(
        () =>
            sortedPassengerGroups.reduce(
                (sum, pg) => sum + groupTaxesFeesNet(pg),
                0,
            ),
        [sortedPassengerGroups],
    );

    /** Collapsed "Airport Tax & Surcharge": use trip fare.totalTax when API sends it so it matches totalFare. */
    const collapsedTaxLineAmount =
        fareTaxRoot != null ? fareTaxRoot : airportTaxAndSurchargeTotal;

    /** Collapsed "N X Adults" row for adults-only multi-pax: use fare.baseFare when present. */
    const collapsedMultiAdultBaseAmount =
        hasOnlyMultipleAdults && adtGroup
            ? fareBaseRoot ?? groupBaseFareTotal(adtGroup)
            : null;

    const showCollapsedFareSummary =
        !open &&
        sortedPassengerGroups.length > 0 &&
        !isSingleAdultOnly;

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

            {showCollapsedFareSummary && (
                <div className="space-y-2 px-4 py-3 border-b-[1.5px] border-[#E4E4E7] text-[12px] leading-5">
                    {hasOnlyMultipleAdults && adtGroup ? (
                        <>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[#3D495C]">
                                    {adtGroup.paxCount} X Adults
                                </span>
                                <span className="font-semibold tabular-nums text-[#0A0C0F]">
                                    {formatMoney(
                                        collapsedMultiAdultBaseAmount ?? 0,
                                        currency,
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[#3D495C]">
                                    Airport Tax &amp; Surcharge
                                </span>
                                <span className="font-semibold tabular-nums text-[#0A0C0F]">
                                    {formatMoney(collapsedTaxLineAmount, currency)}
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            {sortedPassengerGroups.map((pg, idx) => (
                                <div
                                    key={`${pg.paxType}-${idx}`}
                                    className="flex items-center justify-between gap-4"
                                >
                                    <span className="text-[#3D495C]">
                                        {collapsedPaxLabel(
                                            pg.paxType,
                                            pg.paxCount,
                                            pg.paxLabel,
                                        )}
                                    </span>
                                    <span className="font-semibold tabular-nums text-[#0A0C0F]">
                                        {formatMoney(
                                            groupBaseFareTotal(pg),
                                            currency,
                                        )}
                                    </span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[#3D495C]">
                                    Airport Tax &amp; Surcharge
                                </span>
                                <span className="font-semibold tabular-nums text-[#0A0C0F]">
                                    {formatMoney(collapsedTaxLineAmount, currency)}
                                </span>
                            </div>
                        </>
                    )}

                    {hasAncillary && (
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[#3D495C]">Enhancements</span>
                            <span className="font-semibold tabular-nums text-[#0A0C0F]">
                                {formatMoney(
                                    ancillaryTotal,
                                    ancillarySummary?.currency || currency,
                                )}
                            </span>
                        </div>
                    )}
                </div>
            )}

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
                                return (
                                    <div className="mt-3" key={idx}>
                                        <div className="text-[12px] font-medium text-[#0A0C0F]">
                                            {pg.paxCount} {pg.paxLabel}{pg.paxCount > 1 ? "s" : ""}
                                        </div>

                                        <ul className="mt-1 space-y-1 text-[12px] pl-3">
                                            <li className="flex items-center justify-between">
                                                <span className="text-[#3D495C]">Price per person</span>
                                                <span className="font-semibold text-[#0A0C0F]">
                                                    {formatMoney(pg.officialSubtotalEach || pg.computedSubtotalEach, currency)}
                                                </span>
                                            </li>

                                            <li className="flex items-center justify-between">
                                                <span className="text-[#3D495C]">Base fare per person</span>
                                                <span className="font-semibold text-[#0A0C0F]">{formatMoney(pg.baseFareEach, currency)}</span>
                                            </li>

                                            <li className="flex items-center justify-between">
                                                <span className="text-[#3D495C]">Taxes and fees per person</span>
                                                <span className="font-semibold text-[#0A0C0F]">{formatMoney(pg.taxesEach, currency)}</span>
                                            </li>

                                            <li className="flex items-center justify-between pt-1">
                                                <span className="text-[#3D495C]">Transaction fee</span>
                                                <span className="font-semibold text-[#0A0C0F]">{formatMoney(pg.transactionFeeEach, currency)}</span>
                                            </li>

                                            {/* discount (shown negative) */}
                                            <li className="flex items-center justify-between">
                                                <span className="text-[#3D495C]">Discount</span>
                                                <span className="font-semibold text-[#0A0C0F]">-{formatMoney(pg.discountEach, currency)}</span>
                                            </li>

                                            <li className="flex items-center justify-between">
                                                <span className="text-[#3D495C]">Subtotal (computed)</span>
                                                <span className="font-semibold text-[#0A0C0F]">{formatMoney(pg.computedSubtotalEach, currency)}</span>
                                            </li>

                                            <li className="flex items-center justify-between">
                                                <span className="text-[#3D495C]">Subtotal (official)</span>
                                                <span className="font-semibold text-[#0A0C0F]">{formatMoney(pg.officialSubtotalEach, currency)}</span>
                                            </li>

                                            <li className="flex items-center justify-between pt-1">
                                                <span className="text-[#3D495C]">Group total</span>
                                                <span className="font-semibold text-[#0A0C0F]">{formatMoney(pg.groupTotal, currency)}</span>
                                            </li>
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

            <div
                className={[
                    "flex items-center justify-between px-4 py-2",
                    showCollapsedFareSummary ? "pt-3" : "",
                ].join(" ")}
            >
                <span
                    className={
                        showCollapsedFareSummary
                            ? "text-[12px] font-semibold text-[#0A0C0F]"
                            : "text-[12px] text-[#3D495C]"
                    }
                >
                    {showCollapsedFareSummary ? "Total all inclusive" : "Total"}
                </span>
                <span className="text-[14px] font-semibold text-[#0A0C0F] tabular-nums">
                    {total != null ? formatMoney(total, currency) : "—"}
                </span>
            </div>
        </div>
    );
}
