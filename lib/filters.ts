import { JobListing } from "@/types/job";

export interface FilterState {
  remoteScope: "global" | "all";
  sourceBoard: string | null; // null = all boards
  dateRange: "7" | "14" | null; // days, null = no filter
  sortBy: "date" | "company";
}

export const DEFAULT_FILTERS: FilterState = {
  remoteScope: "global",
  sourceBoard: null,
  dateRange: null,
  sortBy: "date",
};

export function applyFilters(
  jobs: JobListing[],
  filters: FilterState
): JobListing[] {
  let filtered = [...jobs];

  // Date range filter
  if (filters.dateRange) {
    const days = parseInt(filters.dateRange, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    filtered = filtered.filter((j) => new Date(j.datePosted) >= cutoff);
  }

  // Sort
  if (filters.sortBy === "date") {
    filtered.sort(
      (a, b) =>
        new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
    );
  } else if (filters.sortBy === "company") {
    filtered.sort((a, b) => a.company.localeCompare(b.company));
  }

  return filtered;
}

// Extract unique board names from results
export function getAvailableBoards(jobs: JobListing[]): string[] {
  return [...new Set(jobs.map((j) => j.sourceBoard))].sort();
}
