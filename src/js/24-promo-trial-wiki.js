/* HAECHU｜出道／回歸預告、訪客試玩、SKpedia */
/* =========================================================
   出道預告／回歸預告（她 10/27 定）
   ・申請出道時選出道日：最快「申請那天起 7 天後」，再晚都可以
   ・管理員核准時：離出道日不到 7 天 → 自動順延到核准後第 7 天；發預告通知給所有人
   ・預告期間 CORE／FOC 有「即將出道」卡片倒數；可以延期（只能往後），會發延期通知
   ・出道日一到（管理員的手機）自動變成藝人
   ・回歸：管理員排新歌時選回歸日（最快 7 天後；剛出道一週內的新人可以當天），到日子自動開始打歌
   ========================================================= */
const PRE_MIN=7*864e5;
const dayStart=ts=>{ const d=new Date(ts); d.setHours(0,0,0,0); return d.getTime(); };
const ymdIn=ts=>{ const d=new Date(ts); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const ymdTs=s=>{ const [y,m,d]=String(s||"").split("-").map(Number); return y?new Date(y,m-1,d).getTime():0; };
const dLeft=ts=>Math.max(0,Math.round((dayStart(ts)-dayStart(Date.now()))/864e5));
const mdTxt=ts=>{ const d=new Date(ts); return `${d.getMonth()+1}/${d.getDate()}`; };
/* 管理員核准 → 進入預告 */
function dbApprove(x){ const now=Date.now(); let day=x.day||dayStart(now+PRE_MIN); if(day<dayStart(now+PRE_MIN)) day=dayStart(now+PRE_MIN); x.day=day; x.status="pre"; x.appr=now;
  dbDebutNow(null,x,true);   /* 管理員在場的這一刻就把團建好、帳號綁好；出道日前先藏起來 */
  if(day-now<=PRE_ANN) dbAnn(x);   /* 用 HAECHU 官方公告發出道預告（不是每個人的 FOC／FEST 都掛一張卡） */ feedPush({kind:"core",self:true,text:`🎉 出道申請通過了！你的出道日是 ${mdTxt(day)}，${day-now<=PRE_ANN?"預告已經發出去囉":`出道前 7 天（${mdTxt(day-PRE_ANN)}）會發出預告，在那之前先保密喔`}`},"u:"+x.email); }
/* 刪除出道申請（預告中／未通過）：團、帳號綁定、照片、MV、SKpedia、公告、通知全部收回，當作沒發生過；本人可以重新申請 */
const dbWipedTx=n=>{ try{ const t=String(n&&n.text||""); if(!t.includes("「")) return false; return getDebut().some(x=>x.status==="gone"&&(n.ts||0)<=x.gone&&t.includes(`「${x.name}」`)); }catch(e){ return false; } };
function dbWipe(x){ const gid=x.gid, mids=dbMids(x), mid=x.mid;
  if(gid){ saveRoster(r=>{ r.groups=(r.groups||[]).filter(g=>g.id!==gid); delete r.members[gid+"_o"]; mids.forEach(m=>{ delete r.members[m]; }); });
    const i=GROUPS.findIndex(g=>g.id===gid); if(i>=0) GROUPS.splice(i,1); delete MEMBERS[gid+"_o"]; mids.forEach(m=>{ delete MEMBERS[m]; });
    dbEms(x).forEach(e=>{ const a=ACCOUNTS[e], m0=(x.mids||{})[e]||(e===x.email?mid:""); if(a&&(!a.member||a.member===m0)) unbindArtist(e); });   /* 預告中帳號的綁定是藏起來的，也要解開 */
    const drop=(k,id)=>{ const o={...(S.get(k,{})||{})}; if(id in o){ delete o[id]; S.set(k,o); } };
    mids.forEach(m=>drop(K.mPhoto,m)); drop(K.gPhoto,gid); drop(K.vsec,gid); drop("daisuki_wiki","g:"+gid); mids.forEach(m=>drop("daisuki_wiki","m:"+m));
    S.set(K.vods,(S.get(K.vods,[])||[]).filter(v=>v.gid!==gid)); S.set(K.fanArtists,followed().filter(y=>y!==gid)); }
  const w=`「${x.name}」`; S.set(K.anns,(S.get(K.anns,[])||[]).filter(a=>a.id!==x.annId&&!(String(a.text||"").includes(w)&&/出道/.test(a.text||""))));
  S.set(K.feed,(S.get(K.feed,[])||[]).filter(e=>!(String(e.text||"").includes(w)&&(e.ts||0)<=Date.now())));
  Object.assign(x,{status:"gone",gone:Date.now()}); delete x.gid; delete x.mid;
  feedPush({kind:"core",self:true,text:"出道申請已經刪除，可以重新申請囉"},"u:"+x.email); }
/* 出道／回歸預告：日子前 7 天才發公告（太早發大家會忘記；核准時離出道不到 7 天就馬上發） */
const PRE_ANN=7*864e5;
/* 公司：同一團兩次回歸（出道→第一次回歸也算）最少要隔幾天。四大照現實的節奏；中小公司照 #PASTEL 的設定 */
/* 冷卻期（月）：出道或回歸之後要過這麼久才能再回歸；過了之後什麼時候回歸都可以 */
const CO_GAP={HYBE:4,SM:3,JYP:3,YG:6,PAPERMOON:4,"BLUE HOUR":6,"DOLPUNG Lab.":9};
const addMon=(ts,n)=>{ const d=new Date(ts), day=d.getDate(); d.setDate(1); d.setMonth(d.getMonth()+n); d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate())); return d.getTime(); };
const coOf=gid=>((groupOf(gid)||tkG(gid)||{}).co)||"";
const coGap=gid=>CO_GAP[coOf(gid)]||0;   /* 月；0＝還沒設定公司 */
const coChips=(cur,act)=>`<div class="chips wrap co-chips">${SK_COS.map(c=>`<button class="chip ${cur===c?"on":""}" data-a="${act}" data-v="${esc(c)}">${esc(c)}</button>`).join("")}</div>`;
function dbAnn(x){ if(x.annId) return; const a=publishAnnounce(`✨ 出道預告｜「${x.name}」將在 ${mdTxt(x.day)} 正式出道！`); x.annId=a.id; S.set(K.anns,S.get(K.anns,[]).map(y=>y.id===a.id?{...y,pre:"db",ref:x.id,...(x.teaser?{img:x.teaser}:{})}:y)); }
function cbAnn(p){ if(p.annId) return; const g=groupOf(p.gid); if(!g) return; const a=publishAnnounce(`📢 回歸預告｜${g.name}《${p.title}》將在 ${mdTxt(p.day)} 回歸！`); p.annId=a.id; S.set(K.anns,S.get(K.anns,[]).map(y=>y.id===a.id?{...y,pre:"cb",ref:p.id}:y)); }
/* 出道日到了：真的建立藝人（原本核准時做的事） */
function dbDebutNow(L,x,prep){ const n=x.name; if(GROUPS.some(g=>g.name===n)||!ACCOUNTS[x.email]||ACCOUNTS[x.email].member){ if(!prep){ x.status="ok"; x.done=Date.now(); } return; }
  const grp=x.kind==="group", id="g"+Date.now(), gc=x.g||0, g={id,name:n,g:gc,isNew:true,solo:!grp,...(x.co?{co:x.co}:{}),...((x.pr||{}).intro?{intro:x.pr.intro}:{})}, off={name:n+" 官方",group:id,g:gc,official:true}, mid="m"+Date.now();
  const P=[{email:x.email,name:grp?(x.me||n):n,mid},...(grp?(x.mems||[]).map((y,i)=>({email:y.email,name:y.name,mid:mid+"_"+(i+1)})):[])].filter(p=>p.email===x.email||(ACCOUNTS[p.email]&&!ACCOUNTS[p.email].member));   /* 團體：每位成員一個藝人，綁各自的帳號 */
  saveRoster(r=>{ r.groups.push(g); r.members[id+"_o"]=off; P.forEach(p=>{ r.members[p.mid]={name:p.name,group:id,g:gc}; }); }); GROUPS.push(g); MEMBERS[id+"_o"]=off; P.forEach(p=>{ MEMBERS[p.mid]={name:p.name,group:id,g:gc}; bindArtist(p.email,p.mid); });
  if(grp) x.mids=Object.fromEntries(P.map(p=>[p.email,p.mid]));
  if((x.pr||{}).fan){ const FD={...(S.get(K.fandom,{})||{})}; if(!FD[id]){ FD[id]=x.pr.fan; S.set(K.fandom,FD); } }
  { const md=s=>{ const m=/^\d{4}-(\d{2})-(\d{2})$/.exec(s||""); return m?`${+m[1]}-${+m[2]}`:""; }, B={...(S.get(K.bdays,{})||{})}; let ch=false; P.forEach(p=>{ const b=md(p.email===x.email?x.bd:((x.mems||[]).find(y=>y.email===p.email)||{}).bd); if(b){ B[p.mid]=b; ch=true; } }); if(ch) S.set(K.bdays,B); }   /* 申請時填的生日 → 藝人生日（生日咖啡廳用） */
  if(x.teaser){ if(!grp){ const M={...(S.get(K.mPhoto,{})||{})}; M[mid]=x.teaser; S.set(K.mPhoto,M); } const G={...(S.get(K.gPhoto,{})||{})}; G[id]=x.teaser; S.set(K.gPhoto,G); }
  [[x.mv,"MV",`${n}｜出道 MV`],[x.mvt,"MV Teaser",`${n}｜出道 MV Teaser`]].forEach(([v,sec,title])=>{ if(!v) return; const VS=S.get(K.vsec,{})||{}; let s=(VS[id]||[]).find(y=>y.title===sec); if(!s){ s={id:uid("s"),title:sec}; VS[id]=[...(VS[id]||[]),s]; S.set(K.vsec,VS); }   /* MV 和 MV Teaser 各一區 */
    S.set(K.vods,[...S.get(K.vods,[]),{id:uid("v"),gid:id,sec:s.id,title,mid:v.mid,thumb:v.thumb,dur:v.dur||0,ts:Date.now(),views:0,by:mid}]); });
  if((x.teasers||[]).length||x.teaser){ try{ const W=S.get("daisuki_wiki",{})||{}, P=W["g:"+id]||{}; if(!Array.isArray(P.pics)){ P.pics=[x.teaser,...(x.teasers||[])].filter(Boolean).map(u=>({u,t:"出道 Teaser"})); W["g:"+id]=P; S.set("daisuki_wiki",W); } }catch(e){} }
  x.mid=mid; x.gid=id; if(prep){ applyRoster(); return; }
  x.status="ok"; x.done=Date.now(); x.pushed=1;
  feedPush({kind:"core",text:`🎉 「${n}」今天正式出道了！`},"all"); dbEms(x).forEach(e=>feedPush({kind:"core",self:true,text:`🎉 恭喜出道！到 ME 切換到藝人端吧`},"u:"+e)); }
/* 出道日到了：團早就建好了，只要改狀態、發通知（後台 haechu_tick 也會準時做；誰先做都只做一次） */
function dbReveal(x){ x.status="ok"; x.done=Date.now(); if(!x.pushed){ x.pushed=1; feedPush({kind:"core",text:`🎉 「${x.name}」今天正式出道了！`},"all"); dbEms(x).forEach(e=>feedPush({kind:"core",self:true,text:`🎉 恭喜出道！到 ME 切換到藝人端吧`},"u:"+e)); } }
/* 真正出道／回歸的時刻＝那天＋藝人選的發布時間（沒選就晚上 6 點），跟 OUT NOW 同一刻 */
const relAtPr=relTime;
const dbRelAt=x=>relAtPr(x.day,x.pr);
const cbRelAt=p=>{ const c=(typeof getCbr==="function"?getCbr():[]).find(y=>y.id===p.req); return relAtPr(p.day,c&&c.pr); };
/* 回歸：預告中的新歌（ms.pre） */
function preTick(){ try{ if(!isAdminAcct()) return; if(HB_ON&&(HB.ver[K.debut]==null&&HB.ver[K.mshow]==null)) return; const now=Date.now();
    const L=getDebut(); let ch=false; L.forEach(x=>{ if(x.status==="pre"&&x.day&&x.day>now&&!x.annId&&x.day-now<=PRE_ANN){ dbAnn(x); ch=true; } if(x.status==="pre"&&x.day&&dbRelAt(x)<=now){ if(x.gid) dbReveal(x); else dbDebutNow(L,x); ch=true; } }); if(ch){ S.set(K.debut,L); applyRoster(); render(); }
    { const m0=getMShow(), due=(m0.pre||[]).filter(p=>p.day>now&&!p.annId&&p.day-now<=PRE_ANN); if(due.length){ due.forEach(cbAnn); S.set(K.mshow,m0); } }
    { const L2=getDebut(), todo=L2.filter(x=>x.status==="ok"&&x.song&&x.gid&&!x.songOn&&groupOf(x.gid)); if(todo.length){ const m1=getMShow(); todo.forEach(x=>{ x.songOn=1; const sid="s"+(x.day||Date.now()); if(m1.songs.some(s=>s.id===sid)) return; m1.songs.push({id:sid,gid:x.gid,title:x.song,debut:1,rel:dbRelAt(x),...(x.rtype?{rtype:x.rtype}:{}),...(x.au?{au:x.au}:{})}); cbrMvPublish({gid:x.gid,title:x.song,mv:x.mv,mvt:x.mvt}); try{ const fy=(x.pr||{}).fy||{}, M={}; Object.keys(fy).forEach(k=>{ const mid=k==="me"?((x.mids||{})[x.email]||x.mid):((m=>m&&(x.mids||{})[m.email])((x.mems||[])[+k.slice(1)])); if(mid&&fy[k]&&fy[k].m) M[mid]=fy[k]; }); if(Object.keys(M).length){ fairySetClips(sid,M); if(String((x.pr||{}).t2||"").trim()) fairySetClips(sid+"b",M); } m1.songs.filter(q=>q.id===sid||q.id===sid+"b").forEach(q=>fairyEnsurePlan(q)); }catch(e){} { const t2=String((x.pr||{}).t2||"").trim(); if(t2&&!m1.songs.some(s=>s.id===sid+"b")){ m1.songs.push({id:sid+"b",gid:x.gid,title:t2,debut:1,rel:dbRelAt(x),...(x.rtype?{rtype:x.rtype}:{})}); cbrMvPublish({gid:x.gid,title:t2,mv:x.pr.mv2}); } } }); S.set(K.mshow,m1); S.set(K.debut,L2); render(); } }   /* 出道當天：出道曲開始打歌 */
    const ms=getMShow(); if((ms.pre||[]).some(p=>cbRelAt(p)<=now)){ ms.pre.filter(p=>cbRelAt(p)<=now).forEach(p=>{ const sid="s"+(p.day+[...String(p.id)].reduce((a,c)=>a+c.charCodeAt(0),0)%900); if(ms.songs.some(s=>s.id===sid)) return; ms.songs.push({id:sid,gid:p.gid,title:p.title,rel:cbRelAt(p),...(p.rtype?{rtype:p.rtype}:{}),...(p.au?{au:p.au}:{})}); cbrMvPublish(p); try{ const c1=(typeof getCbr==="function"?getCbr():[]).find(y=>y.id===p.req), fy=((c1||{}).pr||{}).fy||{}, M={}; Object.keys(fy).forEach(k=>{ if(MEMBERS[k]&&fy[k]&&fy[k].m) M[k]=fy[k]; }); if(Object.keys(M).length){ fairySetClips(sid,M); if(String(((c1||{}).pr||{}).t2||"").trim()) fairySetClips(sid+"b",M); } ms.songs.filter(q=>q.id===sid||q.id===sid+"b").forEach(q=>fairyEnsurePlan(q)); }catch(e){} { const c2=(typeof getCbr==="function"?getCbr():[]).find(y=>y.id===p.req), t2=String(((c2||{}).pr||{}).t2||"").trim(); if(t2&&!ms.songs.some(s=>s.id===sid+"b")){ ms.songs.push({id:sid+"b",gid:p.gid,title:t2,rel:cbRelAt(p),...(p.rtype?{rtype:p.rtype}:{})}); cbrMvPublish({gid:p.gid,title:t2,mv:c2.pr.mv2}); } } const g=groupOf(p.gid); if(g) muNotify(`🎤 ${g.name}《${p.title}》回歸了，開始打歌！`,p.gid); }); ms.pre=ms.pre.filter(p=>cbRelAt(p)>now); S.set(K.mshow,ms); render(); } }catch(e){} }
setInterval(preTick,60e3); setTimeout(preTick,9e3);
/* 出道 MV：這團之前沒有任何一首歌、也沒有更早的 MV（管理員們是先出道、之後才補傳 MV） */
function mvIsDebut(v){ try{ const m=getMShow(), mine=[...(m.songs||[]),...(m.ended||[])].filter(x=>x.gid===v.gid&&x.mv!==v.id); if(mine.some(x=>!x.debut||songRel(x)<v.ts)) return false;
  if((S.get(K.vods,[])||[]).some(o=>o.gid===v.gid&&o.id!==v.id&&vodIsMV(o)&&(o.ts||0)<(v.ts||0))) return false; if(getCbr().some(c=>c.gid===v.gid&&c.status==="ok"&&c.day<(v.ts||0))) return false; return true; }catch(e){ return false; } }
function mvSongTick(){ try{ if(!isAdminAcct()) return; if(HB_ON&&(HB.ver[K.mshow]==null||HB.ver[K.vods]==null)) return; const now=Date.now(), m=getMShow(); let ch=false;
    (S.get(K.vods,[])||[]).filter(v=>vodIsMV(v)&&v.gid&&groupOf(v.gid)&&v.ts&&v.ts<=now&&now-v.ts<MSA.END*MDAY).forEach(v=>{
      const all=[...m.songs,...(m.ended||[])]; if(all.some(x=>x.gid===v.gid&&(x.mv===v.id||Math.abs(songRel(x)-v.ts)<3*MDAY))) return;
      const title=mvTitleOf(v.title)||"新歌", db=mvIsDebut(v); if(/^\s*出道\s*$/.test(title)&&all.some(x=>x.gid===v.gid&&x.debut)) return;   /* 已經有出道曲：不要再建一首叫「出道」的 */
      m.songs.push({id:"s"+v.ts,gid:v.gid,title,rel:v.ts,mv:v.id,...(db?{debut:1}:{}),...(v.au?{au:v.au}:{})}); ch=true; try{ if(v.fy){ fairySetClips("s"+v.ts,v.fy); } }catch(e){} const g=groupOf(v.gid); if(g) muNotify(`🎤 ${g.name}《${title}》${db?"出道 ":""}MV 公開，開始打歌！`,v.gid); });
    /* v494 先建好的歌：如果是出道 MV，補上「出道曲」，公告標題也改過來 */
    { const V=S.get(K.vods,[])||[]; [...m.songs,...(m.ended||[])].forEach(x=>{ if(!x.mv||x.debut) return; const v=V.find(y=>y.id===x.mv); if(v&&mvIsDebut(v)){ x.debut=1; ch=true; const GN=S.get(K.gNotices,[])||[], n=GN.find(y=>y.mv===v.id); if(n&&/Official MV 公開/.test(n.title)){ n.title=n.title.replace("Official MV 公開","出道 MV 公開"); n.body=n.body.replace(/^(.+?)《/,"$1的出道曲《"); S.set(K.gNotices,GN); } } }); }
    /* 回歸：同一團有新歌，舊歌下檔 */
    const byG={}; m.songs.forEach(x=>{ const r=songRel(x); if(!byG[x.gid]||r>songRel(byG[x.gid])) byG[x.gid]=x; }); const old=m.songs.filter(x=>songRel(x)&&byG[x.gid]!==x&&songRel(byG[x.gid])-songRel(x)>MDAY); if(old.length){ m.songs=m.songs.filter(x=>!old.includes(x)); m.ended=[...(m.ended||[]),...old.map(x=>({...x,endTs:now}))]; ch=true; }
    /* 社群（團的社群，不是個人社群）：MV 公開時自動貼一則 NOTICE，社群的影音也看得到 */
    { const GN=S.get(K.gNotices,[])||[]; let gch=false; (S.get(K.vods,[])||[]).filter(v=>vodIsMV(v)&&v.gid&&groupOf(v.gid)&&v.ts&&v.ts<=now&&now-v.ts<7*MDAY).forEach(v=>{ if(GN.some(n=>n.mv===v.id)||gnGone()["mv:"+v.id]) return; const g=groupOf(v.gid), tt=mvTitleOf(v.title)||v.title||"新歌";
        const db=mvIsDebut(v); GN.unshift({id:"gn"+v.ts,group:v.gid,mv:v.id,title:`[MV] ${g.name}《${tt}》${db?"出道 MV":"Official MV"} 公開`,body:`${g.name}${db?"的出道曲":""}《${tt}》MV 公開了！\n到社群的影音就看得到，打歌也從現在開始，一起幫忙投票吧 💜`,ts:v.ts}); gch=true; }); if(gch){ S.set(K.gNotices,GN); ch=true; } }
    const done=m.songs.filter(x=>songPhase(x)==="end"); if(done.length){ m.songs=m.songs.filter(x=>songPhase(x)!=="end"); m.ended=[...(m.ended||[]),...done.map(x=>({...x,endTs:now}))]; ch=true; }
    if(ch){ S.set(K.mshow,m); try{ render(); }catch(e){} } }catch(e){} }
setInterval(mvSongTick,60e3); setTimeout(mvSongTick,10e3);
/* 新人剛出道一週內：回歸（第一首歌）可以當天開始 */
const grpFresh=gid=>{ const t=idTs(gid,/^g/); return !!t&&Date.now()-t<PRE_MIN; };
/* 「即將出道／即將回歸」卡片（CORE、FOC 最上面） */


/* =========================================================
   訪客試玩（登入頁「先玩玩看」）
   ・不用帳號：揮應援棒、抽一張小卡、送一台應援餐車
   ・全部只在畫面上：不存任何東西、不連雲端、看不到真正藝人的資料
   ・玩完就是「進 SUN KISS 才能繼續」
   ========================================================= */
const TRY_JOIN="https://line.me/ti/g2/7iT3j2hGOM4GHpnkZeunPHVJbPUODoTZg5zA_Q";   /* SUN KISS 社群 */
const TRY_LOCK=[["🌟","追藝人","動態、直播<br>舞台都看得到"],["💎","賺積分","打卡、應援<br>就能升等級"],["🎤","出道","從練習生<br>一路站上舞台"],["📺","綜藝","上節目做任務<br>押上積分"],["☕","生日咖啡廳","幫藝人開一間<br>生日咖啡廳"],["💌","TIE","跟藝人<br>一對一聊天"]];
const TRY={k:null,sw:0,t0:0,col:"#C7AEFF",ls:null,tm:0};
function tryOpen(k){ TRY.k=k||"menu"; clearTimeout(TRY.tm); try{ if(TRY.ls) TRY.ls.destroy(); }catch(e){} TRY.ls=null;
  const X=`<button class="try-x" data-a="tryX" aria-label="關閉">${XI}</button>`;
  layer.innerHTML=`<div class="try tk-${TRY.k}" role="dialog" aria-label="試玩">${X}${({menu:tryMenu,live:tryLive,card:tryCard,truck:tryTruck,end:tryEnd})[TRY.k]()}</div>`;
  if(TRY.k==="live") tryLiveOn(); if(TRY.k==="truck") tryTruckOn(); if(TRY.k==="card") tryCardOn(); }
function tryClose(){ clearTimeout(TRY.tm); try{ if(TRY.ls) TRY.ls.destroy(); }catch(e){} TRY.ls=null; TRY.k=null; layer.innerHTML=""; }

function tryMenu(){ return `<div class="try-menu">
  <header><h1 class="hc-wm big">${APP_NAME}</h1><span class="try-sk">SUN KISS</span></header>
  <button class="try-tile t-live" data-a="tryGo" data-v="live"><span class="tt-art"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><b class="tt-stick"></b></span><span class="tt-l"><b>揮應援棒</b><small>LIVE</small></span></button>
  <button class="try-tile t-card" data-a="tryGo" data-v="card"><span class="tt-art"><em></em><em></em><em></em></span><span class="tt-l"><b>抽一張小卡</b><small>PHOTOCARD</small></span></button>
  <button class="try-tile t-truck" data-a="tryGo" data-v="truck"><span class="tt-art"><svg viewBox="0 0 120 70" aria-hidden="true"><rect x="8" y="16" width="70" height="36" rx="10" fill="#F2EEE8"/><rect x="78" y="26" width="30" height="26" rx="9" fill="#F2EEE8"/><rect x="16" y="22" width="40" height="16" rx="3" fill="#2C2733"/><path d="M14 22h44" stroke="#fff" stroke-width="5" stroke-dasharray="6 3"/><rect x="84" y="31" width="16" height="10" rx="3" fill="#5A5566"/><rect x="6" y="50" width="104" height="5" rx="2.5" fill="#4A2E36"/><circle cx="28" cy="57" r="8" fill="#1E1B22"/><circle cx="90" cy="57" r="8" fill="#1E1B22"/><circle cx="28" cy="57" r="3" fill="#B48E5C"/><circle cx="90" cy="57" r="3" fill="#B48E5C"/><circle cx="24" cy="8" r="6" fill="#E7C2C6"/><circle cx="34" cy="6" r="6" fill="#E6D5B5"/><path d="M24 14l4 8M34 12l-2 10" stroke="#B48E5C" stroke-width=".8"/></svg></span><span class="tt-l"><b>送一台應援餐車</b><small>CAFÉ TRUCK</small></span></button>
</div>`; }

/* ① 演唱會：揮應援棒，燈海跟著動 */
function tryLive(){ return `<div class="concert2 try-stage" data-glow="${TRY.col}">
  <span class="cc-sky" style="background:radial-gradient(120% 70% at 50% 105%,${TRY.col}66,transparent 60%),radial-gradient(80% 50% at 50% -10%,${TRY.col}33,transparent 70%),linear-gradient(#0B0820,#140B2E 55%,#1E0F3A)"></span>
  <span class="cc-beam b1" style="background:linear-gradient(${TRY.col}aa,transparent 75%);clip-path:polygon(45% 0,55% 0,100% 100%,0 100%)"></span><span class="cc-beam b2" style="background:linear-gradient(#ffffffaa,transparent 70%);clip-path:polygon(45% 0,55% 0,100% 100%,0 100%)"></span>
  <canvas class="cc-sea"></canvas>
  <div class="try-hud"><span class="cc-pill"><i></i>SUN KISS・示範演唱會</span><b id="trySw">0</b></div>
  <div class="try-ls" id="tryLs"></div>
  <div class="try-cols">${LS_COLORS.map(h=>`<button class="${h===TRY.col?"on":""}" data-a="tryCol" data-v="${h}" style="background:${h}" aria-label="燈色"></button>`).join("")}</div>
</div>`; }
function tryLiveOn(){ TRY.sw=0; TRY.t0=Date.now(); SEA.color=TRY.col; SEA.boost=0;
  try{ seaRun(layer.querySelector(".try .cc-sea"),TRY.col); }catch(e){}
  const el=document.getElementById("tryLs"); let acc=0;
  TRY.ls=LS3D.mount(el,{glow:TRY.col},{swing:true,auto:false,glow:TRY.col,onSwing:v=>{ SEA.boost=Math.min(1.4,SEA.boost+v*.004); acc+=v; if(acc>90){ acc=0; TRY.sw++; const b=document.getElementById("trySw"); if(b){ b.textContent=TRY.sw; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); } if(TRY.sw===24) TRY.tm=setTimeout(()=>tryOpen("end"),900); } }});
  TRY.tm=setTimeout(()=>{ if(TRY.k==="live") tryOpen("end"); },45000); }

/* ② 抽一張小卡：拆開、翻面，真正的藝人要進群才抽得到 */
function tryCard(){ return `<div class="try-cardw">
  <div class="try-pack" id="tryPack" data-a="tryFlip"><div class="try-card"><div class="tc-back"><span class="hc-wm">${APP_NAME}</span><i></i></div>
    <div class="tc-front"><span class="tc-holo"></span><svg class="tc-sil" viewBox="0 0 100 130" aria-hidden="true"><circle cx="50" cy="44" r="22"/><path d="M8 130c4-30 22-46 42-46s38 16 42 46z"/></svg><b class="tc-q">?</b><span class="tc-r">SSR</span><span class="tc-n">YOUR BIAS</span></div></div></div>
</div>`; }
function tryCardOn(){ const p=document.getElementById("tryPack"); if(!p) return;
  p.addEventListener("pointermove",e=>{ const r=p.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; p.style.setProperty("--rx",(-y*16).toFixed(1)+"deg"); p.style.setProperty("--ry",(x*18).toFixed(1)+"deg"); p.style.setProperty("--hx",(x*100+50).toFixed(0)+"%"); });
  p.addEventListener("pointerleave",()=>{ p.style.setProperty("--rx","0deg"); p.style.setProperty("--ry","0deg"); }); }
function tryFlip(){ const p=document.getElementById("tryPack"); if(!p||p.classList.contains("go")) return; p.classList.add("go"); setTimeout(()=>p.classList.add("flip"),650); TRY.tm=setTimeout(()=>{ if(TRY.k==="card") tryOpen("end"); },3600); }

/* ③ 應援餐車：換顏色、寫應援標語，車子真的會開過來 */
function tryTruck(){ return `<div class="try-trk"><div class="try-trk3d" id="tryTk"><span class="trk-load"></span></div>
  <div class="try-trk-p"><div class="try-pal">${TRUCK_PAL.map((p,i)=>`<button class="${i===0?"on":""}" data-a="tryPal" data-v="${i}" style="background:${p.body}" aria-label="${p.n}"></button>`).join("")}</div>
  <label class="field"><input id="trySlg" maxlength="16" placeholder="輸入文字"></label>
  <button class="btn btn-main btn-block" data-a="trySend">送出 🚚</button></div></div>`; }
const tryDeco=()=>({...TRUCK_DECO0(),pal:TRY.pal||0,slogan:(document.getElementById("trySlg")||{}).value||"",name:"YOUR BIAS",title:"SUN KISS",from:"YOU"});
function tryTruckOn(){ TRY.pal=0; const el=document.getElementById("tryTk"); TRUCK3D.mount(el,tryDeco(),{drive:true}).then(I=>{ const l=el&&el.querySelector(".trk-load"); if(I&&l) l.remove(); });
  const inp=document.getElementById("trySlg"); if(inp) inp.addEventListener("input",()=>{ clearTimeout(TRY.st); TRY.st=setTimeout(()=>TRUCK3D.set(tryDeco()),260); }); }

/* 玩完：想繼續，就進群 */
function tryEnd(){ return `<div class="try-end"><span class="try-glow"></span>
  <h2>想玩更多？</h2>
  <div class="try-lock">${TRY_LOCK.map(([e,l,d])=>`<span><i>${e}</i><b>${l}</b><small>${d}</small><u>🔒</u></span>`).join("")}</div>
  <button class="btn btn-main btn-block" data-a="tryJoin">加入 SUN KISS</button>
  <button class="try-again" data-a="tryGo" data-v="menu">再玩一次</button></div>`; }
function tryJoin(){ if(TRY_JOIN){ window.open(TRY_JOIN,"_blank"); return; } toast("到 LINE 搜尋「SUN KISS」"); }

/* =========================================================
   SKpedia：照 Namuwiki 的樣子做的藝人百科（她 10/28 定）
   ・個人頁 m:<藝人id>、團體頁 g:<團id>；粉絲只能看，藝人改自己的頁（團體頁由成員改），管理員都能改
   ・自動填：照片、所屬團、出道日、應援色、作品、打歌一位、演唱會、世巡、成員
   ・藝人寫：資料框欄位、概要、經歷、趣事（여담）；[*註腳] 變成註腳、[[名字]] 變成連結（照 Namuwiki 寫法）
   ・修改紀錄每頁留最近 20 筆（只記誰、什麼時候、多了幾個字，不存舊內容，雲端才不會越來越大）
   資料：daisuki_wiki（只有文字）
   ========================================================= */
const WK_KEY="daisuki_wiki";


const wkAll=()=>S.get(WK_KEY,{})||{};
const wkPage=id=>wkAll()[id]||{};
const wkOk=id=>{ if(!groupOf((id||"").startsWith("g:")?id.slice(2):(MEMBERS[id.slice(2)]||{}).group)) return false; return true; };
const wkFanView=()=>!["artist","admin"].includes(route().role)||((session()||{}).role==="fan");   /* 粉絲端只能看：不顯示編輯、修改時間、還沒寫的段落 */
function wkCanEdit(id){ try{ if(wkFanView()) return false; if(isAdminAcct()) return true; const s=session(); if(!s||s.role!=="artist") return false; const me=s.member||uniMe();
    if(id.startsWith("m:")) return id.slice(2)===me; if(id.startsWith("g:")) return !!MEMBERS[me]&&MEMBERS[me].group===id.slice(2); }catch(e){} return false; }
const wkName=id=>id.startsWith("g:")?(groupOf(id.slice(2))||{}).name||"":(MEMBERS[id.slice(2)]||{}).name||"";
const wkHash=id=>(route().role==="artist"?"#/artist?tab=foc&p=wiki":route().role==="admin"?"#/admin?tab=wiki":"#/fan/core?p=wiki")+"&id="+(id?encodeURIComponent(id):"home");   /* 首頁用 id=home（藝人端沒 id 會直接開自己的頁） */
/* 名字找頁：[[名字]] 用 */

/* 不用任何特殊寫法（她 10/28：藝人不會用 wiki 語法）：文字裡出現其他藝人或團的名字，自動變成藍色連結 */
function wkTxt(t,notes,self){ let h=esc(t||""); const names=[...GROUPS.filter(g=>g.id!=="tdm_g").map(g=>[g.name,"g:"+g.id]),...Object.keys(MEMBERS).filter(k=>!MEMBERS[k].official&&k!=="tdm_m").map(k=>[MEMBERS[k].name,"m:"+k])].filter(([n,id])=>n&&n.length>=2&&id!==self).sort((a,b)=>b[0].length-a[0].length);
  if(names.length){ const re=new RegExp(names.map(([n])=>esc(n).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|"),"g"), map=new Map(names.map(([n,id])=>[esc(n),id])); h=h.replace(re,m=>`<a class="wk-ln" data-a="wkGo" data-v="${map.get(m)}">${m}</a>`); }
  return h.replace(/\n/g,"<br>"); }
/* 自動資料 */
function wkAuto(gid){ const ms=getMShow(); let songs=[...(ms.songs||[]),...(ms.ended||[])].filter(s=>s.gid===gid); const wins={};
  Object.values(ms.wins||{}).forEach(w=>Object.values(w||{}).forEach(sid=>{ if(sid) wins[sid]=(wins[sid]||0)+1; }));
  const now=Date.now(), cc=getConcerts().filter(c=>c.gid===gid&&!c.tour&&(c.ended||c.endTs<=now)), tours=(typeof getTours==="function"?getTours():[]).filter(t=>t.gid===gid&&t.status==="approved");
  { const ph=x=>!String(x.title||"").trim()||/^出道$/.test(String(x.title).trim()), dbs=songs.filter(x=>x.debut), keep=dbs.find(x=>x.mv&&!ph(x))||dbs.find(x=>!ph(x));
    const drop=new Set(songs.filter(x=>(songs.length>1&&ph(x))||(keep&&x.debut&&x!==keep)).map(x=>x.id)); if(keep) drop.delete(keep.id);
    drop.forEach(id=>{ if(keep&&wins[id]){ wins[keep.id]=(wins[keep.id]||0)+wins[id]; } }); songs=songs.filter(x=>!drop.has(x.id)).sort((a,b)=>songRel(a)-songRel(b)); }
  return {debut:idTs(gid,/^g/), songs, wins, cc, tours}; }
const wkYmd=ts=>{ const d=new Date(ts); return `${d.getFullYear()}年 ${d.getMonth()+1}月 ${d.getDate()}日`; };
/* ===== 團體頁、SOLOIST 頁：照 Namuwiki 手機版（她 10/28 給 ifeye、BIBI、dodree 截圖；TW-IN 是兩人團） ===== */
const WKG_F=[["genre","曲風"],["leader","隊長"],["co","公司"],["dist","發行商"],["fan","粉絲名"]];
const WKS_F=[["real","本名"],["birth","出生日期","date"],["bplace","出生地"],["from","出身"],["nat","國籍"],["clan","本貫"],["body","身體資料"],["family","家人"],["rel","宗教"],["edu","學歷"],["co","公司"],["fan","粉絲名"],["motto","座右銘"],["nick","綽號"],["hobby","興趣"],["mbti","MBTI"]];
/* 段落：[key, 標題, 小段[[key,標題]], 自動內容] */
const WKG_S=[["ov","概要"],["mem","成員",[["chem","成員間的化學反應"]]],["feat","特色"],["act","活動",[["perf","公演"],["cont","內容"],["show","綜藝"]]],["disc","作品"],["award","得獎紀錄"],["tr","趣事",[["pre","出道前"]]],["pics","歷代宣傳照"],["nav","周邊導覽"]];
const WKS_S=[["ov","概要"],["life","生平"],["music","音樂活動",[["disc","作品"],["award","音樂節目"],["perf","公演"]]],["acting","演技活動"],["other","其他活動",[["show","綜藝"],["radio","廣播"],["ad","廣告"]]],["prize","得獎紀錄"],["ctrv","爭議"],["tr","趣事"],["nav","周邊導覽"]];
const wkT=P=>P.s||{ov:P.ov||"",life:P.hi||"",tr:P.tr||""};   /* v330 以前的個人頁資料 */
const WK_ED=new Set(["perf","ov","mem","pics"]);   // 自動段裡可以手動編輯的
const WK_AUTO=new Set(["ov","mem","disc","award","perf","show","ad","pics","nav","prize"]);   // 這些段自動填（perf 自動＋可補寫）
const wkDays=ts=>Math.floor((dayStart(Date.now())-dayStart(ts))/864e5);
const wkAge=s=>{ const t=ymdTs(s); if(!t) return ""; const d=new Date(t), n=new Date(); let a=n.getFullYear()-d.getFullYear(); if(n.getMonth()<d.getMonth()||n.getMonth()===d.getMonth()&&n.getDate()<d.getDate()) a--; return a; };
const wkDot=s=>{ const t=ymdTs(s); if(!t) return esc(s||""); const d=new Date(t); return `${d.getFullYear()}. ${pad(d.getMonth()+1)}. ${pad(d.getDate())}.`; };
function wkAutoSec(k,ctx){ const {gid,A,isSolo,key,isM}=ctx, mem=isM?[key]:ctx.mem, empty="";
  if(isM&&["mem","disc","award","prize","pics"].includes(k)) return "";
  if(k==="ov"){ if((wkT(wkPage(ctx.id)).ov||"").trim()) return ""; const F=(wkPage(ctx.id).f)||{}, GF=(wkPage("g:"+gid).f)||{}, co=F.co||GF.co, n=ctx.mem.length;   /* 沒寫概要：用現有資料自動一句（像 Namuwiki 開頭） */
    return `<p>${isM?`${co?wkTxt(co,[],ctx.id)+" 旗下":""}${n}人組 ${wkTxt(ctx.g.name,[],ctx.id)} 的成員${F.pos?`，擔任${esc(F.pos)}`:""}。`:isSolo?`${co?esc(co)+" 旗下的":""}SOLOIST。`:`${co?esc(co)+" 旗下的":""}${n===2?"二人組":n+"人組"}，成員是 ${ctx.mem.map(x=>wkTxt(MEMBERS[x].name,[],ctx.id)).join("、")}。`}${A.debut?` ${wkYmd(A.debut)} 出道。`:""}</p>`; }
  if(k==="mem"){ const MI=wkPage("g:"+gid).mi||{}, FM=x=>{ const a=(wkPage("m:"+x).f)||{}, b=MI[x]||{}; return {bday:a.birth||a.bday||b.birth, nat:a.nat||b.nat, pos:a.pos||b.pos}; }, has=k=>mem.some(x=>FM(x)[k]), n=mem.length, cols=n<=2||n===4?2:3; return `<div class="wkm-grid" style="--cols:${cols};--wc:${ctx.col}">${mem.map(x=>{ const Fm=FM(x); return `<div class="wkm-c">${(()=>{ const u=(wkPage("g:"+gid).mph||{})[x]; return u?`<a class="wkm-ph" data-a="wkGo" data-v="m:${x}" style="background:center/cover url('${esc(u)}')"></a>`:`<a class="wkm-ph" data-a="wkGo" data-v="m:${x}" style="background:${grad(MEMBERS[x].g||0)}">${teaserIn?teaserIn(x):mAvIn(x)}</a>`; })()}<b data-a="wkGo" data-v="m:${x}">${esc(wkKn(x))}</b>${has("bday")?`<span>${Fm.bday?`${wkDot(Fm.bday)}${wkAge(Fm.bday)!==""?` (${wkAge(Fm.bday)}歲)`:""}`:"—"}</span>`:""}${has("nat")?`<span>${esc(Fm.nat||"—")}</span>`:""}${has("pos")?`<span>${esc(Fm.pos||"—")}</span>`:""}</div>`; }).join("")}</div>`; }
  if(k==="disc") return A.songs.length?`<table class="wk-tb"><tr><th>歌名</th><th>發行</th><th>一位</th></tr>${A.songs.map(s=>{ const t=songRel(s); return `<tr><td>${esc(s.title)}</td><td>${t?wkYmd(t):""}</td><td>${A.wins[s.id]||0}</td></tr>`; }).join("")}</table>`:empty;
  if(k==="award"||k==="prize"){ const L=A.songs.filter(s=>A.wins[s.id]); return L.length?`<ul>${L.map(s=>`<li>音樂節目一位：《${esc(s.title)}》${A.wins[s.id]} 次</li>`).join("")}</ul>`:empty; }
  if(k==="perf") return A.cc.length||A.tours.length?`<ul>${A.cc.map(c=>`<li>${wkYmd(c.startTs)}　${esc(c.title)}</li>`).join("")}${A.tours.map(t=>`<li>世界巡演「${esc(t.title)}」：${tourStops(t).map(s=>esc(s.city)).join("・")}</li>`).join("")}</ul>`:"";
  if(k==="show"){ const eps=(S.get(VS_KEY,[])||[]).filter(e=>e&&VSHOW[e.show]&&(e.mids||[]).some(x=>mem.includes(x))); return eps.length?`<table class="wk-tb"><tr><th>節目</th><th>結果</th></tr>${eps.map(e=>`<tr><td>${esc(VSHOW[e.show].name)}</td><td>${e.st!=="done"?"播出中":(e.mids||[]).filter(x=>mem.includes(x)).some(x=>((e.res||{}).win||[]).includes(x))?"🏆 冠軍":"出演"}</td></tr>`).join("")}</table>`:empty; }
  if(k==="ad"){ const L=(typeof bzAll==="function"?bzAll():[]).filter(b=>b&&mem.includes(b.mid)); return L.length?`<ul>${L.map(b=>`<li>${esc(b.brand||b.title||"代言")}</li>`).join("")}</ul>`:empty; }
  if(k==="pics"&&wkPicsOf(ctx.id).length) { const cs=wkCols(gid,gTheme(gid)), hv=u=>WKHC[u]?`--hc:${WKHC[u][0]};--hct:${WKHC[u][1]}`:"";   /* 像 Namuwiki：標題列用代表色，每張下面一條字（哪一次回歸），底色抓那張照片的顏色 */
    return `<div class="wk-pics3${isSolo?"":" wide"}"><b class="wkp-h" style="background:${cs.length>1?`linear-gradient(90deg,${cs.join(",")})`:cs[0]};color:${wkInk(cs[0])}">${isSolo?"歷代宣傳照":"歷代團體宣傳照"}</b><div class="wkp-g">${wkPicsOf(ctx.id).map(p=>`<figure data-src="${esc(p.u)}" style="${hv(p.u)}"><span style="background-image:url('${esc(p.u)}')"></span><figcaption>${esc(p.t||"")}</figcaption></figure>`).join("")}</div></div>`; }
  if(k==="pics"){ const ph=(isSolo?[mPhoto(key)]:[gPhoto(gid)]).filter(Boolean);   /* 團體頁只放團體照，不放成員個人照 */ return ph.length?`<div class="wk-pics${isSolo?"":" wide"}">${ph.map(u=>`<span style="background-image:url('${u}')"></span>`).join("")}</div>`:empty; }
  if(k==="nav") return `<table class="wk-nav" style="--wc:${ctx.col}"><tr><th><a class="wk-ln" data-a="wkGo" data-v="g:${gid}">${esc(ctx.g.name)}</a></th></tr><tr><td>${mem.map(x=>`<a class="wk-ln" data-a="wkGo" data-v="m:${x}">${esc(wkKn(x))}</a>`).join(" · ")}</td></tr></table>`;
  return ""; }
/* 宣傳照：有存過就用存的（刪光也算），沒存過就先放現在的大照片，讓人可以直接加說明、換掉 */
/* 編輯中換的照片先暫放（按儲存才寫進去，取消就不算）；重畫時保留已經打的字 */
const wkStg=id=>{ if(!ui.wkStg||ui.wkStg.id!==id) ui.wkStg={id,o:{}}; return ui.wkStg.o; };
const wkFKey=el=>el.dataset.k||el.dataset.mi||(el.dataset.pc!=null?"pc"+el.dataset.pc:"")||(el.dataset.nk?el.dataset.nk+"|"+el.dataset.i:"");
const wkDrK=()=>"wk_draft_"+ui.wkEd;
function wkDraftSave(){ if(!ui.wkEd||!document.querySelector(".wk-ed")) return; const V={}; document.querySelectorAll(".wk-ed input:not([type=file]),.wk-ed textarea").forEach(el=>{ const k=wkFKey(el); if(k) V[k]=el.value; });
  try{ localStorage.setItem(wkDrK(),JSON.stringify({v:V,stg:ui.wkStg&&ui.wkStg.o,ts:Date.now()})); localStorage.setItem("wk_open",JSON.stringify({h:location.hash,ed:ui.wkEd,y:scrollY,ts:Date.now()})); }catch(e){} }
function wkDraftDrop(){ try{ if(ui.wkEd) localStorage.removeItem(wkDrK()); localStorage.removeItem("wk_open"); }catch(e){} }
function wkDraftApply(){ if(!ui.wkEd||!document.querySelector(".wk-ed")) return; let D=null; try{ D=JSON.parse(localStorage.getItem(wkDrK())||"null"); }catch(e){} if(!D) return wkGrowAll();
  const id=ui.wkEd.split("#")[0]; if(D.stg&&Object.keys(D.stg).length&&!(ui.wkStg&&ui.wkStg.id===id&&Object.keys(ui.wkStg.o).length)){ ui.wkStg={id,o:D.stg}; const snap=ui.wkSnap; render(); ui.wkSnap=snap; }
  let n=0; document.querySelectorAll(".wk-ed input:not([type=file]),.wk-ed textarea").forEach(el=>{ const k=wkFKey(el); if(k&&D.v[k]!=null&&el.value!==D.v[k]){ el.value=D.v[k]; n++; } });
  document.querySelectorAll(".wk-nts").forEach(b=>{ const el=document.querySelector(`.wk-ed [data-k="${b.dataset.for}"]`); if(el&&typeof wkNtSync==="function"){ const V={}; Object.keys(D.v).filter(k=>k.startsWith(b.dataset.for+"|")).forEach(k=>V[k.split("|").pop()]=D.v[k]); WKNC[b.dataset.for]={...V}; wkNtSync(el,false); b.querySelectorAll("[data-nk]").forEach(x=>{ if(V[x.dataset.i]!=null) x.value=V[x.dataset.i]; }); } });
  wkGrowAll(); }
const wkGrow=el=>{ el.style.height="auto"; el.style.height=el.scrollHeight+2+"px"; };
const wkGrowAll=()=>document.querySelectorAll(".wk-ed .wk-ta").forEach(wkGrow);
document.addEventListener("input",e=>{ if(!e.target.closest||!e.target.closest(".wk-ed")) return; if(e.target.classList.contains("wk-ta")) wkGrow(e.target); clearTimeout(ui.wkDrS); ui.wkDrS=setTimeout(wkDraftSave,400); });
function wkKeepRender(){ const key=wkFKey, V={};
  document.querySelectorAll(".wk-ed input:not([type=file]),.wk-ed textarea").forEach(el=>{ const k=key(el); if(k) V[k]=el.value; }); const y=window.scrollY, snap=ui.wkSnap; render();
  document.querySelectorAll(".wk-ed input:not([type=file]),.wk-ed textarea").forEach(el=>{ const k=key(el); if(k&&V[k]!=null) el.value=V[k]; }); ui.wkSnap=snap; window.scrollTo(0,y); }
function wkPicsOf(id){ const P={...wkPage(id),...(ui.wkStg&&ui.wkStg.id===id&&ui.wkEd?ui.wkStg.o:{})}; if(Array.isArray(P.pics)) return P.pics; const isM=id.startsWith("m:"); if(isM) return []; const gid=id.slice(2), g=groupOf(gid)||{}, u=g.solo?(P.photo||mPhoto(grpMembers(gid)[0])):(P.photo||gPhoto(gid)); return u?[{u,t:""}]:[]; }
/* 資料框的字：漢字(かな) → 假名小字浮在漢字上；一行最後面的 (…) 變小字（本名、韓文名除外） */
function wkFmtL(L,small){ L=L.replace(/([\u3400-\u9FFF々〆]+)[(（]([\u3040-\u30FFー・ ]+)[)）]/g,"<ruby>$1<rt>$2</rt></ruby>");
  return small?L.replace(/(\([^()<>]*\))((?:\u0002[^\u0003]*\u0003)*)\s*$/,'<small class="wk-sm">$1</small>$2'):L; }
const wkCapHtml=(P,ls)=>{ const t=wkFnStrip((P.f||{}).capt)||(ls?`《${ls.title}》`:""); return t||P.alogo?`<small class="wkg-cap2">${esc(t)}${P.alogo?`<img src="${esc(P.alogo)}" alt="">`:""}</small>`:""; };   /* 照片下面那行：說明＋專輯 Logo */
const wkKn=x=>(wkPage("m:"+x).f||{}).kname||MEMBERS[x].name;   /* 成員顯示韓文藝名（沒填用英文） */
/* 頁面的共同資料（團體頁 g:、SOLOIST 頁 g:(solo)、成員頁 m:） */
function wkCtx(id){ const isM=id.startsWith("m:"), key0=id.slice(2), gid=isM?(MEMBERS[key0]||{}).group:key0, g=groupOf(gid), isSolo=!isM&&!!g.solo, mem=grpMembers(gid), key=isM?key0:isSolo?mem[0]:null;
  return {id,isM,isSolo,person:isM||isSolo,gid,g,mem,key,A:wkAuto(gid),col:gTheme(gid)}; }
const wkSecs=ctx=>ctx.person?WKS_S:WKG_S;
/* 這一段有沒有內容（沒內容的段落和連結都不出現，她：沒有的不要寫） */
function wkHas(ctx,P,k){ const T=wkT(P); return !!((T[k]||"").trim()||(k==="ov"&&T.ovq)||(WK_AUTO.has(k)&&wkAutoSec(k,ctx))); }
function wkSecOn(ctx,P,[k,t,sub]){ return wkHas(ctx,P,k)||(sub||[]).some(([k2])=>wkHas(ctx,P,k2)); }
/* 團的名片（團體頁、成員頁共用）：Logo／團名點了回團體頁；[音樂作品][出演作品][相關文件] 點了在卡片裡展開 */
function wkNavbox(ctx){ const {gid,g,mem,isSolo}=ctx, col=gTheme(gid), GP=wkPage("g:"+gid), GF=GP.f||{}, gctx=wkCtx("g:"+gid), open=ui.wkNb&&ui.wkNb.startsWith(gid+"|")?ui.wkNb.split("|")[1]:"";
  const logo=GP.logo?`<img class="wkg-logo" src="${esc(GP.logo)}" alt=""><i></i>`:"";
  const eps=(S.get(VS_KEY,[])||[]).filter(e=>e&&VSHOW[e.show]&&(e.mids||[]).some(x=>mem.includes(x)));
  const rel=wkSecs(gctx).flatMap(([k,t,sub])=>[[k,t],...(sub||[])]).filter(([k])=>!["ov","nav","mem"].includes(k)&&wkHas(gctx,GP,k));
  const GT=wkT(GP), lines=ks=>ks.flatMap(k=>(GT[k]||"").split("\n")).map(x=>x.replace(/^[-・*]\s*/,"").replace(/\[\d+\]/g,"").trim()).filter(Boolean), part=isSolo?lines(["music"]):[], acts=isSolo?lines(["acting","show","radio","ad"]):[];
  const tabs=[gctx.A.songs.length?["disc","音樂作品"]:null,part.length?["part","參與作品"]:null,isSolo&&(eps.length||acts.length)?["show","出演作品"]:null,rel.length?["rel","相關文件"]:null].filter(Boolean);
  const li=a=>a.length?`<ul class="wkn-li">${a.map(x=>`<li>${wkTxt(x,[],"g:"+gid)}</li>`).join("")}</ul>`:"";
  const cover=s=>{ const ph=gPhoto(gid); return ph?`style="background-image:url('${esc(ph)}')"`:`style="background:${grad(g.g||0)}"`; };
  const panel=open==="disc"?`<div class="wkn-grid">${gctx.A.songs.map(s=>{ const t=songRel(s); return `<div class="wkn-t"><span class="wkn-cv" ${cover(s)}></span><b>${esc(s.title)}</b><em>${gctx.A.wins[s.id]?`一位 ${gctx.A.wins[s.id]} 次`:"單曲"}</em><small>${t?wkDot(ymdIn(t)):""}</small></div>`; }).join("")}</div>`
    :open==="show"?`<div class="wkn-grid">${eps.map(e=>`<div class="wkn-t"><span class="wkn-cv" style="background:${grad((e.show||"").length)}"></span><b>${esc(VSHOW[e.show].name)}</b><em>${(e.mids||[]).some(x=>((e.res||{}).win||[]).includes(x))?"🏆 冠軍":"出演"}</em></div>`).join("")}</div>${li(acts)}`
    :open==="part"?li(part)
    :open==="rel"?`<div class="wkn-rel">${rel.map(([k,t])=>`<a data-a="wkJump" data-v="${gid}|${k}">${t}</a>`).join("")}</div>`:"";
  return `<div class="wkg-card" style="--wc:${col}"><div class="wkg-top" data-a="wkGo" data-v="g:${gid}">${logo}<span>${isSolo&&GF.kname?`<b>${esc(GF.kname)}</b><small>${esc(g.name.toUpperCase())}</small>`:`<b>${esc(g.name)}</b><small>${esc(GF.kname||"")}</small>`}</span></div>
    ${!isSolo&&mem.length?`<div class="wkg-mem">${mem.map(x=>`<a data-a="wkGo" data-v="m:${x}" class="${ctx.key===x?"me":""}">${esc(wkKn(x))}</a>`).join("")}</div>`:""}
    ${tabs.length?`<div class="wkg-links">${tabs.map(([k,l])=>`<a data-a="wkNb" data-v="${gid}|${k}" class="${open===k?"on":""}">[ ${l} ]</a>`).join("")}</div>`:""}${panel}</div>`; }
/* 註解：文字裡的 [1] [2]（不用 wiki 語法，編輯時按「＋ 註解」自動放），內容存在 P.n["f.欄位"/"s.段落"] */
const wkFnTok=(o,b)=>Object.fromEntries(Object.entries(o||{}).map(([k,v])=>[k,typeof v==="string"?v.replace(/\[(\d+)\]/g,(m,i)=>`\u0002${b}.${k}|${i}\u0003`):v]));
const wkFnStrip=v=>String(v||"").replace(/\u0002[^\u0003]*\u0003/g,"");
let WKFN=[];
function wkFnDone(html,P){ WKFN=[]; const N=P.n||{}; html=html.replace(/\u0002([^|\u0003]+)\|(\d+)\u0003/g,(m,k,i)=>{ const t=(N[k]||[])[i-1]; if(!t) return ""; WKFN.push(t); const n=WKFN.length; return `<sup class="wk-fn" data-a="wkFn" data-v="${n}">[${n}]</sup>`; });
  return WKFN.length?html.replace(/<\/article>$/,`<div class="wk-fns">${WKFN.map((t,i)=>`<p><a data-a="wkFn" data-v="${i+1}">[${i+1}]</a> ${wkTxt(t,[],"")}</p>`).join("")}</div></article>`):html; }
function wkViewG(id){ const ctx=wkCtx(id); if(ctx.isM){ const mc=wkMCols(id); if(mc) ctx.col=mc[0]; }   /* 成員頁：成員自己選的顏色（沒選＝團代表色）；名片仍用團代表色 */ const {gid,g,mem,key,A,col,isM,isSolo,person}=ctx, P=wkPage(id), can=wkCanEdit(id);
  if(ui.wkEd&&ui.wkEd.startsWith(id+"#")&&can) return wkSecEditor(id,ui.wkEd.slice(id.length+1),person,{...P,...wkStg(id)},isM);
  return wkFnDone(wkViewG2(id,ctx,P,can),P); }
function wkViewG2(id,ctx,P,can){ const {gid,g,mem,key,A,col,isM,isSolo,person}=ctx, F=wkFnTok(P.f,"f"), T=wkFnTok(wkT(P),"s");
  const mc=isM?wkMCols(id):null, cs=mc||wkCols(gid,gTheme(gid)), sol=isSolo||mc?`;--wth:${cs[0]};--wtt:${cs[1]||wkInk(cs[0])};--wc:${cs[1]||cs[0]}`:"";
  const name=isM?MEMBERS[key].name:g.name, lastSong=A.songs[A.songs.length-1], firstSong=A.songs[0];
  const photo=P.photo||(person?mPhoto(key):gPhoto(gid));
  const hero=!person&&photo?`<figure class="wkg-hero" data-src="${esc(photo)}" style="--wc:${col}${WKHC[photo]?`;--hc:${WKHC[photo][0]};--hct:${WKHC[photo][1]}`:""}"><span style="background-image:url('${esc(photo)}')"></span><figcaption><span>${mem.map(x=>`<a data-a="wkGo" data-v="m:${x}">${esc((wkPage("m:"+x).f||{}).kname||MEMBERS[x].name)}</a>`).join(" · ")}</span>${(()=>{ return wkCapHtml(P,lastSong); })()}</figcaption></figure>`:"";
  const sm=l=>!/本名|韓文/.test(l), row=(l,v)=>{ if(!v) return ""; const B=String(v).trim().split(/\n\s*\n/).map(b=>b.split("\n").map(x=>wkFmtL(x,sm(l))).join("\n")); return `<tr><th>${l}</th><td${B.length>1?` class="wk-tdm"`:""}>${B.map(b=>B.length>1?`<div>${b.split("\n").join("<br>")}</div>`:b.split("\n").join("<br>")).join("")}</td></tr>`; }, d=A.debut, dd=d?wkDays(d):0;
  const debutRow=d?`${wkYmd(d)}${firstSong?` <span class="wk-chip f">${esc(firstSong.title)}</span>`:""}<br><small>（出道第 +${dd} 天，${Math.floor(dd/365)} 週年）</small>`:"";
  const linkRow=ui.wkLk===id?`<a class="wk-ln" data-a="wkCm" data-v="${gid}">社群頁</a> · <a class="wk-ln" data-a="wkLinks" data-v="${id}">[ 收合 ]</a>`:`<a class="wk-ln" data-a="wkLinks" data-v="${id}">[ 展開・收合 ]</a>`;
  const birth=F.birth||F.bday;
  const infoRows=person?(isM?[["pos","隊內位置"],...WKS_F.filter(x=>x[0]!=="fan")]:WKS_F).map(([k,l])=>{ if(k==="birth") return row("出生",birth||F.bplace?`${birth?`${wkDot(birth)}${wkAge(birth)!==""?`（${wkAge(birth)}歲）`:""}`:""}${birth&&F.bplace?"\n\n":""}${F.bplace?esc(F.bplace):""}`:""); if(k==="bplace") return ""; if(k==="co") return row(l,esc(F[k]||(isM?(wkPage("g:"+gid).f||{}).co||"":"")))+(isM?row("所屬",`<a class="wk-ln" data-a="wkGo" data-v="g:${gid}">${esc(g.name)}</a>`)+row("出道",debutRow):row("出道",debutRow)); if(k==="fan") return row(l,F.fan?`<span class="wk-pill" style="${wkPillCss(cs)}">${esc(F.fan)}</span>`:""); return row(l,esc(F[k]||"")); }).join("")+row("簽名",(()=>{ const sig=Object.values(S.get("daisuki_cafe",{})||{}).filter(c=>c&&c.mid===key&&c.art&&c.art.sig).map(c=>c.art.sig).pop(); return sig&&typeof cfImg==="function"?`<span class="wk-sig">${cfImg(sig,"sig")}</span>`:""; })())
    :row("出道日",debutRow)+row("出道作品",firstSong?`<span class="wk-chip f">${esc(firstSong.title)}</span>`:"")+WKG_F.map(([k,l])=>row(l,k==="fan"&&F.fan?`<span class="wk-pill" style="${wkPillCss(cs)}">${esc(F.fan)}</span>`:k==="leader"&&F.leader?wkTxt(F.leader,[],id):esc(F[k]||""))).join("");
  const head=isM?`<b>${esc(F.kname||name)}</b><small>${esc(F.kname?name.toUpperCase():"")}</small>`:isSolo?`<b>${esc(name)}</b><small>${esc(F.kname||"")}</small>`:`<div class="wkg-top">${P.logo?`<img class="wkg-logo" src="${esc(P.logo)}" alt=""><i></i>`:""}<span><b>${esc(g.name)}</b><small>${esc(F.kname||"")}</small></span></div>`;
  const info=`<table class="wk-info2${isSolo||mc?" solo":""}" style="--wc:${col}${sol}"><tr><td colspan="2" class="wk-ih2">${head}</td></tr>${person&&photo?`<tr><td colspan="2" class="wk-iph2"><span style="background-image:url('${esc(photo)}')"></span></td></tr>`:""}${infoRows}${row("連結",linkRow)}</table>${can?`<p class="wk-ie"><a data-a="wkEditS" data-v="${id}#info">[編輯]</a></p>`:""}`;
  const SS=wkSecs(ctx), fold=ui.wkFold||{}, toc=[], body=[], empty=[];
  const txt=k=>{ const v=(T[k]||"").trim(); if(!v) return ""; if(k==="tr"||k==="pre") return `<ul>${v.split("\n").filter(x=>x.trim()).map(x=>`<li>${wkTxt(x.replace(/^[-・*]\s*/,""),[],id)}</li>`).join("")}</ul>`; return `<p>${wkTxt(v,[],id)}</p>`; };
  const secHtml=(n,k,t,lv)=>{ const auto=WK_AUTO.has(k)?wkAutoSec(k,ctx):"", own=txt(k), q=k==="ov"&&T.ovq?`<blockquote class="wk-q">${esc(T.ovq)}</blockquote>`:"", ed=can&&(!WK_AUTO.has(k)||WK_ED.has(k))?`<a class="wk-ed1" data-a="wkEditS" data-v="${id}#${k}">[編輯]</a>`:"";
    toc.push(`<a data-a="wkToK" data-v="${k}" class="lv${lv}"><span class="wk-no">${n}.</span> ${t}</a>`);
    return `<section class="wk-s lv${lv} ${fold[id+k]?"fold":""}" data-k="${k}"><h2><i class="wk-ar" data-a="wkFold" data-v="${id+k}">⌄</i><span class="wk-no">${n}.</span> ${t}${ed}</h2><div class="wk-sc">${q}${auto}${own}</div></section>`; };
  let n=0; SS.forEach(([k,t,sub])=>{ if(!wkSecOn(ctx,P,[k,t,sub])){ if(can&&(!WK_AUTO.has(k)||WK_ED.has(k))) empty.push([k,t]); (sub||[]).forEach(([k2,t2])=>{ if(can&&(!WK_AUTO.has(k2)||WK_ED.has(k2))) empty.push([k2,t2]); }); return; }
    n++; body.push(secHtml(n,k,t,1)); let j=0; (sub||[]).forEach(([k2,t2])=>{ if(wkHas(ctx,P,k2)){ j++; body.push(secHtml(`${n}.${j}`,k2,t2,2)); } else if(can&&(!WK_AUTO.has(k2)||WK_ED.has(k2))) empty.push([k2,t2]); }); });
  const cats=[g.name,d?new Date(d).getFullYear()+"年出道":"",isM?wkFnStrip(F.pos):isSolo?"SOLOIST":mem.length===2?"二人組":`${mem.length}人組`,wkFnStrip(F.co)].filter(Boolean);
  const H=P.hist||[];
  if(ui.wkJ&&ui.wkJ.id===id){ const k=ui.wkJ.k; ui.wkJ=null; setTimeout(()=>{ const s=document.querySelector(`.wk-s[data-k="${k}"]`); if(s) s.scrollIntoView({block:"start"}); },60); }
  return `<article class="wk-doc wk-g"${ctx.hsrc?` data-hsrc="${esc(ctx.hsrc)}"`:""}>
    <h1 class="wk-t">${esc(name)}</h1>${wkFanView()?"":`<p class="wk-upd2">最近修改時間：${P.ts?`${ymd(P.ts)} ${timeHM(P.ts)}`:"—"}<a data-a="wkHist" data-v="${id}">歷史</a></p>`}
    <div class="wk-cat2 ${ui.wkCat===id?"open":""}"><span>分類：${cats.map(c=>`<a class="wk-ln">${esc(c)}</a>`).join(" | ")}</span><button data-a="wkCat" data-v="${id}">${ui.wkCat===id?"收合":"更多"}</button></div>
    ${ui.wkH===id&&!wkFanView()?`<div class="wk-hist"><b>修改紀錄</b>${H.length?H.slice().reverse().map(h=>`<p><span>${ymd(h.ts)} ${timeHM(h.ts)}</span> ${esc(h.n||"")} <em class="${h.d>=0?"p":"m"}">(${h.d>=0?"+":""}${h.d})</em></p>`).join(""):`<p>還沒有修改紀錄</p>`}</div>`:""}
    ${wkNavbox(ctx)}${hero}${info}
    ${toc.length?`<div class="wk-toc2 ${ui.wkTocC?"fold":""}" id="wkToc"><b data-a="wkTocT">目錄<i>⌄</i></b>${toc.join("")}</div>`:""}
    ${body.join("")}
    ${empty.length?`<div class="wk-add"><b>還沒寫的段落</b>${empty.map(([k,t])=>`<a data-a="wkEditS" data-v="${id}#${k}">＋ ${t}</a>`).join("")}</div>`:""}</article>`; }
function wkNtRows(key,txt,N){ const nums=[...new Set([...String(txt||"").matchAll(/\[(\d+)\]/g)].map(m=>+m[1]))].sort((a,b)=>a-b);
  return nums.map(i=>`<label class="wk-nt"><span>註解 ${i}</span><input data-nk="${key}" data-i="${i}" maxlength="300" value="${esc((N[i]!=null?N[i]:"")||"")}" placeholder="輸入文字"></label>`).join(""); }
const wkNtUI=(key,txt,P)=>`<div class="wk-nts" data-for="${key}">${wkNtRows(key,txt,Object.fromEntries(((P.n||{})[key]||[]).map((t,i)=>[i+1,t])))}</div><button type="button" class="wk-fnadd" data-a="wkFnAdd" data-v="${key}">＋ 註解</button>`;
function wkSecEditor(id,k,isSolo,P,isM){ const F={...(P.f||{})}, T=wkT(P), nm=k==="info"?"資料框":((isSolo?WKS_S:WKG_S).flatMap(([a,b,s])=>[[a,b],...(s||[])]).find(x=>x[0]===k)||[k,k])[1];
  if(F.bday&&!F.birth&&/^\d{4}-\d{2}-\d{2}$/.test(F.bday)) F.birth=F.bday;
  const fields=isSolo?(isM?[["pos","隊內位置"],...WKS_F.filter(x=>x[0]!=="fan")]:[...WKS_F,["capt","照片說明"]]):[...WKG_F,["capt","團體照說明"]];
  const body=k==="mem"?`<div class="wk-upl">${grpMembers(id.slice(2)).map(x=>{ const u=(P.mph||{})[x]; return `<div class="wk-upi"><span style="${u?`background-image:url('${esc(u)}')`:`background:${grad(MEMBERS[x].g||0)}`}"></span><b>${esc(MEMBERS[x].name)}</b><label class="btn btn-soft">${u?"換照片":"上傳照片"}<input type="file" accept="image/*" class="wk-up" data-v="${id}" data-m="${x}" hidden></label><button type="button" class="wk-mia" data-a="wkMiT" aria-label="展開"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button><div class="wk-mi" hidden><label><span>生日</span><input type="date" data-mi="${x}|birth" value="${esc(((P.mi||{})[x]||{}).birth||"")}"></label><label><span>國籍</span><input data-mi="${x}|nat" maxlength="20" value="${esc(((P.mi||{})[x]||{}).nat||"")}" placeholder="輸入文字"></label><label><span>隊內位置</span><input data-mi="${x}|pos" maxlength="30" value="${esc(((P.mi||{})[x]||{}).pos||"")}" placeholder="輸入文字"></label></div></div>`; }).join("")}</div>`
    :k==="pics"?`<div class="wk-upl">${wkPicsOf(id).map((p,i)=>`<div class="wk-upi"><span style="background-image:url('${esc(p.u)}')"></span><label class="field"><input data-pc="${i}" maxlength="40" value="${esc(p.t||"")}" placeholder="輸入文字"></label><button class="wk-del" data-a="wkPicDel" data-v="${id}|${i}" aria-label="刪除">${XI}</button></div>`).join("")}</div><label class="btn btn-soft btn-block">＋ 加照片<input type="file" accept="image/*" class="wk-up" data-v="${id}" data-m="" hidden></label>`
    :k==="info"?`<p class="wk-tip">這裡寫的是角色的設定，不是玩家本人。</p><div class="wk-ef">${[["kname",id.startsWith("g:")&&!(groupOf(id.slice(2))||{}).solo?"韓文團名":"韓文藝名"],...fields].map(([f,l,ty])=>`<div class="wk-fld"><label><span>${l}</span>${ty==="date"?`<input data-k="f.${f}" type="date" value="${esc(F[f]||"")}">`:`<textarea class="wk-ta" data-k="f.${f}" rows="1" maxlength="600" placeholder="輸入文字">${esc(F[f]||"")}</textarea>`}</label>${ty==="date"?"":wkNtUI("f."+f,F[f],P)}</div>`).join("")}</div>
      ${`<div class="wk-cols"><span>代表色</span>${[1,2,3].map(i=>{ const v=F["c"+i]||(i===1?gTheme(isM?(MEMBERS[id.slice(2)]||{}).group:id.slice(2)):""); return v?`<span class="wk-col"><input type="color" data-k="f.c${i}" value="${esc(v)}">${i>1?`<button type="button" data-a="wkColX" aria-label="拿掉">${XI}</button>`:""}</span>`:""; }).join("")}${F.c3?"":`<button type="button" class="wk-fnadd" data-a="wkColAdd">＋ 加顏色</button>`}</div>`}
      <div class="wk-up3">${[isM?null:["logo","團名旁邊的 Logo",`id="wkLogo" data-v="${id}"`],["photo",id.startsWith("g:")&&!isSolo?"團體照（資料框上面）":"資料框的大照片",`id="wkPhoto" data-v="${id}"`],id.startsWith("g:")?["alogo","照片下面的專輯 Logo",`class="wk-up" data-v="${id}" data-m="" data-al="1"`]:null].filter(Boolean).map(([k,l,att])=>`<div class="wk-u3"><span class="wk-u3p${k!=="photo"?" lg":""}">${P[k]?`<img src="${esc(P[k])}" alt="">`:""}</span><b>${l}</b><label class="btn btn-soft btn-sm">${P[k]?"換":"上傳"}<input type="file" accept="image/*" ${att} hidden></label></div>`).join("")}</div>`
    :`${k==="ov"?`<label class="wk-ea"><span>引言（可不填）</span><input data-k="s.ovq" maxlength="80" value="${esc(T.ovq||"")}" placeholder="輸入文字"></label>`:""}<label class="wk-ea"><span>${k==="tr"||k==="pre"?"一行一條":"內容"}</span><textarea data-k="s.${k}" rows="8" maxlength="4000" placeholder="輸入文字">${esc(T[k]||"")}</textarea></label>${wkNtUI("s."+k,T[k],P)}`;
  return `<article class="wk-doc wk-ed"><div class="wk-th"><h1>${esc(wkName(id))} <small>(編輯：${nm})</small></h1></div><p class="wk-tip">直接打字就好，提到其他藝人的名字會自動變成連結。</p>${body}
    <div class="ls-btns"><button class="btn btn-soft" data-a="wkCancel">取消</button><button class="btn btn-main" data-a="wkSaveS" data-v="${id}">儲存</button></div></article>`; }
function wkSaveS(id){ if(!wkCanEdit(id)) return; const all=wkAll(), P={...(all[id]||{}),...(ui.wkStg&&ui.wkStg.id===id?ui.wkStg.o:{})}, F={...(P.f||{})}, T={...wkT(P)}, vals=[];
  document.querySelectorAll(".wk-ed [data-k]").forEach(el=>{ const [b,k]=el.dataset.k.split("."), v=el.value.trim(); vals.push(v); (b==="f"?F:T)[k]=v; if(!v) delete (b==="f"?F:T)[k]; });
  const Nn={...(P.n||{})}; document.querySelectorAll(".wk-ed .wk-nts").forEach(b=>{ const key=b.dataset.for, arr=[]; b.querySelectorAll("[data-nk]").forEach(x=>{ arr[+x.dataset.i-1]=x.value.trim(); vals.push(x.value.trim()); }); if(arr.some(Boolean)) Nn[key]=[...arr].map(x=>x||""); else delete Nn[key]; });
  if(Object.keys(Nn).length) P.n=Nn; else delete P.n;
  if(document.querySelector(".wk-ed .wk-cols")){ const cv=[...document.querySelectorAll(".wk-ed .wk-cols input")].map(x=>x.value); ["c1","c2","c3"].forEach((k,i)=>{ if(cv[i]) F[k]=cv[i]; else delete F[k]; }); }
  if(document.querySelector(".wk-ed [data-mi]")){ const mi={...(P.mi||{})}; document.querySelectorAll(".wk-ed [data-mi]").forEach(el=>{ const [x,k]=el.dataset.mi.split("|"); mi[x]={...(mi[x]||{})}; if(el.value.trim()) mi[x][k]=el.value.trim(); else delete mi[x][k]; }); P.mi=mi; }
  if(document.querySelector(".wk-ed [data-pc]")||Array.isArray(P.pics)){ P.pics=wkPicsOf(id).map((x,i)=>{ const el=document.querySelector(`.wk-ed [data-pc="${i}"]`); return el?{...x,t:el.value.trim()}:x; }); }
  if(!isAdminAcct()&&vals.some(x=>x&&banBlock(x))) return;
  const len=o=>JSON.stringify([o.f||{},o.s||{}]).length, dl=len({f:F,s:T})-len(P); delete P.ov; delete P.hi; delete P.tr; if(F.birth) delete F.bday;
  Object.assign(P,{f:F,s:T,ts:Date.now(),by:myEmail()}); P.hist=[...(P.hist||[]),{ts:Date.now(),n:ME.name||myEmail(),d:dl}].slice(-20);
  all[id]=P; S.set(WK_KEY,all); wkDraftDrop(); ui.wkEd=null; ui.wkSnap=null; ui.wkStg=null; render(); toast("已儲存"); }
document.addEventListener("change",async e=>{ const t=e.target; if(t.id!=="wkLogo"&&t.id!=="wkPhoto") return; const f=t.files&&t.files[0], id=t.dataset.v; t.value=""; if(!f||!wkCanEdit(id)) return;
  try{ const isLogo=t.id==="wkLogo", pg=wkPage(id), cr=await cropImg(f,isLogo?{free:true,png:true,max:800}:{ratio:id.startsWith("m:")||(groupOf(id.slice(2))||{}).solo?3/4:4/3}); if(!cr) return;   /* 放圖都先裁切 */
    const {blob}=isLogo?{blob:cr}:await prepPhoto(cr), mid="wk_"+(t.id==="wkLogo"?"logo_":"ph_")+Date.now().toString(36); let url=await hbImgUrl(mid,blob); if(!url) url=await new Promise(r=>{ const fr=new FileReader(); fr.onload=()=>r(fr.result); fr.readAsDataURL(blob); });
    wkStg(id)[t.id==="wkLogo"?"logo":"photo"]=url; wkKeepRender(); wkDraftSave(); toast("放好了，按「儲存」才會更新到頁面"); }catch(err){ toast("這張圖片讀不出來"); } });
/* 浮動列（取代 App 導覽列）、右邊的目錄／上下按鈕、往下滑時底部的頁名膠囊 */
const wkFloat=id=>`<div class="wk-fbar"><button data-a="wkRand" aria-label="隨機文件">⤮</button><label><span>🔍</span><input id="wkQ2" placeholder="SKpedia 搜尋" autocomplete="off"></label><button data-a="wkMenu" aria-label="選單">☰</button></div>
  ${id?`<div class="wk-side"><button data-a="wkTocGo" aria-label="目錄">☰</button><span><button data-a="wkTop" aria-label="最上面">↑</button><button data-a="wkBot" aria-label="最下面">↓</button></span></div><div class="wk-pillname">${esc(wkName(id))}</div>`:""}`;
function wkIds(){ return [...GROUPS.filter(g=>g.id!=="tdm_g").map(g=>"g:"+g.id),...Object.keys(MEMBERS).filter(k=>!MEMBERS[k].official&&k!=="tdm_m"&&groupOf(MEMBERS[k].group)).map(k=>"m:"+k)]; }
addEventListener("scroll",()=>{ const p=document.querySelector(".wk-pillname"); if(p) p.classList.toggle("on",window.scrollY>320); },{passive:true});
/* 首頁：大搜尋框＋最近修改＋全部藝人 */
function wkHome(){ const q=nz(ui.wkQ||""), all=wkAll();
  const ids=[...GROUPS.filter(g=>g.id!=="tdm_g").map(g=>"g:"+g.id),...Object.keys(MEMBERS).filter(k=>!MEMBERS[k].official&&k!=="tdm_m"&&groupOf(MEMBERS[k].group)).map(k=>"m:"+k)];
  const hit=q?ids.filter(id=>nz(wkName(id)).includes(q)):[];
  const recent=Object.keys(all).filter(id=>all[id].ts&&ids.includes(id)).sort((a,b)=>all[b].ts-all[a].ts).slice(0,10);
  return `<div class="wk-home"><div class="wk-logo">SK<b>pedia</b></div>
    <label class="wk-search"><input id="wkQ" value="${esc(ui.wkQ||"")}" placeholder="輸入文字" autocomplete="off"></label>
    ${q?`<div class="wk-box"><b>搜尋結果</b>${hit.length?hit.map(id=>`<a class="wk-ln" data-a="wkGo" data-v="${id}">${esc(wkName(id))}</a>`).join(""):`<p class="wk-empty">找不到</p>`}</div>`:""}
    ${wkFanView()?"":`<div class="wk-box"><b>最近修改</b>${recent.length?recent.map(id=>`<a class="wk-ln" data-a="wkGo" data-v="${id}">${esc(wkName(id))}<small>${ago(all[id].ts)}</small></a>`).join(""):`<p class="wk-empty">還沒有人修改</p>`}</div>`}
    <div class="wk-box"><b>全部文件</b>${GROUPS.filter(g=>g.id!=="tdm_g").map(g=>`<p class="wk-gl"><a class="wk-ln" data-a="wkGo" data-v="g:${g.id}">${esc(g.name)}</a>${g.solo?"":`：${grpMembers(g.id).map(x=>`<a class="wk-ln" data-a="wkGo" data-v="m:${x}">${esc(MEMBERS[x].name)}</a>`).join("・")}`}</p>`).join("")}</div></div>`; }
/* 代表色（1～3 個，資料框編輯裡選；沒選用團代表色）：粉絲名 1 色實色、多色漸層；SOLOIST 頁第一色當底、第二色當字 */
const wkMCols=id=>{ const F=wkPage(id).f||{}, c=[F.c1,F.c2,F.c3].filter(x=>/^#[0-9a-f]{6}$/i.test(x||"")); return c.length?c:null; };
const wkCols=(gid,col)=>{ const F=wkPage("g:"+gid).f||{}, c=[F.c1,F.c2,F.c3].filter(x=>/^#[0-9a-f]{6}$/i.test(x||"")); return c.length?c:[col]; };
const wkInk=h=>{ const n=parseInt(h.slice(1),16), L=(.299*(n>>16)+.587*(n>>8&255)+.114*(n&255))/255; return L>.6?"#1D1A24":"#fff"; };
const wkDark=h=>{ const n=parseInt(h.slice(1),16), f=x=>Math.round(x*.72).toString(16).padStart(2,"0"); return "#"+f(n>>16)+f(n>>8&255)+f(n&255); };   /* 單色：比欄位色深一點（Namuwiki 的粉絲名） */
const wkPillCss=c=>{ const bg=c.length>1?c:[wkDark(c[0])]; return `background:${bg.length>1?`linear-gradient(90deg,${bg.join(",")})`:bg[0]};color:${wkInk(bg[Math.floor(bg.length/2)])}`; };
/* 團體照那一欄：從照片抓主色（像 Namuwiki 用回歸封面的顏色）；抓不到就用團代表色 */
const WKHC={};
function wkHeroCol(){ const us=new Set([...document.querySelectorAll("[data-src],[data-hsrc]")].map(el=>el.dataset.src||el.dataset.hsrc)); us.forEach(wkHc1); }   /* 每張照片各自抓主色 */
function wkHc1(u){ if(!u||WKHC[u]!==undefined) return;
  WKHC[u]=null; const im=new Image(); im.crossOrigin="anonymous"; im.onload=()=>{ try{ const c=document.createElement("canvas"); c.width=c.height=24; const x=c.getContext("2d"); x.drawImage(im,0,0,24,24); const d=x.getImageData(0,0,24,24).data; let r=0,g=0,b=0,n=0;
    for(let i=0;i<d.length;i+=4){ const R=d[i],G=d[i+1],B=d[i+2], mx=Math.max(R,G,B), mn=Math.min(R,G,B); const w=1+(mx-mn)/32; r+=R*w; g+=G*w; b+=B*w; n+=w; }   /* 鮮豔的像素比重高 */
    r/=n; g/=n; b/=n; const L=(.299*r+.587*g+.114*b)/255; WKHC[u]=[`rgb(${r|0},${g|0},${b|0})`,L>.6?"#1D1A24":"#fff"];
    document.querySelectorAll(`[data-src="${CSS.escape(u)}"]`).forEach(el=>{ el.style.setProperty("--hc",WKHC[u][0]); el.style.setProperty("--hct",WKHC[u][1]); });
    document.querySelectorAll(`[data-hsrc="${CSS.escape(u)}"]`).forEach(el=>el.style.setProperty("--hc",WKHC[u][0])); }catch(e){} }; im.src=u; }   /* 成員頁：抓到團體照顏色後換框線色 */
function viewWiki(id){ setTimeout(wkHeroCol,0); setTimeout(wkDraftApply,0); if(id&&id.startsWith("m:")){ const m=MEMBERS[id.slice(2)]; if(m&&groupOf(m.group).solo) id="g:"+m.group; } const ok=id&&wkOk(id); return `<main class="page wk">${ok?wkViewG(id):wkHome()}${wkFloat(ok?id:null)}</main>`; }
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t||!/^wk[A-Z]/.test(t.dataset.a)) return; const a=t.dataset.a, v=t.dataset.v;
  if(a==="wkGo"){ ui.wkEd=null; ui.wkH=null; ui.wkNb=null; location.hash=wkHash(v); window.scrollTo(0,0); }
  else if(a==="wkEdit"){ ui.wkEd=v; render(); ui.wkSnap=wkFormVal(); window.scrollTo(0,0); }
  else if(a==="wkCancel") wkLeave();
  else if(a==="wkSave") wkSaveS(v);
  else if(a==="wkHist"){ ui.wkH=ui.wkH===v?null:v; const y=window.scrollY; render(); window.scrollTo(0,y); }
  else if(a==="wkFold"){ ui.wkFold=ui.wkFold||{}; ui.wkFold[v]=!ui.wkFold[v]; const y=window.scrollY; render(); window.scrollTo(0,y); }
  else if(a==="wkEditS"){ ui.wkEd=v; ui.wkStg=null; render(); ui.wkSnap=wkFormVal(); window.scrollTo(0,0); }
  else if(a==="wkSaveS") wkSaveS(v);
  else if(a==="wkNb"){ ui.wkNb=ui.wkNb===v?null:v; const y=window.scrollY; render(); window.scrollTo(0,y); }
  else if(a==="wkJump"){ const [g2,k]=v.split("|"), to="g:"+g2; ui.wkNb=null; if(route().id===to){ const s=document.querySelector(`.wk-s[data-k="${k}"]`); if(s) s.scrollIntoView({behavior:"smooth",block:"start"}); } else { ui.wkJ={id:to,k}; location.hash=wkHash(to); } }
  else if(a==="wkCat"){ ui.wkCat=ui.wkCat===v?null:v; const y=window.scrollY; render(); window.scrollTo(0,y); }
  else if(a==="wkLinks"){ ui.wkLk=ui.wkLk===v?null:v; const y=window.scrollY; render(); window.scrollTo(0,y); }
  else if(a==="wkCm"){ location.hash=route().role==="artist"?"#/artist?tab=foc":"#/fan/grp?id="+encodeURIComponent(v); }
  else if(a==="wkTocT"){ ui.wkTocC=!ui.wkTocC; const y=window.scrollY; render(); window.scrollTo(0,y); }
  else if(a==="wkToK"){ const s=document.querySelector(`.wk-s[data-k="${v}"]`); if(s) s.scrollIntoView({behavior:"smooth",block:"start"}); }
  else if(a==="wkFn"){ document.querySelectorAll(".wk-fnpop").forEach(x=>x.remove()); const t=WKFN[+v-1]; if(!t) return; const r=e.target.getBoundingClientRect(), d=document.createElement("div"); d.className="wk-fnpop";
    d.innerHTML=`<p><b>[${v}]</b> ${wkTxt(t,[],"")}</p><button data-a="wkFnX">關閉</button>`; document.querySelector("main.wk").appendChild(d);   /* 跟 Namuwiki 一樣：從被點的字上方跳出 */
    const h=d.offsetHeight, gap=Math.min(110,Math.max(16,r.top-h-70)); if(r.top-h-gap>60) d.style.bottom=(innerHeight-r.top+gap)+"px"; else d.style.top=(r.bottom+16)+"px"; }
  else if(a==="wkFnX"){ document.querySelectorAll(".wk-fnpop").forEach(x=>x.remove()); }
  else if(a==="wkFnAdd") wkFnAdd(v);
  else if(a==="wkColAdd"){ const b=document.querySelector(".wk-cols"), n=b.querySelectorAll("input").length; if(n>=3) return; const sp=document.createElement("span"); sp.className="wk-col"; sp.innerHTML=`<input type="color" value="#1D1A24"><button type="button" data-a="wkColX" aria-label="拿掉">${XI}</button>`; e.target.before(sp); if(n+1>=3) e.target.remove(); }
  else if(a==="wkMiT"){ const r=e.target.closest(".wk-upi"), m=r.querySelector(".wk-mi"); m.hidden=!m.hidden; r.querySelector(".wk-mia").classList.toggle("on",!m.hidden); }
  else if(a==="wkColX"){ e.target.closest(".wk-col").remove(); }
  else if(a==="wkPicDel"){ const [id,i]=v.split("|"); { const pics=wkPicsOf(id).map((x,j)=>{ const el=document.querySelector(`.wk-ed [data-pc="${j}"]`); return el?{...x,t:el.value.trim()}:x; }); wkStg(id).pics=pics.filter((x,j)=>j!==+i);
    const y=window.scrollY, snap=ui.wkSnap; render(); ui.wkSnap=snap; window.scrollTo(0,y); } }
  else if(a==="wkShX"){ const sh=document.querySelector(".wk-sheet"); if(sh) sh.remove(); }
  else if(a==="wkShare"){ const u=location.href; (navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>toast("連結複製好了")).catch(()=>toast("複製不了")); }
  else if(a==="wkTocGo"){ const old=document.querySelector(".wk-tocpop"); if(old){ old.remove(); return; } const t=document.getElementById("wkToc"); if(!t) return;   /* 像 Namuwiki：浮出目錄，點一項就跳過去 */
    const d=document.createElement("div"); d.className="wk-tocpop"; d.innerHTML=`<b>目錄</b>${[...t.querySelectorAll("a")].map(x=>x.outerHTML).join("")}`; document.querySelector("main.wk").appendChild(d);
    const r=(e&&e.target&&e.target.closest('[data-a="wkTocGo"]')||document.querySelector('[data-a="wkTocGo"]')).getBoundingClientRect(); d.style.right=(innerWidth-r.left+8)+"px"; d.style.bottom=(innerHeight-r.top+8)+"px"; }
  else if(a==="wkTop") window.scrollTo({top:0,behavior:"smooth"});
  else if(a==="wkBot") window.scrollTo({top:document.documentElement.scrollHeight,behavior:"smooth"});
  else if(a==="wkRand"){ const L=wkIds(); if(L.length){ ui.wkEd=null; location.hash=wkHash(L[Math.floor(Math.random()*L.length)]); window.scrollTo(0,0); } }
  else if(a==="wkMenu"){ const old=document.querySelector(".wk-sheet"); if(old){ old.remove(); return; } const id=route().id, ok=id&&wkOk(id), d=document.createElement("div"); d.className="wk-sheet";
    d.innerHTML=`<div class="wk-shb"><i></i><div class="wk-shtop"><button data-a="wkRand" aria-label="隨機文件">⤮</button><label><input id="wkQ2" placeholder="SKpedia 搜尋" autocomplete="off"></label><button data-a="wkShX" aria-label="收起">⌄</button></div>
      <div class="wk-shchips"><a data-a="wkGo" data-v="">首頁・最近修改</a><a data-a="wkExit">回到 ${route().role==="artist"?"FOC":"FEST"}</a></div>
      ${ok?`<div class="wk-shcard"><b>${esc(wkName(id))}</b><div>${wkCanEdit(id)?`<a data-a="wkEditS" data-v="${id}#info">編輯</a>`:""}${wkFanView()?"":`<a data-a="wkHist" data-v="${id}">歷史</a>`}<a data-a="wkShare">複製連結</a></div></div>`:""}</div>`;
    document.querySelector("main.wk").appendChild(d); }
  else if(a==="wkExit"){ layer.innerHTML=""; location.hash=route().role==="artist"?"#/artist?tab=foc":"#/fan?tab=core"; }
  else if(a==="wkTo"){ const s=document.querySelectorAll(".wk-s")[+v]; if(s) s.scrollIntoView({behavior:"smooth",block:"start"}); } });
/* 下方搜尋：打字就跳出符合的藝人／團，點了直接去；按 Enter 去第一個，沒有就到首頁看結果 */
const wkHits=q=>{ q=nz(q||""); return q?wkIds().filter(id=>nz(wkName(id)).includes(q)||nz(((wkPage(id).f||{}).kname)||"").includes(q)).slice(0,8):[]; };
function wkSug(inp){ document.querySelectorAll(".wk-sug").forEach(x=>x.remove()); const L=wkHits(inp.value); if(!inp.value.trim()) return; const d=document.createElement("div"); d.className="wk-sug";
  d.innerHTML=L.length?L.map(id=>`<a data-a="wkGo" data-v="${id}">${esc(wkName(id))}${(wkPage(id).f||{}).kname?`<small>${esc(wkPage(id).f.kname)}</small>`:""}</a>`).join(""):`<p>找不到「${esc(inp.value)}」</p>`;
  const r=inp.getBoundingClientRect(); d.style.bottom=(innerHeight-r.top+14)+"px"; document.querySelector("main.wk").appendChild(d); }
document.addEventListener("input",e=>{ if(e.target.id==="wkQ2") wkSug(e.target); });
document.addEventListener("click",e=>{ const g=document.querySelector(".wk-sug"); if(g&&!e.target.closest("#wkQ2")) setTimeout(()=>g.remove(),0); },true);
document.addEventListener("keydown",e=>{ if(e.target.id!=="wkQ2"||e.key!=="Enter") return; e.preventDefault(); const v=e.target.value, L=wkHits(v); document.querySelectorAll(".wk-sug,.wk-sheet").forEach(x=>x.remove()); e.target.blur();
  ui.wkEd=null; if(L.length){ location.hash=wkHash(L[0]); window.scrollTo(0,0); return; } ui.wkQ=v; const h=wkHash(""); if(location.hash===h) render(); else location.hash=h; });
document.addEventListener("input",e=>{ if(e.target.id!=="wkQ") return; ui.wkQ=e.target.value; clearTimeout(ui.wkQT); ui.wkQT=setTimeout(()=>{ const p=e.target.selectionStart; render(); const i=document.getElementById("wkQ"); if(i){ i.focus(); try{ i.setSelectionRange(p,p); }catch(_){} } },250); });

/* 編輯中：取消、返回鍵、左邊緣滑回去，都是回到百科頁；有改東西沒存才問一下 */
const wkFormVal=()=>[...document.querySelectorAll(".wk-ed input,.wk-ed textarea")].map(x=>x.value).join("\u0001");
function wkLeave(){ const go=()=>{ wkDraftDrop(); ui.wkEd=null; ui.wkSnap=null; ui.wkStg=null; render(); window.scrollTo(0,0); };
  if((ui.wkSnap!=null&&wkFormVal()!==ui.wkSnap)||(ui.wkStg&&Object.keys(ui.wkStg.o).length)) ask("還沒儲存，確定要離開嗎？",go,{title:"還沒儲存",ok:"離開"}); else go(); }
document.addEventListener("click",e=>{ if(!ui.wkEd||!document.querySelector(".wk-ed")) return; const b=e.target.closest('[data-a="back"]'); if(!b||layer.contains(b)) return; e.stopPropagation(); e.preventDefault(); wkLeave(); },true);

document.addEventListener("click",e=>{ const sh=document.querySelector(".wk-sheet"); if(sh&&(!e.target.closest(".wk-shb")||e.target.closest(".wk-shchips a,.wk-shcard a,[data-a=wkRand]"))&&!e.target.closest('[data-a="wkMenu"]')) setTimeout(()=>sh.remove(),0); },true);
document.addEventListener("click",e=>{ const f=document.querySelector(".wk-fnpop"); if(f&&!e.target.closest(".wk-fnpop")&&!e.target.closest('[data-a="wkFn"]')) f.remove(); },true);
document.addEventListener("click",e=>{ const p=document.querySelector(".wk-tocpop"); if(p&&!e.target.closest('[data-a="wkTocGo"]')) setTimeout(()=>p.remove(),0); },true);

/* 編輯：＋ 註解 → 在游標位置放 [n]，下面多一格；刪掉 [n] 那格也消失，離開輸入框時號碼重排 */
document.addEventListener("focusout",e=>{ const t=e.target; if(t.matches&&t.matches(".wk-ed [data-k]")) t._s=t.selectionEnd; });
const WKNC={};   /* 暫存：整段刪掉再打回來，註解還在 */
function wkNtVals(key){ const o={...(WKNC[key]||{})}; document.querySelectorAll(`.wk-nts[data-for="${key}"] [data-nk]`).forEach(x=>o[x.dataset.i]=x.value); return o; }
function wkNtSync(el,renum){ const key=el.dataset.k, box=document.querySelector(`.wk-nts[data-for="${key}"]`); if(!box) return; let o=wkNtVals(key);
  if(renum){ const map={}, o2={}; let n=0; const nv=el.value.replace(/\[(\d+)\]/g,(m,i)=>{ n++; o2[n]=o[i]!=null?o[i]:""; return `[${n}]`; }); if(nv!==el.value){ el.value=nv; } o=o2; }
  WKNC[key]=o; const want=[...new Set([...el.value.matchAll(/\[(\d+)\]/g)].map(m=>m[1]))].sort((a,b)=>a-b).join(), have=[...box.querySelectorAll("[data-nk]")].map(x=>x.dataset.i).join();
  if(want===have&&!renum) return; if(want===have&&renum&&[...box.querySelectorAll("[data-nk]")].every(x=>x.value===(o[x.dataset.i]||""))) return;   /* 沒變就不要重畫（不然正在打的註解格會被換掉） */
  box.innerHTML=wkNtRows(key,el.value,o); }
function wkFnAdd(key){ const el=document.querySelector(`.wk-ed [data-k="${key}"]`); if(!el) return; const nums=[...el.value.matchAll(/\[(\d+)\]/g)].map(m=>+m[1]), n=(nums.length?Math.max(...nums):0)+1;
  const pos=el._s!=null?el._s:el.value.length, mark=`[${n}]`; el.value=el.value.slice(0,pos)+mark+el.value.slice(pos); const before=[...el.value.slice(0,pos).matchAll(/\[(\d+)\]/g)].length+1;
  el._s=pos+mark.length; wkNtSync(el,true); const inp=document.querySelector(`.wk-nts[data-for="${key}"] [data-i="${before}"]`); if(inp) inp.focus(); }
document.addEventListener("input",e=>{ const t=e.target; if(t.matches&&t.matches(".wk-ed [data-k]")&&document.querySelector(`.wk-nts[data-for="${t.dataset.k}"]`)) wkNtSync(t,false); });
document.addEventListener("change",e=>{ const t=e.target; if(t.matches&&t.matches(".wk-ed [data-k]")&&document.querySelector(`.wk-nts[data-for="${t.dataset.k}"]`)) wkNtSync(t,true); });

/* 成員照、宣傳照：選了就上傳（R2），說明字先暫存 */
document.addEventListener("change",async e=>{ const t=e.target; if(!t.classList||!t.classList.contains("wk-up")) return; const f=t.files&&t.files[0], id=t.dataset.v, m=t.dataset.m; t.value=""; if(!f||!wkCanEdit(id)) return;
  try{ const al=!!t.dataset.al, cr=await cropImg(f,al?{free:true,png:true,max:800}:{ratio:m||(groupOf(id.slice(2))||{}).solo?3/4:4/3}); if(!cr) return; const {blob}=al?{blob:cr}:await prepPhoto(cr); let url=await hbImgUrl("wk_p_"+Date.now().toString(36),blob); if(!url) url=await new Promise(r=>{ const fr=new FileReader(); fr.onload=()=>r(fr.result); fr.readAsDataURL(blob); });
    const st=wkStg(id), P0={...wkPage(id),...st}; if(t.dataset.al) st.alogo=url; else if(m) st.mph={...(P0.mph||{}),[m]:url}; else { const pics=wkPicsOf(id).map((x,i)=>{ const el=document.querySelector(`.wk-ed [data-pc="${i}"]`); return el?{...x,t:el.value.trim()}:x; }); st.pics=[...pics,{u:url,t:""}]; }
    wkKeepRender(); wkDraftSave(); toast("放好了，按「儲存」才會更新到頁面"); }catch(err){ toast("這張圖片讀不出來"); } });

/* 切去別的 App 抄資料，iPhone 把 HAECHU 關掉重開：回到剛剛在編輯的地方，打的字原封不動（30 分鐘內） */
setTimeout(function wkReopen(){ let o=null; try{ o=JSON.parse(localStorage.getItem("wk_open")||"null"); }catch(e){} if(!o||Date.now()-o.ts>30*60e3) return;
  if(typeof ME==="undefined"||!ME||!myEmail()){ if(!wkReopen.n||wkReopen.n<10){ wkReopen.n=(wkReopen.n||0)+1; setTimeout(wkReopen,500); } return; }
  if(location.hash!==o.h) location.hash=o.h; setTimeout(()=>{ ui.wkEd=o.ed; ui.wkStg=null; render(); ui.wkSnap=""; setTimeout(()=>window.scrollTo(0,o.y||0),80); },150); },700);


