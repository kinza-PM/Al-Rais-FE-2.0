import { DatePicker, type DatePickerProps } from "antd";
import React from "react";

interface CustomDatePickerProps extends DatePickerProps {
  children?: React.ReactNode;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  children,
  ...rest
}) => {
  return (
    <DatePicker style={{}} className="datePickerChild" {...rest}>
      {children}
    </DatePicker>
  );
};

export default CustomDatePicker;
