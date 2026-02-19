// Structured pipeline logger - logs each stage of the search pipeline
// Request-scoped to avoid state leaking between requests

export interface PipelineLog {
  stage: string;
  board?: string;
  query?: string;
  rawResultCount?: number;
  normalisedCount?: number;
  droppedCount?: number;
  droppedReasons?: Record<string, number>;
  sampleResults?: unknown[];
  error?: string;
  durationMs?: number;
}

// Request-scoped log collector
export class PipelineLogger {
  private logs: PipelineLog[] = [];

  log(entry: PipelineLog) {
    this.logs.push(entry);

    // Pretty print to server console
    const prefix = entry.board ? `[${entry.stage}:${entry.board}]` : `[${entry.stage}]`;
    const details: string[] = [];

    if (entry.query) details.push(`query="${entry.query.slice(0, 100)}..."`);
    if (entry.rawResultCount !== undefined) details.push(`raw=${entry.rawResultCount}`);
    if (entry.normalisedCount !== undefined) details.push(`normalised=${entry.normalisedCount}`);
    if (entry.droppedCount !== undefined) details.push(`dropped=${entry.droppedCount}`);
    if (entry.droppedReasons) details.push(`reasons=${JSON.stringify(entry.droppedReasons)}`);
    if (entry.durationMs !== undefined) details.push(`${entry.durationMs}ms`);
    if (entry.error) details.push(`ERROR: ${entry.error}`);

    console.log(`${prefix} ${details.join(" | ")}`);

    if (entry.sampleResults?.length) {
      console.log(`${prefix} sample:`, JSON.stringify(entry.sampleResults[0], null, 2));
    }
  }

  flush(): PipelineLog[] {
    return [...this.logs];
  }
}
