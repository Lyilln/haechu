/* =========================================================
   年末大賞 HAECHU AWARDS（11/23）
   ・三場典禮分開辦（真實世界也是不同天）：
     HAECHU STAR AWARDS（學 MAMA）：新人賞、年度粉絲票選（大賞）、年度藝人（大賞）
     HAECHU MELODY AWARDS（學 MMA）：本賞 TOP 3、年度歌曲（大賞）
     HAECHU GOLDEN RECORD（學金唱片，隔年 1 月）：唱片本賞、年度專輯（大賞，不開放粉絲投票）
   ・評審＝出道藝人互評（每項投一位，不能投自己的團），不靠管理員
   ・虛擬歌手（打歌節目裡的那些）也一起入圍
   ・今年 1/1～12/14 發的歌、專輯；粉絲投票 12/1～12/20（每天每項 1 票）
   ・典禮照真的：主持人開場、表演穿插頒獎、每個獎有頒獎人（真實典禮出席過的明星，隨機）、「得獎的是……」再揭曉
   ・還沒開放時只有她（isHussey）看得到示範
   ========================================================= */
const AWK="daisuki_awards", AWV="daisuki_aw_votes";
const AW_CAT=[
  {k:"new",n:"新人賞",en:"BEST NEW ARTIST",kind:"act",w:{j:.4,m:.3,a:.3},nw:1},
  {k:"fan",n:"年度粉絲票選",en:"FANS' CHOICE OF THE YEAR",kind:"act",w:{f:1},ds:1,fv:1},
  {k:"art",n:"年度藝人",en:"ARTIST OF THE YEAR",kind:"act",w:{j:.4,m:.3,a:.3},ds:1},
  {k:"bon",n:"本賞 TOP 3",en:"TOP 3",kind:"act",w:{m:.6,f:.2,j:.2},top:3},
  {k:"song",n:"年度歌曲",en:"SONG OF THE YEAR",kind:"song",w:{m:.6,f:.2,j:.2},ds:1,fv:1},
  {k:"abon",n:"唱片本賞",en:"ALBUM BONSANG",kind:"alb",w:{a:.6,j:.4},top:3},
  {k:"alb",n:"年度專輯",en:"ALBUM OF THE YEAR",kind:"alb",w:{a:.6,j:.4},ds:1}];
const AW_HOW={j:"評審",m:"打歌成績",a:"專輯銷量",f:"粉絲投票"};
const awCatOf=k=>AW_CAT.find(x=>x.k===k);
/* 頒獎人：真實典禮出席過的演員／藝人（MAMA、MMA、金唱片近年名單），* 是壓軸大賞用的 */
const AW_PRE={
  star:["楊紫瓊*","周潤發*","馬東錫*","金泰梨*","高允貞","盧尚炫","盧允瑞","朴炯植","申承勳","申藝恩","安恩真","安孝燮","李光洙","李到晛","李俊榮","惠利","曹世鎬","車珠英","張度練","朱智勳","林時完","趙瑜理","邊佑錫","孔明","金敏荷"],
  mel:["尹鍾信*","李帝勳*","嚴正化*","朴恩斌","金敏荷","申恩秀","玉子妍","柳慧英","金智妍","車俊煥","金英大","安宰賢","文相民"],
  gold:["宋仲基*","河正宇*","李俊昊*","朴寶劍*","邊佑錫","安孝燮","朴恩斌","李大浩","Tiffany","朴敘俊","黃正音","朴炯植","金所泫"]};
/* 主持人：MAMA 2025 是朴寶劍、金惠秀；金唱片是成始璄、文佳煐；MMA 沒有固定主持，由頒獎人開場 */
const AW_HOST={star:["朴寶劍","金惠秀"],gold:["成始璄","文佳煐"]};
const awYear=()=>{ const d=new Date(); return d.getMonth()===0?d.getFullYear()-1:d.getFullYear(); };   /* 1 月的金唱片還算去年的 */
const awSatFrom=(y,m,d)=>{ const t=new Date(y,m,d,20,0); while(t.getDay()!==6) t.setDate(t.getDate()+1); return +t; };
function awCers(y){ y=y||awYear(); const s=awSatFrom(y,11,22);
  return [{k:"star",n:"HAECHU STAR AWARDS",sn:"STAR AWARDS",ref:"MAMA",at:s,cats:["new","fan","art"]},
    {k:"mel",n:"HAECHU MELODY AWARDS",sn:"MELODY AWARDS",ref:"MMA",at:s+864e5,cats:["bon","song"]},
    {k:"gold",n:"HAECHU GOLDEN RECORD",sn:"GOLDEN RECORD",ref:"金唱片",at:awSatFrom(y+1,0,8),cats:["abon","alb"]}]; }
const awCfg=()=>{ const y=awYear(), v=S.get(AWK,{})||{}, C=awCers(y); return {y,on:!!v.on&&v.y===y,voteFrom:+new Date(y,11,1),voteTo:+new Date(y,11,21),relTo:+new Date(y,11,15),endAt:C[2].at+7*864e5,sp:v.y===y?(v.sp||{}):{},st:v.y===y?(v.st||{}):{},res:v.y===y?(v.res||{}):{}}; };
const awDemoOk=()=>{ try{ return typeof isHussey==="function"&&isHussey(); }catch(e){ return false; } };
const awDemo=()=>!!ui.awDemo&&awDemoOk();
const awNow=()=>awDemo()?(ui.awDemo==="vote"?awCfg().voteFrom+3*864e5:ui.awDemo==="wait"?awCfg().voteTo+864e5:awCers()[2].at+3600e3):Date.now();
const awVoting=()=>{ const c=awCfg(), n=awNow(); return n>=c.voteFrom&&n<c.voteTo; };
const awShown=cer=>awNow()>=cer.at;
const awFestShow=()=>awDemoOk()||(awCfg().on&&Date.now()>=awCfg().voteFrom&&Date.now()<awCfg().endAt);

/* ---------- 入圍名單與分數 ---------- */
/* 專輯銷量：商城賣出的實體專輯張數（標籤「團名《專輯》版本 ×張數」） */
function awAlbN(gid,title,from){ return (S.get(K.sales,[])||[]).filter(x=>x.type==="album"&&x.gid===gid&&(x.ts||0)>=from&&(!title||String(x.label||"").includes("《"+title+"》"))).reduce((n,x)=>{ const m=/×\s*(\d+)/.exec(x.label||""); return n+(m?+m[1]:1); },0); }
/* 打歌成績：MV 播放＋MV 讚數×5＋一位×300 */
function awSongM(s){ try{ return (songViews(s)||0)+(songMvLikes(s)||0)*5+songStats(s.id).wins.length*300; }catch(e){ return 0; } }
/* 虛擬歌手：打歌節目裡今年拿過一位的先入圍，不夠 4 組再補；成績落在真藝人中位數的 50%～110%，一位一樣 +300 */
function awNpcs(y,base,amax){ const W=getMShow().npcWin||{}, wins={}; Object.keys(W).filter(wk=>String(wk).startsWith(String(y))).forEach(wk=>Object.values(W[wk]||{}).forEach(o=>{ if(o&&o.name){ const nm=npcN(o.name); wins[nm]=(wins[nm]||0)+1; } }));
  const L=npcSongs().slice().sort((a,b)=>(wins[b[0]]||0)-(wins[a[0]]||0)||strHash(y+a[0])%97-strHash(y+b[0])%97).slice(0,4);
  return L.map(([n,t])=>{ const h=strHash("awn"+y+n), r=(h%1000)/1000, r2=((h>>>10)%1000)/1000; return {n,t,m:Math.round(base*(.5+.6*r))+(wins[n]||0)*300,a:Math.round(amax*(.3+.7*r2)),nw:h%3===0,al:["1st Mini","Single","1st Album","2nd Mini"][h%4]+` 〈${t}〉`}; }); }
function awPool(){ if(awDemo()) return awDemoPool(); const y=awYear(), from=+new Date(y,0,1), to=awCfg().relTo, m=getMShow();
  const songs=[...m.songs,...(m.ended||[])].filter(s=>groupOf(s.gid)&&songRel(s)>=from&&songRel(s)<to);
  const gids=[...new Set(songs.map(s=>s.gid))], albs=(getAlbums()||[]).filter(a=>a.gid&&gids.includes(a.gid)&&(a.ts||0)>=from&&(a.ts||0)<to);
  const debutYr=gid=>{ const L=[...m.songs,...(m.ended||[])].filter(s=>s.gid===gid).map(songRel).filter(Boolean); return L.length?new Date(Math.min(...L)).getFullYear():0; };
  const acts=gids.map(g=>({id:g,gid:g,name:(groupOf(g)||{}).name||"",m:songs.filter(s=>s.gid===g).reduce((n,s)=>n+awSongM(s),0),a:awAlbN(g,"",from),nw:debutYr(g)===y}));
  const P={acts,songs:songs.map(s=>({id:s.id,gid:s.gid,name:String(s.title||songName(s)),art:(groupOf(s.gid)||{}).name||"",m:awSongM(s)})),
    albs:albs.map(a=>({id:a.id,gid:a.gid,name:a.title||"",art:(groupOf(a.gid)||{}).name||"",a:awAlbN(a.gid,a.title,from)}))};
  return awAddNpc(P,y); }
function awAddNpc(P,y){ const ms=P.acts.map(x=>x.m).sort((a,b)=>a-b), base=Math.max(300,ms.length?ms[Math.floor(ms.length/2)]:300), amax=Math.max(10,...P.acts.map(x=>x.a));
  awNpcs(y,base,amax).forEach(o=>{ const g="npc:"+o.n; P.acts.push({id:g,gid:g,name:o.n,m:o.m,a:o.a,nw:o.nw,npc:1,ttl:o.t}); P.songs.push({id:"npcs:"+o.n,gid:g,name:o.t,art:o.n,m:o.m,npc:1}); P.albs.push({id:"npca:"+o.n,gid:g,name:o.al,art:o.n,a:o.a,npc:1,ttl:o.t}); });
  return P; }
function awDemoPool(){ if(ui.awDP) return ui.awDP; const names=(typeof GROUPS!=="undefined"?GROUPS:[]).filter(g=>g&&g.name&&g.id!=="tdm_g").slice(0,5).map(g=>[g.id,g.name]);
  const L=names.length>=3?names:[["dA","HUSSEY"],["dB","veres"],["dC","Yonni"],["dD","TW-IN"]], h=x=>strHash("aw"+x);
  const P={acts:L.map(([g,n],i)=>({id:g,gid:g,name:n,m:300+h(n)%900,a:h(n+"a")%40,nw:i!==1})),
    songs:L.map(([g,n])=>({id:"ds_"+g,gid:g,name:["Starlight","Butterfly Effect","Pink Moon","Hush","Bloom"][h(n)%5],art:n,m:300+h(n+"s")%1200})),
    albs:L.map(([g,n])=>({id:"da_"+g,gid:g,name:["1st Mini 〈Dream〉","Single 〈Hello〉","1st Album 〈Wings〉","Mini 〈Twinkle〉"][h(n)%4],art:n,a:5+h(n+"b")%60}))};
  return ui.awDP=awAddNpc(P,awYear()); }
function awVotes(){ if(awDemo()){ if(!ui.awDV){ const P=awDemoPool(), f={}; [["song",P.songs,"id"],["fan",P.acts,"gid"]].forEach(([k,L,f2])=>{ f[k]={}; for(let i=0;i<40;i++) f[k]["d"+i]={d:L[strHash(k+i)%L.length][f2]}; }); ui.awDV={f,j:{}}; } return ui.awDV; }
  const V=(S.get(AWV,{})||{})[awYear()]||{}; return {f:V.f||{},j:V.j||{}}; }
const awFanCount=(cat,id)=>{ const F=(awVotes().f||{})[cat]||{}; let n=0; Object.values(F).forEach(o=>Object.values(o||{}).forEach(v=>{ if(v===id) n++; })); return n; };
const awJudgeCount=(cat,id)=>Object.values((awVotes().j||{})[cat]||{}).filter(v=>v===id).length;
const awList=(P,kind)=>kind==="song"?P.songs:kind==="alb"?P.albs:P.acts;
function awNoms(cat){ const c=awCatOf(cat); let L=awList(awPool(),c.kind); if(c.nw) L=L.filter(x=>x.nw); return L; }
/* 分數：每一項跟入圍者裡最高的比（最高＝100），乘上比重 */
function awScore(cat){ const c=awCatOf(cat), jk=cat==="new"||cat==="bon"?"art":cat==="abon"?"alb":cat, L=awNoms(cat);
  const raw=L.map(x=>({x,m:x.m||0,a:x.a||0,f:awFanCount(c.kind==="song"?"song":"fan",c.kind==="song"?x.id:x.gid),j:awJudgeCount(jk,x.id)+(awDemo()?strHash("j"+cat+x.id)%5:0)}));
  const mx=k=>Math.max(1,...raw.map(r=>r[k]));
  return raw.map(r=>{ let t=0; Object.keys(c.w).forEach(k=>{ t+=r[k]/mx(k)*c.w[k]*100; }); return {...r,t:Math.round(t*10)/10}; }).sort((a,b)=>b.t-a.t||strHash(a.x.id)-strHash(b.x.id)); }
const awPick=k=>{ const c=awCatOf(k), S0=awScore(k); return (c.top?S0.slice(0,c.top):S0.slice(0,1)).map(r=>r.x.id); };
function awWinners(){ const c=awCfg(), R={}; AW_CAT.forEach(k=>{ R[k.k]=!awDemo()&&c.res[k.k]?c.res[k.k]:awPick(k.k); }); return R; }
/* 頒獎人：每年每個獎固定兩位（大家看到的一樣），大賞一定有一位重量級 */
function awPres(cer,cat){ const L=AW_PRE[cer]||[], big=L.filter(x=>/\*$/.test(x)), rest=L.filter(x=>!/\*$/.test(x)), h=strHash(awYear()+cer+cat), c=awCatOf(cat);
  const a=c.ds&&big.length?big[h%big.length]:rest[h%rest.length]; let b=rest[(h>>>5)%rest.length]; if(b===a) b=rest[((h>>>5)+1)%rest.length]; return [a,b].map(x=>String(x).replace(/\*$/,"")); }

/* ---------- 小工具 ---------- */
const awCover=x=>{ try{ if(!x.npc&&x.gid&&!awDemo()){ const so=[...getMShow().songs,...(getMShow().ended||[])].filter(s=>s.gid===x.gid).sort((a,b)=>songRel(b)-songRel(a))[0]; if(so){ const h=songCover(so.gid,so.title); if(/<img/.test(h)) return h; } } }catch(e){} return muNpcCover(x.art||x.name||"",x.art?x.name:(x.ttl||"")); };
const awNm=x=>`<b>${esc(x.name)}</b>${x.art?`<small>${esc(x.art)}</small>`:""}`;
const awLeft=ms=>{ const d=Math.floor(ms/864e5), h=Math.floor(ms%864e5/36e5); return d>0?`${d} 天 ${h} 小時`:h>0?`${h} 小時 ${Math.floor(ms%36e5/6e4)} 分`:`${Math.max(0,Math.floor(ms/6e4))} 分`; };
const awMd=t=>{ const d=new Date(t); return `${d.getMonth()+1}/${d.getDate()}（${"日一二三四五六"[d.getDay()]}）`; };
const awToday=()=>new Date().toISOString().slice(0,10);
const awMyFan=cat=>{ const me=awDemo()?"me":myEmail(); return (((awVotes().f||{})[cat]||{})[me]||{})[awToday()]; };
function awMyGid(){ if(awDemo()) return ui.awDemoA?awPool().acts[0].gid:""; const s=session()||{}, a=ACCOUNTS[s.email]||{}, m=s.role==="artist"?s.member:(a.member||""); return m&&MEMBERS[m]?MEMBERS[m].group:""; }
const awMyMid=()=>{ if(awDemo()) return ui.awDemoA?"demo":""; const s=session()||{}, a=ACCOUNTS[s.email]||{}; return s.role==="artist"?s.member:(a.member||""); };
const awCov4=x=>`<span class="aw-cv mu2-cv">${awCover(x)}</span>`;

/* ---------- 入口（粉絲 FEST、藝人 FOC） ---------- */
function awFestHtml(art){ if(!awFestShow()) return ""; const c=awCfg(), C=awCers(), n=Date.now(), nx=C.find(x=>n<x.at+3*3600e3);
  const sub=!c.on?"示範・只有你看得到":n<c.voteFrom?`粉絲投票 ${awMd(c.voteFrom)} 開始`:n<c.voteTo?`粉絲投票中・還有 ${awLeft(c.voteTo-n)}`:nx?(n>=nx.at?`${nx.sn} 典禮進行中`:`下一場 ${nx.sn} ${awMd(nx.at)}`):"得獎名單出爐";
  return `${art?"":`<div class="fz-sh"><b>年末大賞</b><span>${c.y} HAECHU AWARDS</span></div>`}<button class="aw-fz" data-a="${art?"focGo":"coreGo"}" data-v="awards"><span class="aw-fz-t"><i>HAECHU</i><b>AWARDS</b><em>${c.y}</em></span><span class="aw-fz-s"><b>年末大賞</b><small>${sub}</small></span><i class="aw-fz-go">›</i></button>`; }

/* ---------- 主頁：上面切三場典禮，一次只看一場（頁面不會太長） ---------- */
function viewAwards(head){ head=head||coreHead; if(!awFestShow()) return head("年末大賞")+`<main class="page"><p class="me-none">年末大賞還沒開始</p></main>`;
  if(!awDemo()&&awDemoOk()&&!awCfg().on) ui.awDemo="vote";
  const c=awCfg(), C=awCers(), n=awNow(), def=(C.find(x=>n<x.at+7*864e5)||C[2]).k, cer=C.find(x=>x.k===ui.awCer)||C.find(x=>x.k===def), gid=awMyGid();
  const st=awVoting()?`<b>粉絲投票中</b><span>${awMd(c.voteFrom)}～${awMd(c.voteTo-1)}・還有 ${awLeft(c.voteTo-n)}</span>`:n<c.voteFrom?`<b>粉絲投票 ${awMd(c.voteFrom)} 開始</b><span>三場典禮・12 月底到 1 月</span>`:`<b>投票結束</b><span>三場典禮陸續揭曉</span>`;
  const hero=`<section class="aw-hero"><div class="aw-hero-glow"></div><div class="aw-beams"><i></i><i></i><i></i></div><small>${c.y}</small><h1><i>HAECHU</i>AWARDS</h1><div class="aw-hero-st">${st}</div></section>`;
  const tabs=`<nav class="aw-cers">${C.map(x=>`<button class="aw-c-${x.k} ${x.k===cer.k?"on":""}" data-a="awCer" data-v="${x.k}"><i></i><b>${x.sn}</b><small>${awMd(x.at)}</small></button>`).join("")}</nav>`;
  const shown=awShown(cer), myIn=gid&&cer.cats.some(k=>awNoms(k).some(x=>x.gid===gid));
  const cerCard=`<section class="aw-cer"><b>${cer.n}</b><p>${awMd(cer.at)} 20:00・${cer.cats.map(k=>awCatOf(k).n).join("・")}</p>${shown?`<button class="aw-enter" data-a="awShow" data-v="${cer.k}"><span>🎬</span><b>${n<cer.at+3*3600e3?"進場看頒獎典禮":"重看頒獎典禮"}</b><i>›</i></button>`:`<div class="aw-cd"><span>典禮倒數</span><b>${awLeft(cer.at-n)}</b></div>`}</section>`;
  const fvCats=cer.cats.filter(k=>awCatOf(k).fv);
  return head("年末大賞")+`<main class="page aw aw-c-${cer.k}">${hero}${tabs}${cerCard}${shown?awResHtml(cer):""}${awVoting()&&fvCats.length?awVoteHtml(fvCats):""}${myIn&&!shown?awArtHtml(gid,cer):""}${shown?"":awNomsHtml(cer)}${awDemoBar()}</main>`; }

/* 粉絲：今天的票（每項每天 1 票） */
function awVoteHtml(cats){ const cat=cats.includes(ui.awVc)?ui.awVc:cats[0], P=awPool(), c=awCatOf(cat), L=awList(P,c.kind), key=c.kind==="song"?"song":"fan", idOf=x=>c.kind==="song"?x.id:x.gid, mine=awMyFan(key), tot=L.reduce((n,x)=>n+awFanCount(key,idOf(x)),0)||1;
  const rk=L.map(x=>({x,n:awFanCount(key,idOf(x))})).sort((a,b)=>b.n-a.n), pub=c.w.f===1;
  return `<section class="aw-card"><div class="aw-h"><b>今天的票・${c.n}</b><span>每天 1 票</span></div>
    <div class="aw-vl">${rk.map(({x,n},i)=>`<button class="aw-vi ${mine===idOf(x)?"me":""}" data-a="awVote" data-c="${key}" data-v="${idOf(x)}" ${mine?"disabled":""}><span class="aw-vr">${i+1}</span>${awCov4(x)}<span class="aw-vn">${awNm(x)}${pub?`<i style="width:${Math.round(n/tot*100)}%"></i>`:""}</span><em>${pub?`${fmt(n)} 票`:mine===idOf(x)?"已投":""}</em></button>`).join("")}</div>
    ${mine?`<p class="aw-done">今天投好了 💛 明天再來</p>`:""}</section>`; }
/* 入圍名單（典禮前；分數不公開） */
function awNomsHtml(cer){ return `<section class="aw-card"><div class="aw-h"><b>入圍名單</b><span>${awMd(cer.at)} 揭曉</span></div>${cer.cats.slice().reverse().map(k=>{ const c=awCatOf(k), L=awNoms(k); return `<div class="aw-cat ${c.ds?"ds":""}"><div class="aw-ch"><b>${c.n}</b>${c.ds?`<em>大賞</em>`:""}<small>${c.en}</small></div><div class="aw-nl">${L.length?L.map(x=>`<span class="aw-n">${awCov4(x)}${awNm(x)}</span>`).join(""):`<span class="aw-none">今年沒有入圍者</span>`}</div></div>`; }).join("")}
  <button class="aw-howbtn" data-a="awHow">評選方式 ${ui.awHow?"▴":"▾"}</button>${ui.awHow?`<div class="aw-hows">${cer.cats.map(k=>{ const c=awCatOf(k); return `<p><b>${c.n}</b>${Object.keys(c.w).map(w=>`${AW_HOW[w]} ${Math.round(c.w[w]*100)}%`).join("・")}${c.top?`（前 ${c.top} 名）`:""}</p>`; }).join("")}<p class="aw-foot">評審由出道藝人互相投票，不能投自己的團</p></div>`:""}</section>`; }
/* 入圍藝人：得獎感言＋年末舞台＋評審票 */
function awArtHtml(gid,cer){ const c=awCfg(), sp=awDemo()?(ui.awSp||{}):c.sp, stg=awDemo()?(ui.awSt||{}):c.st, V=awVotes().j||{}, mid=awMyMid(), mine=cer.cats.filter(k=>awNoms(k).some(x=>x.gid===gid));
  const jc=cer.cats.filter(k=>awCatOf(k).w.j&&!["new","bon","abon"].includes(k)), vods=awDemo()?[]:getVods(gid).slice(0,8), myV=stg[cer.k+"|"+gid];
  return `<section class="aw-card aw-me"><div class="aw-h"><b>你入圍了 ${mine.length} 項 🎉</b><span>只有你看得到</span></div>
    <div class="aw-h sub"><b>得獎感言</b><span>得獎時出現在典禮上</span></div>
    ${mine.map(k=>{ const t=sp[gid+"|"+k]||""; return `<button class="aw-sp" data-a="awSpeech" data-v="${k}"><b>${awCatOf(k).n}</b><small>${t?esc(t.slice(0,40))+(t.length>40?"…":""):"還沒寫"}</small><i>${t?"改":"寫"}</i></button>`; }).join("")}
    <div class="aw-h sub"><b>年末舞台</b><span>選填・典禮中間播</span></div>
    ${vods.length?`<div class="aw-stg">${vods.map(v=>`<button class="${myV===v.id?"on":""}" data-a="awStage" data-c="${cer.k}" data-v="${myV===v.id?"":v.id}">${vodThumb(v)}<b>${esc(v.title)}</b></button>`).join("")}</div>`:`<p class="aw-how">${awDemo()?"（藝人會在這裡從自己的影片選一支當典禮舞台）":"先在 VOD 上傳舞台影片，就能選來在典禮上播"}</p>`}
    ${jc.length?`<div class="aw-h sub"><b>評審票</b><span>每項投一位・不能投自己的團</span></div>${jc.map(k=>{ const L=awNoms(k).filter(x=>x.gid!==gid), my=(V[k]||{})[mid]; return `<div class="aw-jv"><b>${awCatOf(k).n}</b><div>${L.map(x=>`<button class="${my===x.id?"on":""}" data-a="awJudge" data-c="${k}" data-v="${x.id}">${esc(x.name)}</button>`).join("")||"<small>沒有可以投的</small>"}</div></div>`; }).join("")}`:""}</section>`; }
/* 得獎名單（典禮後） */
function awResHtml(cer){ const W=awWinners(), P=awPool(), find=(k,id)=>awList(P,awCatOf(k).kind).find(x=>x.id===id);
  return `<section class="aw-card"><div class="aw-h"><b>得獎名單</b><span>${cer.sn}</span></div>${cer.cats.slice().reverse().map(k=>{ const c=awCatOf(k); return `<div class="aw-rw ${c.ds?"ds":""}"><small>${c.n}${c.ds?"・大賞":""}</small>${(W[k]||[]).map(id=>{ const x=find(k,id); return x?`<span class="aw-n">${awCov4(x)}${awNm(x)}</span>`:""; }).join("")||`<span class="aw-none">從缺</span>`}</div>`; }).join("")}</section>`; }
function awDemoBar(){ if(!awDemoOk()||awCfg().on) return ""; return `<div class="aw-demo"><b>示範（只有你看得到）</b><div>${[["vote","投票期"],["wait","等典禮"],["show","典禮後"]].map(([k,n])=>`<button class="${ui.awDemo===k?"on":""}" data-a="awDemoPh" data-v="${k}">${n}</button>`).join("")}</div><div>${[["","粉絲畫面"],["1","入圍藝人畫面"]].map(([k,n])=>`<button class="${(ui.awDemoA?"1":"")===k?"on":""}" data-a="awDemoA" data-v="${k}">${n}</button>`).join("")}</div></div>`; }

/* ---------- 頒獎典禮（全螢幕）：開場 → 表演 → 頒獎（頒獎人上台 → 入圍 → 得獎的是…… → 揭曉＋感言）→ … → 結束 ---------- */
function awSteps(cer){ const c=awCfg(), stg=awDemo()?(ui.awSt||{}):c.st, gs=[...new Set(cer.cats.flatMap(k=>awNoms(k).map(x=>x.gid)))];
  const perf=gs.map(g=>{ const v=stg[cer.k+"|"+g]&&vodOf(stg[cer.k+"|"+g]); return v?{t:"perf",g,v:v.id}:awDemo()&&!String(g).startsWith("npc:")?{t:"perf",g}:null; }).filter(Boolean);
  const N=cer.cats.length, st=[{t:"open"}]; cer.cats.forEach((k,i)=>{ if(i===N-1) perf.slice(N-1).forEach(p=>st.push(p)); else if(perf[i]) st.push(perf[i]); st.push({t:"intro",k},{t:"noms",k},{t:"drum",k},{t:"win",k}); }); st.push({t:"end"}); return st; }
function awShow(k){ const cer=awCers().find(x=>x.k===k); if(!cer) return; ui.awS={cer,i:0,st:awSteps(cer)}; awShowDraw(); }
const awSay=(who,t)=>`<div class="aws-say"><div><small>${esc(who)}</small><p>${t}</p></div></div>`;   /* 不放頭貼：只寫名字 */
function awShowDraw(){ const S0=ui.awS; if(!S0) return; const cer=S0.cer, s=S0.st[S0.i], P=awPool(), W=awWinners(), c=awCfg(), sp=awDemo()?(ui.awSp||{}):c.sp, prog=`<div class="aws-pg"><i style="width:${Math.round(S0.i/(S0.st.length-1)*100)}%"></i></div>`;
  const find=(k,id)=>awList(P,awCatOf(k).kind).find(x=>x.id===id), H=AW_HOST[cer.k]||awPres(cer.k,cer.cats[cer.cats.length-1]);
  let body="";
  if(s.t==="open") body=`<div class="aws-open"><small>${c.y}</small><h1><i>HAECHU</i>${cer.sn}</h1></div>${awSay(H[0],`各位粉絲，晚安！歡迎來到 ${c.y} ${cer.n}！`)}${awSay(H[1],`今晚要頒出${cer.cats.map(k=>`「${awCatOf(k).n}」`).join("、")}。那麼，典禮正式開始！`)}`;
  else if(s.t==="end") body=`<div class="aws-open"><h1><i>SEE YOU</i>NEXT YEAR</h1></div>${awSay(H[0],`${cer.n} 到這裡結束了，恭喜所有得獎者！`)}${awSay(H[1],"也謝謝每一位支持的粉絲，我們明年見！")}<button class="aws-btn" data-a="awShowX">離開典禮</button>`;
  else if(s.t==="perf"){ const P0=awPool().acts.find(x=>x.gid===s.g)||{}, nm=(groupOf(s.g)||{}).name||P0.name||"", v=s.v&&vodOf(s.v);
    body=`<div class="aws-cat"><small>STAGE</small><b>${esc(nm)}</b></div>${v?`<div class="aws-v"><video data-awmid="${esc(v.mid||"")}" playsinline webkit-playsinline controls preload="metadata"></video></div><p class="aws-vt">${esc(v.title||"")}</p>`:`<div class="aws-v ph"><span>🎤</span><p>入圍藝人選的舞台影片會在這裡播</p></div>`}${awSay(H[0],`接下來，請欣賞 ${esc(nm)} 的舞台！`)}`; }
  else { const cat=awCatOf(s.k), L=awNoms(s.k), win=(W[s.k]||[]).map(id=>find(s.k,id)).filter(Boolean), pr=awPres(cer.k,s.k);
    const head=`<div class="aws-cat ${cat.ds?"ds":""}">${cat.ds?`<em>DAESANG</em>`:""}<small>${cat.en}</small><b>${cat.n}</b></div>`;
    if(s.t==="intro") body=head+`<div class="aws-pre"><small>頒獎人</small><b>${pr.map(esc).join("・")}</b></div>`+awSay(pr[0],cat.ds?`大家好！很榮幸能來頒發今晚的大賞——「${cat.n}」。`:`大家好！接下來由我們來頒發「${cat.n}」。`)+awSay(pr[1],cat.ds?"這一座獎的份量，大家都知道吧？":"今年的入圍者真的都很精彩。");
    else if(s.t==="noms") body=head+awSay(pr[0],"入圍的是……")+`<div class="aws-noms">${L.length?L.map((x,i)=>`<div class="aws-nom" style="-webkit-animation-delay:${i*.18}s;animation-delay:${i*.18}s">${awCov4(x)}${awNm(x)}</div>`).join(""):`<p class="aws-none">今年沒有入圍者，從缺</p>`}</div>`;
    else if(s.t==="drum") body=head+`<div class="aws-drum">${awSay(pr[1],cat.top?`「${cat.n}」的得主是……`:`${c.y} ${cat.n}，得獎的是……`)}<div class="aws-dots"><i></i><i></i><i></i></div></div>`;
    else if(s.t==="win") body=head+(win.length?`<div class="aws-win">${win.map(x=>`<div class="aws-wc">${awCov4(x)}${awNm(x)}</div>`).join("")}</div>${awSay(pr[0],`恭喜 ${win.map(x=>esc(x.art||x.name)).join("、")}！`)}${win.filter(x=>!x.npc).map(x=>{ const t=sp[x.gid+"|"+s.k]; return `<div class="aws-sp"><small>得獎感言・${esc(x.art||x.name)}</small><p>${t?esc(t):awDemo()?"（入圍藝人事先寫好的得獎感言會出現在這裡）":"謝謝一直支持我們的粉絲！這個獎是大家一起拿到的！"}</p></div>`; }).join("")}`:`<p class="aws-none">從缺</p>`); }
  setLayer(`<div class="aws aw-c-${cer.k} ${s.t==="win"?"lit":""}" data-a="awNext">${prog}<button class="aws-x" data-a="awShowX" aria-label="離開">✕</button><div class="aws-beams"><i></i><i></i><i></i></div><div class="aws-in">${body}</div>${s.t!=="end"&&s.t!=="drum"?`<p class="aws-tap">點一下繼續</p>`:""}</div>`);
  layer.querySelectorAll("video[data-awmid]").forEach(async el=>{ try{ const u=el.dataset.awmid&&await mediaSrc(el.dataset.awmid); if(u) el.src=u; }catch(e){} });
  clearTimeout(ui.awT); if(s.t!=="end"&&!(s.t==="perf"&&s.v)) ui.awT=setTimeout(()=>{ if(ui.awS===S0&&S0.st[S0.i]===s&&S0.i<S0.st.length-1){ S0.i++; awShowDraw(); } },s.t==="drum"?2400:s.t==="win"?6000:4000);   /* 不點也會自己往下走（得獎畫面多停一下讓大家看感言；有影片的舞台等看完自己點） */
  if(s.t==="win"){ try{ sfx("t3"); }catch(e){} setTimeout(()=>{ try{ const cs=getComputedStyle(layer.querySelector(".aws")), a=cs.getPropertyValue("--c1").trim()||"#FFD86B", b=cs.getPropertyValue("--c2").trim()||"#FFFFFF", cat=awCatOf(s.k); confetti(innerWidth/2,innerHeight*.35,{cols:[a,b,"#FFFFFF",a,b]}); if(cat.ds) setTimeout(()=>confetti(innerWidth*.3,innerHeight*.3,{cols:[a,b,"#FFFFFF"]}),450); }catch(e){} },120); } }
function awSave(fn){ return mkEdit(AWK,o=>{ const n={...(o||{})}; if(n.y!==awYear()){ n.y=awYear(); n.sp={}; n.st={}; n.res={}; } fn(n); return {v:n}; }); }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a^="aw"]'); if(!t) return; const a=t.dataset.a; if(!/^aw(Vc|Vote|Speech|SpOk|Judge|Show|ShowX|Next|DemoPh|DemoA|Open|Cer|How|Stage)$/.test(a)) return; e.stopImmediatePropagation();
  const keep=()=>{ const y=scrollY; render(); scrollTo(0,y); };
  if(a==="awVc"){ ui.awVc=t.dataset.v; keep(); return; }
  if(a==="awCer"){ ui.awCer=t.dataset.v; keep(); return; }
  if(a==="awHow"){ ui.awHow=!ui.awHow; keep(); return; }
  if(a==="awDemoPh"){ ui.awDemo=t.dataset.v; keep(); return; }
  if(a==="awDemoA"){ ui.awDemoA=!!t.dataset.v; keep(); return; }
  if(a==="awShow"){ awShow(t.dataset.v); return; }
  if(a==="awShowX"){ e.preventDefault(); clearTimeout(ui.awT); ui.awS=null; layer.innerHTML=""; return; }
  if(a==="awNext"){ if(e.target.closest("video,.aws-v,.aws-btn")) return; const S0=ui.awS; if(!S0) return; const s=S0.st[S0.i]; if(s.t==="drum"||s.t==="end") return; if(S0.i<S0.st.length-1){ S0.i++; awShowDraw(); } return; }
  if(a==="awVote"){ const cat=t.dataset.c, id=t.dataset.v; if(awMyFan(cat)) return; const s=session()||{};
    if(!awDemo()&&(s.role!=="fan"||awMyGid())){ toast(awMyGid()?"入圍藝人用評審票，不參加粉絲投票":"切到粉絲端才能投票"); return; }
    if(awDemo()){ const V=awVotes(); ((V.f[cat]=V.f[cat]||{}).me=V.f[cat].me||{})[awToday()]=id; toast("投好了！明天再來"); keep(); return; }
    const me=myEmail(), d=awToday(), y0=awYear(); t.disabled=true;
    mkEdit(AWV,v=>{ const o={...(v||{})}, Y=o[y0]={...(o[y0]||{})}, F=Y.f={...(Y.f||{})}, C=F[cat]={...(F[cat]||{})}, M=C[me]={...(C[me]||{})}; if(M[d]) return false; M[d]=id; return {v:o}; }).then(()=>{ toast("投好了！明天再來"); keep(); }).catch(()=>{ t.disabled=false; toast("沒有投出去，再試一次"); }); return; }
  if(a==="awJudge"){ const cat=t.dataset.c, id=t.dataset.v, mid=awMyMid(); if(!mid) return;
    if(awDemo()){ const V=awVotes(); (V.j[cat]=V.j[cat]||{})[mid]=id; keep(); toast("評審票投好了，投票期間可以改"); return; }
    const y0=awYear(); mkEdit(AWV,v=>{ const o={...(v||{})}, Y=o[y0]={...(o[y0]||{})}, J=Y.j={...(Y.j||{})}; J[cat]={...(J[cat]||{}),[mid]:id}; return {v:o}; }).then(()=>{ toast("評審票投好了，投票期間可以改"); keep(); }).catch(()=>toast("沒有送出，再試一次")); return; }
  if(a==="awStage"){ const k=t.dataset.c+"|"+awMyGid(), v=t.dataset.v;
    if(awDemo()){ ui.awSt={...(ui.awSt||{}),[k]:v}; keep(); return; }
    awSave(n=>{ n.st={...(n.st||{}),[k]:v}; }).then(()=>{ toast(v?"舞台選好了，典禮上會播":"取消舞台"); keep(); }).catch(()=>toast("沒有存到，再試一次")); return; }
  if(a==="awSpeech"){ const k=t.dataset.v, gid=awMyGid(), c=awCatOf(k), sp=awDemo()?(ui.awSp||{}):awCfg().sp;
    tieModal(`得獎感言・${c.n}`,`<p class="fy-info">得獎時會出現在典禮上（最多 200 字），揭曉前大家都看不到。</p><textarea id="awSpT" class="a-nick-in dbx-ta" rows="5" maxlength="200" placeholder="輸入文字">${esc(sp[gid+"|"+k]||"")}</textarea>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="awSpOk" data-v="${k}">儲存</button>`); return; }
  if(a==="awSpOk"){ const k=t.dataset.v, gid=awMyGid(), v=((document.getElementById("awSpT")||{}).value||"").trim();
    if(awDemo()){ ui.awSp={...(ui.awSp||{}),[gid+"|"+k]:v}; layer.innerHTML=""; render(); toast("感言存好了"); return; }
    awSave(n=>{ n.sp={...(n.sp||{}),[gid+"|"+k]:v}; }).then(()=>{ layer.innerHTML=""; render(); toast("感言存好了"); }).catch(()=>toast("沒有存到，再試一次")); return; }
  if(a==="awOpen"){ if(!isAdminAcct()) return; const c=S.get(AWK,{})||{}, same=c.y===awYear(), on=!(c.on&&same); S.set(AWK,{...c,y:awYear(),on,sp:same?(c.sp||{}):{},st:same?(c.st||{}):{},res:same?(c.res||{}):{}}); ui.awDemo=null; render(); toast(on?"年末大賞開放了":"年末大賞關起來了"); return; }
},true);
/* 每一場典禮開始的那一刻把那場的結果定下來（管理員的手機算，之後分數再變也不會改） */
setInterval(()=>{ try{ if(!isAdminAcct()) return; const c=awCfg(); if(!c.on) return; const todo=awCers().filter(x=>Date.now()>=x.at&&x.cats.some(k=>!c.res[k])); if(!todo.length) return; const R={...c.res}; todo.forEach(x=>x.cats.forEach(k=>{ if(!R[k]) R[k]=awPick(k); })); const o=S.get(AWK,{})||{}; S.set(AWK,{...o,res:R}); }catch(e){} },60000);
function awAdminHtml(){ const c=awCfg(), C=awCers(); return `<div class="aw-adm"><b>年末大賞</b><p class="ae-tip">${c.y} 年：粉絲投票 ${awMd(c.voteFrom)}～${awMd(c.voteTo-1)}。${C.map(x=>`${x.sn} ${awMd(x.at)} 20:00`).join("、")}。開放後，從投票開始到最後一場典禮後一週，粉絲 FEST 和藝人 FOC 都會出現入口。</p><button class="btn ${c.on?"btn-soft":"btn-main"}" data-a="awOpen">${c.on?"關掉年末大賞":"開放年末大賞"}</button></div>`; }
