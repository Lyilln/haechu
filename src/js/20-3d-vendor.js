/* HAECHU｜3D、外掛工具、應援餐車、應援棒 3D */
/* =========================================================
   3D（three.js，要用的時候才載入）
   ・應援餐車：高級亮面（車漆、香檳金、鍍鉻），粉絲裝飾＋自己買或分攤，送到前保密，藝人出道／回歸開箱
   ・演唱會應援棒：重做成高級款（珍珠白握把、香檳金環、玻璃燈頭、裡面發光）
   ========================================================= */
let _threeP=null;
function loadThree(){ try{ MSO.load(); }catch(e){} if(window.THREE) return Promise.resolve(window.THREE); if(_threeP) return _threeP;
  const add=(src,next)=>{ const s=document.createElement("script"); s.src=src; s.async=true; s.onload=()=>window.THREE?res(window.THREE):rej(new Error("three")); s.onerror=()=>{ s.remove(); if(next) add(next); else { _threeP=null; rej(new Error("three")); } }; document.head.appendChild(s); };
  let res,rej; _threeP=new Promise((a,b)=>{ res=a; rej=b; }); add("vendor/three-r128.min.js","https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js");
  return _threeP; }

/* ---------- 共用：攝影棚燈光、材質、小工具 ---------- */
const X3={
  C:h=>new THREE.Color(h).convertSRGBToLinear(),
  /* 攝影棚環境：暗灰的房間＋幾片很亮的柔光箱，亮面材質才會有漂亮的反光 */
  env(R){ const s=new THREE.Scene(), room=new THREE.Mesh(new THREE.BoxGeometry(12,12,12),new THREE.MeshBasicMaterial({color:new THREE.Color(.16,.15,.17),side:THREE.BackSide})); s.add(room);
    [[0,5.9,0,7,.1,4,5.5],[5.9,1.6,1,.1,3,7,3.2],[-5.9,1.2,-1,.1,2.4,6,2.2],[0,1.4,5.9,5,2.6,.1,2.6],[1,-1,-5.9,6,1.2,.1,1.2]].forEach(([x,y,z,w,h,d,i])=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color:new THREE.Color(i,i*.97,i*.94)})); m.position.set(x,y,z); s.add(m); });
    const pm=new THREE.PMREMGenerator(R), t=pm.fromScene(s,.035).texture; pm.dispose(); return t; },
  /* 圓角方塊 */
  rbox(w,h,d,r,seg=6){ r=Math.min(r,w/2-.001,h/2-.001,d/2-.001); const iw=w-2*r, ih=h-2*r, cr=Math.min(r*.6,iw/2,ih/2), s=new THREE.Shape(), x=-iw/2, y=-ih/2;
    s.moveTo(x+cr,y); s.lineTo(x+iw-cr,y); s.quadraticCurveTo(x+iw,y,x+iw,y+cr); s.lineTo(x+iw,y+ih-cr); s.quadraticCurveTo(x+iw,y+ih,x+iw-cr,y+ih); s.lineTo(x+cr,y+ih); s.quadraticCurveTo(x,y+ih,x,y+ih-cr); s.lineTo(x,y+cr); s.quadraticCurveTo(x,y,x+cr,y);
    const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:seg,curveSegments:10}); g.center(); g.computeVertexNormals(); return g; },
  ctex(w,h,draw){ const c=document.createElement("canvas"); c.width=w; c.height=h; const x=c.getContext("2d"); draw(x,w,h); const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=8; return t; },
  rr(x,X,Y,W,H,r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+W,Y,X+W,Y+H,r); x.arcTo(X+W,Y+H,X,Y+H,r); x.arcTo(X,Y+H,X,Y,r); x.arcTo(X,Y,X+W,Y,r); x.closePath(); },
  glowTex(){ if(X3._g) return X3._g; const c=document.createElement("canvas"); c.width=c.height=64; const x=c.getContext("2d"), gr=x.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,"rgba(255,255,255,1)"); gr.addColorStop(.3,"rgba(255,255,255,.5)"); gr.addColorStop(1,"rgba(255,255,255,0)"); x.fillStyle=gr; x.fillRect(0,0,64,64); return X3._g=new THREE.CanvasTexture(c); },
  /* 材質：車漆（亮面＋透明漆）、香檳金、鍍鉻、玻璃、珍珠、布料 */
  paint:(hex,o={})=>new THREE.MeshPhysicalMaterial({color:X3.C(hex),metalness:o.metal??.15,roughness:o.rough??.32,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:1}),
  gold:(hex="#D8B98A",rough=.22)=>new THREE.MeshStandardMaterial({color:X3.C(hex),metalness:1,roughness:rough,envMapIntensity:1.15}),
  chrome:()=>new THREE.MeshStandardMaterial({color:X3.C("#E9ECF1"),metalness:1,roughness:.08,envMapIntensity:1.3}),
  glass:(hex="#1E2230",op=.82)=>new THREE.MeshPhysicalMaterial({color:X3.C(hex),metalness:0,roughness:.02,clearcoat:1,clearcoatRoughness:0,transparent:true,opacity:op,envMapIntensity:1.4}),
  matte:(hex,rough=.75)=>new THREE.MeshStandardMaterial({color:X3.C(hex),metalness:0,roughness:rough,envMapIntensity:.6}),
  emit:(hex,k=1.4)=>new THREE.MeshStandardMaterial({color:X3.C(hex),emissive:X3.C(hex),emissiveIntensity:k,roughness:.35}),
  renderer(alpha=true){ const R=new THREE.WebGLRenderer({antialias:true,alpha}); R.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); R.outputEncoding=THREE.sRGBEncoding;
    R.toneMapping=THREE.ACESFilmicToneMapping; R.toneMappingExposure=1.05; R.physicallyCorrectLights=false; return R; }
};
const SERIF='"Playfair Display","Noto Serif TC","Songti TC",serif', SANS='"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif';

/* =========================================================
   小卡／專輯 真 3D（three.js ＋ webgl-noise）
   ・小卡、明信片、拍立得…：照公分比例做成有厚度的亮面卡，正面背面都是真的，手指往哪拖就往哪轉
   ・珠光卡：用 webgl-noise 的 simplex noise 做雷射光澤，轉的角度不同顏色就流過去，還有細碎閃粉
   ・專輯：照長寬高做成立體盒，有封面、封底、書背、外面一層收縮膜；點一下撕膜、封面翻開、裡面發光
   ・three.js 還沒載好、或手機不支援 WebGL：照原本的 CSS 立體，不會壞
   ========================================================= */

/* =========================================================
   外掛工具（都放在 vendor/，要用的時候才載入，不拖慢 App 打開）
   ・mediabunny：影片在手機上先壓小再傳、抓封面更準、從影片取出聲音
   ・Konva：簽售簽名板（筆跡平滑、可以復原、貼紙可以拖拉縮放旋轉）
   ・planck.js：拆專輯、抽卡噴出來的彩紙有真的物理（會飄、會翻、會落地疊起來）
   ・meshoptimizer：設計圖做出來的應援棒 3D 模型太密時減面，手機轉起來比較順
   載不到或手機不支援：全部照原本的做法，不會壞
   ========================================================= */
const VND={ p:{}, mod(path){ return VND.p[path]||(VND.p[path]=import(new URL(path,location.href).href).catch(e=>{ delete VND.p[path]; throw e; })); },
  script(src,glob){ return VND.p[src]||(VND.p[src]=new Promise((res,rej)=>{ if(window[glob]) return res(window[glob]); const s=document.createElement("script"); s.src=src; s.async=true; s.onload=()=>window[glob]?res(window[glob]):rej(new Error(glob)); s.onerror=()=>{ delete VND.p[src]; s.remove(); rej(new Error(glob)); }; document.head.appendChild(s); })); } };

/* ---------- mediabunny：影片 ---------- */
const MB={
  lib:()=>VND.mod("vendor/mediabunny/src/index.js"),
  ok:()=>typeof VideoEncoder!=="undefined"&&typeof VideoDecoder!=="undefined",
  /* 壓小：最長邊 maxSide、H.264＋AAC 的 MP4；壓完沒有比較小就用原檔 */
  async shrink(file,{maxSide=1280,bitrate,onProgress}={}){ if(!file||!MB.ok()) return null;
    try{ const M=await MB.lib(), input=new M.Input({source:new M.BlobSource(file),formats:M.ALL_FORMATS}), vt=await input.getPrimaryVideoTrack(); if(!vt) return null;
      const w=await vt.getDisplayWidth(), h=await vt.getDisplayHeight(), big=Math.max(w,h), k=big>maxSide?maxSide/big:1, ev=n=>Math.max(2,Math.round(n/2)*2);
      const output=new M.Output({format:new M.Mp4OutputFormat({fastStart:"in-memory"}),target:new M.BufferTarget()});
      const conv=await M.Conversion.init({input,output,showWarnings:false,video:{width:ev(w*k),height:ev(h*k),fit:"contain",codec:"avc",bitrate:bitrate||M.QUALITY_MEDIUM,forceTranscode:true},audio:{codec:"aac",bitrate:128e3}});
      if(!conv.isValid) return null; if(onProgress) conv.onProgress=p=>onProgress(p);
      await conv.execute(); const buf=output.target.buffer; if(!buf) return null; const out=new File([buf],(file.name||"video").replace(/\.[^.]+$/,"")+".mp4",{type:"video/mp4"});
      return out.size<file.size?out:null; }catch(e){ console.warn("MB.shrink",e); return null; } },
  /* 封面：用解碼器直接拿那一格（iPhone 用 <video> 常常拿不到畫面） */
  async thumb(file,maxSide=720){ if(!file||!MB.ok()) return null;
    try{ const M=await MB.lib(), input=new M.Input({source:new M.BlobSource(file),formats:M.ALL_FORMATS}), vt=await input.getPrimaryVideoTrack(); if(!vt||!(await vt.canDecode())) return null;
      const w=await vt.getDisplayWidth(), h=await vt.getDisplayHeight(), dur=await input.computeDuration(), k=Math.min(1,maxSide/Math.max(w,h));
      const sink=new M.CanvasSink(vt,{width:Math.round(w*k),height:Math.round(h*k),fit:"contain"}), at=await sink.getCanvas(Math.min(1,(dur||1)/3)); if(!at) return null;
      const cv=at.canvas, blob=cv.convertToBlob?await cv.convertToBlob({type:"image/jpeg",quality:.8}):await new Promise(r=>cv.toBlob(r,"image/jpeg",.8));
      return blob?{blob,w,h,dur}:null; }catch(e){ console.warn("MB.thumb",e); return null; } },
  /* 從影片取出聲音（AAC 的 M4A，小很多）：iPhone 的 .MOV 讀不出聲音時用 */
  async audio(file){ if(!file) return null;
    try{ const M=await MB.lib(), mk=async au=>{ const input=new M.Input({source:new M.BlobSource(file),formats:M.ALL_FORMATS}); if(!await input.getPrimaryAudioTrack()) return null;
        const output=new M.Output({format:new M.Mp4OutputFormat({fastStart:"in-memory"}),target:new M.BufferTarget()}), conv=await M.Conversion.init({input,output,showWarnings:false,video:{discard:true},audio:au}); return conv.isValid?{input,output,conv}:null; };
      /* 影片裡的聲音本來就是 AAC（iPhone 都是）：直接搬出來不重新壓；不是的話才轉成 AAC */
      const x=await mk({})||(typeof AudioEncoder!=="undefined"?await mk({codec:"aac",bitrate:128e3}):null); if(!x) return null; const {input,output,conv}=x;
      await conv.execute(); const buf=output.target.buffer; if(!buf) return null; return {blob:new Blob([buf],{type:"audio/mp4"}),dur:await input.computeDuration()}; }catch(e){ console.warn("MB.audio",e); return null; } },
  /* 上傳前的小視窗：顯示壓縮進度 */
  async prep(f,{maxSide=1280,limitMB=40}={}){ if(!f||!MB.ok()) return f;
    const need=f.size>8*1024*1024; if(!need) return f;
    tieModal("影片處理中…",`正在手機上把影片壓小，傳得比較快、大家也比較好播。<br><b id="mbPct">0%</b>`,`<span class="up-spin"></span>`);
    const out=await MB.shrink(f,{maxSide,onProgress:p=>{ const e=document.getElementById("mbPct"); if(e) e.textContent=Math.round(p*100)+"%"; }});
    if(layer.querySelector("#mbPct")) layer.innerHTML="";
    return out||f; },
};

/* ---------- Konva：簽名板 ---------- */
const KP={
  lib:()=>VND.mod("vendor/konva/index.js").then(m=>m.default||m.Konva),
  STK:["💜","✨","🌸","⭐","🎀","♥"],
  async mount(box,cv){ let Konva; try{ Konva=await KP.lib(); }catch(e){ return null; } if(!box||!box.isConnected) return null;
    const S=Math.round(box.clientWidth)||300, k=S/600, host=document.createElement("div"); host.className="kp-host"; box.appendChild(host);
    const st=new Konva.Stage({container:host,width:S,height:S}); st.scale({x:k,y:k});
    const ink=new Konva.Layer(), deco=new Konva.Layer(); st.add(ink); st.add(deco);
    const tr=new Konva.Transformer({keepRatio:true,enabledAnchors:["top-left","top-right","bottom-left","bottom-right"],anchorSize:16,anchorCornerRadius:8,borderStroke:"#8843FB",anchorStroke:"#8843FB",anchorFill:"#fff",rotateAnchorOffset:34,padding:6}); deco.add(tr);
    cv.style.display="none"; ui.fsInk=false;
    const hist=[]; let line=null, sel=null, bar=null;
    const pos=()=>{ const p=st.getPointerPosition()||{x:0,y:0}; return [p.x/k,p.y/k]; };
    const select=n=>{ sel=n; tr.nodes(n?[n]:[]); if(n) n.moveToTop(), tr.moveToTop(); if(bar){ const d=bar.querySelector(".kp-del"); if(d) d.hidden=!n; } };
    const onStk=t=>t&&(t.hasName("stk")||(t.getParent&&t.getParent()===tr));
    st.on("pointerdown",e=>{ if(onStk(e.target)){ if(e.target.hasName("stk")) select(e.target); return; } select(null);
      const [x,y]=pos(); line=new Konva.Line({points:[x,y,x+.1,y+.1],stroke:ui.fsPen||"#111827",strokeWidth:11,lineCap:"round",lineJoin:"round",tension:.45,shadowColor:ui.fsPen==="#FFFFFF"?"rgba(0,0,0,.35)":"transparent",shadowBlur:ui.fsPen==="#FFFFFF"?3:0}); ink.add(line); hist.push(line); ui.fsInk=true; });
    st.on("pointermove",()=>{ if(!line) return; const [x,y]=pos(), p=line.points(), lx=p[p.length-2], ly=p[p.length-1]; if(Math.hypot(x-lx,y-ly)<2.5) return; line.points(p.concat([x,y])); });
    st.on("pointerup pointercancel pointerleave",()=>{ line=null; });
    const addStk=ch=>{ const t=new Konva.Text({text:ch,fontSize:120,fontFamily:"Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif",fill:ui.fsPen&&ui.fsPen!=="#FFFFFF"?ui.fsPen:"#EC4899",x:300,y:300,draggable:true,name:"stk"});
      t.offsetX(t.width()/2); t.offsetY(t.height()/2); t.rotation((Math.random()-.5)*24); deco.add(t); hist.push(t); select(t); ui.fsInk=true;
      t.on("dragstart transformstart",()=>select(t)); };
    /* 工具列：復原、貼紙、刪掉選到的貼紙 */
    bar=document.createElement("div"); bar.className="kp-bar";
    bar.innerHTML=`<button type="button" class="kp-undo" aria-label="復原上一筆">↶ 復原</button><span class="kp-stks">${KP.STK.map(s=>`<button type="button" class="kp-stk" data-s="${s}" aria-label="加貼紙">${s}</button>`).join("")}</span><button type="button" class="kp-del" hidden>刪掉貼紙</button>`;
    box.insertAdjacentElement("afterend",bar);
    bar.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return;
      if(b.classList.contains("kp-undo")){ const n=hist.pop(); if(n){ if(n===sel) select(null); n.destroy(); } ui.fsInk=hist.length>0; }
      else if(b.classList.contains("kp-stk")) addStk(b.dataset.s);
      else if(b.classList.contains("kp-del")&&sel){ const i=hist.indexOf(sel); if(i>=0) hist.splice(i,1); sel.destroy(); select(null); ui.fsInk=hist.length>0; } });
    return { alive:()=>host.isConnected, has:()=>hist.length>0,
      clear(){ hist.splice(0).forEach(n=>n.destroy()); select(null); ui.fsInk=false; },
      exportTo(c){ select(null); const out=st.toCanvas({pixelRatio:600/S}), x=c.getContext("2d"); x.clearRect(0,0,c.width,c.height); x.drawImage(out,0,0,c.width,c.height); } }; },
};

/* ---------- planck.js：彩紙物理 ---------- */
const PH={ S:40, w:null, list:[], W:0, H:0,
  load:()=>VND.script("vendor/planck-1.6.0.js","planck"),
  reset(W,H){ PH.w=null; PH.list=[]; PH.W=W; PH.H=H; PH.load().catch(()=>{}); },
  world(){ if(PH.w) return PH.w; const pl=window.planck; if(!pl) return null; const S=PH.S, W=PH.W/S, H=PH.H/S, w=new pl.World({gravity:pl.Vec2(0,16)}), g=w.createBody();
    g.createFixture(pl.Edge(pl.Vec2(-2,H),pl.Vec2(W+2,H)),{friction:.9}); g.createFixture(pl.Edge(pl.Vec2(0,-40),pl.Vec2(0,H)),{friction:.3}); g.createFixture(pl.Edge(pl.Vec2(W,-40),pl.Vec2(W,H)),{friction:.3});
    return PH.w=w; },
  /* 一次噴出一把紙片：長方形、愛心色、會翻面 */
  burst(x,y,cols,n=30){ const w=PH.world(); if(!w){ if(!window.planck&&!PH.q){ PH.q=1; PH.load().then(()=>{ PH.q=0; PH.burst(x,y,cols,n); }).catch(()=>{ PH.q=0; }); } return; } const pl=window.planck, S=PH.S, now=performance.now();
    for(let i=0;i<n;i++){ const a=-Math.PI/2+(Math.random()-.5)*2.4, v=6+Math.random()*9, hw=(.12+Math.random()*.1), hh=hw*(.45+Math.random()*.25);
      const b=w.createBody({type:"dynamic",position:pl.Vec2(x/S+(Math.random()-.5)*.4,y/S),angle:Math.random()*6.28,linearDamping:1.8,angularDamping:.6});
      b.createFixture(pl.Box(hw,hh),{density:.15,friction:.8,restitution:.2}); b.setLinearVelocity(pl.Vec2(Math.cos(a)*v,Math.sin(a)*v)); b.setAngularVelocity((Math.random()-.5)*18);
      PH.list.push({b,c:cols[Math.random()*cols.length|0],hw,hh,t:now,life:5200+Math.random()*2600,sp:Math.random()*6.28,fs:4+Math.random()*6}); }
    while(PH.list.length>180){ const o=PH.list.shift(); w.destroyBody(o.b); } },
  draw(ctx,dt){ const w=PH.w; if(!w||!PH.list.length) return; const pl=window.planck, S=PH.S, now=performance.now();
    for(const o of PH.list){ const v=o.b.getLinearVelocity(); if(v.y>0){ const t=now/1000; o.b.applyForceToCenter(pl.Vec2(Math.sin(t*2.2+o.sp)*.05-v.x*.012,-v.y*.022),true); } }   /* 紙片落下時被空氣托住、左右飄 */
    w.step(Math.min(dt,1/30),6,2);
    for(let i=PH.list.length-1;i>=0;i--){ const o=PH.list[i], age=now-o.t; if(age>o.life){ w.destroyBody(o.b); PH.list.splice(i,1); continue; }
      const p=o.b.getPosition(), a=o.b.getAngle(), fl=Math.cos(now/1000*o.fs+o.sp), al=Math.min(1,(o.life-age)/700);
      ctx.save(); ctx.globalAlpha=al; ctx.translate(p.x*S,p.y*S); ctx.rotate(a); ctx.scale(1,Math.max(.12,Math.abs(fl)));
      ctx.fillStyle=o.c; ctx.fillRect(-o.hw*S,-o.hh*S,o.hw*2*S,o.hh*2*S); if(fl<0){ ctx.fillStyle="rgba(0,0,0,.22)"; ctx.fillRect(-o.hw*S,-o.hh*S,o.hw*2*S,o.hh*2*S); } ctx.restore(); }
    ctx.globalAlpha=1; } };

/* ---------- meshoptimizer：模型減面 ---------- */
const MSO={ M:null, p:null,
  load(){ return MSO.p||(MSO.p=VND.mod("vendor/meshopt_simplifier-1.3.js").then(m=>m.MeshoptSimplifier.ready.then(()=>MSO.M=m.MeshoptSimplifier)).catch(()=>null)); },
  /* 面太多（超過 8000 個三角形）就減到一半左右，邊緣鎖住不動，外型看不出差別 */
  slim(geo){ const M=MSO.M, idx=geo&&geo.index; if(!M||!idx||idx.count<24000) return 0;
    try{ const I=idx.array instanceof Uint32Array?idx.array:new Uint32Array(idx.array), P0=geo.attributes.position.array, P=P0 instanceof Float32Array?P0:new Float32Array(P0);
      const [out]=M.simplify(I,P,3,Math.floor(I.length*.5/3)*3,.003,["LockBorder"]); if(!out||out.length<I.length*.25||out.length>=I.length) return 0;
      geo.setIndex(new THREE.BufferAttribute(out,1)); return I.length-out.length; }catch(e){ return 0; } } };
/* webgl-noise（Ashima Arts / Stefan Gustavson，MIT）：3D simplex noise */
const C3_NOISE=`
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;
const C3={
  ok:null,
  gl(){ if(C3.ok!=null) return C3.ok; try{ const c=document.createElement("canvas"); C3.ok=!!(window.WebGLRenderingContext&&(c.getContext("webgl")||c.getContext("experimental-webgl"))); }catch(e){ C3.ok=false; } return C3.ok; },
  /* 圖片裁成卡片比例（跟原本的 object-fit:cover 一樣）；沒有圖就畫原本的漸層＋字 */
  pic(url,W,H,fallback){ return new Promise(res=>{ const done=img=>res(X3.ctex(W,H,(x)=>{ if(img){ const s=Math.max(W/img.width,H/img.height), w=img.width*s, h=img.height*s; x.drawImage(img,(W-w)/2,(H-h)/2,w,h); } else fallback(x,W,H); }));
    if(!url) return done(null); const im=new Image(); if(/^https?:/.test(url)&&!url.startsWith(location.origin)) im.crossOrigin="anonymous"; im.onload=()=>done(im); im.onerror=()=>done(null); im.src=url; }); },
  grad(x,W,H,c1,c2){ const g=x.createLinearGradient(0,0,W,H); g.addColorStop(0,c1); g.addColorStop(1,c2); x.fillStyle=g; x.fillRect(0,0,W,H); },
  txt(x,s,X,Y,font,col,max,al="center"){ x.font=font; x.fillStyle=col; x.textAlign=al; x.textBaseline="middle"; x.fillText(String(s||""),X,Y,max); },
  dims(W0,H0,max=1024){ const k=max/Math.max(W0,H0); return [Math.round(W0*k),Math.round(H0*k)]; },
  shape(w,h,r){ const s=new THREE.Shape(), x=-w/2, y=-h/2; s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.quadraticCurveTo(x+w,y,x+w,y+r); s.lineTo(x+w,y+h-r); s.quadraticCurveTo(x+w,y+h,x+w-r,y+h); s.lineTo(x+r,y+h); s.quadraticCurveTo(x,y+h,x,y+h-r); s.lineTo(x,y+r); s.quadraticCurveTo(x,y,x+r,y); return s; },
  plane(w,h,r){ const g=new THREE.ShapeGeometry(C3.shape(w,h,r),10), p=g.attributes.position, uv=g.attributes.uv; for(let i=0;i<p.count;i++) uv.setXY(i,p.getX(i)/w+.5,p.getY(i)/h+.5); uv.needsUpdate=true; return g; },
  /* 珠光：雷射彩虹＋流動的 noise＋細碎閃粉，跟著卡片角度變色 */
  holo(k=1){ return new THREE.ShaderMaterial({ transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, uniforms:{uT:{value:0},uK:{value:k}},
    vertexShader:`varying vec2 vUv; varying vec3 vWN; varying vec3 vVD;
      void main(){ vUv=uv; vec4 wp=modelMatrix*vec4(position,1.0); vWN=normalize(mat3(modelMatrix)*normal); vVD=normalize(cameraPosition-wp.xyz); gl_Position=projectionMatrix*viewMatrix*wp; }`,
    fragmentShader:`uniform float uT; uniform float uK; varying vec2 vUv; varying vec3 vWN; varying vec3 vVD;
      ${C3_NOISE}
      void main(){
        float n=snoise(vec3(vUv*vec2(1.6,2.4),uT*0.08));
        vec3 r=reflect(-vVD,vWN);
        float ph=vUv.x*0.9+vUv.y*0.7+r.x*1.7+r.y*1.3+n*0.5;
        vec3 rb=0.5+0.5*cos(6.2832*(vec3(0.0,0.33,0.67)+ph));
        float band=pow(0.5+0.5*sin((vUv.x-vUv.y)*8.0+r.x*7.0+r.y*3.0+n*3.0),3.0);
        float fres=pow(1.0-max(dot(vWN,vVD),0.0),2.0);
        float sp=snoise(vec3(vUv*vec2(70.0,108.0),floor(uT*5.0)*0.37+r.x*3.0+r.y*2.0));
        sp=smoothstep(0.80,1.0,sp)*1.4;
        float edge=smoothstep(0.43,0.5,max(abs(vUv.x-0.5),abs(vUv.y-0.5)));
        vec3 col=rb*(0.0+0.34*band*band+0.18*fres+0.55*edge)+vec3(sp)*(0.2+0.6*band);
        gl_FragColor=vec4(col*uK,1.0);
      }` }); },
  /* 共用舞台：透明背景、攝影棚反光、柔光 */
  stage(host,W,H){ const R=X3.renderer(true); R.setSize(W,H); R.setClearColor(0x000000,0); R.toneMappingExposure=1.08;
    const cv=R.domElement; cv.className="c3-cv"; cv.style.width=W+"px"; cv.style.height=H+"px";
    const sc=new THREE.Scene(); sc.environment=X3.env(R);
    sc.add(new THREE.AmbientLight(0xffffff,.55)); const key=new THREE.DirectionalLight(0xffffff,.9); key.position.set(2,4,6); sc.add(key); const rim=new THREE.DirectionalLight(0xC7AEFF,.5); rim.position.set(-4,-1,-3); sc.add(rim);
    const cam=new THREE.PerspectiveCamera(26,W/H,.1,200); return {R,cv,sc,cam,W,H,disp:[sc.environment]}; },
  fit(st,w,h,pad=1.3){ const f=st.cam.fov*Math.PI/360, dH=(h/2)/Math.tan(f), dW=(w/2)/(Math.tan(f)*st.cam.aspect); st.cam.position.set(0,0,Math.max(dH,dW)*pad); st.cam.lookAt(0,0,0); },
  /* 跟原本 spin3d 一樣的手感：拖到哪轉到哪、放開有慣性、一陣子沒碰會慢慢自己轉 */
  spin(st,obj,host,{onTap,auto=false,rx=-6,ry=-18,tick}={}){ let vx=0,vy=0,drag=null,raf=0,alive=true,idle=performance.now(),tw=null; const t0=performance.now(), D=Math.PI/180;
    const apply=()=>{ obj.rotation.x=-rx*D; obj.rotation.y=ry*D; };
    const dispose=()=>{ alive=false; cancelAnimationFrame(raf); try{ st.sc.traverse(o=>{ if(o.geometry) o.geometry.dispose(); const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[]; ms.forEach(m=>{ ["map","alphaMap","emissiveMap"].forEach(k=>m[k]&&m[k]!==X3._g&&m[k].dispose()); m.dispose(); }); }); st.disp.forEach(t=>t&&t.dispose&&t.dispose()); st.R.dispose(); if(st.R.forceContextLoss) st.R.forceContextLoss(); }catch(e){} };
    const loop=now=>{ if(!alive) return; if(!st.cv.isConnected){ dispose(); return; }
      if(tw){ const k=Math.min(1,(now-tw.t0)/tw.d), e=1-Math.pow(1-k,3); rx=tw.fx+(tw.tx-tw.fx)*e; ry=tw.fy+(tw.ty-tw.fy)*e; if(k>=1) tw=null; }
      else if(!drag){ if(Math.abs(vx)+Math.abs(vy)>.03){ vx*=.95; vy*=.95; rx+=vx; ry+=vy; idle=now; } else if(auto&&now-idle>1800) ry+=.25; }
      apply(); if(tick) tick((now-t0)/1000); st.R.render(st.sc,st.cam); raf=requestAnimationFrame(loop); };
    host.style.touchAction="none";
    const down=e=>{ if(!alive||e.target.closest("button")) return; drag={x:e.clientX,y:e.clientY,mv:0}; vx=vy=0; tw=null; try{ host.setPointerCapture(e.pointerId); }catch(_){} };
    const move=e=>{ if(!drag) return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y; drag.mv+=Math.abs(dx)+Math.abs(dy); drag.x=e.clientX; drag.y=e.clientY; ry+=dx*.55; rx-=dy*.45; vy=dx*.55; vx=-dy*.45; idle=performance.now(); };
    const up=()=>{ if(!drag) return; const tap=drag.mv<8; drag=null; idle=performance.now(); if(tap){ vx=vy=0; if(onTap) onTap(); } };
    host.addEventListener("pointerdown",down); host.addEventListener("pointermove",move); host.addEventListener("pointerup",up); host.addEventListener("pointercancel",up);
    apply(); raf=requestAnimationFrame(loop);
    const to=(x,y,d=600)=>{ vx=vy=0; tw={fx:rx,fy:ry,tx:x,ty:y,t0:performance.now(),d}; idle=performance.now(); };
    return { gl:true, flip(){ to(rx,Math.round((ry+180)/180)*180); }, face(){ const n=Math.round(ry/360)*360; rx=-6; ry=n-18; apply(); }, get:()=>({rx,ry}), to, stop(){ if(alive) dispose(); }, get alive(){ return alive; } }; },
  /* 把 CSS 版換成 3D：先照原本的 CSS 顯示，three.js 載好再換掉 */
  swap(host,make){ if(!host||!C3.gl()) return Promise.resolve(null); return loadThree().then(()=>{ if(!host.isConnected) return null; try{ return make(); }catch(e){ console.warn("C3",e); return null; } }).catch(()=>null); },
  /* ---------- 小卡、明信片、拍立得… ---------- */
  async item(host,cid,maxPx){ const o=parseIt(cid); if(!o) return null; const {a,it,p}=o, g=groupOf(a.gid)||{name:"",g:0}, m=MEMBERS[p.mid], C=GRADS[(m?m.g:g.g)%GRADS.length], C2=GRADS[g.g%GRADS.length];
    const w=it.w, h=it.h, r=Math.min(w,h)*.06, th=.06;
    const [TW,TH]=C3.dims(w,h,1024);
    const [ft,bt]=await Promise.all([
      C3.pic(PCI[`ph|${a.id}|${p.id}|f`],TW,TH,(x,W,H)=>{ C3.grad(x,W,H,C[0],C[1]); const R0=Math.min(W,H)*.2; x.fillStyle="rgba(255,255,255,.28)"; x.beginPath(); x.arc(W/2,H*.42,R0,0,7); x.fill();
        C3.txt(x,m?ini(m.name):ini(g.name),W/2,H*.42,`700 ${R0*1.05}px ${SANS}`,"#fff"); C3.txt(x,m?m.name:g.name,W/2,H*.68,`700 ${Math.min(W,H)*.09}px ${SANS}`,"#fff",W*.86); C3.txt(x,it.name,W/2,H*.76,`500 ${Math.min(W,H)*.055}px ${SANS}`,"rgba(255,255,255,.85)",W*.86); }),
      C3.pic(PCI[`ph|${a.id}|${p.id}|b`]||PCI[`ib|${a.id}|${it.id}`],TW,TH,(x,W,H)=>{ C3.grad(x,W,H,C2[0],C2[1]); C3.txt(x,g.name,W/2,H*.46,`700 ${Math.min(W,H)*.1}px ${SERIF}`,"#fff",W*.86); C3.txt(x,a.title,W/2,H*.56,`500 ${Math.min(W,H)*.055}px ${SANS}`,"rgba(255,255,255,.85)",W*.86); }) ]);
    if(!host.isConnected){ ft.dispose(); bt.dispose(); return null; }
    const z=(typeof ZM==="function"?ZM():1)||1, VW=Math.round(Math.min(innerWidth/z*.94,420)), VH=Math.round(Math.min(innerHeight/z*.56,(maxPx||250)*1.75));
    const st=C3.stage(host,VW,VH), obj=new THREE.Group(); st.sc.add(obj); st.disp.push(ft,bt);
    const card=(tex,back)=>{ const mesh=new THREE.Mesh(C3.plane(w,h,r),new THREE.MeshPhysicalMaterial({map:tex,roughness:.42,metalness:0,clearcoat:.7,clearcoatRoughness:.12,envMapIntensity:.32})); mesh.position.z=back?-th/2-.001:th/2+.001; if(back) mesh.rotation.y=Math.PI; return mesh; };
    obj.add(card(ft,false),card(bt,true));
    const edge=new THREE.Mesh(new THREE.ExtrudeGeometry(C3.shape(w,h,r),{depth:th,bevelEnabled:false,curveSegments:10}),[new THREE.MeshBasicMaterial({visible:false}),new THREE.MeshStandardMaterial({color:p.sp?0xF2ECFF:0xF4F1F6,roughness:.45,metalness:p.sp?.5:0,envMapIntensity:1})]);   /* 只畫側邊（厚度），正反面交給照片那兩片，才不會互相閃 */ edge.position.z=-th/2; obj.add(edge);
    let holo=null; if(p.sp){ holo=C3.holo(.42); [false,true].forEach(b=>{ const hm=new THREE.Mesh(C3.plane(w,h,r),holo); hm.position.z=b?-th/2-.003:th/2+.003; if(b) hm.rotation.y=Math.PI; obj.add(hm); }); }
    C3.fit(st,w,h,1.32);
    host.querySelectorAll(".s3-obj").forEach(e=>e.style.display="none"); host.appendChild(st.cv); host.classList.add("c3-on");
    return C3.spin(st,obj,host,{rx:-6,ry:-18,tick:t=>{ if(holo) holo.uniforms.uT.value=t; }}); },
  /* 卡冊、拆專輯看單張：換掉原本的 CSS 版（ui.s3） */
  upItem(host,cid,maxPx,after){ const old=ui.s3; C3.swap(host,()=>C3.item(host,cid,maxPx)).then(api=>{ if(!api) return; if(ui.s3!==old||!host.isConnected){ api.stop(); return; } if(old) old.stop(); ui.s3=api; if(after) after(api); }); },
  /* ---------- 專輯 ---------- */
  async album(host,a,v,{onTap}={}){ const g=groupOf(a.gid)||{name:"",g:0}, C=GRADS[g.g%GRADS.length], sp=v.spine||C[0];
    const w=v.w, h=v.h, t=Math.max(.35,v.t), cvT=Math.min(.14,t*.12);
    const [TW,TH]=C3.dims(w,h,1024), trk=[a.title,"Intro","Midnight Call","Every Moment","Outro"];
    const [cov,bk]=await Promise.all([
      C3.pic(PCI[`vc|${a.id}|${v.id}`],TW,TH,(x,W,H)=>{ C3.grad(x,W,H,C[0],C[1]); const U=Math.min(W,H); C3.txt(x,a.ord,W*.08,H*.08,`600 ${U*.045}px ${SANS}`,"rgba(255,255,255,.85)",W*.8,"left");
        C3.txt(x,g.name,W/2,H*.44,`800 ${U*.13}px ${SERIF}`,"#fff",W*.86); C3.txt(x,a.title,W/2,H*.55,`italic 500 ${U*.07}px ${SERIF}`,"rgba(255,255,255,.92)",W*.86);
        x.strokeStyle="rgba(255,255,255,.7)"; x.lineWidth=U*.004; const vw=Math.min(W*.5,x.measureText(v.name).width+U*.12); X3.rr(x,W/2-vw/2,H*.83,vw,U*.07,U*.035); x.stroke(); C3.txt(x,v.name,W/2,H*.83+U*.035,`600 ${U*.038}px ${SANS}`,"#fff",vw); }),
      C3.pic(PCI[`vb|${a.id}|${v.id}`],TW,TH,(x,W,H)=>{ C3.grad(x,W,H,C[1],C[0]); const U=Math.min(W,H); C3.txt(x,g.name,W*.1,H*.12,`800 ${U*.075}px ${SERIF}`,"#fff",W*.8,"left"); C3.txt(x,`${a.ord}・${v.name}`,W*.1,H*.19,`500 ${U*.04}px ${SANS}`,"rgba(255,255,255,.85)",W*.8,"left");
        trk.forEach((s,i)=>C3.txt(x,`${String(i+1).padStart(2,"0")}  ${i===0?"[TITLE] ":""}${s}`,W*.1,H*(.32+i*.075),`500 ${U*.042}px ${SANS}`,"rgba(255,255,255,.92)",W*.8,"left"));
        x.fillStyle="#fff"; x.fillRect(W*.62,H*.82,W*.28,H*.1); x.fillStyle="#111"; for(let i=0,X=W*.635;X<W*.88;i++){ const bw=U*(.003+((i*7)%5)*.0018); x.fillRect(X,H*.835,bw,H*.07); X+=bw+U*.004; } }) ]);
    if(!host.isConnected){ cov.dispose(); bk.dispose(); return null; }
    const spT=X3.ctex(128,Math.round(128*h/t),(x,W,H)=>{ x.fillStyle=sp; x.fillRect(0,0,W,H); x.save(); x.translate(W/2,H/2); x.rotate(-Math.PI/2); C3.txt(x,`${g.name}・${a.title}・${v.name}`,0,0,`700 ${W*.42}px ${SANS}`,"#fff",H*.9); x.restore(); });
    const inT=X3.ctex(512,Math.round(512*h/w),(x,W,H)=>{ const gr=x.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.7); gr.addColorStop(0,"#FFFFFF"); gr.addColorStop(.5,C[0]); gr.addColorStop(1,C[1]); x.fillStyle=gr; x.fillRect(0,0,W,H); });
    const z=(typeof ZM==="function"?ZM():1)||1, VW=Math.round(innerWidth/z), VH=Math.round(Math.min(innerHeight/z*.62,640));
    const st=C3.stage(host,VW,VH), obj=new THREE.Group(); st.sc.add(obj); st.disp.push(cov,bk,spT,inT);
    const paper=new THREE.MeshStandardMaterial({color:X3.C("#F3EEE6"),roughness:.85,envMapIntensity:.5}), gloss=(map)=>new THREE.MeshPhysicalMaterial({map,roughness:.3,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:.85}), plain=new THREE.MeshPhysicalMaterial({color:X3.C(sp),roughness:.35,clearcoat:.6,envMapIntensity:.7});
    /* 內頁（盒身）：+x 右側紙邊、-x 書背、上下紙邊、+z 裡面那頁、-z 封底 */
    const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,t-cvT),[paper,gloss(spT),paper,paper,new THREE.MeshStandardMaterial({map:inT,roughness:.6,emissive:new THREE.Color(0xffffff),emissiveMap:inT,emissiveIntensity:0}),gloss(bk)]);
    body.position.z=-cvT/2; obj.add(body);
    /* 封面：以書背那邊當軸，翻開 */
    const hinge=new THREE.Group(); hinge.position.set(-w/2,0,(t-cvT)/2); obj.add(hinge);
    const cover=new THREE.Mesh(new THREE.BoxGeometry(w,h,cvT),[plain,plain,plain,plain,gloss(cov),new THREE.MeshStandardMaterial({color:X3.C("#FBF8F4"),roughness:.7})]); cover.position.set(w/2,0,cvT/2); hinge.add(cover);
    /* 收縮膜 */
    const wrap=new THREE.Mesh(new THREE.BoxGeometry(w+.08,h+.08,t+.08),new THREE.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.14,roughness:.04,metalness:0,clearcoat:1,clearcoatRoughness:0,envMapIntensity:2.4,depthWrite:false})); obj.add(wrap);
    /* 打開時裡面的光 */
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:X3.glowTex(),color:X3.C(C[0]),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false})); glow.scale.set(w*2.4,h*2.4,1); glow.position.z=t/2+.2; obj.add(glow);
    const pl=new THREE.PointLight(X3.C(C[0]),0,Math.max(w,h)*3); pl.position.set(0,0,t/2+2); obj.add(pl);
    C3.fit(st,Math.hypot(w,t)*1.05,h,1.75); const camZ=st.cam.position.z;
    host.querySelectorAll(".ab-box").forEach(e=>e.style.display="none"); host.appendChild(st.cv); host.classList.add("c3-on");
    let opening=null;
    const api=C3.spin(st,obj,host,{auto:true,rx:-12,ry:-28,onTap,tick:()=>{ if(!opening) return; const k=Math.max(0,Math.min(1,(performance.now()-opening)/1050)), e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
      const wk=Math.min(1,k*3); wrap.material.opacity=.14*(1-wk); wrap.scale.setScalar(1+wk*.08);
      const ck=Math.max(0,Math.min(1,(k-.15)/.85)), ce=1-Math.pow(1-ck,3); hinge.rotation.y=-ce*Math.PI*.9;
      glow.material.opacity=ce*.95; glow.scale.set(w*(2.4+ce*1.2),h*(2.4+ce*1.2),1); pl.intensity=ce*2.2; body.material[4].emissiveIntensity=ce*.55; obj.position.x=ce*w*.42; st.cam.position.z=camZ*(1+ce*.5); }});
    api.open=()=>{ const {ry}=api.get(); api.to(8,Math.round(ry/360)*360-10,500); opening=performance.now()+120; };
    return api; },
  upAlbum(host,a,v,st0,onTap){ C3.swap(host,()=>C3.album(host,a,v,{onTap})).then(api=>{ if(!api) return; const st=ui.ab; if(st!==st0||st.open||!host.isConnected){ api.stop(); return; } if(st.spin) st.spin.stop(); st.spin=api; st.gl=api; }); },
};

/* =========================================================
   應援餐車 3D
   ========================================================= */
const TRUCK_PAL=[{n:"珍珠白",body:"#F2EEE8",trim:"#D9BC8C",deep:"#2C2733",soft:"#FBF8F3"},{n:"玫瑰霧",body:"#E7C2C6",trim:"#D2A77E",deep:"#4A2E36",soft:"#F8ECEC"},{n:"香檳",body:"#E6D5B5",trim:"#B48E5C",deep:"#3B3022",soft:"#F7F0E2"},
  {n:"午夜藍",body:"#1F2742",trim:"#D9BC8C",deep:"#141A2E",soft:"#E9ECF5"},{n:"鼠尾草",body:"#B7C4B1",trim:"#C6A271",deep:"#2E3A2C",soft:"#EEF2EB"},{n:"薰衣草",body:"#CBBFE3",trim:"#C9A57A",deep:"#352C4A",soft:"#F1EDF8"}];
/* 裁切框＝餐車上那一格的比例：窗口這側 360×260、另一側大橫幅 340×380、杯套 102×112 */
const TK_IMG_R={banner:360/260,banner2:340/380,sleeve:102/112};
const TRUCK_DECO0=()=>({pal:0,slogan:"",from:"",menu:["","",""],banner:null,banner2:null,sleeve:null,balloons:true,lights:true,flowers:true,ribbon:true});
const TRUCK3D=(()=>{
  let inst=null;   /* 同一時間只有一台在畫（換頁時把畫布搬到新的位置，不重新載入） */
  function photo(x,img,X,Y,W,H,P,r){ X3.rr(x,X,Y,W,H,r); x.fillStyle=P.soft; x.fill(); x.save(); X3.rr(x,X,Y,W,H,r); x.clip();
    if(img){ const s=Math.max(W/img.width,H/img.height), w=img.width*s, h=img.height*s; x.drawImage(img,X+(W-w)/2,Y+(H-h)/2,w,h); }
    else { const g=x.createLinearGradient(X,Y,X+W,Y+H); g.addColorStop(0,P.soft); g.addColorStop(1,P.body); x.fillStyle=g; x.fillRect(X,Y,W,H); x.fillStyle=P.trim; x.globalAlpha=.45; x.beginPath(); x.arc(X+W/2,Y+H*.42,W*.17,0,7); x.fill(); x.beginPath(); x.ellipse(X+W/2,Y+H*1.04,W*.38,H*.34,0,0,7); x.fill(); x.globalAlpha=1; }
    x.restore(); }
  const loadImg=src=>new Promise(res=>{ if(!src){ res(null); return; } const i=newImg(); i.onload=()=>res(i); i.onerror=()=>res(null); i.src=src; });
  async function build(I){ const d=I.deco, P=TRUCK_PAL[d.pal]||TRUCK_PAL[0], my=++I.ver;
    const [ban,ban2,slv]=await Promise.all([loadImg(d.banner),loadImg(d.banner2||d.banner),loadImg(d.sleeve)]);   /* 兩側各自一張（舊的餐車只有一張就兩邊共用） */ if(my!==I.ver||I.dead) return;
    try{ await Promise.race([document.fonts.load(`700 40px "Playfair Display"`),new Promise(r=>setTimeout(r,1200))]); }catch(e){}
    if(I.truck){ I.scene.remove(I.truck); I.truck.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material){ if(o.material.map) o.material.map.dispose(); o.material.dispose(); } }); }
    const g=new THREE.Group(), A=I.anim={balloons:[],glows:[],steam:[]};
    const add=(geo,m,x,y,z,o={})=>{ const me=new THREE.Mesh(geo,m); me.position.set(x,y,z); if(o.rx) me.rotation.x=o.rx; if(o.ry) me.rotation.y=o.ry; if(o.rz) me.rotation.z=o.rz; if(o.s) me.scale.set(...o.s); me.castShadow=o.shadow!==false; me.receiveShadow=true; (o.to||g).add(me); return me; };
    const plane=(w,h,tex,x,y,z,ry=0,o={})=>{ const m=new THREE.MeshPhysicalMaterial({map:tex,roughness:o.rough??.45,clearcoat:o.coat??.3,clearcoatRoughness:.1,transparent:!!o.alpha,alphaTest:o.alpha?.5:0,side:o.ds?THREE.DoubleSide:THREE.FrontSide,envMapIntensity:.5});
      const me=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m); me.position.set(x,y,z); me.rotation.y=ry; if(o.rx!=null){ me.rotation.order="YXZ"; me.rotation.x=o.rx; } me.castShadow=!!o.cast; me.receiveShadow=true; g.add(me); return me; };
    const body=X3.paint(P.body), gold=X3.gold(P.trim), chrome=X3.chrome(), glass=X3.glass(), ink=P.deep;
    const name=d.name||"HAECHU", title=d.title||name, slogan=(d.slogan||"").trim()||"一起加油！", from=(d.from||"").trim()||"粉絲", menu=(d.menu||[]).map(s=>(s||"").trim());
    const M=[menu[0]||`${name} 拿鐵`,menu[1]||"香草可頌",menu[2]||"草莓氣泡飲"];
    // 車身、車頭（車漆）
    add(X3.rbox(3.2,1.9,1.9,.24),body,-.4,1.47,0);
    add(X3.rbox(1.05,1.45,1.86,.3),body,1.62,1.24,0);
    // 金色腰線、鍍鉻保險桿
    add(X3.rbox(3.24,.07,1.93,.03),gold,-.4,1.02,0); add(X3.rbox(1.09,.07,1.89,.03),gold,1.62,1.02,0);
    add(X3.rbox(3.26,.26,1.95,.12),X3.paint(ink,{rough:.4}),-.4,.68,0); add(X3.rbox(1.1,.26,1.9,.12),X3.paint(ink,{rough:.4}),1.62,.68,0);
    add(X3.rbox(.18,.2,1.8,.09),chrome,2.18,.62,0);
    // 車窗（深色玻璃）、車燈
    add(X3.rbox(.06,.62,1.46,.03),glass,2.14,1.58,0,{shadow:false});
    [.94,-.94].forEach(z=>add(X3.rbox(.62,.5,.04,.02),glass,1.6,1.62,z,{shadow:false}));
    [.62,-.62].forEach(z=>{ add(new THREE.CylinderGeometry(.13,.13,.06,32),chrome,2.17,.98,z,{rz:Math.PI/2,shadow:false}); add(new THREE.SphereGeometry(.1,24,16),X3.emit("#FFF6DD",1.1),2.19,.98,z,{s:[.4,1,1],shadow:false}); });
    // 輪子：黑色輪胎＋鍍鉻輪框
    [-1.35,1.55].forEach(x=>[.96,-.96].forEach(z=>{ add(new THREE.CylinderGeometry(.4,.4,.3,40),X3.matte("#1E1C22",.85),x,.4,z,{rx:Math.PI/2}); add(new THREE.CylinderGeometry(.24,.24,.32,32),chrome,x,.4,z,{rx:Math.PI/2}); add(new THREE.CylinderGeometry(.08,.08,.34,20),gold,x,.4,z,{rx:Math.PI/2}); }));
    // 出餐窗口（+z）
    add(X3.rbox(1.6,.94,.06,.05),gold,-.78,1.6,.95);
    plane(1.46,.8,X3.ctex(320,176,(x,w,h)=>{ const gr=x.createLinearGradient(0,0,0,h); gr.addColorStop(0,"#3A3038"); gr.addColorStop(1,"#1C171D"); x.fillStyle=gr; x.fillRect(0,0,w,h); x.fillStyle="rgba(255,226,170,.85)"; for(let i=0;i<4;i++){ x.beginPath(); x.arc(40+i*80,26,7,0,7); x.fill(); } x.fillStyle="rgba(255,255,255,.07)"; x.fillRect(0,h*.55,w,3); }),-.78,1.6,.985,0,{coat:.6});
    add(X3.rbox(1.78,.06,.42,.03),X3.paint("#EFE6DA",{rough:.2}),-.78,1.15,1.13);
    // 杯子（杯套照片）
    const sleeveT=X3.ctex(256,128,(x,w,h)=>{ x.fillStyle=P.soft; x.fillRect(0,0,w,h); photo(x,slv,w*.3,8,w*.4,h-16,P,10); x.fillStyle=P.trim; x.fillRect(0,0,w,6); x.fillRect(0,h-6,w,6); });
    [-1.3,-1.02,-.74].forEach(cx=>{ add(new THREE.CylinderGeometry(.075,.058,.24,32),X3.paint("#FBFAF7",{rough:.25}),cx,1.31,1.13);
      const sl=add(new THREE.CylinderGeometry(.078,.072,.1,32,1,true),new THREE.MeshPhysicalMaterial({map:sleeveT,roughness:.5,clearcoat:.2}),cx,1.3,1.13); sl.rotation.y=Math.PI/2;
      add(new THREE.CylinderGeometry(.082,.082,.025,32),X3.paint(ink,{rough:.3}),cx,1.44,1.13);
      for(let k=0;k<2;k++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:X3.glowTex(),color:0xffffff,transparent:true,opacity:0,depthWrite:false})); sp.position.set(cx,1.52,1.13); sp.scale.set(.18,.18,1); g.add(sp); A.steam.push({sp,cx,ph:Math.random()*3+k*1.5}); } });
    // 遮陽棚（布紋條紋）
    { const t=X3.ctex(640,200,(x,w,h)=>{ const n=9, sw=w/n; for(let i=0;i<n;i++){ x.fillStyle=i%2?P.soft:P.body; x.fillRect(i*sw,0,sw,150); x.beginPath(); x.arc(i*sw+sw/2,148,sw/2,0,Math.PI); x.fill(); } x.fillStyle=P.trim; x.fillRect(0,0,w,8); });
      plane(1.94,.64,t,-.78,2.15,1.22,0,{alpha:1,ds:1,rx:-Math.PI/2+.5,cast:1,rough:.85,coat:0}); add(new THREE.CylinderGeometry(.018,.018,1.96,12),gold,-.78,2.42,.96,{rz:Math.PI/2}); }
    // 燈串（暖白燈泡）
    /* 燈串：一條電線垂下來，每顆燈泡各自用短線吊著，會各自擺動 */
    if(d.lights){ A.swing=A.swing||[]; const wm=X3.paint("#3A2E2A"), pts=[];
      for(let i=0;i<10;i++){ const u=i/9, x=-1.7+u*1.84, y=1.98-Math.sin(u*Math.PI)*.1; pts.push(new THREE.Vector3(x,y,1.5));
        const pg=new THREE.Group(); pg.position.set(x,y,1.5); g.add(pg);
        add(new THREE.CylinderGeometry(.005,.005,.09,6),wm,0,-.045,0,{shadow:false,to:pg});
        add(new THREE.SphereGeometry(.042,16,12),X3.emit("#FFE3A8",2.2),0,-.12,0,{shadow:false,to:pg});
        const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:X3.glowTex(),color:X3.C("#FFD58A"),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})); sp.position.set(0,-.12,0); sp.scale.set(.18,.18,1); pg.add(sp); A.glows.push({sp,ph:i*.9});
        A.swing.push({g:pg,k:2.2+(i%3)*.25,a:0,v:0,b:0,vb:0,ph:i*.7,bulb:1}); }
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.006,6),wm)); }
    // 側面直式橫幅（+z）：照片＋標語＋From.
    { const t=X3.ctex(440,500,(x,w,h)=>{ x.fillStyle=P.soft; X3.rr(x,0,0,w,h,26); x.fill(); x.strokeStyle=P.trim; x.lineWidth=6; X3.rr(x,14,14,w-28,h-28,20); x.stroke(); photo(x,ban,40,40,w-80,260,P,14);
        x.fillStyle=ink; x.textAlign="center"; x.font=`600 40px ${SANS}`; x.fillText(slogan.slice(0,10),w/2,358); if(slogan.length>10) x.fillText(slogan.slice(10,20),w/2,406);
        x.fillStyle=P.trim; x.font=`italic 600 28px ${SERIF}`; x.fillText(`From. ${from}`.slice(0,22),w/2,458); });
      plane(.86,.98,t,.62,1.5,.962); }
    // 另一側大橫幅（-z）
    { const t=X3.ctex(1200,480,(x,w,h)=>{ const gr=x.createLinearGradient(0,0,w,0); gr.addColorStop(0,P.soft); gr.addColorStop(1,"#FFFFFF"); x.fillStyle=gr; X3.rr(x,0,0,w,h,34); x.fill(); x.strokeStyle=P.trim; x.lineWidth=7; X3.rr(x,18,18,w-36,h-36,26); x.stroke();
        photo(x,ban2,50,50,340,h-100,P,18); x.textAlign="left"; x.fillStyle=ink; x.font=`700 104px ${SERIF}`; let nm=name; while(x.measureText(nm).width>w-500&&nm.length>1) nm=nm.slice(0,-1); x.fillText(nm,440,186);
        x.fillStyle=P.trim; x.fillRect(444,214,120,4); x.fillStyle=ink; x.font=`600 56px ${SANS}`; x.fillText(slogan.slice(0,13),442,300); x.fillStyle=P.trim; x.font=`italic 600 38px ${SERIF}`; x.fillText(`From. ${from}`.slice(0,26),444,386); });
      plane(2.72,1.09,t,-.42,1.5,-.962,Math.PI); }
    // 車尾菜單（黑板＋金字）
    { const t=X3.ctex(560,460,(x,w,h)=>{ x.fillStyle="#211D24"; X3.rr(x,0,0,w,h,26); x.fill(); x.strokeStyle=P.trim; x.lineWidth=5; X3.rr(x,16,16,w-32,h-32,18); x.stroke();
        x.fillStyle=P.trim; x.textAlign="center"; x.font=`italic 700 64px ${SERIF}`; x.fillText("Menu",w/2,100); x.fillRect(w/2-50,122,100,3);
        x.textAlign="left"; x.fillStyle="#F4EDE2"; M.forEach((s,i)=>{ let f=38; x.font=`500 ${f}px ${SANS}`; while(f>20&&x.measureText(s).width>w-150){ f-=2; x.font=`500 ${f}px ${SANS}`; } while(s.length>1&&x.measureText(s).width>w-150) s=s.slice(0,-1);   /* 字多就自動縮小，塞得下黑板 */ x.fillText(s,60,206+i*80); x.font=`500 38px ${SANS}`; x.fillStyle=P.trim; x.beginPath(); x.arc(w-66,194+i*80,7,0,7); x.fill(); x.fillStyle="#F4EDE2"; }); });
      plane(1.38,1.12,t,-2.01,1.5,0,-Math.PI/2,{coat:.7}); }
    // 車頂招牌（金框＋襯線字）
    [-1.05,.25].forEach(x=>add(new THREE.CylinderGeometry(.03,.03,.34,16),gold,x,2.58,0));
    add(X3.rbox(2.02,.5,.14,.07),gold,-.4,2.94,0);
    { const t=X3.ctex(1000,220,(x,w,h)=>{ x.fillStyle=ink; X3.rr(x,0,0,w,h,60); x.fill(); x.fillStyle=P.trim; x.textAlign="center"; x.textBaseline="middle"; let s=`${title} Café`; x.font=`italic 700 104px ${SERIF}`; while(x.measureText(s).width>w-80){ const f=parseInt(x.font.match(/(\d+)px/)[1])-6; x.font=`italic 700 ${f}px ${SERIF}`; } x.fillText(s,w/2,h/2+6); });
      plane(1.9,.42,t,-.4,2.94,.073,0,{coat:.8}); plane(1.9,.42,t,-.4,2.94,-.073,Math.PI,{coat:.8}); }
    // 氣球（珍珠金屬感）
    if(d.balloons){ const ax=-1.65, ay=2.42; [[P.body,-1.75,3.55,.25],[P.trim,-2.05,3.25,-.2],["#F7F3EC",-1.5,3.15,-.45]].forEach(([c,x,y,z],i)=>{ const bg=new THREE.Group(); bg.position.set(ax,ay,0); g.add(bg); x-=ax; y-=ay;
        add(new THREE.SphereGeometry(.27,40,28),new THREE.MeshPhysicalMaterial({color:X3.C(c),metalness:.55,roughness:.18,clearcoat:1,clearcoatRoughness:.05}),x,y,z,{s:[1,1.15,1],to:bg});
        add(new THREE.ConeGeometry(.045,.07,12),X3.paint(c),x,y-.33,z,{to:bg,rx:Math.PI});
        const pts=[new THREE.Vector3(x,y-.36,z),new THREE.Vector3(x/2-.05,(y-.36)/2,z/2),new THREE.Vector3(0,0,0)];
        bg.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,.006,6),X3.gold(P.trim,.4)));
        A.balloons.push({g:bg,ph:i*1.7,a:0,v:0,b:0,vb:0,k:1.6+i*.35}); }); }
    // 花（白玫瑰＋霧粉）
    if(d.flowers){ const fl=(x,y,z,c)=>{ for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; add(new THREE.SphereGeometry(.065,16,12),X3.paint(c,{rough:.5}),x,y+Math.sin(a)*.075,z+Math.cos(a)*.075,{s:[.55,1,1]}); } add(new THREE.SphereGeometry(.05,16,12),X3.paint(P.trim,{rough:.4}),x+.02,y,z); };
      fl(2.29,.66,.55,"#FBF6F0"); fl(2.29,.66,-.55,P.body); fl(2.29,.7,.06,"#F3D9DC"); }
    // 緞帶（緞面）
    if(d.ribbon){ const m=new THREE.MeshPhysicalMaterial({color:X3.C(P.trim),roughness:.3,metalness:.3,clearcoat:.6}); [1,-1].forEach(s=>{ const r=add(new THREE.ConeGeometry(.13,.26,4),m,.62+s*.13,.7,1.03,{rz:s*Math.PI/2,s:[1,1,.35]}); });
      add(new THREE.SphereGeometry(.055,16,12),m,.62,.7,1.04); }
    g.position.set(-.1,0,0); I.truck=new THREE.Group(); I.truck.add(g); I.scene.add(I.truck); I.truck.rotation.y=I.yaw; I.truck.position.x=I.drive?-9:0; if(I.drive) I.dt0=performance.now(); }
  async function mount(el,deco,o={}){
    if(inst&&!inst.dead){ el.appendChild(inst.R.domElement); inst.el=el; if(o.drive) { inst.drive=true; inst.dt0=performance.now(); } set(deco); resume(); return inst; }
    let T; try{ T=await loadThree(); }catch(e){ el.innerHTML=`<p class="trk-fail">3D 載入失敗，請重新整理</p>`; return null; }
    if(!el.isConnected) return null;
    const R=X3.renderer(); R.shadowMap.enabled=true; R.shadowMap.type=THREE.PCFSoftShadowMap;
    const scene=new THREE.Scene(), cam=new THREE.PerspectiveCamera(30,1,.1,100); scene.environment=X3.env(R);
    const hemi=new THREE.HemisphereLight(0xFFF8F0,0x3A3238,.35); scene.add(hemi);
    const key=new THREE.DirectionalLight(0xFFF4E8,1.15); key.position.set(4,8,6); key.castShadow=true; key.shadow.mapSize.set(2048,2048); Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:1,far:25}); key.shadow.radius=5; key.shadow.bias=-.0005; scene.add(key);
    const rim=new THREE.DirectionalLight(0xE8EEFF,.45); rim.position.set(-6,4,-5); scene.add(rim);
    // 地面：只留柔和的影子（背景用頁面的顏色）＋一圈淡淡的展示台
    const sh=new THREE.Mesh(new THREE.CircleGeometry(4.2,64),new THREE.ShadowMaterial({opacity:.22})); sh.rotation.x=-Math.PI/2; sh.receiveShadow=true; scene.add(sh);
    const cst=X3.ctex(256,256,(x,w,h)=>{ const gr=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2); gr.addColorStop(0,"rgba(0,0,0,.55)"); gr.addColorStop(.55,"rgba(0,0,0,.22)"); gr.addColorStop(1,"rgba(0,0,0,0)"); x.fillStyle=gr; x.fillRect(0,0,w,h); });
    const contact=new THREE.Mesh(new THREE.PlaneGeometry(5.6,3.3),new THREE.MeshBasicMaterial({map:cst,transparent:true,depthWrite:false})); contact.rotation.x=-Math.PI/2; contact.position.y=.005; scene.add(contact);
    inst={R,scene,cam,el,contact,deco:{...TRUCK_DECO0(),...deco},ver:0,yaw:-.55,pitch:.3,dist:12.6,vy:0,idle:0,dead:false,paused:false,drive:!!o.drive,dt0:performance.now(),anim:{balloons:[],glows:[],steam:[]}};
    el.appendChild(R.domElement); R.domElement.className="trk-cv";
    // 拖曳旋轉、兩指縮放；放開後慢慢自己轉
    const cv=R.domElement, ptr=new Map(); let pinch0=0, dist0=12.6;
    cv.addEventListener("pointerdown",e=>{ try{ cv.setPointerCapture(e.pointerId); }catch(_){} ptr.set(e.pointerId,{x:e.clientX,y:e.clientY}); if(ptr.size===2){ const [a,b]=[...ptr.values()]; pinch0=Math.hypot(a.x-b.x,a.y-b.y); dist0=inst.dist; } inst.idle=0; });
    cv.addEventListener("pointermove",e=>{ const p=ptr.get(e.pointerId); if(!p) return; const dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
      if(ptr.size===1){ inst.yaw+=dx*.011; inst.vy=dx*.011; inst.pitch=Math.max(.05,Math.min(.62,inst.pitch+dy*.006)); }
      else if(ptr.size===2){ const [a,b]=[...ptr.values()], dd=Math.hypot(a.x-b.x,a.y-b.y); if(pinch0) inst.dist=Math.max(8,Math.min(18,dist0*pinch0/dd)); } inst.idle=0; });
    const up=e=>{ ptr.delete(e.pointerId); if(ptr.size<2) pinch0=0; }; cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up);
    cv.addEventListener("wheel",e=>{ e.preventDefault(); inst.dist=Math.max(8,Math.min(18,inst.dist*(1+e.deltaY*.001))); },{passive:false});
    inst.ptr=ptr; await build(inst); loop(); return inst; }
  function set(deco){ if(!inst) return; const nd={...TRUCK_DECO0(),...deco}; if(JSON.stringify(nd)===JSON.stringify(inst.deco)&&inst.truck) return; inst.deco=nd; build(inst); }
  function resume(){ if(inst&&inst.paused){ inst.paused=false; loop(); } }
  function loop(){ const I=inst; if(!I||I.dead) return; let last=performance.now();
    const f=now=>{ if(I.dead||I!==inst) return; const cv=I.R.domElement; if(!cv.isConnected){ I.paused=true; return; }
      const dt=Math.min(.05,(now-last)/1000); last=now; const t=now/1000;
      const w=cv.clientWidth||I.el.clientWidth, h=cv.clientHeight||I.el.clientHeight; if(w&&h&&(I._w!==w||I._h!==h)){ I._w=w; I._h=h; I.R.setSize(w,h,false); I.cam.aspect=w/h; I.cam.fov=w/h<.8?36:28; I.cam.updateProjectionMatrix(); }
      if(!I.ptr.size){ I.idle+=dt; I.yaw+=I.vy; I.vy*=.93; if(I.idle>2.5) I.yaw+=dt*.22; }
      const wv=dt>0?(I.yaw-(I._py??I.yaw))/dt:0; I._py=I.yaw; I._av=(I._av||0)*.8+wv*.2; const acc=dt>0?(I._av-(I._pav||0))/dt:0; I._pav=I._av;
      let ax=0; if(I.truck){ const px=I.truck.position.x, vx=dt>0?(px-(I._px??px))/dt:0; ax=dt>0?(vx-(I._vx||0))/dt:0; I._px=px; I._vx=vx; }
      const spring=(s,ta,tb)=>{ s.v+=((ta-s.a)*s.k*s.k*9-s.v*2.2)*dt; s.a+=s.v*dt; s.vb+=((tb-s.b)*s.k*s.k*9-s.vb*2.2)*dt; s.b+=s.vb*dt; };
      if(I.contact&&I.truck){ I.contact.rotation.z=I.yaw; I.contact.position.x=I.truck.position.x; }
      if(I.truck){ I.truck.rotation.y=I.yaw;
        if(I.drive){ const u=Math.min(1,(now-I.dt0)/2200), e=1-Math.pow(1-u,3); I.truck.position.x=-9*(1-e); I.truck.position.y=u<1?Math.abs(Math.sin(u*20))*.03*(1-u):0; if(u>=1) I.drive=false; } }
      const ty=1.45; I.cam.position.set(0,ty+Math.sin(I.pitch)*I.dist,Math.cos(I.pitch)*I.dist); I.cam.lookAt(0,ty-.05,0);
      I.anim.balloons.forEach(b=>{ if(b.a==null){ b.g.position.y=Math.sin(t*1.3+b.ph)*.05; return; } const ta=Math.max(-.7,Math.min(.7,-I._av*.16-acc*.012)), tb=Math.max(-.5,Math.min(.5,-ax*.03));
        spring(b,ta,tb); b.g.rotation.x=b.a+Math.sin(t*.9+b.ph)*.03; b.g.rotation.z=b.b+Math.sin(t*1.1+b.ph)*.03; });
      (I.anim.swing||[]).forEach(s=>{ /* 往外甩（轉越快甩越開）＋轉向時往後拖＋開車時前後晃 */
        const ta=Math.max(-1,Math.min(.35,-I._av*I._av*.35-Math.abs(acc)*.01)), tb=Math.max(-.8,Math.min(.8,acc*.02+I._av*.25+ax*.05));
        spring(s,ta,tb); s.g.rotation.x=s.a+Math.sin(t*1.7+(s.ph||0))*.04; s.g.rotation.z=s.b+Math.sin(t*1.3+(s.ph||0))*.03; });
      I.anim.glows.forEach(gl=>{ const k=.75+.25*Math.sin(t*3+gl.ph); gl.sp.material.opacity=k*.75; gl.sp.scale.setScalar(.15+.06*k); });
      I.anim.steam.forEach(s=>{ const u=((t*.45+s.ph)%1.6)/1.6; s.sp.position.y=1.48+u*.42; s.sp.position.x=s.cx+Math.sin(u*6+s.ph)*.03; s.sp.material.opacity=Math.sin(u*Math.PI)*.3; s.sp.scale.setScalar(.12+u*.18); });
      I.R.render(I.scene,I.cam); requestAnimationFrame(f); };
    requestAnimationFrame(f); }
  function drive(){ if(inst){ inst.drive=true; inst.dt0=performance.now(); } }
  return {mount,set,drive,get inst(){ return inst; }};
})();

/* =========================================================
   應援餐車：資料與規則
   ・粉絲送給「一位藝人」；一個人買，或發起分攤（2～5 人，每人付一樣多）
   ・錢湊齊後：如果這團正在出道／回歸的第一週，馬上送到；不然等下一次回歸那天送到
   ・同一位藝人同一次出道／回歸最多 3 台；送到前藝人看不到（保密），但每天 +100 積分
   ========================================================= */
/* 可以送的人：追蹤的團先排前面，再來其他團、即將出道的新人；自己的團不能送 */
/* 藝人也能送：只能送給正在出道／回歸的藝人（預告中、或出道／回歸一週內），用藝人自己的積分 */
/* 誰出的錢：同一個帳號的粉絲身分和藝人身分分開算（管理員兩邊都有） */
const tkNm=()=>{ const s=session()||{}; return s.role==="artist"&&s.member&&MEMBERS[s.member]?artName(s.member,"feed"):ME.name; };
const tkWho=()=>{ const s=session()||{}; return s.role==="artist"&&s.member?"m:"+s.member:"u:"+myEmail(); };
const tkPaidMe=t=>(t.paid||[]).some(p=>(p.who||"u:"+p.em)===tkWho());
const tkIsArt=()=>{ const s=session()||{}; return s.role==="artist"&&!!s.member&&!!MEMBERS[s.member]; };
const tkBal=()=>tkIsArt()?Math.max(0,(pointsOf(session().member)||{}).net||0):points();
function tkPay(n,why){ if(tkIsArt()){ const mid=session().member, L=S.get(K.ptGrants,[])||[]; L.push({id:"tka_"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),to:"art:"+mid,mid,n:-n,art:1,why,by:"auto",ts:Date.now()}); S.set(K.ptGrants,L.slice(-2000)); } else S.set(K.points,points()-n); }
function artTkTargets(){ const s=session()||{}, own=(MEMBERS[s.member]||{}).group, now=Date.now(), pre=new Set((getMShow().pre||[]).filter(p=>p.day>now).map(p=>p.gid));
  const gs=GROUPS.map(g=>g.id).filter(gid=>gid!==own&&groupOf(gid)&&(pre.has(gid)||grpOccs(gid).some(x=>x<=now&&now-x<=TRUCK_ERA)));
  const ms=gs.flatMap(gid=>grpMembers(gid).filter(id=>MEMBERS[id]&&!MEMBERS[id].official)); const H=tkHidM(); Object.keys(H).forEach(id=>{ if(!ms.includes(id)&&H[id].group!==own&&tkPreOn(id)) ms.push(id); }); return ms; }
function tkTargets(){ if(tkIsArt()) return artTkTargets(); const f=followed(), gs=[...f,...GROUPS.map(g=>g.id).filter(id=>!f.includes(id))].filter(gid=>groupOf(gid)&&!isSelfGid(gid));
  const ms=gs.flatMap(gid=>grpMembers(gid).filter(id=>MEMBERS[id]&&!MEMBERS[id].official)); const H=tkHidM(); Object.keys(H).forEach(id=>{ if(!ms.includes(id)&&!isSelfGid(H[id].group)&&tkPreOn(id)) ms.push(id); }); return ms; }
const tkPreOn=id=>getDebut().some(x=>dbMids(x).includes(id)&&x.annId&&x.status==="pre");   /* 預告還沒發的新人：先保密，不能送 */
/* 收餐車的藝人：也包括「已核准、還沒到出道日」的新人（平常藏起來，餐車要送得到） */
const tkHidM=()=>{ const r=S.get(K.roster,{})||{}, H={}; getDebut().filter(x=>x.status==="pre"&&x.gid).forEach(x=>dbMids(x).forEach(id=>{ const m=(r.members||{})[id]; if(m) H[id]={...m,pre:x.day}; })); return H; };
const tkM=mid=>MEMBERS[mid]||tkHidM()[mid];
const tkG=gid=>groupOf(gid)||((S.get(K.roster,{})||{}).groups||[]).find(g=>g.id===gid);
const TRUCK_PRICE=30000, TRUCK_MAX=3, TRUCK_ERA=7*864e5;
const getTrucks=()=>(S.get(K.trucks,[])||[]).filter(t=>t&&t.id&&tkM(t.mid)&&!t.refunded);
const TRUCK_FUND=3*864e5;   // 分攤湊錢期限 3 天，沒湊滿全部退回（她 10/27 定）
const tkLeftTxt=t=>{ const ms=Math.max(0,(t.ts||0)+TRUCK_FUND-Date.now()), h=Math.floor(ms/36e5); return h>=24?`${Math.floor(h/24)} 天 ${h%24} 小時`:`${h} 小時 ${Math.floor(ms%36e5/6e4)} 分`; };
const tkFunded=t=>(t.paid||[]).length>=(t.shares||1);
function grpOccs(gid){ const L=[], db=getDebut().find(x=>x.gid===gid&&x.day), g0=db?db.day:idTs(gid,/^g/); if(g0) L.push(g0); (getMShow().pre||[]).forEach(p=>{ if(p.gid===gid&&p.day) L.push(p.day); }); const m=getMShow(); [...m.songs,...(m.ended||[])].forEach(s=>{ if(s.gid===gid){ const t=idTs(s.id,/^s/); if(t) L.push(t); } }); return L.sort((a,b)=>a-b); }
/* 什麼時候送到：湊齊時正在出道／回歸第一週 → 馬上；不然等下一次回歸 */
function tkDeliverTs(t){ if(!tkFunded(t)) return 0; const ft=Math.max(...t.paid.map(p=>p.ts||0)), gid=tkM(t.mid)?tkM(t.mid).group:null; if(!gid) return 0;
  const O=grpOccs(gid), prev=O.filter(x=>x<=ft).pop(); if(prev&&ft-prev<=TRUCK_ERA) return ft; return O.find(x=>x>ft)||0; }
const tkDelivered=t=>{ const d=tkDeliverTs(t); return !!d&&d<=Date.now(); };
function tkState(t){ if(!tkFunded(t)) return "fund"; return tkDelivered(t)?"done":"wait"; }
/* 這一次出道／回歸已經有幾台（還沒送到的＋這一次送到的） */
function tkCount(mid){ const gid=tkM(mid).group, O=grpOccs(gid), cur=O.filter(x=>x<=Date.now()).pop()||0;
  return getTrucks().filter(t=>t.mid===mid&&(tkState(t)!=="done"||tkDeliverTs(t)>=cur)).length; }
const tkShare=t=>Math.ceil(TRUCK_PRICE/(t.shares||1));
function tkBuy(deco,mid,shares){ const share=Math.ceil(TRUCK_PRICE/shares); if(tkBal()<share){ toast("積分不夠，先補充積分吧"); return null; }
  if(tkCount(mid)>=TRUCK_MAX){ toast(`${tkM(mid).name} 這次已經有 ${TRUCK_MAX} 台餐車了`); return null; }
  const me=myEmail(), t={id:"tk"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),mid,gid:tkM(mid).group,by:me,byName:tkNm(),shares,deco,ts:Date.now(),paid:[{em:me,who:tkWho(),name:tkNm(),ts:Date.now()}]};
  tkPay(share,`送應援餐車給 ${tkM(mid).name}`); recordSale("truck",{mid,pts:share,label:`應援餐車・${tkM(mid).name}${shares>1?`（${shares} 人分攤）`:""}`});
  S.set(K.trucks,[...(S.get(K.trucks,[])||[]),t]); return t; }
function tkJoin(id){ const L=S.get(K.trucks,[])||[], t=L.find(x=>x.id===id), me=myEmail(); if(!t) return false; if(tkFunded(t)){ toast("已經湊齊了"); return false; }
  if(tkPaidMe(t)){ toast("你已經出過錢了"); return false; } const share=tkShare(t); if(tkBal()<share){ toast("積分不夠，先補充積分吧"); return false; }
  tkPay(share,`一起送應援餐車給 ${tkM(t.mid).name}`); recordSale("truck",{mid:t.mid,pts:share,label:`應援餐車・${tkM(t.mid).name}（分攤）`});
  t.paid.push({em:me,who:tkWho(),name:tkNm(),ts:Date.now()}); S.set(K.trucks,L); return true; }
/* 送到前：藝人每天 +100（每台最多 30 天）。由管理員的手機每天結算一次，不會重複 */
function tkDaily(){ try{ if(!isAdminAcct()||(HB_ON&&HB.ver[K.trucks]==null)) return; const L=S.get(K.ptGrants,[])||[], have=new Set(L.map(g=>g.id)), now=Date.now(); let add=0;
  /* 3 天沒湊滿：每個出錢的人退回，車取消 */
  { const T=S.get(K.trucks,[])||[]; let ch=false; T.forEach(t=>{ if(!t||t.refunded||String(t.id).startsWith("tk_demo")||tkFunded(t)||now<(t.ts||now)+TRUCK_FUND) return; const sh=tkShare(t);
      (t.paid||[]).forEach(p=>{ const id=`tkr_${t.id}_${p.em}`; if(have.has(id)) return; L.push({id,to:p.em,n:sh,why:`應援餐車 3 天沒湊滿，退回`,by:"auto",ts:now}); have.add(id); add++; recordSale("truck",{mid:t.mid,pts:-sh,label:`應援餐車退款・${(tkM(t.mid)||{}).name||""}`}); });
      t.refunded=now; ch=true; }); if(ch) S.set(K.trucks,T); }
  getTrucks().forEach(t=>{ if(!tkFunded(t)) return; const ft=Math.max(...t.paid.map(p=>p.ts||0)), dv=tkDeliverTs(t), end=Math.min(now,dv&&dv>ft?dv:now), em=Object.keys(ACCOUNTS).find(e=>ACCOUNTS[e]&&ACCOUNTS[e].member===t.mid); if(!em) return;
    const days=Math.min(30,calDay(end)-calDay(ft)); for(let i=1;i<=days;i++){ const id=`tk_${t.id}_${i}`; if(have.has(id)) continue; L.push({id,to:em,n:100,why:"有粉絲正在為你準備驚喜",by:"auto",ts:ft+i*864e5}); have.add(id); add++; } });
  if(add) S.set(K.ptGrants,L.slice(-2000)); }catch(e){} }
setTimeout(tkDaily,7000); setInterval(tkDaily,30*60e3);

/* ---------- 粉絲：CORE → 應援餐車 ---------- */
const TK_ST={fund:"集資中",wait:"準備中・等回歸那天送到",done:"已經送到"};
/* 準備中的餐車：自動看下一個日子是出道還是回歸 */
function tkKind(t){ const m=tkM(t.mid), gid=m&&m.group, d=tkDeliverTs(t); if(!gid) return "回歸"; const db=getDebut().find(x=>x.gid===gid&&x.day); if(d&&db&&Math.abs(d-db.day)<864e5) return "出道"; if(!d&&db&&db.day>Date.now()) return "出道"; return "回歸"; }
const tkStTxt=(t,st)=>st==="wait"?`準備中・等${tkKind(t)}那天送到`:TK_ST[st];
function tkDraftDeco(){ const d=ui.tkD; if(!d) return null; const m=tkM(d.mid), g=m&&tkG(m.group); return {...d.deco,name:m?m.name:"",title:g?g.name:""}; }
function tkDecoOf(t){ const m=tkM(t.mid), g=m&&tkG(m.group); return {...TRUCK_DECO0(),...(t.deco||{}),name:m?m.name:"",title:g?g.name:""}; }
function viewTruckFan(){ const me=myEmail(), f=followed(), all=getTrucks(), mine=all.filter(tkPaidMe), open=all.filter(t=>f.includes(t.gid)&&!tkFunded(t)&&!tkPaidMe(t)&&!isSelfGid(t.gid));
  const d=ui.tkD, view=!d&&ui.tkView&&all.find(t=>t.id===ui.tkView)||(!d&&mine[mine.length-1])||null;
  const row=(t,act)=>{ const st=tkState(t), m=tkM(t.mid); return `<button class="trk-row ${ui.tkView===t.id&&!d?"on":""}" data-a="tkView" data-v="${t.id}"><span class="trk-dot" style="background:${(TRUCK_PAL[(t.deco||{}).pal]||TRUCK_PAL[0]).body}"></span><span class="trk-ri"><b>${esc(m.name)}</b><small>From. ${esc((t.deco&&t.deco.from)||t.byName||"粉絲")}・${t.shares>1?`${t.paid.length}／${t.shares} 人`:"一個人送"}・${tkStTxt(t,st)}${st==="fund"?`・剩 ${tkLeftTxt(t)}`:""}</small></span>${act?`<span class="trk-join" data-a="tkJoin" data-v="${t.id}">${fmt(tkShare(t))} 一起出</span>`:""}</button>`; };
  ui._tkDeco=d?tkDraftDeco():view?tkDecoOf(view):{...TRUCK_DECO0(),name:"HAECHU",title:"HAECHU"};
  return coreHead("應援餐車")+`<main class="page trk">
    <div class="trk-stage" id="tk3d"><span class="trk-load">載入中…</span></div>
    ${d?tkEditor(d):`${points()<=0&&session().role==="fan"?`<button class="btn btn-soft btn-block trk-new" disabled>訂一台應援餐車・${fmt(TRUCK_PRICE)} 積分</button>`:`<button class="btn btn-main btn-block trk-new" data-a="tkNew">訂一台應援餐車・${fmt(TRUCK_PRICE)} 積分</button>`}
      ${open.length?`<div class="section-h">一起出錢</div><section class="card trk-list">${open.map(t=>row(t,true)).join("")}</section>`:""}
      <div class="section-h">我的餐車</div>${mine.length?`<section class="card trk-list">${mine.slice().reverse().map(t=>row(t,false)).join("")}</section>`:`<p class="me-none">還沒有餐車</p>`}`}
  </main>`; }
function tkEditor(d){ const ms=tkTargets(), D=d.deco, share=Math.ceil(TRUCK_PRICE/d.shares);
  const tog=(k,l)=>`<button class="chip ${D[k]?"on":""}" data-a="tkTog" data-v="${k}">${l}</button>`;
  return `<section class="card trk-ed">
    <span class="fld-lab">送給誰</span><div class="chips wrap">${ms.length?ms.map(id=>`<button class="chip ${d.mid===id?"on":""}" data-a="tkMid" data-v="${id}">${esc(tkM(id).name)}${tkM(id).pre?` <small>出道 ${mdTxt(tkM(id).pre)}</small>`:""}</button>`).join(""):`<p class="me-none">先加入一個社群</p>`}</div>
    <span class="fld-lab">車身</span><div class="trk-sw">${TRUCK_PAL.map((p,i)=>`<button class="${D.pal===i?"on":""}" data-a="tkPal" data-v="${i}" aria-label="${p.n}" style="background:${p.body};border-color:${p.trim}"></button>`).join("")}</div>
    <span class="fld-lab">橫幅</span><div class="trk-ph"><span class="trk-pbs">${[["banner","窗口這側"],["banner2","另一側"]].map(([k,l])=>`<button class="trk-pb ${k} ${D[k]?"has":""}" data-a="tkImg" data-v="${k}" aria-label="${l}照片">${D[k]?`<img src="${D[k]}" alt="">`:`＋<small>${l}</small>`}</button>`).join("")}</span><label class="field"><input id="tkSlogan" maxlength="20" placeholder="輸入文字" value="${esc(D.slogan)}"></label></div>
    <span class="fld-lab">菜單</span>${[0,1,2].map(i=>`<label class="field trk-mi"><input id="tkM${i}" maxlength="24" placeholder="輸入文字" value="${esc(D.menu[i]||"")}"></label>`).join("")}
    <span class="fld-lab">杯套</span><div class="trk-ph"><button class="trk-pb ${D.sleeve?"has":""}" data-a="tkImg" data-v="sleeve">${D.sleeve?`<img src="${D.sleeve}" alt="">`:"＋ 照片"}</button></div>
    <span class="fld-lab">裝飾</span><div class="chips wrap">${tog("balloons","氣球")}${tog("lights","燈串")}${tog("flowers","花")}${tog("ribbon","緞帶")}</div>
    <span class="fld-lab">From.</span><label class="field"><input id="tkFrom" maxlength="16" placeholder="輸入文字" value="${esc(D.from)}"></label>
    <span class="fld-lab">付款</span><div class="ls-seg trk-sh"><button data-a="tkShares" data-v="-1">－</button><button class="on">${d.shares>1?`${d.shares} 人分攤`:"一個人買"}</button><button data-a="tkShares" data-v="1">＋</button></div>
    <div class="ls-btns"><button class="btn btn-soft" data-a="tkCancel">取消</button><button class="btn btn-main" data-a="tkGo">${d.shares>1?`先付 ${fmt(share)}`:`${fmt(share)} 積分`}</button></div></section>`; }
function tkKeep(){ const d=ui.tkD; if(!d) return; const v=id=>{ const e=document.getElementById(id); return e?e.value:null; }; const s=v("tkSlogan"), fr=v("tkFrom"); if(s!=null) d.deco.slogan=s; if(fr!=null) d.deco.from=fr; [0,1,2].forEach(i=>{ const m=v("tkM"+i); if(m!=null) d.deco.menu[i]=m; }); }
/* 換頁後：把 3D 放進新的位置 */
let _tkT=0;
function truckAttach(){ const el=document.getElementById("tk3d")||document.getElementById("tkA3d"); if(!el) return; const deco=ui._tkDeco||TRUCK_DECO0(), drive=!!ui.tkDrive; ui.tkDrive=false;
  TRUCK3D.mount(el,deco,{drive}).then(I=>{ const l=el.querySelector(".trk-load"); if(I&&l) l.remove(); }); }
function truckLive(){ clearTimeout(_tkT); _tkT=setTimeout(()=>{ tkKeep(); const dd=tkDraftDeco(); if(dd){ ui._tkDeco=dd; TRUCK3D.set(dd); } },260); }
document.addEventListener("input",e=>{ if(e.target&&/^tk(Slogan|From|M\d)$/.test(e.target.id||"")) truckLive(); });

/* ---------- 藝人：FOC → 應援餐車（送到了才看得到；第一次打開有「餐車到了」） ---------- */
function viewTruckArtist(mid){ if(ui.tkD){ ui._tkDeco=tkDraftDeco(); return `<main class="page foc trk"><div class="trk-stage" id="tk3d"><span class="trk-load">載入中…</span></div>${tkEditor(ui.tkD)}</main>`; }
  const T=artTkTargets(), send=T.length?(tkBal()<TRUCK_PRICE?`<button class="btn btn-soft btn-block trk-new" disabled>送應援餐車給出道／回歸的藝人・積分不足</button>`:`<button class="btn btn-main btn-block trk-new" data-a="tkNew">送應援餐車給出道／回歸的藝人・${fmt(TRUCK_PRICE)} 積分</button>`):"";
  return viewTruckArtist0(mid,send); }
/* 藝人端：「收到的」「送出的」分開兩頁 */
function viewTruckArtist0(mid,send){ const tab=ui.tkTab==="out"?"out":"in", seg=`<div class="seg2 trk-seg" style="--i:${tab==="out"?1:0}"><i class="seg2-ind"></i><button class="${tab==="in"?"on":""}" data-a="tkTab" data-v="in">收到的</button><button class="${tab==="out"?"on":""}" data-a="tkTab" data-v="out">送出的</button></div>`;
  const dot=t=>`<span class="trk-dot" style="background:${(TRUCK_PAL[(t.deco||{}).pal]||TRUCK_PAL[0]).body}"></span>`;
  const P0=`<div class="seg2-pane ${ui.segAnim||""}">`, P1=`</div>`;
  if(tab==="out"){ const L=getTrucks().filter(tkPaidMe).sort((a,b)=>(b.ts||0)-(a.ts||0)), top=send?`<div class="trk-bot">${send}</div>`:"";
    if(!L.length) return `<main class="page foc trk">${seg}${P0}<section class="card trk-empty"><b>還沒有送出的餐車</b></section>${top}${P1}</main>`;
    const cur=L.find(t=>t.id===ui.tkView)||L[0]; ui._tkDeco=tkDecoOf(cur);
    return `<main class="page foc trk">${seg}${P0}<div class="trk-stage" id="tkA3d"><span class="trk-load">載入中…</span></div>${top}
      <div class="section-h">送出的餐車<span class="muted">${L.length} 台</span></div>
      <section class="card trk-list">${L.map(t=>`<button class="trk-row ${t.id===cur.id?"on":""}" data-a="tkView" data-v="${t.id}">${dot(t)}<span class="trk-ri"><b>${esc(tkM(t.mid).name)}</b><small>${t.shares>1?`${t.paid.length}／${t.shares} 人・`:""}${tkStTxt(t,tkState(t))}</small></span></button>`).join("")}</section>${P1}</main>`; }
  const L=getTrucks().filter(t=>t.mid===mid&&tkState(t)==="done").sort((a,b)=>tkDeliverTs(b)-tkDeliverTs(a)), seen=new Set((S.get(K.tkSeen,{})||{})[mid]||[]), fresh=L.filter(t=>!seen.has(t.id));
  if(!L.length&&demoOn()){ L.push({id:"tk_demo",mid,gid:MEMBERS[mid].group,by:"",byName:"示範粉絲",shares:3,deco:{...TRUCK_DECO0(),pal:1,slogan:"出道快樂！我們一直都在",from:"示範粉絲",menu:["草莓拿鐵","香草可頌","氣泡飲"]},ts:Date.now()-864e5,paid:[{em:"a",name:"A",ts:Date.now()-864e5},{em:"b",name:"B",ts:Date.now()-864e5},{em:"c",name:"C",ts:Date.now()-864e5}],_demo:1}); }
  if(!L.length) return `<main class="page foc trk">${seg}${P0}<section class="card trk-empty"><b>還沒有收到應援餐車</b></section>${P1}</main>`;
  const cur=L.find(t=>t.id===ui.tkView)||fresh[0]||L[0];
  ui._tkDeco=tkDecoOf(cur); if(fresh.some(t=>t.id===cur.id)){ ui.tkDrive=true; const S2=S.get(K.tkSeen,{})||{}; S2[mid]=[...new Set([...(S2[mid]||[]),cur.id])]; setTimeout(()=>S.set(K.tkSeen,S2),2500); }
  return `<main class="page foc trk">${seg}${P0}${fresh.length?`<div class="trk-arrive"><b>餐車到了！</b><small>From. ${esc((cur.deco&&cur.deco.from)||cur.byName||"粉絲")}</small></div>`:""}
    <div class="trk-stage" id="tkA3d"><span class="trk-load">載入中…</span></div>
    <div class="section-h">收到的餐車<span class="muted">${L.length} 台</span></div>
    <section class="card trk-list">${L.map(t=>`<button class="trk-row ${t.id===cur.id?"on":""}" data-a="tkView" data-v="${t.id}">${dot(t)}<span class="trk-ri"><b>From. ${esc((t.deco&&t.deco.from)||t.byName||"粉絲")}</b><small>${ymd(tkDeliverTs(t)||t.ts)}・${t.shares>1?`${t.paid.length} 位一起送`:"一個人送"}</small></span></button>`).join("")}</section>${P1}</main>`; }
const tkArtNew=mid=>{ const seen=new Set((S.get(K.tkSeen,{})||{})[mid]||[]); return getTrucks().filter(t=>t.mid===mid&&tkState(t)==="done"&&!seen.has(t.id)).length; };

/* ---------- 管理員：活動 → 餐車（全部都看得到） ---------- */
function truckAdminHtml(){ const L=getTrucks().slice().sort((a,b)=>b.ts-a.ts);
  return `<section class="card studio"><div class="foc-cfg-h"><h3>應援餐車</h3><span class="badge">${L.length} 台</span></div>
    ${L.length?L.map(t=>{ const st=tkState(t), dv=tkDeliverTs(t); return `<div class="trk-adm"><span class="trk-dot" style="background:${(TRUCK_PAL[(t.deco||{}).pal]||TRUCK_PAL[0]).body}"></span><div><b>${esc(tkM(t.mid).name)}<em>${tkStTxt(t,st)}</em></b><small>From. ${esc((t.deco&&t.deco.from)||t.byName||"")}・${(t.paid||[]).map(p=>esc(p.name||"")).join("、")}（${t.paid.length}／${t.shares}）${dv?`・${ymd(dv)} 送到`:""}</small></div><button class="btn btn-soft btn-sm" data-a="tkDel" data-v="${t.id}">刪除</button></div>`; }).join(""):`<p class="me-none">還沒有餐車</p>`}</section>`; }


/* =========================================================
   演唱會應援棒 3D（高級款）：珍珠白握把、香檳金環、玻璃燈頭、裡面的光跟著燈色
   ・所有應援棒共用一個畫筆（手機同時開太多 3D 會當掉），每一支畫在自己的小畫布上
   ・保留原本的用法：LS3D.mount(el, ds, {controls, wave, pulse, auto, swing, bright, onSwing})
   ========================================================= */
const STICK3D=(()=>{
  let R=null, cam=null, scene=null, env=null, RW=0, RH=0; const live=new Set(), models=new Map();
  const hex2rgb=h=>{ h=(h||"#C7AEFF").replace("#",""); return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)); };
  const mix=(a,b,k)=>{ const A=hex2rgb(a), B=hex2rgb(b); return "#"+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,"0")).join(""); };
  function init(){ if(R) return; R=X3.renderer(); R.toneMappingExposure=1.1; scene=new THREE.Scene(); env=X3.env(R); scene.environment=env;
    cam=new THREE.PerspectiveCamera(35.5,1,.1,50); cam.position.set(0,0,6.4); cam.lookAt(0,0,0);
    const key=new THREE.DirectionalLight(0xFFF6EE,1.1); key.position.set(3,5,6); scene.add(key); const rim=new THREE.DirectionalLight(0xE6ECFF,.6); rim.position.set(-4,2,-4); scene.add(rim); scene.add(new THREE.HemisphereLight(0xFFFFFF,0x403848,.35)); }
  /* 一支應援棒的模型（同一個設計只做一次）。高約 3.1，燈頭中心在 y=.95 */
  function model(key,c){ if(models.has(key)) return models.get(key);
    const g=new THREE.Group(), pearl=new THREE.MeshPhysicalMaterial({color:X3.C(c.handle),roughness:.28,metalness:.05,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1}), gold=X3.gold(c.metal,.2);
    const lathe=(pts,m,seg=64)=>{ const me=new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg),m); g.add(me); return me; };
    // 握把：底部圓潤、往上慢慢變細
    lathe([[0,-1.62],[.12,-1.61],[.17,-1.57],[.19,-1.5],[.19,-1.2],[.175,-.6],[.16,-.05],[.155,.2],[0,.2]],pearl);
    // 底座金蓋、握把上的金環
    lathe([[0,-1.66],[.14,-1.66],[.18,-1.63],[.195,-1.58],[.19,-1.55],[0,-1.55]],gold);
    [-1.18,-1.04].forEach(y=>{ const t=new THREE.Mesh(new THREE.TorusGeometry(.19,.014,12,64),gold); t.rotation.x=Math.PI/2; t.position.y=y; g.add(t); });
    // 按鈕（跟著燈色亮）
    const btn=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.14,16),X3.emit(c.glow,1.2)); btn.position.set(0,-.55,.165); g.add(btn);
    // 燈頭底座：香檳金
    lathe([[0,.14],[.17,.14],[.24,.2],[.27,.3],[.26,.38],[.22,.44],[0,.44]],gold);
    // 玻璃燈頭＋裡面的光
    const core=new THREE.Mesh(new THREE.SphereGeometry(.42,48,32),new THREE.MeshStandardMaterial({color:X3.C(c.glow),emissive:X3.C(c.glow),emissiveIntensity:1.2,roughness:.6})); core.position.y=.95; g.add(core);
    const em=new THREE.Mesh(new THREE.PlaneGeometry(.62,.62),new THREE.MeshBasicMaterial({map:emblem(c),transparent:true,depthWrite:false})); em.position.set(0,.95,.43); g.add(em);
    const em2=em.clone(); em2.rotation.y=Math.PI; em2.position.z=-.43; g.add(em2);
    const shell=new THREE.Mesh(new THREE.SphereGeometry(.6,64,48),new THREE.MeshPhysicalMaterial({color:X3.C("#FFFFFF"),roughness:.04,metalness:0,clearcoat:1,clearcoatRoughness:0,transparent:true,opacity:.22,envMapIntensity:1.6,depthWrite:false})); shell.position.y=.95; g.add(shell);
    // 燈頭的金色環＋頂端小皇冠
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.605,.02,16,96),gold); ring.position.y=.95; ring.rotation.x=Math.PI/2; g.add(ring);
    const ring2=new THREE.Mesh(new THREE.TorusGeometry(.6,.012,12,96),gold); ring2.position.y=.95; g.add(ring2);
    lathe([[0,1.53],[.05,1.53],[.075,1.57],[.06,1.62],[0,1.66]],gold,32);
    const out={g,core,btn,headY:.95,c}; models.set(key,out); g.visible=false; scene.add(g); return out; }
  /* 舞台麥克風：真的 3D（鍍鉻網罩＋裡面的黑色海綿、燈色光圈、霧黑握把） */
  function modelMic(c){ const key="mic"; if(models.has(key)) return models.get(key); const g=new THREE.Group();
    const lathe=(pts,m,seg=96)=>{ const me=new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg),m); g.add(me); return me; };
    const chrome=new THREE.MeshStandardMaterial({color:X3.C("#F1F2F6"),metalness:1,roughness:.12,envMapIntensity:1.5});
    const satin=new THREE.MeshStandardMaterial({color:X3.C("#D9DAE0"),metalness:1,roughness:.32,envMapIntensity:1.3});
    const body=new THREE.MeshPhysicalMaterial({color:X3.C("#17151C"),metalness:.55,roughness:.38,clearcoat:.8,clearcoatRoughness:.18,envMapIntensity:1.1});
    /* 握把：上粗下細，底下鍍鉻尾蓋 */
    lathe([[0,-1.62],[.115,-1.62],[.135,-1.6],[.14,-1.55],[.15,-1.2],[.175,-.5],[.2,.08],[.205,.18],[0,.18]],body);
    lathe([[0,-1.7],[.09,-1.7],[.12,-1.68],[.138,-1.64],[.142,-1.58],[0,-1.58]],chrome);
    [-1.5,-1.44].forEach(y=>{ const t=new THREE.Mesh(new THREE.TorusGeometry(.143+(y+1.5)*.04,.006,10,64),satin); t.rotation.x=Math.PI/2; t.position.y=y; g.add(t); });
    /* 側邊開關＋小燈 */
    const sw=new THREE.Mesh(X3.rbox(.09,.22,.06,.025),new THREE.MeshStandardMaterial({color:X3.C("#0B0A0E"),metalness:.3,roughness:.5})); sw.position.set(0,-.42,.19); sw.rotation.x=-.04; g.add(sw);
    const btn=new THREE.Mesh(new THREE.SphereGeometry(.018,16,12),X3.emit(c.glow,1.6)); btn.position.set(0,-.36,.225); g.add(btn);
    /* 光圈（跟著燈色亮）＋鍍鉻領口 */
    const core=new THREE.Mesh(new THREE.TorusGeometry(.214,.03,16,96),new THREE.MeshStandardMaterial({color:X3.C(c.glow),emissive:X3.C(c.glow),emissiveIntensity:1.8,roughness:.3})); core.rotation.x=Math.PI/2; core.position.y=.2; g.add(core);
    /* 鍍鉻頸圈：短短一截，接著網罩（真的手持麥克風沒有喇叭口） */
    lathe([[0,.215],[.212,.215],[.218,.24],[.222,.3],[.232,.34],[.236,.35],[0,.35]],chrome);
    /* 網罩：一顆略扁的鍍鉻網球，底部收進頸圈；裡面黑海綿，沒有中間那圈接縫 */
    const HR=.4, HY=.35+HR*.82;
    const holes=X3.ctex(512,256,(x,w,h)=>{ x.fillStyle="#fff"; x.fillRect(0,0,w,h); x.fillStyle="#000"; const s=8; for(let yy=0;yy<h;yy+=s) for(let xx=-s;xx<w;xx+=s){ x.beginPath(); x.arc(xx+s/2+((yy/s)%2?s/2:0),yy+s/2,s*.36,0,Math.PI*2); x.fill(); } });
    holes.encoding=THREE.LinearEncoding; holes.wrapS=holes.wrapT=THREE.RepeatWrapping; holes.generateMipmaps=false; holes.minFilter=THREE.LinearFilter;
    const foam=new THREE.Mesh(new THREE.SphereGeometry(HR*.95,48,32),new THREE.MeshStandardMaterial({color:X3.C("#1A1820"),roughness:1,metalness:0})); foam.position.y=HY; g.add(foam);
    const grill=new THREE.Mesh(new THREE.SphereGeometry(HR,96,64,0,Math.PI*2,0,Math.PI-Math.asin(.236/HR)),new THREE.MeshStandardMaterial({color:X3.C("#EEF0F4"),metalness:1,roughness:.22,envMapIntensity:1.6,alphaMap:holes,alphaTest:.5,side:THREE.DoubleSide})); grill.position.y=HY; g.add(grill);
    grill.scale.set(1,.96,1); foam.scale.set(1,.96,1);
    const lip=new THREE.Mesh(new THREE.TorusGeometry(.236,.012,12,96),chrome); lip.rotation.x=Math.PI/2; lip.position.y=.35; g.add(lip);   /* 網罩跟頸圈接起來的那一圈 */
    const out={g,core,btn,headY:HY,c,mic:true}; models.set(key,out); g.visible=false; scene.add(g); return out; }
  /* 照設計圖做的模型：用辨識出來的輪廓（圓的做旋轉體、愛心星星做成鼓起來的立體板），表面貼設計圖本身，燈頭會發光 */
  const dsKey=ds=>ds._k||(ds._k="ds"+Math.random().toString(36).slice(2,9));
  const building=new Set();
  function modelHull(ds,key){ Promise.all([lsImg(ds.cut),lsImg(ds.side),lsImg(ds.back),lsImg(ds.top)]).then(([f,s,b,tp])=>{ try{ if(!f||!s) throw 0; const m=lsHullMesh(toCanvas(f),toCanvas(s),b?toCanvas(b):null,ds.split||.45,tp?toCanvas(tp):null);
        const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.BufferAttribute(m.P,3)); geo.setAttribute("normal",new THREE.BufferAttribute(m.N,3)); geo.setAttribute("color",new THREE.BufferAttribute(m.C,3)); geo.setAttribute("g",new THREE.BufferAttribute(m.G,1)); geo.setIndex(new THREE.BufferAttribute(m.I,1)); MSO.slim(geo);
        const mat=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.26,metalness:0,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:.95});
        const out={g:new THREE.Group(),headY:m.headY,uni:null,mat};
        mat.onBeforeCompile=sh=>{ sh.uniforms.glowC={value:new THREE.Color(1,1,1)}; sh.uniforms.glowK={value:1}; out.uni=sh.uniforms;
          sh.vertexShader="attribute float g;\nvarying float vG;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\nvG=g;");
          sh.fragmentShader="uniform vec3 glowC;\nuniform float glowK;\nvarying float vG;\n"+sh.fragmentShader.replace("#include <emissivemap_fragment>","#include <emissivemap_fragment>\ntotalEmissiveRadiance += glowC*vG*glowK*(0.25+0.75*diffuseColor.rgb);"); };
        out.g.add(new THREE.Mesh(geo,mat)); out.g.visible=false; scene.add(out.g); models.set(key,out); }catch(e){ models.set(key,null); } building.delete(key); }); }
  /* 第二代：拆零件（旋轉體／鼓起來／環／燈頭裡的立體圖案）＋材質（玻璃、金屬、珍珠、塑膠、發光）；掛繩會晃 */
  function modelParts(ds,key){ Promise.all([lsImg(ds.front||ds.cut),lsImg(ds.side),lsImg(ds.back),lsImg(ds.top),lsImg(ds.depth),lsImg(ds.embImg),lsImg(ds.topImg)]).then(([f,s,b,tp,dp,eb,tq])=>{ try{ if(!f) throw 0;
        const m=lsPartsMesh(toCanvas(f),s?toCanvas(s):null,b?toCanvas(b):null,tp?toCanvas(tp):null,dp?toCanvas(dp):null,ds.split||.45,ds.pm,eb?toCanvas(eb):null,ds.dims,ds.lbl,tq?toCanvas(tq):null);
        Object.defineProperty(ds,"_parts",{value:m.info,enumerable:false,configurable:true,writable:true});
        const pl=document.getElementById("lsParts"); if(pl&&ui.lsDraft&&ui.lsDraft.ds===ds) pl.innerHTML=lsPartsUI(ds);
        const uni={glowC:{value:new THREE.Color(1,1,1)},glowK:{value:1}}, out={g:new THREE.Group(),headY:m.headY,uni,mat:null};
        const T=c=>{ const t=new THREE.CanvasTexture(lsDelit(c)); t.anisotropy=8; return t; }, J=m.proj, tF=T(m.front), tB=m.back?T(m.back):tF, tS=m.side?T(m.side):tF;
        const PU={tF:{value:tF},tB:{value:tB},tS:{value:tS},pF:{value:new THREE.Vector2(...J.f)},pB:{value:new THREE.Vector2(...J.b)},pS:{value:new THREE.Vector2(...(J.s||[.5,0]))},hasS:{value:J.s?1:0}};
        const hook=(mat,useT,gls)=>{ mat.onBeforeCompile=sh=>{ sh.uniforms.glowC=uni.glowC; sh.uniforms.glowK=uni.glowK; Object.assign(sh.uniforms,PU);
          sh.vertexShader="attribute float g;\nvarying float vG;\nvarying vec3 vOP;\nvarying vec3 vON;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\nvG=g;\nvOP=position;\nvON=normal;");
          sh.fragmentShader="uniform vec3 glowC;\nuniform float glowK;\nvarying float vG;\nvarying vec3 vOP;\nvarying vec3 vON;\nuniform sampler2D tF;\nuniform sampler2D tB;\nuniform sampler2D tS;\nuniform vec2 pF;\nuniform vec2 pB;\nuniform vec2 pS;\nuniform float hasS;\n"
            +sh.fragmentShader.replace("#include <color_fragment>",useT?`#include <color_fragment>
  { vec3 n=normalize(vON); float v=(vOP.y+1.3)/2.6; float wf=pow(max(0.,n.z),2.), wb=pow(max(0.,-n.z),2.), ws=n.x*n.x*hasS+.0001;
    vec4 cf=texture2D(tF,vec2(pF.x+pF.y*vOP.x,v)), cb=texture2D(tB,vec2(pB.x+pB.y*vOP.x,v)), cs=texture2D(tS,vec2(pS.x+pS.y*vOP.z,v));
    wf*=cf.a; wb*=cb.a; ws*=cs.a; float t=wf+wb+ws;
    if(t>.02){ vec3 c=(cf.rgb*wf+cb.rgb*wb+cs.rgb*ws)/t; diffuseColor.rgb=pow(c,vec3(2.2)); } }`:"#include <color_fragment>")
            .replace("#include <emissivemap_fragment>","#include <emissivemap_fragment>\ntotalEmissiveRadiance += glowC*vG*glowK*(0.25+0.75*diffuseColor.rgb);"+(gls?"\n{ float fr=pow(1.-abs(dot(normalize(normal),normalize(vViewPosition))),2.4); totalEmissiveRadiance+=mix(vec3(1.),glowC,.45)*fr*.85; diffuseColor.a=mix(diffuseColor.a,.9,fr*fr); }":"")); }; return mat; };
        const MAT={plastic:()=>hook(new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.34,metalness:0,clearcoat:.6,clearcoatRoughness:.15,envMapIntensity:.9}),1),
          pearl:()=>hook(new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.22,metalness:.12,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.15}),1),
          metal:()=>hook(new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.2,metalness:.92,envMapIntensity:1.35}),1),
          glow:()=>hook(new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.3,metalness:0,clearcoat:1,envMapIntensity:.8}),1),
          glass:()=>hook(new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.04,metalness:0,clearcoat:1,clearcoatRoughness:0,transparent:true,opacity:.16,envMapIntensity:1.8,depthWrite:false}),0,1),
          vc:()=>hook(new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.25,metalness:.1,clearcoat:1,envMapIntensity:1,side:THREE.DoubleSide}),0)};
        const geoOf=p=>{ const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.BufferAttribute(p.P,3)); geo.setAttribute("color",new THREE.BufferAttribute(p.C,3)); geo.setAttribute("g",new THREE.BufferAttribute(p.G,1)); geo.setIndex(new THREE.BufferAttribute(p.I,1)); geo.computeVertexNormals(); return geo; };
        m.meshes.forEach(p=>{ if(p.crystal||p.ext){ /* 燈頭裡的水晶圖案：自己一組，可以在球裡慢慢轉 */
            let geo; if(p.crystal) geo=geoOf(p); else { const sh=new THREE.Shape(p.shape.map(([x,y])=>new THREE.Vector2(x,y))); geo=new THREE.ExtrudeGeometry(sh,{depth:p.depth,bevelEnabled:true,bevelThickness:p.bev,bevelSize:p.bev,bevelSegments:3,curveSegments:8}); geo.translate(0,0,-p.depth/2); const n=geo.attributes.position.count; geo.setAttribute("g",new THREE.BufferAttribute(new Float32Array(n).fill(p.g),1)); }
            const metal=p.key==="top"&&p.mat==="metal", mt=metal?hook(new THREE.MeshPhysicalMaterial({vertexColors:false,color:new THREE.Color(...(p.color||[.8,.78,.88]).map(v=>Math.min(1,v*.5+.45))),flatShading:!!p.crystal,roughness:.18,metalness:.92,envMapIntensity:1.5,side:THREE.DoubleSide}),0):hook(new THREE.MeshPhysicalMaterial({vertexColors:!!p.crystal,color:p.ext?new THREE.Color(...p.color):0xffffff,flatShading:!!p.crystal,roughness:.08,metalness:.04,clearcoat:1,clearcoatRoughness:0,transparent:true,opacity:.94,envMapIntensity:1.15,side:THREE.DoubleSide}),0);
            const sg=new THREE.Group(); sg.position.set(p.pos[0],p.pos[1],0); sg.add(new THREE.Mesh(geo,mt)); if(p.key==="top"){ sg.rotation.x=-Math.PI/2; sg.position.y=p.pos[1]; } /* 頂部：照爆炸圖，一顆有厚度的切面星星平躺在球頂 */ sg.renderOrder=2; out.g.add(sg);
            if(p.key==="emb"){ out.spin=sg; out.spinOn=!(ds.pm&&ds.pm.spin==="off"); }
            if(p.post){ const pc=new THREE.Mesh(new THREE.CylinderGeometry(.014,.02,p.post[1],12),new THREE.MeshPhysicalMaterial({color:0xE8E6EA,metalness:.92,roughness:.2,envMapIntensity:1.4})); pc.position.y=p.post[0]+p.post[1]/2; out.g.add(pc); }
            return; }
          const geo=geoOf(p), me=new THREE.Mesh(geo,(p.key==="emb"||p.key==="thin"?MAT.vc:MAT[p.mat]||MAT.plastic)()); if(p.mat==="glass"){ me.renderOrder=3; }
          out.g.add(me); });
        /* 玻璃燈頭裡淡淡的燈光色光暈（看得出玻璃球） */
        if(m.bulbW){ const hz=new THREE.Mesh(new THREE.SphereGeometry(m.bulbW.R*.93,48,32),new THREE.ShaderMaterial({uniforms:{glowC:uni.glowC,glowK:uni.glowK},transparent:true,depthWrite:false,
            vertexShader:"varying vec3 vN;varying vec3 vV;void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }",
            fragmentShader:"uniform vec3 glowC;uniform float glowK;varying vec3 vN;varying vec3 vV;void main(){ float f=pow(max(dot(vN,vV),0.),1.4); gl_FragColor=vec4(glowC,f*.3*clamp(glowK,0.,1.4)); }"}));
          hz.position.y=m.bulbW.y; hz.renderOrder=1; out.g.add(hz); }
        /* 掛繩：真的繩圈，分上下兩節，會被甩、會垂下來 */
        if(m.strap){ const S2=m.strap, rr=Math.max(.012,S2.w*.16), a=S2.w*.42, Lh=S2.L/2, rm=new THREE.MeshStandardMaterial({color:new THREE.Color(...S2.color),roughness:.75,metalness:.05});
          const tube=pts=>{ const t=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),24,rr,10,false),rm); t.scale.z=.28; return t; };   // 扁帶
          const l1=new THREE.Group(); l1.position.y=S2.pivot; l1.add(tube([[-a*.6,0,0],[-a*.85,-Lh*.5,0],[-a,-Lh,0]])); l1.add(tube([[a*.6,0,0],[a*.85,-Lh*.5,0],[a,-Lh,0]]));
          const l2=new THREE.Group(); l2.position.y=-Lh; l2.add(tube([[-a,0,0],[-a*.9,-Lh*.55,0],[0,-Lh,0],[a*.9,-Lh*.55,0],[a,0,0]]));
          const bead=new THREE.Mesh(new THREE.SphereGeometry(rr*2.6,16,12),new THREE.MeshPhysicalMaterial({color:new THREE.Color(...S2.color),roughness:.2,clearcoat:1})); bead.position.y=-Lh*1.02; l2.add(bead);
          if(S2.ringC){ const rg=new THREE.Mesh(new THREE.TorusGeometry(a*.75,rr*1.3,10,32),new THREE.MeshPhysicalMaterial({color:0xE8E6EA,metalness:.95,roughness:.18,envMapIntensity:1.4})); rg.rotation.y=Math.PI/2; l1.add(rg); }
          l1.add(l2); out.g.add(l1); out.sw=[{pv:l1,a:0,va:0,b:0,vb:0,k:.09,d:.07},{pv:l2,a:0,va:0,b:0,vb:0,k:.06,d:.05}]; }
        if(m.ring){ const r=m.ring, mt=new THREE.MeshPhysicalMaterial({color:new THREE.Color(...r.color),roughness:r.mat==="metal"?.2:.24,metalness:r.mat==="metal"?.9:.15,clearcoat:1,envMapIntensity:1.2,emissive:new THREE.Color(...r.color),emissiveIntensity:r.mat==="glow"?.6:0,transparent:r.mat==="glass",opacity:r.mat==="glass"?.35:1});
          const rg=new THREE.Group(), me=new THREE.Mesh(new THREE.TorusGeometry(r.R,r.tube,16,140),mt); me.rotation.x=Math.PI/2-r.tilt; rg.add(me); rg.position.set(r.x,r.y,0); rg.rotation.z=r.roll; out.g.add(rg); }
        out.g.visible=false; scene.add(out.g); models.set(key,out); }catch(e){ console.warn("ls parts",e); models.set(key,null); } building.delete(key); }); }
  function modelDs(ds){ const key=dsKey(ds); if(models.has(key)) return models.get(key); if(building.has(key)) return null; building.add(key);
    if(ds.v2&&ds.cut&&typeof lsPartsMesh==="function"){ modelParts(ds,key); return null; }
    if(ds.side){ modelHull(ds,key); return null; }
    const go=mask=>{ try{ const m=LS3D.buildMesh(ds,mask); if(!m||!m.I||!m.I.length) throw 0;
        const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.BufferAttribute(m.P,3)); geo.setAttribute("normal",new THREE.BufferAttribute(m.NM,3)); geo.setAttribute("uv",new THREE.BufferAttribute(m.U,2)); geo.setAttribute("g",new THREE.BufferAttribute(m.G,1)); geo.setIndex(new THREE.BufferAttribute(m.I,1)); MSO.slim(geo);
        const tex=new THREE.TextureLoader().load(ds.tex); tex.flipY=false; tex.encoding=THREE.sRGBEncoding; tex.anisotropy=8;
        const mat=new THREE.MeshPhysicalMaterial({map:tex,roughness:.28,metalness:0,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:.95,side:THREE.DoubleSide});
        const out={g:new THREE.Group(),headY:m.headY,k:1,uni:null,mat};
        mat.onBeforeCompile=sh=>{ sh.uniforms.glowC={value:new THREE.Color(1,1,1)}; sh.uniforms.glowK={value:1}; out.uni=sh.uniforms;
          sh.vertexShader="attribute float g;\nvarying float vG;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\nvG=g;");
          sh.fragmentShader="uniform vec3 glowC;\nuniform float glowK;\nvarying float vG;\n"+sh.fragmentShader.replace("#include <emissivemap_fragment>","#include <emissivemap_fragment>\ntotalEmissiveRadiance += glowC*vG*glowK*(0.25+0.75*diffuseColor.rgb);"); };
        out.g.add(new THREE.Mesh(geo,mat)); out.g.visible=false; scene.add(out.g); models.set(key,out); }catch(e){ models.set(key,null); } building.delete(key); };
    if(ds.mode==="plate"&&ds.cut){ const im=newImg(); im.onload=()=>{ try{ const c=document.createElement("canvas"); c.width=ds.bw; c.height=ds.bh; const x=c.getContext("2d"); x.drawImage(im,0,0,ds.bw,ds.bh); const d=x.getImageData(0,0,ds.bw,ds.bh).data, a=new Uint8Array(ds.bw*ds.bh); for(let i=0;i<a.length;i++) a[i]=d[i*4+3]; go({w:ds.bw,h:ds.bh,a}); }catch(e){ go(null); } }; im.onerror=()=>go(null); im.src=ds.cut; }
    else go(null);
    return null; }
  /* 燈頭裡的圖樣：團名第一個字（襯線字＋光暈） */
  function emblem(c){ return X3.ctex(256,256,(x,w,h)=>{ x.clearRect(0,0,w,h); x.textAlign="center"; x.textBaseline="middle"; x.shadowColor="rgba(255,255,255,.9)"; x.shadowBlur=18; x.fillStyle="rgba(255,255,255,.95)";
      x.font=`italic 700 150px ${SERIF}`; x.fillText(c.letter||"✦",w/2,h/2+8); }); }
  /* 管理員上傳的設計圖：取燈頭、握把的顏色 */
  function colorsOf(ds){ const glow=ds.glow||"#C7AEFF"; const c={glow,handle:"#F4F1F6",metal:"#DCC29A",letter:ds._letter||"✦"};
    if(ds._c1) { c.handle=mix("#FBF8FC",ds._c2||ds._c1,.12); }
    return c; }
  function sampleColors(ds,cb){ if(ds._c1||!ds.cut){ cb(); return; } const im=newImg(); im.onload=()=>{ try{ const cv=document.createElement("canvas"); cv.width=24; cv.height=48; const x=cv.getContext("2d"); x.drawImage(im,0,0,24,48); const d=x.getImageData(0,0,24,48).data; const avg=(y0,y1)=>{ let r=0,g=0,b=0,n=0; for(let y=y0;y<y1;y++) for(let i=0;i<24;i++){ const k=(y*24+i)*4; if(d[k+3]<40) continue; r+=d[k]; g+=d[k+1]; b+=d[k+2]; n++; } return n?"#"+[r,g,b].map(v=>Math.round(v/n).toString(16).padStart(2,"0")).join(""):null; };
      ds._c1=avg(0,20)||ds.glow; ds._c2=avg(28,48)||ds._c1; }catch(e){} cb(); }; im.onerror=()=>cb(); im.src=ds.cut; }
  function mount(el,ds,o={}){
    el.classList.add("ls3d"); el.innerHTML=`<span class="ls-halo"></span><canvas></canvas>${o.controls?`<span class="ls-ctl"><button type="button" data-m="rot" class="on">↻ 旋轉</button><button type="button" data-m="move">✥ 移動</button><button type="button" data-m="reset">⟲ 重設</button></span>`:""}`;
    const cv=el.querySelector("canvas"), halo=el.querySelector(".ls-halo"), ctx=cv.getContext("2d");
    const st={yaw:o.yaw??-.5,pitch:.12,sc:1,px:0,py:0,vy:0,auto:o.auto!==false,wave:!!o.wave,pulse:o.pulse||0,glow:o.glow||ds.glow||"#C7AEFF",dead:false,mode:"rot",t0:performance.now(),touch:0,swing:!!o.swing,roll:0,rv:0,sw:0,sv:0,em:o.bright?1:0};
    if(st.swing){ st.yaw=o.mic?-.2:-.32; st.pitch=.08; st.sc=o.mic?1.12:.84; }
    const api={el,cv,ctx,halo,st,ds,o,m:null,set(k,v){ if(k==="rv"){ st.rv+=v; return; } st[k]=v; if(k==="glow") applyGlow(); }, update(nd){ api.ds=nd; ready(); }, destroy(){ st.dead=true; live.delete(api); }};
    function applyGlow(){ halo.style.background=`radial-gradient(circle,${st.glow}cc 0%,${st.glow}55 35%,transparent 68%)`; }
    applyGlow();
    function ready(){ const d=api.ds; if(o.mic){ api.m={mic:1,c:{glow:st.glow}}; return; } if(d&&d.rows&&d.tex){ api.m={ds:d}; return; } sampleColors(d,()=>{ if(st.dead) return; const c=colorsOf(d); api.m={key:[c.glow,c.handle,c.letter].join("|"),c}; }); }
    loadThree().then(()=>{ if(st.dead) return; init(); ready(); live.add(api); kick(); }).catch(()=>{ if(ds.cut) el.innerHTML=`<img class="ls-fb" src="${ds.cut}" alt="應援棒">`; });
    // 手勢：一指旋轉（或移動）、雙擊重設；揮動模式跟著手指甩
    const pts=new Map(); let lastTap=0; const reset=()=>{ st.yaw=-.5; st.pitch=.12; st.sc=1; st.px=0; st.py=0; st.vy=0; };
    if(o.interactive!==false){ cv.style.touchAction="none";
      cv.addEventListener("pointerdown",e=>{ try{ cv.setPointerCapture(e.pointerId); }catch(_){} pts.set(e.pointerId,{x:e.clientX,y:e.clientY}); st.touch=performance.now(); const now=Date.now(); if(pts.size===1&&now-lastTap<300) reset(); lastTap=now; });
      cv.addEventListener("pointermove",e=>{ if(!pts.has(e.pointerId)) return; const p=pts.get(e.pointerId), dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY; st.touch=performance.now(); const H=cv.clientHeight||300;
        if(pts.size===1&&st.swing){ st.rv=dx*.006; st.roll=Math.max(-.6,Math.min(.6,st.roll+st.rv)); st.sv=dy*.005; st.sw=Math.max(-.6,Math.min(.6,st.sw+st.sv)); if(o.onSwing) o.onSwing(Math.abs(dx)+Math.abs(dy)); return; }
        if(pts.size===1){ if(st.mode==="move"||e.shiftKey){ st.px+=dx/H*4.2; st.py-=dy/H*4.2; } else { st.yaw+=dx*.012; st.vy=dx*.012; st.pitch=Math.max(-1.1,Math.min(1.1,st.pitch+dy*.008)); } } });
      const up=e=>{ pts.delete(e.pointerId); }; cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up);
      el.querySelectorAll(".ls-ctl button").forEach(b=>b.addEventListener("click",ev=>{ ev.stopPropagation(); const m=b.dataset.m; if(m==="reset"){ reset(); return; } st.mode=m; el.querySelectorAll(".ls-ctl button").forEach(x=>x.classList.toggle("on",x.dataset.m===m)); })); }
    api.pts=pts; return api; }
  let running=false; const V=()=>new THREE.Vector3();
  function kick(){ if(running) return; running=true; requestAnimationFrame(frame); }
  function frame(now){
    if(!live.size){ running=false; return; }
    const dpr=Math.min(2,window.devicePixelRatio||1); let needW=0, needH=0; const vis=[];
    live.forEach(a=>{ if(a.st.dead) return; if(!a.cv.isConnected){ a.destroy(); return; } const w=Math.round(a.cv.clientWidth*dpr), h=Math.round(a.cv.clientHeight*dpr); if(!w||!h||!a.m) return; const r=a.cv.getBoundingClientRect(); if(r.bottom<-50||r.top>innerHeight+50) return; vis.push([a,w,h]); needW=Math.max(needW,w); needH=Math.max(needH,h); });
    if(vis.length){ if(needW>RW||needH>RH){ RW=Math.max(RW,needW); RH=Math.max(RH,needH); R.setPixelRatio(1); R.setSize(RW,RH,false); }
      vis.forEach(([a,w,h])=>{ const st=a.st, o=a.o, t=(now-st.t0)/1000, idle=now-st.touch>1500; if(a.cv.width!==w||a.cv.height!==h){ a.cv.width=w; a.cv.height=h; }
        if(st.swing){ if(!a.pts.size){ st.rv+=-st.roll*.07; st.rv*=.9; st.roll+=st.rv; st.sv+=-st.sw*.07; st.sv*=.88; st.sw+=st.sv; } }
        else if(!a.pts.size){ st.yaw+=st.vy; st.vy*=.93; if(st.auto&&idle) st.yaw+=.008; }
        let pw=1; if(st.pulse===1) pw=.55+.45*Math.sin(t*5); else if(st.pulse===2) pw=(Math.sin(t*12)>0?1:.25); else if(st.pulse===3) pw=.6+.4*Math.sin(t*2.2);
        const wave=st.swing?-(st.roll+(idle?Math.sin(t*1.9)*.1:0)):st.wave?Math.sin(t*4.2)*.32:0, swp=st.swing?st.sw:0;
        const M=a.m.mic?modelMic(a.m.c):a.m.ds?modelDs(a.m.ds):model(a.m.key,{...a.m.c,glow:a.m.c.glow}); if(!M) return; models.forEach(x=>{ if(x) x.g.visible=false; }); M.g.visible=true;
        const col=X3.C(st.glow);
        if(M.core){ M.core.material.color.copy(col); M.core.material.emissive.copy(col); M.core.material.emissiveIntensity=(.22+.5*pw)*(st.em?1.35:1); M.btn.material.emissive.copy(col); M.btn.material.color.copy(col); }
        else if(M.uni){ M.uni.glowC.value.copy(col); M.uni.glowK.value=(.35+.75*pw)*(st.em?1.35:1); }
        // 跟原本一樣的轉法：位置→縮放→以握把底為支點擺動→上下翻→左右轉
        const g=M.g; g.position.set(0,0,0); g.rotation.set(0,0,0); g.scale.set(1,1,1); g.updateMatrix();
        const m4=new THREE.Matrix4().makeTranslation(st.px,st.py,0).multiply(new THREE.Matrix4().makeScale(st.sc*(M.core?.88:1.05),st.sc*(M.core?.88:1.05),st.sc*(M.core?.88:1.05))).multiply(new THREE.Matrix4().makeTranslation(0,-.8,0)).multiply(new THREE.Matrix4().makeRotationZ(wave)).multiply(new THREE.Matrix4().makeRotationX(swp)).multiply(new THREE.Matrix4().makeTranslation(0,.8,0)).multiply(new THREE.Matrix4().makeRotationX(st.pitch)).multiply(new THREE.Matrix4().makeRotationY(st.yaw));
        g.matrixAutoUpdate=false; g.matrix.copy(m4); g.updateMatrixWorld(true);
        if(M.spin&&M.spinOn) M.spin.rotation.y+=.007;   // 燈頭裡的圖案慢慢轉
        if(M.sw) M.sw.forEach(w=>{ const pm=w.pv.parent.matrixWorld, lg=new THREE.Vector3(0,-1,0).transformDirection(new THREE.Matrix4().copy(pm).invert()), ta=Math.atan2(lg.x,-lg.y), tb=Math.atan2(-lg.z,-lg.y);   // 掛繩：重力永遠往下，被甩動會晃回來
          w.va+=(ta-w.a)*w.k-w.va*w.d; w.vb+=(tb-w.b)*w.k-w.vb*w.d+(st.vy||0)*.05; w.a=Math.max(-1.6,Math.min(1.6,w.a+w.va)); w.b=Math.max(-1.6,Math.min(1.6,w.b+w.vb)); w.pv.rotation.set(w.b,0,w.a); w.pv.updateMatrixWorld(true); });
        cam.aspect=w/h; cam.updateProjectionMatrix();
        R.setViewport(0,RH-h,w,h); R.setScissor(0,RH-h,w,h); R.setScissorTest(true); R.setClearColor(0x000000,0); R.clear(); R.render(scene,cam);
        a.ctx.clearRect(0,0,w,h); a.ctx.drawImage(R.domElement,0,0,w,h,0,0,w,h);
        // 光暈跟著燈頭
        const p=V().set(0,M.headY,0).applyMatrix4(g.matrixWorld).project(cam), cw=a.cv.clientWidth, ch=a.cv.clientHeight, sx=(p.x*.5+.5)*cw, sy=(1-(p.y*.5+.5))*ch, size=ch*(st.em?.8:.62)*st.sc;
        a.halo.style.width=a.halo.style.height=size+"px"; a.halo.style.transform=`translate(${sx-size/2}px,${sy-size/2}px)`; a.halo.style.opacity=(.35+.55*pw).toFixed(2); }); }
    requestAnimationFrame(frame); }
  return {mount};
})();
/* 預設款：團名第一個字放進燈頭；換成新的高級 3D */
LS3D.mount=(el,ds,o)=>{ try{ return STICK3D.mount(el,ds,o); }catch(e){ return {set(){},update(){},destroy(){}}; } };

/* =========================================================
   應援棒「三視圖」立體重建：不管造型多複雜都能做
   ・管理員上傳一張三視圖（正面、側面、背面排在一起）或分開上傳
   ・自動把每個視圖切出來 → 正面的輪廓 × 側面的輪廓，一格一格雕出立體的形狀（visual hull）
   ・表面顏色：朝前的地方用正面圖、朝後用背面圖、側邊用側面圖；燈頭的地方會發光
   ========================================================= */
/* 一張圖裡找出每一個視圖（由左到右），各自去背、裁好 */
function lsSplitSheet(img,thr=22){
  let W=img.naturalWidth||img.width, H=img.naturalHeight||img.height; const k=Math.min(1,1100/Math.max(W,H)); W=Math.max(8,Math.round(W*k)); H=Math.max(8,Math.round(H*k));
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H; const x=cv.getContext("2d",{willReadFrequently:true}); x.drawImage(img,0,0,W,H); const d=x.getImageData(0,0,W,H).data, n=W*H;
  const border=[]; for(let i=0;i<W;i++) border.push(i,(H-1)*W+i); for(let j=1;j<H-1;j++) border.push(j*W,j*W+W-1);
  const alphaMode=border.filter(i=>d[i*4+3]<24).length>border.length*.5, med=c=>{ const a=border.map(i=>d[i*4+c]).sort((p,q)=>p-q); return a[a.length>>1]; }, bg=[med(0),med(1),med(2)], t2=thr*thr;
  const isBg=new Uint8Array(n), st=[]; const bgLike=i=>{ if(d[i*4+3]<24) return true; if(alphaMode) return false; const r=d[i*4]-bg[0],g=d[i*4+1]-bg[1],b=d[i*4+2]-bg[2]; return r*r+g*g+b*b<t2; };
  border.forEach(i=>{ if(!isBg[i]&&bgLike(i)){ isBg[i]=1; st.push(i); } });
  while(st.length){ const i=st.pop(), px=i%W, py=(i/W)|0; for(const j of [px>0?i-1:-1,px<W-1?i+1:-1,py>0?i-W:-1,py<H-1?i+W:-1]) if(j>=0&&!isBg[j]&&bgLike(j)){ isBg[j]=1; st.push(j); } }
  const lab=new Int32Array(n), comps=[]; let cur=0;
  for(let s=0;s<n;s++){ if(isBg[s]||lab[s]) continue; cur++; let a=0,x0=W,x1=0,y0=H,y1=0; lab[s]=cur; st.push(s);
    while(st.length){ const i=st.pop(), px=i%W, py=(i/W)|0; a++; if(px<x0)x0=px; if(px>x1)x1=px; if(py<y0)y0=py; if(py>y1)y1=py;
      for(const j of [px>0?i-1:-1,px<W-1?i+1:-1,py>0?i-W:-1,py<H-1?i+W:-1]) if(j>=0&&!isBg[j]&&!lab[j]){ lab[j]=cur; st.push(j); } }
    comps.push({id:cur,a,x0,x1,y0,y1}); }
  if(!comps.length) return [];
  const big=Math.max(...comps.map(c=>c.a));
  /* 同一個視圖裡分開的零件（燈頭和握把中間有縫）：x 範圍重疊的就併成同一個視圖 */
  let parts=comps.filter(c=>c.a>=big*.04).sort((a,b)=>a.x0-b.x0), views=[];
  parts.forEach(c=>{ const v=views.find(v=>Math.min(v.x1,c.x1)-Math.max(v.x0,c.x0)>Math.min(v.x1-v.x0,c.x1-c.x0)*.3); if(v){ v.ids.push(c.id); v.a+=c.a; v.x0=Math.min(v.x0,c.x0); v.x1=Math.max(v.x1,c.x1); v.y0=Math.min(v.y0,c.y0); v.y1=Math.max(v.y1,c.y1); } else views.push({ids:[c.id],a:c.a,x0:c.x0,x1:c.x1,y0:c.y0,y1:c.y1}); });
  const vbig=Math.max(...views.map(v=>v.a)); views=views.filter(v=>v.a>=vbig*.12).sort((a,b)=>a.x0-b.x0).slice(0,4);
  return views.map(v=>{ const bw=v.x1-v.x0+1, bh=v.y1-v.y0+1, c=document.createElement("canvas"); c.width=bw; c.height=bh; c._r={x:v.x0/k,y:v.y0/k,w:bw/k,h:bh/k}; const cx=c.getContext("2d"), o=cx.createImageData(bw,bh), ids=new Set(v.ids);
    for(let yy=0;yy<bh;yy++) for(let xx=0;xx<bw;xx++){ const i=(v.y0+yy)*W+v.x0+xx, q=i*4, p=(yy*bw+xx)*4; o.data[p]=d[q]; o.data[p+1]=d[q+1]; o.data[p+2]=d[q+2]; o.data[p+3]=ids.has(lab[i])?255:0; }
    cx.putImageData(o,0,0); return c; }); }
/* 輪廓 × 輪廓 → 立體（Surface Nets：表面圓滑、不會一格一格） */
function lsHullMesh(front,side,back,split,top){
  const NY=120, rd=c=>{ const w=Math.max(4,Math.round(c.width*NY/c.height)), t=document.createElement("canvas"); t.width=w; t.height=NY; const x=t.getContext("2d",{willReadFrequently:true}); x.drawImage(c,0,0,w,NY); return {w,h:NY,d:x.getImageData(0,0,w,NY).data}; };
  const F=rd(front), Sd=rd(side), B=back?rd(back):null, P=2, NX=F.w+P*2, NZ=Sd.w+P*2, NYp=NY+P*2, idx=(x,y,z)=>(z*NYp+y)*NX+x;
  let v=new Float32Array(NX*NYp*NZ);
  /* 有頂面圖：再從上往下雕一次（圓的燈頭會更圓） */
  let Tp=null; if(top){ const tw=F.w, th=Sd.w, t=document.createElement("canvas"); t.width=tw; t.height=th; const x=t.getContext("2d",{willReadFrequently:true}); x.drawImage(top,0,0,tw,th); Tp=x.getImageData(0,0,tw,th).data; }
  for(let z=P;z<NZ-P;z++) for(let y=P;y<NYp-P;y++){ const sa=Sd.d[((y-P)*Sd.w+(z-P))*4+3]; if(sa<128) continue; for(let x=P;x<NX-P;x++){ if(F.d[((y-P)*F.w+(x-P))*4+3]>=128&&(!Tp||Tp[((z-P)*F.w+(x-P))*4+3]>=128)) v[idx(x,y,z)]=1; } }
  /* 輕輕模糊兩次：邊角變圓潤 */
  const blur=(a)=>{ const o=new Float32Array(a.length); for(let z=0;z<NZ;z++) for(let y=0;y<NYp;y++) for(let x=0;x<NX;x++){ let s=0,c=0; for(let dz=-1;dz<=1;dz++){ const zz=z+dz; if(zz<0||zz>=NZ) continue; for(let dy=-1;dy<=1;dy++){ const yy=y+dy; if(yy<0||yy>=NYp) continue; for(let dx=-1;dx<=1;dx++){ const xx=x+dx; if(xx<0||xx>=NX) continue; s+=a[idx(xx,yy,zz)]; c++; } } } o[idx(x,y,z)]=s/c; } return o; };
  v=blur(blur(v));
  const T=.5, vid=new Int32Array(NX*NYp*NZ).fill(-1), pos=[], nor=[], col=[], gg=[], ind=[], sc=2.4/NY, cx=NX/2, cz=NZ/2;
  const samp=(V,u,w)=>{ const xx=Math.max(0,Math.min(V.w-1,Math.round(u))), yy=Math.max(0,Math.min(V.h-1,Math.round(w))), q=(yy*V.w+xx)*4; return V.d[q+3]>40?[V.d[q],V.d[q+1],V.d[q+2]]:null; };
  const at=(x,y,z)=>v[idx(Math.max(0,Math.min(NX-1,x)),Math.max(0,Math.min(NYp-1,y)),Math.max(0,Math.min(NZ-1,z)))];
  for(let z=0;z<NZ-1;z++) for(let y=0;y<NYp-1;y++) for(let x=0;x<NX-1;x++){ let m=0, sx=0,sy=0,sz=0,ne=0; const c=[];
      for(let k=0;k<8;k++){ const val=v[idx(x+(k&1),y+((k>>1)&1),z+((k>>2)&1))]; c.push(val); if(val>T) m|=1<<k; }
      if(m===0||m===255) continue;
      [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]].forEach(([a,b])=>{ if((c[a]>T)!==(c[b]>T)){ const t=(T-c[a])/(c[b]-c[a]); sx+=(a&1)+(((b&1)-(a&1))*t); sy+=((a>>1)&1)+((((b>>1)&1)-((a>>1)&1))*t); sz+=((a>>2)&1)+((((b>>2)&1)-((a>>2)&1))*t); ne++; } });
      const px=x+sx/ne, py=y+sy/ne, pz=z+sz/ne; vid[idx(x,y,z)]=pos.length/3;
      pos.push((px-cx)*sc,1.2-(py-P)*sc,(pz-cz)*sc);
      let gx=at(Math.round(px)+1,Math.round(py),Math.round(pz))-at(Math.round(px)-1,Math.round(py),Math.round(pz)), gy=at(Math.round(px),Math.round(py)+1,Math.round(pz))-at(Math.round(px),Math.round(py)-1,Math.round(pz)), gz=at(Math.round(px),Math.round(py),Math.round(pz)+1)-at(Math.round(px),Math.round(py),Math.round(pz)-1);
      let nx=-gx, ny=gy, nz=-gz; const l=Math.hypot(nx,ny,nz)||1; nx/=l; ny/=l; nz/=l; nor.push(nx,ny,nz);
      /* 顏色：照表面朝的方向混合三張圖 */
      const fy=py-P, cf=samp(F,px-P,fy), cs=samp(Sd,pz-P,fy), cb=B?samp(B,(B.w-1)-(px-P)*B.w/F.w,fy):null;
      const wf=Math.max(0,nz), wb=Math.max(0,-nz), ws=Math.abs(nx)+Math.abs(ny)*.3; let r=0,g=0,bb=0,wt=0;
      const addc=(cc,w)=>{ if(cc&&w>0){ r+=cc[0]*w; g+=cc[1]*w; bb+=cc[2]*w; wt+=w; } }; addc(cf,wf+.05); addc(cb||cf,wb+.05); addc(cs,ws);
      col.push(wt?r/wt/255:.9,wt?g/wt/255:.9,wt?bb/wt/255:.9);
      const yn=fy/NY; gg.push(Math.max(0,Math.min(1,(split-yn)/.04+.5))); }
  /* 每一條穿過表面的邊，接成一個四邊形 */
  const quad=(a,b,c,d,flip)=>{ if(a<0||b<0||c<0||d<0) return; if(flip) ind.push(a,c,b,a,d,c); else ind.push(a,b,c,a,c,d); };
  for(let z=1;z<NZ-1;z++) for(let y=1;y<NYp-1;y++) for(let x=1;x<NX-1;x++){ const s0=v[idx(x,y,z)]>T;
      if(s0!==(v[idx(x+1,y,z)]>T)) quad(vid[idx(x,y-1,z-1)],vid[idx(x,y,z-1)],vid[idx(x,y,z)],vid[idx(x,y-1,z)],!s0);
      if(s0!==(v[idx(x,y+1,z)]>T)) quad(vid[idx(x-1,y,z-1)],vid[idx(x,y,z-1)],vid[idx(x,y,z)],vid[idx(x-1,y,z)],s0);
      if(s0!==(v[idx(x,y,z+1)]>T)) quad(vid[idx(x-1,y-1,z)],vid[idx(x,y-1,z)],vid[idx(x,y,z)],vid[idx(x-1,y,z)],!s0); }
  /* 三角形方向統一朝外（跟表面法線同一邊） */
  for(let i=0;i<ind.length;i+=3){ const a=ind[i]*3,b=ind[i+1]*3,c=ind[i+2]*3, ux=pos[b]-pos[a],uy=pos[b+1]-pos[a+1],uz=pos[b+2]-pos[a+2], vx=pos[c]-pos[a],vy=pos[c+1]-pos[a+1],vz=pos[c+2]-pos[a+2];
    const fx=uy*vz-uz*vy, fy=uz*vx-ux*vz, fz=ux*vy-uy*vx, nx=nor[a]+nor[b]+nor[c], ny=nor[a+1]+nor[b+1]+nor[c+1], nz=nor[a+2]+nor[b+2]+nor[c+2];
    if(fx*nx+fy*ny+fz*nz<0){ const t=ind[i+1]; ind[i+1]=ind[i+2]; ind[i+2]=t; } }
  return {P:new Float32Array(pos),N:new Float32Array(nor),C:new Float32Array(col),G:new Float32Array(gg),I:pos.length/3>65000?new Uint32Array(ind):new Uint16Array(ind),headY:1.2-split*.5*2.4}; }
/* 縮小到最高 480px 的去背 PNG（存起來不會太大） */
function lsViewURL(c){ const k=Math.min(1,1024/c.height), w=Math.max(4,Math.round(c.width*k)), h=Math.max(4,Math.round(c.height*k)), t=document.createElement("canvas"); t.width=w; t.height=h; t.getContext("2d").drawImage(c,0,0,w,h); return t.toDataURL("image/png"); }
const lsImg=src=>new Promise(res=>{ if(!src){ res(null); return; } const i=newImg(); i.onload=()=>res(i); i.onerror=()=>res(null); i.src=src; });
const toCanvas=im=>{ const c=document.createElement("canvas"); c.width=im.naturalWidth||im.width; c.height=im.naturalHeight||im.height; c.getContext("2d").drawImage(im,0,0); return c; };
/* ===== 三視圖框選：上傳後先自動猜位置，管理員可以自己拖、調大小、開關 =====
   設計稿上有文字、細節圖、尺寸圖也沒關係，只拿框起來的地方 */
const LS_FR=[["front","正面","#8843FB"],["side","側面","#0A84FF"],["back","背面","#FF375F"],["top","頂面","#30D158"],["emb","圖案特寫","#FF9F0A"],["exp","爆炸圖","#BF5AF2"]];
function lsFrameOpen(im,only){ const W=im.naturalWidth, H=im.naturalHeight; let A={};
  try{ A=typeof lsSheetDetect==="function"?lsSheetDetect(im):{}; }catch(e){}
  if(!A.front){ let V=[]; try{ V=lsSplitSheet(im).filter(c=>c._r&&c._r.w*c._r.h<W*H*.3); }catch(e){} LS_FR.forEach(([k],i)=>{ const r=V[i]&&V[i]._r; if(r) A[k]={x:Math.max(0,r.x-6),y:Math.max(0,r.y-6),w:Math.min(W,r.w+12),h:Math.min(H,r.h+12)}; }); }
  const def=i=>({x:W*(.04+i*.24),y:H*.05,w:W*.2,h:H*.5}), box={};
  if(only){ const r=A.front||A[only]; LS_FR.forEach(([k],i)=>{ box[k]={...(k===only?(r||{x:W*.1,y:H*.05,w:W*.8,h:H*.9}):def(i)),on:k===only}; }); }
  else LS_FR.forEach(([k],i)=>{ box[k]={...(A[k]||def(i%4)),on:i===0||!!A[k]}; });
  ui.lsFr={im,W,H,box,cur:only||"front",z:1,only,glows:A.glows}; lsFrameDraw(); }
function lsFrameDraw(){ const f=ui.lsFr; if(!f) return; const pc=(v,t)=>(v/t*100).toFixed(3)+"%";
  setLayer(`<div class="lsf"><header class="lsf-h"><button data-a="lsFrX">取消</button><b>框選視圖</b><button class="ok" data-a="lsFrOk">完成</button></header>
    <nav class="lsf-seg">${LS_FR.filter(([k])=>!f.only||k===f.only).map(([k,l,c])=>`<button class="${f.cur===k?"cur":""} ${f.box[k].on?"on":""}" style="--c:${c}" data-a="lsFrPick" data-v="${k}"><i></i>${l}</button>`).join("")}</nav>
    <div class="lsf-wrap"><div class="lsf-img" id="lsfImg" style="width:${f.z*100}%"><img src="${f.im.src}" alt="">${LS_FR.filter(([k])=>f.box[k].on||f.cur===k).map(([k,l,c])=>{ const b=f.box[k]; return `<div class="lsf-b ${f.cur===k?"cur":""} ${b.on?"":"off"}" data-k="${k}" style="--c:${c};left:${pc(b.x,f.W)};top:${pc(b.y,f.H)};width:${pc(b.w,f.W)};height:${pc(b.h,f.H)}"><em>${l}</em><i class="lsf-hd"></i></div>`; }).join("")}</div></div>
    <div class="lsf-f"><span class="lsf-z"><button data-a="lsFrZ" data-v="-1" aria-label="縮小">－</button><b>${f.z*100}%</b><button data-a="lsFrZ" data-v="1" aria-label="放大">＋</button></span>${f.cur!=="front"&&!f.only?`<button data-a="lsFrOn">${f.box[f.cur].on?"不用這個視圖":"使用這個視圖"}</button>`:""}</div></div>`,"lsframe"); }
/* 拖框、拉右下角調大小 */
document.addEventListener("pointerdown",e=>{ const b=e.target.closest(".lsf-b"); if(!b||!ui.lsFr) return; e.preventDefault(); const f=ui.lsFr, k=b.dataset.k, bx=f.box[k], host=document.getElementById("lsfImg"); if(!host) return;
  const rc=host.getBoundingClientRect(), sx=f.W/rc.width, sy=f.H/rc.height, rs=e.target.classList.contains("lsf-hd"), o={px:e.clientX,py:e.clientY,...bx};
  f.cur=k; document.querySelectorAll(".lsf-b").forEach(x=>x.classList.toggle("cur",x===b)); document.querySelectorAll(".lsf-seg button").forEach(x=>x.classList.toggle("cur",x.dataset.v===k));
  const mv=ev=>{ const dx=(ev.clientX-o.px)*sx, dy=(ev.clientY-o.py)*sy;
    if(rs){ bx.w=Math.max(20,Math.min(f.W-bx.x,o.w+dx)); bx.h=Math.max(20,Math.min(f.H-bx.y,o.h+dy)); } else { bx.x=Math.max(0,Math.min(f.W-bx.w,o.x+dx)); bx.y=Math.max(0,Math.min(f.H-bx.h,o.y+dy)); }
    b.style.left=(bx.x/f.W*100)+"%"; b.style.top=(bx.y/f.H*100)+"%"; b.style.width=(bx.w/f.W*100)+"%"; b.style.height=(bx.h/f.H*100)+"%"; };
  const up=()=>{ window.removeEventListener("pointermove",mv); window.removeEventListener("pointerup",up); window.removeEventListener("pointercancel",up); };
  window.addEventListener("pointermove",mv); window.addEventListener("pointerup",up); window.addEventListener("pointercancel",up); });
/* 框起來的地方 → 去背 → 只留最大的那一塊 */
function lsFrameCut(f,k){ const b=f.box[k]; if(!b||!b.on) return null; const s=Math.min(1,1400/Math.max(b.w,b.h)), c=document.createElement("canvas"); c.width=Math.max(8,Math.round(b.w*s)); c.height=Math.max(8,Math.round(b.h*s));
  c.getContext("2d").drawImage(f.im,b.x,b.y,b.w,b.h,0,0,c.width,c.height); let V=[]; try{ V=lsSplitSheet(c); }catch(e){} if(!V.length) return null;
  return V.sort((p,q)=>q.width*q.height-p.width*p.height)[0]; }
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a; if(!/^lsFr/.test(a)) return; const f=ui.lsFr;
  if(a==="lsFrX"){ ui.lsFr=null; layer.innerHTML=""; return; } if(!f) return;
  if(a==="lsFrPick"){ f.cur=t.dataset.v; lsFrameDraw(); return; }
  if(a==="lsFrZ"){ const Z=[1,1.5,2,3], i=Math.max(0,Math.min(Z.length-1,Z.indexOf(f.z)+(+t.dataset.v))); f.z=Z[i]; lsFrameDraw(); return; }
  if(a==="lsFrOn"){ const b=f.box[f.cur]; b.on=!b.on; if(!b.on) f.cur="front"; lsFrameDraw(); return; }
  if(a==="lsFrOk"&&f.only){ const c=lsFrameCut(f,f.only), d=ui.lsDraft; if(!c){ toast("框裡找不到應援棒，把框調到應援棒上"); return; } ui.lsFr=null; layer.innerHTML=""; if(!d) return;
    d.ds[f.only]=lsViewURL(c); d.ds.v2=1; d.ds._k=null; lsRerender(); toast("已加上，轉轉看 ✨"); return; }
  if(a==="lsFrOk"){ const fr=lsFrameCut(f,"front"); if(!fr){ toast("正面框裡找不到應援棒，把框調到應援棒上"); return; }
    ui.lsFr=null; layer.innerHTML=""; if(!lsLoad(fr)) return; const d=ui.lsDraft; if(!d) return; const sd=lsFrameCut(f,"side"), bk=lsFrameCut(f,"back"), tp=lsFrameCut(f,"top");
    const eb0=lsFrameCut(f,"emb"), eb=eb0&&eb0.height/eb0.width<1.8&&eb0.height/eb0.width>.55?eb0:null, xb=f.box.exp, X=xb&&xb.on?(()=>{ try{ const c=document.createElement("canvas"); c.width=Math.round(xb.w); c.height=Math.round(xb.h); c.getContext("2d").drawImage(f.im,xb.x,xb.y,xb.w,xb.h,0,0,c.width,c.height); return lsExpUse(c); }catch(e){ return {}; } })():{};
    d.ds.lbl=X.strapC?{strapC:X.strapC}:null; d.ds.expN=X.n||0; d.ds.side=sd?lsViewURL(sd):null; d.ds.back=bk?lsViewURL(bk):null; d.ds.top=tp?lsViewURL(tp):null; d.ds.embImg=eb?lsViewURL(eb):X.emb?lsViewURL(X.emb):null; d.ds.topImg=X.top?lsViewURL(X.top):null; d.ds.glows=f.glows||null; d.ds.dims=null; d.ds.v2=1; d.ds.front=lsViewURL(fr); d.ds.pm=null; d.ds.depth=null; d.ds._k=null; lsRerender(); lsDepthRun(fr); lsOcrRun(f.im);
    toast(sd?`用了 ${[fr,sd,bk,tp].filter(Boolean).length} 個視圖做立體 ✨`:"只用正面做；可以再加側面圖"); } });

