/* =========================================================
   年末大賞 HAECHU AWARDS（11/23）
   ・一場典禮、四座大賞，各學一個真的頒獎典禮：
     年度藝人（MAMA 式）＝評審 40%＋打歌成績 30%＋專輯 30%
     年度歌曲（MMA 式）＝打歌成績 60%＋粉絲投票 20%＋評審 20%
     年度專輯（金唱片式）＝專輯銷量 60%＋評審 40%（不開放粉絲投票）
     年度粉絲票選（MAMA Fans' Choice）＝粉絲投票 100%
     另外：新人賞（今年出道，年度藝人同一套算法）、本賞（年度藝人分數前 3）
   ・評審＝出道藝人互評（每項投一位，不能投自己的團），不靠管理員
   ・時間：今年 1/1～12/14 發的歌、專輯；粉絲投票 12/1～12/20（每天每項 1 票）；頒獎 12/27（六）20:00
   ・典禮照真的頒獎典禮：小獎先、大賞最後；主持人開場、每個獎先介紹入圍、「得獎的是……」停一下再揭曉、得獎感言（入圍藝人事先寫好）
   ・還沒開放時只有她（isHussey）看得到示範
   ========================================================= */
const AWK="daisuki_awards", AWV="daisuki_aw_votes";
const AW_CAT=[
  {k:"new",n:"新人賞",en:"BEST NEW ARTIST",kind:"act",w:{j:.4,m:.3,a:.3},how:"評審 40%・打歌成績 30%・專輯 30%",nw:1},
  {k:"bon",n:"本賞",en:"BONSANG",kind:"act",w:{j:.4,m:.3,a:.3},how:"年度藝人分數前 3 名",top:3},
  {k:"alb",n:"年度專輯",en:"ALBUM OF THE YEAR",kind:"alb",w:{j:.4,a:.6},how:"專輯銷量 60%・評審 40%（不開放粉絲投票）",ds:1,ref:"金唱片式"},
  {k:"song",n:"年度歌曲",en:"SONG OF THE YEAR",kind:"song",w:{m:.6,f:.2,j:.2},how:"打歌成績 60%・粉絲投票 20%・評審 20%",ds:1,ref:"MMA 式",fv:1},
  {k:"fan",n:"年度粉絲票選",en:"FANS' CHOICE OF THE YEAR",kind:"act",w:{f:1},how:"粉絲投票 100%",ds:1,ref:"MAMA Fans' Choice",fv:1},
  {k:"art",n:"年度藝人",en:"ARTIST OF THE YEAR",kind:"act",w:{j:.4,m:.3,a:.3},how:"評審 40%・打歌成績 30%・專輯 30%",ds:1,ref:"MAMA 式"}];
const awYear=()=>new Date().getFullYear();
const awCfg=()=>{ const y=awYear(), v=S.get(AWK,{})||{}; return {y,on:!!v.on&&v.y===y,voteFrom:+new Date(y,11,1),voteTo:+new Date(y,11,21),showAt:+new Date(y,11,27,20,0),relTo:+new Date(y,11,15),sp:v.y===y?(v.sp||{}):{},res:v.y===y?v.res:null}; };
const awDemoOk=()=>{ try{ return typeof isHussey==="function"&&isHussey(); }catch(e){ return false; } };
const awDemo=()=>!!ui.awDemo&&awDemoOk();
/* 階段：vote（投票期）／wait（投票結束、等典禮）／show（典禮開始）／done（典禮結束一週內）／off */
function awPhase(){ if(awDemo()) return ui.awDemo; const c=awCfg(), n=Date.now(); if(!c.on) return "off"; if(n<c.voteFrom) return "soon"; if(n<c.voteTo) return "vote"; if(n<c.showAt) return "wait"; if(n<c.showAt+7*864e5) return "show"; return "off"; }
const awFestShow=()=>awDemoOk()||!["off"].includes(awPhase());

/* ---------- 入圍名單與分數 ---------- */
function awPool(){ const y=awYear(), from=+new Date(y,0,1), to=awCfg().relTo, m=getMShow();
  if(awDemo()) return awDemoPool();
  const songs=[...m.songs,...(m.ended||[])].filter(s=>groupOf(s.gid)&&songRel(s)>=from&&songRel(s)<to);
  const gids=[...new Set(songs.map(s=>s.gid))], albs=(getAlbums()||[]).filter(a=>a.gid&&gids.includes(a.gid)&&(a.ts||0)>=from&&(a.ts||0)<to);
  const debutYr=gid=>{ const L=[...m.songs,...(m.ended||[])].filter(s=>s.gid===gid).map(songRel).filter(Boolean); return L.length?new Date(Math.min(...L)).getFullYear():0; };
  const mus=gid=>songs.filter(s=>s.gid===gid).reduce((n,s)=>n+awSongM(s),0);
  return {acts:gids.map(g=>({id:g,gid:g,name:(groupOf(g)||{}).name||"",m:mus(g),a:awAlbN(g,"",from),nw:debutYr(g)===y})),
    songs:songs.map(s=>({id:s.id,gid:s.gid,name:String(songName(s)),art:(groupOf(s.gid)||{}).name||"",m:awSongM(s)})),
    albs:albs.map(a=>({id:a.id,gid:a.gid,name:a.title||"",art:(groupOf(a.gid)||{}).name||"",a:awAlbN(a.gid,a.title,from)}))}; }
/* 專輯銷量：商城賣出的實體專輯張數（標籤「團名《專輯》版本 ×張數」） */
function awAlbN(gid,title,from){ return (S.get(K.sales,[])||[]).filter(x=>x.type==="album"&&x.gid===gid&&(x.ts||0)>=from&&(!title||String(x.label||"").includes("《"+title+"》"))).reduce((n,x)=>{ const m=/×\s*(\d+)/.exec(x.label||""); return n+(m?+m[1]:1); },0); }
/* 打歌成績：MV 播放＋MV 按讚×5＋一位×300 */
function awSongM(s){ try{ return (songViews(s)||0)+(songMvLikes(s)||0)*5+songStats(s.id).wins.length*300; }catch(e){ return 0; } }
function awDemoPool(){ if(ui.awDP) return ui.awDP; const names=(typeof GROUPS!=="undefined"?GROUPS:[]).filter(g=>g&&g.name).slice(0,6).map(g=>[g.id,g.name]);
  const L=names.length>=4?names:[["dA","HUSSEY"],["dB","veres"],["dC","Yonni"],["dD","TW-IN"],["dE","LUMIÈRE"]], h=x=>strHash("aw"+x);
  const acts=L.map(([g,n],i)=>({id:g,gid:g,name:n,m:200+h(n)%900,a:h(n+"a")%40,nw:i!==1}));
  const songs=L.map(([g,n])=>({id:"ds_"+g,gid:g,name:["Starlight","Butterfly Effect","Pink Moon","Hush","Bloom"][h(n)%5],art:n,m:200+h(n+"s")%1200}));
  const albs=L.slice(0,4).map(([g,n])=>({id:"da_"+g,gid:g,name:["1st Mini 〈Dream〉","Single 〈Hello〉","1st Album 〈Wings〉","Mini 〈Twinkle〉"][h(n)%4],art:n,a:5+h(n+"b")%60}));
  return ui.awDP={acts,songs,albs}; }
function awVotes(){ if(awDemo()){ if(!ui.awDV){ const P=awDemoPool(), f={}, j={}; ["song","fan"].forEach(k=>{ f[k]={}; const L=k==="song"?P.songs:P.acts; for(let i=0;i<40;i++){ f[k]["d"+i]={d:L[strHash(k+i)%L.length].id}; } }); ["new","art","alb","song","bon"].forEach(k=>{ j[k]={}; }); ui.awDV={f,j}; } return ui.awDV; }
  const V=(S.get(AWV,{})||{})[awYear()]||{}; return {f:V.f||{},j:V.j||{}}; }
const awFanCount=(cat,id)=>{ const F=(awVotes().f||{})[cat]||{}; let n=0; Object.values(F).forEach(o=>Object.values(o||{}).forEach(v=>{ if(v===id) n++; })); return n; };
const awJudgeCount=(cat,id)=>{ const J=(awVotes().j||{})[cat]||{}; return Object.values(J).filter(v=>v===id).length; };
function awNoms(cat){ const P=awPool(), c=AW_CAT.find(x=>x.k===cat); let L=c.kind==="song"?P.songs:c.kind==="alb"?P.albs:P.acts; if(c.nw) L=L.filter(x=>x.nw); return L; }
/* 分數：每一項跟入圍者裡最高的比（最高＝100），乘上比重 */
function awScore(cat){ const c=AW_CAT.find(x=>x.k===cat), base=c.k==="bon"||c.k==="new"?"art":cat, L=awNoms(cat);
  const raw=L.map(x=>({x,m:x.m||0,a:x.a||0,f:awFanCount(c.kind==="song"?"song":"fan",x.id),j:awJudgeCount(base,x.id)+(awDemo()?strHash("j"+cat+x.id)%5:0)}));
  const mx=k=>Math.max(1,...raw.map(r=>r[k])), W=c.w;
  return raw.map(r=>{ const part={}; let t=0; Object.keys(W).forEach(k=>{ const v=r[k]/mx(k)*W[k]*100; part[k]=v; t+=v; }); return {...r,part,t:Math.round(t*10)/10}; }).sort((a,b)=>b.t-a.t||strHash(a.x.id)-strHash(b.x.id)); }
function awWinners(){ const c=awCfg(); if(!awDemo()&&c.res) return c.res; const R={}; AW_CAT.forEach(k=>{ const S0=awScore(k.k); R[k.k]=(k.top?S0.slice(0,k.top):S0.slice(0,1)).map(r=>r.x.id); }); return R; }

/* ---------- 小工具 ---------- */
const awCover=x=>{ try{ if(x.gid&&typeof songCover==="function"&&!awDemo()){ const so=[...getMShow().songs,...(getMShow().ended||[])].filter(s=>s.gid===x.gid).sort((a,b)=>songRel(b)-songRel(a))[0]; if(so){ const h=songCover(so.gid,so.title); if(/<img/.test(h)) return h; } } }catch(e){} return muNpcCover(x.art||x.name||"",x.art?x.name:""); };
const awNm=x=>`<b>${esc(x.name)}</b>${x.art?`<small>${esc(x.art)}</small>`:""}`;
const awLeft=ms=>{ const d=Math.floor(ms/864e5), h=Math.floor(ms%864e5/36e5); return d>0?`${d} 天 ${h} 小時`:h>0?`${h} 小時 ${Math.floor(ms%36e5/6e4)} 分`:`${Math.max(0,Math.floor(ms/6e4))} 分`; };
const awMd=t=>{ const d=new Date(t); return `${d.getMonth()+1}/${d.getDate()}`; };
const awToday=()=>new Date().toISOString().slice(0,10);
const awMyFan=cat=>{ const me=awDemo()?"me":myEmail(); return (((awVotes().f||{})[cat]||{})[me]||{})[awToday()]; };
/* 這個人是不是入圍藝人（看藝人畫面） */
function awMyGid(){ if(awDemo()) return ui.awDemoA?awPool().acts[0].gid:""; const s=session()||{}, a=ACCOUNTS[s.email]||{}, m=s.role==="artist"?s.member:(a.member||""); return m&&MEMBERS[m]?MEMBERS[m].group:""; }
const awMyMid=()=>{ if(awDemo()) return ui.awDemoA?"demo":""; const s=session()||{}, a=ACCOUNTS[s.email]||{}; return s.role==="artist"?s.member:(a.member||""); };

/* ---------- FEST 入口 ---------- */
function awFestHtml(){ if(!awFestShow()) return ""; const ph=awPhase(), c=awCfg(), demo=ph==="off"||ph==="soon";
  const sub=demo?"示範・只有你看得到":ph==="vote"?`粉絲投票中・還有 ${awLeft(c.voteTo-Date.now())}`:ph==="wait"?`頒獎典禮 ${awMd(c.showAt)} 20:00`:"得獎名單出爐";
  return `<div class="fz-sh"><b>年末大賞</b><span>${c.y} HAECHU AWARDS</span></div><button class="aw-fz" data-a="coreGo" data-v="awards"><span class="aw-fz-t"><i>HAECHU</i><b>AWARDS</b><em>${c.y}</em></span><span class="aw-fz-s"><b>年末大賞</b><small>${sub}</small></span><i class="aw-fz-go">›</i></button>`; }

/* ---------- 主頁 ---------- */
function viewAwards(){ if(!awFestShow()) return coreHead("年末大賞")+`<main class="page"><p class="me-none">年末大賞還沒開始</p></main>`;
  if(!awDemo()&&awDemoOk()&&["off","soon"].includes(awPhase())){ ui.awDemo="vote"; }
  const ph=awPhase(), c=awCfg(), gid=awMyGid(), mineN=gid?AW_CAT.filter(k=>awNoms(k.k).some(x=>x.gid===gid)).length:0;
  const hero=`<section class="aw-hero"><div class="aw-hero-glow"></div><small>${c.y}</small><h1><i>HAECHU</i>AWARDS</h1><p>年末大賞・頒獎典禮 ${awMd(c.showAt)}（六）20:00</p>
    <div class="aw-hero-st">${ph==="vote"?`<b>粉絲投票中</b><span>${awMd(c.voteFrom)}～${awMd(c.voteTo-1)}・還有 ${awLeft(c.voteTo-Date.now())}</span>`:ph==="wait"?`<b>投票結束</b><span>典禮倒數 ${awLeft(c.showAt-Date.now())}</span>`:`<b>典禮進行中</b><span>得獎名單出爐</span>`}</div></section>`;
  const show=ph==="show"||ph==="done"?`<button class="aw-enter" data-a="awShow"><span>🎬</span><b>${ph==="show"?"進場看頒獎典禮":"重看頒獎典禮"}</b><small>主持人、入圍介紹、揭曉、得獎感言</small><i>›</i></button>`+awResHtml():"";
  const vote=ph==="vote"?awVoteHtml():"";
  const art=gid&&(ph==="vote"||ph==="wait")?awArtHtml(gid,mineN):"";
  const noms=ph==="vote"||ph==="wait"?awNomsHtml():"";
  return coreHead("年末大賞")+`<main class="page aw">${hero}${show}${art}${vote}${noms}${awDemoBar()}</main>`; }

/* 粉絲：今天的票（每項每天 1 票） */
function awVoteHtml(){ const P=awPool(), cat=ui.awVc||"fan", L=cat==="song"?P.songs:P.acts, mine=awMyFan(cat), tot=L.reduce((n,x)=>n+awFanCount(cat,x.id),0)||1;
  const rk=L.map(x=>({x,n:awFanCount(cat,x.id)})).sort((a,b)=>b.n-a.n);
  return `<section class="aw-card"><div class="aw-h"><b>今天的票</b><span>每項每天 1 票・明天再投</span></div>
    <nav class="aw-seg">${[["fan","年度粉絲票選"],["song","年度歌曲"]].map(([k,n])=>`<button class="${k===cat?"on":""}" data-a="awVc" data-v="${k}">${n}${awMyFan(k)?" ✓":""}</button>`).join("")}</nav>
    <p class="aw-how">${cat==="fan"?"粉絲投票 100% 決定，票數即時公開":"粉絲投票佔 20%（另外 60% 看打歌成績、20% 看評審）"}</p>
    <div class="aw-vl">${rk.map(({x,n},i)=>`<button class="aw-vi ${mine===x.id?"me":""}" data-a="awVote" data-c="${cat}" data-v="${x.id}" ${mine?"disabled":""}><span class="aw-vr">${i+1}</span><span class="aw-cv mu2-cv">${awCover(x)}</span><span class="aw-vn">${awNm(x)}${cat==="fan"?`<i style="width:${Math.round(n/tot*100)}%"></i>`:""}</span><em>${cat==="fan"?`${fmt(n)} 票`:mine===x.id?"已投":""}</em></button>`).join("")}</div>
    ${mine?`<p class="aw-done">今天投好了 💛 明天再來</p>`:`<p class="aw-tip">點一下就投出去</p>`}</section>`; }
/* 入圍名單（不公開分數，照真的典禮） */
function awNomsHtml(){ return `<section class="aw-card"><div class="aw-h"><b>入圍名單</b><span>12/27 揭曉</span></div>${AW_CAT.slice().reverse().map(c=>{ const L=awNoms(c.k); return `<div class="aw-cat ${c.ds?"ds":""}"><div class="aw-ch"><b>${c.n}</b>${c.ds?`<em>大賞</em>`:""}<small>${c.en}</small></div><p>${c.how}${c.ref?`・${c.ref}`:""}</p><div class="aw-nl">${L.length?L.map(x=>`<span class="aw-n"><span class="aw-cv mu2-cv">${awCover(x)}</span>${awNm(x)}</span>`).join(""):`<span class="aw-none">今年沒有入圍者</span>`}</div></div>`; }).join("")}</section>`; }
/* 入圍藝人：得獎感言＋評審票 */
function awArtHtml(gid,n){ const c=awCfg(), sp=awDemo()?(ui.awSp||{}):c.sp, V=awVotes().j||{}, mid=awMyMid();
  const jc=AW_CAT.filter(k=>k.w.j&&k.k!=="bon"&&k.k!=="new");
  return `<section class="aw-card aw-me"><div class="aw-h"><b>你入圍了 ${n} 項 🎉</b><span>只有入圍藝人看得到</span></div>
    <p class="aw-how">先把得獎感言寫好，得獎時會在典禮上出現。沒寫的話，主持人會代為致謝。</p>
    ${AW_CAT.filter(k=>awNoms(k.k).some(x=>x.gid===gid)).map(k=>{ const t=sp[gid+"|"+k.k]||""; return `<button class="aw-sp" data-a="awSpeech" data-v="${k.k}"><b>${k.n}</b><small>${t?esc(t.slice(0,40))+(t.length>40?"…":""):"還沒寫得獎感言"}</small><i>${t?"改":"寫"}</i></button>`; }).join("")}
    <div class="aw-h sub"><b>評審票</b><span>每項投一位・不能投自己的團</span></div>
    ${jc.map(k=>{ const L=awNoms(k.k).filter(x=>x.gid!==gid), my=(V[k.k]||{})[mid]; return `<div class="aw-jv"><b>${k.n}</b><div>${L.map(x=>`<button class="${my===x.id?"on":""}" data-a="awJudge" data-c="${k.k}" data-v="${x.id}">${esc(x.name)}</button>`).join("")||"<small>沒有可以投的</small>"}</div></div>`; }).join("")}</section>`; }
/* 得獎名單（典禮後） */
function awResHtml(){ const W=awWinners(), P=awPool(), find=(k,id)=>(k==="song"?P.songs:k==="alb"?P.albs:P.acts).find(x=>x.id===id);
  return `<section class="aw-card"><div class="aw-h"><b>得獎名單</b><span>${awCfg().y} HAECHU AWARDS</span></div>${AW_CAT.slice().reverse().map(c=>`<div class="aw-rw ${c.ds?"ds":""}"><small>${c.n}${c.ds?" ・大賞":""}</small>${(W[c.k]||[]).map(id=>{ const x=find(c.k,id); return x?`<span class="aw-n"><span class="aw-cv mu2-cv">${awCover(x)}</span>${awNm(x)}</span>`:""; }).join("")||`<span class="aw-none">從缺</span>`}</div>`).join("")}</section>`; }
function awDemoBar(){ if(!awDemoOk()) return ""; return `<div class="aw-demo"><b>示範（只有你看得到）</b><div>${[["vote","投票期"],["wait","等典禮"],["show","典禮當天"]].map(([k,n])=>`<button class="${ui.awDemo===k?"on":""}" data-a="awDemoPh" data-v="${k}">${n}</button>`).join("")}</div><div>${[["","粉絲畫面"],["1","入圍藝人畫面"]].map(([k,n])=>`<button class="${(ui.awDemoA?"1":"")===k?"on":""}" data-a="awDemoA" data-v="${k}">${n}</button>`).join("")}</div>${isAdminAcct()&&!awCfg().on?`<small>正式開放：到時候在 FOC 選秀那頁按「開放年末大賞」</small>`:""}</div>`; }

/* ---------- 頒獎典禮（全螢幕） ---------- */
const AW_HOST=["各位國民製作人、各位粉絲，晚安！歡迎來到 HAECHU AWARDS！","今天晚上，我們要一起見證這一年最閃亮的時刻。","那麼，頒獎典禮正式開始！"];
const AW_ORDER=["new","bon","alb","song","fan","art"];   /* 小獎先，大賞最後；年度藝人壓軸 */
function awSteps(){ const st=[{t:"open"}]; AW_ORDER.forEach(k=>{ st.push({t:"intro",k},{t:"noms",k},{t:"drum",k},{t:"win",k}); }); st.push({t:"end"}); return st; }
function awShow(){ ui.awS={i:0,st:awSteps()}; awShowDraw(); }
function awShowDraw(){ const S0=ui.awS; if(!S0) return; const s=S0.st[S0.i], P=awPool(), W=awWinners(), c=awCfg(), sp=awDemo()?(ui.awSp||{}):c.sp, prog=`<div class="aws-pg"><i style="width:${Math.round(S0.i/(S0.st.length-1)*100)}%"></i></div>`;
  const find=(k,id)=>{ const cat=AW_CAT.find(x=>x.k===k); return (cat.kind==="song"?P.songs:cat.kind==="alb"?P.albs:P.acts).find(x=>x.id===id); };
  let body="";
  if(s.t==="open") body=`<div class="aws-open"><small>${c.y}</small><h1><i>HAECHU</i>AWARDS</h1><div class="aws-host"><span>🎙</span><p>${AW_HOST.join("<br>")}</p></div></div>`;
  else if(s.t==="end") body=`<div class="aws-open"><h1><i>THANK</i>YOU</h1><div class="aws-host"><span>🎙</span><p>今年的 HAECHU AWARDS 到這裡結束了。恭喜所有得獎者，也謝謝每一位投票的粉絲！明年見！</p></div><button class="aws-btn" data-a="awShowX">離開典禮</button></div>`;
  else { const cat=AW_CAT.find(x=>x.k===s.k), L=awNoms(s.k), win=(W[s.k]||[]).map(id=>find(s.k,id)).filter(Boolean);
    const head=`<div class="aws-cat ${cat.ds?"ds":""}">${cat.ds?`<em>DAESANG</em>`:""}<small>${cat.en}</small><b>${cat.n}</b></div>`;
    if(s.t==="intro") body=head+`<div class="aws-host"><span>🎙</span><p>${cat.ds?`接下來是今晚的大賞之一——「${cat.n}」。`:`接下來頒發「${cat.n}」。`}${cat.how}${cat.ref?`，參考 ${cat.ref}`:""}。</p></div>`;
    else if(s.t==="noms") body=head+`<div class="aws-noms">${L.length?L.map((x,i)=>`<div class="aws-nom" style="-webkit-animation-delay:${i*.18}s;animation-delay:${i*.18}s"><span class="aw-cv mu2-cv">${awCover(x)}</span>${awNm(x)}</div>`).join(""):`<p class="aws-none">今年沒有入圍者，從缺</p>`}</div><div class="aws-host sm"><span>🎙</span><p>入圍的是……</p></div>`;
    else if(s.t==="drum") body=head+`<div class="aws-drum"><p>${cat.k==="bon"?"本賞得主是……":"得獎的是……"}</p><div class="aws-dots"><i></i><i></i><i></i></div></div>`;
    else if(s.t==="win") body=head+(win.length?`<div class="aws-win">${win.map(x=>`<div class="aws-wc"><span class="aw-cv mu2-cv">${awCover(x)}</span>${awNm(x)}</div>`).join("")}</div>${win.map(x=>{ const t=sp[x.gid+"|"+s.k]; return `<div class="aws-sp"><small>得獎感言・${esc(x.art||x.name)}</small><p>${t?esc(t):awDemo()?"（入圍藝人事先寫好的得獎感言會出現在這裡）":"謝謝一直支持我們的粉絲！這個獎是大家一起拿到的！"}</p></div>`; }).join("")}`:`<p class="aws-none">從缺</p>`); }
  setLayer(`<div class="aws ${s.t==="win"?"lit":""}" data-a="awNext">${prog}<button class="aws-x" data-a="awShowX" aria-label="離開">✕</button><div class="aws-in" key="${S0.i}">${body}</div>${s.t!=="end"&&s.t!=="drum"?`<p class="aws-tap">點一下繼續</p>`:""}</div>`);
  if(s.t==="drum"){ clearTimeout(ui.awT); ui.awT=setTimeout(()=>{ if(ui.awS===S0&&S0.st[S0.i]===s){ S0.i++; awShowDraw(); } },2200); }
  if(s.t==="win"){ try{ sfx("t3"); }catch(e){} setTimeout(()=>{ try{ const cat=AW_CAT.find(x=>x.k===s.k); confetti(innerWidth/2,innerHeight*.35,{cols:["#FFD86B","#F5C542","#FFF3C4","#FFFFFF",cat.ds?"#E8B923":"#F7E7A1"]}); if(cat.ds) setTimeout(()=>confetti(innerWidth*.3,innerHeight*.3,{cols:["#FFD86B","#FFFFFF","#F5C542"]}),450); }catch(e){} },120); } }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a^="aw"]'); if(!t) return; const a=t.dataset.a; if(!/^aw(Vc|Vote|Speech|SpOk|Judge|Show|ShowX|Next|DemoPh|DemoA|Open)$/.test(a)) return; e.stopImmediatePropagation();
  if(a==="awVc"){ ui.awVc=t.dataset.v; const y=scrollY; render(); scrollTo(0,y); return; }
  if(a==="awDemoPh"){ ui.awDemo=t.dataset.v; render(); return; }
  if(a==="awDemoA"){ ui.awDemoA=!!t.dataset.v; render(); return; }
  if(a==="awShow"){ awShow(); return; }
  if(a==="awShowX"){ e.preventDefault(); clearTimeout(ui.awT); ui.awS=null; layer.innerHTML=""; return; }
  if(a==="awNext"){ const S0=ui.awS; if(!S0) return; const s=S0.st[S0.i]; if(s.t==="drum"||s.t==="end") return; if(S0.i<S0.st.length-1){ S0.i++; awShowDraw(); } return; }
  if(a==="awVote"){ const cat=t.dataset.c, id=t.dataset.v; if(awMyFan(cat)) return; const s=session()||{};
    if(!awDemo()&&(s.role!=="fan"||awMyGid())){ toast(awMyGid()?"入圍藝人用評審票，不參加粉絲投票":"切到粉絲端才能投票"); return; }
    if(awDemo()){ const V=awVotes(); ((V.f[cat]=V.f[cat]||{}).me=V.f[cat].me||{})[awToday()]=id; toast("投好了！明天再來"); const y=scrollY; render(); scrollTo(0,y); return; }
    const me=myEmail(), d=awToday(), y0=awYear(); t.disabled=true;
    kvCas(AWV,v=>{ const o={...(v||{})}, Y=o[y0]={...(o[y0]||{})}, F=Y.f={...(Y.f||{})}, C=F[cat]={...(F[cat]||{})}, M=C[me]={...(C[me]||{})}; if(M[d]) return false; M[d]=id; return {v:o}; }).then(()=>{ toast("投好了！明天再來"); const y=scrollY; render(); scrollTo(0,y); }).catch(()=>{ t.disabled=false; toast("沒有投出去，再試一次"); }); return; }
  if(a==="awJudge"){ const cat=t.dataset.c, id=t.dataset.v, mid=awMyMid(); if(!mid) return;
    if(awDemo()){ const V=awVotes(); (V.j[cat]=V.j[cat]||{})[mid]=id; const y=scrollY; render(); scrollTo(0,y); toast("評審票投好了，投票期間可以改"); return; }
    const y0=awYear(); kvCas(AWV,v=>{ const o={...(v||{})}, Y=o[y0]={...(o[y0]||{})}, J=Y.j={...(Y.j||{})}; J[cat]={...(J[cat]||{}),[mid]:id}; return {v:o}; }).then(()=>{ toast("評審票投好了，投票期間可以改"); const y=scrollY; render(); scrollTo(0,y); }).catch(()=>toast("沒有送出，再試一次")); return; }
  if(a==="awSpeech"){ const k=t.dataset.v, gid=awMyGid(), c=AW_CAT.find(x=>x.k===k), sp=awDemo()?(ui.awSp||{}):awCfg().sp;
    tieModal(`得獎感言・${c.n}`,`<p class="fy-info">得獎時會出現在典禮上（最多 200 字）。入圍名單公布前大家都看不到。</p><textarea id="awSpT" class="a-nick-in dbx-ta" rows="5" maxlength="200" placeholder="輸入文字">${esc(sp[gid+"|"+k]||"")}</textarea>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="awSpOk" data-v="${k}">儲存</button>`); return; }
  if(a==="awSpOk"){ const k=t.dataset.v, gid=awMyGid(), v=((document.getElementById("awSpT")||{}).value||"").trim();
    if(awDemo()){ ui.awSp={...(ui.awSp||{}),[gid+"|"+k]:v}; layer.innerHTML=""; render(); toast("感言存好了"); return; }
    kvCas(AWK,o=>{ const n={...(o||{})}; if(n.y!==awYear()){ n.y=awYear(); n.sp={}; } n.sp={...(n.sp||{}),[gid+"|"+k]:v}; return {v:n}; }).then(()=>{ layer.innerHTML=""; render(); toast("感言存好了"); }).catch(()=>toast("沒有存到，再試一次")); return; }
  if(a==="awOpen"){ if(!isAdminAcct()) return; const c=S.get(AWK,{})||{}, on=!(c.on&&c.y===awYear()); S.set(AWK,{...c,y:awYear(),on,sp:c.y===awYear()?(c.sp||{}):{}}); render(); toast(on?"年末大賞開放了":"年末大賞關起來了"); return; }
},true);
/* 典禮開始的那一刻把結果定下來（管理員的手機算，之後分數再變也不會改） */
setInterval(()=>{ try{ if(!isAdminAcct()) return; const c=awCfg(); if(!c.on||c.res||Date.now()<c.showAt) return; const R={}; AW_CAT.forEach(k=>{ const S0=awScore(k.k); R[k.k]=(k.top?S0.slice(0,k.top):S0.slice(0,1)).map(r=>r.x.id); }); const o=S.get(AWK,{})||{}; S.set(AWK,{...o,res:R}); }catch(e){} },60000);
function awAdminHtml(){ const c=awCfg(); return `<div class="aw-adm"><b>年末大賞</b><p class="ae-tip">${c.y} 年：粉絲投票 ${awMd(c.voteFrom)}～${awMd(c.voteTo-1)}、頒獎 ${awMd(c.showAt)} 20:00。開放後，投票期間到典禮後一週，FEST 選秀下面會出現入口。</p><button class="btn ${c.on?"btn-soft":"btn-main"}" data-a="awOpen">${c.on?"關掉年末大賞":"開放年末大賞"}</button></div>`; }
