/* ===== 11/18 小卡序號：每一張卡都是獨立的一筆，有自己的序號 =====
   K.cards 還是記「這種卡有幾張」（其他畫面照舊用）；K.serials 記每一張：{cid:[{id,n,ts}]}，張數永遠跟 K.cards 一樣。
   ・專輯小卡：序號隨機（1～9999），沒有意義。
   ・公放卡、簽售卡：照發出順序（同一位藝人、同一種卡一個系列，大家共用一個計數器）。
   ・預購特典、Lucky Draw：從這一批的號碼裡隨機給，不重複。
   公放卡、簽售卡、特典的號碼要問雲端拿（大家共用 K.serialCtr，用版本號防止兩個人拿到同一號）；沒網路時先空著，連上再補。舊的卡也是這樣自動補上。 */
const getSerials=()=>S.get(K.serials,{})||{};
/* 這張卡是哪一種序號：o=照順序（系列名）、r=批次隨機（批次名、上限）；專輯小卡回傳 null */
/* 11/18 公放卡、簽售卡也改成「這一批的號碼裡隨機給」：照順序的話，一個人一次投 5 個節目就直接拿到 5 張連號。
   公放卡一批＝同一團、同一個打歌週（5 個節目 × 前 3 名 = 15 張，0001～0015）；簽售卡一批＝同一場簽售 */
function serKind(cid,x){ const o=parseIt(cid); if(!o||!o.it.rule) return null; const {a,it,p}=o;
  if(it.rule==="mc") return {r:"mc|"+a.gid+"|"+weekKey((x&&x.ts)||Date.now()),cap:SHOWS.length*3};
  if(it.rule==="fs") return {r:"fs|"+a.id+"|"+it.id,cap:0};
  if(it.rule==="pob"||it.rule==="ld") return {r:a.id+"|"+it.id,cap:it.cap|0};
  return null; }
const serRand=()=>1+(Math.random()*9999|0);
/* 跟雲端計數器拿號碼：讀 → 改 → 照版本號寫回，別人同時寫了就重來 */
async function serAlloc(fn){ const k=K.serialCtr;
  for(let i=0;i<6;i++){ const rows=await hbFetch(`/rest/v1/kv?k=eq.${encodeURIComponent(k)}&select=k,v,ver,updated_at`), row=Array.isArray(rows)&&rows[0], st=row&&row.v&&typeof row.v==="object"?row.v:{o:{},r:{}}; st.o=st.o||{}; st.r=st.r||{};
    const res=fn(st); let r=null;
    try{ r=row?await hbFetch(`/rest/v1/kv?k=eq.${encodeURIComponent(k)}&ver=eq.${row.ver}`,{method:"PATCH",body:{v:st},prefer:"return=representation"})
               :await hbFetch("/rest/v1/kv",{method:"POST",body:{k,v:st},prefer:"return=representation"}); }
    catch(e){ if(e.status!==409&&!/duplicate/i.test(e.message||"")) throw e; }
    if(Array.isArray(r)&&r[0]){ hbRow(r[0],false); hbWriteLocal(k,r[0].v); return res; } }
  throw new Error("serial busy"); }
function serPick(st,kd){ if(kd.o){ const n=(st.o[kd.o]|0)+1; st.o[kd.o]=n; return n; }
  const used=st.r[kd.r]||(st.r[kd.r]=[]), top=kd.cap>0?Math.max(kd.cap,used.length+1):used.length+30, U=new Set(used), free=[]; for(let n=1;n<=top;n++) if(!U.has(n)) free.push(n);
  const n=free[Math.random()*free.length|0]; used.push(n); return n; }
/* 把手上每一張卡都對上一筆；缺號碼的補號碼 */
async function serialSync(){ if(serialSync.on) return; const s=session(); if(!s||s.role!=="fan"||sbxOn()) return; serialSync.on=true;
  try{ const own=getCards(), meta=cardMeta(), L=getSerials(); let ch=false;
    if(!S.get(K.serV,0)){ /* 11/18 改規則：已經照順序編好的公放卡、簽售卡重新抽號碼（一次） */ Object.keys(L).forEach(cid=>{ const o=String(cid).startsWith("it|")&&parseIt(cid); if(o&&(o.it.rule==="mc"||o.it.rule==="fs")) L[cid].forEach(x=>{ x.n=null; }); }); S.set(K.serV,2); ch=true; }
    Object.keys(own).forEach(cid=>{ const n=own[cid]|0, a=L[cid]||[];
      while(a.length<n){ const kd=String(cid).startsWith("it|")?serKind(cid,{ts:Date.now()}):null, first=!a.length&&meta[cid];
        a.push({id:uid("s"),n:kd?null:(first&&first.no)||serRand(),ts:(first&&first.ts)||Date.now()}); ch=true; }
      if(a.length>n){ a.sort((x,y)=>(y.n?1:0)-(x.n?1:0)||x.ts-y.ts); a.length=n; ch=true; }   /* 兩支手機同時補：多出來的拿掉，有號碼的留著 */
      if(n) L[cid]=a; else if(L[cid]){ delete L[cid]; ch=true; } });
    if(ch) S.set(K.serials,L);
    const need=[]; Object.keys(L).forEach(cid=>L[cid].forEach(x=>{ if(x.n==null) need.push({cid,x}); })); if(!need.length||!HB_ON||!HB.tok) return;
    need.sort((p,q)=>p.x.ts-q.x.ts);
    const got=await serAlloc(st=>need.map(({cid,x})=>{ const kd=serKind(cid,x); return kd?serPick(st,kd):serRand(); }));
    const L2=getSerials(); need.forEach(({cid,x},i)=>{ const y=(L2[cid]||[]).find(z=>z.id===x.id); if(y&&y.n==null) y.n=got[i]; }); S.set(K.serials,L2);
    if(layer&&layer.querySelector(".cv-info")) hbSoon();
  }catch(e){} finally{ serialSync.on=false; } }
/* 連號算同一組的依據：同一批（公放卡＝同一團同一週）、同一位成員 */
function serKey(cid,x){ const kd=serKind(cid,x); if(!kd) return ""; const o=parseIt(cid); return kd.r+"|"+(o?o.p.mid||"":""); }
/* 卡片資訊那行：No.0003，有好幾張就全部列出來 */
function serTxt(cid,sid){ const a=(getSerials()[cid]||[]).filter(x=>!sid||x.id===sid).sort((x,y)=>(x.n||1e9)-(y.n||1e9)); if(!a.length) return "";
  const ns=a.filter(x=>x.n).map(x=>String(x.n).padStart(4,"0")); return "・"+(ns.length?"No."+ns.join("、"):"")+(ns.length<a.length?(ns.length?"・":"")+"序號產生中":"")+(sid&&a[0].rd?"・已兌換":""); }
setInterval(serialSync,20e3); setTimeout(serialSync,6e3);
