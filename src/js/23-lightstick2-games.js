/* HAECHU｜應援棒 3D 第二代、運動會小遊戲 */
/* =========================================================
   應援棒 3D（第二代）：全部在手機上算，不用任何 API、不用錢
   1. lsSheetDetect：看懂「設計稿」的排版 —— 上排同一列、又高又細的是正面／側面／背面（左到右），
      旁邊接近圓形的是頂面；文字、小照片（方框）、下半部的爆炸圖都排除
   2. lsPartsMesh：拆零件 —— 依寬度、顏色把應援棒切成幾段
      ・左右對稱、正面側面差不多寬 → 轉一圈（旋轉體，表面最平滑）
      ・不對稱（愛心、皇冠…）→ 用正面輪廓鼓起來，厚度照側面（有深度圖就照深度圖）
      ・比主體多出來的（環、翅膀、吊飾）→ 做成有厚度的薄片
      ・顏色照各視圖投影；材質自動判斷：透明（玻璃）、金屬、塑膠；燈頭會發光
   3. lsDepth（可選）：手機上的 AI 小模型估計深度（第一次下載約 30MB，只有管理員做一次），
      算好的深度圖存起來，粉絲打開時不用再算
   ========================================================= */

/* ===== 1. 看懂設計稿 ===== */
function lsSheetDetect(img){ let W=img.naturalWidth||img.width, H=img.naturalHeight||img.height; const k=Math.min(1,900/Math.max(W,H)), w=Math.max(8,Math.round(W*k)), h=Math.max(8,Math.round(H*k));
  const cv=document.createElement("canvas"); cv.width=w; cv.height=h; const x=cv.getContext("2d",{willReadFrequently:true}); x.drawImage(img,0,0,w,h); const d=x.getImageData(0,0,w,h).data, n=w*h;
  /* 背景：跟附近的底色差不多、又很淡的地方（設計稿常常是漸層底） */
  const lum=i=>(d[i*4]*.3+d[i*4+1]*.59+d[i*4+2]*.11), sat=i=>{ const r=d[i*4],g=d[i*4+1],b=d[i*4+2], mx=Math.max(r,g,b), mn=Math.min(r,g,b); return mx?(mx-mn)/mx:0; };
  const bgLike=i=>d[i*4+3]<24||(lum(i)>226&&sat(i)<.12);
  const fg=new Uint8Array(n); for(let i=0;i<n;i++) fg[i]=bgLike(i)?0:1;
  /* 連在一起的區塊 */
  const lab=new Int32Array(n), comps=[], st=[]; let cur=0;
  for(let s=0;s<n;s++){ if(!fg[s]||lab[s]) continue; cur++; let a=0,x0=w,x1=0,y0=h,y1=0; lab[s]=cur; st.push(s);
    while(st.length){ const i=st.pop(), px=i%w, py=(i/w)|0; a++; if(px<x0)x0=px; if(px>x1)x1=px; if(py<y0)y0=py; if(py>y1)y1=py;
      for(const j of [px>0?i-1:-1,px<w-1?i+1:-1,py>0?i-w:-1,py<h-1?i+w:-1]) if(j>=0&&fg[j]&&!lab[j]){ lab[j]=cur; st.push(j); } }
    if(a>=12) comps.push({a,x0,x1,y0,y1}); }
  /* 同一支應援棒被縫隙切開（燈頭、握把、吊繩）：左右重疊、上下很近的併起來 */
  comps.sort((p,q)=>p.y0-q.y0); const G=[];
  comps.forEach(c=>{ if(c.a<n*.0006) return; const g=G.find(g=>{ const ov=Math.min(g.x1,c.x1)-Math.max(g.x0,c.x0); return ov>Math.min(g.x1-g.x0,c.x1-c.x0)*.45&&c.y0-g.y1<h*.03; });
    if(g){ g.a+=c.a; g.x0=Math.min(g.x0,c.x0); g.x1=Math.max(g.x1,c.x1); g.y0=Math.min(g.y0,c.y0); g.y1=Math.max(g.y1,c.y1); g.n++; } else G.push({...c,n:1}); });
  G.forEach(g=>{ g.w=g.x1-g.x0+1; g.h=g.y1-g.y0+1; g.fill=g.a/(g.w*g.h); g.asp=g.h/g.w; });
  /* 正面／側面／背面：又高又細、不是實心方框、上下對齊在同一排，最多的那一排 */
  const tall=G.filter(g=>g.h>=h*.22&&g.asp>=1.7&&g.fill<.86);
  let best=[]; tall.forEach(a=>{ const row=tall.filter(b=>Math.abs(b.y0-a.y0)<h*.06&&Math.abs(b.y1-a.y1)<h*.08&&Math.abs(b.h-a.h)<a.h*.18); if(row.length>best.length||(row.length===best.length&&row.reduce((s,r)=>s+r.a,0)>best.reduce((s,r)=>s+r.a,0))) best=row; });
  best=best.sort((p,q)=>p.x0-q.x0).slice(0,3);
  const out={}; const box=g=>({x:Math.max(0,(g.x0-4)/k),y:Math.max(0,(g.y0-4)/k),w:Math.min(W,(g.w+8)/k),h:Math.min(H,(g.h+8)/k)});
  if(best[0]) out.front=box(best[0]); if(best[1]) out.side=box(best[1]); if(best[2]) out.back=box(best[2]);
  /* 頂面：同一排上半部、接近圓形、寬度跟燈頭差不多 */
  if(best[0]){ const r=best[0], used=new Set(best), headW=r.w; const tp=G.filter(g=>!used.has(g)&&g.asp>.7&&g.asp<1.4&&g.w>headW*.5&&g.w<headW*1.6&&g.y0>=r.y0-h*.05&&g.y1<=r.y0+r.h*.6&&g.fill>.45&&g.fill<.9).sort((p,q)=>q.a-p.a)[0]; if(tp) out.top=box(tp); }
  /* 發光照：暗暗的方形照片，裡面最亮、最鮮豔的顏色就是那一種燈光色 */
  const glows=[]; G.filter(g=>g.fill>.86&&g.w>w*.05&&g.h>h*.05&&!best.includes(g)).forEach(g=>{ let L=0,n=0; const bins={};
    for(let y=g.y0;y<=g.y1;y+=2) for(let x=g.x0;x<=g.x1;x+=2){ const i=y*w+x, r=d[i*4],gg=d[i*4+1],b=d[i*4+2], mx=Math.max(r,gg,b), mn=Math.min(r,gg,b); L+=mx; n++; if(mx<140||(mx-mn)/mx<.4) continue;
      let hh=0; if(mx===r) hh=((gg-b)/(mx-mn)+6)%6; else if(mx===gg) hh=(b-r)/(mx-mn)+2; else hh=(r-gg)/(mx-mn)+4; const k2=Math.floor(hh*4)%24, B=bins[k2]||(bins[k2]={n:0,r:0,g:0,b:0}); B.n++; B.r+=r; B.g+=gg; B.b+=b; }
    if(!n||L/n>150) return; const top=Object.values(bins).sort((p,q)=>q.n-p.n)[0]; if(!top||top.n<20) return;
    const hex="#"+[top.r,top.g,top.b].map(v=>Math.round(Math.min(255,v/top.n*1.08)).toString(16).padStart(2,"0")).join("");
    const near=glows.some(x=>{ const a=parseInt(x.slice(1),16), c=parseInt(hex.slice(1),16); return Math.abs((a>>16)-(c>>16))+Math.abs(((a>>8)&255)-((c>>8)&255))+Math.abs((a&255)-(c&255))<70; }); if(!near) glows.push(hex); });
  if(glows.length) out.glows=glows.slice(0,8);
  /* 爆炸圖：細線（標註的引線）先削掉，再找「一直排、分開的零件」 */
  { const ex=lsExpFind(d,w,h,best); if(ex) out.exp={x:Math.max(0,(ex.x0-6)/k),y:Math.max(0,(ex.y0-6)/k),w:Math.min(W,(ex.x1-ex.x0+12)/k),h:Math.min(H,(ex.y1-ex.y0+12)/k)}; }
  return out; }

/* ===== 2. 拆零件做 3D ===== */
function lsRead(c,NY){ const w=Math.max(4,Math.round(c.width*NY/c.height)), t=document.createElement("canvas"); t.width=w; t.height=NY; const x=t.getContext("2d",{willReadFrequently:true}); x.drawImage(c,0,0,w,NY); return {w,h:NY,d:x.getImageData(0,0,w,NY).data}; }
function lsRows(V){ const R=[]; for(let y=0;y<V.h;y++){ let L=-1,Rr=-1,cnt=0,r=0,g=0,b=0; for(let x=0;x<V.w;x++){ const q=(y*V.w+x)*4; if(V.d[q+3]>=128){ if(L<0) L=x; Rr=x; cnt++; r+=V.d[q]; g+=V.d[q+1]; b+=V.d[q+2]; } }
    R.push(L<0?null:{L,R:Rr,w:Rr-L+1,cx:(L+Rr)/2,fill:cnt/(Rr-L+1),c:[r/cnt,g/cnt,b/cnt]}); } return R; }
const lsHsl=([r,g,b])=>{ r/=255; g/=255; b/=255; const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2, s=mx===mn?0:l>.5?(mx-mn)/(2-mx-mn):(mx-mn)/(mx+mn); return {l,s}; };
function lsSample(V,x,y){ const xx=Math.max(0,Math.min(V.w-1,Math.round(x))), yy=Math.max(0,Math.min(V.h-1,Math.round(y))), q=(yy*V.w+xx)*4; return V.d[q+3]>40?[V.d[q]/255,V.d[q+1]/255,V.d[q+2]/255]:null; }
/* 零件材質：自動判斷，管理員可以在零件清單點一下改 */
const LS_MATS=["glass","metal","pearl","plastic","glow","off"], LS_MATN={glass:"玻璃",metal:"金屬",pearl:"珍珠",plastic:"塑膠",glow:"發光",off:"隱藏"};
function lsPartsMesh(front,side,back,top,depth,split,pm,embC,dims,lbl,topC){ pm=pm||{}; lbl=lbl||{};
  const NY=320, F=lsRead(front,NY), S=side?lsRead(side,NY):null, B=back?lsRead(back,NY):null, D=depth?lsRead(depth,NY):null, FR=lsRows(F), SR=S?lsRows(S):null, BR=B?lsRows(B):null;
  const sc=2.6/NY, Y=y=>1.3-y*sc, headEnd=Math.round(NY*(split||.45)), W=F.w;
  const med=a=>{ const b=a.slice().sort((p,q)=>p-q); return b[b.length>>1]; };
  const CX=med(FR.filter(Boolean).map(r=>r.cx))||W/2, SX=SR?med(SR.filter(Boolean).map(r=>r.cx))||S.w/2:0, BX=BR?med(BR.filter(Boolean).map(r=>r.cx))||B.w/2:0;
  /* 每一行主體半徑（從中心線往兩邊「連續」的那段，算到小數點） */
  const ext=(V,R,cx)=>R.map((r,y)=>{ if(!r) return 0; const al=x=>{ const xx=Math.round(x); return xx<0||xx>=V.w?0:V.d[(y*V.w+xx)*4+3]; }; let a=0,b=0,x;
      for(x=cx;al(x)>=128;x--) a++; a+=al(x)/255; for(x=cx;al(x)>=128;x++) b++; b+=al(x)/255; return Math.min(a,b); });
  const rawF=ext(F,FR,CX), rawS=SR?ext(S,SR,SX):null;
  /* 切段：寬度跳很多、顏色差很多、或燈頭分界 */
  const cd=(a,b)=>a&&b?Math.hypot(a.c[0]-b.c[0],a.c[1]-b.c[1],a.c[2]-b.c[2]):0, segs=[]; let s0=-1;
  for(let y=0;y<=NY;y++){ const on=y<NY&&rawF[y]>.5; if(on&&s0<0) s0=y; const brk=on&&s0>=0&&y>s0+3&&(Math.abs(rawF[y]-rawF[y-1])>Math.max(3,rawF[y-1]*.22)||cd(FR[y],FR[y-1])>60||y===headEnd);
    if((!on||brk)&&s0>=0){ segs.push([s0,y]); s0=on?y:-1; } }
  const SG=[]; segs.forEach(s=>{ if(SG.length&&s[1]-s[0]<5&&SG[SG.length-1][1]===s[0]) SG[SG.length-1][1]=s[1]; else SG.push(s.slice()); });
  /* 段內抹平（不跨段，球和頂端裝飾才不會黏成一顆蛋） */
  const smooth=(raw,y0,y1)=>{ const R=y1-y0>40?9:3; for(let y=y0;y<y1;y++){ let s=0,w=0; for(let k=-R;k<=R;k++){ const u=y+k; if(u<y0||u>=y1||!raw[u]) continue; const q=R+1-Math.abs(k); s+=raw[u]*q; w+=q; } raw.__s=raw.__s||[]; raw.__s[y]=w?s/w:raw[y]; } };
  SG.forEach(([a,b])=>{ smooth(rawF,a,b); if(rawS) smooth(rawS,a,b); });
  const core=rawF.map((v,y)=>(rawF.__s&&rawF.__s[y])||v), score=rawS?rawS.map((v,y)=>(rawS.__s&&rawS.__s[y])||v):null;
  const parts=[];
  SG.forEach(([y0,y1])=>{ const rows=[]; for(let y=y0;y<y1;y++) rows.push(y); const fw=rows.map(y=>core[y]), sw=score?rows.map(y=>score[y]):null;
    const avgF=fw.reduce((a,b)=>a+b,0)/fw.length, avgS=sw?sw.reduce((a,b)=>a+b,0)/sw.length:avgF, sym=rows.every(y=>{ const r=FR[y]; return !r||Math.abs(r.cx-CX)<Math.max(2,r.w*.12); });
    let ext2=0, dir=0; for(let i=2;i<fw.length;i+=2){ const d=fw[i]-fw[i-2]; const s=d>1.2?1:d<-1.2?-1:0; if(s&&dir&&s!==dir) ext2++; if(s) dir=s; }   // 寬度忽大忽小（星星、皇冠）就不是轉一圈的形狀
    const col=rows.map(y=>FR[y]).filter(Boolean), mc=[0,1,2].map(i=>col.reduce((s,r)=>s+r.c[i],0)/Math.max(1,col.length)), hs=lsHsl(mc);
    let vr=0; col.forEach(r=>{ const l=(r.c[0]+r.c[1]+r.c[2])/765; vr+=(l-hs.l)**2; }); vr=Math.sqrt(vr/Math.max(1,col.length));
    const head=y0<headEnd, lathe=sym&&ext2<=2&&(!sw||avgS>avgF*.45);
    parts.push({y0,y1,lathe,head,avgF,hs,vr,mc,area:avgF*(y1-y0)}); });
  /* 認零件：燈泡（燈頭裡最大的那段）、頂端裝飾、握把（燈頭以外最大）、掛繩（最下面、很細） */
  const bulb=parts.filter(p=>p.head&&p.lathe).sort((a,b)=>b.area-a.area)[0], grip=parts.filter(p=>!p.head).sort((a,b)=>b.area-a.area)[0];
  parts.forEach((p,i)=>{ p.key="p"+i;
    if(p===bulb) p.label="燈頭"; else if(p===grip) p.label="握把"; else if(bulb&&p.y1<=bulb.y0) p.label="頂端裝飾"; else if(p.head) p.label="燈頭底座"; else if(grip&&p.y0>=grip.y1&&p.avgF<grip.avgF*.6&&i===parts.length-1){ p.label="掛繩"; p.swing=1; } else p.label=grip&&p.y0>=grip.y1?"底座":"零件";
    p.auto=p===bulb&&p.hs.l>.6&&p.hs.s<.5?"glass":p.hs.s<.14&&p.vr>.04&&p.hs.l>.3&&p.hs.l<.88&&(p.y1-p.y0)<NY*.12?"metal":p.hs.l>.78&&p.hs.s<.25?"pearl":"plastic";
    const kind={頂端裝飾:"top",燈頭:"bulb",燈頭底座:"collar",底座:"collar",握把:"grip",掛繩:"strap"}[p.label]; if(lbl.mat&&lbl.mat[kind]&&lbl.mat[kind]!=="rope") p.auto=lbl.mat[kind]; if(lbl.name&&lbl.name[kind]) p.label=lbl.name[kind];
    p.mat=pm[p.key]||p.auto; });
  /* 燈泡用圓／橢圓來對：環、裝飾黏在球邊時，把它們從球身分出來 */
  if(bulb){ const cy=(bulb.y0+bulb.y1)/2, ry=(bulb.y1-bulb.y0)/2, mid=[]; for(let y=bulb.y0;y<bulb.y1;y++){ const u=(y+.5-cy)/ry; if(Math.abs(u)<.75&&core[y]) mid.push(core[y]/Math.sqrt(1-u*u)); } mid.sort((a,b)=>a-b); const Rb=Math.min(mid[Math.floor(mid.length*.2)]||1e9,(()=>{ const v=[]; for(let y=bulb.y0;y<bulb.y1;y++) if(core[y]) v.push(core[y]); v.sort((a,b)=>a-b); return v[Math.floor(v.length*.75)]||core[Math.round(cy)]; })());
    bulb.fit=y=>Rb*Math.sqrt(Math.max(0,1-((y+.5-cy)/ry)**2)); for(let y=bulb.y0;y<bulb.y1;y++){ const f=bulb.fit(y); if(core[y]>f*1.03) core[y]=Math.max(.5,f); }
    /* 燈泡要正圓：上下比左右長的話，用左右的半徑做球（底部貼著底座），上面的裝飾一起往下移 */
    bulb.Rb=Rb; if(Math.abs(ry-Rb)<Rb*.35){ const c2=bulb.y1-Rb, top=Math.round(c2-Rb), dy=top-bulb.y0; bulb.sph={c:c2,R:Rb}; parts.forEach(q=>{ if(q.y1<=bulb.y0) q.dy=dy; }); bulb.y0=Math.max(0,top); } }   // 球幾乎都是正圓：上下左右差不到 35% 就做正球
  if(bulb&&dims&&dims.L&&dims.D){ const body=parts.filter(q=>!q.swing), want=dims.D/dims.L*(body.reduce((s,q)=>Math.max(s,q.y1),0)-body.reduce((s,q)=>Math.min(s,q.y0),NY)), k=Math.max(.8,Math.min(1.25,want/(2*bulb.Rb))); if(Math.abs(k-1)>.03) bulb.k=k; }
  const meshes=[], info=[]; const glowOf=p=>p.mat==="glow"?1:p.mat==="glass"?.15:p.head?.6:0;
  const colorAt=(x,y,z,nx,nz)=>{ const wf=Math.max(0,nz), wb=Math.max(0,-nz), ws=Math.abs(nx); let c=[0,0,0], t=0; const add=(cc,w)=>{ if(cc&&w>0){ c[0]+=cc[0]*w; c[1]+=cc[1]*w; c[2]+=cc[2]*w; t+=w; } };
    add(lsSample(F,CX+x/sc,y),wf+.0001); if(B) add(lsSample(B,BX-x/sc,y),wb); else add(lsSample(F,CX-x/sc,y),wb*.9); if(S) add(lsSample(S,SX-z/sc,y),ws);
    if(!t) return [.9,.9,.92]; return c.map(v=>Math.pow(v/t,2.2)); };
  const push=(o,p)=>{ info.push({key:o.key,label:o.label,mat:o.mat,auto:o.auto}); if(o.mat==="off") return; meshes.push(p); };
  /* 有厚度的「鼓起來」形狀：給一個遮罩，照離邊緣的距離鼓起來 */
  function puff(mask,x0,x1,y0,y1,thick,o){ const w=x1-x0, h=y1-y0, dist=new Float32Array(w*h); for(let y=0;y<h;y++) for(let x=0;x<w;x++) dist[y*w+x]=mask(x+x0,y+y0)?1e4:0;
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const i=y*w+x; if(!dist[i]) continue; let v=Math.min(x?dist[i-1]+1:1,y?dist[i-w]+1:1); dist[i]=Math.min(dist[i],v); }
    for(let y=h-1;y>=0;y--) for(let x=w-1;x>=0;x--){ const i=y*w+x; if(!dist[i]) continue; let v=Math.min(x<w-1?dist[i+1]+1:1,y<h-1?dist[i+w]+1:1); dist[i]=Math.min(dist[i],v); }
    let mx=1; dist.forEach(v=>{ if(v>mx) mx=v; }); const P=[],C=[],G=[],I=[], idx=new Int32Array(w*h*2).fill(-1);
    for(const s of [0,1]) for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const i=y*w+x; if(!dist[i]) continue; let z=thick(x+x0,y+y0)*Math.sqrt(dist[i]/mx); if(D&&o.depth){ const dd=lsSample(D,(x+x0)*D.w/W,y+y0); if(dd) z*=.6+.8*dd[0]; }
      idx[s*w*h+i]=P.length/3; P.push(((x+x0-CX)*sc+(o.dx||0))*(o.kx||1),Y(y+y0+(o.dy||0)),(s?-1:1)*Math.max(.004,z)+(o.dz||0)); C.push(...(o.col?o.col(x+x0,y+y0):colorAt((x+x0-CX)*sc,y+y0,0,0,s?-1:1))); G.push(o.g); }
    const at=(s,y,x)=>x<0||x>=w||y<0||y>=h?-1:idx[s*w*h+y*w+x];
    for(const s of [0,1]) for(let y=0;y<h-1;y++) for(let x=0;x<w-1;x++){ const a=at(s,y,x), b=at(s,y,x+1), c=at(s,y+1,x), d=at(s,y+1,x+1); if(a<0||b<0||c<0||d<0) continue; if(s===0) I.push(a,c,b,b,c,d); else I.push(a,b,c,b,d,c); }
    /* 前後兩面在邊緣接起來 */
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){ const a=at(0,y,x); if(a<0) continue; [[1,0],[0,1]].forEach(([dx,dy])=>{ const b=at(0,y+dy,x+dx); if(b<0) return; const edge=at(0,y-dx,x-dy)<0||at(0,y+dx,x+dy)<0; if(!edge) return; const a2=at(1,y,x), b2=at(1,y+dy,x+dx); I.push(a,a2,b,b,a2,b2); }); }
    return {P:new Float32Array(P),C:new Float32Array(C),G:new Float32Array(G),I:new Uint32Array(I)}; }
  let strap=null;
  /* 頂部裝飾：跟燈頭圖案同一套（星星→工整的立體星；其他→擠出倒角），固定不轉，用小柱子接在球頂 */
  let topS=null; const tops=bulb?parts.filter(q=>q!==bulb&&(q.dy!==undefined||q.y1<=bulb.y0)):[];
  if(bulb&&tops.length&&pm.top!=="off"){ const ty0=Math.min(...tops.map(q=>q.y0)), ty1=Math.max(...tops.map(q=>q.y1)); let fw=0; for(let y=ty0;y<ty0+Math.max(2,(ty1-ty0)*.75);y++) if(FR[y]) fw=Math.max(fw,FR[y].w);
    const mat=pm.top||(lbl.mat&&lbl.mat.top)||"metal", o={key:"top",label:"頂部裝飾",auto:(lbl.mat&&lbl.mat.top)||"metal",mat};
    if(topC&&topC.width>=40){ const T2=lsRead(topC,120), ps=fw*sc/Math.max(1,T2.w); topS=lsEmbBuild((x,y)=>T2.d[(y*T2.w+x)*4+3]>=128,T2.w,T2.h,x=>x*ps,y=>-y*ps,ps,(x,y)=>{ const q=(y*T2.w+x)*4; return [T2.d[q]/255,T2.d[q+1]/255,T2.d[q+2]/255]; },o); }
    if(!topS){ const F3=lsRead(front,NY*4), y3=ty0*4, h3=(ty1-ty0)*4; const c4=CX*F3.w/W, hw=fw*F3.w/W/2+3; topS=lsEmbBuild((x,y)=>Math.abs(x-c4)<=hw&&F3.d[((y+y3)*F3.w+x)*4+3]>=128,F3.w,h3,x=>x*sc/4,y=>-y*sc/4,sc/4,(x,y)=>{ const q=((y+y3)*F3.w+x)*4; return [F3.d[q]/255,F3.d[q+1]/255,F3.d[q+2]/255]; },o); }   // 用 4 倍解析度看頂端
    if(topS){ const kk=bulb.k||1, sTop=bulb.sph?Y(bulb.sph.c)+bulb.sph.R*sc*kk:Y(bulb.y0), post=Math.max(.02,topS.R*.25); topS.pos=[0,sTop+topS.R*.08]; /* 平躺貼在球頂 */ topS.spin=0; tops.forEach(q=>q.skipTop=1); info.push({key:"top",label:"頂部裝飾",mat,auto:o.auto}); } }
  parts.forEach(p=>{ if(p.skipTop) return; const g=glowOf(p), o={key:p.key,label:p.label,mat:p.mat,auto:p.auto,head:p.head,dy:p.dy||0}, Yp=y=>Y(y+(p.dy||0));
    /* 掛繩：不做成實心，改成真的繩圈（在 3D 那邊做，會晃） */
    if(p.swing){ info.push({key:p.key,label:p.label,mat:p.mat,auto:p.auto}); if(p.mat!=="off") strap={pivot:Y(p.y0),L:(p.y1-p.y0)*sc,w:Math.max(.05,Math.min(.22,p.avgF*2*sc)),color:(lbl.strapC?[1,3,5].map(i=>parseInt(lbl.strapC.slice(i,i+2),16)*.82):p.mc).map(v=>Math.pow(v/255,2.2)),mat:p.mat,ringC:!!lbl.ringMetal}; return; }
    if(p.lathe){ const P=[],C=[],G=[],I=[], SEG=72;
      for(let y=p.y0;y<=p.y1;y++){ const yy=Math.min(NY-1,y), sp=p===bulb&&bulb.sph, kk=p===bulb&&bulb.k||1, rS=sp?sp.R*Math.sqrt(Math.max(0,1-((y-sp.c)/sp.R)**2)):0, rx=Math.max(.0001,(sp?rS:core[yy])*sc*kk), rz=Math.max(.0001,(sp?rS:(score&&score[yy]&&Math.abs(score[yy]-core[yy])>core[yy]*.3?score[yy]:core[yy]))*sc*kk);   // 側面跟正面差不到三成＝設計稿誤差，做正圓
        for(let k=0;k<=SEG;k++){ const a=k/SEG*Math.PI*2, sx=Math.sin(a), cz=Math.cos(a); P.push(rx*sx,Yp(y),rz*cz); C.push(...colorAt(rx*sx,yy,rz*cz,sx,cz)); G.push(g); } }
      const rowN=SEG+1; for(let j=0;j<p.y1-p.y0;j++) for(let k=0;k<SEG;k++){ const a=j*rowN+k, b=a+rowN; I.push(a,b,a+1,b,b+1,a+1); }
      [[p.y0,1],[p.y1,-1]].forEach(([y,dir])=>{ const c0=P.length/3; P.push(0,Yp(y),0); C.push(...colorAt(0,Math.min(NY-1,y),.01,0,1)); G.push(g); const base=(y===p.y0?0:(p.y1-p.y0)*rowN); for(let k=0;k<SEG;k++) dir>0?I.push(c0,base+k+1,base+k):I.push(c0,base+k,base+k+1); });
      push(o,{...o,P:new Float32Array(P),C:new Float32Array(C),G:new Float32Array(G),I:new Uint32Array(I)}); }
    else { const th=(x,y)=>(score&&score[y]?score[y]:Math.max(2,(FR[y]?FR[y].w:4)*.22))*sc; push(o,{...o,...puff((x,y)=>y>=p.y0&&y<p.y1&&F.d[(y*W+x)*4+3]>=128,0,W,p.y0,p.y1,th,{g,depth:1,dy:p.dy||0})}); } });
  /* 燈頭外面多出來的（環、翅膀、吊飾） */
  const isExtra=(x,y)=>{ if(F.d[(y*W+x)*4+3]<128) return false; const p=parts.find(q=>y>=q.y0&&y<q.y1); return !!(p&&p.lathe&&Math.abs(x-CX)>core[y]+2.5); };
  let ring=null;
  if(bulb){ const pts=[]; for(let y=bulb.y0;y<bulb.y1;y++) for(let x=0;x<W;x++) if(isExtra(x,y)) pts.push([x,y]);
    const L=pts.filter(q=>q[0]<CX), R=pts.filter(q=>q[0]>CX); if(window.__dbg) window.__rg=[L.length,R.length,L.length&&L.reduce((a,b)=>b[0]<a[0]?b:a),R.length&&R.reduce((a,b)=>b[0]>a[0]?b:a),CX,core[Math.round((bulb.y0+bulb.y1)/2)],bulb.y0,bulb.y1];
    if(L.length>8&&R.length>8){ const pl=L.reduce((a,b)=>b[0]<a[0]?b:a), pr=R.reduce((a,b)=>b[0]>a[0]?b:a), rad=Math.hypot(pr[0]-pl[0],pr[1]-pl[1])/2, bulbR=core[Math.round((bulb.y0+bulb.y1)/2)];
      if(rad>bulbR*1.02&&rad<bulbR*1.9){ const cols={}; pts.forEach(([x])=>cols[x]=(cols[x]||0)+1); const tube=Math.max(bulbR*.045,Math.min(bulbR*.12,med(Object.values(cols))/2)), cL=[0,1].map(i=>L.reduce((s,q)=>s+q[i],0)/L.length), cR=[0,1].map(i=>R.reduce((s,q)=>s+q[i],0)/R.length);
        const cc=[0,1,2].map(i=>pts.reduce((s,[x,y])=>s+F.d[(y*W+x)*4+i],0)/pts.length/255);
        ring={key:"ring",label:"環",auto:"metal",x:((pl[0]+pr[0])/2-CX)*sc,y:Y((pl[1]+pr[1])/2),R:rad*sc,tube:tube*sc,roll:-Math.atan2(cR[1]-cL[1],cR[0]-cL[0]),tilt:.38,color:cc.map(v=>Math.pow(v,2.2))}; ring.mat=pm.ring||"pearl"; info.push({key:"ring",label:"環",mat:ring.mat,auto:"pearl"}); if(ring.mat==="off") ring=null; } } }
  { const inRing=y=>ring&&bulb&&y>=bulb.y0&&y<bulb.y1, any=[]; for(let y=0;y<NY;y++) for(let x=0;x<W;x++) if(isExtra(x,y)&&!inRing(y)) any.push(1);
    if(any.length>12){ const o={key:"thin",label:"外側裝飾",auto:"pearl",mat:pm.thin||"pearl"}; push(o,{...o,...puff((x,y)=>isExtra(x,y)&&!inRing(y),0,W,0,NY,()=>.03,{g:0})}); } }
  /* 玻璃燈頭裡的圖案：挖出有顏色的部分，做成立體的小物件放進玻璃裡，自己會發光 */
  let emb=null; if(ring&&bulb&&bulb.k){ ring.R*=bulb.k; }
  /* 有框「燈頭圖案特寫」：直接用特寫圖（清楚很多） */
  if(embC&&bulb&&bulb.mat==="glass"&&pm.emb!=="off"){ const Rb=bulb.Rb*(bulb.k||1), NE=Math.max(16,Math.round(Rb*1.44*Math.min(1,embC.height/embC.width))), E=lsRead(embC,NE), cyb=bulb.sph?bulb.sph.c:(bulb.y0+bulb.y1)/2;
    const o={key:"emb",label:"燈頭裡的圖案",auto:"glow",mat:pm.emb||"glow"}; info.push({key:"emb",label:o.label,mat:o.mat,auto:"glow"});
    if(o.mat!=="off"){ const E3=lsRead(embC,NE*3), ps=sc/3; emb=lsEmbBuild((x,y)=>E3.d[(y*E3.w+x)*4+3]>=128,E3.w,E3.h,x=>(x-E3.w/2)*ps,y=>Y(cyb)-(y-E3.h/2)*ps,ps,(x,y)=>{ const q=(y*E3.w+x)*4; return [E3.d[q]/255,E3.d[q+1]/255,E3.d[q+2]/255]; },o); } }
  else if(bulb&&bulb.mat==="glass"){ const cy=Math.round((bulb.y0+bulb.y1)/2), br=core[cy], hsAt=(x,y)=>{ const q=(y*W+x)*4; return lsHsl([F.d[q],F.d[q+1],F.d[q+2]]); };
    let ls=0,n=0; for(let y=bulb.y0;y<bulb.y1;y++) for(let x=Math.round(CX-br);x<CX+br;x++){ if(F.d[(y*W+x)*4+3]<128) continue; ls+=hsAt(x,y).l; n++; } const ml=n?ls/n:.8;
    const ry=(bulb.y1-bulb.y0)/2, inC=(x,y)=>((x-CX)/(br*.86))**2+((y-cy)/(ry*.86))**2<1, mk=(x,y)=>{ if(!inC(x,y)||F.d[(y*W+x)*4+3]<128) return false; const h=hsAt(x,y); return h.s>.2&&h.l<ml+.02||h.l<ml-.14; };
    /* 只留大塊的（把反光、雜點去掉），再把小洞補起來 */
    const bx0=Math.max(0,Math.round(CX-br)), bw=Math.min(W,Math.round(CX+br))-bx0, bh=bulb.y1-bulb.y0, M0=new Uint8Array(bw*bh); for(let y=0;y<bh;y++) for(let x=0;x<bw;x++) M0[y*bw+x]=mk(x+bx0,y+bulb.y0)?1:0;
    const M1=new Uint8Array(bw*bh); for(let y=1;y<bh-1;y++) for(let x=1;x<bw-1;x++){ let n=0; for(let k=-1;k<=1;k++) for(let j=-1;j<=1;j++) n+=M0[(y+k)*bw+x+j]; M1[y*bw+x]=n>=4?1:0; }
    const lab=new Int32Array(bw*bh), sz=[0]; let nl=0; for(let i=0;i<bw*bh;i++){ if(!M1[i]||lab[i]) continue; nl++; let c=0; const st=[i]; lab[i]=nl; while(st.length){ const j=st.pop(); c++; const x=j%bw, y=(j/bw)|0; for(const k of [x>0?j-1:-1,x<bw-1?j+1:-1,y>0?j-bw:-1,y<bh-1?j+bw:-1]) if(k>=0&&M1[k]&&!lab[k]){ lab[k]=nl; st.push(k); } } sz.push(c); }
    const big=Math.max(0,...sz), keep=sz.map(v=>v>=big*.18&&v>=20);
    /* 圖案中間白白的反光面也算進來：從外圍灌水，灌不到的洞就是圖案裡面 */
    const sol=new Uint8Array(bw*bh); for(let i=0;i<bw*bh;i++) sol[i]=lab[i]&&keep[lab[i]]?1:0; const out=new Uint8Array(bw*bh), q2=[]; for(let x=0;x<bw;x++){ q2.push(x,(bh-1)*bw+x); } for(let y=0;y<bh;y++){ q2.push(y*bw,y*bw+bw-1); }
    while(q2.length){ const j=q2.pop(); if(out[j]||sol[j]) continue; out[j]=1; const x=j%bw, y=(j/bw)|0; if(x>0) q2.push(j-1); if(x<bw-1) q2.push(j+1); if(y>0) q2.push(j-bw); if(y<bh-1) q2.push(j+bw); }
    const mk2=(x,y)=>{ const i=(y-bulb.y0)*bw+(x-bx0); return x>=bx0&&x<bx0+bw&&y>=bulb.y0&&y<bulb.y1&&!out[i]&&inC(x,y); };
    let cnt=0; for(let i=0;i<bw*bh;i++) if(lab[i]&&keep[lab[i]]) cnt++;
    if(cnt>40){ const o={key:"emb",label:"燈頭裡的圖案",auto:"glow",mat:pm.emb||"glow"}; info.push({key:"emb",label:o.label,mat:o.mat,auto:"glow"});
      if(o.mat!=="off"){ const kk=bulb.k||1; emb=lsEmbBuild((x,y)=>mk2(x+bx0,y+bulb.y0),bw,bh,x=>(x+bx0-CX)*sc*kk,y=>Y(y+bulb.y0),sc*kk,(x,y)=>{ const q=((y+bulb.y0)*W+x+bx0)*4; return [F.d[q]/255,F.d[q+1]/255,F.d[q+2]/255]; },o); } } }
  if(topS) meshes.push(topS);
  if(emb){ meshes.push(emb); info.push({key:"spin",label:"圖案自轉",mat:pm.spin==="off"?"off":"on"}); }
  const proj={f:[CX/F.w,1/(sc*F.w)],b:B?[BX/B.w,-1/(sc*B.w)]:[CX/F.w,-1/(sc*F.w)],s:S?[SX/S.w,-1/(sc*S.w)]:null};
  return {meshes,ring,strap,info,bulbW:bulb&&bulb.mat==="glass"?{R:bulb.Rb*sc*(bulb.k||1),y:bulb.sph?Y(bulb.sph.c):Y((bulb.y0+bulb.y1)/2)}:null,headY:bulb?Y(Math.round((bulb.y0+bulb.y1)/2)):Y(Math.round(headEnd/2)),front,side,back,proj}; }
/* 去掉設計稿上「畫好的光影」：大面積的明暗拉平，只留圖案細節，光影交給 3D */
function lsDelit(c){ try{ const w=c.width,h=c.height, x=c.getContext("2d",{willReadFrequently:true}), d=x.getImageData(0,0,w,h), q=d.data;
    const sw=Math.max(2,Math.round(w/14)), sh=Math.max(2,Math.round(h/14)), s=document.createElement("canvas"); s.width=sw; s.height=sh; const sx=s.getContext("2d"); sx.drawImage(c,0,0,sw,sh);
    const b=document.createElement("canvas"); b.width=w; b.height=h; const bx=b.getContext("2d",{willReadFrequently:true}); bx.imageSmoothingEnabled=true; bx.drawImage(s,0,0,w,h); const bq=bx.getImageData(0,0,w,h).data;
    let gm=0,n=0; for(let i=0;i<q.length;i+=4) if(q[i+3]>128){ gm+=q[i]*.3+q[i+1]*.59+q[i+2]*.11; n++; } gm=n?gm/n:180;
    for(let i=0;i<q.length;i+=4){ if(q[i+3]<10) continue; const a=bq[i+3]/255||1, lb=(bq[i]*.3+bq[i+1]*.59+bq[i+2]*.11)/a; if(lb<8) continue; const k=Math.max(.7,Math.min(1.45,(lb*.45+gm*.55)/lb)); q[i]=Math.min(255,q[i]*k); q[i+1]=Math.min(255,q[i+1]*k); q[i+2]=Math.min(255,q[i+2]*k); }
    const o=document.createElement("canvas"); o.width=w; o.height=h; o.getContext("2d").putImageData(d,0,0); return o; }catch(e){ return c; } }
/* 零件清單（草稿下面）：點一下換材質 */
function lsPartsUI(ds){ const L=ds&&ds._parts; if(!L) return `<small class="muted">辨識中…</small>`; return L.map(p=>`<button class="chip ${p.mat==="off"?"":"on"}" data-a="lsPart" data-v="${p.key}">${p.label}・${p.key==="spin"?(p.mat==="off"?"關":"開"):LS_MATN[p.mat]||p.mat}</button>`).join(""); }
document.addEventListener("click",e=>{ const t=e.target.closest('[data-a="lsPart"]'); if(!t||!ui.lsDraft) return; const ds=ui.lsDraft.ds, k=t.dataset.v, cur=(ds._parts||[]).find(p=>p.key===k); if(!cur) return;
  ds.pm=ds.pm||{}; ds.pm[k]=k==="spin"?(cur.mat==="off"?"on":"off"):LS_MATS[(LS_MATS.indexOf(cur.mat)+1)%LS_MATS.length]; cur.mat=ds.pm[k]; ds._k=null; const el=document.querySelector('.ls-box[data-ls="draft"]'); if(el&&el._ls) el._ls.update(ds); const pl=document.getElementById("lsParts"); if(pl) pl.innerHTML=lsPartsUI(ds); });
document.addEventListener("change",e=>{ if(e.target.id==="lsSplit"&&ui.lsDraft&&ui.lsDraft.ds.v2){ const ds=ui.lsDraft.ds; ds._k=null; const el=document.querySelector('.ls-box[data-ls="draft"]'); if(el&&el._ls) el._ls.update(ds); } });

/* ===== 3. 手機上的 AI 深度（可選） ===== */
let LSD_PIPE=null;
async function lsDepth(canvas,onP){ try{
    if(!LSD_PIPE){ const T=await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2"); T.env.allowLocalModels=false;
      LSD_PIPE=await T.pipeline("depth-estimation","onnx-community/depth-anything-v2-small",{dtype:"q8",progress_callback:p=>{ if(onP&&p&&p.status==="progress"&&p.total) onP(p.loaded/p.total); }}); }
    const url=canvas.toDataURL("image/png"), r=await LSD_PIPE(url), dm=r&&(r.depth||r[0]&&r[0].depth); if(!dm) return null;
    const c=document.createElement("canvas"); c.width=dm.width; c.height=dm.height; const x=c.getContext("2d"), id=x.createImageData(dm.width,dm.height), ch=dm.channels||1;
    for(let i=0;i<dm.width*dm.height;i++){ const v=dm.data[i*ch]; id.data[i*4]=id.data[i*4+1]=id.data[i*4+2]=v; id.data[i*4+3]=255; } x.putImageData(id,0,0);
    /* 跟正面一樣大，只留應援棒的地方 */
    const o=document.createElement("canvas"); o.width=Math.min(160,canvas.width); o.height=Math.round(canvas.height*o.width/canvas.width); const ox=o.getContext("2d"); ox.drawImage(c,0,0,o.width,o.height); ox.globalCompositeOperation="destination-in"; ox.drawImage(canvas,0,0,o.width,o.height);
    return o.toDataURL("image/png"); }catch(e){ return null; } }
/* 做好正面之後，背景偷偷算深度（失敗就照原本的方式，不影響） */
function lsDepthRun(fr){ const d=ui.lsDraft; if(!d||!navigator.onLine) return; const ds=d.ds; let shown=0;
  lsDepth(fr,p=>{ const pc=Math.round(p*100); if(pc>=shown+20){ shown=pc; toast(`AI 深度模型下載中 ${pc}%（只有第一次）`); } }).then(url=>{ if(!url||ui.lsDraft!==d||d.ds!==ds) return; ds.depth=url; ds._k=null; lsRerender(); toast("AI 深度完成，立體更細緻了 ✨"); }); }
/* ===== 4. 讀設計稿上的尺寸（手機上的文字辨識，第一次下載約 10MB，只在管理員手機） =====
   讀到「全長」（最大的 cm）跟「直徑」（前面有 Ø/⌀/Φ/DIA 的數字），燈頭大小照真的比例調 */
const lsLoadJs=src=>new Promise((res,rej)=>{ const s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
async function lsOcrSheet(im,onP){ try{ if(!window.Tesseract) await lsLoadJs("https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js");
    const k=Math.min(2,2400/Math.max(im.naturalWidth,im.naturalHeight)), c=document.createElement("canvas"); c.width=Math.round(im.naturalWidth*k); c.height=Math.round(im.naturalHeight*k); c.getContext("2d").drawImage(im,0,0,c.width,c.height);
    const r=await Tesseract.recognize(c,"chi_tra+eng",{logger:m=>{ if(onP&&m&&m.status&&/loading|initializ/.test(m.status)&&m.progress!=null) onP(m.progress); }}), D=(r&&r.data)||{};
    return lsParseSheet(((D.lines&&D.lines.length)?D.lines.map(l=>l.text):(D.text||"").split("\n")).map(t=>t.replace(/\s+/g,""))); }catch(e){ return null; } }
/* 看懂標註：零件名稱＋材質、尺寸（總長、球頭寬）、色碼、發光模式 */
function lsParseSheet(lines){ const out={mat:{},name:{},hex:[],modes:[]}, num=(t,re)=>{ const m=t.match(re); return m?parseFloat(m[2]):null; };
  const K=[["grip",/握把|手把/],["strap",/掛環|掛繩|吊繩|吊環|吊飾|掛飾/],["collar",/連接環|連接處|底座/],["top",/頂部|頂端|頂飾|星星裝飾/],["ring",/星環|光環|環繞/],["bulb",/球頭|球體|球殼|燈頭|外殼/]];
  const MT=[["glass",/透明|PC|玻璃|水晶/i],["metal",/金屬|電鍍|塗裝|鋁|銀白|金色/],["rope",/矽膠|布|尼龍|織帶/],["pearl",/珍珠|亮面/],["plastic",/ABS|塑膠|霧面|PP/i]];
  lines.forEach(t=>{ if(!t) return; if(/內部|立體星|LED|燈板|主板|電池/i.test(t)) return;
    const kd=K.find(([,re])=>re.test(t)), mt=MT.find(([,re])=>re.test(t));
    if(kd&&mt){ out.mat[kd[0]]=mt[0]; if(kd[0]==="strap"&&mt[0]==="metal") out.ringMetal=1; }
    if(kd) out.name[kd[0]]={top:"頂部裝飾",bulb:"球頭外殼",collar:"連接環",grip:"握把",strap:"底部掛環",ring:"星環"}[kd[0]];
    const L=num(t,/(總長|全長)\D{0,3}(\d+(?:\.\d+)?)/), Dm=num(t,/(球頭寬|球寬|直徑|球徑|燈頭寬)\D{0,3}(\d+(?:\.\d+)?)/);
    if(L) out.L=L; if(Dm) out.D=Dm;
    (t.match(/#[0-9A-Fa-f]{6}/g)||[]).forEach(h=>{ h=h.toUpperCase(); if(!out.hex.includes(h)) out.hex.push(h); });
    [["單色",/單色/],["漸層",/漸層|多色/],["閃爍",/閃爍/],["呼吸",/呼吸/]].forEach(([n,re])=>{ if(re.test(t)&&!out.modes.includes(n)) out.modes.push(n); }); });
  if(!out.L){ const V=[]; lines.forEach(t=>{ const re=/(\d{1,3}(?:\.\d{1,2})?)(cm|mm)/gi; let m; while((m=re.exec(t))){ let v=parseFloat(m[1]); if(/mm/i.test(m[2])) v/=10; V.push(v); } }); if(V.length) out.L=Math.max(...V); }
  return out; }
function lsOcrRun(im){ const d=ui.lsDraft; if(!d||!navigator.onLine) return; const ds=d.ds; let shown=-1;
  lsOcrSheet(im,p=>{ const pc=Math.round(p*100); if(pc>=shown+25){ shown=pc; toast(`讀取設計稿文字中 ${pc}%（第一次要下載）`); } }).then(r=>{ if(!r||ui.lsDraft!==d||d.ds!==ds) return;
    ds.lbl={...(ds.lbl||{}),mat:r.mat,name:r.name,ringMetal:r.ringMetal}; if(r.L) ds.dims={L:r.L,D:r.D||null}; if(r.hex.length) ds.glows=[...new Set([...r.hex,...(ds.glows||[])])].slice(0,8); if(r.modes.length) ds.modes=r.modes;
    ds._k=null; lsRerender(); const got=[Object.keys(r.mat).length?`材質 ${Object.keys(r.mat).length} 個`:"",r.L?`尺寸`:"",r.hex.length?`色碼 ${r.hex.length} 個`:"",r.modes.length?`發光模式`:""].filter(Boolean);
    toast(got.length?`讀到設計稿上的：${got.join("、")} ✨`:"設計稿上的字讀不太到，先照圖片辨識"); }); }
/* 背景＝這一塊最常見的顏色（設計稿底色）；跟它差很多的才算東西 */
function lsFgMode(d,w,h,y0=0,thr=16){ const H={}; for(let y=y0;y<h;y+=3) for(let x=0;x<w;x+=3){ const i=(y*w+x)*4, k=(d[i]>>3)<<10|(d[i+1]>>3)<<5|(d[i+2]>>3); H[k]=(H[k]||0)+1; }
  const top=+Object.keys(H).sort((a,b)=>H[b]-H[a])[0], br=((top>>10)&31)*8+4, bg=((top>>5)&31)*8+4, bb=(top&31)*8+4, fg=new Uint8Array(w*h);
  for(let i=0;i<w*h;i++){ if(((i/w)|0)<y0) continue; fg[i]=d[i*4+3]<24?0:Math.abs(d[i*4]-br)+Math.abs(d[i*4+1]-bg)+Math.abs(d[i*4+2]-bb)>thr?1:0; } return fg; }
/* 細線削掉（侵蝕 r 格）後的連通區塊 */
function lsBlobs(fg,w,h,r,minA){ let m=fg; for(let it=0;it<r;it++){ const o=new Uint8Array(w*h); for(let y=1;y<h-1;y++) for(let x=1;x<w-1;x++){ const i=y*w+x; o[i]=m[i]&&m[i-1]&&m[i+1]&&m[i-w]&&m[i+w]?1:0; } m=o; }
  const lab=new Int32Array(w*h), B=[]; let n=0; for(let s=0;s<w*h;s++){ if(!m[s]||lab[s]) continue; n++; let a=0,x0=w,x1=0,y0=h,y1=0; const st=[s]; lab[s]=n;
    while(st.length){ const i=st.pop(), x=i%w, y=(i/w)|0; a++; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; for(const j of [x>0?i-1:-1,x<w-1?i+1:-1,y>0?i-w:-1,y<h-1?i+w:-1]) if(j>=0&&m[j]&&!lab[j]){ lab[j]=n; st.push(j); } }
    if(a>=minA) B.push({id:n,a,x0,x1,y0,y1,cx:(x0+x1)/2,w:x1-x0+1,h:y1-y0+1}); } return {B,lab}; }
function lsExpFind(d,w,h,row){ const rowY0=row.length?Math.max(...row.map(r=>r.y1)):0, fg=lsFgMode(d,w,h,rowY0+2); const {B}=lsBlobs(fg,w,h,2,Math.max(8,w*h*.0001)); const rowY=row.length?Math.max(...row.map(r=>r.y1)):-1;
  let best=null; B.filter(b=>b.y0>rowY-2&&b.w<w*.3).forEach(a=>{ const col=B.filter(b=>b.y0>rowY-2&&b.w<w*.3&&Math.abs(b.cx-a.cx)<Math.max(a.w,b.w)*.6).sort((p,q)=>p.y0-q.y0);
    const run=[col[0]]; for(let i=1;i<col.length;i++){ if(col[i].y0-run[run.length-1].y1<h*.06) run.push(col[i]); else if(run.length<4){ run.length=0; run.push(col[i]); } else break; }
    /* 真的爆炸圖：零件大小差很多，而且一定有一塊又長又細（握把）；一排一樣大的色塊不算 */
    const ws=run.map(b=>b.w), mw=ws.reduce((s,v)=>s+v,0)/Math.max(1,ws.length), cv=Math.sqrt(ws.reduce((s,v)=>s+(v-mw)**2,0)/Math.max(1,ws.length))/Math.max(1,mw), hasGrip=run.some(b=>b.h/b.w>=2&&b.h>h*.08), sc2=run.length*(cv>.25?1:0)*(hasGrip?1:0);
    if(run.length>=4&&sc2&&(!best||sc2>best.sc)){ best=run; best.sc=sc2; } });
  if(!best) return null; return {x0:Math.min(...best.map(b=>b.x0)),x1:Math.max(...best.map(b=>b.x1)),y0:Math.min(...best.map(b=>b.y0)),y1:Math.max(...best.map(b=>b.y1)),n:best.length}; }
/* 爆炸圖裡的每個零件（由上到下），各自去背成一張小圖 */
function lsExpParts(c){ const s=Math.min(1,900/Math.max(c.width,c.height)), w=Math.round(c.width*s), h=Math.round(c.height*s), cv=document.createElement("canvas"); cv.width=w; cv.height=h; const x=cv.getContext("2d",{willReadFrequently:true}); x.drawImage(c,0,0,w,h);
  const d=x.getImageData(0,0,w,h).data, fg=lsFgMode(d,w,h,0,16);
  const {B,lab}=lsBlobs(fg,w,h,2,Math.max(20,w*h*.0008)); if(!B.length) return []; const mx=B.slice().sort((p,q)=>q.a-p.a)[0], cx=mx.cx;
  return B.filter(b=>Math.abs(b.cx-cx)<mx.w*.8).sort((p,q)=>p.y0-q.y0).map(b=>{ const o=document.createElement("canvas"); o.width=b.w+2; o.height=b.h+2; const ox=o.getContext("2d"), id=ox.createImageData(o.width,o.height); let sr=0,sg=0,sb=0,sn=0,ss=0;
    for(let y=b.y0-1;y<=b.y1+1;y++) for(let xx=b.x0-1;xx<=b.x1+1;xx++){ if(y<0||xx<0||y>=h||xx>=w) continue; let on=0; for(let k=-1;k<=1&&!on;k++) for(let j=-1;j<=1;j++){ const yy=y+k, x2=xx+j; if(yy>=0&&x2>=0&&yy<h&&x2<w&&lab[yy*w+x2]===b.id){ on=1; break; } } if(!on||!fg[y*w+xx]) continue;
      const q=(y*w+xx)*4, t=((y-b.y0+1)*o.width+(xx-b.x0+1))*4; id.data[t]=d[q]; id.data[t+1]=d[q+1]; id.data[t+2]=d[q+2]; id.data[t+3]=255; const M=Math.max(d[q],d[q+1],d[q+2]), m2=Math.min(d[q],d[q+1],d[q+2]), sa=M?(M-m2)/M:0; ss+=sa; sn++; if(sa>.18){ sr+=d[q]; sg+=d[q+1]; sb+=d[q+2]; } }
    ox.putImageData(id,0,0); const k2=sr+sg+sb?(sr+sg+sb)/3:0; return {c:o,w:b.w,h:b.h,asp:b.h/b.w,sat:sn?ss/sn:0,col:k2?"#"+[sr,sg,sb].map(v=>Math.round(v/((sr+sg+sb)/(k2*3))/Math.max(1,ss&&sn?1:1)).toString(16).padStart(2,"0")).join(""):null,_rgb:[sr,sg,sb]}; }); }
/* 從爆炸圖拿：燈頭裡的圖案（最鮮豔、接近方形、不是扁扁的燈板）、掛繩顏色（最下面那塊最鮮豔的顏色） */
function lsExpUse(c){ const P=lsExpParts(c); if(P.length<3) return {}; const out={n:P.length}, wmax=Math.max(...P.map(p=>p.w));
  const star=P.slice(1,Math.ceil(P.length*.6)).filter(p=>p.asp>.65&&p.asp<1.6&&p.w<wmax*.95).sort((a,b)=>b.sat*Math.sqrt(b.w*b.h)-a.sat*Math.sqrt(a.w*a.h))[0];
  if(star&&star.sat>.12) out.emb=star.c;
  { const t=P.slice(0,3).find(p=>p!==star&&p.asp>.6&&p.asp<1.6&&p.w<wmax*.5); if(t) out.top=t.c; }   // 最上面的小零件＝頂部裝飾（跳過標題字）
  const last=P[P.length-1], s=last._rgb, n=s[0]+s[1]+s[2]; if(n){ const t=Math.max(s[0],s[1],s[2]); out.strapC="#"+s.map(v=>Math.round(v/t*235).toString(16).padStart(2,"0")).join(""); }
  return out; }
/* ===== 燈頭裡的圖案：星星 → 真的水晶星（幾何切面）；其他 → 外框描線擠出＋倒角 =====
   mask(x,y)：圖案的格子；X/Y：格子 → 3D 座標；ps：一格多大；col：顏色 */
function lsEmbBuild(mask,w,h,X,Y,ps,col,o){ const M=new Uint8Array(w*h); let n=0,sx=0,sy=0,cr=0,cg=0,cb=0,cw=0;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(mask(x,y)){ M[y*w+x]=1; n++; sx+=x; sy+=y; const c=col(x,y), mx=Math.max(...c), mn=Math.min(...c), s=mx?(mx-mn)/mx:0, k=.2+s; cr+=c[0]*k; cg+=c[1]*k; cb+=c[2]*k; cw+=k; }
  if(n<30) return null;
  /* 補洞：圖案裡白白的反光面也算圖案（從外圍灌水，灌不到的就是裡面） */
  { const out=new Uint8Array(w*h), q=[]; for(let x=0;x<w;x++) q.push(x,(h-1)*w+x); for(let y=0;y<h;y++) q.push(y*w,y*w+w-1);
    while(q.length){ const j=q.pop(); if(out[j]||M[j]) continue; out[j]=1; const x=j%w, y=(j/w)|0; if(x>0) q.push(j-1); if(x<w-1) q.push(j+1); if(y>0) q.push(j-w); if(y<h-1) q.push(j+w); }
    for(let i=0;i<w*h;i++) if(!out[i]&&!M[i]){ M[i]=1; n++; sx+=i%w; sy+=(i/w)|0; } }
  const mx=sx/n, my=sy/n, at=(x,y)=>{ x=Math.round(x); y=Math.round(y); return x>=0&&y>=0&&x<w&&y<h&&M[y*w+x]; };
  let base=[cr/cw,cg/cw,cb/cw]; { const m=(base[0]+base[1]+base[2])/3; base=base.map(v=>Math.max(0,Math.min(1,m+(v-m)*2.4-.1))); }
  const lin=c=>c.map(v=>Math.pow(v,2.2)), g=o.mat==="glow"?.6:.15;
  /* 繞一圈量半徑 */
  const NA=180, R=[]; for(let i=0;i<NA;i++){ const a=i/NA*Math.PI*2, dx=Math.cos(a), dy=Math.sin(a); let r=0, miss=0; for(let t=0;t<Math.max(w,h);t+=.5){ if(at(mx+dx*t,my+dy*t)){ r=t; miss=0; } else if(++miss>14) break; } R.push(r); }
  const Rs=R.map((v,i)=>(R[(i+NA-2)%NA]+2*R[(i+NA-1)%NA]+3*v+2*R[(i+1)%NA]+R[(i+2)%NA])/9), Rmax=Math.max(...Rs);
  const pk=[]; for(let i=0;i<NA;i++){ let top=true; for(let k=-5;k<=5;k++) if(k&&Rs[(i+k+NA)%NA]>Rs[i]) { top=false; break; } if(top&&Rs[i]>Rmax*.45&&!pk.some(j=>Math.min(Math.abs(j-i),NA-Math.abs(j-i))<8)) pk.push(i); }
  pk.sort((a,b)=>a-b); const vl=pk.map((p,i)=>{ const q=pk[(i+1)%pk.length]; let best=p, bv=1e9; for(let j=p;j!==q;j=(j+1)%NA){ if(Rs[j]<bv){ bv=Rs[j]; best=j; } } return best; });
  const avgP=pk.reduce((s,i)=>s+Rs[i],0)/Math.max(1,pk.length), avgV=vl.reduce((s,i)=>s+Rs[i],0)/Math.max(1,vl.length);
  const cx=X(mx), cy=Y(my), info={key:o.key,label:o.label,mat:o.mat,auto:o.auto,spin:1,pos:[cx,cy],R:Rmax*ps};
  if(pk.length>=4&&pk.length<=16&&avgV/avgP<.85){
    /* 水晶星：外框（尖角、凹處交錯）＋前後各一個頂點，每一面都是平的切面 */
    /* 設計稿上的星星常常帶透視、畫得不完全對稱 → 量出「幾個角、長短角比例」後，做成工整的星星 */
    const sym=k=>{ let e=0; for(let i=0;i<NA;i++){ const j=(i+NA/k)%NA, j0=Math.floor(j), f=j-j0; e+=Math.abs(Rs[i]-(Rs[j0]*(1-f)+Rs[(j0+1)%NA]*f)); } return e/NA; };
    const ang=pk.map(i=>i/NA*360), aerr=c=>Math.min(...ang.map(r0=>ang.reduce((s,a)=>{ const d=((a-r0)%(360/c)+360)%(360/c); return s+Math.min(d,360/c-d); },0)/ang.length));
    let nP=pk.length, be=1e9; for(let c=Math.max(4,pk.length-3);c<=Math.min(16,pk.length+3);c++){ const e=aerr(c)+6*Math.abs(c-pk.length)+sym(c)*.3; if(e<be){ be=e; nP=c; } }   // 角的位置最像正 n 角星、數量最接近的   // 對稱性最好的角數
    const pr=pk.map(i=>Rs[i]).sort((a,b)=>b-a), hiR=pr.slice(0,Math.ceil(pr.length/2)).reduce((s,v)=>s+v,0)/Math.ceil(pr.length/2), loR=pr.slice(Math.ceil(pr.length/2)).reduce((s,v)=>s+v,0)/Math.max(1,pr.length-Math.ceil(pr.length/2)), two=nP%2===0&&hiR/loR>1.12;
    const top=pk.reduce((a,b)=>Rs[b]>Rs[a]?b:a), ph=top/NA*Math.PI*2, out=[];
    for(let k=0;k<nP;k++){ const a=ph+k*Math.PI*2/nP, r=(two?(k%2?loR:hiR):avgP)*ps, b=a+Math.PI/nP, v=Math.min(avgV*.92,(two?loR:avgP)*.6)*ps; out.push([Math.cos(a)*r,-Math.sin(a)*r,1],[Math.cos(b)*v,-Math.sin(b)*v,0]); }
    const T=avgP*ps*(o.key==="top"?.5:.42), P=[],C=[],G=[], cc=lin(base), hi=lin(base.map(v=>v*.78+.22)), lo=lin(base.map(v=>v*.7));
    for(const s of [1,-1]) for(let i=0;i<out.length;i++){ const a=out[i], b=out[(i+1)%out.length]; const tri=s>0?[[0,0,T],a,b]:[[0,0,-T],b,a];
      tri.forEach((v,k)=>{ P.push(v[0],v[1],k?0:v[2]); const c=k?(v[2]?hi:lo):cc; C.push(...c); G.push(k?g*.6:g); }); }
    return {...info,color:cc,crystal:1,P:new Float32Array(P),C:new Float32Array(C),G:new Float32Array(G),I:new Uint32Array(P.length/3).map((_,i)=>i)}; }
  /* 其他形狀：沿著外框走一圈（Moore 追邊），簡化後交給 3D 擠出 */
  let s0=-1; for(let i=0;i<w*h;i++) if(M[i]){ s0=i; break; } const pts=[]; { const D8=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]]; let x=s0%w, y=(s0/w)|0, d=7, guard=0; const sx0=x, sy0=y;
    do{ pts.push([x,y]); let k=0; for(;k<8;k++){ const dd=(d+6+k)%8, nx=x+D8[dd][0], ny=y+D8[dd][1]; if(nx>=0&&ny>=0&&nx<w&&ny<h&&M[ny*w+nx]){ x=nx; y=ny; d=dd; break; } } if(k===8) break; }while((x!==sx0||y!==sy0)&&++guard<w*h*2); }
  if(pts.length<12) return null;
  const simp=(A,eps)=>{ if(A.length<3) return A; let dm=0,id=0; const [a,b]=[A[0],A[A.length-1]], L=Math.hypot(b[0]-a[0],b[1]-a[1])||1; for(let i=1;i<A.length-1;i++){ const d=Math.abs((b[0]-a[0])*(a[1]-A[i][1])-(a[0]-A[i][0])*(b[1]-a[1]))/L; if(d>dm){ dm=d; id=i; } } return dm>eps?[...simp(A.slice(0,id+1),eps).slice(0,-1),...simp(A.slice(id),eps)]:[a,b]; };
  let sp=simp(pts,.9); sp=sp.flatMap((p,i)=>{ const q=sp[(i+1)%sp.length]; return [[p[0]*.75+q[0]*.25,p[1]*.75+q[1]*.25],[p[0]*.25+q[0]*.75,p[1]*.25+q[1]*.75]]; });   // 圓滑一點
  return {...info,ext:1,shape:sp.map(([x,y])=>[(x-mx)*ps,-(y-my)*ps]),depth:Math.min(w,h)*ps*.22,bev:Math.min(w,h)*ps*.05,color:lin(base),g}; }
/* 管理員：應援棒商品照（SHOP 用）。縮到 1200、存起來後會自動搬到 R2 */
document.addEventListener("change",async e=>{ if(e.target.id!=="lsPhoto") return; const f=e.target.files&&e.target.files[0]; e.target.value=""; if(!f) return;
  try{ const im=await new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=URL.createObjectURL(f); }); const k=Math.min(1,1200/Math.max(im.naturalWidth,im.naturalHeight)), c=document.createElement("canvas"); c.width=Math.round(im.naturalWidth*k); c.height=Math.round(im.naturalHeight*k);
    const x=c.getContext("2d"); x.fillStyle="#fff"; x.fillRect(0,0,c.width,c.height); x.drawImage(im,0,0,c.width,c.height); const gid=ui.lsGid&&groupOf(ui.lsGid)?ui.lsGid:GROUPS[0].id, all=getSticks(); if(!all[gid]) return;
    all[gid]={...all[gid],photo:c.toDataURL("image/jpeg",.86),updatedAt:Date.now()}; S.set(K.sticks,all); lsRerender(); toast("商品照換好了，SHOP 會用這張"); }catch(err){ toast("這張照片讀不出來"); } });

/* =========================================================
   演唱會燈光段落：前奏暗、主歌呼吸、副歌閃、結尾慢慢暗
   ・管理員上傳歌曲時，手機自己聽一次：抓前奏結束、副歌（整首最響、最密、會重複的段落）
   ・結果只是幾個秒數，跟著歌存一次（tr.sec），之後每場都用；管理員可以微調
   ・演唱會中不額外上傳：粉絲手機照「這首從幾點開始播」自己算現在是哪一段
   ========================================================= */
function analyzeSections(buf,bpm){ try{
    const sr=buf.sampleRate, a=buf.getChannelData(0), b=buf.numberOfChannels>1?buf.getChannelData(1):null, hop=Math.round(sr*.5), n=Math.floor(a.length/hop), E=new Float32Array(n);
    for(let i=0;i<n;i++){ let e=0; const s=i*hop; for(let j=0;j<hop;j+=8){ const v=b?(a[s+j]+b[s+j])*.5:a[s+j]; e+=v*v; } E[i]=Math.sqrt(e/(hop/8)); }
    const S=E.map((_,i)=>{ let s=0,c=0; for(let k=-4;k<=4;k++){ const v=E[i+k]; if(v!=null){ s+=v; c++; } } return s/c; });   // 4 秒平均
    const q=p=>{ const x=Array.from(S).sort((m,k)=>m-k); return x[Math.floor(x.length*p)]||0; }, mid=q(.5), hi=q(.72), dur=buf.duration;
    let intro=0; for(let i=0;i<n;i++){ if(S[i]>=mid*.92){ intro=i*.5; break; } } intro=Math.min(intro,30);
    const bar=bpm?240/bpm:2, snap=t=>Math.round(t/bar)*bar, ch=[]; let s0=-1;
    for(let i=0;i<=n;i++){ const on=i<n&&S[i]>=hi; if(on&&s0<0) s0=i; if(!on&&s0>=0){ const st=s0*.5, en=i*.5; if(en-st>=8) ch.push([snap(st),snap(en)]); s0=-1; } }
    const M=[]; ch.forEach(c=>{ const l=M[M.length-1]; if(l&&c[0]-l[1]<4) l[1]=c[1]; else M.push(c.slice()); });
    return {intro:Math.round(intro*10)/10,ch:M.filter(c=>c[0]>intro).slice(0,6),dur:Math.round(dur)}; }catch(e){ return null; } }
DEMO_TRACK.sec={intro:6,ch:[[22,38],[48,60]],dur:64};
/* 現在這一刻的燈：{fx, dim}；藝人在燈控台手動換過效果，這首歌就聽藝人的 */
function lsCue(){ const ls=lightsea(), tl=ls&&ls.tl; if(!tl||!tl.cur) return null; if(ls.fxTs&&ls.fxTs>tl.cur.at) return null;
  const tr=trackOf(tl.cur.sid), sec=tr&&tr.sec; if(!sec) return null; const t=(Date.now()-tl.cur.at)/1000, dur=tr.dur||sec.dur||180;
  if(t<sec.intro) return {fx:"breath",dim:.08,ph:"前奏"};
  if(t>dur-6) return {fx:"breath",dim:Math.max(.05,(dur-t)/6),ph:"結尾"};
  if((sec.ch||[]).some(([s,e])=>t>=s&&t<e)) return {fx:"flash",dim:1,ph:"副歌"};
  return {fx:"breath",dim:1,ph:"主歌"}; }
/* 管理員：段落微調（邊看秒數邊按 ±） */
function secEditHtml(sid){ const T=getTracks(), tr=T[sid], s=tr&&tr.sec; if(!s) return `<p class="muted">還沒有段落</p>`;
  const row=(lab,k,i,j)=>`<div class="sec-r"><span>${lab}</span><button data-a="secAdj" data-v="${sid}" data-k="${k}" data-i="${i}" data-j="${j}" data-d="-1">−</button><b>${fmtDur((k==="intro"?s.intro:s.ch[i][j]))}</b><button data-a="secAdj" data-v="${sid}" data-k="${k}" data-i="${i}" data-j="${j}" data-d="1">＋</button></div>`;
  return `<div class="sec-ed">${row("前奏結束","intro",0,0)}${s.ch.map((c,i)=>row(`副歌 ${i+1} 開始`,"ch",i,0)+row(`副歌 ${i+1} 結束`,"ch",i,1)+`<button class="sec-x" data-a="secDel" data-v="${sid}" data-i="${i}">刪掉副歌 ${i+1}</button>`).join("")}<button class="btn btn-soft btn-block" data-a="secAdd" data-v="${sid}">＋ 加一段副歌</button></div>`; }
function secOpen(sid){ tieModal("燈光段落",secEditHtml(sid),`<button class="t-mbtn main" data-a="tCloseLayer">好了</button>`); }
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a; if(!/^sec(Adj|Add|Del|Open)$/.test(a)) return;
  const sid=t.dataset.v, T=getTracks(), tr=T[sid]; if(!tr) return; if(a==="secOpen"){ if(tr.sec){ secOpen(sid); return; } toast("正在聽這首歌…"); trackBuffer(sid).then(buf=>{ const T2=getTracks(); if(buf&&T2[sid]){ T2[sid].sec=analyzeSections(buf,T2[sid].bpm); S.set(K.tracks,T2); } secOpen(sid); }).catch(()=>secOpen(sid)); return; } const s=tr.sec||(tr.sec={intro:0,ch:[],dur:Math.round(tr.dur||180)});
  if(a==="secAdj"){ const d=+t.dataset.d; if(t.dataset.k==="intro") s.intro=Math.max(0,s.intro+d); else { const c=s.ch[+t.dataset.i]; c[+t.dataset.j]=Math.max(0,c[+t.dataset.j]+d); if(c[1]<c[0]+2) c[1]=c[0]+2; } }
  if(a==="secAdd"){ const last=s.ch[s.ch.length-1], st=last?last[1]+20:Math.max(s.intro+30,40); s.ch.push([st,st+20]); }
  if(a==="secDel") s.ch.splice(+t.dataset.i,1);
  S.set(K.tracks,T); const box=document.querySelector(".sec-ed"); if(box) box.outerHTML=secEditHtml(sid); });

/* =========================================================
   偶像運動會・小遊戲（第二代）：60fps、真的手感、會失誤
   ・射箭：按住拉弓（越久越穩、太久手會抖）→ 放開射；屏息時準星晃得少，有風會偏
   ・60m 短跑：槍響前不能動；左右「交替」點，節奏越整齊越快，同一邊連點會絆一下；後段體力會掉
   ・跳高：按住助跑加速，在起跳線放開；速度＋時機決定跳多高，三次機會
   ・保齡球：在球道上用手指往前甩，甩歪會轉彎；球瓶互相碰撞、真的會亂倒
   成績照舊交給 isDone(ev, 分數)
   ========================================================= */
function isGame(ev){ const c=isCur(), mid=(session()||{}).member; if(!c||c.st!=="on"||!mid) return; if(isTriesLeft(c,ev,mid)<=0){ toast("今天的次數用完了"); return; }
  const E=IS_EV[ev];
  setLayer(`<div class="isg2"><header><button data-a="isQuit" aria-label="離開">✕</button><b>${E.ic} ${E.n}</b><span>剩 ${isTriesLeft(c,ev,mid)} 次</span></header>
    <div class="isg2-stage"><canvas id="isCv"></canvas><p id="isMsg" class="isg2-msg"></p></div><div class="isg2-ctl" id="isBtns"></div></div>`,"isgame");
  const cv=document.getElementById("isCv"), x=cv.getContext("2d"), box=cv.parentElement, dpr=Math.min(2,devicePixelRatio||1);
  let W=0,H=0; const fit=()=>{ W=box.clientWidth; H=box.clientHeight; cv.width=W*dpr; cv.height=H*dpr; cv.style.width=W+"px"; cv.style.height=H+"px"; x.setTransform(dpr,0,0,dpr,0,0); }; fit();
  const msg=t=>{ const m=document.getElementById("isMsg"); if(m){ m.textContent=t; m.classList.remove("pop"); void m.offsetWidth; m.classList.add("pop"); } }, btns=h=>{ const b=document.getElementById("isBtns"); if(b) b.innerHTML=h; };
  const G=ui.isG={ev,dead:false,done:v=>{ setTimeout(()=>isDone(ev,v),700); }};
  const au=audioCtx&&audioCtx(), beep=(f=660,d=.12,v=.18,type="sine")=>{ try{ if(!au) return; const o=au.createOscillator(), g=au.createGain(); o.type=type; o.frequency.value=f; g.gain.setValueAtTime(v,au.currentTime); g.gain.exponentialRampToValueAtTime(.001,au.currentTime+d); o.connect(g); g.connect(au.destination); o.start(); o.stop(au.currentTime+d); }catch(e){} };
  /* 頭像：用藝人自己的照片當頭 */
  const face=newImg(), ph=mPhoto(mid); let faceOk=false; if(ph){ face.onload=()=>faceOk=true; face.src=ph; }
  const head=(cx,cy,r)=>{ x.save(); x.beginPath(); x.arc(cx,cy,r,0,7); x.closePath(); if(faceOk){ x.clip(); x.drawImage(face,cx-r,cy-r,r*2,r*2); } else { x.fillStyle="#FFD9B8"; x.fill(); } x.restore(); x.strokeStyle="#fff"; x.lineWidth=2; x.beginPath(); x.arc(cx,cy,r,0,7); x.stroke(); };
  /* 選手：小小的身體＋手腳，跑步相位 p */
  const body=(cx,cy,s,p,col="#8843FB")=>{ const L=(a,b,c2,d)=>{ x.beginPath(); x.moveTo(a,b); x.lineTo(c2,d); x.stroke(); }; x.lineCap="round"; x.strokeStyle=col; x.lineWidth=s*.28; L(cx,cy,cx+s*.1,cy+s*.9);
    x.lineWidth=s*.16; const sw=Math.sin(p)*.9; x.strokeStyle="#2B2340"; L(cx+s*.1,cy+s*.9,cx+s*.1+Math.sin(sw)*s*.8,cy+s*.9+Math.cos(sw)*s*.8); L(cx+s*.1,cy+s*.9,cx+s*.1-Math.sin(sw)*s*.8,cy+s*.9+Math.cos(sw)*s*.8);
    x.strokeStyle=col; x.lineWidth=s*.12; L(cx+s*.05,cy+s*.25,cx+s*.05-Math.sin(sw)*s*.6,cy+s*.25+Math.cos(sw)*s*.45); L(cx+s*.05,cy+s*.25,cx+s*.05+Math.sin(sw)*s*.6,cy+s*.25+Math.cos(sw)*s*.45); head(cx,cy-s*.22,s*.34); };
  /* 運動場背景：天空、看台（觀眾會晃）、跑道 */
  const crowd=Array.from({length:160},()=>({x:Math.random(),y:Math.random(),c:["#F472B6","#FBBF24","#60A5FA","#A78BFA","#34D399","#fff"][Math.floor(Math.random()*6)],p:Math.random()*6}));
  const stadium=(t,horizon=.42,cheer=0)=>{ let g=x.createLinearGradient(0,0,0,H*horizon); g.addColorStop(0,"#5B8DEF"); g.addColorStop(1,"#BFD6FF"); x.fillStyle=g; x.fillRect(0,0,W,H*horizon);
    x.fillStyle="#2E3557"; x.fillRect(0,H*(horizon-.2),W,H*.2); crowd.forEach(d=>{ x.fillStyle=d.c; x.globalAlpha=.85; x.beginPath(); x.arc(d.x*W,H*(horizon-.19)+d.y*H*.17+Math.sin(t*(3+cheer*6)+d.p)*(1+cheer*3),2.4,0,7); x.fill(); }); x.globalAlpha=1;
    x.fillStyle="#fff"; x.fillRect(0,H*horizon-3,W,3); x.fillStyle="#1F2442"; x.font="bold 11px sans-serif"; x.fillText("IDOL STAR ATHLETICS CHAMPIONSHIPS",10,H*(horizon-.205)-4); };
  let last=performance.now(), T=0; const loop=f=>{ const st=now=>{ if(G.dead||!cv.isConnected) return; const dt=Math.min(.05,(now-last)/1000); last=now; T+=dt; f(dt,T); requestAnimationFrame(st); }; requestAnimationFrame(st); };
  const hold=(id,on,off)=>{ const b=document.getElementById(id); if(!b) return; const d=e=>{ e.preventDefault(); b.classList.add("on"); on(); }, u=e=>{ if(!b.classList.contains("on")) return; e.preventDefault(); b.classList.remove("on"); off(); };
    b.addEventListener("pointerdown",d); b.addEventListener("pointerup",u); b.addEventListener("pointercancel",u); b.addEventListener("pointerleave",u); };

  /* ---------- 射箭 ---------- */
  if(ev==="archery"){ const wind=(Math.random()-.5)*2, arrows=[]; let draw=0, drawing=false, fly=null, total=0, breath=1;
    msg(`風 ${wind>0?"→":"←"} ${Math.abs(wind*5).toFixed(1)} m/s　按住拉弓，放開射`); btns(`<button class="isg2-btn" id="isHold">按住拉弓</button>`);
    const R=()=>Math.min(W,H)*.36, cx=()=>W/2, cy=()=>H*.48;
    const aim=t=>{ const k=drawing?Math.max(.25,1-draw*.55)+Math.max(0,draw-1.6)*1.6:1; return [cx()+(Math.sin(t*1.7)*.55+Math.sin(t*3.9+1)*.25)*R()*.55*k+wind*R()*.04, cy()+(Math.cos(t*1.3)*.5+Math.sin(t*4.7)*.2)*R()*.45*k]; };
    hold("isHold",()=>{ if(fly||arrows.length>=3) return; drawing=true; draw=0; beep(320,.08,.08); },()=>{ if(!drawing) return; drawing=false; if(draw<.35){ msg("弓還沒拉滿"); return; }
      const [ax,ay]=aim(T), tx=ax+wind*R()*.18*(1.4-Math.min(1,draw)), ty=ay+(1-Math.min(1,draw))*R()*.25; fly={x0:cx(),y0:H*1.05,tx,ty,t:0}; beep(880,.06,.1,"triangle"); });
    loop((dt,t)=>{ if(drawing) draw+=dt;
      let g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,"#9CC3FF"); g.addColorStop(.55,"#DCEBFF"); g.addColorStop(.56,"#7FBF6A"); g.addColorStop(1,"#5A9B4A"); x.fillStyle=g; x.fillRect(0,0,W,H);
      x.fillStyle="#E8D9B8"; x.fillRect(cx()-6,cy(),12,H*.4);
      const rings=[["#F5F5F5","#222"],["#F5F5F5","#222"],["#1E1E1E","#555"],["#1E1E1E","#555"],["#2F7FE8","#1E5DB5"],["#2F7FE8","#1E5DB5"],["#E5484D","#B33236"],["#E5484D","#B33236"],["#FFD23F","#D9A800"],["#FFD23F","#D9A800"]];
      x.shadowColor="rgba(0,0,0,.25)"; x.shadowBlur=14; rings.forEach(([f,s],i)=>{ x.beginPath(); x.arc(cx(),cy(),R()*(1-i/10),0,7); x.fillStyle=f; x.fill(); x.shadowBlur=0; x.strokeStyle=s; x.lineWidth=1; x.stroke(); });
      x.fillStyle="#D9A800"; x.beginPath(); x.arc(cx(),cy(),R()*.05,0,7); x.fill();
      arrows.forEach(a=>{ x.strokeStyle="#5A3E2B"; x.lineWidth=3; x.beginPath(); x.moveTo(a.x,a.y); x.lineTo(a.x+10,a.y+14); x.stroke(); x.fillStyle="#E5484D"; x.beginPath(); x.moveTo(a.x+10,a.y+14); x.lineTo(a.x+18,a.y+16); x.lineTo(a.x+12,a.y+22); x.fill(); x.fillStyle="#fff"; x.font="bold 14px sans-serif"; x.strokeStyle="#000"; x.lineWidth=3; x.strokeText(a.s===10&&a.X?"X":a.s,a.x+16,a.y-4); x.fillText(a.s===10&&a.X?"X":a.s,a.x+16,a.y-4); });
      if(fly){ fly.t+=dt/.45; const k=Math.min(1,fly.t), px=fly.x0+(fly.tx-fly.x0)*k, py=fly.y0+(fly.ty-fly.y0)*k-Math.sin(k*Math.PI)*H*.08; x.strokeStyle="#5A3E2B"; x.lineWidth=3; x.beginPath(); x.moveTo(px,py); x.lineTo(px+(1-k)*30,py+(1-k)*60); x.stroke();
        if(k>=1){ const d=Math.hypot(fly.tx-cx(),fly.ty-cy())/R(), s=d>=1?0:10-Math.floor(d*10), X=d<.05; arrows.push({x:fly.tx,y:fly.ty,s,X}); total+=s; beep(s>=9?1040:s>=6?700:220,.15,.2,"square"); msg(s===10?(X?"X！正中紅心！":"10 分！"):s===0?"脫靶…":`${s} 分`); fly=null;
          if(arrows.length>=3){ G.done(total); } } }
      if(!fly&&arrows.length<3){ const [ax,ay]=aim(t), r=18; x.strokeStyle=drawing&&draw>1.6?"#FF4D4D":"#00E676"; x.lineWidth=2; x.beginPath(); x.arc(ax,ay,r,0,7); x.moveTo(ax-r-10,ay); x.lineTo(ax-6,ay); x.moveTo(ax+6,ay); x.lineTo(ax+r+10,ay); x.moveTo(ax,ay-r-10); x.lineTo(ax,ay-6); x.moveTo(ax,ay+6); x.lineTo(ax,ay+r+10); x.stroke(); }
      x.fillStyle="rgba(0,0,0,.45)"; x.fillRect(0,H-34,W,34); x.fillStyle="#FFD23F"; x.font="bold 16px ui-monospace,monospace"; x.fillText(`總分 ${total}`,12,H-12); x.fillText(`箭 ${"➶ ".repeat(3-arrows.length-(fly?1:0))}`,W-110,H-12);
      if(drawing){ x.fillStyle="rgba(255,255,255,.8)"; x.fillRect(12,12,120,8); x.fillStyle=draw>1.6?"#FF4D4D":"#00E676"; x.fillRect(12,12,Math.min(1,draw/1.6)*120,8); } }); }

  /* ---------- 60m 短跑 ---------- */
  if(ev==="sprint"){ let st="mark", go=0, pos=0, v=0, lastS="", lastT=0, rhythm=0, stam=1, foul=0, end=0, stumble=0; const goAt=performance.now()+2600+Math.random()*1500;
    btns(`<button class="isg2-btn half" data-a="isAct" data-v="L">左</button><button class="isg2-btn half" data-a="isAct" data-v="R">右</button>`); msg("各就位…");
    setTimeout(()=>{ if(st==="mark"){ st="set"; msg("預備…"); beep(440,.1); } },1300);
    G.act=s=>{ const now=performance.now(); if(st==="mark"||st==="set"){ foul++; msg("偷跑！加罰 0.5 秒"); beep(150,.3,.25,"sawtooth"); return; } if(st!=="run") return;
      if(s===lastS){ stumble=.35; v*=.6; msg("絆到了！要左右交替"); beep(200,.1,.15,"square"); } else { const gap=(now-lastT)/1000; const even=lastT?Math.max(0,1-Math.abs(gap-.16)/.16):.5; rhythm=rhythm*.7+even*.3; v=Math.min(12.5,v+1.4+rhythm*1.2); }
      lastS=s; lastT=now; };
    loop((dt,t)=>{ const now=performance.now(); if(st==="set"&&now>=goAt){ st="run"; go=now; msg("GO!"); beep(1200,.25,.3,"square"); }
      if(st==="run"){ stumble=Math.max(0,stumble-dt); stam=Math.max(.35,1-Math.max(0,pos-35)/60); v=Math.max(0,v-dt*(3.2-stam*1.2)); pos+=v*stam*dt*(stumble?.4:1); if(pos>=60){ st="end"; end=(now-go)/1000+foul*.5; msg(`${end.toFixed(2)} 秒`); beep(1040,.3,.25); G.done(Math.round(end*100)/100); } }
      stadium(t,.4,st==="run"?1:0);
      const sc=W/22, cam=Math.max(0,Math.min(60-18,pos-5)); x.fillStyle="#C1442E"; x.fillRect(0,H*.4,W,H*.6); for(let i=0;i<5;i++){ x.fillStyle="rgba(255,255,255,.75)"; x.fillRect(0,H*(.46+i*.11),W,2); }
      for(let m=0;m<=60;m+=10){ const px=(m-cam)*sc+W*.1; if(px<-20||px>W+20) continue; x.fillStyle="rgba(255,255,255,.9)"; x.font="bold 12px sans-serif"; x.fillText(m+"m",px-10,H*.44); x.fillRect(px,H*.45,2,H*.55); }
      const fx=(60-cam)*sc+W*.1; x.fillStyle="#fff"; for(let i=0;i<12;i++) x.fillRect(fx,H*.45+i*H*.046,6,H*.023);
      [.55,.66,.77].forEach((ly,i)=>{ const rp=st==="run"?Math.min(60,(now-go)/1000*(7.2+i*.6)):0; body((rp-cam)*sc+W*.1,H*ly,22,rp*2.4,["#60A5FA","#34D399","#F472B6"][i]); });
      body((pos-cam)*sc+W*.1,H*.88,30,pos*2.2+(stumble?Math.sin(t*30):0),"#8843FB");
      x.fillStyle="rgba(0,0,0,.5)"; x.fillRect(0,0,W,30); x.fillStyle="#FFD23F"; x.font="bold 16px ui-monospace,monospace"; x.fillText(st==="run"?((now-go)/1000+foul*.5).toFixed(2)+"s":st==="end"?end.toFixed(2)+"s":"0.00s",10,21);
      x.fillStyle="#fff"; x.fillText(`${Math.floor(pos)}m`,W-60,21); x.fillStyle="rgba(255,255,255,.25)"; x.fillRect(W*.3,10,W*.3,10); x.fillStyle=stam>.7?"#00E676":stam>.5?"#FFD23F":"#FF4D4D"; x.fillRect(W*.3,10,W*.3*stam,10); }); }

  /* ---------- 跳高 ---------- */
  if(ev==="jump"){ let bar=140, fails=0, best=0, st="ready", spd=0, run=0, jmp=null; const TAKE=.78;
    msg(`橫桿 ${bar}cm　按住助跑，在白線放開`); btns(`<button class="isg2-btn" id="isHold">按住助跑</button>`);
    hold("isHold",()=>{ if(st!=="ready") return; st="run"; spd=0; run=0; },()=>{ if(st!=="run") return; const err=Math.abs(run-TAKE), timing=Math.max(0,1-err/.12), h=110+spd*62*(.45+.55*timing)+(Math.random()-.5)*6; st="jump"; jmp={t:0,h,ok:h>=bar+2}; });
    loop((dt,t)=>{ stadium(t,.45,st==="jump"?1:0); x.fillStyle="#3B82F6"; x.fillRect(0,H*.45,W,H*.55); x.fillStyle="#2563EB"; x.fillRect(W*.62,H*.72,W*.36,H*.12);
      const sx=W*.08, ex=W*.66, bx=W*.72, by=H*.74-(bar-100)*H*.0042; x.fillStyle="#E5E7EB"; x.fillRect(bx-4,by-6,6,H*.74-by+40); x.fillRect(bx+W*.2,by-6,6,H*.74-by+40); x.fillStyle="#FFD23F"; x.fillRect(bx,by,W*.2,5);
      x.fillStyle="#fff"; x.fillRect(sx+(ex-sx)*TAKE,H*.7,3,H*.12);
      if(st==="run"){ spd=Math.min(1,spd+dt*.55); run+=dt*spd*.62; if(run>=1){ st="ready"; fails++; msg(`踩線犯規（${fails}/3）`); beep(150,.3,.2,"sawtooth"); if(fails>=3){ st="end"; G.done(best); } } }
      let px=sx+(ex-sx)*Math.min(1,run), py=H*.78, p=run*30;
      if(st==="jump"&&jmp){ jmp.t+=dt/1.1; const k=Math.min(1,jmp.t), top=H*.74-(jmp.h-100)*H*.0042; px=sx+(ex-sx)*TAKE+(bx+W*.1-(sx+(ex-sx)*TAKE))*k*1.4; py=H*.78+(top-H*.78)*Math.sin(Math.min(1,k*1.15)*Math.PI);
        if(k>=1){ if(jmp.ok){ best=bar; msg(`${bar}cm 成功！`); beep(1040,.2,.25); bar+=5; fails=0; } else { fails++; msg(`${bar}cm 碰桿（${fails}/3）`); beep(180,.35,.25,"sawtooth"); } jmp=null; run=0; spd=0; st=fails>=3?"end":"ready"; if(st==="end") G.done(best); else msg(`橫桿 ${bar}cm　按住助跑，在白線放開`); } }
      if(st==="jump"){ x.save(); x.translate(px,py); x.rotate(-1.2); body(0,0,28,0,"#8843FB"); x.restore(); } else body(px,py,28,p,"#8843FB");
      x.fillStyle="rgba(0,0,0,.5)"; x.fillRect(0,0,W,30); x.fillStyle="#FFD23F"; x.font="bold 16px ui-monospace,monospace"; x.fillText(`橫桿 ${bar}cm　最佳 ${best||"—"}　${"✕".repeat(fails)}`,10,21);
      if(st==="run"){ x.fillStyle="rgba(255,255,255,.3)"; x.fillRect(W*.62,40,W*.33,10); x.fillStyle="#00E676"; x.fillRect(W*.62,40,W*.33*spd,10); } }); }

  /* ---------- 保齡球 ---------- */
  if(ev==="bowling"){ let roll=0, got=[], ball=null, pins=[], swipe=null, settle=0;
    const lane=()=>({l:W*.26,r:W*.74,top:H*.06,bot:H*.96}), rackPins=()=>{ const L=lane(), cx=(L.l+L.r)/2, s=(L.r-L.l)*.11, P=[]; for(let r=0;r<4;r++) for(let i=0;i<=r;i++) P.push({x:cx+(i-r/2)*s,y:L.top+H*.05+r*s*.9,vx:0,vy:0,down:false}); return P; };
    pins=rackPins(); msg("在球道上用手指往前甩（兩球）"); btns(`<p class="isg2-tip">往前甩　甩歪會轉彎</p>`);
    cv.style.touchAction="none";
    cv.addEventListener("pointerdown",e=>{ if(ball||roll>=2) return; const r=cv.getBoundingClientRect(); swipe={x:e.clientX-r.left,y:e.clientY-r.top,t:performance.now(),pts:[]}; });
    cv.addEventListener("pointermove",e=>{ if(!swipe) return; const r=cv.getBoundingClientRect(); swipe.pts.push([e.clientX-r.left,e.clientY-r.top,performance.now()]); });
    cv.addEventListener("pointerup",e=>{ if(!swipe) return; const r=cv.getBoundingClientRect(), ex=e.clientX-r.left, ey=e.clientY-r.top, dt=Math.max(60,performance.now()-swipe.t), dy=swipe.y-ey; if(dy<30){ swipe=null; return; }
      const L=lane(), sp=Math.min(1.25,dy/dt*1.1), mid=swipe.pts[Math.floor(swipe.pts.length/2)]||[ex,ey], curve=((mid[0]-(swipe.x+ex)/2))/40;
      ball={x:Math.max(L.l+10,Math.min(L.r-10,swipe.x)),y:L.bot-H*.06,vx:(ex-swipe.x)/dt*120*.4,vy:-sp*H*1.05,spin:-curve*H*.25}; swipe=null; beep(120,.5,.12,"triangle"); });
    loop((dt,t)=>{ const L=lane(); let g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,"#1B1530"); g.addColorStop(1,"#2C2050"); x.fillStyle=g; x.fillRect(0,0,W,H);
      g=x.createLinearGradient(L.l,0,L.r,0); g.addColorStop(0,"#C99863"); g.addColorStop(.5,"#E7C08A"); g.addColorStop(1,"#C99863"); x.fillStyle=g; x.fillRect(L.l,L.top,L.r-L.l,L.bot-L.top);
      x.fillStyle="rgba(0,0,0,.35)"; x.fillRect(L.l-16,L.top,16,L.bot-L.top); x.fillRect(L.r,L.top,16,L.bot-L.top);
      for(let i=1;i<10;i++){ x.fillStyle="rgba(120,80,40,.15)"; x.fillRect(L.l+(L.r-L.l)*i/10,L.top,1,L.bot-L.top); } x.fillStyle="#8843FB"; for(let i=1;i<=7;i++){ x.beginPath(); const ax=L.l+(L.r-L.l)*i/8, ay=L.bot-H*.28; x.moveTo(ax,ay); x.lineTo(ax-5,ay+12); x.lineTo(ax+5,ay+12); x.fill(); }
      if(ball){ ball.vx+=ball.spin*dt; ball.x+=ball.vx*dt; ball.y+=ball.vy*dt; ball.vy*=Math.pow(.92,dt); if(ball.x<L.l+8||ball.x>L.r-8){ ball.gutter=true; ball.x=Math.max(L.l-8,Math.min(L.r+8,ball.x)); ball.vx=0; ball.spin=0; }
        pins.forEach(p=>{ if(ball.gutter) return; const d=Math.hypot(p.x-ball.x,p.y-ball.y), rr=(L.r-L.l)*.075; if(d<rr&&d>0){ const nx=(p.x-ball.x)/d, ny=(p.y-ball.y)/d, s=Math.hypot(ball.vx,ball.vy)*.8; p.vx+=nx*s; p.vy+=ny*s; p.down=true; } });
        if(ball.y<L.top-20){ ball=null; settle=1.2; } }
      pins.forEach((p,i)=>{ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=Math.pow(.2,dt); p.vy*=Math.pow(.2,dt); pins.forEach((q,j)=>{ if(j<=i) return; const d=Math.hypot(q.x-p.x,q.y-p.y), rr=(L.r-L.l)*.055; if(d<rr&&d>0&&(Math.hypot(p.vx,p.vy)>30||Math.hypot(q.vx,q.vy)>30)){ const nx=(q.x-p.x)/d, ny=(q.y-p.y)/d, s=(Math.hypot(p.vx,p.vy)+Math.hypot(q.vx,q.vy))*.5; q.vx+=nx*s; q.vy+=ny*s; q.down=p.down=true; } }); });
      pins.forEach(p=>{ x.save(); x.translate(p.x,p.y); if(p.down) x.rotate(Math.atan2(p.vy,p.vx)+1.57); x.fillStyle="rgba(0,0,0,.25)"; x.beginPath(); x.ellipse(2,4,7,4,0,0,7); x.fill(); x.fillStyle="#fff"; x.beginPath(); x.ellipse(0,0,p.down?9:7,p.down?4:7,0,0,7); x.fill(); x.strokeStyle="#E5484D"; x.lineWidth=2; x.beginPath(); x.arc(0,0,p.down?3:4,0,7); x.stroke(); x.restore(); });
      if(ball){ g=x.createRadialGradient(ball.x-4,ball.y-4,2,ball.x,ball.y,13); g.addColorStop(0,"#C9A7FF"); g.addColorStop(1,"#5B21B6"); x.fillStyle=g; x.beginPath(); x.arc(ball.x,ball.y,12,0,7); x.fill(); }
      if(swipe&&swipe.pts.length){ x.strokeStyle="rgba(255,255,255,.6)"; x.lineWidth=4; x.beginPath(); x.moveTo(swipe.x,swipe.y); swipe.pts.forEach(([a,b])=>x.lineTo(a,b)); x.stroke(); }
      if(settle>0){ settle-=dt; if(settle<=0){ const n=pins.filter(p=>p.down).length; got.push(n); msg(n===pins.length&&roll===0?"STRIKE!!":n===0?"洗溝…":`倒了 ${n} 支`); beep(n>=8?1040:500,.25,.25); pins=pins.filter(p=>!p.down); roll++;
          if(roll>=2||!pins.length){ const tot=got[0]===10?15:got.reduce((a,b)=>a+b,0)+(!pins.length?2:0); G.done(tot); } } }
      x.fillStyle="rgba(0,0,0,.5)"; x.fillRect(0,0,W,30); x.fillStyle="#FFD23F"; x.font="bold 16px ui-monospace,monospace"; x.fillText(`第 ${Math.min(2,roll+1)} 球　${got.join(" / ")||""}`,10,21); }); }
  window.addEventListener("resize",fit,{once:true}); }

/* =========================================================
   粉絲也能從藝人端的玩法賺分（#KISS）：分數小、每天有上限
   ・綜藝留言應援 +10（一天最多 50）・代言按讚 +10（一張照片一次，一天最多 50）
   ・咖啡廳留言卡 +30（一家店一次）・幫忙佈置 +50（一家店最多 150）・藝人回你的卡片 +100
   ・偶運加油 +5（一天最多 50）・餐車送到 +200（出錢的人，一台一次）
   上限記在這支手機（只是防手滑連刷，不用上雲端）
   ========================================================= */
function fanEarn(kind,n,o={}){ try{ const s=session()||{}; if(s.role!=="fan"||!myEmail()) return 0; const day=new Date().toISOString().slice(0,10), key="hc_earn_"+myEmail(), E=JSON.parse(localStorage.getItem(key)||"{}");
    if(E.day!==day){ E.day=day; E.d={}; } E.d=E.d||{}; E.once=E.once||{};
    if(o.once){ if(E.once[o.once]) return 0; }
    const bag=o.life?(E.life=E.life||{}):E.d, capK=o.capKey||kind, used=bag[capK]||0; if(o.cap!=null&&used>=o.cap) return 0; const add=o.cap!=null?Math.min(n,o.cap-used):n; if(add<=0) return 0;
    bag[capK]=used+add; if(o.once) E.once[o.once]=1; const ks=Object.keys(E.once); if(ks.length>800) ks.slice(0,ks.length-800).forEach(k=>delete E.once[k]);
    localStorage.setItem(key,JSON.stringify(E)); S.set(K.points,points()+add); try{ const lg=S.get(K.earnLog,[])||[], lim=Date.now()-60*864e5; lg.push({k:kind,n:add,why:o.why||"",ts:Date.now()}); S.set(K.earnLog,lg.filter(x=>x.ts>lim).slice(-600)); }catch(e){}   /* 粉絲自動加的分也記到雲端（只留 60 天），管理員在後台對照得到 */ if(!o.quiet) toast(`+${add} 積分・${o.why||""}`); return add; }catch(e){ return 0; } }
/* 餐車送到了：出錢的粉絲 +200（看到的時候領） */
function tkEarnCheck(){ try{ const me=myEmail(); if(!me||(session()||{}).role!=="fan") return; getTrucks().forEach(t=>{ if(tkState(t)==="done"&&tkPaidMe(t)) fanEarn("truck",200,{once:"tk_"+t.id,why:`應援餐車送到 ${MEMBERS[t.mid].name} 那裡了`}); }); }catch(e){} }
setInterval(tkEarnCheck,90e3); setTimeout(tkEarnCheck,15e3);

