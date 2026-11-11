/* HAECHU｜音樂、聲音、貼圖、TIE 外殼、限動編輯 */
/* =========================================================
   SNS 貼文／限時動態配音樂（照 IG）
   ・發文時「加入音樂」：從檔案選一首歌，挑 30 秒的片段
   ・只存那 30 秒（MP3 約 0.25MB；轉不了 MP3 就存小 WAV），放 R2
   ・動態：帳號下面顯示「♪ 歌名」，右下角喇叭開關；開著聲音時滑到哪則就放哪則
   ・限時動態：打開就放，換下一則、關掉就停
   ========================================================= */
const SN_MUS_LEN=30;
let snMusA=null, snMusCur="", snMusIO=null;
const snMusEl=()=>{ if(!snMusA){ snMusA=new Audio(); snMusA.loop=true; snMusA.playsInline=true; } return snMusA; };
/* iPhone：音樂要先在手指點下去的當下「解鎖」一次，之後滑到哪一則、打開限動才能自動放（不然下載完歌已經不算手指點的，會被擋掉、沒聲音） */
let snMusOk0=false; function snMusUnlock(){ if(snMusOk0) return; try{ const a=snMusEl(); if(!a.src){ const sr=8000, n=800, b=new ArrayBuffer(44+n*2), v=new DataView(b), w=(o,t)=>{ for(let k=0;k<t.length;k++) v.setUint8(o+k,t.charCodeAt(k)); }; w(0,"RIFF"); v.setUint32(4,36+n*2,true); w(8,"WAVEfmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true); v.setUint32(24,sr,true); v.setUint32(28,sr*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true); w(36,"data"); v.setUint32(40,n*2,true); a.src=URL.createObjectURL(new Blob([b],{type:"audio/wav"})); a.dataset.mid=""; } a.muted=true; const p=a.play(); const done=()=>{ try{ a.pause(); }catch(e){} a.muted=false; snMusOk0=true; }; if(p&&p.then) p.then(done,()=>{ a.muted=false; }); else done(); }catch(e){} }
["touchend","click"].forEach(ev=>document.addEventListener(ev,()=>{ if(!snMusOk0&&route().sub==="sns") snMusUnlock(); },{capture:true,passive:true}));
if(ui.snMusOn===undefined) ui.snMusOn=true;   /* 跟 Instagram 一樣，有音樂的貼文滑到就放；按右下角喇叭關掉 */
async function snMusPlay(mid,key){ try{ const u=await mediaSrc(mid); if(!u) return; const a=snMusEl(); snMusCur=key||mid; if(a.dataset.mid!==mid){ a.src=u; a.dataset.mid=mid; } a.currentTime=0; await a.play(); }catch(e){} snMusPaint(); }
function snMusStop(){ try{ if(snMusA){ snMusA.pause(); } }catch(e){} snMusCur=""; snMusPaint(); }
function snMusPaint(){ document.querySelectorAll(".sn-mbtn").forEach(b=>b.classList.toggle("on",!!ui.snMusOn&&b.dataset.k===snMusCur)); }
/* 動態：滑到哪一則（露出六成以上）就放那一則 */
function snMusWatch(){ try{ if(snMusIO) snMusIO.disconnect(); const L=document.querySelectorAll(".sn-post[data-mus]"); if(!L.length){ if(snMusCur&&!snMusCur.startsWith("st:")) snMusStop(); return; }
  snMusIO=new IntersectionObserver(es=>{ es.forEach(e=>{ const el=e.target, k="p:"+el.dataset.pid; if(e.isIntersecting&&e.intersectionRatio>=.6){ if(ui.snMusOn&&snMusCur!==k) snMusPlay(el.dataset.mus,k); } else if(snMusCur===k) snMusStop(); }); },{threshold:[0,.6]});
  L.forEach(el=>snMusIO.observe(el)); snMusPaint(); }catch(e){} }
addEventListener("hashchange",()=>{ if(snMusCur) snMusStop(); });
document.addEventListener("visibilitychange",()=>{ if(document.hidden&&snMusCur) snMusStop(); });
/* 音樂那一行：跟 IG 一樣「♫ 歌手・歌名」，點了從下面拉出音樂資訊 */
const SN_MUSK={};
const snMusArt=m=>{ if(!m) return ""; if(m.src==="orig"){ const u=m.uid&&snUser(m.uid); return (u&&u.u)||m.artist||""; } return m.artist||""; };
const snMusLabel=m=>{ const a=snMusArt(m); return a?`${a}・${m.title||"音樂"}`:(m.title||"音樂"); };
const snMusTag=(m,k,who)=>{ if(!(m&&m.mid)) return ""; if(k) SN_MUSK[k]={m,who}; return `<span class="sn-mus-t"${k?` data-a="snMusInfo" data-k="${esc(k)}" role="button"`:""}>${si("note","sm")}<span>${esc(snMusLabel(m))}</span></span>`; };
function snMusInfo(k){ const o=SN_MUSK[k]; if(!o) return; const m=o.m, ou=m.src==="orig"&&m.uid?snUser(m.uid):null, art=snMusArt(m);
  const cov=m.src==="app"&&m.gid?songCover(m.gid,m.title):ou?snAv(ou,44):`<i class="snmi-ph">${si("music")}</i>`;
  if(ui.snStory) clearTimeout(ui.snStT);   /* 看限動時打開：先停住，不要自己跳下一則 */
  let w=document.getElementById("snMI"); if(!w){ w=document.createElement("div"); w.id="snMI"; document.body.appendChild(w); }
  w.innerHTML=`<div class="snmi-w" data-a="snMiX"><div class="snmi" data-a="snMiNo" role="dialog" aria-label="音樂"><i class="snmi-gr"></i>
    <button class="snmi-r" data-a="snMiGo" data-k="${esc(k)}"><span class="snmi-c">${cov}</span><span class="snmi-t"><b>${esc(m.title||"音樂")}${art?` • ${esc(art)}`:""}</b><small>音訊</small></span></button>
    <button class="snmi-r snmi-red dk-keep" data-a="snMiRep" data-k="${esc(k)}"><span class="snmi-ic">${si("flag")}</span><b>檢舉</b></button></div></div>`;
  requestAnimationFrame(()=>w.firstElementChild&&w.firstElementChild.classList.add("open")); }
function snMiClose(resume){ const w=document.getElementById("snMI"); if(w) w.innerHTML=""; const st=ui.snStory; if(resume&&st){ clearTimeout(ui.snStT); ui.snStT=setTimeout(()=>{ if(ui.snStory===st){ st.si++; snShowStory(); } },3000); } }

/* ===== 發文：選歌、挑片段 ===== */
let snMusBuf=null;
function snMusPick(){ const inp=document.createElement("input"); inp.type="file"; inp.accept="audio/*,video/*,.mp3,.m4a,.wav,.aac,.mov,.mp4";   /* iPhone 很少有音樂檔：也可以選影片，取出裡面的聲音 */
  inp.onchange=async()=>{ const f=inp.files&&inp.files[0]; if(!f) return; toast("讀取中…"); snMusUnlock();
    try{ const AC=window.AudioContext||window.webkitAudioContext, c=new AC(), isV=/^video\//.test(f.type)||/\.(mov|mp4|m4v|webm)$/i.test(f.name||""); let buf;
      try{ buf=await decodeAu(c,await f.arrayBuffer()); }catch(err){ if(!isV) throw err; const am=await MB.audio(f); if(!am) throw err; buf=await decodeAu(c,await am.blob.arrayBuffer()); } try{ c.close(); }catch(e){}
      if(!buf||!buf.duration) throw new Error("no audio");
      snMusBuf=buf; { const me=snMeId(), mu=snUser(me)||{}; ui.snMusT={title:"原始音訊",artist:mu.u||"",uid:me,src:"orig",start:0,dur:buf.duration}; } snMusSheet(); }catch(e){ toast("讀不出聲音，換一個檔案試試"); } };
  pickClick(inp); }
function snMusSongs(){ const m=getMShow(), seen=new Set(); return [...(m.songs||[]),...(m.ended||[])].reverse().filter(x=>x&&!x.demo&&groupOf(x.gid)&&!seen.has(x.id)&&seen.add(x.id)); }
function snMusList(){ { const ste=document.getElementById("steRoot"); if(ste){ STE_NODE=ste; ste.remove(); } } const L=snMusSongs();
  tieModal("加入音樂",`<button class="snm-up" data-a="snMusUp" type="button"><i>${si("plus")}</i><span><b>上傳音訊或影片</b><small>會顯示成「你的名稱・原始音訊」</small></span></button>
    <span class="fs-f-lab">App 裡的歌</span><div class="snm-list">${L.length?L.map(x=>{ const g=groupOf(x.gid); return `<button class="snm-song" data-a="snMusSong" data-id="${esc(x.id)}" type="button"><span class="snm-cv">${songCover(x.gid,x.title)}</span><span><b>${esc(x.title)}</b><small>${esc(g.name)}</small></span></button>`; }).join(""):`<p class="snm-empty">還沒有歌</p>`}</div>`,
    `<button class="t-mbtn" data-a="snMusX">取消</button>`); }
async function snMusSong(sid){ const x=songOf(sid), g=x&&groupOf(x.gid); if(!x||!g) return; toast("下載中"); snMusUnlock();
  /* 一個一個試：歌的音檔 → MV 轉好的音檔 → MV 影片本身 → 從 MV 取出聲音；壞掉的音檔不會卡住後面 */
  const AC=window.AudioContext||window.webkitAudioContext, c=new AC(), v=songMv(x); let buf=null, gotAny=false, badAu=false;
  const ok=b=>b&&b.size>2048&&!/^(text|application\/json)/.test(b.type||"");
  const tryB=async(b,isV)=>{ if(!ok(b)) return null; gotAny=true; try{ const r=await decodeAu(c,await b.arrayBuffer()); if(r&&r.duration) return r; }catch(e){}
    if(isV||/^video\//.test(b.type||"")){ try{ const am=await MB.audio(b); if(am&&am.blob.size){ const r=await decodeAu(c,await am.blob.arrayBuffer()); if(r&&r.duration) return r; } }catch(e){} } return null; };
  try{
    if(x.au){ buf=await tryB(await MDB.get(x.au)); if(!buf&&gotAny) badAu=true; }
    if(!buf){ const b=await auGet(x.id).catch(()=>null); buf=await tryB(b); }
    if(!buf&&v&&v.au) buf=await tryB(await MDB.get(v.au));
    if(!buf&&v&&v.mid){ const mv=await MDB.get(v.mid); buf=await tryB(mv,true); if(buf&&(badAu||!x.au)){ mvAudioUpload(mv).then(id=>{ if(id) songAuSet(x.id,id); }).catch(()=>{}); } }   /* 音檔壞了或沒有：順便重轉一份給大家用 */
  }catch(e){} try{ c.close(); }catch(e){}
  if(!buf){ toast(gotAny?"這首歌的音訊讀不出來":v?"MV 影片還沒傳到雲端，請上傳的人打開 App 一次":"這首歌還沒有 MV 或音訊"); return; }
  snMusBuf=buf; ui.snMusT={title:x.title,artist:g.name,gid:x.gid,sid:x.id,src:"app",start:0,dur:buf.duration}; snMusSheet(); }
/* 挑片段：像 IG 一樣，中間一個固定的 30 秒框，用手指左右拖整條聲波（手機好用，不用對準小小的滑桿） */
const SMP={bw:5,win:0,pps:0,peaks:null,drag:null};
function snMusPeaks(buf,n){ const d=buf.getChannelData(0), step=Math.max(1,Math.floor(d.length/n)), out=[]; let mx=0;
  for(let i=0;i<n;i++){ let m=0; const a=i*step, e=Math.min(d.length,a+step), st=Math.max(1,Math.floor(step/60)); for(let j=a;j<e;j+=st){ const v=Math.abs(d[j]); if(v>m) m=v; } out.push(m); if(m>mx) mx=m; }
  return out.map(v=>Math.max(.12,Math.pow(v/(mx||1),.8))); }
function snMusSheet(){ const t=ui.snMusT; if(!t) return; { const ste=document.getElementById("steRoot"); if(ste){ STE_NODE=ste; ste.remove(); } }   /* 在限動編輯裡加音樂：先把編輯畫面收起來，選完再放回去 */
  const cov=t.src==="app"&&t.gid?songCover(t.gid,t.title):`<i class="smp-ci">${si("music")}</i>`;
  tieModal("加入音樂",`<div class="smp-hd"><span class="smp-cv">${cov}</span><span class="smp-ht">${t.src?`<b>${esc(t.title||"音樂")}</b><small>${esc(snMusArt(t)||"")}</small>`:`<input id="snMusTi" class="a-nick-in" maxlength="40" placeholder="歌名" value="${esc(t.title)}"><small>原始音訊</small>`}</span>
      <button class="smp-pl" data-a="snMusPv" type="button" aria-label="試聽">${si("play")}</button></div>
    <div class="smp-time"><b id="snMusLb">${fmtDur(t.start)}</b><span id="snMusLb2">– ${fmtDur(Math.min(t.dur,t.start+SN_MUS_LEN))}</span></div>
    <div class="smp" id="smp"><div class="smp-strip" id="smpS"></div><i class="smp-sh l"></i><i class="smp-sh r"></i><div class="smp-win" id="smpW"><em id="smpPg"></em></div></div>
    <p class="smp-tip">${t.dur>SN_MUS_LEN+1?"左右拖曳聲波，選要用的 30 秒":"這首不到 30 秒，會用整首"}</p>`,`<button class="t-mbtn main" data-a="snMusOk">完成</button><button class="t-mbtn" data-a="snMusX">取消</button>`);
  requestAnimationFrame(snMusLay); }
function snMusLay(){ const box=document.getElementById("smp"), strip=document.getElementById("smpS"), t=ui.snMusT; if(!box||!strip||!t||!snMusBuf) return;
  const CW=box.clientWidth, W=Math.round(Math.min(CW*.62,240)), bw=SMP.bw; SMP.win=W; SMP.pps=W/SN_MUS_LEN; const n=Math.max(8,Math.ceil(t.dur*SMP.pps/bw));
  if(!SMP.peaks||SMP.peaks.n!==n||SMP.peaks.buf!==snMusBuf){ SMP.peaks={n,buf:snMusBuf,v:snMusPeaks(snMusBuf,n)}; }
  strip.innerHTML=SMP.peaks.v.map(v=>`<i style="height:${Math.round(v*100)}%"></i>`).join(""); strip.style.width=n*bw+"px";
  const w=document.getElementById("smpW"); w.style.width=Math.min(W,n*bw)+"px"; snMusPos(); }
function snMusMax(){ const t=ui.snMusT; return Math.max(0,t.dur-SN_MUS_LEN); }
function snMusPos(){ const t=ui.snMusT, box=document.getElementById("smp"), strip=document.getElementById("smpS"); if(!t||!box||!strip) return;
  const left=(box.clientWidth-Math.min(SMP.win,parseFloat(strip.style.width)||SMP.win))/2; strip.style.transform=`translate3d(${left-t.start*SMP.pps}px,0,0)`;
  const a=document.getElementById("snMusLb"), b=document.getElementById("snMusLb2"); if(a) a.textContent=fmtDur(t.start); if(b) b.textContent="– "+fmtDur(Math.min(t.dur,t.start+SN_MUS_LEN)); }
document.addEventListener("pointerdown",e=>{ const box=e.target.closest&&e.target.closest("#smp"); if(!box||!ui.snMusT) return; e.preventDefault(); try{ box.setPointerCapture(e.pointerId); }catch(x){} SMP.drag={x:e.clientX,s:ui.snMusT.start,id:e.pointerId,moved:0}; box.classList.add("drag"); if(snMusPvSrc) snMusPvStop(); });
document.addEventListener("pointermove",e=>{ const d=SMP.drag; if(!d||e.pointerId!==d.id||!ui.snMusT) return; const dx=e.clientX-d.x; if(Math.abs(dx)>3) d.moved=1; ui.snMusT.start=Math.max(0,Math.min(snMusMax(),d.s-dx/SMP.pps)); snMusPos(); });
const snMusUp=e=>{ const d=SMP.drag; if(!d||e.pointerId!==d.id) return; SMP.drag=null; const box=document.getElementById("smp"); if(box) box.classList.remove("drag"); if(!ui.snMusT) return; ui.snMusT.start=Math.round(ui.snMusT.start); snMusPos(); if(d.moved) snMusPv(); };   /* 放開就從新的位置試聽 */
document.addEventListener("pointerup",snMusUp); document.addEventListener("pointercancel",snMusUp);
window.addEventListener("resize",()=>{ if(document.getElementById("smp")) snMusLay(); });
let snMusPvSrc=null, snMusPvCtx=null, snMusPvT=0;
function snMusPvStop(){ try{ if(snMusPvSrc) snMusPvSrc.stop(); }catch(e){} snMusPvSrc=null; cancelAnimationFrame(snMusPvT); const b=document.querySelector(".smp-pl"); if(b){ b.innerHTML=si("play"); b.classList.remove("on"); } const pg=document.getElementById("smpPg"); if(pg) pg.style.width="0"; }
function snMusPv(){ if(snMusPvSrc){ snMusPvStop(); return; } try{ const AC=window.AudioContext||window.webkitAudioContext; snMusPvCtx=snMusPvCtx||new AC(); snMusPvCtx.resume&&snMusPvCtx.resume();
  const s=snMusPvCtx.createBufferSource(), len=Math.min(SN_MUS_LEN,ui.snMusT.dur-ui.snMusT.start); s.buffer=snMusBuf; s.connect(snMusPvCtx.destination); s.start(0,ui.snMusT.start,len); s.onended=()=>{ if(snMusPvSrc===s) snMusPvStop(); }; snMusPvSrc=s;
  const b=document.querySelector(".smp-pl"); if(b){ b.innerHTML=si("stop"); b.classList.add("on"); }
  const t0=snMusPvCtx.currentTime, tick=()=>{ if(snMusPvSrc!==s) return; const pg=document.getElementById("smpPg"); if(pg) pg.style.width=Math.min(100,(snMusPvCtx.currentTime-t0)/len*100)+"%"; snMusPvT=requestAnimationFrame(tick); }; tick(); }catch(e){} }
/* 剪出 30 秒、轉成單聲道 22kHz；能轉 MP3 就轉（小很多） */
async function snMusCut(buf,start){ const sr=22050, len=Math.min(SN_MUS_LEN,buf.duration-start), OC=window.OfflineAudioContext||window.webkitOfflineAudioContext, oc=new OC(1,Math.ceil(len*sr),sr), s=oc.createBufferSource(); s.buffer=buf;
  const g=oc.createGain(); s.connect(g); g.connect(oc.destination); g.gain.setValueAtTime(0,0); g.gain.linearRampToValueAtTime(1,.4); g.gain.setValueAtTime(1,Math.max(.5,len-1)); g.gain.linearRampToValueAtTime(0,len);   /* 頭尾淡入淡出 */
  s.start(0,start,len); const out=await new Promise((res,rej)=>{ oc.oncomplete=e=>res(e.renderedBuffer); const p=oc.startRendering(); if(p&&p.then) p.then(res,rej); }); const d=out.getChannelData(0);
  try{ const L=await snLame(); if(L){ const enc=new L.Mp3Encoder(1,sr,64), pcm=new Int16Array(d.length); for(let i=0;i<d.length;i++) pcm[i]=Math.max(-32768,Math.min(32767,d[i]*32767)); const parts=[]; for(let i=0;i<pcm.length;i+=1152){ const m=enc.encodeBuffer(pcm.subarray(i,i+1152)); if(m.length) parts.push(new Uint8Array(m)); } const e=enc.flush(); if(e.length) parts.push(new Uint8Array(e)); return {blob:new Blob(parts,{type:"audio/mpeg"}),dur:len}; } }catch(e){}
  return {blob:await compactWav(out),dur:len}; }
function snLame(){ if(window.lamejs) return Promise.resolve(window.lamejs); if(snLame.p) return snLame.p;
  const load=src=>new Promise(res=>{ const s=document.createElement("script"); s.src=src; s.onload=()=>res(window.lamejs||null); s.onerror=()=>res(null); document.head.appendChild(s); setTimeout(()=>res(window.lamejs||null),8000); });
  snLame.p=(async()=>{ const L=await load("https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js")||await load("https://unpkg.com/lamejs@1.2.1/lame.min.js"); if(!L) snLame.p=null; return L; })(); return snLame.p; }
async function snMusOk(){ const dr=ui.snDraft, t=ui.snMusT; if(!dr||!t||!snMusBuf) return; { const ti=document.getElementById("snMusTi"); if(ti&&!t.src) t.title=(ti.value||"").trim()||t.title; } snMusPvStop(); layer.innerHTML=""; steBack(); toast("音樂處理中…");
  try{ const {blob,dur}=await snMusCut(snMusBuf,t.start), id="snm"+Date.now().toString(36); await MDB.put(id,blob,true); if(!await hbUpload(id,blob)){ toast("音樂沒有上傳成功，請再試一次"); return; }
    dr.mus={mid:id,title:t.title,dur:Math.round(dur)}; ["src","artist","uid","gid","sid"].forEach(k=>{ if(t[k]) dr.mus[k]=t[k]; }); snMusBuf=null; ui.snMusT=null; render(); try{ steMusTag(); }catch(e){} toast("已加入音樂"); }catch(e){ toast("音樂處理失敗，請換一首試試"); } }

/* =========================================================
   聲音總管：App 裡所有影片、音樂、語音的共同規則
   ・離開 App（切到別的 App、回主畫面、鎖螢幕）→ 全部停
   ・畫面上那個播放器被關掉（例如影片視窗按 ×、換頁）→ 它就停，不會在背景繼續放
   以後新做的播放器也自動照這個規則，不用每個地方各寫一次
   ========================================================= */
const AUD_ALL=new Set();
{ const P=HTMLMediaElement.prototype, play0=P.play, pause0=P.pause;
  P.play=function(){ AUD_ALL.add(this); this._want=true; audGuard(this); return play0.apply(this,arguments); };   /* 記住每一個放過聲音的播放器（包括沒有放在畫面上的） */
  P.pause=function(){ this._want=false; return pause0.apply(this,arguments); }; }
/* 有人傳 TIE、跳推播的時候，iPhone 會把 App 的聲音「中斷再恢復」，順手把已經停掉的影片／音樂又放出來。
   App 自己停掉的播放器（_want＝false）如果被系統偷偷又放起來，馬上再停掉 */
let audTapT=0; ["pointerdown","touchend","click","keydown"].forEach(ev=>addEventListener(ev,()=>{ audTapT=Date.now(); },{capture:true,passive:true}));
function audGuard(m){ if(m._g) return; m._g=1; m.addEventListener("play",()=>{ if(Date.now()-audTapT<1500&&!document.hidden){ m._want=true; return; }   /* 自己按播放鍵：照放 */
  if(m._want===false||document.hidden){ try{ HTMLMediaElement.prototype.pause.call(m); }catch(e){} } }); }
document.addEventListener("play",e=>{ const m=e.target; if(m&&m.tagName&&/^(VIDEO|AUDIO)$/.test(m.tagName)) audGuard(m); },true);
function audStopAll(){ AUD_ALL.forEach(m=>{ try{ m.pause(); }catch(e){} }); document.querySelectorAll("video,audio").forEach(m=>{ try{ m.pause(); }catch(e){} }); try{ if(navigator.mediaSession) navigator.mediaSession.playbackState="none"; }catch(e){} }
document.addEventListener("visibilitychange",()=>{ if(document.hidden) audStopAll(); });
addEventListener("pagehide",audStopAll);
/* 播放器被拿掉（關視窗、換頁）：馬上停，釋放檔案 */
new MutationObserver(ms=>{ for(const m of ms) for(const n of m.removedNodes){ if(n.nodeType!==1) continue;
  const L=n.matches&&n.matches("video,audio")?[n]:n.querySelectorAll?[...n.querySelectorAll("video,audio")]:[];
  L.forEach(v=>{ if(v.isConnected) return; try{ v.pause(); }catch(e){} AUD_ALL.delete(v); }); } }).observe(document.documentElement,{childList:true,subtree:true});
/* 沒有放在畫面上的播放器（背景音樂那種）如果已經停了很久就不用再記 */
setInterval(()=>{ AUD_ALL.forEach(m=>{ if(m.paused&&!m.isConnected) AUD_ALL.delete(m); }); },60e3);

/* =========================================================
   所有留言框、聊天框：可以換行（手機的換行鍵＝換行，不會直接送出；送出要按旁邊的送出鍵）
   ・打越多字框越高，最多長到 8 行；再多就在框裡面上下捲
   ・送出、清空之後自動縮回一行
   ========================================================= */
const AG_LINES=8;
function agFit(el){ if(!el||!el.classList||!el.classList.contains("ag")) return; const cs=getComputedStyle(el), lh=parseFloat(cs.lineHeight)||20, pad=(parseFloat(cs.paddingTop)||0)+(parseFloat(cs.paddingBottom)||0), max=lh*AG_LINES+pad;
  const h0=el.style.height; el.style.height="auto"; const h=Math.min(el.scrollHeight,max); el.style.height=Math.ceil(h)+"px"; el.classList.toggle("scroll",el.scrollHeight>max+1);
  if(h0!==el.style.height){ const ms=el.id==="win"&&el.value&&!tieFxOn()&&document.querySelector(".t-msgs.kbbox"),   /* 送出清空時不要拉：讓聊天照原本的方式跳到剛送出的那則 */ fe=ms?ms.scrollHeight-ms.scrollTop-ms.clientHeight:null;
    try{ dispatchEvent(new Event("scroll")); }catch(e){}
    if(ms) [0,1,2].forEach(i=>setTimeout(()=>requestAnimationFrame(()=>{ if(!ms.isConnected) return; ms.scrollTop=ms.scrollHeight-ms.clientHeight-fe; }),i*60)); } }   /* TIE：框變高變矮時，聊天停在原本看的地方（貼著最新一則就繼續貼著），不跳 */   /* 框變高：讓 TIE／直播的「輸入列貼鍵盤」重新量一次 */
const agFitAll=()=>document.querySelectorAll("textarea.ag").forEach(agFit);
document.addEventListener("input",e=>{ if(e.target&&e.target.classList&&e.target.classList.contains("ag")) agFit(e.target); });
/* 送出後（程式把字清掉）、換頁重畫後：重新量 */
document.addEventListener("submit",()=>{ setTimeout(agFitAll,30); setTimeout(agFitAll,300); },true);
new MutationObserver(ms=>{ if(ms.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches&&n.matches("textarea.ag")||n.querySelector&&n.querySelector("textarea.ag"))))) requestAnimationFrame(agFitAll); }).observe(document.documentElement,{childList:true,subtree:true});
{ const d=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value"); Object.defineProperty(HTMLTextAreaElement.prototype,"value",{configurable:true,get(){ return d.get.call(this); },set(v){ d.set.call(this,v); if(this.classList.contains("ag")) requestAnimationFrame(()=>agFit(this)); }}); }   /* 程式直接改字（清空、插入 @@@）也會跟著縮放 */

/* =========================================================
   吉祥物貼圖（TIE 用）：貓咪、小狗、狐狸、蜥蜴，每隻 8 張
   ・全部是 App 自己畫的向量圖（跟吉祥物主題同一套畫法），不佔雲端空間
   ・送出去的訊息其實是一小段代號「[stk:cat_love]」，看的人手機自己畫出來
   ========================================================= */
const STK_SP=["cat","dog","fox","liz"], STK_SPN={cat:"貓咪",dog:"小狗",fox:"狐狸",liz:"蜥蜴"};
const STK_K=["hi","love","wink","wow","cry","sleep","cheer","thanks"];
const STK_RE=/^\[stk:(cat|dog|fox|liz)_([a-z]+)\]$/;
const stkOf=t=>{ const m=STK_RE.exec(String(t||"").trim()); return m&&STK_K.includes(m[2])?{sp:m[1],k:m[2]}:null; };
const stkTok=(sp,k)=>`[stk:${sp}_${k}]`;
const STK_URL={};
function stkUrl(sp,k){ const key=sp+"_"+k; if(STK_URL[key]) return STK_URL[key]; const c=MSC[sp], P="#FF6F91", Y="#FFC94D", B="#7CC4FF";
  const head=(ex,dy)=>dy!=null?`<g transform="translate(0 ${dy})">${msHead(sp,ex)}</g>`:`<g transform="translate(120 130) scale(1.3) translate(-120 -100)">${msHead(sp,ex)}</g>`;   /* 只有頭的貼圖：放大填滿 */
  const sp4=(pts,col)=>pts.map(([x,y,r])=>ART.spark(x,y,r,col)).join("");
  const hearts=pts=>pts.map(([x,y,s,col])=>ART.heart(x,y,s,col||P,2.6,MS_LN)).join("");
  const note=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0v-22l14-4v22" fill="none" ${LW(3)}/><ellipse cx="-4" cy="1" rx="6" ry="4.6" fill="${MS_LN}"/><ellipse cx="10" cy="-3" rx="6" ry="4.6" fill="${MS_LN}"/></g>`;
  const A={
    hi:msBody(sp,"smile")+sp4([[34,60,9],[214,40,7]],Y),
    love:head("love")+hearts([[40,40,.9],[196,30,1.1],[208,98,.7,"#FF9AB8"]]),
    wink:head("wink")+sp4([[200,40,14],[222,80,8],[36,52,9]],Y),
    wow:head("wow")+`<g ${LW(3)} fill="${P}"><path d="M196 16 l10 2 -8 42 -8 -2z"/><circle cx="196" cy="70" r="5"/><path d="M216 26 l9 3 -11 34 -7 -3z"/><circle cx="210" cy="72" r="4.4"/></g>`,
    cry:head("sleep")+`<path d="M86 156 q-6 26 -2 48 q6 8 12 0 q2 -24 -4 -48z M154 156 q6 26 2 48 q-6 8 -12 0 q-2 -24 4 -48z" fill="${B}" opacity=".85" ${LW(2.4)}/><path d="M40 70 q-8 14 0 18 q8 -4 0 -18z M206 64 q-8 14 0 18 q8 -4 0 -18z" fill="${B}" ${LW(2.2)}/>`,
    sleep:head("sleep")+`<g fill="#8E7CF8" font-family="Georgia,serif" font-weight="800"><text x="176" y="52" font-size="40">Z</text><text x="206" y="26" font-size="26">z</text><text x="224" y="10" font-size="18">z</text></g>`,
    cheer:msBody(sp,"love")+note(30,70,1.1)+note(206,30,.9)+sp4([[30,120,7]],Y),
    thanks:head("smile",14)+`<g transform="translate(0 6)">${ART.heart(120,184,2.4,P,3.2,MS_LN)}<path d="M100 196 q8 -10 16 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/></g>`+sp4([[36,60,8],[206,56,9]],Y)
  };
  return STK_URL[key]=svgUrl(240,260,A[k]||A.hi); }
const stkImg=(t,cls="stk-img")=>{ const s=stkOf(t); return s?`<img class="${cls}" src="${stkUrl(s.sp,s.k)}" alt="貼圖" draggable="false">`:""; };
/* 訊息泡泡裡如果是貼圖代號：換成貼圖（不管是哪一種畫面畫出來的） */
function stkPaint(root){ (root||document).querySelectorAll(".t-b,.tq-bb,.t-rp p").forEach(el=>{ if(el.dataset.stk) return; const tn=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join("").trim(), s=stkOf(tn); if(!s) return; el.dataset.stk="1";
    if(el.closest(".t-rp")){ el.textContent="貼圖"; return; }
    el.innerHTML=stkImg(tn); el.classList.add("t-stk"); }); }
new MutationObserver(ms=>{ if(ms.some(m=>m.addedNodes.length)) requestAnimationFrame(()=>stkPaint()); }).observe(document.documentElement,{childList:true,subtree:true});
/* 貼圖面板（取代原本的表情列） */
function stkPanel(){ const tab=STK_SP.includes(ui.stkTab)?ui.stkTab:"cat";
  return `<div class="stk-pan"><div class="stk-tabs">${STK_SP.map(sp=>`<button class="${sp===tab?"on":""}" data-a="stkTab" data-v="${sp}" aria-label="${STK_SPN[sp]}"><img src="${stkUrl(sp,"hi")}" alt=""></button>`).join("")}</div>
    <div class="stk-grid">${STK_K.map(k=>`<button data-a="stkSend" data-v="${stkTok(tab,k)}" aria-label="貼圖"><img src="${stkUrl(tab,k)}" alt=""></button>`).join("")}</div></div>`; }
/* 貼圖區：跟 LINE 一樣，出現在原本鍵盤的位置（輸入列下面），不是另外跳一個框 */
const stkDockOn=()=>document.documentElement.classList.contains("stko");
function stkDock(on){ let d=document.getElementById("stkDock"); clearTimeout(stkDock.t);
  if(!on){ if(d) d.remove(); stkDock.el=null; document.documentElement.classList.remove("stko"); document.documentElement.style.removeProperty("--stkh"); try{ tieFootPad(); }catch(e){} return; }
  /* 鍵盤還開著：先收鍵盤，等它完全收好（LINE 也是這樣）再出現，才不會疊在一起、聊天也不會亂跳 */
  const vv=window.visualViewport, kbUp=()=>vv&&vv.height<(screen.height||innerHeight)*0.8, a=document.activeElement; if(a&&a.id==="win") a.blur();
  const t0=Date.now(), wait=()=>{ if(kbUp()&&Date.now()-t0<900){ stkDock.t=setTimeout(wait,60); return; } stkDock.t=setTimeout(show,Date.now()-t0>80?320:0); }; wait();
  function show(){ if(tieFxOn()){ const app=document.querySelector(".app"); if(!d){ d=document.createElement("div"); d.id="stkDock"; d.setAttribute("role","region"); d.setAttribute("aria-label","貼圖"); } stkDock.el=d; if(app&&d.parentNode!==app) app.appendChild(d); d.innerHTML=stkPanel(); document.documentElement.classList.add("stko"); return; }   /* 固定外殼：貼圖區就是框裡最下面一塊，訊息區自己會讓開 */
    const se=document.scrollingElement||document.documentElement, fe=Math.max(0,se.scrollHeight-(scrollY+innerHeight));
    if(!d){ d=document.createElement("div"); d.id="stkDock"; d.setAttribute("role","region"); d.setAttribute("aria-label","貼圖"); document.body.appendChild(d); }
    d.innerHTML=stkPanel(); document.documentElement.classList.add("stko");
    requestAnimationFrame(()=>{ const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1; document.documentElement.style.setProperty("--stkh",(d.getBoundingClientRect().height/z)+"px");
      try{ tieFootPad(); }catch(e){} requestAnimationFrame(()=>{ const se2=document.scrollingElement||document.documentElement; window.scrollTo(0,se2.scrollHeight-innerHeight-(fe<60?0:fe)); }); }); } }
document.addEventListener("focusin",e=>{ if(e.target&&e.target.id==="win"&&stkDockOn()) stkDock(false); });
/* 點聊天區空白的地方：貼圖區收起來（跟 LINE 一樣）；點到訊息上的按鈕、照片就照原本的動作 */
document.addEventListener("click",e=>{ if(!stkDockOn()) return; const t=e.target; if(!t||!t.closest||t.closest("#stkDock")||t.closest("[data-a]")||t.closest("a,button,input,textarea,img,video")) return; if(t.closest(".t-msgs")) stkDock(false); });
addEventListener("hashchange",()=>{ if(stkDockOn()) stkDock(false); });

/* =========================================================
   TIE 聊天室：固定外殼（辦法 A，11/3 定）
   ・標題、訊息區、輸入列三塊固定在一個框裡，只有訊息區自己捲（不再整頁捲）
   ・框的高度＝iPhone 實際看得到的高度（visualViewport），鍵盤打開就自動變矮
   ・訊息區「倒過來排」（column-reverse）：瀏覽器自己讓最新一則貼在輸入列上面，
     鍵盤開關、輸入框長高、貼圖區打開都不用再推位置
   ・舊的一套還在：localStorage「tie_old」設成 1 就切回去（出問題時用）
   ========================================================= */
const TIE2=()=>{ try{ return localStorage.getItem("tie_old")!=="1"; }catch(e){ return true; } };
const tieFxOn=()=>document.documentElement.classList.contains("tie2l");
const T2={fe:0,key:""};
/* 訊息區裡面包一層（倒過來排要有一層，順序才不會反） */
function tie2Wrap(ms){ if(!ms) return; const k=[...ms.children]; if(k.length===1&&k[0].classList.contains("t-mi")) return; const w=document.createElement("div"); w.className="t-mi"; k.forEach(c=>w.appendChild(c)); ms.appendChild(w); }
/* 可視高度 → 框的高度（除以 App 的縮放） */
function tie2Sync(){ if(!tieFxOn()) return; const vv=window.visualViewport, z=parseFloat(getComputedStyle(document.documentElement).zoom)||1, de=document.documentElement;
  const h=vv?vv.height:innerHeight, t=vv?vv.offsetTop:0; de.style.setProperty("--vvh",(h/z)+"px"); de.style.setProperty("--vvt",(t/z)+"px");
  de.classList.toggle("kb",!!vv&&vv.height<(screen.height||innerHeight)*0.75); }
let t2raf=0; const t2q=()=>{ if(!t2raf) t2raf=requestAnimationFrame(()=>{ t2raf=0; tie2Sync(); }); };
if(window.visualViewport){ visualViewport.addEventListener("resize",t2q); visualViewport.addEventListener("scroll",t2q); }
addEventListener("resize",t2q);
addEventListener("scroll",()=>{ if(!tieFxOn()) return; if(scrollY) scrollTo(0,0); t2q(); },{passive:true});   /* iPhone 會把整頁往上推：推回來，框自己跟著可視區 */
/* 記住看到哪裡（離最新一則多遠），畫面重畫後還原 */
document.addEventListener("scroll",e=>{ const el=e.target; if(!tieFxOn()||!el||!el.matches||!el.matches("main.t-msgs")) return; T2.fe=Math.max(0,-el.scrollTop); T2.key=location.hash; },true);
/* 每次畫完：是 TIE 聊天室就套固定外殼 */
function tie2After(pgChg,toEnd){ const ms=document.querySelector(".app > main.t-msgs"), on=TIE2()&&!!ms&&!!document.getElementById("wform"), de=document.documentElement;
  if(!on){ if(de.classList.contains("stko")&&!document.getElementById("stkDock")){ de.classList.remove("stko"); de.style.removeProperty("--stkh"); } if(de.classList.contains("tie2l")){ de.classList.remove("tie2l","kb"); de.style.removeProperty("--vvh"); de.style.removeProperty("--vvt"); } return false; }
  de.classList.add("tie2l"); tie2Wrap(ms); tie2Sync();
  const go=pgChg||toEnd||T2.key!==location.hash?0:T2.fe; ms.scrollTop=-go; requestAnimationFrame(()=>{ ms.scrollTop=-go; }); if(!go) T2.fe=0; T2.key=location.hash;
  const d=document.getElementById("stkDock")||(de.classList.contains("stko")&&stkDock.el)||null; if(d&&d.parentNode!==ms.parentNode) ms.parentNode.appendChild(d);
  if(!d&&de.classList.contains("stko")){ de.classList.remove("stko"); de.style.removeProperty("--stkh"); }
  return true; }
/* 藝人送出（只換訊息區）之後：重新包一層、回到最新一則 */
function tie2Patched(ms){ if(!tieFxOn()||!ms) return false; tie2Wrap(ms); ms.scrollTop=0; T2.fe=0; return true; }

/* =========================================================
   限時動態編輯（照 IG，滿版）
   ・選好照片／影片後直接進到滿版編輯畫面
   ・Aa 加字（4 種字體、顏色、文字底色、對齊）、畫筆（顏色、粗細、復原）、吉祥物貼圖、音樂
   ・字和貼圖：一指拖、兩指放大縮小和轉；拖到下面的垃圾桶就刪掉；點一下字可以再改
   ・分享時把字、畫、貼圖跟照片合成一張 1080×1920 的圖再上傳（大家看到的都一樣）；
     影片則是把字和貼圖做成一張透明圖疊在影片上
   ========================================================= */
const STE_W=1080, STE_H=1920;
const STE_COL=["#FFFFFF","#000000","#FF3B6B","#FF9F0A","#FFD60A","#34C759","#0A84FF","#8843FB","#FF8FB1","#A1E3FF"];
const STE_FONT=[["經典","800 1em -apple-system,'PingFang TC',system-ui,sans-serif"],["打字機","700 1em 'Courier New',ui-monospace,monospace"],["優雅","700 1em Georgia,'Songti TC',serif"],["圓圓","800 1em 'Arial Rounded MT Bold','Hiragino Maru Gothic ProN',ui-rounded,sans-serif"]];
const STE_SZ=64;
let STE_NODE=null; function steBack(){ if(!STE_NODE) return; const n=STE_NODE; STE_NODE=null; layer.innerHTML=""; layer.appendChild(n); try{ steMusTag(); }catch(e){} }   /* 字在 1080 寬的畫面上是 64px */
let STE=null;   /* 編輯中的狀態 */
const steEl=()=>document.getElementById("steStage");
/* 打開編輯畫面 */
async function stEdOpen(){ const dr=ui.snDraft; if(!dr||!dr.media.length) return; const m=dr.media[0];
  STE={items:[],strokes:[],tool:null,col:STE_COL[0],font:0,bg:0,al:"center",pen:{c:STE_COL[2],w:14},edit:null,vid:m.type==="video",url:m.type==="video"?(m.url||""):(await mediaSrc(m.mid)||"")};
  setLayer(`<div class="ste" id="steRoot" role="dialog" aria-label="編輯限時動態">
    <div class="ste-stage" id="steStage"><div class="ste-bgb"></div>${STE.vid?`<video class="ste-media" src="${esc(STE.url)}" playsinline muted loop autoplay></video>`:`<img class="ste-media" src="${esc(STE.url)}" alt="">`}<canvas class="ste-draw" id="steDraw" width="${STE_W/2}" height="${STE_H/2}"></canvas><div class="ste-items" id="steItems"></div><div class="ste-trash" id="steTrash">${si("x")}</div></div>
    <div class="ste-top"><button class="ste-ib" data-a="snEdClose" aria-label="取消">${si("x")}</button><span class="sn-sp"></span>
      <div class="ste-tools"><button class="ste-ib" data-a="snEdTool" data-v="text" aria-label="加字"><b>Aa</b></button><button class="ste-ib" data-a="snEdTool" data-v="stk" aria-label="貼圖">${si("heart")}</button><button class="ste-ib" data-a="snEdTool" data-v="men" aria-label="提到人"><b>@</b></button><button class="ste-ib" data-a="snMusAdd" aria-label="音樂">${si("music")}</button><button class="ste-ib" data-a="snEdTool" data-v="draw" aria-label="畫筆"><svg class="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15.6 4.6a2.1 2.1 0 0 1 3 3L8.4 17.8 4.6 19l1.2-3.8z"/><path d="m13.8 6.4 3 3"/></svg></button></div></div>
    <div class="ste-mus" id="steMus"></div>
    <div class="ste-bot"><button class="ste-aud" data-a="snEdShare" data-v="all">${snAv(snUser(snMeId()),26)}<span>你的限時動態</span></button><button class="ste-aud ste-cf" data-a="snEdShare" data-v="cf"><i>${si("star","sm")}</i><span>摯友</span></button><button class="ste-go" data-a="snEdShare" data-v="all" aria-label="分享">→</button></div>
    <div class="ste-panel" id="stePanel"></div></div>`,"ste");
  { const r=document.getElementById("steRoot"), z=parseFloat(getComputedStyle(document.documentElement).zoom)||1; if(r&&z!==1) r.style.zoom=String(1/z); }   /* 編輯畫面不要 App 的整體縮放：滿版就是整個螢幕 */
  const bg=document.querySelector(".ste-bgb"); if(bg&&!STE.vid) bg.style.backgroundImage=`url('${STE.url}')`;
  steDrawAll(); steMusTag(); steStageEvents(); requestAnimationFrame(steRender); }
function steMusTag(){ const el=document.getElementById("steMus"), dr=ui.snDraft; if(!el) return; el.innerHTML=dr&&dr.mus?`<span>${si("note","sm")}${esc(snMusLabel(dr.mus))}</span><button data-a="snMusDel" aria-label="移除音樂">${si("x","sm")}</button>`:""; }
/* ---- 字的排版：用畫布量字，畫面上和合成的圖斷行一模一樣 ---- */
const steCtx=(()=>{ let c=null; return ()=>c||(c=document.createElement("canvas").getContext("2d")); })();
function steLines(it){ const x=steCtx(); x.font=STE_FONT[it.font][1].replace("1em",STE_SZ+"px"); const max=STE_W*.78, out=[];
  String(it.txt).split("\n").forEach(par=>{ let line=""; [...par].forEach(ch=>{ if(x.measureText(line+ch).width>max&&line){ out.push(line); line=ch; } else line+=ch; }); out.push(line); }); return out; }
/* ---- 把項目畫到畫面上（位置用 0~1 的比例，畫面多大都對） ---- */
function steRender(){ const box=document.getElementById("steItems"), st=steEl(); if(!box||!st) return; const k=st.clientWidth/STE_W;
  box.innerHTML=STE.items.map((it,i)=>{ const tr=`transform:translate(-50%,-50%) translate(${it.x*st.clientWidth}px,${it.y*st.clientHeight}px) rotate(${it.r}rad) scale(${it.s})`;
    if(it.t==="stk") return `<div class="ste-it stk" data-i="${i}" style="${tr};width:${360*k}px"><img src="${stkUrl(...it.tok)}" alt="" draggable="false"></div>`;
    if(it.t==="men") return `<div class="ste-it men" data-i="${i}" style="${tr};font-size:${STE_SZ*.8*k}px">${steMenHtml(it)}</div>`;
    return `<div class="ste-it txt" data-i="${i}" style="${tr}">${stTxtHtml(it,STE_SZ*k+"px")}</div>`; }).join(""); }
/* 字（編輯畫面、看限動時共用）：效果字（閃亮、打字機、跳動、霓虹）會動，所以不合成進照片，看的時候疊上去 */
const STE_FX=[["","無效果"],["sp","閃亮"],["tw","打字機"],["bo","跳動"],["ne","霓虹"]];
function stTxtHtml(it,fs){ const L=steLines(it), fg=it.bg?(it.col==="#FFFFFF"?"#000":"#FFF"):it.col, bgc=it.bg?it.col:"transparent"; let n=0;
  const body=it.fx==="tw"||it.fx==="bo"?L.map(l=>[...l].map(ch=>`<i style="--d:${(n++)*(it.fx==="tw"?.09:.06)}s">${esc(ch)}</i>`).join("")).join("<br>"):L.map(esc).join("<br>");
  return `<div class="stx al-${it.al||"center"} ${it.fx?"fx-"+it.fx:""}" style="font:${STE_FONT[it.font][1]};font-size:${fs};color:${fg};--c:${it.col};--n:${n}"><span style="background:${bgc}">${body}</span></div>`; }
const steMenHtml=it=>{ const u=snUser(it.uid); return `<span class="ste-men">@${esc(u?u.u:"")}</span>`; };
/* ---- 手勢：一指拖、兩指縮放旋轉、拖到垃圾桶刪除、點一下改字 ---- */
function steStageEvents(){ const st=steEl(); if(!st) return; const P=new Map(); let g=null;
  const pt=e=>({x:e.clientX,y:e.clientY});
  st.addEventListener("pointerdown",e=>{ if(STE.tool==="draw") return steDrawDown(e); const el=e.target.closest(".ste-it"); if(!el&&!g) return; if(el&&!g){ const it=STE.items[+el.dataset.i]; g={i:+el.dataset.i,el,it0:{...it},moved:false,t0:Date.now()}; }
    P.set(e.pointerId,pt(e)); try{ st.setPointerCapture(e.pointerId); }catch(_){} g.start=new Map([...P].map(([k,v])=>[k,{...v}])); g.base={...STE.items[g.i]}; e.preventDefault(); });
  st.addEventListener("pointermove",e=>{ if(STE.tool==="draw") return steDrawMove(e); if(!g||!P.has(e.pointerId)) return; P.set(e.pointerId,pt(e)); const it=STE.items[g.i], b=g.base, W=st.clientWidth, H=st.clientHeight;
    const ids=[...P.keys()].filter(k=>g.start.has(k));
    if(ids.length>=2){ const [a,c]=ids, a0=g.start.get(a), c0=g.start.get(c), a1=P.get(a), c1=P.get(c);
      const d0=Math.hypot(c0.x-a0.x,c0.y-a0.y)||1, d1=Math.hypot(c1.x-a1.x,c1.y-a1.y), r0=Math.atan2(c0.y-a0.y,c0.x-a0.x), r1=Math.atan2(c1.y-a1.y,c1.x-a1.x);
      it.s=Math.max(.3,Math.min(5,b.s*d1/d0)); it.r=b.r+(r1-r0); it.x=b.x+(((a1.x+c1.x)-(a0.x+c0.x))/2)/W; it.y=b.y+(((a1.y+c1.y)-(a0.y+c0.y))/2)/H; }
    else { const id=ids[0], s0=g.start.get(id), s1=P.get(id); it.x=b.x+(s1.x-s0.x)/W; it.y=b.y+(s1.y-s0.y)/H; }
    if(Math.abs(it.x-g.it0.x)+Math.abs(it.y-g.it0.y)>.01||it.s!==g.it0.s) g.moved=true;
    const tr=document.getElementById("steTrash"); if(tr){ tr.classList.add("on"); const r=tr.getBoundingClientRect(), p=P.get(ids[0]); tr.classList.toggle("hot",ids.length===1&&p.x>r.left-20&&p.x<r.right+20&&p.y>r.top-30); }
    g.el.style.transform=`translate(-50%,-50%) translate(${it.x*W}px,${it.y*H}px) rotate(${it.r}rad) scale(${it.s})`; });
  const up=e=>{ if(STE.tool==="draw") return steDrawUp(e); if(!g) return; P.delete(e.pointerId);
    if(P.size){ g.start=new Map([...P].map(([k,v])=>[k,{...v}])); g.base={...STE.items[g.i]}; return; }
    const tr=document.getElementById("steTrash"), del=tr&&tr.classList.contains("hot"); if(tr) tr.classList.remove("on","hot");
    const it=STE.items[g.i]; if(del) STE.items.splice(g.i,1); else if(!g.moved&&Date.now()-g.t0<350&&it.t==="txt") steTextOpen(g.i);
    g=null; steRender(); };
  st.addEventListener("pointerup",up); st.addEventListener("pointercancel",up); }
/* ---- 加字 ---- */
function steTextOpen(i){ const it=i!=null?STE.items[i]:null; STE.edit=i!=null?i:null; if(it){ STE.col=it.col; STE.font=it.font; STE.bg=it.bg; STE.al=it.al; STE.fx=it.fx||""; }
  const p=document.getElementById("stePanel"); if(!p) return; p.className="ste-panel txtp on";
  p.innerHTML=`<div class="ste-ptop"><button class="ste-chip" data-a="snEdFont">${STE_FONT[STE.font][0]}</button><button class="ste-chip ${STE.bg?"on":""}" data-a="snEdBgT" aria-label="文字底色"><b>A</b></button><button class="ste-chip ${STE.fx?"on":""}" data-a="snEdFx">${STE_FX.find(f=>f[0]===(STE.fx||""))[1]}</button><button class="ste-chip" data-a="snEdAlign" aria-label="對齊">${STE.al==="center"?"置中":STE.al==="left"?"靠左":"靠右"}</button><span class="sn-sp"></span><button class="ste-done" data-a="snEdTextOk">完成</button></div>
    <textarea id="steTxt" class="ste-ta al-${STE.al}" rows="3" maxlength="200" placeholder="輸入文字" style="font:${STE_FONT[STE.font][1]};color:${STE.bg?"#fff":STE.col}">${it?esc(it.txt):""}</textarea>
    <div class="ste-cols">${STE_COL.map(c=>`<button class="${c===STE.col?"on":""}" data-a="snEdCol" data-v="${c}" style="background:${c}" aria-label="顏色"></button>`).join("")}</div>`;
  setTimeout(()=>{ const t=document.getElementById("steTxt"); if(t){ t.focus(); t.setSelectionRange(t.value.length,t.value.length); } },60); }
function steTextOk(){ const t=document.getElementById("steTxt"), v=((t||{}).value||"").replace(/\s+$/,""), p=document.getElementById("stePanel");
  if(v&&!isAdminAcct()&&banBlock(v)) return;
  if(STE.edit!=null){ const it=STE.items[STE.edit]; if(v) Object.assign(it,{txt:v,col:STE.col,font:STE.font,bg:STE.bg,al:STE.al,fx:STE.fx||""}); else STE.items.splice(STE.edit,1); }
  else if(v) STE.items.push({t:"txt",txt:v,col:STE.col,font:STE.font,bg:STE.bg,al:STE.al,fx:STE.fx||"",x:.5,y:.42,s:1,r:0});
  STE.edit=null; if(p){ p.className="ste-panel"; p.innerHTML=""; } if(t) t.blur(); steRender(); }
function steTextRefresh(){ const t=document.getElementById("steTxt"); if(!t) return; const v=t.value, i=STE.edit; steTextOpen(i); const t2=document.getElementById("steTxt"); if(t2) t2.value=v; }
/* ---- 貼圖 ---- */
function steStkOpen(){ const p=document.getElementById("stePanel"); if(!p) return; const tab=STK_SP.includes(ui.stkTab)?ui.stkTab:"cat"; p.className="ste-panel stkp on";
  p.innerHTML=`<i class="stk-grab"></i><div class="stk-tabs">${STK_SP.map(sp=>`<button class="${sp===tab?"on":""}" data-a="snEdStkTab" data-v="${sp}"><img src="${stkUrl(sp,"hi")}" alt=""></button>`).join("")}<span class="sn-sp"></span><button class="ste-done" data-a="snEdPanelX">完成</button></div>
    <div class="stk-grid">${STK_K.map(k=>`<button data-a="snEdStkAdd" data-v="${tab}|${k}"><img src="${stkUrl(tab,k)}" alt=""></button>`).join("")}</div>`; }
/* ---- 畫筆 ---- */
let steCur=null;
function steDrawOpen(){ STE.tool="draw"; document.getElementById("steRoot").classList.add("drawing"); const p=document.getElementById("stePanel"); if(!p) return; p.className="ste-panel drawp on";
  p.innerHTML=`<div class="ste-ptop"><button class="ste-chip" data-a="snEdUndo">復原</button><span class="ste-sz">${[8,14,24,40].map(w=>`<button class="${STE.pen.w===w?"on":""}" data-a="snEdPenW" data-v="${w}"><i style="width:${w/2+4}px;height:${w/2+4}px"></i></button>`).join("")}</span><span class="sn-sp"></span><button class="ste-done" data-a="snEdDrawOk">完成</button></div>
    <div class="ste-cols">${STE_COL.map(c=>`<button class="${c===STE.pen.c?"on":""}" data-a="snEdPenC" data-v="${c}" style="background:${c}"></button>`).join("")}</div>`; }
function stePos(e){ const r=steEl().getBoundingClientRect(); return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]; }
function steDrawDown(e){ if(e.target.closest(".ste-panel,.ste-top")) return; steCur={c:STE.pen.c,w:STE.pen.w,pts:[stePos(e)]}; STE.strokes.push(steCur); try{ steEl().setPointerCapture(e.pointerId); }catch(_){} e.preventDefault(); steDrawAll(); }
function steDrawMove(e){ if(!steCur) return; steCur.pts.push(stePos(e)); steDrawAll(); }
function steDrawUp(){ steCur=null; }
function steStroke(x,W,H,k){ STE.strokes.forEach(s=>{ x.strokeStyle=s.c; x.lineWidth=s.w*k; x.lineCap="round"; x.lineJoin="round"; x.beginPath(); s.pts.forEach(([a,b],i)=>i?x.lineTo(a*W,b*H):x.moveTo(a*W,b*H)); if(s.pts.length===1) x.lineTo(s.pts[0][0]*W+.1,s.pts[0][1]*H); x.stroke(); }); }
function steDrawAll(){ const c=document.getElementById("steDraw"); if(!c) return; const x=c.getContext("2d"); x.clearRect(0,0,c.width,c.height); steStroke(x,c.width,c.height,c.width/STE_W); }
/* ---- 合成：照片＋畫＋字＋貼圖 → 1080×1920 ---- */
/* 後面的模糊底：跟編輯畫面看到的一樣柔（瀏覽器支援就直接模糊；不支援就分好幾次縮小再放大，不會一格一格） */
/* 模糊背景：自己算（iPhone 的 Safari 不支援畫布的 blur，之前用縮小再放大會變成一格一格的馬賽克）
   做法：縮到 108×192 → 盒狀模糊來回 3 次（接近高斯模糊）→ 平滑放大回 1080×1920 */
function steBoxBlur(d,w,h,r){ const t=new Uint8ClampedArray(d.length), pass=(src,dst,hor)=>{ const L=hor?w:h, N=hor?h:w;
    for(let j=0;j<N;j++){ let R=0,G=0,B=0,c=0; const at=i=>hor?(j*w+i)*4:(i*w+j)*4;
      for(let i=-r;i<=r;i++){ const k=at(Math.min(L-1,Math.max(0,i))); R+=src[k]; G+=src[k+1]; B+=src[k+2]; c++; }
      for(let i=0;i<L;i++){ const o=at(i); dst[o]=R/c; dst[o+1]=G/c; dst[o+2]=B/c; dst[o+3]=255; const a=at(Math.max(0,i-r)), b2=at(Math.min(L-1,i+r+1)); R+=src[b2]-src[a]; G+=src[b2+1]-src[a+1]; B+=src[b2+2]-src[a+2]; } } };
  for(let n=0;n<3;n++){ pass(d,t,true); pass(t,d,false); } }
function steBlurBg(x,im){ const cv=Math.max(STE_W/im.width,STE_H/im.height)*1.12, w=im.width*cv, h=im.height*cv, SW=108, SH=192;
  const c=document.createElement("canvas"); c.width=SW; c.height=SH; const cx=c.getContext("2d"); cx.imageSmoothingEnabled=true; cx.imageSmoothingQuality="high"; cx.drawImage(im,(SW-w*SW/STE_W)/2,(SH-h*SH/STE_H)/2,w*SW/STE_W,h*SH/STE_H);
  try{ const id=cx.getImageData(0,0,SW,SH); steBoxBlur(id.data,SW,SH,5); cx.putImageData(id,0,0); }catch(e){}
  const m=document.createElement("canvas"); m.width=SW*4; m.height=SH*4; const mx=m.getContext("2d"); mx.imageSmoothingEnabled=true; mx.imageSmoothingQuality="high"; mx.drawImage(c,0,0,m.width,m.height);   /* 分兩段放大，比較滑 */
  x.save(); x.imageSmoothingEnabled=true; x.imageSmoothingQuality="high"; x.drawImage(m,0,0,STE_W,STE_H); x.restore(); x.fillStyle="rgba(0,0,0,.22)"; x.fillRect(0,0,STE_W,STE_H); }
const steImg=src=>new Promise(r=>{ const i=new Image(); i.crossOrigin="anonymous"; i.onload=()=>r(i); i.onerror=()=>r(null); i.src=src; });
async function steCompose(withBg){ const c=document.createElement("canvas"); c.width=STE_W; c.height=STE_H; const x=c.getContext("2d");
  if(withBg){ const im=await steImg(STE.url); x.fillStyle="#000"; x.fillRect(0,0,STE_W,STE_H);
    if(im){ /* 後面：同一張照片放大、模糊、變暗；前面：整張照片放得下的大小 */
      steBlurBg(x,im);
      const s=Math.min(STE_W/im.width,STE_H/im.height), cover=Math.max(STE_W/im.width,STE_H/im.height), sc=cover/s<1.25?cover:s;   /* 比例接近直的就直接填滿 */
      x.drawImage(im,(STE_W-im.width*sc)/2,(STE_H-im.height*sc)/2,im.width*sc,im.height*sc); } }
  steStroke(x,STE_W,STE_H,1);
  for(const it of STE.items){ if(it.t==="txt"&&it.fx) continue; x.save(); x.translate(it.x*STE_W,it.y*STE_H); x.rotate(it.r); x.scale(it.s,it.s);
    if(it.t==="stk"){ const im=await steImg(stkUrl(...it.tok)); if(im) x.drawImage(im,-180,-195,360,390); }
    else if(it.t==="men"){ const u=snUser(it.uid), tx="@"+(u?u.u:""), fs=STE_SZ*.8; x.font=`800 ${fs}px -apple-system,'PingFang TC',system-ui,sans-serif`; const w=x.measureText(tx).width; x.fillStyle="#fff"; steRR(x,-w/2-26,-fs*.75,w+52,fs*1.5,18); x.fill();
      const gr=x.createLinearGradient(-w/2,0,w/2,0); gr.addColorStop(0,"#A855F7"); gr.addColorStop(1,"#EC4899"); x.fillStyle=gr; x.textAlign="center"; x.textBaseline="middle"; x.fillText(tx,0,2); }
    else { const L=steLines(it), lh=STE_SZ*1.3, fg=it.bg?(it.col==="#FFFFFF"?"#000":"#FFF"):it.col; x.font=STE_FONT[it.font][1].replace("1em",STE_SZ+"px"); x.textBaseline="middle"; x.textAlign=it.al==="center"?"center":it.al;
      const wid=Math.max(...L.map(l=>x.measureText(l).width)), top=-L.length*lh/2, ax=it.al==="center"?0:it.al==="left"?-wid/2:wid/2;
      if(it.bg){ x.fillStyle=it.col; L.forEach((l,i)=>{ const w=x.measureText(l).width, lx=it.al==="center"?-w/2:it.al==="left"?-wid/2:wid/2-w; steRR(x,lx-22,top+i*lh+2,w+44,lh-4,18); x.fill(); }); }
      else { x.shadowColor="rgba(0,0,0,.35)"; x.shadowBlur=8; }
      x.fillStyle=fg; L.forEach((l,i)=>x.fillText(l,ax,top+i*lh+lh/2)); }
    x.restore(); }
  return await new Promise(r=>c.toBlob(r,withBg?"image/jpeg":"image/png",.88)); }
function steRR(x,a,b,w,h,r){ x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r); x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); }
async function steShare(aud){ const dr=ui.snDraft; if(!dr||!STE||STE.busy) return; STE.busy=1; toast("處理中…");
  try{ dr.aud=aud==="cf"?"cf":"all"; const has=STE.items.some(it=>!(it.t==="txt"&&it.fx))||STE.strokes.length;
    dr.stx=STE.items.filter(it=>it.t==="txt"&&it.fx).map(({t,...o})=>o); dr.ment=STE.items.filter(it=>it.t==="men").map(it=>({u:it.uid,x:it.x,y:it.y}));
    if(!STE.vid){ if(has){ const b=await steCompose(true), id="sne"+Date.now().toString(36); await MDB.put(id,b); dr.media[0]={mid:id,w:STE_W,h:STE_H}; } }
    else if(has){ const b=await steCompose(false), id="seo"+Date.now().toString(36); await MDB.put(id,b); dr.ov=id; }
    layer.innerHTML=""; STE=null; const btn=document.querySelector('[data-a="snPost"]'); if(btn){ btn.disabled=false; btn.click(); } }
  catch(e){ STE.busy=0; toast("處理失敗，請再試一次"); } }
/* ---- 提到人（@）：選人 → 放一個 @帳號 的標籤；看限動的人點標籤會到他的個人頁，被提到的人會在通知看到 ---- */
function steMenOpen(){ const p=document.getElementById("stePanel"); if(!p) return; p.className="ste-panel menp on"; const me=snMeId();
  const L=snAllUsers().filter(u=>u.id!==me&&!String(u.id).startsWith("o:"));
  p.innerHTML=`<div class="ste-ptop"><span class="sn-sp"></span><button class="ste-done" data-a="snEdPanelX">完成</button></div><label class="ste-ms">${si("search")}<input id="steMq" placeholder="搜尋" autocomplete="off" autocapitalize="off"></label><div class="ste-ml" id="steMl"></div>`;
  const draw=q=>{ const z=nz(q||""); document.getElementById("steMl").innerHTML=L.filter(u=>!z||nz(u.u).includes(z)||nz(u.name||"").includes(z)).slice(0,40).map(u=>`<button data-a="snEdMenAdd" data-v="${esc(u.id)}">${snAv(u,40)}<span><b>${esc(u.u)}</b><small>${esc(u.name||"")}</small></span></button>`).join("")||`<p class="ste-none">找不到</p>`; };
  draw(""); const q=document.getElementById("steMq"); q.addEventListener("input",()=>draw(q.value)); setTimeout(()=>q.focus(),80); }
/* ---- 看限動時：效果字、@標籤疊在照片上（跟編輯時同一個 9:16 畫面比例） ---- */
function stViewLayer(s){ if(!(s.stx||[]).length&&!(s.ment||[]).length) return "";
  return `<div class="stv">${(s.stx||[]).map(it=>`<div class="stv-it" style="left:${it.x*100}%;top:${it.y*100}%;transform:translate(-50%,-50%) rotate(${it.r}rad) scale(${it.s})">${stTxtHtml(it,`calc(${STE_SZ/STE_W*100}cqw)`)}</div>`).join("")}
    ${(s.ment||[]).map(m=>{ const u=snUser(m.u); return u?`<button class="stv-men" data-a="snsGo" data-v="profile" data-id="${esc(m.u)}" style="left:${m.x*100}%;top:${m.y*100}%" aria-label="@${esc(u.u)}"></button>`:""; }).join("")}</div>`; }

