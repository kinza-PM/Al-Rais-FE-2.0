import React from "react";
import TermsOfServiceContent from "./TermsOfServiceContent";
import PrivacyPolicyContent from "./PrivacyPolicyContent";
import Button from "../atoms/Button";
import CancellationPolicyContent from "./CancellationPolicyContent";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "terms" | "privacy" | "cancellation";
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-4xl rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
        <Button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors z-20"
          overrideClasses
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
        <div className="overflow-y-auto p-10 scrollbar-hide">
          {type === "terms" ? <TermsOfServiceContent /> : type === "privacy" ? <PrivacyPolicyContent /> : <CancellationPolicyContent />}
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
