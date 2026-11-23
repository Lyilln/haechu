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
const SV_PH={recruit:"招募中",r1:"第一輪",r2:"第二輪",pr:"PR 週",final:"決賽",prep:"出道準備中",done:"已出道"};
const SV_DUR={recruit:7,r1:14,r2:14,pr:7,final:7};   /* 11/23 第二輪和決賽中間多一週「1 分鐘 PR」：不淘汰人，PR 現場票前三名拿加分票，這週的票也帶進決賽 */
const SV_KEEP={r1:15,r2:10}, SV_MIN=10, SV_N=24, SV_DEB=7, SV_LTD=548;   /* 一年半 ≒ 548 天 */
/* 虛擬練習生（女團第一季用；之後男團再加一份） */
const SV_NPC_G=[["n1","夏恩","Lumière Ent."],["n2","采律","Bloom Note"],["n3","雅琳","Starlit"],["n4","知秀","Velvet Moon"],["n5","若晴","Prism Works"],["n6","敏書","Aurora Lab"],["n7","詩妍","Cloud Nine"],["n8","晨熙","Blue Wave"],["n9","苡安","Neon Peak"],["n10","采昀","Zenith Arts"],["n11","佳恩","Moonlit Ent."],["n12","語彤","Star Horizon"],["n13","芮希","Petal & Co."],["n14","海音","Lumière Ent."],["n15","星語","Bloom Note"],["n16","沐晴","Velvet Moon"],["n17","以寧","Prism Works"],["n18","瑞恩","Aurora Lab"],["n19","知恩","Starlit"],["n20","芷寧","Cloud Nine"],["n21","安娜","Neon Peak"],["n22","娜妍","Zenith Arts"],["n23","采媛","Blue Wave"],["n24","瑟琪","Moonlit Ent."]];
const SV_NPC_B=[["m1","星宇","Star Horizon"],["m2","光賢","Neon Peak"],["m3","夏澄","Zenith Arts"],["m4","承恩","Blue Wave"],["m5","子安","Moonlit Ent."],["m6","時溫","Aurora Lab"],["m7","若川","Prism Works"],["m8","一然","Cloud Nine"],["m9","宇辰","Lumière Ent."],["m10","泰民","Bloom Note"],["m11","昊宇","Velvet Moon"],["m12","知勳","Starlit"],["m13","俊熙","Prism Works"],["m14","在允","Aurora Lab"],["m15","以恆","Cloud Nine"],["m16","承澤","Neon Peak"],["m17","道允","Zenith Arts"],["m18","海潤","Blue Wave"],["m19","瑞俊","Moonlit Ent."],["m20","晨宇","Star Horizon"],["m21","時延","Lumière Ent."],["m22","昇珉","Bloom Note"],["m23","圭賢","Velvet Moon"],["m24","嘉允","Starlit"]];
const svNpcL=g=>(g==="g"?SV_NPC_G:SV_NPC_B).map(([id,n,c])=>[id,npcN(n),c]);   /* 虛擬練習生撞到真人名字就換備用名字 */
/* 示範（只有 HUSSEY 的粉絲身分看得到）：假的一季，五個階段可以切換看；投票、報名都只在這次打開有效，不存 */
const svDemoOk=()=>{ try{ const x=session(); return !!x&&x.role==="fan"&&(String(x.email||"").toLowerCase()==="husay"||(typeof isHussey==="function"&&isHussey())||sbxOn()); }catch(e){ return false; } };   /* 11/18：正式站的帳號 email 不是 husay，改用 isHussey() 認 */
const SV_DEMO_N=["Yuna","Chaewon","Sieun","Hana","Ririka","Mina","Seoyeon","Nako","Jiwoo","Aria","Haeun","Rin"];
function svDemoSeason(){ const ph=ui.svDemo, now=Date.now(), E=SV_DEMO_N.map((n,i)=>"dm"+i), all=[...E,...svNpcL("g").slice(0,SV_N-E.length).map(x=>x[0])];
  return {id:"demo",demo:1,no:ui.svDemoNo||1,g:"g",ph,t0:now-2*864e5,end:now+(ph==="prep"?20:ph==="final"?5:ph==="recruit"?4:11)*864e5,npcN:SV_N-E.length,prepW:3,keep:{r1:all.filter((x,i)=>i%8!==7).slice(0,15),r2:E.slice(0,10)},debut:E.slice(0,7),rk:{r1:all,r2:E.slice(0,10),final:E.slice(0,10)},ann:{}}; }
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
const SVNP="daisuki_sv_npcph";   /* 虛擬練習生的照片（管理員一次上傳一批） */
const SV_BIG=["HYBE","SM","JYP","YG"];
const svNpcCo=i=>{ const C=(typeof SK_COS!=="undefined"?SK_COS:[]), B=C.filter(c=>SV_BIG.includes(c)), Sm=C.filter(c=>!SV_BIG.includes(c)); if(B.length&&(i===4||i===13)) return B[(i===4?0:1)%B.length]; return Sm.length?Sm[i%Sm.length]:"個人練習生"; };
function svAll(){ const s=svSeason(); if(!s) return []; const R=svEntries().map(e=>({...e,real:1,co:s.demo?e.co:svCoOf(e.email)}));
  if(s.ph==="recruit") return R; const P=(s.g==="g"?svNpcL("g"):svNpcL("b")).slice(0,Math.max(0,(s.npcN!=null?s.npcN:SV_N-R.length))).map(([id,name],i)=>({id,real:0,name,co:svNpcCo(i),photo:((S.get(SVNP,{})||{})[id])||""}));
  return [...R,...P]; }
const svVoting=()=>{ const s=svSeason(); return !!s&&["r1","r2","pr","final"].includes(s.ph); };
const svFinal=()=>{ const s=svSeason(); return !!s&&s.ph==="final"; };
const svCap=()=>svFinal()?1:3;
const svDayK=()=>{ const s=svSeason(); return (s?s.id+"|"+s.ph+"|":"")+new Date().toDateString(); };
const svUsed=()=>{ if((svSeason()||{}).demo) return ui.svDU||0; const r=S.get(acK("daisuki_sv_day"),{})||{}; return r.k===svDayK()?r.n||0:0; };
const svLeft=()=>Math.max(0,svCap()-svUsed());
const svToday=()=>svUsed();   /* 舊名字：別的地方還在用 */
const svTileSub=()=>{ const s=svSeason(); if(!s) return "還沒開始"; if(svVoting()){ const tr=svTrainee(s); if(tr) return svHid(s)?"排名保密中":`我現在第 ${svRank().indexOf(tr.id)+1} 位`; return svLeft()?`今天還有 ${svLeft()} 票`:"今天投完了"; } return SV_PH[s.ph]||""; };
/* 每位參賽者在「這一輪」的分數：真人＝粉絲的票＋管理員加分；虛擬＝每天自動長一點（跟著真人的平均走，比較自然） */
const SV_SP={r1:["沒想到能留下來，謝謝國民製作人！","我會帶著這份心意更努力。","下一輪一定會讓大家看到更好的我。","謝謝一直相信我的你們。"],r2:["這兩週真的很辛苦，謝謝你們沒有放開我的手。","離夢想更近一步了，我不會辜負這些票。","謝謝一起練習的大家，沒有你們就沒有我。","每一票我都記在心裡。"],final:["謝謝國民製作人讓我出道，我會用一年半回報你們。","從練習生到今天，謝謝你們一路陪我。","我們的故事現在才開始。","我會成為讓大家驕傲的歌手。"]};
const svSpeech=(t,st)=>{ const x=((t&&t.sp)||{})[st]; if(x) return x; const L=SV_SP[st]||SV_SP.r1; return t&&!t.real?L[svHash(t.id+st)%L.length]:""; };
const svHash=s=>{ let h=0; for(const c of String(s)) h=(h*31+c.charCodeAt(0))|0; return Math.abs(h); };
function svScores(ph){ const s=svSeason(); if(!s) return {}; ph=ph||s.ph; const V=s.demo?Object.fromEntries(SV_DEMO_N.map((n,i)=>["dm"+i,(12-i)*9+((ui.svDV||{})["dm"+i]||0)])):((S.get(SVV,{})||{})[s.id]||{})[ph]||{}, B=((s.bonus||{})[ph])||{}, all=svAll(), out={};
  const BN=svBenefit(ph), live=svAlive(ph), reals=all.filter(t=>t.real&&live.has(t.id)), avg=reals.length?reals.reduce((a,t)=>a+(V[t.id]||0)+(B[t.id]||0),0)/reals.length:0;
  const t0=(s.t0s||{})[ph]||s.t0||Date.now(), days=Math.max(1,Math.ceil((Math.min(Date.now(),(s.ends||{})[ph]||Date.now())-t0)/864e5));
  const VP=ph==='final'&&!s.demo?(((S.get(SVV,{})||{})[s.id]||{}).pr||{}):{}, BP=ph==='final'?svBenefit('pr'):{};   /* 決賽：PR 週的票和加分票一起帶進來 */
  all.forEach(t=>{ if(!live.has(t.id)) return; out[t.id]=t.real?(V[t.id]||0)+(B[t.id]||0)+(BN[t.id]||0)+(VP[t.id]||0)+(BP[t.id]||0):Math.round(days*(2+svHash(t.id+ph)%6)+avg*(.25+svHash(ph+t.id)%55/100))+(B[t.id]||0); });
  return out; }
/* 這一輪還在比的人 */
function svAlive(ph){ const s=svSeason(); if(!s) return new Set(); ph=ph||s.ph; const K0=s.keep||{};
  if(ph==="r1"||ph==="recruit") return new Set(svAll().map(t=>t.id)); if(ph==="r2") return new Set(K0.r1||[]); if(ph==="pr"||ph==="final") return new Set(K0.r2||[]); return new Set(K0.r2||[]); }
const svRank=ph=>{ const sc=svScores(ph); const sd=(svSeason()||{}).id||""; return Object.keys(sc).sort((a,b)=>sc[b]-sc[a]||svHash(sd+a)-svHash(sd+b)); };
const svById=id=>svAll().find(t=>t.id===id);
/* 星探用：正在參加選秀的人（報名中、還沒被淘汰、出道準備中的出道組）不能被私訊 */
function svInShow(em){ const s=svReal(); if(!s||s.ph==="done") return false; em=String(em||"").toLowerCase(); const e=(S.get(SVE,[])||[]).find(x=>x.sid===s.id&&!x.out&&String(x.email||"").toLowerCase()===em); if(!e) return false;
  const K=s.keep||{}; if(s.ph==="recruit"||s.ph==="r1") return true; if(s.ph==="r2") return (K.r1||[]).includes(e.id); if(s.ph==="pr"||s.ph==="final") return (K.r2||[]).includes(e.id); return (s.debut||[]).includes(e.id); }
const svPh=t=>t&&t.photo?`<img src="${esc(t.photo)}" alt="">`:`<i class="sv2-sil"></i>`;
const svLeftTxt=ms=>{ ms=Math.max(0,ms); const d=Math.floor(ms/864e5), h=Math.floor(ms%864e5/36e5); return d?`${d} 天 ${h} 時`:`${h} 時 ${Math.floor(ms%36e5/6e4)} 分`; };

/* ---------- 時間到了 → 公布（只在管理員的手機上算，大家看到的才會一樣） ---------- */
function svTick(){ try{ svLtdTick(); }catch(e){} try{ const s0=svReal(), n0=(S.get("daisuki_sv_doneN",0)||0)+1; if(s0&&s0.ph!=="done"&&s0.no!==n0&&isAdminAcct()) S.set(SVS,{...s0,no:n0}); }catch(e){} try{ svGrTick(); }catch(e){} try{ const s=svReal(); if(!s||!isAdminAcct()||!s.end||Date.now()<s.end) return; svAdvance(false); }catch(e){} }
/* 等級：任務交件期限一到，管理員的手機自動公布（等級評價→主題曲重新評價） */
function svGrTick(){ const s=svReal(); if(!s||s.ph!=="r1"||!isAdminAcct()) return; const d=(Date.now()-((s.t0s||{}).r1||s.t0||Date.now()))/864e5;
  for(const k of SV_GRK){ const m=svMsList("r1").find(x=>x.k===k); if(m&&d>=m.d[1]&&!(s.grPub||{})[k]&&(k==="lv"||(s.grPub||{}).lv)){ S.set(SVS,svGrPub(s,k)); return; } } }
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
    s.keep={...(s.keep||{}),r2:keep}; s.rk={...(s.rk||{}),r2:rk}; s.ann={...(s.ann||{}),r2:now}; nx("pr",SV_DUR.pr); S.set(SVS,s); return "pr"; }
  if(s.ph==="pr"){ nx("final",SV_DUR.final); S.set(SVS,s); return "final"; }   /* PR 週不淘汰、不發表 */
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
/* 等級評價 A～F（PRODUCE 的分班）：管理員在後台標；虛擬練習生自動給一個，管理員也可以改 */
const SV_GR=["A","B","C","D","F"];
const svGrade=t=>{ const s=svSeason(); if(!s||!t||s.ph==="recruit") return ""; if(s.demo) return svGrDemo(s)[t.id]||""; return (s.grade||{})[t.id]||""; };   /* 11/18：公布後才有，自動算，管理員不能改 */
const svGrB=(t,c)=>{ const g=svGrade(t); return g?`<i class="sv3-gr ${c||""} g${g}">${g}</i>`:""; };
const svTile=(t,b,sub,me,tag)=>`<${tag||"button"} class="sv2-t ${me?"me":""}" ${tag?"":`data-a="uniGo" data-v="#/fan/core?p=survival&id=${t.id}"`}><span class="sv3-av"><span class="sv2-p">${svPh(t)}</span>${svGrB(t)}</span><b>${b}</b><span>${esc(t.name)}</span>${sub!=null?`<small>${sub}</small>`:""}</${tag||"button"}>`;
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
  const Q=[], step=(f,ms)=>Q.push([f,ms]), say=i=>{ step(()=>{ const t=T(K[i]), sp=svSpeech(t,st); call(i===0?(st==="final"?"C位・1位":"1位"):`${i+1}位`,"",`<b>${esc(t.name)}</b>`); svFc(t,i,st,sp); },i===0?5200:(svSpeech(T(K[i]),st)?4600:3400)); step(()=>{ svFcOut(); fill(i); },900); };
  step(()=>call(title,st==="final"?"出道組是…":"現在開始發表"),1500);
  if(n>=5){ for(let i=n-2;i>=3;i--) say(i);
    const cam=(ids,lab,lines)=>{ ids.forEach((id,j)=>step(()=>svCam(T(id),lab,lines[j]||"",st),j?2300:3400)); step(()=>svFcOut(),600); };
    cam(K.slice(0,3).sort((a,b)=>svHash(a)-svHash(b)),st==="final"?"C位候補":"1位候補",[st==="final"?"出道組 C 位的候補，是這三位練習生。":"第 1 位的候補，是這三位練習生。","她是第二位候補。","最後一位候補。"]); say(2); say(1); say(0);
    const lc=[K[n-1],...rk.filter(id=>!K.includes(id)).slice(0,2)].sort((a,b)=>svHash(a)-svHash(b));
    cam(lc,"最後一席候補",[st==="final"?"最後一個出道位，是這三位其中一位。":"最後一個晉級名額，是這三位其中一位。","第二位候補。","第三位候補。"]); say(n-1);
  } else for(let i=n-1;i>=0;i--) say(i);
  const done=()=>{ const c=L(); if(!c) return; svFcOut(); for(let i=0;i<n;i++) fill(i); const out=Object.keys(my).filter(id=>rk.includes(id)&&!K.includes(id)).map(id=>T(id).name);
    call(title,"",`<b>${st==="final"?`恭喜 ${n} 位出道`:`${n} 位晉級`}</b>${out.length?`<span class="svx-out">${out.map(esc).join("、")} 這次沒有晉級</span>`:""}`);
    c.querySelector(".svx-a").innerHTML=`<button class="s" data-a="tCloseLayer">好</button><button class="m" data-a="svRevealGo">看完整排名</button>`;
    try{ confetti(innerWidth/2,innerHeight*.3,{n:90,cols:svTheme()==="g"?["#FF4F9A","#FFFFFF","#FFD6E8","#FF9CC6"]:["#2E7BEF","#FFFFFF","#CFE2FF","#8DBBFF"]}); const cf=document.getElementById("confetti"); if(cf) cf.style.zIndex="310"; }catch(e){} };
  ui.svxDone=done; let k=0; const go=()=>{ if(ui.svxT!==tok||!L()) return; if(k>=Q.length){ done(); return; } const [f,ms]=Q[k++]; f(); setTimeout(go,ms); }; setTimeout(go,500); }

/* ---------- 節目流程（照 PRODUCE）：主持人宣布任務 → 練習生交舞台 → 粉絲看舞台、投現場票 → 每個任務現場票前三名拿加分票
   導師給等級、寫評語；主持人、導師的名字在後台設定 ---------- */
const SV_MS={
  r1:[{k:"lv",t:"等級評價",d:[0,5],how:"一個人的自我介紹舞台：唱、跳、才藝都可以，30 秒～1 分鐘的影片（或照片＋介紹）。導師看完會給 A～F 等級。",host:"練習生們好！第一個任務是「等級評價」。每個人準備一段自我介紹舞台，導師們會給你們 A 到 F 的等級。"},
      {k:"th",t:"主題曲",d:[5,8],how:"照等級分班練主題曲，交一段主題曲練習影片。表現最好的人有機會站 C 位。",host:"等級出來了！接下來大家照班級練主題曲，主題曲 C 位就從你們之中選出來。"},
      {k:"gb",t:"組別對決",d:[8,14],team:1,how:"分組翻唱同一首歌，兩組對決。交舞台時填上你的組名。",host:"第一輪的最後一關是「組別對決」！兩組唱同一首歌，現場票高的那組拿加分票。"}],
  r2:[{k:"po",t:"Position 評價",d:[0,7],pos:1,how:"從 Vocal／Dance／Rap 選一個位置組隊表演，交舞台時選好你的位置。",host:"第二輪開始！這次是「Position 評價」，Vocal、Dance、Rap，選一個最能讓你發光的位置。"},
      {k:"co",t:"概念評價",d:[7,14],team:1,how:"分組表演全新的概念曲。交舞台時填上你的組名。",host:"下一個任務是「概念評價」，每一組都要表演一首全新的歌，讓國民製作人看到不一樣的你們。"}],
  pr:[{k:"pr",t:"1 分鐘 PR",d:[0,7],how:"交一支 1 分鐘的自我介紹或直拍（影片或照片＋介紹都可以）。國民製作人投出最喜歡的 PR，前三名拿加分票。這一週不淘汰人。",host:"決賽前，給每個人一分鐘！這週是「1 分鐘 PR」，用一分鐘讓國民製作人記住你。這週不淘汰任何人，好好表現吧！"}],
  final:[{k:"de",t:"出道評價",d:[0,7],team:1,how:"剩下的人分兩組，各表演一首決賽曲。交舞台時填上你的組名。",host:"終於到決賽了。這是最後一個舞台「出道評價」，國民製作人，請選出你們的出道組。"}]};
const SV_BEN=[50,30,20], SVST="daisuki_sv_stage", SVLV="daisuki_sv_live";
const svMsList=ph=>SV_MS[ph]||[];
const svMsNow=s=>{ const L=svMsList(s.ph); if(!L.length) return null; if(s.demo&&ui.svMk) return L.find(m=>m.k===ui.svMk)||L[0]; const d=(Date.now()-((s.t0s||{})[s.ph]||s.t0||Date.now()))/864e5; return L.find(m=>d<m.d[1])||L[L.length-1]; };
const svHostN=s=>(s&&s.host)||"國民製作人代表";
const svMentors=s=>(s&&s.mentors&&s.mentors.length?s.mentors:[{n:"Vocal 導師",r:"Vocal"},{n:"Dance 導師",r:"Dance"},{n:"Rap 導師",r:"Rap"}]);
function svStages(ph,mk){ const s=svSeason(); if(!s) return []; if(s.demo){ if(!mk) return svMsList(ph).reduce((o,m)=>o.concat(svStages(ph,m.k)),[]); const E=svEntries(); const D=(ui.svDemoSt||{})[mk]; return E.slice(0,8).map((e,i)=>({id:"ds"+mk+i,sid:"demo",ph,mk,tid:e.id,email:e.email,cap:"示範舞台",team:["A 組","B 組"][i%2],pos:SV_SK[i%3],live:40-i*4,...(i===0&&D?D:{})})).filter(x=>(svAlive(ph)).has(x.tid)&&!(ui.svDemoT&&x.tid===E[0].id&&!D&&mk===(svMsNow(s)||{}).k)); }   /* 示範練習生（第一位）這個任務一開始還沒交，可以自己試交 */
  return (S.get(SVST,[])||[]).filter(x=>x.sid===s.id&&x.ph===ph&&(!mk||x.mk===mk)&&!x.del); }
const svLive=x=>(x.live||0)+(((S.get(SVLV,{})||{})[x.id])||0)+((ui.svDL||{})[x.id]||0);
const svMyLv=()=>{ const s=svSeason(); return s&&s.demo?(ui.svDLm||{}):(S.get(acK("daisuki_sv_lv"),{})||{}); };
/* 現場票前三名的加分票（這一輪每個任務各算一次） */
function svBenefit(ph){ const out={}; svMsList(ph).forEach(m=>{ svStages(ph,m.k).slice().sort((a,b)=>svLive(b)-svLive(a)).slice(0,3).forEach((x,i)=>{ if(svLive(x)>0) out[x.tid]=(out[x.tid]||0)+SV_BEN[i]; }); }); return out; }
const SV_MIC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
const svHost=(s,txt)=>`<section class="sv3-host"><span class="sv3-hav">${SV_MIC}</span><div><small>${esc(svHostN(s))}</small><p>${txt}</p></div></section>`;
function svHostTxt(s){ if(s.ph==="recruit") return "國民製作人們好！新一季的練習生正在報名中，招募結束後，就請大家幫喜歡的練習生投下寶貴的一票。";
  if(s.ph==="prep") return "恭喜出道組！謝謝國民製作人一路陪伴，出道那天，我們舞台上見！";
  if(s.ph==="done") return "謝謝國民製作人一路陪伴，限定團體活動中，請繼續支持她們！"; const m=svMsNow(s); return m?m.host+"舞台上傳後，國民製作人記得來看、投現場票！":""; }
/* 舞台：粉絲看、投現場票（每個任務一人一票） */
function svStageHtml(s){ const L=svMsList(s.ph); if(!L.length) return ""; const now=svMsNow(s), mk=ui.svMk&&L.some(m=>m.k===ui.svMk)?ui.svMk:now.k, m=L.find(x=>x.k===mk), all=svAll(), lv=svMyLv()[s.id+mk], St=svStages(s.ph,mk).slice().sort((a,b)=>svLive(b)-svLive(a)||svHash(a.id)-svHash(b.id));
  const tr=svTrainee(s), mine=tr&&mk===now.k?svStages(s.ph,mk).find(x=>x.tid===tr.id):null;
  const myCard=tr&&mk===now.k?`<section class="sv5-mys">${mine?`<button class="sv5-myt" data-a="svStage" data-v="${mine.id}">${mine.url?(mine.kind==="v"?`<video src="${esc(mine.url)}#t=0.1" muted playsinline preload="metadata"></video>`:`<img src="${esc(mine.url)}" alt="">`):svPh(tr)}</button><div><small>我的舞台</small><b>「${esc(m.t)}」已經交了 ✓</b><button class="gh" data-a="svUp">換掉重交</button></div>`:`<div><small>我的舞台</small><b>還沒交「${esc(m.t)}」</b><p>${esc(m.how)}</p><button data-a="svUp">交舞台</button></div>`}</section>`:"";
  return myCard+`<div class="sv3-mt">${L.map(x=>`<button class="${x.k===mk?"on":""}" data-a="svMk" data-v="${x.k}">${x.t}${x.k===now.k?"<i>進行中</i>":""}</button>`).join("")}</div>
    <p class="sv4-stx">${tr?`這是大家交的「${esc(m.t)}」舞台。練習生不能投現場票。`:`練習生交的「${esc(m.t)}」舞台。點進去看，這個任務你可以投 <b>1 張現場票</b>${lv?"（已經投了）":""}。前三名拿加分票。`}</p>
    ${St.length?`<div class="sv3-sg">${St.map((x,i)=>{ const t=all.find(y=>y.id===x.tid)||{}; return `<button class="sv3-st ${lv===x.id?"me":""}" data-a="svStage" data-v="${x.id}"><span class="sv3-sp">${x.url?(x.kind==="v"?`<video src="${esc(x.url)}#t=0.1" muted playsinline preload="metadata"></video><i class="sv3-play"></i>`:`<img src="${esc(x.url)}" alt="">`):svPh(t)}${i<3&&svLive(x)?`<em>${i+1}</em>`:""}</span><b>${esc(t.name||"")}</b><small>${esc(x.team||x.pos||"")}${x.team||x.pos?"・":""}♥ ${fmt(svLive(x))}</small></button>`; }).join("")}</div>`:`<p class="sv2-note">${esc(m.t)}的舞台還沒上傳</p>`}`; }
/* 練習生：我的任務 */
/* 參賽者本人：示範裡切到「練習生畫面」才算 */
const svTrainee=s=>{ const me=s.demo?(ui.svDemoT?svEntries()[0]:null):svMyEntry(); return me&&svVoting()&&svAlive().has(me.id)?me:null; };
function svStageView(id){ const s=svSeason(), x=svStages(s.ph).find(y=>y.id===id); if(!x) return; const t=svById(x.tid)||{}, m=svMsList(s.ph).find(y=>y.k===x.mk)||{}, lv=svMyLv()[s.id+x.mk];
  tieModal(`${esc(t.name||"")}・${esc(m.t||"")}`,`${x.url?(x.kind==="v"?`<video class="sv3-vid" src="${esc(x.url)}" controls playsinline></video>`:`<img class="sv3-vid" src="${esc(x.url)}" alt="">`):`<div class="sv3-vid sv5-nov">${s.demo?"示範舞台沒有影片<br><small>真的練習生交的影片、照片會在這裡播放</small>":"這個舞台沒有影片"}</div>`}${x.team||x.pos?`<p class="sv3-tag">${esc(x.team||x.pos)}</p>`:""}${x.cap?`<p class="fy-info">${esc(x.cap)}</p>`:""}
    ${(x.cm||[]).map(c=>`<div class="sv3-cm"><b>${esc(c.n)}</b><span>${esc(c.t)}</span></div>`).join("")}<p class="sv3-lv">♥ 現場票 ${fmt(svLive(x))}</p>`,
    `${isAdminAcct()&&!s.demo?`<button class="t-mbtn" data-a="svCm" data-v="${x.id}">導師評語</button>`:""}<button class="t-mbtn" data-a="tCloseLayer">關閉</button>${svVoting()&&!svTrainee(s)?`<button class="t-mbtn main" data-a="svLv" data-v="${x.id}" ${lv?"disabled":""}>${lv===x.id?"已投這個舞台":lv?"這個任務投過了":"投現場票"}</button>`:""}`,"sv3-tm"); }
function svUpForm(){ const s=svSeason(), m=svMsNow(s), me=s.demo?svTrainee(s):svMyEntry(), my=svStages(s.ph,m.k).find(x=>x.tid===me.id)||{}, f=ui.svU||(ui.svU={url:my.url||"",kind:my.kind||"",cap:my.cap||"",team:my.team||"",pos:my.pos||""});
  setLayer(`<div class="tiei svf sv2 ${svTheme()}"><header class="tiei-top"><button class="icon-btn" data-a="tCloseLayer" aria-label="關閉">${I.back}</button><b>交舞台・${esc(m.t)}</b><span class="sh-sp"></span></header><div class="tiei-body">
    <p class="sv3-how">${esc(m.how)}</p>
    <button class="sv3-upm" data-a="svUpPick">${f.busy?`<b>${f.busy}</b>`:f.url?(f.kind==="v"?`<video src="${esc(f.url)}" muted playsinline controls></video>`:`<img src="${esc(f.url)}" alt="">`):`<b>＋ 影片或照片</b>`}</button>
    ${m.team?`<label class="svf-l">組名</label><input id="svUt" class="svf-in" maxlength="20" placeholder="例：A 組、PICK ME 組" value="${esc(f.team)}">`:""}
    ${m.pos?`<label class="svf-l">位置</label><div class="chips wrap co-chips">${["Vocal","Dance","Rap"].map(k=>`<button class="chip ${f.pos===k?"on":""}" data-a="svUpPos" data-v="${k}">${k}</button>`).join("")}</div>`:""}
    <label class="svf-l">舞台說明</label><textarea id="svUc" class="svf-in" rows="3" maxlength="200" placeholder="唱了什麼歌、想讓大家看到什麼">${esc(f.cap)}</textarea>
    <button class="sv2-cta" data-a="svUpOk">${my.id?"換掉舞台":"送出舞台"}</button></div></div>`); }
const svUKeep=()=>{ const f=ui.svU; if(!f) return; const g=id=>(document.getElementById(id)||{}).value; if(g("svUt")!=null) f.team=g("svUt").trim(); if(g("svUc")!=null) f.cap=g("svUc").trim(); };

/* ---------- 出道準備（只有出道組看得到的工作區）
   ・每個人改自己的資料（藝名、生日、照片、介紹）
   ・匿名投票（隊長選舉、出道曲、隊內定位…只看得到票數，不知道誰投誰）
   ・被推舉為隊長的人可以改團體的全部內容（出道申請那一頁）
   ・存草稿＝只存在這支手機；儲存＝團員都看得到；正式送出＝交給管理員審核 ---------- */
const SVP="daisuki_sv_prep", SVPV="daisuki_sv_pv";
function svPrep(){ const s=svSeason(); if(!s) return {}; if(s.demo) return ui.svDP||(ui.svDP={leader:"",mem:{},polls:[]}); return ((S.get(SVP,{})||{})[s.id])||{leader:"",mem:{},polls:[]}; }
function svPrepSet(fn){ const s=svSeason(); if(!s) return; if(s.demo){ fn(svPrep()); return; } const A={...(S.get(SVP,{})||{})}, P=JSON.parse(JSON.stringify(A[s.id]||{leader:"",mem:{},polls:[]})); fn(P); A[s.id]=P; S.set(SVP,A); }
const svPv=id=>{ const s=svSeason(); return s&&s.demo?((ui.svDPV||{})[id]||{}):(((S.get(SVPV,{})||{})[id])||{}); };
const svPvMine=()=>{ const s=svSeason(); return s&&s.demo?(ui.svDPVm||{}):(S.get(acK("daisuki_sv_pvd"),{})||{}); };
const svMe=s=>s.demo?svEntries()[0]:svMyEntry();
const svIsLeader=s=>{ const me=svMe(s), P=svPrep(); return !!me&&P.leader===me.id; };
const svMemOf=(id,T)=>({...T(id),...((svPrep().mem||{})[id]||{})});
function svPrepHtml(s){ const me=svMe(s), D=s.debut||[]; if(!me||!D.includes(me.id)) return ""; const P=svPrep(), all=svAll(), T=id=>all.find(x=>x.id===id)||{id,name:"?"}, ld=P.leader, lead=ld===me.id;
  const f=P.draft||{}, ck=P.draft?dbCheck(f):[], done=ck.filter(x=>x[1]).length;
  const polls=(P.polls||[]).slice().reverse().map(p=>{ const V=svPv(p.id), tot=Object.values(V).reduce((a,b)=>a+b,0), mine=svPvMine()[p.id], show=mine||p.closed, mx=Math.max(0,...p.opts.map((o,i)=>V[i]||0));
    return `<div class="sv3-pl"><b>${esc(p.q)}${p.lead?"<i>隊長選舉</i>":""}${p.closed?"<i>已結束</i>":""}</b>${p.opts.map((o,i)=>{ const n=V[i]||0, pc=tot?Math.round(n/tot*100):0; return show?`<div class="sv3-po ${p.closed&&n===mx&&n?"win":""} ${mine===String(i+1)?"me":""}"><span style="width:${pc}%"></span><em>${esc(o)}</em><small>${n} 票</small></div>`:`<button class="sv3-po" data-a="svPvo" data-v="${p.id}|${i}"><em>${esc(o)}</em></button>`; }).join("")}
      <small class="sv3-pf">匿名・${tot} 人投了${!p.closed&&(p.by===me.id||lead)?`<button data-a="svPvEnd" data-v="${p.id}">結束投票</button>`:""}</small></div>`; }).join("");
  return `<section class="sv3-prep"><div class="sv2-sh"><b>出道組工作區</b><i>只有出道組看得到</i></div>
    <div class="sv3-pc"><b>成員資料</b><div class="sv3-mm">${D.map(id=>{ const x=svMemOf(id,T); return `<div class="sv3-m ${id===me.id?"me":""}"><span class="sv2-p">${svPh(x)}</span><b>${esc(x.name)}${id===ld?"<i>隊長</i>":""}</b><small>${esc(x.pos||"定位未定")}</small>${id===me.id||lead?`<button data-a="svMemEd" data-v="${id}">編輯</button>`:""}</div>`; }).join("")}</div></div>
    <div class="sv3-pc"><b>出道要準備的東西</b>${P.draft?`<p>${done}／${ck.length} 項完成・${P.savedBy?`${esc(P.savedBy)} ${new Date(P.savedAt).toLocaleString()} 儲存`:""}${P.sent?"・已正式送出":""}</p><div class="sv3-ck">${ck.map(([l,ok])=>`<span class="${ok?"ok":""}">${ok?"✓":"○"} ${l}</span>`).join("")}</div>`:`<p>出道曲、MV、宣傳排程、結尾妖精、一位感言…都在團體出道申請頁裡填。</p>`}
      <button class="sv2-cta sm" data-a="svDebutApply">${lead?"打開團體出道申請":"看團體出道申請"}</button>${lead?"":`<p class="sv3-pf">只有隊長可以改團體的內容</p>`}</div>
    <div class="sv3-pc"><b>匿名投票</b><div class="ls-btns"><button class="btn btn-soft btn-sm" data-a="svPvNew" data-v="lead">隊長選舉</button><button class="btn btn-soft btn-sm" data-a="svPvNew">開新投票</button></div>${polls||`<p>出道曲、隊內定位、團名…大家意見不一樣就開投票，不會知道誰投誰。</p>`}</div></section>`; }
/* 結束投票；隊長選舉票最多（不同票）的人當隊長 */
function svPvClose(id){ const s=svSeason(), V=svPv(id); svPrepSet(P=>{ const p=(P.polls||[]).find(x=>x.id===id); if(!p) return; p.closed=Date.now(); if(p.lead){ const n=p.opts.map((o,i)=>V[i]||0), mx=Math.max(...n); if(mx&&n.filter(x=>x===mx).length===1) P.leader=(p.ids||s.debut||[])[n.indexOf(mx)]||P.leader; } }); }
/* 存出道申請：去掉上傳中的暫存網址 */
const svDbClean=f=>{ const o=JSON.parse(JSON.stringify(f||{})); delete o.busy; Object.keys(o).forEach(k=>{ if(typeof o[k]==="string"&&o[k].startsWith("blob:")) o[k]=""; }); return o; };

/* 名次卡：叫到名字時跳出來（像節目的名次圖）。每一季換一種設計（三角／稜鏡／X），有跟上一次發表比的名次變化 */
function svFc(t,i,st,sp){ const s=svSeason(), L=layer.querySelector(".svx"); if(!s||!L) return; const d=svTheme()==="b"?1:0,   /* 11/18：女團從頭到尾粉紅；男團藍；不用 X 的設計 */ prev=st==="r2"?(s.rk||{}).r1:st==="final"?(s.rk||{}).r2:null, pi=prev?prev.indexOf(t.id):-1, ch=prev?(pi<0?`<em class="up">NEW</em>`:pi>i?`<em class="up">▲ ${pi-i}</em>`:pi<i?`<em class="dn">▼ ${i-pi}</em>`:`<em>－</em>`):"";
  const age=t.bd?Math.floor((Date.now()-new Date(t.bd).getTime())/315576e5):0, v=(svScores(st)||{})[t.id], ttl={r1:"第一次排名發表",r2:"第二次排名發表",final:"出道組發表"}[st], old=L.querySelector(".svx-fc"); if(old) old.remove();
  const crown='<svg viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M2 14h20M3 12 1.5 3l6 4.5L12 1l4.5 6.5 6-4.5L21 12z"/></svg>';
  L.insertAdjacentHTML("beforeend",`<div class="svx-fc d${d}"><div class="fc-in"><div class="fc-ph">${t.photo?`<img src="${esc(t.photo)}" alt="">`:`<i class="sv2-sil"></i>`}</div><i class="fc-sh"></i>
    <div class="fc-tag"><b>SURVIVAL PROJECT</b><span>${ttl}</span></div>
    <div class="fc-tri"><i class="t1"></i><i class="t2"></i><i class="t3"></i><div class="fc-rk"><span class="fc-cr">${crown}</span><b>${i+1}</b><small>位</small></div></div>
    <div class="fc-bar"><div><small>${esc(t.co||"個人練習生")}${ch?` ${ch}`:""}</small><b>${esc(t.name)}${age?`<span>（${age}）</span>`:""}</b></div>${v!=null?`<div class="fc-vv"><b>${fmt(v)}</b><small>票</small></div>`:""}</div></div>${sp?`<p class="fc-sp">「${esc(sp)}」</p>`:""}</div>`); }
/* 候補：主持人說話，鏡頭帶到每一位（跟發表卡同一個樣子，名次換成候補） */
function svCam(t,lab,line,st){ const s=svSeason(), L=layer.querySelector(".svx"); if(!s||!L) return; const d=svTheme()==="b"?1:0, ttl={r1:"第一次排名發表",r2:"第二次排名發表",final:"出道組發表"}[st], old=L.querySelector(".svx-fc"); if(old) old.remove();
  L.insertAdjacentHTML("beforeend",`<div class="svx-fc d${d} cam"><div class="fc-in"><div class="fc-ph">${t.photo?`<img src="${esc(t.photo)}" alt="">`:`<i class="sv2-sil"></i>`}</div><i class="fc-sh"></i>
    <div class="fc-tag"><b>SURVIVAL PROJECT</b><span>${ttl}</span></div><div class="fc-rec"><i></i>LIVE</div>
    <div class="fc-tri"><i class="t1"></i><i class="t2"></i><div class="fc-rk"><b class="q">?</b><small>${esc(lab)}</small></div></div>
    <div class="fc-bar"><div><small>${esc(t.co||"個人練習生")}</small><b>${esc(t.name)}</b></div></div></div>
    ${line?`<p class="fc-host"><span>${SV_MIC}</span><b>${esc(svHostN(s))}</b>${esc(line)}</p>`:""}</div>`); }
const svFcOut=()=>{ const c=layer.querySelector(".svx-fc"); if(c){ c.classList.add("out"); setTimeout(()=>c.remove(),420); } };

/* ---------- 頁面 ---------- */
function viewSurvival(id){ const s=svSeason(), th=svTheme(), hd=(route().role==="artist"?focHead:coreHead)(id?"練習生":"選秀",id?"":"survival");
  const pre=svOpen()?"":`<p class="sv-closed">目前沒有開放，這是管理員預覽</p>`;
  if(!s) return hd+`<main class="page sv2 ${th}">${pre}${svHero("下一季準備中","",svPyr([0,1,2,3,4,5],(x,i)=>`<div class="sv2-t svx-e"><span class="sv2-p"><i class="sv2-sil"></i></span><b>${i+1}位</b><span>？</span></div>`),"《COMING SOON》")}${svDemoOk()?`<button class="sv2-cta" data-a="svDemo" data-v="recruit">看示範</button>`:""}</main>`;
  if(id) return hd+svProfile(id);
  const dm=s.demo?`<div class="sv3-dm">${[["recruit","招募"],["r1","第一輪"],["a:r1","第一次發表"],["r2","第二輪"],["a:r2","第二次發表"],["pr","PR 週"],["final","決賽"],["a:final","出道發表"],["prep","出道準備"],["","結束示範"]].map(([k,l])=>`<button class="${k===s.ph?"on":""} ${k[0]==="a"?"an":""}" data-a="svDemo" data-v="${k}">${l}</button>`).join("")}<span class="sv3-dmv">看誰的畫面：</span><button class="${ui.svDemoT?"":"on"}" data-a="svDemoT" data-v="">投票的粉絲</button><button class="${ui.svDemoT?"on":""}" data-a="svDemoT" data-v="1">參賽的練習生</button></div>`:"";
  const sv5v=(String(location.hash).match(/[?&]v=(\w+)/)||[])[1], tabbed=svVoting()&&(!sv5v||["st","rk","pick"].includes(sv5v)), sub=!tabbed&&sv5v&&svSubHtml(s,sv5v); return hd+`<main class="page sv2 ${th} ${tabbed?"sv6":""}">${s.demo?"":pre}${tabbed?svTabsHtml(s,sv5v||"wk"):sub?sub:s.ph==="recruit"?svRecruitHtml(s):svVoting()?svVoteHtml(s):svAfterHtml(s)}${dm}${!s.demo&&!sub&&svDemoOk()?`<button class="sv2-cta sv-dmgo" data-a="svDemo" data-v="recruit">看示範（只有你看得到，不會影響這一季）</button>`:""}</main>${svVoting()?svBasketHtml():""}`; }
const svCd=s=>svLeftTxt((s.end||0)-Date.now());
const svBase=()=>{ const d=new Date(); d.setMinutes(0,0,0); return `${d.getMonth()+1}/${d.getDate()} ${pad(d.getHours())}:00 基準`; };
const svSeats=()=>{ const M={}; [...svEntries()].sort((a,b)=>(a.ts||0)-(b.ts||0)).forEach(e=>{ if(e.seat&&!M[e.seat]) M[e.seat]=e; }); return M; };
const svSeatHtml=(M,me,pick)=>`<div class="sv3-seats">${svPyr(Array.from({length:SV_N},(x,i)=>i+1),(n)=>{ const e=M[n], mine=me&&e&&e.email===me, sel=pick===n, ch=n===1&&e&&!mine&&pick!==undefined, chOn=ch&&!!(ui.svF&&ui.svF.ch1);
  if(ch) return `<button class="sv2-t tk ch1 ${chOn?"me":""}" data-a="svCh1"><span class="sv2-p"><i class="sv2-sil"></i></span><b>1</b><span>${chOn?"挑戰中":"挑戰"}</span></button>`;   /* 11/18 照 PRODUCE：1 號位有人坐了也可以上去挑戰 */
  return `<${pick!==undefined?"button":"div"} class="sv2-t ${e&&!mine?"tk":e?"":"svx-e"} ${sel||mine&&pick===undefined?"me":""}" ${pick!==undefined&&(!e||mine)?`data-a="svSeat" data-v="${n}"`:pick!==undefined?"disabled":""}><span class="sv2-p">${mine&&!sel&&pick!==undefined?`<i class="sv2-sil"></i>`:mine?svPh(e):`<i class="sv2-sil"></i>`}</span><b>${n}</b><span>${sel||mine&&pick===undefined?"我":e?"有人":"空位"}</span></${pick!==undefined?"button":"div"}>`; })}</div>`;
/* 任務的日期：這一輪開始那天＋第幾天 */
const svPhT0=s=>((s.t0s||{})[s.ph])||s.t0||Date.now();
const svMd=t=>{ const d=new Date(t); return `${d.getMonth()+1}/${d.getDate()}`; };
const svMsWhen=(s,m)=>{ const t0=svPhT0(s); return `${svMd(t0+m.d[0]*864e5)}～${svMd(t0+(m.d[1]-1)*864e5)}`; };
const svMsSt=(s,m)=>{ const now=Date.now(), t0=svPhT0(s); return now<t0+m.d[0]*864e5?"還沒開始":now>=t0+m.d[1]*864e5?"已結束":"進行中"; };
function svBasketHtml(){ const B=ui.svB||{}, n=Object.values(B).reduce((a,b)=>a+b,0), all=svAll(); if(!n) return "";
  return `<div class="sv3-bk ${svTheme()}"><div class="sv3-bkl">${Object.entries(B).filter(([,c])=>c).map(([id,c])=>`<button data-a="svUnpick" data-v="${id}">${esc((all.find(t=>t.id===id)||{}).name||"")}${c>1?` ×${c}`:""}<i>✕</i></button>`).join("")}</div><button class="sv3-go" data-a="svSend">送出 ${n} 票</button></div>`; }
/* ===== 11/18 開場座位＋1 號位對決（照 PRODUCE 第一集）=====
   ・報名時 1 號位被坐了，可以「挑戰」（另外選一個備用座位）
   ・開播（第一輪）前 2 天：國民製作人投票（一人一票）決定誰坐 1 號位；平手由原本坐的人留下；沒人挑戰就直接是原本坐的人
   ・坐上 1 號位的人有「1 分鐘 PR」：第一輪頁面最上面放他的照片和自我介紹
   ・開場座位：開播後公開誰坐哪裡（輸的挑戰者坐備用座位；原本坐 1 號位的人輸了就換到贏家的備用座位）；虛擬練習生坐剩下的位子 */
const SVC1="daisuki_sv_c1v";
const svC1End=s=>((s.t0s||{}).r1||s.t0||0)+2*864e5;
function svC1(s){ const E=svEntries(), M=svSeats(), hold=M[1]||null, npc=svAll().filter(t=>!t.real&&svHash(s.id+"|c1|"+t.id)%100<7).slice(0,2), chs=[...E.filter(e=>e.ch1&&(!hold||e.id!==hold.id)),...npc], cand=[...(hold?[hold]:[]),...chs];   /* 虛擬練習生：每位大約 7% 機率搶 1 號位（最多 2 位） */
  const V0=s.demo?(ui.svC1V||{}):((S.get(SVC1,{})||{})[s.id]||{}), cnt=id=>(V0[id]||0)+(npc.some(t=>t.id===id)?svHash(s.id+"|c1v|"+id)%4:0), V=V0, done=s.demo?!!ui.svC1Done:Date.now()>=svC1End(s);
  let win=hold; if(chs.length&&done){ win=cand.slice().sort((a,b)=>cnt(b.id)-cnt(a.id)||(a===hold?-1:b===hold?1:0))[0]; }
  return {hold,chs,cand,win,done:!chs.length||done,cnt}; }
function svC1Vote(id){ const s=svSeason(); if(!s||s.ph!=="r1") return; if(svTrainee(s)){ toast("參賽的練習生不能投票"); return; } const c=svC1(s); if(c.done){ toast("1 號位對決已經結束了"); return; }
  if(s.demo){ ui.svC1V={...(ui.svC1V||{}),[id]:((ui.svC1V||{})[id]||0)+1}; ui.svC1Done=1; render(); toast("示範：投完直接看結果"); return; }
  const mine=S.get(acK("daisuki_sv_c1"),{})||{}; if(mine[s.id]){ toast("你已經投過了"); return; } mine[s.id]=id; S.set(acK("daisuki_sv_c1"),mine);
  mkEdit(SVC1,v=>{ const A={...(v||{})}; A[s.id]={...(A[s.id]||{})}; A[s.id][id]=(A[s.id][id]||0)+1; return {v:A}; }).then(()=>{ render(); toast("投好了"); }).catch(()=>{ delete mine[s.id]; S.set(acK("daisuki_sv_c1"),mine); toast("沒有投出去，再試一次"); }); }
/* 開場座位：誰坐哪裡 */
function svOpenSeats(s){ const E=svEntries(), c=svC1(s), out={}; E.forEach(e=>{ if(e.seat) out[e.seat]=e; }); let lost=null;
  if(c.win&&c.hold&&c.win.id!==c.hold.id){ const back=c.win.seat; out[1]=c.win; if(back&&out[back]&&out[back].id===c.win.id) out[back]=c.hold; else lost=c.hold; }
  else if(c.win&&!c.hold) out[1]=c.win;
  const npc=svAll().filter(t=>!t.real&&!Object.values(out).some(x=>x&&x.id===t.id)); let k=0; if(lost) for(let n=2;n<=SV_N;n++) if(!out[n]){ out[n]=lost; break; } for(let n=1;n<=SV_N;n++) if(!out[n]&&npc[k]) out[n]=npc[k++];
  return out; }
function svC1Html(s){ if(s.ph!=="r1") return ""; const c=svC1(s); if(!c.cand.length) return ""; const my=s.demo?null:((S.get(acK("daisuki_sv_c1"),{})||{})[s.id]);
  const tile=(t,lab,sub)=>`<div class="sv2-t ${my===t.id?"me":""}"><span class="sv2-p">${svPh(t)}</span><b>${esc(t.name)}</b><span>${lab}</span>${sub||""}</div>`;
  let h="";
  if(!c.done) h=svHost(s,"有人想搶 1 號位！國民製作人，請選出誰坐上 1 號位，坐上的人有 1 分鐘 PR 時間。")+`<section class="sv4-c1"><div class="sv4-h"><b>1 號位對決</b><small>${s.demo?"示範":"倒數 "+svLeftTxt(svC1End(s)-Date.now())}・一人一票</small></div><div class="sv4-c1l">${c.cand.map(t=>`<div class="sv4-c1i">${tile(t,t===c.hold?"原本坐 1 號位":"挑戰者",`<small>${fmt(c.cnt(t.id))} 票</small>`)}${my||svTrainee(s)?"":`<button class="sv2-cta sm" data-a="svC1" data-v="${t.id}">投他</button>`}</div>`).join("")}</div></section>`;
  else if(c.win) h=`<section class="sv4-pr"><div class="sv4-h"><b>1 分鐘 PR</b><small>${c.chs.length?"1 號位對決的贏家":"坐上 1 號位"}</small></div><div class="sv4-prb"><span class="sv4-prp">${svPh(c.win)}</span><div><b>${esc(c.win.name)}</b><small>${esc(c.win.co||svCoOf(c.win.email)||"個人練習生")}</small><p>${esc(c.win.msg||"")}</p><p class="sub">${esc(c.win.ps||"")}</p></div></div></section>`+svHost(s,`坐上 1 號位的 ${esc(c.win.name)}，給你 1 分鐘的 PR 時間！`);
  const O=svOpenSeats(s);
  h+=`<details class="sv4-seat"><summary>開場座位：誰坐在哪裡</summary>${svPyr(Array.from({length:SV_N},(x,i)=>i+1),n=>{ const t=O[n]; return `<div class="sv2-t ${t?"":"svx-e"}"><span class="sv2-p">${t?svPh(t):`<i class="sv2-sil"></i>`}</span><b>${n}</b><span>${t?esc(t.name):"空位"}</span></div>`; })}</details>`;
  return h; }
/* 出道組（還沒正式送出出道申請）才看得到出道準備；其他人看到節目結束 */
const svDbRec=s=>s.demo?null:getDebut().find(x=>x.sv===s.id&&x.status!=="gone");
function svIsPrepMember(s){ if(!s||s.ph!=="prep") return false; const me=svMe(s); if(!me||!(s.debut||[]).includes(me.id)) return false; if(s.demo) return !!ui.svDemoT; const db=svDbRec(s); return !db||db.status==="no"; }
/* 11/23 藝人的選秀在藝人端 FOC（同一個帳號切到粉絲端就不再出現，免得被當成兩個人）；管理員兩邊都看得到 */
const svArtAcct=()=>{ try{ const se=session()||{}, a=ACCOUNTS[se.email]||{}, m=a.member||se.member; return !!(m&&MEMBERS[m]&&!MEMBERS[m].official)&&!isAdminAcct(); }catch(e){ return false; } };
function svFestShow(art){ try{ if(!art&&route().role!=="artist"&&svArtAcct()) return false; if(svDemoOk()) return true; const s=svReal(); if(!s) return svOpen(); if(["recruit","r1","r2","pr","final"].includes(s.ph)) return true; return svIsPrepMember(s); }catch(e){ return false; } }
/* 出道組聊天室（只有出道組看得到；管理員用主持人的身分回答） */
const SVCH="daisuki_sv_chat";
const svChat=s=>s.demo?(ui.svDCh||[]):(((S.get(SVCH,{})||{})[s.id])||[]);
function svChatSend(s,txt,host){ txt=String(txt||"").trim(); if(!txt) return; const me=svMe(s), m={id:uid("sc"),by:host?"host":(me&&me.id)||"",n:host?svHostN(s):(me&&me.name)||"",t:txt.slice(0,500),ts:Date.now()};
  if(s.demo){ ui.svDCh=[...(ui.svDCh||[]),m]; return; } mkEdit(SVCH,v=>{ const A={...(v||{})}; A[s.id]=[...(A[s.id]||[]),m].slice(-300); return {v:A}; }).catch(()=>{}); }
function svChatHtml(s,host){ const L=svChat(s), me=svMe(s), all=svAll();
  return `<section class="sv4-ch"><div class="sv4-h"><b>${host?"出道組聊天室":"我們的聊天室"}</b><small>${host?"你用主持人的身分回答":"只有出道組看得到・有問題問主持人"}</small></div>
    <div class="sv4-chl" id="svChL">${L.length?L.map(m=>{ const mine=!host&&me&&m.by===me.id, t=all.find(x=>x.id===m.by); return `<div class="sv4-cm ${mine?"me":""} ${m.by==="host"?"host":""}">${mine?"":`<span class="sv4-cav">${m.by==="host"?SV_MIC:t?svPh(t):""}</span>`}<div>${mine?"":`<small>${esc(m.n)}</small>`}<p>${esc(m.t)}</p></div></div>`; }).join(""):`<p class="sv4-chn">還沒有人說話。出道曲、MV、定位…都可以在這裡討論。</p>`}</div>
    <div class="sv4-chi"><input id="svChIn" maxlength="500" placeholder="${host?"以主持人身分回覆…":"說點什麼…"}"><button data-a="svChSend" data-v="${host?"host":""}">傳送</button></div></section>`; }
/* ===== 11/18 版面簡化：每個階段＝狀態一行＋「現在要做的事」一大塊＋主持人一句＋金字塔＋兩個入口；細節點進去（ui.svV）才看 ===== */
const SV_ANN={r1:"第一次排名發表",r2:"第二次排名發表",pr:"決賽開始",final:"出道組發表"};
const svDayN=s=>Math.max(1,Math.floor((Date.now()-svPhT0(s))/864e5)+1);
const svDaysL=s=>Math.max(0,Math.ceil(((s.end||0)-Date.now())/864e5));
const svSt5=(l,r)=>`<div class="sv5-st"><span>${l}</span><span>${r}</span></div>`;
/* 11/23 節目表：一眼看到整季走到哪（像電視節目表，不講規則）＋這一輪的任務 */
function svTl(s){ const P=[["recruit","招募"],["r1","第一輪"],["r2","第二輪"],["pr","PR 週"],["final","決賽"],["prep","出道"]], cur=P.findIndex(x=>x[0]===s.ph), M=svVoting()?svMsList(s.ph):[], now=M.length?svMsNow(s):null;
  return `<div class="sv5-tl">${P.map(([k,t],i)=>`<span class="${i<cur?"done":i===cur?"on":""}">${t}</span>`).join("<i></i>")}</div>`
    +(M.length?`<div class="sv5-ms">${M.map(m=>`<span class="${m.k===now.k?"on":svMsSt(s,m)==="已結束"?"end":""}"><b>${esc(m.t)}</b><small>${svMsWhen(s,m)}</small></span>`).join("")}</div>`:""); }
const svCard5=(sm,h,p,btn,extra)=>`<section class="sv5-todo"><small>${sm}</small><h3>${h}</h3>${p?`<p>${p}</p>`:""}${btn||""}${extra||""}</section>`;
const svHero5=(sm,big,sub,btn)=>`<section class="sv5-hero"><small>${sm}</small><b>${big}</b><small>${sub}</small>${btn||""}</section>`;
const svTrio=L=>`<div class="sv5-me">${L.map(([b,s])=>`<div><b>${b}</b><small>${s}</small></div>`).join("")}</div>`;
const svPyr5=(h,ids,tile)=>`<section class="sv5-pyr"><h4>${h}</h4>${svPyr(ids,tile)}</section>`;
const svEnt5=L=>`<div class="sv5-ent">${L.map(([v,b,sm])=>`<button data-a="uniGo" data-v="#/fan/core?p=survival&v=${v}"><b>${b}</b><small>${sm}</small></button>`).join("")}</div>`;
const svHow5=()=>`<button class="sv5-how" data-a="uniGo" data-v="#/fan/core?p=survival&v=how">怎麼玩？</button>`;
const svBack5=t=>`<div class="sv5-bk"><b>${t}</b></div>`;   /* 上面的返回鍵就能回去，不另外放「回選秀」 */
const svRecMe=s=>s.demo?(ui.svDemoT?svEntries()[0]:null):svMyEntry();

function svRecruitHtml(s){ const E=svEntries(), me=svRecMe(s), art=!s.demo&&((session()||{}).role!=="fan"||svIsArtist(myEmail()));
  return svSt5("練習生招募中",`截止 <b>還有 ${svCd(s)}</b>`)
    +(me?svCard5("你已經報名了",`坐在 ${me.seat||"?"} 號位${me.ch1?"・挑戰 1 號位中":""}`,"誰報名了，要等節目開播才會公開。截止前資料都可以改。",`<button data-a="svApply">修改報名資料</button>`)
      :svHero5("已經報名",`${E.length} 位`,"誰報名了，開播才公開",art||isWealth(myEmail())?"":`<button data-a="svApply">我也要報名（當練習生）</button>`))
    +svHost(s,svHostTxt(s))
    +`<section class="sv5-pyr"><h4>座位・1 號在最頂端</h4>${svSeatHtml(svSeats(),me&&me.email)}</section>`+svHow5(); }

function svC1Bn(s){ if(s.ph!=="r1") return ""; const c=svC1(s); if(!c.cand.length) return "";
  if(!c.done) return `<button class="sv5-bn" data-a="uniGo" data-v="#/fan/core?p=survival&v=c1"><i>🔥</i><div><b>1 號位對決進行中</b><small>有人想搶 1 號位，國民製作人投票決定${s.demo?"":"・倒數 "+svLeftTxt(svC1End(s)-Date.now())}</small></div><em>›</em></button>`;
  if(c.win&&(s.demo||Date.now()<svC1End(s)+3*864e5)) return `<button class="sv5-bn" data-a="uniGo" data-v="#/fan/core?p=survival&v=c1"><span class="sv5-bp">${svPh(c.win)}</span><div><b>1 分鐘 PR・${esc(c.win.name)}</b><small>坐上 1 號位的練習生・還有開場座位</small></div><em>›</em></button>`;
  return ""; }

function svTodoTr(s,me){ const m=svMsNow(s); if(!m) return ""; const my=svStages(s.ph,m.k).find(x=>x.tid===me.id), sp=!s.demo&&(me.sp||{})[s.ph], ann=SV_ANN[s.ph], dl=svMd(svPhT0(s)+(m.d[1]-1)*864e5);
  const pe=SV_GRK.includes(m.k)&&s.ph==="r1", need=pe?svPeerNeed(s,m.k,me):0, pr=!pe||!need||!!svPeerMine(s,m.k,me);   /* 等級評價、主題曲：多一步「互評」 */
  const st=[["交舞台",my],...(pe?[["互評",pr&&my]]:[]),...(s.ph==="pr"?[]:[["寫感言",sp]])];   /* PR 週沒有排名發表，不用寫感言 */
  const chk=`<div class="sv5-chk">${st.map(([l,ok],i)=>`<span class="${ok?"ok":""}">${"①②③"[i]} ${l}${ok?" ✓":""}</span>`).join("")}</div>`,
    cm=my&&(my.cm||[]).length?`<div class="sv4-cmt"><b>導師評語</b>${my.cm.map(c=>`<p><span>${esc(c.n)}</span>${esc(c.t)}</p>`).join("")}</div>`:"";
  if(!my) return svCard5("你現在要做的事",`交「${esc(m.t)}」舞台`,`${esc(m.how)}<br><b>${dl} 前交。</b>`,`<button data-a="svUp">交舞台</button>`,chk+cm);
  if(!pr) return svCard5("你現在要做的事","幫其他練習生評分",`匿名幫其他人的「${esc(m.t)}」舞台打 1～5 顆星，至少評 ${need} 位。這會算進大家的等級（粉絲現場票 6 成＋練習生互評 4 成）。<br><b>${dl} 前交。</b>`,`<button data-a="uniGo" data-v="#/fan/core?p=survival&v=peer">去評分</button>`,chk+cm);
  if(s.ph==="pr") return svCard5("你現在要做的事","PR 交好了！",`這週不淘汰人。PR 現場票前三名拿加分票，這週的票也會帶進決賽。PR 可以換掉重交。`,`<div class="sv5-2b"><button class="gh" data-a="svUp">換 PR</button></div>`,chk+cm);
  if(!sp) return svCard5("你現在要做的事",`寫${ann}的感言`,`${ann}時，主持人叫到你的名字會出現這段話。「${esc(m.t)}」舞台已經交了 ✓`,`<button data-a="svSpeak">寫感言</button>`,chk+cm);
  return svCard5("你現在要做的事","都準備好了！",`等${ann}。舞台可以換掉重交，感言也可以改${pe?"，互評也能改":""}。`,`<div class="sv5-2b"><button class="gh" data-a="svUp">換舞台</button>${pe?`<button class="gh" data-a="uniGo" data-v="#/fan/core?p=survival&v=peer">改互評</button>`:""}<button class="gh" data-a="svSpeak">改感言</button></div>`,chk+cm); }
function svVoteHtml(s){ const rk=svRank(), all=svAll(), my=svMine(), T=id=>all.find(x=>x.id===id)||{id}, tr=svTrainee(s), cut=s.ph==="r1"?SV_KEEP.r1:s.ph==="r2"?SV_KEEP.r2:s.ph==="pr"?999:SV_DEB, fin=s.ph==="final", m=svMsNow(s), lv=m&&svMyLv()[s.id+m.k];
  const head=svSt5(`${SV_PH[s.ph]}・第 ${svDayN(s)} 天`,`${SV_ANN[s.ph]} <b>還有 ${svCd(s)}</b>`);
  const hid=svHid(s), top=rk.slice(0,fin?SV_DEB:6), pyr=hid?svHidPyr(s,my,tr):svPyr5(fin?"出道組在誰手上？":"現在的排名",top,(id,i)=>svTile(T(id),`${i+1}位`,null,!tr&&my[id]||tr&&tr.id===id));
  if(tr) return head+svTrio([[hid?"保密":`${rk.indexOf(tr.id)+1} 位`,"我現在的排名"],[svGrade(tr)||"－","我的等級"],[`${svDaysL(s)} 天`,SV_ANN[s.ph]]])
    +svTodoTr(s,tr)+svGrBn(s)+svC1Bn(s)+svHost(s,svHostTxt(s))+pyr
    +svEnt5([["rk","全部排名",hid?"排名保密中":fin?`前 ${SV_DEB} 位出道`:`晉級線 TOP ${cut}`],["st","大家的舞台","看看其他人交了什麼"]])+svHow5();
  const L=svLeft(), done=!L;
  return head
    +(done?svHero5("今天的票","投完了","明天再來 PICK",`<button data-a="uniGo" data-v="#/fan/core?p=survival&v=rk">看排名</button>`)
      :svHero5(fin?"決賽每天只有":"今天還能 PICK",`${L} 票`,fin?`選出 ${SV_DEB} 位出道組`:s.ph==="r2"?`剩 ${rk.length} 位，${SV_KEEP.r2} 位晉級`:"可以分給不同人，也可以全投同一位",`<button data-a="uniGo" data-v="#/fan/core?p=survival&v=pick">去 PICK</button>`))
    +svGrBn(s)+svC1Bn(s)+svHost(s,svHostTxt(s))+pyr
    +svEnt5([["rk","全部排名",hid?"排名保密中":`${rk.length} 位練習生`],["st",fin?"看決賽舞台":"看舞台",lv?"這個任務的現場票投了":"投現場票（還有 1 張）"]])+svHow5(); }

/* ===== 11/23 投票期的頁面：像追一集節目，上面四個分頁（本週／舞台／排名／練習生），PICK 固定在最下面 ===== */
const SV_TABS=[["wk","本週"],["st","舞台"],["rk","排名"],["pick","練習生"]];
function svTabsHtml(s,v){ const tr=svTrainee(s);
  const nav=`<nav class="sv6-tabs">${SV_TABS.map(([k,n])=>`<button class="${k===v?"on":""}" data-a="uniGo" data-v="#/fan/core?p=survival${k==="wk"?"":"&v="+k}">${n}</button>`).join("")}</nav>`;
  const rk=svRank(), all=svAll(), my=svMine(), T=id=>all.find(x=>x.id===id)||{id}, fin=s.ph==="final", hid=svHid(s);
  const body=v==="st"?svStageHtml(s):v==="rk"?(hid?svHidPyr(s,my,tr):svPyr5(fin?"出道組在誰手上？":"現在的排名",rk.slice(0,fin?SV_DEB:6),(id,i)=>svTile(T(id),`${i+1}位`,null,!tr&&my[id]||tr&&tr.id===id)))+svRkList(s,false):v==="pick"?svRkList(s,!tr):svWeekHtml(s);
  return nav+`<div class="sv6-body">${body}</div>`; }
function svWeekHtml(s){ const m=svMsNow(s), tr=svTrainee(s), rk=svRank(), all=svAll(), hid=svHid(s), t0=svPhT0(s), end=m?t0+m.d[1]*864e5:0;
  const ep=m?`<section class="sv6-ep"><small>${SV_PH[s.ph]}・第 ${svDayN(s)} 天</small><h2>${esc(m.t)}</h2><p>${esc(m.how)}</p><div class="sv6-chips"><span class="on">交舞台到 ${svMd(end-864e5)}</span><span>${SV_ANN[s.ph]} 還有 ${svCd(s)}</span></div></section>`:"";
  const me=tr?svTrio([[hid?"保密":`${rk.indexOf(tr.id)+1} 位`,"我現在的排名"],[svGrade(tr)||"－","我的等級"],[`${svDaysL(s)} 天`,SV_ANN[s.ph]]])+svTodoTr(s,tr):"";
  const St=m?svStages(s.ph,m.k).slice().sort((a,b)=>svLive(b)-svLive(a)||svHash(a.id)-svHash(b.id)):[], lv=m&&svMyLv()[s.id+m.k];
  const stg=m?`<section class="sv6-sec"><div class="sv6-sh"><b>這週的舞台</b><button data-a="uniGo" data-v="#/fan/core?p=survival&v=st">${St.length?`${St.length} 位已交 ›`:"看舞台 ›"}</button></div>${St.length?`<div class="sv3-sg sv6-sg">${St.slice(0,4).map((x,i)=>{ const t=all.find(y=>y.id===x.tid)||{}; return `<button class="sv3-st ${lv===x.id?"me":""}" data-a="svStage" data-v="${x.id}"><span class="sv3-sp">${x.url?(x.kind==="v"?`<video src="${esc(x.url)}#t=0.1" muted playsinline preload="metadata"></video><i class="sv3-play"></i>`:`<img src="${esc(x.url)}" alt="">`):svPh(t)}${i<3&&svLive(x)?`<em>${i+1}</em>`:""}</span><b>${esc(t.name||"")}</b><small>${esc(x.team||x.pos||"")}${x.team||x.pos?"・":""}♥ ${fmt(svLive(x))}</small></button>`; }).join("")}</div>${tr?"":`<p class="sv6-tip">${lv?"這個任務的現場票投了 ✓":"點舞台進去，這個任務可以投 1 張現場票"}</p>`}`:`<p class="sv6-none">還沒有人交舞台</p>`}</section>`:"";
  return ep+me+svPickBar(s,"wk")+svGrBn(s)+svC1Bn(s)+stg+svHost(s,svHostTxt(s))+svHow5(); }   /* PICK 放在頁面裡（不再浮在下面擋舞台）；練習生看不到 */
function svPickBar(s,v){ if(svTrainee(s)||v==="pick") return ""; const L=svLeft(), fin=s.ph==="final", rk=svRank();
  return `<div class="sv6-pk ${svTheme()}"><div><b>${L?`今天還能 PICK ${L} 票`:"今天投完了"}</b><small>${L?(fin?`選出 ${SV_DEB} 位出道組`:s.ph==="pr"?"這週不淘汰，票數帶進決賽":s.ph==="r2"?`剩 ${rk.length} 位，${SV_KEEP.r2} 位晉級`:`${rk.length} 位練習生，${SV_KEEP.r1} 位晉級`):"明天再來"}</small></div><button data-a="uniGo" data-v="#/fan/core?p=survival&v=${L?"pick":"rk"}">${L?"去 PICK":"看排名"}</button></div>`; }

/* ===== 11/18 等級評價：自動算，管理員不能改（粉絲現場票 60%＋練習生互評 40%）；第二輪排名保密 ===== */
const SVPR="daisuki_sv_peer", SV_GRK=["lv","th"];   /* lv＝等級評價、th＝主題曲（重新評價） */
const SV_GRQ=[.1,.2,.25,.25];                        /* A 10%、B 20%、C 25%、D 25%、其他 F */
const svPeerAll=(s,mk)=>s.demo?((ui.svPrD||{})[mk]||{}):(((S.get(SVPR,{})||{})[s.id+"|"+mk])||{});
const svPeerMine=(s,mk,me)=>svPeerAll(s,mk)[me.id];
function svGrCalc(s,mk){ const ids=[...svAlive("r1")], St=svStages("r1",mk), P=svPeerAll(s,mk), mx=Math.max(10,...St.map(svLive));
  const sc={}; ids.forEach(id=>{ const st=St.find(x=>x.tid===id), t=svById(id)||{}, real=t.real||s.demo&&st;
    const live=st?svLive(st):real?0:(svHash(mk+"lv"+id)%100)/100*mx;
    const R=Object.entries(P).filter(([r])=>r!==id).map(([,v])=>v[id]).filter(Boolean), avg=R.length?R.reduce((a,b)=>a+b,0)/R.length:real?(st?3:1):2.5+(svHash(mk+"pr"+id)%200)/100;
    sc[id]=.6*Math.min(1,live/mx)+.4*((avg-1)/4); });
  const ord=ids.slice().sort((a,b)=>sc[b]-sc[a]||svHash(a)-svHash(b)), n=ord.length, cnt=SV_GRQ.map((q,i)=>i?Math.round(n*q):Math.max(1,Math.round(n*q))), G={};
  let k=0; ord.forEach((id,i)=>{ while(k<4&&i>=cnt.slice(0,k+1).reduce((a,b)=>a+b,0)) k++; G[id]=SV_GR[k]; });
  return {G,ord,sc}; }
function svGrPub(s,k){ const {G,ord}=svGrCalc(s,k); const cen=k==="lv"?ord.find(id=>G[id]==="A"):s.grCen;
  return {...s,grade0:k==="th"?{...(s.grade||{})}:s.grade0||null,grade:G,grPub:{...(s.grPub||{}),[k]:Date.now()},grCen:cen}; }
/* 等級：只有公布後才看得到（示範：直接用算出來的） */
const svGrDemo=s=>{ if(s.ph==="r1"&&(svMsNow(s)||{}).k==="lv") return {};   /* 11/23 示範也照真的：等級評價任務還在進行，等級就還沒公布 */ if(!ui.svGrD) ui.svGrD=svGrCalc(s,"lv").G; return ui.svGrD; };
const SV_GRCM={A:["完成度很高，主題曲很期待你。","舞台上很有自己的顏色，保持下去。","聲音和表情都抓得很好，是準備好的人。"],
  B:["基本功不錯，再多一點自信會更好。","表現很穩，差一點點就是 A。","有記憶點，細節再修就更完整。"],
  C:["有亮點，但穩定度還要加強。","前半段很好，後半段體力掉了。","看得到潛力，現在還沒完全發揮出來。"],
  D:["看得出很努力，基本功要再練。","太緊張了，平常的實力沒拿出來。","選曲跟你不太合，下次挑能展現自己的。"],
  F:["現在還不夠，但這裡就是讓你成長的地方。","基礎要從頭練起，不要放棄。","準備時間不夠吧？下一個舞台讓我們看到改變。"]};
const svGrCm=(s,t,k)=>{ const st=svStages("r1",k||"lv").find(x=>x.tid===t.id), c=st&&(st.cm||[])[0]; if(c) return {n:c.n,t:c.t};
  const M=svMentors(s), g=svGrade(t), g0=(s.grade0||{})[t.id], up=g0&&g0!==g?(SV_GR.indexOf(g)<SV_GR.indexOf(g0)?"這幾天進步很多！":"這幾天狀態掉了，要調整回來。"):"";
  const C=SV_GRCM[g]||[""]; return {n:M[svHash("m"+t.id)%M.length].n,t:up||C[svHash("c"+t.id)%C.length]}; };
const svGrSeenK=s=>"sv_grSeen_"+(s.demo?"demo":s.id)+"_"+(s.grade0?"th":"lv");
function svGrBn(s){ if(s.ph==="recruit"||!Object.keys(s.demo?svGrDemo(s):s.grade||{}).length) return ""; const seen=localStorage.getItem(svGrSeenK(s)), re=!!s.grade0;
  if(seen&&!s.demo) return ""; return `<button class="sv5-bn" data-a="uniGo" data-v="#/fan/core?p=survival&v=gr"><i>🎖</i><div><b>${re?"主題曲重新評價公布了":"等級評價公布了"}</b><small>導師給的 A～F 等級和評語</small></div><em>›</em></button>`; }
function svGrHtml(s){ try{ localStorage.setItem(svGrSeenK(s),"1"); }catch(e){} const G=s.demo?svGrDemo(s):s.grade||{}, all=svAll(), T=id=>all.find(x=>x.id===id)||{id,name:"?"}, tr=svTrainee(s), re=!!s.grade0, my=svMine();
  const mine=tr&&G[tr.id]?(()=>{ const c=svGrCm(s,tr,re?"th":"lv"), g0=(s.grade0||{})[tr.id]; return `<section class="sv5-grme"><small>${re?"重新評價":"等級評價"}・你的等級</small><div>${g0&&g0!==G[tr.id]?`<i class="sv3-gr big g${g0}">${g0}</i><em>→</em>`:""}<i class="sv3-gr big g${G[tr.id]}">${G[tr.id]}</i></div><p><b>${esc(c.n)}</b>「${esc(c.t)}」</p></section>`; })():"";
  const cen=s.demo?Object.keys(G).find(id=>G[id]==="A"):s.grCen;
  return svHost(s,re?"主題曲重新評價的結果出來了！有人往上，也有人往下。":"等級評價的結果出來了！A 班的練習生，主題曲的歌詞最多。")+mine
    +(cen?`<section class="sv5-cen">${svTile(T(cen),"主題曲 C 位",null,!tr&&my[cen],"div")}<p>A 班裡分數最高的練習生，站主題曲 C 位。</p></section>`:"")
    +SV_GR.map(g=>{ const L=Object.keys(G).filter(id=>G[id]===g&&svAlive().has(id)); if(!L.length) return ""; return `<div class="sv5-grh"><i class="sv3-gr g${g}">${g}</i><b>${g} 班</b><small>${L.length} 位</small></div><div class="sv5-grg">${L.map(id=>{ const t=T(id), g0=(s.grade0||{})[id], c=svGrCm(s,t,re?"th":"lv"); return `<button class="sv5-gri ${!tr&&my[id]||tr&&tr.id===id?"me":""}" data-a="uniGo" data-v="#/fan/core?p=survival&id=${id}"><span class="sv2-p">${svPh(t)}</span><b>${esc(t.name)}${g0&&g0!==g?`<em>${g0}→${g}</em>`:""}</b><small>${esc(c.n)}：${esc(c.t)}</small></button>`; }).join("")}</div>`; }).join(""); }

/* 練習生互評：匿名幫別人的舞台打 1～5 顆星，不能評自己 */
const svPeerNeed=(s,mk,me)=>Math.min(5,svStages(s.ph,mk).filter(x=>x.tid!==me.id).length);
function svPeerHtml(s){ const me=svTrainee(s), m=svMsNow(s); if(!me||!m||!SV_GRK.includes(m.k)) return `<p class="sv2-note">現在沒有要互評的任務</p>`;
  const done=svPeerMine(s,m.k,me), D=ui.svPr||(ui.svPr={...(done||{})}), St=svStages(s.ph,m.k).filter(x=>x.tid!==me.id), all=svAll(), need=svPeerNeed(s,m.k,me), n=Object.keys(D).length;
  return `<p class="sv5-tip">幫其他人的「${esc(m.t)}」舞台打 1～5 顆星，<b>匿名</b>，不能評自己。至少評 <b>${need}</b> 位才能交。分數會算進等級（佔 4 成）。${done?"已經交了，還可以改。":""}</p>`
    +(St.length?`<div class="sv5-prl">${St.map(x=>{ const t=all.find(y=>y.id===x.tid)||{}, v=D[x.tid]||0; return `<div class="sv5-pr"><button class="sv5-prt" data-a="svStage" data-v="${x.id}">${x.url?(x.kind==="v"?`<video src="${esc(x.url)}#t=0.1" muted playsinline preload="metadata"></video>`:`<img src="${esc(x.url)}" alt="">`):`<span class="sv2-p">${svPh(t)}</span>`}</button><div><b>${esc(t.name||"")}</b><small>點左邊看舞台</small><span>${[1,2,3,4,5].map(k=>`<button class="${k<=v?"on":""}" data-a="svPrS" data-v="${x.tid}|${k}" aria-label="${k} 顆星">★</button>`).join("")}</span></div></div>`; }).join("")}</div>`:`<p class="sv2-note">還沒有其他人交舞台</p>`)
    +`<button class="sv2-cta" data-a="svPrOk" ${n>=need&&need?"":"disabled"}>${done?"更新互評":"交出互評"}（已評 ${n} 位）</button>`; }

/* 第二輪：排名保密，只公開晉級線下一位（第 11 名） */
const svHid=s=>!!s&&s.ph==="r2";
const svHidN=()=>SV_KEEP.r2+1;
function svHidPyr(s,my,tr){ const rk=svRank(), all=svAll(), x=all.find(t=>t.id===rk[svHidN()-1]);
  const q=(id,i)=>`<div class="sv2-t"><span class="sv3-av"><span class="sv2-p"><i class="sv2-sil"></i></span></span><b>？</b><span>？</span></div>`;
  return `<section class="sv5-pyr"><h4>排名保密中・第二次排名發表才揭曉</h4>${svPyr(Array.from({length:SV_KEEP.r2},(v,i)=>i),q)}${x?`<div class="sv5-h11"><small>只公開</small>${svTile(x,`${svHidN()}位`,null,!tr&&my[x.id]||tr&&tr.id===x.id)}<small>晉級是前 ${SV_KEEP.r2} 位</small></div>`:""}</section>`; }

/* 點進去的頁面 */
function svRkList(s,pick){ const sc=svScores(), rk=svRank(), all=svAll(), B=ui.svB||{}, tr=svTrainee(s), cut=s.ph==="r1"?SV_KEEP.r1:s.ph==="r2"?SV_KEEP.r2:s.ph==="pr"?999:SV_DEB, T=id=>all.find(x=>x.id===id)||{id};
  const hid=svHid(s), h11=rk[svHidN()-1], row=(id,i)=>{ const x=T(id), c=B[id]||0; if(hid) i=id===h11?svHidN()-1:-1; return `<div class="sv2-row ${tr&&tr.id===id?"me":""}" data-a="uniGo" data-v="#/fan/core?p=survival&id=${id}"><span class="sv2-rk">${i<0?"？":i+1+"位"}</span><span class="sv2-av">${svPh(x)}</span><div class="sv2-nm"><b>${esc(x.name)}${svGrB(x,"ln")}</b><small>${esc(x.co||"個人練習生")}${i<0?"":`・${fmt(sc[id]||0)} 票`}</small></div>${tr||!pick?"":`<button class="sv2-pk ${c?"on":""}" data-a="svPick" data-v="${id}">${c?`已選 ${c}`:"PICK"}</button>`}</div>`; };
  return (pick&&!tr?`<p class="sv5-tip">今天還能投 <b>${svLeft()}</b> 票。按 PICK 選人，選好按下面的「送出」才算。</p>`:"")
    +(hid?`<p class="sv5-tip">第二輪排名保密，照名字排。只公開第 ${svHidN()} 名，第二次排名發表才揭曉。</p><div class="sv3-rl">${rk.slice().sort((a,b)=>String(T(a).name).localeCompare(String(T(b).name))).map(row).join("")}</div>`:"")
    +(hid?"":`<div class="sv3-rl">${rk.slice(0,cut).map(row).join("")}</div>`
    +(rk.length>cut?`<div class="sv2-sh out"><b>${s.ph==="final"?"出道組以外":"淘汰邊緣"}</b><i>${cut+1} 位以下</i></div><div class="sv3-rl">${rk.slice(cut).map((id,i)=>row(id,i+cut)).join("")}</div>`:"")); }
function svHowHtml(s){ const li=L=>`<ol class="sv5-rule">${L.map(x=>`<li>${x}</li>`).join("")}</ol>`, tr=svVoting()&&svTrainee(s);
  if(s.ph==="recruit") return li(["想當練習生的人按「報名」：填名字、生日、照片，選一個座位。1 號在最頂端，先選先贏；1 號有人坐了也可以挑戰（要另外選一個備用座位）。",
    "招募結束就開播，誰報名了要等開播才公開。",
    `開播後分三輪：第一輪留 ${SV_KEEP.r1} 位、第二輪留 ${SV_KEEP.r2} 位、決賽選出 ${SV_DEB} 位出道組。`,
    "國民製作人每天可以 PICK（第一、二輪每天 3 票，決賽每天 1 票）。",
    `出道組會以限定團體活動一年半。`]);
  const M=svMsList(s.ph);
  return (tr?li(["每個任務都要交舞台（影片或照片＋說明），國民製作人會看。","寫好排名發表時要說的感言。","參賽的練習生不能 PICK、不能投現場票。",`${SV_ANN[s.ph]}時，${s.ph==="final"?`前 ${SV_DEB} 位出道`:`前 ${s.ph==="r1"?SV_KEEP.r1:SV_KEEP.r2} 位晉級`}。`])
    :li([`每天可以 PICK ${svCap()} 票，選好按「送出」才算。${s.ph==="final"?"":"可以分給不同人，也可以全投同一位。"}`,"練習生每個任務都會交舞台，你可以看，每個任務投 1 張現場票。",`每個任務現場票前三名的練習生，拿 +${SV_BEN.join("／+")} 票。`,`${SV_ANN[s.ph]}時，${s.ph==="final"?`前 ${SV_DEB} 位出道`:`前 ${s.ph==="r1"?SV_KEEP.r1:SV_KEEP.r2} 位晉級`}。`]))
    +`<div class="sv5-sh">這一輪的任務</div><div class="sv4-ml">${M.map(x=>`<span class="${svMsSt(s,x)==="進行中"?"on":svMsSt(s,x)==="已結束"?"end":""}"><b>${esc(x.t)}</b><small>${svMsWhen(s,x)}・${svMsSt(s,x)}</small></span>`).join("")}</div>`; }
function svSubHtml(s,v){ const t={pick:"PICK 練習生",rk:"全部排名",st:"任務舞台",how:"怎麼玩？",gr:s.grade0?"主題曲重新評價":"等級評價",peer:"練習生互評",c1:s.ph==="r1"&&svC1(s).done?"1 分鐘 PR":"1 號位對決"}[v];
  if(!t) return ""; if(v==="c1"&&s.ph!=="r1") return ""; if(["pick","rk","st","c1","gr","peer"].includes(v)&&!svVoting()) return "";
  return svBack5(t)+(v==="gr"?svGrHtml(s):v==="peer"?svPeerHtml(s):v==="pick"||v==="rk"?svRkList(s,v==="pick"):v==="st"?svStageHtml(s):v==="c1"?svC1Html(s):svHowHtml(s)); }

/* 節目結束（粉絲、落選的人） */
function svEndHtml(s){ const all=svAll(), D=s.debut||[], T=id=>all.find(x=>x.id===id)||{id,name:"?"};
  return `<div class="sv5-end"><small>${s.g==="b"?"男團":"女團"}第 ${s.no||1} 季</small><h2>節目結束</h2></div>`
    +svPyr5(`出道組 ${D.length} 位`,D,(id,i)=>svTile(T(id),i?`${i+1}位`:"C位",null,0,"div"))
    +svHost(s,"謝謝國民製作人一路陪伴！這一季的節目到這裡結束了，出道那天，我們舞台上見！"); }
/* 出道組：一次只說一件事 */
function svPrepTodo(s){ const me=svMe(s), P=svPrep(), ld=P.leader, lead=ld===me.id, f=P.draft||{}, ck=P.draft?dbCheck(f):[], miss=ck.find(x=>!x[1]), openLead=(P.polls||[]).some(p=>p.lead&&!p.closed);
  if(!ld) return svCard5("你們現在要做的事","選隊長",openLead?"隊長選舉投票中。大家都投完，由開投票的人按「結束投票」，票最多的人當隊長。":"開一個「隊長選舉」匿名投票，票最多的人當隊長。隊長負責填出道申請。",openLead?"":`<button data-a="svPvNew" data-v="lead">開隊長選舉</button>`);
  if(!P.draft) return svCard5("你們現在要做的事","打開出道申請",lead?"你是隊長！打開出道申請開始填：出道曲、MV、宣傳排程…都在裡面。":"等隊長打開出道申請。有想法就在下面聊天室說，或開匿名投票。",`<button data-a="svDebutApply">${lead?"打開出道申請":"看出道申請"}</button>`);
  if(miss) return svCard5("你們現在要做的事",`填「${esc(miss[0])}」`,lead?"填好按儲存，大家都看得到進度。意見不一樣就先開匿名投票。":"請隊長填。想先討論就在聊天室說，或開匿名投票。",`<div class="sv5-2b"><button data-a="svDebutApply">${lead?"去填":"看出道申請"}</button><button class="gh" data-a="svPvNew">開投票</button></div>`);
  return svCard5("你們現在要做的事","正式送出出道申請",lead?"全部都填好了！確認沒問題就按「正式送出」，送出後選秀就會從大家的畫面消失。":"全部都填好了，等隊長按「正式送出」。",`<button data-a="svDebutApply">${lead?"去送出":"看出道申請"}</button>`); }
function svAfterHtml(s){ const D=s.debut||[], me=svMyEntry(), win=s.demo||me&&D.includes(me.id), db=s.demo?null:getDebut().find(x=>x.sv===s.id&&x.status!=="gone");
  if(!svIsPrepMember(s)) return svEndHtml(s);   /* 粉絲、落選的人、已經送出出道申請的出道組：節目結束了 */
  const P=svPrep(), all=svAll(), ck=P.draft?dbCheck(P.draft):[], ld=P.leader&&svMemOf(P.leader,id=>all.find(x=>x.id===id)||{id,name:"?"});
  return svSt5("出道準備・只有出道組看得到",`出道 <b>還有 ${svCd(s)}</b>`)
    +svTrio([[`${svDaysL(s)} 天`,"出道倒數"],[ld?esc(ld.name):"未定","隊長"],[ck.length?`${ck.filter(x=>x[1]).length}／${ck.length}`:"未開始","出道申請"]])
    +(db&&db.status==="no"?`<p class="sv2-note">出道申請沒有通過，可以修改後重新送出</p>`:"")
    +svPrepTodo(s)+svChatHtml(s)+(win?svPrepHtml(s):""); }
function svProfile(id){ const s=svSeason(), x=svById(id); if(!x) return `<main class="page"><p class="me-none">找不到這位練習生</p></main>`;
  const sc=svScores(), rk=svRank(), r=rk.indexOf(id)+1, my=svMine()[id]||0, alive=svAlive().has(id), c=(ui.svB||{})[id]||0;
  return `<main class="page sv2 ${svTheme()}"><section class="sv2-prof"><div class="sv2-pp">${svPh(x)}</div>${r&&svVoting()&&!svHid(s)?`<span class="sv2-no">${pad(r)}</span>`:""}<div class="sv2-pn">${svGrade(x)?`<i class="sv3-gr big g${svGrade(x)}">${svGrade(x)}</i>`:""}<small>${esc(x.co||"個人練習生")}</small><b>${esc(x.name)}</b></div></section>
    ${svVoting()?svBar([[alive?(svHid(s)?"？":fmt(sc[id]||0)):"—","這一輪票數"],[alive&&r?(svHid(s)?"保密":r+"位"):"淘汰","目前順位"],[my,"我的 PICK"]]):""}
    ${x.seat?`<p class="sv2-note">選秀第一天坐在 ${x.seat} 號位</p>`:""}
    ${x.ps||x.intro?`<div class="sv2-sh"><b>個性</b></div><p class="sv3-intro">${esc(x.ps||x.intro)}</p>`:""}${(x.sk||[]).length?`<div class="sv2-sh"><b>擅長</b></div><div class="sv3-sk">${x.sk.map(k=>`<span>${esc(k)}</span>`).join("")}</div>`:""}
    ${x.msg?`<div class="sv2-sh"><b>想對國民製作人說的話</b></div><p class="sv3-intro">${esc(x.msg)}</p>`:""}
    ${[["r1","第一次排名發表"],["r2","第二次排名發表"],["final","出道感言"]].filter(([k])=>(s.ann||{})[k]&&((s.keep||{})[k]||[]).concat(k==="final"?s.debut||[]:[]).includes(id)&&svSpeech(x,k)).map(([k,l])=>`<div class="sv2-sh"><b>${l}</b></div><p class="sv3-intro">「${esc(svSpeech(x,k))}」</p>`).join("")}
    ${svVoting()&&alive?`${svTrainee(svSeason())?"":`<button class="sv2-cta" data-a="svPick" data-v="${id}" ${svLeft()-Object.values(ui.svB||{}).reduce((a,b)=>a+b,0)>0?"":"disabled"}>${c?`已選 ${c} 票・再 PICK 一次`:`PICK ${esc(x.name)}`}</button>`}`:""}</main>${svVoting()?svBasketHtml():""}`; }

/* ---------- 報名表（名字、生日、公司、照片、自我介紹） ---------- */
/* 報名頁：點座位、挑戰、擅長只換那一塊，不整頁重畫 */
const svfSeatHtml=f=>`${f.ch1?`<p class="svf-ch1">你要挑戰 1 號位！開播後前 2 天由國民製作人投票，決定誰坐 1 號位，坐上的人有 1 分鐘 PR 時間。請再選一個<b>備用座位</b>，沒搶到就坐那裡。</p>`:""}${svSeatHtml(svSeats(),myEmail(),f.seat)}`;
const svfSeatUp=()=>{ const el=document.getElementById("svfSeat"); if(el) el.innerHTML=svfSeatHtml(ui.svF); else svApplyForm(); };
function svApplyForm(){ const e=svMyEntry()||{}, f=ui.svF||(ui.svF={name:e.name||"",bd:e.bd||"",photo:e.photo||"",seat:e.seat||0,ch1:e.ch1||0,ps:e.ps||e.intro||"",sk:[...(e.sk||[])],msg:e.msg||""}), s=svSeason()||{}, co=s.demo?"":svCoOf(myEmail());
  setLayer(`<div class="tiei svf sv2 ${svTheme()}"><header class="tiei-top"><button class="icon-btn" data-a="tCloseLayer" aria-label="關閉">${I.back}</button><b>${e.id?"修改報名資料":"練習生報名"}</b><span class="sh-sp"></span></header><div class="tiei-body">
    <section class="sv2-pyr svf-hd"><div class="sv2-rib"><span>SURVIVAL PROJECT</span><span>${s.g==="b"?"男團":"女團"}第 ${s.no||1} 季・練習生報名</span></div>
      <div class="sv2-rows"><div class="sv2-r"><button class="sv2-t svf-ph ${f.photo?"me":""}" data-a="svPhoto" aria-label="大頭照"><span class="sv2-p">${f.photo?`<img src="${esc(f.photo)}" alt="">`:`<i class="sv2-sil"></i>`}</span><b>${f.photo?"換照片":"＋ 大頭照"}</b><span>${esc(f.name)||"？"}</span></button></div></div><div class="sv2-foot">《PICK ME》</div></section>
    <label class="svf-l">名字</label><input id="svName" class="svf-in" maxlength="16" placeholder="選上就用這個名字出道" value="${esc(f.name)}">
    <label class="svf-l">生日 <em>2013 年（含）以前出生才能報名</em></label><input id="svBd" class="svf-in" type="date" max="2013-12-31" value="${esc(f.bd)}">
    <label class="svf-l">公司</label><p class="svf-co">${esc(co||"個人練習生")}</p>
    <label class="svf-l">選座位 <em>1 號在最頂端，先選先贏</em></label><div id="svfSeat">${svfSeatHtml(f)}</div>
    <label class="svf-l">個性</label><textarea id="svPs" class="svf-in" rows="3" maxlength="200" placeholder="例：慢熟，熟了之後很吵">${esc(f.ps)}</textarea>
    <label class="svf-l">擅長 <em>可以選很多個</em></label><div class="chips wrap co-chips">${SV_SK.map(k=>`<button class="chip ${f.sk.includes(k)?"on":""}" data-a="svSk" data-v="${k}">${k}</button>`).join("")}</div>
    <label class="svf-l">想對國民製作人說的話</label><textarea id="svMsg" class="svf-in" rows="3" maxlength="200" placeholder="輸入文字">${esc(f.msg)}</textarea>
    <button class="sv2-cta" data-a="svApplyOk">${e.id?"儲存":"送出報名"}</button>${e.id?`<button class="svf-quit" data-a="svQuit">取消報名</button>`:""}</div></div>`); }
const svKeep=()=>{ const f=ui.svF; if(!f) return; const v=id=>(document.getElementById(id)||{}).value; [["name","svName"],["bd","svBd"],["ps","svPs"],["msg","svMsg"]].forEach(([k,id])=>{ const x=v(id); if(x!=null) f[k]=x.trim(); }); };
/* 感言：每一輪發表前寫好，被叫到名字時顯示 */
function svSpeakForm(){ const s=svSeason(), me=svMyEntry(); if(!s||!me) return; const l=s.ph==="final"?"出道感言":s.ph==="r1"?"第一次排名發表的感言":"第二次排名發表的感言";
  tieModal(l,`<p class="fy-info">發表時叫到你的名字，就會出現這段話${s.ph==="final"?"（沒出道的話不會公開）":""}。</p><textarea id="svSp" class="a-nick-in dbx-ta" rows="4" maxlength="120" placeholder="輸入文字">${esc((me.sp||{})[s.ph]||"")}</textarea>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="svSpeakOk">儲存</button>`); }

/* ---------- 管理員（FOC → 選秀） ---------- */
function svGrAdm(s){ const P=s.grPub||{}, nx=SV_GRK.find(k=>!P[k]); const prev=nx?svGrCalc(s,nx).G:null, cnt=prev?SV_GR.map(g=>`${g} ${Object.values(prev).filter(x=>x===g).length}`).join("・"):"";
  return `<div class="sv5-adm"><b>等級評價（自動算，不能手動改）</b><p class="ae-tip">粉絲現場票 6 成＋練習生互評 4 成，照名次給 A 10%・B 20%・C 25%・D 25%・F 20%。任務期限到了會自動公布；導師評語在「舞台」點開寫，沒寫就用預設的。</p>
    ${SV_GRK.map(k=>`<p class="ae-tip">${k==="lv"?"等級評價":"主題曲重新評價"}：${P[k]?`已公布（${new Date(P[k]).toLocaleString()}）`:"還沒公布"}</p>`).join("")}
    ${nx&&(nx==="lv"||P.lv)?`<p class="ae-tip">現在算的話：${cnt}</p><button class="btn btn-soft" data-a="svGrPubNow" data-v="${nx}">現在就公布${nx==="lv"?"等級評價":"重新評價"}</button>`:""}</div>`; }
function svAdminHtml(){ const s=svSeason(), E=svEntries();
  if(!s||s.ph==="done") return `<section class="card studio"><p class="ae-tip">${s?"上一季已經結束。":""}開一季新的選秀：先招募 1 週，真人不到 ${SV_MIN} 位會自動延長。</p><div class="ls-btns"><button class="btn btn-main" data-a="svNew" data-v="g">開新一季（女團）</button><button class="btn btn-soft" data-a="svNew" data-v="b">開新一季（男團）</button></div><p class="ae-tip" style="margin-top:12px">虛擬練習生的照片（一次可以選很多張，會依序放進還沒有照片的人）</p><div class="ls-btns"><button class="btn btn-soft" data-a="svNpcPh" data-v="g">女生照片（${Object.keys(S.get(SVNP,{})||{}).filter(k=>k[0]==="n").length}／${SV_N}）</button><button class="btn btn-soft" data-a="svNpcPh" data-v="b">男生照片（${Object.keys(S.get(SVNP,{})||{}).filter(k=>k[0]==="m").length}／${SV_N}）</button></div></section>`;
  const rk=svVoting()?svRank():[], sc=svVoting()?svScores():{}, all=svAll();
  const chat=s.ph==="prep"&&!s.demo?`<section class="card studio sv2 ${svTheme()}">${svChatHtml(s,true)}</section>`:"";   /* 出道準備：管理員用主持人身分回答出道組 */
  return chat+`<section class="card studio"><p class="ae-tip">${s.g==="g"?"女團":"男團"}第 ${s.no||1} 季・<b>${SV_PH[s.ph]}</b>${s.end?`・${new Date(s.end).toLocaleString()} 自動公布／進下一階段`:""}${s.ext?`・招募已延長 ${s.ext} 次（真人 ${E.length}／至少 ${SV_MIN}）`:""}</p>
    <div class="sv3-adm">${s.ph!=="prep"?`<button class="btn btn-soft" data-a="svNext">現在就${s.ph==="recruit"?"結束招募":"公布"}</button>`:`<button class="btn btn-soft" data-a="svDone">出道完成，結束這一季</button>`}<button class="btn btn-soft" data-a="svPrepW">出道準備 ${s.prepW||3} 週</button><button class="btn btn-soft" data-a="svCast">主持人・導師</button><button class="btn btn-soft" data-a="svNpcPh" data-v="${s.g==="b"?"b":"g"}">虛擬練習生照片 ${Object.keys(S.get(SVNP,{})||{}).filter(k=>k[0]===(s.g==="b"?"m":"n")).length}/${SV_N}</button><button class="btn btn-soft" data-a="svEnd">取消這一季</button></div>
    ${s.ph==="r1"?svGrAdm(s):""}
    ${svMsList(s.ph).length?`<p class="ae-tip">這一輪的任務：${svMsList(s.ph).map(m=>`${m.t}（第 ${m.d[0]+1}～${m.d[1]} 天）`).join("→")}。現場票前三名自動加 ${SV_BEN.join("／")} 票；舞台點開可以寫導師評語。</p>`:""}</section>
    ${svVoting()?`<div class="section-h">這一輪排名・加分票</div><section class="card studio">${rk.map((id,i)=>{ const x=all.find(t=>t.id===id)||{}; return `<div class="sv2-row"><span class="sv2-rk">${i+1}</span><div class="sv2-nm"><b>${esc(x.name)}${x.real?"":"<small>（虛擬）</small>"}</b><small>${fmt(sc[id]||0)} 票</small></div><i class="sv3-gr g${svGrade(x)}">${svGrade(x)||"－"}</i><button class="btn btn-soft btn-sm" data-a="svBonus" data-v="${id}">加分</button></div>`; }).join("")}</section>`:""}
    ${E.length?`<div class="section-h">報名的人（${E.length}）</div><section class="card studio">${E.map(e=>`<div class="sv2-row"><div class="sv2-nm"><b>${esc(e.name)}</b><small>${esc(acctUser(e.email))}・${esc(e.co||"個人練習生")}</small></div><button class="btn btn-soft btn-sm" data-a="svKick" data-v="${e.id}">移除</button></div>`).join("")}</section>`:""}`; }

/* ---------- 動作 ---------- */
/* 票送到雲端之後：記今天用了幾票、我投過誰，跳結果 */
function svSent(s,B,n){ S.set(acK("daisuki_sv_day"),{k:svDayK(),n:svUsed()+n}); const my=S.get(acK("daisuki_sv_my"),{})||{}; Object.entries(B).forEach(([id,c])=>{ my[id]=(my[id]||0)+c; }); S.set(acK("daisuki_sv_my"),my);
  const all=svAll(), rk=svRank(), y=window.scrollY; render(); window.scrollTo(0,y);
  xvResult({tone:svTheme()==="g"?"p":"b",small:"SURVIVAL PROJECT",title:"PICK 完成",big:`${n} 票`,chips:[...Object.keys(B).map(id=>`${(all.find(x=>x.id===id)||{}).name} 現在 ${rk.indexOf(id)+1}位`),svLeft()?`今天還能投 ${svLeft()} 票`:"今天投完了，明天再來"],back:"好"}); }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a; if(!/^sv(Pick|Unpick|Send|Apply|ApplyOk|Photo|Co|Quit|New|Next|Done|PrepW|End|Bonus|BonusOk|Kick|RevealGo|DebutApply|Demo|xSkip|Seat|Sk|Speak|SpeakOk|Gr|GrOk|Mk|Stage|Lv|Up|UpPick|UpPos|UpOk|Cm|CmOk|Cast|CastOk|DbDraft|DbSave|MemEd|MemOk|PvNew|PvOk|Pvo|PvEnd|Tab|More|DemoT|NpcPh|Ch1|C1|ChSend|GrPubNow|GrPubOk|PrS|PrOk)$/.test(a)) return; e.stopImmediatePropagation();
  const rr=()=>{ const y=window.scrollY; render(); window.scrollTo(0,y); }, s=svSeason();
  switch(a){
    case "svPick": { if(!svVoting()) return; if(meBlocked()) return; if(svTrainee(s)){ toast("參賽的練習生不能投票"); return; } const B=ui.svB=ui.svB||{}, n=Object.values(B).reduce((x,y)=>x+y,0); if(n>=svLeft()){ toast(svLeft()?`今天最多再投 ${svLeft()} 票`:"今天的票投完了，明天再來"); return; } if(!svAlive().has(t.dataset.v)) return; B[t.dataset.v]=(B[t.dataset.v]||0)+1; rr(); return; }
    case "svUnpick": { const B=ui.svB||{}; if(B[t.dataset.v]) B[t.dataset.v]--; if(!B[t.dataset.v]) delete B[t.dataset.v]; rr(); return; }
    case "svSend": { const B=ui.svB||{}, n=Object.values(B).reduce((x,y)=>x+y,0); if(!n||!s||!svVoting()) return; if(n>svLeft()){ ui.svB={}; rr(); toast("票數不對，請重新選"); return; }
      if(s.demo){ ui.svDV=ui.svDV||{}; Object.entries(B).forEach(([id,c])=>{ ui.svDV[id]=(ui.svDV[id]||0)+c; }); ui.svDU=(ui.svDU||0)+n; const all=svAll(), rk=svRank(); ui.svB={}; rr(); xvResult({tone:"p",small:"示範・不會存",title:"PICK 完成",big:`${n} 票`,chips:[...Object.keys(B).map(id=>`${(all.find(x=>x.id===id)||{}).name} 現在 ${rk.indexOf(id)+1}位`),svLeft()?`今天還能投 ${svLeft()} 票`:"今天投完了，明天再來"],back:"好"}); return; }
      /* 11/23 票數修正：以前是「拿手機裡的那份票數＋自己的票，整份蓋回雲端」，手機那份還沒更新（或兩個人同時投）時，別人的票會被蓋掉；改成在雲端那份上加（有版本號，同時投也不會互蓋） */
      const ph0=s.ph, sid0=s.id, B0={...B}; ui.svB={}; t.disabled=true;
      mkEdit(SVV,v=>{ const o={...(v||{})}; o[sid0]={...(o[sid0]||{})}; o[sid0][ph0]={...(o[sid0][ph0]||{})}; Object.entries(B0).forEach(([id,c])=>{ o[sid0][ph0][id]=(o[sid0][ph0][id]||0)+c; }); return {v:o}; }).then(()=>svSent(s,B0,n)).catch(()=>{ ui.svB=B0; t.disabled=false; rr(); toast("票沒有送出去，再按一次"); }); return; }
    case "svDemo": { const v=t.dataset.v||""; if(v[0]==="a"){ const st=v.slice(2); ui.svDemoNo=(ui.svDemoNo||0)%3+1; ui.svDemo={r1:"r2",r2:"pr",final:"prep"}[st]; ui.svB={}; rr(); svReveal(st); return; } ui.svDemo=v||null; ui.svB={}; ui.svDU=0; ui.svDV={}; rr(); window.scrollTo(0,0); return; }
    case "svxSkip": { ui.svxT=0; ui.svxDone&&ui.svxDone(); return; }
    case "svApply": { if(s&&s.demo){ ui.svF=null; svApplyForm(); return; } if((session()||{}).role!=="fan"||svIsArtist(myEmail())){ toast("藝人的帳號不能報名選秀"); return; } if(isWealth(myEmail())){ toast("財富榜的帳號不參加選秀"); return; } ui.svF=null; svApplyForm(); return; }
    case "svPhoto": { svKeep(); const inp=document.createElement("input"); inp.type="file"; inp.accept="image/*"; inp.onchange=async()=>{ const f0=inp.files&&inp.files[0]; if(!f0) return; const c=await cropImg(f0,{ratio:4/5,max:1080}); if(!c) return;
        try{ const b=await shrinkImg(c,1080); ui.svF.photo=URL.createObjectURL(b); svApplyForm(); if((svSeason()||{}).demo) return; const url=(HB_ON&&await hbImgUrl("sv_"+Date.now().toString(36)+".jpg",b))||await new Promise(res=>{ const rd=new FileReader(); rd.onload=()=>res(rd.result); rd.readAsDataURL(b); }); ui.svF.photo=url; svApplyForm(); }catch(er){ toast("這張圖讀不出來"); } }; pickClick(inp); return; }
    case "svChSend": { const inp=document.getElementById("svChIn"), v=inp&&inp.value; if(!v||!v.trim()) return; svChatSend(s,v,t.dataset.v==="host"); rr(); setTimeout(()=>{ const l=document.getElementById("svChL"); if(l) l.scrollTop=l.scrollHeight; },60); return; }
    case "svCh1": { svKeep(); ui.svF.ch1=ui.svF.ch1?0:1; if(ui.svF.seat===1) ui.svF.seat=0; svfSeatUp(); if(ui.svF.ch1) toast("再選一個備用座位，沒搶到就坐那裡"); return; }
    case "svC1": { svC1Vote(t.dataset.v); return; }
    case "svSeat": { svKeep(); ui.svF.seat=+t.dataset.v; svfSeatUp(); return; }
    case "svSk": { svKeep(); const L=ui.svF.sk, k=t.dataset.v, i=L.indexOf(k); if(i>=0) L.splice(i,1); else L.push(k); t.classList.toggle("on",i<0); return; }
    case "svSpeak": { if(s&&s.demo){ toast("示範：練習生會在這裡寫感言"); return; } svSpeakForm(); return; }
    case "svSpeakOk": { const me=svMyEntry(), v=((document.getElementById("svSp")||{}).value||"").trim(); if(!me||!s) return; mkEdit(SVE,o=>({v:(Array.isArray(o)?o:[]).map(x=>x.id===me.id?{...x,sp:{...(x.sp||{}),[s.ph]:v}}:x)})).then(()=>{ layer.innerHTML=""; rr(); toast("感言已儲存"); }).catch(()=>toast("沒有存到，再試一次")); return; }
    case "svApplyOk": { svKeep(); const f=ui.svF; if(s&&s.demo){ ui.svF=null; layer.innerHTML=""; toast("示範：這樣就報名完成了（不會真的存）"); return; } if(!s||s.ph!=="recruit"){ toast("報名已經截止了"); return; } if(!f.name){ toast("請輸入名字"); return; } if(nameBlock&&nameBlock(f.name)) return; if(!f.bd){ toast("請選生日"); return; } if(f.bd>="2014-01-01"){ toast("報名資格：2013 年（含）以前出生"); return; } if(!f.photo||f.photo.startsWith("blob:")){ toast(f.photo?"照片還在上傳，等一下":"請放一張大頭照"); return; } if(!f.seat){ toast(f.ch1?"挑戰 1 號位也要再選一個備用座位":"請選一個座位"); return; } if(svSeats()[f.seat]&&svSeats()[f.seat].email!==myEmail()){ toast("這個座位剛剛被選走了，換一個"); return; } if(f.ps.length<5){ toast("個性再多寫一點"); return; } if(!f.sk.length){ toast("請選擅長的"); return; } if(f.msg.length<5){ toast("想對國民製作人說的話再多寫一點"); return; }
      if(svEntries().some(x=>x.email!==myEmail()&&x.name.toLowerCase()===f.name.toLowerCase())||GROUPS.some(g=>g.name.toLowerCase()===f.name.toLowerCase())){ toast("這個名字已經有人用了"); return; }
      const me=myEmail(), row={name:f.name,bd:f.bd,photo:f.photo,seat:f.seat,ch1:f.ch1?1:0,ps:f.ps,sk:f.sk,msg:f.msg}, nid=uid("sve"), had=(S.get(SVE,[])||[]).some(x=>x.sid===s.id&&x.email===me&&!x.out);
      mkEdit(SVE,v=>{ const L=[...(Array.isArray(v)?v:[])], i=L.findIndex(x=>x.sid===s.id&&x.email===me&&!x.out); if(i>=0) L[i]={...L[i],...row,edited:Date.now()}; else L.push({id:nid,sid:s.id,email:me,ts:Date.now(),...row}); return {v:L}; }).then(()=>{ ui.svF=null; layer.innerHTML=""; rr(); toast(had?"已儲存":"報名完成，招募結束後開始投票"); }).catch(()=>toast("沒有送出去，再按一次")); return; }
    case "svQuit": { ask("確定要取消報名嗎？",()=>{ mkEdit(SVE,o=>({v:(Array.isArray(o)?o:[]).map(x=>x.sid===(s||{}).id&&x.email===myEmail()?{...x,out:Date.now()}:x)})).then(()=>{ layer.innerHTML=""; rr(); toast("已取消報名"); }).catch(()=>toast("沒有送出去，再試一次")); }); return; }
    case "svNew": { if(!isAdminAcct()) return; const now=Date.now(), no=(S.get("daisuki_sv_doneN",0)||0)+1; S.set(SVS,{id:"sv"+now.toString(36),no,g:t.dataset.v,ph:"recruit",t0:now,t0s:{recruit:now},end:now+SV_DUR.recruit*864e5,prepW:3}); S.set("daisuki_sv_theme",t.dataset.v); rr(); toast("新一季開始招募了"); return; }
    case "svNext": { ask(s&&s.ph==="recruit"?"現在就結束招募、開始第一輪嗎？（真人不到 "+SV_MIN+" 位也會開始）":"現在就公布這一輪的結果嗎？",()=>{ svAdvance(true); rr(); toast("已公布"); }); return; }
    case "svPrepW": { S.set(SVS,{...s,prepW:(s.prepW||3)===3?4:3,...(s.ph==="prep"?{end:(s.t0||Date.now())+((s.prepW||3)===3?4:3)*7*864e5}:{})}); rr(); return; }
    case "svDone": { S.set("daisuki_sv_doneN",Math.max(S.get("daisuki_sv_doneN",0)||0,s.no||1)); S.set(SVS,{...s,ph:"done",end:0}); rr(); return; }
    case "svEnd": { ask("確定要取消這一季嗎？報名、票數都會清掉。",()=>{ S.set(SVS,{id:(s||{}).id||"",ph:"x",ts:Date.now()}); rr(); toast("已取消"); }); return; }
    case "svBonus": { const x=svById(t.dataset.v); tieModal(`幫 ${esc(x?x.name:"")} 加分`,`<p class="fy-info">任務表現好的，在這一輪加分票（可以打負數扣掉）</p><input id="svBn" class="a-nick-in" type="number" inputmode="numeric" placeholder="例：100">`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="svBonusOk" data-v="${t.dataset.v}">加上去</button>`); return; }
    case "svGr": { if(!isAdminAcct()) return; const x=svById(t.dataset.v), g=svGrade(x); tieModal(`${esc(x?x.name:"")} 的等級`,`<p class="fy-info">導師看完等級評價的舞台後標上；主題曲重新評價時也可以改。</p>`,`<div class="sv3-grp">${SV_GR.map(k=>`<button class="sv3-gr big g${k} ${k===g?"on":""}" data-a="svGrOk" data-v="${t.dataset.v}|${k}">${k}</button>`).join("")}<button class="t-mbtn" data-a="svGrOk" data-v="${t.dataset.v}|">清除</button></div>`); return; }
    case "svGrPubNow": { if(!isAdminAcct()||!s) return; tieModal("現在就公布？",`<p class="fy-info">公布後大家都會看到等級，不能改。</p>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="svGrPubOk" data-v="${t.dataset.v}">公布</button>`); return; }
    case "svGrPubOk": { if(!isAdminAcct()||!s) return; S.set(SVS,svGrPub(s,t.dataset.v)); layer.innerHTML=""; rr(); toast("已公布"); return; }
    case "svPrS": { const [id,k]=t.dataset.v.split("|"); ui.svPr=ui.svPr||{}; ui.svPr[id]=+k; t.parentNode.querySelectorAll("button").forEach((b,i)=>b.classList.toggle("on",i<+k)); const me=svTrainee(s), m=svMsNow(s), need=me&&m?svPeerNeed(s,m.k,me):0, n=Object.keys(ui.svPr).length, ok=document.querySelector('[data-a="svPrOk"]'); if(ok){ ok.disabled=!(n>=need&&need); ok.textContent=ok.textContent.replace(/已評 \d+ 位/,`已評 ${n} 位`); } return; }
    case "svPrOk": { const me=svTrainee(s), m=s&&svMsNow(s); if(!me||!m) return; const D={...(ui.svPr||{})}; delete D[me.id];
      if(s.demo){ ui.svPrD=ui.svPrD||{}; ui.svPrD[m.k]={...(ui.svPrD[m.k]||{}),[me.id]:D}; ui.svGrD=null; ui.svPr=null; toast("示範：互評交出去了"); history.back(); return; }
      const key=s.id+"|"+m.k; t.disabled=true;
      kvCas(SVPR,v=>{ const o={...(v||{})}; o[key]={...(o[key]||{}),[me.id]:D}; return {v:o}; }).then(()=>{ toast("互評交出去了"); ui.svPr=null; history.back(); }).catch(()=>{ t.disabled=false; toast("沒有送出，請再試一次"); }); return; }
    case "svGrOk": { const [id,k]=t.dataset.v.split("|"), G={...(s.grade||{})}; if(k) G[id]=k; else delete G[id]; S.set(SVS,{...s,grade:G}); layer.innerHTML=""; rr(); toast(k?`已標 ${k} 等級`:"已清除"); return; }
    case "svTab": { ui.svTab=t.dataset.v; rr(); return; }
    case "svMore": { ui.svMore=1; rr(); return; }
    case "svDemoT": { ui.svDemoT=t.dataset.v?1:0; ui.svTab="rk"; rr(); return; }
    case "svNpcPh": { if(!isAdminAcct()) return; const g=t.dataset.v, L=g==="g"?svNpcL("g"):svNpcL("b"), inp=document.createElement("input"); inp.type="file"; inp.accept="image/*"; inp.multiple=true;
      inp.onchange=async()=>{ const F=[...(inp.files||[])].slice(0,L.length); if(!F.length) return; const M={...(S.get(SVNP,{})||{})}; let k=0; toast(`上傳中…（${F.length} 張）`);
        for(let i=0;i<L.length&&k<F.length;i++){ const id=L[i][0]; if(M[id]&&!ui.svNpcAll) continue; try{ const b=await shrinkImg(F[k++],900), url=HB_ON&&!(s&&s.demo)?await hbImgUrl("svnpc_"+id+"_"+Date.now().toString(36)+".jpg",b):URL.createObjectURL(b); if(url) M[id]=url; }catch(er){} }
        S.set(SVNP,M); rr(); toast(`已放好 ${k} 張`); }; pickClick(inp); return; }
    case "svMk": { ui.svMk=t.dataset.v; rr(); return; }
    case "svStage": { svStageView(t.dataset.v); return; }
    case "svLv": { if(!s||!svVoting()||meBlocked()) return; if(svTrainee(s)){ toast("參賽的練習生不能投現場票"); return; } const x=svStages(s.ph).find(y=>y.id===t.dataset.v); if(!x) return; const k=s.id+x.mk;
      if(s.demo){ ui.svDLm={...(ui.svDLm||{}),[k]:x.id}; ui.svDL={...(ui.svDL||{}),[x.id]:((ui.svDL||{})[x.id]||0)+1}; }
      else { const M=S.get(acK("daisuki_sv_lv"),{})||{}; if(M[k]){ toast("這個任務已經投過現場票了"); return; } M[k]=x.id; S.set(acK("daisuki_sv_lv"),M); mkEdit(SVLV,v=>{ const L={...(v||{})}; L[x.id]=(L[x.id]||0)+1; return {v:L}; }).catch(()=>{}); }
      layer.innerHTML=""; rr(); toast("現場票投好了"); return; }
    case "svUp": { ui.svU=null; svUpForm(); return; }   /* 11/23 示範也打得開（交了只存在這支手機，不會送出） */
    case "svUpPos": { svUKeep(); ui.svU.pos=t.dataset.v; svUpForm(); return; }
    case "svUpPick": { svUKeep(); const f=ui.svU; if(f.busy) return; const inp=document.createElement("input"); inp.type="file"; inp.accept="video/*,image/*"; inp.onchange=async()=>{ const fl=inp.files&&inp.files[0]; if(!fl) return; const v=/^video/.test(fl.type);
        if(v&&fl.size>150*1048576){ toast("影片太大了（最多 150MB），剪短一點再上傳"); return; }
        try{ f.busy="上傳中…"; svUpForm(); const b=v?fl:await shrinkImg(fl,1600), url=HB_ON?await hbImgUrl("svs_"+Date.now().toString(36)+(v?".mp4":".jpg"),b):URL.createObjectURL(b); f.busy=""; if(!url){ toast("上傳失敗，再試一次"); svUpForm(); return; } f.url=url; f.kind=v?"v":"i"; svUpForm(); }catch(er){ f.busy=""; toast("這個檔案讀不出來"); svUpForm(); } }; pickClick(inp); return; }
    case "svUpOk": { svUKeep(); const f=ui.svU, me=s&&s.demo?svTrainee(s):svMyEntry(), m=svMsNow(s); if(!f||!me||!m) return; if(f.busy){ toast("還在上傳，等一下"); return; } if(!f.url){ toast("請放影片或照片"); return; } if(m.team&&!f.team){ toast("請填組名"); return; } if(m.pos&&!f.pos){ toast("請選位置"); return; }
      if(s.demo){ ui.svDemoSt={...(ui.svDemoSt||{}),[m.k]:{url:f.url,kind:f.kind,cap:f.cap,team:f.team,pos:f.pos}}; ui.svU=null; layer.innerHTML=""; rr(); toast("示範：舞台交出去了（只在你的手機）"); return; }
      const row={url:f.url,kind:f.kind,cap:f.cap,team:f.team,pos:f.pos,ts:Date.now()}, nid=uid("svs");
      mkEdit(SVST,v=>{ const L=[...(Array.isArray(v)?v:[])], i=L.findIndex(x=>x.sid===s.id&&x.ph===s.ph&&x.mk===m.k&&x.tid===me.id&&!x.del); if(i>=0) L[i]={...L[i],...row}; else L.push({id:nid,sid:s.id,ph:s.ph,mk:m.k,tid:me.id,email:me.email,...row}); return {v:L}; }).then(()=>{ ui.svU=null; layer.innerHTML=""; rr(); toast("舞台交出去了"); }).catch(()=>toast("沒有送出去，再按一次")); return; }
    case "svCm": { const M=svMentors(s); tieModal("導師評語",`<select id="svCmM" class="a-nick-in">${M.map((m,i)=>`<option value="${i}">${esc(m.n)}（${esc(m.r)}）</option>`).join("")}</select><textarea id="svCmT" class="a-nick-in dbx-ta" rows="4" maxlength="200" placeholder="輸入文字" style="margin-top:8px"></textarea>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="svCmOk" data-v="${t.dataset.v}">加上去</button>`); return; }
    case "svCmOk": { const M=svMentors(s), m=M[+(document.getElementById("svCmM")||{}).value||0], tx=((document.getElementById("svCmT")||{}).value||"").trim(); if(!tx) return; S.set(SVST,(S.get(SVST,[])||[]).map(x=>x.id===t.dataset.v?{...x,cm:[...(x.cm||[]),{n:m.n,t:tx}]}:x)); layer.innerHTML=""; svStageView(t.dataset.v); toast("評語加上去了"); return; }
    case "svCast": { tieModal("主持人・導師",`<span class="fs-f-lab">主持人（國民製作人代表）</span><input id="svHn" class="a-nick-in" maxlength="20" value="${esc(svHostN(s))}"><span class="fs-f-lab" style="margin-top:10px">導師（一行一位：名字／Vocal、Dance 或 Rap）</span><textarea id="svMn" class="a-nick-in dbx-ta" rows="6">${esc(svMentors(s).map(m=>m.n+"／"+m.r).join("\n"))}</textarea>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="svCastOk">儲存</button>`); return; }
    case "svCastOk": { const hn=((document.getElementById("svHn")||{}).value||"").trim(), mn=((document.getElementById("svMn")||{}).value||"").split("\n").map(l=>l.split(/[／\/]/)).filter(x=>x[0]&&x[0].trim()).map(x=>({n:x[0].trim(),r:(x[1]||"").trim()||"導師"})); S.set(SVS,{...s,host:hn,mentors:mn}); layer.innerHTML=""; rr(); toast("已儲存"); return; }
    case "svBonusOk": { const n=Math.round(+((document.getElementById("svBn")||{}).value||0)); if(!n||!s) return; const B={...(s.bonus||{})}; B[s.ph]={...(B[s.ph]||{})}; B[s.ph][t.dataset.v]=(B[s.ph][t.dataset.v]||0)+n; S.set(SVS,{...s,bonus:B}); layer.innerHTML=""; rr(); toast("已加分"); return; }
    case "svKick": { ask("要把這位從選秀移除嗎？",()=>{ S.set(SVE,(S.get(SVE,[])||[]).map(x=>x.id===t.dataset.v?{...x,out:Date.now()}:x)); rr(); }); return; }
    case "svRevealGo": { layer.innerHTML=""; navTo("#/fan/core?p=survival"); return; }
    case "svDebutApply": { const me=svMe(s); if(!s||!me||!(s.debut||[]).includes(me.id)) return; const P=svPrep(), all=svAll(), T=id=>all.find(x=>x.id===id)||{id}, lead=svIsLeader(s), loc=s.demo?null:S.get(acK("daisuki_sv_dbdraft"),null);
      if(!lead&&!P.draft){ toast("隊長還沒開始填，選出隊長後由隊長填"); return; }
      const others=(s.debut||[]).filter(id=>id!==me.id).map(id=>svMemOf(id,T)), base={kind:"group",name:svMemOf(me.id,T).name,gname:"",bd:svMemOf(me.id,T).bd,co:svCoOf(me.email),mems:others.map(x=>({name:x.name,acc:acctUser(x.email||""),bd:x.bd})),teaser:"",tPrev:"",mv:null,mPrev:"",busy:"",sv:s.id,ltd:SV_LTD};
      const src=lead&&loc&&loc.sid===s.id&&(loc.at||0)>(P.savedAt||0)?loc.f:P.draft; ui.dbF={...base,...(src||{}),sv:s.id,ltd:SV_LTD,svRo:!lead,busy:""}; debutForm(); return; }
    case "svDbDraft": { dbKeep(); S.set(acK("daisuki_sv_dbdraft"),{sid:s.id,at:Date.now(),f:svDbClean(ui.dbF)}); toast("草稿存在這支手機了"); return; }
    case "svDbSave": { dbKeep(); if(!svIsLeader(s)) return; const f=svDbClean(ui.dbF); svPrepSet(P=>{ P.draft=f; P.savedAt=Date.now(); P.savedBy=svMemOf(svMe(s).id,id=>svById(id)||{}).name; }); try{ S.set(acK("daisuki_sv_dbdraft"),null); }catch(e){} toast("已儲存，團員都看得到"); return; }
    case "svMemEd": { const id=t.dataset.v, x=svMemOf(id,i=>svById(i)||{}), lead=svIsLeader(s); ui.svME={id,photo:x.photo||""}; tieModal(`編輯 ${esc(x.name)}`,`<span class="fs-f-lab">藝名</span><input id="svMeN" class="a-nick-in" maxlength="16" value="${esc(x.name||"")}"><span class="fs-f-lab">生日</span><input id="svMeB" class="a-nick-in" type="date" value="${esc(x.bd||"")}">${lead?`<span class="fs-f-lab">隊內定位 <em>隊長決定</em></span><input id="svMeP" class="a-nick-in" maxlength="30" placeholder="例：主唱、領舞、門面" value="${esc(x.pos||"")}">`:""}<span class="fs-f-lab">想對粉絲說的話</span><textarea id="svMeI" class="a-nick-in dbx-ta" rows="3" maxlength="200">${esc(x.say||"")}</textarea>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="svMemOk">儲存</button>`,"sv3-tm"); return; }
    case "svMemOk": { const e=ui.svME, g=k=>((document.getElementById(k)||{}).value||"").trim(), n=g("svMeN"); if(!e) return; if(!n){ toast("請輸入藝名"); return; } svPrepSet(P=>{ P.mem=P.mem||{}; P.mem[e.id]={...(P.mem[e.id]||{}),name:n,bd:g("svMeB"),say:g("svMeI"),...(document.getElementById("svMeP")?{pos:g("svMeP")}:{})}; }); layer.innerHTML=""; rr(); toast("已儲存"); return; }
    case "svPvNew": { const lead=t.dataset.v==="lead", T=id=>svMemOf(id,i=>svById(i)||{}); tieModal(lead?"隊長選舉":"開新投票",`<span class="fs-f-lab">要投什麼</span><input id="svPq" class="a-nick-in" maxlength="40" value="${lead?"誰當隊長？":""}" placeholder="例：出道曲選哪一首？"><span class="fs-f-lab">選項（一行一個，2～8 個）</span><textarea id="svPo" class="a-nick-in dbx-ta" rows="5">${lead?(s.debut||[]).map(id=>T(id).name).join("\n"):""}</textarea>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="svPvOk" data-v="${lead?"lead":""}">開始投票</button>`,"sv3-tm"); return; }
    case "svPvOk": { const q=((document.getElementById("svPq")||{}).value||"").trim(), o=((document.getElementById("svPo")||{}).value||"").split("\n").map(x=>x.trim()).filter(Boolean).slice(0,8); if(!q||o.length<2){ toast("要有題目和至少 2 個選項"); return; } const lead=t.dataset.v==="lead", id=uid("svp");
      svPrepSet(P=>{ P.polls=[...(P.polls||[]),{id,q,opts:o,by:svMe(s).id,ts:Date.now(),...(lead?{lead:1,ids:[...(s.debut||[])]}:{})}]; });
      if(s.demo){ const V={}; for(let i=0;i<(s.debut||[]).length-1;i++){ const k=svHash(id+i)%o.length; V[k]=(V[k]||0)+1; } ui.svDPV={...(ui.svDPV||{}),[id]:V}; } layer.innerHTML=""; rr(); return; }
    case "svPvo": { const [id,i]=t.dataset.v.split("|"); if(svPvMine()[id]) return; if(s.demo){ ui.svDPVm={...(ui.svDPVm||{}),[id]:String(+i+1)}; const V={...((ui.svDPV||{})[id]||{})}; V[i]=(V[i]||0)+1; ui.svDPV={...(ui.svDPV||{}),[id]:V}; }
      else { const M=S.get(acK("daisuki_sv_pvd"),{})||{}; M[id]=String(+i+1); S.set(acK("daisuki_sv_pvd"),M); mkEdit(SVPV,v=>{ const A={...(v||{})}; A[id]={...(A[id]||{})}; A[id][i]=(A[id][i]||0)+1; return {v:A}; }).catch(()=>{}); }
      const p=(svPrep().polls||[]).find(x=>x.id===id), tot=Object.values(svPv(id)).reduce((a,b)=>a+b,0); if(p&&p.lead&&tot>=(s.debut||[]).length) svPvClose(id); rr(); toast("投好了（匿名）"); return; }
    case "svPvEnd": { ask("要結束這個投票嗎？",()=>{ svPvClose(t.dataset.v); rr(); }); return; }
  } },true);
