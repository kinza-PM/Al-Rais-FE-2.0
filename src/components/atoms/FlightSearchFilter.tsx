import React from "react";
import { Radio, Checkbox, Slider, Collapse } from "antd";
import type { CheckboxProps } from "antd";
import CustomCollapse from "../common/CustomCollapse";

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
    baggageHandler?: CheckboxProps["onChange"];

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
    onReset?: () => void;
};

const FlightSearchFilter: React.FC<FlightSearchFilterProps> = ({
    loading,
    headerContent,
    priceRangeBounds,
    selectedPriceRange,
    priceStep,
    onPriceRangeChange,

    numberStops,
    selectedMaxConnections,
    onMaxConnectionsChange,

    baggage,
    baggageHandler,

    transitHours,
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
    onReset,
}) => {
    const timeToSliderValue = (time: string | undefined, roundUp = false): number => {
        if (!time) return roundUp ? 1440 : 0;
        const [h, m] = time.split(':').map(Number);
        const mins = (h || 0) * 60 + (m || 0);
        const step = roundUp ? Math.ceil(mins / 30) * 30 : Math.floor(mins / 30) * 30;
        return Math.min(1440, Math.max(0, step));
    };

    const activeCount = (() => {
        let cnt = 0;
        if (
            selectedPriceRange[0] !== priceRangeBounds[0] ||
            selectedPriceRange[1] !== priceRangeBounds[1]
        ) cnt++;
        if (Number(selectedMaxConnections || 0) > 0) cnt++;
        if ((departureFlightRange?.start || "") || (departureFlightRange?.end || "")) cnt++;
        if ((arrivalFlightRange?.start || "") || (arrivalFlightRange?.end || "")) cnt++;
        if ((selectedAirlineIds || []).length > 0) cnt++;
        return cnt;
    })();

    return (
        <div className="filterSectionStyle" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '280px' }}>
            {/* Sort by - Direct render without extra wrapper */}
            <div style={{ width: '280px' }}>
                {headerContent}
            </div>

            {/* Filters Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                    Filters
                    <span style={{ margin: '0 8px', color: '#64748B' }}>•</span>
                    <span style={{ fontSize: '14px', fontWeight: 400, color: '#64748B' }}>{activeCount} Active</span>
                </h4>
                <button 
                    onClick={onReset}
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#2351A3', 
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        padding: 0
                    }}
                >
                    Reset all
                </button>
            </div>

            {/* Number of stops - Collapsible */}
            <div className="stopsCollapse" style={{ 
                width: '280px',
                borderRadius: '16px',
                background: '#F2F2F3',
                overflow: 'hidden',
                border: '1.5px solid #E4E4E7'
            }}>
                <CustomCollapse>
                    <Panel 
                        header="Number of stops" 
                        key="stops"
                        style={{ border: 'none', background: '#F2F2F3' }}
                    >
                        <div style={{ padding: '14px 16px 18px', background: '#F2F2F3' }}>
                            <Radio.Group
                                options={numberStops && numberStops.length ? numberStops : []}
                                value={String(selectedMaxConnections)}
                                optionType="button"
                                buttonStyle="solid"
                                className="stopsRadioStyle"
                                disabled={loading && !numberStops.length}
                                onChange={(e) => onMaxConnectionsChange(e?.target?.value ?? e)}
                            />
                        </div>
                    </Panel>
                </CustomCollapse>
            </div>

            {/* Price per person - Collapsible */}
            <div style={{ 
                width: '280px',
                borderRadius: '16px',
                overflow: 'hidden'
            }}>
                <CustomCollapse>
                    <Panel 
                        header="Price per person" 
                        key="price"
                        style={{ border: 'none' }}
                    >
                        <div style={{ padding: '0 16px 16px 16px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '6px' }}>Min</label>
                                    <div style={{ 
                                        border: '1.5px solid #C2CAD6',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        background: '#FFFFFF',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: '#0F172A'
                                    }}>
                                        ${selectedPriceRange[0]}
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '6px' }}>Max</label>
                                    <div style={{ 
                                        border: '1.5px solid #C2CAD6',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        background: '#FFFFFF',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: '#0F172A'
                                    }}>
                                        ${selectedPriceRange[1]}
                                    </div>
                                </div>
                            </div>
                            <Slider
                                range
                                defaultValue={[priceRangeBounds[0], priceRangeBounds[1]]}
                                aria-label="price-range-slider"
                                min={priceRangeBounds[0]}
                                max={priceRangeBounds[1]}
                                step={priceStep}
                                value={selectedPriceRange}
                                onChange={(val) => onPriceRangeChange(val as [number, number])}
                                styles={{
                                    track: { background: '#2351A3' },
                                    tracks: { background: '#2351A3' }
                                }}
                            />
                        </div>
                    </Panel>
                </CustomCollapse>
            </div>

            {/* Transit hours - Collapsible (conditional) */}
            {Number(selectedMaxConnections || 0) > 0 && (
                <div className="timeCollapse" style={{ 
                    width: '280px',
                    borderRadius: '16px',
                    overflow: 'hidden'
                }}>
                    <CustomCollapse>
                        <Panel 
                            header="Transit hours" 
                            key="transit"
                            style={{ border: 'none' }}
                        >
                            <div style={{ padding: '0 16px 16px 16px' }}>
                                <Radio.Group
                                    block
                                    options={transitHours && transitHours.length ? transitHours : []}
                                    value={selectedTransitRange ?? undefined}
                                    optionType="button"
                                    buttonStyle="solid"
                                    className="transitHours"
                                    disabled={loading && !transitHours.length}
                                    onChange={(e) => onTransitRangeChange?.(e?.target?.value ?? null)}
                                />
                            </div>
                        </Panel>
                    </CustomCollapse>
                </div>
            )}

            {/* Flight time - Collapsible (FL201: Slider + time inputs for preferred departure/arrival) */}
            <div className="flightTimeFilter" style={{ 
                width: '280px',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#F2F2F3',
                border: '1.5px solid #E4E4E7'
            }}>
                <CustomCollapse>
                    <Panel 
                        header="Preferred departure & arrival time" 
                        key="time"
                        style={{ border: 'none', background: '#F2F2F3' }}
                    >
                        <div style={{ padding: '14px 16px 18px', background: '#F2F2F3' }}>
                            <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '10px', marginTop: 0 }}>
                                Departure time range
                            </p>
                            <div style={{ marginBottom: '16px' }}>
                                <Slider
                                    range
                                    min={0}
                                    max={1440}
                                    step={30}
                                    value={[
                                        timeToSliderValue(departureFlightRange.start, false),
                                        timeToSliderValue(departureFlightRange.end, true)
                                    ]}
                                    onChange={([a, b]) => {
                                        const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
                                        onDepartureRangeChange({ start: toTime(a), end: toTime(b) });
                                    }}
                                    tooltip={{ formatter: (v) => `${String(Math.floor(Number(v) / 60)).padStart(2, '0')}:${String(Number(v) % 60).padStart(2, '0')}` }}
                                    style={{ marginBottom: 8 }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                                    <span>{departureFlightRange.start || '00:00'}</span>
                                    <span>{departureFlightRange.end || '24:00'}</span>
                                </div>
                            </div>

                            <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '10px', marginTop: 0 }}>
                                Arrival time range
                            </p>
                            <div>
                                <Slider
                                    range
                                    min={0}
                                    max={1440}
                                    step={30}
                                    value={[
                                        timeToSliderValue(arrivalFlightRange.start, false),
                                        timeToSliderValue(arrivalFlightRange.end, true)
                                    ]}
                                    onChange={([a, b]) => {
                                        const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
                                        onArrivalRangeChange({ start: toTime(a), end: toTime(b) });
                                    }}
                                    tooltip={{ formatter: (v) => `${String(Math.floor(Number(v) / 60)).padStart(2, '0')}:${String(Number(v) % 60).padStart(2, '0')}` }}
                                    style={{ marginBottom: 8 }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                                    <span>{arrivalFlightRange.start || '00:00'}</span>
                                    <span>{arrivalFlightRange.end || '24:00'}</span>
                                </div>
                            </div>
                        </div>
                    </Panel>
                </CustomCollapse>
            </div>

            {/* Airlines - Collapsible */}
            <div className="timeCollapse" style={{ 
                width: '280px',
                borderRadius: '16px',
                overflow: 'hidden'
            }}>
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
            <div style={{ 
                width: '280px',
                borderRadius: '16px',
                overflow: 'hidden'
            }}>
                <CustomCollapse>
                    <Panel 
                        header="Baggage" 
                        key="baggage"
                        style={{ border: 'none' }}
                    >
                        <div style={{ padding: '0 16px 16px 16px' }}>
                            <Checkbox className="baggageCheckbox" onChange={baggageHandler} disabled={loading && !baggage.length}>
                                {(baggage && baggage[0]?.label) || "Checked baggage included"}
                            </Checkbox>
                        </div>
                    </Panel>
                </CustomCollapse>
            </div>
        </div>
    );
};

export default FlightSearchFilter;
