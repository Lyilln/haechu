/* HAECHU｜路由、畫面、應援棒 3D、登入 */
/* =========================================================
   2. 路由
   ========================================================= */
const ui={_wd:{},feedTab:"feed",notifFilter:"all",selectDraft:null,selectFilter:"all",selectQuery:"",composeText:"",composeColor:null,focusPost:null,expanded:new Set(),loginErr:""};
/* 每個 TIE 聊天室的輸入框草稿各自保留（粉絲端每位藝人一份、藝人端一份）；記在這支手機，關掉 App 也還在 */
try{ Object.assign(ui._wd,JSON.parse(localStorage.getItem("daisuki_m_wdraft")||"{}")); }catch(e){}
Object.defineProperty(ui,"wDraft",{get(){ const r=route(), k=((session()||{}).email||"")+":"+(r.role||"")+":"+(r.m||"-"); return ui._wd[k]||""; },
  set(v){ const r=route(), k=((session()||{}).email||"")+":"+(r.role||"")+":"+(r.m||"-"); if(v) ui._wd[k]=v; else delete ui._wd[k]; clearTimeout(ui._wdT); ui._wdT=setTimeout(()=>{ try{ localStorage.setItem("daisuki_m_wdraft",JSON.stringify(ui._wd)); }catch(e){} },300); }});
function route(){
  const h=location.hash.replace(/^#\/?/,""); const [path,q]=h.split("?");
  const parts=path.split("/").filter(Boolean);
  const tab=new URLSearchParams(q||"").get("tab");
  const qs=new URLSearchParams(q||"");
  return {role:parts[0]||"auth",sub:parts[1]||null,tab,m:qs.get("m"),id:qs.get("id"),p:qs.get("p")};
}
function go(role,sub,tab){ const h="#/"+role+(sub?"/"+sub:"")+(tab?"?tab="+tab:""); if(sub) { if(location.hash===h) render(); else location.hash=h; } else navRoot(h); }
/* ===== 返回的規則（三端一樣）=====
   ・底下導覽列的分頁、登入後的首頁：都是「最上層」，切換時不留紀錄
   ・從最上層點進去的頁面一層一層記下來；返回（按返回鍵、往右滑）回到「上一個頁面」
   ・在最上層就沒有上一頁（不會回到別的分頁，也不會跑出 App）
   ・App 重新整理或被系統重新載入後，還是記得原本一路點進來的頁面，返回一樣回上一頁（不會直接跳回首頁）
   ・換頁不留紀錄時，直接改網址、不經過瀏覽器事件，才不會算錯層數 */
const NAV_BOOT=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
let NAV_D=0, NAV_PEND=null, NAV_BASE=0, NAV_STK=[location.hash];

const NAV_SAVED=(()=>{ try{ const a=JSON.parse(sessionStorage.getItem("hc_nav")||"null"); return Array.isArray(a)&&a.length?a:null; }catch(e){ return null; } })();
function navSave(){ try{ sessionStorage.setItem("hc_nav",JSON.stringify(NAV_STK)); }catch(e){} }
function navSet(){ NAV_STK.length=NAV_BASE+NAV_D+1; NAV_STK[NAV_BASE+NAV_D]=location.hash; if(NAV_STK.length>40){ const cut=NAV_STK.length-40; NAV_STK=NAV_STK.slice(cut); NAV_BASE=Math.max(0,NAV_BASE-cut); } navSave(); }
function navStamp(){ const st=history.state; if(st&&st.hc===NAV_BOOT&&typeof st.d==="number") NAV_D=st.d; else { NAV_D++; try{ history.replaceState({d:NAV_D,hc:NAV_BOOT},""); }catch(e){} } navSet(); }
function navReplace(h){ ui.navUi=performance.now(); if(location.hash!==h){ try{ history.replaceState({d:NAV_D,hc:NAV_BOOT},"",h); }catch(e){} } navSet(); render(); }
function navRoot(h){ ui.navUi=performance.now(); if(NAV_D>0){ NAV_PEND=h; history.go(-NAV_D); return; } NAV_BASE=0; navReplace(h); }
function navBack(){ ui.navUi=performance.now(); if(NAV_D>0){ history.back(); return; }
  if(NAV_BASE>0){ NAV_BASE--; navReplace(NAV_STK[NAV_BASE]); return; }   // 重新載入過：照記下來的上一頁回去
  const s=session(); if(!s) return; const r=route(), home=s.uni&&r.role==="admin"?"#/admin":"#/"+(s.uni?"fan":s.role); if(location.hash!==home) navRoot(home); }
/* 回到指定的那一頁（例如離開 SNS 回到進來前的頁面）：在記錄裡就一路退回去，不在就當作最上層打開 */
function navBackTo(h){ ui.navUi=performance.now(); const cur=NAV_BASE+NAV_D; let k=-1; if(h) for(let i=cur-1;i>=0;i--){ if(NAV_STK[i]===h){ k=i; break; } }
  if(k<0){ if(h) navRoot(h); else navBack(); return; }
  const steps=cur-k; if(steps<=NAV_D){ history.go(-steps); return; } if(NAV_D>0){ NAV_PEND=h; ui.navPendBase=k; history.go(-NAV_D); return; } NAV_BASE=k; navReplace(h); }
/* 重新載入後：如果停在原本記下來的那一頁，就把前面點進來的路徑接回來 */
function navRestore(){ const a=NAV_SAVED; if(a&&a[a.length-1]===location.hash&&a.length>1){ NAV_STK=a.slice(); NAV_BASE=a.length-1; NAV_D=0; navSave(); } }
try{ history.replaceState({d:0,hc:NAV_BOOT},""); }catch(e){}
const session=()=>SS.get();

/* =========================================================
   3. 畫面
   ========================================================= */
const root=document.getElementById("root"), layer=document.getElementById("layer");
/* 同一個面板重畫時不要重播開場動畫（避免看起來像關掉又打開） */
/* 照片、影片檢視：如果已經開著一個頁面（公司頁、媒體頁…），就疊在它上面，關掉只關檢視器 */
const ovl=(()=>{ const d=document.createElement("div"); d.id="ovl"; d.style.cssText="position:relative;z-index:3"; document.body.appendChild(d); return d; })();
function ovlClose(){ ovl.querySelectorAll("video").forEach(v=>{ try{ v.pause(); }catch(e){} }); ovl.innerHTML=""; }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest("[data-a]"); if(!t||!ovl.contains(t)||t.dataset.a!=="tCloseLayer") return; if(e.target===t||t.tagName==="BUTTON"){ e.stopImmediatePropagation(); ovlClose(); } else e.stopImmediatePropagation(); },true);
function setLayer(html,key){
  if(/^\s*<div class="ph-view"/.test(html)&&layer.firstElementChild&&!layer.firstElementChild.classList.contains("ph-view")){ ovl.innerHTML=html; return; }
  if(ovl.firstElementChild) ovlClose();
  const same=!!(key&&layer.firstElementChild&&layer.firstElementChild.dataset.lk===key);
  layer.innerHTML=html; const el=layer.firstElementChild;
  if(el&&key){ el.dataset.lk=key; if(same) el.classList.add("static"); }
}

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

/* =========================================================
   待辦（使用者交代）：最後再一起做「DeepL 翻譯接上」——帶使用者在 Cloudflare 架 deepl-worker.js（key 放 Secret DEEPL_KEY，
     不能寫進 App），把 Worker 網址填到 管理員 ME → AI 粉絲 → 翻譯服務，按「測試翻譯」確認；搬到自己的網站後設 ALLOWED_ORIGIN。
   ========================================================= */

/* ===== 登入狀態：每次重新打開 App 都會先看到登入頁 ===== */
let ssMem=null;   // 只放在記憶體：關掉或重新打開就要重新登入（帳號會幫你記著）
/* 簽售報名用的「我是誰」：示範帳號沿用 fan:me，新註冊的帳號用自己的 email，報名紀錄才不會混在一起 */
const fsMeOf=v=>{ const e=v&&v.role==="fan"?String(v.email||"").toLowerCase():""; return e?"fan:"+e:"fan:me"; };
const SS={ get(){ return ssMem; }, set(v){ ssMem=v; sessSave(v); try{ FS_ME=fsMeOf(v); }catch(e){} try{ const a=v&&(!v.admin||v.uni)&&ACCOUNTS[v.email]; ME.name=(a&&a.name)||"棉花糖粉絲"; applyNick(); }catch(e){} try{ applyTheme(); }catch(e){} }, del(){ ssMem=null; sessSave(null); try{ localStorage.removeItem("daisuki_hb_auth"); }catch(e){} try{ FS_ME="fan:me"; }catch(e){} try{ ui.lk=null; lockPaint(); applyTheme(); }catch(e){} } };
/* 登入狀態：記在這支手機，3 個月內有打開過就不用重新登入（太久沒用才要再登入） */
const SESS_DAYS=90;
function sessSave(v){ try{ if(v) localStorage.setItem("daisuki_session",JSON.stringify({v,ts:Date.now()})); else localStorage.removeItem("daisuki_session"); }catch(e){} }
function sessLoad(){ try{ const o=JSON.parse(localStorage.getItem("daisuki_session")||"null"); if(!o||!o.v||Date.now()-(o.ts||0)>SESS_DAYS*864e5) return null; return o.v; }catch(e){ return null; } }
function sessTouch(){ try{ const o=JSON.parse(localStorage.getItem("daisuki_session")||"null"); if(o&&o.v&&Date.now()-(o.ts||0)>3600e3){ o.ts=Date.now(); localStorage.setItem("daisuki_session",JSON.stringify(o)); } }catch(e){} }
const isAdminAcct=()=>{ const s=session(); if(!(s&&s.admin)) return false; let k=s.email; try{ k=acctKey(s.email)||s.email; }catch(e){} const a=ACCOUNTS[k]||ACCOUNTS[s.email]; return !!(a&&a.role==="admin"); };   /* 只認後台名單上真的是管理員的帳號（測試帳號、一般粉絲就算 session 裡有 admin 也不算） */
const canModerate=()=>isAdminAcct()&&!sbxOn();   /* 管理員帳號在哪一端都能直接處理不當內容；不是管理員的帳號、試玩模式看不到 */

/* ===== 確認視窗（App 內建，取代瀏覽器的 confirm） ===== */
function ask(text,fn,{title="確認一下",ok="確定",danger=true}={}){
  ui.askFn=fn; let box=document.getElementById("askLayer"); if(!box){ box=document.createElement("div"); box.id="askLayer"; document.body.appendChild(box); }
  box.innerHTML=`<div class="t-modal-w" data-a="askX"><div class="t-modal" role="dialog" aria-label="${esc(title)}"><h3>${esc(title)}</h3><p>${esc(text)}</p>
    <div class="t-mb"><button class="t-mbtn ${danger?"danger":"main"}" data-a="askOk">${esc(ok)}</button><button class="t-mbtn" data-a="askX">取消</button></div></div></div>`;
}
const askClose=()=>{ const b=document.getElementById("askLayer"); if(b) b.innerHTML=""; };

/* ===== TIE 未讀：紅色小月亮 ===== */
const MOON='<svg viewBox="0 0 24 24"><path d="M15 3.4A8.8 8.8 0 1 0 20.6 15.6 6.4 6.4 0 0 1 15 3.4z" fill="#F43F5E" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><circle cx="18.6" cy="6.6" r="1.4" fill="#F9A8D4"/></svg>';

/* ===== 換頁動畫：進到下一層往左滑入、返回往右滑入、切分頁淡入 ===== */
function routeDepth(r,s){ if(!s) return 0; if(s.uni&&r.role==="admin"){ if(r.sub==="thedit") return 2; if(r.sub==="themes") return 1; return ["home","reports","posts","announce","foc","shopadm","people"].includes(r.tab||"home")?0:1; } if(r.sub==="chat") return r.p?2:1; if(["notifications","live","replay","core","select","look","themes","thmine","write"].includes(r.sub)) return 1; if(r.sub==="tint") return r.id?2:1; if(r.sub==="thedit") return 2; if(r.sub==="grp") return r.m?3:r.p==="about"?2:1; if(s.role==="artist"&&r.tab==="whisper") return 1; return 0; }
function pageAnim(){
  const r=route(), s=session(), key=location.hash+"|"+(s?s.role:""), d=routeDepth(r,s);
  if(key===ui.pgKey) return null;
  const prev=ui.pgKey; ui.pgKey=key; const pd=ui.pgDepth; ui.pgDepth=d;
  if(!prev) return "op";
  if(ui.secSw){ ui.secSw=false; return null; }   /* 管理員切換粉絲／藝人／管理：直接換，不閃 */
  /* SNS 裡切換分頁：跟 Instagram 一樣直接換，不做動畫（下面的分頁列才不會跟著跳） */
  if(r.sub==="grp"&&r.id&&!r.m&&new RegExp("/grp\\?id="+encodeURIComponent(r.id)+"(&p=(feed|media|shop))?\\|").test(prev)&&["home","feed","media","shop",null].includes(r.p||null)) return null;   // 社群 Home／Feed／MEET・Media／Shop 之間切換：直接換，不閃
  if(r.sub==="sns"&&prev.includes("/sns")) return ["home","reels","dm","explore"].includes(r.p||"home")||(r.p==="profile"&&!r.id)?null:"op";
  return d>pd?"push":d<pd?"pop":"fade";
}

/* ===== 下拉更新 ===== */
const PTR={y0:null,x0:0,pull:0,busy:false};
function ptrEl(){ let p=document.getElementById("ptr"); if(!p){ p=document.createElement("div"); p.id="ptr"; p.className="ptr"; p.setAttribute("aria-hidden","true");
  p.innerHTML=`<svg class="ptr-ring" viewBox="0 0 36 36"><circle class="ptr-bg" cx="18" cy="18" r="13"/><circle class="ptr-arc" cx="18" cy="18" r="13" pathLength="100"/></svg>`; document.body.appendChild(p); } return p; }
const ptrOk=()=>!document.getElementById("coach")&&!document.querySelector(".coach")&&!document.documentElement.classList.contains("tie2l")&&!document.querySelector(".crp")&&!!document.querySelector(".nav,.t-msgs")&&!((document.querySelector(".t-page")||{}).scrollTop>0)&&!layer.innerHTML.trim()&&!document.querySelector(".concert,.mr")&&window.scrollY<=0&&!(document.getElementById("askLayer")||{}).innerHTML;
function ptrSet(y){ const p=ptrEl(); p.style.transform=`translate(-50%,${y-56}px)`; p.style.opacity=Math.min(1,y/40); if(!p.classList.contains("spin")) p.querySelector(".ptr-arc").style.strokeDasharray=`${Math.min(85,y/72*85)} 100`; }
/* 手指下面有「自己會捲」而且已經往下捲的區塊（例如 SNS 整頁）：那是在往回捲，不是下拉更新 */
const ptrInner=t=>{ for(let el=t; el&&el!==document.body&&el.nodeType===1; el=el.parentElement){ if(el.scrollTop>0){ const oy=getComputedStyle(el).overflowY; if(oy==="auto"||oy==="scroll") return true; } } return false; };
document.addEventListener("touchstart",e=>{ if(PTR.busy||e.touches.length!==1||!ptrOk()||ptrInner(e.target)) { PTR.y0=null; return; } PTR.y0=e.touches[0].clientY; PTR.x0=e.touches[0].clientX; PTR.pull=0; },{passive:true});
document.addEventListener("touchmove",e=>{
  if(PTR.y0==null) return; const dy=e.touches[0].clientY-PTR.y0, dx=Math.abs(e.touches[0].clientX-PTR.x0);
  if(dy<=2){ if(dy<-6&&PTR.pull===0) PTR.y0=null; return; }
  if(window.scrollY>0||(document.querySelector(".t-page")||{}).scrollTop>0||(PTR.pull===0&&dx>dy)){ PTR.y0=null; return; }
  e.preventDefault(); PTR.pull=Math.min(130,dy*.5); const p=ptrEl(); p.classList.remove("back","spin","ok");
  ptrSet(PTR.pull,PTR.pull>72?"放開就更新 ✨":"下拉更新");
  const app=root.querySelector(".app"); if(app&&!document.querySelector(".t-msgs")) app.style.transform=`translateY(${PTR.pull*.35}px)`;   /* TIE 聊天室：只轉圈圈，標題列不跟著往下拉開 */
},{passive:false});
document.addEventListener("touchend",()=>{
  if(PTR.y0==null) return; PTR.y0=null; const p=ptrEl(), app=root.querySelector(".app");
  if(app){ app.style.transition="transform .3s"; app.style.transform=""; setTimeout(()=>{ if(app) app.style.transition=""; },320); }
  p.classList.add("back");
  if(PTR.pull>72){ PTR.busy=true; p.classList.add("spin"); ptrSet(64,"更新中…");
    try{ if(HB.tok) hbPoll(); }catch(e){}
    setTimeout(()=>{ const y=window.scrollY; ui.pgKey=null; render(); window.scrollTo(0,y); p.classList.remove("spin"); p.classList.add("ok"); ptrSet(64);
      setTimeout(()=>{ ptrSet(0); PTR.busy=false; setTimeout(()=>p.classList.remove("ok"),400); },650); },900);
  } else ptrSet(0);
  PTR.pull=0;
});

/* ===== 加到主畫面 ===== */
function openA2H(){
  tieModal("加到主畫面",`<ol class="a2h"><li><b>1</b><span>用 Safari 打開這個 App 的連結</span></li><li><b>2</b><span>點下方的「分享」按鈕（方框加向上箭頭）</span></li><li><b>3</b><span>往下找「加入主畫面」，名稱填「HAECHU」後按「新增」</span></li></ol>
    <p class="a2h-n">之後從主畫面的圖示就能直接打開。現在這個版本放在 Claude 的頁面裡，打開時上方還會看到瀏覽器的列；要變成完全全螢幕的 App，需要把它放到自己的網址上。</p>`,`<button class="t-mbtn main" data-a="tCloseLayer">知道了</button>`);
}

/* ===== TIE BOX：照片、語音（存在這支手機的 IndexedDB） ===== */
const memBlobs={};
/* 上傳追蹤：照片／影片放進手機後馬上傳雲端；發文前會等它傳完；傳失敗的記下來，之後自動重傳（不然別人看到的是沒有照片的貼文） */
const UPQ={}, UPQ_K="daisuki_m_upq";
const upqGet=()=>{ try{ return JSON.parse(localStorage.getItem(UPQ_K)||"[]"); }catch(e){ return []; } }, upqSet=L=>{ try{ localStorage.setItem(UPQ_K,JSON.stringify([...new Set(L)].slice(-200))); }catch(e){} };
function upTrack(id,blob){ const o=UPQ[id]={done:false,ok:false}; o.p=Promise.resolve().then(()=>hbUpload(id,blob)).then(ok=>{ o.done=true; o.ok=!!ok; if(ok) upqSet(upqGet().filter(x=>x!==id)); else upqSet([...upqGet(),id]); return o.ok; }).catch(()=>{ o.done=true; upqSet([...upqGet(),id]); return false; }); return o.p; }
async function upRetry(){ try{ if(!HB_ON||!HB.tok||sbxOn()) return; for(const id of upqGet()){ if(UPQ[id]&&!UPQ[id].done) continue; const b=memBlobs[id]||await (async()=>{ try{ const d=await MDB.open(); return await new Promise(res=>{ const q=d.transaction("m").objectStore("m").get(id); q.onsuccess=()=>{ const v=q.result; res(v&&v.ab?new Blob([v.ab],{type:v.type||""}):v||null); }; q.onerror=()=>res(null); }); }catch(e){ return null; } })(); if(!b){ upqSet(upqGet().filter(x=>x!==id)); continue; } await upTrack(id,b); } }catch(e){} }
setInterval(upRetry,30e3); setTimeout(upRetry,8e3);
async function upWait(ids){ const P=ids.filter(id=>id&&UPQ[id]).map(id=>UPQ[id].p); if(!P.length) return true; const r=await Promise.race([Promise.all(P),new Promise(res=>setTimeout(()=>res(null),90e3))]); return Array.isArray(r)&&r.every(Boolean); }
/* 發文按下去：照片／影片還在傳，就先等傳完再發 */
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="publish"],[data-a="snPost"]'); if(!t||t.dataset.upOk) return;
  const ids=t.dataset.a==="publish"?(ui.composeMedia||[]).flatMap(m=>[m.mid,m.thumb]):((ui.snDraft||{}).media||[]).flatMap(m=>[m.mid,m.poster]);
  const pend=ids.filter(id=>id&&UPQ[id]&&!UPQ[id].done); if(!pend.length) return; e.stopImmediatePropagation(); e.preventDefault(); if(t.dataset.upWait) return; t.dataset.upWait="1"; toast("照片／影片上傳中，傳完會自動發布…");
  upWait(pend).then(ok=>{ delete t.dataset.upWait; if(!ok) toast("有檔案還沒傳完，先發布，傳完後大家就看得到"); const b=t.isConnected?t:document.querySelector(`[data-a="${t.dataset.a}"]`); if(!b) return; b.dataset.upOk="1"; b.click(); delete b.dataset.upOk; }); },true);
const MDB={
  db:null,
  open(){ if(!this.db) this.db=new Promise((res,rej)=>{ try{ const r=indexedDB.open("daisuki_media",1); r.onupgradeneeded=()=>r.result.createObjectStore("m"); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }catch(e){ rej(e); } }); return this.db; },
  async put(id,blob,noUp){ memBlobs[id]=blob; if(!noUp) upTrack(id,blob);  try{ const val={ab:await blob.arrayBuffer(),type:blob.type||""};   // 存成原始資料：iPhone 上直接存檔案，重開後會讀不出來
      const d=await this.open(); await new Promise((res,rej)=>{ const tx=d.transaction("m","readwrite"); tx.objectStore("m").put(val,id); tx.oncomplete=res; tx.onerror=()=>rej(tx.error); }); }catch(e){} },
  async get(id){ if(memBlobs[id]) return memBlobs[id];
    let b=null; try{ const d=await this.open(); b=await new Promise(res=>{ const q=d.transaction("m").objectStore("m").get(id); q.onsuccess=()=>res(q.result||null); q.onerror=()=>res(null); }); }catch(e){}
    if(b&&b.ab) b=new Blob([b.ab],{type:b.type||""});
    else if(b){ try{ b=new Blob([await b.arrayBuffer()],{type:b.type||""}); }catch(e){ b=null; } }   // 舊版存的檔案：讀得出來就轉成新的，讀不出來就當作沒有
    if(!b){ try{ const du=localStorage.getItem("daisuki_m_"+id); if(du) b=b64Blob(du); }catch(e){} }
    if(!b){ b=await hbDownload(id); if(b&&b.size<45*1024*1024) this.put(id,b,true); }   /* 大影片不存進手機資料庫（iPhone 記憶體會爆） */
    if(b) memBlobs[id]=b; return b; }
};
async function idbHas(id){ try{ const d=await MDB.open(); return await new Promise(res=>{ const q=d.transaction("m").objectStore("m").get(id); q.onsuccess=()=>res(!!q.result); q.onerror=()=>res(false); }); }catch(e){ return false; } }
const mediaURL={};
async function mediaSrc(id){ if(mediaURL[id]) return mediaURL[id]; const b=await MDB.get(id); if(!b) return null; return mediaURL[id]=URL.createObjectURL(b); }
/* 圖片：記下每張圖的長寬比，畫面重畫時先把高度留好，圖還沒解碼也不會塌下去再彈回來（公司公告一閃一閃） */
const IMR=new Map(); document.addEventListener("load",e=>{ const im=e.target; if(im&&im.tagName==="IMG"&&im.naturalWidth){ const k=im.getAttribute("src"); if(k&&!IMR.has(k)) IMR.set(k,im.naturalWidth+" / "+im.naturalHeight); } },true);
function imgKeep(scope){ try{ scope.querySelectorAll("img[src]").forEach(im=>{ const r=IMR.get(im.getAttribute("src")); if(r&&!im.style.aspectRatio) im.style.aspectRatio=r; }); }catch(e){} }
/* 日期欄位：選到 min 之前／max 之後，直接拉回能選的那天（不跳提示） */
["change","input","blur"].forEach(k=>document.addEventListener(k,e=>{ const el=e.target; if(!el||el.tagName!=="INPUT"||el.type!=="date"||!el.value) return; if(el.min&&el.value<el.min) el.value=el.min; else if(el.max&&el.value>el.max) el.value=el.max; },true));
function hydrateMedia(scope){ imgKeep(scope); try{ scope.querySelectorAll(".pd button.pm-video[data-mid]").forEach(b=>setTimeout(()=>pmInline(b,false),60)); }catch(e){} scope.querySelectorAll(".t-vc[data-vid]").forEach(v=>{ mediaSrc(v.dataset.vid); });
  scope.querySelectorAll("img[data-mid]:not([data-hyd])").forEach(async el=>{ el.dataset.hyd="1"; const u=await mediaSrc(el.dataset.mid); if(u) el.src=u; else { const b=el.closest(".t-photo,button"); if(b) b.classList.add("gone"); } }); }
const fmtDur=s=>{ s=Math.max(0,Math.round(s||0)); return Math.floor(s/60)+":"+pad(s%60); };

function mediaBubble(w){
  if(w.kind==="photo") return `<button class="t-photo" data-a="tPhoto" data-mid="${w.mid}" data-ts="${w.ts}" style="aspect-ratio:${w.w||3}/${w.h||4}" aria-label="照片"><img data-mid="${w.mid}" alt="照片"></button>`;
  if(w.kind==="voice") return `<div class="t-vc" data-vid="${w.mid}" ${w.from==="artist"&&w.id&&(session()||{}).role==="fan"?`data-lp="${w.id}"`:""} data-a="tVoice" data-mid="${w.mid}" role="button" aria-label="播放語音"><span class="t-vplay">${VPLAY}</span><span class="t-wave">${[46,78,100,62,88].map(h=>`<i style="height:${h}%"></i>`).join("")}</span><em>${fmtDur2(w.dur)}</em></div>`;
  return "";
}
/* 語音播放：同一時間只播一則 */
const VP={a:null,mid:null};
const VPLAY='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.6v14.8c0 .8.9 1.3 1.6.9l12-7.4c.6-.4.6-1.3 0-1.7l-12-7.4C7.9 3.3 7 3.8 7 4.6z"/></svg>';
const VPAUSE='<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4.2" height="15" rx="1.4"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1.4"/></svg>';
const fmtDur2=s=>{ s=Math.max(0,Math.round(s||0)); return pad(Math.floor(s/60))+":"+pad(s%60); };
function vpUI(){ document.querySelectorAll(".t-vc").forEach(v=>{ const on=v.dataset.vid===VP.mid&&VP.a&&!VP.a.paused; const b=v.querySelector(".t-vplay"); if(b) b.innerHTML=on?VPAUSE:VPLAY; v.classList.toggle("playing",!!on);
  const bars=v.querySelectorAll(".t-wave i"), p=v.dataset.vid===VP.mid&&VP.a&&VP.a.duration?VP.a.currentTime/VP.a.duration:0; bars.forEach((x,i)=>x.classList.toggle("on",i/bars.length<p)); }); }
function playVoice(mid){   // iPhone 要在點下去的那一刻就開始播，所以先準備好音檔網址
  if(!VP.a){ VP.a=new Audio(); VP.a.preload="auto"; VP.a.ontimeupdate=vpUI; VP.a.onended=()=>{ VP.a.currentTime=0; vpUI(); }; VP.a.onpause=vpUI; VP.a.onplay=()=>{ vpUI(); const f=()=>{ if(VP.a&&!VP.a.paused){ vpUI(); requestAnimationFrame(f); } }; requestAnimationFrame(f); }; }
  const A=VP.a;
  if(VP.mid===mid&&A.src){ if(A.paused) A.play().catch(()=>{}); else A.pause(); vpUI(); return; }
  A.pause(); VP.mid=mid;
  const go=u=>{ A.src=u; A.currentTime=0; A.play().then(vpUI).catch(err=>{ if(err&&err.name==="NotAllowedError") toast("再點一次就能播放"); else toast("這個音檔格式無法播放，換成 m4a 或 mp3 試試"); vpUI(); }); };
  if(mediaURL[mid]) go(mediaURL[mid]);
  else { A.play().catch(()=>{}); mediaSrc(mid).then(u=>{ if(!u){ toast("這則語音已經不在這支手機上了"); return; } if(VP.mid===mid) go(u); }); }
  vpUI();
}
function openPhoto(mid,ts){
  /* TIE 裡藝人傳的照片：粉絲可以收藏到 TIE BOX */
  const w=(session()||{}).role==="fan"&&route().m?fanRoom(route().m).find(x=>x.mid===mid&&x.from==="artist"):null, kept=w&&(S.get(K.boxKeep,[])||[]).includes(w.id);
  setLayer(`<div class="ph-view" data-a="tCloseLayer" role="dialog" aria-label="照片"><button class="ph-x" data-a="tCloseLayer" aria-label="關閉">${XI}</button>${w?`<button class="ph-keep ${kept?"on":""}" data-a="${kept?"boxDel":"tKeep"}" data-id="${w.id}" aria-label="${kept?"從 TIE BOX 移除":"收藏到 TIE BOX"}">${kept?"已收藏":"收藏到 "+WHISPER_NAME+" BOX"}</button>`:""}<img data-mid="${mid}" alt="照片"><small>${ts?ymd(+ts)+" "+timeHM(+ts):""}</small></div>`,"photo");
  hydrateMedia(layer);
}
async function prepPhoto(file){   // 縮到長邊 1280，省空間
  const url=URL.createObjectURL(file); const img=await new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=url; });
  const k=Math.min(1,1080/Math.max(img.width,img.height)), c=document.createElement("canvas"); c.width=Math.round(img.width*k); c.height=Math.round(img.height*k);
  c.getContext("2d").drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(url);
  const blob=await new Promise(res=>c.toBlob(res,"image/jpeg",.8)); return {blob,w:c.width,h:c.height};
}
function audioDur(blob){ return new Promise(res=>{ const a=new Audio(), u=URL.createObjectURL(blob); let done=false; const fin=v=>{ if(done) return; done=true; URL.revokeObjectURL(u); res(v); };
  a.preload="metadata"; a.onloadedmetadata=()=>fin(isFinite(a.duration)?a.duration:0); a.onerror=()=>fin(0); setTimeout(()=>fin(0),4000); a.src=u; }); }
function sendWhisperMedia(memberId,kind,mid,meta){
  const m=MEMBERS[memberId], label=kind==="photo"?"📷 照片":"🎙️ 語音";
  S.set(K.whispers,[...S.get(K.whispers,[]),{id:"w"+Date.now(),member:memberId,from:"artist",kind,mid,text:label,ts:Date.now(),...meta}]);
  return feedPush({kind:"whisper",member:memberId,group:m.group,text:kind==="photo"?"📷 照片":"🎙️ 語音",color:null,direct:true},"tie:"+memberId);
}
function openAttach(){
  tieModal("傳照片或語音",`<div class="t-att">
    <label><span>📷</span><div>照片<small>從相簿選，或直接拍一張</small></div><input type="file" id="attPhoto" accept="image/*"></label>
    <label><span>🎙️</span><div>語音<small>選一個錄好的音檔（例如語音備忘錄）</small></div><input type="file" id="attVoice" accept="audio/*,.m4a,.mp3,.wav,.aac"></label></div>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button>`);
}
/* 側邊選單左下：藝人在你訂閱期間傳的照片、影片（訂閱前的看不到），依日期分組，一列 3 格 */
function viewTieGallery(member){ const L=fanRoom(member).filter(w=>w.from==="artist"&&(w.kind==="photo"||w.kind==="video")).sort((a,b)=>b.ts-a.ts); const by={};
  L.forEach(w=>{ const k=ymd(w.ts); (by[k]=by[k]||[]).push(w); });
  return `<div class="t-page"><header class="t-ph"><button class="t-ib" data-a="back" aria-label="返回">${TI.back}</button><h3>照片・影片</h3><span class="t-ph-sp"></span></header>
    ${L.length?Object.entries(by).map(([d,ws])=>`<h4 class="tg-d">${d}</h4><div class="tb-grid">${ws.map(w=>`<button data-a="tPhoto" data-mid="${w.mid}" data-ts="${w.ts}" aria-label="照片"><img data-mid="${w.mid}" alt="">${w.kind==="video"?`<em>▶</em>`:""}</button>`).join("")}</div>`).join("")
      :`<p class="tb-empty">還沒有收到 ${esc(artName(member,"tie"))} 的照片或影片<br><small>訂閱之前傳的照片、影片看不到喔</small></p>`}</div>`; }
/* TIE BOX（照 Bubble 的 OUR BOX）：長按藝人的訊息（文字、照片、語音都可以）收藏到這裡；最多 BOX_MAX 則 */
const BOX_MAX=9;
function viewTieBox(member){
  const KS=S.get(K.boxKeep,[])||[], room=fanRoom(member), keep=KS.map(id=>room.find(w=>w.id===id&&w.from==="artist")).filter(Boolean).reverse(), ed=!!ui.boxEdit;
  const item=w=>`<div class="ob-it ${ed?"ed":""}">${ed?`<button class="ob-x" data-a="boxDel" data-id="${w.id}" aria-label="移除">${XI}</button>`:""}
      ${w.kind==="photo"?`<button class="ob-ph" data-a="tPhoto" data-mid="${w.mid}" data-ts="${w.ts}" aria-label="照片"><img data-mid="${w.mid}" alt=""></button>`:w.kind?mediaBubble(w):`<div class="ob-tx">${nickify(esc(w.ko||w.text),member)}</div>`}
      <small>${ymd(w.ts)}</small></div>`;
  return `<div class="t-page ob"><header class="ob-h"><button class="t-ib" data-a="back" aria-label="返回">${TI.back}</button><span></span>${keep.length?`<button class="t-ib ${ed?"ob-done":""}" data-a="boxEdit" aria-label="${ed?"完成":"編輯"}">${ed?"完成":`<span class="ob-dots"><i></i><i></i><i></i></span>`}</button>`:`<span class="t-ib"></span>`}</header>
    <h2 class="ob-t">${WHISPER_NAME} BOX</h2><div class="ob-n"><b>${keep.length}</b> / ${BOX_MAX}</div>
    ${keep.length?`<div class="ob-list">${keep.map(item).join("")}</div>`:`<p class="ob-empty">沒有收藏的訊息<br>請自由收藏聊天室裡的訊息:)</p>`}</div>`;
}
/* 示範：露娜的聊天室先放一張照片、一則語音 */


