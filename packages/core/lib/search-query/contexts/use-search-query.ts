import type { IBaseSearchQuery, ISearchQueryContext } from "lib/search-query/types";
import { type Context, useContext } from "react";
import { SearchQueryContext } from "./search-query.context";

export function useSearchQuery<T extends IBaseSearchQuery = IBaseSearchQuery>(): ISearchQueryContext<T> {
  return useContext<ISearchQueryContext<T>>(SearchQueryContext as unknown as Context<ISearchQueryContext<T>>);
}
