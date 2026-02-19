"use client";

import { useState, useCallback, Suspense } from "react";
import { SearchResponse, JobListing } from "@/types/job";
import { applyFilters, getAvailableBoards, FilterState } from "@/lib/filters";
import { useFilterParams } from "@/hooks/useFilterParams";
import SearchButton from "@/components/SearchButton";
import StatusMessage from "@/components/StatusMessage";
import FilterBar from "@/components/FilterBar";
import JobList from "@/components/JobList";

type AppState =
  | "idle"
  | "loading"
  | "loading_slow"
  | "success"
  | "no_results"
  | "filtered_empty"
  | "partial_failure"
  | "total_failure"
  | "credits_exhausted";

function SearchApp() {
  const [state, setState] = useState<AppState>("idle");
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [meta, setMeta] = useState<SearchResponse["meta"] | null>(null);
  const { filters, setFilter, clearFilters } = useFilterParams();

  const search = useCallback(async () => {
    setState("loading");
    setJobs([]);
    setMeta(null);

    const slowTimer = setTimeout(() => setState("loading_slow"), 30000);

    try {
      const res = await fetch("/api/search", { method: "POST" });
      clearTimeout(slowTimer);

      const data: SearchResponse = await res.json();

      if (!data.success) {
        if (data.error?.code === "CREDITS_EXHAUSTED") {
          setState("credits_exhausted");
        } else {
          setState("total_failure");
        }
        return;
      }

      setMeta(data.meta);
      setJobs(data.results);

      if (data.results.length === 0) {
        setState("no_results");
      } else if (data.meta.boardsFailed.length > 0) {
        setState("partial_failure");
      } else {
        setState("success");
      }
    } catch {
      clearTimeout(slowTimer);
      setState("total_failure");
    }
  }, []);

  // Apply client-side filters
  const filteredJobs = applyFilters(jobs, filters);
  const boards = getAvailableBoards(jobs);

  // Determine display state - if we have results but filters empty them
  const displayState =
    jobs.length > 0 && filteredJobs.length === 0 ? "filtered_empty" : state;

  const showResults =
    displayState === "success" ||
    displayState === "partial_failure" ||
    displayState === "filtered_empty";

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          UXR Job Finder
        </h1>
        <p className="text-gray-500 text-sm">
          Find remote UX research roles across multiple job boards in one click.
        </p>
      </header>

      <div className="mb-8">
        <SearchButton
          loading={state === "loading" || state === "loading_slow"}
          onClick={search}
        />
      </div>

      {/* Non-result states */}
      {!showResults && (
        <StatusMessage state={displayState} onRetry={search} />
      )}

      {/* Results area */}
      {showResults && (
        <>
          {/* Status line */}
          {(displayState === "success" || displayState === "partial_failure") && (
            <StatusMessage
              state={displayState}
              resultCount={meta?.totalResults}
              boardsSucceeded={meta?.boardsSucceeded}
              boardsFailed={meta?.boardsFailed}
            />
          )}

          <FilterBar
            filters={filters}
            boards={boards}
            onFilterChange={setFilter as <K extends keyof FilterState>(key: K, value: FilterState[K]) => void}
            totalCount={jobs.length}
            filteredCount={filteredJobs.length}
          />

          {displayState === "filtered_empty" ? (
            <StatusMessage state="filtered_empty" onClearFilters={clearFilters} />
          ) : (
            <JobList jobs={filteredJobs} />
          )}
        </>
      )}
    </main>
  );
}

// Wrap in Suspense for useSearchParams
export default function Home() {
  return (
    <Suspense>
      <SearchApp />
    </Suspense>
  );
}
