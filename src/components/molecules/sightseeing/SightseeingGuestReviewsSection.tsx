import {
  SIGHTSEEING_CTA_GRADIENT,
  SIGHTSEEING_FIGMA_GUEST_REVIEW_CARDS,
  SIGHTSEEING_FIGMA_GUEST_REVIEWS_DISTRIBUTION,
  SIGHTSEEING_FIGMA_GUEST_REVIEWS_SUMMARY,
  SIGHTSEEING_FIGMA_GUEST_REVIEWS_TITLE,
  SIGHTSEEING_READ_ALL_REVIEWS_LABEL,
  type SightseeingGuestReviewCard,
} from "./sightseeingDetailCopy";

const STAR_FILL = "#FACC15";
const STAR_EMPTY = "#E5E7EB";
const BAR_TRACK = "#E2E8F0";
const BAR_FILL = "#3B82F6";

const REVIEW_AVATAR_PALETTES = [
  { bg: "#2351A3", fg: "#FFFFFF" },
  { bg: "#0F766E", fg: "#FFFFFF" },
  { bg: "#6D28D9", fg: "#FFFFFF" },
  { bg: "#B45309", fg: "#FFFFFF" },
  { bg: "#0369A1", fg: "#FFFFFF" },
] as const;

function reviewAuthorInitials(name: string): string {
  const cleaned = name.replace(/\./g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const w = parts[0];
    return w.slice(0, Math.min(2, w.length)).toUpperCase();
  }
  return (
    (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  );
}

function avatarPaletteForId(id: string): (typeof REVIEW_AVATAR_PALETTES)[number] {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h + id.charCodeAt(i) * (i + 1)) % 997;
  return REVIEW_AVATAR_PALETTES[h % REVIEW_AVATAR_PALETTES.length];
}

function ReviewAvatar({
  authorName,
  cardId,
}: {
  authorName: string;
  cardId: string;
}) {
  const initials = reviewAuthorInitials(authorName);
  const { bg, fg } = avatarPaletteForId(cardId);

  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-2 ring-white/70 shadow-sm"
      style={{ backgroundColor: bg, color: fg }}
      aria-hidden
    >
      <span className="text-[13px] font-semibold leading-none tracking-tight">
        {initials}
      </span>
    </div>
  );
}

function reviewCountLabel(n: number): string {
  if (!Number.isFinite(n)) return "0 reviews";
  const i = Math.max(0, Math.floor(n));
  return `${i.toLocaleString("en-US")} reviews`;
}

function StarGlyph({
  filled,
  className = "",
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{ color: filled ? STAR_FILL : STAR_EMPTY }}
      aria-hidden
    >
      ★
    </span>
  );
}

/** Stars for summary — Figma: five gold stars under overall score */
function SummaryStarRow({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-0.5 text-[22px] leading-none sm:text-2xl ${className ?? ""}`}
      aria-hidden
    >
      {Array.from({ length: 5 }, (_, i) => (
        <StarGlyph key={i} filled className="block" />
      ))}
    </div>
  );
}

function CardStarRow({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  const r = Math.min(5, Math.max(0, rating));
  const full = Math.floor(r + 1e-6);
  return (
    <div
      className={`flex shrink-0 items-center gap-px text-[13px] leading-none sm:text-[14px] ${className ?? ""}`}
      aria-label={`${r} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <StarGlyph key={i} filled={i < full} className="block" />
      ))}
    </div>
  );
}

function DistributionBars() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:gap-2.5">
      {SIGHTSEEING_FIGMA_GUEST_REVIEWS_DISTRIBUTION.map((row) => (
        <div
          key={row.stars}
          className="grid grid-cols-[1rem_1fr_2.25rem] items-center gap-2 sm:grid-cols-[1.25rem_1fr_2.5rem] sm:gap-3"
        >
          <span className="text-right text-[13px] font-medium tabular-nums text-[#374151] sm:text-[14px]">
            {row.stars}
          </span>
          <div
            className="h-2 min-w-0 overflow-hidden rounded-full"
            style={{ backgroundColor: BAR_TRACK }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{
                width: `${row.percent}%`,
                backgroundColor: BAR_FILL,
              }}
            />
          </div>
          <span className="text-right text-[12px] font-medium tabular-nums text-[#64748B] sm:text-[13px]">
            {row.percent}%
          </span>
        </div>
      ))}
    </div>
  );
}

function ReviewCard({ card }: { card: SightseeingGuestReviewCard }) {
  return (
    <article className="rounded-2xl bg-[#F3F4F6] px-5 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:px-4 sm:py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <ReviewAvatar authorName={card.authorName} cardId={card.id} />
          <div className="min-w-0 pt-0.5">
            <p className="text-[15px] font-bold leading-tight text-[#0A0C0F] sm:text-[16px]">
              {card.authorName}
            </p>
            <p className="mt-1 text-[12px] font-medium leading-tight text-[#64748B] sm:text-[13px]">
              {card.dateLocation}
            </p>
          </div>
        </div>
        <CardStarRow rating={card.rating} className="pt-0.5" />
      </div>
      <p className="mb-0 mt-[7px] text-[14px] font-normal leading-relaxed text-[#374151] sm:text-[12px] sm:leading-4">
        {card.body}
      </p>
    </article>
  );
}

export type SightseeingGuestReviewsSectionProps = {
  id?: string;
  onReadAllReviews?: () => void;
  excludeActivityId?: string;
};

export function SightseeingGuestReviewsSection({
  id,
  onReadAllReviews,
  excludeActivityId,
}: SightseeingGuestReviewsSectionProps) {
  const { scoreDisplay, reviewCount } = SIGHTSEEING_FIGMA_GUEST_REVIEWS_SUMMARY;

  return (
    <div className="w-full min-w-0">
      <div id={id} className="w-full max-w-[872px]">
      <h2 className="mb-6 text-[20px] font-bold leading-tight tracking-tight text-[#0A0C0F]">
        {SIGHTSEEING_FIGMA_GUEST_REVIEWS_TITLE}
      </h2>

      <div className="w-full">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="flex shrink-0 flex-col items-center text-center lg:shrink-0">
            <p className="m-0 align-middle font-[Inter,sans-serif] text-[92px] font-semibold leading-[100%] tracking-[-0.01em] text-[#0A0C0F]">
              {scoreDisplay}
            </p>
            <div className="mt-3 flex justify-center">
              <SummaryStarRow />
            </div>
            <p className="mt-3 text-[14px] font-medium text-[#64748B] sm:text-[15px]">
              {reviewCountLabel(reviewCount)}
            </p>
          </div>

          <div className="min-w-0 flex-1 lg:max-w-[603px]">
            <DistributionBars />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:mt-8 sm:gap-5">
        {SIGHTSEEING_FIGMA_GUEST_REVIEW_CARDS.map((card) => (
          <ReviewCard key={card.id} card={card} />
        ))}
      </div>

      <div className="mt-6 flex justify-center sm:mt-8">
        <button
          type="button"
          onClick={onReadAllReviews}
          className="group inline-flex h-[47px] w-[213px] shrink-0 items-center justify-center gap-2.5 rounded-full px-6 py-[14px] text-[14px] font-bold leading-none text-white shadow-[0_4px_14px_rgba(35,81,163,0.35)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5383DA] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          style={{ background: SIGHTSEEING_CTA_GRADIENT }}
        >
          {SIGHTSEEING_READ_ALL_REVIEWS_LABEL}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      </div>
    </div>
  );
}
