import React from "react";
import { Radio, Checkbox, Slider, Collapse } from "antd";
import type { CheckboxProps } from "antd";
import CustomCollapse from "../common/CustomCollapse";
import {
  minutesToHHMM,
  minutesToTime,
  timeToMinutes,
} from "../../utils/helpers";

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
  //   openTimePicker,
  //   timeRefs,

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
    )
      cnt++;
    if (Number(selectedMaxConnections || 0) > 0) cnt++;
    if (departureFlightRange?.start || "" || departureFlightRange?.end || "")
      cnt++;
    if (arrivalFlightRange?.start || "" || arrivalFlightRange?.end || "") cnt++;
    if ((selectedAirlineIds || []).length > 0) cnt++;
    return cnt;
  })();

  return (
    <div
      className="filterSectionStyle"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "280px",
      }}
    >
      {/* Sort by - Direct render without extra wrapper */}
      <div style={{ width: "280px" }}>{headerContent}</div>

      {/* Filters Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 4px",
        }}
      >
        <h4
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#0F172A",
            margin: 0,
          }}
        >
          Filters
          <span style={{ margin: "0 8px", color: "#64748B" }}>•</span>
          <span style={{ fontSize: "14px", fontWeight: 400, color: "#64748B" }}>
            {activeCount} Active
          </span>
        </h4>
        <button
          onClick={onReset}
          style={{
            background: "none",
            border: "none",
            color: "#2351A3",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            padding: 0,
          }}
        >
          Reset all
        </button>
      </div>

      {/* Number of stops - Collapsible */}
      <div
        style={{
          width: "280px",
          borderRadius: "16px",
          // border: '1.5px solid #C2CAD6',
          // background: '#F2F2F3',
          overflow: "hidden",
        }}
      >
        <CustomCollapse>
          <Panel
            header="Number of stops"
            key="stops"
            style={{ border: "none" }}
          >
            <div style={{ padding: "0 16px 16px 16px" }}>
              <Radio.Group
                block
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

      {/* Price per seat - Collapsible */}
      <div
        style={{
          width: "280px",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <CustomCollapse>
          <Panel header="Price per seat" key="price" style={{ border: "none" }}>
            <div style={{ padding: "0 16px 16px 16px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: "12px",
                      color: "#64748B",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Min
                  </label>
                  <div
                    style={{
                      border: "1.5px solid #C2CAD6",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      background: "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#0F172A",
                    }}
                  >
                    ${selectedPriceRange[0]}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: "12px",
                      color: "#64748B",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Max
                  </label>
                  <div
                    style={{
                      border: "1.5px solid #C2CAD6",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      background: "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#0F172A",
                    }}
                  >
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
                  track: { background: "#2351A3" },
                  tracks: { background: "#2351A3" },
                }}
              />
            </div>
          </Panel>
        </CustomCollapse>
      </div>

      {/* Transit hours - Collapsible (conditional) */}
      {Number(selectedMaxConnections || 0) > 0 && (
        <div
          style={{
            width: "280px",
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
                  options={
                    transitHours && transitHours.length ? transitHours : []
                  }
                  value={selectedTransitRange ?? undefined}
                  optionType="button"
                  buttonStyle="solid"
                  className="transitHours"
                  disabled={loading && !transitHours.length}
                  onChange={(e) =>
                    onTransitRangeChange?.(e?.target?.value ?? null)
                  }
                />
              </div>
            </Panel>
          </CustomCollapse>
        </div>
      )}

      {/* Flight time - Collapsible */}
      <div
        style={{
          width: "280px",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <CustomCollapse>
          <Panel header="Flight time" key="time" style={{ border: "none" }}>
            <div style={{ padding: "0 16px 16px 16px" }}>
              {/* Departure */}
              <p
                style={{
                  fontSize: "12px",
                  color: "#64748B",
                  fontWeight: 500,
                  marginBottom: "4px",
                  marginTop: 0,
                }}
              >
                Departure
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span>
                  {minutesToTime(
                    timeToMinutes(departureFlightRange.start || "00:00"),
                  )}
                </span>
                <span>
                  {minutesToTime(
                    timeToMinutes(departureFlightRange.end || "23:59"),
                  )}
                </span>
              </div>
              <Slider
                range
                min={0}
                max={1439}
                step={15}
                value={[
                  timeToMinutes(departureFlightRange.start || "00:00"),
                  timeToMinutes(departureFlightRange.end || "23:59"),
                ]}
                onChange={(val: number[]) =>
                  onDepartureRangeChange({
                    start: minutesToHHMM(val[0]),
                    end: minutesToHHMM(val[1]),
                  })
                }
                tooltip={{
                  formatter: (val?: number) =>
                    val !== undefined ? minutesToTime(val) : "",
                }}
                styles={{
                  track: { background: "#2351A3" },
                  tracks: { background: "#2351A3" },
                }}
              />

              {/* Arrival */}
              <p
                style={{
                  fontSize: "12px",
                  color: "#64748B",
                  fontWeight: 500,
                  marginBottom: "4px",
                  marginTop: "12px",
                }}
              >
                Arrival
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span>
                  {minutesToTime(
                    timeToMinutes(arrivalFlightRange.start || "00:00"),
                  )}
                </span>
                <span>
                  {minutesToTime(
                    timeToMinutes(arrivalFlightRange.end || "23:59"),
                  )}
                </span>
              </div>
              <Slider
                range
                min={0}
                max={1439}
                step={15}
                value={[
                  timeToMinutes(arrivalFlightRange.start || "00:00"),
                  timeToMinutes(arrivalFlightRange.end || "23:59"),
                ]}
                onChange={(val: number[]) =>
                  onArrivalRangeChange({
                    start: minutesToHHMM(val[0]),
                    end: minutesToHHMM(val[1]),
                  })
                }
                tooltip={{
                  formatter: (val?: number) =>
                    val !== undefined ? minutesToTime(val) : "",
                }}
                styles={{
                  track: { background: "#2351A3" },
                  tracks: { background: "#2351A3" },
                }}
              />
            </div>
            {/* <div style={{ padding: '0 16px 16px 16px' }}>
                            <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, marginBottom: '8px', marginTop: 0 }}>
                                Departure
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <input
                                    type="time"
                                    className="timeBox"
                                    style={{
                                        flex: 1,
                                        height: '40px',
                                        border: '1.5px solid #C2CAD6',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        color: '#0F172A',
                                        background: '#FFFFFF'
                                    }}
                                    ref={(el) => {
                                        timeRefs.current["departureFlightStartTime"] = el;
                                    }}
                                    onClick={() => openTimePicker("departureFlightStartTime")}
                                    onChange={(e) =>
                                        onDepartureRangeChange({ start: e.target.value, end: departureFlightRange.end })
                                    }
                                />
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#3D495C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <input
                                    type="time"
                                    className="timeBox"
                                    style={{
                                        flex: 1,
                                        height: '40px',
                                        border: '1.5px solid #C2CAD6',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        color: '#0F172A',
                                        background: '#FFFFFF'
                                    }}
                                    ref={(el) => {
                                        timeRefs.current["departureFlightEndTime"] = el;
                                    }}
                                    onClick={() => openTimePicker("departureFlightEndTime")}
                                    onChange={(e) =>
                                        onDepartureRangeChange({ start: departureFlightRange.start, end: e.target.value })
                                    }
                                />
                            </div>

                            <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 500, marginBottom: '8px', marginTop: 0 }}>
                                Arrival
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="time"
                                    className="timeBox"
                                    style={{
                                        flex: 1,
                                        height: '40px',
                                        border: '1.5px solid #C2CAD6',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        color: '#0F172A',
                                        background: '#FFFFFF'
                                    }}
                                    ref={(el) => {
                                        timeRefs.current["arrivalFlightStartTime"] = el;
                                    }}
                                    onClick={() => openTimePicker("arrivalFlightStartTime")}
                                    onChange={(e) => onArrivalRangeChange({ start: e.target.value, end: arrivalFlightRange.end })}
                                />
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#3D495C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <input
                                    type="time"
                                    className="timeBox"
                                    style={{
                                        flex: 1,
                                        height: '40px',
                                        border: '1.5px solid #C2CAD6',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        color: '#0F172A',
                                        background: '#FFFFFF'
                                    }}
                                    ref={(el) => {
                                        timeRefs.current["arrivalFlightEndTime"] = el;
                                    }}
                                    onClick={() => openTimePicker("arrivalFlightEndTime")}
                                    onChange={(e) => onArrivalRangeChange({ start: arrivalFlightRange.start, end: e.target.value })}
                                />
                            </div>
                        </div> */}
          </Panel>
        </CustomCollapse>
      </div>

      {/* Airlines - Collapsible */}
      <div
        style={{
          width: "280px",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <CustomCollapse>
          <Panel header="Airlines" key="airlines" style={{ border: "none" }}>
            <div style={{ padding: "0 16px 16px 16px" }}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {airline.map((a) => (
                  <Checkbox
                    key={a.id}
                    className="baggageCheckbox"
                    disabled={loading && !airline.length}
                    onChange={(e: any) =>
                      onAirlineToggle(a.code, e?.target?.checked ?? !!e)
                    }
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
          width: "280px",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <CustomCollapse>
          <Panel header="Baggage" key="baggage" style={{ border: "none" }}>
            <div style={{ padding: "0 16px 16px 16px" }}>
              <Checkbox
                className="baggageCheckbox"
                onChange={baggageHandler}
                disabled={loading && !baggage.length}
              >
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
