/* ===== 11/18 交易市場（常駐功能，管理員開放後入口出現在 FEST 選秀（與大賞）下面；沒開放時只有 HUSSEY 試玩）=====
   ・主程式這邊只放：開放判斷、交割（買家拿卡扣分、賣家收錢、下架退卡、管理員退回）、管理員後台
   ・市集畫面在 lazy/mk.js：點入口時才載入
   ・只用積分買賣，不做卡換卡。賣出收 5% 手續費。藝人不能買賣自己團的卡。序號、「已兌換」標記跟著卡走 */
const MK_MIN=20, MK_MAX=3000, MK_FEE=.05;
const mkOn=()=>!!S.get(K.mkOpen,false);
const mkCan=()=>{ const s=session(); if(!s||s.role!=="fan") return false; return mkOn()||isHussey()||String(s.email||"").toLowerCase()==="husay"; };
const mkAll=()=>(S.get(K.mkList,[])||[]).filter(x=>x&&x.id);
const mkWants=()=>(S.get(K.mkWant,[])||[]).filter(x=>x&&x.id);
const mkMe=()=>String((session()||{}).email||"").toLowerCase();
const mkName=()=>{ const s=session()||{}; return (ACCOUNTS[s.email]||{}).name||"粉絲"; };
const mkGid=cid=>{ const o=parseIt(cid); return o?o.a.gid:""; };
const mkNo=n=>n?"No."+String(n).padStart(4,"0"):"";
const mkLab=cid=>{ const o=parseIt(cid); if(!o) return {who:"",kind:"",alb:""}; const m=MEMBERS[o.p.mid], g=groupOf(o.a.gid)||{}; return {who:m?m.name:g.name||"",grp:g.name||"",kind:o.it.name,alb:o.a.title,sp:!!o.p.sp,rule:o.it.rule||"album"}; };
/* 共用資料用版本號改（跟序號計數器同一招）；fn 回傳 false 代表不用改 */
async function kvCas(k,fn){ for(let i=0;i<6;i++){ const rows=await hbFetch(`/rest/v1/kv?k=eq.${encodeURIComponent(k)}&select=k,v,ver,updated_at`), row=Array.isArray(rows)&&rows[0], v=row?row.v:null, res=fn(v);
    if(res===false) return false; const nv=res.v; let r=null;
    try{ r=row?await hbFetch(`/rest/v1/kv?k=eq.${encodeURIComponent(k)}&ver=eq.${row.ver}`,{method:"PATCH",body:{v:nv},prefer:"return=representation"}):await hbFetch("/rest/v1/kv",{method:"POST",body:{k,v:nv},prefer:"return=representation"}); }
    catch(e){ if(e.status!==409&&!/duplicate/i.test(e.message||"")) throw e; }
    if(Array.isArray(r)&&r[0]){ hbRow(r[0],false); hbWriteLocal(k,r[0].v); return res.out===undefined?true:res.out; } }
  throw new Error("busy"); }
/* 沒連雲端（本機測試）就直接改 */
async function mkEdit(k,fn){ if(HB_ON&&HB.tok) return kvCas(k,fn); const res=fn(S.get(k,null)); if(res===false) return false; S.set(k,res.v); return res.out===undefined?true:res.out; }
/* 從自己手上拿出一張／放回一張 */
function mkTake(cid,sid){ const own=getCards(), L=getSerials(), a=L[cid]||[], i=a.findIndex(x=>x.id===sid); if(i<0||!(own[cid]>0)) return null; const cp=a.splice(i,1)[0]; own[cid]--; if(!own[cid]) delete own[cid]; if(a.length) L[cid]=a; else delete L[cid]; S.set(K.cards,own); S.set(K.serials,L); return cp; }
function mkPut(cid,cp){ const own=getCards(), L=getSerials(), meta=cardMeta(); own[cid]=(own[cid]||0)+1; (L[cid]=L[cid]||[]).push(cp); if(!meta[cid]){ meta[cid]={ts:Date.now(),no:cp.n}; S.set(K.cardMeta,meta); } S.set(K.cards,own); S.set(K.serials,L); }
async function mkOff(id,adm){ try{ await mkEdit(K.mkList,v=>{ const L=Array.isArray(v)?v:[], y=L.find(z=>z.id===id); if(!y||y.st!=="on"||(!adm&&y.by!==mkMe())) return false; Object.assign(y,{st:"off",offTs:Date.now(),offBy:adm?"admin":"me"}); return {v:L}; }); }catch(e){ toast("沒有連上網路"); return; }
  await mkCollect(); toast(adm?"已下架，卡會退回給賣家":"已下架，卡放回你的卡冊"); adm?render():mkPage(); }
async function mkRev(id){ try{ await mkEdit(K.mkList,v=>{ const L=Array.isArray(v)?v:[], y=L.find(z=>z.id===id); if(!y||y.st!=="sold"||y.rv) return false; y.rv=Date.now(); return {v:L}; }); }catch(e){ toast("沒有連上網路"); return; } toast("已退回：買家拿回積分、賣家拿回卡"); render(); }
/* 交割：只處理跟我有關的，先在共用資料上打記號再改自己的東西 */
async function mkCollect(){ if(mkCollect.on) return; const me=mkMe(), s=session(); if(!me||!s||s.role!=="fan"||sbxOn()) return; mkCollect.on=true;
  try{ const flag=(id,f,cond)=>mkEdit(K.mkList,v=>{ const L=Array.isArray(v)?v:[], y=L.find(z=>z.id===id); if(!y||y[f]||!cond(y)) return false; y[f]=Date.now(); return {v:L}; });
    for(const x of mkAll()){
      if(x.buyer===me&&x.st==="sold"&&!x.got&&await flag(x.id,"got",y=>y.buyer===me&&!y.rv)){ S.set(K.points,points()-x.price); mkPut(x.cid,x.cp); }
      if(x.by===me&&x.st==="sold"&&!x.paid&&await flag(x.id,"paid",y=>y.st==="sold"&&!y.rv)){ const n=Math.floor(x.price*(1-MK_FEE)); S.set(K.points,points()+n); const N=S.get(K.notifs,[]); N.unshift({id:"n"+Date.now(),kind:"core",direct:true,text:`你在交易市場賣出 ${mkLab(x.cid).who} ${mkLab(x.cid).kind} ${mkNo(x.cp.n)}，入帳 ${fmt(n)} 積分（扣 5% 手續費）`,ts:Date.now()}); S.set(K.notifs,N); }
      if(x.rv&&x.by===me&&!x.paid&&!x.back&&await flag(x.id,"back",y=>!!y.rv&&!y.paid)) mkPut(x.cid,x.cp);   /* 賣家還沒收錢就被退回：卡直接還他 */
      if(x.by===me&&x.st==="off"&&!x.back&&await flag(x.id,"back",y=>y.st==="off")) mkPut(x.cid,x.cp);
      if(x.rv&&x.buyer===me&&x.got&&!x.bRv&&await flag(x.id,"bRv",y=>!!y.rv)){ S.set(K.points,points()+x.price); const c=(getSerials()[x.cid]||[]).find(z=>z.id===x.cp.id); if(c) mkTake(x.cid,c.id); }
      if(x.rv&&x.by===me&&x.paid&&!x.sRv&&await flag(x.id,"sRv",y=>!!y.rv)){ S.set(K.points,points()-Math.floor(x.price*(1-MK_FEE))); mkPut(x.cid,x.cp); }
    } }catch(e){} finally{ mkCollect.on=false; } }
setInterval(()=>{ if(mkMe()&&mkAll().some(x=>x.by===mkMe()||x.buyer===mkMe())) mkCollect(); },20e3);
/* 管理員（選秀後台下面）：開關＋全部交易紀錄，可以下架、退回 */
function mkAdminHtml(){ const L=mkAll(), sold=L.filter(x=>x.st==="sold").sort((a,b)=>(b.soldTs||0)-(a.soldTs||0)), on=L.filter(x=>x.st==="on");
  return `<section class="card studio"><div class="foc-cfg-h"><h3>連號開獎・扭蛋機</h3></div><p class="reach">平常不會出現。粉絲湊到 5 張連號時跳出「湊到連號了」；每月 1 號 21:00～24:00 手上有券時扭蛋機跳出來。這裡可以試轉看效果（不算數）。</p><div class="ls-btns"><button class="btn btn-soft" data-a="lotDemo">試轉扭蛋機</button></div></section>
<section class="card studio"><div class="foc-cfg-h"><h3>交易市場</h3><span class="badge">${mkOn()?"開放中":"未開放"}</span></div><p class="reach">粉絲之間用積分買賣小卡，賣出扣 5% 手續費，價格 ${MK_MIN}～${fmt(MK_MAX)} 積分，藝人不能買賣自己團的卡。沒開放時只有 HUSSEY 看得到（試玩）。</p>
    <div class="ls-btns"><button class="btn ${mkOn()?"btn-soft":"btn-main"}" data-a="mkToggle">${mkOn()?"關閉交易市場":"開放交易市場"}</button></div>
    <div class="mu5-st" style="margin-top:16px">上架中（${on.length}）</div>${on.length?`<ul class="tm-adm">${on.slice(0,50).map(x=>{ const l=mkLab(x.cid); return `<li><span><b>${esc(x.byN||x.by)}</b>・${esc(l.who)} ${esc(l.kind)} ${mkNo(x.cp.n)}・${fmt(x.price)}</span><button class="btn btn-soft" data-a="mkAdmOff" data-v="${x.id}">下架</button></li>`; }).join("")}</ul>`:`<p class="reach">沒有</p>`}
    <div class="mu5-st" style="margin-top:16px">交易紀錄（${sold.length}）</div>${sold.length?`<ul class="tm-adm">${sold.slice(0,100).map(x=>{ const l=mkLab(x.cid); return `<li><span>${ymd(x.soldTs)}・<b>${esc(x.byN||x.by)}</b> → <b>${esc(x.buyerN||x.buyer)}</b>・${esc(l.who)} ${esc(l.kind)} ${mkNo(x.cp.n)}・${fmt(x.price)} 積分</span>${x.rv?`<em>已退回</em>`:`<button class="btn btn-soft" data-a="mkAdmRev" data-v="${x.id}">退回</button>`}</li>`; }).join("")}</ul>`:`<p class="reach">還沒有交易</p>`}</section>`; }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a, v=t.dataset.v;
  if(!["mkOpen","mkToggle","mkAdmOff","mkAdmRev"].includes(a)) return; e.stopImmediatePropagation();
  if(a==="mkOpen"){ ui.mkTab=ui.mkTab||"mkt"; lazy("mk").then(()=>{ mkPage(); mkCollect().then(()=>{ if(layer.querySelector(".tm")) mkPage(); }); }).catch(()=>{}); }
  else if(a==="mkToggle"){ S.set(K.mkOpen,!mkOn()); toast(mkOn()?"交易市場開放了，粉絲在 FEST 看得到":"交易市場關閉了"); render(); }
  else if(a==="mkAdmOff") mkOff(v,1); else if(a==="mkAdmRev") mkRev(v); });
