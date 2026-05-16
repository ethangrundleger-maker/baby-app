# James-Day

A daily nanny-report visualizer and baby-stats PWA for **James** (DOB 2025-11-30).

> Nanny pastes free-form end-of-day notes → AI parses them into a structured timeline → parents see the day at a glance with **Last Nap** and **Last Feed** as hero cards, plus stats trends. Installs to your phone like an app, sends push notifications when the nanny posts.

---

## Stack

- **Next.js 15** (App Router, RSC) on **Vercel**
- **Supabase** — Postgres (with RLS), Auth (magic links), Realtime
- **Anthropic Claude API** — Haiku 4.5 for structured extraction, Sonnet 4.6 for human summaries; with a deterministic heuristic parser as fast path + fallback
- **Web Push** (VAPID) — works on iOS PWA when added to the home screen (iOS 16.4+)
- **Recharts** for charts; **Tailwind** for styling

## Features

- **Paste tab** — Nanny / parent pastes a daily note. Hybrid parser extracts naps, feeds, diapers, outings, meds, and the development sections (Development skills, Songs, Books, Sensory, Signs). Preview before saving. Re-pasting replaces the day's events idempotently.
- **Today tab** — Hero cards for **Last Nap**, **Last Feed**, last diaper, last medication. Each shows time, duration, and whether you're inside the typical wake/feed window for James's age. Below: a typed event timeline + daily AI summary + optional handoff note.
- **Stats tab** — Last 21 days: day sleep hours, feeds/oz, diapers (wet/bm), longest wake window. Charts overlay the typical 5–6 month ranges (blended from Moms on Call, Taking Cara Babies, Precious Little Sleep, Weissbluth, AAP, KellyMom, La Leche League).
- **History tab** — Browse / re-read any past day with its original paste, summary, handoff note, and parsed timeline.
- **Settings** — Family info, full developmental context for James's age, reflux tips, solids-intro guidance, list of all evidence sources with links.
- **Multi-user, shared family** — Parents + nanny join the same family with an invite code; every entry is tagged with the author's display name. RLS enforces family scope.
- **Push notifications** — On each nanny paste, parents subscribed to push receive a notification with the day summary.
- **Historical backfill** — Pick any past date in the paste form to enter older reports.
- **Accessibility** — WCAG 2.2 AA targeted: keyboard-reachable, focus-visible rings, ARIA-labeled charts with data-table fallback, contrast pairs from a dark palette, 44pt touch targets, safe-area-insets on iPhone.

## Quickstart (local)

```bash
# 1. Clone, install
npm install

# 2. Create a Supabase project at https://supabase.com, then:
#    - Open SQL editor and run supabase/migrations/0001_init.sql
#    - Edit invite_code in supabase/migrations/0002_seed_family.sql then run it
#    - Copy URL + anon key + service role key to .env.local

# 3. Generate VAPID keys for web push
npm run generate-vapid
# Paste the printed values into .env.local

# 4. Get an Anthropic API key, add to .env.local

# 5. Run
cp .env.example .env.local        # fill in the values
npm run dev                       # → http://localhost:3000
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import into Vercel.
3. Add the env vars from `.env.example` in the Vercel dashboard.
4. Deploy. You'll get a URL like `https://james-day.vercel.app`.
5. On your phone: open that URL in **Safari (iOS)** or Chrome (Android), then **Share → Add to Home Screen**. The app is now installed.
6. Open the installed app, sign in, then tap **Enable push** in the header.

## Adding family members

- Parents share the value of `FAMILY_INVITE_CODE` (the one you set in migration 0002) with the nanny.
- Each family member visits the login page, enters their email + name + that invite code, and gets a magic link. They're added to the family automatically.

## How the parser works

Two-layer:

1. **Heuristic pass** — Deterministic regex parser tuned to Shelly's format:
   - `(wake/morning_feed)` header
   - `H:MM down ; H:MM up` for naps (and bare `H:MM down` / `H:MM up`)
   - `N oz breastmilk|formula|mixed` and `nursed` for feeds
   - `wet | dry | bm | dirty | poop` for diapers
   - Outings (`walk`, `park`, `Dr appointment`, `blessing box`, …)
   - Footer labels (`Development skills worked on:`, `Songs/music:`, `Books:`, `Sensory:`, `Signs:`)
   - AM/PM inferred by monotonicity from a 6am anchor
2. **Claude fallback / preference** — If heuristic confidence < 0.7 (or you set `preferClaude: true`), the raw note is sent to Claude Haiku 4.5 with a strict JSON schema. The day summary is always written by Sonnet 4.6.

Every event is stored with a per-event confidence; anything < 0.6 is flagged for review in the timeline UI.

## QA loop

This project ships with an **expert QA skill** at `.claude/skills/qa-expert/SKILL.md`. Run it inside Claude Code:

```
> Use the qa-expert skill to review this branch.
```

The skill produces a punch list ranked P0→P3 across eight categories (functional, data integrity, security, accessibility, performance, mobile/PWA, error states, app-specific edge cases). Fix everything P0/P1, then re-run until the verdict is `SHIP`.

## Schema overview

- **families** — name, timezone, invite_code
- **family_members** — (family, user, display_name, role: parent|nanny|viewer)
- **children** — family_id, name, dob, notes
- **daily_reports** — one per (child, day): raw_text, summary, handoff_note, source, parse_confidence, author
- **events** — every action: type (nap|feed|diaper|outing|medication|milestone|song|book|sensory|sign|mood|handoff_note|note), occurred_at (UTC), type-specific fields, confidence, flagged_for_review
- **push_subscriptions** — per-user web push endpoints

All tables have **Row-Level Security** policies scoped to family membership.

## Sources used for developmental norms

See `lib/dev-norms/norms.json` for the raw data and `Settings → Developmental context` in-app for the linked source list. Sleep: Moms on Call, Taking Cara Babies, Precious Little Sleep, Ferber, Weissbluth. Feeding/parenting: AAP, CDC, WHO, La Leche League, KellyMom, Solid Starts, Wonder Weeks, Janet Lansbury/RIE, Mayo Clinic (reflux), NICHD Safe to Sleep.

## Privacy

- Data lives in your own Supabase project.
- Notes are sent to Anthropic only for parsing/summarization; not used for training (per the API terms).
- No third-party analytics.

## License

Private / family use.
