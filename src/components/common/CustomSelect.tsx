import { Select, type SelectProps } from "antd";
import React from "react";

interface CustomSelectProps extends SelectProps {
  children?: React.ReactNode;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ children, ...rest }) => {
  const customArrow = (
    <svg
      className="pointer-events-none absolute right-3 top-1/3"
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M5 7.5l5 5 5-5"
        stroke="#2351A3"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <Select
      style={{}}
      className="selectChild h-11"
      suffixIcon={customArrow}
      {...rest}
    >
      {children}
    </Select>
  );
};

export default CustomSelect;
