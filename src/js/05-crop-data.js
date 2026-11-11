/* HAECHU｜裁剪、共用資料讀取、圖示 */
/* =========================================================
   裁剪：放照片的地方先跳出裁剪框（比例＝那個位置實際顯示的比例）
   ・單指拖曳移動、兩指縮放（電腦：拖曳＋滾輪）；框外變暗，框內就是最後的樣子
   ・完成才換上去，取消就什麼都不變
   ・cropImg(檔案或 Blob,{ratio,round,max,free}) → Blob（取消是 null）
   ・free：貼文照片用，可以選 原比例／1:1／4:5／16:9
   ========================================================= */
function cropImg(src,{ratio=1,round=false,max=1600,free=false,png=false}={}){ return new Promise(async done=>{
  let url, img; try{ url=URL.createObjectURL(src); img=await new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=url; }); }catch(e){ toast("這張照片讀不出來"); done(null); return; }
  const IW=img.naturalWidth, IH=img.naturalHeight, R0=IW/IH, RATIOS=[["原比例",R0],["1:1",1],["4:5",.8],["16:9",16/9]];
  let r=free?R0:ratio;
  const w=document.createElement("div"); w.className="crp"; w.setAttribute("role","dialog"); w.setAttribute("aria-label","裁剪照片");
  w.innerHTML=`<header class="crp-h"><button class="crp-x" type="button">取消</button><b>裁剪</b><button class="crp-ok" type="button">完成</button></header>
    <div class="crp-st"><img class="crp-im" alt="" src="${url}"><div class="crp-fr ${round?"round":""}"><i></i><i></i></div></div>
    ${free?`<div class="crp-rs">${RATIOS.map(([l],k)=>`<button type="button" data-k="${k}" class="${k===0?"on":""}">${l}</button>`).join("")}</div>`:""}`;
  document.body.appendChild(w); const st=w.querySelector(".crp-st"), im=w.querySelector(".crp-im"), fr=w.querySelector(".crp-fr");
  let F={x:0,y:0,w:0,h:0}, s=1, x=0, y=0;
  const minS=()=>Math.max(F.w/IW,F.h/IH);
  const clamp=()=>{ s=Math.max(minS(),Math.min(minS()*6,s)); x=Math.min(F.x,Math.max(F.x+F.w-IW*s,x)); y=Math.min(F.y,Math.max(F.y+F.h-IH*s,y)); };
  const paint=()=>{ im.style.transform=`translate(${x}px,${y}px) scale(${s})`; };
  const layout=keep=>{ const W=st.clientWidth, H=st.clientHeight, pad=22, aw=W-pad*2, ah=H-pad*2; let fw=aw, fh=fw/r; if(fh>ah){ fh=ah; fw=fh*r; }
    const old={...F}, cx=old.w?((old.x+old.w/2)-x)/s:IW/2, cy=old.h?((old.y+old.h/2)-y)/s:IH/2;
    F={x:(W-fw)/2,y:(H-fh)/2,w:fw,h:fh}; Object.assign(fr.style,{left:F.x+"px",top:F.y+"px",width:fw+"px",height:fh+"px"});
    if(!keep||!old.w) s=minS(); else s=Math.max(s,minS()); x=F.x+F.w/2-cx*s; y=F.y+F.h/2-cy*s; clamp(); paint(); };
  requestAnimationFrame(()=>layout(false));
  const onRs=()=>layout(true); addEventListener("resize",onRs);
  /* 手勢 */
  const P=new Map(); let g0=null;
  const start=()=>{ const ps=[...P.values()]; if(ps.length===1) g0={x:ps[0].x,y:ps[0].y,ox:x,oy:y,s}; else if(ps.length>=2){ const [a,b]=ps, mx=(a.x+b.x)/2, my=(a.y+b.y)/2; g0={d:Math.hypot(a.x-b.x,a.y-b.y),mx,my,ox:x,oy:y,s}; } };
  st.addEventListener("pointerdown",e=>{ st.setPointerCapture(e.pointerId); const rc=st.getBoundingClientRect(), kz=st.clientWidth/Math.max(1,rc.width); P.set(e.pointerId,{x:e.clientX*kz,y:e.clientY*kz}); start(); });
  st.addEventListener("pointermove",e=>{ if(!P.has(e.pointerId)||!g0) return; const rc=st.getBoundingClientRect(), kz=st.clientWidth/Math.max(1,rc.width); P.set(e.pointerId,{x:e.clientX*kz,y:e.clientY*kz}); const ps=[...P.values()]; rc.left0=rc.left*kz; rc.top0=rc.top*kz;
    if(ps.length===1&&g0.d==null){ x=g0.ox+(ps[0].x-g0.x); y=g0.oy+(ps[0].y-g0.y); }
    else if(ps.length>=2&&g0.d){ const [a,b]=ps, d=Math.hypot(a.x-b.x,a.y-b.y), mx=(a.x+b.x)/2, my=(a.y+b.y)/2, ns=Math.max(minS(),Math.min(minS()*6,g0.s*d/g0.d)), k=ns/g0.s;
      const px=g0.mx-rc.left0, py=g0.my-rc.top0; x=px-(px-g0.ox)*k+(mx-g0.mx); y=py-(py-g0.oy)*k+(my-g0.my); s=ns; }
    clamp(); paint(); });
  const up=e=>{ P.delete(e.pointerId); start(); }; st.addEventListener("pointerup",up); st.addEventListener("pointercancel",up);
  st.addEventListener("wheel",e=>{ e.preventDefault(); const rc=st.getBoundingClientRect(), kz=st.clientWidth/Math.max(1,rc.width), px=(e.clientX-rc.left)*kz, py=(e.clientY-rc.top)*kz, ns=Math.max(minS(),Math.min(minS()*6,s*(1-e.deltaY*.0015))), k=ns/s; x=px-(px-x)*k; y=py-(py-y)*k; s=ns; clamp(); paint(); },{passive:false});
  w.addEventListener("touchmove",e=>{ if(e.cancelable) e.preventDefault(); },{passive:false});
  const close=v=>{ removeEventListener("resize",onRs); w.classList.add("out"); setTimeout(()=>{ w.remove(); URL.revokeObjectURL(url); },200); done(v); };
  w.querySelector(".crp-x").onclick=()=>close(null);
  w.querySelector(".crp-ok").onclick=async()=>{ const sx=(F.x-x)/s, sy=(F.y-y)/s, sw=F.w/s, sh=F.h/s, k=Math.min(1,max/Math.max(sw,sh)), c=document.createElement("canvas");
    c.width=Math.max(1,Math.round(sw*k)); c.height=Math.max(1,Math.round(sh*k)); const ctx=c.getContext("2d"); ctx.imageSmoothingQuality="high"; ctx.drawImage(img,sx,sy,sw,sh,0,0,c.width,c.height);
    const b=await new Promise(res=>c.toBlob(res,png?"image/png":"image/jpeg",.9)); close(b); };
  if(free) w.querySelector(".crp-rs").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; w.querySelectorAll(".crp-rs button").forEach(x2=>x2.classList.toggle("on",x2===b)); r=RATIOS[+b.dataset.k][1]; layout(false); });
}); }
/* 各個位置的比例 */
const CROP_IC=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>`;
const CROP_COVER=1/1.2, CROP_PROF=1/1.5;   // 社群封面、個人頁背景的實際比例
const cropPhone=()=>Math.min(.75,Math.max(.4,innerWidth/innerHeight));
/* 選檔案：iPhone 上要把 <input> 放進頁面裡，選好的檔案才一定收得到 */
function pickClick(inp){ try{ inp.style.cssText="position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0"; document.body.appendChild(inp); inp.addEventListener("change",()=>setTimeout(()=>inp.remove(),3000)); inp.addEventListener("cancel",()=>inp.remove()); }catch(e){} inp.click(); }
/* 推播帶著 op=貼文編號 進來：直接打開那則貼文 */
function opFromHash(){ const m=/[?&]op=([^&]+)/.exec(location.hash); if(!m) return; const id=decodeURIComponent(m[1]); history.replaceState(null,"",location.pathname+location.search+"#/fan"); if(!session()) return; ui.feedTab="feed"; ui.focusPost=id; ui.expanded.add(id); ui._opId=id; render(); }
addEventListener("hashchange",opFromHash); setTimeout(opFromHash,300);
/* App 開著的時候：手機推播改成 App 內的通知條（後台看到「在線上」就不送手機推播） */
function onlinePing(){ try{ const s=session(); if(!s||s.role!=="fan"||!HB_ON) return; S.set(K.online,document.hidden?0:Date.now()); }catch(e){} }
setInterval(()=>{ if(!document.hidden) onlinePing(); },60e3);   /* 在線狀態：一分鐘報一次就夠（每次都會寫一筆雲端） */ document.addEventListener("visibilitychange",onlinePing); setTimeout(onlinePing,1500);
let iaT=0;
let visSince=Date.now(); document.addEventListener("visibilitychange",()=>{ if(!document.hidden) visSince=Date.now(); });
function iaBanner(n){ return;   // 她決定：在 App 裡一律不跳通知（通知只會出現在鈴鐺裡）
  try{ if(!n||document.hidden||n.self||Date.now()-visSince<2500||(n.ts&&n.ts<visSince)) return; /* 剛打開／剛從推播點進來：手機已經通知過了，不再跳一次 */ const r=route(); if(n.kind==="whisper"&&r.sub==="chat"&&r.m===n.member) return;
  const [lab,col]=NK[n.kind]||["NEWS","#D1D5DB"], act=n.kind==="tour"?"openTour":n.kind==="news"?"openNews":n.kind==="core"?"goCore":n.kind==="whisper"?"openChat":n.kind==="live"?"openLive":n.kind==="event"?"openEvent":n.kind==="system"?"goNotifs":"openPost", m=MEMBERS[n.member];
  document.querySelectorAll(".ia-ban").forEach(x=>x.remove()); const b=document.createElement("button"); b.className="ia-ban"; b.type="button";
  Object.entries({a:act,ek:n.evKind||"",ev:n.eventId||"",lv:n.liveId||"",m:n.member||"",id:n.postId||n.newsId||n.tourId||"",c:n.commentId||""}).forEach(([k,v])=>b.dataset[k]=v);
  b.innerHTML=`${m?`<span class="ia-av" style="background:${grad(m.g)}">${mAvIn(n.member)}</span>`:`<span class="ia-av ia-h">H</span>`}<span class="ia-tx"><em><i style="background:${col}"></i>${esc(lab)}</em><b>${esc(notifMsg(n))}</b></span>`;
  document.body.appendChild(b); requestAnimationFrame(()=>b.classList.add("on")); clearTimeout(iaT);
  const close=()=>{ b.classList.remove("on"); setTimeout(()=>b.remove(),300); }; iaT=setTimeout(close,4500); b.addEventListener("click",()=>setTimeout(close,0));
  let y0=0; b.addEventListener("touchstart",e=>{ y0=e.touches[0].clientY; },{passive:true}); b.addEventListener("touchmove",e=>{ if(e.touches[0].clientY-y0<-12) close(); },{passive:true}); }catch(e){} }
/* 自己說的話（TIE、直播聊天、留言）不進通知 */
const selfSaid=n=>n.self&&/^你傳了 |」直播間說：|的貼文留言：/.test(n.text||"");
function getNotifications(){ return S.get(K.notifs,[]).filter(n=>!selfSaid(n)&&!dbWipedTx(n)).sort((a,b)=>b.ts-a.ts); }
function hasUnread(){ return S.get(K.unread,"0")==="1"; }
function markAllRead(){ S.set(K.unread,"0"); }
function getSettings(){ return {post:true,comment:true,live:true,whisper:true,event:true,...S.get(K.settings,{})}; }
function followed(){ const L=S.get(K.fanArtists,[])||[]; return GROUPS.length?L.filter(id=>groupOf(id)):L; }   // 已刪除的團不算追蹤
function pushNotification({kind,member,group,text,postId,color,commentId,direct=false,liveId,eventId,evKind,liveReply}){
  if(!getSettings()[kind]) return false;                 // 粉絲關掉這類通知 → 不推
  const list=getNotifications();
  list.unshift({id:"n"+Date.now(),kind,member,group,text:(text||"").slice(0,120),postId,commentId,color,direct,liveId,eventId,evKind,liveReply,ts:Date.now()});
  S.set(K.notifs,list.slice(0,100));
  // 發文：只通知追蹤這團的粉絲；回覆留言：直接通知留言的那位粉絲
  if(direct || followed().includes(group)){ S.set(K.unread,"1"); return true; }
  return false;
}

/* ===== 貼文 ===== */
const likeN=p=>p&&Array.isArray(p.likedBy)?p.likedBy.length:(p&&p.likes||0);
const getPosts=()=>S.get(K.posts,[]).sort((a,b)=>b.ts-a.ts);
const POST_TAGS=["日常","幕後花絮","劇透","互動問答"];
function createPost(memberId,text,color,tag,media,vis,pw,poll){
  const m=MEMBERS[memberId];
  const post={id:"p"+Date.now(),member:memberId,group:m.group,ts:Date.now(),text,color:media&&media.length?null:color,tag:tag||"日常",media:media&&media.length?media:undefined,likes:0,comments:0,vis:vis==="ms"||vis==="pw"?vis:undefined,pw:vis==="pw"?String(pw||""):undefined,poll:poll?{...poll,base:poll.opts.map(()=>0)}:undefined};
  S.set(K.posts,[post,...S.get(K.posts,[])]);
  const safe=post.vis==="pw"?"查看非公開貼文":text;   // 私密貼文：通知裡不露內容；Membership：有買的看內容、沒買的看到「查看Membership貼文」（送到每個人時再決定）
  const reached=feedPush({kind:"post",member:memberId,group:m.group,text:safe,postId:post.id,color,vis:post.vis||undefined},"g:"+m.group);
  return {post,reached};
}

/* ===== 票選活動（照 Weverse：問題、選項可放圖、票選時間） ===== */
const PL_IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5"/><path d="m7.2 9 1.4 1.4 2.6-2.8M13 9.2h4M7.6 15h1.2M13 15h4"/></svg>';
const PL_IMG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="15.5" cy="8.5" r="1.6"/><path d="m4 17 5.5-5 4 3.5 2.5-2 4 3.5"/></svg>';
const PL_DUR=[["15m","15分鐘",15*60e3],["1h","1小時",36e5],["24h","24小時",864e5],["7d","7天",7*864e5],["30d","30天",30*864e5],["custom","自行設定",0]];
function pollLeft(end){ const d=end-Date.now(); if(d<=0) return "已結束"; if(d<36e5) return `剩 ${Math.max(1,Math.ceil(d/6e4))} 分鐘`; if(d<864e5) return `剩 ${Math.ceil(d/36e5)} 小時`; return `剩 ${Math.ceil(d/864e5)} 天`; }
function pollOk(){ const d=ui.pollDraft; return !!(d&&d.q.trim()&&d.opts.filter(o=>o.t.trim()).length>=2&&(d.dur!=="custom"||d.end)); }
function pollEdHtml(){ const d=ui.pollDraft;
  return `<div class="vt-w" role="dialog" aria-label="新增票選活動"><header class="vt-h"><span></span><b>新增票選活動</b><button class="vt-x" data-a="pollX" aria-label="關閉">${I3.x}</button></header>
    <div class="vt-b"><textarea id="plQ" class="vt-q" rows="2" placeholder="請輸入問題。">${esc(d.q)}</textarea>
      ${d.opts.map((o,i)=>`<div class="vt-o"><label class="vt-oi"><input class="vt-in" data-i="${i}" placeholder="輸入選項" value="${esc(o.t)}" autocomplete="off">${d.opts.length>2?`<button type="button" data-a="pollRm" data-i="${i}" aria-label="移除選項">${I3.x}</button>`:""}</label><label class="vt-img ${o.img?"has":""}" aria-label="選項圖片">${o.img?`<img src="${o.img}" alt="">`:PL_IMG}<input type="file" accept="image/*" class="vt-file" data-i="${i}"></label></div>`).join("")}
      ${d.opts.length<6?`<button class="vt-add" data-a="pollAdd">＋ 新增選項</button>`:""}
      <div class="vt-sep"></div><div class="vt-sec">票選時間</div>
      <div class="vt-chips">${PL_DUR.map(([k,l])=>`<button class="${d.dur===k?"on":""}" data-a="pollDur" data-v="${k}">${l}</button>`).join("")}</div>
      ${d.dur==="custom"?`<input type="datetime-local" id="plEnd" class="vt-end" value="${esc(d.end||"")}" aria-label="結束時間">`:""}</div>
    <footer class="vt-f"><button class="vt-ok" id="plOk" data-a="pollOk" ${pollOk()?"":"disabled"}>新增票選活動</button></footer></div>`; }
function openPollEd(){ const c=ui.composePoll; ui.pollDraft=c?{q:c.q,opts:c.opts.map(o=>({...o})),dur:c.dur||"24h",end:c.endIn||null}:{q:"",opts:[{t:""},{t:""}],dur:"24h",end:null}; setLayer(pollEdHtml(),"poll"); }
function pollCard(p){ const P=p.poll, V=S.get(K.pollVotes,{}), my=V[p.id], ended=Date.now()>=P.end, role=session()&&session().role, show=my!=null||ended||role!=="fan";
  const an=!(ui.pvSeen=ui.pvSeen||{})[p.id+":"+my]; if(show) ui.pvSeen[p.id+":"+my]=1; const cnt=P.opts.map((o,i)=>Math.max((P.base&&P.base[i])||0,my===i?1:0)), tot=cnt.reduce((a,b)=>a+b,0), mx=Math.max(...cnt);
  return `<div class="pv"><b class="pv-q">${esc(P.q)}</b>${P.opts.map((o,i)=>{ const pc=tot?Math.round(cnt[i]*100/tot):0, im=o.img?`<img src="${o.img}" alt="">`:"";
    return show?`<div class="pv-o r ${my===i?"me":""} ${mx>0&&cnt[i]===mx?"top":""}"><i class="${an?"an":""}" style="width:${pc}%"></i>${im}<span>${esc(o.t)}</span><em>${pc}%</em></div>`
      :`<button class="pv-o" data-a="pollVote" data-id="${p.id}" data-i="${i}">${im}<span>${esc(o.t)}</span></button>`; }).join("")}
    <small class="pv-m">${tot?fmt(tot)+" 人參與":"還沒有人投票"}・${pollLeft(P.end)}</small></div>`; }
/* ===== TIE（藝人私訊） ===== */
const getWhispers=()=>S.get(K.whispers,[]).sort((a,b)=>a.ts-b.ts);
/* 粉絲看得到的訊息：只限「有 TIE 券的期間」，再扣掉被清除／新訂閱時收起來的舊紀錄 */
const fanRoom=member=>{
  const c=(S.get(K.tieCleared,{})[member])||0, rec=subs()[member]; if(!rec) return [];
  return getWhispers().filter(w=>w.member===member&&((w.from==="artist"&&(!w.to||w.to===myEmail()))||mineX(w))&&w.ts>c&&inPeriod(rec,w.ts));
};
/* TIE 聊天室：每個聊天室各自的設定 */
function tieSet(member){
  const m=MEMBERS[member];
  const sv={...(S.get(K.tieSet,{})[member]||{})}; if(m&&sv.chatName===m.name) delete sv.chatName;
  const st={chatName:m?artName(member,"tie"):"",nickname:ME.name,badge:true,translate:true,muted:false,fav:false,bgMode:"default",bgColor:"#E6E6FA",bgPattern:1,bgImage:null,...sv};
  /* 粉絲沒自己換過背景（或選回「預設」）：跟著藝人設的背景走 */
  const ab=artTieBg(member); if(ab&&(!sv.bgMode||sv.bgMode==="default")){ Object.assign(st,ab); st._art=true; }
  return st;
}
const artTieBg=mid=>{ const b=(S.get(K.tieArtBg,{})||{})[mid]; return b&&b.bgMode&&b.bgMode!=="default"?b:null; };
function saveTieSet(member,u){ const all=S.get(K.tieSet,{}); all[member]={...(all[member]||{}),...u}; S.set(K.tieSet,all); }
const artistReadTs=mid=>(S.get(K.tieReadBy,{})||{})[mid]||0;   // 藝人讀到哪裡（每位藝人分開、所有手機同步）
const DAY=864e5;
/* 天數照 Bubble：每天半夜 12 點換日（用手機的日期算） */
const calDay=ts=>{ const d=new Date(ts); return Math.round(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5); };
const daysLeft=exp=>Math.max(1,calDay(exp)-calDay(Date.now()));
const subDays=member=>{const r=subs()[member];return r?calDay(Math.min(Date.now(),r.expires))-calDay(r.since)+1:0};
function recallWhisper(id){ S.set(K.whispers,S.get(K.whispers,[]).filter(w=>w.id!==id)); }
function clearRooms(){ const c={}; Object.keys(subs()).forEach(id=>c[id]=Date.now()); S.set(K.tieCleared,{...S.get(K.tieCleared,{}),...c}); }
function restoreRoom(member){ const c=S.get(K.tieCleared,{}); delete c[member]; S.set(K.tieCleared,c); }
function roomUnread(member){ const last=(S.get(K.wRead,{})[member])||0; return fanRoom(member).filter(w=>w.from==="artist"&&w.ts>last).length; }
function markRoomRead(member){ const r=S.get(K.wRead,{}); r[member]=Date.now(); S.set(K.wRead,r); }
/* =========================================================
   TIE 券（在 SHOP 購買，一張券對應一位成員）
   ・新訂閱：系統自動送出藝人事先寫好的歡迎語，愛心天數從 1 開始
   ・券到期後 24 小時內，補買同一位成員 → 算連續訂閱：天數保留、不再送歡迎語
   ・到期超過 24 小時才買 → 算全新訂閱：歡迎語重送、天數歸零，
     舊對話先收起來，可在聊天室設定「載入歷史對話」找回
   ========================================================= */
const GRACE=DAY;
const PLANS=[{id:"d7",days:7,pts:1000,name:"7 天"},{id:"d30",days:30,pts:3500,name:"30 天"},{id:"d365",days:365,pts:38000,name:"365 天"}];
/* 管理員自己的藝人身分：粉絲訂 TIE 免費 */
const tieFree=mid=>Object.keys(ACCOUNTS).some(k=>ACCOUNTS[k]&&ACCOUNTS[k].member===mid&&ACCOUNTS[k].role==="admin");
const planPts=(mid,p)=>tieFree(mid)?0:p.pts;
/* TIE 全團方案：一次訂整團每位成員 30 天，價格＝成員人數 × 2,500（免費的成員不算錢） */
const TIE_GRP=2500;
const grpTie=mid=>{ const m=MEMBERS[mid], ids=m?groupArtists(m.group):[]; return ids.length>1?{id:"grp",days:30,name:"全團 30 天",ids,pts:ids.reduce((a,id)=>a+(tieFree(id)?0:TIE_GRP),0)}:null; };
const tiePlans=mid=>{ const g=grpTie(mid); return g?[...PLANS,g]:PLANS; };
const subs=()=>S.get(K.tieSubs,{});
const isActive=id=>{const r=subs()[id];return !!r&&Date.now()<=r.expires};
/* 還沒買（或已經過了續訂寬限）就不能進 TIE 聊天室：直接跳商店的 TIE 券 */
const tieNeedBuy=mid=>{ const st=passStatus(mid); return !st||st.cls==="off"; };
function tieGate(mid){ if(!MEMBERS[mid]||!tieNeedBuy(mid)) return false; tieStore(MEMBERS[mid].group); return true; }
// seenUntil：示範用「模擬到期」時，已經收到的訊息不會因此消失
function inPeriod(rec,ts){ return rec.periods.some(p=>ts>=p.start&&ts<=(p.end!=null?p.end:Math.max(rec.expires,rec.seenUntil||0))); }
const welcomeOf=mid=>S.get(K.tieWelcome,{})[mid]||"歡迎來到我的 TIE 💜 以後我會常常在這裡跟你說悄悄話，有空也要回我喔！";
const points=()=>S.get(K.points,0);
/* 等級（#SUN）：由積分算；練習生（還沒出道）最高 T5，出道後至少 R1；已經升到的字母不會掉回去（字母保底） */
const LV_TBL=[["T",[0,500,1500,3000,5000]],["R",[8000,11000,14000,17000,20000]],["E",[24000,29000,34000,39000,44000]],["D",[50000,58000,66000,74000,82000]],["C",[92000,104000,116000,128000,140000]],["B",[155000,173000,191000,209000,227000]],["A",[250000,280000,310000,340000,370000]],["S",[410000,460000,510000,560000,610000]],["L",[680000,800000,1000000]]];
const LV_FONT={T:[0x1D5D4,0x1D7EC],R:[0x1D63C,0x1D7EC],E:[0x1D400,0x1D7CE],D:[0x1D468,0x1D7CE],C:[0x1D670,0x1D7F6],B:[0x1D538,0x1D7D8],A:[0,0x1D7CE],S:[0x1D49C,0x1D7CE],L:[0x1D4D0,0x1D7CE]};
const lvCode=(li,si)=>{ const L=LV_TBL[li][0], f=LV_FONT[L]; return (L==="A"?"Λ":String.fromCodePoint(f[0]+L.charCodeAt(0)-65))+String.fromCodePoint(f[1]+si+1); };
function myLevel(){ { const s0=session()||{}; if(s0.role==="artist"&&s0.member&&MEMBERS[s0.member]) return {...artLevel(s0.member),art:true}; } const s=session()||{}, a=ACCOUNTS[s.email]||{}, art=!!(a.member||s.home)&&!(s.uni&&s.role==="fan"), p=points(); let li=0,si=0;   /* 管理員切到粉絲：那是另一個粉絲身分，不套出道的 R1 */
  LV_TBL.forEach(([,th],i)=>th.forEach((v,j)=>{ if(p>=v){ li=i; si=j; } }));
  if(!art&&li>0){ li=0; si=4; }   // 還沒出道：最高 T5
  if(art&&li<1){ li=1; si=0; }    // 出道後：至少 R1
  if(s.uni&&s.role==="fan"&&!S.get(K.lvFix,0)){ S.set(K.lvMax,0); S.set(K.lvFix,1); }   /* 之前誤套 R1 的保底，清一次 */
  /* 等級照現在的積分即時算：積分花掉低於門檻，等級（字母和數字）都會往下掉（粉絲、藝人一樣） */
  const nx=si+1<LV_TBL[li][1].length?[li,si+1]:li+1<LV_TBL.length?[li+1,0]:null;
  return {li,si,code:lvCode(li,si),name:["練習生","新人","新銳","人氣","實力","當紅","王牌","巨星","傳奇"][li],art,next:nx&&(!art&&nx[0]>0?null:{code:lvCode(nx[0],nx[1]),need:Math.max(0,LV_TBL[nx[0]][1][nx[1]]-p)})}; }
function lvLine(){ try{ const s0=session()||{}; if(s0.role==="artist"&&s0.member&&MEMBERS[s0.member]) return artLvLine(s0.member);   /* 藝人端：等級照藝人積分算 */ if(uniArt()) return `<div class="me-lv"><small>${fmt(points())} 積分</small></div>`;   /* 有藝人身分的人在粉絲端：只看積分，等級看藝人端 */ const v=myLevel(), p=points(), s=session()||{}, adm=s.uni||s.admin||(ACCOUNTS[s.email]||{}).role==="admin"; return `<div class="me-lv"><b>${v.code}</b><span>${v.name}</span><small>${fmt(p)} 積分・${v.next?`再 ${fmt(v.next.need)} 積分升到 ${v.next.code}`:!v.art?(adm?"最高等級":p>=8000?"積分夠了，可以申請出道":`積分到 8,000 就能申請出道`):"最高等級"}</small></div>`; }catch(e){ return ""; } }
/* 藝人帳號的等級：用藝人自己的積分收入（分潤後實得）算，出道後至少 R1 */
function artLevel(mid){ const me=(session()||{}).member===mid, p=Math.max(0,me?points():((pointsOf(mid)||{}).net||0)); let li=1,si=0; LV_TBL.forEach(([,th],i)=>th.forEach((v,j)=>{ if(p>=v&&i>=1){ li=i; si=j; } }));
  const nx=si+1<LV_TBL[li][1].length?[li,si+1]:li+1<LV_TBL.length?[li+1,0]:null; return {li,si,p,code:lvCode(li,si),name:["練習生","新人","新銳","人氣","實力","當紅","王牌","巨星","傳奇"][li],next:nx&&{code:lvCode(nx[0],nx[1]),need:Math.max(0,LV_TBL[nx[0]][1][nx[1]]-p)}}; }
function artLvLine(mid){ try{ const v=artLevel(mid); return `<div class="me-lv"><b>${v.code}</b><span>${v.name}</span><small>${fmt(v.p)} 積分・${v.next?`再 ${fmt(v.next.need)} 積分升到 ${v.next.code}`:"最高等級"}</small></div>`; }catch(e){ return ""; } }
function buyTie(mid,days,pts){
  if(points()<pts) return {type:"nopts"};
  S.set(K.points,points()-pts); if(pts) recordSale("tie",{mid,pts,label:`${WHISPER_NAME} 券・${MEMBERS[mid].name}（${days} 天）`});
  logSelf("whisper",mid,`你買了 ${WHISPER_NAME} 券・${artName(mid,"tie")}（${days} 天）`);
  const all=subs(), rec=all[mid], now=Date.now();
  if(rec&&now<=rec.expires+GRACE){            // 連續訂閱（含還沒到期就先續）
    rec.expires=Math.max(rec.expires,now)+days*DAY; S.set(K.tieSubs,all); return {type:"renew",days:subDays(mid)};
  }
  const periods=rec?rec.periods.map((p,i,a)=>i===a.length-1&&p.end==null?{...p,end:Math.max(rec.expires,rec.seenUntil||0)}:p):[];
  periods.push({start:now,end:null});
  all[mid]={since:now,expires:now+days*DAY,periods}; S.set(K.tieSubs,all);
  const c=S.get(K.tieCleared,{}); c[mid]=now-1; S.set(K.tieCleared,c);              // 舊紀錄先收起來
  const r=S.get(K.wRead,{}); r[mid]=now; S.set(K.wRead,r);
  const text=welcomeOf(mid);
  S.set(K.whispers,[...S.get(K.whispers,[]),{id:"wel"+now+Math.random().toString(36).slice(2,5),member:mid,from:"artist",welcome:true,to:myEmail(),text,ts:now+1}]);
  const m=MEMBERS[mid]; pushNotification({kind:"whisper",member:mid,group:m.group,text,color:null,direct:true});
  return {type:rec?"again":"new"};
}
/* 舊版「直接訂閱」資料轉成 TIE 券（保留原本看得到的對話） */
(function migrateSubs(){
  if(Object.keys(S.get(K.tieSubs,{})).length) return;
  const old=S.get(K.wSubs,{}), out={};
  Object.entries(old).forEach(([id,ts])=>{ out[id]={since:ts,expires:ts+30*DAY,periods:[{start:0,end:null}]}; });
  if(Object.keys(out).length) S.set(K.tieSubs,out);
})();
function fanRooms(){
  return Object.keys(subs()).filter(id=>MEMBERS[id]&&!roomHidden(id)).map(id=>{const msgs=fanRoom(id);return {id,last:msgs[msgs.length-1]||null,unread:roomUnread(id),active:isActive(id)}})
    .sort((a,b)=>(b.active-a.active)||((b.last?b.last.ts:0)-(a.last?a.last.ts:0)));
}
const fanWhisperUnread=()=>fanRooms().reduce((n,r)=>n+r.unread,0);
/* 藝人讀到哪裡：跟著帳號走（手機的 Safari 和主畫面 App、不同手機都一樣），不是只記在這支手機 */
const artReadK=()=>{ const e=myEmail(); return HB_ON&&e?K.wArtistRead+"@"+e:K.wArtistRead; };
const artReadGet=()=>Math.max(S.get(artReadK(),0)||0,artReadK()!==K.wArtistRead?(S.get(K.wArtistRead,0)||0):0);
const artReadSet=t=>{ const cur=S.get(artReadK(),0)||0; if(t-cur>60e3||getWhispers().some(w=>w.from!=="artist"&&w.ts>cur)) S.set(artReadK(),t); };
const artistWhisperUnread=mid=>{const last=artReadGet();return getWhispers().filter(w=>w.member===mid&&w.from!=="artist"&&w.ts>last).length};
function sendWhisper(memberId,text,replyId){
  const m=MEMBERS[memberId], wid="w"+Date.now(), rw=replyId&&getWhispers().find(x=>x.id===replyId);
  S.set(K.whispers,[...S.get(K.whispers,[]),{id:wid,member:memberId,from:"artist",text,ts:Date.now(),reply:rw?{text:rw.text,tr:rw.tr||""}:undefined}]);
  setTimeout(()=>tieOriginal(wid),0); if(rw) setTimeout(()=>tieRqShare(wid),1500);
  return feedPush({kind:"whisper",member:memberId,group:m.group,text:stkOf(text)?"傳了一張貼圖":text,color:null,direct:true},"tie:"+memberId);
}
function fanReply(memberId,text){
  S.set(K.whispers,[...S.get(K.whispers,[]),{id:"w"+Date.now(),member:memberId,from:"me",name:tieSet(memberId).nickname||ME.name,by:myEmail(),g:ME.g,ms:isMember(MEMBERS[memberId].group),text,ts:Date.now()}]);
  markRoomRead(memberId);
}

/* ===== 全站賽程（管理員 FOC 設定 → 藝人 FOC、粉絲 CORE 同步顯示） ===== */
const getSched=()=>{ const s={stage:"",deadline:"週日 23:59",notice:"接近開場會自動提醒全體藝人與粉絲",updatedAt:0,...S.get(K.sched,{})}; if(s.wk!==curWeek()) s.stage=autoWeekType(); return s; };
const STAGE_PRESETS=["宣傳週","排名週","打歌週"];
/* 演唱會燈海（規則）
   ・只有演唱會時才有燈海；演唱會由管理員（公司方）排日期時間，時間到自動開始、時間到自動結束
   ・演唱會進行中，那一團的藝人在 FOC 控燈（全場顏色、效果、指令）
   ・粉絲在 CORE 進演唱會：揮應援棒累積熱度、應援口號挑戰
   ・官方應援棒：SHOP 買，或是那一團的 Membership 會員直接擁有；沒有的話舉通用應援棒 */
const getConcerts=()=>S.get(K.concerts,[]).filter(c=>groupOf(c.gid)).sort((a,b)=>a.startTs-b.startTs);
const liveConcert=()=>{ const n=Date.now(); return getConcerts().find(c=>!c.ended&&c.startTs<=n&&c.endTs>n)||null; };
const nextConcert=gid=>{ const n=Date.now(); return getConcerts().find(c=>!c.ended&&c.startTs>n&&(!gid||c.gid===gid))||null; };
const lightsea=()=>{ const c=liveConcert()||(ui.lsDemo&&ui.lsDemo.endTs>Date.now()?ui.lsDemo:null); if(!c) return null;
  const ctl=S.get(K.lightsea,null); return {...(ctl&&ctl.cid===c.id?ctl:{}),...(c.setlist&&c.setlist.length?(()=>{ const tl=ccTimeline(c); return {play:tl&&tl.cur?{...tl.cur,ia:tl.ia}:null,tl}; })():{}),cid:c.id,gid:c.gid,title:c.title,ts:c.startTs,endTs:c.endTs,demo:!!c.demo}; };
const hasStick=gid=>owns(gid,"stick")||isMember(gid);
function saveConcerts(list){ S.set(K.concerts,list); }
function concertCreate({gid,title,startTs,mins,host,setlist,nIa}){
  const endTs=startTs+mins*60e3, clash=getConcerts().find(c=>!c.ended&&c.startTs<endTs&&c.endTs>startTs);
  if(clash) return {err:`跟「${groupOf(clash.gid).name}・${clash.title}」的時間重疊了`};
  const c={id:"cc"+Date.now(),gid,title,startTs,endTs,ended:false,notified:false,host:host||null,co:null,setlist:setlist||null,nIa:nIa||0}; saveConcerts([...S.get(K.concerts,[]),c]);
  const g=groupOf(gid); muNotify(`📣 ${g.name} 演唱會「${title}」${evWhen(startTs)} 開始，記得到 FEST 舉起應援棒！`,gid);
  return {c};
}
function concertTick(){   // 開演時通知粉絲；畫面上的狀態變了就重畫
  const list=S.get(K.concerts,[]), n=Date.now(); let ch=false;
  list.forEach(c=>{ if(!c.ended&&!c.notified&&c.startTs<=n&&c.endTs>n){ c.notified=true; ch=true; const g=groupOf(c.gid); if(g) muNotify(`✺ ${g.name} 演唱會「${c.title}」開始了！快到 CORE 加入燈海`,c.gid); } });
  if(ch) saveConcerts(list);
  const sig=(lightsea()||{}).cid||""; if(ui.lsSig===undefined) ui.lsSig=sig; if(sig!==ui.lsSig){ const was=ui.lsSig; ui.lsSig=sig;
    if(was&&!sig&&layer.querySelector(".concert2")){ concertOff(); toast("演唱會結束了，謝謝你的應援 💜"); }
    const r=route(), typing=/^(INPUT|TEXTAREA)$/.test((document.activeElement||{}).tagName||""); if(!typing&&!layer.innerHTML&&(r.tab==="core"||r.tab==="foc")&&!r.p){ const y=window.scrollY; render(); window.scrollTo(0,y); } }
}
setInterval(concertTick,4000);

/* ===== 直播與活動 ===== */
const getLives=()=>S.get(K.lives,[]);
const getLive=id=>getLives().find(l=>l.id===id);
const liveNow=mid=>getLives().find(l=>l.member===mid&&!l.endTs);
function saveLive(l){ S.set(K.lives,getLives().map(x=>x.id===l.id?l:x)); }
/* 舊的直播（還沒記住封面的）：從現在起固定用現在的頭貼，之後換頭貼不會再影響 */
function lvCvFreeze(){ try{ const L=getLives(); let ch=false; L.forEach(l=>{ if(l.cv||!MEMBERS[l.member]) return; const av=artProf(l.member).avatar||mPhoto(l.member); if(av&&/^https?:/.test(av)){ l.cv=av; ch=true; } }); if(ch) S.set(K.lives,L); }catch(e){} }
setTimeout(lvCvFreeze,8000);
function startLive(mid,title){
  const m=MEMBERS[mid];
  const pl=S.get(K.plans,[]).filter(p=>p.member===mid).sort((a,b)=>a.ts-b.ts)[0];   // 有預告的話：開播就把預告收掉
  if(pl) S.set(K.plans,S.get(K.plans,[]).filter(p=>p.id!==pl.id));
  const l={id:"lv"+Date.now(),member:mid,group:m.group,title:title||(pl&&pl.title)||"正在分享生活與音樂... ✨",startTs:Date.now(),endTs:null,hearts:0,msgs:[]};
  { const av=artProf(mid).avatar||mPhoto(mid); if(av&&/^https?:/.test(av)) l.cv=av; }
  { const bg=(S.get(K.bgm,{})[mid]||[]).filter(x=>x&&x.mid&&x.dur>0); if(bg.length){ l.bgm=bg; l.bgmOff=true; l.bgmAt=0; l.bgmT0=l.startTs; } }
  S.set(K.lives,[l,...getLives()]);
  const reminded=!!(pl&&pl.mine);   // 粉絲按過「提醒我」→ 收到專屬提醒（就算沒追蹤這團也會收到）
  const reached=feedPush({kind:"live",member:mid,group:m.group,text:l.title,liveId:l.id,color:null},"g:"+m.group);
  return {l,reached};
}
/* 直播預告：藝人公布 → 粉絲在 MEET「即將開播」按提醒我 */
const getPlans=()=>S.get(K.plans,[]).filter(p=>p.ts>Date.now()-30*60e3).sort((a,b)=>a.ts-b.ts);
function addPlan(mid,title,ts){ const m=MEMBERS[mid]; const p={id:"pl"+Date.now(),member:mid,group:m.group,title,ts,mine:false,count:0}; S.set(K.plans,[...S.get(K.plans,[]),p]); return p; }
function toggleRemind(id){ const list=S.get(K.plans,[]), p=list.find(x=>x.id===id); if(!p) return null; p.mine=!p.mine; p.count+=p.mine?1:-1; S.set(K.plans,list);
  if(p.mine) logSelf("live",p.member,`你設定了《${p.title}》的開播提醒 ⏰`); return p.mine; }
function delPlan(id){ S.set(K.plans,S.get(K.plans,[]).filter(p=>p.id!==id)); }
function endLive(id){ const l=getLive(id); if(l){ l.endTs=Date.now(); saveLive(l);} }
function liveSay(id,from,text,{reply=null,react=false,mid=null}={}){
  const l=getLive(id); if(!l||l.endTs) return;
  l.msgs.push(from==="me"?{from,name:ME.name,by:myEmail(),g:ME.g,text,ts:Date.now()}:{from,text,ts:Date.now(),...(reply?{reply}:{}),...(mid?{mid}:{})}); saveLive(l);
  if(from==="artist"&&reply&&reply.from==="me"&&reply.by) feedPush({kind:"live",member:l.member,group:l.group,text:`在直播中回覆了你：「${text}」`,liveId:l.id,color:null,direct:true,liveReply:true},"u:"+reply.by);
}



function liveLen(l){ const mm=Math.max(1,Math.round(((l.endTs||Date.now())-l.startTs)/60e3)); return mm<60?mm+" 分鐘":Math.floor(mm/60)+" 小時 "+(mm%60)+" 分"; }

const getEvents=()=>S.get(K.events,[]).sort((a,b)=>a.ts-b.ts);

function toggleReserve(id){
  const list=S.get(K.events,[]), ev=list.find(e=>e.id===id); if(!ev) return;
  ev.mine=!ev.mine; ev.count+=ev.mine?1:-1; S.set(K.events,list);
  if(ev.mine) logSelf("event",ev.member,`你預約了《${ev.title}》`,{eventId:ev.id,evKind:ev.kind});
  return ev.mine;
}
function deleteEvent(id){ S.set(K.events,S.get(K.events,[]).filter(e=>e.id!==id)); S.set(K.notifs,getNotifications().filter(n=>n.eventId!==id)); }
const WD=["日","一","二","三","四","五","六"];
function evWhen(ts){const t=new Date(ts);return `${t.getMonth()+1}/${t.getDate()}（${WD[t.getDay()]}）${pad(t.getHours())}:${pad(t.getMinutes())}`}
function evCountdown(ts){const d=ts-Date.now(); if(d<0) return "已結束"; const h=Math.floor(d/36e5); if(h<1) return "即將開始"; if(h<24) return h+" 小時後"; return "D-"+Math.ceil(d/864e5);}

/* ===== 管理員 ===== */
const getReports=()=>S.get(K.reports,[]).sort((a,b)=>b.ts-a.ts);
const openReports=()=>getReports().filter(r=>r.status==="open");
function reportComment(commentId,postId){
  const list=S.get(K.reports,[]), ex=list.find(r=>r.commentId===commentId&&r.status==="open");
  if(ex){ if(ex.mine) return false; ex.count++; ex.mine=true; }
  else list.push({id:"rp"+Date.now(),commentId,postId,reason:"粉絲檢舉",by:"me",mine:true,count:1,ts:Date.now(),status:"open"});
  S.set(K.reports,list); return true;
}
const reportedByMe=id=>S.get(K.reports,[]).some(r=>r.commentId===id&&r.mine);
function removeComment(commentId){
  const c=S.get(K.comments,[]).find(x=>x.id===commentId);
  S.set(K.comments,S.get(K.comments,[]).filter(x=>x.id!==commentId));
  if(c){ const posts=S.get(K.posts,[]), p=posts.find(x=>x.id===c.postId); if(p){p.comments=Math.max(0,p.comments-1);S.set(K.posts,posts)} }
}
function resolveReport(id,action){
  const list=S.get(K.reports,[]), r=list.find(x=>x.id===id); if(!r) return;
  if(action==="remove") removeReported(r);
  r.status=action==="remove"?"removed":"dismissed"; r.doneTs=Date.now(); S.set(K.reports,list);
}
function setHidden(postId,hidden){ const posts=S.get(K.posts,[]), p=posts.find(x=>x.id===postId); if(p){p.hidden=hidden;S.set(K.posts,posts)} }
/* 置頂公告：可以同時有好幾則，通知頁上方會輪播 */
const ANN_GONE="daisuki_ann_gone", PIN_HIDE="daisuki_pin_hide";   /* 撤下的公告／撤下置頂：記編號，別支手機同步回來的舊資料也不會再出現 */
const annGone=()=>S.get(ANN_GONE,{})||{};
const getAnns=()=>{ const G=annGone(); return S.get(K.anns,[]).filter(a=>!dbWipedTx(a)&&!G[a.id]).sort((a,b)=>b.ts-a.ts); };
(function migrateAnn(){ const old=S.get(K.announce,null); if(old&&!S.get(K.anns,[]).some(a=>a.id===old.id)){ S.set(K.anns,[old,...S.get(K.anns,[])]); } S.del(K.announce); })();

function publishAnnounce(text){
  const a={id:"an"+Date.now(),text,ts:Date.now()}; S.set(K.anns,[a,...S.get(K.anns,[])]);
  feedPush({kind:"system",text:text.slice(0,120),direct:true},"all"); return a;
}

/* ===== 留言 ===== */
const commentCount=postId=>S.get(K.comments,[]).filter(c=>c.postId===postId).length;
const getComments=postId=>S.get(K.comments,[]).filter(c=>c.postId===postId).sort((a,b)=>a.ts-b.ts);
function addComment(postId,text){
  const c={id:"c"+Date.now(),postId,author:"me",by:myEmail(),name:ME.name,g:ME.g,text,ts:Date.now(),reply:null};
  S.set(K.comments,[...S.get(K.comments,[]),c]);
  const posts=S.get(K.posts,[]), p=posts.find(x=>x.id===postId); if(p){p.comments++;S.set(K.posts,posts)}
  return c;
}
function replyComment(commentId,text){
  const list=S.get(K.comments,[]), c=list.find(x=>x.id===commentId); if(!c) return {};
  c.reply={text,ts:Date.now()}; S.set(K.comments,list);
  const p=S.get(K.posts,[]).find(x=>x.id===c.postId);
  let reached=false;
  if(c.author==="me"&&c.by) reached=feedPush({kind:"comment",member:p.member,group:p.group,text,postId:p.id,commentId:c.id,color:null,direct:true},"u:"+c.by);
  return {c,reached};
}
function deletePost(id){
  S.set(K.comments,S.get(K.comments,[]).filter(c=>c.postId!==id));
  S.set(K.posts,S.get(K.posts,[]).filter(p=>p.id!==id));
  S.set(K.notifs,getNotifications().filter(n=>n.postId!==id));
}
const likedSet=()=>new Set(S.get(K.likes,[]));
function toggleLike(id){
  const s=likedSet(); let KK=K.posts, posts=S.get(K.posts,[]), p=posts.find(x=>x.id===id); if(!p){ KK=K.fanPosts; posts=S.get(K.fanPosts,[]); p=posts.find(x=>x.id===id); } if(!p) return;
  const me=myEmail(), by=new Set(p.likedBy||[]);   // 多人版：記住是誰按的，人數才不會被同時按讚吃掉
  if(s.has(id)){s.delete(id);by.delete(me);p.likes=Math.max(0,(p.likes||0)-1)} else {s.add(id);by.add(me);p.likes=(p.likes||0)+1}
  p.likedBy=[...by]; p.likes=p.likedBy.length;
  S.set(K.likes,[...s]); S.set(KK,posts); return {liked:s.has(id),likes:likeN(p)};
}

/* ===== 時間顯示 ===== */
const pad=n=>String(n).padStart(2,"0");
function ago(ts){
  const d=Date.now()-ts, m=Math.floor(d/60e3);
  if(m<1) return "剛剛"; if(m<60) return m+" 分鐘前";
  const h=Math.floor(m/60); if(h<24) return h+" 小時前";
  const t=new Date(ts), y=new Date(); y.setDate(y.getDate()-1);
  if(t.toDateString()===y.toDateString()) return "昨天 "+pad(t.getHours())+":"+pad(t.getMinutes());
  return (t.getMonth()+1)+"/"+t.getDate();
}
const isToday=ts=>new Date(ts).toDateString()===new Date().toDateString();
const fmt=n=>n.toLocaleString("en-US");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ===== 圖示 ===== */
const I={
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  live:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="3"/><path d="m16 10 5-3v10l-5-3"/></svg>',
  whisper:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>',
  shop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  me:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>',
  verified:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 14.6 4.3 18 4l.7 3.3L21.7 9 20.3 12l1.4 3-3 1.7L18 20l-3.4-.3L12 22l-2.6-2.3L6 20l-.7-3.3L2.3 15 3.7 12 2.3 9l3-1.7L6 4l3.4.3z"/><path d="m8 12 3 3 5-6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  swap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg>',
  out:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h4v16h-4M10 17l5-5-5-5M15 12H3"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
};

