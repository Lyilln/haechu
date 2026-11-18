/* ===== 11/18 小卡卡況：廠損、多次拿出來看會磨損、卡套保護 =====
   卡況記在每一張卡的序號那筆上（K.serials 的 {id,n,ts,c}）：c={lv,d:[瑕疵],sl}；沒有 c＝全新、沒套卡套。
   ・廠損：拿到新卡時 8% 機率（印刷線、裁切偏移、小凹痕）→ 一拿到就是「近全新」。這個版本之前拿到的卡都算全新。
   ・磨損：點開看大圖時，沒套卡套 3%、軟卡套 1%、硬殼卡套 0% 機率降一級；同一張一天最多一次。
   ・卡套：在大圖按「套卡套」，用積分買了直接套上（軟 5、硬殼 20），可以拿掉。
   ・賣到市場：整筆跟著卡走，買的人看得到卡況。 */
const COND_N=["全新","近全新","輕微使用","明顯使用","嚴重損傷"];
const COND_F=["印刷線","裁切偏移","小凹痕"], COND_W=["右下角白邊","左上角白邊","邊緣磨損","表面刮痕","卡角凹折","輕微彎折"];
const SLV={1:{n:"軟卡套",p:5,odd:.01},2:{n:"硬殼卡套（內含軟卡套）",p:20,odd:0}};   /* 真的硬殼卡套不能直接放卡（裡面硬、會刮傷），一定先套一層軟卡套 */
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
  return `<small class="cv-cond l${c.lv}">卡況：<b>${COND_N[c.lv]}</b>${c.d.length?`（${c.d.map(esc).join("、")}）`:""}${c.sl?(c.out?`・已從${SLV[c.sl].n.replace(/（.*）/,"")}拿出來`:`・${SLV[c.sl].n}`):"・沒套卡套"}</small>`; }
/* 卡冊、市場的卡面：畫上瑕疵 */
function condFx(cp){ const c=condOf(cp); if(!c.lv&&!c.sl) return ""; const D=c.d||[], k=[];
  if(D.some(x=>/白邊|磨損/.test(x))) k.push("edge"); if(D.includes("表面刮痕")) k.push("scr"); if(D.some(x=>/凹/.test(x))) k.push("dent"); if(D.includes("印刷線")) k.push("pl"); if(D.includes("裁切偏移")) k.push("cut"); if(D.includes("輕微彎折")) k.push("bend");
  return `<i class="pcw ${k.join(" ")} l${c.lv}"></i>${c.sl&&!c.out?`<i class="pcs s${c.sl}"></i>`:""}`; }
/* 大圖下面的按鈕：有卡套→拿出來／放回去＋換卡套；沒有→套卡套 */
function condBtns(cid,sid){ const c=condOf(condCp(cid,sid)); return c.sl?`<button class="btn btn-main btn-sm" data-a="condOut" data-v="${cid}" data-s="${sid}">${c.out?"放回卡套":"從卡套拿出來"}</button><button class="btn btn-soft btn-sm" data-a="condSlOpen" data-v="${cid}" data-s="${sid}">換卡套</button>`:`<button class="btn btn-soft btn-sm" data-a="condSlOpen" data-v="${cid}" data-s="${sid}">套卡套</button>`; }
function condOutGo(cid,sid,btn){ const L=getSerials(), cp=(L[cid]||[]).find(x=>x.id===sid); if(!cp||!cp.c||!cp.c.sl) return; if(condOutGo.on) return; condOutGo.on=1; const out=!cp.c.out;
  cp.c={...cp.c,out:out?1:0}; S.set(K.serials,L); if(btn) btn.disabled=true;
  const done=()=>{ condOutGo.on=0; const v=layer.querySelector(".cv-cond"); if(v) v.outerHTML=condTxt(cid,sid); const b=layer.querySelector(".cv-btns"); if(b) b.innerHTML=condBtns(cid,sid); };
  if(ui.s3&&ui.s3.slide){ ui.s3.slide(out,done); return; }
  /* CSS 版（沒有 3D）：卡往上滑出、卡套淡掉；放回去反過來 */
  const f=layer.querySelector(".s3-f"), o=layer.querySelector(".s3-obj"); if(!f||!o){ done(); return; } const c=condOf(cp);
  if(!out&&!f.querySelector(".pcs")) f.insertAdjacentHTML("beforeend",`<i class="pcs s${c.sl}" style="opacity:0"></i>`); const p=f.querySelector(".pcs");
  o.classList.add(out?"cso":"csi"); if(p) p.style.transition="opacity .6s"; setTimeout(()=>{ if(p) p.style.opacity=out?0:1; },out?800:0);
  setTimeout(()=>{ o.classList.remove("cso","csi"); if(out&&p) p.remove(); done(); },1500); }
function condSleeve(cid,sid){ const cp=condCp(cid,sid); if(!cp) return; const c=condOf(cp);
  tieModal("卡套",`<p class="fy-info">軟卡套：貼身的透明袋（58×89mm），上面開口。<br>硬殼卡套：硬塑膠殼，先套軟卡套再放進去，最保護。<br>已經磨損的不會變回來。</p><p class="fy-info">現在：${c.sl?SLV[c.sl].n:"沒套卡套"}・你有 ${fmt(points())} 積分</p>`,
    `${[1,2].map(k=>`<button class="t-mbtn ${k===2?"main":""}" data-a="condSl" data-v="${k}" ${c.sl===k?"disabled":""}>${SLV[k].n}・${SLV[k].p} 積分<small>（磨損機率 ${k===1?"1%":"0%"}）</small></button>`).join("")}${c.sl?`<button class="t-mbtn" data-a="condSl" data-v="0">拿掉卡套</button>`:""}<button class="t-mbtn" data-a="tCloseLayer">取消</button>`);
  ui.condAt={cid,sid}; }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="condSlOpen"],[data-a="condSl"],[data-a="condOut"]'); if(!t) return; e.stopImmediatePropagation();
  if(t.dataset.a==="condOut"){ condOutGo(t.dataset.v,t.dataset.s,t); return; }
  if(t.dataset.a==="condSlOpen"){ condSleeve(t.dataset.v,t.dataset.s); return; }
  const at=ui.condAt||{}, k=+t.dataset.v, L=getSerials(), cp=(L[at.cid]||[]).find(x=>x.id===at.sid); if(!cp) return;
  if(k&&points()<SLV[k].p){ toast("積分不夠"); return; } if(k) S.set(K.points,points()-SLV[k].p);
  cp.c={lv:0,d:[],...(cp.c||{}),sl:k,out:0}; S.set(K.serials,L); layer.innerHTML=""; toast(k?`套上${SLV[k].n}了`:"卡套拿掉了"); ui.cvSid=at.sid; openItemView(at.cid); },true);
/* 11/18 舊的公放卡（分節目之前發的）搬進各節目：照「哪個節目拿到的」紀錄（K.mcGot：週|節目|團）放回那個節目；
   對不到的就照順序分到各節目。序號在新的節目系列裡重抽，卡況、卡套跟著走。每個人只跑一次。 */
function mcMigrate(){ try{ const s=session(); if(!s||s.role!=="fan"||S.get(acK("daisuki_mc_mig"),0)) return false; const own=getCards(), L=getSerials(), got=S.get(K.mcGot,{})||{}; let ch=false;
  Object.keys(own).forEach(cid=>{ const o=String(cid).startsWith("it|")&&parseIt(cid); if(!o||o.it.rule!=="mc"||o.it.show) return; const gid=o.a.gid, m=o.p.mid||"g", n=own[cid]|0; if(!n) return;
    const sh=Object.entries(got).filter(([k])=>k.endsWith("|"+gid)&&SHOWS.some(x=>k.split("|")[1]===x.id)).sort((a,b)=>a[1]-b[1]).map(([k])=>k.split("|")[1]);
    const cps=(L[cid]||[]).slice(0,n); while(cps.length<n) cps.push({id:uid("s"),n:null,ts:Date.now()});
    cps.forEach((cp,i)=>{ const so=sh[i]||SHOWS[i%SHOWS.length].id, nc=`it|mc_${gid}|mc_${so}|${m}_${so}`; own[nc]=(own[nc]||0)+1; (L[nc]=L[nc]||[]).push({...cp,n:null}); });
    delete own[cid]; delete L[cid]; ch=true; });
  if(ch){ S.set(K.cards,own); S.set(K.serials,L); } S.set(acK("daisuki_mc_mig"),1); return ch; }catch(e){ return false; } }
