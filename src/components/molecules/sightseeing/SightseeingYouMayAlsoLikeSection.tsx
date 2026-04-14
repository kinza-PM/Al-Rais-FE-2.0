import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { SightseeingActivity } from "../../../features/sightseeing/types";
import { saveSightseeingCardPreview } from "../../../features/sightseeing/sightseeingBooking";
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
  /** Supplier listing rows for the same destination (e.g. from `getAvailability` cache). */
  relatedActivities: SightseeingActivity[];
  /** Hide the activity the user is already viewing (`activityCode` from URL). */
  excludeActivityId?: string;
  /** Passed through `navigate` state as `context` for the detail page. */
  bookNowContext?: SightseeingRelatedBookContext;
  /**
   * When set (e.g. login gate), invoked instead of the default navigate-to-detail behaviour.
   */
  onBookNowOverride?: (activity: SightseeingActivity) => void;
  /**
   * `grid` — responsive row matching detail Figma (full content width).
   * `carousel` — horizontal scroll (e.g. narrow columns).
   */
  layout?: "grid" | "carousel";
};

function filterRelated(
  source: SightseeingActivity[],
  excludeId: string | undefined,
): SightseeingActivity[] {
  const ex = excludeId?.trim();
  if (!ex) return source.slice(0, RELATED_COUNT);
  let decoded = ex;
  try {
    decoded = decodeURIComponent(ex);
  } catch {
    /* keep ex */
  }
  return source
    .filter((a) => a.id !== ex && a.id !== decoded)
    .slice(0, RELATED_COUNT);
}

export function SightseeingYouMayAlsoLikeSection({
  className = "",
  relatedActivities,
  excludeActivityId,
  bookNowContext,
  onBookNowOverride,
  layout = "carousel",
}: SightseeingYouMayAlsoLikeSectionProps) {
  const navigate = useNavigate();
  const items = useMemo(
    () => filterRelated(relatedActivities, excludeActivityId),
    [relatedActivities, excludeActivityId],
  );

  const onBookNow = React.useCallback(
    (activity: SightseeingActivity) => {
      if (onBookNowOverride) {
        onBookNowOverride(activity);
        return;
      }
      const range = defaultActivityAvailabilityDateRange(30);
      saveSightseeingCardPreview(activity.id, activity);
      navigate(`/sightseeing-detail/${encodeURIComponent(activity.id)}`, {
        state: {
          from: range.from,
          to: range.to,
          preview: activity,
          context: bookNowContext ?? {},
        },
      });
    },
    [navigate, bookNowContext, onBookNowOverride],
  );

  if (items.length === 0) return null;

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
