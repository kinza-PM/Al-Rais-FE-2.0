import React from "react";
import type { PasswordRules } from "../../utils/validators";

interface PasswordChecklistProps {
  rules: PasswordRules;
  className?: string;
}

const RuleItem: React.FC<{ satisfied: boolean; children: React.ReactNode }> = ({
  satisfied,
  children,
}) => {
  const color = satisfied ? "text-[#15803d]" : "text-[#3D495C]"; // green vs neutral
  const icon = satisfied ? (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path
        d="M16.6666 5.83325L8.33325 14.1666L4.16659 9.99992"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
  return (
    <li className={`flex items-center gap-2 text-sm ${color}`}>
      <span className={`inline-flex items-center ${color}`}>{icon}</span>
      <span>{children}</span>
    </li>
  );
};

const PasswordChecklist: React.FC<PasswordChecklistProps> = ({ rules, className }) => {
  return (
    <ul className={`space-y-1 ${className ?? ""}`} aria-live="polite">
      <RuleItem satisfied={rules.minLength}>Minimum 8 characters</RuleItem>
      <RuleItem satisfied={rules.hasUpper}>At least 1 uppercase letter</RuleItem>
      <RuleItem satisfied={rules.hasLower}>At least 1 lowercase letter</RuleItem>
      <RuleItem satisfied={rules.hasNumber}>At least 1 number</RuleItem>
      <RuleItem satisfied={rules.hasSpecial}>At least 1 special character</RuleItem>
    </ul>
  );
};

export default PasswordChecklist;
