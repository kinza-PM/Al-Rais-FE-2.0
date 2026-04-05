import React from "react";
import ReadyToFlySection from "../components/molecules/ReadyToFlySection";
import PrivacyPolicyContent from "../components/common/PrivacyPolicyContent";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="w-full">
      <section className="w-full py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col items-center">
            <PrivacyPolicyContent />
          </div>
        </div>
      </section>

      <ReadyToFlySection />
    </div>
  );
};


export default PrivacyPolicyPage;
