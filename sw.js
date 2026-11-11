// HAECHU：手機推播通知＋把 App 的檔案存在手機裡（重新打開不用再整包下載）
// ・app.js / app.css 後面有 ?v=指紋：內容一改指紋就變，所以存起來的永遠不會是舊的 → 直接用手機裡的
// ・index.html（很小）：每次先問網路拿最新的；網路太慢或沒網路才用手機裡存的
// ・圖示、啟動圖、vendor 外掛、字型：先用手機裡的，背後順便更新
// ・資料（Supabase、媒體伺服器、version.txt）完全不經過這裡
const CACHE = "hc-app-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));

const SHELL = "./__shell__";
async function navFirst(req) {
  const c = await caches.open(CACHE);
  const net = fetch(req, { cache: "no-store" }).then(async (r) => {
    if (r && r.ok && new URL(req.url).pathname.replace(/index\.html$/, "") === new URL(self.registration.scope).pathname) await c.put(SHELL, r.clone());
    return r;
  });
  const old = await c.match(SHELL);
  if (!old || new URL(req.url).searchParams.has("v")) return net;   // 按「更新」進來的（網址有 ?v=）一定等新的
  // 網路 2.5 秒內回來就用新的；太慢就先用手機裡的（新的下載好會存起來，下次就是新的）
  return Promise.race([net.catch(() => old), new Promise((ok) => setTimeout(() => ok(old), 2500))]);
}
async function versioned(req) {   // 有指紋的檔案：手機裡有就直接用
  const c = await caches.open(CACHE);
  const hit = await c.match(req);
  if (hit) return hit;
  const r = await fetch(req);
  if (r && r.ok) {
    await c.put(req, r.clone());
    // 同一個檔案只留最新的兩版
    const p = new URL(req.url).pathname, same = (await c.keys()).filter((k) => new URL(k.url).pathname === p);
    for (const k of same.slice(0, Math.max(0, same.length - 2))) await c.delete(k);
  }
  return r;
}
async function swr(req) {   // 先用手機裡的，背後更新
  const c = await caches.open(CACHE);
  const hit = await c.match(req);
  const net = fetch(req).then((r) => { if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone()); return r; }).catch(() => hit || Response.error());
  return hit || net;
}
self.addEventListener("fetch", (e) => {
  const req = e.request; if (req.method !== "GET") return;
  const u = new URL(req.url), same = u.origin === self.location.origin;
  if (same && req.mode === "navigate") {
    if (u.pathname.replace(/index\.html$/, "") !== new URL(self.registration.scope).pathname) return;   // 只管 App 本體（試玩頁等照舊）
    e.respondWith(navFirst(req)); return;
  }
  if (same && u.searchParams.has("v") && /\/(app\.(js|css))$/.test(u.pathname)) { e.respondWith(versioned(req)); return; }
  if (same && (/\/vendor\//.test(u.pathname) || /\.(png|webp|jpg|svg|webmanifest)$/.test(u.pathname)) && !/\/_t\//.test(u.pathname)) { e.respondWith(swr(req)); return; }
  if (u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") { e.respondWith(swr(req)); return; }
});

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
