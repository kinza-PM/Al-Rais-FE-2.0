import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { getMasterListingData } from "../../services/api/apiMasterListing";

type Builder<TItem, TOut> = (items: TItem[]) => TOut[];

export function useInfiniteListing<
  TResp extends { items?: TItem[]; nextToken?: string | null },
  TItem,
  TOut
>(
  tableName: string,
  builder: Builder<TItem, TOut>,
  enabled = true,
  params?: Record<string, any>
) {
  // When search params are provided (e.g. country search), backend does not
  // accept pagination via nextToken, so we keep it single-page.
  const disablePagination = !!params && Object.keys(params).length > 0;

  const q = useInfiniteQuery<
    TResp, // QueryFn return
    Error, // Error
    InfiniteData<TResp>, // q.data type
    (string | Record<string, any> | undefined)[], // queryKey
    string | null // pageParam
  >({
    queryKey: ["listing", tableName, params],
    enabled,
    initialPageParam: null,
    queryFn: ({ pageParam, signal }) =>
      getMasterListingData<TResp>(
        tableName,
        signal,
        disablePagination ? null : pageParam,
        params
      ),
    getNextPageParam: (lastPage) =>
      disablePagination ? undefined : lastPage?.nextToken ?? undefined,
  });

  const data = q.data?.pages.flatMap((page) => builder(page.items ?? [])) ?? [];

  return {
    data,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isFetchingNextPage: q.isFetchingNextPage,
    fetchNextPage: q.fetchNextPage,
    hasNextPage: q.hasNextPage,
    error: q.error ?? null,
  };
}
