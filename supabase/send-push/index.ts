// HAECHU：手機推播通知（Supabase Edge Function：send-push）
// 有新通知時由資料庫自動呼叫；只接受帶著正確暗號（HOOK_SECRET）的呼叫
// 需要的 Secrets：VAPID_PUBLIC、VAPID_PRIVATE、HOOK_SECRET（都在設定說明裡）
import webpush from "npm:web-push@3.6.7";
import { createClient } from "jsr:@supabase/supabase-js@2";

type Ev = { id: string; kind: string; aud?: string; member?: string; group?: string; text?: string; liveId?: string; postId?: string; vis?: string; ts?: number; pt?: string; pb?: string; pbMs?: string };
const ok = (o: unknown = { ok: true }) => new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.headers.get("x-hook-secret") !== Deno.env.get("HOOK_SECRET")) return new Response("no", { status: 401 });
  const { new: nv, old: ov, by } = await req.json();
  const oldIds = new Set((Array.isArray(ov) ? ov : []).map((e: Ev) => e && e.id));
  const fresh: Ev[] = (Array.isArray(nv) ? nv : []).filter((e: Ev) => e && e.id && !oldIds.has(e.id) && Date.now() - (e.ts || 0) < 10 * 60e3);
  if (!fresh.length) return ok({ sent: 0 });
  fresh.sort((a, b) => (a.ts || 0) - (b.ts || 0));   // 一次好幾則（TIE 連發）：照傳送的順序推播

  webpush.setVapidDetails("https://lyilln.github.io/haechu/", Deno.env.get("VAPID_PUBLIC")!, Deno.env.get("VAPID_PRIVATE")!);
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

  const { data: subs } = await db.from("push_subs").select("endpoint,user_id,sub,seen_at");
  if (!subs?.length) return ok({ sent: 0 });
  const { data: profs } = await db.from("profiles").select("id,username");
  const uname = new Map((profs || []).map((p) => [p.id, p.username]));
  const users = [...new Set(subs.map((s) => uname.get(s.user_id)).filter(Boolean))] as string[];
  const keys = users.flatMap((u) => ["daisuki_fan_artists@" + u, "daisuki_tie_passes@" + u, "daisuki_tie_settings@" + u, "daisuki_notif_settings@" + u, "daisuki_online@" + u, "daisuki_tour_tix@" + u]);
  const { data: rows } = await db.from("kv").select("k,v").in("k", keys.length ? keys : ["-"]);
  const kv = new Map((rows || []).map((r) => [r.k, r.v]));
  const { data: ro } = await db.from("kv").select("v").eq("k", "daisuki_roster").maybeSingle();
  const members = (ro?.v?.members || {}) as Record<string, { name?: string }>;
  const { data: ap } = await db.from("kv").select("v").eq("k", "daisuki_art_prof").maybeSingle();
  const prof = (ap?.v || {}) as Record<string, { n_tie?: string; n_feed?: string; avatar?: string; av_tie?: string }>;
  const { data: mp } = await db.from("kv").select("v").eq("k", "daisuki_ms_public").maybeSingle();
  const msPub = (mp?.v || {}) as Record<string, Record<string, number>>;
  const isMem = (u: string, gid?: string) => !!gid && Number((msPub[u] || {})[gid] || 0) > Date.now();
  // App 正開著（20 秒內回報過在線上）就不送手機推播，改由 App 內通知條顯示
  const online = (u: string) => { const t = Number(kv.get("daisuki_online@" + u) || 0); return t > 0 && Date.now() - t < 45e3; };
  // 11/17 另外看 push_seen：App 開著時每 25 秒直接回報（粉絲、藝人、管理員都有，不用等資料同步）。同一個人任何一支手機 60 秒內有回報＝正在用 App，這個人的每支手機都不推
  const seenU = new Set(subs.filter((s) => s.seen_at && Date.now() - Date.parse(s.seen_at) < 60_000).map((s) => s.user_id));

  const wants = (u: string, e: Ev) => {
    const st = (kv.get("daisuki_notif_settings@" + u) || {}) as Record<string, boolean>;
    if (st[e.kind] === false) return false;
    const a = String(e.aud || "");
    if (a === "all") return true;
    if (a.startsWith("tix:")) return !!((kv.get("daisuki_tour_tix@" + u) || {}) as Record<string, number>)[a.slice(4)];
    if (a.startsWith("gs:")) { const f = (kv.get("daisuki_fan_artists@" + u) || []) as string[]; return a.slice(3).split(",").some((g) => f.includes(g)); }
    if (a.startsWith("g:")) return ((kv.get("daisuki_fan_artists@" + u) || []) as string[]).includes(a.slice(2));
    if (a.startsWith("tie:")) {
      const mid = a.slice(4), pass = ((kv.get("daisuki_tie_passes@" + u) || {}) as Record<string, { expires?: number }>)[mid];
      const set = ((kv.get("daisuki_tie_settings@" + u) || {}) as Record<string, { muted?: boolean }>)[mid];
      return !!pass && (pass.expires || 0) > Date.now() && !(set && set.muted);
    }
    if (a.startsWith("u:")) return a.slice(2) === u;
    return false;
  };
  const clean = (t?: string) => String(t || "").split("@@@").join("").split("{愛稱}").join("").trim().slice(0, 140);
  const msg = (e: Ev) => {
    // App 已經照 Weverse 的格式寫好標題（團名）和內容（📝／💬／🔴／🎂），直接用
    if (e.pb && e.kind !== "whisper") {
      const path = e.kind === "live" ? (e.liveId ? "#/fan/live?id=" + e.liveId : "#/fan") : e.kind === "news" ? "#/fan/core?p=news" : e.kind === "tour" ? "#/fan/core?p=tour" : e.kind === "bday" ? (e.group ? "#/fan/grp?id=" + e.group : "#/fan") : e.postId ? "#/fan?op=" + e.postId : "#/fan";
      return { title: e.pt || "HAECHU", body: String(e.pb).slice(0, 160), path };
    }
    const pn = e.member ? prof[e.member] || {} : {};
    const who = (e.member && ((e.kind === "whisper" ? pn.n_tie : pn.n_feed) || members[e.member]?.name)) || "HAECHU";
    if (e.kind === "news") return { title: "HAECHU 新聞", body: clean(e.text), path: "#/fan/core?p=news" + ((e as { newsId?: string }).newsId ? "&id=" + (e as { newsId?: string }).newsId : "") };
    if (e.kind === "system") return { title: "HAECHU 公告", body: clean(e.text), path: "#/fan/notifications" };
    if (e.kind === "whisper") return { title: who, body: clean(e.text), path: "#/fan/chat?m=" + (e.member || "") };
    if (e.kind === "live") return { title: who, body: (String(e.text || "").startsWith("在直播中") ? "" : "開始直播：") + clean(e.text), path: e.liveId ? "#/fan/live?id=" + e.liveId : "#/fan" };
    if (e.kind === "comment") return { title: who, body: "回覆了你的留言：" + clean(e.text), path: "#/fan" };
    if (e.kind === "tour") return { title: who, body: clean(e.text), path: "#/fan/core?p=tour" + ((e as { tourId?: string }).tourId ? "&id=" + (e as { tourId?: string }).tourId : "") };
    if (e.kind === "post") return { title: who, body: "📝 " + who + " 發表了貼文：" + clean(e.text), path: "#/fan?op=" + (e.postId || "") };
    return { title: who, body: clean(e.text), path: "#/fan" };
  };

  let sent = 0;
  const dead: string[] = [];
  for (const e of fresh) {
    const pn = e.member ? prof[e.member] || {} : {};
    const icon = (e.kind === "whisper" ? pn.av_tie || pn.avatar : pn.avatar) || "";   // Android、電腦會顯示藝人頭貼；iPhone 一律是 App 圖示
    for (const s of subs) {
      const u = uname.get(s.user_id);
      if (!u || s.user_id === by || !wants(u, e) || online(u) || seenU.has(s.user_id)) continue;
      const nk = e.kind === "whisper" && e.member ? String((((kv.get("daisuki_tie_settings@" + u) || {}) as Record<string, { nickname?: string }>)[e.member] || {}).nickname || "") : "";
      const ev = nk ? { ...e, text: String(e.text || "").split("@@@").join(nk).split("{愛稱}").join(nk) } : e;   // TIE 的 @@@ 換成這位粉絲自己取的暱稱
      const m = msg(ev.vis === "ms" && !isMem(u, ev.group) ? { ...ev, text: "查看Membership貼文", pb: ev.pbMs || ev.pb } : ev);
      try {
        await webpush.sendNotification(s.sub, JSON.stringify({ ...m, tag: e.id, icon: icon.startsWith("http") ? icon : "" }), { TTL: 60 * 60 * 24 });
        sent++;
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) dead.push(s.endpoint);
      }
    }
  }
  if (dead.length) await db.from("push_subs").delete().in("endpoint", dead);
  return ok({ sent });
});
