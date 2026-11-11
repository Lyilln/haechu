// HAECHU：試玩頁有訪客傳 TIE → 推播通知管理員（Supabase Edge Function：try-push）
// 由 Cloudflare 的 haechu-media Worker 呼叫；只接受帶著正確暗號（HOOK_SECRET）的呼叫
// 只發給 profiles.role = "admin" 的帳號（四位管理員），粉絲、藝人都不會收到
// 用到的 Secrets 跟 send-push 一樣：VAPID_PUBLIC、VAPID_PRIVATE、HOOK_SECRET（已經設過，不用再加）
// 部署時把「Verify JWT / Enforce JWT verification」關掉（這支靠 HOOK_SECRET 擋人）
import webpush from "npm:web-push@3.6.7";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ok = (o: unknown = { ok: true }) => new Response(JSON.stringify(o), { headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.headers.get("x-hook-secret") !== Deno.env.get("HOOK_SECRET")) return new Response("no", { status: 401 });
  const b = await req.json().catch(() => ({}));
  const id = String(b.id || "").replace(/[^a-z0-9]/g, "").slice(0, 32);
  if (!id) return ok({ sent: 0 });
  const nick = String(b.nick || "訪客").slice(0, 12), text = String(b.text || "").slice(0, 120), n = Number(b.n) || 1;

  webpush.setVapidDetails("https://lyilln.github.io/haechu/", Deno.env.get("VAPID_PUBLIC")!, Deno.env.get("VAPID_PRIVATE")!);
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: admins } = await db.from("profiles").select("id").eq("role", "admin");
  const ids = (admins || []).map((a) => a.id);
  if (!ids.length) return ok({ sent: 0 });
  const { data: subs } = await db.from("push_subs").select("endpoint,sub").in("user_id", ids);

  const msg = { title: `試玩｜${nick} 傳了 TIE${n > 1 ? `（${n} 則）` : ""}`, body: text || "有訪客在等 LUMI 回覆", path: "#/admin", tag: "try:" + id, open: "try:" + id };
  let sent = 0; const dead: string[] = [];
  for (const s of subs || []) {
    try { await webpush.sendNotification(s.sub, JSON.stringify(msg), { TTL: 60 * 60 * 24, urgency: "high" }); sent++; }
    catch (err) { const code = (err as { statusCode?: number }).statusCode; if (code === 404 || code === 410) dead.push(s.endpoint); }
  }
  if (dead.length) await db.from("push_subs").delete().in("endpoint", dead);
  return ok({ sent });
});
