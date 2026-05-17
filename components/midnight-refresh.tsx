"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";

// Watches the family-TZ date and triggers router.refresh() when it rolls over,
// so a tab open across midnight redraws the Today page on the new day instead
// of showing yesterday's header, hero cards, and timeline.
//
// Polling is more robust than a precise setTimeout: it survives DST shifts,
// laptop sleep, mobile tab throttling, and clock drift without extra math.
export function MidnightRefresh({ tz }: { tz: string }) {
  const router = useRouter();
  const dayRef = useRef<string>(formatInTimeZone(new Date(), tz, "yyyy-MM-dd"));

  useEffect(() => {
    function check() {
      const now = formatInTimeZone(new Date(), tz, "yyyy-MM-dd");
      if (now !== dayRef.current) {
        dayRef.current = now;
        router.refresh();
      }
    }
    const id = window.setInterval(check, 30_000);
    const onVisible = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [tz, router]);

  return null;
}
