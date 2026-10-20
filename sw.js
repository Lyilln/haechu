// HAECHU：只負責手機推播通知（不暫存網頁，更新時大家拿到的一定是最新版）
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "HAECHU", {
    body: d.body || "",
    icon: "icon-192.png",
    badge: "icon-192.png",
    tag: d.tag || undefined,
    data: { path: d.path || "" },
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = self.registration.scope + ((e.notification.data && e.notification.data.path) || "");
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of list) {
      try { if ("navigate" in c) await c.navigate(url); } catch (x) {}
      if ("focus" in c) return c.focus();
    }
    return self.clients.openWindow(url);
  })());
});
