import webpush from "web-push";
import { supabaseAdmin } from "./supabase/server";

let configured = false;
function configure() {
  if (configured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:nobody@example.com";
  if (!pub || !priv) throw new Error("VAPID keys not configured");
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

export async function sendPushToFamily(familyId: string, payload: { title: string; body: string; url?: string }) {
  configure();
  const db = supabaseAdmin();
  const { data: subs } = await db
    .from("push_subscriptions").select("*").eq("family_id", familyId);
  if (!subs || subs.length === 0) return { sent: 0 };

  const body = JSON.stringify(payload);
  let sent = 0;
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } } as webpush.PushSubscription,
        body,
      );
      sent++;
    } catch (err) {
      const code = (err as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) {
        await db.from("push_subscriptions").delete().eq("id", s.id);
      }
    }
  }));
  return { sent };
}
