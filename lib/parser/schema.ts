import { z } from "zod";

export const ParsedEvent = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("nap"),
    start_time: z.string(),
    end_time: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  }),
  z.object({
    type: z.literal("feed"),
    time: z.string(),
    method: z.enum(["breast","bottle_breastmilk","bottle_formula","bottle_mixed","solids","nursed","other"]),
    oz: z.number().nullable().optional(),
    foods: z.array(z.string()).nullable().optional(),
    notes: z.string().nullable().optional(),
  }),
  z.object({
    type: z.literal("diaper"),
    time: z.string(),
    wet: z.boolean(),
    bm: z.boolean(),
    dry: z.boolean(),
    notes: z.string().nullable().optional(),
  }),
  z.object({
    type: z.literal("outing"),
    time: z.string(),
    description: z.string(),
    end_time: z.string().nullable().optional(),
  }),
  z.object({
    type: z.literal("medication"),
    time: z.string(),
    name: z.string(),
    dose: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  }),
  z.object({
    type: z.literal("note"),
    time: z.string().nullable().optional(),
    text: z.string(),
  }),
  z.object({
    type: z.literal("milestone"),
    description: z.string(),
  }),
  z.object({
    type: z.literal("song"),
    description: z.string(),
  }),
  z.object({
    type: z.literal("book"),
    description: z.string(),
  }),
  z.object({
    type: z.literal("sensory"),
    description: z.string(),
  }),
  z.object({
    type: z.literal("sign"),
    description: z.string(),
  }),
  z.object({
    type: z.literal("mood"),
    time: z.string().nullable().optional(),
    description: z.string(),
  }),
]);
export type ParsedEvent = z.infer<typeof ParsedEvent>;

export const ParsedDay = z.object({
  date: z.string(),
  wake_time: z.string().nullable().optional(),
  morning_feed: z.string().nullable().optional(),
  events: z.array(ParsedEvent),
  handoff_note: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1),
  flags: z.array(z.string()).default([]),
  perEventConfidence: z.array(z.number()).optional(),
});
export type ParsedDay = z.infer<typeof ParsedDay>;
