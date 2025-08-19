import React from "react";

type LineProps = {
  orientation?: "vertical" | "horizontal";
  color?: string;
  thickness?: number;
  circleSize?: number;
  className?: string;
};

const LineWithPoints: React.FC<LineProps> = ({
  orientation = "vertical",
  color = "#2b6cb0", // default blue
  thickness = 4,
  circleSize = 14,
  className = "",
}) => {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={`flex ${
        isVertical ? "flex-col items-center" : "flex-row items-center"
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
};

export default LineWithPoints;
