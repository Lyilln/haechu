/* HAECHU｜通知、積分 */
/* ===== 通知邏輯（交接文件的四個函數，保留同樣名稱） ===== */
/* 你自己的互動也會記在通知裡（跟 NSY 一樣），但不會亮紅點 */
function logSelf(kind,member,text,extra={}){
  const m=MEMBERS[member]; const list=S.get(K.notifs,[]);
  list.unshift({id:"s"+Date.now()+Math.random().toString(36).slice(2,5),kind,self:true,direct:true,member,group:m?m.group:null,text:(text||"").slice(0,120),ts:Date.now(),...extra});
  S.set(K.notifs,list.slice(0,100));
}
/* 多人版通知：藝人／管理員做的事放進共用的「通知動態」，每位粉絲打開 App 時，把跟自己有關的收進自己的通知
   對象：g:團（追蹤這團的粉絲）、tie:成員（有這位成員 TIE 券的粉絲）、u:帳號（指定的那位粉絲） */
function feedPush(n,aud){ try{ try{ const g=n.group&&groupOf(n.group); if(n.kind!=="whisper"&&n.kind!=="system"){ n={...n,pt:g?g.name:"HAECHU",pb:notifMsg({...n,self:false})}; if(n.vis==="ms") n.pbMs=notifMsg({...n,text:"查看Membership貼文"}); } }catch(e){} const F=S.get(K.feed,[]); F.unshift({...n,id:"f"+Date.now()+Math.random().toString(36).slice(2,6),aud,ts:Date.now()}); S.set(K.feed,F.slice(0,300)); }catch(e){} return true; }
/* 管理員加／扣積分：管理員寫進共用的「積分發放紀錄」，粉絲打開 App 時把給自己的那幾筆加進自己的積分（每筆只算一次） */
const ptGrants=()=>(S.get(K.ptGrants,[])||[]).filter(g=>g&&g.id);
/* 10/26：所有粉絲帳號的積分歸零重新開始（買過的東西都留著）。每個帳號第一次打開新版時歸零一次 */
const PT_RESET=Date.UTC(2026,9,26,12,30);
function ptResetCheck(){ if(HB_ON&&!Object.keys(HB.ver||{}).length) return false; if((S.get(K.ptRst,0)||0)>=PT_RESET) return true;
  const got=new Set(S.get(K.ptGot,[])||[]); ptGrants().forEach(g=>{ if(g.ts<PT_RESET) got.add(g.id); });
  S.set(K.ptGot,[...got]); S.set(K.points,0); S.set(K.lvMax,0); S.set(K.ptRst,PT_RESET); return true; }
/* 有藝人身分的帳號：管理員加／扣給這個帳號的積分，直接算進藝人積分（粉絲端、藝人端都馬上看到，在哪一端都會處理）
   每筆變成一筆 ufg_<原編號>，固定編號所以不會重複算 */
const PT_ART_T=1793687400000;   // 這個時間以前、粉絲端已經收過的：當時已經算進去了
const acctMid=()=>{ const s=session(); if(!s||!s.email||(s.admin&&!s.uni)) return ""; const m=(ACCOUNTS[s.email]||{}).member||s.home; return m&&MEMBERS[m]?m:""; };
function ptArtCollect(){ try{ const m=acctMid(); if(!m) return; if(HB_ON&&(!HB.tok||HB.ver[K.ptGrants]==null)) return; const me=myEmail(), k=K.ptGot+"@"+me, gv=store.get(k,undefined), got=new Set((gv===undefined?mem[k]:gv)||[]);
  const all=ptGrants(), have=new Set(all.map(g=>g.id)), ufm=all.find(g=>g.id==="ufm_"+me), todo=all.filter(g=>g.to===me&&!g.art&&!have.has("ufg_"+g.id)&&!(got.has(g.id)&&(g.ts<PT_ART_T||(ufm&&g.ts<ufm.ts)))).sort((a,b)=>a.ts-b.ts); if(!todo.length) return;
  const L=S.get(K.ptGrants,[])||[]; let net=Math.max(0,(pointsOf(m)||{}).net||0);
  todo.forEach(g=>{ const n=g.set?Math.max(0,g.n)-net:g.n; net=Math.max(0,net+n); L.push({id:"ufg_"+g.id,to:"art:"+m,mid:m,n,art:1,why:g.set?`積分更新為 ${fmt(g.n)}${g.why?"・"+g.why:""}`:(g.why||"管理員發放"),by:g.by||"auto",ts:g.ts}); });
  S.set(K.ptGrants,L); try{ hbSoon(); }catch(e){} }catch(e){} }
setInterval(ptArtCollect,10e3);
/* 積分更正：粉絲身分時已經收進粉絲積分（後來整份併進藝人積分），又被單獨再加一次的那幾筆，扣回來（固定編號，只扣一次）
   每個帳號（管理員、藝人）打開 App 時都會檢查；管理員打開時也會幫所有帳號檢查 */
function ptDupFix(){ try{ if(HB_ON&&(!HB.tok||HB.ver[K.ptGrants]==null)) return; const all=ptGrants(), have=new Set(all.map(g=>g.id)), byId=new Map(all.map(g=>[g.id,g])), me=myEmail(), adm=typeof isAdminAcct==="function"&&isAdminAcct();
  const L=S.get(K.ptGrants,[])||[]; let add=0;
  all.filter(g=>String(g.id).startsWith("ufm_")).forEach(u=>{ const em=u.id.slice(4); if(!adm&&em!==me) return; const k=K.ptGot+"@"+em, gv=store.get(k,undefined), got=new Set((gv===undefined?mem[k]:gv)||[]); if(!got.size) return;
    all.filter(g=>String(g.id).startsWith("ufg_")).forEach(f=>{ const o=byId.get(f.id.slice(4)); if(!o||o.to!==em||o.set||o.ts<PT_RESET||!(o.ts<u.ts)||!got.has(o.id)) return; const id="fixdup_"+o.id; if(have.has(id)) return; have.add(id);
      L.push({id,to:"art:"+u.mid,mid:u.mid,n:-(f.n||0),art:1,why:"重複計算的積分更正",by:"auto",ts:Date.now()}); add++; }); });
  if(add){ S.set(K.ptGrants,L); try{ hbSoon(); }catch(e){} } }catch(e){} }
setInterval(ptDupFix,20e3); setTimeout(ptDupFix,6e3);

function ptCollect(){ try{ ptArtCollect(); const s=session(); if(!s||s.role!=="fan") return; const artM=acctMid(); const me=myEmail(); if(!me) return; if(!ptResetCheck()) return; const got=new Set(S.get(K.ptGot,[])||[]);
  const seen=new Set(), mine=ptGrants().filter(g=>g.to===me&&!got.has(g.id)&&!seen.has(g.id)&&seen.add(g.id)); if(!mine.length) return;
  let sum=0, cur=points(), hasSet=false; const list=S.get(K.notifs,[]); mine.slice().sort((a,b)=>a.ts-b.ts).forEach(g=>{ got.add(g.id);
    if(g.set){ hasSet=true; cur=Math.max(0,g.n); } else { cur=Math.max(0,cur+g.n); sum+=g.n; }
    list.unshift({id:"pt"+g.id,kind:"core",direct:true,text:g.set?`積分更新為 ${fmt(g.n)}${g.why?"・"+g.why:""}`:`${g.n>=0?"獲得":"扣除"} ${fmt(Math.abs(g.n))} 積分${g.why?"・"+g.why:""}`,ts:g.ts}); });
  S.set(K.ptGot,[...got]); if(!artM) S.set(K.points,cur); if(hasSet&&!artM) S.set(K.lvMax,0); S.set(K.notifs,list.slice(0,100)); S.set(K.unread,"1");   // 管理員「設定為」：等級的字母保底重新計算
  if(hasSet) toast(artM?`積分更新・${fmt(mine.filter(g=>g.set).pop().n)}`:`積分更新為 ${fmt(cur)}`); else if(mine.length===1) toast(`${sum>=0?"獲得":"扣除"} ${fmt(Math.abs(sum))} 積分${mine[0].why?"・"+mine[0].why:""}`); else toast(`積分 ${sum>=0?"+":"−"}${fmt(Math.abs(sum))}`); }catch(e){} }
function viewPtAdd(){ const d=ui.ptD||(ui.ptD={to:[],n:"",why:"",q:"",sign:1}), q=nz(d.q.trim());
  const L=Object.entries(ACCOUNTS).filter(([e,a])=>e!==DEMO_FAN).sort((a,b)=>acctUser(a[0]).localeCompare(acctUser(b[0]))).filter(([e,a])=>!q||hit(q,acctUser(e),a.name,realName(e)));
  const hist0=ptGrants().slice().sort((a,b)=>b.ts-a.ts), hist=calFilter("pt",hist0,g=>g.ts);
  const tab=ui.ptaTab||"line", T=[["line","LINE 登記"],["trace","回溯"],["hand","手動加分"]], ti=T.findIndex(x=>x[0]===tab);
  const sw=`<div class="pta-sw"><div class="pta-sw-in" style="--i:${Math.max(0,ti)}"><i class="pta-sw-ind"></i>${T.map(([k,l])=>`<button class="${k===tab?"on":""}" data-a="ptaTab" data-v="${k}">${l}</button>`).join("")}</div></div>`;
  if(tab==="line") return `${sw}<main class="page pta">${ptRegCard()}</main>`;
  if(tab==="trace") return `${sw}<main class="page pta">${ptTraceHtml()}</main>`;
  return `${sw}<main class="page pta">
    <section class="card studio">
      <span class="fld-lab">給誰（可以選很多個）</span>
      <label class="field">${I.search}<input id="ptQ" placeholder="輸入文字" value="${esc(d.q)}" autocomplete="off"></label>
      ${d.to.length?`<div class="pta-sel">${d.to.map(e=>`<button class="chip on" data-a="ptTo" data-v="${esc(e)}">${esc(acctUser(e))} ✕</button>`).join("")}</div>`:""}
      <div class="pta-list">${L.map(([e,a])=>`<button class="pta-r ${d.to.includes(e)?"on":""}" data-a="ptTo" data-v="${esc(e)}"><b>${esc(acctUser(e))}</b><small>${esc(a.name||"")}${realName(e)?"・"+esc(realName(e)):""}・${ROLE_ZH[a.role]||"粉絲"}</small><i>${d.to.includes(e)?"✓":""}</i></button>`).join("")||`<p class="me-none">找不到</p>`}</div>
      <span class="fld-lab">加或扣</span>
      <div class="chips"><button class="chip ${d.sign>0?"on":""}" data-a="ptSign" data-v="1">＋ 加積分</button><button class="chip ${d.sign<0?"on":""}" data-a="ptSign" data-v="-1">− 扣積分</button><button class="chip ${d.sign===0?"on":""}" data-a="ptSign" data-v="0">＝ 設定為</button></div>
      <span class="fld-lab">積分</span><label class="field"><input id="ptN" inputmode="numeric" placeholder="輸入文字" value="${esc(d.n)}" autocomplete="off"></label>
      <span class="fld-lab">原因（粉絲會看到）</span><label class="field"><input id="ptWhy" maxlength="30" placeholder="輸入文字" value="${esc(d.why)}" autocomplete="off"></label>
      <button class="btn btn-main btn-block" data-a="ptGo">${d.to.length?`送出給 ${d.to.length} 個帳號`:"送出"}</button></section>
    <div class="section-h">最近的紀錄${calPick("pt")}</div>
    <section class="card pta-h">${hist.length?hist.slice(0,calMore("pt")).map(g=>`<div class="pta-hr"><b class="${g.n<0&&!g.set?"neg":""}">${g.set?"＝":g.n>=0?"+":"−"}${fmt(Math.abs(g.n))}</b><span><em>${esc(acctUser(g.to))}</em>${g.why?`<small>${esc(g.why)}</small>`:""}</span><small>${ymd(g.ts)}・${esc(acctUser(g.by))}</small></div>`).join(""):`<p class="me-none">${calF("pt")?"這天沒有紀錄":"還沒有紀錄"}</p>`}${calMoreBtn("pt",hist.length)}</section></main>`; }
