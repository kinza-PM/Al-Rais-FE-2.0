/** Marketing copy aligned with Figma “About this activity” (Overview tab). */
export const SIGHTSEEING_FIGMA_ABOUT_PARAGRAPHS: [string, string] = [
  "Experience the magic of the Arabian Desert on this unforgettable sunset safari. Your expert guide will take you deep into the golden dunes of the Dubai Desert Conservation Reserve for an afternoon of thrilling dune bashing, serene camel riding, and a lavish Bedouin-style BBQ dinner under a canopy of stars.",
  "This expertly curated tour balances adrenaline-pumping adventure with cultural immersion — from sandboarding down towering dunes to sipping fresh Arabic coffee in a traditional camp while watching a mesmerizing Tanura dance performance.",
];

export type SightseeingDetailTabId =
  | "overview"
  | "highlights"
  | "inclusion"
  | "meeting"
  | "reviews";

export const SIGHTSEEING_DETAIL_TAB_ORDER: SightseeingDetailTabId[] = [
  "overview",
  "highlights",
  "inclusion",
  "meeting",
  "reviews",
];

export const SIGHTSEEING_DETAIL_TAB_LABELS: Record<
  SightseeingDetailTabId,
  string
> = {
  overview: "Overview",
  highlights: "Highlights",
  inclusion: "Inclusion",
  meeting: "Meeting Point",
  reviews: "Reviews",
};

/** Figma “Tour highlights” — numbered list copy (Overview tab). */
export const SIGHTSEEING_FIGMA_TOUR_HIGHLIGHTS: readonly string[] = [
  "Thrilling 4×4 dune bashing across the iconic red sand dunes of Dubai Desert Conservation Reserve",
  "Sunset camel ride with sweeping panoramic views of the golden desert landscape",
  "Sandboarding down the steepest dunes — all equipment provided with expert instruction",
  "Traditional Bedouin camp experience: shisha, henna painting, Arabic coffee & dates",
  "Lavish unlimited BBQ dinner with vegetarian options, soft drinks, and fresh juices",
  "Cultural performances: Tanoura dance, belly dancing, and fire show under the stars",
  "Round-trip hotel transfers from all major Dubai & Sharjah hotels included",
];

/** Figma inclusion matrix: yes = green ✓, no = red ✗, addon = ✗ + “(Add-on)”. */
export type SightseeingInclusionCell = "yes" | "no" | "addon";

export type SightseeingInclusionRow = {
  label: string;
  basic: SightseeingInclusionCell;
  standard: SightseeingInclusionCell;
  silver: SightseeingInclusionCell;
  gold: SightseeingInclusionCell;
};

export const SIGHTSEEING_FIGMA_INCLUSION_ROWS: readonly SightseeingInclusionRow[] =
  [
    {
      label: "Round-trip hotel transfers",
      basic: "yes",
      standard: "yes",
      silver: "yes",
      gold: "yes",
    },
    {
      label: "Dune Bashing in 4x4",
      basic: "yes",
      standard: "yes",
      silver: "yes",
      gold: "yes",
    },
    {
      label: "Sandboarding Equipment",
      basic: "yes",
      standard: "yes",
      silver: "yes",
      gold: "yes",
    },
    {
      label: "Camel Ride",
      basic: "yes",
      standard: "yes",
      silver: "yes",
      gold: "yes",
    },
    {
      label: "Unlimited BBQ Dinner",
      basic: "yes",
      standard: "yes",
      silver: "yes",
      gold: "yes",
    },
    {
      label: "Soft Drinks & Juices",
      basic: "yes",
      standard: "yes",
      silver: "yes",
      gold: "yes",
    },
    {
      label: "Henna Painting",
      basic: "addon",
      standard: "yes",
      silver: "yes",
      gold: "yes",
    },
    {
      label: "Cultural Shows",
      basic: "no",
      standard: "addon",
      silver: "yes",
      gold: "yes",
    },
    {
      label: "Professional Guide",
      basic: "no",
      standard: "yes",
      silver: "yes",
      gold: "yes",
    },
    {
      label: "Horse Riding",
      basic: "addon",
      standard: "yes",
      silver: "yes",
      gold: "yes",
    },
    {
      label: "Quad Biking",
      basic: "no",
      standard: "addon",
      silver: "yes",
      gold: "yes",
    },
    {
      label: "Falcon Photography",
      basic: "addon",
      standard: "addon",
      silver: "addon",
      gold: "yes",
    },
    {
      label: "Travel Insurance",
      basic: "addon",
      standard: "addon",
      silver: "addon",
      gold: "yes",
    },
    {
      label: "Personal Tips",
      basic: "no",
      standard: "yes",
      silver: "yes",
      gold: "yes",
    },
    {
      label: "Alcoholic Beverages",
      basic: "no",
      standard: "no",
      silver: "addon",
      gold: "yes",
    },
  ];

/** Figma “Meeting & pickup” — line segments for mixed weight copy. */
export type SightseeingMeetingPickupLinePart = {
  text: string;
  bold?: boolean;
};

export type SightseeingMeetingPickupLine = {
  parts: readonly SightseeingMeetingPickupLinePart[];
};

export const SIGHTSEEING_FIGMA_MEETING_PICKUP_TITLE = "Meeting & pickup";

export const SIGHTSEEING_FIGMA_MEETING_PICKUP_LINES: readonly SightseeingMeetingPickupLine[] =
  [
    {
      parts: [
        { text: "Pickup from your hotel", bold: true },
        {
          text: " — Our driver will collect you from your hotel lobby between ",
        },
        { text: "3:00 PM – 3:30 PM", bold: true },
        { text: "." },
      ],
    },
    {
      parts: [
        { text: "Return drop-off is at your hotel between " },
        { text: "9:30 PM – 10:00 PM", bold: true },
        { text: "." },
      ],
    },
  ];

/** Footer note under pickup copy — smaller, muted (Figma). */
export const SIGHTSEEING_FIGMA_MEETING_PICKUP_FOOTER =
  "Covers all Dubai & Sharjah hotels. Abu Dhabi pickups available at extra charge.";

/** Primary CTA — Figma gradient (favorites, Book now, Read all reviews). */
export const SIGHTSEEING_CTA_GRADIENT =
  "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)";

/** Figma “Guest reviews” — summary + distribution + sample cards (placeholder until API). */
export const SIGHTSEEING_FIGMA_GUEST_REVIEWS_TITLE = "Guest reviews";

export const SIGHTSEEING_READ_ALL_REVIEWS_LABEL = "Read all reviews";

export const SIGHTSEEING_FIGMA_GUEST_REVIEWS_SUMMARY = {
  /** Display score (string preserves Figma “4.8”). */
  scoreDisplay: "4.8",
  reviewCount: 3500,
} as const;

export const SIGHTSEEING_FIGMA_GUEST_REVIEWS_DISTRIBUTION: readonly {
  stars: number;
  percent: number;
}[] = [
  { stars: 5, percent: 85 },
  { stars: 4, percent: 10 },
  { stars: 3, percent: 3 },
  { stars: 2, percent: 1 },
  { stars: 1, percent: 1 },
];

export type SightseeingGuestReviewCard = {
  id: string;
  authorName: string;
  dateLocation: string;
  rating: number;
  body: string;
};

export const SIGHTSEEING_FIGMA_GUEST_REVIEW_CARDS: readonly SightseeingGuestReviewCard[] =
  [
    {
      id: "gr-1",
      authorName: "Sarah M.",
      dateLocation: "March 2026 · United Kingdom",
      rating: 5,
      body: "Absolutely incredible evening — the dune bashing was thrilling and the camp dinner exceeded expectations. Our guide was friendly and professional from hotel pickup to drop-off. Highly recommend for anyone visiting Dubai.",
    },
    {
      id: "gr-2",
      authorName: "James L.",
      dateLocation: "February 2026 · United States",
      rating: 5,
      body: "Great value for money. Sunset over the desert was unforgettable, and the cultural shows were a nice touch. Smooth booking process and punctual transfers. Would book again without hesitation.",
    },
    {
      id: "gr-3",
      authorName: "Elena K.",
      dateLocation: "January 2026 · Germany",
      rating: 5,
      body: "Organized tour with clear communication. Felt safe during the 4×4 ride and loved the camel experience. Vegetarian options at the BBQ were plentiful. A highlight of our trip.",
    },
    {
      id: "gr-4",
      authorName: "Marcus T.",
      dateLocation: "December 2025 · Australia",
      rating: 5,
      body: "Worth every dollar — the desert at golden hour is unreal. Driver was on time, vehicle was clean, and the BBQ had plenty of variety. Kids loved the sandboarding. We’ll be telling friends back home about this.",
    },
  ];
