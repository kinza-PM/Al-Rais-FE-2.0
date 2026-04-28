import { Input, type InputProps } from "antd";
import React from "react";

interface CustomInputProps extends InputProps {
  children?: React.ReactNode;
}

const CustomInput: React.FC<CustomInputProps> = ({ children, ...rest }) => {
  return (
    <Input style={{}} className="inputStyleChild" {...rest}>
      {children}
    </Input>
  );
};

export default CustomInput;
