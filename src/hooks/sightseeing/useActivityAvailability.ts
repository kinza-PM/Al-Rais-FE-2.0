import { useQuery } from "@tanstack/react-query";
import { mapAvailabilityToSightseeingActivities } from "../../features/sightseeing/api/activitiesMappers";
import type { SightseeingActivity } from "../../features/sightseeing/types";
import {
  buildGetAvailabilityRequestBody,
  defaultActivityAvailabilityDateRange,
  postGetAvailability,
} from "../../services/api/activitiesSearch";

/** Match pagination metadata from supplier / gateway so we load every page once. */
function availabilityTotalPages(raw: unknown): number {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return 1;
  const o = raw as Record<string, unknown>;
  const p = o.pagination;
  if (!p || typeof p !== "object" || Array.isArray(p)) return 1;
  const po = p as Record<string, unknown>;
  const tp = Number(po.totalPages ?? po.totalPage ?? po.lastPage);
  if (Number.isFinite(tp) && tp >= 1) return Math.min(50, Math.floor(tp));
  const total = Number(po.total ?? po.totalItems ?? po.totalRecords);
  const perPage = Number(po.itemsPerPage ?? po.perPage ?? po.pageSize ?? 100);
  if (
    Number.isFinite(total) &&
    total > 0 &&
    Number.isFinite(perPage) &&
    perPage > 0
  ) {
    return Math.min(50, Math.ceil(total / perPage));
  }
  return 1;
}

const MAX_ACTIVITY_PAGES = 30;

export function useActivityAvailability(opts: {
  destinationCode: string | undefined;
  enabled?: boolean;
}) {
  const dest = opts.destinationCode?.trim().toUpperCase() ?? "";
  const { from, to } = defaultActivityAvailabilityDateRange(30);

  return useQuery({
    queryKey: ["activities", "availability", dest, from, to, "full"],
    queryFn: async ({ signal }) => {
      const out: SightseeingActivity[] = [];
      const seen = new Set<string>();
      let page = 1;
      let totalPages = 1;

      do {
        const raw = await postGetAvailability(
          buildGetAvailabilityRequestBody({
            destinationCode: dest,
            from,
            to,
            page,
            itemsPerPage: 100,
          }),
          signal,
        );
        const batch = mapAvailabilityToSightseeingActivities(raw);
        for (const a of batch) {
          if (seen.has(a.id)) continue;
          seen.add(a.id);
          out.push(a);
        }
        totalPages = availabilityTotalPages(raw);
        page += 1;
        if (batch.length === 0) break;
      } while (page <= totalPages && page <= MAX_ACTIVITY_PAGES);

      return out;
    },
    enabled: (opts.enabled ?? true) && dest.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
