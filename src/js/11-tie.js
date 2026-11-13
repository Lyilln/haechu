/* HAECHU｜TIE 聊天室 */
/* =========================================================
   TIE 聊天室（從 NSY 的聊天室畫面搬過來，名稱改成 TIE）
   ========================================================= */
const TI={
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>',
  send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/></svg>',
  smile:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  bellOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M8.7 3.6A6 6 0 0 1 18 8c0 3 .5 5 1.2 6.3M17 17H3s3-1 3-8c0-.6.1-1.1.2-1.6M10 20a2 2 0 0 0 4 0M3 3l18 18"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  tag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8a1.4 1.4 0 0 1 0 2l-7 7a1.4 1.4 0 0 1-2 0z"/><circle cx="8" cy="8" r="1.2"/></svg>',
  lang:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h9M8.5 3v2M6 5c.8 3.5 3 6 6 7.5M11 5c-.8 3.5-3 6-6 7.5M13 21l4-9 4 9M14.5 18h5"/></svg>',
  grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
};
const TIE_COLORS=["#E6E6FA","#F0F8FF","#FFF0F5","#F5F5DC","#E0FFFF","#FFF5EE","#F8F8FF","#F0FFF0"];

/* 藝人顏色：原本的紫色＋四個 HAECHU 自己的顏色；ARTIST 徽章和頭貼外圈跟著換 */
const ART_COLORS=[["#8843FB","星夢紫"],["#F2649E","櫻花粉"],["#14B88A","薄荷綠"],["#F0565C","珊瑚紅"],["#B98A6E","奶茶棕"]];
const artColor=mid=>{ const c=artProf(mid).color; return ART_COLORS.some(x=>x[0]===c)?c:ART_COLORS[0][0]; };
/* 「團名・」：SOLOIST 團名就是自己，不重複寫 */
const gTag=g=>g&&!g.solo?esc(g.name)+"・":"";
const artBadge=mid=>`<span class="t-badge" style="background:${artColor(mid)}">ARTIST</span>`;
const tieAv=(m,cls="")=>`<div class="t-av ${cls}" style="background:${grad(m.g)};--ac:${artColor(midOf(m))}">${mAvIn(midOf(m),"tie")}</div>`;
const tieHeart=()=>`<span class="t-heart"><svg viewBox="0 0 24 24" width="15" height="15"><defs><radialGradient id="tieHG" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="#D8B4FE"/><stop offset="50%" stop-color="#8843FB"/><stop offset="100%" stop-color="#8A2BE2"/></radialGradient></defs><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#tieHG)"/></svg><i></i></span>`;
function tieBgLayer(st,cls="t-bgl"){
  if(st.bgMode==="photo"&&st.bgImage) return `<div class="${cls}" style="background:var(--bg,#16151B) center/cover no-repeat url('${st.bgImage}')"><img src="${st.bgImage}" alt="" decoding="sync"><span class="t-veil"></span></div>`;   /* 底色不用白的、照片直接當底：進聊天室不會先閃白 */
  if(st.bgMode==="color") return `<div class="${cls}" style="background:${st.bgColor}"></div>`;
  if(st.bgMode==="pattern") return `<div class="${cls} tp-${st.bgPattern}"></div>`;
  return thChatBg(cls)||`<div class="${cls} t-default"></div>`;
}

/* ---------- 聊天室列表 ---------- */
function viewTieList(){
  const q=srchQ("tie");
  let rooms=fanRooms().map(r=>({...r,st:tieSet(r.id)}));
  if(q) rooms=rooms.filter(r=>hit(q,r.st.chatName,MEMBERS[r.id].name,groupOf(MEMBERS[r.id].group).name,r.last&&r.last.text,r.last&&r.last.ko));
  const fav=rooms.filter(r=>r.st.fav), rest=rooms.filter(r=>!r.st.fav);
  const card=r=>{const m=MEMBERS[r.id];return `<button class="t-room ${r.active?"":"off"}" data-a="openChat" data-m="${r.id}">
      ${tieAv(m,"lg")}
      <div class="t-room-b"><div class="t-room-top"><span class="t-room-n"><b>${esc(r.st.chatName)}</b>${r.st.muted?`<span class="t-mute">${TI.bellOff}</span>`:""}${r.active?"":`<span class="t-exp">已到期</span>`}</span><span class="t-room-t">${r.last?ago(r.last.ts):""}</span></div>
        <p>${r.active?"":"TIE 券已到期・"}${r.last?(r.last.from==="me"?"你：":"")+(stkOf(r.last.ko||r.last.text)?"貼圖":esc((r.last.ko||r.last.text).split(NICK_TK).join(nickFor(r.id)))):"還沒有新訊息"}</p></div>
      ${r.unread?`<span class="t-cnt">${r.unread}</span>`:""}${r.st.fav?`<span class="t-fav">${TI.star}</span>`:""}
    </button>`};
  const all=fanRooms().length;
  return `<div class="t-glow" aria-hidden="true"></div><header class="t-lh sh-head">${srchOn("tie")?srchBar("搜尋聊天室或藝人名稱..."):`
      <div class="t-lh-side"><button data-a="shOpen" data-k="tie" aria-label="搜尋聊天室">${TI.search}</button></div><h1>${WHISPER_NAME}</h1>
      <div class="t-lh-side r"><button data-a="tListClear" aria-label="清除對話列表">${TI.trash}</button></div>`}
    </header>
    <main class="t-list">
      ${!all?`<div class="t-empty"><span class="t-empty-ico">${NAV.tie}</span><p>暫無任何 ${WHISPER_NAME} 對話</p><button class="t-pill" data-a="goSubs">前往 SHOP</button></div>`
      :!rooms.length?srchLabel("tie")+srchEmpty("聊天室")
      :`${srchLabel("tie")}${fav.length?`<span class="t-sec">我的最愛聊天室</span>${fav.map(card).join("")}`:""}
        ${rest.length?`<span class="t-sec">最近的聊天室</span>${rest.map(card).join("")}`:""}`}
    </main>`;
}

/* ---------- 聊天室 ---------- */
function viewTieRoom(member){
  setTimeout(()=>tieCeleCheck(member),350);
  const m=MEMBERS[member], st=tieSet(member), readTs=artistReadTs(member);
  const tr=new Set(S.get(K.tieTr,[]));
  const q=srchQ("tieroom");
  let msgs=fanRoom(member);
  if(q){ const since=(subs()[member]||{}).since||0; msgs=msgs.filter(w=>w.ts>=since&&hit(q,w.text,w.ko)); }
  else { const rec=subs()[member], cl=(S.get(K.tieCleared,{})[member])||0; if(rec){ const d=subDays(member);
    MILESTONES.filter(x=>x<=d).forEach(x=>{ const ts=rec.since+(x-1)*DAY+1; if(ts>cl&&ts<=Date.now()) msgs.push({anniv:x,ts,id:"an"+x}); }); msgs.sort((a,b)=>a.ts-b.ts); } }
  let lastDay="";
  const body=msgs.map(w=>{
    const d=dayLabel(w.ts); let sep=""; if(d!==lastDay){ sep=`<div class="t-day"><span>${d}</span></div>`; lastDay=d; }
    if(w.anniv) return sep+`<div class="t-anniv"><b>🎉 D+${w.anniv}</b><span>今天是你和 ${esc(artName(member,"tie"))} 的 ${w.anniv} 天紀念日</span><small>從今天起，每則訊息最多可以打 ${w.anniv} 字</small></div>`;
    if(w.from==="me"){
      const read=w.ts<=readTs;
      return sep+`<div class="t-me">
        <div class="t-meta">${read?"":`<button class="t-recall" data-a="tRecall" data-id="${w.id}" aria-label="收回訊息">${TI.trash}</button>`}<span>${read?"":`<em>1</em>`}${timeHM(w.ts)}</span></div>
        ${stkOf(w.text)?`<div class="t-b me t-stk" data-lp="${w.id}" data-stk="1">${stkImg(w.text)}</div>`:`<div class="t-b me" data-lp="${w.id}">${esc(w.text)}</div>`}</div>`;
    }
    const shown=w.ko||w.text;   // 藝人原文；開啟翻譯後按 A 會在下面顯示中文
    const lang=st.trLang||"zh", wel=w.welcome&&!w.kind&&!isZhText(w.text);   /* 歡迎語不是中文：跟藝人訊息一樣有 A，按了才顯示翻譯 */
    /* 引用的粉絲訊息不是中文：按 A 時一起翻（跟 Bubble 一樣，虛線下面紫字） */
    const tx=wel?welTr(w,lang):trText(w,lang), mainN=!stkOf(w.ko||w.text)&&(wel||w.ko||(!w.kind&&!isZhText(w.text))), rqN=!!(w.reply&&w.reply.text&&!isZhText(w.reply.text)), rqT=rqN?rqTrGet(w.id,lang):"", asked=tr.has(w.id),
      hasSrc=mainN||rqN; if(st.translate&&asked&&rqN&&!rqT) tieRqAuto(w.id,lang); const canTr=st.translate&&hasSrc&&!(asked&&(!mainN||tx)&&(!rqN||rqT)), showTr=st.translate&&mainN&&asked&&tx, showRq=st.translate&&rqN&&asked&&rqT;
    return sep+`<div class="t-art">${tieAv(m,"ring")}
      <div class="t-art-c"><div class="t-art-n">${st.badge?artBadge(member):""}<b>${esc(artName(member,"tie"))}</b>${w.milestone?`<span class="t-ms">🎉 ${w.milestone} 天紀念日</span>`:""}</div>
        ${w.reply?tieRq(showRq?{text:w.reply.text,tr:rqT}:w.reply,false,!showRq):""}<div class="t-bw">${w.kind?mediaBubble(w):stkOf(w.ko||w.text)?`<div class="t-b  t-stk" data-lp="${w.id}" data-stk="1">${stkImg(w.ko||w.text)}</div>`:`<div class="t-b" data-lp="${w.id}">${nickify(esc(shown),member)}${showTr?`<div class="t-tr">${nickify(esc(tx),member)}</div>`:""}</div>`}
          <span class="t-side">${canTr&&!w.kind?`<button class="t-abtn" data-a="tTranslate" data-id="${w.id}" aria-label="翻譯">A</button>`:""}<span class="t-tm">${timeHM(w.ts)}</span></span></div></div></div>`;
  }).join("");
  const days=subDays(member);
  const draft=ui.wDraft||"";
  return tieBgLayer(st)+`<header class="t-rh sh-head">
      ${srchOn("tieroom")?`<div class="t-rh-row sh-row">${srchBar("搜尋這個聊天室的訊息...")}</div>`:`<div class="t-rh-row"><button class="t-ib" data-a="back" aria-label="返回">${TI.back}</button>
        <h3>${esc(st.chatName)}</h3>
        <div class="t-rh-r"><button class="t-ib" data-a="shOpen" data-k="tieroom" aria-label="搜尋訊息">${TI.search}</button><button class="t-ib t-dots" data-a="tDrawer" aria-label="選單"><i></i><i></i></button></div></div>`}
      ${isActive(member)?`<div class="t-sub"><span class="t-sub-n">𝑇𝐼𝐸</span>${tieHeart()}<span>+${days||1}</span></div>`:`<button class="t-sub t-again" data-a="goSubs">💜 我們是不是可以再見呢？</button>`}
    </header>
    <main class="t-msgs" style="--trc:${artColor(midOf(member))}">${q?srchLabel("tieroom"):""}${body||(q?srchEmpty("訊息"):`<p class="t-none">還沒有訊息，等等${esc(st.chatName)}吧</p>`)}<div id="chat-end"></div></main>
    
    ${isActive(member)?(()=>{const q0=fanQuota(member).left===0;return `<form class="t-foot" id="wform"><div class="t-inp ${q0?"locked":""}" ${q0?'data-a="tQuota"':""}><textarea rows="1" class="ag" id="win" maxlength="${charLimit(member)}" autocomplete="off" ${q0?'readonly placeholder="輸入次數已用完"':'placeholder=""'} aria-label="輸入訊息">${q0?"":esc(draft)}</textarea><button type="button" class="t-smile ${ui.tieEmoji?"on":""}" data-a="tEmojiToggle" aria-label="表情符號">${TI.smile}</button></div>
      <button class="t-send ${draft.trim()?"on":""}" id="wsend" type="submit" aria-label="送出">${TI.send}</button></form>`})()
    :`<div class="t-foot t-expired-in" data-a="tExpired"><div class="t-inp off"></div><span class="t-send">${TI.send}</span></div>`}`;
}
function openTieDrawer(member){
  const m=MEMBERS[member], st=tieSet(member);
  setLayer(`<div class="t-drawer-w" data-a="tCloseLayer"><aside class="t-drawer" role="dialog" aria-label="聊天室選單">
    <header><button class="${st.muted?"on":""}" data-a="tMute" data-m="${member}" aria-label="${st.muted?"開啟通知":"關閉通知"}">${st.muted?TI.bellOff:TI.bell}</button>
      <button class="${st.fav?"on fav":""}" data-a="tFav" data-m="${member}" aria-label="我的最愛">${TI.star}</button></header>
    <div class="t-dw-b">
      <div class="t-acc"><span class="t-me-av">me</span><b>${esc(nickFor(member))}</b></div>
      <button class="t-acc t-acc-art" data-a="artProfOpen" data-m="${member}">${tieAv(m,"")}<div>${artBadge(member)}<b>${esc(artName(member,"tie"))}</b></div></button>
      <button class="t-box" data-a="tBox">${TI.tag}<b>${WHISPER_NAME} BOX</b></button>
    </div>
    ${isActive(member)?"":`<button class="t-leave" data-a="tLeave" data-m="${member}">離開聊天室 <span>→</span></button>`}
    <footer><button data-a="tGallery" data-m="${member}" aria-label="照片・影片">${TI.grid}</button><button data-a="tToSettings" data-m="${member}" aria-label="聊天室設定">${TI.gear}</button></footer>
  </aside></div>`,"drawer");
  const dw=layer.querySelector(".t-drawer-w"); if(dw&&dw.classList.contains("static")) dw.classList.add("open"); else requestAnimationFrame(()=>{const d=layer.querySelector(".t-drawer-w"); if(d) d.classList.add("open");});
}
function tieModal(title,text,buttons,cls=""){ cls=String(cls).replace(/\brow\b/,"mrow");   /* 「row」會撞到全域的 .row 樣式 */
  setLayer(`<div class="t-modal-w" data-a="tCloseLayer"><div class="t-modal ${cls}" role="dialog" aria-label="${esc(title||"提示")}">
    ${title?`<h3>${title}</h3>`:""}${text?`<p>${text}</p>`:""}<div class="t-mb">${buttons}</div></div></div>`,"modal");
}
/* ===== TIE 照 Bubble 對標：紀念日全螢幕、第一次傳訊息要同意、系統樣式的選單 ===== */
/* 粉絲名（每團不一樣，管理員在「藝人與團管理」改）；沒填就顯示 my */
   /* 粉絲名還沒設定：顯示 𝐹𝑎𝑛 */
/* 這一段 TIE 券的開始時間（第一次買、或斷掉後重新買，都算新的一段） */
const tiePeriod=member=>{ const r=subs()[member]; if(!r) return 0; const p=(r.periods||[]).slice(-1)[0]; return p&&p.start||r.since||0; };
/* iOS 系統樣式：底部選單、置中提示框 */
/* 下拉面板：抓上面的小灰槓（或標題）往上拉＝展開到全螢幕、往下拉＝關掉，跟 IG 一樣 */
{ let D=null; const sheetOf=t=>t.closest&&t.closest(".snsh-gr,.sn-grab,.snsh-t,.sn-sht")&&t.closest(".snsh,.sn-sh");
  document.addEventListener("pointerdown",e=>{ const sh=sheetOf(e.target); if(!sh) return; D={sh,y0:e.clientY,t0:Date.now(),h0:sh.getBoundingClientRect().height,ex:sh.matches(".snsh.big,.snsr"),dy:0}; sh.style.transition="none"; try{ e.target.setPointerCapture(e.pointerId); }catch(er){} },{passive:true});
  document.addEventListener("pointermove",e=>{ if(!D) return; const dy=e.clientY-D.y0; D.dy=dy; if(dy<0&&D.ex&&!D.sh.classList.contains("full")){ D.sh.style.height=Math.min(innerHeight*.92,D.h0-dy)+"px"; D.sh.style.transform=""; } else if(dy>0){ D.sh.style.transform=`translateY(${dy}px)`; } },{passive:true});
  const end=()=>{ if(!D) return; const {sh,dy,t0,ex}=D; D=null; sh.style.transition=""; const fast=dy/Math.max(1,Date.now()-t0)>.6;
    if(dy>110||(dy>30&&fast)){ sh.style.transform="translateY(100%)"; const w=sh.parentElement; setTimeout(()=>{ if(w&&w.isConnected) w.click(); },220); return; }
    sh.style.transform=""; if(ex&&dy<-50){ sh.style.height=""; sh.classList.add("full"); } else sh.style.height=""; };
  document.addEventListener("pointerup",end); document.addEventListener("pointercancel",end); }
/* 限動按愛心：IG 那種幾顆小愛心往上飄 */
function snFlyHearts(btn){ try{ const r=btn.getBoundingClientRect(); for(let k=0;k<6;k++){ const h=document.createElement("i"); h.className="sn-fly"; h.innerHTML=si("heart"); h.style.left=(r.left+r.width/2-14)+"px"; h.style.top=(r.top-6)+"px"; h.style.setProperty("--dx",(Math.random()*90-45).toFixed(0)+"px"); h.style.setProperty("--rt",(Math.random()*50-25).toFixed(0)+"deg"); h.style.animationDelay=(k*70)+"ms"; document.body.appendChild(h); setTimeout(()=>h.remove(),1500+k*70); } }catch(e){} }
/* 限動回覆：開始打字才出現快速表情（跟 IG 一樣）；放開時晚一點收，點表情才點得到 */
document.addEventListener("focusin",e=>{ const w=e.target.matches&&e.target.matches("textarea")&&e.target.closest(".sn-sre"); if(w){ clearTimeout(w._tt); w.classList.add("typing"); } });
document.addEventListener("focusout",e=>{ const w=e.target.closest&&e.target.closest(".sn-sre"); if(w){ clearTimeout(w._tt); w._tt=setTimeout(()=>{ if(!w.contains(document.activeElement)) w.classList.remove("typing"); },400); } });
/* 照片還沒下載好：先顯示 IG 那種灰色流光，下載好就停 */
document.addEventListener("load",e=>{ const el=e.target; if(el&&el.tagName==="IMG"&&el.classList.contains("sn-img")){ const w=el.closest(".sn-sl,.sn-grid button,.sn-colth"); if(w) w.classList.add("ok"); } },true);
/* SNS 專用：跟 IG 一樣從下面拉上來的面板（上面一條小橫槓、選項分組、每行左邊有圖示、刪除和檢舉是紅字）
   groups：[[ [文字, 動作, 屬性, {ic:圖示, red:紅字, on:打勾}] , ... ], ...] */
function snSheet(groups,{title=""}={}){ const G=groups.filter(g=>g&&g.length);
  setLayer(`<div class="snsh-w" data-a="tCloseLayer"><div class="snsh" data-a="snMiNo" role="dialog"><i class="snsh-gr"></i>${title?`<b class="snsh-t">${esc(title)}</b>`:""}${G.map(g=>`<div class="snsh-g">${g.map(([label,act,attrs,o])=>{ o=o||{}; return `<button class="snsh-r ${o.red?"red":""}" data-a="${act}" ${attrs||""}>${o.ic?si(o.ic):""}<span>${label}</span>${o.on?`<em>${si("check")}</em>`:""}</button>`; }).join("")}</div>`).join("")}</div></div>`,"ios");
  requestAnimationFrame(()=>{ const w=layer.querySelector(".snsh-w"); if(w) w.classList.add("open"); }); }
function iosSheet(items,{cancel="取消",stack=false}={}){
  /* stack：疊在目前的頁面上面（例如貼文頁裡的管理選單），取消只關選單，貼文頁還在 */
  if(stack&&layer.firstElementChild&&!layer.firstElementChild.matches(".ios-w,.t-modal-w")){ layer.querySelectorAll(".ios-w.stk").forEach(x=>x.remove()); layer.insertAdjacentHTML("beforeend",`<div class="ios-w stk" data-a="iosStkX"><div class="ios-sh" role="dialog"><div class="ios-g">${items.map(([label,act,attrs])=>`<button data-a="${act}" ${attrs||""}>${label}</button>`).join("")}</div><button class="ios-c" data-a="iosStkX">${cancel}</button></div></div>`); return; }
  setLayer(`<div class="ios-w" data-a="tCloseLayer"><div class="ios-sh" role="dialog"><div class="ios-g">${items.map(([label,act,attrs])=>`<button data-a="${act}" ${attrs||""}>${label}</button>`).join("")}</div><button class="ios-c" data-a="tCloseLayer">${cancel}</button></div></div>`,"ios"); }
function iosAlert(title,body,btns,extra=""){ setLayer(`<div class="ios-w al"><div class="ios-al" role="alertdialog">${title?`<h3>${title}</h3>`:""}${body?`<p>${body}</p>`:""}${extra}<div class="ios-ab">${btns}</div></div></div>`,"iosal"); }
/* 紀念日全螢幕：剛訂閱（第 1 天）出現蛋糕「1」，之後的紀念日出現藝人＋粉絲頭像和 D+天數 */
const CELE_DAYS=[10,...MILESTONES];
const CAKE=`<svg class="cele-cake" viewBox="0 0 200 230" aria-hidden="true"><path d="M58 150h84l-14 72H72z" fill="#F7D8B5"/><path d="M70 152 78 220M86 152 90 220M100 152v68M114 152 110 220M130 152 122 220" stroke="#E8BF94" stroke-width="2"/>
  <path d="M40 150c-10-2-14-22 4-28 0-20 22-26 30-14 6-16 32-18 38-2 14-10 36-2 34 16 18 2 20 26 4 28z" fill="#fff"/>
  <path d="M92 28h12v118H92z" fill="#E85D9C"/><path d="M80 40l14-12v14z" fill="#E85D9C"/><circle cx="98" cy="50" r="2" fill="#FFE27A"/><circle cx="96" cy="78" r="2" fill="#FFE27A"/><circle cx="100" cy="104" r="2" fill="#FFE27A"/><circle cx="86" cy="42" r="1.6" fill="#FFE27A"/>
  <path class="cele-flame" d="M98 4c8 8 9 16 0 22-9-6-8-14 0-22z" fill="#FF8A2B"/><path d="M98 12c3 4 3 8 0 11-3-3-3-7 0-11z" fill="#FFE27A"/>
  <circle cx="60" cy="132" r="2" fill="#4FD1C5"/><circle cx="130" cy="138" r="2" fill="#FFD166"/><path d="M118 124l4-3M72 124l-2 4M140 126l3 3M84 138l3-3" stroke="#F472B6" stroke-width="2.4" stroke-linecap="round"/><path d="M110 132l4 4M70 140l-3 3" stroke="#60A5FA" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M120 140l2.4 5 5 .6-3.8 3.4 1 5-4.6-2.6-4.6 2.6 1-5-3.8-3.4 5-.6z" fill="#8B6F5E"/><path d="M48 136c0-3 4-5 6-2 2-3 6-1 6 2 0 4-6 7-6 7s-6-3-6-7z" fill="#C7AEFF"/></svg>`;
function tieCeleCheck(member){ if(layer.innerHTML||!isActive(member)) return; const rec=subs()[member]; if(!rec) return;
  const seen=S.get(K.tieCele,{}), per=tiePeriod(member), d=subDays(member);
  let key=`${member}|new|${per}`, kind="new";
  if(seen[key]||Date.now()-per>DAY){ if(!CELE_DAYS.includes(d)) return; key=`${member}|d${d}|${rec.since}`; kind="day"; if(seen[key]) return; }
  seen[key]=Date.now(); S.set(K.tieCele,seen); showCele(member,kind,d); }
function showCele(member,kind,d){ const m=MEMBERS[member];
  const hearts=Array.from({length:14},(_,i)=>`<i style="--x:${(i*37)%100}%;--d:${(i%5)*.6}s;--c:${["#F9A8D4","#C7AEFF","#93C5FD","#FDE68A","#86EFAC"][i%5]}"></i>`).join("");
  setLayer(`<div class="cele" data-a="celeClose" role="dialog" aria-label="紀念日"><div class="cele-h">${hearts}</div>
    <div class="cele-t"><span class="cele-sp a"></span><b class="cele-hp">💗 HAPPY 💗</b><em class="cele-br">${WHISPER_NAME}</em><span class="cele-an"><i>๑</i> ANNIVERSARY <i>๑</i></span></div>
    ${kind==="new"?CAKE:`<div class="cele-avs">${tieAv(m,"cele-av")}<span class="cele-me">${cmAvatar(m.group,"big")}</span></div><b class="cele-d">D+${d}</b>`}
  </div>`,"cele");
  clearTimeout(ui.celeT); ui.celeT=setTimeout(()=>{ const c=layer.querySelector(".cele"); if(c) layer.innerHTML=""; },5200); }
/* 第一次（或斷掉後重新訂閱）點輸入框：先同意規範 */
const tieAgreed=member=>(S.get(K.tieAgree,{}))[member]===tiePeriod(member);
function openTieAgree(member,enter){ const nm="ARTIST";   /* 照 Bubble：同意視窗不寫藝人的名字，一律寫 ARTIST */   /* 進聊天室只問一次：隱私＋發訊息規範合在一起 */
  tieModal(`進入 ${nm} 的 TIE`,`・請不要截圖或錄影外流聊天室的內容。<br>・發送損害 ${nm} 名譽或侵犯私生活的訊息，會被限制使用，並可能負法律責任。`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="tAgree" data-m="${member}"${enter?' data-v="enter"':""}>我同意</button>`,"mrow"); }
/* 選擇 ARTIST：同一團裡換一位收訊息的成員；一段 TIE 券期間只能換 1 次 */
/* ---------- TIE 券：獨立頁面（像 bubble）→ 購買使用券 → 選擇 ARTIST ---------- */
const TIE_PEND="daisuki_tie_pend";   /* 買了、還沒選藝人的券：{gid:{n,ts,days}} */
const tiePl=()=>PLANS.find(x=>x.id===ui.tstPlan)||PLANS.find(x=>x.id==="d30");   /* 訂閱長度：7 天／30 天／365 天 */
const tieUnit=(gid,pl)=>groupArtists(gid).every(tieFree)?0:(pl||tiePl()).pts;
const tieBundle=(gid,n,pl)=>{ const u=tieUnit(gid,pl), full=u*n; return {full,pts:n<2?full:Math.round(full*(1-Math.min(.2,.04*(n-1)))/100)*100}; };
const tiePrice=(gid,n)=>{ const b=tieBundle(gid,n), pl=tiePl(); return `${b.pts<b.full?`<s>${fmt(b.full)}</s>`:""}<b>${b.pts?fmt(b.pts):"免費"}</b>${b.pts?`<small>積分/${pl.name.replace(/\s/g,"")}</small>`:""}`; };
const tiePlChips=()=>`<div class="tst-pl" role="tablist" aria-label="訂閱長度">${PLANS.map(x=>`<button class="${tiePl().id===x.id?"on":""}" data-a="tstPlan" data-v="${x.id}">${x.name}</button>`).join("")}</div>`;
const tieTk=(gid,n)=>groupArtists(gid).length>1?`${n} Ticket${n>1?"s":""}`:"Ticket";
const tieHero=gid=>{ const A=groupArtists(gid), g=groupOf(gid); return gPhoto(gid)||(A.length===1&&((typeof mPhoto==="function"&&mPhoto(A[0]))||artProf(A[0]).avatar))||""; };
const tieTop=(t)=>`<header class="tst-h"><button class="tst-ib" data-a="${t==="buy"?"tstBack":"tCloseLayer"}" aria-label="返回">${TI.back}</button><b>${t==="buy"?"購買使用券":esc(WHISPER_NAME)}</b><button class="tst-ib" data-a="tCloseLayer" aria-label="關閉">${XI}</button></header>`;
const tiePend=gid=>(S.get(TIE_PEND,{})||{})[gid]||null;
function tieStore(gid,more){ const g=groupOf(gid); if(!g) return; if(isSelfGid(gid)){ toast(selfBuyMsg()); return; }
  const A=groupArtists(gid), solo=A.length===1;
  if(!solo&&(tiePend(gid)||{}).n){ layer.innerHTML=""; ui.pickSet=null; navTo("#/fan/tiepick?id="+encodeURIComponent(gid)); return; }
  const hero=tieHero(gid), nm=solo?MEMBERS[A[0]].name:g.name, N=solo?1:(more?A.length:1);
  ui.tst={gid,more:!!more};
  setLayer(`<div class="tst">${tieTop("store")}<div class="tst-b">${hero?`<div class="tst-hero" style="background-image:url('${esc(hero)}')"></div>`:`<div class="tst-hero ph" style="background:${grad(g.g)}"><span>${esc(nm)}</span></div>`}
    <section class="tst-s"><h2>${esc(nm)}</h2><p class="tst-d">每天都有讓人心動的訊息！<br>只屬於你和喜歡的藝人之間的悄悄話 - ${esc(WHISPER_NAME)}</p>
      <h4>ARTIST陣容</h4><p class="tst-ar">${A.map(id=>esc(String(MEMBERS[id].name).toUpperCase())).join(", ")}</p>
      <h4>訂閱長度</h4>${tiePlChips()}
      ${Array.from({length:N},(_,i)=>`<div class="tst-c"><b>${tieTk(gid,i+1)}</b><span class="tst-p">${tiePrice(gid,i+1)}</span></div>`).join("")}
      ${!solo&&!more?`<button class="tst-more" data-a="tstMore">更多</button>`:""}</section>
    <section class="tst-n"><h4>Introduction</h4><p>${esc(WHISPER_NAME)} 是讓粉絲收到藝人私訊的服務。藝人傳來的訊息只有你看得到，你也可以回覆。</p></section></div>
    <footer class="tst-f"><button data-a="tstBuy">購買使用券</button></footer></div>`,"tst"); }
function tieBuyPage(gid){ const g=groupOf(gid), A=groupArtists(gid), solo=A.length===1, nm=solo?MEMBERS[A[0]].name:g.name, open=ui.tstNote!==false;
  setLayer(`<div class="tst">${tieTop("buy")}<div class="tst-b"><section class="tst-s tst-bl">${tiePlChips()}${Array.from({length:solo?1:A.length},(_,i)=>`<div class="tst-c buy"><span><b>${esc(nm)}</b><em>${tieTk(gid,i+1)}</em></span><button class="tst-pb" data-a="tstPay" data-v="${i+1}">購買</button><span class="tst-p">${tiePrice(gid,i+1)}</span></div>`).join("")}</section>
    <section class="tst-nt"><button class="tst-nh" data-a="tstNote" aria-expanded="${open}">付款相關注意事項<i class="${open?"up":""}">${TI.back}</i></button>${open?`<h4>服務注意事項</h4><p>・${esc(WHISPER_NAME)} 透過訊息和藝人互動，但不保證藝人傳訊息的時間、頻率或一定會傳；藝人會依自己的狀況不定時傳送。</p><p>・購買後要先選擇想收到訊息的 ARTIST，選好才會開始。使用券使用期間只能更改 1 次藝人，使用券更新後會重新計算。</p><p>・購買使用的是 App 內的積分，不會另外收費。</p>`:""}</section></div></div>`,"tst"); }
function tiePay(gid,n){ const A=groupArtists(gid), pl=tiePl(), ownL=A.filter(id=>{ const st=passStatus(id); return st&&st.cls!=="off"; }), own=ownL.length;
  if(A.length===1&&(tiePend(gid)||{}).n){ tpkBuyDone(gid,[A[0]]); return; }   /* 之前付過、還沒設定暱稱：不用再付一次 */
  if(own+n>A.length){ if(n!==own){ toast(own===A.length?`續訂請選 ${own} Ticket${own>1?"s":""}`:`你已經訂閱 ${own} 位，續訂請選 ${own} Ticket${own>1?"s":""}，或加買最多 ${A.length-own} 張`); return; }
    const b=tieBundle(gid,n); if(points()<b.pts){ toast("積分不足，先補充積分吧"); return; }   /* 續訂：已經訂閱的每一位都延長選的天數 */
    S.set(K.points,points()-b.pts); if(b.pts) recordSale("tie",{mid:A[0],pts:b.pts,label:`${WHISPER_NAME} 券・${groupOf(gid).name}（續訂 ${tieTk(gid,n)}・${pl.name}）`});
    ownL.forEach(id=>buyTie(id,pl.days,0)); layer.innerHTML=""; render(); toast(`已續訂 ${ownL.map(id=>MEMBERS[id].name).join("、")} 的 ${WHISPER_NAME}（${pl.name}）💜`); return; }
  const b=tieBundle(gid,n); if(points()<b.pts){ toast("積分不足，先補充積分吧"); return; }
  S.set(K.points,points()-b.pts); if(b.pts) recordSale("tie",{mid:A[0],pts:b.pts,label:`${WHISPER_NAME} 券・${groupOf(gid).name}（${tieTk(gid,n)}・${pl.name}）`});
  const P=S.get(TIE_PEND,{}); P[gid]={n:((P[gid]||{}).n||0)+n,ts:Date.now(),days:pl.days}; S.set(TIE_PEND,P);
  if(A.length===1){ tpkBuyDone(gid,[A[0]]); return; }
  layer.innerHTML=""; ui.pickSet=null; navTo("#/fan/tiepick?id="+encodeURIComponent(gid)); }
/* 選好藝人：開始訂閱；第一次訂閱要先設定暱稱（下面滑上來的半版面板） */
function tieNickSheet(gid,ids){ ui.tpkNickFor={gid,ids}; const m=MEMBERS[ids[0]];
  setLayer(`<div class="scrim" data-a="tCloseLayer"><div class="sheet tpk-ns" role="dialog" aria-label="你的暱稱"><div class="grab"></div>
    <div class="buy-h"><div class="av" style="background:${grad(m.g)}">${mAvIn(ids[0],"tie")}</div><div><h3>${ids.length>1?ids.map(id=>esc(MEMBERS[id].name)).join("・"):esc(m.name)}</h3><p>設定藝人在訊息裡叫你的名字</p></div></div>
    <label class="buy-nick"><span>你的暱稱</span><input id="tpkNick" maxlength="12" placeholder="輸入文字" autocomplete="off"></label>
    <button class="btn btn-main btn-block" data-a="tpkNickOk">開始 ${esc(WHISPER_NAME)}</button></div></div>`,"buy"); }
function tpkBuyDone(gid,ids){ const need=ids.some(id=>!(S.get(K.tieSet,{})[id]||{}).nickname);
  if(need&&!ui.tpkNick){ tieNickSheet(gid,ids); return; }
  const days=(tiePend(gid)||{}).days||30, nick=ui.tpkNick; ui.tpkNick=null; ids.forEach(id=>{ if(nick&&!(S.get(K.tieSet,{})[id]||{}).nickname) saveTieSet(id,{nickname:nick}); buyTie(id,days,0); });
  const P=S.get(TIE_PEND,{}); delete P[gid]; S.set(TIE_PEND,P); ui.pickSet=null; layer.innerHTML="";
  toast(`已開始訂閱 ${ids.map(id=>MEMBERS[id].name).join("、")} 的 ${WHISPER_NAME} 💜`); ui.srch=null; ui.tieEmoji=false; ui.scrollChat=true; location.replace("#/fan/chat?m="+ids[0]);
  { const m1=ids[0]; if(!S.get(K.tieNotice,false)||(isActive(m1)&&!tieAgreed(m1))) setTimeout(()=>openTieAgree(m1,true),250); } }
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a, T=ui.tst;
  if(a==="tstMore"&&T){ e.stopImmediatePropagation(); const y=(layer.querySelector(".tst-b")||{}).scrollTop||0; tieStore(T.gid,true); const b=layer.querySelector(".tst-b"); if(b) b.scrollTop=y; return; }
  if(a==="tstPlan"&&T){ e.stopImmediatePropagation(); ui.tstPlan=t.dataset.v; const y=(layer.querySelector(".tst-b")||{}).scrollTop||0; if(layer.querySelector(".tst-bl")) tieBuyPage(T.gid); else tieStore(T.gid,T.more); const b=layer.querySelector(".tst-b"); if(b) b.scrollTop=y; return; }
  if(a==="tstBuy"&&T){ e.stopImmediatePropagation(); tieBuyPage(T.gid); return; }
  if(a==="tstBack"&&T){ e.stopImmediatePropagation(); tieStore(T.gid,T.more); return; }
  if(a==="tstNote"&&T){ e.stopImmediatePropagation(); ui.tstNote=ui.tstNote===false; tieBuyPage(T.gid); return; }
  if(a==="tstPay"&&T){ e.stopImmediatePropagation(); tiePay(T.gid,+t.dataset.v); return; }
  if(a==="tpkNickOk"){ e.stopImmediatePropagation(); const i=document.getElementById("tpkNick"), v=(i&&i.value||"").trim(); if(!v){ toast("請先設定你的暱稱"); if(i) i.focus(); return; } if(nameBlock(v)) return; const f=ui.tpkNickFor; ui.tpkNickFor=null; ui.tpkNick=v; layer.innerHTML=""; if(f) tpkBuyDone(f.gid,f.ids); return; }
},true);
/* 數學斜體（𝑚𝑦 設定 那種字）：英文字母換成斜體，其他字不動 */
const mathIt=v=>String(v||"").replace(/[A-Za-z]/g,c=>{ if(c==="h") return "ℎ"; const o=c.charCodeAt(0); return String.fromCodePoint(o<97?0x1D434+o-65:0x1D44E+o-97); });
const fanNmIt=gid=>mathIt(((S.get(K.fandom,{}))[gid]||"").trim()||"fan");
const tpkK=gid=>groupArtists(gid).filter(isActive).length+((S.get(TIE_PEND,{})[gid]||{}).n||0);
function viewTiePick(member){ return tpkView(MEMBERS[member].group,"swap",member); }
function tpkView(gid,mode,from){ const g=groupOf(gid), ms=groupArtists(gid), own=ms.filter(id=>isActive(id)), k=mode==="new"?tpkK(gid):own.length;
  if(!Array.isArray(ui.pickSet)||ui.pickG!==gid){ ui.pickSet=[...own]; ui.pickG=gid; } const sel=ui.pickSet;
  const heart='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/></svg>';
  return `<div class="tpk"><header class="tpk-h"><button class="t-ib" data-a="back" aria-label="返回">${TI.back}</button><b>選擇 ARTIST <span>${sel.length}/${k}</span></b><button class="tpk-ok" data-a="tPickSave" data-g="${gid}" data-mode="${mode}" data-m="${from||""}">儲存</button></header>
    <main class="tpk-b"><h2>${esc(g.name)}</h2><p>請選擇 ${k} 名希望收到訊息的 ARTIST。</p>
      <div class="tpk-g">${ms.map(id=>`<button class="${sel.includes(id)?"on":""}" data-a="tPickSel" data-v="${id}" data-g="${gid}" data-mode="${mode}"><span>${tieAv(MEMBERS[id],"tpk-av")}${sel.includes(id)?`<i>${heart}</i>`:""}</span><b>${esc(String(MEMBERS[id].name).toUpperCase())}</b></button>`).join("")}</div></main>
    <footer class="tpk-f"><span class="tpk-l"><em>${esc(fanNmIt(gid))}</em> 設定 <small>${sel.length}/${k}</small></span><div class="tpk-ms">${sel.map(id=>`<div class="tpk-me">${tieAv(MEMBERS[id],"tpk-sm")}<button data-a="tPickSel" data-v="${id}" data-g="${gid}" data-mode="${mode}" aria-label="取消選擇">${XI}</button><b>${esc(String(MEMBERS[id].name).toUpperCase())}</b></div>`).join("")}</div></footer></div>`; }
/* 更換藝人：按「儲存」後再確認一次（勾了「不再顯示」就直接換） */
function openPickNotice(go){ ui.pickGo=go||null; if(go&&S.get(K.pickNoShow,false)){ ui.pickGo=null; go(); return; } setLayer(`<div class="ios-w al"><div class="ios-al tpk-al" role="alertdialog"><p>使用券使用期間只允許更改<br>1次藝人。</p><p>使用券更新後將初始化該限<br>制。</p><label class="ios-ck"><input type="checkbox" id="pickNo"><span>不再顯示</span></label><div class="ios-ab"><button data-a="pickMore">詳細查看</button><button data-a="pickClose">關閉</button></div></div></div>`,"iosal"); }
/* 變更背景顏色：上面預覽（一開始用現在的聊天室背景），下面選顏色／圖案 */
const BG_COLORS=["#F9DCE2","#F8D0D8","#F3EBDC","#FAE6CF","#DAEEF2","#C9DFF2","#C5D5FD","#B9B8E8","#D3EDD2","#B7E0B6","#ECECEC","#E3DAF2"];
function viewTieBgColor(member){ const st=tieSet(member), pk=ui.bgPick, tab=ui.bgcTab||"color", pv=pk?{...st,bgMode:pk.mode,bgColor:pk.mode==="color"?pk.v:st.bgColor,bgPattern:pk.mode==="pattern"?+pk.v:st.bgPattern}:st;
  return `<div class="bgc"><header class="tpk-h"><button class="t-ib" data-a="back" aria-label="返回">${TI.back}</button><b>變更背景顏色</b><button class="tpk-ok ${pk?"on":""}" data-a="tBgcOk" data-m="${member}" ${pk?"":"disabled"}>確認</button></header>
    <div class="bgc-pv">${tieBgLayer(pv,"bgc-bg")}<div class="bgc-me"><span class="bgc-t">${timeHM(Date.now())}</span><span class="bgc-b me">這個怎麼樣??</span></div>
      <div class="bgc-ot">${defAv("sm")}<div><b>${esc(APP_NAME)}</b><span class="bgc-row"><span class="bgc-b">超適合的!</span><span class="bgc-t">1<br>${timeHM(Date.now())}</span></span></div></div></div>
    <section class="bgc-sh"><nav><button class="${tab==="color"?"on":""}" data-a="bgcTab" data-v="color">顏色</button><button class="${tab==="pattern"?"on":""}" data-a="bgcTab" data-v="pattern">圖案</button></nav>
      <div class="bgc-g">${tab==="color"?BG_COLORS.map(c=>`<button class="${pk&&pk.mode==="color"&&pk.v===c?"on":""}" style="background:${c}" data-a="bgcPick" data-mode="color" data-v="${c}" aria-label="顏色"></button>`).join("")
        :Array.from({length:12},(_,i)=>i+1).map(n=>`<button class="tp-${n} ${pk&&pk.mode==="pattern"&&+pk.v===n?"on":""}" data-a="bgcPick" data-mode="pattern" data-v="${n}" aria-label="圖案 ${n}"></button>`).join("")}</div></section></div>`; }
/* 換照片背景：裁完先看預覽（跟換顏色一樣），按「確認」才換 */
function openBgPreview(img,okAct,m){ ui.bgPv=img;
  setLayer(`<div class="bgc bgc-ov"><header class="tpk-h"><button class="t-ib" data-a="tCloseLayer" aria-label="返回">${TI.back}</button><b>變更背景</b><button class="tpk-ok on" data-a="${okAct}" data-m="${esc(m||"")}">確認</button></header>
    <div class="bgc-pv">${tieBgLayer({bgMode:"photo",bgImage:img},"bgc-bg")}<div class="bgc-me"><span class="bgc-t">${timeHM(Date.now())}</span><span class="bgc-b me">這個怎麼樣??</span></div>
      <div class="bgc-ot">${defAv("sm")}<div><b>${esc(APP_NAME)}</b><span class="bgc-row"><span class="bgc-b">超適合的!</span><span class="bgc-t">1<br>${timeHM(Date.now())}</span></span></div></div></div></div>`); }
/* 長按藝人的訊息：系統選單 */
function openMsgSheet(id){ const w=getWhispers().find(v=>v.id===id); if(!w) return; ui.copyText=w.ko||w.text; const m=route().m;
  if(w.from!=="artist"){ iosSheet([["複製","tCopy"]]); return; }
  const items=[]; if(!w.kind) items.push(["複製","tCopy"]); items.push(["翻譯設定","tToSettings",`data-m="${m}"`]); if(!w.kind&&w.ko) items.push(["查看翻譯結果","tTrSheet",`data-id="${id}"`]); if(!(S.get(K.boxKeep,[])||[]).includes(id)) items.push([`收藏到 ${WHISPER_NAME} BOX`,"tKeep",`data-id="${id}"`]); else items.push([`從 ${WHISPER_NAME} BOX 移除`,"boxDel",`data-id="${id}"`]); iosSheet(items); }

/* ---------- 聊天室設定 ---------- */
function viewTieSettings(member){
  const st=tieSet(member), m=member;
  const row=(act,label,val,{sub="",cls=""}={})=>`<button class="bs-r ${cls}" data-a="${act}" data-m="${m}"><span class="bs-l"><b>${label}</b>${sub?`<small>${sub}</small>`:""}</span><em>${val}${TI.chev}</em></button>`;
  return `<div class="bs"><header class="tpk-h"><button class="t-ib" data-a="back" aria-label="返回">${TI.back}</button><b>聊天室設定</b><span class="tpk-sp"></span></header>
    <main class="bs-b">
      ${row("tEditName","聊天室名稱",esc(st.chatName))}
      ${row("tEditNick","設置愛稱",st.nickname?"ON":"OFF",{sub:"您可以設置 ARTIST 稱呼您的愛稱。"})}
      <hr>
      ${row("tBgMenu","設定背景","")}
      ${row("tBadge","設置 ARTIST 徽章",`<span class="${st.badge?"":"off"}">${st.badge?"ON":"OFF"}</span>`)}
      <hr>
      <button class="bs-r" data-a="tTrToggle" data-m="${m}" role="checkbox" aria-checked="${!!st.translate}"><span class="bs-l"><b>翻譯</b></span><i class="bs-ck ${st.translate?"on":""}"></i></button>
      ${row("tLang","翻譯結果語言",TR_LANGS[st.trLang||"zh"],{sub:"對話框中超過 1,000 字以上的對話不支援翻譯功能。"})}
      <div class="bs-r"><span class="bs-l"><b>翻譯軟體</b><small>設置翻譯軟體後，共同適用於設置相同目標翻譯語言的 ${WHISPER_NAME} 聊天室。</small></span><em>${trEngine()}</em></div>
      <hr>
      ${(()=>{ const rec=subs()[member]; return rec&&((rec.periods||[]).length>1)?row("tHistory","載入歷史對話",""):""; })()}
    </main>${isActive(member)?"":`<button class="t-leave-b" data-a="tLeave" data-m="${member}">離開聊天室</button>`}</div>`;
}
function viewTieEdit(member,which){
  const st=tieSet(member), val=which==="name"?st.chatName:st.nickname;
  if(ui.tieEditVal==null) ui.tieEditVal=val;
  const changed=ui.tieEditVal!==val;
  return `<div class="t-page white"><header class="t-ph"><button class="t-ib" data-a="tEditBack" data-m="${member}" data-w="${which}" aria-label="返回">${TI.back}</button>
      <h3>${which==="name"?"變更聊天室名稱":"設置暱稱"}</h3><button class="t-ok ${changed?"on":""}" id="teOk" data-a="tEditSave" data-m="${member}" data-w="${which}">確認</button></header>
    <main class="t-edit"><input id="tev" maxlength="20" value="${esc(ui.tieEditVal)}" placeholder="輸入文字" autocomplete="off">
      <p>${which==="name"?"幫聊天室取一個只有你看得到的名字吧。":"藝人的訊息裡叫你的地方，會顯示成這個暱稱。"}</p></main></div>`;
}
function viewTieBg(member){
  const st=tieSet(member);
  return `<div class="t-page white"><header class="t-ph"><button class="t-ib" data-a="back" aria-label="返回">${TI.back}</button><h3>設定背景</h3><button class="t-ok on" data-a="back">確認</button></header>
    <main class="t-bgp"><div class="t-phone">${tieBgLayer(st,"t-pv")}<span class="t-pv-logo">${WHISPER_NAME}</span><span class="t-pv-a"></span><span class="t-pv-b"></span></div>
      <button class="t-pill" data-a="tBgMenu" data-m="${member}">變更背景</button></main>
    <input type="file" id="tbgAlbum" accept="image/*" hidden data-m="${member}"><input type="file" id="tbgCam" accept="image/*" capture="environment" hidden data-m="${member}"></div>`;
}
function openTieBgMenu(member){
  const st=tieSet(member), tab=ui.tieBgTab||"color";
  setLayer(`<div class="t-sheet-w" data-a="tCloseLayer"><div class="t-sheet" role="dialog" aria-label="變更背景"><div class="grab"></div>
    <button class="t-sb" data-a="tPickAlbum">選擇照片</button>
    <div class="t-tabs"><button class="${tab==="color"?"on":""}" data-a="tBgTab" data-v="color" data-m="${member}">顏色</button><button class="${tab==="pattern"?"on":""}" data-a="tBgTab" data-v="pattern" data-m="${member}">圖案</button></div>
    <div class="t-swg">${tab==="color"?`<button class="t-swc def ${st.bgMode==="default"||st._art?"sel":""}" data-a="tBgSet" data-m="${member}" data-mode="default">預設</button>`+TIE_COLORS.map(c=>`<button class="t-swc ${!st._art&&st.bgMode==="color"&&st.bgColor===c?"sel":""}" style="background:${c}" data-a="tBgSet" data-m="${member}" data-mode="color" data-v="${c}" aria-label="顏色 ${c}"></button>`).join("")
      :[1,2,3,4,5,6,7,8].map(n=>`<button class="t-swc tp-${n} ${!st._art&&st.bgMode==="pattern"&&st.bgPattern===n?"sel":""}" data-a="tBgSet" data-m="${member}" data-mode="pattern" data-v="${n}" aria-label="圖案 ${n}"></button>`).join("")}</div>
    <button class="t-sb cancel" data-a="tCloseLayer">取消</button></div></div>`,"bgmenu");
}
/* ---------- 藝人端 TIE ---------- */
function viewTieArtist(mid){
  setTimeout(()=>aiTranslateFor(mid),0);
  const m=MEMBERS[mid], g=groupOf(m.group);
  const msgs=getWhispers().filter(w=>w.member===mid&&!w.welcome);
  const fans=isActive(mid);
  let lastDay="";
  const body=msgs.map(w=>{
    const d=dayLabel(w.ts); let sep=""; if(d!==lastDay){ sep=`<div class="t-day"><span>${d}</span></div>`; lastDay=d; }
    if(w.from==="artist") return sep+`<div class="t-me"><div class="t-meta"><span>${timeHM(w.ts)}</span></div><div class="t-mecol">${w.reply?tieRq(w.reply,true,true):""}${w.kind?mediaBubble(w):stkOf(w.ko||w.text)?`<div class="t-b me t-stk" data-stk="1">${stkImg(w.ko||w.text)}</div>`:`<div class="t-b me">${nickTag(esc(w.kt?(w.ko||w.text):w.text))}</div>`}</div></div>`;
    const sh=fanShown(w,mid);
    return sep+`<div class="t-art"><span class="fan-av">${mascot("msg:"+w.id)}</span>
      <div class="t-art-c"><div class="t-art-n"><span class="from-fan">FROM FAN</span>${sh.member?(sh.name?`<b class="a-nick">${esc(sh.name)}</b>`:`<span class="a-dia" title="Membership">💎</span>`):""}${w.from==="me"&&isAdminAcct()&&!isUni()?`<span class="t-badge soft">示範粉絲</span>`:""}</div>
      <div class="t-bw has-arw">${stkOf(w.text)?`<div class="t-b  t-stk" data-lp="${w.id}" data-stk="1">${stkImg(w.text)}</div>`:`<div class="t-b" data-lp="${w.id}">${esc(w.text)}${w.zh&&!isZhText(w.text)?`<div class="t-tr">${esc(w.zh)}</div>`:(!isZhText(w.text)&&anyLang(w.text)?(()=>{ const k="tiefan:"+w.id, tr=cmTrGet(k); if(!tr) setTimeout(()=>trNeedT(k,w.text),0); return `<div class="t-tr" data-trk2="${esc(k)}"${tr?"":" hidden"}>${esc(tr||"")}</div>`; })():"")}</div>`}<button class="t-arw" data-a="tieArw" data-id="${w.id}" aria-label="回覆這則訊息"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button><span class="t-meta2"><span class="t-time">${timeHM(w.ts)}</span></span></div></div></div>`;
  }).join("");
  const draft=ui.wDraft||"", Q=tieQ(mid);
  /* 待發送的訊息（照 Bubble：先排好，預覽後一次送出） */
  const qHtml=Q.length?`<div class="t-qsep"><span>${ui.tqBusy?"傳送中…":"待發送的訊息"}</span></div>${Q.map((q,i)=>`<div class="t-me t-q${ui.tqBusy?" sending":""}"><button type="button" class="t-qx" data-a="tqDel" data-i="${i}" aria-label="取消這則">${XI}</button><div class="t-mecol">${q.rid&&getWhispers().find(x=>x.id===q.rid)?tieRq(getWhispers().find(x=>x.id===q.rid),true,true):""}${tqBub(q)}</div></div>`).join("")}`:"";
  const QUICK=["謝謝大家，今天也在努力練習中 ♡","大家吃過晚餐了嗎？記得保暖喔～","今晚文字直播見！期待和你們相聚 ✨"];
  return `${artTieBg(mid)?tieBgLayer(artTieBg(mid)):(thChatBg("t-bgl")||`<div class="t-bgl t-default"></div>`)}<header class="t-rh t-rh-art">
      <div class="t-rh-row"><button class="t-ib" data-a="tab" data-v="home" aria-label="返回">${TI.back}</button><h3>${esc(artName(mid,"tie"))}</h3><div class="t-rh-r"><button class="t-ib t-dots" data-a="tArtDrawer" data-m="${mid}" aria-label="更多"><i></i><i></i><i></i></button></div></div>
    </header>
    <main class="t-msgs" style="--trc:${artColor(mid)}">${body||`<p class="t-none">還沒有訊息，傳第一則 ${WHISPER_NAME} 給粉絲吧</p>`}${qHtml}${Q.length?`<div class="t-qrow"><button type="button" class="t-qgo" data-a="tqPreview">傳送待發訊息<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4 21 12 3.4 3.6l2.2 7.2L15 12l-9.4 1.2z"/></svg></button><small>${Q.length}／${TQ_MAX}</small></div>`:""}<p class="t-wait">粉絲們正在等你的訊息</p><div id="chat-end"></div></main>
    
    <form class="t-foot" id="wform">${(()=>{ const rw=ui.tReply&&getWhispers().find(x=>x.id===ui.tReply); return rw?`<div class="t-rq"><span class="t-rq-i">${TI_REPLY}</span><div class="t-rq-b"><b>回覆粉絲的訊息</b><p>${esc(rw.text)}</p></div><button type="button" data-a="tReplyX" aria-label="取消回覆">${I3.x}</button></div>`:""; })()}<button type="button" class="t-plus" data-a="tAttach" aria-label="傳照片或語音">＋</button><button type="button" class="t-nick" data-a="tNickTk" aria-label="插入 @@@（粉絲的愛稱）">@@@</button><div class="t-inp"><textarea rows="1" class="ag" id="win" maxlength="300" autocomplete="off" placeholder="叫叫粉絲的愛稱 @@@ 吧 :)" aria-label="輸入訊息">${esc(draft)}</textarea><button type="button" class="t-smile ${ui.tieEmoji?"on":""}" data-a="tEmojiToggle" aria-label="表情符號">${TI.smile}</button></div>
      <button class="t-send ${draft.trim()?"on":""}" id="wsend" type="submit" aria-label="送出">${TI.send}</button></form>`;
}

/* ---------- 直播／活動：畫面 ---------- */
function eventCard(e,{artist=false,canDelete=false}={}){
  const m=MEMBERS[e.member], g=groupOf(e.group), t=new Date(e.ts), past=e.ts<Date.now();
  return `<article class="card ev ${past?"past":""}" id="ev-${e.id}">
    <div class="ev-date" style="background:${grad(g.g)}"><span>${t.getMonth()+1} 月</span><b>${t.getDate()}</b><span>週${WD[t.getDay()]}</span></div>
    <div class="ev-b">
      <div class="ev-tags"><span class="badge">${e.kind==="party"?"Party":"Spot"}</span><span class="ev-cd">${evCountdown(e.ts)}</span></div>
      <h4>${esc(e.title)}</h4>
      <p class="ev-meta">${evWhen(e.ts)}<br>${esc(e.place)}</p>
      ${e.desc?`<p class="ev-desc">${esc(e.desc)}</p>`:""}
      <div class="ev-foot"><span class="muted">${esc(m.official?g.name:artName(e.member,"feed"))}・${fmt(e.count)} 人預約</span><div class="spacer"></div>
        ${artist?(canDelete?`<button class="del" data-a="delEvent" data-id="${e.id}">刪除</button>`:"")
          :past?"":`<button class="btn btn-sm ${e.mine?"btn-soft":"btn-main"}" data-a="reserve" data-id="${e.id}" aria-pressed="${e.mine}">${e.mine?"已預約":"預約"}</button>`}</div>
    </div></article>`;
}/* 藝人設定 TIE 聊天室背景：沒自己換過背景的粉絲會跟著變 */
function openArtTieBg(){ const mid=session().member, ab=artTieBg(mid), tab=ui.tieBgTab||"color";
  setLayer(`<div class="t-sheet-w" data-a="tCloseLayer"><div class="t-sheet" role="dialog" aria-label="聊天室背景"><div class="grab"></div>
    <button class="t-sb" data-a="aBgAlbum">選擇照片</button>
    <div class="t-tabs"><button class="${tab==="color"?"on":""}" data-a="aBgTab" data-v="color">顏色</button><button class="${tab==="pattern"?"on":""}" data-a="aBgTab" data-v="pattern">圖案</button></div>
    <div class="t-swg">${tab==="color"?`<button class="t-swc def ${!ab?"sel":""}" data-a="aBgSet" data-mode="default">預設</button>`+TIE_COLORS.map(c=>`<button class="t-swc ${ab&&ab.bgMode==="color"&&ab.bgColor===c?"sel":""}" style="background:${c}" data-a="aBgSet" data-mode="color" data-v="${c}" aria-label="顏色 ${c}"></button>`).join("")
      :[1,2,3,4,5,6,7,8].map(n=>`<button class="t-swc tp-${n} ${ab&&ab.bgMode==="pattern"&&ab.bgPattern===n?"sel":""}" data-a="aBgSet" data-mode="pattern" data-v="${n}" aria-label="圖案 ${n}"></button>`).join("")}</div>
    <button class="t-sb cancel" data-a="tCloseLayer">取消</button></div></div>`,"bgmenu"); }
/* ===== 藝人 TIE：待發送的訊息（照 Bubble）：先排好最多 10 則，預覽後一次送出。只存在這支手機 ===== */
const TQ_MAX=10;
/* 照片、語音也先排進待發：檔案先只存在這支手機（不上傳），按「傳送」才上傳 */
async function tqAddMedia(mid,kind,blob,meta){ const Q=tieQ(mid); if(Q.length>=TQ_MAX){ toast(`一次最多 ${TQ_MAX} 則，先把待發訊息送出去吧`); return false; }
  const id="m"+Date.now()+Math.random().toString(36).slice(2,5); await MDB.put(id,blob,true); Q.push({kind,mid:id,...meta,text:kind==="photo"?"📷 照片":"🎙️ 語音",rid:ui.tReply||null}); ui.tReply=null; tieQSet(mid,Q); ui.scrollChat=true; render(); return true; }
const tqBub=(q,pv)=>stkOf(q.text)?`<div class="${pv?"tq-bb":"t-b me"} t-stk" data-stk="1">${stkImg(q.text)}</div>`:q.kind?`<div class="tq-media">${mediaBubble({...q,from:"artist"})}</div>`:(pv?`<div class="tq-bb">${nickTag(esc(q.text))}</div>`:`<div class="t-b me">${nickTag(esc(q.text))}</div>`);
const tieQ=mid=>{ try{ return JSON.parse(localStorage.getItem("hc_tq_"+mid)||"[]")||[]; }catch(e){ return ui["tq_"+mid]||[]; } };
const tieQSet=(mid,Q)=>{ ui["tq_"+mid]=Q; try{ localStorage.setItem("hc_tq_"+mid,JSON.stringify(Q)); }catch(e){} };
function openTieQPreview(){ const mid=session().member, m=MEMBERS[mid], Q=tieQ(mid); if(!Q.length) return; const ab=artTieBg(mid);
  setLayer(`<div class="tq-pv" role="dialog" aria-label="預覽"><header class="tq-h"><button class="t-ib" data-a="tqBack" aria-label="返回">${TI.back}</button><b>預覽</b><span class="tq-sp"></span></header>
    <div class="tq-b">${ab?tieBgLayer(ab,"tq-bg"):(thChatBg("tq-bg")||`<div class="tq-bg t-default"></div>`)}<div class="tq-l">${Q.map(q=>`<div class="tq-m">${tieAv(m,"tq-av")}<div><div class="tq-n">${artBadge(mid)}<b>${esc(artName(mid,"tie"))}</b></div>${q.rid&&getWhispers().find(x=>x.id===q.rid)?tieRq(getWhispers().find(x=>x.id===q.rid),false,true):""}${tqBub(q,1)}</div></div>`).join("")}</div></div>
    <footer class="tq-f"><button data-a="tqBack">返回</button><button class="go" data-a="tqSend">傳送</button></footer></div>`,"tqpv"); hydrateMedia(layer); }

/* ===== TIE 體驗券：不限藝人，拿到後一年內要用；用了就開通那位藝人 7 天 TIE（她 10/28 定） ===== */
const TV_DAYS=7, TV_LIFE=365*864e5;
const tvAll=()=>(S.get(K.tieVch,[])||[]).filter(v=>v&&v.id);
const tvLive=()=>tvAll().filter(v=>!v.used&&v.exp>Date.now());
function tvGive(src,from){ const L=tvAll(); if(L.some(v=>v.id==="tv_"+src)) return false; L.push({id:"tv_"+src,from,days:TV_DAYS,ts:Date.now(),exp:Date.now()+TV_LIFE}); S.set(K.tieVch,L); return true; }
function tvUseAsk(id){ const v=tvLive().find(x=>x.id===id); if(!v) return; const f=followed(), ms=f.flatMap(gid=>grpMembers(gid).filter(m=>MEMBERS[m]&&!MEMBERS[m].official&&!isSelfGid(gid)));
  if(!ms.length){ toast("先追蹤藝人，才能選要用在誰的聊天室"); return; }
  tieModal(`用在誰的 ${WHISPER_NAME}？`,`<span class="tv-pick">${ms.map(m=>`<button data-a="tvUse" data-v="${id}" data-m="${m}"><span class="tv-av">${mAvIn(m)}</span><b>${esc(artName(m,"tie"))}</b><small>${isActive(m)?"使用中・會再加 7 天":esc(groupOf(MEMBERS[m].group).name)}</small></button>`).join("")}</span>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button>`); }
function tvUse(id,mid){ const L=tvAll(), v=L.find(x=>x.id===id); if(!v||v.used||v.exp<=Date.now()||!MEMBERS[mid]) return; v.used=Date.now(); v.mid=mid; S.set(K.tieVch,L); buyTie(mid,v.days,0); layer.innerHTML=""; render(); toast(`已開通 ${artName(mid,"tie")} 的 ${WHISPER_NAME}・${v.days} 天`); }
const tvRows=()=>{ const L=tvLive().sort((a,b)=>a.exp-b.exp); if(!L.length) return ""; return `<div class="section-h">體驗券<span class="muted">${L.length} 張</span></div><section class="card me-list">${L.map(v=>{ const d=Math.ceil((v.exp-Date.now())/864e5); return `<button class="me-row" data-a="tvAsk" data-v="${v.id}"><span class="me-ic tv-ic">🎫</span><span class="me-t"><b>${WHISPER_NAME} ${v.days} 天體驗券</b><small>${esc(v.from||"")}・${d<=30?`剩 ${d} 天到期`:`${ymd(v.exp)} 到期`}</small></span><em class="tv-go">使用</em></button>`; }).join("")}</section>`; };

