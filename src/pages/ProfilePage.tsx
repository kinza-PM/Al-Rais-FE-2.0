import React, { useState } from "react";
import Profile from '../assets/images/profile.png';
import { Button } from "../components";
import ProfileMilesSummary from "../components/molecules/ProfileMilesSummary";
import LoyaltyPrograms from "../components/molecules/LoyaltyPrograms";

const tabs = ["Basics", "Air miles", "Payments", "Account"] as const;

const ProfilePage: React.FC = () => {
  const [active, setActive] = useState<(typeof tabs)[number]>("Air miles");

  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center px-16 py-8">
      <section className="w-full max-w-md rounded-2xl border border-[#E4E4E7] bg-white px-10 py-8 text-center shadow-sm">

        <div className="mx-auto mb-4 h-40 w-40 overflow-hidden">
          <img src={Profile} alt="profile" className="h-full w-full object-cover" />
        </div>

        <p className="text-[14px] text-[#3D495C]">Zeeshan Ahmad</p>

        <div className="mt-2 space-y-1 text-[14px] text-[#3D495C]">
          <p className="break-all cursor-text">zeeshan.ahmad@example.com</p>
          <p className="cursor-text">+12 345 678901</p>
        </div>

        <Button
          type="button"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#2351A3] px-8 py-2 text-[14px] font-semibold text-white"
          overrideClasses
        >
          Edit profile
        </Button>
      </section>

      <div className="mt-6 w-full max-w-[560px] max-w-xl max-[625px]:max-w-full max-[625px]:-mx-3 max-[625px]:w-[calc(100%+1.5rem)]">
        <div
          role="tablist"
          aria-label="Profile sections"
          className="flex w-full items-center rounded-2xl ring-1 ring-[#C2CAD6] bg-white p-1 shadow-sm max-[625px]:p-1 max-[625px]:gap-1"
        >
          {tabs.map((t) => {
            const selected = active === t;
            return (
              <Button
                key={t}
                type="button"
                aria-selected={selected}
                onClick={() => setActive(t)}
                className={[
                  "flex-1 rounded-xl px-6 py-2 text-[14px] font-medium transition-colors max-[625px]:px-3 max-[625px]:py-2 max-[625px]:text-[13px]",
                  selected ? "bg-[#2351A3] text-white shadow-sm" : "text-[#3D495C]"
                ].join(" ")}
                overrideClasses
              >
                {t}
              </Button>
            );
          })}
        </div>
      </div>

      {/* <div className="mt-6 w-full max-w-xl text-sm text-[#3D495C]">
        {active === "Basics" && <div>Basics content…</div>}
        {active === "Air miles" && <div>Air miles content…</div>}
        {active === "Payments" && <div>Payments content…</div>}
        {active === "Account" && <div>Account content…</div>}
      </div> */}

      <div className="mt-8 w-full">
        <ProfileMilesSummary />
      </div>

      <div className="mt-6 w-full">
        <LoyaltyPrograms />
      </div>
    </div>
  );
};

export default ProfilePage;
