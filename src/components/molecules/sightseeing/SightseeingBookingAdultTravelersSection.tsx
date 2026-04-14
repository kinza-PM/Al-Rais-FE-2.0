import { useCallback, useMemo } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import "../../../assets/css/travel.css";
import SearchableDropdown, {
  type DropdownOption,
} from "../../common/SearchableDropdown";
import TailiwindCustomDatePicker from "../../common/TailiwindCustomDatePicker";
import {
  formatDateToLocalISO,
  parseLocalDateString,
} from "../../../utils/helpers";
import type { SightseeingAdultTravelerForm } from "../../../features/sightseeing/sightseeingBooking";

/** Stored dial prefix → `defaultCountry` for {@link PhoneInput} (same hook as hotel booking). */
const DIAL_TO_ISO2: Record<string, string> = {
  "+1": "us",
  "+971": "ae",
  "+966": "sa",
  "+92": "pk",
  "+44": "gb",
  "+91": "in",
  "+20": "eg",
  "+33": "fr",
  "+49": "de",
  "+90": "tr",
};

function defaultCountryFromDial(dial: string): string {
  return DIAL_TO_ISO2[dial?.trim() ?? ""] ?? "us";
}

function combineDialAndNational(dial: string, national: string): string {
  return `${dial ?? ""}${national ?? ""}`;
}

export const SIGHTSEEING_TITLE_OPTIONS: DropdownOption[] = [
  { id: "mr", value: "Mr", label: "Mr" },
  { id: "mrs", value: "Mrs", label: "Mrs" },
  { id: "ms", value: "Ms", label: "Ms" },
  { id: "miss", value: "Miss", label: "Miss" },
  { id: "mx", value: "Mx", label: "Mx" },
  { id: "dr", value: "Dr", label: "Dr" },
];

export const SIGHTSEEING_NATIONALITY_OPTIONS: DropdownOption[] = [
  "United Arab Emirates",
  "United States",
  "United Kingdom",
  "Saudi Arabia",
  "Pakistan",
  "India",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Canada",
  "Australia",
  "Egypt",
  "Jordan",
  "Kuwait",
  "Qatar",
  "Oman",
  "Bahrain",
  "Turkey",
  "Malaysia",
  "Singapore",
  "China",
  "Japan",
  "South Korea",
  "Brazil",
  "Mexico",
  "South Africa",
  "Nigeria",
  "Morocco",
  "Russia",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Sweden",
  "Norway",
  "Ireland",
  "New Zealand",
].map((name, i) => ({
  id: `nat-${i}`,
  value: name,
  label: name,
}));

/** Figma: Title · 160×50 · 16px radius · 1.5px #C2CAD6 */
const TITLE_DROPDOWN_CLASS =
  "appearance-none h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-white pl-4 pr-11 text-[14px] text-[#0F172A] outline-none flex items-center cursor-pointer";

/** Figma: most fields · 50px height · 16px radius · 1px #E4E4E7 */
const FIELD_LIGHT_BORDER_CLASS =
  "h-[50px] w-full rounded-[16px] border border-[#E4E4E7] bg-white px-4 text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#C2CAD6] focus:ring-1 focus:ring-[#2351A3]/25";

const NATIONALITY_DROPDOWN_CLASS =
  "appearance-none h-[50px] w-full rounded-[16px] border border-[#E4E4E7] bg-white pl-4 pr-11 text-[14px] text-[#0F172A] outline-none flex items-center cursor-pointer";

/** Figma: track 35×21 · #2351A3 · knob 17×17 */
function SamePhoneToggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-[21px] w-[35px] shrink-0 rounded-[10.5px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2351A3] focus-visible:ring-offset-2 ${
        checked ? "bg-[#2351A3]" : "bg-[#E4E4E7]"
      }`}
    >
      <span
        className={`absolute top-[2px] h-[17px] w-[17px] rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[16px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

function TravelerFieldsBlock({
  index,
  traveler,
  onPatch,
}: {
  index: number;
  traveler: SightseeingAdultTravelerForm;
  onPatch: (patch: Partial<SightseeingAdultTravelerForm>) => void;
}) {
  const maxDobDate = useMemo(() => new Date(), []);
  const minDobDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 120);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const nLabel = String(index + 1).padStart(2, "0");
  const whatsappLocked = traveler.whatsappSameAsPhone;

  return (
    <div className="pt-8 first:pt-0">
      {index > 0 ? (
        <div
          className="mb-8 border-t border-dashed border-[#C2CAD6]"
          aria-hidden
        />
      ) : null}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[16px] font-bold text-[#0A0C0F]">
          Traveler {nLabel} - Adult
        </h3>
        {index === 0 ? (
          <span className="rounded-full bg-[#B9D1F9] px-3 py-1 text-[12px] font-semibold text-[#345995]">
            Lead Contact
          </span>
        ) : null}
      </div>

      {/* Row 1: Title 160 + Full name — Figma ~371 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-[15px]">
        <div className="w-full shrink-0 sm:w-[160px]">
          <label className="mb-1.5 block text-[12px] font-medium text-[#64748B]">
            Title
          </label>
          <SearchableDropdown
            label={undefined}
            options={SIGHTSEEING_TITLE_OPTIONS}
            value={traveler.title}
            onChange={(v) => onPatch({ title: v })}
            placeholder="Select title"
            searchPlaceholder="Search"
            className={TITLE_DROPDOWN_CLASS}
            widthClass="w-full"
            noInnerOptionsScroll
          />
        </div>
        <div className="min-w-0 flex-1">
          <label className="mb-1.5 block text-[12px] font-medium text-[#64748B]">
            Full name (Filled based on ID/Passport/Driver&apos;s license)
          </label>
          <input
            type="text"
            autoComplete="name"
            value={traveler.fullName}
            onChange={(e) => onPatch({ fullName: e.target.value })}
            placeholder="Enter your full name"
            className={`${FIELD_LIGHT_BORDER_CLASS} border-[1.5px] border-[#C2CAD6] focus:border-[#2351A3]`}
          />
        </div>
      </div>

      {/* Row 2: DOB 265 + Nationality 265 */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-[16px]">
        <div className="min-w-0 sm:max-w-[265px]">
          <label className="mb-1.5 block text-[12px] font-medium text-[#64748B]">
            Date of Birth
          </label>
          <TailiwindCustomDatePicker
            value={
              traveler.dateOfBirth
                ? parseLocalDateString(traveler.dateOfBirth)
                : null
            }
            onChange={(date) => {
              const iso = formatDateToLocalISO(date);
              onPatch({ dateOfBirth: iso ?? "" });
            }}
            placeholder="Please select"
            minDate={minDobDate}
            maxDate={maxDobDate}
            overridesClass
            inputClass="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#F9FAFB] px-3 text-sm placeholder:text-[#98A4B3] text-[#0A0C0F] focus:outline-none"
          />
        </div>
        <div className="min-w-0 sm:max-w-[265px]">
          <label className="mb-1.5 block text-[12px] font-medium text-[#64748B]">
            Nationality
          </label>
          <SearchableDropdown
            label={undefined}
            options={SIGHTSEEING_NATIONALITY_OPTIONS}
            value={traveler.nationality}
            onChange={(v) => onPatch({ nationality: v })}
            placeholder="Select nationality"
            searchPlaceholder="Search"
            className={NATIONALITY_DROPDOWN_CLASS}
            widthClass="w-full"
            noInnerOptionsScroll
          />
        </div>
      </div>

      {/* Row 3: Email 265 + Phone (107 + flex) */}
      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-[16px]">
        <div className="w-full shrink-0 lg:w-[265px]">
          <label className="mb-1.5 block text-[12px] font-medium text-[#64748B]">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            value={traveler.email}
            onChange={(e) => onPatch({ email: e.target.value })}
            placeholder="Enter your email"
            className={FIELD_LIGHT_BORDER_CLASS}
          />
        </div>
        <div className="min-w-0 flex-1">
          <label className="mb-1.5 block text-[12px] font-medium text-[#64748B]">
            Phone
          </label>
          <PhoneInput
            defaultCountry={defaultCountryFromDial(traveler.phoneCountryCode)}
            value={combineDialAndNational(
              traveler.phoneCountryCode,
              traveler.phoneNumber,
            )}
            onChange={(phone, meta) => {
              const dialCode = `+${meta.country.dialCode}`;
              const phoneNumber = phone.replace(dialCode, "");
              if (traveler.whatsappSameAsPhone) {
                onPatch({
                  phoneCountryCode: dialCode,
                  phoneNumber,
                  whatsappCountryCode: dialCode,
                  whatsappNumber: phoneNumber,
                });
              } else {
                onPatch({ phoneCountryCode: dialCode, phoneNumber });
              }
            }}
            forceDialCode={true}
            hideDropdown={false}
            className="custom-phone-wrapper"
            countrySelectorStyleProps={{
              buttonClassName: "country-selector-btn",
            }}
            inputProps={{
              placeholder: "Phone",
              autoComplete: "tel-national",
            }}
          />
        </div>
      </div>

      {/* Row 4: WhatsApp + Same as phone */}
      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-[16px]">
        <div className="min-w-0 flex-1">
          <label className="mb-1.5 block text-[12px] font-medium text-[#64748B]">
            WhatsApp (for tour updates)
          </label>
          <PhoneInput
            defaultCountry={defaultCountryFromDial(
              whatsappLocked
                ? traveler.phoneCountryCode
                : traveler.whatsappCountryCode,
            )}
            value={
              whatsappLocked
                ? combineDialAndNational(
                    traveler.phoneCountryCode,
                    traveler.phoneNumber,
                  )
                : combineDialAndNational(
                    traveler.whatsappCountryCode,
                    traveler.whatsappNumber,
                  )
            }
            onChange={(phone, meta) => {
              if (whatsappLocked) return;
              const dialCode = `+${meta.country.dialCode}`;
              const phoneNumber = phone.replace(dialCode, "");
              onPatch({
                whatsappCountryCode: dialCode,
                whatsappNumber: phoneNumber,
              });
            }}
            disabled={whatsappLocked}
            forceDialCode={true}
            hideDropdown={false}
            className="custom-phone-wrapper"
            countrySelectorStyleProps={{
              buttonClassName: "country-selector-btn",
            }}
            inputProps={{
              placeholder: "Phone",
              autoComplete: "tel-national",
            }}
          />
        </div>
        <div className="flex shrink-0 items-center gap-3 pb-1">
          <label
            htmlFor={`whatsapp-same-${index}`}
            className="cursor-pointer text-[13px] text-[#475569]"
          >
            Same as phone number
          </label>
          <SamePhoneToggle
            id={`whatsapp-same-${index}`}
            checked={traveler.whatsappSameAsPhone}
            onChange={(on) => {
              if (on) {
                onPatch({
                  whatsappSameAsPhone: true,
                  whatsappCountryCode: traveler.phoneCountryCode,
                  whatsappNumber: traveler.phoneNumber,
                });
              } else {
                onPatch({ whatsappSameAsPhone: false });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export type SightseeingBookingAdultTravelersSectionProps = {
  /** Number of adult traveller forms to show (from booking draft). */
  adultCount: number;
  travelers: SightseeingAdultTravelerForm[];
  onPatchTraveler: (
    index: number,
    patch: Partial<SightseeingAdultTravelerForm>,
  ) => void;
  onSubmit?: () => void;
  submitLabel?: string;
};

/**
 * Figma: white card 576×min ~904 · 16px radius · 1px #E4E4E7 · travellers copy.
 * Renders one block per adult.
 */
export function SightseeingBookingAdultTravelersSection({
  adultCount,
  travelers,
  onPatchTraveler,
  onSubmit,
  submitLabel = "Continue",
}: SightseeingBookingAdultTravelersSectionProps) {
  const patch = useCallback(
    (i: number, p: Partial<SightseeingAdultTravelerForm>) =>
      onPatchTraveler(i, p),
    [onPatchTraveler],
  );

  if (adultCount < 1 || travelers.length === 0) return null;

  return (
    <section
      className="mt-6 w-full max-w-[576px] rounded-[16px] border border-[#E4E4E7] bg-white px-[15px] py-6 sm:py-8"
      aria-labelledby="sightseeing-travelers-details-heading"
    >
      <h2
        id="sightseeing-travelers-details-heading"
        className="text-[20px] font-bold text-[#0A0C0F] sm:text-[22px]"
      >
        Travelers details
      </h2>
      <p className="mt-2 text-[14px] font-normal leading-relaxed text-[#64748B]">
        The lead contact will receive confirmation and tour vouchers.
      </p>
      <div className="my-6 border-t border-[#E8ECF0]" aria-hidden />

      {travelers.map((t, i) => (
        <TravelerFieldsBlock
          key={i}
          index={i}
          traveler={t}
          onPatch={(p) => patch(i, p)}
        />
      ))}

      {onSubmit ? (
        <button
          type="button"
          onClick={onSubmit}
          className="mt-10 flex h-[50px] w-full items-center justify-center rounded-full text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(35,81,163,0.35)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5383DA] focus-visible:ring-offset-2"
          style={{
            background: "linear-gradient(90deg, #4A7BD9 0%, #0A1D37 100%)",
          }}
        >
          {submitLabel}
        </button>
      ) : null}
    </section>
  );
}
