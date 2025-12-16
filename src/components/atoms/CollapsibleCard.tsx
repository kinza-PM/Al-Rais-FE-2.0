import React from "react";
import CardCollapseToggle from "../common/CardCollapseToggle";

type CollapsibleCardProps = {
  open: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
};

export default function CollapsibleCard({
  open,
  onToggle,
  icon,
  title,
  subtitle,
  children,
  className = "",
}: CollapsibleCardProps) {
  return (
    <div
      className={`rounded-xl border border-[#E4E4E7] overflow-hidden ${className}`}
    >
      <div className="flex w-full items-center justify-between px-4 py-3 text-left">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A7C0EC]">
            {icon}
          </div>
          <div>
            <div className="text-[15px] font-medium text-[#0A0C0F]">
              {title}
            </div>
            {subtitle && (
              <div className="text-[12px] text-[#3D495C]">{subtitle}</div>
            )}
          </div>
        </div>
        <CardCollapseToggle open={open} onClick={onToggle} />
      </div>

      {open && <div className="h-px bg-[#E4E4E7]" />}

      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}
