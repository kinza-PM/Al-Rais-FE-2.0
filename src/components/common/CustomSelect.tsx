import { Select, type SelectProps } from "antd";
import React from "react";

interface CustomSelectProps extends SelectProps {
  children?: React.ReactNode;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ children, ...rest }) => {
  return (
    <Select style={{}} className="selectChild" {...rest}>
      {children}
    </Select>
  );
};

export default CustomSelect;
