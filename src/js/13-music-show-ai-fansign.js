/* HAECHU｜打歌、翻譯、簽售、開播音樂 */
/* =========================================================
   音樂節目（打歌）：照群組規則
   ・五個節目：THE SHOW（二）、Show Champion（三）、M COUNTDOWN（四）、MUSIC BANK（五）、INKIGAYO（日）
   ・每月：第一週＝宣傳週（不排名、不投票）、中間＝排名週、最後一週＝打歌週（月底決戰）
     → 一週算在「週一」所在的月份；管理員也可以在 FOC 手動改本週階段
   ・排名週、打歌週開放投票；粉絲應援方式：SHOP 買專輯、MV 按愛心、投票
   ・一位得主由管理員在 FOC 公布
   ・同一首歌在同一個節目連續三週一位＝三冠王，之後不再列入那個節目的一位候選
   ・積分：一位 +3000／5台冠軍（同一首歌拿過五個節目的一位）+5000／
          AK（同一週五個節目全拿）+10000／PAK（連續 4 個排名週都有一位，宣傳週不算中斷）+15000
   ・MC：每月輪替，主持一個節目每週 +1,000（照積分表 MC 一次 +1,000）
   ========================================================= */
const SHOWS=[{id:"ts",name:"THE SHOW",day:2},{id:"sc",name:"Show Champion",day:3},{id:"mcd",name:"M COUNTDOWN",day:4},{id:"mb",name:"MUSIC BANK",day:5},{id:"ink",name:"INKIGAYO",day:0}];
const WDAY=["日","一","二","三","四","五","六"];
/* ===== 打歌：全群同一個月曆（每月第一週宣傳、中間排名、最後一週打歌）＋虛擬對手 =====
   ・新歌 MV 一公開就加入打歌，打滿 4 週（28 天）自動下檔；同一團有新歌（回歸）時，舊歌直接下檔換新的
   ・同一個節目的參賽歌不到 3 首：自動補虛擬對手，分數要超過它們才拿得到一位，一個人也不會白拿 */
const MSA={PROMO:0,END:28,MIN:3}, MDAY=864e5;
function songRel(s){ if(!s) return 0; if(s.rel) return s.rel; const m=/^s(\d{12,13})$/.exec(String(s.id)); return m?+m[1]:0; }
function songPhase(s,at){ if(!s||s.demo) return "act"; const r=songRel(s); if(!r) return "act"; const d=((at||Date.now())-r)/MDAY; return d<0?"pre":d<MSA.PROMO?"promo":d<MSA.END?"act":"end"; }
const songWeekNo=(s,at)=>{ const r=songRel(s); return r?Math.floor(((at||Date.now())-r)/MDAY/7)+1:0; };
const songActIn=(s,show,wk)=>songPhase(s,showEndTs(show,wk))==="act";
const NPC_SONGS=[["AURAVEIL","Glass Garden"],["ODDLINE","Midnight Bus"],["PRISMA9","Sugar Rush"],["KIRAZ","Moonwalk"],["MELLOWMOON","Paper Hearts"],["NOVELLE","Blue Signal"],["ROSÉVA","Last Train"],["HYUNE","Daydream"]];
/* 虛擬對手：分數照這週已經過了多少慢慢長上去，節目播出時到最終分數 */
function npcRivals(show,wk){ wk=wk||curWeek(); const n=showRank(show,wk).length; if(!n||n>=MSA.MIN) return [];
  const h=strHash(wk+"|"+show), start=wkDate(wk).getTime(), end=showEndTs(show,wk), prog=Math.max(0,Math.min(1,(Date.now()-start)/Math.max(1,end-start)));
  /* 虛擬歌手的分數跟著真的歌走（社群人數少，分數不能高到追不上）：預估本週真歌的最高分，虛擬歌手落在它的 55%～125% */
  const R=showRank(show,wk), cur=Math.max(0,...R.map(x=>(x.sc&&x.sc.total)||0)), proj=Math.max(300,cur/Math.max(.25,prog));
  return Array.from({length:MSA.MIN-n},(_,k)=>{ const [g,t]=NPC_SONGS[(h+k*3)%NPC_SONGS.length], r=((h>>>(k*4+1))%1000)/1000, fin=proj*(.55+.7*r); return {npc:1,name:g,title:t,total:Math.round(fin*(.12+.88*prog))}; }).sort((a,b)=>b.total-a.total); }
const npcTop=(show,wk)=>npcRivals(show,wk)[0]||null;
const npcWon=(show,wk)=>((getMShow().npcWin||{})[wk||curWeek()]||{})[show]||null;
const MSP={win:3000,five:5000,ak:10000,pak:15000};
function wkDate(wk){ const [y,m,d]=wk.split("-").map(Number); return new Date(y,m-1,d); }
function weekKey(ts){ const d=new Date(ts); d.setHours(0,0,0,0); d.setDate(d.getDate()-((d.getDay()+6)%7)); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
const curWeek=()=>weekKey(Date.now());
const shiftWeek=(wk,n)=>{ const d=wkDate(wk); d.setDate(d.getDate()+7*n); return weekKey(d.getTime()); };
const monthKey=ts=>{ const d=new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth()+1)}`; };
function autoWeekType(wk){ const d=wkDate(wk||curWeek()), th=new Date(d); th.setDate(th.getDate()+3); const nx=new Date(th); nx.setDate(nx.getDate()+7);   /* 一週算在它的星期四那個月 */
  if(nx.getMonth()!==th.getMonth()) return "打歌週"; if(th.getDate()<=7) return "宣傳週"; return "排名週"; }
const parseType=s=>/宣傳/.test(s)?"宣傳週":/打歌/.test(s)?"打歌週":/排名/.test(s)?"排名週":null;
const getMShow=()=>({songs:[],ended:[],wins:{},wtype:{},mc:{},...S.get(K.mshow,{})});
function weekType(wk){ wk=wk||curWeek(); if(wk===curWeek()) return parseType(getSched().stage)||autoWeekType(wk); return getMShow().wtype[wk]||autoWeekType(wk); }
const ranked=wk=>weekType(wk)!=="宣傳週";
const songOf=id=>{ if(String(id).startsWith("demo_")) return MUS_DEMO().find(s=>s.id===id); const m=getMShow(); return m.songs.find(s=>s.id===id)||(m.ended||[]).find(s=>s.id===id); };
/* 示範（只有 HUSSEY 的粉絲身分看得到）：沒有打歌中的歌時，放 3 首示範歌，投票只記在這支手機的這次打開，不存、不上雲端 */
const musDemo=()=>{ try{ if(ui.tourDemo) return true; const s=session(); if(s&&s.role==="artist") return typeof demoOn==="function"&&demoOn(); if(!s||s.role!=="fan") return false; const a=ACCOUNTS[s.email]||{}, m=MEMBERS[a.member||s.home||""], g=m&&groupOf(m.group), U=x=>String(x||"").toUpperCase()==="HUSSEY"; return U(a.name)||U(m&&m.name)||!!(g&&U(g.name)); }catch(e){ return false; } };
const mvSongTitle=gid=>{ const mv=(S.get(K.vods,[])||[]).filter(v=>v.gid===gid&&typeof vodIsMV==="function"&&vodIsMV(v)).sort((a,b)=>(b.ts||0)-(a.ts||0))[0]; return mv?mvTitleOf(mv.title):""; };
const grpKnownSong=gid=>{ try{ const ms=getMShow(), e=[...(ms.ended||[])].filter(x=>x.gid===gid).sort((a,b)=>(b.endTs||0)-(a.endTs||0))[0]; if(e) return e.title; const c=(typeof getCbr==="function"?getCbr():[]).filter(x=>x.gid===gid&&x.status==="ok"&&x.day<=Date.now()).sort((a,b)=>b.day-a.day)[0]; if(c) return c.title; const d=getDebut().find(x=>x.gid===gid&&x.song); return d?d.song:""; }catch(e){ return ""; } };
/* 示範：只放自己的團（歌名用最新一支 MV），其他名次由虛擬歌手補上 */
const MUS_DEMO=()=>{ if(!musDemo()||getMShow().songs.length) return []; const s=session()||{}, a=ACCOUNTS[s.email]||{}, mid=s.member||a.member||s.home||"", own=MEMBERS[mid]?MEMBERS[mid].group:"", g=groupOf(own)||GROUPS.find(x=>x.id!=="tdm_g")||GROUPS[0]; return g?[{id:"demo_"+g.id,gid:g.id,title:mvSongTitle(g.id)||grpKnownSong(g.id)||"出道曲",demo:1}]:[]; };
const musDemoOn=()=>MUS_DEMO().length>0;
const songName=s=>s?`${groupOf(s.gid)?groupOf(s.gid).name:""}《${s.title}》`:"";
/* 三冠王：這首歌在這個節目、在 wk 之前已經連續三週一位 */
function crowned(sid,show,wk){ const w=getMShow().wins, ks=Object.keys(w).sort(); if(!ks.length||ks[0]>=wk) return false;
  let k=ks[0], run=0;
  while(k<wk){ if((w[k]||{})[show]===sid){ if(++run>=3) return true; } else if(ranked(k)) run=0; k=shiftWeek(k,1); }
  return false; }
/* 這首歌的戰績與積分 */
function songStats(sid){
  const w=getMShow().wins, weeks=Object.keys(w).sort(), wins=[], shows=new Set(), aks=[];
  weeks.forEach(k=>{ const ws=w[k]||{}; let n=0; SHOWS.forEach(s=>{ if(ws[s.id]===sid){ wins.push({wk:k,show:s.id}); shows.add(s.id); n++; } }); if(n===SHOWS.length) aks.push(k); });
  // PAK：連續 4 個排名週（宣傳週略過）都至少拿到一個一位
  let run=0, pak=null; if(weeks.length){ let k=weeks[0]; const end=weeks[weeks.length-1];
    while(k<=end){ const has=SHOWS.some(s=>(w[k]||{})[s.id]===sid); if(has){ run++; if(run>=4&&!pak) pak=k; } else if(ranked(k)) run=0; k=shiftWeek(k,1); } }
  const crowns=SHOWS.filter(s=>crowned(sid,s.id,shiftWeek(curWeek(),1))).map(s=>s.id);
  const five=shows.size>=SHOWS.length;
  const pts=wins.length*MSP.win+(five?MSP.five:0)+aks.length*MSP.ak+(pak?MSP.pak:0);
  return {wins,shows,aks,pak,five,crowns,pts};
}
function groupMusicPts(gid,{year=null}={}){ const m=getMShow(); return [...m.songs,...(m.ended||[])].filter(s=>s.gid===gid).reduce((n,s)=>{ const st=songStats(s.id); if(year==null) return n+st.pts;
  return n+st.wins.filter(x=>x.wk.startsWith(year)).length*MSP.win+(st.five?MSP.five:0)+st.aks.filter(k=>k.startsWith(year)).length*MSP.ak+(st.pak&&st.pak.startsWith(year)?MSP.pak:0); },0); }
function mcShows(mid,mon){ const m=getMShow().mc[mon||monthKey(Date.now())]||{}; return SHOWS.filter(s=>(m[s.id]||[]).includes(mid)); }
const mcWeekly=n=>n*1000; /* 積分表：MC 一次 +1,000（一週主持幾個節目就幾次） */
/* 粉絲應援：投票（排名週／打歌週，每個節目每天 1 票）、MV 愛心、專輯 */
   // 只算真的票

const myVoteKey=show=>new Date().toDateString()+":"+show;
const votedToday=show=>!!S.get(K.msMine,{})[myVoteKey(show)];
const mvLikes=gid=>(S.get(K.mvLike,{})[gid]?1:0);

const albumSales=(gid,since=0)=>S.get(K.sales,[]).filter(x=>x.type==="merch"&&x.gid===gid&&x.ts>=since&&/專輯/.test(x.label)).length;

const MUSIC_RULES=()=>`<div style="text-align:left">• 節目：${SHOWS.map(s=>s.name).join("、")}<br>• 每月第一週是宣傳週（不排名），中間是排名週，最後一週是打歌週（月底決戰）<br>• 排名週、打歌週開放投票；買專輯、幫 MV 按愛心、投票都能幫藝人<br>• 同一首歌在同一個節目連續三週一位＝三冠王，之後不再列入那個節目的一位候選<br>• 一位 +3,000／5台冠軍 +5,000／AK（同一週五台全拿）+10,000／PAK（連續 4 個排名週都有一位）+15,000</div>`;
/* 粉絲：CORE 打歌戰場頁 */


/* 打歌：像排行榜一樣一首一列，點了再從下面拉出應援選單（買專輯、MV 愛心、投票、My Pick） */
/* 專輯封面（出道／回歸／補出道資料裡上傳的）：有歌名就找那一張，沒有就用最新一張 */
function albCov(gid,title){ try{ const L=promoSrcs(true).filter(s=>s.gid===gid&&s.pr&&s.pr.cov).sort((a,b)=>b.day-a.day); const t=String(title||"").trim().toLowerCase(), hit=t&&L.find(s=>String(s.title||"").trim().toLowerCase()===t||String((s.pr||{}).t2||"").trim().toLowerCase()===t); return ((t?hit:L[0])||{pr:{}}).pr.cov||""; }catch(e){ return ""; } }
const songCover=(gid,title)=>{ const own=title&&albCov(gid,title); if(own) return `<img src="${esc(own)}" alt="">`; const a=getAlbums().find(x=>x.gid===gid), c=(a&&a.vers[0]&&PCI[`vc|${a.id}|${a.vers[0].id}`])||albCov(gid), g=groupOf(gid); return c?`<img src="${c}" alt="">`:`<i style="background:${grad(g?g.g:0)}">${esc(g?ini(g.name):"")}</i>`; };


function openVote(sid){
  const s=songOf(sid); if(!s) return; const dm=!!s.demo; if(!dm&&!ranked(curWeek())){ toast("宣傳週不開放投票"); return; }
  const wk=curWeek();
  tieModal("投票給"+songName(s),`<p class="mu-vp">每個節目每天可以投 1 票</p><div class="mu-vl">${SHOWS.map(x=>{ const done=dm?!!(ui.dmMine||{})[myVoteKey(x.id)]:votedToday(x.id), cr=crowned(sid,x.id,wk), won=(getMShow().wins[wk]||{})[x.id];
    return `<button class="mu-vb ${done?"done":""}" data-a="muVoteGo" data-v="${sid}" data-s="${x.id}" ${done||cr||won?"disabled":""}><b>${x.name}</b><small>${cr?"已是三冠王":won?"本週已公布":done?"今天投過了":"投 1 票"}</small></button>`; }).join("")}</div>`,`<button class="t-mbtn" data-a="tCloseLayer">關閉</button>`);
}
/* 管理員：FOC 的音樂節目管理 */

function muNotify(text,gid){ const list=S.get(K.notifs,[]); list.unshift({id:"n"+Date.now()+Math.random().toString(36).slice(2,5),kind:"core",direct:true,group:gid,text,ts:Date.now()}); S.set(K.notifs,list.slice(0,100)); if(!gid||followed().includes(gid)) S.set(K.unread,"1"); }
function setWinner(show,sid,wk0,manual){
  const ms=getMShow(), wk=wk0||ui.muWk||curWeek(); const before=sid?songStats(sid):null; if(manual){ ms.manual={...(ms.manual||{})}; ms.manual[wk]={...(ms.manual[wk]||{}),[show]:1}; }   /* 管理員手動改過：自動結算不再動它 */
  ms.wins[wk]={...(ms.wins[wk]||{})}; if(sid) ms.wins[wk][show]=sid; else delete ms.wins[wk][show]; ms.wtype[wk]=weekType(wk); S.set(K.mshow,ms);
  if(!sid) return; const s=songOf(sid), sh=SHOWS.find(x=>x.id===show), after=songStats(sid);
  muNotify(`🏆 ${sh.name} 一位：${songName(s)}！`,s.gid);
  if(!before.five&&after.five) muNotify(`✨ ${songName(s)} 拿下 5台冠軍！`,s.gid);
  if(after.aks.length>before.aks.length) muNotify(`👑 ${songName(s)} ALL-KILL！五個節目全拿！`,s.gid);
  if(!before.pak&&after.pak) muNotify(`💎 ${songName(s)} 達成 PAK！`,s.gid);
  if(after.crowns.length>before.crowns.length) muNotify(`👑 ${songName(s)} 成為 ${sh.name} 三冠王`,s.gid);
}

/* 翻譯用的 Claude 連線（AI 粉絲 11/11 整段刪掉，只留翻譯會用到的這幾行） */
let SAMPLE=null, aiOff=false;
(async()=>{ try{ if(window.claude&&claude.use){ SAMPLE=await claude.use("sample"); if(SAMPLE) render(); } }catch(e){} })();
const aiClean=t=>String(t||"").replace(/\s+/g," ").trim().slice(0,200);
/* 藝人端：粉絲的留言、TIE 不是中文的，打開時一次翻成中文（存在 zh；中文的不翻） */
const isZhText=t=>{ const x=String(t||"").replace(/@@@/g,""); if(/[\u3040-\u30ff\uAC00-\uD7A3]/.test(x)) return false; const han=(x.match(/\p{Script=Han}/gu)||[]).length, oth=(x.match(/\p{L}/gu)||[]).length-han; return han>0?han>=oth:oth===0; };
const trAsked=new Set();
async function aiTranslateFor(mid){
  if(!useDeepL()&&(!SAMPLE||aiOff)) return; const ids=new Set(getPosts().filter(p=>p.member===mid).map(p=>p.id));
  const ws=getWhispers().filter(w=>w.member===mid&&w.from!=="artist"&&!w.zh&&!w.kind&&!trAsked.has(w.id)&&!isZhText(w.text)).slice(-20).map(w=>({id:w.id,text:w.text}));
  const cs=S.get(K.comments,[]).filter(c=>ids.has(c.postId)&&!c.zh&&!trAsked.has(c.id)&&!isZhText(c.text)).slice(-20).map(c=>({id:c.id,text:c.text}));
  const items=[...ws,...cs]; if(!items.length) return; items.forEach(x=>trAsked.add(x.id));
  const out=await translateMany(items.map(x=>x.text),"zh"); if(!out) return;
  const map={}; items.forEach((x,k)=>{ if(out[k]) map[x.id]=aiClean(out[k]); }); if(!Object.keys(map).length) return;
  const W=S.get(K.whispers,[]); W.forEach(w=>{ if(map[w.id]) w.zh=map[w.id]; }); S.set(K.whispers,W);
  const C=S.get(K.comments,[]); C.forEach(c=>{ if(map[c.id]) c.zh=map[c.id]; }); S.set(K.comments,C);
  const typing=document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName); if(!typing&&!layer.innerHTML){ const y=window.scrollY; render(); window.scrollTo(0,y); }
}
/* TIE 翻譯（照 Bubble）：藝人訊息顯示原文（韓文），粉絲按 A 看翻譯
   ・藝人打中文 → 自動產生韓文原文；藝人打韓文 → 自動產生中文翻譯
   ・粉絲可以選翻譯成 中文(繁體)／English／日本語 */
const TR_LANGS={zh:"中文(繁體)",en:"English",ja:"日本語"};
const DL_CODE={zh:"ZH-HANT",en:"EN-US",ja:"JA",ko:"KO"};
/* 翻譯服務：有設定 DeepL 中繼站（搬到自己的網站後）就用 DeepL；在 claude.ai 裡或沒設定時用 Claude */
const trCfg=()=>({url:"",...S.get(K.trCfg,{})});
const useDeepL=()=>HB_ON?!!HB.tok:!!trCfg().url;   // 正式網站：用 Supabase 裡的 DeepL（key 放在後台）
const trEngine=()=>useDeepL()?"DeepL":"Claude";
const xmlEsc=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").split("@@@").join("<x>@@@</x>");
const xmlUn=t=>String(t).replace(/<x>@@@<\/x>/g,"@@@").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
async function deeplTr(texts,lang){
  let d;
  if(HB_ON) d=await hbFetch("/functions/v1/deepl",{method:"POST",body:{text:texts.map(xmlEsc),target_lang:DL_CODE[lang]}});
  else { const r=await fetch(trCfg().url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:texts.map(xmlEsc),target_lang:DL_CODE[lang]})}); if(!r.ok) throw new Error("deepl "+r.status); d=await r.json(); } return (d.translations||[]).map(x=>xmlUn(x.text||""));
}
async function claudeTr(texts,lang,style){
  if(!SAMPLE||aiOff) return null;
  const name={zh:"台灣繁體中文",en:"English",ja:"日本語",ko:"韓文"}[lang];
  try{ const r=await SAMPLE.json(`${style||"把下面的訊息翻成自然的"+name}。保留表情符號，@@@ 原樣保留不要翻。照順序只回 JSON：{"t":["…"]}\n\n${JSON.stringify(texts)}`,{modelTier:"quick"}); return Array.isArray(r&&r.t)?r.t.map(aiClean):null; }
  catch(e){ if(["not_granted","sampling_disabled","not_declared","capability_disabled","capability_removed"].includes(e&&e.code)) aiOff=true; return null; }
}
/* 把一批句子翻成 lang（zh／en／ja／ko），回傳同樣順序的陣列；失敗回傳 null */
async function translateMany(texts,lang,style){
  if(!texts.length) return [];
  if(useDeepL()){ try{ const out=await deeplTr(texts,lang); if(out.length===texts.length) return out; }catch(e){} }
  return await claudeTr(texts,lang,style);
}
/* 韓文判斷：連 ㅋㅋ、ㅠㅠ 這種字母也算；韓文字比漢字多就當韓文 */
const hasHangul=t=>{ const x=String(t), h=(x.match(/[ᄀ-ᇿㄱ-ㆎ가-힣]/g)||[]).length, han=(x.match(/\p{Script=Han}/gu)||[]).length; return h>=1&&h>han; };
const stillKo=r=>/[가-힣ㄱ-ㆎ]/.test(String(r||""));
/* ㅋㅋ、ㅎㅎ、ㅠㅠ 翻譯常常翻不動，先換成中文再丟去翻 */
const koPre=t=>String(t).replace(/ㅋ{2,}/g,m=>"哈".repeat(Math.min(4,m.length))).replace(/ㅎ{2,}/g,"嘿嘿").replace(/[ㅠㅜ]{2,}/g,"嗚嗚");
async function koToZh(t){ const pre=koPre(t); let out=await translateMany([pre],"zh"), r=out&&aiClean(out[0]);
  if(!r||stillKo(r)){ const m=/^([\s\S]*?)([~～!！?？.。\s\p{Extended_Pictographic}\uFE0F\u200D]*)$/u.exec(pre), core=m?m[1]:pre, tail=m?m[2]:"";   // 太短的句子（像「안녕~~」）會被原樣丟回來：去掉尾巴、補句號再翻一次
    if(core.trim()){ const o2=await translateMany([core+"。"],"zh"), r2=o2&&aiClean(o2[0]); if(r2&&!stillKo(r2)) r=r2.replace(/[。.]$/,"")+tail; } }
  return r&&!stillKo(r)?r:null; }
/* 藝人回覆時引用的粉絲訊息不是中文：在藝人手機翻一次，存進那則訊息（w.reply.zh），所有粉絲共用，不會每個人各翻一次 */
async function tieRqShare(wid){ const w0=getWhispers().find(x=>x.id===wid), r=w0&&w0.reply&&w0.reply.text; if(!r||w0.reply.zh||isZhText(r)) return;
  const t=hasHangul(r)?await koToZh(r):await translateMany([r],"zh").then(o=>o&&aiClean(o[0])).catch(()=>null); if(!t) return;
  const list=S.get(K.whispers,[]), w=list.find(x=>x.id===wid); if(!w||!w.reply||w.reply.zh) return; w.reply={...w.reply,zh:t}; S.set(K.whispers,list); }
async function tieOriginal(wid){
  const w0=getWhispers().find(x=>x.id===wid); if(!w0||w0.ko||!w0.text||stkOf(w0.text)) return;
  const ko=hasHangul(w0.text);
  const t=ko?await koToZh(w0.text):(()=>null)();
  let t2=null; if(!ko){ const out=await translateMany([w0.text],"ko","把這則偶像傳給粉絲的訊息，改寫成這位韓國偶像會親手打的自然韓文（語氣親切、像 Bubble 私訊）"); t2=out&&aiClean(out[0]); }
  if(ko?!t:!t2) return;
  const list=S.get(K.whispers,[]), w=list.find(x=>x.id===wid); if(!w||w.ko||w.kt||w.text!==w0.text) return;   /* 翻譯期間已經被別的流程翻好了：不要再翻第二次（會把原文蓋成中文） */
  if(ko){ w.ko=w.text; w.text=t; w.kt=1; } else w.ko=t2; S.set(K.whispers,list);
  const typing=document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName); if(!typing&&!layer.innerHTML){ const y=window.scrollY; render(); window.scrollTo(0,y); }
}
/* 之前翻失敗的（翻譯和原文一樣、或翻出來還是韓文）：還原後再翻一次 */
const tieFixed=new Set();
function tieRepair(){ try{ if(!session()||!(useDeepL()||(SAMPLE&&!aiOff))) return; const list=S.get(K.whispers,[]); let ch=0; const redo=[], rqFix=[];
  list.slice(-300).forEach(w=>{ if(w.from!=="artist"||w.kind||w.welcome||tieFixed.has(w.id)) return;
    const bad=(w.ko&&w.ko===w.text&&hasHangul(w.ko))||(w.kt&&w.ko&&stillKo(w.text)&&!/\p{Script=Han}/u.test(w.text));
    if(!bad){ const s=session(), mine=s&&s.role==="artist"&&(s.member===w.member||uniMe&&uniMe()===w.member)&&Date.now()-w.ts<7*864e5; if(mine&&w.reply&&w.reply.text&&!w.reply.zh&&!isZhText(w.reply.text)) rqFix.push(w.id); if(!w.ko&&!w.kt&&Date.now()-w.ts>3*60e3&&hasHangul(w.text)&&s&&s.role==="artist"&&(s.member===w.member||uniMe&&uniMe()===w.member)&&Date.now()-w.ts<7*864e5){ tieFixed.add(w.id); redo.push(w.id); } return; } tieFixed.add(w.id); w.text=w.ko; delete w.ko; delete w.kt; ch++; redo.push(w.id); });
  rqFix.slice(0,10).forEach((id,i)=>{ if(tieFixed.has("rq"+id)) return; tieFixed.add("rq"+id); setTimeout(()=>tieRqShare(id),2000+i*500); });
  if(ch) S.set(K.whispers,list); if(redo.length){ redo.slice(0,15).forEach((id,i)=>setTimeout(()=>tieOriginal(id),i*400)); } }catch(e){} }
setTimeout(tieRepair,4000); setInterval(tieRepair,60e3);
const welTr=(w,lang)=>(S.get(K.tieTrX,{})||{})[w.id+":w"+lang]||"";
const welAsked=new Set();
async function welTranslate(wid,lang){ const k=wid+":"+lang; if(welAsked.has(k)) return; welAsked.add(k); const w=getWhispers().find(x=>x.id===wid); if(!w){ welAsked.delete(k); return; }
  const out=await translateMany([w.text],lang); const t=out&&aiClean(out[0]); welAsked.delete(k); if(!t) return;
  const all=S.get(K.tieTrX,{})||{}; all[wid+":w"+lang]=t; S.set(K.tieTrX,all); }
/* 中文翻譯：送出時翻好的就用 w.text；送出那一刻沒翻成功（網路斷、App 被關）就在看的人手機上按 A 再翻，存在自己這邊 */
const trText=(w,lang)=>lang==="zh"?(w.ko||isZhText(w.text)?w.text:((S.get(K.tieTrX,{})||{})[w.id+":zh"]||"")):(S.get(K.tieTrX,{})[w.id+":"+lang]||"");
/* 之前已經按過 A 的訊息：引用的那句自動補翻（每則只試一次） */
const rqAutoTried=new Set();
function tieRqAuto(wid,lang){ const k=wid+":"+lang; if(rqAutoTried.has(k)) return; rqAutoTried.add(k);
  setTimeout(()=>tieTrBoth(wid,lang).then(ok=>{ if(!ok||!rqTrGet(wid,lang)) return; const typing=document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName); if(!typing&&!layer.innerHTML){ const y=window.scrollY; render(); window.scrollTo(0,y); } }),300); }
const rqTrGet=(wid,lang)=>{ if(lang==="zh"){ const w=getWhispers().find(x=>x.id===wid); if(w&&w.reply&&w.reply.zh) return w.reply.zh; } return (S.get(K.tieTrX,{})||{})[wid+":rq:"+lang]||""; };
/* 按 A：訊息本身＋引用的粉絲訊息，需要翻的都翻 */
async function tieTrBoth(wid,lang){ const w=getWhispers().find(x=>x.id===wid); if(!w) return false; let ok=true;
  const mainN=w.ko||(!w.kind&&!isZhText(w.text)); if(mainN&&!trText(w,lang)) ok=await tieTranslateX(wid,lang);
  const r=w.reply&&w.reply.text; if(r&&!isZhText(r)&&!rqTrGet(wid,lang)){ const t=lang==="zh"&&hasHangul(r)?await koToZh(r):await translateMany([r],lang).then(o=>o&&aiClean(o[0])).catch(()=>null);
    if(t){ const all=S.get(K.tieTrX,{})||{}; all[wid+":rq:"+lang]=t; S.set(K.tieTrX,all); } else if(!mainN){ toast("翻譯失敗，等一下再試試"); ok=false; } }
  return ok; }
async function tieTranslateX(wid,lang){
  const w=getWhispers().find(x=>x.id===wid); if(!w) return false; if(trText(w,lang)) return true;
  if(!useDeepL()&&(!SAMPLE||aiOff)){ toast("翻譯服務還沒連上，等一下再試試"); return false; }
  const src=w.ko||w.text, t=lang==="zh"&&hasHangul(src)?await koToZh(src):(await translateMany([src],lang).then(o=>o&&aiClean(o[0])).catch(()=>null)); if(!t){ toast("翻譯失敗，等一下再試試"); return false; }
  const all=S.get(K.tieTrX,{}); all[wid+":"+lang]=t; S.set(K.tieTrX,all); return true;
}
/* 管理員：翻譯服務（以前夾在 AI 粉絲那頁裡） */
function viewTranslate(){ return `<main class="page">
    <section class="card studio"><div class="foc-cfg-h"><h3>翻譯服務</h3><span class="badge">目前：${trEngine()}</span></div>
      
      ${HB_ON?`<div class="ls-btns"><button class="btn btn-soft" data-a="trTest">測試翻譯</button></div>`:`<span class="fld-lab">DeepL 中繼站網址</span><label class="field"><input id="trUrl" type="url" inputmode="url" autocomplete="off" placeholder="輸入文字" value="${esc(trCfg().url)}"></label>
      <div class="ls-btns"><button class="btn btn-main" data-a="trSave">儲存</button><button class="btn btn-soft" data-a="trTest">測試翻譯</button></div>`}</section>
  </main>`; }

/* =========================================================
   簽售（藝人端 FOC「簽售現場」＋ 粉絲端 CORE「90s MEET & GREET」，照韓國視訊簽售）
   兩種模式（管理員建立時選）：
   ・全體簽售：報名就是抽整團；輪到你時成員一個一個輪流跟你通話，每位成員 60 秒，全員聊完才換下一位粉絲
   ・個人簽售：報名時選成員；名額是「每位成員抽 X 名」，各成員各自抽籤；同一個人可以報名多位成員，
     同時抽中的話，他的通話會排在一起；一次 90 秒
   共同規則：只有歌曲活動期能開、由管理員（公司方）建立和控場、免費報名＝1 次機會、買專輯每張再多 1 次、
   開始前 5 天截止抽籤、先抽特別粉絲排最前面、沒抽中的變候補、輪到後 20 秒沒進簽售室自動算缺席並遞補
   ========================================================= */
let FS_ME="fan:me"; const FS_ALL_SEC=60, FS_SOLO_SEC=90;
const fsAll=()=>S.get(K.fs,[]);
const fsGet=id=>fsAll().find(e=>e.id===id);
function fsSave(ev){ const l=fsAll(), i=l.findIndex(e=>e.id===ev.id); if(i>=0) l[i]=ev; else l.push(ev); S.set(K.fs,l); }
const fsActiveGroup=gid=>getMShow().songs.some(s=>s.gid===gid);
const fsMembersOf=gid=>Object.keys(MEMBERS).filter(id=>MEMBERS[id].group===gid&&!MEMBERS[id].official);
const fsMyName=gid=>{ const sub=fsMembersOf(gid).find(id=>subs()[id]); return sub?tieSet(sub).nickname||ME.name:ME.name; };
const fsSec=ev=>ev.type==="solo"?FS_SOLO_SEC:FS_ALL_SEC;
const fsLeft=ev=>ev.status==="live"?Math.max(0,fsSec(ev)-Math.floor((Date.now()-ev.curStart)/1000)):fsSec(ev);
const fsColor=ev=>{ const g=groupOf(ev.group); return GRADS[(g?g.g:0)%GRADS.length]; };
const fsName=ev=>{ const g=groupOf(ev.group); return g?g.name:""; };
const fsTypeName=ev=>ev.type==="solo"?"個人簽售":"全體簽售";
const fsSlot=ev=>(ev.slots||[])[ev.cur];
const fsTalking=ev=>{ const s=fsSlot(ev); if(!s) return null; return ev.type==="solo"?s.mid:ev.members[ev.mi||0]; };   // 現在在通話的成員
const fsMySlots=ev=>(ev.slots||[]).map((s,i)=>({s,i})).filter(x=>x.s.fk===FS_ME);
const fsMyNext=ev=>{ const l=fsMySlots(ev).filter(x=>x.i>=Math.max(0,ev.cur)); return l.length?l[0].i:-1; };
const fsSignKey=(ev,slot)=>ev.type==="solo"?slot.fk+"|"+slot.mid:slot.fk;
const fsEntries=(ev,mid)=>ev.type==="solo"?((ev.entries||{})[mid]||{}):(ev.entries||{});
function fsNotify(text,gid){ const list=S.get(K.notifs,[]); list.unshift({id:"n"+Date.now()+Math.random().toString(36).slice(2,5),kind:"core",direct:true,group:gid,text,ts:Date.now()}); S.set(K.notifs,list.slice(0,100)); S.set(K.unread,"1"); }
function fsCreate({gid,type,title,startTs,quota,specials,toSign}){
  const members=fsMembersOf(gid), ev={id:"fs"+Date.now(),group:gid,type,toSign:!!toSign,title,startTs,closeTs:startTs-5*864e5,quota,specials,members,entries:type==="solo"?Object.fromEntries(members.map(m=>[m,{}])):{},names:{},notes:{},
    status:"open",slots:[],wait:{},cur:-1,mi:0,curStart:0,chats:{},signed:{},seen:{}};
  fsSave(ev); fsNotify(`✍️ ${fsName(ev)} ${fsTypeName(ev)}開放報名：${title}`,gid); return ev;
}
function fsPick(pool){ const tot=pool.reduce((a,x)=>a+x.n,0); let r=Math.random()*tot; for(let i=0;i<pool.length;i++){ r-=pool[i].n; if(r<=0) return pool.splice(i,1)[0]; } return pool.pop(); }
function fsLottery(ev,ent,mid){   // 一個名單：特別粉絲 → 其他中籤 → 候補
  const pool=Object.entries(ent).filter(([,n])=>n>0).map(([fk,n])=>({fk,n}));
  const who=fk=>({fk,mid,name:fk===FS_ME?fsMyName(ev.group):(ev.names[fk]||"粉絲"),note:fk===FS_ME?((ev.myNote||{})[mid||"all"]||""):(ev.notes[fk]||"")});
  const sp=[]; for(let i=0;i<ev.specials&&pool.length;i++) sp.push({...who(fsPick(pool).fk),special:true});
  const rest=[]; while(pool.length&&sp.length+rest.length<ev.quota) rest.push(who(fsPick(pool).fk));
  const wait=[]; while(pool.length) wait.push(who(fsPick(pool).fk));
  return {win:[...sp,...rest],wait};
}
function fsDraw(ev){
  if(ev.status!=="open") return ev;
  if(ev.type==="solo"){ let slots=[]; ev.wait={};
    ev.members.forEach(mid=>{ const r=fsLottery(ev,fsEntries(ev,mid),mid); slots=slots.concat(r.win); ev.wait[mid]=r.wait; });
    const out=[], used=new Set();   // 同一個人抽中多位成員：排在一起
    slots.forEach((s,i)=>{ if(used.has(i)) return; out.push(s); used.add(i); slots.forEach((t,j)=>{ if(!used.has(j)&&t.fk===s.fk){ out.push(t); used.add(j); } }); });
    ev.slots=out;
  } else { const r=fsLottery(ev,ev.entries,null); ev.slots=r.win; ev.wait={all:r.wait}; }
  ev.status="drawn"; fsSave(ev);
  const mine=fsMySlots(ev), entered=ev.type==="solo"?ev.members.some(m=>fsEntries(ev,m)[FS_ME]):!!ev.entries[FS_ME];
  if(entered) fsNotify(mine.length?`🎉 你抽中了 ${fsName(ev)} 的${fsTypeName(ev)}！${mine.map(x=>(x.s.mid?artName(x.s.mid,"feed")+" ":"")+`第 ${x.i+1} 位`+(x.s.special?"⭐":"")).join("、")}，記得準備好要問的話`:`${ev.title} 抽籤結果出爐，這次沒有抽中 💜`,ev.group);
  return ev;
}
function fsJoin(id,mid){ const ev=fsGet(id); if(!ev||ev.status!=="open") return false; const ent=ev.type==="solo"?ev.entries[mid]:ev.entries; if(!ent||ent[FS_ME]) return false; ent[FS_ME]=1; fsSave(ev);
  logSelf("core",null,`你報名了「${ev.title}」${mid?"（"+artName(mid,"feed")+"）":""}`); return true; }
function fsBuy(id,mid){
  const ev=fsGet(id); if(!ev||ev.status!=="open") return false; const it=MERCH.find(x=>x.k==="album"), g=groupOf(ev.group), ent=ev.type==="solo"?ev.entries[mid]:ev.entries; if(!ent) return false;
  if(points()<it.pts){ toast("積分不夠，先補充積分吧"); return false; }
  S.set(K.points,points()-it.pts); recordSale("merch",{gid:g.id,pts:it.pts,label:`${g.name}・${it.name}（${ev.title} 應募${mid?"・"+MEMBERS[mid].name:""}）`});
  const o=S.get(K.owned,{}); o[g.id]={...(o[g.id]||{}),album:Date.now()}; S.set(K.owned,o);
  ent[FS_ME]=(ent[FS_ME]||0)+1; fsSave(ev); return true;
}
function fsStart(id){ const ev=fsGet(id); if(!ev||!ev.slots.length) return; ev.status="live"; ev.cur=0; ev.mi=0; ev.curStart=Date.now(); fsSave(ev);
  if(fsMySlots(ev).length) fsNotify(`✍️ ${fsName(ev)} 的簽售開始了！你排第 ${fsMyNext(ev)+1} 位`,ev.group); }
function fsNext(id,{wholeFan=false}={}){
  const ev=fsGet(id); if(!ev||ev.status!=="live") return;
  if(ev.type!=="solo"&&!wholeFan&&(ev.mi||0)<ev.members.length-1){ ev.mi=(ev.mi||0)+1; ev.curStart=Date.now(); fsSave(ev); return; }
  ev.cur++; ev.mi=0; ev.curStart=Date.now();
  if(ev.cur>=ev.slots.length){ ev.status="done"; ev.cur=ev.slots.length; } fsSave(ev);
  if(ev.status==="live"&&fsSlot(ev).fk===FS_ME) fsNotify(`💜 輪到你了！快進簽售室`,ev.group);
}
function fsSkip(id){
  const ev=fsGet(id); if(!ev||ev.status!=="live") return null; const s=fsSlot(ev); s.absent=true; const key=ev.type==="solo"?s.mid:"all", wl=(ev.wait||{})[key]||[]; let sub=null;
  if(wl.length){ sub=wl.shift(); ev.slots.push(sub); if(sub.fk===FS_ME) fsNotify(`🎉 有人缺席，你從候補遞補進 ${ev.title} 了！`,ev.group); }
  fsSave(ev); fsNext(id,{wholeFan:true}); return sub;
}
function fsTick(){
  let changed=false; fsAll().forEach(ev=>{
    if(ev.status==="open"&&Date.now()>=ev.closeTs){ fsDraw(ev); changed=true; return; }
    if(ev.status!=="live") return;
    if(Date.now()-ev.curStart>=fsSec(ev)*1000){ fsNext(ev.id); changed=true; return; }
    const s=fsSlot(ev); if(s&&!s.fk.startsWith("demo:")&&!s.absent&&!(ev.mi>0)&&Date.now()-ev.curStart>20e3&&((ev.seen||{})[s.fk]||0)<ev.curStart){
      if(s.fk===FS_ME) fsNotify(`輪到你的時候沒有進簽售室，這次算缺席了 🥲`,ev.group); fsSkip(ev.id); changed=true; } });
  return changed;
}
function fsSay(id,fk,from,text,mid){ const ev=fsGet(id); if(!ev) return; (ev.chats[fk]=ev.chats[fk]||[]).push({from,text,ts:Date.now(),...(mid?{mid}:{})}); fsSave(ev);
  if(fk===FS_ME){ const l=S.get(K.signedAlbums,[]); l.filter(x=>x.ev===id).forEach(r=>{ r.chat=ev.chats[fk]; }); S.set(K.signedAlbums,l); } }
function fsSign(id,key,mid,{sig,msg}){
  const ev=fsGet(id); if(!ev) return; const s=ev.signed[key]||(ev.signed[key]={sigs:{},msgs:{}});
  if(sig!=null) s.sigs[mid]=sig; if(msg!=null) s.msgs[mid]=msg; s.ts=Date.now(); fsSave(ev);
  if(key.split("|")[0]===FS_ME){ const l=S.get(K.signedAlbums,[]), old=l.find(x=>x.ev===ev.id&&x.key===key), solo=key.split("|")[1];
    const rec={id:old?old.id:"sa"+Date.now()+Math.random().toString(36).slice(2,4),ev:ev.id,key,title:ev.title+(solo&&MEMBERS[solo]?`・${artName(solo,"feed")}`:""),group:ev.group,type:ev.type,members:ev.members,toSign:ev.toSign,to:fsMyTo(ev),startTs:ev.startTs,sigs:s.sigs,msgs:s.msgs,chat:ev.chats[FS_ME]||[],ts:Date.now()};
    if(old) Object.assign(old,rec); else l.unshift(rec); S.set(K.signedAlbums,l);
    if(!old){ giveFsCard(ev.group,mid); fsNotify(`✍️ ${MEMBERS[mid]?artName(mid,"feed"):fsName(ev)} 幫你簽好專輯了！收在 ME 的「簽名專輯」，還多一張簽售卡`,ev.group); } }
}

/* 示範：直接看簽售進行中的樣子（測試期間大家都看得到，正式給成員玩之前，管理員可以在 ME 關掉） */
/* 正式版：示範按鈕全部不顯示。只有 HUSSEY 這個藝人帳號在藝人端（FOC）時打開，讓她看每一個模塊長怎樣 */
const demoMid=()=>{ try{ const s=session(); if(!s) return ""; return s.member||uniMe()||""; }catch(e){ return ""; } };
const demoOn=()=>{ try{ if(sbxOn()) return true; const r=route(), m=MEMBERS[demoMid()]; if(r.role!=="artist"||!m) return false; const g=groupOf(m.group); return String(m.name).toUpperCase()==="HUSSEY"||!!(g&&String(g.name).toUpperCase()==="HUSSEY"); }catch(e){ return false; } };
function fsDemoSig(seed){ const c=document.createElement("canvas"); c.width=300; c.height=300; const x=c.getContext("2d"); x.strokeStyle=["#111827","#6F2FE6","#DB2777"][seed%3]; x.lineWidth=5; x.lineCap="round"; x.lineJoin="round";
  x.beginPath(); x.moveTo(60+seed*6,170-seed*20); x.bezierCurveTo(80,90,110,90,105,160-seed*15); x.bezierCurveTo(100,210,140,120,160,140); x.bezierCurveTo(180,160,175,200,200,150); x.bezierCurveTo(215,120,235,130,240,160); x.stroke();
  x.beginPath(); x.moveTo(90,200-seed*25); x.quadraticCurveTo(160,215,235,190-seed*25); x.stroke(); return c.toDataURL("image/png"); }
function fsDemoLive(asArtist){
  const now=Date.now(), members=fsMembersOf("lumina"), a=members[0], me=FS_ME;
  const ev={id:"fsshow",group:"lumina",type:"all",toSign:true,title:"示範全體簽售",startTs:now,closeTs:now-5*864e5,quota:5,specials:2,members,entries:{},names:{},notes:{},status:"live",
    slots:[{fk:"demo:s1",name:"晴天娃娃",note:"最近練習最開心的是哪一首？",special:true},{fk:me,name:fsMyName("lumina"),note:"可以幫我寫「加油」嗎？",special:true,toName:"Mallow",greet:["加油 화이팅"]},{fk:"demo:s2",name:"布丁",note:"最喜歡的零食是什麼？"},{fk:"demo:s3",name:"月亮汽水",note:"可以叫我的名字嗎"}],
    wait:{all:[{fk:"demo:s5",name:"果凍",note:""}]},cur:1,mi:asArtist?0:Math.min(1,members.length-1),curStart:now,signed:{},seen:{[me]:now},
    chats:{[me]:[{from:"artist",mid:a,text:"你好呀！謝謝你來 💜",ts:now-70e3},{from:"fan",text:"啊啊啊我好緊張",ts:now-60e3},{from:"artist",mid:a,text:"不要緊張～加油喔！",ts:now-55e3}]}};
  fsSave(ev); if(!asArtist) fsSign("fsshow",me,a,{sig:fsDemoSig(0),msg:"화이팅!"}); return ev;
}
/* ---------- 共用畫面 ---------- */
/* 專輯上的簽名：每位成員一個位置，簽名縮小排開，不會疊在一起；To 簽的場次在簽名下寫「To. 粉絲名字」 */
const FS_GREETS=["加油 화이팅","天天開心 행복해","保重身體 건강해","謝謝你 고마워","愛你 사랑해","生日快樂 생일 축하해"];
const fsToOk=t=>/^[A-Za-z\uAC00-\uD7A3\u3131-\u318E ]{1,12}$/.test(t||"");   // To 名字只能用韓文或英文
const fsToOf=slot=>slot&&(slot.toName||slot.name)||"";
const fsMyTo=ev=>{ const x=fsMySlots(ev)[0]; return x?fsToOf(x.s):fsMyName(ev.group); };
const fsDateOf=ev=>{ const d=new Date(ev.startTs); return `${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())}`; };
function fsSigCells(n){
  const rows=n<=1?[1]:n===2?[2]:n===3?[1,2]:n===4?[2,2]:n===5?[2,1,2]:n===6?[3,3]:n===7?[3,1,3]:[3,3,3].slice(0,Math.ceil(n/3));
  const out=[]; const H=rows.length; rows.forEach((cnt,r)=>{ for(let k=0;k<cnt&&out.length<n;k++) out.push({x:(k+.5)/cnt,y:.16+(.66*(r+.5)/H),w:Math.min(.86/Math.max(...rows),.62/H*1.25)}); }); return out;
}
function fsAlbum(ev,sign,{big=false,fan=false,sm=false,to=""}={}){
  const c=fsColor(ev), order=(ev.members&&ev.members.length?ev.members:Object.keys((sign&&sign.sigs)||{})), mids=order.filter(m=>sign&&sign.sigs&&sign.sigs[m]);
  const extra=sign&&sign.sigs?Object.keys(sign.sigs).filter(m=>!order.includes(m)):[], all=[...mids,...extra], slotsN=Math.max(1,ev.type==="solo"?1:order.length||all.length);
  const cells=fsSigCells(slotsN), toName=to||(fan?(ev.slots?fsMyTo(ev):fsMyName(ev.group)):"");
  return `<div class="fs-alb ${big?"big":""} ${sm?"sm":""}" style="--c1:${c[0]};--c2:${c[1]}"><span class="fs-alb-t">${esc(fsName(ev))}</span><span class="fs-alb-s">${esc(ev.title)}</span>
    ${all.map(mid=>{ const i=ev.type==="solo"?0:Math.max(0,order.indexOf(mid)), p=cells[Math.min(i,cells.length-1)], rot=((strHash(mid)%13)-6);
      return `<span class="fs-sigc" style="left:${p.x*100}%;top:${p.y*100}%;width:${p.w*100}%;transform:translate(-50%,-50%) rotate(${rot}deg)">${ev.toSign&&toName?`<em class="to">To. ${esc(toName)}</em>`:""}<img class="fs-sig" src="${sign.sigs[mid]}" alt="簽名">${ev.toSign&&sign.msgs&&sign.msgs[mid]?`<em>${esc(sign.msgs[mid].split(NICK_TK).join(toName))}</em>`:""}</span>`; }).join("")}
    ${ev.toSign&&all.length&&ev.startTs?`<span class="fs-alb-d">${fsDateOf(ev)}</span>`:""}</div>`;
}
const fsRing=(left,total)=>{ const r=26, C=2*Math.PI*r; return `<svg class="fs-ring" viewBox="0 0 64 64"><circle cx="32" cy="32" r="${r}" class="bg"/><circle cx="32" cy="32" r="${r}" class="fg" style="stroke-dasharray:${C};stroke-dashoffset:${C*(1-left/total)}"/></svg><b>${left}</b>`; };
function fsChatHtml(msgs,side){
  return (msgs||[]).map(x=>{ const mine=side==="artist"?x.from==="artist"&&x.mid===(session()||{}).member:x.from==="fan"; const who=x.from==="artist"&&MEMBERS[x.mid]&&!mine?`<em>${esc(artName(x.mid,"feed"))}</em>`:"";
    return `<div class="fs-m ${mine?"me":""} ${x.from==="fan"&&side==="artist"?"fan":""}"><span>${who}${esc(x.text)}</span></div>`; }).join("")||`<p class="fs-none">說聲你好吧 👋</p>`;
}
const fsWhen=ts=>{ const d=new Date(ts); return `${d.getMonth()+1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fsHead=ev=>{ const g=groupOf(ev.group); return `<div class="fs-h"><span class="av sm" style="background:${grad(g?g.g:0)}">${esc(fsName(ev)[0]||"")}</span><div><b>${esc(ev.title)}</b><small>${esc(fsName(ev))}・${fsTypeName(ev)}・${ev.toSign?"含 To 簽":"盲簽（只簽名）"}・${fsWhen(ev.startTs)}・${ev.type==="solo"?"一人 90 秒":"每位成員 60 秒"}</small></div></div>`; };
const fsMav=(mid,cls="")=>{ const m=MEMBERS[mid]; return `<span class="fs-mav ${cls}" style="background:${grad(m?m.g:0)}">${esc(m?ini(m.name):"?")}</span>`; };
/* ---------- 粉絲端：CORE ---------- */
function fsFanBody(ev){ let body=""; const mine=fsMySlots(ev);
    if(ev.status==="open"){
      if(ev.type==="solo"){ body=`<div class="fs-st"><span>報名中・${fsWhen(ev.closeTs)} 截止抽籤</span><span>每位成員抽 ${ev.quota} 名</span></div>
        <p class="fs-tip">選你想通話的成員。免費報名＝1 次機會，買專輯每張再多 1 次；想跟多位成員聊，就分別報名</p>
        <div class="fs-sel">${ev.members.map(mid=>{ const n=fsEntries(ev,mid)[FS_ME]||0, ppl=Object.keys(fsEntries(ev,mid)).length;
          return `<div class="fs-sel-i ${n?"on":""}">${fsMav(mid)}<b>${esc(artName(mid,"feed"))}</b><small>${ppl} 人報名${n?`・你 ${n} 次`:""}</small>
            ${n?`<button class="btn btn-soft btn-sm" data-a="fsBuy" data-v="${ev.id}" data-m="${mid}">💿 +1</button>`:`<button class="btn btn-main btn-sm" data-a="fsJoin" data-v="${ev.id}" data-m="${mid}">報名</button>`}</div>`; }).join("")}</div>`; }
      else { const my=ev.entries[FS_ME]||0, ppl=Object.keys(ev.entries).length;
        body=`<div class="fs-st"><span>報名中・${fsWhen(ev.closeTs)} 截止抽籤</span><span>${ppl} 人報名／抽 ${ev.quota} 名</span></div>
        <p class="fs-tip">${my?`已報名・目前 <b>${my}</b> 次機會`:"抽中後全體成員會輪流跟你通話。免費報名＝1 次機會，買專輯每張再多 1 次"}</p>
        ${my?`<button class="btn btn-soft btn-block" data-a="fsBuy" data-v="${ev.id}">💿 買專輯多 1 次機會・${fmt(MERCH.find(x=>x.k==="album").pts)} 積分</button>`:`<button class="btn btn-main btn-block" data-a="fsJoin" data-v="${ev.id}">免費報名</button>`}`; } }
    else if(!mine.length){ const w=Object.entries(ev.wait||{}).map(([k,l])=>({k,i:l.findIndex(x=>x.fk===FS_ME)})).find(x=>x.i>=0);
      body=`<p class="fs-tip">${w&&ev.status!=="done"?`你在${w.k!=="all"&&MEMBERS[w.k]?" "+esc(artName(w.k,"feed"))+" 的":""}候補第 ${w.i+1} 位，有人缺席就會遞補你`:ev.status==="live"?"簽售進行中":"這次沒有抽中，下次再試試 💜"}</p>`; }
    else { const nx=fsMyNext(ev);
      const lines=mine.map(x=>`<span class="${x.i<ev.cur||ev.status==="done"?"done":""}">${x.s.mid?esc(artName(x.s.mid,"feed"))+"・":""}第 ${x.i+1} 位${x.s.special?" ⭐":""}</span>`).join("");
      if(ev.status==="drawn") body=`<div class="fs-win">🎉 你抽中了！</div><div class="fs-mine">${lines}</div>
        ${(()=>{ const x=mine[0].s, need=ev.toSign&&!x.toName; return `${ev.toSign?`<p class="fs-tip">${x.toName?`To 簽名字：<b>${esc(x.toName)}</b>${(x.greet||[]).length?"・祝福語："+x.greet.map(g=>esc(g.split(" ")[0])).join("、"):""}`:"這場有 To 簽，請先填寫你想要成員寫的名字"}</p>`:""}
        <button class="btn ${need?"btn-main":"btn-soft"} btn-block" data-a="fsNote" data-v="${ev.id}">📝 ${ev.toSign?(need?"填寫簽售資料（To 名字、祝福語、想問的話）":"修改簽售資料"):(x.note?"修改想問的話":"寫下想問的話（會先給成員看）")}</button>`; })()}`;
      else if(ev.status==="live"&&nx===ev.cur) body=`<button class="btn btn-main btn-block fs-go" data-a="fsRoom" data-v="${ev.id}">📞 輪到你了！進入簽售室</button>`;
      else if(ev.status==="live"&&nx>ev.cur) body=`<div class="fs-win">前面還有 <b>${nx-ev.cur}</b> 位</div><div class="fs-mine">${lines}</div><button class="btn btn-soft btn-block" data-a="fsRoom" data-v="${ev.id}">進入等候室</button>`;
      else body=`<div class="fs-win">已完成 ✔ 簽名專輯收在 ME</div>`; }
    return body; }
const FS_ST={open:["報名中",""],drawn:["抽籤完成","on"],live:["● 進行中","ok"],done:["已結束",""]};
function fsFanCards(){
  const f=followed(), list=fsAll().filter(e=>f.includes(e.group)&&groupOf(e.group)&&e.id!=="fsshow"&&(e.status!=="done"||(fsMySlots(e).length&&Date.now()-e.startTs<3*864e5))).sort((a,b)=>a.startTs-b.startTs);
  const demo=demoOn()?`<button class="btn btn-soft btn-block fs-demo" data-a="fsDemoFan">👀 示範：直接進簽售室看看</button>`:"";
  const how=xvSh("要怎麼參加","買專輯每張多 1 次")+xvHow([["✍️","免費報名"],["💿","買專輯<br>加機會"],["🎲","開始前 5 天<br>抽籤"],["📹","時間到<br>進簽售室"]]);
  if(!list.length) return `<div class="xv fs2">${xvHero({small:"FANSIGN",title:"目前沒有簽售",meta:"打歌期間公司會開簽售，抽中就能跟成員一對一聊天、拿簽名專輯"})}${how}${demo}</div>`;
  const pri=ev=>{ const nx=fsMyNext(ev); return ev.status==="live"&&nx===ev.cur?0:ev.status==="live"&&fsMySlots(ev).length?1:ev.status==="open"?2:ev.status==="drawn"&&fsMySlots(ev).length?3:ev.status==="done"?6:4; };
  const ev=list.find(e=>e.id===ui.fsFeat)||list.slice().sort((a,b)=>pri(a)-pri(b)||a.startTs-b.startTs)[0], rest=list.filter(e=>e!==ev);
  const my=ev.type==="solo"?ev.members.reduce((n,m)=>n+(fsEntries(ev,m)[FS_ME]||0),0):(ev.entries||{})[FS_ME]||0, mine=fsMySlots(ev), nx=fsMyNext(ev);
  const ppl=ev.type==="solo"?new Set(ev.members.flatMap(m=>Object.keys(fsEntries(ev,m)))).size:Object.keys(ev.entries||{}).length;
  const cd=ev.status==="open"?[...xvCd(ev.closeTs),[`${my} 次`,"我的抽籤機會",2]]:ev.status==="drawn"?[...xvCd(ev.startTs),[mine.length?`第 ${mine[0].i+1} 位`:"沒抽中",mine.length?"我的順序":"下次再試",2]]:ev.status==="live"&&mine.length&&nx>=0?[[nx===ev.cur?"輪到你":`${nx-ev.cur} 位`,nx===ev.cur?"快進簽售室":"前面還有",3]]:[];
  const st=FS_ST[ev.status]||["",""];
  const hero=xvHero({tag:st[0],small:`${esc(fsName(ev))}・${fsTypeName(ev)}`,title:esc(ev.title),meta:`${fsWhen(ev.startTs)}・${ev.type==="solo"?`每位成員抽 ${ev.quota} 名・一人 90 秒`:`抽 ${ev.quota} 名・每位成員 60 秒`}・${ev.toSign?"To 簽":"盲簽"}`,cd});
  return `<div class="xv fs2">${hero}${xvStats([[ppl,"已報名"],[ev.type==="solo"?`${ev.quota}×${ev.members.length}`:ev.quota,"名額"],["+100","參加積分"]])}
    <section class="card fs-card xv-fsb">${fsFanBody(ev)}</section>
    ${ev.status==="open"?how:""}
    ${rest.length?xvSh("其他簽售",`${rest.length} 場`)+rest.map(e=>{ const s2=FS_ST[e.status]||["",""]; return xvRow({...xvGAv(e.group),title:`${esc(fsName(e))}・${esc(e.title)}`,sub:`${fsTypeName(e)}・${fsWhen(e.startTs)}${fsMySlots(e).length?"・你有抽中":""}`,right:xvChip(s2[0],s2[1]),attrs:`data-a="fsFeat" data-v="${e.id}"`}); }).join(""):""}
    ${demo}</div>`;
}
/* ---------- 粉絲端：簽售室（像視訊通話） ---------- */
function viewFsFanRoom(id){
  const ev=fsGet(id); if(!ev) return coreHead("簽售")+`<main class="page">${emptyBox("✍️","這場簽售已經不在了","")}</main>`;
  const top=`<header class="fs-top"><button class="icon-btn" data-a="back" aria-label="返回">${I.back}</button><b>${esc(ev.title)}</b><span class="sh-sp"></span><span class="fs-cnt">${fsTypeName(ev)}</span></header>`;
  const nx=fsMyNext(ev), mine=fsMySlots(ev), g=groupOf(ev.group);
  if(!mine.length) return `<div class="fs-room">${top}<main class="fs-wait"><p>你這次沒有在這場簽售的名單裡</p></main></div>`;
  if(ev.status==="live"&&nx===ev.cur){
    const s=fsSlot(ev), mid=fsTalking(ev), m=MEMBERS[mid], key=fsSignKey(ev,s), sign=ev.signed[key], total=fsSec(ev), note=s.note;
    const order=ev.type==="solo"?"":`<div class="fs-order">${ev.members.map((x,i)=>`<span class="${i<ev.mi?"done":i===ev.mi?"now":""}">${i<ev.mi?"✔ ":""}${esc(artName(x,"feed"))}</span>`).join('<i>›</i>')}</div>`;
    const nsig=sign&&sign.sigs?Object.keys(sign.sigs).length:0, need=ev.type==="solo"?1:ev.members.length;
    return `<div class="fs-room live" data-fs="${ev.id}">${top}
      <section class="fs-call"><div class="fs-call-av" id="fsTimer">${fsCallRing(ev,mid)}</div>
        <b class="fs-call-n">${esc(m?artName(mid,"feed"):"")}</b><span class="fs-call-st"><i></i>通話中${s.special?"・⭐ 特別粉絲":""}</span>${order}</section>
      ${note?`<div class="fs-mynote">📝 你想問：${esc(note)}</div>`:""}
      <main class="fs-chat" id="fsChat">${fsChatHtml(ev.chats[FS_ME],"fan")}</main>
      <div class="fs-albbar" id="fsAlbBar">${fsAlbBar(ev,sign,need)}</div>
      <form class="fs-foot" id="fsForm"><textarea rows="1" class="ag" id="fsIn" autocomplete="off" aria-label="輸入訊息"></textarea><button class="mr-send on" type="submit" aria-label="送出">${TI.send}</button></form></div>`; }
  if(ev.status==="done"||nx<0){ const sg=mine.map(x=>ev.signed[fsSignKey(ev,x.s)]).filter(Boolean);
    return `<div class="fs-room fs2-done">${top}<main class="fs-wait"><div class="fs2-alb">${sg.map(x=>fsAlbum(ev,x,{fan:true,big:true})).join("")||`<span class="fs-wait-av" style="background:${grad(g?g.g:0)}">✍️</span>`}</div>
      <b>${sg.length?"拿到簽名專輯了 💜":"簽售結束了"}</b><small>${sg.length?"已收進 ME 的「簽名專輯」・參加積分 +100":"謝謝你的參加"}</small>
      <div class="fs2-btns"><button class="xv-bt g" data-a="openSigned">看簽名專輯</button>${sg.length?`<button class="xv-bt" data-a="fsShare" data-v="${ev.id}">分享到 SNS</button>`:""}</div></main></div>`; }
  const n=ev.status==="live"?nx-ev.cur:nx+1, cur=ev.status==="live"?ev.cur:-1, from=Math.max(0,Math.min(cur<0?0:cur,nx-4)), q=(ev.slots||[]).slice(from,from+6), me0=mine[0].s;
  return `<div class="fs-room fs2-wait" data-fs="${ev.id}">${top}<main class="fs-wait"><small>${ev.status==="live"?"前面還有":"簽售還沒開始"}</small>
    <div class="fs2-n">${ev.status==="live"?`${n}<em>位</em>`:`<span>${fsWhen(ev.startTs)}</span>`}</div><small>${ev.status==="live"?`大約 ${Math.max(1,Math.round(n*fsSec(ev)*(ev.type==="solo"?1:ev.members.length)/60))} 分鐘後輪到你・輪到時會自動接通`:`你是第 ${nx+1} 位`}</small>
    <div class="fs2-q">${q.map((x,k)=>{ const i=from+k; return `${k?"<s></s>":""}<i class="${i<cur?"done":i===cur?"now":""} ${x.fk===FS_ME?"me":""}">${x.fk===FS_ME?"你":i+1}</i>`; }).join("")}</div>
    <div class="fs2-note"><b>先想好要說什麼</b>${me0.note?`<p>📝 ${esc(me0.note)}</p>`:""}${ev.toSign?`<p>✍️ To 簽：${esc(fsToOf(me0))}</p>`:""}${!me0.note&&!ev.toSign?`<p>還沒寫想問的話</p>`:""}${ev.status!=="live"?`<button class="xv-bt g" data-a="fsNote" data-v="${ev.id}">改</button>`:""}</div>
    <p class="fs2-tip">輪到你時 20 秒內沒進來，會換候補的人</p></main></div>`;
}
function fsCallRing(ev,mid){ const m=MEMBERS[mid], left=fsLeft(ev), total=fsSec(ev), r=56, C=2*Math.PI*r;
  return `<svg class="fs-cring" viewBox="0 0 128 128"><circle cx="64" cy="64" r="${r}" class="bg"/><circle cx="64" cy="64" r="${r}" class="fg" style="stroke-dasharray:${C};stroke-dashoffset:${C*(1-left/total)}"/></svg>
    <span class="fs-call-face" style="background:${grad(m?m.g:0)}">${esc(m?ini(m.name):"?")}</span><em>${left}s</em>`; }
function fsAlbBar(ev,sign,need){ const n=sign&&sign.sigs?Object.keys(sign.sigs).length:0;
  return `${fsAlbum(ev,sign,{sm:true,fan:true})}<div><b>簽名專輯</b><small>${n?`已經有 ${n}／${need} 位簽名了 ✨`:"成員簽名後會出現在這裡"}</small></div>`; }
function viewSigned(){
  const l=S.get(K.signedAlbums,[]);
  return coreHead("簽名專輯")+`<main class="page fs-shelf">${l.length?l.map(x=>`<button class="fs-shelf-i" data-a="fsView" data-v="${x.id}">${fsAlbum({group:x.group,title:x.title,type:x.type,members:x.members,toSign:x.toSign,startTs:x.startTs},x,{to:x.to})}<small>${esc(x.title)}・${ymd(x.ts)}</small></button>`).join(""):emptyBox("✍️","還沒有簽名專輯","抽中簽售後，簽好的專輯會收在這裡")}</main>`;
}
function openSignedView(id){
  const x=S.get(K.signedAlbums,[]).find(a=>a.id===id); if(!x) return;
  setLayer(`<div class="ph-view fs-v" data-a="tCloseLayer" role="dialog" aria-label="簽名專輯"><button class="ph-x" data-a="tCloseLayer" aria-label="關閉">${XI}</button>
    <div class="fs-v-in">${fsAlbum({group:x.group,title:x.title,type:x.type,members:x.members,toSign:x.toSign,startTs:x.startTs},x,{big:true,to:x.to})}
      ${Object.entries(x.msgs||{}).filter(([,v])=>v).length?`<div class="fs-v-msgs">${Object.entries(x.msgs).filter(([,v])=>v).map(([mid,t])=>`<p><em>${esc(MEMBERS[mid]?artName(mid,"feed"):"")}</em>${esc(t).split(NICK_TK).join(esc(x.to||""))}</p>`).join("")}</div>`:""}
      <div class="fs-v-chat"><b>那天的通話</b>${(x.chat||[]).map(c=>`<p class="${c.from==="fan"?"me":""}"><em>${c.from==="fan"?"我":esc(MEMBERS[c.mid]?artName(c.mid,"feed"):"")}</em>${esc(c.text)}</p>`).join("")||"<p>（沒有對話）</p>"}</div></div></div>`,"signed");
}
/* ---------- 藝人端：FOC 卡片 ---------- */
function fsArtistCard(mid){
  const gid=MEMBERS[mid].group, all=fsAll().filter(e=>e.group===gid&&e.id!=="fsshow"), up=all.filter(e=>e.status!=="done").sort((a,b)=>a.startTs-b.startTs), past=all.filter(e=>e.status==="done").sort((a,b)=>b.startTs-a.startTs);
  const demo=demoOn()?`<button class="btn btn-soft btn-block fs-demo" data-a="fsDemoDesk">👀 示範：直接進簽售台看看</button>`:"";
  const cnt=ev=>ev.type==="solo"?Object.keys(fsEntries(ev,mid)).length:Object.keys(ev.entries||{}).length, myQ=ev=>(ev.slots||[]).filter(s=>ev.type!=="solo"||s.mid===mid);
  const ev=up.find(e=>e.status==="live")||up[0];
  let top;
  if(!ev) top=xvHero({small:"FANSIGN",title:"還沒有簽售",meta:"簽售在歌曲活動期由公司方（管理員）安排，排好會出現在這裡"});
  else { const st=FS_ST[ev.status]||["",""], q=myQ(ev);
    top=xvHero({tag:st[0],small:`${esc(ev.title)}・${fsTypeName(ev)}`,title:fsWhen(ev.startTs),meta:ev.status==="open"?`報名中・${ev.type==="solo"?"選你的有 ":""}${cnt(ev)} 人・${fsWhen(ev.closeTs)} 抽籤`:ev.status==="drawn"?`${q.length} 位粉絲・${ev.type==="solo"?"每位跟你聊 90 秒":"每位跟你聊 60 秒"}・等公司方開場`:`簽售中・第 ${ev.cur+1}／${ev.slots.length} 位`,
      cd:ev.status!=="live"?xvCd(ev.startTs):[],btns:ev.status==="live"?[["進簽售台",`data-a="fsDesk" data-v="${ev.id}"`]]:[]})
      +(ev.status==="drawn"||ev.status==="live"?xvSh("中籤名單",`${ev.toSign?"To 簽":"盲簽"}・照順序`)+q.map((w,k)=>xvRow({av:k+1,title:esc(w.name),sub:[w.toName&&ev.toSign?`To. ${esc(w.toName)}`:"",w.note?`📝 ${esc(w.note)}`:""].filter(Boolean).join("<br>"),right:w.special?xvChip("⭐ 特別粉絲","on"):""})).join(""):""); }
  return `<div class="xv fs2">${top}${xvStats([[past.length,"辦過"],[ev?myQ(ev).length||cnt(ev):0,ev&&ev.status==="open"?"報名中":"這場名單"],[all.filter(e=>e.status!=="done").length,"排好的"]])}
    ${up.filter(e=>e!==ev).length?xvSh("接下來")+up.filter(e=>e!==ev).map(e=>{ const s2=FS_ST[e.status]||["",""]; return xvRow({av:"✍️",sq:1,avStyle:"background:var(--s2)",title:esc(e.title),sub:`${fsTypeName(e)}・${fsWhen(e.startTs)}`,right:xvChip(s2[0],s2[1])}); }).join(""):""}
    ${past.length?xvSh("之前的簽售")+past.slice(0,5).map(e=>xvRow({av:"✔",sq:1,avStyle:"background:var(--s2);color:var(--ink-3)",title:esc(e.title),sub:`${fsTypeName(e)}・${fsWhen(e.startTs)}・${(e.slots||[]).length} 位粉絲`})).join(""):""}
    <p class="xv-note">簽售當天記得上線，開場後按「進簽售台」</p>${demo}</div>`;
}
/* ---------- 藝人端：簽售台 ---------- */
function fsSignTxt(ev,key){ const me=(session()||{}).member, sg=ev.signed[key], mine=sg&&sg.sigs&&sg.sigs[me], msg=sg&&sg.msgs&&sg.msgs[me], others=sg&&sg.sigs?Object.keys(sg.sigs).filter(x=>x!==me).length:0;
  return `<b>${mine?"你簽好了 ✔":"還沒簽名"}</b><small>${mine?(msg?`「${nickTag(esc(msg))}」`:ev.toSign?"To 簽":"盲簽"):ev.toSign?"按右邊的按鈕簽名（會附 To 簽）":"按右邊的按鈕簽名（盲簽）"}${others?`・另外 ${others} 位團員簽了`:""}</small>`; }
function viewFsDesk(id){
  const ev=fsGet(id); if(!ev||ev.status!=="live") return null; const me=(session()||{}).member, s=fsSlot(ev), talking=fsTalking(ev), mine=talking===me;
  const top=`<header class="fs-top"><button class="icon-btn" data-a="tab" data-v="foc" aria-label="離開簽售台">${I.back}</button><b>簽售台</b><span class="sh-sp"></span><span class="fs-cnt">${fsTypeName(ev)}・第 ${ev.cur+1}／${ev.slots.length} 位</span></header>`;
  if(!mine){ const myNext=ev.type==="solo"?ev.slots.findIndex((x,i)=>i>=ev.cur&&x.mid===me):-1, tm=MEMBERS[talking];
    return `<div class="fs-room desk" data-fs="${ev.id}">${top}<main class="fs-wait">${fsMav(talking,"lg")}<b>現在是 ${esc(tm?tm.name:"")} 在跟 ${esc(s.name)} 通話</b>
      <small>${ev.type==="solo"?(myNext<0?"你的名單都聊完了":`你的下一位粉絲在第 ${myNext+1} 位，輪到你會自動切換`):`${ev.members.indexOf(me)>ev.mi?"輪到你時會自動切換":"你跟這位粉絲聊過了，等下一位粉絲"}`}</small></main></div>`; }
  const key=fsSignKey(ev,s), sign=ev.signed[key], mySig=sign&&sign.sigs&&sign.sigs[me];
  const nextFans=ev.slots.slice(ev.cur+1).filter(x=>ev.type!=="solo"||x.mid===me).slice(0,3);
  return `<div class="fs-room desk" data-fs="${ev.id}">${top}
    <div class="fs-next">${ev.type!=="solo"?`<span class="mem">輪流：${ev.members.map((x,i)=>`${i===ev.mi?"<b>":""}${esc(artName(x,"feed"))}${i===ev.mi?"</b>":""}`).join(" › ")}</span>`:""}${nextFans.length?`接下來：${nextFans.map(x=>`<span>${x.special?"⭐":""}${esc(x.name)}</span>`).join("")}`:"這是最後一位"}</div>
    <section class="fs-now"><div class="fs-who"><span class="fan-av">${mascot(s.fk)}</span><div><small>正在跟你通話</small><b>${s.special?"⭐ ":""}${esc(s.name)}</b></div><div class="fs-timer" id="fsTimer">${fsRing(fsLeft(ev),fsSec(ev))}</div></div>
      <div class="fs-note pin"><small>📝 他想問</small>${s.note?esc(s.note):"（沒有寫）"}</div>
      ${ev.toSign?`<div class="fs-tobar">✍️ To 簽：<b>${esc(fsToOf(s))}</b>${(s.greet||[]).length?`・想要：${s.greet.map(g=>esc(g)).join("、")}`:"・祝福語交給你發揮"}</div>`:""}</section>
    <main class="fs-chat" id="fsChat">${fsChatHtml(ev.chats[s.fk],"artist")}</main>
    <div class="fs-signbar"><div id="fsAlb">${fsAlbum(ev,sign,{sm:true,to:fsToOf(s)})}</div><div class="fs-signtxt" id="fsSignTxt">${fsSignTxt(ev,key)}</div><button class="btn ${mySig?"btn-soft":"btn-main"} btn-sm" data-a="fsPad" data-v="${ev.id}">✍️ ${mySig?"重簽":"簽名"}</button></div>
    <form class="fs-foot" id="fsForm"><textarea rows="1" class="ag" id="fsIn" autocomplete="off" aria-label="輸入訊息"></textarea><button class="mr-send on" type="submit" aria-label="送出">${TI.send}</button></form></div>`;
}
/* ---------- 管理員：安排與控場 ---------- */
function adminFsHtml(){
  const cr=ui.fsCreate||{}, gsel=cr.gid||(GROUPS.find(g=>fsActiveGroup(g.id))||GROUPS[0]).id, type=cr.type||"all", list=fsAll().filter(e=>e.id!=="fsshow"&&(e.status!=="done"||Date.now()-e.startTs<30*864e5)).sort((a,b)=>a.startTs-b.startTs);
  const d=x=>{ const t=new Date(x); return `${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(t.getDate())}T${pad(t.getHours())}:00`; };
  const stx=ev=>({open:`報名 ${ev.type==="solo"?ev.members.map(m=>`${artName(m,"feed")} ${Object.keys(fsEntries(ev,m)).length}`).join("・"):Object.keys(ev.entries).length+" 人"}・${fsWhen(ev.closeTs)} 抽籤`,drawn:`已抽籤 ${ev.slots.length} 位`,live:`簽售中 ${ev.cur+1}／${ev.slots.length}`,done:"已結束"})[ev.status];
  const O=list.filter(e=>e.status==="open"), W=list.filter(e=>e.status==="drawn"||e.status==="live"), D=list.filter(e=>e.status==="done"), cur=xvSegCur("fs",W.some(e=>e.status==="live")?"wait":O.length?"open":W.length?"wait":"open"), L=cur==="open"?O:cur==="wait"?W:D;
  const rows=L.map(ev=>{ const s=fsSlot(ev), st=FS_ST[ev.status]||["",""];
    return `<section class="tr2-c">${xvRow({...xvGAv(ev.group),title:`${esc(fsName(ev))}・${esc(ev.title)}`,sub:`${fsTypeName(ev)}・${fsWhen(ev.startTs)}・${stx(ev)}`,right:xvChip(st[0],st[1])})}
      ${ev.status==="live"&&s?`<p class="fs-adm-now">現在：${s.special?"⭐":""}${esc(s.name)}・正在跟 ${esc(MEMBERS[fsTalking(ev)]?artName(fsTalking(ev),"feed"):"")} 通話・輪到後 20 秒沒進簽售室會自動算缺席、由候補遞補</p>`:""}
      <div class="tr2-b">${ev.status==="open"?`<button class="xv-bt g" data-a="fsDraw" data-v="${ev.id}">立即抽籤</button>`:""}${ev.status==="drawn"?`<button class="xv-bt" data-a="fsStartAdm" data-v="${ev.id}">開始</button>`:""}${ev.status==="live"?`<button class="xv-bt g" data-a="fsAdmSkip" data-v="${ev.id}">缺席</button><button class="xv-bt g" data-a="fsAdmNext" data-v="${ev.id}">下一位</button><button class="xv-bt g" data-a="fsAdmEnd" data-v="${ev.id}">結束</button>`:""}${ev.status!=="live"?`<button class="xv-bt g" data-a="fsDel" data-v="${ev.id}">刪除</button>`:""}</div></section>`; }).join("");
  return `<div class="xv fs2">${xvStats([[O.length,"報名中"],[W.length,"等開始・進行中"],[D.length,"30 天內結束"]])}
    <div style="margin-top:12px">${xvSeg("fs",[["open",`報名中 ${O.length}`],["wait",`等開始 ${W.length}`],["done",`已結束 ${D.length}`]],cur)}</div>
    <div style="margin-top:12px">${rows||xvEmpty(cur==="open"?"沒有報名中的簽售":cur==="wait"?"沒有等開始的簽售":"30 天內沒有結束的簽售")}</div>
    ${ui.fsAddOpen?"":xvAdd("開一場簽售",`data-a="fsAddOpen"`)}</div>
  ${ui.fsAddOpen?`<section class="card studio fs-adm"><div class="foc-cfg-h"><h3>開一場簽售</h3><button class="xv-bt g" data-a="fsAddOpen">收起</button></div>
    <label class="foc-lab">模式</label>
    <div class="chips"><button class="chip ${type==="all"?"on":""}" data-a="fsType" data-v="all">全體簽售</button><button class="chip ${type==="solo"?"on":""}" data-a="fsType" data-v="solo">個人簽售</button></div>
    
    <label class="foc-lab">簽名福利</label>
    <div class="chips"><button class="chip ${cr.toSign!==false?"on":""}" data-a="fsTo" data-v="1">To 簽（附粉絲名字）</button><button class="chip ${cr.toSign===false?"on":""}" data-a="fsTo" data-v="0">盲簽（只簽名）</button></div>
    <label class="foc-lab">哪一團（只有歌曲活動期的團能開）</label>
    <div class="chips wrap">${GROUPS.map(g=>{ const ok=fsActiveGroup(g.id); return `<button class="chip ${gsel===g.id?"on":""}" data-a="fsGid" data-v="${g.id}" ${ok?"":"disabled"}>${esc(g.name)}${ok?"":"・非活動期"}</button>`; }).join("")}</div>
    <span class="fld-lab">簽售名稱</span><label class="field"><input id="fsTitle" placeholder="輸入文字" value="${esc(cr.title||"")}"></label>
    <label class="foc-lab">簽售開始（開始前 5 天截止報名並抽籤）</label><label class="field"><input id="fsStartAt" type="datetime-local" value="${cr.start||d(Date.now()+6*864e5)}"></label>
    <label class="foc-lab">${type==="solo"?"每位成員抽幾名":"總共抽幾名"}</label><div class="chips">${[3,5,10,20].map(n=>`<button class="chip ${(cr.quota||10)===n?"on":""}" data-a="fsQuota" data-v="${n}">${n} 名</button>`).join("")}</div>
    <label class="foc-lab">特別粉絲（先進場${type==="solo"?"・每位成員":""}）</label><div class="chips">${[0,1,3,5].map(n=>`<button class="chip ${(cr.specials??3)===n?"on":""}" data-a="fsSpecials" data-v="${n}">${n?n+" 位":"不抽"}</button>`).join("")}</div>
    <button class="btn btn-main btn-block" data-a="fsCreate" ${fsActiveGroup(gsel)?"":"disabled"}>開放報名</button></section>`:""}`;
}
/* 手寫簽名板 */
function openSignPad(id){
  const ev=fsGet(id); if(!ev) return; const c=fsColor(ev), s=fsSlot(ev), key=fsSignKey(ev,s), me=(session()||{}).member, oldMsg=((ev.signed[key]||{}).msgs||{})[me]||"";
  setLayer(`<div class="fs-pad-w" role="dialog" aria-label="簽名"><div class="fs-pad"><b>在 ${esc(s.name)} 的專輯上簽名</b><small class="fs-pad-sub">${ev.type==="solo"?"":"全體簽售：每位成員簽在專輯上自己的位置"}</small>
    <div class="fs-pad-c" style="--c1:${c[0]};--c2:${c[1]}"><canvas id="fsCanvas" width="600" height="600"></canvas></div>
    <div class="fs-pens">${["#111827","#FFFFFF","#EC4899","#6F2FE6","#F59E0B"].map((p,i)=>`<button class="${i===0?"on":""}" style="background:${p}" data-a="fsPen" data-v="${p}" aria-label="筆的顏色"></button>`).join("")}</div>
    ${ev.toSign?`<p class="fs-pad-to">這場有 To 簽：簽名上方會自動寫「To. ${esc(fsToOf(s))}」和日期</p><input id="fsPadMsg" class="fs-pad-msg" maxlength="20" placeholder="輸入文字" value="${esc(oldMsg||(s.greet||[]).map(g=>g.split(" ")[1]||g).join(" "))}">`:`<p class="fs-pad-to">這場是盲簽：只簽名字，不寫粉絲的名字</p>`}
    <div class="ls-btns"><button class="btn btn-soft" data-a="fsPadClear">清掉</button><button class="btn btn-soft" data-a="tCloseLayer">取消</button><button class="btn btn-main" data-a="fsPadDone" data-v="${id}">簽好了</button></div></div></div>`,"signpad");
  const cv=document.getElementById("fsCanvas"), x=cv.getContext("2d"); ui.fsPen="#111827"; ui.fsInk=false;
  x.lineCap="round"; x.lineJoin="round"; let last=null; cv.style.touchAction="none";
  const pt=e=>{ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height]; };
  cv.addEventListener("pointerdown",e=>{ e.preventDefault(); cv.setPointerCapture(e.pointerId); last=pt(e); });
  cv.addEventListener("pointermove",e=>{ if(!last) return; const p=pt(e); x.strokeStyle=ui.fsPen; x.lineWidth=Math.max(5,Math.min(12,12-Math.hypot(p[0]-last[0],p[1]-last[1])/8));
    x.beginPath(); x.moveTo(last[0],last[1]); x.lineTo(p[0],p[1]); x.stroke(); last=p; ui.fsInk=true; });
  const up=()=>{ last=null; }; cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up);
  ui.kp=null; KP.mount(cv.parentElement,cv).then(api=>{ if(api&&cv.isConnected) ui.kp=api; });   /* Konva 載好就換成平滑筆跡＋貼紙 */
}
/* 即時更新：倒數、對話、換人、截止自動抽籤 */
let fsSig="";
setInterval(()=>{
  const changed=fsTick(); const room=document.querySelector(".fs-room[data-fs]");
  if(!room){ if(changed&&(route().tab==="core"||route().tab==="foc")&&!layer.innerHTML){ const y=window.scrollY; render(); window.scrollTo(0,y); } return; }
  const ev=fsGet(room.dataset.fs); if(!ev) return; const desk=room.classList.contains("desk");
  if(!desk&&Date.now()-(ui.fsBeat||0)>3000){ ui.fsBeat=Date.now(); ev.seen={...(ev.seen||{}),[FS_ME]:Date.now()}; fsSave(ev); }
  const s=fsSlot(ev), fk=desk?(s||{}).fk:FS_ME, key=s?fsSignKey(ev,s):"", sg=ev.signed[key];
  const stateSig=ev.status+":"+ev.cur+":"+(ev.mi||0)+":"+(ev.slots||[]).length;
  if(room.dataset.st&&room.dataset.st!==stateSig){ if(!layer.innerHTML) render(); return; } room.dataset.st=stateSig;
  const t=document.getElementById("fsTimer"); if(t&&ev.status==="live") t.innerHTML=desk?fsRing(fsLeft(ev),fsSec(ev)):fsCallRing(ev,fsTalking(ev));
  const sig=[(ev.chats[fk]||[]).length,sg?sg.ts:0].join(":");
  if(sig!==fsSig){ fsSig=sig; const ch=document.getElementById("fsChat"); if(ch){ ch.innerHTML=fsChatHtml(ev.chats[fk],desk?"artist":"fan"); ch.scrollTop=ch.scrollHeight; }
    const al=document.getElementById("fsAlb"); if(al&&desk){ al.innerHTML=fsAlbum(ev,sg,{sm:true,to:fsToOf(s)}); const st=document.getElementById("fsSignTxt"); if(st) st.innerHTML=fsSignTxt(ev,key); }
    const ab=document.getElementById("fsAlbBar"); if(ab&&!desk){ const n0=ab.querySelectorAll(".fs-sig").length; ab.innerHTML=fsAlbBar(ev,sg,ev.type==="solo"?1:ev.members.length); if(ab.querySelectorAll(".fs-sig").length>n0){ ab.classList.add("lit"); const b=ab.getBoundingClientRect(); confetti(b.left+40,b.top+20); setTimeout(()=>ab.classList.remove("lit"),1500); } } }
},500);

/* ===== 直播背景音樂 =====
   藝人開播前先放幾首歌（MP3／M4A／AAC／WAV，每支手機都能播）；開播後藝人按 ♪ 開始放
   每個人的手機照「開始放的時間」自己算現在播到哪一首、第幾秒，大家聽到的是同一段
   手機規定要使用者自己點一下才能出聲，所以粉絲要按一次 ♪ */
const BGM_IC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></svg>';
const BGM_MAX=8, BGM_OK=/\.(mp3|m4a|aac|wav)$/i;
function bgmRefresh(){ if(layer.querySelector(".bgm-sh")) openBgmSheet(); else render(); }
function openBgmSheet(){ const mid=session().member;
  setLayer(`<div class="scrim" data-a="closeSheet"><div class="sheet bgm-sh" role="dialog" aria-label="背景音樂"><div class="grab"></div>
    <div class="cs-h"><h3>背景音樂</h3><div class="spacer"></div><button class="icon-btn sm" data-a="closeSheet" aria-label="關閉">${XI}</button></div>${bgmPrepHtml(mid)}</div></div>`,"bgm"); }
function bgmPrepHtml(mid){ const L=S.get(K.bgm,{})[mid]||[];
  return `<div class="bgm-prep">${L.map((x,i)=>`<div class="bgm-row"><i>${BGM_IC}</i><b>${esc(x.name)}</b><small>${fmtDur(x.dur)}</small>${i>0?`<button class="bgm-up" data-a="bgmUp" data-i="${i}" aria-label="往前移"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg></button>`:`<span class="bgm-up"></span>`}<button data-a="bgmDel" data-i="${i}" aria-label="移除">${XI}</button></div>`).join("")}
    ${ui.bgmBusy?`<div class="bgm-row busy"><b>${esc(ui.bgmBusy)}</b></div>`:L.length<BGM_MAX?`${ui.bgmPick?`<div class="bgm-pick"><button class="bgm-add" data-a="bgmAddF">從檔案選音樂</button><button class="bgm-add" data-a="bgmAddV">從照片圖庫選影片</button></div>`:`<button class="bgm-add" data-a="bgmAdd">＋ 加入音樂</button>`}`:""}</div>`; }
function bgmAdd(vid){ if(ui.bgmBusy) return; const inp=document.createElement("input"); inp.type="file"; inp.multiple=true; inp.accept=vid?"video/*":".mp3,.m4a,.aac,.wav,audio/mpeg,audio/mp4,audio/aac,audio/x-m4a,audio/wav";   /* vid：iPhone 只有 accept 純影片才會開照片圖庫（螢幕錄影） */
  inp.onchange=async()=>{ const fs=[...(inp.files||[])]; if(!fs.length) return; const mid=session().member; let bad=0, big=0;
    for(const f of fs){ const A=S.get(K.bgm,{}), L=A[mid]||[]; if(L.length>=BGM_MAX) break;
      if(!vid&&!BGM_OK.test(f.name||"")){ bad++; continue; } if(f.size>(vid?150:20)*1024*1024){ big++; continue; }
      ui.bgmBusy=vid?"從影片取出聲音…":"上傳中…"; bgmRefresh();
      try{ let blob=f, dur;
        if(vid){ let buf=null; try{ const c=audioCtx(); buf=await Promise.race([decodeAu(c,await f.arrayBuffer()),new Promise((_,rj)=>setTimeout(()=>rj(new Error("timeout")),20000))]); }catch(e){}
          if(buf){ blob=await compactWav(buf); dur=buf.duration; }
          else { const am=await MB.audio(f); if(am&&am.blob.size){ blob=am.blob; dur=am.dur; }   /* 讀不出聲音：用 mediabunny 取出聲音（M4A，小很多） */
            else { if(f.size>45*1024*1024){ big++; continue; } dur=await mediaDur(f); } }   /* iPhone 的 .MOV 常常讀不出聲音：改存影片本身，播放時一樣只出聲音 */
        } else dur=await audioDur(f);   /* 影片只留聲音（單聲道，小很多） */
        if(!dur){ bad++; continue; } const id="bg"+Date.now().toString(36)+Math.random().toString(36).slice(2,5); await MDB.put(id,blob);
        const A2=S.get(K.bgm,{}); A2[mid]=[...(A2[mid]||[]),{mid:id,name:(f.name||"").replace(/\.[^.]+$/,"").slice(0,40)||"音樂",dur}]; S.set(K.bgm,A2); }catch(e){ bad++; } }
    ui.bgmBusy=null; bgmRefresh(); if(bad) toast(vid?"這支影片的聲音讀不出來":"請換成 MP3 或 M4A 檔"); else if(big) toast(vid?"這支影片太大了，請先在「照片」把前後剪短（45MB 以下）":"檔案太大了，請小於 20MB"); };
  pickClick(inp); }
const BG={a:null,on:false,lid:null,idx:-1,url:{}};
function bgmIsOn(l,host){ return host?(!l.bgmOff&&BG.on&&BG.lid===l.id):(BG.on&&BG.lid===l.id); }   /* 藝人：自己手機真的在放才亮 */
function bgmPos(l){ const L=l.bgm||[], tot=L.reduce((s,x)=>s+(x.dur||0),0); if(!tot) return null;
  let p=(l.bgmOff?(l.bgmAt||0):((Date.now()-(l.bgmT0||l.startTs))/1000))%tot; if(p<0) p=0;
  for(let i=0;i<L.length;i++){ if(p<L[i].dur) return {i,off:p}; p-=L[i].dur; } return {i:0,off:0}; }
async function bgmPrep(l){ for(const x of l.bgm||[]){ if(!BG.url[x.mid]){ try{ BG.url[x.mid]=await mediaSrc(x.mid); }catch(e){} } } }
function bgmEl(){ if(!BG.a){ const a=new Audio(); a.preload="auto"; a.setAttribute("playsinline",""); a.setAttribute("webkit-playsinline",""); a.onended=()=>{ BG.idx=-1; bgmSync(); }; BG.a=a; } return BG.a; }
function bgmSeek(a,l){ const go=()=>{ const p=bgmPos(l); if(p) try{ a.currentTime=Math.min(p.off,Math.max(0,(a.duration||p.off+1)-.3)); }catch(e){} };
  if(a.readyState>=1) go(); else a.addEventListener("loadedmetadata",go,{once:true}); }
/* 改順序或修正長度時：正在放的那首、放到第幾秒不變（大家一起跟著） */
function bgmKeep(l,fn){ const p=bgmPos(l), cur=p&&l.bgm[p.i]&&l.bgm[p.i].mid, off=p?p.off:0; fn(); if(!cur) return; const i=l.bgm.findIndex(x=>x.mid===cur); if(i<0) return; let st=off; for(let j=0;j<i;j++) st+=l.bgm[j].dur||0;
  if(l.bgmOff) l.bgmAt=st; else l.bgmT0=Date.now()-st*1000; }
function bgmSync(){ const a=BG.a, room=document.querySelector(".mr.dl"), l=BG.lid?getLive(BG.lid):null;
  if(BG.on&&(!room||!l||l.endTs)){ BG.on=false; BG.idx=-1; }
  if(!a){ bgmUI(); return; }
  if(!BG.on||!l||l.bgmOff){ if(!a.paused) a.pause(); bgmUI(); return; }
  const p=bgmPos(l); if(!p){ bgmUI(); return; } const x=l.bgm[p.i], u=BG.url[x.mid];
  if(!u){ bgmPrep(l).then(()=>{ if(BG.url[x.mid]) bgmSync(); }); bgmUI(); return; }
  if(BG.idx!==p.i){ BG.idx=p.i; a.src=u; a.play().catch(()=>{}); bgmSeek(a,l); bgmUI(); return; }
  if(room.classList.contains("host")&&a.readyState>=1&&isFinite(a.duration)&&a.duration>1&&Math.abs(a.duration-(x.dur||0))>1){ const d=a.duration;   /* 檔案標的長度不準：用實際長度，才不會砍掉歌尾、亂跳 */
    bgmKeep(l,()=>{ x.dur=d; }); saveLive(l); try{ const A=S.get(K.bgm,{}), L=A[l.member]||[], q=L.find(y=>y.mid===x.mid); if(q){ q.dur=d; S.set(K.bgm,A); } }catch(e){} }
  if(a.readyState>=1&&!a.seeking&&Math.abs(a.currentTime-p.off)>2.5) bgmSeek(a,l);
  if(a.paused) a.play().catch(()=>{});
  bgmUI(); }
function bgmUI(){ const room=document.querySelector(".mr.dl"); if(!room) return; const host=room.classList.contains("host"), b=room.querySelector(".dl-bgm"), s=document.getElementById("dlSong");
  const l=b?getLive(b.dataset.id):null; if(!l) return; const on=bgmIsOn(l,host); b.classList.toggle("on",on);
  if(s){ const p=bgmPos(l), playing=!l.bgmOff&&(host||BG.on); s.textContent=playing&&p?"♪ "+l.bgm[p.i].name:""; } }
function bgmTap(id){ const l=getLive(id); if(!l||!(l.bgm||[]).length) return; const a=bgmEl(), host=!!document.querySelector(".mr.dl.host");
  if(host&&!l.bgmOff&&!(BG.on&&BG.lid===id)){ BG.on=true; }   /* 開播後音樂已經在放（粉絲聽得到），但藝人手機還沒出聲：第一下是「我也要聽」，不是關掉 */
  else if(host){ if(l.bgmOff){ l.bgmT0=Date.now()-(l.bgmAt||0)*1000; l.bgmOff=false; BG.on=true; } else { const p=bgmPos(l); let at=0; for(let i=0;i<(p?p.i:0);i++) at+=l.bgm[i].dur; l.bgmAt=at+(p?p.off:0); l.bgmOff=true; BG.on=false; } saveLive(l); }
  else BG.on=!(BG.on&&BG.lid===id);
  BG.lid=id;
  if(BG.on){ const p=bgmPos(l), u=p&&!l.bgmOff&&BG.url[l.bgm[p.i].mid];
    if(u){ BG.idx=p.i; a.src=u; a.muted=false; a.play().catch(()=>{}); bgmSeek(a,l); }
    else { BG.idx=-1; a.muted=true; a.src=toneWav(); const pr=a.play(); const fin=()=>{ a.pause(); a.muted=false; bgmPrep(l).then(bgmSync); }; if(pr&&pr.then) pr.then(fin,fin); else fin(); } }
  else a.pause();
  bgmUI(); }
setInterval(()=>{ if(BG.on||(BG.a&&!BG.a.paused)) bgmSync(); else bgmUI(); },2000);

/* 重播：按 ♪ 從頭依序放這場直播的背景音樂（音樂在 R2，第一次會下載到手機） */
const RPB={a:null,id:null,on:false,i:0};
async function rpBgmPlay(){ const l=getLive(RPB.id); if(!l||!RPB.on) return; const L=l.bgm||[]; if(!L.length) return;
  if(!RPB.urls||RPB.urlsId!==l.id){ RPB.urlsId=l.id; RPB.urls=await Promise.all(L.map(x=>mediaSrc(x.mid).catch(()=>null))); if(!RPB.on) return; }   /* 先全部準備好，換歌時不用等、不會跳過 */
  for(let n=0;n<L.length;n++){ if(RPB.i>=L.length) RPB.i=0; if(RPB.urls[RPB.i]) break; RPB.i++; }
  const u=RPB.urls[RPB.i]; if(!u) return; RPB.a.src=u; RPB.a.play().catch(()=>{}); }
function rpBgm(id){ if(!RPB.a){ const a=new Audio(); a.setAttribute("playsinline",""); a.onended=()=>{ RPB.i++; rpBgmPlay(); }; RPB.a=a; }
  if(RPB.on&&RPB.id===id){ RPB.on=false; RPB.a.pause(); } else { if(RPB.id!==id) RPB.i=0; RPB.id=id; RPB.on=true; RPB.a.play().catch(()=>{}); rpBgmPlay(); }
  document.querySelectorAll(".rp-bgm").forEach(b=>b.classList.toggle("on",RPB.on)); }
const rpBgmStop=()=>{ RPB.on=false; if(RPB.a) RPB.a.pause(); document.querySelectorAll(".rp-bgm").forEach(b=>b.classList.remove("on")); };
window.addEventListener("hashchange",()=>{ if(RPB.on&&!/\/replay/.test(location.hash)) rpBgmStop(); });   /* 離開重播就停 */
document.addEventListener("visibilitychange",()=>{ if(document.hidden){ if(RPB.on) rpBgmStop(); if(BG.a&&!BG.a.paused) BG.a.pause(); } else if(BG.on) setTimeout(bgmSync,300); });   /* 跳出 App 就停；回來直播音樂再對時間 */

