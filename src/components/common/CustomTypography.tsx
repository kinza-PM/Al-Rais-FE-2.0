import React from "react";
import { Typography } from "antd";

type CustomTypographyProps = {
  variant?: "title" | "text" | "paragraph";
  level?: 1 | 2 | 3 | 4 | 5; // for Title only
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties; // <-- added
};

const CustomTypography: React.FC<CustomTypographyProps> = ({
  variant = "text",
  level = 4,
  children,
  className = "",
  style,
}) => {
  if (variant === "title") {
    return (
      <Typography.Title level={level} className={className} style={style}>
        {children}
      </Typography.Title>
    );
  }

  if (variant === "paragraph") {
    return (
      <Typography.Paragraph className={className} style={style}>
        {children}
      </Typography.Paragraph>
    );
  }

  return (
    <Typography.Text className={className} style={style}>
      {children}
    </Typography.Text>
  );
};

export default CustomTypography;
