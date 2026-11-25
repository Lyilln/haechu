/* 11/24 PRODUCE DAY 官方 SNS：
   ・播出期間，每一個交上來的舞台都自動發到 produceday.official
   ・節目片段（1 分鐘 PR、等級評價名場面）也自動擷取發文
   ・SNS 上舞台的瀏覽＋按讚，加起來佔票數的 3% */
const SV_SNSW=.03, SVPDV="daisuki_sv_pdview";
let svPdBusy=0;
function svPdPosts(){ if(svPdBusy) return []; svPdBusy=1; try{ const s=svSeason(); if(!s||s.demo||s.ph==="recruit") return []; const all=svAll(), out=[];
    const MS=k=>{ for(const ph in SV_MS) { const m=(SV_MS[ph]||[]).find(x=>x.k===k); if(m) return m.t; } return ""; };
    const med=(y,t)=>y.url?(y.kind==="v"?{type:"video",url:y.url,st:svFp(y),pu:svPu(y.url)}:{type:"html",h:`<img src="${esc(y.url)}" alt="" style="width:100%;height:100%;object-fit:cover">`}):{type:"html",h:`<div style="width:100%;height:100%;display:grid;place-items:center;background:#FFE3EF">${svPh(t)}</div>`};
    ["r1","r2","pr","final"].flatMap(p=>svStages(p)).filter(y=>y&&!y.del&&!y.v&&y.url&&y.sid===s.id).forEach(y=>{   /* 11/24 原本拿不到任何舞台（沒給階段），官方帳號一直沒有舞台貼文 */ const t=all.find(x=>x.id===y.tid); if(!t) return; const tag=String(t.name||"").replace(/\s+/g,"");
      const P0=(s.t0s||{})[y.ph], mm=svMsList(y.ph).find(m=>m.k===y.mk), ms0=P0&&mm?(y.ph==="r1"&&s.airAt&&mm.d[0]===0?s.airAt:P0+mm.d[0]*864e5):0; out.push({id:"pd_"+y.id,uid:"o:pd",npc:1,ar:"3/4",pdStage:y.id,pdTid:t.id,pdPh:y.ph,ts:y.mk==="lv"?Math.min(y.ts||0,(s.airAt||P0||Date.now())-60e3):Math.max(y.ts||0,ms0+10*60e3+Math.floor((y.ts||0)/1e3)%6e5),base:0,
        cap:`[${MS(y.mk)}] ${t.name}（${svCoName(t)}）${y.cap?"\n"+y.cap:""}\n\n#PRODUCEDAY #${tag}`,media:[med(y,t)]}); });
    /* 開播：每位練習生的公式照＋名字（3:4，真人照片不切到臉） */
    const t1=svPhT0(s)+60*6e4; svAll().forEach((t,i)=>{ out.push({id:"pdp_"+t.id,uid:"o:pd",npc:1,ar:"3/4",ts:((s.t0s||{}).r1||t1)+i*6e4,base:0,
      cap:`[PRODUCE DAY] ${t.name}\n${svCoName(t)}\n\n#PRODUCEDAY #${String(t.name||"").replace(/\s+/g,"")}`,
      media:[{type:"html",h:`<div style="width:100%;height:100%;background:#FFE3EF;display:flex;align-items:flex-start;justify-content:center;overflow:hidden">${t.photo?`<img src="${esc(t.photo)}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:50% 20%">`:svPh(t)}</div>`}]}); });
    /* 節目片段 */
    const card=(top,big,line)=>({type:"html",h:`<div style="width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;gap:10px;padding:22px;background:#FFF5F9;font-family:inherit"><b style="align-self:flex-start;background:#F0408F;color:#fff;font-size:12px;padding:3px 10px;letter-spacing:.1em">${esc(top)}</b><b style="font-size:26px;color:#F0408F">${esc(big)}</b><p style="margin:0;background:#2B2129;color:#fff;padding:10px 12px;font-size:14px;line-height:1.6">${esc(line)}</p></div>`});
    try{ const c=s.ph==="r1"?svC1(s):null, w=c&&c.win; if(w&&w.msg) out.push({id:"pdc_pr_"+s.id,uid:"o:pd",npc:1,ts:(s.airAt||svPhT0(s))+30e3,base:0,cap:`[1 分鐘 PR] 1 號位的主人，${w.name}\n\n#PRODUCEDAY #1分鐘PR`,media:[card("1 分鐘 PR",w.name,"「"+w.msg+"」")]}); }catch(e){}
    try{ const G=s.grade||{}; Object.keys(G).filter(id=>G[id]==="A"||G[id]==="F").sort((a,b)=>svHash(a+"cl")-svHash(b+"cl")).slice(0,4).forEach((id,i)=>{ const t=all.find(x=>x.id===id); if(!t) return; const cm=svGrCm(s,t);
      out.push({id:"pdc_gr_"+id,uid:"o:pd",npc:1,ts:(s.airAt||svPhT0(s))+(2+i)*60e3,base:0,cap:`[等級評價] ${t.name}，${G[id]} 班\n\n#PRODUCEDAY #等級評價`,media:[card("等級評價・"+G[id]+" 班",t.name,cm.n+"：「"+cm.t+"」")]}); }); }catch(e){}
    return out; }catch(e){ return []; } finally{ svPdBusy=0; } }
/* 瀏覽：每個帳號每則只算一次 */
function svPdSeen(pid){ try{ const k=acK("daisuki_sv_pdseen"), M=S.get(k,{})||{}; if(M[pid]) return; M[pid]=1; S.set(k,M); mkEdit(SVPDV,v=>{ const o={...(v||{})}; o[pid]=(o[pid]||0)+1; return {v:o}; }); }catch(e){} }
let svSnsC=null;
/* 11/25 參賽中的練習生不能幫官方帳號的貼文按讚（不能自肥）：管理員手機把已經按的清掉 */
let svLkDone=0;
function svLikeClean(){ if(svLkDone>Date.now()-6e5||!isAdminAcct()) return; svLkDone=Date.now(); try{ const d=snDB(); let ch=0; (d.posts||[]).filter(p=>p.uid==="o:pd").forEach(p=>{ const L=d.likes[p.id]; if(!L) return; const L2=L.filter(id=>!(String(id).startsWith("u:")&&svInShow(String(id).slice(2)))); if(L2.length!==L.length){ d.likes[p.id]=L2; ch=1; } }); if(ch) snSave(d); }catch(e){} }
function svSnsBonus(s,ph,out){ if(svPdBusy) return out; try{ if(!s||s.demo) return out; if(svSnsC&&svSnsC.t>Date.now()-3e4&&svSnsC.ph===ph&&svSnsC.sid===s.id) return Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v+(svSnsC.b[k]||0)]));
    const d=snDB(), V=S.get(SVPDV,{})||{}, E={}; (d.posts||[]).filter(p=>p.pdStage&&p.pdPh===ph).forEach(p=>{ E[p.pdTid]=(E[p.pdTid]||0)+(d.likes[p.id]||[]).length+(V[p.id]||0); });
    const tE=Object.values(E).reduce((a,b)=>a+b,0), tV=Object.values(out).reduce((a,b)=>a+b,0), b={};
    if(tE&&tV) Object.keys(out).forEach(id=>{ b[id]=Math.round(tV*SV_SNSW/(1-SV_SNSW)*(E[id]||0)/tE); });
    svSnsC={t:Date.now(),ph,sid:s.id,b}; return Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v+(b[k]||0)])); }catch(e){ return out; } }
/* 參賽中的練習生點 SNS：跟藝人還沒開通時一樣的頁面（照 Veres 那時候），可以先設定個人檔案、用節目官方帳號發文 */
function svSnPrep(){ const lk=svSnLock(), d=snDB(), me=snUser(snMeId()), to=snUser(lk.as), L=(d.posts||[]).filter(p=>p.uid===lk.as&&p.by===snMeId()).sort((a,b)=>b.ts-a.ts);
  return `<header class="top core-top"><div class="top-row"><button class="icon-btn" data-a="back" aria-label="返回">${I.back}</button><div class="top-title">SNS</div><span class="sh-sp"></span></div></header><main class="page sn-prep">
    <section class="card sn-prep-h">${snAv(me,72)}<b>${esc(me.u)}</b>${me.name?`<small>${esc(me.name)}</small>`:""}<p>${lk.as==="o:pd"?"節目播出期間，個人帳號暫停使用":"出道組的團體帳號開通了"}</p></section>
    <section class="card">${to?`<button class="list-btn" data-a="snsGo" data-v="new">${I.star||""}發文到 ${esc(to.u)}<span class="r">${esc(to.name)}</span></button><button class="list-btn" data-a="snsGo" data-v="profile" data-id="${lk.as}">${I.star||""}看 ${esc(to.u)}<span class="r">›</span></button>`:""}</section>
    ${L.length?`<div class="section-h">我發的貼文</div><section class="card sn-subl">${L.map(x=>`<div class="sn-subr"><span class="sn-subth"></span><span><b>${esc(String(x.cap||"").slice(0,40)||"（沒有文字）")}</b><small>${ago(x.ts)}</small></span><em class="ok">已發布</em></div>`).join("")}</section>`:""}
  </main>`; }
/* 11/24 新聞聯動（照 PD 播出時的新聞爆點）：首播、大公司登場、等級評價、C 位、排名發表、惡剪爭議、退出節目、出道組誕生。
   在管理員的手機上算，同一件事只發一則 */
function svNews(s,key,title,body,img){ const done=s.newsDone||{}; if(done[key]) return false; const n={id:"nw"+Date.now()+key.length,title,body,img:img||"",gids:[],ts:Date.now(),pd:1};
  S.set(K.news,[n,...getNewsM()].slice(0,200)); try{ feedPush({kind:"news",group:"",text:title.slice(0,80),newsId:n.id,direct:true},"all"); }catch(e){} S.set(SVS,{...svReal(),newsDone:{...done,[key]:Date.now()}}); return true; }
const svAirTx=s=>{ const d=new Date(s.airAt&&s.ph==="r1"?s.airAt:svPhT0(s)), h=d.getHours()%12||12, m=d.getMinutes(); return ["一","二","三","四","五","六","七","八","九","十","十一","十二"][h-1]+"點"+(m===30?"半":m?m+"分":""); };
function svNewsTick(){ const s=svReal(); if(!s||s.demo||!svAdmOk()) return; const all=svAll(), N=id=>(all.find(t=>t.id===id)||{}).name||"", ph=s.ph, he=t=>s.g==="b"?t.replace(/她/g,"他"):t;
  if(ph!=="recruit"&&svVoting()){ if(svNews(s,"air","《PRODUCE DAY》今晚"+svAirTx(s)+"首播！"+all.length+" 位練習生正式登場",he(`${all.length} 位練習生在今晚${svAirTx(s)}的首播中依序入場、坐上金字塔座位。坐上 1 號位的練習生將獲得 1 分鐘 PR 的機會。`))) return;
    const big=[...new Set(all.map(t=>svCoName(t)).filter(c=>svCoTier(c)==="big"))]; if(big.length&&svNews(s,"big",`${big.join("、")} 練習生登場，全場一陣騷動`,he(`首播入場時，${big.join("、")} 的練習生一出現，現場練習生紛紛竊竊私語。她們會在等級評價拿到什麼等級，成為觀眾關注的焦點。`))) return; }
  const G=s.grade||{}, A=Object.keys(G).filter(id=>G[id]==="A"), F=Object.keys(G).filter(id=>G[id]==="F");
  if((s.grPub||{}).lv&&svNews(s,"glv",`等級評價結果出爐…A 班只有 ${A.length} 位，F 班多達 ${F.length} 位`,he(`A 班：${A.map(N).join("、")||"—"}。導師們的毒舌評語也引發討論。`))) return;
  if(s.grCen&&svNews(s,"cen",`主題曲 C 位是 ${N(s.grCen)}！由練習生們投票選出`,he(`A 班練習生中，${N(s.grCen)} 獲得最多練習生的支持，將站上主題曲 C 位。`))) return;
  if((s.out||[]).length){ for(const id of s.out){ if(svNews(s,"out"+id,`${N(id)} 宣布退出《PRODUCE DAY》`,he(`節目方表示，${N(id)} 因個人因素決定退出節目，往後的播出將不會再出現她的舞台。`))) return; } }
  try{ const ep=svShSteps(s).filter(x=>x.ed==="evil"&&x.p!==1), x=ep[0]; if(x){ const tid=x.t==="stg"?((svStages().find(y=>y.id===x.id)||{}).tid):x.id; if(tid&&svNews(s,"ev"+ph+((svMsNow(s)||{}).k||"")+tid,`${N(tid)} 惡剪爭議？網友：「剪得太狠了吧」`,he(`最新一集播出後，${N(tid)} 的畫面引發熱議，有網友認為是節目惡意剪輯，也有人認為「態度本來就有問題」。`))) return; } }catch(e){}
  const K0=s.keep||{}; if(K0.r1&&K0.r1.length&&svNews(s,"rk1",`第一次排名發表！1 位是 ${N(svRank("r1")[0])}`,`前 ${K0.r1.length} 位晉級第二輪，其他練習生在這裡結束了旅程。`)) return;
  if(K0.r2&&K0.r2.length&&svNews(s,"rk2",`第二次排名發表！${K0.r2.length} 位練習生進入決賽`,"出道組會是誰？決賽前最後一週，排名全部保密。")) return;
  if(s.debut&&s.debut.length&&svNews(s,"deb",`出道組誕生！${s.debut.length} 位練習生組成限定團`,`${s.debut.map(N).join("、")}，將由 OVERTONE Entertainment 負責接下來的活動。`)) return; }
