import { useMemo } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useUserProfileStore } from "../../store/userProfileStore";
import TailwindCustomInput from "../common/TailwindCustomInput";
import SearchableDropdown from "../common/SearchableDropdown";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import Button from "../atoms/Button";

export default function ProfileBasicsTab() {
  const { user } = useAuth();
  const { remoteUser } = useUserProfileStore();

  const displayEmail = remoteUser?.email || user?.email || "";
  const displayPhone = remoteUser?.phoneNumber || user?.phone || "";

  const splitName = (n?: string | null) => {
    const s = String(n ?? "").trim();
    if (!s) return { first: "", last: "" };
    const parts = s.split(/\s+/).filter(Boolean);
    return {
      first: parts[0] ?? "",
      last: parts.slice(1).join(" "),
    };
  };

  const initialName = splitName(
    remoteUser?.name ?? user?.full_name ?? user?.name,
  );
  const personal = useMemo<{
    firstName: string;
    lastName: string;
    dob: string;
    email: string;
    phone: string; // full E.164-ish string used by PhoneInput
    gender: string;
    passportNumber: string;
    issuingCountry: string;
    expiryDate: string;
  }>(
    () => ({
      firstName: initialName.first,
      lastName: initialName.last,
      dob: "",
      email: displayEmail,
      phone: displayPhone || "",
      gender:
        String((remoteUser as any)?.gender ?? "")
          .trim()
          .toUpperCase() === "F"
          ? "female"
          : "male",
      passportNumber: "",
      issuingCountry: "United Arab Emirates",
      expiryDate: "",
    }),
    [
      displayEmail,
      displayPhone,
      initialName.first,
      initialName.last,
      remoteUser,
    ],
  );

  const sectionCard =
    "w-full rounded-2xl border border-[#E4E4E7] bg-white p-3 shadow-sm";
  const sectionTitle = "text-base font-medium text-[#0A0C0F]";
  const sectionLabel = "mb-1 block text-xs text-[#3D495C]";
  return (
    <div className="mx-auto w-full max-w-[1080px] space-y-10">
      {/* Personal Information */}
      <div className={sectionCard}>
        <div className="mb-2 flex items-center justify-between">
          <h3 className={sectionTitle}>Personal Information</h3>
        </div>

        <div className="border-b border-[#E4E4E7] mb-3 -mx-3"></div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TailwindCustomInput
            label="First Name"
            labelClass={sectionLabel}
            placeholder="First name"
            value={personal.firstName}
            disabled
          />
          <TailwindCustomInput
            label="Last Name"
            placeholder="Last name"
            labelClass={sectionLabel}
            value={personal.lastName}
            disabled
          />

          <TailwindCustomInput
            label="Date of birth"
            labelClass={sectionLabel}
            placeholder="Date of birth"
            value={personal.dob}
            disabled
          />

          <TailwindCustomInput
            label="Email"
            labelClass={sectionLabel}
            placeholder="you@example.com"
            value={personal.email}
            disabled
          />

          <div className="relative w-full min-w-0">
            <label className={sectionLabel}>Phone</label>
            <PhoneInput
              defaultCountry="ae"
              value={personal.phone}
              onChange={() => {}}
              forceDialCode={true}
              hideDropdown={false}
              disableCountryGuess={false}
              disabled
              className="custom-phone-wrapper"
              countrySelectorStyleProps={{
                buttonClassName: "country-selector-btn",
              }}
              inputProps={{
                placeholder: "Phone",
              }}
            />
          </div>

          <SearchableDropdown
            options={[
              { id: "male", value: "male", label: "Male" },
              { id: "female", value: "female", label: "Female" },
            ]}
            value={personal.gender}
            onChange={() => {}}
            disabled
            placeholder="Select gender"
            label="Gender"
            labelClass={sectionLabel}
            widthClass="w-full"
            className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#FFFFFF] px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
          />
        </div>

        {/* Passport and Travel Documents */}
        <div className="mt-6">
          <div className="border-b border-[#E4E4E7] mb-2 -mx-3"></div>
          <h3 className={sectionTitle}>Passport and Travel Documents</h3>

          <div className="border-b border-[#E4E4E7] mb-3 mt-2 -mx-3"></div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <TailwindCustomInput
              label="Passport Number"
              labelClass={sectionLabel}
              placeholder="Passport number"
              value={personal.passportNumber}
              disabled
            />

            <SearchableDropdown
              options={[
                {
                  id: "uae",
                  value: "United Arab Emirates",
                  label: "United Arab Emirates",
                },
                { id: "sa", value: "Saudi Arabia", label: "Saudi Arabia" },
                { id: "pk", value: "Pakistan", label: "Pakistan" },
                { id: "in", value: "India", label: "India" },
              ]}
              value={personal.issuingCountry}
              onChange={() => {}}
              disabled
              placeholder="Select issuing country"
              label="Issuing Country"
              labelClass={sectionLabel}
              widthClass="w-full"
              className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#FFFFFF] px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
            />

            <TailwindCustomInput
              label="Expiry Date"
              labelClass={sectionLabel}
              placeholder="Expiry date"
              value={personal.expiryDate}
              disabled
            />
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <Button
          type="button"
          disabled
          className={[
            "rounded-full px-12 py-2 text-base font-semibold transition-all bg-[#C2CAD6] text-[#F2F2F3] cursor-not-allowed",
            // dirty
            //   ? "bg-[#2351A3] text-white hover:opacity-90"
            //   : "bg-[#C2CAD6] text-[#F2F2F3] cursor-not-allowed",
          ].join(" ")}
          overrideClasses
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
