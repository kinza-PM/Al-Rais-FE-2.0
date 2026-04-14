import React from "react";
import ReadyToFlySection from "../components/molecules/ReadyToFlySection";
import CancellationPolicyContent from "../components/common/CancellationPolicyContent";

const RefundCancellationPolicyPage: React.FC = () => {
  return (
    <div className="w-full">
      <section className="w-full py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col items-center">
            <CancellationPolicyContent />
          </div>
        </div>
      </section>

      <ReadyToFlySection />
    </div>
  );
};

export default RefundCancellationPolicyPage;