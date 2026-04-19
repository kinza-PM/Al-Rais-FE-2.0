import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "../assets/css/travel.css";
import { useActivityAvailability } from "../hooks/sightseeing/useActivityAvailability";
import { useActivityDetail } from "../hooks/sightseeing/useActivityDetail";
import SightseeingDetailGallery from "../components/molecules/sightseeing/SightseeingDetailGallery";
import { SightseeingInclusionsTable } from "../components/molecules/sightseeing/SightseeingInclusionsTable";
import { SightseeingMeetingPickupSection } from "../components/molecules/sightseeing/SightseeingMeetingPickupSection";
import { SightseeingGuestReviewsSection } from "../components/molecules/sightseeing/SightseeingGuestReviewsSection";
import { SightseeingYouMayAlsoLikeSection } from "../components/molecules/sightseeing/SightseeingYouMayAlsoLikeSection";
import {
  SIGHTSEEING_CTA_GRADIENT,
  SIGHTSEEING_DETAIL_TAB_LABELS,
  SIGHTSEEING_DETAIL_TAB_ORDER,
  SIGHTSEEING_FIGMA_ABOUT_PARAGRAPHS,
  SIGHTSEEING_FIGMA_TOUR_HIGHLIGHTS,
  type SightseeingDetailTabId,
} from "../components/molecules/sightseeing/sightseeingDetailCopy";
import {
  defaultActivityAvailabilityDateRange,
} from "../services/api/activitiesSearch";
import type {
  SightseeingActivity,
  SightseeingActivityDetailRate,
} from "../features/sightseeing/types";
import {
  buildTravellersSummary,
  clearPendingSightseeingDetailNav,
  consumePendingSightseeingDetailNav,
  formatPickupDateLong,
  formatTime12Hour,
  isoDateOnly,
  pickRateKeyFromPreview,
  readSightseeingCardPreview,
  savePendingSightseeingDetailNav,
  saveSightseeingCardPreview,
  type SightseeingBookingSummary,
  type SightseeingDetailNavState,
} from "../features/sightseeing/sightseeingBooking";
import { useAuth } from "../features/auth/hooks/useAuth";
import LoginModal from "../components/common/LoginModal";
import SearchableDropdown from "../components/common/SearchableDropdown";
import TailiwindCustomDatePicker from "../components/common/TailiwindCustomDatePicker";
import TailiwindCustomTimePicker from "../components/common/TailiwindCustomTimePicker";
import {
  formatDateToLocalISO,
  parseLocalDateString,
} from "../utils/helpers";

const FAVORITES_STORAGE_KEY = "alrais-sight-favorites";

function readFavoriteCodes(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map((x) => String(x)));
  } catch {
    return new Set();
  }
}

function reviewCountDisplay(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const i = Math.max(0, Math.floor(n));
  if (i < 1000) return String(i);
  return i.toLocaleString("en-US");
}

function formatSightseeingPrice(currency: string, amount: number): string {
  const n = amount.toFixed(0);
  switch (currency.trim().toUpperCase()) {
    case "USD":
      return `$${n}`;
    case "EUR":
      return `€${n}`;
    case "GBP":
      return `£${n}`;
    default:
      return `${currency.trim()} ${n}`;
  }
}

/** Match listing toolbar / city dropdowns (50px, 16px radius, 1.5px border). */
const PACKAGE_DROPDOWN_BUTTON_CLASS =
  "appearance-none h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-white pl-4 pr-11 text-[14px] text-[#0F172A] outline-none flex items-center cursor-pointer disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-70";

function packageModalityDisplayName(modalityName: string): string {
  const t = modalityName.trim();
  return t.toLowerCase() === "standard" ? "Silver" : t;
}

function packageRateDropdownLabel(rate: SightseeingActivityDetailRate): string {
  return `${packageModalityDisplayName(rate.modalityName)} · ${formatSightseeingPrice(rate.currency, rate.amount)}`;
}

function formatMoneyDecimals(currency: string, amount: number): string {
  const n = amount.toFixed(2);
  switch (currency.trim().toUpperCase()) {
    case "USD":
      return `$${n}`;
    case "EUR":
      return `€${n}`;
    case "GBP":
      return `£${n}`;
    default:
      return `${currency.trim()} ${n}`;
  }
}

const ADDON_FALCON_USD = 50;

function StarRow({ rating }: { rating: number }) {
  const r = Math.min(5, Math.max(0, rating));
  const full = Math.floor(r + 1e-6);
  const partial = r - full;
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${r} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) {
          return (
            <span key={i} className="text-[#F0B100]">
              ★
            </span>
          );
        }
        if (i === full && partial > 0.15) {
          return (
            <span key={i} className="text-[#F0B100]/80">
              ★
            </span>
          );
        }
        return (
          <span key={i} className="text-[#E5E7EB]">
            ★
          </span>
        );
      })}
    </div>
  );
}

type InfoCard = { label: string; value: string };

/** Figma: two-line label + gray minus / count / solid blue plus */
function TravellerStepRow({
  label,
  ageRange,
  value,
  min,
  onDec,
  onInc,
}: {
  label: string;
  ageRange: string;
  value: number;
  min: number;
  onDec: () => void;
  onInc: () => void;
}) {
  const decDisabled = value <= min;
  const countBlue = label === "Adults" ? value >= 1 : value > 0;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#F2F4F7] px-4 py-3">
      <div>
        <p className="text-[14px] font-bold text-[#0A0C0F]">{label}</p>
        <p className="text-[12px] text-[#64748B]">{ageRange}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDec}
          disabled={decDisabled}
          className={
            decDisabled
              ? "flex h-8 w-8 shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-[#E8ECF0] bg-[#F8FAFC] text-[18px] font-medium leading-none text-[#CBD5E1]"
              : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C2CAD6] bg-white text-[18px] font-medium leading-none text-[#64748B] hover:bg-white"
          }
          aria-label="Decrease"
        >
          −
        </button>
        <span
          className={`min-w-[2ch] text-center text-[15px] font-semibold tabular-nums ${
            countBlue ? "text-[#2351A3]" : "text-[#64748B]"
          }`}
        >
          {String(value).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onInc}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2351A3] text-[18px] font-medium leading-none text-white hover:bg-[#1B407F]"
          aria-label="Increase"
        >
          +
        </button>
      </div>
    </div>
  );
}

const SightseeingActivityDetailPage: React.FC = () => {
  const { activityCode: activityCodeParam } = useParams<{
    activityCode: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const state = (location.state || {}) as SightseeingDetailNavState;
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const activityCode = activityCodeParam
    ? decodeURIComponent(activityCodeParam)
    : "";

  const range = useMemo(() => {
    if (state.from && state.to) {
      return { from: state.from, to: state.to };
    }
    return defaultActivityAvailabilityDateRange(30);
  }, [state.from, state.to]);

  const { data: detail, isLoading, isError, error } = useActivityDetail({
    activityCode,
    from: range.from,
    to: range.to,
  });

  const relatedDestinationCode = state.context?.destinationCode?.trim();
  const { data: sameDestinationActivities } = useActivityAvailability({
    destinationCode: relatedDestinationCode,
    enabled: Boolean(relatedDestinationCode),
  });
  const youMayAlsoLikeCatalogue = useMemo(
    () => sameDestinationActivities ?? [],
    [sameDestinationActivities],
  );

  const effectivePreview = useMemo((): SightseeingActivity | undefined => {
    return state.preview ?? readSightseeingCardPreview(activityCode);
  }, [state.preview, activityCode]);

  useEffect(() => {
    if (state.preview && activityCode) {
      saveSightseeingCardPreview(activityCode, state.preview);
    }
  }, [activityCode, state.preview]);

  useEffect(() => {
    if (!isAuthenticated || !activityCode) return;
    const pending = consumePendingSightseeingDetailNav();
    if (!pending?.activityId?.trim()) return;
    const pid = pending.activityId.trim();
    const norm = (s: string) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    };
    if (norm(pid) === norm(activityCode)) return;
    const preview = pending.navState?.preview;
    if (preview) saveSightseeingCardPreview(pid, preview);
    navigate(`/sightseeing-detail/${encodeURIComponent(pid)}`, {
      replace: true,
      state: pending.navState,
    });
  }, [isAuthenticated, activityCode, navigate]);

  const previewRateSyncedRef = useRef(false);
  useEffect(() => {
    previewRateSyncedRef.current = false;
  }, [activityCode]);

  const [selectedRateKey, setSelectedRateKey] = useState<string>(
    () => state.draft?.selectedRateKey ?? "",
  );
  const [activeTab, setActiveTab] = useState<SightseeingDetailTabId>("overview");
  const [adults, setAdults] = useState(() => state.draft?.adults ?? 1);
  const [teens, setTeens] = useState(() => state.draft?.teens ?? 0);
  const [children, setChildren] = useState(() => state.draft?.children ?? 0);
  const [pickupTime24, setPickupTime24] = useState(
    () => state.draft?.pickupTime24 ?? "",
  );
  const [falconAddon, setFalconAddon] = useState(
    () => state.draft?.falconAddon ?? false,
  );
  const [selectedTourDate, setSelectedTourDate] = useState(() =>
    isoDateOnly(state.draft?.selectedTourDate ?? range.from),
  );

  const minTourDate = useMemo(
    () => parseLocalDateString(isoDateOnly(range.from)) ?? new Date(),
    [range.from],
  );
  const maxTourDate = useMemo(
    () => parseLocalDateString(isoDateOnly(range.to)) ?? new Date(),
    [range.to],
  );

  const rateOptions = detail?.rateOptions ?? [];

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!activityCode) return;
    setIsFavorite(readFavoriteCodes().has(activityCode));
  }, [activityCode]);

  const toggleFavorite = useCallback(() => {
    if (!activityCode) return;
    const next = readFavoriteCodes();
    if (next.has(activityCode)) {
      next.delete(activityCode);
      toast.success("Removed from favorites");
    } else {
      next.add(activityCode);
      toast.success("Saved to favorites");
    }
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify([...next]),
    );
    setIsFavorite(next.has(activityCode));
  }, [activityCode]);

  useEffect(() => {
    if (rateOptions.length === 0) {
      if (selectedRateKey !== "") setSelectedRateKey("");
      return;
    }

    const valid = rateOptions.some((r) => r.rateKey === selectedRateKey);

    if (
      state.draft?.selectedRateKey &&
      valid &&
      selectedRateKey === state.draft.selectedRateKey
    ) {
      previewRateSyncedRef.current = true;
      return;
    }

    if (valid && previewRateSyncedRef.current) return;

    if (!previewRateSyncedRef.current && effectivePreview) {
      const want = pickRateKeyFromPreview(rateOptions, effectivePreview);
      if (want) {
        setSelectedRateKey(want);
        previewRateSyncedRef.current = true;
        return;
      }
    }

    if (!valid) {
      setSelectedRateKey(rateOptions[0].rateKey);
      previewRateSyncedRef.current = true;
    }
  }, [rateOptions, selectedRateKey, effectivePreview, state.draft, activityCode]);

  const packageDropdownOptions = useMemo(
    () =>
      rateOptions.map((r) => ({
        id: r.rateKey,
        value: r.rateKey,
        label: packageRateDropdownLabel(r),
      })),
    [rateOptions],
  );

  const displayTitle = detail?.name || effectivePreview?.title || activityCode;

  const imageUrls = useMemo(() => {
    const fromApi = detail?.imageUrls?.filter((u) => u?.trim()) ?? [];
    if (fromApi.length > 0) return fromApi;
    if (effectivePreview?.imageSrc?.trim())
      return [effectivePreview.imageSrc.trim()];
    return [];
  }, [detail?.imageUrls, effectivePreview?.imageSrc]);

  const displayRating =
    detail != null ? detail.rating : effectivePreview?.rating ?? 0;
  const displayReviewCount =
    detail != null ? detail.reviewCount : effectivePreview?.reviewCount ?? 0;

  const badgeRow = useMemo(() => {
    const fromApi = detail?.badges?.filter(Boolean) ?? [];
    if (fromApi.length > 0) return fromApi;
    if (!effectivePreview) return [];
    const out: string[] = [];
    if (
      effectivePreview.reviewCount >= 500 &&
      effectivePreview.rating >= 4.5
    ) {
      out.push("Best Seller");
    }
    if (effectivePreview.durationLabel)
      out.push(effectivePreview.durationLabel);
    return out;
  }, [detail?.badges, effectivePreview]);

  const selectedRate = useMemo(
    () =>
      rateOptions.find((r) => r.rateKey === selectedRateKey) ?? rateOptions[0],
    [rateOptions, selectedRateKey],
  );

  const displayPriceAmount =
    selectedRate?.amount ?? effectivePreview?.price ?? 0;
  const displayCurrency =
    selectedRate?.currency ??
    effectivePreview?.currency ??
    detail?.currency ??
    "USD";

  const infoCards = useMemo((): InfoCard[] => {
    const duration =
      detail?.durationLabel ||
      detail?.badges?.find((b) => /hour|day|hrs/i.test(b)) ||
      effectivePreview?.durationLabel ||
      "6 Hours";
    const cancel =
      detail?.badges?.some((b) => /free.*cancel/i.test(b)) ||
      badgeRow.some((b) => /free.*cancel/i.test(b))
        ? "Free < 24 hrs"
        : "See policy";
    return [
      { label: "Duration", value: duration },
      {
        label: "Group Size",
        value:
          effectivePreview?.groupSize === "private"
            ? "Private"
            : effectivePreview?.groupSize === "large"
              ? "Up to 40"
              : "Up to 16",
      },
      { label: "Languages", value: "EN, AR, RU" },
      { label: "Pickup", value: "Hotel included" },
      { label: "Min. Age", value: "4 years" },
      { label: "Cancellation", value: cancel },
    ];
  }, [detail, effectivePreview, badgeRow]);

  const travellerCount = adults + teens + children;
  const bookingSubtotal = useMemo(() => {
    const base = displayPriceAmount;
    if (!Number.isFinite(base) || base <= 0) return 0;
    return base * adults + base * 0.9 * teens + base * 0.75 * children;
  }, [displayPriceAmount, adults, teens, children]);
  const addonLineTotal = falconAddon ? ADDON_FALCON_USD * travellerCount : 0;
  const bookingGrandTotal = bookingSubtotal + addonLineTotal;

  const clampCount = (n: number) => Math.min(9, Math.max(0, n));

  const onShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: displayTitle, url });
        return;
      } catch {
        /* user cancel or unavailable */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  }, [displayTitle]);

  const onReadAllReviews = useCallback(() => {
    setActiveTab("reviews");
    window.setTimeout(() => {
      document
        .getElementById("sightseeing-guest-reviews")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, []);

  const onBookNow = useCallback(() => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    if (!pickupTime24.trim()) {
      toast.error("Please select a pick-up time");
      return;
    }
    if (!activityCode) return;

    const modalityLabel = selectedRate
      ? packageModalityDisplayName(selectedRate.modalityName)
      : packageModalityDisplayName(effectivePreview?.groupLabel ?? "") ||
        "Tour";
    const pkgCurrency = selectedRate?.currency ?? displayCurrency;
    const pkgAmount = selectedRate?.amount ?? displayPriceAmount;
    const packageSummary = `${modalityLabel} (${formatSightseeingPrice(
      pkgCurrency,
      pkgAmount,
    )} per person)`;

    const draftPayload = {
      selectedRateKey: selectedRateKey || selectedRate?.rateKey || "",
      adults,
      teens,
      children,
      selectedTourDate,
      pickupTime24,
      falconAddon,
    };

    const summary: SightseeingBookingSummary = {
      activityCode,
      title: displayTitle,
      imageSrc: imageUrls[0] || effectivePreview?.imageSrc || "",
      categoryLabel: effectivePreview?.categoryLabel ?? "Sightseeing Tour",
      countryLabel:
        state.context?.country?.trim() ||
        effectivePreview?.countryName?.trim() ||
        detail?.countryName?.trim() ||
        "",
      durationLabel:
        detail?.durationLabel ?? effectivePreview?.durationLabel ?? "—",
      groupLabel: effectivePreview?.groupLabel ?? "—",
      packageSummary,
      travellersSummary: buildTravellersSummary(adults, teens, children),
      pickupDateDisplay: formatPickupDateLong(selectedTourDate),
      pickupTimeDisplay: formatTime12Hour(pickupTime24),
      enhancementsSummary: falconAddon
        ? "Falcon Handling & Photography"
        : "Not Added",
      grandTotal: bookingGrandTotal,
      currency: displayCurrency,
      draft: draftPayload,
    };

    navigate(`/sightseeing-booking/${encodeURIComponent(activityCode)}`, {
      state: {
        summary,
        returnState: {
          from: range.from,
          to: range.to,
          preview: effectivePreview ?? undefined,
          context: state.context,
        },
      },
    });
  }, [
    pickupTime24,
    activityCode,
    selectedRate,
    selectedRateKey,
    displayCurrency,
    displayPriceAmount,
    adults,
    teens,
    children,
    selectedTourDate,
    falconAddon,
    bookingGrandTotal,
    displayTitle,
    imageUrls,
    effectivePreview,
    detail?.durationLabel,
    detail?.countryName,
    navigate,
    range.from,
    range.to,
    state.context,
    isAuthenticated,
  ]);

  const aboutParagraphs = useMemo(() => {
    const d = detail?.description?.trim();
    if (d) {
      const parts = d
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length > 0) return parts;
      return [d];
    }
    return SIGHTSEEING_FIGMA_ABOUT_PARAGRAPHS;
  }, [detail?.description]);

  const tourHighlights = useMemo(() => {
    const h = detail?.highlights;
    if (h && h.length > 0) return h;
    return SIGHTSEEING_FIGMA_TOUR_HIGHLIGHTS;
  }, [detail?.highlights]);

  const handleRelatedBookNow = useCallback(
    (activity: SightseeingActivity) => {
      const range = defaultActivityAvailabilityDateRange(30);
      const navPayload: SightseeingDetailNavState = {
        from: range.from,
        to: range.to,
        preview: activity,
        context: state.context,
      };
      if (!isAuthenticated) {
        savePendingSightseeingDetailNav({
          activityId: activity.id,
          navState: navPayload,
        });
        setLoginModalOpen(true);
        return;
      }
      saveSightseeingCardPreview(activity.id, activity);
      navigate(`/sightseeing-detail/${encodeURIComponent(activity.id)}`, {
        state: navPayload,
      });
    },
    [isAuthenticated, navigate, state.context],
  );

  const tabPanel = () => {
    if (activeTab === "overview") {
      return (
        <div className="w-full max-w-full min-w-0">
          <h2 className="text-[20px] font-bold tracking-tight text-[#0A0C0F]">
            About this activity
          </h2>
          <div className="mt-5 space-y-5 text-[16px] font-normal leading-6 tracking-normal text-[#0A0C0F]">
            {aboutParagraphs.map((p, idx) => (
              <p key={`${idx}-${p.slice(0, 24)}`}>{p}</p>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {infoCards.map((card) => (
              <div
                key={card.label}
                className="flex h-[74px] max-w-[280px] flex-col justify-center gap-[5px] rounded-lg bg-[#F2F4F7] p-[15px]"
              >
                <p className="text-[12px] font-medium text-[#64748B]">
                  {card.label}
                </p>
                <p className="text-[15px] font-bold text-[#0A0C0F]">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex max-w-[798px] flex-col gap-[10px]">
            <h2 className="min-h-[37px] text-[20px] font-bold leading-tight text-[#0A0C0F]">
              Tour highlights
            </h2>
            <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
              {tourHighlights.map((line, i) => (
                <li
                  key={`${i}-${line.slice(0, 24)}`}
                  className="flex items-start gap-[10px]"
                >
                  <span
                    className="flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full bg-[#A7C0EC] text-center text-[14px] font-semibold leading-none tracking-normal text-[#2351A3]"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 pt-0.5 text-[16px] font-normal leading-6 text-[#0A0C0F]">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-10">
            <SightseeingInclusionsTable />
          </div>
          <div className="mt-10 w-full max-w-full min-w-0">
            <SightseeingMeetingPickupSection />
          </div>
          <div className="mt-10 w-full max-w-full min-w-0">
            <SightseeingGuestReviewsSection
              id="sightseeing-guest-reviews"
              onReadAllReviews={onReadAllReviews}
              excludeActivityId={activityCode}
            />
          </div>
        </div>
      );
    }
    if (activeTab === "highlights") {
      return (
        <div className="max-w-[791px] space-y-4 text-[16px] leading-6 text-[#3D495C]">
          {detail?.description ? (
            <p>{detail.description}</p>
          ) : (
            <p>
              Supplier highlights for this activity will appear here when
              available from the API.
            </p>
          )}
        </div>
      );
    }
    if (activeTab === "inclusion") {
      return <SightseeingInclusionsTable />;
    }
    if (activeTab === "meeting") {
      return (
        <div className="w-full max-w-full min-w-0">
          <SightseeingMeetingPickupSection />
        </div>
      );
    }
    return (
      <div className="w-full max-w-full min-w-0">
        <SightseeingGuestReviewsSection
          id="sightseeing-guest-reviews"
          onReadAllReviews={onReadAllReviews}
          excludeActivityId={activityCode}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-16 font-[Inter,sans-serif]">
      <div className="mx-auto w-full max-w-[1341px] px-6 pt-8 sm:px-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 text-[14px] font-medium text-[#2351A3] hover:underline"
        >
          ← Back to results
        </button>

        <div className="space-y-8 sm:space-y-10">
          <SightseeingDetailGallery
            imageUrls={imageUrls}
            alt={displayTitle}
          />

          <div className="space-y-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-[#98A4B3]">
                  Sightseeing · Activity detail
                </p>
                <h1 className="mt-2 text-[22px] font-bold leading-tight tracking-tight text-[#0A0C0F] sm:text-[28px] lg:text-[32px]">
                  {displayTitle}
                </h1>
                {badgeRow.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {badgeRow.map((b) => (
                      <span
                        key={b}
                        className="rounded-full bg-[#F1F5F9] px-3 py-1 text-[13px] font-medium text-[#475569]"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <StarRow rating={displayRating} />
                  <span className="text-[15px] font-semibold text-[#0A0C0F]">
                    {displayRating.toFixed(1)}
                  </span>
                  <span className="text-[15px] text-[#64748B]">
                    ({reviewCountDisplay(displayReviewCount)})
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 flex-row flex-wrap items-center justify-start gap-[10px] lg:justify-end lg:pt-1">
                <button
                  type="button"
                  onClick={onShare}
                  className="text-[15px] font-semibold text-[#2563EB] hover:underline"
                >
                  Share
                </button>
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className="flex h-[47px] min-w-[211px] items-center justify-center gap-[10px] rounded-full px-10 py-[14px] text-[14px] font-bold leading-none text-white transition-opacity hover:opacity-95"
                  style={{ background: SIGHTSEEING_CTA_GRADIENT }}
                >
                  {isFavorite ? "Saved" : "Add to favorites"}
                </button>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-[872px] flex-col items-stretch">
              <div
                className="px-3 pt-4 pb-1 sm:px-6"
                role="tablist"
                aria-label="Activity sections"
              >
                <div className="flex flex-wrap justify-center gap-[15px] pt-2 sm:flex-nowrap">
                  {SIGHTSEEING_DETAIL_TAB_ORDER.map((id) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === id}
                      onClick={() => setActiveTab(id)}
                      className={`h-[44px] w-[105px] shrink-0 rounded-t-2xl text-center text-[12px] font-medium leading-tight transition-colors sm:text-[13px] ${
                        activeTab === id
                          ? "bg-[#43C6E2] text-white"
                          : "bg-[#F2F4F7] text-[#0A0C0F] hover:bg-[#E8EAEE]"
                      }`}
                    >
                      {SIGHTSEEING_DETAIL_TAB_LABELS[id]}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className="h-[10px] w-full shrink-0 rounded-t-[16px] backdrop-blur-[10px]"
                style={{
                  background:
                    "linear-gradient(180deg, #C4CFE1 0%, #DEF7FE 100%)",
                }}
                aria-hidden
              />
            </div>

            <div className="grid grid-cols-1 gap-10 pt-10 lg:grid-cols-[minmax(0,791px)_minmax(300px,400px)] lg:gap-x-12 lg:gap-y-0 lg:items-start">
              <div>
                <div className="mt-0" role="tabpanel">
                  {tabPanel()}
                </div>

                {isLoading ? (
                  <p className="mt-6 text-[15px] text-[#3D495C]">
                    Loading detail…
                  </p>
                ) : null}
                {isError ? (
                  <p className="mt-6 text-[15px] text-red-600">
                    {(error as Error)?.message ||
                      "Could not load activity detail."}
                  </p>
                ) : null}
              </div>

              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-2xl border border-[#E4E4E7] bg-white p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                    <div className="min-w-0">
                      <p className="text-[32px] font-bold leading-none text-[#2351A3]">
                        {formatSightseeingPrice(
                          displayCurrency,
                          displayPriceAmount,
                        )}
                      </p>
                      <p className="mt-2 text-[14px] text-[#64748B]">
                        per person · taxes included
                      </p>
                    </div>
                    <div className="w-full shrink-0 sm:w-[200px] sm:max-w-[240px]">
                      <span className="text-[12px] font-normal text-[#64748B]">
                        Your Package
                      </span>
                      <div className="mt-1">
                        {packageDropdownOptions.length > 0 ? (
                          <SearchableDropdown
                            options={packageDropdownOptions}
                            value={selectedRateKey}
                            onChange={setSelectedRateKey}
                            placeholder="Select a package"
                            label={undefined}
                            widthClass="w-full"
                            searchPlaceholder="Search"
                            className={PACKAGE_DROPDOWN_BUTTON_CLASS}
                            disabled={isLoading}
                            noInnerOptionsScroll
                          />
                        ) : (
                          <div
                            className={`${PACKAGE_DROPDOWN_BUTTON_CLASS} cursor-default opacity-80`}
                          >
                            <span className="truncate">
                              {isLoading
                                ? "Loading packages…"
                                : effectivePreview
                                  ? `${packageModalityDisplayName(effectivePreview.groupLabel) || "Tour"} · ${formatSightseeingPrice(
                                      effectivePreview.currency,
                                      effectivePreview.price,
                                    )}`
                                  : "Package"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#E8ECF0] py-6">
                    <h3 className="text-[16px] font-bold text-[#0A0C0F]">
                      Travellers
                    </h3>
                    <p className="mt-1 text-[13px] text-[#64748B]">
                      Prices vary by age group
                    </p>
                    <div className="mt-4 space-y-3">
                      <TravellerStepRow
                        label="Adults"
                        ageRange="Age 18+"
                        value={adults}
                        min={1}
                        onDec={() =>
                          setAdults((n) => Math.max(1, clampCount(n - 1)))
                        }
                        onInc={() => setAdults((n) => clampCount(n + 1))}
                      />
                      <TravellerStepRow
                        label="Teens"
                        ageRange="Age 13–17"
                        value={teens}
                        min={0}
                        onDec={() => setTeens((n) => clampCount(n - 1))}
                        onInc={() => setTeens((n) => clampCount(n + 1))}
                      />
                      <TravellerStepRow
                        label="Children"
                        ageRange="Age 6–12"
                        value={children}
                        min={0}
                        onDec={() => setChildren((n) => clampCount(n - 1))}
                        onInc={() => setChildren((n) => clampCount(n + 1))}
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#E8ECF0] py-6">
                    <h3 className="text-[16px] font-bold text-[#0A0C0F]">
                      Pickup date &amp; time
                    </h3>
                    <p className="mt-1 text-[13px] text-[#64748B]">
                      Tour date within your search window and preferred pick-up
                      time
                    </p>
                    <label className="mb-1.5 mt-4 block text-[12px] font-medium text-[#64748B]">
                      Date &amp; time
                    </label>
                    <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-[16px] border border-[#C2CAD6] bg-[#F9FAFB] sm:h-[50px] sm:flex-row sm:items-stretch sm:px-2">
                      <div className="min-h-[50px] min-w-0 flex-1 border-b border-[#E4E4E7] sm:min-h-0 sm:border-b-0">
                        <TailiwindCustomDatePicker
                          value={parseLocalDateString(selectedTourDate)}
                          onChange={(date) => {
                            const iso = formatDateToLocalISO(date);
                            if (iso) setSelectedTourDate(iso);
                          }}
                          placeholder="Tour date"
                          minDate={minTourDate}
                          maxDate={maxTourDate}
                          buttonIconSrc
                          overridesClass
                          showCalendarIconRight={false}
                          inputClass="h-[50px] w-full min-w-0 cursor-pointer rounded-none border-none bg-transparent pl-10 pr-3 text-[14px] text-[#0A0C0F] outline-none placeholder:text-[#98A4B3] sm:rounded-[16px] sm:pr-1"
                        />
                      </div>
                      <span
                        className="hidden shrink-0 select-none self-center px-1 text-[#94A3B8] sm:inline"
                        aria-hidden
                      >
                        —
                      </span>
                      <div className="min-h-[50px] min-w-0 flex-1 sm:min-h-0">
                        <TailiwindCustomTimePicker
                          value={pickupTime24}
                          onChange={(hhmm) => setPickupTime24(hhmm)}
                          placeholder="Pick-up time"
                          panelTitle="Pick-up time"
                          overridesClass
                          inputClass="h-[50px] w-full min-w-0 cursor-pointer rounded-none border-none bg-transparent pl-3 pr-10 text-[14px] text-[#0A0C0F] outline-none placeholder:text-[#98A4B3] sm:rounded-[16px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#E8ECF0] py-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-[16px] font-bold text-[#0A0C0F]">
                        Enhance your experience
                      </h3>
                      <span className="text-[13px] font-medium text-[#64748B]">
                        Optional add-ons
                      </span>
                    </div>
                    <label className="mt-4 flex w-full max-w-[546px] min-h-[88px] cursor-pointer items-center gap-[11px] rounded-[16px] bg-[#F2F2F3] p-[15px] transition-colors hover:bg-[#E8E9EB]">
                      <input
                        type="checkbox"
                        className="h-6 w-6 shrink-0 cursor-pointer appearance-none rounded-[8px] border-[1.5px] border-[#C2CAD6] bg-white text-[#2351A3] transition-colors checked:border-[#2351A3] checked:bg-[#2351A3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2351A3] focus-visible:ring-offset-2"
                        checked={falconAddon}
                        onChange={(e) => setFalconAddon(e.target.checked)}
                        style={{
                          backgroundImage: falconAddon
                            ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M3.5 8.5l2.5 2.5 6-6' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
                            : undefined,
                          backgroundSize: "12px 12px",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-[11px]">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-[14px] font-bold leading-tight text-[#0A0C0F]">
                            Falcon Handling & Photography
                          </span>
                          <span className="shrink-0 text-right leading-tight">
                            <span className="text-[14px] font-bold text-[#2351A3]">
                              $50
                            </span>
                            <span className="text-[13px] font-normal text-[#64748B]">
                              /per person
                            </span>
                          </span>
                        </div>
                        <p className="text-[13px] font-normal leading-relaxed text-[#64748B]">
                          Hold a trained Peregrine falcon and get a professional photograph. A truly unique Arabian cultural experience.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="border-t border-[#E8ECF0] py-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[15px] font-medium text-[#64748B]">
                        Total
                      </span>
                      <span className="text-[24px] font-bold leading-none tracking-tight text-[#0A0C0F]">
                        {formatMoneyDecimals(displayCurrency, bookingGrandTotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onBookNow}
                    className="mt-6 flex h-[47px] w-full items-center justify-center gap-2.5 rounded-full px-10 py-[14px] text-[14px] font-bold leading-none text-white shadow-[0_4px_14px_rgba(35,81,163,0.35)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5383DA] focus-visible:ring-offset-2"
                    style={{ background: SIGHTSEEING_CTA_GRADIENT }}
                  >
                    Book now
                  </button>
                </div>
              </aside>
            </div>

            <SightseeingYouMayAlsoLikeSection
              className="mt-12 w-full min-w-0 pt-2 sm:mt-14"
              relatedActivities={youMayAlsoLikeCatalogue}
              excludeActivityId={activityCode}
              bookNowContext={state.context}
              onBookNowOverride={handleRelatedBookNow}
              layout="grid"
            />
          </div>
        </div>
      </div>
      <LoginModal
        showModal={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
          clearPendingSightseeingDetailNav();
        }}
      />
    </div>
  );
};

export default SightseeingActivityDetailPage;
