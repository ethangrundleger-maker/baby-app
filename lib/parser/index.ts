import { parseHeuristic } from "./heuristic";
import { extractWithClaude, summarizeDay } from "./claude";
import type { ParsedDay } from "./schema";

const CONFIDENCE_THRESHOLD = 0.7;

export interface ParseOptions {
  raw: string;
  reportDate: Date;
  timezone: string;
  preferClaude?: boolean;
}

export async function parseDailyReport(opts: ParseOptions): Promise<{
  parsed: ParsedDay;
  source: "heuristic" | "claude" | "claude_fallback";
  summary: string | null;
}> {
  const heuristic = parseHeuristic(opts.raw, opts.reportDate);
  let parsed: ParsedDay = heuristic.parsed;
  let source: "heuristic" | "claude" | "claude_fallback" = "heuristic";

  const shouldUseClaude =
    opts.preferClaude ||
    parsed.confidence < CONFIDENCE_THRESHOLD ||
    heuristic.unparsedLines.length > 2;

  if (shouldUseClaude && process.env.ANTHROPIC_API_KEY) {
    try {
      const llm = await extractWithClaude({
        raw: opts.raw,
        reportDate: opts.reportDate.toISOString().slice(0, 10),
        timezone: opts.timezone,
      });
      if (llm && llm.events.length >= parsed.events.length * 0.6) {
        parsed = llm;
        source = opts.preferClaude ? "claude" : "claude_fallback";
      }
    } catch (e) {
      parsed.flags = [...parsed.flags, `claude_extract_error:${(e as Error).message.slice(0, 80)}`];
    }
  }

  let summary: string | null = null;
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      summary = await summarizeDay({
        events: parsed.events,
        reportDate: parsed.date,
        timezone: opts.timezone,
      });
    } catch (e) {
      parsed.flags = [...parsed.flags, `claude_summary_error:${(e as Error).message.slice(0, 80)}`];
    }
  }

  return { parsed, source, summary };
}

export type { ParsedDay } from "./schema";
