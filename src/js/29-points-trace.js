/* HAECHU｜積分回溯（管理員：加積分 → 回溯）
   點一個人 → 自動找出他的「粉絲時期」和「出道後的藝人時期」，把兩段每一筆加分、扣分、設定為照時間排在一起，旁邊是累計
   ・粉絲時期：給這個 email 的紀錄（g.to===email）
   ・藝人時期：記在他藝人積分上的紀錄（g.mid===成員 且 g.art）；ufg_ 是粉絲那筆的複本、不重複列；ufm_ 是出道時粉絲積分整份併入（當分隔線）
   ・打錯的那筆可以「撤銷」：補一筆相反的（固定編號 rev_<原編號>，只會補一次）
   ・最下面可以直接「改成 LINE 的分數」（＝設定為）
   ========================================================= */
function ptTraceRows(email){ const e=String(email||"").toLowerCase(), a=ACCOUNTS[e]||{}, m=a.member&&MEMBERS[a.member]?a.member:"", all=ptGrants(), have=new Set(all.map(g=>g.id));
  const fan=all.filter(g=>String(g.to||"").toLowerCase()===e&&!g.art), art=m?all.filter(g=>g.mid===m&&g.art&&!/^ufg_/.test(g.id)):[], ufm=all.find(g=>g.id==="ufm_"+e);
  const rows=[...fan.map(g=>({g,era:"fan"})),...art.filter(g=>!/^ufm_/.test(g.id)).map(g=>({g,era:"art"}))].sort((x,y)=>x.g.ts-y.g.ts);
  let tot=0; const out=[]; let deb=false;
  rows.forEach(r=>{ const g=r.g; if(m&&!deb&&ufm&&g.ts>=ufm.ts){ deb=true; tot=Math.max(0,ufm.n||0); out.push({div:1,ts:ufm.ts,n:ufm.n,tot}); }
    if(m&&ufm) r.era=g.ts>=ufm.ts?"art":"fan";
    if(g.set) tot=Math.max(0,g.n); else tot=Math.max(0,tot+(g.n||0)); out.push({...r,tot,undone:have.has("rev_"+g.id)||/^rev_/.test(g.id)}); });
  if(m&&!deb&&ufm) out.push({div:1,ts:ufm.ts,n:ufm.n});
  return {e,a,m,rows:out,tot}; }
function ptTraceNow(e,m){ try{ if(m) return (pointsOf(m)||{}).net||0; const k=K.points+"@"+e, v=store.get(k,undefined); return Math.round(+(v===undefined?mem[k]:v)||0); }catch(err){ return null; } }
function ptTraceOpen(email){ const T=ptTraceRows(email), now=ptTraceNow(T.e,T.m), who=esc(acctUser(T.e)), rows=T.rows.slice().reverse();
  const row=r=>r.div?`<div class="ptt-div">🎉 出道・身分變成藝人，積分原封不動帶過去<small>${ymd(r.ts)}・出道當下有 ${fmt(r.n||0)}，出道後還是 ${fmt(r.n||0)}，不會變多也不會變少</small></div>`
:`<div class="ptt-r ${r.undone?"off":""}"><span class="ptt-era ${r.era}">${r.era==="art"?"藝人":"粉絲"}</span><div class="ptt-i"><b class="${r.g.set?"set":(r.g.n||0)<0?"neg":""}">${r.g.set?"＝":(r.g.n||0)>=0?"+":"−"}${fmt(Math.abs(r.g.n||0))}</b><small>${esc(r.g.why||"")}${r.g.why?"・":""}${ymd(r.g.ts)}・${esc(r.g.by==="auto"?"App 自動":acctUser(r.g.by||""))}${r.undone&&!/^rev_/.test(r.g.id)?"・已撤銷":""}</small></div><span class="ptt-t">${fmt(r.tot)}</span>${!r.undone&&!r.g.set&&r.g.by!=="auto"?`<button class="xv-bt g" data-a="ptTrUndo" data-v="${esc(r.g.id)}" data-e="${esc(T.e)}">撤銷</button>`:""}</div>`;
  setLayer(`<div class="tiei ptt"><header class="tiei-top"><button class="icon-btn" data-a="tCloseLayer" aria-label="返回">${I.back}</button><b>${who} 的積分回溯</b><span class="sh-sp"></span></header>
    <main class="tiei-body"><section class="ptt-sum"><div><b>${fmt(T.tot)}</b><span>照紀錄算出來</span></div><div><b>${now==null?"—":fmt(now)}</b><span>App 現在顯示</span></div><div><b>${T.m?"藝人":"粉絲"}</b><span>${T.m?esc(MEMBERS[T.m].name)+"・已出道":"還沒出道"}</span></div></section>
      ${now!=null&&now!==T.tot?`<p class="ptt-note">兩個數字差 ${fmt(Math.abs(now-T.tot))}：${T.m?"藝人積分還包含粉絲花在他身上的分潤，":""}App 自己加的（打卡、留言、活動）和買東西花掉的不在下面的清單裡</p>`:""}
      <section class="ptt-fix"><b>改成 LINE 上的分數</b><div><label class="field"><input id="pttN" inputmode="numeric" placeholder="輸入文字" autocomplete="off"></label><button class="btn btn-main" data-a="ptTrSet" data-e="${esc(T.e)}">設定</button></div><small>會新增一筆「設定為」，從這筆開始照新的分數往下算</small></section>
      ${ptRecountHtml(T.e)}
      <div class="section-h">全部紀錄<span class="muted">${T.rows.filter(r=>!r.div).length} 筆・新的在上面</span></div>
      <section class="card ptt-l">${rows.length?rows.map(row).join(""):`<p class="me-none">還沒有紀錄</p>`}</section>
      <p class="ptt-note">只保留最近 2,000 筆積分紀錄，更早的看不到</p></main></div>`,"ptt"); }
function ptTraceHtml(){ const q=nz((ui.pttQ||"").trim()), L=Object.entries(ACCOUNTS).filter(([e])=>e!==DEMO_FAN).filter(([e,a])=>!q||hit(q,acctUser(e),a.name,realName(e))).sort((a,b)=>acctUser(a[0]).localeCompare(acctUser(b[0]))).slice(0,q?30:8);
  return `<div class="section-h">回溯</div><section class="card studio ptt-pick"><p class="prg-d">查一個人從粉絲時期到出道後的全部積分紀錄，打錯的可以撤銷，或直接改成 LINE 上的分數。</p>
    <label class="field">${I.search}<input id="pttQ" placeholder="輸入文字" value="${esc(ui.pttQ||"")}" autocomplete="off"></label>
    <div class="pta-list">${L.map(([e,a])=>`<button class="pta-r" data-a="ptTrOpen" data-v="${esc(e)}"><b>${esc(acctUser(e))}</b><small>${esc(a.name||"")}${a.member&&MEMBERS[a.member]?"・已出道":""}・${ROLE_ZH[a.role]||"粉絲"}</small><i>›</i></button>`).join("")||`<p class="me-none">找不到</p>`}</div></section>`; }
document.addEventListener("input",e=>{ if(e.target&&e.target.id==="pttQ"){ ui.pttQ=e.target.value; const box=e.target.closest(".ptt-pick"); if(!box) return; const tmp=document.createElement("div"); tmp.innerHTML=ptTraceHtml(); const nl=tmp.querySelector(".pta-list"), ol=box.querySelector(".pta-list"); if(nl&&ol) ol.replaceWith(nl); } });
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="ptTrOpen"],[data-a="ptTrUndo"],[data-a="ptTrSet"]'); if(!t) return; e.stopImmediatePropagation(); const a=t.dataset.a;
  if(a==="ptTrOpen"){ ptTraceOpen(t.dataset.v); return; }
  if(a==="ptTrUndo"){ const id=t.dataset.v, em=t.dataset.e, L=S.get(K.ptGrants,[])||[], g=L.find(x=>x.id===id); if(!g||L.some(x=>x.id==="rev_"+id)) return;
    ask(`撤銷這筆 ${g.n>=0?"+":"−"}${fmt(Math.abs(g.n||0))}？會補一筆相反的分數。`,()=>{ const L2=S.get(K.ptGrants,[])||[]; if(L2.some(x=>x.id==="rev_"+id)) return;
      L2.push({id:"rev_"+id,to:g.to,...(g.mid?{mid:g.mid}:{}),...(g.art?{art:1}:{}),n:-(g.n||0),why:`撤銷：${g.why||"打錯的分數"}`,by:myEmail(),ts:Date.now()}); S.set(K.ptGrants,L2.slice(-2000)); toast("已撤銷"); ptTraceOpen(em); },{title:"撤銷這筆",ok:"撤銷"}); return; }
  if(a==="ptTrSet"){ const em=t.dataset.e, n=Math.round(+String((document.getElementById("pttN")||{}).value||"").replace(/[^\d]/g,"")); if(!String((document.getElementById("pttN")||{}).value||"").trim()){ toast("先填 LINE 上的分數"); return; }
    ask(`把 ${acctUser(em)} 的積分設定為 ${fmt(n)}？`,()=>{ const L=S.get(K.ptGrants,[])||[], now=Date.now(); L.push({id:"g"+now.toString(36)+"t"+Math.random().toString(36).slice(2,5),to:em,n,why:"照 LINE 對帳",by:myEmail(),ts:now,set:true}); S.set(K.ptGrants,L.slice(-2000)); toast(`已設定為 ${fmt(n)}`); ptTraceOpen(em); },{title:"改成 LINE 的分數",ok:"設定"}); } },true);
/* ---------- 貼上 LINE 的全部登記，從頭照積分表重算 ----------
   跟「LINE 登記」那頁不一樣：那頁是加今天的分（會扣掉已經加過的、對 App 紀錄）；這裡是重算歷史，只照積分表算對不對
   ・每一天：登記寫的 vs 照積分表算的
   ・登記裡有寫「目前／累計 ○○」的，拿來對累計，找出從哪一天開始對不上 */
function ptRecount(email,text,start){ const R=ptRulesParse(ptRulesText()), role=(ACCOUNTS[email]||{}).member?"artist":"fan";
  R.forEach(r=>{ r.alias=[]; PT_ALIAS.forEach(([re,al])=>{ if(re.test(r.key)) r.alias=al.map(ptNz); }); const bare=r.key.replace(/^[a-z]+/,""); if(bare!==r.key&&bare.length>=3&&!r.alias.includes(bare)) r.alias.push(bare); });
  const now=new Date(), yr=now.getFullYear(), days=[], used={}; let ds=null, cur=null;
  const day=()=>{ if(!cur||cur.ds!==ds){ cur={ds:ds||[ymdK(Date.now())],items:[],claim:0,give:0,said:null,total:null}; days.push(cur); } return cur; };
  String(text||"").replace(/\r/g,"").split("\n").flatMap(l=>l.replace(/([+＋]\s*[\d,，]+)\s*(?=[^\d\s,，分])/g,"$1\n").split("\n")).map(x=>x.trim()).filter(Boolean).forEach(seg=>{
    const dl=ptDateLine(seg,yr,now.getMonth()+1); if(dl){ ds=dl; cur=null; return; }
    { const pm=seg.normalize("NFKC").match(/^([\d\/.\-~～到至月日年]{3,})\s+(\S.*)$/); if(pm){ const d2=ptDateLine(pm[1],yr,now.getMonth()+1); if(d2){ ds=d2; cur=null; seg=pm[2]; } } }
    const D=day(), n=seg.normalize("NFKC");
    const tm=n.match(/^(總計|總共|合計|共計|總分|一共|總|共)\s*[:：]?\s*[+]?\s*([\d,]+)/); if(tm){ D.total=ptNum(tm[2]); return; }
    const bm=n.match(/^(目前|現在|累積|累計|餘額|現有|積分|總積分)\s*[:：]?\s*([\d,]+)\s*分?$/); if(bm){ D.said=ptNum(bm[2]); return; }
    const r=ptMatch(seg,R,role), cl=seg.match(/[+＋]\s*([\d,，]+)/), claim=cl?ptNum(cl[1]):null; if(claim!=null) D.claim+=claim;
    if(!r){ if(claim!=null) D.items.push({seg,claim,give:0,st:"no",why:"對不到積分表的項目"}); return; }
    if(r.auto){ D.items.push({seg,r,claim,give:0,st:"no",why:"App 會自己加，不用登記"}); return; }
    if(r.ask||r.pts==null){ D.items.push({seg,r,claim,give:claim||0,st:"ask",why:"這項是管理員決定的分數，照登記算"}); D.give+=claim||0; return; }
    const rest=seg.replace(cl?cl[0]:""," "); let cnt=null; const um=rest.match(/(\d+)\s*(則|篇|個|句|場|封|首|次|張|群|位|人|分鐘|min|條|天)/i)||rest.match(/[x×＊*]\s*(\d+)/i); if(um&&!/字/.test(um[0])) cnt=+um[1];
    if(cnt==null) cnt=claim!=null&&claim%r.pts===0?claim/r.pts:1; const nd=D.ds.length, why=[];
    if(r.once&&cnt>nd){ why.push(nd>1?`一天只能一次，${nd} 天最多 ${nd} 次`:"一天只能一次"); cnt=nd; }
    let give=r.pts*cnt; const kk=D.ds.join(",")+"|"+r.name, got=used[kk]||0, cap=r.cap!=null?r.cap*nd:null;
    if(cap!=null&&give+got>cap){ why.push(`${nd>1?`${nd} 天`:"一天"}最多 ${fmt(cap)}`); give=Math.max(0,cap-got); } used[kk]=got+give;
    if(claim!=null&&claim!==give&&!why.length) why.push(`${fmt(r.pts)} × ${cnt} = ${fmt(r.pts*cnt)}，登記寫 ${fmt(claim)}`);
    D.items.push({seg,r,claim,give,st:claim!=null&&claim!==give||why.length?"fix":"ok",why:why.join("・")}); D.give+=give; });
  let run=start||0, runC=start||0, first=null; days.forEach(D=>{ run+=D.give; runC+=D.claim; D.run=run; D.runC=runC; if(first==null&&D.claim!==D.give) first=D; if(D.said!=null&&D.said!==run) D.saidBad=true; });
  return {days,run,runC,first}; }
function ptRecountHtml(email){ const P=ui.ptRc&&ui.ptRc.e===email?ui.ptRc:(ui.ptRc={e:email,text:"",start:""}), res=P.text.trim()?ptRecount(email,P.text,ptNum(P.start)||0):null;
  const ic={ok:"✅",fix:"⚠️",no:"❌",ask:"✍️"};
  const body=res?`<div class="ptrc-sum"><div><b>${fmt(res.runC)}</b><span>照登記寫的加</span></div><div><b class="${res.runC!==res.run?"bad":""}">${fmt(res.run)}</b><span>照積分表算</span></div></div>
    ${res.first?`<p class="ptrc-first">⚠️ 從 <b>${ptDs(res.first.ds)}</b> 開始對不上：那天登記寫 +${fmt(res.first.claim)}，照積分表應該是 +${fmt(res.first.give)}</p>`:`<p class="ptrc-ok">✅ 每一天都算對了</p>`}
    ${res.days.slice().reverse().map(D=>`<details class="ptrc-d ${D.claim!==D.give||D.saidBad?"bad":""}"><summary><b>${ptDs(D.ds)}</b><span>登記 +${fmt(D.claim)}・應該 +${fmt(D.give)}</span><em>累計 ${fmt(D.run)}${D.said!=null?`<small class="${D.saidBad?"bad":""}">他寫 ${fmt(D.said)}</small>`:""}</em></summary>
      ${D.items.map(x=>`<div class="ptrc-r ${x.st}"><span>${ic[x.st]}</span><div><b>${x.r?esc(x.r.name):"？"}</b><small>${esc(x.seg)}</small>${x.why?`<em>${esc(x.why)}</em>`:""}</div><i>${x.give?"+"+fmt(x.give):"0"}${x.claim!=null&&x.claim!==x.give?`<s>+${fmt(x.claim)}</s>`:""}</i></div>`).join("")}
      ${D.total!=null&&D.total!==D.claim?`<p class="ptrc-note">他寫總共 +${fmt(D.total)}，但各項加起來是 +${fmt(D.claim)}</p>`:""}</details>`).join("")}
    <button class="btn btn-main btn-block" data-a="ptRcSet" data-e="${esc(email)}" data-v="${res.run}" style="margin-top:12px">把 App 的積分設定為照積分表算的 ${fmt(res.run)}</button>`:`<p class="prg-e">貼上之後，這裡會一天一天列出登記寫的和照積分表算的，標出從哪一天開始對不上</p>`;
  return `<section class="ptt-fix ptrc"><b>貼上 LINE 的全部登記，從頭重算</b><small>從第一天到現在整段貼上就好，日期照登記寫的分天</small>
    <span class="fld-lab">一開始有幾分（從 0 開始就不用填）</span><label class="field"><input id="ptRcS" inputmode="numeric" placeholder="輸入文字" value="${esc(P.start)}" autocomplete="off"></label>
    <label class="field prg-ta"><textarea id="ptRcT" rows="7" placeholder="例如：\n11/10\n打卡 +50\n宣群 3 個 +300\n總共 +350\n目前 12,350">${esc(P.text)}</textarea></label></section><div id="ptRcR">${body}</div>`; }
document.addEventListener("input",e=>{ const id=e.target&&e.target.id; if(id!=="ptRcT"&&id!=="ptRcS") return; const P=ui.ptRc; if(!P) return; if(id==="ptRcT") P.text=e.target.value; else P.start=e.target.value;
  clearTimeout(ui.ptRcT); ui.ptRcT=setTimeout(()=>{ const box=document.getElementById("ptRcR"); if(!box) return; const tmp=document.createElement("div"); tmp.innerHTML=ptRecountHtml(P.e); const nb=tmp.querySelector("#ptRcR"); if(nb) box.innerHTML=nb.innerHTML; },350); });
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="ptRcSet"]'); if(!t) return; e.stopImmediatePropagation(); const em=t.dataset.e, n=+t.dataset.v||0;
  ask(`把 ${acctUser(em)} 的積分設定為 ${fmt(n)}？`,()=>{ const L=S.get(K.ptGrants,[])||[], now=Date.now(); L.push({id:"g"+now.toString(36)+"r"+Math.random().toString(36).slice(2,5),to:em,n,why:"照 LINE 登記重算",by:myEmail(),ts:now,set:true}); S.set(K.ptGrants,L.slice(-2000)); toast(`已設定為 ${fmt(n)}`); ptTraceOpen(em); },{title:"照積分表重算",ok:"設定"}); },true);
