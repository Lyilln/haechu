/* HAECHU｜世巡、SHOP */
/* =========================================================
   世巡＋地圖
   ・藝人在 FOC 申請（名稱＋站點），管理員在 FOC → 世巡 核准／退回
   ・核准後每一站自動排成一場「演唱會燈海」（2 小時）；粉絲用 3,500 積分買票才能進場，進場就在地圖上蓋章
   ・照積分表：每一站算一場演唱會 +3,000；一年一次世巡、最多 5 站（算在「今年打歌積分」的顯示）
   ・開場前藝人可以說一句話，推播給買票的粉絲
   ・核准、每站結束、全部結束都會自動出一則娛樂新聞
   ========================================================= */
const TOUR_TIX=3500, TOUR_STOP_PTS=3000, TOUR_DONE_PTS=0, TOUR_MINS=120, TOUR_MAX_STOPS=5;
/* 一年一次：同一團、同一年（看第一站）已經有審核中或核准的世巡 */
const tourYearTaken=(gid,y)=>getTours().some(t=>t.gid===gid&&(t.status==="pending"||t.status==="approved")&&t.stops&&t.stops.length&&new Date(Math.min(...t.stops.map(x=>x.startTs))).getFullYear()===y);
const TOUR_CITIES=[["首爾",37.57,126.98],["釜山",35.18,129.08],["東京",35.68,139.69],["大阪",34.69,135.5],["名古屋",35.18,136.91],["福岡",33.59,130.4],["台北",25.03,121.56],["高雄",22.63,120.3],["香港",22.32,114.17],["澳門",22.2,113.54],["曼谷",13.76,100.5],["新加坡",1.35,103.82],["吉隆坡",3.14,101.69],["馬尼拉",14.6,120.98],["雅加達",-6.21,106.85],["胡志明市",10.82,106.63],["雪梨",-33.87,151.21],["墨爾本",-37.81,144.96],["奧克蘭",-36.85,174.76],["洛杉磯",34.05,-118.24],["舊金山",37.77,-122.42],["西雅圖",47.61,-122.33],["拉斯維加斯",36.17,-115.14],["達拉斯",32.78,-96.8],["芝加哥",41.88,-87.63],["紐約",40.71,-74.01],["亞特蘭大",33.75,-84.39],["多倫多",43.65,-79.38],["溫哥華",49.28,-123.12],["墨西哥城",19.43,-99.13],["聖保羅",-23.55,-46.63],["布宜諾斯艾利斯",-34.6,-58.38],["聖地牙哥",-33.45,-70.67],["倫敦",51.51,-0.13],["巴黎",48.86,2.35],["柏林",52.52,13.4],["阿姆斯特丹",52.37,4.9],["馬德里",40.42,-3.7],["米蘭",45.46,9.19],["杜拜",25.2,55.27]];
const cityOf=n=>TOUR_CITIES.find(c=>c[0]===n);
/* 地圖投影（Miller）：跟 TOUR_LAND 的陸地是同一套，寬 1000、高 474 */
const tourXY=(lat,lon)=>{ const Y=a=>1.25*Math.log(Math.tan(Math.PI/4+.4*a*Math.PI/180)), s=1000/(2*Math.PI); lat=Math.max(-58,Math.min(80,lat)); return [(lon+180)/360*1000,(Y(80)-Y(lat))*s]; };
const getTours=()=>(S.get(K.wtours,[])||[]).filter(t=>groupOf(t.gid)).sort((a,b)=>(b.ts||0)-(a.ts||0));
/* 示範世巡（跟示範演唱會一樣）：藝人端 HUSSEY／試玩、粉絲端試玩時才看得到；不存、不算積分、不用買票 */
function tourDemo(){ try{ const s=session(); if(!s) return null; const r=route().role; let gid=null;
    if(r==="artist"&&demoOn()){ const m=MEMBERS[demoMid()]; gid=m&&m.group; } else if(r==="fan"&&sbxOn()){ gid=coreStickGroup(); }
    if(!gid||!groupOf(gid)) return null; const D=864e5, H=36e5, n=Date.now(), d0=new Date(n); d0.setHours(19,0,0,0); const base=d0.getTime();
    const mk=(id,city,st,dur,msg)=>({id:"wtd_"+id,city,startTs:st,msg,dcc:{id:"wtdc_"+id,startTs:st,endTs:st+dur,ended:st+dur<=n}});
    return {id:"wt_demo",demo:true,gid,title:"示範世巡",status:"approved",ts:n,stops:[mk(1,"首爾",base-6*D,2*H,"首爾，好久不見！"),mk(2,"東京",base-3*D,2*H,"東京的大家，謝謝你們 💜"),mk(3,"台北",n-30*60e3,2*H,"台北！今天也一起玩吧"),mk(4,"新加坡",base+3*D,2*H,""),mk(5,"洛杉磯",base+8*D,2*H,"")]}; }catch(e){ return null; } }
const toursShown=()=>{ const d=tourDemo(); return d?[d,...getTours()]:getTours(); };
const tourOf=id=>toursShown().find(t=>t.id===id);
const myTix=()=>S.get(K.tourTix,{})||{}, myStamps=()=>S.get(K.tourStamp,{})||{};
const stopCC=st=>st&&st.dcc?st.dcc:st&&st.cid?S.get(K.concerts,[]).find(c=>c.id===st.cid):null;
function stopState(st){ const c=stopCC(st), n=Date.now(); if(!c) return "off"; if(c.ended||c.endTs<=n) return "done"; if(c.startTs<=n) return "live"; return "soon"; }
const tourStops=t=>(t.stops||[]).slice().sort((a,b)=>a.startTs-b.startTs);
function wtDone(t){ const L=tourStops(t).filter(st=>stopState(st)!=="off"); return L.length&&L.every(st=>stopState(st)==="done"); }
function tourPts(gid,{year=null}={}){ let n=0; getTours().filter(t=>t.gid===gid&&t.status==="approved").forEach(t=>{ const L=tourStops(t);
  L.forEach(st=>{ const c=stopCC(st); if(stopState(st)==="done"&&(!year||new Date(c.endTs).getFullYear()==year)) n+=TOUR_STOP_PTS; });
  if(wtDone(t)){ const last=stopCC(L[L.length-1]); if(!year||(last&&new Date(last.endTs).getFullYear()==year)) n+=TOUR_DONE_PTS; } }); return n; }
const tourMD=ts=>{ const d=new Date(ts); return `${d.getMonth()+1}.${pad(d.getDate())}`; };
/* 手繪感的世界地圖：真實的陸地形狀＋紙張底色、手抖邊、虛線航線、圖釘和印章 */
function tourMapHtml(t,{stamps={}}={}){ const L=tourStops(t), g=groupOf(t.gid), col=g?gTheme(g.id):"#8843FB", P=L.map(st=>{ const c=cityOf(st.city)||[st.city,0,0]; return tourXY(c[1],c[2]); });
  const nx=L.findIndex(st=>stopState(st)!=="done"&&stopState(st)!=="off");
  const route=P.slice(1).map((p,i)=>{ const a=P[i], mx=(a[0]+p[0])/2, my=(a[1]+p[1])/2-Math.min(60,Math.hypot(p[0]-a[0],p[1]-a[1])*.25); return `M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`; }).join("");
  const cx=P.length?P[Math.max(0,nx)][0]:500;   // 地圖先捲到下一站（都辦完就第一站）
  return `<div class="trm" data-cx="${cx.toFixed(0)}"><svg viewBox="0 0 1000 474" role="img" aria-label="${esc(t.title)} 巡演地圖">
    <defs><filter id="trWob" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="3.2"/></filter>
      <pattern id="trWave" width="44" height="22" patternUnits="userSpaceOnUse"><path d="M2 12q5-5 10 0t10 0" fill="none" stroke="#9DCDE6" stroke-width="1.2" stroke-linecap="round" opacity=".55"/></pattern></defs>
    <rect width="1000" height="474" fill="#CFEAF7"/><rect width="1000" height="474" fill="url(#trWave)"/>
    <g filter="url(#trWob)"><path d="${TOUR_LAND}" fill="#D9B98E" transform="translate(1.6 2.4)"/><path d="${TOUR_LAND}" fill="#FFF6E6"/></g>
    ${route?`<path d="${route}" fill="none" stroke="${col}" stroke-width="2.6" stroke-dasharray="7 6" stroke-linecap="round" opacity=".9"/>`:""}
    ${L.map((st,i)=>{ const [x,y]=P[i], s=stopState(st), on=i===nx, stp=stamps[st.id];
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" class="trm-pin ${s} ${on?"next":""}">${on?`<circle r="15" fill="${col}" opacity=".25" class="trm-pulse"/>`:""}
        <circle r="8.5" fill="${s==="done"?col:"#fff"}" stroke="${col}" stroke-width="3"/>${s==="done"?`<path d="M-3.6 .2l2.4 2.4 4.6-5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`:`<text y="3.6" text-anchor="middle" font-size="10" font-weight="800" fill="${col}">${i+1}</text>`}
        <text y="-15" text-anchor="middle" class="trm-lab" fill="#5B3A2A" stroke="#FFF6E6" stroke-width="4" paint-order="stroke" stroke-linejoin="round">${esc(st.city)}</text>
        ${stp?`<g transform="translate(-17 15) rotate(-14)"><circle r="13" fill="none" stroke="#E04F86" stroke-width="2" stroke-dasharray="3 2"/><text y="3.5" text-anchor="middle" font-size="8.5" font-weight="900" fill="#E04F86">到此</text></g>`:""}</g>`; }).join("")}
  </svg></div>`; }
function trmScroll(){ document.querySelectorAll(".trm:not([data-sc])").forEach(m=>{ m.dataset.sc="1"; const sv=m.querySelector("svg"); if(!sv) return; const k=sv.clientWidth/1000; m.scrollLeft=Math.max(0,(+m.dataset.cx||500)*k-m.clientWidth/2); }); }
/* ---------- 粉絲端（11/12 改版：入口＝大卡＋各站；點進去＝巡演護照） ---------- */
const TR_FLAG={首爾:"🇰🇷",釜山:"🇰🇷",東京:"🇯🇵",大阪:"🇯🇵",名古屋:"🇯🇵",福岡:"🇯🇵",台北:"🇹🇼",高雄:"🇹🇼",香港:"🇭🇰",澳門:"🇲🇴",曼谷:"🇹🇭",新加坡:"🇸🇬",吉隆坡:"🇲🇾",馬尼拉:"🇵🇭",雅加達:"🇮🇩",胡志明市:"🇻🇳",雪梨:"🇦🇺",墨爾本:"🇦🇺",奧克蘭:"🇳🇿",洛杉磯:"🇺🇸",舊金山:"🇺🇸",西雅圖:"🇺🇸",拉斯維加斯:"🇺🇸",達拉斯:"🇺🇸",芝加哥:"🇺🇸",紐約:"🇺🇸",亞特蘭大:"🇺🇸",多倫多:"🇨🇦",溫哥華:"🇨🇦",墨西哥城:"🇲🇽",聖保羅:"🇧🇷",布宜諾斯艾利斯:"🇦🇷",聖地牙哥:"🇨🇱",倫敦:"🇬🇧",巴黎:"🇫🇷",柏林:"🇩🇪",阿姆斯特丹:"🇳🇱",馬德里:"🇪🇸",米蘭:"🇮🇹",杜拜:"🇦🇪"};
const TR_EN={首爾:"SEOUL",釜山:"BUSAN",東京:"TOKYO",大阪:"OSAKA",名古屋:"NAGOYA",福岡:"FUKUOKA",台北:"TAIPEI",高雄:"KAOHSIUNG",香港:"HONG KONG",澳門:"MACAU",曼谷:"BANGKOK",新加坡:"SINGAPORE",吉隆坡:"KUALA LUMPUR",馬尼拉:"MANILA",雅加達:"JAKARTA",胡志明市:"HO CHI MINH",雪梨:"SYDNEY",墨爾本:"MELBOURNE",奧克蘭:"AUCKLAND",洛杉磯:"LOS ANGELES",舊金山:"SAN FRANCISCO",西雅圖:"SEATTLE",拉斯維加斯:"LAS VEGAS",達拉斯:"DALLAS",芝加哥:"CHICAGO",紐約:"NEW YORK",亞特蘭大:"ATLANTA",多倫多:"TORONTO",溫哥華:"VANCOUVER",墨西哥城:"MEXICO CITY",聖保羅:"SÃO PAULO",布宜諾斯艾利斯:"BUENOS AIRES",聖地牙哥:"SANTIAGO",倫敦:"LONDON",巴黎:"PARIS",柏林:"BERLIN",阿姆斯特丹:"AMSTERDAM",馬德里:"MADRID",米蘭:"MILAN",杜拜:"DUBAI"};
const trFlag=c=>TR_FLAG[c]||"📍";
const trYMD=ts=>{ const d=new Date(ts); return `${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())}`; };
/* 一站的購票／進場按鈕（粉絲端入口和護照共用） */
function trStopAct(t,st){ const s=stopState(st), has=t.demo||!!myTix()[st.id], stp=myStamps()[st.id];
  if(s==="off") return xvChip("取消");
  if(s==="done") return stp?xvChip("已蓋章","ok"):xvChip(has?"已結束":"沒去");
  if(s==="live") return has?xvBtn("進場",t.demo?`data-a="lsDemoPlay" data-v="demo"`:`data-a="concertOn"`):xvBtn(`購票 ${fmt(TOUR_TIX)}`,`data-a="tourBuy" data-v="${t.id}" data-s="${st.id}"`);
  return has?xvChip("已購票","on"):xvBtn("購票",`data-a="tourBuy" data-v="${t.id}" data-s="${st.id}"`); }
const trStopRow=(t,st)=>{ const s=stopState(st), c=stopCC(st); return xvRow({av:trFlag(st.city),sq:1,avStyle:"background:var(--s2)",title:esc(st.city),sub:`${c?evWhen(c.startTs):tourMD(st.startTs)}${s==="done"?"・已結束":s==="live"?"・● 進行中":""}${st.msg?`<br>「${esc(st.msg)}」`:""}`,right:trStopAct(t,st)}); };
function trTag(t){ const L=tourStops(t), n=Date.now(); if(wtDone(t)) return "巡演完成"; if(L.some(st=>stopState(st)==="live")) return "● 進行中"; if(L.some(st=>stopState(st)==="done")) return "巡演中";
  const f=L[0], c=f&&stopCC(f); const d=c?Math.ceil((c.startTs-n)/864e5):0; return d>0?`${d} 天後開始`:"即將開始"; }
function trDots(t){ const L=tourStops(t).filter(st=>stopState(st)!=="off"); if(!L.length) return "";
  return `<div class="xv-dots">${L.map((st,i)=>`${i?"<s></s>":""}<i class="${stopState(st)==="done"||stopState(st)==="live"?"on":""}"></i>`).join("")}</div><div class="xv-dl">${L.map(st=>`<span>${esc(st.city)}</span>`).join("")}</div>`; }
function viewTourFan(id){ const fol=followed(), stamps=myStamps();
  if(id) return viewTourPass(id);
  const L=toursShown().filter(t=>t.status==="approved").sort((a,b)=>(wtDone(a)-wtDone(b))||(fol.includes(b.gid)-fol.includes(a.gid))||((b.ts||0)-(a.ts||0)));
  if(!L.length) return coreHead("世巡")+`<main class="page xv tr2">${xvHero({tone:"g",small:"WORLD TOUR",title:"目前沒有世界巡演",meta:"藝人申請、管理員核准後，巡演就會出現在這裡"})}
    ${xvSh("要怎麼參加")}${xvHow([["🎫",`每站買票<br>${fmt(TOUR_TIX)} 積分`],["🗺️","進場就<br>蓋一個章"],["📘","蓋滿五站<br>護照變金色"],["💰","剩下全買<br>打 9 折"]])}</main>`;
  const t=L[0], g=groupOf(t.gid), S2=tourStops(t), d=S2.filter(st=>stopState(st)==="done").length, nS=S2.filter(st=>stamps[st.id]).length;
  return coreHead("世巡")+`<main class="page xv tr2">${xvHero({tone:"g",tag:trTag(t),small:`${esc(g.name)} WORLD TOUR`,title:`〈${esc(t.title)}〉`,meta:`已完成 ${d} 站・我蓋了 ${nS} 個章`,extra:trDots(t),btns:[["📘 我的巡演護照",`data-a="tourOpen" data-v="${t.id}"`]]})}
    ${xvSh("各站",`一張 ${fmt(TOUR_TIX)}・剩下全買 9 折`)}${S2.map(st=>trStopRow(t,st)).join("")}
    ${L.length>1?xvSh("其他巡演",`${L.length-1} 個`)+L.slice(1).map(x=>{ const gg=groupOf(x.gid), LL=tourStops(x), dd=LL.filter(st=>stopState(st)==="done").length; return xvRow({...xvGAv(x.gid),title:`${esc(gg.name)}〈${esc(x.title)}〉`,sub:`${LL.length} 站・${wtDone(x)?"巡演完成":`已完成 ${dd} 站`}`,right:xvChip(trTag(x),wtDone(x)?"":"on"),attrs:`data-a="tourOpen" data-v="${x.id}"`}); }).join(""):""}</main>`; }
/* 巡演護照：封面 → 蓋章頁 → 地圖；左右滑。全部蓋滿封面變金色 */
function viewTourPass(id){ const t=tourOf(id); if(!t||t.status!=="approved") return coreHead("世巡")+`<main class="page"><p class="me-none">這個巡演已經取消</p></main>`;
  const g=groupOf(t.gid), L=tourStops(t), live=L.filter(st=>stopState(st)!=="off"), stamps=myStamps(), nS=live.filter(st=>stamps[st.id]).length, full=live.length&&nS===live.length;
  ui.trAnim=ui.trAnim||{}; const fresh=st=>{ const ts=stamps[st.id]; if(!ts||Date.now()-ts>864e5||ui.trAnim[st.id]) return false; ui.trAnim[st.id]=1; return true; };
  setTimeout(()=>{ trmScroll(); const p=document.querySelector(".trp-pages"); if(p&&!p.dataset.on){ p.dataset.on="1"; const dots=document.querySelectorAll(".trp-dot i"); p.addEventListener("scroll",()=>{ const k=Math.round(p.scrollLeft/p.clientWidth); dots.forEach((x,i)=>x.classList.toggle("on",i===k)); },{passive:true}); } },0);
  const cover=`<div class="trp-pg"><div class="trp-cov ${full?"gold":""}" style="--gt:${gTheme(t.gid)}"><small>WORLD TOUR PASSPORT</small><div class="trp-ico">${full?"🏆":"🌍"}</div><b>${esc(t.title)}</b><span>${esc(g.name)}</span><em>${nS} / ${live.length} STAMPS${full?"・COMPLETE":""}</em></div></div>`;
  const page=`<div class="trp-pg"><div class="trp-paper"><div class="trp-grid">${L.map((st,i)=>{ const s=stopState(st), ts=stamps[st.id];
      return ts?`<div class="trp-st ${i%2?"b":""} ${fresh(st)?"in":""}"><b>${esc(TR_EN[st.city]||st.city)}</b><small>${trYMD(ts)}</small><span>${trFlag(st.city)}</span></div>`:`<div class="trp-st e"><b>${esc(TR_EN[st.city]||st.city)}</b><small>${s==="done"?"沒去":s==="off"?"取消":tourMD(st.startTs)}</small></div>`; }).join("")}</div></div></div>`;
  const map=`<div class="trp-pg"><div class="trp-map">${tourMapHtml(t,{stamps})}</div></div>`;
  return coreHead("我的巡演護照")+`<main class="page xv tr2"><div class="trp"><div class="trp-pages">${cover}${page}${map}</div><div class="trp-dot"><i class="on"></i><i></i><i></i></div><p class="trp-hint">← 左右滑翻頁 →</p></div>
    ${xvSh("各站",`一張 ${fmt(TOUR_TIX)}・剩下全買 9 折`)}${L.map(st=>trStopRow(t,st)).join("")}
    ${full?`<button class="xv-big" data-a="trShare" data-v="${t.id}">分享護照到 SNS</button>`:""}</main>`; }
/* ---------- 藝人端 ---------- */
function viewTourArtist(mid){ const gid=MEMBERS[mid].group, mine=toursShown().filter(t=>t.gid===gid), d=ui.trDraft;
  const form=d?`<section class="card studio tr-form"><div class="foc-cfg-h"><h3>申請世巡</h3><span class="badge">最多 ${TOUR_MAX_STOPS} 站</span></div>
      <span class="fld-lab">巡演名稱</span><label class="field"><input id="trTi" maxlength="40" placeholder="輸入文字" value="${esc(d.title)}"></label>
      <span class="fld-lab">站點（${d.stops.length} / ${TOUR_MAX_STOPS}）</span>${d.stops.length?`<div class="tr-dl">${d.stops.slice().sort((a,b)=>a.startTs-b.startTs).map(st=>`<div class="tr-di"><b>${trFlag(st.city)} ${esc(st.city)}</b><small>${evWhen(st.startTs)}</small><button data-a="trStopDel" data-v="${st.id}" aria-label="刪掉這站">${XI}</button></div>`).join("")}</div>`:""}
      <div class="tr-add"><label class="field"><select id="trCity">${TOUR_CITIES.map(c=>`<option ${d.city===c[0]?"selected":""}>${c[0]}</option>`).join("")}</select></label><label class="field"><input id="trWhen" type="datetime-local" value="${esc(d.when||dtLocal(Math.ceil((Date.now()+2*36e5)/36e5)*36e5))}" min="${dtLocal(Date.now()+36e5)}"></label><button class="btn btn-soft" data-a="trStopAdd">加入</button></div>
      <div class="ls-btns"><button class="btn btn-soft" data-a="trCancel">取消</button><button class="btn btn-main" data-a="trSubmit">送出申請</button></div></section>`:"";
  if(mine.some(t=>t.status==="approved")) setTimeout(trmScroll,0);
  const act=mine.find(t=>t.status==="approved"&&!wtDone(t)), pend=mine.filter(t=>t.status==="pending"||t.status==="rejected"), past=mine.filter(t=>t.status==="approved"&&wtDone(t));
  let top="";
  if(act){ const L=tourStops(act), live=L.filter(st=>stopState(st)!=="off"), dn=live.filter(st=>stopState(st)==="done").length, nx=live.find(st=>stopState(st)==="live")||live.find(st=>stopState(st)==="soon"), c=nx&&stopCC(nx);
    const on=nx&&stopState(nx)==="live", dd=c?Math.ceil((c.startTs-Date.now())/864e5):0;
    const btns=on?[["進場",`data-a="${act.demo?"lsDemo":"stOn"}"`]]:nx&&!nx.msg&&!act.demo?[["留一句話給粉絲",`data-a="trSay" data-v="${act.id}" data-s="${nx.id}"`]]:[];
    top=xvHero({tone:"g",tag:on?"● 進行中":dd>0?`下一站 ${dd} 天後`:"下一站快到了",small:`WORLD TOUR〈${esc(act.title)}〉`,title:nx?`${trFlag(nx.city)} ${esc(nx.city)}站`:esc(act.title),meta:nx?`${c?evWhen(c.startTs):""}${nx.msg?`・「${esc(nx.msg)}」`:""}`:"",extra:trDots(act),btns})
      +xvStats([[`${dn}/${live.length}`,"已完成"],[`+${fmt(dn*TOUR_STOP_PTS)}`,"已拿到"],[`+${fmt((live.length-dn)*TOUR_STOP_PTS)}`,"還能拿"]])
      +xvSh("各站",`一站 +${fmt(TOUR_STOP_PTS)}`)+L.map(st=>{ const s=stopState(st), cc=stopCC(st);
        return xvRow({av:trFlag(st.city),sq:1,avStyle:"background:var(--s2)",title:esc(st.city),sub:`${evWhen(cc?cc.startTs:st.startTs)}${st.msg?`<br>「${esc(st.msg)}」`:s==="soon"?"<br>還沒留話":""}`,
          right:s==="done"?xvChip(`+${fmt(TOUR_STOP_PTS)}`,"ok"):s==="live"?xvBtn("進場",`data-a="${act.demo?"lsDemo":"stOn"}"`):s==="off"?xvChip("取消"):st===nx?(!st.msg&&!act.demo?xvBtn("說一句話",`data-a="trSay" data-v="${act.id}" data-s="${st.id}"`):xvChip("下一站","on")):(!st.msg&&!act.demo?xvBtn("說一句話",`data-a="trSay" data-v="${act.id}" data-s="${st.id}"`,"g"):"")}); }).join("")
      +`<div class="trp-map sm">${tourMapHtml(act)}</div>`;
  } else if(!d){ const taken=tourYearTaken(gid,new Date().getFullYear());
    top=xvHero({tone:"g",small:"WORLD TOUR",title:taken?"今年的世巡辦過了":"辦一場世界巡演",meta:taken?"一年一次世巡，明年再來申請吧":`最多 ${TOUR_MAX_STOPS} 站，每一站都會排成一場演唱會`,btns:taken?[]:[["申請世巡",`data-a="trNew"`]]})
      +xvSh("怎麼辦世巡")+xvHow([["📝","申請<br>名稱＋站點"],["✅","管理員<br>核准"],["🎤","每站一場<br>演唱會"],["💜",`一站<br>+${fmt(TOUR_STOP_PTS)}`]]); }
  const ST={pending:["審核中","w"],rejected:["沒有通過",""]};
  return `<main class="page foc xv tr2">${form}${top}
    ${pend.length?xvSh("申請")+pend.map(t=>xvRow({av:"📝",sq:1,avStyle:"background:var(--s2)",title:esc(t.title),sub:`${tourStops(t).map(st=>esc(st.city)).join(" → ")}${t.status==="rejected"&&t.why?`<br>${esc(t.why)}`:""}`,right:xvChip(...(ST[t.status]||["",""]))})).join(""):""}
    ${past.length?xvSh("之前的世巡")+past.map(t=>xvRow({av:"🏆",sq:1,avStyle:"background:var(--s2)",title:esc(t.title),sub:`${tourStops(t).length} 站・巡演完成`,right:xvChip(`+${fmt(tourStops(t).filter(st=>stopState(st)==="done").length*TOUR_STOP_PTS+TOUR_DONE_PTS)}`,"ok")})).join(""):""}
    ${act||!d?`<p class="xv-note">一年一次世巡、最多 ${TOUR_MAX_STOPS} 站</p>`:""}</main>`; }
/* ---------- 管理員 ---------- */
function tourAdminHtml(){ const L=getTours(), P=L.filter(t=>t.status==="pending"), A=L.filter(t=>t.status==="approved"&&!wtDone(t)), D=L.filter(t=>t.status==="approved"&&wtDone(t));
  const cur=xvSegCur("tour",P.length?"pend":"on"), y=new Date().getFullYear();
  const stops=(t,adm)=>tourStops(t).map(st=>{ const s=t.status==="approved"?stopState(st):"", c=stopCC(st); return `<div class="tr2-s"><span>${trFlag(st.city)} ${esc(st.city)}</span><small>${evWhen(c?c.startTs:st.startTs)}${s==="done"?"・已結束":s==="live"?"・● 進行中":s==="off"?"・已取消":""}</small>${adm&&s!=="done"&&s!=="live"&&s!=="off"?`<button class="xv-bt g" data-a="trStopRm" data-v="${t.id}" data-s="${st.id}">刪除</button>`:""}</div>`; }).join("");
  const card=(t,k)=>{ const g=groupOf(t.gid), Ls=tourStops(t), dn=Ls.filter(st=>stopState(st)==="done").length;
    return `<section class="tr2-c">${xvRow({...xvGAv(t.gid),title:`${esc(g.name)}〈${esc(t.title)}〉`,sub:k==="pend"?`${Ls.length} 站・${Ls.map(st=>esc(st.city)).join(" → ")}`:k==="on"?`${dn}/${Ls.length} 站`:`${Ls.length} 站・巡演完成`,right:xvChip(k==="pend"?"待審核":k==="on"?"巡演中":"已結束",k==="pend"?"w":k==="on"?"ok":"")})}
      <div class="tr2-sl">${stops(t,k==="on")}</div>
      ${k==="pend"?`<div class="tr2-b"><button class="xv-bt g" data-a="trReject" data-v="${t.id}">退回</button><button class="xv-bt" data-a="trApprove" data-v="${t.id}">核准</button></div>`:k==="on"?`<div class="tr2-b"><button class="xv-bt g" data-a="trEnd" data-v="${t.id}">取消世巡</button></div>`:""}</section>`; };
  const list=cur==="pend"?P:cur==="on"?A:D;
  return `<div class="xv tr2">${xvStats([[P.length,"待審核"],[A.length,"巡演中"],[D.filter(t=>tourStops(t).some(st=>{ const c=stopCC(st); return c&&new Date(c.endTs).getFullYear()===y; })).length,"今年辦完"]])}
    <div style="margin-top:12px">${xvSeg("tour",[["pend",`待審核 ${P.length}`],["on",`巡演中 ${A.length}`],["done",`已結束 ${D.length}`]],cur)}</div>
    <div style="margin-top:12px">${list.length?list.map(t=>card(t,cur)).join(""):xvEmpty(cur==="pend"?"沒有待審核的申請":cur==="on"?"現在沒有巡演":"還沒有辦完的世巡")}</div>
    <p class="xv-note">世巡由藝人在 FOC 申請：一年一次、最多 ${TOUR_MAX_STOPS} 站，核准後每一站自動排成演唱會</p></div>`; }
const trKeep=()=>{ const d=ui.trDraft; if(!d) return; const a=document.getElementById("trTi"), b=document.getElementById("trCity"), c=document.getElementById("trWhen"); if(a) d.title=a.value; if(b) d.city=b.value; if(c) d.when=c.value; };
function tourApprove(id){ const all=S.get(K.wtours,[])||[], t=all.find(x=>x.id===id); if(!t) return;
  const list=S.get(K.concerts,[]), add=[];
  for(const st of tourStops(t)){ const s0=st.startTs, e0=s0+TOUR_MINS*60e3, clash=[...list,...add].find(c=>!c.ended&&c.startTs<e0&&c.endTs>s0);
    if(clash){ toast(`${st.city}站跟「${groupOf(clash.gid)?groupOf(clash.gid).name+"・":""}${clash.title}」時間重疊了`); return; }
    if(s0<Date.now()){ toast(`${st.city}站的時間已經過了`); return; } add.push({id:"cc"+Date.now()+st.id.slice(-4),gid:t.gid,title:`${t.title}・${st.city}`,startTs:s0,endTs:e0,ended:false,notified:false,host:null,co:null,setlist:null,nIa:0,tour:t.id,stop:st.id}); }
  saveConcerts([...list,...add]); add.forEach(c=>{ const st=t.stops.find(x=>x.id===c.stop); if(st) st.cid=c.id; });
  t.status="approved"; t.okTs=Date.now(); S.set(K.wtours,all);
  const g=groupOf(t.gid); muNotify(`🌍 ${g.name} 世界巡演「${t.title}」確定！共 ${t.stops.length} 站，到 FEST →世巡 購票`,t.gid); toast("已核准，每一站都排成演唱會了"); }
/* 進場：世巡的站要有票；進場就蓋章 */
function tourGate(){ const c=liveConcert(); if(!c||!c.stop) return true; if(myTix()[c.stop]){ const s=myStamps(); if(!s[c.stop]){ s[c.stop]=Date.now(); S.set(K.tourStamp,s); } return true; }
  const t=tourOf(c.tour); if(t) tourBuyAsk(t.id,c.stop); return false; }
function tourBuyAsk(tid,sid){ const t=tourOf(tid), st=t&&t.stops.find(x=>x.id===sid); if(!st) return; if(isSelfGid(t.gid)){ toast(selfBuyMsg()); return; }
  const rest=tourRest(t), all=rest.length>1?Math.round(rest.length*TOUR_TIX*.9):0;
  iosAlert(`${esc(st.city)}站門票`,`${esc(t.title)}<br>${fmt(TOUR_TIX)} 積分・目前有 ${fmt(points())} 積分${all?`<br>一次買剩下 ${rest.length} 站打 9 折：${fmt(all)} 積分`:""}`,`<button data-a="tCloseLayer">取消</button>${all?`<button data-a="tourBuyAll" data-v="${tid}">全部站</button>`:""}<button data-a="tourBuyOk" data-v="${tid}" data-s="${sid}">購買</button>`); }
/* 世巡還沒買、還沒結束的站（一次全買打 9 折） */
const tourRest=t=>{ const tx=myTix(); return (t&&t.stops||[]).filter(s=>!tx[s.id]&&(s.startTs||0)+120*60e3>Date.now()); };
function viewCoreSub(page,id){
  if(page==="tour") return viewTourFan(id);
  if(page==="truck") return viewTruckFan();
  if(page==="biz") return coreHead("代言・雜誌")+viewBizFan(id);
  if(page==="cafe") return coreHead("生日咖啡廳")+viewCafe(id);
  if(page==="wiki") return coreHead("SKpedia")+viewWiki(id);
  if(page==="isac") return coreHead("偶像運動會")+viewIsac();
  if(page==="show") return coreHead(id?vsTitle(id):"綜藝")+viewShowFan(id);
  if(page==="news") return coreHead("新聞")+(id?newsDetailHtml(id):newsListHtml("#/fan/core?p=news",followed(),"我追蹤的"));
  if(page==="vod") return go("fan",null,"core");
  if(page==="gallery") return go("fan",null,"core");
  if(page==="promo") return viewPromo();
  if(page==="concert") return coreHead("演唱會")+`<main class="page">${ccFanPage()}</main>`;
  if(page==="fsl") return coreHead("簽售")+`<main class="page">${fsFanCards()}</main>`;
  if(page==="cards") return viewCards();
  if(page==="survival") return viewSurvival(id);
  if(page==="stubs") return viewStubs();
  if(page==="fansign") return viewFsFanRoom(id);
  if(page==="signed") return viewSigned();
  go("fan",null,"core"); return "";
}
/* 彩紙 */
function confetti(x,y,o={}){
  let c=document.getElementById("confetti"); if(!c){ c=document.createElement("canvas"); c.id="confetti"; document.body.appendChild(c); }
  c.width=innerWidth; c.height=innerHeight; const ctx=c.getContext("2d"); const cols=o.cols||["#C084FC","#8843FB","#8843FB","#D8B4FE","#E9D5FF","#F472B6","#FFFFFF"];
  const P=Array.from({length:o.n||45},()=>{const a=Math.random()*Math.PI*2,sp=4+Math.random()*8;return {x,y,s:5+Math.random()*8,c:cols[Math.random()*cols.length|0],sh:Math.random()*3|0,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-5,r:Math.random()*6,vr:(Math.random()-.5)*.3,o:1,d:.015+Math.random()*.015}});
  (function f(){ ctx.clearRect(0,0,c.width,c.height); let alive=0;
    P.forEach(p=>{ if(p.o<=0) return; alive++; p.x+=p.vx; p.y+=p.vy; p.vy+=.22; p.vx*=.98; p.r+=p.vr; p.o-=p.d;
      ctx.save(); ctx.globalAlpha=Math.max(0,p.o); ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillStyle=p.c;
      if(p.sh===0) ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s); else if(p.sh===1){ctx.beginPath();ctx.arc(0,0,p.s/2,0,7);ctx.fill();} else {ctx.beginPath();ctx.moveTo(0,-p.s/2);ctx.lineTo(p.s/2,p.s/2);ctx.lineTo(-p.s/2,p.s/2);ctx.fill();}
      ctx.restore(); });
    if(alive) requestAnimationFrame(f); else ctx.clearRect(0,0,c.width,c.height); })();
}
/* 體感演唱會：應援棒模式 */
let concertTimer=null;
/* ---------- SHOP：TIE 券 ---------- */
function passStatus(mid){
  const r=subs()[mid]; if(!r) return null; const now=Date.now();
  if(now<=r.expires){ const d=daysLeft(r.expires); return {cls:"on",txt:`運行中・剩餘 ${d} 天`}; }
  if(now<=r.expires+GRACE){ const h=Math.max(1,Math.ceil((r.expires+GRACE-now)/3600e3)); return {cls:"grace",txt:`已到期・${h} 小時內續訂可保留愛心天數`}; }
  return {cls:"off",txt:"已到期・現在購買會變成全新訂閱"};
}
/* ===== SHOP（仿 Weverse Shop）：橫幅 → My Artist → 每團一區 → 團的商店 → 商品頁 ===== */
function shopProducts(gid){ const g=groupOf(gid); if(!g) return []; const L=[], mn=Math.min(...MS_PLANS.map(p=>p.pts));
  L.push({id:"ms:"+gid,kind:"ms",gid,cat:"ms",ic:"💎",name:`${g.name} Membership`,pts:mn,from:true,own:isMember(gid),
    det:["加入後，對這個團的所有藝人都有效。","演唱會時直接擁有這一團的官方應援棒。","在藝人那邊會顯示你的會員愛稱，名字也會有流光。","到期後 24 小時內續訂，可以保留會員資歷。"],
    note:["Membership 從購買當天開始計算天數。","同一個團只能有一張 Membership，續訂會接在原本的天數後面。","購買使用的是 App 內的積分，不會另外收費。"]});
  getAlbums().filter(a=>a.gid===gid).forEach(a=>a.vers.forEach(v=>L.push({id:"v:"+a.id+":"+v.id,kind:"album",aid:a.id,vid:v.id,gid,k:"album",cat:"album",ic:"💿",name:`${a.title} (${v.name})`,pts:v.pts,pre:vPre(v),own:false,
    det:[`${a.ord}《${a.title}》${v.name}・${shapeOf(v.shape).n}・${v.w} × ${v.h} × ${v.t} 公分`,...v.inc.map(it=>`${it.name} ${it.n||1} 張（${it.w} × ${it.h} 公分，共 ${(it.pool||[]).length} 種隨機）`),vPre(v)?`現在是預購期間（到 ${fsWhen(v.preEnd)}）：每家店附送的預購特典、Lucky Draw 都不一樣，下面選店家。`:"預購期已經結束，店家不再附送特典。"].filter(Boolean),
    note:["裡面的東西是隨機的，不能指定成員。","不同版本放的東西不一樣。","預購特典、Lucky Draw 是店家另外附送的，不在專輯裡；Lucky Draw 是抽獎，不一定抽得到，抽完就沒了。","購買使用的是 App 內的積分，不會另外收費。"]})));
  MERCH.filter(it=>it.k!=="album").forEach(it=>L.push({id:"m:"+gid+":"+it.k,kind:"merch",gid,k:it.k,cat:"merch",ic:it.ic,name:`${g.name} ${it.name}`,pts:it.pts,own:owns(gid,it.k)||(it.k==="stick"&&isMember(gid)),ownTxt:it.k==="stick"&&isMember(gid)&&!owns(gid,it.k)?"會員已擁有":"已擁有",
    det:[it.d],note:["買過的周邊會收在 ME 的「我的周邊」。","購買使用的是 App 內的積分，不會另外收費。"]}));
  { const A=groupArtists(gid); if(A.length>1){ const on=A.filter(isActive).length; L.push({id:"tg:"+gid,kind:"tie",grp:true,gid,mid:A[0],cat:"tie",ic:ini(g.name),g2:g.g,name:`${WHISPER_NAME} 券・${g.name}`,pts:Math.min(...PLANS.map(p=>p.pts)),from:true,own:on>0,ownTxt:on?`已訂閱 ${on} 位`:"",
      det:[`選幾位成員、選哪幾位，收他們傳給你的訊息，你也可以回覆。`,`最多 ${A.length} 人券（這團有 ${A.length} 位成員）。`,"訂閱越久，能傳的字數越多。"],note:["券有效期間內才能收到訊息、也才能回覆。","請不要截圖或外流聊天室內容，外流會被停權。"]}); return L; } }   /* 團體：只賣一種團體券，買的時候選人數、再選成員 */
  groupArtists(gid).forEach(mid=>{ const m=MEMBERS[mid], st=passStatus(mid); L.push({id:"t:"+mid,kind:"tie",gid,mid,cat:"tie",ic:ini(m.name),g2:m.g,name:`${WHISPER_NAME} 券・${m.name}`,pts:tieFree(mid)?0:Math.min(...PLANS.map(p=>p.pts)),from:true,own:isActive(mid),ownTxt:st?st.txt:"",
    det:[`收 ${artName(mid,"tie")} 傳給你的訊息，你也可以回覆。`,"訂閱越久，能傳的字數越多。"],note:["券有效期間內才能收到訊息、也才能回覆。","請不要截圖或外流聊天室內容，外流會被停權。"]}); });
  return L; }
const prodBy=id=>{ const [k,x]=id.split(":"); const gid=k==="t"?(MEMBERS[x]||{}).group:k==="v"?(albumOf(x)||{}).gid:x; return gid?shopProducts(gid).find(p=>p.id===id):null; };
/* 商品圖：淺灰底＋畫出實物的樣子（會員卡、應援棒、專輯、小卡組、TIE 券），像 Weverse Shop 的商品照 */
function prodArt(p){ const g=groupOf(p.gid), C=GRADS[(p.kind==="tie"?p.g2:g.g)%GRADS.length], c0=C[0], c1=C[1], id="pg"+p.id.replace(/\W/g,""), nm=esc(g.name);
  const defs=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient></defs>`;
  if(p.kind==="ms") return `<svg viewBox="0 0 120 120">${defs}<rect x="18" y="34" width="84" height="54" rx="7" fill="url(#${id})"/><rect x="18" y="34" width="84" height="54" rx="7" fill="none" stroke="rgba(255,255,255,.5)"/><circle cx="60" cy="56" r="10" fill="rgba(255,255,255,.85)"/><text x="60" y="76" font-size="6" font-weight="700" fill="#fff" text-anchor="middle" font-family="Quicksand,sans-serif" textLength="${Math.min(70,nm.length*6)}" lengthAdjust="spacingAndGlyphs">${nm}</text><text x="60" y="83" font-size="4.5" fill="rgba(255,255,255,.85)" text-anchor="middle" font-family="Quicksand,sans-serif">OFFICIAL FANCLUB</text></svg>`;
  if(p.k==="stick"){ const ds=getSticks()[p.gid]; if(ds&&ds.photo) return `<img class="wsp-ph" src="${ds.photo}" alt="">`; if(ds&&(ds.cut||ds.front)) return `<img class="wsp-stick" src="${ds.cut||ds.front}" alt="">`; }   /* 管理員上傳過設計圖：用設計圖的去背正面 */
  if(p.k==="stick") return `<svg viewBox="0 0 120 120">${defs}<circle cx="60" cy="40" r="20" fill="url(#${id})" opacity=".95"/><circle cx="60" cy="40" r="20" fill="none" stroke="#fff" stroke-width="2.5"/><circle cx="54" cy="34" r="5" fill="rgba(255,255,255,.7)"/><rect x="55" y="60" width="10" height="44" rx="5" fill="#E9E6EF" stroke="#CFCAD9"/><rect x="55" y="62" width="10" height="6" fill="#CFCAD9"/></svg>`;
  if(p.k==="album") return `<svg viewBox="0 0 120 120">${defs}<rect x="30" y="24" width="64" height="72" rx="3" fill="#D9D5E2"/><rect x="24" y="20" width="64" height="72" rx="3" fill="url(#${id})"/><text x="56" y="44" font-size="7" font-weight="700" fill="#fff" text-anchor="middle" font-family="Quicksand,sans-serif">${nm}</text><text x="56" y="54" font-size="5" fill="rgba(255,255,255,.85)" text-anchor="middle" font-family="Quicksand,sans-serif">${p.kind==="album"?esc(albumOf(p.aid).title):"The 1st Mini Album"}</text>${p.kind==="album"?`<text x="56" y="88" font-size="5.5" font-weight="700" fill="#fff" text-anchor="middle" font-family="Quicksand,sans-serif">${esc(verOf(albumOf(p.aid),p.vid).name)}</text>`:""}<circle cx="56" cy="72" r="11" fill="rgba(255,255,255,.25)"/></svg>`;
  if(p.k==="limited") return `<svg viewBox="0 0 120 120">${defs}<rect x="24" y="30" width="34" height="50" rx="4" fill="#fff" stroke="#E2DEEA" transform="rotate(-10 41 55)"/><rect x="43" y="26" width="34" height="50" rx="4" fill="url(#${id})" stroke="#fff" stroke-width="2"/><rect x="62" y="30" width="34" height="50" rx="4" fill="#fff" stroke="#E2DEEA" transform="rotate(10 79 55)"/><circle cx="60" cy="92" r="6" fill="${c1}"/><circle cx="76" cy="94" r="4" fill="${c0}"/><circle cx="46" cy="94" r="4" fill="${c0}"/></svg>`;
  /* TIE 券：一張直式的票。上面是出道／回歸照（管理員上傳），中間撕線、兩邊缺口，下面票根寫 TIE 和藝人名字 */
  const mm=p.grp?null:MEMBERS[p.mid], ph=tktPhoto(p.gid)||(mm?(typeof mPhoto==="function"&&mPhoto(p.mid))||artProf(p.mid).avatar||"":""), who=mm?mm.name:g.name;
  return `<span class="tkt" style="--c0:${c0};--c1:${c1}"><span class="tkt-ph">${ph?`<span class="tkt-img" style="background-image:url('${ph}')"></span>`:`<b class="tkt-ini">${esc((who||"?")[0])}</b>`}<small>HAECHU</small></span><span class="tkt-st"><b>${WHISPER_NAME}</b><span class="tkt-nm">${esc(who)}</span><i class="tkt-bar"></i></span></span>`; }
const prodLabel=p=>p.kind==="ms"?"MEMBERSHIP":p.k==="stick"?"OFFICIAL":p.kind==="album"?(p.pre?"PRE-ORDER":"ALBUM"):p.k==="limited"?"LIMITED":"";
const prodThumb=(p,big)=>`<span class="wsp-th ${big?"big":""}">${prodLabel(p)&&!(p.k==="stick"&&(getSticks()[p.gid]||{}).photo)?`<small>${prodLabel(p)}</small>`:""}${p.kind==="album"&&PCI[`vc|${p.aid}|${p.vid}`]?`<img class="wsp-cov" src="${PCI[`vc|${p.aid}|${p.vid}`]}" alt="">`:prodArt(p)}</span>`;
const prodCard=p=>`<button class="wsp-pc" data-a="pOpen" data-v="${p.id}">${prodThumb(p)}<span class="wsp-nm">${esc(p.name)}</span><span class="wsp-pr">${p.pts===0?"<b>免費</b>":`<b>${fmt(p.pts)}</b> 積分${p.from?" 起":""}`}</span>${p.own?`<em class="wsp-tag on">${esc(p.ownTxt||"已擁有")}</em>`:p.kind==="ms"?`<em class="wsp-tag">送官方應援棒</em>`:p.pre?`<em class="wsp-tag on">預購特典中</em>`:""}</button>`;
/* 查看所有橫幅（照 Weverse Shop 的「＋」）：上面依藝人篩選，下面一張一張列出來 */
function openAllBan(){ const f=followed().filter(g=>groupOf(g)&&!isSelfGid(g)), fl=ui.banF&&f.includes(ui.banF)?ui.banF:"all";
  const L=f.filter(g=>fl==="all"||g===fl).flatMap(gid=>shopProducts(gid).filter(p=>p.kind!=="tie"&&!p.own));
  const sub=p=>p.pre?"現正預購中！":p.kind==="ms"?"加入就送官方應援棒！":"HAECHU SHOP 現正販售中！";
  setLayer(`<div class="ab-pg" role="dialog" aria-label="查看所有橫幅"><header class="ab-h"><span></span><b>查看所有橫幅</b><button class="ab-x" data-a="closeLayer" aria-label="關閉">${XSVG}</button></header>
    <div class="ab-chips">${[["all","ALL"],...f.map(g=>[g,groupOf(g).name])].map(([k,l])=>`<button class="${fl===k?"on":""}" data-a="banF" data-v="${esc(k)}">${esc(l)}</button>`).join("")}</div>
    <div class="ab-list">${L.length?L.map(p=>`<button class="ab-it" data-a="banGo" data-v="${p.id}">${prodThumb(p)}<span class="ab-tx"><small>${esc(groupOf(p.gid).name)}</small><b>${esc(p.name)}</b><em>${sub(p)}</em></span></button>`).join(""):`<p class="me-none">還沒有商品</p>`}</div></div>`,"allban"); }
function viewShop(){
  const q=srchQ("shop"), f=followed();
  if(ui.shopG&&groupOf(ui.shopG)) return viewShopGroup(ui.shopG);
  const shopHay=gid=>{ const g=groupOf(gid); return g?g.name+" "+grpMembers(gid).map(id=>MEMBERS[id]?MEMBERS[id].name+" "+artName(id,"feed")+" "+artName(id,"tie"):"").join(" "):""; };
  const all=(q?GROUPS.map(g=>g.id):f).flatMap(shopProducts).filter(p=>!q||nz(p.name+" "+shopHay(p.gid)).includes(q));   /* 搜尋：所有團都找，團名、藝名、社群名都可以 */
  const ban=f.flatMap(gid=>shopProducts(gid).filter(p=>p.kind!=="tie"&&!p.own&&!isSelfGid(p.gid)).slice(0,2)).slice(0,6);
  const mine=Object.keys(subs()).filter(id=>MEMBERS[id]);
  return fanHeader(false,"shop","搜尋商品、團名...")+`<main class="page">${srchLabel("shop")}
    ${q?(all.length?`<div class="wsp-grid">${all.map(prodCard).join("")}</div>`:srchEmpty("商品")):`
    ${ban.length?`<div class="ws-hero" id="spBan">${ban.map(p=>{const g=groupOf(p.gid), C=GRADS[g.g%GRADS.length];return `<button class="ws-sl" data-a="pOpen" data-v="${p.id}" style="--wl:${mixHex(C[0],"#ffffff",.78)};--wd:${mixHex(C[0],"#17141f",.74)}"><span class="ws-art">${p.kind==="album"&&PCI[`vc|${p.aid}|${p.vid}`]?`<img src="${PCI[`vc|${p.aid}|${p.vid}`]}" alt="">`:prodArt(p)}</span><b>${esc(p.name)}</b><small>HAECHU SHOP ${p.pre?"現正預購中！":"現正販售中！"}</small></button>`}).join("")}</div>
    <div class="ws-pg"><span class="ws-track"><i id="spThumb" style="width:${100/ban.length}%"></i></span><span class="ws-cnt"><b id="spCnt">01</b><i></i>${String(ban.length).padStart(2,"0")}</span><button class="ws-plus" data-a="wsPlus" aria-label="看更多">＋</button></div>`:""}
    <section class="ws-pts"><span>我的積分</span><b>${fmt(points())}<i>✦</i></b>${demoOn()?`<button data-a="addPts">示範：補充積分</button>`:""}</section>
    <section class="ws-my"><h2>My Artist</h2>
      ${f.length?`<div class="ws-my-row">${f.map(gid=>{const g=groupOf(gid);return g?`<button class="ws-lg" data-a="shopG" data-v="${gid}"><i style="background:${grad(g.g)}">${gPhoto(gid)?`<span class="ws-lgp" role="img" aria-label="${esc(g.name)}" style="background-image:url('${esc(gPhoto(gid))}')"></span>`:`<span>${esc(g.name)}</span>`}</i><small>${esc(g.name)}</small></button>`:""}).join("")}</div>`:`<p class="me-none">先到 LOVE 的「探索」加入社群吧</p>`}
      <button class="ws-find" data-a="shOpen" data-k="shop">${I.search||"🔍"}<b>藝人</b></button></section>
    ${thShopCard()}
    ${f.map(gid=>{const g=groupOf(gid); if(!g) return ""; return `<section class="wsp-sec"><button class="wsp-now" data-a="shopG" data-v="${gid}" style="background:${grad(g.g)}"><span class="wsp-shade"></span><small>Now</small><b>${esc(g.name)} ›</b></button>
      <div class="wsp-row">${shopProducts(gid).map(prodCard).join("")}</div></section>`}).join("")}
    ${mine.length?`<h2 class="mf-h">我的 ${WHISPER_NAME} 券</h2>${mine.map(id=>{const m=MEMBERS[id], st=passStatus(id);return `<div class="card pass">
      <div class="av" style="background:${grad(m.g)}">${mAvIn(id)}</div>
      <div class="pass-b"><b>${WHISPER_NAME} 券・${esc(artName(id,"tie"))}</b><span class="pass-st ${st.cls}">${st.txt}</span><span class="pass-d">💜 +${subDays(id)} 天</span></div>
      <button class="btn btn-sm ${st.cls==="on"?"btn-soft":"btn-main"}" data-a="buyOpen" data-m="${id}">${st.cls==="on"?"續訂":"重新購買"}</button>
      ${demoOn()?`<div class="pass-demo">示範：<button data-a="passDay99" data-m="${id}">跳到第 100 天</button><button data-a="passExpire" data-m="${id}" data-v="short">設為剛到期</button><button data-a="passExpire" data-m="${id}" data-v="long">設為到期超過 24 小時</button></div>`:""}</div>`}).join("")}`:""}`}
  </main>`;
}
function viewShopGroup(gid){ const g=groupOf(gid), cat=ui.shopCat||"all", L=shopProducts(gid).filter(p=>cat==="all"||p.cat===cat);
  return `<header class="top core-top"><div class="top-row"><button class="icon-btn" data-a="shopBack" aria-label="返回">${I.back}</button><div class="top-title">${esc(g.name)}</div><span class="sh-sp"></span></div>
    <nav class="wsp-cats">${[["all","全部"],["album","專輯"],["ms","Membership"],["merch","周邊"],["tie",WHISPER_NAME+" 券"]].map(([k,l])=>`<button class="${cat===k?"on":""}" data-a="shopCat" data-v="${k}">${l}</button>`).join("")}</nav></header>
    <main class="page"><div class="wsp-grid">${L.map(prodCard).join("")}</div></main>`; }
function storePick(p){ const a=albumOf(p.aid), v=a&&verOf(a,p.vid); if(!v) return ""; const L=getStores(); if(!L.length) return ""; if(!storeOf(ui.pStore)) ui.pStore=L[0].id; const pre=vPre(v);
  return `<div class="stp"><span class="stp-l">選擇店家<small>${pre?"每家店附送的東西不一樣":"預購期已結束，各店都沒有附送"}</small></span>${L.map(st=>{ const ex=storeEx(a,st.id), pob=ex.filter(e=>e.rule==="pob"), ld=ex.filter(e=>e.rule==="ld"), left=ld.reduce((n,e)=>n+ldLeft(e),0), od=ld.length?Math.max(...ld.map(e=>e.odds||10)):0;
    return `<button class="stp-o ${ui.pStore===st.id?"on":""}" data-a="pStore" data-v="${st.id}"><b>${esc(st.name)}</b><small>${pre&&pob.length?(pob.some(e=>e.cap)&&!pob.some(e=>!e.cap||ldLeft(e)>0)?"特典已送完":`附送${esc(pob[0].name)}・${pob.reduce((n,e)=>n+(e.pool||[]).length,0)} 種隨機${pob.some(e=>e.cap)?`・限量，剩 ${pob.reduce((n,e)=>n+(e.cap?ldLeft(e):0),0)} 張`:""}`):"沒有預購特典"}</small>${ld.length?`<small>${pre&&left?`Lucky Draw 抽獎：每張 ${od}% 機會・剩 ${left} 張`:"Lucky Draw：已抽完"}</small>`:""}</button>`; }).join("")}</div>`; }
function openProd(id){ const p=prodBy(id); if(!p) return; if(isSelfGid(p.gid)){ toast(selfBuyMsg()); return; } if(p.kind==="tie"){ tieStore(p.gid); return; } if(ui.s3) ui.s3.stop(); ui.prod=id; const g=groupOf(p.gid), tab=ui.prodTab||"det", plan=ui.prodPlan||MS_PLANS[0].id;
  setLayer(`<div class="tiei wsp-pg"><header class="tiei-top"><button class="icon-btn" data-a="pClose" aria-label="返回">${I.back}</button><b>${esc(g.name)}</b><span class="sh-sp"></span></header>
    <div class="tiei-body">${p.kind==="album"?`<div class="s3 s3-alb" id="s3A">${albumBox(albumOf(p.aid),verOf(albumOf(p.aid),p.vid),{maxPx:210})}</div><small class="s3-tip c">拖動專輯，轉一圈看看封面和封底</small>`:p.k==="stick"&&getSticks()[p.gid]?(setTimeout(()=>mountSticks(layer),0),`${getSticks()[p.gid].photo?`<img class="wsp-phbig" src="${getSticks()[p.gid].photo}" alt="">`:""}<div class="ls-box wsp-ls" data-ls="${p.gid}" data-o="ctl"></div>`):prodThumb(p,true)}
      <button class="wsp-pg-g" data-a="pGroup" data-v="${p.gid}">${esc(g.name)} ›</button><h2 class="wsp-pg-n">${esc(p.name)}</h2>
      <div class="wsp-pg-p">${p.kind==="album"?`<b>${fmt(p.pts)} 積分</b><div class="qty"><span>數量</span><button data-a="pQty" data-v="-1" aria-label="少一張">−</button><b id="pQ">${ui.pQty||1}</b><button data-a="pQty" data-v="1" aria-label="多一張">＋</button></div>`+storePick(p):p.kind==="ms"?`<div class="wsp-plans">${MS_PLANS.map(x=>`<button class="${plan===x.id?"on":""}" data-a="pPlan" data-v="${x.id}">${x.name}<b>${fmt(x.pts)} 積分</b></button>`).join("")}</div>`:`<b>${fmt(p.pts)} 積分${p.from?" 起":""}</b>`}</div>
      ${p.own?`<p class="wsp-pg-own">✓ ${esc(p.ownTxt||"已擁有")}</p>`:""}
      <div class="wsp-tabs"><button class="${tab==="det"?"on":""}" data-a="pTab" data-v="det">詳情</button><button class="${tab==="note"?"on":""}" data-a="pTab" data-v="note">注意事項</button></div>
      <ul class="wsp-li">${(tab==="det"?p.det:p.note).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>
    <footer class="tiei-foot">${isSelfGid(p.gid)?`<button class="btn btn-soft btn-block" disabled>${selfBuyMsg()}</button>`:p.kind==="merch"&&p.own?`<button class="btn btn-soft btn-block" disabled>${esc(p.ownTxt||"已擁有")}</button>`:points()<=0?`<button class="btn btn-soft btn-block" disabled>積分不足</button>`:`<button class="btn btn-main btn-block" data-a="pBuy" data-v="${p.id}">${p.kind==="album"?`${storeOf(ui.pStore)?"在 "+esc(storeOf(ui.pStore).name)+" 買":"買"} ${ui.pQty||1} 張・${fmt(p.pts*(ui.pQty||1))} 積分`:p.kind==="ms"&&p.own?"續訂":p.kind==="tie"&&p.own?"續訂":"購買"}</button>`}</footer></div>`,"prod"); if(p.kind==="album"){ const h=document.getElementById("s3A"); if(h) ui.s3=spin3d(h.querySelector(".ab-box"),h,{auto:true,rx:-12,ry:-24}); } }
function openBuySheet(mid){ if(MEMBERS[mid]&&isSelfGid(MEMBERS[mid].group)){ toast(selfBuyMsg()); return; } if(MEMBERS[mid]){ layer.innerHTML=""; tieStore(MEMBERS[mid].group); return; }   /* 所有買 TIE 券的入口都走新的 TIE 券頁面 */
  const m=MEMBERS[mid], st=passStatus(mid), plan=ui.buyPlan||"d30";
  const note=!st?"這是你第一次訂閱，買完會立刻收到藝人的歡迎語。"
    :st.cls==="off"?"上一張券到期已超過 24 小時，這次會是全新訂閱：歡迎語會重新送出、愛心天數從 1 開始；舊對話可在聊天室設定「載入歷史對話」找回。"
    :`這次算連續訂閱，愛心天數會保留（目前 +${subDays(mid)} 天），不會重發歡迎語。`;
  setLayer(`<div class="scrim" data-a="tCloseLayer"><div class="sheet" role="dialog" aria-label="購買 TIE 券"><div class="grab"></div>
    <div class="buy-h"><div class="av" style="background:${grad(m.g)}">${mAvIn(mid,"tie")}</div><div><h3>${WHISPER_NAME} 券・${esc(artName(mid,"tie"))}</h3><p>${groupOf(m.group).name}</p></div></div>
    <div class="plans">${tiePlans(mid).map(x=>`<button class="plan ${plan===x.id?"on":""}" data-a="buyPlan" data-m="${mid}" data-v="${x.id}"><b>${x.name}</b><span>${(x.id==="grp"?!x.pts:tieFree(mid))?"免費":fmt(x.pts)+" 積分"}</span></button>`).join("")}</div>
    ${!st||st.cls==="off"?`<label class="buy-nick"><span>你的暱稱</span><input id="buyNick" maxlength="12" placeholder="輸入文字" value="${esc(ui.buyNick!=null?ui.buyNick:(S.get(K.tieSet,{})[mid]||{}).nickname||"")}"></label>`:""}
    <button class="btn btn-main btn-block" data-a="buyOk" data-m="${mid}">${(()=>{ const p=tiePlans(mid).find(x=>x.id===plan)||PLANS[1]; return (p.id==="grp"?!p.pts:tieFree(mid))?"免費訂閱":`用 ${fmt(p.pts)} 積分購買`; })()}</button>
    <p class="buy-pts">目前積分 ${fmt(points())}</p>
  </div></div>`,"buy");
}

/* ---------- 管理員 ---------- */
const ANAV={
  home:`<svg viewBox="0 0 24 24" ${NS}><rect x="4" y="4" width="7" height="9" rx="2"/><rect x="13" y="4" width="7" height="5" rx="2"/><rect x="13" y="11" width="7" height="9" rx="2"/><rect x="4" y="15" width="7" height="5" rx="2"/></svg>`,
  report:`<svg viewBox="0 0 24 24" ${NS}><path d="M5.5 21V4.5"/><path d="M5.5 4.5h11l-2.2 4 2.2 4h-11"/></svg>`,
  post:`<svg viewBox="0 0 24 24" ${NS}><path d="M4.5 19.5h4l10-10-4-4-10 10z"/><path d="m13 7 4 4"/></svg>`,
  news:`<svg viewBox="0 0 24 24" ${NS}><path d="M4 10v4a1 1 0 0 0 1 1h2l6 4V5L7 9H5a1 1 0 0 0-1 1z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/></svg>`,
  me:`<svg viewBox="0 0 24 24" ${NS}><path d="M12 3.5 5 6v5.5c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6z"/><circle cx="12" cy="10.5" r="2.2"/><path d="M8.6 16a3.6 3.6 0 0 1 6.8 0"/></svg>`,
};
ANAV.foc=`<svg viewBox="0 0 24 24" ${NS}><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 9.5h16M8.5 3v4M15.5 3v4"/><path d="M12 12.4l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z"/></svg>`;
const adminNav=a=>navBar([["home","HOME",ANAV.home],["foc","FOC",ANAV.foc],["reports","REPORT",ANAV.report],["posts","POST",ANAV.post],["announce","NEWS",ANAV.news],["me","ME",ANAV.me]],a,{reports:openReports().length});

const UNI_T={REPORT:"檢舉",POST:"全部貼文",NEWS:"公告",ARTISTS:"藝人與團",REVENUE:"積分統計",ME:"管理"};
function adminHead(title,sk=null,ph=""){ if(isUni()){ if(title==="FOC") return uniMainHead("活動"); if(["REPORT","POST"].includes(title)&&!(sk&&srchOn(sk))) return uniMainHead("內容"); if(sk&&srchOn(sk)) return `<header class="top uni-top sh-head"><div class="top-row">${srchBar(ph)}</div></header>`; return uniHead(UNI_T[title]||title,sk?srchBtn(sk):""); }
  return `<header class="top sh-head"><div class="top-row">${sk&&srchOn(sk)?srchBar(ph):`<div class="logo">${APP_NAME}<small>管理員</small></div><div class="spacer"></div>${sk?srchBtn(sk):""}<span class="art-sub">${title}</span>`}</div></header>`; }
function reportCard(r){
  const KIND={comment:"貼文留言",live:"直播留言",tie:WHISPER_NAME+" 訊息",sns:"SNS 貼文"}, kind=r.kind||"comment", who=reportWho(r), ms=who&&muteState(who);
  let body="", where="";
  if(kind==="comment"){ const c=S.get(K.comments,[]).find(x=>x.id===r.commentId), p=S.get(K.posts,[]).find(x=>x.id===r.postId), m=p&&MEMBERS[p.member];
    body=c?`<div class="rp-c"><div class="av sm" style="background:${grad(c.g)}">${esc(shownName(c)[0])}</div><div><b>${esc(shownName(c))}</b><p>${esc(c.text)}</p></div></div>`:`<p class="muted" style="font-size:13px;margin:8px 0 0">內容已被刪除</p>`;
    where=m?`留言在 ${esc(m.name)} 的貼文：${esc(p.text.slice(0,40))}${p.text.length>40?"…":""}`:""; }
  else { body=`<div class="rp-c"><span class="fan-av sm">${mascot(r.who||"x")}</span><div><b>${esc(shownName({name:r.name,by:r.ref&&r.ref.by}))}</b><p>${esc(r.text||"")}</p></div></div>`;
    where=kind==="sns"?`SNS・${esc(r.name||"")} 的貼文`:kind==="live"?(()=>{const l=getLive(r.ref.liveId);return l?`在「${esc(l.title)}」直播間`:""})():`在 ${esc(MEMBERS[r.ref.mid]?MEMBERS[r.ref.mid].name:"")} 的 ${WHISPER_NAME}`; }
  return `<article class="card rp ${r.status!=="open"?"done":""}">
    <div class="rp-h"><span class="badge ${r.status==="open"?"warn":""}">${r.status==="open"?"待處理":r.status==="removed"?"已刪除":"已駁回"}</span><span class="badge">${KIND[kind]}</span>
      <span class="muted">${esc(r.reason)}・${r.count} 人檢舉${r.mine?"（含示範帳號）":""}・${ago(r.ts)}</span></div>
    ${body}${where?`<p class="rp-p">${where}</p>`:""}
    ${ms?`<p class="rp-p rp-mute">${ms.ban?"這個帳號已停權":`禁言中，到 ${evWhen(ms.until)}`}<button data-a="unmute" data-v="${esc(who)}">解除</button></p>`:""}
    ${r.status==="open"?`<div class="rp-act"><button class="btn btn-soft btn-sm" data-a="rpDismiss" data-id="${r.id}">駁回</button><button class="btn btn-sm btn-danger" data-a="rpRemove" data-id="${r.id}">刪除內容</button></div>`:""}
    ${who&&!ms?`<div class="rp-act rp-act2"><span>處置發言的人：</span><button data-a="mute" data-v="${esc(who)}" data-h="24">禁言 24 小時</button><button data-a="mute" data-v="${esc(who)}" data-h="168">禁言 7 天</button><button class="ban" data-a="mute" data-v="${esc(who)}" data-h="ban">停權</button></div>`:""}
  </article>`;
}
function concertAdminHtml(){
  const now=Date.now(), list=getConcerts(), live=liveConcert(), up=list.filter(c=>!c.ended&&c.startTs>now), L=list.filter(c=>!c.ended&&c.startTs<=now&&c.endTs>now), past=list.filter(c=>c.ended||c.endTs<=now).slice(-10).reverse();
  const cur=xvSegCur("cc",L.length?"live":"up"), rows=cur==="up"?up:cur==="live"?L:past;
  const row=c=>{ const g=groupOf(c.gid), on=live&&live.id===c.id, done=c.ended||c.endTs<=now; return xvRow({...xvGAv(c.gid),title:`${esc(g.name)}・${esc(c.title)}`,sub:`${evWhen(c.startTs)} – ${fsWhen(c.endTs).split(" ")[1]}・${c.tour?"世巡自動排的":c.host?"藝人排的":"公司排的"}`,right:on?xvChip("● 進行中","ok"):done?xvChip("已結束"):`${xvChip("等開演","on")}<button class="xv-bt g" data-a="ccDel" data-id="${c.id}">刪除</button>`}); };
  return `<div class="xv cc2">${xvStats([[up.length,"接下來"],[L.length,"進行中"],[past.length,"最近結束"]])}
    <div style="margin-top:12px">${xvSeg("cc",[["up",`接下來 ${up.length}`],["live",`進行中 ${L.length}`],["done",`已結束 ${past.length}`]],cur)}</div>
    <div style="margin-top:12px">${rows.length?rows.map(row).join(""):xvEmpty(cur==="up"?"沒有排好的演唱會":cur==="live"?"現在沒有演唱會":"還沒有結束的演唱會")}</div>
    <p class="xv-note">演唱會由藝人在 FOC 開（可以約 10 分鐘後），世巡核准後也會自動排；積分一個月算一場</p>
    ${xvSh("共用設定")}</div>`; }
function lsAdminHtml(){
  const gid=ui.lsGid&&groupOf(ui.lsGid)?ui.lsGid:GROUPS[0].id, g=groupOf(gid), has=!!getSticks()[gid], dr=ui.lsDraft, ds=dr&&dr.ds;
  const c=GRADS[g.g%GRADS.length], sw=[...new Set([...((ds&&ds.glows)||[]),ds&&ds.detGlow,c[0],c[1],"#F472B6","#60A5FA","#34D399","#FBBF24","#FFFFFF"].filter(Boolean))];
  return `<section class="card studio ls-admin" id="lsAdmin"><div class="foc-cfg-h"><h3>應援棒 3D 設計</h3><span class="badge">自動辨識</span></div>
    
    <div class="chips wrap">${GROUPS.map(x=>`<button class="chip ${x.id===gid?"on":""}" data-a="lsGroup" data-v="${x.id}">${esc(x.name)}${getSticks()[x.id]?" ✓":""}</button>`).join("")}</div>
    <div class="ls-stage"><span class="ls-tag ${ds?"draft":""}">${ds?"預覽・還沒發布":has?"目前使用中":"預設款・還沒上傳設計圖"}</span><div class="ls-box" data-ls="${ds?"draft":gid}" data-o="ctl"></div></div>
    ${ds?`<div class="ls-det"><img src="${ds.cut}" alt="去背結果"><div><b>辨識結果</b><ul>
        <li>✓ 已自動去背${ds.turned?"・圖是橫的，已轉正":""}${ds.flipped?"・已上下翻正":""}</li>
        <li>造型：${ds.v2?`零件拆解立體（${["正面",ds.side&&"側面",ds.back&&"背面",ds.top&&"頂面"].filter(Boolean).join("＋")}${ds.depth?"＋AI 深度":""}）`:ds.side?`三視圖立體重建（照正面＋側面${ds.back?"＋背面":""}雕出來）`:ds.mode==="lathe"?"旋轉立體（左右對稱的燈頭）":"立體造型（愛心、星星這類）"}</li>
        <li>燈頭：上方 ${Math.round(ds.split*100)}%</li>${ds.expN?`<li>爆炸圖：${ds.expN} 個零件</li>`:""}${ds.modes?`<li>發光模式：${ds.modes.join("・")}</li>`:""}${ds.dims?`<li>尺寸：全長 ${ds.dims.L} cm${ds.dims.D?`・燈頭 ⌀${ds.dims.D} cm`:""}</li>`:""}
        <li>燈光色：${ds.detGlow?`<i style="background:${ds.detGlow}"></i> 從燈頭抓到的顏色`:"燈頭偏白，先用團色"}</li></ul></div></div>
      <div class="ls-views"><span><img src="${ds.cut}" alt=""><small>正面</small></span>${ds.side?`<span><img src="${ds.side}" alt=""><small>側面</small></span>`:`<label class="ls-vadd">＋ 側面圖<input type="file" id="lsSide" accept="image/*"></label>`}${ds.side?(ds.back?`<span><img src="${ds.back}" alt=""><small>背面</small></span>`:`<label class="ls-vadd">＋ 背面圖<input type="file" id="lsBack" accept="image/*"></label>`):""}</div>
      ${ds.side?"":`<div class="ls-row"><span>造型</span><div class="ls-seg"><button class="${ds.mode==="lathe"?"on":""}" data-a="lsMode" data-v="lathe">旋轉立體</button><button class="${ds.mode==="plate"?"on":""}" data-a="lsMode" data-v="plate">立體造型</button></div></div>`}
      <div class="ls-row"><span>燈頭範圍</span><input type="range" id="lsSplit" min="10" max="85" value="${Math.round(ds.split*100)}"><output id="lsSplitV">${Math.round(ds.split*100)}%</output></div>
      <div class="ls-row"><span>燈光顏色</span><div class="ls-sw">${sw.map(h=>`<button class="${(ds.glow||"").toLowerCase()===h.toLowerCase()?"on":""}" style="background:${h}" data-a="lsGlow" data-v="${h}" aria-label="燈光色 ${h}"></button>`).join("")}</div></div>
      ${ds.v2?`<div class="ls-row ls-parts"><span>零件</span><div class="chips wrap" id="lsParts">${lsPartsUI(ds)}</div></div>`:`<div class="ls-row"><span>去背強度</span><input type="range" id="lsThr" min="12" max="90" value="${dr.thr}"><output id="lsThrV">${dr.thr}</output></div>`}
      <div class="ls-btns"><button class="btn btn-soft" data-a="lsCancel">取消</button><button class="btn btn-main" data-a="lsPublish">發布到 ${esc(g.name)}</button></div>
      `
    :`<div class="ls-btns"><label class="btn btn-main ls-file">上傳設計圖<input type="file" id="lsSheet" accept="image/*"></label>${has?`<label class="btn btn-soft ls-file">${getSticks()[gid].photo?"換商品照":"上傳商品照"}<input type="file" id="lsPhoto" accept="image/*"></label><button class="btn btn-soft" data-a="lsRemove">恢復預設款</button>`:""}</div>${has&&getSticks()[gid].photo?`<img class="ls-photo" src="${getSticks()[gid].photo}" alt="商品照">`:""}
      <div class="ls-samp">沒有圖？用範例試試：<button data-a="lsSample" data-v="round">圓球款</button><button data-a="lsSample" data-v="heart">愛心款</button><button data-a="lsSample" data-v="star">星星款</button></div>
      <p class="ls-tip">三視圖：正面、側面、背面由左到右排在同一張圖（單色背景），會照三個角度雕出立體的應援棒，造型再複雜都可以。只有正面圖的話，會用正面的輪廓做。</p>`}
  </section>`;
}
function lsLoad(src,thr=40){   // 設計圖 → 辨識 → 草稿
  const ds=LS3D.analyze(src,{thr}); if(!ds){ toast("找不到應援棒，換一張背景單純的圖試試"); return false; }
  const g=groupOf(ui.lsGid||GROUPS[0].id); ds.detGlow=ds.glow; if(!ds.glow) ds.glow=GRADS[g.g%GRADS.length][0];
  ui.lsDraft={src,thr,ds}; return true;
}
/* 兩段式切換：先讓底下的白色膠囊滑過去，內容再從那一側滑進來（不再硬切） */
function segSwitch(btn,apply,dir){ const seg=btn.closest(".seg2"); if(!seg||btn.classList.contains("on")) return; const i=[...seg.querySelectorAll("button")].indexOf(btn);
  seg.style.setProperty("--i",i); seg.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b===btn));
  const pane=document.querySelector(".seg2-pane"); if(pane){ pane.classList.remove("in-l","in-r"); pane.classList.add(dir>0?"out-l":"out-r"); }
  setTimeout(()=>{ apply(); ui.segAnim=dir>0?"in-r":"in-l"; lsRerender(); ui.segAnim=""; },180); }
function lsRerender(){ const y=window.scrollY; render(); window.scrollTo(0,y); }
/* 管理員活動頁：三組可以收起來（記在這台手機；收起來時有待處理的會顯示紅點） */
const FOC_FOLD_K="hc_focfold";
function focFoldGet(){ if(ui.coach&&ui.coach.kind==="full") return {wk:1,pd:1,big:1};   /* 教學中三組都打開，才指得到每一格 */
  try{ return JSON.parse(localStorage.getItem(FOC_FOLD_K)||"null")||{wk:1}; }catch(e){ return {wk:1}; } }
function focFold(key,ic,title,tiles){ const open=!!focFoldGet()[key], n=(tiles.match(/class="tile /g)||[]).length, hot=/class="tile on"/.test(tiles);
  return `<button class="section-h foc-fold ${open?"open":""}" data-a="focFold" data-v="${key}" aria-expanded="${open}">${hi(ic)}${title}<span class="foc-fold-r">${hot&&!open?`<i class="seg-dot"></i>`:""}${open?"收起":n+" 項"}<svg viewBox="0 0 24 24"><path d="m7 10 5 5 5-5"/></svg></span></button>${open?`<div class="tiles">${tiles}</div>`:""}`; }
function viewAdmin(tab){
  if(isUni()){
    if(tab==="home"||!tab) return viewUniTodo();
    if(tab==="people"||tab==="artist") return viewUniArtist();
    if(tab==="ops"||tab==="shopadm") return viewUniOps();
    if(tab==="try"){ tryFetch(true); return uniHead("試玩訊息")+viewTryInbox(); }
    if(tab==="accounts") return uniHead("帳號")+viewAccounts();
    if(tab==="ptadd"||tab==="revenue") return uniHead("加積分")+viewPtAdd()+`<main class="page pt-share-w"><button class="uni-row" data-a="ptShare"><span>藝人分得比例</span><small>${revShare()}%</small>${UI_S.chev}</button></main>`;
    if(tab==="banned") return uniHead("禁用字詞")+viewBanned();
    if(tab==="debut") return uniHead("出道申請")+debutAdmHtml();
    if(tab==="cbreq") return uniHead("回歸申請")+cbrAdmHtml();
    if(tab==="roster"){ const h=viewRoster(), r0=route(), a=h.indexOf('<section class="card studio" id="rsNew">'), b=h.indexOf('<div class="section-h">目前的團與藝人'), cards=h.slice(b).split('<section class="card rs-g">').slice(1).map(x=>'<section class="card rs-g">'+x.replace(/<\/main>\s*$/,""));
      if(r0.p==="new") return uniHead("新增藝人")+`<main class="page roster">${h.slice(a,b)}</main>`;
      const gi=GROUPS.findIndex(g=>g.id===r0.id); if(gi>=0&&cards[gi]) return uniHead(esc(GROUPS[gi].name))+`<main class="page roster">${cards[gi]}${hrHtml(GROUPS[gi])}</main>`;
      const fd=S.get(K.fandom,{});
      return uniHead("藝人與團",`<button class="icon-btn" data-a="uniGo" data-v="#/admin?tab=roster&p=new" aria-label="新增">＋</button>`)+`<main class="page">${GROUPS.length?"":NOG_HTML()}<section class="card"${GROUPS.length?"":" hidden"}>${GROUPS.map(g=>{ const n=Object.values(MEMBERS).filter(m=>m.group===g.id&&!m.official).length; return `<button class="list-btn rs-row" data-a="uniGo" data-v="#/admin?tab=roster&id=${g.id}"><span class="rs-th g-ico" style="background:${grad(g.g)}">${gIcoIn(g)}</span>${esc(g.name)}<span class="r">${g.co?esc(g.co)+"・":""}${g.solo?"SOLOIST":n+" 位"}${fd[g.id]?"・"+esc(fd[g.id]):""}</span></button>`; }).join("")}</section></main>`; }
    if(tab==="cloud") return uniHead("雲端用量")+viewCloud();
    if(tab==="albums") return uniHead("專輯與店家")+`<main class="page">${GROUPS.length?adminAlbumHtml():NOG_HTML()}</main>`;
    if(tab==="translate") return uniHead("翻譯服務")+viewTranslate();
    if(tab==="announce"){ const list=getAnns(), gl=getGNotices();
      return `<header class="top uni-top"><div class="top-row"><span class="sh-sp"></span><div class="top-title">內容</div><button class="icon-btn" data-a="uniAnn" aria-label="發公告">＋</button></div></header><main class="page">${uniContentSeg(2)}
        <div class="section-h">全部粉絲<span class="muted">${list.length} 則</span></div>${list.length?`<section class="card">${list.map(a=>`<div class="uni-an"><p>${esc(a.text)}<small>${ago(a.ts)}</small></p><button class="btn btn-soft btn-sm" data-a="annDel" data-id="${a.id}">撤下</button></div>`).join("")}</section>`:`<p class="me-none">沒有公告</p>`}
        <div class="section-h">團體公告<span class="muted">${gl.length} 則</span></div>${gl.length?`<section class="card">${gl.map(n=>`<div class="uni-an"><p><b>${esc((groupOf(n.group)||{name:""}).name)}</b>${esc(n.title)}<small>${ago(n.ts)}</small></p><button class="btn btn-soft btn-sm" data-a="gnDel" data-v="${n.id}">撤下</button></div>`).join("")}</section>`:`<p class="me-none">沒有團體公告</p>`}
        ${(()=>{ const PH=S.get(PIN_HIDE,{})||{}, cp=coPinList().filter(x=>!PH[x.id]).sort((a,b)=>b.ts-a.ts); return `<div class="section-h">公司官方公告（置頂中）<span class="muted">${cp.length} 則</span></div>${cp.length?`<section class="card">${cp.map(a=>`<div class="uni-an"><p>${esc(a.text)}<small>${ago(a.ts)}・7 天後自動下架</small></p><button class="btn btn-soft btn-sm" data-a="pinDel" data-id="${esc(a.id)}">撤下</button></div>`).join("")}</section>`:`<p class="me-none">沒有置頂中的公司公告</p>`}`; })()}
      </main>`; }
  }
  if(tab==="foc"){
    const sc=getSched(), st=ui.focStage!=null?ui.focStage:sc.stage;
    const seg=ui.focSeg||"", lsOn=!!liveConcert();
    /* 沒選子頁：模塊（跟藝人端 FOC 一樣分區） */
    if(!seg){ const pend=getTours().filter(x=>x.status==="pending").length;
      const tl=(v,ic,n,sub,cls="")=>`<button class="tile ${cls}" data-a="focSeg" data-v="${v}">${hi(ic)}<b>${n}</b><small>${sub}</small></button>`;
      return adminHead("FOC")+`<main class="page foc">
        ${focFold("wk","clock","每週",`${tl("sched","clock","賽程",esc(sc.stage))}${tl("music","mic","打歌","一位・MC・歌曲")}${tl("news","news","新聞",newsSub())}`)}
        ${focFold("pd","star","檔期",`${tl("fs","star","簽售","場次與審核")}${tl("truck","truck","餐車","訂單")}${tl("show","star","綜藝","節目與錄影")}${tl("biz","cam","代言・雜誌","邀約")}${tl("cafe","gem","生日咖啡廳",cfTileSub())}`)}
        ${focFold("big","trophy","大型活動",`${tl("concert","mic","演唱會",lsOn?"● 進行中":"燈光・歌曲",lsOn?"on":"")}${tl("tour","globe","世巡",pend?`${pend} 筆待審核`:"巡演",pend?"on":"")}${tl("sv","bolt","選秀","選秀宇宙")}${tl("isac","trophy","偶像運動會",isTile())}`)}
        </main>`; }
    const SEGN={sched:"賽程",music:"打歌",vod:"影音",fs:"簽售",concert:"演唱會",tour:"世巡",truck:"餐車",show:"綜藝",biz:"代言・雜誌",sv:"選秀",news:"新聞",isac:"偶像運動會",cafe:"生日咖啡廳"};
    const SEG=[["sched","賽程"],["music","打歌"],["fs","簽售"],["concert","演唱會"],["tour","世巡"],["truck","餐車"],["show","綜藝"],["biz","代言"],["sv","選秀"],["news","新聞"]];
    const body={sched:`      <section class="card studio"><div class="foc-cfg-h"><h3>本週階段</h3><span class="badge">即時同步中</span></div>
        <label class="field"><input id="focStage" value="${esc(st)}"></label>
        <div class="chips wrap">${STAGE_PRESETS.map(p=>`<button class="chip ${st===p?"on":""}" data-a="focPreset" data-v="${p}">${p}</button>`).join("")}</div>
        <button class="btn btn-main btn-block" data-a="focSave">儲存並同步到藝人端與粉絲端</button>
        ${sc.updatedAt?`<p class="reach">上次更新：${ago(sc.updatedAt)}</p>`:""}
        <p class="reach" style="margin:12px 0 10px">打歌中的歌（MV 公開就加入、打滿 4 週下檔；參賽不到 3 首自動補虛擬對手）</p>
        ${(()=>{ const L=getMShow().songs.filter(x=>groupOf(x.gid)); return L.length?`<div class="sch-songs">${L.map(x=>{ const ph=songPhase(x), r=songRel(x); return `<div class="sch-s"><b>${esc(songName(x))}</b><small>${ph==="act"?`打歌第 ${songWeekNo(x)} 週`:ph==="pre"?"還沒公開":"已結束"}${r?`・${new Date(r).getMonth()+1}/${new Date(r).getDate()} 公開`:""}</small></div>`; }).join("")}</div>`:`<p class="reach">目前沒有打歌中的歌。MV 一公開就會自動加進來。</p>`; })()}</section>
`,
      music:seg!=="music"?"":!GROUPS.length?NOG_HTML():(isUni()?"":adminAlbumHtml()+adminVodHtml())+adminMusicHtml(), vod:seg!=="vod"?"":!GROUPS.length?NOG_HTML():adminVodHtml(), fs:seg!=="fs"?"":!GROUPS.length?NOG_HTML():adminFsHtml(), news:seg!=="news"?"":newsAdminHtml(), truck:seg!=="truck"?"":truckAdminHtml(), tour:seg!=="tour"?"":!GROUPS.length?NOG_HTML():tourAdminHtml(), concert:seg!=="concert"?"":!GROUPS.length?NOG_HTML():concertAdminHtml()+concertMusicHtml()+lsAdminHtml(), sv:`      <section class="card studio"><div class="foc-cfg-h"><h3>SURVIVAL PROJECT 選秀宇宙</h3><span class="badge">${S.get(K.svOpen,false)?"開放中":"關閉中"}</span></div>
        <div class="ls-btns"><button class="btn ${S.get(K.svOpen,false)?"btn-soft":"btn-main"}" data-a="svToggle">${S.get(K.svOpen,false)?"關閉選秀宇宙":"開放選秀宇宙"}</button><button class="btn btn-soft" data-a="svTheme">配色：${svTheme()==="g"?"女生版（粉）":"男生版（藍）"}</button><button class="btn btn-soft" data-a="svPreview">預覽</button></div></section>
`}[seg]||(seg==="show"?vsAdminHtml():seg==="biz"?bzAdminHtml():seg==="isac"?isAdminHtml():seg==="cafe"?viewCafe().replace(/^<main[^>]*>|<\/main>$/g,""):"");
    return `<header class="top core-top"><div class="top-row"><button class="icon-btn" data-a="focSegBack" aria-label="返回">${I.back}</button><div class="top-title">${SEGN[seg]||"FOC"}</div><span class="sh-sp"></span></div></header><main class="page foc-sub">
      ${body}
    </main>`;
  }
  if(tab==="reports"){
    const all=getReports(), open=all.filter(r=>r.status==="open"), done=all.filter(r=>r.status!=="open");
    return adminHead("REPORT")+`<main class="page">
      ${isUni()?uniContentSeg(0):""}
      <div class="section-h">待處理<span class="muted">${open.length} 件</span></div>
      ${open.length?open.map(reportCard).join(""):emptyBox(I.check,"都處理完了","貼文留言、直播留言、TIE 訊息被檢舉後會出現在這裡")}
      ${Object.keys(getMutes()).length?`<div class="section-h">禁言與停權中</div><section class="card n-card">${Object.entries(getMutes()).filter(([k])=>muteState(k)).map(([k,v])=>`<div class="n-item"><span class="fan-av sm">${mascot(k)}</span><div class="n-body"><b>${k==="fan:me"?"示範粉絲":esc(k.replace("fan:",""))}</b><div class="m">${v.ban?"停權":"禁言到 "+evWhen(v.until)}</div></div><button class="btn btn-soft btn-sm" data-a="unmute" data-v="${esc(k)}">解除</button></div>`).join("")}</section>`:""}
      ${done.length?`<div class="section-h">已處理</div>`+done.slice(0,10).map(reportCard).join(""):""}</main>`;
  }
  if(tab==="posts"){
    const gf=ui.adminGroup||"all", q=srchQ("admpost");
    const posts=getPosts().filter(p=>(gf==="all"||p.group===gf)&&postHit(q,p));
    return adminHead("POST","admpost","搜尋貼文內容或藝人名稱...")+`<main class="page">${isUni()?uniContentSeg(1):""}${srchLabel("admpost")}
      ${GROUPS.length?`<div class="chips"><button class="chip ${gf==="all"?"on":""}" data-a="ag" data-v="all">全部</button>${GROUPS.map(g=>`<button class="chip ${gf===g.id?"on":""}" data-a="ag" data-v="${g.id}">${g.name}</button>`).join("")}</div>`:""}
      ${posts.length?(gf==="all"&&!q?`<div class="ap-fold">${(()=>{ const G={}; posts.forEach(p=>(G[p.member]=G[p.member]||[]).push(p)); return Object.entries(G).sort((x,y)=>Math.max(...y[1].map(p=>p.ts))-Math.max(...x[1].map(p=>p.ts))).map(([mid,L])=>{ const m=MEMBERS[mid]||{name:"已刪除的藝人",g:0}, hid=L.filter(p=>p.hidden).length, op=(ui.apOpen||{})[mid];
          return `<section class="card ap-g ${op?"open":""}"><button class="ap-gh" data-a="apFold" data-v="${esc(mid)}" aria-expanded="${!!op}"><span class="av" style="background:${grad(m.g)}">${mAvIn(mid)}</span><span class="ap-gt"><b>${esc(m.name)}</b><small>${fmt(L.length)} 篇・最新 ${ago(Math.max(...L.map(p=>p.ts)))}${hid?`・${hid} 篇已隱藏`:""}</small></span><i class="ap-gc">${I.back}</i></button>
            ${op?`<div class="n-card ap-gb">${L.slice(0,(ui.apMore||{})[mid]?1e9:10).map(p=>APITEM(p)).join("")}${L.length>10?`<button class="cal-more" data-a="apMore" data-v="${esc(mid)}">${(ui.apMore||{})[mid]?"收起來":`顯示全部（${L.length}）`}</button>`:""}</div>`:""}</section>`; }).join(""); })()}</div>`
        :`<section class="card n-card apl">${posts.slice(0,calMore("admpost")).map(p=>APITEM(p)).join("")}${calMoreBtn("admpost",posts.length)}</section>`):q?srchEmpty("貼文"):emptyBox(I.edit,"沒有貼文",gf!=="all"?"這個團體還沒有貼文":"還沒有貼文")}
    </main>`;
  }
  return viewUniTodo();   // 11/11：舊版管理選單（ME、營收、示範工具…）刪掉了，管理員都走新版
}

/* datetime-local 用的本地時間字串（YYYY-MM-DDTHH:MM） */
function dtLocal(ts){ const d=new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; }

/* 世巡提醒（管理員的手機每分鐘看一次）：
   ・下一站開唱前 24 小時還沒留話 → 推播提醒那團的藝人去留一句話
   ・開唱前 10 分鐘還是沒留 → 自動放一句預設的話，照樣通知有買票的粉絲 */
const TR_DEF=[c=>`${c}的大家，今天見！`,c=>`${c}，我們來了 💜`,c=>`今晚在${c}，一起玩吧！`,c=>`${c}，好想你們！等等見`];
function tourTick(){ try{ if(!isAdminAcct()||(HB_ON&&HB.ver[K.wtours]==null)) return; const all=S.get(K.wtours,[])||[], n=Date.now(); let ch=false;
  all.forEach(t=>{ if(t.status!=="approved") return; const g=groupOf(t.gid); if(!g) return;
    tourStops(t).forEach(st=>{ const s=stopState(st); if(s!=="soon"||st.msg) return; const left=st.startTs-n;
      if(left<=24*36e5&&left>10*60e3&&!st.rem){ st.rem=n; ch=true; const ems=Object.keys(ACCOUNTS).filter(e=>{ const a=ACCOUNTS[e]; return a&&a.member&&MEMBERS[a.member]&&MEMBERS[a.member].group===t.gid; });
        ems.forEach(e=>feedPush({kind:"system",text:`${t.title}・${st.city}站快開唱了，去世巡留一句話給粉絲吧`},"u:"+e)); }
      if(left<=10*60e3){ const h=[...st.id].reduce((a,c)=>a+c.charCodeAt(0),0); st.msg=TR_DEF[h%TR_DEF.length](st.city); st.msgAuto=1; st.msgTs=n; ch=true;
        feedPush({kind:"tour",group:t.gid,text:`${st.city}站・${st.msg}`,tourId:t.id,direct:true},"tix:"+st.id); } }); });
  if(ch) S.set(K.wtours,all); }catch(e){} }
setInterval(tourTick,60e3); setTimeout(tourTick,11e3);

