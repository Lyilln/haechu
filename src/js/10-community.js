/* HAECHU｜團體社群頁、留言、貼文頁 */
/* =========================================================
   社群頁（仿 Weverse 的團體社群）：#/fan/grp?id=團&p=home|feed|media|shop|about&m=成員
   ・每個團有代表色：管理員上傳專輯封面時，自動從封面取顏色；還沒有封面就用團的顏色
   ========================================================= */
function gTheme(gid){ const t=(S.get(K.gTheme,{}))[gid]; if(t) return t; const g=groupOf(gid); return g?GRADS[g.g%GRADS.length][0]:"#8843FB"; }
/* 從封面取代表色：找封面裡最多、最有顏色的那一塊，再調成白字看得清楚的深淺 */
function domColor(img){ const c=document.createElement("canvas"); c.width=24; c.height=24; const x=c.getContext("2d"); x.drawImage(img,0,0,24,24); const d=x.getImageData(0,0,24,24).data; const bins={};
  for(let i=0;i<d.length;i+=4){ const r=d[i],g=d[i+1],b=d[i+2], mx=Math.max(r,g,b), mn=Math.min(r,g,b); const w=1+(mx-mn)/32; if(mx-mn<14&&(mx>232||mx<30)) continue; const k=(r>>5)+","+(g>>5)+","+(b>>5); const o=bins[k]||(bins[k]={w:0,r:0,g:0,b:0,c:0}); o.w+=w; o.r+=r; o.g+=g; o.b+=b; o.c++; }
  const o=Object.values(bins).sort((a,b)=>b.w-a.w)[0]; if(!o) return null; let r=o.r/o.c/255, g=o.g/o.c/255, b=o.b/o.c/255;
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b); let h=0, s=0, l=(mx+mn)/2; if(mx!==mn){ const dd=mx-mn; s=l>.5?dd/(2-mx-mn):dd/(mx+mn); h=mx===r?(g-b)/dd+(g<b?6:0):mx===g?(b-r)/dd+2:(r-g)/dd+4; h/=6; }
  s=Math.max(s,.38); l=Math.min(Math.max(l,.38),.52); return `hsl(${Math.round(h*360)},${Math.round(s*100)}%,${Math.round(l*100)}%)`; }
const grpHash=(gid,p,m)=>`#/fan/grp?id=${encodeURIComponent(gid)}${p&&p!=="home"?"&p="+p:""}${m?"&m="+encodeURIComponent(m):""}`;
/* 社群人數：真的有加入這個社群的帳號數 */
const gFans=gid=>{ if(HB_ON) return +(HB.fans[gid]||0); let n=0; try{ Object.keys(localStorage).filter(k=>k===K.fanArtists||k.startsWith(K.fanArtists+"@")).forEach(k=>{ try{ if((JSON.parse(localStorage.getItem(k))||[]).includes(gid)) n++; }catch(e){} }); }catch(e){} return n; };
const fmtW=n=>n>=10000?(n/10000).toFixed(n>=100000?0:1).replace(/\.0$/,"")+" 萬":fmt(n);
/* ===== 社群頁 v2（照 Weverse 影片）：封面照到最上面、捲動後上方才出現團名列、右下「＋」發表、右上「⋮」查看更多 ===== */
const XI='<svg class="xi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>';
const I3={dots:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  pen:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 20h4l10.5-10.5-4-4L4 16v4zM16 4l4 4 1.3-1.3a1.4 1.4 0 0 0 0-2L19.3 2.7a1.4 1.4 0 0 0-2 0z"/></svg>',
  letter:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>',
  bm:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>',
  log:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h10M4 12h10M4 18h7M17 14l2 2 3-4"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 21h4"/></svg>',
  out:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12h8" stroke-linecap="round"/></svg>',
  stack:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M3 7v13a1 1 0 0 0 1 1h13" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  cam:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 4h6l1.5 2H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3.5z"/><circle cx="12" cy="12.5" r="3.5" fill="#fff"/></svg>'};
/* 預設頭像（沒有照片、或網路不好照片跑不出來時）：漸層圓 + App 的「星」字標 */
const defAv=(cls="")=>`<span class="lav ${cls}"><i>${esc(((typeof ME!=="undefined"&&ME&&ME.name)||"粉").trim()[0]||"粉")}</i></span>`;
const CMAVU="daisuki_cmav_u";
const cmAvU=(by,gid)=>{ try{ const M=(S.get(CMAVU,{})||{})[String(by||"").toLowerCase()]||{}; return M[gid]||M._||""; }catch(e){ return ""; } };
const cmAvatar=(gid,cls="")=>{ const u=PCI[`cmav|${gid}`]||cmAvU(myEmail(),gid); return u?`<span class="lav img ${cls}"><img src="${esc(u)}" alt=""></span>`:defAv(cls); };
/* 留言、粉絲貼文的頭貼：作者在這個社群現在的頭貼，沒有就用字 */
const cmWhoAv=(o,gid,cls,g)=>{ const u=o&&o.by&&cmAvU(o.by,gid); return u?`<span class="${cls}" style="background:${grad(g)}"><img class="cm-avi" src="${esc(u)}" alt=""></span>`:`<span class="${cls}" style="background:${grad(g)}">${esc(ini(shownName(o)))}</span>`; };
async function cmAvSync(gid,blob){ try{ const me=myEmail(); if(!me||!blob) return; const b=await shrinkImg(blob,320); let url=HB_ON?await hbImgUrl("cmav_"+me.replace(/[^a-z0-9]/g,"_")+"_"+gid+"_"+Date.now().toString(36)+".jpg",b):null;
  if(!url) url=await new Promise(res=>{ const rd=new FileReader(); rd.onload=()=>res(rd.result); rd.readAsDataURL(b); });
  const A={...(S.get(CMAVU,{})||{})}; A[me]={...(A[me]||{}),[gid]:url}; S.set(CMAVU,A); render(); }catch(e){} }
/* 之前換過、只存在這支手機的社群頭貼：補傳一次，大家才看得到 */
setTimeout(async()=>{ try{ const me=myEmail(); if(!me) return; for(const k of (S.get(K.pcImgs,[])||[]).filter(k=>k.startsWith("cmav|"))){ const gid=k.slice(5); if(cmAvU(me,gid)||!PCI[k]) continue; const b=await (await fetch(PCI[k])).blob(); await cmAvSync(gid,b); } }catch(e){} },9000);
/* 社群個人檔案（照 Weverse）：每個社群各自一份暱稱、頭貼、簡介，跟 ME 的暱稱、其他社群都不互通
   ・第一次進這個社群：先用當下 ME 的暱稱當預設，之後各改各的
   ・暱稱另外放一份大家看得到的（CMNKU），別人在這個社群看到的就是這個名字 */
const CMNKU="daisuki_cmnick_u";
const cmNkU=(by,gid)=>{ try{ return gid&&by?(((S.get(CMNKU,{})||{})[String(by).toLowerCase()]||{})[gid]||""):""; }catch(e){ return ""; } };
function cmNkPub(gid,nick){ try{ const me=String(myEmail()||"").toLowerCase(); if(!me||!gid) return; const A={...(S.get(CMNKU,{})||{})}; if((A[me]||{})[gid]===nick) return; A[me]={...(A[me]||{}),[gid]:nick}; S.set(CMNKU,A); }catch(e){} }
function cmProf(gid){ const P=S.get(K.cmProf,{}); let x=P[gid];
  if(!x){ x={nick:ME.name,intro:"",hide:false,joined:Date.now(),own:1}; P[gid]=x; S.set(K.cmProf,P); cmNkPub(gid,x.nick); }
  else if(!x.own){ x={...x,nick:ME.name,own:1}; P[gid]=x; S.set(K.cmProf,P); cmNkPub(gid,x.nick); }   /* 舊資料：以前社群暱稱跟著 ME 走，先接上現在的名字，之後才分開 */
  return {...x}; }
const myCmNick=gid=>gid?cmProf(gid).nick||ME.name:ME.name;
/* 這則貼文／留言屬於哪個社群 */
function postGid(pid){ if(!pid) return ""; const p=getPosts().find(x=>x.id===pid); if(p) return p.group||""; const f=S.get(K.fanPosts,[]).find(x=>x.id===pid); return f?f.gid||"":""; }
const bmSet=()=>new Set(S.get(K.bm,[]));
const bmBtn=key=>`<button class="act bm ${bmSet().has(key)?"on":""}" data-a="bmTog" data-v="${key}" aria-label="書籤">${I3.bm}</button>`;
/* Shop 公告：從專輯預購、店家抽獎自動產生 */
function grpShopNotices(gid){ const L=[], D=864e5;
  getAlbums().filter(a=>a.gid===gid).forEach(a=>a.vers.forEach(v=>{ if(vPre(v)) L.push({id:"sn_"+v.id,shop:true,title:`[SHOP] 《${a.title}》${v.name} 預購開始`,ts:a.ts,body:`預購到 ${fsWhen(v.preEnd)}。\n每家店附送的預購特典不一樣，記得先比較再買。`}); }));
  getStores().forEach(st=>{ if(getAlbums().some(a=>a.gid===gid&&a.vers.some(vPre)&&storeEx(a,st.id).some(e=>e.rule==="ld"))) L.push({id:"sl_"+st.id+"_"+gid,shop:true,title:`[SHOP] ${st.name} Lucky Draw 抽獎活動`,ts:Date.now()-2*D,body:`預購期間在 ${st.name} 買專輯就能抽 Lucky Draw。\n張數有限，抽完為止。`}); });
  return L.sort((a,b)=>b.ts-a.ts); }
const cmNoticesOf=(gid,nt)=>{ if(nt==="s") return grpShopNotices(gid); const L=getGNotices().filter(n=>n.group===gid);
  try{ coNewsPosts().filter(x=>x.out!==false&&((x.news.gids||[]).includes(gid))).forEach(x=>L.push({id:"nw:"+x.news.id,title:x.news.title,ts:x.ts,act:"newsOpen",v:x.news.id,b:"#/fan/core?p=news"})); }catch(e){}
  try{ getAnns().forEach(a=>{ const src=annSrc(a); if(src&&src.gid===gid) L.push({id:a.id,title:String(a.text||"").replace(/^\S+\s*/,""),ts:a.ts,act:"preAnn"}); }); }catch(e){}
  return L.sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||b.ts-a.ts); };
const ntAttr=n=>n.act==="newsOpen"?`data-a="newsOpen" data-v="${esc(n.v)}" data-b="${esc(n.b)}"`:n.act==="preAnn"?`data-a="preAnn" data-id="${esc(n.id)}"`:`data-a="${n.shop?"snOpen":"gnOpen"}" data-v="${n.id}"`;
function grpHero(gid,skel){ const g=groupOf(gid), a=getAlbums().find(x=>x.gid===gid), cov=a&&a.vers[0]&&PCI[`vc|${a.id}|${a.vers[0].id}`], on=followed().includes(gid);
  if(skel) return `<section class="cmx-hero sk"></section>`;
  const gp=gPhoto(gid); return `<section class="cmx-hero">${gp?`<span class="cmx-hph" style="background-image:url('${gp}')"></span>`:cov?`<img src="${cov}" alt="">`:`<span class="cmx-hbg">${(typeof wkPage==="function"&&wkPage("g:"+gid).logo)?`<img class="cmx-hlogo" src="${esc(wkPage("g:"+gid).logo)}" alt="">`:`<i>${esc(String((groupOf(gid)||{}).name||"").slice(0,1))}</i>`}</span>`}<span class="cmx-shade"></span>
    <div class="cmx-hi"><small>${fmtW(gFans(gid))} 位成員${on?"・✓ 已加入":""}</small><b>${esc(g.name)}</b>
      ${on?`<button class="cmx-ms" data-a="cmMs" data-v="${gid}">${isMember(gid)?"💎 Membership":"＋ Membership"}</button>`:`<button class="cmx-ms" data-a="gJoin" data-v="${gid}">＋ 加入社群</button>`}</div></section>`; }
const cmTop=(gid,title,{me=true}={})=>`<header class="cmx-top" id="cmTop"><button class="cmx-ib" data-a="back" aria-label="返回">${I.back}</button><b class="cmx-tt">${esc(title)}</b><span class="cmx-r">${me&&followed().includes(gid)?`<button class="cmx-av" data-a="cmGo" data-v="me" aria-label="我的社群個人頁">${cmAvatar(gid)}</button>`:""}<button class="cmx-ib" data-a="cmMore" aria-label="查看更多">${I3.dots}</button></span></header>`;
/* 子頁共用的白色標題列 */
const cmSub=(title,sub,right="")=>`<header class="cmx-sub"><button class="cmx-ib" data-a="back" aria-label="返回">${I.back}</button><span class="cmx-st"><b>${esc(title)}</b>${sub?`<small>${esc(sub)}</small>`:""}</span><span class="cmx-sr">${right}</span></header>`;
const cmSkel=()=>`<div class="sk-blk w30"></div><div class="sk-card"><div class="sk-blk"></div><div class="sk-blk w70"></div><div class="sk-blk w50"></div></div><div class="sk-blk w30"></div><div class="sk-card"><div class="sk-blk w70"></div></div>`;
function viewGrp(gid,tab,mid){ const g=groupOf(gid); if(!g) return go("fan"); const T=gTheme(gid);
  { const seen=S.get(K.grpSeen,{}); seen[gid]=Date.now(); S.set(K.grpSeen,seen); }
  setTimeout(cmTopSync,0);
  if(tab==="about"&&mid&&MEMBERS[mid]) return viewMemberProfile(gid,mid);
  if(tab==="about") return `<div class="gcm" style="--gt:${T}"><header class="cm-bar plain"><button class="icon-btn" data-a="back" aria-label="返回">${I.back}</button><b>About</b><span class="sh-sp"></span></header><main class="page cm-about">${viewAbout(gid)}</main></div>`;
  const sub={me:viewCmMe,meEdit:viewCmMeEdit,write:viewCmWrite,search:viewCmSearch,bm:viewCmBm,apply:viewCmApply,notif:viewCmNotif}[tab];
  if(tab==="letter") return viewCmLetter(gid,mid);
  if(sub) return sub(gid);
  const skel=false;   // 灰色載入畫面只在網路不好、資料還沒到時才會出現；目前資料都在手機裡，所以不會出現
  const tabs=[["home","Home"],["feed","Feed"],["media",mediaName(gid)],["shop","Shop"]];
  const body=skel?cmSkel():tab==="feed"?grpFeed(gid):tab==="media"?grpMedia(gid):tab==="shop"?grpShop(gid):grpHome(gid);
  return `<div class="gcm cmx" style="--gt:${T}">${cmTop(gid,g.name)}${grpHero(gid,skel)}<nav class="cm-tabs cmx-tabs">${tabs.map(([k,l])=>`<button class="${tab===k?"on":""}" data-a="cmTab" data-v="${k}">${l}</button>`).join("")}</nav><main class="page cm-body">${body}</main>
    ${!skel&&followed().includes(gid)?`<button class="cmx-fab" data-a="cmFab" aria-label="發表">${I3.plus}</button>`:""}</div>`; }
/* 捲過封面後，上方的團名列才變成實心（團體代表色） */
function cmTopSync(){ const t=document.getElementById("cmTop"); if(!t) return; const h=document.querySelector(".cmx-hero"); const lim=h?h.offsetHeight-t.offsetHeight-8:-1; t.classList.toggle("solid",!h||window.scrollY>lim); }
addEventListener("scroll",cmTopSync,{passive:true});

const cmSec=(t,more,act)=>`<div class="cm-sh"><h3>${t}</h3>${more?`<button data-a="${act}">${more} ›</button>`:""}</div>`;
const ntChips=(nt,act)=>`<div class="cm-chips sm cm-ntc">${[["c","Community"],["s","Shop"]].map(([k,l])=>`<button class="${nt===k?"on":""}" data-a="${act}" data-v="${k}">${l}</button>`).join("")}</div>`;
const ntRow=n=>`<button class="cm-nl ${n.pin?"pin":""}" ${ntAttr(n)}><em></em><span>${esc(n.title)}</span>${Date.now()-n.ts<3*864e5?"<i></i>":""}</button>`;
function grpHome(gid){ const g=groupOf(gid), nt=ui.cmNt||"c", ns=cmNoticesOf(gid,nt).slice(0,5), ms=grpMembers(gid), prods=shopProducts(gid).filter(p=>p.kind!=="tie").slice(0,6), up=grpSched(gid)[0], lvN=meetOf(l=>MEMBERS[l.member].group===gid&&!l.endTs);
  const nowH=lvN.length?`${cmSec("Now LIVE")}<div class="nl-r${lvN.length>1?" many":""}">${lvN.map(l=>`<button class="nl-c" data-a="openLive" data-id="${l.id}" data-lv="${l.id}"><span class="nl-t cv-fit" style="${lvCoverFit(l.member,l)}"></span><span class="nl-i"><i class="nl-av" style="background:${grad(MEMBERS[l.member].g)}">${mAvIn(l.member,"live")}<em>LIVE</em></i><span class="nl-tx"><b>${esc(l.title)}</b><small>${esc(artName(l.member,"live"))}</small></span></span></button>`).join("")}</div>`:"";
  return `${nowH}${cmSec("公告")}${ntChips(nt,"cmNt")}<section class="card cm-card">${ns.length?ns.map(ntRow).join(""):`<p class="me-none">還沒有${nt==="s"?" Shop ":""}公告</p>`}
      <button class="cm-go" data-a="cmNotices">確認 ${esc(g.name)} 的公告 <span>→</span></button></section>
    ${cmSec("Calendar")}<section class="card cm-card">${up?`<div class="cm-up"><small>${evWhen(up.ts)}</small><b>${up.ic} ${esc(up.t)}</b></div>`:""}<button class="cm-go" data-a="cmCal">確認 ${esc(g.name)} 的行程 <span>→</span></button></section>
    ${prods.length?`${cmSec("Merch","查看更多","cmShop")}<div class="cm-merch">${prods.map(prodCard).join("")}</div>`:""}
    ${cmSec("About")}<section class="card cm-abc">${g.solo&&ms[0]?(()=>{ const m=ms[0], gp=gPhoto(gid); return `<button class="cm-abs" data-a="cmAbMem" data-v="${m}"><i style="background:${grad(MEMBERS[m].g)}">${gp?`<span class="av-img av-bgi" role="img" aria-label="${esc(MEMBERS[m].name)}" style="background-image:url('${gp}')"></span>`:mAvIn(m)}</i><b>${esc(MEMBERS[m].name)}</b></button>`; })():`<div class="cm-ab">${ms.map(m=>`<button data-a="cmAbMem" data-v="${m}"><i style="background:${grad(MEMBERS[m].g)}">${teaserIn(m)}</i><small>${esc(MEMBERS[m].name)}</small></button>`).join("")}</div>`}<button class="cm-abm" data-a="cmAbout">查看更多 ›</button></section>
    <section class="card cm-card"><button class="cm-go" data-a="wkGo" data-v="g:${gid}">在 SKpedia 看 ${esc(g.name)} <span>→</span></button></section>`; }
function openNoticeList(gid){ const g=groupOf(gid), nt=ui.cmNt||"c", ns=cmNoticesOf(gid,nt);
  setLayer(`<div class="tiei" style="--gt:${gTheme(gid)}"><header class="tiei-top"><button class="icon-btn" data-a="tCloseLayer" aria-label="返回">${I.back}</button><b>${esc(g.name)} 公告</b><span class="sh-sp"></span></header>
    <div class="tiei-body">${ntChips(nt,"cmNtL")}${ns.length?ns.map(n=>`<button class="cm-nrow" ${ntAttr(n)}><b>${esc(n.title)}</b><small>${ymd(n.ts)}</small></button>`).join(""):`<p class="me-none">還沒有公告</p>`}</div></div>`,"nl"); }
/* 右下「＋」：粉絲信、貼文 */
function fabMenu(items,cls){ const n=items.length; return `<div class="cmx-fabw ${cls||""}" data-a="fabClose"><div class="cmx-fabm">${items.map(([a,v,l,ic],k)=>`<button data-a="${a}" data-v="${v}" style="--k:${n-1-k}"><span>${l}</span><i>${ic}</i></button>`).join("")}<button class="x" data-a="fabClose" aria-label="關閉">${I3.x}</button></div></div>`; }
function openCmFab(gid){ setLayer(fabMenu([["cmLetterTo",gid,"粉絲信",I3.letter],["cmGo","write","貼文",I3.pen]]),"fab"); }
const FAB_LOCK='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a5 5 0 0 0-5 5V10H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7.5a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0V10H9V7.5z"/></svg>';
const FAB_GEM='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.2 3.5h9.6l4.4 5.4-9.2 11.6L2.8 8.9z"/></svg>';
const ART_W={all:"貼文",ms:"Membership",pw:"私密貼文"};
function openArtFab(){ setLayer(fabMenu([["aWrite","pw","私密貼文",FAB_LOCK],["aWrite","ms","Membership",FAB_GEM],["aWrite","all","貼文",I3.pen]],"art"),"fab"); }
function closeFab(){ const w=layer.querySelector(".cmx-fabw"); if(!w||w.classList.contains("out")) return; w.classList.add("out"); setTimeout(()=>{ if(layer.querySelector(".cmx-fabw.out")) layer.innerHTML=""; },230); }
function viewArtWrite(v){ const s=session(), mid=s.member, vis=ART_W[v]?v:"all", ms=ui.composeMedia||[];
  return `<div class="cw aw"><header class="cw-h"><button data-a="back">取消</button><span><b>${ART_W[vis]}</b><small>${esc(artName(mid,"feed"))}</small></span><button class="cw-ok" id="pubBtn" data-a="publish" ${ui.composeText.trim()||ms.length||ui.composePoll?"":"disabled"}>發布</button></header>
    ${vis==="pw"?`<label class="aw-pw">${FAB_LOCK}<input id="cpw" maxlength="12" autocomplete="off" placeholder="設定密碼" aria-label="貼文密碼" value="${esc(ui.composePw||"")}"></label>`:""}
    <textarea id="ct" class="cw-t" placeholder="輸入文字">${esc(ui.composeText)}</textarea>
    ${ui.composePoll?`<div class="aw-poll"><button class="aw-pq" data-a="pollNew"><b>${esc(ui.composePoll.q)}</b>${ui.composePoll.opts.map(o=>`<span>${o.img?`<img src="${o.img}" alt="">`:""}${esc(o.t)}</span>`).join("")}<small>${pollLeft(ui.composePoll.end)}</small></button><button class="aw-px" data-a="pollDel" aria-label="移除票選">${I3.x}</button></div>`:""}
    ${ms.length?`<div class="cm-media aw-media">${ms.map((x,i)=>`<span class="cmm"><img data-mid="${x.kind==="video"?x.thumb||"":x.mid}" alt="">${x.kind==="video"?`<i>${PLAY}</i>`:`<button class="cmm-crop" data-a="cmCrop" data-i="${i}" aria-label="裁剪">${CROP_IC}</button>`}<button data-a="cmDel" data-i="${i}" aria-label="移除">${XI}</button></span>`).join("")}</div>`:""}
    <footer class="aw-tb">${ms.length<4&&!ms.some(x=>x.kind==="video")?`<label class="aw-ic" aria-label="加入照片或影片"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="9" cy="9" r="1.6"/><path d="m4 17 5-5 4 4 2.5-2.5L20 18"/></svg><input type="file" id="postMedia" accept="image/*,video/*" multiple></label>`:""}<button class="aw-ic" data-a="pollNew" aria-label="票選活動">${PL_IC}</button></footer></div>`; }
function openLetterTo(gid){ const g=groupOf(gid);
  /* SOLOIST：團就是本人，不用選收件人，直接寫給他 */
  if(g&&g.solo){ const m=grpMembers(gid).find(x=>MEMBERS[x]&&!MEMBERS[x].official); ui.ltTpl=null; navTo(grpHash(gid,"letter",m||gid)); window.scrollTo(0,0); return; }
  setLayer(`<div class="lt-w" role="dialog" aria-label="收件人"><header class="lt-h"><span></span><b>收件人</b><button data-a="tCloseLayer" aria-label="關閉">${I3.x}</button></header><p class="lt-sub">可選擇團體或藝人並傳送粉絲信。</p>
    <h4>寫給團體</h4><button class="lt-r" data-a="cmLetter" data-v="${gid}"><span class="lt-av g-ico" style="background:${grad(g.g)}">${gIcoIn(g)}</span><b>${esc(g.name)}</b></button>
    <h4>寫給成員</h4>${grpMembers(gid).map(m=>`<button class="lt-r" data-a="cmLetter" data-v="${m}"><span class="lt-av" style="background:${grad(MEMBERS[m].g)}">${mAvIn(m)}</span><b>${esc(artName(m,"feed"))}</b></button>`).join("")}</div>`,"ltto"); }
const LT_TPL=[["#FFFFFF","#1D1A24"],["#FFF4E0","#4A3B1F"],["#EFE8FF","#3B2E6B"],["#FFE9F2","#6B2443"],["#E6F6EF","#1F4A3A"]];
const ltKey=(gid,to)=>gid+"|"+to;
function viewCmLetter(gid,to){ const g=groupOf(gid), name=MEMBERS[to]?artName(to,"feed"):g.name, d=(S.get(K.ltDraft,{}))[ltKey(gid,to)]||{}, tp=ui.ltTpl!=null?ui.ltTpl:(d.tpl||0), C=LT_TPL[tp]||LT_TPL[0];
  return `<div class="ltp" style="--gt:${gTheme(gid)}"><header class="ltp-h"><button class="cmx-ib" data-a="ltX" aria-label="取消">${I3.x}</button><b>To. ${esc(name)}</b><button class="ltp-ok" data-a="ltDone" data-g="${gid}" data-v="${to}">完成</button></header>
    <div class="ltp-paper" style="background:${C[0]};color:${C[1]}"><textarea id="ltTxt" placeholder="輸入文字" style="color:${C[1]}">${esc(d.text||"")}</textarea><small class="ltp-from">From. ${esc(cmProf(gid).nick)}</small></div>
    <div class="ltp-tools"><span>信紙</span>${LT_TPL.map((c,i)=>`<button class="${i===tp?"on":""}" style="background:${c[0]}" data-a="ltTpl" data-v="${i}" aria-label="信紙 ${i+1}"></button>`).join("")}</div></div>`; }
function viewCmWrite(gid){ const g=groupOf(gid), hide=!!ui.cwHide;
  return `<div class="cw"><header class="cw-h"><button data-a="back">取消</button><span><b>撰寫貼文</b><small>${esc(g.name)}</small></span><button class="cw-ok" id="cwOk" data-a="cwPost" data-v="${gid}" disabled>新增</button></header>
    <textarea id="cwTxt" class="cw-t" placeholder="輸入文字"></textarea>
    <div class="cw-ims">${(ui.cwImgs||[]).map((u,i)=>`<span><img src="${esc(u)}" alt=""><button data-a="cwImgX" data-v="${i}" aria-label="移除">${XI}</button></span>`).join("")}<label class="cw-add" aria-label="加照片">${PDI.photo||"＋"}<input type="file" accept="image/*" multiple id="cwFile" hidden></label></div>
    <footer class="cw-f"><button class="sw ${hide?"on":""}" role="switch" data-a="cwHide" aria-checked="${hide}"></button><span>Hide from Artists<small>開啟後藝人看不到這則貼文</small></span></footer></div>`; }
function viewCmMe(gid){ const g=groupOf(gid), P=cmProf(gid), tab=ui.cmMeTab||"post", bg=PCI[`cmbg|${gid}`];
  const posts=S.get(K.fanPosts,[]).filter(p=>p.gid===gid&&isMine(p)).sort((a,b)=>b.ts-a.ts), gp=new Set(getPosts().filter(p=>p.group===gid).map(p=>p.id)), cms=S.get(K.comments,[]).filter(c=>isMeC(c)&&gp.has(c.postId)).sort((a,b)=>b.ts-a.ts), lts=S.get(K.fanLetters,[]).filter(l=>l.gid===gid).sort((a,b)=>b.ts-a.ts);
  const fol=grpMembers(gid).filter(m=>(S.get(K.mFollow,{}))[m]).length, bms=S.get(K.bm,[]).length;
  const list=tab==="post"?(posts.length?posts.map(fanCard).join(""):`<p class="cmx-empty">尚未發表貼文。</p>`):tab==="cm"?(cms.length?cms.map(c=>`<section class="card fp">${trT("c:"+c.id,c.text,"")}<small class="fp-sm">${ago(c.ts)}</small></section>`).join(""):`<p class="cmx-empty">尚未發表留言。</p>`)
    :(lts.length?lts.map(l=>`<section class="card fp lt-card" style="background:${(LT_TPL[l.tpl]||LT_TPL[0])[0]};color:${(LT_TPL[l.tpl]||LT_TPL[0])[1]}"><b>To. ${esc(MEMBERS[l.to]?artName(l.to,"feed"):g.name)}</b><p>${esc(l.text)}</p><small class="fp-sm">${ymd(l.ts)}</small></section>`).join(""):`<p class="cmx-empty">尚未有撰寫的粉絲信。</p>`);
  return `<div class="gcm cmx-me" style="--gt:${gTheme(gid)}"><header class="cmx-top"><button class="cmx-ib" data-a="back" aria-label="返回">${I.back}</button><span></span></header>
    <section class="me-hero" ${bg?`style="background-image:linear-gradient(transparent,rgba(0,0,0,.45)),url(${bg})"`:""}>${cmAvatar(gid,"big")}<small>${ymd(P.joined)} 已加入</small><b>${esc(P.nick)}</b>${P.intro&&!P.hide?`<p>${esc(P.intro)}</p>`:""}
      <div class="me-st"><span><b>${fol}</b>正在追蹤</span><span><b>0</b>追蹤者</span><span><b>${bms}</b>收藏集</span></div><button class="me-ed" data-a="cmGo" data-v="meEdit">編輯個人簡介</button></section>
    <nav class="cm-tabs cmx-mt">${[["post","貼文"],["cm","留言"],["lt","粉絲信"]].map(([k,l])=>`<button class="${tab===k?"on":""}" data-a="cmMeTab" data-v="${k}">${l}</button>`).join("")}</nav>
    <main class="page cm-body">${list}</main><button class="cmx-fab" data-a="cmFab" aria-label="發表">${I3.plus}</button></div>`; }
function viewCmMeEdit(gid){ const P={...cmProf(gid),...(ui.meDraft||{})}, bg=PCI[`cmbg|${gid}`];
  return `<div class="gcm cmx-me" style="--gt:${gTheme(gid)}"><header class="cmx-top"><button class="cmx-ib" data-a="back" aria-label="返回">${I.back}</button><span></span></header>
    <section class="me-hero ed" ${bg?`style="background-image:linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.45)),url(${bg})"`:""}><label class="me-avu">${cmAvatar(gid,"big")}<em>${I3.cam}</em><input type="file" accept="image/*" class="ap-in" data-pk="cmav|${gid}" hidden></label>
      <div class="me-f"><input id="meNick" maxlength="20" value="${esc(P.nick)}" aria-label="暱稱"><small><span id="meNickN">${P.nick.length}</span>/20</small></div>
      <div class="me-f"><textarea id="meIntro" placeholder="輸入文字" aria-label="介紹文">${esc(P.intro)}</textarea></div>
      <label class="me-bgb">${I3.cam} 編輯背景圖片<input type="file" accept="image/*" class="ap-in" data-pk="cmbg|${gid}" hidden></label></section>
    <main class="page"><div class="me-hid"><span><b>隱藏個人簡介</b><small>其他人還是可以看到你的個人頁，但看不到你寫的介紹文，也無法追蹤你。</small></span><button class="sw ${P.hide?"on":""}" role="switch" data-a="meHide" aria-checked="${!!P.hide}"></button></div>
      <button class="btn btn-block cmx-save" data-a="meSave" data-v="${gid}">儲存</button></main></div>`; }
function viewCmSearch(gid){ const g=groupOf(gid);
  return `<div class="gcm cmx-pg" style="--gt:${gTheme(gid)}"><header class="cmx-sub"><button class="cmx-ib" data-a="back" aria-label="返回">${I.back}</button><label class="cmx-q">${I.search}<input id="cmQ" data-g="${gid}" placeholder="輸入文字" autocomplete="off"></label></header>
    <main class="page cm-body" id="cmQR"><div class="cmx-none">${I.search}<p>沒有最近的搜尋字詞。</p></div></main></div>`; }
function cmSearchRun(gid,q){ const box=document.getElementById("cmQR"); if(!box) return; q=nz(q.trim()); if(!q){ box.innerHTML=`<div class="cmx-none">${I.search}<p>沒有最近的搜尋字詞。</p></div>`; return; }
  const art=getPosts().filter(p=>p.group===gid&&!p.hidden&&nz(p.text).includes(q)), fans=S.get(K.fanPosts,[]).filter(p=>p.gid===gid&&nz(p.text).includes(q));
  box.innerHTML=art.length||fans.length?`${art.length?cmSec(`藝人貼文 ${art.length}`):""}${art.map(p=>postCard(p)).join("")}${fans.length?cmSec(`粉絲貼文 ${fans.length}`):""}${fans.map(fanCard).join("")}`:`<div class="cmx-none">${I.search}<p>找不到包含「${esc(q)}」的貼文。</p></div>`; hydrateMedia(box); }
function viewCmBm(gid){ const g=groupOf(gid), tab=ui.bmTab||"fan", B=bmSet();
  const fans=S.get(K.fanPosts,[]).filter(p=>p.gid===gid&&B.has("f:"+p.id)), art=getPosts().filter(p=>p.group===gid&&B.has("p:"+p.id));
  const body=tab==="fan"?(fans.length?fans.map(fanCard).join(""):`<div class="cmx-none"><b>!</b><p>沒有新增書籤的貼文。</p></div>`):tab==="artist"?(art.length?art.map(p=>postCard(p)).join(""):`<div class="cmx-none"><b>!</b><p>沒有新增書籤的貼文。</p></div>`)
    :`<div class="cmx-none"><b>!</b><p>${tab==="media"?"沒有新增書籤的內容。":"沒有新增書籤的行程。"}</p></div>`;
  return `<div class="gcm cmx-pg" style="--gt:${gTheme(gid)}">${cmSub("書籤",g.name)}<nav class="cm-tabs">${[["fan","Fan"],["artist","Artist"],["media","Media"],["cal","Calendar"]].map(([k,l])=>`<button class="${tab===k?"on":""}" data-a="bmTab" data-v="${k}">${l}</button>`).join("")}</nav><main class="page cm-body">${body}</main></div>`; }
function viewCmApply(gid){ const g=groupOf(gid), L=fsAll().filter(ev=>ev.group===gid&&(ev.type==="solo"?(ev.members||[]).some(m=>fsEntries(ev,m)[FS_ME]):!!(ev.entries||{})[FS_ME]));
  return `<div class="gcm cmx-pg" style="--gt:${gTheme(gid)}">${cmSub("申請紀錄",g.name)}<main class="page cm-body">${L.length?L.map(ev=>{ const won=fsMySlots(ev).length, st=won?"中選":ev.status==="done"?"未中選":"抽選中";
      return `<section class="card cm-card ap-r"><span class="ap-t">✍️ 簽售</span><b>${esc(ev.title)}</b><small>${ev.startTs?evWhen(ev.startTs):""}</small><em class="ap-s ${won?"on":""}">${st}</em></section>`; }).join(""):`<div class="cmx-none"><p>尚未申請任何 ${esc(g.name)} 的活動。</p></div>`}</main></div>`; }
const CN_GROUPS=[["我的活動",[["mcm","收到留言"],["mfo","追蹤"],["mlk","收到讚"],["mvt","投票"],["mfd","所追蹤的動態"]]],["藝人活動",[["apo","貼文"],["amo","Moment"],["alv","LIVE"],["acm","留言或聊天"],["alk","按我讚"]]],["社群",[["cmd","媒體內容"],["ccl","行事曆"],["can","紀念日"],["cno","社群公告"],["cof","官方貼文"],["csh","Shop 公告"]]]];
const CN_DEF={apo:1,alv:1,alk:1};
const cnGet=gid=>({...CN_DEF,...((S.get(K.cmNotif,{}))[gid]||{})});
function viewCmNotif(gid){ const g=groupOf(gid), N=cnGet(gid);
  return `<div class="gcm cmx-pg" style="--gt:${gTheme(gid)}">${cmSub("通知設定",g.name)}<main class="page cm-body">${CN_GROUPS.map(([h,L],gi)=>{ const all=L.every(([k])=>N[k]);
      return `<div class="cn-h"><b>${h}</b><button data-a="cnAll" data-v="${gi}" data-on="${all?0:1}">${all?"全部關閉":"全部打開"}</button></div><section class="card cn-c">${L.map(([k,l])=>`<div class="cn-r"><span>${l}</span><button class="sw ${N[k]?"on":""}" role="switch" data-a="cnTog" data-v="${k}" aria-checked="${!!N[k]}" aria-label="${l}"></button></div>`).join("")}</section>`; }).join("")}</main></div>`; }
/* 右上「⋮」查看更多 */
function openCmMore(gid){ const on=followed().includes(gid);
  setLayer(`<div class="cmx-shw" data-a="tCloseLayer"><div class="cmx-sh" role="dialog" aria-label="查看更多"><i class="cmx-grab"></i><div class="cmx-shh"><b>查看更多</b><button data-a="tCloseLayer" aria-label="關閉">${I3.x}</button></div>
    <button data-a="cmGo" data-v="search">${I.search}<span>搜尋</span><i>›</i></button><button data-a="cmGo" data-v="bm">${I3.bm}<span>書籤</span><i>›</i></button><button data-a="cmGo" data-v="apply">${I3.log}<span>活動申請紀錄</span><i>›</i></button>
    <button data-a="cmMs" data-v="${gid}">${I3.heart}<span>Membership</span><i>›</i></button><hr><button data-a="cmGo" data-v="notif">${I3.bell}<span>通知設定</span><i>›</i></button>
    ${on?`<hr><button data-a="gLeave" data-v="${gid}">${I3.out}<span>退出社群</span></button>`:""}</div></div>`,"cmmore"); }

const myEmail=()=>String((session()||{}).email||"").toLowerCase();
/* 這個人「現在這個身分」：藝人端＝m:藝人，粉絲端＝帳號。只有積分兩邊相通，按讚、購買、送東西都分開算 */
const myId=()=>{ const s=session()||{}; return s.role==="artist"&&s.member?"m:"+s.member:myEmail(); };
/* 「我」說的話：多人版每則都記是誰（by），別人的就當成其他粉絲 */
const mineX=x=>!!x&&x.from==="me"&&(!x.by||x.by===myEmail());
/* 留言是不是「我」寫的：新帳號看示範帳號的留言，要當成別人的 */
const isMeC=c=>c.author==="me"&&(c.by?c.by===myEmail():(((session()||{}).role!=="fan"||(session()||{}).admin)?true:myEmail()===DEMO_FAN));
const isMine=p=>p.mine&&(p.by?p.by===myEmail():myEmail()===DEMO_FAN);
/* 社群 Feed 的粉絲貼文（照 Weverse）：頭貼、名字、時間、文字、照片、愛心／留言數、收藏；點了進貼文頁 */
function fanCard2(p){ const cms=S.get(K.comments,[]).filter(c=>c.postId===p.id).length+(p.rep||[]).length, lk=likedSet().has(p.id), im=p.imgs||[];
  return `<article class="card fp2" data-a="fpGo" data-id="${p.id}"><div class="fp2-h">${isMine(p)?cmAvatar(p.gid,"fp2-av"):cmWhoAv(p,p.gid,"fp2-av",p.g||3)}<span class="fp2-w"><b>${esc(shownName(p))}</b><small>${ymdhm(p.ts)}${p.hideArt?`<em class="fp2-hide">Hide from Artists</em>`:""}</small></span>${canModerate()&&!isMine(p)?`<button class="uni-more" data-a="amFp" data-id="${p.id}" aria-label="管理這則">⋯</button>`:""}</div>
    ${p.text?`<div class="fp2-t">${trT("f:"+p.id,p.text,"")}</div>`:""}
    ${im.length?`<div class="fp2-im${im.length>1?" many":""}">${im.map(u=>`<img src="${esc(u)}" alt="" loading="lazy">`).join("")}</div>${im.length>1?`<div class="fp2-dots">${im.map((_,i)=>`<i class="${i?"":"on"}"></i>`).join("")}</div>`:""}`:""}
    <div class="fp2-f"><button class="fp2-b ${lk?"liked":""}" data-a="like" data-id="${p.id}" aria-label="喜歡">${I.heart}<span>${likeN(p)?fmt(likeN(p)):""}</span></button><button class="fp2-b" data-a="fpGo" data-id="${p.id}" aria-label="留言">${PDI.reply}<span>${cms?fmt(cms):""}</span></button><i class="fp2-sp"></i>${bmBtn("f:"+p.id)}</div></article>`; }
const fanCard=p=>`<section class="card fp"><div class="fp-h">${isMine(p)?cmAvatar(p.gid,"sm"):(p.by&&cmAvU(p.by,p.gid)?`<i style="background:${grad(p.g||3)}"><img class="cm-avi" src="${esc(cmAvU(p.by,p.gid))}" alt=""></i>`:`<i style="background:${grad(p.g||3)}">${esc((shownName(p)||"粉")[0])}</i>`)}<b>${esc(shownName(p))}</b><small>${ago(p.ts)}</small>${canModerate()&&!isMine(p)?`<button class="uni-more fp-more" data-a="amFp" data-id="${p.id}" aria-label="管理這則">⋯</button>`:""}</div>${trT("f:"+p.id,p.text,"")}${fpReps(p)}<div class="fp-f">${p.hideArt?'<span class="fp-hid">藝人看不到</span>':""}${fpCanRep(p)?`<button class="fp-rb" data-a="fpRep" data-id="${p.id}">回覆</button>`:""}${bmBtn("f:"+p.id)}</div></section>`;
/* 粉絲貼文：這團的藝人可以回覆（大家都看得到，發文的粉絲會收到通知） */
function fpOpen(id,focus){ const p=S.get(K.fanPosts,[]).find(x=>x.id===id); if(!p){ layer.innerHTML=""; return; }
  setLayer(`<div class="pd ${focus?"in":""}" role="dialog" aria-label="粉絲貼文"><header class="pd-top"><button class="pd-ib" data-a="fpClose" aria-label="返回">${I.back}</button><span class="pd-tt"><b>粉絲貼文</b></span><span class="pd-ib"></span></header>
    <main class="pd-body fp-pd">${fanCard({...p,_d:1}).replace(/<button class="fp-rb"[^>]*>回覆<\/button>/,"")}</main>
    ${fpCanRep(p)?`<form class="pd-in" onsubmit="return false"><div class="pd-bar"><label class="pd-pill"><textarea rows="1" class="ag" id="fpRepIn" maxlength="300" autocomplete="off" placeholder="請輸入回覆"></textarea></label><button class="pd-send" type="button" data-a="fpRepOk" data-id="${p.id}" aria-label="送出">${PDI.send}</button></div></form>`:""}</div>`,"fp"+id);
  if(focus) setTimeout(()=>{ const i=document.getElementById("fpRepIn"); if(i) i.focus(); },250); }
const fpCanRep=p=>{ const s=session()||{}; return s.role==="artist"&&s.member&&MEMBERS[s.member]&&MEMBERS[s.member].group===p.gid; };
const fpReps=p=>(p.rep||[]).length?`<div class="fp-reps">${p.rep.map(r=>`<div class="fp-rp"><span class="fp-rav" style="background:${grad((MEMBERS[r.mid]||{g:0}).g)}">${MEMBERS[r.mid]?mAvIn(r.mid):""}</span><div><b>${esc(MEMBERS[r.mid]?artName(r.mid,"feed"):"藝人")}<em class="dl-vf dk-keep">${I.verified}</em></b>${(session()||{}).member===r.mid?`<p>${esc(r.text)}</p>`:trT("fr:"+r.id,r.text,"")}<small>${ago(r.ts)}</small></div></div>`).join("")}</div>`:"";
function grpSched(gid){ const now=Date.now(), D=864e5, it=[];
  grpMembers(gid).forEach(id=>{ const d=bdayLeft(id); if(d!=null) it.push({ts:now+d*D,ic:"🎂",t:`${MEMBERS[id].name} 生日`,k:"紀念日"}); });
  getConcerts().filter(c=>c.gid===gid&&!c.ended&&c.endTs>now).forEach(c=>it.push({ts:c.startTs,ic:"🎤",t:c.title,k:"演唱會"}));
  getPlans().filter(p=>p.group===gid&&MEMBERS[p.member]).forEach(p=>it.push({ts:p.ts,ic:"📡",t:`${artName(p.member,"feed")}・${p.title}`,k:"直播"}));
  fsAll().filter(e=>e.group===gid&&e.id!=="fsshow"&&e.status!=="done").forEach(e=>it.push({ts:e.startTs||now,ic:"✍️",t:e.title,k:"簽售"}));
  getAlbums().filter(a=>a.gid===gid).forEach(a=>a.vers.forEach(v=>{ if(vPre(v)) it.push({ts:v.preEnd,ic:"💿",t:`《${a.title}》${v.name} 預購截止`,k:"專輯"}); }));
  /* 照 Weverse 行事曆：生日・紀念日、發行、放送（打歌／綜藝）、公演、活動、LIVE（她說：跟藝人有關的工作都要放） */
  const T=f=>{ try{ f(); }catch(e){} }, ms=getMShow(), mem=new Set(grpMembers(gid));
  T(()=>{ const deb=[...ms.songs,...(ms.ended||[])].filter(x=>x.gid===gid&&x.debut&&x.rel).sort((a,b)=>a.rel-b.rel)[0]; if(deb){ const d0=new Date(deb.rel), y=new Date().getFullYear(); [y,y+1].forEach(yy=>{ const t=new Date(yy,d0.getMonth(),d0.getDate(),d0.getHours(),d0.getMinutes()).getTime(), n=yy-d0.getFullYear(); if(n>0) it.push({ts:t,ic:"🎉",t:`出道 ${n} 週年`,k:"紀念日"}); }); } });
  T(()=>(ms.pre||[]).filter(p=>p.gid===gid).forEach(p=>it.push({ts:cbRelAt(p),ic:"💿",t:`《${p.title}》發行`,k:"發行"})));
  T(()=>ms.songs.filter(x=>x.gid===gid).forEach(x=>SHOWS.forEach(sh=>[curWeek(),shiftWeek(curWeek(),1)].forEach(wk=>{ if(songActIn(x,sh.id,wk)) it.push({ts:showEndTs(sh.id,wk)-90*60e3,ic:"📺",t:`${sh.name}《${x.title}》`,k:"放送"}); }))));
  T(()=>vsAll().filter(e=>!String(e.id).startsWith("demo")&&(e.mids||[]).some(m=>mem.has(m))&&e.ts).forEach(e=>it.push({ts:e.ts,ic:"📺",t:`《${VSHOW[e.show].name}》出演`,k:"放送"})));
  T(()=>getTours().filter(t=>t.gid===gid).forEach(t=>(t.stops||[]).forEach(st=>st.startTs&&it.push({ts:st.startTs,ic:"🌍",t:`${t.title}・${st.city||""}`,k:"公演"}))));
  return it.filter(x=>x.ts>=now-D).sort((a,b)=>a.ts-b.ts); }
function openCal(gid){ const g=groupOf(gid), base=new Date(), mo=ui.calMo||0, d0=new Date(base.getFullYear(),base.getMonth()+mo,1), days=new Date(d0.getFullYear(),d0.getMonth()+1,0).getDate(), it=grpSched(gid), sel=ui.calDay||null;
  const on=d=>it.filter(x=>{ const t=new Date(x.ts); return t.getFullYear()===d0.getFullYear()&&t.getMonth()===d0.getMonth()&&t.getDate()===d; });
  const today=new Date(); const list=sel?on(sel):it.slice(0,8);
  setLayer(`<div class="tiei cm-cal" style="--gt:${gTheme(gid)}"><header class="tiei-top"><button class="icon-btn" data-a="tCloseLayer" aria-label="返回">${I.back}</button><b>Calendar</b><span class="sh-sp"></span></header>
    <div class="tiei-body"><div class="cal-h"><button data-a="calMo" data-v="-1" data-g="${gid}">‹</button><b>${d0.getFullYear()}.${pad(d0.getMonth()+1)}</b><button data-a="calMo" data-v="1" data-g="${gid}">›</button></div>
      <div class="cal-g">${["日","一","二","三","四","五","六"].map(x=>`<span class="w">${x}</span>`).join("")}${Array.from({length:d0.getDay()},()=>"<span></span>").join("")}
        ${Array.from({length:days},(_,i)=>{ const d=i+1, n=on(d).length, isT=mo===0&&d===today.getDate(); return `<button class="${isT?"t":""} ${sel===d?"s":""}" data-a="calDay" data-v="${d}" data-g="${gid}">${d}${n?"<i></i>":""}</button>`; }).join("")}</div>
      <h4 class="cal-lh">${sel?`${d0.getMonth()+1}/${sel}`:"接下來的行程"}</h4>
      ${list.length?list.map(x=>`<div class="cal-it"><span>${x.ic}</span><div><small>${esc(x.k)}・${evWhen(x.ts)}</small><b>${esc(x.t)}</b></div></div>`).join(""):`<p class="me-none">${sel?"這一天沒有行程":"最近沒有行程"}</p>`}</div></div>`,"cal"); }
function viewAbout(gid){ const g=groupOf(gid), open=ui.abOpen||null;
  const ph=gPhoto(gid), it=gIntro(gid);
  const sm=g.solo?soloMid(gid):"", AB_IC={sns:'<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r=".9" fill="currentColor"/>',tie:'<path d="M6 5h12a2.6 2.6 0 0 1 2.6 2.6v7.2A2.6 2.6 0 0 1 18 17.4h-6.2L7.4 20.6v-3.2H6a2.6 2.6 0 0 1-2.6-2.6V7.6A2.6 2.6 0 0 1 6 5z"/><path d="M12 13.6s-2.8-1.6-2.8-3.4a1.5 1.5 0 0 1 2.8-.8 1.5 1.5 0 0 1 2.8.8c0 1.8-2.8 3.4-2.8 3.4z"/>',shop:'<path d="M5.6 8.4h12.8l-1.1 11.2a1.6 1.6 0 0 1-1.6 1.4H8.3a1.6 1.6 0 0 1-1.6-1.4z"/><path d="M9 10.6V7.6a3 3 0 0 1 6 0v3"/>'};
  const abl=[["sns",SNS_NAME],["tie",WHISPER_NAME],["shop","SHOP"]].filter(([k])=>k!=="sns"||!sm||!snLockOf(sm)).map(([k,l])=>`<button class="abx-l" data-a="abLink" data-k="${k}" data-g="${gid}" data-m="${sm||""}" aria-label="${l}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${AB_IC[k]}</svg></button>`).join("");
  return `<section class="abx-top"><div class="abx-tl"><h2>${esc(g.name)}</h2><div class="abx-ls">${abl}</div></div><span class="abx-ph" style="background:${grad(g.g)}">${ph?`<span class="g-ph" role="img" aria-label="${esc(g.name)}" style="background-image:url('${ph}')"></span>`:esc(ini(g.name))}</span></section>
    ${it?`<p class="abx-intro">${esc(it)}</p>`:""}${g.solo?"":`<div class="abx-sec">成員 ${grpMembers(gid).length}</div>`}
    ${grpMembers(gid).map(m=>{ const M=MEMBERS[m], o=open===m; return `<section class="card ab-m ${o?"o":""}" id="ab-${m}"><button class="ab-mh" data-a="abTog" data-v="${m}" aria-expanded="${o}"><i style="background:${grad(M.g)}">${teaserIn(m)}</i><b>${esc(M.name)}</b><span class="ab-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span></button>${o?`<button class="ab-pro" data-a="cmMem" data-v="${m}">查看個人簡介</button>`:""}</section>`; }).join("")}`; }
function viewMemberProfile(gid,mid){ setTimeout(apBarSync,0); return `<div class="gcm ap2" style="--gt:${gTheme(gid)}">${artProfileHtml(mid,false)}</div>`; }
function grpFeed(gid){ const ch=ui.cmFeed||"hl", art=getPosts().filter(p=>p.group===gid&&!p.hidden), fans=S.get(K.fanPosts,[]).filter(p=>p.gid===gid).sort((a,b)=>b.ts-a.ts);
  const chips=`<div class="cm-chips">${[["hl","Highlight"],["fan","Fan"],["artist","Artist"]].map(([k,l])=>`<button class="${ch===k?"on":""}" data-a="cmFeed" data-v="${k}">${l}</button>`).join("")}</div>`;
  if(ch==="artist") return chips+(grpArtMix(gid,art)||`<p class="me-none">還沒有藝人貼文</p>`);
  if(ch==="fan") return chips+(fans.length?fans.map(fanCard2).join(""):`<p class="me-none me-center">還沒有粉絲貼文，點右下角 ＋ 發第一篇吧</p>`);
  return chips+`${cmSec("最近藝人貼文")}${grpArtMix(gid,art,2)||`<p class="me-none">還沒有藝人貼文</p>`}
    
    ${cmSec(`${esc(groupOf(gid).name)} 的評論`,fans.length?"查看更多":"","cmFan")}${fans.slice(0,3).map(fanCard2).join("")||`<p class="me-none">還沒有粉絲貼文</p>`}`; }
/* MEET 卡片：正在直播的排前面（點進直播間），結束的是重播 */
function meetCards(lv){ return `<div class="cm-lv">${lv.slice(0,12).map(l=>{const m=MEMBERS[l.member], c=GRADS[m.g%GRADS.length], on=!l.endTs;return `<button class="cm-lc" data-a="${on?"openLive":"openReplay"}" data-id="${l.id}" data-lv="${l.id}"><span class="cm-lt cv-fit ${on?"on":""}" style="${lvCoverFit(l.member,l)}"><em>${on?"● LIVE":"REPLAY"}</em>${on?"":`<i>${mmss(l)}</i>`}</span><b>${esc(l.title)}</b><small>${esc(artName(l.member,"live"))}・${on?"直播中":relDay(l.startTs)}</small></button>`}).join("")}</div>`; }
const meetOf=f=>getLives().filter(l=>MEMBERS[l.member]&&f(l)).sort((a,b)=>(!a.endTs?0:1)-(!b.endTs?0:1)||b.startTs-a.startTs);
function grpMedia(gid){ const ch=ui.cmMed||"all", lv=meetOf(l=>MEMBERS[l.member].group===gid), vd=vodList(gid), g=groupOf(gid), vc=ui.cmVc||"all";
  const ph=promoImgs(gid), phH=ph.length?`${cmSec("照片")}<div class="cp-grid">${ph.map(p=>`<button class="cp-img" data-a="cpPh" data-v="${esc(p.u)}"><img src="${esc(p.u)}" alt="" loading="lazy"><small>${esc(p.t)}</small></button>`).join("")}</div>`:"";
  const chips=`<div class="cm-chips">${[["all","全部"],["live","MEET"],["vod","影音"],...(ph.length?[["photo","照片"]]:[])].map(([k,l])=>`<button class="${ch===k?"on":""}" data-a="cmMed" data-v="${k}">${l}</button>`).join("")}</div>`;
  const lvH=`${cmSec("最新 MEET")}${lv.length?meetCards(lv):`<p class="me-none">還沒有直播紀錄</p>`}`;
  const types=[...new Set(vd.map(v=>v.type))];
  let vdH=`${cmSec("最新影音")}<div class="cm-chips sm">${[["all","全部"],...types.map(t=>[t,t])].map(([k,l])=>`<button class="${vc===k?"on":""}" data-a="cmVc" data-v="${k}">${l}</button>`).join("")}</div>
    <div class="cm-lv">${vd.filter(v=>vc==="all"||v.type===vc).map(v=>`${vodCard(v.v)}`).join("")}</div>
    ${types.map(t=>`${cmSec(t)}<div class="cm-lv">${vd.filter(v=>v.type===t).map(v=>`${vodCard(v.v)}`).join("")}</div>`).join("")}`;
  const secH=vsecHtml(gid,false); if(!vd.length) vdH="";
  const alH=grpAlbums(gid);
  return chips+(ch==="photo"?phH:ch==="live"?lvH:ch==="vod"?alH+secH+vdH:alH+lvH+secH+vdH+phH); }
function grpShop(gid){ const cat=ui.shopCat||"all", L=shopProducts(gid).filter(p=>cat==="all"||p.cat===cat);
  return `<div class="cm-chips">${[["all","全部"],["album","專輯"],["ms","Membership"],["merch","周邊"],["tie",WHISPER_NAME+" 券"]].map(([k,l])=>`<button class="${cat===k?"on":""}" data-a="cmCat" data-v="${k}">${l}</button>`).join("")}</div><div class="wsp-grid">${L.map(prodCard).join("")}</div>`; }

/* ===== SNS：照最新的 Instagram（版面和功能） ===== */
const SI={flag:'<path d="M5.5 21V4.5"/><path d="M5.5 4.5h11l-2.2 4 2.2 4h-11"/>',home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  plus:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>',
  reel:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M3 8.5h18M8 3l3 5.5M14 3l3 5.5"/><path d="m10.5 12 4 2.5-4 2.5z"/>',
  heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
  chat:'<path d="M20.5 11.5a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5 5 16a8.5 8.5 0 1 1 15.5-4.5z"/>',
  send:'<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
  save:'<path d="M6 3h12v18l-6-5-6 5z"/>',
  dots:'<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  grid:'<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
  tag:'<path d="M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/><rect x="2" y="2" width="20" height="20" rx="3"/>',
  back:'<path d="m15 5-7 7 7 7"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  cam:'<path d="M4 8h3.5L9 5.5h6L16.5 8H20v11H4z"/><circle cx="12" cy="13.3" r="3.3"/>',
  music:'<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  chev:'<path d="m6 9 6 6 6-6"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',pen:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  repost:'<path d="M17 2.5 20.5 6 17 9.5"/><path d="M3.5 11V9.5A3.5 3.5 0 0 1 7 6h13.5M7 21.5 3.5 18 7 14.5"/><path d="M20.5 13v1.5A3.5 3.5 0 0 1 17 18H3.5"/>',
  dm:'<path d="M12 3c5 0 9 3.7 9 8.3s-4 8.2-9 8.2c-1 0-2-.1-2.9-.4L4.5 20.5l1.2-3.7C4 15.3 3 13.4 3 11.3 3 6.7 7 3 12 3z"/><path d="m7.5 13.5 3-3.2 2.6 2 3.4-3.6"/>',
  sound:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',mute:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
  plusP:'<path d="M12 5v14M5 12h14"/>',plusL:'<path d="M12 2.5v19M2.5 12h19"/>',heartL:'<path d="M12 20.6s-8.6-5.1-8.6-11.4A4.9 4.9 0 0 1 12 6.4a4.9 4.9 0 0 1 8.6 2.8c0 6.3-8.6 11.4-8.6 11.4z"/>',chevR:'<path d="m9 6 6 6-6 6"/>',play:'<path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/>',stop:'<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',ff:'<path d="M3.5 6v12l8-6zM12.5 6v12l8-6z" fill="currentColor" stroke="none"/>',star:'<path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" fill="currentColor"/>',carousel:'<rect x="7.5" y="3" width="13.5" height="13.5" rx="2.5" fill="currentColor" stroke="none"/><path d="M4.5 7.5v10a2 2 0 0 0 2 2h10" stroke-width="2"/>',note:'<path d="M10 17.5V5.5l9-2v11.5" stroke-width="2"/><circle cx="7.6" cy="17.5" r="2.6" fill="currentColor"/><circle cx="16.6" cy="15" r="2.6" fill="currentColor"/>',check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',trash:'<path d="M4 6.5h16M9.5 6.5V4.5h5v2M6.5 6.5l1 13.5h9l1-13.5"/><path d="M10 10.5v6M14 10.5v6"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',userX:'<circle cx="10" cy="8" r="4"/><path d="M2.5 20.5a7.5 7.5 0 0 1 15 0M17 8.5h5"/>',userP:'<circle cx="10" cy="8" r="4"/><path d="M2.5 20.5a7.5 7.5 0 0 1 15 0M19.5 6v5M17 8.5h5"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.6" r=".4" fill="currentColor"/>',eyeOff:'<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 4.6-1.2"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',link:'<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>',sort:'<path d="M7 4v16M3.5 16.5 7 20l3.5-3.5M17 20V4M13.5 7.5 17 4l3.5 3.5"/>',reels2:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="m10.5 9 5 3-5 3z"/>'};
Object.assign(SI,{more2:'<path d="M4 9.5h16M8 14.5h12"/>',gridD:'<g fill="currentColor" stroke="none">'+[4,10.5,17].flatMap(y=>[4,10.5,17].map(x=>`<rect x="${x-1.6}" y="${y-1.6}" width="5.2" height="5.2" rx="1.3"/>`)).join('')+'</g>',mic:'<rect x="9" y="3" width="6" height="11.5" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',img:'<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="9" cy="9.2" r="1.7"/><path d="m20.5 15-4.6-4.6L7 19.5"/>',stk:'<path d="M20.5 12.5V8a4.5 4.5 0 0 0-4.5-4.5H8A4.5 4.5 0 0 0 3.5 8v8A4.5 4.5 0 0 0 8 20.5h4.5a8 8 0 0 0 8-8z"/><path d="M12.5 20.5v-3.5a4.5 4.5 0 0 1 4.5-4.5h3.5"/><path d="M8.6 13.6a3.6 3.6 0 0 0 4.4.6"/><circle cx="9" cy="9.5" r=".9"/><circle cx="14.5" cy="9.5" r=".9"/>',plusC:'<circle cx="12" cy="12" r="8.6"/><path d="M12 8v8M8 12h8"/>',phone:'<path d="M5.5 3.8h3l1.6 4.2-2.2 1.5a11.5 11.5 0 0 0 6.6 6.6l1.5-2.2 4.2 1.6v3a1.9 1.9 0 0 1-2 1.9A16.6 16.6 0 0 1 3.6 5.8a1.9 1.9 0 0 1 1.9-2z"/>',vcam:'<rect x="2.8" y="6" width="13" height="12" rx="3"/><path d="m15.8 10.3 5.4-3.1v9.6l-5.4-3.1z"/>',compose:'<path d="M12 3.5H6.5a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h11a3 3 0 0 0 3-3V12"/><path d="M18.4 3.6a1.9 1.9 0 0 1 2.7 2.7L12.8 14.6l-3.4.7.7-3.4z"/>',arrowUp:'<path d="M12 19V5M6 11l6-6 6 6"/>'});
const si=(k,cls="")=>`<svg class="si ${cls}" viewBox="0 0 24 24" aria-hidden="true">${SI[k]||""}</svg>`;
const SNS_NAME="SNS";
const SN_VER='<i class="sn-v"><svg viewBox="0 0 40 40" aria-label="已驗證"><path fill="#0095F6" d="M20.00 1.50 L20.48 1.53 L20.96 1.64 L21.43 1.80 L21.89 2.03 L22.33 2.30 L22.75 2.61 L23.16 2.95 L23.55 3.30 L23.92 3.65 L24.29 4.00 L24.64 4.33 L25.00 4.63 L25.35 4.89 L25.71 5.11 L26.09 5.29 L26.49 5.43 L26.90 5.53 L27.34 5.60 L27.80 5.64 L28.28 5.66 L28.78 5.67 L29.30 5.68 L29.82 5.71 L30.35 5.75 L30.87 5.83 L31.37 5.95 L31.85 6.12 L32.30 6.33 L32.72 6.60 L33.08 6.92 L33.40 7.28 L33.67 7.70 L33.88 8.15 L34.05 8.63 L34.17 9.13 L34.25 9.65 L34.29 10.18 L34.32 10.70 L34.33 11.22 L34.34 11.72 L34.36 12.20 L34.40 12.66 L34.47 13.10 L34.57 13.51 L34.71 13.91 L34.89 14.29 L35.11 14.65 L35.37 15.00 L35.67 15.36 L36.00 15.71 L36.35 16.08 L36.70 16.45 L37.05 16.84 L37.39 17.25 L37.70 17.67 L37.97 18.11 L38.20 18.57 L38.36 19.04 L38.47 19.52 L38.50 20.00 L38.47 20.48 L38.36 20.96 L38.20 21.43 L37.97 21.89 L37.70 22.33 L37.39 22.75 L37.05 23.16 L36.70 23.55 L36.35 23.92 L36.00 24.29 L35.67 24.64 L35.37 25.00 L35.11 25.35 L34.89 25.71 L34.71 26.09 L34.57 26.49 L34.47 26.90 L34.40 27.34 L34.36 27.80 L34.34 28.28 L34.33 28.78 L34.32 29.30 L34.29 29.82 L34.25 30.35 L34.17 30.87 L34.05 31.37 L33.88 31.85 L33.67 32.30 L33.40 32.72 L33.08 33.08 L32.72 33.40 L32.30 33.67 L31.85 33.88 L31.37 34.05 L30.87 34.17 L30.35 34.25 L29.82 34.29 L29.30 34.32 L28.78 34.33 L28.28 34.34 L27.80 34.36 L27.34 34.40 L26.90 34.47 L26.49 34.57 L26.09 34.71 L25.71 34.89 L25.35 35.11 L25.00 35.37 L24.64 35.67 L24.29 36.00 L23.92 36.35 L23.55 36.70 L23.16 37.05 L22.75 37.39 L22.33 37.70 L21.89 37.97 L21.43 38.20 L20.96 38.36 L20.48 38.47 L20.00 38.50 L19.52 38.47 L19.04 38.36 L18.57 38.20 L18.11 37.97 L17.67 37.70 L17.25 37.39 L16.84 37.05 L16.45 36.70 L16.08 36.35 L15.71 36.00 L15.36 35.67 L15.00 35.37 L14.65 35.11 L14.29 34.89 L13.91 34.71 L13.51 34.57 L13.10 34.47 L12.66 34.40 L12.20 34.36 L11.72 34.34 L11.22 34.33 L10.70 34.32 L10.18 34.29 L9.65 34.25 L9.13 34.17 L8.63 34.05 L8.15 33.88 L7.70 33.67 L7.28 33.40 L6.92 33.08 L6.60 32.72 L6.33 32.30 L6.12 31.85 L5.95 31.37 L5.83 30.87 L5.75 30.35 L5.71 29.82 L5.68 29.30 L5.67 28.78 L5.66 28.28 L5.64 27.80 L5.60 27.34 L5.53 26.90 L5.43 26.49 L5.29 26.09 L5.11 25.71 L4.89 25.35 L4.63 25.00 L4.33 24.64 L4.00 24.29 L3.65 23.92 L3.30 23.55 L2.95 23.16 L2.61 22.75 L2.30 22.33 L2.03 21.89 L1.80 21.43 L1.64 20.96 L1.53 20.48 L1.50 20.00 L1.53 19.52 L1.64 19.04 L1.80 18.57 L2.03 18.11 L2.30 17.67 L2.61 17.25 L2.95 16.84 L3.30 16.45 L3.65 16.08 L4.00 15.71 L4.33 15.36 L4.63 15.00 L4.89 14.65 L5.11 14.29 L5.29 13.91 L5.43 13.51 L5.53 13.10 L5.60 12.66 L5.64 12.20 L5.66 11.72 L5.67 11.22 L5.68 10.70 L5.71 10.18 L5.75 9.65 L5.83 9.13 L5.95 8.63 L6.12 8.15 L6.33 7.70 L6.60 7.28 L6.92 6.92 L7.28 6.60 L7.70 6.33 L8.15 6.12 L8.63 5.95 L9.13 5.83 L9.65 5.75 L10.18 5.71 L10.70 5.68 L11.22 5.67 L11.72 5.66 L12.20 5.64 L12.66 5.60 L13.10 5.53 L13.51 5.43 L13.91 5.29 L14.29 5.11 L14.65 4.89 L15.00 4.63 L15.36 4.33 L15.71 4.00 L16.08 3.65 L16.45 3.30 L16.84 2.95 L17.25 2.61 L17.67 2.30 L18.11 2.03 L18.57 1.80 L19.04 1.64 L19.52 1.53 L20.00 1.50Z"/><path d="M12.5 20.5l5 5 10-10.5" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg></i>';
const snsAgo=ts=>{ const m=Math.floor((Date.now()-ts)/60000); return m<60?`${Math.max(1,m)} 分鐘前`:m<1440?`${Math.floor(m/60)} 小時前`:`${Math.floor(m/1440)} 天前`; };
/* ---------- 粉絲：主畫面 ---------- */
function fanHeader(withTabs,sk=null,ph=""){
  return `<header class="top sh-head"><div class="top-row">
    ${sk&&srchOn(sk)?srchBar(ph):`${sk&&!(withTabs&&ui.feedTab==="discover")?srchBtn(sk):'<span class="sh-sp"></span>'}
    <div class="logo center">${APP_NAME}</div>
    <button class="icon-btn" data-a="openNotifs" aria-label="通知${hasUnread()?"（有新通知）":""}">${I.bell}${hasUnread()?'<span class="dot"></span>':""}</button>`}
  </div>
  ${withTabs?`<nav class="subtabs">${[["feed","動態"],["discover","探索"],["live","直播"]].map(([k,l])=>`<button class="subtab ${ui.feedTab===k?"on":""}" data-a="ft" data-v="${k}">${l}</button>`).join("")}</nav>`:""}
  </header>`;
}
function meSecBody(k,f){
  if(k==="ms") return `<section class="card me-list">${f.filter(gid=>isMember(gid)||msGrace(gid)).map(gid=>{const g=groupOf(gid), on=isMember(gid), gr=msGrace(gid);return `<button class="me-row" data-a="meShop" data-v="ms"><span class="me-ic" style="background:${grad(g.g)}">💎</span><span class="me-t"><b>${esc(g.name)}</b><small class="${on?"on":gr?"grace":""}">${on?`會員中・剩餘 ${msLeft(gid)} 天`:gr?"已到期・24 小時內續訂可保留資歷":"還不是會員"}</small></span><i>›</i></button>`}).join("")||`<p class="me-none">還沒有加入 Membership，到 SHOP 看看</p>`}</section>`;
  if(k==="tie") return tvRows()+`${tvLive().length?`<div class="section-h">${WHISPER_NAME} 券</div>`:""}<section class="card me-list">${Object.keys(subs()).filter(id=>MEMBERS[id]).map(id=>{const m=MEMBERS[id], st=passStatus(id);return `<button class="me-row" data-a="openChat" data-m="${id}"><span class="me-ic" style="background:${grad(m.g)};overflow:hidden">${mAvIn(id)}</span><span class="me-t"><b>${esc(artName(id,"tie"))}</b><small class="${st.cls==="on"?"on":st.cls==="grace"?"grace":""}">${st.txt}・💜 +${subDays(id)} 天</small></span><i>›</i></button>${isActive(id)&&grpMembers(m.group).filter(x=>!MEMBERS[x].official).length>1?`<button class="me-sub" data-a="tPickGo" data-m="${id}">變更藝人 ›</button>`:""}`}).join("")||`<p class="me-none">還沒有 ${WHISPER_NAME} 券，到 SHOP 選一位成員吧</p>`}</section>`;
  if(k==="merch") return `<section class="card me-list">${(()=>{const o=S.get(K.owned,{}), rows=[];Object.keys(o).forEach(gid=>MERCH.forEach(it=>{ if(o[gid][it.k]&&groupOf(gid)) rows.push(`<div class="me-row"><span class="me-ic" style="background:${grad(groupOf(gid).g)}">${it.ic}</span><span class="me-t"><b>${esc(groupOf(gid).name)}・${it.name}</b><small>${ymd(o[gid][it.k])} 購買</small></span></div>`); }));return rows.join("")||`<p class="me-none">還沒有周邊，到 SHOP 的「周邊」看看</p>`})()}</section>`;
  return `<section class="card me-list">${S.get(K.sales,[]).filter(x=>x.buyer===myEmail()).slice(0,40).map(x=>`<div class="me-row"><span class="me-t"><b>${esc(saleLbl(x))}</b><small>${ago(x.ts)}</small></span><em class="me-pts">−${fmt(x.pts)}</em></div>`).join("")||`<p class="me-none">還沒有購買紀錄</p>`}</section>`;
}
function viewFan(tab){
  if(tab==="home"){
    const fa=followed(), f=scopeF(); let body=""; const q=srchQ("love"); if(ui.feedTab!=="discover"&&ui.feedTab!=="live") ui.feedTab="feed"; if(ui.feedTab==="live") return viewFanLive();
    if(ui.feedTab==="feed"){
      const posts=getPosts().filter(p=>fa.includes(p.group)&&MEMBERS[p.member]&&!p.hidden&&postHit(q,p)), ofs=q?[]:coPosts().filter(x=>x.src&&fa.includes(x.src.gid)&&groupOf(x.src.gid)&&albThumb(x));
      body=(q?"":myFeedTop())+(q?"":coPinFeed())+(q?"":`<h2 class="mf-h">藝人動態</h2>`)+
        srchLabel("love")+(posts.length||ofs.length?ofMix(posts,ofs):q?srchEmpty("動態"):(followed().length?emptyBox(I.star,"還沒有動態","你追蹤的藝人發文後會出現在這裡"):emptyBox(I.star,"還沒有加入社群","到「探索」找喜歡的藝人，加入他們的社群吧",`<button class="btn btn-main" data-a="ft" data-v="discover">去探索</button>`)));
    } else if(ui.feedTab==="discover"){
      const posts=getPosts().filter(p=>!fa.includes(p.group)&&!p.hidden&&postHit(q,p)&&groupOf(p.group));
      body=(q?"":exploreTop())+`<h2 class="mf-h">你可能也會喜歡</h2>`+srchLabel("love")+(posts.length?posts.map(p=>postCard(p)+`<button class="ex-join" data-a="gJoin" data-v="${p.group}">＋ 加入${esc(groupOf(p.group).name)}</button>`).join(""):q?srchEmpty("動態"):emptyBox(I.star,"你已經加入所有社群了","目前沒有其他社群可以推薦"));
    } else {
      const kind=ui.feedTab==="party"?"party":"spot";
      const evs=getEvents().filter(e=>e.kind===kind&&f.includes(e.group)&&evHit(q,e));
      const up=evs.filter(e=>e.ts>=Date.now()), past=evs.filter(e=>e.ts<Date.now()).reverse();
      body=`<div class="section-h">${kind==="party"?"線上活動":"實體活動"}<span class="muted">${kind==="party"?"試聽派對、線上見面會":"演唱會、簽名會、快閃店"}</span></div>`+
        srchLabel("love")+(up.length?up.map(e=>eventCard(e)).join(""):q&&!past.length?srchEmpty("活動"):emptyBox(kind==="party"?I.live:I.star,"目前沒有活動","你追蹤的藝人公布活動時，會出現在這裡"))+
        (past.length?`<div class="section-h">已結束</div>`+past.map(e=>eventCard(e)).join(""):"");
    }
    return fanHeader(true,"love","搜尋動態內容或藝人名稱...")+`<main class="page">${body}</main>`;
  }
  if(tab==="me"){
    const f=followed();
    if(ui.meSec){ const T={ms:"我的會員",tie:`我的 ${WHISPER_NAME} 券`,merch:"我的周邊",buy:"購買紀錄"};
      return `<header class="top core-top"><div class="top-row"><button class="icon-btn" data-a="meSecBack" aria-label="返回">${I.back}</button><div class="top-title">${T[ui.meSec]||""}</div><span class="sh-sp"></span></div></header><main class="page">${meSecBody(ui.meSec,f)}</main>`; }
    return fanHeader(false)+`<main class="page">
      <section class="card me-card">
        <div class="av lg" style="margin:0 auto;background:${grad(3)}">${esc((ME.name||"棉")[0])}</div>
        <button class="me-nm" data-a="meNickEd" aria-label="修改名稱"><h2>${esc(ME.name)}</h2>${UI_S.pen}</button><span class="muted" style="font-size:13px">粉絲帳號</span>${lvLine()}
        ${(()=>{const rc=S.get(K.repCard,""), it=rc.startsWith("it|"), m=rc&&(it?parseIt(rc):MEMBERS[rc.split(":")[0]]); return rc&&m&&getCards()[rc]?`<button class="me-rep" data-a="cardView" data-v="${rc}"><span class="me-rep-c">${cardFace(rc)}</span><span><small>我的代表卡</small><b>${esc(it?itemName(rc):m.name)}</b></span><i>›</i></button>`:""})()}
      </section>
      ${secH("star","我的")}
      <div class="me-grid">${[["ms","gem","會員",`${f.filter(isMember).length} 個`],["tie","tie",`${WHISPER_NAME} 券`,`${Object.keys(subs()).filter(isActive).length} 張運行中`],["merch","bag","周邊",`${(()=>{const o=S.get(K.owned,{});return Object.keys(o).reduce((n,g)=>n+Object.keys(o[g]||{}).length,0)})()} 件`],
        ["cards","card","小卡",(()=>{const c=alCount();return c.have+" / "+c.total})()],["signed","album","簽名專輯",`${S.get(K.signedAlbums,[]).length} 張`],["buy","receipt","購買紀錄",`${S.get(K.sales,[]).filter(x=>x.buyer===myEmail()).length} 筆`]]
        .map(([k,ic,n,sub])=>`<button class="me-g" data-a="${k==="cards"?"openCards":k==="signed"?"openSigned":"meSec"}" data-v="${k}">${hi(ic)}<b>${n}</b><small>${sub}</small></button>`).join("")}</div>
      ${!isAdminAcct()&&canSwap()?`<div class="section-h">身分</div><section class="card"><button class="list-btn" data-a="swapRole">${I.swap}切換到藝人端（${esc(MEMBERS[session().home]?MEMBERS[session().home].name:"")}）</button></section>`:""}
      ${debutRow()}
      ${secH("gear","設定")}
      <section class="card">
        <button class="list-btn" data-a="settings">${I.bell}通知設定</button>
        ${sbxWho()?`<button class="list-btn" data-a="sbxT">${I.star}試玩模式<span class="r">${sbxOn()?"試玩中":"關閉"}</span></button>`:""}
        <button class="list-btn" data-a="acctInfo">${I.user}帳號設定<span class="r">${esc((session()||{}).email||"")}</span></button>
        
        <button class="list-btn" data-a="theme">${I.gear}外觀<span class="r">${themeLabel()}</span></button>
        <button class="list-btn" data-a="coachAgain">${I.star}重看教學</button>
        <button class="list-btn" data-a="a2h">${I.home}加到主畫面<span class="r">iPhone</span></button>
        <button class="list-btn danger" data-a="logout">${I.out}登出</button>
      </section>
      ${isAdminAcct()&&!isUni()?`<div class="section-h">管理員工具<span class="muted">只有管理員帳號看得到</span></div>
      <section class="card">
        <button class="list-btn" data-a="swapRole">${I.swap}切換到藝人端（露娜）<span class="r">測試連動</span></button>
        <button class="list-btn" data-a="toAdmin">${I.swap}回到管理員端</button>
        <button class="list-btn" data-a="reset">${I.gear}重設示範資料</button>
      </section>`:""}
    </main>`;
  }
  if(tab==="whisper") return viewTieList();
  if(tab==="shop") return viewShop();
  if(tab==="core") return viewCore();
  if(tab==="live"){ ui.feedTab="live"; return viewFanLive(); }
  const map={shop:[I.shop,"",""]};
  const [ic,t,d]=map[tab]||map.shop;
  return fanHeader(false)+`<main class="page">${emptyBox(ic,t,d,`<button class="btn btn-soft" data-a="tab" data-v="home">回首頁</button>`)}</main>`;
}
const NAVP={};
function navBar(items,active,badges={}){
  const r=(session()||{}).role||"x", i=Math.max(0,items.findIndex(x=>x[0]===active)), f=NAVP[r]; NAVP[r]=i;
  const go=f!=null&&f!==i;
  return `<nav class="nav" aria-label="主選單"><div class="nav-in" style="--n:${items.length}"><span class="nav-lens ${go?"go":""}" style="--i:${i};--f:${go?f:i}" aria-hidden="true"></span>${items.map(([k,l,ic])=>`
    <button class="nav-btn ${active===k?"on":""}" data-a="tab" data-v="${k}" ${active===k?'aria-current="page"':""}><span class="nav-ico">${thIcon(k)||ic}${badges[k]==="dot"?`<span class="ndot" aria-label="直播中"></span>`:badges[k]==="moon"?`<span class="nmoon" aria-label="有未讀">${MOON}</span>`:badges[k]?`<span class="nbadge">${badges[k]>99?"99+":badges[k]}</span>`:""}</span>${l}</button>`).join("")}</div></nav>`;
}
/* 導覽列圖標：細線「小飾品」系列（墜飾愛心、票根、蝴蝶結、鑽石、皇冠） */
const NS='fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
const NAV={
  love:`<svg viewBox="0 0 24 24" ${NS}><path d="M12 20s-6.8-4.2-6.8-9.2A3.8 3.8 0 0 1 12 8.6a3.8 3.8 0 0 1 6.8 2.2c0 5-6.8 9.2-6.8 9.2z"/><circle cx="12" cy="4.4" r="1.5"/><path d="M12 5.9v2.7"/><path d="M8.4 11.4a2.1 2.1 0 0 1 1.5-1.7"/></svg>`,
  meet:`<svg viewBox="0 0 24 24" ${NS}><path d="M4.6 6.8h14.8a1.1 1.1 0 0 1 1.1 1.1v2.6a1.6 1.6 0 0 0 0 3.1v2.6a1.1 1.1 0 0 1-1.1 1.1H4.6a1.1 1.1 0 0 1-1.1-1.1v-2.6a1.6 1.6 0 0 0 0-3.1V7.9a1.1 1.1 0 0 1 1.1-1.1z"/><path d="M15.4 8.6v.9M15.4 11.6v.9M15.4 14.6v.9"/><path d="M9.6 14.4s-2.4-1.4-2.4-2.9a1.2 1.2 0 0 1 2.4-.4 1.2 1.2 0 0 1 2.4.4c0 1.5-2.4 2.9-2.4 2.9z"/></svg>`,
  tie:`<svg viewBox="0 0 24 24" ${NS}><path d="M12 10.8C10.2 7.6 6.4 5.9 4.8 7.3s-.4 5.6 2.4 5.8c2 .1 3.6-.9 4.8-2.3z"/><path d="M12 10.8c1.8-3.2 5.6-4.9 7.2-3.5s.4 5.6-2.4 5.8c-2 .1-3.6-.9-4.8-2.3z"/><circle cx="12" cy="11.2" r="1.4"/><path d="M11.1 12.5 8.6 18.6M12.9 12.5l2.5 6.1"/></svg>`,
  core:`<svg viewBox="0 0 24 24" ${NS}><path d="M9.4 17.4V6.6l9-2.2v10.4"/><path d="M9.4 9.6l9-2.2"/><ellipse cx="7.2" cy="17.6" rx="2.3" ry="1.9"/><ellipse cx="16.2" cy="15" rx="2.3" ry="1.9"/><path d="M4.6 4.2c.15 1 .55 1.4 1.5 1.5-.95.15-1.35.55-1.5 1.5-.15-.95-.55-1.35-1.5-1.5.95-.1 1.35-.5 1.5-1.5z"/></svg>`,
  sns:`<svg viewBox="0 0 24 24" ${NS}><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.6" cy="7.4" r=".6"/></svg>`,
  shop:`<svg viewBox="0 0 24 24" ${NS}><path d="M7.2 4.6h9.6L20.4 9 12 19.8 3.6 9z"/><path d="M3.6 9h16.8M9.8 4.6 8.4 9 12 19.8 15.6 9l-1.4-4.4"/></svg>`,
  me:`<svg viewBox="0 0 24 24" ${NS}><path d="M5 17.4 4 8.2l4.4 3.4L12 5.6l3.6 6 4.4-3.4-1 9.2z"/><path d="M5.2 20.2h13.6"/><circle cx="12" cy="3.4" r=".6" fill="currentColor"/></svg>`,
};
const fanNav=a=>navBar([["home","LOVE",NAV.love],["whisper",WHISPER_NAME,NAV.tie],["core","FEST",NAV.core],["sns","SNS",NAV.sns],["shop","SHOP",NAV.shop],["me","ME",NAV.me]],a,{whisper:fanWhisperUnread()?"moon":0});
NAV.foc=`<svg viewBox="0 0 24 24" ${NS}><path d="M7 4h5l-.6 5.2a3.5 3.5 0 0 1-7 0L4 4h3z"/><path d="M7.9 12.4V16c0 .8-.4 1.4-1.1 1.8L6 18.4h4M17 4h3l-.4 5.2a3.5 3.5 0 0 1-7 0L12 4h5z"/><path d="M16.1 12.4V16c0 .8.4 1.4 1.1 1.8l.8.6h-4"/><path d="M12 1.6v1.4"/></svg>`;
const artistNav=a=>navBar([["home","LOVE",NAV.love],["live","MEET",NAV.meet],["whisper",WHISPER_NAME,NAV.tie],["foc","FOC",NAV.foc],["sns","SNS",NAV.sns],["me","ME",NAV.me]],a,{whisper:artistWhisperUnread(session().member),live:liveNow(session().member)||liveGuestOf(session().member)||coInvites(session().member).length?"dot":0});

/* ---------- 粉絲：通知頁 ---------- */
const NK={tour:["TOUR","#10B981"],news:["NEWS","#0EA5E9"],core:["FEST","#F472B6"],post:["POST","#C7AEFF"],comment:["COMMENT","#93C5FD"],live:["LIVE","#FB7185"],whisper:[WHISPER_NAME,"#8843FB"],event:["EVENT","#F59E0B"]};
function notifMsg(n){
  if(n.self) return n.text;
  const m=MEMBERS[n.member], nm=m?artName(n.member,n.kind==="live"?"live":n.kind==="whisper"?"tie":"feed"):"";
  if(n.kind==="core") return (nm?nm+" ":"")+n.text;
  if(n.kind==="news") return "📰 "+n.text;
  if(n.kind==="tour") return `✈️ ${nm}：${n.text}`;
  if(n.kind==="bday") return `🎂 今天是 ${nm} 的生日。留下生日祝福吧！`;
  if(n.kind==="acomment"){ const hm=MEMBERS[n.host]?artName(n.host,"feed"):nm; return `💬 ${nm}在 ${hm} 的貼文中發表了留言：${n.text}`; }
  if(n.kind==="live"&&n.guest){ const gn=MEMBERS[n.guest]?artName(n.guest,"live"):""; return `🔴 ${gn}已參與${nm}的直播：${n.text}`; }
  return {post:`📝 ${nm}發表了貼文：${n.text}`,comment:`💬 ${nm}回覆了你的留言：${n.text}`,live:n.liveReply?`💬 ${nm}${n.text}`:`🔴 ${nm}已開始直播：${n.text}`,whisper:`${nm} 傳了 ${WHISPER_NAME} 給你：${String(n.text||"").split(NICK_TK).join(nickFor(n.member)).split("{愛稱}").join(nickFor(n.member))}`,event:`${nm} 公布了新活動：${n.text}`}[n.kind]||n.text;
}
/* 出道／回歸預告：出道日、回歸日一到就從置頂公告和 FEST 橫幅拿掉（管理員的公告紀錄還在） */
function annPre(a){ const t=String(a.text||""); if(a.pre==="db"||/出道預告｜/.test(t)){ const x=getDebut().find(y=>(a.ref&&y.id===a.ref)||y.annId===a.id)||getDebut().find(y=>t.includes(`「${y.name}」`)); return {k:"db",day:x&&x.status==="pre"?x.day:0,rel:x&&x.status==="pre"?dbRelAt(x):0}; }
  if(a.pre==="cb"||/回歸預告｜/.test(t)){ const P=getMShow().pre||[], p=P.find(y=>y.id===a.ref)||P.find(y=>t.includes(`《${y.title}》`)); return {k:"cb",day:p?p.day:0,rel:p?cbRelAt(p):0}; } return null; }
const annOn=p=>{ const r=p.rel||p.day; return r>Date.now()&&p.day-Date.now()<=7*864e5; };   /* 出道／回歸前 7 天內才看得到 */
const annLive=()=>getAnns().filter(a=>{ const p=annPre(a); return !p||annOn(p); });
const preAnns=()=>getAnns().map(a=>({a,p:annPre(a)})).filter(x=>x.p&&annOn(x.p)).sort((x,y)=>x.p.day-y.p.day);
function preBanner(){ const L=preAnns(); if(!L.length) return ""; return `<div class="pre-bn">${L.map(({a,p})=>`<button data-a="preAnn" data-id="${a.id}">${a.img?`<span class="pre-bi" style="background-image:url('${esc(a.img)}')"></span>`:""}<b>📢 即將${p.k==="db"?"出道":"回歸"}</b><span>${esc(String(a.text).replace(/^\S+\s*(出道|回歸)預告｜/,""))}</span><em>D-${dLeft(p.day)}</em></button>`).join("")}</div>`; }
/* 置頂大卡：左右滑換一則（每張一樣高），下面的點點跟著滑；每 5 秒自動換下一則 */
function pinnedHtml(){
  const PH=S.get(PIN_HIDE,{})||{}, anns=[...annLive(),...coPinList().filter(x=>!PH[x.id]).sort((a,b)=>b.ts-a.ts)]; if(!anns.length) return "";   /* HAECHU 平台公告永遠排最前面，公司官方貼文接在後面 */
  const N=anns.length;
  return `<div id="pinWrap" class="pin-w"><span class="nz-pill">📌 平台重要置頂公告</span>
    <div class="pin-trk" id="pinTrk">${anns.map((a,i)=>`<div class="pin-card"><div class="pin-top"><span><i class="pin-dot"></i>NOTICE 公告（${i+1}/${N}）</span><i class="pin-ping"></i></div>
      ${a.img?`<span class="pin-img" style="background-image:url('${esc(a.img)}')"></span>`:""}<p>${typeof capRich==="function"?capRich(a.text):esc(a.text)}</p><div class="pin-foot"><span>${ago(a.ts)}</span></div></div>`).join("")}</div>
    ${N>1?`<div class="pin-dots">${anns.map((_,k)=>`<i class="${k===0?"on":""}"></i>`).join("")}</div>`:""}
    <div class="nz-div"></div></div>`;
}
const pinStep=t=>{ const c=t.children; return c.length>1?c[1].offsetLeft-c[0].offsetLeft:Math.max(1,t.clientWidth); };   /* 一張卡＋間距 */
const pinIdxNow=t=>Math.round(t.scrollLeft/pinStep(t));
function refreshPin(){ const t=document.getElementById("pinTrk"); if(!t) return; const n=t.children.length; if(n<2) return; const i=(pinIdxNow(t)+1)%n; t.scrollTo({left:i*pinStep(t),behavior:"smooth"}); }
let pinTouchT=0; document.addEventListener("touchstart",e=>{ if(e.target.closest&&e.target.closest("#pinTrk")) pinTouchT=Date.now(); },{passive:true});
document.addEventListener("scroll",e=>{ const t=e.target; if(!t||t.id!=="pinTrk") return; const i=pinIdxNow(t); t.parentNode.querySelectorAll(".pin-dots i").forEach((d,j)=>d.classList.toggle("on",i===j)); },true);
setInterval(()=>{ if(document.hidden||Date.now()-pinTouchT<8000) return; if(route().sub==="notifications"||document.querySelector(".artn-pin")) refreshPin(); },5000);
/* 點一則通知要去哪裡（通知頁、手機推播點進來都用這個，去的地方一樣） */
function nfAttrs(n){ const act=n.kind==="tour"?"openTour":n.kind==="news"?"openNews":n.kind==="core"?"goCore":n.kind==="whisper"?"openChat":n.kind==="live"?"openLive":n.kind==="event"?"openEvent":"openPost";
  return `data-a="${n.kind==="bday"?"gOpen":act}" data-v="${n.kind==="bday"?esc(n.group||""):""}" data-ek="${esc(n.evKind||"")}" data-ev="${esc(n.eventId||"")}" data-lv="${esc(n.liveId||"")}" data-m="${esc(n.member||"")}" data-id="${esc(n.postId||n.newsId||n.tourId||"")}" data-c="${esc(n.commentId||"")}"`; }
function viewNotifs(){
  const f=followed();
  const all=getNotifications().filter(n=>n.kind!=="system"&&(n.direct||f.includes(n.group)));
  const list=ui.notifFilter==="all"?all:all.filter(n=>n.group===ui.notifFilter);
  const groups=f.map(groupOf).filter(Boolean);
  const card=n=>{const [lab,col]=NK[n.kind]||["NEWS","#D1D5DB"];
    const m=MEMBERS[n.member], g=groupOf(n.group||(m&&m.group)), p0=n.postId&&getPosts().find(x=>x.id===n.postId), th=p0&&!postLocked(p0)&&(p0.media||[])[0];   /* 私密／Membership 沒解鎖：通知不露照片 */
    const vf=`<span class="nz-vf">${I.verified}</span>`, nm=m?esc(artName(n.member,n.kind==="live"?"live":n.kind==="whisper"?"tie":"feed")):"";
    let tx=esc(notifMsg(n)); if(nm) tx=tx.split(nm).join(nm+vf);
    return `<button class="nz-card nz2 ${n.self?"self":""}" ${nfAttrs(n)}>
      <span class="nz-av" style="background:${m?grad(m.g):"var(--s3)"}">${m?mAvIn(n.member):`<b>H</b>`}</span>
      <span class="nz-tx"><p>${tx}</p><small>${esc(g?g.name:APP_NAME)} · ${ymdhm(n.ts)}</small></span>
      ${th?`<span class="nz-th"><img data-mid="${esc(th.kind==="video"?th.thumb||"":th.mid)}" alt=""></span>`:""}</button>`};
  return `<header class="top"><div class="top-row">
      <button class="icon-btn" data-a="back" aria-label="返回">${I.back}</button>
      <div class="top-title">通知</div>
      <button class="icon-btn" data-a="settings" aria-label="通知設定">${I.gear}</button></div></header>
    <main class="page">
      <div class="chips">
        <button class="chip ${ui.notifFilter==="all"?"on":""}" data-a="nf" data-v="all">全部</button>
        ${groups.map(g=>`<button class="chip ${ui.notifFilter===g.id?"on":""}" data-a="nf" data-v="${g.id}">${g.name}</button>`).join("")}
      </div>
      ${pinnedHtml()}
      ${HB_ON&&ui.pushChk&&!ui.pushOn&&!(typeof pushSupported==="function"&&pushSupported()&&Notification.permission==="granted")?`<button class="btn btn-soft btn-block" style="margin:0 0 12px" data-a="pushToggle">開啟手機通知</button>`:""}
      <span class="nz-pill soft">一般粉絲專屬動態</span>
      ${list.length?`<div class="nz-list">${list.map(card).join("")}</div>`:`<p class="nz-empty">尚無一般互動訊息 🔮</p>`}
      ${list.length?`<div class="nz-foot"><button data-a="notifClear">清除所有通知</button></div>`:""}
    </main>`;
}
function openSettings(){
  const s=getSettings();
  const row=(k,t,d)=>`<div class="row"><div class="lbl"><b>${t}</b><span>${d}</span></div><button class="sw" role="switch" aria-checked="${s[k]}" aria-label="${t}" data-a="toggleSet" data-k="${k}"></button></div>`;
  setLayer(`<div class="scrim" data-a="closeLayer"><div class="sheet" role="dialog" aria-label="通知設定">
    <div class="grab"></div><h3>通知設定</h3><p>關掉的類型不會再通知你</p>
    ${HB_ON?`<div class="row"><div class="lbl"><b>手機通知</b><span>像 App 一樣在手機上跳通知</span></div><button class="sw" role="switch" aria-checked="${!!ui.pushOn}" aria-label="手機通知" data-a="pushToggle"></button></div>`:""}
    ${row("post","新貼文","追蹤的藝人發文時")}
    ${row("comment","留言回覆","藝人回覆你的留言時")}
    ${row("whisper",WHISPER_NAME+" 訊息","你訂閱的成員傳 "+WHISPER_NAME+" 訊息時")}
    ${row("live","直播開始","追蹤的藝人開播時")}
    ${row("event","新活動","追蹤的藝人公布 Party、Spot 活動時")}
    <button class="btn btn-soft btn-block" style="margin-top:14px" data-a="closeLayer">完成</button>
  </div></div>`,"nset");
}

/* ---------- 藝人端 ---------- */
function viewArtist(tab){
  const s=session(), mid=s.member, m=MEMBERS[mid], g=groupOf(m.group);
  const sc=getSched();
  const head=tab==="foc"?`<header class="top"><div class="top-row"><span class="sh-sp"></span><div class="foc-title"><b>FOC</b><small>本週：${esc(sc.stage)}</small></div><button class="icon-btn" data-a="focInfo" aria-label="資訊面板"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4.5M12 8h.01"/></svg></button></div></header>`
    :`<header class="top"><div class="top-row"><div class="logo">${APP_NAME}<small>藝人端</small></div><div class="spacer"></div><span class="art-sub">本週：${esc(sc.stage)}</span><button class="icon-btn art-bell" data-a="artNotifs" aria-label="通知">${I.bell}${artNUnread(mid)?'<span class="dot"></span>':""}</button></div></header>`;
  if(isUni()){
    if(tab==="points"){ const pm=route().id&&MEMBERS[route().id]?route().id:mid; return uniHead(pm===mid?"我的積分收入":esc(artName(pm,"feed"))+" 的積分")+viewPointsOne(pm); } }
  if(tab==="points") return head+viewPointsOne(mid);
  if(tab==="foc"){ const fp=route().p; return FOC_PAGES[fp]?viewArtistFoc(mid,fp):head+viewArtistFoc(mid); }
  if(tab==="home"){ setTimeout(apBarSync,0);
    return `<div class="ap2 own">${artProfileHtml(mid,true)}</div><button class="cmx-fab art-fab" data-a="aFab" aria-label="發表">${I3.plus}</button>`;
  }
  if(tab==="me"){
    return head+`<main class="page">
      <section class="card me-card"><div class="av lg" style="margin:0 auto;background:${grad(m.g)}">${mAvIn(mid)}</div>
        <h2>${esc(artName(mid,"feed"))}</h2><span class="muted" style="font-size:13px">${g.solo?"SOLOIST":esc(g.name)}・藝人帳號</span>${lvLine()}</section>
      <div class="section-h">${WHISPER_NAME} 設定</div>
      <section class="card">
        <button class="list-btn" data-a="aNick">${I.star}Membership 粉絲的愛稱<span class="r">${esc(artistNick(mid)||"還沒設定")}</span></button>
        <button class="list-btn" data-a="thMine">${I.star}申請主題<span class="r">${TH_STORE}</span></button>
        <button class="list-btn" data-a="uniGo" data-v="#/artist?tab=points">${I.star}積分收入</button>
      </section>
      <div class="section-h">團體</div>
      <section class="card">
        ${cbrRow(mid)}
        <button class="list-btn" data-a="focGo" data-v="stick">${I.star}官方應援棒<span class="r">${g.solo?"":esc(g.name)}</span></button>
      </section>
      <div class="section-h">App</div>
      <section class="card">
        ${!isAdminAcct()?`<button class="list-btn" data-a="swapRole">${I.swap}切換到粉絲端<span class="r">追其他藝人、互串</span></button>`:""}
        ${sbxWho()?`<button class="list-btn" data-a="sbxT">${I.star}試玩模式<span class="r">${sbxOn()?"試玩中":"關閉"}</span></button>`:""}
        <button class="list-btn" data-a="theme">${I.gear}外觀<span class="r">${themeLabel()}</span></button>
        <button class="list-btn" data-a="coachAgain">${I.star}重看教學</button>
        <button class="list-btn" data-a="a2h">${I.home}加到主畫面<span class="r">iPhone</span></button>
        <button class="list-btn danger" data-a="logout">${I.out}登出</button>
      </section>
      ${isAdminAcct()&&!isUni()?`<div class="section-h">管理員工具<span class="muted">只有管理員帳號看得到</span></div>
      <section class="card">
        <button class="list-btn" data-a="swapRole">${I.swap}切換到粉絲端<span class="r">看通知</span></button>
        <button class="list-btn" data-a="toAdmin">${I.swap}回到管理員端</button>
        <button class="list-btn" data-a="reset">${I.gear}重設示範資料</button>
      </section>`:""}</main>`;
  }
  return head+viewStudio(mid);
}

function cmMember(c){ const p=S.get(K.posts,[]).find(x=>x.id===c.postId); if(!p) return false; return isMeC(c)?isMember(p.group):fakeMember({from:"other",name:c.name}); }

/* ---------- 留言面板（兩端共用） ---------- */
function openComments(postId,{focusC=null,replyTo=null}={}){
  ui.sheet={postId,focusC,replyTo};
  renderComments(true);
}
/* 貼文頁（照 Weverse）：上面「貼文／前往社群」，照片一張張往下排，下面藝人留言、全部留言；點留言的回覆進「回覆」頁
   ui.sheet={postId,focusC,replyTo,cid}；cid 有值就是回覆頁 */
const PDI={share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
  more:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>',
  reply:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>',
  dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 20h14"/></svg>',
  send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>'};
const cLiked=c=>Array.isArray(c.likedBy)&&c.likedBy.includes(myId());
const cReps=c=>(c.reps||[]).slice().sort((a,b)=>a.ts-b.ts);
/* 自己的留言才能刪（粉絲：自己寫的；藝人：自己這位成員寫的） */
const pdMineC=c=>{ if(!c||!c.id) return false; const s=session()||{}; if(c.author==="artist") return s.role==="artist"&&!!c.member&&c.member===s.member&&!String(c.id).endsWith("_r"); return c.author==="me"&&c.by===myEmail(); };
function pdMediaHtml(p){ const ms=p.media||[]; if(!ms.length) return ""; if(ms[0].kind==="video") return postMediaHtml(p);
  return `<div class="pd-imgs">${ms.map((x,i)=>`<button class="pd-img" data-a="pdView" data-v="${p.id}" data-i="${i}" style="aspect-ratio:${x.w||4}/${x.h||5}" aria-label="照片 ${i+1}"><span class="imgph"><i>HAECHU</i></span><img data-mid="${x.mid}" alt=""></button>`).join("")}</div>`; }
function renderComments(first=false){
  if(!ui.sheet) return;
  const {postId,focusC,replyTo,cid}=ui.sheet;
  let p=S.get(K.posts,[]).find(x=>x.id===postId), FP=null;
  if(!p&&String(postId).startsWith("fp")){ FP=S.get(K.fanPosts,[]).find(x=>x.id===postId); if(FP){ const A=groupArtists(FP.gid); p={id:FP.id,group:FP.gid,member:(FP.rep&&FP.rep[0]&&MEMBERS[FP.rep[0].mid]?FP.rep[0].mid:A[0]),text:FP.text,ts:FP.ts,likes:FP.likes,likedBy:FP.likedBy,fan:FP}; } }
  if(!p||!MEMBERS[p.member]){ ui.sheet=null; layer.innerHTML=""; return toast("這則動態已被刪除"); }
  const m=MEMBERS[p.member], g=groupOf(p.group), role=session().role, isArtist=role==="artist"&&session().member===p.member;
  const SNm=o=>shownName(o,p.group);   /* 社群裡顯示「這個社群」的暱稱（每個社群各自一個） */
  const list=[...getComments(postId),...(FP?(FP.rep||[]).map(r=>({id:r.id,postId,author:"artist",member:r.mid,text:r.text,ts:r.ts})):[])].sort((a,b)=>a.ts-b.ts), liked=likedSet().has(p.id), canWrite=role==="fan"||isArtist;
  const who=c=>c.author==="artist"?`${esc(artName(c.member&&MEMBERS[c.member]?c.member:p.member,"feed"))}${I.verified}`:`${esc(SNm(c))}${role!=="fan"&&cmMember(c)?`<span class="ms-badge">💎</span>`:""}`;
  const av=c=>c.author==="artist"?(()=>{ const am=c.member&&MEMBERS[c.member]?c.member:p.member; return `<span class="pd-av" style="background:${grad(MEMBERS[am].g)}">${mAvIn(am)}</span>`; })():cmWhoAv(c,p.group,"pd-av",c.g);
  const more=c=>c.author==="artist"||isMeC(c)?"":canModerate()?`<button class="pd-more" data-a="amC" data-c="${c.id}" aria-label="管理">${PDI.more}</button>`:role==="fan"?`<button class="pd-more" data-a="pdRep" data-c="${c.id}" aria-label="更多">${PDI.more}</button>`:"";
  const tr=c=>role==="artist"&&c.zh&&!isZhText(c.text)?`<p class="pd-tr">${esc(c.zh)}</p>`:"";
  const nRep=c=>cReps(c).length+(c.reply?1:0);
  const item=(c,top)=>`<div class="pd-c ${c.id===focusC?"flash":""} ${top?"top":""}" id="cm-${c.id}">${av(c)}<div class="pd-cb">
      <div class="pd-ch"><b class="${c.author==="artist"?"art":""}">${who(c)}</b><small>${ymdhm(c.ts)}</small>${more(c)}${pdMineC(c)?`<button class="pd-del" data-a="pdCDel" data-c="${c.id}">刪除</button>`:""}</div>
      ${isMeC(c)?`<p class="pd-ct">${esc(c.text)}</p>`:trT("c:"+c.id,c.text,"pd-ct","p",c.author!=="artist")}
      <div class="pd-ca"><button class="pd-lk ${cLiked(c)?"on":""}" data-a="pdCLike" data-c="${c.id}" aria-label="喜歡">${I.heart}${(c.likedBy||[]).length?`<span>${fmt(c.likedBy.length)}</span>`:""}</button>
        ${top===undefined?`<button class="pd-rp" data-a="pdOpenRep" data-c="${c.id}" aria-label="回覆">${PDI.reply}${nRep(c)?`<span>${fmt(nRep(c))}</span>`:""}</button>`:`<span class="pd-rp">${PDI.reply}<span>${fmt(nRep(c))}</span></span>`}</div></div></div>`;
  const rLk=r=>{ const L=r.likedBy||[]; return `<div class="pd-ca"><button class="pd-lk ${L.includes(myEmail())?"on":""}" data-a="pdRLike" data-c="${r.cid||""}" data-r="${r.id}" aria-label="喜歡">${I.heart}${L.length?`<span>${fmt(L.length)}</span>`:""}</button></div>`; };
  const repItem=r=>`<div class="pd-c pd-r" id="cm-${r.id}">${r.author==="artist"?av({author:"artist",member:r.member}):cmWhoAv(r,p.group,"pd-av",r.g)}<div class="pd-cb">
      <div class="pd-ch"><b class="${r.author==="artist"?"art":""}">${r.author==="artist"?`${esc(artName(r.member&&MEMBERS[r.member]?r.member:p.member,"feed"))}${I.verified}`:esc(SNm(r))}</b><small>${ymdhm(r.ts)}</small>${pdMineC(r)?`<button class="pd-del" data-a="pdRDel" data-c="${r.cid||""}" data-r="${r.id}">刪除</button>`:""}</div>${r.author==="me"&&r.by===myEmail()?`<p class="pd-ct">${esc(r.text)}</p>`:trT("r:"+r.id,r.text,"pd-ct","p",r.author!=="artist")}${rLk(r)}</div></div>`;
  const sec=(t,n,body,k,ids)=>`<section class="pd-sec ${k?"k-"+k:""}"><button class="pd-sh" ${k?`data-a="pdFold" data-v="${k}"`:""}><b>${t}</b><em>${fmt(n)}</em>${(k==="ac"||k==="ar")&&g&&!g.solo&&(ids||[]).length?`<span class="pd-savs">${[...new Set(ids)].filter(id=>MEMBERS[id]).slice(0,4).map(id=>`<span class="pd-sav" style="background:${grad(MEMBERS[id].g)}">${mAvIn(id)}</span>`).join("")}</span>`:""}${k?`<i class="${(ui.pdFold||{})[k]?"dn":""}">${PDI.chev}</i>`:""}</button>${k&&(ui.pdFold||{})[k]?"":body}</section>`;
  const head=(t)=>`<header class="pd-top"><button class="pd-ib" data-a="pdBack" aria-label="返回">${I.back}</button><span class="pd-tt"><b>${t}</b>${role==="fan"&&g?`<button data-a="pdGrp" data-v="${g.id}">前往社群 ›</button>`:""}</span>${!cid&&navigator.share?`<button class="pd-ib" data-a="pdShare" aria-label="分享">${PDI.share}</button>`:`<span class="pd-ib"></span>`}</header>`;
  const draft=ui.cDraft||"";
  const bar=(ph,to)=>canWrite?`<form class="pd-in" id="cform">${to?`<div class="pd-to">正在回覆 ${esc(to)}</div>`:""}<div class="pd-bar">${cid?"":`<button type="button" class="pd-hb ${liked?"on":""}" data-a="like" data-id="${p.id}" aria-label="按讚">${I.heart}<span hidden>${fmt(likeN(p))}</span></button>${role==="fan"?bmBtn("p:"+p.id):""}`}
      <label class="pd-pill"><textarea rows="1" class="ag" id="cin" autocomplete="off" placeholder="${ph}">${esc(draft)}</textarea></label><button class="pd-send" type="submit" id="csend" ${draft.trim()?"":"disabled"} aria-label="送出">${PDI.send}</button></div></form>`:"";
  let html;
  if(cid){ const c=list.find(x=>x.id===cid); if(!c){ ui.sheet.cid=null; return renderComments(true); }
    const arts=[...(c.reply?[{id:c.id+"_r",cid:c.id,author:"artist",text:c.reply.text,ts:c.reply.ts,likedBy:c.reply.likedBy||[]}]:[]),...cReps(c).filter(r=>r.author==="artist").map(r=>({...r,cid:c.id}))], fans=cReps(c).filter(r=>r.author!=="artist").map(r=>({...r,cid:c.id}));
    html=head("回覆")+`<main class="pd-body rp" id="csl">${item(c,true)}
      ${arts.length?sec("藝人回覆",arts.length,arts.map(repItem).join(""),"ar",arts.map(r=>r.member||p.member)):""}
      ${sec("全部回覆",fans.length,fans.length?fans.map(repItem).join(""):`<p class="pd-none">還沒有回覆</p>`)}</main>`+bar("請輸入回覆",c.author==="artist"?artName(p.member,"feed"):SNm(c));
  } else {
    const fans=list.filter(c=>c.author!=="artist");
    /* 藝人留言：藝人自己的留言＋藝人回覆粉絲的留言（前面帶 @粉絲名，點了進那則的回覆頁），照 Weverse */
    const aRep=fans.flatMap(c=>[...(c.reply?[{id:c.id+"_r",cid:c.id,author:"artist",member:p.member,text:c.reply.text,ts:c.reply.ts,likedBy:c.reply.likedBy||[],to:SNm(c)}]:[]),...cReps(c).filter(r=>r.author==="artist").map(r=>({...r,cid:c.id,to:SNm(c)}))]);
    const arts=[...list.filter(c=>c.author==="artist"),...aRep].sort((a,b)=>a.ts-b.ts);
    const artCard=r=>r.cid?`<div class="pd-c pd-r pd-ar" id="cm-${r.id}" data-a="pdOpenRep" data-c="${r.cid}">${av({author:"artist",member:r.member})}<div class="pd-cb">
      <div class="pd-ch"><b class="art">${esc(artName(r.member&&MEMBERS[r.member]?r.member:p.member,"feed"))}${I.verified}</b><small>${ymdhm(r.ts)}</small></div><p class="pd-ct"><span class="pd-at">@${esc(r.to)}</span> ${esc(r.text)}</p>${rLk(r)}</div></div>`:item(r);
    const lk=postLocked(p);
    html=head("貼文")+`<main class="pd-body" id="csl">${FP?`<article class="pd-post fpd">
      <div class="pd-ph">${cmWhoAv(FP,FP.gid,"pd-av lg",FP.g||3)}<span class="pd-pw"><b>${esc(SNm(FP))}</b><small>${ymdhm(FP.ts)}${FP.hideArt?`<em class="fp2-hide">Hide from Artists</em>`:""}</small></span>${canModerate()&&!isMine(FP)?`<button class="pd-more" data-a="amFp" data-id="${FP.id}" aria-label="管理">${PDI.more}</button>`:""}</div>
      ${(FP.imgs||[]).length?`<div class="fpd-imgs">${FP.imgs.map(u=>`<button class="cp-img" data-a="cpPh" data-v="${esc(u)}"><img src="${esc(u)}" alt="" loading="lazy"></button>`).join("")}</div>`:""}
      ${FP.text?(isMine(FP)?`<p class="pd-txt">${esc(FP.text)}</p>`:trT("f:"+FP.id,FP.text,"pd-txt")):""}
      <p class="pd-stat">喜歡 ${fmt(likeN(FP))}・留言 ${fmt(cmTotalOf(list))}</p></article>`:`<article class="pd-post">
      <div class="pd-ph">${viewerFan()?`<button class="pd-av lg av-go" data-a="goArtist" data-v="${p.member}" aria-label="${esc(artName(p.member,"feed"))} 的頁面" style="background:${grad(m.g)}">${mAvIn(p.member)}</button>`:`<span class="pd-av lg" style="background:${grad(m.g)}">${mAvIn(p.member)}</span>`}<span class="pd-pw"><b>${esc(artName(p.member,"feed"))}${I.verified}</b><small>${ymdhm(p.ts)}</small></span>${isAdminAcct()&&!isArtist?`<button class="pd-more" data-a="postMod" data-id="${p.id}" aria-label="管理這則">${PDI.more}</button>`:""}</div>
      ${lk?lockedBody(p,lk):`${p.text?(isArtist?`<p class="pd-txt">${esc(p.text)}</p>`:trT("pt:"+p.id,p.text,"pd-txt")):""}${p.media?pdMediaHtml(p):p.color!=null?`<div class="pic" style="background:${grad(p.color)}">${I.heart}</div>`:""}${p.poll?pollCard(p):""}`}
      <p class="pd-stat">喜歡 ${fmt(likeN(p))}・留言 ${fmt(cmTotalOf(list))}</p></article>`}
      ${arts.length?sec("藝人留言",arts.length,arts.map(artCard).join(""),"ac",arts.map(c=>c.member||p.member)):""}
      ${sec("全部留言",fans.length,fans.length?fans.map(c=>item(c)).join(""):`<p class="pd-none">還沒有留言</p>`)}</main>`+bar(isArtist&&replyTo?"請輸入回覆":"請輸入留言");
  }
  const keep=!first&&document.getElementById("csl")?document.getElementById("csl").scrollTop:null;
  setLayer(`<div class="pd ${first?"in":""}" role="dialog" aria-label="${cid?"回覆":"貼文"}">${html}<button class="pd-jump" data-a="pdJump" aria-label="跳到最下面" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 6 5 5 5-5M7 12l5 5 5-5"/></svg></button></div>`,"comments"); hydrateMedia(layer);
  { const sl=document.getElementById("csl"), jb=layer.querySelector(".pd-jump"); if(sl&&jb){ const chk=()=>{ jb.hidden=sl.scrollHeight-sl.scrollTop-sl.clientHeight<200; }; sl.addEventListener("scroll",chk,{passive:true}); setTimeout(chk,60); } }
  const l=document.getElementById("csl");
  if(focusC){ const el=document.getElementById("cm-"+focusC); if(el) el.scrollIntoView({block:"center"}); ui.sheet.focusC=null; }
  else if(keep!=null) l.scrollTop=keep;
}
/* 貼文看大圖（照 Weverse）：右上下載、關閉；中間左右滑；下面張數和縮圖 */
function openGallery(pid,start=0){ const p=getPosts().find(x=>x.id===pid); if(!p||!p.media) return; const ms=p.media.filter(x=>x.kind!=="video"); if(!ms.length) return;
  ui.galBack=layer.innerHTML?{sheet:ui.sheet}:null;
  setLayer(`<div class="gal2" role="dialog" aria-label="照片"><div class="gal2-top"><button data-a="galDl" aria-label="下載">${PDI.dl}</button><button data-a="galX" aria-label="關閉">${XI}</button></div>
    <div class="gal2-s" id="galS">${ms.map(x=>`<div class="gal2-i"><span class="imgph"><i>HAECHU</i></span><img data-mid="${x.mid}" alt=""></div>`).join("")}</div>
    <div class="gal2-n" id="galN">${start+1}/${ms.length}</div>${ms.length>1?`<div class="gal2-th">${ms.map((x,i)=>`<button class="${i===start?"on":""}" data-a="galGo" data-i="${i}"><img data-mid="${x.mid}" alt=""></button>`).join("")}</div>`:""}</div>`,"gal");
  hydrateMedia(layer); const sc=document.getElementById("galS"); if(sc) requestAnimationFrame(()=>{ sc.scrollLeft=start*sc.clientWidth; }); }
/* 看大圖往下拉就關掉（照 Weverse） */
(function(){ let g=null;
  document.addEventListener("touchstart",e=>{ const s=e.target.closest&&e.target.closest("#galS"); if(!s||e.touches.length!==1){ g=null; return; } g={s,x:e.touches[0].clientX,y:e.touches[0].clientY,on:false,dy:0}; },{passive:true});
  document.addEventListener("touchmove",e=>{ if(!g) return; const dx=e.touches[0].clientX-g.x, dy=e.touches[0].clientY-g.y;
    if(!g.on){ if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)){ g=null; return; } if(dy<12||Math.abs(dy)<Math.abs(dx)*1.3) return; g.on=true; g.s.classList.add("drag"); }
    g.dy=Math.max(0,dy); g.s.style.transform=`translateY(${g.dy}px)`; const w=g.s.closest(".gal2"); if(w) w.style.background=`rgba(0,0,0,${Math.max(.2,1-g.dy/500)})`; if(e.cancelable) e.preventDefault(); },{passive:false});
  document.addEventListener("touchend",()=>{ if(!g) return; const x=g; g=null; if(!x.on) return; x.s.classList.remove("drag");
    if(x.dy>110){ const b=document.querySelector('[data-a="galX"]'); if(b) b.click(); return; }
    x.s.style.transition="transform .22s"; x.s.style.transform=""; const w=x.s.closest(".gal2"); if(w) w.style.background=""; setTimeout(()=>{ x.s.style.transition=""; },230); },{passive:true});
})();
document.addEventListener("scroll",e=>{ const b=e.target; if(!b||!b.classList) return;
  if(b.id==="galS"){ const n=b.children.length, k=Math.round(b.scrollLeft/Math.max(1,b.clientWidth)); const c=document.getElementById("galN"); if(c) c.textContent=(k+1)+"/"+n; document.querySelectorAll(".gal2-th button").forEach((x,i)=>x.classList.toggle("on",i===k)); }
  if(b.classList.contains("pm-car")){ const k=Math.round(b.scrollLeft/Math.max(1,b.clientWidth)); const d=b.parentElement&&b.parentElement.querySelector(".pm-dots"); if(d) [...d.children].forEach((x,i)=>x.classList.toggle("on",i===k)); } },true);

/* ---------- 聊天室共用：時間格式 ---------- */
function timeHM(ts){const t=new Date(ts);return pad(t.getHours())+":"+pad(t.getMinutes())}
function dayLabel(ts){const t=new Date(ts),y=new Date();y.setDate(y.getDate()-1);
  if(isToday(ts)) return "今天"; if(t.toDateString()===y.toDateString()) return "昨天"; return (t.getMonth()+1)+" 月 "+t.getDate()+" 日";}
