/* HAECHU｜選秀、燈海、節奏遊戲 */
/* =========================================================
   SURVIVAL PROJECT（選秀宇宙）：先做好內容，管理員在 FOC 決定要不要開放
   ・每天 3 票免費，投給心儀的練習生，幫他衝向 PAK
   ========================================================= */
const TRAINEES=[
  {id:"t1",name:"星宇",agency:"Star Horizon",tags:["火爆","完美主義"],st:[85,92,78],g:2},
  {id:"t2",name:"光賢",agency:"Neon Peak",tags:["懶洋洋","幽默"],st:[94,76,88],g:0},
  {id:"t3",name:"夏澄",agency:"Zenith Arts",tags:["冷靜","努力家"],st:[72,98,81],g:4},
  {id:"t4",name:"承恩",agency:"Blue Wave",tags:["陽光","自信"],st:[88,85,95],g:6},
  {id:"t5",name:"子安",agency:"Moonlit Ent.",tags:["害羞","溫柔"],st:[91,70,84],g:5},
  {id:"t6",name:"時溫",agency:"Aurora Lab",tags:["話少","舞蹈狂"],st:[68,96,79],g:1},
  {id:"t7",name:"若川",agency:"Prism Works",tags:["搞笑","元氣"],st:[80,82,90],g:7},
  {id:"t8",name:"一然",agency:"Cloud Nine",tags:["穩重","主唱"],st:[97,74,83],g:3}];
const svOpen=()=>sbxOn()||!!S.get(K.svOpen,false);
const svVotes=()=>({t1:18420,t2:17110,t3:16980,t4:15230,t5:12870,t6:11940,t7:9820,t8:9310,...S.get(K.svVotes,{})});
const svToday=()=>{ const r=S.get(K.svMine,{}), k=new Date().toDateString(); return r.day===k?r.n:0; };
function svEnd(){ const t=new Date(); t.setDate(t.getDate()+((7-t.getDay())%7)); t.setHours(23,59,0,0); return t.getTime(); }
function viewSurvival(){
  const v=svVotes(), list=[...TRAINEES].sort((a,b)=>v[b.id]-v[a.id]), left=3-svToday(), end=svEnd(), d=Math.max(0,end-Date.now());
  return coreHead("SURVIVAL PROJECT")+`<main class="page sv">
    ${svOpen()?"":`<p class="sv-closed">目前沒有開放，這是管理員預覽</p>`}
    <section class="sv-hero"><span class="sv-eb">🏆 第 2 輪・生存排名戰</span><p>這裡是練習生們的磨練之地。快為你心儀的 Idol 投下珍貴的一票，幫助他們衝向 PAK（Perfect All-Kill）！</p>
      <div class="sv-meta"><span>今天還有 <b>${left}</b> 票</span><span>本輪結算倒數 <b>${Math.floor(d/864e5)} 天 ${Math.floor(d%864e5/36e5)} 小時</b></span></div></section>
    ${list.map((t,i)=>`<article class="card sv-c ${i<3?"top":""}"><span class="sv-rk">${i+1}</span><span class="sv-av" style="background:${grad(t.g)}">${esc(ini(t.name))}</span>
      <div class="sv-b"><b>${esc(t.name)}</b><small>${esc(t.agency)}・${t.tags.map(x=>esc(x)).join("・")}</small>
        <div class="sv-st">${["Vocal","Dance","Charm"].map((l,k)=>`<span><em>${l}</em><i><u style="width:${t.st[k]}%"></u></i></span>`).join("")}</div></div>
      <div class="sv-r"><b>${fmt(v[t.id])}</b><button class="btn btn-sm ${left?"btn-main":"btn-soft"}" data-a="svVote" data-v="${t.id}" ${left?"":"disabled"}>Pick Me</button></div></article>`).join("")}
  </main>`;
}

/* =========================================================
   應援棒玩法（燈海）
   ・藝人當燈控師：換全場顏色、切效果、下指令（一起揮／亮白燈／排字／全場任務）
   ・粉絲有自己的座位；揮棒累積熱度；應援口號節奏挑戰
   ・燈海待滿 20 秒，離開時拿到出席票根
   ========================================================= */
const LS_FX={breath:"呼吸",wave:"波浪",flash:"閃爍",rainbow:"彩虹"};
const LS_COLORS=["#C7AEFF","#F9A8D4","#93C5FD","#FDE68A","#86EFAC","#FFFFFF","#F472B6"];
function lsCtl(patch){ const ls=lightsea(); if(!ls) return; if(patch.fx) patch={...patch,fxTs:Date.now()}; const ctl=S.get(K.lightsea,null); S.set(K.lightsea,{...(ctl&&ctl.cid===ls.cid?ctl:{}),cid:ls.cid,...patch}); }
function lsCmd(type,extra={}){ lsCtl({cmd:{type,ts:Date.now(),until:Date.now()+(type==="mission"?30e3:type==="text"?15e3:10e3),...extra}}); }
const activeCmd=()=>{ const ls=lightsea(), c=ls&&ls.cmd; return c&&c.until>Date.now()?c:null; };

const curConcert=()=>liveConcert()||(ui.lsDemo&&ui.lsDemo.endTs>Date.now()?ui.lsDemo:null);
const canCtl=(c,mid)=>!c||c.demo||!c.host||c.host===mid||c.co===mid;
function ccTimeline(c){ if(!c||!c.setlist||!c.setlist.length) return null; const n=Date.now(); let t=c.startTs;
  for(let i=0;i<c.setlist.length;i++){ const it=c.setlist[i], tr=trackOf(it.sid), d=(tr?tr.dur:180)*1000; if(n<t+d) return {i,cur:{sid:it.sid,at:t},ia:i<(c.nIa||0),total:c.setlist.length,next:c.setlist[i+1]||null}; t+=d; }
  return {i:c.setlist.length,cur:null,ia:false,total:c.setlist.length,done:true,next:null}; }

function acOpenCard(mid){ const gid=MEMBERS[mid].group, T=getTracks(), ms=getMShow(), songs0=[...ms.songs,...(ms.ended||[])].filter(x=>x.gid===gid&&T[x.id]).map(x=>({id:x.id,title:x.title})), songs=songs0.length?songs0:[{id:"demo",title:mvSongTitle(gid)||((grpSong(gid)||{}).title)||"出道曲"}], set=ui.acSet||[], n=Math.min(ui.acIa==null?Math.min(2,set.length):ui.acIa,set.length), iaMin=Math.round(set.slice(0,n).reduce((a,sid)=>{ const tr=trackOf(sid); return a+(tr?tr.dur:180); },0)/60);
  return `<div class="lsp"><div class="lsp-h"><b>開演唱會</b><span>${esc(groupOf(gid).name)}・2 小時</span></div><label class="field" style="margin-top:8px"><input id="acTitle" placeholder="演唱會名稱" value="${esc(ui.acTitle||"")}"></label>
    <span class="lsp-l">歌單</span><div class="lsp-songs">${songs.map(x=>{ const k=set.indexOf(x.id); return `<button class="${k>=0?"on":""}" data-a="acSong" data-v="${x.id}">${k>=0?`${k+1}. `:""}《${esc(x.title)}》</button>`; }).join("")}</div>
    <span class="lsp-l">互動歌</span><div class="ls-seg"><button data-a="acIa" data-v="-1" ${n<=0?"disabled":""}>－</button><button class="on">${set.length?`前 ${n} 首`:"先選歌單"}</button><button data-a="acIa" data-v="1" ${n>=set.length?"disabled":""}>＋</button></div>
    <button class="btn btn-main btn-block" style="margin-top:10px" data-a="acLater">10 分鐘後開演</button><button class="btn btn-soft btn-block" style="margin-top:8px" data-a="acNow">現在開演</button></div>`; }

/* 燈海 3D：從舞台看出去的整個場館，幾千支應援棒一階一階排上去
   ・顏色、呼吸／閃爍／波浪／彩虹、亮白燈、排字、揮棒熱度（SEA.boost）、燈暗（dim）全部跟著燈控台
   ・webgl-noise 讓每一支的亮度有自然的起伏，不會整片一模一樣
   ・先照原本的 2D 畫，three.js 載好再換成 3D；不支援 WebGL 就一直用 2D */
function seaRun(cv,color){ seaRun2D(cv,color); if(!cv||!C3.gl()) return; loadThree().then(()=>{ if(!cv.isConnected) return; try{ sea3D(cv,color); }catch(e){ console.warn("sea3D",e); } }).catch(()=>{}); }
function sea3D(old,color){
  const cv=document.createElement("canvas"); cv.className=old.className; cv.setAttribute("aria-hidden","true");
  const R=new THREE.WebGLRenderer({canvas:cv,antialias:false,alpha:true,powerPreference:"high-performance"}), dpr=Math.min(2,devicePixelRatio||1); R.setClearColor(0x000000,0); R.setPixelRatio(dpr);
  old.replaceWith(cv);
  const sc=new THREE.Scene(), cam=new THREE.PerspectiveCamera(50,1,.1,120);
  const pos=[], grid=[], ph=[], ROWS=34;
  for(let r=0;r<ROWS;r++){ const rad=7.5+r*.6, y=r*.36, A=1.18, n=Math.round(rad*A*2/.3);
    for(let i=0;i<n;i++){ const u=(i+.5+(Math.random()-.5)*.6)/n, a=(u-.5)*2*A, j=(Math.random()-.5)*.2; pos.push(Math.sin(a)*(rad+j),y+(Math.random()-.5)*.14,-Math.cos(a)*(rad+j)); grid.push(u,r/(ROWS-1)); ph.push(Math.random()*6.2832); } }
  const N=ph.length, mk=new Float32Array(N), g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); g.setAttribute("aGrid",new THREE.Float32BufferAttribute(grid,2)); g.setAttribute("aPh",new THREE.Float32BufferAttribute(ph,1)); g.setAttribute("aMask",new THREE.BufferAttribute(mk,1));
  const U={uT:{value:0},uCol:{value:new THREE.Color(color||"#C7AEFF")},uFx:{value:0},uBoost:{value:0},uDim:{value:1},uWhite:{value:0},uMask:{value:0},uPx:{value:dpr},uH:{value:300},uPal:{value:LS_COLORS.map(h=>new THREE.Color(h))}};
  const mat=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneFactor,blendSrcAlpha:THREE.OneFactor,blendDstAlpha:THREE.OneFactor,
    vertexShader:`attribute vec2 aGrid; attribute float aPh; attribute float aMask;
      uniform float uT; uniform float uFx; uniform float uBoost; uniform float uDim; uniform float uWhite; uniform float uMask; uniform float uPx; uniform float uH; uniform vec3 uCol; uniform vec3 uPal[7];
      varying vec3 vCol; varying float vA;
      ${C3_NOISE}
      void main(){
        vec3 p=position; float sw=sin(uT*(0.9+fract(aPh)*1.4)+aPh);
        p.x+=sw*0.07*(1.0+uBoost*2.5); p.y+=abs(sw)*0.05*(1.0+uBoost*3.0);
        float gx=aGrid.x, gy=aGrid.y, a;
        if(uFx<0.5) a=0.3+0.3*(0.5+0.5*sin(uT*2.3+aPh))+0.25*max(0.0,sin(uT*1.7-gx*7.0));
        else if(uFx<1.5) a=sin(uT*9.0+aPh*0.2)>0.0?0.85:0.12;
        else if(uFx<2.5) a=0.15+0.8*max(0.0,sin(uT*2.4-gx*9.0+gy*2.0));
        else a=0.45+0.35*(0.5+0.5*sin(uT*2.0+aPh));
        a+=0.14*snoise(vec3(gx*6.0,gy*5.0,uT*0.45));
        vec3 c=uCol;
        if(uFx>2.5){ float k=mod(floor(gx*6.0+uT*0.8),7.0); for(int i=0;i<7;i++){ if(abs(float(i)-k)<0.5) c=uPal[i]; } }
        if(uWhite>0.5) c=vec3(1.0);
        float big=1.0;
        if(uMask>0.5){ if(aMask>0.5){ a=0.95+0.05*sin(uT*5.0); c=vec3(1.0); big=1.3; } else a=0.05; }
        a=clamp(min(1.0,a+0.5*uBoost)*uDim,0.0,1.0);
        vCol=c; vA=a;
        vec4 mv=modelViewMatrix*vec4(p,1.0); gl_Position=projectionMatrix*mv;
        gl_PointSize=uPx*uH*0.26*big/(-mv.z);
      }`,
    fragmentShader:`varying vec3 vCol; varying float vA;
      void main(){ vec2 q=gl_PointCoord-0.5; float d=length(q); if(d>0.5) discard;
        float glow=exp(-d*d*14.0), core=smoothstep(0.16,0.0,d);
        vec3 c=(vCol*glow+vec3(1.0)*core*0.85)*vA; gl_FragColor=vec4(c,max(c.r,max(c.g,c.b))); }`});
  sc.add(new THREE.Points(g,mat));
  /* 排字：把字畫在 200×100 的小畫布，觀眾席上對到字的那幾支亮白燈 */
  const textMask=txt=>{ const c=document.createElement("canvas"); c.width=200; c.height=100; const x=c.getContext("2d"); x.fillStyle="#fff"; x.font="900 64px sans-serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillText(txt,100,52,190); return x.getImageData(0,0,200,100).data; };
  let maskKey=null, raf=0, W0=0, H0=0; const t0=performance.now();
  const done=()=>{ cancelAnimationFrame(raf); try{ g.dispose(); mat.dispose(); R.dispose(); if(R.forceContextLoss) R.forceContextLoss(); }catch(e){} };
  (function f(now){ if(!cv.isConnected){ done(); return; } raf=requestAnimationFrame(f);
    const W=cv.clientWidth, H=cv.clientHeight; if(!W||!H) return; if(W!==W0||H!==H0){ W0=W; H0=H; R.setSize(W,H,false); cam.aspect=W/H; cam.updateProjectionMatrix(); U.uH.value=H; }
    const t=(now-t0)/1000, ls=lightsea(), cmd=activeCmd(), cue=typeof lsCue==="function"?lsCue():null, fx=cue?cue.fx:ls&&ls.fx||"breath";
    SEA.dim=cue?cue.dim:1; SEA.boost*=.965;
    U.uT.value=t; U.uCol.value.set(SEA.color||color||"#C7AEFF"); U.uFx.value=({breath:0,flash:1,wave:2,rainbow:3})[fx]??0; U.uBoost.value=SEA.boost; U.uDim.value=SEA.dim==null?1:SEA.dim; U.uWhite.value=cmd&&cmd.type==="white"?1:0;
    const txt=cmd&&cmd.type==="text"?cmd.text:""; if(txt!==maskKey){ maskKey=txt; U.uMask.value=txt?1:0;
      if(txt){ const m=textMask(txt), v=new THREE.Vector3(); cam.position.set(0,1.5,3); cam.lookAt(0,3.6,-14); cam.updateMatrixWorld();   /* 照畫面上看到的位置排字，手機直拿也不會切到 */
        for(let i=0;i<N;i++){ v.set(pos[i*3],pos[i*3+1],pos[i*3+2]).project(cam); const mx=Math.floor(((v.x+1)/2-.05)/.9*200), my=Math.floor(((1-v.y)/2-.08)/.5*100); mk[i]=mx>=0&&mx<200&&my>=0&&my<100&&m[(my*200+mx)*4+3]>80?1:0; } g.attributes.aMask.needsUpdate=true; } }
    cam.position.set(Math.sin(t*.13)*.3,1.5+Math.sin(t*.21)*.08,3); cam.lookAt(0,3.6,-14);
    R.render(sc,cam); })(t0);
}
/* 燈海畫布（2D）：顏色、效果、排字、自己的座位都畫在這裡 */
function seaRun2D(cv,color){
  const ctx=cv.getContext("2d"), dots=Array.from({length:380},()=>{ const d=Math.pow(Math.random(),.8); return {x:Math.random(),d,ph:Math.random()*6.28,sp:.8+Math.random()*1.6}; }).sort((a,b)=>a.d-b.d);
  const t0=performance.now(); let maskKey="", mask=null;
  const textMask=(txt,W,H)=>{ const c=document.createElement("canvas"); c.width=200; c.height=100; const x=c.getContext("2d"); x.fillStyle="#fff"; x.font="900 64px sans-serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillText(txt,100,52,190); return x.getImageData(0,0,200,100).data; };
  (function f(now){
    if(!cv.isConnected) return;
    const dpr=Math.min(2,devicePixelRatio||1), W=cv.clientWidth*dpr, H=cv.clientHeight*dpr; if(cv.width!==W||cv.height!==H){ cv.width=W; cv.height=H; }
    const t=(now-t0)/1000, ls=lightsea(), cmd=activeCmd(), cue=typeof lsCue==="function"?lsCue():null, fx=cue?cue.fx:ls&&ls.fx||"breath", baseCol=SEA.color||color; SEA.dim=cue?cue.dim:1;
    ctx.clearRect(0,0,W,H); ctx.globalCompositeOperation="lighter"; SEA.boost*=.965;
    const white=cmd&&cmd.type==="white", txt=cmd&&cmd.type==="text"?cmd.text:"";
    if(txt!==maskKey){ maskKey=txt; mask=txt?textMask(txt):null; }
    for(const p of dots){
      const y=H*(.5+.5*p.d), x=W*p.x+Math.sin(t*p.sp+p.ph)*4*dpr*(1+SEA.boost*2), r=(1.2+p.d*4.2)*dpr;
      let a, col=white?"255,255,255":hex2rgbArr(fx==="rainbow"?LS_COLORS[Math.floor((p.x*6+t*.8))%LS_COLORS.length]:baseCol);
      if(fx==="flash") a=(Math.sin(t*9+p.ph*.2)>0?.85:.12); else if(fx==="wave") a=.15+.8*Math.max(0,Math.sin(t*2.4-p.x*9+p.d*2)); else a=.3+.3*(.5+.5*Math.sin(t*2.3+p.ph))+.25*Math.max(0,Math.sin(t*1.7-p.x*7));
      if(mask){ const mx=Math.floor(p.x*200), my=Math.floor(((y/H)-.5)/.5*100); const on=mx>=0&&mx<200&&my>=0&&my<100&&mask[(my*200+mx)*4+3]>80; a=on?1:.06; if(on) col="255,255,255"; }
      a=Math.min(1,a+.5*SEA.boost)*(.35+.65*p.d)*(SEA.dim==null?1:SEA.dim);
      const g=ctx.createRadialGradient(x,y,0,x,y,r*3); g.addColorStop(0,`rgba(255,255,255,${a})`); g.addColorStop(.25,`rgba(${col},${a})`); g.addColorStop(1,`rgba(${col},0)`);
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r*3,0,7); ctx.fill();
    }
    if(mask){ const step=3, pulse=.75+.25*Math.sin(t*5);   // 排字：把字型的點直接畫亮，遠看就是一排字
      for(let gy=0;gy<100;gy+=step) for(let gx=0;gx<200;gx+=step){ if(mask[(gy*200+gx)*4+3]<=80) continue;
        const x=W*(.08+.84*gx/200), y=H*(.2+.42*gy/100), r=(1.8+1.6*gy/100)*dpr, gg=ctx.createRadialGradient(x,y,0,x,y,r*3);
        gg.addColorStop(0,`rgba(255,255,255,${pulse})`); gg.addColorStop(.35,`rgba(${hex2rgbArr(baseCol)},${pulse*.8})`); gg.addColorStop(1,"rgba(0,0,0,0)"); ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(x,y,r*3,0,7); ctx.fill(); } }
    ctx.globalCompositeOperation="source-over"; requestAnimationFrame(f);
  })(t0);
}
/* 粉絲端：每 0.4 秒跟著燈控台走 */
let ccTimer=null;
function ccTick(){
  const box=layer.querySelector(".concert2"); if(!box){ clearInterval(ccTimer); return; } rgSync();
  const ls=lightsea(), cmd=activeCmd(), el=layer.querySelector(".concert-ls"), base=box.dataset.glow;
  const col=cmd&&cmd.type==="white"?"#FFFFFF":ls&&ls.color?ls.color:base; SEA.color=col;
  if(el&&el._ls&&!el._ls._dk&&el._ls._col!==col){ el._ls._col=col; el._ls.set("glow",col); }
  if(el&&el._ls){ const cue=typeof lsCue==="function"?lsCue():null, fx=cue?cue.fx:ls&&ls.fx; el._ls.set("pulse",fx==="flash"?2:fx==="wave"?1:3); const dk=cue&&cue.dim<.3; if(el._ls._dk!==dk){ el._ls._dk=dk; el._ls.set("glow",dk?"#2A2430":col); el._ls._col=dk?"#2A2430":col; } }
  { const nw=document.getElementById("ccNow"); if(nw){ const tl=ls&&ls.tl; nw.textContent=tl?(tl.done?"演出結束，謝謝大家":`${tl.ia?"互動中":"純放中"}・現在播放《${trackName(tl.cur.sid)}》`):""; } }
  { const bb=document.getElementById("ccBd"); if(bb){ const tl=ls&&ls.tl; bb.hidden=!(!tl||tl.ia); } }
  const ban=document.getElementById("ccCmd"), k=cmd?cmd.ts:"";
  if(ban&&ban.dataset.k!==String(k)){ ban.dataset.k=k; ban.className="cc-cmd"+(cmd?" show":"");
    ban.innerHTML=!cmd?"":cmd.type==="wave"?"🙌 一起揮！大家把應援棒舉高":cmd.type==="white"?"🤍 全場亮白燈":cmd.type==="text"?`🔤 全場排字「${esc(cmd.text)}」`:`🔥 全場任務：30 秒揮滿 ${fmt(cmd.target)} 下！`;
    if(cmd&&cmd.type==="mission"){ ui.misBase=ui.swings||0; ui.misDone=false; } }
  const mb=document.getElementById("ccMis");
  if(mb){ if(cmd&&cmd.type==="mission"){ const el2=(Date.now()-cmd.ts)/1000, others=Math.floor(cmd.target*.86*Math.min(1,el2/28)), mine=(ui.swings||0)-(ui.misBase||0), v=Math.min(cmd.target,others+mine*12);
      mb.hidden=false; mb.querySelector("i").style.width=(v/cmd.target*100)+"%"; mb.querySelector("b").textContent=`${fmt(v)} / ${fmt(cmd.target)}・你揮了 ${mine} 下`;
      if(v>=cmd.target&&!ui.misDone){ ui.misDone=true; S.set(K.points,points()+20); confetti(innerWidth/2,innerHeight/3); toast("任務達成！獲得 20 積分 ✨"); } }
    else mb.hidden=true; }
}
function concertOn(){
  const ls=lightsea(); if(!ls){ toast("現在沒有演唱會，演唱會時間到了才能進燈海喔"); return; } if(!ls.demo&&!tourGate()) return; audioUnlock();
  const gid0=ls.gid, own=hasStick(gid0), gid=own?gid0:"generic", g=groupOf(gid0), ds=stickOf(gid), glow=ds.glow||GRADS[g.g%GRADS.length][0];
  ui.ccCount=1; ui.swings=0; ui.heat=0; ui.ccStart=Date.now(); ui.ccGroup=gid0;
  layer.innerHTML=`<div class="concert2" role="dialog" aria-label="應援棒模式" data-glow="${glow}">
    <span class="cc-sky" style="background:radial-gradient(120% 70% at 50% 105%,${glow}66,transparent 60%),radial-gradient(80% 50% at 50% -10%,${glow}33,transparent 70%),linear-gradient(#0B0820,#140B2E 55%,#1E0F3A)"></span>
    <span class="cc-beam b1" style="background:linear-gradient(${glow}aa,transparent 75%);clip-path:polygon(45% 0,55% 0,100% 100%,0 100%)"></span><span class="cc-beam b2" style="background:linear-gradient(#ffffffaa,transparent 70%);clip-path:polygon(45% 0,55% 0,100% 100%,0 100%)"></span>
    <canvas class="cc-sea"></canvas>
    <header class="cc-top"><button class="cc-x" data-a="concertOff" aria-label="關閉應援棒模式">${XI}</button><button class="cc-x cc-more" data-a="ccMenu" aria-label="更多" style="position:absolute;right:14px;top:calc(env(safe-area-inset-top,0px) + 12px)">⋯</button>
      <div class="cc-t"><span class="cc-pill"><i></i>${esc(g.name)}・${esc(ls.title)}</span><b>${own?esc(g.name)+" 官方應援棒":"通用應援棒"}</b><small id="ccCount">${fmt(ui.ccCount)} 人一起亮燈</small><span class="cc-seat">${fsWhen(ls.endTs).split(" ")[1]} 結束</span><small id="ccNow"></small></div></header>
    <div id="ccCmd" class="cc-cmd"></div><div id="ccInv" class="cc-cmd show" style="margin-top:58px" hidden><span>音樂挑戰開始</span><button data-a="rgJoin" style="margin-left:10px;padding:2px 12px;border-radius:8px;background:#fff;color:#3C3489;font-weight:700">加入</button></div>
    <div id="ccMis" class="cc-mis" hidden><i></i><b></b></div><button id="ccBd" class="cc-bd" data-a="bdOpen" hidden>🪧 舉牌</button>
    <div class="ls-box concert-ls" data-ls="${gid}" data-o="swing,bright,pulse,still"></div>
    <div class="cc-heat"><span>熱度</span><i><u id="ccHeat"></u></i></div>
    <div class="cc-foot"><p class="cc-hint">左右拖動揮舞・上下拖動前後搖擺</p><div class="cc-fb"><button class="cc-chant" data-a="bdOpen">🪧 應援板</button><button class="cc-chant" data-a="chantStart">🎵 應援口號挑戰</button><button class="cc-chant cc-lv" data-a="rgLv">音樂難度：${rgLv()==="easy"?"輕鬆":"普通"}</button></div></div>
    <div id="chant" class="chant" hidden></div>
  </div>`;
  mountSticks(layer); seaRun(layer.querySelector(".cc-sea"),glow);
  clearInterval(ccTimer); ccTimer=setInterval(ccTick,400); ccTick();
  clearInterval(concertTimer); concertTimer=setInterval(()=>{
    const c=document.getElementById("ccCount"); if(!c){ clearInterval(concertTimer); return; } c.textContent=fmt(ui.ccCount)+" 人一起亮燈"; },1500);
}

/* ===== 藝人端：走進演唱會現場（手上拿的是麥克風；燈海裡會隨機舉起粉絲的應援板） ===== */

function artStageOn(){
  const s=session(), mid=s.member||uniMe(), ls=lightsea(); if(!ls){ toast("現在沒有演唱會"); return; }
  const g=groupOf(ls.gid), glow=GRADS[g.g%GRADS.length][0], cc=curConcert();
  ui.stMid=mid; ui.ccCount=1;
  layer.innerHTML=`<div class="concert2 stage" role="dialog" aria-label="演唱會現場" data-glow="${glow}">
    <span class="cc-sky" style="background:radial-gradient(120% 70% at 50% 105%,${glow}66,transparent 60%),radial-gradient(80% 50% at 50% -10%,${glow}33,transparent 70%),linear-gradient(#0B0820,#140B2E 55%,#1E0F3A)"></span>
    <span class="cc-beam b1" style="background:linear-gradient(${glow}aa,transparent 75%);clip-path:polygon(45% 0,55% 0,100% 100%,0 100%)"></span><span class="cc-beam b2" style="background:linear-gradient(#ffffffaa,transparent 70%);clip-path:polygon(45% 0,55% 0,100% 100%,0 100%)"></span>
    <canvas class="cc-sea"></canvas>
    <div class="st-bds" id="stBds"></div>
    <header class="cc-top"><button class="cc-x" data-a="stOff" aria-label="離開舞台">${XI}</button><button class="cc-x cc-more" data-a="stMenu" aria-label="更多" style="position:absolute;right:14px;top:calc(env(safe-area-inset-top,0px) + 12px)">⋯</button>
      <div class="cc-t"><span class="cc-pill"><i></i>${esc(g.name)}・${esc(ls.title)}</span><b>${esc(artName(mid,"feed"))}</b><span class="cc-seat">${fsWhen(ls.endTs).split(" ")[1]} 結束</span><small id="ccNow"></small></div></header>
    <div id="ccCmd" class="cc-cmd"></div><div id="ccMis" class="cc-mis" hidden><i></i><b></b></div>
    <div class="st-mic3" id="stMic"></div>
    <div class="st-dock" id="stDock">${stDockHtml()}</div>
  </div>`;
  seaRun(layer.querySelector(".cc-sea"),glow);
  clearInterval(ccTimer); ccTimer=setInterval(()=>{ ccTick(); stTick(); },400); ccTick();
  clearInterval(ui.stBdT); ui.stBdT=setInterval(stBoardPop,2300); setTimeout(stBoardPop,700);
  stMicDrag(); }
function stCan(){ const cc=curConcert(); return canCtl(cc,ui.stMid); }
function stDockHtml(){ const ls=lightsea(); if(!ls) return ""; if(!stCan()) return "";
  const cc=curConcert(), tl=cc&&ccTimeline(cc), ia=!tl||tl.ia, col=ls.color||"", fx=ls.fx||"breath", c=activeCmd(), mid=ui.stMid;
  return `<div class="st-cols">${[["",grad(MEMBERS[mid].g)],...LS_COLORS.map(h=>[h,h])].map(([v,bg])=>`<button class="${col===v?"on":""}" data-a="stColor" data-v="${v}" style="background:${bg}" aria-label="燈色"></button>`).join("")}</div>
    <div class="st-fx">${Object.entries(LS_FX).map(([k,l])=>`<button class="${fx===k?"on":""}" data-a="stFx" data-v="${k}">${l}</button>`).join("")}</div>
    ${ia?`<div class="st-cmd">${[["wave","🙌","一起揮"],["white","🤍","亮白燈"],["text","🔤","排字"],["mission","🔥","全場任務"]].map(([k,e,l])=>`<button class="${c&&c.type===k?"on":""}" data-a="stCmd" data-v="${k}"><i>${e}</i><span>${l}</span></button>`).join("")}</div>`:`<div class="st-rest">♪ 純放中，休息一下吧</div>`}`; }
function stRefresh(){ const d=document.getElementById("stDock"); if(d) d.innerHTML=stDockHtml(); }
function stTick(){ const st=layer.querySelector(".concert2.stage"); if(!st) return; const ls=lightsea(); if(!ls){ stOff(); toast("演唱會結束了，辛苦了 💜"); return; }
  const k=JSON.stringify([ls.color,ls.fx,(activeCmd()||{}).type,(curConcert()&&ccTimeline(curConcert())||{}).ia,stCan()]); if(ui.stK!==k){ ui.stK=k; stRefresh(); } }
function stBoardPop(){ const host=document.getElementById("stBds"); if(!host){ clearInterval(ui.stBdT); return; }
  const cc=curConcert(); if(!cc) return; if(!cc.id) cc.id="demo-cc"; const tl=ccTimeline(cc); if(tl&&!tl.ia) return; bdSim(cc);
  const mid=ui.stMid, shown=new Set([...host.children].map(x=>x.dataset.v)), L=bdAll().filter(x=>x.cid===cc.id&&x.up&&!x.ans&&(x.tg===mid||x.tg==="all")&&!shown.has(x.id)); if(!L.length||host.children.length>=3) return;
  const x=L[Math.floor(Math.random()*L.length)], el=document.createElement("button"); el.className="st-bd"; el.dataset.a="stBd"; el.dataset.v=x.id;
  const side=host.children.length%2?Math.random()<.5:host.querySelector(".st-bd")?.dataset.side!=="l"; el.dataset.side=side?"l":"r"; el.style.left=(side?3+Math.random()*16:56+Math.random()*12)+"%"; el.style.bottom=(33+Math.random()*14)+"%"; el.style.setProperty("--r",(Math.random()*14-7).toFixed(1)+"deg");
  el.innerHTML=bdHtml(x,cc.gid,true); host.appendChild(el); setTimeout(()=>{ el.classList.add("out"); setTimeout(()=>el.remove(),450); },5000); }
/* 麥克風：真的 3D，跟應援棒同一個畫法、同一套彈簧（左右、前後都能揮） */
function stMicDrag(){ const m=document.getElementById("stMic"); if(!m) return; const ls=lightsea(), col=(ls&&ls.color)||m.closest(".concert2")?.dataset.glow||"#C7AEFF";
  m._ls=LS3D.mount(m,{glow:col},{mic:true,swing:true,auto:false,glow:col,onSwing:v=>{ SEA.boost=Math.min(1.4,SEA.boost+v*.003); }}); }
function stOff(){ clearInterval(ccTimer); clearInterval(ui.stBdT); ui.stK=null; layer.innerHTML=""; render(); }
function stReply(id,txt){ const L=bdAll(), x=L.find(y=>y.id===id); if(!x) return; x.ans={by:ui.stMid,text:txt,ts:Date.now()}; x.up=false; bdSave(L); const el=document.querySelector(`.st-bd[data-v="${id}"]`); if(el){ el.classList.add("hit"); setTimeout(()=>el.remove(),500); } toast("已回應 💜"); }
function stSheet(html){ const st=layer.querySelector(".concert2.stage"); if(!st) return; st.querySelector(".st-shw")?.remove(); const w=document.createElement("div"); w.className="st-shw"; w.dataset.a="stShX"; w.innerHTML=`<div class="st-sh" data-a="stNoop">${html}</div>`; st.appendChild(w); requestAnimationFrame(()=>w.classList.add("open")); }
function stMenu(){ const cc=curConcert(), mid=ui.stMid, host=cc&&!cc.demo&&cc.host===mid, items=[];
  if(host){ const ms=grpMembers(MEMBERS[mid].group).filter(x=>x!==mid&&!MEMBERS[x].official); if(ms.length) items.push(`<b class="st-sht">一起控燈的成員</b><div class="st-co">${ms.map(x=>`<button class="${cc.co===x?"on":""}" data-a="stCo" data-v="${x}"><span class="av" style="background:${grad(MEMBERS[x].g)}">${mAvIn(x)}</span>${esc(artName(x,"feed"))}</button>`).join("")}</div>`); }
  if(stCan()&&!(cc&&cc.setlist)){ const gid=MEMBERS[mid].group, T=getTracks(), songs=[...getMShow().songs,...(getMShow().ended||[])].filter(x=>x.gid===gid&&T[x.id]); items.push(`<b class="st-sht">播放音樂</b><div class="st-songs">${songs.map(x=>`<button data-a="stPlay" data-v="${x.id}">▶ 《${esc(x.title)}》</button>`).join("")}<button data-a="stPlay" data-v="demo">▶ 示範曲</button><button data-a="stPlay" data-v="">■ 停止</button></div>`); }
  if(cc&&(host||(!cc.host&&!cc.demo))) items.push(`<button class="st-end" data-a="stEnd">結束演唱會</button>`);
  items.push(`<button class="st-cancel" data-a="stShX">取消</button>`); stSheet(items.join("")); }

function onSwingMove(v){ SEA.boost=Math.min(1.4,SEA.boost+v*.004); ui.swAcc=(ui.swAcc||0)+v; if(ui.swAcc>90){ ui.swAcc=0; ui.swings=(ui.swings||0)+1; ui.heat=Math.min(100,(ui.heat||0)+3); } const h=document.getElementById("ccHeat"); if(h) h.style.width=(ui.heat||0)+"%"; }
setInterval(()=>{ if(ui.heat>0){ ui.heat=Math.max(0,ui.heat-1); const h=document.getElementById("ccHeat"); if(h) h.style.width=ui.heat+"%"; } },500);
function concertOff(){
  rgStop(); clearInterval(concertTimer); clearInterval(ccTimer); concertTimer=null; chantStop(); try{ navigator.vibrate&&navigator.vibrate(0); }catch(e){} layer.innerHTML="";
}
/* =========================================================
   演唱會音樂節奏遊戲
   ・管理員在 FOC 幫每首歌上傳音樂（存在這支手機的 IndexedDB），App 自動抓節拍（BPM、第一拍）
   ・應援詞：管理員先打好「一行一句」，播歌時在該喊的地方點一下，時間就記下來
   ・演唱會中，藝人在燈控台按播放 → 燈海裡的粉絲 3 秒後一起從同一秒開始
   ・畫面：音符從上面掉下來；← → 是揮應援棒（往那個方向滑），中間黃色的應援詞是點一下
   ・正式版接上 Firebase 後，音樂檔放雲端，每支手機才會自動下載
   ========================================================= */
const getTracks=()=>S.get(K.tracks,{});
const rgLv=()=>S.get(K.rgLv,"normal");
const DEMO_TRACK={name:"Starlight Beat",bpm:120,offset:.5,dur:64,demo:true};
function trackOf(sid){
  if(sid==="demo"){ const lc=liveConcert()||(ui.lsDemo&&ui.lsDemo.endTs>Date.now()?ui.lsDemo:null); const g=groupOf((lc||{}).gid)||groupOf(ui.rgDemoG)||GROUPS[0];
    const ms=Object.keys(MEMBERS).filter(id=>MEMBERS[id].group===g.id&&!MEMBERS[id].official).map(id=>MEMBERS[id].name);
    const words=[g.name+"！",...ms.map(n=>n+"！"),"사랑해！","♡ "+g.name+" ♡"], chant=[]; for(let b=8,i=0;b<116;b+=8,i++) chant.push({t:DEMO_TRACK.offset+b*.5,text:words[i%words.length]});
    return {...DEMO_TRACK,chant}; }
  return getTracks()[sid]||null;
}
const trackName=sid=>sid==="demo"?DEMO_TRACK.name:songName(songOf(sid));
let auCtx=null; const auBuf={};
function audioCtx(){ const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return null;
  try{ if(navigator.audioSession) navigator.audioSession.type="playback"; }catch(e){}   // iPhone 靜音開關打開也能聽到
  if(!auCtx){ auCtx=sfxCtx||new AC(); sfxCtx=auCtx; } if(auCtx.state!=="running"&&auCtx.state!=="closed"){ try{ auCtx.resume(); }catch(e){} } return auCtx; }
let rgMedia=null, silentURL=null;
function mediaEl(){ if(!rgMedia){ rgMedia=document.createElement("audio"); rgMedia.playsInline=true; rgMedia.setAttribute("playsinline",""); rgMedia.setAttribute("webkit-playsinline",""); rgMedia.preload="auto";
    rgMedia.style.cssText="position:fixed;left:-20px;top:-20px;width:2px;height:2px;opacity:0;pointer-events:none"; document.body.appendChild(rgMedia); } return rgMedia; }
function silentWav(){ if(silentURL) return silentURL; const n=2205, ab=new ArrayBuffer(44+n*2), v=new DataView(ab), w=(o,t)=>{ for(let i=0;i<t.length;i++) v.setUint8(o+i,t.charCodeAt(i)); };
  w(0,"RIFF"); v.setUint32(4,36+n*2,true); w(8,"WAVE"); w(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true); v.setUint32(24,22050,true); v.setUint32(28,44100,true); v.setUint16(32,2,true); v.setUint16(34,16,true); w(36,"data"); v.setUint32(40,n*2,true);
  return silentURL=URL.createObjectURL(new Blob([ab],{type:"audio/wav"})); }
/* iPhone 規定：聲音要在「手指點下去的那一刻」先播過一次，之後才能自動播 */
function mediaUnlock(){ const m=mediaEl(); try{ if(!m.paused) return; if(!m.dataset.sid) m.src=silentWav(); const tok=m._u=Math.random(); m.muted=true; const p=m.play(); const done=()=>{ if(m._u!==tok) return; m.pause(); m.muted=false; m._u=0; }; if(p&&p.then) p.then(done).catch(()=>{ if(m._u===tok){ m.muted=false; m._u=0; } }); else done(); }catch(e){} }
function mediaPlay(m){ m._u=0; m.muted=false; return m.play(); }
async function demoBlob(){ if(memBlobs.au_demo) return memBlobs.au_demo; const b=await trackBuffer("demo"); if(!b) return null; return memBlobs.au_demo=await compactWav(b); }
async function mediaLoad(sid){ const m=mediaEl(); if(m.dataset.sid===sid) return m; const blob=sid==="demo"?await demoBlob():await auGet(sid); if(!blob) return null;
  if(m._url) URL.revokeObjectURL(m._url); m._url=URL.createObjectURL(blob); m.src=m._url; m.dataset.sid=sid; try{ m.load(); }catch(e){}
  await new Promise(r=>{ const t=setTimeout(r,5000); m.onloadedmetadata=()=>{ clearTimeout(t); r(); }; }); return m; }
function mediaStop(){ if(rgMedia){ try{ rgMedia.pause(); }catch(e){} } }
function mediaDur(blob){ return new Promise(res=>{ const v=document.createElement("video"), u=URL.createObjectURL(blob); let done=false; const fin=x=>{ if(done) return; done=true; URL.revokeObjectURL(u); res(x); };
  v.preload="metadata"; v.playsInline=true; v.muted=true; v.onloadedmetadata=()=>fin(isFinite(v.duration)?v.duration:0); v.onerror=()=>fin(0); setTimeout(()=>fin(0),8000); v.src=u; }); }
function audioUnlock(){ mediaUnlock(); const c=audioCtx(); if(!c) return; try{ const b=c.createBuffer(1,1,22050), s=c.createBufferSource(); s.buffer=b; s.connect(c.destination); s.start(0); }catch(e){} }
const decodeAu=(c,ab)=>new Promise((res,rej)=>{ try{ const p=c.decodeAudioData(ab,res,rej); if(p&&p.then) p.then(res,rej); }catch(e){ rej(e); } });
async function trackBuffer(sid){
  if(auBuf[sid]) return auBuf[sid]; const c=audioCtx(); if(!c) return null; if(sid!=="demo"&&(getTracks()[sid]||{}).media) return null;
  if(sid==="demo") return auBuf[sid]=await demoSong();
  const blob=await auGet(sid); if(!blob) return null;
  return auBuf[sid]=await decodeAu(c,await blob.arrayBuffer());
}
/* 示範曲：App 自己合成的 64 秒節拍（不需要上傳） */
async function demoSong(){
  const sr=22050, d=DEMO_TRACK.dur, OC=window.OfflineAudioContext||window.webkitOfflineAudioContext, oc=new OC(1,sr*d,sr), spb=60/DEMO_TRACK.bpm, o=DEMO_TRACK.offset;
  const out=oc.createGain(); out.gain.value=.8; out.connect(oc.destination);
  const noise=oc.createBuffer(1,sr*.2,sr); { const ch=noise.getChannelData(0); for(let i=0;i<ch.length;i++) ch[i]=Math.random()*2-1; }
  const chords=[[261.6,329.6,392],[196,246.9,293.7],[220,261.6,329.6],[174.6,220,261.6]], nb=Math.floor((d-o-1)/spb);
  const env=(g,t,v,a,len)=>{ g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(v,t+a); g.gain.exponentialRampToValueAtTime(.0001,t+len); };
  for(let b=0;b<nb;b++){ const t=o+b*spb, ch=chords[(b/4|0)%4];
    { const os=oc.createOscillator(), g=oc.createGain(); os.frequency.setValueAtTime(150,t); os.frequency.exponentialRampToValueAtTime(45,t+.12); env(g,t,.9,.005,.26); os.connect(g); g.connect(out); os.start(t); os.stop(t+.3); }
    { const s=oc.createBufferSource(), f=oc.createBiquadFilter(), g=oc.createGain(), tt=t+spb/2; s.buffer=noise; f.type="highpass"; f.frequency.value=7000; env(g,tt,.22,.003,.07); s.connect(f); f.connect(g); g.connect(out); s.start(tt); s.stop(tt+.09); }
    if(b%2===1){ const s=oc.createBufferSource(), f=oc.createBiquadFilter(), g=oc.createGain(); s.buffer=noise; f.type="bandpass"; f.frequency.value=1500; env(g,t,.5,.003,.16); s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t+.18); }
    if(b%4===0) ch.forEach(fq=>{ const os=oc.createOscillator(), g=oc.createGain(); os.type="triangle"; os.frequency.value=fq; env(g,t,.06,.05,spb*4-.05); os.connect(g); g.connect(out); os.start(t); os.stop(t+spb*4); });
    [0,1].forEach(k=>{ const tt=t+k*spb/2, os=oc.createOscillator(), g=oc.createGain(); os.frequency.value=ch[(b*2+k)%3]*2; env(g,tt,.05,.01,spb/2-.02); os.connect(g); g.connect(out); os.start(tt); os.stop(tt+spb/2); });
  }
  return await new Promise((res,rej)=>{ oc.oncomplete=e=>res(e.renderedBuffer); const p=oc.startRendering(); if(p&&p.then) p.then(res,rej); });
}
/* 把聲音存成小一點的 WAV（單聲道 22kHz），影片或大檔就不用整個存起來 */
/* 演唱會音樂放 R2（不用 Supabase）：上傳的手機傳上去；粉絲手機第一次用到時下載，存在自己手機，之後不再下載 */
async function auR2Put(sid,blob){ if(!blob||blob.size>45*1024*1024||!MEDIA_URL||!HB_ON||!HB.tok||sbxOn()) return null; const id="au_"+sid+"_"+Date.now().toString(36);
  for(let i=0;i<3;i++){ try{ const r=await fetch(MEDIA_URL+"/media/"+encodeURIComponent(id),{method:"PUT",headers:{Authorization:"Bearer "+HB.tok,"Content-Type":blob.type||"audio/wav"},body:blob}); if(r.ok||r.status===409) return MEDIA_URL+"/media/"+encodeURIComponent(id); if(r.status===401) await hbRefresh(); }catch(e){} await new Promise(r=>setTimeout(r,1500*(i+1))); } return null; }
function auShare(sid,blob){ auR2Put(sid,blob).then(u=>{ if(!u) return; try{ localStorage.setItem("au_u_"+sid,u); }catch(e){} const T=getTracks(); if(!T[sid]) return; T[sid]={...T[sid],url:u}; S.set(K.tracks,T); }); }
const AU_DL={};
async function auGet(sid){ let b=null; try{ b=await MDB.get("au_"+sid); }catch(e){} const u=(getTracks()[sid]||{}).url; if(b&&(!u||MDB_AU_URL(sid)===u)) return b; if(!u) return b;
  if(!AU_DL[sid]) AU_DL[sid]=(async()=>{ try{ const r=await fetch(u); if(!r.ok) return b; const nb=await r.blob(); try{ await MDB.put("au_"+sid,nb,true); localStorage.setItem("au_u_"+sid,u); }catch(e){} return nb; }catch(e){ return b; } finally{ delete AU_DL[sid]; } })();
  return AU_DL[sid]; }
const MDB_AU_URL=sid=>{ try{ return localStorage.getItem("au_u_"+sid)||""; }catch(e){ return ""; } };
/* 之前只存在管理員手機的歌：打開 App 時補傳一次 */
setTimeout(async()=>{ try{ if(!isAdminAcct()||!MEDIA_URL) return; const T=getTracks(); for(const sid of Object.keys(T)){ if(T[sid].url||sid==="demo") continue; const b=await MDB.get("au_"+sid); if(b) auShare(sid,b); } }catch(e){} },8000);
async function compactWav(buf){
  const sr=22050, len=Math.ceil(buf.duration*sr), OC=window.OfflineAudioContext||window.webkitOfflineAudioContext, oc=new OC(1,len,sr), src=oc.createBufferSource(); src.buffer=buf; src.connect(oc.destination); src.start(0);
  const out=await new Promise((res,rej)=>{ oc.oncomplete=e=>res(e.renderedBuffer); const p=oc.startRendering(); if(p&&p.then) p.then(res,rej); });
  const d=out.getChannelData(0), ab=new ArrayBuffer(44+d.length*2), v=new DataView(ab), w=(o,str)=>{ for(let i=0;i<str.length;i++) v.setUint8(o+i,str.charCodeAt(i)); };
  w(0,"RIFF"); v.setUint32(4,36+d.length*2,true); w(8,"WAVE"); w(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true); v.setUint32(24,sr,true); v.setUint32(28,sr*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true); w(36,"data"); v.setUint32(40,d.length*2,true);
  for(let i=0;i<d.length;i++){ const x=Math.max(-1,Math.min(1,d[i])); v.setInt16(44+i*2,x<0?x*32768:x*32767,true); }
  return new Blob([ab],{type:"audio/wav"});
}
/* 自動抓節拍：把音量的「突然變大」畫成一條線，找出最整齊的拍子（85–170 BPM）跟第一拍的位置 */
function analyzeBeats(buf){
  const sr=buf.sampleRate, hop=Math.round(sr*.0116), a=buf.getChannelData(0), b=buf.numberOfChannels>1?buf.getChannelData(1):null, n=Math.floor(a.length/hop), env=new Float32Array(n);
  let prev=0; for(let i=0;i<n;i++){ let e=0; const s=i*hop; for(let j=0;j<hop;j+=2){ const v=b?(a[s+j]+b[s+j])*.5:a[s+j]; e+=v*v; } e=Math.sqrt(e/(hop/2)); env[i]=Math.max(0,e-prev); prev=e; }
  const fps=sr/hop;
  const score=bpm=>{ const P=fps*60/bpm; let best=-1, ph=0; for(let p=0;p<P;p+=1){ let s=0, c=0; for(let x=p;x<n;x+=P){ s+=env[Math.round(x)]||0; c++; } s/=c; if(s>best){ best=s; ph=p; } } return {s:best,ph}; };
  let bb=120, bs=-1; for(let bpm=85;bpm<=170;bpm+=1){ const r=score(bpm); if(r.s>bs){ bs=r.s; bb=bpm; } }
  let fb=bb, fs=-1, fph=0; for(let bpm=bb-1;bpm<=bb+1;bpm+=.05){ const r=score(bpm); if(r.s>fs){ fs=r.s; fb=bpm; fph=r.ph; } }
  const P=60/fb; let off=fph/fps; while(off-P>=0) off-=P;
  return {bpm:Math.round(fb*100)/100,offset:Math.round(off*1000)/1000,dur:buf.duration};
}
function buildNotes(tr,lv){
  if(!tr.bpm) return (tr.chant||[]).map(c=>({t:c.t,type:"c",text:c.text}));
  const spb=60/tr.bpm, step=lv==="easy"?2:1, ch=(tr.chant||[]).map(c=>({t:c.t,type:"c",text:c.text})), notes=[...ch];
  let d=-1; for(let k=4;;k+=step){ const t=tr.offset+k*spb; if(t>tr.dur-1) break; if(ch.some(c=>Math.abs(c.t-t)<.3)) continue; notes.push({t,type:"s",d}); d=-d; }
  return notes.sort((x,y)=>x.t-y.t);
}

/* ---------- 遊戲本體 ---------- */
async function rgStart({sid,at,mode}){
  rgStop(); const tr=trackOf(sid); if(!tr) return;
  chantStop(); const cb=document.getElementById("chant"); if(cb){ cb.hidden=true; cb.innerHTML=""; }
  const st=ui.rg={key:sid+"@"+at,sid,tr,mode,notes:buildNotes(tr,rgLv()),i:0,zero:performance.now()+(at-Date.now()),score:0,combo:0,max:0,p:0,g:0,m:0,ended:false,fx:[]};
  const w=document.createElement("div"); w.id="rgW"; w.className="rg-w m-"+mode;
  w.innerHTML=`<canvas id="rgCv"></canvas>
    <div class="rg-hud"><div class="rg-song"><b>♪ ${esc(trackName(sid))}</b><i><u id="rgProg"></u></i></div><div class="rg-sc"><b id="rgScore">0</b><small id="rgCombo"></small></div><button class="rg-x" data-a="rgQuit" aria-label="離開">${XI}</button></div>
    <p class="rg-tip" id="rgTip"><span>← 往左滑</span><span>點一下喊</span><span>往右滑 →</span></p>
    <p class="rg-cd" id="rgCd"></p><em class="rg-j" id="rgJ"></em><b class="rg-shout" id="rgShout"></b><p class="rg-msg" id="rgMsg"></p>`;
  document.body.appendChild(w); document.body.classList.add("rg-on"); rgInput(w); requestAnimationFrame(rgLoop);
  let buf=null; try{ buf=await trackBuffer(sid); }catch(e){}
  if(ui.rg!==st) return; const c=audioCtx();
  if(buf&&c){ const lat=(c.outputLatency||0)+(c.baseLatency||0), startIn=(st.zero-performance.now())/1000;
    const src=c.createBufferSource(); src.buffer=buf; src.connect(c.destination);
    if(startIn>=0) src.start(c.currentTime+startIn); else if(-startIn<buf.duration) src.start(0,-startIn); st.src=src; st.zero+=lat*1000; }
  else if(!(await rgMediaStart(st))){ const m=document.getElementById("rgMsg"); if(m) m.innerHTML=`這支手機上讀不到這首歌的音樂，請管理員重新上傳一次 <button class="rg-snd" data-a="sndTest" data-v="${st.sid}">聲音測試</button>`; }
}
async function rgMediaStart(st){
  const m=await mediaLoad(st.sid); if(!m) return false; if(ui.rg!==st) return true;
  const go=async()=>{ if(ui.rg!==st||st.ended) return; const t=(performance.now()-st.zero)/1000; try{ m.currentTime=Math.max(0,t); await mediaPlay(m); st.media=m; }catch(e){ st.needTap=true; const el=document.getElementById("rgMsg"); if(el) el.textContent="點一下畫面開始播放音樂"; } };
  const wait=st.zero-performance.now(); if(wait>0) setTimeout(go,wait); else go(); setTimeout(()=>rgVerify(st),Math.max(0,wait)+1500); return true;
}
async function rgVerify(st){ if(ui.rg!==st||st.ended||st.needTap) return; const m=st.media; if(m&&!m.paused&&m.currentTime>.1) return;
  const el=document.getElementById("rgMsg"); if(el) el.innerHTML=`放不出聲音，先跟著音符玩 <button class="rg-snd" data-a="sndTest" data-v="${st.sid}">聲音測試</button>`; }
function rgStop(){ const st=ui.rg; if(st&&st.src){ try{ st.src.stop(); }catch(e){} } if(st&&st.media) mediaStop(); ui.rg=null; document.body.classList.remove("rg-on"); const w=document.getElementById("rgW"); if(w) w.remove(); }
function rgInput(w){
  let p=null;
  w.addEventListener("pointerdown",e=>{ if(e.target.closest("button")) return; e.preventDefault(); const st=ui.rg; if(st&&st.needTap){ st.needTap=false; const m=mediaEl(); try{ m.currentTime=Math.max(0,(performance.now()-st.zero)/1000); mediaPlay(m).then(()=>{ st.media=m; const el=document.getElementById("rgMsg"); if(el) el.textContent=""; }).catch(()=>{}); }catch(err){} }
    p={x:e.clientX,y:e.clientY,t:performance.now(),used:false}; },{passive:false});
  w.addEventListener("pointermove",e=>{ if(!p||p.used) return; const dx=e.clientX-p.x; if(Math.abs(dx)>=26){ p.used=true; rgHit("swipe",dx<0?-1:1,performance.now()-30); } });
  const up=e=>{ if(!p) return; if(!p.used&&Math.abs(e.clientX-p.x)<22&&Math.abs(e.clientY-p.y)<30) rgHit("tap",0,p.t); p=null; };
  w.addEventListener("pointerup",up); w.addEventListener("pointercancel",()=>{ p=null; });
}
function rgHit(kind,dir,tp){
  const st=ui.rg; if(!st||st.ended) return; const now=(tp-st.zero)/1000;
  if(kind==="swipe"){ try{ onSwingMove(60); const el=layer.querySelector(".concert-ls"); if(el&&el._ls) el._ls.set("rv",dir*.35); }catch(e){} }
  let best=null, bd=1; for(let i=st.i;i<st.notes.length;i++){ const n=st.notes[i]; if(n.t-now>.25) break; if(n.r) continue; if((kind==="tap")!==(n.type==="c")) continue; const d=Math.abs(n.t-now); if(d<bd){ bd=d; best=n; } }
  if(!best||bd>.2) return;
  let j=bd<=.085?"Perfect":"Good"; if(kind==="swipe"&&best.d!==dir) j="Good";
  best.r=j==="Perfect"?"p":"g"; st[best.r]++; st.combo++; st.max=Math.max(st.max,st.combo); st.score+=(j==="Perfect"?100:50)+Math.min(st.combo,50)*2;
  const W=(document.getElementById("rgCv")||{}).clientWidth||innerWidth; st.fx.push({x:best.type==="c"?W*.5:best.d<0?W*.2:W*.8,t:now,c:best.type==="c"?"#FDE68A":j==="Perfect"?"#FFFFFF":"#F9A8D4"});
  if(best.type==="c"){ const s=document.getElementById("rgShout"); if(s){ s.textContent=best.text; s.classList.remove("go"); void s.offsetWidth; s.classList.add("go"); } }
  rgJudge(j);
}
function rgJudge(j){ const st=ui.rg, e=document.getElementById("rgJ"); if(e){ e.textContent=j; e.className="rg-j "+j.toLowerCase(); void e.offsetWidth; e.classList.add("pop"); }
  const s=document.getElementById("rgScore"), c=document.getElementById("rgCombo"); if(s&&st) s.textContent=fmt(st.score); if(c&&st) c.textContent=st.combo>1?st.combo+" COMBO":""; }
const rr=(x,a,b,w,h,r)=>{ x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r); x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); };
function rgLoop(){
  const st=ui.rg, cv=document.getElementById("rgCv"); if(!st||!cv) return;
  if(st.mode==="concert"&&!layer.querySelector(".concert2")){ rgStop(); return; }
  if(st.media&&!st.media.paused){ const z=performance.now()-st.media.currentTime*1000; if(Math.abs(z-st.zero)>35) st.zero=z; }   // 跟著影片的時間走
  const now=(performance.now()-st.zero)/1000;
  for(let i=st.i;i<st.notes.length;i++){ const n=st.notes[i]; if(n.t>now-.2) break; if(!n.r){ n.r="m"; st.m++; st.combo=0; rgJudge("Miss"); } }
  while(st.i<st.notes.length&&st.notes[st.i].r&&st.notes[st.i].t<now-.5) st.i++;
  const cd=document.getElementById("rgCd"); if(cd){ const s=Math.ceil(-now); cd.textContent=now<0&&s<=3?s:""; }
  const pg=document.getElementById("rgProg"); if(pg) pg.style.width=Math.max(0,Math.min(100,now/st.tr.dur*100))+"%";
  const tip=document.getElementById("rgTip"); if(tip&&now>8) tip.classList.add("off");
  const dpr=Math.min(2,devicePixelRatio||1), W=cv.clientWidth, H=cv.clientHeight; if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){ cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); }
  const x=cv.getContext("2d"); x.setTransform(dpr,0,0,dpr,0,0); x.clearRect(0,0,W,H);
  const JY=H*.74, TOP=H*.13, SPD=(JY-TOP)/1.5, LX={L:W*.2,C:W*.5,R:W*.8};
  x.textAlign="center"; x.textBaseline="middle";
  for(const k of ["L","C","R"]){ const g=x.createLinearGradient(0,TOP,0,JY); g.addColorStop(0,"rgba(255,255,255,0)"); g.addColorStop(1,k==="C"?"rgba(253,230,138,.35)":"rgba(255,255,255,.25)"); x.strokeStyle=g; x.lineWidth=2; x.beginPath(); x.moveTo(LX[k],TOP); x.lineTo(LX[k],JY); x.stroke(); }
  x.strokeStyle="rgba(255,255,255,.3)"; x.lineWidth=2; x.beginPath(); x.moveTo(W*.05,JY); x.lineTo(W*.95,JY); x.stroke();
  for(const k of ["L","R"]){ x.strokeStyle=k==="L"?"rgba(249,168,212,.95)":"rgba(196,181,253,.95)"; x.lineWidth=3; x.beginPath(); x.arc(LX[k],JY,25,0,6.283); x.stroke(); }
  x.strokeStyle="rgba(253,230,138,.9)"; x.lineWidth=3; rr(x,W*.5-46,JY-19,92,38,19); x.stroke();
  for(let i=st.i;i<st.notes.length;i++){ const n=st.notes[i], dt=n.t-now; if(dt>1.7) break; if(n.r==="p"||n.r==="g") continue;
    const y=JY-dt*SPD, a=n.r==="m"?Math.max(0,1-(now-n.t)*2.5):Math.min(1,(1.7-dt)*3); if(a<=0) continue; x.globalAlpha=a;
    if(n.type==="c"){ x.font="900 15px sans-serif"; const tw=Math.min(W*.56,x.measureText(n.text).width+30); x.fillStyle="#FDE68A"; x.shadowColor="rgba(253,230,138,.8)"; x.shadowBlur=14; rr(x,W*.5-tw/2,y-18,tw,36,18); x.fill(); x.shadowBlur=0; x.fillStyle="#5B21B6"; x.fillText(n.text,W*.5,y+1,tw-18); }
    else { const lx=n.d<0?LX.L:LX.R, col=n.d<0?"244,114,182":"167,139,250", g=x.createRadialGradient(lx,y,2,lx,y,24); g.addColorStop(0,"#fff"); g.addColorStop(.5,`rgba(${col},1)`); g.addColorStop(1,`rgba(${col},0)`); x.fillStyle=g; x.beginPath(); x.arc(lx,y,24,0,6.283); x.fill(); x.fillStyle="#fff"; x.font="900 17px sans-serif"; x.fillText(n.d<0?"←":"→",lx,y+1); }
    x.globalAlpha=1; }
  st.fx=st.fx.filter(f=>now-f.t<.4); for(const f of st.fx){ const p=(now-f.t)/.4; x.globalAlpha=1-p; x.strokeStyle=f.c; x.lineWidth=5*(1-p)+1; x.beginPath(); x.arc(f.x,JY,26+p*34,0,6.283); x.stroke(); } x.globalAlpha=1;
  if(now>st.tr.dur+.3&&!st.ended){ rgFinish(); return; }
  if(!st.ended) requestAnimationFrame(rgLoop);
}
function rgFinish(stopped){
  const st=ui.rg; if(!st||st.ended) return; st.ended=true; if(st.src){ try{ st.src.stop(); }catch(e){} } if(st.media) mediaStop();
  const tot=st.notes.length||1, played=st.p+st.g+st.m, acc=(st.p+st.g*.6)/Math.max(1,stopped?played:tot), gr=acc>=.95?"S":acc>=.85?"A":acc>=.7?"B":"C";
  const best=S.get(K.rgBest,{}), nb=st.score>(best[st.sid]||0); if(nb&&!stopped){ best[st.sid]=st.score; S.set(K.rgBest,best); }
  const w=document.getElementById("rgW"); if(!w) return;
  const box=document.createElement("div"); box.className="rg-res";
  box.innerHTML=`<small>${stopped?"藝人停止了這首歌":"演出結束"}</small><b class="rg-gr g${gr}">${gr}</b><strong>${fmt(st.score)}</strong>${nb&&!stopped?'<em>NEW BEST ✨</em>':""}
    <div class="rg-st"><span><i>Perfect</i>${st.p}</span><span><i>Good</i>${st.g}</span><span><i>Miss</i>${st.m}</span><span><i>最高連擊</i>${st.max}</span></div>
    <div class="rg-rb">${st.mode==="preview"?`<button class="btn btn-soft" data-a="rgClose">關閉</button><button class="btn btn-main" data-a="rgAgain" data-v="${st.sid}">再玩一次</button>`:`<button class="btn btn-main" data-a="rgClose">回到燈海</button>`}</div>`;
  w.appendChild(box); if(gr==="S") confetti(innerWidth/2,innerHeight*.4,{cols:["#FDE68A","#FBBF24","#F9A8D4","#C084FC","#FFFFFF"]});
}
function demoConcert(sid){ const g=sid!=="demo"&&songOf(sid)?songOf(sid).gid:coreStickGroup(); ui.rgDemoG=g; ui.lsDemo={id:"demo",demo:true,gid:g,title:"示範演唱會",startTs:Date.now(),endTs:Date.now()+15*60e3}; trackBuffer(sid); concertOn(); lsCtl({play:{sid,at:Date.now()+4000}}); }
function rgClose(){ const st=ui.rg; if(st) ui.rgQuit=st.key; rgStop(); }
/* 演唱會裡：藝人按播放就開始、按停止就結束 */
function rgSync(){
  const ls=lightsea(), p=ls&&ls.play, st=ui.rg;
  if(p&&p.ia===false){ const iv0=document.getElementById("ccInv"); if(iv0) iv0.hidden=true; return; }
  if(p){ const tr=trackOf(p.sid); if(tr&&p.at+tr.dur*1000>Date.now()){ const key=p.sid+"@"+p.at; if(ui.rgQuit===key||(st&&st.key===key)) return; ui.rgInv={sid:p.sid,at:p.at}; const iv=document.getElementById("ccInv"); if(iv) iv.hidden=false; return; } }
  { const iv=document.getElementById("ccInv"); if(iv&&!p) iv.hidden=true; }
  if(st&&st.mode==="concert"&&!st.ended&&(!p||st.key!==p.sid+"@"+p.at)) rgFinish(true);
}

/* ---------- 藝人燈控台：播放音樂 ---------- */

/* ---------- 管理員：音樂與應援詞 ---------- */
function concertMusicHtml(){
  const gid=ui.cmGid&&groupOf(ui.cmGid)?ui.cmGid:GROUPS[0].id, ms=getMShow(), T=getTracks();
  const songs=[...ms.songs,...(ms.ended||[])].filter(s=>s.gid===gid);
  return `<section class="card studio"><div class="foc-cfg-h"><h3>演唱會音樂・應援詞</h3><span class="badge">節奏遊戲</span></div>
    
    <div class="chips wrap">${GROUPS.map(x=>`<button class="chip ${x.id===gid?"on":""}" data-a="cmGroup" data-v="${x.id}">${esc(x.name)}</button>`).join("")}</div>
    ${songs.length?songs.map(s=>{ const t=T[s.id]; return `<div class="cm-row"><div class="cm-i"><b>《${esc(s.title)}》</b><small>${t?`${fmtDur(t.dur)}・${t.bpm?"BPM "+t.bpm:"<em class='cm-warn'>還沒對拍子</em>"}・應援詞 ${(t.chant||[]).length} 句`:"還沒有音樂"}</small></div>
      <div class="cm-b"><label class="btn btn-soft btn-sm cm-up">${t?"換音樂":"上傳音樂"}<input type="file" class="cm-file" accept="audio/*,video/*,.mp3,.m4a,.wav,.aac,.mp4,.mov" data-sid="${s.id}"></label><label class="btn btn-soft btn-sm cm-up">從相簿選影片<input type="file" class="cm-file" accept="video/*" data-sid="${s.id}"></label>${t?`<button class="btn btn-soft btn-sm" data-a="cmTap" data-v="${s.id}">對拍子</button><button class="btn btn-soft btn-sm" data-a="cmChant" data-v="${s.id}">錄應援詞</button><button class="btn btn-soft btn-sm" data-a="secOpen" data-v="${s.id}">燈光段落</button><button class="btn btn-main btn-sm" data-a="cmTry" data-v="${s.id}">試玩</button>`:""}</div>
      ${t&&t.bpm?`<div class="cm-adj"><span>拍子速度</span><button data-a="cmBpm" data-v="${s.id}" data-d="-0.5">−</button><b>${t.bpm}</b><button data-a="cmBpm" data-v="${s.id}" data-d="0.5">＋</button><span>拍子位置</span><button data-a="cmOff" data-v="${s.id}" data-d="-0.03">提早</button><button data-a="cmOff" data-v="${s.id}" data-d="0.03">延後</button></div>`:""}</div>`; }).join("")
      :`<p class="me-none">這團還沒有歌。先在上面「打歌中的歌曲」新增歌名。</p>`}
    
    <div class="ls-btns"><button class="btn btn-soft" data-a="cmTry" data-v="demo">試玩示範曲</button><button class="btn btn-soft" data-a="sndTest" data-v="${songs.find(x=>T[x.id])?songs.find(x=>T[x.id]).id:""}">聲音測試</button></div></section>`;
}
/* 錄應援詞：一行一句 → 播歌 → 在該喊的地方點一下 */
function rcOpen(sid){
  const tr=trackOf(sid), g=groupOf(songOf(sid).gid), ms=Object.keys(MEMBERS).filter(id=>MEMBERS[id].group===g.id&&!MEMBERS[id].official).map(id=>MEMBERS[id].name);
  ui.rc={sid,step:"edit"}; { const rc=ui.rc; audioUnlock(); trackBuffer(sid).then(b=>{ if(ui.rc===rc) rc.buf=b; }).catch(()=>{}).finally(()=>{ if(ui.rc===rc&&!rc.buf) mediaLoad(sid).then(m=>{ if(ui.rc===rc) rc.m=m; }); }); }
  const w=document.createElement("div"); w.id="rcW"; w.className="rc-w"; document.body.appendChild(w);
  w.innerHTML=`<div class="rc-box"><div class="rc-h"><b>錄應援詞</b><small>《${esc(songOf(sid).title)}》</small><button class="rg-x" data-a="rcClose" aria-label="關閉">${XI}</button></div>
    <p class="rc-p">① 先把應援詞打好，<b>一行一句</b>（照喊的順序）。框框裡已經先放了範例，可以直接改，不改就照範例喊。<br>② 按「開始錄」會播這首歌，聽到該喊的地方就<b>點一下大按鈕</b>，那一句的時間就記下來了。</p>
    <textarea id="rcTxt" class="rc-ta" placeholder="輸入文字" data-ex="${esc([g.name+"！",...ms.slice(0,3).map(n=>n+"！"),"사랑해！"].join("\n"))}">${esc((tr.chant||[]).length?(tr.chant||[]).map(c=>c.text).join("\n"):[g.name+"！",...ms.slice(0,3).map(n=>n+"！"),"사랑해！"].join("\n"))}</textarea>
    ${(tr.chant||[]).length?`<p class="rc-p">目前有 ${tr.chant.length} 句已經錄好。重錄會蓋掉。</p>`:""}
    <div class="rc-btns"><button class="btn btn-soft" data-a="rcClose">取消</button><button class="btn btn-main" data-a="rcStart">開始錄</button></div></div>`;
}
/* 錄應援詞：跟「試玩」用完全一樣的播法——點下去先解鎖聲音、倒數 3 秒，再開始放歌
   ・放了之後會確認「時間真的有在走」才算開始；1.5 秒還沒動，就出現「點這裡播放音樂」讓手指再點一次（iPhone 只認手指點的當下） */
async function rcStart(){
  const rc=ui.rc; if(!rc) return; const ta=document.getElementById("rcTxt"), raw=(ta.value||"").trim()?ta.value:(ta.dataset.ex||""); const lines=raw.split("\n").map(s=>s.trim()).filter(Boolean).slice(0,200);
  if(!lines.length){ toast("先打好應援詞，一行一句"); return; }
  try{ document.activeElement&&document.activeElement.blur&&document.activeElement.blur(); }catch(e){}
  audioUnlock();
  rc.lines=lines; rc.times=[]; rc.step="rec"; rc.playing=false; rc.noSound=false; rc.needTap=false; rc.dur=trackOf(rc.sid).dur; rc.zero=performance.now()+3000;
  rcPaint(); rcLoop(rc); rcPlay(rc);
}
async function rcPlay(rc){
  let buf=rc.buf; if(!buf){ try{ buf=await trackBuffer(rc.sid); }catch(e){} } if(ui.rc!==rc||rc.step!=="rec") return;
  const c=audioCtx(), wait=Math.max(0,rc.zero-performance.now());
  if(buf&&c){ rc.buf=buf; rc.dur=buf.duration; const src=c.createBufferSource(); src.buffer=buf; src.connect(c.destination); src.start(c.currentTime+wait/1000); rc.src=src; rc.ct0=c.currentTime+wait/1000;
    rc.zero+=((c.outputLatency||0)+(c.baseLatency||0))*1000; src.onended=()=>{ if(ui.rc===rc&&rc.step==="rec"&&rc.playing) rcEnd(); }; }
  else { const m=rc.m||await mediaLoad(rc.sid); if(ui.rc!==rc) return; if(!m){ rc.noSound=true; rcPaint(); return; } rc.media=m;
    setTimeout(async()=>{ if(ui.rc!==rc||rc.step!=="rec") return; try{ m.currentTime=0; await mediaPlay(m); }catch(e){ rc.needTap=true; rcPaint(); } },wait); }
  setTimeout(()=>rcCheck(rc),wait+1500);
}
/* 時間有在走才算真的在播 */
function rcHearing(rc){ if(rc.media) return !rc.media.paused&&rc.media.currentTime>.05; const c=sfxCtx; return !!(rc.src&&c&&c.state==="running"&&c.currentTime>rc.ct0+.05); }
function rcLoop(rc){ if(rc.media) rc.media.onended=()=>{ if(ui.rc===rc&&rc.step==="rec"&&rc.playing) rcEnd(); }; (function f(){ if(ui.rc!==rc||rc.step!=="rec") return;
  if(!rc.playing&&rcHearing(rc)){ rc.playing=true; rc.needTap=false; rcPaint(); }
  if(rc.media&&rc.playing) rc.zero=performance.now()-rc.media.currentTime*1000;
  else if(rc.src&&rc.playing&&sfxCtx) rc.zero=performance.now()-(sfxCtx.currentTime-rc.ct0)*1000+((sfxCtx.outputLatency||0)+(sfxCtx.baseLatency||0))*1000;
  const t=(performance.now()-rc.zero)/1000, el=document.getElementById("rcT"), pb=document.getElementById("rcPb");
  if(el) el.textContent=t<0&&!rc.playing?`${Math.ceil(-t)} 秒後開始`:(rc.playing?"♪ ":"⏸ ")+fmtDur(Math.max(0,t))+" / "+fmtDur(rc.dur); if(pb) pb.style.width=Math.max(0,Math.min(100,t/rc.dur*100))+"%";
  const cd=document.getElementById("rcCd"); if(cd) cd.textContent=t<0&&!rc.playing?String(Math.ceil(-t)):"";
  requestAnimationFrame(f); })(); }
async function rcCheck(rc){ if(ui.rc!==rc||rc.step!=="rec"||rc.playing) return; rc.needTap=true; rcPaint(); }
/* 手指點「播放音樂」：在點下去的當下重新從頭放 */
function rcKick(){ const rc=ui.rc; if(!rc||rc.step!=="rec") return; rc.needTap=false; rc.times=[];
  if(rc.src){ try{ rc.src.onended=null; rc.src.stop(); }catch(e){} rc.src=null; }
  const c=audioCtx();
  if(rc.buf&&c){ const src=c.createBufferSource(); src.buffer=rc.buf; src.connect(c.destination); src.start(c.currentTime+.05); rc.src=src; rc.ct0=c.currentTime+.05; src.onended=()=>{ if(ui.rc===rc&&rc.step==="rec"&&rc.playing) rcEnd(); }; }
  const m=rc.media||(rc.buf?null:mediaEl()); if(m&&!rc.buf){ rc.media=m; try{ m.currentTime=0; mediaPlay(m).catch(()=>{}); }catch(e){} }
  rc.zero=performance.now()+50; rcPaint();
  setTimeout(()=>{ if(ui.rc!==rc||rc.playing||rc.step!=="rec") return;
    // Web Audio 還是不動 → 換聲音元件再試一次
    if(rc.src&&!rc.media){ mediaLoad(rc.sid).then(m=>{ if(!m||ui.rc!==rc||rc.playing) return; try{ rc.src.stop(); }catch(e){} rc.src=null; rc.media=m; rcLoop(rc); m.currentTime=0; mediaPlay(m).catch(()=>{}); setTimeout(()=>{ if(ui.rc===rc&&!rc.playing){ rc.noSound=true; rcPaint(); } },1800); }); return; }
    rc.noSound=true; rcPaint(); },1600); }
function rcPaint(){
  const rc=ui.rc, w=document.getElementById("rcW"); if(!rc||!w) return; const i=rc.times.length;
  if(rc.step==="rec") w.innerHTML=`<div class="rc-box rec"><div class="rc-h"><b>錄音中</b><small id="rcT">0:00</small></div><i class="rc-pg"><u id="rcPb"></u></i>
    ${rc.noSound?`<div class="rc-warn"><b>這支手機現在放不出這首歌</b><span>按「聲音測試」，把結果截圖給 Claude</span><button class="btn btn-main btn-sm" data-a="sndTest" data-v="${rc.sid}">聲音測試</button></div>`
      :rc.needTap&&!rc.playing?`<button class="btn btn-main btn-block rc-kick" data-a="rcKick">♪ 沒聽到音樂？點這裡播放</button>`
      :`<p class="rc-p">${rc.playing?`聽到該喊「${esc(rc.lines[i]||"")}」的地方，點下面的大按鈕`:"<b>準備好…音樂開始前點了不算</b>"}</p><p class="rc-cd" id="rcCd"></p>`}
    <button class="rc-tap ${rc.playing?"":"off"}" id="rcTap"><small>第 ${i+1} / ${rc.lines.length} 句</small><b>${esc(rc.lines[i]||"")}</b><span>點！</span></button>
    <p class="rc-next">${rc.lines[i+1]?"下一句："+esc(rc.lines[i+1]):"這是最後一句"}</p>
    <div class="rc-btns"><button class="btn btn-soft" data-a="rcUndo" ${i?"":"disabled"}>復原上一句</button><button class="btn btn-soft" data-a="rcEnd">結束</button></div></div>`;
  else w.innerHTML=`<div class="rc-box"><div class="rc-h"><b>錄好了</b><small>${rc.times.length} / ${rc.lines.length} 句</small><button class="rg-x" data-a="rcClose" aria-label="關閉">${XI}</button></div>
    <div class="rc-list">${rc.lines.map((l,k)=>`<div class="${rc.times[k]==null?"miss":""}"><em>${rc.times[k]==null?"沒錄到":fmtDur(rc.times[k])+"."+String(Math.floor(rc.times[k]%1*10))}</em><span>${esc(l)}</span></div>`).join("")}</div>
    ${rc.times.length<rc.lines.length?`<p class="rc-p">沒錄到的句子不會出現在遊戲裡。</p>`:""}
    <div class="rc-btns"><button class="btn btn-soft" data-a="rcRedo">重錄</button><button class="btn btn-main" data-a="rcSave">儲存</button></div></div>`;
  const b=document.getElementById("rcTap"); if(b) b.addEventListener("pointerdown",e=>{ e.preventDefault(); rcTap(performance.now()); },{passive:false});
}
function rcTap(tp){ const rc=ui.rc; if(!rc||rc.step!=="rec"||rc.times.length>=rc.lines.length) return;
  if(!rc.playing){ if(rc.needTap){ rcKick(); return; } toast("音樂還沒開始，這一下不算"); return; }
  const tt=(tp-rc.zero)/1000; if(tt<.5){ toast("歌才剛開始，這一下不算"); return; }
  rc.times.push(tt); if(rc.times.length>=rc.lines.length){ setTimeout(rcEnd,400); } rcPaint(); }
function rcEnd(){ const rc=ui.rc; if(!rc) return; if(rc.src){ try{ rc.src.onended=null; rc.src.stop(); }catch(e){} } if(rc.media){ rc.media.onended=null; mediaStop(); } rc.step="done"; rcPaint(); }
function rcSave(){ const rc=ui.rc; if(!rc) return; const T=getTracks(), t=T[rc.sid]; if(!t) return; t.chant=rc.lines.map((text,k)=>rc.times[k]==null?null:{t:Math.round(rc.times[k]*100)/100,text}).filter(Boolean); S.set(K.tracks,T); rcClose(); lsRerender(); toast(`已儲存 ${t.chant.length} 句應援詞`); }
/* 手動對拍子：放音樂，跟著鼓聲點 8 下以上 → 算出 BPM 和第一拍 */
async function tpOpen(sid){
  rcClose(); tpClose(); const sg=songOf(sid);
  const w=document.createElement("div"); w.id="tpW"; w.className="rc-w"; document.body.appendChild(w); ui.tp={sid,taps:[]};
  w.innerHTML=`<div class="rc-box rec"><div class="rc-h"><b>對拍子</b><small>《${esc(sg?sg.title:"")}》</small><button class="rg-x" data-a="tpClose" aria-label="關閉">${XI}</button></div>
    <p class="rc-p">音樂開始後，<b>跟著鼓聲（咚、咚、咚）</b>點下面的大按鈕，點 8 下以上，App 就會算出這首歌的拍子。點越多越準。</p>
    <button class="rc-tap" id="tpTap"><small id="tpN">準備中…</small><b id="tpB">♪</b><span>跟著拍子點</span></button>
    <div class="rc-btns"><button class="btn btn-soft" data-a="tpRedo">重來</button><button class="btn btn-main" data-a="tpSave" id="tpSave" disabled>完成</button></div></div>`;
  const tp=ui.tp; audioUnlock(); const c=audioCtx(); let buf=null; try{ buf=await trackBuffer(sid); }catch(e){} if(ui.tp!==tp) return;
  if(buf&&c){ const src=c.createBufferSource(); src.buffer=buf; src.connect(c.destination); const lat=(c.outputLatency||0)+(c.baseLatency||0); src.start(c.currentTime+.3); tp.src=src; tp.zero=performance.now()+300+lat*1000; }
  else { const m=await mediaLoad(sid); if(ui.tp!==tp) return; if(!m){ toast("讀不到這首歌的音樂，請重新上傳"); tpClose(); return; }
    m.currentTime=0; try{ await mediaPlay(m); }catch(e){ document.getElementById("tpN").textContent="點一下大按鈕開始播放音樂"; tp.wait=true; } tp.media=m; tp.zero=performance.now(); }
  if(!tp.wait) document.getElementById("tpN").textContent="開始點吧";
  document.getElementById("tpTap").addEventListener("pointerdown",e=>{ e.preventDefault(); tpTap(); },{passive:false});
}
function tpTap(){ const tp=ui.tp; if(!tp) return;
  if(tp.wait){ tp.wait=false; tp.media.currentTime=0; mediaPlay(tp.media).catch(()=>{}); tp.zero=performance.now(); document.getElementById("tpN").textContent="開始點吧"; return; }
  if(tp.media&&!tp.media.paused) tp.zero=performance.now()-tp.media.currentTime*1000;
  tp.taps.push((performance.now()-tp.zero)/1000); const r=tpCalc(tp.taps), n=tp.taps.length;
  document.getElementById("tpN").textContent=n<8?`已點 ${n} 下，再 ${8-n} 下`:`已點 ${n} 下，可以按完成了`;
  document.getElementById("tpB").textContent=r?Math.round(r.bpm)+" BPM":"♪";
  const sv=document.getElementById("tpSave"); if(sv) sv.disabled=!(r&&n>=8); }
function tpCalc(ts){ if(ts.length<4) return null; const iv=ts.slice(1).map((t,i)=>t-ts[i]).filter(x=>x>.25&&x<1.5).sort((a,b)=>a-b); if(iv.length<3) return null;
  const p0=iv[iv.length>>1], k=ts.map(t=>Math.round((t-ts[0])/p0)), n=ts.length, mk=k.reduce((a,b)=>a+b,0)/n, mt=ts.reduce((a,b)=>a+b,0)/n;
  let sxy=0, sxx=0; for(let i=0;i<n;i++){ sxy+=(k[i]-mk)*(ts[i]-mt); sxx+=(k[i]-mk)**2; } const p=sxx?sxy/sxx:p0, a=mt-p*mk; let off=a%p; if(off<0) off+=p;
  let bpm=60/p; while(bpm<85) bpm*=2; while(bpm>170) bpm/=2; return {bpm:Math.round(bpm*100)/100,offset:Math.round(off*1000)/1000}; }
function tpSave(){ const tp=ui.tp; if(!tp) return; const r=tpCalc(tp.taps); if(!r||tp.taps.length<8){ toast("再多點幾下"); return; } const T=getTracks(), x=T[tp.sid]; if(!x) return; x.bpm=r.bpm; x.offset=r.offset; S.set(K.tracks,T); tpClose(); lsRerender(); toast(`拍子對好了：BPM ${r.bpm}，按「試玩」看看`); }
function tpClose(){ const tp=ui.tp; if(tp){ if(tp.src){ try{ tp.src.stop(); }catch(e){} } if(tp.media) mediaStop(); } ui.tp=null; const w=document.getElementById("tpW"); if(w) w.remove(); }
/* 聲音測試：一次試三種播放方式，結果寫在畫面上，方便截圖 */
function toneWav(){ if(toneWav.u) return toneWav.u; const sr=22050, n=sr*.6|0, ab=new ArrayBuffer(44+n*2), v=new DataView(ab), w=(o,t)=>{ for(let i=0;i<t.length;i++) v.setUint8(o+i,t.charCodeAt(i)); };
  w(0,"RIFF"); v.setUint32(4,36+n*2,true); w(8,"WAVE"); w(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true); v.setUint32(24,sr,true); v.setUint32(28,sr*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true); w(36,"data"); v.setUint32(40,n*2,true);
  for(let i=0;i<n;i++) v.setInt16(44+i*2,Math.sin(i/sr*2*Math.PI*880)*9000*Math.min(1,(n-i)/2000),true); return toneWav.u=URL.createObjectURL(new Blob([ab],{type:"audio/wav"})); }
async function sndTest(sid){
  rcClose(); tpClose(); const old=document.getElementById("stW"); if(old) old.remove();
  const w=document.createElement("div"); w.id="stW"; w.className="rc-w"; document.body.appendChild(w); ui.st={sid};
  let blob=null; try{ blob=sid&&sid!=="demo"?await auGet(sid):null; }catch(e){} ui.st.url=blob?URL.createObjectURL(blob):null; ui.st.info=(blob?`${blob.type||"未知格式"}・${(blob.size/1048576).toFixed(1)} MB`:"沒有找到這首歌的檔案")+((sid&&sid!=="demo")?(await idbHas("au_"+sid)?"・已存在手機":"・沒有存在手機（重開就不見）"):"")+(blob?"":"・檔案讀不出來，請重新上傳");
  stPaint(); }
function stRows(st){ return (st.res||[["A","方法 A（Web Audio）","—"],["B","方法 B（聲音元件）","—"],["C","方法 C（你的歌）",st.info]]).map((r,i)=>`<div class="${st.cur===i?"cur":""}"><em>${r[0]}</em><span>${esc(r[1])}</span><b>${esc(r[2])}</b></div>`).join(""); }
function stPaint(){ const st=ui.st, w=document.getElementById("stW"); if(!st||!w) return;
  const list=w.querySelector(".st-list"); if(list){ list.innerHTML=stRows(st); const go=w.querySelector('[data-a="stRun"]'); if(go){ go.disabled=!!st.busy; go.textContent=st.busy?"測試中…":"再測一次"; } return; }   // 只更新清單，不重畫整個視窗（才不會一直閃）
  w.innerHTML=`<div class="rc-box"><div class="rc-h"><b>聲音測試</b><small>${esc(navigator.userAgent.match(/iPhone OS [\d_]+/)?.[0]?.replace(/_/g,".")||"")}</small><button class="rg-x" data-a="stClose" aria-label="關閉">${XI}</button></div>
    <p class="rc-p">按「開始測試」會一個接一個發出聲音：先 A 嗶一聲，隔一秒 B 嗶一聲，再隔一秒 C 放你的歌 3 秒。測完把這個畫面截圖給 Claude。</p>
    <div class="st-list">${stRows(st)}</div>
    <div class="rc-btns"><button class="btn btn-soft" data-a="stClose">關閉</button><button class="btn btn-main" data-a="stRun">開始測試</button></div></div>`; }
function stRun(){ const st=ui.st; if(!st||st.busy) return; st.busy=true; const res=[["A","方法 A（Web Audio）","等一下…"],["B","方法 B（聲音元件）","等一下…"],["C","方法 C（你的歌）",st.url?"等一下…":st.info]]; st.res=res; st.cur=0; stPaint();
  const set=(i,t)=>{ res[i][2]=t; stPaint(); }, at=(ms,f)=>setTimeout(()=>{ if(ui.st===st) f(); },ms);
  // iPhone 只准「手指點下去的當下」開始放聲音，所以 B、C 先在這一刻靜音開始播，輪到它們時才倒回開頭、打開聲音
  let c=null; try{ c=audioCtx(); }catch(e){}
  const a=new Audio(); a.src=toneWav(); a.muted=true; const pa=a.play();
  let s2=null, p2=null; if(st.url){ s2=new Audio(); s2.src=st.url; s2.muted=true; s2.onerror=()=>{ set(2,`讀不出這個檔案（錯誤碼 ${s2.error&&s2.error.code}）・${st.info}`); }; p2=s2.play(); }
  const okP=p=>(p&&p.then?p:Promise.resolve());
  set(0,"播放中…");
  if(c){ try{ const o=c.createOscillator(), g=c.createGain(); o.frequency.value=660; g.gain.value=.25; o.connect(g); g.connect(c.destination); o.start(c.currentTime+.05); o.stop(c.currentTime+.5); at(700,()=>set(0,"狀態："+c.state+(c.state==="running"?"（應該有嗶一聲）":""))); }catch(e){ set(0,"錯誤："+e.name); } } else set(0,"這台裝置不支援");
  at(1000,()=>{ st.cur=1; set(1,"播放中…"); okP(pa).then(()=>{ try{ a.pause(); a.currentTime=0; }catch(e){} a.muted=false; return a.play(); }).then(()=>at(800,()=>set(1,a.currentTime>0?"有在播放（應該有嗶一聲）":"play 成功但時間沒有前進"))).catch(e=>set(1,"被擋住："+e.name)); });
  at(2000,()=>{ st.cur=2; if(!s2){ st.busy=false; st.cur=null; stPaint(); return; } set(2,"播放中…");
    okP(p2).then(()=>{ try{ s2.pause(); s2.currentTime=0; }catch(e){} s2.muted=false; return s2.play(); }).then(()=>at(3000,()=>{ set(2,(s2.currentTime>.3?"有在播放":"play 成功但時間沒有前進")+`・長度 ${fmtDur(s2.duration||0)}・${st.info}`); s2.pause(); st.busy=false; st.cur=null; stPaint(); }))
      .catch(e=>{ set(2,`被擋住：${e.name}・${st.info}`); st.busy=false; st.cur=null; stPaint(); }); });
}
function rcClose(){ const rc=ui.rc; if(rc&&rc.src){ try{ rc.src.onended=null; rc.src.stop(); }catch(e){} } if(rc&&rc.media){ rc.media.onended=null; mediaStop(); } ui.rc=null; const w=document.getElementById("rcW"); if(w) w.remove(); }

/* 應援口號挑戰：圈圈縮到中間時點一下
   ・舊版用 click＋好幾個計時器，iPhone 上點擊時間會跑掉、常常被判 Miss
   ・新版：用同一個時鐘畫圈圈也用它判定；手指一碰到（pointerdown）就算，畫面任何地方都可以點 */
const CHANT={title:"星光約定",base:["星","光","約","定","一","起","閃","耀"],gap:800,lead:1600};
let chantT=[];
function chantStart(){
  const box=document.getElementById("chant"); if(!box) return; chantStop();
  const g=groupOf((lightsea()||{}).gid)||null, beats=[...CHANT.base,...(g?[g.name]:[]),"♡"];
  const c=ui.chant={beats,t0:performance.now()+CHANT.lead,score:0,combo:0,res:beats.map(()=>null),done:false}; box.hidden=false;
  box.innerHTML=`<div class="ch-top"><b>🎵 ${CHANT.title}</b><span id="chScore">0</span></div><div class="ch-stage" id="chStage"><span class="ch-target"></span><span class="ch-ring" id="chRing"></span><b class="ch-word" id="chWord">準備…</b><em class="ch-judge" id="chJudge"></em><span class="ch-tap" id="chTap"></span></div><p class="ch-hint">圈圈縮到白色圓框時，點畫面任何地方</p>`;
  box.onpointerdown=e=>{ if(e.target.closest("button")) return; e.preventDefault(); chantTap(); };
  const ring=document.getElementById("chRing"), word=document.getElementById("chWord");
  (function f(now){ if(ui.chant!==c||!ring.isConnected) return;
    const k=(now-c.t0)/CHANT.gap, i=Math.round(k);   // 最接近的一拍
    const nxt=Math.max(0,Math.ceil(k-.32)); if(nxt<beats.length){ const p=(now-(c.t0+(nxt-1)*CHANT.gap))/CHANT.gap;   // 0→1：從外圈縮到中間
      const sc=3.2-2.2*Math.min(1,Math.max(0,p)); ring.style.transform=`scale(${sc})`; ring.style.opacity=p<0?0:Math.min(1,.25+p); if(word.dataset.i!==String(nxt)){ word.dataset.i=nxt; word.textContent=beats[nxt]; } }
    else { ring.style.opacity=0; }
    for(let j=0;j<beats.length;j++) if(c.res[j]===null&&now>c.t0+j*CHANT.gap+300){ c.res[j]="Miss"; c.combo=0; chantJudge("Miss"); }
    if(now>c.t0+(beats.length-1)*CHANT.gap+700){ chantEnd(); return; }
    requestAnimationFrame(f); })(performance.now());
}
function chantTap(){ const c=ui.chant; if(!c) return; const now=performance.now(), k=Math.round((now-c.t0)/CHANT.gap);
  const tp=document.getElementById("chTap"); if(tp){ tp.classList.remove("go"); void tp.offsetWidth; tp.classList.add("go"); }
  if(k<0||k>=c.beats.length||c.res[k]!==null) return;
  const dt=Math.abs(now-(c.t0+k*CHANT.gap)); if(dt>300) return;
  const j=dt<=110?"Perfect":"Good"; c.res[k]=j; c.combo++; c.score+=(j==="Perfect"?100:60)+c.combo*10; ui.heat=Math.min(100,(ui.heat||0)+(j==="Perfect"?6:3)); SEA.boost=Math.min(1.4,SEA.boost+.5);
  chantJudge(j); const s=document.getElementById("chScore"); if(s) s.textContent=fmt(c.score); }
function chantJudge(j){ const e=document.getElementById("chJudge"); if(!e) return; e.textContent=j+(ui.chant&&ui.chant.combo>1&&j!=="Miss"?` ×${ui.chant.combo}`:""); e.className="ch-judge "+j.toLowerCase(); void e.offsetWidth; e.classList.add("pop"); }
function chantEnd(){ const box=document.getElementById("chant"), c=ui.chant; if(!box||!c) return; ui.chantBest=Math.max(ui.chantBest||0,c.score); box.onpointerdown=null;
  const pf=c.res.filter(x=>x==="Perfect").length, gd=c.res.filter(x=>x==="Good").length, ms=c.res.length-pf-gd, full=c.beats.length*100;
  box.innerHTML=`<div class="ch-end"><b>${CHANT.title}</b><strong>${fmt(c.score)}</strong><small>Perfect ${pf}・Good ${gd}・Miss ${ms}</small><small>${c.score>=full?"完美應援！藝人一定聽到了 💜":c.score>=full*.55?"很棒！再挑戰一次會更好":"多練習幾次，跟上節奏吧"}</small><div><button class="btn btn-soft" data-a="chantClose">回到燈海</button><button class="btn btn-main" data-a="chantStart">再一次</button></div></div>`;
  if(c.score>=full) confetti(innerWidth/2,innerHeight/2); ui.chant=null; }
function chantStop(){ chantT.forEach(clearTimeout); chantT=[]; ui.chant=null; }
function viewStubs(){
  const st=S.get(K.stubs,[]);
  return coreHead("燈海出席票根")+`<main class="page stubs">${st.length?st.map(x=>{const m=MEMBERS[x.member], g=groupOf(x.group);if(!m||!g) return "";const c=GRADS[m.g%GRADS.length];
    return `<article class="stub" style="--c1:${c[0]};--c2:${c[1]}"><div class="stub-l"><span>LIGHT SEA</span><b>${esc(m.name)} 燈海</b><small>${gTag(g)}${ymd(x.ts)}</small><em>${esc(x.seat)}</em></div>
      <div class="stub-r"><span>揮棒</span><b>${fmt(x.swings)}</b><span>口號分數</span><b>${fmt(x.score)}</b></div></article>`}).join(""):emptyBox("🎫","還沒有票根","藝人開燈海時，到 FEST 舉起應援棒待滿 20 秒，離開時就會拿到")}</main>`;
}

/* 應援棒：管理員上傳的設計圖 → 3D；沒上傳的團用預設款 */
const getSticks=()=>S.get(K.sticks,{});
const _defStick={};
function defaultStick(gid){ if(!_defStick[gid]){ const g=groupOf(gid), c=GRADS[g.g%GRADS.length]; _defStick[gid]=Object.assign(LS3D.analyze(LS3D.sample(["round","heart","star"][strHash(gid)%3],c[0],c[1],ini(g.name))),{_letter:ini(g.name),_c1:c[0],_c2:c[1]}); } return _defStick[gid]; }
let _genStick=null;
const genericStick=()=>_genStick||(_genStick=Object.assign(LS3D.analyze(LS3D.sample("round","#E9E3F7","#FCE7F3","★")),{glow:"#C7AEFF"}));
const stickOf=gid=>gid==="generic"?genericStick():getSticks()[gid]||defaultStick(gid);
const MERCH=[{k:"stick",name:"官方應援棒",pts:4500,ic:"✦",d:"演唱會燈海裡舉起這一團的官方應援棒。單買永久擁有；Membership 會員在會員期間也能用"},{k:"album",name:"最新專輯",pts:8000,ic:"💿",d:"收藏在 ME 的「我的周邊」"},{k:"limited",name:"限定周邊組",pts:1500,ic:"🎀",d:"數量限定的小卡與貼紙"}];
const owns=(gid,k)=>!!(S.get(K.owned,{})[gid]||{})[k];
function mountSticks(scope){
  scope.querySelectorAll(".ls-box:not([data-mounted])").forEach(el=>{
    el.dataset.mounted="1"; const k=el.dataset.ls, o=(el.dataset.o||"").split(",");
    const ds=k==="draft"?(ui.lsDraft&&ui.lsDraft.ds):k==="generic"||groupOf(k)?stickOf(k):null; if(!ds) return;
    if(!ds._letter){ const gg=groupOf(k==="draft"?(ui.lsGid||""):k); if(gg) ds._letter=ini(gg.name); }
    try{ el._ls=LS3D.mount(el,ds,{controls:o.includes("ctl"),wave:o.includes("wave"),pulse:o.includes("pulse")?3:0,auto:!o.includes("still"),swing:o.includes("swing"),bright:o.includes("bright"),onSwing:o.includes("swing")?onSwingMove:null}); }catch(e){ el.innerHTML=""; }
  });
}
/* 看重播時資料更新：留在原本滑到的地方，不跳回開頭 */
function rpPaint(id,hc){ const o=document.querySelector(".rp2-log"), y=o&&!hc?o.scrollTop:0; paint(viewReplay(id),false); if(y){ const n=document.querySelector(".rp2-log"); if(n) n.scrollTop=y; } }
function render(){
  if(!KVX.ready){ KVX.want=true; return; }   /* 手機的大空間還在讀：讀完才畫，不會先畫出空白的聊天室 */
  try{ debutSync(); }catch(e){} try{ snRetireCheck(); }catch(e){}
  const r=route(), s=session(); if(s) sessTouch();
  const hashChanged=ui._h!==location.hash; if(hashChanged) ui._prevH=ui._h; ui._h=location.hash;
  if(s&&suspendOf(s.email)){ const sp=suspendOf(s.email); SS.del(); ui.loginErr=`這個帳號因為外流 TIE 內容，${suspendText(sp)}`; return go("auth"); }
  if(!s){ if(r.role!=="auth") return go("auth"); return paint(viewAuth(),false); }
  if(s.uni&&["fan","artist","admin"].includes(r.role)&&r.role!==s.role){ SS.set({...s,role:r.role,member:r.role==="artist"?(uniMe()||null):null}); return render(); }
  if(r.role==="auth"||r.role!==s.role) return go(s.role);
  if(s.role==="fan") feedDeliver();
  if(s.uni&&s.role==="artist"&&!uniMe()) return paint(viewNoArtist(),true,"");
  if(s.uni&&s.role==="artist"&&s.member!==uniMe()){ SS.set({...s,member:uniMe()}); return render(); }
  thRotTick(); thSync();
  if(r.sub==="sns"&&s.role==="artist"&&snLockOf(s.member)&&r.p!=="edit"&&!(r.p==="new"&&r.id==="sub")){ const L=snLockOf(s.member), dl=Math.max(1,Math.ceil((L.until-Date.now())/864e5));   /* 還沒開通：可以先設定個人檔案、投稿到官方帳號；到時間自動開通 */
    try{ snOfSync(); }catch(e){} const h=paint(snPrepPage(s.member,dl),false); setTimeout(()=>{ try{ hydrateMedia(document.querySelector(".sn-prep")||document); }catch(e){} },0); return h; }
  if(r.sub==="sns"){ /* SNS 的分頁列跟 App 的一樣放在頁面外面：換頁不重畫，鏡片滑過去、可以按住拖 */
    let h=viewSns(r.p||"home",r.id), nv=""; h=h.replace(/<nav class="nav sn-nav2"[\s\S]*?<\/nav>/,m=>{ nv=m; return ""; }); return nv?paint(h,true,nv):paint(h,false); }
  if(r.sub==="look") return paint(viewLook(),false);
  if(r.sub==="replay"&&getLive(r.id)) return rpPaint(r.id,hashChanged);
  if(r.sub==="tint") return paint(viewTint(r.id),false);
  if(r.sub==="thedit"&&(s.role==="admin"||s.role==="artist")) return paint(viewThEdit(r.id),false);
  if(r.sub==="thmine"&&s.role==="artist") return paint(viewThMine(),false);
  if(r.sub==="themes"&&s.role==="admin") return isUni()?paint(viewThAdmin(),true,""):paint(viewThAdmin(),false);
  if(s.role==="fan"){
    deliverMilestones();
    if(r.sub==="select") return paint(viewSelect(),false);
    if(r.sub==="notifications") return paint(viewNotifs(),false);
    if(r.sub==="subscribe") return go("fan",null,"shop");
    if(r.sub==="core") return paint(viewCoreSub(r.p,r.id),false);
    if(r.sub==="grp"&&groupOf(r.id)) return paint(viewGrp(r.id,r.p||"home",r.m),false);
    if(r.sub==="live"&&getLive(r.id)){ const l=getLive(r.id); if(l.endTs&&ui.endFor!==l.id) return paint(viewReplay(r.id),false); if(!l.endTs) startMeetDemo(l.id); meetSig=""; return paint(viewMeetRoom(r.id),false); }
    if(r.sub==="replay"&&getLive(r.id)) return rpPaint(r.id,hashChanged);
    if(r.sub==="tiepick"&&groupOf(r.id)){ if(groupArtists(r.id).length===1){ const g0=r.id; location.replace("#/fan?tab=shop"); setTimeout(()=>tieStore(g0),250); return; } return paint(tpkView(r.id,"new"),false); }
    if(r.sub==="chat"&&MEMBERS[r.m]){
      if(r.role==="fan"&&tieNeedBuy(r.m)){ const m0=r.m; setTimeout(()=>{ navBack(); setTimeout(()=>tieGate(m0),300); },0); return; }   /* 還沒訂閱：回到原本那頁再打開商店（關掉商店就回到原本的地方，不會跑到 SHOP） */
      if(r.p==="settings") return paint(viewTieSettings(r.m),false);
      if(r.p==="box") return paint(viewTieBox(r.m),false);
      if(r.p==="bgc") return paint(viewTieBgColor(r.m),false);
      if(r.p==="pick") return paint(viewTiePick(r.m),false);
      if(r.p==="gallery") return paint(viewTieGallery(r.m),false);
      if(r.p==="bg") return paint(viewTieBg(r.m),false);
      if(r.p==="name"||r.p==="nick") return paint(viewTieEdit(r.m,r.p),false);
      if(hashChanged){ const pv=ui._prevH||"", cp=ui.chatPos; /* 從這個聊天室的設定、抽屜、TIE BOX 回來：停在原本看的位置 */
        if(cp&&cp.m===r.m&&!cp.bottom&&pv.startsWith("#/fan/chat")&&/[?&]p=/.test(pv)&&pv.includes("m="+r.m)) ui.restoreChatY=cp.y; else ui.scrollChat=true; }
      markRoomRead(r.m); return paint(viewTieRoom(r.m),false); }
    return paint(viewFan(r.tab||"home"),true,fanNav(r.tab==="live"?"home":(r.tab||"home")));
  }
  if(s.role==="artist"&&r.sub==="write") return paint(viewArtWrite(r.p),false);
  if(s.role==="artist"&&r.tab==="live"){ const hl=myLive(s.member); if(hl){ hostSig=""; return paint(viewHostRoom(hl),false); } }
  if(s.role==="artist"&&r.tab==="foc"&&r.p==="fansign"){ const v=viewFsDesk(r.id); if(v) return paint(v,false); }
  if(s.role==="artist"&&r.tab==="whisper"){ const v=viewTieArtist(s.member); artReadSet(Date.now()); const mid0=s.member, RB=S.get(K.tieReadBy,{})||{}; if(mid0&&getWhispers().some(w=>w.member===mid0&&w.from!=="artist"&&w.ts>(RB[mid0]||0))){ S.set(K.tieReadBy,{...RB,[mid0]:Date.now()}); } return paint(v,false); }
  if(s.role==="artist") return paint(viewArtist(r.tab||"home"),true,artistNav(r.tab||"home"));
  return paint(viewAdmin(r.tab||"home"),true,adminNav(r.tab||"home"));
}
const SNAP=new Map(), NAVSTK=[];
/* TIE 聊天室：最後一則訊息貼在輸入列上面（照 LINE），下面留的空間＝輸入列的高度＋一點點 */
/* 直播間：整頁不能被拖動（不會一直晃）；鍵盤打開時，直播間縮到鍵盤上方，輸入框貼著鍵盤 */
function lvLockSync(){ const on=!!document.querySelector(".mr.dl"); document.documentElement.classList.toggle("no-scroll",on); if(on) lvFit(); }
function lvFit(){ const mr=document.querySelector(".mr.dl"), vv=window.visualViewport; if(!mr||!vv) return; const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1, kb=window.innerHeight-vv.height>80;
  if(kb){ mr.style.top=(vv.offsetTop/z)+"px"; mr.style.bottom="auto"; mr.style.height=(vv.height/z)+"px"; } else { mr.style.top=""; mr.style.bottom=""; mr.style.height=""; } }
if(window.visualViewport){ visualViewport.addEventListener("resize",lvFit); visualViewport.addEventListener("scroll",lvFit); }
/* 貼文頁打字：整個貼文頁縮到鍵盤上面（照 Weverse），留言列貼著鍵盤，不會被頂開露出下面的畫面 */
function pdFit(){ const L=[...document.querySelectorAll(".pd")], pd=L[L.length-1], vv=window.visualViewport; if(!pd||!vv) return; const kb=window.innerHeight-vv.height>80&&document.activeElement&&!!document.activeElement.closest(".pd-in");
  if(kb){ /* 打字時：整頁貼齊鍵盤上方。App 有整體縮放（zoom），直接用 visualViewport 的數字會算錯 → 先量「1px 實際畫出來多大」再換算 */
    pd.style.bottom="auto"; pd.style.top="0px"; pd.style.height="1000px"; const r=pd.getBoundingClientRect(), k=r.height/1000||1, t0=r.top/k;
    const nt=(vv.offsetTop/k-t0), nh=(vv.height/k); pd.style.top=nt+"px"; pd.style.height=nh+"px"; pd.classList.add("kb"); }
  else if(pd.classList.contains("kb")){ pd.style.top=""; pd.style.bottom=""; pd.style.height=""; pd.classList.remove("kb"); } }
/* 藝人長按留言就能回覆（跟點留言下面的回覆圖示一樣）；粉絲沒有這個 */
(function(){ let tm=0, el=null, x0=0, y0=0; const isArt=()=>{ try{ return (session()||{}).role==="artist"; }catch(e){ return false; } };
  const cancel=()=>{ clearTimeout(tm); tm=0; if(el) el.classList.remove("lp-on"); el=null; };
  document.addEventListener("touchstart",e=>{ const c=e.target.closest&&e.target.closest(".pd .pd-c:not(.pd-r):not(.top)"); if(!c||!isArt()||e.touches.length!==1||e.target.closest("button,a,textarea,input")) return; const b=c.querySelector('[data-a="pdOpenRep"]'); if(!b) return;
    el=c; x0=e.touches[0].clientX; y0=e.touches[0].clientY; tm=setTimeout(()=>{ if(!el) return; el.classList.add("lp-on"); hap(12); const bb=b; setTimeout(()=>{ cancel(); bb.click(); },120); },450); },{passive:true});
  document.addEventListener("touchmove",e=>{ if(!el) return; const t=e.touches[0]; if(Math.abs(t.clientX-x0)>8||Math.abs(t.clientY-y0)>8) cancel(); },{passive:true});
  document.addEventListener("touchend",cancel,{passive:true}); document.addEventListener("touchcancel",cancel,{passive:true});
  document.addEventListener("contextmenu",e=>{ const c=e.target.closest&&e.target.closest(".pd .pd-c:not(.pd-r):not(.top)"); if(!c||!isArt()) return; const b=c.querySelector('[data-a="pdOpenRep"]'); if(!b) return; e.preventDefault(); b.click(); });
})();
let pdRaf=0; const pdFitSoon=()=>{ if(pdRaf) return; pdRaf=requestAnimationFrame(()=>{ pdRaf=0; pdFit(); }); };   /* 鍵盤滑上來時事件會一直來：一格畫面只算一次，內容不會跳 */
if(window.visualViewport){ visualViewport.addEventListener("resize",pdFitSoon); visualViewport.addEventListener("scroll",pdFitSoon); }
/* 11/12：打字時把後面那頁「釘住」（跟 TIE 一樣整頁不能被 iPhone 往上推）。
   以前後面的頁面（例如很長的藝人動態）可以被鍵盤推著捲，貼文頁的位置就算錯 → 鍵盤上方一片黑、貼文跑到鍵盤後面 */
const PDL={on:false,y:0};
function pdLock(){ if(PDL.on) return; PDL.on=true; PDL.y=window.scrollY; const b=document.body.style; b.position="fixed"; b.top=(-PDL.y)+"px"; b.left="0"; b.right="0"; b.width="100%"; }
function pdUnlock(){ if(!PDL.on) return; PDL.on=false; const b=document.body.style; b.position=""; b.top=""; b.left=""; b.right=""; b.width=""; window.scrollTo(0,PDL.y); }
document.addEventListener("focusin",e=>{ if(e.target&&e.target.closest&&e.target.closest(".pd-in")){ pdLock(); [0,60,120,250,350,600].forEach(t=>setTimeout(()=>{ if(PDL.on&&window.scrollY) window.scrollTo(0,0); pdFit(); },t)); } });
document.addEventListener("focusout",e=>{ if(e.target&&e.target.closest&&e.target.closest(".pd-in")) setTimeout(()=>{ const a=document.activeElement; if(!(a&&a.closest&&a.closest(".pd-in"))) pdUnlock(); pdFit(); },80); });
addEventListener("scroll",()=>{ if(!PDL.on) return; if(window.scrollY) window.scrollTo(0,0); pdFitSoon(); },{passive:true});
/* 貼文頁關掉時一定放開（不然後面那頁會滑不動） */
new MutationObserver(()=>{ if(PDL.on&&!document.querySelector(".pd")) pdUnlock(); }).observe(document.getElementById("layer")||document.body,{childList:true});
document.addEventListener("touchmove",e=>{ const mr=e.target.closest&&e.target.closest(".mr.dl"); if(!mr||!e.cancelable) return; const sc=e.target.closest("#cmTick,.cm-tick"); if(sc&&sc.scrollHeight>sc.clientHeight+2) return; e.preventDefault(); },{passive:false});
document.addEventListener("focusin",e=>{ if(e.target&&e.target.id==="lin") setTimeout(()=>{ window.scrollTo(0,0); lvFit(); },60); });
addEventListener("scroll",()=>{ try{ const r=route(); if(r.sub==="chat"&&!r.p&&document.getElementById("chat-end")){ const de=document.documentElement; ui.chatPos={m:r.m,y:window.scrollY,bottom:window.scrollY+window.innerHeight>=de.scrollHeight-60}; } }catch(e){} },{passive:true});
function tieFootPad(){ if(tieFxOn()) return; const ms=document.querySelector(".t-msgs"), f=document.querySelector(".t-foot"), end=document.getElementById("chat-end"); if(!ms||!f||!end||ms.classList.contains("kbbox")) return;
  const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1, last=[...ms.querySelectorAll(":scope > .t-me,:scope > .t-art,:scope > .t-anniv")].pop();
  /* 量：聊天區下面還多了多少（頁面底部的留白）、最後一則下面本來就有的間距；扣掉後，最後一則剛好在輸入列上面 12 */
  const below=(document.documentElement.getBoundingClientRect().bottom-ms.getBoundingClientRect().bottom)/z, tail=last?(end.getBoundingClientRect().top-last.getBoundingClientRect().bottom)/z:0;
  ms.style.paddingBottom=Math.max(0,f.getBoundingClientRect().height/z+12-below-tail)+"px"; }
addEventListener("resize",()=>tieFootPad());
/* 同步進來的資料只改了一點點時：不要整頁換掉，只改有變的那幾個字／屬性（整頁換掉 → 圖片重新出現、畫面閃一下） */
const MORPH_MEDIA=new Set(["IMG","VIDEO","AUDIO","CANVAS","IFRAME"]);
function morphKey(n){ return n.nodeType===1?(n.id||n.getAttribute("data-id")||n.getAttribute("data-mid")||""):""; }
function morphAttrs(a,b){ for(const at of b.attributes) if(a.getAttribute(at.name)!==at.value) a.setAttribute(at.name,at.value);
  for(const at of [...a.attributes]) if(!b.hasAttribute(at.name)&&at.name!=="data-hyd") a.removeAttribute(at.name); }
function morphNode(a,b){
  if(a.nodeType!==b.nodeType||a.nodeName!==b.nodeName){ a.replaceWith(b); return; }
  if(a.nodeType!==1){ if(a.nodeValue!==b.nodeValue) a.nodeValue=b.nodeValue; return; }
  if(a.isEqualNode(b)) return;
  if(MORPH_MEDIA.has(a.nodeName)){ /* 圖片、影片：原本的屬性都還在（只是多了載好的 src）就整個留著，不重載 */
    const same=[...b.attributes].every(at=>a.getAttribute(at.name)===at.value||(at.name==="src"&&a.dataset.hyd)); if(!same) a.replaceWith(b); return; }
  if(a.nodeName==="svg"){ if(a.outerHTML!==b.outerHTML) a.replaceWith(b); return; }
  morphAttrs(a,b); morphKids(a,b); }
function morphKids(a,b){ const ok=[...a.childNodes], nk=[...b.childNodes], byKey=new Map(); ok.forEach(n=>{ const k=morphKey(n); if(k&&!byKey.has(k)) byKey.set(k,n); });
  const used=new Set(); let free=ok.filter(n=>!morphKey(n)); let ref=a.firstChild;
  nk.forEach(n=>{ const k=morphKey(n); let o=k?byKey.get(k):null; if(o&&used.has(o)) o=null;
    if(!o&&!k){ while(free.length&&used.has(free[0])) free.shift(); const c=free[0]; if(c&&c.nodeType===n.nodeType&&c.nodeName===n.nodeName){ o=c; free.shift(); } }
    if(o){ used.add(o); if(o!==ref) a.insertBefore(o,ref); else ref=ref.nextSibling; morphNode(o,n); }
    else a.insertBefore(n,ref); });
  ok.forEach(n=>{ if(!used.has(n)&&n.parentNode===a) n.remove(); }); }
function paint(html,hasNav,navHtml=""){
  const pgChg=ui._ph!==location.hash, prevY=window.scrollY, prevBottom=window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-40;
  if(hasNav&&isUni()&&!navHtml.includes("sn-nav2")){ const ro=route().role; if(ro==="fan") navHtml=uniNav(uniActive()); else if(ro==="admin") navHtml=uniAdminNav(); html=uniSwitch()+html; }
  /* 一模一樣的畫面就不要重畫（別人的資料同步進來、內容其實沒變時，重畫會讓照片閃一下、滑到一半跳掉） */
  if(ui._syncPaint&&!pgChg&&ui._pHtml===html&&ui._pNav===navHtml&&root.querySelector(":scope > .app")) return;
  ui._pHtml=html; ui._pNav=navHtml;
  setTimeout(onboardCheck,500);
  setTimeout(()=>{ const s=session(); if(s&&welcomeDone()&&!ui.coach&&(s.role==="artist"||s.uni)) artBdayCheck(s.role==="artist"?s.member:uniMe()); },900);
  try{ if(ui._ph&&ui._ph!==location.hash&&root.firstElementChild){ SNAP.set(ui._ph,{html:root.innerHTML,y:window.scrollY}); if(SNAP.size>12) SNAP.delete(SNAP.keys().next().value); } }catch(e){}
  if(ui._ph!==location.hash){ const H=NAVSTK; if(H.length>1&&H[H.length-2]===location.hash) H.pop(); else if(H[H.length-1]!==location.hash) H.push(location.hash); if(H.length>30) H.shift(); } ui._ph=location.hash;
  const pa0=pageAnim(), pa=ui.swiped?"":pa0; ui.swiped=false; const fixedPage=/class="(mr |mr"|t-foot|t-bgl|sticky-cta)/.test(html);
  const anPa=pa&&AN.ok()?pa:"";
  const pc=pa&&!anPa&&!matchMedia("(prefers-reduced-motion: reduce)").matches?" pg-"+(fixedPage&&pa!=="op"?"op":pa)+(fixedPage&&pa==="push"?" pg-tpush":""):"";
  // 導覽列不要每次重畫：同一組分頁就保留原本的玻璃列，只把鏡片滑過去（才不會卡）
  const oldSn=root.querySelector(".sn-nav2"), oldNav=root.querySelector(":scope > .nav"), tmp=document.createElement("div"); if(hasNav) tmp.innerHTML=navHtml; const newNav=tmp.firstElementChild;
  const sig=n=>n?n.className+(n.querySelector(".nav-lens")?"L":"")+[...n.querySelectorAll(".nav-btn")].map(b=>b.dataset.v+"|"+b.querySelector(".nav-ico").innerHTML.length).join(","):"";
  if(hasNav&&oldNav&&newNav&&sig(oldNav)===sig(newNav)){
    const app=root.querySelector(":scope > .app"); const box=document.createElement("div"); box.innerHTML=`<div class="app ${hasNav?"":"no-nav"}${pc}">${html}</div>`;
    if(app&&ui._syncPaint&&!pgChg){ try{ morphNode(app,box.firstElementChild); }catch(e){ const a2=root.querySelector(":scope > .app"); box.innerHTML=`<div class="app ${hasNav?"":"no-nav"}${pc}">${html}</div>`; if(a2) a2.replaceWith(box.firstElementChild); } }
    else if(app) app.replaceWith(box.firstElementChild); else root.prepend(box.firstElementChild);
    const nb=[...newNav.querySelectorAll(".nav-btn")]; [...oldNav.querySelectorAll(".nav-btn")].forEach((b,k)=>{ b.className=nb[k].className; if(nb[k].hasAttribute("aria-current")) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current"); });
    const L=oldNav.querySelector(".nav-lens"), i=nb.findIndex(b=>b.classList.contains("on")); if(L&&i>=0){ const f0=parseFloat(L.style.getPropertyValue("--i")); L.classList.remove("go"); L.style.setProperty("--i",i); L.style.setProperty("--f",i); if(!AN.lens(L,f0,i)) L.style.transform=""; }
  } else if(!hasNav&&!oldNav&&ui._syncPaint&&!pgChg&&root.querySelector(":scope > .app")&&root.children.length===1){ const box=document.createElement("div"); box.innerHTML=`<div class="app no-nav${pc}">${html}</div>`; try{ morphNode(root.querySelector(":scope > .app"),box.firstElementChild); }catch(e){ root.innerHTML=box.innerHTML; } }
  else root.innerHTML=`<div class="app ${hasNav?"":"no-nav"}${pc}">${html}</div>${hasNav?navHtml:""}`;
  /* 保險：這頁應該有導覽列卻不見了，補回去 */
  if(hasNav&&navHtml&&!root.querySelector(":scope > .nav")) root.insertAdjacentHTML("beforeend",navHtml);
  /* SNS 下面的分頁列：保留原本那條，鏡片直接滑過去，不要整條重畫（才順） */
  { const nw=root.querySelector(".sn-nav2"); if(oldSn&&nw&&oldSn!==nw){ const oL=oldSn.querySelector(".nav-lens"), nL=nw.querySelector(".nav-lens"), ob=[...oldSn.querySelectorAll(".nav-btn")], nb=[...nw.querySelectorAll(".nav-btn")];
      if(oL&&nL&&ob.length===nb.length){ ob.forEach((b,k)=>{ b.className=nb[k].className; b.querySelector(".nav-ico").innerHTML=nb[k].querySelector(".nav-ico").innerHTML; }); const i=nb.findIndex(b=>b.classList.contains("on")), f0=parseFloat(oL.style.getPropertyValue("--i")); oL.classList.remove("go"); if(i>=0){ oL.style.setProperty("--i",i); oL.style.setProperty("--f",i); } if(!(i>=0&&AN.lens(oL,f0,i))) oL.style.transform=""; nw.replaceWith(oldSn); } } }
  if(AN.ok()){ root.querySelectorAll(".nav-lens.go").forEach(L=>AN.lens(L,parseFloat(L.style.getPropertyValue("--f")),parseFloat(L.style.getPropertyValue("--i")))); if(anPa) AN.page(root.querySelector(":scope > .app"),anPa,fixedPage); }
  hydrateMedia(root); try{ snMusWatch(); }catch(e){} try{ truckAttach(); }catch(e){} tieFootPad(); try{ lvLockSync(); }catch(e){} try{ const sw=document.querySelector(".uni-sw"); document.documentElement.style.setProperty("--uniH",sw?sw.offsetHeight+"px":"0px"); }catch(e){} if(VP.mid) vpUI(); try{ lvMiniMount(); }catch(e){}
  const tev=document.getElementById("tev"); if(tev){ tev.focus(); tev.setSelectionRange(tev.value.length,tev.value.length); }
  { const hs=document.getElementById("hostFeed"); if(hs) hs.scrollTop=hs.scrollHeight; const ms=document.getElementById("mrStream"); if(ms) ms.scrollTop=ms.scrollHeight; }
  mountSticks(root);
  if(tie2After(pgChg,ui.scrollChat)){ ui.scrollChat=false; ui.restoreChatY=null; ui._restored=false; }   /* TIE 固定外殼：位置它自己管，下面的整頁捲動都不用做 */
  if(ui.restoreChatY!=null){ const y=ui.restoreChatY; ui.restoreChatY=null; ui.scrollChat=false; ui._restored=true; const go=()=>window.scrollTo(0,y); go(); requestAnimationFrame(go); setTimeout(go,120); }
  if(ui.scrollChat){ if(document.getElementById("chat-end")) window.scrollTo(0,document.documentElement.scrollHeight); ui.scrollChat=false; }
  /* 聊天室（藝人端 TIE 等用整頁捲動的）：剛打開就在最底下；畫面更新時停在原本的位置，原本在最底就留在最底 */
  if(document.getElementById("chat-end")&&!document.querySelector(".t-page")&&!tieFxOn()){ const toEnd=()=>window.scrollTo(0,document.documentElement.scrollHeight);
    if(ui._restored) ui._restored=false; else if(pgChg||prevBottom){ toEnd(); requestAnimationFrame(toEnd); setTimeout(toEnd,120); } else window.scrollTo(0,prevY); }
  if(ui.focusEv){ const el=document.getElementById("ev-"+ui.focusEv); if(el){ el.scrollIntoView({block:"center"}); el.classList.add("flash"); setTimeout(()=>el.classList.remove("flash"),1600);} ui.focusEv=null; }
  if(ui.focusPost){
    const el=document.getElementById("post-"+ui.focusPost);
    if(el){ el.scrollIntoView({block:"center"}); el.classList.add("flash"); setTimeout(()=>el.classList.remove("flash"),1600); }
    ui.focusPost=null;
  }
}

/* ---------- 登入 ---------- */
function viewAuth(){
  if(ui.resuming) return `<main class="auth boot" aria-busy="true"><h1 class="hc-wm big">${APP_NAME}</h1><i class="boot-dot"></i></main>`;   // 打開 App 確認登入中：只顯示 LOGO，不要閃登入表單
  const acc=(e,p,label)=>`<button class="demo-acc" data-a="fill" data-e="${e}" data-p="${p}"><span>${label}</span><b>${e}</b></button>`;
  return `<main class="auth">
    <h1 class="hc-wm big">${APP_NAME}</h1>
    ${ui.authMode==="reg"?`<form id="reg" autocomplete="on">
      <span class="fld-lab">帳號</span><label class="field">${I.user}<input id="rEm" type="text" placeholder="輸入帳號" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" required></label>
      <span class="fld-lab">暱稱（之後可以改）</span><label class="field">${I.heart}<input id="rNm" maxlength="20" placeholder="輸入文字" required></label>
      <span class="fld-lab">密碼</span><label class="field">${I.lock}<input id="rPw" type="password" placeholder="輸入文字" autocomplete="new-password" required></label>
      ${ui.loginErr?`<div class="err">${ui.loginErr}</div>`:""}
      <button class="btn btn-main btn-block" type="submit" ${ui.authBusy?"disabled":""}>${ui.authBusy?"註冊中…":"註冊並開始 ✨"}</button>
      <button class="auth-sw" type="button" data-a="authMode" data-v="login">已經有帳號？登入</button>
    </form>`:`<form id="login" autocomplete="on">
      <span class="fld-lab">帳號</span><label class="field">${I.user}<input id="em" type="text" placeholder="輸入帳號" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" value="${esc(acctUser(S.get(K.lastEmail,"")))}" required></label>
      <span class="fld-lab">密碼</span><label class="field">${I.lock}<input id="pw" type="password" placeholder="輸入密碼" autocomplete="current-password" required></label>
      ${ui.loginErr?`<div class="err">${ui.loginErr}</div>`:""}
      <button class="btn btn-main btn-block" type="submit" ${ui.authBusy?"disabled":""}>${ui.authBusy?"登入中…":"登入"}</button>
      <button class="auth-sw" type="button" data-a="forgotPw">忘記密碼？</button>
    </form>`}

  </main>`;
}

/* ---------- 粉絲：選藝人 ---------- */
const selDoneFor=()=>!!S.get(K.selDone,{})[(session()||{}).email||""];   // 每個帳號第一次進粉絲端都要先選追蹤的藝人
function viewSelect(){
  const first=!followed().length||!selDoneFor();
  if(!ui.selectDraft) ui.selectDraft=new Set(first?[]:followed());
  const q=nz(ui.selectQuery.trim());
  const list=GROUPS.filter(g=>(ui.selectFilter==="new"?gNew(g):true)&&hit(q,g.name,...grpMembers(g.id).flatMap(id=>[MEMBERS[id].name,artName(id,"feed"),artName(id,"tie")])));
  const n=ui.selectDraft.size;
  const names=GROUPS.filter(g=>ui.selectDraft.has(g.id)).map(g=>g.name).join("、");
  return `<header class="top"><div class="top-row">
      ${first?`<div class="logo">${APP_NAME}</div>`:`<button class="icon-btn" data-a="back" aria-label="返回">${I.back}</button>`}
      <div class="top-title">${first?"":"編輯追蹤"}</div><div style="width:42px"></div></div></header>
    <main class="page" style="padding-bottom:140px">
      <h2 style="margin:6px 2px 2px;font-size:22px">請搜尋您有興趣的藝人</h2>
      <p class="muted" style="margin:0 2px 14px;font-size:14px">選擇後會為你建立專屬社群動態 💜</p>
      <label class="field">${I.search}<input id="sq" placeholder="輸入文字" value="${esc(ui.selectQuery)}" autocomplete="off">${ui.selectQuery?`<button type="button" class="sh-x" data-a="sqClear" aria-label="清除關鍵字">${XI}</button>`:""}</label>
      <div class="chips">
        <button class="chip ${ui.selectFilter==="all"?"on":""}" data-a="sf" data-v="all">全部</button>
        <button class="chip ${ui.selectFilter==="new"?"on":""}" data-a="sf" data-v="new">New</button>
      </div>
      ${list.length?`<div class="grid">${list.map(g=>`
        <button class="g-card ${ui.selectDraft.has(g.id)?"on":""}" style="background:${grad(g.g)}" data-a="pick" data-id="${g.id}" aria-pressed="${ui.selectDraft.has(g.id)}">
          <span class="deco d1">${I.heart}</span><span class="deco d2">${I.heart}</span><span class="deco d3">✦</span><span class="chk">${I.check}</span><b>${g.name}</b>${gNew(g)?'<span class="tag">New</span>':""}
        </button>`).join("")}</div>`
      :srchEmpty("藝人")}
    </main>
    <div class="sticky-cta"><div class="in">
      <button class="btn btn-main btn-block" data-a="saveSelect" ${n?"":"disabled"}>${n?`加入 ${n} 個社群吧！`:"最少請選擇一個"}</button>
    </div></div>`;
}

/* ---------- 共用：貼文卡 ---------- */
/* 貼文權限：💎 只限 Membership、🔒 私密（要猜中藝人設的密碼） */
const viewerFan=()=>{ const s=session(); return !!s&&s.role==="fan"; };
const pwOpened=id=>S.get(K.pwOpen,[]).includes(id);
/* 動態卡片：點頭貼、點名字、點照片、點卡片任何地方都進貼文頁（按讚、書籤、⋯、投票、影片播放、展開全文照原本的功能） */
document.addEventListener("click",e=>{ const card=e.target.closest&&e.target.closest("article.card.post[data-id]"); if(!card||card.closest(".pd")) return;
  const a=e.target.closest("[data-a]"); if(a&&a!==card&&!["pmGal","comments","post"].includes(a.dataset.a)) return;   /* 點頭貼照原本：去藝人個人頁 */
  if(a===card) return; e.preventDefault(); e.stopImmediatePropagation(); card.dispatchEvent(new MouseEvent("click",{bubbles:true})); },true);
/* Membership 貼文：沒買會員時，按讚、留言（打開貼文）、書籤都先跳出 Membership 視窗 */
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="like"],[data-a="comments"],[data-a="bmTog"],[data-a="pdLike"],[data-a="cmLike"]'); if(!t) return;
  const id=t.dataset.id||String(t.dataset.v||"").replace(/^p:/,""); if(!id) return; const p=(S.get(K.posts,[])||[]).find(x=>x.id===id); if(!p||postLocked(p)!=="ms") return;
  e.preventDefault(); e.stopImmediatePropagation(); msGate(p.group); },true);
function postLocked(p){ if(!viewerFan()) return null; if(p.vis==="ms"&&!isMember(p.group)) return "ms"; if(p.vis==="pw"&&!pwOpened(p.id)) return "pw"; return null; }
function lockedBody(p,kind){ const m=MEMBERS[p.member];
  if(kind==="pw") return `<button class="pv-lock pvk" data-a="pwOpen" data-id="${p.id}"><b>🔒 私密貼文</b><small>點擊查看此貼文</small></button>`;
  const hasPic=!!(p.media&&p.media.length&&p.media[0].kind!=="video"&&p.media[0].mid);
  return hasPic?`<button class="pv-blur" data-a="msGate" data-g="${p.group}"><span class="pv-bg" style="background:${grad(p.color!=null?p.color:m.g)}"><img data-mid="${p.media[0].mid}" alt=""></span><em class="pv-ms">💎</em></button>`
    :`<button class="pv-lock ms" data-a="msGate" data-g="${p.group}"><b>💎 membership</b></button>`; }
function msGate(gid){ setLayer(`<div class="pv-w" data-a="tCloseLayer"><div class="pv-d" role="dialog"><h3>💎 Membership 內容</h3><p>立刻加入官方 Membership，享有特別權益！</p><button class="pv-pri" data-a="msIntro" data-g="${gid}">加入 Membership</button><button class="pv-sec" data-a="tCloseLayer">取消</button></div></div>`,"msgate"); }
function openMsIntro(gid){ const g=groupOf(gid); if(!g) return;
  setLayer(`<div class="msi" role="dialog" aria-label="Membership"><header><span></span><b>Membership</b><button data-a="msiClose" aria-label="關閉">${XI}</button></header>
    <div class="msi-b"><section class="msi-p"><div class="msi-card" style="--gt:${gTheme(gid)}"><span class="msi-top"><i>💎</i></span><b>${esc(g.name)}</b><small>${esc(g.name)}<br>OFFICIAL FANCLUB MEMBERSHIP</small></div>
      <h3>💎 ${esc(g.name)}</h3><p>立刻加入官方 Membership，享有特別權益！</p></section>
      <h4>Membership Benefits</h4><ul><li>${esc(g.name)} 會員限定貼文、照片與影片</li><li>官方應援棒（演唱會燈海可以舉起來）</li><li>TIE 暱稱專屬流光、留言 💎 會員徽章</li><li>簽售、演唱會等活動的會員優先資格</li><li>Online Membership Card</li></ul></div>
    <footer><button class="pv-pri" data-a="msJoin" data-g="${gid}">在 SHOP 加入 Membership</button></footer></div>`,"msi"); }
function openPwSheet(id){ setLayer(`<div class="pv-w sh" data-a="tCloseLayer"><div class="pv-s" role="dialog" aria-label="貼文密碼"><div class="pv-sh"><b>貼文密碼</b><button data-a="tCloseLayer" aria-label="關閉">${XI}</button></div>
    <label class="pv-in"><input id="pwIn" type="password" maxlength="12" autocomplete="off" placeholder="" aria-label="輸入貼文密碼"><button type="button" data-a="pwEye" aria-label="顯示密碼"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button></label>
    <button class="pv-pri" data-a="pwGo" data-id="${id}">確定</button><span class="pv-err" id="pwErr" hidden>密碼有誤。</span></div></div>`,"pw");
  setTimeout(()=>{ const i=document.getElementById("pwIn"); if(i) i.focus(); },120); }
function pwTry(id){ const p=getPosts().find(x=>x.id===id), i=document.getElementById("pwIn"); if(!p||!i) return;
  if(String(i.value).trim()===String(p.pw)){ const L=S.get(K.pwOpen,[]); L.push(id); S.set(K.pwOpen,L); layer.innerHTML=""; const y=window.scrollY; render(); window.scrollTo(0,y); toast("🔓 打開了！"); return; }
  const e=document.getElementById("pwErr"); if(e){ e.hidden=false; e.classList.remove("pop"); void e.offsetWidth; e.classList.add("pop"); clearTimeout(ui.pwT); ui.pwT=setTimeout(()=>{ e.hidden=true; },1600); } i.select(); }
function postCard(p,{mine=false,prof=false}={}){
  const m=MEMBERS[p.member], g=groupOf(p.group), liked=likedSet().has(p.id); if(!m||!g) return "";   // 發文的藝人或團已刪除：跳過，不要讓整頁卡住
  const long=p.text.length>90 && !ui.expanded.has(p.id);
  if(m.official&&p.media&&p.media.length&&!postLocked(p)) return `<article class="card post post-tap ofc" id="post-${p.id}" data-a="comments" data-id="${p.id}"><div class="ofc-m">${postMediaHtml(p)}</div><div class="ofc-b">
    <div class="post-head ofc-h">${ofAv(p.group)}<div class="who"><b>${esc(g.name)} ${I.verified} <span class="badge">官方</span>${p.vis==="ms"?' <span class="badge">💎 Membership</span>':""}</b><span>${ymdhm(p.ts)}</span></div>${canModerate()&&!mine?`<button class="uni-more" data-a="postMod" data-id="${p.id}" aria-label="管理這則">⋯</button>`:""}</div>
    ${postTextHtml(p,mine,long)}${long?`<button class="more" data-a="expand" data-id="${p.id}">展開全文</button>`:""}
    <div class="post-foot"><button class="act ${liked?"liked":""}" data-a="like" data-id="${p.id}" aria-pressed="${liked}" aria-label="按讚">${I.heart}<span>${fmt(likeN(p))}</span></button><button class="act" data-a="comments" data-id="${p.id}" aria-label="留言">${I.chat}<span>${fmt(commentCount(p.id))}</span></button>${mine?`<button class="del" data-a="del" data-id="${p.id}">刪除</button>`:""}${session()&&session().role==="fan"?bmBtn("p:"+p.id):""}</div></div></article>`;
  return `<article class="card post post-tap" id="post-${p.id}" data-a="comments" data-id="${p.id}">
    <div class="post-head">
      ${viewerFan()&&!mine&&!prof?`<button class="av av-go" data-a="goArtist" data-v="${p.member}" aria-label="${esc(artName(p.member,"feed"))} 的頁面" style="background:${grad(m.g)}">${mAvIn(p.member)}</button>`:`<div class="av" style="background:${grad(m.g)}">${mAvIn(p.member)}</div>`}
      <div class="who"><b>${esc(artName(p.member,"feed"))} ${I.verified}${m.official?' <span class="badge">官方</span>':""}${p.hidden?' <span class="badge warn">已被管理員隱藏</span>':""}</b><span>${ymdhm(p.ts)}</span></div>
      ${canModerate()&&!mine?`<button class="uni-more" data-a="postMod" data-id="${p.id}" aria-label="管理這則">⋯</button>`:""}
    </div>
    ${p.tag&&p.tag!=="日常"?`<span class="post-tag t-${POST_TAGS.indexOf(p.tag)}">${p.tag==="劇透"?"⚠ ":""}${esc(p.tag)}</span>`:""}
    ${!viewerFan()&&p.vis?`<span class="post-vis">${p.vis==="ms"?"💎 Membership 限定":`🔒 私密貼文・密碼 ${esc(p.pw||"")}`}</span>`:""}
    ${postLocked(p)?lockedBody(p,postLocked(p)):(()=>{ const hide=p.tag==="劇透"&&!mine&&session().role==="fan"&&!(ui.spoil&&ui.spoil.has(p.id)); return `<div class="post-body ${hide?"spoiler":""}">
    ${postTextHtml(p,mine,long)}
    ${long?`<button class="more" data-a="expand" data-id="${p.id}">展開全文</button>`:""}
    ${p.media?postMediaHtml(p):p.color!=null?`<div class="pic" style="background:${grad(p.color)}">${I.heart}</div>`:""}
    ${p.poll?pollCard(p):""}
    ${hide?`<button class="spoil-btn" data-a="spoil" data-id="${p.id}">這是劇透內容・點一下查看</button>`:""}</div>`; })()}
    <div class="post-foot">
      <button class="act ${liked?"liked":""}" data-a="like" data-id="${p.id}" aria-pressed="${liked}" aria-label="按讚">${I.heart}<span>${fmt(likeN(p))}</span></button>
      <button class="act" data-a="comments" data-id="${p.id}" aria-label="留言">${I.chat}<span>${fmt(commentCount(p.id))}</span></button>
      ${mine?`<button class="del" data-a="del" data-id="${p.id}">刪除</button>`:""}${session()&&session().role==="fan"?bmBtn("p:"+p.id):""}
    </div>
  </article>`;
}
/* 貼文翻譯（照 Weverse）：韓文、日文、英文的貼文直接顯示中文翻譯，下面「查看原文」；翻好的存在共用的 K.postTr，大家共用不重翻 */
const postLang=t=>{ const s=String(t||""); if(hasHangul(s)) return "韓國語"; if(/[\u3040-\u30ff]/.test(s)) return "日本語"; if(/[A-Za-z]{3,}/.test(s)&&!/\p{Script=Han}/u.test(s)) return "English"; return ""; };
const postTrGet=id=>(S.get(K.postTr,{})||{})[id]||"";
const ptrBusy=new Set();
function postTrNeed(p){ if(!p||!p.text||postTrGet(p.id)||ptrBusy.has(p.id)||!postLang(p.text)) return; ptrBusy.add(p.id);
  translateMany([hasHangul(p.text)?koPre(p.text):p.text],"zh").then(out=>{ const t=out&&String(out[0]||"").trim(); if(!t||t===p.text.trim()) return;
    const all={...(S.get(K.postTr,{})||{})}; all[p.id]=t; try{ S.set(K.postTr,all); }catch(e){}
    document.querySelectorAll(`[data-ptx="${p.id}"]`).forEach(el=>{ const pc=el.closest(".post"); el.outerHTML=postTextHtml(p,false,el.classList.contains("clamp")); }); }).catch(()=>{}).finally(()=>ptrBusy.delete(p.id)); }
/* ===== 所有留言區的翻譯：中文以外都翻成中文，下面「查看原文」。翻好的大家共用（K.cmTr），一次收集一批再送去翻 ===== */
const anyLang=t=>{ if(/^\[stk:[a-z_]+\]$/.test(String(t||"").trim())) return ""; const s=String(t||""), pl=postLang(s); if(pl) return pl; if(/\p{Script=Han}/u.test(s)) return ""; const o=s.replace(/[A-Za-z0-9\s\p{P}\p{S}\p{Extended_Pictographic}]/gu,""); return /\p{L}{2,}/u.test(o)?"外語":""; };
const cmTrGet=k=>(S.get(K.cmTr,{})||{})[k]||"";
const trQ=new Map(), trBusyK=new Set(); let trQT=0; ui.trSrc=ui.trSrc||{};
function trNeedT(k,text){ if(stkOf(text)) return; if(trBusyK.has(k)||cmTrGet(k)) return; trBusyK.add(k); trQ.set(k,text); clearTimeout(trQT); trQT=setTimeout(trFlush,120); }
function trFlush(){ const ks=[...trQ.keys()].slice(0,40), tx=ks.map(k=>{ const t=trQ.get(k); trQ.delete(k); return hasHangul(t)?koPre(t):t; }); if(!ks.length) return;
  translateMany(tx,"zh").then(out=>{ const all={...(S.get(K.cmTr,{})||{})}; let ch=false; ks.forEach((k,i)=>{ const t=out&&String(out[i]||"").trim(); if(t&&t!==String(ui.trSrc[k]&&ui.trSrc[k].text||"").trim()){ all[k]=t; ch=true; } });
    if(ch){ const keys=Object.keys(all); if(keys.length>3000) keys.slice(0,keys.length-3000).forEach(x=>delete all[x]); try{ S.set(K.cmTr,all); }catch(e){} ks.forEach(trPaint); } })
  .catch(()=>{}).finally(()=>{ ks.forEach(k=>trBusyK.delete(k)); if(trQ.size) trQT=setTimeout(trFlush,200); }); }
function trPaint(k){ document.querySelectorAll(`[data-trk2="${CSS.escape(k)}"]`).forEach(el=>{ const t=cmTrGet(k); if(t){ el.textContent=t; el.hidden=false; } }); const s=ui.trSrc[k]; if(!s) return; document.querySelectorAll(`[data-trk="${CSS.escape(k)}"]`).forEach(el=>{ const nx=el.nextElementSibling; if(nx&&nx.classList.contains("pt-orig")&&nx.dataset.k===k) nx.remove(); el.outerHTML=s.plain?trPlain(k,s.text,s.cls,s.tag):trT(k,s.text,s.cls,s.tag,s.lazy); }); }
/* 原文下面附一行翻譯（直播留言給藝人看）；還沒翻好先藏著 */
function trBelow(k,text){ if(!anyLang(text)) return ""; const tr=cmTrGet(k); if(!tr) setTimeout(()=>trNeedT(k,text),0); return `<small class="tk-tr" data-trk2="${esc(k)}"${tr?"":" hidden"}>${esc(tr||"")}</small>`; }
/* 文字＋「查看原文」按鈕 */
function trT(k,text,cls="",tag="p",lazy=false){ const lg=anyLang(text), tr=lg&&cmTrGet(k), orig=ui.ptOrig&&ui.ptOrig.has(k); ui.trSrc[k]={text,cls,tag,lazy}; ui.trAsk=ui.trAsk||new Set();
  /* lazy（照 Weverse 粉絲留言）：先放原文，按「查看翻譯」才翻 */
  if(lazy&&lg&&!ui.trAsk.has(k)) return `<${tag} class="${cls}" data-trk="${esc(k)}">${esc(text)}</${tag}><button class="pt-orig" data-a="trAsk" data-k="${esc(k)}">查看翻譯</button>`;
  if(lg&&!tr) setTimeout(()=>trNeedT(k,text),0);
  return `<${tag} class="${cls}" data-trk="${esc(k)}">${esc(tr&&!orig?tr:text)}</${tag}>${tr?`<button class="pt-orig" data-a="trOrig" data-k="${esc(k)}">${orig?"查看翻譯":`查看原文 (${lg})`}</button>`:""}`; }
/* 只放翻好的字（在按鈕裡面，不能再放按鈕） */
function trPlain(k,text,cls="",tag="span"){ const lg=anyLang(text), tr=lg&&cmTrGet(k); ui.trSrc[k]={text,cls,tag,plain:1}; if(lg&&!tr) setTimeout(()=>trNeedT(k,text),0); return `<${tag} class="${cls}" data-trk="${esc(k)}">${esc(tr||text)}</${tag}>`; }
function postTextHtml(p,mine,long){ const lg=!mine&&postLang(p.text), tr=lg&&postTrGet(p.id), orig=ui.ptOrig&&ui.ptOrig.has(p.id);
  if(lg&&!tr) setTimeout(()=>postTrNeed(p),0);
  return `<p class="post-text ${long?"clamp":""}" data-ptx="${p.id}">${esc(tr&&!orig?tr:p.text)}</p>${tr?`<button class="pt-orig" data-a="ptOrig" data-id="${p.id}">${orig?"查看翻譯":`查看原文 (${lg})`}</button>`:""}`; }
const emptyBox=(icon,title,text,btn="")=>`<div class="empty"><div class="e-ico">${icon}</div><h3>${title}</h3><p>${text}</p>${btn}</div>`;

/* ---------- 共用搜尋（規則對標首頁）：
   左上放大鏡 → 整列換成搜尋框（左放大鏡、右清除 ✕、旁邊「關閉」）
   有關鍵字時顯示「包含「…」之結果」，找不到時顯示 🔮 提示
   點搜尋列以外的任何地方：關閉搜尋並清空關鍵字（照 NSY） ---------- */
const srchOn=key=>!!(ui.srch&&ui.srch.key===key);
/* 搜尋一律把花體字、全形字轉成一般字再比（打 kirin 也找得到 𝐊𝐢𝐫𝐢𝐧） */
const nz=x=>String(x||"").normalize("NFKC").toLowerCase();
const srchQ=key=>srchOn(key)?nz(ui.srch.q.trim()):"";
const srchBtn=key=>`<button class="icon-btn sh-btn" data-a="shOpen" data-k="${key}" aria-label="搜尋">${I.search}</button>`;
function srchBar(ph){ const q=ui.srch.q;
  return `<div class="sh-bar"><label class="sh-in">${I.search}<input id="shq" placeholder="輸入文字" value="${esc(q)}" autocomplete="off" enterkeyhint="search">${q?`<button type="button" class="sh-x" data-a="shClear" aria-label="清除關鍵字">${XI}</button>`:""}</label><button class="sh-close" data-a="shClose">關閉</button></div>`; }
const srchLabel=key=>{const q=srchOn(key)?ui.srch.q.trim():""; return q?`<div class="sh-label">包含「${esc(q)}」之結果</div>`:"";};
const srchEmpty=noun=>`<div class="card sh-empty"><div class="sh-e-ico">🔮</div><h5>無符合搜尋條件的${noun}</h5><p>請嘗試更換其他搜尋關鍵字 ✨</p></div>`;
const hit=(q,...fields)=>!q||fields.some(f=>nz(f).includes(q));
const postHit=(q,p)=>{const m=MEMBERS[p.member],g=groupOf(p.group);return hit(q,m&&m.name,g&&g.name,p.text)};
const evHit=(q,e)=>{const m=MEMBERS[e.member],g=groupOf(e.group);return hit(q,e.title,e.place,e.desc,m&&m.name,g&&g.name)};
const liveHit=(q,l)=>{const m=MEMBERS[l.member],g=groupOf(l.group);return hit(q,l.title,m&&m.name,g&&g.name)};

/* ---------- 小圖示（區塊標題用，風格 C） ---------- */
const HI={heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5s1.2-6.1 3.8-8.5z"/>',truck:'<path d="M3 7.5h11v9H3z"/><path d="M14 10.5h3.5l3 3v3H14z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/><path d="M4.5 7.5l1.2-2.5h7.6l1.2 2.5"/>',news:'<path d="M4.5 5.5h11v13h-10a1 1 0 0 1-1-1z"/><path d="M15.5 9h3.5v8.5a1 1 0 0 1-1 1h-2.5"/><path d="M7.5 9h5M7.5 12h5M7.5 15h3"/>',cam:'<path d="M4 8h3.5L9 5.5h6L16.5 8H20v11H4z"/><circle cx="12" cy="13.3" r="3.3"/>',card:'<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6"/>',bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6"/>',play:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>',pen:'<path d="M4 20l4-1 10-10-3-3L5 16z"/><path d="M14 7l3 3"/>',
  gem:'<path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9 4l3 16 3-16"/>',tie:'<path d="M12 12c-3-4-8-4-8 0s5 4 8 0zm0 0c3-4 8-4 8 0s-5 4-8 0z"/>',bag:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
  album:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/>',receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',live:'<circle cx="12" cy="12" r="3"/><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4"/>',
  clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',users:'<circle cx="9" cy="9" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 7M17 14a6 6 0 0 1 4 6"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
  star:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.6 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',swap:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>'};
const hi=k=>`<span class="hico"><svg viewBox="0 0 24 24">${HI[k]||""}</svg></span>`;
const secH=(k,t,sub="")=>`<div class="section-h">${hi(k)}${t}${sub?`<span class="muted">${sub}</span>`:""}</div>`;
/* ---------- 團的切換：停在上次看的那一團，只追一團就不顯示 ---------- */
function curGrp(){ const f=followed(), v=(S.get(K.curGrp,{}))[(session()||{}).email||""]; if(v==="all") return "all"; return f.includes(v)?v:(f[0]||"all"); }
function scopeF(){ return followed(); }

/* 首頁的公告、生日提醒：合成一條，自己輪播 */

setInterval(()=>{ document.querySelectorAll(".hl").forEach(h=>{ const it=[...h.querySelectorAll(".hl-i")], d=[...h.querySelectorAll(".hl-dots i")], i=it.findIndex(x=>x.classList.contains("on")); if(i<0) return; const n=(i+1)%it.length; it[i].classList.remove("on"); it[n].classList.add("on"); d.forEach((x,k)=>x.classList.toggle("on",k===n)); }); },5000);


/* ===== 我的動態（仿 Weverse My Feed）：新 TIE → 最新公告 → 重要行程 → 藝人動態 ===== */
/* 新 TIE 推薦：你追蹤的團裡、還沒有 TIE 券的成員（全部都有就不顯示） */
/* 只有藝人「今天真的傳過 TIE」才出現；不推薦你自己 */
function feedDMs(){ const f=followed(), W=getWhispers(), now=Date.now();
  return Object.keys(MEMBERS).filter(id=>!MEMBERS[id].official&&f.includes(MEMBERS[id].group)&&!isActive(id)&&!isSelfGid(MEMBERS[id].group)).map(id=>{ const l=W.filter(w=>w.member===id&&w.from==="artist"&&!w.welcome&&!w.to).pop(); return l&&now-l.ts<864e5?{id,ts:l.ts}:null; }).filter(Boolean).sort((a,b)=>b.ts-a.ts); }
/* 撤下的團體公告：記編號＋MV 編號（同步到每支手機），自動公告不會再補回來，別支手機的舊資料也蓋不回來 */
const GN_GONE="daisuki_gn_gone";
const gnGone=()=>S.get(GN_GONE,{})||{};
const gnIsGone=n=>{ const G=gnGone(); return !!(n&&(G[n.id]||(n.mv&&G["mv:"+n.mv]))); };
const getGNotices=()=>S.get(K.gNotices,[]).filter(n=>groupOf(n.group)&&!gnIsGone(n)).sort((a,b)=>b.ts-a.ts);
function myFeedTop(){
  const dms=feedDMs(), f=followed(), ns=getGNotices().filter(n=>f.includes(n.group)&&!n.mv).slice(0,6); let h="";   /* MV 公開的自動公告不放這裡：下面「公司官方公告」已經有 MV */
  if(dms.length){ const d=dms[(ui.dmIdx||0)%dms.length], m=MEMBERS[d.id], g=groupOf(m.group);
    h+=`<h2 class="mf-h">有新 ${WHISPER_NAME} 喔！</h2><section class="card mf-dm">
      <div class="mf-dm-top"><span class="av mf-av" style="background:${grad(m.g)}">${mAvIn(d.id,"tie")}</span><div class="mf-dm-i"><b>${esc(m.name)} ${I.verified}</b><small>${g&&!g.solo?esc(g.name)+" · ":""}${ago(d.ts)}</small>
      <button class="mf-lock" data-a="tieIntro" data-m="${d.id}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>立即查看是什麼內容吧！</button></div></div>
      ${dms.length>1?`<button class="mf-more" data-a="dmNext">查看其他 ${WHISPER_NAME} <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg></button>`:""}</section>`; }
  if(ns.length) h+=`<h2 class="mf-h">最新公告</h2><div class="hl mf-ann">${ns.map((n,i)=>{const g=groupOf(n.group);return `<button class="hl-i ${i?"":"on"} card mf-an" data-a="gnOpen" data-v="${n.id}"><span class="mf-an-ic" style="background:${grad(g.g)};color:#fff">${esc(ini(g.name))}</span><span class="mf-an-b"><b>${esc(g.name)}</b><small>${esc(n.title)}</small></span><em>${ago(n.ts)}</em></button>`}).join("")}</div>`;
  return h;
}
function openGNotice(id){ const n=getGNotices().find(x=>x.id===id); if(!n) return; const g=groupOf(n.group);
  setLayer(`<div class="tiei gn-page"><header class="tiei-top"><button class="icon-btn" data-a="tCloseLayer" aria-label="返回">${I.back}</button><b>公告</b><span class="sh-sp"></span></header>
    <div class="tiei-body"><div class="gn-g"><span class="av sm g-ico" style="background:${grad(g.g)}">${gIcoIn(g)}</span>${esc(g.name)}</div><h2 class="gn-t">${esc(n.title)}</h2><small class="gn-d">${evWhen(n.ts)}</small><div class="gn-c">${esc(n.body).replace(/\n/g,"<br>")}</div></div></div>`,"gn"); }
/* TIE 介紹頁（仿 Weverse DM 訂閱頁）：勾選同意 → 開始 TIE（接到原本的購買流程） */
function openTieIntro(mid){ if(MEMBERS[mid]&&isSelfGid(MEMBERS[mid].group)){ toast(selfBuyMsg()); return; } const m=MEMBERS[mid], g=groupOf(m.group), mn=tieFree(mid)?0:Math.min(...PLANS.map(p=>p.pts)), c=WHISPER_NAME;
  const F=[["與藝人即時交流","隨時查看最愛藝人發送的豐富日常。",`<div class="tf-chat"><i>${esc(artName(mid,"tie"))}</i><u>你好</u><u>在忙嗎？</u></div>`],
    ["匯聚藝人的每個瞬間","藝人傳來的照片和影片，都會留在聊天室裡。",`<div class="tf-media"><span>▶</span><span>∿</span><span>▶</span></div>`],
    ["隨時傳達我的心意","藝人說完話之後，你也可以回覆她／他。",`<div class="tf-send"><em>按時吃飯！</em><u>💜💜💜</u></div>`],
    ["共度時間越久，字數越多","訂閱天數到了紀念日，能傳的字數就變多。",`<div class="tf-days"><b>1～49 天</b><em>30 字</em><b>50 天</b><em>50 字</em><b>100 天</b><em>100 字</em><b>365 天</b><em>365 字</em></div>`]];
  setLayer(`<div class="tiei" data-m="${mid}"><header class="tiei-top"><span class="sh-sp"></span><span class="sh-sp"></span><button class="icon-btn" data-a="tCloseLayer" aria-label="關閉">${XI}</button></header>
    <div class="tiei-body">
      <div class="tiei-hero"><span class="av tiei-av" style="background:${grad(m.g)}">${mAvIn(mid,"tie")}</span><b>${esc(artName(mid,"tie"))}</b><small>${gTag(g)}${c} 券</small><em>${mn?fmt(mn)+" 點起":"免費"}</em></div>
      <h3>訂閱後即可開始互動</h3>
      <div class="tiei-car" id="tieiCar">${F.map(x=>`<div class="tiei-f"><div class="tiei-mock">${x[2]}</div><b>${x[0]}</b><small>${x[1]}</small></div>`).join("")}</div>
      <div class="tiei-dots">${F.map((_,i)=>`<i class="${i?"":"on"}"></i>`).join("")}</div>
      <details class="tiei-note"><summary>注意事項</summary><ul>
        <li>${c} 券有效期間內，才能收到藝人的訊息、也才能回覆。</li>
        <li>券到期後，之前的對話會先收起來；重新購買後可以繼續聊天。</li>
        <li>藝人不一定每天傳訊息，也不保證會回覆你的每一則訊息。</li>
        <li>請不要截圖、錄影或外流聊天室內容，外流會被停權。</li>
        <li>購買使用的是 App 內的積分，不會另外收費。</li></ul></details>
    </div>
    <footer class="tiei-foot"><label class="tiei-ok"><input type="checkbox" id="tieiChk"><span>已確認並同意所有注意事項</span></label><button class="btn btn-main btn-block" id="tieiGo" data-a="tieIntroGo" data-m="${mid}" disabled>開始 ${c}</button></footer></div>`,"tiei");
  const car=document.getElementById("tieiCar"); if(car) car.addEventListener("scroll",()=>{ const i=Math.round(car.scrollLeft/car.clientWidth); layer.querySelectorAll(".tiei-dots i").forEach((d,k)=>d.classList.toggle("on",k===i)); },{passive:true});
  const ck=document.getElementById("tieiChk"); if(ck) ck.addEventListener("change",()=>{ document.getElementById("tieiGo").disabled=!ck.checked; });
}
function seedGN(){ if(S.get(K.seedGN,false)) return; S.set(K.seedGN,true); const n=Date.now(), H=3600e3, L=[];
  GROUPS.forEach((g,i)=>{ L.push({id:"gn"+g.id+"1",group:g.id,title:`[NOTICE] ${g.name} 1st Mini Album 預購開跑`,body:`大家好，這裡是 ${g.name}。\n\n新專輯預購從今天開始，可以到 SHOP 購買。\n預購期間購買的專輯會附上隨機小卡一張。\n\n謝謝大家一直以來的支持 💜`,ts:n-(3+i*5)*H});
    L.push({id:"gn"+g.id+"2",group:g.id,title:`[公告] ${g.name} 官方應援法公開`,body:`${g.name} 主打歌的官方應援法公開！\n演唱會時記得跟著應援詞一起喊喔。`,ts:n-(30+i*7)*H}); });
  S.set(K.gNotices,L); }
function schedItems(){
  const f=followed(), now=Date.now(), D=864e5, it=[];
  Object.keys(MEMBERS).filter(id=>!MEMBERS[id].official&&f.includes(MEMBERS[id].group)).forEach(id=>{ const d=bdayLeft(id); if(d!=null&&d<=30){ const w=S.get(K.bdayWish,{})[wishKey(id)]||{n:0}; it.push({ts:now+d*D,ic:"🎂",t:d===0?`今天是 ${MEMBERS[id].name} 的生日！`:`${MEMBERS[id].name} 的生日`,s:d===0?"今天":`倒數 ${d} 天・已有 ${fmt(w.n)} 位粉絲送出祝福`,btn:`<button class="mf-wish ${w.mine?"on":""}" data-a="wish" data-m="${id}">${w.mine?"已送出 💜":"送出祝福"}</button>`}); } });
  getConcerts().filter(c=>!c.ended&&c.endTs>now&&f.includes(c.gid)).forEach(c=>it.push({ts:c.startTs,ic:"🎤",t:`${groupOf(c.gid).name}・${c.title}`,s:c.startTs<=now?"演唱會進行中":"演唱會・"+evWhen(c.startTs)}));
  getPlans().filter(p=>f.includes(p.group)&&MEMBERS[p.member]).forEach(p=>it.push({ts:p.ts,ic:"📡",t:`${artName(p.member,"feed")}・${p.title}`,s:"直播預告・"+evWhen(p.ts)}));
  fsAll().filter(e=>f.includes(e.group)&&groupOf(e.group)&&e.id!=="fsshow"&&e.status!=="done").forEach(e=>it.push({ts:e.status==="open"&&e.closeTs?e.closeTs:(e.startTs||now),ic:"✍️",t:e.title,s:e.status==="live"?"簽售進行中":e.status==="open"&&e.closeTs?`簽售報名到 ${fsWhen(e.closeTs)}`:"簽售"}));
  if(ranked(curWeek())&&getMShow().songs.length) SHOWS.filter(x=>!showEnded(x.id)).forEach(x=>it.push({ts:showEndTs(x.id),ic:"⚡",t:`${x.name} 投票結束`,s:showEndTxt(x.id)}));   /* 每個節目的投票結束時間 */
  return it.sort((a,b)=>a.ts-b.ts);
}
function openSched(){ ui.schedOpen=true; const it=schedItems();
  setLayer(`<div class="t-sheet-w" data-a="tCloseLayer"><div class="t-sheet mf-sh" role="dialog" aria-label="重要行程"><div class="grab"></div><h3>不容錯過的重要行程</h3>
    ${it.length?it.map(x=>`<div class="mf-si"><span class="mf-si-ic">${x.ic}</span><span class="mf-si-b"><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span>${x.btn||""}</div>`).join(""):`<p class="me-none">最近沒有排定的行程</p>`}
  </div></div>`,"sched"); }

/* ===== 探索：我的社群 → 新團橫幅 → 全部社群 → 你可能也會喜歡 ===== */
const grpMembers=gid=>Object.keys(MEMBERS).filter(id=>MEMBERS[id].group===gid&&!MEMBERS[id].official);
const grpLastPost=gid=>getPosts().filter(p=>p.group===gid&&!p.hidden).reduce((m,p)=>Math.max(m,p.ts),0);
const grpUnseen=gid=>grpLastPost(gid)>((S.get(K.grpSeen,{}))[gid]||0);
function exploreTop(){
  const fa=followed(), cat=ui.exCat||"all", mine=GROUPS.filter(g=>fa.includes(g.id));
  const ban=GROUPS.filter(g=>gNew(g)&&!fa.includes(g.id)&&grpMembers(g.id).length);
  const all=GROUPS.filter(g=>grpMembers(g.id).length).filter(g=>cat==="all"||(cat==="solo"?grpMembers(g.id).length===1:cat==="group"?grpMembers(g.id).length>1:gNew(g)));
  const shown=ui.exAll?all:all.slice(0,4);
  return `<label class="ex-srch">${I.search||"🔍"}<input id="exQ" placeholder="輸入文字" autocomplete="off"></label>
    ${mine.length?`<h2 class="mf-h">我的社群</h2><div class="ex-my">${mine.map(g=>`<button class="ex-mg" data-a="gOpen" data-v="${g.id}"><i style="background:${grad(g.g)}">${gIcoIn(g)}${grpUnseen(g.id)?"<em></em>":""}</i><small>${esc(g.name)}</small></button>`).join("")}</div>`:""}
    ${ban.length?`<div class="ex-ban" id="exBan">${ban.map(g=>`<button class="ex-b" data-a="gOpen" data-v="${g.id}" style="background:${grad(g.g)}"><b>OPEN! ${esc(g.name)}</b><small>立即前往查看</small><span>${esc(ini(g.name))}</span></button>`).join("")}</div>${ban.length>1?`<div class="tiei-dots ex-dots">${ban.map((_,i)=>`<i class="${i?"":"on"}"></i>`).join("")}</div>`:""}`:""}
    <h2 class="mf-h">全部社群</h2>
    <div class="ex-cat">${[["all","全部"],["group","Group"],["solo","Solo"],["new","New"]].map(([k,l])=>`<button class="${cat===k?"on":""}" data-a="exCat" data-v="${k}">${l}</button>`).join("")}</div>
    <div class="ex-list">${shown.map(g=>{const ms=grpMembers(g.id).map(id=>MEMBERS[id].name), on=fa.includes(g.id);   /* 社群外面一律顯示藝名（個人社群改的名字只在個人社群裡） */return `<div class="ex-g" data-q="${esc(nz(g.name+" "+ms.join(" ")+" "+grpMembers(g.id).map(id=>artName(id,"feed")+" "+artName(id,"tie")).join(" ")))}"><button class="ex-gi" data-a="gOpen" data-v="${g.id}"><i style="background:${grad(g.g)}">${gIcoIn(g)}</i><span><b>${esc(g.name)}${gNew(g)?' <em class="ex-new">NEW</em>':""}</b><small>${esc(ms.slice(0,5).join("・"))}${ms.length>5?` +${ms.length-5}`:""}</small></span></button>${on?`<button class="ex-btn on" data-a="gOpen" data-v="${g.id}">前往</button>`:`<button class="ex-btn" data-a="gJoin" data-v="${g.id}">加入</button>`}</div>`}).join("")}</div>
    ${all.length>4?`<button class="ex-more" data-a="exAll">${ui.exAll?"收起":"查看全部社群 ›"}</button>`:""}`;
}
/* 搜尋：直接在全部社群裡篩選（不重畫，才不會收鍵盤） */
document.addEventListener("input",e=>{ const t=e.target; if(!t.classList||!t.classList.contains("fd-in")) return; const M=S.get(K.fandom,{}); M[t.dataset.g]=t.value.trim(); S.set(K.fandom,M); });
document.addEventListener("focusin",e=>{ const t=e.target; if(t.id!=="win") return; const m=route().m; if(m&&isActive(m)&&!tieAgreed(m)){ t.blur(); openTieAgree(m); } });
document.addEventListener("input",e=>{ if(e.target.id==="cpw") ui.composePw=e.target.value; });
document.addEventListener("input",e=>{ const t=e.target, id=t.id;
  if(id==="cwTxt"){ const b=document.getElementById("cwOk"); if(b) b.disabled=!t.value.trim()&&!(ui.cwImgs||[]).length; }
  else if(id==="meNick"||id==="meIntro"){ const n=document.getElementById(id+"N"); if(n) n.textContent=t.value.length; ui.meDraft={nick:(document.getElementById("meNick")||{}).value,intro:(document.getElementById("meIntro")||{}).value}; }
  else if(id==="cmQ") cmSearchRun(t.dataset.g,t.value); });
document.addEventListener("input",e=>{ if(e.target.id!=="exQ") return; const q=nz(e.target.value.trim());
  if(q&&!ui.exAll){ ui.exAll=true; ui.exQ=q; render(); const i=document.getElementById("exQ"); if(i){ i.value=q; i.focus(); } }
  document.querySelectorAll(".ex-g").forEach(r=>r.hidden=!!q&&!r.dataset.q.includes(q)); });
document.addEventListener("scroll",e=>{ const b=e.target; if(!b||b.id!=="exBan") return; const i=Math.round(b.scrollLeft/b.clientWidth); document.querySelectorAll(".ex-dots i").forEach((d,k)=>d.classList.toggle("on",k===i)); },true);
document.addEventListener("scroll",e=>{ const b=e.target; if(!b||b.id!=="spBan") return; const n=b.children.length, k=Math.round(b.scrollLeft/Math.max(1,b.clientWidth)), c=document.getElementById("spCnt"), th=document.getElementById("spThumb"); if(c) c.textContent=String(k+1).padStart(2,"0"); if(th) th.style.transform=`translateX(${k*100}%)`; },true);
function openGroup(gid){ if(groupOf(gid)){ layer.innerHTML=""; ui.cmFeed=ui.cmMed=ui.cmVc=ui.mpTab=ui.abOpen=null; ui.shopCat="all"; navTo(grpHash(gid)); window.scrollTo(0,0); return; } }

