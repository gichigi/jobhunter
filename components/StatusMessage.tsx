"use client";

interface StatusMessageProps {
  state:
    | "idle"
    | "loading"
    | "loading_slow"
    | "success"
    | "no_results"
    | "filtered_empty"
    | "partial_failure"
    | "total_failure"
    | "credits_exhausted";
  resultCount?: number;
  boardsSucceeded?: string[];
  boardsFailed?: string[];
  onRetry?: () => void;
  onClearFilters?: () => void;
}

export default function StatusMessage({
  state,
  resultCount,
  boardsSucceeded,
  boardsFailed,
  onRetry,
  onClearFilters,
}: StatusMessageProps) {
  switch (state) {
    case "idle":
      return (
        <p className="text-gray-500 text-center py-12">
          Find remote UX research roles across multiple job boards in one click.
        </p>
      );

    case "loading":
      return (
        <p className="text-blue-600 text-center py-8 animate-pulse">
          Searching job boards...
        </p>
      );

    case "loading_slow":
      return (
        <p className="text-amber-600 text-center py-8 animate-pulse">
          Still searching. This is taking longer than usual.
        </p>
      );

    case "success":
      return (
        <p className="text-green-700 text-sm mb-4">
          {resultCount} jobs found across {boardsSucceeded?.length ?? 0} boards.
        </p>
      );

    case "no_results":
      return (
        <p className="text-gray-500 text-center py-12">
          No UX research roles found in the last 14 days. Try checking back in a
          few days.
        </p>
      );

    case "filtered_empty":
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">
            No jobs match your current filters.
          </p>
          <button
            onClick={onClearFilters}
            className="text-blue-600 hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      );

    case "partial_failure":
      return (
        <p className="text-amber-700 text-sm mb-4">
          Showing results from {boardsSucceeded?.length} of{" "}
          {(boardsSucceeded?.length ?? 0) + (boardsFailed?.length ?? 0)} boards.
          Couldn&apos;t reach {boardsFailed?.join(", ")}.
        </p>
      );

    case "total_failure":
      return (
        <div className="text-center py-12">
          <p className="text-red-600 mb-3">
            Couldn&apos;t reach any job boards right now. Please try again in a
            minute.
          </p>
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Retry
          </button>
        </div>
      );

    case "credits_exhausted":
      return (
        <p className="text-red-600 text-center py-12">
          Search limit reached for this month. Try again after your credits
          renew.
        </p>
      );

    default:
      return null;
  }
}
