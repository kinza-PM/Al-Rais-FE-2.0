import React, { useState } from "react";
import { Dropdown, Button, Collapse } from "antd";
import { DownOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

export default function FilterUI() {
  const [activeStops, setActiveStops] = useState<number[]>([0]);

  const toggleStop = (stop: number) => {
    setActiveStops((prev) =>
      prev.includes(stop) ? prev.filter((s) => s !== stop) : [...prev, stop]
    );
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 300, margin: "0 auto" }}>
      {/* Sort By */}
      <Dropdown
        menu={{
          items: [
            { key: "1", label: "Lowest price" },
            { key: "2", label: "Highest price" },
          ],
        }}
      >
        <Button
          style={{
            borderRadius: 12,
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Sort by <span style={{ fontWeight: 500 }}>Lowest price</span>
          <DownOutlined />
        </Button>
      </Dropdown>

      {/* Filters */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 12,
          marginTop: 12,
          padding: "8px 12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div>
            <strong>Filters</strong>
            <span style={{ color: "#555", marginLeft: 6 }}>
              • {String(activeStops.length).padStart(2, "0")} Active
            </span>
          </div>
          <button
            style={{
              background: "none",
              border: "none",
              color: "#0056B3",
              cursor: "pointer",
              fontSize: 14,
            }}
            onClick={() => setActiveStops([])}
          >
            Reset all
          </button>
        </div>

        {/* Accordion */}
        <Collapse
          ghost
          expandIconPosition="end"
          defaultActiveKey={["1"]}
          style={{ background: "transparent" }}
        >
          <Panel header="Number of stops" key="1">
            <div style={{ display: "flex", gap: 8 }}>
              {[0, 1, 2].map((stop) => (
                <button
                  key={stop}
                  onClick={() => toggleStop(stop)}
                  style={{
                    borderRadius: 20,
                    padding: "6px 14px",
                    border: activeStops.includes(stop)
                      ? "none"
                      : "1px solid #ccc",
                    background: activeStops.includes(stop)
                      ? "#0056B3"
                      : "white",
                    color: activeStops.includes(stop) ? "white" : "#000",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {String(stop).padStart(2, "0")}
                </button>
              ))}
            </div>
          </Panel>
        </Collapse>
      </div>
    </div>
  );
}
