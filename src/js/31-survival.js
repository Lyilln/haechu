/* =========================================================
   PRODUCE DAY（選秀）11/17 改版：照 PRODUCE 系列的流程，一季一季辦
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
/* 11/24 測試帳號：Bini（比泥，KIRIN 的小帳）也能開示範測 bug */
const svTester=x=>{ try{ const em=String(x.email||"").toLowerCase(), a=ACCOUNTS[em]||{}, nm=String(a.name||x.name||""); if(nm==="比泥"||/^bini$/i.test(nm)) return true; const r=S.get(SVS,null); return !!r&&(S.get(SVE,[])||[]).some(e=>e&&e.sid===r.id&&String(e.email||"").toLowerCase()===em&&/^bini$/i.test(String(e.name||"").trim())); }catch(e){ return false; } };
const svDemoOk=()=>{ try{ const x=session(); return !!x&&x.role==="fan"&&(String(x.email||"").toLowerCase()==="husay"||(typeof isHussey==="function"&&isHussey())||(sbxOn()&&!svTester(x))); }catch(e){ return false; } };   /* 11/24 Bini 測完了：不再開示範／預演 */   /* 11/18：正式站的帳號 email 不是 husay，改用 isHussey() 認 */
const SV_DEMO_N=["Yuna","Chaewon","Sieun","Hana","Ririka","Mina","Seoyeon","Nako","Jiwoo","Aria","Haeun","Rin"];
function svDemoSeason(){ const ph=ui.svDemo, now=Date.now(), E=SV_DEMO_N.map((n,i)=>"dm"+i), all=[...E,...svNpcL("g").slice(0,SV_N-E.length).map(x=>x[0])];
  return {id:"demo",demo:1,no:ui.svDemoNo||1,g:"g",ph,t0:now-2*864e5,end:now+(ph==="prep"?20:ph==="final"?5:ph==="recruit"?4:11)*864e5,npcN:SV_N-E.length,prepW:3,keep:{r1:all.filter((x,i)=>i%8!==7).slice(0,15),r2:E.slice(0,10)},debut:E.slice(0,7),rk:{r1:all,r2:E.slice(0,10),final:E.slice(0,10)},ann:{}}; }
const svReal=()=>{ const x=S.get(SVS,null); return x&&x.ph!=="x"?x:null; };   /* 取消的季留一個 ph:"x" 的記號，同步回來才不會又冒出來 */
/* 公司：管理員建帳號時設定（daisuki_acc_co），本人不能自己選；沒設定＝個人練習生 */
const SV_CO="daisuki_acc_co", svCoOf=em=>((S.get(SV_CO,{})||{})[String(em||"").toLowerCase()])||"";
const svIsArtist=em=>{ const a=ACCOUNTS[String(em||"").toLowerCase()]||{}; return a.role==="artist"||!!a.member; };
const SV_SK=["Vocal","Dance","Rap","Visual"];
const svRehOn=()=>{ try{ return sbxOn()&&localStorage.getItem("hc_sv_reh")==="1"; }catch(e){ return false; } };
const svSeason=()=>ui.svDemo&&!ui.svRealCtx&&svDemoOk()?svDemoSeason():svReal();
const svAdmOk=()=>isAdminAcct()||svRehOn();   /* 預演（試玩）中，這支手機自己跑開播、等級、發表、淘汰（只存在這支手機） */
/* 預演的時光機：把這一季所有時間往前推，等於「現在」往後跳；真的程式照常跑 */
function svRehShift(ms){ const sh=o=>{ if(Array.isArray(o)) return o.map(sh); if(o&&typeof o==="object"){ const r={}; for(const k in o) r[k]=sh(o[k]); return r; } return typeof o==="number"&&o>1.6e12&&o<2.2e12?o-ms:o; };
  const s=svReal(); if(!s) return; S.set(SVS,sh(s)); S.set(SVST,(S.get(SVST,[])||[]).map(x=>x&&x.sid===s.id?{...x,ts:x.ts?x.ts-ms:x.ts}:x)); }
function svRehNext(){ const s=svReal(); if(!s) return null; const now=Date.now(), L=[]; if(s.end&&s.end>now) L.push([s.end,{recruit:"開播",r1:"第一次排名發表",r2:"第二次排名發表",pr:"決賽開始",final:"出道組發表",prep:"出道準備結束"}[s.ph]||"下一階段"]);
  const t0=(s.t0s||{})[s.ph]||s.t0; svMsList(s.ph).forEach(m=>{ const t=t0+m.d[1]*864e5; if(t>now&&m.d[1]>0) L.push([t,`「${m.t}」截止`]); const a=t0+m.d[0]*864e5; if(a>now&&m.d[0]>0) L.push([a,`「${m.t}」開始`]); });
  L.sort((a,b)=>a[0]-b[0]); return L[0]||null; }
function svRehGo(){ const n=svRehNext(); if(!n) return; svRehShift(n[0]-Date.now()+6e4); for(let i=0;i<8;i++){ try{ svTick(); }catch(e){} } ui.svSh=null; ui.svShIn=0; layer.innerHTML=""; render(); window.scrollTo(0,0); toast("時間跳到："+n[1]); }
/* 11/24 搶先預演（測試帳號用）：拿「真的這一季」的資料（真的練習生、真的上傳）假裝已經開播，跑一次真的流程抓 bug。只在這支手機、什麼都不會存 */
function svRehSeason(){ const r=svReal(); if(!r||r.ph!=="recruit") return r; const C=ui.svRehC; if(C&&C.k===JSON.stringify([r.id,r.end,(S.get(SVST,[])||[]).length])&&Date.now()-C.t<15e3) return C.s;
  const t0=r.airAt?Math.min(Date.now()-60e3,svDay18(r.airAt)):Date.now()-60e3, c={...r,ph:"r1",reh:1,t0,t0s:{...(r.t0s||{}),r1:t0},end:t0+SV_DUR.r1*864e5,ends:{...(r.ends||{}),r1:t0+SV_DUR.r1*864e5},grPub:{lv:t0},out:[]};
  ui.svRehC={k:JSON.stringify([r.id,r.end,(S.get(SVST,[])||[]).length]),t:Date.now(),s:c}; try{ c.grade=svGrCalc(c,"lv").G; }catch(e){} return c; }
/* 11/24 後台自動跑的東西（開播、棄賽、等級、新聞、發表）一律用真的這一季算，不管管理員當下是不是開著示範 */
const svRealDo=fn=>{ const o=ui.svRealCtx; ui.svRealCtx=1; const g=ui.svGrD; ui.svGrD=null; try{ return fn(); } finally{ ui.svRealCtx=o; ui.svGrD=g; } };
const svOpen=()=>sbxOn()||svDemoOk()||!!S.get(K.svOpen,false)||String((session()||{}).email||"").toLowerCase()==="husay";
const svTheme=()=>{ const s=svSeason(); return s&&s.g?(s.g==="g"?"g":"b"):S.get("daisuki_sv_theme","g")==="b"?"b":"g"; };
const svDemoSp=i=>Object.fromEntries(["r1","r2","final"].map(st=>{ const P=SV_SP_P[st], L=k=>P[k].length; return [st,P[0][(i*3+1)%L(0)]+P[1][(i*5+4)%L(1)]+P[2][(i*7+2)%L(2)]]; }));
const svEntries=()=>{ const s=svSeason(); if(s&&s.demo){ const D=SV_DEMO_N.map((n,i)=>({id:"dm"+i,name:n,co:i%3?svNpcCo(i):"",email:"demo"+i,seat:[1,4,2,9,7,12,15,3,20,11,6,24][i],ps:"示範用的練習生。個性開朗，熟了之後很吵。",sk:[SV_SK[i%3]],msg:SV_INT.focus[(i*5+2)%SV_INT.focus.length],sp:svDemoSp(i)}));   /* 11/24 示範練習生的後採訪、感言每個人不一樣 */ return s.ph==="recruit"?D.slice(0,6):D; } return s?(S.get(SVE,[])||[]).filter(e=>e.sid===s.id&&!e.out):[]; };
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
const SV_SP_P={"r1": [["國民製作人，謝謝你們。", "我以為我會在這裡結束……", "叫到我名字的時候，腦袋一片空白。", "老實說今天好怕。", "真的嗎？是我嗎？", "我一直在等，等到手都冰了。", "剛剛一直不敢抬頭。", "我沒想到會被叫到。", "先深呼吸一下……好。", "說好不哭的。", "我的腿還在抖。", "怎麼辦，準備好的話都忘了。", "這個名次，比我想的高好多。", "剛剛旁邊的朋友一直握著我的手。", "我是不是在做夢？", "第一次站在這麼高的地方。", "啊……我先擦一下眼淚。", "等級評價那天，我真的以為完蛋了。", "我差一點就放棄了。", "謝謝，真的謝謝。", "我一直覺得自己會在後面。", "聽到名字的那一秒，我整個人跳起來。"], ["每天練到凌晨，就是為了今天。", "我知道我還有很多不夠的地方。", "聽說有人每天幫我投票，真的好感動。", "一起練習的大家，謝謝。", "媽，你有在看嗎？", "公司的老師們，我沒有讓你們丟臉吧？", "主題曲那幾天，我每天都在哭。", "我會把每一票都記著。", "室友每天都幫我加油。", "我們公司只有我一個人來，所以更想撐下去。", "在 F 班的時候，我真的很想回家。", "我想讓大家看到，我不只這樣。", "今天早上，我還在練那段副歌。", "爸爸應該也在看吧。", "之前一直被說不夠自信。", "我還是會緊張，但我不想逃。", "我的粉絲雖然不多，但我都知道你們在。", "導師說的話，我每天都記在本子上。", "朋友一直問我還好嗎，現在我可以說，我很好。", "排名不是全部，但我還是好開心。", "來這裡之前，我練了三年。", "每一則留言，我都有偷偷看。"], ["下一輪見！", "下一個舞台會更好。", "我會更努力的！", "請再相信我一次。", "謝謝大家！", "請繼續看著我。", "我不會讓你們失望。", "我會練到最好為止。", "請期待我的 Position 舞台！", "我會再往上爬。", "這只是開始。", "我愛你們！", "我們第二輪見。", "請一定要再投給我。", "下次，我想站更前面。", "我會變得更好。", "請記住我的名字。", "謝謝，我會加油的。", "我還想走更遠。", "陪我走下去吧。", "我會用舞台回答。", "請多多照顧！"]], "r2": [["剛剛真的以為是別人。", "說好不哭的……對不起。", "這兩週好累。", "Position 評價的時候，差點放棄。", "好多朋友走了。", "我還在這裡，真的嗎？", "名次往上跳了好多。", "我剛剛一直在發抖。", "我以為這次會掉下去。", "一直聽到別人的名字，我好怕。", "先恭喜留下來的大家。", "這次真的好險。", "我不知道該說什麼。", "看到這個名次，我愣住了。", "我一直盯著螢幕看。", "心臟快跳出來了。"], ["朋友跟我說，你可以的。", "我現在敢說了，我想出道。", "我要謝謝的人太多了。", "家人每天都在看。", "每次排名，都更想出道。", "走掉的朋友，我會連她們的份一起。", "概念評價那首歌，我真的很喜歡。", "當隊長很辛苦，但很值得。", "這次的組員，謝謝你們。", "一直有人說我不行，我想證明給他們看。", "被導師罵的那天，我哭了一整晚。", "這次站 Vocal，我終於有一點自信了。", "我知道我進步很慢，但我沒有停。", "收到的每一則留言我都有看。", "宿舍的燈，我每天都最後一個關。", "我以前很怕站中間。"], ["決賽見！", "請把我送上出道組！", "剩下的路，我會更拼。", "一定不會讓你們後悔。", "陪我走完吧。", "謝謝！", "我想出道。", "最後一段路，拜託了。", "決賽的舞台，我會拿出全部。", "請再投我一次。", "我會撐到最後。", "我們決賽見。", "不會白費你們的票。", "請看到最後。", "我會帶著大家的心意上台。", "謝謝，我愛你們。"]], "final": [["國民製作人……我出道了。", "真的出道了嗎？", "腿一直在抖。", "第一天到今天，好像在做夢。", "這個名字，我等了好多年。", "謝謝每一票。", "我到現在還不敢相信。", "剛剛閉著眼睛在祈禱。", "我先跟大家鞠個躬。", "終於……終於。", "說不出話來了。", "我一直以為我會在下面看。"], ["媽，我做到了。", "第一次排名的時候，我還在後面。", "一起走到最後的大家，你們都很棒。", "練習生的日子結束了。", "以後也請一直看著我們。", "我會記得今天。", "沒出道的朋友們，我們以後一定會在舞台上見。", "在 F 班的那個我，要是看到今天就好了。", "練習了五年，好像都值得了。", "公司的大家，謝謝你們等我。", "我會好好照顧成員們。", "每一個投票給我的人，謝謝。"], ["我會用舞台回報你們。", "謝謝，我愛你們！", "往後請多多指教！", "我們一起走花路吧！", "國民製作人，謝謝你們選了我。", "我們會讓大家驕傲的。", "出道舞台見！", "我們會一直在一起的。", "不會讓你們後悔選了我。", "以後也請多多支持我們。", "謝謝，真的謝謝。", "我們要走得很遠很遠。"]]};
const SV_SP={r1:[],r2:[],final:[]};
const svSpeech=(t,st)=>{ const x=((t&&t.sp)||{})[st]; if(x) return x; const P=SV_SP_P[st]||SV_SP_P.r1; if(!t||t.real) return ""; const Z=ui.svSpU, k=t.id+st; return svPk(Z,st+"a",P[0],k+"a")+svPk(Z,st+"b",P[1],k+"b")+svPk(Z,st+"c",P[2],k+"c"); };   /* 11/24 三段拼，同一次發表裡每段都不重複 */
/* 11/24 同一集（同一次發表）裡不重複：先照雜湊挑，用過就往下一句 */
const svPk=(Z,nm,P,key)=>{ if(!Z) return P[svHash(key)%P.length]; Z.u=Z.u||{}; Z.m=Z.m||{}; const mk=nm+"|"+key; if(Z.m[mk]!=null) return P[Z.m[mk]]; const U=Z.u[nm]=Z.u[nm]||[]; if(U.length>=P.length) U.length=0; let i=svHash(key)%P.length; for(let k=0;k<P.length&&U.includes(i);k++) i=(i+1)%P.length; U.push(i); Z.m[mk]=i; return P[i]; };
const svHash=s=>{ let h=0; for(const c of String(s)) h=(h*31+c.charCodeAt(0))|0; return Math.abs(h); };
function svScores(ph){ const s=svSeason(); if(!s) return {}; ph=ph||s.ph; const V=s.demo?Object.fromEntries(SV_DEMO_N.map((n,i)=>["dm"+i,(12-i)*9+((ui.svDV||{})["dm"+i]||0)])):((S.get(SVV,{})||{})[s.id]||{})[ph]||{}, B=((s.bonus||{})[ph])||{}, all=svAll(), out={};
  const live=svAlive(ph), reals=all.filter(t=>t.real&&live.has(t.id)), avg=reals.length?reals.reduce((a,t)=>a+(V[t.id]||0)+(B[t.id]||0),0)/reals.length:0, BN=svFull||s.demo?svBenefit(ph,avg):{};
  const t0=(s.t0s||{})[ph]||s.t0||Date.now(), days=Math.max(1,Math.ceil((Math.min(Date.now(),(s.ends||{})[ph]||Date.now())-t0)/864e5));
  const VP=ph==='final'&&!s.demo?(((S.get(SVV,{})||{})[s.id]||{}).pr||{}):{}, BP=ph==='final'&&(svFull||s.demo)?svBenefit('pr',(()=>{ const P=((S.get(SVV,{})||{})[s.id]||{}).pr||{}, n=Object.keys(P).length; return n?Object.values(P).reduce((a,b)=>a+b,0)/n:0; })()):{};   /* 決賽：PR 週的票和加分票一起帶進來 */
  all.forEach(t=>{ if(!live.has(t.id)) return; out[t.id]=t.real?(V[t.id]||0)+(B[t.id]||0)+(BN[t.id]||0)+(VP[t.id]||0)+(BP[t.id]||0):Math.round(days*(2+svHash(t.id+ph)%6)+avg*(.25+svHash(ph+t.id)%55/100))+(B[t.id]||0); });
  return svFull&&typeof svSnsBonus==="function"?svSnsBonus(s,ph,out):out; }
/* 這一輪還在比的人 */
function svAlive(ph){ const s=svSeason(); if(!s) return new Set(); ph=ph||s.ph; const K0=s.keep||{};
  const OUT=new Set(s.out||[]); if(OUT.size){ const r=svAlive0(s,ph,K0); return new Set([...r].filter(id=>!OUT.has(id))); } return svAlive0(s,ph,K0); }
/* 11/24 期限內沒交舞台＝棄賽（s.out），之後不算在比賽的人裡 */
function svAlive0(s,ph,K0){
  if(ph==="r1"||ph==="recruit") return new Set(svAll().map(t=>t.id)); if(ph==="r2") return new Set(K0.r1||[]); if(ph==="pr"||ph==="final") return new Set(K0.r2||[]); return new Set(K0.r2||[]); }
const svRank=ph=>{ const sc=svScores(ph); const sd=(svSeason()||{}).id||""; return Object.keys(sc).sort((a,b)=>sc[b]-sc[a]||svHash(sd+a)-svHash(sd+b)); };
const svById=id=>svAll().find(t=>t.id===id);
/* 星探用：正在參加選秀的人（報名中、還沒被淘汰、出道準備中的出道組）不能被私訊 */
function svInShow(em){ const s=svReal(); if(!s||s.ph==="done") return false; em=String(em||"").toLowerCase(); const e=(S.get(SVE,[])||[]).find(x=>x.sid===s.id&&!x.out&&String(x.email||"").toLowerCase()===em); if(!e) return false;
  const K=s.keep||{}; if(s.ph==="recruit"||s.ph==="r1") return true; if(s.ph==="r2") return (K.r1||[]).includes(e.id); if(s.ph==="pr"||s.ph==="final") return (K.r2||[]).includes(e.id); return (s.debut||[]).includes(e.id); }
const svPh=t=>t&&t.photo?`<img src="${esc(t.photo)}" alt="">`:`<i class="sv2-sil"></i>`;
const svLeftTxt=ms=>{ ms=Math.max(0,ms); const d=Math.floor(ms/864e5), h=Math.floor(ms%864e5/36e5); return d?`${d} 天 ${h} 時`:`${h} 時 ${Math.floor(ms%36e5/6e4)} 分`; };

/* 11/24 節目時間一律晚上六點：開季對齊到 18:00，之後每段照整天算，所以全部都是六點 */
const svDay18=t=>{ const d=new Date(t); d.setHours(18,0,0,0); return d.getTime(); };   /* 同一天的 18:00 */
const svAt18=t=>{ const d=new Date(t); d.setHours(18,0,0,0); return d.getTime()<t-36e5?d.getTime()+864e5:d.getTime(); };
/* ---------- 時間到了 → 公布（只在管理員的手機上算，大家看到的才會一樣） ---------- */
function svTick(){ return svRealDo(svTick0); }
function svTick0(){ try{ svLtdTick(); }catch(e){} try{ const s0=svReal(), n0=(S.get("daisuki_sv_doneN",0)||0)+1; if(s0&&s0.ph!=="done"&&s0.no!==n0&&svAdmOk()) S.set(SVS,{...s0,no:n0}); }catch(e){} try{ svGrTick(); }catch(e){} try{ const s=svReal(); if(!s||!svAdmOk()||!s.end||Date.now()<s.end) return; svAdvance(false); }catch(e){} }
/* 等級：任務交件期限一到，管理員的手機自動公布（等級評價→主題曲重新評價） */
function svOutTick(){ const s=svReal(); if(!s||!svAdmOk()||!svVoting()) return; const d=(Date.now()-svPhT0(s))/864e5, chk=s.outChk||{};
  for(const m of svMsList(s.ph)){ const key=s.ph+m.k; if(m.k==="lv"||d<m.d[1]||chk[key]) continue;   /* 11/24 等級評價沒交不算棄賽（照樣上節目，導師給低等級） */ const has=new Set(svStages(m.k==="lv"?"r1":s.ph,m.k).map(x=>x.tid)), out=[...svAlive()].filter(id=>{ const t=svById(id)||{}; return t.real&&!has.has(id); });
    S.set(SVS,{...s,out:[...new Set([...(s.out||[]),...out])],outChk:{...chk,[key]:Date.now()}}); return; } }
/* 11/24 進行中的這一季也對齊到晚上六點（每個時間點改成同一天的 18:00，只做一次） */
function svAt18Fix(){ const s=svReal(); if(!s||svRehOn()||s.at18||s.reair1||!isAdminAcct()) return; const f=t=>{ if(!t) return t; const d=new Date(t); d.setHours(18,0,0,0); return d.getTime(); }, mp=o=>o?Object.fromEntries(Object.entries(o).map(([k,v])=>[k,typeof v==="number"?f(v):v])):o;
  S.set(SVS,{...s,t0:f(s.t0),end:f(s.end),t0s:mp(s.t0s),ends:mp(s.ends),at18:1}); }
/* 11/24 修正：開播那一刻把「等級評價沒交」的真人誤判成棄賽 → 全部救回來，撤掉「宣布退出」的新聞和通知（只做一次） */
function svOutUndo(){ const s=svReal(); if(!s||svRehOn()||s.outUndo||!isAdminAcct()) return; const chk={...(s.outChk||{})}, bad=!!chk.r1lv; delete chk.r1lv;
  const only=bad&&!Object.keys(chk).length, out=only?[]:(s.out||[]), nd={...(s.newsDone||{})}; if(only) Object.keys(nd).filter(k=>/^out/.test(k)).forEach(k=>delete nd[k]);
  if(only){ try{ const NW=S.get(K.news,[])||[], rm=new Set(NW.filter(n=>n&&n.pd&&/宣布退出/.test(n.title||"")).map(n=>n.id)); if(rm.size){ S.set(K.news,NW.filter(n=>!rm.has(n.id))); const F=S.get(K.feed,[])||[]; S.set(K.feed,F.filter(x=>!(x&&x.newsId&&rm.has(x.newsId)))); } }catch(e){} }
  S.set(SVS,{...s,out,outChk:chk,newsDone:nd,outUndo:1}); if(only&&(s.grPub||{}).lv&&!(s.grPub||{}).th){ const s2=svReal(); const g=svGrPub(s2,"lv"); S.set(SVS,{...g,grPub:{...(s2.grPub||{}),lv:(s2.grPub||{}).lv}}); } }   /* 等級也重算，被漏掉的人補上等級 */
/* 11/24 第二次修正：上一次誤判是因為管理員開著示範，系統拿示範的舞台去比 → 真人交過的都沒被看到。
   棄賽全部撤回、等級用真的舞台重算、用示範名字發出去的節目新聞撤掉重發（只做一次） */
function svOutUndo2(){ const s=svReal(); if(!s||svRehOn()||s.outUndo2||!isAdminAcct()) return; const DN=new RegExp(SV_DEMO_N.join("|")), nd={...(s.newsDone||{})};
  try{ const NW=S.get(K.news,[])||[], rm=new Set(NW.filter(n=>n&&n.pd&&(/宣布退出/.test(n.title||"")||DN.test((n.title||"")+(n.body||"")))).map(n=>n.id));
    if(rm.size){ S.set(K.news,NW.filter(n=>!rm.has(n.id))); const F=S.get(K.feed,[])||[]; S.set(K.feed,F.filter(x=>!(x&&x.newsId&&rm.has(x.newsId)))); Object.keys(nd).filter(k=>k!=="air").forEach(k=>delete nd[k]); } }catch(e){}
  const chk={...(s.outChk||{})}; delete chk.r1lv; S.set(SVS,{...s,out:s.ph==="r1"?[]:(s.out||[]),outChk:chk,newsDone:nd,outUndo:1,outUndo2:1});
  const P=(svReal().grPub)||{}; if(P.lv&&!P.th){ const s2=svReal(), g=svGrPub(s2,"lv"); S.set(SVS,{...g,grPub:{...P}}); } }
/* 11/24 18:00 那一集當作播出失誤：退回「招募結束、等開播」，18:30 重新開播；自動發的新聞、通知、等級、棄賽全部收回（只做一次） */
function svReAir(){ const s=svReal(); if(!s||svRehOn()||s.reair1||!isAdminAcct()||s.ph!=="r1") return; const t1=(s.t0s||{}).r1||s.t0, at=new Date(t1); at.setHours(18,30,0,0); if(Date.now()-t1>6*36e5) return;
  try{ const NW=S.get(K.news,[])||[], rm=new Set(NW.filter(n=>n&&n.pd).map(n=>n.id)); if(rm.size){ S.set(K.news,NW.filter(n=>!rm.has(n.id))); const F=S.get(K.feed,[])||[]; S.set(K.feed,F.filter(x=>!(x&&x.newsId&&rm.has(x.newsId)))); } }catch(e){}
  const t0s={...(s.t0s||{})}; delete t0s.r1; const ends={...(s.ends||{})}; delete ends.r1;
  S.set(SVS,{...s,ph:"recruit",t0:t0s.recruit||s.t0,t0s,ends,end:at.getTime(),grade:null,grade0:null,grPub:{},grCen:null,out:[],outChk:{},newsDone:{},reair1:1,airN:(s.airN||0)+1,outUndo:1,outUndo2:1}); }
/* 11/24 補：重播時間被「對齊六點」改回 18:00 → 改回 18:30；已經在 18:00 開了的，18:30 前退回等開播（只做一次） */
function svReAir2(){ const s=svReal(); if(!s||svRehOn()||!s.reair1||s.reair2||!isAdminAcct()) return; const at=new Date(s.ph==="recruit"?s.end:((s.t0s||{}).r1||s.t0)); at.setHours(18,30,0,0); const A=at.getTime();
  if(s.ph==="recruit"){ S.set(SVS,{...s,end:A,at18:1,reair2:1}); return; }
  if(s.ph==="r1"&&((s.t0s||{}).r1||s.t0)<A){ if(Date.now()<A){ try{ const NW=S.get(K.news,[])||[], rm=new Set(NW.filter(n=>n&&n.pd).map(n=>n.id)); if(rm.size){ S.set(K.news,NW.filter(n=>!rm.has(n.id))); const F=S.get(K.feed,[])||[]; S.set(K.feed,F.filter(x=>!(x&&x.newsId&&rm.has(x.newsId)))); } }catch(e){}
      const t0s={...(s.t0s||{})}; delete t0s.r1; const ends={...(s.ends||{})}; delete ends.r1; S.set(SVS,{...s,ph:"recruit",t0:t0s.recruit||s.t0,t0s,ends,end:A,grade:null,grade0:null,grPub:{},grCen:null,out:[],outChk:{},newsDone:{},at18:1,reair2:1}); }
    else S.set(SVS,{...s,t0:A,t0s:{...(s.t0s||{}),r1:A},at18:1,reair2:1}); return; }
  S.set(SVS,{...s,reair2:1}); }
/* 11/24 再延一次：20:00 才開播（影片修好再播），18:30 那集收回（只做一次） */
function svReAir3(){ const s=svReal(); if(!s||svRehOn()||!isAdminAcct()) return; const at=new Date(2026,10,24,20,0,0,0), A=at.getTime(); if(Date.now()>=A) return;   /* 11/24 20:00 前不管誰動過（舊版的手機也一樣），都拉回「20:00 開播」 */
  if(s.ph==="recruit"){ if(s.end!==A||s.airAt!==A) S.set(SVS,{...s,end:A,airAt:A,at18:1,reair1:1,reair2:1,reair3:1}); return; } if(s.ph!=="r1") return;
  try{ const NW=S.get(K.news,[])||[], rm=new Set(NW.filter(n=>n&&n.pd).map(n=>n.id)); if(rm.size){ S.set(K.news,NW.filter(n=>!rm.has(n.id))); const F=S.get(K.feed,[])||[]; S.set(K.feed,F.filter(x=>!(x&&x.newsId&&rm.has(x.newsId)))); } }catch(e){}
  const t0s={...(s.t0s||{})}; delete t0s.r1; const ends={...(s.ends||{})}; delete ends.r1;
  S.set(SVS,{...s,ph:"recruit",t0:t0s.recruit||s.t0,t0s,ends,end:A,grade:null,grade0:null,grPub:{},grCen:null,out:[],outChk:{},newsDone:{},at18:1,reair1:1,reair2:1,reair3:1,airAt:A,airN:(s.airN||0)+1}); }
/* 11/24 20:00 正式開播後，節目新聞照新的時間重發一次（18:30 那批被刪掉了，記號還在所以沒重發） */
function svNews8(){ const s=svReal(); if(!s||s.news8||!svAdmOk()||svRehOn()||s.ph!=="r1"||!s.airAt||Date.now()<s.airAt) return; S.set(SVS,{...s,newsDone:{},news8:1}); }
function svGrTick(){ try{ svNews8(); }catch(e){} try{ svReAir3(); }catch(e){} try{ svReAir2(); }catch(e){} try{ svReAir(); }catch(e){} try{ svOutUndo2(); }catch(e){} try{ svOutUndo(); }catch(e){} try{ svAt18Fix(); }catch(e){} try{ svOutTick(); }catch(e){} try{ svNewsTick(); }catch(e){} const s=svReal(); if(!s||s.ph!=="r1"||!svAdmOk()) return; const d=(Date.now()-((s.t0s||{}).r1||s.t0||Date.now()))/864e5;
  for(const k of SV_GRK){ const m=svMsList("r1").find(x=>x.k===k); if(m&&d>=m.d[1]&&!(s.grPub||{})[k]&&(k==="lv"||(s.grPub||{}).lv)){ S.set(SVS,svGrPub(s,k)); return; } } }
/* 限定團體到期（出道日＋一年半）：團員的帳號變回一般粉絲帳號，團留著當紀錄 */
function svLtdTick(){ if(!isAdminAcct()) return; const L=getDebut(), now=Date.now(); let ch=0;
  const L2=L.map(x=>{ if(!x||!x.ltd||x.ltdOff||x.status!=="ok") return x; const st=x.day||x.appr||x.ts||now; if(now<st+x.ltd*864e5) return x; dbEms(x).forEach(e=>{ try{ unbindArtist(e); }catch(er){} }); ch=1; return {...x,ltdOff:now}; });
  if(ch){ S.set(K.debut,L2); feedPush&&feedPush({kind:"core",self:true,text:"限定團體活動期間結束，團員帳號已變回一般粉絲帳號"}); } }
/* 11/25 投票期間排名只算粉絲 PICK 的票（中間排名）；舞台加分、SNS 加分等發表時才一起算進去 */
var svFull=0;
function svAdvance(force){ svFull=1; try{ return svRealDo(()=>svAdvance0(force)); } finally{ svFull=0; } }
function svAdvance0(force){ if(!svReal()) return; const s={...svReal()}; const now=Date.now(), nx=(ph,d)=>{ const now=s.ph==="recruit"&&s.airAt&&s.end===s.airAt?svDay18(s.airAt):s.end&&s.end<=Date.now()&&Date.now()-s.end<864e5?s.end:Date.now();   /* 11/24 今天這集延到 20:00 播，但這一輪的時間表照 18:00 算 */ s.ph=ph; s.t0=now; s.t0s={...(s.t0s||{}),[ph]:now}; s.end=d?now+d*864e5:0; s.ends={...(s.ends||{}),[ph]:s.end}; };
  const reals=svEntries();
  if(s.ph==="recruit"){ if(reals.length<SV_MIN&&!force){ s.end=now+7*864e5; s.ext=(s.ext||0)+1; S.set(SVS,s); return "ext"; }   /* 真人不夠：延長招募（粉絲只會看到倒數變長） */
    s.npcN=Math.max(0,SV_N-reals.length); nx("r1",SV_DUR.r1); S.set(SVS,s); return "r1"; }
  if(s.ph==="r1"){ const rk=svRank("r1"), all=svAll(), isR=id=>(all.find(t=>t.id===id)||{}).real; let keep=rk.slice(0,SV_KEEP.r1);
    const needR=Math.min(all.filter(t=>t.real).length,SV_KEEP.r2); let kr=keep.filter(isR).length;   /* 決賽要湊得到真人：不夠就把留下來的虛擬換成落榜的真人 */
    if(kr<needR){ const outR=rk.filter(id=>isR(id)&&!keep.includes(id)); for(let i=keep.length-1;i>=0&&kr<needR&&outR.length;i--) if(!isR(keep[i])){ keep[i]=outR.shift(); kr++; } }
    const V1=svScores("r1"); keep.sort((a,b)=>(V1[b]||0)-(V1[a]||0));   /* 11/24 換進來的真人照票數排回去，名次跟票數才對得上 */
    s.rkv={...(s.rkv||{}),r1:V1}; s.keep={...(s.keep||{}),r1:keep}; s.rk={...(s.rk||{}),r1:rk}; s.ann={...(s.ann||{}),r1:now}; nx("r2",SV_DUR.r2); S.set(SVS,s); return "r2"; }
  if(s.ph==="r2"){ const rk=svRank("r2"), all=svAll(), keep=rk.filter(id=>(all.find(t=>t.id===id)||{}).real).slice(0,SV_KEEP.r2);   /* 虛擬練習生在這裡全部淘汰 */
    s.rkv={...(s.rkv||{}),r2:svScores("r2")}; s.keep={...(s.keep||{}),r2:keep}; s.rk={...(s.rk||{}),r2:rk}; s.ann={...(s.ann||{}),r2:now}; nx("pr",SV_DUR.pr); S.set(SVS,s); return "pr"; }
  if(s.ph==="pr"){ nx("final",SV_DUR.final); S.set(SVS,s); return "final"; }   /* PR 週不淘汰、不發表 */
  if(s.ph==="final"){ const rk=svRank("final"), n=rk.length>=SV_KEEP.r2?SV_DEB:Math.max(1,Math.min(SV_DEB,Math.round(rk.length*.7)));   /* 真人不夠就照人數調整 */
    s.rkv={...(s.rkv||{}),final:svScores("final")}; s.debut=rk.slice(0,n); s.rk={...(s.rk||{}),final:rk}; s.ann={...(s.ann||{}),final:now}; nx("prep",(s.prepW||3)*7); S.set(SVS,s); return "prep"; } }

/* ---------- 粉絲：排名發表（每一次發表，第一次打開 App 時跳出來）
   照 PRODUCE 的發表：從後面的名次一位一位叫上台 → 1位候補 → 3位、2位、1位（C位，永遠在三角形最上面）→ 最後一席候補 → 最後一席 ---------- */
function svRevealCheck(){ try{ const s=svReal(); if(!s||!s.ann||!svOpen()) return; const seen=S.get(acK("daisuki_sv_seen"),{})||{}; const st=["final","r2","r1"].find(k=>s.ann[k]&&!seen[s.id+k]); if(!st||layer.innerHTML) return;
  seen[s.id+st]=Date.now(); S.set(acK("daisuki_sv_seen"),seen); svRevIntro(st); }catch(e){} }
const svMine=()=>{ const s=svSeason(); return s&&s.demo?(ui.svDV||{}):(S.get(acK("daisuki_sv_my"),{})||{}); };
/* 三角形：1、2、3…一排比一排多；最後一排太少就併到上一排（7 位＝1・2・4） */
function svRows(n){ const R=[]; let k=1; while(n>0){ const c=Math.min(k,n); R.push(c); n-=c; k++; } if(R.length>1&&R[R.length-1]<R[R.length-2]&&R[R.length-1]+R[R.length-2]<=6){ const l=R.pop(); R[R.length-1]+=l; } return R; }
const svPyr=(ids,tile)=>{ let i=0; return svRows(ids.length).map(c=>`<div class="sv2-r">${ids.slice(i,i+c).map((id,j)=>tile(id,i+j)).join("")}${(i+=c,"")}</div>`).join(""); };
/* 等級評價 A～F（PRODUCE 的分班）：管理員在後台標；虛擬練習生自動給一個，管理員也可以改 */
const SV_GR=["A","B","C","D","F"];
const svGrade=t=>{ const s=svSeason(); if(!s||!t||s.ph==="recruit") return ""; if(s.demo) return svGrDemo(s)[t.id]||""; return (s.grade||{})[t.id]||""; };   /* 11/18：公布後才有，自動算，管理員不能改 */
const svGrB=(t,c)=>{ const g=svGrade(t); return g?`<i class="sv3-gr ${c||""} g${g}">${g}</i>`:""; };
const svTile=(t,b,sub,me,tag)=>`<${tag||"button"} class="sv2-t ${me?"me":""}" ${tag?"":`data-a="uniGo" data-v="#/fan/core?p=survival&id=${t.id}"`}><span class="sv3-av"><span class="sv2-p">${svPh(t)}</span>${svGrB(t)}</span><b>${b}</b><span>${esc(t.name)}</span>${sub!=null?`<small>${sub}</small>`:""}</${tag||"button"}>`;
const svHero=(rib,chip,body,foot)=>`<section class="sv2-pyr"><div class="sv2-rib"><span>PRODUCE DAY</span><span>${rib}</span></div>${chip?`<span class="sv2-date">${chip}</span>`:""}<div class="sv2-rows"><i class="sv2-crown">👑</i>${body}</div><div class="sv2-foot">${foot}</div></section>`;
const svBar=L=>`<div class="sv2-bar">${L.map(([b,s])=>`<div><b>${b}</b><span>${s}</span></div>`).join("")}</div>`;
/* 11/24 發表前先全屏開場（像節目一樣鋪陳），再進排名發表 */
const SV_RVI={r1:[["第一次排名發表","今晚，第一次排名發表。"],["","15 位能留下來，剩下的練習生，今天就要離開。"],["","國民製作人投出的票，全部都在這裡。"],["","那麼，現在開始發表。"]],
  r2:[["第二次排名發表","今晚，第二次排名發表。"],["","這一輪，排名一直都是保密的。"],["","能進決賽的，只有 10 位。"],["","現在開始發表。"]],
  final:[["出道組發表","《PRODUCE DAY》最終回。"],["","從第一天的金字塔，走到今天。"],["","練習生們，準備好了嗎？"],["","出道組，只有 7 個位置。"],["","國民製作人選出的出道組——現在開始發表。"]]};
function svRevIntro(st){ const s=svSeason(); if(!s) return; const L=SV_RVI[st]||[["",""]]; let i=0; clearTimeout(ui.svRvT);
  const draw=()=>{ if(i>=L.length){ svReveal(st); return; } const [ttl,line]=L[i]; setLayer(`<div class="aws svsh svrvi aw-c-${svTheme()==="g"?"svg":"svb"}" data-a="svRvN"><div class="aws-beams"><i></i><i></i><i></i></div><div class="svsh-rib"><b>PRODUCE DAY</b><span>${esc(SV_RVI[st]?SV_RVI[st][0][0]:"")}</span><em class="live">● LIVE</em></div><div class="aws-in">${i===0?`<div class="aws-open"><small>PRODUCE DAY</small><h1><i>${st==="final"?"FINAL":"RANKING"}</i>${esc(ttl)}</h1></div>`:""}<div class="aws-say"><div><small>${esc(svHostN(s))}</small><p>${esc(line)}</p></div></div></div><p class="aws-tap">點一下繼續</p></div>`,"svx"); };
  ui.svRvN=()=>{ i++; draw(); }; draw(); }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="svRvN"]'); if(!t) return; e.stopImmediatePropagation(); ui.svRvN&&ui.svRvN(); },true);
/* 11/24 發表當下的票數（存起來，之後怎麼看都一樣；舊的沒存就用現在的） */
const svRkV=(s,st)=>((s.rkv||{})[st])||svScores(st)||{};
function svReveal(st){ const s=svSeason(); if(!s) return; ui.svSpU={}; const all=svAll(), T=id=>all.find(x=>x.id===id)||{id,name:"?"}, rk=(s.rk||{})[st]||[], V0=svRkV(s,st), K=(st==="final"?(s.debut||[]):((s.keep||{})[st]||[])).slice().sort((a,b)=>(V0[b]||0)-(V0[a]||0)), n=K.length, my=svMine(), tok=ui.svxT=Date.now();
  const title=st==="final"?"出道組發表":st==="r1"?"第一次排名發表":"第二次排名發表";
  const seat=(id,i)=>`<div class="sv2-t svx-e" data-r="${i}"><span class="sv2-p"><i class="sv2-sil"></i></span><b>${i+1}位</b><span>？</span></div>`;
  setLayer(`<div class="svx sv2 ${svTheme()} ${n>10?"many":""}" role="dialog" aria-label="${title}"><section class="sv2-pyr"><div class="sv2-rib"><span>PRODUCE DAY</span><span>${title}</span></div><span class="sv2-date">${st==="final"?`出道 ${n} 位`:`晉級 ${n} 位`}</span>
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
    c.querySelector(".svx-a").innerHTML=`<button class="s" data-a="svRevealGo">看完整排名</button><button class="m" data-a="svNextEp" data-v="${st}">${st==="final"?"結束 ›":"下週預告 ›"}</button>`;
    try{ confetti(innerWidth/2,innerHeight*.3,{n:90,cols:svTheme()==="g"?["#FF4F9A","#FFFFFF","#FFD6E8","#FF9CC6"]:["#2E7BEF","#FFFFFF","#CFE2FF","#8DBBFF"]}); const cf=document.getElementById("confetti"); if(cf) cf.style.zIndex="310"; }catch(e){} };
  ui.svxDone=done; let k=0; const go=()=>{ if(ui.svxT!==tok||!L()) return; if(k>=Q.length){ done(); return; } const [f,ms]=Q[k++]; f(); setTimeout(go,ms); }; setTimeout(go,500); }

/* 11/24 排名發表完 → 片尾：下週預告（剪幾段這輪的舞台畫面＋預告字幕，自動輪播）；決賽發表完 → 節目結束 */
const SV_TZ={"r2": ["「這次的位置，我不會讓。」", "「Vocal 1 位，我要拿。」", "導師：「再來一次。」", "（練習室，突然安靜下來）", "「我是隊長，我來扛。」", "「說真的，我很不甘心。」", "「……對不起，是我拖累大家。」", "又一次，有人要離開", "「這個部分，給我唱吧。」", "同組成員：「我們能贏嗎？」", "「我不想再在後面了。」", "（凌晨的練習室，只剩她一個）"], "final": ["「最後一次了。」", "「一分鐘，夠嗎？」", "「我想出道。真的很想。」", "導師：「這是你們的最後一個舞台。」", "（後台，有人哭了）", "「我們，一起出道吧。」", "出道組，只剩最後幾個位置", "「我不想留下遺憾。」", "（決賽前一晚，練習室的燈沒關）", "「謝謝你，陪我走到這裡。」"]};
const svCovSeek=v=>{ try{ if(v.dataset.sk) return; v.dataset.sk=1; const d=v.duration; if(d&&isFinite(d)) v.currentTime=Math.min(Math.max(.8,d*.4),d-.2); }catch(e){} };   /* 封面取 4 成的地方，避開開頭黑畫面和還沒站好 */
const svCov=(x,t,cls="")=>x&&x.url?(x.kind==="v"?`<video class="${cls}" style="${svFp(x)}" src="${esc(x.url)}#t=1.5" muted playsinline webkit-playsinline preload="metadata" onloadedmetadata="svCovSeek(this)"></video>`:`<img class="${cls}" style="${svFp(x)}" src="${esc(x.url)}" alt="">`):svPh(t||{});
function svNextEp(st){ const s=svSeason(); if(!s) return; clearInterval(ui.svNxI); const all=svAll(), T=id=>all.find(x=>x.id===id)||{};
  const K=st==="final"?(s.debut||[]):((s.keep||{})[st]||[]), nx=st==="r1"?"r2":st==="r2"?"final":"", St=svStages(st).filter(x=>x.url);
  const wrap=b=>`<div class="aws svsh svnx aw-c-${svTheme()==="g"?"svg":"svb"}"><div class="aws-beams"><i></i><i></i><i></i></div><div class="svsh-rib"><b>PRODUCE DAY</b><span>${st==="final"?"最終回":"下週預告"}</span></div><div class="aws-in">${b}</div></div>`;
  if(!nx){ setLayer(wrap(`<div class="aws-open"><small>PRODUCE DAY</small><h1><i>THANK YOU</i>FOR WATCHING</h1></div><div class="svsh-mont">${K.map(id=>{ const t=T(id); return `<span><i class="svsh-ph">${svPh(t)}</i><b>${esc(t.name||"")}</b></span>`; }).join("")}</div><p class="svnx-t">${s.gname?`${esc(s.gname)}，`:""}出道組 ${K.length} 位。國民製作人，謝謝你們一路陪到最後。</p><button class="aws-btn" data-a="svNextX">結束</button>`),"svx"); return; }
  const Z={}, P=SV_TZ[nx], ids=K.slice().sort((a,b)=>svHash(s.id+st+a)-svHash(s.id+st+b)).slice(0,5);
  const clips=ids.map((id,i)=>{ const t=T(id), x=St.find(y=>y.tid===id); return `<div class="svnx-c ${i?"":"on"}"><div class="aws-v svsub">${x&&x.kind==="v"?`<video style="${svFp(x)}" src="${esc(x.url)}#t=2" muted playsinline webkit-playsinline autoplay loop preload="auto" onloadedmetadata="svCovSeek(this)"></video>`:x?`<img class="svsh-img" style="${svFp(x)}" src="${esc(x.url)}" alt="">`:`<div class="svsh-nov">${svPh(t)}</div>`}<div class="svsh-tv"><p class="svsh-cut">${esc(svPk(Z,"tz",P,s.id+id+"tz"))}</p></div></div></div>`; }).join("");
  const ms=nx==="final"?"1 分鐘 PR → 出道評價":svMsList(nx).map(m=>m.t).join(" → ");
  setLayer(wrap(`<div class="aws-cat"><small>NEXT WEEK</small><b>${nx==="final"?"決賽":"第二輪"}</b><span class="svsh-tag">${esc(ms)}</span></div><div class="svnx-r">${clips}</div><p class="svnx-t">${nx==="final"?"剩下的人，只有一部分能出道。":`${K.length} 位練習生，繼續往下走。`}下週晚上六點見。</p><div class="svx-a"><button class="s" data-a="svRevealGo">看完整排名</button><button class="m" data-a="svNextX">好</button></div>`),"svx");
  let k=0; ui.svNxI=setInterval(()=>{ const L=[...document.querySelectorAll(".svnx-c")]; if(!L.length){ clearInterval(ui.svNxI); return; } L[k%L.length].classList.remove("on"); k++; const c=L[k%L.length]; c.classList.add("on"); c.querySelectorAll(".svsh-tv p").forEach(p=>{ p.style.animation="none"; void p.offsetWidth; p.style.animation=""; }); },2200); }

/* ---------- 節目流程（照 PRODUCE）：主持人宣布任務 → 練習生交舞台 → 粉絲看舞台、投現場票 → 每個任務現場票前三名拿加分票
   導師給等級、寫評語；主持人、導師的名字在後台設定 ---------- */
const SV_MS={
  r1:[{k:"lv",t:"等級評價",d:[0,0],how:"報名選好座位後，在導師面前表演：唱、跳、才藝都可以，30 秒～1 分鐘的影片（或照片＋介紹）。節目開播當天，導師直接公布 A～F 等級。",host:"練習生們好！選好座位，就輪到你們在導師面前表演了。節目開播那天，導師會當場給 A 到 F 的等級。"},
      {k:"th",t:"主題曲",d:[0,8],how:"照等級分班練主題曲，交一段主題曲練習影片。表現最好的人有機會站 C 位。",host:"等級出來了！接下來大家照班級練主題曲，主題曲 C 位就從你們之中選出來。"},
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
  const real=(S.get(SVST,[])||[]).filter(x=>x.sid===s.id&&x.ph===ph&&(!mk||x.mk===mk)&&!x.del);
  return real.concat(svVStages(s,ph,mk)); }
/* 11/24 虛擬練習生也有舞台（放公式照），任務開始就有；不搶現場票前三名的加分 */
function svLvOpen(s,mk){ return {ok:true,n:0,N:0};   /* 11/24 「真人過半才開放」取消，改回原本隨時可以投 */
  if(!s||s.demo) return {ok:true,n:0,N:0}; const A=svAlive(s.ph), R=svAll().filter(t=>t.real&&A.has(t.id)), sub=new Set(svStages(s.ph,mk).filter(x=>!x.v).map(x=>x.tid)), n=R.filter(t=>sub.has(t.id)).length; return {ok:n*2>R.length,n,N:R.length}; }
function svVStages(s,ph,mk){ try{ if(!s||s.demo||s.ph==="recruit"||ph==="recruit") return []; const P0=(s.t0s||{})[ph]; if(!P0) return []; const now=Date.now(), key=[s.id,ph,mk||"",Math.floor(now/6e4)].join("|"); if(svVStages.c&&svVStages.c.k===key) return svVStages.c.v;
  const alive=svAlive(ph), V=svAll().filter(t=>!t.real&&alive.has(t.id)), out=[];
  svMsList(ph).filter(m=>(!mk||m.k===mk)&&m.k!=="lv"&&P0+m.d[0]*864e5<=now).forEach(m=>V.forEach(t=>{ const h=svHash(s.id+ph+m.k+t.id); out.push({id:"vs_"+ph+m.k+"_"+t.id,sid:s.id,ph,mk:m.k,tid:t.id,v:1,url:t.photo||"",kind:"i",ts:P0+m.d[0]*864e5+(h%600)*6e4,team:m.team?["A 組","B 組"][h%2]:"",pos:m.pos?["Vocal","Dance","Rap"][h%3]:""}); }));
  svVStages.c={k:key,v:out}; return out; }catch(e){ return []; } }
const svLive=x=>(x.live||0)+(((S.get(SVLV,{})||{})[x.id])||0)+((ui.svDL||{})[x.id]||0);
const svMyLv=()=>{ const s=svSeason(); return s&&s.demo?(ui.svDLm||{}):(S.get(acK("daisuki_sv_lv"),{})||{}); };
/* 現場票前三名的加分票（這一輪每個任務各算一次） */
/* 11/25 舞台加分：現場票前三名拿「真人平均票數」的 30%／20%／10%（票少加少、票多加多）；等這個任務的現場票截止才加進排名 */
const SV_BENR=[.3,.2,.1];
function svBenefit(ph,avg){ const out={}, s=svSeason(), t0=s&&((s.t0s||{})[ph]||s.t0)||0, amt=i=>s&&s.demo?SV_BEN[i]:Math.max(1,Math.round((avg||0)*SV_BENR[i])); svMsList(ph).forEach(m=>{ if(s&&!s.demo&&Date.now()<t0+m.d[1]*864e5) return; const L=svStages(ph,m.k).filter(x=>!x.v);
  if(m.team){ const T={}; L.forEach(x=>{ const k=String(x.team||"").trim().toLowerCase()||x.id; (T[k]=T[k]||{v:0,m:[]}).v+=svLive(x); T[k].m.push(x.tid); }); const R=Object.values(T).filter(t=>t.v>0).sort((a,b)=>b.v-a.v);   /* 分組任務：整組一起加；只有兩組時只有贏的那組加 */
    R.slice(0,R.length<=2?1:3).forEach((t,i)=>{ if(i&&t.v===R[i-1].v) return; t.m.forEach(id=>{ out[id]=(out[id]||0)+amt(i); }); }); return; }
  L.slice().sort((a,b)=>svLive(b)-svLive(a)).slice(0,3).forEach((x,i)=>{ if(svLive(x)>0) out[x.tid]=(out[x.tid]||0)+amt(i); }); }); return out; }
const SV_MIC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
const svHost=(s,txt)=>`<section class="sv3-host"><span class="sv3-hav">${SV_MIC}</span><div><small>${esc(svHostN(s))}</small><p>${txt}</p></div></section>`;
function svHostTxt(s){ if(s.ph==="recruit") return "國民製作人們好！新一季的練習生正在報名中，招募結束後，就請大家幫喜歡的練習生投下寶貴的一票。";
  if(s.ph==="prep") return "恭喜出道組！謝謝國民製作人一路陪伴，出道那天，我們舞台上見！";
  if(s.ph==="done") return "謝謝國民製作人一路陪伴，限定團體活動中，請繼續支持她們！".replace(/她/g,s.g==="b"?"他":"她"); const m=svMsNow(s); return m?m.host+"舞台上傳後，國民製作人記得來看、投現場票！":""; }
/* 舞台：粉絲看、投現場票（每個任務一人一票） */
function svStageHtml(s){ const L=svMsList(s.ph); if(!L.length) return ""; const now=svMsNow(s), mk=ui.svMk&&L.some(m=>m.k===ui.svMk)?ui.svMk:now.k, m=L.find(x=>x.k===mk), all=svAll(), lv=svMyLv()[s.id+mk], St=svStages(s.ph,mk).slice().sort((a,b)=>svLive(b)-svLive(a)||svHash(a.id)-svHash(b.id));
  const tr=svTrainee(s), mine=tr&&mk===now.k?svStages(s.ph,mk).find(x=>x.tid===tr.id):null;
  const myCard=tr&&mk===now.k?`<section class="sv5-mys">${mine?`<button class="sv5-myt" data-a="svStage" data-v="${mine.id}">${mine.url?(mine.kind==="v"?`<video src="${esc(mine.url)}#t=0.1" muted playsinline preload="metadata"></video>`:`<img src="${esc(mine.url)}" alt="">`):svPh(tr)}</button><div><small>我的舞台</small><b>「${esc(m.t)}」已經交了 ✓</b><button class="gh" data-a="svUp">換掉重交</button></div>`:`<div><small>我的舞台</small><b>還沒交「${esc(m.t)}」</b><p>${esc(m.how)}</p><button data-a="svUp">交舞台</button></div>`}</section>`:"";
  return myCard+`<div class="sv3-mt">${L.map(x=>`<button class="${x.k===mk?"on":""}" data-a="svMk" data-v="${x.k}">${x.t}${x.k===now.k?"<i>進行中</i>":""}</button>`).join("")}</div>
    <p class="sv4-stx">${tr?`這是大家交的「${esc(m.t)}」舞台。練習生不能投現場票。`:`練習生交的「${esc(m.t)}」舞台。點進去看，這個任務你可以投 <b>1 張現場票</b>${lv?"（已經投了）":""}。前三名拿加分票。`}</p>
    ${St.length?`<div class="sv3-sg">${St.map((x,i)=>{ const t=all.find(y=>y.id===x.tid)||{}; return `<button class="sv3-st ${lv===x.id?"me":""}" data-a="svStage" data-v="${x.id}"><span class="sv3-sp">${svCov(x,t)}${x.url&&x.kind==="v"?`<i class="sv3-play"></i>`:""}${i<3&&svLive(x)?`<em>${i+1}</em>`:""}</span><b>${esc(t.name||"")}</b><small>${esc(x.team||x.pos||"")}${x.team||x.pos?"・":""}♥ ${fmt(svLive(x))}</small></button>`; }).join("")}</div>`:`<p class="sv2-note">${esc(m.t)}的舞台還沒上傳</p>`}`; }
/* 練習生：我的任務 */
/* 參賽者本人：示範裡切到「練習生畫面」才算 */
const svTrainee=s=>{ if(!s.demo&&ui.svRehFan&&svRehOn()) return null; const me=s.demo?(ui.svDemoT?svEntries()[0]:null):svMyEntry(); return me&&svVoting()&&svAlive().has(me.id)?me:null; };
function svStageView(id){ const s=svSeason(), x=svStages(s.ph).find(y=>y.id===id)||["r1","r2","pr","final"].map(p=>svStages(p).find(y=>y.id===id)).find(Boolean); if(!x) return; const t=svById(x.tid)||{}, m=svMsList(s.ph).find(y=>y.k===x.mk)||{}, lv=svMyLv()[s.id+x.mk];
  tieModal(`${esc(t.name||"")}・${esc(m.t||"")}`,`${x.url?`<div class="sv3-fr">${x.kind==="v"?`<video class="sv3-vid" style="${svFp(x)}" src="${esc(x.url)}" controls playsinline></video>`:`<img class="sv3-vid" style="${svFp(x)}" src="${esc(x.url)}" alt="">`}</div>`:`<div class="sv3-vid sv5-nov">${s.demo?"示範舞台沒有影片<br><small>真的練習生交的影片、照片會在這裡播放</small>":"這個舞台沒有影片"}</div>`}${x.team||x.pos?`<p class="sv3-tag">${esc(x.team||x.pos)}</p>`:""}${x.cap?`<p class="fy-info">${esc(x.cap)}</p>`:""}
    ${(x.cm||[]).map(c=>`<div class="sv3-cm"><b>${esc(c.n)}</b><span>${esc(c.t)}</span></div>`).join("")}<p class="sv3-lv">♥ 現場票 ${fmt(svLive(x))}</p>`,
    `${isAdminAcct()&&!s.demo?`<button class="t-mbtn" data-a="svCm" data-v="${x.id}">導師評語</button>`:""}<button class="t-mbtn" data-a="tCloseLayer">關閉</button>${svVoting()&&!svTrainee(s)&&x.ph===s.ph&&x.mk===((svMsNow(s)||{}).k)&&!svLvOpen(s,x.mk).ok?`<p class="fy-info">超過一半的練習生交了舞台，才開放現場票（現在 ${svLvOpen(s,x.mk).n}／${svLvOpen(s,x.mk).N}）</p>`:""}${svVoting()&&!svTrainee(s)&&x.ph===s.ph&&x.mk===((svMsNow(s)||{}).k)&&svLvOpen(s,x.mk).ok?`<button class="t-mbtn main" data-a="svLv" data-v="${x.id}" ${lv?"disabled":""}>${lv===x.id?"已投這個舞台":lv?"這個任務投過了":"投現場票"}</button>`:""}`,"sv3-tm"); }
/* 11/24 招募期交的是「等級評價」舞台（算在第一輪） */
const svUpMs=s=>s.ph==="recruit"?{ph:"r1",m:SV_MS.r1[0]}:{ph:s.ph,m:svMsNow(s)};
/* 11/24 舞台上傳：影片原檔直接傳（超過 45MB 分段傳，沒有上限），有進度 %；登入過期會自動換 token 再傳 */
/* 傳完確認雲端真的有這個檔（大小對得上），不對就當失敗重傳 */
/* 11/24 舞台畫面一律 3:4：照片上傳時就裁成 3:4；影片不重新轉檔，記下練習生挑的取景（位置＋放大），播的時候照這個裁 */
/* 11/24 舞台影片播不出來（直接串流失敗）→ 自動改成整支下載到手機再播（SNS 一直都是這樣播的） */
const SV_VB={};
const svVCodec=async(u,n)=>{ try{ u=String(u).split("#")[0]; const rd=async(a,b)=>{ const r=await fetch(u,{headers:{Range:`bytes=${a}-${b}`}}); return new Uint8Array(await r.arrayBuffer()); };
  const find=(t,w)=>{ const c=[...w].map(x=>x.charCodeAt(0)); for(let i=0;i+3<t.length;i++) if(t[i]===c[0]&&t[i+1]===c[1]&&t[i+2]===c[2]&&t[i+3]===c[3]) return i; return -1; };
  let t=await rd(0,262143), where="開頭"; if(find(t,"stsd")<0&&n>262144){ t=await rd(Math.max(0,n-8388608),n-1); where="結尾"; }
  if(find(t,"stsd")<0) return "找不到影片資訊（檔案可能壞了）"; let sub=null, K=null, o=0;
  while(!K){ const q=find(t.subarray(o),"stsd"); if(q<0) break; sub=t.subarray(o+q); K=["avc1","avc3","hvc1","hev1","av01","vp09","mp4v","dvh1","dvhe","apcn","apch","ap4h"].map(k=>[k,find(sub.subarray(0,120),k)]).filter(x=>x[1]>=0).sort((a,b)=>a[1]-b[1])[0]||null; o+=q+4; }
  if(!K){ const ty=["mp4a","Opus","ac-3","ec-3","text","tx3g"].filter(k=>find(t,k)>=0); return "找不到影片軌（"+(ty.join("、")||"沒有影像")+"）"; }
  const p=K[1], w=(sub[p+28]<<8)|sub[p+29], h=(sub[p+30]<<8)|sub[p+31]; let ex="";
  if(/^avc/.test(K[0])){ const q=find(sub,"avcC"); if(q>=0){ const pf=sub[q+5], lv=sub[q+7]; ex="・"+({66:"Baseline",77:"Main",100:"High",110:"High 10（10 位元，iPhone 播不了）",122:"4:2:2（iPhone 播不了）",244:"4:4:4（iPhone 播不了）"}[pf]||"profile "+pf)+"・Level "+(lv/10)+(lv>52?"（等級太高，iPhone 播不了）":""); } }
  return K[0]+"・"+w+"×"+h+ex+"・資訊在"+where; }catch(e){ return "讀不到"; } };
/* 有些剪輯 App 會把影片標成 iPhone 不支援的「等級」（例如 6.0）：先看開頭，標錯的話整支下載後把標籤改成 5.1 再播 */
/* 11/25 影片「標籤」自動修：剪輯 App 常把影片標成 iPhone 不收的樣子（H.264 等級太高、HEVC 標成 hev1），先讀開頭／結尾看一下，需要的話整支下載、改好標籤再播；能修的都修，修不了的照原本的方式播 */
const svVFind=(t,w,a,b)=>{ const c=[w.charCodeAt(0),w.charCodeAt(1),w.charCodeAt(2),w.charCodeAt(3)]; for(let i=a||0,n=Math.min(t.length-4,b==null?t.length:b);i<n;i++) if(t[i]===c[0]&&t[i+1]===c[1]&&t[i+2]===c[2]&&t[i+3]===c[3]) return i; return -1; };
const svVBad=t=>{ for(let i=0;(i=svVFind(t,"avcC",i))>=0;i+=4) if(t[i+4]===1&&t[i+7]>52) return true; for(let i=0;(i=svVFind(t,"stsd",i))>=0;i+=4){ if(svVFind(t,"hev1",i,i+40)>=0) return true; } return false; };
const svVPatch=t=>{ for(let i=0;(i=svVFind(t,"avcC",i))>=0;i+=4){ if(t[i+4]!==1||t[i+7]<=52) continue; t[i+7]=51; if((t[i+9]&31)>=1&&(t[i+12]&31)===7&&t[i+13]===t[i+5]) t[i+15]=51; } for(let i=0;(i=svVFind(t,"stsd",i))>=0;i+=4){ const h=svVFind(t,"hev1",i,i+40); if(h>=0){ t[h+2]=118; t[h+3]=99; } } return t; };   /* hev1→hvc1 */
const svVLv=async u=>{ try{ const g=async(a,b)=>new Uint8Array(await (await fetch(u,{headers:{Range:`bytes=${a}-${b}`}})).arrayBuffer()); const h=await g(0,524287); if(svVFind(h,"stsd")>=0) return svVBad(h); const n=+((await fetch(u,{method:"HEAD"})).headers.get("Content-Length"))||0; return n>524288?svVBad(await g(Math.max(0,n-8388608),n-1)):false; }catch(e){ return false; } };
const svVFull=u=>fetch(u).then(r=>r.ok?r.arrayBuffer():null).then(a=>a?URL.createObjectURL(new Blob([svVPatch(new Uint8Array(a))],{type:/\.mov$/i.test(u)?"video/quicktime":"video/mp4"})):null).catch(()=>null);
const svVBlob=(u,force)=>{ u=String(u||"").split("#")[0]; if(!u) return Promise.resolve(null); const k=force?u+"|f":u; if(!SV_VB[k]) SV_VB[k]=force?svVFull(u):svVLv(u).then(bad=>bad?svVFull(u):fetch(u,{method:"HEAD"}).then(h=>(+h.headers.get("Content-Length")||0)>40*1048576?u:null).catch(()=>null).then(d=>d||svVFull(u))); return SV_VB[k]; };
document.addEventListener("error",async e=>{ const v=e.target; if(!(v instanceof HTMLVideoElement)) return; const src=v.currentSrc||v.getAttribute("src")||""; if(!/\/media\/svs_|^blob:/.test(src)) return; if(v.dataset.svb){ return; } if(!/\/media\/svs_/.test(src)) return; v.dataset.svb="1";
  const u=src.split("#")[0], frag=src.includes("#")?"#"+src.split("#")[1]:"";
  try{ let ob=await svVBlob(u); if(ob===u) ob=await svVBlob(u,1); if(ob&&ob!==u&&v.isConnected){ v.src=ob+frag; v.load(); } else if(v.isConnected){ const w=v.parentElement; if(w&&!w.querySelector(".svv-err")){ const p=document.createElement("p"); p.className="svv-err"; p.textContent="影片讀不到，請練習生重新上傳"; w.appendChild(p); } } }catch(er){} },true);
const svFp=y=>{ const p=y&&y.fp; return p?`object-fit:cover;object-position:${p.x}% ${p.y}%;transform:scale(${p.z||1});transform-origin:${p.x}% ${p.y}%;`:""; };
async function svMediaOk(u,n){ for(let i=0;i<3;i++){ try{ const r=await fetch(u,{method:"HEAD",cache:"no-store"}); if(r.ok){ const L=+(r.headers.get("Content-Length")||0); if(!L||!n||Math.abs(L-n)<16) return true; return false; } }catch(e){} await new Promise(r=>setTimeout(r,1200)); } return false; }
async function svMediaUp(id,blob,on){ if(!HB_ON) return URL.createObjectURL(blob);
  const ct=blob.type||(/\.mov$/.test(id)?"video/quicktime":/\.mp4$/.test(id)?"video/mp4":"image/jpeg"), pub=MEDIA_URL+"/media/"+encodeURIComponent(id);
  if(MEDIA_URL&&blob.size>45*1024*1024){ hbUploadBig.on=p=>on&&on(p); try{ const ok=await hbUploadBig(id,blob.type?blob:new Blob([blob],{type:ct})); if(ok&&!(await svMediaOk(pub,blob.size))) return null; if(ok&&on) on(100); return ok?pub:null; } finally{ hbUploadBig.on=null; } }
  if(MEDIA_URL){ for(let i=0;i<3;i++){ let st=await new Promise(res=>{ try{ const x=new XMLHttpRequest(); x.open("PUT",pub); x.setRequestHeader("Authorization","Bearer "+HB.tok); x.setRequestHeader("Content-Type",ct);
        x.upload.onprogress=e=>{ if(e.lengthComputable&&on) on(Math.min(99,Math.round(e.loaded/e.total*100))); }; x.onload=()=>res(x.status); x.onerror=()=>res(0); x.ontimeout=()=>res(0); x.timeout=10*60e3; x.send(blob); }catch(e){ res(0); } });
      if(st>=200&&st<300||st===409){ if(await svMediaOk(pub,blob.size)){ on&&on(100); return pub; } st=0; } if(st===401){ try{ await hbRefresh(); }catch(e){} } else await new Promise(r=>setTimeout(r,1500*(i+1))); } }
  return await hbImgUrl(id,blob); }
function svUpForm(){ if(ui.svU&&ui.svU.kind==="v"&&!ui.svU.fp) ui.svU.fp={x:50,y:50,z:1}; const s=svSeason(), {ph:uph,m}=svUpMs(s), me=s.demo?(svTrainee(s)||svRecMe(s)):svMyEntry(), my=svStages(uph,m.k).find(x=>x.tid===me.id)||{}, f=ui.svU||(ui.svU={url:my.url||"",kind:my.kind||"",fp:my.fp||(my.kind==="v"?{x:50,y:50,z:1}:null),cap:my.cap||"",team:my.team||"",pos:my.pos||"",iv:my.iv||""});
  setLayer(`<div class="tiei svf sv2 ${svTheme()}"><header class="tiei-top"><button class="icon-btn" data-a="tCloseLayer" aria-label="關閉">${I.back}</button><b>交舞台・${esc(m.t)}</b><span class="sh-sp"></span></header><div class="tiei-body">
    <p class="sv3-how">${esc(m.how)}</p>
    <button class="sv3-upm ${f.url&&!f.busy&&f.kind==="v"?"hid":""}" data-a="svUpPick">${f.busy?`<b>${f.busy}</b>`:f.url?(f.kind==="v"?"":`<img src="${esc(f.pv||f.url)}" alt="">`):`<b>＋ 影片或照片（3:4）</b>`}</button>${f.url&&!f.busy&&f.kind==="v"?`<div class="svfr" id="svFr"><video style="${svFp(f)}" src="${esc(f.pv||f.url)}#t=0.5" muted playsinline webkit-playsinline loop autoplay preload="auto"></video><i class="svfr-g"></i></div><p class="svfr-h">用手指拖曳挑要的畫面（3:4），下面可以放大</p><input type="range" id="svFz" class="svfr-z" min="1" max="2.5" step="0.05" value="${(f.fp&&f.fp.z)||1}"><button class="sv5-sub" data-a="svUpPick">換一支影片</button>`:""}
    ${m.team?`<label class="svf-l">組名</label><input id="svUt" class="svf-in" maxlength="20" placeholder="例：A 組、PICK ME 組" value="${esc(f.team)}">`:""}
    ${m.pos?`<label class="svf-l">位置</label><div class="chips wrap co-chips">${["Vocal","Dance","Rap"].map(k=>`<button class="chip ${f.pos===k?"on":""}" data-a="svUpPos" data-v="${k}">${k}</button>`).join("")}</div>`:""}
    <label class="svf-l">舞台說明</label><textarea id="svUc" class="svf-in" rows="3" maxlength="200" placeholder="唱了什麼歌、想讓大家看到什麼">${esc(f.cap||"")}</textarea><label class="svf-l">後採訪 <em>選填・節目裡會放這段，像在後台受訪</em></label><textarea id="svUi" class="svf-in" rows="2" maxlength="80" placeholder="例：上台前手一直在抖">${esc(f.iv||"")}</textarea>
    <button class="sv2-cta" data-a="svUpOk">${my.id?"換掉舞台":"送出舞台"}</button>${my.id?`<button class="sv5-sub" data-a="svUpDel">刪除這個舞台（誤上傳的話）</button>`:""}</div></div>`); }
const svUKeep=()=>{ const f=ui.svU; if(!f) return; const g=id=>(document.getElementById(id)||{}).value; if(g("svUt")!=null) f.team=g("svUt").trim(); if(g("svUc")!=null) f.cap=g("svUc").trim(); if(g("svUi")!=null) f.iv=g("svUi").trim(); };

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
  const age=t.bd?Math.floor((Date.now()-new Date(t.bd).getTime())/315576e5):0, v=svRkV(s,st)[t.id], ttl={r1:"第一次排名發表",r2:"第二次排名發表",final:"出道組發表"}[st], old=L.querySelector(".svx-fc"); if(old) old.remove();
  const crown='<svg viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M2 14h20M3 12 1.5 3l6 4.5L12 1l4.5 6.5 6-4.5L21 12z"/></svg>';
  L.insertAdjacentHTML("beforeend",`<div class="svx-fc d${d}"><div class="fc-in"><div class="fc-ph">${t.photo?`<img src="${esc(t.photo)}" alt="">`:`<i class="sv2-sil"></i>`}</div><i class="fc-sh"></i>
    <div class="fc-tag"><b>PRODUCE DAY</b><span>${ttl}</span></div>
    <div class="fc-tri"><i class="t1"></i><i class="t2"></i><i class="t3"></i><div class="fc-rk"><span class="fc-cr">${crown}</span><b>${i+1}</b><small>位</small></div></div>
    <div class="fc-bar"><div><small>${esc(t.co||"個人練習生")}${ch?` ${ch}`:""}</small><b>${esc(t.name)}${age?`<span>（${age}）</span>`:""}</b></div>${v!=null?`<div class="fc-vv"><b>${fmt(v)}</b><small>票</small></div>`:""}</div></div>${sp?`<p class="fc-sp">「${esc(sp)}」</p>`:""}</div>`); }
/* 候補：主持人說話，鏡頭帶到每一位（跟發表卡同一個樣子，名次換成候補） */
function svCam(t,lab,line,st){ const s=svSeason(), L=layer.querySelector(".svx"); if(!s||!L) return; const d=svTheme()==="b"?1:0, ttl={r1:"第一次排名發表",r2:"第二次排名發表",final:"出道組發表"}[st], old=L.querySelector(".svx-fc"); if(old) old.remove();
  L.insertAdjacentHTML("beforeend",`<div class="svx-fc d${d} cam"><div class="fc-in"><div class="fc-ph">${t.photo?`<img src="${esc(t.photo)}" alt="">`:`<i class="sv2-sil"></i>`}</div><i class="fc-sh"></i>
    <div class="fc-tag"><b>PRODUCE DAY</b><span>${ttl}</span></div><div class="fc-rec"><i></i>LIVE</div>
    <div class="fc-tri"><i class="t1"></i><i class="t2"></i><div class="fc-rk"><b class="q">?</b><small>${esc(lab)}</small></div></div>
    <div class="fc-bar"><div><small>${esc(t.co||"個人練習生")}</small><b>${esc(t.name)}</b></div></div></div>
    ${line?`<p class="fc-host"><span>${SV_MIC}</span><b>${esc(svHostN(s))}</b>${esc(line)}</p>`:""}</div>`); }
const svFcOut=()=>{ const c=layer.querySelector(".svx-fc"); if(c){ c.classList.add("out"); setTimeout(()=>c.remove(),420); } };

/* ---------- 頁面 ---------- */
/* 11/24 節目播出條：取代 App 標題列（返回、ⓘ 照舊），左上 ON AIR、節目名、現在是第幾天、下一次發表倒數 */
function svAutoSh(s){
  try{ const shk=(svRehOn()?"reh":"")+s.id+(s.airN||"")+s.ph+((svMsNow(s)||{}).k||""); if(ui.svShK!==shk){ ui.svShK=shk; ui.svShIn=0; }   /* 換輪、換任務（示範切換也是）就重新開播 */
    const seenK=acK("daisuki_sv_shseen"), seen=S.get(seenK,{})||{}; if(!s.demo&&seen[shk]) ui.svShIn=1;   /* 11/24 一集每個人只會自動播一次（示範才可以一直重看） */
    if(!ui.svShIn){ ui.svShIn=1; if(!s.demo){ seen[shk]=Date.now(); S.set(seenK,seen); } setTimeout(()=>{ if(!ui.svSh&&!layer.innerHTML){ svSh(); } const mn=document.querySelector("main.svpend"); if(mn) mn.classList.remove("svpend"); },0); } }catch(e){}   /* 11/24 粉絲一進選秀＝節目開播，直接全螢幕播（按返回才回到頁面）；練習生照舊每個任務播一次 */
}
function svOnAir(s,hd){ if(route().role==="artist") return hd; const m=svMsNow(s), ph=s.reair1&&s.ph==="recruit"&&!s.demo?"即將開播":SV_PH[s.ph]||"", nx=SV_ANN[s.ph];
  return `<header class="top core-top svair ${svTheme()}"><div class="top-row"><button class="icon-btn" data-a="back" aria-label="返回">${I.back}</button><div class="svair-t"><b>PRODUCE DAY</b><span>${esc(m?m.t:ph)}</span></div><button class="icon-btn" data-a="pgInfo" data-v="survival" aria-label="玩法說明"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg></button></div>
    <div class="svair-tk"><em>${svVoting()?"ON AIR":"NOW"}</em><span>${esc(ph)}${svVoting()?`・第 ${svDayN(s)} 天`:""}</span>${nx&&svVoting()?`<span>${esc(nx)} ${svCd(s)}</span>`:""}</div></header>`; }
function viewSurvival(id){ const s=svSeason(), th=svTheme(), hd=(route().role==="artist"?focHead:coreHead)(id?"練習生":"選秀",id?"":"survival");
  const pre=(svRehOn()&&!s.demo?(()=>{ const n=svRehNext(); return `<div class="sv-closed svreh">預演中（真的這一季・只在這支手機）<br>${n?`<button class="sv2-cta" data-a="svRehGo">⏩ 時間跳到：${esc(n[1])}</button>`:""}${svMyEntry()?`<button class="sv5-sub" data-a="svRehFan">${ui.svRehFan?"切回參賽練習生":"切換成觀眾（粉絲）來看"}</button>`:""}<button class="sv5-sub" data-a="svReh">結束預演・一鍵清空</button></div>`; })():"")+(svOpen()?"":`<p class="sv-closed">目前沒有開放，這是管理員預覽</p>`);
  if(!s) return hd+`<main class="page sv2 ${th}">${pre}${svHero("下一季準備中","",svPyr([0,1,2,3,4,5],(x,i)=>`<div class="sv2-t svx-e"><span class="sv2-p"><i class="sv2-sil"></i></span><b>${i+1}位</b><span>？</span></div>`),"《COMING SOON》")}${svDemoOk()?`<button class="sv2-cta" data-a="svDemo" data-v="recruit">看示範</button>`:""}</main>`;
  if(id) return hd+svProfile(id);
  const dm=s.demo?`<div class="sv3-dm">${[["recruit","招募"],["r1","第一輪"],["a:r1","第一次發表"],["r2","第二輪"],["a:r2","第二次發表"],["pr","PR 週"],["final","決賽"],["a:final","出道發表"],["prep","出道準備"],["","結束示範"]].map(([k,l])=>`<button class="${k===s.ph?"on":""} ${k[0]==="a"?"an":""}" data-a="svDemo" data-v="${k}">${l}</button>`).join("")}<span class="sv3-dmv">看誰的畫面：</span><button class="${ui.svDemoT?"":"on"}" data-a="svDemoT" data-v="">投票的粉絲</button><button class="${ui.svDemoT?"on":""}" data-a="svDemoT" data-v="1">參賽的練習生</button></div>`:"";
  const sv5v=(String(location.hash).match(/[?&]v=(\w+)/)||[])[1], tabbed=svVoting()&&(!sv5v||["st","rk","pick"].includes(sv5v)), sub=!tabbed&&sv5v&&svSubHtml(s,sv5v); if(tabbed&&!id) svAutoSh(s);   /* 11/24 不管停在哪個分頁，新的一集都會跳出來 */
  return svOnAir(s,hd)+`<main class="page sv2 svtv ${th} ${tabbed?"sv6":""} ${!id&&tabbed&&!ui.svShIn?"svpend":""}">${s.demo?"":pre}${tabbed?svTabsHtml(s,sv5v||"wk"):sub?sub:s.ph==="recruit"?svRecruitHtml(s):svVoting()?svVoteHtml(s):svAfterHtml(s)}${dm}</main>${svVoting()?svBasketHtml():""}`; }
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
  if(!c.done){ const me=svTrainee(s), role=!me?"fan":c.hold&&me.id===c.hold.id?"hold":c.chs.some(t=>t.id===me.id)?"ch":"watch";
    const sec=`<section class="sv4-c1"><div class="sv4-h"><b>1 號位對決</b><small>${s.demo?"示範":"倒數 "+svLeftTxt(svC1End(s)-Date.now())}・${role==="fan"?"一人一票":"觀戰中"}</small></div><div class="sv4-c1l">${c.cand.map(t=>`<div class="sv4-c1i">${tile(t,t===c.hold?"原本坐 1 號位":"挑戰者",`<small>${fmt(c.cnt(t.id))} 票</small>`)}${my||role!=="fan"?"":`<button class="sv2-cta sm" data-a="svC1" data-v="${t.id}">投他</button>`}</div>`).join("")}</div></section>`;
    if(role==="fan") h=svHost(s,"有人想搶 1 號位！國民製作人，請選出誰坐上 1 號位，坐上的人有 1 分鐘 PR 時間。")+sec;
    else if(role==="hold") h=svHost(s,"你的 1 號位正在被挑戰！誰坐上 1 號位，交給國民製作人決定。")+sec;
    else if(role==="ch") h=svHost(s,"你正在挑戰 1 號位！誰坐上 1 號位，交給國民製作人決定。")+sec;
    else h=`<details class="sv4-seat sv4-c1w"><summary>1 號位對決進行中・觀戰</summary>${svHost(s,"1 號位的主人，交給國民製作人決定！")}${sec}</details>`; }
  else if(c.win) h=`<section class="sv4-pr"><div class="sv4-h"><b>1 分鐘 PR</b><small>${c.chs.length?"1 號位對決的贏家":"坐上 1 號位"}</small></div><div class="sv4-prb"><span class="sv4-prp">${svPh(c.win)}</span><div><b>${esc(c.win.name)}</b><small>${esc(c.win.co||svCoOf(c.win.email)||"個人練習生")}</small><p>${esc(c.win.msg||"")}</p><p class="sub">${esc(c.win.ps||"")}</p></div></div></section>`+svHost(s,`坐上 1 號位的 ${esc(c.win.name)}，給你 1 分鐘的 PR 時間！`);
  const O=svOpenSeats(s);
  h+=`<details class="sv4-seat"><summary>開場座位：誰坐在哪裡</summary>${svPyr(Array.from({length:SV_N},(x,i)=>i+1),n=>{ const t=O[n]; return `<div class="sv2-t ${t?"":"svx-e"}"><span class="sv2-p">${t?svPh(t):`<i class="sv2-sil"></i>`}</span><b>${n}</b><span>${t?esc(t.name):"空位"}</span></div>`; })}</details>`;
  return h; }
/* 出道組（還沒正式送出出道申請）才看得到出道準備；其他人看到節目結束 */
const svDbRec=s=>s.demo?null:getDebut().find(x=>x.sv===s.id&&x.status!=="gone");
/* 11/25 選秀收掉（done）後，出道組還沒送出出道申請：入口留著；這時候（或出道準備期限過了）每個成員都能改，不用等隊長 */
const svPrepAll=s=>!!s&&!s.demo&&(s.ph==="done"||(s.ph==="prep"&&s.end&&Date.now()>=s.end));
function svIsPrepMember(s){ if(!s||(s.ph!=="prep"&&s.ph!=="done")) return false; const me=svMe(s); if(!me||!(s.debut||[]).includes(me.id)) return false; if(s.demo) return !!ui.svDemoT; const db=svDbRec(s); return !db||db.status==="no"; }
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
  if(s.reair1&&!s.demo){ const at=new Date(s.end), hm=`${at.getHours()%12||12}:${String(at.getMinutes()).padStart(2,"0")}`, card=`<section class="sv6-ep"><small>PRODUCE DAY・第一輪</small><h2>今晚 ${hm} 首播</h2><p>${E.length} 位練習生，報名已截止。${me?`開播前表演和報名資料都還能修改（還有 ${svCd(s)}）。`:"開播後直接在這裡看節目。"}</p></section>`; const rh="";   /* 11/24 預演測完了，按鈕拿掉（正在預演的話上面還是有「結束」可以清空） */ if(!me) return card+rh; return card+svRecMeCard(s,me)+rh; }
  return svSt5("練習生招募中",`截止 <b>還有 ${svCd(s)}</b>`)
    +(me?svRecMeCard(s,me)
      :svHero5("已經報名",`${E.length} 位`,"誰報名了，開播才公開",art||isWealth(myEmail())?"":`<button data-a="svApply">我也要報名（當練習生）</button>`))
    +svHost(s,svHostTxt(s))
    +`<section class="sv5-pyr"><h4>座位・1 號在最頂端</h4>${svSeatHtml(svSeats(),me&&me.email)}</section>`+svHow5(); }
function svRecMeCard(s,me){ return (()=>{ const lv=s.demo?(ui.svDemoSt||{}).lv:svStages("r1","lv").find(x=>x.tid===me.id), chk=`<div class="sv5-chk"><span class="ok">① 報名・選座位 ✓</span><span class="${lv?"ok":""}">② 導師面前表演${lv?" ✓":""}</span><span>③ 開播公布等級</span></div>`;
      return lv?svCard5("你已經報名了",`坐在 ${me.seat||"?"} 號位・表演交了`,"開播當天導師直接公布 A～F 等級。截止前表演和資料都可以換。",`<button data-a="svUp">換表演</button>`,chk+`<button class="sv5-sub" data-a="svApply">修改報名資料</button>`)
        :svCard5("下一步",`在導師面前表演`,`你坐在 ${me.seat||"?"} 號位。現在交一段 30 秒～1 分鐘的表演（唱、跳、才藝都可以），導師看完會給你 A～F 等級。<b>招募截止前要交，沒交的人等級會很低。</b>`,`<button data-a="svUp">交表演</button>`,chk+`<button class="sv5-sub" data-a="svApply">修改報名資料</button>`); })(); }

function svC1Bn(s){ if(s.ph!=="r1") return ""; const c=svC1(s); if(!c.cand.length) return "";
  if(!c.done) return `<button class="sv5-bn" data-a="uniGo" data-v="#/fan/core?p=survival&v=c1"><i>🔥</i><div><b>1 號位對決進行中</b><small>有人想搶 1 號位，國民製作人投票決定${s.demo?"":"・倒數 "+svLeftTxt(svC1End(s)-Date.now())}</small></div><em>›</em></button>`;
  if(c.win&&(s.demo||Date.now()<svC1End(s)+3*864e5)) return `<button class="sv5-bn" data-a="uniGo" data-v="#/fan/core?p=survival&v=c1"><span class="sv5-bp">${svPh(c.win)}</span><div><b>1 分鐘 PR・${esc(c.win.name)}</b><small>坐上 1 號位的練習生・還有開場座位</small></div><em>›</em></button>`;
  return ""; }

function svTodoTr(s,me){ const m=svMsNow(s); if(!m) return ""; const my=svStages(s.ph,m.k).find(x=>x.tid===me.id), sp=!s.demo&&(me.sp||{})[s.ph], ann=SV_ANN[s.ph], dl=svMd(svPhT0(s)+(m.d[1]-1)*864e5);
  const pe=m.k==="th"&&s.ph==="r1", need=pe?1:0, pr=!pe||!!svPeerMine(s,"cv",me);   /* 11/24 互評拿掉，改成主題曲週投 C 位 */
  const st=[["交舞台",my],...(pe?[["投 C 位",pr]]:[]),...(s.ph==="pr"?[]:[["寫感言",sp]])];   /* PR 週沒有排名發表，不用寫感言 */
  const chk=`<div class="sv5-chk">${st.map(([l,ok],i)=>`<span class="${ok?"ok":""}">${"①②③"[i]} ${l}${ok?" ✓":""}</span>`).join("")}</div>`,
    cm=my&&(my.cm||[]).length?`<div class="sv4-cmt"><b>導師評語</b>${my.cm.map(c=>`<p><span>${esc(c.n)}</span>${esc(c.t)}</p>`).join("")}</div>`:"";
  if(!my) return svCard5("你現在要做的事",`交「${esc(m.t)}」舞台`,`${esc(m.how)}<br><b>${dl} 前交。</b>`,`<button data-a="svUp">交舞台</button>`,chk+cm);
  if(!pr) return svCard5("你現在要做的事","投主題曲 C 位","A 班的練習生裡，你覺得誰最適合站主題曲 C 位？匿名，一人一票，不能投自己。",`<button data-a="uniGo" data-v="#/fan/core?p=survival&v=peer">去投票</button>`,chk+cm);
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
const SV_TABS=[["wk","本週"],["rk","排名"]];   /* 11/24 舞台、練習生分頁拿掉：舞台在節目裡看，PICK 從「今天要做的事」進去 */
function svTabsHtml(s,v){ const tr=svTrainee(s);
  const nav=`<nav class="sv6-tabs">${SV_TABS.map(([k,n])=>`<button class="${k===v?"on":""}" data-a="uniGo" data-v="#/fan/core?p=survival${k==="wk"?"":"&v="+k}">${n}</button>`).join("")}</nav>`;
  const rk=svRank(), all=svAll(), my=svMine(), T=id=>all.find(x=>x.id===id)||{id}, fin=s.ph==="final", hid=svHid(s);
  const body=v==="st"?svStageHtml(s):v==="rk"?(hid?svHidPyr(s,my,tr):svPyr5(fin?"出道組在誰手上？":"現在的排名",rk.slice(0,fin?SV_DEB:6),(id,i)=>svTile(T(id),`${i+1}位`,null,!tr&&my[id]||tr&&tr.id===id)))+svRkList(s,false):v==="pick"?svRkList(s,!tr):svWeekHtml(s);
  return nav+`<div class="sv6-body">${body}</div>`; }
/* 11/24 補救：上傳影片時打的後採訪被清掉 → 今晚 23:59 前，練習生可以補寫「等級評價」那支的舞台說明和後採訪（只改文字、不改交的時間）。補完由管理員按「重新計算等級評價」 */
const SV_IVFIX_END=new Date(2026,10,24,23,59,59).getTime();
const svIvFixSt=(s,tr)=>s&&!s.demo&&s.ph==="r1"&&Date.now()<SV_IVFIX_END&&tr?svStages("r1","lv").find(x=>x.tid===tr.id):null;
function svIvFixBn(s,tr){ const st=svIvFixSt(s,tr); if(!st) return ""; return `<button class="sv5-bn" data-a="svIvFix"><i>🎤</i><div><b>補寫等級評價的後採訪</b><small>${st.iv?"已經寫了，可以再改":"今晚 23:59 前可以補寫"}・只改文字，不影響交的時間</small></div><em>›</em></button>`; }
function svIvFixForm(){ const s=svSeason(), tr=svTrainee(s), st=svIvFixSt(s,tr); if(!st){ toast("現在不能補寫了"); return; }
  tieModal("補寫後採訪",`<label class="svf-l">舞台說明</label><textarea id="svFxC" class="svf-in" rows="3" maxlength="200">${esc(st.cap||"")}</textarea><label class="svf-l">後採訪</label><textarea id="svFxI" class="svf-in" rows="2" maxlength="80" placeholder="例：上台前手一直在抖">${esc(st.iv||"")}</textarea>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="svIvFixOk">儲存</button>`,"sv3-tm"); }
function svWeekHtml(s){ const m=svMsNow(s), tr=svTrainee(s), rk=svRank(), all=svAll(), hid=svHid(s), t0=svPhT0(s), end=m?t0+m.d[1]*864e5:0;
  const ep=m?`<section class="sv6-ep"><small>${SV_PH[s.ph]}・第 ${svDayN(s)} 天</small><h2>${esc(m.t)}</h2><p>${esc(m.how)}</p><div class="sv6-chips"><span class="on">${tr?"交舞台":"現場票"}到 ${svMd(end-864e5)}</span><span>${SV_ANN[s.ph]} 還有 ${svCd(s)}</span></div></section>`:"";
  const me=tr?svTrio([[hid?"保密":`${rk.indexOf(tr.id)+1} 位`,"我現在的排名"],[svGrade(tr)||"－","我的等級"],[`${svDaysL(s)} 天`,SV_ANN[s.ph]]])+svTodoTr(s,tr):"";
  const St=m?svStages(s.ph,m.k).slice().sort((a,b)=>svLive(b)-svLive(a)||svHash(a.id)-svHash(b.id)):[], lv=m&&svMyLv()[s.id+m.k];
  const stg=m?`<section class="sv6-sec"><div class="sv6-sh"><b>這週的舞台</b><button data-a="uniGo" data-v="#/fan/core?p=survival&v=st">${St.filter(x=>!x.v).length?`${St.filter(x=>!x.v).length} 位已交 ›`:"看舞台 ›"}</button></div>${St.length?`<div class="sv3-sg sv6-sg">${St.slice(0,6).map((x,i)=>{ const t=all.find(y=>y.id===x.tid)||{}; return `<button class="sv3-st ${lv===x.id?"me":""}" data-a="svStage" data-v="${x.id}"><span class="sv3-sp">${svCov(x,t)}${x.url&&x.kind==="v"?`<i class="sv3-play"></i>`:""}${i<3&&svLive(x)?`<em>${i+1}</em>`:""}</span><b>${esc(t.name||"")}</b><small>${esc(x.team||x.pos||"")}${x.team||x.pos?"・":""}♥ ${fmt(svLive(x))}</small></button>`; }).join("")}</div>${tr?"":`<p class="sv6-tip">${lv?"這個任務的現場票投了 ✓":m&&!svLvOpen(s,m.k).ok?`超過一半的練習生交了舞台才開放現場票（現在 ${svLvOpen(s,m.k).n}／${svLvOpen(s,m.k).N}）`:"點舞台進去，這個任務可以投 1 張現場票"}</p>`}`:`<p class="sv6-none">還沒有人交舞台</p>`}</section>`:"";
  const play=`<button class="sv6-play" data-a="svSh"><span>▶</span><div><b>看本週節目</b><small>主持人帶你看這週的任務和每一位的舞台</small></div><i>›</i></button>`;
  return ep+(tr?svIvFixBn(s,tr)+play+me+svGrBn(s)+svC1Bn(s):svTodoFan(s))+stg+svHost(s,svHostTxt(s))+svHow5(); }
/* 11/24 粉絲「今天要做的事」：一次只叫你做一件，做完自動換下一件（看節目 → 看舞台投現場票 → PICK） */
const svShK=s=>{ const m=svMsNow(s); return (svRehOn()?"reh":"")+s.id+(s.airN||"")+s.ph+(m?m.k:""); };
const svFanNext=s=>{ const m=svMsNow(s); if(!s.demo&&S.get(acK("daisuki_sv_shw"),"")!==svShK(s)) return "sh"; if(m&&!svMyLv()[s.id+m.k]&&svStages(s.ph,m.k).length) return "st"; return svLeft()?"pick":"done"; };
function svTodoFan(s){ const m=svMsNow(s), L=svLeft(), lv=m&&svMyLv()[s.id+m.k], sh=s.demo||S.get(acK("daisuki_sv_shw"),"")===svShK(s), nx=svFanNext(s), fin=s.ph==="final", rk=svRank();
  const st=[["看本週節目",sh],...(m?[["看舞台投票",!!lv]]:[]),[fin?"PICK 出道組":"PICK",!L]];
  const chk=`<div class="sv5-chk">${st.map(([l,ok],i)=>`<span class="${ok?"ok":""}">${"①②③"[i]} ${l}${ok?" ✓":""}</span>`).join("")}</div>`;
  const pk=fin?`選出 ${SV_DEB} 位出道組`:s.ph==="pr"?"這週不淘汰，票數帶進決賽":s.ph==="r2"?`剩 ${rk.length} 位，${SV_KEEP.r2} 位晉級`:`${rk.length} 位練習生，${SV_KEEP.r1} 位晉級`;
  if(nx==="sh") return svCard5("今天要做的事","先看本週節目","主持人帶你看這週的任務和每一位練習生的舞台，看完就知道想投誰。",`<button data-a="svSh">▶ 看本週節目</button>`,chk);
  if(nx==="st") return svCard5("今天要做的事",`看「${esc(m.t)}」舞台`,"一位一位看，把你的現場票投給最喜歡的舞台（這個任務只有一張）。",`<button data-a="uniGo" data-v="#/fan/core?p=survival&v=st">看舞台</button>`,chk);
  if(nx==="pick") return svCard5("今天要做的事",`還能 PICK ${L} 票`,pk+"，每天都能再 PICK。",`<button data-a="uniGo" data-v="#/fan/core?p=survival&v=pick">去 PICK</button>`,chk);
  return svCard5("今天都完成了","明天再來 PICK",`${SV_ANN[s.ph]||"下一次發表"}還有 ${svCd(s)}。`,`<button data-a="uniGo" data-v="#/fan/core?p=survival&v=rk">看排名</button>`,chk); }   /* PICK 放在頁面裡（不再浮在下面擋舞台）；練習生看不到 */
function svPickBar(s,v){ if(svTrainee(s)||v==="pick") return ""; const L=svLeft(), fin=s.ph==="final", rk=svRank();
  return `<div class="sv6-pk ${svTheme()}"><div><b>${L?`今天還能 PICK ${L} 票`:"今天投完了"}</b><small>${L?(fin?`選出 ${SV_DEB} 位出道組`:s.ph==="pr"?"這週不淘汰，票數帶進決賽":s.ph==="r2"?`剩 ${rk.length} 位，${SV_KEEP.r2} 位晉級`:`${rk.length} 位練習生，${SV_KEEP.r1} 位晉級`):"明天再來"}</small></div><button data-a="uniGo" data-v="#/fan/core?p=survival&v=${L?"pick":"rk"}">${L?"去 PICK":"看排名"}</button></div>`; }

/* ===== 11/18 等級評價：自動算，管理員不能改（粉絲現場票 60%＋練習生互評 40%）；第二輪排名保密 ===== */
const SVPR="daisuki_sv_peer", SV_GRK=["lv","th"];   /* lv＝等級評價、th＝主題曲（重新評價） */
const SV_GRQ=[.1,.2,.25,.25];                        /* A 10%、B 20%、C 25%、D 25%、其他 F */
const svPeerAll=(s,mk)=>s.demo?((ui.svPrD||{})[mk]||{}):(((S.get(SVPR,{})||{})[s.id+"|"+mk])||{});
const svPeerMine=(s,mk,me)=>svPeerAll(s,mk)[me.id];
const SV_PEERG=false;
function svGrCalc(s,mk){ const ids=[...svAlive("r1")], St=svStages("r1",mk), P=svPeerAll(s,mk), mx=Math.max(0,...St.map(svLive));
  const sc={}; ids.forEach(id=>{ const st=St.find(x=>x.tid===id), t=svById(id)||{}, real=t.real||s.demo&&st;
    const taste=(svHash(s.id+mk+"mt"+id)%1000)/1000;   /* 導師口味 */
    if(mk==="lv"){ if(!t.real||s.demo&&!st){ sc[id]=.1+taste*.75; return; }   /* 11/24 虛擬練習生平均壓到中間，認真交的真人才有機會拿 A */
      /* 11/24 真人＝積極度＋導師口味：影片 > 照片、越早交越高、有寫說明／後採加分 */
      const t1=svPhT0(s), t0=t1-SV_DUR.recruit*864e5, fr=st&&st.ts?(st.ts>t1?.5:Math.min(1,Math.max(0,(st.ts-t0)/Math.max(1,t1-t0)))):1;   /* 11/24 原定開播之後（延播期間）才換的表演算中間，不算遲交 */
      sc[id]=st?(st.kind==="v"?.45:.25)+(1-fr)*.2+(st.cap?.08:0)+(st.iv?.07:0)+taste*.2:taste*.1; return; }   /* 11/24 看得出來的努力占大部分，導師口味只占兩成，不會莫名其妙 */
    /* 11/24 現場票換成 0～1：真人照真人之間的票數比（有交就有底分 .3；大家都 0 票就算中間 .5）；虛擬練習生平均也落在 .5，不會因為真人票少就被虛擬的壓過去 */
    const lvN=st?(mx>0?.3+.7*svLive(st)/mx:.5):real?0:.15+.7*(svHash(mk+"lv"+id)%100)/100;
    const R=Object.entries(P).filter(([r])=>r!==id).map(([,v])=>v[id]).filter(Boolean), avg=R.length?R.reduce((a,b)=>a+b,0)/R.length:real?(st?3:1):2.5+(svHash(mk+"pr"+id)%200)/100;
    sc[id]=.6*lvN+.4*(SV_PEERG?(avg-1)/4:taste); });   /* 11/24 重新評價不再用練習生互評：現場票 6 成＋導師 4 成 */
  if(mk!=="lv"&&s.grade&&Object.keys(s.grade).length){ /* 11/24 重新評價照 PD：從第一次的等級最多上下一級。現場票前段的升一級、後段的降一級，沒交舞台的降一級；大家都沒票就不動 */
    const G0=s.grade, G={}, sub=ids.filter(id=>St.some(x=>x.tid===id)), lvv=id=>{ const st=St.find(x=>x.tid===id); return st?svLive(st):0; }, tot=sub.reduce((a,id)=>a+lvv(id),0);
    const rk=sub.slice().sort((a,b)=>lvv(b)-lvv(a)||sc[b]-sc[a]), q=Math.max(1,Math.round(rk.length/4));
    const q30=Math.max(1,Math.round(rk.length*.3)), mid=rk.slice(q30,rk.length-q30).filter(id=>(svById(id)||{}).real), ef=id=>{ const x=St.find(y=>y.tid===id)||{}, m0=svMsList("r1").find(m=>m.k===mk)||{d:[0,8]}, T0=svPhT0(s)+m0.d[0]*864e5, T1=svPhT0(s)+m0.d[1]*864e5, fr=x.ts?Math.min(1,Math.max(0,(x.ts-T0)/Math.max(1,T1-T0))):1; return (x.kind==="v"?.45:.25)+(1-fr)*.2+(x.cap?.08:0)+(x.iv?.07:0); },
      pick=mid.length?mid.slice().sort((a,b)=>ef(b)-ef(a)||svHash(s.id+mk+"pick"+a)-svHash(s.id+mk+"pick"+b))[0]:null;   /* 導師推薦：中間那群裡「這次最用心」的一位（影片>照片、越早交、有說明、有後採訪） */
    ids.forEach(id=>{ const g0=G0[id]||"C", i0=SV_GR.indexOf(g0), t=svById(id)||{}; let d=0;
      if(t.real&&!s.demo){ if(!sub.includes(id)) d=1; else if(tot>0){ const r=rk.indexOf(id), q3=Math.max(1,Math.round(rk.length*.3)); if(r<q3&&lvv(id)>0) d=-1; else if(r>=rk.length-q3&&lvv(id)<lvv(rk[rk.length-q3-1]||rk[0])) d=1; if(d===0&&id===pick) d=-1; } }   /* 11/24 照現場票：前三成升一級、後三成降一級、中間不變、沒交降一級；中間的人裡有一位「導師特別推薦」升一級（意外感） */
      else { const r=svHash(s.id+mk+"mv"+id)%100; d=r<22?-1:r>80?1:0; }
      G[id]=SV_GR[Math.max(0,Math.min(4,i0+d))]; });
    return {G,ord:Object.keys(G).sort((a,b)=>SV_GR.indexOf(G[a])-SV_GR.indexOf(G[b])),sc}; }
  const ord=ids.slice().sort((a,b)=>sc[b]-sc[a]||svHash(a)-svHash(b)), n=ord.length, cnt=SV_GRQ.map((q,i)=>i?Math.round(n*q):Math.max(1,Math.round(n*q))), G={};
  let k=0; ord.forEach((id,i)=>{ while(k<4&&i>=cnt.slice(0,k+1).reduce((a,b)=>a+b,0)) k++; G[id]=SV_GR[k]; });
  return {G,ord,sc}; }
/* 11/24 主題曲 C 位照 PD 第二季：A 班的人裡，由練習生投出來（虛擬練習生照導師口味投） */
function svCenVote(s,G){ const A=Object.keys(G).filter(id=>G[id]==="A"); if(!A.length) return null; const P=svPeerAll(s,"cv"), cnt={};
  [...svAlive("r1")].forEach(v=>{ const mine=P[v], pick=mine?Object.keys(mine)[0]:(svById(v)||{}).real?null:A.filter(x=>x!==v)[svHash(s.id+"cv"+v)%Math.max(1,A.filter(x=>x!==v).length)]; if(pick&&A.includes(pick)) cnt[pick]=(cnt[pick]||0)+1; });
  return A.slice().sort((a,b)=>(cnt[b]||0)-(cnt[a]||0)||svHash(a)-svHash(b))[0]; }
function svGrPub(s,k){ const {G,ord}=svGrCalc(s,k); const cen=k==="th"?svCenVote(s,s.grade||G):s.grCen;   /* 主題曲那週投完才知道 C 位 */
  return {...s,grade0:k==="th"?{...(s.grade||{})}:s.grade0||null,grade:G,grPub:{...(s.grPub||{}),[k]:Date.now()},grCen:cen}; }
/* 等級：只有公布後才看得到（示範：直接用算出來的） */
const svGrDemo=s=>{ if(s.ph==="r1"&&(svMsNow(s)||{}).k==="lv") return {};   /* 11/23 示範也照真的：等級評價任務還在進行，等級就還沒公布 */ if(!ui.svGrD) ui.svGrD=svGrCalc(s,"lv").G; return ui.svGrD; };
const SV_GRCM={A: ["這才叫準備好了。其他人看清楚，這就是標準。", "A 不是終點，主題曲沒有今天這個水準，我照樣把你拉下來。", "高音很穩，表情也沒有放掉。挑不出什麼毛病，繼續保持。", "你一上台我就知道你練過。但別得意，A 班的競爭更兇。", "說實話我本來想給 B，最後那段副歌救了你。"], B: ["實力有，可是我看不到你。你跟其他人哪裡不一樣？", "差一點就是 A。差的那一點，叫自信。", "唱得不錯，跳的時候整個人就散掉了，練。", "你很穩，但穩到我差點睡著。舞台要有記憶點。", "技術上沒問題，就是太乖了。給我一點野心。"], C: ["前三十秒很好，後面整個垮掉，體力是基本功。", "你自己覺得今天的舞台幾分？我覺得你可以更好，所以給 C。", "音準飄了至少三次，你自己有聽到嗎？", "表情管理呢？跳到一半笑場，這在正式舞台是事故。", "不上不下，是最危險的位置。你要往哪邊走自己選。"], D: ["這是準備了多久的舞台？老實說看不出來。", "選曲完全沒有考慮自己的音域，這是判斷力的問題。", "動作都記得，可是沒有一個做到位。", "太緊張了。緊張可以理解，但出道之後每天都是這種壓力。", "我看到努力了，可是努力在這裡是最基本的。"], F: ["你為什麼站在這裡？這個問題你今天回去好好想。", "這個程度不能叫舞台，叫練習室的第一天。", "基本功要從頭來。不想從頭來的話，現在就可以放棄。", "我不是要打擊你，是現在不講，之後節目會講得更難聽。", "F 班不是終點，但如果下次還是這樣，就是了。"]};
const svGrCm=(s,t,k)=>{ const st=svStages("r1",k||"lv").find(x=>x.tid===t.id), c=st&&(st.cm||[])[0]; if(c) return {n:c.n,t:c.t};
  const M=svMentors(s), g=svGrade(t), g0=(s.grade0||{})[t.id], up=g0&&g0!==g?(SV_GR.indexOf(g)<SV_GR.indexOf(g0)?"這幾天進步很多！":"這幾天狀態掉了，要調整回來。"):"";
  const sk=String(((t.sk||[])[0])||""), mm=M.find(x=>sk&&String(x.r||"").toLowerCase()===sk.toLowerCase())||M[svHash("m"+t.id)%M.length]; if(up) return {n:mm.n,t:up}; return {n:mm.n,t:svGrLine(s,t,g,mm)}; };
/* 11/24 導師評語：看導師專長（Vocal／Dance／Rap）挑「指出問題」＋「判決」兩段拼，同一班不會有兩個人拿到一樣的話；A 班中立不兇 */
const SV_CMO={Vocal:["高音一上去就破了。","氣息撐不住，每一句尾音都在掉。","音準飄了至少三次，你自己有聽到嗎？","咬字含糊，我聽不出你在唱什麼。","你一直在用喉嚨硬擠。","副歌那段完全沒有力氣。","低音還可以，一到高音就在閃躲。","你在唱，可是沒有在表達。","呼吸的位置全部錯了。","情緒是假的，我感受不到。"],
  Dance:["動作全部慢半拍。","腳步是亂的，重心一直在晃。","手的線條根本沒有延伸出去。","你在做動作，不是在跳舞。","表情管理整個放掉了。","力量只撐到前八拍，後面就沒了。","走位錯了兩次，你自己知道嗎？","動作很大，可是一點都不乾淨。","跟音樂完全沒有對上。","定點沒停住，整段看起來很散。"],
  Rap:["Flow 一直在搶拍。","咬字太黏，沒有一句聽得清楚。","氣勢有，內容是空的。","你在念稿，不是在 Rap。","節奏感是有的，可是太保守了。","詞是自己寫的嗎？我聽不出你的故事。","聲音太小，舞台上沒有存在感。","中間直接忘詞，後面全亂了。","呼吸換得太明顯，每一句都斷掉。","態度有了，實力還沒跟上。"]};
const SV_CMV={B:["有底子，但還不夠。","離 A 差一步，自己想想差在哪。","這次先給 B。","你可以更好，我知道。","B，主題曲要給我看到更多。"],
  C:["給 C，是因為還看得到一點可能性。","不上不下，是最危險的位置。","C。下次要讓我看到改變。","這個程度只能給 C。","C，自己回去看一次影片。"],
  D:["D。回去從基本功開始。","我看不到準備的痕跡，D。","D，你需要的是時間。","說實話，D 都是客氣了。","D。這樣是出不了道的。"],
  F:["F。你今天回去好好想，為什麼站在這裡。","這不是舞台，F。","我沒辦法給你更高的分數，F。","F 班不是終點，但再這樣就是了。","F。不想從頭來，現在就可以放棄。"]};
const SV_CMA=["準備得很充分。","高音很穩，表情也沒有放掉。","整體完成度很高。","台風很穩，看得出練習量。","選曲很適合自己。","動作乾淨，節奏也抓得很準。","聲音的質感很好。","自己的特色很清楚。"],
  SV_CMAV=["A。主題曲也保持這個水準。","給 A，繼續保持。","A。","這次是 A，別鬆懈。","A，期待主題曲。"];
function svGrLine(s,t,g,mm){ const G=s.demo?svGrDemo(s):s.grade||{}, same=Object.keys(G).filter(id=>G[id]===g).sort((a,b)=>svHash(a+"cm")-svHash(b+"cm")), i=Math.max(0,same.indexOf(t.id)), h=svHash(s.id+g);
  const O=g==="A"?SV_CMA:(SV_CMO[(mm.r||mm.n||"").includes("Dance")?"Dance":(mm.r||mm.n||"").includes("Rap")?"Rap":"Vocal"]), V=g==="A"?SV_CMAV:(SV_CMV[g]||SV_CMV.C);
  return O[(i+h)%O.length]+V[(Math.floor(i/O.length)+i+(h>>>4))%V.length]; }
const svGrSeenK=s=>"sv_grSeen_"+(s.demo?"demo":s.id)+"_"+(s.grade0?"th":"lv");
function svGrBn(s){ if(s.ph==="recruit"||!Object.keys(s.demo?svGrDemo(s):s.grade||{}).length) return ""; const seen=localStorage.getItem(svGrSeenK(s)), re=!!s.grade0;
  if(seen&&!s.demo) return ""; return `<button class="sv5-bn" data-a="uniGo" data-v="#/fan/core?p=survival&v=gr"><i>🎖</i><div><b>${re?"主題曲重新評價公布了":"等級評價公布了"}</b><small>導師給的 A～F 等級和評語</small></div><em>›</em></button>`; }
function svGrHtml(s){ try{ localStorage.setItem(svGrSeenK(s),"1"); }catch(e){} const G=s.demo?svGrDemo(s):s.grade||{}, all=svAll(), T=id=>all.find(x=>x.id===id)||{id,name:"?"}, tr=svTrainee(s), re=!!s.grade0, my=svMine();
  const mine=tr&&G[tr.id]?(()=>{ const c=svGrCm(s,tr,re?"th":"lv"), g0=(s.grade0||{})[tr.id]; return `<section class="sv5-grme"><small>${re?"重新評價":"等級評價"}・你的等級</small><div>${g0&&g0!==G[tr.id]?`<i class="sv3-gr big g${g0}">${g0}</i><em>→</em>`:""}<i class="sv3-gr big g${G[tr.id]}">${G[tr.id]}</i></div><p><b>${esc(c.n)}</b>「${esc(c.t)}」</p></section>`; })():"";
  const cen=s.demo?svCenVote(s,G):s.grCen;
  return svHost(s,re?"主題曲重新評價的結果出來了！有人往上，也有人往下。":"等級評價的結果出來了！A 班的練習生，主題曲的歌詞最多。")+mine
    +(cen?`<section class="sv5-cen">${svTile(T(cen),"主題曲 C 位",null,!tr&&my[cen],"div")}<p>A 班的練習生裡，大家投出來的主題曲 C 位。</p></section>`:"")
    +SV_GR.map(g=>{ const L=Object.keys(G).filter(id=>G[id]===g&&svAlive().has(id)); if(!L.length) return ""; return `<div class="sv5-grh"><i class="sv3-gr g${g}">${g}</i><b>${g} 班</b><small>${L.length} 位</small></div><div class="sv5-grg">${L.map(id=>{ const t=T(id), g0=(s.grade0||{})[id], c=svGrCm(s,t,re?"th":"lv"); return `<button class="sv5-gri ${!tr&&my[id]||tr&&tr.id===id?"me":""}" data-a="uniGo" data-v="#/fan/core?p=survival&id=${id}"><span class="sv2-p">${svPh(t)}</span><b>${esc(t.name)}${g0&&g0!==g?`<em>${g0}→${g}</em>`:""}</b><small>${esc(c.n)}：${esc(c.t)}</small></button>`; }).join("")}</div>`; }).join(""); }

/* 練習生互評：匿名幫別人的舞台打 1～5 顆星，不能評自己 */
const svPeerNeed=(s,mk,me)=>Math.min(5,svStages(s.ph,mk).filter(x=>x.tid!==me.id).length);
function svPeerHtml(s){ const me=svTrainee(s), m=svMsNow(s); if(!me||!m||m.k!=="th") return `<p class="sv2-note">現在沒有要投票的任務</p>`;
  const G=s.demo?svGrDemo(s):s.grade||{}, A=Object.keys(G).filter(id=>G[id]==="A"&&id!==me.id), all=svAll(), done=svPeerMine(s,"cv",me), cur=ui.svCv||(done?Object.keys(done)[0]:"");
  return `<p class="sv5-tip">A 班的練習生裡，誰最適合站<b>主題曲 C 位</b>？匿名，一人一票，不能投自己。${done?"已經投了，還可以改。":""}</p><div class="sv5-prl">${A.map(id=>{ const t=all.find(y=>y.id===id)||{}; return `<button class="sv5-pr sv5-cv ${cur===id?"on":""}" data-a="svCvPick" data-v="${id}"><span class="sv2-p">${svPh(t)}</span><div><b>${esc(t.name||"")}</b><small>${esc(svCoName(t))}</small></div><em>${cur===id?"✓":""}</em></button>`; }).join("")||`<p class="sv2-note">A 班還沒有人</p>`}</div><button class="sv2-cta" data-a="svCvOk" ${cur?"":"disabled"}>${done?"更新":"投票"}</button>`; }

/* 第二輪：排名保密，只公開晉級線下一位（第 11 名） */
const svHid=s=>!!s&&(s.ph==="r2"||s.ph==="final");   /* 照 PD101 第二季：第二輪起排名保密，只公開出道邊緣那一位；決賽前最後一週也全部保密，留到發表現場 */
const svHidN=()=>{ const s=svSeason(); return s&&s.ph==="final"?SV_DEB:SV_KEEP.r2+1; };
function svHidPyr(s,my,tr){ const rk=svRank(), all=svAll(), x=all.find(t=>t.id===rk[svHidN()-1]);
  const q=(id,i)=>`<div class="sv2-t"><span class="sv3-av"><span class="sv2-p"><i class="sv2-sil"></i></span></span><b>？</b><span>？</span></div>`;
  return `<section class="sv5-pyr"><h4>排名保密中・${s.ph==="final"?"出道發表":"第二次排名發表"}才揭曉</h4>${svPyr(Array.from({length:s.ph==="final"?SV_DEB:SV_KEEP.r2},(v,i)=>i),q)}${x?`<div class="sv5-h11"><small>只公開</small>${svTile(x,`${svHidN()}位`,null,!tr&&my[x.id]||tr&&tr.id===x.id)}<small>${s.ph==="final"?`出道是前 ${SV_DEB} 位`:`晉級是前 ${SV_KEEP.r2} 位`}</small></div>`:""}</section>`; }

/* 點進去的頁面 */
function svRkList(s,pick){ const sc=svScores(), rk=svRank(), all=svAll(), B=ui.svB||{}, tr=svTrainee(s), cut=s.ph==="r1"?SV_KEEP.r1:s.ph==="r2"?SV_KEEP.r2:s.ph==="pr"?999:SV_DEB, T=id=>all.find(x=>x.id===id)||{id};
  const hid=svHid(s), h11=rk[svHidN()-1], row=(id,i)=>{ const x=T(id), c=B[id]||0; if(hid) i=id===h11?svHidN()-1:-1; return `<div class="sv2-row ${tr&&tr.id===id?"me":""}" data-a="uniGo" data-v="#/fan/core?p=survival&id=${id}"><span class="sv2-rk">${i<0?"？":i+1+"位"}</span><span class="sv2-av">${svPh(x)}</span><div class="sv2-nm"><b>${esc(x.name)}${svGrB(x,"ln")}</b><small>${esc(x.co||"個人練習生")}${i<0?"":`・${fmt(sc[id]||0)} 票`}</small></div>${tr||!pick?"":`<button class="sv2-pk ${c?"on":svLeft()<=0?"off":""}" data-a="svPick" data-v="${id}">${c?`已選 ${c}`:"PICK"}</button>`}</div>`; };
  return (pick&&!tr?`<p class="sv5-tip">今天還能投 <b>${svLeft()}</b> 票。按 PICK 選人，選好按下面的「送出」才算。</p>`:"")
    +(hid?`<p class="sv5-tip">${s.ph==="final"?"決賽排名保密":"第二輪排名保密"}，照名字排。只公開第 ${svHidN()} 名，${s.ph==="final"?"出道發表":"第二次排名發表"}才揭曉。</p><div class="sv3-rl">${rk.slice().sort((a,b)=>String(T(a).name).localeCompare(String(T(b).name))).map(row).join("")}</div>`:"")
    +(hid?"":`<div class="sv3-rl">${rk.slice(0,cut).map(row).join("")}</div>`
    +(rk.length>cut?`<div class="sv2-sh out"><b>${s.ph==="final"?"出道組以外":"淘汰邊緣"}</b><i>${cut+1} 位以下</i></div><div class="sv3-rl">${rk.slice(cut).map((id,i)=>row(id,i+cut)).join("")}</div>`:"")); }

/* 11/24 「怎麼玩」照每一輪、每個任務換內容（練習生／國民製作人各一版；規則只用暗示，不寫後台算法） */
function svHowInfo(s,tr){ const ph=s.ph, m=svMsNow(s), k=m&&m.k, P=t=>`<p>${t}</p>`, B=(b,t)=>P(`<b>${b}</b>：${t}`), keep=ph==="r1"?SV_KEEP.r1:SV_KEEP.r2, out=[];
  if(tr){
    if(ph==="recruit") out.push(P("歡迎來到《PRODUCE DAY》！先選好座位，接著在導師面前表演。"),B("等級評價","開播當天，導師會給你 A～F 的等級。導師看的不只是表演，也看你準備得多用心。"),B("換表演","截止前表演和報名資料都可以換。"));
    else if(ph==="r1"&&(k==="th"||k==="lv")) out.push(P("等級出來了！這週照班級練主題曲。"),B("交舞台","期限內交出主題曲練習（影片或照片＋說明），期限內都能換。沒交的人，就等於離開這個舞台。"),B("主題曲 C 位","A 班的練習生裡，大家一起投出誰最適合站 C 位。"),B("主題曲重新評價","只要這次特別用心，還是有機會被導師拉上去。"),B("後採訪","交舞台時寫下想說的話，節目裡會播出來。"));
    else if(ph==="r1") out.push(P("第一輪的最後一關：組別對決。"),B("交舞台","交舞台時寫上你的組名。兩組唱同一首歌，國民製作人的現場票決定哪一組贏。"),B("第一次排名發表",`這一輪結束時發表，前 ${SV_KEEP.r1} 位才能繼續。先把被叫到名字時要說的感言寫好。`));
    else if(ph==="r2"&&k==="po") out.push(P("第二輪開始！這週是 Position 評價。"),B("選位置","Vocal、Dance、Rap，交舞台時選一個最能讓你發光的位置。"),B("排名保密","從這一輪開始，排名不再全部公開。結果，留到發表那天。"));
    else if(ph==="r2") out.push(P("這週是概念評價，每一組都要表演一首全新的歌。"),B("交舞台","交舞台時寫上你的組名，讓國民製作人看到不一樣的你。"),B("第二次排名發表",`這一輪結束時發表，前 ${SV_KEEP.r2} 位才能進決賽。感言先寫好。`));
    else if(ph==="pr") out.push(P("決賽前的特別一週：1 分鐘 PR。"),B("交舞台","一分鐘的自我介紹或直拍，讓國民製作人最後一次好好認識你。"),B("這週不淘汰","但這一分鐘，國民製作人都會記得。"));
    else if(ph==="final") out.push(P("最後的舞台：出道評價。"),B("交舞台","剩下的人分兩組，各表演一首決賽曲，交舞台時寫上組名。"),B("出道組發表",`前 ${SV_DEB} 位出道。被叫到名字時要說的話，先寫好。`));
    else out.push(P("恭喜出道組誕生！接下來準備出道：一起決定團名、隊長和出道曲。"));
    if(ph!=="recruit"&&ph!=="prep") out.push(B("SNS","節目播出期間，個人帳號暫停使用，想發文就用節目的官方帳號。"),P("比賽期間不能 PICK、也不能投現場票，專心準備就好！"));
    return out.join(""); }
  if(ph==="recruit") out.push(P("《PRODUCE DAY》練習生招募中！開播後，你就是決定出道組的國民製作人。"),B("開播","每集晚上六點首播。準時守著首播，就能看到 LIVE。"));
  else if(ph==="r1"&&(k==="th"||k==="lv")) out.push(P("第一集播完了！等級出來了，這週是主題曲。"),B("PICK",`每天可以 PICK ${svCap()} 票，選好按「送出」才算。`),B("現場票","看完主題曲舞台，投一張現場票給最喜歡的。你的現場票，也會影響她們的重新評價。"));
  else if(ph==="r1") out.push(P("這週是組別對決：兩組唱同一首歌。"),B("PICK",`每天可以 PICK ${svCap()} 票。`),B("現場票","投給最喜歡的舞台，現場票高的那組會拿到加分。"),B("第一次排名發表",`這一輪結束時發表，前 ${SV_KEEP.r1} 位晉級。`));
  else if(ph==="r2") out.push(P(k==="po"?"第二輪開始！這週是 Position 評價：Vocal、Dance、Rap。":"這週是概念評價：每組一首全新的歌。"),B("PICK",`每天可以 PICK ${svCap()} 票。`),B("現場票","每個任務投一張給最喜歡的舞台，前三名會拿到加分票。"),B("排名保密",`從這一輪開始，排名不再全部公開，只公開第 ${SV_KEEP.r2+1} 名。誰會留下來，發表那天才知道。`));
  else if(ph==="pr") out.push(P("決賽前的特別一週：每位練習生的 1 分鐘 PR。"),B("這週不淘汰","但這週的票會一起帶進決賽。"),B("現場票","投給最打動你的 PR，前三名會拿到加分票。"));
  else if(ph==="final") out.push(P("終於到決賽了。"),B("PICK",`每天 ${svCap()} 票，請慎重。`),B("出道組發表",`前 ${SV_DEB} 位出道。最後一個位置，就交給國民製作人了。`));
  else out.push(P("出道組誕生了！謝謝國民製作人一路陪到最後。"));
  if(ph!=="recruit"&&ph!=="prep") out.push(B("看節目","每集晚上六點首播，準時守著就能看到 LIVE。"),B("官方 SNS","produceday.official 會放上每一位的舞台，多去看看、按個讚，也會變成她們的票。"));
  return out.join(""); }
function svHowHtml(s){ const li=L=>`<ol class="sv5-rule">${L.map(x=>`<li>${x}</li>`).join("")}</ol>`, tr=svVoting()&&svTrainee(s);
  if(s.ph==="recruit") return li(["想當練習生的人按「報名」：填名字、生日、照片，選一個座位。1 號在最頂端，先選先贏；1 號有人坐了也可以挑戰（要另外選一個備用座位）。",
    "招募結束就開播，誰報名了要等開播才公開。",
    `開播後分三輪：第一輪留 ${SV_KEEP.r1} 位、第二輪留 ${SV_KEEP.r2} 位、決賽選出 ${SV_DEB} 位出道組。`,
    "國民製作人每天可以 PICK（第一、二輪每天 3 票，決賽每天 1 票）。",
    `出道組會以限定團體活動一年半。`]);
  const M=svMsList(s.ph);
  return `<div class="pg-info sv5-howi">${svHowInfo(s,tr)}</div>`
    +`<div class="sv5-sh">這一輪的任務</div><div class="sv4-ml">${M.map(x=>`<span class="${svMsSt(s,x)==="進行中"?"on":svMsSt(s,x)==="已結束"?"end":""}"><b>${esc(x.t)}</b><small>${svMsWhen(s,x)}・${svMsSt(s,x)}</small></span>`).join("")}</div>`; }
function svSubHtml(s,v){ const t={pick:"PICK 練習生",rk:"全部排名",st:"任務舞台",how:"怎麼玩？",gr:s.grade0?"主題曲重新評價":"等級評價",peer:"投主題曲 C 位",c1:s.ph==="r1"&&svC1(s).done?"1 分鐘 PR":"1 號位對決"}[v];
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
    <section class="sv2-pyr svf-hd"><div class="sv2-rib"><span>PRODUCE DAY</span><span>${s.g==="b"?"男團":"女團"}第 ${s.no||1} 季・練習生報名</span></div>
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
  return `<div class="sv5-adm"><b>等級評價（自動算，不能手動改）</b><p class="ae-tip">等級評價：導師看報名時交的表演（有交的人分數高），開播當天公布。主題曲重新評價：粉絲現場票 6 成＋練習生互評 4 成。照名次給 A 10%・B 20%・C 25%・D 25%・F 20%。任務期限到了會自動公布；導師評語在「舞台」點開寫，沒寫就用預設的。</p>
    ${SV_GRK.map(k=>`<p class="ae-tip">${k==="lv"?"等級評價":"主題曲重新評價"}：${P[k]?`已公布（${new Date(P[k]).toLocaleString()}）`:"還沒公布"}</p>`).join("")}
    ${nx&&(nx==="lv"||P.lv)?`<p class="ae-tip">現在算的話：${cnt}</p><button class="btn btn-soft" data-a="svGrPubNow" data-v="${nx}">現在就公布${nx==="lv"?"等級評價":"重新評價"}</button>`:""}</div>`; }
function svAdminHtml(){ const s=svSeason(), E=svEntries(); const dmb=`${s&&!s.demo&&s.ph==="r1"&&!((s.grPub||{}).th)?`<div class="sv5-adm"><b>補救：等級評價重算</b><p class="ae-tip">練習生補寫後採訪（今晚 23:59 前）之後，按這個用最新的資料重新分班。</p><button class="btn btn-soft" data-a="svGrRe">重新計算等級評價</button></div>`:""}<div class="sv5-adm"><b>選秀示範</b><p class="ae-tip">用假資料看每一輪的畫面，只在你的手機，不影響這一季。</p><button class="btn btn-soft" data-a="svDemoGo">打開示範</button></div>`;
  if(!s||s.ph==="done") return dmb+`<section class="card studio"><p class="ae-tip">${s?"上一季已經結束。":""}開一季新的選秀：先招募 1 週，真人不到 ${SV_MIN} 位會自動延長。</p><div class="ls-btns"><button class="btn btn-main" data-a="svNew" data-v="g">開新一季（女團）</button><button class="btn btn-soft" data-a="svNew" data-v="b">開新一季（男團）</button></div><p class="ae-tip" style="margin-top:12px">虛擬練習生的照片（一次可以選很多張，會依序放進還沒有照片的人）</p><div class="ls-btns"><button class="btn btn-soft" data-a="svNpcPh" data-v="g">女生照片（${Object.keys(S.get(SVNP,{})||{}).filter(k=>k[0]==="n").length}／${SV_N}）</button><button class="btn btn-soft" data-a="svNpcPh" data-v="b">男生照片（${Object.keys(S.get(SVNP,{})||{}).filter(k=>k[0]==="m").length}／${SV_N}）</button></div></section>`;
  const rk=svVoting()?svRank():[], sc=svVoting()?svScores():{}, all=svAll();
  const chat=s.ph==="prep"&&!s.demo?`<section class="card studio sv2 ${svTheme()}">${svChatHtml(s,true)}</section>`:"";   /* 出道準備：管理員用主持人身分回答出道組 */
  return dmb+chat+`<section class="card studio"><p class="ae-tip">${s.g==="g"?"女團":"男團"}第 ${s.no||1} 季・<b>${SV_PH[s.ph]}</b>${s.end?`・${new Date(s.end).toLocaleString()} 自動公布／進下一階段`:""}${s.ext?`・招募已延長 ${s.ext} 次（真人 ${E.length}／至少 ${SV_MIN}）`:""}</p>
    <div class="sv3-adm">${s.ph!=="prep"?`<button class="btn btn-soft" data-a="svNext">現在就${s.ph==="recruit"?"結束招募":"公布"}</button>`:`<button class="btn btn-soft" data-a="svDone">出道完成，結束這一季</button>`}<button class="btn btn-soft" data-a="svPrepW">出道準備 ${s.prepW||3} 週</button><button class="btn btn-soft" data-a="svCast">主持人・導師</button><button class="btn btn-soft" data-a="svNpcPh" data-v="${s.g==="b"?"b":"g"}">虛擬練習生照片 ${Object.keys(S.get(SVNP,{})||{}).filter(k=>k[0]===(s.g==="b"?"m":"n")).length}/${SV_N}</button><button class="btn btn-soft" data-a="svEnd">取消這一季</button></div>
    ${s.ph==="r1"?svGrAdm(s):""}
    ${svMsList(s.ph).length?`<p class="ae-tip">這一輪的任務：${svMsList(s.ph).map(m=>`${m.t}（第 ${m.d[0]+1}～${m.d[1]} 天）`).join("→")}。現場票前三名在任務截止後加「真人平均票數」的 30%／20%／10%；舞台點開可以寫導師評語。</p>`:""}</section>
    ${svVoting()?`<div class="section-h">這一輪排名・加分票</div><section class="card studio">${rk.map((id,i)=>{ const x=all.find(t=>t.id===id)||{}; return `<div class="sv2-row"><span class="sv2-rk">${i+1}</span><div class="sv2-nm"><b>${esc(x.name)}${x.real?"":"<small>（虛擬）</small>"}</b><small>${fmt(sc[id]||0)} 票</small></div><i class="sv3-gr g${svGrade(x)}">${svGrade(x)||"－"}</i><button class="btn btn-soft btn-sm" data-a="svBonus" data-v="${id}">加分</button></div>`; }).join("")}</section>`:""}
    ${E.length?`<div class="section-h">報名的人（${E.length}）</div><section class="card studio">${E.map(e=>`<div class="sv2-row"><div class="sv2-nm"><b>${esc(e.name)}</b><small>${esc(acctUser(e.email))}・${esc(e.co||"個人練習生")}</small></div><button class="btn btn-soft btn-sm" data-a="svKick" data-v="${e.id}">移除</button></div>`).join("")}</section>`:""}`; }

/* ---------- 動作 ---------- */
/* 票送到雲端之後：記今天用了幾票、我投過誰，跳結果 */
function svSent(s,B,n){ S.set(acK("daisuki_sv_day"),{k:svDayK(),n:svUsed()+n}); const my=S.get(acK("daisuki_sv_my"),{})||{}; Object.entries(B).forEach(([id,c])=>{ my[id]=(my[id]||0)+c; }); S.set(acK("daisuki_sv_my"),my);
  const all=svAll(), rk=svRank(), y=window.scrollY; render(); window.scrollTo(0,y);
  xvResult({tone:svTheme()==="g"?"p":"b",small:"PRODUCE DAY",title:"PICK 完成",big:`${n} 票`,chips:[...Object.keys(B).map(id=>`${(all.find(x=>x.id===id)||{}).name} 現在 ${rk.indexOf(id)+1}位`),svLeft()?`今天還能投 ${svLeft()} 票`:"今天投完了，明天再來"],back:"好"}); }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a; if(a==="svRehFan"){ e.stopImmediatePropagation(); ui.svRehFan=!ui.svRehFan; ui.svSh=null; ui.svShIn=0; layer.innerHTML=""; render(); window.scrollTo(0,0); toast(ui.svRehFan?"現在是觀眾（粉絲）的畫面":"現在是參賽練習生的畫面"); return; }
  if(a==="svRehGo"){ e.stopImmediatePropagation(); if(svRehOn()) svRehGo(); return; }
  if(a==="svReh"){ e.stopImmediatePropagation(); if(svRehOn()){ ask("結束預演？剛剛在預演裡做的事（投票、交舞台、改資料）全部清掉，回到真的資料。",()=>sbxOff(),{ok:"結束並清空",danger:false}); return; }
    ask("開始預演？\n用真的這一季（真的練習生、真的上傳）假裝已經開播，投票、交舞台、改資料都能真的做，但只在這支手機，不會影響其他人。結束時一鍵清空。",()=>{ try{ if(!sbxOn()) sbxStart(); localStorage.setItem("hc_sv_reh","1"); const r=svReal(); if(r&&r.ph==="recruit"&&r.end&&r.end>Date.now()) svRehShift(r.end-Date.now()+6e4); for(let i=0;i<6;i++){ try{ svTick(); }catch(e2){} } }catch(er){} ui.svRehC=null; ui.svSh=null; ui.svShIn=0; layer.innerHTML=""; try{ sbxPill(); }catch(er){} render(); window.scrollTo(0,0); toast("預演開始"); },{ok:"開始預演",danger:false}); return; }
  if(!/^sv(Pick|Unpick|Send|Apply|ApplyOk|Photo|Co|Quit|New|Next|Done|PrepW|End|Bonus|BonusOk|Kick|RevealGo|NextEp|NextX|IvFix|IvFixOk|GrRe|DemoGo|CvPick|CvOk|DebutApply|Demo|xSkip|Seat|Sk|Speak|SpeakOk|Gr|GrOk|Mk|Stage|Lv|Up|UpPick|UpPos|UpOk|UpDel|Cm|CmOk|Cast|CastOk|DbDraft|DbSave|MemEd|MemOk|PvNew|PvOk|Pvo|PvEnd|Tab|More|DemoT|NpcPh|Ch1|C1|ChSend|GrPubNow|GrPubOk|PrS|PrOk)$/.test(a)) return; e.stopImmediatePropagation();
  const rr=()=>{ const y=window.scrollY; render(); window.scrollTo(0,y); }, s=svSeason();
  switch(a){
    case "svPick": { if(!svVoting()) return; if(meBlocked()) return; if(svTrainee(s)){ toast("參賽的練習生不能投票"); return; } const B=ui.svB=ui.svB||{}, n=Object.values(B).reduce((x,y)=>x+y,0); if(n>=svLeft()){ toast(svLeft()?`今天最多再投 ${svLeft()} 票`:"今天的票投完了，明天再來"); return; } if(!svAlive().has(t.dataset.v)) return; B[t.dataset.v]=(B[t.dataset.v]||0)+1; rr(); return; }
    case "svUnpick": { const B=ui.svB||{}; if(B[t.dataset.v]) B[t.dataset.v]--; if(!B[t.dataset.v]) delete B[t.dataset.v]; rr(); return; }
    case "svSend": { const B=ui.svB||{}, n=Object.values(B).reduce((x,y)=>x+y,0); if(!n||!s||!svVoting()) return; if(n>svLeft()){ ui.svB={}; rr(); toast("票數不對，請重新選"); return; }
      if(s.demo){ ui.svDV=ui.svDV||{}; Object.entries(B).forEach(([id,c])=>{ ui.svDV[id]=(ui.svDV[id]||0)+c; }); ui.svDU=(ui.svDU||0)+n; const all=svAll(), rk=svRank(); ui.svB={}; rr(); xvResult({tone:"p",small:"示範・不會存",title:"PICK 完成",big:`${n} 票`,chips:[...Object.keys(B).map(id=>`${(all.find(x=>x.id===id)||{}).name} 現在 ${rk.indexOf(id)+1}位`),svLeft()?`今天還能投 ${svLeft()} 票`:"今天投完了，明天再來"],back:"好"}); return; }
      /* 11/23 票數修正：以前是「拿手機裡的那份票數＋自己的票，整份蓋回雲端」，手機那份還沒更新（或兩個人同時投）時，別人的票會被蓋掉；改成在雲端那份上加（有版本號，同時投也不會互蓋） */
      const ph0=s.ph, sid0=s.id, B0={...B}; ui.svB={}; t.disabled=true;
      mkEdit(SVV,v=>{ const o={...(v||{})}; o[sid0]={...(o[sid0]||{})}; o[sid0][ph0]={...(o[sid0][ph0]||{})}; Object.entries(B0).forEach(([id,c])=>{ o[sid0][ph0][id]=(o[sid0][ph0][id]||0)+c; }); return {v:o}; }).then(()=>svSent(s,B0,n)).catch(()=>{ ui.svB=B0; t.disabled=false; rr(); toast("票沒有送出去，再按一次"); }); return; }
    case "svDemo": { const v=t.dataset.v||""; if(v[0]==="a"){ const st=v.slice(2); ui.svDemoNo=(ui.svDemoNo||0)%3+1; ui.svDemo={r1:"r2",r2:"pr",final:"prep"}[st]; ui.svB={}; rr(); svRevIntro(st); return; } ui.svDemo=v||null; ui.svB={}; ui.svDU=0; ui.svDV={}; rr(); window.scrollTo(0,0); return; }
    case "svNextEp": { svNextEp(t.dataset.v); return; }
    case "svNextX": { clearInterval(ui.svNxI); layer.innerHTML=""; return; }
    case "svDemoGo": { ui.svDemo="recruit"; ui.svB={}; ui.svDU=0; ui.svDV={}; navTo("#/fan/core?p=survival"); window.scrollTo(0,0); return; }
    case "svIvFix": { svIvFixForm(); return; }
    case "svIvFixOk": { const tr=svTrainee(s), st=svIvFixSt(s,tr); if(!st) return; const cap=((document.getElementById("svFxC")||{}).value||"").trim(), iv=((document.getElementById("svFxI")||{}).value||"").trim();
      mkEdit(SVST,v=>({v:(Array.isArray(v)?v:[]).map(x=>x.id===st.id?{...x,cap,iv,fix:Date.now()}:x)})).then(()=>{ layer.innerHTML=""; rr(); toast("存好了"); }).catch(()=>toast("沒有存到，再按一次")); return; }
    case "svGrRe": { if(!isAdminAcct()||!s||s.demo) return; ask("用最新的舞台說明和後採訪，重新計算第一次的等級評價？\n（主題曲重新評價還沒公布前才能用）",()=>{ const r=svReal(); if(!r||(r.grPub||{}).th){ toast("主題曲重新評價已經公布，不能重算"); return; } const g=svRealDo(()=>svGrPub(r,"lv")); S.set(SVS,{...g,grPub:{...(r.grPub||{})}}); render(); toast("等級評價重算好了"); },{ok:"重新計算",danger:false}); return; }
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
    case "svApplyOk": { svKeep(); const f=ui.svF; if(s&&s.demo){ ui.svF=null; layer.innerHTML=""; toast("示範：這樣就報名完成了（不會真的存）"); return; } if(!s||s.ph!=="recruit"||(s.reair1&&!svRecMe(s))){ toast("報名已經截止了"); return; } if(!f.name){ toast("請輸入名字"); return; } if(nameBlock&&nameBlock(f.name)) return; if(!f.bd){ toast("請選生日"); return; } if(f.bd>="2014-01-01"){ toast("報名資格：2013 年（含）以前出生"); return; } if(!f.photo||f.photo.startsWith("blob:")){ toast(f.photo?"照片還在上傳，等一下":"請放一張大頭照"); return; } if(!f.seat){ toast(f.ch1?"挑戰 1 號位也要再選一個備用座位":"請選一個座位"); return; } if(svSeats()[f.seat]&&svSeats()[f.seat].email!==myEmail()){ toast("這個座位剛剛被選走了，換一個"); return; } if(f.ps.length<5){ toast("個性再多寫一點"); return; } if(!f.sk.length){ toast("請選擅長的"); return; } if(f.msg.length<5){ toast("想對國民製作人說的話再多寫一點"); return; }
      if(svEntries().some(x=>x.email!==myEmail()&&x.name.toLowerCase()===f.name.toLowerCase())||GROUPS.some(g=>g.name.toLowerCase()===f.name.toLowerCase())){ toast("這個名字已經有人用了"); return; }
      const me=myEmail(), row={name:f.name,bd:f.bd,photo:f.photo,seat:f.seat,ch1:f.ch1?1:0,ps:f.ps,sk:f.sk,msg:f.msg}, nid=uid("sve"), had=(S.get(SVE,[])||[]).some(x=>x.sid===s.id&&x.email===me&&!x.out);
      mkEdit(SVE,v=>{ const L=[...(Array.isArray(v)?v:[])], i=L.findIndex(x=>x.sid===s.id&&x.email===me&&!x.out); if(i>=0) L[i]={...L[i],...row,edited:Date.now()}; else L.push({id:nid,sid:s.id,email:me,ts:Date.now(),...row}); return {v:L}; }).then(()=>{ ui.svF=null; layer.innerHTML=""; rr(); toast(had?"已儲存":"報名完成，招募結束後開始投票"); }).catch(()=>toast("沒有送出去，再按一次")); return; }
    case "svQuit": { ask("確定要取消報名嗎？",()=>{ mkEdit(SVE,o=>({v:(Array.isArray(o)?o:[]).map(x=>x.sid===(s||{}).id&&x.email===myEmail()?{...x,out:Date.now()}:x)})).then(()=>{ layer.innerHTML=""; rr(); toast("已取消報名"); }).catch(()=>toast("沒有送出去，再試一次")); }); return; }
    case "svNew": { if(!isAdminAcct()) return; const now=svAt18(Date.now()), no=(S.get("daisuki_sv_doneN",0)||0)+1; S.set(SVS,{id:"sv"+now.toString(36),no,g:t.dataset.v,ph:"recruit",t0:now,t0s:{recruit:now},end:now+SV_DUR.recruit*864e5,prepW:3}); S.set("daisuki_sv_theme",t.dataset.v); rr(); toast("新一季開始招募了"); return; }
    case "svNext": { ask(s&&s.ph==="recruit"?"現在就結束招募、開始第一輪嗎？（真人不到 "+SV_MIN+" 位也會開始）":"現在就公布這一輪的結果嗎？",()=>{ svAdvance(true); rr(); toast("已公布"); }); return; }
    case "svPrepW": { S.set(SVS,{...s,prepW:(s.prepW||3)===3?4:3,...(s.ph==="prep"?{end:(s.t0||Date.now())+((s.prepW||3)===3?4:3)*7*864e5}:{})}); rr(); return; }
    case "svDone": { if(!s.demo&&(s.debut||[]).length&&!svDbRec(s)) toast("出道組還沒送出出道申請：選秀收起來後，出道組每個人都還能繼續填、送出"); S.set("daisuki_sv_doneN",Math.max(S.get("daisuki_sv_doneN",0)||0,s.no||1)); S.set(SVS,{...s,ph:"done",end:0}); rr(); return; }
    case "svEnd": { ask("確定要取消這一季嗎？報名、票數都會清掉。",()=>{ S.set(SVS,{id:(s||{}).id||"",ph:"x",ts:Date.now()}); rr(); toast("已取消"); }); return; }
    case "svBonus": { const x=svById(t.dataset.v); tieModal(`幫 ${esc(x?x.name:"")} 加分`,`<p class="fy-info">任務表現好的，在這一輪加分票（可以打負數扣掉）</p><input id="svBn" class="a-nick-in" type="number" inputmode="numeric" placeholder="例：100">`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="svBonusOk" data-v="${t.dataset.v}">加上去</button>`); return; }
    case "svGr": { if(!isAdminAcct()) return; const x=svById(t.dataset.v), g=svGrade(x); tieModal(`${esc(x?x.name:"")} 的等級`,`<p class="fy-info">導師看完等級評價的舞台後標上；主題曲重新評價時也可以改。</p>`,`<div class="sv3-grp">${SV_GR.map(k=>`<button class="sv3-gr big g${k} ${k===g?"on":""}" data-a="svGrOk" data-v="${t.dataset.v}|${k}">${k}</button>`).join("")}<button class="t-mbtn" data-a="svGrOk" data-v="${t.dataset.v}|">清除</button></div>`); return; }
    case "svGrPubNow": { if(!isAdminAcct()||!s) return; tieModal("現在就公布？",`<p class="fy-info">公布後大家都會看到等級，不能改。</p>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="svGrPubOk" data-v="${t.dataset.v}">公布</button>`); return; }
    case "svGrPubOk": { if(!isAdminAcct()||!s) return; S.set(SVS,svGrPub(s,t.dataset.v)); layer.innerHTML=""; rr(); toast("已公布"); return; }
    case "svPrS": { const [id,k]=t.dataset.v.split("|"); ui.svPr=ui.svPr||{}; ui.svPr[id]=+k; t.parentNode.querySelectorAll("button").forEach((b,i)=>b.classList.toggle("on",i<+k)); const me=svTrainee(s), m=svMsNow(s), need=me&&m?svPeerNeed(s,m.k,me):0, n=Object.keys(ui.svPr).length, ok=document.querySelector('[data-a="svPrOk"]'); if(ok){ ok.disabled=!(n>=need&&need); ok.textContent=ok.textContent.replace(/已評 \d+ 位/,`已評 ${n} 位`); } return; }
    case "svCvPick": { ui.svCv=t.dataset.v; render(); return; }
    case "svCvOk": { const me=svTrainee(s); if(!me||!ui.svCv) return; if(s.demo){ ui.svPrD=ui.svPrD||{}; ui.svPrD.cv={...(ui.svPrD.cv||{}),[me.id]:{[ui.svCv]:1}}; }
      else mkEdit(SVPR,v=>{ const k=s.id+"|cv", o={...(v||{})}; o[k]={...(o[k]||{}),[me.id]:{[ui.svCv]:1}}; return {v:o}; }); ui.svCv=""; toast("投好了"); navTo("#/fan/core?p=survival"); return; }
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
    case "svLv": { if(!s||!svVoting()||meBlocked()) return; if(svTrainee(s)){ toast("參賽的練習生不能投現場票"); return; } const x=svStages(s.ph).find(y=>y.id===t.dataset.v); if(!x) return; const lo=svLvOpen(s,x.mk); if(!lo.ok){ toast(`超過一半的練習生交了舞台才開放現場票（現在 ${lo.n}／${lo.N}）`); return; } const k=s.id+x.mk;
      if(s.demo){ ui.svDLm={...(ui.svDLm||{}),[k]:x.id}; ui.svDL={...(ui.svDL||{}),[x.id]:((ui.svDL||{})[x.id]||0)+1}; }
      else { const M=S.get(acK("daisuki_sv_lv"),{})||{}; if(M[k]){ toast("這個任務已經投過現場票了"); return; } M[k]=x.id; S.set(acK("daisuki_sv_lv"),M); mkEdit(SVLV,v=>{ const L={...(v||{})}; L[x.id]=(L[x.id]||0)+1; return {v:L}; }).catch(()=>{}); }
      if(ui.svSh){ svShDraw(); rr(); } else { layer.innerHTML=""; rr(); } toast("現場票投好了"); return; }
    case "svUp": { ui.svU=null; svUpForm(); return; }   /* 11/23 示範也打得開（交了只存在這支手機，不會送出） */
    case "svUpPos": { svUKeep(); ui.svU.pos=t.dataset.v; svUpForm(); return; }
    case "svUpPick": { svUKeep(); const f=ui.svU; if(f.busy) return; const inp=document.createElement("input"); inp.type="file"; inp.accept="video/*,image/*"; inp.onchange=async()=>{ const fl=inp.files&&inp.files[0]; if(!fl) return; const v=/^video/.test(fl.type);
        try{ f.busy="上傳中… 0%"; svUpForm(); svUKeep(); const c0=v?null:await cropImg(fl,{ratio:3/4,max:1600}); if(!v&&!c0){ svUKeep(); f.busy=""; svUpForm(); return; } const b=v?fl:await shrinkImg(c0,1600), ext=v?(/quicktime/i.test(fl.type)||/\.mov$/i.test(fl.name||"")?".mov":".mp4"):".jpg";
          const url=await svMediaUp("svs_"+Date.now().toString(36)+Math.random().toString(36).slice(2,5)+ext,b,p=>{ f.busy=`上傳中… ${p}%`; const el=document.querySelector(".sv3-upm b"); if(el) el.textContent=f.busy; });
          svUKeep(); f.busy=""; if(!url){ toast("上傳失敗，網路好一點再試一次"); svUpForm(); return; } f.url=url; f.kind=v?"v":"i"; f.fp=v?{x:50,y:50,z:1}:null; try{ f.pv=URL.createObjectURL(b); }catch(e){} svUpForm(); toast("上傳完成 ✓"); }catch(er){ svUKeep(); f.busy=""; toast("這個檔案讀不出來"); svUpForm(); } }; pickClick(inp); return; }
    case "svUpDel": { const me=s&&s.demo?(svTrainee(s)||svRecMe(s)):svMyEntry(), {ph:uph,m}=svUpMs(s); if(!me||!m) return; ask("刪除這個舞台？刪除後就等於還沒交，期限內可以重新上傳。",()=>{
        if(s.demo){ const D={...(ui.svDemoSt||{})}; delete D[m.k]; ui.svDemoSt=D; ui.svU=null; layer.innerHTML=""; rr(); toast("示範：舞台刪掉了"); return; }
        mkEdit(SVST,v=>({v:(Array.isArray(v)?v:[]).map(x=>x.sid===s.id&&x.ph===uph&&x.mk===m.k&&x.tid===me.id&&!x.del?{...x,del:Date.now()}:x)})).then(()=>{ ui.svU=null; layer.innerHTML=""; rr(); toast("舞台刪掉了"); }).catch(()=>toast("沒有刪到，再按一次")); },{ok:"刪除",danger:true}); return; }
    case "svUpOk": { svUKeep(); const f=ui.svU, me=s&&s.demo?(svTrainee(s)||svRecMe(s)):svMyEntry(), {ph:uph,m}=svUpMs(s); if(!f||!me||!m) return; if(f.busy){ toast("還在上傳，等一下"); return; } if(!f.url){ toast("請放影片或照片"); return; } if(m.team&&!f.team){ toast("請填組名"); return; } if(m.pos&&!f.pos){ toast("請選位置"); return; }
      if(s.demo){ ui.svDemoSt={...(ui.svDemoSt||{}),[m.k]:{url:f.url,kind:f.kind,fp:f.fp||null,cap:f.cap,team:f.team,pos:f.pos}}; ui.svU=null; layer.innerHTML=""; rr(); toast("示範：舞台交出去了（只在你的手機）"); return; }
      const row={url:f.url,kind:f.kind,fp:f.kind==="v"?(f.fp||null):null,cap:f.cap,team:f.team,pos:f.pos,iv:f.iv||"",ts:Date.now()}, nid=uid("svs");
      mkEdit(SVST,v=>{ const L=[...(Array.isArray(v)?v:[])], i=L.findIndex(x=>x.sid===s.id&&x.ph===uph&&x.mk===m.k&&x.tid===me.id&&!x.del); if(i>=0) L[i]={...L[i],...row,ts:L[i].ts||row.ts,ets:row.ts};   /* 換表演不改「第一次交的時間」 */ else L.push({id:nid,sid:s.id,ph:uph,mk:m.k,tid:me.id,email:me.email,...row}); return {v:L}; }).then(()=>{ ui.svU=null; layer.innerHTML=""; rr(); toast("舞台交出去了"); }).catch(()=>toast("沒有送出去，再按一次")); return; }
    case "svCm": { const M=svMentors(s); tieModal("導師評語",`<select id="svCmM" class="a-nick-in">${M.map((m,i)=>`<option value="${i}">${esc(m.n)}（${esc(m.r)}）</option>`).join("")}</select><textarea id="svCmT" class="a-nick-in dbx-ta" rows="4" maxlength="200" placeholder="輸入文字" style="margin-top:8px"></textarea>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="svCmOk" data-v="${t.dataset.v}">加上去</button>`); return; }
    case "svCmOk": { const M=svMentors(s), m=M[+(document.getElementById("svCmM")||{}).value||0], tx=((document.getElementById("svCmT")||{}).value||"").trim(); if(!tx) return; S.set(SVST,(S.get(SVST,[])||[]).map(x=>x.id===t.dataset.v?{...x,cm:[...(x.cm||[]),{n:m.n,t:tx}]}:x)); layer.innerHTML=""; svStageView(t.dataset.v); toast("評語加上去了"); return; }
    case "svCast": { tieModal("主持人・導師",`<span class="fs-f-lab">主持人（國民製作人代表）</span><input id="svHn" class="a-nick-in" maxlength="20" value="${esc(svHostN(s))}"><span class="fs-f-lab" style="margin-top:10px">導師（一行一位：名字／Vocal、Dance 或 Rap）</span><textarea id="svMn" class="a-nick-in dbx-ta" rows="6">${esc(svMentors(s).map(m=>m.n+"／"+m.r).join("\n"))}</textarea>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="svCastOk">儲存</button>`); return; }
    case "svCastOk": { const hn=((document.getElementById("svHn")||{}).value||"").trim(), mn=((document.getElementById("svMn")||{}).value||"").split("\n").map(l=>l.split(/[／\/]/)).filter(x=>x[0]&&x[0].trim()).map(x=>({n:x[0].trim(),r:(x[1]||"").trim()||"導師"})); S.set(SVS,{...s,host:hn,mentors:mn}); layer.innerHTML=""; rr(); toast("已儲存"); return; }
    case "svBonusOk": { const n=Math.round(+((document.getElementById("svBn")||{}).value||0)); if(!n||!s) return; const B={...(s.bonus||{})}; B[s.ph]={...(B[s.ph]||{})}; B[s.ph][t.dataset.v]=(B[s.ph][t.dataset.v]||0)+n; S.set(SVS,{...s,bonus:B}); layer.innerHTML=""; rr(); toast("已加分"); return; }
    case "svKick": { ask("要把這位從選秀移除嗎？",()=>{ S.set(SVE,(S.get(SVE,[])||[]).map(x=>x.id===t.dataset.v?{...x,out:Date.now()}:x)); rr(); }); return; }
    case "svRevealGo": { layer.innerHTML=""; navTo("#/fan/core?p=survival"); return; }
    case "svDebutApply": { const me=svMe(s); if(!s||!me||!(s.debut||[]).includes(me.id)) return; const P=svPrep(), all=svAll(), T=id=>all.find(x=>x.id===id)||{id}, lead=svIsLeader(s)||svPrepAll(s), loc=s.demo?null:S.get(acK("daisuki_sv_dbdraft"),null);
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
/* ===== 11/24 選秀「本週節目」：像年末大賞的典禮一樣，全螢幕一段一段點下去（觀眾、練習生都有主持人帶）
   開場（主持人）→ 這週的任務 →（第一輪）1 分鐘 PR → 每一位的舞台一位一位看 → 結尾（觀眾：去 PICK／練習生：你要做的事）
   每天第一次進選秀自動播一次，之後在本週頁按「看本週節目」重看 ===== */
/* 上一個任務（這一輪的前一個；這一輪第一個就找上一輪最後一個） */
function svPrevMs(s){ const L=svMsList(s.ph), m=svMsNow(s), i=m?L.findIndex(x=>x.k===m.k):-1; if(i>0) return {ph:s.ph,m:L[i-1]}; const P={r2:"r1",pr:"r2",final:"pr"}[s.ph]; if(!P) return null; const L2=svMsList(P); return L2.length?{ph:P,m:L2[L2.length-1]}:null; }
function svShSteps(s){ const m=svMsNow(s), tr=null, st=[{t:"open"}]; if(m) st.push({t:"ms"});
  try{ const c=s.ph==="r1"?svC1(s):null; if(c&&c.win) st.push({t:"pr"}); }catch(e){}
  /* 11/24 等級評價那集：先一位一位看表演（虛擬練習生放照片）→ 導師講評、給等級。一樣套剪輯：整段播／惡剪／合集咻一下／沒鏡頭。可以跳過 */
  /* 11/24 決賽：先回顧一路走來，再一位一位介紹出道組候補，最後才是決賽舞台 */
  if(s.ph==="final"){ const fin=[...svAlive("final")]; if(fin.length){ st.push({t:"rc",k:"meet"}); if(s.grCen||s.demo) st.push({t:"rc",k:"cen"}); st.push({t:"rc",k:"r1"},{t:"rc",k:"r2"});
      fin.sort((a,b)=>svHash(s.id+"cd"+a)-svHash(s.id+"cd"+b)).forEach((id,i)=>st.push({t:"cand",id,i:i+1,n:fin.length}));
      const mi=st.findIndex(z=>z.t==="ms"); if(mi>=0) st.push(st.splice(mi,1)[0]); } }
  if(!tr&&s.ph==="r1"&&(!m||m.k==="th"||m.k==="lv")){ const G=s.demo?svGrDemo(s):s.grade||{}, ids=Object.keys(G);   /* 等級評價只在第一集播 */
    if(ids.length){ /* 11/24 照 PD 第一集：先一間公司一間公司入場（公司本身就是看點），之後也照公司順序上台評價 */
      const coOf=id=>svCoName(svById(id)||{}), cos=[...new Set(ids.map(coOf))].sort((a,b)=>(a==="個人練習生")-(b==="個人練習生")||svHash(s.id+a)-svHash(s.id+b));
      cos.forEach(co=>st.push({t:"co",co,ids:ids.filter(id=>coOf(id)===co)}));
      ids.sort((a,b)=>cos.indexOf(coOf(a))-cos.indexOf(coOf(b))||svHash(s.id+"ev"+a)-svHash(s.id+"ev"+b)); st.push({t:"evo"}); const pi=st.findIndex(z=>z.t==="pr"); if(pi>=0) st.push(st.splice(pi,1)[0]); const t1=svPhT0(s), t0=t1-SV_DUR.recruit*864e5, LV=svStages("r1","lv"), mont=[];
      ids.forEach((id,i)=>{ const t=svById(id)||{}, y=LV.find(z=>z.tid===id), fr=t.real&&!s.demo?(y&&y.ts?(y.ts>t1?.5:(y.ts-t0)/Math.max(1,t1-t0)):1):-1, r=(Math.imul(svHash(id+"ev"+s.id),2654435761)>>>16)%100;
        const ed=t.real&&!s.demo&&!y?"evil":t.real&&!s.demo?(fr>.75?"evil":fr<.4?"focus":r<70?"focus":"evil"):fr>.75?(r<70?"evil":"none"):fr>=0&&fr<.4?(r<75?"focus":"mont"):i<2?"focus":r<38?"focus":r<55?"evil":r<85?"mont":"none";   /* 11/24 真人有交就一定有鏡頭（整段／惡剪／合集），不會完全沒鏡頭 */
        if(!st.some(z=>z.t==="nx"&&z.co===coOf(id))){ if(mont.length) st.push({t:"evm",ids:mont.splice(0)}); st.push({t:"nx",co:coOf(id)}); } if(ed==="mont") mont.push(id); else if(ed!=="none") st.push({t:"ev",id,ed,lt:fr>.75,p:0},{t:"ev",id,ed,lt:fr>.75,p:1}); });
      if(mont.length) st.push({t:"evm",ids:mont.splice(0)});   /* 11/24 合集放在那間公司的評價最後，不會插在別人的表演和講評中間 */
      st.push({t:"gr"}); const mi=st.findIndex(z=>z.t==="ms"); if(mi>=0) st.push(st.splice(mi,1)[0]); } }   /* 等級評價播完才公布這週的主題曲任務 */
  /* 11/24 節目剪輯：不是每個人都有一樣的鏡頭。有人整段播（focus）、有人被惡剪（evil）、有人只在合集閃過（mont）、有人完全沒鏡頭。照季＋任務固定，大家看到的一樣 */
  /* 11/24 每一集播的是「上一個任務」大家交的舞台（剪輯過），最後才公布這週的新任務；第一集播的是等級評價 */
  const pv=svPrevMs(s), pm=pv&&pv.m;
  if(pm&&pm.k!=="lv"){ const L=svStages(pv.ph,pm.k).slice().sort((a,b)=>svHash(s.id+a.id)-svHash(s.id+b.id)), mont=[];
    const P0=((s.t0s||{})[pv.ph]||svPhT0(s)), t0=P0+pm.d[0]*864e5, t1=P0+pm.d[1]*864e5; const m=pm;
    L.forEach((x,i)=>{ const r=(Math.imul(svHash(x.tid+"ed"+s.id+m.k),2654435761)>>>16)%100, t=svById(x.tid)||{}, fr=t.real&&x.ts?(x.ts-t0)/Math.max(1,t1-t0):-1;
      let ed=fr>.75?(r<70?"evil":"none"):fr>=0&&fr<.4?(r<75?"focus":"mont"):i<2?"focus":r<38?"focus":r<58?"evil":r<82?"mont":"none"; if(t.real&&!s.demo&&(ed==="none"||ed==="mont")) ed=fr>.75?"evil":"focus";   /* 11/24 真人有交一定整段播＋後採訪，不會只在合集閃過 */
      if((s.ph==="final"||s.ph==="pr"||pv.ph==="pr")&&ed==="evil") ed="focus"; if(ed==="mont") mont.push(x.id); else if(ed!=="none") st.push({t:"stg",id:x.id,ed,lt:fr>.75&&ed==="evil",ph:pv.ph}); });   /* 決賽前後不惡剪 */
    if(mont.length){ const fi=st.findIndex(z=>z.t==="stg"), nS=st.filter(z=>z.t==="stg").length; st.splice(fi<0?st.length:fi+Math.ceil(nS/2),0,{t:"mont",ids:mont.slice(0,6),ph:pv.ph}); }   /* 合集放在舞台們的中間，不會插進候補介紹 */
    const mi=st.findIndex(z=>z.t==="ms"); if(mi>=0) st.push(st.splice(mi,1)[0]); }
  st.push({t:"end"}); return st; }
/* 這一集的首播：任務開始那天晚上六點。首播一小時內在看＝LIVE，其他時間都是重播 */
const svShLive=s=>{ if(s.demo) return true; const m=svMsNow(s); let air=svPhT0(s)+((m&&m.d[0])||0)*864e5; if(s.airAt&&s.ph==="r1"&&Math.abs(s.airAt-air)<6*36e5) air=s.airAt; return Date.now()>=air&&Date.now()<air+36e5; };
const svShOpenTx=(s,m)=>s.ph==="r1"&&m&&m.k!=="lv"&&svDayN(s)<=7?"國民製作人們，《PRODUCE DAY》開始了！練習生們，一個一個進場了。":`國民製作人們，晚上好！${m?`這週的任務是「${esc(m.t)}」。`:""}`;
const SV_MSTV={th:"等級出來了，接下來是主題曲。照班級練習，C 位是誰呢？",gb:"這週是組別對決。同一首歌，兩組對決，贏的那組每個人都加分。",po:"這週是 Position 評價。Vocal、Rap、Dance，挑自己最強的。",co:"這週是概念評價。新歌、新概念。",pr:"決賽前，一人一分鐘。這週是 1 分鐘 PR。",de:"最後的舞台。出道組，今天決定。"};
/* 11/24 入場和上台前的竊竊私語：看公司有不有名，練習生、導師的反應不一樣 */
const svCoTier=co=>/^(HYBE|SM|JYP|YG)/i.test(co)?"big":co==="個人練習生"?"solo":/BLUE HOUR/i.test(co)?"mid":"small";
const SV_WH={big:["（全場一陣騷動）「是 {co} 欸……」","「大公司來了……」","「她們一定很強吧。」","（後排有人站起來看）","「完了，是 {co}。」","「我就知道 {co} 會來。」","（有人偷偷拿手機查名字）","「她們的衣服好整齊……」","「感覺練很久了。」","「好緊張，跟她們比……」"],
  mid:["「{co}……有聽過。」","「是那個團的公司吧？」","（有人點點頭）","「{co} 的練習生不好惹喔。」","「聽說她們很會跳。」","「中間那個好漂亮……」","「{co} 這次派了幾個？」"],
  small:["「{co}？那是哪裡？」","（全場安靜了一下）","「第一次聽到……」","「好像是新公司。」","「沒關係，小公司也有很強的。」","（有人小聲問旁邊的人）","「她們看起來好緊張。」","「名字好可愛。」","「我搜不到欸……」","（前排有人回頭看）"],
  solo:["「個人練習生……好勇敢。」","「一個人來的欸。」","（大家互看了一眼）","「沒有公司也能來喔？」","「她坐哪裡啊？」","「一個人一定很辛苦。」"]};
const SV_WHM={big:["導師：「期待一下。」","導師們互看了一眼"],mid:["導師：「好，開始吧。」"],small:["導師在名單上找了一下名字","導師：「沒聽過的公司，更要好好看。」"],solo:["導師：「一個人準備很辛苦吧。」"]};
/* 11/24 一位用「她」，兩位以上用「她們」；男團換成「他」 */
const svHe=(s,t,n)=>{ t=String(t||""); if(n===1) t=t.replace(/她們/g,"她"); if(s&&s.g==="b") t=t.replace(/她/g,"他"); return t; };
function svWh(s,co,n,k){ const cnt=svAll().filter(t=>svCoName(t)===co).length, tr=svCoTier(co), L=SV_WH[tr].filter(x=>cnt>1||!/中間那個|派了幾個/.test(x)), M=SV_WHM[tr], h=svHash(s.id+co+(k||"")), out=[];
  const same=[...new Set(svAll().map(t=>svCoName(t)))].filter(c=>svCoTier(c)===tr).sort(), j=Math.max(0,same.indexOf(co)), base=(j*n*2+(k?n:0)+svHash(s.id+tr))%L.length;   /* 同一種公司輪著用，不會每間都講一樣的話 */
  for(let i=0;i<n;i++) out.push(L[(base+i)%L.length].replace("{co}",co)); if(k) out.push(M[h%M.length]);
  return `<div class="svsh-wh">${out.map(t=>`<p>${esc(svHe(s,t,cnt))}</p>`).join("")}</div>`; }
const svCoName=t=>t.co||svCoOf(t.email)||"個人練習生";
const svShMed=(y,t)=>y&&y.url?(y.kind==="v"?`<video style="${svFp(y)}" src="${esc(y.url)}" playsinline webkit-playsinline controls autoplay preload="metadata"></video>`:`<img class="svsh-img" style="${svFp(y)}" src="${esc(y.url)}" alt="">`):`<div class="svsh-nov">${svPh(t||{})}</div>`;
const SV_INT={"focus": ["老實說，我想拿 A。", "叫到我名字的時候，嚇了一跳。", "我們公司很小，所以更想被看到。", "手一直在抖……有看出來嗎？", "高音那邊有點破掉，好可惜。", "練了兩個月，就為了今天。", "媽媽應該在看吧？", "我覺得……應該有 B 吧？", "上台前一直在想動作，腦袋都白了。", "導師一直沒表情，好可怕。", "副歌那邊，我覺得還不錯。", "我很想在這裡被記住。", "鏡頭好多，我不知道要看哪裡。", "最後那個 ending，我練了好久。", "其實腳有點受傷，但我不想說。", "我想站上主題曲的 C 位。", "評語聽起來很痛，但都是對的。", "下台的時候，我才發現自己在發抖。", "我一直覺得我唱得比跳得好。", "今天的舞台，我給自己六十分。", "我不想後悔，所以全部都拿出來了。", "前面的人太強了，我有點慌。"], "evil": ["我覺得還好啊，就正常發揮。", "導師說的我不太同意。", "其他人？沒在看。", "嗯……還好吧。", "反正等級又不代表什麼。", "練習？有啊，有練。", "我本來就不太緊張。", "那個音？有破嗎？", "其他組怎樣我不知道。", "我覺得我準備得夠了。", "可能是音響的問題吧。", "嗯，下一個問題。"]};
const SV_EDLV={"focus": ["（上台前，深呼吸三次）", "導師們停下了筆", "副歌一出來，後排的練習生坐直了", "（表演結束，現場拍手）", "導師們互看了一眼", "（她的手在抖）", "高音一出來，有人摀住了嘴", "（候場時，一直在默念歌詞）", "導師點了點頭", "（結束動作，停了三秒才放下手）", "（觀眾席，有人開始跟著打拍子）", "（她看了導師一眼，又低下頭）", "Dance 導師往前坐了一點", "（表演完，她先鞠了一個很深的躬）"], "evil": ["（特寫：翻白眼）", "（別人表演時，滑頭髮）", "（被叫到名字，嘆氣）", "（看著台上，嘴角一歪）", "（導師講評時，面無表情）", "（候場時，一直照鏡子）", "音樂一下，表情就沒了", "（現場安靜）", "（別人鼓掌的時候，她沒有）", "（導師說話時，她在看指甲）", "（走上台，沒有打招呼）", "（特寫：撇嘴）"], "late": ["（候場時，在滑手機）", "（別人在暖身，她坐著）", "（最後一個走上來）", "「我準備得很充分啊。」", "（特寫：打哈欠）", "（上台前，鞋帶還沒綁好）", "（音樂下了，她才站好位置）", "（候場區，她在補妝）"]};
const SV_ED={focus:["導師：「這才叫舞台。」", "（練習室的燈，她最後一個關）", "同組成員：「她真的很拼。」", "（凌晨兩點，還在對鏡子練）", "副歌一出來，導師們互看了一眼", "導師：「好，沒什麼要說的。」", "（休息時間，她還在對動作）", "同組成員：「她幫我抓了一整晚的拍子。」", "（結束後，她一個人蹲在地上哭）", "導師：「這一週，你進步最多。」", "（她把舞步寫在手背上）", "（鏡子前，同一個動作練了二十次）", "同組成員：「有她在，我比較不怕。」", "導師：「這個表情，就對了。」"],
  evil:["導師：「這是你準備了一週的東西？」","（全場安靜）","練習時間，她在角落滑手機……","同組成員：「她都不太來練習……」","音樂一下，表情就垮了","（導師放下了筆）","導師：「你自己覺得呢？」","（同組成員互看了一眼）","同組成員：「……嗯，她有她自己的節奏吧。」","（鏡頭掃過練習室裡空著的位置）","導師翻了翻資料，沒有說話","她說，自己準備得很充分","（後排有人小聲笑了）","導師：「舞台上不會有第二次機會。」","（休息時間，她一個人坐在角落）","（特寫：隊友說話時，她翻了個白眼）","（鏡頭掃過，她一臉不耐煩）","（隊友道歉時，她冷冷地轉過頭）"],
  late:["練習時間，她在角落滑手機……","同組成員：「她都不太來練習……」","（大家已經在暖身了，她才推門進來）","練習到一半，她說要先休息一下","同組成員：「我們先練吧，不等她了。」","導師：「你這一週都在做什麼？」","（其他人還在對動作，她已經收好包包）","她打了一個大大的哈欠"]};
function svSh(){ const s=svSeason(); if(!s||!svVoting()) return; try{ S.set(acK("daisuki_sv_shw"),svShK(s)); }catch(e){} ui.svSh={i:0,st:svShSteps(s)}; svShDraw(); }
function svShDraw(){ const S0=ui.svSh, s=svSeason(); if(!S0||!s) return; const x=S0.st[S0.i], m=svMsNow(s), tr=svTrainee(s), host=t=>`<div class="aws-say"><div><small>${esc(svHostN(s))}</small><p>${t}</p></div></div>`, prog=`<div class="aws-pg"><i style="width:${Math.round(S0.i/Math.max(1,S0.st.length-1)*100)}%"></i></div>`;
  let b="";
  if(x.t==="open") b=`<div class="aws-open"><small>${SV_PH[s.ph]}・第 ${svDayN(s)} 天</small><h1><i>PRODUCE DAY</i>本週節目</h1></div>${host(svShOpenTx(s,m))}`;
  else if(x.t==="ms"){ const end=svPhT0(s)+m.d[1]*864e5; b=`<div class="aws-cat"><small>這週的任務</small><b>${esc(m.t)}</b></div>${host(SV_MSTV[m.k]||`這週練習生們要挑戰「${esc(m.t)}」，一起看看他們的表現吧！`)}`; }
  else if(x.t==="pr"){ const c=svC1(s), w=c.win||{}, y=svStages("r1","lv").find(z=>z.tid===w.id)||{};
    b=`<div class="aws-cat"><small>1 分鐘 PR</small><b>${esc(w.name||"")}</b><span class="svsh-tag">${esc(w.co||svCoOf(w.email)||"個人練習生")}</span></div><div class="aws-v">${svShMed(y,w)}</div><div class="svsh-tmr"><i></i><b id="svPrT">1:00</b></div>${w.msg?`<p class="svsh-int"><small>${esc(w.name||"")}</small>「${esc(w.msg)}」</p>`:""}${host(svHe(s,`1 號位，${esc(w.name||"")}。給她一分鐘。`))}`; }
  else if(x.t==="co"){ const L=x.ids.map(id=>svById(id)).filter(Boolean), solo=x.co==="個人練習生";
    b=`<div class="aws-cat svsh-co"><small>${solo?"INDIVIDUAL TRAINEE":"ENTERTAINMENT"}</small><b>${esc(x.co)}</b></div><div class="svsh-mont fast">${L.map(t=>`<span><i class="svsh-ph">${svPh(t)}</i><b>${esc(t.name||"")}</b></span>`).join("")}</div>${svWh(s,x.co,2)}`; }
  else if(x.t==="qt"){ const t=svById(x.id)||{}; b=`<div class="aws-cat svsh-evil"><small>⋯⋯</small><b>${esc(t.name||"")}</b></div><div class="aws-v"><div class="svsh-nov">${svPh(t)}</div></div><p class="svsh-cut ev">${esc(svHe(s,["（她的位置，空著）","（舞台上，沒有她）","（名牌被收了起來）"][svHash(x.id)%3]))}</p>${host("沒有交舞台的練習生，就沒有舞台。")}`; }
  else if(x.t==="rc"){ const fin=[...svAlive("final")], all=svAll(), T=id=>all.find(t=>t.id===id)||{}, G0=s.grade0||s.grade||(s.demo?svGrDemo(s):{}), tile=(id,tag)=>{ const t=T(id); return `<span><i class="svsh-ph">${svPh(t)}</i>${tag||""}<b>${esc(t.name||"")}</b></span>`; };
    if(x.k==="meet") b=`<div class="aws-cat"><small>回顧</small><b>第一次見面</b></div><div class="svsh-mont fast">${fin.map(id=>tile(id,G0[id]?`<em class="sv3-gr g${G0[id]}">${G0[id]}</em>`:"")).join("")}</div>${host(svHe(s,"第一次見面那天。"))}`;
    else if(x.k==="cen"){ const c=s.grCen||(s.demo?Object.keys(G0).find(id=>G0[id]==="A"):""); b=`<div class="aws-cat"><small>回顧</small><b>主題曲 C 位</b></div><div class="svsh-mont">${c?tile(c):""}</div>${host(svHe(s,`主題曲的 C 位，是練習生們一起投出來的 ${esc(T(c).name||"")}。${c&&!fin.includes(c)?"（她，已經不在這裡了）":""}`))}`; }
    else if(x.k==="r1"){ const r=svRank("r1"), k1=(s.keep||{}).r1||[]; b=`<div class="aws-cat"><small>回顧</small><b>第一次排名發表</b></div><div class="svsh-mont">${r.slice(0,3).map((id,i)=>tile(id,`<em class="svsh-rk">${i+1}</em>`)).join("")}</div>${host(`第一次排名發表，1 位是 ${esc(T(r[0]).name||"")}。${k1.length?`那天，${k1.length} 位練習生留了下來。`:""}`)}`; }
    else b=`<div class="aws-cat"><small>回顧</small><b>第二次排名發表</b></div><div class="svsh-mont fast">${fin.map(id=>tile(id)).join("")}</div>${host(`剩下 ${fin.length} 位。今天，出道組決定。`)}`; }
  else if(x.t==="cand"){ const t=svById(x.id)||{}, G0=s.grade0||s.grade||(s.demo?svGrDemo(s):{}), g0=G0[x.id], r1=((s.rk||{}).r1||svRank("r1")).indexOf(x.id)+1, sp=(t.sp||{}).r2||(t.real?t.msg:"")||svPk(S0,"itf",SV_INT.focus,x.id+"cd");
    b=`<div class="aws-cat"><small>出道組候補 ${x.i}／${x.n}</small><b>${esc(t.name||"")}</b><span class="svsh-tag">${esc(svCoName(t))}</span></div><div class="aws-v"><div class="svsh-nov">${svPh(t)}</div></div><div class="svsh-path">${g0?`<span>等級評價<b>${g0}</b></span>`:""}${r1?`<span>第一次排名<b>${r1} 位</b></span>`:""}<span>決賽<b>?</b></span></div><p class="svsh-int"><small>後採訪</small>「${esc(sp)}」</p>`; }
  else if(x.t==="nx") b=`<div class="aws-cat svsh-co"><small>NEXT</small><b>${esc(x.co)}</b></div>${svWh(s,x.co,2,"ev")}`;
  else if(x.t==="evo") b=`<div class="aws-cat"><small>EPISODE 1</small><b>等級評價</b></div><p class="svsh-how">${[...svAlive("r1")].length} 位練習生，全部入座。</p>${host("我是國民製作人代表。出道，由國民製作人決定。第一個任務，等級評價。")}`;
  else if(x.t==="ev"){ const t=svById(x.id)||{}, y=svStages("r1","lv").find(z=>z.tid===x.id)||{}, g=svGrade(t)||((s.demo?svGrDemo(s):s.grade||{})[x.id]), cm=svGrCm(s,t), ev=x.ed==="evil";
    if(!x.p){ const EP=ev&&x.lt&&svHash(x.id+"lt")%100<75?SV_EDLV.late:(SV_EDLV[x.ed]||SV_EDLV.focus), ec=svPk(S0,"ec"+(EP===SV_EDLV.late?"l":ev?"e":"f"),EP,s.id+x.id+"c"), it=y.iv?y.iv:t.real&&t.msg&&!ev?t.msg:svPk(S0,"it"+(ev?"e":"f"),SV_INT[ev?"evil":"focus"],x.id+"it");
      b=`<div class="aws-cat ${ev?"svsh-evil":""}"><small>${ev?"⋯⋯":"等級評價"}</small><b>${esc(t.name||"")}</b><span class="svsh-tag">${esc(t.co||svCoOf(t.email)||"個人練習生")}</span></div><div class="aws-v">${svShMed(y,t)}</div><p class="svsh-cut ${ev?"ev":""}">${esc(svHe(s,ec))}</p><p class="svsh-int"><small>後採訪</small>「${esc(it)}」</p><button class="svsh-skip" data-a="svShSkip">跳過，直接看等級結果 ›</button>`; }
    else b=`<div class="aws-cat"><small>${esc(cm.n)}</small><b>${esc(t.name||"")}</b></div><p class="svsh-crit">「${esc(cm.t)}」</p><div class="svsh-stamp g${g}"><i>${g}</i><small>${g} 班</small></div>`; }
  else if(x.t==="evm") b=`<div class="aws-cat"><small>等級評價</small><b>還有這些練習生</b></div><div class="svsh-mont fast">${x.ids.map(id=>{ const t=svById(id)||{}, g=svGrade(t)||((s.demo?svGrDemo(s):s.grade||{})[id]); return `<span><i class="svsh-ph">${svPh(t)}</i><em class="sv3-gr g${g}">${g}</em><b>${esc(t.name||"")}</b></span>`; }).join("")}</div>`;
  else if(x.t==="stg"){ const y=svStages(x.ph||s.ph).find(z=>z.id===x.id)||{}, t=svById(y.tid)||{}, lv=m&&svMyLv()[s.id+m.k], idx=S0.st.filter(z=>z.t==="stg").findIndex(z=>z.id===x.id)+1, tot=S0.st.filter(z=>z.t==="stg").length;
    const EP=x.ed==="evil"&&x.lt&&svHash(y.id+"lt")%100<75?SV_ED.late:(SV_ED[x.ed]||SV_ED.focus), ec=svPk(S0,"sc"+(EP===SV_ED.late?"l":x.ed),EP,s.id+y.id+"c");
    b=`<div class="aws-cat ${x.ed==="evil"?"svsh-evil":""}"><small>${x.ed==="evil"?"⋯⋯":"STAGE "+idx}</small><b>${esc(t.name||"")}</b>${y.team||y.pos?`<span class="svsh-tag">${esc(y.team||y.pos)}</span>`:""}</div><div class="aws-v">${svShMed(y,t)}</div><p class="svsh-cut ${x.ed==="evil"?"ev":""}">${esc(svHe(s,ec))}</p>${y.cap&&x.ed!=="evil"?`<p class="svsh-how">${esc(y.cap)}</p>`:""}${(()=>{ const ev=x.ed==="evil", P=SV_INT[ev?"evil":"focus"], it=y.iv||(t.real?"":svPk(S0,"it"+(ev?"e":"f"),P,y.id+"it")); return it?`<p class="svsh-int"><small>後採訪</small>「${esc(it)}」</p>`:""; })()}${tr||!svVoting()||(x.ph&&(x.ph!==s.ph||y.mk!==(m&&m.k)))||!svLvOpen(s,y.mk).ok?"":`<button class="aws-btn ${lv?"off":""}" data-a="svLv" data-v="${y.id}" ${lv?"disabled":""}>${lv===y.id?"♥ 投了這個舞台":lv?"這個任務投過現場票了":"♥ 投現場票"}</button>`}`; }
  else if(x.t==="gr"){ const G=s.demo?svGrDemo(s):s.grade||{}, all=svAll(), A=Object.keys(G).filter(id=>G[id]==="A").map(id=>all.find(t=>t.id===id)).filter(Boolean);
    b=`<div class="aws-cat"><small>等級評價結果</small><b>A 班 ${A.length} 位</b></div><div class="svsh-mont">${A.slice(0,6).map(t=>`<span><i class="svsh-ph">${svPh(t)}</i><em class="sv3-gr gA">A</em><b>${esc(t.name||"")}</b></span>`).join("")}</div>${host(`A 班，${A.length} 位。主題曲的分量最多。其他班，還有重新評價的機會。`)}<button class="aws-btn" data-a="svShGr">看全部等級和評語</button>`; }
  else if(x.t==="mont"){ const L=x.ids.map(id=>svStages(x.ph||s.ph).find(z=>z.id===id)).filter(Boolean);
    b=`<div class="aws-cat"><small>其他練習生的舞台</small><b>還有這些練習生</b></div><div class="svsh-mont">${L.map(y=>{ const t=svById(y.tid)||{}; return `<button data-a="svStage" data-v="${y.id}"><i class="svsh-ph">${svPh(t)}</i><b>${esc(t.name||"")}</b></button>`; }).join("")}</div>${host("還有這些練習生，也站上了舞台。")}`; }
  else if(x.t==="end"){ const L=svLeft(); b=`<div class="aws-open"><small>${SV_PH[s.ph]}</small><h1><i>SEE YOU</i>NEXT EPISODE</h1></div>${tr?host("練習生們，這週也辛苦了！別忘了在期限前交舞台，排名發表見。")+`<button class="aws-btn" data-a="svShX">回選秀</button>`:host(L?`國民製作人，今天還有 ${L} 票！快去選出你的練習生吧。`:"今天的票都投完了，明天見！")+`<button class="aws-btn" data-a="svShGo">${svFanNext(s)==="st"?"看舞台・投現場票":L?"去 PICK":"看排名"}</button>`}`; }
  clearInterval(ui.svPrI); if(x.t==="pr"){ const T0=Date.now(); ui.svPrI=setInterval(()=>{ const el=document.getElementById("svPrT"), left=Math.max(0,60-Math.floor((Date.now()-T0)/1000)); if(!el||!ui.svSh||ui.svSh.st[ui.svSh.i]!==x){ clearInterval(ui.svPrI); return; } el.textContent=left>=60?"1:00":`0:${String(left).padStart(2,"0")}`; const bar=el.previousElementSibling; if(bar) bar.style.width=(100-left/60*100)+"%"; if(!left){ clearInterval(ui.svPrI); ui.svSh.i++; svShDraw(); } },500); }
  setLayer(`<div class="aws svsh aw-c-${svTheme()==="g"?"svg":"svb"} ${(x.ed==="evil"&&!(x.t==="ev"&&x.p))||x.t==="qt"?"evil":""}" data-a="svShN"><div class="aws-beams"><i></i><i></i><i></i></div><div class="svsh-rib"><b>PRODUCE DAY</b><span>${esc(SV_PH[s.ph]||"")}・第 ${svDayN(s)} 天</span>${svShLive(s)?`<em class="live">● LIVE</em>`:`<em>重播</em>`}</div><button class="svsh-x" data-a="svShX" aria-label="關閉">${I.x||"✕"}</button><div class="aws-in">${b}</div>${x.t!=="end"?`<p class="aws-tap">點一下繼續</p>`:""}</div>`); svShSub(); }
/* 電視字幕：旁白／惡剪字幕、後採訪直接疊在畫面上，依序淡入 */
const svShSub=()=>{ const v=document.querySelector(".aws.svsh .aws-v"); if(!v) return; const L=[...document.querySelectorAll(".aws.svsh .svsh-cut,.aws.svsh .svsh-int")]; if(!L.length) return;
  const w=document.createElement("div"); w.className="svsh-tv"; const nm=(document.querySelector(".aws.svsh .aws-cat b")||{}).textContent||"", co=(document.querySelector(".aws.svsh .aws-cat .svsh-tag")||{}).textContent||""; L.forEach((p,i)=>{ const sm=p.querySelector("small"); if(sm&&nm) sm.innerHTML=`<i>${esc(co)}</i>${esc(nm)}`; if(p.classList.contains("svsh-cut")) p.textContent=p.textContent.replace(/^（(.*)）$/,"$1"); p.style.animationDelay=(.5+i*1.8)+"s"; w.appendChild(p); }); v.appendChild(w); v.classList.add("svsub"); if(v.querySelector("video")) v.classList.add("svvid"); };
document.addEventListener("click",e=>{ const t0=e.target.closest&&e.target.closest("[data-a]"); if(!t0||!/^svSh/.test(t0.dataset.a)) return; const t=t0, a=t.dataset.a; e.stopImmediatePropagation();   /* 裡面的其他按鈕（投現場票、交舞台）交給原本的處理 */
  if(a==="svSh"){ svSh(); return; }
  if(a==="svShSkip"){ const S0=ui.svSh; if(!S0) return; const k=S0.st.findIndex(z=>z.t==="gr"); if(k>0){ S0.i=k; svShDraw(); } return; }
  if(a==="svShGr"){ ui.svSh=null; layer.innerHTML=""; navTo("#/fan/core?p=survival&v=gr"); return; }
  if(a==="svShX"){ ui.svSh=null; layer.innerHTML=""; return; }
  if(a==="svShGo"){ ui.svSh=null; layer.innerHTML=""; const nx=svFanNext(svSeason()); navTo((route().role==="artist"?"#/artist?tab=foc&p=survival":"#/fan/core?p=survival")+"&v="+(nx==="st"?"st":svLeft()?"pick":"rk")); return; }
  if(a==="svShN"){ if(e.target.closest("video,.aws-v")) return; const S0=ui.svSh; if(!S0) return; if(S0.i<S0.st.length-1){ S0.i++; svShDraw(); } return; }
},true);

window.addEventListener("hashchange",()=>{ if(ui.svSh){ ui.svSh=null; layer.innerHTML=""; } });
addEventListener("hashchange",()=>{ if(!/p=survival/.test(location.hash)) ui.svShIn=0; });   /* 離開選秀主頁再回來，就再開播一次 */
addEventListener("popstate",e=>{ if(ui.svSh&&!(e.state&&e.state.svsh)){ ui.svSh=null; layer.innerHTML=""; } });   /* 節目中按返回＝關掉節目回到選秀頁 */

/* 11/24 管理員的 App 開著就會準時開播（不用等換頁） */
setInterval(()=>{ try{ if(!isAdminAcct()||document.hidden) return; const s=svReal(); if(s&&s.end&&s.ph!=="done"&&Date.now()>=s.end){ const b=JSON.stringify(s); svTick(); const a2=svReal(); if(a2&&JSON.stringify(a2)!==b&&a2.ph!==s.ph&&!document.querySelector(".sb-moving")) render(); } }catch(e){} },15000);   /* 只有真的換階段才重畫，不會在滑動時一直重畫 */

/* 交舞台：影片取景（拖曳＝移動，滑桿＝放大） */
(function(){ let d=null; const ap=()=>{ const f=ui.svU, v=document.querySelector("#svFr video"); if(f&&v) v.setAttribute("style",svFp(f)); };
  document.addEventListener("pointerdown",e=>{ const fr=e.target.closest&&e.target.closest("#svFr"); if(!fr||!ui.svU) return; if(!ui.svU.fp) ui.svU.fp={x:50,y:50,z:1}; d={x:e.clientX,y:e.clientY,p:{...ui.svU.fp},w:fr.clientWidth,h:fr.clientHeight}; try{ fr.setPointerCapture(e.pointerId); }catch(er){} e.preventDefault(); });
  document.addEventListener("pointermove",e=>{ if(!d||!ui.svU) return; const k=1/Math.max(1,d.p.z); ui.svU.fp.x=Math.max(0,Math.min(100,d.p.x-(e.clientX-d.x)/d.w*100*k)); ui.svU.fp.y=Math.max(0,Math.min(100,d.p.y-(e.clientY-d.y)/d.h*100*k)); ap(); });
  addEventListener("pointerup",()=>{ d=null; }); addEventListener("pointercancel",()=>{ d=null; });
  document.addEventListener("input",e=>{ if(e.target&&e.target.id==="svFz"&&ui.svU){ if(!ui.svU.fp) ui.svU.fp={x:50,y:50,z:1}; ui.svU.fp.z=+e.target.value; ap(); } });
})();
