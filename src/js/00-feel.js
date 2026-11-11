/* HAECHU｜手感（App 和試玩頁共用）：動畫彈簧、按壓回饋、液態玻璃導覽列拖曳、3D 應援棒
   ・試玩頁（try/）用的是當時複製過去的固定版本，這裡改了不會影響試玩
   ・只放不靠 App 資料的東西 */
function newImg(){ const i=new Image(); i.crossOrigin="anonymous"; return i; }
const ZM=()=>parseFloat(document.documentElement.style.zoom)||1;
/* =========================================================
   動態效果（anime.js 4.5，檔案放在 vendor/，不靠外部 CDN）
   ・換頁：彈簧滑入，換分頁時內容一塊一塊浮上來
   ・導覽列鏡片：彈簧滑過去，滑的時候拉長一點（像果凍）
   ・彈窗、底部選單、提示：彈簧彈出
   ・按任何按鈕：按下去縮一點，放開彈回來
   ・按讚：愛心彈一下＋噴小愛心
   anime.js 還沒載好、或手機開了「減少動態效果」：全部照原本的 CSS 動畫，不會壞
   ========================================================= */
var AN={
  rm(){ try{ return matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){ return false; } },
  ok(){ return !!window.anime&&document.documentElement.classList.contains("mo")&&!AN.rm(); },
  sp(b,d){ return anime.spring({bounce:b,duration:d}); },
  clean(t,props){ (t&&t.length!=null?[...t]:[t]).forEach(e=>{ if(e&&e.style) (props||["transform","opacity"]).forEach(p=>e.style.removeProperty(p)); }); },
  run(t,p,props){ try{ return anime.animate(t,{...p,onComplete:()=>AN.clean(t,props)}); }catch(e){ AN.clean(t,props); } },
  /* 換頁 */
  page(app,pa,fixed){ if(!app) return;
    if(fixed||pa==="op") AN.run(app,{opacity:{from:0,to:1,duration:240,ease:"outQuad"}});
    else if(pa==="push"||pa==="pop"){ const s=pa==="push"?1:-1; AN.run(app,{x:{from:34*s,to:0,duration:380,ease:"outBack(1.1)"},opacity:{from:0,to:1,duration:200,ease:"outQuad"}}); }
    else AN.run(app,{opacity:{from:0,to:1,duration:200,ease:"outQuad"}});
    if(!fixed&&(pa==="fade"||pa==="op")) AN.cascade(app);
  },
  /* 換分頁：畫面裡看得到的區塊，一塊接一塊浮上來 */
  cascade(app){ let box=app.querySelector(":scope > main")||app.querySelector("main")||app;
    for(let k=0;k<3&&box.children.length===1;k++) box=box.children[0];
    const H=window.innerHeight; const kids=[...box.children].filter(e=>{ if(e.nodeType!==1) return false; const r=e.getBoundingClientRect(); if(r.height<2||r.top>H||r.bottom<0) return false; const ps=getComputedStyle(e).position; return ps!=="fixed"&&ps!=="sticky"; }).slice(0,10);
    if(kids.length<2) return;
    AN.run(kids,{y:{from:16,to:0,duration:460,ease:"outBack(1.3)"},opacity:{from:0,to:1,duration:260,ease:"outQuad"},delay:anime.stagger(38)});
  },
  /* 導覽列鏡片：從 f 滑到 i */
  lens(L,f,i){ if(!L||!(f>=0)||f===i||!AN.ok()) return false;
    try{ L.style.transition="none"; L.classList.remove("go"); L.classList.add("mo-run");
      anime.animate(L,{ x:{from:f*100+"%",to:i*100+"%",ease:AN.sp(.3,520)},
        scaleX:[{to:1.18,duration:150,ease:"outQuad"},{to:1,ease:AN.sp(.5,460)}],
        scaleY:[{to:1.08,duration:150,ease:"outQuad"},{to:1,ease:AN.sp(.5,460)}],
        onComplete:()=>{ L.style.removeProperty("transform"); L.style.transition=""; L.classList.remove("mo-run"); } });
      return true; }catch(e){ L.style.transition=""; return false; } },
  /* 彈窗、底部選單 */
  SH:".ios-sh,.mu2-sh,.pv-s,.sheet,.t-sheet,.cmx-sh",
  AL:".ios-al,.pv-d,.t-modal",
  pop(n){ if(!AN.ok()||!n||n.nodeType!==1||n.closest(".static")) return;
    const sh=n.matches(AN.SH)?[n]:[...n.querySelectorAll(AN.SH)], al=n.matches(AN.AL)?[n]:[...n.querySelectorAll(AN.AL)];
    sh.forEach(el=>{ el.style.animation="none"; AN.run(el,{y:{from:"100%",to:0,ease:AN.sp(.14,480)}},["transform"]); });
    al.forEach(el=>{ el.style.animation="none"; AN.run(el,{scale:{from:.86,to:1,ease:AN.sp(.38,420)},opacity:{from:0,to:1,duration:160,ease:"outQuad"}}); });
  },
  toastIn(el){ if(!AN.ok()) return; el.style.animation="none"; AN.run(el,{y:{from:18,to:0,ease:AN.sp(.4,460)},scale:{from:.88,to:1,ease:AN.sp(.4,460)},opacity:{from:0,to:1,duration:180,ease:"outQuad"}}); },
  toastOut(el){ if(!AN.ok()){ el.classList.add("out"); setTimeout(()=>el.remove(),260); return; }
    try{ anime.animate(el,{y:{to:8,duration:220,ease:"inQuad"},scale:{to:.94,duration:220,ease:"inQuad"},opacity:{to:0,duration:200,ease:"inQuad"},onComplete:()=>el.remove()}); }catch(e){ el.remove(); } },
  /* 按讚：愛心彈一下＋噴小愛心 */
  /* 小圖示彈一下（收藏、轉發、追蹤…）：先縮再用彈簧彈回來 */
  bounce(t){ if(!t) return; const sv=t.matches&&t.matches("svg")?t:t.querySelector("svg")||t; if(!AN.ok()){ return; } try{ sv.style.animation="none"; anime.animate(sv,{scale:[{to:.78,duration:90,ease:"outQuad"},{to:1,ease:AN.sp(.5,520)}],onComplete:()=>AN.clean(sv,["transform"])}); }catch(e){} },
  heart(t){ if(!AN.ok()||!t) return; const sv=t.querySelector("svg"); if(!sv) return;
    sv.style.animation="none"; anime.animate(sv,{scale:[{to:1.45,duration:130,ease:"outQuad"},{to:1,ease:AN.sp(.62,520)}],onComplete:()=>AN.clean(sv,["transform"])});
    const z=(typeof ZM==="function"?ZM():1)||1, r=sv.getBoundingClientRect(), w=document.createElement("div");
    w.className="an-burst"; w.style.left=(r.left+r.width/2)/z+"px"; w.style.top=(r.top+r.height/2)/z+"px";
    const C=["#FF7DB5","#FFB23F","#B48CFF","#FF9CC8","#8E6BFF","#FFC6E0"], N=7;
    w.innerHTML=Array.from({length:N},(_,k)=>`<i style="color:${C[k%C.length]}"><svg viewBox="0 0 24 24"><path d="M12 21C5 16 2 12 3.5 8 5 4.5 9.5 4 12 7.5 14.5 4 19 4.5 20.5 8 22 12 19 16 12 21Z" fill="currentColor"/></svg></i>`).join("");
    document.body.appendChild(w); const ps=[...w.children];
    try{ anime.animate(ps,{ x:(_,k)=>Math.cos(k/N*Math.PI*2-Math.PI/2)*(26+Math.random()*10), y:(_,k)=>Math.sin(k/N*Math.PI*2-Math.PI/2)*(26+Math.random()*10)-6,
        scale:[{from:0,to:1,duration:180,ease:"outBack"},{to:0,duration:320,delay:120,ease:"inQuad"}], rotate:()=>anime.random(-30,30), duration:620, ease:"outExpo", onComplete:()=>w.remove() }); }catch(e){ w.remove(); }
    setTimeout(()=>w.remove(),1200);
  },
};
/* 觸感回饋（輕震）：Android 用震動；iPhone 的網頁不能直接震，借系統「開關」切換時的觸感（iOS 18 以上，手指點下去的當下才有） */
const hap=(()=>{ let lb=null; return (ms=10)=>{ try{ if(navigator.vibrate&&!/iP(hone|ad|od)/.test(navigator.userAgent)){ navigator.vibrate(ms); return; }
  if(!lb){ const i=document.createElement("input"); i.type="checkbox"; i.setAttribute("switch",""); i.id="hcHap"; i.tabIndex=-1; i.setAttribute("aria-hidden","true"); i.style.cssText="position:fixed;left:-200px;top:0;opacity:0;pointer-events:none";
    lb=document.createElement("label"); lb.htmlFor="hcHap"; lb.setAttribute("aria-hidden","true"); lb.style.cssText="position:fixed;left:-200px;top:0;opacity:0;pointer-events:none"; document.body.append(i,lb); }
  lb.click(); }catch(e){} }; })();
/* 按壓回饋：按下縮一點，放開彈回來（用 CSS 的 scale，不會蓋掉元素原本的 transform） */
(function(){
  const PR="button,.btn,a[href],[data-a]", NO="input,textarea,select,label,[contenteditable],.no-press,.mr,.t-msgs,.ab-w,.gc-rit,.concert,.crp,canvas,.sn-reel1,.pm-car,.gal2,.ios-w,.scrim,.t-modal-w,.t-sheet-w,.mu2-shw,.fg-w,.t-drawer-w>.t-drawer,.nav-lens";
  let cur=null;
  const up=()=>{ const t=cur; cur=null; if(!t) return; try{ anime.animate(t,{"--mp":{to:1,ease:AN.sp(.55,380)},onComplete:()=>{ if(cur!==t){ t.classList.remove("mo-p"); t.style.removeProperty("--mp"); } }}); }catch(e){ t.classList.remove("mo-p"); t.style.removeProperty("--mp"); } };
  document.addEventListener("pointerdown",e=>{ if(!AN.ok()||e.button>0) return; const t=e.target.closest&&e.target.closest(PR); if(!t||t.closest(NO)||t.disabled) return;
    const r=t.getBoundingClientRect(), z=(typeof ZM==="function"?ZM():1)||1, h=r.height/z, w=r.width/z; if(h>220||w<1||(w>360&&h>120)) return;
    cur=t; t.style.setProperty("--mp","1"); t.classList.add("mo-p"); try{ anime.animate(t,{"--mp":{to:t.closest(".nav-in")?.86:(h<60&&w<120?.9:.96),duration:110,ease:"outQuad"}}); }catch(e){} },{passive:true,capture:true});
  document.addEventListener("pointerup",up,true); document.addEventListener("pointercancel",up,true);
  document.addEventListener("pointermove",e=>{ if(cur&&e.pointerType!=="mouse"&&Math.abs(e.movementY||0)>6) up(); },{passive:true});
})();
/* 載好 anime.js：開啟 */
window.__anReady=function(){ if(window.anime&&!AN.rm()) document.documentElement.classList.add("mo"); };
if(window.anime) __anReady();
/* 彈窗出現在 #layer、#askLayer：自動彈出 */
(function(){ const watch=el=>{ if(!el||el.__anW) return; el.__anW=1; new MutationObserver(ms=>{ if(!AN.ok()) return; for(const m of ms) for(const n of m.addedNodes) AN.pop(n); }).observe(el,{childList:true}); };
  const go=()=>{ watch(document.getElementById("layer")); watch(document.getElementById("askLayer")); };
  go(); new MutationObserver(ms=>{ for(const m of ms) for(const n of m.addedNodes) if(n.id==="askLayer") watch(n); }).observe(document.body,{childList:true});
})();
/* 液態玻璃：按住導覽列左右拖，鏡片跟著手指走，放開就切過去 */
(function(){ let st=null, swallow=false;
  const slot=(nav,x)=>{ const r=nav.getBoundingClientRect(), z=ZM(), n=+getComputedStyle(nav).getPropertyValue("--n")||5, w=(r.width/z-12)/n; const px=Math.min(Math.max(x/z-r.left/z-6-w/2,0),w*(n-1)); return {px,i:Math.round(px/w),w}; };
  document.addEventListener("pointerdown",e=>{ const nav=e.target.closest(".nav-in"); if(!nav) return; st={nav,x:e.clientX,moved:false,lens:nav.querySelector(".nav-lens")}; nav.classList.add("press"); },{passive:true});
  document.addEventListener("pointermove",e=>{ if(!st) return; if(!st.moved&&Math.abs(e.clientX-st.x)<8) return; if(!st.moved){ st.moved=true; st.nav.classList.add("drag"); st.btns=[...st.nav.querySelectorAll(".nav-btn")]; }
    st.cx=e.clientX; if(st.raf) return; st.raf=requestAnimationFrame(()=>{ if(!st) return; st.raf=0; const {px,i}=slot(st.nav,st.cx); st.lens.style.transform=`translate3d(${px}px,0,0) scale(1.14,1.1)`; if(st.hi!==i){ st.hi=i; st.btns.forEach((b,k)=>b.classList.toggle("hov",k===i)); } }); },{passive:true});
  const end=e=>{ if(!st) return; const s0=st; st=null; if(s0.raf) cancelAnimationFrame(s0.raf); s0.nav.classList.remove("press","drag"); s0.nav.querySelectorAll(".hov").forEach(b=>b.classList.remove("hov"));
    if(!s0.moved) return; const {i}=slot(s0.nav,e.clientX), b=s0.nav.querySelectorAll(".nav-btn")[i]; s0.lens.style.transform=""; s0.lens.style.setProperty("--i",i); s0.lens.style.setProperty("--f",i); swallow=true; setTimeout(()=>swallow=false,350);
    if(b&&!b.classList.contains("on")) setTimeout(()=>{ swallow=false; b.click(); },160); };
  document.addEventListener("pointerup",end); document.addEventListener("pointercancel",end);
  document.addEventListener("click",e=>{ if(swallow&&e.target.closest(".nav-in")){ e.stopPropagation(); e.preventDefault(); } },true);
})();
/* =========================================================
   應援棒 3D（不需要外部套件）
   ・analyze(img)：從設計圖自動找出應援棒的外形、燈頭範圍、燈光顏色
   ・mount(el, design)：把它變成可旋轉、可縮放、可移動、會發光的 3D 應援棒
   ========================================================= */
const LS3D=(()=>{
const N=160, SEG=64;
const hex2v=h=>{h=(h||"#C7AEFF").replace("#","");return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255)};
const v2hex=a=>"#"+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("");

/* ---------- 1. 辨識 ---------- */
function segment(img,thr){
  const {width:W,height:H,data:d}=img, n=W*H;
  const border=[]; for(let x=0;x<W;x++){border.push(x,(H-1)*W+x)} for(let y=1;y<H-1;y++){border.push(y*W,y*W+W-1)}
  const alphaMode=border.filter(i=>d[i*4+3]<24).length>border.length*.5;
  const med=c=>{const a=border.map(i=>d[i*4+c]).sort((p,q)=>p-q);return a[a.length>>1]};
  const bg=[med(0),med(1),med(2)], t2=thr*thr;
  const bgLike=i=>{ if(d[i*4+3]<24) return true; if(alphaMode) return false; const r=d[i*4]-bg[0],g=d[i*4+1]-bg[1],b=d[i*4+2]-bg[2]; return r*r+g*g+b*b<t2; };
  const isBg=new Uint8Array(n), st=[];
  border.forEach(i=>{ if(!isBg[i]&&bgLike(i)){ isBg[i]=1; st.push(i); } });
  while(st.length){ const i=st.pop(), x=i%W, y=(i/W)|0;
    if(x>0&&!isBg[i-1]&&bgLike(i-1)){isBg[i-1]=1;st.push(i-1)} if(x<W-1&&!isBg[i+1]&&bgLike(i+1)){isBg[i+1]=1;st.push(i+1)}
    if(y>0&&!isBg[i-W]&&bgLike(i-W)){isBg[i-W]=1;st.push(i-W)} if(y<H-1&&!isBg[i+W]&&bgLike(i+W)){isBg[i+W]=1;st.push(i+W)} }
  // 最大的一塊前景＝應援棒
  const lab=new Int32Array(n), areas=[0]; let best=0,bestA=0,cur=0;
  for(let s=0;s<n;s++){ if(isBg[s]||lab[s]) continue; cur++; let a=0; lab[s]=cur; st.push(s);
    while(st.length){ const i=st.pop(); a++; const x=i%W,y=(i/W)|0;
      for(const j of [x>0?i-1:-1,x<W-1?i+1:-1,y>0?i-W:-1,y<H-1?i+W:-1]) if(j>=0&&!isBg[j]&&!lab[j]){lab[j]=cur;st.push(j)} }
    areas.push(a); if(a>bestA){bestA=a;best=cur} }
  if(bestA<n*.01) return null;
  const mask=new Uint8Array(n); let x0=W,x1=0,y0=H,y1=0;
  const keep=areas.map(a=>a>=bestA*.25);   // 分開畫的零件（例如燈頭和握把中間有縫）也一起算進來
  for(let i=0;i<n;i++) if(keep[lab[i]]&&lab[i]){ mask[i]=1; const x=i%W,y=(i/W)|0; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
  return {W,H,mask,bx:x0,by:y0,bw:x1-x0+1,bh:y1-y0+1};
}
function canvasOf(src,W,H,tf){ const c=document.createElement("canvas"); c.width=W; c.height=H; const x=c.getContext("2d",{willReadFrequently:true}); if(tf) tf(x); x.drawImage(src,0,0,tf?src.width:W,tf?src.height:H); return c; }
function analyze(src,{thr=40}={}){
  let W=src.naturalWidth||src.width, H=src.naturalHeight||src.height; const k=Math.min(1,720/Math.max(W,H));
  W=Math.max(8,Math.round(W*k)); H=Math.max(8,Math.round(H*k));
  let cv=canvasOf(src,W,H), seg=segment(cv.getContext("2d").getImageData(0,0,W,H),thr), turned=false, flipped=false;
  if(!seg) return null;
  if(seg.bw>seg.bh*1.15){ const c0=cv; cv=canvasOf(c0,H,W,x=>{x.translate(H,0);x.rotate(Math.PI/2)}); [W,H]=[H,W]; turned=true; seg=segment(cv.getContext("2d").getImageData(0,0,W,H),thr); if(!seg) return null; }
  const widths=s=>{const a=[];for(let y=s.by;y<s.by+s.bh;y++){let c=0;for(let x=s.bx;x<s.bx+s.bw;x++)c+=s.mask[y*W+x];a.push(c)}return a};
  { const w=widths(seg), t=Math.floor(w.length/3), avg=a=>a.reduce((p,q)=>p+q,0)/a.length;   // 燈頭在下面 → 翻正
    if(avg(w.slice(-t))>avg(w.slice(0,t))*1.25){ const c0=cv; cv=canvasOf(c0,W,H,x=>{x.translate(0,H);x.scale(1,-1)}); flipped=true; seg=segment(cv.getContext("2d").getImageData(0,0,W,H),thr); if(!seg) return null; } }
  const {mask,bx,by,bw,bh}=seg, ctx=cv.getContext("2d"), px=ctx.getImageData(bx,by,bw,bh), d=px.data;
  const at=(x,y)=>mask[(by+y)*W+bx+x];
  // 每一列的左右邊界
  const L=[],R=[],F=[];
  for(let y=0;y<bh;y++){ let l=-1,r=-1,c=0; for(let x=0;x<bw;x++) if(at(x,y)){ if(l<0)l=x; r=x; c++; } if(l<0){l=r=L.length?L[L.length-1]:bw>>1;} L.push(l);R.push(r);F.push(r>l?c/(r-l+1):1); }
  const rows=[]; for(let i=0;i<N;i++){ const y=Math.min(bh-1,Math.floor((i+.5)/N*bh)); rows.push([L[y],R[y]+1]); }
  for(let i=1;i<N-1;i++){ for(const s of [0,1]){ const a=[rows[i-1][s],rows[i][s],rows[i+1][s]].sort((p,q)=>p-q); rows[i][s]=a[1]; } }
  const cs=rows.map(r=>(r[0]+r[1])/2).sort((p,q)=>p-q), axis=cs[cs.length>>1];
  // 左右對稱程度
  let tot=0,hitc=0; for(let y=0;y<bh;y+=2) for(let x=0;x<bw;x+=2) if(at(x,y)){ tot++; const mx=Math.round(2*axis-x); if(mx>=0&&mx<bw&&at(mx,y)) hitc++; }
  const sym=tot?hitc/tot:0;
  // 燈頭／握把分界：從最寬的地方往下，寬度明顯變窄的位置
  const wv=rows.map(r=>r[1]-r[0]); let im=0; for(let i=0;i<N*.7;i++) if(wv[i]>wv[im]) im=i;
  // 燈頭最下緣＝最後一列「還有最寬一半以上」的位置，再往下順著變窄的部分也算燈頭，直到不再變窄（接到燈座或握把）
  let e=-1; for(let i=Math.floor(N*.8);i>=im;i--) if(wv[i]>=wv[im]*.5){ e=i; break; }
  let split=-1; if(e>=0){ let j=e+1; while(j+1<N&&wv[j+1]<wv[j]) j++; split=j; }
  split=split<0?.5:Math.max(.15,Math.min(.85,split/N));
  // 燈頭有凹口（愛心、星星）→ 做成立體板，不做成旋轉體
  const hr=Math.floor(split*bh), concave=F.slice(0,hr).filter(f=>f<.86).length/Math.max(1,hr);
  const mode=sym>.84&&concave<.08?"lathe":"plate";
  // 燈光顏色：燈頭裡最鮮豔的顏色
  const cols=[]; for(let y=0;y<hr;y+=2) for(let x=0;x<bw;x+=2) if(at(x,y)){ const i=(y*bw+x)*4, r=d[i],g=d[i+1],b=d[i+2], mx=Math.max(r,g,b), mn=Math.min(r,g,b); cols.push([mx?(mx-mn)/mx*(mx/255):0,r,g,b]); }
  cols.sort((p,q)=>q[0]-p[0]); const top=cols.slice(0,Math.max(1,cols.length>>2));
  const avgC=[1,2,3].map(c=>top.reduce((s,p)=>s+p[c],0)/top.length), sat=top.reduce((s,p)=>s+p[0],0)/top.length;
  const glow=sat>.16?v2hex(avgC):null;
  // 貼圖：棒子外面的地方用邊緣顏色補滿（避免側面露出白邊）
  const tc=document.createElement("canvas"); tc.width=bw; tc.height=bh; const tx=tc.getContext("2d"); const tp=tx.createImageData(bw,bh), t=tp.data;
  const cc=document.createElement("canvas"); cc.width=bw; cc.height=bh; const cx2=cc.getContext("2d"); const cp=cx2.createImageData(bw,bh), c2=cp.data;
  for(let y=0;y<bh;y++) for(let x=0;x<bw;x++){ const o=(y*bw+x)*4, sx=Math.min(R[y],Math.max(L[y],x)), s=(y*bw+sx)*4, inside=at(x,y);
    const q=inside?o:s; t[o]=d[q];t[o+1]=d[q+1];t[o+2]=d[q+2];t[o+3]=255;
    c2[o]=d[o];c2[o+1]=d[o+1];c2[o+2]=d[o+2];c2[o+3]=inside?255:0; }
  tx.putImageData(tp,0,0); cx2.putImageData(cp,0,0);
  return {v:1,bw,bh,axis,rows,mode,split,glow,sym:+sym.toFixed(3),turned,flipped,tex:tc.toDataURL("image/jpeg",.88),cut:cc.toDataURL("image/png")};
}

/* ---------- 2. 建立 3D 網格 ---------- */
function buildMeshLegacy(ds){
  const N=ds.rows.length;
  const s=2.4/ds.bh, yOf=v=>1.2-v*2.4, P=[],I=[], U=[],NM=[],G=[];
  const sp=ds.split, gOf=v=>Math.max(0,Math.min(1,(sp-v)/.03+.5));
  const push=(p,n,u,v)=>{P.push(...p);NM.push(...n);U.push(u,v);G.push(gOf(v));return P.length/3-1};
  if(ds.mode==="lathe"){
    const pr=[{r:0,v:0}]; ds.rows.forEach((r,i)=>pr.push({r:(r[1]-r[0])/2,v:(i+.5)/N})); pr.push({r:0,v:1});
    const pts=pr.map(p=>({r:p.r*s,y:yOf(p.v),v:p.v}));
    for(let j=0;j<pts.length;j++){ const a=pts[Math.max(0,j-1)], b=pts[Math.min(pts.length-1,j+1)]; let nx=-(b.y-a.y), ny=b.r-a.r; const l=Math.hypot(nx,ny)||1; nx/=l; ny/=l;
      for(let k=0;k<=SEG;k++){ const th=k/SEG*Math.PI*2, sn=Math.sin(th), cs=Math.cos(th), p=pts[j];
        const u=Math.max(.002,Math.min(.998,(ds.axis+p.r/s*sn)/ds.bw));
        push([p.r*sn,p.y,p.r*cs],[nx*sn,ny,nx*cs],u,Math.max(.002,Math.min(.998,p.v))); } }
    for(let j=0;j<pts.length-1;j++) for(let k=0;k<SEG;k++){ const a=j*(SEG+1)+k, b=a+SEG+1; I.push(a,b,a+1,a+1,b,b+1); }
  } else {
    const K=18, maxW=Math.max(...ds.rows.map(r=>r[1]-r[0])), T=Math.min(.5,maxW*s*.3), X=x=>(x-ds.axis)*s, V=i=>(i+.5)/N;
    for(const side of [1,-1]){ const base=P.length/3;
      ds.rows.forEach((r,i)=>{ for(let k=0;k<=K;k++){ const x=r[0]+(r[1]-r[0])*k/K; push([X(x),yOf(V(i)),side*T/2],[0,0,side],x/ds.bw,V(i)); } });
      for(let i=0;i<N-1;i++) for(let k=0;k<K;k++){ const a=base+i*(K+1)+k, b=a+K+1; side>0?I.push(a,b,a+1,a+1,b,b+1):I.push(a,a+1,b,a+1,b+1,b); } }
    const wall=(ex,sgn)=>{ const base=P.length/3;
      ds.rows.forEach((r,i)=>{ const p=ds.rows[Math.max(0,i-1)], q=ds.rows[Math.min(N-1,i+1)], dx=(ex(q)-ex(p))*s, dy=-(V(Math.min(N-1,i+1))-V(Math.max(0,i-1)))*2.4;
        let nx=sgn*-dy, ny=sgn*dx; const l=Math.hypot(nx,ny)||1; nx/=l; ny/=l; const x=ex(r), u=Math.max(.002,Math.min(.998,(x+(sgn<0?.5:-.5))/ds.bw));
        push([X(x),yOf(V(i)),T/2],[nx,ny,0],u,V(i)); push([X(x),yOf(V(i)),-T/2],[nx,ny,0],u,V(i)); });
      for(let i=0;i<N-1;i++){ const a=base+i*2, b=a+2; sgn<0?I.push(a,b,a+1,a+1,b,b+1):I.push(a,a+1,b,a+1,b+1,b); } };
    wall(r=>r[0],-1); wall(r=>r[1],1);
    for(const [i,ny] of [[0,1],[N-1,-1]]){ const base=P.length/3, r=ds.rows[i];
      for(let k=0;k<=K;k++){ const x=r[0]+(r[1]-r[0])*k/K; push([X(x),yOf(V(i)),T/2],[0,ny,0],x/ds.bw,V(i)); push([X(x),yOf(V(i)),-T/2],[0,ny,0],x/ds.bw,V(i)); }
      for(let k=0;k<K;k++){ const a=base+k*2, b=a+2; ny>0?I.push(a,a+1,b,a+1,b+1,b):I.push(a,b,a+1,a+1,b,b+1); } }
  }
  return {P:new Float32Array(P),NM:new Float32Array(NM),U:new Float32Array(U),G:new Float32Array(G),I:new Uint16Array(I),headY:yOf(ds.split*.5)};
}

/* ---------- 2. 建立 3D 網格（精細版） ----------
   ・圓形燈頭：整支做成旋轉體（輪廓先抹平，不會一階一階）
   ・愛心、星星這類：燈頭用設計圖的輪廓「鼓起來」，邊緣圓潤像壓克力；握把一樣做成真的圓柱 */
function computeNormals(P,I){ const n=new Float32Array(P.length);
  for(let k=0;k<I.length;k+=3){ const a=I[k]*3,b=I[k+1]*3,c=I[k+2]*3, ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2], vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2];
    const nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx; for(const q of [a,b,c]){ n[q]+=nx; n[q+1]+=ny; n[q+2]+=nz; } }
  for(let i=0;i<n.length;i+=3){ const l=Math.hypot(n[i],n[i+1],n[i+2])||1; n[i]/=l; n[i+1]/=l; n[i+2]/=l; } return n; }
function latheMesh(ds,i0,i1,capTop){
  const R=ds.rows.length, s=2.4/ds.bh, yOf=v=>1.2-v*2.4, P=[],NM=[],U=[],G=[],I=[], sp=ds.split, gOf=v=>Math.max(0,Math.min(1,(sp-v)/.02+.5));
  const raw=[]; for(let i=i0;i<i1;i++) raw.push({r:(ds.rows[i][1]-ds.rows[i][0])/2,v:(i+.5)/R});
  const sm=raw.map((p,k)=>{ let a=0,c=0; for(let j=-1;j<=1;j++){ const q=raw[k+j]; if(q){ a+=q.r*(j?1:2); c+=j?1:2; } } return {r:a/c,v:p.v}; });
  const pr=[]; if(capTop) pr.push({r:0,v:Math.max(0,sm[0].v-.5/R)}); pr.push(...sm); pr.push({r:0,v:Math.min(1,sm[sm.length-1].v+.5/R)});
  const pts=pr.map(p=>({r:p.r*s,y:yOf(p.v),v:p.v}));
  for(let j=0;j<pts.length;j++){ const a=pts[Math.max(0,j-1)], b=pts[Math.min(pts.length-1,j+1)]; let nx=-(b.y-a.y), ny=b.r-a.r; const l=Math.hypot(nx,ny)||1; nx/=l; ny/=l;
    for(let k=0;k<=SEG;k++){ const th=k/SEG*Math.PI*2, sn=Math.sin(th), cs=Math.cos(th), p=pts[j];
      P.push(p.r*sn,p.y,p.r*cs); NM.push(nx*sn,ny,nx*cs); U.push(Math.max(.002,Math.min(.998,(ds.axis+p.r/s*sn)/ds.bw)),Math.max(.002,Math.min(.998,p.v))); G.push(gOf(p.v)); } }
  for(let j=0;j<pts.length-1;j++) for(let k=0;k<SEG;k++){ const a=j*(SEG+1)+k, b=a+SEG+1; I.push(a,b,a+1,a+1,b,b+1); }
  return {P,NM,U,G,I};
}
function plateHead(ds,mask){
  const {w,h,a}=mask, R=ds.rows.length, s=2.4/ds.bh, splitPx=Math.round(ds.split*ds.bh);
  let maxW=1; for(let i=0;i<Math.max(1,Math.round(ds.split*R));i++) maxW=Math.max(maxW,ds.rows[i][1]-ds.rows[i][0]);
  const g=Math.max(1,maxW/72), GW=Math.ceil(w/g)+3, GH=Math.ceil((splitPx+1)/g)+3;
  const F=new Float32Array(GW*GH), at=(x,y)=>(x>=0&&y>=0&&x<w&&y<=splitPx&&y<h)?a[y*w+x]/255:0;
  for(let gy=0;gy<GH;gy++) for(let gx=0;gx<GW;gx++){ const px=(gx-1)*g, py=(gy-1)*g; let sum=0;
    for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) sum+=at(Math.round(px+dx*g*.45),Math.round(py+dy*g*.45)); F[gy*GW+gx]=sum/9; }
  // 每一點離邊緣多遠 → 決定鼓起來的高度
  const D=new Float32Array(GW*GH); for(let i=0;i<D.length;i++) D[i]=F[i]>=.5?1e9:0;
  const S2=1.4142;
  for(let y=1;y<GH;y++) for(let x=1;x<GW-1;x++){ const i=y*GW+x; if(!D[i]) continue; D[i]=Math.min(D[i],D[i-1]+1,D[i-GW]+1,D[i-GW-1]+S2,D[i-GW+1]+S2); }
  for(let y=GH-2;y>=0;y--) for(let x=GW-2;x>=1;x--){ const i=y*GW+x; if(!D[i]) continue; D[i]=Math.min(D[i],D[i+1]+1,D[i+GW]+1,D[i+GW+1]+S2,D[i+GW-1]+S2); }
  let maxD=0; for(let i=0;i<D.length;i++) if(D[i]<1e8&&D[i]>maxD) maxD=D[i];
  const bev=Math.max(1,Math.min(maxD*.92,(maxW/g)*.24)), Tz=maxW*s*.15;
  const zOf=d=>{ const t=Math.min(1,Math.max(0,(d-.5)/bev)); return Tz*Math.sqrt(1-(1-t)*(1-t)); };
  const P=[],U=[],G=[],I=[], idx=new Map(), sp=ds.split, gOf=v=>Math.max(0,Math.min(1,(sp-v)/.02+.5));
  const X=px=>(px-ds.axis)*s, Y=py=>1.2-py/ds.bh*2.4;
  const vtx=(key,px,py,z)=>{ let i=idx.get(key); if(i!=null) return i; i=P.length/3; P.push(X(px),Y(py),z); const v=Math.min(.998,Math.max(.002,py/h)); U.push(Math.min(.998,Math.max(.002,px/w)),v); G.push(gOf(v)); idx.set(key,i); return i; };
  const inside=(x,y)=>F[y*GW+x]>=.5;
  for(const side of [1,-1]){
    for(let gy=0;gy<GH-1;gy++) for(let gx=0;gx<GW-1;gx++){
      const C=[[gx,gy],[gx+1,gy],[gx+1,gy+1],[gx,gy+1]], ins=C.map(([x,y])=>inside(x,y)); if(!ins.some(Boolean)) continue;
      const poly=[];
      for(let k=0;k<4;k++){ const [x,y]=C[k], [x2,y2]=C[(k+1)%4];
        if(ins[k]){ const i=y*GW+x; poly.push(vtx(side+"c"+i,(x-1)*g,(y-1)*g,side*zOf(D[i]))); }
        if(ins[k]!==ins[(k+1)%4]){ const fa=F[y*GW+x], fb=F[y2*GW+x2], t=(fa-.5)/((fa-fb)||1e-6), i1=y*GW+x, i2=y2*GW+x2;
          poly.push(vtx("e"+Math.min(i1,i2)+"_"+Math.max(i1,i2),((x-1)+(x2-x)*t)*g,((y-1)+(y2-y)*t)*g,0)); } }
      for(let k=1;k<poly.length-1;k++) side>0?I.push(poly[0],poly[k],poly[k+1]):I.push(poly[0],poly[k+1],poly[k]);
    }
  }
  return {P,U,G,I,NM:Array.from(computeNormals(P,I))};
}
function joinMesh(parts){ const o={P:[],NM:[],U:[],G:[],I:[]}; for(const m of parts){ const off=o.P.length/3; o.P.push(...m.P); o.NM.push(...m.NM); o.U.push(...m.U); o.G.push(...m.G); for(const i of m.I) o.I.push(i+off); } return o; }
function buildMesh(ds,mask){
  const R=ds.rows.length, yOf=v=>1.2-v*2.4;
  let m;
  if(ds.mode==="plate"&&mask){ const iS=Math.min(R-2,Math.max(1,Math.floor(ds.split*R))); m=joinMesh([plateHead(ds,mask),latheMesh(ds,iS,R,true)]); }
  else if(ds.mode==="plate") m=buildMeshLegacy(ds);
  else m=latheMesh(ds,0,R,true);
  const big=m.P.length/3>65000;
  return {P:new Float32Array(m.P),NM:new Float32Array(m.NM),U:new Float32Array(m.U),G:new Float32Array(m.G),I:big?new Uint32Array(m.I):new Uint16Array(m.I),big,headY:yOf(ds.split*.5)};
}

/* ---------- 3. 畫面 ---------- */
const VS=`attribute vec3 p;attribute vec3 n;attribute vec2 uv;attribute float g;uniform mat4 M;uniform mat4 VP;uniform mat4 V;varying vec3 vN;varying vec3 vV;varying vec2 vUV;varying float vG;
void main(){vec4 w=M*vec4(p,1.0);vec4 e=V*w;vV=-e.xyz;vN=(V*M*vec4(n,0.0)).xyz;vUV=uv;vG=g;gl_Position=VP*w;}`;
const FS=`precision mediump float;varying vec3 vN;varying vec3 vV;varying vec2 vUV;varying float vG;uniform sampler2D tex;uniform vec3 glow;uniform float pw;uniform float em;
void main(){vec3 n=normalize(vN);vec3 v=normalize(vV);if(dot(n,v)<0.0)n=-n;vec3 b=texture2D(tex,vUV).rgb;
vec3 L=normalize(vec3(.45,.75,.9));vec3 L2=normalize(vec3(-.75,.25,.5));float d=max(dot(n,L),0.0);float d2=max(dot(n,L2),0.0);float f=max(dot(n,v),0.0);float fr=pow(1.0-f,3.0);
float sp=pow(max(dot(n,normalize(L+v)),0.0),70.0);float sp2=pow(max(dot(n,normalize(L2+v)),0.0),26.0);
vec3 env=mix(vec3(.80,.76,.94),vec3(1.0,.97,.99),n.y*.5+.5);
vec3 lit=b*(.36+.12*em+.6*d+.16*d2)+env*fr*(.38+.2*em)+sp*.6+sp2*.16;
vec3 core=mix(b,glow,.3+.15*em)*(.92+.22*pw+.18*em+.15*d);
vec3 gl=core+glow*pow(1.0-f,2.2)*(.6+.5*em)*pw+vec3(1.0)*pow(f,6.0)*(.06+.08*em)*pw+sp*.5+sp2*.16+env*fr*.12;
vec3 col=mix(lit,gl,vG);float mx=max(col.r,max(col.g,col.b));if(mx>.92){float t=mx-.92;col*=(.92+t/(1.0+t*3.0))/mx;}
gl_FragColor=vec4(col,1.0);}`;
const m4={
  mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o},
  persp(f,a,n,fa){const t=1/Math.tan(f/2),o=new Float32Array(16);o[0]=t/a;o[5]=t;o[10]=(fa+n)/(n-fa);o[11]=-1;o[14]=2*fa*n/(n-fa);return o},
  T(x,y,z){const o=m4.I();o[12]=x;o[13]=y;o[14]=z;return o}, S(s){const o=m4.I();o[0]=o[5]=o[10]=s;return o},
  I(){const o=new Float32Array(16);o[0]=o[5]=o[10]=o[15]=1;return o},
  Rx(a){const o=m4.I(),c=Math.cos(a),s=Math.sin(a);o[5]=c;o[6]=s;o[9]=-s;o[10]=c;return o},
  Ry(a){const o=m4.I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[2]=-s;o[8]=s;o[10]=c;return o},
  Rz(a){const o=m4.I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[1]=s;o[4]=-s;o[5]=c;return o},
};
const live=new Set();
function mount(el,ds,o={}){
  el.classList.add("ls3d"); el.innerHTML=`<span class="ls-halo"></span><canvas></canvas>${o.controls?`<span class="ls-ctl"><button type="button" data-m="rot" class="on">↻ 旋轉</button><button type="button" data-m="move">✥ 移動</button><button type="button" data-m="reset">重設</button></span>`:""}`;
  const cv=el.querySelector("canvas"), halo=el.querySelector(".ls-halo");
  const gl=cv.getContext("webgl",{antialias:true,alpha:true,premultipliedAlpha:true});
  const api={set(k,v){st[k]=v; if(k==="glow") applyGlow();}, update(nd){ ds=nd; upload(); }, destroy(){ st.dead=true; live.delete(api); try{gl&&gl.getExtension("WEBGL_lose_context").loseContext()}catch(e){} }};
  const st={yaw:o.yaw??-.5,pitch:.12,sc:1,px:0,py:0,vy:0,auto:o.auto!==false,wave:!!o.wave,pulse:o.pulse||0,glow:o.glow||ds.glow||"#C7AEFF",dead:false,mode:"rot",t0:performance.now(),touch:0,swing:!!o.swing,roll:0,rv:0,sw:0,sv:0,em:o.bright?1:0};
  if(st.swing){ st.yaw=-.32; st.pitch=.08; st.sc=.84; }
  function applyGlow(){ halo.style.background=`radial-gradient(circle,${st.glow}cc 0%,${st.glow}55 35%,transparent 68%)`; }
  applyGlow();
  if(!gl){ el.innerHTML=`<img class="ls-fb" src="${ds.cut}" alt="應援棒">`; return api; }
  const sh=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);return s};
  const pg=gl.createProgram(); gl.attachShader(pg,sh(gl.VERTEX_SHADER,VS)); gl.attachShader(pg,sh(gl.FRAGMENT_SHADER,FS)); gl.linkProgram(pg); gl.useProgram(pg);
  const loc=k=>gl.getUniformLocation(pg,k), bufs={}; let cnt=0, headY=.6;
  const tex=gl.createTexture();
  const ext32=gl.getExtension("OES_element_index_uint"); let idxType=gl.UNSIGNED_SHORT, mkCut=null, mkMask=null;
  function loadMask(cb){ if(ds.mode!=="plate"||!ds.cut){ cb(null); return; } if(mkCut===ds.cut){ cb(mkMask); return; }
    const im=newImg(), want=ds.cut; im.onload=()=>{ const c=document.createElement("canvas"); c.width=ds.bw; c.height=ds.bh; const x=c.getContext("2d"); x.drawImage(im,0,0,ds.bw,ds.bh);
      const d=x.getImageData(0,0,ds.bw,ds.bh).data, a=new Uint8Array(ds.bw*ds.bh); for(let i=0;i<a.length;i++) a[i]=d[i*4+3]; mkCut=want; mkMask={w:ds.bw,h:ds.bh,a}; cb(mkMask); };
    im.onerror=()=>cb(null); im.src=want; }
  function setMesh(m){
    for(const [k,arr,sz] of [["p",m.P,3],["n",m.NM,3],["uv",m.U,2],["g",m.G,1]]){ bufs[k]=bufs[k]||gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,bufs[k]); gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW); const a=gl.getAttribLocation(pg,k); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a,sz,gl.FLOAT,false,0,0); }
    bufs.i=bufs.i||gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,bufs.i); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,m.I,gl.STATIC_DRAW);
    idxType=m.big&&ext32?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT; cnt=m.big&&!ext32?0:m.I.length; headY=m.headY;
  }
  let texSrc=null;
  function upload(){
    const my=ds; loadMask(mask=>{ if(st.dead||my!==ds) return; setMesh(buildMesh(ds,mask)); });
    if(texSrc!==ds.tex){ texSrc=ds.tex;
    gl.bindTexture(gl.TEXTURE_2D,tex); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([220,215,240,255]));
    const im=newImg(); im.onload=()=>{ if(st.dead) return; gl.bindTexture(gl.TEXTURE_2D,tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE); }; im.src=ds.tex; }
    if(!o.glow) { st.glow=ds.glow||st.glow; applyGlow(); }
  }
  upload(); gl.enable(gl.DEPTH_TEST);
  // 手勢：一指旋轉（或移動）、兩指縮放＋移動、雙擊重設
  const pts=new Map(); let last=null, lastTap=0;
  const reset=()=>{ st.yaw=-.5; st.pitch=.12; st.sc=1; st.px=0; st.py=0; st.vy=0; };
  if(o.interactive!==false){
    cv.style.touchAction="none";
    cv.addEventListener("pointerdown",e=>{ cv.setPointerCapture(e.pointerId); pts.set(e.pointerId,{x:e.clientX,y:e.clientY}); st.touch=performance.now(); last=null;
      const now=Date.now(); if(pts.size===1&&now-lastTap<300) reset(); lastTap=now; });
    cv.addEventListener("pointermove",e=>{ if(!pts.has(e.pointerId)) return; const p=pts.get(e.pointerId), dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY; st.touch=performance.now();
      const H=cv.clientHeight||300;
      if(pts.size===1&&st.swing){ st.rv=dx*.006; st.roll=Math.max(-.6,Math.min(.6,st.roll+st.rv)); st.sv=dy*.005; st.sw=Math.max(-.6,Math.min(.6,st.sw+st.sv)); if(o.onSwing) o.onSwing(Math.abs(dx)+Math.abs(dy)); return; }
      if(pts.size===1){ if(st.mode==="move"||e.shiftKey){ st.px+=dx/H*4.2; st.py-=dy/H*4.2; } else { st.yaw+=dx*.012; st.vy=dx*.012; st.pitch=Math.max(-1.1,Math.min(1.1,st.pitch+dy*.008)); } }
      else if(pts.size===2){ const [a,b]=[...pts.values()], dist=Math.hypot(a.x-b.x,a.y-b.y), mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
        last={dist,mid}; } });
    const up=e=>{ pts.delete(e.pointerId); last=null; }; cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up);

    el.querySelectorAll(".ls-ctl button").forEach(b=>b.addEventListener("click",ev=>{ ev.stopPropagation(); const m=b.dataset.m; if(m==="reset"){ reset(); return; } st.mode=m; el.querySelectorAll(".ls-ctl button").forEach(x=>x.classList.toggle("on",x.dataset.m===m)); }));
  }
  function frame(now){
    if(st.dead) return; if(!cv.isConnected){ api.destroy(); return; }
    const dpr=Math.min(3,window.devicePixelRatio||1), w=Math.round(cv.clientWidth*dpr), h=Math.round(cv.clientHeight*dpr);
    if(w&&h&&(cv.width!==w||cv.height!==h)){ cv.width=w; cv.height=h; }
    const t=(now-st.t0)/1000, idle=now-st.touch>1500;
    if(st.swing){ if(!pts.size){ st.rv+=-st.roll*.07; st.rv*=.9; st.roll+=st.rv; st.sv+=-st.sw*.07; st.sv*=.88; st.sw+=st.sv; } }
    else if(!pts.size){ st.yaw+=st.vy; st.vy*=.93; if(st.auto&&idle) st.yaw+=.008; }
    let pw=1; if(st.pulse===1) pw=.55+.45*Math.sin(t*5); else if(st.pulse===2) pw=(Math.sin(t*12)>0?1:.25); else if(st.pulse===3) pw=.6+.4*Math.sin(t*2.2);
    const wave=st.swing?-(st.roll+(idle?Math.sin(t*1.9)*.1:0)):st.wave?Math.sin(t*4.2)*.32:0, swp=st.swing?st.sw:0;
    gl.viewport(0,0,cv.width,cv.height); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const P=m4.persp(.62,cv.width/Math.max(1,cv.height),.1,50), V=m4.T(0,0,-6.4), VP=m4.mul(P,V);
    let M=m4.mul(m4.T(st.px,st.py,0),m4.mul(m4.S(st.sc),m4.mul(m4.T(0,-.8,0),m4.mul(m4.Rz(wave),m4.mul(m4.Rx(swp),m4.mul(m4.T(0,.8,0),m4.mul(m4.Rx(st.pitch),m4.Ry(st.yaw))))))));
    gl.uniformMatrix4fv(loc("M"),false,M); gl.uniformMatrix4fv(loc("VP"),false,VP); gl.uniformMatrix4fv(loc("V"),false,V);
    gl.uniform3fv(loc("glow"),hex2v(st.glow)); gl.uniform1f(loc("pw"),pw); gl.uniform1f(loc("em"),st.em); gl.uniform1i(loc("tex"),0);
    if(cnt) gl.drawElements(gl.TRIANGLES,cnt,idxType,0);
    // 光暈跟著燈頭
    const hp=[0,headY,0,1], c=m4.mul(VP,M); const x=c[0]*hp[0]+c[4]*hp[1]+c[8]*hp[2]+c[12], y=c[1]*hp[0]+c[5]*hp[1]+c[9]*hp[2]+c[13], ww=c[3]*hp[0]+c[7]*hp[1]+c[11]*hp[2]+c[15];
    const sx=(x/ww*.5+.5)*cv.clientWidth, sy=(1-(y/ww*.5+.5))*cv.clientHeight, size=cv.clientHeight*(st.em?.8:.62)*st.sc;
    halo.style.width=halo.style.height=size+"px"; halo.style.transform=`translate(${sx-size/2}px,${sy-size/2}px)`; halo.style.opacity=(.35+.55*pw).toFixed(2);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame); live.add(api);
  return api;
}

/* ---------- 4. 範例設計圖（讓你不用找圖也能試） ---------- */
function sample(kind,c1="#A47BFF",c2="#F472B6",letter="L"){
  const W=300,H=640,cv=document.createElement("canvas"); cv.width=W*2; cv.height=H*2; const x=cv.getContext("2d"); x.scale(2,2);
  x.fillStyle="#FFFFFF"; x.fillRect(0,0,W,H);
  const hg=x.createLinearGradient(0,40,0,300); hg.addColorStop(0,"#FFFFFF"); hg.addColorStop(.5,c1); hg.addColorStop(1,c2);
  x.fillStyle=hg; x.strokeStyle="rgba(80,50,140,.25)"; x.lineWidth=3;
  const cxm=W/2;
  if(kind==="heart"){ x.beginPath(); x.moveTo(cxm,290); x.bezierCurveTo(20,200,30,60,cxm-60,60); x.bezierCurveTo(cxm-30,60,cxm,85,cxm,110); x.bezierCurveTo(cxm,85,cxm+30,60,cxm+60,60); x.bezierCurveTo(W-30,60,W-20,200,cxm,290); x.fill(); x.stroke(); }
  else if(kind==="star"){ x.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, r=i%2?58:128; x.lineTo(cxm+Math.cos(a)*r,160+Math.sin(a)*r); } x.closePath(); x.fill(); x.stroke(); }
  else { x.beginPath(); x.arc(cxm,170,118,0,Math.PI*2); x.fill(); x.stroke(); const sh=x.createRadialGradient(cxm-40,120,5,cxm-40,120,70); sh.addColorStop(0,"rgba(255,255,255,.85)"); sh.addColorStop(1,"rgba(255,255,255,0)"); x.fillStyle=sh; x.fill(); }
  x.fillStyle="rgba(255,255,255,.95)"; x.font="900 64px sans-serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillText(letter,cxm,kind==="star"?168:kind==="heart"?165:175);
  const top=kind==="heart"?286:kind==="star"?212:282;
  x.fillStyle="#E9E3F7"; x.beginPath(); x.roundRect?x.roundRect(cxm-46,top,92,26,10):x.rect(cxm-46,top,92,26); x.fill(); x.strokeStyle="rgba(80,50,140,.18)"; x.stroke();
  const g=x.createLinearGradient(cxm-30,0,cxm+30,0); g.addColorStop(0,c2); g.addColorStop(.5,"#FFFFFF"); g.addColorStop(1,c1);
  x.fillStyle=g; x.beginPath(); x.roundRect?x.roundRect(cxm-30,top+24,60,300,24):x.rect(cxm-30,top+24,60,300); x.fill(); x.stroke();
  x.fillStyle=c1; for(let i=0;i<3;i++){ x.fillRect(cxm-30,top+90+i*60,60,8); }
  x.fillStyle="#3B2A6B"; x.beginPath(); x.arc(cxm,top+330,12,0,Math.PI*2); x.fill();
  return cv;
}
return {analyze,mount,sample,buildMesh};
})();
