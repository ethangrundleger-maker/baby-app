export type EventType =
  | "nap" | "feed" | "diaper" | "outing" | "milestone"
  | "song" | "book" | "sensory" | "sign" | "medication"
  | "mood" | "handoff_note" | "note";

export interface DBEvent {
  id: string;
  child_id: string;
  report_id: string | null;
  type: EventType;
  occurred_at: string;
  ended_at: string | null;

  nap_location: string | null;
  nap_quality: string | null;

  feed_method: "breast" | "bottle_breastmilk" | "bottle_formula" | "bottle_mixed" | "solids" | "nursed" | "other" | null;
  feed_oz: number | null;
  feed_foods: string[] | null;

  diaper_wet: boolean | null;
  diaper_bm: boolean | null;
  diaper_dry: boolean | null;

  med_name: string | null;
  med_dose: string | null;

  notes: string | null;
  confidence: number | null;
  flagged_for_review: boolean;
  created_by_user_id: string | null;
  created_at: string;
}

export interface DBDailyReport {
  id: string;
  child_id: string;
  report_date: string;
  author_user_id: string | null;
  author_display_name: string;
  source: "nanny_paste" | "parent_paste" | "manual";
  raw_text: string | null;
  summary: string | null;
  handoff_note: string | null;
  parse_confidence: number | null;
  parse_model: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBChild {
  id: string;
  family_id: string;
  name: string;
  dob: string;
  notes: string | null;
  created_at: string;
}
