import { useMemo, useState } from "react";
import { Modal } from "antd";
import toast from "react-hot-toast";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  usePassengerCacheAdd,
  usePassengerCacheFetch,
} from "../../hooks/usePassengerCache";
import { useCountriesOptions } from "../../hooks/masterListings/listing";
import {
  buildPassengerCacheAddPayload,
  extractPassengersFromCacheResponse,
} from "../../utils/passengerCacheHelper";
import TailwindCustomInput from "../common/TailwindCustomInput";
import SearchableDropdown from "../common/SearchableDropdown";
import TailiwindCustomDatePicker from "../common/TailiwindCustomDatePicker";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import Button from "../atoms/Button";

type TravelerRow = {
  id: string;
  sourceIndex: number;
  firstName: string;
  lastName: string;
  isYou: boolean;
  initials: string;
  bgColor: string;
  passport?: string;
  birthDate?: string | null;
  gender?: string;
  issuingCountryCode?: string;
  residenceCountryCode?: string;
  nameTitle?: string;
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

const normalizeGenderLabel = (g?: string) => {
  const v = String(g ?? "")
    .trim()
    .toUpperCase();
  if (v === "M" || v === "MALE") return "Male";
  if (v === "F" || v === "FEMALE") return "Female";
  return g || "—";
};

export default function ProfileSavedTravelersTab() {
  const { user } = useAuth();
  const {
    data: passengerCacheResp,
    isLoading,
    refetch: refetchPassengerCache,
  } = usePassengerCacheFetch();
  const { mutateAsync: addPassengerCache, isPending: isSaving } =
    usePassengerCacheAdd();
  const { data: countriesOptions = [] } = useCountriesOptions();

  const displayEmail =
    (user as any)?.email ||
    (user as any)?.attributes?.email ||
    (user as any)?.username ||
    "";
  const rawPassengers = useMemo(
    () => extractPassengersFromCacheResponse(passengerCacheResp),
    [passengerCacheResp],
  );
  const travelers: TravelerRow[] = useMemo(() => {
    const bgPalette = [
      "bg-[#A7C0EC] text-[#1A3C7A]",
      "bg-[#85FFCA] text-[#00522E]",
      "bg-[#DEDEFF] text-[#140052]",
      "bg-[#FFE5B4] text-[#7A3C00]",
      "bg-[#FFD6E7] text-[#7A0031]",
    ];

    const passengers = rawPassengers;
    if (passengers.length === 0) return [];

    const normalizedEmail = String(displayEmail || "")
      .trim()
      .toLowerCase();
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
        const key = `${rawKey}|${passport}|${String(pi?.birthDate ?? "").trim()}|${idx}`;
        const initials =
          `${firstName?.[0] ?? "T"}${lastName?.[0] ?? ""}`.toUpperCase();

        const email = String(contact0?.emailAddress?.[0] ?? "").trim();
        const isYou =
          normalizedEmail &&
          email &&
          normalizedEmail === email.toLowerCase().trim();
        console.log(normalizedEmail, email, "test email");
        return {
          id: key,
          sourceIndex: idx,
          firstName,
          lastName,
          isYou: Boolean(isYou),
          initials,
          bgColor: bgPalette[idx % bgPalette.length],
          passport,
          birthDate: pi?.birthDate ?? null,
          gender: pi?.gender ?? "",
          nameTitle: pi?.nameTitle ?? "",
          issuingCountryCode: doc0?.issuingCountryCode ?? "",
          residenceCountryCode: doc0?.residenceCountryCode ?? "",
          email,
          phoneAreaCode: phone0?.areaCode ?? "",
          phoneNumber: phone0?.phoneNumber ?? "",
          dateOfIssueIso: doc0?.dateOfIssue ?? null,
          expiryIso: doc0?.expiryDate ?? null,
        };
      })
      .filter(Boolean) as TravelerRow[];

    return mapped;
  }, [rawPassengers, displayEmail]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingTraveler, setEditingTraveler] = useState<TravelerRow | null>(
    null,
  );
  const [form, setForm] = useState<{
    firstName: string;
    lastName: string;
    dob: Date | null;
    email: string;
    phone: string;
    gender: string;
    passportNumber: string;
    issuingCountryCode: string;
    residenceCountryCode: string;
    dateOfIssue: Date | null;
    expiryDate: Date | null;
    title: string;
  }>({
    firstName: "",
    lastName: "",
    dob: null,
    email: "",
    phone: "",
    gender: "male",
    passportNumber: "",
    issuingCountryCode: "",
    residenceCountryCode: "",
    dateOfIssue: null,
    expiryDate: null,
    title: "",
  });

  const parseDate = (iso?: string | null): Date | null => {
    const raw = String(iso ?? "").trim();
    if (!raw) return null;
    const d = new Date(`${raw}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const toIso = (d: Date | null) => {
    if (!d) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const countryLabelByIso2 = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of countriesOptions ?? []) {
      const code = String(c?.iso2 ?? "")
        .trim()
        .toUpperCase();
      const label = String(c?.label ?? "").trim();
      if (code && label) map.set(code, label);
    }
    return map;
  }, [countriesOptions]);
  const getCountryDisplay = (code?: string) => {
    const raw = String(code ?? "").trim();
    if (!raw) return "-";
    return countryLabelByIso2.get(raw.toUpperCase()) || raw;
  };
  const openEdit = (t: TravelerRow) => {
    setEditingTraveler(t);
    const genderNorm = String(t.gender ?? "")
      .trim()
      .toUpperCase();
    const area = t.phoneAreaCode
      ? `+${String(t.phoneAreaCode).replace(/^\+/, "")}`
      : "";
    const phone = `${area}${String(t.phoneNumber ?? "")}`;
    setForm({
      firstName: t.firstName,
      lastName: t.lastName,
      dob: parseDate(t.birthDate),
      email: t.email ?? "",
      phone,
      gender: genderNorm === "F" || genderNorm === "FEMALE" ? "female" : "male",
      passportNumber: t.passport ?? "",
      issuingCountryCode: t.issuingCountryCode ?? "",
      residenceCountryCode: t.residenceCountryCode ?? "",
      dateOfIssue: parseDate(t.dateOfIssueIso),
      expiryDate: parseDate(t.expiryIso),
      title: String(t.nameTitle ?? "").toUpperCase(),
    });
  };
  const saveEditedTraveler = async () => {
    if (!editingTraveler) return;
    const updatedAll = [...rawPassengers];
    const source = updatedAll[editingTraveler.sourceIndex];
    if (!source) return;
    const next = JSON.parse(JSON.stringify(source));
    next.passengerInfo = next.passengerInfo ?? {};
    next.identityDocuments = Array.isArray(next.identityDocuments)
      ? next.identityDocuments
      : [{}];
    next.identityDocuments[0] = next.identityDocuments[0] ?? {};
    next.contact = next.contact ?? {};
    next.contact.contactsProvided = Array.isArray(next.contact.contactsProvided)
      ? next.contact.contactsProvided
      : [{}];
    next.contact.contactsProvided[0] = next.contact.contactsProvided[0] ?? {};
    next.contact.contactsProvided[0].emailAddress = [form.email || ""];
    next.contact.contactsProvided[0].phone = Array.isArray(
      next.contact.contactsProvided[0].phone,
    )
      ? next.contact.contactsProvided[0].phone
      : [{}];
    next.contact.contactsProvided[0].phone[0] =
      next.contact.contactsProvided[0].phone[0] ?? {};

    const digits = String(form.phone || "").replace(/[^\d]/g, "");
    const areaCodeDigits = digits.slice(
      0,
      digits.length > 10 ? digits.length - 10 : 0,
    );
    const phoneDigits = digits.slice(
      digits.length > 10 ? digits.length - 10 : 0,
    );

    next.passengerInfo.givenName = form.firstName;
    next.passengerInfo.surname = form.lastName;
    next.passengerInfo.birthDate = toIso(form.dob);
    next.passengerInfo.gender = form.gender === "female" ? "F" : "M";
    next.passengerInfo.nameTitle =
      form.title || (form.gender === "female" ? "MS" : "MR");

    next.identityDocuments[0].idDocumentNumber = form.passportNumber;
    next.identityDocuments[0].issuingCountryCode = form.issuingCountryCode;
    next.identityDocuments[0].residenceCountryCode = form.residenceCountryCode;
    next.identityDocuments[0].dateOfIssue = toIso(form.dateOfIssue);
    next.identityDocuments[0].expiryDate = toIso(form.expiryDate);

    next.contact.contactsProvided[0].phone[0].label = "Origin";
    next.contact.contactsProvided[0].phone[0].areaCode = areaCodeDigits
      ? Number(areaCodeDigits)
      : "";
    next.contact.contactsProvided[0].phone[0].phoneNumber = phoneDigits
      ? Number(phoneDigits)
      : "";

    updatedAll[editingTraveler.sourceIndex] = next;

    const payload = buildPassengerCacheAddPayload(updatedAll, []);
    if (!payload) return;
    try {
      await addPassengerCache(payload as any);
      await refetchPassengerCache();
      toast.success("Traveler updated successfully.");
      setEditingTraveler(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to update traveler.");
    }
  };
  const removeTraveler = async (t: TravelerRow) => {
    const remaining = rawPassengers.filter((_, i) => i !== t.sourceIndex);
    const payload =
      remaining.length > 0
        ? buildPassengerCacheAddPayload(remaining, [])
        : { type: "add", passengers: [] };
    try {
      await addPassengerCache(payload as any);
      await refetchPassengerCache();
      toast.success("Traveler removed successfully.");
      if (expandedId === t.id) setExpandedId(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to remove traveler.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <div className="w-full rounded-2xl border border-[#E4E4E7] bg-white p-3 shadow-sm">
        <div className="mb-2">
          <h3 className="text-base font-medium text-[#0A0C0F]">
            Saved Travelers
          </h3>
          <p className="mt-1 text-[12px] text-[#3D495C]">
            Save passenger details for yourself and family members. These will
            be used to auto-fill booking forms.
          </p>
        </div>

        <div className="border-b border-[#E4E4E7] mb-3 -mx-3"></div>

        <div className="mt-4 space-y-3">
          {isLoading && (
            <div className="rounded-xl border border-[#E4E4E7] p-4 text-[13px] text-[#3D495C]">
              Loading saved travelers...
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
                className="rounded-2xl border border-[#C2CAD6] bg-[#F2F2F3]"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${t.bgColor}`}
                    >
                      {t.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-base font-semibold text-[#0A0C0F]">
                          {t.firstName} {t.lastName}
                        </div>
                        {t.isYou && (
                          <span className="rounded-full bg-[#A7C0EC] px-2 py-0.5 text-xs font-medium text-[#1A3C7A]">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="truncate text-xs text-[#3D495C]">
                        Passport: {t.passport || "-"} • Gender:{" "}
                        {normalizeGenderLabel(t.gender)} • DOB:{" "}
                        {formatIsoToDdMmmYyyy(t.birthDate) || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-3">
                    <Button
                      overrideClasses
                      type="button"
                      className="text-base font-medium text-[#5383DA]"
                      onClick={() => openEdit(t)}
                    >
                      Edit
                    </Button>
                    {!t.isYou && (
                      <Button
                        overrideClasses
                        type="button"
                        className="text-base font-semibold text-[#EA0029]"
                        onClick={() => void removeTraveler(t)}
                      >
                        Remove
                      </Button>
                    )}
                    <Button
                      type="button"
                      overrideClasses
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
                        className={
                          isExpanded
                            ? "rotate-180 transition-transform"
                            : "transition-transform"
                        }
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[#E4E4E7] px-4 py-4">
                    <div className="text-[12px] font-medium text-[#0A0C0F]">
                      Personal Details
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-5">
                      <div className="md:col-span-2">
                        <div className="text-[12px] text-[#3D495C]">
                          Full Name
                        </div>
                        <div className="mt-1 text-base font-medium text-[#0A0C0F]">
                          {t.firstName} {t.lastName}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#3D495C]">
                          Date of Birth
                        </div>
                        <div className="mt-1 text-base font-medium text-[#0A0C0F]">
                          {formatIsoToDdMmmYyyy(t.birthDate) || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#3D495C]">Gender</div>
                        <div className="mt-1 text-[12px] font-medium text-[#0A0C0F]">
                          {normalizeGenderLabel(t.gender)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#3D495C]">PAX Type</div>
                        <div className="mt-1 text-base font-medium text-[#0A0C0F]">
                          Adult
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-xs text-[#3D495C]">Email</div>
                        <div className="mt-1 truncate text-base font-medium text-[#0A0C0F]">
                          {t.email || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#3D495C]">
                          Residence Country
                        </div>
                        <div className="mt-1 truncate text-base font-medium text-[#0A0C0F]">
                          {getCountryDisplay(t.residenceCountryCode)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#3D495C]">Phone</div>
                        <div className="mt-1 text-base font-medium text-[#0A0C0F]">
                          {t.phoneAreaCode
                            ? `+${String(t.phoneAreaCode).replace(/^\+/, "")} `
                            : ""}
                          {t.phoneNumber || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-[12px] font-medium text-[#0A0C0F]">
                      Travel Documents
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-5">
                      <div className="md:col-span-2">
                        <div className="text-xs text-[#3D495C]">
                          Passport Number
                        </div>
                        <div className="mt-1 text-base font-medium text-[#0A0C0F]">
                          {t.passport || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#3D495C]">Issued By</div>
                        <div className="mt-1 text-base font-medium text-[#0A0C0F]">
                          {getCountryDisplay(t.issuingCountryCode)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#3D495C]">Issue Date</div>
                        <div className="mt-1 text-base font-medium text-[#0A0C0F]">
                          {formatIsoToDdmmyyyy(t.dateOfIssueIso) || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#3D495C]">
                          Expiry Date
                        </div>
                        <div className="mt-1 text-base font-medium text-[#0A0C0F]">
                          {formatIsoToDdmmyyyy(t.expiryIso) || "-"}
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
      <Modal
        closable
        open={!!editingTraveler}
        onCancel={() => setEditingTraveler(null)}
        footer={null}
        centered
        width={960}
        closeIcon={null}
        styles={{
          body: { padding: 0 },
          content: { borderRadius: 16, overflow: "visible", padding: 0 },
        }}
      >
        <div className="bg-[#FFFFFF] px-3 py-6 overflow-visible rounded-full">
          <div className="mb-10 text-center">
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center text-[#2351A3]">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.552 21.1866L22.0747 7.66389L20.1893 5.77855L6.66667 19.3012V21.1866H8.552ZM9.65733 23.8532H4V18.1959L19.2467 2.94922C19.4967 2.69926 19.8358 2.55884 20.1893 2.55884C20.5429 2.55884 20.882 2.69926 21.132 2.94922L24.904 6.72122C25.154 6.97126 25.2944 7.31033 25.2944 7.66389C25.2944 8.01744 25.154 8.35652 24.904 8.60655L9.65733 23.8532ZM4 26.5199H28V29.1866H4V26.5199Z"
                  fill="#1A3C7A"
                />
              </svg>
            </div>
            <h3 className="text-[18px] font-semibold text-[#0A0C0F] leading-tight">
              Edit Traveler Information
            </h3>
            <p className="mt-1 text-base text-[#3D495C]">
              Make changes to your saved traveler profile.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-6">
            <SearchableDropdown
              options={[
                { id: "mr", value: "MR", label: "Mr" },
                { id: "ms", value: "MS", label: "Ms" },
                { id: "mrs", value: "MRS", label: "Mrs" },
              ]}
              value={form.title}
              onChange={(value) => setForm((p) => ({ ...p, title: value }))}
              label="Title"
              labelClass="mb-1 block text-xs text-[#3D495C]"
              placeholder="Select title"
            />
            <TailwindCustomInput
              label="First Name"
              labelClass="mb-1 block text-xs text-[#3D495C]"
              value={form.firstName}
              onChange={(e) =>
                setForm((p) => ({ ...p, firstName: e.target.value }))
              }
            />
            <TailwindCustomInput
              label="Last Name"
              labelClass="mb-1 block text-xs text-[#3D495C]"
              value={form.lastName}
              onChange={(e) =>
                setForm((p) => ({ ...p, lastName: e.target.value }))
              }
            />
            <div>
              <label className="mb-1 block text-xs text-[#3D495C]">
                Date of birth
              </label>
              <TailiwindCustomDatePicker
                value={form.dob}
                onChange={(d) => setForm((p) => ({ ...p, dob: d }))}
                placeholder="Select date of birth"
                overridesClass
                inputClass="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-4 pr-10 text-sm text-[#0A0C0F] outline-none cursor-pointer"
              />
            </div>
            <TailwindCustomInput
              label="Email"
              labelClass="mb-1 block text-xs text-[#3D495C]"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />

            <SearchableDropdown
              options={[
                { id: "male", value: "male", label: "Male" },
                { id: "female", value: "female", label: "Female" },
              ]}
              value={form.gender}
              onChange={(value) => setForm((p) => ({ ...p, gender: value }))}
              label="Gender"
              labelClass="mb-1 block text-xs text-[#3D495C]"
              placeholder="Select gender"
            />
            <div>
              <label className="mb-1 block text-xs text-[#3D495C]">Phone</label>
              <PhoneInput
                defaultCountry="ae"
                value={form.phone}
                onChange={(phone) => setForm((p) => ({ ...p, phone }))}
                forceDialCode={true}
                hideDropdown={false}
                disableCountryGuess={false}
                className="custom-phone-wrapper"
                countrySelectorStyleProps={{
                  buttonClassName: "country-selector-btn",
                }}
                inputProps={{ placeholder: "Phone" }}
              />
            </div>
          </div>

          <div className="my-3 -mx-8 border-t border-[#E4E4E7]" />
          <h4 className="text-base font-medium text-[#0A0C0F]">
            Passport and Travel Documents
          </h4>
          <div className="my-3 -mx-8 border-b border-[#E4E4E7]" />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mt-6">
            <TailwindCustomInput
              label="Passport Number"
              labelClass="mb-1 block text-xs text-[#3D495C]"
              value={form.passportNumber}
              onChange={(e) =>
                setForm((p) => ({ ...p, passportNumber: e.target.value }))
              }
            />
            <SearchableDropdown
              options={countriesOptions.map((c) => ({
                id: c.iso2,
                value: c.iso2,
                label: c.label,
              }))}
              value={form.issuingCountryCode}
              onChange={(value) =>
                setForm((p) => ({ ...p, issuingCountryCode: value }))
              }
              label="Issuing Country"
              labelClass="mb-1 block text-xs text-[#3D495C]"
              placeholder="Select issuing country"
            />
            <div>
              <label className="mb-1 block text-xs text-[#3D495C]">
                Expiry Date
              </label>
              <TailiwindCustomDatePicker
                value={form.expiryDate}
                onChange={(d) => setForm((p) => ({ ...p, expiryDate: d }))}
                placeholder="Select expiry date"
                overridesClass
                inputClass="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-4 pr-10 text-sm text-[#0A0C0F] outline-none cursor-pointer"
                disablePastDates
              />
            </div>

            <SearchableDropdown
              options={countriesOptions.map((c) => ({
                id: c.iso2,
                value: c.iso2,
                label: c.label,
              }))}
              value={form.residenceCountryCode}
              onChange={(value) =>
                setForm((p) => ({ ...p, residenceCountryCode: value }))
              }
              label="Residence Country"
              labelClass="mb-1 block text-xs text-[#3D495C]"
              placeholder="Select residence country"
            />
            <div>
              <label className="mb-1 block text-xs text-[#3D495C]">
                Date of issue
              </label>
              <TailiwindCustomDatePicker
                value={form.dateOfIssue}
                onChange={(d) => setForm((p) => ({ ...p, dateOfIssue: d }))}
                placeholder="Select date of issue"
                overridesClass
                inputClass="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-4 pr-10 text-sm text-[#0A0C0F] outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-12 flex justify-center gap-3">
            <Button
              type="button"
              overrideClasses
              onClick={() => void saveEditedTraveler()}
              disabled={isSaving}
              className="rounded-full auth-bg-btn px-10 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
