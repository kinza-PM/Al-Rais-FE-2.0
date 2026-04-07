import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useUserProfileStore } from "../../store/userProfileStore";
import { usePassengerCacheFetch } from "../../hooks/usePassengerCache";
import TailwindCustomInput from "../common/TailwindCustomInput";
import SearchableDropdown from "../common/SearchableDropdown";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

type TravelerRow = {
  id: string;
  firstName: string;
  lastName: string;
  isYou: boolean;
  initials: string;
  bgColor: string;
  passport?: string;
  birthDate?: string | null;
  gender?: string;
  issuingCountryCode?: string;
  email?: string;
  phoneAreaCode?: string | number;
  phoneNumber?: string | number;
  dateOfIssueIso?: string | null;
  expiryIso?: string | null;
};

function formatIsoToDdmmyyyy(iso?: string | null) {
  const raw = String(iso || "").trim();
  if (!raw) return "";
  const d = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function formatIsoToDdMmmYyyy(iso?: string | null) {
  const raw = String(iso || "").trim();
  if (!raw) return "";
  const d = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dd = String(d.getDate()).padStart(2, "0");
  const mmm = months[d.getMonth()];
  const yyyy = d.getFullYear();
  return `${dd}-${mmm}-${yyyy}`;
}

export default function ProfileBasicsTab() {
  const { user } = useAuth();
  const { remoteUser } = useUserProfileStore();
  const { data: passengerCacheResp, isLoading } = usePassengerCacheFetch();

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

  const initialName = splitName(remoteUser?.name ?? user?.full_name ?? user?.name);
  const [dirty, setDirty] = useState(false);

  const [personal, setPersonal] = useState<{
    firstName: string;
    lastName: string;
    dob: Date | null;
    email: string;
    phone: string; // full E.164-ish string used by PhoneInput
    gender: string;
    passportNumber: string;
    issuingCountry: string;
    expiryDate: Date | null;
  }>({
    firstName: initialName.first,
    lastName: initialName.last,
    dob: null,
    email: displayEmail,
    phone: displayPhone || "",
    gender: "male",
    passportNumber: "",
    issuingCountry: "United Arab Emirates",
    expiryDate: null,
  });

  const travelers: TravelerRow[] = useMemo(() => {
    const extractPassengers = (resp: any): any[] => {
      if (!resp) return [];
      if (Array.isArray(resp)) return resp;
      const candidates = [
        resp?.data?.passengers,
        resp?.passengers,
        resp?.data,
        resp?.data?.data,
      ];
      for (const c of candidates) {
        if (Array.isArray(c)) return c;
      }
      return [];
    };

    const bgPalette = [
      "bg-[#A7C0EC] text-[#1A3C7A]",
      "bg-[#85FFCA] text-[#00522E]",
      "bg-[#DEDEFF] text-[#140052]",
      "bg-[#FFE5B4] text-[#7A3C00]",
      "bg-[#FFD6E7] text-[#7A0031]",
    ];

    const passengers = extractPassengers(passengerCacheResp);
    if (passengers.length === 0) return [];

    const normalizedEmail = String(displayEmail || "").trim().toLowerCase();

    const mapped = passengers
      .map((p: any, idx: number): TravelerRow | null => {
        const pi = p?.passengerInfo ?? {};
        const doc0 = p?.identityDocuments?.[0] ?? {};
        const contact0 = p?.contact?.contactsProvided?.[0] ?? {};
        const phone0 = contact0?.phone?.[0] ?? {};

        const firstName = String(pi?.givenName ?? "").trim() || "Traveler";
        const lastName = String(pi?.surname ?? "").trim();
        const passport = String(doc0?.idDocumentNumber ?? "").trim();
        const rawKey = String(p?.passengerKey ?? p?.id ?? idx).trim();
        const key = `${rawKey}|${passport}|${String(pi?.birthDate ?? "").trim()}`;
        const initials = `${firstName?.[0] ?? "T"}${lastName?.[0] ?? ""}`.toUpperCase();

        const email = String(contact0?.emailAddress?.[0] ?? "").trim();
        const isYou =
          normalizedEmail &&
          email &&
          normalizedEmail === email.toLowerCase().trim();

        return {
          id: key,
          firstName,
          lastName,
          isYou: Boolean(isYou),
          initials,
          bgColor: bgPalette[idx % bgPalette.length],
          passport,
          birthDate: pi?.birthDate ?? null,
          gender: pi?.gender ?? "",
          issuingCountryCode: doc0?.issuingCountryCode ?? "",
          email,
          phoneAreaCode: phone0?.areaCode ?? "",
          phoneNumber: phone0?.phoneNumber ?? "",
          dateOfIssueIso: doc0?.dateOfIssue ?? null,
          expiryIso: doc0?.expiryDate ?? null,
        };
      })
      .filter(Boolean) as TravelerRow[];

    // If nothing matched "YOU", mark first entry as you (for UI parity).
    if (!mapped.some((t) => t.isYou) && mapped.length > 0) {
      mapped[0] = { ...mapped[0], isYou: true };
    }

    return mapped;
  }, [passengerCacheResp, displayEmail]);

  const [expandedId, setExpandedId] = useState<string | null>(
    travelers.find((t) => t.isYou)?.id ?? travelers[0]?.id ?? null,
  );

  const sectionCard =
    "w-full rounded-2xl border border-[#E4E4E7] bg-white p-6 shadow-sm";
  const sectionTitle = "text-[14px] font-semibold text-[#0A0C0F]";

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-6">
      {/* Personal Information */}
      <div className={sectionCard}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className={sectionTitle}>Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TailwindCustomInput
            label="First Name"
            placeholder="First name"
            value={personal.firstName}
            onChange={(e) => {
              setDirty(true);
              setPersonal((p) => ({ ...p, firstName: e.target.value }));
            }}
          />
          <TailwindCustomInput
            label="Last Name"
            placeholder="Last name"
            value={personal.lastName}
            onChange={(e) => {
              setDirty(true);
              setPersonal((p) => ({ ...p, lastName: e.target.value }));
            }}
          />

          <div className="relative w-full min-w-0">
            <label className="mb-1 block text-[12px] text-[#0A0C0F]">
              Date of birth
            </label>
            <TailiwindCustomDatePicker
              value={personal.dob}
              onChange={(d) => {
                setDirty(true);
                setPersonal((p) => ({ ...p, dob: d }));
              }}
              placeholder="Select date of birth"
              buttonIconSrc
              overridesClass
              inputClass="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-4 pr-10 text-sm text-[#0A0C0F] outline-none cursor-pointer"
            />
          </div>

          <TailwindCustomInput
            label="Email"
            placeholder="you@example.com"
            value={personal.email}
            onChange={(e) => {
              setDirty(true);
              setPersonal((p) => ({ ...p, email: e.target.value }));
            }}
          />

          <div className="relative w-full min-w-0">
            <label className="mb-1 block text-[12px] text-[#0A0C0F]">
              Phone
            </label>
            <PhoneInput
              defaultCountry="ae"
              value={personal.phone}
              onChange={(phone) => {
                setDirty(true);
                setPersonal((p) => ({ ...p, phone }));
              }}
              forceDialCode={true}
              hideDropdown={false}
              disableCountryGuess={false}
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
            onChange={(value) => {
              setDirty(true);
              setPersonal((p) => ({ ...p, gender: value }));
            }}
            placeholder="Select gender"
            label="Gender"
            widthClass="w-full"
            className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#FFFFFF] px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
          />
        </div>

        {/* Passport and Travel Documents */}
        <div className="mt-6 border-t border-[#E4E4E7] pt-6">
          <h3 className={sectionTitle}>Passport and Travel Documents</h3>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <TailwindCustomInput
              label="Passport Number"
              placeholder="Passport number"
              value={personal.passportNumber}
              onChange={(e) => {
                setDirty(true);
                setPersonal((p) => ({ ...p, passportNumber: e.target.value }));
              }}
            />

            <SearchableDropdown
              options={[
                { id: "uae", value: "United Arab Emirates", label: "United Arab Emirates" },
                { id: "sa", value: "Saudi Arabia", label: "Saudi Arabia" },
                { id: "pk", value: "Pakistan", label: "Pakistan" },
                { id: "in", value: "India", label: "India" },
              ]}
              value={personal.issuingCountry}
              onChange={(value) => {
                setDirty(true);
                setPersonal((p) => ({ ...p, issuingCountry: value }));
              }}
              placeholder="Select issuing country"
              label="Issuing Country"
              widthClass="w-full"
              className="h-[50px] w-full appearance-none rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#FFFFFF] px-3 pr-8 text-sm text-[#0A0C0F] focus:outline-none"
            />

            <div className="relative w-full min-w-0">
              <label className="mb-1 block text-[12px] text-[#0A0C0F]">
                Expiry Date
              </label>
              <TailiwindCustomDatePicker
                value={personal.expiryDate}
                onChange={(d) => {
                  setDirty(true);
                  setPersonal((p) => ({ ...p, expiryDate: d }));
                }}
                placeholder="Select expiry date"
                buttonIconSrc
                overridesClass
                inputClass="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-4 pr-10 text-sm text-[#0A0C0F] outline-none cursor-pointer"
                disablePastDates
              />
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              disabled={!dirty}
              className={[
                "rounded-full px-10 py-2 text-[13px] font-semibold transition-all",
                dirty
                  ? "bg-[#2351A3] text-white hover:opacity-90"
                  : "bg-[#E4E4E7] text-[#98A2B3] cursor-not-allowed",
              ].join(" ")}
              onClick={() => {
                toast.success("Saved (UI only).");
                setDirty(false);
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Saved Travelers */}
      <div className={sectionCard}>
        <div className="mb-2">
          <h3 className={sectionTitle}>Saved Travelers</h3>
          <p className="mt-1 text-[12px] text-[#3D495C]">
            Save passenger details for yourself and family members. These will be used
            to auto-fill booking forms.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {isLoading && (
            <div className="rounded-xl border border-[#E4E4E7] p-4 text-[13px] text-[#3D495C]">
              Loading saved travelers…
            </div>
          )}

          {!isLoading && travelers.length === 0 && (
            <div className="rounded-xl border border-[#E4E4E7] p-4 text-[13px] text-[#3D495C]">
              No saved travelers found yet.
            </div>
          )}

          {travelers.map((t) => {
            const isExpanded = expandedId === t.id;
            return (
              <div
                key={t.id}
                className={[
                  "rounded-2xl border bg-white",
                  isExpanded ? "border-[#5383DA]" : "border-[#E4E4E7]",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${t.bgColor}`}
                    >
                      {t.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-[13px] font-semibold text-[#0A0C0F]">
                          {t.firstName} {t.lastName}
                        </div>
                        {t.isYou && (
                          <span className="rounded-full bg-[#AEC2EA] px-2 py-0.5 text-[10px] font-semibold text-[#1E3A8A]">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[11px] text-[#3D495C]">
                        Passport: {t.passport || "—"} • Gender:{" "}
                        {t.gender || "—"} • DOB:{" "}
                        {formatIsoToDdMmmYyyy(t.birthDate) || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-3">
                    <button
                      type="button"
                      className="text-[12px] font-semibold text-[#2351A3]"
                      onClick={() => toast("Edit traveler (UI only).")}
                    >
                      Edit
                    </button>
                    {!t.isYou && (
                      <button
                        type="button"
                        className="text-[12px] font-semibold text-[#E11D48]"
                        onClick={() => toast("Remove traveler (UI only).")}
                      >
                        Remove
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                      className="rounded-lg p-1 text-[#3D495C] hover:bg-gray-50"
                      onClick={() =>
                        setExpandedId((prev) => (prev === t.id ? null : t.id))
                      }
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={isExpanded ? "rotate-180 transition-transform" : "transition-transform"}
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[#E4E4E7] px-4 py-4">
                    <div className="text-[12px] font-semibold text-[#0A0C0F]">
                      Personal Details
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-5">
                      <div className="md:col-span-2">
                        <div className="text-[11px] text-[#3D495C]">Full Name (As On Passport)</div>
                        <div className="mt-1 text-[12px] font-medium text-[#0A0C0F]">
                          {t.firstName} {t.lastName}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#3D495C]">Date of Birth</div>
                        <div className="mt-1 text-[12px] font-medium text-[#0A0C0F]">
                          {formatIsoToDdMmmYyyy(t.birthDate) || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#3D495C]">Gender</div>
                        <div className="mt-1 text-[12px] font-medium text-[#0A0C0F]">
                          {t.gender || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#3D495C]">PAX Type</div>
                        <div className="mt-1 text-[12px] font-medium text-[#0A0C0F]">Adult</div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="text-[11px] text-[#3D495C]">Email</div>
                        <div className="mt-1 truncate text-[12px] font-medium text-[#0A0C0F]">
                          {t.email || "—"}
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        <div className="text-[11px] text-[#3D495C]">Phone</div>
                        <div className="mt-1 text-[12px] font-medium text-[#0A0C0F]">
                          {t.phoneAreaCode ? `+${String(t.phoneAreaCode).replace(/^\+/, "")} ` : ""}
                          {t.phoneNumber || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-[12px] font-semibold text-[#0A0C0F]">
                      Travel Documents
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div>
                        <div className="text-[11px] text-[#3D495C]">Passport Number</div>
                        <div className="mt-1 text-[12px] font-medium text-[#0A0C0F]">
                          {t.passport || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#3D495C]">Issued By</div>
                        <div className="mt-1 text-[12px] font-medium text-[#0A0C0F]">
                          {t.issuingCountryCode || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#3D495C]">Issue Date</div>
                        <div className="mt-1 text-[12px] font-medium text-[#0A0C0F]">
                          {formatIsoToDdmmyyyy(t.dateOfIssueIso) || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#3D495C]">Expiry Date</div>
                        <div className="mt-1 text-[12px] font-medium text-[#0A0C0F]">
                          {formatIsoToDdmmyyyy(t.expiryIso) || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

