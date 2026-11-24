/* =========================================================
   虛擬歌手的社群、SNS、TIE（11/24）
   ・社群：每團一個（像 LOVE），照日期自動出現寫好的發文；粉絲可以按讚、留言
   ・SNS：每位成員一個帳號，照日期自動發文；首頁只看得到有追蹤的人
   ・TIE：一位 100 積分、30 天。他不會主動傳；粉絲傳訊息，他才「看心情」回，
     回的是他自己想說的話（不是回答粉絲）。歡迎語每個人都不一樣，管理員可以改
   ・先只開給管理員看；管理員在社群的 Artist 分頁可以開放給大家
   ・積分不會分給任何人（不是真的藝人）
   ========================================================= */
const NL_ON="daisuki_npc_on", NL_POSTS="daisuki_npc_posts", NL_HIDE="daisuki_npc_hide", NL_LK="daisuki_npc_lk", NL_CMK="daisuki_npc_cm", NL_WEL="daisuki_npc_wel", NL_TIEK="daisuki_npc_tie", NL_JOIN="daisuki_npc_join";
const NL_PRICE=100, NL_DAYS=30;
const nlAdm=()=>{ try{ return typeof isAdminAcct==="function"&&isAdminAcct(); }catch(e){ return false; } };
const nlOn=()=>true;   /* 11/24 雲秀看過沒問題：開放給大家 */
const nlGs=()=>Object.keys(NPC_INFO).filter(G=>NL_P[G]);
const nlIds=G=>(NL_P[G]||[]).map((_,i)=>G+"."+i);
const nlAll=()=>nlGs().reduce((a,G)=>a.concat(nlIds(G)),[]);
function nlM(id){ const s=String(id||""), k=s.lastIndexOf("."); if(k<0) return null; const G=s.slice(0,k), i=+s.slice(k+1), I=NPC_INFO[G], P=(NL_P[G]||[])[i]; if(!I||!P||!I.mem[i]) return null; return {id:s,G,i,I,P,row:I.mem[i]}; }
const nlName=id=>{ const m=nlM(id); return m?npcN(m.row[0]):""; };
const nlGN=G=>npcN(G);
const nlFan=G=>String((NPC_INFO[G]||{}).fan||"").split("（")[0];
const nlCol=G=>(NPC_INFO[G]||{}).col||"#9A8FB0";
const nlSolo=G=>((NPC_INFO[G]||{}).mem||[]).length===1;
const nlBg=(G,i)=>`linear-gradient(${135+(i||0)*23}deg,${nlCol(G)},${nlCol(G)}88)`;
const nlAv=(id,cls="")=>{ const m=nlM(id); if(!m) return ""; return `<i class="npa ${cls}" style="background:${nlBg(m.G,m.i)}">${esc(String(nlName(id)).slice(0,1).toUpperCase())}</i>`; };
const nlGAv=(G,cls="")=>`<i class="npa ${cls}" style="background:${nlBg(G,0)}">${esc(String(nlGN(G)).slice(0,1))}</i>`;
const nlHref=(sub,q)=>"#/"+(((session()||{}).role)||"fan")+"/"+sub+"?"+q;
const nlPick=(L,s)=>L[(s>>>0)%L.length];
const nlNick=id=>{ const r=nlRoomOf(id); return (r&&r.nick)||ME.name||"你"; };
function nlFill(t,id,seed){ const m=nlM(id); if(!m) return String(t||""); const mates=m.I.mem.map((r,j)=>j).filter(j=>j!==m.i), xi=mates.length?mates[((seed||0)>>>3)%mates.length]:-1;
  let s=String(t).replace(/\{F\}/g,nlFan(m.G)).replace(/\{G\}/g,nlGN(m.G)).replace(/\{X\}/g,xi>=0?npcN(m.I.mem[xi][0]):"製作人哥哥").replace(/\{N\}/g,nlNick(id)).replace(/\{YR\}/g,String(new Date().getFullYear()));
  m.I.mem.forEach(r=>{ const nn=npcN(r[0]); if(nn!==r[0]) s=s.split(r[0]).join(nn); }); return s; }
/* ---------- 日期 ---------- */
const nlDayN=ts=>{ const d=new Date(ts); return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5); };
const nlDayTs=(dn,h,mi)=>{ const u=new Date(dn*864e5); return new Date(u.getUTCFullYear(),u.getUTCMonth(),u.getUTCDate(),h,mi).getTime(); };
const nlMD=dn=>{ const u=new Date(dn*864e5); return String(u.getUTCMonth()+1).padStart(2,"0")+"-"+String(u.getUTCDate()).padStart(2,"0"); };
const nlBd=row=>String(row[2]||"").slice(5).replace(".","-");
/* ---------- 自動發文：kind = cm（社群）／sn（SNS） ---------- */
const NL_C={};
function nlGen(kind){ const now=Date.now(), b=Math.floor(now/3e5); if(NL_C[kind]&&NL_C[kind].b===b) return NL_C[kind].L;
  const today=nlDayN(now), L=[], hide=S.get(NL_HIDE,{})||{};
  nlGs().forEach(G=>{ const I=NPC_INFO[G], solo=I.mem.length===1, dmd=I.debut.slice(5), dy=+I.debut.slice(0,4);
    nlIds(G).forEach(id=>{ const m=nlM(id), a=m.P.a, tk=nlTk(id)||{L:"ko",c:[],n:[]}, fr=tk.L!=="ko", strip=x=>String(x).replace(/^[mn]>/,"").split("|").join(" "), Z=(A,B)=>A.map((o,j)=>({o,z:B[j]||o})),
        pk=(NL_PK[G]||[])[m.i]||[], own=kind==="cm"?Z(pk,m.P.p):tk.c.map(([o,z])=>({o:strip(o),z:strip(z)})), pool=own.concat(kind==="cm"?Z(NL_POST_KO[a],NL_POST[a]):Z(NL_CAP_KO[a],NL_CAP[a])), nat=tk.n.map(([o,z])=>({o:strip(o),z:strip(z)})), off=strHash(id+kind);
      for(let dn=today-20; dn<=today; dn++){ const md=nlMD(dn), sd=strHash(kind+id+dn), yr=new Date(dn*864e5).getUTCFullYear(); let t=null, h=10+sd%13, mi=(sd>>>5)%60, thx=false, lg="ko";
        const pr2=(A,B,s0)=>{ const j=(s0>>>0)%A.length; return {o:A[j],z:B[j]}; };
        if(md===nlBd(m.row)){ t=pr2(NL_BDAY_ME_KO,NL_BDAY_ME,sd); thx=true; h=kind==="cm"?0:21; mi=(sd>>>5)%20; }
        else { I.mem.forEach((r,j)=>{ if(!t&&j!==m.i&&nlBd(r)===md&&sd%10<7){ const x=pr2(NL_BDAY_MATE_KO,NL_BDAY_MATE,sd); t={o:x.o.replace(/\{B\}/g,npcN(r[0])),z:x.z.replace(/\{B\}/g,npcN(r[0]))}; } }); if(t) h=(sd%3); }
        if(!t&&md===dmd&&yr>dy&&(kind==="cm"||a==="lead"||solo||sd%10<4)){ const x=pr2(NL_ANNIV_KO,NL_ANNIV,sd); t={o:x.o.replace(/\{Y\}/g,yr-dy),z:x.z.replace(/\{Y\}/g,yr-dy)}; thx=true; h=kind==="cm"?0:12; }
        if(!t&&NL_DAY[md]&&(a==="lead"||solo||sd%10<3)){ t=pr2(NL_DAY_KO[md],NL_DAY[md],sd); thx=true; }
        if(!t){ const pr=kind==="cm"?(solo?.4:.2):(solo?.42:.26); if((sd%1000)/1000<pr){ if(fr&&nat.length&&(sd>>>9)%100<18){ t=nat[(dn+off)%nat.length]; lg=tk.L; } else t=pool[(dn*7+off)%pool.length]; } }
        if(!t) continue; const ts=nlDayTs(dn,h,mi), pid=`n${kind}_${id}_${dn}`; if(ts>now||hide[pid]) continue;
        let o=t.o, z=t.z; if(thx&&fr&&NL_THX[tk.L]){ const x=NL_THX[tk.L][(sd>>>4)%NL_THX[tk.L].length]; o+=(kind==="cm"?"\n\n":" ")+x[0]; if(x[1]!==x[0]||tk.L!=="zh") z+=(kind==="cm"?"\n\n":" ")+x[1]; }
        L.push({id:pid,mid:id,G,t:nlFill(o,id,sd),z:nlFill(z,id,sd),lg,ts,base:(kind==="cm"?600:1800)+strHash(pid)%(kind==="cm"?6000:24000)}); } }); });
  const cu=S.get(NL_POSTS,{})||{}; Object.keys(cu).forEach(k=>{ const x=cu[k]; if(!x||!nlM(x.mid)||hide[k]) return; if(x.k!=="both"&&x.k!==kind) return; if(x.ts>now) return; L.push({id:k,mid:x.mid,G:nlM(x.mid).G,t:nlFill(x.t,x.mid,0),z:"",ts:x.ts,base:(kind==="cm"?400:1200)+strHash(k)%3000,own:1}); });
  L.sort((a,b)=>b.ts-a.ts); NL_C[kind]={b,L}; return L; }
const nlPost=id=>nlGen("cm").find(p=>p.id===id)||null;
/* ---------- 社群（LOVE） ---------- */
const nlJoined=()=>{ const L=S.get(acK(NL_JOIN),[]); return Array.isArray(L)?L.filter(G=>NPC_INFO[G]):[]; };
const nlLikes=()=>S.get(NL_LK,{})||{};
const nlCms=()=>S.get(NL_CMK,{})||{};
const nlLiked=pid=>(nlLikes()[pid]||[]).includes(myEmail()||"me");
const nlLikeN=p=>p.base+(nlLikes()[p.id]||[]).length;
const nlFans=G=>8000+strHash("fans"+G)%90000+(G&&nlJoined().includes(G)?1:0);
function nlCard(p){ const m=nlM(p.mid); if(!m) return ""; const lk=nlLiked(p.id), cn=(nlCms()[p.id]||[]).length, long=p.t.length>90&&!(ui.nlEx&&ui.nlEx[p.id]), hasTr=!!p.z&&p.z!==p.t, orig=hasTr&&ui.nlOrig&&ui.nlOrig[p.id], txt=hasTr&&!orig?p.z:p.t;
  return `<article class="card post nlp" id="nlp-${p.id}"><div class="post-head"><button class="av av-go nl-avb" data-a="nlGo" data-v="${esc(m.G)}" aria-label="${esc(nlGN(m.G))} 的社群">${nlAv(p.mid)}</button>
    <div class="who"><b>${esc(nlName(p.mid))} ${I.verified}</b><span>${ymdhm(p.ts)}${nlSolo(m.G)?"":`・${esc(nlGN(m.G))}`}</span></div>${nlAdm()?`<button class="uni-more" data-a="nlPMore" data-v="${p.id}" aria-label="管理這則">⋯</button>`:""}</div>
    <div class="post-body"><p class="post-text ${long?"clamp":""}">${esc(txt)}</p>${hasTr?`<button class="pt-orig" data-a="nlOrig" data-v="${p.id}">${orig?"查看翻譯":`查看原文 (${NL_LANGN[p.lg]||"韓國語"})`}</button>`:""}${long?`<button class="more" data-a="nlEx" data-v="${p.id}">展開全文</button>`:""}</div>
    <div class="post-foot"><button class="act ${lk?"liked":""}" data-a="nlLike" data-v="${p.id}" aria-pressed="${lk}" aria-label="按讚">${I.heart}<span>${fmt(nlLikeN(p))}</span></button><button class="act" data-a="nlCm" data-v="${p.id}" aria-label="留言">${I.chat}<span>${fmt(cn)}</span></button></div></article>`; }
/* LOVE 首頁「藝人動態」：有加入的虛擬歌手社群也一起出現 */
function npcFeedItems(){ try{ if(!nlOn()) return []; const J=nlJoined(); if(!J.length) return []; const lim=Date.now()-14*864e5; return nlGen("cm").filter(p=>J.includes(p.G)&&p.ts>=lim).map(p=>({ts:p.ts,h:()=>nlCard(p)})); }catch(e){ return []; } }
/* LOVE 探索：跟其他社群排在一起（不特別標出來） */
function npcExRows(cat){ try{ if(!nlOn()) return []; const J=nlJoined(), now=Date.now();
  return nlGs().filter(G=>{ const I=NPC_INFO[G], solo=I.mem.length===1, nw=now-new Date(I.debut).getTime()<120*864e5; return !cat||cat==="all"||(cat==="solo"?solo:cat==="group"?!solo:nw); }).map(G=>{ const I=NPC_INFO[G], ms=I.mem.map(r=>npcN(r[0])), on=J.includes(G);
    return `<div class="ex-g" data-q="${esc(nz(nlGN(G)+" "+ms.join(" ")))}"><button class="ex-gi" data-a="nlGo" data-v="${esc(G)}">${nlGAv(G,"ex")}<span><b>${esc(nlGN(G))}</b><small>${esc(ms.slice(0,5).join("・"))}${ms.length>5?` +${ms.length-5}`:""}</small></span></button>${on?`<button class="ex-btn on" data-a="nlGo" data-v="${esc(G)}">前往</button>`:`<button class="ex-btn" data-a="nlJoin" data-v="${esc(G)}">加入</button>`}</div>`; }); }catch(e){ return []; } }
function nlView(G,tab){ const NI=NPC_INFO[G]; if(!NI) return ""; const on=nlJoined().includes(G), adm=nlAdm(); setTimeout(cmTopSync,0);
  const tabs=[["feed","Feed"],["about","Artist"]], P=nlGen("cm").filter(p=>p.G===G).slice(0,60);
  const body=tab==="about"?nlAbout(G):`${adm?`<button class="nl-adm" data-a="nlWrite" data-v="${esc(G)}">＋ 用 ${esc(nlGN(G))} 的帳號發文（管理員）</button>`:""}${P.length?P.map(nlCard).join(""):emptyBox(I.star||"",`還沒有動態`,"過幾天再來看看吧")}`;
  return `<div class="gcm cmx nlc" style="--gt:${nlCol(G)}"><header class="cmx-top" id="cmTop"><button class="cmx-ib" data-a="back" aria-label="返回">${I.back}</button><b class="cmx-tt">${esc(nlGN(G))}</b><span class="cmx-r"></span></header>
    <section class="cmx-hero nl-hero" style="background:${nlBg(G,1)}"><span class="cmx-hbg nl-hbg"><i>${esc(String(nlGN(G)).slice(0,1))}</i></span><span class="cmx-shade"></span>
      <div class="cmx-hi"><small>${fmtW(nlFans(G))} 位成員${on?"・✓ 已加入":""}</small><b>${esc(nlGN(G))}</b>${on?`<button class="cmx-ms" data-a="nlTab" data-v="about" data-g="${esc(G)}">${esc(WHISPER_NAME)}</button>`:`<button class="cmx-ms" data-a="nlJoin" data-v="${esc(G)}">＋ 加入社群</button>`}</div></section>
    <nav class="cm-tabs cmx-tabs">${tabs.map(([k,l])=>`<button class="${tab===k?"on":""}" data-a="nlTab" data-v="${k}" data-g="${esc(G)}">${l}</button>`).join("")}</nav><main class="page cm-body">${body}</main></div>`; }
function nlAbout(G){ const I=NPC_INFO[G], adm=nlAdm(), shared=!!S.get(NL_ON,0);
  return `
    <section class="card nl-mems">${nlIds(G).map(id=>{ const m=nlM(id), r=nlRoomOf(id), act=nlActive(id);
      return `<div class="nl-mr">${nlAv(id,"md")}<span class="nl-mi"><b>${esc(nlName(id))}</b><small>${esc(m.row[3])}・${esc(m.row[2])}</small></span>
        ${act?`<button class="nl-tb on" data-a="nlRoom" data-v="${id}">${esc(WHISPER_NAME)} 聊天</button>`:`<button class="nl-tb" data-a="nlBuy" data-v="${id}">${esc(WHISPER_NAME)}<small>${NL_PRICE} 積分</small></button>`}
        ${adm?`<button class="nl-wb" data-a="nlWel" data-v="${id}">歡迎語</button>`:""}</div>`; }).join("")}</section>
    <p class="nl-note">${esc(WHISPER_NAME)} 券一位 ${NL_PRICE} 積分，可以用 ${NL_DAYS} 天。你傳訊息之後，他有空、有心情的時候才會回你，內容是他當下想跟你分享的事。</p>
    <section class="card cm-card"><button class="cm-go" data-a="wkGo" data-v="n:${esc(G)}">在 SKpedia 看 ${esc(nlGN(G))} <span>→</span></button></section>`; }
/* 留言 */
function nlCmOpen(pid){ const p=nlPost(pid); if(!p) return; const L=nlCms()[pid]||[];
  setLayer(`<div class="nl-sw" data-a="nlClose"><div class="nl-sh" data-a="nlNo" role="dialog" aria-label="留言"><i class="nl-gr"></i><b class="nl-st">留言</b>
    <div class="nl-cl">${L.length?L.map(c=>`<div class="nl-cr"><b>${esc(c.n||"粉絲")}</b><p>${esc(c.t)}</p><small>${ago(c.ts)}</small></div>`).join(""):`<p class="nl-c0">還沒有留言，第一個留言給 ${esc(nlName(p.mid))} 吧</p>`}</div>
    <form class="nl-cf" id="nlCmF" data-v="${pid}"><textarea rows="1" class="ag" id="nlCmIn" maxlength="200" placeholder="留言給 ${esc(nlName(p.mid))}"></textarea><button type="submit">送出</button></form></div></div>`,"nlcm"); }
/* ---------- TIE ---------- */
const nlRooms=()=>{ const o=S.get(acK(NL_TIEK),{}); return o&&typeof o==="object"?o:{}; };
const nlRoomOf=id=>nlRooms()[id]||null;
const nlActive=id=>{ const r=nlRoomOf(id); return !!(r&&r.until>Date.now()); };
const nlSaveRoom=(id,fn)=>{ const o=nlRooms(); o[id]=fn(o[id]||{msgs:[],used:[]}); S.set(acK(NL_TIEK),o); };
/* 歡迎語：{o 原文, z 中文}；管理員改過的優先 */
const nlTk=id=>{ const m=nlM(id); return m&&(NL_TK[m.G]||[])[m.i]||null; };
const nlWelcome=id=>{ const w=(S.get(NL_WEL,{})||{})[id]; if(w&&typeof w==="object"&&w.o) return {o:w.o,z:w.z||w.o}; if(typeof w==="string"&&w) return {o:w,z:w}; const t=nlTk(id); return t?{o:t.w[0],z:t.w[1]}:{o:"",z:""}; };
const nlShown=r=>(r&&r.msgs||[]).filter(x=>x.ts<=Date.now());
const nlUnread=id=>{ const r=nlRoomOf(id); return r?nlShown(r).filter(x=>x.f==="a"&&x.ts>(r.read||0)).length:0; };
function nlRoomList(){ if(!nlOn()) return []; const o=nlRooms(); return Object.keys(o).filter(id=>nlM(id)).map(id=>{ const r=o[id], sh=nlShown(r); return {id,r,last:sh[sh.length-1]||null,active:r.until>Date.now(),un:nlUnread(id)}; }).sort((a,b)=>((b.last||{}).ts||0)-((a.last||{}).ts||0)); }
/* TIE 列表裡的虛擬歌手聊天室 */
function npcTieRows(q){ try{ let L=nlRoomList(); if(q) L=L.filter(x=>hit(q,nlName(x.id),nlGN(nlM(x.id).G),x.last&&x.last.t)); if(!L.length) return "";
  return `${(typeof fanRooms==="function"&&fanRooms().length)?"":`<span class="t-sec">最近的聊天室</span>`}${L.map(x=>`<button class="t-room ${x.active?"":"off"}" data-a="nlRoom" data-v="${x.id}">${nlAv(x.id,"lg")}<div class="t-room-b"><div class="t-room-top"><span class="t-room-n"><b>${esc(nlName(x.id))}</b>${x.active?"":`<span class="t-exp">已到期</span>`}</span><span class="t-room-t">${x.last?ago(x.last.ts):""}</span></div><p>${x.last?(x.last.f==="me"?"你：":"")+esc(nlFill(x.last.t,x.id,0)):"還沒有新訊息"}</p></div>${x.un?`<span class="t-cnt">${x.un}</span>`:""}</button>`).join("")}`; }catch(e){ return ""; } }
const npcTieCount=()=>{ try{ return nlRoomList().length; }catch(e){ return 0; } };
function nlBuy(id){ const m=nlM(id); if(!m) return; const act=nlActive(id);
  ask(`${act?"延長":"購買"} ${nlName(id)} 的 ${WHISPER_NAME} 券？\n${NL_PRICE} 積分，可以用 ${NL_DAYS} 天。`,()=>{ if(points()<NL_PRICE){ toast("積分不足，先補充積分吧"); return; }
    S.set(K.points,points()-NL_PRICE); try{ recordSale("npctie",{pts:NL_PRICE,label:`${WHISPER_NAME} 券・${nlName(id)}（${NL_DAYS} 天）`}); }catch(e){}
    const now=Date.now(); nlSaveRoom(id,r=>{ const first=!r.since; r.since=r.since||now; r.until=Math.max(r.until||0,now)+NL_DAYS*864e5; r.msgs=r.msgs||[];
      if(first){ const W=nlWelcome(id), O=W.o.split("|"), Z=W.z.split("|"); O.forEach((t,k)=>{ if(t.trim()) r.msgs.push({id:"w"+now+k,f:"a",t:t,z:Z[k]||"",ts:now+800+k*1500,wel:1}); }); } return r; });
    toast(act?"已延長 "+NL_DAYS+" 天":"購買完成"); ui.scrollChat=true; navTo(nlHref("npctie","id="+encodeURIComponent(id))); },{title:WHISPER_NAME,ok:`用 ${NL_PRICE} 積分購買`,danger:false}); }
/* 粉絲傳了訊息：他看心情決定要不要回、什麼時候回、回幾則；回的是他自己想說的（不看粉絲說了什麼） */
function nlReplyPlan(id,r){ const now=Date.now(); if((r.msgs||[]).some(x=>x.f==="a"&&x.ts>now)) return;   /* 已經決定要回了：多傳幾則也不會多回 */
  const m=nlM(id), sd=strHash(id+now), mood=(sd%100)/100; if(mood>.62) return;   /* 有時候就是不回 */
  const delay=(2+Math.floor(Math.pow(((sd>>>7)%1000)/1000,2)*150))*6e4, at=now+delay, hr=new Date(at).getHours(), tm=hr>=5&&hr<11?"m":hr>=21||hr<4?"n":"";
  const tk=nlTk(id), foreign=tk&&tk.L!=="ko", strip=x=>String(x).replace(/^[mn]>/,""), tmOk=x=>{ const k=/^([mn])>/.exec(x); return !k||k[1]===tm; };
  const own=(tk?tk.c:[]).map(([o,z])=>({o,z})).concat(NL_CHAT_KO[m.P.a].map((o,j)=>({o,z:NL_CHAT[m.P.a][j]}))), nat=(tk?tk.n:[]).map(([o,z])=>({o,z}));
  const used=r.used||[], fresh=L=>L.filter(x=>tmOk(x.o)&&!used.includes(x.o)), n=1+((sd>>>11)%10<6?0:(sd>>>11)%10<9?1:2);
  let t=at; for(let k=0;k<n;k++){ const s2=sd>>>(k*3+2), useNat=nat.length&&(s2%100)<(foreign?22:8), P0=useNat&&fresh(nat).length?fresh(nat):fresh(own), P1=P0.length?P0:own.filter(x=>tmOk(x.o)), P=P1.length?P1:own, x=P[s2%P.length];
    used.push(x.o); const O=strip(x.o).split("|"), Z=strip(x.z).split("|"); O.forEach((s,j)=>{ r.msgs.push({id:"a"+t+"_"+k+"_"+j,f:"a",t:nlFill(s,id,sd+k),z:nlFill(Z[j]||"",id,sd+k),ts:t}); t+=4000+((sd>>>k)%40)*1000; }); }
  r.used=used.slice(-40); }
function nlSend(id,text){ const t=String(text||"").trim(); if(!t||!nlActive(id)) return; nlSaveRoom(id,r=>{ r.msgs.push({id:"m"+Date.now(),f:"me",t,ts:Date.now()}); nlReplyPlan(id,r); r.msgs=r.msgs.slice(-400); return r; }); ui.nlDraft=""; ui.scrollChat=true; render(); }
function nlRoom(id){ const m=nlM(id), r=nlRoomOf(id); if(!m) return ""; const act=nlActive(id), sh=r?nlShown(r):[], days=r&&r.since?Math.max(1,Math.floor((Date.now()-r.since)/864e5)+1):1;
  if(r){ if(sh.some(x=>x.f==="a"&&x.ts>(r.read||0))) nlSaveRoom(id,x=>{ x.read=Date.now(); return x; }); const nx=(r.msgs||[]).filter(x=>x.ts>Date.now()).map(x=>x.ts).sort((a,b)=>a-b)[0]; clearTimeout(ui.nlT); if(nx&&nx-Date.now()<20*6e4) ui.nlT=setTimeout(()=>{ if(location.hash.includes("npctie")) render(); },nx-Date.now()+300); }
  let last=""; const body=sh.map(w=>{ const d=dayLabel(w.ts); let sep=""; if(d!==last){ sep=`<div class="t-day"><span>${d}</span></div>`; last=d; }
    if(w.f==="me") return sep+`<div class="t-me"><div class="t-meta"><span>${timeHM(w.ts)}</span></div><div class="t-b me">${esc(w.t)}</div></div>`;
    return sep+`<div class="t-art">${nlAv(id,"ring")}<div class="t-art-c"><div class="t-art-n"><b>${esc(nlName(id))}</b></div><div class="t-bw">${(()=>{ const o=nlFill(w.t,id,0), z=w.z?nlFill(w.z,id,0):"", can=!!z&&z!==o, on=can&&ui.nlTr&&ui.nlTr[w.id]; return `<div class="t-b">${esc(o)}${on?`<div class="t-tr">${esc(z)}</div>`:""}</div><span class="t-side">${can&&!on?`<button class="t-abtn" data-a="nlTr" data-v="${esc(w.id)}" aria-label="翻譯">A</button>`:""}<span class="t-tm">${timeHM(w.ts)}</span></span>`; })()}</div></div></div>`; }).join("");
  const dr=ui.nlDraft||"";
  return `<div class="t-bgl t-default"></div><header class="t-rh sh-head"><div class="t-rh-row"><button class="t-ib" data-a="back" aria-label="返回">${TI.back}</button><h3>${esc(nlName(id))}</h3><div class="t-rh-r"></div></div>
      ${act?`<div class="t-sub"><span class="t-sub-n">𝑇𝐼𝐸</span>${tieHeart()}<span>+${days}</span></div>`:`<button class="t-sub t-again" data-a="nlBuy" data-v="${id}">💜 我們是不是可以再見呢？</button>`}</header>
    <main class="t-msgs nl-msgs">${body||`<p class="t-none">還沒有訊息</p>`}<div id="chat-end"></div></main>
    ${act?`<form class="t-foot" id="nlForm" data-v="${id}"><div class="t-inp"><textarea rows="1" class="ag" id="nlIn" maxlength="300" autocomplete="off" aria-label="輸入訊息">${esc(dr)}</textarea></div><button class="t-send ${dr.trim()?"on":""}" type="submit" aria-label="送出">${TI.send}</button></form>`
      :`<div class="t-foot t-expired-in" data-a="nlBuy" data-v="${id}"><div class="t-inp off"></div><span class="t-send">${TI.send}</span></div>`}`; }
/* 有新回覆時提醒（不在聊天室裡才提醒） */
setInterval(()=>{ try{ if(!session()||!nlOn()) return; const o=nlRooms(), now=Date.now(), seen=ui.nlSeen||(ui.nlSeen=now); let who=null;
  Object.keys(o).forEach(id=>{ (o[id].msgs||[]).forEach(x=>{ if(x.f==="a"&&!x.wel&&x.ts>seen&&x.ts<=now) who=id; }); }); ui.nlSeen=now;
  if(who&&!location.hash.includes("npctie?id="+encodeURIComponent(who))&&!location.hash.includes("npctie?id="+who)){ toast(`${nlName(who)} 傳了 ${WHISPER_NAME} 訊息`); if(/tab=whisper/.test(location.hash)&&!layer.innerHTML) render(); } }catch(e){} },45000);
/* ---------- SNS ---------- */
const nlSnId=id=>"n:"+id;
const nlSnHandle=id=>{ const m=nlM(id); if(!m) return ""; const a=String(npcN(m.row[0])).toLowerCase().replace(/[^a-z0-9]+/g,""), g=String(nlGN(m.G)).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,""); return nlSolo(m.G)?(g||a)+".official":(a||"artist")+"."+g; };
function npcSnUser(uid){ const id=String(uid).slice(2), m=nlM(id); if(!m||!nlOn()) return null; return {id:uid,u:nlSnHandle(id),name:nlName(id),g:strHash(m.G)%6,ver:true,bio:`${nlSolo(m.G)?"":nlGN(m.G)+" "}${m.row[3].split("、")[0]} 🎤`,av:nlAvUrl(id),npc:1}; }
/* SNS 頭像：團的代表色＋名字第一個字（做成小圖） */
const NL_AVU={};
function nlAvUrl(id){ if(NL_AVU[id]) return NL_AVU[id]; const m=nlM(id), c=nlCol(m.G), ch=String(nlName(id)).slice(0,1).toUpperCase().replace(/[<&>"']/g,"");
  return NL_AVU[id]="data:image/svg+xml,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><rect width="100" height="100" fill="#fff"/><rect width="100" height="100" fill="url(#g)"/><text x="50" y="50" dy=".35em" text-anchor="middle" font-family="-apple-system,Helvetica,Arial,sans-serif" font-weight="800" font-size="42" fill="#fff">${ch}</text></svg>`); }
const npcSnUsers=()=>nlOn()?nlAll().map(nlSnId):[];
const nlSnFol=uid=>12000+strHash("snf"+uid)%400000;
const nlPh=(p,k)=>{ const s=strHash(p.id+k), c=nlCol(p.G), x=s%100, y=(s>>>7)%100, x2=(s>>>14)%100; return `<div class="nl-ph" style="background:radial-gradient(circle at ${x}% ${y}%,#fff8 0,#fff0 34%),radial-gradient(circle at ${x2}% ${100-y}%,${c}cc 0,${c}00 55%),linear-gradient(${s%360}deg,${c},#2a2430)"></div>`; };
function npcSnPosts(){ try{ if(!nlOn()) return []; return nlGen("sn").map(p=>({id:p.id,uid:nlSnId(p.mid),cap:p.t,capZ:p.z,ts:p.ts,base:p.base,npc:1,media:Array.from({length:1+strHash(p.id)%3},(_,k)=>({type:"html",h:nlPh(p,k)}))})); }catch(e){ return []; } }
/* ---------- 管理員：發文、隱藏、歡迎語 ---------- */
function nlWrite(G){ const ids=nlIds(G); ui.nlW={G,mid:ids[0],k:"both"}; nlWriteDraw(); }
function nlWriteDraw(){ const w=ui.nlW; if(!w) return; const old=(document.getElementById("nlWT")||{}).value||w.t||"";
  setLayer(`<div class="aw-mod-bg nl-mod" data-a="nlClose"><div class="aw-mod" data-a="nlNo"><h3>用虛擬歌手的帳號發文</h3>
    <div class="nl-chips">${nlIds(w.G).map(id=>`<button class="${w.mid===id?"on":""}" data-a="nlWMem" data-v="${id}">${esc(nlName(id))}</button>`).join("")}</div>
    <div class="nl-chips">${[["both","社群＋SNS"],["cm","只發社群"],["sn","只發 SNS"]].map(([k,l])=>`<button class="${w.k===k?"on":""}" data-a="nlWK" data-v="${k}">${l}</button>`).join("")}</div>
    <textarea id="nlWT" maxlength="500" placeholder="要說的話（{F} 會換成粉絲名）">${esc(old)}</textarea>
    <div class="aw-mod-b"><button class="btn btn-soft" data-a="nlClose">取消</button><button class="btn btn-main" data-a="nlWOk">發文</button></div></div></div>`,"nlw"); }
function nlWelEdit(id){ ui.nlWelId=id; setLayer(`<div class="aw-mod-bg nl-mod" data-a="nlClose"><div class="aw-mod" data-a="nlNo"><h3>${esc(nlName(id))} 的 ${esc(WHISPER_NAME)} 歡迎語</h3><p class="nl-tip">第一次買券的粉絲會收到。用「|」隔開就是分成好幾則傳（原文和中文的「|」要一樣多）；{N} 會換成粉絲的名字。</p>
    <b class="nl-lb">原文（他傳的語言）</b><textarea id="nlWelT" maxlength="600">${esc(nlWelcome(id).o)}</textarea><b class="nl-lb">中文（按 A 看到的翻譯）</b><textarea id="nlWelZ" maxlength="600">${esc(nlWelcome(id).z)}</textarea><div class="aw-mod-b"><button class="btn btn-soft" data-a="nlClose">取消</button><button class="btn btn-main" data-a="nlWelOk">儲存</button></div></div></div>`,"nlwel"); }
/* ---------- 點擊 ---------- */
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a^="nl"]'); if(!t) return; const a=t.dataset.a, v=t.dataset.v;
  if(!/^nl(Go|Tab|Join|Like|Cm|Ex|PMore|Room|Buy|Close|No|Write|WMem|WK|WOk|Wel|WelOk|Share|Tr|Orig|CapTr)$/.test(a)) return; e.stopImmediatePropagation(); if(a!=="nlNo") e.preventDefault();
  if(a==="nlNo"){ return; }
  if(a==="nlClose"){ layer.innerHTML=""; return; }
  if(a==="nlGo"){ layer.innerHTML=""; navTo(nlHref("npc","id="+encodeURIComponent(v))); scrollTo(0,0); return; }
  if(a==="nlTab"){ const G=t.dataset.g; location.replace(nlHref("npc","id="+encodeURIComponent(G)+(v==="about"?"&p=about":""))); return; }
  if(a==="nlJoin"){ const J=nlJoined(); if(!J.includes(v)){ J.push(v); S.set(acK(NL_JOIN),J); toast(`已加入 ${nlGN(v)} 的社群`); } render(); return; }
  if(a==="nlEx"){ ui.nlEx=ui.nlEx||{}; ui.nlEx[v]=1; render(); return; }
  if(a==="nlLike"){ const me=myEmail()||"me", on=nlLiked(v); mkEdit(NL_LK,o=>{ o=o||{}; const L=(o[v]||[]).filter(x=>x!==me); if(!on) L.push(me); o[v]=L; return {v:o}; }).then(()=>render()).catch(()=>toast("沒有按到，再試一次")); return; }
  if(a==="nlCm"){ nlCmOpen(v); return; }
  if(a==="nlOrig"){ ui.nlOrig=ui.nlOrig||{}; ui.nlOrig[v]=!ui.nlOrig[v]; render(); return; }
  if(a==="nlCapTr"){ ui.nlCapTr=ui.nlCapTr||{}; ui.nlCapTr[v]=!ui.nlCapTr[v]; render(); return; }
  if(a==="nlTr"){ ui.nlTr=ui.nlTr||{}; ui.nlTr[v]=1; render(); return; }
  if(a==="nlPMore"){ if(!nlAdm()) return; ask("把這則從大家的畫面上拿掉？",()=>{ mkEdit(NL_HIDE,o=>({v:{...(o||{}),[v]:1}})).then(()=>{ NL_C.cm=NL_C.sn=null; render(); toast("拿掉了"); }); }); return; }
  if(a==="nlRoom"){ layer.innerHTML=""; ui.scrollChat=true; navTo(nlHref("npctie","id="+encodeURIComponent(v))); return; }
  if(a==="nlBuy"){ nlBuy(v); return; }
  if(a==="nlWrite"){ if(nlAdm()) nlWrite(v); return; }
  if(a==="nlWMem"){ ui.nlW.t=(document.getElementById("nlWT")||{}).value||""; ui.nlW.mid=v; nlWriteDraw(); return; }
  if(a==="nlWK"){ ui.nlW.t=(document.getElementById("nlWT")||{}).value||""; ui.nlW.k=v; nlWriteDraw(); return; }
  if(a==="nlWOk"){ const w=ui.nlW, tx=((document.getElementById("nlWT")||{}).value||"").trim(); if(!w||!tx){ toast("先寫要說的話"); return; } const k="nown_"+Date.now();
    mkEdit(NL_POSTS,o=>({v:{...(o||{}),[k]:{mid:w.mid,k:w.k,t:tx,ts:Date.now()}}})).then(()=>{ ui.nlW=null; layer.innerHTML=""; NL_C.cm=NL_C.sn=null; render(); toast("發好了"); }).catch(()=>toast("沒有發出去，再試一次")); return; }
  if(a==="nlWel"){ if(nlAdm()) nlWelEdit(v); return; }
  if(a==="nlWelOk"){ const id=ui.nlWelId, tx=((document.getElementById("nlWelT")||{}).value||"").trim(), zx=((document.getElementById("nlWelZ")||{}).value||"").trim()||tx; if(!id||!tx){ toast("歡迎語不能是空的"); return; }
    mkEdit(NL_WEL,o=>({v:{...(o||{}),[id]:{o:tx,z:zx}}})).then(()=>{ layer.innerHTML=""; toast("存好了"); }).catch(()=>toast("沒有存到，再試一次")); return; }
  if(a==="nlShare"){ if(!nlAdm()) return; const on=!!S.get(NL_ON,0); ask(on?"改回只有你看得到？":"開放給大家？大家會在 LOVE 探索、SNS、TIE 看到虛擬歌手。",()=>{ mkEdit(NL_ON,()=>({v:on?0:1})).then(()=>{ render(); toast(on?"改回只有你看得到":"已開放給大家"); }); },{danger:false}); return; }
},true);
document.addEventListener("submit",e=>{ const f=e.target;
  if(f.id==="nlForm"){ e.preventDefault(); const i=document.getElementById("nlIn"); nlSend(f.dataset.v,i&&i.value); return; }
  if(f.id==="nlCmF"){ e.preventDefault(); const pid=f.dataset.v, i=document.getElementById("nlCmIn"), tx=(i&&i.value||"").trim(); if(!tx) return;
    const c={e:myEmail()||"me",n:ME.name||"粉絲",t:tx,ts:Date.now()}; mkEdit(NL_CMK,o=>{ o=o||{}; o[pid]=(o[pid]||[]).concat([c]).slice(-300); return {v:o}; }).then(()=>{ nlCmOpen(pid); render(); }).catch(()=>toast("沒有送出，再試一次")); }
},true);
document.addEventListener("input",e=>{ if(e.target&&e.target.id==="nlIn"){ ui.nlDraft=e.target.value; const b=document.querySelector("#nlForm .t-send"); if(b) b.classList.toggle("on",!!e.target.value.trim()); } });
