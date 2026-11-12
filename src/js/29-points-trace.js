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
