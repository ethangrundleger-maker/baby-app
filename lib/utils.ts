import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatInTimeZone } from "date-fns-tz";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtTime(iso: string | Date, tz: string) {
  return formatInTimeZone(iso, tz, "h:mm a");
}
export function fmtDate(iso: string | Date, tz: string) {
  return formatInTimeZone(iso, tz, "EEE, MMM d");
}
export function fmtDateISO(iso: string | Date, tz: string) {
  return formatInTimeZone(iso, tz, "yyyy-MM-dd");
}
export function fmtDuration(ms: number): string {
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
export function sinceNow(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "in the future";
  return `${fmtDuration(ms)} ago`;
}
