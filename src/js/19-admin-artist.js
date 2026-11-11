/* HAECHU｜管理員一體化、藝人端 */
/* =========================================================
   管理員一體化：管理員＝藝人（自己的藝人身分）＋粉絲，不用切換
   ・底部選單跟粉絲端一樣：LOVE、MEET、TIE、FEST、SHOP、ME
   ・每頁就是粉絲看到的畫面；藝人和管理員能做的事，放成一兩個「入口」
   ・發動態（永遠用自己的藝人身分）和發公告（HAECHU官方）是兩個分開的入口，不會發錯
   ・畫面路由還是 #/fan、#/artist、#/admin，但管理員在三者之間自動切，不用手動切換
   ========================================================= */
   // 管理員的藝人身分＝在「藝人與團」把自己加進團的那位成員；還沒加就沒有
const isUni=()=>{ const s=session(); return !!(s&&s.uni); };
const uniMe=()=>{ const s=session(); if(!s) return ""; const a=ACCOUNTS[s.email], m=(a&&a.member)||s.home; return m&&MEMBERS[m]?m:""; };
const UNI_ROUTE={home:"#/fan",live:"#/fan?tab=live",whisper:"#/fan?tab=whisper",core:"#/fan?tab=core",shop:"#/fan?tab=shop",me:"#/fan?tab=me"};
function uniActive(){ const r=route();
  if(r.role==="fan") return r.tab||"home";
  if(r.role==="artist") return ({home:"home",live:"live",whisper:"whisper",foc:"core",points:"me"})[r.tab||"home"]||"home";
  const t=r.tab||""; if(t==="foc") return "core"; if(t==="shopadm"||t==="albums"||r.sub==="themes"||r.sub==="thedit") return "shop"; if(t==="reports"||t==="posts"||t==="announce") return "home"; return "me"; }
const uniTodo=()=>({rep:openReports().length,th:getThemes().filter(t=>t.status==="pending").length,live:getLives().filter(l=>!l.endTs&&l.member!==uniMe()).length});
/* 選單圖示：沒選中是線條、選中變實心（同一個形狀） */
const UNI_SV=(o,f)=>`<span class="ui-ic"><svg class="o" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${o}</svg><svg class="f" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${f||o}</svg></span>`;
const UNI_IC={
  home:UNI_SV(`<path d="M12 20.2s-7.6-4.6-7.6-10.3A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.6 2.7c0 5.7-7.6 10.3-7.6 10.3z"/>`),
  live:UNI_SV(`<rect x="3.5" y="5.5" width="17" height="13" rx="3.4"/><path d="m10.4 9.4 4.4 2.6-4.4 2.6z"/>`,`<path fill-rule="evenodd" d="M6.9 5.5h10.2a3.4 3.4 0 0 1 3.4 3.4v6.2a3.4 3.4 0 0 1-3.4 3.4H6.9a3.4 3.4 0 0 1-3.4-3.4V8.9a3.4 3.4 0 0 1 3.4-3.4zm3.5 3.9v5.2l4.4-2.6z"/>`),
  whisper:UNI_SV(`<path d="M6 5h12a2.6 2.6 0 0 1 2.6 2.6v7.2A2.6 2.6 0 0 1 18 17.4h-6.2L7.4 20.6v-3.2H6a2.6 2.6 0 0 1-2.6-2.6V7.6A2.6 2.6 0 0 1 6 5z"/><path d="M12 13.6s-2.8-1.6-2.8-3.4a1.5 1.5 0 0 1 2.8-.8 1.5 1.5 0 0 1 2.8.8c0 1.8-2.8 3.4-2.8 3.4z"/>`,`<path fill-rule="evenodd" d="M6 5h12a2.6 2.6 0 0 1 2.6 2.6v7.2A2.6 2.6 0 0 1 18 17.4h-6.2L7.4 20.6v-3.2H6a2.6 2.6 0 0 1-2.6-2.6V7.6A2.6 2.6 0 0 1 6 5zm6 8.6s2.8-1.6 2.8-3.4a1.5 1.5 0 0 0-2.8-.8 1.5 1.5 0 0 0-2.8.8c0 1.8 2.8 3.4 2.8 3.4z"/>`),
  core:UNI_SV(`<path d="M12 3.6l1.9 5.1 5.4.3-4.2 3.4 1.4 5.2L12 14.7l-4.5 2.9 1.4-5.2-4.2-3.4 5.4-.3z"/><path d="M19.4 16.6v3.2M17.8 18.2H21M4.6 17.2v2.4M3.4 18.4h2.4"/>`,`<path d="M12 3.6l1.9 5.1 5.4.3-4.2 3.4 1.4 5.2L12 14.7l-4.5 2.9 1.4-5.2-4.2-3.4 5.4-.3z"/><path d="M19.4 16.6v3.2M17.8 18.2H21M4.6 17.2v2.4M3.4 18.4h2.4" fill="none"/>`),
  shop:UNI_SV(`<path d="M5.6 8.4h12.8l-1.1 11.2a1.6 1.6 0 0 1-1.6 1.4H8.3a1.6 1.6 0 0 1-1.6-1.4z"/><path d="M9 10.6V7.6a3 3 0 0 1 6 0v3"/>`,`<path d="M5.6 8.4h12.8l-1.1 11.2a1.6 1.6 0 0 1-1.6 1.4H8.3a1.6 1.6 0 0 1-1.6-1.4z"/><path d="M9 8.4V7.6a3 3 0 0 1 6 0v.8" fill="none"/>`),
  me:UNI_SV(`<circle cx="12" cy="8.4" r="3.6"/><path d="M4.8 20c.8-3.8 3.6-5.6 7.2-5.6s6.4 1.8 7.2 5.6"/>`,`<circle cx="12" cy="8.4" r="3.6"/><path d="M4.8 20c.8-3.8 3.6-5.6 7.2-5.6s6.4 1.8 7.2 5.6z"/>`)};
function uniNav(a){ return navBar([["home","LOVE",UNI_IC.home],["whisper",WHISPER_NAME,UNI_IC.whisper],["core","FEST",UNI_IC.core],["shop","SHOP",UNI_IC.shop],["me","ME",UNI_IC.me]],a,{whisper:fanWhisperUnread()?"moon":0}); }
/* 頁首：返回＋置中標題 */
const uniHead=(title,right="")=>`<header class="top uni-top"><div class="top-row"><button class="icon-btn" data-a="back" aria-label="返回">${I.back}</button><div class="top-title">${title}</div>${right||'<span class="sh-sp"></span>'}</div></header>`;
/* FEST：活動（粉絲）／我的舞台（藝人）／管理（管理員），三段切換 */

/* 小圖示 */
const UI_S={pen:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>`,
  mega:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4a1.5 1.5 0 0 0 1.5 1.5H7l6 4V4.5l-6 4H5.5A1.5 1.5 0 0 0 4 10z"/><path d="M17 9a4 4 0 0 1 0 6"/></svg>`,
  flag:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4.5h11.5l-2 4 2 4H5"/></svg>`,
  chev:`<svg class="uni-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>`};
const uniAv=(mid,cls="")=>{ const m=MEMBERS[mid]; return `<span class="uni-av ${cls}" style="background:${grad(m.g)}">${mAvIn(mid)}</span>`; };
/* ---------- 每一頁加上的入口 ---------- */

/* 把入口放進粉絲頁 */

/* ---------- 發公告：獨立的「HAECHU官方」表單＋發布前再確認 ---------- */
function uniAnnOpen(){ const d=ui.annDraft||(ui.annDraft={to:"all",title:"",body:""});
  setLayer(`<div class="scrim" data-a="tCloseLayer"><div class="sheet ann-sh" role="dialog" aria-label="發公告"><div class="grab"></div>
    <div class="ann-who">${UI_S.mega}<b>HAECHU官方</b><small>這則會用官方名義發布</small></div>
    <span class="fld-lab">發給誰</span><div class="chips wrap"><button class="chip ${d.to==="all"?"on":""}" data-a="uniAnnTo" data-v="all">全部粉絲</button>${GROUPS.map(g=>`<button class="chip ${d.to===g.id?"on":""}" data-a="uniAnnTo" data-v="${g.id}">${esc(g.name)}</button>`).join("")}</div>
    ${d.to!=="all"?`<span class="fld-lab">標題</span><label class="field"><input id="annTi" placeholder="輸入文字" value="${esc(d.title)}"></label>`:""}
    <span class="fld-lab">內容</span><label class="field ann-ta"><textarea id="annBo" maxlength="${d.to==="all"?200:1000}" rows="4" placeholder="輸入文字">${esc(d.body)}</textarea></label>
    <button class="btn btn-block ann-go" data-a="uniAnnGo">以HAECHU官方發布</button>
    <button class="ann-mg" data-a="uniGo" data-v="#/admin?tab=announce">管理已發布的公告 ›</button></div></div>`,"ann"); }
const uniAnnKeep=()=>{ const d=ui.annDraft; if(!d) return; const ti=document.getElementById("annTi"), bo=document.getElementById("annBo"); if(ti) d.title=ti.value; if(bo) d.body=bo.value; };

/* ---------- 積分統計（每位藝人：收到、扣除、實得；粉絲端買的、藝人端的都算） ---------- */
const PT_T={tour:"世巡門票",tie:WHISPER_NAME+" 券",membership:"Membership",merch:"周邊",gacha:"抽卡",theme:"主題"};
function ptSince(){ const p=ui.ptP||"30"; return p==="all"?0:Date.now()-(+p)*864e5; }
function ptPeriodChips(){ const p=ui.ptP||"30"; return `<div class="seg2 pt-seg" style="--i:${["7","30","all"].indexOf(p)}"><i class="seg2-ind"></i>${[["7","7 天"],["30","30 天"],["all","全部"]].map(([k,l])=>`<button class="${p===k?"on":""}" data-a="ptP" data-v="${k}">${l}</button>`).join("")}</div>`; }
function pointsOf(mid,since){ const R=revenueOf(since), got=Math.round(R.byMember[mid]||0), sh=revShare(), fine=artFines(mid,since); return {got,cut:got-Math.round(got*sh/100),fine,net:Math.max(0,Math.round(got*sh/100)+fine)}; }
function viewPointsAdmin(){ const since=ptSince(), sh=revShare();
  const groups=GROUPS.map(g=>({g,ms:groupArtists(g.id)})).filter(x=>x.ms.length);
  const tot=groups.reduce((a,{ms})=>{ ms.forEach(id=>{ const p=pointsOf(id,since); a.got+=p.got; a.cut+=p.cut; a.net+=p.net; }); return a; },{got:0,cut:0,net:0});
  return `<main class="page pt">${ptPeriodChips()}
    <section class="card pt-sum"><div><span>藝人收到</span><b>${fmt(tot.got)}</b></div><div><span>扣除</span><b class="neg">−${fmt(tot.cut)}</b></div><div><span>實得</span><b class="pos">${fmt(tot.net)}</b></div></section>
    <button class="uni-row" data-a="ptShare"><span>藝人分得比例</span><small>${sh}%</small>${UI_S.chev}</button>
    ${groups.map(({g,ms})=>`<div class="section-h"><span class="rev-dot" style="background:${grad(g.g)}"></span>${esc(g.name)}</div><section class="card pt-list">${ms.map(id=>{ const p=pointsOf(id,since); return `<button class="pt-r" data-a="uniGo" data-v="#/artist?tab=points&id=${id}">${uniAv(id,"sm")}<b>${esc(artName(id,"feed"))}</b><span><small>收到 ${fmt(p.got)}・扣除 ${fmt(p.cut)}</small><em>${fmt(p.net)}</em></span></button>`; }).join("")}</section>`).join("")}
  </main>`; }
function viewPointsOne(mid){ const since=ptSince(), p=pointsOf(mid,since), m=MEMBERS[mid], sh=revShare(), ids=new Set([m.group]);
  const L=S.get(K.sales,[]).filter(x=>x.ts>=since&&((x.type==="tie"&&x.mid===mid)||(x.type!=="tie"&&x.gid&&ids.has(x.gid)))).slice(0,40);
  const share=x=>x.type==="tie"?x.pts:x.pts/Math.max(1,groupArtists(x.gid).length);
  /* 不是賣東西來的：粉絲身分賺的／花的、併進來的粉絲積分、罰款、藝人自己送餐車… 也要看得到 */
  const G=ptGrants().filter(g=>g.mid===mid&&(String(g.id).startsWith("tqf2_")||g.art)&&(!since||g.ts>=since)), gp=G.reduce((s,g)=>s+Math.max(0,g.n||0),0), gm=G.reduce((s,g)=>s+Math.max(0,-(g.n||0)),0);
  const gT=g=>/^uf/.test(g.id)?"粉絲":/^tka_/.test(g.id)?"餐車":/^tqf2_/.test(g.id)?"罰款":"調整";
  const rows=[...L.map(x=>({ts:x.ts,h:`<div class="pt-d"><span class="rev-t t-${x.type}">${PT_T[x.type]||x.type}</span><p>${esc(saleLbl(x))}<small>${ago(x.ts)}</small></p><b>+${fmt(Math.round(share(x)))}</b></div>`})),
    ...G.map(g=>({ts:g.ts,h:`<div class="pt-d"><span class="rev-t t-grant">${gT(g)}</span><p>${esc(g.why||"")}<small>${ago(g.ts)}</small></p><b class="${g.n<0?"neg":""}">${g.n<0?"−":"+"}${fmt(Math.abs(g.n||0))}</b></div>`}))].sort((a,b)=>b.ts-a.ts).slice(0,60);
  return `<main class="page pt">${ptPeriodChips()}
    <section class="card pt-sum"><div><span>收到</span><b>${fmt(p.got+gp)}</b></div><div><span>扣除</span><b class="neg">−${fmt(p.cut+gm)}</b></div><div><span>實得</span><b class="pos">${fmt(p.net)}</b></div></section>
    <p class="pt-rule">${WHISPER_NAME} 券全部算給這位藝人；Membership、周邊、主題等算給整個團，再平均分給團裡的藝人。實得是收到的 ${sh}%。</p>
    <div class="section-h">明細<span class="muted">${rows.length} 筆</span></div>
    ${rows.length?`<section class="card pt-list">${rows.map(r=>r.h).join("")}</section>`:`<p class="me-none">這段時間還沒有積分</p>`}
  </main>`; }
/* 還沒有任何團：要團才能做的設定，先帶去新增團 */
const NOG_HTML=()=>`<div class="t-empty"><span class="t-empty-ico">${I.user}</span><p>還沒有藝人</p><button class="t-pill" data-a="uniGo" data-v="#/admin?tab=roster&p=new">新增藝人</button></div>`;
/* 帳號：所有帳號都由管理員建立；忘記密碼也由管理員重設 */
const ROLE_ZH={admin:"管理員",artist:"藝人",fan:"粉絲"};
function viewAccounts(){ hbProfilesNow(); const L=Object.entries(ACCOUNTS).sort((a,b)=>(a[1].role==="admin"?0:a[1].role==="artist"?1:2)-(b[1].role==="admin"?0:b[1].role==="artist"?1:2)||acctUser(a[0]).localeCompare(acctUser(b[0])));
  return `<main class="page roster">
    <section class="card studio"><h3>建立帳號</h3>
      <span class="fld-lab">帳號</span><label class="field">${I.user}<input id="acUser" maxlength="20" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="輸入文字" value="${esc((ui.acDraft||{}).un||"")}"></label>
      <span class="fld-lab">本名（只有管理員看得到）</span><label class="field">${I.user}<input id="acReal" maxlength="20" placeholder="輸入文字" value="${esc((ui.acDraft||{}).rn||"")}"></label>
      <span class="fld-lab">暱稱（大家看到的名字，本人之後可以改）</span><label class="field">${I.heart}<input id="acName" maxlength="20" placeholder="輸入文字" value="${esc((ui.acDraft||{}).nm||"")}"></label>
      <span class="fld-lab">密碼</span><label class="field">${I.lock}<input id="acPw" maxlength="40" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="輸入文字" value="${esc((ui.acDraft||{}).pw||"")}"></label>
      <button class="btn btn-main btn-block" data-a="acCreate" ${ui.acBusy?"disabled":""}>${ui.acBusy?"建立中…":"建立帳號"}</button></section>
    <div class="section-h">全部帳號<span class="muted">${L.length} 個</span>${calPick("ac")}</div>
    <section class="card ac-list">${(()=>{ const L2=calFilter("ac",L,([k,a])=>a.cts||0); return L2.length?"":`<p class="me-none">${calF("ac")?"這天沒有新增帳號":""}</p>`; })()}${calFilter("ac",L,([k,a])=>a.cts||0).slice(0,calMore("ac")).map(([k,a])=>`<div class="rs-m ac-row" data-a="acEdit" data-v="${esc(k)}" role="button"><span class="av sm" style="background:${grad(a.role==="admin"?1:a.role==="artist"?0:3)}">${esc([...(a.name||k)][0]||"?")}</span><span class="ac-nm"><b>${esc(realName(k)||a.name||k)}</b><small>${esc(acctUser(k))}・${esc(a.name||"")}・${ROLE_ZH[a.role]||"粉絲"}</small></span><span class="ac-go">${UI_S.chev}</span></div>`).join("")}${calMoreBtn("ac",calFilter("ac",L,([k,a])=>a.cts||0).length)}</section>
  </main>`; }
async function acCall(body){ body={...body}; if(body.username) body.username=normAcct(body.username); if(body.password) body.password=normPw(body.password); if(!HB_ON) return {ok:true,local:true};
  try{ return await hbFetch("/functions/v1/admin-users",{method:"POST",body}); }
  catch(e){ const c=String(e.message||""); return {error:e.net?"後台的 admin-users 小程式沒有回應（還沒部署，或名稱不對）":c==="exists"?"這個帳號已經有人用了":c==="not_admin"?"只有管理員能做這件事":e.status===404?"後台還沒設定好（admin-users）":c==="bad_username"?"帳號不能有空白、@、/，最多 20 個字":c==="short_password"?"密碼至少要 4 個字":/database error/i.test(c)?"後台擋住了（請跑第五段 SQL）":"沒有成功："+c.slice(0,60)}; } }
/* 管理員還沒有藝人身分：把自己加進團之後，這裡就是自己的藝人端 */
function viewNoArtist(){ return `<main class="page"><div class="t-empty"><span class="t-empty-ico">${I.user}</span><p>還沒有藝人身分</p><button class="t-pill" data-a="uniGo" data-v="#/admin?tab=roster">到藝人與團</button></div></main>`; }
/* 示範工具 */

function viewShopAdmin(){ const n=getThemes().filter(t=>t.status==="pending").length; return `<main class="page"><section class="card">
    <button class="list-btn" data-a="uniGo" data-v="#/admin?tab=albums">${I.shop}專輯與店家<span class="r">${getStores().length} 家店</span></button>
    <button class="list-btn" data-a="uniGo" data-v="#/admin/themes">${I.star}主題（${TH_STORE}）<span class="r">${n?`<em class="t-cnt">${n}</em>`:""}</span></button></section>
    <div class="section-h">積分</div><section class="card"><button class="list-btn" data-a="uniGo" data-v="#/admin?tab=revenue">${AIC.chart}積分統計</button></section></main>`; }

/* 管理員清單的圖示：每一項長得不一樣，一眼分得出來 */
const AIC=(()=>{ const sv=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  return { acct:sv('<circle cx="12" cy="8" r="3.6"/><path d="M5 20c1.2-3.6 4-5.4 7-5.4s5.8 1.8 7 5.4"/>'), debut:sv('<path d="M12 3l2.3 5 5.4.5-4.1 3.6 1.2 5.3L12 14.7 7.2 17.4l1.2-5.3L4.3 8.5 9.7 8z"/>'),
    group:sv('<circle cx="9" cy="8.5" r="3"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M3.5 19c.9-3 3-4.5 5.5-4.5s4.6 1.5 5.5 4.5M14.5 14.8c2.6-.3 4.8 1 5.8 4.2"/>'), plus:sv('<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>'),
    chart:sv('<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>'), globe:sv('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.6 2.6 14.4 0 17M12 3.5c-2.6 2.6-2.6 14.4 0 17"/>'),
    shield:sv('<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>'), scout:sv('<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>'),
    cloud:sv('<path d="M7 18.5h10a4 4 0 0 0 .6-8 6 6 0 0 0-11.4 1.6A3.3 3.3 0 0 0 7 18.5z"/>'), wrench:sv('<path d="M14.5 5.5a4.5 4.5 0 0 0 5 6l-8.8 8.8a2.1 2.1 0 0 1-3-3l8.8-8.8a4.5 4.5 0 0 0-2-3z"/>'),
    palette:sv('<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 1.8-.9 1.5-1.9-.4-1.3.4-2.4 1.8-2.4h1.6a3.6 3.6 0 0 0 3.6-3.6c0-5-3.8-9.1-8.5-9.1z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="7.6" r="1"/><circle cx="16" cy="10" r="1"/>'),
    replay:sv('<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.3h4.3"/>'), theme:sv('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 9h16M9 9v11"/>'), toggle:sv('<rect x="3" y="7" width="18" height="10" rx="5"/><circle cx="16" cy="12" r="3"/>'),
    ai:sv('<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9.5 16h5"/>'), money:sv('<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2c-.6-.8-1.6-1.2-2.8-1.2-1.6 0-2.8.8-2.8 2s1.1 1.7 2.8 2 2.8.8 2.8 2-1.2 2-2.8 2c-1.2 0-2.2-.4-2.8-1.2M12 6.5v11"/>'),
    sns:sv('<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r=".8"/>') }; })();
/* =========================================================
   藝人端：自己換背景和頭貼、生日當天的全螢幕慶祝、TIE 的「⋯」選單
   新手教學：第一次登入／註冊看歡迎頁；之後每個分頁第一次打開，都會一個一個介紹這頁的功能
   ========================================================= */
/* 換圖片時先用手機上的那張馬上顯示，上傳到雲端好了再換成雲端網址（看起來是立刻換好） */
const PREV={}, GPREV={};
const artProf=mid=>{ const p=(S.get(K.artProf,{})[mid])||{}; return PREV[mid]?{...p,...PREV[mid]}:p; };
const gPhotoMap=()=>({...(S.get(K.gPhoto,{})||{}),...GPREV});
/* 成員的 Teaser 照（管理員在「藝人與團」放）：About 用。SOLO 用出道／回歸照；社群頭貼只在個人社群裡出現 */
const MPREV={};
function mPhoto(mid){ const m=MEMBERS[mid]; if(!m) return ""; const g=groupOf(m.group); if(g&&g.solo) return gPhoto(g.id); return MPREV[mid]||(S.get(K.mPhoto,{})||{})[mid]||""; }
const teaserIn=mid=>{ const u=mPhoto(mid), m=MEMBERS[mid]; return u?`<span class="av-img av-bgi" role="img" aria-label="${esc(m?m.name:"")}" style="background-image:url('${u}')"></span>`:esc(ini(m?m.name:"")); };
/* 上傳完、雲端那張也載入好了，才換掉預覽（不會閃一下） */
function imgSwap(url,done){ if(!url||url.startsWith("data:")){ done(); return; } const im=new Image(); let ok=false; const fin=()=>{ if(ok) return; ok=true; done(); }; im.onload=fin; im.onerror=fin; setTimeout(fin,15000); im.src=url; }
/* 名稱：動態、直播、TIE 聊天室各自一個，沒改過就是藝名（MEMBERS 的名字，只有管理員能改） */
/* 每個團社群的 Media 分頁名稱：只有這一團的藝人能改 */
const mediaName=gid=>"MEET・Media";   // 固定名稱，不能改（直播在 App 裡叫 MEET）
const ART_NK={feed:"名稱",live:"名稱",tie:"TIE 聊天室名稱"};
/* 名稱：TIE 聊天室自己一個；動態、直播等其他地方共用一個（連動）。沒改過就是藝名 */
const artNKey=k=>k==="tie"?"n_tie":"n_feed";
/* 藝名（管理員設定的那個，例如韓文藝名）：出道、打歌、結尾妖精、公司、人事這些正式場合都用這個，不用本人改的社群名 */
const stageNm=mid=>{ try{ const k=String(((typeof wkPage==="function"&&wkPage("m:"+mid).f)||{}).kname||"").split("\n")[0].trim(); if(k) return k; }catch(e){} return (MEMBERS[mid]||{}).name||""; };   /* SKpedia 填了韓文藝名就用韓文，沒填才用英文 */
function artName(mid,k){ const m=MEMBERS[mid]; if(!m) return ""; if(adminView()) return m.name; return artProf(mid)[artNKey(k)]||m.name; }
/* 管理員端（管理那一段）看到的都是管理員在後台設的原本名字，不管本人怎麼改 */
const adminView=()=>{ try{ return route().role==="admin"&&!!session()&&session().role==="admin"; }catch(e){ return false; } };
function origName(by,fallback){ const e=String(by||"").toLowerCase(); const a=e&&ACCOUNTS[e]; return realName(e)||(a&&a.name)||fallback||"粉絲"; }
const liveNick=by=>{ try{ return by?((S.get(K.nicks,{})||{})[String(by).toLowerCase()]||""):""; }catch(e){ return ""; } };
const shownName=o=>adminView()&&o&&o.by?origName(o.by,o.name):(o&&o.by&&liveNick(o.by))||(o&&o.name)||"粉絲";
function setArtProf(mid,patch){ const all=S.get(K.artProf,{}); all[mid]={...(all[mid]||{}),...patch}; Object.keys(all[mid]).forEach(k=>{ if(!all[mid][k]) delete all[mid][k]; }); try{ S.set(K.artProf,all); return true; }catch(e){ toast("圖片太大，存不下來"); return false; } }
/* 頭貼照片裁成正方形（取中間），圓形頭貼才不會變形 */
async function squareImg(blob,max){ try{ const u=URL.createObjectURL(blob), im=await new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=u; });
  const s0=Math.min(im.naturalWidth,im.naturalHeight), sz=Math.min(max,s0), c=document.createElement("canvas"); c.width=c.height=sz;
  c.getContext("2d").drawImage(im,(im.naturalWidth-s0)/2,(im.naturalHeight-s0)/2,s0,s0,0,0,sz,sz); URL.revokeObjectURL(u);
  return await new Promise(res=>c.toBlob(b=>res(b||blob),"image/jpeg",.88)); }catch(e){ return blob; } }
/* 頭貼：有上傳就用照片，沒有就用名字第一個字 */
/* 藝人的頭貼、背景、簡介分兩組（跟名稱一樣各管各的）：
   ・TIE：在 TIE 的「⋯」抽屜裡改，只換 TIE（聊天室、TIE 列表、粉絲點頭貼看到的檔案、買 TIE 券的畫面）
   ・LOVE：在藝人首頁「編輯個人檔案」改，換動態、直播、社群這些地方
   ・TIE 還沒自己設定時，先用 LOVE 的；SNS 有自己的「編輯個人檔案」 */
const tieProf=mid=>{ const p=artProf(mid); return {avatar:p.av_tie||p.avatar||"",cover:p.cover_tie||p.cover||"",bio:p.bio_tie!=null?p.bio_tie:(p.bio||"")}; };
/* 名字第一個字（花體字也轉回一般字，不會變成「?」） */
const ini=x=>([...String(x||"").normalize("NFKC").trim()][0]||"").toUpperCase();
const mAvIn=(mid,pl)=>{ const m=MEMBERS[mid], u=pl==="tie"?tieProf(mid).avatar:(artProf(mid).avatar||mPhoto(mid)); /* 個人社群頭貼沒換過：用 Teaser 照 */ return u?`<span class="av-img av-bgi" role="img" aria-label="頭貼" style="background-image:url('${u}')"></span>`:(m?"H":""); };
const midOf=m=>Object.keys(MEMBERS).find(k=>MEMBERS[k]===m);
/* 團體照：團體用管理員上傳的出道照／團體照；SOLOIST 直接用本人的頭貼 */
const soloMid=gid=>Object.keys(MEMBERS).find(k=>MEMBERS[k].group===gid&&!MEMBERS[k].official);
/* 社群照片：團體用管理員上傳的出道／回歸照；SOLOIST 用本人的頭貼（規則：SOLOIST 不用管理員上傳） */
function gPhoto(gid){ const g=groupOf(gid); if(!g) return ""; return gPhotoMap()[gid]||""; }   // SOLO 也用管理員放的出道照；社群頭貼只在個人社群裡出現
/* TIE 券上的照片：管理員上傳的出道／回歸照（團體、SOLOIST 都可以傳），沒有就用社群照片 */
const tktPhoto=gid=>gPhotoMap()[gid]||gPhoto(gid);
const gIcoIn=g=>{ const u=gPhoto(g.id); return u?`<span class="g-ph" role="img" aria-label="${esc(g.name)}" style="background-image:url('${u}')"></span>`:esc(ini(g.name)); };
/* 社群的介紹：只用管理員寫的團體介紹（藝人個人簡介不放社群） */
function gIntro(gid){ const g=groupOf(gid); if(!g) return ""; return g.intro||""; }
/* 「NEW」標示：團建立後 3 天內才有，之後自動拿掉（各端一起） */
const gNew=g=>{ if(!g||!g.isNew) return false; const t=+String(g.id).replace(/^g/,""); if(!(t>1.5e12)) return false; const d=new Date(t), end=new Date(d.getFullYear(),d.getMonth(),d.getDate()+3).getTime(); return Date.now()<end; };   // 出道當天＋2 天，第 3 天午夜撤下

/* ===== 藝人個人頁：藝人首頁和粉絲看到的同一個版面（照 Weverse） ===== */
function artMedia(posts){ const out=[]; posts.forEach(p=>{ (p.media||[]).forEach(x=>out.push({id:p.id,mid:x.kind==="video"?x.thumb||"":x.mid})); if(!p.media&&p.color!=null) out.push({id:p.id,c:p.color}); }); return out; }
function artCmList(mid){ const ps=new Set(getPosts().filter(p=>p.member===mid).map(p=>p.id));
  const L=[]; S.get(K.comments,[]).forEach(c=>{ const own=ps.has(c.postId);
    if(own&&c.reply) L.push({fan:c,text:c.reply.text,ts:c.reply.ts,postId:c.postId,cid:c.id,id:c.id+"_r"});
    (c.reps||[]).forEach(r=>{ if(r.author==="artist"&&(own||r.member===mid)) L.push({fan:c,text:r.text,ts:r.ts,postId:c.postId,cid:c.id,id:r.id}); });
    if(c.author==="artist"&&c.member===mid&&!own) L.push({fan:null,text:c.text,ts:c.ts,postId:c.postId,cid:c.id,id:c.id}); });   /* 團體：在其他團員貼文底下的留言也算 */
  return L; }
const ymdhm=ts=>{ const d=new Date(ts), z=n=>String(n).padStart(2,"0"); return `${z(d.getMonth()+1)}. ${z(d.getDate())}. ${z(d.getHours())}:${z(d.getMinutes())}`; };
function artProfileHtml(mid,own){ const M=MEMBERS[mid], p=artProf(mid), tab=["cm","media"].includes(ui.mpTab)?ui.mpTab:"post", old=!!ui.mpOld, b=getBdays()[mid]||M.bday, fo=(S.get(K.mFollow,{}))[mid], nm=artName(mid,"feed");
  let posts=getPosts().filter(x=>x.member===mid&&(own||!x.hidden)); const med=artMedia(posts); if(old) posts=[...posts].reverse();
  let cms=artCmList(mid).sort((a,b)=>b.ts-a.ts); if(old) cms.reverse();
  const evs=getEvents().filter(e=>e.member===mid);
  const body=tab==="cm"?(cms.length?cms.map(x=>`<button class="card ap2-cmc" data-a="openPost" data-id="${x.postId}" data-c="${x.cid||""}"><span class="ap2-cl"></span>${x.fan?`<span class="ap2-cq"><b>${esc(shownName(x.fan))}${x.fan.author==="artist"?`<span class="ap2-vf">${I.verified}</span>`:""}</b><em>${esc(x.fan.text)}</em></span>`:""}<span class="ap2-ch"><b>${esc(nm)}</b><span class="ap2-vf">${I.verified}</span><small>${ymdhm(x.ts)}</small></span>${trPlain("ac:"+(x.id||x.postId+":"+x.ts),x.text,"ap2-ct")}</button>`).join(""):`<div class="ux-empty"><span>💬</span><b>還沒有留言</b></div>`):false?(cms.length?cms.map(x=>`<button class="card ap2-cm" data-a="comments" data-id="${x.postId}">${x.fan?`<span class="ap2-cq"><b>${esc(x.fan.name)}</b>${trPlain("acq:"+(x.id||x.postId+":"+x.ts),x.fan.text,"")}</span>`:""}<span class="ap2-ch"><span class="ap2-cav" style="background:${grad(M.g)}">${mAvIn(mid)}</span><b>${esc(nm)}</b><span class="ap2-vf">${I.verified}</span><small>${ymdhm(x.ts)}</small></span>${trPlain("ac:"+(x.id||x.postId+":"+x.ts),x.text,"ap2-ct")}</button>`).join(""):`<p class="me-none">還沒有留言</p>`)
    :tab==="media"?(()=>{ const lv=meetOf(l=>l.member===mid), vs=vsecHtml(M.group,own); return (lv.length?`<div class="cm-sh"><h3>MEET</h3></div>${meetCards(lv)}`:"")+vs||`<p class="me-none">還沒有直播或影片</p>`; })()
    :tab==="party"?(evs.length?evs.map(e=>eventCard(e,{artist:own})).join(""):`<p class="me-none">還沒有 Party</p>`)
    :(posts.length?posts.map(x=>postCard(x,{mine:own,prof:true})).join(""):`<p class="me-none">還沒有貼文</p>`);   // 個人社群：點貼文任何地方進貼文、頭貼不再重進個人社群
  return `<header class="ap2-bar" id="apBar" style="--apbg:${p.cover?`url('${p.cover}')`:grad(M.g)}">${own?`<span class="ap2-bsp"></span>`:`<button class="ap2-ib" data-a="back" aria-label="返回">${I.back}</button>`}<span class="ap2-bt"><span class="ap2-bav" style="background:${grad(M.g)}">${mAvIn(mid)}</span><b>${esc(nm)}</b><span class="ap2-vf">${I.verified}</span></span><span class="ap2-bsp"></span></header>
  <section class="ap2-hero" id="apHero" style="${p.cover?`background-image:url('${p.cover}')`:`background:${grad(M.g)}`}"><span class="ap2-shade"></span>
    ${own?"":`<button class="ap2-ib ap2-back" data-a="back" aria-label="返回">${I.back}</button>`}
    ${own?`<button class="ap2-pen" data-a="artCoverEd" aria-label="更換背景">${UI_S.pen}</button><button class="ap2-ib ap2-bell" data-a="artNotifs" aria-label="通知">${I.bell}${artNUnread(mid)?'<span class="dot"></span>':""}</button>`:""}
    <div class="ap2-c">${own?`<button class="ap2-av" data-a="artAvEd" aria-label="更換頭貼" style="background:${grad(M.g)}">${mAvIn(mid)}<i>${I.camera}</i></button>`:`<span class="ap2-av" style="background:${grad(M.g)}">${mAvIn(mid)}</span>`}
      ${b?`<small class="ap2-bd">🎂 ${esc(String(b).replace("-","月"))}日</small>`:""}
      <h2 class="ap2-n">${esc(nm)}<span class="ap2-vf">${I.verified}</span></h2>
      ${own?`<button class="ap2-fo" data-a="artProfEdit">編輯個人檔案</button>`:`<button class="ap2-fo ${fo?"on":""}" data-a="mFollow" data-v="${mid}">${fo?"✓ 正在追蹤":"＋ 追蹤"}</button>`}</div></section>
  <nav class="ap2-tabs">${[["post","貼文"],["cm","留言"],["media",mediaName(M.group)]].map(([k,l])=>`<button class="${tab===k?"on":""}" data-a="mpTab" data-v="${k}">${l}</button>`).join("")}</nav>
  <main class="page ap2-body">${tab!=="media"?`<button class="ap2-sort" data-a="mpSort">${old?"按舊到新排序":"按新到舊排序"}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>`:""}${body}</main>`; }
function apBarSync(){ const b=document.getElementById("apBar"), h=document.getElementById("apHero"); if(!b||!h) return; const bb=parseFloat(getComputedStyle(b).top)||0, d=h.getBoundingClientRect().bottom-(bb+b.offsetHeight);
  b.classList.toggle("on",d<=1);   /* 背景照片整個滑到標題列下面才換成小標題列（以前提早 90px，名字和「編輯個人檔案」會從底下透出來） */
  const c=h.querySelector(".ap2-c"); if(c){ const o=Math.max(0,Math.min(1,(d-10)/140)); c.style.opacity=o<1?o.toFixed(3):""; c.style.pointerEvents=o<.3?"none":""; } }
/* 滑動中每一格畫面都檢查（iPhone 快速滑時 scroll 事件來得慢，照片會先透出來一下）；提早一點點出現 */
let apRaf=0, apLast=0; function apLoop(){ apBarSync(); apRaf=performance.now()-apLast<700?requestAnimationFrame(apLoop):0; }
const apKick=()=>{ apLast=performance.now(); if(!apRaf&&document.getElementById("apBar")) apRaf=requestAnimationFrame(apLoop); };
addEventListener("scroll",apKick,{passive:true}); addEventListener("touchmove",apKick,{passive:true}); addEventListener("touchstart",apKick,{passive:true});
/* 生日當天：打開 App 時全螢幕慶祝（一年一次） */
function artBdayCheck(mid){ if(!mid||layer.innerHTML||document.getElementById("coach")) return; if(bdayLeft(mid)!==0) return;
  const k=(session()||{}).email+"|"+wishKey(mid), seen=S.get(K.artBday,{}); if(seen[k]) return; seen[k]=Date.now(); S.set(K.artBday,seen);
  const m=MEMBERS[mid], w=S.get(K.bdayWish,{})[wishKey(mid)]||{n:0};
  const hearts=Array.from({length:16},(_,i)=>`<i style="--x:${(i*41)%100}%;--d:${(i%6)*.5}s;--c:${["#F9A8D4","#C7AEFF","#93C5FD","#FDE68A","#86EFAC","#FCA5A5"][i%6]}"></i>`).join("");
  setLayer(`<div class="cele bdc" data-a="celeClose" role="dialog" aria-label="生日快樂"><div class="cele-h">${hearts}</div>
    <div class="cele-t"><b class="cele-hp">🎂 HAPPY BIRTHDAY 🎂</b><em class="cele-br">${esc(artName(mid,"feed"))}</em></div>
    <div class="bdc-av" style="background:${grad(m.g)}">${mAvIn(mid)}</div>
    <p class="bdc-n">已經有 <b>${fmt(w.n)}</b> 位粉絲送上祝福</p></div>`,"cele");
  clearTimeout(ui.celeT); ui.celeT=setTimeout(()=>{ const c=layer.querySelector(".cele"); if(c) layer.innerHTML=""; },6500); }
/* TIE 的「⋯」：藝人自己的聊天室選單 */
function openTieArtDrawer(mid,still){ const m=MEMBERS[mid], p=tieProf(mid); ui.tieDrw=mid;
  setLayer(`<div class="t-drawer-w" data-a="tCloseLayer"><aside class="t-drawer ad-dw" role="dialog" aria-label="聊天室選單">
    <div class="ad-b">
      <div class="ad-cover" style="${p.cover?`background-image:url('${p.cover}')`:`background:${grad(m.g)}`}"><button class="ad-pen" data-a="artCoverEd" data-v="tie" aria-label="更換背景">${UI_S.pen}</button></div>
      <button class="ad-av" data-a="artAvEd" data-v="tie" style="background:${grad(m.g)}" aria-label="更換頭貼">${mAvIn(mid,"tie")}<i>${I.camera}</i></button>
      <div class="ad-name">${artBadge(mid)}<b>${esc(artName(mid,"tie"))}</b></div>
      <div class="ad-list">
        <button class="ad-row" data-a="artNameEd" data-v="tie">${TI.tag}<span>TIE 聊天室名稱</span><em>${esc(artName(mid,"tie"))}</em><i>›</i></button>
        <button class="ad-row" data-a="artAvEd" data-v="tie">${I.camera}<span>頭貼</span><i>›</i></button>
        <button class="ad-row" data-a="artBioEd" data-v="tie">${TI.star}<span>個人簡介</span><em>${esc(p.bio||"還沒寫")}</em><i>›</i></button>
        <button class="ad-row" data-a="aTieBg">${TI.star}<span>聊天室背景</span><i>›</i></button>
        <button class="ad-row" data-a="tWelcome">${TI.bell}<span>TIE歡迎語</span><i>›</i></button>
        <button class="ad-row" data-a="artColorEd">${TI.star}<span>我的顏色</span><em><i class="ac-dot" style="background:${artColor(mid)}"></i>${ART_COLORS.find(x=>x[0]===artColor(mid))[1]}</em><i>›</i></button>
      </div></div></aside></div>`,"drawer");
  if(still){ const d=layer.querySelector(".t-drawer-w"); if(d){ d.style.transition="none"; d.querySelectorAll("*").forEach(x=>x.style.transition="none"); d.classList.add("open"); requestAnimationFrame(()=>{ d.style.transition=""; d.querySelectorAll("*").forEach(x=>x.style.transition=""); }); } return; }   /* 換完頭貼／背景：抽屜留在原地，直接看到新的 */
  requestAnimationFrame(()=>{ const d=layer.querySelector(".t-drawer-w"); if(d) d.classList.add("open"); }); }
/* 粉絲點 TIE 抽屜裡的藝人：看藝人自己設定的頭貼、背景、簡介 */
function openArtistProfile(mid){ const m=MEMBERS[mid], p=tieProf(mid), g=groupOf(m.group);
  setLayer(`<div class="apf" role="dialog" aria-label="${esc(m.name)}" style="${p.cover?`background:#000 url('${p.cover}') center/cover no-repeat`:`background:${grad(m.g)}`}"><button class="apf-x" data-a="apfClose" aria-label="關閉">${XI}</button>
    <div class="apf-av" style="background:${grad(m.g)}">${mAvIn(mid,"tie")}</div>
    <div class="apf-nm">${artBadge(mid)}<h2>${esc(artName(mid,"tie"))}</h2></div>
    <div class="apf-bio">${p.bio?esc(p.bio):""}</div>
    <div class="apf-pill">${g&&g.solo?esc(g.name):gTag(g)+esc(m.name)}</div></div>`,"apf"); }
/* 禁用字詞：粉絲的 TIE、留言、直播聊天都會擋 */
const BAN_DEF=["幹你","操你","靠北","雞掰","雞巴","婊子","賤人","去死","死全家","白痴","智障","fuck","shit","bitch","asshole"];
const bannedList=()=>S.get(K.banned,BAN_DEF);
function hasBanned(t){ const x=String(t||"").toLowerCase().replace(/\s+/g,""); return bannedList().some(w=>w&&x.includes(String(w).toLowerCase().replace(/\s+/g,""))); }
/* 歧視、仇恨字眼：不管管理員清單怎麼設都一律擋（含變形寫法） */
const SLUR_RE=[/n+[i1!l|y]+[gq6]+[gq6]*[e3a4@]*r+/,/n+[i1!l|y]+[gq6]+[gq6]+[a4@]+h*/,/f+[a4@]+[gq]+[gq]*[o0]+t/,/ch[i1]nk/,/k[i1]ke/,/retard/,/黑鬼/,/支那/,/死gay/];
function hasSlur(t){ const x=String(t||"").toLowerCase().replace(/[0-9]/g,c=>({"0":"o","1":"i","3":"e","4":"a","6":"g"})[c]||c).replace(/[^a-z\u4e00-\u9fff@!|]/g,""); return SLUR_RE.some(r=>r.test(x)); }
function nameBlock(t){ if(usedName(t)){ toast("這個名稱以前有人用過，不能再用，換一個吧"); return true; } if(!hasBanned(t)&&!hasSlur(t)) return false; toast("這個名稱不能用，換一個吧"); return true; }
/* 粉絲帳號轉成藝人帳號後，舊的帳號名、名稱記在後台，誰都不能再用（避免冒充） */
const nameKey=t=>String(t||"").normalize("NFKC").toLowerCase().replace(/[\s._\-·・]/g,"");
const usedName=t=>{ const k=nameKey(t); return !!k&&(S.get(K.usedNames,[])||[]).some(x=>nameKey(x.v)===k); };
function banBlock(t){ if(hasSlur(t)){ toast("訊息裡有禁用的字詞，沒辦法送出"); return true; } if(!hasBanned(t)) return false; toast("訊息裡有禁用的字詞，沒辦法送出"); return true; }
function viewBanned(){ return `<main class="page"><section class="card studio"><span class="fld-lab">禁用字詞（一行一個）</span><label class="field th-ta"><textarea id="banTa" rows="12" placeholder="輸入文字">${esc(bannedList().join("\n"))}</textarea></label><button class="btn btn-main btn-block" data-a="banSave">儲存</button></section></main>`; }

/* TIE：藝人回覆粉絲（粉絲端看不到是哪位粉絲寫的） */
const TI_REPLY='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>';
const tieRq=(r,me,noTr)=>`<div class="t-rp ${me?"me":""}"><small>${(session()||{}).role==="artist"?"你的回覆：":"ARTIST 的回覆："}</small><p>${esc(r.text)}</p>${r.tr&&!noTr?`<p class="t-rp-tr">${esc(r.tr)}</p>`:""}</div>`;
(()=>{ let sx=0,sy=0,el=null,dx=0,lock=0;
  document.addEventListener("touchstart",e=>{ const t=e.target.closest&&e.target.closest("[data-sw]"); el=t||null; if(!el) return; sx=e.touches[0].clientX; sy=e.touches[0].clientY; dx=0; lock=0; el.style.transition="none"; },{passive:true});
  document.addEventListener("touchmove",e=>{ if(!el) return; const x=e.touches[0].clientX-sx, y=e.touches[0].clientY-sy; if(!lock&&(Math.abs(x)>8||Math.abs(y)>8)) lock=Math.abs(x)>Math.abs(y)?1:2; if(lock!==1) return; dx=Math.max(-84,Math.min(0,x)); el.style.transform=`translateX(${dx}px)`; el.classList.toggle("sw-on",dx<-56); },{passive:true});
  const end=()=>{ if(!el) return; const id=el.dataset.sw, hit=dx<-56; el.style.transition="transform .28s cubic-bezier(.2,.8,.2,1)"; el.style.transform=""; el.classList.remove("sw-on"); el=null; dx=0;
    if(hit){ if(navigator.vibrate) navigator.vibrate(8); ui.tReply=id; render(); const i=document.getElementById("win"); if(i) i.focus(); } };
  document.addEventListener("touchend",end); document.addEventListener("touchcancel",end); })();

/* ===== 忘記密碼：文字在卡片正中間（毛玻璃），吉祥物和 emoji 在後面當背景掉下來，可以拖著玩 ===== */
function openForgot(){
  setLayer(`<div class="fg-w" data-a="fgClose"><div class="fg-d" role="dialog" aria-labelledby="fgT">
    <div class="fg-box" id="fgBox"><span class="fg-blob a"></span><span class="fg-blob b"></span><span class="fg-blob c"></span></div>
    <div class="fg-card" data-a="fgNoop"><span class="fg-fl" aria-hidden="true">${["🎀","✨","💗","💛","💜"].map((e,i)=>`<i style="left:${15+i*18}%;animation-delay:${i*.8}s">${e}</i>`).join("")}</span><b class="fg-t2" id="fgT">忘記密碼？</b><p class="fg-p">請到社群詢問管理員，謝謝 💜</p><button class="fg-ok2" data-a="fgClose">知道了</button></div>
  </div></div>`,"fg");
  requestAnimationFrame(fgStart); }
function closeForgot(){ const w=layer.querySelector(".fg-w"); if(!w) return; w.classList.add("out"); setTimeout(()=>{ if(layer.querySelector(".fg-w")) layer.innerHTML=""; },220); }
function fgStart(){ const box=document.getElementById("fgBox"); if(!box) return; const W=box.clientWidth, H=box.clientHeight;
  const sps=["cat","dog","fox","lizard"], exs=["smile","wink","love","wow"], emo=["💜","🌟","🎀","🍓","☀️","💋","🫧","🌈","✨","🍑","🩷","⭐️"], items=[];
  const N=20;
  for(let i=0;i<N;i++){ const isM=i%2===0, r=isM?30+Math.random()*6:19+Math.random()*5, el=document.createElement("span"); el.className="fg-it"+(isM?" m":"");
    if(isM){ let u=""; try{ u=svgUrl(64,64,`<g transform="translate(-4 -3) scale(.3)">${msHead(sps[(i/2)%4|0],exs[(i/8|0)%4])}</g>`); }catch(e){} if(u) el.style.backgroundImage=`url("${u}")`; else el.textContent="💜"; }
    else { el.textContent=emo[(i/2|0)%emo.length]; el.style.fontSize=(r*1.5)+"px"; }
    el.style.width=el.style.height=(r*2)+"px"; box.appendChild(el);
    const tilt=Math.random()*24-12;
    items.push({el,r,x:r+Math.random()*(W-2*r),y:-r-40-i*38,vx:(Math.random()-.5)*2.4,vy:0,tilt,a:tilt}); }
  let drag=null, last=null;
  const pick=e=>{ const b=box.getBoundingClientRect(), px=e.clientX-b.left, py=e.clientY-b.top; let best=null, bd=1e9; for(const o of items){ const d=Math.hypot(o.x-px,o.y-py); if(d<o.r+6&&d<bd){ best=o; bd=d; } } return best; };
  const host=box.parentElement;
  host.addEventListener("pointerdown",e=>{ if(e.target.closest(".fg-ok,.fg-card")) return; const o=pick(e); if(!o) return; drag=o; o.el.classList.add("held"); try{ host.setPointerCapture(e.pointerId); }catch(err){} const b=box.getBoundingClientRect(); o.ox=e.clientX-b.left-o.x; o.oy=e.clientY-b.top-o.y; o.vx=o.vy=0; last={x:e.clientX,y:e.clientY,t:performance.now()}; e.preventDefault(); });
  host.addEventListener("pointermove",e=>{ if(!drag) return; const b=box.getBoundingClientRect(), now=performance.now(), dt=Math.max(8,now-last.t); drag.vx=(e.clientX-last.x)/dt*16; drag.vy=(e.clientY-last.y)/dt*16; drag.x=Math.max(drag.r,Math.min(W-drag.r,e.clientX-b.left-drag.ox)); drag.y=Math.max(drag.r,Math.min(H-drag.r,e.clientY-b.top-drag.oy)); last={x:e.clientX,y:e.clientY,t:now}; });
  const up=()=>{ if(drag){ drag.vx=Math.max(-24,Math.min(24,drag.vx)); drag.vy=Math.max(-24,Math.min(24,drag.vy)); drag.el.classList.remove("held"); } drag=null; };
  host.addEventListener("pointerup",up); host.addEventListener("pointercancel",up);
  const step=()=>{ if(!box.isConnected) return;
    for(const o of items){ if(o===drag) continue; o.vy+=.42; o.vx*=.985; o.vy*=.995; o.x+=o.vx; o.y+=o.vy;
      if(o.x<o.r){ o.x=o.r; o.vx=Math.abs(o.vx)*.5; } if(o.x>W-o.r){ o.x=W-o.r; o.vx=-Math.abs(o.vx)*.5; }
      if(o.y>H-o.r){ o.y=H-o.r; o.vy=-Math.abs(o.vy)*.35; if(Math.abs(o.vy)<1) o.vy=0; o.vx*=.85; } }
    for(let k=0;k<4;k++) for(let i=0;i<items.length;i++) for(let j=i+1;j<items.length;j++){ const a=items[i], b=items[j], dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy), m=a.r+b.r-2;
      if(d>0&&d<m){ const nx=dx/d, ny=dy/d, fa=a===drag?0:b===drag?1:.5, ov=m-d; a.x-=nx*ov*fa; a.y-=ny*ov*fa; b.x+=nx*ov*(1-fa); b.y+=ny*ov*(1-fa);
        if(k===0){ const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny; if(rv<0){ const jj=1.2*rv/2; if(a!==drag){ a.vx+=jj*nx; a.vy+=jj*ny; } if(b!==drag){ b.vx-=jj*nx; b.vy-=jj*ny; } } } } }
    for(const o of items){ if(o.y>H-o.r) o.y=H-o.r; if(o.x<o.r) o.x=o.r; if(o.x>W-o.r) o.x=W-o.r;
      if(Math.abs(o.vx)<.05) o.vx=0;
      const target=o===drag?Math.max(-18,Math.min(18,o.vx*2)):o.tilt+Math.max(-10,Math.min(10,o.vx*1.5)); o.a+=(target-o.a)*.15;
      o.el.style.transform=`translate(${(o.x-o.r).toFixed(1)}px,${(o.y-o.r).toFixed(1)}px) rotate(${o.a.toFixed(1)}deg)`; }
    requestAnimationFrame(step); };
  requestAnimationFrame(step); }

/* ===== 管理員：不管在哪一端，看到不當內容都能馬上處理 ===== */
/* 在藝人端：不顯示粉絲是誰（FROM FAN），只寫「這位粉絲」 */
function admQuick(item){ ui.amItem=item; const r0=route(), artSide=(r0&&r0.role==="artist")||(session()||{}).role==="artist"; const nm=artSide?"這位粉絲":shownName({name:item.name,by:item.by});
  iosSheet([["刪除這則","amDo",'data-v="del"'],[`禁言 ${esc(nm)} 24 小時`,"amDo",'data-v="24"'],[`禁言 ${esc(nm)} 7 天`,"amDo",'data-v="168"'],[`停權 ${esc(nm)}`,"amDo",'data-v="ban"']],{cancel:"取消",stack:true}); }
function amApply(v){ const it=ui.amItem; if(!it) return; const stk=layer.querySelector(".ios-w.stk"); if(stk) stk.remove(); else layer.innerHTML="";
  if(v==="del"){ const r={kind:it.kind,commentId:it.commentId,ref:it.ref||{},who:it.who}; if(it.kind==="fanpost") S.set(K.fanPosts,S.get(K.fanPosts,[]).filter(x=>x.id!==it.id)); else removeReported(r);
    const L=S.get(K.reports,[]); L.push({id:"rp"+Date.now(),key:"adm:"+Date.now(),kind:it.kind==="fanpost"?"comment":it.kind,commentId:it.commentId,postId:it.postId,ref:{...(it.ref||{}),by:it.by},text:it.text,name:it.name,who:it.who,reason:"管理員直接處理",by:"admin",count:1,ts:Date.now(),status:"removed",doneTs:Date.now()}); S.set(K.reports,L);
    toast("已刪除"); }
  else { const key=it.who; if(!key){ toast("找不到這個帳號"); return; } const all=getMutes(); all[key]=v==="ban"?{ban:true,ts:Date.now()}:{until:Date.now()+(+v)*3600e3,ts:Date.now()}; S.set(K.mutes,all); toast(v==="ban"?"已停權":`已禁言 ${+v>=168?"7 天":"24 小時"}`); }
  ui.amItem=null; if(ui.sheet) renderComments(true); else { const y=window.scrollY; render(); window.scrollTo(0,y); } }

/* ===== 藝人的通知抽屜：HAECHU 公告、粉絲留言、TIE 回覆 ===== */
function artNotifList(mid){ const m=MEMBERS[mid]; if(!m) return []; const L=[], my=new Set(getPosts().filter(p=>p.member===mid).map(p=>p.id));
  cmNoticesOf&&cmNoticesOf(m.group,"c").slice(0,5).forEach(n=>L.push({ts:n.ts,k:"gn",t:`${groupOf(m.group).name} 公告`,b:n.title,a:"gnOpen",v:n.id}));
  S.get(K.comments,[]).filter(c=>my.has(c.postId)&&c.author!=="artist").slice(-30).forEach(c=>L.push({ts:c.ts,k:"cm",t:"新留言",b:`${c.name}：${c.text}`,a:"comments",v:c.postId}));
  const tw=getWhispers().filter(w=>w.member===mid&&w.from!=="artist"); if(tw.length){ const last=tw[tw.length-1]; L.push({ts:last.ts,k:"tie",t:`${WHISPER_NAME} 粉絲回覆`,b:`共 ${tw.length} 則，最新：${last.text}`,a:"tab",v:"whisper"}); }
  coInvites(mid).forEach(l=>L.push({ts:l.co.ts,k:"live",t:"連線邀請",b:`${MEMBERS[l.member].name} 邀請你一起直播：${l.title||""}`,a:"tab",v:"live"}));
  try{ const d=snDB(), id="m:"+mid; d.stories.filter(s=>!s.del&&s.uid!==id&&(s.ment||[]).some(x=>x.u===id)).slice(-10).forEach(s=>{ const u=snUser(s.uid)||{}; L.push({ts:s.ts,k:"sns",t:`${u.u||u.name||""} 在限時動態中提到你`,b:"",a:"openSns",v:""}); }); d.posts.filter(p=>p.uid!==id&&(p.tags||[]).includes(id)).slice(-10).forEach(p=>{ const u=snUser(p.uid)||{}; L.push({ts:p.ts,k:"sns",t:`${u.u||u.name||""} 在貼文中標註了你`,b:"",a:"openSns",v:""}); }); }catch(e){}
  ptGrants().filter(g=>g.mid===mid&&g.art&&!/^uf[_m]/.test(g.id)&&!/^tka_/.test(g.id)).slice(-20).forEach(g=>L.push({ts:g.ts,k:"pt",t:`${g.n>=0?"獲得":"扣除"} ${fmt(Math.abs(g.n||0))} 積分${g.why?"・"+g.why:""}`,b:"",a:"tab",v:"points"}));
  { const q=tieQuiet().find(x=>x.mid===mid); if(q) L.push({ts:q.at,k:"tie",t:`${WHISPER_NAME} 提醒`,b:q.days>=4?`已經 ${q.days} 天沒有傳 ${WHISPER_NAME} 訊息了，每多一天扣一次${TIE_QUIET_FINE()}。`:`已經 ${q.days} 天沒有傳 ${WHISPER_NAME} 訊息了，明天再沒傳會扣${TIE_QUIET_FINE()}。`,a:"tab",v:"whisper"}); }
  return L.sort((a,b)=>b.ts-a.ts).slice(0,40); }
const artNUnread=mid=>{ const seen=(S.get(K.artNSeen,{})[mid])||0; return artNotifList(mid).some(x=>x.ts>seen); };
function openArtNotifs(){ const mid=session().member; if(!mid) return; const L=artNotifList(mid), seen=(S.get(K.artNSeen,{})[mid])||0, IC={ann:I.bell,gn:I.bell,cm:I.chat,tie:TI.send,pt:I.star,sns:I.bell};
  setLayer(`<div class="tiei"><header class="tiei-top"><button class="icon-btn" data-a="tCloseLayer" aria-label="返回">${I.back}</button><b>通知</b><span class="sh-sp"></span></header>
    <div class="tiei-body an-list"><div class="artn-pin">${pinnedHtml()}</div>${L.length?L.map(x=>`<button class="an-it ${x.ts>seen?"new":""}" ${x.a?`data-a="${x.a}" data-v="${esc(x.v)}" data-id="${esc(x.v)}"`:""}><span class="an-ic">${IC[x.k]||I.bell}</span><span class="an-b"><b>${esc(x.t)}</b>${x.b?`<span>${esc(x.b)}</span>`:""}<small>${ago(x.ts)}</small></span></button>`).join(""):`<p class="me-none">還沒有通知</p>`}</div></div>`,"artn");
  const A=S.get(K.artNSeen,{}); A[mid]=Date.now(); S.set(K.artNSeen,A); }

/* SNS：輪播滑動時更新 1/3 和下面的點點 */
document.addEventListener("scroll",e=>{ const c=e.target; if(!c||!c.classList||!c.classList.contains("sn-car")) return; const n=c.children.length, i=Math.round(c.scrollLeft/Math.max(1,c.clientWidth)); const m=c.parentElement, cnt=m&&m.querySelector(".sn-cnt"); if(cnt) cnt.textContent=`${i+1}/${n}`; const dots=m&&m.nextElementSibling; if(dots&&dots.classList.contains("sn-dots")) [...dots.children].forEach((x,k)=>x.classList.toggle("on",k===i)); },true);
/* 藝人在自己的動態下留言（不是回覆某位粉絲） */
function addArtistComment(postId,text){ const p=getPosts().find(x=>x.id===postId); if(!p) return; const m=MEMBERS[p.member];
  const c={id:"c"+Date.now(),postId,author:"artist",member:p.member,by:myEmail(),name:m.name,g:m.g,text,ts:Date.now(),reply:null};
  S.set(K.comments,[...S.get(K.comments,[]),c]); try{ feedPush({kind:"acomment",member:p.member,host:p.member,group:p.group,text:text.slice(0,80),postId:p.id,commentId:c.id,color:null},"g:"+p.group); }catch(e){} return c; }

/* ---------- 新手教學 ---------- */
/* 教學內容在 js/40-新手教學內容.js */
function tourKey(){ const s=session(), r=route(); if(!s) return "";
  if(r.role==="fan"&&r.sub==="chat"&&!r.p) return "fan:chat";
  if(r.role==="fan"&&r.sub==="grp"&&!r.p) return "fan:grp";
  if(r.role==="fan"&&r.sub==="core"&&r.p&&!r.id) return "fan:core:"+r.p;
  if(r.sub==="sns"&&(!r.p||r.p==="home")) return r.role+":sns";
  if(r.role==="fan"&&["core","shop","me"].includes(r.sub)&&!r.p) return "fan:"+r.sub;
  if(r.role==="artist"&&r.sub==="write") return "artist:write";
  if(r.role==="artist"&&!r.sub&&r.tab==="foc"&&r.p&&!r.id) return "artist:foc:"+r.p;
  if(r.role==="artist"&&!r.sub&&r.tab==="live"&&document.querySelector(".mr.dl.host")) return "artist:room";
  if(r.sub) return "";
  if(r.role==="admin"){ const t=r.tab||"home"; if(t==="roster"&&r.p==="new") return "admin:rosternew"; if(t==="roster"&&r.id) return ""; return "admin:"+(["reports","posts","announce","foc","shopadm","people","accounts","roster","ptadd","banned"].includes(t)?t:t==="home"?"home":"x"); }
  return r.role+":"+(r.tab||"home"); }
const tourDone=k=>{ const s=session()||{}; return !!(S.get(K.tours,{})[(s.email||"")+"|"+k]); };
function tourCheck(){ if(ui.noTour||ui.coach||layer.innerHTML||document.getElementById("coach")||!welcomeDone()) return;
  { const ro=route().role; if(document.querySelector(".nav .nav-btn")&&!tourDone("full:"+ro)&&tourDone("_new")){ fullTourStart(); return; } }
  const k=tourKey(); if(!k||!TOURS[k]||tourDone(k)||!tourDone("_new")) return; /* 分頁小教學只給新帳號自動跳；舊帳號要到 ME 按「重看教學」 */
  const steps=TOURS[k].filter(([sel])=>{ const el=document.querySelector(sel); return el&&el.getBoundingClientRect().height>0; }); if(!steps.length) return;
  ui.coach={kind:"tour",key:k,steps,i:0}; coachShow(); }

/* ===== 新手教學：每一端一次教完（不用每個分頁各跳一次） ===== */
const TOUR_LBL={home:"LOVE",live:"直播",whisper:"TIE",core:"FEST",shop:"SHOP",sns:"SNS",me:"ME",foc:"FOC",content:"內容",people:"人員",chat:"TIE 聊天室",grp:"社群",write:"撰寫貼文",reports:"內容",posts:"內容",announce:"內容",shopadm:"商店"};
function fullTourStart(){ const ro=route().role, navs=[...document.querySelectorAll(".nav .nav-btn")].map(b=>b.dataset.v).filter(Boolean); if(!navs.length){ const c=document.getElementById("coach"); if(c) c.remove(); ui.coach=null; return; }
  const seq=[];
  ui.feedTab="feed"; tourDemoOn(ro);
  navs.forEach(v=>{ seq.push({nav:v});
    if(ro==="fan"&&v==="home"){ seq.push({open:"ftLive",key:"fan:live",lbl:"live"}); seq.push({open:"cm",key:"fan:cm",lbl:"home"}); const g=followed()[0]; if(g&&groupOf(g)){ seq.push({hash:"#/fan/grp?id="+g,lbl:"grp"}); seq.push({open:"grpfab",key:"fan:grpfab",lbl:"grp"}); } }
    if(ro==="fan"&&v==="whisper"){ const id=Object.keys(subs()).find(x=>MEMBERS[x]&&!roomHidden(x)); if(id){ seq.push({hash:"#/fan/chat?m="+id,lbl:"chat"}); seq.push({open:"drawer",key:"fan:drawer",lbl:"chat"}); } }
    if(ro==="artist"&&v==="home"){ seq.push({open:"fab",key:"artist:fab",lbl:"home"}); seq.push({hash:"#/artist/write?p=all",lbl:"write"}); }
    if(ro==="artist"&&v==="whisper") seq.push({open:"artdrawer",key:"artist:drawer",lbl:"whisper"});
    if(ro==="fan"&&v==="core"){ seq.push({open:"muOpen",key:"fan:core:promo",lbl:"打歌"}); [["cards","卡冊"],["news","新聞"],["wiki","SKpedia"],["truck","應援餐車"],["fsl","簽售"],["concert","演唱會"],["tour","世巡"]].forEach(([p,l])=>seq.push({hash:"#/fan/core?p="+p,key:"fan:core:"+p,lbl:l})); seq.push({hash:"#/fan/sns",key:"fan:sns",lbl:"SNS"}); }
    if(ro==="artist"&&v==="foc"){ [["honor","打歌戰況"],["truck","應援餐車"],["news","新聞"],["sign","簽售"],["concert","演唱會"],["tour","世巡"],["stick","官方應援棒"]].forEach(([p,l])=>seq.push({hash:"#/artist?tab=foc&p="+p,key:"artist:foc:"+p,lbl:l})); seq.push({hash:"#/artist/sns",key:"artist:sns",lbl:"SNS"}); }
    if(ro==="admin"&&v==="people"){ [["accounts","帳號"],["roster","藝人與團"],["roster&p=new","新增藝人"],["ptadd","加積分"],["banned","禁用字詞"]].forEach(([t,l])=>seq.push({hash:"#/admin?tab="+t,key:"admin:"+(t==="roster&p=new"?"rosternew":t),lbl:l})); } });
  ui.coach={kind:"full",role:ro,seq,si:0,steps:[],i:0,home:location.hash}; fullNext(); }
/* 教學時打開抽屜、留言、直播分頁 */
const TOUR_OPEN={ ftLive:()=>{ ui.feedTab="live"; render(); },
  cm:()=>{ ui.feedTab="feed"; render(); window.scrollTo(0,0); const b=document.querySelector('.post [data-a="comments"]'); if(b) b.click(); },
  grpfab:()=>openCmFab(route().id), muOpen:()=>{ const f=(SHOWS[0]||{}).id; if(f) ui.muOpen={[f]:true}; navTo("#/fan/core?p=promo"); window.scrollTo(0,0); }, drawer:()=>openTieDrawer(route().m), fab:()=>openArtFab(), artdrawer:()=>openTieArtDrawer(session().member) };
function tourCloseOpen(){ ui.sheet=null; layer.innerHTML=""; if(ui.feedTab==="live"){ ui.feedTab="feed"; } }
/* 教學用的示範內容：讓空的頁面也有東西可以看，教完就收掉 */
const TDM_G={id:"tdm_g",name:"示範團",g:0}, TDM_M={name:"示範藝人",group:"tdm_g",g:2};
function tdmDrop(){ const i=GROUPS.findIndex(g=>g.id==="tdm_g"); if(i>=0) GROUPS.splice(i,1); delete MEMBERS.tdm_m; }
function tourDemoOn(ro){ ui.tourDemo=ro||1; try{ const now=Date.now();
  if(ro==="fan"||ro==="admin"){
    // 還沒追蹤任何有成員的團：教學期間先放一個「示範團」，有動態、直播、TIE 聊天室可以看
    if(!followed().some(g=>groupOf(g)&&grpMembers(g).some(x=>MEMBERS[x]&&!MEMBERS[x].official))){
      if(!groupOf("tdm_g")) GROUPS.push({...TDM_G}); MEMBERS.tdm_m={...TDM_M};
      S.set(K.fanArtists,["tdm_g",...followed().filter(x=>x!=="tdm_g")]);
      const P=S.get(K.posts,[]); if(!P.some(p=>p.id==="tdm_p")) S.set(K.posts,[{id:"tdm_p",member:"tdm_m",group:"tdm_g",ts:now-2*3600e3,text:"這是教學用的示範動態，教學結束就會消失 💜",color:2,tag:"日常",likes:0,comments:0},...P]); }
    if(!Object.keys(subs()).some(x=>MEMBERS[x]&&!roomHidden(x))&&MEMBERS.tdm_m){
      const A=subs(); A.tdm_m={since:now-3*DAY,expires:now+27*DAY,periods:[{start:now-3*DAY,end:null}]}; S.set(K.tieSubs,A);
      S.set(K.whispers,[...S.get(K.whispers,[]),{id:"tdm_w",member:"tdm_m",from:"artist",text:"這是教學用的示範訊息，藝人傳的 TIE 會出現在這裡 💜",ts:now-3600e3}]); }
    const L=getLives(), g=followed().find(x=>groupOf(x)), ms=g?grpMembers(g).filter(x=>MEMBERS[x]&&!MEMBERS[x].official):[], m=ms[ms.length-1];
    if(m){ const add=[];
      if(!L.some(l=>!l.endTs&&followed().includes(l.group))) add.push({id:"tdm_live",member:m,group:g,title:"示範直播 ☁️",startTs:now-18*60e3,endTs:null,hearts:0,msgs:[]});
      if(!L.some(l=>l.endTs&&followed().includes(l.group))) add.push({id:"tdm_rep",member:m,group:g,title:"示範重播 🌙",startTs:now-26*3600e3,endTs:now-25*3600e3,hearts:0,msgs:[]});
      if(add.length) S.set(K.lives,[...add,...L]); } }
  if(ro==="admin"){ const R=S.get(K.reports,[]); if(!R.some(r=>r.status==="open")) S.set(K.reports,[{id:"tdm_rp",key:"tdm",kind:"live",ref:{liveId:"tdm_rep",ts:now-25.5*3600e3},text:"（示範）這是一則被檢舉的留言",name:"示範粉絲",who:"fan:示範粉絲",reason:"騷擾",by:"fan",count:1,ts:now-3600e3,status:"open"},...R]); }
  }catch(e){} }
/* 教學結束（或下次打開 App）：示範的團、藝人、動態、直播、TIE 全部收掉 */
function tourDemoOff(){ ui.tourDemo=null; try{ const T=x=>String(x&&x.id||"").startsWith("tdm_");
  const L=getLives(); if(L.some(T)) S.set(K.lives,L.filter(l=>!T(l)));
  const R=S.get(K.reports,[]); if(R.some(T)) S.set(K.reports,R.filter(r=>!T(r)));
  const P=S.get(K.posts,[]); if(P.some(T)) S.set(K.posts,P.filter(p=>!T(p)));
  const Wh=S.get(K.whispers,[]); if(Wh.some(T)) S.set(K.whispers,Wh.filter(w=>!T(w)));
  const A=subs(); if(A.tdm_m){ delete A.tdm_m; S.set(K.tieSubs,A); }
  const F=followed(); if(F.includes("tdm_g")) S.set(K.fanArtists,F.filter(x=>x!=="tdm_g"));
  const N=S.get(K.notifs,[]); if(N.some(n=>n.member==="tdm_m")) S.set(K.notifs,N.filter(n=>n.member!=="tdm_m"));
  }catch(e){} tdmDrop(); }
function fullNext(){ const c=ui.coach; if(!c||c.kind!=="full") return;
  if(c.opened){ c.opened=false; tourCloseOpen(); }
  if(c.si>=c.seq.length){ fullMarkDone(c.role); tourDemoOff(); ui.coach=null; if(c.home&&location.hash!==c.home) navTo(c.home); setTimeout(()=>{ window.scrollTo(0,0); ui.coach={kind:"done"}; coachDone(); },350); return; }
  const it=c.seq[c.si++], my=c.tick=(c.tick||0)+1; c.wait=true; coachMount(`<div class="coach-dim soft"></div>`);
  if(it.nav){ const ro=c.role, v=it.nav, h=ro==="admin"&&isUni()?(UNI_ATABGO[v]||"#/admin"):ro==="fan"&&isUni()?(UNI_ROUTE[v]||"#/fan"):(v==="home"?"#/"+ro+(ro==="artist"?"?tab=home":""):"#/"+ro+"?tab="+v); navRoot(h); c.label=TOUR_LBL[v]||v; }
  else if(it.hash){ navTo(it.hash); c.label=TOUR_LBL[it.lbl]||it.lbl||""; }
  else if(it.open){ try{ TOUR_OPEN[it.open](); }catch(e){} c.opened=it.open!=="ftLive"||true; c.label=TOUR_LBL[it.lbl]||it.lbl||c.label||""; }
  setTimeout(()=>{ if(ui.coach!==c) return; if(!it.open) window.scrollTo(0,0); const k=it.key||tourKey(); const steps=(TOURS[k]||[]).filter(([sel])=>{ const el=document.querySelector(sel); return el&&el.getBoundingClientRect().height>0; });
    if(c.tick!==my) return; c.wait=false; if(!steps.length) return fullNext(); c.steps=steps; c.i=0; c.key=k; c._scI=-1; coachShow(); },650); }
function fullMarkDone(ro){ const s=session()||{}, T=S.get(K.tours,{}), e=s.email||""; T[e+"|full:"+ro]=true; Object.keys(TOURS).filter(k=>k.startsWith(ro+":")).forEach(k=>T[e+"|"+k]=true); S.set(K.tours,T); }
setTimeout(tourDemoOff,0);
/* 單頁教學：換頁就收起來，提示不會停在別的頁面上 */
window.addEventListener("hashchange",()=>{ if(ui.coach&&ui.coach.kind==="tour"){ ui.coach=null; const c=document.getElementById("coach"); if(c) c.remove(); } });
const welcomeDone=()=>{ const s=session(); if(!s) return true; const d=S.get(K.onboard,{}), e=s.email||""; return !!(d[e]||Object.keys(d).some(k=>k.startsWith(e+"|"))); };

I.camera=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l1.6-2.4h6.8L17 8h3v11H4z"/><circle cx="12" cy="13.2" r="3.4"/></svg>`;
/* =========================================================
   管理員＝三端：最上面「粉絲｜藝人｜管理」三段切換（方案 B）
   ・粉絲：跟一般粉絲一模一樣（紫）
   ・藝人：就是原本的藝人端，用自己的藝人身分（粉紅）
   ・管理：深色，五個分頁：待辦、內容、活動、商店、人員
   ========================================================= */
const UNI_SEC={fan:"#/fan",artist:"#/artist",admin:"#/admin"};
function uniSwitch(){ const r=route().role, i=["fan","artist","admin"].indexOf(r), T=uniTodo(), n=T.rep+T.th;
  return `<div class="uni-sw s-${r}"><div class="uni-sw-in" style="--i:${Math.max(0,i)}"><i class="uni-sw-ind"></i>${[["fan","粉絲"],["artist","藝人"],["admin","管理"]].map(([k,l])=>`<button class="${k===r?"on":""}" data-a="uniSec" data-v="${k}">${l}${k==="admin"&&n?`<b>${n}</b>`:""}</button>`).join("")}</div></div>`; }
const UNI_AIC={
  home:UNI_SV(`<rect x="4.5" y="4" width="15" height="16.5" rx="3"/><path d="m8.4 9.6 1.6 1.6 3-3M8.4 15.4h7"/>`,`<path fill-rule="evenodd" d="M7.5 4h9a3 3 0 0 1 3 3v10.5a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zm.9 5.6 1.6 1.6 3-3M8.4 15.4h7" />`),
  content:UNI_SV(`<path d="M6.5 3.8h7.6l4.4 4.4v10.6a2.2 2.2 0 0 1-2.2 2.2H6.5a2.2 2.2 0 0 1-2.2-2.2V6a2.2 2.2 0 0 1 2.2-2.2z"/><path d="M13.8 4v4.4h4.4M8 13h8M8 16.6h5"/>`,`<path d="M6.5 3.8h7.6l4.4 4.4v10.6a2.2 2.2 0 0 1-2.2 2.2H6.5a2.2 2.2 0 0 1-2.2-2.2V6a2.2 2.2 0 0 1 2.2-2.2z"/><path d="M8 13h8M8 16.6h5" stroke="#fff"/>`),
  foc:UNI_SV(`<rect x="3.8" y="5.4" width="16.4" height="14.6" rx="3"/><path d="M3.8 9.8h16.4M8.4 3.6v3.6M15.6 3.6v3.6"/><path d="m12 12.4.9 1.9 2 .2-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.2z"/>`,`<path fill-rule="evenodd" d="M6.8 5.4h10.4a3 3 0 0 1 3 3v8.6a3 3 0 0 1-3 3H6.8a3 3 0 0 1-3-3V8.4a3 3 0 0 1 3-3zM3.8 9.8h16.4"/><path d="M8.4 3.6v3.6M15.6 3.6v3.6" fill="none"/>`),
  shop:UNI_IC.shop,
  people:UNI_SV(`<circle cx="9" cy="8.6" r="3.2"/><path d="M3.4 19.4c.6-3.4 2.8-5 5.6-5s5 1.6 5.6 5"/><circle cx="16.6" cy="9.4" r="2.5"/><path d="M15.8 14.6c2.4 0 4.2 1.4 4.8 4.4"/>`,`<circle cx="9" cy="8.6" r="3.2"/><path d="M3.4 19.4c.6-3.4 2.8-5 5.6-5s5 1.6 5.6 5z"/><circle cx="16.6" cy="9.4" r="2.5"/><path d="M15.8 14.6c2.4 0 4.2 1.4 4.8 4.4h-4.2z"/>`)};
const UNI_ATAB=t=>({banned:"people",reports:"content",posts:"content",announce:"content",content:"content",foc:"foc",shopadm:"shop",albums:"shop",people:"people",roster:"people",revenue:"people",aifans:"people",translate:"people",demo:"people"})[t]||(t?"people":"home");
function uniAdminNav(){ const r=route(), a=r.sub==="themes"||r.sub==="thedit"?"shop":UNI_ATAB(r.tab), T=uniTodo();
  return navBar([["home","待辦",UNI_AIC.home],["content","內容",UNI_AIC.content],["foc","活動",UNI_AIC.foc],["shop","商店",UNI_AIC.shop],["people","人員",UNI_AIC.people]],a,{home:T.rep+T.th,content:T.rep}); }
const UNI_ATABGO={home:"#/admin",content:"#/admin?tab=reports",foc:"#/admin?tab=foc",shop:"#/admin?tab=shopadm",people:"#/admin?tab=people"};
const uniMainHead=title=>`<header class="top uni-top"><div class="top-row"><span class="sh-sp"></span><div class="top-title">${title}</div><span class="sh-sp"></span></div></header>`;
/* 管理員：全部貼文（每則的樣子）；「全部」時依藝人折疊，點開才看，太長的只先顯示 10 則 */
const APITEM=p=>{const m=MEMBERS[p.member]||{name:"已刪除的藝人",g:0};return `<div class="n-item ${p.hidden?"is-hidden":""}">
        <div class="av" style="background:${grad(m.g)}">${mAvIn(p.member)}</div>
        <div class="n-body"><b>${esc(m.name)}</b>${p.hidden?' <span class="badge warn">已隱藏</span>':""}<div class="t">${esc(p.text)}</div><div class="m">${(groupOf(p.group)||{}).name||""}・${ago(p.ts)}・<button class="adm-cm" data-a="comments" data-id="${p.id}">❤ ${fmt(likeN(p))}・💬 ${fmt(commentCount(p.id))}</button></div></div>
        <div class="adm-btns"><button class="btn btn-soft btn-sm" data-a="hide" data-id="${p.id}">${p.hidden?"恢復":"隱藏"}</button><button class="btn btn-soft btn-sm adm-del" data-a="admDel" data-id="${p.id}">刪除</button></div>
      </div>`};
const uniContentSeg=i=>`<div class="seg2 mod-seg three" style="--i:${i}"><i class="seg2-ind"></i>${[["檢舉","reports"],["全部貼文","posts"],["公告","announce"]].map(([l,t],k)=>`<button class="${k===i?"on":""}" data-a="uniSeg" data-v="#/admin?tab=${t}">${l}</button>`).join("")}</div>`;
function viewUniTodo(){ const T=uniTodo(), on=getLives().filter(l=>!l.endTs), cm=S.get(K.comments,[]).filter(c=>c.ts>Date.now()-864e5).length, ev=getEvents().filter(e=>e.ts>=Date.now()).length;
  const rows=[[tryUnread(),"試玩訪客等你回覆","#/admin?tab=try"],[debutWait(),"待審核出道申請","#/admin?tab=debut"],[cbrWait(),"待審核回歸申請","#/admin?tab=cbreq"],[T.rep,"待處理檢舉","#/admin?tab=reports"],[T.th,"待審核主題","#/admin/themes"],[tieQuiet().length,"TIE 3 天沒傳訊息","tieQuiet"]].filter(x=>x[0]);
  return uniMainHead("待辦")+`<main class="page">
    <div class="section-h">要處理的事<span class="muted">${rows.length?rows.reduce((a,b)=>a+b[0],0)+" 件":""}</span></div>
    ${rows.length?`<section class="card">${rows.map(([n,l,h])=>`<button class="list-btn" ${h==="tieQuiet"?'data-a="tieQuietList"':`data-a="uniGo" data-v="${h}"`}>${l}<span class="r"><em class="t-cnt">${n}</em></span></button>`).join("")}</section>`:`<section class="card uni-empty">都處理完了 ✓</section>`}
    <div class="section-h">今天</div>
    <div class="uni-stats"><button class="card" data-a="uniLives"><b>${on.length}</b><span>直播中</span></button><button class="card" data-a="uniGo" data-v="#/admin?tab=posts"><b>${fmt(cm)}</b><span>24 小時新留言</span></button><button class="card" data-a="uniGo" data-v="#/admin?tab=foc"><b>${ev}</b><span>即將舉辦的活動</span></button></div>
    <div class="section-h">快速入口</div>
    <div class="uni-quick"><button class="card uni-ann" data-a="uniAnn">${UI_S.mega}<span>發官方公告</span></button><button class="card" data-a="uniGo" data-v="#/admin?tab=ptadd">${AIC.plus}<span>加積分</span></button><button class="card" data-a="uniGo" data-v="#/admin?tab=accounts">${AIC.acct}<span>建立帳號</span></button><button class="card" data-a="uniGo" data-v="#/admin?tab=roster&p=new">${AIC.group}<span>新增藝人</span></button></div>
    <div class="section-h">系統</div>
    <section class="card">
      <button class="list-btn" data-a="uniGo" data-v="#/admin?tab=translate">${AIC.globe}翻譯服務<span class="r">${trEngine()}</span></button>
      <button class="list-btn" data-a="uniGo" data-v="#/admin?tab=banned">${AIC.shield}禁用字詞<span class="r">${bannedList().length} 個</span></button>
      <button class="list-btn" data-a="uniGo" data-v="#/admin?tab=cloud">${AIC.cloud}雲端用量<span class="r">${HB.kvSz?fmtB(HB.kvSz):""}</span></button>
      <button class="list-btn" data-a="maintToggle">${AIC.wrench}維修模式<span class="r">${maintOn()?"維修中":"關閉"}</span></button></section>
  </main>`; }
function viewUniPeople(){ const th=getThemes().filter(t=>t.status==="pending").length;
  return uniMainHead("人員")+`<main class="page">
    <section class="card">
      <button class="list-btn" data-a="uniGo" data-v="#/admin?tab=accounts">${AIC.acct}帳號<span class="r">${Object.keys(ACCOUNTS).length} 個</span></button>
      <button class="list-btn" data-a="uniGo" data-v="#/admin?tab=debut">${AIC.debut}出道申請<span class="r">${debutWait()?`<i class="seg-dot"></i>${debutWait()} 件待審核`:"沒有新申請"}</span></button>
      <button class="list-btn" data-a="uniGo" data-v="#/admin?tab=cbreq">${AIC.debut}回歸申請<span class="r">${cbrWait()?`<i class="seg-dot"></i>${cbrWait()} 件待審核`:"沒有新申請"}</span></button>
      <button class="list-btn" data-a="uniGo" data-v="#/admin?tab=roster">${AIC.group}藝人與團<span class="r">${GROUPS.length} 團</span></button>
      <button class="list-btn" data-a="uniGo" data-v="#/admin?tab=ptadd">${AIC.plus}加積分</button>
      <button class="list-btn" data-a="uniGo" data-v="#/admin/sns?p=scout">${AIC.scout}星探<span class="r">${scGet().list.length} 人</span></button></section>
    <section class="card uni-out"><button class="list-btn danger" data-a="logout">${I.out}登出</button></section>
  </main>`; }

/* ---------- 斷掉訂閱的 TIE（照 Lysn） ---------- */
const tieLeft=()=>S.get(K.tieLeft,{});
function roomHidden(id){ const L=tieLeft()[id]; if(!L) return false; return tiePeriod(id)<=L; }
function openLeaveRoom(member){ iosAlert("","離開後聊天室將從聊天目錄中刪除。<br>您要離開聊天室嗎？",`<button data-a="tCloseLayer">取消</button><button class="danger" data-a="tLeaveOk" data-m="${member}">離開</button>`); }

/* ===== 整個 App 不能縮放：雙指縮放、點兩下放大、點輸入框自動放大都關掉 ===== */
(function noZoom(){
  document.querySelectorAll('meta[name="viewport"]').forEach(m=>{ m.content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"; });
  ["gesturestart","gesturechange","gestureend"].forEach(t=>document.addEventListener(t,e=>e.preventDefault(),{passive:false}));
  document.addEventListener("touchmove",e=>{ if(e.touches&&e.touches.length>1) e.preventDefault(); },{passive:false});
  document.addEventListener("touchstart",e=>{ if(e.touches&&e.touches.length>1) e.preventDefault(); },{passive:false});
})();
seedStores(); seedStores2(); seedMascots(); setTimeout(()=>PIMG.loadAll(),0);
(function addFanTr(){ const T={"露娜要多穿一點！":"루나 옷 좀 더 껴입어!","是什麼驚喜！！好想知道":"무슨 서프라이즈야!! 너무 궁금해","我猜是新髮色？":"새 머리색 아닐까?","今天也好喜歡你 💜":"오늘도 너무 좋아 💜","辛苦了！要好好休息喔":"수고했어! 푹 쉬어야 해","哇這個好可愛":"와 이거 너무 귀여워","一直在等你發文！":"계속 글 올라오길 기다렸어!","好期待下次見面":"다음에 만날 날이 너무 기대돼","看到這則心情都變好了":"이거 보고 기분이 좋아졌어","記得多喝水～":"물 많이 마시는 거 잊지 마~","我也想去！！":"나도 가고 싶어!!"};
  const ws=S.get(K.whispers,[]); let a=false; ws.forEach(w=>{ if(w.from==="other"&&!w.tr&&T[w.text]){ w.tr=T[w.text]; a=true; } }); if(a) S.set(K.whispers,ws);
  const cs=S.get(K.comments,[]); let b=false; cs.forEach(c=>{ if(c.author!=="me"&&!c.tr&&T[c.text]){ c.tr=T[c.text]; b=true; } }); if(b) S.set(K.comments,cs); })();
(function addKo2(){ const list=S.get(K.whispers,[]); let ch=false; list.forEach(w=>{ if(KO[w.id]&&!w.ko){ w.ko=KO[w.id]; ch=true; } }); if(ch) S.set(K.whispers,list); })();
/* 打開 App：記得登入狀態就直接進去 */
(function resume(){ const sv=sessLoad(); if(!sv) return;
  if(HB_ON){ hbResume(); return; }
  if(ACCOUNTS[sv.email]) { const h=location.hash; loginAs(sv.email); if(h&&/^#\/(fan|artist|admin)/.test(h)&&h!==location.hash) navReplace(h); navRestore(); } })();
render();

/* ---- fix pass: SVG ✕, broken images ---- */
const XSVG='<svg class="xg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
(function(){ const fix=r=>{ (r.querySelectorAll?r.querySelectorAll("button"):[]).forEach(b=>{ if(b.children.length===0&&b.textContent.trim()==="✕") b.innerHTML=XSVG; }); };
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{ if(n.nodeType===1){ if(n.tagName==="BUTTON"&&!n.children.length&&n.textContent.trim()==="✕") n.innerHTML=XSVG; else fix(n); } }))).observe(document.documentElement,{childList:true,subtree:true});
  fix(document);
  document.addEventListener("error",e=>{ const t=e.target; if(t&&t.tagName==="IMG"){ t.style.visibility="hidden"; if(t.parentElement) t.parentElement.classList.add("img-fail"); } },true); })();

/* ===== 應援板（DIY）與飯撒 ===== */
const BD_KEY="daisuki_boards_v1";
const BD_ACTS=[["heart","比心","對你比心了"],["look","看我","看向你了"],["wink","眨眼","對你眨眼了"],["kiss","飛吻","送你一個飛吻"],["wave","揮手","對你揮手了"],["like","比讚","對你比讚了"]];
const BD_BG=[["#FDE2F3","#7A1F5C"],["#E4DBFF","#3C2A8F"],["#FFF3B8","#7A5B00"],["#D5F5E3","#0F6B3E"],["#1E1B3A","#FFFFFF"],["#FF8FB8","#FFFFFF"]];
const BD_BR=[["solid","實線"],["dashed","虛線"],["double","雙線"],["none","無框"]];
const BD_ST=["","💜","⭐","🎀","🌙","🔥","✨"];
const BD_SIM=["今天是我生日","第一次來演唱會","想被你看到","加油！！","愛你很久了","我從台灣來的"];
const bdAll=()=>S.get(BD_KEY,[]), bdSave=l=>S.set(BD_KEY,l);
const bdFind=id=>getConcerts().find(c=>c.id===id)||(ui.lsDemo&&(ui.lsDemo.id||"demo-cc")===id?ui.lsDemo:null);
function bdConcert(){ const n=Date.now(), cur=curConcert(); if(cur&&cur.startTs<=n&&cur.endTs>n){ if(!cur.id) cur.id="demo-cc"; return cur; }
  const f=scopeF(); return getConcerts().find(c=>!c.ended&&c.endTs>n&&c.startTs-n<=600000&&f.includes(c.gid))||null; }
function bdHoldOk(c){ const n=Date.now(); if(c.startTs>n||c.endTs<=n) return false; const tl=ccTimeline(c); return !tl||tl.ia; }
function bdHtml(x,gid,sm){ const [bg,fg]=BD_BG[x.bg||0], br=x.br||"solid", nm=x.tg==="all"?(groupOf(gid)||{}).name||"":(MEMBERS[x.tg]?artName(x.tg,"feed"):""), a=BD_ACTS.find(y=>y[0]===x.act), tx=a?nm+a[1]:(x.text||"（還沒寫）");
  return `<div class="bd${sm?" sm":""}" style="background:${bg};color:${fg};${br==="none"?"":`border:4px ${br} ${fg}`}">${x.st?`<i>${x.st}</i>`:""}<span>${esc(tx)}</span></div>`; }
function bdEntryHtml(){ const c=bdConcert(); if(!c) return ""; return `<section class="card" style="margin:12px 0;padding:14px"><b>應援板</b><button class="btn btn-main btn-block" style="margin-top:10px" data-a="bdOpen">製作應援板</button></section>`; }
function bdRender(){ const el=document.getElementById("bdLayer"); if(!el) return; const c=bdFind(ui.bdC); if(!c){ bdClose(); return; }
  const d=ui.bd, g=groupOf(c.gid), ms=grpMembers(c.gid).filter(x=>!MEMBERS[x].official), mine=bdAll().filter(x=>x.cid===c.id&&x.mine);
  el.innerHTML=`<div class="bd-in"><div class="bd-hd"><button class="icon-btn" data-a="bdClose" aria-label="關閉">${XSVG}</button><b>製作應援板</b><span></span></div>
  <p class="lsp-n" style="margin:4px 0 10px">${esc(g.name)}・${esc(c.title)}　${c.startTs>Date.now()?evWhen(c.startTs)+" 開演":"演出中"}</p>
  <div id="bdPrev">${bdHtml(d,c.gid)}</div>
  <span class="lsp-l">寫給誰</span><div class="chips">${[...ms,"all"].map(x=>`<button class="chip ${d.tg===x?"on":""}" data-a="bdSet" data-k="tg" data-v="${x}">${esc(x==="all"?g.name+" 全團":artName(x,"feed"))}</button>`).join("")}</div>
  <span class="lsp-l">內容</span><div class="chips">${BD_ACTS.map(a=>`<button class="chip ${!d.custom&&d.act===a[0]?"on":""}" data-a="bdSet" data-k="act" data-v="${a[0]}">${a[1]}</button>`).join("")}<button class="chip ${d.custom?"on":""}" data-a="bdSet" data-k="act" data-v="">自己寫</button></div>
  ${d.custom?`<label class="field"><input id="bdText" maxlength="15" placeholder="最多 15 個字" value="${esc(d.text||"")}"></label>`:""}
  <span class="lsp-l">底色</span><div class="chips">${BD_BG.map((b,i)=>`<button class="bd-sw ${d.bg===i?"on":""}" data-a="bdSet" data-k="bg" data-v="${i}" style="background:${b[0]}" aria-label="底色 ${i+1}"></button>`).join("")}</div>
  <span class="lsp-l">邊框</span><div class="chips">${BD_BR.map(b=>`<button class="chip ${d.br===b[0]?"on":""}" data-a="bdSet" data-k="br" data-v="${b[0]}">${b[1]}</button>`).join("")}</div>
  <span class="lsp-l">貼紙</span><div class="chips">${BD_ST.map(b=>`<button class="chip ${d.st===b?"on":""}" data-a="bdSet" data-k="st" data-v="${b}">${b||"無"}</button>`).join("")}</div>
  <button class="btn btn-main btn-block" style="margin-top:12px" data-a="bdSave">儲存應援板</button>
  <span class="lsp-l" style="margin-top:14px">我的應援板（最多 3 塊）</span>${mine.length?mine.map(x=>`<div class="bd-my">${bdHtml(x,c.gid,true)}<div><button class="btn btn-soft" data-a="bdHold" data-v="${x.id}">${x.ans?"已被回應":x.up?"收起來":"舉起來"}</button><button class="btn btn-soft" data-a="bdDel" data-v="${x.id}">刪除</button></div></div>`).join(""):`<small class="lsp-n">還沒有，先做一塊吧</small>`}</div>`; }
function bdClose(){ const el=document.getElementById("bdLayer"); if(el) el.remove(); }
function bdSim(c){ return; const L=bdAll(), have=L.filter(x=>x.cid===c.id&&x.sim).length; if(have>=14||(have>=6&&Math.random()>.4)) return;
  const ms=grpMembers(c.gid).filter(x=>!MEMBERS[x].official); if(!ms.length) return; const r=a=>a[Math.floor(Math.random()*a.length)], custom=Math.random()<.35;
  L.push({id:"bs"+Date.now()+Math.floor(Math.random()*999),cid:c.id,tg:Math.random()<.2?"all":r(ms),act:custom?null:r(BD_ACTS)[0],text:custom?r(BD_SIM):"",bg:Math.floor(Math.random()*BD_BG.length),br:r(BD_BR)[0],st:r(BD_ST),up:true,sim:true,ts:Date.now()}); bdSave(L); }
function bdWallHtml(c,mid){ const L=bdAll().filter(x=>x.cid===c.id&&x.up&&!x.ans&&(x.tg===mid||x.tg==="all")).sort((a,b)=>b.ts-a.ts).slice(0,12);
  return L.length?`<div class="bd-wall">${L.map(x=>`<button class="bd-t ${ui.bdSel===x.id?"on":""}" data-a="bdPick" data-v="${x.id}">${bdHtml(x,c.gid,true)}</button>`).join("")}</div>`:`<small class="lsp-n">還沒有人舉牌</small>`; }
function bdRepHtml(c,mid){ const x=bdAll().find(y=>y.id===ui.bdSel&&y.up&&!y.ans); if(!x) return ""; const a=BD_ACTS.find(y=>y[0]===x.act);
  return a?`<button class="btn btn-main btn-block" data-a="bdReply">${esc(artName(mid,"feed")+a[2])}</button>`:`<label class="field"><input id="bdRepText" maxlength="30" placeholder="打字回應這塊板子"></label><button class="btn btn-main btn-block" data-a="bdReply">送出回應</button>`; }

document.addEventListener("input",e=>{ if(e.target&&e.target.id==="bdText"&&ui.bd){ ui.bd.text=e.target.value; const p=document.getElementById("bdPrev"), c=bdFind(ui.bdC); if(p&&c) p.innerHTML=bdHtml(ui.bd,c.gid); } });
setInterval(()=>{ const w=document.getElementById("bdWall"); if(!w) return; const s=session(); if(!s||s.role!=="artist") return; const c=curConcert(); if(!c) return; if(!c.id) c.id="demo-cc"; const tl=ccTimeline(c); if(tl&&!tl.ia) return; bdSim(c); w.innerHTML=bdWallHtml(c,s.member); },4000);
setInterval(()=>{ const s=session(); if(!s||s.role!=="fan") return; const L=bdAll(), x=L.find(y=>y.mine&&y.ans&&!y.seen); if(!x) return; x.seen=true; bdSave(L);
  const c=bdFind(x.cid), by=MEMBERS[x.ans.by], nm=by?artName(x.ans.by,"feed"):"", msg=x.act?nm+x.ans.text:`${nm}：${x.ans.text}`; S.set(K.points,points()+30);
  const d=document.createElement("div"); d.className="bd-ans"; d.innerHTML=`${bdHtml(x,c?c.gid:"",true)}<b>${esc(msg)}</b><small>被藝人回應了，+30 積分</small>`; document.body.appendChild(d); try{ confetti(innerWidth/2,innerHeight/3); }catch(e){} setTimeout(()=>d.remove(),5000); },1500);
