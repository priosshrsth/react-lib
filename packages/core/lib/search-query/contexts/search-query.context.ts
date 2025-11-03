"use client";

import type { ISearchQueryContext } from "lib/search-query/types";
import { type Context, createContext } from "react";

export const SearchQueryContext: Context<ISearchQueryContext> = createContext<ISearchQueryContext>({
  searchQuery: {
    page: 1,
    limit: 12,
  },
  updateQuery: () => {
    return;
  },
  total: 0,
  setTotal: () => {
    return;
  },
  handleSearch: () => {
    return;
  },
});
