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
const svReal=()=>{ const x=S.get(SVS,null); return x&&x.ph!=="x"?x:null; };   /* 取消的季留一個 ph:"x" 的記號，同步回來才不會又冒出來 */
/* 公司：管理員建帳號時設定（daisuki_acc_co），本人不能自己選；沒設定＝個人練習生 */
const SV_CO="daisuki_acc_co", svCoOf=em=>((S.get(SV_CO,{})||{})[String(em||"").toLowerCase()])||"";
const svIsArtist=em=>{ const a=ACCOUNTS[String(em||"").toLowerCase()]||{}; return a.role==="artist"||!!a.member; };
const SV_SK=["Vocal","Dance","Rap","Visual"];
const svSeason=()=>ui.svDemo&&svDemoOk()?svDemoSeason():svReal();
const svOpen=()=>sbxOn()||svDemoOk()||!!S.get(K.svOpen,false)||String((session()||{}).email||"").toLowerCase()==="husay";
const svTheme=()=>{ const s=svSeason(); return s&&s.g?(s.g==="g"?"g":"b"):S.get("daisuki_sv_theme","g")==="b"?"b":"g"; };
const svEntries=()=>{ const s=svSeason(); if(s&&s.demo){ const D=SV_DEMO_N.map((n,i)=>({id:"dm"+i,name:n,co:i%3?"Lumière Ent.":"",email:"demo"+i,seat:[1,4,2,9,7,12,15,3,20,11,6,24][i],ps:"示範用的練習生。個性開朗，熟了之後很吵。",sk:[SV_SK[i%3]],msg:"請多多指教！我會努力到最後一刻。",sp:{r1:"真的沒想到能晉級，謝謝每一位國民製作人！",r2:"這兩週好幾次想放棄，是你們的票把我留下來的。",final:"謝謝你們讓我站上這裡，出道後我會更努力。"}})); return s.ph==="recruit"?D.slice(0,6):D; } return s?(S.get(SVE,[])||[]).filter(e=>e.sid===s.id&&!e.out):[]; };
const svMyEntry=()=>{ const me=myEmail(); return svEntries().find(e=>e.email===me)||null; };
/* 全部參賽者：真人＋虛擬（虛擬從第一輪開始出現，補到 24 位） */
function svAll(){ const s=svSeason(); if(!s) return []; const R=svEntries().map(e=>({...e,real:1,co:s.demo?e.co:svCoOf(e.email)}));
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
const SV_SP={r1:["沒想到能留下來，謝謝國民製作人！","我會帶著這份心意更努力。","下一輪一定會讓大家看到更好的我。","謝謝一直相信我的你們。"],r2:["這兩週真的很辛苦，謝謝你們沒有放開我的手。","離夢想更近一步了，我不會辜負這些票。","謝謝一起練習的大家，沒有你們就沒有我。","每一票我都記在心裡。"],final:["謝謝國民製作人讓我出道，我會用一年半回報你們。","從練習生到今天，謝謝你們一路陪我。","我們的故事現在才開始。","我會成為讓大家驕傲的歌手。"]};
const svSpeech=(t,st)=>{ const x=((t&&t.sp)||{})[st]; if(x) return x; const L=SV_SP[st]||SV_SP.r1; return t&&!t.real?L[svHash(t.id+st)%L.length]:""; };
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
function svTick(){ try{ svLtdTick(); }catch(e){} try{ const s=svReal(); if(!s||!isAdminAcct()||!s.end||Date.now()<s.end) return; svAdvance(false); }catch(e){} }
/* 限定團體到期（出道日＋一年半）：團員的帳號變回一般粉絲帳號，團留著當紀錄 */
function svLtdTick(){ if(!isAdminAcct()) return; const L=getDebut(), now=Date.now(); let ch=0;
  const L2=L.map(x=>{ if(!x||!x.ltd||x.ltdOff||x.status!=="ok") return x; const st=x.day||x.appr||x.ts||now; if(now<st+x.ltd*864e5) return x; dbEms(x).forEach(e=>{ try{ unbindArtist(e); }catch(er){} }); ch=1; return {...x,ltdOff:now}; });
  if(ch){ S.set(K.debut,L2); feedPush&&feedPush({kind:"core",self:true,text:"限定團體活動期間結束，團員帳號已變回一般粉絲帳號"}); } }
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

/* ---------- 粉絲：排名發表（每一次發表，第一次打開 App 時跳出來）
   照 PRODUCE 的發表：從後面的名次一位一位叫上台 → 1位候補 → 3位、2位、1位（C位，永遠在三角形最上面）→ 最後一席候補 → 最後一席 ---------- */
function svRevealCheck(){ try{ const s=svReal(); if(!s||!s.ann||!svOpen()) return; const seen=S.get(acK("daisuki_sv_seen"),{})||{}; const st=["final","r2","r1"].find(k=>s.ann[k]&&!seen[s.id+k]); if(!st||layer.innerHTML) return;
  seen[s.id+st]=Date.now(); S.set(acK("daisuki_sv_seen"),seen); svReveal(st); }catch(e){} }
const svMine=()=>{ const s=svSeason(); return s&&s.demo?(ui.svDV||{}):(S.get(acK("daisuki_sv_my"),{})||{}); };
/* 三角形：1、2、3…一排比一排多；最後一排太少就併到上一排（7 位＝1・2・4） */
function svRows(n){ const R=[]; let k=1; while(n>0){ const c=Math.min(k,n); R.push(c); n-=c; k++; } if(R.length>1&&R[R.length-1]<R[R.length-2]&&R[R.length-1]+R[R.length-2]<=6){ const l=R.pop(); R[R.length-1]+=l; } return R; }
const svPyr=(ids,tile)=>{ let i=0; return svRows(ids.length).map(c=>`<div class="sv2-r">${ids.slice(i,i+c).map((id,j)=>tile(id,i+j)).join("")}${(i+=c,"")}</div>`).join(""); };
const svTile=(t,b,sub,me,tag)=>`<${tag||"button"} class="sv2-t ${me?"me":""}" ${tag?"":`data-a="uniGo" data-v="#/fan/core?p=survival&id=${t.id}"`}><span class="sv2-p">${svPh(t)}</span><b>${b}</b><span>${esc(t.name)}</span>${sub!=null?`<small>${sub}</small>`:""}</${tag||"button"}>`;
const svHero=(rib,chip,body,foot)=>`<section class="sv2-pyr"><div class="sv2-rib"><span>SURVIVAL PROJECT</span><span>${rib}</span></div>${chip?`<span class="sv2-date">${chip}</span>`:""}<div class="sv2-rows"><i class="sv2-crown">👑</i>${body}</div><div class="sv2-foot">${foot}</div></section>`;
const svBar=L=>`<div class="sv2-bar">${L.map(([b,s])=>`<div><b>${b}</b><span>${s}</span></div>`).join("")}</div>`;
function svReveal(st){ const s=svSeason(); if(!s) return; const all=svAll(), T=id=>all.find(x=>x.id===id)||{id,name:"?"}, rk=(s.rk||{})[st]||[], K=st==="final"?(s.debut||[]):((s.keep||{})[st]||[]), n=K.length, my=svMine(), tok=ui.svxT=Date.now();
  const title=st==="final"?"出道組發表":st==="r1"?"第一次排名發表":"第二次排名發表";
  const seat=(id,i)=>`<div class="sv2-t svx-e" data-r="${i}"><span class="sv2-p"><i class="sv2-sil"></i></span><b>${i+1}位</b><span>？</span></div>`;
  setLayer(`<div class="svx sv2 ${svTheme()} ${n>10?"many":""}" role="dialog" aria-label="${title}"><section class="sv2-pyr"><div class="sv2-rib"><span>SURVIVAL PROJECT</span><span>${title}</span></div><span class="sv2-date">${st==="final"?`出道 ${n} 位`:`晉級 ${n} 位`}</span>
    <div class="svx-call"><small>${st==="final"?"出道的是…":"晉級的是…"}</small><b>　</b></div><div class="sv2-rows"><i class="sv2-crown">👑</i>${svPyr(K,seat)}</div><div class="sv2-foot">《1位～${n}位》</div></section>
    <div class="svx-a"><button class="s" data-a="svxSkip">跳過</button></div></div>`,"svx");
  const L=()=>layer.querySelector(".svx"), call=(sm,b,html)=>{ const c=L()&&L().querySelector(".svx-call"); if(!c) return; c.classList.remove("pop"); void c.offsetWidth; c.innerHTML=`<small>${sm}</small>${html||`<b>${b}</b>`}`; c.classList.add("pop"); };
  const fill=i=>{ const el=L()&&L().querySelector(`[data-r="${i}"]`); if(!el||!el.classList.contains("svx-e")) return; const t=T(K[i]); el.className=`sv2-t svx-in ${my[t.id]?"me":""}`; el.innerHTML=`<span class="sv2-p">${svPh(t)}</span><b>${i+1}位</b><span>${esc(t.name)}</span>`; try{ navigator.vibrate&&navigator.vibrate(i?18:[30,40,60]); }catch(e){} };
  const cands=(ids,win,sm)=>call(sm,"",`<div class="svx-cands">${ids.map(id=>svTile(T(id),"",esc(T(id).co||"個人練習生"),0,"div").replace('class="sv2-t ',`data-c="${id}" class="sv2-t `)).join("")}</div>`);
  const pick=win=>{ const c=L(); if(!c) return; c.querySelectorAll("[data-c]").forEach(x=>x.classList.add(x.dataset.c===win?"win":"lose")); };
  const Q=[], step=(f,ms)=>Q.push([f,ms]), say=i=>step(()=>{ const t=T(K[i]), sp=svSpeech(t,st); call(i===0?(st==="final"?"C位・1位":"1位"):`${i+1}位`,"",`<b>${esc(t.name)}</b>${sp?`<p class="svx-sp">「${esc(sp)}」</p>`:""}`); fill(i); },i===0?3400:(svSpeech(T(K[i]),st)?2400:1500));
  step(()=>call(title,st==="final"?"出道組是…":"現在開始發表"),1500);
  if(n>=5){ for(let i=n-2;i>=3;i--) say(i);
    step(()=>cands(K.slice(0,3).sort((a,b)=>svHash(a)-svHash(b)),"","1位候補"),2600); say(2); say(1); say(0);
    const lc=[K[n-1],...rk.filter(id=>!K.includes(id)).slice(0,2)].sort((a,b)=>svHash(a)-svHash(b));
    step(()=>cands(lc,K[n-1],"最後一席候補"),2200); step(()=>pick(K[n-1]),1100); say(n-1);
  } else for(let i=n-1;i>=0;i--) say(i);
  const done=()=>{ const c=L(); if(!c) return; for(let i=0;i<n;i++) fill(i); const out=Object.keys(my).filter(id=>rk.includes(id)&&!K.includes(id)).map(id=>T(id).name);
    call(title,"",`<b>${st==="final"?`恭喜 ${n} 位出道`:`${n} 位晉級`}</b>${out.length?`<span class="svx-out">${out.map(esc).join("、")} 這次沒有晉級</span>`:""}`);
    c.querySelector(".svx-a").innerHTML=`<button class="s" data-a="tCloseLayer">好</button><button class="m" data-a="svRevealGo">看完整排名</button>`;
    try{ confetti(innerWidth/2,innerHeight*.3,{n:90,cols:svTheme()==="g"?["#FF4F9A","#FFFFFF","#FFD6E8","#FF9CC6"]:["#2E7BEF","#FFFFFF","#CFE2FF","#8DBBFF"]}); const cf=document.getElementById("confetti"); if(cf) cf.style.zIndex="310"; }catch(e){} };
  ui.svxDone=done; let k=0; const go=()=>{ if(ui.svxT!==tok||!L()) return; if(k>=Q.length){ done(); return; } const [f,ms]=Q[k++]; f(); setTimeout(go,ms); }; setTimeout(go,500); }

/* ---------- 比賽流程（照 PRODUCE：選座位 → 等級評價・主題曲 → 組別對決 → 第一次發表 → Position 評價 → 概念評價 → 第二次發表 → 出道評價 → 出道發表） ---------- */
const SV_FLOW=[
  ["recruit","招募・選座位","1 週",["填報名：名字、生日、大頭照、個性、擅長、想對國民製作人說的話","選座位：金字塔 1～24 號，1 號在最頂端，先選先贏"],["看看有誰報名，招募結束就開始投票"]],
  ["r1","第一輪：等級評價・主題曲・組別對決","2 週",["第 1 週 等級評價：在社群發一段自我介紹舞台（唱、跳、才藝都可以），管理員評 A～F 等級","主題曲：大家一起練同一首主題曲，照等級分班","第 2 週 組別對決：分組翻唱同一首歌，兩組對決，贏的那組每人拿加分票","寫好「第一次排名發表」的感言"],["每天 3 票，可以分給不同人，也可以全投同一位","發表時前 15 位晉級"]],
  ["r2","第二輪：Position 評價・概念評價","2 週",["第 1 週 Position 評價：從 Vocal／Dance／Rap 選一個位置組隊表演，每個位置第一名拿加分票","第 2 週 概念評價：分組表演新曲概念舞台，第一名的組拿加分票","寫好「第二次排名發表」的感言"],["每天 3 票","發表時前 10 位進決賽"]],
  ["final","決賽：出道評價","1 週",["剩下的人分兩組，各表演一首決賽曲","寫好出道感言（沒出道的話不會公開）"],["決賽每天只能投 1 位","前 7 位出道"]],
  ["prep","出道準備","3～4 週",["出道組自己選出道曲、拍 MV、決定隊內定位","一位代表填團體出道申請，核准後照一般流程出道"],["限定團體，出道後活動一年半"]]];
function svFlowHtml(s){ const cur=s.ph==="done"?"prep":s.ph, ci=SV_FLOW.findIndex(f=>f[0]===cur), f=SV_FLOW[ci]||SV_FLOW[0], me=svMyEntry(), trainee=!!me&&(s.ph==="recruit"||svAlive().has(me.id)||(s.debut||[]).includes(me.id));
  const ann={r1:"第一次排名發表",r2:"第二次排名發表",final:"出道組發表"};
  return `<section class="sv3-flow"><div class="sv2-sh"><b>比賽流程</b><i>${s.g==="b"?"男團":"女團"}第 ${s.no||1} 季</i></div><ol>${SV_FLOW.map((x,i)=>`<li class="${i<ci?"done":i===ci?"on":""}"><b>${x[1]}</b><small>${x[2]}</small></li>${ann[x[0]]?`<li class="an ${i<ci?"done":""}"><b>${ann[x[0]]}</b></li>`:""}`).join("")}</ol>
    <div class="sv3-ms"><b>${trainee?"練習生這一輪要做的事":"這一輪在做什麼"}</b><ul>${(trainee?f[3]:[...f[3].slice(0,-1),...f[4]]).map(t=>`<li>${t}</li>`).join("")}</ul>
    ${trainee&&ann[s.ph]?`<button class="sv2-cta sm" data-a="svSpeak">${(me.sp||{})[s.ph]?"修改":"寫"}${s.ph==="final"?"出道感言":ann[s.ph]+"的感言"}</button>`:""}</div></section>`; }

/* ---------- 頁面 ---------- */
function viewSurvival(id){ const s=svSeason(), th=svTheme(), hd=coreHead(id?"練習生":"選秀");
  const pre=svOpen()?"":`<p class="sv-closed">目前沒有開放，這是管理員預覽</p>`;
  if(!s) return hd+`<main class="page sv2 ${th}">${pre}${svHero("下一季準備中","",svPyr([0,1,2,3,4,5],(x,i)=>`<div class="sv2-t svx-e"><span class="sv2-p"><i class="sv2-sil"></i></span><b>${i+1}位</b><span>？</span></div>`),"《COMING SOON》")}${svDemoOk()?`<button class="sv2-cta" data-a="svDemo" data-v="recruit">看示範</button>`:""}</main>`;
  if(id) return hd+svProfile(id);
  const dm=s.demo?`<div class="sv3-dm">${[["recruit","招募"],["r1","第一輪"],["a:r1","第一次發表"],["r2","第二輪"],["a:r2","第二次發表"],["final","決賽"],["a:final","出道發表"],["prep","出道準備"],["","結束示範"]].map(([k,l])=>`<button class="${k===s.ph?"on":""} ${k[0]==="a"?"an":""}" data-a="svDemo" data-v="${k}">${l}</button>`).join("")}</div>`:"";
  return hd+`<main class="page sv2 ${th}">${s.demo?"":pre}${s.ph==="recruit"?svRecruitHtml(s):svVoting()?svVoteHtml(s):svAfterHtml(s)}${dm}</main>${svVoting()?svBasketHtml():""}`; }
const svCd=s=>svLeftTxt((s.end||0)-Date.now());
const svBase=()=>{ const d=new Date(); d.setMinutes(0,0,0); return `${d.getMonth()+1}/${d.getDate()} ${pad(d.getHours())}:00 基準`; };
const svSeats=()=>{ const M={}; [...svEntries()].sort((a,b)=>(a.ts||0)-(b.ts||0)).forEach(e=>{ if(e.seat&&!M[e.seat]) M[e.seat]=e; }); return M; };
const svSeatHtml=(M,me,pick)=>`<div class="sv3-seats">${svPyr(Array.from({length:SV_N},(x,i)=>i+1),(n)=>{ const e=M[n], mine=me&&e&&e.email===me, sel=pick===n;
  return `<${pick!==undefined?"button":"div"} class="sv2-t ${e?"":"svx-e"} ${mine||sel?"me":""}" ${pick!==undefined&&(!e||mine)?`data-a="svSeat" data-v="${n}"`:pick!==undefined?"disabled":""}><span class="sv2-p">${e?svPh(e):`<i class="sv2-sil"></i>`}</span><b>${n}</b><span>${e?esc(e.name):sel?"我":"空位"}</span></${pick!==undefined?"button":"div"}>`; })}</div>`;
function svRecruitHtml(s){ const E=svEntries(), me=svMyEntry(), art=(session()||{}).role!=="fan"||svIsArtist(myEmail());
  return svHero(`練習生招募・截止倒數 ${svCd(s)}`,`${s.g==="g"?"女團":"男團"}第 ${s.no||1} 季`,svSeatHtml(svSeats(),me&&me.email),`《報名 ${E.length} 位》`)
    +svBar([[`${E.length} 位`,"已報名"],[`TOP ${SV_DEB}`,"出道組"],["1.5 年","限定團體"]])
    +(art?"":`<button class="sv2-cta" data-a="svApply">${me?"修改報名資料":"報名參加"}</button>`)+svFlowHtml(s)
    +(E.length?`<div class="sv2-sh"><b>已報名</b><i>${E.length} 位</i></div>${E.map(e=>`<div class="sv2-row" data-a="uniGo" data-v="#/fan/core?p=survival&id=${e.id}"><span class="sv2-av">${svPh(e)}</span><div class="sv2-nm"><b>${esc(e.name)}</b><small>${esc(e.co||"個人練習生")}</small></div></div>`).join("")}`:""); }
function svVoteHtml(s){ const sc=svScores(), rk=svRank(), all=svAll(), my=svMine(), B=ui.svB||{}, cut=s.ph==="r1"?SV_KEEP.r1:s.ph==="r2"?SV_KEEP.r2:SV_DEB, T=id=>all.find(x=>x.id===id)||{id};
  const row=(id,i)=>{ const x=T(id), c=B[id]||0; return `<div class="sv2-row" data-a="uniGo" data-v="#/fan/core?p=survival&id=${id}"><span class="sv2-rk">${i+1}位</span><span class="sv2-av">${svPh(x)}</span><div class="sv2-nm"><b>${esc(x.name)}</b><small>${esc(x.co||"個人練習生")}・${fmt(sc[id]||0)} 票</small></div><button class="sv2-pk ${c?"on":""}" data-a="svPick" data-v="${id}">${c?`PICK ×${c}`:"PICK"}</button></div>`; };
  const top=rk.slice(0,10), mine=Object.keys(my).filter(id=>rk.includes(id)).length;
  return svHero(`${s.ph==="final"?"出道組選拔":SV_PH[s.ph]}・${s.ph==="final"?"出道":"排名"}發表倒數 ${svCd(s)}`,svBase(),svPyr(top,(id,i)=>svTile(T(id),`${i+1}位`,fmt(sc[id]||0),my[id])),`《1位～${top.length}位》`)
    +svBar([[`${svLeft()} / ${svCap()}`,"今天還能 PICK"],[`TOP ${cut}`,s.ph==="final"?"出道組":"晉級"],[`${mine} 位`,"我的 PICK"]])
    +`<div class="sv2-sh"><b>${s.ph==="final"?"出道組":"晉級圈"}</b><i>1～${cut} 位</i></div>${rk.slice(0,cut).map(row).join("")}`
    +(rk.length>cut?`<div class="sv2-sh out"><b>淘汰邊緣</b><i>${cut+1} 位以下</i></div>${rk.slice(cut).map((id,i)=>row(id,i+cut)).join("")}`:"")+svFlowHtml(s); }
function svBasketHtml(){ const B=ui.svB||{}, n=Object.values(B).reduce((a,b)=>a+b,0), all=svAll(); if(!n) return "";
  return `<div class="sv3-bk ${svTheme()}"><div class="sv3-bkl">${Object.entries(B).filter(([,c])=>c).map(([id,c])=>`<button data-a="svUnpick" data-v="${id}">${esc((all.find(t=>t.id===id)||{}).name||"")}${c>1?` ×${c}`:""}<i>✕</i></button>`).join("")}</div><button class="sv3-go" data-a="svSend">送出 ${n} 票</button></div>`; }
function svAfterHtml(s){ const all=svAll(), D=s.debut||[], T=id=>all.find(x=>x.id===id)||{id,name:"?"}, me=svMyEntry(), win=s.demo||me&&D.includes(me.id), db=s.demo?null:getDebut().find(x=>x.sv===s.id&&x.status!=="gone"), g=db&&db.gid&&groupOf(db.gid), my=svMine();
  return svHero(s.ph==="prep"?`出道準備・出道倒數 ${svCd(s)}`:"限定團體活動中",g?esc(g.name):"限定團體",svPyr(D,(id,i)=>svTile(T(id),i?`${i+1}位`:"C位",null,my[id])),`《出道組 ${D.length} 位》`)
    +svBar([[`${D.length} 位`,"出道組"],[s.ph==="prep"?`${s.prepW||3} 週`:"活動中",s.ph==="prep"?"出道準備":"限定團體"],["1.5 年","活動期間"]])
    +(win&&s.ph==="prep"?(db?`<p class="sv2-note">出道申請${db.status==="wait"?"審核中":db.status==="pre"?`已核准・${mdTxt(db.day)} 出道`:db.status==="ok"?"已出道":"沒有通過，可以重新送出"}</p>${db.status==="no"?`<button class="sv2-cta" data-a="svDebutApply">重新填出道申請</button>`:""}`:`<button class="sv2-cta" data-a="svDebutApply">填團體出道申請</button><p class="sv2-note">出道曲、MV、隊內定位都在這裡填，選一位代表送出</p>`):"")+svFlowHtml(s); }
function svProfile(id){ const s=svSeason(), x=svById(id); if(!x) return `<main class="page"><p class="me-none">找不到這位練習生</p></main>`;
  const sc=svScores(), rk=svRank(), r=rk.indexOf(id)+1, my=svMine()[id]||0, alive=svAlive().has(id), c=(ui.svB||{})[id]||0;
  return `<main class="page sv2 ${svTheme()}"><section class="sv2-prof"><div class="sv2-pp">${svPh(x)}</div>${r&&svVoting()?`<span class="sv2-no">${pad(r)}</span>`:""}<div class="sv2-pn"><small>${esc(x.co||"個人練習生")}</small><b>${esc(x.name)}</b></div></section>
    ${svVoting()?svBar([[alive?fmt(sc[id]||0):"—","這一輪票數"],[alive&&r?r+"位":"淘汰","目前順位"],[my,"我的 PICK"]]):""}
    ${x.seat?`<p class="sv2-note">選秀第一天坐在 ${x.seat} 號位</p>`:""}
    ${x.ps||x.intro?`<div class="sv2-sh"><b>個性</b></div><p class="sv3-intro">${esc(x.ps||x.intro)}</p>`:""}${(x.sk||[]).length?`<div class="sv2-sh"><b>擅長</b></div><div class="sv3-sk">${x.sk.map(k=>`<span>${esc(k)}</span>`).join("")}</div>`:""}
    ${x.msg?`<div class="sv2-sh"><b>想對國民製作人說的話</b></div><p class="sv3-intro">${esc(x.msg)}</p>`:""}
    ${[["r1","第一次排名發表"],["r2","第二次排名發表"],["final","出道感言"]].filter(([k])=>(s.ann||{})[k]&&((s.keep||{})[k]||[]).concat(k==="final"?s.debut||[]:[]).includes(id)&&svSpeech(x,k)).map(([k,l])=>`<div class="sv2-sh"><b>${l}</b></div><p class="sv3-intro">「${esc(svSpeech(x,k))}」</p>`).join("")}
    ${svVoting()&&alive?`<button class="sv2-cta" data-a="svPick" data-v="${id}" ${svLeft()-Object.values(ui.svB||{}).reduce((a,b)=>a+b,0)>0?"":"disabled"}>${c?`已選 ${c} 票・再 PICK 一次`:`PICK ${esc(x.name)}`}</button>`:""}</main>${svVoting()?svBasketHtml():""}`; }

/* ---------- 報名表（名字、生日、公司、照片、自我介紹） ---------- */
function svApplyForm(){ const e=svMyEntry()||{}, f=ui.svF||(ui.svF={name:e.name||"",bd:e.bd||"",photo:e.photo||"",seat:e.seat||0,ps:e.ps||e.intro||"",sk:[...(e.sk||[])],msg:e.msg||""}), s=svSeason()||{}, co=s.demo?"":svCoOf(myEmail());
  setLayer(`<div class="tiei svf sv2 ${svTheme()}"><header class="tiei-top"><button class="icon-btn" data-a="tCloseLayer" aria-label="關閉">${I.back}</button><b>${e.id?"修改報名資料":"練習生報名"}</b><span class="sh-sp"></span></header><div class="tiei-body">
    <section class="sv2-pyr svf-hd"><div class="sv2-rib"><span>SURVIVAL PROJECT</span><span>${s.g==="b"?"男團":"女團"}第 ${s.no||1} 季・練習生報名</span></div>
      <div class="sv2-rows"><div class="sv2-r"><button class="sv2-t svf-ph ${f.photo?"me":""}" data-a="svPhoto" aria-label="大頭照"><span class="sv2-p">${f.photo?`<img src="${esc(f.photo)}" alt="">`:`<i class="sv2-sil"></i>`}</span><b>${f.photo?"換照片":"＋ 大頭照"}</b><span>${esc(f.name)||"？"}</span></button></div></div><div class="sv2-foot">《PICK ME》</div></section>
    <label class="svf-l">名字</label><input id="svName" class="svf-in" maxlength="16" placeholder="選上就用這個名字出道" value="${esc(f.name)}">
    <label class="svf-l">生日</label><input id="svBd" class="svf-in" type="date" max="${ymdIn(Date.now())}" value="${esc(f.bd)}">
    <label class="svf-l">公司</label><p class="svf-co">${esc(co||"個人練習生")}</p>
    <label class="svf-l">選座位 <em>1 號在最頂端，先選先贏</em></label>${svSeatHtml(svSeats(),myEmail(),f.seat)}
    <label class="svf-l">個性</label><textarea id="svPs" class="svf-in" rows="3" maxlength="200" placeholder="例：慢熟，熟了之後很吵">${esc(f.ps)}</textarea>
    <label class="svf-l">擅長 <em>可以選很多個</em></label><div class="chips wrap co-chips">${SV_SK.map(k=>`<button class="chip ${f.sk.includes(k)?"on":""}" data-a="svSk" data-v="${k}">${k}</button>`).join("")}</div>
    <label class="svf-l">想對國民製作人說的話</label><textarea id="svMsg" class="svf-in" rows="3" maxlength="200" placeholder="輸入文字">${esc(f.msg)}</textarea>
    <button class="sv2-cta" data-a="svApplyOk">${e.id?"儲存":"送出報名"}</button>${e.id?`<button class="svf-quit" data-a="svQuit">取消報名</button>`:""}</div></div>`); }
const svKeep=()=>{ const f=ui.svF; if(!f) return; const v=id=>(document.getElementById(id)||{}).value; [["name","svName"],["bd","svBd"],["ps","svPs"],["msg","svMsg"]].forEach(([k,id])=>{ const x=v(id); if(x!=null) f[k]=x.trim(); }); };
/* 感言：每一輪發表前寫好，被叫到名字時顯示 */
function svSpeakForm(){ const s=svSeason(), me=svMyEntry(); if(!s||!me) return; const l=s.ph==="final"?"出道感言":s.ph==="r1"?"第一次排名發表的感言":"第二次排名發表的感言";
  tieModal(l,`<p class="fy-info">發表時叫到你的名字，就會出現這段話${s.ph==="final"?"（沒出道的話不會公開）":""}。</p><textarea id="svSp" class="a-nick-in dbx-ta" rows="4" maxlength="120" placeholder="輸入文字">${esc((me.sp||{})[s.ph]||"")}</textarea>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="svSpeakOk">儲存</button>`); }

/* ---------- 管理員（FOC → 選秀） ---------- */
function svAdminHtml(){ const s=svSeason(), E=svEntries();
  if(!s||s.ph==="done") return `<section class="card studio"><p class="ae-tip">${s?"上一季已經結束。":""}開一季新的選秀：先招募 1 週，真人不到 ${SV_MIN} 位會自動延長。</p><div class="ls-btns"><button class="btn btn-main" data-a="svNew" data-v="g">開新一季（女團）</button><button class="btn btn-soft" data-a="svNew" data-v="b">開新一季（男團）</button></div></section>`;
  const rk=svVoting()?svRank():[], sc=svVoting()?svScores():{}, all=svAll();
  return `<section class="card studio"><p class="ae-tip">${s.g==="g"?"女團":"男團"}第 ${s.no||1} 季・<b>${SV_PH[s.ph]}</b>${s.end?`・${new Date(s.end).toLocaleString()} 自動公布／進下一階段`:""}${s.ext?`・招募已延長 ${s.ext} 次（真人 ${E.length}／至少 ${SV_MIN}）`:""}</p>
    <div class="ls-btns">${s.ph!=="prep"?`<button class="btn btn-soft" data-a="svNext">現在就${s.ph==="recruit"?"結束招募":"公布"}</button>`:`<button class="btn btn-soft" data-a="svDone">出道完成，結束這一季</button>`}<button class="btn btn-soft" data-a="svPrepW">出道準備 ${s.prepW||3} 週</button><button class="btn btn-soft" data-a="svEnd">取消這一季</button></div></section>
    ${svVoting()?`<div class="section-h">這一輪排名・加分票</div><section class="card studio">${rk.map((id,i)=>{ const x=all.find(t=>t.id===id)||{}; return `<div class="sv2-row"><span class="sv2-rk">${i+1}</span><div class="sv2-nm"><b>${esc(x.name)}${x.real?"":"<small>（虛擬）</small>"}</b><small>${fmt(sc[id]||0)} 票</small></div><button class="btn btn-soft btn-sm" data-a="svBonus" data-v="${id}">加分</button></div>`; }).join("")}</section>`:""}
    ${E.length?`<div class="section-h">報名的人（${E.length}）</div><section class="card studio">${E.map(e=>`<div class="sv2-row"><div class="sv2-nm"><b>${esc(e.name)}</b><small>${esc(acctUser(e.email))}・${esc(e.co||"個人練習生")}</small></div><button class="btn btn-soft btn-sm" data-a="svKick" data-v="${e.id}">移除</button></div>`).join("")}</section>`:""}`; }

/* ---------- 動作 ---------- */
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a; if(!/^sv(Pick|Unpick|Send|Apply|ApplyOk|Photo|Co|Quit|New|Next|Done|PrepW|End|Bonus|BonusOk|Kick|RevealGo|DebutApply|Demo|xSkip|Seat|Sk|Speak|SpeakOk)$/.test(a)) return; e.stopImmediatePropagation();
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
    case "svDemo": { const v=t.dataset.v||""; if(v[0]==="a"){ const st=v.slice(2); ui.svDemo={r1:"r2",r2:"final",final:"prep"}[st]; ui.svB={}; rr(); svReveal(st); return; } ui.svDemo=v||null; ui.svB={}; ui.svDU=0; ui.svDV={}; rr(); window.scrollTo(0,0); return; }
    case "svxSkip": { ui.svxT=0; ui.svxDone&&ui.svxDone(); return; }
    case "svApply": { if(s&&s.demo){ ui.svF=null; svApplyForm(); return; } if((session()||{}).role!=="fan"||svIsArtist(myEmail())){ toast("藝人的帳號不能報名選秀"); return; } ui.svF=null; svApplyForm(); return; }
    case "svPhoto": { svKeep(); const inp=document.createElement("input"); inp.type="file"; inp.accept="image/*"; inp.onchange=async()=>{ const f0=inp.files&&inp.files[0]; if(!f0) return; const c=await cropImg(f0,{ratio:4/5,max:1080}); if(!c) return;
        try{ const b=await shrinkImg(c,1080); ui.svF.photo=URL.createObjectURL(b); svApplyForm(); if((svSeason()||{}).demo) return; const url=(HB_ON&&await hbImgUrl("sv_"+Date.now().toString(36)+".jpg",b))||await new Promise(res=>{ const rd=new FileReader(); rd.onload=()=>res(rd.result); rd.readAsDataURL(b); }); ui.svF.photo=url; svApplyForm(); }catch(er){ toast("這張圖讀不出來"); } }; pickClick(inp); return; }
    case "svSeat": { svKeep(); ui.svF.seat=+t.dataset.v; const y=(layer.querySelector(".tiei-body")||{}).scrollTop; svApplyForm(); const b2=layer.querySelector(".tiei-body"); if(b2) b2.scrollTop=y; return; }
    case "svSk": { svKeep(); const L=ui.svF.sk, k=t.dataset.v, i=L.indexOf(k); if(i>=0) L.splice(i,1); else L.push(k); const y=(layer.querySelector(".tiei-body")||{}).scrollTop; svApplyForm(); const b2=layer.querySelector(".tiei-body"); if(b2) b2.scrollTop=y; return; }
    case "svSpeak": { if(s&&s.demo){ toast("示範：練習生會在這裡寫感言"); return; } svSpeakForm(); return; }
    case "svSpeakOk": { const me=svMyEntry(), v=((document.getElementById("svSp")||{}).value||"").trim(); if(!me||!s) return; const L=(S.get(SVE,[])||[]).map(x=>x.id===me.id?{...x,sp:{...(x.sp||{}),[s.ph]:v}}:x); S.set(SVE,L); layer.innerHTML=""; rr(); toast("感言已儲存"); return; }
    case "svApplyOk": { svKeep(); const f=ui.svF; if(s&&s.demo){ ui.svF=null; layer.innerHTML=""; toast("示範：這樣就報名完成了（不會真的存）"); return; } if(!s||s.ph!=="recruit"){ toast("報名已經截止了"); return; } if(!f.name){ toast("請輸入名字"); return; } if(nameBlock&&nameBlock(f.name)) return; if(!f.bd){ toast("請選生日"); return; } if(!f.photo||f.photo.startsWith("blob:")){ toast(f.photo?"照片還在上傳，等一下":"請放一張大頭照"); return; } if(!f.seat){ toast("請選一個座位"); return; } if(svSeats()[f.seat]&&svSeats()[f.seat].email!==myEmail()){ toast("這個座位剛剛被選走了，換一個"); return; } if(f.ps.length<5){ toast("個性再多寫一點"); return; } if(!f.sk.length){ toast("請選擅長的"); return; } if(f.msg.length<5){ toast("想對國民製作人說的話再多寫一點"); return; }
      if(svEntries().some(x=>x.email!==myEmail()&&x.name.toLowerCase()===f.name.toLowerCase())||GROUPS.some(g=>g.name.toLowerCase()===f.name.toLowerCase())){ toast("這個名字已經有人用了"); return; }
      const L=S.get(SVE,[])||[], me=myEmail(), i=L.findIndex(x=>x.sid===s.id&&x.email===me&&!x.out), row={name:f.name,bd:f.bd,photo:f.photo,seat:f.seat,ps:f.ps,sk:f.sk,msg:f.msg};
      if(i>=0) L[i]={...L[i],...row,edited:Date.now()}; else L.push({id:uid("sve"),sid:s.id,email:me,ts:Date.now(),...row}); S.set(SVE,L); ui.svF=null; layer.innerHTML=""; rr(); toast(i>=0?"已儲存":"報名完成，招募結束後開始投票"); return; }
    case "svQuit": { ask("確定要取消報名嗎？",()=>{ const L=(S.get(SVE,[])||[]).map(x=>x.sid===(s||{}).id&&x.email===myEmail()?{...x,out:Date.now()}:x); S.set(SVE,L); layer.innerHTML=""; rr(); toast("已取消報名"); }); return; }
    case "svNew": { if(!isAdminAcct()) return; const now=Date.now(), no=(S.get("daisuki_sv_no",0)||0)+1; S.set("daisuki_sv_no",no); S.set(SVS,{id:"sv"+now.toString(36),no,g:t.dataset.v,ph:"recruit",t0:now,t0s:{recruit:now},end:now+SV_DUR.recruit*864e5,prepW:3}); S.set("daisuki_sv_theme",t.dataset.v); rr(); toast("新一季開始招募了"); return; }
    case "svNext": { ask(s&&s.ph==="recruit"?"現在就結束招募、開始第一輪嗎？（真人不到 "+SV_MIN+" 位也會開始）":"現在就公布這一輪的結果嗎？",()=>{ svAdvance(true); rr(); toast("已公布"); }); return; }
    case "svPrepW": { S.set(SVS,{...s,prepW:(s.prepW||3)===3?4:3,...(s.ph==="prep"?{end:(s.t0||Date.now())+((s.prepW||3)===3?4:3)*7*864e5}:{})}); rr(); return; }
    case "svDone": { S.set(SVS,{...s,ph:"done",end:0}); rr(); return; }
    case "svEnd": { ask("確定要取消這一季嗎？報名、票數都會清掉。",()=>{ S.set(SVS,{id:(s||{}).id||"",ph:"x",ts:Date.now()}); rr(); toast("已取消"); }); return; }
    case "svBonus": { const x=svById(t.dataset.v); tieModal(`幫 ${esc(x?x.name:"")} 加分`,`<p class="fy-info">任務表現好的，在這一輪加分票（可以打負數扣掉）</p><input id="svBn" class="a-nick-in" type="number" inputmode="numeric" placeholder="例：100">`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="svBonusOk" data-v="${t.dataset.v}">加上去</button>`); return; }
    case "svBonusOk": { const n=Math.round(+((document.getElementById("svBn")||{}).value||0)); if(!n||!s) return; const B={...(s.bonus||{})}; B[s.ph]={...(B[s.ph]||{})}; B[s.ph][t.dataset.v]=(B[s.ph][t.dataset.v]||0)+n; S.set(SVS,{...s,bonus:B}); layer.innerHTML=""; rr(); toast("已加分"); return; }
    case "svKick": { ask("要把這位從選秀移除嗎？",()=>{ S.set(SVE,(S.get(SVE,[])||[]).map(x=>x.id===t.dataset.v?{...x,out:Date.now()}:x)); rr(); }); return; }
    case "svRevealGo": { layer.innerHTML=""; navTo("#/fan/core?p=survival"); return; }
    case "svDebutApply": { if(s&&s.demo){ toast("示範：出道組會在這裡填團體出道申請"); return; } const me=svMyEntry(); if(!s||!me||!(s.debut||[]).includes(me.id)) return; const all=svAll(), others=(s.debut||[]).filter(id=>id!==me.id).map(id=>all.find(x=>x.id===id)).filter(Boolean);
      ui.dbF={kind:"group",name:me.name,gname:"",bd:me.bd,co:svCoOf(me.email),mems:others.map(x=>({name:x.name,acc:acctUser(x.email),bd:x.bd})),teaser:"",tPrev:"",mv:null,mPrev:"",busy:"",sv:s.id,ltd:SV_LTD}; debutForm(); return; }
  } },true);
