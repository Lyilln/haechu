// HAECHU：只負責手機推播通知（點通知直接到那則通知的頁面）
// 11/11：拿掉「把檔案存在手機」那一層——有它在，iPhone 每張圖都要先經過它，
//   原本瀏覽器自己記得的圖片不會直接拿來用，照片、背景、封面都變成重新下載、一截一截慢慢出現。
//   拿掉後回到瀏覽器自己的快取（以前那樣）。之前存過的也一併清掉。
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "HAECHU", {
    body: d.body || "",
    icon: d.icon || "icon-192.png",
    badge: "icon-192.png",
    tag: d.tag || undefined,
    data: { path: d.path || "", id: d.id || d.tag || "", open: d.open || "" },
  }));
});
// 點推播：App 開著 → 叫 App 自己去那則通知的頁面（跟在通知頁點它一樣）；App 沒開 → 打開 App 並帶上通知代號
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const d = e.notification.data || {}, msg = { hcOpen: { id: d.id || "", open: d.open || "", path: d.path || "" } };
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const c = list.find((x) => new URL(x.url).pathname.replace(/index\.html$/, "") === new URL(self.registration.scope).pathname) || list[0];
    if (c) { try { c.postMessage(msg); } catch (x) {} try { return await c.focus(); } catch (x) { return; } }
    const q = new URLSearchParams(); if (d.id) q.set("nid", d.id); if (d.open) q.set("nop", d.open); if (d.path) q.set("np", d.path);
    return self.clients.openWindow(self.registration.scope + (q.toString() ? "?" + q : ""));
  })());
});
