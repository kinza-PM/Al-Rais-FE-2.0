import { Button, type ButtonProps } from "antd";
import React from "react";

interface CustomButtonProps extends ButtonProps {
  children?: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({ children, ...rest }) => {
  return (
    <Button style={{}} className="buttonStyleChild" {...rest}>
      {children}
    </Button>
  );
};

export default CustomButton;
