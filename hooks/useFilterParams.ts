"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { FilterState, DEFAULT_FILTERS } from "@/lib/filters";

// Sync filter state with URL search params for shareable URLs
export function useFilterParams(): {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearFilters: () => void;
} {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: FilterState = useMemo(
    () => ({
      remoteScope:
        (searchParams.get("scope") as "global" | "all") ??
        DEFAULT_FILTERS.remoteScope,
      sourceBoard: searchParams.get("board") ?? DEFAULT_FILTERS.sourceBoard,
      dateRange:
        (searchParams.get("days") as "7" | "14") ?? DEFAULT_FILTERS.dateRange,
      sortBy:
        (searchParams.get("sort") as "date" | "company") ??
        DEFAULT_FILTERS.sortBy,
    }),
    [searchParams]
  );

  const setFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      const params = new URLSearchParams(searchParams.toString());
      const paramMap: Record<string, string> = {
        remoteScope: "scope",
        sourceBoard: "board",
        dateRange: "days",
        sortBy: "sort",
      };

      const paramKey = paramMap[key];
      if (
        value === null ||
        value === DEFAULT_FILTERS[key]
      ) {
        params.delete(paramKey);
      } else {
        params.set(paramKey, String(value));
      }

      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return { filters, setFilter, clearFilters };
}
