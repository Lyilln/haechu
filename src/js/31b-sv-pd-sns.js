/* 11/24 PRODUCE DAY 官方 SNS：
   ・播出期間，每一個交上來的舞台都自動發到 produceday.official
   ・節目片段（1 分鐘 PR、等級評價名場面）也自動擷取發文
   ・SNS 上舞台的瀏覽＋按讚，加起來佔票數的 3% */
const SV_SNSW=.03, SVPDV="daisuki_sv_pdview";
let svPdBusy=0;
function svPdPosts(){ if(svPdBusy) return []; svPdBusy=1; try{ const s=svSeason(); if(!s||s.demo||s.ph==="recruit") return []; const all=svAll(), out=[];
    const MS=k=>{ for(const ph in SV_MS) { const m=(SV_MS[ph]||[]).find(x=>x.k===k); if(m) return m.t; } return ""; };
    const med=(y,t)=>y.url?(y.kind==="v"?{type:"html",h:`<video src="${esc(y.url)}" playsinline webkit-playsinline controls preload="metadata" style="width:100%;height:100%;object-fit:cover;background:#000"></video>`}:{type:"html",h:`<img src="${esc(y.url)}" alt="" style="width:100%;height:100%;object-fit:cover">`}):{type:"html",h:`<div style="width:100%;height:100%;display:grid;place-items:center;background:#FFE3EF">${svPh(t)}</div>`};
    svStages().filter(y=>y&&!y.del&&y.sid===s.id).forEach(y=>{ const t=all.find(x=>x.id===y.tid); if(!t) return; const tag=String(t.name||"").replace(/\s+/g,"");
      out.push({id:"pd_"+y.id,uid:"o:pd",npc:1,pdStage:y.id,pdTid:t.id,pdPh:y.ph,ts:y.ts||Date.now(),base:svHash(y.id+"lk")%60,
        cap:`[${MS(y.mk)}] ${t.name}（${svCoName(t)}）${y.cap?"\n"+y.cap:""}\n\n#PRODUCEDAY #${tag}`,media:[med(y,t)]}); });
    /* 節目片段 */
    const card=(top,big,line)=>({type:"html",h:`<div style="width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;gap:10px;padding:22px;background:#FFF5F9;font-family:inherit"><b style="align-self:flex-start;background:#F0408F;color:#fff;font-size:12px;padding:3px 10px;letter-spacing:.1em">${esc(top)}</b><b style="font-size:26px;color:#F0408F">${esc(big)}</b><p style="margin:0;background:#2B2129;color:#fff;padding:10px 12px;font-size:14px;line-height:1.6">${esc(line)}</p></div>`});
    try{ const c=s.ph==="r1"?svC1(s):null, w=c&&c.win; if(w&&w.msg) out.push({id:"pdc_pr_"+s.id,uid:"o:pd",npc:1,ts:svPhT0(s)+36e5,base:80,cap:`[1 分鐘 PR] 1 號位的主人，${w.name}\n\n#PRODUCEDAY #1分鐘PR`,media:[card("1 分鐘 PR",w.name,"「"+w.msg+"」")]}); }catch(e){}
    try{ const G=s.grade||{}; Object.keys(G).filter(id=>G[id]==="A"||G[id]==="F").sort((a,b)=>svHash(a+"cl")-svHash(b+"cl")).slice(0,4).forEach((id,i)=>{ const t=all.find(x=>x.id===id); if(!t) return; const cm=svGrCm(s,t);
      out.push({id:"pdc_gr_"+id,uid:"o:pd",npc:1,ts:svPhT0(s)+(2+i)*36e5,base:30+svHash(id)%40,cap:`[等級評價] ${t.name}，${G[id]} 班\n\n#PRODUCEDAY #等級評價`,media:[card("等級評價・"+G[id]+" 班",t.name,cm.n+"：「"+cm.t+"」")]}); }); }catch(e){}
    return out; }catch(e){ return []; } finally{ svPdBusy=0; } }
/* 瀏覽：每個帳號每則只算一次 */
function svPdSeen(pid){ try{ const k=acK("daisuki_sv_pdseen"), M=S.get(k,{})||{}; if(M[pid]) return; M[pid]=1; S.set(k,M); mkEdit(SVPDV,o=>{ o=o||{}; o[pid]=(o[pid]||0)+1; return o; }); }catch(e){} }
let svSnsC=null;
function svSnsBonus(s,ph,out){ if(svPdBusy) return out; try{ if(!s||s.demo) return out; if(svSnsC&&svSnsC.t>Date.now()-3e4&&svSnsC.ph===ph&&svSnsC.sid===s.id) return Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v+(svSnsC.b[k]||0)]));
    const d=snDB(), V=S.get(SVPDV,{})||{}, E={}; (d.posts||[]).filter(p=>p.pdStage&&p.pdPh===ph).forEach(p=>{ E[p.pdTid]=(E[p.pdTid]||0)+(d.likes[p.id]||[]).length+(V[p.id]||0); });
    const tE=Object.values(E).reduce((a,b)=>a+b,0), tV=Object.values(out).reduce((a,b)=>a+b,0), b={};
    if(tE&&tV) Object.keys(out).forEach(id=>{ b[id]=Math.round(tV*SV_SNSW/(1-SV_SNSW)*(E[id]||0)/tE); });
    svSnsC={t:Date.now(),ph,sid:s.id,b}; return Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v+(b[k]||0)])); }catch(e){ return out; } }
/* 參賽中的練習生點 SNS：跟藝人還沒開通時一樣的頁面（照 Veres 那時候），可以先設定個人檔案、用節目官方帳號發文 */
function svSnPrep(){ const lk=svSnLock(), d=snDB(), me=snUser(snMeId()), to=snUser(lk.as), L=(d.posts||[]).filter(p=>p.uid===lk.as&&p.by===snMeId()).sort((a,b)=>b.ts-a.ts);
  return `<header class="top core-top"><div class="top-row"><button class="icon-btn" data-a="back" aria-label="返回">${I.back}</button><div class="top-title">SNS</div><span class="sh-sp"></span></div></header><main class="page sn-prep">
    <section class="card sn-prep-h">${snAv(me,72)}<b>${esc(me.u)}</b>${me.name?`<small>${esc(me.name)}</small>`:""}<p>${lk.as==="o:pd"?"節目播出期間，個人帳號暫停使用":"出道組的團體帳號開通了"}</p></section>
    <section class="card"><button class="list-btn" data-a="snsGo" data-v="edit">${I.edit||""}先設定個人檔案<span class="r">開通前只有你看得到</span></button>${to?`<button class="list-btn" data-a="snsGo" data-v="new">${I.star||""}發文到 ${esc(to.u)}<span class="r">${esc(to.name)}</span></button><button class="list-btn" data-a="snsGo" data-v="profile" data-id="${lk.as}">${I.star||""}看 ${esc(to.u)}<span class="r">›</span></button>`:""}</section>
    ${L.length?`<div class="section-h">我發的貼文</div><section class="card sn-subl">${L.map(x=>`<div class="sn-subr"><span class="sn-subth"></span><span><b>${esc(String(x.cap||"").slice(0,40)||"（沒有文字）")}</b><small>${ago(x.ts)}</small></span><em class="ok">已發布</em></div>`).join("")}</section>`:""}
  </main>`; }
