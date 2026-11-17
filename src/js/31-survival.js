/* =========================================================
   SURVIVAL PROJECT（選秀）11/17 改版：照 PRODUCE 系列的流程，一季一季辦
   ・招募 1 週：社群成員報名（藝名、生日、公司、皮相、照片、自我介紹），不用 R1
     真人不到 10 位就自動延長 1 週（只有管理員看得到原因）；虛擬練習生補到 24 位
   ・第一輪 2 週 → 第一次排名發表（剩 15）→ 第二輪 2 週 → 第二次排名發表（剩 10，虛擬練習生全部淘汰）
   ・決賽 1 週：每天只能投 1 位 → 出道發表（7 位；真人不夠就照人數調整，不給粉絲看）
   ・出道準備 3 或 4 週：出道組自己填團體出道申請（選出道曲、MV…），管理員核准後照一般流程出道，限定團體活動一年半
   ・投票：每天 3 票，可以分給 3 位或全投同一位，選好一次送出；虛擬練習生每天自動長一點票，排行比較熱鬧
   ・管理員打開 App 時，時間到了就自動公布（大家看到的結果才會一樣）
   ========================================================= */
const SVS="daisuki_sv_season", SVE="daisuki_sv_entries", SVV="daisuki_sv_v2";
const SV_PH={recruit:"招募中",r1:"第一輪",r2:"第二輪",final:"決賽",prep:"出道準備中",done:"已出道"};
const SV_DUR={recruit:7,r1:14,r2:14,final:7};
const SV_KEEP={r1:15,r2:10}, SV_MIN=10, SV_N=24, SV_DEB=7, SV_LTD=548;   /* 一年半 ≒ 548 天 */
/* 虛擬練習生（女團第一季用；之後男團再加一份） */
const SV_NPC_G=[["n1","夏恩","Lumière Ent."],["n2","采律","Bloom Note"],["n3","雅琳","Starlit"],["n4","知秀","Velvet Moon"],["n5","若晴","Prism Works"],["n6","敏書","Aurora Lab"],["n7","詩妍","Cloud Nine"],["n8","晨熙","Blue Wave"],["n9","苡安","Neon Peak"],["n10","采昀","Zenith Arts"],["n11","佳恩","Moonlit Ent."],["n12","語彤","Star Horizon"],["n13","芮希","Petal & Co."],["n14","海音","Lumière Ent."],["n15","星語","Bloom Note"],["n16","沐晴","Velvet Moon"],["n17","以寧","Prism Works"],["n18","瑞恩","Aurora Lab"],["n19","知恩","Starlit"],["n20","芷寧","Cloud Nine"],["n21","安娜","Neon Peak"],["n22","娜妍","Zenith Arts"],["n23","采媛","Blue Wave"],["n24","瑟琪","Moonlit Ent."]];
const SV_NPC_B=[["m1","星宇","Star Horizon"],["m2","光賢","Neon Peak"],["m3","夏澄","Zenith Arts"],["m4","承恩","Blue Wave"],["m5","子安","Moonlit Ent."],["m6","時溫","Aurora Lab"],["m7","若川","Prism Works"],["m8","一然","Cloud Nine"],["m9","宇辰","Lumière Ent."],["m10","泰民","Bloom Note"],["m11","昊宇","Velvet Moon"],["m12","知勳","Starlit"],["m13","俊熙","Prism Works"],["m14","在允","Aurora Lab"],["m15","以恆","Cloud Nine"],["m16","承澤","Neon Peak"],["m17","道允","Zenith Arts"],["m18","海潤","Blue Wave"],["m19","瑞俊","Moonlit Ent."],["m20","晨宇","Star Horizon"],["m21","時延","Lumière Ent."],["m22","昇珉","Bloom Note"],["m23","圭賢","Velvet Moon"],["m24","嘉允","Starlit"]];
/* 示範（只有 HUSSEY 的粉絲身分看得到）：假的一季，五個階段可以切換看；投票、報名都只在這次打開有效，不存 */
const svDemoOk=()=>{ try{ const x=session(); return !!x&&x.role==="fan"&&musDemo(); }catch(e){ return false; } };
const SV_DEMO_N=["Yuna","Chaewon","Sieun","Hana","Ririka","Mina","Seoyeon","Nako","Jiwoo","Aria","Haeun","Rin"];
function svDemoSeason(){ const ph=ui.svDemo, now=Date.now(), E=SV_DEMO_N.map((n,i)=>"dm"+i), all=[...E,...SV_NPC_G.slice(0,SV_N-E.length).map(x=>x[0])];
  return {id:"demo",demo:1,no:1,g:"g",ph,t0:now-2*864e5,end:now+(ph==="prep"?20:ph==="final"?5:ph==="recruit"?4:11)*864e5,npcN:SV_N-E.length,prepW:3,keep:{r1:all.filter((x,i)=>i%8!==7).slice(0,15),r2:E.slice(0,10)},debut:E.slice(0,7),rk:{r1:all,r2:E.slice(0,10),final:E.slice(0,10)},ann:{}}; }
const svReal=()=>S.get(SVS,null);
const svSeason=()=>ui.svDemo&&svDemoOk()?svDemoSeason():svReal();
const svOpen=()=>sbxOn()||svDemoOk()||!!S.get(K.svOpen,false)||String((session()||{}).email||"").toLowerCase()==="husay";
const svTheme=()=>{ const s=svSeason(); return s&&s.g?(s.g==="g"?"g":"b"):S.get("daisuki_sv_theme","g")==="b"?"b":"g"; };
const svEntries=()=>{ const s=svSeason(); if(s&&s.demo) return s.ph==="recruit"?SV_DEMO_N.slice(0,6).map((n,i)=>({id:"dm"+i,name:n,co:i%3?"Lumière Ent.":"",email:"demo"+i,intro:"示範用的練習生。"})):SV_DEMO_N.map((n,i)=>({id:"dm"+i,name:n,co:i%3?"Lumière Ent.":"",email:"demo"+i,intro:"示範用的練習生。擅長 Vocal，想當主唱。"})); return s?(S.get(SVE,[])||[]).filter(e=>e.sid===s.id&&!e.out):[]; };
const svMyEntry=()=>{ const me=myEmail(); return svEntries().find(e=>e.email===me)||null; };
/* 全部參賽者：真人＋虛擬（虛擬從第一輪開始出現，補到 24 位） */
function svAll(){ const s=svSeason(); if(!s) return []; const R=svEntries().map(e=>({id:e.id,real:1,name:e.name,co:e.co,photo:e.photo,fc:e.fc,intro:e.intro,bd:e.bd,email:e.email}));
  if(s.ph==="recruit") return R; const P=(s.g==="g"?SV_NPC_G:SV_NPC_B).slice(0,Math.max(0,(s.npcN!=null?s.npcN:SV_N-R.length))).map(([id,name,co])=>({id,real:0,name,co}));
  return [...R,...P]; }
const svVoting=()=>{ const s=svSeason(); return !!s&&["r1","r2","final"].includes(s.ph); };
const svFinal=()=>{ const s=svSeason(); return !!s&&s.ph==="final"; };
const svCap=()=>svFinal()?1:3;
const svDayK=()=>{ const s=svSeason(); return (s?s.id+"|"+s.ph+"|":"")+new Date().toDateString(); };
const svUsed=()=>{ if((svSeason()||{}).demo) return ui.svDU||0; const r=S.get(acK("daisuki_sv_day"),{})||{}; return r.k===svDayK()?r.n||0:0; };
const svLeft=()=>Math.max(0,svCap()-svUsed());
const svToday=()=>svUsed();   /* 舊名字：別的地方還在用 */
const svTileSub=()=>{ const s=svSeason(); if(!s) return "還沒開始"; if(svVoting()) return svLeft()?`今天還有 ${svLeft()} 票`:"今天投完了"; return SV_PH[s.ph]||""; };
/* 每位參賽者在「這一輪」的分數：真人＝粉絲的票＋管理員加分；虛擬＝每天自動長一點（跟著真人的平均走，比較自然） */
const svHash=s=>{ let h=0; for(const c of String(s)) h=(h*31+c.charCodeAt(0))|0; return Math.abs(h); };
function svScores(ph){ const s=svSeason(); if(!s) return {}; ph=ph||s.ph; const V=s.demo?Object.fromEntries(SV_DEMO_N.map((n,i)=>["dm"+i,(12-i)*9+((ui.svDV||{})["dm"+i]||0)])):((S.get(SVV,{})||{})[s.id]||{})[ph]||{}, B=((s.bonus||{})[ph])||{}, all=svAll(), out={};
  const live=svAlive(ph), reals=all.filter(t=>t.real&&live.has(t.id)), avg=reals.length?reals.reduce((a,t)=>a+(V[t.id]||0)+(B[t.id]||0),0)/reals.length:0;
  const t0=(s.t0s||{})[ph]||s.t0||Date.now(), days=Math.max(1,Math.ceil((Math.min(Date.now(),(s.ends||{})[ph]||Date.now())-t0)/864e5));
  all.forEach(t=>{ if(!live.has(t.id)) return; out[t.id]=t.real?(V[t.id]||0)+(B[t.id]||0):Math.round(days*(2+svHash(t.id+ph)%6)+avg*(.25+svHash(ph+t.id)%55/100))+(B[t.id]||0); });
  return out; }
/* 這一輪還在比的人 */
function svAlive(ph){ const s=svSeason(); if(!s) return new Set(); ph=ph||s.ph; const K0=s.keep||{};
  if(ph==="r1"||ph==="recruit") return new Set(svAll().map(t=>t.id)); if(ph==="r2") return new Set(K0.r1||[]); if(ph==="final") return new Set(K0.r2||[]); return new Set(K0.r2||[]); }
const svRank=ph=>{ const sc=svScores(ph); return Object.keys(sc).sort((a,b)=>sc[b]-sc[a]||(a<b?-1:1)); };
const svById=id=>svAll().find(t=>t.id===id);
const svPh=t=>t&&t.photo?`<img src="${esc(t.photo)}" alt="">`:`<i class="sv2-sil"></i>`;
const svLeftTxt=ms=>{ ms=Math.max(0,ms); const d=Math.floor(ms/864e5), h=Math.floor(ms%864e5/36e5); return d?`${d} 天 ${h} 時`:`${h} 時 ${Math.floor(ms%36e5/6e4)} 分`; };

/* ---------- 時間到了 → 公布（只在管理員的手機上算，大家看到的才會一樣） ---------- */
function svTick(){ try{ const s=svReal(); if(!s||!isAdminAcct()||!s.end||Date.now()<s.end) return; svAdvance(false); }catch(e){} }
function svAdvance(force){ if(!svReal()) return; const s={...svReal()}; const now=Date.now(), nx=(ph,d)=>{ s.ph=ph; s.t0=now; s.t0s={...(s.t0s||{}),[ph]:now}; s.end=d?now+d*864e5:0; s.ends={...(s.ends||{}),[ph]:s.end}; };
  const reals=svEntries();
  if(s.ph==="recruit"){ if(reals.length<SV_MIN&&!force){ s.end=now+7*864e5; s.ext=(s.ext||0)+1; S.set(SVS,s); return "ext"; }   /* 真人不夠：延長招募（粉絲只會看到倒數變長） */
    s.npcN=Math.max(0,SV_N-reals.length); nx("r1",SV_DUR.r1); S.set(SVS,s); return "r1"; }
  if(s.ph==="r1"){ const rk=svRank("r1"), all=svAll(), isR=id=>(all.find(t=>t.id===id)||{}).real; let keep=rk.slice(0,SV_KEEP.r1);
    const needR=Math.min(all.filter(t=>t.real).length,SV_KEEP.r2); let kr=keep.filter(isR).length;   /* 決賽要湊得到真人：不夠就把留下來的虛擬換成落榜的真人 */
    if(kr<needR){ const outR=rk.filter(id=>isR(id)&&!keep.includes(id)); for(let i=keep.length-1;i>=0&&kr<needR&&outR.length;i--) if(!isR(keep[i])){ keep[i]=outR.shift(); kr++; } }
    s.keep={...(s.keep||{}),r1:keep}; s.rk={...(s.rk||{}),r1:rk}; s.ann={...(s.ann||{}),r1:now}; nx("r2",SV_DUR.r2); S.set(SVS,s); return "r2"; }
  if(s.ph==="r2"){ const rk=svRank("r2"), all=svAll(), keep=rk.filter(id=>(all.find(t=>t.id===id)||{}).real).slice(0,SV_KEEP.r2);   /* 虛擬練習生在這裡全部淘汰 */
    s.keep={...(s.keep||{}),r2:keep}; s.rk={...(s.rk||{}),r2:rk}; s.ann={...(s.ann||{}),r2:now}; nx("final",SV_DUR.final); S.set(SVS,s); return "final"; }
  if(s.ph==="final"){ const rk=svRank("final"), n=rk.length>=SV_KEEP.r2?SV_DEB:Math.max(1,Math.min(SV_DEB,Math.round(rk.length*.7)));   /* 真人不夠就照人數調整 */
    s.debut=rk.slice(0,n); s.rk={...(s.rk||{}),final:rk}; s.ann={...(s.ann||{}),final:now}; nx("prep",(s.prepW||3)*7); S.set(SVS,s); return "prep"; } }

/* ---------- 粉絲：排名發表（每一次發表，第一次打開 App 時跳出來） ---------- */
function svRevealCheck(){ try{ const s=svReal(); if(!s||!s.ann||!svOpen()) return; const seen=S.get(acK("daisuki_sv_seen"),{})||{}; const st=["final","r2","r1"].find(k=>s.ann[k]&&!seen[s.id+k]); if(!st||layer.innerHTML) return;
  seen[s.id+st]=Date.now(); S.set(acK("daisuki_sv_seen"),seen); svReveal(st); }catch(e){} }
function svReveal(st){ const s=svSeason(); if(!s) return; const rk=(s.rk||{})[st]||[], keep=st==="final"?s.debut||[]:((s.keep||{})[st]||[]), all=svAll(), my=S.get(acK("daisuki_sv_my"),{})||{};
  const title=st==="final"?"出道組發表":st==="r1"?"第一次排名發表":"第二次排名發表", sub=st==="final"?`恭喜 ${keep.length} 位出道`:`${keep.length} 位晉級`;
  const tile=(id,i)=>{ const t=all.find(x=>x.id===id); if(!t) return ""; return `<div class="svr-t" style="--i:${i}"><span class="svr-p">${svPh(t)}</span><b>${st==="final"?`${i+1}位`:`${rk.indexOf(id)+1}位`}</b><span>${esc(t.name)}</span>${my[id]?`<em>我的 PICK</em>`:""}</div>`; };
  const out=Object.keys(my).filter(id=>rk.includes(id)&&!keep.includes(id)).map(id=>(all.find(t=>t.id===id)||{}).name).filter(Boolean);
  setLayer(`<div class="mcx svr ${svTheme()}" role="dialog" aria-label="${title}"><div class="mcx-bg"></div><div class="mcx-ray"></div><div class="mcx-glow"></div>
    <p class="mcx-k">SURVIVAL PROJECT</p><h2 class="mcx-t"><span class="cc-tx">${title}</span></h2><p class="mcx-s">${sub}</p>
    <div class="svr-g">${keep.map(tile).join("")}</div>${out.length?`<p class="svr-out">${out.map(esc).join("、")} 這次沒有晉級</p>`:""}
    <div class="mcx-a"><button class="t-mbtn main" data-a="svRevealGo">看完整排名</button><button class="t-mbtn" data-a="tCloseLayer">好</button></div></div>`,"svr");
  try{ setTimeout(()=>{ const t=layer.querySelector(".mcx-t .cc-tx"); AN&&AN.chars&&AN.chars(t); },600); setTimeout(()=>confetti(innerWidth/2,innerHeight*.35,{n:80,cols:svTheme()==="g"?["#FFB8E0","#FFFFFF","#FFD6EC","#F9A8D4"]:["#93C5FD","#FFFFFF","#BFDBFE","#60A5FA"]}),900); const c=document.getElementById("confetti"); if(c) c.style.zIndex="310"; }catch(e){} }

/* ---------- 頁面 ---------- */
function viewSurvival(id){ const s=svSeason(), th=svTheme(), hd=coreHead(id?"練習生":"選秀");
  const pre=svOpen()?"":`<p class="sv-closed">目前沒有開放，這是管理員預覽</p>`;
  if(!s) return hd+`<main class="page sv2 ${th}">${pre}<div class="t-empty"><span class="t-empty-ico">${hi("trophy")}</span><p>選秀還沒開始</p>${svDemoOk()?`<button class="sv2-cta" data-a="svDemo" data-v="r1">看示範</button>`:""}</div></main>`;
  if(id) return hd+svProfile(id);
  const left=s.end?s.end-Date.now():0, bar=`<div class="sv3-bar"><b>${SV_PH[s.ph]}</b><span>${s.ph==="recruit"?`報名截止 ${svLeftTxt(left)}`:svVoting()?`今天剩 ${svLeft()} 票・${s.ph==="final"?"出道發表":"排名發表"} ${svLeftTxt(left)}`:s.ph==="prep"?`出道倒數 ${svLeftTxt(left)}`:""}</span></div>`;
  const dm=s.demo?`<div class="sv3-dm"><b>示範・只有你看得到</b><div>${["recruit","r1","r2","final","prep"].map(k=>`<button class="${k===s.ph?"on":""}" data-a="svDemo" data-v="${k}">${SV_PH[k]}</button>`).join("")}<button data-a="svDemoRv">發表動畫</button><button data-a="svDemo" data-v="">結束</button></div></div>`:""; return hd+`<main class="page sv2 ${th}">${dm}${s.demo?"":pre}${bar}${s.ph==="recruit"?svRecruitHtml(s):svVoting()?svVoteHtml(s):svAfterHtml(s)}</main>${svVoting()?svBasketHtml():""}`; }
function svRecruitHtml(s){ const E=svEntries(), me=svMyEntry(), art=(session()||{}).role!=="fan";
  return `<section class="sv3-hero"><small>SURVIVAL PROJECT・${s.g==="g"?"女團":"男團"}第 ${s.no||1} 季</small><h2>報名當練習生</h2><p>選上的人以限定團體出道，活動一年半。不用等級，資料填完整就能報名。</p>
    ${art?"":me?`<button class="sv2-cta" data-a="svApply">修改報名資料</button>`:`<button class="sv2-cta" data-a="svApply">報名參加</button>`}</section>
    <div class="sv2-sh"><b>已報名</b><i>${E.length} 位</i></div>${E.length?`<div class="sv3-grid">${E.map(e=>`<button class="sv3-c" data-a="uniGo" data-v="#/fan/core?p=survival&id=${e.id}"><span class="sv2-p">${svPh(e)}</span><b>${esc(e.name)}</b><small>${esc(e.co||"個人練習生")}</small></button>`).join("")}</div>`:`<p class="me-none">還沒有人報名</p>`}`; }
function svVoteHtml(s){ const sc=svScores(), rk=svRank(), all=svAll(), my=S.get(acK("daisuki_sv_my"),{})||{}, B=ui.svB||{}, cut=s.ph==="r1"?SV_KEEP.r1:s.ph==="r2"?SV_KEEP.r2:SV_DEB;
  const t=id=>all.find(x=>x.id===id)||{};
  const rows=[]; let n=0, k=1; const top=rk.slice(0,Math.min(10,rk.length)); while(n<top.length){ rows.push(top.slice(n,n+k)); n+=k; k++; }
  const tile=id=>{ const x=t(id), r=rk.indexOf(id)+1; return `<button class="sv2-t ${my[id]?"me":""}" data-a="uniGo" data-v="#/fan/core?p=survival&id=${id}"><span class="sv2-p">${svPh(x)}</span><b>${r}位</b><span>${esc(x.name)}</span></button>`; };
  const row=(id,i)=>{ const x=t(id), c=B[id]||0; return `<div class="sv2-row ${i===cut?"cut":""}"><span class="sv2-rk">${i+1}位</span><button class="sv2-av" data-a="uniGo" data-v="#/fan/core?p=survival&id=${id}">${svPh(x)}</button><div class="sv2-nm"><b>${esc(x.name)}</b><small>${esc(x.co||"個人練習生")}・${fmt(sc[id]||0)} 票</small></div><button class="sv2-pk ${c?"on":""}" data-a="svPick" data-v="${id}" aria-label="PICK ${esc(x.name)}">${c?`PICK ×${c}`:"PICK"}</button></div>`; };
  return `<section class="sv2-pyr"><div class="sv2-rib"><span>SURVIVAL PROJECT</span><span>${s.ph==="final"?`前 ${cut} 位出道`:`前 ${cut} 位晉級`}</span></div>
      <div class="sv2-rows"><i class="sv2-crown">${hi("trophy")}</i>${rows.map(r=>`<div class="sv2-r">${r.map(tile).join("")}</div>`).join("")}</div></section>
    <div class="sv2-sh"><b>${s.ph==="final"?"出道圈":"晉級圈"}</b><i>1～${cut} 位</i></div>${rk.slice(0,cut).map(row).join("")}
    ${rk.length>cut?`<div class="sv2-sh out"><b>淘汰邊緣</b><i>${cut+1} 位以下</i></div>${rk.slice(cut).map((id,i)=>row(id,i+cut)).join("")}`:""}
    <p class="sv3-note">${s.ph==="final"?"決賽每天只能投 1 位。":"3 票可以分給不同人，也可以全投同一位。"}</p>`; }
function svBasketHtml(){ const B=ui.svB||{}, n=Object.values(B).reduce((a,b)=>a+b,0), all=svAll(); if(!n) return "";
  return `<div class="sv3-bk"><div class="sv3-bkl">${Object.entries(B).filter(([,c])=>c).map(([id,c])=>`<button data-a="svUnpick" data-v="${id}">${esc((all.find(t=>t.id===id)||{}).name||"")}${c>1?` ×${c}`:""}<i>✕</i></button>`).join("")}</div><button class="sv3-go" data-a="svSend">送出 ${n} 票</button></div>`; }
function svAfterHtml(s){ const all=svAll(), D=(s.debut||[]).map(id=>all.find(t=>t.id===id)).filter(Boolean), me=svMyEntry(), win=s.demo||me&&(s.debut||[]).includes(me.id), db=s.demo?null:getDebut().find(x=>x.sv===s.id&&x.status!=="gone");
  const g=db&&db.gid&&groupOf(db.gid);
  return `<section class="sv3-hero"><small>SURVIVAL PROJECT・${s.g==="g"?"女團":"男團"}第 ${s.no||1} 季</small><h2>${g?esc(g.name):"出道組"}</h2><p>${s.ph==="prep"?`正在選出道曲、拍 MV、決定隊內定位。限定團體，活動一年半。`:"限定團體活動中。"}</p></section>
    <div class="sv3-grid">${D.map((t,i)=>`<button class="sv3-c" data-a="uniGo" data-v="#/fan/core?p=survival&id=${t.id}"><span class="sv2-p">${svPh(t)}</span><b>${esc(t.name)}</b><small>${i+1}位</small></button>`).join("")}</div>
    ${win&&s.ph==="prep"?(db?`<p class="sv3-note">出道申請${db.status==="wait"?"審核中":db.status==="pre"?`已核准・${mdTxt(db.day)} 出道`:db.status==="ok"?"已出道":"未通過，可以重新送出"}</p>${db.status==="no"?`<button class="sv2-cta" data-a="svDebutApply">重新填出道申請</button>`:""}`:`<button class="sv2-cta" data-a="svDebutApply">填團體出道申請</button><p class="sv3-note">選一位代表填就好。</p>`):""}`; }
function svProfile(id){ const s=svSeason(), x=svById(id); if(!x) return `<main class="page"><p class="me-none">找不到這位練習生</p></main>`;
  const sc=svScores(), rk=svRank(), r=rk.indexOf(id)+1, my=(S.get(acK("daisuki_sv_my"),{})||{})[id]||0, alive=svAlive().has(id), c=(ui.svB||{})[id]||0;
  return `<main class="page sv2 ${svTheme()}"><section class="sv2-prof"><div class="sv2-pp">${svPh(x)}</div>${r?`<span class="sv2-no">${pad(r)}</span>`:""}<div class="sv2-pn"><small>${esc(x.co||"個人練習生")}</small><b>${esc(x.name)}</b>${x.fc?`<span>皮相：${esc(x.fc)}</span>`:""}</div></section>
    ${svVoting()?`<div class="sv2-bar"><div><b>${alive?fmt(sc[id]||0):"—"}</b><span>這一輪票數</span></div><div><b>${alive&&r?r+"位":"淘汰"}</b><span>目前順位</span></div><div><b>${my}</b><span>我投的票</span></div></div>`:""}
    ${x.intro?`<div class="sv2-sh"><b>自我介紹</b></div><p class="sv3-intro">${esc(x.intro)}</p>`:""}
    ${svVoting()&&alive?`<button class="sv2-cta" data-a="svPick" data-v="${id}" ${svLeft()-Object.values(ui.svB||{}).reduce((a,b)=>a+b,0)>0||c?"":"disabled"}>${c?`已選 ${c} 票・再 PICK 一次`:`PICK ${esc(x.name)}`}</button>`:""}</main>${svVoting()?svBasketHtml():""}`; }

/* ---------- 報名表（藝名、生日、公司、皮相、照片、自我介紹） ---------- */
function svApplyForm(){ const e=svMyEntry()||{}, f=ui.svF||(ui.svF={name:e.name||"",bd:e.bd||"",co:e.co||"",fc:e.fc||"",photo:e.photo||"",intro:e.intro||""});
  setLayer(`<div class="tiei"><header class="tiei-top"><button class="icon-btn" data-a="tCloseLayer" aria-label="關閉">${I.back}</button><b>${e.id?"修改報名資料":"選秀報名"}</b><span class="sh-sp"></span></header><div class="tiei-body">
    <p class="ae-tip">選上會直接用這些資料出道，請照出道申請的標準填好。</p>
    <button class="db-slot t sv3-ph" data-a="svPhoto" aria-label="大頭照">${f.photo?`<img src="${esc(f.photo)}" alt="">`:`<b>＋</b><small>大頭照</small>`}</button>
    <span class="fs-f-lab">藝名</span><input id="svName" class="a-nick-in" maxlength="16" placeholder="輸入文字" value="${esc(f.name)}">
    <span class="fs-f-lab">生日</span><input id="svBd" class="a-nick-in" type="date" max="${ymdIn(Date.now())}" value="${esc(f.bd)}">
    <span class="fs-f-lab">皮相（真人的名字）</span><input id="svFc" class="a-nick-in" maxlength="30" placeholder="輸入文字" value="${esc(f.fc)}">
    <span class="fs-f-lab">公司 <em>沒有就留空＝個人練習生</em></span>${coChips(f.co,"svCo")}
    <span class="fs-f-lab">自我介紹・設定</span><textarea id="svIntro" class="a-nick-in dbx-ta" rows="6" maxlength="600" placeholder="個性、擅長的（Vocal／Dance／Rap）、想當什麼位置、想對 National Producer 說的話">${esc(f.intro)}</textarea>
    <button class="btn btn-main btn-block" data-a="svApplyOk" style="margin-top:14px">${e.id?"儲存":"送出報名"}</button>${e.id?`<button class="btn btn-soft btn-block" data-a="svQuit" style="margin-top:8px">取消報名</button>`:""}</div></div>`); }
const svKeep=()=>{ const f=ui.svF; if(!f) return; const v=id=>(document.getElementById(id)||{}).value; ["name","bd","fc","intro"].forEach(k=>{ const x=v({name:"svName",bd:"svBd",fc:"svFc",intro:"svIntro"}[k]); if(x!=null) f[k]=x.trim?x.trim():x; }); };

/* ---------- 管理員（FOC → 選秀） ---------- */
function svAdminHtml(){ const s=svSeason(), E=svEntries();
  if(!s||s.ph==="done") return `<section class="card studio"><p class="ae-tip">${s?"上一季已經結束。":""}開一季新的選秀：先招募 1 週，真人不到 ${SV_MIN} 位會自動延長。</p><div class="ls-btns"><button class="btn btn-main" data-a="svNew" data-v="g">開新一季（女團）</button><button class="btn btn-soft" data-a="svNew" data-v="b">開新一季（男團）</button></div></section>`;
  const rk=svVoting()?svRank():[], sc=svVoting()?svScores():{}, all=svAll();
  return `<section class="card studio"><p class="ae-tip">${s.g==="g"?"女團":"男團"}第 ${s.no||1} 季・<b>${SV_PH[s.ph]}</b>${s.end?`・${new Date(s.end).toLocaleString()} 自動公布／進下一階段`:""}${s.ext?`・招募已延長 ${s.ext} 次（真人 ${E.length}／至少 ${SV_MIN}）`:""}</p>
    <div class="ls-btns">${s.ph!=="prep"?`<button class="btn btn-soft" data-a="svNext">現在就${s.ph==="recruit"?"結束招募":"公布"}</button>`:`<button class="btn btn-soft" data-a="svDone">出道完成，結束這一季</button>`}<button class="btn btn-soft" data-a="svPrepW">出道準備 ${s.prepW||3} 週</button><button class="btn btn-soft" data-a="svEnd">取消這一季</button></div></section>
    ${svVoting()?`<div class="section-h">這一輪排名・加分票</div><section class="card studio">${rk.map((id,i)=>{ const x=all.find(t=>t.id===id)||{}; return `<div class="sv2-row"><span class="sv2-rk">${i+1}</span><div class="sv2-nm"><b>${esc(x.name)}${x.real?"":"<small>（虛擬）</small>"}</b><small>${fmt(sc[id]||0)} 票</small></div><button class="btn btn-soft btn-sm" data-a="svBonus" data-v="${id}">加分</button></div>`; }).join("")}</section>`:""}
    ${E.length?`<div class="section-h">報名的人（${E.length}）</div><section class="card studio">${E.map(e=>`<div class="sv2-row"><div class="sv2-nm"><b>${esc(e.name)}</b><small>${esc(acctUser(e.email))}・皮相 ${esc(e.fc||"—")}</small></div><button class="btn btn-soft btn-sm" data-a="svKick" data-v="${e.id}">移除</button></div>`).join("")}</section>`:""}`; }

/* ---------- 動作 ---------- */
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a; if(!/^sv(Pick|Unpick|Send|Apply|ApplyOk|Photo|Co|Quit|New|Next|Done|PrepW|End|Bonus|BonusOk|Kick|RevealGo|DebutApply|Demo|DemoRv)$/.test(a)) return; e.stopImmediatePropagation();
  const rr=()=>{ const y=window.scrollY; render(); window.scrollTo(0,y); }, s=svSeason();
  switch(a){
    case "svPick": { if(!svVoting()) return; if(meBlocked()) return; const B=ui.svB=ui.svB||{}, n=Object.values(B).reduce((x,y)=>x+y,0); if(n>=svLeft()){ toast(svLeft()?`今天最多再投 ${svLeft()} 票`:"今天的票投完了，明天再來"); return; } if(!svAlive().has(t.dataset.v)) return; B[t.dataset.v]=(B[t.dataset.v]||0)+1; rr(); return; }
    case "svUnpick": { const B=ui.svB||{}; if(B[t.dataset.v]) B[t.dataset.v]--; if(!B[t.dataset.v]) delete B[t.dataset.v]; rr(); return; }
    case "svSend": { const B=ui.svB||{}, n=Object.values(B).reduce((x,y)=>x+y,0); if(!n||!s||!svVoting()) return; if(n>svLeft()){ ui.svB={}; rr(); toast("票數不對，請重新選"); return; }
      if(s.demo){ ui.svDV=ui.svDV||{}; Object.entries(B).forEach(([id,c])=>{ ui.svDV[id]=(ui.svDV[id]||0)+c; }); ui.svDU=(ui.svDU||0)+n; const all=svAll(), rk=svRank(); ui.svB={}; rr(); xvResult({tone:"p",small:"示範・不會存",title:"PICK 完成",big:`${n} 票`,chips:[...Object.keys(B).map(id=>`${(all.find(x=>x.id===id)||{}).name} 現在 ${rk.indexOf(id)+1}位`),svLeft()?`今天還能投 ${svLeft()} 票`:"今天投完了，明天再來"],back:"好"}); return; }
      const V=S.get(SVV,{})||{}; V[s.id]={...(V[s.id]||{})}; V[s.id][s.ph]={...(V[s.id][s.ph]||{})}; Object.entries(B).forEach(([id,c])=>{ V[s.id][s.ph][id]=(V[s.id][s.ph][id]||0)+c; }); S.set(SVV,V);
      S.set(acK("daisuki_sv_day"),{k:svDayK(),n:svUsed()+n}); const my=S.get(acK("daisuki_sv_my"),{})||{}; Object.entries(B).forEach(([id,c])=>{ my[id]=(my[id]||0)+c; }); S.set(acK("daisuki_sv_my"),my);
      const all=svAll(), rk=svRank(), names=Object.entries(B).map(([id,c])=>`${(all.find(x=>x.id===id)||{}).name}${c>1?` ×${c}`:""}`); ui.svB={}; rr();
      xvResult({tone:svTheme()==="g"?"p":"b",small:"SURVIVAL PROJECT",title:"PICK 完成",big:`${n} 票`,chips:[...Object.keys(B).map(id=>`${(all.find(x=>x.id===id)||{}).name} 現在 ${rk.indexOf(id)+1}位`),svLeft()?`今天還能投 ${svLeft()} 票`:"今天投完了，明天再來"],back:"好"}); void names; return; }
    case "svDemo": { ui.svDemo=t.dataset.v||null; ui.svB={}; ui.svDU=0; ui.svDV={}; rr(); return; }
    case "svDemoRv": { svReveal(s.ph==="prep"?"final":s.ph==="final"?"r2":"r1"); return; }
    case "svApply": { if(s&&s.demo){ ui.svF=null; svApplyForm(); return; } if((session()||{}).role!=="fan"){ toast("藝人帳號不能報名選秀"); return; } ui.svF=null; svApplyForm(); return; }
    case "svPhoto": { svKeep(); const inp=document.createElement("input"); inp.type="file"; inp.accept="image/*"; inp.onchange=async()=>{ const f0=inp.files&&inp.files[0]; if(!f0) return; const c=await cropImg(f0,{ratio:4/5,max:1080}); if(!c) return;
        try{ const b=await shrinkImg(c,1080); ui.svF.photo=URL.createObjectURL(b); svApplyForm(); if((svSeason()||{}).demo) return; const url=(HB_ON&&await hbImgUrl("sv_"+Date.now().toString(36)+".jpg",b))||await new Promise(res=>{ const rd=new FileReader(); rd.onload=()=>res(rd.result); rd.readAsDataURL(b); }); ui.svF.photo=url; svApplyForm(); }catch(er){ toast("這張圖讀不出來"); } }; pickClick(inp); return; }
    case "svCo": { svKeep(); ui.svF.co=ui.svF.co===t.dataset.v?"":t.dataset.v; svApplyForm(); return; }
    case "svApplyOk": { svKeep(); const f=ui.svF; if(s&&s.demo){ ui.svF=null; layer.innerHTML=""; toast("示範：這樣就報名完成了（不會真的存）"); return; } if(!s||s.ph!=="recruit"){ toast("報名已經截止了"); return; } if(!f.name){ toast("請輸入藝名"); return; } if(nameBlock&&nameBlock(f.name)) return; if(!f.bd){ toast("請選生日"); return; } if(!f.fc){ toast("請填皮相"); return; } if(!f.photo||f.photo.startsWith("blob:")){ toast(f.photo?"照片還在上傳，等一下":"請放一張大頭照"); return; } if(f.intro.length<20){ toast("自我介紹・設定再多寫一點"); return; }
      if(svEntries().some(x=>x.email!==myEmail()&&x.name.toLowerCase()===f.name.toLowerCase())||GROUPS.some(g=>g.name.toLowerCase()===f.name.toLowerCase())){ toast("這個名字已經有人用了"); return; }
      const L=S.get(SVE,[])||[], me=myEmail(), i=L.findIndex(x=>x.sid===s.id&&x.email===me&&!x.out), row={name:f.name,bd:f.bd,co:f.co,fc:f.fc,photo:f.photo,intro:f.intro};
      if(i>=0) L[i]={...L[i],...row,edited:Date.now()}; else L.push({id:uid("sve"),sid:s.id,email:me,ts:Date.now(),...row}); S.set(SVE,L); ui.svF=null; layer.innerHTML=""; rr(); toast(i>=0?"已儲存":"報名完成，招募結束後開始投票"); return; }
    case "svQuit": { ask("確定要取消報名嗎？",()=>{ const L=(S.get(SVE,[])||[]).map(x=>x.sid===(s||{}).id&&x.email===myEmail()?{...x,out:Date.now()}:x); S.set(SVE,L); layer.innerHTML=""; rr(); toast("已取消報名"); }); return; }
    case "svNew": { if(!isAdminAcct()) return; const now=Date.now(), no=(S.get("daisuki_sv_no",0)||0)+1; S.set("daisuki_sv_no",no); S.set(SVS,{id:"sv"+now.toString(36),no,g:t.dataset.v,ph:"recruit",t0:now,t0s:{recruit:now},end:now+SV_DUR.recruit*864e5,prepW:3}); S.set("daisuki_sv_theme",t.dataset.v); rr(); toast("新一季開始招募了"); return; }
    case "svNext": { ask(s&&s.ph==="recruit"?"現在就結束招募、開始第一輪嗎？（真人不到 "+SV_MIN+" 位也會開始）":"現在就公布這一輪的結果嗎？",()=>{ svAdvance(true); rr(); toast("已公布"); }); return; }
    case "svPrepW": { S.set(SVS,{...s,prepW:(s.prepW||3)===3?4:3,...(s.ph==="prep"?{end:(s.t0||Date.now())+((s.prepW||3)===3?4:3)*7*864e5}:{})}); rr(); return; }
    case "svDone": { S.set(SVS,{...s,ph:"done",end:0}); rr(); return; }
    case "svEnd": { ask("確定要取消這一季嗎？報名、票數都會清掉。",()=>{ S.set(SVS,null); rr(); toast("已取消"); }); return; }
    case "svBonus": { const x=svById(t.dataset.v); tieModal(`幫 ${esc(x?x.name:"")} 加分`,`<p class="fy-info">任務表現好的，在這一輪加分票（可以打負數扣掉）</p><input id="svBn" class="a-nick-in" type="number" inputmode="numeric" placeholder="例：100">`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="svBonusOk" data-v="${t.dataset.v}">加上去</button>`); return; }
    case "svBonusOk": { const n=Math.round(+((document.getElementById("svBn")||{}).value||0)); if(!n||!s) return; const B={...(s.bonus||{})}; B[s.ph]={...(B[s.ph]||{})}; B[s.ph][t.dataset.v]=(B[s.ph][t.dataset.v]||0)+n; S.set(SVS,{...s,bonus:B}); layer.innerHTML=""; rr(); toast("已加分"); return; }
    case "svKick": { ask("要把這位從選秀移除嗎？",()=>{ S.set(SVE,(S.get(SVE,[])||[]).map(x=>x.id===t.dataset.v?{...x,out:Date.now()}:x)); rr(); }); return; }
    case "svRevealGo": { layer.innerHTML=""; navTo("#/fan/core?p=survival"); return; }
    case "svDebutApply": { if(s&&s.demo){ toast("示範：出道組會在這裡填團體出道申請"); return; } const me=svMyEntry(); if(!s||!me||!(s.debut||[]).includes(me.id)) return; const all=svAll(), others=(s.debut||[]).filter(id=>id!==me.id).map(id=>all.find(x=>x.id===id)).filter(Boolean);
      ui.dbF={kind:"group",name:me.name,gname:"",bd:me.bd,co:me.co||"",mems:others.map(x=>({name:x.name,acc:acctUser(x.email),bd:x.bd})),teaser:"",tPrev:"",mv:null,mPrev:"",busy:"",sv:s.id,ltd:SV_LTD}; debutForm(); return; }
  } },true);
