/* HAECHU｜綜藝、星探、代言、生日咖啡廳、運動會 */
/* =========================================================
   綜藝（真實節目原名）：只有出道藝人能上節目，粉絲看、押積分猜誰贏、留言
   ・놀라운 토요일 驚人的星期六：받아쓰기（聽一段歌，寫下歌詞，越接近分數越高）
   ・아는 형님 認識的哥哥：나를 맞혀봐（每人出一題關於自己的題目，其他人來猜）
   ・Running Man 런닝맨：撕名牌（每回合同時選「要撕誰」和「防誰」，被防到的人反被撕）
   管理員在 FOC → 綜藝 開一集（選節目、來賓、截止時間）
   ========================================================= */
const VS_KEY="daisuki_varshow";
const VSHOW={
  nolto:{name:"驚人的星期六",ko:"놀라운 토요일",seg:"받아쓰기",tip:"聽歌寫歌詞",g:3},
  knowing:{name:"認識的哥哥",ko:"아는 형님",seg:"나를 맞혀봐",tip:"猜猜我是誰",g:1},
  rm:{name:"Running Man",ko:"런닝맨",seg:"이름표 떼기",tip:"撕名牌",g:5},
  onetwo:{name:"兩天一夜",ko:"1박 2일",seg:"복불복",tip:"晚餐・爬梯子・翻牌",g:2,retro:1}};
const VS_PUN=["在 SNS 發一張自己的醜照","直播時唱一首童謠","發一則限時動態跳 10 秒可愛舞","用三種語言跟粉絲說「我愛你」","錄一段模仿團員的語音","今天在 TIE 用撒嬌語氣傳三則訊息","把 SNS 大頭貼換成粉絲指定的照片一天","寫一封手寫信給粉絲並拍照上傳"];
const VS_BETS=[100,300,500,1000], VS_CUT=.05;   // 押注池抽 5% 給管理員們
const vsAll=()=>(S.get(VS_KEY,[])||[]).filter(e=>e&&e.id&&VSHOW[e.show]).concat(vsDemo());
/* HUSSEY 的示範：只放在這支手機的記憶體，不會上雲端、粉絲看不到 */
function vsDemo(){ if(!demoOn()) return []; if(ui.vsDemo) return ui.vsDemo; const me=demoMid(), o=Object.keys(MEMBERS).filter(m=>m!==me&&!MEMBERS[m].official&&groupOf(MEMBERS[m].group)).slice(0,2), mids=[me,...o], now=Date.now(), end=now+3*864e5;
  ui.vsDemo=[{id:"demo_nolto",show:"nolto",title:"示範",mids,ts:now,end,st:"on",nolto:{audio:"",lyric:"我們一起走過的夜晚 星星都在發光",plays:3},a:{},bets:{},cm:[]},
    {id:"demo_knowing",show:"knowing",title:"示範",mids,ts:now-1,end,st:"on",a:o[0]?{[o[0]]:{q:"我最喜歡的食物是什麼？",ans:"炸雞"}}:{},bets:{},cm:[]},
    {id:"demo_rm",show:"rm",title:"示範",mids,ts:now-2,end,st:"on",a:{},bets:{},cm:[],rm:{round:1,alive:mids.slice(),mv:{},log:[],out:[]}},
    {id:"demo_onetwo",show:"onetwo",title:"示範",mids,ts:now-3,end,st:"on",a:{},bets:{},cm:[],ob:obNew("demo_onetwo",mids,"")}]; return ui.vsDemo; }
const vsGet=id=>vsAll().find(e=>e.id===id);
function vsPut(ep){ if(String(ep.id).startsWith("demo_")){ const D=vsDemo(), i=D.findIndex(x=>x.id===ep.id); if(i>=0) D[i]=ep; return; } const L=S.get(VS_KEY,[])||[], i=L.findIndex(x=>x.id===ep.id); if(i>=0) L[i]=ep; else L.unshift(ep); S.set(VS_KEY,L.slice(0,200)); }
const vsTitle=id=>{ const e=vsGet(id); return e?VSHOW[e.show].name:"綜藝"; };
const vsName=mid=>MEMBERS[mid]?MEMBERS[mid].name:"";
const vsAv=(mid,sz=40)=>{ const m=MEMBERS[mid]; if(!m) return ""; const u=mPhoto(mid); return `<span class="vs-av" style="--s:${sz}px;background:${grad(m.g||0)}">${u?`<span class="av-img av-bgi" style="background-image:url('${u}')"></span>`:esc((m.name||"?")[0])}</span>`; };
const vsNorm=s=>String(s||"").normalize("NFKC").toLowerCase().replace(/[\s\p{P}\p{S}]/gu,"");
function vsSim(a,b){ a=vsNorm(a); b=vsNorm(b); if(!a||!b) return 0; if(a===b) return 1; const n=a.length, m=b.length; let prev=new Array(m+1).fill(0);
  for(let i=1;i<=n;i++){ const cur=new Array(m+1).fill(0); for(let j=1;j<=m;j++) cur[j]=a[i-1]===b[j-1]?prev[j-1]+1:Math.max(prev[j],cur[j-1]); prev=cur; } return 2*prev[m]/(n+m); }
const vsOk=(g,ans)=>{ const a=vsNorm(g), b=vsNorm(ans); return !!a&&!!b&&(a===b||(b.length>=2&&a.includes(b))||vsSim(a,b)>=.8); };

/* ===== 進度、結果 ===== */
function vsNeed(ep,mid){ if(ep.st!=="on"||!ep.mids.includes(mid)) return false; if(ep.show==="onetwo") return obNeed(ep,mid); const a=(ep.a||{})[mid]||{};
  if(ep.show==="nolto") return !a.txt;
  if(ep.show==="knowing") return !a.q||ep.mids.some(o=>o!==mid&&((ep.a||{})[o]||{}).q&&!((a.g||{})[o]));
  if(ep.show==="rm") return (ep.rm.alive||[]).includes(mid)&&!((ep.rm.mv||{})[ep.rm.round]||{})[mid];
  return false; }
function vsScores(ep){ const S2={}, A=ep.a||{}; ep.mids.forEach(m=>S2[m]=0);
  if(ep.show==="nolto") ep.mids.forEach(m=>{ S2[m]=A[m]&&A[m].txt?Math.round(vsSim(A[m].txt,ep.nolto.lyric)*100):0; });
  if(ep.show==="knowing") ep.mids.forEach(o=>{ const q=A[o]; if(!q||!q.q) return; ep.mids.forEach(g=>{ if(g===o) return; const gs=((A[g]||{}).g||{})[o]; if(gs==null) return; const mk=(q.mark||{})[g]; if(mk!=null?mk:vsOk(gs,q.ans)) S2[g]++; }); });
  if(ep.show==="rm"){ const out=ep.rm.out||[]; ep.mids.forEach(m=>{ const o=out.find(x=>x.mid===m); S2[m]=o?o.r:999; }); }
  return S2; }
function vsRank(ep){ const sc=vsScores(ep); return ep.mids.slice().sort((a,b)=>sc[b]-sc[a]); }
function vsFinish(ep){ if(ep.st!=="on") return ep; if(ep.show==="onetwo"){ obAdvance(ep,true); return obFinish(ep); } const sc=vsScores(ep), rk=vsRank(ep), top=sc[rk[0]];
  let win=rk.filter(m=>sc[m]===top); if(ep.show==="rm"&&(ep.rm.alive||[]).length) win=ep.rm.alive.slice();
  if(ep.show!=="rm"&&!top) win=[];
  const last=rk[rk.length-1], pun=VS_PUN[strHash(ep.id+last)%VS_PUN.length];
  ep.st="done"; ep.res={rank:rk,win,sc,pun:{mid:last,t:pun},at:Date.now()}; return ep; }
/* 時間到、或大家都做完了 → 收工（誰的手機先看到誰收，結果每台算出來都一樣） */
function vsCheck(ep){ if(!ep||ep.st!=="on") return ep; let fin=Date.now()>=ep.end;
  if(ep.show==="nolto") fin=fin||ep.mids.every(m=>((ep.a||{})[m]||{}).txt);
  if(ep.show==="knowing") fin=fin||ep.mids.every(m=>!vsNeed(ep,m));
  if(ep.show==="onetwo"){ if(!fin&&(obAdvance(ep,false)|obTimeUp(ep))) vsPut(ep); fin=fin||ep.ob.r>3; }
  if(ep.show==="rm"){ if(!ep.rm.rt){ ep.rm.rt=ep.ts>1e12?ep.ts:Date.now(); } if(!String(ep.id).startsWith("demo_")&&(ep.rm.alive||[]).length>1&&Date.now()>=ep.rm.rt+RM_ROUND){ vsRmResolve(ep,true); vsPut(ep); }
    if(Date.now()>=ep.end&&(ep.rm.alive||[]).length>1){ /* 時間到還沒分出勝負：活著的一起贏 */ } else fin=fin||(ep.rm.alive||[]).length<=1||!!ep.rm.tie; }
  if(fin){ vsFinish(ep); vsPut(ep); } return ep; }
/* Running Man：大家都選好了就結算這一回合 */
function vsRmResolve(ep,force){ const r=ep.rm, mv=(r.mv||{})[r.round]||{}, alive=r.alive||[];
  if(!force&&!alive.every(m=>mv[m])) return false;
  const out=new Map(); alive.forEach(a=>{ const x=mv[a]; if(!x||!x.t||!alive.includes(x.t)||x.t===a) return; const b=x.t, gb=(mv[b]||{}).g;
    if(gb===a){ if(!out.has(a)) out.set(a,{by:b,c:1}); } else { if(!out.has(b)) out.set(b,{by:a}); } });
  /* 時間到還沒出手：第一次＝躲起來；連續兩回合沒出現＝名牌自動被撕 */
  r.miss=r.miss||{}; alive.forEach(m=>{ if(mv[m]){ r.miss[m]=0; return; } r.miss[m]=(r.miss[m]||0)+1; if(r.miss[m]>=2&&!out.has(m)) out.set(m,{by:null,gone:1}); });
  const log=[]; alive.forEach(m=>{ if(!mv[m]&&r.miss[m]===1) log.push(`${vsName(m)} 沒出現，這回合躲起來了`); });
  out.forEach((o,m)=>{ log.push(o.gone?`${vsName(m)} 連續兩回合沒出現，名牌自動被撕`:`${vsName(o.by)} 撕下了 ${vsName(m)} 的名牌${o.c?"（反撕）":""}`); (r.out=r.out||[]).push({mid:m,r:r.round,by:o.by}); });
  if(!out.size&&!log.length) log.push("這回合沒有人被撕");
  (r.log=r.log||[]).push({r:r.round,t:log}); r.alive=alive.filter(m=>!out.has(m));
  if(!r.alive.length){ r.alive=[...out.keys()].filter(m=>(r.out||[]).some(o=>o.mid===m&&o.r===r.round)); r.out=(r.out||[]).filter(o=>o.r!==r.round); r.log[r.log.length-1].t.push("最後的人同時被撕，一起獲勝"); r.tie=1; }
  r.round++; r.rt=Date.now(); return true; }
const RM_ROUND=12*36e5;   // 每回合 12 小時
const rmLeft=r=>Math.max(0,(r.rt||0)+RM_ROUND-Date.now());

/* ===== 押積分（粉絲） ===== */
function vsBet(id,mid,n){ const ep=vsGet(id); if(!ep||ep.st!=="on") return; const me=myEmail(); if(!me) return; if((ep.bets||{})[me]){ toast("這集你已經押過了"); return; }
  if(points()<n){ toast("積分不夠，先補充積分吧"); return; }
  ask(`押 ${fmt(n)} 積分猜 ${vsName(mid)} 會贏？猜中的人平分全部的積分。`,()=>{ const e=vsGet(id); if(!e||e.st!=="on") return; S.set(K.points,points()-n); (e.bets=e.bets||{})[me]={mid,n,ts:Date.now(),name:ME.name}; vsPut(e); render(); toast("押好了，等結果吧！"); },{ok:"押下去",danger:false}); }
/* 結算：管理員的手機發積分（每筆有固定編號，不會重複發） */
function vsPayAll(){ try{ if(!isAdminAcct()) return; if(HB_ON&&HB.ver[VS_KEY]==null) return; const L=S.get(K.ptGrants,[])||[], have=new Set(L.map(g=>g.id)); let add=0, dirty=false;
  vsAll().forEach(ep0=>{ if(String(ep0.id).startsWith("demo_")) return; const ep=vsCheck(ep0); if(ep.st!=="done"||ep.paid) return; const res=ep.res||{}, win=res.betWin||res.win||[], B=Object.entries(ep.bets||{}), pool=B.reduce((s,[,b])=>s+b.n,0), wp=B.filter(([,b])=>win.includes(b.mid)).reduce((s,[,b])=>s+b.n,0);
    B.forEach(([em,b])=>{ const id=`vs_${ep.id}_${em}`; if(have.has(id)) return; let n=0, why="";
      if(!wp){ n=Math.floor(b.n*(1-VS_CUT)); why=`${VSHOW[ep.show].name}・沒有人猜中，退回（扣 ${VS_CUT*100}%）`; } else if(win.includes(b.mid)){ n=Math.floor(b.n*pool*(1-VS_CUT)/wp); why=`${VSHOW[ep.show].name}・猜中了！`; } else return;
      L.push({id,to:em,n,why,by:"auto",ts:Date.now()}); have.add(id); add++; });
    /* 押注池抽 5%，管理員們平分當薪水 */
    { const cut=Math.floor(pool*VS_CUT), ads=Object.keys(ACCOUNTS).filter(e=>ACCOUNTS[e]&&ACCOUNTS[e].role==="admin"); if(cut>0&&ads.length){ const each=Math.floor(cut/ads.length); ads.forEach(e=>{ const id=`vsh_${ep.id}_${e}`; if(!have.has(id)&&each>0){ L.push({id,to:e,n:each,why:`${VSHOW[ep.show].name}・押注抽成（管理員薪水）`,by:"auto",ts:Date.now()}); have.add(id); add++; } }); } }
    ep.mids.forEach(m=>{ const em=Object.keys(ACCOUNTS).find(e=>ACCOUNTS[e]&&ACCOUNTS[e].member===m); if(!em) return; const id=`vsa_${ep.id}_${m}`; if(have.has(id)) return; const w=win.includes(m);
      L.push({id,to:em,n:w?500:100,why:`${VSHOW[ep.show].name}・${w?"冠軍":"出演費"}`,by:"auto",ts:Date.now()}); have.add(id); add++; });
    ep.paid=Date.now(); vsPut(ep); dirty=true; });
  if(add) S.set(K.ptGrants,L.slice(-2000)); }catch(e){} }
setInterval(vsPayAll,60e3); setTimeout(vsPayAll,12e3);

/* ===== 畫面 ===== */
const vsLeft=ts=>{ const s=Math.max(0,ts-Date.now()), h=Math.floor(s/36e5); return h>=24?`剩 ${Math.floor(h/24)} 天`:h>=1?`剩 ${h} 小時`:`剩 ${Math.max(1,Math.ceil(s/6e4))} 分鐘`; };
function vsCard(ep,base,mid){ const S0=VSHOW[ep.show], need=mid&&vsNeed(ep,mid);
  return `<button class="vs-card" data-a="uniGo" data-v="${base}&id=${ep.id}" style="--vg:${grad(S0.g)}"><span class="vs-logo"><b>${esc(S0.name)}</b><small>${esc(S0.ko)}</small></span>
    <span class="vs-ci"><b>${esc(ep.title)}</b><small>${esc(S0.seg)}・${esc(S0.tip)}</small><span class="vs-avs">${ep.mids.map(m=>vsAv(m,26)).join("")}</span></span>
    <em class="vs-st ${ep.st==="on"?"on":""}">${need?"輪到你":ep.st==="on"?`錄影中・${vsLeft(ep.end)}`:"已播出"}</em></button>`; }
const VS_IC={nolto:"🎤",knowing:"❓",rm:"🏃",onetwo:"🍚"}, VS_CAP={nolto:"🎧 這句到底在唱什麼？！",knowing:"🤔 你真的認識我嗎？",rm:"🏃 名牌保住了嗎？！",onetwo:"🍚 今晚誰睡帳篷？"};
const vsEpRow=(e,base,mid)=>{ const S0=VSHOW[e.show], need=mid&&vsNeed(e,mid), w=e.st!=="on"&&e.res&&e.res.win||[];
  return xvRow({av:VS_IC[e.show]||"🎬",sq:1,avStyle:`background:${grad(S0.g)}`,title:`${esc(S0.name)}・${esc(e.title)}`,sub:`${e.mids.map(vsName).map(esc).join("・")}${e.st!=="on"&&w.length?`<br>冠軍 ${w.map(vsName).map(esc).join("、")}`:""}`,right:need?xvChip("輪到你","w"):e.st==="on"?xvChip(`錄影中・${vsLeft(e.end)}`,"ok"):xvChip("已播出"),attrs:`data-a="uniGo" data-v="${base}&id=${e.id}"`}); };
function vsListHtml(base,mid,eps){ const on=eps.filter(e=>e.st==="on"), done=eps.filter(e=>e.st!=="on"), me=myEmail();
  const feat=(mid&&eps.find(e=>vsNeed(e,mid)))||(mid&&on.find(e=>e.mids.includes(mid)))||on[0]||null;
  let top;
  if(feat){ const S0=VSHOW[feat.show], my=!mid&&(feat.bets||{})[me], B=Object.values(feat.bets||{}), pool=B.reduce((a,b)=>a+b.n,0), need=mid&&vsNeed(feat,mid);
    top=xvHero({tone:"p",tag:need?"輪到你":mid&&feat.mids.includes(mid)?"你是來賓":"● 錄影中",small:`${esc(S0.name)}・${esc(feat.title)}`,title:esc(S0.tip),meta:`${feat.mids.map(vsName).map(esc).join(" vs ")}${mid&&feat.mids.includes(mid)?"・冠軍 +500":""}`,
      cd:[...xvCd(feat.end),...(!mid?[[my?fmt(my.n):"—",my?`我押了 ${esc(vsName(my.mid))}`:`獎金池 ${fmt(pool)}`,2]]:[])],btns:[[mid&&feat.mids.includes(mid)?"進入錄影":"去看看",`data-a="uniGo" data-v="${base}&id=${feat.id}"`]]});
    if(!mid&&feat.mids.length){ top+=xvSh("這集誰會贏",`押注總額 ${fmt(pool)}`)+feat.mids.map(m=>{ const n=B.filter(b=>b.mid===m).reduce((a,b)=>a+b.n,0), pc=pool?Math.round(n/pool*100):0; return xvRow({av:vsAv(m,40),avStyle:"background:none",title:`${esc(vsName(m))}<span class="xv-bar"><i style="width:${pc}%"></i></span>`,right:xvChip(`${pc}%`,my&&my.mid===m?"on":""),attrs:`data-a="uniGo" data-v="${base}&id=${feat.id}"`}); }).join(""); } }
  else top=xvHero({tone:"p",small:"VARIETY",title:mid?"還沒有節目邀請":"目前沒有錄影中的節目",meta:mid?"公司開節目時會邀請你上，出演 +100、冠軍 +500":"藝人上綜藝時，可以押積分猜誰贏、留言應援"});
  const stats=mid?(()=>{ const my=eps.filter(e=>e.mids.includes(mid)), w=my.filter(e=>e.st!=="on"&&e.res&&(e.res.win||[]).includes(mid)).length, fan=feat&&feat.mids.includes(mid)?Object.values(feat.bets||{}).filter(b=>b.mid===mid).length:0; return xvStats([[my.length,"出演"],[w,"冠軍"],[fan,"粉絲押你"]]); })():"";
  const rest=on.filter(e=>e!==feat);
  return `<main class="page vs xv vs2">${top}${stats}
    ${xvSh("節目")}${xvHow(Object.entries(VSHOW).map(([k,v])=>[VS_IC[k],esc(v.name)]))}
    ${rest.length?xvSh("錄影中",`${rest.length} 集`)+rest.map(e=>vsEpRow(e,base,mid)).join(""):""}
    ${done.length?xvSh("已播出",`${done.length} 集`)+done.slice(0,12).map(e=>vsEpRow(e,base,mid)).join(""):""}</main>`; }
function vsHero(ep){ const S0=VSHOW[ep.show]; return `<section class="xv-hero p vs2-hero" style="background:linear-gradient(160deg,${GRADS[S0.g%GRADS.length].join(",")})"><span class="xv-tag">${ep.st==="on"?`● 錄影中・${vsLeft(ep.end)}`:"已播出"}</span><small>${esc(S0.name)}・${esc(S0.ko)}</small><h2>${esc(ep.title)}</h2><p>${esc(S0.seg)}・${esc(S0.tip)}</p>
  <span class="vs2-cap">${VS_CAP[ep.show]||""}</span><div class="vs-cast">${ep.mids.map(m=>`<span>${vsAv(m,46)}<small>${esc(vsName(m))}</small></span>`).join("")}</div></section>`; }
/* 押注結果：看已播出的集數時跳一次結算卡（每台手機每集一次） */
function vsBetPop(ep){ try{ const me=myEmail(), my=(ep.bets||{})[me]; if(ep.st==="on"||!my||!ep.res) return; const k="hc_vs_seen", seen=JSON.parse(localStorage.getItem(k)||"{}"); if(seen[ep.id]) return; seen[ep.id]=1; localStorage.setItem(k,JSON.stringify(seen));
  const win=(ep.res.betWin||ep.res.win||[]).includes(my.mid), B=Object.values(ep.bets||{}), pool=B.reduce((a,b)=>a+b.n,0), wp=B.filter(b=>(ep.res.betWin||ep.res.win||[]).includes(b.mid)).reduce((a,b)=>a+b.n,0), back=win&&wp?Math.floor(pool*(1-VS_CUT)*my.n/wp):0, S0=VSHOW[ep.show];
  setTimeout(()=>xvResult({tone:"p",small:`${S0.name} ${ep.title}・冠軍 ${(ep.res.win||[]).map(vsName).join("、")}`,title:win?"你押中了！":"這次沒猜中",big:win?`+${fmt(Math.max(0,back-my.n))}`:`−${fmt(my.n)}`,chips:[`押 ${fmt(my.n)} 在 ${vsName(my.mid)}`,...(win?[`拿回 ${fmt(back)}`]:[])],share:win?`data-a="vsShare" data-id="${ep.id}"`:""}),400); }catch(e){} }
function vsResult(ep){ if(ep.st!=="done"||!ep.res) return ""; if(ep.show==="onetwo") return obResult(ep); const r=ep.res, unit=ep.show==="nolto"?"%":ep.show==="knowing"?" 題":"";
  return `<section class="card vs-res"><h3>結果</h3>${r.rank.map((m,i)=>`<div class="vs-rr ${r.win.includes(m)?"win":""}"><em>${r.win.includes(m)?"👑":i+1}</em>${vsAv(m,32)}<b>${esc(vsName(m))}</b><span>${ep.show==="rm"?(r.win.includes(m)?"存活":`第 ${r.sc[m]} 回合出局`):fmt(r.sc[m])+unit}</span></div>`).join("")}
    ${r.pun&&MEMBERS[r.pun.mid]?`<div class="vs-pun"><b>懲罰・${esc(vsName(r.pun.mid))}</b><p>${esc(r.pun.t)}</p></div>`:""}</section>`; }
/* 各節目的內容：who＝自己是來賓的藝人 id（粉絲是空的） */
function vsBody(ep,who){ const A=ep.a||{}, on=ep.st==="on", me=who&&ep.mids.includes(who)?who:null; if(ep.show==="onetwo") return obBody(ep,me);
  if(ep.show==="nolto"){ const mine=me&&A[me]||{}, left=(ep.nolto.plays||3)-(mine.plays||0);
    return `<section class="card vs-sec"><h3>받아쓰기</h3>
      ${me&&on?(mine.txt?`<p class="vs-wait">已交出答案，等其他人</p><div class="vs-ans"><p>${esc(mine.txt)}</p></div>`:`<button class="btn btn-main btn-block" data-a="vsPlay" data-id="${ep.id}" ${left>0?"":"disabled"}>▶ 播放這段歌（剩 ${Math.max(0,left)} 次）</button>
        <textarea id="vsTxt" class="vs-ta" rows="4" placeholder="輸入文字">${esc(ui.vsTxt&&ui.vsTxt[ep.id]||"")}</textarea><button class="btn btn-soft btn-block" data-a="vsSubmit" data-id="${ep.id}">交出答案</button>`)
      :on?ep.mids.map(m=>`<div class="vs-rr">${vsAv(m,28)}<b>${esc(vsName(m))}</b><span>${(A[m]||{}).txt?"已作答 ✓":"聽歌中…"}</span></div>`).join("")
      :`<button class="btn btn-soft btn-block" data-a="vsPlay" data-id="${ep.id}">▶ 聽題目</button><div class="vs-lyr"><small>正確歌詞</small><p>${esc(ep.nolto.lyric)}</p></div>${ep.mids.map(m=>`<div class="vs-ans"><b>${esc(vsName(m))}・${fmt(ep.res.sc[m]||0)}%</b><p>${esc((A[m]||{}).txt||"（沒有作答）")}</p></div>`).join("")}`}</section>`; }
  if(ep.show==="knowing"){ const qs=ep.mids.filter(o=>(A[o]||{}).q);
    return `<section class="card vs-sec"><h3>나를 맞혀봐</h3>
      ${me&&on&&!(A[me]||{}).q?`<p class="vs-wait">先出一題關於自己的題目</p><input id="vsQ" class="vs-in" maxlength="80" placeholder="輸入文字"><input id="vsAns" class="vs-in" maxlength="40" placeholder="輸入文字"><button class="btn btn-main btn-block" data-a="vsQSet" data-id="${ep.id}">出題</button>`:""}
      ${qs.length?qs.map(o=>{ const q=A[o], my=me&&((A[me]||{}).g||{})[o];
        return `<div class="vs-q"><div class="vs-qh">${vsAv(o,30)}<b>${esc(vsName(o))}</b></div><p class="vs-qt">${esc(q.q)}</p>
          ${on&&me&&me!==o?(my!=null?`<small class="vs-wait">你的答案：${esc(my)}</small>`:`<span class="vs-gr"><input id="vsG_${o}" class="vs-in" maxlength="40" placeholder="輸入文字"><button class="btn btn-soft btn-sm" data-a="vsGuess" data-id="${ep.id}" data-v="${o}">回答</button></span>`):""}
          ${on&&me===o?`<small class="vs-wait">答案：${esc(q.ans)}</small>${ep.mids.filter(g=>g!==o&&((A[g]||{}).g||{})[o]!=null).map(g=>{ const gs=A[g].g[o], mk=(q.mark||{})[g], ok=mk!=null?mk:vsOk(gs,q.ans); return `<div class="vs-gl"><b>${esc(vsName(g))}</b><span>${esc(gs)}</span><button class="vs-mk ${ok?"ok":""}" data-a="vsMark" data-id="${ep.id}" data-v="${g}">${ok?"⭕":"❌"}</button></div>`; }).join("")}`:""}
          ${!on?`<small class="vs-wait">答案：${esc(q.ans)}</small>${ep.mids.filter(g=>g!==o).map(g=>{ const gs=((A[g]||{}).g||{})[o], mk=(q.mark||{})[g], ok=gs!=null&&(mk!=null?mk:vsOk(gs,q.ans)); return `<div class="vs-gl"><b>${esc(vsName(g))}</b><span>${esc(gs==null?"—":gs)}</span><i>${ok?"⭕":"❌"}</i></div>`; }).join("")}`:""}</div>`; }).join(""):`<p class="vs-wait">還沒有人出題</p>`}</section>`; }
  if(ep.show==="rm"){ const r=ep.rm, alive=r.alive||[], mv=(r.mv||{})[r.round]||{}, mine=me&&mv[me], d=ui.vsRm||{};
    return `<section class="card vs-sec"><h3>이름표 떼기・第 ${r.round} 回合</h3>${on&&r.rt?`<p class="vs-dl">⏱ 這回合還剩 ${Math.floor(rmLeft(r)/36e5)} 小時 ${Math.floor(rmLeft(r)%36e5/6e4)} 分</p>`:""}
      <div class="vs-tags">${ep.mids.map(m=>{ const o=(r.out||[]).find(x=>x.mid===m); return `<span class="vs-tag ${o?"out":""}">${vsAv(m,40)}<b>${esc(vsName(m))}</b>${o?`<em>撕</em>`:on?`<small>${mv[m]?"已出手":"考慮中"}</small>`:""}</span>`; }).join("")}</div>
      ${on&&me&&alive.includes(me)?(mine?`<p class="vs-wait">已出手，等其他人</p>`:`<p class="vs-lab">要撕誰的名牌？</p><div class="vs-pick">${alive.filter(m=>m!==me).map(m=>`<button class="${d.t===m?"on":""}" data-a="vsRmT" data-v="${m}">${esc(vsName(m))}</button>`).join("")}</div>
        <p class="vs-lab">要防誰？（他來撕你會被反撕）</p><div class="vs-pick">${alive.filter(m=>m!==me).map(m=>`<button class="${d.g===m?"on":""}" data-a="vsRmG" data-v="${m}">${esc(vsName(m))}</button>`).join("")}</div>
        <button class="btn btn-main btn-block" data-a="vsRmGo" data-id="${ep.id}" ${d.t&&d.g?"":"disabled"}>出手</button>`):on&&me?`<p class="vs-wait">你已經出局了</p>`:""}
      ${(r.log||[]).length?`<div class="vs-log">${r.log.slice().reverse().map(l=>`<div><b>第 ${l.r} 回合</b>${l.t.map(x=>`<p>${esc(x)}</p>`).join("")}</div>`).join("")}</div>`:""}</section>`; }
  return ""; }
function vsBetHtml(ep){ const me=myEmail(), my=(ep.bets||{})[me], B=Object.values(ep.bets||{}), pool=B.reduce((s,b)=>s+b.n,0);
  if(ep.st!=="on") return my?`<section class="card vs-sec"><h3>你的預測</h3><p class="vs-wait">押 ${fmt(my.n)} 積分在 ${esc(vsName(my.mid))}・${(ep.res&&(ep.res.betWin||ep.res.win)||[]).includes(my.mid)?"猜中了！":"沒猜中"}</p></section>`:"";
  const d=ui.vsBet||{};
  return `<section class="card vs-sec"><h3>${ep.show==="onetwo"?"猜誰睡帳篷":"猜誰會贏"}<small>獎金池 ${fmt(pool)}</small></h3>${my?`<p class="vs-wait">你押了 ${fmt(my.n)} 積分在 ${esc(vsName(my.mid))}</p>`:`
    <div class="vs-pick">${ep.mids.map(m=>`<button class="${d.mid===m?"on":""}" data-a="vsBetM" data-v="${m}">${vsAv(m,22)}${esc(vsName(m))}<small>${fmt(B.filter(b=>b.mid===m).reduce((s,b)=>s+b.n,0))}</small></button>`).join("")}</div>
    <div class="vs-pick amt">${VS_BETS.map(n=>`<button class="${d.n===n?"on":""}" data-a="vsBetN" data-v="${n}">${fmt(n)}</button>`).join("")}</div>
    <button class="btn btn-main btn-block" data-a="vsBetGo" data-id="${ep.id}" ${d.mid&&d.n?"":"disabled"}>押積分（你有 ${fmt(points())}）</button>`}</section>`; }
function vsCmHtml(ep){ const L=ep.cm||[], me=myEmail(), mm=(session()||{}).role==="artist"?(session()||{}).member:"";
  return `<section class="card vs-sec"><h3>留言<small>${fmt(L.length)}</small></h3><form class="vs-cf" id="vsCmForm" data-id="${ep.id}"><textarea rows="1" class="ag" id="vsCmIn" maxlength="200" placeholder="輸入文字" autocomplete="off"></textarea><button type="submit">發佈</button></form>
    ${L.slice().reverse().slice(0,80).map(c=>`<div class="vs-cm">${c.mid?vsAv(c.mid,28):`<span class="vs-av" style="--s:28px;background:${grad(strHash(c.by)%6)}">${esc((c.name||"?")[0])}</span>`}<p><b>${esc(c.mid?vsName(c.mid):c.name)}</b>${c.by===me||c.mid&&c.mid===mm?esc(c.text):trT("vs:"+c.id,c.text,"","span")}<small>${snsAgo(c.ts)}</small></p>${c.by===me||isAdminAcct()?`<button data-a="vsCmDel" data-id="${ep.id}" data-v="${c.id}" aria-label="刪除">×</button>`:""}</div>`).join("")}</section>`; }
function viewShowFan(id){ if(id){ const ep=vsCheck(vsGet(id)); if(!ep) return `<main class="page vs"><div class="vs-none"><b>這集已下架</b></div></main>`; vsBetPop(ep); return `<main class="page vs">${vsHero(ep)}${vsResult(ep)}${vsBetHtml(ep)}${vsBody(ep,null)}${vsCmHtml(ep)}</main>`; }
  const f=followed(); return vsListHtml("#/fan/core?p=show",null,vsAll().map(vsCheck).sort((a,b)=>(b.st==="on")-(a.st==="on")||b.ts-a.ts).sort((a,b)=>(b.mids.some(m=>MEMBERS[m]&&f.includes(MEMBERS[m].group))-a.mids.some(m=>MEMBERS[m]&&f.includes(MEMBERS[m].group))))); }
function viewShowArtist(mid,id){ if(id){ const ep=vsCheck(vsGet(id)); if(!ep) return `<main class="page vs"><div class="vs-none"><b>這集已下架</b></div></main>`; return `<main class="page vs">${vsHero(ep)}${vsResult(ep)}${vsBody(ep,mid)}${vsCmHtml(ep)}</main>`; }
  const E=vsAll().map(vsCheck), mine=E.filter(e=>e.mids.includes(mid)), other=E.filter(e=>!e.mids.includes(mid));
  return vsListHtml("#/artist?tab=foc&p=show",mid,[...mine,...other].sort((a,b)=>(b.st==="on")-(a.st==="on")||b.ts-a.ts)); }
const vsArtTodo=mid=>vsAll().some(e=>vsNeed(vsCheck(e),mid));
const vsArtSub=mid=>{ if(vsArtTodo(mid)) return "● 輪到你了"; const n=vsAll().filter(e=>e.st==="on"&&e.mids.includes(mid)).length; return n?`${n} 集錄影中`:"等節目邀請"; };
const vsFanSub=()=>{ const n=vsAll().filter(e=>e.st==="on").length; return n?`${n} 集錄影中`:"看藝人上綜藝"; };

/* ===== 管理員：開一集 ===== */
function vsAdminHtml(){ const d=ui.vsD||(ui.vsD={show:"nolto",mids:[],days:3,plays:3}), S0=VSHOW[d.show], AM=Object.keys(MEMBERS).filter(m=>!MEMBERS[m].official&&groupOf(MEMBERS[m].group));
  const n=vsAll().filter(e=>e.show===d.show).length+1, E=vsAll();
  const O=E.filter(e=>e.st==="on"), D=E.filter(e=>e.st!=="on"), cur=xvSegCur("vs","on"), L=cur==="on"?O:D;
  const rows=L.map(e=>`<section class="tr2-c">${xvRow({av:VS_IC[e.show]||"🎬",sq:1,avStyle:`background:${grad(VSHOW[e.show].g)}`,title:`${esc(VSHOW[e.show].name)}・${esc(e.title)}`,sub:`${e.mids.map(vsName).map(esc).join("・")}${e.st==="on"&&e.show==="rm"?`・第 ${e.rm.round} 回合`:""}`,right:e.st==="on"?xvChip(`錄影中・${vsLeft(e.end)}`,"ok"):xvChip("已播出")})}
      <div class="tr2-b">${e.st==="on"?`${e.show==="rm"?`<button class="xv-bt g" data-a="vsRmForce" data-id="${e.id}">結算回合</button>`:""}<button class="xv-bt g" data-a="vsEnd" data-id="${e.id}">收工公布</button>`:""}<button class="xv-bt g" data-a="vsDel" data-id="${e.id}">刪除</button></div></section>`).join("");
  return `<div class="xv vs2">${xvStats([[O.length,"錄影中"],[D.length,"已播出"],[E.reduce((a,e)=>a+Object.keys(e.bets||{}).length,0),"押注人次"]])}
    <div style="margin-top:12px">${xvSeg("vs",[["on",`錄影中 ${O.length}`],["done",`已播出 ${D.length}`]],cur)}</div>
    <div style="margin-top:12px">${rows||xvEmpty(cur==="on"?"沒有錄影中的節目":"還沒有播出的節目")}</div>
    ${ui.vsAddOpen?"":xvAdd("開一集綜藝",`data-a="vsAddOpen"`)}
    ${xvSh("四個節目")}${Object.entries(VSHOW).map(([k,v])=>xvRow({av:VS_IC[k],sq:1,avStyle:`background:${grad(v.g)}`,title:esc(v.name),sub:`${esc(v.seg)}・${esc(v.tip)}・${E.filter(e=>e.show===k).length} 集`})).join("")}</div>
  ${ui.vsAddOpen?`<section class="card studio vs-adm"><div class="foc-cfg-h"><h3>開一集綜藝</h3><button class="xv-bt g" data-a="vsAddOpen">收起</button></div>
    <div class="chips wrap">${Object.entries(VSHOW).map(([k,v])=>`<button class="chip ${d.show===k?"on":""}" data-a="vsDShow" data-v="${k}">${esc(v.name)}</button>`).join("")}</div>
    <label class="foc-lab">標題</label><label class="field"><input id="vsDTitle" value="${esc(d.title||`EP.${n}`)}" placeholder="輸入文字"></label>
    <label class="foc-lab">來賓（已出道藝人）<span class="muted">${d.mids.length} 位</span></label>
    <div class="chips wrap">${AM.map(m=>`<button class="chip ${d.mids.includes(m)?"on":""}" data-a="vsDMid" data-v="${m}">${esc(vsName(m))}<small class="muted"> ${esc((groupOf(MEMBERS[m].group)||{}).name||"")}</small></button>`).join("")}</div>
    <label class="foc-lab">錄影時間</label><div class="chips">${[1,2,3,5,7].map(x=>`<button class="chip ${d.days===x?"on":""}" data-a="vsDDays" data-v="${x}">${x} 天</button>`).join("")}</div>
    ${d.show==="onetwo"?`<label class="foc-lab">PD 的開場台詞</label><label class="field"><input id="vsDPd" value="${esc(d.pd||"")}" placeholder="輸入文字"></label>`:""}
    ${d.show==="nolto"?`<label class="foc-lab">題目音檔</label><label class="vs2-file">🎵<span id="vsAudN">${d.audN?esc(d.audN):"選一段歌（音檔或影片）"}</span><b>選擇</b><input type="file" accept="audio/*,video/*" id="vsAud"></label>
      <label class="foc-lab">正確歌詞</label><textarea id="vsLyr" class="vs-ta" rows="4" placeholder="輸入文字">${esc(d.lyric||"")}</textarea>
      <label class="foc-lab">每人可以聽幾次</label><div class="chips">${[1,2,3,5].map(x=>`<button class="chip ${d.plays===x?"on":""}" data-a="vsDPlays" data-v="${x}">${x} 次</button>`).join("")}</div>`:""}
    <button class="btn btn-main btn-block" data-a="vsDGo">開錄（通知來賓）</button></section>
`:""}`; }
/* ===== 點擊 ===== */
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a; if(!/^vs/.test(a)) return;
  const rr=()=>{ const y=window.scrollY; render(); window.scrollTo(0,y); };
  switch(a){
    case "vsDShow": ui.vsD.show=t.dataset.v; ui.vsD.title=""; rr(); break;
    case "vsDMid": { const L=ui.vsD.mids, i=L.indexOf(t.dataset.v); if(i>=0) L.splice(i,1); else if(L.length>=8) toast("一集最多 8 位"); else L.push(t.dataset.v); ui.vsD.title=(document.getElementById("vsDTitle")||{}).value; vsKeepD(); rr(); break; }
    case "vsDDays": ui.vsD.days=+t.dataset.v; vsKeepD(); rr(); break;
    case "vsDPlays": ui.vsD.plays=+t.dataset.v; vsKeepD(); rr(); break;
    case "vsDGo": { vsKeepD(); const d=ui.vsD; if(d.mids.length<2){ toast("至少要 2 位來賓"); break; }
      if(d.show==="nolto"&&(!d.aud||!(d.lyric||"").trim())){ toast("要放題目音檔和正確歌詞"); break; }
      const id="vs"+Date.now().toString(36), ep={id,show:d.show,title:(d.title||"").trim()||"EP",mids:d.mids.slice(),ts:Date.now(),end:Date.now()+d.days*864e5,st:"on",a:{},bets:{},cm:[]};
      if(d.show==="nolto") ep.nolto={audio:d.aud,lyric:d.lyric.trim(),plays:d.plays};
      if(d.show==="rm") ep.rm={round:1,alive:d.mids.slice(),mv:{},log:[],out:[]};
      if(d.show==="onetwo") ep.ob=obNew(id,d.mids,(d.pd||"").trim());
      vsPut(ep);
      ui.vsD={show:d.show,mids:[],days:d.days,plays:d.plays}; render(); toast("開錄了！來賓的 FOC 會出現「輪到你了」"); break; }
    case "vsEnd": { const id=t.dataset.id; ask("現在收工，直接公布結果？",()=>{ const ep=vsGet(id); if(!ep) return; if(ep.show==="rm"&&ep.rm.alive.length>1){ /* 活著的一起贏 */ } vsFinish(ep); vsPut(ep); vsPayAll(); render(); }); break; }
    case "vsDel": { const id=t.dataset.id; ask("刪除這集？押的積分會退回。",()=>{ const ep=vsGet(id); if(ep&&ep.st==="on"&&isAdminAcct()){ const L=S.get(K.ptGrants,[])||[]; Object.entries(ep.bets||{}).forEach(([em,b])=>L.push({id:`vsr_${ep.id}_${em}`,to:em,n:b.n,why:"節目取消，退回積分",by:"auto",ts:Date.now()})); S.set(K.ptGrants,L.slice(-2000)); }
      S.set(VS_KEY,(S.get(VS_KEY,[])||[]).filter(x=>x.id!==id)); render(); }); break; }
    case "vsRmForce": { const ep=vsGet(t.dataset.id); if(!ep) break; vsRmResolve(ep,true); vsPut(ep); vsCheck(ep); rr(); break; }
    case "vsPlay": { const ep=vsGet(t.dataset.id); if(!ep) break; const mid=(session()||{}).member, me=ep.st==="on"&&ep.mids.includes(mid)?mid:null;
      if(me){ const A=ep.a=ep.a||{}, x=A[me]=A[me]||{}; if((x.plays||0)>=(ep.nolto.plays||3)){ toast("聽的次數用完了"); break; } x.plays=(x.plays||0)+1; vsPut(ep); }
      if(!ep.nolto.audio){ toast("示範沒有音檔"); rr(); break; } t.disabled=true; mediaSrc(ep.nolto.audio).then(u=>{ if(!u){ toast("音檔讀不到"); t.disabled=false; return; } const au=new Audio(u); au.onended=()=>rr(); au.play().catch(()=>toast("播放失敗")); }); break; }
    case "vsSubmit": { const v=((document.getElementById("vsTxt")||{}).value||"").trim(); if(!v){ toast("先寫下聽到的歌詞"); break; } const ep=vsGet(t.dataset.id), mid=(session()||{}).member; if(!ep||ep.st!=="on"||!ep.mids.includes(mid)) break;
      ask("交出去就不能改了，確定嗎？",()=>{ const e2=vsGet(ep.id); const x=(e2.a=e2.a||{})[mid]=e2.a[mid]||{}; x.txt=v; x.ts=Date.now(); vsPut(e2); vsCheck(e2); rr(); },{danger:false}); break; }
    case "vsQSet": { const q=((document.getElementById("vsQ")||{}).value||"").trim(), an=((document.getElementById("vsAns")||{}).value||"").trim(); if(!q||!an){ toast("題目和答案都要寫"); break; } if(!isAdminAcct()&&(banBlock(q)||banBlock(an))) break;
      const ep=vsGet(t.dataset.id), mid=(session()||{}).member; if(!ep||!ep.mids.includes(mid)) break; const x=(ep.a=ep.a||{})[mid]=ep.a[mid]||{}; x.q=q; x.ans=an; vsPut(ep); rr(); break; }
    case "vsGuess": { const o=t.dataset.v, g=((document.getElementById("vsG_"+o)||{}).value||"").trim(); if(!g){ toast("先寫答案"); break; } const ep=vsGet(t.dataset.id), mid=(session()||{}).member; if(!ep||!ep.mids.includes(mid)) break;
      const x=(ep.a=ep.a||{})[mid]=ep.a[mid]||{}; (x.g=x.g||{})[o]=g; vsPut(ep); vsCheck(ep); rr(); break; }
    case "vsMark": { const ep=vsGet(t.dataset.id), mid=(session()||{}).member; if(!ep) break; const q=(ep.a||{})[mid]; if(!q) break; const g=t.dataset.v, gs=((ep.a[g]||{}).g||{})[mid], cur=(q.mark||{})[g]!=null?q.mark[g]:vsOk(gs,q.ans); (q.mark=q.mark||{})[g]=!cur; vsPut(ep); rr(); break; }
    case "vsRmT": ui.vsRm={...(ui.vsRm||{}),t:t.dataset.v}; rr(); break;
    case "vsRmG": ui.vsRm={...(ui.vsRm||{}),g:t.dataset.v}; rr(); break;
    case "vsRmGo": { const ep=vsGet(t.dataset.id), mid=(session()||{}).member, d=ui.vsRm||{}; if(!ep||ep.st!=="on"||!ep.rm.alive.includes(mid)||!d.t||!d.g) break;
      const mv=ep.rm.mv=ep.rm.mv||{}; (mv[ep.rm.round]=mv[ep.rm.round]||{})[mid]={t:d.t,g:d.g,ts:Date.now()}; ui.vsRm=null; vsRmResolve(ep,false); vsPut(ep); vsCheck(ep); rr(); toast("出手了！"); break; }
    case "vsBetM": ui.vsBet={...(ui.vsBet||{}),mid:t.dataset.v}; rr(); break;
    case "vsBetN": ui.vsBet={...(ui.vsBet||{}),n:+t.dataset.v}; rr(); break;
    case "vsBetGo": { const d=ui.vsBet||{}; if(d.mid&&d.n) vsBet(t.dataset.id,d.mid,d.n); ui.vsBet=null; break; }
    case "vsCmDel": { const ep=vsGet(t.dataset.id); if(!ep) break; ep.cm=(ep.cm||[]).filter(c=>c.id!==t.dataset.v); vsPut(ep); rr(); break; }
  } });
function vsKeepD(){ const d=ui.vsD; if(!d) return; const ti=document.getElementById("vsDTitle"), ly=document.getElementById("vsLyr"), pd=document.getElementById("vsDPd"); if(ti) d.title=ti.value; if(ly) d.lyric=ly.value; if(pd) d.pd=pd.value; }
document.addEventListener("input",e=>{ if(e.target.id==="vsTxt"){ const m=location.hash.match(/id=([^&]+)/); if(m) (ui.vsTxt=ui.vsTxt||{})[decodeURIComponent(m[1])]=e.target.value; } if(e.target.id==="vsLyr"||e.target.id==="vsDTitle"||e.target.id==="vsDPd") vsKeepD(); });
document.addEventListener("change",async e=>{ if(e.target.id!=="vsAud") return; const f=e.target.files&&e.target.files[0]; if(!f||!ui.vsD) return; if(f.size>15*1024*1024){ toast("音檔太大，剪短一點（15MB 以內）"); return; } const id="vsa"+Date.now(); await MDB.put(id,f.slice(0,f.size,f.type||"audio/mpeg")); ui.vsD.aud=id; ui.vsD.audN=f.name; const n=document.getElementById("vsAudN"); if(n) n.textContent=f.name; });
document.addEventListener("submit",e=>{ if(e.target.id!=="vsCmForm") return; e.preventDefault(); const inp=document.getElementById("vsCmIn"), v=(inp&&inp.value||"").trim(); if(!v) return; if(!isAdminAcct()&&banBlock(v)) return;
  const ep=vsGet(e.target.dataset.id); if(!ep) return; const s=session()||{}, mid=s.role==="artist"&&MEMBERS[s.member]?s.member:"";
  (ep.cm=ep.cm||[]).push({id:"c"+Date.now().toString(36),by:myEmail(),name:ME.name,mid,text:v,ts:Date.now()}); ep.cm=ep.cm.slice(-300); vsPut(ep); inp.value=""; fanEarn("vscm",10,{cap:50,why:"綜藝留言應援"}); const y=window.scrollY; render(); window.scrollTo(0,y); });
/* ===== 試玩模式：開關、畫面最上方的提示 ===== */
document.addEventListener("click",e=>{ const t=e.target.closest('[data-a="sbxT"],[data-a="sbxOff"]'); if(!t) return;
  if(sbxOn()){ ask("結束試玩？剛剛玩的東西都會清掉，換回真正的資料。",()=>sbxOff(),{ok:"結束試玩",danger:false}); return; }
  ask("開始試玩？\n所有東西只在這支手機上，不會上傳、不會影響其他人。積分給你 999,999 讓你隨便玩。",()=>{ sbxStart(); ui.vsDemo=null; ui.bzDemo=null; S.set(K.points,999999); sbxPill(); render(); toast("試玩開始 🎮"); },{ok:"開始",danger:false}); });
function sbxPill(){ const on=sbxOn(), el=document.getElementById("sbxPill"); if(on&&!el) document.body.insertAdjacentHTML("beforeend",`<button id="sbxPill" data-a="sbxOff">🎮 試玩中・不影響其他人<b>結束</b></button>`); else if(!on&&el) el.remove(); }
setInterval(sbxPill,1500); setTimeout(sbxPill,800);

/* =========================================================
   星探（SNS 官方帳號 haechu.scout）＋ 廣告代言・雜誌拍攝
   星探：素人在 LINE 記事本「星探看板」留言 → 管理員把他的 SNS 帳號加進名單
        → 管理員的手機每 10 分鐘看一次，達到條件就由星探帳號私訊他、在他最新的貼文留言
        已簽公司（管理員勾選）、已出道的人不會被挖
   代言・雜誌：管理員發邀約 → 藝人接下、上傳照片和文字 → 粉絲看、按讚；雜誌要用積分買
   ========================================================= */
const SC_KEY="daisuki_scout";
const SC_DEF={days:14,posts:3,fol:5,likes:3,msg:"您好！我們是 {公司} 星探 ✨\n一直有在關注你的 SNS，覺得你很有魅力。\n有興趣聊聊出道的可能嗎？期待你的回覆！"};
const scGet=()=>{ const v=S.get(SC_KEY,null)||{}; return {list:v.list||[],cfg:{...SC_DEF,...(v.cfg||{})},picked:v.picked||{},by:v.by||{},accs:v.accs||[]}; };
/* 星探帳號：每間公司可以有好幾個，管理員自己新增（帳號名稱、頭貼、自我介紹）；挖人時自動輪流派一個出去 */
const SK_COS=["HYBE","SM","JYP","YG","PAPERMOON","BLUE HOUR","DOLPUNG Lab."];
const scAcc=id=>scGet().accs.find(a=>a.id===id)||null;
const scWho=(sc,uid)=>sc.by[uid]&&(sc.by[uid]==="o:scout"||sc.accs.some(a=>a.id===sc.by[uid]))?sc.by[uid]:"o:scout";
function scNext(sc){ const A=sc.accs; if(!A.length) return "o:scout"; const n={}; Object.values(sc.by).forEach(v=>n[v]=(n[v]||0)+1); const min=Math.min(...A.map(a=>n[a.id]||0)), C=A.filter(a=>(n[a.id]||0)===min); return C[Math.floor(Math.random()*C.length)].id; }   /* 派最少出過任務的那幾個裡隨機一個 */
const scSet=v=>S.set(SC_KEY,v);
const scArtist=uid=>{ const e=uid.slice(2), a=ACCOUNTS[e]; return !!(a&&a.member&&MEMBERS[a.member]); };
function scStat(d,uid,cfg){ const lim=Date.now()-cfg.days*864e5, P=d.posts.filter(p=>p.uid===uid), recent=P.filter(p=>p.ts>=lim), lk=P.length?P.reduce((s,p)=>s+snLikes(d,p),0)/P.length:0;
  const st={posts:recent.length,fol:snFollowers(d,uid),likes:Math.round(lk*10)/10}; st.ok=st.posts>=cfg.posts&&st.fol>=cfg.fol&&st.likes>=cfg.likes; return st; }
function scPick(uid,sc,d){ const me=scNext(sc); sc.by[uid]=me; const co=(scAcc(me)||sc.accs.find(a=>a.id===me)||{}).co||"HAECHU"; dmAppend(me,uid,{text:String(sc.cfg.msg).split("{公司}").join(co).split("HAECHU 星探").join(co+" 星探"),ts:Date.now(),scout:1});
  const last=d.posts.filter(p=>p.uid===uid).sort((a,b)=>b.ts-a.ts)[0]; if(last){ (d.cms[last.id]=d.cms[last.id]||[]).push({id:"sc"+Date.now(),uid:me,text:"您好，我們注意到你了 ✨ 請查看私訊",ts:Date.now()}); snSave(d); }
  sc.picked[uid]=Date.now(); }
/* 自動挖掘：只在管理員的手機跑（不會重複私訊） */
function scAuto(){ try{ if(!isAdminAcct()) return; if(HB_ON&&HB.ver[SC_KEY]==null&&!Object.keys(HB.ver||{}).length) return; const sc=scGet(); if(!sc.list.length) return; const d=snDB(); let n=0;
  sc.list.forEach(x=>{ if(x.signed||sc.picked[x.uid]||scArtist(x.uid)||!snUser(x.uid)) return; if(scStat(d,x.uid,sc.cfg).ok){ scPick(x.uid,sc,d); n++; } });
  if(n){ scSet(sc); if(route().p==="scout") render(); } }catch(e){} }
setInterval(scAuto,10*60e3); setTimeout(scAuto,15e3);
function snScoutPage(d){ if(!isAdminAcct()) return snProfile(d,"o:scout"); const sc=scGet(), c=sc.cfg, f=ui.scF||"all";
  const rows=sc.list.map(x=>{ const u=snUser(x.uid); if(!u) return null; const s=scStat(d,x.uid,c), pk=sc.picked[x.uid], art=scArtist(x.uid), st=pk?"picked":art?"debut":x.signed?"signed":s.ok?"ok":"watch"; return {x,u,s,pk,st}; }).filter(Boolean);
  const N=k=>rows.filter(r=>r.st===k).length, show=rows.filter(r=>f==="all"||r.st===f);
  const SL={watch:"觀察中",ok:"符合條件",picked:"已挖掘",signed:"已簽公司",debut:"已出道"};
  const bar=(l,v,n)=>`<div class="scx-bar ${v>=n?"ok":""}"><span>${l}</span><i><u style="width:${n?Math.min(100,v/n*100):100}%"></u></i><b>${v}<small>/${n}</small></b></div>`;
  const step=(k,l,v,u)=>`<div class="scx-step"><span>${l}</span><div><button data-a="scStep" data-k="${k}" data-d="-1" aria-label="減少">－</button><b id="scV_${k}">${v}</b><em>${u}</em><button data-a="scStep" data-k="${k}" data-d="1" aria-label="增加">＋</button></div></div>`;
  return `<header class="sn-top"><button class="sn-ib" data-a="back" aria-label="返回">${si("back")}</button><b>星探</b><span class="sn-sp"></span><button class="sn-ib" data-a="snsGo" data-v="profile" data-id="o:scout" aria-label="星探帳號">${si("dots")}</button></header>
  <main class="scx">
    <section class="scx-hero"><span class="scx-av">✦</span><b>haechu.scout${SN_VER}</b><small>尋找下一顆星</small>
      <div class="scx-num"><button class="${f==="all"?"on":""}" data-a="scF" data-v="all"><b>${rows.length}</b>名單</button><button class="${f==="ok"?"on":""}" data-a="scF" data-v="ok"><b>${N("ok")}</b>符合</button><button class="${f==="picked"?"on":""}" data-a="scF" data-v="picked"><b>${N("picked")}</b>已挖掘</button></div></section>
    <section class="scx-card"><h3>星探帳號<button data-a="scAccEd" data-v="">＋ 新增</button></h3>${sc.accs.length?`<div class="scx-accs">${sc.accs.map(a=>`<button data-a="scAccEd" data-v="${a.id}">${snAv(snUser(a.id),52)}<b>${esc(a.u)}</b><small>${esc(a.co||"")}</small></button>`).join("")}</div>`:`<p class="scx-empty">還沒有星探帳號，挖人時會用 haechu.scout</p>`}</section>
    <section class="scx-card"><h3>挖掘條件</h3>${step("days","最近",c.days,"天")}${step("posts","發文至少",c.posts,"則")}${step("fol","粉絲至少",c.fol,"人")}${step("likes","平均讚數至少",c.likes,"個")}</section>
    <section class="scx-card"><h3>星探私訊<button data-a="scMsgEd">${ui.scMsgEd?"完成":"編輯"}</button></h3>
      <div class="scx-dm"><span class="scx-av sm">✦</span>${ui.scMsgEd?`<textarea id="scMsg" rows="5" placeholder="輸入文字">${esc(c.msg)}</textarea>`:`<p>${esc(c.msg).replace(/\n/g,"<br>")}</p>`}</div></section>
    <div class="scx-lh"><b>名單</b><button class="scx-add" data-a="scAddOpen">＋ 加入</button></div>
    <nav class="scx-f">${[["all","全部",rows.length],["watch","觀察中",N("watch")],["ok","符合",N("ok")],["picked","已挖掘",N("picked")],["signed","已簽公司",N("signed")]].map(([k,l,n])=>`<button class="${f===k?"on":""}" data-a="scF" data-v="${k}">${l}<em>${n}</em></button>`).join("")}</nav>
    ${show.length?show.map(({x,u,s,pk,st})=>{ const art=st==="debut"; const who=scWho(sc,x.uid), dm=pk?(S.get(dmKey(who,x.uid),[])||[]):[], open=ui.scOpen===x.uid;
      return `<article class="scx-i ${st}"><div class="scx-ih"><button class="sn-hu" data-a="snsGo" data-v="profile" data-id="${x.uid}">${snAv(u,46)}</button><span class="scx-who"><b>${esc(u.u)}</b><small>${esc(u.name)}</small></span><em class="scx-pill ${st}">${SL[st]}${pk?`・${ymd(pk)}`:""}</em>${pk&&snUser(scWho(sc,x.uid))?`<small class="scx-by">${esc(snUser(scWho(sc,x.uid)).u)}</small>`:""}</div>
        ${st==="debut"?"":`<div class="scx-bars">${bar("發文",s.posts,c.posts)}${bar("粉絲",s.fol,c.fol)}${bar("平均讚",s.likes,c.likes)}</div>`}
        ${x.note?`<p class="scx-note">${esc(x.note)}</p>`:""}
        <div class="scx-act"><button class="${x.signed?"on":""}" data-a="scSigned" data-v="${x.uid}">${x.signed?"✓ 已簽公司":"已簽公司"}</button><button data-a="scNote" data-v="${x.uid}">備註</button>${pk?`<button data-a="scOpen" data-v="${x.uid}">對話${dm.length?` ${dm.length}`:""}</button>`:!art&&!x.signed?`<button class="pri" data-a="scNow" data-v="${x.uid}">挖掘</button>`:""}<button class="x" data-a="scDel" data-v="${x.uid}" aria-label="移除">×</button></div>
        ${pk&&open?`<div class="scx-chat">${dm.slice(-12).map(m=>`<p class="${m.from===who?"me":""}">${m.mid?"📷":esc(m.text||"").replace(/\n/g,"<br>")}</p>`).join("")}<form class="sc-rf" data-v="${x.uid}"><textarea rows="1" class="ag" placeholder="輸入文字" autocomplete="off"></textarea><button type="submit">傳送</button></form></div>`:""}</article>`; }).join(""):`<div class="scx-none"><span class="scx-av">✦</span><b>${rows.length?"這裡沒有人":"名單是空的"}</b>${rows.length?"":`<button class="scx-add" data-a="scAddOpen">＋ 加入第一位</button>`}</div>`}
  </main>`; }
function scAddSheet(){ const sc=scGet(), q=nz((ui.scQ||"").trim()), U=snAllUsers().filter(u=>u.id.startsWith("u:")&&!scArtist(u.id)&&!sc.list.some(x=>x.uid===u.id)&&(!q||nz(u.u).includes(q)||nz(u.name).includes(q))).slice(0,40);
  return `<div class="sn-shw open" data-a="tCloseLayer"><div class="sn-sh" role="dialog" aria-label="加入名單"><i class="sn-grab"></i><b class="sn-sht">加入名單</b><label class="sn-q scx-q">${si("search")}<input id="scQ" placeholder="搜尋" autocomplete="off" value="${esc(ui.scQ||"")}"></label>
    <div class="sn-tpl">${U.map(u=>`<button data-a="scAdd" data-v="${u.id}">${snAv(u,40)}<span><b>${esc(u.u)}</b><small>${esc(u.name)}</small></span><em class="scx-plus">＋</em></button>`).join("")||`<p class="sn-none">找不到</p>`}</div></div></div>`; }
document.addEventListener("input",e=>{ if(e.target.id!=="scQ") return; ui.scQ=e.target.value; const pos=e.target.selectionStart; const w=layer.querySelector(".sn-tpl"); if(w){ const tmp=document.createElement("div"); tmp.innerHTML=scAddSheet(); w.innerHTML=tmp.querySelector(".sn-tpl").innerHTML; } });
document.addEventListener("submit",e=>{ const f=e.target.closest(".sc-rf"); if(!f) return; e.preventDefault(); const i=f.querySelector("textarea,input"), v=(i.value||"").trim(); if(!v||!isAdminAcct()) return; dmAppend(scWho(scGet(),f.dataset.v),f.dataset.v,{text:v,ts:Date.now()}); render(); });

/* ===== 廣告代言・雜誌拍攝 ===== */
const BZ_KEY="daisuki_biz";
const bzAll=()=>(S.get(BZ_KEY,[])||[]).filter(x=>x&&x.id).concat(bzDemo());
function bzDemo(){ if(!demoOn()) return []; if(ui.bzDemo) return ui.bzDemo; const me=demoMid(), now=Date.now();
  if(sbxOn()&&route().role==="fan"&&MEMBERS[me]){ /* 試玩：粉絲端看得到已經拍好的廣告和雜誌 */
    const pic=(id,a,b,txt)=>{ if(!memBlobs[id]){ const c=document.createElement("canvas"); c.width=480; c.height=600; const x=c.getContext("2d"), gr=x.createLinearGradient(0,0,480,600); gr.addColorStop(0,a); gr.addColorStop(1,b); x.fillStyle=gr; x.fillRect(0,0,480,600); x.fillStyle="rgba(255,255,255,.92)"; x.textAlign="center"; x.font="700 44px Georgia,serif"; x.fillText(txt,240,300); MDB.put(id,b64Blob(c.toDataURL("image/jpeg",.85)),true); } return id; };
    ui.bzDemo=[{id:"demo_ad",type:"ad",name:"LUMI Cosmetics",concept:"夏日清透妝感",qs:[],mids:[me],reward:500,price:0,ts:now,end:now+5*864e5,st:"on",ans:{[me]:{st:"ok",img:pic("demo_bz1","#F8C8DC","#A8C8F8","LUMI"),w:4,h:5,text:"讓光，留在你的臉上。",ts:now}},likes:{},buys:{}},
      {id:"demo_mag",type:"mag",name:"VOGUE STAR",issue:"試玩",concept:"冬日星空",qs:["最近的小確幸是什麼？","想對粉絲說的話？"],mids:[me],reward:1000,price:300,ts:now-1,end:now-1000,st:"on",ans:{[me]:{st:"ok",img:pic("demo_bz2","#2B2A4C","#B48CFF","VOGUE"),w:4,h:5,qa:["晚上喝一杯熱可可。","謝謝你們一直都在 💜"],ts:now}},likes:{},buys:{}}]; return ui.bzDemo; }
  ui.bzDemo=[{id:"demo_ad",type:"ad",name:"LUMI Cosmetics",concept:"夏日清透妝感，拍一張像在海邊的照片",qs:[],mids:[me],reward:500,price:0,ts:now,end:now+5*864e5,st:"on",ans:{},likes:{},buys:{}},
    {id:"demo_mag",type:"mag",name:"VOGUE STAR",issue:"示範",concept:"冬日星空",qs:["最近的小確幸是什麼？","想對粉絲說的話？"],mids:[me],reward:1000,price:300,ts:now-1,end:now+5*864e5,st:"on",ans:{},likes:{},buys:{}}]; return ui.bzDemo; }
const bzGet=id=>bzAll().find(x=>x.id===id);
function bzPut(b){ if(String(b.id).startsWith("demo_")){ const D=bzDemo(), i=D.findIndex(x=>x.id===b.id); if(i>=0) D[i]=b; return; } const L=S.get(BZ_KEY,[])||[], i=L.findIndex(x=>x.id===b.id); if(i>=0) L[i]=b; else L.unshift(b); S.set(BZ_KEY,L.slice(0,200)); }
const bzOpen=b=>b.st!=="done"&&Date.now()<b.end;
const bzSubs=b=>b.mids.filter(m=>((b.ans||{})[m]||{}).img);
const bzKind=b=>b.type==="mag"?"雜誌":"代言";
const bzOut=b=>b.type==="ad"||!bzOpen(b);   /* 代言：交了就公開；雜誌：拍攝結束才發售 */
function bzArtTodo(mid){ return bzAll().some(b=>bzOpen(b)&&b.mids.includes(mid)&&!((b.ans||{})[mid]||{}).img&&((b.ans||{})[mid]||{}).st!=="no"); }
const bzArtSub=mid=>bzArtTodo(mid)?"● 有新邀約":`接過 ${bzAll().filter(b=>((b.ans||{})[mid]||{}).img).length} 個`;
const bzFanSub=()=>{ const n=bzAll().filter(b=>b.type==="mag"&&bzOut(b)&&bzSubs(b).length).length, a=bzAll().filter(b=>b.type==="ad"&&bzSubs(b).length).length; return a||n?`${a} 支廣告・${n} 本雜誌`:"藝人的廣告和畫報"; };
/* 交件就發酬勞、雜誌賣出的錢記進營收（管理員的手機發，不會重複） */
function bzPay(){ try{ if(!isAdminAcct()) return; if(HB_ON&&HB.ver[BZ_KEY]==null) return; const L=S.get(K.ptGrants,[])||[], have=new Set(L.map(g=>g.id)); let add=0;
  bzAll().forEach(b=>!String(b.id).startsWith("demo_")&&bzSubs(b).forEach(m=>{ const id=`bz_${b.id}_${m}`; if(have.has(id)) return; const em=Object.keys(ACCOUNTS).find(e=>ACCOUNTS[e]&&ACCOUNTS[e].member===m); if(!em) return;
    L.push({id,to:em,n:b.reward||0,why:`${bzKind(b)}・${b.name}`,by:"auto",ts:Date.now()}); have.add(id); add++; }));
  if(add) S.set(K.ptGrants,L.slice(-2000)); }catch(e){} }
setInterval(bzPay,60e3); setTimeout(bzPay,13e3);
function bzPhoto(b,m,cls=""){ const a=(b.ans||{})[m]||{}; return a.img?`<img class="bz-img ${cls}" data-mid="${a.img}" alt="" style="aspect-ratio:${a.w||4}/${a.h||5}">`:`<span class="bz-img ph ${cls}" style="background:${grad((MEMBERS[m]||{}).g||0)}"></span>`; }
/* 藝人：邀約清單、交件 */
function viewBizArtist(mid,id){ if(id){ const b=bzGet(id); if(!b) return `<main class="page bz"><div class="vs-none"><b>這個邀約已取消</b></div></main>`; const a=(b.ans||{})[mid]||{}, mine=b.mids.includes(mid), dr=ui.bzD&&ui.bzD.id===id?ui.bzD:(ui.bzD={id,img:a.img||"",w:a.w,h:a.h,text:a.text||"",qa:(a.qa||[]).slice()});
    return `<main class="page bz">${bzHero(b)}
      ${mine&&bzOpen(b)&&!a.img&&a.st!=="ok"&&a.st!=="no"?`<section class="card vs-sec"><h3>邀約</h3><p class="bz-con">${esc(b.concept)}</p><p class="vs-wait">酬勞 ${fmt(b.reward)} 積分・${vsLeft(b.end)}</p><div class="bz-two"><button class="btn btn-soft" data-a="bzNo" data-id="${id}">婉拒</button><button class="btn btn-main" data-a="bzOk" data-id="${id}">接下</button></div></section>`:""}
      ${mine&&bzOpen(b)&&a.st==="ok"&&!a.img?`<section class="card vs-sec"><h3>${b.type==="mag"?"畫報拍攝":"廣告拍攝"}</h3><p class="bz-con">${esc(b.concept)}</p>
        <label class="bz-up">${dr.img?`<img class="bz-img" data-mid="${dr.img}" alt="">`:`<span class="bz-upi"><b>＋ 上傳照片</b></span>`}<input type="file" accept="image/*" id="bzPic"></label>
        ${b.type==="ad"?`<label class="foc-lab">廣告文案</label><textarea id="bzTxt" class="vs-ta" rows="3" maxlength="120" placeholder="輸入文字">${esc(dr.text)}</textarea>`
          :(b.qs||[]).map((q,i)=>`<label class="foc-lab">Q. ${esc(q)}</label><textarea class="vs-ta bzQa" data-i="${i}" rows="3" maxlength="300" placeholder="輸入文字">${esc(dr.qa[i]||"")}</textarea>`).join("")}
        <button class="btn btn-main btn-block" data-a="bzSend" data-id="${id}">交件</button></section>`:""}
      ${a.st==="no"?`<p class="vs-wait bz-pad">已婉拒這個邀約</p>`:""}
      ${bzWorks(b,true)}</main>`; }
  const L=bzAll(), mine=L.filter(b=>b.mids.includes(mid)), rest=L.filter(b=>!b.mids.includes(mid)&&bzSubs(b).length&&bzOut(b)), base="#/artist?tab=foc&p=biz";
  const ans=b=>(b.ans||{})[mid]||{}, inv=mine.filter(b=>bzOpen(b)&&!ans(b).st&&!ans(b).img), todo=mine.filter(b=>bzOpen(b)&&ans(b).st==="ok"&&!ans(b).img), done=mine.filter(b=>ans(b).img);
  const f=inv[0]||todo[0];
  const top=f?xvHero({tone:"o",tag:vsLeft(f.end),small:`${inv[0]?"新的邀約":"待交件"}・${f.type==="mag"?"雜誌拍攝":"廣告代言"}`,title:esc(f.name),meta:`概念：${esc(f.concept||"")}・報酬 +${fmt(f.reward||0)}`,btns:inv[0]?[["接下邀約",`data-a="bzOk" data-id="${f.id}"`],["看內容",`data-a="uniGo" data-v="${base}&id=${f.id}"`,1]]:[["去拍攝交件",`data-a="uniGo" data-v="${base}&id=${f.id}"`]]})
    :xvHero({tone:"o",small:"ENDORSEMENT・MAGAZINE",title:"還沒有新的邀約",meta:"公司會邀請你拍廣告或雜誌，交件就拿報酬"});
  const likes=done.filter(b=>b.type==="ad").reduce((n,b)=>n+(((b.likes||{})[mid])||[]).length,0);
  const card=(b,m)=>`<button class="bz2-c" data-a="uniGo" data-v="${base}&id=${b.id}">${bzPhoto(b,m)}<span><b>${esc(b.name)}</b><small>${b.type==="ad"?`♡ ${fmt(((b.likes||{})[m]||[]).length)}`:`${fmt(Object.keys(b.buys||{}).length)} 人購買`}</small></span></button>`;
  return `<main class="page bz xv bz2">${top}${xvStats([[done.filter(b=>b.type==="ad").length,"代言"],[done.filter(b=>b.type==="mag").length,"雜誌"],[fmt(likes),"總按讚"]])}
    ${[...inv.slice(f===inv[0]?1:0),...todo.filter(b=>b!==f)].length?xvSh("待處理")+[...inv.slice(f===inv[0]?1:0),...todo.filter(b=>b!==f)].map(b=>xvRow({av:b.type==="mag"?"📖":"🧴",sq:1,avStyle:"background:var(--s2)",title:`${esc(b.name)}・${bzKind(b)}`,sub:`${ans(b).st==="ok"?"已接下・還沒交件":"等你回覆"}・${vsLeft(b.end)}`,right:xvChip(ans(b).st==="ok"?"製作中":"新邀約",ans(b).st==="ok"?"on":"w"),attrs:`data-a="uniGo" data-v="${base}&id=${b.id}"`})).join(""):""}
    ${done.length?xvSh("我的作品",`${done.length} 個`)+`<div class="xv-g2">${done.map(b=>card(b,mid)).join("")}</div>`:""}
    ${rest.length?xvSh("其他藝人")+`<div class="xv-g2">${rest.slice(0,6).map(b=>card(b,bzSubs(b)[0])).join("")}</div>`:""}</main>`; }
function bzHero(b){ return xvHero({tone:b.type==="mag"?"k":"o",tag:bzOpen(b)?(b.type==="mag"?`拍攝中・${vsLeft(b.end)}`:`進行中・${vsLeft(b.end)}`):b.type==="mag"?"發售中":"已結束",small:b.type==="mag"?`MAGAZINE${b.issue?"・"+esc(b.issue):""}`:"ADVERTISEMENT",title:esc(b.name),meta:`${esc(b.mids.map(vsName).join("・"))}${b.concept?`<br>${esc(b.concept)}`:""}`}); }
function bzCard(b,base,mid){ const sub=bzSubs(b), a=mid&&((b.ans||{})[mid]||{}), need=mid&&bzOpen(b)&&!a.img&&a.st!=="no";
  return `<button class="bz-card" data-a="uniGo" data-v="${base}&id=${b.id}"><span class="bz-cv">${sub.length?bzPhoto(b,sub[0]):`<span class="bz-img ph" style="background:${grad(b.type==="mag"?1:4)}"></span>`}<em>${bzKind(b)}</em></span><span class="bz-ci"><b>${esc(b.name)}</b><small>${esc(b.mids.map(vsName).join("・"))}</small></span><i class="vs-st ${need?"on":""}">${need?"有新邀約":bzOpen(b)?vsLeft(b.end):b.type==="mag"?"發售中":"已結束"}</i></button>`; }
/* 作品：代言＝照片＋文案＋愛心；雜誌＝買了才看得到全部 */
function bzWorks(b,artist){ const sub=bzSubs(b); if(!sub.length) return ""; const me=myId(), own=artist||isAdminAcct(), bought=own||!!(b.buys||{})[me];
  if(b.type==="ad") return `<section class="bz2-ads">${sub.map(m=>{ const a=b.ans[m], L=(b.likes||{})[m]||[]; return `<article class="bz2-st" ${artist?"":`data-dbl="bzLike" data-id="${b.id}" data-v="${m}"`}>${bzPhoto(b,m)}<div class="bz2-sto"><small>${esc(b.name)} × ${esc(vsName(m))}</small>${a.text?`<b>${esc(a.text)}</b>`:""}<div class="bz2-stf"><span>${artist?"":"點兩下按讚 +10"}</span><button class="bz-lk ${L.includes(me)?"on":""}" data-a="bzLike" data-id="${b.id}" data-v="${m}" ${artist?"disabled":""}>${L.includes(me)?"♥":"♡"} ${fmt(L.length)}</button></div></div><i class="bz2-heart">♥</i></article>`; }).join("")}</section>`;
  if(!bzOut(b)&&!own) return "";
  /* 雜誌：封面 → 每位藝人一頁（照片＋專訪）；沒買只能看到封面和第一題，後面變模糊 */
  const pages=[`<div class="bz2-pg bz2-cov">${bzPhoto(b,sub[0])}<div><span>${esc(b.name)}</span><small>${esc(b.issue||"")}</small><b>${esc(sub.map(vsName).join("・"))}</b>${b.concept?`<p>「${esc(b.concept)}」</p>`:""}</div></div>`];
  sub.forEach((m,k)=>{ const a=b.ans[m], qa=(b.qs||[]).map((q,i)=>a.qa&&a.qa[i]?{q,a:a.qa[i]}:null).filter(Boolean);
    if(bought) pages.push(`<div class="bz2-pg bz2-in"><div class="bz2-ph">${bzPhoto(b,m)}</div><h3>${esc(vsName(m))}</h3>${qa.map((x,i)=>`<div class="bz-qa"><b>Q${i+1}. ${esc(x.q)}</b><p>${esc(x.a)}</p></div>`).join("")}</div>`);
    else if(k===0) pages.push(`<div class="bz2-pg bz2-in"><h3>${esc(vsName(m))}</h3>${qa[0]?`<div class="bz-qa"><b>Q1. ${esc(qa[0].q)}</b><p>${esc(qa[0].a)}</p></div>`:""}<div class="bz2-blur">${qa.slice(1).map((x,i)=>`<div class="bz-qa"><b>Q${i+2}. ${esc(x.q)}</b><p>${esc(x.a)}</p></div>`).join("")||`<div class="bz-qa"><b>Q2. ……</b><p>……………………………………</p></div>`}</div>
      <div class="bz2-lock"><b>🔒 後面還有 ${Math.max(1,sub.length*Math.max(1,(b.qs||[]).length)-1)} 段</b><small>解鎖後可以一直看・你有 ${fmt(points())} 積分</small><button class="xv-big" data-a="bzBuy" data-id="${b.id}">${fmt(b.price)} 積分解鎖</button></div></div>`); });
  setTimeout(()=>{ const p=document.querySelector(".bz2-pages"); if(p&&!p.dataset.on){ p.dataset.on="1"; const dots=document.querySelectorAll(".bz2-dot i"); p.addEventListener("scroll",()=>{ const k=Math.round(p.scrollLeft/p.clientWidth); dots.forEach((x,i)=>x.classList.toggle("on",i===k)); },{passive:true}); } },0);
  return `<section class="bz2-mag"><div class="bz2-pages">${pages.join("")}</div><div class="trp-dot bz2-dot">${pages.map((x,i)=>`<i class="${i?"":"on"}"></i>`).join("")}</div><p class="trp-hint">← 左右滑翻頁 →</p></section>`; }
function viewBizFan(id){ if(id){ const b=bzGet(id); if(!b) return `<main class="page bz"><div class="vs-none"><b>找不到</b></div></main>`; return `<main class="page bz xv bz2">${b.type==="mag"&&bzSubs(b).length&&bzOut(b)?"":bzHero(b)}${bzSubs(b).length?"":`<p class="vs-wait bz-pad">拍攝中</p>`}${bzWorks(b,false)}</main>`; }
  const f=followed(), me=myEmail(), L=bzAll().filter(b=>bzSubs(b).length&&bzOut(b)).sort((a,b)=>(b.mids.some(m=>MEMBERS[m]&&f.includes(MEMBERS[m].group))-a.mids.some(m=>MEMBERS[m]&&f.includes(MEMBERS[m].group)))||b.ts-a.ts);
  const soon=bzAll().filter(b=>b.type==="mag"&&!bzOut(b));
  const how=xvSh("可以做什麼")+xvHow([["♡","廣告按讚<br>+10"],["📖","雜誌<br>試閱"],["🔓","積分<br>解鎖全文"],["📚","收進<br>我的雜誌"]]);
  if(!L.length) return `<main class="page bz xv bz2">${xvHero({tone:"k",small:"ENDORSEMENT・MAGAZINE",title:"還沒有廣告和雜誌",meta:"藝人接到代言或雜誌拍攝，交件後就會出現在這裡"})}${how}
    ${soon.length?xvSh("拍攝中的雜誌")+soon.map(b=>xvRow({av:"📖",sq:1,avStyle:"background:var(--s2)",title:esc(b.name),sub:`${esc(b.mids.map(vsName).join("・"))}・${vsLeft(b.end)}後發售`})).join(""):""}</main>`;
  const mag=L.find(b=>b.type==="mag"), cur=xvSegCur("bzf","all"), V=cur==="ad"?L.filter(b=>b.type==="ad"):cur==="mag"?L.filter(b=>b.type==="mag"):L;
  const top=mag?xvHero({tone:"k",tag:"新刊",small:`MAGAZINE${mag.issue?"・"+esc(mag.issue):""}`,title:`${esc(bzSubs(mag).map(vsName).join("・"))} × ${esc(mag.name)}`,meta:mag.concept?`「${esc(mag.concept)}」`:"",btns:(mag.buys||{})[me]||(mag.buys||{})[myId()]?[["翻開來看",`data-a="uniGo" data-v="#/fan/core?p=biz&id=${mag.id}"`]]:[[`${fmt(mag.price)} 積分看全文`,`data-a="bzBuy" data-id="${mag.id}"`],["試閱",`data-a="uniGo" data-v="#/fan/core?p=biz&id=${mag.id}"`,1]]})
    :xvHero({tone:"o",small:"ADVERTISEMENT",title:esc(L[0].name),meta:esc(bzSubs(L[0]).map(vsName).join("・")),btns:[["去看看",`data-a="uniGo" data-v="#/fan/core?p=biz&id=${L[0].id}"`]]});
  const cards=V.flatMap(b=>b.type==="ad"?bzSubs(b).map(m=>({b,m})):[{b,m:bzSubs(b)[0]}]);
  return `<main class="page bz xv bz2">${top}<div style="margin-top:12px">${xvSeg("bzf",[["all","全部"],["ad","廣告代言"],["mag","雜誌"]],cur)}</div>
    ${xvSh("最新","按讚 +10・一天最多 50")}<div class="xv-g2">${cards.map(({b,m})=>`<button class="bz2-c" data-a="uniGo" data-v="#/fan/core?p=biz&id=${b.id}">${bzPhoto(b,m)}<span><b>${esc(b.name)}</b><small>${esc(vsName(m))}・${b.type==="ad"?`♡ ${fmt(((b.likes||{})[m]||[]).length)}`:(b.buys||{})[me]||(b.buys||{})[myId()]?"已解鎖":`${fmt(b.price)} 積分`}</small></span></button>`).join("")||xvEmpty("這裡還沒有東西")}</div>
    ${soon.length?xvSh("拍攝中的雜誌")+soon.map(b=>xvRow({av:"📖",sq:1,avStyle:"background:var(--s2)",title:esc(b.name),sub:`${esc(b.mids.map(vsName).join("・"))}・${vsLeft(b.end)}後發售`})).join(""):""}</main>`; }
/* 管理員：發邀約 */
function bzAdminHtml(){ const d=ui.bzA||(ui.bzA={type:"ad",mids:[],days:5,reward:500,price:300,qs:["","",""]}), AM=Object.keys(MEMBERS).filter(m=>!MEMBERS[m].official&&groupOf(MEMBERS[m].group)), E=bzAll();
  const O=E.filter(b=>bzOpen(b)&&!String(b.id).startsWith("demo_")), D=E.filter(b=>!bzOpen(b)&&!String(b.id).startsWith("demo_")), cur=xvSegCur("bza","on"), L=cur==="on"?O:D;
  const rows=L.map(b=>`<section class="tr2-c">${xvRow({av:b.type==="mag"?"📖":"🧴",sq:1,avStyle:"background:var(--s2)",title:`${esc(b.name)}・${bzKind(b)}`,sub:`${esc(b.mids.map(vsName).join("・"))}・交件 ${bzSubs(b).length}/${b.mids.length}・報酬 ${fmt(b.reward||0)}${b.type==="mag"?`・售價 ${fmt(b.price)}・賣出 ${fmt(Object.keys(b.buys||{}).length)} 本`:""}`,right:bzOpen(b)?xvChip(bzSubs(b).length?"製作中":"等回覆",bzSubs(b).length?"on":"w"):xvChip("已上架","ok")})}
      <div class="tr2-b">${bzOpen(b)?`<button class="xv-bt g" data-a="bzAEnd" data-id="${b.id}">結束</button>`:""}<button class="xv-bt g" data-a="bzADel" data-id="${b.id}">刪除</button></div></section>`).join("");
  return `<div class="xv bz2">${xvStats([[O.length,"邀約中"],[D.length,"已結束"],[fmt(E.reduce((n,b)=>n+Object.keys(b.buys||{}).length,0)),"雜誌賣出"]])}
    <div style="margin-top:12px">${xvSeg("bza",[["on",`邀約中 ${O.length}`],["done",`已結束 ${D.length}`]],cur)}</div>
    <div style="margin-top:12px">${rows||xvEmpty(cur==="on"?"沒有進行中的邀約":"還沒有結束的邀約")}</div>
    ${ui.bzAddOpen?"":xvAdd("發邀約",`data-a="bzAddOpen"`)}</div>
  ${ui.bzAddOpen?`<section class="card studio vs-adm"><div class="foc-cfg-h"><h3>發邀約</h3><button class="xv-bt g" data-a="bzAddOpen">收起</button></div>
    <div class="chips">${[["ad","廣告代言"],["mag","雜誌拍攝"]].map(([k,l])=>`<button class="chip ${d.type===k?"on":""}" data-a="bzAT" data-v="${k}">${l}</button>`).join("")}</div>
    <label class="foc-lab">${d.type==="mag"?"雜誌名稱":"品牌名稱"}</label><label class="field"><input id="bzAName" value="${esc(d.name||"")}" placeholder="輸入文字"></label>
    ${d.type==="mag"?`<label class="foc-lab">期數</label><label class="field"><input id="bzAIssue" value="${esc(d.issue||"")}" placeholder="輸入文字"></label>`:""}
    <label class="foc-lab">概念</label><textarea id="bzACon" class="vs-ta" rows="3" placeholder="輸入文字">${esc(d.concept||"")}</textarea>
    ${d.type==="mag"?`<label class="foc-lab">專訪題目</label>${[0,1,2].map(i=>`<label class="field"><input class="bzAQ" data-i="${i}" value="${esc(d.qs[i]||"")}" placeholder="輸入文字"></label>`).join("")}`:""}
    <label class="foc-lab">邀請藝人<span class="muted">${d.mids.length} 位</span></label>
    <div class="chips wrap">${AM.map(m=>`<button class="chip ${d.mids.includes(m)?"on":""}" data-a="bzAM" data-v="${m}">${esc(vsName(m))}<small class="muted"> ${esc((groupOf(MEMBERS[m].group)||{}).name||"")}</small></button>`).join("")}</div>
    <label class="foc-lab">期限</label><div class="chips">${[3,5,7,14].map(x=>`<button class="chip ${d.days===x?"on":""}" data-a="bzAD" data-v="${x}">${x} 天</button>`).join("")}</div>
    <label class="foc-lab">每位藝人酬勞</label><div class="chips">${[300,500,1000,2000].map(x=>`<button class="chip ${d.reward===x?"on":""}" data-a="bzAR" data-v="${x}">${fmt(x)}</button>`).join("")}</div>
    ${d.type==="mag"?`<label class="foc-lab">售價</label><div class="chips">${[100,300,500,800].map(x=>`<button class="chip ${d.price===x?"on":""}" data-a="bzAP" data-v="${x}">${fmt(x)}</button>`).join("")}</div>`:""}
    <button class="btn btn-main btn-block" data-a="bzAGo">發出邀約</button></section>
`:""}`; }
function bzAKeep(){ const d=ui.bzA; if(!d) return; const g=id=>document.getElementById(id); if(g("bzAName")) d.name=g("bzAName").value; if(g("bzAIssue")) d.issue=g("bzAIssue").value; if(g("bzACon")) d.concept=g("bzACon").value; document.querySelectorAll(".bzAQ").forEach(x=>{ d.qs[+x.dataset.i]=x.value; }); }
function bzKeep(){ const d=ui.bzD; if(!d) return; const t=document.getElementById("bzTxt"); if(t) d.text=t.value; document.querySelectorAll(".bzQa").forEach(x=>{ d.qa[+x.dataset.i]=x.value; }); }
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a; if(!/^(sc|bz)[A-Z]/.test(a)) return;
  const rr=()=>{ const y=window.scrollY; render(); window.scrollTo(0,y); };
  switch(a){
    case "scStep": { const sc=scGet(), k=t.dataset.k, mn=k==="days"?1:0; sc.cfg[k]=Math.max(mn,Math.min(999,(+sc.cfg[k]||0)+(+t.dataset.d))); scSet(sc); const b=document.getElementById("scV_"+k); if(b) b.textContent=sc.cfg[k]; clearTimeout(ui.scT); ui.scT=setTimeout(()=>{ scAuto(); rr(); },900); break; }
    case "scMsgEd": { if(ui.scMsgEd){ const v=((document.getElementById("scMsg")||{}).value||"").trim(); const sc=scGet(); sc.cfg.msg=v||SC_DEF.msg; scSet(sc); toast("已儲存"); } ui.scMsgEd=!ui.scMsgEd; rr(); break; }
    case "scF": ui.scF=t.dataset.v; rr(); break;
    case "scOpen": ui.scOpen=ui.scOpen===t.dataset.v?null:t.dataset.v; rr(); break;
    case "scAccEd": { const a=scAcc(t.dataset.v)||{id:"",u:"",co:SK_COS[0],bio:"",av:""}; ui.scAv=a.av||"";
      tieModal(a.id?"編輯星探帳號":"新增星探帳號",`<div class="sca-f"><label class="sca-av">${a.av?`<img src="${esc(a.av)}" alt="">`:`<span>＋</span>`}<input type="file" accept="image/*" id="scAvIn"></label>
        <span class="fs-f-lab">公司</span><select id="scCo" class="a-nick-in">${SK_COS.map(c=>`<option ${c===a.co?"selected":""}>${esc(c)}</option>`).join("")}</select>
        <span class="fs-f-lab">帳號名稱</span><input id="scU" class="a-nick-in" maxlength="30" placeholder="輸入文字" value="${esc(a.u)}" autocapitalize="off">
        <span class="fs-f-lab">自我介紹</span><textarea id="scBio" class="a-nick-in" maxlength="150" rows="3" placeholder="輸入文字">${esc(a.bio||"")}</textarea></div>`,
        `<button class="t-mbtn main" data-a="scAccOk" data-v="${a.id}">儲存</button>${a.id?`<button class="t-mbtn danger" data-a="scAccDel" data-v="${a.id}">刪除</button>`:""}<button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break; }
    case "scAccOk": { const u=((document.getElementById("scU")||{}).value||"").trim().toLowerCase().replace(/\s+/g,""), co=(document.getElementById("scCo")||{}).value||"", bio=((document.getElementById("scBio")||{}).value||"").trim();
      if(!u){ toast("請輸入帳號名稱"); break; } const sc=scGet(); if(sc.accs.some(a=>a.u===u&&a.id!==t.dataset.v)||snAllUsers().some(x=>x.u===u)){ toast("這個帳號名稱已經有人用了"); break; }
      const id=t.dataset.v||("o:sc_"+Date.now().toString(36)), o={id,u,co,bio,av:ui.scAv||""}; sc.accs=t.dataset.v?sc.accs.map(a=>a.id===id?o:a):[...sc.accs,o]; scSet(sc); layer.innerHTML=""; rr(); toast("已儲存"); break; }
    case "scAccDel": { const v=t.dataset.v; ask("刪除這個星探帳號？已經發出的私訊會留著。",()=>{ const sc=scGet(); sc.accs=sc.accs.filter(a=>a.id!==v); scSet(sc); layer.innerHTML=""; rr(); }); break; }
    case "scAddOpen": ui.scQ=""; setLayer(scAddSheet(),"scadd"); setTimeout(()=>{ const i=document.getElementById("scQ"); if(i) i.focus(); },250); break;
    
    case "scAdd": { const sc=scGet(); if(!sc.list.some(x=>x.uid===t.dataset.v)) sc.list.unshift({uid:t.dataset.v,note:"",ts:Date.now()}); scSet(sc); ui.scQ=""; layer.innerHTML=""; rr(); toast("已加入名單"); scAuto(); break; }
    case "scDel": { const v=t.dataset.v; ask("從名單移除？",()=>{ const sc=scGet(); sc.list=sc.list.filter(x=>x.uid!==v); scSet(sc); rr(); }); break; }
    case "scSigned": { const sc=scGet(), x=sc.list.find(y=>y.uid===t.dataset.v); if(x){ x.signed=!x.signed; scSet(sc); } rr(); break; }
    case "scNote": { const sc=scGet(), x=sc.list.find(y=>y.uid===t.dataset.v); if(!x) break; tieModal("備註",`<textarea id="scNoteIn" class="a-nick-in sn-caped" rows="4" placeholder="輸入文字">${esc(x.note||"")}</textarea>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="scNoteOk" data-v="${x.uid}">儲存</button>`,"row"); break; }
    case "scNoteOk": { const sc=scGet(), x=sc.list.find(y=>y.uid===t.dataset.v); if(x){ x.note=((document.getElementById("scNoteIn")||{}).value||"").trim(); scSet(sc); } layer.innerHTML=""; rr(); break; }
    case "scNow": { const v=t.dataset.v; ask("現在就用星探帳號私訊他？",()=>{ const sc=scGet(), d=snDB(); if(sc.picked[v]) return; scPick(v,sc,d); scSet(sc); rr(); toast("已私訊"); },{danger:false}); break; }
    case "bzAT": bzAKeep(); ui.bzA.type=t.dataset.v; rr(); break;
    case "bzAM": { bzAKeep(); const L=ui.bzA.mids, i=L.indexOf(t.dataset.v); if(i>=0) L.splice(i,1); else L.push(t.dataset.v); rr(); break; }
    case "bzAD": bzAKeep(); ui.bzA.days=+t.dataset.v; rr(); break;
    case "bzAR": bzAKeep(); ui.bzA.reward=+t.dataset.v; rr(); break;
    case "bzAP": bzAKeep(); ui.bzA.price=+t.dataset.v; rr(); break;
    case "bzAGo": { bzAKeep(); const d=ui.bzA; if(!(d.name||"").trim()){ toast(d.type==="mag"?"填雜誌名稱":"填品牌名稱"); break; } if(!d.mids.length){ toast("至少邀請一位藝人"); break; }
      const qs=d.type==="mag"?d.qs.map(x=>(x||"").trim()).filter(Boolean):[]; if(d.type==="mag"&&!qs.length){ toast("至少一題專訪題目"); break; }
      bzPut({id:"bz"+Date.now().toString(36),type:d.type,name:d.name.trim(),issue:(d.issue||"").trim(),concept:(d.concept||"").trim(),qs,mids:d.mids.slice(),reward:d.reward,price:d.price,ts:Date.now(),end:Date.now()+d.days*864e5,st:"on",ans:{},likes:{},buys:{}});
      ui.bzA={type:d.type,mids:[],days:d.days,reward:d.reward,price:d.price,qs:["","",""]}; rr(); toast("邀約發出去了"); break; }
    case "bzAEnd": { const b=bzGet(t.dataset.id); if(!b) break; b.st="done"; b.end=Math.min(b.end,Date.now()); bzPut(b); rr(); break; }
    case "bzADel": { const id=t.dataset.id; ask("刪除這個邀約？",()=>{ S.set(BZ_KEY,(S.get(BZ_KEY,[])||[]).filter(x=>x.id!==id)); rr(); }); break; }
    case "bzOk": case "bzNo": { const b=bzGet(t.dataset.id), mid=(session()||{}).member; if(!b||!b.mids.includes(mid)) break; ((b.ans=b.ans||{})[mid]=b.ans[mid]||{}).st=a==="bzOk"?"ok":"no"; bzPut(b); rr(); break; }
    case "bzSend": { bzKeep(); const b=bzGet(t.dataset.id), mid=(session()||{}).member, d=ui.bzD; if(!b||!d||!b.mids.includes(mid)) break; if(!d.img){ toast("先上傳照片"); break; }
      if(b.type==="ad"&&!(d.text||"").trim()){ toast("寫一句廣告文案"); break; } if(b.type==="mag"&&(b.qs||[]).some((q,i)=>!(d.qa[i]||"").trim())){ toast("每一題都要回答"); break; }
      const txt=[d.text,...d.qa].join(" "); if(!isAdminAcct()&&banBlock(txt)) break;
      b.ans[mid]={...(b.ans[mid]||{}),st:"ok",img:d.img,w:d.w,h:d.h,text:(d.text||"").trim(),qa:d.qa.map(x=>(x||"").trim()),ts:Date.now()}; bzPut(b); ui.bzD=null; rr(); toast("交件了！酬勞稍後入帳"); break; }
    case "bzLike": { const b=bzGet(t.dataset.id), me=myId(); if(!b||!me) break; const L=(b.likes=b.likes||{})[t.dataset.v]=b.likes[t.dataset.v]||[], i=L.indexOf(me); if(i>=0) L.splice(i,1); else { L.push(me); fanEarn("bzlike",10,{cap:50,once:"bz_"+b.id+"_"+t.dataset.v,why:"代言按讚"}); } bzPut(b); rr(); break; }
    case "bzBuy": { const b=bzGet(t.dataset.id), me=myId(); if(!b||!me||(b.buys||{})[me]) break; if(points()<b.price){ toast("積分不夠，先補充積分吧"); break; }
      ask(`用 ${fmt(b.price)} 積分買《${b.name}》？`,()=>{ const b2=bzGet(b.id); if(!b2||(b2.buys||{})[me]) return; S.set(K.points,points()-b2.price); (b2.buys=b2.buys||{})[me]=Date.now(); const sub=bzSubs(b2), share=Math.floor(b2.price/Math.max(1,sub.length));
        sub.forEach(m=>recordSale("mag",{mid:m,pts:share,label:`雜誌・${b2.name}`})); bzPut(b2); rr(); toast("買好了！"); },{ok:"購買",danger:false}); break; }
  } });
document.addEventListener("input",e=>{ if(e.target.id==="bzTxt"||e.target.classList.contains("bzQa")) bzKeep(); if(["bzAName","bzAIssue","bzACon"].includes(e.target.id)||e.target.classList.contains("bzAQ")) bzAKeep(); });
document.addEventListener("change",async e=>{ if(e.target.id!=="bzPic") return; const f=e.target.files&&e.target.files[0]; if(!f||!ui.bzD) return; bzKeep(); try{ const {blob,w,h}=await prepPhoto(f), id="bzp"+Date.now(); await MDB.put(id,blob); Object.assign(ui.bzD,{img:id,w,h}); render(); }catch(err){ toast("這張照片讀不出來"); } });

/* =========================================================
   生日咖啡廳：藝人生日的前後三天，系統自動開一間迷你小店
   ・粉絲：打卡進店、捐積分（算進藝人營收）、上傳海報／杯套、加生日特調到菜單、寫留言卡
     有捐積分的人，拿到一張「TIE 7 天體驗券」（不限藝人、一年內用完，一家店一張；她 10/28 定，取代到店小卡）
   ・藝人（全部可選，不強迫）：牆上簽名、語音感謝、到店自拍、蓋「藝人最愛」章、一張一張回留言卡
     藝人到店時，追蹤這團的粉絲會收到通知
   資料：daisuki_cafe（只放文字和照片的編號，照片本身在 R2）
   ========================================================= */
const CF_KEY="daisuki_cafe", CF_DAYS=3, CF_GIFT=[100,300,500,1000];
const cfAll=()=>S.get(CF_KEY,{})||{};
const cfIdOf=(mid,y)=>mid+"_"+y;
/* 生日：今年（或剛過完年的那一年）的那一天；前後三天內就開店 */
function cfWindow(mid){ const b=getBdays()[mid]||(MEMBERS[mid]||{}).bday;
  /* HUSSEY 示範／試玩：不管生日，店一直開著（資料只放這支手機） */
  if(demoOn()&&mid===demoMid()){ const real=b?cfWindowReal(mid,b):null; if(!real||!real.open){ const d=new Date(); d.setHours(0,0,0,0); return {y:"demo",day:d,diff:0,open:true,demo:true}; } return real; }
  if(!b) return null; return cfWindowReal(mid,b); }
function cfWindowReal(mid,b){ const [mm,dd]=String(b).split("-").map(Number); if(!mm||!dd) return null;
  const now=new Date(), t0=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  for(const y of [now.getFullYear()-1,now.getFullYear(),now.getFullYear()+1]){ const t=new Date(y,mm-1,dd), diff=Math.round((t-t0)/864e5); if(Math.abs(diff)<=CF_DAYS) return {y,day:t,diff,open:true}; }
  const t=new Date(now.getFullYear(),mm-1,dd); if(t<t0) t.setFullYear(now.getFullYear()+1); return {y:t.getFullYear(),day:t,diff:Math.round((t-t0)/864e5),open:false}; }
const cfMids=()=>Object.keys(MEMBERS).filter(m=>!MEMBERS[m].official&&groupOf(MEMBERS[m].group));
const cfOpenNow=()=>cfMids().map(m=>({m,w:cfWindow(m)})).filter(x=>x.w&&x.w.open);
function cfGet(mid,y){ if(y==="demo"){ ui.cfDemo=ui.cfDemo||{}; return ui.cfDemo[mid]||(ui.cfDemo[mid]={id:cfIdOf(mid,y),mid,y,demo:1,posters:[],cups:[],menu:[],cards:[{id:"nd1",text:"生日快樂！永遠支持你 💜",by:"x",name:"示範粉絲",ts:Date.now()-3600e3}],visits:{},pts:{},art:{}}); } const A=cfAll(), id=cfIdOf(mid,y); return A[id]||{id,mid,y,posters:[],cups:[],menu:[],cards:[],visits:{},pts:{},art:{}}; }
function cfPut(c){ if(c.demo){ (ui.cfDemo=ui.cfDemo||{})[c.mid]=c; return; } const A=cfAll(); A[c.id]=c; S.set(CF_KEY,A); }
const cfMe=()=>myEmail()||"";
const cfFan=()=>(session()||{}).role!=="artist";
const cfGot=(c,em)=>!!(c.pts[em]||c.posters.some(x=>x.by===em)||c.cups.some(x=>x.by===em)||c.menu.some(x=>x.by===em)||c.cards.some(x=>x.by===em));
const cfImg=(id,cls="")=>id?`<img class="cf-im ${cls}" data-mid="${id}" alt="">`:"";
const cfFav=(c,k)=>(c.art.favs||[]).includes(k);
function cfTileSub(){ const o=cfOpenNow(); if(o.length) return `● ${o.map(x=>MEMBERS[x.m].name).slice(0,2).join("、")}${o.length>2?" 等":""} 營業中`; const nx=cfMids().map(m=>({m,w:cfWindow(m)})).filter(x=>x.w).sort((a,b)=>a.w.diff-b.w.diff)[0]; return nx?`${MEMBERS[nx.m].name}・${nx.w.diff-CF_DAYS} 天後開店`:"還沒有藝人生日"; }

/* 店門口：整間小店的門面 */
function cfFront(c,w,enter){ const m=MEMBERS[c.mid], g=groupOf(m.group), name=m.name, tot=Object.values(c.pts).reduce((s,n)=>s+n,0), cup=c.cups[c.cups.length-1];
  const ac=(GRADS[(m.g||0)%GRADS.length]||["#B9A2E8"])[0], open=w.open;
  const winIn=`<span class="cfs-in"><i class="cfs-pend a"></i><i class="cfs-pend b"></i><i class="cfs-pend c"></i><i class="cfs-shelf"></i><i class="cfs-cnt"></i><i class="cfs-cake"></i></span>`;
  const posters=c.posters.slice(-2).map((p,i)=>`<span class="cfs-pst p${i}">${cfImg(p.img)}</span>`).join("");
  const door=`<span class="cfs-dglass"></span><span class="cfs-hang">${open?"OPEN":"CLOSED"}</span><i class="cfs-handle"></i>`;
  return `<section class="cf-shop cfs ${open?"on":""}" style="--ac:${ac}">
    <div class="cfs-awn"></div>
    <div class="cfs-sign"><i class="cfs-lamp l"></i><i class="cfs-lamp r"></i><small>BIRTHDAY CAFÉ</small><b>${esc(name)}</b></div>
    <div class="cfs-front"><div class="cfs-win">${winIn}${posters}${c.art.selfie?`<span class="cf-pol cfs-pol">${cfImg(c.art.selfie)}<i>${esc(name)}</i></span>`:""}</div>
      ${enter&&open?`<button class="cfs-door" data-a="cfIn" data-v="${c.mid}" aria-label="進店">${door}</button><span class="cfs-tip" aria-hidden="true">按這裡開門進入店裡</span>`:`<div class="cfs-door">${door}</div>`}
      <i class="cfs-tree"></i></div>
    <div class="cfs-step"></div>
    <div class="cf-stat"><span><b>${fmt(Object.keys(c.visits).length)}</b>位來過</span><span><b>${fmt(tot)}</b>積分應援</span><span><b>${fmt(c.cards.length)}</b>張卡片</span></div>
    <p class="cf-when">${w.open?(w.diff===0?"🎉 今天生日！":w.diff>0?`生日倒數 ${w.diff} 天`:`生日過後第 ${-w.diff} 天`)+`・營業到 ${ymd(+w.day+CF_DAYS*864e5)}`:`${ymd(+w.day-CF_DAYS*864e5)} 開店`}${g&&!g.solo?`・${esc(g.name)}`:""}</p></section>`; }
function cfSec(t,sub,body,act=""){ return `<section class="cf-sec"><div class="cf-sh"><b>${t}</b>${sub?`<small>${sub}</small>`:""}${act}</div>${body}</section>`; }
function viewCafe(mid){ const L=cfOpenNow();
  if(!mid){ const up=cfMids().map(m=>({m,w:cfWindow(m)})).filter(x=>x.w&&!x.w.open).sort((a,b)=>a.w.diff-b.w.diff).slice(0,6);
    return `<main class="page cf-list">${L.length?L.map(({m,w})=>{ const c=cfGet(m,w.y); return `<div class="cf-card">${cfFront(c,w,1)}</div>`;   /* 只有門能按（她 10/28：點門以外不要有任何動作） */ }).join(""):`<div class="ux-empty"><span>☕</span><b>現在沒有營業中的生日咖啡廳</b></div>`}
      ${up.length?`<div class="section-h">即將開店</div><section class="card cf-up">${up.map(({m,w})=>`<div class="cf-upr">${vsAv(m,36)}<span><b>${esc(MEMBERS[m].name)}</b><small>${w.day.getMonth()+1} 月 ${w.day.getDate()} 日生日</small></span><em>${Math.max(0,w.diff-CF_DAYS)} 天後</em></div>`).join("")}</section>`:""}</main>`; }
  const w=cfWindow(mid); if(!w) return `<main class="page"><div class="ux-empty"><span>☕</span><b>這位藝人還沒設定生日</b></div></main>`;
  const c=cfGet(mid,w.y), em=cfMe(), fan=cfFan(), mine=!fan&&(session()||{}).member===mid, on=w.open, A=c.art||{};
  if(fan&&on&&em&&!c.visits[em]){ c.visits[em]=Date.now(); cfPut(c); }
  const got=fan&&em&&cfGot(c,em);
  const star=(k)=>mine&&on?`<button class="cf-star ${cfFav(c,k)?"on":""}" data-a="cfFav" data-v="${mid}" data-k="${k}" aria-label="藝人最愛">★</button>`:cfFav(c,k)?`<i class="cf-stamp">${esc(MEMBERS[mid].name)}<br>最愛</i>`:"";
  if(!(ui.cfIn===mid)) return `<main class="page cf">${cfFront(c,w,1)}
    ${fan&&on?`<section class="cf-sec cf-gift"><div class="cf-sh"><b>生日應援</b><small>你有 ${fmt(points())} 積分</small></div><div class="cf-gb">${CF_GIFT.map(n=>`<button data-a="cfGift" data-v="${mid}" data-n="${n}">☕ ${fmt(n)}</button>`).join("")}</div>
      ${c.pts[em]?`<button class="cf-vch" data-a="meSecGo" data-v="tie"><span class="tv-tk">🎫<b>TIE</b><i>7 DAYS</i></span><p><b>${WHISPER_NAME} 7 天體驗券</b><small>已放進 ME 的「我的 ${WHISPER_NAME} 券」</small></p></button>`:`<p class="cf-hint">在這家咖啡廳第一次捐積分，送你一張 ${WHISPER_NAME} 7 天體驗券（每家店只送一張，多捐不會多送）</p>`}</section>`:""}
  </main>`;
  const sig=A.sig?`<div class="cfr-sig">${cfImg(A.sig,"sig")}<small>${esc(MEMBERS[mid].name)}・${c.y==="demo"?"":c.y}</small></div>`:"";
  return `<main class="page cf cf-inside" style="--cc:${grad(MEMBERS[mid].g||0)}">
    <div class="cfr-bar"><button data-a="cfOut" data-v="${mid}" aria-label="回到門口">${I.back}</button><b>${esc(MEMBERS[mid].name)} café</b><span>${A.at?`✨ ${esc(MEMBERS[mid].name)} 來過了`:""}</span></div>
    <nav class="cfr-tabs">${[["wall","牆面"],["bar","吧台"],["seat","窗邊"]].map(([k,l],i)=>`<button class="${i?"":"on"}" data-a="cfZone" data-v="${k}">${l}</button>`).join("")}</nav>
    <div class="cfr-room" id="cfRoom">
      <section class="cfr-z cfr-wall" data-z="wall"><i class="cfr-lamp"></i><i class="cfr-lamp r"></i>${sig}
    ${cfSec("海報牆",`${c.posters.length} 張`,`<div class="cf-wall">${c.posters.slice().reverse().map((p,i)=>`<figure class="cf-pst" style="--r:${(strHash(p.id)%7)-3}deg">${cfImg(p.img)}${star("p:"+p.id)}<figcaption>${esc(p.name||"")}</figcaption></figure>`).join("")||`<p class="cf-hint">還沒有海報</p>`}</div>`,fan&&on?`<label class="cf-add">＋ 貼海報<input type="file" accept="image/*" id="cfPoster" data-v="${mid}"></label>`:"")}
      <i class="cfr-wain"></i></section>
      <section class="cfr-z cfr-bar2" data-z="bar"><i class="cfr-shelf"></i>
    ${cfSec("菜單","",`<div class="cf-board"><b>BIRTHDAY MENU</b>${c.menu.map(x=>`<div class="cf-mi"><span>${esc(x.name)}</span><i></i><small>${esc(x.by_n||"")}</small>${star("m:"+x.id)}</div>`).join("")||`<p>— 還沒有特調 —</p>`}</div>`,fan&&on?`<button class="cf-add" data-a="cfMenu" data-v="${mid}">＋ 生日特調</button>`:"")}
    ${cfSec("杯套",`${c.cups.length} 款`,`<div class="cf-cups">${c.cups.slice().reverse().map(x=>`<div class="cf-cup"><span class="cf-lid"></span><span class="cf-sleeve">${cfImg(x.img)}</span><span class="cf-body"></span>${star("c:"+x.id)}<small>${esc(x.name||"")}</small></div>`).join("")||`<p class="cf-hint">還沒有杯套</p>`}</div>`,fan&&on?`<label class="cf-add">＋ 做杯套<input type="file" accept="image/*" id="cfCup" data-v="${mid}"></label>`:"")}
        <div class="cfr-counter"><i class="cfr-mach"></i><span class="cfr-case">🎂${c.posters.length+c.cards.length>5?"🍰":""}🧁</span></div></section>
      <section class="cfr-z cfr-seat" data-z="seat"><div class="cfr-win"><i class="cfr-vase"></i></div>
        ${A.selfie?`<span class="cf-pol cfr-pol">${cfImg(A.selfie)}<i>${esc(MEMBERS[mid].name)}</i></span>`:""}${A.voice?`<button class="cfr-radio" data-a="cfVoice" data-v="${A.voice}">📻<span>聽 ${esc(MEMBERS[mid].name)} 的語音</span></button>`:""}
    ${cfSec("留言板",`${c.cards.length} 張`,`<div class="cf-cork">${c.cards.slice().reverse().map(x=>`<div class="cf-note" style="--r:${(strHash(x.id)%9)-4}deg;--nc:${["#FFF3B0","#FFD6E7","#D7F0FF","#E2FFD9","#EBDDFF"][strHash(x.id)%5]}"><p>${fan&&x.by===em?esc(x.text):trT("cf:"+x.id,x.text,"","span")}</p><small>— ${esc(x.name||"")}</small>${star("n:"+x.id)}
        ${x.reply?`<div class="cf-rep"><b>${esc(MEMBERS[mid].name)}</b> ${fan?trT("cfr:"+x.id,x.reply,"","span"):esc(x.reply)}</div>`:mine&&on?`<button class="cf-rb" data-a="cfReply" data-v="${mid}" data-k="${x.id}">回覆</button>`:""}</div>`).join("")||`<p class="cf-hint">還沒有留言卡</p>`}</div>`,fan&&on?`<button class="cf-add" data-a="cfCard" data-v="${mid}">＋ 寫卡片</button>`:"")}
        <i class="cfr-table"></i></section>
    </div>
    ${mine?`<section class="cf-sec cf-me"><div class="cf-sh"><b>到店</b><small>想做哪個就做哪個</small></div><div class="cf-acts">
      <button data-a="cfSign" data-v="${mid}">✍️<span>${A.sig?"重新簽名":"牆上簽名"}</span></button>
      <label>🎙️<span>${A.voice?"換語音":"語音感謝"}</span><input type="file" accept="audio/*" id="cfVoiceIn" data-v="${mid}"></label>
      <label>📸<span>${A.selfie?"換自拍":"到店自拍"}</span><input type="file" accept="image/*" id="cfSelfie" data-v="${mid}"></label></div>
      ${on?"":`<p class="cf-hint">開店期間才能到店</p>`}</section>`:""}
    ${fan&&on?`<section class="cf-sec cf-gift"><div class="cf-sh"><b>生日應援</b><small>你有 ${fmt(points())} 積分</small></div><div class="cf-gb">${CF_GIFT.map(n=>`<button data-a="cfGift" data-v="${mid}" data-n="${n}">☕ ${fmt(n)}</button>`).join("")}</div>
      ${c.pts[em]?`<button class="cf-vch" data-a="meSecGo" data-v="tie"><span class="tv-tk">🎫<b>TIE</b><i>7 DAYS</i></span><p><b>${WHISPER_NAME} 7 天體驗券</b><small>已放進 ME 的「我的 ${WHISPER_NAME} 券」</small></p></button>`:`<p class="cf-hint">在這家咖啡廳第一次捐積分，送你一張 ${WHISPER_NAME} 7 天體驗券（每家店只送一張，多捐不會多送）</p>`}</section>`:""}
  </main>`; }
/* 簽名板 */
function cfSignPad(mid){ setLayer(`<div class="fs-pad-w cf-padw" role="dialog" aria-label="簽名"><div class="fs-pad"><b>在咖啡廳的牆上簽名</b><div class="cf-padc"><canvas id="cfPad" width="600" height="360"></canvas></div><div class="t-mb mrow"><button class="t-mbtn" data-a="cfPadClr">重簽</button><button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="cfPadOk" data-v="${mid}">完成</button></div></div></div>`,"cfpad");
  const cv=document.getElementById("cfPad"), x=cv.getContext("2d"); x.lineCap="round"; x.lineJoin="round"; x.lineWidth=7; x.strokeStyle="#3B2A1E"; let dn=false, n=0;
  const P=e=>{ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height]; };
  cv.addEventListener("pointerdown",e=>{ e.preventDefault(); dn=true; const [a,b]=P(e); x.beginPath(); x.moveTo(a,b); try{ cv.setPointerCapture(e.pointerId); }catch(_){} });
  cv.addEventListener("pointermove",e=>{ if(!dn) return; const [a,b]=P(e); x.lineTo(a,b); x.stroke(); n++; });
  ["pointerup","pointercancel"].forEach(ev=>cv.addEventListener(ev,()=>{ dn=false; })); cv._n=()=>n; }
async function cfUp(file,pre){ const {blob,w,h}=await prepPhoto(file), id=pre+Date.now().toString(36); await MDB.put(id,blob); return {id,w,h}; }
const cfCur=mid=>{ const w=cfWindow(mid); return w?cfGet(mid,w.y):null; };

document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a; if(!/^cf[A-Z]/.test(a)) return;
  const mid=t.dataset.v, rr=()=>{ const y=window.scrollY; render(); window.scrollTo(0,y); };
  switch(a){
    case "cfIn": { const d=t.closest(".cfs-door"); if(d) d.classList.add("opening"); setTimeout(()=>{ ui.cfIn=mid; const h=(session().role==="artist"?"#/artist?tab=foc&p=cafe&id=":"#/fan/core?p=cafe&id=")+encodeURIComponent(mid); if(route().id!==mid) navTo(h); else render(); window.scrollTo(0,0); },420); break; }
    case "cfOut": { ui.cfIn=null; const art=(session()||{}).role==="artist", skip=h=>/[?&]p=cafe&id=/.test(h)||(art&&/[?&]p=cafe(&|$)/.test(h)), cur=NAV_BASE+NAV_D; let to=null;   /* 店裡按返回：一次就離開咖啡廳，回到進來前的那一頁 */
      for(let i=cur-1;i>=0;i--){ if(NAV_STK[i]&&!skip(NAV_STK[i])){ to=NAV_STK[i]; break; } } navBackTo(to||(art?"#/artist?tab=foc":"#/fan/core?p=cafe")); break; }
    case "cfZone": { const r=document.getElementById("cfRoom"), z=r&&r.querySelector(`[data-z="${t.dataset.v}"]`); if(z) r.scrollTo({left:z.offsetLeft-r.offsetLeft,behavior:"smooth"}); break; }
    case "cfGo": { const dr=e.target.closest(".cfs-door"), op=!!t.querySelector(".cfs.on");   /* 列表上直接點門：開門動畫後直接進店，不用再按一次 */
      if(dr&&op){ dr.classList.add("opening"); setTimeout(()=>{ ui.cfIn=mid; navTo((session().role==="artist"?"#/artist?tab=foc&p=cafe&id=":"#/fan/core?p=cafe&id=")+encodeURIComponent(mid)); window.scrollTo(0,0); },420); break; } }
      ui.cfIn=null; navTo((session().role==="artist"?"#/artist?tab=foc&p=cafe&id=":"#/fan/core?p=cafe&id=")+encodeURIComponent(mid)); window.scrollTo(0,0); break;
    case "cfGift": { const n=+t.dataset.n, c=cfCur(mid), em=cfMe(); if(!c||!em) break; if(points()<n){ toast("積分不夠，先補充積分吧"); break; }
      ask(`送 ${fmt(n)} 積分當 ${MEMBERS[mid].name} 的生日應援？`,()=>{ const c2=cfCur(mid); S.set(K.points,points()-n); c2.pts[em]=(c2.pts[em]||0)+n; cfPut(c2); if(!c2.demo) recordSale("cafe",{mid,pts:n,label:`生日咖啡廳・${MEMBERS[mid].name}`}); const gv=tvGive("cf_"+c2.id,`${MEMBERS[mid].name} 生日咖啡廳`); rr(); toast(gv?`生日應援送出了 🎂 拿到 ${WHISPER_NAME} 7 天體驗券`:"生日應援送出了 🎂"); },{ok:"送出",danger:false}); break; }
    case "cfMenu": tieModal("生日特調",`<input id="cfMenuIn" class="a-nick-in" maxlength="16" placeholder="輸入文字">`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="cfMenuOk" data-v="${mid}">加到菜單</button>`,"row"); setTimeout(()=>document.getElementById("cfMenuIn")?.focus(),200); break;
    case "cfMenuOk": { const v=((document.getElementById("cfMenuIn")||{}).value||"").trim(); if(!v) break; if(!isAdminAcct()&&banBlock(v)) break; const c=cfCur(mid); c.menu.push({id:"m"+Date.now().toString(36),name:v,by:cfMe(),by_n:ME.name,ts:Date.now()}); c.menu=c.menu.slice(-30); cfPut(c); fanEarn("cfdeco_"+c.id,50,{cap:150,life:1,why:"幫忙佈置咖啡廳"}); layer.innerHTML=""; rr(); break; }
    case "cfCard": tieModal("生日卡片",`<textarea id="cfCardIn" class="a-nick-in sn-caped" rows="4" maxlength="150" placeholder="輸入文字"></textarea>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="cfCardOk" data-v="${mid}">貼上去</button>`,"row"); setTimeout(()=>document.getElementById("cfCardIn")?.focus(),200); break;
    case "cfCardOk": { const v=((document.getElementById("cfCardIn")||{}).value||"").trim(); if(!v) break; if(!isAdminAcct()&&banBlock(v)) break; const c=cfCur(mid); c.cards.push({id:"n"+Date.now().toString(36),text:v,by:cfMe(),name:ME.name,ts:Date.now()}); c.cards=c.cards.slice(-200); cfPut(c); fanEarn("cfcard",30,{once:"cfc_"+c.id,why:"生日咖啡廳留言卡"}); layer.innerHTML=""; rr(); toast("卡片貼上去了"); break; }
    case "cfReply": { const c=cfCur(mid), x=c&&c.cards.find(y=>y.id===t.dataset.k); if(!x) break; tieModal("回覆卡片",`<p class="cf-q">${esc(x.text)}</p><textarea id="cfRepIn" class="a-nick-in sn-caped" rows="3" maxlength="120" placeholder="輸入文字"></textarea>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="cfReplyOk" data-v="${mid}" data-k="${x.id}">回覆</button>`,"row"); setTimeout(()=>document.getElementById("cfRepIn")?.focus(),200); break; }
    case "cfReplyOk": { const v=((document.getElementById("cfRepIn")||{}).value||"").trim(); if(!v) break; const c=cfCur(mid), x=c.cards.find(y=>y.id===t.dataset.k); if(!x) break; x.reply=v; x.rts=Date.now(); cfArrive(c); cfPut(c); if(!c.demo&&x.by){ const G=S.get(K.ptGrants,[])||[]; if(!G.some(g=>g.id==="cfr_"+x.id)){ G.push({id:"cfr_"+x.id,to:x.by,n:100,why:`${MEMBERS[mid].name} 回了你的生日卡片`,by:"auto",ts:Date.now()}); S.set(K.ptGrants,G.slice(-2000)); } } layer.innerHTML=""; rr(); break; }
    case "cfFav": { const c=cfCur(mid), k=t.dataset.k, F=c.art.favs=c.art.favs||[], i=F.indexOf(k); if(i>=0) F.splice(i,1); else F.push(k); cfArrive(c); cfPut(c); rr(); break; }
    case "cfSign": cfSignPad(mid); break;
    case "cfPadClr": { const cv=document.getElementById("cfPad"); if(cv) cv.getContext("2d").clearRect(0,0,cv.width,cv.height); break; }
    case "cfPadOk": { const cv=document.getElementById("cfPad"); if(!cv) break; if(cv._n&&cv._n()<3){ toast("先簽個名吧"); break; } const id="cfs"+Date.now().toString(36), b=b64Blob(cv.toDataURL("image/png")); MDB.put(id,b); const c=cfCur(mid); c.art.sig=id; cfArrive(c); cfPut(c); layer.innerHTML=""; rr(); toast("簽好了 ✍️"); break; }
    case "cfVoice": { mediaSrc(mid).then(u=>{ if(!u){ toast("語音讀不到"); return; } const au=new Audio(u); au.play().catch(()=>toast("播放失敗")); }); break; }
  } });
/* 藝人第一次在這間店做任何事 → 算「到店」，通知追蹤這團的粉絲 */
function cfArrive(c){ if(c.art.at) return; c.art.at=Date.now(); if(c.demo) return; try{ const m=MEMBERS[c.mid]; feedPush({kind:"system",member:c.mid,group:m.group,text:`🎂 ${m.name} 到生日咖啡廳了！快去看看留下了什麼`},"g:"+m.group);
    const em=Object.keys(ACCOUNTS).find(e=>ACCOUNTS[e]&&ACCOUNTS[e].member===c.mid), G=S.get(K.ptGrants,[])||[], id="cfa_"+c.id; if(em&&!G.some(g=>g.id===id)){ G.push({id,to:em,n:300,why:"生日咖啡廳到店",by:"auto",ts:Date.now()}); S.set(K.ptGrants,G.slice(-2000)); } }catch(e){} }   /* 藝人到店 +300（一年一次） */
document.addEventListener("change",async e=>{ const id=e.target.id; if(!["cfPoster","cfCup","cfSelfie","cfVoiceIn"].includes(id)) return; const f=e.target.files&&e.target.files[0], mid=e.target.dataset.v; e.target.value=""; if(!f||!mid) return;
  try{ const c=cfCur(mid); if(!c) return;
    if(id==="cfVoiceIn"){ if(f.size>15*1024*1024){ toast("語音檔太大了"); return; } const vid="cfv"+Date.now().toString(36); await MDB.put(vid,f.slice(0,f.size,f.type||"audio/mp4")); c.art.voice=vid; cfArrive(c); }
    else { const r=await cfUp(f,id==="cfSelfie"?"cfsl":"cfp"); if(id==="cfSelfie"){ c.art.selfie=r.id; cfArrive(c); } else{ fanEarn("cfdeco_"+c.id,50,{cap:150,life:1,why:"幫忙佈置咖啡廳"}); } if(id!=="cfSelfie") (id==="cfPoster"?c.posters:c.cups).push({id:"x"+Date.now().toString(36),img:r.id,by:cfMe(),name:ME.name,ts:Date.now()}); }
    c.posters=c.posters.slice(-60); c.cups=c.cups.slice(-30); cfPut(c); render(); toast("好了 ✨"); }catch(err){ toast("這個檔案讀不出來"); } });
/* 店內左右滑：上面的分頁跟著亮 */
document.addEventListener("scroll",e=>{ const r=e.target; if(!r||r.id!=="cfRoom") return; const i=Math.round(r.scrollLeft/Math.max(1,r.clientWidth*.86)); document.querySelectorAll(".cfr-tabs button").forEach((b,k)=>b.classList.toggle("on",k===i)); },true);

/* =========================================================
   二代綜藝（復古風）
   ・兩天一夜（1박 2일）복불복：製作組 PD 主持，晚餐杯子（魚露）→ 爬梯子 → 翻牌（帳篷）
     有人吃大餐有人沒飯吃、有人睡室內有人睡帳篷、運氣最差的要做起床任務。好壞結果都是真的
   ・偶像運動會（아육대）：在下面
   ========================================================= */
const OB_PD=["今天的晚餐…不是每個人都吃得到 🍖","下一關決定今晚睡哪裡，請選一條線。","最後一關！翻到帳篷的人，今晚就在外面過夜 ⛺","PD 不接受任何討價還價。"];
const OB_MISSION=["明早 7 點前在 SNS 發一張剛起床的素顏照","明早在 TIE 傳一則「早安」語音","明天整天 SNS 大頭貼換成帳篷照","明早幫全員點早餐（在 TIE 跟粉絲說要點什麼）","明天第一則貼文要用 PD 指定的句子開頭：「我錯了，PD 님」"];
function obRng(seed){ let s=strHash(String(seed))||1; return ()=>{ s=Math.imul(s^(s>>>15),2246822507)>>>0; s=Math.imul(s^(s>>>13),3266489909)>>>0; s^=s>>>16; return (s>>>0)/4294967296; }; }
function obShuffle(a,r){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
/* 開一集：杯子裡有幾杯魚露、梯子的橫槓、牌裡有幾張帳篷，開的時候就決定好（大家看到的都一樣） */
function obNew(id,mids,pd){ const n=mids.length, r=obRng(id), cups=n+1, bad=Math.max(1,Math.round(n/3)), rails=[];
  for(let y=0;y<9;y++){ const used=new Set(); for(let k=0;k<n-1;k++){ if(r()<.42&&!used.has(k)&&!used.has(k-1)){ rails.push([y,k]); used.add(k); } } }
  const bottoms=obShuffle([2,1,0,-1,-2,1,0,-1].slice(0,n),r), tents=Math.max(1,Math.round(n/3));
  return {r:1,pd:pd||"",cups:{n:cups,bad:obShuffle([...Array(cups).keys()],r).slice(0,bad)},ladder:{n,rails,bottoms},cards:{n,tent:obShuffle([...Array(n).keys()],r).slice(0,tents)},pk:{1:{},2:{},3:{}},rev:{}}; }
function obLadderEnd(L,start){ let c=start; for(let y=0;y<9;y++){ if(L.rails.some(([yy,k])=>yy===y&&k===c)) c++; else if(L.rails.some(([yy,k])=>yy===y&&k===c-1)) c--; } return c; }
function obNeed(ep,mid){ const o=ep.ob; return ep.st==="on"&&o.r<=3&&ep.mids.includes(mid)&&o.pk[o.r][mid]==null; }
/* 一關大家都選完（或時間到）就揭曉，進下一關 */
function obAdvance(ep,force){ const o=ep.ob; let ch=false; while(o.r<=3){ const P=o.pk[o.r], miss=ep.mids.filter(m=>P[m]==null); if(miss.length&&!force) break;
    if(miss.length){ const r=obRng(ep.id+"f"+o.r), N=o.r===1?o.cups.n:o.r===2?o.ladder.n:o.cards.n, taken=new Set(Object.values(P)); miss.forEach(m=>{ const free=[...Array(N).keys()].filter(i=>!taken.has(i)); const c=free[Math.floor(r()*free.length)]; P[m]=c; taken.add(c); }); }
    o.rev[o.r]=Date.now(); o.r++; ch=true; } return ch; }
function obRes(ep){ const o=ep.ob, R={}; ep.mids.forEach(m=>{ const c1=o.pk[1][m], c2=o.pk[2][m], c3=o.pk[3][m];
    const fish=c1!=null&&o.rev[1]?o.cups.bad.includes(c1):null, lad=c2!=null&&o.rev[2]?o.ladder.bottoms[obLadderEnd(o.ladder,c2)]:null, tent=c3!=null&&o.rev[3]?o.cards.tent.includes(c3):null;
    R[m]={fish,lad,tent,luck:(fish==null?0:fish?-2:1)+(lad||0)+(tent==null?0:tent?-3:1)}; }); return R; }
function obPick(id,k){ const ep=vsGet(id), mid=(session()||{}).member; if(!ep||ep.st!=="on"||!obNeed(ep,mid)) return; const o=ep.ob, P=o.pk[o.r]; if(Object.values(P).includes(k)){ toast("這個被選走了，換一個"); return; }
  P[mid]=k;
  if(String(ep.id).startsWith("demo_")){ /* 示範：其他人過幾秒才一個一個選（像真的有人在想） */ const N=o.r===1?o.cups.n:o.r===2?o.ladder.n:o.cards.n, rnd=o.r;
    ep.mids.filter(m=>P[m]==null).forEach((m,i)=>setTimeout(()=>{ const e2=vsGet(id); if(!e2||e2.ob.r!==rnd||e2.ob.pk[rnd][m]!=null) return; const P2=e2.ob.pk[rnd], taken=new Set(Object.values(P2)), free=[...Array(N).keys()].filter(j=>!taken.has(j)); P2[m]=free[Math.floor(Math.random()*free.length)];
      const adv=obAdvance(e2,false); if(adv) e2.ob.rt=Date.now(); vsPut(e2); vsCheck(e2); if(e2.st!=="on"){ const y=window.scrollY; render(); window.scrollTo(0,y); } else obPatch(id); },1600+i*1400+Math.random()*900)); }
  if(obAdvance(ep,false)) o.rt=Date.now(); vsPut(ep); vsCheck(ep); }
/* 一關給 12 小時；時間到還沒選的人，系統幫他隨便選，揭曉進下一關（大家不用同時在線） */
const OB_ROUND=12*36e5;
function obTimeUp(ep){ const o=ep.ob; if(ep.st!=="on"||o.r>3||String(ep.id).startsWith("demo_")) return false; o.rt=o.rt||ep.ts||Date.now(); if(Date.now()<o.rt+OB_ROUND) return false;
  const P=o.pk[o.r], N=o.r===1?o.cups.n:o.r===2?o.ladder.n:o.cards.n, r=obRng(ep.id+"f"+o.r), taken=new Set(Object.values(P)); ep.mids.forEach(m=>{ if(P[m]!=null) return; const free=[...Array(N).keys()].filter(i=>!taken.has(i)), c=free[Math.floor(r()*free.length)]; P[m]=c; taken.add(c); });
  obAdvance(ep,false); o.rt=Date.now(); return true; }
/* 只換掉節目那一塊（不整頁重畫，就不會閃） */
function obPatch(id){ const ep=vsGet(id), el=document.querySelector(".card.ob"); if(!ep||!el||!ep.ob){ const y=window.scrollY; render(); window.scrollTo(0,y); return; } const w=document.createElement("div"); w.innerHTML=obBody(ep,(session()||{}).member); el.replaceWith(w.firstElementChild); }
/* 復古字幕 */
const obCap=(t,cls="")=>`<div class="ob-cap ${cls}">${esc(t)}</div>`;
function obBody(ep,me){ const o=ep.ob, on=ep.st==="on", R=obRes(ep), mine=me&&ep.mids.includes(me), P=o.pk;
  const who=(round,k)=>{ const m=Object.keys(P[round]).find(x=>P[round][x]===k); return m?vsName(m):""; };
  const left=Math.max(0,(o.rt||ep.ts||Date.now())+OB_ROUND-Date.now()), demo=String(ep.id).startsWith("demo_");
  const wait=n=>o.r===n&&on?`<p class="ob-wait">${ep.mids.filter(m=>P[n][m]!=null).length}/${ep.mids.length} 人選好了${mine&&P[n][me]!=null?"・等其他人…":""}${demo?"":`・剩 ${Math.floor(left/36e5)} 小時 ${Math.floor(left%36e5/6e4)} 分`}</p>`:"";
  const stage=(n,title,pd,body,doneTxt)=>`<section class="ob-st ${o.r>n?"done":o.r===n&&on?"cur":"lock"} ${o.rev[n]&&Date.now()-o.rev[n]<6000?"fresh":""}"><div class="ob-sh"><b>${n}</b><span>${title}</span>${o.r>n?`<em>揭曉</em>`:o.r===n&&on?`<em class="on">進行中</em>`:""}</div>${o.r>=n?`<div class="ob-pd"><i>PD</i><p>${esc(pd)}</p></div>${body}${wait(n)}`:""}${o.r>n&&doneTxt?doneTxt:""}</section>`;
  /* 1 晚餐杯子 */
  const cups=[...Array(o.cups.n).keys()].map(i=>{ const tk=who(1,i), rev=!!o.rev[1], bad=o.cups.bad.includes(i), my=mine&&P[1][me]===i;
    return `<button class="ob-cup ${rev?(bad?"bad":"ok"):""} ${tk?"tk":""} ${my?"my":""}" ${mine&&on&&o.r===1&&!tk&&P[1][me]==null?`data-a="obPick" data-id="${ep.id}" data-k="${i}"`:"disabled"}><span class="ob-cupb">${rev?(bad?"🐟":"🍖"):"🥤"}</span><small>${tk?esc(tk):i+1}</small></button>`; }).join("");
  const s1=stage(1,"晚餐복불복",o.pd||OB_PD[0],`<div class="ob-cups">${cups}</div>`,
    o.rev[1]?obCap(ep.mids.filter(m=>R[m].fish).map(vsName).join("、")+" 喝到魚露，今晚沒有晚餐！","bad"):"");
  /* 2 爬梯子 */
  const L=o.ladder, W=Math.max(220,L.n*56), H=200, x=c=>28+c*((W-56)/Math.max(1,L.n-1)), yy=y=>24+y*(H-48)/8;
  const paths=o.rev[2]?ep.mids.map((m,mi)=>{ const s=P[2][m]; if(s==null) return ""; let c=s, d=`M${x(c)} 8 L${x(c)} ${yy(0)}`; for(let y=0;y<9;y++){ if(L.rails.some(([a,k])=>a===y&&k===c)){ d+=` L${x(c)} ${yy(y)} L${x(c+1)} ${yy(y)}`; c++; } else if(L.rails.some(([a,k])=>a===y&&k===c-1)){ d+=` L${x(c)} ${yy(y)} L${x(c-1)} ${yy(y)}`; c--; } } d+=` L${x(c)} ${H-8}`; return `<path d="${d}" class="ob-path" style="--pc:hsl(${mi*67%360} 85% 55%)"/>`; }).join(""):"";
  const lad=`<div class="ob-ladw"><div class="ob-tops">${[...Array(L.n).keys()].map(i=>{ const tk=who(2,i); return `<button style="left:${x(i)}px" class="${tk?"tk":""}" ${mine&&on&&o.r===2&&!tk&&P[2][me]==null?`data-a="obPick" data-id="${ep.id}" data-k="${i}"`:"disabled"}>${tk?esc(tk).slice(0,4):"▼"}</button>`; }).join("")}</div>
    <svg class="ob-lad" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${[...Array(L.n).keys()].map(i=>`<line x1="${x(i)}" y1="8" x2="${x(i)}" y2="${H-8}"/>`).join("")}${o.rev[2]?L.rails.map(([y,k])=>`<line x1="${x(k)}" y1="${yy(y)}" x2="${x(k+1)}" y2="${yy(y)}"/>`).join(""):`<rect x="0" y="16" width="${W}" height="${H-40}" class="ob-cover"/>`}${paths}</svg>
    <div class="ob-bots">${L.bottoms.map((v,i)=>`<span style="left:${x(i)}px" class="${v>0?"good":v<0?"bad":""}">${o.rev[2]?(v>0?"+"+v:v):"?"}</span>`).join("")}</div></div>`;
  const s2=stage(2,"爬梯子",OB_PD[1],lad,o.rev[2]?obCap("運氣："+ep.mids.map(m=>`${vsName(m)} ${R[m].lad>0?"+"+R[m].lad:R[m].lad}`).join("　")):"");
  /* 3 翻牌 */
  const cards=[...Array(o.cards.n).keys()].map(i=>{ const tk=who(3,i), rev=!!o.rev[3], t=o.cards.tent.includes(i);
    return `<button class="ob-card ${rev?(t?"bad":"ok"):""}" ${mine&&on&&o.r===3&&!tk&&P[3][me]==null?`data-a="obPick" data-id="${ep.id}" data-k="${i}"`:"disabled"}><span>${rev?(t?"⛺":"🏠"):"?"}</span><small>${tk?esc(tk):""}</small></button>`; }).join("");
  const s3=stage(3,"今晚睡哪裡",OB_PD[2],`<div class="ob-cards">${cards}</div>`,o.rev[3]?obCap(ep.mids.filter(m=>R[m].tent).map(vsName).join("、")+" 今晚睡帳篷！","bad"):"");
  return `<section class="card vs-sec ob">${s1}${s2}${s3}</section>`; }
function obFinish(ep){ const R=obRes(ep), rk=ep.mids.slice().sort((a,b)=>R[b].luck-R[a].luck), top=R[rk[0]].luck, low=R[rk[rk.length-1]].luck;
  const win=rk.filter(m=>R[m].luck===top), worst=rk.filter(m=>R[m].luck===low), mis=OB_MISSION[strHash(ep.id)%OB_MISSION.length];
  ep.st="done"; ep.res={rank:rk,win,sc:Object.fromEntries(rk.map(m=>[m,R[m].luck])),betWin:ep.mids.filter(m=>R[m].tent),ob:R,pun:{mid:worst[0],t:"起床任務："+mis},worst,at:Date.now()}; return ep; }
function obResult(ep){ const r=ep.res, R=r.ob||{};
  return `<section class="card vs-res ob-res"><h3>今晚的結果</h3>${r.rank.map(m=>`<div class="vs-rr ${r.win.includes(m)?"win":""} ${r.worst.includes(m)?"worst":""}"><em>${r.win.includes(m)?"👑":r.worst.includes(m)?"💀":""}</em>${vsAv(m,32)}<b>${esc(vsName(m))}</b><span class="ob-tags">${R[m].fish?"🐟 沒晚餐":"🍖 有晚餐"}・${R[m].tent?"⛺ 帳篷":"🏠 室內"}</span></div>`).join("")}
    ${r.pun&&MEMBERS[r.pun.mid]?`<div class="vs-pun"><b>${esc(r.worst.map(vsName).join("、"))}・運氣最差</b><p>${esc(r.pun.t)}</p></div>`:""}</section>`; }
document.addEventListener("click",e=>{ const t=e.target.closest('[data-a="obPick"]'); if(!t) return; obPick(t.dataset.id,+t.dataset.k); const ep=vsGet(t.dataset.id); if(ep&&ep.st==="on") obPatch(t.dataset.id); else { const y=window.scrollY; render(); window.scrollTo(0,y); } });

/* =========================================================
   偶像運動會（아육대）：一年兩次，中秋、過年前後由管理員開幕
   ・項目：射箭、60 公尺短跑、跳高、保齡球，團體另外算接力（同團成員短跑平均）
   ・藝人每項每天可以挑戰 3 次，留最好的成績；前三名金銀銅牌（藝人拿積分），也有「脫靶王」這種丟臉的稱號
   ・粉絲不能玩，只能幫團加油；閉幕時加油數第一名那團、有加油的粉絲每人 +500
   ========================================================= */
const IS_KEY="daisuki_isac", IS_TRY=3, IS_CHEER_DAY=50, IS_FAN_PRIZE=500, IS_MEDAL=[500,300,200];
const IS_HOL=[["2026-02-17","新年"],["2026-09-25","中秋"],["2027-02-07","新年"],["2027-09-15","中秋"],["2028-01-27","新年"],["2028-10-03","中秋"],["2029-02-13","新年"],["2029-09-22","中秋"],["2030-02-03","新年"],["2030-09-12","中秋"],["2031-01-23","新年"],["2031-10-01","中秋"]];
const IS_EV={archery:{n:"射箭",ic:"🏹",unit:"分",hi:true,shame:"脫靶王"},sprint:{n:"60m 短跑",ic:"🏃",unit:"秒",hi:false,shame:"龜速王"},jump:{n:"跳高",ic:"🤸",unit:"cm",hi:true,shame:"地板派"},bowling:{n:"保齡球",ic:"🎳",unit:"分",hi:true,shame:"洗溝王"}};
const isGet=()=>S.get(IS_KEY,{})||{};
function isWin(){ const now=Date.now(); for(const [d,n] of IS_HOL){ const t=new Date(d+"T00:00:00").getTime(); if(Math.abs(now-t)<=21*864e5) return {n,y:d.slice(0,4)}; } return null; }
function isCur(){ if(demoOn()&&!(isGet().cur&&isGet().cur.st==="on")){ if(!ui.isDemo) ui.isDemo={id:"demo_isac",name:"示範偶像運動會",st:"on",start:Date.now(),end:Date.now()+3*864e5,sc:{},ch:{},demo:1}; return ui.isDemo; } const c=isGet().cur; if(c&&c.st==="on"&&Date.now()>=c.end){ c.st="done"; isPut(c); } return c||null; }
function isPut(c){ if(c.demo){ ui.isDemo=c; return; } const A=isGet(); A.cur=c; S.set(IS_KEY,A); }
const isDay=()=>new Date().toISOString().slice(0,10);
const isFmt=(ev,v)=>v==null?"—":ev==="sprint"?v.toFixed(2):fmt(v);
function isBoard(c,ev){ const E=IS_EV[ev], L=Object.entries((c.sc||{})[ev]||{}).filter(([m,x])=>MEMBERS[m]&&x.best!=null).sort((a,b)=>E.hi?b[1].best-a[1].best:a[1].best-b[1].best); return L; }
function isRelay(c){ const B=Object.fromEntries(isBoard(c,"sprint").map(([m,x])=>[m,x.best])), G={};
  Object.keys(B).forEach(m=>{ const g=MEMBERS[m].group, gg=groupOf(g); if(!gg||gg.solo) return; (G[g]=G[g]||[]).push(B[m]); });
  return Object.entries(G).filter(([,a])=>a.length>=2).map(([g,a])=>[g,a.reduce((s,v)=>s+v,0)/a.length]).sort((a,b)=>a[1]-b[1]); }
/* 名次（同分同名次）→ 金銀銅 */
function isMedals(c){ const M={}; Object.keys(IS_EV).forEach(ev=>{ const L=isBoard(c,ev); let rk=0, prev=null; L.forEach(([m,x],i)=>{ if(x.best!==prev){ rk=i; prev=x.best; } if(rk<3) (M[m]=M[m]||[0,0,0])[rk]++; }); });
  const GM={}; Object.entries(M).forEach(([m,a])=>{ const g=MEMBERS[m].group; GM[g]=GM[g]||[0,0,0]; a.forEach((n,i)=>GM[g][i]+=n); }); isRelay(c).slice(0,3).forEach(([g],i)=>{ GM[g]=GM[g]||[0,0,0]; GM[g][i]++; });
  return {M,GM:Object.entries(GM).sort((a,b)=>b[1][0]-a[1][0]||b[1][1]-a[1][1]||b[1][2]-a[1][2])}; }
function isShame(c){ const out=[]; Object.entries(IS_EV).forEach(([ev,E])=>{ const L=isBoard(c,ev); if(L.length>=2){ const w=L[L.length-1]; out.push([E.shame,w[0],isFmt(ev,w[1].best)+E.unit]); } }); const fs=Object.entries(c.foul||{}).sort((a,b)=>b[1]-a[1])[0]; if(fs&&fs[1]>=2) out.push(["偷跑王",fs[0],fs[1]+" 次"]); return out; }
const isCheerTop=c=>Object.entries(c.ch||{}).map(([g,o])=>[g,Object.values(o).reduce((s,n)=>s+n,0)]).sort((a,b)=>b[1]-a[1]);
function isTriesLeft(c,ev,mid){ const x=((c.sc||{})[ev]||{})[mid]; return IS_TRY-((x&&x.day===isDay())?x.n:0); }
function viewIsac(){ const c=isCur(), s=session()||{}, mid=s.role==="artist"?s.member:null, w=isWin();
  const evHow=xvHow(Object.values(IS_EV).map(E=>[E.ic,esc(E.n)]));
  if(!c) return `<main class="page is xv is2">${xvHero({tone:"b",small:"IDOL STAR ATHLETICS CHAMPIONSHIPS",title:"偶像運動會",meta:w?`${w.y} ${w.n}運動會・等管理員開幕`:`每年中秋、過年前後開幕・${isNextTxt()}`})}
    ${xvSh("項目","每項每天 3 次")}${evHow}${xvSh("規則")}${xvHow([["🥇","金牌<br>+500"],["🥈","銀牌<br>+300"],["🥉","銅牌<br>+200"],["📣","粉絲加油<br>第一名 +500"]])}${isPast()}</main>`;
  const on=c.st==="on", md=isMedals(c), ch=isCheerTop(c), em=myEmail(), f=followed(), day=Math.max(1,Math.ceil((Date.now()-(c.start||Date.now()))/864e5)), tot=Math.max(1,Math.round(((c.end||0)-(c.start||0))/864e5));
  const left=mid?Object.keys(IS_EV).reduce((n,k)=>n+Math.max(0,isTriesLeft(c,k,mid)),0):0, myCh=on&&!mid?GROUPS.reduce((n,g)=>n+(((c.chd||{})[`${em}|${isDay()}|${g.id}`])||0),0):0;
  const hero=xvHero({tone:"b",tag:on?`● 第 ${Math.min(day,tot)} 天`:"已閉幕",small:esc(c.name),title:on?(mid?`今天還能比 ${left} 次`:"偶像運動會"):"運動會結束了",
    meta:on?(mid?`每項每天 ${IS_TRY} 次・留最好的成績・金 +${IS_MEDAL[0]} 銀 +${IS_MEDAL[1]} 銅 +${IS_MEDAL[2]}`:`閉幕時加油第一名的團，有加油的粉絲每人 +${IS_FAN_PRIZE}`):"獎牌和積分已經發出去了",
    cd:on?[...xvCd(c.end),...(!mid&&s.role==="fan"?[[`${Math.min(myCh,IS_CHEER_DAY)}`,"今天加油",2]]:[])]:[]});
  const chMax=Math.max(1,...ch.map(x=>x[1])), cheerG=GROUPS.filter(g=>f.includes(g.id)||ch.some(x=>x[0]===g.id));
  const cheer=on&&s.role==="fan"&&!mid?xvSh("加油排行","一下 +5 積分・一天最多 50")+cheerG.sort((a,b)=>(((ch.find(x=>x[0]===b.id)||[])[1])||0)-(((ch.find(x=>x[0]===a.id)||[])[1])||0)).map(g=>{ const n=((ch.find(x=>x[0]===g.id)||[])[1])||0, mine=((c.ch||{})[g.id]||{})[em]||0;
      return xvRow({...xvGAv(g.id),title:`${esc(g.name)} <span class="is2-n">${fmt(n)}</span><span class="xv-bar"><i style="width:${n/chMax*100}%"></i></span>`,right:f.includes(g.id)?`<button class="xv-bt is2-ch" data-a="isCheer" data-v="${g.id}">📣 加油<small>${fmt(mine)}</small></button>`:""}); }).join("")
    :xvSh("加油排行")+(ch.length?ch.slice(0,6).map(([g,n])=>xvRow({...xvGAv(g),title:`${esc((groupOf(g)||{}).name||"")} <span class="is2-n">${fmt(n)}</span><span class="xv-bar"><i style="width:${n/chMax*100}%"></i></span>`})).join(""):xvEmpty("還沒有人加油"));
  const evs=on&&mid?xvSh("項目","今天剩幾次")+Object.entries(IS_EV).map(([k,E])=>{ const x=((c.sc||{})[k]||{})[mid], lf=isTriesLeft(c,k,mid), L=isBoard(c,k), rk=L.findIndex(([m])=>m===mid);
      return xvRow({av:E.ic,sq:1,avStyle:"background:var(--s2)",title:esc(E.n),sub:x&&x.best!=null?`我最好 ${isFmt(k,x.best)}${E.unit}・第 ${rk+1} 名`:"還沒比",right:`${xvChip(`剩 ${Math.max(0,lf)}`,lf>0?"":"")}<button class="xv-bt" data-a="isPlay" data-v="${k}" ${lf>0?"":"disabled"}>比</button>`}); }).join("")
      +xvRow({av:"🏃‍♀️",sq:1,avStyle:"background:var(--s2)",title:"團體接力",sub:"同團成員短跑平均，自動計算",right:xvChip("團體","on")}):"";
  const lead=xvSh("目前第一")+`<div class="xv-g2">${Object.entries(IS_EV).map(([k,E])=>{ const t=isBoard(c,k)[0]; return xvRow({av:E.ic,sq:1,avStyle:"background:var(--s2)",title:esc(E.n),sub:t?`${esc(MEMBERS[t[0]].name)} ${isFmt(k,t[1].best)}${E.unit}`:"還沒人比"}); }).join("")}</div>`;
  const myMd=mid&&md.M[mid]?xvSh("我的獎牌")+xvStats([[`🥇 ${md.M[mid][0]}`,"金"],[`🥈 ${md.M[mid][1]}`,"銀"],[`🥉 ${md.M[mid][2]}`,"銅"]]):"";
  return `<main class="page is xv is2">${hero}${mid?evs+myMd:cheer}${lead}
    ${xvSh("獎牌榜")}${md.GM.length?md.GM.map(([g,a],i)=>xvRow({...xvGAv(g),title:esc((groupOf(g)||{}).name||""),sub:`🥇 ${a[0]}　🥈 ${a[1]}　🥉 ${a[2]}`,right:xvChip(`第 ${i+1}`,i===0?"on":"")})).join(""):xvEmpty("還沒有成績")}
    ${Object.entries(IS_EV).map(([k,E])=>{ const L=isBoard(c,k).slice(0,5); return L.length?`<details class="is2-d"><summary>${E.ic} ${esc(E.n)} 排行<i>${isBoard(c,k).length} 人</i></summary>${L.map(([m,x],i)=>xvRow({av:i<3?["🥇","🥈","🥉"][i]:i+1,sq:1,avStyle:"background:var(--s2)",title:esc(MEMBERS[m].name),sub:esc((groupOf(MEMBERS[m].group)||{}).name||""),right:`<b class="is2-v">${isFmt(k,x.best)}<i>${E.unit}</i></b>`})).join("")}</details>`:""; }).join("")}
    ${isRelay(c).length?`<details class="is2-d"><summary>🏃‍♀️ 團體接力<i>${isRelay(c).length} 團</i></summary>${isRelay(c).slice(0,8).map(([g,v],i)=>xvRow({av:i<3?["🥇","🥈","🥉"][i]:i+1,sq:1,avStyle:"background:var(--s2)",title:esc(groupOf(g).name),right:`<b class="is2-v">${v.toFixed(2)}<i>秒</i></b>`})).join("")}</details>`:""}
    ${isShame(c).length?xvSh("😵 丟臉大賞")+isShame(c).map(([t,m,v])=>xvRow({av:"💀",sq:1,avStyle:"background:var(--s2)",title:esc(t),sub:esc(MEMBERS[m]?MEMBERS[m].name:""),right:`<b class="is2-v">${esc(v)}</b>`})).join(""):""}</main>`; }
function isPast(){ const P=(isGet().past||[]).slice(-3).reverse(); return P.length?`<div class="section-h">歷屆</div>${P.map(p=>`<section class="is-sb"><h3>${esc(p.name)}</h3>${(p.top||[]).map(([g,a],i)=>`<div class="is-row"><em>${i+1}</em><b>${esc((groupOf(g)||{}).name||"已解散")}</b><span>🥇${a[0]}</span><span>🥈${a[1]}</span><span>🥉${a[2]}</span></div>`).join("")}</section>`).join("")}`:""; }
/* 閉幕結算：藝人獎牌積分、加油第一名的粉絲（管理員的手機發，每筆有固定編號） */
function isPay(){ try{ if(!isAdminAcct()) return; const A=isGet(), c=A.cur; if(!c||c.paid) return; if(c.st==="on"&&Date.now()<c.end) return; c.st="done";
  const L=S.get(K.ptGrants,[])||[], have=new Set(L.map(g=>g.id)), md=isMedals(c), push=(id,to,n,why)=>{ if(!to||have.has(id)) return; L.push({id,to,n,why,by:"auto",ts:Date.now()}); have.add(id); };
  Object.entries(md.M).forEach(([m,a])=>{ const em=Object.keys(ACCOUNTS).find(e=>ACCOUNTS[e]&&ACCOUNTS[e].member===m); const n=a[0]*IS_MEDAL[0]+a[1]*IS_MEDAL[1]+a[2]*IS_MEDAL[2]; if(n) push(`isa_${c.id}_${m}`,em,n,`${c.name}・獎牌`); });
  const top=isCheerTop(c)[0]; if(top) Object.keys((c.ch||{})[top[0]]||{}).forEach(em=>push(`isf_${c.id}_${em}`,em,IS_FAN_PRIZE,`${c.name}・加油第一名`));
  S.set(K.ptGrants,L.slice(-2000)); c.paid=Date.now(); A.past=(A.past||[]).concat([{id:c.id,name:c.name,top:md.GM.slice(0,3),at:Date.now()}]).slice(-10); A.cur=c; S.set(IS_KEY,A); }catch(e){} }
setInterval(isPay,60e3); setTimeout(isPay,14e3);
const isTile=()=>{ const c=isCur(); return c&&c.st==="on"?"● 開幕中":isWin()?"等開幕":"中秋・過年"; };

/* 小遊戲本體在 js/23-偶運小遊戲.js */
function isDone(ev,v){ const G=ui.isG; if(!G||G.fin) return; G.fin=true; const c=isCur(), mid=(session()||{}).member; if(!c||!mid) return; const E=IS_EV[ev]; c.sc=c.sc||{}; const B=c.sc[ev]=c.sc[ev]||{}, o=B[mid]=B[mid]||{best:null,n:0,day:""};
  const rk0=isBoard(c,ev).findIndex(([m])=>m===mid);
  if(o.day!==isDay()){ o.day=isDay(); o.n=0; } o.n++; const better=o.best==null||(E.hi?v>o.best:v<o.best); if(better) o.best=v; isPut(c);
  const rk1=isBoard(c,ev).findIndex(([m])=>m===mid)+1, lf=isTriesLeft(c,ev,mid), md=["金牌","銀牌","銅牌"][rk1-1];
  const b=document.getElementById("isBtns"); if(b) b.innerHTML=`<p class="is-res">${isFmt(ev,v)} ${E.unit}${better?"・新紀錄！":""}</p><button class="is-big" data-a="isQuit">好</button>`;
  setTimeout(()=>{ if(ui.isG) ui.isG.dead=true; ui.isG=null; xvResult({tone:"b",small:`${E.n}・今天第 ${o.n} 次`,title:`${isFmt(ev,v)} ${E.unit}${better?"！":""}`,big:rk0>=0&&rk0+1!==rk1?`第 ${rk0+1} → 第 ${rk1}`:`第 ${rk1} 名`,chips:[...(better?["新紀錄"]:[`最好 ${isFmt(ev,o.best)} ${E.unit}`]),...(md?[`${md} +${IS_MEDAL[rk1-1]}（閉幕時）`]:[]),lf>0?`今天還能比 ${lf} 次`:"今天用完了"],share:`data-a="isShare" data-v="${ev}"`,back:"回到運動會"}); },1100); }
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a; if(!/^is[A-Z]/.test(a)) return;
  switch(a){
    case "isPlay": isGame(t.dataset.v); break;
    case "isAct": if(ui.isG&&ui.isG.act) ui.isG.act(t.dataset.v); break;
    case "isQuit": if(ui.isG) ui.isG.dead=true; ui.isG=null; layer.innerHTML=""; render(); break;
    case "isCheer": { const c=isCur(), em=myEmail(), g=t.dataset.v; if(!c||c.st!=="on"||!em) break; const day=isDay(), k=em+"|"+day; ui.isCh=ui.isCh||{}; const cnt=(c.chd||{})[k+"|"+g]||0; if(cnt>=IS_CHEER_DAY){ toast(`今天幫這團加油 ${IS_CHEER_DAY} 次了，明天再來`); break; }
      c.ch=c.ch||{}; c.ch[g]=c.ch[g]||{}; c.ch[g][em]=(c.ch[g][em]||0)+1; c.chd=c.chd||{}; c.chd[k+"|"+g]=cnt+1; Object.keys(c.chd).forEach(x=>{ if(!x.includes("|"+day+"|")) delete c.chd[x]; }); isPut(c); fanEarn("ischeer",5,{cap:50,quiet:1}); t.classList.remove("pop"); void t.offsetWidth; t.classList.add("pop"); const sm=t.querySelector("small"); if(sm) sm.textContent=fmt(c.ch[g][em]); break; }
    case "isOpen": { const w=isWin(); if(!w&&!demoOn()){ toast("只有中秋、過年前後可以開幕"); break; } const days=+((document.getElementById("isDays")||{}).value||2); const id="is"+Date.now().toString(36);
      isPut({id,name:`${w?w.y+" "+w.n:"特別"}偶像運動會`,st:"on",start:Date.now(),end:Date.now()+days*864e5,sc:{},ch:{}}); render(); toast("運動會開幕！"); break; }
    case "isClose": ask("現在閉幕並發獎？",()=>{ const c=isGet().cur; if(!c) return; c.end=Date.now(); c.st="done"; isPut(c); isPay(); render(); }); break;
  } });
function isAdminHtml(){ const c=isGet().cur, w=isWin(), on=c&&c.st==="on", md=c?isMedals(c):{GM:[]}, ch=c?isCheerTop(c):[], ppl=c?new Set(Object.values(c.sc||{}).flatMap(o=>Object.keys(o))).size:0;
  const top=on?xvHero({tone:"b",tag:"● 進行中",small:esc(c.name),title:`還有 ${vsLeft(c.end).replace("剩 ","")}`,meta:`${ppl} 位藝人參加・加油 ${fmt(ch.reduce((n,x)=>n+x[1],0))} 次`,btns:[["閉幕並發獎",`data-a="isClose"`,1]]})
    :w?xvHero({tone:"b",tag:"可以開幕",small:"IDOL STAR ATHLETICS",title:`${w.y} ${w.n}運動會`,meta:"開幕後藝人每項每天可以比 3 次，閉幕時自動發獎牌和積分",extra:`<label class="is2-days">天數<select id="isDays"><option value="2">2 天</option><option value="1">1 天</option></select></label>`,btns:[["開幕",`data-a="isOpen"`]]})
    :xvHero({tone:"b",small:"IDOL STAR ATHLETICS",title:"還不能開幕",meta:`中秋、過年前後三週內才能開幕・${isNextTxt()}`});
  return `<div class="xv is2">${top}${c?xvStats([[ppl,"參賽藝人"],[md.GM.length,"拿牌的團"],[fmt(ch.reduce((n,x)=>n+x[1],0)),"加油"]]):""}
    ${on&&md.GM.length?xvSh("獎牌榜")+md.GM.slice(0,5).map(([g,a],i)=>xvRow({...xvGAv(g),title:esc((groupOf(g)||{}).name||""),sub:`🥇 ${a[0]}　🥈 ${a[1]}　🥉 ${a[2]}`,right:xvChip(`第 ${i+1}`)})).join(""):""}
    ${(isGet().past||[]).length?xvSh("歷屆")+(isGet().past||[]).slice(-3).reverse().map(p=>xvRow({av:"🏅",sq:1,avStyle:"background:var(--s2)",title:esc(p.name),sub:(p.top||[]).map(([g])=>esc((groupOf(g)||{}).name||"")).join(" › ")})).join(""):""}</div>`; }


