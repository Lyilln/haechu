/* =========================================================
   虛擬歌手＝當成真的藝人（11/24）
   ・每組都放進 GROUPS／MEMBERS（id：npc_團名、npc_團名_幾號），App 裡所有東西都照真的藝人走：
     社群、Feed、SHOP（Membership、周邊、TIE 團體券）、TIE 聊天室、SKpedia 團體頁＋成員頁、SNS、公司頁
   ・不在名單（roster）裡、不會存進雲端；後台的藝人管理、分潤、出道申請、簽售不會出現
   ・寫好的內容只在讀取時加進去（S.get），寫回去時濾掉（S.set）→ 不佔雲端空間
   ・TIE：價錢 30 天 100 積分（7 天 30、365 天 1000）；粉絲傳訊息，他才看心情回自己想說的話（大部分韓文，偶爾母語）
   ========================================================= */
const NPC_CO={"JYP Entertainment":"JYP","HYBE":"HYBE","DOLPUNG Lab.":"DOLPUNG Lab.","YG Entertainment":"YG","PAPERMOON Entertainment":"PAPERMOON","BLUE HOUR Entertainment":"BLUE HOUR","SM Entertainment":"SM"};
const NPC_PL={d7:30,d30:100,d365:1000};
const npcGid=G=>"npc_"+String(G).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]/g,"");
const npcMid=(G,i)=>npcGid(G)+"_"+i;
const npcOf=gid=>{ const g=groupOf(gid); return g&&g.npc?g.npc:null; };
const npcMidOld=id=>{ const m=nlM(id); return m?npcMid(m.G,m.i):""; };          /* 舊的「團名.幾號」→ 新的成員 id */
const npcOldOf=mid=>{ const m=MEMBERS[mid]; return m&&m.npcKey||""; };          /* 新的成員 id → 舊的「團名.幾號」（內容用） */
const isNpcG=gid=>!!npcOf(gid);
const isNpcM=mid=>!!(MEMBERS[mid]&&MEMBERS[mid].npc);
function npcInject(){ try{ if(typeof NPC_INFO==="undefined") return;
  for(let i=GROUPS.length-1;i>=0;i--) if(GROUPS[i]&&GROUPS[i].npc) GROUPS.splice(i,1);
  Object.keys(MEMBERS).forEach(k=>{ if(MEMBERS[k]&&MEMBERS[k].npc) delete MEMBERS[k]; });
  Object.keys(NPC_INFO).forEach(G=>{ const I=NPC_INFO[G], gid=npcGid(G), h=strHash(G); if(GROUPS.some(g=>g.id===gid)) return;
    GROUPS.push({id:gid,name:npcN(G),g:h%GRADS.length,npc:G,co:NPC_CO[I.co]||"",solo:I.mem.length===1?true:undefined,members:I.mem.map((r,i)=>npcMid(G,i))});
    I.mem.forEach((r,i)=>{ MEMBERS[npcMid(G,i)]={name:npcN(r[0]),group:gid,g:(h+i+1)%GRADS.length,npc:true,npcKey:G+"."+i}; }); }); }catch(e){} }
{ const a0=applyRoster; applyRoster=function(){ const r=a0.apply(this,arguments); npcInject(); return r; }; }
npcInject(); setInterval(npcInject,120000);
/* 頭貼：沒有照片時用團的代表色＋名字第一個字（跟 SNS 一樣） */
const npcAv=mid=>{ const k=npcOldOf(mid); return k&&typeof nlAvUrl==="function"?nlAvUrl(k):""; };

/* ---------- 讀取時加進去、寫回去時濾掉 ---------- */
const NPC_LK="daisuki_npc_lk2";
function npcPostsGen(){ try{ const lk=S.get(NPC_LK,{})||{}; return nlGen("cm").map(p=>{ const m=nlM(p.mid); return {id:"npcp_"+p.id,member:npcMid(m.G,m.i),group:npcGid(m.G),ts:p.ts,text:p.t,likedBy:(lk["npcp_"+p.id]||[]).slice(),likes:(lk["npcp_"+p.id]||[]).length,npcBase:p.base,npcTr:p.z,tag:"日常"}; }); }catch(e){ return []; } }
const npcWkDef={};   /* SKpedia 預設頁（npc 團體頁、成員頁），內容在 39c */
(function(){ const g0=S.get, s0=S.set;
  S.get=function(k,fb){ const v=g0.apply(S,arguments);
    try{
      if(k===K.posts&&Array.isArray(v)) return v.filter(x=>!String(x&&x.id||"").startsWith("npcp_")).concat(npcPostsGen());
      if(k===K.postTr){ const o={...(v||{})}; npcPostsGen().forEach(p=>{ if(p.npcTr&&p.npcTr!==p.text&&!o[p.id]) o[p.id]=p.npcTr; }); return o; }
      if(k===K.gTheme){ const o={}; Object.keys(NPC_INFO).forEach(G=>o[npcGid(G)]=NPC_INFO[G].col); return {...o,...(v||{})}; }
      if(typeof WK_KEY!=="undefined"&&k===WK_KEY&&typeof npcWkDefs==="function"){ const D=npcWkDefs(); return {...D,...(v||{})}; }
    }catch(e){}
    return v; };
  S.set=function(k,v){ try{
      if(k===K.posts&&Array.isArray(v)&&v.some(x=>String(x&&x.id||"").startsWith("npcp_"))){ const lk={...(g0.call(S,NPC_LK,{})||{})}; let ch=false;
        v.forEach(x=>{ if(String(x&&x.id||"").startsWith("npcp_")){ const L=x.likedBy||[], was=lk[x.id]||[]; if(JSON.stringify(L)!==JSON.stringify(was)){ lk[x.id]=L; ch=true; } } });
        if(ch) s0.call(S,NPC_LK,lk); v=v.filter(x=>!String(x&&x.id||"").startsWith("npcp_")); }
      else if(k===K.postTr&&v&&typeof v==="object"){ const o={}; Object.keys(v).forEach(x=>{ if(!x.startsWith("npcp_")) o[x]=v[x]; }); v=o; }
      else if(k===K.gTheme&&v&&typeof v==="object"){ const o={...v}; Object.keys(NPC_INFO).forEach(G=>{ const id=npcGid(G); if(o[id]===NPC_INFO[G].col) delete o[id]; }); v=o; }
      else if(typeof WK_KEY!=="undefined"&&k===WK_KEY&&v&&typeof v==="object"&&typeof npcWkDefs==="function"){ const D=npcWkDefs(), o={...v}; Object.keys(D).forEach(id=>{ if(o[id]&&JSON.stringify(o[id])===JSON.stringify(D[id])) delete o[id]; }); v=o; }
    }catch(e){}
    return s0.apply(S,[k,v,...[].slice.call(arguments,2)]); };
})();
/* 分潤、後台報表：虛擬歌手的收入不算任何人的 */
{ const r0=recordSale; recordSale=function(type,o){ o=o||{}; if((o.mid&&isNpcM(o.mid))||(o.gid&&isNpcG(o.gid))) type="npc_"+type; return r0.call(this,type,o); }; }
/* SKpedia：出道日 */
{ const w0=wkAuto; wkAuto=function(gid){ const r=w0.apply(this,arguments); try{ const G=npcOf(gid); if(G&&!r.debut) r.debut=new Date(NPC_INFO[G].debut+"T12:00:00").getTime(); }catch(e){} return r; }; }

/* ---------- TIE ---------- */
const npcTieP=(gid,pl)=>isNpcG(gid)?NPC_PL[(pl||tiePl()).id]||100:null;
/* 歡迎語：照他自己寫的（韓文＋翻譯，分好幾則） */
function npcWelcomeMsgs(mid,now){ const k=npcOldOf(mid), W=nlWelcome(k), O=W.o.split("|"), Z=W.z.split("|"), me=myEmail();
  return O.map((o,i)=>{ const zz=nlFill(Z[i]||o,k,0), oo=nlFill(o,k,0); return {id:"wel"+now+"_"+i,member:mid,from:"artist",welcome:true,to:me,text:zz,...(oo!==zz?{ko:oo}:{}),ts:now+1+i*1500}; }); }
/* 粉絲傳訊息 → 他看心情決定回不回、什麼時候回（先排進自己的待傳清單，時間到才放進聊天室） */
const NPC_Q="daisuki_npc_tieq", NPC_SEEN="daisuki_npc_tieseen";
function npcTieTick(){ try{ const s=session(); if(!s||!s.email) return; const me=myEmail(), now=Date.now();
  const Q=S.get(acK(NPC_Q),[])||[], seen=S.get(acK(NPC_SEEN),{})||{}; let qch=false, sch=false;
  Object.keys(subs()).filter(isNpcM).forEach(mid=>{ if(!isActive(mid)) return; const mine=getWhispers().filter(w=>w.member===mid&&mineX(w)); const last=mine.length?mine[mine.length-1].ts:0;
    if(seen[mid]==null){ seen[mid]=((subs()[mid]||{}).since)||0; sch=true; }
    if(last>seen[mid]){ seen[mid]=last; sch=true; if(!Q.some(x=>x.mid===mid)){ const r={msgs:[],used:(S.get(acK(NPC_SEEN+"_u"),{})||{})[mid]||[]}; nlReplyPlan(npcOldOf(mid),r);
        r.msgs.forEach(x=>Q.push({mid,ko:x.t,zh:x.z,ts:x.ts})); const U=S.get(acK(NPC_SEEN+"_u"),{})||{}; U[mid]=(r.used||[]).slice(-40); S.set(acK(NPC_SEEN+"_u"),U); qch=true; } } });
  /* 自己想傳就傳：每天看心情 0～3 次，時間隨機（不是粉絲傳了才回） */
  { const D=S.get(acK(NPC_SEEN+"_d"),{})||{}, td=new Date(now).toDateString(), U=S.get(acK(NPC_SEEN+"_u"),{})||{}; let dch=false;
    Object.keys(subs()).filter(isNpcM).forEach(mid=>{ if(!isActive(mid)||D[mid]===td) return; D[mid]=td; dch=true; const h0=strHash(mid+td), n=h0%10<2?0:h0%10<6?1:h0%10<9?2:3, d0=new Date(now); d0.setHours(0,0,0,0);
      for(let k=0;k<n;k++){ const hk=strHash(mid+td+k), t=d0.getTime()+(10+hk%15)*36e5+((hk>>>6)%60)*6e4; if(t<=now) continue; const r={msgs:[],used:U[mid]||[]}; nlReplyPlan(npcOldOf(mid),r,t); r.msgs.forEach(x=>Q.push({mid,ko:x.t,zh:x.z,ts:x.ts})); U[mid]=(r.used||[]).slice(-40); qch=true; } });
    if(dch){ S.set(acK(NPC_SEEN+"_d"),D); S.set(acK(NPC_SEEN+"_u"),U); } }
  const due=Q.filter(x=>x.ts<=now); if(due.length){ const add=due.map((x,i)=>{ const zh=x.zh||x.ko; return {id:"npcw"+x.ts+"_"+i+Math.random().toString(36).slice(2,5),member:x.mid,from:"artist",to:me,text:zh,...(x.ko&&x.ko!==zh?{ko:x.ko}:{}),ts:x.ts}; });
    S.set(K.whispers,[...S.get(K.whispers,[]),...add]); { const R=S.get(K.tieReadBy,{})||{}; add.forEach(x=>{ R[x.member]=Math.max(R[x.member]||0,x.ts); }); S.set(K.tieReadBy,R); }   /* 他回了＝讀過了 */ const last=add[add.length-1], m=MEMBERS[last.member]; try{ pushNotification({kind:"whisper",member:last.member,group:m.group,text:last.ko||last.text,color:null,direct:true}); }catch(e){}
    S.set(acK(NPC_Q),Q.filter(x=>x.ts>now)); qch=false; if(location.hash.includes("chat")||location.hash.includes("whisper")) try{ render(); }catch(e){} }
  if(qch) S.set(acK(NPC_Q),Q); if(sch) S.set(acK(NPC_SEEN),seen); }catch(e){} }
setInterval(npcTieTick,20000); setTimeout(npcTieTick,4000); document.addEventListener("submit",()=>setTimeout(npcTieTick,800),true);
/* SHOP：TIE 券的「起」價（照真的團一樣只賣團體券；SOLO 一張） */
{ const p0=shopProducts; shopProducts=function(gid){ const L=p0.apply(this,arguments); if(!isNpcG(gid)) return L; return L.map(p=>p.kind==="tie"?{...p,pts:Math.min(...Object.values(NPC_PL))}:p); }; }
/* 舊的連結（#/fan/npc?id=團名）→ 真的社群頁 */
addEventListener("hashchange",()=>{ const m=/\/npc\?id=([^&]+)/.exec(location.hash); if(m){ const G=decodeURIComponent(m[1]); if(NPC_INFO[G]) location.replace("#/"+((session()||{}).role||"fan")+"/grp?id="+npcGid(G)); } });
