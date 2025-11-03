"use client";

import { type ChangeEvent, type Dispatch, type SetStateAction, useCallback, useEffect, useRef, useState } from "react";

interface UseLazySearchOptions {
  /** Pre-populates the search field once, typically from URL/search params */
  initialQuery?: string;
  /** Fires after the debounce delay with the latest query value */
  onDebouncedChange: (query: string) => void;
  /** Debounce delay in milliseconds for invoking onDebouncedChange */
  debounceMs?: number;
}

export interface UseLazySearchReturn {
  /** Current query string bound to the input */
  searchQuery: string;
  /** Input/onChange handler that debounce before calling onDebouncedChange */
  handleInputChangeDebounced: (e: string | ChangeEvent<HTMLInputElement>) => void;
  /** Imperatively set the query immediately (no debounce) */
  setQueryImmediate: Dispatch<SetStateAction<string>>;
}

export function useLazySearch({
  initialQuery,
  onDebouncedChange,
  debounceMs = 800,
}: UseLazySearchOptions): UseLazySearchReturn {
  const [searchQuery, setSearchQuery] = useState(initialQuery ?? "");

  const hasInitializedFromInitialQuery = useRef(false);
  useEffect(() => {
    if (hasInitializedFromInitialQuery.current) {
      return;
    }

    if (!initialQuery) {
      return;
    }

    hasInitializedFromInitialQuery.current = true;

    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChangeDebounced = useCallback(
    (e: string | ChangeEvent<HTMLInputElement>) => {
      const nextQuery = typeof e === "string" ? e : e.target.value;
      setSearchQuery(nextQuery);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        onDebouncedChange(nextQuery);
      }, debounceMs);
    },
    [onDebouncedChange, debounceMs]
  );

  return {
    searchQuery,
    handleInputChangeDebounced,
    setQueryImmediate: setSearchQuery,
  };
}
