import { type Context, useContext } from "react";
import type { IBaseSearchQuery, ISearchQueryContext } from "../types";
import { SearchQueryContext } from "./search-query.context";

export function useSearchQuery<T extends IBaseSearchQuery = IBaseSearchQuery>(): ISearchQueryContext<T> {
  return useContext<ISearchQueryContext<T>>(SearchQueryContext as unknown as Context<ISearchQueryContext<T>>);
}
