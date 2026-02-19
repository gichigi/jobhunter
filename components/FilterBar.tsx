"use client";

import { FilterState } from "@/lib/filters";

interface FilterBarProps {
  filters: FilterState;
  boards: string[];
  onFilterChange: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;
  totalCount: number;
  filteredCount: number;
}

export default function FilterBar({
  filters,
  boards,
  onFilterChange,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredCount} of {totalCount} jobs
        </p>
        <div className="flex items-center gap-1 text-sm">
          <label className="text-gray-500">Sort:</label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange("sortBy", e.target.value as "date" | "company")
            }
            className="text-sm border border-gray-200 rounded px-2 py-1"
          >
            <option value="date">Newest</option>
            <option value="company">Company A-Z</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Remote scope toggle */}
        <select
          value={filters.remoteScope}
          onChange={(e) =>
            onFilterChange("remoteScope", e.target.value as "global" | "all")
          }
          className="text-sm border border-gray-200 rounded px-2 py-1"
        >
          <option value="global">Global remote</option>
          <option value="all">All remote</option>
        </select>

        {/* Source board filter */}
        <select
          value={filters.sourceBoard ?? ""}
          onChange={(e) =>
            onFilterChange("sourceBoard", e.target.value || null)
          }
          className="text-sm border border-gray-200 rounded px-2 py-1"
        >
          <option value="">All boards</option>
          {boards.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Date range */}
        <select
          value={filters.dateRange ?? ""}
          onChange={(e) =>
            onFilterChange(
              "dateRange",
              (e.target.value as "7" | "14") || null
            )
          }
          className="text-sm border border-gray-200 rounded px-2 py-1"
        >
          <option value="">Any date</option>
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
        </select>
      </div>
    </div>
  );
}
