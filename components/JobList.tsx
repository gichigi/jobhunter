"use client";

import { JobListing } from "@/types/job";
import JobCard from "./JobCard";

interface JobListProps {
  jobs: JobListing[];
}

export default function JobList({ jobs }: JobListProps) {
  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
