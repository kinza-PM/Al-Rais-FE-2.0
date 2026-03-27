import { useQuery } from "@tanstack/react-query";
import { mapActivitiesDetailResponse } from "../../features/sightseeing/api/activitiesMappers";
import {
  buildActivitiesDetailBody,
  postActivitiesDetail,
} from "../../services/api/activitiesSearch";

export function useActivityDetail(opts: {
  activityCode: string | undefined;
  from: string;
  to: string;
  enabled?: boolean;
}) {
  const code = opts.activityCode?.trim() ?? "";

  return useQuery({
    queryKey: ["activities", "detail", code, opts.from, opts.to],
    queryFn: async ({ signal }) => {
      const body = buildActivitiesDetailBody({
        code,
        from: opts.from,
        to: opts.to,
      });
      const raw = await postActivitiesDetail(body, signal);
      return mapActivitiesDetailResponse(raw);
    },
    enabled: (opts.enabled ?? true) && code.length > 0,
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
