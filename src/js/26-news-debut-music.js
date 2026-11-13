/* HAECHU｜新聞稿、回歸申請、補出道資料、打歌、結尾妖精 */
/* =========================================================
   娛樂新聞稿（App 自動快訊用）：照韓國娛樂新聞的寫法
   ・標題：【公式】【快訊】【焦點】、今日（5日）、「怪物新人」、…連接
   ・內文：誰、哪天、做了什麼 → 成員／作品 → 接下來的行程 → 粉絲可以做什麼
   ・每則新聞用自己的編號挑句子，同一則永遠長一樣，不同則會換說法
   ========================================================= */
const nwP=(id,salt,a)=>a[strHash(id+"|"+salt)%a.length];
const nwWD=ts=>"日一二三四五六"[new Date(ts).getDay()];
const nwD=ts=>new Date(ts).getDate();
const nwKind=solo=>solo?"SOLO 歌手":"新團";
const nwList=a=>a.length<=1?a.join(""):a.slice(0,-1).join("、")+"和"+a[a.length-1];

/* 出道當天 */
function nwDebut(id,{name,solo,ms,t,song,today,co,rtype}){ const D=nwD(t), M=new Date(t).getMonth()+1, Y=new Date(t).getFullYear(), n=ms.length, k=nwKind(solo), when=today?`今日（${D}日）`:`${M}月${D}日`;
  const title=nwP(id,"t",[
    `【公式】${k} ${name}，${when}正式出道`,
    `「怪物新人」${name} 登場…${M}月${D}日正式出道`,
    `【焦點】${Y} 年最受矚目的新人？${name} 正式揭開面紗`,
    `${name} ${when}出道…HAECHU 新人版圖再添${solo?"一位":"一組"}`,
    `【快訊】${name} 出道！星期${nwWD(t)}正式與粉絲見面`,
    ...(song?[`${name} 出道曲《${song}》公開…正式踏上舞台`,`新人 ${name} 以《${song}》出道…首次亮相`]:[]),
    ...(!solo&&n>1?[`${n} 人${k} ${name} ${when}出道…「完全體」正式登場`]:[]),
    ...(co?[`【公式】${co} 新人 ${name}，${when}正式出道`,`${co} 推出的${solo?" SOLO 歌手":"新團"} ${name}…${M}月${D}日出道`]:[]),
    ...(solo?[`一個人也能撐起舞台…SOLO 新人 ${name} 出道`]:[])]);
  const lead=nwP(id,"l",[
    `${k}「${name}」於${when}正式出道，展開出道後的第一輪活動。`,
    `備受期待的新人 ${name}，終於在 ${M}月${D}日揭開面紗。`,
    `${name} 於 ${M}月${D}日透過 HAECHU 正式出道，成為 ${Y} 年最新加入的${solo?"歌手":"團體"}。`,
    `經過一週的出道預告，${name} 在 ${M}月${D}日正式與大家見面。`,
    `新人 ${name} 在 ${M}月${D}日（星期${nwWD(t)}）正式出道，一出道就成為話題。`,
    ...(co?[`${co} 推出的${solo?" SOLO 歌手":"新團"}「${name}」於${when}正式出道。`,`所屬社 ${co} 宣布，旗下${solo?"新人":"新團"} ${name} 在 ${M}月${D}日正式出道。`]:[])]);
  const who=solo?nwP(id,"w",[`${name} 以 SOLO 歌手身分出道，一個人撐起整個舞台。`,`和團體不同，${name} 選擇以個人身分出道，從舞台到社群都由自己一手包辦。`,`${name} 是 HAECHU 的 SOLO 新人，出道作品完整展現個人色彩。`])
    :n?nwP(id,"w",[`${name} 由 ${nwList(ms)} 共 ${n} 位成員組成。`,`成員有 ${nwList(ms)}，${n} 個人各有各的魅力。`,`${n} 位成員 ${nwList(ms)} 從出道第一天起就展現出好默契。`]):"";
  const work=song?nwP(id,"s",[`出道曲《${song}》${rtype?`以${rtype}形式發行，`:""}與 MV 同步公開，在 HAECHU 上就能欣賞。`,`出道曲《${song}》是 ${name} 交出的第一張成績單，MV 一公開就引起討論。`,`《${song}》作為出道曲，濃縮了 ${name} 想讓大家看見的樣子。`])
    :nwP(id,"s",[`出道 MV 已在 HAECHU 公開。`,`出道當天，MV 與預告照一起公開，讓人一次看見 ${name} 的完整概念。`,`${name} 的出道 MV 同步上線，成為當天最多人點開的影片。`]);
  const next=nwP(id,"n",[`接下來 ${name} 將陸續登上音樂節目，展開出道宣傳。`,`新人獎的競爭，也因為 ${name} 的加入變得更激烈。`,`${name} 能不能在出道後拿下第一座音樂節目一位，也備受關注。`,`官方社群與 SKpedia 頁面同步開放，${name} 的出道故事正式開始。`]);
  const fan=nwP(id,"f",[`粉絲可以搶先加入社群、開通 TIE，第一時間收到 ${name} 的消息。`,`從出道當天起，粉絲就能在 TIE 和 ${name} 直接聊天。`,`想第一個應援的話，現在就可以到 ${name} 的社群留言祝賀。`]);
  return {title,body:`【${NW_BY}】${lead}\n\n${[who,work].filter(Boolean).join("")}\n\n${next}${fan}`}; }

/* 出道預告（官方公告發出那天） */
function nwDebutPre(id,{name,day,t,co,grp,nm,nt}){ const M=new Date(day).getMonth()+1, D=nwD(day), left=Math.max(1,Math.round((dayStart(day)-dayStart(t))/864e5)), who=grp?"新團":"新人", W=nwWD(day);
  const title=nwP(id,"t",[`【公式】新人「${name}」確定 ${M}月${D}日出道`,`下一位新人是誰？${name} ${M}月${D}日出道確定`,`${name} 出道倒數 D-${left}…HAECHU 公開出道預告`,`【快訊】HAECHU 新人 ${name}，${M}月${D}日正式出道`,`「${name}」是誰？出道預告一發出就引起好奇`,...(co?[`【公式】${co} 新${grp?"團":"人"}「${name}」${M}月${D}日出道確定`]:[]),...(grp?[`新團「${name}」${M}月${D}日出道…完整陣容即將公開`]:[])]);
  const lead=nwP(id,"l",[
    `HAECHU 發布出道預告，${who}「${name}」確定將在 ${M}月${D}日（星期${W}）正式出道。`,
    `${who}「${name}」的出道日正式確定，就在 ${M}月${D}日。距離出道只剩 ${left} 天。`,
    `HAECHU 迎來新面孔。官方宣布，「${name}」將在 ${M}月${D}日出道，出道倒數正式開始。`,
    ...(co?[`${co} 準備已久的${who}「${name}」，終於確定出道日：${M}月${D}日。`,`所屬社 ${co} 發布出道預告，旗下${who}「${name}」將在 ${M}月${D}日與大家見面。`]:[])]);
  const p2=grp?nwP(id,"g",[`「${name}」是一個 ${nm||"多"} 人團體。成員是誰、各自負責什麼位置，官方目前還沒有公開，預計會在出道當天一次揭曉。`,`這次出道的是 ${nm||"多"} 人團體「${name}」。目前只公開了團名和預告照，成員的名字仍是秘密。`,`「${name}」由 ${nm||"多"} 位成員組成，官方表示，完整陣容會在出道當天公開。`])
    :nwP(id,"g",[`「${name}」將以 SOLO 歌手身分出道，從舞台到社群都由自己一個人撐起。`,`和團體不同，「${name}」選擇以個人身分出道，備受期待。`,`這次出道的是 SOLO 歌手「${name}」，目前公開的資訊只有藝名和預告照。`]);
  const p3=nt>1?nwP(id,"p",[`官方同步公開了 ${nt} 張預告照，每一張的氛圍都不一樣，粉絲已經開始猜測出道曲的概念。`,`這次一口氣釋出 ${nt} 張預告照，從畫面就能感受到「${name}」想展現的風格。`,`${nt} 張預告照一公開，就在粉絲之間引起討論。`])
    :nwP(id,"p",[`官方同步公開了預告照，畫面中的「${name}」讓人更好奇出道作品的模樣。`,`預告照已在 HAECHU 官方公告中公開，「${name}」的概念引起粉絲好奇。`,`第一張預告照公開後，「${name}」的名字就開始在粉絲之間流傳。`]);
  const p4=nwP(id,"s",[`出道當天，出道 MV 會和音源一起公開。HAECHU 也將在同一天開放「${name}」的官方社群、TIE 和 SKpedia 頁面。`,`官方表示，出道 MV 將在 ${M}月${D}日當天公開。出道後，「${name}」會陸續登上音樂節目，展開第一輪宣傳。`,`${M}月${D}日當天，「${name}」的出道 MV、官方社群和 TIE 會同步上線。出道後的音樂節目舞台也已經在準備中。`]);
  const p5=nwP(id,"e",[`想第一時間認識「${name}」的粉絲，可以先到 HAECHU 公告看預告照，出道當天再加入社群、開通 TIE。`,`距離出道還有 ${left} 天，粉絲可以先在公告留言，為「${name}」的出道加油。`,`出道倒數 D-${left}，「${name}」的故事即將開始。`]);
  return {title,body:`【${NW_BY}】${lead}\n\n${p2}\n\n${p3}${p4}\n\n${p5}`}; }

/* 回歸當天 */
function nwCb(id,{g,s,n,t,gap,today,co}){ const D=nwD(t), M=new Date(t).getMonth()+1, when=today?`今日（${D}日）`:`${M}月${D}日`;
  const title=nwP(id,"t",[
    `${g} 攜新曲《${s}》${n>1?`第 ${n} 次`:""}回歸…本週起登上音樂節目`,
    `【公式】${g}，${when}以《${s}》回歸`,
    `「回歸即話題」${g} 新曲《${s}》今日上線`,
    `${g} 第 ${n} 次回歸正式起跑…主打曲《${s}》公開`,
    `【快訊】${g} 回來了！新曲《${s}》${when}公開`,
    ...(gap>=30?[`${g} 睽違 ${gap} 天回歸…新曲《${s}》公開`]:[]),
    ...(n===1?[`出道後首次回歸，${g} 以《${s}》再出發`]:[])]);
  const lead=nwP(id,"l",[`${g} 於${when}帶著新曲《${s}》正式回歸。`,`${g} 在 ${M}月${D}日公開新曲《${s}》，正式展開回歸活動。`,`${gap>=30?`睽違 ${gap} 天，`:""}${g} 以《${s}》回到舞台。`,`${g} 的新曲《${s}》在 ${M}月${D}日（星期${nwWD(t)}）上線，宣告回歸。`,...(co?[`${co} 旗下的 ${g}，於${when}帶著新曲《${s}》回歸。`]:[])]);
  const mid=nwP(id,"m",[`《${s}》是 ${g} ${n>1?`出道以來第 ${n} 次回歸的主打曲`:"的首張主打曲"}。`,`這是 ${g} 的第 ${n} 次回歸，也是一次全新的嘗試。`,`《${s}》延續 ${g} 的風格，又多了不一樣的面貌。`]);
  const next=nwP(id,"x",[`本週起，${g} 將陸續登上 ${SHOWS.map(x=>x.name).join("、")} 等音樂節目的打歌舞台。`,`${g} 這週就會站上音樂節目的舞台，能不能拿下一位備受關注。`,`接下來的打歌舞台，是《${s}》的第一場考驗。`]);
  const fan=nwP(id,"f",[`粉絲可以到 FEST →「打歌」為《${s}》應援。`,`想幫 ${g} 衝一位的話，到 FEST →「打歌」投票應援。`,`《${s}》的應援，現在就可以在 FEST →「打歌」開始。`]);
  return {title,body:`【${NW_BY}】${lead}\n\n${mid}${next}\n\n${fan}`}; }

/* 回歸預告 */
function nwCbPre(id,{g,s,day,t,co,n,gap}){ const M=new Date(day).getMonth()+1, D=nwD(day), left=Math.max(1,Math.round((dayStart(day)-dayStart(t))/864e5)), W=nwWD(day);
  const title=nwP(id,"t",[`【公式】${g} 確定 ${M}月${D}日回歸…新曲《${s}》`,`${g} 回歸倒數 D-${left}…新曲名稱《${s}》公開`,`【快訊】${g} 要回來了！${M}月${D}日帶著《${s}》回歸`,...(co?[`${co} 旗下的 ${g}，${M}月${D}日以《${s}》回歸`]:[]),...(gap>=60?[`睽違 ${gap} 天…${g} 確定回歸`]:[])]);
  const lead=nwP(id,"l",[`HAECHU 發布回歸預告，${g} 確定將在 ${M}月${D}日（星期${W}）帶著新曲《${s}》回歸。`,`${g} 的回歸日正式確定，新曲《${s}》將在 ${M}月${D}日公開。`,`距離 ${g} 回歸只剩 ${left} 天，新曲名稱《${s}》先一步公開。`,...(co?[`所屬社 ${co} 宣布，${g} 將在 ${M}月${D}日以新曲《${s}》回歸。`]:[])]);
  const p2=nwP(id,"m",[`這是 ${g} ${n>1?`出道以來的第 ${n} 次回歸`:"出道後的第一次回歸"}${gap?`，距離上一次活動已經過了 ${gap} 天`:""}。`,`${n>1?`第 ${n} 次回歸`:"首次回歸"}的 ${g}，會帶來什麼樣的新面貌，備受關注。`,`《${s}》是 ${g} ${n>1?`的第 ${n} 首主打曲`:"出道後的第一首回歸主打曲"}，官方目前還沒有透露更多細節。`]);
  const p3=nwP(id,"s",[`回歸當天，《${s}》的 MV 會和音源一起公開，${g} 也將從那一週起登上音樂節目的打歌舞台。`,`《${s}》MV 將在 ${M}月${D}日公開。回歸後，${g} 會陸續站上 ${SHOWS.map(x=>x.name).join("、")} 的舞台。`,`官方表示，回歸當天會同步公開 MV，接下來的打歌行程也已經排定。`]);
  const p4=nwP(id,"e",[`粉絲可以先在公告留言，回歸當天再到 FEST →「打歌」為《${s}》應援。`,`回歸倒數 D-${left}，粉絲已經開始準備應援。`,`想幫 ${g} 衝一位的粉絲，回歸當天記得到 FEST →「打歌」投票。`]);
  return {title,body:`【${NW_BY}】${lead}\n\n${p2}${p3}\n\n${p4}`}; }

/* 音樂節目一位 */
function nwWin(id,{g,s,show,k,n,cr,t,days}){ const D=nwD(t);
  const title=cr?nwP(id,"t",[`${g}《${s}》${show} 連續三週一位…達成三冠王`,`【快訊】${g} ${show} 三冠王！《${s}》連續三週奪冠`,`三週都是第一…${g}《${s}》${show} 三冠王`])
    :n===1?nwP(id,"t",[`${g}《${s}》拿下 ${show} 一位…出道後首座音樂節目一位`,`【快訊】${g} 出道${days?` ${days} 天`:""}拿下第一個一位！`,`${g} 首個一位誕生…《${s}》${show} 奪冠`])
    :nwP(id,"t",[`${g}《${s}》拿下 ${show} 一位…出道以來第 ${n} 座獎盃`,`【快訊】${g} ${show} 一位！《${s}》第 ${k} 冠`,`${g}，${show} 奪冠…《${s}》氣勢正旺`,`《${s}》又拿一位…${g} 第 ${n} 座獎盃`]);
  const lead=nwP(id,"l",[`${g} 在 ${D}日播出的 ${show} 中，以《${s}》拿下本週一位${cr?"，並以連續三週一位達成這個節目的「三冠王」":""}。`,`${D}日播出的 ${show}，一位由 ${g} 的《${s}》拿下${cr?"，這也是連續第三週，正式達成三冠王":""}。`]);
  const mid=`這是《${s}》的第 ${k} 座一位獎盃，也是 ${g} 出道以來的第 ${n} 座${n===1?"，意義格外特別":""}。`;
  return {title,body:`【${NW_BY}】${lead}\n\n${mid}${g} 本次獲得 ${fmt(MSP.win)} 打歌積分。`}; }

/* =========================================================
   藝人申請回歸（跟出道一樣：藝人送出 → 管理員核准 → 排進回歸預告）
   ・歌名、回歸日、Teaser 照片（可不放）、MV 和 MV Teaser（必填）
   ・回歸日最快 7 天後，而且要跟上一次出道／回歸隔夠久（看公司：CO_GAP）
   ・同一團同時只能有一筆在審核
   ・核准＝放進 ms.pre（跟管理員「排定回歸」一樣），回歸那天 MV 自動放進影音
   ========================================================= */
const CBR_KEY="daisuki_cb_req";
const REL_T=["單曲","數位單曲","EP","迷你專輯","正規專輯","改版專輯","電子專輯"];   /* 發行型態 */
const relChips=(cur,act)=>`<div class="chips wrap co-chips">${REL_T.map(c=>`<button class="chip ${cur===c?"on":""}" data-a="${act}" data-v="${esc(c)}">${esc(c)}</button>`).join("")}</div>`;
const getCbr=()=>(S.get(CBR_KEY,[])||[]).filter(x=>x&&x.id);
const cbrWait=()=>getCbr().filter(x=>x.status==="wait").length;
/* 這團最快哪天可以回歸 */
function cbrMin(gid){ const last=Math.max(0,...grpOccs(gid)); return dayStart(Math.max(Date.now()+PRE_MIN,last?addMon(last,coGap(gid)):0)); }
const cbrMine=gid=>getCbr().filter(x=>x.gid===gid&&x.status==="wait")[0]||null;
const cbrPre=gid=>(getMShow().pre||[]).filter(p=>p.gid===gid&&p.day>Date.now()).sort((a,b)=>a.day-b.day)[0]||null;
/* 藝人 ME 的那一行 */
function cbrRow(mid){ const m=MEMBERS[mid]; if(!m) return ""; const w=cbrMine(m.group), p=cbrPre(m.group);
  return `<button class="list-btn" data-a="cbrAsk">${I.star}申請回歸<span class="r">${w?"審核中":p?`${mdTxt(p.day)} 回歸`:""}</span></button>`; }
/* =========================================================
   管理員「補出道資料」：先出道、後補 MV 的團，出道宣傳（預告照、概念照、曲目表、專輯介紹…）後來再補
   ・當作出道那時候發的：照出道日往前排，不會洗到動態最上面
   ・存在 daisuki_dbfill；宣傳來源（promoSrcs）把它當成一筆出道
   ========================================================= */
const DF_KEY="daisuki_dbfill";
const getDf=()=>(S.get(DF_KEY,[])||[]).filter(x=>x&&groupOf(x.gid));
function dfDebutDay(gid){ const db=getDebut().find(x=>x.gid===gid&&x.day&&x.status!=="gone"), t=db?db.day:idTs(gid,/^g/); return t?dayStart(t):0; }   /* 出道日：跟新聞同一個（出道申請排的那天，沒有就用團建立那天），不是 MV 上傳那天 */
const dfMv=gid=>{ const so=dfDebutSong(gid), v=so&&songMv(so); return v&&v.mid?{mid:v.mid,thumb:v.thumb||""}:null; };
function dfDebutSong(gid){ const m=getMShow(), L=[...m.songs,...(m.ended||[])].filter(x=>x.gid===gid).sort((a,b)=>songRel(a)-songRel(b)); return L.find(x=>x.debut)||L[0]||null; }
function dfOpen(gid){ const x=getDf().find(y=>y.gid===gid), so=dfDebutSong(gid), v=so&&songMv(so), day=dfDebutDay(gid)||(so&&songRel(so)?dayStart(songRel(so)):0);
  const fy0=so?JSON.parse(JSON.stringify(fairyClips(so.id)||{})):{};
  ui.dbF={cb:true,fill:true,adm:true,gid,sid:so?so.id:"",base:x?JSON.parse(JSON.stringify(x)):null,title:x?x.title:(so?so.title:""),rtype:x?x.rtype||"":"",date:day?ymdIn(day):"",day,teaser:x?x.teaser||"":"",tx:x?[...(x.teasers||[])]:[],txP:[],mv:v&&v.mid?{mid:v.mid}:null,mvt:x?x.mvt||null:null,pr:{...(x?promoLoad(x.pr):promoLoad(null)),fy:{...fy0,...((x&&x.pr&&x.pr.fy)||{})}},mPrev:"",mtPrev:"",busy:""}; cbrForm(); }
function dfForm(){ const f=ui.dbF, gid=f.gid, G=GROUPS.filter(g=>g.id!=="tdm_g"&&dfDebutSong(g.id)&&!getDebut().some(d=>d.gid===g.id&&d.status==="ok"));
  dbPage("補出道資料","cbrDfSave",f,[
    ["藝人","選要補資料的 SOLOIST／團（要先有出道曲）",G.length?`<div class="chips wrap">${G.map(g=>`<button class="chip ${gid===g.id?"on":""}" data-a="cbrDfGid" data-v="${g.id}">${esc(g.name)}</button>`).join("")}</div>`:`<p class="dbx-d">還沒有已經出道的團</p>`],
    ["作品","出道專輯和出道曲",dbWorkF(f,"cbTitle","出道曲")],
    ["宣傳素材",`會當作出道那時候發的：照出道日 ${f.day?mdTxt(f.day):""} 往前排，不會出現在動態最上面`,dbPromoF(f,"")],
    ["結尾妖精",(groupOf(gid)||{}).solo?"放一段本人的結尾妖精，每個打歌節目都會播":"每位成員放一段，打歌時每個節目會揭曉",dbFairyF(f)],
    ["出道當天","",dbDayF(f,"出道")]]); }
function cbrForm(){ const f=ui.dbF; if(!f||!f.cb) return; if(f.fill) return dfForm(); const gid=f.gid, min=cbrMin(gid); f.tx=f.tx||[]; f.txP=f.txP||[];
  const tp=f.tPrev||f.teaser, t=tp?`<img src="${esc(tp)}" alt="">`:`<b>＋</b>`, vid=(v,pv)=>v?(pv?`<img src="${esc(pv)}" alt=""><i>▶</i>`:`<i>▶</i>`):`<b>＋</b>`;
  const tx=[1,2,3].map(i=>{ const u=f.txP[i-1]||f.tx[i-1]; return `<button class="db-slot t sm" data-a="dbTeaser" data-i="${i}" aria-label="Teaser 照片 ${i+1}">${u?`<img src="${esc(u)}" alt="">`:`<b>＋</b>`}</button>`; }).join("");
  const amin=f.adm?dayStart(grpFresh(gid)?Date.now():Date.now()+PRE_MIN):min;
  dbPage(f.adm?"新增回歸":f.editId?"修改回歸申請":"回歸申請","cbrSend",f,[
    ...(f.adm?[["藝人","要回歸的 SOLOIST／團",`<div class="chips wrap">${GROUPS.filter(g=>g.id!=="tdm_g").map(g=>`<button class="chip ${gid===g.id?"on":""}" data-a="cbrAdmGid" data-v="${g.id}">${esc(g.name)}</button>`).join("")}</div>`]]:[]),
    ["作品","這次回歸的專輯和主打歌",dbWorkF(f,"cbTitle","主打歌")],
    ["宣傳排程",f.adm?"儲存後照日期自動發；只有歌名是必填，其他有放才會發":"核准後會照日期自動發；回歸前 7 天開始",dbPromoF(f,`<span class="fs-f-lab">回歸日</span><input id="dbDate" class="a-nick-in" type="date" min="${ymdIn(f.adm?amin:min)}" value="${esc(f.date&&ymdTs(f.date)>=(f.adm?amin:min)?f.date:ymdIn(f.adm?amin:min))}">`)],
    ["結尾妖精","打歌時每週每個節目會揭曉一位",dbFairyF(f)],
    ["回歸當天","",dbDayF(f,"回歸")]]); }
const cbrMedia=x=>dbMedia({...x,id:"cbr_"+x.id});
/* 管理員：回歸申請 */
function cbrAdmHtml(){ const L=getCbr().slice().sort((a,b)=>b.ts-a.ts), W=L.filter(x=>x.status==="wait"), H=L.filter(x=>x.status!=="wait");
  const row=x=>{ const g=groupOf(x.gid)||{}, st=x.status==="ok"?["ok",`已排定・${mdTxt(x.day)}`]:x.status==="no"?["no","未通過"]:x.status==="wait"?["wait",`審核中・想在 ${mdTxt(x.day)} 回歸`]:["no","已撤回"], pr=x.pr||{};
    return `<div class="db2"><div class="db2-h"><span class="db-av" style="background:${grad(g.g||0)}">${esc((g.name||"?")[0])}</span><div class="db2-t"><b>${esc(g.name||"")}</b><small>${x.adm?"管理員排定":esc(x.byName||acctUser(x.by))+" 申請"}</small></div><span class="db2-st ${st[0]}">${st[1]}</span></div>
      <div class="db2-i"><span>《${esc(x.title)}》${x.rtype?" "+esc(x.rtype):""}</span>${pr.album?`<span>💿 ${esc(pr.album)}</span>`:""}<span>${coOf(x.gid)||"沒有公司"}</span><span>${ago(x.ts)} ${x.adm?"排定":"申請"}</span></div>
      ${cbrMedia(x)}
      ${x.status==="wait"?`<div class="db2-a"><button class="btn btn-sm btn-soft" data-a="cbrEdit" data-v="${x.id}">修改</button><button class="btn btn-sm btn-soft" data-a="cbrNo" data-v="${x.id}">不核准</button><button class="btn btn-sm btn-main" data-a="cbrOk" data-v="${x.id}">核准</button></div>`:""}</div>`; };
  return `<main class="page">${W.length?`<section class="card">${W.map(row).join("")}</section>`:`<div class="t-empty"><span class="t-empty-ico">${I.star}</span><p>目前沒有申請</p></div>`}${H.length?`<div class="section-h">紀錄</div><section class="card">${H.slice(0,30).map(row).join("")}</section>`:""}${muSchedHtml()}</main>`; }
const cbrEms=gid=>Object.keys(ACCOUNTS).filter(e=>{ const m=MEMBERS[(ACCOUNTS[e]||{}).member]; return m&&m.group===gid; });
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t||!/^cbr[A-Z]/.test(t.dataset.a)) return; const a=t.dataset.a, s=session()||{};
  if(a==="cbrAsk"){ const m=MEMBERS[s.member]; if(!m) return; const gid=m.group, w=cbrMine(gid), p=cbrPre(gid);
    if(w){ tieModal("申請回歸",`<span class="info-row"><em>歌名</em>《${esc(w.title)}》${w.rtype?`・${esc(w.rtype)}`:""}</span><span class="info-row"><em>回歸日</em>${mdTxt(w.day)}</span><span class="info-row"><em>狀態</em>審核中</span>${cbrMedia(w)}`,`${w.by===myEmail()?`<button class="t-mbtn" data-a="cbrCancel" data-v="${w.id}">撤回申請</button>`:""}<button class="t-mbtn main" data-a="tCloseLayer">好</button>`); hydrateMedia(layer); return; }
    if(p){ tieModal("回歸",`<span class="info-row"><em>歌名</em>《${esc(p.title)}》</span><span class="info-row"><em>回歸日</em>${mdTxt(p.day)}（D-${dLeft(p.day)}）</span>`,`<button class="t-mbtn main" data-a="tCloseLayer">好</button>`); return; }
    if(!ui.dbF||!ui.dbF.cb||ui.dbF.gid!==gid||ui.dbF.editId) ui.dbF={cb:true,gid,title:"",teaser:"",tPrev:"",mv:null,mPrev:"",busy:""}; cbrForm(); return; }
  if(a==="cbrEdit"){ const x=getCbr().find(y=>y.id===t.dataset.v); if(!x) return; ui.dbF={cb:true,editId:x.id,gid:x.gid,title:x.title,rtype:x.rtype||"",date:ymdIn(x.day),teaser:x.teaser||"",tx:[...(x.teasers||[])],txP:[],mv:x.mv,mvt:x.mvt,pr:promoLoad(x.pr),mPrev:"",mtPrev:"",busy:""}; cbrForm(); return; }
  if(a==="cbrRel"){ dbKeep(); const f=ui.dbF; if(!f) return; f.rtype=f.rtype===t.dataset.v?"":t.dataset.v; cbrForm(); return; }
  if(a==="cbrDfNew"){ if(!isAdminAcct()) return; const g=GROUPS.find(x=>x.id!=="tdm_g"&&dfDebutSong(x.id)&&!getDebut().some(d=>d.gid===x.id&&d.status==="ok")); if(!g){ toast("還沒有已經出道的團"); return; } const sg=selfGroup(); dfOpen(sg&&dfDebutSong(sg)&&!getDebut().some(d=>d.gid===sg&&d.status==="ok")?sg:g.id); return; }
  if(a==="cbrDfGid"){ if(ui.dbF&&ui.dbF.fill) dfOpen(t.dataset.v); return; }
  if(a==="cbrDfSave"){ dbKeep(); const f=ui.dbF; if(!f||!f.fill||f.busy) return; const title=String(f.title||"").trim(); if(!title){ toast("請輸入出道曲"); return; } if(!f.day){ toast("找不到出道日"); return; }
    const all=S.get(DF_KEY,[])||[], cur=all.find(x=>x&&x.gid===f.gid), mine={id:"df_"+f.gid,gid:f.gid,title,rtype:f.rtype||"",day:f.day,appr:f.day-PRE_ANN,teaser:f.teaser||"",teasers:(f.tx||[]).filter(Boolean),mvt:f.mvt||null,pr:promoClean(f.pr),ts:Date.now()};
    /* 同團的人一起補：只蓋掉「我這次改過的地方」，別人剛存的不會被我舊的畫面蓋回去 */
    let rec=mine; try{ if(cur){ const b=f.base||{}; rec=hbMerge(b,mine,cur); rec.ts=Date.now(); } }catch(e){ rec=mine; }
    S.set(DF_KEY,[...all.filter(x=>x&&x.gid!==f.gid),rec]);
    try{ const fy=(rec.pr||{}).fy||{}; if(f.sid&&Object.keys(fy).length){ const F=S.get(FAIRY_KEY,{})||{}, k="clip|"+f.sid; F[k]={...(F[k]||{}),...Object.fromEntries(Object.entries(fy).map(([m,r])=>{ const o={...r}; delete o._pv; return [m,o]; }))}; S.set(FAIRY_KEY,F); } }catch(e){}
    ui.dbF=null; layer.innerHTML=""; try{ OFM.t=0; OFS=0; }catch(e){} toast("已補上出道資料"); render(); return; }
  if(a==="cbrAdmNew"){ if(!isAdminAcct()) return; const g0=GROUPS.find(g=>g.id!=="tdm_g"); if(!g0){ toast("還沒有藝人"); return; } ui.dbF={cb:true,adm:true,gid:g0.id,title:"",teaser:"",tPrev:"",mv:null,mPrev:"",busy:""}; cbrForm(); return; }
  if(a==="cbrAdmGid"){ dbKeep(); const f=ui.dbF; if(!f||!f.adm) return; f.gid=t.dataset.v; cbrForm(); return; }
  if(a==="cbrSend"&&ui.dbF&&ui.dbF.adm){ dbKeep(); const f=ui.dbF; if(!isAdminAcct()) return; if(f.busy){ toast(f.busy); return; } const ti=(f.title||"").trim(), gid=f.gid, g=groupOf(gid); if(!g){ toast("請選藝人"); return; } if(!ti){ toast("請輸入歌名"); return; }
    const min=dayStart(grpFresh(gid)?Date.now():Date.now()+PRE_MIN); { const d0=ymdTs(f.date); if(!d0||d0<min) f.date=ymdIn(min); } const day=ymdTs(f.date);
    if(!f.teaser&&(f.tx||[]).some(Boolean)){ const i=f.tx.findIndex(Boolean); f.teaser=f.tx[i]; f.tx[i]=null; }
    const L=getCbr(), x={id:"cr"+Date.now(),gid,by:myEmail(),byName:"管理員",title:ti,rtype:f.rtype||"",...(f.au?{au:f.au}:{}),day,teaser:f.teaser||"",teasers:(f.tx||[]).filter(Boolean),mv:f.mv||null,mvt:f.mvt||null,pr:promoClean(f.pr),ts:Date.now(),status:"ok",done:Date.now(),adm:1}; L.push(x); S.set(CBR_KEY,L);
    const ms=getMShow(), p={id:"p"+Date.now(),gid,title:ti,...(x.rtype?{rtype:x.rtype}:{}),...(x.au?{au:x.au}:{}),day,req:x.id,...(x.mv?{mv:x.mv}:{}),...(x.mvt?{mvt:x.mvt}:{}),...(x.teaser?{teaser:x.teaser}:{})}; ms.pre=[...(ms.pre||[]),p]; S.set(K.mshow,ms); if(day-Date.now()<=PRE_ANN){ cbAnn(p); S.set(K.mshow,ms); }
    ui.dbF=null; layer.innerHTML=""; if(typeof preTick==="function") preTick(); render(); toast(`排好了，${mdTxt(day)} 回歸`); return; }
  if(a==="cbrSend"){ dbKeep(); const f=ui.dbF; if(!f||!f.cb) return; if(f.busy){ toast(f.busy); return; } const ti=(f.title||"").trim(), gid=f.gid;
    if(!ti){ toast("請輸入歌名"); return; } if(!f.editId&&banBlock(ti)) return; if(!f.editId&&cbrMine(gid)){ toast("這團已經有一筆在審核了"); return; }
    if(!f.rtype){ toast("請選擇發行型態"); return; } if(!f.mv){ toast("請放上 MV"); return; } if(!f.mvt){ toast("請放上 MV Teaser"); return; } { const pe=promoCheck(f); if(pe){ toast(pe); return; } }
    const min=cbrMin(gid); { const d0=ymdTs(f.date); if(!d0||d0<min) f.date=ymdIn(min); } const day=ymdTs(f.date);
    if(!f.teaser&&(f.tx||[]).some(Boolean)){ const i=f.tx.findIndex(Boolean); f.teaser=f.tx[i]; f.tx[i]=null; }
    if(f.editId){ const L=getCbr(), x=L.find(y=>y.id===f.editId); if(!x) return; Object.assign(x,{title:ti,rtype:f.rtype,day,teaser:f.teaser||"",teasers:(f.tx||[]).filter(Boolean),mv:f.mv,mvt:f.mvt,pr:promoClean(f.pr),edited:Date.now()}); S.set(CBR_KEY,L); ui.dbF=null; layer.innerHTML=""; render(); toast("已修改"); return; }
    const L=getCbr(); L.push({id:"cr"+Date.now(),gid,by:myEmail(),byName:stageNm(s.member),title:ti,rtype:f.rtype,...(f.au?{au:f.au}:{}),day,teaser:f.teaser||"",teasers:(f.tx||[]).filter(Boolean),mv:f.mv,mvt:f.mvt,pr:promoClean(f.pr),ts:Date.now(),status:"wait"}); S.set(CBR_KEY,L);
    ui.dbF=null; layer.innerHTML=""; render(); toast("已送出，等管理員核准"); return; }
  if(a==="cbrCancel"){ const L=getCbr(), x=L.find(y=>y.id===t.dataset.v); if(!x) return; x.status="gone"; S.set(CBR_KEY,L); layer.innerHTML=""; render(); toast("已撤回申請"); return; }
  if(a==="cbrOk"){ const L=getCbr(), x=L.find(y=>y.id===t.dataset.v); if(!x||x.status!=="wait") return; const g=groupOf(x.gid); if(!g){ toast("找不到這個團"); return; }
    const day=Math.max(x.day,dayStart(Date.now()+PRE_MIN)); x.day=day; x.status="ok"; x.done=Date.now(); S.set(CBR_KEY,L);
    const ms=getMShow(), p={id:"p"+Date.now(),gid:x.gid,title:x.title,...(x.rtype?{rtype:x.rtype}:{}),...(x.au?{au:x.au}:{}),day,req:x.id,...(x.mv?{mv:x.mv}:{}),...(x.mvt?{mvt:x.mvt}:{}),...(x.teaser?{teaser:x.teaser}:{})}; ms.pre=[...(ms.pre||[]),p]; S.set(K.mshow,ms); if(day-Date.now()<=PRE_ANN){ cbAnn(p); S.set(K.mshow,ms); }
    cbrEms(x.gid).forEach(e=>feedPush({kind:"core",self:true,text:`🎉 回歸申請通過了！《${x.title}》${mdTxt(day)} 回歸`},"u:"+e)); render(); toast(`已核准，${mdTxt(day)} 回歸`); return; }
  if(a==="cbrNo"){ const L=getCbr(), x=L.find(y=>y.id===t.dataset.v); if(!x) return; ask(`不核准《${x.title}》的回歸申請嗎？`,()=>{ x.status="no"; x.done=Date.now(); S.set(CBR_KEY,L); cbrEms(x.gid).forEach(e=>feedPush({kind:"core",self:true,text:`《${x.title}》的回歸申請沒有通過`},"u:"+e)); render(); }); return; }
});
/* 回歸那天：申請時放的 MV、MV Teaser 放進這團的影音 */
function cbrMvPublish(p){ try{ const g=groupOf(p.gid); if(!g) return; [[p.mv,"MV",`${g.name}｜《${p.title}》MV`],[p.mvt,"MV Teaser",`${g.name}｜《${p.title}》MV Teaser`]].forEach(([v,sec,title])=>{ if(!v||!v.mid) return; const V=S.get(K.vods,[])||[]; if(V.some(y=>y.mid===v.mid)) return;
    const VS=S.get(K.vsec,{})||{}; let s=(VS[p.gid]||[]).find(y=>y.title===sec); if(!s){ s={id:uid("s"),title:sec}; VS[p.gid]=[...(VS[p.gid]||[]),s]; S.set(K.vsec,VS); }
    S.set(K.vods,[...V,{id:uid("v"),gid:p.gid,sec:s.id,title,mid:v.mid,thumb:v.thumb,dur:v.dur||0,ts:Date.now(),views:0}]); }); }catch(e){} }

/* =========================================================
   打歌（改版）資料層
   ・投票：記在「哪個節目」投的（daisuki_ms_votes2：{週:{節目:{歌:票}}}），每個節目各自排名
   ・MV 愛心：每一支 MV 各自算、所有人加在一起（daisuki_mv_likes2：{影片:{誰:時間}}）
   ・分數＝投票 + 這週的專輯 + 這首歌 MV 的愛心 + 播放次數（比重先固定：MS_W）
   ・每個節目照播出時間自動結束：管理員的手機時間到就自動公布一位（管理員手動改過的就不動）
   ========================================================= */
const MSV2="daisuki_ms_votes2", MVL2="daisuki_mv_likes2";
const MS_W={vote:100,album:200,like:20,view:2};
/* 每個節目的比重不一樣（照真實節目：音源／專輯／投票／SNS 的百分比），除以五個節目的平均變成倍數 → 同一週不同節目可能是不同人拿一位 */
const MS_SP={ts:{view:40,album:10,vote:15,like:20},sc:{view:35,album:15,vote:20,like:10},mcd:{view:50,album:15,vote:15,like:10},mb:{view:40,album:20,vote:20,like:10},ink:{view:55,album:10,vote:15,like:20}};
const msW=show=>{ const P=MS_SP[show]; if(!P) return MS_W; const o={}; ["vote","album","like","view"].forEach(k=>{ const avg=Object.values(MS_SP).reduce((n,x)=>n+x[k],0)/5; o[k]=MS_W[k]*P[k]/avg; }); return o; };
const SHOW_END={ts:[2,18,0],sc:[3,18,0],mcd:[4,18,0],mb:[6,16,30],ink:[0,15,20]};   /* [星期, 時, 分] 照真實節目的播出時間 */
const showEndTs=(show,wk)=>{ const [d,h,m]=SHOW_END[show]||[0,20,0], t=wkDate(wk||curWeek()); t.setDate(t.getDate()+((d+6)%7)); t.setHours(h,m,0,0); return t.getTime(); };
const showEnded=(show,wk)=>Date.now()>=showEndTs(show,wk);
const showEndTxt=show=>{ const [d,h,m]=SHOW_END[show]||[0,20,0]; return `星期${WDAY[d]} ${pad(h)}:${pad(m)}`; };
const muLeft=ms=>{ const h=Math.floor(ms/36e5), mm=Math.floor(ms%36e5/6e4); return h>=24?`剩 ${Math.floor(h/24)} 天 ${h%24} 小時`:h?`剩 ${h} 小時 ${mm} 分`:`剩 ${Math.max(1,mm)} 分`; };
/* 影片：哪些是 MV；這首歌的 MV */
const vodSecT=v=>{ const L=(S.get(K.vsec,{})||{})[v.gid]||[]; return (L.find(x=>x.id===v.sec)||{}).title||""; };
/* MV 偵測：分區叫 MV／M/V／Music Video 都算；標題有 M/V、MV 也算（預告、幕後、練習不算） */
const isMvLabel=t=>/^\s*(official\s*)?(m\s*\/?\s*v|music\s*videos?|뮤직\s*비디오|音樂錄影帶)s?\s*$/i.test(String(t||""));
const MV_NOT=/teaser|預告|티저|behind|making|幕後|花絮|reaction|practice|練習|cover|翻唱|live|直拍|fancam/i;
const vodIsMV=v=>!!v&&!MV_NOT.test(v.title||"")&&(v.cat==="MV"||isMvLabel(vodSecT(v))||/(^|[^a-z])m\s*\/\s*v([^a-z]|$)|(^|[^a-z])mv([^a-z]|$)|music\s*video/i.test(v.title||""));
/* 從 MV 標題抓歌名：「HUSSEY (핫세) - SUPA DUA LUV M/V」→ SUPA DUA LUV；有《》『』「」“”'' 就拿括號裡的 */
function mvTitleOf(t){ t=String(t||"").trim(); if(!t) return "";
  const q=/《([^》]+)》/.exec(t)||/『([^』]+)』/.exec(t)||/「([^」]+)」/.exec(t)||/“([^”]+)”/.exec(t)||/"([^"]+)"/.exec(t)||/'([^']+)'\s*(?:\(|（|official|m\s*\/?\s*v|music|$)/i.exec(t); if(q) return q[1].trim();
  let x=t.replace(/[\(（\[【][^\)）\]】]*(m\s*\/?\s*v|music\s*video|official|teaser)[^\)）\]】]*[\)）\]】]/ig," ").replace(/\s*(official\s*)?(m\s*\/?\s*v|music\s*video)(\s*teaser\s*\d*)?\s*$/i,"").trim();
  const parts=x.split(/\s+[-–—_]\s+|\s*[｜|]\s*/).filter(y=>y.replace(/[\s\-–—~]/g,"")); if(parts.length>1) x=parts[parts.length-1];
  return x.replace(/^[\s\-–—~·・]+|[\s\-–—~·・]+$/g,"").trim(); }
function songMv(s){ if(!s) return null; const V=(S.get(K.vods,[])||[]).filter(v=>v.gid===s.gid&&vodIsMV(v)); const hit=V.find(v=>String(v.title||"").includes(s.title))||V.sort((a,b)=>(b.ts||0)-(a.ts||0))[0]; if(hit) return hit;
  /* MV 沒放在影音分區、只放在出道／回歸申請裡：也算 */
  try{ const R=[...(getDebut()||[]),...(getCbr()||[])].filter(x=>x&&x.gid===s.gid&&x.mv&&x.mv.mid), t=String(s.title||"").trim(), r=R.find(x=>t&&(String(x.song||x.title||"").trim()===t))||R.sort((a,b)=>(b.day||0)-(a.day||0))[0]; if(r) return {id:"rec_"+r.id,mid:r.mv.mid,thumb:r.mv.thumb||"",au:r.au||r.mv.au||"",gid:s.gid,title:s.title}; }catch(e){}
  return null; }
const mvLikesV=vid=>Object.keys(((S.get(MVL2,{})||{})[vid])||{}).length;
const mvLikedV=vid=>!!(((S.get(MVL2,{})||{})[vid])||{})[myId()];
function mvLikeToggle(vid){ const L=S.get(MVL2,{})||{}, me=myId(); if(!vid||!me) return false; const o={...(L[vid]||{})}; if(o[me]) delete o[me]; else o[me]=Date.now(); L[vid]=o; S.set(MVL2,L); return !!o[me]; }
const songMvLikes=s=>{ const v=songMv(s); return v?mvLikesV(v.id):0; };
const songViews=s=>{ const v=songMv(s); return v?(v.views||0):0; };
/* 投票 */
const showVotes=(sid,show,wk)=>{ wk=wk||curWeek(); if(String(sid).startsWith("demo_")) return 3+strHash(sid+show)%40+(((ui.dmV2||{})[show]||{})[sid]||0); return ((((S.get(MSV2,{})||{})[wk]||{})[show]||{})[sid])||0; };
const MSQ="daisuki_ms_seat";
function showSeat(sid,show){ const wk=curWeek(), me=myEmail(); if(!me) return 99; const Q=S.get(MSQ,{})||{}, o={...((((Q[wk]||{})[show])||{})[sid]||{})};
  if(!o[me]){ o[me]=Date.now(); const Q2={}; Object.keys(Q).sort().slice(-1).forEach(k=>{ if(k!==wk) Q2[k]=Q[k]; }); const W={...(Q[wk]||{})}; W[show]={...(W[show]||{}),[sid]:o}; Q2[wk]=W; S.set(MSQ,Q2); }
  return Object.entries(o).sort((a,b)=>a[1]-b[1]).findIndex(x=>x[0]===me); }
function addShowVote(sid,show){ const wk=curWeek(), V=S.get(MSV2,{})||{}; V[wk]={...(V[wk]||{})}; V[wk][show]={...(V[wk][show]||{})}; V[wk][show][sid]=(V[wk][show][sid]||0)+1; S.set(MSV2,V); }
/* 這個節目這週的分數 */
function showScore(sid,show,wk){ wk=wk||curWeek(); const s=songOf(sid); if(!s) return {votes:0,album:0,likes:0,views:0,total:0};
  const votes=showVotes(sid,show,wk), album=s.demo?strHash(sid)%6:albumSales(s.gid,wkDate(wk).getTime()), likes=s.demo?strHash(sid)%30:songMvLikes(s), views=s.demo?strHash(sid)%400:songViews(s);
  const W=msW(show); return {votes,album,likes,views,total:Math.round(votes*W.vote+album*W.album+likes*W.like+views*W.view)}; }
const promoSongs=()=>{ const d=MUS_DEMO(); return d.length?d:getMShow().songs.filter(x=>groupOf(x.gid)); };
function showRank(show,wk){ wk=wk||curWeek(); return promoSongs().filter(s=>s.demo||songActIn(s,show,wk)).map(s=>({s,sc:showScore(s.id,show,wk),cr:!s.demo&&crowned(s.id,show,wk)})).sort((a,b)=>b.sc.total-a.sc.total); }
/* 有排名週以來最近一個排名週（宣傳週要顯示上一個排名週的一位） */
function lastRankedWk(){ const w=getMShow().wins, ks=Object.keys(w).filter(k=>k<curWeek()&&ranked(k)&&Object.keys(w[k]||{}).length).sort(); return ks[ks.length-1]||null; }
/* 節目結束那一刻的分數（結算時記下來）：之後按讚、觀看還會長，但這週的排行和一位就以這份為準，不會「我比較高、一位卻是別人」 */
const muFin=(show,wk)=>((getMShow().fin||{})[wk]||{})[show]||null;
function muFinSave(show,wk,RK,NR){ const m=getMShow(); m.fin={...(m.fin||{})}; m.fin[wk]={...(m.fin[wk]||{}),[show]:{r:Object.fromEntries(RK.map(x=>[x.s.id,x.sc.total])),n:NR.map(n=>({name:n.name,title:n.title,total:n.total}))}}; S.set(K.mshow,m); }
/* 畫面用：結束了就拿結算當下的分數（還沒結算就照現在的） */
function muRankShown(show,wk,ended){ const R=showRank(show,wk), F=ended&&muFin(show,wk); if(!F) return {R,N:npcRivals(show,wk)};
  return {R:R.map(x=>({...x,sc:{...x.sc,total:F.r[x.s.id]!=null?F.r[x.s.id]:x.sc.total}})).sort((a,b)=>b.sc.total-a.sc.total),N:F.n||[]}; }
/* 自動結算：管理員的手機每分鐘看一次 */
function msAutoSettle(){ try{ if(!isAdminAcct()) return; if(HB_ON&&(HB.ver[K.mshow]==null)) return; const ms=getMShow(); if(!ms.songs.length) return; let n=0;
  [shiftWeek(curWeek(),-1),curWeek()].forEach(wk=>{ if(!ranked(wk)) return; SHOWS.forEach(sh=>{ const ws=(getMShow().wins[wk]||{}), man=((getMShow().manual||{})[wk]||{}); if(ws[sh.id]||man[sh.id]||!showEnded(sh.id,wk)) return;
    const RK=showRank(sh.id,wk), top=RK.find(x=>!x.cr&&x.sc.total>0), nw0=npcWon(sh.id,wk);
    if(nw0){ if(muFin(sh.id,wk)) return;
      /* 11/11 修：以前結算後，真歌的分數（按讚、觀看、專輯）還一直長，虛擬歌手的分數也重算 → 明明自己比較高，一位卻是別人。
         還沒有「結算當下的分數」的舊紀錄：真歌現在比虛擬歌手高 → 那次判錯了，改判給真歌；不然就把當時的結果記下來 */
      if(!top||top.sc.total<=nw0.total){ muFinSave(sh.id,wk,RK,[{name:nw0.name,title:nw0.title,total:nw0.total},...npcRivals(sh.id,wk).filter(n=>n.name!==nw0.name).map(n=>({...n,total:Math.min(n.total,nw0.total)}))]); return; }
      const m4=getMShow(); m4.npcWin={...(m4.npcWin||{})}; m4.npcWin[wk]={...(m4.npcWin[wk]||{})}; delete m4.npcWin[wk][sh.id]; S.set(K.mshow,m4); }
    const fix=nw0&&top?top.sc.total-1:Infinity;
    if(!top) return;
    const NR=npcRivals(sh.id,wk).map(n=>({...n,total:Math.min(n.total,fix)})), all=[...RK.map(x=>({id:x.s.id,t:x.sc.total})),...NR.map(n=>({id:"npc",t:n.total}))].sort((a,b)=>b.t-a.t), m3=getMShow(); m3.rk={...(m3.rk||{})}; m3.rk[wk]={...(m3.rk[wk]||{}),[sh.id]:Object.fromEntries(all.filter(x=>x.id!=="npc").map(x=>[x.id,all.indexOf(x)+1]))}; S.set(K.mshow,m3); muFinSave(sh.id,wk,RK,NR);
    const nb=NR[0]; if(nb&&nb.total>=top.sc.total){ const m2=getMShow(); m2.npcWin={...(m2.npcWin||{})}; m2.npcWin[wk]={...(m2.npcWin[wk]||{}),[sh.id]:{name:nb.name,title:nb.title,total:nb.total}}; S.set(K.mshow,m2); n++; return; }   /* 虛擬對手比較高：這週這個節目沒有人拿到一位 */
    setWinner(sh.id,top.s.id,wk); n++; }); });
  if(n) try{ render(); }catch(e){} }catch(e){} }
setInterval(msAutoSettle,60e3); setTimeout(msAutoSettle,12e3);
/* 這個月拿到的王座（五台冠軍、AK、PAK） */
function monthThrones(){ const mon=monthKey(Date.now()), inMon=wk=>monthKey(wkDate(wk).getTime()+3*864e5)===mon, out={five:[],ak:[],pak:[]}, m=getMShow();
  [...m.songs,...(m.ended||[])].forEach(s=>{ if(!groupOf(s.gid)) return; const st=songStats(s.id);
    if(st.five){ const seen=new Set(); let at=null; st.wins.slice().sort((a,b)=>a.wk<b.wk?-1:1).forEach(x=>{ seen.add(x.show); if(!at&&seen.size>=SHOWS.length) at=x.wk; }); if(at&&inMon(at)) out.five.push(s); }
    if(st.aks.some(inMon)) out.ak.push(s); if(st.pak&&inMon(st.pak)) out.pak.push(s); });
  return out; }

/* =========================================================
   粉絲：打歌頁（改版）
   ・上面：本週階段＋一句話＋規則
   ・三個王座：這個月的五台冠軍、AK、PAK
   ・五個節目各一個下拉模塊（每個長得不一樣）：收起來看目前第一名／一位，打開就能投票
   ========================================================= */
const MU_IC={
  i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 11v6"/><circle cx="12" cy="7.2" r=".6" fill="currentColor"/></svg>',
  five:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.6 9.1l5.8-.8z"/></svg>',
  ak:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 18h18l-1.5-10-4.5 4-3-7-3 7-4.5-4z"/></svg>',
  pak:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M9 3l3 18 3-18"/></svg>',
  crown:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 18h16l-1.5-9-4 3.5L12 6l-2.5 6.5-4-3.5z"/></svg>',
  cup:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6"/></svg>',
  chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  tk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/></svg>'};
const MU_SHN={ts:["THE","SHOW"],sc:["SHOW","CHAMPION"],mcd:["M","COUNTDOWN"],mb:["SHOW!","音樂中心"],ink:["INKI","GAYO"]};
const muVotedFor=show=>{ const k=myVoteKey(show); return musDemoOn()?(ui.dmMine||{})[k]:(S.get(K.msMine,{})||{})[k]; };
function viewPromo(){ setTimeout(muRevealAuto,700);
  const wk=curWeek(), dm=musDemoOn(), songs=promoSongs(), t=dm?"排名週":weekType(wk), rk=dm||ranked(wk), lr=rk?null:lastRankedWk(), open=ui.muOpen||{}, pro=[];
  const mod=sh=>{ const id=sh.id, ended=rk&&showEnded(id,wk), {R,N:NPCS}=muRankShown(id,wk,ended), won=songOf((getMShow().wins[wk]||{})[id]), voted=muVotedFor(id), [n1,n2]=MU_SHN[id]||[sh.name,""];
    let head="";
    if(!songs.length) head=`<span class="mu3-st muted">目前沒有打歌中的歌</span>`;
    else if(!rk){ const w=lr&&songOf((getMShow().wins[lr]||{})[id]); head=lr?(w?`<span class="mu3-lb">上個排名週一位</span>${muWho(w,true)}`:`<span class="mu3-st muted">上個排名週沒有一位</span>`):`<span class="mu3-st muted">宣傳週不排名</span>`; }
    else if(won) head=`<span class="mu3-lb">本週一位</span>${muWho(won,true)}<button class="mu3-rv" data-a="muReveal" data-v="${id}" data-w="${wk}">▶ 一位發表</button>`;
    else if(npcWon(id,wk)){ const nw=npcWon(id,wk); head=`<span class="mu3-lb">本週一位</span><span class="mu3-st">${esc(nw.name)}</span>`; }
    else if(!ended&&NPCS[0]&&(!R[0]||NPCS[0].total>R[0].sc.total)) head=`<span class="mu3-lb">目前第一名</span><span class="mu3-st">${esc(NPCS[0].name)}</span>`;
    else if(ended) head=`<span class="mu3-st muted">本週沒有一位</span>`;
    else head=R[0]&&R[0].sc.total>0?`<span class="mu3-lb">目前第一名</span>${muWho(R[0].s,false)}`:`<span class="mu3-st muted">還沒有人投票</span>`;
    const when=!rk?"":ended?`<em class="mu3-end">已結束</em>`:`<em class="mu3-end">${showEndTxt(id)} 結束・${muLeft(showEndTs(id,wk)-Date.now())}</em>`;
    const rows=R.map((x,i)=>{ const s=x.s, g=groupOf(s.gid), mine=voted===s.id, can=rk&&!ended&&!voted&&!x.cr&&!(won);
      const act=x.cr?`<span class="mu3-cr" aria-label="三冠王">${MU_IC.crown}</span>`:mine?`<span class="mu3-stamp ${ui.muStamp===id+s.id?"pop":""}">已投</span>`:can?`<button class="mu3-vote" data-a="muVote3" data-v="${s.id}" data-s="${id}">${MU_IC.tk}<span>投票</span></button>`:"";
      return {sc:x.sc.total,h:`<div class="mu3-r"><span class="mu3-n">#</span><button class="mu3-song" data-a="muFairy" data-v="${s.id}" data-s="${id}"><span class="mu2-cv">${songCover(s.gid,s.title)}</span><span class="mu3-t"><b>${esc(s.title)}</b><small>${esc(g?g.name:"")}</small></span></button><span class="mu3-sc">${rk?fmt(x.sc.total):fmt(x.sc.likes)+" ♡"}</span>${act}</div>`}; })
      .concat(rk&&R.length?NPCS.map(n=>({sc:n.total,h:`<div class="mu3-r npc"><span class="mu3-n">#</span><button class="mu3-song" data-a="muFairyNpc" data-n="${esc(n.name)}" data-t="${esc(n.title)}" data-s="${id}"><span class="mu2-cv npc">${esc(n.name[0])}</span><span class="mu3-t"><b>${esc(n.title)}</b><small>${esc(n.name)}</small></span></button><span class="mu3-sc">${fmt(n.total)}</span></div>`})):[])
      .sort((a,b)=>b.sc-a.sc).map((r,i)=>r.h.replace('<span class="mu3-n">#</span>',`<span class="mu3-n">${i+1}</span>`)).join("");
    return `<section class="mu3-sh s-${id} ${open[id]?"open":""}"><button class="mu3-hd" data-a="muShow" data-v="${id}" aria-expanded="${open[id]?"true":"false"}">
      <span class="mu3-nm"><b>${n1}</b><b>${n2}</b></span><span class="mu3-hr">${head}${when}</span><span class="mu3-chev">${MU_IC.chev}</span></button>
      <div class="mu3-bd">${voted&&rk&&!ended?`<p class="mu3-vt">今天投給了《${esc((songOf(voted)||{}).title||"")}》</p>`:""}${songs.length?rows:`<p class="me-none">目前沒有打歌中的歌</p>`}</div></section>`; };
  return coreHead("")+`<main class="page mu3">
    <section class="mu2-wk mu3-wk t-${t==="宣傳週"?"p":t==="打歌週"?"f":"r"}"><span class="mu2-chip">${esc(t)}</span><span class="mu2-wt"><b>${rk?(songs.length?"每個節目每天可以投 1 票":"目前沒有打歌中的歌"):"宣傳週不排名、不開放投票"}</b>${pro.length?`<small>${pro.map(x=>`${esc(songName(x))} ${Math.max(1,Math.ceil((songRel(x)+MSA.PROMO*MDAY-Date.now())/MDAY))} 天後開始排名`).join("・")}</small>`:""}</span>${(session()||{}).role!=="fan"?`<button class="mu3-i" data-a="coreTip" aria-label="規則">${MU_IC.i}</button>`:""}</section>
    ${muThrones()}
    <div class="mu2-h"><h3>音樂節目</h3></div>
    <div class="mu3-list">${SHOWS.map(mod).join("")}</div>
  </main>`; }
/* 三個王座（粉絲端、藝人端都看得到） */
function muThrones(){ const th=monthThrones(), thr=(k,l,ic)=>{ const L=th[k], s=L[0], g=s&&groupOf(s.gid); return `<div class="mu3-th ${s?"on":""}"><span class="mu3-thi">${MU_IC[ic]}</span><b>${l}</b>${s?`<span class="mu3-thw"><span class="mu2-cv sm">${songCover(s.gid,s.title)}</span><span><i>${esc(g?g.name:"")}</i><small>《${esc(s.title)}》</small></span></span>`:`<small class="mu3-empty">虛位以待</small>`}</div>`; };
  return `<div class="mu3-thr">${thr("five","五台冠軍","five")}${thr("ak","AK","ak")}${thr("pak","PAK","pak")}</div>`; }
const muWho=(s,win)=>{ const g=groupOf(s.gid); return `<span class="mu3-who ${win?"win":""}"><span class="mu2-cv sm">${songCover(s.gid,s.title)}</span><span><b>${esc(s.title)}</b><small>${esc(g?g.name:"")}</small></span>${win?`<span class="mu3-cup">${MU_IC.cup}</span>`:""}</span>`; };
/* 點歌：應援選單（買專輯、這首歌的 MV 愛心、My Pick） */
function openSongSheet(sid){ const s=songOf(sid); if(!s) return; const g=groupOf(s.gid), st=s.demo?{wins:[],five:0,aks:[],pak:0,crowns:[]}:songStats(s.id), wk=curWeek(), pick=S.get(K.pick,null), wkWins=st.wins.filter(x=>x.wk===wk).length, mv=songMv(s), own=owns(s.gid,"album");
  setLayer(`<div class="mu2-shw" data-a="tCloseLayer"><div class="mu2-sh" role="dialog" aria-label="應援"><span class="mu2-grab"></span>
    <div class="mu2-sht"><span class="mu2-cv lg">${songCover(s.gid,s.title)}</span><div><b>《${esc(s.title)}》</b><small>${esc(g?g.name:"")}${s.rtype?"・"+esc(s.rtype):""}</small></div></div>
    <div class="mu-tags">${wkWins?`<em class="w">本週 ${wkWins} 冠</em>`:""}${st.wins.length?`<em>一位 ×${st.wins.length}</em>`:`<em>衝刺第一個一位</em>`}${st.five?`<em class="g">五台冠軍</em>`:""}${st.aks.length?`<em class="g">AK${st.aks.length>1?" ×"+st.aks.length:""}</em>`:""}${st.pak?`<em class="g">PAK</em>`:""}${st.crowns.map(c=>`<em class="c">${SHOWS.find(x=>x.id===c).name} 三冠王</em>`).join("")}</div>
    <div class="mu2-act two"><button data-a="muAlbum" data-v="${s.gid}" class="${own?"done":""}" ${own?"disabled":""}><span>💿</span>${own?"已收藏":"買專輯"}</button>
      ${mv?`<button data-a="mvLikeV" data-v="${mv.id}" data-s="${s.id}" class="${mvLikedV(mv.id)?"on":""}"><span>${mvLikedV(mv.id)?"♥":"♡"}</span>MV ${fmt(mvLikesV(mv.id))}</button>`:`<button class="done" disabled><span>♡</span>還沒有 MV</button>`}</div>
    <button class="mu2-pick ${pick===s.gid?"on":""}" data-a="promoPick" data-v="${s.gid}" data-s="${s.id}">${pick===s.gid?"💜 這是我的 My Pick":"設為 My Pick"}</button></div></div>`,"musheet"); }
/* 規則：三張卡滑著看 */
function muRules(){ const wk0=curWeek(), d0=new Date(); d0.setDate(1); const W=[]; let k=weekKey(d0.getTime()); for(let i=0;i<6;i++){ const ms=wkDate(k); if(ms.getMonth()!==d0.getMonth()&&i>0&&monthKey(ms.getTime()+3*864e5)!==monthKey(d0.getTime())) break; W.push(k); k=shiftWeek(k,1); }
  const WS=W.filter(x=>monthKey(wkDate(x).getTime()+3*864e5)===monthKey(Date.now())), band=WS.map(x=>{ const t=weekType(x); return `<span class="t-${t==="宣傳週"?"p":t==="打歌週"?"f":"r"} ${x===wk0?"now":""}">${t.slice(0,2)}</span>`; }).join(""), here=WS.map(x=>`<span>${x===wk0?"▲ 你在這裡":""}</span>`).join("");
  const c1=`<div class="mur-c"><h4>週期</h4><div class="mur-band">${band.replace(/>(宣傳|排名|打歌)</g,(m0,x)=>`><b>${x}</b><`)}</div><div class="mur-here">${here}</div><p>每個月第一週是宣傳週，不排名；中間是排名週；最後一週是打歌週（月底決戰）。新歌 MV 公開就加入，打滿 4 週下檔，回歸時換成新歌。同一個節目參賽的歌不到 3 首時會有虛擬對手，分數要超過它們才拿得到一位。</p></div>`;
  const c2=`<div class="mur-c"><h4>怎麼幫偶像</h4><ul class="mur-w"><li><b>${MU_IC.tk}</b><span>投票</span><em>1 票 ≈ ${MS_W.vote} 分</em></li><li><b>💿</b><span>買專輯</span><em>1 張 ≈ ${MS_W.album} 分</em></li><li><b>♡</b><span>MV 愛心</span><em>1 顆 ≈ ${MS_W.like} 分</em></li><li><b>▶</b><span>看 MV</span><em>1 次 ≈ ${MS_W.view} 分</em></li></ul><p>每個節目比重不一樣：Show Champion 最看投票，人氣歌謠最看 MV 觀看，音樂中心專輯和投票也很重要，THE SHOW、人氣歌謠的 MV 愛心也很重要。每個節目每天可以投 1 票。節目播出時間一到就結束，分數最高的拿下一位。</p></div>`;
  const c3=`<div class="mur-c"><h4>獎勵</h4><ul class="mur-w"><li><b>${MU_IC.cup}</b><span>一位</span><em>+${fmt(MSP.win)}</em></li><li><b>${MU_IC.five}</b><span>五台冠軍</span><em>+${fmt(MSP.five)}</em></li><li><b>${MU_IC.ak}</b><span>AK</span><em>+${fmt(MSP.ak)}</em></li><li><b>${MU_IC.pak}</b><span>PAK</span><em>+${fmt(MSP.pak)}</em></li></ul><p>同一首歌在同一個節目連續三週一位＝三冠王，之後這個節目就不再列入一位候選。</p></div>`;
  tieModal("打歌規則",`<div class="mur" id="murS">${c1}${c2}${c3}</div><div class="mur-dots"><button class="on" data-a="murGo" data-v="0" aria-label="第 1 張"></button><button data-a="murGo" data-v="1" aria-label="第 2 張"></button><button data-a="murGo" data-v="2" aria-label="第 3 張"></button></div>`,`<button class="t-mbtn main" data-a="tCloseLayer">知道了</button>`,"mur-m");
  const sc=document.getElementById("murS"); if(!sc) return; const dots=()=>{ const i=Math.round(sc.scrollLeft/sc.clientWidth); document.querySelectorAll(".mur-dots button").forEach((d,j)=>d.classList.toggle("on",i===j)); };
  sc.addEventListener("scroll",dots,{passive:true});
  /* 有些 iPhone 在彈出視窗裡橫滑不動：自己判斷左右滑 */ let x0=null,y0=0; sc.addEventListener("touchstart",e=>{ x0=e.touches[0].clientX; y0=e.touches[0].clientY; },{passive:true}); sc.addEventListener("touchend",e=>{ if(x0==null) return; const dx=e.changedTouches[0].clientX-x0, dy=e.changedTouches[0].clientY-y0; x0=null; if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){ const i=Math.round(sc.scrollLeft/sc.clientWidth)+(dx<0?1:-1); murGo(i); } },{passive:true}); }
function murGo(i){ const sc=document.getElementById("murS"); if(!sc) return; i=Math.max(0,Math.min(2,i)); sc.scrollTo({left:i*sc.clientWidth,behavior:"smooth"}); document.querySelectorAll(".mur-dots button").forEach((d,j)=>d.classList.toggle("on",i===j)); }
/* 點擊 */
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a;
  if(a==="muShow"){ e.stopImmediatePropagation(); const id=t.dataset.v; ui.muOpen={...(ui.muOpen||{}),[id]:!(ui.muOpen||{})[id]}; const sec=t.closest(".mu3-sh"); if(sec){ sec.classList.toggle("open",!!ui.muOpen[id]); t.setAttribute("aria-expanded",ui.muOpen[id]?"true":"false"); } return; }
  if(a==="muVote3"){ e.stopImmediatePropagation(); if(meBlocked&&meBlocked()) return; const sid=t.dataset.v, sh=t.dataset.s, s=songOf(sid); if(!s) return; const k=myVoteKey(sh);
    if(muVotedFor(sh)) return; if(!s.demo&&showEnded(sh,curWeek())) return;
    const r=t.getBoundingClientRect(); let card=null;
    if(s.demo){ ui.dmMine={...(ui.dmMine||{}),[k]:sid}; ui.dmV2=ui.dmV2||{}; ui.dmV2[sh]={...(ui.dmV2[sh]||{}),[sid]:((ui.dmV2[sh]||{})[sid]||0)+1}; }
    else { const m=S.get(K.msMine,{}); m[k]=sid; S.set(K.msMine,m); addShowVote(sid,sh); const seat=showSeat(sid,sh); card=seat<3?giveMcCard(s.gid,sh):null; if(seat>=3&&seat<99) setTimeout(()=>toast("公放席滿了"),420); }
    const tk=document.createElement("span"); tk.className="mu3-fly"; tk.innerHTML=MU_IC.tk; tk.style.left=r.left+"px"; tk.style.top=r.top+"px"; document.body.appendChild(tk); setTimeout(()=>tk.remove(),700);   /* 投票券撕下來飛出去 */
    ui.muStamp=sh+sid; setTimeout(()=>{ const y=window.scrollY; render(); window.scrollTo(0,y); setTimeout(()=>{ ui.muStamp=null; },900); if(card||s.demo) muCardPop(card,sh,s); },380); return; }
  if(a==="murGo"){ e.stopImmediatePropagation(); murGo(+t.dataset.v); return; }
  if(a==="coreTip"&&route().p==="promo"){ e.stopImmediatePropagation(); muRules(); return; }
},true);
/* 拿到打歌節目卡：卡片翻出來 */
function muCardPop(cid,sh,s){ const nm=(SHOWS.find(x=>x.id===sh)||{}).name||""; const face=cid?itemFace(cid):`<span class="mu3-cdemo s-${sh}"><b>${esc(nm)}</b><small>${esc(groupOf(s.gid)?groupOf(s.gid).name:"")}</small></span>`;
  setLayer(`<div class="mu3-cpw" data-a="tCloseLayer"><div class="mu3-cp" role="dialog" aria-label="拿到公放卡"><div class="mu3-cf">${face}</div><b>搶到 ${esc(nm)} 公放席・拿到公放卡</b>${cid?`<button class="t-mbtn main" data-a="coreGo" data-v="cards">去卡冊看看</button>`:""}<button class="t-mbtn" data-a="tCloseLayer">好</button></div></div>`,"mucard"); }

/* =========================================================
   藝人：FOC 最上面「我的打歌」卡＋戰況頁（取代「榮譽與職務」）
   ========================================================= */
const grpSong=gid=>{ const m=getMShow(), on=m.songs.filter(s=>s.gid===gid).sort((a,b)=>songRel(b)-songRel(a))[0]; if(on) return on; const old=(m.ended||[]).filter(s=>s.gid===gid).sort((a,b)=>songRel(b)-songRel(a))[0]; if(old) return {...old,_done:1};
  const mv=(S.get(K.vods,[])||[]).filter(v=>v.gid===gid&&vodIsMV(v)).sort((a,b)=>(b.ts||0)-(a.ts||0))[0]; if(mv) return {id:"mv_"+mv.id,gid,title:mvTitleOf(mv.title)||"最新歌曲",_done:1};   /* 打歌開始前就出道的：放最新一支 MV 的歌名 */
  return MUS_DEMO().find(s=>s.gid===gid)||null; };
/* 這首歌在每個節目最後一次的名次（拿過一位就寫一位幾次） */
function songLastRk(sid,show){ const m=getMShow(), w=Object.keys(m.wins||{}).filter(k=>(m.wins[k]||{})[show]===sid).length; if(w) return {cls:"win",t:w>1?`一位 ×${w}`:"一位"}; const ks=Object.keys(m.rk||{}).sort().reverse(); for(const k of ks){ const r=((m.rk[k]||{})[show]||{})[sid]; if(r) return {cls:"end",t:`第 ${r} 名`}; } return {cls:"end",t:"—"}; }
/* 11/12：一首歌在某個節目排第幾＝粉絲看到的排行榜（真的歌＋虛擬對手、結束後用結算當下的分數）。
   FOC 小卡和「本週戰況」都用這一個，不會一個說第 2 名、一個說第 1 名 */
function songRankOf(sid,show,wk){ const ended=showEnded(show,wk), {R,N}=muRankShown(show,wk,ended);
  const all=[...R.map(x=>({sid:x.s.id,t:x.sc.total,x})),...(N||[]).map(n=>({sid:null,t:n.total,name:n.name}))].sort((a,b)=>b.t-a.t), i=all.findIndex(z=>z.sid===sid);
  return {all,i,me:i>=0?all[i].x:null,ended}; }
function muCell(s,show,wk){ if(s._done) return songLastRk(s.id,show); const rk=musDemoOn()||ranked(wk), won=(getMShow().wins[wk]||{})[show], {i,me,ended}=songRankOf(s.id,show,wk);
  if(!rk) return {cls:"off",t:"不排名"}; if(won===s.id) return {cls:"win",t:"一位"}; if(ended) return {cls:"end",t:i>=0?`第 ${i+1} 名`:"—"}; return {cls:"run",t:i>=0&&me&&me.sc.total>0?`第 ${i+1} 名`:"—"}; }
function artPromoCard(mid){ const gid=MEMBERS[mid].group, s=grpSong(gid), wk=curWeek(), wt=musDemoOn()?"排名週":weekType(wk);
  if(!s){ const p=cbrPre(gid), w=cbrMine(gid), mn=cbrMin(gid), cool=mn-PRE_MIN>Date.now()+864e5;
    return `<button class="foc-now mu4-card" data-a="focGo" data-v="honor"><span class="foc-ic">${FIC.stage}</span><span class="t"><b>${p?`《${esc(p.title)}》${mdTxt(p.day)} 回歸`:w?"回歸申請審核中":cool?"冷卻中":"可以申請回歸了"}</b><small>${p?`D-${dLeft(p.day)}`:w?`《${esc(w.title)}》・${mdTxt(w.day)}`:cool?`${mdTxt(mn-PRE_MIN)} 之後可以申請回歸`:"ME → 申請回歸"}</small></span></button>`; }
  return `<button class="mu4-card card" data-a="focGo" data-v="honor"><span class="mu4-top"><span class="mu2-cv">${songCover(gid)}</span><span class="mu4-ti"><b>《${esc(s.title)}》</b><small>${s._done?"打歌已結束・最後的成績":esc(wt)}${s.rtype?"・"+esc(s.rtype):""}</small></span><span class="mu4-go">›</span></span>
    <span class="mu4-strip">${SHOWS.map(x=>{ const c=muCell(s,x.id,wk); return `<span class="mu4-c ${c.cls}"><i>${(MU_SHN[x.id]||[x.name])[1]||x.name}</i><b>${c.cls==="win"?MU_IC.cup:""}${c.t}</b></span>`; }).join("")}</span></button>`; }
function artPromoPage(mid){ setTimeout(muRevealAuto,700); const gid=MEMBERS[mid].group, s=grpSong(gid), wk=curWeek(), rk=musDemoOn()||ranked(wk), mcs=mcShows(mid), m=getMShow(), now=new Date(), y=String(now.getFullYear()), mon=`${y}-${pad(now.getMonth()+1)}`;
  const sec=(h,b)=>`<div class="section-h">${h}</div>${b}`;
  let battle="";
  if(s&&rk){ const rows=SHOWS.map(x=>{ const {all,i,me,ended}=songRankOf(s.id,x.id,wk); return {x,R:all,i,me,won:(m.wins[wk]||{})[x.id],ended}; }), any=rows.find(r=>r.me);
    battle=sec("本週戰況",`<section class="card mu4-bt2">${any?`<div class="mu4-sh"><span>專輯<b>${fmt(any.me.sc.album)}</b></span><span>MV 愛心<b>${fmt(any.me.sc.likes)}</b></span><span>播放<b>${fmt(any.me.sc.views)}</b></span></div>`:""}
      ${rows.map(({x,R,i,me,won,ended})=>{ const gap=!me?"":i===0?(R[1]?`領先 ${fmt(me.sc.total-R[1].t)}`:"領先"):`差 ${fmt(R[0].t-me.sc.total)}`;
        return `<div class="mu4-l"><b class="mu4-ln">${x.name}</b>${me?`<span class="mu4-lr ${i===0?"top":""}">${i+1}</span><span class="mu4-ls"><b>${fmt(me.sc.total)} 分</b><small>票 ${fmt(me.sc.votes)}${won&&won!==s.id?"":"・"+gap}</small></span>`:`<span class="mu4-ls"><small>—</small></span>`}${won||(ended&&npcWon(x.id,wk))?`<button class="mu4-rv${won===s.id?" win":""}" data-a="muReveal" data-v="${x.id}" data-w="${wk}">${won===s.id?`${MU_IC.cup}一位`:"已結束"}<i>▶</i></button>`:`<em>${won===s.id?`${MU_IC.cup}一位`:ended?"已結束":muLeft(showEndTs(x.id,wk)-Date.now())}</em>`}</div>`;   /* 已公布的節目：點右邊就能重看一位發表 */ }).join("")}</section>`); }
  else if(s) battle=sec("本週戰況",`<section class="card"><p class="me-none">宣傳週不排名</p></section>`);
  let prog="";
  if(s){ const st=songStats(s.id), ks=Object.keys(m.wins).sort(), run3=sh=>{ let n=0; for(let i=ks.length-1;i>=0;i--){ const k=ks[i]; if(!ranked(k)) continue; if((m.wins[k]||{})[sh]===s.id) n++; else break; } return Math.min(3,n); };
    const pakRun=(()=>{ let n=0; for(let i=ks.length-1;i>=0;i--){ const k=ks[i]; if(!ranked(k)) continue; if(SHOWS.some(x=>(m.wins[k]||{})[x.id]===s.id)) n++; else break; } return Math.min(4,n); })(), akN=SHOWS.filter(x=>(m.wins[wk]||{})[x.id]===s.id).length;
    const bar=(l,n,max,on)=>`<div class="mu4-p ${on?"on":""}"><span>${l}</span><i><em style="width:${Math.round(n/max*100)}%"></em></i><b>${n} / ${max}</b></div>`;
    prog=`<section class="card mu4-pg">${bar("五台冠軍",st.shows.size,SHOWS.length,st.five)}${bar("AK（本週）",akN,SHOWS.length,st.aks.length)}${bar("PAK",pakRun,4,!!st.pak)}<div class="mu4-cr">${SHOWS.map(x=>{ const n=run3(x.id); return `<span class="${st.crowns.includes(x.id)?"on":""}"><i>${(MU_SHN[x.id]||[x.name])[1]||x.name}</i><b>${MU_IC.crown}</b><small>三冠王 ${n}/3</small></span>`; }).join("")}</div>@@AW@@</section>`; }
  /* 獎項收藏 */
  const all=[...m.songs,...(m.ended||[])].filter(x=>x.gid===gid), aw=[];
  all.forEach(x=>{ const st=songStats(x.id); st.wins.forEach(w=>aw.push({ic:"cup",t:`${(SHOWS.find(z=>z.id===w.show)||{}).name} 一位`,s:x.title,wk:w.wk})); if(st.five) aw.push({ic:"five",t:"五台冠軍",s:x.title,wk:st.wins[st.wins.length-1]&&st.wins[st.wins.length-1].wk}); st.aks.forEach(k=>aw.push({ic:"ak",t:"ALL-KILL",s:x.title,wk:k})); if(st.pak) aw.push({ic:"pak",t:"PAK",s:x.title,wk:st.pak}); st.crowns.forEach(c=>aw.push({ic:"crown",t:`${(SHOWS.find(z=>z.id===c)||{}).name} 三冠王`,s:x.title,wk:""})); });
  aw.sort((a,b)=>(b.wk||"")<(a.wk||"")?-1:1);
  const locked=[["five","五台冠軍"],["ak","ALL-KILL"],["pak","PAK"]].filter(([k])=>!aw.some(x=>x.ic===k));
  const awH=aw.length?`<div class="mu4-aws"><small>拿過的獎</small>${aw.map(x=>`<span class="mu4-awc">${MU_IC[x.ic]}<b>${esc(x.t)}</b><i>《${esc(x.s)}》</i></span>`).join("")}</div>`:"";
  prog=prog?sec("成績",prog.replace("@@AW@@",awH)):(aw.length?sec("成績",`<section class="card mu4-pg">${awH}</section>`):"");
  const mc=mcs.length?sec("MC",`<section class="card mu4-mc">${mcs.map(x=>`<div class="mu4-mr"><b>${x.name}</b><small>每週${WDAY[x.day]}</small></div>`).join("")}<p class="mu4-mp">每週 +${fmt(mcWeekly(mcs.length))} 積分</p></section>`):"";
  const top=`<div class="mu4-pt">${s?`<b>《${esc(s.title)}》</b>`:""}<small>打歌積分・這個月 ${fmt(groupMusicPts(gid,{year:mon}))}・今年 ${fmt(groupMusicPts(gid,{year:y}))}</small></div>`;
  return `<main class="page foc mu4">${top}${s?"":`<section class="card"><p class="me-none">現在沒有打歌中的歌</p></section>`}${battle}${fairyArtHtml(mid)}${prog}${mc}</main>`; }

/* =========================================================
   管理員：打歌（本週總覽＋改一位、計分方式、MC 表、打歌中的歌）
   ・一位照時間自動結算；管理員只在需要時改
   ・排定回歸搬到「回歸申請」頁
   ========================================================= */
function adminMusicHtml(){
  const ms=getMShow(), wk=ui.muWk||curWeek(), t=weekType(wk), ws=ms.wins[wk]||{}, man=(ms.manual||{})[wk]||{}, mon=monthKey(wkDate(wk).getTime()+3*864e5), mc=ms.mc[mon]||{}, d=wkDate(wk), e=new Date(d), op=ui.muAdmOpen||{}; e.setDate(e.getDate()+6);
  const ov=!ranked(wk)?`<p class="reach" style="margin:4px 2px 10px">宣傳週不排名，不用公布一位。</p>`:SHOWS.map(s=>{ const R=showRank(s.id,wk), w=songOf(ws[s.id]), ended=showEnded(s.id,wk);
      const st=w?(man[s.id]?"已公布（手動）":"已公布（自動）"):ended?"已結束・沒有一位":`進行中・${muLeft(showEndTs(s.id,wk)-Date.now())}`;
      return `<div class="mu5-s"><div class="mu5-sh"><b>${s.name}</b><small>${showEndTxt(s.id)}・${st}</small></div>
        ${w?`<div class="mu5-w">${MU_IC.cup}<b>${esc(songName(w))}</b></div>`:""}
        <div class="mu5-rk">${R.slice(0,5).map((x,i)=>`<div class="mu5-r"><span>${i+1}</span><b>${esc(songName(x.s))}${x.cr?" 👑":""}</b><em>${fmt(x.sc.total)}</em><small>票 ${fmt(x.sc.votes)}・專輯 ${fmt(x.sc.album)}・♡ ${fmt(x.sc.likes)}・▶ ${fmt(x.sc.views)}</small></div>`).join("")||`<p class="me-none">沒有打歌中的歌</p>`}</div>
        <button class="mu5-fix" data-a="muAdmFix" data-v="${s.id}">${op[s.id]?"收起":"改一位"}</button>
        ${op[s.id]?`<div class="chips mu-ch"><button class="chip ${ws[s.id]?"":"on"}" data-a="muWin" data-s="${s.id}" data-v="">未公布</button>${ms.songs.map(sg=>{ const cr=crowned(sg.id,s.id,wk); return `<button class="chip ${ws[s.id]===sg.id?"on":""}" data-a="muWin" data-s="${s.id}" data-v="${sg.id}" ${cr?"disabled":""}>${esc(groupOf(sg.gid)?groupOf(sg.gid).name:"")}${cr?" 👑":""}</button>`; }).join("")}</div>`:""}</div>`; }).join("");
  const rule=`<section class="card studio mu-adm"><div class="foc-cfg-h"><h3>計分方式</h3><span class="badge">固定</span></div><div class="mu5-rule"><span>投票 1 票 <b>${MS_W.vote}</b></span><span>專輯 1 張 <b>${MS_W.album}</b></span><span>MV 愛心 1 顆 <b>${MS_W.like}</b></span><span>MV 播放 1 次 <b>${MS_W.view}</b></span></div><p class="reach">每個節目比重不同（上面是平均值）：THE SHOW 音源40／專輯10／投票15／SNS20、Show Champion 35／15／20／10、M COUNTDOWN 50／15／15／10、Show! 音樂中心 40／20／20／10、人氣歌謠 55／10／15／20。每個節目播出時間一到自動結算，分數最高（不是三冠王）的拿一位。管理員改過的就不會再自動改。</p></section>`;
  const mct=`<section class="card studio mu-adm"><div class="foc-cfg-h"><h3>${mon.replace("-"," 年 ")} 月 MC</h3><span class="badge">每月輪替</span></div><div class="mu5-mc">${SHOWS.map(s=>`<button class="mu5-mcr" data-a="muMcEd" data-s="${s.id}" data-mon="${mon}"><b>${s.name}</b><span>${(mc[s.id]||[]).map(id=>esc(stageNm(id))).join("、")||"還沒排"}</span><i>›</i></button>`).join("")}</div></section>`;
  const songs=`<section class="card studio mu-adm"><div class="foc-cfg-h"><h3>打歌中的歌曲</h3><span class="badge">${ms.songs.length} 首</span></div>
    ${ms.songs.map(sg=>{ const t0=idTs(sg.id,/^s/), n=t0?Math.max(1,Math.floor((Date.now()-t0)/(7*864e5))+1):0, st=songStats(sg.id); return `<div class="mu-rr row"><span><b>${esc(songName(sg))}</b><small>${sg.debut?"出道曲・":""}${sg.rtype?esc(sg.rtype)+"・":""}${n?`第 ${n} 週・`:""}一位 ×${st.wins.length}・${fmt(st.pts)} 積分</small></span><button class="del" data-a="muSongDel" data-v="${sg.id}">結束打歌</button></div>`; }).join("")||`<p class="me-none">沒有打歌中的歌</p>`}
    <button class="btn btn-soft btn-block" style="margin-top:10px" data-a="uniGo" data-v="#/admin?tab=cbreq">回歸申請・排定回歸</button></section>`;
  return `<section class="card studio mu-adm"><div class="foc-cfg-h"><h3>本週總覽</h3><span class="badge">${esc(t)}</span></div>
    <div class="mu-wk"><button data-a="muWk" data-v="-1" aria-label="上一週">‹</button><b>${d.getMonth()+1}/${d.getDate()} – ${e.getMonth()+1}/${e.getDate()}${wk===curWeek()?"（本週）":""}</b><button data-a="muWk" data-v="1" aria-label="下一週" ${wk>=curWeek()?"disabled":""}>›</button></div>${ov}</section>${rule}${mct}${songs}`; }
/* 管理員：排定回歸（從打歌頁搬過來，放在回歸申請頁下面） */
function muSchedHtml(){ const ms=getMShow();
  return `<div class="section-h">管理員排定回歸</div><section class="card studio mu-adm">
    <button class="btn btn-main btn-block" data-a="cbrAdmNew">＋ 新增回歸</button><button class="btn btn-soft btn-block" style="margin-top:8px" data-a="cbrDfNew">＋ 補出道資料</button>
    ${(ms.pre||[]).length?`<div class="section-h">回歸預告</div>${ms.pre.map(p=>`<div class="mu-rr row"><span><b>${esc((groupOf(p.gid)||{}).name||"")}《${esc(p.title)}》</b><small>${p.rtype?esc(p.rtype)+"・":""}${mdTxt(p.day)} 回歸・D-${dLeft(p.day)}</small></span><button class="del" data-a="muPreDel" data-v="${p.id}">取消</button></div>`).join("")}`:""}</section>`; }
function muMcSheet(sh,mon){ const mc=(getMShow().mc[mon]||{})[sh]||[], arts=Object.keys(MEMBERS).filter(id=>!MEMBERS[id].official), s=SHOWS.find(x=>x.id===sh);
  tieModal(`${s?s.name:""} MC`,`<div class="chips wrap mu5-mcp">${arts.map(id=>`<button class="chip ${mc.includes(id)?"on":""}" data-a="muMcT" data-s="${sh}" data-v="${id}" data-mon="${mon}">${esc(stageNm(id))}</button>`).join("")||`<p class="me-none">還沒有藝人</p>`}</div>`,`<button class="t-mbtn main" data-a="tCloseLayer">好</button>`); }
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a;
  if(a==="muAdmFix"){ e.stopImmediatePropagation(); ui.muAdmOpen={...(ui.muAdmOpen||{}),[t.dataset.v]:!(ui.muAdmOpen||{})[t.dataset.v]}; lsRerender(); return; }
  if(a==="muMcEd"){ e.stopImmediatePropagation(); muMcSheet(t.dataset.s,t.dataset.mon); return; }
  if(a==="muMcT"){ e.stopImmediatePropagation(); const ms=getMShow(), mon=t.dataset.mon, sh=t.dataset.s, id=t.dataset.v; ms.mc[mon]={...(ms.mc[mon]||{})}; const l=ms.mc[mon][sh]||[]; ms.mc[mon][sh]=l.includes(id)?l.filter(x=>x!==id):[...l,id]; S.set(K.mshow,ms); t.classList.toggle("on"); lsRerender(); return; }
},true);
/* 觀看次數：實際播放滿 30 秒才算一次（影片不到 30 秒就看完才算） */
/* 自己的 MV、同團成員的 MV：看了不算觀看數（不然自己就能幫自己刷分）；粉絲重播不設上限 */
function vodSelfView(v){ try{ const g=selfGroup(); return !!(g&&g===v.gid); }catch(e){ return false; } }
function vodViewWatch(vid){ const v=document.getElementById("pvPlayer"); if(!v) return; let acc=0, last=null, done=false;
  const hit=()=>{ if(done) return; done=true; try{ const L=S.get(K.vods,[])||[], x=L.find(y=>y.id===vid); if(x&&vodSelfView(x)) return; if(x){ x.views=(x.views||0)+1; S.set(K.vods,L); } }catch(e){} };
  v.addEventListener("timeupdate",()=>{ const t=v.currentTime; if(last!=null&&t>last&&t-last<1.5&&!v.paused) acc+=t-last; last=t; if(acc>=30) hit(); });
  v.addEventListener("seeking",()=>{ last=null; });
  v.addEventListener("ended",()=>{ if(v.duration&&v.duration<30&&acc>=v.duration*.8) hit(); }); }

/* =========================================================
   結尾妖精（ending fairy）
   ・真實的結尾妖精：每個舞台結束時，鏡頭特寫「一位」成員
   ・所以這裡：每首打歌中的歌，每個節目每週只有一位結尾妖精（一個欄位）
   ・團體：App 看這團有幾位成員，每週每個節目自動抽一位；被抽到的人上傳照片或影片，上傳就加分（機率、分數待討論）
   ・SOLOIST：不用抽，固定是本人（她說 SOLOIST 不用管）
   ・粉絲在節目模塊裡點歌：全螢幕播這首歌這個節目這週的結尾妖精
   ・資料 daisuki_fairy：{"週|節目|歌":{s0:{m,v,th,by,ts}}}
   ========================================================= */
const FAIRY_KEY="daisuki_fairy";



/* 11/10 她定的玩法：
   ・成員有幾位就有幾個欄位，每位成員都先放好自己的結尾妖精片段（約 3 秒，只能放人設的）
   ・每週每個節目播出時才揭曉這週是誰，之前大家都不知道是不是自己；被抽到的加分（機率、分數待討論，現在平均抽、+FAIRY_BONUS）
   ・SOLOIST 不用管：一格，永遠是本人，不抽也不加分 */
const FAIRY_BONUS=200, FAIRY_P=.3, FAIRY_CAP=3, FAIRY_MAX_SEC=5;   /* 她 11/10 定：每位成員各自 30%、沒人中就補抽 1 位、最多 3 位一起、一位 +200 */
const fairyClips=sid=>((S.get(FAIRY_KEY,{})||{})["clip|"+sid])||{};
const fairyMemsOf=sid=>{ const so=songOf(sid); return so?groupArtists(so.gid).slice().sort():[]; };
/* 發行當天就把整個打歌期（MSA.END 天）每一個打歌舞台的結尾妖精全部抽好、存在後台；
   每個節目照真實播出的星期幾、時間才公布（例：星期四回歸 → 先公布當天 M COUNTDOWN，接著星期五 MUSIC BANK、星期日 INKIGAYO、下週二 THE SHOW…） */
const fairyPlanK=sid=>"plan|"+sid;
function fairyStages(rel){ const L=[], end=rel+MSA.END*864e5; for(let d=new Date(rel);d.getTime()<end+7*864e5;d.setDate(d.getDate()+1)){ SHOWS.forEach(sh=>{ const [wd,h,mi]=SHOW_END[sh.id]||[sh.day,18,0]; if(d.getDay()!==wd) return; const t=new Date(d); t.setHours(h,mi,0,0); const ts=t.getTime(); if(ts>=rel&&ts<end) L.push({show:sh.id,ts}); }); } return L.sort((a,b)=>a.ts-b.ts); }
function fairyMakePlan(so){ const mems=fairyMemsOf(so.id); if(!mems.length) return null; const C=fairyClips(so.id), pool=mems.filter(m=>C[m]).length?mems.filter(m=>C[m]):mems, rel=songRel(so)||Date.now();
  return fairyStages(rel).map(st=>{ let ms=pool.filter(()=>Math.random()<FAIRY_P); if(!ms.length) ms=[pool[Math.floor(Math.random()*pool.length)]]; if(ms.length>FAIRY_CAP) ms=ms.sort(()=>Math.random()-.5).slice(0,FAIRY_CAP); return {...st,mids:ms}; }); }
const stMids=st=>st?(st.mids||(st.mid?[st.mid]:[])):[];
const fairyPlan=sid=>((S.get(FAIRY_KEY,{})||{})[fairyPlanK(sid)])||null;
function fairyEnsurePlan(so){ if(!so||so.demo) return null; const F=S.get(FAIRY_KEY,{})||{}, k=fairyPlanK(so.id); if(F[k]) return F[k]; if(!isAdminAcct()) return null; const P=fairyMakePlan(so); if(!P) return null; F[k]=P; S.set(FAIRY_KEY,F); return P; }
/* 這週這個節目的結尾妖精：還沒播出 → ""（誰都不知道）；播出了才看得到 */
function fairyStage(sid,show,wk){ wk=wk||curWeek(); const P=fairyPlan(sid)||[]; return P.find(x=>x.show===show&&weekKey(x.ts)===wk)||null; }
function fairyWhoL(sid,show,wk,force){ const st=fairyStage(sid,show,wk); if(!st) return []; if(!force&&Date.now()<st.ts) return []; return stMids(st); }






/* 管理員：歌一開始打就把計畫存好；每個舞台播出時間到了，團體被抽到的人加分、通知 */
function fairyDrawTick(){ try{ if(!isAdminAcct()) return; if(HB_ON&&(HB.ver[K.mshow]==null||HB.ver[K.ptGrants]==null)) return; const now=Date.now(); let G=null;
  (getMShow().songs||[]).forEach(so=>{ if(so.demo) return; const P=fairyEnsurePlan(so); if(!P) return; const g=groupOf(so.gid)||{}; if(g.solo||groupArtists(so.gid).length<2) return;
    P.filter(st=>st.ts<=now).forEach(st=>stMids(st).forEach(mid=>{ G=G||(S.get(K.ptGrants,[])||[]).slice(); const gid=`fyw_${so.id}_${st.show}_${st.ts}_${mid}`, old=`fyw_${so.id}_${st.show}_${st.ts}`; if(G.some(x=>x.id===gid||(x.id===old&&x.mid===mid))) return; const sh=SHOWS.find(x=>x.id===st.show)||{};
      G.push({id:gid,to:"art:"+mid,mid,n:FAIRY_BONUS,art:1,why:`${sh.name||""} 結尾妖精`,by:"auto",ts:now});
      Object.keys(ACCOUNTS).filter(e=>(ACCOUNTS[e]||{}).member===mid).forEach(e=>feedPush({kind:"core",self:true,text:`🧚 今天 ${sh.name||""} 的結尾妖精是你！+${fmt(FAIRY_BONUS)} 積分`},"u:"+e)); })); });
  if(G&&G.length!==(S.get(K.ptGrants,[])||[]).length) S.set(K.ptGrants,G); }catch(e){} }
setInterval(fairyDrawTick,60e3); setTimeout(fairyDrawTick,12e3);

/* 上傳一段結尾妖精片段（影片，約 3 秒，最多 FAIRY_MAX_SEC 秒）→ {m,v:1,th,dur} */
async function fairyUploadFile(f){ const th=await videoThumb(f); const dur=th&&th.dur||0; if(dur>FAIRY_MAX_SEC+.5){ toast(`最多 ${FAIRY_MAX_SEC} 秒`); return null; }
  const id="fy"+Date.now().toString(36)+Math.random().toString(36).slice(2,4); let thumb="", pv="";
  if(th&&th.blob){ const tb=await shrinkImg(th.blob,800); pv=URL.createObjectURL(tb); thumb=(HB_ON&&await hbImgUrl(id+"_t.jpg",tb))||""; }
  if(!await hbUpload(id,f)){ toast("影片沒有上傳成功，請再試一次"); return null; } memBlobs[id]=f; return {m:id,v:1,th:thumb,dur,ts:Date.now(),_pv:pv}; }
function fairySetClips(sid,M){ const F=S.get(FAIRY_KEY,{})||{}, k="clip|"+sid, o={...(F[k]||{})}; Object.keys(M).forEach(m=>{ const r={...M[m]}; delete r._pv; if(!o[m]) o[m]=r; }); F[k]=o; S.set(FAIRY_KEY,F); }
function fairyPickFile(cb){ const inp=document.createElement("input"); inp.type="file"; inp.accept="video/*"; inp.onchange=()=>{ const f=inp.files&&inp.files[0]; if(f) cb(f); }; pickClick(inp); }
/* 自動結尾妖精畫面：舞台燈光＋藝人照片慢慢推近＋閃光＋節目字卡（沒有片段、還沒揭曉、虛擬歌手都用這個） */
const FY_C={ts:["#FF8A00","#FF3D6E"],sc:["#FF4FA3","#7B5CFF"],mcd:["#00C2FF","#7A3CFF"],mb:["#FFC83D","#FF4141"],ink:["#3DDC97","#2E7BFF"]};
function fyStage(F,it){ const sh=SHOWS.find(x=>x.id===F.show)||{}, c=FY_C[F.show]||["#B794FF","#FF6FA8"], s=F.s, g=F.g||{};
  const mid=it&&it.mid&&MEMBERS[it.mid]?it.mid:"", gid=(it&&it.gid)||s.gid||"";
  const ph=it?(mid?(mPhoto(mid)||(artProf(mid)||{}).avatar||""):"")||(gid?gPhoto(gid):"")||(gid?albCov(gid,s.title):""):"";
  const name=it?(mid?stageNm(mid):(it.name||g.name||"")):"";
  const sp=Array.from({length:14},(_,i)=>{ const h=strHash(F.show+i+name); return `<i style="left:${h%100}%;top:${(h>>>7)%100}%;animation-delay:${((h>>>3)%30)/10}s;--z:${.5+((h>>>11)%10)/10}"></i>`; }).join("");
  const wait=!it, when=wait&&F.wait?`${mdTxt(F.wait)}（${WDAY[new Date(F.wait).getDay()]}）${hm(F.wait)}`:"";
  /* 11/12：SOLO（團裡只有一位）不用猜：還沒播也直接顯示她 */
  const solo=wait&&gid?(()=>{ const L=grpMembers(gid).filter(x=>MEMBERS[x]&&!MEMBERS[x].official); return L.length===1?L[0]:""; })():"";
  if(solo) return `<div class="fya ph wait solo" style="--c1:${c[0]};--c2:${c[1]}">
    ${(()=>{ const p2=mPhoto(solo)||(artProf(solo)||{}).avatar||gPhoto(gid)||""; return p2?`<span class="fya-ph" style="background-image:url('${esc(p2)}')"></span>`:`<span class="fya-mono">${esc((stageNm(solo)||"?").slice(0,1).toUpperCase())}</span>`; })()}
    <i class="fya-beam b1"></i><i class="fya-beam b2"></i><i class="fya-beam b3"></i><span class="fya-sp">${sp}</span><span class="fya-vg"></span>
    <span class="fya-logo">${esc(sh.name||"")}</span>
    <div class="fya-tag"><em>這週的結尾妖精</em><b>${esc(stageNm(solo))}</b><small>${when?esc(when)+" 播出・":""}結尾妖精畫面節目播出後就看得到 🧚</small></div></div>`;
  return `<div class="fya ${ph?"ph":"no"} ${wait?"wait":""}" style="--c1:${c[0]};--c2:${c[1]}">
    ${ph?`<span class="fya-ph" style="background-image:url('${esc(ph)}')"></span>`:`<span class="fya-mono">${esc(wait?"?":(name||"?").slice(0,1).toUpperCase())}</span>`}
    <i class="fya-beam b1"></i><i class="fya-beam b2"></i><i class="fya-beam b3"></i><span class="fya-sp">${sp}</span><span class="fya-vg"></span>
    <span class="fya-logo">${esc(sh.name||"")}</span>${wait?"":`<span class="fya-live"><i></i>ENDING FAIRY</span>`}
    <div class="fya-tag">${wait?`<em>這週的結尾妖精</em><b>${when?esc(when)+" 揭曉":"播出後揭曉"}</b><small>節目播出時才知道是誰 🧚</small>`:`<em>${esc(sh.name||"")} · ENDING FAIRY</em><b>${esc(name)}</b><small>《${esc(s.title||"")}》</small>`}</div></div>`; }
/* 粉絲：點歌 → 全螢幕播結尾妖精 */
let FV=null;
async function fairyView(sid,show,from,npc){ const s=npc?{id:"npc",title:npc.title,gid:"",npc:1}:songOf(sid); if(!s) return; const g=npc?{name:npc.name,g:strHash(npc.name)%8}:groupOf(s.gid), sh=SHOWS.find(x=>x.id===show)||{}, wk=curWeek();
  /* 誰是結尾妖精：有片段播片段；沒放片段（結尾妖精上線前出道的、虛擬歌手）就用自動做的舞台畫面，不會空空的 */
  let L=[], wait=0;
  if(npc){ if(!showEnded(show,wk)) wait=showEndTs(show,wk); else L=[{auto:1,name:npc.name}]; }
  else { const st=fairyStage(sid,show,wk), aired=st?Date.now()>=st.ts:showEnded(show,wk), C=fairyClips(sid);
    if(!aired&&!s.demo) wait=st?st.ts:showEndTs(show,wk);
    else { let mids=st?stMids(st):[]; if(!mids.length&&(g&&g.solo||s.demo)) mids=groupArtists(s.gid).slice(0,1); if(!mids.length) mids=fairyWhoL(sid,show,wk,true);
      L=mids.length?mids.map(m=>C[m]?{mid:m,...C[m]}:{mid:m,auto:1}):[{auto:1,gid:s.gid}]; } }
  fairyClose(1); const ov=document.createElement("div"); ov.className="fv2 s-"+show; ov.setAttribute("role","dialog"); ov.setAttribute("aria-label","結尾妖精");
  ov.innerHTML=`<div class="fv2-bg" data-a="fvClose"></div><div class="fv2-box"><div class="fv2-card"><div class="fv2-st" id="fvSt"></div>${L.length>1&&!(g&&g.solo)?`<button class="fv2-prev" data-a="fvPrev" aria-label="上一位"></button><button class="fv2-next" data-a="fvNext" aria-label="下一位"></button>`:""}<i class="fv2-prog"><em id="fvProg"></em></i></div>
    <div class="fv2-ti"><span class="mu2-cv sm${npc?" npc":""}">${npc?esc(String(npc.name||"?")[0]):songCover(s.gid,s.title)}</span><span><b>${esc(s.title)}</b><small>${esc(g?g.name:"")}・${esc(sh.name||"")} 結尾妖精</small></span><button class="fv2-x" data-a="fvClose" aria-label="關閉">${XI}</button></div></div>`;
  document.body.appendChild(ov); document.documentElement.classList.add("fv-lock"); FV={s,g,show,L,wait,i:-1,t:0,au:null,ov,from,t0:Date.now(),dur:s.demo||npc?20:30};
  const c=ov.querySelector(".fv2-card"), r=c.getBoundingClientRect(), f=from&&from.isConnected?from.getBoundingClientRect():null;
  if(f&&r.width){ c.style.transform=`translate(${f.left-r.left}px,${f.top-r.top}px) scale(${f.width/r.width},${f.height/r.height})`; c.getBoundingClientRect(); }
  requestAnimationFrame(()=>{ ov.classList.add("on"); c.style.transform=""; });
  fairyTick(); FV.t=setInterval(fairyTick,200);
  /* 歌放多久，結尾妖精就播多久：歌的長度平分給每一位妖精 */
  try{ const b=npc?null:await songAudio(s); if(b&&FV&&FV.s===s){ const a=new Audio(URL.createObjectURL(b)); a.playsInline=true; FV.au=a;
      a.addEventListener("loadedmetadata",()=>{ if(FV&&FV.au===a&&isFinite(a.duration)&&a.duration>3){ FV.dur=a.duration; } });
      a.addEventListener("ended",()=>{ if(FV&&FV.au===a) fairyClose(); });
      a.play().then(()=>{ if(FV&&FV.au===a) FV.t0=Date.now()-a.currentTime*1000; }).catch(()=>{}); fairyMute(); } }catch(e){} }
function fairyMute(){ document.querySelectorAll("#fvSt video").forEach(v=>{ v.muted=!!(FV&&FV.au); }); }
/* 現在播到第幾秒 → 換到第幾位妖精；最下面一條細細的進度 */
function fairyTick(){ if(!FV) return; const a=FV.au, sec=a&&!a.paused&&a.currentTime>0?a.currentTime:(Date.now()-FV.t0)/1000, n=Math.max(1,FV.L.length), seg=FV.dur/n;
  const p=document.getElementById("fvProg"); if(p) p.style.width=Math.min(100,sec/FV.dur*100)+"%";
  if(sec>=FV.dur+.3&&!(a&&!a.paused)){ fairyClose(); return; }
  const m=FV.man, i=m?((m.i+Math.floor((sec-m.at)/seg))%n+n)%n:Math.min(n-1,Math.floor(sec/seg)); if(i!==FV.i){ FV.i=i; fairyShow(); } }
/* 團體：點左右兩邊換上一位／下一位（歌照常放，不會重新開始） */
function fairyGo(d){ if(!FV||FV.L.length<2) return; const n=FV.L.length, a=FV.au, sec=a&&!a.paused&&a.currentTime>0?a.currentTime:(Date.now()-FV.t0)/1000; FV.man={i:((FV.i+d)%n+n)%n,at:sec}; FV.i=FV.man.i; fairyShow(); }
function fairyShow(){ if(!FV) return; const st=document.getElementById("fvSt"); if(!st){ fairyStop(); return; } const it=FV.L[FV.i];
  const nm=it&&MEMBERS[it.mid]?stageNm(it.mid):"";
  if(!it){ st.innerHTML=fyStage(FV,null); return; }
  const box=document.createElement("div"); box.className="fv2-l";
  if(it.auto||it.demo) box.innerHTML=fyStage(FV,it);
  else if(it.v){ box.innerHTML=`<video playsinline autoplay loop ${FV.au?"muted":""}></video><span class="fv-nm">${esc(nm)}</span>`; const v=box.querySelector("video"); mediaSrc(it.m).then(u=>{ if(u&&v.isConnected){ v.src=u; v.play().catch(()=>{}); } }); }
  else box.innerHTML=`<img src="${esc(it.m)}" alt=""><span class="fv-nm">${esc(nm)}</span>`;
  st.appendChild(box); requestAnimationFrame(()=>box.classList.add("on"));   /* 淡入，舊的淡出後拿掉 */
  [...st.children].filter(x=>x!==box).forEach(x=>{ x.classList.remove("on"); setTimeout(()=>{ const v=x.querySelector("video"); if(v){ try{ v.pause(); v.removeAttribute("src"); v.load(); }catch(e){} } x.remove(); },500); }); }
function fairyStop(){ if(!FV) return; clearInterval(FV.t); try{ if(FV.au){ FV.au.pause(); FV.au.src=""; } }catch(e){} const v=FV.ov&&FV.ov.querySelector("video"); if(v){ try{ v.pause(); v.removeAttribute("src"); v.load(); }catch(e){} } }
function fairyClose(now){ if(!FV) return; const {ov,from}=FV; fairyStop(); FV=null; document.documentElement.classList.remove("fv-lock"); if(!ov) return;
  if(now){ ov.remove(); return; } const c=ov.querySelector(".fv2-card"), r=c.getBoundingClientRect(), f=from&&from.isConnected?from.getBoundingClientRect():null;
  ov.classList.remove("on"); ov.classList.add("off"); if(f&&r.width) c.style.transform=`translate(${f.left-r.left}px,${f.top-r.top}px) scale(${f.width/r.width},${f.height/r.height})`;
  setTimeout(()=>ov.remove(),420); }
/* 打開時背景不能滑 */
document.addEventListener("touchmove",e=>{ if(FV&&FV.ov&&e.cancelable) e.preventDefault(); },{passive:false,capture:true});
document.addEventListener("wheel",e=>{ if(FV&&FV.ov) e.preventDefault(); },{passive:false,capture:true});
/* 離開 App／換分頁就關掉，不背景播放 */
document.addEventListener("visibilitychange",()=>{ if(document.hidden) fairyClose(1); });
window.addEventListener("pagehide",()=>fairyClose(1)); window.addEventListener("hashchange",()=>fairyClose(1));
/* 藝人：打歌戰況裡上傳自己的結尾妖精 */
const fairyThumb=(c,lab,act,mine)=>`<button class="fy-s ${c?"on":""} ${mine?"me":""}" ${act?act:"disabled"} aria-label="${esc(lab)} 的結尾妖精">${c?`${c._pv||c.th?`<img src="${esc(c._pv||c.th)}" alt="">`:""}<i>▶</i>`:`<b>＋</b>`}<em>${esc(lab)}</em></button>`;
/* 打歌戰況：只看結尾妖精揭曉結果（片段在出道／回歸申請頁放；SOLOIST 不顯示） */
function fairyArtHtml(mid){ const gid=MEMBERS[mid].group, s=grpSong(gid); if(!s||s._done||s.demo) return ""; const g=groupOf(gid)||{};
  /* 補救：結尾妖精上線前就出道的歌，自己補放一段（SOLOIST 也可以；沒放的話打歌時會用自動舞台畫面） */
  const mine=fairyClips(s.id)[mid], solo=g.solo||groupArtists(gid).length<2;
  const up=`<section class="card fy-fix"><div class="fy-fix-r">${fairyThumb(mine,mine?"換一段":"放片段",`data-a="fyUp" data-v="${esc(mid)}"`,true)}<div class="fy-fix-t"><b>${mine?"你的結尾妖精放好了":"補放你的結尾妖精"}</b><small>《${esc(s.title)}》・影片最多 ${FAIRY_MAX_SEC} 秒・只能放人設的片段</small><small>${mine?"點左邊可以換一段。":"這首歌在結尾妖精上線前就發行了，現在放好，下一場打歌就會播出；沒放的話會用自動的舞台畫面。"}</small></div></div></section>`;
  if(solo) return `<div class="section-h fy-hh">結尾妖精<button class="i-tip" data-a="fyInfo" aria-label="結尾妖精說明">i</button></div>${up}`;
  const upG=mine?"":up;
  const P=fairyPlan(s.id); if(!P) return upG?`<div class="section-h fy-hh">結尾妖精<button class="i-tip" data-a="fyInfo" aria-label="結尾妖精說明">i</button></div>${upG}`:""; const now=Date.now(), past=P.filter(x=>x.ts<=now).slice(-3), next=P.filter(x=>x.ts>now).slice(0,4), nm=x=>(SHOWS.find(y=>y.id===x.show)||{}).name||"", dt=t=>`${mdTxt(t)}（${WDAY[new Date(t).getDay()]}）${hm(t)}`;
  const who=x=>{ const L=stMids(x); return L.length?(L.includes(mid)?"🧚 你！"+(L.length>1?`＋${L.filter(m=>m!==mid).map(m=>esc(stageNm(m))).join("、")}`:""):L.map(m=>esc(stageNm(m))).join("、")):"—"; };
  const nx=next[0];
  return `<div class="section-h fy-hh">結尾妖精<button class="i-tip" data-a="fyInfo" aria-label="結尾妖精說明">i</button></div>${upG}
    <section class="card fy-a"><details class="fy-dt"><summary><span>${nx?`下一場：${nm(nx)}・${dt(nx.ts)} 揭曉`:"這次打歌的結尾妖精都揭曉了"}</span>${past.length?`<i>看結果</i>`:""}</summary>${past.length?`<div class="fy-res">${past.map(x=>`<div class="fy-rr done"><b>${nm(x)}<small> ${mdTxt(x.ts)}</small></b><span>${who(x)}</span></div>`).join("")}</div>`:""}</details></section>`; }
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a;
  if(a==="muFairy"){ e.stopImmediatePropagation(); fairyView(t.dataset.v,t.dataset.s,t.closest(".mu3-r")||t); return; }
  if(a==="muFairyNpc"){ e.stopImmediatePropagation(); fairyView("",t.dataset.s,t.closest(".mu3-r")||t,{name:t.dataset.n,title:t.dataset.t}); return; }
  if(a==="fvNext"||a==="fvPrev"){ e.stopImmediatePropagation(); fairyGo(a==="fvNext"?1:-1); return; }
  if(a==="fvClose"){ e.stopImmediatePropagation(); fairyClose(); return; }
  if(a==="fyInfo"){ e.stopImmediatePropagation(); tieModal("結尾妖精",`<p class="fy-info">音樂節目的舞台最後，鏡頭會特寫成員大約 3 秒，這就是結尾妖精，有時候是一位，有時候是兩三位一起。<br><br>結尾妖精片段在申請出道／回歸時放好（影片，最多 ${FAIRY_MAX_SEC} 秒）。<br>⚠️ 只能放<b>人設（皮相）</b>的結尾妖精片段，不能放自己或其他人。<br><br>每個節目播出時才會揭曉，被選中的成員會有獎勵 🧚</p>`,`<button class="t-mbtn main" data-a="tCloseLayer">知道了</button>`); return; }
  if(a==="fyUp"){ e.stopImmediatePropagation(); const s0=session()||{}, me=s0.member, who=t.dataset.v; if(!who||!MEMBERS[who]) return; if(who!==me&&!isAdminAcct()) return; const s=grpSong(MEMBERS[who].group); if(!s||s.demo||s._done) return;
    fairyPickFile(async f=>{ toast("上傳中…"); try{ const rec=await fairyUploadFile(f); if(!rec) return; delete rec._pv; const F=S.get(FAIRY_KEY,{})||{}, k="clip|"+s.id; F[k]={...(F[k]||{}),[who]:rec}; S.set(FAIRY_KEY,F); lsRerender(); toast("結尾妖精放好了"); }catch(err){ toast("上傳失敗，請再試一次"); } }); return; }
},true);

/* =========================================================
   打歌的歌的音樂：直接用 MV 轉成純音樂（不另外上傳音檔；比放整支影片省流量）
   ・回歸／出道申請放 MV 的那一刻，在藝人自己的手機上就順便轉好（song.au）
   ・以前的歌：管理員打開 App 時在背後一首一首補轉
   ・轉法：讀出 MV 的聲音 → 44.1kHz 立體聲 → MP3 128kbps（11/11 起；以前是單聲道 22kHz 64kbps，音質差）
   ========================================================= */
async function mvToAudio(blob){ try{ if(!blob||blob.size>200*1024*1024) return null; const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return null; const c=new AC(); let buf;
    try{ try{ buf=await decodeAu(c,await blob.arrayBuffer()); }catch(e){ buf=null; } if(!(buf&&buf.duration)){ const am=await MB.audio(blob); if(am&&am.blob.size) buf=await decodeAu(c,await am.blob.arrayBuffer()); } } finally{ try{ c.close(); }catch(e){} } if(!buf) return null;   /* iPhone .MOV 直接解不出來：先用 mediabunny 取出聲音 */
    const sr=44100, len=Math.min(buf.duration,360), OC=window.OfflineAudioContext||window.webkitOfflineAudioContext, oc=new OC(2,Math.ceil(len*sr),sr), s=oc.createBufferSource(); s.buffer=buf; s.connect(oc.destination); s.start(0,0,len);
    const out=await new Promise((res,rej)=>{ oc.oncomplete=e=>res(e.renderedBuffer); const p=oc.startRendering(); if(p&&p.then) p.then(res,rej); });
    return (await mp3Of(out))||await compactWav(out); }catch(e){ return null; } }
async function mvAudioUpload(blob){ const a=await mvToAudio(blob); if(!a) return ""; const id="mva"+Date.now().toString(36); await MDB.put(id,a,true); return (await hbUpload(id,a))?id:""; }
/* 這首歌的音樂（song.au＞演唱會音檔） */
async function songAudio(s){ if(!s) return null; if(s.au){ const b=await MDB.get(s.au); if(b) return b; } return await auGet(s.id); }
/* 歌還沒有音訊：直接從這首歌的 MV 取出聲音（誰先用到就誰轉，轉好存起來大家共用） */


/* 歌換成新音檔後：申請紀錄裡的舊代號也換掉，舊檔從 R2 刪掉（只有管理員刪得掉；其他歌還在用就不刪） */
function songAuDrop(old,id){ try{ if(!old||old===id||!/^mva[0-9a-z]+$/.test(old)) return;
    [[CBR_KEY,S.get(CBR_KEY,[])||[]],[K.debut,S.get(K.debut,[])||[]]].forEach(([k,L])=>{ let ch=false; (L||[]).forEach(x=>{ if(x&&x.au===old){ x.au=id; ch=true; } if(x&&x.mv&&x.mv.au===old){ x.mv.au=id; ch=true; } }); if(ch) S.set(k,L); });
    const m=getMShow(); if([...m.songs,...(m.ended||[]),...(m.pre||[])].some(y=>y&&y.au===old)) return;
    if(!isAdminAcct()||!HB_ON||!HB.tok||!MEDIA_URL) return; fetch(MEDIA_URL+"/media/"+encodeURIComponent(old),{method:"DELETE",headers:{Authorization:"Bearer "+HB.tok}}).catch(()=>{}); }catch(e){} }
function songAuSet(sid,id){ try{ const m=getMShow(), x=[...m.songs,...(m.ended||[])].find(y=>y.id===sid); if(x&&x.au!==id){ const old=x.au; x.au=id; x.auV=2; delete x.auNo; S.set(K.mshow,m); songAuDrop(old,id); } }catch(e){} }
/* 管理員：以前的歌補轉（一次一首；失敗的 12 小時後再試，不會永遠卡住） */
let muAuBusy=false;
async function muAudioJob(){ if(muAuBusy||!isAdminAcct()||(HB_ON&&HB.ver[K.mshow]==null)) return; const ms=getMShow(), now0=Date.now(), s=ms.songs.find(x=>(!x.au||x.auV!==2)&&(!x.auNo||(x.auNo>1e12&&now0-x.auNo>12*36e5))&&songMv(x)&&songMv(x).mid); if(!s) return; muAuBusy=true;
  try{ const v=songMv(s), b=await MDB.get(v.mid), id=b?await mvAudioUpload(b):""; const m2=getMShow(), x=m2.songs.find(y=>y.id===s.id); if(x){ const old=x.au; if(id){ x.au=id; x.auV=2; delete x.auNo; } else x.auNo=Date.now(); S.set(K.mshow,m2); if(id) songAuDrop(old,id); } }catch(e){} muAuBusy=false; }
setInterval(muAudioJob,5*60e3); setTimeout(muAudioJob,40e3);

/* =========================================================
   團體 TIE 券：SHOP 裡一個團只有一種「團體券」
   ・先選幾人券（1 人～全團人數，不會出現比成員還多的人數）和天數
   ・再選是哪幾位成員（剛好選滿人數）→ 一次買好
   ========================================================= */
function tgSheet(){ const T=ui.tg; if(!T) return; const g=groupOf(T.gid), A=groupArtists(T.gid), pl=PLANS.find(x=>x.id===T.plan)||PLANS[1]; T.n=Math.min(Math.max(1,T.n),A.length);
  if(T.step!==2){
    setLayer(`<div class="scrim" data-a="tCloseLayer"><div class="sheet tg-sh" role="dialog" aria-label="購買團體 TIE 券"><div class="grab"></div>
      <div class="buy-h"><div class="av g-ico" style="background:${grad(g.g)}">${gIcoIn(g)}</div><div><h3>${WHISPER_NAME} 券・${esc(g.name)}</h3><p>${A.length} 位成員</p></div></div>
      <span class="tg-lab">幾人券</span><div class="tg-n">${A.map((_,i)=>`<button class="${T.n===i+1?"on":""}" data-a="tgN" data-v="${i+1}">${i+1} 人</button>`).join("")}</div>
      <span class="tg-lab">天數</span><div class="plans">${PLANS.map(x=>`<button class="plan ${T.plan===x.id?"on":""}" data-a="tgPlan" data-v="${x.id}"><b>${x.name}</b><span>每人 ${fmt(x.pts)} 積分</span></button>`).join("")}</div>
      <button class="btn btn-main btn-block" data-a="tgNext">選擇 ${T.n} 位成員</button><p class="buy-pts">目前積分 ${fmt(points())}</p></div></div>`,"buy"); return; }
  const sel=T.sel.filter(id=>A.includes(id)), tot=sel.reduce((n,id)=>n+planPts(id,pl),0), needNick=sel.some(id=>!(S.get(K.tieSet,{})[id]||{}).nickname);
  setLayer(`<div class="scrim" data-a="tCloseLayer"><div class="sheet tg-sh" role="dialog" aria-label="選擇成員"><div class="grab"></div>
    <div class="tg-hd"><button class="icon-btn" data-a="tgBack" aria-label="上一步">${I.back}</button><b>選 ${T.n} 位成員</b><span>${sel.length} / ${T.n}</span></div>
    <div class="tg-grid">${A.map(id=>{ const on=sel.includes(id), act=isActive(id); return `<button class="tg-m ${on?"on":""}" data-a="tgPick" data-v="${id}"><span class="av" style="background:${grad(MEMBERS[id].g)}">${mAvIn(id,"tie")}</span><b>${esc(stageNm(id))}</b><small>${act?"訂閱中":""}</small><i>${on?"✓":""}</i></button>`; }).join("")}</div>
    ${needNick&&sel.length?`<label class="buy-nick"><span>你的暱稱</span><input id="tgNick" maxlength="12" placeholder="輸入文字" value="${esc(T.nick||"")}"></label>`:""}
    <button class="btn btn-main btn-block" data-a="tgBuy" ${sel.length===T.n?"":"disabled"}>${sel.length===T.n?(tot?`用 ${fmt(tot)} 積分購買（${pl.name}）`:"免費訂閱"):`還要再選 ${T.n-sel.length} 位`}</button><p class="buy-pts">目前積分 ${fmt(points())}</p></div></div>`,"buy"); }
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t||!/^tg[A-Z]/.test(t.dataset.a)) return; e.stopImmediatePropagation(); const T=ui.tg; if(!T) return; const a=t.dataset.a;
  const keepNick=()=>{ const n=document.getElementById("tgNick"); if(n) T.nick=n.value; };
  if(a==="tgN"){ T.n=+t.dataset.v; T.sel=T.sel.slice(0,T.n); tgSheet(); return; }
  if(a==="tgPlan"){ T.plan=t.dataset.v; tgSheet(); return; }
  if(a==="tgNext"){ T.step=2; tgSheet(); return; }
  if(a==="tgBack"){ keepNick(); T.step=1; tgSheet(); return; }
  if(a==="tgPick"){ keepNick(); const id=t.dataset.v, i=T.sel.indexOf(id); if(i>=0) T.sel.splice(i,1); else if(T.sel.length<T.n) T.sel.push(id); else { T.sel.shift(); T.sel.push(id); } tgSheet(); return; }
  if(a==="tgBuy"){ keepNick(); const pl=PLANS.find(x=>x.id===T.plan)||PLANS[1], sel=T.sel; if(sel.length!==T.n) return; const tot=sel.reduce((n,id)=>n+planPts(id,pl),0);
    if(points()<tot){ toast("積分不足，先補充積分吧"); return; }
    const nick=(T.nick||"").trim(); if(sel.some(id=>!(S.get(K.tieSet,{})[id]||{}).nickname)){ if(!nick){ toast("請先設定你的暱稱"); const n=document.getElementById("tgNick"); if(n) n.focus(); return; } if(nameBlock(nick)) return; }
    sel.forEach(id=>{ if(nick&&!(S.get(K.tieSet,{})[id]||{}).nickname) saveTieSet(id,{nickname:nick}); buyTie(id,pl.days,planPts(id,pl)); });
    const g=groupOf(T.gid); ui.tg=null; layer.innerHTML=""; render(); toast(`已訂閱 ${g?g.name:""} ${sel.length} 位成員的 TIE（${pl.name}）💜`); return; }
},true);
/* ===== 一位發表動畫：照各節目真的結算畫面（她給的影片）
   ・THE SHOW：黑底螢光綠，三組照片＋彩色名條，下面一行一行跳分數
   ・Show Champion：先 TOP 5，再「WHO'S CHAMPION」，兩組對決
   ・M COUNTDOWN：兩組照片中間大 VS，黃色名條，分數在中間
   ・Show! 音樂中心：白底三張卡，每張卡有封面、歌名、自己的細項
   ・人氣歌謠：上面三組封面，下面藍色表格，左邊寫項目和比重，最後跳「1位」
   分數照實（A）：每一項就是 App 裡真的數據照比重換算，不補、不平均 */
const MUR={ts:{n:3,max:10000,rows:[["音源＋專輯分數",[0,1]],["SNS 分數",[3]],["即時投票",[2]]]},
  sc:{n:2,max:10000,top5:1,rows:[["音源",[0]],["專輯",[1]],["粉絲投票",[2]],["SNS",[3]]]},
  mcd:{n:2,max:11000,rows:[["音源分數",[0]],["專輯分數",[1]],["SNS 分數",[3]],["粉絲投票",[2]]]},
  mb:{n:3,max:10000,rows:[["音源＋專輯",[0,1]],["影片＋SNS",[3]],["粉絲投票",[2]]]},
  ink:{n:3,max:11000,win1:1,rows:[["音源 55%",[0]],["SNS 20%",[3]],["投票 15%",[2]],["專輯 10%",[1]]]}};
function muRevealCands(show,wk){ const cf=MUR[show], {R,N}=muRankShown(show,wk,true), wid=(getMShow().wins[wk]||{})[show], W=msW(show), SP=MS_SP[show]||{view:1,album:1,vote:1,like:1};
  let C=R.map(x=>{ const s=x.s, g=groupOf(s.gid)||{}; return {name:songName(s).replace(/^.*《(.*)》$/,"$1"),art:g.name||"",cov:songCover(s.gid,s.title),total:x.sc.total,p:[x.sc.views*W.view,x.sc.album*W.album,x.sc.votes*W.vote,x.sc.likes*W.like],win:s.id===wid}; })
    .concat((N||[]).map(x=>({name:x.title,art:x.name,cov:"",total:x.total,p:[SP.view,SP.album,SP.vote,SP.like].map((r,i)=>r*(1+((strHash(x.name+i)%30)-15)/100)),win:false})));
  C.sort((a,b)=>(b.win-a.win)||(b.total-a.total)); const pool=C.slice(0,Math.max(5,cf.n)); C=C.slice(0,cf.n); const top=Math.max(1,...C.map(c=>c.total));
  C.forEach(c=>{ const T=Math.round(c.total/top*cf.max*.9), ps=c.p.reduce((a,b)=>a+b,0)||1; c.v=c.p.map(x=>Math.round(x/ps*T)); c.rv=cf.rows.map(([,ix])=>ix.reduce((n,i)=>n+c.v[i],0)); c.T=c.rv.reduce((a,b)=>a+b,0); });
  return {C,pool}; }
function muRevealOpen(show,wk){ const cf=MUR[show]; if(!cf) return; wk=wk||curWeek(); const {C,pool}=muRevealCands(show,wk); if(!C.length) return;
  const best=Math.max(...C.map(c=>c.T)), ord=[...C].sort((a,b)=>strHash(a.name)-strHash(b.name)), hasW=C.some(c=>c.win), wn=c=>(hasW?c.win:c.T===best)?" win":"", R=cf.rows;   /* 一位照正式結算的結果（管理員手動改過也照那個），沒有紀錄才看分數 */
  const ph=c=>`<div class="mrv-ph" style="--hu:${strHash(c.art+c.name)%360}">${c.cov||`<span>${esc((c.art||"?").slice(0,1))}</span>`}</div>`;
  const em=(c,i)=>`<em data-to="${c.rv[i]}" data-r="${i}" class="${wn(c)}">&nbsp;</em>`, tot=c=>`<strong data-to="${c.T}" class="${wn(c)}">&nbsp;</strong>`, cw=`<i class="mrv-crown">👑</i>`;
  let body="";
  if(show==="ts") body=`<div class="mrv-mq"><span>${"YOUR MOMENT. SET IN MOTION ✦ ".repeat(8)}</span></div><div class="mrv-tslogo">THE<br>SHOW.</div><h2 class="mrv-tsh">THE SHOW. CHOICE</h2>
    <div class="mrv-g3">${ord.map(c=>`<div class="mrv-tl${wn(c)}">${ph(c)}<b>${esc(c.art)}</b>${cw}</div>`).join("")}</div>
    ${R.map(([l],i)=>`<div class="mrv-row"><span>${l}</span><div class="mrv-g3">${ord.map(c=>em(c,i)).join("")}</div></div>`).join("")}<div class="mrv-g3 mrv-tot">${ord.map(tot).join("")}</div>`;
  else if(show==="mcd"){ const [a,b]=ord; body=`<i class="mrv-d d1"></i><i class="mrv-d d2"></i><i class="mrv-d d3"></i><i class="mrv-d d4">✕</i><div class="mrv-mclogo">M<br>COUNT<br>DOWN</div>
    <div class="mrv-mcf"><div class="mrv-tl${wn(a)}">${ph(a)}${cw}</div><div class="mrv-tl${wn(b)}">${ph(b)}${cw}</div><b class="mrv-vsb">VS</b></div>
    <div class="mrv-mcn">${[a,b].map(c=>`<div class="${wn(c)}"><b>${esc(c.art)}</b><small>${esc(c.name)}</small></div>`).join("")}</div>
    <div class="mrv-mct">${R.map(([l],i)=>`<div class="mrv-r">${em(a,i)}<span>${l}</span>${em(b,i)}</div>`).join("")}<div class="mrv-r t">${tot(a)}<span>最終合計</span>${tot(b)}</div></div>`; }
  else if(show==="ink") body=`<div class="mrv-ik"><div class="mrv-iklogo"><b>人氣<br>歌謠</b><u>1</u></div>${ord.map(c=>`<div class="mrv-tl${wn(c)}">${ph(c)}<p><b>${esc(c.art)}</b><small>${esc(c.name)}</small></p>${cw}</div>`).join("")}
    ${R.map(([l],i)=>`<span class="mrv-pill${i?"":" f"}">${l}</span>${ord.map(c=>em(c,i)).join("")}`).join("")}<span class="mrv-pill t">總分</span>${ord.map(tot).join("")}</div>`;
  else if(show==="mb") body=`<i class="mrv-d m1">♡</i><i class="mrv-d m2">♪</i><i class="mrv-d m3">☁</i><i class="mrv-d m4">♡</i><div class="mrv-mblogo">SHOW!<b>音樂中心</b></div>
    <div class="mrv-g3">${ord.map(c=>`<div class="mrv-cd${wn(c)}">${ph(c)}<div class="mrv-cdn"><i>♪</i><p><b>${esc(c.name)}</b><small>${esc(c.art)}</small></p></div><div class="mrv-cdb">${R.map(([l],i)=>`<div><span>${l}</span>${em(c,i)}</div>`).join("")}</div><div class="mrv-cdb t"><div><span>最終合計</span>${tot(c)}</div></div>${cw}</div>`).join("")}</div>`;
  else { const [a,b]=ord; body=`<div class="mrv-sclogo">SHOW<br>CHAMPION</div><div class="mrv-sc2">${[a,b].map(c=>`<div class="mrv-tl${wn(c)}">${ph(c)}<b>${esc(c.name)}</b><small>${esc(c.art)}</small>${cw}</div>`).join("")}<b class="mrv-vsb">VS</b></div>
    <div class="mrv-sct">${R.map(([l],i)=>`<div class="mrv-r">${em(a,i)}<span>${l}</span>${em(b,i)}</div>`).join("")}<div class="mrv-r t">${tot(a)}<span>TOTAL</span>${tot(b)}</div></div>`; }
  const intro=cf.top5?`<div class="mrv-top5"><div class="mrv-t5p"><h3>TOP ${Math.min(5,pool.length)}</h3><div>${pool.slice(0,5).map(c=>`<div class="mrv-tl">${ph(c)}<b>${esc(c.name)}</b><small>${esc(c.art)}</small></div>`).join("")}</div></div><b class="mrv-who">WHO'S<br>CHAMPION?</b></div>`:"";
  const w=document.createElement("div"); w.className=`mrv dk-keep-mrv s-${show}${cf.top5?" pre":""}`;
  w.innerHTML=`${intro}<div class="mrv-in">${body}${cf.win1?`<div class="mrv-1">1<small>位</small></div>`:""}<button class="mrv-x" data-a="muRevealX">點一下關閉</button></div><div class="mrv-cf"></div>`;
  document.body.appendChild(w); requestAnimationFrame(()=>w.classList.add("in")); const D=cf.top5?4200:0; if(cf.top5){ setTimeout(()=>w.isConnected&&w.classList.add("who"),2300); setTimeout(()=>w.isConnected&&w.classList.remove("pre"),D-300); }
  const ok=()=>w.isConnected, set=(el,n)=>{ el.textContent=fmt(n); };
  const cnt=(el,ms)=>{ const to=+el.dataset.to, t0=performance.now(); el.classList.add("on"); const f=t=>{ const k=Math.min(1,(t-t0)/ms); set(el,Math.round(to*(1-Math.pow(1-k,3)))); if(k<1&&ok()) requestAnimationFrame(f); }; requestAnimationFrame(f); };
  const nR=R.length, T0=D+900, GAP=780; R.forEach((r,i)=>setTimeout(()=>{ if(ok()) w.querySelectorAll(`em[data-r="${i}"]`).forEach(e=>cnt(e,520)); },T0+i*GAP));
  /* 總分：先亂數滾動吊胃口，再停在真正的分數 */
  const T1=T0+nR*GAP+250, ROLL=2000; setTimeout(()=>{ if(!ok()) return; w.classList.add("sus"); const S=[...w.querySelectorAll("strong")]; S.forEach(e=>e.classList.add("on")); const iv=setInterval(()=>{ if(!ok()){ clearInterval(iv); return; } S.forEach(e=>set(e,Math.round(+e.dataset.to*(.55+Math.random()*.6)))); },70);
    setTimeout(()=>{ clearInterval(iv); if(!ok()) return; S.forEach(e=>set(e,+e.dataset.to)); w.classList.remove("sus"); w.classList.add("done"); w.querySelector(".mrv-cf").innerHTML=Array.from({length:70},(_,k)=>`<i style="left:${(k*37)%100}%;animation-delay:${(k%14)*.07}s;background:${["#FFD54A","#FF6FB1","#7C8CFF","#fff","#C6F432"][k%5]}"></i>`).join(""); },ROLL); },T1);
  try{ localStorage.setItem("hc_mur_"+wk+"_"+show,"1"); }catch(e){} }
/* 一位剛公布、這支手機還沒看過 → 打開打歌頁時自動播一次 */
function muRevealAuto(){ try{ if(document.querySelector(".mrv")) return; for(const wk of [curWeek(),shiftWeek(curWeek(),-1)]){ const W=getMShow().wins[wk]||{}; for(const sh of SHOWS){ if(W[sh.id]&&showEnded(sh.id,wk)&&!localStorage.getItem("hc_mur_"+wk+"_"+sh.id)&&Date.now()-showEndTs(sh.id,wk)<3*864e5){ muRevealOpen(sh.id,wk); return; } } } }catch(e){} }
