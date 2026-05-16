import { anthropic, MODEL_EXTRACT, MODEL_SUMMARIZE } from "../anthropic/client";
import { ParsedDay } from "./schema";

const EXTRACT_SYSTEM = `You are a careful structured-data extractor for an infant daycare-style daily report.
The user is the family of a ~5.5-month-old baby boy named James, with acid reflux.
You will receive a free-form note from his nanny (Shelly).
Your job: extract a structured timeline.

Rules:
- Times in the note are 12-hour without AM/PM. Assume monotonically increasing across a daytime schedule (~6am–8pm). The wake time is in parentheses at the top, e.g. "(6:30/5oz & nursed)".
- Output strict JSON matching the provided schema. No prose, no markdown, no code fences.
- "down" = nap start, "up"/"woke" = nap end.
- "wet" / "dry" / "bm" / "dirty" / "poop" describe diapers.
- "X oz breastmilk|formula|mixed" describes a bottle feed.
- "nursed" without an oz amount = a nursing feed (no oz).
- "Dr appointment", "walk", "park", "blessing box", "library" etc. are outings.
- Floradacane / reflux med / probiotic = medication.
- The five footer labels are: "Development skills worked on:", "Songs/music:", "Books:", "Sensory:", "Signs:". Each becomes a single event of the corresponding type (milestone/song/book/sensory/sign) with the trailing text as description.
- Times must be ISO-8601 UTC strings. Use the provided report_date and the family timezone given to you.
- If a line is ambiguous, lower the per-event "confidence" but still include it; never silently drop data.
- The whole-day "confidence" reflects how well the note fits the expected format.
- Add notable concerns to "flags" array (e.g. "overlapping_naps", "feed_without_oz", "unusual_long_wake_window").
`;

const SUMMARIZE_SYSTEM = `You are a warm, concise pediatric-day summarizer.
Given the structured events for an infant's day, produce a 2-4 sentence plain-English summary a tired parent would actually want to read.
Lead with the headline (good day / rough nap / great feeds / outing highlight).
Mention total day sleep, number of feeds + ounces, diaper counts, and any standout activity or concern.
End with one practical line (e.g. "Last feed was 4 oz formula at 4:05 — next feed window opens around 6:30.").
Plain text only, no markdown, no bullets, max 4 sentences.`;

export async function extractWithClaude(opts: {
  raw: string;
  reportDate: string; // YYYY-MM-DD
  timezone: string;
}): Promise<ParsedDay | null> {
  const client = anthropic();
  const res = await client.messages.create({
    model: MODEL_EXTRACT,
    max_tokens: 4096,
    system: EXTRACT_SYSTEM,
    messages: [{
      role: "user",
      content: `Report date: ${opts.reportDate}\nFamily timezone: ${opts.timezone}\n\nRaw note:\n${opts.raw}\n\nReturn ONLY the JSON object matching the ParsedDay schema.`,
    }],
  });
  const text = res.content.map(c => c.type === "text" ? c.text : "").join("");
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) return null;
  const jsonStr = text.slice(jsonStart, jsonEnd + 1);
  try {
    const obj = JSON.parse(jsonStr);
    const parsed = ParsedDay.safeParse(obj);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function summarizeDay(opts: {
  events: unknown;
  reportDate: string;
  timezone: string;
}): Promise<string> {
  const client = anthropic();
  const res = await client.messages.create({
    model: MODEL_SUMMARIZE,
    max_tokens: 600,
    system: SUMMARIZE_SYSTEM,
    messages: [{
      role: "user",
      content: `Date: ${opts.reportDate}, TZ: ${opts.timezone}\n\nEvents JSON:\n${JSON.stringify(opts.events, null, 2)}`,
    }],
  });
  return res.content.map(c => c.type === "text" ? c.text : "").join("").trim();
}
