import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { SightseeingActivity } from "../../../features/sightseeing/types";
import { DUMMY_SIGHTSEEING_ACTIVITIES } from "../../../features/sightseeing/data/dummyActivities";
import { defaultActivityAvailabilityDateRange } from "../../../services/api/activitiesSearch";
import SightseeingActivityCard from "./SightseeingActivityCard";
import {
  SIGHTSEEING_VIEW_ALL_ACTIVITIES_LABEL,
  SIGHTSEEING_YOU_MAY_ALSO_LIKE_TITLE,
} from "./sightseeingDetailCopy";

const RELATED_COUNT = 4;

export type SightseeingRelatedBookContext = {
  country?: string;
  city?: string;
  destinationCode?: string;
};

export type SightseeingYouMayAlsoLikeSectionProps = {
  className?: string;
  /** Hide the activity the user is already viewing (dummy `id` or URL `activityCode`). */
  excludeActivityId?: string;
  /** Passed through `navigate` state as `context` for the detail page. */
  bookNowContext?: SightseeingRelatedBookContext;
  /**
   * `grid` — responsive row matching detail Figma (full content width).
   * `carousel` — horizontal scroll (e.g. narrow columns).
   */
  layout?: "grid" | "carousel";
};

function pickRelatedActivities(
  excludeId: string | undefined,
): SightseeingActivity[] {
  const ex = excludeId?.trim();
  const filtered = ex
    ? DUMMY_SIGHTSEEING_ACTIVITIES.filter((a) => a.id !== ex && a.id !== decodeURIComponent(ex))
    : [...DUMMY_SIGHTSEEING_ACTIVITIES];

  if (filtered.length >= RELATED_COUNT) {
    return filtered.slice(0, RELATED_COUNT);
  }
  return DUMMY_SIGHTSEEING_ACTIVITIES.slice(0, RELATED_COUNT);
}

export function SightseeingYouMayAlsoLikeSection({
  className = "",
  excludeActivityId,
  bookNowContext,
  layout = "carousel",
}: SightseeingYouMayAlsoLikeSectionProps) {
  const navigate = useNavigate();
  const items = useMemo(
    () => pickRelatedActivities(excludeActivityId),
    [excludeActivityId],
  );

  const onBookNow = React.useCallback(
    (activity: SightseeingActivity) => {
      const range = defaultActivityAvailabilityDateRange(30);
      navigate(`/sightseeing-detail/${encodeURIComponent(activity.id)}`, {
        state: {
          from: range.from,
          to: range.to,
          preview: activity,
          context: bookNowContext ?? {},
        },
      });
    },
    [navigate, bookNowContext],
  );

  return (
    <section
      className={`w-full min-w-0 ${className}`}
      aria-labelledby="sightseeing-you-may-also-like-heading"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="sightseeing-you-may-also-like-heading"
          className="text-[20px] font-bold leading-tight tracking-tight text-[#0A0C0F]"
        >
          {SIGHTSEEING_YOU_MAY_ALSO_LIKE_TITLE}
        </h2>
        <Link
          to="/search-sightseeing"
          className="text-[15px] font-semibold text-[#2563EB] hover:underline"
        >
          {SIGHTSEEING_VIEW_ALL_ACTIVITIES_LABEL}
        </Link>
      </div>

      {layout === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {items.map((activity) => (
            <SightseeingActivityCard
              key={activity.id}
              activity={activity}
              onBookNow={onBookNow}
              fullWidth
            />
          ))}
        </div>
      ) : (
        <div className="-mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-visible pb-2 pt-1 [scrollbar-gutter:stable] sm:-mx-0">
          {items.map((activity) => (
            <div
              key={activity.id}
              className="w-[min(378.67px,calc(100vw-2.5rem))] shrink-0 snap-start sm:w-[min(378.67px,calc(100%-1rem))]"
            >
              <SightseeingActivityCard
                activity={activity}
                onBookNow={onBookNow}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
