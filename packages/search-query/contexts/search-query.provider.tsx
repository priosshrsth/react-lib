"use client";

import { useLazySearch } from "@packages/core/lazy-search";
import { SearchQueryContext } from "@packages/core/search-query/contexts/search-query.context";
import type { IBaseSearchQuery } from "@packages/core/search-query/types";
import { setSearchParams } from "@packages/core/set-search-params";
import { isEqual } from "lodash";
import { type ReactNode, useCallback, useEffect, useState, useTransition } from "react";

import type { ZodObject, ZodType } from "zod/v4";

type ProviderProps<T extends IBaseSearchQuery> = {
  schema: ZodType<T>;
  children: ReactNode;
  initialSearchParams?: Record<string, unknown>;
  syncWithUrl?: boolean;
};

function getValidShape<T extends IBaseSearchQuery>(schema: ZodType<T>, data: Record<string, unknown>) {
  return Object.keys(schema).reduce((validObj, key) => {
    const zodSchema = (schema as unknown as ZodObject).shape[key];
    const result = zodSchema.safeParse(data[key]);
    if (result.success) {
      // @ts-expect-error invalid
      validObj[key] = result.data;
    }

    return validObj;
  }, {} as T);
}

export function SearchQueryProvider<T extends IBaseSearchQuery>({
  children,
  schema,
  initialSearchParams,
  syncWithUrl = false,
}: ProviderProps<T>): ReactNode {
  const [searchQuery, setSearchQuery] = useState<T>(getValidShape(schema, initialSearchParams ?? {}));

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
