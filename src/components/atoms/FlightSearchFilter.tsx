import React from "react";
import { Collapse, Radio, Checkbox, Slider } from "antd";
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
        <div className="filterSectionStyle">
            <div className="">
                <CustomCollapse>
                    <Panel header={headerContent} key="price">
                        <Slider
                            range
                            defaultValue={[priceRangeBounds[0], priceRangeBounds[1]]}
                            aria-label="price-range-slider"
                            min={priceRangeBounds[0]}
                            max={priceRangeBounds[1]}
                            step={priceStep}
                            value={selectedPriceRange}
                            onChange={(val) => onPriceRangeChange(val as [number, number])}
                        />
                    </Panel>
                </CustomCollapse>
            </div>

            <div className="filterStyle">
                <div className="filterHeading">
                    <div>
                        <h4>
                            Filters
                            <span className="smallDot">•</span>
                            <span className="lightActiveText">{activeCount} Active</span>
                        </h4>
                    </div>
                    <div className="resetAllBtn" onClick={onReset}>
                        <a href="#">Reset all</a>
                    </div>
                </div>

                <CustomCollapse>
                    <Panel header="Number of stops" key="stops">
                        <Radio.Group
                            block
                            options={numberStops && numberStops.length ? numberStops : [{ label: "0", value: "0" }]}
                            value={String(selectedMaxConnections)}
                            optionType="button"
                            buttonStyle="solid"
                            className="stopsRadioStyle"
                            disabled={loading && !numberStops.length}
                            onChange={(e) => onMaxConnectionsChange(e?.target?.value ?? e)}
                        />
                    </Panel>
                </CustomCollapse>

                <CustomCollapse>
                    <Panel header="Baggage" key="baggage">
                        <Checkbox className="baggageCheckbox" onChange={baggageHandler} disabled={loading && !baggage.length}>
                            {(baggage && baggage[0]?.label) || "Checked baggage included"}
                        </Checkbox>
                    </Panel>
                </CustomCollapse>

                <CustomCollapse>
                    <Panel header="Transit hours" key="transit">
                        <Radio.Group
                            block
                            options={transitHours && transitHours.length ? transitHours : [{ label: "0-3h", value: "0-3h" }]}
                            defaultValue={(transitHours && transitHours[0]?.value) ?? "0-3h"}
                            optionType="button"
                            buttonStyle="solid"
                            className="transitHours"
                            disabled={loading && !transitHours.length}
                        />
                    </Panel>
                </CustomCollapse>

                <CustomCollapse>
                    <Panel header="Flight time" key="time">
                        <p className="departureArrivalHeading" style={{ paddingTop: 0 }}>
                            Departure
                        </p>
                        <div className="departureArrival">
                            <input
                                type="time"
                                className="timeBox"
                                ref={(el) => {
                                    timeRefs.current["departureFlightStartTime"] = el;
                                }}
                                onClick={() => openTimePicker("departureFlightStartTime")}
                                onChange={(e) =>
                                    onDepartureRangeChange({ start: e.target.value, end: departureFlightRange.end })
                                }
                            />
                            <div className="rightArrow" />
                            <input
                                type="time"
                                className="timeBox"
                                ref={(el) => {
                                    timeRefs.current["departureFlightEndTime"] = el;
                                }}
                                onClick={() => openTimePicker("departureFlightEndTime")}
                                onChange={(e) =>
                                    onDepartureRangeChange({ start: departureFlightRange.start, end: e.target.value })
                                }
                            />
                        </div>

                        <p className="departureArrivalHeading">Arrival</p>
                        <div className="departureArrival">
                            <input
                                type="time"
                                className="timeBox"
                                ref={(el) => {
                                    timeRefs.current["arrivalFlightStartTime"] = el;
                                }}
                                onClick={() => openTimePicker("arrivalFlightStartTime")}
                                onChange={(e) => onArrivalRangeChange({ start: e.target.value, end: arrivalFlightRange.end })}
                            />
                            <div className="rightArrow" />
                            <input
                                type="time"
                                className="timeBox"
                                ref={(el) => {
                                    timeRefs.current["arrivalFlightEndTime"] = el;
                                }}
                                onClick={() => openTimePicker("arrivalFlightEndTime")}
                                onChange={(e) => onArrivalRangeChange({ start: arrivalFlightRange.start, end: e.target.value })}
                            />
                        </div>
                    </Panel>
                </CustomCollapse>

                <CustomCollapse>
                    <Panel header="Airlines" key="airlines">
                        <div className="flex flex-col gap-2">
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
                    </Panel>
                </CustomCollapse>
            </div>
        </div>
    );
};

export default FlightSearchFilter;


