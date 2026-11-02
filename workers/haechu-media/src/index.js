/*
  HAECHU 照片／語音／影片 — Cloudflare Worker + R2
  ・上傳（PUT）：只有登入 HAECHU 的人可以（用 Supabase 確認身分）
  ・刪除（DELETE）：換新頭貼／背景／出道照時刪掉舊的；藝人只能刪自己的，管理員都可以
  ・下載（GET）：App 用，下載過的手機會自己存起來
  ・需要在 Worker 設定：
      R2 bucket 綁定：名稱 MEDIA → 選你的 bucket
      Text 變數：SUPABASE_URL = https://fgkyikpzqoovfffdulum.supabase.co
      Text 變數：SUPABASE_KEY = App 用的那把公開 key（sb_publishable_ 開頭）
      Text 變數（建議）：ALLOWED_ORIGIN = https://lyilln.github.io
  ・這裡沒有任何秘密 key
*/
const MAX = 50 * 1024 * 1024; // 單一檔案最大 50MB

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGIN || "").trim();
    const cors = {
      "Access-Control-Allow-Origin": allowed || "*",
      "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "authorization, content-type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };
    const reply = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json; charset=utf-8" } });

    if (req.method === "OPTIONS") return new Response(null, { headers: cors });

    // 雲端用量：只有管理員看得到（App 裡「雲端用量」用）
    if (url.pathname === "/usage" && req.method === "GET") {
      const tok = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      if (!tok) return reply({ error: "login" }, 401);
      const who = await fetch(env.SUPABASE_URL + "/auth/v1/user", { headers: { apikey: env.SUPABASE_KEY, Authorization: "Bearer " + tok } });
      if (!who.ok) return reply({ error: "login" }, 401);
      const uid = (await who.json()).id;
      const pr = await fetch(env.SUPABASE_URL + "/rest/v1/profiles?select=role&id=eq." + encodeURIComponent(uid), { headers: { apikey: env.SUPABASE_KEY, Authorization: "Bearer " + tok } });
      const me = pr.ok ? (await pr.json())[0] : null;
      if (!me || me.role !== "admin") return reply({ error: "forbidden" }, 403);
      const kind = k => k.startsWith("snv") ? "影片" : k.startsWith("sn") ? "SNS 照片" : k.startsWith("prof_") ? "頭貼・背景" : k.startsWith("gph_") ? "出道照" : k.startsWith("kvi_") ? "餐車・應援棒・聊天室背景" : "聊天室照片・語音";
      let cursor, bytes = 0, count = 0; const kinds = {};
      for (let i = 0; i < 200; i++) {
        const l = await env.MEDIA.list({ cursor, limit: 1000 });
        for (const o of l.objects) { bytes += o.size; count++; const k = kind(o.key); kinds[k] = (kinds[k] || 0) + o.size; }
        if (!l.truncated) break; cursor = l.cursor;
      }
      return reply({ bytes, count, kinds });
    }
    // 大檔案（MV 等）分段上傳：沒有大小上限（每段 ≤ 40MB）
    const mp = url.pathname.match(/^\/mpu\/([A-Za-z0-9._-]{1,160})$/);
    if (mp) {
      if (allowed && origin !== allowed) return reply({ error: "origin" }, 403);
      const tok = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      if (!tok) return reply({ error: "login" }, 401);
      const who = await fetch(env.SUPABASE_URL + "/auth/v1/user", { headers: { apikey: env.SUPABASE_KEY, Authorization: "Bearer " + tok } });
      if (!who.ok) return reply({ error: "login" }, 401);
      const key = mp[1], act = url.searchParams.get("a"), uid = url.searchParams.get("u") || "";
      if (req.method === "POST" && act === "start") {
        if (await env.MEDIA.head(key)) return reply({ ok: true, exists: true }, 409);
        const u = await env.MEDIA.createMultipartUpload(key, { httpMetadata: { contentType: url.searchParams.get("t") || "application/octet-stream" } });
        return reply({ uploadId: u.uploadId });
      }
      const up = env.MEDIA.resumeMultipartUpload(key, uid);
      if (req.method === "PUT" && act === "part") {
        const n = Number(url.searchParams.get("n") || 0);
        if (!(n >= 1 && n <= 10000)) return reply({ error: "part" }, 400);
        if (Number(req.headers.get("Content-Length") || 0) > 41 * 1024 * 1024) return reply({ error: "too_big" }, 413);
        const r = await up.uploadPart(n, req.body);
        return reply({ partNumber: r.partNumber, etag: r.etag });
      }
      if (req.method === "POST" && act === "done") { await up.complete(await req.json()); return reply({ ok: true }); }
      if (req.method === "DELETE") { try { await up.abort(); } catch (e) {} return reply({ ok: true }); }
      return reply({ error: "method" }, 405);
    }
    const m = url.pathname.match(/^\/media\/([A-Za-z0-9._-]{1,160})$/);
    if (!m) return reply({ error: "not_found" }, 404);
    const key = m[1];

    if (req.method === "GET") {
      const obj = await env.MEDIA.get(key);
      if (!obj) return reply({ error: "not_found" }, 404);
      const h = new Headers(cors);
      obj.writeHttpMetadata(h);
      h.set("ETag", obj.httpEtag);
      h.set("Cache-Control", "public, max-age=31536000, immutable");
      return new Response(obj.body, { headers: h });
    }

    if (req.method === "PUT") {
      if (allowed && origin !== allowed) return reply({ error: "origin" }, 403);
      const tok = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      if (!tok) return reply({ error: "login" }, 401);
      const who = await fetch(env.SUPABASE_URL + "/auth/v1/user", {
        headers: { apikey: env.SUPABASE_KEY, Authorization: "Bearer " + tok },
      });
      if (!who.ok) return reply({ error: "login" }, 401);
      const len = Number(req.headers.get("Content-Length") || 0);
      if (len > MAX) return reply({ error: "too_big" }, 413);
      if (await env.MEDIA.head(key)) return reply({ ok: true, exists: true }, 409);
      await env.MEDIA.put(key, req.body, {
        httpMetadata: { contentType: req.headers.get("Content-Type") || "application/octet-stream" },
      });
      return reply({ ok: true });
    }
    if (req.method === "DELETE") {
      if (allowed && origin !== allowed) return reply({ error: "origin" }, 403);
      const pm = key.match(/^prof_(.+?)_/), isG = key.startsWith("gph_");
      if (!pm && !isG) return reply({ error: "forbidden" }, 403);
      const tok = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      if (!tok) return reply({ error: "login" }, 401);
      const who = await fetch(env.SUPABASE_URL + "/auth/v1/user", {
        headers: { apikey: env.SUPABASE_KEY, Authorization: "Bearer " + tok },
      });
      if (!who.ok) return reply({ error: "login" }, 401);
      const uid = (await who.json()).id;
      const pr = await fetch(env.SUPABASE_URL + "/rest/v1/profiles?select=role,member&id=eq." + encodeURIComponent(uid), {
        headers: { apikey: env.SUPABASE_KEY, Authorization: "Bearer " + tok },
      });
      const me = pr.ok ? (await pr.json())[0] : null;
      const ok = me && (me.role === "admin" || (pm && me.member === pm[1]));
      if (!ok) return reply({ error: "forbidden" }, 403);
      await env.MEDIA.delete(key);
      return reply({ ok: true });
    }
    return reply({ error: "method" }, 405);
  },
};
