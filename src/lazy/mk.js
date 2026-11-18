/* ===== 交易市場畫面：點入口時才載入（主程式的 lazy("mk")）=====*/
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
/* 這張上架的卡能不能接上我手上的連號（同一個系列，號碼差 1～4） */
function mkFits(x){ if(!x.cp.n) return false; const key=serKey(x.cid,x.cp); if(!key) return false; const L=getSerials();
  return Object.keys(L).some(cid=>L[cid].some(c=>c.n&&!c.rd&&serKey(cid,c)===key&&Math.abs(c.n-x.cp.n)>=1&&Math.abs(c.n-x.cp.n)<=4)); }
/* ===== 畫面 ===== */
const MK_KIND=[["","全部"],["mc","公放卡"],["fs","簽售卡"],["ex","特典"],["album","專輯小卡"]];
const mkKindOk=(cid,k)=>{ if(!k) return true; const r=mkLab(cid).rule; return k==="ex"?(r==="pob"||r==="ld"):r===k; };
function mkTile(x,mine){ const l=mkLab(x.cid), fit=!mine&&mkFits(x); return `<button class="tm-t" data-a="mkView" data-v="${x.id}"><div class="tm-f">${itemFace(x.cid)}${condFx(x.cp)}</div><b>${esc(l.who)}</b><small>${esc(l.kind)}・${mkNo(x.cp.n)}・${COND_N[condOf(x.cp).lv]}${x.cp.rd?"・已兌換":""}</small>${fit?`<em class="tm-fit">能接你的連號</em>`:""}<span class="tm-p">${fmt(x.price)} 積分</span></button>`; }
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
  mkSheet(`<div class="tm-big">${itemFace(x.cid,{big:true})}${condFx(x.cp)}</div><b class="tm-sh-t">${esc(l.who)}・${esc(l.kind)}</b><small class="tm-sh-s">${esc(l.grp)}《${esc(l.alb)}》・${mkNo(x.cp.n)}${l.sp?"・貴卡":""}・卡況 ${COND_N[condOf(x.cp).lv]}${condOf(x.cp).d.length?"（"+condOf(x.cp).d.map(esc).join("、")+"）":""}${x.cp.rd?"・已兌換（不能再拿去抽）":""}</small><small class="tm-sh-s">賣家 ${esc(x.byN||"")}</small>
    <div class="tm-sh-b">${mine?`<button class="tm-go soft" data-a="mkOff" data-v="${x.id}">下架</button>`:`<button class="tm-go" data-a="mkBuy" data-v="${x.id}">用 ${fmt(x.price)} 積分買下</button>`}<button class="tm-go soft" data-a="mkClose">取消</button></div>`); }
function mkSellPick(cid){ const a=(getSerials()[cid]||[]).filter(z=>z.n).sort((p,q)=>p.n-q.n), l=mkLab(cid); if(!a.length) return; const sid=ui.mkSid&&a.some(z=>z.id===ui.mkSid)?ui.mkSid:a[0].id;
  mkSheet(`<div class="tm-big">${itemFace(cid,{big:true})}${condFx(a.find(z=>z.id===sid))}</div><b class="tm-sh-t">${esc(l.who)}・${esc(l.kind)}</b>${a.length>1?`<div class="tm-chips c">${a.map(z=>`<button class="${z.id===sid?"on":""}" data-a="mkSid" data-v="${z.id}" data-c="${cid}">${mkNo(z.n)}・${COND_N[condOf(z).lv]}${z.rd?"（已兌換）":""}</button>`).join("")}</div>`:`<small class="tm-sh-s">${mkNo(a[0].n)}・${COND_N[condOf(a[0]).lv]}${a[0].rd?"・已兌換":""}</small>`}<small class="tm-sh-s">卡況會給買家看，可以照卡況訂價</small>
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
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest("[data-a]"); if(!t||!/^mk[A-Z]/.test(t.dataset.a)) return; e.stopImmediatePropagation(); const a=t.dataset.a, v=t.dataset.v;
  if(a==="mkTab"){ ui.mkTab=v; mkPage(); } else if(a==="mkK"){ ui.mkK=v; mkPage(); } else if(a==="mkSp"){ ui.mkSp=!ui.mkSp; mkPage(); } else if(a==="mkFit"){ ui.mkFit=!ui.mkFit; mkPage(); }
  else if(a==="mkView") mkView(v);
  else if(a==="mkClose"){ if(t.classList.contains("tm-ov")&&e.target!==t) return; ovl.innerHTML=""; }
  else if(a==="mkBuy"){ ovl.innerHTML=""; mkBuy(v); } else if(a==="mkOff"){ ovl.innerHTML=""; mkOff(v); }
  else if(a==="mkSellPick"){ ui.mkSid=null; mkSellPick(v); } else if(a==="mkSid"){ ui.mkSid=v; const p=(ovl.querySelector("#mkPr")||{}).value; mkSellPick(t.dataset.c); if(p) ovl.querySelector("#mkPr").value=p; }
  else if(a==="mkSellGo"){ const p=(ovl.querySelector("#mkPr")||{}).value; ovl.innerHTML=""; mkSell(v,t.dataset.s,p); }
  else if(a==="mkWantPick"){ ui.mkWq=""; mkWantPick(); } else if(a==="mkWantAdd") mkWantAdd(v); else if(a==="mkWantDel") mkWantDel(v);
  else if(a==="mkFind"){ ui.mkTab="mkt"; const l=mkLab(v); ui.mkQ=l.who; ui.mkK=""; mkPage(); }
  });

