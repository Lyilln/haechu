/* HAECHU｜MEET 直播 */
/* =========================================================
   MEET（照 NSY 的直播規則）
   ・列表：今日狀態列 → 直播大卡 → 重播
   ・直播間：藝人說的話先在舞台中央停 6 秒，再落進留言串；前面會出現「正在輸入中」
   ・愛心雨、在看人數浮動、直播結束畫面、重播可以看當時的對話
   ========================================================= */
const HERO_MS=6000;
const mmss=l=>{const s0=Math.max(60,Math.round(((l.endTs||Date.now())-l.startTs)/1000));const h=s0/3600|0,m=(s0%3600)/60|0,x=s0%60;return (h?h+":"+pad(m):m)+":"+pad(x)};
const kfmt=n=>n>=10000?(n/1000).toFixed(1).replace(/\.0$/,"")+"k":fmt(n);
const hfmt=n=>n>=1000?(n/1000).toFixed(1).replace(/\.0$/,"")+"k":String(n);
const liveArt=l=>l.msgs.filter(x=>x.from==="artist");
/* ===== 直播連線（串台）：開播的藝人可以邀請一位別團（或 SOLOIST）的藝人一起直播 ===== */
const lvWho=(x,l)=>x.mid||l.member;
const coOn=l=>!!(l&&l.co&&l.co.st==="on"&&MEMBERS[l.co.mid]);
const liveGuestOf=mid=>getLives().find(l=>!l.endTs&&l.co&&l.co.mid===mid&&l.co.st==="on");
const myLive=mid=>liveNow(mid)||liveGuestOf(mid);
const coInvites=mid=>getLives().filter(l=>!l.endTs&&l.co&&l.co.mid===mid&&l.co.st==="inv"&&MEMBERS[l.member]);

const repQ=r=>`回覆 @${esc(r.name)}：「${esc(r.text)}」`;
function relDay(ts){ const d0=new Date();d0.setHours(0,0,0,0); const dd=Math.round((d0-new Date(ts).setHours(0,0,0,0))/864e5); return dd<=0?"今天":dd===1?"昨天":dd<7?dd+" 天前":ymd(ts); }
function whenTxt(ts){ const t=new Date(ts), d0=new Date(); d0.setHours(0,0,0,0); const dd=Math.round((new Date(ts).setHours(0,0,0,0)-d0)/864e5);
  const day=dd===0?(t.getHours()>=18?"今晚":"今天"):dd===1?"明天":dd===2?"後天":`${t.getMonth()+1}/${t.getDate()}（${WD[t.getDay()]}）`; return day+" "+pad(t.getHours())+":"+pad(t.getMinutes()); }
function leftTxt(ts){ const d=ts-Date.now(); if(d<=0) return "隨時開播"; const h=Math.floor(d/36e5); if(h>=24) return ""; return h?`還有 ${h} 小時`:`還有 ${Math.max(1,Math.floor(d/6e4))} 分鐘`; }

/* ---------- MEET 列表（卡片模式） ---------- */
function nowCard(l){   // 直播中：大張卡片（藝人的背景圖），左上 LIVE，左下名字、標題、心心
  const m=MEMBERS[l.member];
  return `<button class="nc lvh cv-fit" data-a="openLive" data-id="${l.id}" style="${lvCoverFit(l.member,l)}">
    <span class="lvh-shade"></span><span class="lvh-live">LIVE<i></i></span>
    <span class="lvh-b"><b>${esc(artName(l.member,"live"))}<em class="dl-vf">${I.verified}</em></b><span class="lvh-t">${esc(l.title)}</span><span class="lvh-h">${LV_IC.heartO}${kfmt(l.hearts)}</span></span></button>`;
}
function planRow(p,artist=false){
  const m=MEMBERS[p.member], left=leftTxt(p.ts);
  return `<div class="pr"><span class="pr-av" style="background:${grad(m.g)}">${mAvIn(p.member)}</span>
    <span class="pr-i"><b>${esc(p.title)}</b><small>${esc(artName(p.member,"live"))}・${whenTxt(p.ts)}${left?"・"+left:""}</small></span>
    ${artist?`<span class="pr-c">${fmt(p.count)} 人等你</span><button class="del" data-a="delPlan" data-id="${p.id}">刪除</button>`
      :`<button class="pr-rm ${p.mine?"on":""}" data-a="remind" data-id="${p.id}" aria-pressed="${p.mine}">${p.mine?"已提醒":"提醒我"}</button>`}</div>`;
}
function replayRow(l){
  const d=new Date(l.startTs);
  return `<div class="rr lvr"><button class="rr-th lvr-th cv-fit" data-a="openReplay" data-id="${l.id}" style="${lvCoverFit(l.member,l)}" aria-label="${esc(artName(l.member,"live"))} 的重播"><em>${mmss(l)}</em></button>
    <button class="rr-i lvr-i" data-a="openReplay" data-id="${l.id}"><b>${esc(artName(l.member,"live"))}<em class="dl-vf">${I.verified}</em></b><span>${esc(l.title)}</span><small>${d.getMonth()+1}月${d.getDate()}日</small></button></div>`;
}
const rpSorted=L=>L.slice().sort((a,b)=>ui.rpSort==="old"?a.startTs-b.startTs:b.startTs-a.startTs);
const rpHead=()=>`<div class="lvr-h"><h2>重播</h2><span class="lvr-sort"><button class="${ui.rpSort==="old"?"":"on"}" data-a="rpSort" data-v="new">最新優先</button><button class="${ui.rpSort==="old"?"on":""}" data-a="rpSort" data-v="old">最舊優先</button></span></div>`;
const planHit=(q,p)=>{const m=MEMBERS[p.member],g=groupOf(p.group);return hit(q,p.title,m&&m.name,g&&g.name)};
function viewFanLive(){
  const f=scopeF(), q=srchQ("meet");
  const all=getLives().filter(l=>f.includes(l.group));
  const lives=all.filter(l=>liveHit(q,l));
  const on=lives.filter(l=>!l.endTs), rep=lives.filter(l=>l.endTs).sort((a,b)=>b.startTs-a.startTs);
  const onIds=new Set(on.map(l=>l.member));
  const plans=getPlans().filter(p=>f.includes(p.group)&&!onIds.has(p.member)&&planHit(q,p));
  const mine=getEvents().filter(e=>e.mine&&e.ts>=Date.now()&&evHit(q,e));
  const head=fanHeader(true,"meet","搜尋直播或重播內容...");
  if(q) return head+`<main class="page meet">${srchLabel("meet")}${!on.length&&!rep.length&&!mine.length?srchEmpty("直播或重播"):`
    ${on.map(nowCard).join("")}
    ${rep.length?`<h2 class="meet-h">重播</h2>${rep.map(replayRow).join("")}`:""}
    ${mine.length?`<h2 class="meet-h">我預約的活動</h2>${mine.map(e=>eventCard(e)).join("")}`:""}`}</main>`;
  const todayLive=all.filter(l=>isToday(l.startTs)).length;
  const todayTie=Object.keys(subs()).reduce((n,id)=>n+fanRoom(id).filter(w=>w.from==="artist"&&isToday(w.ts)).length,0);
  const je=ui.justEnded&&getLive(ui.justEnded);
  return head+`<main class="page meet">
    ${je?`<div class="just"><button class="just-b" data-a="openReplay" data-id="${je.id}"><span class="just-ic">${PLAY}</span><span><b>剛剛結束的直播</b><small>${esc(je.title)}・點一下看重播</small></span></button><button class="just-x" data-a="justClose" aria-label="關閉">${XI}</button></div>`:""}
    ${on.length?on.map(nowCard).join(""):""}
    ${rpHead()}
    ${rep.length?rpSorted(rep).slice(0,20).map(replayRow).join(""):`<p class="meet-empty">尚無重播</p>`}
    ${mine.length?`<h2 class="meet-h">我預約的活動</h2>${mine.map(e=>eventCard(e)).join("")}`:""}
  </main>`;
}

/* ---------- 粉絲：直播間（卡片模式） ----------
   ・藝人最新一句話放在中間的大白卡（聚光燈卡），舊的話疊在後面、也列在下面的時間軸
   ・藝人可以「回覆」某位粉絲的留言，卡片上會引用那則留言
   ・粉絲留言縮成左下角的小膠囊；被藝人回覆的那則會變成白色
   ・心心每破 1,000 會跳出里程碑 */
/* 藝人一次說很長：照句子拆成好幾張一樣大的卡片，一張一張出來 */
const LV_MAX=38, LV_GAP=700;
function lvSplit(t){ t=String(t||"").trim(); if(t.length<=LV_MAX) return [t];
  const parts=(t.match(/[^。！？!?…～~\n]+[。！？!?…～~]*|\n/g)||[t]).map(x=>x.replace(/\n/g,"").trim()).filter(Boolean), out=[]; let cur="";
  parts.forEach(p=>{ if(p.length>LV_MAX){ if(cur){ out.push(cur); cur=""; } const n=Math.ceil(p.length/LV_MAX), sz=Math.ceil(p.length/n); for(let i=0;i<p.length;i+=sz) out.push(p.slice(i,i+sz)); return; }
    if((cur+p).length>LV_MAX){ out.push(cur); cur=p; } else cur+=p; });
  if(cur) out.push(cur); return out.length?out:[t]; }
function lvPieces(l,mid){ const out=[], now=Date.now(); liveArt(l).filter(a=>!mid||lvWho(a,l)===mid).forEach(a=>{ const P=lvSplit(a.text); P.forEach((p,k)=>{ if(a.ts+k*LV_GAP<=now||k===0) out.push({...a,text:p,reply:k?null:a.reply,k,n:P.length,ts:a.ts+k*LV_GAP}); }); }); return out; }
const lvLast=l=>{ const P=lvPieces(l); return P[P.length-1]||null; };
function spotKey(l){ const cur=lvLast(l), typing=!!(l.typingTs&&Date.now()-l.typingTs<4500), tg=!!(l.typingG&&Date.now()-l.typingG<4500), fresh=!!(cur&&Date.now()-cur.ts<HERO_MS); return [cur?cur.ts:0,typing,tg,fresh,cur?ago(cur.ts):"",coOn(l)?l.co.mid:""].join("|"); }
/* 直播：藝人說的韓文附上中文翻譯（卡片大小不變：原文縮成 2 行、翻譯 2 行） */
const lvTrKey=(l,c)=>l.id+"|"+c.ts;
const lvTrGet=(l,c)=>(S.get(K.liveTr,{})||{})[lvTrKey(l,c)]||"";
const lvTrBusy=new Set();
function lvTrNeed(l,c){ const k=lvTrKey(l,c); if(lvTrGet(l,c)||lvTrBusy.has(k)) return; lvTrBusy.add(k);
  translateMany([koPre(c.text)],"zh").then(out=>{ const t=out&&String(out[0]||"").trim(); if(!t) return; const all={...(S.get(K.liveTr,{})||{})}; all[k]=t; const ks=Object.keys(all); if(ks.length>400) ks.slice(0,ks.length-400).forEach(x=>delete all[x]); try{ S.set(K.liveTr,all); }catch(e){}
    const sp=document.getElementById("cmSpot"); const L=getLive(l.id); if(sp&&L&&!L.endTs) sp.innerHTML=spotHtml(L); }).catch(()=>{}).finally(()=>lvTrBusy.delete(k)); }
/* 連線中：兩位藝人各自一疊卡片，不共用 */
function spotHtml(l,host=false){ return coOn(l)?`<div class="sp-duo">${spotOne(l,host,l.member)}${spotOne(l,host,l.co.mid)}</div>`:spotOne(l,host,l.member); }
function spotOne(l,host,who){
  const m=MEMBERS[who], arts=lvPieces(l,who), cur=arts[arts.length-1], toMe=!host&&cur&&mineX(cur.reply);
  const typing=who===l.member?l.typingTs&&Date.now()-l.typingTs<4500:l.typingG&&Date.now()-l.typingG<4500, fresh=cur&&Date.now()-cur.ts<HERO_MS, prev=arts.slice(Math.max(0,arts.length-3),-1);
  return `<div class="sp-deck n${prev.length}">${prev.map((x,i)=>`<div class="sp-back b${prev.length-i}" aria-hidden="true"><p>${esc(x.text)}</p></div>`).join("")}
    <div class="sp-card ${toMe?"to-me":""}">
      <div class="sp-h"><span class="sp-av" style="background:${grad(m.g)}">${mAvIn(who)}</span><div><b>${esc(artName(who,"live"))} ${I.verified}</b><span>${cur?ago(cur.ts):"準備中"}</span></div>${toMe?'<span class="sp-me">回覆你 💜</span>':fresh?'<span class="sp-now">NOW</span>':""}</div>
      ${cur?`${cur.reply?`<div class="sp-rep">${toMe?`回覆 @你：「${esc(cur.reply.text)}」`:repQ(cur.reply)}</div>`:""}${(()=>{ const ko=(!host||who!==(session()||{}).member)&&hasHangul(cur.text), tr=ko&&lvTrGet(l,cur);   /* 藝人端：其他藝人說的話也翻；自己的不翻 */ if(ko&&!tr) setTimeout(()=>lvTrNeed(l,cur),0); return tr?`<p class="sp-t has-tr">${esc(cur.text)}</p><p class="sp-tr">${esc(tr)}</p>`:`<p class="sp-t">${esc(cur.text)}</p>`; })()}`:`<p class="sp-t wait">${host&&who===l.member?esc(l.title||""):esc(artName(who,"live"))+(who===l.member?" 馬上就來，先跟大家打聲招呼吧 ✨":" 加入連線了 ✨")}</p>`}
      <div class="sp-typing ${typing&&!host?"on":""}"><b><i></i><i></i><i></i></b>${esc(artName(who,"live"))} 正在寫下一句…</div>
    </div></div>`;
}
function tlHtml(l){ return liveArt(l).slice(0,-1).slice(-2).reverse().map(x=>`<div class="tl"><em>${timeHM(x.ts)}</em><span>${esc(x.text)}</span></div>`).join(""); }
function tickHtml(l){
  const fans=l.msgs.filter(x=>x.from!=="artist"), lastIdx={}; fans.forEach((x,i)=>{ lastIdx[(x.name||"")+"|"+x.text]=i; });
  const pinned=new Set(); liveArt(l).filter(x=>x.reply).forEach(a=>{ const r=a.reply; const i=r.ts!=null?fans.findIndex(x=>x.ts===r.ts):lastIdx[r.name+"|"+r.text]; if(i!=null&&i>=0) pinned.add(i); });
  const st=Math.max(0,fans.length-200), hostV=(session()||{}).role==="artist";   /* 藝人端：粉絲留言下面附翻譯 */
  const g0=groupOf((MEMBERS[l.member]||{}).group)||{}, note=`<div class="dl-note" data-k="note"><i>!</i>為了與 ${esc(g0.name||"")} 愉快交流，請保持禮貌！不當聊天可能會受限。</div>`;   /* 提示放在留言最前面：跟著留言一起往上捲，每次進來都看得到 */
  return note+fans.slice(-200).map((x,j)=>{ const pin=pinned.has(st+j);
    const k=esc(x.ts+"|"+(x.name||x.from)); return mineX(x)?`<div class="tk me ${pin?"pin":""}" data-k="${k}">${pin?"<i>💬</i>":""}<b>你</b>${esc(x.text)}</div>`:`<button class="tk ${pin?"pin":""}" data-k="${k}" data-a="liveRep" data-ts="${x.ts}">${pin?"<i>💬</i>":""}<b>${esc(x.name||"粉絲")}</b>${esc(x.text)}${hostV?trBelow("lv:"+l.id+":"+x.ts+":"+(x.name||""),x.text):""}</button>`; }).join("");
}
/* 直播人數：實際在這場直播裡的人（留過言的粉絲＋正在看的你），不再用假的上千人 */
/* 粉絲留言：新的從下面推上來，舊的往上滑走（不再整排重畫、一閃一閃） */
function updTick(box,html){ const tmp=document.createElement("div"); tmp.innerHTML=html; const old={}; [...box.children].forEach(el=>{ old[el.dataset.k]=el; });
  const near=box.scrollHeight-box.scrollTop-box.clientHeight<48; let added=0; const keep=new Set();
  [...tmp.children].forEach(n=>{ const o=old[n.dataset.k]; if(o){ keep.add(o); if(o.className.replace(" tk-new","")!==n.className||o.innerHTML!==n.innerHTML){ o.className=n.className; o.innerHTML=n.innerHTML; } } else { n.classList.add("tk-new"); box.appendChild(n); keep.add(n); added++; } });
  [...box.children].forEach(el=>{ if(!keep.has(el)) el.remove(); });
  const pill=document.getElementById("tkNew");
  if(near){ box.scrollTo({top:box.scrollHeight,behavior:"smooth"}); if(pill){ pill.hidden=true; ui.tkUnseen=0; } }
  else if(added&&pill){ ui.tkUnseen=(ui.tkUnseen||0)+added; pill.innerHTML=pill.classList.contains("dl-down")?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 6 5 5 5-5M7 12l5 5 5-5"/></svg>':`${ui.tkUnseen} 則新留言 ↓`; pill.hidden=false; } }
document.addEventListener("scroll",e=>{ const b=e.target; if(!b||b.id!=="cmTick") return; if(b.scrollHeight-b.scrollTop-b.clientHeight<48){ const p=document.getElementById("tkNew"); if(p&&!p.hidden){ p.hidden=true; ui.tkUnseen=0; } } },true);
const liveViewers=l=>{ if(!l||l.endTs) return 0; const ppl=new Set((l.msgs||[]).filter(x=>x.from!=="artist").map(x=>x.from==="me"?(x.by||"me"):(x.name||"粉絲"))); const s=session(); if(s&&s.role==="fan") ppl.add("me"); return Math.max(1,ppl.size); };
const LV_IC={exit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7"/><path d="M11 12h10M17.5 8.5 21 12l-3.5 3.5"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 3.5c4.7 0 8.5 3.4 8.5 7.8 0 4.3-3.8 7.7-8.5 7.7-1 0-2-.1-2.9-.4L5 20.5l.9-3.6C4.4 15.5 3.5 13.5 3.5 11.3 3.5 6.9 7.3 3.5 12 3.5z"/><path d="M8.5 10h7M8.5 13.5h4.5"/></svg>',
  mini:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4l-6 6M14 5.5V10h4.5M4 20l6-6M10 18.5V14H5.5"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.6s-8.4-5.1-8.4-11.2A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 8.4 3c0 6.1-8.4 11.2-8.4 11.2z"/></svg>',
  heartO:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20.2s-8-4.9-8-10.9A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8 2.7c0 6-8 10.9-8 10.9z"/></svg>'};
const lvCover=(mid,l)=>{ const p=artProf(mid), m=MEMBERS[mid], c=GRADS[m.g%GRADS.length], u=(l&&l.cv)||p.avatar||mPhoto(mid);   /* 每場直播記住開播當下的頭貼 */   // 直播、重播封面：跟著個人社群頭貼（沒換過就用 Teaser 照）
  if(u&&lvCover._fit) return `--cv:url('${u}');background:#16131A`;
  return u?`background:#000 url('${u}') center/cover no-repeat`:`background:radial-gradient(90% 60% at 70% 25%,${c[1]}cc,transparent 70%),radial-gradient(80% 60% at 20% 80%,${c[0]}cc,transparent 70%),#140B2E`; };
/* 寬的封面（直播卡、重播、開播準備）：整張頭貼（藝人裁切的範圍）都放進來，兩邊用同一張照片模糊補滿，臉才不會被切掉 */
const lvCoverFit=(mid,l)=>{ lvCover._fit=1; try{ return lvCover(mid,l); } finally{ lvCover._fit=0; } };
function lvShell(l,host,inner){ const m=MEMBERS[l.member], g=groupOf(m.group);
  return `<div class="mr cm dl ${host?"host":""} ${ui.dlUi?"ui-on":""} ${ui.dlChatOff?"chat-off":""}" data-a="dlTap">
    <div class="dl-bg" style="${lvCover(l.member,l)}"></div><span class="dl-shade"></span>
    <header class="dl-top"><span class="dl-live">LIVE<i></i></span><span class="dl-hearts">${LV_IC.heartO}<b id="mrHearts">${fmt(l.hearts)}</b></span></header>
    <div class="dl-ui"><button class="dl-exit" data-a="dlLeave" data-id="${l.id}" aria-label="${host?"結束直播":"離開直播"}">${LV_IC.exit}</button>
      <div class="dl-title"><b>${esc(l.title||"")}</b><span><i class="dl-av" style="background:${grad(m.g)}">${mAvIn(l.member)}</i>${esc(artName(l.member,"live"))}<em class="dl-vf">${I.verified}</em>${coOn(l)?`<em class="dl-x">×</em><i class="dl-av" style="background:${grad(MEMBERS[l.co.mid].g)}">${mAvIn(l.co.mid)}</i>${esc(artName(l.co.mid,"live"))}<em class="dl-vf">${I.verified}</em>`:""}</span>${(l.bgm||[]).length?`<small class="dl-song" id="dlSong"></small>`:""}</div>
      <div class="dl-side">${host&&session().member===l.member?`<button class="dl-co ${l.co&&(l.co.st==="inv"||l.co.st==="on")?"on":""}" data-a="coMenu" data-id="${l.id}" aria-label="連線">${l.co&&l.co.st==="on"&&MEMBERS[l.co.mid]?`<i class="dl-av" style="background:${grad(MEMBERS[l.co.mid].g)}">${mAvIn(l.co.mid)}</i>`:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="8" cy="9" r="3.2"/><circle cx="16" cy="9" r="3.2"/><path d="M2.8 19c.6-3 2.6-4.6 5.2-4.6 1.5 0 2.8.5 3.8 1.5M21.2 19c-.6-3-2.6-4.6-5.2-4.6-1.5 0-2.8.5-3.8 1.5"/></svg>'}</button>`:""}${(l.bgm||[]).length?`<button class="dl-bgm ${bgmIsOn(l,host)?"on":""}" data-a="bgmTap" data-id="${l.id}" aria-label="背景音樂">${BGM_IC}</button>`:""}<button data-a="dlChat" aria-label="聊天開關">${LV_IC.chat}</button><button data-a="dlMini" data-id="${l.id}" aria-label="縮小">${LV_IC.mini}</button></div></div>
    ${inner}
    <div id="heartRain" class="heart-rain"></div><div id="cmMile" class="cm-mile"></div>
  </div>`; }
function viewMeetRoom(id){
  ui.tkUnseen=0; requestAnimationFrame(()=>{ const b=document.getElementById("cmTick"); if(b) b.scrollTop=b.scrollHeight; });
  const l=getLive(id), m=MEMBERS[l.member];
  if(l.endTs) return viewMeetEnd(l);
  if(ui.lvMini===l.id) ui.lvMini=null;
  ui.mile=ui.mile||{}; if(ui.mile[l.id]==null) ui.mile[l.id]=Math.floor(l.hearts/1000);
  ui.lastH=l.hearts;
  const draft=ui.lDraft||"", cur=lvLast(l), g=groupOf(m.group);
  return lvShell(l,false,`<main class="cm-main dl-main">
      <div id="cmSpot" data-k="${esc(spotKey(l))}" data-c="${cur?cur.ts:0}">${spotHtml(l)}</div>
      <div class="dl-chat"><div class="cm-tickw"><div class="cm-tick" id="cmTick">${tickHtml(l)}</div><button type="button" class="tk-newp dl-down" id="tkNew" data-a="tkDown" hidden></button></div></div>
    </main>
    <form class="cm-foot dl-foot" id="lform"><label class="cm-in"><textarea rows="1" class="ag" id="lin" autocomplete="off" placeholder="輸入訊息">${esc(draft)}</textarea><button type="submit" class="mr-send ${draft.trim()?"on":""}" id="lsend" aria-label="送出"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/></svg></button></label>
      <button type="button" class="dl-hb" data-a="heart" data-id="${l.id}" aria-label="送愛心">${LV_IC.heart}</button></form>`);
}
function viewMeetEnd(l){
  const m=MEMBERS[l.member];
  return `<div class="mr mr-end"><div class="mr-end-c"><span class="mr-av" style="background:${grad(m.g)}">${mAvIn(l.member)}</span>
    <h2>LIVE 已結束</h2><p>感謝大家的陪伴，下次見！</p>
    <div class="mr-end-g"><div><span>直播時長</span><b>${mmss(l)}</b></div><div><span>獲得心心</span><b>${kfmt(l.hearts)}</b></div></div>
    <button class="btn btn-main btn-block" data-a="meetBack" data-id="${l.id}">回到 MEET</button>
    <button class="btn btn-soft btn-block" data-a="openReplay" data-id="${l.id}">看重播</button></div></div>`;
}
function viewReplay(id){
  const l=getLive(id), m=MEMBERS[l.member], arts=liveArt(l), art=!!ui.rpArt, c=GRADS[m.g%GRADS.length];
  const log=(art?arts:l.msgs).slice().sort((a,b)=>a.ts-b.ts);
  const ss=session()||{}, artV=ss.role==="artist"&&(ss.member===l.member||!!(l.co&&l.co.was&&l.co.mid===ss.member));
  const mine=x=>artV?x.from==="artist"&&lvWho(x,l)===ss.member:mineX(x);
  const row=x=>mine(x)?`<div class="rp2-me"><time>${timeHM(x.ts)}</time><div>${x.reply?`<q>${repQ(x.reply)}</q>`:""}<p>${esc(x.text)}</p></div></div>`
    :x.from==="artist"?`<div class="rp2-a ${lvWho(x,l)!==l.member?"rp2-g2":""}"><span class="rp2-av" style="background:${grad((MEMBERS[lvWho(x,l)]||m).g)}">${mAvIn(lvWho(x,l))}</span><div><b>${esc(artName(lvWho(x,l),"live"))} <span class="rp2-vf">${I.verified}</span></b>${x.reply?`<q>${repQ(x.reply)}</q>`:""}${trT("lv:"+l.id+":"+x.ts,x.text,"")}</div><time>${timeHM(x.ts)}</time></div>`
    :`<div class="rp2-f"><p><b>${esc(mineX(x)?"你":x.name||"粉絲")}</b>${mineX(x)?esc(x.text):trT("lv:"+l.id+":"+x.ts+":"+(x.name||""),x.text,"","span")}</p><time>${timeHM(x.ts)}</time></div>`;
  return `<div class="rp2"><div class="cm-bg"><span class="cm-blob b1" style="background:${c[0]}"></span><span class="cm-blob b2" style="background:${c[1]}"></span><span class="cm-blob b3"></span></div>
    <header class="rp2-h"><button class="rp2-x" data-a="back" aria-label="返回">${I.back}</button><span class="rp2-t"><b>${esc(l.title)}</b><small>${esc(artName(l.member,"live"))}${l.co&&l.co.was&&MEMBERS[l.co.mid]?" × "+esc(artName(l.co.mid,"live")):""}・${ymd(l.startTs)} ${timeHM(l.startTs)}・直播 ${mmss(l)}</small></span><span class="rp2-sp"></span>${(l.bgm||[]).length?`<button class="rp2-x rp-bgm ${RPB.id===l.id&&RPB.on?"on":""}" data-a="rpBgm" data-v="${l.id}" aria-label="背景音樂">${BGM_IC}</button>`:""}</header>
    <div class="seg2 rp2-seg" style="--i:${art?1:0}"><i class="seg2-ind"></i><button class="${art?"":"on"}" data-a="rpMode" data-v="all">全部留言</button><button class="${art?"on":""}" data-a="rpMode" data-v="art">${artV?"只看我說的話":"只看藝人說的話"}</button></div>
    <main class="rp2-log seg2-pane ${ui.segAnim||""}">${log.length?log.map(row).join(""):`<p class="rp2-none">${art?"這場直播藝人還沒說話":"這場直播沒有留言"}</p>`}</main></div>`;
}
/* 直播間即時更新：聚光燈卡、時間軸、留言膠囊、人數、心心 */
const DEMO_LINES=["大家今天過得好嗎？☘︎ 正在看大家的留言，心情好好","看到大家的留言了！謝謝你們今晚來陪我 ♡","今天吃了好好吃的可頌，推薦給你們～"];
const DEMO_REPLY=["有看到你喔～謝謝你今天也來陪我 ♡","哈哈哈被你發現了 🤭","收到！你也要記得早點休息喔"];
let meetSig="";
/* 直播間打字：鍵盤蓋住下面的留言，只有輸入列浮到鍵盤上面；畫面本身不被往上推 */
if(window.visualViewport){ const vv=window.visualViewport; let raf=0;   /* 跟 TIE 一樣用量的：輸入列貼在鍵盤（含「^ ˅ ✓」）正上方，整個直播間不動 */
  const nud=(el,d)=>{ const m=/translateY\((-?[\d.]+)px\)/.exec(el.style.transform||""), t=m?+m[1]:0, z=parseFloat(getComputedStyle(document.documentElement).zoom)||1; el.style.transform=`translateY(${(t+d/z).toFixed(1)}px)`; };
  const kb=()=>{ raf=0; const r=document.querySelector(".dl"), f=r&&r.querySelector(".dl-foot"); if(!f) return; r.style.setProperty("--kb","0px"); r.style.transform="";
    const typing=document.activeElement&&document.activeElement.id==="lin", open=typing&&vv.height<(screen.height||innerHeight)*0.8;
    if(!open){ f.style.transform=""; return; }
    const k=document.documentElement.getBoundingClientRect().width/Math.max(1,vv.width), lift=isIOS&&isStandalone()?-10:6, want=vv.height*k-lift*k;
    for(let i=0;i<3;i++){ const d=want-f.getBoundingClientRect().bottom; if(Math.abs(d)<1) break; nud(f,d); } };
  const q=()=>{ if(!raf) raf=requestAnimationFrame(kb); };
  vv.addEventListener("resize",q); vv.addEventListener("scroll",q); addEventListener("scroll",q,{passive:true});
  let tick=0; document.addEventListener("focusin",e=>{ if(e.target.id!=="lin") return; q(); setTimeout(q,350); setTimeout(q,700);
    clearInterval(tick); tick=setInterval(()=>{ if(!document.activeElement||document.activeElement.id!=="lin"){ clearInterval(tick); return; } q(); },300); });   /* 送出後上面多了提示、留言：版面變了也要再量一次，輸入列才不會飄高 */
  document.addEventListener("focusout",e=>{ if(e.target.id!=="lin") return; setTimeout(q,60); setTimeout(q,300); }); }
   /* 主畫面 App 的 UA 沒有版本號，當成新版 */
/* TIE 聊天室打字（iPhone）：鍵盤打開時，輸入列貼在鍵盤正上方、標題列留在最上面，中間不留空白 */
let fitN=0;
if(window.visualViewport){ const vv=window.visualViewport; let raf=0;
  /* 打字時（iPhone）：用量的。實測 getBoundingClientRect 的 0 就是看得到的畫面最上面；
     看得到的畫面高度 = visualViewport.height × 換算比例；iOS 26 鍵盤上面還浮著「^ ˅ ✓」（Safari 再加網址膠囊），所以輸入列再往上抬 */
  const nudge=(el,d)=>{ const m=/translateY\((-?[\d.]+)px\)/.exec(el.style.transform||""), t=m?+m[1]:0, z=parseFloat(getComputedStyle(document.documentElement).zoom)||1; el.style.transform=`translateY(${(t+d/z).toFixed(1)}px)`; };
  const fit=()=>{ raf=0; if(tieFxOn()){ document.documentElement.classList.remove("kbo"); return; } const f=document.querySelector(".t-foot"), h=document.querySelector(".t-rh"), bg=document.querySelector(".t-bgl"); if(!f) return;
    const typing=document.activeElement&&document.activeElement.id==="win";
    const k=document.documentElement.getBoundingClientRect().width/Math.max(1,vv.width);
    const kbOpen=typing&&vv.height<(screen.height||innerHeight)*0.8;
    const was=document.documentElement.classList.contains("kbo"); document.documentElement.classList.toggle("kbo",!!kbOpen);
    if(!kbOpen&&was) [60,250].forEach(t=>setTimeout(()=>{ if(document.activeElement&&document.activeElement.id==="win") return; kbRestore(ui.kbBackEnd); },t));
    const ms=document.querySelector(".t-msgs"), keep0=ms&&ms.classList.contains("kbbox")&&document.getElementById("chat-end")?Math.max(0,(document.getElementById("chat-end").getBoundingClientRect().bottom-ms.getBoundingClientRect().bottom)/(parseFloat(getComputedStyle(document.documentElement).zoom)||1)):null;   /* 先量（輸入列還沒移動前），之後才知道要保持在哪 */
    if(!kbOpen){ f.style.transform=""; if(h) h.style.transform=""; if(bg) bg.style.transform=""; if(ms&&ms.classList.contains("kbbox")){ const fromEnd=keep0||0; ms.classList.remove("kbbox"); ms.style.cssText=""; tieFootPad(); kbRestore(fromEnd); } }   /* 收鍵盤（照 LINE）：同一瞬間回到原本看的地方，不閃、不跳 */
    else { const lift=isIOS&&isStandalone()?-10:6, want=vv.height*k-lift*k;   /* 實測：visualViewport 的底已經扣掉「^ ˅ ✓」和網址膠囊，不用再抬 */
      for(let i=0;i<3;i++){ const d=want-f.getBoundingClientRect().bottom; if(Math.abs(d)<1) break; nudge(f,d); }
      if(h) for(let i=0;i<3;i++){ const d=-h.getBoundingClientRect().top; if(Math.abs(d)<1) break; nudge(h,d); }
      if(bg) bg.style.transform=h?h.style.transform:"";
      /* 訊息區：鍵盤開著時變成標題列和輸入列中間自己捲的一塊（不靠整頁捲動，才不會亂跳、最新一則才不會被擋住） */
      if(ms&&h){ const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1, first=!ms.classList.contains("kbbox"), keep=first?null:keep0; ms.classList.add("kbbox");
        const hb=h.getBoundingClientRect().bottom, ft=f.getBoundingClientRect().top; ms.style.height=Math.max(60,(ft-hb)/z)+"px";
        for(let i=0;i<3;i++){ const d=hb-ms.getBoundingClientRect().top; if(Math.abs(d)<1) break; nudge(ms,d); }
        if(first||keep!=null){ if(first) ms.scrollTop=ms.scrollHeight; const want=first?(ui.kbFromEnd||0):keep; for(let i=0;i<4;i++){ const d=pageFromEnd()-want; if(Math.abs(d)<1) break; ms.scrollTop+=d; } } } }
    if(/[?&]dbg/.test(location.search)){ let d=document.getElementById("kbDbg"); if(!d||!f.contains(d)){ if(d) d.remove(); d=document.createElement("div"); d.id="kbDbg"; d.style.cssText="position:absolute;left:6px;bottom:100%;margin-bottom:4px;z-index:99999;background:#000c;color:#0f0;font:12px/1.4 monospace;padding:4px 6px;border-radius:6px;pointer-events:none"; f.appendChild(d); }
      d.textContent=`${++fitN} ih${innerHeight} sh${screen.height} vh${Math.round(vv.height)} vw${Math.round(vv.width)} ot${Math.round(vv.offsetTop)} sy${Math.round(scrollY)} k${k.toFixed(3)} kb${kbOpen?1:0} sa${isStandalone()?1:0} fb${Math.round(f.getBoundingClientRect().bottom)} ht${h?Math.round(h.getBoundingClientRect().top):"-"}`; } };
  const q=()=>{ if(!raf) raf=requestAnimationFrame(fit); };
  vv.addEventListener("resize",q); vv.addEventListener("scroll",q); addEventListener("scroll",q,{passive:true}); addEventListener("resize",q);
  document.addEventListener("focusin",e=>{ if(e.target.id!=="win") return; q(); setTimeout(q,350); setTimeout(q,700); });
  /* 照 LINE：打開鍵盤時，原本貼在輸入列上面的那則訊息還是貼在輸入列上面；收起時回到原本看的位置
     fromEnd＝看到的最下面離聊天最底還有多少（0 就是在最新一則） */
  const pageFromEnd=()=>{ const end=document.getElementById("chat-end"), f=document.querySelector(".t-foot"); if(!end||!f) return 0; const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1; return Math.max(0,(end.getBoundingClientRect().bottom-f.getBoundingClientRect().top)/z); };
  function kbRestore(fromEnd){ if(tieFxOn()) return; ui.kbBackEnd=fromEnd||0; const end=document.getElementById("chat-end"), f=document.querySelector(".t-foot"); if(!end||!f) return; const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1;
    for(let i=0;i<3;i++){ const d=(end.getBoundingClientRect().bottom-f.getBoundingClientRect().top)/z-ui.kbBackEnd; if(Math.abs(d)<1) break; scrollBy(0,d); } }
  document.addEventListener("touchstart",e=>{ if(e.target.id==="win"&&document.activeElement!==e.target) ui.kbFromEnd=pageFromEnd(); },{passive:true,capture:true});
  /* 鍵盤打開後：最新一則訊息剛好在輸入列上面（不夠捲就在下面補空間） */
  function kbToEnd(){ if(tieFxOn()) return; const f=document.querySelector(".t-foot"), end=document.getElementById("chat-end"), ms=document.querySelector(".t-msgs"); if(!f||!end||!ms) return;
    const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1;
    for(let i=0;i<3;i++){ const d=end.getBoundingClientRect().bottom-f.getBoundingClientRect().top+10; if(Math.abs(d)<2) break; const y0=scrollY; scrollBy(0,d/z);
      if(Math.abs(scrollY-y0)<1&&d>0){ ms.style.paddingBottom=(parseFloat(getComputedStyle(ms).paddingBottom)+d/z)+"px"; } }
    q(); }
  /* 打字時往上滑看訊息：先收起鍵盤（像 LINE、iMessage），畫面回到正常，不會亂跳 */
  let ty=null; document.addEventListener("touchstart",e=>{ ty=document.activeElement&&document.activeElement.id==="win"&&!e.target.closest(".t-foot,.kbbox")?e.touches[0].clientY:null; },{passive:true});
  document.addEventListener("touchmove",e=>{ if(ty==null) return; if(Math.abs(e.touches[0].clientY-ty)>12){ ty=null; const w=document.getElementById("win"); if(w) w.blur(); } },{passive:true});
  document.addEventListener("focusout",e=>{ if(e.target.id!=="win") return; q(); setTimeout(q,80); setTimeout(q,300); }); }
/* App 內的小視窗：縮小直播後，在其他頁面也看得到藝人最新一句話 */
function lvMiniMount(){ let el=document.getElementById("lvMini"); const l=ui.lvMini&&getLive(ui.lvMini);
  if(!l||l.endTs||document.querySelector(".dl")||!session()){ if(l&&l.endTs) ui.lvMini=null; if(el) el.remove(); return; }
  const m=MEMBERS[l.member], cur=lvLast(l), html=`<span class="lvm-bg" style="${lvCover(l.member,l)}"></span><span class="lvm-live">LIVE<i></i></span><span class="lvm-t">${esc(cur?cur.text:l.title)}</span><span class="lvm-n">${esc(artName(l.member,"live"))}</span>`;
  if(!el){ el=document.createElement("div"); el.id="lvMini"; el.className="lv-mini"; el.innerHTML=`<button class="lvm-b" data-a="lvMiniOpen"></button><button class="lvm-x" data-a="lvMiniX" aria-label="關閉">${XI}</button>`; document.body.appendChild(el); }
  const b=el.querySelector(".lvm-b"); if(b.dataset.h!==html){ b.dataset.h=html; b.innerHTML=html; } }
setInterval(lvMiniMount,1200);
function checkMile(l){
  ui.mile=ui.mile||{}; const n=Math.floor(l.hearts/1000);
  if(ui.mile[l.id]==null){ ui.mile[l.id]=n; return; }
  if(n>ui.mile[l.id]){ ui.mile[l.id]=n; const el=document.getElementById("cmMile"); if(!el) return;
    el.textContent=`💜 心心突破 ${fmt(n*1000)}！`; el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
    for(let i=0;i<8;i++) setTimeout(heartRain,i*110); }
}
function updateMeetRoom(){
  const r=route(), ss=session();
  if(ss&&ss.role==="artist"&&r.tab==="live"&&document.querySelector(".cm.host")){ const hl=myLive(ss.member); if(hl) updateHost(hl); else render(); return; }
  if(r.sub!=="live") return; const l=getLive(r.id); if(!l) return;
  if(l.endTs){ if(!document.querySelector(".mr-end")){ ui.endFor=l.id; render(); } return; }
  if(!document.getElementById("cmSpot")) return;
  const nw=updSpot(l,false);
  if(nw&&nw.reply&&mineX(nw.reply)){ const cd=document.querySelector(".sp-card"); if(cd){ const b=cd.getBoundingClientRect(); confetti(b.left+b.width/2,b.top+30); } toast(`💜 ${artName(l.member,"live")} 回覆了你！`); }
  const sig=l.msgs.length+":"+liveArt(l).filter(x=>x.reply).length;
  if(sig!==meetSig){ meetSig=sig; const tk=document.getElementById("cmTick"); if(tk) updTick(tk,tickHtml(l)); }
  const v=document.getElementById("mrView"); if(v) v.textContent=fmt(liveViewers(l));
  const hs=document.getElementById("mrHearts"); if(hs) hs.textContent=hfmt(l.hearts);
  if(ui.lastH!=null&&l.hearts>ui.lastH){ const d=Math.min(3,Math.ceil((l.hearts-ui.lastH)/8)); for(let i=0;i<d;i++) setTimeout(heartRain,i*180); }
  ui.lastH=l.hearts; checkMile(l);
}
setInterval(updateMeetRoom,800);
function startMeetDemo(id){ return;   // 示範：進直播間 3 秒後藝人開始打字，6 秒後說一句話（跟 NSY 一樣）
  ui.simDone=ui.simDone||{}; if(ui.simDone[id]) return; ui.simDone[id]=true;
  setTimeout(()=>{ const l=getLive(id); if(!l||l.endTs) return; l.typingTs=Date.now(); saveLive(l); },3000);
  setTimeout(()=>{ const l=getLive(id); if(!l||l.endTs) return; const said=liveArt(l).map(x=>x.text); const t=DEMO_LINES.find(x=>!said.includes(x)); if(!t) return;
    const lf=[...l.msgs].reverse().find(x=>x.from!=="artist"&&Date.now()-x.ts<30*60e3);
    l.msgs.push({from:"artist",text:t,ts:Date.now(),reply:lf?{name:lf.name||"粉絲",text:lf.text,from:lf.from,ts:lf.ts}:undefined}); l.typingTs=0; saveLive(l); },6000);
}
function demoReplyToMe(id,text){ return;   // 示範：你第一次在直播間留言，藝人會回覆你
  ui.repDone=ui.repDone||{}; if(ui.repDone[id]) return; ui.repDone[id]=true;
  setTimeout(()=>{ const l=getLive(id); if(!l||l.endTs) return; l.typingTs=Date.now(); saveLive(l); },2500);
  setTimeout(()=>{ const l=getLive(id); if(!l||l.endTs) return;
    l.msgs.push({from:"artist",text:DEMO_REPLY[Math.random()*DEMO_REPLY.length|0],ts:Date.now(),reply:{name:ME.name,text,from:"me"}}); l.typingTs=0; saveLive(l); },6500);
}
const hostRep=()=>ui.hostReply?{name:ui.hostReply.name,text:ui.hostReply.text,from:ui.hostReply.from,by:ui.hostReply.by,ts:ui.hostReply.ts}:null;
function scheduleFake(id){   // 正式版不產生假的粉絲反應
}
function heartRain(){
  const box=document.getElementById("heartRain"); if(!box) return;
  const h=document.createElement("span"); h.className="hp"; h.textContent=["💜","🤍","💗"][Math.random()*3|0];
  h.style.left=(Math.random()*40-20)+"px"; h.style.setProperty("--tx",(Math.random()*100-50)+"px"); h.style.fontSize=(15+Math.random()*10)+"px";
  box.appendChild(h); setTimeout(()=>h.remove(),3000);
}
function dtDefault(){const t=new Date(Date.now()+864e5);t.setHours(20,0,0,0);return `${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(t.getDate())}T20:00`}

