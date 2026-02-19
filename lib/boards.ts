import { BoardConfig } from "@/types/job";

// Keywords for UX research roles
export const UX_KEYWORDS =
  '("UX research" OR "user research" OR "UX researcher" OR "user researcher" OR "design researcher" OR "usability")';

export const BOARDS: BoardConfig[] = [
  {
    name: "Remotive",
    // Job listings live under /remote/jobs/
    siteQuery: "site:remotive.com/remote/jobs",
    layer: "curated",
  },
  {
    name: "We Work Remotely",
    // Actual job posts live under /remote-jobs/
    siteQuery: "site:weworkremotely.com/remote-jobs",
    layer: "curated",
  },
  {
    name: "Dribbble",
    // Job listings live under /jobs/ subdirectory
    siteQuery: "site:dribbble.com/jobs",
    layer: "curated",
  },
  {
    name: "User Interviews",
    // Job board lives at this specific path
    siteQuery: "site:userinterviews.com/ux-job-board",
    layer: "curated",
  },
  {
    name: "Lisbon UX",
    siteQuery: "site:jobs.lisboaux.com",
    layer: "curated",
  },
];

// Build a Firecrawl search query for a curated board
export function buildBoardQuery(board: BoardConfig): string {
  return `${board.siteQuery} ${UX_KEYWORDS} remote`;
}

// Build a broad discovery query (no site: scoping)
export function buildDiscoveryQuery(): string {
  return `("remote UX researcher" OR "remote UX research" OR "remote user researcher" OR "remote design researcher" OR "remote usability") jobs`;
}
