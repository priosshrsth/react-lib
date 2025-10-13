"use client";

import { type Context, createContext } from "react";
import type { ISearchQueryContext } from "../types";

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
