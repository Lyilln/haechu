/* ===== 11/18 小卡卡況：廠損、多次拿出來看會磨損、卡套保護 =====
   卡況記在每一張卡的序號那筆上（K.serials 的 {id,n,ts,c}）：c={lv,d:[瑕疵],sl}；沒有 c＝全新、沒套卡套。
   ・廠損：拿到新卡時 8% 機率（印刷線、裁切偏移、小凹痕）→ 一拿到就是「近全新」。這個版本之前拿到的卡都算全新。
   ・磨損：點開看大圖時，沒套卡套 3%、軟卡套 1%、硬殼卡套 0% 機率降一級；同一張一天最多一次。
   ・卡套：在大圖按「套卡套」，用積分買了直接套上（軟 5、硬殼 20），可以拿掉。
   ・賣到市場：整筆跟著卡走，買的人看得到卡況。 */
const COND_N=["全新","近全新","輕微使用","明顯使用","嚴重損傷"];
const COND_F=["印刷線","裁切偏移","小凹痕"], COND_W=["右下角白邊","左上角白邊","邊緣磨損","表面刮痕","卡角凹折","輕微彎折"];
const SLV={1:{n:"軟卡套",p:5,odd:.01,pk:10,pp:50},2:{n:"硬殼卡套",p:20,odd:0,pk:5,pp:100}};   /* 在 SHOP 一包一包買（軟 10 入 50、硬殼 5 入 100），存在自己的庫存；硬殼裡面已經含一層軟卡套 */
const SLK=()=>acK("daisuki_slv_inv"), slvInv=()=>({1:0,2:0,...(S.get(SLK(),{})||{})}), slvSet=v=>S.set(SLK(),v);   /* 真的硬殼卡套不能直接放卡（裡面硬、會刮傷），一定先套一層軟卡套 */
const condOf=cp=>(cp&&cp.c)||{lv:0,d:[],sl:0};
/* 新拿到的一張：8% 廠損 */
const condNew=()=>Math.random()<.08?{c:{lv:1,d:[COND_F[Math.random()*COND_F.length|0]],sl:0}}:{};
const condCp=(cid,sid)=>(getSerials()[cid]||[]).find(x=>x.id===sid)||null;
/* 點開看：可能磨損一級 */
function condWear(cid,sid){ const L=getSerials(), cp=(L[cid]||[]).find(x=>x.id===sid); if(!cp) return null; const c={lv:0,d:[],sl:0,...(cp.c||{})}, day=ymd(Date.now());
  if(c.lv>=4||c.wd===day) return null; const odd=c.sl&&!c.out?SLV[c.sl].odd:.03;   /* 拿出卡套的卡＝裸卡 */ if(Math.random()>=odd) return null;
  const pool=COND_W.filter(x=>!c.d.includes(x)&&(c.lv>=2||x!=="輕微彎折")), w=pool[Math.random()*pool.length|0]||COND_W[0];
  c.lv++; c.d=[...c.d,w]; c.wd=day; cp.c=c; S.set(K.serials,L); return w; }
function condTxt(cid,sid){ const cp=condCp(cid,sid); if(!cp) return ""; const c=condOf(cp);
  return `<small class="cv-cond l${c.lv}">卡況：<b>${COND_N[c.lv]}</b>${c.d.length?`（${c.d.map(esc).join("、")}）`:""}${c.sl&&!c.out?`・${SLV[c.sl].n}`:"・沒套卡套"}</small>`; }
/* 卡冊、市場的卡面：畫上瑕疵 */
function condFx(cp){ const c=condOf(cp); if(!c.lv&&!c.sl) return ""; const D=c.d||[], k=[];
  if(D.some(x=>/白邊|磨損/.test(x))) k.push("edge"); if(D.includes("表面刮痕")) k.push("scr"); if(D.some(x=>/凹/.test(x))) k.push("dent"); if(D.includes("印刷線")) k.push("pl"); if(D.includes("裁切偏移")) k.push("cut"); if(D.includes("輕微彎折")) k.push("bend");
  return `<i class="pcw ${k.join(" ")} l${c.lv}"></i>${c.sl&&!c.out?`<i class="pcs s${c.sl}"></i>`:""}`; }
/* 大圖下面：軟卡套／硬殼卡套兩個切換鈕。點一下套上（從庫存拿一個），再點一下拿出來（卡套收回庫存）；庫存都沒有就「去 SHOP 買卡套」 */
function condBtns(cid,sid){ const c=condOf(condCp(cid,sid)), I=slvInv(), on=c.out?0:c.sl;
  if(!on&&!I[1]&&!I[2]) return `<button class="btn btn-soft btn-sm" data-a="slvGoShop">去 SHOP 買卡套</button>`;
  return [1,2].map(k=>`<button class="cv-slt ${on===k?"on":""}" data-a="condTg" data-v="${cid}" data-s="${sid}" data-k="${k}" ${on!==k&&!I[k]?"disabled":""}><b>${SLV[k].n}</b><small>${on===k?"套著・點一下拿出來":I[k]?`點一下套上・剩 ${I[k]}`:"庫存沒有"}</small></button>`).join(""); }
function condTgGo(cid,sid,k,btn){ if(condTgGo.on) return; const L=getSerials(), cp=(L[cid]||[]).find(x=>x.id===sid); if(!cp) return; const I=slvInv(), c={lv:0,d:[],...(cp.c||{})}, on=c.out?0:c.sl;
  if(on===k){ /* 拿出來：播滑出來的動畫，卡套收回庫存 */ condTgGo.on=1; if(btn) btn.disabled=true;
    const fin=()=>{ condTgGo.on=0; I[k]=(I[k]||0)+1; slvSet(I); cp.c={...c,sl:0,out:0}; S.set(K.serials,L); condTileUp(cid,sid); const v=layer.querySelector(".cv-cond"); if(v) v.outerHTML=condTxt(cid,sid); const b=layer.querySelector(".cv-btns"); if(b) b.innerHTML=condBtns(cid,sid); };
    if(ui.s3&&ui.s3.slide){ ui.s3.slide(true,fin); return; }
    const f=layer.querySelector(".s3-f"), o=layer.querySelector(".s3-obj"), p=f&&f.querySelector(".pcs"); if(o) o.classList.add("cso"); if(p){ p.style.transition="opacity .6s"; setTimeout(()=>{ p.style.opacity=0; },800); }
    setTimeout(()=>{ if(o) o.classList.remove("cso"); if(p) p.remove(); fin(); },1500); return; }
  if(!(I[k]>0)) return; if(c.sl){ I[c.sl]=(I[c.sl]||0)+1; } I[k]--;   /* 原本卡上有（含舊版「拿出來」放旁邊的）卡套 → 先收回庫存 */ slvSet(I); cp.c={...c,sl:k,out:0}; S.set(K.serials,L); condTileUp(cid,sid); ui.c3In=1; ui.cvSid=sid; openItemView(cid); }
/* 卡冊後面那一格也要跟著換（大圖是蓋在卡冊上面的，關掉後不會重畫） */
function condTileUp(cid,sid){ try{ const cp=condCp(cid,sid); document.querySelectorAll(`.cb-it[data-s="${sid}"]`).forEach(el=>{ const c=condOf(cp); el.querySelectorAll(".pcw,.pcs").forEach(x=>x.remove()); el.classList.remove("slv","sl1","sl2"); if(c.sl&&!c.out) el.classList.add("slv","sl"+c.sl); el.insertAdjacentHTML("beforeend",condFx(cp)); }); }catch(e){} }
/* SHOP：收藏用品（卡套） */
function slvShopHtml(){ const I=slvInv();
  return `<section class="slv-shop" id="slvShop"><h2>收藏用品</h2><p>小卡拿出來看會磨損，套上卡套就安全了。買了放在你的庫存，在卡冊點開小卡就能套。</p>
    ${[1,2].map(k=>`<div class="slv-it"><span class="slv-pic k${k}"><i></i></span><span class="slv-b"><b>${SLV[k].n}・${SLV[k].pk} 入</b><small>${k===1?"貼身透明袋（58×89mm），上面開口；拿出來看的磨損機率降到 1%":"硬塑膠殼，裡面已經套好一層軟卡套；不會再磨損"}</small><em>庫存 ${I[k]} 個</em></span><button class="btn btn-main btn-sm" data-a="slvBuy" data-k="${k}">${SLV[k].pp} 積分</button></div>`).join("")}</section>`; }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="condTg"],[data-a="slvBuy"],[data-a="slvGoShop"]'); if(!t) return; e.stopImmediatePropagation(); const a=t.dataset.a;
  if(a==="condTg"){ condTgGo(t.dataset.v,t.dataset.s,+t.dataset.k,t); return; }
  if(a==="slvBuy"){ const k=+t.dataset.k, P=SLV[k]; if(points()<P.pp){ toast("積分不夠"); return; } S.set(K.points,points()-P.pp); const I=slvInv(); I[k]=(I[k]||0)+P.pk; slvSet(I); toast(`買了${P.n} ${P.pk} 個，到卡冊點開小卡就能套`); const y=window.scrollY; render(); window.scrollTo(0,y); return; }
  if(a==="slvGoShop"){ layer.innerHTML=""; ui.shopG=null; ui.prod=null; go("fan",null,"shop"); setTimeout(()=>{ const el=document.getElementById("slvShop"); if(el) el.scrollIntoView({block:"center"}); },400); return; }
  },true);
/* 11/18 舊的公放卡（分節目之前發的）搬進各節目：照「哪個節目拿到的」紀錄（K.mcGot：週|節目|團）放回那個節目；
   對不到的就照順序分到各節目。序號在新的節目系列裡重抽，卡況、卡套跟著走。每個人只跑一次。 */
function mcMigrate(){ try{ const s=session(); if(!s||s.role!=="fan"||S.get(acK("daisuki_mc_mig"),0)) return false; const own=getCards(), L=getSerials(), got=S.get(K.mcGot,{})||{}; let ch=false;
  Object.keys(own).forEach(cid=>{ const o=String(cid).startsWith("it|")&&parseIt(cid); if(!o||o.it.rule!=="mc"||o.it.show) return; const gid=o.a.gid, m=o.p.mid||"g", n=own[cid]|0; if(!n) return;
    const sh=Object.entries(got).filter(([k])=>k.endsWith("|"+gid)&&SHOWS.some(x=>k.split("|")[1]===x.id)).sort((a,b)=>a[1]-b[1]).map(([k])=>k.split("|")[1]);
    const cps=(L[cid]||[]).slice(0,n); while(cps.length<n) cps.push({id:uid("s"),n:null,ts:Date.now()});
    cps.forEach((cp,i)=>{ const so=sh[i]||SHOWS[i%SHOWS.length].id, nc=`it|mc_${gid}|mc_${so}|${m}_${so}`; own[nc]=(own[nc]||0)+1; (L[nc]=L[nc]||[]).push({...cp,n:null}); });
    delete own[cid]; delete L[cid]; ch=true; });
  if(ch){ S.set(K.cards,own); S.set(K.serials,L); } S.set(acK("daisuki_mc_mig"),1); return ch; }catch(e){ return false; } }
