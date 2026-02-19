"use client";

import { JobListing } from "@/types/job";
import { formatRelativeDate } from "@/lib/date-utils";
import SourceBadge from "./SourceBadge";

interface JobCardProps {
  job: JobListing;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <a
      href={job.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-base sm:truncate">
            {job.title}
          </h3>
          <p className="text-blue-600 text-sm mt-0.5">{job.company}</p>
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0 mt-1">
          {formatRelativeDate(job.datePosted)}
        </span>
      </div>

      {job.salary && (
        <p className="text-sm text-gray-700 font-medium mt-2">{job.salary}</p>
      )}

      {job.description && (
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {job.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <SourceBadge board={job.sourceBoard} />
        {job.remoteScope === "country_restricted" && (
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
            Region-restricted
          </span>
        )}
      </div>
    </a>
  );
}
