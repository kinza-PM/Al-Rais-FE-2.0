import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getMasterListingData } from "../../services/api/apiMasterListing";

type Builder<TItem, TOut> = (items: TItem[]) => TOut[];

export function useListing<TResp extends { items?: any[] }, TItem, TOut>(
    tableName: string,
    builder: Builder<TItem, TOut>,
    enabled = true,
    opts?: { staleTime?: number; gcTime?: number }
) {
    const q = useQuery({
        queryKey: ["listing", tableName],
        queryFn: ({ signal }) => getMasterListingData<TResp>(tableName, signal),
        select: (resp) => builder((resp?.items ?? []) as TItem[]),
        enabled,
        placeholderData: keepPreviousData,
        staleTime: opts?.staleTime ?? 5 * 60 * 1000, // 5m
        gcTime: opts?.gcTime ?? 30 * 60 * 1000, // 30m
    });

    return {
        data: q.data ?? ([] as unknown as TOut[]),
        isLoading: q.isLoading,
        isFetching: q.isFetching,
        error: (q.error as Error | null) ?? null,
    };
}
