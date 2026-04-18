import React, { useEffect, useState, useCallback } from "react";
import { Radio, Checkbox, Collapse } from "antd";
import CustomCollapse from "../common/CustomCollapse";
import type { RefundableFilterMode } from "../../utils/flightFilters";

const { Panel } = Collapse;

export type FlightSearchFilterProps = {
    loading: boolean;
    // price
    headerContent: React.ReactNode;
    priceRangeBounds: [number, number];
    selectedPriceRange: [number, number];
    priceStep: number;
    onPriceRangeChange: (next: [number, number]) => void;

    // stops
    numberStops: { label: string; value: string }[];
    selectedMaxConnections: number;
    onMaxConnectionsChange: (next: number) => void;

    // baggage
    baggage: { label: string; value: string }[];
    /** When true, list only offers with checked baggage on at least one segment */
    baggageIncludedOnly: boolean;
    onBaggageIncludedChange: (checked: boolean) => void;

    // transit
    transitHours: { label: string; value: string }[];
    selectedTransitRange?: string | null;
    onTransitRangeChange?: (value: string | null) => void;

    // time ranges
    departureFlightRange: { start: string; end: string };
    arrivalFlightRange: { start: string; end: string };
    onDepartureRangeChange: (next: { start?: string; end?: string }) => void;
    onArrivalRangeChange: (next: { start?: string; end?: string }) => void;
    openTimePicker: (key: string) => void;
    timeRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;

    // airlines
    airline: { id: string | number; label: string; code: string }[];
    selectedAirlineIds: string[];
    onAirlineToggle: (code: string, checked: boolean) => void;
    /** When true, list only offers with `detail.ancillaryDetailsAvailable` */
    ancillaryAddOnsOnly: boolean;
    onAncillaryAddOnsOnlyChange: (checked: boolean) => void;

    /** Filter by `fare.fareType.refundable` on each offer */
    refundableFilterMode: RefundableFilterMode;
    onRefundableFilterChange: (mode: RefundableFilterMode) => void;

    onReset?: () => void;
};

const FlightSearchFilter: React.FC<FlightSearchFilterProps> = ({
    loading,
    headerContent,
    priceRangeBounds,
    selectedPriceRange,
    priceStep: _priceStep,
    onPriceRangeChange,

    numberStops,
    selectedMaxConnections,
    onMaxConnectionsChange,

    baggage,
    baggageIncludedOnly,
    onBaggageIncludedChange,

    transitHours: _transitHours,
    selectedTransitRange,
    onTransitRangeChange,

    departureFlightRange,
    arrivalFlightRange,
    onDepartureRangeChange,
    onArrivalRangeChange,
    openTimePicker,
    timeRefs,

    airline,
    selectedAirlineIds,
    onAirlineToggle,
    ancillaryAddOnsOnly,
    onAncillaryAddOnsOnlyChange,

    refundableFilterMode,
    onRefundableFilterChange,

    onReset,
}) => {
    const [minStr, setMinStr] = useState(() => String(selectedPriceRange[0]));
    const [maxStr, setMaxStr] = useState(() => String(selectedPriceRange[1]));

    useEffect(() => {
        setMinStr(String(selectedPriceRange[0]));
        setMaxStr(String(selectedPriceRange[1]));
    }, [selectedPriceRange[0], selectedPriceRange[1]]);

    const clamp = useCallback((n: number, lo: number, hi: number) => {
        if (Number.isNaN(n) || !Number.isFinite(n)) return lo;
        return Math.min(hi, Math.max(lo, n));
    }, []);

    const parseAmount = (s: string): number | null => {
        const t = s.trim().replace(/,/g, "");
        if (t === "" || t === ".") return null;
        const n = Number(t);
        return Number.isFinite(n) ? n : null;
    };

    const commitMinMax = useCallback(
        (nextMinStr: string, nextMaxStr: string) => {
            const [boundLo, boundHi] = priceRangeBounds;
            let nMin = parseAmount(nextMinStr);
            let nMax = parseAmount(nextMaxStr);
            if (nMin === null) nMin = selectedPriceRange[0];
            if (nMax === null) nMax = selectedPriceRange[1];
            nMin = clamp(nMin, boundLo, boundHi);
            nMax = clamp(nMax, boundLo, boundHi);
            if (nMin > nMax) [nMin, nMax] = [nMax, nMin];
            setMinStr(String(nMin));
            setMaxStr(String(nMax));
            onPriceRangeChange([nMin, nMax]);
        },
        [priceRangeBounds, selectedPriceRange, clamp, onPriceRangeChange],
    );

    const sanitizeDecimal = (raw: string) => {
        let v = raw.replace(/[^0-9.]/g, "");
        const firstDot = v.indexOf(".");
        if (firstDot !== -1) {
            v =
                v.slice(0, firstDot + 1) +
                v.slice(firstDot + 1).replace(/\./g, "");
        }
        return v;
    };

    const fullWidth: React.CSSProperties = {
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
    };

    const priceFieldStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        border: "1.5px solid #E4E4E7",
        borderRadius: "12px",
        padding: "10px 12px",
        background: "#FFFFFF",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
    };

    const aedLabelStyle: React.CSSProperties = {
        fontSize: "10px",
        fontWeight: 300,
        color: "#2351A3",
        flexShrink: 0,
        letterSpacing: "0.04em",
        lineHeight: 1,
    };

    const priceInputStyle: React.CSSProperties = {
        flex: 1,
        minWidth: 0,
        border: "none",
        outline: "none",
        fontSize: "14px",
        fontWeight: 300,
        color: "#0F172A",
        background: "transparent",
    };

    const toDisplayTime = (v?: string) => {
        if (!v) return "--:--";
        const [hh, mm] = String(v).split(":").map(Number);
        const h = Number.isFinite(hh) ? hh : 0;
        const m = Number.isFinite(mm) ? mm : 0;
        const ampm = h >= 12 ? "PM" : "AM";
        const twelve = h % 12 === 0 ? 12 : h % 12;
        return `${String(twelve).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
    };

    const activeCount = (() => {
        let cnt = 0;
        if (
            selectedPriceRange[0] !== priceRangeBounds[0] ||
            selectedPriceRange[1] !== priceRangeBounds[1]
        ) cnt++;
        if (Number(selectedMaxConnections || 0) > 0) cnt++;
        if (selectedTransitRange) cnt++;
        if ((departureFlightRange?.start || "") || (departureFlightRange?.end || "")) cnt++;
        if ((arrivalFlightRange?.start || "") || (arrivalFlightRange?.end || "")) cnt++;
        if ((selectedAirlineIds || []).length > 0) cnt++;
        if (baggageIncludedOnly) cnt++;
        if (ancillaryAddOnsOnly) cnt++;
        if (refundableFilterMode !== "all") cnt++;
        return cnt;
    })();

    const refundableRadioOptions = [
        { label: "All", value: "all" as const },
        { label: "Refundable", value: "refundable" as const },
        { label: "Non-refundable", value: "non_refundable" as const },
    ];

    const transitHourOptions = [
        { label: "0-3h", value: "0-3h" },
        { label: "3-6h", value: "3-6h" },
        { label: "6-12h", value: "6-12h" },
        { label: "12-24h", value: "12-24h" },
        { label: "24h+", value: "24h+" },
    ];

    return (
        <div
            className="filterSectionStyle flight-search-filter-root"
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                ...fullWidth,
            }}
        >
            {/* Sort by - Direct render without extra wrapper */}
            <div style={fullWidth}>{headerContent}</div>

            {/* Filters Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 300, color: '#0F172A', margin: 0 }}>
                    Filters
                    {activeCount > 0 ? (
                        <>
                            <span style={{ margin: '0 8px', color: '#64748B' }}>•</span>
                            <span
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 300,
                                    color: '#64748B',
                                }}
                            >
                                {activeCount} Active
                            </span>
                        </>
                    ) : null}
                </h4>
                <button 
                    onClick={onReset}
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#2351A3', 
                        fontSize: '14px',
                        fontWeight: 300,
                        cursor: 'pointer',
                        padding: 0
                    }}
                >
                    Reset all
                </button>
            </div>

            {/* Number of stops - Collapsible */}
            <div
                className="stopsCollapse"
                style={{
                    ...fullWidth,
                    borderRadius: "16px",
                    overflow: "hidden",
                }}
            >
                <CustomCollapse>
                    <Panel 
                        header="Number of stops" 
                        key="stops"
                        style={{ border: 'none' }}
                    >
                        <div style={{ padding: '14px 16px 18px' }}>
                            <div
                                className="flight-stops-pills"
                                role="radiogroup"
                                aria-label="Number of stops"
                            >
                                {(numberStops?.length ? numberStops : []).map((opt) => {
                                    const n = parseInt(String(opt.value), 10);
                                    const isActive =
                                        !Number.isNaN(n) &&
                                        selectedMaxConnections === n;
                                    return (
                                        <button
                                            key={String(opt.value)}
                                            type="button"
                                            role="radio"
                                            aria-checked={isActive}
                                            disabled={loading && !numberStops.length}
                                            className={
                                                isActive
                                                    ? "flight-stops-pill flight-stops-pill--active"
                                                    : "flight-stops-pill"
                                            }
                                            onClick={() =>
                                                onMaxConnectionsChange(
                                                    Number.isNaN(n) ? 0 : n,
                                                )
                                            }
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </Panel>
                </CustomCollapse>
            </div>

            {/* Price per seat — Min/Max only (Figma) */}
            <div
                className="pricePerSeatCollapse"
                style={{
                    ...fullWidth,
                    borderRadius: "16px",
                    overflow: "hidden",
                }}
            >
                <CustomCollapse>
                    <Panel
                        header="Price per seat"
                        key="price"
                        style={{ border: "none" }}
                    >
                        <div
                            style={{
                                padding: "0 16px 18px",
                                ...fullWidth,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    gap: "12px",
                                    alignItems: "flex-end",
                                    ...fullWidth,
                                }}
                            >
                                <div style={{ flex: "1 1 0%", minWidth: 0 }}>
                                    <label
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: 300,
                                            color: "#64748B",
                                            display: "block",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        Min
                                    </label>
                                    <div style={priceFieldStyle}>
                                        <span style={aedLabelStyle} aria-hidden>
                                            AED
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            autoComplete="off"
                                            aria-label="Minimum price per seat"
                                            style={priceInputStyle}
                                            value={minStr}
                                            onChange={(e) =>
                                                setMinStr(
                                                    sanitizeDecimal(
                                                        e.target.value,
                                                    ),
                                                )
                                            }
                                            onBlur={() =>
                                                commitMinMax(minStr, maxStr)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    (
                                                        e.target as HTMLInputElement
                                                    ).blur();
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ flex: "1 1 0%", minWidth: 0 }}>
                                    <label
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: 300,
                                            color: "#64748B",
                                            display: "block",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        Max
                                    </label>
                                    <div style={priceFieldStyle}>
                                        <span style={aedLabelStyle} aria-hidden>
                                            AED
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            autoComplete="off"
                                            aria-label="Maximum price per seat"
                                            style={priceInputStyle}
                                            value={maxStr}
                                            onChange={(e) =>
                                                setMaxStr(
                                                    sanitizeDecimal(
                                                        e.target.value,
                                                    ),
                                                )
                                            }
                                            onBlur={() =>
                                                commitMinMax(minStr, maxStr)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    (
                                                        e.target as HTMLInputElement
                                                    ).blur();
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Panel>
                </CustomCollapse>
            </div>

            {/* Refundability — matches `raw.fare.fareType.refundable` */}
            <div
                className="refundableFilterCollapse"
                style={{
                    ...fullWidth,
                    borderRadius: "16px",
                    overflow: "hidden",
                }}
            >
                <CustomCollapse>
                    <Panel
                        header="Refund type"
                        key="refundable"
                        style={{ border: "none" }}
                    >
                        <div style={{ padding: "0 16px 16px 16px" }}>
                            <Radio.Group
                                options={refundableRadioOptions}
                                value={refundableFilterMode}
                                optionType="button"
                                buttonStyle="solid"
                                className="transitHours refundableFilterRadio"
                                onChange={(e) =>
                                    onRefundableFilterChange(
                                        (e?.target?.value ??
                                            "all") as RefundableFilterMode,
                                    )
                                }
                            />
                        </div>
                    </Panel>
                </CustomCollapse>
            </div>

            {/* Transit hours - Collapsible */}
            <div
                className="timeCollapse"
                style={{
                    ...fullWidth,
                    borderRadius: "16px",
                    overflow: "hidden",
                }}
            >
                <CustomCollapse>
                    <Panel
                        header="Transit hours"
                        key="transit"
                        style={{ border: "none" }}
                    >
                        <div style={{ padding: "0 16px 16px 16px" }}>
                            <Radio.Group
                                block
                                options={transitHourOptions}
                                value={selectedTransitRange ?? undefined}
                                optionType="button"
                                buttonStyle="solid"
                                className="transitHours"
                                onChange={(e) =>
                                    onTransitRangeChange?.(e?.target?.value ?? null)
                                }
                            />
                        </div>
                    </Panel>
                </CustomCollapse>
            </div>

            {/* Flight time - Collapsible */}
            <div
                className="flightTimeFilter"
                style={{
                    ...fullWidth,
                    borderRadius: "16px",
                    overflow: "hidden",
                }}
            >
                <CustomCollapse>
                    <Panel 
                        header="Flight time" 
                        key="time"
                        style={{ border: 'none' }}
                    >
                        <div style={{ padding: '12px 16px 18px' }}>
                            <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 300, marginBottom: '8px', marginTop: 0 }}>
                                Departure
                            </p>
                            <div className="departureArrival" style={{ marginBottom: '14px' }}>
                                <button
                                    type="button"
                                    className="timeBox"
                                    onClick={() => openTimePicker("depStart")}
                                    style={{ textAlign: "left", background: "#FFFFFF" }}
                                >
                                    {toDisplayTime(departureFlightRange.start)}
                                </button>
                                <span style={{ fontSize: "24px", color: "#0F172A", lineHeight: 1 }}>→</span>
                                <button
                                    type="button"
                                    className="timeBox"
                                    onClick={() => openTimePicker("depEnd")}
                                    style={{ textAlign: "left", background: "#FFFFFF" }}
                                >
                                    {toDisplayTime(departureFlightRange.end)}
                                </button>
                                <input
                                    ref={(el) => {
                                        timeRefs.current.depStart = el;
                                    }}
                                    type="time"
                                    value={departureFlightRange.start || ""}
                                    onChange={(e) =>
                                        onDepartureRangeChange({ start: e.target.value || "" })
                                    }
                                    style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
                                />
                                <input
                                    ref={(el) => {
                                        timeRefs.current.depEnd = el;
                                    }}
                                    type="time"
                                    value={departureFlightRange.end || ""}
                                    onChange={(e) =>
                                        onDepartureRangeChange({ end: e.target.value || "" })
                                    }
                                    style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
                                />
                            </div>

                            <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 300, marginBottom: '8px', marginTop: 0 }}>
                                Arrival
                            </p>
                            <div className="departureArrival">
                                <button
                                    type="button"
                                    className="timeBox"
                                    onClick={() => openTimePicker("arrStart")}
                                    style={{ textAlign: "left", background: "#FFFFFF" }}
                                >
                                    {toDisplayTime(arrivalFlightRange.start)}
                                </button>
                                <span style={{ fontSize: "24px", color: "#0F172A", lineHeight: 1 }}>→</span>
                                <button
                                    type="button"
                                    className="timeBox"
                                    onClick={() => openTimePicker("arrEnd")}
                                    style={{ textAlign: "left", background: "#FFFFFF" }}
                                >
                                    {toDisplayTime(arrivalFlightRange.end)}
                                </button>
                                <input
                                    ref={(el) => {
                                        timeRefs.current.arrStart = el;
                                    }}
                                    type="time"
                                    value={arrivalFlightRange.start || ""}
                                    onChange={(e) =>
                                        onArrivalRangeChange({ start: e.target.value || "" })
                                    }
                                    style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
                                />
                                <input
                                    ref={(el) => {
                                        timeRefs.current.arrEnd = el;
                                    }}
                                    type="time"
                                    value={arrivalFlightRange.end || ""}
                                    onChange={(e) =>
                                        onArrivalRangeChange({ end: e.target.value || "" })
                                    }
                                    style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
                                />
                            </div>
                        </div>
                    </Panel>
                </CustomCollapse>
            </div>

            {/* Airlines - Collapsible */}
            <div
                className="timeCollapse"
                style={{
                    ...fullWidth,
                    borderRadius: "16px",
                    overflow: "hidden",
                }}
            >
                <CustomCollapse>
                    <Panel 
                        header="Airlines" 
                        key="airlines"
                        style={{ border: 'none' }}
                    >
                        <div style={{ padding: '0 16px 16px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {airline.map((a) => (
                                    <Checkbox
                                        key={a.id}
                                        className="baggageCheckbox"
                                        disabled={loading && !airline.length}
                                        onChange={(e: any) => onAirlineToggle(a.code, e?.target?.checked ?? !!e)}
                                        checked={selectedAirlineIds.includes(a.code)}
                                    >
                                        {a.label}
                                    </Checkbox>
                                ))}
                            </div>
                        </div>
                    </Panel>
                </CustomCollapse>
            </div>

            {/* Baggage - Collapsible */}
            <div
                style={{
                    ...fullWidth,
                    borderRadius: "16px",
                    overflow: "hidden",
                }}
            >
                <CustomCollapse>
                    <Panel 
                        header="Baggage" 
                        key="baggage"
                        style={{ border: 'none' }}
                    >
                        <div style={{ padding: '0 16px 16px 16px' }}>
                            <Checkbox
                                className="baggageCheckbox"
                                checked={baggageIncludedOnly}
                                onChange={(e) =>
                                    onBaggageIncludedChange(e.target.checked)
                                }
                                disabled={loading && !baggage.length}
                            >
                                {(baggage && baggage[0]?.label) || "Checked baggage included"}
                            </Checkbox>
                        </div>
                    </Panel>
                </CustomCollapse>
            </div>

            {/* Ancillaries — same pattern as Baggage */}
            <div
                style={{
                    ...fullWidth,
                    borderRadius: "16px",
                    overflow: "hidden",
                }}
            >
                <CustomCollapse>
                    <Panel header="Ancillaries" key="ancillaries" style={{ border: "none" }}>
                        <div style={{ padding: "0 16px 16px 16px" }}>
                            <Checkbox
                                className="baggageCheckbox"
                                checked={ancillaryAddOnsOnly}
                                onChange={(e) =>
                                    onAncillaryAddOnsOnlyChange(e.target.checked)
                                }
                            >
                                Add-ons available
                            </Checkbox>
                        </div>
                    </Panel>
                </CustomCollapse>
            </div>
        </div>
    );
};

export default FlightSearchFilter;
