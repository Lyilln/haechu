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
      Secret（試玩推播用）：TRY_HOOK = 跟 Supabase 的 HOOK_SECRET 同一串（有訪客在試玩頁傳 TIE，就叫 Supabase 的 try-push 通知四位管理員）
  ・這裡沒有任何秘密 key
*/
const MAX = 50 * 1024 * 1024; // 單一檔案最大 50MB

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const origin = req.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGIN || "").trim().replace(/\/+$/, "");   // 網址後面多打一個「/」也沒關係
    const cors = {
      "Access-Control-Allow-Origin": allowed || "*",
      "Access-Control-Allow-Methods": "GET, HEAD, PUT, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "authorization, content-type, range",
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
    // 試玩頁（/try）的 TIE：訪客不用登入，訊息存在 R2 的 try/<id>.json
    //   GET  /try/<id>            訪客讀自己的對話
    //   PUT  /try/<id>            訪客送訊息（只收 from:"fan"，不能假冒偶像）
    //   GET  /try                 管理員列出全部對話（要登入＋admin）
    //   POST /try/<id>?a=reply    管理員以示範偶像身分回覆（要登入＋admin）
    const tm = url.pathname.match(/^\/try(?:\/([a-z0-9]{8,32}))?$/);
    if (tm) {
      const id = tm[1];
      const isAdmin = async () => {
        const tok = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
        if (!tok) return null;
        const who = await fetch(env.SUPABASE_URL + "/auth/v1/user", { headers: { apikey: env.SUPABASE_KEY, Authorization: "Bearer " + tok } });
        if (!who.ok) return null;
        const uid = (await who.json()).id;
        const pr = await fetch(env.SUPABASE_URL + "/rest/v1/profiles?select=role,username,name&id=eq." + encodeURIComponent(uid), { headers: { apikey: env.SUPABASE_KEY, Authorization: "Bearer " + tok } });
        const me = pr.ok ? (await pr.json())[0] : null;
        return me && me.role === "admin" ? me : null;
      };
      const load = async k => { const o = await env.MEDIA.get(k); if (!o) return { v: null, etag: null }; let v = null; try { v = JSON.parse(await o.text()); } catch (e) {} return { v, etag: o.etag }; };
      const clean = s => String(s == null ? "" : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
      // 讀＋改＋寫，用 etag 防止兩邊同時寫互相蓋掉
      const update = async (k, fn) => {
        for (let i = 0; i < 5; i++) {
          const { v, etag } = await load(k);
          const nv = fn(v || { nick: "", ts: Date.now(), msgs: [] });
          if (!nv) return v;
          const body = JSON.stringify(nv);
          if (body.length > 120000) return "too_big";
          const r = await env.MEDIA.put(k, body, { httpMetadata: { contentType: "application/json" }, ...(etag ? { onlyIf: { etagMatches: etag } } : {}) });
          if (r) return nv;
        }
        return null;
      };
      if (!id) {
        if (req.method !== "GET") return reply({ error: "method" }, 405);
        if (!(await isAdmin())) return reply({ error: "forbidden" }, 403);
        const out = []; let cursor;
        for (let i = 0; i < 10; i++) {
          const l = await env.MEDIA.list({ prefix: "try/", cursor, limit: 1000 });
          const got = await Promise.all(l.objects.filter(o => Date.now() - o.uploaded.getTime() < 60 * 864e5).map(async o => { const { v } = await load(o.key); return v && { id: o.key.slice(4, -5), ...v }; }));
          got.forEach(x => x && out.push(x));
          if (!l.truncated) break; cursor = l.cursor;
        }
        return reply(out);
      }
      const k = "try/" + id + ".json";
      if (req.method === "GET") { const { v } = await load(k); return reply(v || { nick: "", msgs: [] }); }
      if (req.method === "PUT") {
        if (allowed && origin !== allowed) return reply({ error: "origin" }, 403);
        let b; try { b = await req.json(); } catch (e) { return reply({ error: "json" }, 400); }
        const nick = clean(b && b.nick).slice(0, 12);
        const inc = (Array.isArray(b && b.msgs) ? b.msgs : []).filter(m => m && m.from === "fan" && typeof m.id === "string" && /^[a-z0-9]{4,24}$/.test(m.id)).slice(-20)
          .map(m => ({ id: m.id, from: "fan", text: clean(m.text).slice(0, 300), ts: Math.min(Number(m.ts) || Date.now(), Date.now()) })).filter(m => m.text);
        let ping = null;
        const res = await update(k, v => {
          const have = new Set((v.msgs || []).map(m => m.id)), add = inc.filter(m => !have.has(m.id));
          if ((v.msgs || []).filter(m => m.from === "fan").length + add.length > 200) return null;
          if (!add.length && (v.nick || "") === (nick || v.nick || "")) return null;
          // 有新訊息就通知管理員；同一位訪客 2 分鐘內只通知一次（連發好幾則不會一直響）
          let pingTs = v.pingTs || 0; ping = null;
          if (add.length && Date.now() - pingTs > 2 * 60e3) { pingTs = Date.now(); ping = { id, nick: nick || v.nick || "訪客", text: add[add.length - 1].text, n: add.length }; }
          return { ...v, nick: nick || v.nick || "", ts: Date.now(), pingTs, msgs: [...(v.msgs || []), ...add].sort((a, c) => a.ts - c.ts) };
        });
        if (res === "too_big") return reply({ error: "too_big" }, 413);
        if (ping && env.TRY_HOOK && env.SUPABASE_URL) {
          const call = fetch(env.SUPABASE_URL + "/functions/v1/try-push", { method: "POST", headers: { "Content-Type": "application/json", "x-hook-secret": env.TRY_HOOK, apikey: env.SUPABASE_KEY || "" }, body: JSON.stringify(ping) }).catch(() => {});
          if (ctx && ctx.waitUntil) ctx.waitUntil(call); else await call;
        }
        const { v } = await load(k);
        return reply(v || { nick, msgs: [] });
      }
      if (req.method === "POST" && url.searchParams.get("a") === "reply") {
        const me = await isAdmin(); if (!me) return reply({ error: "forbidden" }, 403);
        let b; try { b = await req.json(); } catch (e) { return reply({ error: "json" }, 400); }
        const text = clean(b && b.text).slice(0, 500); if (!text) return reply({ error: "empty" }, 400);
        const m = { id: "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), from: "idol", text, ts: Date.now(), by: me.username || "", byName: me.name || me.username || "" };
        const res = await update(k, v => ({ ...v, ts: Date.now(), msgs: [...(v.msgs || []), m] }));
        if (!res || res === "too_big") return reply({ error: "save" }, 500);
        return reply(res);
      }
      return reply({ error: "method" }, 405);
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

    // 下載：支援「分段讀取」（Range），影片一按就能邊下載邊播（iPhone 一定要這個才能直接播網址）
    if (req.method === "GET" || req.method === "HEAD") {
      const rh = req.headers.get("Range");
      const obj = await env.MEDIA.get(key, rh ? { range: req.headers } : undefined);
      if (!obj) return reply({ error: "not_found" }, 404);
      const h = new Headers(cors);
      obj.writeHttpMetadata(h);
      h.set("ETag", obj.httpEtag);
      h.set("Cache-Control", "public, max-age=31536000, immutable");
      h.set("Accept-Ranges", "bytes");
      h.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
      const body = req.method === "HEAD" ? null : obj.body;
      if (rh && obj.range) {
        const r = obj.range;
        const off = "suffix" in r ? obj.size - r.suffix : (r.offset || 0);
        const len = "suffix" in r ? r.suffix : (r.length != null ? r.length : obj.size - off);
        h.set("Content-Range", `bytes ${off}-${off + len - 1}/${obj.size}`);
        h.set("Content-Length", String(len));
        return new Response(body, { status: 206, headers: h });
      }
      h.set("Content-Length", String(obj.size));
      return new Response(body, { headers: h });
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
