import React from "react";
import arrownUpwardIcon from "../../assets/svgs/arrow-upwards.svg";
import arrownDownwardIcon from "../../assets/svgs/arrow-downwards.svg";
import Button from "../atoms/Button";

interface CardCollapseToggleProps {
    open: boolean;
    onClick: () => void;
    className?: string;
}

const CardCollapseToggle: React.FC<CardCollapseToggleProps> = ({
    open,
    onClick,
    className = "",
}) => {
    return (
        <Button
            overrideClasses
            type="button"
            onClick={onClick}
            aria-label={open ? "Collapse card" : "Expand card"}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""} ${className}`}
        >
            {open ? (
                <img alt="collapse-icon" src={arrownUpwardIcon} />
            ) : (
                <img alt="expand-icon" src={arrownDownwardIcon} />
            )}
        </Button>
    );
};

export default CardCollapseToggle;
