import norms from "./norms.json";
export const DEV_NORMS = norms;
export type DevNorms = typeof norms;

const DOB_ISO = "2025-11-30";
export function ageInDays(today = new Date()): number {
  const dob = new Date(DOB_ISO + "T00:00:00Z");
  const ms = today.getTime() - dob.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
export function ageInMonths(today = new Date()): number {
  return +(ageInDays(today) / 30.4375).toFixed(1);
}
export function ageInWeeks(today = new Date()): number {
  return Math.floor(ageInDays(today) / 7);
}
