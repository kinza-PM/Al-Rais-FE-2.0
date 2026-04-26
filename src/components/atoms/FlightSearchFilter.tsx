import React from "react";
import { Radio, Checkbox, Collapse } from "antd";
import CustomCollapse from "../common/CustomCollapse";
import TailiwindCustomTimePicker from "../common/TailiwindCustomTimePicker";
import { refundableFilterModeFromCheckboxes } from "../../utils/flightFilters";

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

    // airlines
    airline: { id: string | number; label: string; code: string }[];
    selectedAirlineIds: string[];
    onAirlineToggle: (code: string, checked: boolean) => void;
    /** When true, list only offers with `detail.ancillaryDetailsAvailable` */
    ancillaryAddOnsOnly: boolean;
    onAncillaryAddOnsOnlyChange: (checked: boolean) => void;

    /** Refund type: checkboxes map to filter via `refundableFilterModeFromCheckboxes` */
    refundFilterRefundable: boolean;
    refundFilterNonRefundable: boolean;
    onRefundFilterRefundableChange: (checked: boolean) => void;
    onRefundFilterNonRefundableChange: (checked: boolean) => void;

    onReset?: () => void;
};

const FlightSearchFilter: React.FC<FlightSearchFilterProps> = ({
    loading,
    headerContent,
    priceRangeBounds,
    selectedPriceRange,
    priceStep: _priceStep,
    onPriceRangeChange: _onPriceRangeChange,

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

    airline,
    selectedAirlineIds,
    onAirlineToggle,
    ancillaryAddOnsOnly,
    onAncillaryAddOnsOnlyChange,

    refundFilterRefundable,
    refundFilterNonRefundable,
    onRefundFilterRefundableChange,
    onRefundFilterNonRefundableChange,

    onReset,
}) => {
    const fullWidth: React.CSSProperties = {
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
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
        if (
            refundableFilterModeFromCheckboxes(
                refundFilterRefundable,
                refundFilterNonRefundable,
            ) !== "all"
        )
            cnt++;
        return cnt;
    })();

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

            {/* Filter blocks (alternate background like Figma) */}
            <div className="flight-filter-blocks" style={fullWidth}>
                {/* Number of stops - Collapsible */}
                <div
                    className="flight-filter-block stopsCollapse"
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
            {/* <div
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
            </div> */}

            {/* Refundability — matches `raw.fare.fareType.refundable` */}
                <div
                    className="flight-filter-block refundableFilterCollapse"
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
                            <div
                                style={{
                                    padding: "0 16px 16px 16px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                }}
                            >
                                <Checkbox
                                    className="baggageCheckbox"
                                    checked={refundFilterRefundable}
                                    onChange={(e) =>
                                        onRefundFilterRefundableChange(
                                            e.target.checked,
                                        )
                                    }
                                    disabled={loading}
                                >
                                    Refundable
                                </Checkbox>
                                <Checkbox
                                    className="baggageCheckbox"
                                    checked={refundFilterNonRefundable}
                                    onChange={(e) =>
                                        onRefundFilterNonRefundableChange(
                                            e.target.checked,
                                        )
                                    }
                                    disabled={loading}
                                >
                                    Non-refundable
                                </Checkbox>
                            </div>
                        </Panel>
                    </CustomCollapse>
                </div>

            {/* Transit hours - Collapsible */}
                <div
                    className="flight-filter-block timeCollapse"
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
                    className="flight-filter-block flightTimeFilter"
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
                                    <TailiwindCustomTimePicker
                                        value={departureFlightRange.start || ""}
                                        onChange={(hhmm) =>
                                            onDepartureRangeChange({ start: hhmm || "" })
                                        }
                                        placeholder="--:--"
                                        panelTitle="Departure from"
                                        overridesClass
                                        wrapperClassName="min-w-0 flex-1"
                                        inputClass="timeBox w-full cursor-pointer text-left bg-white"
                                    />
                                    <span style={{ fontSize: "24px", color: "#0F172A", lineHeight: 1 }}>→</span>
                                    <TailiwindCustomTimePicker
                                        value={departureFlightRange.end || ""}
                                        onChange={(hhmm) =>
                                            onDepartureRangeChange({ end: hhmm || "" })
                                        }
                                        placeholder="--:--"
                                        panelTitle="Departure to"
                                        overridesClass
                                        wrapperClassName="min-w-0 flex-1"
                                        inputClass="timeBox w-full cursor-pointer text-left bg-white"
                                    />
                                </div>

                                <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 300, marginBottom: '8px', marginTop: 0 }}>
                                    Arrival
                                </p>
                                <div className="departureArrival">
                                    <TailiwindCustomTimePicker
                                        value={arrivalFlightRange.start || ""}
                                        onChange={(hhmm) =>
                                            onArrivalRangeChange({ start: hhmm || "" })
                                        }
                                        placeholder="--:--"
                                        panelTitle="Arrival from"
                                        overridesClass
                                        wrapperClassName="min-w-0 flex-1"
                                        inputClass="timeBox w-full cursor-pointer text-left bg-white"
                                    />
                                    <span style={{ fontSize: "24px", color: "#0F172A", lineHeight: 1 }}>→</span>
                                    <TailiwindCustomTimePicker
                                        value={arrivalFlightRange.end || ""}
                                        onChange={(hhmm) =>
                                            onArrivalRangeChange({ end: hhmm || "" })
                                        }
                                        placeholder="--:--"
                                        panelTitle="Arrival to"
                                        overridesClass
                                        wrapperClassName="min-w-0 flex-1"
                                        inputClass="timeBox w-full cursor-pointer text-left bg-white"
                                    />
                                </div>
                            </div>
                        </Panel>
                    </CustomCollapse>
                </div>

            {/* Airlines - Collapsible */}
                <div
                    className="flight-filter-block timeCollapse"
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
                    className="flight-filter-block"
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
                                    {"Checked Baggage Included"}
                                    {/* {(baggage && baggage[0]?.label) || "Checked Baggage Included"} */}
                                </Checkbox>
                            </div>
                        </Panel>
                    </CustomCollapse>
                </div>

            {/* Ancillaries — same pattern as Baggage */}
                <div
                    className="flight-filter-block"
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
        </div>
    );
};

export default FlightSearchFilter;
