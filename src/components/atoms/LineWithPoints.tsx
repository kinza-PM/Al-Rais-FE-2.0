import React from "react";

type FlightSegment = {
  duration?: string;
  layoverTime?: string;
  departureAirportCode?: string;
  arrivalAirportCode?: string;
  departureDateTime?: string;
  arrivalDateTime?: string;
};

type LineProps = {
  orientation?: "vertical" | "horizontal";
  color?: string;
  thickness?: number;
  circleSize?: number;
  className?: string;
  segments?: FlightSegment[]; // Flight segments array
};

const LineWithPoints: React.FC<LineProps> = ({
  orientation = "vertical",
  color = "#2b6cb0", // default blue
  thickness = 4,
  circleSize = 14,
  className = "",
  segments = [],
}) => {
  const isVertical = orientation === "vertical";
  const hasMultipleSegments = Array.isArray(segments) && segments.length > 1;

  // If no segments or single segment, render simple line
  if (!hasMultipleSegments) {
    return (
      <div
        className={`flex ${isVertical ? "flex-col items-center" : "flex-row items-center"
          } ${className}`}
        style={{
          width: isVertical ? "fit-content" : "100%",
          height: isVertical ? "100%" : "fit-content",
        }}
      >
        {/* Top / Left Circle */}
        <div
          style={{
            width: circleSize,
            height: circleSize,
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />

        {/* Line */}
        <div
          style={{
            flexGrow: 1,
            width: isVertical ? thickness : "100%",
            height: isVertical ? "100%" : thickness,
            backgroundColor: color,
            opacity: 0.6,
          }}
        />

        {/* Bottom / Right Circle */}
        <div
          style={{
            width: circleSize,
            height: circleSize,
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />
      </div>
    );
  }

  // Multiple segments - render with stops
  const stopCircleSize = 11; // Smaller circle for stops

  return (
    <div
      className={`flex ${isVertical ? "flex-col items-center" : "flex-row items-center"
        } ${className}`}
      style={{
        width: isVertical ? "fit-content" : "100%",
        height: isVertical ? "100%" : "fit-content",
        position: "relative",
      }}
    >
      {/* Start Circle */}
      <div
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: "50%",
          backgroundColor: color,
          flexShrink: 0,
        }}
      />

      {/* Render segments dynamically */}
      {segments.map((_segment: FlightSegment, index: number) => (
        <React.Fragment key={index}>
          {/* Line Segment */}
          <div
            style={{
              flexGrow: 1,
              width: isVertical ? thickness : "100%",
              height: isVertical ? "100%" : thickness,
              backgroundColor: color,
              opacity: 0.6,
            }}
          />

          {/* Stop Circle (show between segments, not after last segment) */}
          {index < segments.length - 1 && (
            <div
              style={{
                width: stopCircleSize,
                height: stopCircleSize,
                borderRadius: "50%",
                backgroundColor: color,
                border: `2px solid white`,
                flexShrink: 0,
              }}
            />
          )}
        </React.Fragment>
      ))}

      {/* End Circle */}
      <div
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: "50%",
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
    </div>
  );
};

export default LineWithPoints;
