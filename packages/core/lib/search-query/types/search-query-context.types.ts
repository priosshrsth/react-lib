import type { ChangeEvent, Dispatch, SetStateAction } from "react";

// biome-ignore lint/style/useConsistentTypeDefinitions: <use type>
export type IBaseSearchQuery = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
};

export interface ISearchQueryContext<T extends IBaseSearchQuery = IBaseSearchQuery> {
  searchQuery: T;
  total: number;
  updateQuery: (searchQuery: Partial<T>) => void;
  setTotal: Dispatch<SetStateAction<number>>;
  handleSearch: (search: string | ChangeEvent<HTMLInputElement>) => void;
}
