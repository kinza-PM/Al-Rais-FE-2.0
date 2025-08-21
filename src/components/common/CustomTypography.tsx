import { Typography, type TypographyProps } from "antd";
import React from "react";

interface CustomTypographyProps extends TypographyProps {
  children?: React.ReactNode;
}

const CustomTypography: React.FC<CustomTypographyProps> = ({
  children,
  ...rest
}) => {
  return <Typography {...rest}>{children}</Typography>;
};

export default CustomTypography;
