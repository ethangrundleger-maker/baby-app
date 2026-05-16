/* James-Day service worker — static cache + web push.
 * NOTE: We deliberately do NOT cache navigations (HTML responses) because they
 * include authenticated content; serving a stale page to a different signed-in
 * user would leak data on shared devices. Static assets only.
 */
const CACHE = "james-day-v2";
const APP_SHELL = ["/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(APP_SHELL)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Pass through API + navigation requests (auth-sensitive); cache-first only
  // for static same-origin assets.
  if (url.pathname.startsWith("/api/")) return;
  if (req.mode === "navigate") return;

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res.ok && url.origin === self.location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => undefined);
      }
      return res;
    }).catch(() => cached))
  );
});

self.addEventListener("push", (event) => {
  let payload = { title: "James-Day", body: "New update", url: "/today" };
  try { if (event.data) payload = { ...payload, ...event.data.json() }; }
  catch { if (event.data) payload.body = event.data.text(); }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: payload.url || "/today" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // Defense-in-depth: only honor relative same-origin paths from the payload.
  const raw = (event.notification.data && event.notification.data.url) || "/today";
  const url = (typeof raw === "string" && /^\/[a-zA-Z0-9/_\-?=&%.]*$/.test(raw)) ? raw : "/today";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const c of clientList) { if ("focus" in c) { c.navigate(url); return c.focus(); } }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
