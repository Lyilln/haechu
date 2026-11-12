/* HAECHU｜主題 TINT */
/* =========================================================
   主題（照 LINE 主題小舖）：SHOP 裡的「TINT」
   ・一套主題＝素材包：封面、配色（淺色／深色各一組）、背景圖案、主角插圖、花邊、對話框裝飾、密碼鎖圖示 4 個、選單圖示 6 個
   ・換的地方：App 背景與文字顏色、底部選單、TIE 聊天室（背景、插圖、花邊、對話框、輸入列）、密碼鎖畫面
   ・只有自己看得到；自己設過的 TIE 背景不會被蓋掉（對話框和輸入列還是會跟著主題）
   ・主題有淺色＋深色兩版 → 跟著外觀切換；只有一版 → 怎麼切都維持原樣
   ・主題輪播、密碼鎖：預設關閉，每個人自己決定
   ・團可以出一套、藝人也可以各自出；管理員自己做，或審核藝人送來的申請
   ========================================================= */
const TH_STORE="TINT";
const TH_TABS=[["home","LOVE"],["whisper","TIE"],["core","FEST"],["shop","SHOP"],["me","ME"]];
const TH_TABS_ART=[["home","LOVE"],["live","MEET"],["whisper","TIE"],["foc","FOC"],["me","ME"]];
const TH_TABS_ALL=[...TH_TABS,["live","MEET"],["foc","FOC"]];
const TH_COLS=[["ac","主色"],["bg","背景"],["ink","文字"],["sub","次要文字"],["bubA","藝人對話框"],["bubAB","藝人對話框邊框"],["bubM","我的對話框"],["bubMB","我的對話框邊框"],["bar","輸入列／鍵盤"]];
const TH_DEF={light:{ac:"#8843FB",bg:"#FAF9FC",ink:"#1D1A24",sub:"#837D90",bubA:"#FFFFFF",bubAB:"#ECE8F2",bubM:"#8843FB",bubMB:"#8843FB",bar:"#FFFFFF"},
  dark:{ac:"#A48CFF",bg:"#141219",ink:"#F3F1F7",sub:"#9A94A6",bubA:"#2A2733",bubAB:"#2A2733",bubM:"#7B35F0",bubMB:"#7B35F0",bar:"#1B1A21"}};
/* 吉祥物主題是 HAECHU 內建的免費主題：不存在資料裡，每個人都看得到 */
let MS_BUILT=null;
const msBuilt=()=>MS_BUILT||(MS_BUILT=MS_THEMES.map((m,i)=>({id:"th_ms_"+m.sp,name:m.name,desc:`HAECHU官方的免費主題。${m.name}拿著應援棒陪你追星，聊天室、選單圖示和密碼鎖都換成${m.name}。淺色和深色都有。`,by:"admin",scope:"app",gid:"",mid:"",price:0,modes:"both",light:m.light,dark:m.dark,...msPack(m.sp,m.p,m.strip),status:"on",ts:Date.UTC(2026,9,1)-i*DAY})));
const getThemes=()=>{ const L=(S.get(K.themes,[])||[]).map(t=>t.id==="th_ms_dog"&&t.light&&/^#(CDE9C0|9ED68A)$/i.test(t.light.bar)?{...t,light:msBuilt()[1].light,dark:msBuilt()[1].dark}:t), have=new Set(L.map(t=>t.id)); return [...msBuilt().filter(t=>!have.has(t.id)),...L]; };
const saveThemes=L=>S.set(K.themes,L.filter(t=>!(String(t.id).startsWith("th_ms_")&&msBuilt().some(x=>x.id===t.id&&JSON.stringify(x)===JSON.stringify(t)))));
const thById=id=>getThemes().find(t=>t.id===id);
/* 每個帳號自己的（藝人帳號切到粉絲端也是同一份） */
const acK=k=>{ const s=session(); const e=s&&s.email?String(s.email).toLowerCase():""; return !e||e===DEMO_FAN?k:k+"@"+e; };
const thOwned=()=>{ const L=getThemes(), off=L.filter(t=>t.scope==="app"&&t.status==="on").map(t=>t.id); return [...new Set([...off,...S.get(acK(K.thOwned),[])])].filter(id=>{ const t=L.find(x=>x.id===id); return t&&t.status!=="deleted"; }); };
const thCurId=()=>{ const id=S.get(acK(K.thCur),""); return id&&thOwned().includes(id)?id:""; };
const thCur=()=>{ const id=thCurId(); return id?thById(id):null; };
const thRot=()=>{ const r={on:false,every:24,last:0,sel:null,...S.get(acK(K.thRot),{})}; if(r.every<=7) r.every*=24; if(!Array.isArray(r.sel)) r.sel=[]; return r; };
const TH_EVERY=[[12,"每 12 小時"],[24,"每天"],[72,"每 3 天"],[168,"每週"]];
const lockCfg=()=>({on:false,pin:""});
const thModeTxt=t=>t.modes==="both"?"淺色＋深色":t.modes==="light"?"只有淺色":"只有深色";
const thFor=t=>t.scope==="app"?"HAECHU":t.scope==="member"?(MEMBERS[t.mid]?MEMBERS[t.mid].name:""):(groupOf(t.gid)?groupOf(t.gid).name:"");
const thForce=()=>{ const t=thCur(); if(!t) return null; return t.modes==="light"?false:t.modes==="dark"?true:null; };
const thVar=(t,dark)=>{ const k=t.modes==="both"?(dark?"dark":"light"):t.modes; return {...TH_DEF[k],...((t[k])||{})}; };
const thDarkNow=()=>document.documentElement.getAttribute("data-theme")==="dark";
const hexRgb=h=>{ h=String(h||"#8843FB").replace("#",""); if(h.length===3) h=h.split("").map(c=>c+c).join(""); const n=parseInt(h,16)||0; return [n>>16&255,n>>8&255,n&255]; };
const mixHex=(h,to,k)=>{ const a=hexRgb(h), b=hexRgb(to); return "#"+a.map((v,i)=>Math.round(v+(b[i]-v)*k).toString(16).padStart(2,"0")).join(""); };
const lumHex=h=>{ const [r,g,b]=hexRgb(h); return (0.2126*r+0.7152*g+0.0722*b)/255; };
const rgba=(h,a)=>{ const [r,g,b]=hexRgb(h); return `rgba(${r},${g},${b},${a})`; };
const thTxtOn=(fill,v)=>lumHex(fill)>.6?(lumHex(v.ink)<.5?v.ink:"#1D1A24"):"#FFFFFF";
const thArtOf=t=>t.art||(t.light&&t.light.img)||(t.dark&&t.dark.img)||"";
/* 背景圖案：深色時蓋一層半透明底色，讓圖案淡一點 */
const thPat=(t,v,dark)=>t.pattern?`${dark?`linear-gradient(${rgba(v.bg,.8)},${rgba(v.bg,.8)}),`:""}url("${t.pattern}") repeat 0 0/150px,`:"";

/* 套用：寫一段樣式蓋在最後面 */
/* 主題換色：App 裡原本寫死的紫色／粉紅色（卡片底、漸層、標籤、文字…），換主題時全部換成主題的顏色
   照深淺色分開處理，深色模式的顏色不會跑到淺色模式，反過來也一樣 */
let thRcKey="";
function thRecolor(t,v){ let st=document.getElementById("thRecolor"); if(!st){ st=document.createElement("style"); st.id="thRecolor"; const th=document.getElementById("thCSS"); document.head.insertBefore(st,th||null); }
  if(!t){ st.textContent=""; thRcKey=""; return; } const key=t.id+"|"+v.ac; if(key===thRcKey) return; thRcKey=key;
  const toHsl=(r,g,b)=>{ r/=255; g/=255; b/=255; const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2; let h=0, s=0; if(mx!==mn){ const d=mx-mn; s=l>.5?d/(2-mx-mn):d/(mx+mn); h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4; h*=60; } return [h,s,l]; };
  const toRgb=(h,s,l)=>{ const k=n=>(n+h/30)%12, a=s*Math.min(l,1-l), f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1))); return [f(0)*255,f(8)*255,f(4)*255]; };
  const [ar,ag,ab]=hexRgb(v.ac), [TH,TS]=toHsl(ar,ag,ab);
  const P=["background-color","background-image","color","-webkit-text-fill-color","text-shadow","border-top-color","border-right-color","border-bottom-color","border-left-color","box-shadow","outline-color","fill","stroke"];
  const hex2rgb=x=>x.replace(/#([0-9a-f]{3,8})\b/gi,(m,h)=>{ if(h.length===3||h.length===4) h=h.split("").map(c=>c+c).join(""); if(h.length!==6&&h.length!==8) return m; const n=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)), a=h.length===8?parseInt(h.slice(6,8),16)/255:1; return a<1?`rgba(${n[0]},${n[1]},${n[2]},${+a.toFixed(3)})`:`rgb(${n[0]},${n[1]},${n[2]})`; });
  const fix=val=>hex2rgb(val).replace(/rgba?\(([^)]+)\)/g,(m0,inner)=>{ const q=inner.split(/[\s,\/]+/).filter(Boolean).map(Number); const [r,g,b]=q, a=q.length>3?q[3]:1; if([r,g,b].some(isNaN)) return m0;
    const [h,sa,l]=toHsl(r,g,b); if(sa<.18||l<.06||l>.985||!(h>=235&&h<=350)) return m0;
    const [R2,G2,B2]=toRgb(TH,Math.min(1,sa*Math.max(.45,TS)),l); return a<1?`rgba(${Math.round(R2)},${Math.round(G2)},${Math.round(B2)},${+a.toFixed(3)})`:`rgb(${Math.round(R2)},${Math.round(G2)},${Math.round(B2)})`; });
  const pre=sel=>sel.split(",").map(x=>{ x=x.trim(); if(/^html\[data-theme="dark"\]/.test(x)) return x.replace(/^html/,"html[data-th]"); if(/^html\b/.test(x)) return x.replace(/^html/,'html[data-th]:not([data-theme="dark"])'); if(x===":root") return 'html[data-th]:not([data-theme="dark"])'; return 'html[data-th]:not([data-theme="dark"]) '+x; }).join(",");
  const out=[]; const walk=rules=>{ for(const r of rules){ if(r.type===1){ if(/data-th\b|\[data-th\]|\.th-cov|\.th-keep|\.a-nick|\.nick-me/.test(r.selectorText)) continue;   /* 主題的預覽圖（例如「基本」）是那個主題自己的顏色，不跟著目前的主題變 */ const d=[];
      for(const p2 of P){ const val=r.style.getPropertyValue(p2); if(!val||/var\(/.test(val)) continue; const nv=fix(val); if(nv!==val) d.push(`${p2}:${nv}${r.style.getPropertyPriority(p2)?"!important":""}`); }
      if(d.length) out.push(`${pre(r.selectorText)}{${d.join(";")}}`); }
    else if(r.type===4&&r.cssRules){ const b0=out.length; walk(r.cssRules); if(out.length>b0){ const inner=out.splice(b0); out.push(`@media ${r.conditionText||r.media.mediaText}{${inner.join("\n")}}`); } } } };
  [...document.styleSheets].filter(x=>x.ownerNode&&(x.ownerNode.tagName==="STYLE"||x.ownerNode.tagName==="LINK"&&x.ownerNode.dataset.app!=null)&&!["thCSS","thRecolor"].includes(x.ownerNode.id)).forEach(sh=>{ try{ walk(sh.cssRules); }catch(e){} });
  st.textContent=out.join("\n"); }
function thApplyCSS(){
  let st=document.getElementById("thCSS"); if(!st){ st=document.createElement("style"); st.id="thCSS"; document.head.appendChild(st); }
  const root=document.documentElement, t=session()?thCur():null;
  if(!t){ st.textContent=""; root.removeAttribute("data-th"); thRecolor(null); return; }
  const dark=thDarkNow(), v=thVar(t,dark), [r,g,b]=hexRgb(v.ac); try{ thRecolor(t,thVar(t,false)); }catch(e){}
  const card=dark?mixHex(v.bg,"#ffffff",.07):mixHex(v.bg,"#ffffff",.62), s2=dark?mixHex(v.bg,"#ffffff",.11):mixHex(v.bg,v.ac,.06), s3=dark?mixHex(v.bg,"#ffffff",.16):mixHex(v.bg,v.ac,.11);
  const vink=dark?mixHex(v.ac,"#ffffff",.35):mixHex(v.ac,v.ink,.35), H="html[data-th][data-theme]";
  root.setAttribute("data-th",t.id);
  st.textContent=`${H}{--violet:${v.ac};--violet-ink:${vink};--violet-soft:${rgba(v.ac,dark?.2:.13)};--candy:linear-gradient(135deg,${mixHex(v.ac,"#ffffff",.22)} 0%,${v.ac} 100%);--bg:${v.bg};--s1:${card};--s2:${s2};--s3:${s3};--card-solid:${card};--glass:${card};--glass-pink:${card};--line:${rgba(v.ink,dark?.12:.09)};--ink:${v.ink};--ink-2:${v.sub};--ink-3:${mixHex(v.sub,v.bg,.25)}}
${H} body{background:${thPat(t,v,dark)}${v.bg}!important}
${H} .t-art-n b:not(.a-nick),${H} .t-acc b{color:${v.ink}!important}
${H} .bg{display:none}
${H} header.top,${H} .t-lh{background:${rgba(v.bg,.86)}!important;border-bottom-color:${rgba(v.ink,.06)}!important}
${H} .nav-in{background:${rgba(card,.92)}!important}
${H} .nav-btn.on,${H} .nav-btn.on .nav-ico{color:${vink}!important}
${H} .t-rh{background:${v.bar}!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
${H} .t-rh-row h3,${H} .t-ib,${H} .t-sub{color:${v.ink}!important}${H} .t-dots i{background:${v.ink}!important}
${H} .t-b{background:${v.bubA}!important;color:${thTxtOn(v.bubA,v)}!important;border:1.5px solid ${v.bubAB}!important;box-shadow:none!important;position:relative}
${H} .t-b.me{background:${v.bubM}!important;color:${thTxtOn(v.bubM,v)}!important;border-color:${v.bubMB}!important;text-shadow:none!important}
${t.deco?`${H} .t-b::after{content:"";position:absolute;right:-7px;top:-8px;width:18px;height:18px;background:url("${t.deco}") center/contain no-repeat;pointer-events:none}${H} .t-b.me::after{right:auto;left:-7px}${H} .t-b.t-stk::after,${H} .t-bw .t-media::after,${H} .t-b:has(img,video)::after{display:none}`:""}
${H} .t-glow{background:linear-gradient(180deg,${rgba(v.ac,dark?.32:.2)} 0%,${rgba(v.ac,dark?.14:.08)} 35%,${rgba(v.bg,0)} 100%)!important}
${H} .t-page{background:${v.bg}!important}
${H} .t-bgl.t-default{background:${thPat(t,v,dark)}${v.bg}!important}
${H} .t-pill{color:${vink}!important;border-color:${rgba(v.ac,.25)}!important;background:${card}!important}
${H} .t-empty-ico{color:${rgba(v.ac,.6)}!important;border-color:${rgba(v.ac,.2)}!important}
${H} .t-foot{background:${v.bar}!important;border-top:0!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
${H} .t-inp{background:${dark?mixHex(v.bar,"#ffffff",.08):"#ffffff"}!important}
${H} .t-meta span,${H} .t-time,${H} .t-day span{color:${v.sub}!important}
${(()=>{ if(1.05/(wcagLum(v.ac)+.05)>=3) return ""; /* 換成深色字：主題文字色跟主色對比夠（4.5 以上）才用，不然一律用深墨色，避免「紫底淡紫字」看不到 */
    const cr=(a,b2)=>{ const A=wcagLum(a)+.05, B=wcagLum(b2)+.05; return Math.max(A,B)/Math.min(A,B); }, on=cr(v.ink,v.ac)>=4.5?v.ink:"#1D1A24", L=thAcFillSel(); const L2=[...L,".th-dot.on"]; return `${L2.map(x=>H+" "+x).join(",")}{color:${on}!important;text-shadow:none!important}`; })()}`;
}
/* 主題的主色太淺時（例如粉橘），按鈕上的白字會看不清楚：找出所有「主色底＋白字」的地方，改成深色字 */
const wcagLum=hex=>{ const [r,g,b]=hexRgb(hex).map(x=>{ x/=255; return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4); }); return .2126*r+.7152*g+.0722*b; };
let thAcSel=null;
function thAcFillSel(){ if(thAcSel) return thAcSel; const out=new Set(), over=new Set();   // over：淺色／深色模式另外改成別的底色的，不算
  const walk=rules=>{ for(const r of rules){ if(r.type===1){ const st=r.style, bg=(st.getPropertyValue("background")+" "+st.getPropertyValue("background-color")+" "+st.getPropertyValue("background-image")), c=st.getPropertyValue("color").trim().toLowerCase();
        if(/var\(--(violet|candy)\)/.test(bg)&&/^(#fff|#ffffff|white|rgb\(255,\s*255,\s*255\))$/.test(c)) r.selectorText.split(",").forEach(x=>{ x=x.trim().replace(/^html\[data-theme\]\s+body\s+/,""); if(!/^html|:root|\[data-th/.test(x)) out.add(x); });
        else if(/^html\[data-theme\]\s+body\s/.test(r.selectorText)&&bg.trim()&&!/var\(--(violet|candy)\)/.test(bg)) r.selectorText.split(",").forEach(x=>over.add(x.trim().replace(/^html\[data-theme\]\s+body\s+/,""))); }
      else if(r.cssRules) walk(r.cssRules); } };
  [...document.styleSheets].filter(x=>x.ownerNode&&(x.ownerNode.tagName==="STYLE"||x.ownerNode.tagName==="LINK"&&x.ownerNode.dataset.app!=null)&&!["thCSS","thRecolor"].includes(x.ownerNode.id)).forEach(sh=>{ try{ walk(sh.cssRules); }catch(e){} });
  return thAcSel=[...out].filter(x=>!over.has(x)); }
/* 選單圖示：主題有放就用主題的（藝人端的 FOC 沿用 CORE 的圖） */
function thIcon(k){ const t=session()?thCur():null; if(!t||!t.icons) return ""; const src=t.icons[k]||(k==="foc"?t.icons.core:""); return src?`<img class="th-ic" src="${src}" alt="">`:""; }
/* 每次畫面更新都對一次：淺色／深色／跟隨系統、目前的主題，跟畫面上的不一樣就重新套（別的手機改了主題、系統切換深色時，TIE 才不會一下對一下錯） */
let thSig="";
function thSync(){ try{ const t=session()?thCur():null, fz=t?thForce():null, dk=fz==null?themeDark():fz, sig=(t?t.id+":"+(t.ts||0):"-")+"|"+(dk?1:0);
  if(sig!==thSig||document.documentElement.getAttribute("data-theme")!==(dk?"dark":"light")){ thSig=sig; applyTheme(); } }catch(e){} }
/* 主題輪播：每次畫面更新時看一下是不是該換了 */
function thRotTick(){ if(!session()) return; const R=thRot(), own=thOwned(), pool=R.sel.filter(id=>id===""||own.includes(id)); if(!R.on||pool.length<2) return; const now=Date.now(); if(R.last&&now-R.last<R.every*36e5) return;
  const cur=thCurId(), i=pool.indexOf(cur), next=pool[(i+1)%pool.length];
  S.set(acK(K.thCur),next); S.set(acK(K.thRot),{...R,last:now}); applyTheme(); }
/* TIE 聊天室：還在用預設背景時，才換成主題的背景圖案＋主角插圖＋花邊 */
function thChatBg(cls){ const t=thCur(); if(!t) return ""; const v=thVar(t,thDarkNow()), art=thArtOf(t);
  return `<div class="${cls} th-chat ${thDarkNow()?"dk":""}" style='background:${thPat(t,v,thDarkNow())}${v.bg}'>${art?`<img class="th-art" src="${art}" alt="">`:""}${t.strip?`<span class="th-strip" style="background-image:url('${t.strip}')"></span>`:""}</div>`; }

/* ---------- 預覽：照真的畫面縮小（主畫面、TIE 聊天室、密碼鎖） ---------- */
function thIco(t,k,col){ return t.icons&&t.icons[k]?`<img src="${t.icons[k]}" alt="">`:`<span style="color:${col}">${NAV[{home:"love",live:"meet",whisper:"tie",core:"core",foc:"foc",shop:"shop",me:"me"}[k]]||""}</span>`; }
function thMock(kind,t,dark,k=.5){ const v=thVar(t,dark), card=dark?mixHex(v.bg,"#ffffff",.07):mixHex(v.bg,"#ffffff",.62), pat=thPat(t,v,dark).replace(/"/g,"'"), art=thArtOf(t);
  let body="";
  if(kind==="home") body=`<div class="mk-bgf" style="background:${pat}${v.bg}"></div>
    <div class="mk-hd"><b style="color:${v.ac}">${esc(APP_NAME)}</b><i style="background:${card}"></i></div>
    <div class="mk-tabs"><b style="color:${v.ink}">動態</b><span style="color:${v.sub}">探索</span></div>
    ${[0,1].map(i=>`<div class="mk-card" style="background:${card}"><div class="mk-u"><i style="background:linear-gradient(135deg,${mixHex(v.ac,"#ffffff",.3)},${v.ac})"></i><span><b style="background:${v.ink}"></b><s style="background:${v.sub}"></s></span></div>
      <p style="background:${rgba(v.ink,.14)}"></p><p style="background:${rgba(v.ink,.14)};width:62%"></p>${i?"":`<div class="mk-pic" style="background:${rgba(v.ac,.22)}"></div>`}<div class="mk-act"><i style="background:${v.ac}"></i><i style="background:${rgba(v.ink,.25)}"></i></div></div>`).join("")}
    <div class="mk-nav" style="background:${card}">${TH_TABS.map(([key,l],i)=>`<span class="${i?"":"on"}" style="${i?"":`background:${rgba(v.ac,.14)}`}">${thIco(t,key,i?v.sub:v.ac)}<small style="color:${i?v.sub:v.ink}">${l}</small></span>`).join("")}</div>`;
  if(kind==="chat"){ const bt=(f,txt)=>thTxtOn(f,v);
    const deco=t.deco?`<img class="mk-deco" src="${t.deco}" alt="">`:"";
    body=`<div class="mk-bgf" style="background:${pat}${v.bg}"></div>${art?`<img class="mk-art" src="${art}" alt="">`:""}${t.strip?`<span class="mk-strip" style="background-image:url('${t.strip}')"></span>`:""}
    <div class="mk-ch"><span style="color:${v.ink}">‹</span><b style="color:${v.ink}">${esc(t.scope==="member"&&MEMBERS[t.mid]?MEMBERS[t.mid].name:"藝人")}</b><span style="color:${v.ink}">⋮</span></div>
    <div class="mk-msgs">
      <div class="mk-l"><i style="background:linear-gradient(135deg,${mixHex(v.ac,"#ffffff",.3)},${v.ac})"></i><span class="mk-b" style="background:${v.bubA};border-color:${v.bubAB};color:${bt(v.bubA)}">今天的舞台好開心！${deco}</span></div>
      <div class="mk-r"><span class="mk-b" style="background:${v.bubM};border-color:${v.bubMB};color:${bt(v.bubM)}">辛苦了 💜${deco}</span></div>
      <div class="mk-l"><i style="background:linear-gradient(135deg,${mixHex(v.ac,"#ffffff",.3)},${v.ac})"></i><span class="mk-b" style="background:${v.bubA};border-color:${v.bubAB};color:${bt(v.bubA)}">大家早點睡喔～${deco}</span></div>
      <div class="mk-r"><span class="mk-b" style="background:${v.bubM};border-color:${v.bubMB};color:${bt(v.bubM)}">晚安！${deco}</span></div></div>
    <div class="mk-in" style="background:${v.bar}"><span style="color:${v.ink}">＋</span><i style="background:${dark?mixHex(v.bar,"#ffffff",.08):"#fff"}"></i></div>`; }
  if(kind==="lock") body=`<div class="mk-bgf" style="background:${v.bg}"></div>
    <div class="mk-lt"><b style="color:${v.ink}">輸入密碼</b><small style="color:${v.sub}">請輸入 4 位數密碼</small><div class="mk-pass">${[0,1,2,3].map(i=>thPassIco(t,i,v,i<2)).join("")}</div></div>
    <div class="mk-pad ${dark?"dk":""}" style="background:${pat.replace(rgba(v.bg,.8),rgba(v.bar,.8)).replace(rgba(v.bg,.8),rgba(v.bar,.8))}${v.bar}">${t.strip?`<span class="mk-strip top" style="background-image:url('${t.strip}')"></span>`:""}<div class="mk-keys">${[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map(n=>`<span style="color:${v.ink}">${n}</span>`).join("")}</div></div>`;
  return `<div class="mk" style="--k:${k}"><div class="mk-in0">${body}</div></div>`; }
function thPassIco(t,i,v,on){ const src=t.pass&&(t.pass[i]||t.pass.find(Boolean)); return src?`<img class="${on?"on":""}" src="${src}" alt="">`:`<i class="${on?"on":""}" style="border-color:${v.ac};${on?`background:${v.ac}`:""}"></i>`; }
function thCover(t,cls=""){ return t.cover?`<img class="th-cov ${cls}" src="${t.cover}" alt="">`:`<span class="th-cov ${cls}">${thMock("home",t,t.modes==="dark",.3)}</span>`; }

/* ---------- SHOP 裡的 TINT ---------- */
function thShopCard(){ const L=getThemes().filter(t=>t.status==="on"); if(!L.length) return "";
  return `<button class="card th-shop" data-a="thStore"><span class="th-shop-l"><b>${TH_STORE}</b><small>主題小舖・${L.length} 套主題</small></span><span class="th-shop-p">${L.slice(0,3).map(t=>thCover(t,"mini")).join("")}</span></button>`; }
function viewTint(id){
  const head=`<header class="top core-top"><div class="top-row"><button class="icon-btn" data-a="back" aria-label="返回">${I.back}</button><div class="top-title">${TH_STORE}</div><span class="sh-sp"></span></div></header>`;
  const own=thOwned(), cur=thCurId();
  if(id&&thById(id)){ const t=thById(id), mine=own.includes(id), both=t.modes==="both", dk=both?!!ui.thPvDark:t.modes==="dark";
    return head+`<main class="page th-det">
      <div class="thd-top">${thCover(t,"big")}<div class="thd-info"><small>${esc(thFor(t))}${t.by==="admin"&&t.scope!=="app"?" 官方":""}</small><h2>${esc(t.name)}</h2><small>有效期間・無期限</small>
        <b class="thd-price">${t.price?`<i>✦</i>${fmt(t.price)}`:"免費"}</b><small>我的積分：${fmt(points())}</small></div></div>
      <div class="thd-btns">${mine?(cur===id?`<button class="btn btn-soft btn-block" disabled>使用中</button>`:`<button class="btn btn-main btn-block" data-a="thUse" data-v="${id}">套用</button>`)
        :`<button class="btn btn-main btn-block" data-a="thBuy" data-v="${id}">${t.price?"購買":"免費下載"}</button>`}</div>
      ${t.desc?`<p class="thd-desc">${esc(t.desc)}</p>`:""}
      <div class="thd-meta"><span>${t.scope==="app"?"官方免費主題":t.scope==="member"?"藝人主題":"團體主題"}</span><span>${thModeTxt(t)}</span></div>
      <div class="thd-pvh"><b>套用後的樣子</b>${both?`<div class="seg2 th-seg" style="--i:${dk?1:0}"><i class="seg2-ind"></i><button class="${dk?"":"on"}" data-a="thPv" data-v="0">淺色</button><button class="${dk?"on":""}" data-a="thPv" data-v="1">深色</button></div>`:""}</div>
      <div class="thd-pv">${["home","chat"].map(k=>`<figure>${thMock(k,t,dk,.6)}<figcaption>${{home:"主畫面",chat:"TIE 聊天室",lock:"密碼鎖"}[k]}</figcaption></figure>`).join("")}</div>
    </main>`; }
  const on=getThemes().filter(t=>t.status==="on"), f=followed();
  const sort=L=>L.slice().sort((a,b)=>(f.includes(b.gid)-f.includes(a.gid))||(b.ts-a.ts));
  const grid=L=>L.length?`<div class="th-grid">${sort(L).map(t=>`<button class="th-it" data-a="thOpen" data-v="${t.id}">${thCover(t)}${own.includes(t.id)?`<em class="th-own">${cur===t.id?"使用中":t.scope==="app"?"已下載":"已擁有"}</em>`:""}<b>${esc(t.name)}</b><small>${t.price?`✦ ${fmt(t.price)}`:"免費"}</small></button>`).join("")}</div>`:`<p class="me-none">還沒有主題</p>`;
  return head+`<main class="page">
    <section class="card pts"><div><span>我的積分</span><b>${fmt(points())} <i>✦</i></b></div><button class="btn btn-soft btn-sm" data-a="thLook">我的主題</button></section>
    <h2 class="mf-h">HAECHU官方・免費</h2>${grid(on.filter(t=>t.scope==="app"))}
    <h2 class="mf-h">團體主題</h2>${grid(on.filter(t=>t.scope==="group"))}
    <h2 class="mf-h">藝人主題</h2>${grid(on.filter(t=>t.scope==="member"))}
  </main>`;
}
function thBuy(id){ const t=thById(id); if(!t) return;
  if(t.price&&points()<t.price){ layer.innerHTML=""; toast("積分不夠"); return; }
  if(t.price) S.set(K.points,points()-t.price);
  S.set(acK(K.thOwned),[...new Set([...S.get(acK(K.thOwned),[]),id])]);
  recordSale("theme",{gid:t.scope==="member"?null:t.gid,mid:t.scope==="member"?t.mid:null,pts:t.price||0,label:`主題・${t.name}`});
  layer.innerHTML=""; render();
  iosAlert("下載完成",`要現在套用「${esc(t.name)}」嗎？`,`<button data-a="tCloseLayer">稍後</button><button data-a="thUse" data-v="${id}">套用</button>`); }
function thUse(id){ S.set(acK(K.thCur),id||""); layer.innerHTML=""; applyTheme(); render(); }

/* ---------- 外觀（模式、主題一覽、輪播、密碼鎖） ---------- */
function viewLook(){
  const m=themeMode(), own=thOwned(), cur=thCurId(), R=thRot(), L=lockCfg(), f=thForce(), t=thCur();
  const ck=on=>on?`<span class="r lk-ck">✓</span>`:"";
  return `<header class="top core-top"><div class="top-row"><button class="icon-btn" data-a="back" aria-label="返回">${I.back}</button><div class="top-title">外觀</div><span class="sh-sp"></span></div></header><main class="page">
    <div class="section-h">顯示模式${f!=null?`<span class="muted">${esc(t.name)}${f?"只有深色":"只有淺色"}</span>`:""}</div>
    <section class="card">${[["light","淺色"],["dark","深色"],["system","跟隨系統"]].map(([k,l])=>`<button class="list-btn" data-a="themeSet" data-v="${k}">${l}${ck(m===k)}</button>`).join("")}</section>
    <div class="section-h">我的主題<span class="spacer"></span>${own.some(id=>thById(id).scope!=="app")?`<button class="th-edit" data-a="thEditMode">${ui.thEditMode?"完成":"編輯"}</button>`:""}</div>
    <section class="card">
      <div class="list-btn">自動換主題<button class="sw" role="switch" aria-checked="${R.on}" aria-label="主題輪播" data-a="thRotSw" style="margin-left:auto"></button></div>
      ${R.on?`<button class="list-btn" data-a="thEveryOpen">更換頻率<span class="r">${(TH_EVERY.find(x=>x[0]===R.every)||TH_EVERY[1])[1]} ›</span></button>`:""}
    </section>
    <div class="th-my">${["",...own].map(id=>{ const x=id?thById(id):null, on=R.on?R.sel.indexOf(id)+1:(cur===id), del=ui.thEditMode&&x&&x.scope!=="app";
      return `<div class="th-mi"><button class="th-mi-c" data-a="${del?"thDel":"thUse"}" data-v="${id}">${x?thCover(x):`<span class="th-cov basic"><b>${esc(APP_NAME)}</b></span>`}</button>
        ${del?`<button class="th-dot del" data-a="thDel" data-v="${id}" aria-label="刪除">${XI}</button>`:R.on?`<button class="th-dot ${on?"on":""}" data-a="thRotPick" data-v="${id}" aria-label="加入輪播">${on||""}</button>`:`<span class="th-dot ${on?"on":""}">${on?"✓":""}</span>`}
        <b>${x?esc(x.name):"基本"}</b><small>有效期間・無期限</small></div>`; }).join("")}</div>
    <button class="btn btn-soft btn-block th-goshop" data-a="thStore">到 ${TH_STORE} 逛主題</button>
  </main>`;
}

/* ---------- 密碼鎖畫面（照 LINE：上面標題＋4 個主題圖示，下面花邊＋圖案鍵盤） ---------- */

function lockPaint(){ let el=document.getElementById("lockEl"); const k=ui.lk; if(!k){ if(el) el.remove(); return; }
  if(!el){ el=document.createElement("div"); el.id="lockEl"; document.body.appendChild(el); }
  const t=thCur(), dark=thDarkNow(), v=t?thVar(t,dark):TH_DEF[dark?"dark":"light"], tt=t||{};
  const title=k.mode==="unlock"?"輸入密碼":k.mode==="off"?"輸入目前的密碼":k.first?"再輸入一次":"設定密碼";
  const sub=k.err||(k.mode==="set"&&!k.first?"請輸入 4 位數密碼":k.mode==="set"?"確認剛剛的 4 位數密碼":"請輸入 4 位數密碼");
  el.className="lk"; el.style.cssText=`background:${v.bg};--lk-ac:${v.ac}`;
  el.innerHTML=`<div class="lk-top">${k.mode==="unlock"?"":`<button class="lk-x" data-a="lkCancel" aria-label="取消" style="color:${v.ink}">${XI}</button>`}
      <b class="lk-t" style="color:${v.ink}">${title}</b><small class="lk-s ${k.err?"err":""}" style="color:${k.err?"var(--red)":v.sub}">${sub}</small>
      <div class="lk-pass ${k.err?"shake":""}">${[0,1,2,3].map(i=>thPassIco(tt,i,v,i<k.pin.length)).join("")}</div></div>
    <div class="lk-pad ${dark?"dk":""}" style='background:${tt.pattern?thPat(tt,{...v,bg:v.bar},dark):""}${v.bar}'>${tt.strip?`<span class="lk-strip" style="background-image:url('${tt.strip}')"></span>`:""}
      <div class="lk-keys">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-a="lkKey" data-v="${n}" style="color:${v.ink}">${n}</button>`).join("")}${k.mode==="unlock"?`<button class="lk-fg" data-a="lkForgot" style="color:${v.ink}">忘記密碼</button>`:"<span></span>"}<button data-a="lkKey" data-v="0" style="color:${v.ink}">0</button><button class="lk-del" data-a="lkKey" data-v="del" aria-label="刪除" style="color:${v.ink}"><svg viewBox="0 0 28 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M9 2h16v16H9L2 10z"/><path d="m13 6 8 8m0-8-8 8" stroke-linecap="round"/></svg></button></div></div>`; }
function lockKey(v){ const k=ui.lk; if(!k) return; if(v==="del"){ k.pin=k.pin.slice(0,-1); k.err=""; return lockPaint(); } if(k.pin.length>=4) return; k.pin+=v; k.err=""; lockPaint();
  if(k.pin.length<4) return;
  setTimeout(()=>{ const L=lockCfg();
    if(k.mode==="unlock"||k.mode==="off"){ if(k.pin===L.pin){ if(k.mode==="off") S.set(acK(K.lockCfg),{on:false,pin:""}); ui.lk=null; lockPaint(); if(k.mode==="off") render(); } else { k.pin=""; k.err="密碼不對，請再試一次"; lockPaint(); } return; }
    if(!k.first){ k.first=k.pin; k.pin=""; lockPaint(); return; }
    if(k.first===k.pin){ S.set(acK(K.lockCfg),{on:true,pin:k.pin}); ui.lk=null; lockPaint(); render(); toast("已設定密碼鎖"); }
    else { k.first=""; k.pin=""; k.err="兩次不一樣，請重新設定"; lockPaint(); } },140); }
/* 離開 App 再回來就鎖起來 */
/* 密碼鎖已拿掉（不使用） */

/* ---------- 做主題：管理員自己做，或藝人送申請 ---------- */
const thBlank=()=>{ const s=session()||{}, m=s.member&&MEMBERS[s.member]; return {name:"",desc:"",scope:m?"member":"group",gid:m?m.group:(GROUPS[0]||{}).id||"",mid:s.member||"",price:0,modes:"both",light:{...TH_DEF.light},dark:{...TH_DEF.dark},icons:{},pass:["","","",""],cover:"",pattern:"",art:"",strip:"",deco:""}; };
function thDraft(id){ if(!ui.thDraft||ui.thDraft._for!==(id||"new")){ const t=id&&thById(id), b=thBlank(); const d={...b,...(t?JSON.parse(JSON.stringify(t)):{}),_for:id||"new"};
    d.light={...TH_DEF.light,...(d.light||{})}; d.dark={...TH_DEF.dark,...(d.dark||{})}; d.icons=d.icons||{}; d.pass=(d.pass||[]).concat(["","","",""]).slice(0,4); if(!d.art) d.art=thArtOf(d); ui.thDraft=d; ui.thEdV=ui.thEdV||"light"; } return ui.thDraft; }
const thEdVar=d=>d.modes==="both"?(ui.thEdV||"light"):d.modes;
function thEdPv(d){ const dk=thEdVar(d)==="dark"; return ["home","chat"].map(k=>`<figure>${thMock(k,d,dk,.42)}<figcaption>${{home:"主畫面",chat:"TIE 聊天室",lock:"密碼鎖"}[k]}</figcaption></figure>`).join(""); }
function viewThEdit(id){ const s=session(), adm=s.role==="admin", d=thDraft(id), me=s.member&&MEMBERS[s.member], ev=thEdVar(d), v=d[ev];
  const lab=t=>`<span class="fld-lab">${t}</span>`;
  const up=(f,cur,ttl,kind="")=>`<div class="th-slot ${kind}">${cur?`<button class="th-icb has" data-a="thImgX" data-f="${f}" aria-label="移除${ttl}"><img src="${cur}" alt=""><i>${XI}</i></button>`:`<label class="th-icb">＋<input type="file" accept="image/*" class="th-up" data-f="${f}" hidden></label>`}<small>${ttl}</small></div>`;
  const groups=adm?GROUPS:GROUPS.filter(g=>me&&g.id===me.group);
  const members=adm?Object.entries(MEMBERS).filter(([,m])=>!m.official):me?[[s.member,me]]:[];
  return `<header class="top core-top"><div class="top-row"><button class="icon-btn" data-a="back" aria-label="返回">${I.back}</button><div class="top-title">${adm?(id?"編輯主題":"新增主題"):"申請主題"}</div><span class="sh-sp"></span></div></header><main class="page th-ed">
    <div class="thd-pv th-ed-pv">${thEdPv(d)}</div>
    <div class="th-tools"><button class="btn btn-soft btn-sm" data-a="thGuide">素材說明</button><label class="btn btn-main btn-sm th-upb">整包上傳<input type="file" accept=".zip,application/zip,image/*" multiple class="th-zip" hidden></label></div>
    ${ui.thImportRep&&ui.thImportRep.skip.length?`<p class="th-rep">這些檔名對不上，沒有放進去：${ui.thImportRep.skip.map(esc).join("、")}</p>`:""}
    ${thCheckHtml(d)}
    <section class="card studio"><h3>基本資料</h3>
      ${lab("主題名稱")}<label class="field"><input class="th-in" data-f="name" maxlength="20" placeholder="輸入文字" value="${esc(d.name)}"></label>
      ${lab("介紹")}<label class="field th-ta"><textarea class="th-in" data-f="desc" maxlength="200" rows="3" placeholder="輸入文字">${esc(d.desc||"")}</textarea></label>
      ${lab("對象")}<div class="chips wrap">${adm?`<button class="chip ${d.scope==="app"?"on":""}" data-a="thScope" data-v="app">HAECHU官方</button>`:""}<button class="chip ${d.scope==="group"?"on":""}" data-a="thScope" data-v="group">團</button><button class="chip ${d.scope==="member"?"on":""}" data-a="thScope" data-v="member">藝人</button></div>
      <div class="chips wrap">${d.scope==="app"?"":d.scope==="group"?groups.map(g=>`<button class="chip ${d.gid===g.id?"on":""}" data-a="thWho" data-v="${g.id}">${esc(g.name)}</button>`).join(""):members.map(([mid,m])=>`<button class="chip ${d.mid===mid?"on":""}" data-a="thWho" data-v="${mid}">${esc(m.name)}</button>`).join("")}</div>
      ${lab("價格（積分，0 是免費）")}<label class="field"><input class="th-in" data-f="price" type="number" inputmode="numeric" min="0" max="99999" placeholder="輸入文字" value="${d.price||0}"></label>
      ${lab("淺色／深色")}<div class="chips wrap">${[["both","淺色＋深色"],["light","只有淺色"],["dark","只有深色"]].map(([k,l])=>`<button class="chip ${d.modes===k?"on":""}" data-a="thModes" data-v="${k}">${l}</button>`).join("")}</div>
    </section>
    <section class="card studio"><div class="th-edh"><h3>配色</h3>${d.modes==="both"?`<div class="seg2 th-seg sm" style="--i:${ev==="dark"?1:0}"><i class="seg2-ind"></i><button class="${ev==="dark"?"":"on"}" data-a="thEdV" data-v="light">淺色版</button><button class="${ev==="dark"?"on":""}" data-a="thEdV" data-v="dark">深色版</button></div>`:""}</div>
      <div class="th-tools in"><button class="btn btn-soft btn-sm" data-a="thAutoCol">從圖片自動配色</button>${d.modes==="both"?`<button class="btn btn-soft btn-sm" data-a="thDarkGen">用淺色版產生深色版</button>`:""}</div>
      <div class="th-cgrid">${TH_COLS.map(([k,l])=>`<label class="th-c"><input type="color" class="th-in" data-f="${ev}.${k}" value="${v[k]}"><span>${l}</span></label>`).join("")}</div></section>
    <section class="card studio"><h3>圖片（可不放）</h3>
      <div class="th-slots">${up("cover",d.cover,"封面","tall")}${up("art",d.art,"主角插圖","tall")}${up("pattern",d.pattern,"背景圖案")}${up("strip",d.strip,"花邊","wide")}${up("deco",d.deco,"對話框裝飾")}</div>

      ${lab("選單圖示・粉絲端")}<div class="th-icons">${TH_TABS.map(([k,l])=>up("icons."+k,d.icons[k],l)).join("")}</div>
      ${lab("選單圖示・藝人端")}<div class="th-icons">${TH_TABS_ART.map(([k,l])=>up("icons."+k,d.icons[k],l)).join("")}</div></section>
    <button class="btn btn-main btn-block" data-a="thSave" data-v="${id||""}">${adm?"儲存並上架":"送出申請"}</button>
  </main>`; }
function thSave(id){ const s=session(), adm=s.role==="admin", d=thDraft(id);
  if(!d.name.trim()){ toast("請輸入主題名稱"); return; }
  { const hard=thCheck(d).filter(w=>w.hard); if(hard.length){ toast(hard.map(w=>w.t).join("、")); return; } }
  if(d.scope==="member"&&!MEMBERS[d.mid]){ toast("請選藝人"); return; }
  if(d.scope==="group"&&!groupOf(d.gid)){ toast("請選團"); return; }
  const L=getThemes(), base={...d}; delete base._for;
  base.price=Math.max(0,Math.min(99999,parseInt(base.price,10)||0)); base.name=base.name.trim(); base.desc=(base.desc||"").trim();
  if(base.modes==="light") base.dark=null; if(base.modes==="dark") base.light=null;
  ["light","dark"].forEach(k=>{ if(base[k]) delete base[k].img; });
  try{
    if(id){ const i=L.findIndex(x=>x.id===id); if(i>=0) L[i]={...L[i],...base,status:adm?"on":"pending"}; }
    else L.unshift({...base,id:uid("th"),by:adm?"admin":"artist",owner:s.email,status:adm?"on":"pending",ts:Date.now()});
    saveThemes(L);
  }catch(e){ toast("圖片太大，存不下來，請換小一點的圖"); return; }
  ui.thDraft=null; applyTheme(); toast(adm?"已上架到 "+TH_STORE:"已送出，等管理員審核"); navBack(); }
const TH_ST={on:"上架中",off:"已下架",pending:"審核中",rejected:"沒有通過"};
function thAdminRow(t,mine){ return `<div class="th-ar">${thCover(t,"row")}<div class="th-ar-b"><b>${esc(t.name)}</b><small>${t.scope==="member"?"藝人":"團"}・${esc(thFor(t))}・${thModeTxt(t)}・${t.price?fmt(t.price)+" 積分":"免費"}</small><span class="th-st ${t.status}">${TH_ST[t.status]||""}${t.by==="artist"&&!mine?"・藝人申請":""}</span>${(()=>{ const n=thCheck(t).length; return n?`<span class="th-warn">⚠ ${n} 個提醒</span>`:`<span class="th-good">✓ 自動檢查沒問題</span>`; })()}
  <div class="th-ar-a"><button class="btn btn-soft btn-sm" data-a="thOpen" data-v="${t.id}">預覽</button>${mine?(t.status!=="on"?`<button class="btn btn-soft btn-sm" data-a="thEdit" data-v="${t.id}">編輯</button>`:""):t.status==="pending"?`<button class="btn btn-main btn-sm" data-a="thOk" data-v="${t.id}">通過</button><button class="btn btn-soft btn-sm" data-a="thNo" data-v="${t.id}">退回</button>`
    :`<button class="btn btn-soft btn-sm" data-a="thEdit" data-v="${t.id}">編輯</button><button class="btn btn-soft btn-sm" data-a="thOnOff" data-v="${t.id}">${t.status==="on"?"下架":"上架"}</button>`}</div></div></div>`; }
function viewThAdmin(){ const L=getThemes().filter(t=>t.status!=="deleted"), pend=L.filter(t=>t.status==="pending"), rest=L.filter(t=>t.status!=="pending");
  return `<header class="top core-top"><div class="top-row"><button class="icon-btn" data-a="back" aria-label="返回">${I.back}</button><div class="top-title">主題管理</div><span class="sh-sp"></span></div></header><main class="page">
    <button class="btn btn-main btn-block" data-a="thNew">新增主題</button>
    ${pend.length?`<div class="section-h">藝人申請<span class="muted">${pend.length} 件</span></div><section class="card th-al">${pend.map(t=>thAdminRow(t,false)).join("")}</section>`:""}
    <div class="section-h">全部主題<span class="muted">${rest.length} 套</span></div>
    ${rest.length?`<section class="card th-al">${rest.map(t=>thAdminRow(t,false)).join("")}</section>`:`<p class="me-none">還沒有主題</p>`}
  </main>`; }
function viewThMine(){ const s=session(), L=getThemes().filter(t=>t.owner===s.email&&t.status!=="deleted");
  /* 11/12：按鈕不再頂在最上面；沒申請過就在畫面中間說明＋按鈕，申請過就右上角「＋」 */
  return `<header class="top core-top"><div class="top-row"><button class="icon-btn" data-a="back" aria-label="返回">${I.back}</button><div class="top-title">申請主題</div>${L.length?`<button class="icon-btn" data-a="thNew" aria-label="新的申請">＋</button>`:`<span class="sh-sp"></span>`}</div></header><main class="page">
    ${L.length?`<div class="section-h">我送出的<span class="muted">${L.length} 套</span></div><section class="card th-al">${L.map(t=>thAdminRow(t,true)).join("")}</section>`
      :`<div class="t-empty th-mine-e"><span class="t-empty-ico">${I.star}</span><p>做一套你的主題</p><small>選顏色、圖示和背景，送出後公司審核，通過就會上架到 SHOP 的 ${TH_STORE}，粉絲換上後整個 App 都是你的顏色。</small><button class="btn btn-main" data-a="thNew">新的申請</button></div>`}
  </main>`; }

/* 圖片：圖示縮成 128px 方形 PNG（保留透明）；封面、插圖、花邊、圖案縮小後存 */

const thSetF=(d,f,v)=>{ const p=f.split("."); if(p.length===1) d[p[0]]=v; else if(p[0]==="pass"){ d.pass=d.pass||["","","",""]; d.pass[+p[1]]=v; } else { d[p[0]]=d[p[0]]||{}; d[p[0]][p[1]]=v; } };
document.addEventListener("input",e=>{ const t=e.target; if(!t.classList||!t.classList.contains("th-in")||!ui.thDraft) return; thSetF(ui.thDraft,t.dataset.f,t.value);
  if(t.type==="color"){ const pv=document.querySelector(".th-ed-pv"); if(pv) pv.innerHTML=thEdPv(ui.thDraft); const ck=document.querySelector(".th-chk"); if(ck) ck.outerHTML=thCheckHtml(ui.thDraft); } });
document.addEventListener("change",async e=>{ const t=e.target; if(!t.classList||!ui.thDraft) return;
  if(t.classList.contains("th-zip")){ const fs=[...(t.files||[])]; t.value=""; if(fs.length) await thImport(fs); return; }
  if(!t.classList.contains("th-up")) return; const f=t.files&&t.files[0]; if(!f) return;
  try{ await thPut(ui.thDraft,t.dataset.f,f); if(thIsDefault(ui.thDraft)&&(t.dataset.f==="cover"||t.dataset.f==="art")) await thAutoColor(ui.thDraft,true); const y=window.scrollY; render(); window.scrollTo(0,y); }catch(err){ toast("這張圖讀不出來"); } });

/* ---------- 示範主題的素材（自己畫的向量圖） ---------- */
const svgUrl=(w,h,inner)=>"data:image/svg+xml;utf8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`);
const ART={
  flower:(x,y,r,pc,cc,sw=0,sc="none")=>`<g transform="translate(${x} ${y})">${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="${-r*.52}" rx="${r*.36}" ry="${r*.55}" fill="${pc}" stroke="${sc}" stroke-width="${sw}" transform="rotate(${a})"/>`).join("")}<circle r="${r*.26}" fill="${cc}"/></g>`,
  flowerO:(x,y,r,c,sw)=>`<g transform="translate(${x} ${y})" fill="none" stroke="${c}" stroke-width="${sw}">${[0,60,120,180,240,300].map(a=>`<ellipse cx="0" cy="${-r*.55}" rx="${r*.3}" ry="${r*.48}" transform="rotate(${a})"/>`).join("")}<circle r="${r*.22}"/></g>`,
  star:(x,y,r,c,sw=0,sc="none")=>{ const p=[]; for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, rr=i%2?r*.46:r; p.push((x+Math.cos(a)*rr).toFixed(1)+","+(y+Math.sin(a)*rr).toFixed(1)); } return `<polygon points="${p.join(" ")}" fill="${c}" stroke="${sc}" stroke-width="${sw}" stroke-linejoin="round"/>`; },
  spark:(x,y,r,c)=>`<path d="M${x} ${y-r}Q${x+r*.18} ${y-r*.18} ${x+r} ${y}Q${x+r*.18} ${y+r*.18} ${x} ${y+r}Q${x-r*.18} ${y+r*.18} ${x-r} ${y}Q${x-r*.18} ${y-r*.18} ${x} ${y-r}Z" fill="${c}"/>`,
  heart:(x,y,s,c,sw=0,sc="none")=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0 9C-6-1-16 1-15 9-14 16-4 21 0 25 4 21 14 16 15 9 16 1 6-1 0 9Z" fill="${c}" stroke="${sc}" stroke-width="${sw/s}" stroke-linejoin="round"/>`,
  cloud:(x,y,s,c,sc="none",sw=0)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M-34 10C-46 10-48-6-36-8-36-22-16-26-10-14-6-30 18-30 20-12 34-16 44-2 36 8 36 10 30 12 26 12H-30C-32 12-34 11-34 10Z" fill="${c}" stroke="${sc}" stroke-width="${sw/s}" stroke-linejoin="round"/>`,
  moonChar:(p)=>`<defs><mask id="mm"><rect width="320" height="380" fill="#fff"/><circle cx="214" cy="118" r="104" fill="#000"/></mask></defs>
    <g>${ART.cloud(170,318,2.5,"#FFFFFF",p.d,3)}${ART.cloud(70,300,1.3,"#FFFFFF",p.d,2.4)}</g>
    <circle cx="160" cy="176" r="128" fill="${p.e}" stroke="${p.d}" stroke-width="4" mask="url(#mm)"/>
    <path d="M78 196q10 9 20 0M112 214q9 8 18 0" fill="none" stroke="${p.d}" stroke-width="3.4" stroke-linecap="round"/>
    <ellipse cx="80" cy="214" rx="11" ry="7" fill="${p.a}" opacity=".55"/><ellipse cx="128" cy="234" rx="10" ry="6.5" fill="${p.a}" opacity=".55"/>
    <path d="M100 236q8 7 16 1" fill="none" stroke="${p.d}" stroke-width="3" stroke-linecap="round"/>
    <path d="M40 120q-6-10 4-16" fill="none" stroke="${p.d}" stroke-width="3" stroke-linecap="round"/>
    ${ART.flower(70,104,22,p.a,p.e,2.4,p.d)}${ART.flower(98,82,15,p.b,p.e,2,p.d)}${ART.flower(52,140,13,p.f,p.e,2,p.d)}
    ${ART.star(252,58,20,p.e,3,p.d)}${ART.star(292,146,13,p.a,2.6,p.d)}${ART.star(250,262,16,p.b,2.6,p.d)}
    ${ART.spark(212,40,10,p.a)}${ART.spark(286,92,7,p.b)}${ART.spark(300,226,9,p.e)}${ART.spark(30,250,8,p.b)}
    <path d="M232 280v34" stroke="${p.d}" stroke-width="2"/>${ART.star(232,322,10,p.e,2.4,p.d)}`
};
function thPack(p,motif){
  const pattern=svgUrl(150,150,`<g opacity=".55">${ART.flowerO(38,40,22,p.c,2.2)}${ART.flowerO(112,112,16,p.c,2)}${ART.spark(112,34,7,p.c)}${ART.spark(36,116,6,p.c)}${ART.spark(76,80,4,p.c)}</g>`);
  const deco=svgUrl(40,40,motif==="cloud"?ART.star(20,21,16,p.e,2.4,p.d):ART.flower(20,21,16,p.a,p.e,2,p.d));
  const strip=svgUrl(420,90,`<rect y="52" width="420" height="38" fill="${p.bar}"/>`+(motif==="cloud"
    ?[[30,52,1.1],[120,46,1.4],[220,54,1],[300,44,1.5],[395,52,1.1]].map(([x,y,s])=>ART.cloud(x,y,s,"#FFFFFF",p.c,2)).join("")+[[80,30],[180,22],[262,30],[360,24]].map(([x,y])=>ART.spark(x,y,6,p.e)).join("")
    :[[14,56,18,p.a],[44,50,22,p.b],[78,58,16,p.f],[110,52,20,p.a],[146,58,14,"#ffffff"],[176,50,22,p.b],[212,56,18,p.f],[246,50,20,p.a],[282,58,15,"#ffffff"],[312,52,21,p.b],[348,56,17,p.f],[382,50,22,p.a],[412,56,16,p.b]].map(([x,y,r,c])=>ART.flower(x,y,r,c,p.e,1.6,p.d)).join("")));
  const art=svgUrl(320,380,ART.moonChar(p));
  const passBg=(inner)=>svgUrl(64,64,`<circle cx="32" cy="32" r="28" fill="${p.c}"/>`+inner);
  const pass=[passBg(ART.star(32,33,17,p.e,2.4,p.d)),passBg(`<defs><mask id="pm"><rect width="64" height="64" fill="#fff"/><circle cx="40" cy="26" r="14" fill="#000"/></mask></defs><circle cx="31" cy="33" r="17" fill="${p.e}" stroke="${p.d}" stroke-width="2.4" mask="url(#pm)"/>`),passBg(ART.heart(32,19,1.15,p.a,2.4,p.d)),passBg(ART.flower(32,33,18,p.b,p.e,2.2,p.d))];
  const ic=inner=>svgUrl(48,48,inner);
  const icons={home:ic(ART.heart(24,12,1.15,p.a,2.6,p.d)+ART.spark(36,13,4,p.e)),
    live:ic(`<path d="M7 14h34a2 2 0 0 1 2 2v4a4 4 0 0 0 0 8v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4a4 4 0 0 0 0-8v-4a2 2 0 0 1 2-2z" fill="${p.b}" stroke="${p.d}" stroke-width="2.4" stroke-linejoin="round"/><path d="M18 18v12" stroke="${p.d}" stroke-width="2" stroke-dasharray="2 3"/>`+ART.heart(30,18,.42,p.a,1.6,p.d)),
    whisper:ic(`<path d="M24 22C18 12 8 10 6 16s4 14 18 8M24 22c6-10 16-12 18-6s-4 14-18 8" fill="${p.a}" stroke="${p.d}" stroke-width="2.4" stroke-linejoin="round"/><path d="M22 26l-6 14 5-1 3 4M26 26l6 14-5-1-3 4" fill="${p.b}" stroke="${p.d}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="24" cy="23" r="4" fill="${p.e}" stroke="${p.d}" stroke-width="2"/>`),
    core:ic(`<path d="M18 34V12l20-5v22" fill="none" stroke="${p.d}" stroke-width="2.6" stroke-linejoin="round"/><ellipse cx="13" cy="34" rx="6" ry="5" fill="${p.b}" stroke="${p.d}" stroke-width="2.4"/><ellipse cx="33" cy="29" rx="6" ry="5" fill="${p.a}" stroke="${p.d}" stroke-width="2.4"/>`+ART.spark(40,40,4,p.e)),
    shop:ic(`<path d="M13 8h22l8 11-19 22L5 19z" fill="${p.f}" stroke="${p.d}" stroke-width="2.4" stroke-linejoin="round"/><path d="M5 19h38M17 8l7 33M31 8l-7 33" fill="none" stroke="${p.d}" stroke-width="1.8" stroke-linejoin="round"/>`),
    me:ic(`<path d="M7 36 5 14l10 8 9-12 9 12 10-8-2 22z" fill="${p.e}" stroke="${p.d}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="24" cy="27" r="3.4" fill="${p.a}" stroke="${p.d}" stroke-width="1.8"/><circle cx="14" cy="29" r="2.4" fill="${p.b}"/><circle cx="34" cy="29" r="2.4" fill="${p.b}"/>`)};
  return {pattern,deco,strip,art,pass,icons};
}
function thCoverSvg(p,title,pack){ return svgUrl(300,400,`<rect width="300" height="400" fill="${p.bg}"/><image href="${pack.pattern}" width="150" height="150"/><image href="${pack.pattern}" x="150" width="150" height="150"/><image href="${pack.pattern}" y="150" width="150" height="150"/><image href="${pack.pattern}" x="150" y="150" width="150" height="150"/><image href="${pack.pattern}" y="300" width="150" height="150"/><image href="${pack.pattern}" x="150" y="300" width="150" height="150"/>
  <text x="150" y="64" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-style="italic" font-weight="700" font-size="38" fill="${p.d}">${title}</text>
  <image href="${pack.art}" x="34" y="92" width="232" height="276"/><image href="${pack.strip}" x="-60" y="340" width="420" height="90"/>`); }
function seedThemes(){ if(S.get(K.seedThemes2,false)) return; S.set(K.seedThemes2,true);
  const g=GROUPS[0], luna=MEMBERS.luna?"luna":Object.keys(MEMBERS)[0];
  const P1={a:"#F28DB8",b:"#C9A7F0",c:"#F7C9DA",d:"#8A3A63",e:"#FFE3A1",f:"#A9D8F5",bg:"#FFF1F6",bar:"#F6C6DA"};
  const P2={a:"#8FB0FF",b:"#B9CCFF",c:"#CFDDFF",d:"#34488F",e:"#FFF1B8",f:"#BFE8FF",bg:"#EEF4FF",bar:"#D5E2FF"};
  const k1=thPack(P1,"flower"), k2=thPack(P2,"cloud");
  const T1={id:"th_demo1",name:g.name,desc:`${g.name} 的官方主題。粉紅色的月亮花園，聊天室裡有睡在雲上的月亮陪你，密碼鎖是星星、月亮、愛心和小花。淺色和深色都有。`,by:"admin",scope:"group",gid:g.id,mid:"",price:300,modes:"both",
    light:{ac:"#D9558F",bg:"#FFF1F6",ink:"#7A2E52",sub:"#C47A9C",bubA:"#FFF6DE",bubAB:"#EDB9CE",bubM:"#FFFFFF",bubMB:"#EDB9CE",bar:"#F6C6DA"},
    dark:{ac:"#FF8FC4",bg:"#1E141B",ink:"#FBE9F2",sub:"#C9A3B8",bubA:"#3A2633",bubAB:"#5A3A4C",bubM:"#E0619E",bubMB:"#E0619E",bar:"#2E1E28"},
    ...k1,cover:thCoverSvg(P1,g.name,k1),status:"on",ts:Date.now()-2*DAY};
  const T2={id:"th_demo2",name:MEMBERS[luna].name,desc:`${MEMBERS[luna].name} 的個人主題。藍天、白雲和小星星，只有淺色版。`,by:"admin",scope:"member",gid:MEMBERS[luna].group,mid:luna,price:0,modes:"light",
    light:{ac:"#5B7CFA",bg:"#EEF4FF",ink:"#2E3D7A",sub:"#7D8DBF",bubA:"#FFFFFF",bubAB:"#C9D6FF",bubM:"#5B7CFA",bubMB:"#5B7CFA",bar:"#D5E2FF"},dark:null,
    ...k2,cover:thCoverSvg(P2,MEMBERS[luna].name.split(" ").pop(),k2),status:"on",ts:Date.now()-DAY};
  const L=getThemes().filter(t=>t.id!=="th_demo1"&&t.id!=="th_demo2"); saveThemes([T1,T2,...L]); }


/* =========================================================
   官方免費主題：四隻候選吉祥物（貓咪、小狗、狐狸、蜥蜴）—— 名字還沒定
   全部是自己畫的向量圖：大頭圓身、粗描邊、腮紅、手拿應援棒
   ========================================================= */
const MS_LN="#4A3532";
const MSC={
  cat:{en:"CAT",body:"#FFF8EF",belly:"#FFFFFF",ear:"#FFC6BE",patch:"#F5AE62",patch2:"#6A5049",stick:"#FF8FB1"},
  dog:{en:"PUPPY",body:"#F2C38C",belly:"#FFF8EC",ear:"#C98E55",stick:"#7CC4FF"},
  fox:{en:"FOX",body:"#FF9F5C",belly:"#FFF8EE",ear:"#5E3B33",stick:"#FFD45C"},
  liz:{en:"LIZARD",body:"#9FE2BD",belly:"#FFF3C6",spike:"#5FC394",stick:"#C9A6FF"}
};
const tube=(d,c,w)=>`<path d="${d}" fill="none" stroke="${MS_LN}" stroke-width="${w+6}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const LW=(w=3.4)=>`stroke="${MS_LN}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`; const L3=LW();
/* 臉：expr = smile / wink / wow / love / sleep */
function msEyes(sp,expr){ const xs=sp==="liz"?[90,150]:[94,146], y=114;
  const eye=(x,k)=>{ if(expr==="sleep"||(expr==="wink"&&k===1)) return `<path d="M${x-8} ${y} q8 7 16 0" fill="none" ${L3}/>`;
    if(expr==="love") return ART.heart(x,y-9,.62,"#FF6F91",2,MS_LN);
    const rx=expr==="wow"?8:6.6, ry=expr==="wow"?10:8.8;
    return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#2E2222"/><circle cx="${x-2.4}" cy="${y-3.4}" r="2.8" fill="#fff"/><circle cx="${x+2.6}" cy="${y+3.2}" r="1.3" fill="#fff"/>`; };
  return eye(xs[0],0)+eye(xs[1],1); }
function msMouth(sp,expr){ const o=expr==="wow";
  if(sp==="cat") return `<path d="M116 125 l4 3 4-3" fill="#FF9AAE" ${LW(2.4)}/>`+(o?`<ellipse cx="120" cy="137" rx="5" ry="6" fill="#B5475E" ${LW(2.6)}/>`:`<path d="M110 131 q5 6 10 0 q5 6 10 0" fill="none" ${LW(2.8)}/>`)
    +`<path d="M58 122 l-20-4M58 130 l-19 4M182 122 l20-4M182 130 l19 4" ${LW(2.4)}/>`;
  if(sp==="dog") return `<ellipse cx="120" cy="134" rx="25" ry="18" fill="${MSC.dog.belly}" ${LW(2.6)}/><ellipse cx="120" cy="125" rx="8" ry="5.6" fill="#3A2826"/><ellipse cx="117.5" cy="123.4" rx="2.4" ry="1.4" fill="#fff" opacity=".8"/>`+(o?`<ellipse cx="120" cy="140" rx="5" ry="6" fill="#B5475E" ${LW(2.4)}/>`:`<path d="M120 131 v4 M111 136 q9 8 18 0" fill="none" ${LW(2.6)}/><path d="M116 139 q4 7 8 0" fill="#FF8FA3" ${LW(2.2)}/>`);
  if(sp==="fox") return `<ellipse cx="120" cy="127" rx="5.6" ry="4" fill="#3A2826"/>`+(o?`<ellipse cx="120" cy="138" rx="4.6" ry="5.6" fill="#B5475E" ${LW(2.4)}/>`:`<path d="M112 133 q4 5 8 0 q4 5 8 0" fill="none" ${LW(2.6)}/>`);
  return `<circle cx="112" cy="124" r="2" fill="${MS_LN}"/><circle cx="128" cy="124" r="2" fill="${MS_LN}"/>`+(o?`<ellipse cx="120" cy="139" rx="6" ry="7" fill="#B5475E" ${LW(2.6)}/>`:`<path d="M100 132 q20 17 40 0" fill="#FF8FA3" ${LW(2.8)}/><path d="M106 134.5 q14 4 28 0" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`); }
/* 頭（含耳朵），中心大約在 (120,108) */
function msHead(sp,expr="smile"){ const c=MSC[sp]; let back="", front="", head="";
  if(sp==="cat"){ back=`<path d="M56 96 L60 40 Q63 30 72 36 L108 64 Z" fill="${c.body}" ${L3}/><path d="M66 82 L68 50 L92 66 Z" fill="${c.ear}"/><path d="M184 96 L180 40 Q177 30 168 36 L132 64 Z" fill="${c.body}" ${L3}/><path d="M174 82 L172 50 L148 66 Z" fill="${c.ear}"/>`;
    head=`<defs><clipPath id="hc_${sp}"><ellipse cx="120" cy="110" rx="74" ry="62"/></clipPath></defs><ellipse cx="120" cy="110" rx="74" ry="62" fill="${c.body}"/><g clip-path="url(#hc_${sp})"><path d="M40 40 Q70 70 60 112 Q92 98 98 52 Z" fill="${c.patch}"/><path d="M150 46 Q170 60 196 58 L200 30 Z" fill="${c.patch2}"/></g><ellipse cx="120" cy="110" rx="74" ry="62" fill="none" ${L3}/>`; }
  if(sp==="fox"){ back=`<path d="M52 100 L58 30 Q61 20 70 26 L112 62 Z" fill="${c.body}" ${L3}/><path d="M58 52 L60 30 Q62 24 68 28 L84 40 Z" fill="${c.ear}"/><path d="M66 84 L68 46 L94 64 Z" fill="#FFE2CC"/><path d="M188 100 L182 30 Q179 20 170 26 L128 62 Z" fill="${c.body}" ${L3}/><path d="M182 52 L180 30 Q178 24 172 28 L156 40 Z" fill="${c.ear}"/><path d="M174 84 L172 46 L146 64 Z" fill="#FFE2CC"/>`;
    head=`<defs><clipPath id="hc_${sp}"><ellipse cx="120" cy="110" rx="76" ry="62"/></clipPath></defs><ellipse cx="120" cy="110" rx="76" ry="62" fill="${c.body}"/><g clip-path="url(#hc_${sp})"><path d="M30 120 Q70 100 104 130 Q110 160 70 176 L30 176 Z" fill="${c.belly}"/><path d="M210 120 Q170 100 136 130 Q130 160 170 176 L210 176 Z" fill="${c.belly}"/></g><ellipse cx="120" cy="110" rx="76" ry="62" fill="none" ${L3}/>`; }
  if(sp==="dog"){ head=`<ellipse cx="120" cy="110" rx="74" ry="62" fill="${c.body}" ${L3}/><path d="M92 54 Q120 40 148 54 Q132 64 120 62 Q108 64 92 54Z" fill="${c.belly}" opacity=".7"/>`;
    front=`<path d="M58 70 Q30 80 34 128 Q38 150 56 146 Q70 140 70 112 Q72 86 58 70Z" fill="${c.ear}" ${L3}/><path d="M182 70 Q210 80 206 128 Q202 150 184 146 Q170 140 170 112 Q168 86 182 70Z" fill="${c.ear}" ${L3}/>`; }
  if(sp==="liz"){ back=[[86,56,12],[104,46,14],[124,44,15],[144,48,13],[160,58,11]].map(([x,y,r])=>`<path d="M${x-r} ${y+10} Q${x-r*.4} ${y-r} ${x} ${y-r*.9} Q${x+r*.5} ${y-r} ${x+r} ${y+10}Z" fill="${c.spike}" ${L3}/>`).join("");
    head=`<ellipse cx="120" cy="112" rx="78" ry="60" fill="${c.body}" ${L3}/><ellipse cx="120" cy="138" rx="44" ry="18" fill="${c.belly}" opacity=".9"/><circle cx="70" cy="86" r="5" fill="${c.spike}" opacity=".7"/><circle cx="168" cy="90" r="4" fill="${c.spike}" opacity=".7"/><circle cx="160" cy="78" r="3" fill="${c.spike}" opacity=".7"/>`; }
  const blush=`<ellipse cx="${sp==="liz"?72:76}" cy="132" rx="11" ry="6.5" fill="#FF8FA3" opacity=".5"/><ellipse cx="${sp==="liz"?168:164}" cy="132" rx="11" ry="6.5" fill="#FF8FA3" opacity=".5"/>`;
  return back+head+front+blush+msEyes(sp,expr)+msMouth(sp,expr); }
/* 應援棒 */
const msStick=(x,y,c)=>`<g transform="rotate(22 ${x} ${y+40})"><rect x="${x-5}" y="${y}" width="10" height="44" rx="5" fill="#fff" ${LW(3)}/><rect x="${x-5}" y="${y+14}" width="10" height="6" fill="${c}"/><circle cx="${x}" cy="${y-14}" r="22" fill="${c}" opacity=".25"/><circle cx="${x}" cy="${y-12}" r="16" fill="${c}" ${LW(3)}/>${ART.star(x,y-12,8,"#fff")}<ellipse cx="${x-6}" cy="${y-19}" rx="4" ry="2.6" fill="#fff" opacity=".7"/></g>`;
/* 全身（240×260）：尾巴、身體、腳、手（一手揮、一手拿應援棒）、頭 */
function msBody(sp,expr="smile"){ const c=MSC[sp]; let tail="";
  if(sp==="cat") tail=tube("M162 214 Q206 214 204 176 Q202 156 186 160",c.body,16)+`<path d="M186 160 q-8 2 -6 12" stroke="${c.patch}" stroke-width="12" stroke-linecap="round" fill="none"/>`;
  if(sp==="dog") tail=tube("M162 206 Q196 204 192 178 Q188 164 176 172",c.body,15);
  if(sp==="fox") tail=`<path d="M150 222 C214 236 242 172 220 136 C210 120 190 126 194 144 C202 178 182 204 150 202 Z" fill="${c.body}" ${L3}/><path d="M220 136 C210 120 190 126 194 144 C196 152 204 154 210 150 C218 146 224 142 220 136Z" fill="${c.belly}" ${L3}/>`;
  if(sp==="liz") tail=tube("M160 222 Q214 232 214 194 Q214 172 196 176",c.body,18)+[[188,226],[206,214],[214,196]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.2" fill="${c.spike}"/>`).join("");
  const body=`<ellipse cx="120" cy="198" rx="50" ry="42" fill="${c.body}" ${L3}/><ellipse cx="120" cy="208" rx="30" ry="26" fill="${c.belly}"/>${sp==="liz"?`<path d="M104 196 h32M102 208 h36M106 220 h28" stroke="${c.spike}" stroke-width="2" opacity=".5" stroke-linecap="round"/>`:""}
    <ellipse cx="98" cy="238" rx="17" ry="10" fill="${c.body}" ${L3}/><ellipse cx="142" cy="238" rx="17" ry="10" fill="${c.body}" ${L3}/>${sp!=="liz"?`<path d="M92 240 v-4M98 241 v-5M104 240 v-4M136 240 v-4M142 241 v-5M148 240 v-4" stroke="${MS_LN}" stroke-width="2" stroke-linecap="round" opacity=".6"/>`:""}
    <ellipse cx="72" cy="176" rx="13" ry="21" fill="${c.body}" ${L3} transform="rotate(-38 72 176)"/>`;
  const stick=msStick(200,150,c.stick)+`<ellipse cx="176" cy="186" rx="13" ry="18" fill="${c.body}" ${L3} transform="rotate(34 176 186)"/>`;
  return tail+body+`<g transform="translate(0 -6)">${msHead(sp,expr)}</g>`+stick; }
/* 一隻吉祥物主題的素材包 */
function msPack(sp,p,strip){
  const pat=sp==="cat"||sp==="dog"?`<g fill="${p.c}" opacity=".5"><g transform="translate(36 38) rotate(-18)"><ellipse cx="0" cy="6" rx="9" ry="7.5"/><circle cx="-9" cy="-5" r="3.6"/><circle cx="-3" cy="-10" r="3.6"/><circle cx="4" cy="-10" r="3.6"/><circle cx="10" cy="-4" r="3.6"/></g><g transform="translate(110 108) rotate(16) scale(.8)"><ellipse cx="0" cy="6" rx="9" ry="7.5"/><circle cx="-9" cy="-5" r="3.6"/><circle cx="-3" cy="-10" r="3.6"/><circle cx="4" cy="-10" r="3.6"/><circle cx="10" cy="-4" r="3.6"/></g></g>${ART.spark(112,36,6,p.c)}${ART.spark(38,112,5,p.c)}`
    :sp==="fox"?`<g opacity=".5">${[[38,40,-30,1],[112,110,24,.8],[110,34,60,.6],[34,112,-70,.6]].map(([x,y,r,s])=>`<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0-16C11-8 11 8 0 16C-11 8-11-8 0-16Z" fill="${p.c}"/><path d="M0-14V14" stroke="${p.bg}" stroke-width="2"/></g>`).join("")}</g>`
    :`<g opacity=".55">${ART.flower(38,40,14,p.c,p.bg)}${ART.flower(112,112,11,p.c,p.bg)}${ART.spark(110,34,7,p.c)}${ART.spark(36,114,6,p.c)}</g>`;
  const pattern=svgUrl(150,150,pat);
  const ground=`<path d="M0 54 Q60 44 120 52 T240 50 T360 52 T420 50 V90 H0Z" fill="${p.bar}"/>`;
  const stripArt=strip==="grass"?ground+[...Array(28)].map((_,i)=>`<path d="M${i*15+4} 54 q3 -12 6 0" fill="${p.g}" stroke="${p.g2}" stroke-width="1.4"/>`).join("")+[[30,50],[110,46],[196,52],[280,46],[370,50]].map(([x,y])=>ART.flower(x,y,11,"#fff","#FFD34E",1.4,p.d)).join("")
    :strip==="leaf"?ground+[[20,50,-20,p.a],[54,46,30,p.e],[92,52,-50,p.b],[128,44,10,p.a],[166,50,60,p.e],[204,46,-30,p.b],[242,52,20,p.a],[280,46,-60,p.e],[318,50,40,p.b],[356,46,-10,p.a],[396,50,30,p.e]].map(([x,y,r,col])=>`<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0-15C11-7 11 7 0 15C-11 7-11-7 0-15Z" fill="${col}" stroke="${p.d}" stroke-width="1.6"/><path d="M0-12V12" stroke="${p.d}" stroke-width="1.2" opacity=".6"/></g>`).join("")
    :ground+[[16,54,16,p.a],[48,48,20,p.b],[84,56,14,"#fff"],[116,50,19,p.a],[150,56,15,p.e],[182,48,21,p.b],[218,56,16,"#fff"],[250,50,19,p.a],[286,56,14,p.e],[318,48,20,p.b],[354,56,16,"#fff"],[388,50,19,p.a],[416,56,15,p.b]].map(([x,y,r,col])=>ART.flower(x,y,r,col,"#FFD86B",1.6,p.d)).join("");
  const stripU=svgUrl(420,90,stripArt);
  const art=svgUrl(240,260,msBody(sp,"smile"));
  const face=e=>svgUrl(64,64,`<g transform="translate(-4 -3) scale(.3)">${msHead(sp,e)}</g>`);
  const pass=[face("smile"),face("wink"),face("love"),face("wow")];
  const ic=inner=>svgUrl(48,48,inner);
  const icons={home:svgUrl(48,48,`<g transform="translate(-4.8 0) scale(.24)">${msHead(sp,"smile")}</g>`),
    live:ic(`<path d="M7 14h34a2 2 0 0 1 2 2v4a4 4 0 0 0 0 8v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4a4 4 0 0 0 0-8v-4a2 2 0 0 1 2-2z" fill="${p.b}" stroke="${MS_LN}" stroke-width="2.4" stroke-linejoin="round"/><path d="M18 18v12" stroke="${MS_LN}" stroke-width="2" stroke-dasharray="2 3"/>`+ART.heart(30,18,.42,p.a,1.6,MS_LN)),
    whisper:ic(`<path d="M24 22C18 12 8 10 6 16s4 14 18 8M24 22c6-10 16-12 18-6s-4 14-18 8" fill="${p.a}" stroke="${MS_LN}" stroke-width="2.4" stroke-linejoin="round"/><path d="M22 26l-6 14 5-1 3 4M26 26l6 14-5-1-3 4" fill="${p.b}" stroke="${MS_LN}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="24" cy="23" r="4" fill="${p.e}" stroke="${MS_LN}" stroke-width="2"/>`),
    core:ic(`<path d="M18 34V12l20-5v22" fill="none" stroke="${MS_LN}" stroke-width="2.6" stroke-linejoin="round"/><ellipse cx="13" cy="34" rx="6" ry="5" fill="${p.b}" stroke="${MS_LN}" stroke-width="2.4"/><ellipse cx="33" cy="29" rx="6" ry="5" fill="${p.a}" stroke="${MS_LN}" stroke-width="2.4"/>`+ART.spark(40,40,4,p.e)),
    shop:ic(`<path d="M13 8h22l8 11-19 22L5 19z" fill="${p.f}" stroke="${MS_LN}" stroke-width="2.4" stroke-linejoin="round"/><path d="M5 19h38M17 8l7 33M31 8l-7 33" fill="none" stroke="${MS_LN}" stroke-width="1.8"/>`),
    me:svgUrl(48,48,`<g transform="translate(-4.8 0) scale(.24)">${msHead(sp,"wink")}</g>`)};
  const deco=svgUrl(40,40,`<g transform="translate(-1.6 2.3) scale(.18)">${msHead(sp,"smile")}</g>`);
  const props=sp==="cat"?`<g transform="translate(44 300)"><circle r="22" fill="${p.a}" stroke="${MS_LN}" stroke-width="3"/><path d="M-18-8q18 10 34-4M-20 6q20 8 38-6M-8-20q10 22 2 40" fill="none" stroke="#fff" stroke-width="2.4" opacity=".8"/><path d="M20 10q24 8 30 30" fill="none" stroke="${p.a}" stroke-width="3"/></g>`
    :sp==="dog"?`<g transform="translate(250 312) rotate(-20)"><rect x="-26" y="-7" width="52" height="14" rx="7" fill="#fff" stroke="${MS_LN}" stroke-width="3"/>${[[-26,-6],[-26,6],[26,-6],[26,6]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8" fill="#fff" stroke="${MS_LN}" stroke-width="3"/>`).join("")}<rect x="-24" y="-5" width="48" height="10" fill="#fff"/></g>`
    :sp==="fox"?`<g transform="translate(46 314)"><path d="M-18 4 Q0-26 18 4Z" fill="#E8574A" stroke="${MS_LN}" stroke-width="3" stroke-linejoin="round"/><circle cx="-6" cy="-6" r="3" fill="#fff"/><circle cx="7" cy="-3" r="2.4" fill="#fff"/><rect x="-6" y="4" width="12" height="16" rx="5" fill="#FFF6E8" stroke="${MS_LN}" stroke-width="3"/></g>`
    :`${ART.star(46,300,14,p.e,3,MS_LN)}${ART.star(262,92,10,p.a,2.6,MS_LN)}`;
  const cover=svgUrl(300,400,`<rect width="300" height="400" fill="${p.bg}"/>${[0,150].map(x=>[0,150,300].map(y=>`<image href="${pattern}" x="${x}" y="${y}" width="150" height="150"/>`).join("")).join("")}
    ${ART.cloud(40,96,1,"#fff")}${ART.cloud(262,140,.8,"#fff")}${ART.spark(250,64,8,p.e)}${ART.spark(56,150,6,p.a)}
    <path d="M-10 336 Q150 292 310 336 V410 H-10Z" fill="${p.bar}"/>
    <text x="150" y="70" text-anchor="middle" font-family="'Arial Rounded MT Bold','Hiragino Maru Gothic ProN','PingFang TC',sans-serif" font-weight="900" font-size="44" fill="${p.a}" stroke="#fff" stroke-width="7" paint-order="stroke" letter-spacing="2">HAECHU</text>
    <text x="150" y="96" text-anchor="middle" font-family="'Arial Rounded MT Bold',sans-serif" font-weight="800" font-size="14" fill="${p.d}" letter-spacing="4">with ${MSC[sp].en}</text>
    ${props}<image href="${art}" x="26" y="104" width="248" height="268"/>`);
  return {pattern,deco,strip:stripU,art,pass,icons,cover};
}
const MS_THEMES=[
  {sp:"cat",name:"貓咪",strip:"flower",p:{a:"#FF9FB4",b:"#FFD08A",c:"#F6C7B4",d:"#7A4434",e:"#FFE08A",f:"#BFE3FF",bg:"#FFF4EC",bar:"#FBD8C6"},
    light:{ac:"#EE7F62",bg:"#FFF4EC",ink:"#6B3A2C",sub:"#BD8A76",bubA:"#FFFFFF",bubAB:"#F4CDBC",bubM:"#FFE1D3",bubMB:"#F4CDBC",bar:"#FBD8C6"},
    dark:{ac:"#FF9F82",bg:"#1E1714",ink:"#FCEDE6",sub:"#C7A497",bubA:"#33261F",bubAB:"#4A372D",bubM:"#C45A3C",bubMB:"#C45A3C",bar:"#2B201B"}},
  {sp:"dog",name:"小狗",strip:"grass",p:{a:"#FF9FB4",b:"#9CCBFF",c:"#C9E2F7",d:"#2C4A6B",e:"#FFE08A",f:"#BFE3FF",bg:"#EEF7FF",bar:"#BFDCF5",g:"#7CC56A",g2:"#5BA54C"},
    light:{ac:"#3E8EDB",bg:"#EEF7FF",ink:"#24466B",sub:"#7E9BBB",bubA:"#FFFFFF",bubAB:"#C6DDF3",bubM:"#DCEBFA",bubMB:"#B6D1EE",bar:"#CFE3F6"},
    dark:{ac:"#6FB1F5",bg:"#121A22",ink:"#E6F1FB",sub:"#93A9BF",bubA:"#1F2B36",bubAB:"#2E3F4F",bubM:"#2F6DAE",bubMB:"#2F6DAE",bar:"#18222D"}},
  {sp:"fox",name:"狐狸",strip:"leaf",p:{a:"#FF8A4C",b:"#E8574A",c:"#F5CFA6",d:"#6A3415",e:"#FFC94D",f:"#FFE3B3",bg:"#FFF5EA",bar:"#F7D2AA"},
    light:{ac:"#E8722E",bg:"#FFF5EA",ink:"#6A3415",sub:"#C2875E",bubA:"#FFFDF6",bubAB:"#F1C9A2",bubM:"#FFE2C2",bubMB:"#F1C9A2",bar:"#F7D2AA"},
    dark:{ac:"#FF9A55",bg:"#1F1610",ink:"#FDEBDC",sub:"#C9A283",bubA:"#35261B",bubAB:"#4C3626",bubM:"#D86A2A",bubMB:"#D86A2A",bar:"#2C1F15"}},
  {sp:"liz",name:"蜥蜴",strip:"flower",p:{a:"#FF9FC2",b:"#C9A6FF",c:"#BDE8D2",d:"#1D5A42",e:"#FFE07A",f:"#BDEBFF",bg:"#EEFBF4",bar:"#C9EEDB"},
    light:{ac:"#2FAE7C",bg:"#EEFBF4",ink:"#1D5A42",sub:"#6FA690",bubA:"#FFFFFF",bubAB:"#BFE8D3",bubM:"#FFF4C9",bubMB:"#EADC9A",bar:"#C9EEDB"},
    dark:{ac:"#5BD6A2",bg:"#111C17",ink:"#E3F7EE",sub:"#8DB7A6",bubA:"#1C2E26",bubAB:"#2A4237",bubM:"#2F9C6F",bubMB:"#2F9C6F",bar:"#17271F"}}
];
function seedMascots(){ return; if(S.get(K.seedMascot2,false)) return; S.set(K.seedMascot2,true);
  const L=getThemes().filter(t=>!String(t.id).startsWith("th_ms_"));
  const add=MS_THEMES.map((m,i)=>({id:"th_ms_"+m.sp,name:m.name,desc:`HAECHU官方的免費主題。${m.name}拿著應援棒陪你追星，聊天室、選單圖示和密碼鎖都換成${m.name}。淺色和深色都有。`,by:"admin",scope:"app",gid:"",mid:"",price:0,modes:"both",light:m.light,dark:m.dark,...msPack(m.sp,m.p,m.strip),status:"on",ts:Date.now()-(10+i)*DAY}));
  saveThemes([...add,...L]); }

/* =========================================================
   做主題的自動化（讓藝人省事、管理員不用一張張檢查）
   ① 整包上傳：照固定檔名放進 .zip（或一次選多張圖），自動放到對的位置
   ② 自動配色：從封面／插圖抓顏色，淺色一組、深色自動算一組
   ③ 自動檢查：文字看不清楚、不是透明底、尺寸太小、太大、缺必要的圖
   ④ 素材說明頁：圖解每張圖出現在哪、要多大
   ========================================================= */
/* 圖片處理：自動裁掉透明空白、置中；回傳圖和檢查用的資訊 */
const TH_KIND=f=>f.startsWith("icons.")||f.startsWith("pass.")||f==="deco"?"icon":f;
async function thImgX(blob,kind){ const url=URL.createObjectURL(blob);
  try{ const img=await new Promise((res,rej)=>{ const i=newImg(); i.onload=()=>res(i); i.onerror=rej; i.src=url; });
    const W=img.naturalWidth, H=img.naturalHeight, c0=document.createElement("canvas"); c0.width=W; c0.height=H; const x0=c0.getContext("2d"); x0.drawImage(img,0,0);
    let alpha=false, bx=[W,H,0,0];
    try{ const D=x0.getImageData(0,0,W,H).data, step=Math.max(1,Math.floor(Math.max(W,H)/400));
      for(let y=0;y<H;y+=step) for(let x=0;x<W;x+=step){ const a=D[(y*W+x)*4+3]; if(a<250) alpha=true; if(a>12){ if(x<bx[0]) bx[0]=x; if(y<bx[1]) bx[1]=y; if(x>bx[2]) bx[2]=x; if(y>bx[3]) bx[3]=y; } } }catch(e){}
    const trim=(kind==="icon"||kind==="art")&&alpha&&bx[2]>bx[0];
    const sx=trim?Math.max(0,bx[0]-2):0, sy=trim?Math.max(0,bx[1]-2):0, sw=trim?Math.min(W,bx[2]+3)-sx:W, sh=trim?Math.min(H,bx[3]+3)-sy:H;
    const c=document.createElement("canvas"), x=c.getContext("2d"); let data;
    if(kind==="icon"){ const n=128, pad=10, sc=Math.min((n-pad*2)/sw,(n-pad*2)/sh); c.width=c.height=n; x.drawImage(c0,sx,sy,sw,sh,(n-sw*sc)/2,(n-sh*sc)/2,sw*sc,sh*sc); data=c.toDataURL("image/png"); }
    else { const max={cover:600,art:700,pattern:300,strip:900}[kind]||700, sc=Math.min(1,max/Math.max(sw,sh)); c.width=Math.round(sw*sc); c.height=Math.round(sh*sc); x.drawImage(c0,sx,sy,sw,sh,0,0,c.width,c.height);
      data=kind==="cover"&&!alpha?c.toDataURL("image/jpeg",.86):c.toDataURL("image/png"); }
    return {data,meta:{w:W,h:H,alpha,kb:Math.round(data.length*.75/1024)}}; }
  finally{ URL.revokeObjectURL(url); } }
async function thPut(d,f,blob){ const r=await thImgX(blob,TH_KIND(f)); thSetF(d,f,r.data); d.meta=d.meta||{}; d.meta[f]=r.meta; return r; }

/* ① 整包上傳：固定檔名 → 欄位 */
const TH_FILES={cover:"cover",art:"art",pattern:"pattern",strip:"strip",deco:"deco",pass1:"pass.0",pass2:"pass.1",pass3:"pass.2",pass4:"pass.3",
  nav_love:"icons.home",nav_meet:"icons.live",nav_tie:"icons.whisper",nav_core:"icons.core",nav_shop:"icons.shop",nav_me:"icons.me",
  "封面":"cover","主角插圖":"art","插圖":"art","背景圖案":"pattern","圖案":"pattern","花邊":"strip","對話框裝飾":"deco","裝飾":"deco"};
const thFieldOf=name=>{ const b=String(name).split("/").pop().replace(/\.[a-z0-9]+$/i,"").trim().toLowerCase().replace(/[\s-]+/g,"_"); return TH_FILES[b]||null; };
/* 自己讀 .zip（iPhone 內建的解壓縮），不行再用 JSZip */
async function thUnzip(file){ const buf=new Uint8Array(await file.arrayBuffer()), dv=new DataView(buf.buffer); let e=-1;
  for(let i=buf.length-22;i>=Math.max(0,buf.length-65558);i--) if(dv.getUint32(i,true)===0x06054b50){ e=i; break; }
  if(e<0) throw new Error("zip"); const n=dv.getUint16(e+10,true); let p=dv.getUint32(e+16,true); const out=[], dec=new TextDecoder();
  for(let k=0;k<n;k++){ if(dv.getUint32(p,true)!==0x02014b50) break; const method=dv.getUint16(p+10,true), csize=dv.getUint32(p+20,true), nl=dv.getUint16(p+28,true), xl=dv.getUint16(p+30,true), cl=dv.getUint16(p+32,true), off=dv.getUint32(p+42,true);
    const name=dec.decode(buf.subarray(p+46,p+46+nl)); p+=46+nl+xl+cl; if(name.endsWith("/")) continue;
    const ln=dv.getUint16(off+26,true), lx=dv.getUint16(off+28,true), raw=buf.subarray(off+30+ln+lx,off+30+ln+lx+csize);
    let data; if(method===0) data=raw; else if(method===8){ if(typeof DecompressionStream==="undefined") throw new Error("nods"); data=new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer()); } else continue;
    out.push({name,blob:new Blob([data],{type:/\.svg$/i.test(name)?"image/svg+xml":/\.png$/i.test(name)?"image/png":/\.jpe?g$/i.test(name)?"image/jpeg":""})}); }
  return out; }
let thZipLib=null;
function thLoadZip(){ if(window.JSZip) return Promise.resolve(window.JSZip); if(thZipLib) return thZipLib;
  thZipLib=new Promise((res,rej)=>{ const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"; s.onload=()=>res(window.JSZip); s.onerror=()=>{ thZipLib=null; rej(new Error("zip")); }; document.head.appendChild(s); }); return thZipLib; }
async function thImport(files){ const d=ui.thDraft; if(!d) return; const got=[], skip=[];
  toast("正在讀取素材…");
  const items=[];
  for(const f of files){
    if(/\.zip$/i.test(f.name)||f.type==="application/zip"){
      let ents=null; try{ ents=await thUnzip(f); }catch(err){ try{ const Z=await thLoadZip(), z=await Z.loadAsync(f); ents=[]; for(const e of Object.values(z.files)){ if(!e.dir) ents.push({name:e.name,blob:await e.async("blob")}); } }catch(e2){ toast("壓縮檔打不開，可以改成一次選多張圖"); return; } }
      for(const e of ents){ if(/(^|\/)(__MACOSX|\.)/.test(e.name)) continue; if(!/\.(png|jpe?g|webp|gif|svg)$/i.test(e.name)){ skip.push(e.name.split("/").pop()); continue; } items.push(e); } }
    else items.push({name:f.name,blob:f}); }
  for(const it of items){ const fd=thFieldOf(it.name); if(!fd){ skip.push(it.name.split("/").pop()); continue; }
    try{ await thPut(d,fd,it.blob); got.push(fd); }catch(e){ skip.push(it.name.split("/").pop()); } }
  const auto=thIsDefault(d);
  if(auto&&(d.cover||d.art)) await thAutoColor(d,true);
  ui.thImportRep={got:got.length,skip}; const y=window.scrollY; render(); window.scrollTo(0,y);
  toast(`放好 ${got.length} 張${skip.length?`，${skip.length} 個檔名對不上`:""}${auto&&(d.cover||d.art)?"，也自動配好顏色了":""}`); }
const thIsDefault=d=>["light","dark"].every(k=>!d[k]||TH_COLS.every(([c])=>String(d[k][c]).toLowerCase()===TH_DEF[k][c].toLowerCase()));

/* ② 自動配色 */
const rgb2hsl=([r,g,b])=>{ r/=255; g/=255; b/=255; const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2; let h=0,s=0; if(mx!==mn){ const d=mx-mn; s=l>.5?d/(2-mx-mn):d/(mx+mn); h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4; h*=60; } return [h,s,l]; };
const hsl=(h,s,l)=>{ s=Math.max(0,Math.min(1,s)); l=Math.max(0,Math.min(1,l)); const k=n=>(n+h/30)%12, a=s*Math.min(l,1-l), f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1)); return "#"+[f(0),f(8),f(4)].map(v=>Math.round(v*255).toString(16).padStart(2,"0")).join(""); };
async function thSampleHue(src){ const img=await new Promise((res,rej)=>{ const i=newImg(); i.onload=()=>res(i); i.onerror=rej; i.src=src; });
  const c=document.createElement("canvas"); c.width=c.height=64; const x=c.getContext("2d"); x.drawImage(img,0,0,64,64); const D=x.getImageData(0,0,64,64).data;
  const B=Array.from({length:24},()=>({w:0,r:0,g:0,b:0})); let lightW=0,lightH=0;
  for(let i=0;i<D.length;i+=4){ if(D[i+3]<200) continue; const p=[D[i],D[i+1],D[i+2]], [h,s,l]=rgb2hsl(p);
    if(l>.82&&s>.12){ lightW+=1; lightH+=h; }
    if(s<.28||l<.25||l>.86) continue; const k=Math.floor(h/15)%24, w=s*(1-Math.abs(l-.6)); B[k].w+=w; B[k].r+=p[0]*w; B[k].g+=p[1]*w; B[k].b+=p[2]*w; }
  const best=B.reduce((a,b)=>b.w>a.w?b:a); if(!best.w) return null;
  const [h,s]=rgb2hsl([best.r/best.w,best.g/best.w,best.b/best.w]); return {h,s,bgH:lightW?lightH/lightW:h}; }
function thPalette(h,s,bgH){ const S=Math.max(.5,Math.min(.85,s));
  return {light:{ac:hsl(h,S,.56),bg:hsl(bgH,.6,.965),ink:hsl(h,.45,.25),sub:hsl(h,.22,.5),bubA:"#FFFFFF",bubAB:hsl(h,.55,.86),bubM:hsl(h,.75,.93),bubMB:hsl(h,.55,.86),bar:hsl(h,.6,.87)},
    dark:{ac:hsl(h,S,.68),bg:hsl(h,.22,.085),ink:hsl(h,.3,.94),sub:hsl(h,.14,.66),bubA:hsl(h,.18,.17),bubAB:hsl(h,.18,.25),bubM:hsl(h,.5,.42),bubMB:hsl(h,.5,.42),bar:hsl(h,.2,.13)}}; }
async function thAutoColor(d,quiet){ const src=d.cover||d.art; if(!src){ if(!quiet) toast("先放封面或主角插圖，才能自動配色"); return; }
  try{ const r=await thSampleHue(src); if(!r){ if(!quiet) toast("這張圖顏色太淡，抓不到主色"); return; } const P=thPalette(r.h,r.s,r.bgH);
    if(d.modes!=="dark") d.light=P.light; if(d.modes!=="light") d.dark=P.dark; if(!quiet) toast("已自動配色，可以再微調"); }catch(e){ if(!quiet) toast("讀不到這張圖的顏色"); } }
function thDarkFrom(d){ const [h,s]=rgb2hsl(hexRgb(d.light.ac)); d.dark=thPalette(h,s,h).dark; }

/* ③ 自動檢查 */
const relLum=h=>{ const f=v=>{ v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); }; const [r,g,b]=hexRgb(h); return .2126*f(r)+.7152*f(g)+.0722*f(b); };
const contrast=(a,b)=>{ const A=relLum(a), B=relLum(b); return (Math.max(A,B)+.05)/(Math.min(A,B)+.05); };
function thCheck(d){ const W=[], vs=d.modes==="both"?["light","dark"]:[d.modes];
  if(!d.cover) W.push({hard:1,t:"還沒放封面"}); if(!thArtOf(d)) W.push({hard:1,t:"還沒放主角插圖"});
  vs.forEach(k=>{ const v={...TH_DEF[k],...(d[k]||{})}, nm=k==="dark"?"深色版":"淺色版";
    if(contrast(v.ink,v.bg)<4.5) W.push({t:`${nm}：文字和背景太接近，會看不清楚`});
    if(contrast(v.sub,v.bg)<2.6) W.push({t:`${nm}：次要文字太淡`});
    if(contrast(thTxtOn(v.bubA,v),v.bubA)<3) W.push({t:`${nm}：藝人對話框裡的字會看不清楚`});
    if(contrast(thTxtOn(v.bubM,v),v.bubM)<3) W.push({t:`${nm}：我的對話框裡的字會看不清楚`});
    if(contrast(v.ink,v.bar)<3) W.push({t:`${nm}：密碼鍵盤的數字會看不清楚`});
    if(contrast(v.ac,v.bg)<1.8) W.push({t:`${nm}：主色和背景太像，按鈕會不明顯`});
    if(k==="dark"&&lumHex(v.bg)>.35) W.push({t:"深色版的背景太亮了"}); if(k==="light"&&lumHex(v.bg)<.6) W.push({t:"淺色版的背景太暗了"}); });
  const M=d.meta||{}, need=["art","pattern","strip","deco"].concat(Object.keys(M).filter(f=>f.startsWith("icons.")||f.startsWith("pass.")));
  const NM=f=>({cover:"封面",art:"主角插圖",pattern:"背景圖案",strip:"花邊",deco:"對話框裝飾"})[f]||(f.startsWith("pass.")?"密碼鎖圖示 "+(+f.slice(5)+1):"選單圖示 "+((TH_TABS_ALL.find(x=>x[0]===f.slice(6))||[])[1]||""));
  [...new Set(need)].forEach(f=>{ const m=M[f]; if(m&&!m.alpha) W.push({t:`${NM(f)}不是透明底，放在背景上會有一塊方框`}); });
  Object.entries(M).forEach(([f,m])=>{ const min=f==="cover"?450:f==="art"?400:f==="strip"?600:f==="pattern"?120:f==="deco"?40:80, side=f==="strip"?m.w:Math.min(m.w,m.h); if(side<min) W.push({t:`${NM(f)}太小了（${m.w}×${m.h}），放大會糊`}); });
  const kb=JSON.stringify(d).length/1024; if(kb>900) W.push({t:`整套素材太大（約 ${Math.round(kb)} KB），請換小一點的圖`});
  return W; }
const thCheckHtml=d=>{ const W=thCheck(d); return `<section class="card studio th-chk"><h3>自動檢查</h3>${W.length?`<ul>${W.map(w=>`<li class="${w.hard?"hard":""}">${w.t}</li>`).join("")}</ul>`:`<p class="th-ok">✓ 都沒問題</p>`}</section>`; };

/* ④ 素材說明頁（用貓咪主題當範例，數字標出每張圖的位置） */
function openThGuide(){ const t=thById("th_ms_cat")||thDraft(route().id); const pin=(n,x,y)=>`<i class="thg-pin" style="left:${x}%;top:${y}%">${n}</i>`;
  const SPEC=[["1","主角插圖","art.png","透明 PNG・約 800×900","放在聊天室右下角。角色朝左或朝前，腳要完整。","必要"],
    ["2","背景圖案","pattern.png","透明 PNG・300×300","會一直重複鋪滿背景，上下左右要能無縫接起來，線條淡一點。",""],
    ["3","花邊","strip.png","透明 PNG・1260×270","放在輸入列和密碼鍵盤上方。左右要能接起來，下半部的地面跟「輸入列／鍵盤」同色。",""],
    ["4","對話框裝飾","deco.png","透明 PNG・64×64","放在每個對話框的角落，小小的就好。",""],
    ["5","選單圖示 6 個","nav_love / nav_meet / nav_tie / nav_core / nav_shop / nav_me .png","透明 PNG・128×128","圖放正中間，6 個看起來要一樣大。",""],
    ["6","密碼鎖圖示 4 個","pass1 ~ pass4.png","透明 PNG・128×128","輸入一碼亮一個，可以是 4 種表情。",""],
    ["7","封面","cover.png","3:4・600×800","放在 TINT 商店和「我的主題」。","必要"]];
  setLayer(`<div class="thg" role="dialog" aria-label="素材說明"><header><span></span><b>素材說明</b><button data-a="tCloseLayer" aria-label="關閉">${XI}</button></header><div class="thg-b">
    <div class="thg-mk">${[["chat",[pin(1,72,68),pin(2,18,30),pin(3,40,84),pin(4,63,18)]],["home",[pin(5,50,95)]],["lock",[pin(6,50,30),pin(3,50,52)]]].map(([k,p])=>`<div class="thg-m">${thMock(k,t,false,.44)}${p.join("")}</div>`).join("")}</div>
    <h3>每張圖</h3><div class="thg-list">${SPEC.map(([n,nm,file,size,tip,req])=>`<div class="thg-it"><i class="thg-pin s">${n}</i><div><b>${nm}${req?`<em>${req}</em>`:""}</b><code>${file}</code><small>${size}</small><p>${tip}</p></div></div>`).join("")}</div>
    <h3>一次上傳整包</h3><p class="thg-p">把圖照上面的檔名放進同一個 .zip，按「整包上傳」選這個檔案，App 會自動放到對的位置。也可以不壓縮，直接一次選多張圖。檔名也可以用中文：封面、主角插圖、背景圖案、花邊、對話框裝飾。</p>
    <h3>顏色</h3><p class="thg-p">放好封面或主角插圖後，App 會自動抓顏色配好淺色和深色兩組，再自己微調就好。字太淡、看不清楚的話，「自動檢查」會提醒。</p>
    <h3>為什麼要透明 PNG</h3><p class="thg-p">透明底的圖可以疊在任何背景上，淺色深色都不會有白框，App 也會自動裁掉多餘的空白、幫你置中。</p>
  </div></div>`,"thg"); }

