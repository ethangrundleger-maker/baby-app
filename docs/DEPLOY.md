# Deployment guide

End-to-end steps to get James-Day live on your phone.

## 1. Supabase

1. Create a free project at https://supabase.com → **New Project**.
2. In the project dashboard, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only; never bundle to client)
3. Open **SQL Editor** → New query → paste contents of `supabase/migrations/0001_init.sql` → Run.
4. Open `supabase/migrations/0002_seed_family.sql`, change `'changeme'` to your chosen invite code (any string), paste into SQL Editor, Run.
5. **Auth → Email Templates** — confirm the magic-link template uses `{{ .ConfirmationURL }}`. Default is fine.
6. **Auth → URL Configuration** — add your production URL to the allowlist (e.g. `https://james-day.vercel.app`).

## 2. Anthropic

1. Get an API key at https://console.anthropic.com.
2. Add a small monthly credit. Daily parse + summary cost is pennies (Haiku 4.5 + Sonnet 4.6).
3. Set `ANTHROPIC_API_KEY` env var.

## 3. VAPID keys for push

```bash
npm install
npm run generate-vapid
```

Copy the three printed env vars into your env config (`.env.local` for dev, Vercel dashboard for prod):

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
```

## 4. Vercel

1. Push this repo to GitHub.
2. https://vercel.com → New Project → Import the repo.
3. Add every env var from `.env.example` in the Vercel UI.
4. Deploy.
5. After first deploy, go back to Supabase **Auth → URL Configuration** and add the Vercel URL.

## 5. Install on iPhone

1. Open the Vercel URL in **Safari**.
2. Tap the **Share** button → **Add to Home Screen** → Add.
3. Open the app from the home screen.
4. Sign in (magic link) — open the email from inside Safari/the app to complete sign-in.
5. Tap **Enable push** in the top right. iOS will prompt for permission. iOS push only works once the PWA is installed to the home screen (iOS 16.4+).

## 6. Add nanny

1. Share the `FAMILY_INVITE_CODE` with Shelly.
2. She opens the app URL, fills in email + name + invite code on the login screen, taps the magic link, and she's in.
3. Her pastes from then on are tagged "by Shelly" and trigger push to subscribed parents.

## 7. Backfill historical data

In **Paste**, set the date picker to any past day and paste the note. The app handles unlimited historical entries — they appear in the History tab and feed the Stats charts.

## Cost (typical)

- Supabase: free tier covers a single family forever.
- Vercel: free hobby tier is fine.
- Anthropic: 1 paste/day ≈ 10–20¢/month at current Haiku + Sonnet prices.

Total: ~$0.20/month + Anthropic credit minimum.
