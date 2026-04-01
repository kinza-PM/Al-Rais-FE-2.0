import { useCallback, useId, useState } from "react";

export type SightseeingProtectionChoice = "damage" | "none";

type Props = {
  className?: string;
  onReserve?: (choice: SightseeingProtectionChoice) => void;
};

const PROTECTION_FEATURES = [
  "Coverage up to $25,000 for certain vandalism, and collision damage",
  "$0 deductible on claims",
  "24/7 emergency assistance, including help with car return",
  "100% refund of this paid plan cost if you cancel insurance before car pick-up time.",
] as const;

const NO_PROTECTION_RISKS = [
  "Rental car repairs and replacement expenses",
  "Deductible costs under protection bought at pick-up",
] as const;

const SECTION_GRADIENT_RESERVE =
  "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)";

function GreenCheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="8" cy="8" r="7.25" stroke="#00B868" strokeWidth="1.5" fill="none" />
      <path
        d="M4.5 8.25L7 10.75L11.5 5.25"
        stroke="#00B868"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RedRiskIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="8" cy="8" r="7.25" stroke="#E11D48" strokeWidth="1.5" fill="none" />
      <path
        d="M4.5 8.25L7 10.75L11.5 5.25"
        stroke="#E11D48"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 ${className}`}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="10" cy="10" r="7.5" stroke="#2563EB" strokeWidth="1.5" />
      <path
        d="M10 9.25V14M10 6.75h.01"
        stroke="#2563EB"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExternalLinkIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 3.5H3.5v9h9V10M12.5 3.5L6.5 9.5M9 3.5h3.5V7"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RadioIndicator({ selected }: { selected: boolean }) {
  return (
    <span
      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#2351A3] bg-white"
      aria-hidden
    >
      {selected ? (
        <span className="h-2.5 w-2.5 rounded-full bg-[#2351A3]" />
      ) : null}
    </span>
  );
}

/**
 * Figma: Get Protection · 576 outer · nested option cards · Reserve Now CTA.
 */
export function SightseeingGetProtectionSection({
  className = "",
  onReserve,
}: Props) {
  const id = useId();
  const [choice, setChoice] = useState<SightseeingProtectionChoice>("damage");

  const onReserveClick = useCallback(() => {
    onReserve?.(choice);
  }, [choice, onReserve]);

  const damageId = `${id}-damage`;
  const noneId = `${id}-none`;

  return (
    <section
      className={`mt-8 w-full max-w-[576px] rounded-[16px] border-[1.5px] border-[#E4E4E7] bg-white px-[15px] pb-8 pt-6 sm:pb-10 sm:pt-8 ${className}`}
      aria-labelledby={`${id}-heading`}
    >
      <h2
        id={`${id}-heading`}
        className="text-[20px] font-bold tracking-tight text-[#0A0C0F] sm:text-[22px]"
      >
        Get Protection
      </h2>
      <p className="mt-2 max-w-[520px] text-[14px] font-normal leading-relaxed text-[#64748B]">
        Plans can change. Protection gives you the flexibility to cancel before
        pick-up.
      </p>

      <div className="mt-6 flex flex-col gap-4" role="radiogroup" aria-label="Protection options">
        {/* Rental Car Damage Protection */}
        <div>
          <input
            id={damageId}
            type="radio"
            name={`protection-${id}`}
            className="sr-only"
            checked={choice === "damage"}
            onChange={() => setChoice("damage")}
          />
          <label
            htmlFor={damageId}
            className={`block cursor-pointer rounded-[16px] border-[1.5px] bg-[#F2F2F3] transition-shadow ${
              choice === "damage"
                ? "border-[#2351A3] shadow-[0_0_0_1px_rgba(35,81,163,0.25)]"
                : "border-[#E4E4E7] hover:border-[#C2CAD6]"
            }`}
          >
            <div className="relative p-4 sm:p-[15px]">
              <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
                <span
                  className="inline-flex items-center rounded-[100px] border border-[#00B868] bg-[#85FFCA] px-[10px] py-[10px] text-[12px] font-semibold leading-none text-[#00B868]"
                  aria-label="Recommended"
                >
                  Recommended
                </span>
              </div>

              <div className="flex gap-3 pr-[100px] sm:pr-[120px]">
                <RadioIndicator selected={choice === "damage"} />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold leading-snug text-[#0A0C0F] sm:text-[16px]">
                    Rental Car Damage Protection
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-[14px] text-[#64748B]">
                      <span className="font-bold text-[#0A0C0F]">$11</span>
                      /per calendar day
                    </span>
                    <span
                      className="inline-flex text-[#2563EB]"
                      aria-label="More information about protection pricing"
                      role="presentation"
                    >
                      <InfoIcon />
                    </span>
                  </div>
                </div>
              </div>

              <div className="mx-1 my-4 border-t border-[#E4E4E7] sm:mx-0" />

              <div className="pl-0 sm:pl-8">
                <p className="text-[14px] font-normal text-[#64748B]">
                  Get extra peace of mind with
                </p>
                <ul className="mt-3 flex list-none flex-col gap-3 p-0">
                  {PROTECTION_FEATURES.map((line) => (
                    <li key={line.slice(0, 32)} className="flex gap-3">
                      <GreenCheckIcon className="mt-0.5" />
                      <span className="text-[14px] font-normal leading-relaxed text-[#0A0C0F]">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="#insurance-disclosures"
                className="mt-5 inline-flex items-center gap-2 text-left text-[14px] font-semibold text-[#2563EB] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5383DA] focus-visible:ring-offset-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                View insurance details and disclosures
                <ExternalLinkIcon className="text-[#2563EB]" />
              </a>
            </div>
          </label>
        </div>

        {/* No Protection */}
        <div>
          <input
            id={noneId}
            type="radio"
            name={`protection-${id}`}
            className="sr-only"
            checked={choice === "none"}
            onChange={() => setChoice("none")}
          />
          <label
            htmlFor={noneId}
            className={`block cursor-pointer rounded-[16px] border-[1.5px] bg-white transition-shadow ${
              choice === "none"
                ? "border-[#2351A3] shadow-[0_0_0_1px_rgba(35,81,163,0.25)]"
                : "border-[#E4E4E7] hover:border-[#C2CAD6]"
            }`}
          >
            <div className="p-4 sm:p-[15px]">
              <div className="flex gap-3">
                <RadioIndicator selected={choice === "none"} />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold leading-snug text-[#0A0C0F] sm:text-[16px]">
                    No Protection
                  </p>
                  <p className="mt-2 text-[13px] font-normal leading-relaxed text-[#64748B] sm:text-[14px]">
                    I understand that by declining this protection now, similar
                    protection may cost more at pick-up
                  </p>
                </div>
              </div>

              <div className="mx-1 my-4 border-t border-[#E4E4E7] sm:mx-0" />

              <div className="pl-0 sm:pl-8">
                <p className="text-[14px] font-normal text-[#64748B]">
                  You could be responsible for certain:
                </p>
                <ul className="mt-3 flex list-none flex-col gap-3 p-0">
                  {NO_PROTECTION_RISKS.map((line) => (
                    <li key={line.slice(0, 28)} className="flex gap-3">
                      <RedRiskIcon className="mt-0.5" />
                      <span className="text-[14px] font-normal leading-relaxed text-[#0A0C0F]">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={onReserveClick}
        className="mt-8 flex h-[52px] w-full items-center justify-center rounded-full text-[15px] font-bold leading-none text-white shadow-[0_4px_14px_rgba(35,81,163,0.35)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5383DA] focus-visible:ring-offset-2"
        style={{ background: SECTION_GRADIENT_RESERVE }}
      >
        Reserve Now
      </button>
    </section>
  );
}
