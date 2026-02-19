export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  datePosted: string; // ISO date string
  sourceBoard: string;
  sourceUrl: string;
  description: string;
  isRemote: boolean;
  remoteScope: "global" | "country_restricted" | "unknown";
  allowedCountries: string[];
  layer: "curated" | "discovery";
}

export interface BoardConfig {
  name: string;
  siteQuery: string; // e.g. "site:remotive.com"
  layer: "curated";
}

export interface SearchResponse {
  success: boolean;
  results: JobListing[];
  meta: {
    totalResults: number;
    boardsSearched: number;
    boardsSucceeded: string[];
    boardsFailed: string[];
    discoveryIncluded: boolean;
    duplicatesRemoved: number;
    dedupMethod: "llm" | "url_only";
  };
  error?: {
    code: string;
    message: string;
  };
}

// Firecrawl API response - supports both response shapes from the API
export interface FirecrawlResult {
  url: string;
  title: string;
  description: string;
  markdown?: string;
  content?: string; // Alternative to markdown in some response formats
  category?: string;
  metadata?: {
    title?: string;
    sourceURL?: string;
    url?: string;
    source?: string;
    statusCode?: number;
    date?: string; // Publication date from Firecrawl
  };
}

export interface FirecrawlResponse {
  success?: boolean;
  // Format 1: data.web[]
  data?: {
    web?: FirecrawlResult[];
  };
  // Format 2: results[]
  results?: FirecrawlResult[];
  error?: string;
}
