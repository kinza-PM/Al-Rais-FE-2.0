import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../../../assets/css/travel.css";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { DUMMY_SIGHTSEEING_ACTIVITIES, SIGHTSEEING_QUICK_FILTERS } from "../../../features/sightseeing/data/dummyActivities";
import type {
  SightseeingActivity,
  SightseeingQuickFilterId,
} from "../../../features/sightseeing/types";
import { useActivityAvailability } from "../../../hooks/sightseeing/useActivityAvailability";
import { defaultActivityAvailabilityDateRange } from "../../../services/api/activitiesSearch";
import Loader from "../../atoms/Loader";
import SightseeingActivityCard from "./SightseeingActivityCard";
import SightseeingFiltersSidebar, {
  type SightseeingListFiltersState,
} from "./SightseeingFiltersSidebar";
import SightseeingListingToolbar, {
  type SightseeingToolbarValues,
} from "./SightseeingListingToolbar";

type LocationState = {
  country?: string;
  city?: string;
  /** Supplier destination code from `destinationByOurCountry` (for `getAvailability`). */
  destinationCode?: string;
  category?: string;
};

const defaultToolbar = (
  state: LocationState,
): SightseeingToolbarValues => ({
  country: state.country?.trim() || "",
  city: state.city?.trim() || "",
  destinationCode: state.destinationCode?.trim() || "",
  category: state.category?.trim() || "all",
});

const defaultListFilters = (): SightseeingListFiltersState => ({
  sort: "recommended",
  groupSizes: [],
  starRatings: [],
  hourBuckets: [],
  ageChildren: false,
  ageTeens: false,
  ageAdults: false,
  priceMin: "",
  priceMax: "",
});

function countActiveSidebarFilters(f: SightseeingListFiltersState): number {
  let n = 0;
  if (f.groupSizes.length) n += 1;
  if (f.starRatings.length) n += 1;
  if (f.hourBuckets.length) n += 1;
  if (f.ageChildren || f.ageTeens || f.ageAdults) n += 1;
  const minN = parseFloat(f.priceMin);
  const maxN = parseFloat(f.priceMax);
  if ((f.priceMin !== "" && !Number.isNaN(minN)) || (f.priceMax !== "" && !Number.isNaN(maxN)))
    n += 1;
  return n;
}

function filterActivities(
  list: SightseeingActivity[],
  quick: SightseeingQuickFilterId,
  f: SightseeingListFiltersState,
): SightseeingActivity[] {
  return list.filter((a) => {
    if (quick !== "all" && a.quickFilter !== quick) return false;

    if (
      f.groupSizes.length > 0 &&
      !f.groupSizes.includes(a.groupSize)
    )
      return false;

    if (f.starRatings.length && !f.starRatings.includes(a.starLevel))
      return false;

    if (f.hourBuckets.length && !f.hourBuckets.includes(a.hours))
      return false;

    if (f.ageChildren && !a.allowsChildren) return false;
    if (f.ageTeens && !a.allowsTeens) return false;
    if (f.ageAdults && !a.allowsAdults) return false;

    const minN = parseFloat(f.priceMin);
    const maxN = parseFloat(f.priceMax);
    if (f.priceMin !== "" && !Number.isNaN(minN) && a.price < minN) return false;
    if (f.priceMax !== "" && !Number.isNaN(maxN) && a.price > maxN) return false;

    return true;
  });
}

function sortActivities(
  list: SightseeingActivity[],
  sort: SightseeingListFiltersState["sort"],
): SightseeingActivity[] {
  const copy = [...list];
  switch (sort) {
    case "name":
      return copy.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
      );
    case "price_low":
      return copy.sort((a, b) => a.price - b.price);
    case "price_high":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "rating_low":
      return copy.sort((a, b) => a.rating - b.rating);
    default:
      return copy;
  }
}

const SightseeingListing: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navState = (location.state || {}) as LocationState;

  const [toolbar, setToolbar] = useState<SightseeingToolbarValues>(() =>
    defaultToolbar(navState),
  );
  const [listFilters, setListFilters] = useState<SightseeingListFiltersState>(
    defaultListFilters,
  );
  const [quickFilter, setQuickFilter] =
    useState<SightseeingQuickFilterId>("all");

  useEffect(() => {
    setToolbar(defaultToolbar(navState));
  }, [
    navState.country,
    navState.city,
    navState.destinationCode,
    navState.category,
  ]);

  const destCode = toolbar.destinationCode?.trim() ?? "";
  const useLiveAvailability = destCode.length > 0;

  const {
    data: liveActivities,
    isLoading: isLiveLoading,
    isError: isLiveError,
    error: liveError,
  } = useActivityAvailability({
    destinationCode: destCode,
    enabled: useLiveAvailability,
  });

  useEffect(() => {
    if (isLiveError && liveError) {
      toast.error(
        (liveError as Error).message ||
          "Could not load activities for this destination",
      );
    }
  }, [isLiveError, liveError]);

  const onToolbarSearch = useCallback(
    (values: SightseeingToolbarValues) => {
      setToolbar(values);
      navigate("/search-sightseeing", {
        replace: true,
        state: {
          country: values.country,
          city: values.city,
          destinationCode: values.destinationCode,
          category: values.category,
        },
      });
    },
    [navigate],
  );

  const catalogue = useMemo((): SightseeingActivity[] => {
    if (useLiveAvailability) {
      return liveActivities ?? [];
    }
    return DUMMY_SIGHTSEEING_ACTIVITIES;
  }, [useLiveAvailability, liveActivities]);

  const filtered = useMemo(
    () =>
      sortActivities(
        filterActivities(catalogue, quickFilter, listFilters),
        listFilters.sort,
      ),
    [catalogue, quickFilter, listFilters],
  );

  const activeSidebarCount = useMemo(
    () => countActiveSidebarFilters(listFilters),
    [listFilters],
  );

  const handleBookNow = useCallback(
    (activity: SightseeingActivity) => {
      const range = defaultActivityAvailabilityDateRange(30);
      navigate(
        `/sightseeing-detail/${encodeURIComponent(activity.id)}`,
        {
          state: {
            from: range.from,
            to: range.to,
            preview: activity,
            context: {
              country: toolbar.country,
              city: toolbar.city,
              destinationCode: destCode,
            },
          },
        },
      );
    },
    [navigate, toolbar.country, toolbar.city, destCode],
  );

  const showLiveAvailabilityLoader =
    useLiveAvailability && isLiveLoading;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <Loader
        show={showLiveAvailabilityLoader}
        label="Loading activities from supplier…"
      />
      <div className="mx-auto w-full max-w-[1560px] px-6 pt-6 sm:px-10 md:px-12 lg:px-14 xl:px-[8rem]">
        <SightseeingListingToolbar
          initial={toolbar}
          onSearch={onToolbarSearch}
        />

        <div
          className="mt-8 h-px w-full border-0 bg-[#E4E4E7]"
          role="separator"
          aria-hidden
        />

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="hidden lg:block lg:w-[280px] lg:shrink-0">
            <div className="sticky top-6">
              <SightseeingFiltersSidebar
                filters={listFilters}
                onFiltersChange={setListFilters}
                activeCount={activeSidebarCount}
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="lg:hidden">
              <SightseeingFiltersSidebar
                filters={listFilters}
                onFiltersChange={setListFilters}
                activeCount={activeSidebarCount}
              />
            </div>

            <div className="mt-6 lg:mt-0">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[14px] text-[#3D495C]">
                  <span className="font-semibold text-[#0A0C0F]">
                    Quick Filters
                  </span>
                  <span className="text-[#98A4B3]"> • </span>
                  <span>
                    {filtered.length} Activit
                    {filtered.length === 1 ? "y" : "ies"}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {SIGHTSEEING_QUICK_FILTERS.map((pill) => {
                  const active = quickFilter === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setQuickFilter(pill.id)}
                      className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                        active
                          ? "border-[#2351A3] bg-[#2351A3] text-white shadow-sm"
                          : "border-[#C2CAD6] bg-white text-[#3D495C] hover:border-[#2351A3]/40"
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {toolbar.country || toolbar.city ? (
              <p className="mt-4 text-[13px] text-[#3D495C]">
                Showing results for
                {toolbar.city ? (
                  <>
                    {" "}
                    <span className="font-medium text-[#0A0C0F]">
                      {toolbar.city}
                    </span>
                  </>
                ) : null}
                {toolbar.country ? (
                  <>
                    {toolbar.city ? "," : ""}{" "}
                    <span className="font-medium text-[#0A0C0F]">
                      {toolbar.country}
                    </span>
                  </>
                ) : null}
                .
                {useLiveAvailability ? (
                  <span className="ml-2 text-[#98A4B3]">
                    (live availability
                    {destCode ? ` · ${destCode}` : ""})
                  </span>
                ) : null}
              </p>
            ) : null}

            {!showLiveAvailabilityLoader ? (
              <>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((activity) => (
                    <SightseeingActivityCard
                      key={activity.id}
                      activity={activity}
                      onBookNow={handleBookNow}
                    />
                  ))}
                </div>

                {filtered.length === 0 ? (
                  <div className="mt-12 rounded-[16px] border border-dashed border-[#C2CAD6] bg-white py-14 text-center text-[14px] text-[#3D495C]">
                    {useLiveAvailability
                      ? "No activities returned for this destination and date range, or filters hide all results. Try another destination or relax filters."
                      : "No activities match your filters. Try adjusting filters or quick categories."}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SightseeingListing;
