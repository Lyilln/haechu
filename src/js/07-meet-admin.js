/* HAECHU｜藝人端 MEET、營收、檢舉、團管理、紀念日 */
/* =========================================================
   藝人端 MEET
   ・沒開播：開播準備頁（標題＋開始直播；預告和直播紀錄收在下面兩列）
   ・開播後：全螢幕直播間，跟粉絲端同一套卡片模式，但內容是主播用的
   ========================================================= */
function viewStudio(mid){
  const m=MEMBERS[mid], g=groupOf(m.group), fans=followed().includes(g.id), c=GRADS[m.g%GRADS.length];
  const myPlans=getPlans().filter(p=>p.member===mid), past=getLives().filter(x=>x.member===mid&&x.endTs);
  const inv=coInvites(mid);
  return `<main class="page prep">
    ${inv.map(l=>{ const hm=MEMBERS[l.member], hg=groupOf(hm.group); return `<section class="card co-inv"><i class="dl-av" style="background:${grad(hm.g)}">${mAvIn(l.member)}</i><div><b>${esc(hm.name)}${hg&&!hg.solo?`（${esc(hg.name)}）`:""} 邀請你連線直播</b><small>${esc(l.title||"")}</small></div><span class="co-btns"><button class="btn btn-soft btn-sm" data-a="coNo" data-id="${l.id}">拒絕</button><button class="btn btn-main btn-sm" data-a="coYes" data-id="${l.id}">接受</button></span></section>`; }).join("")}
    <section class="prep-card lvh-prep cv-fit" style="${lvCoverFit(mid)}"><span class="lvh-shade"></span>
      <span class="lvh-live off">LIVE<i></i></span>
      <h2>準備開播</h2>
      <span class="fld-lab">直播標題</span><label class="field">${I.live}<input id="ltitle" placeholder="輸入文字" value="${esc(ui.lTitle||"")}"><button type="button" class="bgm-open ${(S.get(K.bgm,{})[mid]||[]).length?"on":""}" data-a="bgmOpen" aria-label="背景音樂">${BGM_IC}${(S.get(K.bgm,{})[mid]||[]).length?`<b>${(S.get(K.bgm,{})[mid]||[]).length}</b>`:""}</button></label>
      <button class="btn btn-main btn-block prep-go" data-a="startLive">開始直播</button>
    </section>
    ${rpHead()}
    ${past.length?rpSorted(past).map(replayRow).join(""):`<p class="meet-empty">尚無重播</p>`}
  </main>`;
}
function openPlanSheet(){
  const mid=session().member, myPlans=getPlans().filter(p=>p.member===mid);
  setLayer(`<div class="scrim" data-a="closeSheet"><div class="sheet plan-sheet" role="dialog" aria-label="預告下一場直播"><div class="grab"></div>
    <div class="cs-h"><h3>預告下一場直播</h3><div class="spacer"></div><button class="icon-btn sm" data-a="closeSheet" aria-label="關閉">${XI}</button></div>
    <p class="reach" style="margin:0 2px 12px">粉絲會在 MEET 的「即將開播」看到；按了「提醒我」的粉絲，開播時會收到專屬提醒。</p>
    <span class="fld-lab">直播標題</span><label class="field">${I.live}<input id="ptitle" placeholder="輸入文字"></label>
    <label class="field">${I.bell}<input id="pwhen" type="datetime-local" value="${dtDefault()}"></label>
    <button class="btn btn-main btn-block" data-a="addPlan">公布預告</button>
    ${myPlans.length?`<div class="plan-l">${myPlans.map(p=>planRow(p,true)).join("")}</div>`:""}
  </div></div>`,"plan");
}

function hostFeedHtml(l){
  const hr=ui.hostReply, items=l.msgs.map((x,i)=>({x,i})).filter(o=>o.x.from!=="artist").slice(-60);
  if(!items.length) return "";
  return items.map(({x,i})=>`<button class="hm ${x.from==="me"?"me":""} ${hr&&hr.i===i?"sel":""}" data-a="hostReplyTo" data-i="${i}"><b>${esc(x.name||"粉絲")}${x.from==="me"&&isAdminAcct()&&!isUni()?' <span class="badge">示範粉絲</span>':""}</b><span>${esc(x.text)}${x.tr?`<i class="hm-tr">${esc(x.tr)}</i>`:""}</span><em>${hr&&hr.i===i?"回覆中":"↩"}</em></button>`).join("");
}
function viewHostRoom(l){
  const hr=ui.hostReply, draft=ui.lDraft||"", cur=lvLast(l);
  ui.lastH=l.hearts; if(ui.lvMini===l.id) ui.lvMini=null;
  return lvShell(l,true,`<main class="cm-main dl-main">
      <div id="cmSpot" data-k="${esc(spotKey(l))}" data-c="${cur?cur.ts:0}">${spotHtml(l,true)}</div>
      <div class="dl-chat"><div class="host-feed" id="hostFeed">${hostFeedHtml(l)}</div></div>
    </main>
    ${hr?`<div class="host-rep2"><span>${repQ(hr)}</span><button class="hr-rep" data-a="hostRep">檢舉</button><button data-a="hostReplyX" aria-label="取消回覆">${XI}</button></div>`:""}
    <form class="cm-foot dl-foot" id="lform"><label class="cm-in"><textarea rows="1" class="ag" id="lin" autocomplete="off" placeholder="輸入訊息">${esc(draft)}</textarea><button type="submit" class="mr-send ${draft.trim()?"on":""}" id="lsend" aria-label="送出"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/></svg></button></label></form>`);
}
function updSpot(l,host){
  const sp=document.getElementById("cmSpot"); if(!sp) return false;
  const k=spotKey(l); if(sp.dataset.k===k) return false;
  const cur=lvLast(l), ck=String(cur?cur.ts:0), isNew=sp.dataset.c!==ck;
  sp.dataset.k=k; sp.dataset.c=ck; sp.innerHTML=spotHtml(l,host);
  if(isNew){ const cd=sp.querySelector(".sp-card"); if(cd) cd.classList.add("in"); const tl=document.getElementById("cmTl"); if(tl) tl.innerHTML=tlHtml(l); }
  return isNew&&cur;
}
let hostSig="";
function updateHost(l){
  updSpot(l,true);
  const sig=l.msgs.length+":"+(ui.hostReply?ui.hostReply.i:"");
  if(sig!==hostSig){ hostSig=sig; const f=document.getElementById("hostFeed"); if(f){ const atEnd=f.scrollHeight-f.scrollTop-f.clientHeight<60; f.innerHTML=hostFeedHtml(l); if(atEnd) f.scrollTop=f.scrollHeight; } }
  const v=document.getElementById("mrView"); if(v) v.textContent=fmt(liveViewers(l));
  const hs=document.getElementById("mrHearts"); if(hs) hs.textContent=hfmt(l.hearts);
  const hc=document.getElementById("hostCnt"); if(hc) hc.textContent=l.msgs.filter(x=>x.from!=="artist").length;
  const hl=document.getElementById("hostLen"); if(hl) hl.textContent=liveLen(l);
  if(ui.lastH!=null&&l.hearts>ui.lastH){ const d=Math.min(3,Math.ceil((l.hearts-ui.lastH)/8)); for(let i=0;i<d;i++) setTimeout(heartRain,i*180); }
  ui.lastH=l.hearts;
}
/* 正式版：直播間只有真的粉絲留言、送心心（不再自動產生假的） */

/* 藝人 LOVE：動態／活動 */

/* ===== 直播間：心心可以按住連送、慢速模式 ===== */
const HP={t:null,iv:null,n:0,hide:null};
function sendHeart(id){ const l=getLive(id); if(!l||l.endTs) return; l.hearts++; saveLive(l); const h=document.getElementById("mrHearts"); if(h) h.textContent=hfmt(l.hearts); ui.lastH=l.hearts; heartRain(); checkMile(l); if(Math.random()>.7) ui.vj=(ui.vj||0)+1;
}
function heartStart(id){ heartStop(); sendHeart(id); HP.t=setTimeout(()=>{ HP.iv=setInterval(()=>sendHeart(id),110); },320); }
function heartStop(){ clearTimeout(HP.t); clearInterval(HP.iv); HP.t=HP.iv=null; }
document.addEventListener("pointerdown",e=>{ const hb=e.target.closest&&e.target.closest(".cm-hb"); if(!hb) return; ui.heartPtr=true; heartStart(hb.dataset.id); });
["pointerup","pointercancel","pointerleave"].forEach(ev=>document.addEventListener(ev,()=>heartStop()));
const SLOW_MS=3000;
function slowOk(text){
  const now=Date.now();
  if(now-(ui.lastSend||0)<SLOW_MS){ toast(`慢速模式：每 ${SLOW_MS/1000} 秒可以傳一則`); return false; }
  if(text&&text===ui.lastText){ toast("不能連續傳一樣的訊息喔"); return false; }
  ui.lastSend=now; ui.lastText=text; return true;
}

/* =========================================================
   應援棒模式：燈海 + 可以自己揮的 3D 應援棒
   左右拖動＝左右揮、上下拖動＝前後搖；揮得越用力，燈海越亮
   ========================================================= */
const SEA={boost:0};
function hex2rgbArr(h){ h=(h||"#C7AEFF").replace("#",""); return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)).join(","); }

/* ===== 藝人看到的粉絲：只有「FROM FAN」、App 的吉祥物頭像和隨機名字 ===== */
const strHash=s=>{ let h=2166136261; for(const c of String(s)) h=Math.imul(h^c.charCodeAt(0),16777619)>>>0; return h; };
const FAN_ADJ=["軟綿綿的","愛睡覺的","閃亮亮的","迷路的","害羞的","哼著歌的","蹦蹦跳跳的","偷吃糖的","數星星的","抱著月亮的"];
const FAN_NOUN=["小星星","雲朵","布丁","棉花糖","小月亮","泡泡","兔兔","果凍","汽水","小熊"];
const fanKey=w=>w.from==="me"?"fan:"+(w.by||"me"):"fan:"+(w.name||w.id);
const fanAlias=k=>{ const h=strHash(k); return FAN_ADJ[h%FAN_ADJ.length]+FAN_NOUN[(h>>>5)%FAN_NOUN.length]; };
const MASCOT_C=[["#FCE7F3","#F472B6"],["#EFE6FF","#8843FB"],["#DBEAFE","#60A5FA"],["#FEF3C7","#F59E0B"],["#D1FAE5","#34D399"],["#FFE4E6","#FB7185"]];
function mascot(k){
  const h=strHash(k), kind=h%6, [bg,ac]=MASCOT_C[(h>>>4)%6];
  const ears=[`<ellipse cx="14" cy="9" rx="3.2" ry="8" fill="#fff"/><ellipse cx="26" cy="9" rx="3.2" ry="8" fill="#fff"/><ellipse cx="14" cy="10" rx="1.5" ry="5" fill="${ac}" opacity=".45"/><ellipse cx="26" cy="10" rx="1.5" ry="5" fill="${ac}" opacity=".45"/>`,
    `<path d="M10 17 12 6l7 7zM30 17 28 6l-7 7z" fill="#fff"/>`,
    `<circle cx="11.5" cy="12" r="4.5" fill="#fff"/><circle cx="28.5" cy="12" r="4.5" fill="#fff"/><circle cx="11.5" cy="12" r="2" fill="${ac}" opacity=".4"/><circle cx="28.5" cy="12" r="2" fill="${ac}" opacity=".4"/>`,
    `<path d="M20 5c-2 3-1 5 0 6 1-1 2-3 0-6zM20 7c2-1 4 0 4 2-2 0-3 0-4-2z" fill="${ac}"/>`,
    `<path d="M20 3l1.6 3.4 3.7.4-2.8 2.5.8 3.7L20 11l-3.3 2 .8-3.7-2.8-2.5 3.7-.4z" fill="${ac}"/><path d="M20 13v-2" stroke="${ac}" stroke-width="1.4"/>`,
    `<circle cx="13" cy="15" r="5" fill="#fff"/><circle cx="20" cy="12" r="6" fill="#fff"/><circle cx="27" cy="15" r="5" fill="#fff"/>`][kind];
  return `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="${bg}"/>${ears}<circle cx="20" cy="23" r="11" fill="#fff"/>
    <ellipse cx="16" cy="22.5" rx="1.5" ry="1.9" fill="#3B2A6B"/><ellipse cx="24" cy="22.5" rx="1.5" ry="1.9" fill="#3B2A6B"/>
    <ellipse cx="13.5" cy="26" rx="2.2" ry="1.3" fill="${ac}" opacity=".35"/><ellipse cx="26.5" cy="26" rx="2.2" ry="1.3" fill="${ac}" opacity=".35"/>
    <path d="M18.3 26.2q.85.9 1.7 0 .85.9 1.7 0" stroke="#3B2A6B" stroke-width="1" fill="none" stroke-linecap="round"/></svg>`;
}
/* ===== 愛稱：藝人在訊息裡打 @@@，每位粉絲收到時會自動換成自己設定的愛稱 ===== */
const NICK_TK="@@@";
/* Membership（整個團）：買了的粉絲，藝人那邊會看到「藝人幫 Membership 粉絲取的愛稱」；沒買的照樣是 FROM FAN＋隨機名字 */
/* 營收紀錄：每一筆購買都記下來，管理員看收成、跟藝人算帳用 */
/* 購買紀錄的名稱：Membership 一律顯示現在的藝名／團名（舊紀錄可能存到社群名字） */
const saleLbl=x=>{ const g=x&&x.gid&&groupOf(x.gid); return x&&x.type==="membership"&&g?String(x.label||"").replace(/^.*? Membership/,g.name+" Membership"):String((x&&x.label)||""); };
function recordSale(type,{gid=null,mid=null,pts=0,label=""}={}){ const l=S.get(K.sales,[]); l.unshift({id:"s"+Date.now()+Math.random().toString(36).slice(2,5),type,gid:gid||(mid&&MEMBERS[mid]?MEMBERS[mid].group:null),mid,pts,label,ts:Date.now(),buyer:myEmail()||"me"}); /* 記下是哪個帳號買的：購買紀錄只看得到自己的 */ S.set(K.sales,l.slice(0,2000)); }
const MS_PLANS=[{id:"m30",days:30,pts:3500,name:"30 天"},{id:"m365",days:365,pts:35000,name:"365 天"}];
const getMS=()=>S.get(K.membership,{});
const isMember=gid=>{ const r=getMS()[gid]; return !!(r&&r.expires>Date.now()); };
/* 藝人的手機看不到粉絲自己的 Membership，所以每個粉絲把「哪一團、到期日」公開記一份（只有到期日，沒有別的資料） */
function msPublish(){ try{ const me=myEmail(); if(!me) return; const mine={}; Object.entries(getMS()).forEach(([g,r])=>{ if(r&&r.expires>Date.now()) mine[g]=r.expires; });
  const all=S.get(K.msPub,{})||{}; if(JSON.stringify(all[me]||{})===JSON.stringify(mine)) return; all[me]=mine; S.set(K.msPub,all); }catch(e){} }
const fanIsMember=(email,gid)=>{ const r=((S.get(K.msPub,{})||{})[String(email||"").toLowerCase()]||{})[gid]; return !!(r&&r>Date.now()); };
const msGrace=gid=>{ const r=getMS()[gid], now=Date.now(); return !!(r&&now>r.expires&&now<=r.expires+GRACE); };
const msLeft=gid=>{ const r=getMS()[gid]; return r&&r.expires>Date.now()?daysLeft(r.expires):0; };
function buyMS(gid,planId){ const p=MS_PLANS.find(x=>x.id===planId); if(points()<p.pts) return false; S.set(K.points,points()-p.pts);
  const all=getMS(), r=all[gid], now=Date.now(), cont=r&&now<=r.expires+GRACE;   // 跟 TIE 一樣：到期 24 小時內續訂算連續
  all[gid]={since:cont?r.since:now,expires:Math.max(cont?r.expires:now,now)+p.days*864e5}; S.set(K.membership,all);
  recordSale("membership",{gid,pts:p.pts,label:`${groupOf(gid).name} Membership ${p.name}`});
  logSelf("core",null,`你加入了 ${groupOf(gid).name} 的 Membership 💎`); msPublish(); return true; }
const artistNick=mid=>(S.get(K.artistNick,{})[mid]||"").trim();
const fakeMember=w=>false;   // 示範：有些示範粉絲也買了 Membership
function fanShown(w,mid){ const g=MEMBERS[mid].group, nk=artistNick(mid)||((S.get(K.fandom,{})||{})[g]||"").trim(), mem=w.from==="me"?(fanIsMember(w.by,g)||w.ms===true):fakeMember(w);   // 粉絲傳訊息時就記下他有沒有 Membership（藝人的手機看不到粉絲的訂閱）
  return {name:mem?nk:"",member:mem}; }   // 藝人這邊：Membership 粉絲只顯示藝人設定的愛稱，一般粉絲只有 FROM FAN
const nickFor=member=>tieSet(member).nickname||ME.name;   // @@@ 在粉絲這邊＝粉絲自己取的暱稱
const nickHtml=member=>`<span class="nick-me${isMember(MEMBERS[member].group)?" glow":""}">${esc(nickFor(member))}</span>`;
const nickify=(html,member)=>html.split(NICK_TK).join(nickHtml(member)).split(esc("{愛稱}")).join(nickHtml(member));
const nickTag=html=>html.split(NICK_TK).join('<span class="nick-tk">@@@</span>').split(esc("{愛稱}")).join('<span class="nick-tk">@@@</span>');

/* ===== 粉絲傳訊息的次數：一次最多 3 則，收到藝人新訊息或 120 小時後才能再傳 ===== */
const QUOTA_WAIT=120*3600e3;
const fanMax=member=>isMember(MEMBERS[member].group)?5:3;   // Membership 會員一次可以傳 5 則
function charLimit(member){ const d=subDays(member); let c=30; MILESTONES.forEach(m=>{ if(d>=m) c=m; }); return c; }   // 照 Bubble：1～49 天 30 字，之後到紀念日就變成那天的天數
function fanQuota(member){ const FAN_MAX=fanMax(member);
  const msgs=fanRoom(member); let lastA=0; msgs.forEach(w=>{ if(w.from==="artist") lastA=Math.max(lastA,w.ts); });
  let mine=msgs.filter(w=>w.from==="me"&&w.ts>lastA), start=lastA;
  while(mine.length>=FAN_MAX){ const until=mine[FAN_MAX-1].ts+QUOTA_WAIT; if(Date.now()<until) return {left:0,until}; start=until; mine=mine.filter(w=>w.ts>=until); }
  return {left:FAN_MAX-mine.length};
}
const QUOTA_MSG=n=>`為了藝人，你一次最多只能傳送 ${n} 則訊息。收到藝人的回覆或 120 小時後，就能再傳送下一則訊息。`;
function quotaBar(){
  let b=document.getElementById("tQbar"); if(!b){ b=document.createElement("div"); b.id="tQbar"; b.className="t-qbar"; b.setAttribute("role","status"); document.body.appendChild(b); }
  b.textContent=QUOTA_MSG(fanMax(route().m||Object.keys(MEMBERS)[0])); b.classList.remove("show"); void b.offsetWidth; b.classList.add("show");
  clearTimeout(ui.qbarT); ui.qbarT=setTimeout(()=>b.classList.remove("show"),5200);
  if(!b._sw){ b._sw=1; let y0=null; b.addEventListener("pointerdown",e=>{ y0=e.clientY; }); b.addEventListener("pointermove",e=>{ if(y0!=null&&e.clientY-y0<-14){ b.classList.remove("show"); y0=null; } }); b.addEventListener("pointerup",()=>{ y0=null; }); }
}
/* 提示只屬於這個聊天室：一離開就收掉 */
window.addEventListener("hashchange",()=>{ const b=document.getElementById("tQbar"); if(b) b.classList.remove("show"); });

/* ===== 示範照片、語音：不見了就重新產生 ===== */

function b64Blob(du){ try{ const [h,d]=du.split(","), mime=(h.match(/data:([^;]+)/)||[])[1]||"application/octet-stream", bin=atob(d), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); return new Blob([u],{type:mime}); }catch(e){ return null; } }
function blobDU(blob){ return new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=()=>res(null); r.readAsDataURL(blob); }); }

/* =========================================================
   營收（管理員看收成、跟藝人算帳）
   ・TIE 券算給那位成員
   ・Membership、周邊算給整個團，再平均分給團裡的成員（不含官方帳號）
   ・藝人分潤比例由管理員設定
   ========================================================= */
const revShare=()=>S.get(K.revShare,10);   // 藝人分潤：粉絲花在藝人身上的積分 10%（她 11/12 從 15% 改）
const groupArtists=gid=>Object.entries(MEMBERS).filter(([id,m])=>m.group===gid&&!m.official).map(([id])=>id);
function revenueOf(sinceTs=0){
  const sales=S.get(K.sales,[]).filter(x=>x.ts>=sinceTs), byType={tie:0,membership:0,merch:0,gacha:0}, byMember={}, byGroup={};
  sales.forEach(x=>{ byType[x.type]=(byType[x.type]||0)+x.pts; if(x.gid) byGroup[x.gid]=(byGroup[x.gid]||0)+x.pts;
    if((x.type==="tie"||x.type==="truck")&&x.mid){ byMember[x.mid]=(byMember[x.mid]||0)+x.pts; }
    else if(x.gid){ const ids=groupArtists(x.gid); ids.forEach(id=>{ byMember[id]=(byMember[id]||0)+x.pts/Math.max(1,ids.length); }); } });
  const total=Object.values(byType).reduce((a,b)=>a+b,0);
  return {sales,byType,byMember,byGroup,total};
}


/* =========================================================
   檢舉、禁言、封鎖（留言、直播留言、TIE 訊息都能檢舉）
   ========================================================= */
const getMutes=()=>S.get(K.mutes,{});
function muteState(key){ const m=getMutes()[key]; if(!m) return null; if(m.ban) return {ban:true}; if(m.until>Date.now()) return {until:m.until}; return null; }
function meBlocked(){ const st=muteState("fan:me"); if(!st) return false; toast(st.ban?"你的帳號已被停權，暫時不能發言":`你目前被禁言到 ${evWhen(st.until)}，暫時不能發言`); return true; }
function reportItem(kind,ref){   // kind：live／tie
  const list=S.get(K.reports,[]), key=kind+":"+(ref.liveId||"")+":"+(ref.wid||ref.ts);
  const ex=list.find(r=>r.key===key&&r.status==="open"); if(ex){ if(ex.mine) return false; ex.count++; ex.mine=true; S.set(K.reports,list); return true; }
  list.push({id:"rp"+Date.now(),key,kind,ref,text:ref.text,name:ref.name,who:ref.who,reason:kind==="tie"?"藝人檢舉":"粉絲檢舉",by:session().role,mine:true,count:1,ts:Date.now(),status:"open"});
  S.set(K.reports,list); return true;
}
function removeReported(r){
  if(!r.kind||r.kind==="comment"){ removeComment(r.commentId); return; }
  if(r.kind==="live"){ const l=getLive(r.ref.liveId); if(l){ l.msgs=l.msgs.filter(x=>x.ts!==r.ref.ts); saveLive(l); } }
  if(r.kind==="tie"){ S.set(K.whispers,S.get(K.whispers,[]).filter(w=>w.id!==r.ref.wid)); }
  if(r.kind==="sns"){ try{ const d=snDB(); snPDel(d,p=>p.id===r.ref.wid); snSave(d); }catch(e){} }
}
function reportWho(r){ if(r.who) return r.who; const c=S.get(K.comments,[]).find(x=>x.id===r.commentId); return c?(c.author==="me"?"fan:me":"fan:"+c.name):null; }

/* =========================================================
   管理員：藝人與團管理（新增團、新增藝人、開藝人帳號）
   ========================================================= */
function viewRoster(){ hbProfilesNow();
  const r=S.get(K.roster,{groups:[],members:{},accounts:{}}), acc=Object.entries(ACCOUNTS).filter(([e,a])=>a.member);
  const gsel=groupOf(ui.rsGroup)&&!groupOf(ui.rsGroup).solo?ui.rsGroup:(GROUPS.find(g=>!g.solo)||{}).id, gc=ui.rsColor??0;
  return adminHead("ARTISTS")+`<main class="page roster">
    <button class="rev-back" data-a="tab" data-v="me">‹ 回到 ME</button>
    <section class="card studio" id="rsNew">
      <span class="fld-lab">類型</span>
      <div class="seg2 mod-seg rs-type" style="--i:${ui.rsType==="solo"?1:0}"><i class="seg2-ind"></i>${[["group","團體"],["solo","個人（SOLOIST）"]].map(([k,l])=>`<button class="${(ui.rsType||"group")===k?"on":""}" data-a="rsType" data-v="${k}">${l}</button>`).join("")}</div>
      <span class="fld-lab">${ui.rsType==="solo"?"藝名":"團名"}</span><label class="field">${I.star}<input id="rgName" maxlength="16" placeholder="輸入文字"></label>
      <span class="fld-lab">代表色</span>
      <div class="rs-sw">${GRADS.map((c,i)=>`<button class="${gc===i?"on":""}" style="background:${grad(i)}" data-a="rsColor" data-v="${i}" aria-label="代表色 ${i+1}"></button>`).join("")}</div>
      ${ui.rsType==="solo"?`<span class="fld-lab">用哪個帳號登入</span><label class="field">${I.user}<select id="rsAcc" class="rs-sel">${fanAccOpts()}</select></label>
      <span class="fld-lab">生日（月-日，可以之後再填）</span><label class="field">🎂<input id="rsBday" maxlength="5" placeholder="輸入文字"></label>`:""}
      <button class="btn btn-main btn-block" data-a="rgAdd">${ui.rsType==="solo"?"建立個人藝人":"建立團體"}</button></section>
    ${GROUPS.some(g=>!g.solo)?`<section class="card studio"><h3>新增團體成員</h3>
      <div class="chips wrap">${GROUPS.filter(g=>!g.solo).map(g=>`<button class="chip ${gsel===g.id?"on":""}" data-a="rsGroup" data-v="${g.id}">${esc(g.name)}</button>`).join("")}</div>
      <span class="fld-lab">藝人名稱</span><label class="field">${I.user}<input id="rmName" maxlength="16" placeholder="輸入文字"></label>
      <span class="fld-lab">用哪個帳號登入</span><label class="field">${I.user}<select id="rmEmail" class="rs-sel">${fanAccOpts()}</select></label>
      <span class="fld-lab">生日（月-日，可以之後再填）</span><label class="field">🎂<input id="rmBday" maxlength="5" placeholder="輸入文字"></label>
      <button class="btn btn-main btn-block" data-a="rmAdd">新增藝人</button>
</section>`:""}
    <div class="section-h">目前的團與藝人<span class="muted">${GROUPS.length} 團</span></div>
    ${GROUPS.map(g=>{const ms=Object.entries(MEMBERS).filter(([id,m])=>m.group===g.id&&!m.official), custom=r.groups.some(x=>x.id===g.id);
      return `<section class="card rs-g"><div class="rev-gh"><span class="rs-th g-ico" style="background:${grad(g.g)}">${gIcoIn(g)}</span><b>${esc(g.name)}</b>${g.solo?`<span class="badge">SOLOIST</span>`:""}<button class="btn btn-soft btn-sm rs-ed" data-a="rgEdit" data-v="${g.id}">編輯</button>${custom?`<button class="del" data-a="rgDel" data-v="${g.id}">刪除</button>`:""}</div>
      <label class="rs-fd"><span>粉絲名</span><input class="fd-in" data-g="${g.id}" maxlength="16" value="${esc((S.get(K.fandom,{}))[g.id]||"")}" placeholder="輸入文字"></label>
      ${ms.map(([id,m])=>{const a=acc.find(([e,x])=>x.member===id);return `<div class="rs-m"><span class="av sm" style="background:${grad(m.g)}">${esc(ini(m.name))}</span><b>${esc(m.name)}</b><small>${a?esc(acctUser(a[0])+(realName(a[0])?"・"+realName(a[0]):"")):"還沒有登入帳號"}</small>
        <button class="btn btn-soft btn-sm rs-ed" data-a="rmEdit" data-v="${id}">編輯</button>${r.members[id]?`<button class="del" data-a="rmDel" data-v="${id}">刪除</button>`:""}</div>`}).join("")||`<p class="muted" style="font-size:13px;margin:6px 0 0">還沒有成員</p>`}</section>`}).join("")}
  </main>`;
}
/* 可以綁成藝人的帳號：粉絲、還沒有藝人身分的管理員，還有「綁過但那位藝人已經不在」的藝人帳號 */
const canBind=(e,a)=>!!a&&e!==DEMO_FAN&&(a.role==="fan"||((a.role==="admin"||a.role==="artist")&&!(a.member&&MEMBERS[a.member])));
function fanAccOpts(){ const list=Object.entries(ACCOUNTS).filter(([e,a])=>canBind(e,a)); return `<option value="">之後再選</option>`+list.map(([e,a])=>`<option value="${esc(e)}">${esc(acctUser(e))}・${esc(a.name||e)}</option>`).join(""); }
/* 綁定：粉絲帳號變成藝人帳號；管理員帳號還是管理員，只是多了這個藝人身分 */
function bindArtist(em,id){ const a=ACCOUNTS[em]; if(!canBind(em,a)) return false; const n=a.role==="admin"?{...a,member:id}:{...a,role:"artist",member:id}; ACCOUNTS[em]=n; if(HB_ON) hbSetProfile(em,{role:n.role,member:id}); else saveRoster(r=>{ r.accounts=r.accounts||{}; r.accounts[em]=n; }); return true; }
function unbindArtist(em){ const a=ACCOUNTS[em]; if(!a) return; const x={...a,role:a.role==="admin"?"admin":"fan"}; delete x.member; ACCOUNTS[em]=x; if(HB_ON) hbSetProfile(em,{role:x.role,member:null}); else saveRoster(r=>{ r.accounts=r.accounts||{}; r.accounts[em]={...(r.accounts[em]||{}),...x}; delete r.accounts[em].member; }); }
function rgEditOpen(n,it){ const g=groupOf(ui.rgEd); if(!g) return; const c=ui.rgEdC??g.g, ph=gPhotoMap()[g.id]||"";
  tieModal(g.solo?"編輯 SOLOIST":"編輯團體","",`<span class="fs-f-lab">出道／回歸照</span>${`<div class="rg-ph"><span class="rg-ph-img" style="background:${grad(c)}">${ph?`<span class="g-ph" style="background-image:url('${ph}')"></span>`:esc(ini(g.name))}</span><span class="rg-ph-r"><span class="rg-ph-b"><button class="btn btn-soft btn-sm" data-a="rgPhPick">${ph?"更換":"上傳"}</button>${ph?`<button class="btn btn-soft btn-sm" data-a="rgPhDel">移除</button>`:""}</span></span></div>`}<span class="fs-f-lab">${g.solo?"藝名":"團名"}</span><input id="rgEdName" class="a-nick-in" maxlength="16" placeholder="輸入文字" value="${esc(n??g.name)}"><span class="fs-f-lab">公司</span>${coChips(ui.rgEdCo??(g.co||""),"rgEdCo")}<span class="fs-f-lab">About 介紹</span><textarea id="rgEdIntro" rows="2" class="t-wel-ta rg-intro" maxlength="300" placeholder="輸入文字">${esc(it??(g.intro||""))}</textarea><span class="fs-f-lab">代表色</span><div class="rs-sw rs-sw-m">${GRADS.map((x,i)=>`<button class="${c===i?"on":""}" style="background:${grad(i)}" data-a="rgEdColor" data-v="${i}" aria-label="代表色 ${i+1}"></button>`).join("")}</div><button class="t-mbtn main" data-a="rgEditOk">儲存</button><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); }
function saveRoster(fn){ const r=S.get(K.roster,{groups:[],members:{},accounts:{}}); fn(r); S.set(K.roster,r); }

/* =========================================================
   發文的照片、影片
   ・測試版：存在這支手機（照片另外留一份備份）
   ・正式版：接上 Firebase 後改存到雲端
   ========================================================= */
function postMediaHtml(p){
  const ms=p.media||[]; if(!ms.length) return "";
  if(ms[0].kind==="video"){ const v=ms[0]; return `<button class="pm-video" data-a="playVideo" data-mid="${v.mid}" style="aspect-ratio:${v.w||16}/${v.h||9}" aria-label="播放影片">${v.thumb?`<img data-mid="${v.thumb}" alt="">`:""}<span class="pm-play">${PLAY}</span>${v.dur?`<em>${fmtDur(v.dur)}</em>`:""}</button>`; }
  if(ms.length===1) return `<button class="pm-one" data-a="pmGal" data-v="${p.id}" aria-label="照片"><span class="imgph"><i>HAECHU</i></span><img data-mid="${ms[0].mid}" alt=""></button>`;
  /* 多張：像 Weverse 直接在卡片裡左右滑，下面小圓點 */
  return `<div class="pm-cw"><div class="pm-car">${ms.map((x,i)=>`<button class="pm-ci" data-a="pmGal" data-v="${p.id}" aria-label="照片 ${i+1}"><span class="imgph"><i>HAECHU</i></span><img class="pm-bb" data-mid="${x.mid}" alt=""><img data-mid="${x.mid}" alt=""></button>`).join("")}</div><div class="pm-dots">${ms.map((_,i)=>`<i class="${i?"":"on"}"></i>`).join("")}</div></div>`;
}
function videoThumb(file){ return MB.thumb(file).then(r=>r||videoThumbV(file)).catch(()=>videoThumbV(file)); }
function videoThumbV(file){ return new Promise(res=>{ const u=URL.createObjectURL(file), v=document.createElement("video"); let done=false;
  const fin=x=>{ if(done) return; done=true; URL.revokeObjectURL(u); res(x); };
  v.muted=true; v.playsInline=true; v.preload="auto"; v.setAttribute("playsinline",""); v.setAttribute("muted","");
  let sk=false; const seek=()=>{ if(sk) return; sk=true; try{ v.pause(); v.currentTime=Math.min(1,(v.duration||1)/3); }catch(e){ fin(null); } };
  v.onloadeddata=seek; v.onloadedmetadata=()=>{ const p=v.play(); if(p&&p.then) p.then(()=>setTimeout(seek,150)).catch(()=>{}); };   /* iPhone：不先播一下常常拿不到畫面 */
  v.onseeked=()=>{ try{ const k=Math.min(1,720/Math.max(v.videoWidth,v.videoHeight)), c=document.createElement("canvas"); c.width=Math.round(v.videoWidth*k); c.height=Math.round(v.videoHeight*k);
    c.getContext("2d").drawImage(v,0,0,c.width,c.height); c.toBlob(b=>fin({blob:b,w:v.videoWidth,h:v.videoHeight,dur:v.duration}),"image/jpeg",.8); }catch(e){ fin(null); } };
  v.onerror=()=>fin(null); setTimeout(()=>fin(null),20000); v.src=u; }); }
async function addPostMedia(files){
  const list=ui.composeMedia||(ui.composeMedia=[]);
  for(let f of files){
    if(f.type.startsWith("video/")){ if(list.length){ toast("影片要單獨發一則，不能跟照片放在一起"); continue; } if(MB.ok()&&f.size<=600*1024*1024) f=await MB.prep(f);   /* 手機上先壓小（mediabunny） */
      if(f.size>40*1024*1024){ toast("影片太大了，請小於 40MB"); continue; }
      const id="pv"+Date.now(), th=await videoThumb(f); await MDB.put(id,f); let thumb=null; if(th&&th.blob){ thumb=id+"_t"; await MDB.put(thumb,th.blob); }
      list.push({kind:"video",mid:id,thumb,w:th&&th.w||16,h:th&&th.h||9,dur:th&&th.dur||0}); break; }
    if(f.type.startsWith("image/")){ if(list.some(x=>x.kind==="video")){ toast("已經放了影片，照片請另外發"); continue; } if(list.length>=4){ toast("一則最多 4 張照片"); break; }
      try{ const {blob,w,h}=await prepPhoto(f), id="pp"+Date.now()+list.length; await MDB.put(id,blob); list.push({kind:"photo",mid:id,w,h}); }catch(e){ toast("這張照片讀不出來，換一張試試"); } }
  }
}

/* 影片沒有封面（上傳時手機抓不到畫面）：有人播放時順手截一張補上，之後大家都看得到 */
async function vThumbFix(mid,v){ try{ const L=S.get(K.debut,[])||[], hit=L.filter(x=>(x.mv&&x.mv.mid===mid&&!x.mv.thumb)||(x.mvt&&x.mvt.mid===mid&&!x.mvt.thumb)), V=S.get(K.vods,[])||[], vh=V.filter(x=>x.mid===mid&&!x.thumb); if(!hit.length&&!vh.length) return;
  const k=Math.min(1,720/Math.max(v.videoWidth||1,v.videoHeight||1)), c=document.createElement("canvas"); c.width=Math.round(v.videoWidth*k); c.height=Math.round(v.videoHeight*k); if(!c.width) return; c.getContext("2d").drawImage(v,0,0,c.width,c.height);
  const b=await new Promise(r=>c.toBlob(r,"image/jpeg",.8)); if(!b) return; const id=mid+"_t"; await MDB.put(id,b,true); if(!await hbUpload(id,b)) return;
  if(hit.length){ const L2=S.get(K.debut,[])||[]; L2.forEach(x=>{ if(x.mv&&x.mv.mid===mid&&!x.mv.thumb) x.mv.thumb=id; if(x.mvt&&x.mvt.mid===mid&&!x.mvt.thumb) x.mvt.thumb=id; }); S.set(K.debut,L2); }
  if(vh.length) S.set(K.vods,(S.get(K.vods,[])||[]).map(x=>x.mid===mid&&!x.thumb?{...x,thumb:id}:x)); }catch(e){} }
/* 貼文裡的影片：就地播放（不另外開黑畫面）；貼文內頁一打開就靜音自動播，按了才有聲音 */
function pmInline(b,snd){ const mid=b&&b.dataset.mid; if(!mid||!b.isConnected) return; const w=document.createElement("div"); w.className="pm-video playing"; w.setAttribute("style",b.getAttribute("style")||"");
  const v=document.createElement("video"); v.controls=true; v.playsInline=true; v.setAttribute("playsinline",""); v.setAttribute("webkit-playsinline",""); v.preload="auto"; v.muted=!snd; v.loop=!snd;
  const im=b.querySelector("img[src]"); if(im) v.poster=im.src; w.appendChild(v); const sp=document.createElement("span"); sp.className="pm-spin"; w.appendChild(sp); b.replaceWith(w);
  ["click","pointerdown","touchstart"].forEach(k=>w.addEventListener(k,e=>e.stopPropagation()));
  v.addEventListener("volumechange",()=>{ if(!v.muted) v.loop=false; }); v.addEventListener("playing",()=>w.classList.add("on"));
  v.addEventListener("canplay",()=>w.classList.add("on")); vidOpen(v,mid,w); }
/* 影片一按就播：手機裡有就直接放；沒有就直接用雲端網址邊下載邊播（不用等整支下載完）；網址播不了才退回整支下載 */
function vidStream(v,mid,onFail){ const urls=[]; try{ if(HB_ON&&!sbxOn()){ if(MEDIA_URL) urls.push(MEDIA_URL+"/media/"+encodeURIComponent(mid)); urls.push(HB_URL+"/storage/v1/object/public/media/"+encodeURIComponent(mid)); } }catch(e){}
  let i=0, ok=false, t=0; v.crossOrigin="anonymous";
  const tryPlay=()=>{ const p=v.play(); if(p&&p.catch) p.catch(e=>{ if(e&&e.name==="NotAllowedError"&&!v.muted){ v.muted=true; v.play().catch(()=>{}); } }); };
  const next=()=>{ clearTimeout(t); if(ok) return; if(i>=urls.length){ v.removeEventListener("error",next); v.removeAttribute("crossorigin"); onFail(); return; } v.src=urls[i++]; tryPlay(); t=setTimeout(next,8000); };
  v.addEventListener("loadedmetadata",()=>{ ok=true; clearTimeout(t); v.removeEventListener("error",next); },{once:true}); v.addEventListener("error",next); next(); }
function vidOpen(v,mid,box){ v.addEventListener("timeupdate",function f(){ if(v.currentTime<1.2) return; v.removeEventListener("timeupdate",f); vThumbFix(mid,v); });
  const play=u=>{ const p=v.play(); if(p&&p.catch) p.catch(e=>{ if(e&&e.name==="NotAllowedError"&&!v.muted){ v.muted=true; v.play().catch(()=>{}); } }); };
  const dl=()=>{ if(box) box.classList.add("dl"); mediaSrc(mid).then(u=>{ if(box) box.classList.remove("dl"); if(!u){ if(box) box.classList.add("on"); toast("這部影片已經不在這支手機上了"); if(!box||box.classList.contains("pv-box")){ if(box&&ovl.contains(box)) ovlClose(); else layer.innerHTML=""; } return; } if(!v.isConnected) return; v.src=u; play(); }); };
  if(mediaURL[mid]){ v.src=mediaURL[mid]; play(); return; }
  if(memBlobs[mid]){ mediaSrc(mid).then(u=>{ v.src=u; play(); }); return; }
  vidStream(v,mid,dl); }
function playVideo(mid){
  setLayer(`<div class="ph-view" data-a="tCloseLayer" role="dialog" aria-label="影片"><button class="ph-x" data-a="tCloseLayer" aria-label="關閉">${XI}</button><div class="pv-box"><video id="pvPlayer" controls playsinline webkit-playsinline preload="auto"></video><span class="pm-spin"></span></div></div>`,"video");
  const v=document.getElementById("pvPlayer"), box=v.parentNode; v.addEventListener("click",e=>e.stopPropagation()); v.addEventListener("playing",()=>box.classList.add("on")); v.addEventListener("canplay",()=>box.classList.add("on"));
  vidOpen(v,mid,box);
}

/* =========================================================
   紀念日
   ・TIE 連續訂閱滿 100／200／365／500／1000 天：自動收到藝人事先寫好的紀念日訊息
   ・Membership 滿一年：收到通知
   ・藝人生日：生日前 7 天開始倒數，粉絲可以一起送祝福
   ========================================================= */
const MILESTONES=[50,77,100,150,200,300,365,400,500];   // 照 Bubble：訂閱天數到了，就是紀念日，能傳的字數也跟著變多

function deliverMilestones(){
  const done=S.get(K.msDone,{}); let changed=false;
  Object.keys(subs()).forEach(mid=>{ if(!MEMBERS[mid]||!isActive(mid)) return; const d=subDays(mid), got=done[mid]||[];
    const hit=MILESTONES.filter(m=>m<=d&&!got.includes(m)); if(!hit.length) return;
    const m=hit[hit.length-1]; done[mid]=[...got,...hit]; changed=true;
    if(d-m>3) return;   // 太久以前的就不補發
    pushNotification({kind:"whisper",member:mid,group:MEMBERS[mid].group,text:`🎉 今天是你和 ${artName(mid,"tie")} 的 ${m} 天紀念日！傳訊息的字數上限變成 ${m} 字`,color:null,direct:true}); });
  Object.keys(getMS()).forEach(gid=>{ const r=getMS()[gid]; if(!r||!isMember(gid)) return; const yrs=Math.floor((Date.now()-r.since)/(365*864e5)); const k="ms:"+gid;
    if(yrs>=1&&(done[k]||0)<yrs){ done[k]=yrs; changed=true; const list=S.get(K.notifs,[]); list.unshift({id:"n"+Date.now()+gid,kind:"core",direct:true,group:gid,text:`💎 你加入 ${groupOf(gid).name} Membership 滿 ${yrs} 年了，謝謝你一直都在！`,ts:Date.now()}); S.set(K.notifs,list.slice(0,100)); S.set(K.unread,"1"); } });
  if(changed) S.set(K.msDone,done);
}
const getBdays=()=>({...S.get(K.bdays,{})});
function bdayLeft(mid){ const b=getBdays()[mid]||MEMBERS[mid]&&MEMBERS[mid].bday; if(!b) return null; const [mm,dd]=b.split("-").map(Number), now=new Date(), t0=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  let t=new Date(now.getFullYear(),mm-1,dd); if(t<t0) t=new Date(now.getFullYear()+1,mm-1,dd); return Math.round((t-t0)/864e5); }
const wishKey=mid=>mid+":"+new Date().getFullYear();



/* ===== 藝人 TIE 沒傳訊息：連續 3 天提醒藝人、通知管理員；連續 4 天扣積分 ===== */
const artistMids=()=>Object.keys(MEMBERS).filter(id=>MEMBERS[id]&&!MEMBERS[id].official&&Object.values(ACCOUNTS).some(a=>a&&a.member===id));
function tieLastArt(mid){ let t=0; getWhispers().forEach(w=>{ if(w.member===mid&&w.from==="artist"&&w.ts>t) t=w.ts; }); return t; }
function tieQuiet(){ const now=Date.now(), Q0=S.get(K.tieQ0,{})||{}, out=[];
  artistMids().forEach(mid=>{ const last=tieLastArt(mid), base=last||Q0[mid]; if(!base) return; const days=calDay(now)-calDay(base);
    if(days>=3){ const d0=new Date(base); d0.setHours(0,0,0,0); out.push({mid,days,last,at:d0.getTime()+3*DAY}); } });
  return out; }
/* 還沒傳過 TIE 的藝人：從第一次被看到的那天開始算 */
function tieQ0Mark(){ try{ if(!isAdminAcct()||(HB_ON&&HB.ver[K.whispers]==null)) return; const Q=S.get(K.tieQ0,{})||{}; let ch=false; artistMids().forEach(mid=>{ if(!Q[mid]&&!tieLastArt(mid)){ Q[mid]=Date.now(); ch=true; } }); if(ch) S.set(K.tieQ0,Q); }catch(e){} }

/* ===== 分潤：每月 1 號結算上個月，粉絲花在藝人身上的積分 × 藝人分得比例（預設 15%），不設上限（她 10/27 定） ===== */
const REVB_RATE=1, REVB_CAP=Infinity, REVB_FIRST="2026-10";
/* 舊的預設 50% 換成 15%（只換一次；之後管理員自己改的就照管理員的） */
setTimeout(()=>{ try{ if(!isAdminAcct()||S.get("daisuki_rev15",0)) return; if(HB_ON&&HB.ver[K.revShare]===undefined&&!HB.pulled) return; const v=S.get(K.revShare,null); if(v==null||v===50) S.set(K.revShare,15); S.set("daisuki_rev15",1); }catch(e){} },20e3);
/* 11/12：15% 換成 10%（只換一次；管理員之後自己改的照管理員的） */
setTimeout(()=>{ try{ if(!isAdminAcct()||S.get("daisuki_rev10",0)) return; if(HB_ON&&HB.ver[K.revShare]===undefined&&!HB.pulled) return; const v=S.get(K.revShare,null); if(v==null||v===15||v===50) S.set(K.revShare,10); S.set("daisuki_rev10",1); }catch(e){} },25e3);
const ymKey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
function revBSettle(){ try{ if(!isAdminAcct()||(HB_ON&&HB.ver[K.sales]==null)) return;   /* 雲端資料還沒載入就先不結算 */ const now=new Date(), last=new Date(now.getFullYear(),now.getMonth()-1,1), key=ymKey(last); if(key<REVB_FIRST) return;
    const done=S.get(K.revB,{})||{}; if(done[key]) return;
    const a=last.getTime(), b=new Date(now.getFullYear(),now.getMonth(),1).getTime(), sh=revShare(), by={};
    S.get(K.sales,[]).filter(x=>x.ts>=a&&x.ts<b).forEach(x=>{ if((x.type==="tie"||x.type==="truck")&&x.mid) by[x.mid]=(by[x.mid]||0)+x.pts; else if(x.gid){ const ids=groupArtists(x.gid); ids.forEach(id=>{ by[id]=(by[id]||0)+x.pts/Math.max(1,ids.length); }); } });
    const L=S.get(K.ptGrants,[])||[], have=new Set(L.map(g=>g.id)), res={}, mon=last.getMonth()+1;
    Object.keys(by).forEach(mid=>{ const n=Math.min(REVB_CAP,Math.round(by[mid]*sh/100*REVB_RATE)); if(n<=0) return;
      const em=Object.keys(ACCOUNTS).find(e=>ACCOUNTS[e]&&ACCOUNTS[e].member===mid); if(!em) return; const id="rb"+key+"_"+mid; res[mid]=n;
      if(!have.has(id)) L.push({id,to:em,n,why:`${mon} 月分潤`,by:"auto",ts:b}); });
    S.set(K.ptGrants,L.slice(-2000)); done[key]={ts:Date.now(),res}; S.set(K.revB,done); }catch(e){} }
/* 連續第 4 天起：每多一天扣一次，扣 30 天 TIE 券價格的 30%（ion 10%、Kirin 50% 的中間） */
const TIE_QUIET_FINE=()=>"目前積分的 30%";
/* 藝人的扣分（tqf2_）：從藝人自己的積分扣 */
const artFines=(mid,since)=>ptGrants().filter(g=>g.mid===mid&&(String(g.id).startsWith("tqf2_")||g.art)&&(!since||g.ts>=since)).reduce((s,g)=>s+(g.n||0),0);
function tieQuietFine(){ try{ if(!isAdminAcct()||(HB_ON&&(HB.ver[K.whispers]==null||HB.ver[K.ptGrants]==null&&Object.keys(HB.ver).length<3))) return; const L=S.get(K.ptGrants,[])||[], have=new Set(L.map(g=>g.id)); let add=0;
  tieQuiet().forEach(q=>{ if(q.days<4) return; const em=Object.keys(ACCOUNTS).find(e=>ACCOUNTS[e]&&ACCOUNTS[e].member===q.mid); if(!em) return; const b0=calDay(q.at)-3;
    for(let d=4;d<=q.days;d++){ const id=`tqf2_${q.mid}_${b0}_${d}`; if(have.has(id)) continue; const cur=Math.max(0,((pointsOf(q.mid)||{}).net||0)+L.filter(g=>g.mid===q.mid&&(String(g.id).startsWith("tqf2_")||g.art)&&!ptGrants().some(x=>x.id===g.id)).reduce((s,g)=>s+(g.n||0),0)), n=Math.round(cur*.3); have.add(id); if(n<=0) continue; L.push({id,to:"art:"+q.mid,mid:q.mid,n:-n,why:`${WHISPER_NAME} 連續 ${d} 天沒傳訊息`,by:"auto",ts:q.at+(d-3)*864e5}); add++; } });
  if(add) S.set(K.ptGrants,L.slice(-2000)); }catch(e){} }
/* 藝人生日：當天送「🎂 今天是 ○○ 的生日。留下生日祝福吧！」給追蹤的粉絲（一年一次，由管理員的手機送） */
function bdayPush(){ try{ if(!isAdminAcct()||(HB_ON&&HB.ver[K.feed]==null)) return; const now=new Date(), md=(now.getMonth()+1)+"-"+now.getDate(), y=now.getFullYear(), B=getBdays(), P=S.get(K.bdPush,{})||{}; let ch=false;
  Object.keys(MEMBERS).forEach(mid=>{ const m=MEMBERS[mid]; if(!m||m.official||!groupOf(m.group)) return; const b=String(B[mid]||m.bday||"").replace(/^0/,"").replace(/-0/,"-"); if(b!==md||P[mid]===y) return;
    P[mid]=y; ch=true; feedPush({kind:"bday",member:mid,group:m.group,text:"",color:null},"g:"+m.group); });
  if(ch) S.set(K.bdPush,P); }catch(e){} }
setTimeout(()=>{ revBSettle(); tieQ0Mark(); tieQuietFine(); bdayPush(); },6000); setInterval(()=>{ revBSettle(); tieQ0Mark(); tieQuietFine(); bdayPush(); },30*60e3);

