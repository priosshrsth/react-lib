import { SearchQueryContext } from "@packages/core/search-query/contexts/search-query.context";
import type { IBaseSearchQuery, ISearchQueryContext } from "@packages/core/search-query/types";
import { type Context, useContext } from "react";

export function useSearchQuery<T extends IBaseSearchQuery = IBaseSearchQuery>(): ISearchQueryContext<T> {
  return useContext<ISearchQueryContext<T>>(SearchQueryContext as unknown as Context<ISearchQueryContext<T>>);
}
