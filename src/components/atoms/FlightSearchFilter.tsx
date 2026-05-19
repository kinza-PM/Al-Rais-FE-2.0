import React from "react";
import { Checkbox, Collapse } from "antd";
import CustomCollapse from "../common/CustomCollapse";
import TailiwindCustomTimePicker from "../common/TailiwindCustomTimePicker";
import { refundableFilterModeFromCheckboxes } from "../../utils/flightFilters";
import PricePerSeatHistogramSlider from "./PricePerSeatHistogramSlider";

const { Panel } = Collapse;

export type FlightSearchFilterProps = {
  loading: boolean;
  headerContent: React.ReactNode;
  priceRangeBounds: [number, number];
  selectedPriceRange: [number, number];
  priceStep: number;
  onPriceRangeChange: (next: [number, number]) => void;
  priceCurrencyCode?: string;
  priceHistogramFares?: number[];

  numberStops: { label: string; value: string }[];
  selectedMaxConnections: number;
  onMaxConnectionsChange: (next: number) => void;

  baggage: { label: string; value: string }[];
  baggageIncludedOnly: boolean;
  onBaggageIncludedChange: (checked: boolean) => void;

  transitHours: { label: string; value: string }[];
  selectedTransitRange?: string | null;
  onTransitRangeChange?: (value: string | null) => void;

  departureFlightRange: { start: string; end: string };
  arrivalFlightRange: { start: string; end: string };
  onDepartureRangeChange: (next: { start?: string; end?: string }) => void;
  onArrivalRangeChange: (next: { start?: string; end?: string }) => void;

  airline: { id: string | number; label: string; code: string }[];
  selectedAirlineIds: string[];
  onAirlineToggle: (code: string, checked: boolean) => void;
  ancillaryAddOnsOnly: boolean;
  onAncillaryAddOnsOnlyChange: (checked: boolean) => void;

  refundFilterRefundable: boolean;
  refundFilterNonRefundable: boolean;
  onRefundFilterRefundableChange: (checked: boolean) => void;
  onRefundFilterNonRefundableChange: (checked: boolean) => void;

  onReset?: () => void;
};

const fullWidth: React.CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
};

const FlightSearchFilter: React.FC<FlightSearchFilterProps> = ({
  loading,
  headerContent,
  priceRangeBounds,
  selectedPriceRange,
  priceStep,
  onPriceRangeChange,
  priceCurrencyCode = "$",
  priceHistogramFares = [],

  numberStops,
  selectedMaxConnections,
  onMaxConnectionsChange,

  baggage,
  baggageIncludedOnly,
  onBaggageIncludedChange,

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
  const activeCount = (() => {
    let cnt = 0;
    if (
      selectedPriceRange[0] !== priceRangeBounds[0] ||
      selectedPriceRange[1] !== priceRangeBounds[1]
    )
      cnt++;
    if (Number(selectedMaxConnections || 0) > 0) cnt++;
    if (selectedTransitRange) cnt++;
    if (departureFlightRange?.start || departureFlightRange?.end) cnt++;
    if (arrivalFlightRange?.start || arrivalFlightRange?.end) cnt++;
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
    { label: "12h+", value: "12h+" },
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
      <div style={fullWidth}>{headerContent}</div>

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
            fontWeight: 300,
            color: "#0F172A",
            margin: 0,
          }}
        >
          Filters
          {activeCount > 0 ? (
            <>
              <span style={{ margin: "0 8px", color: "#64748B" }}>•</span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 300,
                  color: "#64748B",
                }}
              >
                {activeCount} Active
              </span>
            </>
          ) : null}
        </h4>
        <button
          type="button"
          onClick={onReset}
          style={{
            background: "none",
            border: "none",
            color: "#2351A3",
            fontSize: "14px",
            fontWeight: 300,
            cursor: "pointer",
            padding: 0,
          }}
        >
          Reset all
        </button>
      </div>

      <div className="flight-filter-blocks" style={fullWidth}>
        <div
          className="flight-filter-block stopsCollapse mx-auto w-full max-w-[307px]"
          style={{ ...fullWidth, overflow: "hidden" }}
        >
          <CustomCollapse>
            <Panel
              header="Number of stops"
              key="stops"
              style={{ border: "none" }}
            >
              <div style={{ padding: "14px 16px 16px" }}>
                <div
                  className="flight-stops-pills"
                  role="radiogroup"
                  aria-label="Number of stops"
                >
                  {(numberStops?.length ? numberStops : []).map((opt) => {
                    const n = parseInt(String(opt.value), 10);
                    const isActive =
                      !Number.isNaN(n) && selectedMaxConnections === n;
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
                          onMaxConnectionsChange(Number.isNaN(n) ? 0 : n)
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

        <div
          className="flight-filter-block pricePerSeatCollapse mx-auto w-full max-w-[307px]"
          style={{ ...fullWidth, overflow: "hidden" }}
        >
          <CustomCollapse>
            <Panel
              header="Price per seat"
              key="price"
              style={{ border: "none" }}
            >
              <div style={{ padding: "8px 0 16px" }}>
                <PricePerSeatHistogramSlider
                  disabled={loading}
                  minBound={priceRangeBounds[0]}
                  maxBound={priceRangeBounds[1]}
                  step={priceStep}
                  value={selectedPriceRange}
                  onChange={onPriceRangeChange}
                  faresForHistogram={priceHistogramFares}
                  currencyCode={priceCurrencyCode}
                />
              </div>
            </Panel>
          </CustomCollapse>
        </div>

        <div
          className="flight-filter-block mx-auto w-full max-w-[307px]"
          style={{ ...fullWidth, overflow: "hidden" }}
        >
          <CustomCollapse>
            <Panel header="Baggage" key="baggage" style={{ border: "none" }}>
              <div style={{ padding: "0 16px 16px 16px" }}>
                <Checkbox
                  className="baggageCheckbox"
                  checked={baggageIncludedOnly}
                  onChange={(e) =>
                    onBaggageIncludedChange(e.target.checked)
                  }
                  disabled={loading && !baggage.length}
                >
                  Checked baggage included
                </Checkbox>
              </div>
            </Panel>
          </CustomCollapse>
        </div>

        <div
          className="flight-filter-block timeCollapse mx-auto w-full max-w-[307px]"
          style={{ ...fullWidth, overflow: "hidden" }}
        >
          <CustomCollapse>
            <Panel
              header="Transit hours"
              key="transit"
              style={{ border: "none" }}
            >
              <div style={{ padding: "0 16px 16px 16px" }}>
                <div
                  className="flight-transit-pills flex flex-wrap gap-2"
                  role="group"
                  aria-label="Transit hours"
                >
                  {transitHourOptions.map((opt) => {
                    const isActive = selectedTransitRange === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={
                          isActive
                            ? "flight-transit-pill flight-transit-pill--active"
                            : "flight-transit-pill"
                        }
                        onClick={() => {
                          if (isActive) onTransitRangeChange?.(null);
                          else onTransitRangeChange?.(opt.value);
                        }}
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

        <div
          className="flight-filter-block flightTimeFilter mx-auto w-full max-w-[307px]"
          style={{ ...fullWidth, overflow: "hidden" }}
        >
          <CustomCollapse>
            <Panel
              header="Flight time"
              key="time"
              style={{ border: "none" }}
            >
              <div style={{ padding: "12px 16px 18px" }}>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    fontWeight: 300,
                    marginBottom: "8px",
                    marginTop: 0,
                  }}
                >
                  Departure
                </p>
                <div
                  className="departureArrival"
                  style={{ marginBottom: "14px" }}
                >
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
                  <span
                    style={{
                      fontSize: "24px",
                      color: "#0F172A",
                      lineHeight: 1,
                    }}
                  >
                    →
                  </span>
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

                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748B",
                    fontWeight: 300,
                    marginBottom: "8px",
                    marginTop: 0,
                  }}
                >
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
                  <span
                    style={{
                      fontSize: "24px",
                      color: "#0F172A",
                      lineHeight: 1,
                    }}
                  >
                    →
                  </span>
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

        <div
          className="flight-filter-block refundableFilterCollapse mx-auto w-full max-w-[307px]"
          style={{ ...fullWidth, overflow: "hidden" }}
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
                    onRefundFilterRefundableChange(e.target.checked)
                  }
                  disabled={loading}
                >
                  Refundable
                </Checkbox>
                <Checkbox
                  className="baggageCheckbox"
                  checked={refundFilterNonRefundable}
                  onChange={(e) =>
                    onRefundFilterNonRefundableChange(e.target.checked)
                  }
                  disabled={loading}
                >
                  Non-refundable
                </Checkbox>
              </div>
            </Panel>
          </CustomCollapse>
        </div>

        <div
          className="flight-filter-block timeCollapse mx-auto w-full max-w-[307px]"
          style={{ ...fullWidth, overflow: "hidden" }}
        >
          <CustomCollapse>
            <Panel
              header="Airlines"
              key="airlines"
              style={{ border: "none" }}
            >
              <div style={{ padding: "0 16px 16px 16px" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {airline.map((a) => (
                    <Checkbox
                      key={a.id}
                      className="baggageCheckbox"
                      disabled={loading && !airline.length}
                      onChange={(e) =>
                        onAirlineToggle(a.code, e.target.checked)
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

        <div
          className="flight-filter-block mx-auto w-full max-w-[307px]"
          style={{ ...fullWidth, overflow: "hidden" }}
        >
          <CustomCollapse>
            <Panel
              header="Ancillaries"
              key="ancillaries"
              style={{ border: "none" }}
            >
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
