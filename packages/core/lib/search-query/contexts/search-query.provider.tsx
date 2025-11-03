"use client";

import { useLazySearch } from "lib/lazy-search";
import type { IBaseSearchQuery } from "lib/search-query/types";
import { setSearchParams } from "lib/set-search-params";
import isEqual from "lodash/isEqual";
import { type ReactNode, useCallback, useEffect, useState, useTransition } from "react";
import { SearchQueryContext } from "./search-query.context";

interface ProviderProps<T extends Record<string, unknown>> {
  defaultValues?: T;
  children: ReactNode;
  initialSearchParams?: Partial<IBaseSearchQuery & T>;
  syncWithUrl?: boolean;
}

const ALLOWED_BASE_KEYS = new Set<string>(["page", "limit", "search", "sortBy", "sortOrder"]);

function filterInitialSearchParams<T extends Record<string, unknown>>(
  initial: Partial<T> | undefined,
  defaults: Partial<T> | undefined
): Partial<T> {
  const out: Partial<T> = {};
  if (!initial) {
    return out;
  }
  const defaultKeys = defaults ? (Object.keys(defaults) as (keyof T)[]) : ([] as (keyof T)[]);
  for (const key of Object.keys(initial) as (keyof T)[]) {
    if (ALLOWED_BASE_KEYS.has(String(key)) || defaultKeys.includes(key)) {
      out[key] = initial[key];
    }
  }
  return out;
}

export function SearchQueryProvider<T extends IBaseSearchQuery>({
  children,
  initialSearchParams,
  defaultValues,
  syncWithUrl = false,
}: ProviderProps<T>): ReactNode {
  const initialFromDefaults = (defaultValues ?? {}) as T;
  const filteredInitial = filterInitialSearchParams<T>(initialSearchParams, defaultValues);
  const [searchQuery, setSearchQuery] = useState<T>({
    ...initialFromDefaults,
    ...(filteredInitial as Partial<T>),
  } as T);

  const [total, setTotal] = useState(0);

  const [_, startTransition] = useTransition();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <need only on mount>
  useEffect(() => {
    if (!syncWithUrl) {
      return;
    }
    return () => {
      setSearchParams(
        Object.keys(searchQuery).reduce<Record<string, null>>((acc, key) => {
          acc[key] = null;
          return acc;
        }, {})
      );
    };
  }, []);

  const updateQuery = useCallback(
    (newFilters: Partial<T>) => {
      const prevFilters = Object.freeze({
        ...searchQuery,
      });

      if ((newFilters.sortBy || !newFilters.sortOrder || newFilters.search || newFilters.limit) && !newFilters.page) {
        newFilters.page = 1;
      }

      const updatedFilters = { ...searchQuery, ...newFilters };
      startTransition(() => {
        if (syncWithUrl) {
          // Find the difference between previous and updated filters
          const changedFilters = (Object.keys(newFilters) as unknown as (keyof T)[]).reduce(
            (diff, key) => {
              if (key === "custom") {
                return diff;
              }
              if (!isEqual(prevFilters[key], newFilters[key])) {
                diff[key] = newFilters[key];
              }
              return diff;
            },
            {} as Partial<T>
          );
          if (syncWithUrl) {
            setSearchParams(changedFilters);
          }
        }

        setSearchQuery(updatedFilters);
      });
    },
    [searchQuery, syncWithUrl]
  );

  const { handleInputChangeDebounced } = useLazySearch({
    initialQuery: typeof initialSearchParams?.search === "string" ? initialSearchParams.search : "",
    onDebouncedChange: (value: string) =>
      updateQuery({
        search: value,
        page: 1,
      } as T),
  });

  return (
    <SearchQueryContext.Provider
      value={{
        searchQuery,
        // @ts-expect-error invalid type ignore for now
        updateQuery,
        total,
        handleSearch: handleInputChangeDebounced,
        setTotal,
      }}
    >
      {children}
    </SearchQueryContext.Provider>
  );
}
