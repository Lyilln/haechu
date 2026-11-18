/* HAECHU｜PHOTOCARD 抽卡、專輯 */
/* =========================================================
   PHOTOCARD 抽卡 v2（參考 NSY 取精華去糟粕）
   ・卡池＝你追蹤的團的成員，每人 3 種卡：★ 日常、★★ 舞台、★★★ 流光
   ・機率：★★★ 3%、★★ 15%、★ 82%；十連保底至少一張 ★★；單抽 100 點、十連 900 點
   ・從 NSY 留下：抽卡前的光門過場、翻卡音效、要全部翻開才收下、「翻開其餘 N 張」、
     卡池一覽、抽卡紀錄、會跟著手指／手機傾斜的光澤
   ・自己加的：NEW 標記、稀有卡背面先透光、卡號與首次獲得日、每張卡的機率
   ・沒有留下：每日免費領積分、另一種貨幣、隨機覆蓋卡冊格子、手機震動（iPhone 不支援）、
     「第 n 格／預覽占位」這種後台用語、每抽一次就發一則通知
   ========================================================= */
const TIERS={1:{name:"日常",rate:.82},2:{name:"舞台",rate:.15},3:{name:"流光",rate:.03}};
/* 藝人（不管團體或 SOLO，管理員也一樣）不能買自己團的任何東西，不能幫自己衝銷量 */
/* 出道申請：粉絲在 ME 填藝名 → 管理員核准 → 自動建 SOLOIST 並綁定帳號 */
const getDebut=()=>S.get(K.debut,[])||[];
/* 團體出道：申請的人（email）＋其他成員（mems:[{name,email}]），核准後每個人一個藝人（mids:{email:mid}） */
const dbEms=x=>[x.email,...(x.mems||[]).map(m=>m.email)].filter(Boolean);
const dbMids=x=>x.mids?Object.values(x.mids):(x.mid?[x.mid]:[]);
const myDebut=()=>{ const em=myEmail(); return em?getDebut().filter(x=>dbEms(x).includes(em)&&x.status!=="gone").sort((a,b)=>b.ts-a.ts)[0]||null:null; };
function debutSync(){ try{ const s=session(), d=myDebut(); const mid=d&&((d.mids||{})[s&&s.email]||d.mid); if(!s||s.home||!d||d.status!=="ok"||!mid||!MEMBERS[mid]) return; const a=ACCOUNTS[s.email]; if(a&&!a.member) ACCOUNTS[s.email]={...a,role:a.role==="admin"?"admin":"artist",member:mid}; SS.set({...s,home:mid}); }catch(e){} }
function debutRow(){ const s=session(); if(!s||isAdminAcct()||s.uni||s.admin||(ACCOUNTS[s.email]||{}).role==="admin"||s.home||(ACCOUNTS[s.email]||{}).member) return ""; const d=myDebut(), st=d&&d.status==="wait"?"審核中":d&&d.status==="pre"?`預告中・D-${dLeft(d.day)}`:d&&d.status==="no"?"未通過":points()<LV_TBL[1][1][0]?"到 R1 才能申請":"";
  return `<div class="section-h">出道</div><section class="card"><button class="list-btn" data-a="debutAsk">${I.star}申請出道<span class="r">${st}</span></button></section>`; }
function debutAdmHtml(){ const L=getDebut().filter(x=>x.status!=="gone").sort((a,b)=>b.ts-a.ts), W=L.filter(x=>x.status==="wait"), H=L.filter(x=>x.status!=="wait");
  const row=x=>{ const st=x.status==="ok"?["ok","已出道"]:x.status==="pre"?["pre",`預告中・${mdTxt(x.day)} 出道`]:x.status==="no"?["no","未通過"]:["wait",`審核中・想在 ${mdTxt(x.day)} 出道`], pr=x.pr||{};
    return `<div class="db2"><div class="db2-h"><span class="db-av" style="background:${grad(x.g||0)}">${esc((x.name||"?")[0])}</span><div class="db2-t"><b>${esc(x.name)}</b><small>${x.kind==="group"?`團體・${esc(x.me||"")}（${esc(acctUser(x.email))}）${(x.mems||[]).map(m=>`、${esc(m.name)}（${esc(acctUser(m.email))}）`).join("")}`:`SOLO・${esc(acctUser(x.email))}`}</small></div><span class="db2-st ${st[0]}">${st[1]}</span></div>
      <div class="db2-i">${x.song?`<span>《${esc(x.song)}》${x.rtype?" "+esc(x.rtype):""}</span>`:""}${pr.album?`<span>💿 ${esc(pr.album)}</span>`:""}${x.co?`<span>${esc(x.co)}</span>`:""}<span>${ago(x.ts)} 申請</span></div>
      ${dbMedia(x)}
      <div class="db2-a">${x.status==="wait"?`<button class="btn btn-sm btn-soft" data-a="dbAdmEdit" data-v="${x.id}">修改</button><button class="btn btn-sm btn-soft" data-a="dbNo" data-v="${x.id}">不核准</button><button class="btn btn-sm btn-main" data-a="dbOk" data-v="${x.id}">核准</button>`:`${x.status==="pre"?`<button class="btn btn-sm btn-soft" data-a="dbPreEdit" data-v="${x.id}">修改</button>`:""}${x.status==="pre"||x.status==="no"?`<button class="btn btn-sm btn-soft db2-del" data-a="dbWipe" data-v="${x.id}">刪除</button>`:""}`}</div></div>`; };
  return `<main class="page">${W.length?`<section class="card">${W.map(row).join("")}</section>`:`<div class="t-empty"><span class="t-empty-ico">${I.star}</span><p>目前沒有申請</p></div>`}${H.length?`<div class="section-h">紀錄</div><section class="card">${H.slice(0,30).map(row).join("")}</section>`:""}</main>`; }
const debutWait=()=>getDebut().filter(x=>x.status==="wait").length;
/* 申請出道的表單：藝名＋Teaser 照片＋MV（兩個都必填，選了就先上傳） */
const DB_MAXM=9;
const dbKeep=()=>{ const f=ui.dbF; if(!f) return; if(typeof promoKeep==="function") promoKeep(f); const v=id=>{ const e=document.getElementById(id); return e?e.value:null; }; const n=v("dbName"), gn=v("dbGName"), dd=v("dbDate"), ct=v("cbTitle"), bd=v("dbBd"), sg=v("dbSong"); if(sg!=null) f.song=sg; if(ct!=null) f.title=ct; if(bd!=null) f.bd=bd; if(n!=null) f.name=n; if(gn!=null) f.gname=gn; if(dd!=null) f.date=dd;
  (f.mems||[]).forEach((m,i)=>{ const a=v("dbMn"+i), b=v("dbMa"+i), c=v("dbMb"+i); if(a!=null) m.name=a; if(b!=null) m.acc=b; if(c!=null) m.bd=c; }); };
function debutForm(){ const f=ui.dbF||(ui.dbF={kind:"solo",name:"",gname:"",co:"",mems:[{name:"",acc:""}],teaser:"",tPrev:"",mv:null,mPrev:"",busy:""}); f.tx=f.tx||[]; f.txP=f.txP||[]; f.mems=f.mems||[{name:"",acc:""}]; const grp=f.kind==="group";
  const tp=f.tPrev||f.teaser, t=tp?`<img src="${esc(tp)}" alt="">`:`<b>＋</b>`, vid=(v,pv)=>v?(pv?`<img src="${esc(pv)}" alt=""><i>▶</i>`:`<i>▶</i>`):`<b>＋</b>`, m=vid(f.mv,f.mPrev), mt=vid(f.mvt,f.mtPrev);
  const tx=[1,2,3].map(i=>{ const u=f.txP[i-1]||f.tx[i-1]; return `<button class="db-slot t sm" data-a="dbTeaser" data-i="${i}" aria-label="Teaser 照片 ${i+1}">${u?`<img src="${esc(u)}" alt="">`:`<b>＋</b>`}</button>`; }).join("");
  const kind=`<div class="chips db-kind"><button class="chip ${grp?"":"on"}" data-a="dbKind" data-v="solo">SOLO 出道</button><button class="chip ${grp?"on":""}" data-a="dbKind" data-v="group">團體出道</button></div>`;
  const who=grp?`<span class="fs-f-lab">團名</span><input id="dbGName" class="a-nick-in" maxlength="16" placeholder="輸入文字" value="${esc(f.gname||"")}">
    <span class="fs-f-lab">${f.editId?"申請人的藝名":"你的藝名"}</span><input id="dbName" class="a-nick-in" maxlength="16" placeholder="輸入文字" value="${esc(f.name)}">
    <span class="fs-f-lab">${f.editId?"申請人的生日":"你的生日"}</span><input id="dbBd" class="a-nick-in" type="date" max="${ymdIn(Date.now())}" value="${esc(f.bd||"")}">
    <span class="fs-f-lab">其他成員（藝名・帳號・生日）</span><div class="db-mems">${f.mems.map((x,i)=>`<div class="db-mem"><input id="dbMn${i}" class="a-nick-in" maxlength="16" placeholder="輸入文字" value="${esc(x.name||"")}"><input id="dbMa${i}" class="a-nick-in" maxlength="40" placeholder="輸入文字" autocapitalize="off" autocomplete="off" value="${esc(x.acc||"")}">${f.mems.length>1?`<button class="db-mx" data-a="dbMemDel" data-i="${i}" aria-label="移除這位成員">✕</button>`:"<i></i>"}<input id="dbMb${i}" class="a-nick-in db-mbd" type="date" max="${ymdIn(Date.now())}" value="${esc(x.bd||"")}" aria-label="生日"></div>`).join("")}</div>${f.mems.length<DB_MAXM?`<button class="t-pill db-madd" data-a="dbMemAdd">＋ 加一位成員</button>`:""}`
    :`<span class="fs-f-lab">藝名</span><input id="dbName" class="a-nick-in" maxlength="16" placeholder="輸入文字" value="${esc(f.name)}"><span class="fs-f-lab">生日</span><input id="dbBd" class="a-nick-in" type="date" max="${ymdIn(Date.now())}" value="${esc(f.bd||"")}">`;
  const pr=prOf(f), X=k=>esc(pr[k]||"");
  const whoPre=f.pre?`<p class="dbx-d">已經核准，${grp?"團名、成員":"藝名"}不能改；其他都可以改。</p><span class="fs-f-lab">${grp?"團名":"藝名"}</span><p class="dbx-ro">${esc(grp?f.gname:f.name)}</p>
    <span class="fs-f-lab">${grp?`${esc(f.name)} 的生日`:"生日"}</span><input id="dbBd" class="a-nick-in" type="date" max="${ymdIn(Date.now())}" value="${esc(f.bd||"")}">
    ${grp?f.mems.map((x,i)=>`<span class="fs-f-lab">${esc(x.name)} 的生日</span><input id="dbMb${i}" class="a-nick-in" type="date" max="${ymdIn(Date.now())}" value="${esc(x.bd||"")}">`).join(""):""}`:"";
  const dOrig=f.pre?(getDebut().find(y=>y.id===f.editId)||{}).day||0:0, dMin=f.pre&&dOrig?Math.min(Date.now()+PRE_MIN,dOrig):Date.now()+PRE_MIN;   /* 跟申請一樣最快 7 天後（粉絲要有時間訂應援餐車）；已經在 7 天內的只能往後延 */
  dbPage(f.pre?"修改出道資料":f.editId?"修改出道申請":"出道申請","debutOk",f,[
    ["基本資料","",`${f.pre?whoPre:kind+who}<span class="fs-f-lab">公司</span>${coChips(f.co||"","dbCo")}
      <span class="fs-f-lab">粉絲名 <em>選填</em></span><input id="prX_fan" class="a-nick-in" maxlength="16" placeholder="例：MY、CARAT" value="${X("fan")}">
      <span class="fs-f-lab">${grp?"團名":"藝名"}的由來 <em>選填</em></span><textarea id="prX_intro" class="a-nick-in dbx-ta" rows="3" placeholder="輸入文字">${X("intro")}</textarea>`],
    ["作品","出道專輯和主打歌。核准後記得到 ME → 專輯・小卡 放公放卡（必放）",dbWorkF(f,"dbSong","出道曲（主打歌）")],
    ["宣傳排程","核准後會照日期自動發；出道前 7 天開始",dbPromoF(f,`<span class="fs-f-lab">出道日</span><input id="dbDate" class="a-nick-in" type="date" min="${ymdIn(dMin)}" value="${esc(f.date||ymdIn(dMin))}">`)],
    ["結尾妖精","打歌時每週每個節目會揭曉一位",dbFairyF(f)],
    ["一位感言","",dbSpkF(f)],
    ["出道當天","",dbDayF(f,"出道")]]); }
/* ---------- 出道／回歸申請：獨立一頁（照真實 K-POP 宣傳會有的東西分區） ---------- */
function dbSpkF(f){ const v=esc((prOf(f)||{}).spk||""); return `<span class="fs-f-lab">拿到一位時想對粉絲說的話 <em>選填</em></span><textarea id="prX_spk" class="a-nick-in dbx-ta" rows="4" maxlength="120" placeholder="例：謝謝一直陪在我們身邊的你們，這個一位是大家一起拿到的💜">${v}</textarea><p class="dbx-d">這首歌拿到一位時，會在一位發表的「得獎感言」出現。之後回歸可以再寫新的。</p>`; }
function dbWorkF(f,songId,songLab){ const pr=prOf(f), X=k=>esc(pr[k]||""), sv=songId==="cbTitle"?(f.title||""):(f.song||"");
  return `<span class="fs-f-lab">專輯名稱 <em>選填</em></span><input id="prX_album" class="a-nick-in" maxlength="40" placeholder="例：The 1st Mini Album『Sequence 01』" value="${X("album")}">
    <span class="fs-f-lab">專輯封面 <em>選填</em></span><div class="db-up4 one">${prImgSlot(pr.covP||pr.cov,'data-k="cov"',"")}</div><p class="dbx-d">會用在打歌排行、SNS 加入音樂、出道／回歸當天的官方貼文和 MEET 相簿。</p>
    <span class="fs-f-lab">${songLab}</span><input id="${songId}" class="a-nick-in" maxlength="30" placeholder="輸入文字" value="${esc(sv)}">
    <span class="fs-f-lab">第二首主打（雙主打）<em>選填</em></span><input id="prX_t2" class="a-nick-in" maxlength="30" placeholder="例：BOOMBAYAH＋WHISTLE 這種" value="${X("t2")}"><p class="dbx-d">兩首主打會一起打歌、互相比分數；之後回歸才會一起下檔。</p>
    <span class="fs-f-lab">發行型態</span>${relChips(f.rtype||"",songId==="cbTitle"?"cbrRel":"dbRel")}${promoTrk(f)}
    <span class="fs-f-lab">專輯介紹 <em>選填</em></span><textarea id="prX_desc" class="a-nick-in dbx-ta" rows="4" placeholder="這張專輯想說的故事、概念">${X("desc")}</textarea>
    <span class="fs-f-lab">主打歌製作人員 <em>選填</em></span><textarea id="prX_credit" class="a-nick-in dbx-ta" rows="3" placeholder="作詞：&#10;作曲：&#10;編曲：">${X("credit")}</textarea>
    <span class="fs-f-lab">主打歌歌詞 <em>選填</em></span><textarea id="prX_lyr" class="a-nick-in dbx-ta" rows="4" placeholder="發行當天跟 MV 一起公開">${X("lyr")}</textarea>`; }
function dbPromoF(f,dateF){ const tp=f.tPrev||f.teaser, vid=(v,pv)=>v?(pv?`<img src="${esc(pv)}" alt=""><i>▶</i>`:`<i>▶</i>`):`<b>＋</b>`;
  const tx=[1,2,3].map(i=>{ const u=(f.txP||[])[i-1]||(f.tx||[])[i-1]; return `<button class="db-slot t sm" data-a="dbTeaser" data-i="${i}" aria-label="Teaser 照片 ${i+1}">${u?`<img src="${esc(u)}" alt="">`:`<b>＋</b>`}</button>`; }).join("");
  return `${dateF}<span class="fs-f-lab">每天發布時間</span>${prTimeF(f)}
    <span class="fs-f-lab">排程表 <em>沒放會自動做一張</em></span>${prSchedF(f)}
    <span class="fs-f-lab">Teaser 照片</span><div class="db-up4"><button class="db-slot t" data-a="dbTeaser" data-i="0" aria-label="Teaser 照片">${tp?`<img src="${esc(tp)}" alt="">`:`<b>＋</b>`}<small>主圖</small></button>${tx}</div>
    <span class="fs-f-lab">概念照 <em>可以有好幾個版本</em></span>${prCvF(f)}
    <span class="fs-f-lab">預告影片 <em>選填</em></span>${prVidF(f)}
    <span class="fs-f-lab">MV</span><div class="db-up"><button class="db-slot v" data-a="dbMvt" aria-label="MV Teaser">${vid(f.mvt,f.mtPrev)}<small>MV Teaser</small></button><button class="db-slot v" data-a="dbMv" aria-label="MV">${vid(f.mv,f.mPrev)}<small>MV</small></button></div><div class="db-up"><button class="db-slot v" data-a="dbMv2" aria-label="第二首主打 MV">${vid(prOf(f).mv2,prOf(f).mv2P)}<small>${String(prOf(f).t2||"").trim()?`《${esc(prOf(f).t2)}》MV`:"第二首主打 MV（雙主打才要）"}</small></button><span class="db-slot ghost" aria-hidden="true"></span></div>`; }
/* 結尾妖精：成員幾位就幾格，每位先放好自己的片段 */
function dbFairyF(f){ const fy=prOf(f).fy||{}; let L;
  if(f.cb){ L=groupArtists(f.gid).slice().sort().map(m=>[m,stageNm(m)]); }
  else L=[["me",(f.name||"").trim()||(f.kind==="group"?"你":"藝名")],...(f.kind==="group"?(f.mems||[]).map((m,i)=>[ "m"+i,(m.name||"").trim()||`成員 ${i+1}`]):[])];
  return `<div class="fy-g">${L.map(([k,lab])=>fairyThumb(fy[k],lab,`data-a="dbFy" data-k="${esc(k)}"`,false)).join("")}</div><p class="dbx-d">每位成員放一段自己的結尾妖精（影片，最多 ${FAIRY_MAX_SEC} 秒）。⚠️ 只能放人設（皮相）的片段。</p>`; }
function dbDayF(f,w){ const pr=prOf(f); return `<div class="dbx-day"><b>${w}當天會自動發生</b><ul><li>到了「每天發布時間」，MV 和專輯照一起公開</li><li>主打歌開始打歌（進打歌舞台）</li>${pr.sc?`<li>${esc(pr.sc)} 公司官方帳號發「${w} Showcase 今天 ${esc(pr.sc)} 開始」公告</li>`:""}</ul></div>
    <span class="fs-f-lab">Showcase 開始時間 <em>選填</em></span><input id="prX_sc" class="a-nick-in" type="time" value="${esc(pr.sc||"")}"><p class="dbx-d">Showcase＝${w}後的第一個舞台（例如在群裡直播、表演）。有辦就填幾點開始，當天到了那個時間會自動發公告提醒大家來看；沒有辦就留空。</p>`; }
/* 跟真實的出道／回歸宣傳比，還缺什麼 */
function dbCheck(f){ const pr=prOf(f), cv=(pr.cv||[]).filter(v=>(v.ph||[]).some(Boolean)||(v.phP||[]).some(Boolean)).length, db=!f.cb;
  return [["Teaser 照片",!!(f.teaser||(f.tx||[]).some(Boolean))],["概念照（至少 2 個版本）",cv>=2],["曲目表",!needsTrk(f.rtype)||!!String(pr.trk||"").trim()],["Highlight Medley／概念影片",!!pr.vid],["MV Teaser",!!f.mvt],["MV",!!f.mv],["專輯名稱",!!String(pr.album||"").trim()],["專輯介紹",!!String(pr.desc||"").trim()],["製作人員",!!String(pr.credit||"").trim()],["結尾妖精",Object.values(pr.fy||{}).some(v=>v&&v.m)],...(db?[["粉絲名",!!String(pr.fan||"").trim()]]:[])]; }
function dbPlanPv(f){ const day=ymdTs(f.date); if(!day) return ""; const sv={k:f.cb?"cb":"db",id:"pv",name:f.cb?((groupOf(f.gid)||{}).name||""):(f.kind==="group"?f.gname:f.name)||"",title:f.cb?f.title:f.song,day,appr:Date.now(),teaser:f.teaser||f.tPrev||"",teasers:(f.tx||[]).filter(Boolean),mvt:f.mvt,pr:{...prOf(f),vid:prOf(f).vid},rtype:f.rtype||""};
  let L=[]; try{ L=promoPlan(sv); }catch(e){ return ""; } return `<ol class="dbx-pl">${L.map(x=>`<li><time>${x.k==="sched"?"核准後馬上":mdTxt(x.ts)+" "+hm(x.ts)}</time><span>${x.k==="concept"&&x.n?`Concept Photo・${esc(x.n)}`:PR_KIND[x.k]||x.k}</span></li>`).join("")}</ol>`; }
/* 11/17 申請表改成一頁一步：上面是步驟列（點了可以跳），一次只看一區；完整度收成一行，點開才看細項；最後一步才是送出 */
function dbPage(title,okAct,f,secs){ const old=layer.querySelector(".dbx-b"), sk=title+"|"+(f.editId||""); if(ui.dbStepK!==sk){ ui.dbStepK=sk; ui.dbStep=0; ui.dbCkOpen=false; }
  const st=Math.max(0,Math.min(secs.length-1,ui.dbStep||0)), same=old&&old.dataset.st===String(st), y=same?old.scrollTop:0, ck=dbCheck(f), miss=ck.filter(x=>!x[1]).length, last=st===secs.length-1, [h,d,body]=secs[st];
  setLayer(`<div class="dbx" role="dialog" aria-label="${esc(title)}"><header class="dbx-h"><button class="dbx-x" data-a="tCloseLayer">取消</button><b>${esc(title)}</b>${f.sv?(f.svRo?`<span class="dbx-ok"></span>`:`<button class="dbx-ok" data-a="svDbSave" ${f.busy?"disabled":""}>儲存</button>`):`<button class="dbx-ok" data-a="${okAct}" ${f.busy?"disabled":""}>${f.editId||f.adm?"儲存":"送出"}</button>`}</header>
    <nav class="dbx-steps">${secs.map(([n],i)=>`<button class="${i===st?"on":i<st?"done":""}" data-a="dbStep" data-v="${i}"><i>${i+1}</i>${esc(n)}</button>`).join("")}</nav>
    <div class="dbx-b" data-st="${st}">${f.busy?`<p class="db-busy">${f.busy}</p>`:""}
      <button class="dbx-ck1" data-a="dbCk"><b>${miss?`宣傳資料還缺 ${miss} 項`:"宣傳資料都填好了"}</b><em>${ck.length-miss}／${ck.length}</em><span>${ui.dbCkOpen?"收起":miss?"看缺什麼":"看清單"}</span></button>${ui.dbCkOpen?`<p class="dbx-ckn">出道當天會自動發的宣傳（預告照、概念照、MV…），沒填的那幾項就不會發。這裡只是幫你看還缺什麼，必填的欄位送出時會另外提醒。</p><div class="dbx-ckl">${ck.map(([l,ok])=>`<span class="${ok?"ok":""}">${ok?"✓":"○"} ${l}</span>`).join("")}</div>`:""}
      <section class="dbx-s"><h4><i>${st+1}</i>${h}</h4>${d?`<p class="dbx-d">${d}</p>`:""}${body}${h==="宣傳排程"?`<div class="dbx-pv"><b>自動發文時間表</b>${dbPlanPv(f)||`<p class="dbx-d">選好日期就會出現</p>`}</div>`:""}</section>
      <div class="dbx-nav">${st>0?`<button class="btn btn-soft" data-a="dbStep" data-v="${st-1}">上一步</button>`:"<span></span>"}${last&&f.sv?(f.svRo?"<span></span>":`<button class="btn btn-soft" data-a="svDbDraft">存草稿</button><button class="btn btn-soft" data-a="svDbSave">儲存</button><button class="btn btn-main" data-a="${okAct}" ${f.busy?"disabled":""}>正式送出</button>`):last?`<button class="btn btn-main" data-a="${okAct}" ${f.busy?"disabled":""}>${f.editId||f.adm?"儲存":"送出"}</button>`:`<button class="btn btn-main" data-a="dbStep" data-v="${st+1}">下一步</button>`}</div>
</div></div>`,"dbx");
  const b=layer.querySelector(".dbx-b"); if(b&&y) b.scrollTop=y;
  { const nv=layer.querySelector(".dbx-steps"), on=nv&&nv.querySelector(".on"); if(on) nv.scrollLeft=Math.max(0,on.offsetLeft-(nv.clientWidth-on.offsetWidth)/2); } }

const dbReform=()=>{ if(!ui.dbF||!layer.querySelector(".dbx")) return; dbKeep(); if(ui.dbF.cb) cbrForm(); else debutForm(); };
const dbMedia=x=>x.teaser||x.mv?`<span class="db-media">${x.teaser?`<button class="db-th" data-a="dbTsr" data-v="${x.id}" aria-label="Teaser 照片"><img src="${esc(x.teaser)}" alt=""></button>`:""}${(x.teasers||[]).map(u=>`<span class="db-th"><img src="${esc(u)}" alt=""></span>`).join("")}${x.mvt?`<button class="db-th v" data-a="dbMvPlay" data-v="${esc(x.mvt.mid)}" aria-label="播放 MV Teaser">${x.mvt.thumb?`<img data-mid="${esc(x.mvt.thumb)}" alt="">`:""}<i>▶</i></button>`:""}${x.mv?`<button class="db-th v" data-a="dbMvPlay" data-v="${esc(x.mv.mid)}" aria-label="播放 MV">${x.mv.thumb?`<img data-mid="${esc(x.mv.thumb)}" alt="">`:""}<i>▶</i></button>`:""}</span>`:"";
function selfGroup(){ const s=session(); if(!s) return null; const a=ACCOUNTS[s.email], mid=isUni()?uniMe():(a&&a.member||s.home||null); return mid&&MEMBERS[mid]?MEMBERS[mid].group:null; }
const isSelfGid=gid=>!!gid&&gid===selfGroup();
const selfBuyMsg=()=>{ const g=groupOf(selfGroup()); return g&&g.solo?"不能購買自己的商品":"不能購買自己團的商品"; };
const cardPool=()=>Object.keys(MEMBERS).filter(id=>!MEMBERS[id].official&&followed().includes(MEMBERS[id].group)&&!isSelfGid(MEMBERS[id].group));
const getCards=()=>S.get(K.cards,{});
const cardMeta=()=>S.get(K.cardMeta,{});
const cardNo=no=>"No."+String(no).padStart(4,"0");
function rollTier(){ const r=Math.random(); return r<TIERS[3].rate?3:r<TIERS[3].rate+TIERS[2].rate?2:1; }
const GC_COST=n=>n===1?1200:11000, GC_PITY=50;   // 單抽 1,200、十連 11,000；50 抽保底 ★★★
function drawCards(n){
  const pool=cardPool(), cost=GC_COST(n); if(!pool.length) return {err:"先追蹤藝人才有卡池喔"}; if(points()<cost) return {err:"積分不夠，先補充積分吧"};
  S.set(K.points,points()-cost); recordSale("gacha",{pts:cost,label:n===1?"PHOTOCARD 單抽":"PHOTOCARD 十連"});
  let pity=+S.get(K.gcPity,0)||0; const got=[]; for(let i=0;i<n;i++){ pity++; let tr=rollTier(); if(pity>=GC_PITY) tr=3; if(tr===3) pity=0; got.push(pool[Math.random()*pool.length|0]+":"+tr); } S.set(K.gcPity,pity);
  if(n===10&&!got.some(c=>+c.split(":")[1]>=2)){ const i=Math.random()*10|0; got[i]=got[i].split(":")[0]+":2"; }   // 十連保底
  const own=getCards(), meta=cardMeta(), fresh=[];
  got.forEach((c,i)=>{ if(!own[c]){ fresh.push(i); meta[c]={ts:Date.now(),no:1+(Math.random()*9999|0)}; } own[c]=(own[c]||0)+1; });
  S.set(K.cards,own); S.set(K.cardMeta,meta); setTimeout(serialSync,300);
  const log=S.get(K.gachaLog,[]); log.unshift({ts:Date.now(),cards:got}); S.set(K.gachaLog,log.slice(0,50));
  logSelf("core",null,`你抽了 ${n} 張 PHOTOCARD${got.some(c=>c.endsWith(":3"))?"，抽到流光卡 ✨":""}`);
  return {got,fresh};
}

/* 音效：只用一個 AudioContext（NSY 每次都新開一個，iPhone 會吃不消）。iPhone 靜音模式可能聽不到 */
let sfxCtx=null;
const sfxOn=()=>S.get(K.gachaSnd,true);
function sfx(type){
  if(!sfxOn()) return;
  try{ const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return; if(!sfxCtx) sfxCtx=new AC(); if(sfxCtx.state==="suspended") sfxCtx.resume();
    const ctx=sfxCtx, t0=ctx.currentTime;
    const tone=(f,st,d,tp="sine",v=.08)=>{ const o=ctx.createOscillator(), g=ctx.createGain(); o.type=tp; o.frequency.setValueAtTime(f,t0+st); g.gain.setValueAtTime(.0001,t0+st); g.gain.exponentialRampToValueAtTime(v,t0+st+.02); g.gain.exponentialRampToValueAtTime(.0001,t0+st+d); o.connect(g); g.connect(ctx.destination); o.start(t0+st); o.stop(t0+st+d+.05); };
    if(type==="whoosh"){ const o=ctx.createOscillator(), g=ctx.createGain(), fl=ctx.createBiquadFilter(); o.type="triangle"; fl.type="lowpass";
      o.frequency.setValueAtTime(120,t0); o.frequency.exponentialRampToValueAtTime(900,t0+1.1); fl.frequency.setValueAtTime(400,t0); fl.frequency.exponentialRampToValueAtTime(3000,t0+1.1);
      g.gain.setValueAtTime(.0001,t0); g.gain.exponentialRampToValueAtTime(.06,t0+.7); g.gain.exponentialRampToValueAtTime(.0001,t0+1.3); o.connect(fl); fl.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0+1.4); }
    else if(type==="flip") tone(660,0,.16,"sine",.05);
    else if(type==="t2"){ tone(659,0,.25); tone(988,.08,.32); }
    else if(type==="t3"){ [523,659,784,1047].forEach((f,i)=>tone(f,i*.09,.45,"triangle",.08)); tone(1568,.36,.7,"sine",.05); }
  }catch(e){}
}

/* =========================================================
   抽卡演出 v3（參考乙女遊戲的抽卡）
   ① 許願：把星星往上滑（或點一下）送出去
   ② 光的顏色先預告：紫＝都是 ★、粉＝有 ★★、金＝有 ★★★
   ③ 一張一張全螢幕登場：卡片從光裡翻出來、星星一顆顆亮起、名字浮現、成員說一句話
      ★★★ 登場前會先暗下來，金色的光聚起來，跳出「流光」
   ④ 最後是結算，可以直接再抽一次
   ・右上角「跳過」直接看結算
   ========================================================= */
const GC_LINES={
  1:["今天也辛苦了，記得早點休息。","剛練習完，第一個想到的就是你。","吃飯了嗎？不要又隨便打發喔。","這張是今天的我，收好喔。","路過的時候想起你，就拍下來了。","累的時候看看這張，我在這裡。"],
  2:["舞台上的燈很亮，但我還是找到你了。","剛剛那段副歌，是唱給你的。","下台的時候手還在抖，因為你在看。","應援聲我都聽到了，謝謝你。","下一個舞台，也要在台下等我喔。"],
  3:["這一刻，只想讓你一個人看見。","不管多遠，我都會走到你面前。","把這道光收好，它是我留給你的。","你一直都在，所以我才能一直發光。","如果星星會說話，它大概會說我想你。"]};
const GC_COL={1:["#C7AEFF","#A47BFF","#F0ABFC","#FFFFFF"],2:["#F9A8D4","#F472B6","#FBCFE8","#E9D5FF","#FFFFFF"],3:["#FDE68A","#FBBF24","#FFF7D6","#F9A8D4","#FFFFFF"]};
let gcRaf=0;
const gcTier=c=>+c.split(":")[1];
function gcStart(r){
  cancelAnimationFrame(gcRaf);
  const best=Math.max(...r.got.map(gcTier));
  ui.gc={r,best,i:-1,phase:"rit",lines:r.got.map(c=>{const L=GC_LINES[gcTier(c)];return L[Math.random()*L.length|0];})};
  setLayer(`<div class="gc-w t${best}" id="gcW" data-a="gcTap" role="dialog" aria-label="抽卡"><canvas id="gcCv"></canvas><div class="gc-flash" id="gcFl"></div><div class="gc-st" id="gcSt"></div>
    <div class="gc-tb"><button class="gc-ib" data-a="gdSnd" aria-label="音效開關">${sfxOn()?"🔊":"🔈"}</button><button class="gc-ib gc-skip" data-a="gcSkip">跳過 ››</button></div></div>`,"gc"+Date.now());
  gcBg();
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){ gcSum(); return; }
  gcRitual();
}
function gcBg(){
  const cv=document.getElementById("gcCv"); if(!cv) return;
  const ctx=cv.getContext("2d"), dpr=Math.min(devicePixelRatio||1,2), W=innerWidth, H=innerHeight; cv.width=W*dpr; cv.height=H*dpr; ctx.scale(dpr,dpr);
  const stars=Array.from({length:90},()=>({x:Math.random()*W,y:Math.random()*H,r:.4+Math.random()*1.3,p:Math.random()*6.28,v:.08+Math.random()*.22}));
  const P=ui.gcP=[]; PH.reset(W,H); let lt=performance.now();
  (function f(){ if(document.getElementById("gcCv")!==cv) return; ctx.clearRect(0,0,W,H); const nt=performance.now(), dt=(nt-lt)/1000; lt=nt;
    stars.forEach(s=>{ s.p+=.03; s.y-=s.v; if(s.y<-4){ s.y=H+4; s.x=Math.random()*W; } ctx.globalAlpha=.3+.5*Math.sin(s.p)**2; ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,6.283); ctx.fill(); });
    for(let k=P.length-1;k>=0;k--){ const q=P[k]; q.x+=q.vx; q.y+=q.vy; q.vx*=q.fr; q.vy=q.vy*q.fr+q.g; q.a-=q.d; if(q.a<=0){ P.splice(k,1); continue; }
      ctx.globalAlpha=Math.min(1,q.a); ctx.fillStyle=q.c; ctx.beginPath(); ctx.arc(q.x,q.y,q.s,0,6.283); ctx.fill(); }
    ctx.globalAlpha=1; PH.draw(ctx,dt); gcRaf=requestAnimationFrame(f); })();
}
function gcBurst(x,y,tier,n=70,sp=9){ const P=ui.gcP; if(!P) return; const C=GC_COL[tier]; if(n>=40) PH.burst(x,y,C,Math.round(n*.5));   /* 大爆發：另外噴真的紙片（planck.js） */
  for(let i=0;i<n;i++){ const a=Math.random()*6.283, v=sp*(.25+Math.random()); P.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,fr:.95,g:.035,s:.8+Math.random()*2.4,c:C[Math.random()*C.length|0],a:1.2,d:.008+Math.random()*.012}); } }
function gcGather(x,y,tier,n=80){ const P=ui.gcP; if(!P) return; const C=GC_COL[tier];
  for(let i=0;i<n;i++){ const a=Math.random()*6.283, R=150+Math.random()*200, sx=x+Math.cos(a)*R, sy=y+Math.sin(a)*R, st=45+Math.random()*20|0; P.push({x:sx,y:sy,vx:(x-sx)/st,vy:(y-sy)/st,fr:1,g:0,s:.8+Math.random()*2,c:C[Math.random()*C.length|0],a:1,d:1/st}); } }
function gcFlash(t){ const f=document.getElementById("gcFl"); if(!f) return; f.className="gc-flash"; void f.offsetWidth; f.className="gc-flash on t"+t; }

function gcRitual(){
  const st=document.getElementById("gcSt"); ui.gc.phase="rit";
  st.innerHTML=`<div class="gc-rit"><p class="gc-rt">${ui.gc.r.got.length===1?"單 抽":"十 連 抽"}</p><div class="gc-trk"><i></i><i></i><i></i></div>
    <button class="gc-orb" id="gcOrb" data-a="gcLaunch" aria-label="送出願望"><span>✦</span></button><p class="gc-rh">把星星往上滑，送出願望</p><small class="gc-rs">也可以直接點一下星星</small></div>`;
  const orb=document.getElementById("gcOrb"); let y0=null;
  orb.addEventListener("pointerdown",e=>{ y0=e.clientY; try{ orb.setPointerCapture(e.pointerId); }catch(_){} });
  orb.addEventListener("pointermove",e=>{ if(y0==null) return; const dy=Math.min(0,e.clientY-y0); orb.style.transform=`translateY(${dy}px) scale(${1+Math.min(.3,-dy/400)})`; if(dy<-110){ y0=null; gcLaunch(); } });
  const up=()=>{ y0=null; };
  orb.addEventListener("pointerup",up); orb.addEventListener("pointercancel",up);
}
function gcLaunch(){
  const g=ui.gc; if(!g||g.phase!=="rit") return; g.phase="fly";
  const orb=document.getElementById("gcOrb"), b=orb.getBoundingClientRect(), x=b.left+b.width/2, y=b.top+b.height/2, ty=innerHeight*.2;
  sfx("whoosh"); orb.style.transform=""; orb.classList.add("fly"); document.querySelector(".gc-rit").classList.add("go");
  for(let k=0;k<16;k++) setTimeout(()=>gcBurst(x,y-(y-ty)*k/16,1,5,1.2),k*30);
  setTimeout(()=>{ if(ui.gc!==g) return; document.getElementById("gcW").classList.add("sky"); gcFlash(g.best); gcBurst(innerWidth/2,ty,g.best,150,12); if(g.best>=2) sfx(g.best===3?"t3":"t2"); },540);
  setTimeout(()=>{ if(ui.gc===g&&g.phase==="fly") gcNext(); },g.best===3?1700:1300);
}
function gcNext(){
  const g=ui.gc; if(!g) return; g.i++;
  if(g.i>=g.r.got.length){ gcSum(); return; }
  if(gcTier(g.r.got[g.i])===3) gcPre3(); else gcShow(g.i);
}
function gcPre3(){
  const g=ui.gc; g.phase="pre"; const i=g.i;
  document.getElementById("gcSt").innerHTML=`<div class="gc-pre"><span class="gc-pre-l"></span><b>流光</b><small>SUPER RARE</small><span class="gc-pre-l"></span></div>`;
  document.getElementById("gcW").classList.add("dim");
  gcGather(innerWidth/2,innerHeight*.45,3,110); sfx("whoosh");
  setTimeout(()=>{ if(ui.gc!==g||g.i!==i) return; document.getElementById("gcW").classList.remove("dim"); gcFlash(3); gcShow(i); },1500);
}
function gcShow(i){
  const g=ui.gc, c=g.r.got[i], mid=c.split(":")[0], t=gcTier(c), m=MEMBERS[mid], gr=m&&groupOf(m.group), nw=(g.r.fresh||[]).includes(i), n=g.r.got.length;
  g.phase="card"; g.shownAt=Date.now();
  document.getElementById("gcSt").innerHTML=`<div class="gc-card t${t}">
      <div class="gc-ci"><span class="gc-rays"></span>${cardFace(c,{big:true})}${nw?'<em class="gc-new">NEW</em>':""}</div>
      <div class="gc-meta"><span class="gc-tier">${TIERS[t].name}<i>${"<s>★</s>".repeat(t)}</i></span>
        <b class="gc-nm">${[...(m?m.name:"")].map((ch,k)=>`<s style="animation-delay:${.6+k*.05}s">${ch===" "?"&nbsp;":esc(ch)}</s>`).join("")}</b>
        <small>${esc(gr?gr.name:"")}</small><p class="gc-q">「${esc(g.lines[i])}」</p></div></div>
    <small class="gc-ct">${n>1?`${i+1} / ${n}　`:""}點一下${i+1<n?"看下一張":"看結果"}</small>`;
  if(t<3) gcFlash(t);
  sfx(t===3?"t3":t===2?"t2":"flip");
  if(t>=2) setTimeout(()=>{ if(ui.gc===g&&g.i===i) gcBurst(innerWidth/2,innerHeight*.4,t,t===3?130:50,t===3?11:7); },250);
}
function gcTap(){ const g=ui.gc; if(!g||g.phase!=="card") return; if(Date.now()-g.shownAt<500) return; gcNext(); }
function gcSum(){
  const g=ui.gc; if(!g) return; g.phase="sum"; g.i=g.r.got.length;
  const got=g.r.got, fresh=new Set(g.r.fresh||[]); ui.drawGot=got; ui.drawFresh=fresh;
  const w=document.getElementById("gcW"); w.classList.remove("dim"); w.classList.add("sky","sum");
  const nw=fresh.size, r3=got.filter(c=>gcTier(c)===3).length, r2=got.filter(c=>gcTier(c)===2).length, n=got.length;
  document.getElementById("gcSt").innerHTML=`<div class="gc-sum"><b class="gc-sh">${n===1?"單抽":"十連抽"}結果</b>
    <div class="gd-grid n${n}">${got.map((c,i)=>`<span class="gd-card open ${gcTier(c)===3?"rare":""}" style="animation-delay:${i*.05}s"><span class="gd-face">${cardFace(c)}${fresh.has(i)?'<em class="gd-new">NEW</em>':""}</span></span>`).join("")}</div>
    <p class="gd-sum">${[nw?`NEW ${nw} 張`:"",r3?`★★★ ${r3} 張`:"",r2?`★★ ${r2} 張`:""].filter(Boolean).join("・")||"都是收過的卡，張數 +1"}</p>
    <div class="gc-sb"><button class="btn btn-soft" data-a="gcAgain" data-v="${n}">再抽${n===1?"一次":"十連"}・${fmt(GC_COST(n))} 積分</button><button class="btn btn-main" data-a="gdDone">收進卡冊</button></div></div>`;
  if(r3) setTimeout(()=>gcBurst(innerWidth/2,innerHeight*.35,3,90,9),200);
}

function cardFace(cid,{big=false}={}){
  if(String(cid).startsWith("it|")) return itemFace(cid,{big});
  const [mid,t]=cid.split(":"), m=MEMBERS[mid]; if(!m) return "";
  const c=GRADS[m.g%GRADS.length], tier=+t, g=groupOf(m.group);
  return `<div class="pc t${tier} ${big?"big":""}" style="--c1:${c[0]};--c2:${c[1]}"><span class="pc-bg"></span>${tier>=2?`<span class="pc-holo${tier===2?" lite":""}"></span>`:""}<span class="pc-glare"></span>
    <span class="pc-in">${esc(ini(m.name))}</span><span class="pc-sp">✦</span>
    <span class="pc-ft"><b>${esc(m.name)}</b><small>${gTag(g)}${TIERS[tier].name}</small><i>${"★".repeat(tier)}</i></span></div>`;
}

/* 卡池一覽：先看得到這期有哪些卡、每張多少機率，還沒有的卡會霧掉 */
function openPool(){
  const pool=cardPool(), own=getCards(), only=!!ui.poolMiss; if(!pool.length){ toast("先追蹤藝人才有卡池喔"); return; }
  const N=pool.length, have=pool.reduce((n,id)=>n+[1,2,3].filter(t=>own[id+":"+t]).length,0);
  const per=t=>+(TIERS[t].rate*100/N).toFixed(3);
  const gs=followed().map(groupOf).filter(Boolean).map(g=>esc(g.name)).join("、");
  const secs=[3,2,1].map(t=>{ const ids=pool.filter(id=>!only||!own[id+":"+t]); if(!ids.length) return "";
    return `<div class="pl-sec t${t}">${"★".repeat(t)} ${TIERS[t].name}<small>${ids.length} 張</small></div><div class="pl-grid">${ids.map(id=>{const cid=id+":"+t;
      return own[cid]?`<button class="pl-c" data-a="cardView" data-v="${cid}">${cardFace(cid)}</button>`:`<div class="pl-c lock">${cardFace(cid)}<span class="pl-q">?</span></div>`;}).join("")}</div>`; }).join("");
  setLayer(`<div class="t-sheet-w" data-a="tCloseLayer"><div class="t-sheet pl" role="dialog" aria-label="卡池一覽"><div class="grab"></div>
    <div class="pl-h"><b>卡池一覽</b><small>共 ${N*3} 張・你收集了 ${have} 張</small></div>
    <div class="pl-rate">${[3,2,1].map(t=>`<div class="t${t}"><i>${"★".repeat(t)}</i><b>${TIERS[t].name} ${Math.round(TIERS[t].rate*100)}%</b><small>每張 ${per(t)}%</small></div>`).join("")}</div>
    <p class="pl-note">卡池是你追蹤的團（${gs}）的成員。十連保底一張 ★★ 以上，${GC_PITY} 抽內保底一張 ★★★（還差 ${GC_PITY-(+S.get(K.gcPity,0)||0)} 抽）。</p>
    <div class="pl-tg"><button class="${only?"":"on"}" data-a="poolMiss" data-v="0">全部</button><button class="${only?"on":""}" data-a="poolMiss" data-v="1">只看還沒有的</button></div>
    ${secs||`<p class="me-none">全部都收集到了！🎉</p>`}
  </div></div>`,"pool");
}

/* ===== 專輯／小卡照片：管理員上傳，存在手機的 IndexedDB（不放 localStorage，才不會塞爆） =====
   ・小卡照片 pc|專輯|種類|成員；封面 alc|專輯|版本；卡背 cbk|專輯；專輯背面 alb|專輯
   ・沒有上傳的：特殊工藝／預購／Lucky Draw／簽售卡 會先用同一位成員的版本一照片 */
const PCI={};
/* 11/17 專輯、小卡照片放上雲端：以前只存在上傳那支手機（IndexedDB），別人的手機看不到卡面。
   ・上傳時同時傳一份到雲端（R2），網址記在共用的 ALBU（照片 key → 網址），大家的手機都讀得到
   ・每次畫面重畫時把雲端網址補進 PCI；自己剛傳的那張先用手機裡的，別人換過的就改用雲端的
   ・以前傳過、只在這支手機裡的：開 App 後自動補傳一次 */
const ALBU="daisuki_alb_img_u", ALB_K=/^(ph|ib|vc|vb|pc|alc|cbk|alb)\|/;
const albMine=()=>{ try{ return JSON.parse(localStorage.getItem("hc_alb_mine")||"{}")||{}; }catch(e){ return {}; } };
async function albImgUp(key,blob){ if(!ALB_K.test(key)||!HB_ON||!blob) return; try{ const url=await hbImgUrl("alb_"+key.replace(/[^a-z0-9]/gi,"_")+"_"+Date.now().toString(36)+".jpg",blob); if(!url) return;
  const M={...(S.get(ALBU,{})||{})}, old=M[key]; M[key]=url; S.set(ALBU,M); const my=albMine(); my[key]=url; try{ localStorage.setItem("hc_alb_mine",JSON.stringify(my)); }catch(e){} if(old&&old!==url) mediaDel(old); }catch(e){} }
function albImgApply(){ const M=S.get(ALBU,{})||{}, my=albMine(); for(const k in M){ const u=M[k]; if(!u||PCI[k]===u) continue; if(PCI[k]&&PCI[k].startsWith("blob:")&&my[k]===u) continue; if(PCI[k]&&PCI[k].startsWith("blob:")) URL.revokeObjectURL(PCI[k]); PCI[k]=u; } }
setTimeout(async()=>{ try{ if(!HB_ON) return; const M=S.get(ALBU,{})||{}, L=(S.get(K.pcImgs,[])||[]).filter(k=>ALB_K.test(k)&&!M[k]&&PCI[k]&&PCI[k].startsWith("blob:"));
  for(const k of L){ const b=await (await fetch(PCI[k])).blob(); await albImgUp(k,b); } }catch(e){} },12000);
const PIMG={
  async put(key,blob){ try{ const d=await MDB.open(), ab=await blob.arrayBuffer(); await new Promise((res,rej)=>{ const tx=d.transaction("m","readwrite"); tx.objectStore("m").put({ab,type:blob.type},"img_"+key); tx.oncomplete=res; tx.onerror=()=>rej(tx.error); }); }catch(e){}
    if(PCI[key]&&PCI[key].startsWith("blob:")) URL.revokeObjectURL(PCI[key]); PCI[key]=URL.createObjectURL(blob); const L=S.get(K.pcImgs,[]); if(!L.includes(key)) S.set(K.pcImgs,[...L,key]); albImgUp(key,blob); },
  async del(key){ try{ const d=await MDB.open(); d.transaction("m","readwrite").objectStore("m").delete("img_"+key); }catch(e){} if(PCI[key]&&PCI[key].startsWith("blob:")) URL.revokeObjectURL(PCI[key]); delete PCI[key]; S.set(K.pcImgs,S.get(K.pcImgs,[]).filter(k=>k!==key)); if(ALB_K.test(key)){ const M={...(S.get(ALBU,{})||{})}; if(M[key]){ mediaDel(M[key]); delete M[key]; S.set(ALBU,M); } } },
  async loadAll(){ const L=S.get(K.pcImgs,[]); if(!L.length) return; let d; try{ d=await MDB.open(); }catch(e){ return; }
    await Promise.all(L.map(key=>new Promise(res=>{ try{ const q=d.transaction("m").objectStore("m").get("img_"+key); q.onsuccess=()=>{ const v=q.result; if(v&&v.ab) PCI[key]=URL.createObjectURL(new Blob([v.ab],{type:v.type||"image/jpeg"})); res(); }; q.onerror=()=>res(); }catch(e){ res(); } })));
    if(!layer.innerHTML) render(); }
};
async function shrinkImg(file,max=1000){ const url=URL.createObjectURL(file);
  try{ const img=await new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=url; }); const sc=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)), c=document.createElement("canvas");
    c.width=Math.round(img.naturalWidth*sc); c.height=Math.round(img.naturalHeight*sc); c.getContext("2d").drawImage(img,0,0,c.width,c.height); return await new Promise(r=>c.toBlob(r,"image/jpeg",.86)); }
  finally{ URL.revokeObjectURL(url); } }
document.addEventListener("change",async e=>{ const t=e.target; if(!t.classList||!t.classList.contains("ap-in")) return; let f=t.files&&t.files[0]; if(!f) return;
  const key=t.dataset.pk, cell=t.closest(".ap-cell");
  { const ar=cell&&cell.style.aspectRatio?cell.style.aspectRatio.split("/").map(Number):null, hero=document.querySelector(".me-hero");
    const cr=key.startsWith("cmav|")?{ratio:1,round:true,max:1080}:key.startsWith("cmbg|")?{ratio:hero?hero.clientWidth/Math.max(1,hero.clientHeight):CROP_PROF}:key.startsWith("vth|")?{ratio:16/9}:ar&&ar[0]?{ratio:ar.length>1&&ar[1]?ar[0]/ar[1]:ar[0]}:null;
    if(cr){ const c=await cropImg(f,cr); t.value=""; if(!c) return; f=c; } }
  if(cell) cell.classList.add("busy");
  try{ const b=await shrinkImg(f, key.startsWith("vc")||key.startsWith("vb")?1400:1000); if(!b) throw 0; await PIMG.put(key,b); if(key.startsWith("cmav|")) cmAvSync(key.slice(5),b); if(key.startsWith("vc|")) await aeCoverAuto(key); else toast("照片上傳好了"); }catch(err){ toast("這張照片讀不出來，換一張試試"); }
  if(layer.querySelector(".ae")) openAlbumEditor(ui.aeId); else if(layer.querySelector(".art-alb")) artAlbumsSheet(); else if(/^(cm(av|bg)|vth)\|/.test(key)) render(); });
/* ===== 自由轉：手指往哪拖就往哪轉，放開會順著慣性轉一下；正面、背面都看得到 ===== */
function spin3d(obj,host,{onTap,auto=false,rx=-6,ry=-18}={}){ let vx=0, vy=0, drag=null, raf=0, alive=true, idle=performance.now();
  const apply=()=>{ obj.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`; const r=ry*Math.PI/180, q=rx*Math.PI/180; obj.style.setProperty("--ang",(ry*1.5+rx)+"deg"); obj.style.setProperty("--mx",(50+Math.sin(r)*45)+"%"); obj.style.setProperty("--my",(45-Math.sin(q)*45)+"%"); };
  const loop=()=>{ if(!alive||!obj.isConnected){ alive=false; return; } if(!drag){ if(Math.abs(vx)+Math.abs(vy)>.03){ vx*=.95; vy*=.95; rx+=vx; ry+=vy; apply(); idle=performance.now(); } else if(auto&&performance.now()-idle>1800){ ry+=.25; apply(); } } raf=requestAnimationFrame(loop); };
  host.style.touchAction="none";
  host.addEventListener("pointerdown",e=>{ if(e.target.closest("button")) return; drag={x:e.clientX,y:e.clientY,mv:0}; vx=vy=0; try{ host.setPointerCapture(e.pointerId); }catch(_){} });
  host.addEventListener("pointermove",e=>{ if(!drag) return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y; drag.mv+=Math.abs(dx)+Math.abs(dy); drag.x=e.clientX; drag.y=e.clientY; ry+=dx*.55; rx-=dy*.45; vy=dx*.55; vx=-dy*.45; idle=performance.now(); apply(); });
  const up=()=>{ if(!drag) return; const tap=drag.mv<8; drag=null; idle=performance.now(); if(tap){ vx=vy=0; if(onTap) onTap(); } };
  host.addEventListener("pointerup",up); host.addEventListener("pointercancel",up);
  apply(); loop();
  return { flip(){ vx=0; vy=0; const from=ry, to=Math.round((ry+180)/180)*180, t0=performance.now(); (function f(now){ const k=Math.min(1,(now-t0)/600), e2=1-Math.pow(1-k,3); ry=from+(to-from)*e2; apply(); if(k<1) requestAnimationFrame(f); })(t0); idle=performance.now(); },
    face(){ const n=Math.round(ry/360)*360; rx=-6; ry=n-18; apply(); }, get:()=>({rx,ry}), stop(){ alive=false; cancelAnimationFrame(raf); } }; }

/* =========================================================
   專輯 v2：照真實的韓團專輯建出來
   ・一張專輯有好幾個版本；每個版本有自己的外型、長寬高（公分）、封面、封底、價格、預購期間
   ・每個版本有自己的「內容物」：隨機小卡、自拍卡、明信片…，每一項有尺寸、一張專輯放幾張、照片池（每張照片可以有背面、可以標成珠光）
   ・專輯外（不在專輯裡）：店家的預購特典、店家的 Lucky Draw 抽獎、簽售卡、打歌節目卡
   ・粉絲在 SHOP 選版本、選要買幾張 → 一張一張拆開；每一樣東西照真實比例拿出來，可以自由轉看正面和背面
   ・照片 key：封面 vc|專輯|版本、封底 vb|專輯|版本、照片正面 ph|專輯|照片|f、背面 ph|專輯|照片|b、某項內容物共用背面 ib|專輯|內容物
   ・粉絲擁有的東西 id：it|專輯|內容物|照片
   ========================================================= */
const SHAPES=[{k:"book",n:"大本寫真書",d:"像一本書，最常見",w:19,h:25,t:2.2},{k:"cd",n:"CD 盒",d:"方形盒子，CD 大小",w:14.2,h:12.5,t:1},{k:"small",n:"小本",d:"比手掌小一點的小書",w:12,h:17,t:1.2},
  {k:"cardbox",n:"卡片盒",d:"小小一盒，裡面主要是小卡",w:7.5,h:11,t:2},{k:"platform",n:"平台版",d:"沒有 CD，只有小卡和下載卡（數位單曲用）",w:6,h:9.2,t:.6},{k:"lp",n:"黑膠",d:"很大的正方形",w:31.5,h:31.5,t:.6},{k:"custom",n:"自己填",d:"照實際量的長寬高",w:15,h:20,t:1.5}];
const INC=[{k:"pc",n:"隨機小卡",w:5.5,h:8.5},{k:"selfie",n:"自拍卡",w:5.5,h:8.5},{k:"unit",n:"小分隊卡",w:5.5,h:8.5},{k:"polaroid",n:"拍立得",w:5.4,h:8.6},{k:"postcard",n:"明信片",w:10,h:15},{k:"id",n:"身分證卡",w:8.6,h:5.4},
  {k:"bookmark",n:"書籤",w:5,h:15},{k:"sticker",n:"貼紙",w:9,h:12},{k:"poster",n:"折疊海報",w:14.8,h:21},{k:"lyric",n:"歌詞紙",w:12,h:12},{k:"other",n:"其他",w:10,h:10}];
const EXR={pob:{n:"預購特典",d:"店家附送：預購期間在這家店買，一次購買只附 1 張（買再多張專輯也一樣），裝在店家的信封裡，不在專輯內；可以設定限量，送完為止",st:true},ld:{n:"Lucky Draw",d:"店家抽獎：在這家店買專輯（預購期間）就能抽，一次購買抽 1 次，抽中的人拿這張卡、代替預購特典；張數有限，抽完就沒了",st:true},fs:{n:"簽售卡",d:"參加簽售、簽好專輯時拿到，不在專輯內"},mc:{n:"公放卡",d:"打歌期間，每個節目每週最早幫這首歌投票的前三位（就像搶到公放席去節目現場）各拿 1 張，第四位之後沒有，不在專輯內"}};
/* 店家：每家店的預購特典、Lucky Draw 都不一樣（管理員可以新增、改名、刪除） */
const getStores=()=>S.get(K.stores,[]);
const storeOf=id=>getStores().find(x=>x.id===id);
const exName=it=>it&&it.rule&&EXR[it.rule]&&EXR[it.rule].st&&storeOf(it.store)?`${it.name}・${storeOf(it.store).name}`:(it?it.name:"");
const ldLeft=it=>Math.max(0,(it.cap||0)-((S.get(K.ldGiven,{}))[it.id]||0));
const storeEx=(a,sid)=>(a.ex||[]).filter(e=>e.store===sid&&storeOf(sid));
/* 三家店的個性：官方（穩定、沒有抽獎）／CLOVER（Lucky Draw 抽獎）／SIDE B（獨家特典、數量有限） */
function seedArtFan(){ if(S.get(K.seedArtFan,false)) return; S.set(K.seedArtFan,true); const e="artist@stardream.app";
  try{ localStorage.setItem(K.fanArtists+"@"+e,JSON.stringify(["muse"])); const d=S.get(K.selDone,{}); d[e]=true; S.set(K.selDone,d); }catch(err){} }
function seedPriv2(){ if(S.get(K.seedPriv2,false)) return; S.set(K.seedPriv2,true); const L=S.get(K.posts,[]);
  if(!L.some(p=>p.vis==="ms"&&p.media&&p.media.length)){ const t=L.find(p=>!p.vis&&p.member!=="luna"&&p.media&&p.media.length&&p.media[0].kind!=="video"); if(t){ t.vis="ms"; S.set(K.posts,L); } } }
function seedPriv(){ if(S.get(K.seedPriv,false)) return; S.set(K.seedPriv,true); const L=S.get(K.posts,[]); let a=0;
  L.forEach(p=>{ if(p.vis) return; if(a<2&&p.member!=="luna"&&p.color!=null){ p.vis="ms"; a++; } });
  const q=L.find(p=>p.member==="luna"&&!p.vis); if(q){ q.vis="pw"; q.pw="0321"; }
  const t=L.find(p=>p.member==="meng"&&!p.vis); if(t){ t.vis="ms"; }
  S.set(K.posts,L); }
function seedPhotos(){ if(S.get(K.seedPhotos2,false)) return; S.set(K.seedPhotos2,true); const L=S.get(K.posts,[]);
  L.forEach((p,i)=>{ if(p.media&&p.media.some(x=>String(x.mid).startsWith("demo_"))){ p.media=undefined; p.color=i%6; } }); S.set(K.posts,L); }
function seedStores2(){ if(S.get(K.seedStores2,false)) return; S.set(K.seedStores2,true);
  const L0=getStores(); L0.forEach(x=>{ if(x.id==="st_plat"&&x.name==="月台唱片") x.name="CLOVER"; if(x.id==="st_pocket"&&x.name==="口袋音樂") x.name="SIDE B"; }); S.set(K.stores,L0);
  const L=S.get(K.albums2,[]); L.forEach(a=>{ a.ex=(a.ex||[]).filter(e=>!(e.rule==="ld"&&e.store==="st_off")).map(e=>e.rule==="pob"&&e.store==="st_pocket"&&!e.cap?{...e,name:"獨家特典",cap:50}:e); }); S.set(K.albums2,L); }
function seedStores(){ if(S.get(K.seedStores,false)) return; S.set(K.seedStores,true);
  if(!getStores().length) S.set(K.stores,[{id:"st_off",name:"HAECHU SHOP"},{id:"st_plat",name:"CLOVER"},{id:"st_pocket",name:"SIDE B"}]);
  const L=S.get(K.albums2,[]); L.forEach(a=>{ const pool=(each,sp)=>groupArtists(a.gid).flatMap(mid=>Array.from({length:each},(_,i)=>({id:uid("p"),mid,sp:sp&&i===each-1})));
    a.ex=(a.ex||[]).map(e=>EXR[e.rule]&&EXR[e.rule].st&&!e.store?{...e,store:"st_off",...(e.rule==="ld"?{cap:30,odds:15}:{})}:e);
    const has=(r,st)=>a.ex.some(e=>e.rule===r&&e.store===st);
    if(!has("pob","st_plat")) a.ex.push({id:uid("i"),rule:"pob",store:"st_plat",k:"pc",name:"預購特典",w:5.5,h:8.5,pool:pool(1)});
    if(!has("ld","st_plat")) a.ex.push({id:uid("i"),rule:"ld",store:"st_plat",k:"pc",name:"Lucky Draw",w:5.5,h:8.5,cap:20,odds:10,pool:pool(1,true)});
    if(!has("pob","st_pocket")) a.ex.push({id:uid("i"),rule:"pob",store:"st_pocket",k:"pc",name:"預購特典",w:5.5,h:8.5,pool:pool(1)});
    if(!a.ex.some(e=>e.rule==="mc")) a.ex.push({id:uid("i"),rule:"mc",k:"pc",name:"公放卡",w:5.5,h:8.5,pool:pool(1)}); });
  S.set(K.albums2,L); }
const shapeOf=k=>SHAPES.find(x=>x.k===k)||SHAPES[5], incOf=k=>INC.find(x=>x.k===k)||INC[10];
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
/* 11/18：下架的專輯記在 daisuki_alb_del（大家共用），同步回來的舊資料也不會再冒出來 */
const ALB_DEL="daisuki_alb_del", albGone=a=>!!((S.get(ALB_DEL,{})||{})[a.id]);
const getAlbums=()=>cbDemo()?[...cbDemoAlbs(),...S.get(K.albums2,[]).filter(a=>groupOf(a.gid)&&!albGone(a))]:S.get(K.albums2,[]).filter(a=>groupOf(a.gid)&&!albGone(a)&&(typeof albumOn!=="function"||route().role==="admin"||albumOn(a))).map(a=>{ (a.ex||[]).forEach(e=>{ if(e.rule==="mc"&&e.name==="打歌節目卡") e.name="公放卡"; }); return a; }).sort((a,b)=>b.ts-a.ts);
const albumOf=id=>String(id).startsWith("demo_")?cbDemoAlbs().find(a=>a.id===id):String(id).startsWith("mc_")?mcAlb(String(id).slice(3)):S.get(K.albums2,[]).find(a=>a.id===id);
/* 11/17 預設公放卡：這個團的專輯裡沒有設定「公放卡」時，投票照樣拿得到一張（每位成員一款，卡面用成員的照片或顏色）。
   不是商品：不會出現在 SHOP、後台專輯清單；只在卡冊裡（有拿到才出現） */
/* 公放卡是必放：每位成員的正面都傳了才算好（雲端有、或這支手機剛傳） */
function mcDone(gid){ const a=mcAlb(gid); if(!a) return true; const M=S.get(ALBU,{})||{}; return a.ex[0].pool.every(p=>{ const k=`ph|mc_${gid}|${p.id}|f`; return !!(M[k]||PCI[k]); }); }
function mcAlb(gid){ const g=groupOf(gid); if(!g) return null; const ms=(grpMembers(gid)||[]).filter(m=>MEMBERS[m]);
  return {id:"mc_"+gid,gid,title:"公放卡",ord:"打歌節目",sys:1,ts:0,vers:[],ex:[{id:"mc",rule:"mc",name:"公放卡",w:5.5,h:8.5,pool:(ms.length?ms:[""]).map(m=>({id:m||"g",mid:m}))}]}; }
/* 11/17 卡冊預覽用的假資料（只有 HUSSEY 打開「預覽全部卡片」時才有）：每個團一張示範專輯，卡面、卡背、封面都是當場用畫布畫的，不存、不上傳 */
const cbDemo=()=>!!ui.cbPrev&&typeof isHussey==="function"&&isHussey();
let CB_DEMO=null;
function cbDemoAlbs(){ if(CB_DEMO) return CB_DEMO; const out=[];
  GROUPS.slice(0,3).forEach((g,gi)=>{ const ms=(grpMembers(g.id)||[]).filter(m=>MEMBERS[m]).slice(0,5), who=ms.length?ms:[""], aid="demo_"+g.id, pool=[], pob=[];
    who.forEach((m,mi)=>{ for(let k=0;k<3;k++){ const pid=`p${mi}_${k}`; pool.push({id:pid,mid:m,sp:k===2?1:0}); cbDemoArt(aid,pid,m?artName(m,"feed"):g.name,MEMBERS[m]?MEMBERS[m].g:g.g,k,g.name); } pob.push({id:`b${mi}`,mid:m}); cbDemoArt(aid,`b${mi}`,m?artName(m,"feed"):g.name,MEMBERS[m]?MEMBERS[m].g:g.g,3,g.name); });
    out.push({id:aid,gid:g.id,title:"示範專輯",ord:"Preview",ts:Date.now()-gi,demo:1,vers:[{id:"v1",name:"Photobook Ver.",shape:"book",w:19,h:25,t:2.2,pts:0,preEnd:0,inc:[{id:"i1",k:"pc",name:"隨機小卡",w:5.5,h:8.5,n:1,pool}]}],ex:[{id:"x1",rule:"pob",name:"預購特典",w:5.5,h:8.5,pool:pob}]});
    cbDemoCover(aid,g.name,g.g); });
  return CB_DEMO=out; }
function cbDemoArt(aid,pid,name,gi,kind,gname){ const C=GRADS[(gi||0)%GRADS.length], W=440, H=680;
  const draw=back=>{ const c=document.createElement("canvas"); c.width=W; c.height=H; const x=c.getContext("2d"), gr=x.createLinearGradient(0,0,W,H); gr.addColorStop(0,back?"#2A1B4A":C[0]); gr.addColorStop(1,back?"#5B3FA0":C[1]); x.fillStyle=gr; x.fillRect(0,0,W,H);
    if(back){ x.fillStyle="rgba(255,255,255,.08)"; for(let yy=40;yy<H;yy+=70) for(let xx=(yy/70%2)*45;xx<W;xx+=90){ x.font="600 18px sans-serif"; x.fillText("HAECHU",xx,yy); } x.fillStyle="#fff"; x.font="700 34px sans-serif"; x.textAlign="center"; x.fillText(gname,W/2,H/2-6); x.font="500 20px sans-serif"; x.fillStyle="rgba(255,255,255,.75)"; x.fillText(name,W/2,H/2+30); return c.toDataURL("image/jpeg",.85); }
    for(let i=0;i<14;i++){ x.fillStyle=`rgba(255,255,255,${.05+.1*((i*37)%7)/7})`; x.beginPath(); x.arc((i*97)%W,(i*151)%H,18+(i*13)%46,0,7); x.fill(); }
    const cx=W/2, cy=H*.42+(kind===1?20:0);   /* 剪影：頭＋肩，三種姿勢稍微不一樣 */
    x.fillStyle="rgba(255,255,255,.32)"; x.beginPath(); x.arc(cx+(kind-1)*18,cy-70,70,0,7); x.fill(); x.beginPath(); x.ellipse(cx,cy+130,150,120,0,Math.PI,0); x.fill();
    const sh=x.createLinearGradient(0,H*.6,0,H); sh.addColorStop(0,"rgba(0,0,0,0)"); sh.addColorStop(1,"rgba(0,0,0,.35)"); x.fillStyle=sh; x.fillRect(0,H*.6,W,H*.4);
    x.fillStyle="#fff"; x.textAlign="left"; x.font="800 44px sans-serif"; x.fillText(name,28,H-64); x.font="500 18px sans-serif"; x.fillStyle="rgba(255,255,255,.8)"; x.fillText(["DAILY","STAGE","SHINE","POB"][kind]+" · 示範卡",30,H-34);
    x.font="600 16px sans-serif"; x.fillText("HAECHU",28,40); return c.toDataURL("image/jpeg",.85); };
  PCI[`ph|${aid}|${pid}|f`]=draw(false); PCI[`ph|${aid}|${pid}|b`]=draw(true); }
function cbDemoCover(aid,gname,gi){ const C=GRADS[(gi||0)%GRADS.length], c=document.createElement("canvas"); c.width=760; c.height=1000; const x=c.getContext("2d"), gr=x.createLinearGradient(0,0,760,1000); gr.addColorStop(0,C[0]); gr.addColorStop(1,C[1]); x.fillStyle=gr; x.fillRect(0,0,760,1000);
  x.fillStyle="rgba(255,255,255,.9)"; x.font="800 96px sans-serif"; x.textAlign="center"; x.fillText(gname,380,520); x.font="500 34px sans-serif"; x.fillText("The Preview Album",380,580); PCI[`vc|${aid}|v1`]=c.toDataURL("image/jpeg",.85); }
const saveAlbum=a=>{ const L=S.get(K.albums2,[]), i=L.findIndex(x=>x.id===a.id); if(i>=0) L[i]=a; else L.push(a); S.set(K.albums2,L); };
const verOf=(a,vid)=>(a.vers||[]).find(v=>v.id===vid);
const itemOf=(a,iid)=>{ for(const v of a.vers||[]){ const it=v.inc.find(x=>x.id===iid); if(it) return {it,v}; } const e=(a.ex||[]).find(x=>x.id===iid); return e?{it:e,v:null}:null; };
const photoOf=(it,pid)=>(it.pool||[]).find(p=>p.id===pid);
const vPre=v=>Date.now()<(v.preEnd||0);

/* 抽：珠光照片比較難抽到（權重 1/4）；照片夠多時一張專輯裡不重複 */
function drawFrom(it,n){ const P=[...(it.pool||[])], out=[]; for(let k=0;k<n&&P.length;k++){ const tot=P.reduce((s,p)=>s+(p.sp?.25:1),0); let r=Math.random()*tot, i=0; for(;i<P.length;i++){ r-=P[i].sp?.25:1; if(r<=0) break; } i=Math.min(i,P.length-1); out.push(P[i]); if(P.length>1) P.splice(i,1); } return out; }
function giveItem(ids){ const own=getCards(), meta=cardMeta(), fresh=[]; ids.forEach((c,i)=>{ if(!own[c]){ fresh.push(i); meta[c]={ts:Date.now(),no:1+(Math.random()*9999|0)}; } own[c]=(own[c]||0)+1; }); S.set(K.cards,own); S.set(K.cardMeta,meta); setTimeout(serialSync,300); return fresh; }
function buyAlbumV(aid,vid,qty,sid){ const a=albumOf(aid), v=a&&verOf(a,vid); if(!v) return {err:"找不到這個版本"}; qty=Math.max(1,Math.min(20,qty|0)); const cost=v.pts*qty; if(points()<cost) return {err:`積分不夠，${qty} 張要 ${fmt(cost)} 積分`};
  if(!storeOf(sid)) sid=(getStores()[0]||{}).id;
  const g=groupOf(a.gid), stn=storeOf(sid)?storeOf(sid).name:""; S.set(K.points,points()-cost); recordSale("album",{gid:a.gid,pts:cost,label:`${g.name}《${a.title}》${v.name} ×${qty}${stn?"（"+stn+"）":""}`});
  const cnt=S.get(K.albBuy,{}), opens=[], ldG=S.get(K.ldGiven,{}), exs=storeEx(a,sid), pob=exs.filter(e=>e.rule==="pob"), ld=exs.filter(e=>e.rule==="ld");
  for(let q=0;q<qty;q++){ const got=[], extra=[]; let ldTry=false, ldWin=false; v.inc.forEach(it=>drawFrom(it,it.n||1).forEach(p=>got.push(`it|${aid}|${it.id}|${p.id}`)));
    // 專輯外：店家附送（預購特典），或抽中 Lucky Draw（代替預購特典）
    if(vPre(v)&&q===0){ ld.forEach(e=>{ if((e.cap||0)-(ldG[e.id]||0)<=0||ldWin) return; ldTry=true; if(Math.random()*100<(e.odds||10)){ const p=drawFrom(e,1)[0]; if(p){ ldWin=true; ldG[e.id]=(ldG[e.id]||0)+1; extra.push(`it|${aid}|${e.id}|${p.id}`); } } });
      if(!ldWin) pob.forEach(e=>{ if(e.cap&&(e.cap-(ldG[e.id]||0))<=0) return; drawFrom(e,1).forEach(p=>{ extra.push(`it|${aid}|${e.id}|${p.id}`); if(e.cap) ldG[e.id]=(ldG[e.id]||0)+1; }); }); }
    cnt[aid]=(cnt[aid]||0)+1; opens.push({got,extra,fresh:giveItem(got),xfresh:giveItem(extra),n:cnt[aid],ldTry,ldWin}); }
  S.set(K.albBuy,cnt); S.set(K.ldGiven,ldG); const o=S.get(K.owned,{}); o[a.gid]={...(o[a.gid]||{}),album:Date.now()}; S.set(K.owned,o);
  const log=S.get(K.gachaLog,[]); opens.forEach(x=>log.unshift({ts:Date.now(),aid,vid,sid,cards:x.got,extra:x.extra})); S.set(K.gachaLog,log.slice(0,50));
  logSelf("core",null,`你在${stn||"SHOP"}買了 ${g.name}《${a.title}》${v.name} ${qty} 張`);
  return {aid,vid,sid,opens}; }
/* 打歌節目卡：在某個節目幫某團的歌投票，那週那個節目拿 1 張 */
function giveMcCard(gid,showId,k0){ const wk=curWeek(), key=k0||`${wk}|${showId}|${gid}`, got=S.get(K.mcGot,{}); if(got[key]) return null;
  const a=getAlbums().find(x=>x.gid===gid&&(x.ex||[]).some(e=>e.rule==="mc"&&(e.pool||[]).length))||mcAlb(gid); if(!a) return null; const e=a.ex.find(x=>x.rule==="mc"&&(x.pool||[]).length), p=drawFrom(e,1)[0]; if(!p) return null;
  got[key]=Date.now(); S.set(K.mcGot,got); const cid=`it|${a.id}|${e.id}|${p.id}`; giveItem([cid]); return cid; }
function giveFsCard(gid,mid){ const a=getAlbums().find(x=>x.gid===gid&&(x.ex||[]).some(e=>e.rule==="fs")); if(!a) return; const e=a.ex.find(x=>x.rule==="fs"); const ps=e.pool.filter(p=>p.mid===mid); const p=(ps.length?ps:e.pool)[0]; if(p) giveItem([`it|${a.id}|${e.id}|${p.id}`]); }
const alCount=()=>{ const f=followed(), own=getCards(); let have=0, total=0; getAlbums().filter(a=>f.includes(a.gid)).forEach(a=>[...a.vers.flatMap(v=>v.inc),...(a.ex||[])].forEach(it=>(it.pool||[]).forEach(p=>{ total++; if(own[`it|${a.id}|${it.id}|${p.id}`]) have++; }))); return {have,total}; };
const parseIt=cid=>{ const [,aid,iid,pid]=String(cid).split("|"), a=albumOf(aid); if(!a) return null; const r=itemOf(a,iid); if(!r) return null; const p=photoOf(r.it,pid); return p?{a,it:r.it,v:r.v,p}:null; };
/* 一樣東西的正面／背面（沒上傳照片時用成員的顏色做示意） */
function itemFace(cid,{big=false}={}){ const o=parseIt(cid); if(!o) return ""; const {a,it,p}=o, g=groupOf(a.gid), m=MEMBERS[p.mid], C=GRADS[(m?m.g:g.g)%GRADS.length], img=PCI[`ph|${a.id}|${p.id}|f`];
  return `<div class="itf ${p.sp?"sp":""} ${big?"big":""} k-${it.k}" style="--c1:${C[0]};--c2:${C[1]}">${img?`<img src="${img}" alt="">`:`<div class="itf-ph"><i>${esc(m?ini(m.name):ini(g.name))}</i><b>${esc(m?m.name:g.name)}</b><small>${esc(it.name)}</small></div>`}<span class="apc-gl"></span>${fxSpan(p)}</div>`; }
/* 11/18 貴卡：藝人決定專輯小卡哪幾張是貴卡（比較難抽到）、要不要特效；特典卡（店家）由管理員決定。特效：珠光（pearl）／流光（holo）／無 */
const fxOf=p=>p&&p.sp?(p.fx||"pearl"):"";
const fxSpan=p=>{ const f=fxOf(p); return f==="pearl"?'<span class="apc-rim"></span>':f==="holo"?'<span class="apc-holo"></span>':""; };
const FX_N={pearl:"珠光",holo:"流光",none:"無特效"};
function itemBack(cid){ const o=parseIt(cid); if(!o) return ""; const {a,it,p}=o, g=groupOf(a.gid), img=PCI[`ph|${a.id}|${p.id}|b`]||PCI[`ib|${a.id}|${it.id}`];
  return img?`<div class="itb img ${p.sp?"sp":""}"><img src="${img}" alt="">${fxSpan(p)}</div>`:`<div class="itb ${p.sp?"sp":""}" style="background:${grad(g.g)}"><b>${esc(g.name)}</b><small>${esc(a.title)}</small>${fxSpan(p)}</div>`; }
const itemDims=(it,scale)=>`width:${(it.w*scale).toFixed(1)}px;height:${(it.h*scale).toFixed(1)}px;--rad:${Math.max(3,.35*scale).toFixed(1)}px`;
function item3d(cid,maxPx){ const o=parseIt(cid); if(!o) return ""; const sc=Math.min(maxPx/o.it.w,maxPx*1.45/o.it.h); return `<div class="s3-obj s3-it" style="${itemDims(o.it,sc)}"><div class="s3-f">${itemFace(cid,{big:true})}</div><div class="s3-b">${itemBack(cid)}</div><div class="s3-edge"></div></div>`; }
const itemName=cid=>{ const o=parseIt(cid); if(!o) return ""; const m=MEMBERS[o.p.mid]; return `${m?m.name+"・":""}${exName(o.it)}${o.p.sp?" ✦":""}`; };
/* 專輯盒：照長寬高（公分）做成立體盒；封面、封底用管理員的圖 */
function albumBox(a,v,{id="",maxPx=200}={}){ const g=groupOf(a.gid), C=GRADS[g.g%GRADS.length], sc=maxPx/Math.max(v.w,v.h), W=v.w*sc, H=v.h*sc, Dp=Math.max(4,v.t*sc), cov=PCI[`vc|${a.id}|${v.id}`], bk=PCI[`vb|${a.id}|${v.id}`], sp=v.spine||C[0];
  const cover=cov?`<div class="ab-cov img"><img src="${cov}" alt=""></div>`:`<div class="ab-cov" style="background:linear-gradient(135deg,${C[0]},${C[1]})"><small>${esc(a.ord)}</small><b>${esc(g.name)}</b><em>${esc(a.title)}</em><span>${esc(v.name)}</span></div>`;
  const trk=[a.title,"Intro","Midnight Call","Every Moment","Outro"];
  const back=bk?`<img src="${bk}" alt="">`:`<div class="ab-bkc" style="background:linear-gradient(135deg,${C[1]},${C[0]})"><b>${esc(g.name)}</b><small>${esc(a.ord)}・${esc(v.name)}</small><ol>${trk.map((t,i)=>`<li>${i===0?"<em>TITLE</em> ":""}${esc(t)}</li>`).join("")}</ol><span class="ab-bar"></span></div>`;
  return `<div class="ab-box" ${id?`id="${id}"`:""} style="--w:${W.toFixed(1)}px;--h:${H.toFixed(1)}px;--d:${Dp.toFixed(1)}px;--c1:${C[0]};--c2:${C[1]};--sp:${sp}">
    <div class="ab-f ab-in"><div class="ab-tray"></div></div>
    <div class="ab-f ab-cover"><div class="ab-cf">${cover}<span class="ab-wrap"></span></div><div class="ab-cb"></div></div>
    <div class="ab-f ab-bk">${back}</div><div class="ab-f ab-r"></div><div class="ab-f ab-l"><b>${esc(g.name)}・${esc(a.title)}・${esc(v.name)}</b></div><div class="ab-f ab-t"></div><div class="ab-f ab-b"></div></div>`; }
/* ===== 拆專輯：可以一次買很多張，一張一張拆 ===== */
function abStart(r,idx=0){ cancelAnimationFrame(gcRaf); const a=albumOf(r.aid), v=verOf(a,r.vid); if(ui.ab&&ui.ab.spin) ui.ab.spin.stop(); ui.ab={r,idx,open:false,flipped:0}; const N=r.opens.length;
  setLayer(`<div class="ab-w" id="abW" role="dialog" aria-label="拆專輯"><canvas id="gcCv"></canvas>
    <div class="gc-tb">${N>1?`<span class="ab-cnt">${idx+1} / ${N}</span>`:""}<button class="gc-ib" data-a="gdSnd" aria-label="音效開關">${sfxOn()?"🔊":"🔈"}</button><button class="gc-ib gc-skip" data-a="abSkip">${N>1?"全部拆開 ››":"跳過 ››"}</button></div>
    <div class="ab-stage"><div class="ab-scene" id="abSc">${albumBox(a,v,{id:"abBox",maxPx:Math.min(230,innerWidth*.55)})}</div><div class="ab-cards" id="abCards"></div></div><div class="ab-xs" id="abXs"></div>
    <p class="ab-hint" id="abHint">拖動專輯轉一轉，看看封面和封底<br><small>點一下專輯，拆開它</small></p><div class="ab-foot" id="abFoot"></div></div>`,"ab"+Date.now());
  gcBg(); ui.ab.spin=spin3d(document.getElementById("abBox"),document.getElementById("abSc"),{auto:true,rx:-12,ry:-28,onTap:()=>abOpen()}); C3.upAlbum(document.getElementById("abSc"),a,v,ui.ab,()=>abOpen());
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) abOpen(true); }
function abOpen(fast){ const st=ui.ab; if(!st||st.open) return; st.open=true; const w=document.getElementById("abW"); if(!w) return; sfx("whoosh");
  const box=document.getElementById("abBox"); if(st.gl) st.gl.open(); else if(st.spin){ const {ry}=st.spin.get(); st.spin.stop(); const n=Math.round(ry/360)*360; box.style.transition="none"; box.style.transform=`rotateX(-12deg) rotateY(${ry}deg)`; void box.offsetWidth; box.style.transition="transform .7s ease"; box.style.transform=`rotateX(6deg) rotateY(${n-6}deg)`; }
  w.classList.add("opening"); document.getElementById("abHint").textContent=""; const T=fast?0:1;
  setTimeout(()=>{ if(ui.ab===st) gcBurst(innerWidth/2,innerHeight*.42,1,50,6); },800*T);
  setTimeout(()=>{ if(ui.ab!==st) return; w.classList.add("cards"); abDeal(); },1500*T); }
function abDeal(){ const st=ui.ab, o=st.r.opens[st.idx], box=document.getElementById("abCards"); if(!box) return;
  const L=o.got.map(parseIt), gap=10, availW=innerWidth*.9, availH=innerHeight*.36, sumW=L.reduce((s,x)=>s+(x?x.it.w:0),0), maxH=Math.max(...L.map(x=>x?x.it.h:1));
  const sc=Math.max(6,Math.min((availW-gap*(L.length-1))/sumW, availH/maxH, 26));   // 每公分幾 px：所有東西用同一個比例，大小關係跟真的一樣
  box.innerHTML=o.got.map((c,i)=>{ const x=L[i]; if(!x) return ""; const nw=o.fresh.includes(i);
    return `<button class="ab-card ${x.p.sp?"sp":""}" style="--i:${i};${itemDims(x.it,sc)}" data-a="abFlip" data-v="${i}"><span class="ab-ci"><span class="ab-cbk">${itemBack(c)}</span><span class="ab-cfr">${itemFace(c)}${nw?'<em class="gd-new">NEW</em>':""}</span></span><small class="ab-lb">${esc(x.it.name)}</small></button>`; }).join("");
  document.getElementById("abHint").textContent=o.got.length>1?`裡面有 ${o.got.length} 樣東西，點一下翻開`:"點一下翻開"; sfx("flip"); }
function abFlip(i){ const st=ui.ab; if(!st) return; const el=document.querySelector(`.ab-card[data-v="${i}"]`); if(!el) return; if(el.classList.contains("on")){ abView(i); return; }
  el.classList.add("on"); st.flipped++; const sp=el.classList.contains("sp"); sfx(sp?"t3":"flip"); if(sp){ const b=el.getBoundingClientRect(); setTimeout(()=>gcBurst(b.left+b.width/2,b.top+b.height/2,3,90,9),250); }
  if(st.flipped>=st.r.opens[st.idx].got.length) abDone(); }
function abView(i){ const st=ui.ab, cid=st.r.opens[st.idx].got[i], w=document.getElementById("abW"); if(!w||!cid) return;
  const v=document.createElement("div"); v.className="s3v"; v.innerHTML=`<button class="ph-x" data-a="s3Close" aria-label="關閉">${XI}</button><div class="s3">${item3d(cid,Math.min(260,innerWidth*.62))}</div>
    <p class="s3-l">${esc(itemName(cid))}</p><div class="s3-btns"><button class="btn btn-soft btn-sm" data-a="s3Flip">翻面</button></div><small class="s3-tip">手指拖動，往哪轉都可以</small>`;
  w.appendChild(v); ui.s3=spin3d(v.querySelector(".s3-obj"),v.querySelector(".s3"),{rx:-4,ry:-200}); setTimeout(()=>{ if(ui.s3) ui.s3.flip(); },120); C3.upItem(v.querySelector(".s3"),cid,Math.min(260,innerWidth*.62)); }
function abDone(){ const st=ui.ab, r=st.r, o=r.opens[st.idx], a=albumOf(r.aid), v=verOf(a,r.vid), nw=o.fresh.length, sp=o.got.filter(c=>{ const x=parseIt(c); return x&&x.p.sp; }).length, more=st.idx+1<r.opens.length;
  const xs=o.extra||[], stn=storeOf(r.sid)?storeOf(r.sid).name:"店家";
  document.getElementById("abHint").innerHTML=`${nw?`新的 ${nw} 樣`:"都是收過的，張數 +1"}${sp?`・珠光 ${sp} 張`:""}${!xs.length&&o.ldTry?"・這張沒抽中 Lucky Draw":""}<br><small>點東西可以拿到眼前轉著看</small>`;
  const xb=document.getElementById("abXs"); if(xb&&xs.length) xb.innerHTML=`<button class="ab-env" data-a="abEnv"><span class="ab-env-i" aria-hidden="true"></span><span><b>${esc(stn)} 的信封</b><small>店家附送・不在專輯裡・點一下打開</small></span></button>`;
  document.getElementById("abFoot").innerHTML=more?`<button class="btn btn-soft" data-a="abClose">先收起來</button><button class="btn btn-main" data-a="abNext">拆下一張（${st.idx+2} / ${r.opens.length}）</button>`
    :`<button class="btn btn-soft" data-a="abAgain">再買一張・${fmt(v.pts)} 積分</button><button class="btn btn-main" data-a="abClose">收進卡冊</button>`; }
function abEnv(){ const st=ui.ab; if(!st) return; const o=st.r.opens[st.idx], xb=document.getElementById("abXs"); if(!xb) return; sfx(o.ldWin?"t3":"flip");
  xb.innerHTML=`<div class="ab-xh">${o.ldWin?"✨ 抽中 Lucky Draw！":esc((parseIt(o.extra[0])||{it:{name:"預購特典"}}).it.name)}</div><div class="ab-xr">${(o.extra||[]).map((c,i)=>{ const x=parseIt(c); return x?`<button class="ab-xc ${x.p.sp?"sp":""}" data-a="abSumV" data-v="${c}" style="aspect-ratio:${x.it.w}/${x.it.h}">${itemFace(c)}${(o.xfresh||[]).includes(i)?'<em class="gd-new">NEW</em>':""}</button>`:""; }).join("")}</div>`;
  if(o.ldWin){ const b=xb.getBoundingClientRect(); gcBurst(b.left+b.width/2,b.top+b.height/2,3,90,9); } }
function abSkip(){ const st=ui.ab; if(!st) return; const r=st.r; if(r.opens.length>1){ abSummary(); return; } if(!st.open) abOpen(true);
  setTimeout(()=>{ if(ui.ab!==st) return; if(!document.querySelector(".ab-card")){ document.getElementById("abW").classList.add("cards"); abDeal(); } document.querySelectorAll(".ab-card:not(.on)").forEach(el=>abFlip(+el.dataset.v)); },60); }
function abSummary(){ const st=ui.ab, r=st.r, all=r.opens.flatMap(o=>o.got.map((c,i)=>({c,nw:o.fresh.includes(i)}))), xs=r.opens.flatMap(o=>(o.extra||[]).map((c,i)=>({c,nw:(o.xfresh||[]).includes(i)}))), ldw=r.opens.filter(o=>o.ldWin).length; if(st.spin) st.spin.stop();
  const w=document.getElementById("abW"); w.classList.add("opening","cards","sum"); const xb=document.getElementById("abXs"); if(xb) xb.innerHTML="";
  const cell=({c,nw})=>{ const x=parseIt(c); return x?`<button class="ab-sc ${x.p.sp?"sp":""}" data-a="abSumV" data-v="${c}" style="aspect-ratio:${x.it.w}/${x.it.h}">${itemFace(c)}${nw?'<em class="gd-new">NEW</em>':""}</button>`:""; };
  document.getElementById("abCards").innerHTML=`<div class="ab-sumw"><div class="ab-xh">專輯裡的東西</div><div class="ab-sumg">${all.map(cell).join("")}</div>${xs.length?`<div class="ab-xh">${esc(storeOf(r.sid)?storeOf(r.sid).name:"店家")} 附送・不在專輯裡${ldw?`・✨ Lucky Draw ${ldw} 張`:""}</div><div class="ab-sumg">${xs.map(cell).join("")}</div>`:""}</div>`;
  document.getElementById("abHint").innerHTML=`${r.opens.length} 張專輯全部拆開了・共 ${all.length+xs.length} 樣・新的 ${all.filter(x=>x.nw).length+xs.filter(x=>x.nw).length} 樣`;
  document.getElementById("abFoot").innerHTML=`<button class="btn btn-main btn-block" data-a="abClose">收進卡冊</button>`; }
/* 卡冊、自由轉看單一樣東西 */
function openItemView(cid){ const o=parseIt(cid); if(!o) return; const own=getCards(), real=own[cid]||0, pv=!real&&(!!ui.cbPrev&&isHussey()||ui.itPv===cid), n=real||(pv?1:0), mt=cardMeta()[cid]||{}, g=groupOf(o.a.gid);
  setLayer(`<div class="ph-view cv s3view" role="dialog" aria-label="收藏"><button class="ph-x" data-a="${ui.itPv===cid?"artAlb":"tCloseLayer"}" aria-label="關閉">${XI}</button>
    <div class="s3">${item3d(cid,Math.min(250,innerWidth*.6))}</div>
    <div class="cv-info"><span class="cv-tag ${o.p.sp?"t3":"t1"}">${esc(o.it.name)}${o.p.sp?` ✦ 貴卡${fxOf(o.p)!=="none"?"・"+FX_N[fxOf(o.p)]:""}`:""}</span><b>${esc(MEMBERS[o.p.mid]?MEMBERS[o.p.mid].name:g.name)}</b>
      <small>${esc(g.name)}《${esc(o.a.title)}》${o.v?"・"+esc(o.v.name):""}${pv?"":serTxt(cid,ui.cvSid)}</small><small>${o.it.w} × ${o.it.h} 公分${pv?"・預覽":ui.cvSid?"":n?`・擁有 ${n} 張`:"・還沒收集到"}</small></div>
    <div class="cv-btns"></div>
    <small class="cv-tip">手指拖動，往哪轉都可以</small></div>`,"cardview");
  if(ui.s3) ui.s3.stop(); ui.s3=spin3d(layer.querySelector(".s3-obj"),layer.querySelector(".s3"),{rx:-6,ry:-18}); C3.upItem(layer.querySelector(".s3"),cid,Math.min(250,innerWidth*.6)); ui.cvSid=""; }
/* 11/17 卡冊預覽：只有 HUSSEY 的帳號（粉絲端）看得到「預覽全部卡片」，把每張專輯的每張卡都當成有，用來看卡冊長怎樣；不存、不算數 */
const isHussey=()=>{ try{ const s=session()||{}, a=ACCOUNTS[s.email]||{}, m=MEMBERS[a.member||s.home||""]||{}; return String(a.name||"").toUpperCase()==="HUSSEY"||String(m.name||"").toUpperCase()==="HUSSEY"; }catch(e){ return false; } };
function viewCards(){ const prev=!!ui.cbPrev&&isHussey();
  const own=prev?(()=>{ const o={...getCards()}; getAlbums().forEach(a=>a.vers.forEach(v=>(v.inc||[]).forEach(it=>(it.pool||[]).forEach(p=>{ const c=`it|${a.id}|${it.id}|${p.id}`; if(!o[c]) o[c]=1; })))); (getAlbums()).forEach(a=>(a.ex||[]).forEach(it=>(it.pool||[]).forEach(p=>{ const c=`it|${a.id}|${it.id}|${p.id}`; if(!o[c]) o[c]=1; }))); return o; })():getCards(), f=followed(), al=[...getAlbums().filter(a=>cbHasCards(a)&&(prev||f.includes(a.gid)||Object.keys(own).some(c=>c.startsWith(`it|${a.id}|`)))),...GROUPS.map(g=>Object.keys(own).some(c=>c.startsWith(`it|mc_${g.id}|`))?mcAlb(g.id):null).filter(Boolean)], tb=ui.cbTab||"book", {have,total}=alCount();
  const grid=(a,it)=>`<div class="cb-kr"><span class="cb-kn">${esc(exName(it))}<small>${it.w} × ${it.h} cm</small></span><div class="cb-ig" style="--cw:${it.w>it.h?120:it.w>7?96:72}px">${(it.pool||[]).map(p=>{ const cid=`it|${a.id}|${it.id}|${p.id}`, n=own[cid], m=MEMBERS[p.mid];
      if(n){ /* 11/18 每一張卡分開放（各有自己的序號），點哪張就看哪張 */ const cs=prev?[]:(getSerials()[cid]||[]).slice().sort((x,y)=>(x.n||1e9)-(y.n||1e9)); return Array.from({length:n},(_,i)=>cs[i]||null).map(c=>`<button class="cb-it" data-a="cardView" data-v="${cid}" data-s="${c?c.id:""}" style="aspect-ratio:${it.w}/${it.h}">${itemFace(cid)}</button>`).join(""); } return `<div class="cb-it none ${p.sp?"sp":""}" style="aspect-ratio:${it.w}/${it.h}"><span>?</span><small>${esc(m?m.name:"")}${p.sp?" ✦":""}</small></div>`; }).join("")}</div></div>`;
  const book=(prev?"":lotBanner())+(al.length?al.map(a=>{ const g=groupOf(a.gid), C=GRADS[g.g%GRADS.length];
    return `<section class="cb-al"><div class="cb-alh"><span class="cb-alc" style="background:linear-gradient(135deg,${C[0]},${C[1]})">${PCI[`vc|${a.id}|${a.vers[0]&&a.vers[0].id}`]?`<img src="${PCI[`vc|${a.id}|${a.vers[0].id}`]}" alt="">`:esc(ini(g.name))}</span><span><b>${esc(a.title)}</b><small>${esc(g.name)}・${esc(a.ord)}</small></span></div>
      ${a.vers.filter(v=>(v.inc||[]).some(it=>(it.pool||[]).length)).map(v=>`<div class="cb-vh">${esc(v.name)}${vPre(v)?'<em class="cb-pre">預購中</em>':""}</div>${v.inc.filter(it=>(it.pool||[]).length).map(it=>grid(a,it)).join("")}`).join("")}
      ${(a.ex||[]).filter(e=>!EXR[e.rule]||!EXR[e.rule].st||storeOf(e.store)).length?`<div class="cb-vh">專輯外（店家特典・簽售・打歌節目）</div>${a.ex.filter(e=>!EXR[e.rule]||!EXR[e.rule].st||storeOf(e.store)).map(it=>grid(a,it)).join("")}`:""}</section>`; }).join(""):(!f.length?`<div class="cb-none"><b>還沒有加入社群</b><p>先到「探索」找喜歡的藝人，加入社群後，他們發行的專輯小卡會收在這裡。</p><button class="btn btn-main" data-a="goExplore">去探索</button></div>`
      :`<div class="cb-none"><b>目前還沒有專輯可以收集</b><button class="btn btn-main" data-a="goAlbums">去 SHOP 看看</button></div>`));
  return coreHead("卡冊")+`<main class="page cards">${isHussey()?`<button class="cb-prev ${prev?"on":""}" data-a="cbPrev">${prev?"結束預覽":"預覽全部卡片"}</button>`:""}
    <div class="seg2 cb-tabs" style="--i:${tb==="log"?1:0}"><i class="seg2-ind"></i><button class="${tb==="book"?"on":""}" data-a="cbTab" data-v="book">卡冊</button><button class="${tb==="log"?"on":""}" data-a="cbTab" data-v="log">開箱紀錄</button></div>
    <div class="seg2-pane ${ui.segAnim||""}">${tb==="log"?cbLog():book}</div></main>`; }
/* 11/18：卡冊只放真的有小卡可以收的專輯（單曲出道只放了公放卡、或專輯還沒放卡片，就不出現空的專輯） */
const cbHasCards=a=>!!a&&[...(a.vers||[]).flatMap(v=>v.inc||[]),...(a.ex||[])].some(it=>(it.pool||[]).length);
function cbLog(){ const log=S.get(K.gachaLog,[]).filter(x=>x.vid&&albumOf(x.aid)); if(!log.length) return `<div class="cb-empty"><b>還沒有開過專輯</b><p>在 SHOP 買專輯，拆開拿到的小卡會收進卡冊。</p><button class="btn btn-main btn-sm" data-a="tab" data-v="shop">去 SHOP</button></div>`;
  return `<section class="card cb-log">${log.map(x=>{ const a=albumOf(x.aid), v=verOf(a,x.vid), g=groupOf(a.gid), d=new Date(x.ts);
    return `<div class="gl-r"><div class="gl-h"><b>${esc(g?g.name:"")}《${esc(a.title)}》${esc(v?v.name:"")}${x.sid&&storeOf(x.sid)?`・${esc(storeOf(x.sid).name)}`:""}</b><small>${ymd(x.ts)} ${pad(d.getHours())}:${pad(d.getMinutes())}</small></div>
      <div class="gl-cs">${[...x.cards,...(x.extra||[])].map(c=>parseIt(c)?`<button class="gl-c ${parseIt(c).p.sp?"t3":"t1"}" data-a="cardView" data-v="${c}">${esc(itemName(c))}</button>`:"").join("")}</div></div>`; }).join("")}</section><p class="cb-lnote">保留最近 50 次</p>`; }
/* ===== 管理員：專輯編輯器 ===== */
/* 店家一行：顏色頭像＋名字（直接改）＋這家店在幾張專輯有特典／Lucky Draw */
const ST_COL=["#A78BFA","#F472B6","#60A5FA","#34D399","#FBBF24","#FB7185","#22D3EE","#C084FC"];
function storeRowHtml(st){ const A=getAlbums(), ex=A.flatMap(a=>(a.ex||[]).filter(e=>e.store===st.id)), na=A.filter(a=>(a.ex||[]).some(e=>e.store===st.id)).length,
    pob=ex.filter(e=>e.rule==="pob").length, ld=ex.filter(e=>e.rule==="ld").length, c=ST_COL[strHash(st.id)%ST_COL.length];
  return `<div class="sto-card"><span class="sto-av" style="--c:${c}">${esc([...(st.name||"店")][0].toUpperCase())}</span>
    <span class="sto-b"><input class="st-in sto-in" data-v="${st.id}" value="${esc(st.name)}" maxlength="20" aria-label="店家名稱"><small>${na?`${na} 張專輯${pob?`・預購特典 ${pob}`:""}${ld?`・Lucky Draw ${ld}`:""}`:"還沒有專輯設定這家店"}</small></span>
    <button class="sto-del" data-a="stDel" data-v="${st.id}" aria-label="刪除店家"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 11v6M14 11v6M6.5 7l.8 11.2A2 2 0 0 0 9.3 20h5.4a2 2 0 0 0 2-1.8L17.5 7M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7"/></svg></button></div>`; }
function adminAlbumHtml(){ const gid=ui.albG||GROUPS[0].id, L=getAlbums().filter(a=>a.gid===gid), ST=getStores();
  return `<div class="section-h">店家<span class="muted">${ST.length} 家</span></div>
    <section class="card sto-list">${ST.map(storeRowHtml).join("")}<button class="sto-add" data-a="stAdd"><span>＋</span>新增店家</button></section>
    <p class="sto-note">每家店的預購特典、Lucky Draw 在專輯裡各自設定。點名字就能改名。</p>
    <div class="section-h">專輯<span class="muted">${getAlbums().length} 張</span></div>
    <section class="card studio">
    <div class="chips wrap">${GROUPS.map(g=>`<button class="chip ${gid===g.id?"on":""}" data-a="albG" data-v="${g.id}">${esc(g.name)}</button>`).join("")}</div>
    ${L.map(a=>`<div class="leak-row"><span>《${esc(a.title)}》<small>${esc(a.ord)}・${a.vers.length} 個版本</small></span><span style="display:flex;gap:6px"><button class="btn btn-main btn-sm" data-a="aeOpen" data-v="${a.id}">編輯</button><button class="btn btn-soft btn-sm" data-a="albDel" data-v="${a.id}">下架</button></span></div>`).join("")}
    <button class="btn btn-soft btn-block" data-a="aeNew" style="margin-top:8px">＋ 新增專輯</button></section>`; }
const upCell=(key,lab,ratio,extra="")=>`<label class="ap-cell ${PCI[key]?"has":""}" style="aspect-ratio:${ratio}">${PCI[key]?`<img src="${PCI[key]}" alt="">`:`<span>＋</span>`}<input type="file" accept="image/*" class="ap-in" data-pk="${key}" hidden>${lab?`<small>${esc(lab)}</small>`:""}${PCI[key]?`<button type="button" class="ap-x" data-a="apDel" data-v="${key}" aria-label="刪除">${XI}</button>`:""}${extra}</label>`;
function aeItemHtml(a,it,ex){ const ms=groupArtists(a.gid);
  return `<div class="ae-it"><div class="ae-ith">${ex?`<b>${esc(EXR[it.rule].n)}</b><small>${esc(EXR[it.rule].d)}</small>`:`<div class="chips sm">${INC.map(x=>`<button class="chip ${it.k===x.k?"on":""}" data-a="aeIK" data-i="${it.id}" data-v="${x.k}">${x.n}</button>`).join("")}</div>`}<button class="ae-del" data-a="aeIDel" data-v="${it.id}" aria-label="刪除這一項">${XI}</button></div>
    <div class="ae-grid"><label>名稱<input class="ae-in" data-o="i|${it.id}|name" value="${esc(it.name)}"></label>${ex?"":`<label>一張專輯放幾張<input class="ae-in" inputmode="numeric" data-o="i|${it.id}|n" value="${it.n||1}"></label>`}${it.rule==="pob"?`<label>限量幾張（0＝不限量）<input class="ae-in" inputmode="numeric" data-o="i|${it.id}|cap" value="${it.cap||0}"></label>${it.cap?`<p class="ae-tip w2">已送出 ${(S.get(K.ldGiven,{}))[it.id]||0} 張・剩 ${ldLeft(it)} 張</p>`:""}`:""}${it.rule==="ld"?`<label>總共幾張（抽完就沒了）<input class="ae-in" inputmode="numeric" data-o="i|${it.id}|cap" value="${it.cap||20}"></label><label>每張專輯抽中機率（%）<input class="ae-in" inputmode="numeric" data-o="i|${it.id}|odds" value="${it.odds||10}"></label><p class="ae-tip w2">已送出 ${(S.get(K.ldGiven,{}))[it.id]||0} 張・剩 ${ldLeft(it)} 張</p>`:""}<label>寬（公分）<input class="ae-in" inputmode="decimal" data-o="i|${it.id}|w" value="${it.w}"></label><label>高（公分）<input class="ae-in" inputmode="decimal" data-o="i|${it.id}|h" value="${it.h}"></label></div>
    <p class="ae-tip">照片池：抽的時候從這些照片裡隨機抽（貴卡比較難抽到）。每張可以上傳正面、背面，指定是哪位成員。</p>
    <div class="ae-pool">${(it.pool||[]).map(p=>`<div class="ae-ph">${upCell(`ph|${a.id}|${p.id}|f`,"正面",`${it.w}/${it.h}`)}${upCell(`ph|${a.id}|${p.id}|b`,"背面",`${it.w}/${it.h}`)}
      <select class="ae-sel" data-o="p|${it.id}|${p.id}|mid"><option value="">不指定成員</option>${ms.map(m=>`<option value="${m}" ${p.mid===m?"selected":""}>${esc(artName(m,"feed"))}</option>`).join("")}</select>
      <div class="ae-pb">${ex&&aeArt()?(p.sp?`<span class="chip on">✦ 貴卡・${FX_N[fxOf(p)]}</span>`:""):`<button class="chip ${p.sp?"on":""}" data-a="aePSp" data-i="${it.id}" data-v="${p.id}">✦ 貴卡</button>${p.sp?["pearl","holo","none"].map(f=>`<button class="chip ${fxOf(p)===f?"on":""}" data-a="aePFx" data-i="${it.id}" data-v="${p.id}" data-f="${f}">${FX_N[f]}</button>`).join(""):""}`}<button class="chip" data-a="aePDel" data-i="${it.id}" data-v="${p.id}">刪除</button></div></div>`).join("")}
      <button class="ae-add" data-a="aePAdd" data-v="${it.id}" style="aspect-ratio:${it.w}/${it.h}">＋<small>加一張照片</small></button></div>
    <div class="ae-row"><span class="ae-lab">卡背設計（這一項整套共用；單張沒傳背面時就用這張）</span>${upCell(`ib|${a.id}|${it.id}`,"",`${it.w}/${it.h}`)}</div></div>`; }
/* 11/17 藝人（要出道／回歸的人）也能編自己團的專輯、上傳小卡卡面；價格、預購天數只有管理員能改（藝人不能動自己商品的價格） */
const aeArt=()=>{ const s=session()||{}; return s.role==="artist"&&!isAdminAcct(); };
function artAlbumsSheet(){ ui.itPv=null; const s=session()||{}, gid=(MEMBERS[s.member]||{}).group; if(!gid) return; ui.albG=gid; const L=getAlbums().filter(a=>a.gid===gid);
  const mc=mcAlb(gid), mcp=mc?mc.ex[0].pool:[];   /* 11/17 公放卡（投票拿到的卡）也由藝人自己上傳：每位成員一款，正面＋背面 */
  setLayer(`<div class="tiei art-alb"><header class="tiei-top"><button class="icon-btn" data-a="tCloseLayer" aria-label="返回">${I.back}</button><b>專輯・小卡</b><span class="sh-sp"></span></header><div class="tiei-body">
    <div class="section-h">公放卡<span class="mc-must ${mcDone(gid)?"ok":""}">${mcDone(gid)?"✓ 已放好":"必放"}</span></div>
    <div class="mc-rule"><b>打歌節目的週期</b><ul><li>新歌 MV 公開那一週是宣傳週（不排名）→ 下一週起連續 4 個打歌週 → 下檔。回歸時換成新歌。</li></ul><b>公放卡怎麼發</b><ul><li><b>只在出道／回歸後的第一個打歌週發</b>（宣傳週的下一週）；過了那週就不再發。</li><li>那一週，每個節目最先投票給你們的 3 位粉絲，投完的當下就拿到 1 張；第 4 位之後拿不到。</li><li>同一位粉絲在同一個節目只拿得到 1 張；投給虛擬歌手不會拿到。</li><li>每位成員一款，粉絲拿到哪一位是隨機的。</li><li>尺寸 5.5 × 8.5 公分。<b>正面每位都要放</b>；背面可以不放，沒放就用預設卡背。</li><li>專輯裡另外設了公放卡的話，會先發專輯裡的。</li></ul></div>
    <section class="card studio"><div class="ae-pool">${mcp.map(p=>`<div class="ae-ph">${upCell(`ph|mc_${gid}|${p.id}|f`,"正面","5.5/8.5")}${upCell(`ph|mc_${gid}|${p.id}|b`,"背面","5.5/8.5")}<small class="ae-mn">${esc(p.mid?artName(p.mid,"feed"):(groupOf(gid)||{}).name||"")}</small><button class="btn btn-soft btn-sm ae-pv" data-a="mcPv" data-v="it|mc_${gid}|mc|${p.id}">看效果</button></div>`).join("")}</div>${isAdminAcct()?`<button class="btn btn-soft btn-block" data-a="mcGrantOpen" style="margin-top:10px">補發公放卡給之前投票的粉絲</button>`:""}</section>    <div class="section-h">專輯<span class="muted">可不放</span></div>
    <p class="ae-tip">有出實體專輯（迷你、正規…）再新增；單曲、數位單曲出道不用放，只要放上面的公放卡就好。上傳後大家的 App 都看得到。</p>
    <section class="card studio">${L.map(a=>`<div class="leak-row"><span>《${esc(a.title)}》<small>${esc(a.ord)}・${a.vers.length} 個版本</small></span><span style="display:flex;gap:6px"><button class="btn btn-soft btn-sm" data-a="albDel" data-v="${a.id}">刪除</button><button class="btn btn-main btn-sm" data-a="aeOpen" data-v="${a.id}">編輯</button></span></div>`).join("")||`<p class="me-none">還沒有專輯</p>`}
    <button class="btn btn-soft btn-block" data-a="aeNew" style="margin-top:8px">＋ 新增專輯</button></section>
</div></div>`); }
function openAlbumEditor(aid){ const a=albumOf(aid); if(!a) return; if(aeArt()&&a.gid!==(MEMBERS[(session()||{}).member]||{}).group) return; const g=groupOf(a.gid), sc=layer.querySelector(".tiei-body"), y=sc?sc.scrollTop:0;
  setLayer(`<div class="tiei ae"><header class="tiei-top"><button class="icon-btn" data-a="aeClose" aria-label="返回">${I.back}</button><b>${esc(g.name)} 專輯</b><span class="sh-sp"></span></header>
    <div class="tiei-body">
      <div class="ae-grid"><label class="w2">專輯名稱<input class="ae-in" data-o="a|title" value="${esc(a.title)}"></label><label class="w2">第幾張<input class="ae-in" data-o="a|ord" value="${esc(a.ord)}"></label></div>
      ${typeof aeRelHtml==="function"?aeRelHtml(a):""}${a.vers.map((v,vi)=>{ const sh=shapeOf(v.shape); return `<section class="ae-v"><div class="ae-vh"><b>版本 ${vi+1}</b><button class="ae-del" data-a="aeVDel" data-v="${v.id}">刪除這個版本</button></div>
        <div class="ae-grid"><label class="w2">版本名稱<input class="ae-in" data-o="v|${v.id}|name" value="${esc(v.name)}"></label></div>
        <span class="ae-lab">外型（選了會自動帶入常見尺寸）</span>
        <div class="ae-shapes">${SHAPES.map(x=>`<button class="ae-sh ${v.shape===x.k?"on":""}" data-a="aeShape" data-i="${v.id}" data-v="${x.k}"><i style="aspect-ratio:${x.w}/${x.h}"></i><b>${x.n}</b><small>${x.d}</small></button>`).join("")}</div>
        <div class="ae-grid"><label>寬（公分）<input class="ae-in" inputmode="decimal" data-o="v|${v.id}|w" value="${v.w}"></label><label>高（公分）<input class="ae-in" inputmode="decimal" data-o="v|${v.id}|h" value="${v.h}"></label><label>厚（公分）<input class="ae-in" inputmode="decimal" data-o="v|${v.id}|t" value="${v.t}"></label>
          ${aeArt()?"":`<label>價格（點）<input class="ae-in" inputmode="numeric" data-o="v|${v.id}|pts" value="${v.pts}"></label><label class="w2">預購還剩幾天（0＝沒有預購）<input class="ae-in" inputmode="numeric" data-o="v|${v.id}|pre" value="${Math.max(0,Math.ceil(((v.preEnd||0)-Date.now())/864e5))}"></label>`}</div>
        <span class="ae-lab">封面、封底（丟進去會自動照圖片比例調整寬度，書背顏色也會從圖片取）</span>
        <div class="ae-cv">${upCell(`vc|${a.id}|${v.id}`,"封面",`${v.w}/${v.h}`)}${upCell(`vb|${a.id}|${v.id}`,"封底",`${v.w}/${v.h}`)}<div class="ae-prev" data-v="${v.id}"><div class="s3 ae-s3">${albumBox(a,v,{maxPx:110})}</div><small>拖動預覽</small></div></div>
        <span class="ae-lab">裡面放的東西</span>${v.inc.map(it=>aeItemHtml(a,it,false)).join("")}
        <button class="btn btn-soft btn-block" data-a="aeIAdd" data-v="${v.id}">＋ 加一樣內容物</button></section>`; }).join("")}
      <button class="btn btn-main btn-block" data-a="aeVAdd">＋ 加一個版本</button>
      <section class="ae-v"><div class="ae-vh"><b>專輯外：店家特典</b></div><p class="ae-tip">預購特典、Lucky Draw 是店家另外附送的，不在專輯裡。每家店可以設定不一樣的卡。店家名單在「專輯與小卡」最上面管理。</p>
        ${getStores().map(st=>{ const ex=(a.ex||[]).filter(e=>e.store===st.id); return `<div class="ae-st"><b class="ae-stn">🏪 ${esc(st.name)}</b>${ex.map(it=>aeItemHtml(a,it,true)).join("")}
          <div class="chips">${["pob","ld"].filter(r=>!ex.some(e=>e.rule===r)).map(r=>`<button class="chip" data-a="aeXAdd" data-v="${r}" data-s="${st.id}">＋ ${EXR[r].n}</button>`).join("")}</div></div>`; }).join("")}</section>
      <section class="ae-v"><div class="ae-vh"><b>專輯外：活動卡</b></div>${(a.ex||[]).filter(e=>!EXR[e.rule]||!EXR[e.rule].st).map(it=>aeItemHtml(a,it,true)).join("")}
        <div class="chips">${["fs","mc"].filter(r=>!(a.ex||[]).some(e=>e.rule===r)).map(r=>`<button class="chip" data-a="aeXAdd" data-v="${r}">＋ ${EXR[r].n}</button>`).join("")}</div></section>
    </div></div>`,"ae");
  ui.aeId=aid; const b=layer.querySelector(".tiei-body"); if(b) b.scrollTop=y;
  layer.querySelectorAll(".ae-s3").forEach(h=>{ const box=h.querySelector(".ab-box"); if(box) spin3d(box,h,{auto:true,rx:-14,ry:-30}); }); }
const aeA=()=>albumOf(ui.aeId);
document.addEventListener("input",e=>{ const t=e.target; if(!t.classList||!(t.classList.contains("ae-in"))) return; const a=aeA(); if(!a) return; const [k,x,y]=t.dataset.o.split("|"), val=t.value, num=parseFloat(val);
  if(k==="a") a[x]=val;
  else if(k==="v"){ const v=verOf(a,x); if(!v) return; if(y==="name") v.name=val; else if(y==="pre"){ if(!isNaN(num)) v.preEnd=num>0?Date.now()+num*864e5:0; } else if(!isNaN(num)&&num>0) v[y]=num; }
  else if(k==="i"){ const r=itemOf(a,x); if(!r) return; if(y==="name") r.it.name=val; else if(y==="cap"&&r.it.rule==="pob"&&!isNaN(num)&&num>=0) r.it.cap=Math.round(num); else if(!isNaN(num)&&num>0) r.it[y]=y==="n"?Math.min(20,Math.round(num)):y==="cap"?Math.round(num):y==="odds"?Math.min(100,num):num; }
  saveAlbum(a); });
document.addEventListener("input",e=>{ const t=e.target; if(!t.classList||!t.classList.contains("st-in")) return; const L=getStores(), st=L.find(x=>x.id===t.dataset.v); if(!st) return; st.name=t.value.trim()||"店家"; S.set(K.stores,L); });
document.addEventListener("change",e=>{ const t=e.target; if(!t.classList||!t.classList.contains("ae-sel")) return; const a=aeA(); if(!a) return; const [,iid,pid]=t.dataset.o.split("|"), r=itemOf(a,iid), p=r&&photoOf(r.it,pid); if(p){ p.mid=t.value||null; saveAlbum(a); } });
/* 封面上傳後：照圖片比例調整寬度、從圖片左邊取書背顏色 */
async function aeCoverAuto(key){ const [,aid,vid]=key.split("|"), a=albumOf(aid), v=a&&verOf(a,vid), url=PCI[key]; if(!v||!url) return;
  try{ const img=await new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=url; }); const r=img.naturalWidth/img.naturalHeight;
    const c=document.createElement("canvas"); c.width=4; c.height=40; c.getContext("2d").drawImage(img,0,0,Math.max(1,img.naturalWidth*.03),img.naturalHeight,0,0,4,40); const d=c.getContext("2d").getImageData(0,0,4,40).data; let R=0,G=0,B=0; for(let i=0;i<d.length;i+=4){ R+=d[i]; G+=d[i+1]; B+=d[i+2]; } const n=d.length/4;
    v.spine=`rgb(${R/n|0},${G/n|0},${B/n|0})`; v.w=Math.round(v.h*r*10)/10; saveAlbum(a);
    const tc=domColor(img); if(tc&&a.vers[0]&&a.vers[0].id===vid){ S.set(K.gTheme,{...S.get(K.gTheme,{}),[a.gid]:tc}); } toast(`已照封面比例調整成 ${v.w} × ${v.h} 公分`); }catch(err){} }

/* 單張卡：光澤會自己慢慢晃（NSY 的做法），手指拖或傾斜手機也會動 */
let cvRaf=0, cvGyroOn=false;
function openCardView(cid){
  if(String(cid).startsWith("it|")) return openItemView(cid);
  const own=getCards(), n=own[cid]||0, mt=cardMeta()[cid]||{}, [mid,t]=cid.split(":"), m=MEMBERS[mid]; if(!m) return;
  const g=groupOf(m.group), touch="ontouchstart" in window&&typeof DeviceOrientationEvent!=="undefined";
  setLayer(`<div class="ph-view cv" data-a="tCloseLayer" role="dialog" aria-label="卡片"><button class="ph-x" data-a="tCloseLayer" aria-label="關閉">${XI}</button>
    <div class="cv-tilt" id="cvTilt">${cardFace(cid,{big:true})}</div>
    <div class="cv-info"><span class="cv-tag t${t}">${"★".repeat(+t)} ${["","日常 NORMAL","舞台 RARE","流光 SUPER RARE"][+t]}</span><b>${esc(m.name)}</b>
      <small>${esc(g?g.name:"")}${mt.no?"・"+cardNo(mt.no):""}</small><small>${n?`${mt.ts?ymd(mt.ts)+" 首次獲得・":""}擁有 ${n} 張`:"還沒有這張卡"}</small></div>
    <div class="cv-btns">${touch&&!cvGyroOn?`<button class="btn btn-soft btn-sm" data-a="cardGyro">📱 傾斜手機看光澤</button>`:""}</div>
    <small class="cv-tip">${touch?"也可以用手指拖動卡片":"拖動卡片看看光澤"}</small></div>`,"cardview");
  cvStart();
}
function cvStart(){
  cancelAnimationFrame(cvRaf); const el=document.getElementById("cvTilt"); if(!el) return;
  const st={x:0,y:0,tx:0,ty:0,user:0}; let ph=Math.random()*9; ui.cvSt=st;
  const mv=e=>{ const r=el.getBoundingClientRect(); st.tx=Math.max(-.5,Math.min(.5,(e.clientX-r.left)/r.width-.5)); st.ty=Math.max(-.5,Math.min(.5,(e.clientY-r.top)/r.height-.5)); st.user=performance.now(); };
  el.addEventListener("pointermove",mv); el.addEventListener("pointerdown",mv);
  (function f(now){ if(document.getElementById("cvTilt")!==el) return; ph+=.018;
    if(now-st.user>1200){ st.tx=Math.sin(ph)*.22; st.ty=Math.cos(ph*.8)*.18; }
    st.x+=(st.tx-st.x)*.12; st.y+=(st.ty-st.y)*.12;
    el.style.transform=`rotateY(${st.x*30}deg) rotateX(${-st.y*30}deg)`; el.style.setProperty("--mx",(st.x+.5)*100+"%"); el.style.setProperty("--my",(st.y+.5)*100+"%"); el.style.setProperty("--ang",(st.x*300+st.y*140)+"deg");
    cvRaf=requestAnimationFrame(f); })(performance.now());
}
function cvOrient(e){ const st=ui.cvSt; if(!st||e.beta==null||!document.getElementById("cvTilt")) return; st.tx=Math.max(-.5,Math.min(.5,(e.gamma||0)/50)); st.ty=Math.max(-.5,Math.min(.5,((e.beta||0)-45)/50)); st.user=performance.now(); }
async function cardGyro(){
  try{ if(typeof DeviceOrientationEvent.requestPermission==="function"){ const p=await DeviceOrientationEvent.requestPermission(); if(p!=="granted"){ toast("沒有開啟動作權限，用手指拖也可以喔"); return; } }
    if(!cvGyroOn){ addEventListener("deviceorientation",cvOrient); cvGyroOn=true; }
    const b=layer.querySelector('[data-a="cardGyro"]'); if(b) b.remove(); toast("傾斜手機看看光澤");
  }catch(e){ toast("這裡還不能用傾斜，先用手指拖動看看"); }
}



/* 11/17 補發公放卡：公放卡功能上線前就投票的粉絲。App 只記了「哪天投給哪首」，同一天裡誰先誰後沒記 → 照日期排好、預設勾最早的 3 位，管理員確認後再發 */
const MCG="daisuki_mc_grant";
function mcVoters(gid){ const sids=new Set([...(getMShow().songs||[]),...(getMShow().ended||[])].filter(x=>x.gid===gid).map(x=>x.id)), out={}; const ks=new Set();
  try{ Object.keys(localStorage).forEach(k=>{ if(k.startsWith("daisuki_music_my_votes@")) ks.add(k); }); }catch(e){} try{ Object.keys(mem||{}).forEach(k=>{ if(k.startsWith("daisuki_music_my_votes@")) ks.add(k); }); }catch(e){} try{ Object.keys(HB.ver||{}).forEach(k=>{ if(k.startsWith("daisuki_music_my_votes@")) ks.add(k); }); }catch(e){}
  ks.forEach(k=>{ const em=k.slice(k.indexOf("@")+1), V=S.get(k,{})||{}; if(typeof mcSelfAcc==="function"&&mcSelfAcc(em,gid)) return; Object.entries(V).forEach(([dk,sid])=>{ if(!sids.has(sid)) return; const i=dk.lastIndexOf(":"), day=Date.parse(dk.slice(0,i)), sh=dk.slice(i+1); if(!day||!SHOWS.some(x=>x.id===sh)) return; const L=out[sh]=out[sh]||{}; if(!L[em]||day<L[em]) L[em]=day; }); });
  try{ const Q=S.get("daisuki_ms_seat",{})||{}; Object.values(Q).forEach(W=>Object.entries(W||{}).forEach(([sh,M])=>Object.entries(M||{}).forEach(([sid,o])=>{ if(!sids.has(sid)) return; Object.entries(o||{}).forEach(([em,t])=>{ if(mcSelfAcc(em,gid)) return; const L=out[sh]=out[sh]||{}; if(!L[em]||t<L[em]) L[em]=t; }); }))); }catch(e){}
  const res={}; SHOWS.forEach(sh=>{ res[sh.id]=Object.entries(out[sh.id]||{}).sort((a,b)=>a[1]-b[1]).map(([em,day])=>({em,day})); }); return res; }
function mcGrantSheet(){ const gid=ui.albG; if(!gid||!isAdminAcct()) return; const V=mcVoters(gid), G=S.get(MCG,[])||[], has=(em,sh)=>G.some(x=>x.gid===gid&&x.em===em&&x.sh===sh);
  ui.mcSel=ui.mcSel||{}; SHOWS.forEach(sh=>(V[sh.id]||[]).slice(0,3).forEach(v=>{ const k=sh.id+"|"+v.em; if(ui.mcSel[k]==null) ui.mcSel[k]=1; }));
  const nm=em=>esc((ACCOUNTS[em]||{}).name||acctUser(em)), d=t=>{ const x=new Date(t); return `${x.getMonth()+1}/${x.getDate()}`; };
  setLayer(`<div class="tiei art-alb"><header class="tiei-top"><button class="icon-btn" data-a="artAlb" aria-label="返回">${I.back}</button><b>補發公放卡</b><span class="sh-sp"></span></header><div class="tiei-body">
    <p class="ae-tip">投給 ${esc((groupOf(gid)||{}).name||"")} 的粉絲，照第一次投票的日期排。同一天裡誰先投的 App 沒有記，所以預設勾每個節目最早的 3 位，可以自己改。按「發送」後，他們下次打開 App 就會收到。</p>
    ${SHOWS.map(sh=>{ const L=V[sh.id]||[]; return `<div class="section-h">${esc(sh.name)}</div><section class="card studio">${L.length?L.map(v=>{ const k=sh.id+"|"+v.em, done=has(v.em,sh.id); return `<button class="list-btn" ${done?"disabled":`data-a="mcSelT" data-v="${esc(k)}"`}>${nm(v.em)}<span class="r">${d(v.day)}・${done?"已發":ui.mcSel[k]?"✓ 要發":"不發"}</span></button>`; }).join(""):`<p class="me-none">沒有人投過</p>`}</section>`; }).join("")}
    <button class="btn btn-main btn-block" data-a="mcGrantGo" style="margin-top:14px">發送</button></div></div>`); }
function mcGrantGo(){ const gid=ui.albG, G=S.get(MCG,[])||[], sel=Object.entries(ui.mcSel||{}).filter(([,on])=>on).map(([k])=>k.split("|")); let n=0;
  sel.forEach(([sh,em])=>{ if(G.some(x=>x.gid===gid&&x.em===em&&x.sh===sh)) return; G.push({id:uid("mcg"),gid,em,sh,ts:Date.now()}); n++; });
  S.set(MCG,G); ui.mcSel=null; toast(n?`已發給 ${n} 位，他們打開 App 就會收到`:"沒有新的要發"); artAlbumsSheet(); }
/* 11/18 公放卡週裡、在這個版本之前就投了票的粉絲：打開 App 時把自己的公放席補上（照投票那天排），前 3 位補發卡＋通知 */
function mcHeal(){ const s=session(); if(!s||s.role!=="fan"||Date.now()-(mcHeal.t||0)<30e3) return; mcHeal.t=Date.now(); const wk=curWeek(), me=myEmail(), V=S.get(K.msMine,{})||{}, got=S.get(K.mcGot,{}); let L=null;
  Object.entries(V).forEach(([dk,sid])=>{ const i=dk.lastIndexOf(":"), day=Date.parse(dk.slice(0,i)), sh=dk.slice(i+1), so=songOf(sid); if(!day||weekKey(day)!==wk||!so||so.demo||mcSelfAcc(me,so.gid)) return;
    const seat=showSeat(sid,sh,day); /* 這週投過的都補記到共用紀錄 */ if(mcWeek(so)!==wk||got[`${wk}|${sh}|${so.gid}`]||seat>=3) return; const c=giveMcCard(so.gid,sh); if(!c) return; const g=groupOf(so.gid), x=SHOWS.find(z=>z.id===sh); L=L||S.get(K.notifs,[]);
    L.unshift({id:"n"+Date.now()+Math.random().toString(36).slice(2,5),kind:"core",direct:true,group:so.gid,text:`你是這週 ${x?x.name:""} 最早幫 ${g?g.name:""} 投票的粉絲之一，送你一張公放卡`,ts:Date.now()}); });
  if(L){ S.set(K.notifs,L.slice(0,100)); S.set(K.unread,"1"); } }
/* 粉絲那邊：打開 App 時看有沒有補發給自己的，有就給卡、通知 */
function mcGrantRun(){ try{ mcHeal(); }catch(e){} try{ const s=session(); if(!s||s.role!=="fan") return; const me=myEmail(), G=(S.get(MCG,[])||[]).filter(x=>x.em===me); if(!G.length) return; const got=S.get(K.mcGot,{}); let L=null;
  G.forEach(x=>{ if(got["g:"+x.id]) return; const c=giveMcCard(x.gid,x.sh,"g:"+x.id); if(!c) return; L=L||S.get(K.notifs,[]); const g=groupOf(x.gid), sh=SHOWS.find(z=>z.id===x.sh);
    L.unshift({id:"n"+Date.now()+Math.random().toString(36).slice(2,5),kind:"core",direct:true,group:x.gid,text:`你是 ${sh?sh.name:""} 最早幫 ${g?g.name:""} 投票的粉絲之一，送你一張公放卡`,ts:Date.now()}); });
  if(L){ S.set(K.notifs,L.slice(0,100)); S.set(K.unread,"1"); } }catch(e){} }
