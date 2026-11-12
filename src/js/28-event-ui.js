/* HAECHU｜活動頁共用外觀（11/12 改版：簽售、世巡、演唱會、綜藝、代言・雜誌、偶像運動會）
   ・只管「長相」：大卡（hero）、三格數字、怎麼參加、列、分頁、結算卡
   ・每個活動自己的資料和規則還是在各自的檔案裡，這裡不碰
   ・class 一律 xv- 開頭，不跟舊樣式撞名
   ========================================================= */
/* 大卡：o={tone,tag,small,title,meta,cd:[[值,字],...],btns:[[字,屬性,次要?],...],extra,cls,style} */
function xvHero(o){ const cd=o.cd&&o.cd.length?`<div class="xv-cd">${o.cd.map(([v,l,w])=>`<div${w?` style="flex:${w}"`:""}><b>${v}</b><span>${l}</span></div>`).join("")}</div>`:"";
  const bt=o.btns&&o.btns.length?`<div class="xv-hb">${o.btns.map(([l,a,s])=>{ a=a||""; let c=s?"s":""; a=a.replace(/class="([^"]*)"/,(m,k)=>{ c+=" "+k; return ""; }); return `<button class="${c.trim()}" ${a}>${l}</button>`; }).join("")}</div>`:"";
  return `<section class="xv-hero ${o.tone||""} ${o.cls||""}" ${o.style?`style="${o.style}"`:""}>${o.tag?`<span class="xv-tag">${o.tag}</span>`:""}${o.small?`<small>${o.small}</small>`:""}<h2>${o.title||""}</h2>${o.meta?`<p>${o.meta}</p>`:""}${o.extra||""}${cd}${bt}</section>`; }
/* 倒數：回傳 [[天],[時],[分]]，不到一天就時/分 */
function xvCd(ts){ let s=Math.max(0,Math.floor((ts-Date.now())/1000)); const d=Math.floor(s/86400); s%=86400; const h=Math.floor(s/3600), m=Math.floor(s%3600/60);
  return d?[[pad(d),"天"],[pad(h),"時"],[pad(m),"分"]]:[[pad(h),"時"],[pad(m),"分"]]; }
const xvStats=L=>`<div class="xv-st">${L.map(([v,l])=>`<div><b>${v}</b><span>${l}</span></div>`).join("")}</div>`;
const xvHow=L=>`<div class="xv-how">${L.map(([e,l])=>`<div><b>${e}</b>${l}</div>`).join("")}</div>`;
const xvSh=(t,r="")=>`<div class="xv-sh"><b>${t}</b>${r?`<i>${r}</i>`:""}</div>`;
/* 一列：o={av,avStyle,sq,title,sub,right,attrs,cls} */
const xvRow=o=>`<${o.attrs?"button":"div"} class="xv-row ${o.cls||""}" ${o.attrs||""}><span class="xv-av ${o.sq?"sq":""}" ${o.avStyle?`style="${o.avStyle}"`:""}>${o.av||""}</span><span class="xv-t"><b>${o.title||""}</b>${o.sub?`<small>${o.sub}</small>`:""}</span>${o.right||""}</${o.attrs?"button":"div"}>`;
const xvChip=(t,k="")=>`<span class="xv-chip ${k}">${t}</span>`;
const xvBtn=(t,a,k="")=>`<button class="xv-bt ${k}" ${a}>${t}</button>`;
const xvEmpty=t=>`<p class="xv-none">${t}</p>`;
/* 分頁（管理員端：進行中／待處理／已結束）：記在 ui.xvSeg[key] */
function xvSegCur(key,def){ ui.xvSeg=ui.xvSeg||{}; return ui.xvSeg[key]||def; }
const xvSeg=(key,L,cur)=>`<div class="xv-seg">${L.map(([v,l])=>`<button class="${v===cur?"on":""}" data-a="xvSeg" data-k="${key}" data-v="${v}">${l}</button>`).join("")}</div>`;
const xvAdd=(t,a)=>`<button class="xv-add" ${a}>＋ ${t}</button>`;
/* 團的頭像（照片或顏色） */
const xvGAv=gid=>{ const g=groupOf(gid); if(!g) return {av:"?"}; const ph=typeof gPhoto==="function"?gPhoto(gid):""; return ph?{av:"",avStyle:`background:url('${ph}') center/cover`}:{av:esc((g.name||"?")[0]),avStyle:`background:${grad(g.g)}`}; };
/* 全螢幕「現場」頁：上面細條（✕、名稱、右邊小膠囊）＋內容；關掉回到入口 */
function xvLive(o){ return `<div class="xv-live ${o.cls||""}" ${o.style?`style="${o.style}"`:""}><header class="xv-top"><button class="xv-x" data-a="${o.close||"tCloseLayer"}" aria-label="關閉">✕</button><span class="xv-tn"><b>${o.title||""}</b>${o.sub?`<small>${o.sub}</small>`:""}</span>${o.right||""}</header>${o.body||""}</div>`; }
/* 結算卡：六個活動共用 */
function xvResult(o){ setLayer(`<div class="xv-res-w ${o.tone||""}"><div class="xv-conf"></div><section class="xv-res"><small>${o.small||""}</small><h2>${o.title||""}</h2><div class="xv-pt">${o.big||""}</div>${o.chips&&o.chips.length?`<div class="xv-rk">${o.chips.map(c=>`<span>${c}</span>`).join("")}</div>`:""}
    ${o.share?`<button class="xv-big" ${o.share}>分享到 SNS</button>`:""}<button class="xv-back" data-a="tCloseLayer">${o.back||"回到入口"}</button></section></div>`,"xvres"); try{ confetti(innerWidth/2,innerHeight/3); }catch(e){} }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="xvSeg"]'); if(!t) return; e.stopImmediatePropagation(); ui.xvSeg=ui.xvSeg||{}; ui.xvSeg[t.dataset.k]=t.dataset.v; lsRerender(); },true);
/* 分享到 SNS：把結算卡畫成一張 4:5 圖，放進新貼文草稿（使用者自己按分享才會發出去）
   o={small,title,big,chips,cap,c1,c2} */
async function xvShare(o){ try{ const W=1080,H=1350, cv=document.createElement("canvas"); cv.width=W; cv.height=H; const x=cv.getContext("2d");
    const g=x.createLinearGradient(0,0,W,H); g.addColorStop(0,o.c1||"#7C4DFF"); g.addColorStop(1,o.c2||"#F783AC"); x.fillStyle=g; x.fillRect(0,0,W,H);
    const dot=["#FFD43B","#FFFFFF","#B197FC","#74C0FC"]; for(let i=0;i<90;i++){ x.fillStyle=dot[i%4]; x.globalAlpha=.55; x.beginPath(); x.arc((i*263)%W,(i*397)%H,4+(i%3)*3,0,7); x.fill(); } x.globalAlpha=1;
    const r=(X,Y,w,h,rr)=>{ x.beginPath(); x.moveTo(X+rr,Y); x.arcTo(X+w,Y,X+w,Y+h,rr); x.arcTo(X+w,Y+h,X,Y+h,rr); x.arcTo(X,Y+h,X,Y,rr); x.arcTo(X,Y,X+w,Y,rr); x.closePath(); };
    x.fillStyle="#fff"; r(110,330,860,690,60); x.fill(); x.textAlign="center"; const F='"PingFang TC","Noto Sans TC",sans-serif';
    x.fillStyle="#888"; x.font=`500 40px ${F}`; x.fillText(o.small||"",W/2,450);
    x.fillStyle="#222"; x.font=`800 70px ${F}`; x.fillText(o.title||"",W/2,560);
    const gt=x.createLinearGradient(300,0,780,0); gt.addColorStop(0,"#7C4DFF"); gt.addColorStop(1,"#F783AC"); x.fillStyle=gt; x.font=`900 150px ${F}`; x.fillText(o.big||"",W/2,750);
    x.fillStyle="#5F3DC4"; x.font=`700 40px ${F}`; x.fillText((o.chips||[]).join("・"),W/2,880);
    x.fillStyle="rgba(255,255,255,.9)"; x.font=`800 46px ${F}`; x.fillText("HAECHU",W/2,1220);
    const blob=await new Promise(res=>cv.toBlob(res,"image/jpeg",.9)), id="sn"+Date.now()+"x"; await MDB.put(id,blob);
    ui.snDraft={media:[{mid:id,w:W,h:H}],cap:o.cap||"",mode:"post"}; try{ layer.innerHTML=""; }catch(e){} navTo(route().role==="artist"?"#/artist/sns?p=new":"#/fan/sns?p=new");
  }catch(e){ toast("分享圖做不出來，再試一次"); } }
/* 各活動的分享按鈕 */
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="trShare"]'); if(!t) return; e.stopImmediatePropagation();
  const tr=tourOf(t.dataset.v); if(!tr) return; const g=groupOf(tr.gid), L=tourStops(tr).filter(st=>stopState(st)!=="off");
  xvShare({small:`${g?g.name:""} WORLD TOUR`,title:`〈${tr.title}〉`,big:`${L.length} / ${L.length}`,chips:["巡演護照全部蓋滿 🏆"],cap:`${g?g.name:""} WORLD TOUR〈${tr.title}〉\n${L.map(x=>x.city).join(" · ")}\n\n護照全部蓋滿了！ 📘✨`,c1:"#B08D2B",c2:"#F5D77A"}); },true);
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="fsFeat"],[data-a="fsShare"]'); if(!t) return; e.stopImmediatePropagation();
  if(t.dataset.a==="fsFeat"){ ui.fsFeat=t.dataset.v; lsRerender(); window.scrollTo({top:0,behavior:"smooth"}); return; }
  const ev=fsGet(t.dataset.v); if(!ev) return; xvShare({small:`${fsName(ev)}・${fsTypeName(ev)}`,title:ev.title,big:"✍️ 💜",chips:[ev.toSign?`To. ${fsMyTo(ev)}`:"簽名專輯到手"],cap:`${fsName(ev)}〈${ev.title}〉${fsTypeName(ev)}\n拿到簽名專輯了 💜`}); },true);
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="fsAddOpen"]'); if(!t) return; e.stopImmediatePropagation(); ui.fsAddOpen=!ui.fsAddOpen; lsRerender(); },true);
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="vsAddOpen"],[data-a="vsShare"]'); if(!t) return; e.stopImmediatePropagation();
  if(t.dataset.a==="vsAddOpen"){ ui.vsAddOpen=!ui.vsAddOpen; lsRerender(); return; }
  const ep=vsGet(t.dataset.id); if(!ep) return; const S0=VSHOW[ep.show], my=(ep.bets||{})[myEmail()]||{};
  xvShare({small:`${S0.name} ${ep.title}`,title:"我押中了！",big:"🎯",chips:[`冠軍 ${(ep.res&&ep.res.win||[]).map(vsName).join("、")}`],cap:`${S0.name} ${ep.title}\n押 ${vsName(my.mid||"")} 押中了！ 🎯`,c1:"#D6336C",c2:"#F783AC"}); },true);
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="bzAddOpen"]'); if(!t) return; e.stopImmediatePropagation(); ui.bzAddOpen=!ui.bzAddOpen; lsRerender(); },true);
/* 代言：點兩下按讚（像限時動態） */
document.addEventListener("dblclick",e=>{ const st=e.target.closest&&e.target.closest('[data-dbl="bzLike"]'); if(!st) return; const b=bzGet(st.dataset.id), me=myId(); if(!b||!me) return; const L=((b.likes||{})[st.dataset.v])||[];
  st.classList.remove("pop"); void st.offsetWidth; st.classList.add("pop"); if(L.includes(me)) return; const btn=st.querySelector('[data-a="bzLike"]'); if(btn) setTimeout(()=>btn.click(),350); });
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="isShare"]'); if(!t) return; e.stopImmediatePropagation(); const c=isCur(), mid=(session()||{}).member, ev=t.dataset.v, E=IS_EV[ev]; if(!c||!E) return;
  const x=((c.sc||{})[ev]||{})[mid]||{}, rk=isBoard(c,ev).findIndex(([m])=>m===mid)+1; xvShare({small:c.name,title:`${E.ic} ${E.n}`,big:`${isFmt(ev,x.best)}${E.unit}`,chips:[`目前第 ${rk} 名`],cap:`${c.name}\n${E.n} ${isFmt(ev,x.best)}${E.unit}・目前第 ${rk} 名！`,c1:"#3B5BDB",c2:"#748FFC"}); },true);
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="svTheme"]'); if(!t) return; e.stopImmediatePropagation(); S.set("daisuki_sv_theme",svTheme()==="g"?"b":"g"); lsRerender(); toast(svTheme()==="g"?"選秀換成女生版（粉＋白）":"選秀換成男生版（藍＋白）"); },true);
/* Reels 文案：點一下跟 IG 一樣拉出面板（上面是完整文案、下面是留言） */
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="snRcap"]'); if(!t) return; e.stopImmediatePropagation(); e.preventDefault(); ui.snCmCap=t.dataset.id; snOpenCm(t.dataset.id); },true);
/* 貼文留言：只刪得到自己的 */
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="pdCDel"],[data-a="pdRDel"]'); if(!t) return; e.stopImmediatePropagation();
  ask("刪除這則留言？",()=>{ const L=S.get(K.comments,[])||[];
    if(t.dataset.a==="pdCDel"){ const c=L.find(x=>x.id===t.dataset.c); if(!c||!pdMineC(c)) return; S.set(K.comments,L.filter(x=>x.id!==c.id)); }
    else { const c=L.find(x=>x.id===t.dataset.c), r=c&&(c.reps||[]).find(x=>x.id===t.dataset.r); if(!r||!pdMineC(r)) return; c.reps=c.reps.filter(x=>x.id!==r.id); S.set(K.comments,L); }
    try{ renderComments(); }catch(err){ render(); } toast("已刪除留言"); },{title:"刪除留言",ok:"刪除"}); },true);
