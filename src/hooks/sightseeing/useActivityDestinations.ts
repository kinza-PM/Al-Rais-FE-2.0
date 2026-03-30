import { useQuery } from "@tanstack/react-query";
import { parseActivityDestinations } from "../../features/sightseeing/api/activitiesMappers";
import { getDestinationByOurCountry } from "../../services/api/activitiesSearch";
import type { ActivityDestinationOption } from "../../services/api/activitiesSearch";

export function useActivityDestinations(
  countryIso2: string | undefined,
  enabled = true,
) {
  const iso = countryIso2?.trim().toUpperCase() ?? "";
  return useQuery({
    queryKey: ["activities", "destinations", iso],
    queryFn: async ({ signal }) => {
      const raw = await getDestinationByOurCountry(iso, signal);
      return parseActivityDestinations(raw);
    },
    enabled: enabled && iso.length === 2,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

/** SearchableDropdown: value = supplier destination code, label = human name */
export function destinationOptionsToDropdown(
  items: ActivityDestinationOption[] | undefined,
) {
  return (items ?? []).map((d, i) => ({
    id: `${d.code}-${i}`,
    value: d.code,
    label: d.label,
  }));
}
