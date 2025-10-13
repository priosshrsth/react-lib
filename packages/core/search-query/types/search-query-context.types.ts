import type { ChangeEvent, Dispatch, SetStateAction } from "react";

export type IBaseSearchQuery = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
};

export type ISearchQueryContext<T extends IBaseSearchQuery = IBaseSearchQuery> = {
  searchQuery: T;
  total: number;
  updateQuery: (searchQuery: Partial<T>) => void;
  setTotal: Dispatch<SetStateAction<number>>;
  handleSearch: (search: string | ChangeEvent<HTMLInputElement>) => void;
};
