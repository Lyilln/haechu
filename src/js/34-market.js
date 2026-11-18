/* ===== 11/18 交易市場（FEST → 選秀下面）：先做好藏起來，管理員在「選秀」後台打開才開放；HUSSEY 帳號一直看得到（試玩） =====
   ・只用積分買賣，不做卡換卡。賣出收 5% 手續費。價格上下限 MK_MIN～MK_MAX。
   ・藝人不能買賣自己團的卡。卡上的序號、「已兌換」標記跟著卡走。
   ・上架＝卡先從賣家手上拿出來放進市場（K.mkList，大家共用）；買家用版本號搶（不會兩個人買到同一張）。
   ・錢和卡的交割由各自的手機做（mkCollect）：買家拿卡扣分、賣家收錢、下架退卡、管理員退回交易都在這裡處理，每一步都有記號，不會重複。
   ・收卡（K.mkWant）：「我在找 ○○」，大家看得到；有人上架那張卡會顯示。 */
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
async function mkSell(cid,sid,price){ price=Math.round(+price||0); if(isSelfGid(mkGid(cid))){ toast("不能賣自己團的卡"); return; } if(price<MK_MIN||price>MK_MAX){ toast(`價格要在 ${MK_MIN}～${fmt(MK_MAX)} 積分之間`); return; }
  const cp=(getSerials()[cid]||[]).find(x=>x.id===sid); if(!cp||!cp.n){ toast("這張卡的序號還在產生中，等一下再上架"); return; }
  const it={id:uid("mk"),cid,cp:{...cp},price,by:mkMe(),byN:mkName(),ts:Date.now(),st:"on"};
  try{ mkTake(cid,sid); await mkEdit(K.mkList,v=>({v:[it,...(Array.isArray(v)?v:[])].slice(0,800)})); toast("上架了"); }catch(e){ mkPut(cid,cp); toast("沒有連上網路，卡已經放回去了"); }
  ui.mkSell=null; mkPage(); }
async function mkBuy(id){ const x=mkAll().find(z=>z.id===id); if(!x||x.st!=="on") { toast("這張已經被買走了"); mkPage(); return; }
  if(x.by===mkMe()){ toast("這是你自己上架的"); return; } if(isSelfGid(mkGid(x.cid))){ toast("不能買自己團的卡"); return; } if(points()<x.price){ toast(`積分不夠，要 ${fmt(x.price)} 積分`); return; }
  let ok=false; try{ ok=await mkEdit(K.mkList,v=>{ const L=Array.isArray(v)?v:[], y=L.find(z=>z.id===id); if(!y||y.st!=="on") return false; Object.assign(y,{st:"sold",buyer:mkMe(),buyerN:mkName(),soldTs:Date.now()}); return {v:L}; }); }catch(e){ toast("沒有連上網路，等一下再買"); return; }
  if(!ok){ toast("慢了一步，這張已經被買走了"); mkPage(); return; }
  await mkCollect(); ui.mkView=null; toast(`買到了！${mkNo(x.cp.n)} 收進卡冊`); mkPage(); }
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
/* 這張上架的卡能不能接上我手上的連號（同一個系列，號碼差 1～4） */
function mkFits(x){ const kd=serKind(x.cid); if(!kd||!x.cp.n) return false; const o=parseIt(x.cid), key=kd.o||(kd.r+"|"+(o?o.p.mid:"")), L=getSerials();
  return Object.keys(L).some(cid=>{ const k2=serKind(cid); if(!k2) return false; const o2=parseIt(cid); if((k2.o||(k2.r+"|"+(o2?o2.p.mid:"")))!==key) return false; return L[cid].some(c=>c.n&&!c.rd&&Math.abs(c.n-x.cp.n)>=1&&Math.abs(c.n-x.cp.n)<=4); }); }
/* ===== 畫面 ===== */
const MK_KIND=[["","全部"],["mc","公放卡"],["fs","簽售卡"],["ex","特典"],["album","專輯小卡"]];
const mkKindOk=(cid,k)=>{ if(!k) return true; const r=mkLab(cid).rule; return k==="ex"?(r==="pob"||r==="ld"):r===k; };
function mkTile(x,mine){ const l=mkLab(x.cid), fit=!mine&&mkFits(x); return `<button class="tm-t" data-a="mkView" data-v="${x.id}"><div class="tm-f">${itemFace(x.cid)}</div><b>${esc(l.who)}</b><small>${esc(l.kind)}・${mkNo(x.cp.n)}${x.cp.rd?"・已兌換":""}</small>${fit?`<em class="tm-fit">能接你的連號</em>`:""}<span class="tm-p">${fmt(x.price)} 積分</span></button>`; }
function mkPage(){ if(!mkCan()){ toast("交易市場還沒開放"); return; } const tab=ui.mkTab||"mkt", me=mkMe(), q=String(ui.mkQ||"").trim().toLowerCase(), kd=ui.mkK||"", L=mkAll();
  const head=`<header class="tiei-top"><button class="icon-btn" data-a="tCloseLayer" aria-label="返回">${I.back}</button><b>交易市場</b><span class="sh-sp"></span></header>
    ${mkOn()?"":`<p class="tm-pre">還沒開放，只有你看得到（試玩）。這裡的買賣是真的會扣積分、移動卡片。</p>`}
    <nav class="tm-tabs">${[["mkt","市集"],["want","收卡"],["mine","我的"],["log","紀錄"]].map(([k,n])=>`<button class="${tab===k?"on":""}" data-a="mkTab" data-v="${k}">${n}</button>`).join("")}</nav>`;
  let body="";
  if(tab==="mkt"){ const on=L.filter(x=>x.st==="on"&&x.by!==me).filter(x=>{ const l=mkLab(x.cid); if(!mkKindOk(x.cid,kd)) return false; if(ui.mkSp&&!l.sp) return false; if(ui.mkFit&&!mkFits(x)) return false; return !q||[l.who,l.grp,l.kind,l.alb].join(" ").toLowerCase().includes(q); }).sort((a,b)=>b.ts-a.ts);
    body=`<div class="tm-flt"><input class="tm-q" id="mkQ" type="search" placeholder="搜尋藝人、團名、專輯" value="${esc(ui.mkQ||"")}"><div class="tm-chips">${MK_KIND.map(([k,n])=>`<button class="${kd===k?"on":""}" data-a="mkK" data-v="${k}">${n}</button>`).join("")}<button class="${ui.mkSp?"on":""}" data-a="mkSp">貴卡</button><button class="${ui.mkFit?"on":""}" data-a="mkFit">能接我的連號</button></div></div>
      ${on.length?`<div class="tm-wall">${on.map(x=>mkTile(x)).join("")}</div>`:`<p class="tm-none">${L.some(x=>x.st==="on"&&x.by!==me)?"沒有符合的卡":"市集上還沒有卡"}</p>`}`; }
  else if(tab==="want"){ const W=mkWants().sort((a,b)=>b.ts-a.ts);
    body=`<button class="tm-add" data-a="mkWantPick">＋ 我在找…</button>${W.length?`<div class="tm-list">${W.map(w=>{ const l=mkLab(w.cid), n=L.filter(x=>x.st==="on"&&x.cid===w.cid).length; return `<div class="tm-row"><div class="tm-sf">${itemFace(w.cid)}</div><span><b>${esc(l.who)} ${esc(l.kind)}</b><small>${esc(w.byN||"")} 在找${w.max?`・最多出 ${fmt(w.max)} 積分`:""}${n?`・市集上有 ${n} 張`:""}</small></span>${w.by===me?`<button class="tm-sb" data-a="mkWantDel" data-v="${w.id}">取消</button>`:n?`<button class="tm-sb" data-a="mkFind" data-v="${w.cid}">去看</button>`:(getCards()[w.cid]?`<button class="tm-sb" data-a="mkSellPick" data-v="${w.cid}">我有，上架</button>`:"")}</div>`; }).join("")}</div>`:`<p class="tm-none">還沒有人在收卡。想湊連號或畢業缺哪張，就貼出來找。</p>`}`; }
  else if(tab==="mine"){ const on=L.filter(x=>x.st==="on"&&x.by===me), own=getCards(), S2=getSerials(), cs=Object.keys(own).filter(c=>c.startsWith("it|")&&parseIt(c)&&!isSelfGid(mkGid(c))&&(S2[c]||[]).some(z=>z.n));
    body=`<section class="tm-sec"><h3>上架中</h3>${on.length?`<div class="tm-wall">${on.map(x=>mkTile(x,1)).join("")}</div>`:`<p class="tm-none">還沒有上架的卡</p>`}</section>
      <section class="tm-sec"><h3>上架一張卡</h3><p class="tm-none">賣出會扣 5% 手續費，價格 ${MK_MIN}～${fmt(MK_MAX)} 積分。</p>${cs.length?`<div class="tm-list">${cs.map(c=>{ const l=mkLab(c), w=mkWants().filter(z=>z.cid===c&&z.by!==me).length; return `<button class="tm-row" data-a="mkSellPick" data-v="${c}"><div class="tm-sf">${itemFace(c)}</div><span><b>${esc(l.who)} ${esc(l.kind)}</b><small>${esc(l.alb)}・擁有 ${own[c]} 張${w?`・${w} 人在找`:""}</small></span><i>›</i></button>`; }).join("")}</div>`:`<p class="tm-none">卡冊裡還沒有可以賣的卡</p>`}</section>`; }
  else { const H=L.filter(x=>(x.st==="sold"&&(x.by===me||x.buyer===me))).sort((a,b)=>(b.soldTs||0)-(a.soldTs||0));
    body=H.length?`<div class="tm-list">${H.map(x=>{ const l=mkLab(x.cid), sold=x.by===me; return `<div class="tm-row"><div class="tm-sf">${itemFace(x.cid)}</div><span><b>${sold?"賣出":"買入"}・${esc(l.who)} ${esc(l.kind)} ${mkNo(x.cp.n)}</b><small>${ymd(x.soldTs)}・${sold?`給 ${esc(x.buyerN||"")}・入帳 ${fmt(Math.floor(x.price*(1-MK_FEE)))}`:`向 ${esc(x.byN||"")}・${fmt(x.price)}`} 積分${x.rv?"・已被管理員退回":""}</small></span></div>`; }).join("")}</div>`:`<p class="tm-none">還沒有交易紀錄</p>`; }
  setLayer(`<div class="tiei tm" role="dialog" aria-label="交易市場">${head}<div class="tiei-body">${body}</div></div>`,"mk");
  const qi=layer.querySelector("#mkQ"); if(qi){ qi.addEventListener("input",()=>{ ui.mkQ=qi.value; clearTimeout(qi._t); qi._t=setTimeout(()=>{ const p=qi.selectionStart; mkPage(); const n=layer.querySelector("#mkQ"); if(n){ n.focus(); try{ n.setSelectionRange(p,p); }catch(e){} } },350); }); } }
function mkSheet(html){ ovl.innerHTML=`<div class="tm-ov" data-a="mkClose"><div class="tm-sh" role="dialog">${html}</div></div>`; }
function mkView(id){ const x=mkAll().find(z=>z.id===id); if(!x) return; const l=mkLab(x.cid), mine=x.by===mkMe();
  mkSheet(`<div class="tm-big">${itemFace(x.cid,{big:true})}</div><b class="tm-sh-t">${esc(l.who)}・${esc(l.kind)}</b><small class="tm-sh-s">${esc(l.grp)}《${esc(l.alb)}》・${mkNo(x.cp.n)}${l.sp?"・貴卡":""}${x.cp.rd?"・已兌換（不能再拿去抽）":""}</small><small class="tm-sh-s">賣家 ${esc(x.byN||"")}</small>
    <div class="tm-sh-b">${mine?`<button class="tm-go soft" data-a="mkOff" data-v="${x.id}">下架</button>`:`<button class="tm-go" data-a="mkBuy" data-v="${x.id}">用 ${fmt(x.price)} 積分買下</button>`}<button class="tm-go soft" data-a="mkClose">取消</button></div>`); }
function mkSellPick(cid){ const a=(getSerials()[cid]||[]).filter(z=>z.n).sort((p,q)=>p.n-q.n), l=mkLab(cid); if(!a.length) return; const sid=ui.mkSid&&a.some(z=>z.id===ui.mkSid)?ui.mkSid:a[0].id;
  mkSheet(`<div class="tm-big">${itemFace(cid,{big:true})}</div><b class="tm-sh-t">${esc(l.who)}・${esc(l.kind)}</b>${a.length>1?`<div class="tm-chips c">${a.map(z=>`<button class="${z.id===sid?"on":""}" data-a="mkSid" data-v="${z.id}" data-c="${cid}">${mkNo(z.n)}${z.rd?"（已兌換）":""}</button>`).join("")}</div>`:`<small class="tm-sh-s">${mkNo(a[0].n)}${a[0].rd?"・已兌換":""}</small>`}
    <label class="tm-pr"><span>價格</span><input id="mkPr" type="number" inputmode="numeric" min="${MK_MIN}" max="${MK_MAX}" placeholder="${MK_MIN}～${MK_MAX}"><span>積分</span></label><small class="tm-sh-s" id="mkNet">賣出扣 5% 手續費</small>
    <div class="tm-sh-b"><button class="tm-go" data-a="mkSellGo" data-v="${cid}" data-s="${sid}">上架</button><button class="tm-go soft" data-a="mkClose">取消</button></div>`);
  const pi=ovl.querySelector("#mkPr"); pi.addEventListener("input",()=>{ const n=Math.round(+pi.value||0); ovl.querySelector("#mkNet").textContent=n?`賣出後你拿到 ${fmt(Math.floor(n*(1-MK_FEE)))} 積分（扣 5% 手續費）`:"賣出扣 5% 手續費"; }); }
function mkWantPick(){ const f=followed(), q=String(ui.mkWq||"").toLowerCase(), C=[]; getAlbums().filter(a=>f.includes(a.gid)&&!isSelfGid(a.gid)).forEach(a=>[...a.vers.flatMap(v=>v.inc),...(a.ex||[])].forEach(it=>(it.pool||[]).forEach(p=>C.push(`it|${a.id}|${it.id}|${p.id}`))));
  f.forEach(g=>{ const m=mcAlb(g); if(m&&!isSelfGid(g)) m.ex[0].pool.forEach(p=>C.push(`it|${m.id}|mc|${p.id}`)); });
  const L=[...new Set(C)].filter(c=>parseIt(c)&&(!q||Object.values(mkLab(c)).join(" ").toLowerCase().includes(q))).slice(0,80);
  mkSheet(`<b class="tm-sh-t">我在找哪一張？</b><input class="tm-q" id="mkWq" type="search" placeholder="搜尋藝人、專輯" value="${esc(ui.mkWq||"")}"><div class="tm-list sc">${L.map(c=>{ const l=mkLab(c); return `<button class="tm-row" data-a="mkWantAdd" data-v="${c}"><div class="tm-sf">${itemFace(c)}</div><span><b>${esc(l.who)} ${esc(l.kind)}</b><small>${esc(l.alb)}</small></span></button>`; }).join("")||`<p class="tm-none">追蹤的藝人裡沒有符合的卡</p>`}</div><div class="tm-sh-b"><button class="tm-go soft" data-a="mkClose">取消</button></div>`);
  const qi=ovl.querySelector("#mkWq"); qi.addEventListener("input",()=>{ ui.mkWq=qi.value; clearTimeout(qi._t); qi._t=setTimeout(()=>{ mkWantPick(); const n=ovl.querySelector("#mkWq"); if(n){ n.focus(); const p=n.value.length; try{ n.setSelectionRange(p,p); }catch(e){} } },350); }); }
async function mkWantAdd(cid){ const me=mkMe(); if(mkWants().some(w=>w.by===me&&w.cid===cid)){ toast("你已經在找這張了"); return; }
  const w={id:uid("mw"),cid,by:me,byN:mkName(),ts:Date.now()}; try{ await mkEdit(K.mkWant,v=>({v:[w,...(Array.isArray(v)?v:[])].slice(0,400)})); }catch(e){ toast("沒有連上網路"); return; } ovl.innerHTML=""; ui.mkTab="want"; mkPage(); toast("貼出去了，有人上架會顯示在這裡"); }
async function mkWantDel(id){ try{ await mkEdit(K.mkWant,v=>({v:(Array.isArray(v)?v:[]).filter(w=>!(w.id===id&&w.by===mkMe()))})); }catch(e){ toast("沒有連上網路"); return; } mkPage(); }
/* 管理員（選秀後台下面）：開關＋全部交易紀錄，可以下架、退回 */
function mkAdminHtml(){ const L=mkAll(), sold=L.filter(x=>x.st==="sold").sort((a,b)=>(b.soldTs||0)-(a.soldTs||0)), on=L.filter(x=>x.st==="on");
  return `<section class="card studio"><div class="foc-cfg-h"><h3>交易市場</h3><span class="badge">${mkOn()?"開放中":"未開放"}</span></div><p class="reach">粉絲之間用積分買賣小卡，賣出扣 5% 手續費，價格 ${MK_MIN}～${fmt(MK_MAX)} 積分，藝人不能買賣自己團的卡。沒開放時只有 HUSSEY 看得到（試玩）。</p>
    <div class="ls-btns"><button class="btn ${mkOn()?"btn-soft":"btn-main"}" data-a="mkToggle">${mkOn()?"關閉交易市場":"開放交易市場"}</button></div>
    <div class="mu5-st" style="margin-top:16px">上架中（${on.length}）</div>${on.length?`<ul class="tm-adm">${on.slice(0,50).map(x=>{ const l=mkLab(x.cid); return `<li><span><b>${esc(x.byN||x.by)}</b>・${esc(l.who)} ${esc(l.kind)} ${mkNo(x.cp.n)}・${fmt(x.price)}</span><button class="btn btn-soft" data-a="mkAdmOff" data-v="${x.id}">下架</button></li>`; }).join("")}</ul>`:`<p class="reach">沒有</p>`}
    <div class="mu5-st" style="margin-top:16px">交易紀錄（${sold.length}）</div>${sold.length?`<ul class="tm-adm">${sold.slice(0,100).map(x=>{ const l=mkLab(x.cid); return `<li><span>${ymd(x.soldTs)}・<b>${esc(x.byN||x.by)}</b> → <b>${esc(x.buyerN||x.buyer)}</b>・${esc(l.who)} ${esc(l.kind)} ${mkNo(x.cp.n)}・${fmt(x.price)} 積分</span>${x.rv?`<em>已退回</em>`:`<button class="btn btn-soft" data-a="mkAdmRev" data-v="${x.id}">退回</button>`}</li>`; }).join("")}</ul>`:`<p class="reach">還沒有交易</p>`}</section>`; }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest("[data-a]"); if(!t||!/^mk[A-Z]/.test(t.dataset.a)) return; e.stopImmediatePropagation(); const a=t.dataset.a, v=t.dataset.v;
  if(a==="mkOpen"){ ui.mkTab=ui.mkTab||"mkt"; mkCollect().then(()=>{ if(layer.querySelector(".tm")) mkPage(); }); mkPage(); }
  else if(a==="mkTab"){ ui.mkTab=v; mkPage(); } else if(a==="mkK"){ ui.mkK=v; mkPage(); } else if(a==="mkSp"){ ui.mkSp=!ui.mkSp; mkPage(); } else if(a==="mkFit"){ ui.mkFit=!ui.mkFit; mkPage(); }
  else if(a==="mkView") mkView(v);
  else if(a==="mkClose"){ if(t.classList.contains("tm-ov")&&e.target!==t) return; ovl.innerHTML=""; }
  else if(a==="mkBuy"){ ovl.innerHTML=""; mkBuy(v); } else if(a==="mkOff"){ ovl.innerHTML=""; mkOff(v); }
  else if(a==="mkSellPick"){ ui.mkSid=null; mkSellPick(v); } else if(a==="mkSid"){ ui.mkSid=v; const p=(ovl.querySelector("#mkPr")||{}).value; mkSellPick(t.dataset.c); if(p) ovl.querySelector("#mkPr").value=p; }
  else if(a==="mkSellGo"){ const p=(ovl.querySelector("#mkPr")||{}).value; ovl.innerHTML=""; mkSell(v,t.dataset.s,p); }
  else if(a==="mkWantPick"){ ui.mkWq=""; mkWantPick(); } else if(a==="mkWantAdd") mkWantAdd(v); else if(a==="mkWantDel") mkWantDel(v);
  else if(a==="mkFind"){ ui.mkTab="mkt"; const l=mkLab(v); ui.mkQ=l.who; ui.mkK=""; mkPage(); }
  else if(a==="mkToggle"){ S.set(K.mkOpen,!mkOn()); toast(mkOn()?"交易市場開放了，粉絲在 FEST 看得到":"交易市場關閉了"); render(); }
  else if(a==="mkAdmOff") mkOff(v,1); else if(a==="mkAdmRev") mkRev(v); });
