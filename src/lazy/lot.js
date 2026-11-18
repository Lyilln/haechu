/* ===== 連號開獎：要跳出來時才載入（主程式的 lazy("lot")）=====*/
const LOT_PZ=[{k:"p35",n:"積分 +35",pt:35,w:25},{k:"p50",n:"積分 +50",pt:50,w:22},{k:"p75",n:"積分 +75",pt:75,w:18},{k:"p100",n:"積分 +100",pt:100,w:14},{k:"p200",n:"積分 +200",pt:200,w:9},{k:"p500",n:"積分 +500",pt:500,w:5,big:1},
  {k:"tie",n:"TIE 一個月體驗券",w:4,big:1},{k:"c85",n:"8.5 折折價券",w:2.5,big:1},{k:"p1000",n:"積分 +1000",pt:1000,w:.5,big:2}];
const LOT_RANK=["p35","p50","p75","p100","p200","p500","tie","c85","p1000"];
const lotPz=k=>LOT_PZ.find(x=>x.k===k)||LOT_PZ[0];
function lotRedeem(r){ if(!r) return; const tid=uid("lt"), L=getSerials();
  r.cs.forEach(c=>{ const x=(L[c.cid]||[]).find(z=>z.id===c.id); if(x) x.rd=tid; }); S.set(K.serials,L);
  const T=lotTix(); T.push({id:tid,ts:Date.now(),lab:r.lab,ns:r.cs.map(c=>c.n)}); S.set(K.lotTix,T);
  toast(`換到 1 張扭蛋券，${lotWhen(lotNextAt())} 開獎`); }
function lotRoll(){ let r=Math.random()*LOT_PZ.reduce((s,x)=>s+x.w,0); for(const x of LOT_PZ){ r-=x.w; if(r<=0) return x; } return LOT_PZ[0]; }
/* 抽一張券：決定獎品、發獎、記到大家看得到的結果 */
function lotDraw(demo){ const pz=lotRoll(); if(demo) return pz; const t=lotReady()[0]; if(!t) return null; const T=lotTix(), x=T.find(z=>z.id===t.id), now=Date.now(), rd=lotRound(lotOpenAt());
  x.drawn={ts:now,pz:pz.k,r:rd}; S.set(K.lotTix,T);
  if(pz.pt){ S.set(K.points,points()+pz.pt); try{ const lg=S.get(K.earnLog,[])||[], lim=now-60*864e5; lg.push({k:"lot",n:pz.pt,why:"連號開獎",ts:now}); S.set(K.earnLog,lg.filter(z=>z.ts>lim).slice(-600)); }catch(e){} }
  if(pz.k==="tie"){ const V=tvAll(); V.push({id:"tv_lot_"+t.id,from:"連號開獎",days:30,ts:now,exp:now+TV_LIFE}); S.set(K.tieVch,V); }
  if(pz.k==="c85"){ const C=coupons(); C.push({id:"cp_"+t.id,pay:.85,n:"8.5 折折價券",from:"連號開獎",ts:now}); S.set(K.coupons,C); }
  const s=session()||{}, R=S.get(K.lotRes,[])||[]; R.unshift({id:t.id,r:rd,who:(ACCOUNTS[s.email]||{}).name||"粉絲",lab:t.lab,pz:pz.k,ts:now}); S.set(K.lotRes,R.slice(0,400));
  return pz; }
/* ===== 扭蛋機：玻璃罩裡的扭蛋會滾、轉把手機器會晃，轉滿一圈掉一顆出來 ===== */
const GM_C=["#C7AEFF","#F9A8D4","#93E1C6","#FCD98A","#9CC9FF","#B79BFF","#FDB4A0"];
function gmHtml(){ return `<div class="gm-m"><div class="gm-dome"><canvas class="gm-cv" width="440" height="440"></canvas><i class="gm-glare"></i></div>
  <div class="gm-body"><span class="gm-plate">HAECHU</span><button class="gm-knob" aria-label="轉把手"><i class="gm-bar"></i></button><span class="gm-chute"><i></i></span></div><div class="gm-foot"></div></div><div class="gm-out"></div>`; }
function gmMount(host,{can,demo}){ if(!host) return; const cv=host.querySelector(".gm-cv"), ctx=cv.getContext("2d"), W=cv.width, R=W/2-6, br=34, m=host.querySelector(".gm-m"), knob=host.querySelector(".gm-knob"), rm=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const B=Array.from({length:16},(_,i)=>({x:W/2+(Math.random()-.5)*R,y:W/2+Math.random()*R*.6,vx:0,vy:0,c:GM_C[i%GM_C.length],a:Math.random()*6}));
  let shake=0, ang=0, busy=false, raf=0;
  const step=()=>{ if(!cv.isConnected){ cancelAnimationFrame(raf); return; }
    B.forEach(b=>{ b.vy+=.5; if(shake>0){ b.vx+=(Math.random()-.5)*shake; b.vy-=Math.random()*shake*.9; } b.vx*=.985; b.vy*=.985; b.x+=b.vx; b.y+=b.vy; b.a+=b.vx*.03;
      const dx=b.x-W/2, dy=b.y-W/2, d=Math.hypot(dx,dy), lim=R-br; if(d>lim){ const nx=dx/d, ny=dy/d, vn=b.vx*nx+b.vy*ny; b.x=W/2+nx*lim; b.y=W/2+ny*lim; if(vn>0){ b.vx-=1.5*vn*nx; b.vy-=1.5*vn*ny; } } });
    for(let i=0;i<B.length;i++) for(let j=i+1;j<B.length;j++){ const p=B[i], q=B[j], dx=q.x-p.x, dy=q.y-p.y, d=Math.hypot(dx,dy)||.01, o=2*br-d; if(o>0){ const nx=dx/d, ny=dy/d; p.x-=nx*o/2; p.y-=ny*o/2; q.x+=nx*o/2; q.y+=ny*o/2; const rv=(q.vx-p.vx)*nx+(q.vy-p.vy)*ny; if(rv<0){ const k=rv*.6; p.vx+=k*nx; p.vy+=k*ny; q.vx-=k*nx; q.vy-=k*ny; } } }
    shake*=.9; ctx.clearRect(0,0,W,W); B.forEach(b=>gmBall(ctx,b.x,b.y,br,b.c,b.a)); raf=requestAnimationFrame(step); };
  step();
  if(!can) return;
  const wob=v=>{ if(rm) return; m.style.transform=`rotate(${(Math.random()-.5)*v}deg) translateX(${(Math.random()-.5)*v}px)`; clearTimeout(m._t); m._t=setTimeout(()=>{ m.style.transform=""; },140); };
  const setK=a=>{ knob.style.transform=`rotate(${a}deg)`; };
  let last=null, tick=0, moved=0;
  const center=()=>{ const r=knob.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; };
  const turn=d=>{ if(busy||d<=0) return; ang+=d; setK(ang); shake=Math.min(6,shake+d*.08); wob(Math.min(3,d*.15)); const t=Math.floor(ang/90); if(t>tick){ tick=t; sfx("flip"); } if(ang>=360){ busy=true; done(); } };
  knob.addEventListener("pointerdown",e=>{ if(busy) return; e.preventDefault(); knob.setPointerCapture&&knob.setPointerCapture(e.pointerId); const [cx,cy]=center(); last=Math.atan2(e.clientY-cy,e.clientX-cx); moved=0; });
  knob.addEventListener("pointermove",e=>{ if(last==null||busy) return; const [cx,cy]=center(), a=Math.atan2(e.clientY-cy,e.clientX-cx); let d=(a-last)*180/Math.PI; if(d>180) d-=360; if(d<-180) d+=360; last=a; moved+=Math.abs(d); turn(Math.max(0,d)); });
  const up=()=>{ if(last==null) return; last=null; if(busy) return; if(moved<6){ /* 只點一下：自動轉一圈 */ busy=true; const a0=ang, t0=performance.now(); (function f(n){ const k=Math.min(1,(n-t0)/1100), e2=1-Math.pow(1-k,3), a=a0+(360-a0)*e2; shake=Math.min(6,shake+.9); wob(2); setK(a); if(Math.floor(a/90)>tick){ tick=Math.floor(a/90); sfx("flip"); } if(k<1) requestAnimationFrame(f); else { ang=360; done(); } })(t0); } };
  knob.addEventListener("pointerup",up); knob.addEventListener("pointercancel",up);
  function done(){ const pz=lotDraw(demo); if(!pz){ toast("沒有可以轉的券"); return; } shake=8; wob(4); sfx("whoosh");
    const out=host.querySelector(".gm-out"), c=GM_C[Math.random()*GM_C.length|0];
    out.innerHTML=`<button class="gm-cap" style="--c:${c}" aria-label="打開扭蛋"><i class="t"></i><i class="b"></i></button><small class="gm-tap">點扭蛋打開</small>`;
    const cap=out.querySelector(".gm-cap"); requestAnimationFrame(()=>cap.classList.add("in"));
    cap.addEventListener("click",()=>{ if(cap.classList.contains("op")) return; cap.classList.add("op"); sfx("flip"); out.querySelector(".gm-tap").remove();
      setTimeout(()=>{ const r=cap.getBoundingClientRect(); out.insertAdjacentHTML("beforeend",`<div class="gm-pz ${pz.big?"big":""}"><small>${demo?"試轉（不算數）":"恭喜抽到"}</small><b>${esc(pz.n)}</b><button data-a="lotAgain">${demo||lotReady().length?"再轉一次":"好"}</button></div>`);
        if(pz.big&&!rm) confetti(r.left+r.width/2,r.top+r.height/2); },380); },{once:false}); } }
function gmBall(ctx,x,y,r,c,a){ ctx.save(); ctx.translate(x,y); ctx.rotate(a);
  ctx.beginPath(); ctx.arc(0,0,r,Math.PI,0); ctx.closePath(); ctx.fillStyle=c; ctx.fill();
  ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI); ctx.closePath(); ctx.fillStyle="#FBFAFD"; ctx.fill();
  ctx.strokeStyle="rgba(40,20,70,.18)"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,r-1,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-r,0); ctx.lineTo(r,0); ctx.stroke();
  ctx.rotate(-a); ctx.fillStyle="rgba(255,255,255,.55)"; ctx.beginPath(); ctx.ellipse(-r*.38,-r*.42,r*.26,r*.14,-.6,0,Math.PI*2); ctx.fill(); ctx.restore(); }
/* ===== 跳出來的視窗 ===== */
const lotM=t=>{ const d=new Date(t+8*36e5); return d.getUTCMonth()+1; };
/* 湊到連號了：放那 5 張真正的卡面 */
function lotRunPop(r){ ui.lotRun=r; const o=parseIt(r.cs[0].cid), nx=lotNextAt(), n4=n=>String(n).padStart(4,"0");
  setLayer(`<div class="lp-ov" data-a="lotRunNo"><div class="lp-sh" role="dialog" aria-label="湊到連號了"><button class="lp-x" data-a="lotRunNo" aria-label="關閉">✕</button>
    <h2>湊到連號了！</h2><div class="lp-sub">${esc(r.lab)}</div>
    <div class="lp-fan">${r.cs.map((c,i)=>`<span style="transform:rotate(${(i-2)*8}deg) translateY(${Math.abs(i-2)*6}px)">${itemFace(c.cid)}<em>No.${n4(c.n)}</em></span>`).join("")}</div>
    <p>No.${n4(r.cs[0].n)}～${n4(r.cs[4].n)} 可以換 <b>1 張扭蛋券</b><br>${lotWhen(nx)} 開獎</p>
    <div class="lp-bt"><button class="no" data-a="lotRunNo">先不要</button><button class="go" data-a="lotRunGo">換扭蛋券</button></div></div></div>`,"lotrun"); }
/* 扭蛋機：1 號 21:00～24:00 手上有券（demo＝管理員試轉，不算數） */
function lotPop(demo){ const ready=lotReady(), rd=lotRound(lotOpenAt()); ui.lotDemo=!!demo;
  if(!demo&&!ready.length){ layer.innerHTML=""; return; }
  const res=(S.get(K.lotRes,[])||[]).filter(x=>x.r===rd).sort((a,b)=>LOT_RANK.indexOf(b.pz)-LOT_RANK.indexOf(a.pz)||b.ts-a.ts);
  setLayer(`<div class="lp-ov" data-a="lotClose"><div class="lp-sh" role="dialog" aria-label="開獎"><button class="lp-x" data-a="lotClose" aria-label="關閉">✕</button>
    <h2>${demo?"試轉扭蛋機":lotM(lotOpenAt())+" 月開獎"}</h2><div class="lp-sub">${demo?"不算數，不會用掉券、不會發獎":`你有 <b>${ready.length}</b> 張券・今晚 24:00 前轉完`}</div>
    <div class="gm lp-gm" id="gm">${gmHtml()}</div><p class="lp-tip">手指轉一圈把手</p>
    <div class="lp-more"><details><summary>這期大家抽到什麼</summary>${res.length?`<ul class="lot-res">${res.slice(0,60).map(x=>{ const p=lotPz(x.pz); return `<li class="${p.big?"big":""}"><b>${esc(x.who)}</b><span>${esc(p.n)}</span></li>`; }).join("")}</ul>`:`<p class="lot-none">還沒有人轉開</p>`}</details>
    <details><summary>機率</summary><ul class="lp-odds">${LOT_PZ.map(p=>`<li><span>${esc(p.n)}</span><b>${p.w}%</b></li>`).join("")}</ul><p class="lot-none">8.5 折折價券只能用一次、不能轉賣，只能折官方商品。TIE 體驗券用在一位藝人，開通 30 天。沒轉完的券留到下個月 1 號。</p></details></div>
    </div></div>`,"lotpop");
  gmMount(layer.querySelector("#gm"),{can:true,demo}); }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a; if(!/^lot(RunNo|RunGo|Close|Again)$/.test(a)) return;
  if(t.classList.contains("lp-ov")&&e.target!==t) return; e.stopImmediatePropagation();
  if(a==="lotRunNo"||a==="lotRunGo"){ const r=ui.lotRun; if(r){ let seen=[]; try{ seen=JSON.parse(localStorage.getItem(lotSeenK())||"[]"); }catch(_){} seen.push(lotRunKey(r)); try{ localStorage.setItem(lotSeenK(),JSON.stringify(seen.slice(-200))); }catch(_){} }
    layer.innerHTML=""; if(a==="lotRunGo") lotRedeem(r); ui.lotRun=null; try{ render(); }catch(_){} }
  else if(a==="lotClose"){ layer.innerHTML=""; if(!ui.lotDemo) ui.lotClosed=1; try{ render(); }catch(_){} }
  else if(a==="lotAgain"){ if(ui.lotDemo||lotReady().length) lotPop(ui.lotDemo); else { layer.innerHTML=""; try{ render(); }catch(_){} } } });
