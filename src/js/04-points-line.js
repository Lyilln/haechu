/* HAECHU｜LINE 登記積分 */
/* ===== LINE 登記積分 =====
   管理員在「加積分」點開一個人 → 把他在 LINE 留言區的登記整段貼上 → 照積分表（#KISS）逐項檢查 → 一次加分
   ・積分表放在 daisuki_pt_rules，管理員可以貼新版覆蓋（四個管理員共用）
   ・每一筆加分都記下「哪天、哪一項、幾分」（grant.reg），同一天同一項再登記會扣掉已經加過的，超過上限不會重複給
   ・HAECHU 裡的項目（TIE 訊息、直播留言、開直播、LOVE 發文、貼文留言、社群發文）會跟 App 的紀錄對，登記比實際多就照實際算 */
const PT_RULES_K="daisuki_pt_rules";
const PT_RULES_DEF=`#KISS

ʕっ•ᴥ•ʔっ 積分寶貝 ʕっ•ᴥ•ʔっ

✦ 每日可做 •͈ᴗ⁃͈★
➞打卡 +50｜一天一次
➞sns發文（粉絲）+50｜一則，一天最多 150 分
➞sns發文（藝人）+50｜一則，一天最多 150 分
➞sns投稿（還沒開通 sns 的藝人，投給團體／公司帳號）+50｜一則，跟 sns 發文（藝人）共用一天 150 分上限
➞宣群（附截圖）+100｜一個群，一天最多 1,000 分
➞給予回饋 +100｜一個 Bug
➞帶領新人 +100｜只要有做出這個舉動都可加，一天最多 300 分
➞活躍氣氛 +100｜5 句以上，一天最多 300 分
➞幫忙管理員做事 +？？｜看那位管理員要給多少

✦ HAECHU
➞TIE 發訊息（藝人）+10｜一則，一天最多 100 分
➞TIE 發訊息（粉絲）+5｜一則，一天最多 50 分
➞TIE 被翻牌 +50｜一天一次
➞直播留言（粉絲）+20｜一則，一天最多 100 分
➞開直播（藝人）+5｜一分鐘，一天最多 600 分
➞LOVE 發文（藝人）+200｜一篇，一天最多 600 分
➞貼文留言互動（藝人）+10｜一天最多 100 分
➞貼文留言互動（粉絲）+10｜一天最多 100 分
➞推出主題（藝人）+500
➞sns 被藝人轉發 Story +300｜一篇，一天最多 300 分
➞社群發文（粉絲）+200｜一篇，一天最多 600 分
➞演唱會節奏挑戰 S 級 +300｜每場演唱會一次
➞線上簽售參與（粉絲）+100｜一場

✦ 創作
➞自戲 +500｜一篇 300 字以上，一天最多 1,000 分
➞對戲 +300｜一場雙方各 5 句以上，一天最多 900 分
➞採訪自戲 +500｜一篇
➞挑戰自戲 +500｜兩人合寫一篇
➞粉絲信 +100｜一封，一天最多 300 分
➞填詞 +500｜至少到副歌一半
➞自選曲翻唱 +500｜每首一次，30 秒以上
➞指定曲翻唱 +800｜每首一次，1 分鐘以上

✦ 舞台與里程碑
➞出道 showcase +3,000
➞回歸 +2,000
➞打歌一位 +3,000｜一個節目一次
➞5 台冠軍 +5,000｜同一首歌拿過五個節目的一位
➞AK +10,000｜同一週五個節目全拿
➞PAK +15,000｜連續 4 個排名週都有一位
➞MC +1,000｜主持一個節目，一週一次
➞見面會、簽售 +1,000｜一場
➞演唱會 +5,000｜一個月一場（世巡的站另外算）
➞世巡 +5,000｜一站，一年一次世巡、最多 5 站
➞年末大賞 +7,000
➞被選為結尾妖精（團體藝人）+200｜一個舞台一次（自動）

✦ 綜藝與活動
➞綜藝出演（藝人）+100｜一集
➞綜藝冠軍（藝人）+500｜一集（自動）
➞綜藝押注猜中（粉絲）｜平分押注（自動）
➞綜藝留言應援（粉絲）+10｜一天最多 50 分（自動）
➞代言・雜誌（藝人）+？？｜看邀約
➞代言按讚（粉絲）+10｜一張一次，一天最多 50 分（自動）
➞演唱會應援板被藝人回應（粉絲）+30｜一塊（自動）
➞生日咖啡廳到店（藝人）+300｜一年一次（自動）
➞生日咖啡廳留言卡（粉絲）+30｜一家店一次（自動）
➞幫忙佈置咖啡廳（粉絲）+50｜一家店最多 150 分（自動）
➞藝人回你的卡片（粉絲）+100｜一張（自動）
➞偶像運動會金牌（藝人）+500｜一項（自動）
➞偶像運動會銀牌（藝人）+300｜一項（自動）
➞偶像運動會銅牌（藝人）+200｜一項（自動）
➞偶像運動會加油（粉絲）+5｜一天最多 50 分（自動）
➞加油第一名的團（粉絲）+500｜有加油的人（自動）
➞應援餐車送到（出錢的粉絲）+200｜一台一次（自動）
➞收到應援餐車（藝人）+100｜送到前每天，最多 30 天（自動）

✦ 營收
➞粉絲花在你身上的積分，每月結算 15% 回到藝人（自動）

✦ 其他（加？減？）
➞星探
➞抽小卡

怎麼扣⌫
➞TIE 券（一張＝一位藝人）−1,000｜7 天
➞TIE 券（一張＝一位藝人）−3,500｜30 天
➞TIE 券（一張＝一位藝人）−35,000｜365 天
　✧ 續訂：買跟目前訂閱人數一樣的張數，每位都延長選的天數
　✧ 券使用期間可以換 1 次藝人，續訂後重新算
➞Membership −3,500｜30 天
➞Membership −35,000｜365 天
➞世巡門票（粉絲）−3,500｜一站，一次買剩下全部站打 9 折
➞訂應援餐車（粉絲）−30,000｜可以多人分攤，3 天內沒湊滿全部退回
➞送應援餐車（藝人）−30,000｜只能送給出道／回歸中的藝人
➞TIE 連續 3 天沒發訊息（藝人）｜第 4 天起，每天扣目前積分的 30%（自動）
➞檢舉成立第一次：管理員私下提醒，並刪除內容
➞檢舉成立第二次：App 禁言 24 小時
➞檢舉成立第三次起：每次 −1,000
➞違規第二次：−10,000，App 禁言 7 天

App 外流、情節嚴重者的處理方式請看 #NTK

≈ 標（自動）的不用登記，App 會自己加 ≈
≈ 積分花掉低於門檻會降級 ≈

≈ 每日請在留言區登記積分 ≈
≈ 管理員看心情更新積分與等級 ≈`;
const ptRulesText=()=>((S.get(PT_RULES_K,null)||{}).text)||PT_RULES_DEF;
const ptNz=v=>String(v||"").normalize("NFKC").toLowerCase().replace(/[\s·•・,、:;!?~\-—_|'"「」『』【】\[\]➞→➜*＊]/g,"");
const ptNum=v=>+String(v||"").replace(/[,，\s]/g,"");
function ptRulesParse(txt){ const out=[]; let sec="";
  String(txt||"").split(/\n/).forEach(raw=>{ const l=raw.trim(); if(!l) return;
    if(/^✦/.test(l)){ sec=l.replace(/^✦\s*/,"").replace(/[^\p{L}\p{N}（）()？?]+/gu," ").trim(); return; } if(/^怎麼扣/.test(l)){ sec="扣"; return; }
    if(!/^[➞→➜]/.test(l)) return; const body=l.replace(/^[➞→➜]\s*/,""), cut=body.search(/[｜|]/), head=(cut<0?body:body.slice(0,cut)).trim(), desc=cut<0?"":body.slice(cut+1).trim();
    const m=head.match(/^(.*?)\s*([+＋−-])\s*([\d,，]+|[？?]+)?\s*$/); let name=head, pts=null, neg=sec==="扣";
    if(m){ name=m[1].trim(); if(m[3]&&/\d/.test(m[3])) pts=ptNum(m[3]); if(m[2]==="−"||m[2]==="-") neg=true; }
    const auto=/自動/.test(desc+head), cm=desc.match(/一天最多\s*([\d,，]+)\s*分/), once=/一天一次/.test(desc);
    const role=/[（(]粉絲[）)]/.test(name)?"fan":/[（(]藝人[）)]/.test(name)?"artist":"", base=name.replace(/[（(][^）)]*[）)]/g,"").trim();
    out.push({name,base,key:ptNz(base),pts,ask:pts==null&&!auto,neg,auto,cap:cm?ptNum(cm[1]):once&&pts?pts:null,once,role,desc,per:/一分鐘/.test(desc)?"分鐘":""}); });
  return out; }
/* 把一行登記對到積分表的哪一項：先找完整包含名字的，再用字元比對（「TIE訊息」也能對到「TIE 發訊息」） */
function ptMatch(seg,R,role){ const k=ptNz(seg), want=/粉絲/.test(seg)?"fan":/藝人/.test(seg)?"artist":"";
  const sc=r=>{ if(r.neg||!r.key) return 0; let v=0; if(k.includes(r.key)) v=10+r.key.length; else if((r.alias||[]).some(a=>a&&k.includes(a))) v=9+Math.max(...r.alias.filter(a=>k.includes(a)).map(a=>a.length))*.5; else { const ch=[...new Set([...r.key])], hit=ch.filter(c=>k.includes(c)).length; if(ch.length>=2&&hit/ch.length>=.8) v=hit/ch.length*5; }
    if(!v) return 0; const rr=want||role; if(r.role) v+=r.role===rr?2:-1.5; return v; };
  let best=null, bv=0; R.forEach(r=>{ const v=sc(r); if(v>bv){ bv=v; best=r; } }); return best; }
/* App 自己的紀錄：那天實際做了幾次（不知道的回傳 null） */
function ptAct(email,r,d){ const t0=new Date(d+"T00:00:00").getTime(), t1=t0+864e5, inD=ts=>ts>=t0&&ts<t1, mid=(ACCOUNTS[email]||{}).member, k=r.key;
  try{
    if(/tie/.test(k)&&/訊息/.test(k)){ const seen=new Set(), L=[]; [...tieAllGet(),...(S.get(K.whispers,[])||[])].forEach(w=>{ if(w&&!seen.has(w.id)){ seen.add(w.id); L.push(w); } });
      return r.role==="artist"?(mid?L.filter(w=>w.from==="artist"&&w.member===mid&&inD(w.ts)).length:0):L.filter(w=>w.from==="me"&&w.by===email&&inD(w.ts)).length; }
    if(/被翻牌/.test(k)){ const seen=new Set(), L=[]; [...tieAllGet(),...(S.get(K.whispers,[])||[])].forEach(w=>{ if(w&&!seen.has(w.id)){ seen.add(w.id); L.push(w); } });
      const mine=new Set(L.filter(w=>w.from==="me"&&w.by===email).map(w=>w.text)); return L.some(w=>w.from==="artist"&&w.reply&&inD(w.ts)&&mine.has(w.reply.text))?1:0; }
    if(/直播留言/.test(k)) return getLives().reduce((n,l)=>n+(l.msgs||[]).filter(m=>m.from==="me"&&m.by===email&&inD(m.ts)).length,0);
    if(/開直播/.test(k)){ if(!mid) return 0; return Math.floor(getLives().filter(l=>l.member===mid).reduce((n,l)=>{ const a=Math.max(l.startTs||l.ts||0,t0), b=Math.min(l.endTs||Date.now(),t1); return n+Math.max(0,b-a); },0)/60000); }
    if(/love發文/.test(k)) return mid?getPosts().filter(p=>p.member===mid&&inD(p.ts)).length:0;
    if(/貼文留言互動/.test(k)){ let n=0; (S.get(K.comments,[])||[]).forEach(c=>{ if(c.by===email&&inD(c.ts)) n++; (c.reps||[]).forEach(x=>{ if(x.by===email&&inD(x.ts)) n++; }); if(r.role==="artist"&&mid&&c.reply&&inD(c.reply.ts||0)){ const p=getPosts().find(x=>x.id===c.postId); if(p&&p.member===mid) n++; } }); return n; }
    if(/社群發文/.test(k)) return (S.get(K.fanPosts,[])||[]).filter(p=>p.by===email&&inD(p.ts)).length;
  }catch(e){} return null; }
/* 已經加過的（同一個人、同一天、同一項） */
const ptRegGot=(email,ds,name)=>{ const D=new Set(Array.isArray(ds)?ds:[ds]); return (S.get(K.ptGrants,[])||[]).filter(g=>g.reg&&g.to===email&&g.reg.k===name&&(g.reg.ds||[g.reg.d]).some(x=>D.has(x))).reduce((n,g)=>n+(g.n||0),0); };
const ymdK=t=>{ const x=new Date(t); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`; };
/* 常見的寫法 → 積分表上的名字（名字本身找得到時，以積分表為準） */
const PT_ALIAS=[[/sns發文/,["發文","發限動","限動","發ig","ig發文","貼文","sns"]],[/給予回饋/,["回饋","回報bug","bug"]],[/帶領新人/,["帶新人","新人"]],[/活躍氣氛/,["活躍","炒氣氛"]],[/宣群/,["宣傳"]],[/打卡/,["簽到"]],[/粉絲信/,["寫信"]],[/被翻牌/,["被翻牌","翻牌","被翻"]],[/指定曲翻唱/,["指定曲"]],[/自選曲翻唱/,["自選曲"]],[/幫忙管理員做事/,["幫管做事","幫管理員","幫管","幫忙做事","幫管理"]]];
/* 日期：1103、11/3、11.03、11月3日；區間 1103-1104、11/3~11/5、11/3-5 */
function ptDateLine(seg,yr,curMo){ const t=seg.normalize("NFKC").trim(); if(/[+]\s*\d/.test(t)) return null; if(!/^[\s\d\/.\-~到至月日年()（）]+$/.test(t)||!/\d/.test(t)) return null;
  const parts=t.split(/\s*(?:[-~]|到|至)\s*/).filter(Boolean); if(!parts.length||parts.length>2) return null; let mo=curMo; const out=[];
  for(const p of parts){ let m=p.match(/^(?:(\d{4})[\/.年])?(\d{1,2})[\/.月](\d{1,2})日?$/), y=null, dd;
    if(m){ y=m[1]?+m[1]:null; mo=+m[2]; dd=+m[3]; } else if((m=p.match(/^(\d{2})(\d{2})$/))){ mo=+m[1]; dd=+m[2]; } else if((m=p.match(/^(\d{1,2})日?$/))&&out.length){ dd=+m[1]; } else return null;
    if(!(mo>=1&&mo<=12&&dd>=1&&dd<=31)) return null; const now=new Date(); let yy=y||yr; if(!y&&mo>now.getMonth()+2) yy--; out.push(`${yy}-${String(mo).padStart(2,"0")}-${String(dd).padStart(2,"0")}`); }
  let [a,b]=[out[0],out[1]||out[0]]; if(b<a) [a,b]=[b,a]; const ds=[]; for(let t0=new Date(a+"T00:00:00").getTime(), t1=new Date(b+"T00:00:00").getTime(), x=t0; x<=t1&&ds.length<31; x+=864e5) ds.push(ymdK(x)); return ds; }
const ptDs=ds=>ds.length>1?`${ds[0].slice(5).replace("-","/")}–${ds[ds.length-1].slice(5).replace("-","/")}`:ds[0].slice(5).replace("-","/");
function ptRegCheck(email,text,day0){ const R=ptRulesParse(ptRulesText()), role=(ACCOUNTS[email]||{}).member?"artist":"fan", out=[], used={}, notes=[]; let ds=[day0], total=null;
  R.forEach(r=>{ r.alias=[]; PT_ALIAS.forEach(([re,al])=>{ if(re.test(r.key)) r.alias=al.map(ptNz); }); const bare=r.key.replace(/^[a-z]+/,""); if(bare!==r.key&&bare.length>=3&&!r.alias.includes(bare)) r.alias.push(bare); });   /* 「TIE 被翻牌」寫成「被翻牌」也對得到 */
  const now=new Date(), yr=now.getFullYear();
  const lines=String(text||"").replace(/\r/g,"").split("\n").flatMap(l=>l.replace(/([+＋]\s*[\d,，]+)\s*(?=[^\d\s,，分])/g,"$1\n").split("\n")).map(x=>x.trim()).filter(Boolean);
  lines.forEach(seg=>{
    const dl=ptDateLine(seg,yr,now.getMonth()+1); if(dl){ ds=dl; return; }
    { const pm=seg.normalize("NFKC").match(/^([\d\/.\-~～到至月日年]{3,})\s+(\S.*)$/); if(pm){ const d2=ptDateLine(pm[1],yr,now.getMonth()+1); if(d2){ ds=d2; seg=pm[2]; } } }   /* 日期寫在同一行前面：「1103~1105 打卡*4+200」 */
    const tm=seg.normalize("NFKC").match(/^(總計|總共|合計|共計|總分|一共|總|共)\s*[:：]?\s*[+]?\s*([\d,]+)/); if(tm){ total=ptNum(tm[2]); return; }
    const bm=seg.normalize("NFKC").match(/^(目前|現在|累積|累計|餘額|現有|積分)\s*[:：]?\s*([\d,]+)\s*分?$/); if(bm){ notes.push(`登記寫目前有 ${fmt(ptNum(bm[2]))} 分（只是參考，不會加分）`); return; }
    const r=ptMatch(seg,R,role), cl=seg.match(/[+＋]\s*([\d,，]+)/), claim=cl?ptNum(cl[1]):null, d=ds[0], days=ds.length;
    if(!r){ if(claim!=null) out.push({seg,r:null,d,ds,claim,give:0,st:"no",why:["對不到積分表的項目"]}); return; }
    const rest=seg.replace(cl?cl[0]:"",""); let cnt=null; const um=rest.match(/(\d+)\s*(則|篇|個|句|場|封|首|次|張|群|位|人|分鐘|min|條|天)/i)||rest.match(/[x×＊*]\s*(\d+)/i);
    if(um&&!/字/.test(um[0])) cnt=+um[1]; const unit=r.pts;
    const it={seg,r,d,ds,claim,cnt:null,unit,act:null,give:0,st:"ok",why:[]};
    if(r.auto){ it.st="no"; it.why.push("App 會自己加，不用登記"); out.push(it); return; }
    if(r.ask||unit==null){ it.st="ask"; it.give=claim||0; it.why.push("這項要管理員自己決定分數"); out.push(it); return; }
    if(cnt==null) cnt=claim!=null&&claim%unit===0?claim/unit:1;
    if(r.once&&cnt>days){ it.why.push(days>1?`一天只能一次，${days} 天最多 ${days} 次`:"一天只能一次"); cnt=days; }
    let act=null; ds.forEach(x=>{ const v=ptAct(email,r,x); if(v!=null) act=(act||0)+v; }); it.act=act; if(act!=null&&cnt>act){ it.why.push(`App 紀錄${days>1?"這幾天":"那天"}只有 ${act}${r.per?" 分鐘":" 次"}`); cnt=act; }
    it.cnt=cnt; let give=unit*cnt; const kk=ds.join(",")+"|"+r.name, got=ptRegGot(email,ds,r.name)+(used[kk]||0), cap=r.cap!=null?r.cap*days:null;
    if(cap!=null&&give+got>cap){ const left=Math.max(0,cap-got); it.why.push(r.once?(got?`一天只能一次，${days>1?"這幾天":"那天"}已經加過了`:"一天只能一次"):got?`${days>1?`${days} 天`:"一天"}最多 ${fmt(cap)}，已經加過 ${fmt(got)}`:`${days>1?`${days} 天`:"一天"}最多 ${fmt(cap)}`); give=left; }
    used[kk]=(used[kk]||0)+give; it.give=give;
    if(claim!=null&&claim!==give&&!it.why.length) it.why.push(`${fmt(unit)} × ${cnt} = ${fmt(unit*cnt)}，登記寫 ${fmt(claim)}`);
    it.st=give===0?"no":(claim!=null&&claim!==give)||it.why.length?"fix":"ok"; out.push(it); });
  return {items:out,total,notes,sum:out.reduce((n,x)=>n+(x.give||0),0),claimSum:out.reduce((n,x)=>n+(x.claim||0),0)}; }
function ptRegRows(res){ const ic={ok:"✅",fix:"⚠️",no:"❌",ask:"✍️"};
  return res.items.length?res.items.map((x,i)=>`<div class="prg-r ${x.st}"><span class="prg-ic">${ic[x.st]}</span><div class="prg-b"><b>${x.r?esc(x.r.name):"？"}</b><small class="prg-sg">${esc(x.seg)}</small>${x.r&&x.unit!=null&&x.cnt!=null?`<small>${fmt(x.unit)} × ${x.cnt}${x.r.per?" 分鐘":""}${x.act!=null?`・App 紀錄 ${x.act}`:""}・${ptDs(x.ds||[x.d])}</small>`:x.r?`<small>${ptDs(x.ds||[x.d])}</small>`:""}${(Array.isArray(x.why)?x.why:[x.why]).filter(Boolean).map(w=>`<em>${esc(w)}</em>`).join("")}</div>
    ${x.st==="ask"?`<input class="prg-in" data-i="${i}" inputmode="numeric" value="${x.give||""}" placeholder="分數">`:`<span class="prg-n">${x.give?"+"+fmt(x.give):"0"}${x.claim!=null&&x.claim!==x.give?`<s>+${fmt(x.claim)}</s>`:""}</span>`}</div>`).join("")
   :`<p class="prg-e">貼上之後這裡會一項一項列出來</p>`; }
function ptRegFoot(res){ const sum=res.items.reduce((n,x)=>n+(+x.give||0),0), bad=res.total!=null&&res.total!==res.claimSum;
  return `${(res.notes||[]).map(n=>`<p class="prg-t">${esc(n)}</p>`).join("")}${res.total!=null?`<p class="prg-t ${bad?"bad":""}">登記寫總共 +${fmt(res.total)}${bad?`，但各項加起來是 +${fmt(res.claimSum)}`:""}</p>`:""}<button class="btn btn-main btn-block" data-a="prgGo" ${sum>0?"":"disabled"}>${sum>0?`加 ${fmt(sum)} 分`:"沒有可以加的分數"}</button>`; }
/* 檢查前先跟雲端同步到最新：大家剛傳的 TIE、留言、直播…都抓下來了才開始對數字 */
async function ptRegSync(){ const P=ui.prg; if(!P) return; P.sync=1; ptRegSt(); 
  try{ if(typeof HB!=="undefined"&&HB_ON&&HB.tok){ for(let i=0;i<8;i++){ const before=HB.since; await hbPoll(); if(HB.since===before) break; } } }catch(e){}
  if(ui.prg!==P) return; P.sync=0; P.syncAt=Date.now(); ptRegSt(); ptRegRun(); }
function ptRegSt(){ const P=ui.prg, el=document.getElementById("prgS"); if(!P||!el) return;
  el.innerHTML=P.sync?`<span class="prg-sp"></span>正在跟雲端同步最新資料，好了才會開始檢查…`:`<span>✓ 已同步到最新（${hm(P.syncAt)}）</span><button data-a="prgSync">再同步一次</button>`; el.classList.toggle("on",!!P.sync);
  const r=document.getElementById("prgR"), f=document.getElementById("prgF"); if(r) r.classList.toggle("wait",!!P.sync); if(f) f.classList.toggle("wait",!!P.sync); }
function ptRegOpen(email){ const a=ACCOUNTS[email]||{}; ui.prg={email,text:"",d:ymdK(Date.now()),res:null};
  setLayer(`<div class="tiei prg"><header class="tiei-top"><button class="icon-btn" data-a="tCloseLayer" aria-label="返回">${I.back}</button><b>${esc(a.name||acctUser(email))} 的登記</b><span class="sh-sp"></span></header>
    <main class="tiei-body prg-p"><section class="card studio"><span class="fld-lab">哪一天（登記裡有寫日期就照寫的，像 1103-1104 會算成兩天）</span><label class="field"><input type="date" id="prgD" value="${ui.prg.d}"></label>
      <span class="fld-lab">把他在 LINE 的登記整段貼上</span><label class="field prg-ta"><textarea id="prgT" rows="7" placeholder="例如：\n11/10\n打卡 +50\n宣群 3 個 +300\n自戲 +500\n總共 +850"></textarea></label></section>
    <div class="section-h">檢查結果</div><p class="prg-s" id="prgS"></p><section class="card prg-l" id="prgR">${ptRegRows({items:[]})}</section><div id="prgF" class="prg-f">${ptRegFoot({items:[],total:null,claimSum:0})}</div></main></div>`,"prg"); ptRegSync(); }
function ptRegRun(){ const P=ui.prg; if(!P) return; if(P.sync){ const t=document.getElementById("prgT"); if(t) P.text=t.value; return; } const t=document.getElementById("prgT"), dd=document.getElementById("prgD"); if(t) P.text=t.value; if(dd&&dd.value) P.d=dd.value;
  P.res=ptRegCheck(P.email,P.text,P.d); const r=document.getElementById("prgR"), f=document.getElementById("prgF"); if(r) r.innerHTML=ptRegRows(P.res); if(f) f.innerHTML=ptRegFoot(P.res); }
document.addEventListener("input",e=>{ const id=e.target.id; if(id==="prgT"||id==="prgD"){ clearTimeout(ui.prgT); ui.prgT=setTimeout(ptRegRun,250); return; }
  if(e.target.classList&&e.target.classList.contains("prg-in")&&ui.prg&&ui.prg.res){ const x=ui.prg.res.items[+e.target.dataset.i]; if(x){ x.give=Math.max(0,Math.round(ptNum(e.target.value)||0)); const f=document.getElementById("prgF"); if(f) f.innerHTML=ptRegFoot(ui.prg.res); } } });
document.addEventListener("change",e=>{ if(e.target.id==="prgD") ptRegRun(); });
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a;
  if(a==="prgOpen"){ e.stopImmediatePropagation(); ptRegOpen(t.dataset.v); return; }
  if(a==="prgSync"){ e.stopImmediatePropagation(); ptRegSync(); return; }
  if(a==="prgGo"){ e.stopImmediatePropagation(); const P=ui.prg; if(!P||!P.res||P.sync) return; const by=myEmail(), now=Date.now(), L=S.get(K.ptGrants,[])||[]; let sum=0, n=0;
    P.res.items.forEach((x,i)=>{ const v=Math.round(+x.give||0); if(!x.r||v<=0) return; sum+=v; n++; L.push({id:"lr"+now.toString(36)+i+Math.random().toString(36).slice(2,5),to:P.email,n:v,why:`LINE 登記・${x.r.name}`.slice(0,30),by,ts:now,reg:{d:x.d,ds:x.ds||[x.d],k:x.r.name,n:v}}); });
    if(!sum){ toast("沒有可以加的分數"); return; } S.set(K.ptGrants,L.slice(-3000)); layer.innerHTML=""; ui.prg=null; toast(`已加 ${fmt(sum)} 分給 ${acctUser(P.email)}（${n} 項）`); lsRerender(); return; }
  if(a==="prgRules"){ e.stopImmediatePropagation(); ui.prgRules=!ui.prgRules; const y=scrollY; render(); scrollTo(0,y); return; }
  if(a==="prgRulesSave"){ e.stopImmediatePropagation(); const v=((document.getElementById("prgRulesT")||{}).value||"").trim(); if(!v){ toast("先貼上積分表"); return; } const n=ptRulesParse(v).filter(r=>!r.neg).length; if(!n){ toast("看不懂這份積分表：每一項要用 ➞ 開頭，例如「➞打卡 +50｜一天一次」"); return; }
    S.set(PT_RULES_K,{text:v,ts:Date.now(),by:myEmail()}); toast(`積分表已更新（${n} 項）`); const y=scrollY; render(); scrollTo(0,y); return; }
  if(a==="prgRulesDef"){ e.stopImmediatePropagation(); ask("你貼的新版會被換掉，換回原本的積分表嗎？",()=>{ S.set(PT_RULES_K,null); render(); },{title:"換回原本的積分表",ok:"換回"}); return; }
},true);
function ptRegCard(){ const q=nz((ui.prgQ||"").trim()), L=Object.entries(ACCOUNTS).filter(([e,a])=>e!==DEMO_FAN&&!/^try_/.test(acctUser(e))).sort((a,b)=>acctUser(a[0]).localeCompare(acctUser(b[0]))).filter(([e,a])=>!q||hit(q,acctUser(e),a.name,realName(e)));
  const R=ptRulesParse(ptRulesText()).filter(r=>!r.neg), cur=S.get(PT_RULES_K,null);
  return `<section class="card studio prg-c"><h3>LINE 登記</h3><p class="prg-d">點一個人，把他在 LINE 留言區的登記貼上，會照積分表檢查算錯、超過上限、重複登記，再一次加分。</p>
    <label class="field">${I.search}<input id="prgQ" placeholder="輸入文字" value="${esc(ui.prgQ||"")}" autocomplete="off"></label>
    <div class="pta-list">${L.map(([e,a])=>`<button class="pta-r" data-a="prgOpen" data-v="${esc(e)}"><b>${esc(acctUser(e))}</b><small>${esc(a.name||"")}${realName(e)?"・"+esc(realName(e)):""}・${ROLE_ZH[a.role]||"粉絲"}</small><i>›</i></button>`).join("")||`<p class="me-none">找不到</p>`}</div>
    <button class="prg-rh" data-a="prgRules" aria-expanded="${!!ui.prgRules}"><span>積分表（#KISS）<small>${R.length} 項・${cur?`${ymd(cur.ts)} ${esc(acctUser(cur.by||""))} 更新`:"原本那份"}</small></span><i class="${ui.prgRules?"up":""}">${I.back}</i></button>
    ${ui.prgRules?`<label class="field prg-ta"><textarea id="prgRulesT" rows="10" placeholder="把新版的積分表整份貼上">${esc(ptRulesText())}</textarea></label><p class="prg-d">每一項用 ➞ 開頭，例如「➞打卡 +50｜一天一次」「➞自戲 +500｜一篇 300 字以上，一天最多 1,000 分」。寫「（自動）」的不用登記，寫「+？？」的會讓管理員自己填分數。</p><div class="prg-rb"><button class="btn btn-main" data-a="prgRulesSave">儲存積分表</button>${cur?`<button class="btn btn-soft" data-a="prgRulesDef">換回原本的</button>`:""}</div>`:""}</section>`; }
document.addEventListener("input",e=>{ if(e.target.id!=="prgQ") return; ui.prgQ=e.target.value; const pos=e.target.selectionStart; lsRerender(); const i=document.getElementById("prgQ"); if(i){ i.focus(); i.setSelectionRange(pos,pos); } });
/* 清單：日曆找某一天（📅）＋ 太長先收起來 */
const calF=k=>((ui.calF||{})[k])||"";
function calFilter(k,L,ts){ const d=calF(k); if(!d) return L; const t0=new Date(d+"T00:00:00").getTime(); return L.filter(x=>{ const t=ts(x); return t>=t0&&t<t0+864e5; }); }
const calPick=k=>`<span class="cal-pk">${calF(k)?`<button class="cal-x" data-a="calClr" data-v="${k}">${calF(k).slice(5).replace("-","/")} ✕</button>`:""}<label class="cal-btn" aria-label="用日曆找"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/></svg><input type="date" data-calf="${k}" value="${calF(k)}"></label></span>`;
const calMore=k=>((ui.calAll||{})[k])?1e9:10;
const calMoreBtn=(k,n)=>n>10?`<button class="cal-more" data-a="calAll" data-v="${k}">${((ui.calAll||{})[k])?"收起來":`顯示全部（${n}）`}</button>`:"";
document.addEventListener("change",e=>{ const k=e.target.dataset&&e.target.dataset.calf; if(!k) return; ui.calF={...(ui.calF||{}),[k]:e.target.value}; const y=scrollY; render(); scrollTo(0,y); });
document.addEventListener("input",e=>{ const id=e.target.id; if(!ui.ptD||!["ptQ","ptN","ptWhy"].includes(id)) return; const k={ptQ:"q",ptN:"n",ptWhy:"why"}[id]; ui.ptD[k]=e.target.value;
  if(id==="ptQ"){ const pos=e.target.selectionStart; lsRerender(); const i=document.getElementById("ptQ"); if(i){ i.focus(); i.setSelectionRange(pos,pos); } } });
function feedDeliver(){ ptCollect(); try{ const s=session(); if(!s||s.role!=="fan") return false; const F=S.get(K.feed,[]); let seen=S.get(K.feedSeen,null);
  if(seen===null){ S.set(K.feedSeen,F.map(e=>e.id).slice(0,500)); return false; }   // 新帳號：之前的通知不補送
  const have=new Set(seen), me=myEmail(), fol=followed(), st=getSettings(), add=[];
  F.forEach(e=>{ if(have.has(e.id)) return; have.add(e.id); seen.unshift(e.id); const a=String(e.aud||"");
    const ok=a==="all"?true:a.startsWith("g:")?fol.includes(a.slice(2)):a.startsWith("gs:")?a.slice(3).split(",").some(x=>fol.includes(x)):a.startsWith("tix:")?!!myTix()[a.slice(4)]:a.startsWith("tie:")?(isActive(a.slice(4))&&!tieSet(a.slice(4)).muted):a.startsWith("u:")?a.slice(2)===me:false;
    if(ok&&st[e.kind]!==false){ const {aud,...n}=e; if(n.vis==="ms"&&!isMember(n.group)) n.text="查看Membership貼文"; add.push(n); } });
  if(seen.length!==S.get(K.feedSeen,[]).length) S.set(K.feedSeen,seen.slice(0,500));
  if(add.length){ S.set(K.notifs,[...add,...S.get(K.notifs,[])].slice(0,100)); S.set(K.unread,"1"); setTimeout(()=>iaBanner(add[0]),60); return true; } return false; }catch(e){ return false; } }
