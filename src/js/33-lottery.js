/* ===== 11/18 連號開獎＋折價券（主程式這邊只放「判斷」：什麼時候該跳出來）=====
   ・扭蛋機、換券視窗的畫面和動畫在 lazy/lot.js：要跳出來時才載入，平常不載入（App 不會越來越重）
   ・FEST 不放開獎入口。條件達成才跳出來：湊到 5 張連號 → 跳「湊到連號了」；每月 1 號 21:00～24:00 手上有券 → 扭蛋機跳出來
   ・那 3 小時關掉扭蛋機的話，FEST「今天」有一格「開獎中」可以叫回來；卡冊上面有連號可換時會出現一條提示
   ・結果大家都看得到（K.lotRes）。折價券（K.coupons）：只能用一次、不能轉賣、只能折官方商品 */
/* 開獎時間：每月 1 號 21:00 台灣時間（= 13:00 UTC） */
function lotOpenAt(now=Date.now()){ const d=new Date(now+8*36e5); let y=d.getUTCFullYear(), m=d.getUTCMonth(), t=Date.UTC(y,m,1,13); if(t>now){ m--; if(m<0){ m=11; y--; } t=Date.UTC(y,m,1,13); } return t; }
function lotNextAt(now=Date.now()){ const d=new Date(lotOpenAt(now)+8*36e5); let y=d.getUTCFullYear(), m=d.getUTCMonth()+1; if(m>11){ m=0; y++; } return Date.UTC(y,m,1,13); }
const lotRound=t=>{ const d=new Date(t+8*36e5); return d.getUTCFullYear()+"-"+String(d.getUTCMonth()+1).padStart(2,"0"); };
const lotWhen=t=>{ const d=new Date(t+8*36e5); return `${d.getUTCMonth()+1}/${d.getUTCDate()}（${"日一二三四五六"[d.getUTCDay()]}）21:00`; };
const lotTix=()=>(S.get(K.lotTix,[])||[]).filter(x=>x&&x.id);
/* 只有每月 1 號 21:00～24:00 轉得動；沒轉完的券留到下個月 1 號 */
const lotLive=()=>Date.now()<lotOpenAt()+3*36e5;
const lotReady=()=>lotLive()?lotTix().filter(x=>!x.drawn&&x.ts<lotOpenAt()):[];
const lotWait=()=>{ const r=new Set(lotReady().map(x=>x.id)); return lotTix().filter(x=>!x.drawn&&!r.has(x.id)); };
const coupons=()=>(S.get(K.coupons,[])||[]).filter(x=>x&&x.id);
const cpLive=()=>coupons().filter(x=>!x.used);
/* 找出手上還沒兌換的 5 張連號 */
function lotRuns(){ const L=getSerials(), G={};
  Object.keys(L).forEach(cid=>{ const o=parseIt(cid); if(!o||!serKind(cid)) return; const mid=o.p.mid;
    L[cid].forEach(x=>{ if(!x.n||x.rd) return; const key=serKey(cid,x), g=G[key]||(G[key]={key,lab:`${mid&&MEMBERS[mid]?MEMBERS[mid].name:(groupOf(o.a.gid)||{}).name||""} ${o.it.name}`,cs:[]}); g.cs.push({cid,id:x.id,n:x.n}); }); });
  const out=[]; Object.values(G).forEach(g=>{ const c=g.cs.sort((a,b)=>a.n-b.n); let run=[];
    c.forEach(x=>{ if(run.length&&x.n!==run[run.length-1].n+1) run=[]; run.push(x); if(run.length===5){ out.push({key:g.key,lab:g.lab,cs:run}); run=[]; } }); });
  return out; }
/* 跳出來的時機：沒有別的視窗開著、是粉絲端 */
const lotSeenK=()=>"hc_lot_seen@"+String((session()||{}).email||"").toLowerCase();
const lotRunKey=r=>r.cs.map(c=>c.id).join(",");
function lotCheck(){ try{ const s=session(); if(!s||s.role!=="fan"||sbxOn()||layer.innerHTML||ovl.innerHTML||document.querySelector("textarea:focus,input:focus")) return;
  let seen=[]; try{ seen=JSON.parse(localStorage.getItem(lotSeenK())||"[]"); }catch(e){}
  const r=lotRuns().find(x=>!seen.includes(lotRunKey(x))); if(r){ lazy("lot").then(()=>{ if(!layer.innerHTML) lotRunPop(r); }).catch(()=>{}); return; }
  if(lotReady().length&&!ui.lotClosed) lazy("lot").then(()=>{ if(!layer.innerHTML) lotPop(); }).catch(()=>{}); }catch(e){} }
setInterval(lotCheck,8e3); setTimeout(lotCheck,4e3);
/* 卡冊上面：有連號可以換才出現 */
const lotBanner=()=>{ try{ const n=lotRuns().length; return n?`<button class="lot-bn" data-a="lotRunsOpen"><b>你有 ${n} 組連號可以換扭蛋券</b><i>›</i></button>`:""; }catch(e){ return ""; } };
/* 要用時才載入的程式（同一個倉庫的 lazy/ 資料夾；網址指紋由 build.py 填） */
function lazy(n){ lazy.p=lazy.p||{}; return lazy.p[n]||(lazy.p[n]=new Promise((ok,no)=>{ const s=document.createElement("script"); s.src=(window.LAZY||{})[n]||("lazy/"+n+".js"); s.onload=ok; s.onerror=()=>{ delete lazy.p[n]; toast("沒有連上網路，等一下再試"); no(); }; document.head.appendChild(s); })); }
/* ===== 結帳用折價券：先把折掉的積分補進去再扣，失敗就收回 ===== */
function cpPrice(p){ if(!p) return 0; if(p.kind==="album"){ const a=albumOf(p.aid), v=a&&verOf(a,p.vid); return v?v.pts*(ui.pQty||1):0; } if(p.kind==="ms"){ const x=MS_PLANS.find(z=>z.id===(ui.prodPlan||MS_PLANS[0].id)); return x?x.pts:0; } if(p.kind==="merch"){ const it=MERCH.find(z=>z.k===p.k); return it?it.pts:0; } return 0; }
function cpRow(p){ if(!p||!["album","ms","merch"].includes(p.kind)||p.own) return ""; const L=cpLive(); if(!L.length) return ""; const on=L.find(c=>c.id===ui.pCp), cost=cpPrice(p);
  return `<div class="cp-row"><span>折價券</span>${[`<button class="${on?"":"on"}" data-a="cpPick" data-v="">不使用</button>`,...L.map(c=>`<button class="${on&&on.id===c.id?"on":""}" data-a="cpPick" data-v="${c.id}">${esc(c.n)}</button>`)].join("")}${on?`<small>折後 ${fmt(Math.ceil(cost*on.pay))} 積分</small>`:""}</div>`; }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a;
  if(a==="lotOpen"){ e.stopImmediatePropagation(); ui.lotClosed=0; lazy("lot").then(()=>lotPop()); }
  else if(a==="lotDemo"){ e.stopImmediatePropagation(); lazy("lot").then(()=>lotPop(true)); }
  else if(a==="lotRunsOpen"){ e.stopImmediatePropagation(); const r=lotRuns()[0]; if(r) lazy("lot").then(()=>lotRunPop(r)); }
  else if(a==="cpPick"){ e.stopImmediatePropagation(); ui.pCp=t.dataset.v||""; if(ui.prod) openProd(ui.prod); }
  else if(a==="pBuy"&&ui.pCp){ const p=prodBy(t.dataset.v), c=cpLive().find(x=>x.id===ui.pCp); if(!p||!c||!["album","ms","merch"].includes(p.kind)||isSelfGid(p.gid)) return;
    const cost=cpPrice(p), off=cost-Math.ceil(cost*c.pay), before=points(); S.set(K.points,before+off);
    setTimeout(()=>{ if(points()<before+off){ const C=coupons(), x=C.find(z=>z.id===c.id); if(x){ x.used=Date.now(); x.on=p.name; S.set(K.coupons,C); } ui.pCp=""; toast(`用了${c.n}，省 ${fmt(off)} 積分`); if(ui.prod) openProd(ui.prod); } else S.set(K.points,points()-off); },0); } },true);
