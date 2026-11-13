/* HAECHU｜後端（Supabase）同步 */
/* =========================================================
   後端（Supabase）
   ・正式網站（Cloudflare Pages）才會連後端：帳號、資料、照片都放雲端，大家看到的一樣
   ・在 Claude 裡預覽時連不到外面，所以是「本機試玩」：資料只存在這支手機
   ・anon / publishable key 本來就是給 App 用的公開 key；誰能讀寫由資料庫規則管（haechu_supabase.sql）
   ========================================================= */
const HB_URL="https://fgkyikpzqoovfffdulum.supabase.co";
const HB_KEY="sb_publishable_4ZJ--hfIpHsZUtiUn8EWdw_rqTFC_Rg";
const HB_HOSTS=[];   // 之後換成自己的網域，把網域加在這裡
let HB_ON=(()=>{ try{ const o=localStorage.getItem("hc_backend"); if(o==="1") return true; if(o==="0") return false; }catch(e){} const h=location.hostname||""; if(HB_HOSTS.includes(h)) return true; return /^https?:$/.test(location.protocol)&&!!h&&!/claude|anthropic|localhost|127\.0\.0\.1/i.test(h); })();   // 放到自己的網站（pages.dev、workers.dev、自己的網域）就連後端
/* 只留在這支手機的設定（外觀、音效、遊戲紀錄、登入相關） */
const HB_LOCAL=new Set(["daisuki_tours","daisuki_session","daisuki_last_email","daisuki_clean_v1","daisuki_clean_v2","daisuki_theme","daisuki_gacha_sound","daisuki_rhythm_best","daisuki_rhythm_level","daisuki_whisper_artist_read"]);
const hbSyncable=k=>typeof k==="string"&&k.startsWith("daisuki_")&&!HB_LOCAL.has(k)&&!k.startsWith("daisuki_m_")&&!k.startsWith("daisuki_hb");
const HB={tok:null,ref:null,exp:0,uid:null,base:{},ver:{},dirty:new Set(),since:"",busy:false,ft:null,pt:null,fans:{},applying:false,n:0,fail:0};
/* 帳號名稱 → 登入用的內部 email（看不到也收不到信，只是後台需要 email 格式） */
const normAcct=u=>String(u||"").normalize("NFKC").replace(/\s+/g,"").toLowerCase();
const normPw=p=>String(p||"").normalize("NFKC").trim();
const hbEmail=u=>"u"+[...new TextEncoder().encode(normAcct(u))].map(b=>b.toString(16).padStart(2,"0")).join("")+"@haechu.app";
const hbPw=pw=>"hc:"+normPw(pw).toLowerCase();   // 原本的密碼不分大小寫，照舊
async function hbFetch(path,{method="GET",body,prefer,headers={},raw=false}={},noAuth=false,retried=false){
  if(!noAuth&&HB.ref&&Date.now()>HB.exp-60e3&&!path.startsWith("/auth/")) await hbRefresh();
  const h={apikey:HB_KEY,...headers};
  if(!noAuth&&HB.tok) h.Authorization="Bearer "+HB.tok;
  if(body!==undefined&&!(body instanceof Blob)) h["Content-Type"]="application/json";
  if(prefer) h.Prefer=prefer;
  const ac=path.startsWith("/rest/v1/kv")&&typeof AbortController!=="undefined"?new AbortController():null, tm=ac?setTimeout(()=>ac.abort(),30e3):0;   /* 資料同步卡住超過 30 秒就重來（不然整個同步會一直卡著，後面發的東西都傳不上去） */
  let res; try{ res=await fetch(HB_URL+path,{method,headers:h,signal:ac?ac.signal:undefined,body:body===undefined?undefined:body instanceof Blob?body:JSON.stringify(body)}); }catch(e){ clearTimeout(tm); const er=new Error("network"); er.net=true; throw er; } clearTimeout(tm);
  if(res.status===401&&!noAuth&&!retried&&HB.ref){ if(await hbRefresh()) return hbFetch(path,{method,body,prefer,headers,raw},noAuth,true); }
  if(raw) return res;
  const txt=await res.text(); try{ if(typeof hbRx==="function") hbRx(txt.length); }catch(e){} let j=null; try{ j=txt?JSON.parse(txt):null; }catch(e){ j=txt; }
  if(!res.ok){ const er=new Error((j&&(j.msg||j.message||j.error_description||j.error))||("HTTP "+res.status)); er.status=res.status; er.code=j&&(j.error_code||j.code); throw er; }
  return j;
}
function hbSetTok(r){ HB.tok=r.access_token; HB.ref=r.refresh_token||HB.ref; HB.exp=Date.now()+((r.expires_in||3600)*1000); HB.uid=(r.user&&r.user.id)||HB.uid; try{ if(HB.ref) localStorage.setItem("daisuki_hb_auth",JSON.stringify({ref:HB.ref})); }catch(e){} }
/* 換新登入憑證：同一時間只換一次（好幾個請求同時換，舊憑證會被判定重複使用而登出）；失敗時先看看手機上有沒有更新的憑證再試一次 */
let hbRefP=null;
function hbRefresh(){ if(hbRefP) return hbRefP; hbRefP=(async()=>{ try{ const r=await hbFetch("/auth/v1/token?grant_type=refresh_token",{method:"POST",body:{refresh_token:HB.ref}},true); hbSetTok(r); return true; }
  catch(e){ if(e.net) return false;
    try{ const a=JSON.parse(localStorage.getItem("daisuki_hb_auth")||"null"); if(a&&a.ref&&a.ref!==HB.ref){ HB.ref=a.ref; const r=await hbFetch("/auth/v1/token?grant_type=refresh_token",{method:"POST",body:{refresh_token:HB.ref}},true); hbSetTok(r); return true; } }catch(x){ if(x.net) return false; }
    hbKicked(); return false; }
  finally{ setTimeout(()=>{ hbRefP=null; },0); } })(); return hbRefP; }
/* 維修模式：管理員打開後，管理員以外的人都不能登入，已經在用的人也會被請出去 */
const maintOn=()=>!!(S.get(K.maint,{})||{}).on;
function maintKick(){ try{ const s=session(); if(!HB_ON||!s||!maintOn()) return false; const a=ACCOUNTS[s.email]; if(a&&a.role==="admin") return false;
  hbLogout(); SS.del(); layer.innerHTML=""; ui.loginErr="HAECHU 維修中，請稍後再來 🛠"; go("auth"); return true; }catch(e){ return false; } }
function hbKicked(){ HB.tok=null; HB.ref=null; try{ localStorage.removeItem("daisuki_hb_auth"); }catch(e){} hbStop(); try{ SS.del(); }catch(e){} ui.loginErr="登入逾時，請重新登入"; try{ go("auth"); }catch(e){} }
function hbErrText(e,signup){ const c=String(e.code||""), m=String(e.message||"");
  if(e.net) return "連不上伺服器，請檢查網路";
  if(signup&&(c==="user_already_exists"||/already/i.test(m))) return "這個帳號已經有人用了";
  if(c==="invalid_credentials"||/invalid login/i.test(m)) return "帳號或密碼不正確";
  if(/confirm/i.test(m)||c==="email_not_confirmed") return "帳號還不能用（後台要關掉 Email 驗證）";
  if(e.status===429) return "太多次了，請稍後再試";
  return "登入失敗，請稍後再試"; }
/* 帳號資料：從後台讀，程式碼裡不放任何帳號密碼 */
async function hbLoadProfiles(){ const L=await hbFetch("/rest/v1/profiles?select=id,username,name,role,member"); if(!Array.isArray(L)) return;
  hbFetch("/rest/v1/profiles?select=username,created_at").then(C=>{ if(Array.isArray(C)) C.forEach(c=>{ if(ACCOUNTS[c.username]&&c.created_at) ACCOUNTS[c.username].cts=Date.parse(c.created_at); }); }).catch(()=>{});   /* 建立時間（日曆找帳號用；沒有這欄就算了） */
  Object.keys(ACCOUNTS).forEach(k=>delete ACCOUNTS[k]);
  L.filter(p=>!String(p.username||"").startsWith("try_")).forEach(p=>{ ACCOUNTS[p.username]={user:p.username,role:p.role==="fan"&&p.member?"artist":p.role,name:p.name||p.username,member:p.member||undefined,id:p.id}; }); acctGate();
  try{ localStorage.setItem("daisuki_hb_acc",JSON.stringify(ACCOUNTS)); }catch(e){}
  try{ const me=session()&&ACCOUNTS[session().email]; if(me&&me.role==="admin") await hbLoadReal(); }catch(e){} }
/* 本名：管理員建帳號時填的真實姓名，只有管理員看得到（正式網站存在後台的 admin_notes，預覽存在這支手機） */
const REAL={}, PWS={};
const realName=k=>REAL[String(k||"").toLowerCase()]||"";
const knownPw=k=>PWS[String(k||"").toLowerCase()]||"";
async function hbLoadReal(){ if(!HB_ON||!HB.tok) return; let L=null;
  try{ L=await hbFetch("/rest/v1/admin_notes?select=username,real_name,pw"); }catch(e){ try{ L=await hbFetch("/rest/v1/admin_notes?select=username,real_name"); }catch(x){} }
  if(!Array.isArray(L)) return; [REAL,PWS].forEach(o=>Object.keys(o).forEach(k=>delete o[k])); L.forEach(r=>{ if(r.real_name) REAL[r.username]=r.real_name; if(r.pw) PWS[r.username]=r.pw; }); }
/* 管理員的帳號筆記：本名、密碼（只有管理員看得到） */
async function setNote(k,patch){ k=String(k||"").toLowerCase();
  if("real_name" in patch){ const v=String(patch.real_name||"").trim(); patch.real_name=v; if(v) REAL[k]=v; else delete REAL[k]; }
  if("pw" in patch){ const v=String(patch.pw||"").trim(); patch.pw=v; if(v) PWS[k]=v; else delete PWS[k]; }
  if(!HB_ON){ const M=S.get("daisuki_real_local",{}), P=S.get("daisuki_pw_local",{}); if("real_name" in patch){ if(patch.real_name) M[k]=patch.real_name; else delete M[k]; } if("pw" in patch){ if(patch.pw) P[k]=patch.pw; else delete P[k]; } S.set("daisuki_real_local",M); S.set("daisuki_pw_local",P); return true; }
  try{ await hbFetch("/rest/v1/admin_notes?on_conflict=username",{method:"POST",body:{username:k,...patch,updated_at:new Date().toISOString()},prefer:"resolution=merge-duplicates,return=minimal"}); return true; }
  catch(e){ toast("pw" in patch?"密碼沒有記到伺服器（後台第六段 SQL 跑了嗎？）":"本名沒有存到伺服器（後台第四段 SQL 跑了嗎？）"); return false; } }

async function hbSetProfile(username,patch){ if(!HB_ON||!HB.tok) return true; try{ await hbFetch("/rest/v1/profiles?username=eq."+encodeURIComponent(username),{method:"PATCH",body:patch,prefer:"return=minimal"}); return true; }catch(e){ toast("沒有存到伺服器，請再試一次"); return false; } }
/* 讀進團與藝人（管理員在「藝人與團」建的） */
try{ if(!HB_ON){ Object.assign(REAL,JSON.parse(localStorage.getItem("daisuki_real_local")||"{}")); Object.assign(PWS,JSON.parse(localStorage.getItem("daisuki_pw_local")||"{}")); } }catch(e){}
/* 出道預告中（核准時已經建好團、綁好帳號）：出道日還沒到就先藏起來，時間到每支手機自己顯示，不用等任何人 */
/* 出道的那一刻＝出道日＋申請時選的發布時間（沒選就晚上 6 點） */
const relTime=(day,pr)=>{ const m=/^(\d{1,2}):(\d{2})$/.exec((pr||{}).time||"")||[0,18,0]; return day+((+m[1])*60+(+m[2]))*60e3; };
const debutHidden=()=>{ const now=Date.now(), H=new Set(); try{ (S.get(K.debut,[])||[]).forEach(x=>{ if(x&&x.status==="pre"&&x.gid&&relTime(x.day,x.pr)>now) H.add(x.gid); }); }catch(e){} return H; };
let _dhT=0;
function acctGate(){ try{ Object.values(ACCOUNTS).forEach(a=>{ if(!a) return; if(a.member&&!MEMBERS[a.member]&&a._hidOk!==a.member){ const r=S.get(K.roster,{})||{}; if(r.members&&r.members[a.member]){ a._hid=a.member; delete a.member; if(a.role==="artist") a.role="fan"; } }
    else if(a._hid&&MEMBERS[a._hid]){ a.member=a._hid; delete a._hid; if(a.role==="fan") a.role="artist"; } }); }catch(e){} }
function applyRoster(){ try{ const r=S.get(K.roster,{groups:[],members:{}})||{}, hid=debutHidden();
  const keepT=GROUPS.filter(g=>g.id==="tdm_g"), mT=MEMBERS.tdm_m;
  clearTimeout(_dhT); { const now=Date.now(), nx=(S.get(K.debut,[])||[]).filter(x=>x&&x.status==="pre"&&x.gid&&relTime(x.day,x.pr)>now).map(x=>relTime(x.day,x.pr)).sort((a,b)=>a-b)[0]; if(nx) _dhT=setTimeout(()=>{ applyRoster(); try{ render(); }catch(e){} },Math.min(nx-now+800,6*36e5)); }
  GROUPS.length=0; (r.groups||[]).forEach(g0=>{ if(GROUPS.some(x=>x.id===g0.id)||hid.has(g0.id)) return; const g={...g0};
    /* SOLOIST：外面一律顯示藝名；社群名字只在點進個人社群後才顯示 */
    GROUPS.push(g); }); keepT.forEach(g=>GROUPS.push(g));
  Object.keys(MEMBERS).forEach(k=>delete MEMBERS[k]); Object.entries(r.members||{}).forEach(([k,m])=>{ if(!m||!hid.has(m.group)) MEMBERS[k]=m; }); if(mT) MEMBERS.tdm_m=mT;
  if(!HB_ON) Object.assign(ACCOUNTS,r.accounts||{}); acctGate(); }catch(e){} }
function hbWriteLocal(k,v){ HB.applying=true; try{ if(KVX.ok&&BIGK(k)){ if(v===null||v===undefined) delete mem[k]; else mem[k]=v; kvxPut(k,v); } else if(v===null||v===undefined){ delete mem[k]; localStorage.removeItem(k); } else { mem[k]=v; try{ localStorage.setItem(k,JSON.stringify(v)); }catch(x){ if(!BIGK(k)) try{ localStorage.removeItem(k); }catch(y){} } } }catch(e){} HB.applying=false; }
function hbReadLocal(k){ if(KVX.ok&&BIGK(k)) return k in mem?mem[k]:null; try{ const t=localStorage.getItem(k); return t==null?(k in mem?mem[k]:null):JSON.parse(t); }catch(e){ return null; } }
/* 還沒送上雲端的修改：記在手機上，就算 App 被關掉、重新整理也不會不見，下次打開會合併後再送 */
const HB_PEND="daisuki_hb_pend";
const hbPendGet=()=>{ try{ return JSON.parse(localStorage.getItem(HB_PEND)||"{}")||{}; }catch(e){ return {}; } };
function hbPendSet(o){ try{ if(Object.keys(o).length) localStorage.setItem(HB_PEND,JSON.stringify(o)); else localStorage.removeItem(HB_PEND); }catch(e){} }
/* ===== 防止資料被吃掉：聊天、留言、貼文這些「只會越來越多」的資料，
   如果雲端突然變成空的、或少了一大半，而這支手機還留著完整的，就把兩邊合起來送回去（自動救回） ===== */
const HB_GUARD=()=>new Set([tie2On()?null:K.whispers,K.comments,K.posts,K.lives,K.fanPosts,"daisuki_sn_posts","daisuki_sn_stories","daisuki_sn_hl",K.trucks,K.sales,K.ptGrants,"daisuki_varshow","daisuki_biz"].filter(Boolean));
/* 限時動態只會越來越多：刪掉的換成「已刪除」記號（ts=0，舊版 App 也會當成過期不顯示）。
   合併時任何一邊有的都留著，除非有「已刪除」記號 → 別支手機版本舊、慢一步，都不會再把限動吃掉 */
const HB_KEEP=new Set(["daisuki_sn_stories","daisuki_sn_posts","daisuki_group_notices"]);   /* 社群公告也一樣：別支手機的舊資料不能把新公告蓋掉（撤下的公告有另外記號） */   /* 貼文也一樣：只有真的刪除（留記號）才會不見 */
function hbKeep(k,out,...src){ if(!HB_KEEP.has(k)||!Array.isArray(out)) return out; const m=new Map(), ord=[], raw=[];
  [out,...src].forEach(a=>{ if(!Array.isArray(a)) return; a.forEach(x=>{ if(!x||typeof x!=="object"||x.id==null){ if(a===out) raw.push(x); return; } const p=m.get(x.id); if(!p){ m.set(x.id,x); ord.push(x.id); } else if(x.del&&!p.del) m.set(x.id,x); }); });
  const lim=Date.now()-14*864e5; return [...raw,...ord.map(id=>m.get(id)).filter(x=>!(x.del&&x.del<lim))]; }
function hbGuard(k,local,remote){ if(!(HB_GUARD().has(k)||String(k).startsWith("daisuki_tie:"))||local==null) return null;
  if(remote==null) return local;
  if(HB_KEEP.has(k)&&Array.isArray(remote)){ const o=hbKeep(k,remote,local); return hbJ(o)!==hbJ(remote)?o:null; }
  if(Array.isArray(local)&&Array.isArray(remote)&&local.length>=8&&remote.length<local.length*.6) return hbMergeArr([],local,remote);
  if(k===K.sns&&local&&typeof local==="object"&&remote&&typeof remote==="object"){ const n=o=>((o.posts||[]).length+Object.keys(o.dm||{}).length); if(n(local)>=6&&n(remote)<n(local)*.6) return hbMerge({},local,remote); }
  return null; }
function hbRow(row,adv=true){ HB.base[row.k]=JSON.stringify(row.v===undefined?null:row.v); HB.ver[row.k]=row.ver; if(adv&&row.updated_at&&row.updated_at>HB.since) HB.since=row.updated_at; }
async function hbPullAll(opt={}){ for(let i=0;i<80&&!KVX.ready;i++) await new Promise(r=>setTimeout(r,100));   /* 等手機的大空間讀完：不然會以為手機上沒有資料，剛發還沒傳上去的東西就被雲端舊的蓋掉 */
  const rows=[]; for(let off=0;off<20000;off+=1000){ const part=await hbFetch(`/rest/v1/kv?select=k,v,ver,updated_at&order=k.asc&offset=${off}&limit=1000`); if(!Array.isArray(part)) break; rows.push(...part); if(part.length<1000) break; }
  try{ let tot=0; const sz=rows.map(r=>{ const n=JSON.stringify(r.v==null?null:r.v).length; tot+=n; return [r.k,n]; }); HB.kvSz=tot; HB.kvTop=sz.sort((a,b)=>b[1]-a[1]).slice(0,12); }catch(e){}
  if(opt.clean) hbPendSet({});   /* 試玩結束：手機上改過的全部不算，完全照雲端 */
  const pend=hbPendGet(), keep={}; Object.keys(pend).forEach(k=>{ if(hbSyncable(k)) keep[k]=hbReadLocal(k); });
  const snap={}; if(!opt.clean) HB_GUARD().forEach(k=>{ const v=hbReadLocal(k); if(v!=null) snap[k]=v; });
  const bigBefore=Object.keys(mem).filter(k=>BIGK(k)&&hbSyncable(k));
  try{ Object.keys(localStorage).filter(hbSyncable).forEach(k=>localStorage.removeItem(k)); }catch(e){} Object.keys(mem).filter(hbSyncable).forEach(k=>delete mem[k]);
  HB.base={}; HB.ver={}; HB.dirty.clear(); HB.since="";
  const seen=new Set();
  rows.forEach(r=>{ seen.add(r.k); hbRow(r); const gd=hbGuard(r.k,snap[r.k],r.v); if(gd!=null&&!(r.k in keep)){ hbWriteLocal(r.k,gd); HB.dirty.add(r.k); return; } if(r.k in keep&&keep[r.k]==null){ hbWriteLocal(r.k,gd!=null?gd:r.v); if(gd!=null) HB.dirty.add(r.k); return; } if(r.k in keep){ const b=pend[r.k]; hbWriteLocal(r.k,hbKeep(r.k,hbMerge(b==null?null:JSON.parse(b),keep[r.k],r.v),keep[r.k],r.v)); HB.dirty.add(r.k); } else hbWriteLocal(r.k,r.v); });
  Object.keys(keep).forEach(k=>{ if(!seen.has(k)&&keep[k]!=null){ hbWriteLocal(k,keep[k]); HB.dirty.add(k); } });
  Object.keys(snap).forEach(k=>{ if(!seen.has(k)&&!(k in keep)){ hbWriteLocal(k,snap[k]); HB.dirty.add(k); } });
  if(KVX.ok) bigBefore.forEach(k=>{ if(!seen.has(k)&&!(k in keep)&&!(k in snap)) kvxPut(k,null); });
  HB.pulled=Date.now(); applyRoster(); if(HB.dirty.size){ clearTimeout(HB.ft); HB.ft=setTimeout(hbFlush,200); } }
/* 兩個人同時改同一份資料：用上次同步的版本當基準，各自改的地方都留下 */
const hbJ=x=>JSON.stringify(x===undefined?null:x);
const hbT=x=>Array.isArray(x)?"arr":x&&typeof x==="object"?"obj":typeof x==="number"?"num":"x";
function hbMerge(b,l,r){
  if(l==null&&r!=null) return r;   /* 這支手機讀不到（空間滿了被清掉、剛打開還沒載入）≠ 刪掉：一律用雲端的，絕不拿「沒有」去蓋掉 */
  if(hbJ(l)===hbJ(r)) return l; if(hbJ(b)===hbJ(l)) return r; if(hbJ(b)===hbJ(r)) return l;
  const t=hbT(l); if(t!==hbT(r)) return l;
  if(t==="num"){ if(l>1e12||r>1e12) return Math.max(l,r); const bb=typeof b==="number"?b:0; return r+(l-bb); }   // 計數（愛心、留言數…）兩邊加的都算
  if(t==="obj"){ const bo=hbT(b)==="obj"?b:{}, out={};
    new Set([...Object.keys(r),...Object.keys(l)]).forEach(k=>{ const inL=k in l, inR=k in r, inB=k in bo;
      if(inL&&inR) out[k]=hbMerge(bo[k],l[k],r[k]);
      else if(inL){ if(!(inB&&hbJ(bo[k])===hbJ(l[k]))) out[k]=l[k]; }
      else if(!(inB&&hbJ(bo[k])===hbJ(r[k]))) out[k]=r[k]; });
    return out; }
  if(t==="arr") return hbMergeArr(Array.isArray(b)?b:[],l,r);
  return l; }
const hbId=x=>x&&typeof x==="object"&&!Array.isArray(x)&&x.id!=null?"i:"+x.id:"j:"+hbJ(x);
function hbMergeArr(b,l,r){
  if(l.length===r.length&&l.length&&l.every(x=>typeof x==="number")&&r.every(x=>typeof x==="number")) return l.map((x,i)=>hbMerge(b[i],x,r[i]));
  const B=new Map(b.map(x=>[hbId(x),x])), Lm=new Map(l.map(x=>[hbId(x),x])), Rm=new Map(r.map(x=>[hbId(x),x]));
  const keep=id=>!(B.has(id)&&(!Lm.has(id)||!Rm.has(id)));
  const val=id=>Lm.has(id)&&Rm.has(id)?hbMerge(B.get(id),Lm.get(id),Rm.get(id)):Lm.has(id)?Lm.get(id):Rm.get(id);
  const out=[], seen=new Set(), extra=[];
  l.forEach(x=>{ const id=hbId(x); if(seen.has(id)) return; seen.add(id); if(keep(id)) out.push(val(id)); });
  r.forEach(x=>{ const id=hbId(x); if(seen.has(id)) return; seen.add(id); if(keep(id)) extra.push(val(id)); });
  if(!extra.length) return out;
  const ts=x=>x&&typeof x==="object"&&typeof x.ts==="number"?x.ts:null;
  if(out.length&&[...out,...extra].every(x=>ts(x)!=null)){ const ref=out.length>1?out:r, desc=ref.length>1?ts(ref[0])>=ts(ref[ref.length-1]):true;
    extra.forEach(x=>{ const i=out.findIndex(y=>desc?ts(y)<ts(x):ts(y)>ts(x)); if(i<0) out.push(x); else out.splice(i,0,x); }); return out; }
  const firstCommon=r.findIndex(x=>Lm.has(hbId(x))), front=new Set(r.slice(0,firstCommon<0?0:firstCommon).map(hbId));
  return [...extra.filter(x=>front.has(hbId(x))),...out,...extra.filter(x=>!front.has(hbId(x)))]; }
/* 寫入：先存手機，再排隊送上雲端 */
/* ===== 試玩模式（只有 HUSSEY）：在自己手機上玩，什麼都不上傳、不收別人的更新；結束時從雲端還原 ===== */
function sbxWho(){ try{ const s=session(); if(!s) return false; const a=ACCOUNTS[s.email]||{}; if(a.role==="admin"||s.uni||s.admin) return true;   /* 管理員們也能試玩，幫忙給反饋 */
    const m=MEMBERS[a.member||s.home||""]; if(!m) return false; const g=groupOf(m.group); return String(m.name).toUpperCase()==="HUSSEY"||!!(g&&String(g.name).toUpperCase()==="HUSSEY"); }catch(e){ return false; } }
function sbxOn(){ try{ return localStorage.getItem("hc_sandbox")==="1"&&sbxWho(); }catch(e){ return false; } }
/* 試玩開始：先把「只在這支手機、不上雲端」的設定備份起來（積分顯示、各種本機狀態）；雲端那些結束時直接重新抓 */
function sbxStart(){ try{ const bak={}; Object.keys(localStorage).forEach(k=>{ if(k==="hc_sandbox"||k==="hc_sbx_bak"||hbSyncable(k)) return; bak[k]=localStorage.getItem(k); }); localStorage.setItem("hc_sbx_bak",JSON.stringify(bak)); localStorage.setItem("hc_sandbox","1"); }catch(e){} }
async function sbxOff(){ if(!(HB_ON&&HB.tok)){ toast("要連上網路才能還原，等一下再按結束"); return; }
  toast("試玩結束，正在還原…"); document.getElementById("sbxPill")?.remove();
  try{ const raw=localStorage.getItem("hc_sbx_bak"), bak=JSON.parse(raw||"{}");
    if(raw) Object.keys(localStorage).forEach(k=>{ if(k==="hc_sbx_bak"||hbSyncable(k)) return; if(!(k in bak)) localStorage.removeItem(k); });   // 試玩時才出現的本機資料：刪掉
    Object.entries(bak).forEach(([k,v])=>{ try{ localStorage.setItem(k,v); }catch(_){} }); localStorage.removeItem("hc_sandbox"); }catch(e){}
  try{ await hbPullAll({clean:1}); }catch(e){}   // 雲端上的：完全照雲端（試玩時沒有上傳任何東西）
  try{ localStorage.removeItem("hc_sbx_bak"); }catch(e){} location.reload(); }
function hbMark(k){ try{ if(sbxOn()) return; if(!HB_ON||!(HB.tok||HB.ref)||HB.applying||!hbSyncable(k)) return; HB.dirty.add(k);
  const p=hbPendGet(); if(!(k in p)){ p[k]=HB.base[k]!=null?HB.base[k]:null; hbPendSet(p); }
  clearTimeout(HB.ft); HB.ft=setTimeout(hbFlush,500); }catch(e){} }
async function hbFlush(){ if(HB.busy||!HB.tok||sbxOn()) return; HB.busy=true; let again=false;
  try{ for(const k of [...HB.dirty]){ HB.dirty.delete(k); HB.inflight=k; try{ await hbPush(k); HB.fail=0; }catch(e){ HB.dirty.add(k); again=true; HB.fail++; if(!e.net&&e.status>=400&&e.status<500&&e.status!==401&&e.status!==409){ HB.dirty.delete(k); try{ console.warn("hbPush",e.status,k); const L=JSON.parse(localStorage.getItem("hc_pushfail")||"[]"); L.unshift({k,s:e.status,t:Date.now()}); localStorage.setItem("hc_pushfail",JSON.stringify(L.slice(0,30))); }catch(x){} if(isAdminAcct()) toast(`有一筆資料沒有存到伺服器（${e.status}・${k.replace(/^daisuki_/,"")}）`); } break; } } }
  finally{ HB.busy=false; HB.inflight=null; }
  if(HB.dirty.size){ clearTimeout(HB.ft); HB.ft=setTimeout(hbFlush,again?Math.min(15e3,1000*2**Math.min(4,HB.fail)):300); } }
const hbPendDone=k=>{ if(HB.dirty.has(k)) return; const p=hbPendGet(); if(k in p){ delete p[k]; hbPendSet(p); } };
async function hbPush(k){ await hbPush0(k); hbPendDone(k); }
async function hbPush0(k){ let local=hbReadLocal(k); if(local==null) return;   /* 讀不到就不送，避免把雲端整份清空 */ if(HB.ver[k]!=null&&hbJ(local)===HB.base[k]) return;   // 沒有真的改，就不送（避免兩支手機互相觸發）
  for(let i=0;i<5;i++){
    if(HB.ver[k]==null){
      try{ const r=await hbFetch("/rest/v1/kv",{method:"POST",body:{k,v:local},prefer:"return=representation"}); if(Array.isArray(r)&&r[0]){ hbRow(r[0],false); return; } }
      catch(e){ if(e.status!==409&&!/duplicate/i.test(e.message)) throw e; }
    } else {
      const r=await hbFetch(`/rest/v1/kv?k=eq.${encodeURIComponent(k)}&ver=eq.${HB.ver[k]}`,{method:"PATCH",body:{v:local},prefer:"return=representation"});
      if(Array.isArray(r)&&r[0]){ hbRow(r[0],false); return; } }
    const rows=await hbFetch(`/rest/v1/kv?k=eq.${encodeURIComponent(k)}&select=k,v,ver,updated_at`), row=Array.isArray(rows)&&rows[0];
    if(!row){ delete HB.ver[k]; continue; }
    const merged=hbKeep(k,hbMerge(JSON.parse(HB.base[k]||"null"),local,row.v),local,row.v); hbRow(row,false); hbWriteLocal(k,merged); local=merged; if(k===K.roster) applyRoster(); hbSoon(); }
  throw new Error("conflict"); }
/* 讀取：每幾秒問一次有沒有別人改過的資料 */
/* 別人的資料有變才重畫畫面：別人自己的個人資料（帳號@別人，例如在線狀態、他的通知）跟我的畫面無關，不用重畫 */
const hbUiKey=k=>{ const at=String(k).indexOf("@"); if(at>0) return String(k).slice(at+1)===myEmail(); return true; };
async function hbPoll(){ if(!HB.tok||document.hidden||sbxOn()) return; let ch=false;
  try{ const rows=await hbFetch(`/rest/v1/kv?select=k,v,ver,updated_at&updated_at=gt.${encodeURIComponent(HB.since||"1970-01-01T00:00:00Z")}&order=updated_at.asc&limit=500`);
    (Array.isArray(rows)?rows:[]).forEach(row=>{ if(row.k===HB.inflight) return; /* 這份正在送出：先不套用別人的版本，送出時會自己合併（不然會把別人的新訊息吃掉） */ if(HB.ver[row.k]!=null&&row.ver<=HB.ver[row.k]){ if(row.updated_at>HB.since) HB.since=row.updated_at; return; }
      if(HB.dirty.has(row.k)){ const lo=hbReadLocal(row.k), m=hbKeep(row.k,hbMerge(JSON.parse(HB.base[row.k]||"null"),lo,row.v),lo,row.v); hbRow(row); hbWriteLocal(row.k,m); }
      else { const gd=hbGuard(row.k,hbReadLocal(row.k),row.v); hbRow(row); if(gd!=null){ hbWriteLocal(row.k,gd); HB.dirty.add(row.k); clearTimeout(HB.ft); HB.ft=setTimeout(hbFlush,400); } else hbWriteLocal(row.k,row.v); }
      if(row.k===K.roster||row.k===K.debut) applyRoster(); if(hbUiKey(row.k)) ch=true; });
    HB.n++;
    if(HB.n%30===0||/tab=(roster|accounts)/.test(location.hash)){ const before=JSON.stringify(ACCOUNTS); await hbLoadProfiles(); if(JSON.stringify(ACCOUNTS)!==before) ch=true; }
    if(HB.n%15===1){ const f=await hbFetch("/rest/v1/rpc/group_fans",{method:"POST",body:{}}); if(f&&typeof f==="object"&&JSON.stringify(f)!==JSON.stringify(HB.fans)){ HB.fans=f; ch=true; } }
  }catch(e){}
  if(ch&&maintKick()) return;
  if(ch) hbSoon(); }
/* 別人的新資料進來要重畫：手指正在滑（或剛滑完）就先等一下，重畫完把 SNS 自己的捲動位置放回去（不然滑到一半畫面會跳、卡住） */
let hbTouchT=0; ["touchstart","touchmove","wheel"].forEach(ev=>document.addEventListener(ev,()=>{ hbTouchT=Date.now(); },{passive:true,capture:true})); document.addEventListener("scroll",()=>{ hbTouchT=Date.now(); },{passive:true,capture:true});
function hbSoon(){ clearTimeout(HB.rt); HB.rt=setTimeout(()=>{ try{ const s=session(); if(!s) return; if(Date.now()-hbTouchT<1500){ hbSoon(); return; } if(s.role==="fan") feedDeliver(); if(document.querySelector("textarea:focus,input:focus,select:focus")){ if(document.activeElement&&document.activeElement.id==="win") tieSyncPatch(); return; } if(layer&&layer.querySelector(".fv,.sn-stv,.sn-st")) return;
  const y=window.scrollY, sn=document.querySelector(".sn"), sy=sn?sn.scrollTop:0; ui._syncPaint=true; try{ render(); }finally{ ui._syncPaint=false; } window.scrollTo(0,y); const sn2=document.querySelector(".sn"); if(sn2&&sy) sn2.scrollTop=sy; }catch(e){} },120); }
let hbPT=0; function hbProfilesNow(){ if(!HB_ON||!HB.tok||Date.now()-hbPT<3000) return; hbPT=Date.now(); const before=JSON.stringify(ACCOUNTS); hbLoadProfiles().then(()=>{ if(JSON.stringify(ACCOUNTS)!==before) hbSoon(); }).catch(()=>{}); }
function hbStart(){ hbStop(); HB.pt=setInterval(hbPoll,4000); setTimeout(msPublish,800); setTimeout(mutesMigrate,900); setTimeout(imgMigrate,3000); }
/* 以前的頭貼、背景、出道照直接塞在資料裡（很大，會把手機空間塞滿）：管理員打開 App 時，一張一張搬到雲端空間，資料裡只留網址 */
async function imgMigrate(){ try{ const s=session(); if(!HB_ON||!HB.tok||!s||!s.admin||imgMigrate.on) return; imgMigrate.on=true;
  const P=S.get(K.artProf,{})||{};
  for(const mid of Object.keys(P)) for(const f of ["avatar","av_tie","cover","cover_tie"]){ const v=P[mid]&&P[mid][f]; if(typeof v!=="string"||!v.startsWith("data:")) continue;
    const b=await (await fetch(v)).blob(), url=await hbImgUrl("prof_"+mid+"_"+f+"_"+Date.now().toString(36)+".jpg",b); if(!url) return;
    await hbPoll(); const cur=S.get(K.artProf,{})||{}; if(cur[mid]&&cur[mid][f]===v&&!HB.dirty.has(K.artProf)){ cur[mid][f]=url; S.set(K.artProf,cur); } }   /* 先拿最新的：別人剛換過就不要蓋掉 */
  const G=S.get(K.gPhoto,{})||{};
  for(const gid of Object.keys(G)){ const v=G[gid]; if(typeof v!=="string"||!v.startsWith("data:")) continue;
    const b=await (await fetch(v)).blob(), url=await hbImgUrl("gph_"+gid+"_"+Date.now().toString(36)+".jpg",b); if(!url) return;
    await hbPoll(); const cur={...(S.get(K.gPhoto,{})||{})}; if(cur[gid]===v&&!HB.dirty.has(K.gPhoto)){ cur[gid]=url; S.set(K.gPhoto,cur); } }
  }catch(e){} finally{ imgMigrate.on=false; } }
/* 以前管理員設的禁言／停權只存在自己名下（別的管理員、被禁言的人都看不到）：搬回大家共用的那份 */
function mutesMigrate(){ try{ const s=session(); if(!s||!s.admin||!s.email) return; const fk="daisuki_hb_mutesmig@"+String(s.email).toLowerCase(); if(localStorage.getItem(fk)) return; localStorage.setItem(fk,"1"); const own=hbReadLocal(K.mutes+"@"+String(s.email).toLowerCase()); if(!own||typeof own!=="object"||!Object.keys(own).length) return;
  const all=getMutes(); let ch=false; Object.entries(own).forEach(([k,v])=>{ if(!all[k]||(v&&all[k].ts<v.ts)){ all[k]=v; ch=true; } }); if(ch) S.set(K.mutes,all); }catch(e){} }
function hbStop(){ clearInterval(HB.pt); HB.pt=null; }
document.addEventListener("visibilitychange",()=>{ if(!document.hidden&&HB.tok) hbPoll(); else if(document.hidden&&HB.tok&&HB.dirty.size){ clearTimeout(HB.ft); hbFlush(); } });
window.addEventListener("pagehide",()=>{ if(HB.tok&&HB.dirty.size){ clearTimeout(HB.ft); hbFlush(); } });
/* 打開 App：3 個月內登入過就直接進去 */
async function hbResume(){ const h0=location.hash, sv=sessLoad(); let a=null; try{ a=JSON.parse(localStorage.getItem("daisuki_hb_auth")||"null"); }catch(e){}
  if(!sv||!a||!a.ref) return false; HB.ref=a.ref; const un=String(sv.email||"");
  /* 3 個月內登入過：先用這支手機上次存的資料直接進 App（不顯示登入畫面），同時在背後跟雲端確認、更新 */
  let cached=null; try{ cached=JSON.parse(localStorage.getItem("daisuki_hb_acc")||"null"); }catch(e){}
  const fast=!!(cached&&cached[un]);
  if(fast){ Object.keys(ACCOUNTS).forEach(k=>delete ACCOUNTS[k]); Object.assign(ACCOUNTS,cached); try{ applyRoster(); }catch(e){}
    loginAs(un); if(h0&&/^#\/(fan|artist|admin)/.test(h0)&&h0!==location.hash) navReplace(h0); navRestore(); }
  else { ui.authBusy=true; ui.resuming=true; try{ render(); }catch(e){} }
  try{ HB.exp=0; const ok=await hbRefresh(); if(!ok){ const er=new Error("refresh"); er.net=!HB.ref?false:true; if(!session()) er.net=false; throw er; }
    await hbLoadProfiles(); await hbPullAll(); HB.fans=(await hbFetch("/rest/v1/rpc/group_fans",{method:"POST",body:{}}).catch(()=>({})))||{}; hbStart();
    ui.authBusy=false; ui.resuming=false; if(!ACCOUNTS[un]) throw new Error("gone");
    if(maintOn()&&ACCOUNTS[un].role!=="admin"){ await hbLogout(); SS.del(); ui.loginErr="HAECHU 維修中，請稍後再來 🛠"; navRoot("#/auth"); render(); return true; }
    pushResync().then(()=>{ if(ui.pushOn) hbSoon(); });
    if(fast){ const s=session(); if(!s||s.email!==un) loginAs(un); else hbSoon(); }
    else { loginAs(un); if(h0&&/^#\/(fan|artist|admin)/.test(h0)&&h0!==location.hash) navReplace(h0); navRestore(); }
    return true;
  }catch(e){ ui.authBusy=false; ui.resuming=false;
    if(!e.net){ HB.tok=null; HB.ref=null; SS.del(); try{ localStorage.removeItem("daisuki_hb_acc"); }catch(x){} if(fast) navRoot("#/auth"); }
    else if(fast){ toast("連不上伺服器，先顯示這支手機上的資料"); return true; }
    else ui.loginErr="連不上伺服器，請檢查網路";
    try{ render(); }catch(x){} return false; } }
/* 登入／註冊 */
async function hbAuth(u,pw,signup,name){ const un=normAcct(u); ui.loginErr=""; if(signup&&(usedName(un)||(name&&usedName(name)))){ ui.loginErr="這個帳號名或暱稱以前有人用過，不能再用，換一個吧"; try{ render(); }catch(e){} return; } ui.authBusy=true; try{ render(); }catch(e){}
  try{ const body={email:hbEmail(un),password:hbPw(pw)};
    let r;
    if(signup) r=await hbFetch("/auth/v1/signup",{method:"POST",body:{...body,data:{username:un,name:name||un}}},true);
    else { try{ r=await hbFetch("/auth/v1/token?grant_type=password",{method:"POST",body},true); }
      catch(e1){ if(e1.net||!(e1.code==="invalid_credentials"||/invalid login/i.test(e1.message))) throw e1;
        // 第一位管理員第一次登入：後台還沒有任何管理員時，管理員名單裡的帳號會自動開通（其他人一律由管理員建立帳號）
        try{ r=await hbFetch("/auth/v1/signup",{method:"POST",body:{...body,data:{username:un,name:({husay:"HUSSEY"})[un]||un}}},true); }catch(e2){ throw e1; } } }
    if(!r||!r.access_token){ const er=new Error("confirm"); er.code="email_not_confirmed"; throw er; }
    hbSetTok(r); hbFetch("/rest/v1/rpc/remember_pw",{method:"POST",body:{p:String(pw||"").trim()}}).catch(()=>{});   // 登入成功：密碼記給管理員看（第七段 SQL）
    await hbLoadProfiles(); await hbPullAll(); HB.fans=(await hbFetch("/rest/v1/rpc/group_fans",{method:"POST",body:{}}).catch(()=>({})))||{}; hbStart();
    ui.authBusy=false; if(!ACCOUNTS[un]) ACCOUNTS[un]={user:un,role:"fan",name:name||un};
    pushResync().then(()=>{ if(ui.pushOn) hbSoon(); });
    if(maintOn()&&ACCOUNTS[un].role!=="admin"){ await hbLogout(); ui.loginErr="HAECHU 維修中，請稍後再來 🛠"; try{ render(); }catch(x){} return; }
    loginAs(un);
  }catch(e){ ui.authBusy=false; HB.tok=null;
    // 連不到後端、又不是在正式網站上（例如某些預覽畫面）：自動改成本機試玩
    const h=location.hostname||""; if(e.net&&!/\.(pages|workers)\.dev$/.test(h)&&!HB_HOSTS.includes(h)){ HB_ON=false; ui.loginErr=""; if(signup){ ACCOUNTS[un]={pw:String(pw||""),role:"fan",name:name||un}; saveRoster(r=>{ r.accounts=r.accounts||{}; r.accounts[un]=ACCOUNTS[un]; }); } return login(un,pw); }
    ui.loginErr=hbErrText(e,signup); try{ render(); }catch(x){} } }
async function hbLogout(){ try{ clearTimeout(HB.ft); if(HB.dirty.size) await hbFlush(); }catch(e){} hbPendSet({}); try{ await pushLogout(); }catch(e){} const t=HB.tok; HB.tok=null; HB.ref=null; hbStop();
  try{ if(t) fetch(HB_URL+"/auth/v1/logout",{method:"POST",headers:{apikey:HB_KEY,Authorization:"Bearer "+t}}); }catch(e){}
  try{ Object.keys(localStorage).filter(hbSyncable).forEach(k=>localStorage.removeItem(k)); }catch(e){} Object.keys(mem).filter(hbSyncable).forEach(k=>{ if(KVX.ok&&BIGK(k)) kvxPut(k,null); delete mem[k]; }); applyRoster(); }
/* 照片、語音、影片：上傳到雲端，別人的手機找不到就從雲端下載 */
/* 手機推播通知：iPhone 要先「加入主畫面」從主畫面打開；Android 用 Chrome 就可以 */
const VAPID_PUBLIC="BDU4YWn1PFmL7oeDwVj7flX9sAnHF_GpGuwk-jAcJ-cYpELabm4hX4FkJk-6fMCH-Lv4RpbHM3W5-H8eSEI-bJk";
const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const isStandalone=()=>{ try{ return matchMedia("(display-mode: standalone)").matches||navigator.standalone===true; }catch(e){ return false; } };
const pushSupported=()=>HB_ON&&"serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window;
try{ if(HB_ON&&"serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{}); }catch(e){}
const b64u=s=>{ const p="=".repeat((4-s.length%4)%4), b=atob((s+p).replace(/-/g,"+").replace(/_/g,"/")); return Uint8Array.from([...b].map(c=>c.charCodeAt(0))); };
async function pushSub(){ try{ const r=await navigator.serviceWorker.ready; return await r.pushManager.getSubscription(); }catch(e){ return null; } }
/* 登入後：這支手機已經開過推播，就改成通知現在登入的這個帳號 */
async function pushResync(){ ui.pushOn=false; try{ if(!pushSupported()||Notification.permission!=="granted") return; const s=await pushSub(); if(!s) return;
  try{ await hbFetch("/rest/v1/rpc/save_push",{method:"POST",body:{p_sub:s.toJSON()}}); ui.pushOn=true; }catch(e){} } finally{ ui.pushChk=true; } }
async function pushEnable(){
  if(isIOS&&!isStandalone()){ tieModal("先加入主畫面","iPhone 要從主畫面的 HAECHU 打開，才能收到通知：<br>1. 點 Safari 下方的分享按鈕<br>2. 選「加入主畫面」<br>3. 從主畫面的 HAECHU 打開，再到這裡開啟",`<button class="t-mbtn main" data-a="tCloseLayer">知道了</button>`); return; }
  if(!pushSupported()){ toast("這支手機的瀏覽器不支援通知"); return; }
  let p; try{ p=await Notification.requestPermission(); }catch(e){ p="denied"; }
  if(p!=="granted"){ toast("沒有允許通知，可以到手機的設定裡打開"); return; }
  try{ const r=await navigator.serviceWorker.ready; let s=await r.pushManager.getSubscription(); if(!s) s=await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(VAPID_PUBLIC)});
    await hbFetch("/rest/v1/rpc/save_push",{method:"POST",body:{p_sub:s.toJSON()}}); ui.pushOn=true; toast("手機通知開啟了"); }
  catch(e){ toast("沒有開成功，請再試一次"); }
  pushRefreshUI(); }
async function pushDisable(){ const s=await pushSub(); if(s){ try{ await hbFetch("/rest/v1/rpc/drop_push",{method:"POST",body:{p_endpoint:s.endpoint}}); }catch(e){} try{ await s.unsubscribe(); }catch(e){} } ui.pushOn=false; toast("手機通知關掉了"); pushRefreshUI(); }
async function pushLogout(){ try{ const s=await pushSub(); if(s&&HB.tok) await hbFetch("/rest/v1/rpc/drop_push",{method:"POST",body:{p_endpoint:s.endpoint}}); }catch(e){} ui.pushOn=false; }
function pushRefreshUI(){ const sw=document.querySelector('[data-a="pushToggle"].sw'); if(sw) sw.setAttribute("aria-checked",ui.pushOn?"true":"false"); if(!document.querySelector(".sheet")){ const y=window.scrollY; render(); window.scrollTo(0,y); } }
/* 新版本：網站更新後，打開中的 App 會跳「有新版本」，按一下就換成新版（加到主畫面的不用刪掉重加） */
const BUILD=window.HC_BUILD||"dev";   /* 版本號寫在 index.html（build.py 每次發布自動填） */
/* 有新版本：先在背後把新版的檔案下載好（存進手機），按「更新」時就不用再等下載 */
async function verPrefetch(v){ try{ const r=await fetch("index.html?v="+encodeURIComponent(v),{cache:"no-store"}); if(!r.ok) return; const t=await r.text();
  const L=[...new Set([...t.matchAll(/(?:src|href)="((?:app\.(?:js|css)|vendor\/[^"]+)\?v=[^"]+)"/g)].map(m=>m[1]))]; await Promise.all(L.map(u=>fetch(u).then(x=>x.ok&&x.blob()).catch(()=>{}))); }catch(e){} }
async function verCheck(){ if(!HB_ON||BUILD==="dev") return; try{ const r=await fetch("version.txt?t="+Date.now(),{cache:"no-store"}); if(!r.ok) return; const v=(await r.text()).trim();
  if(v&&v!==BUILD&&(ui.verNew!==v||Date.now()-(ui.verTs||0)>30*60e3)){ ui.verNew=v; ui.verTs=Date.now(); await verPrefetch(v);
    /* 登入頁（還沒登入）不跳提示：沒在打字就直接安靜換成新版，有打字就等下次 */
    let si=null; try{ si=session(); }catch(e){} if(!si){ if(![...document.querySelectorAll("input,textarea")].some(x=>String(x.value||"").trim())) location.replace(location.pathname+"?v="+encodeURIComponent(v)+location.hash); return; }
    toast("HAECHU 有新版本","更新","appReload"); } }catch(e){} }
let verHid=0; document.addEventListener("visibilitychange",()=>{ if(document.hidden){ verHid=Date.now(); return; }   /* 離開 App 一陣子再回來、又有新版本：沒在打字就直接換新版（舊版的手機會把資料弄亂） */
  if(ui.verNew&&ui.verNew!==BUILD&&verHid&&Date.now()-verHid>90e3&&!ui.snDraft&&![...document.querySelectorAll("textarea,input")].some(x=>x.type!=="file"&&x.type!=="range"&&x.type!=="checkbox"&&String(x.value||"").trim())){ try{ navSave&&navSave(); }catch(e){} location.replace(location.pathname+"?v="+encodeURIComponent(ui.verNew)+location.hash); } });
setInterval(verCheck,5*60e3); document.addEventListener("visibilitychange",()=>{ if(!document.hidden) verCheck(); }); setTimeout(verCheck,2500);
/* 照片、語音、影片放哪裡：MEDIA_URL 有填就放 Cloudflare R2（透過 haechu-media Worker），沒填就放 Supabase Storage */
const MEDIA_URL="https://haechu-media.vinriu715.workers.dev";
/* 大檔案（MV 等）：分成 32MB 一段傳到 R2，沒有大小上限 */
async function hbUploadBig(id,blob){ const P=32*1024*1024, n=Math.ceil(blob.size/P), base=MEDIA_URL+"/mpu/"+encodeURIComponent(id);
  const call=async(q,o)=>{ for(let i=0;i<4;i++){ try{ const r=await fetch(base+q,{...o,headers:{Authorization:"Bearer "+HB.tok,...(o.headers||{})}}); if(r.status===401){ await hbRefresh(); continue; } if(r.ok||r.status===409) return r; }catch(e){} await new Promise(r=>setTimeout(r,2000*(i+1))); } return null; };
  const s=await call("?a=start&t="+encodeURIComponent(blob.type||"video/mp4"),{method:"POST"}); if(!s){ toast("超過 45MB 的影片現在傳不上去（後台還沒更新），請先傳小一點的檔案"); return false; } if(s.status===409) return true;
  const {uploadId}=await s.json(), parts=[];
  for(let k=0;k<n;k++){ ui.upPct=Math.round(k/n*100); try{ hbUploadBig.on&&hbUploadBig.on(ui.upPct); }catch(e){} const r=await call(`?a=part&u=${encodeURIComponent(uploadId)}&n=${k+1}`,{method:"PUT",body:blob.slice(k*P,Math.min(blob.size,(k+1)*P))}); if(!r){ call("?u="+encodeURIComponent(uploadId),{method:"DELETE"}); ui.upPct=null; toast("影片沒有上傳成功，請再傳一次"); return false; } parts.push(await r.json()); }
  const d=await call("?a=done&u="+encodeURIComponent(uploadId),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(parts)}); ui.upPct=null;
  if(!d){ toast("影片沒有上傳成功，請再傳一次"); return false; } return true; }
async function hbUpload(id,blob){ if(!HB_ON||!HB.tok||!blob||sbxOn()) return true;
  if(MEDIA_URL){ if(blob.size>45*1024*1024) return hbUploadBig(id,blob);
    for(let i=0;i<3;i++){ try{ const r=await fetch(MEDIA_URL+"/media/"+encodeURIComponent(id),{method:"PUT",headers:{Authorization:"Bearer "+HB.tok,"Content-Type":blob.type||"application/octet-stream"},body:blob}); if(r.ok||r.status===409) return true; if(r.status===401) await hbRefresh(); }catch(e){} await new Promise(r=>setTimeout(r,1500*(i+1))); }
    }   // R2 傳不上去：改放 Supabase，至少大家看得到
  if(blob.size>48*1024*1024){ toast("檔案太大（超過 48MB），其他人會看不到"); return false; }
  for(let i=0;i<3;i++){ try{ await hbFetch("/storage/v1/object/media/"+encodeURIComponent(id),{method:"POST",body:blob,headers:{"Content-Type":blob.type||"application/octet-stream","x-upsert":"false"}}); return true; }catch(e){ if(e.status===409||/exists|duplicate/i.test(e.message)) return true; await new Promise(r=>setTimeout(r,1500*(i+1))); } }
  toast("照片／語音沒有上傳成功，其他人可能看不到，請再傳一次"); return false; }
/* 圖片放雲端空間（R2；不行就放 Supabase Storage），回傳網址；資料裡只存網址，不佔資料庫 */
async function hbImgUrl(id,blob){ if(!HB_ON||!HB.tok||!blob||sbxOn()) return null;
  if(MEDIA_URL){ for(let i=0;i<3;i++){ try{ const r=await fetch(MEDIA_URL+"/media/"+encodeURIComponent(id),{method:"PUT",headers:{Authorization:"Bearer "+HB.tok,"Content-Type":blob.type||"image/jpeg"},body:blob}); if(r.ok||r.status===409) return MEDIA_URL+"/media/"+encodeURIComponent(id); if(r.status===401) await hbRefresh(); }catch(e){} await new Promise(r=>setTimeout(r,1200*(i+1))); } }
  for(let i=0;i<3;i++){ try{ await hbFetch("/storage/v1/object/media/"+encodeURIComponent(id),{method:"POST",body:blob,headers:{"Content-Type":blob.type||"image/jpeg","x-upsert":"false"}}); return HB_URL+"/storage/v1/object/public/media/"+encodeURIComponent(id); }catch(e){ if(e.status===409||/exists|duplicate/i.test(e.message)) return HB_URL+"/storage/v1/object/public/media/"+encodeURIComponent(id); await new Promise(r=>setTimeout(r,1200*(i+1))); } }
  return null; }
/* 換掉的舊圖片從雲端刪掉（只刪 App 自己放的頭貼、背景、出道照；失敗就算了） */
function mediaDel(url){ try{ if(!HB_ON||!HB.tok||!MEDIA_URL||typeof url!=="string"||!url.startsWith(MEDIA_URL+"/media/")) return; if((S.get(K.lives,[])||[]).some(l=>l&&l.cv===url)) return;   /* 還是某場重播的封面：不刪 */ const id=url.slice((MEDIA_URL+"/media/").length); if(!/^(prof_|gph_)/.test(decodeURIComponent(id))) return;
  fetch(MEDIA_URL+"/media/"+id,{method:"DELETE",headers:{Authorization:"Bearer "+HB.tok}}).catch(()=>{}); }catch(e){} }
async function hbDownload(id){ if(!HB_ON) return null;
  if(MEDIA_URL){ try{ const r=await fetch(MEDIA_URL+"/media/"+encodeURIComponent(id)); if(r.ok) return await r.blob(); }catch(e){} }
  try{ const r=await fetch(HB_URL+"/storage/v1/object/public/media/"+encodeURIComponent(id)); if(!r.ok) return null; return await r.blob(); }catch(e){ return null; } }

/* 第一次開啟：產生示範資料（時間都相對「現在」計算，所以永遠不會過期） */
function seed(){
  if(S.get(K.seeded,false)) return;
  const H=3600e3, now=Date.now();
  const raw=[
    ["luna",4,"彩排結束！週五的舞台準備了全新的開場，大家一定要鎖定直播喔 💜 練習到半夜但超值得的！",0,12840,962],
    ["qing",3,"今天的錄音終於結束啦！新歌的副歌部分練了快五十遍，製作人老師說這次的版本是最有感覺的一次 🥹 大家再等一下下，下個月就能聽到完整版了！到時候一定要開最大聲聽喔 💜",2,5321,412],
    ["lumina_o",6,"【公告】《星海》專輯試聽派對即將開放預約 ✨ 成員們會在聊天室跟大家即時互動，詳細時間之後會再公告！",1,8904,733],
    ["sora",5,"下雨天最適合在練習室寫歌了 ☔ 今天寫出一段很喜歡的旋律，偷偷哼給大家聽的那天不會太遠！",4,2210,180],
    ["meng",8,"今晚 10 點睡衣派對直播 💤 大家準備好零食，我們一起熬夜聊天！",5,6630,540],
    ["tang",12,"新髮色你們喜歡嗎？糖果粉這次是我自己選的 🍬",3,9120,805],
    ["yin",20,"今天收到好多信，郵差本人也有收信的一天 ✉️ 每一封我都會好好讀完！",1,3302,264],
    ["xing",26,"打歌週倒數 3 天！今天練了 8 小時的新編舞，腿已經不是我的了 🥹 但想到能見到大家就充滿力量！",0,3412,256],
    ["luna",28,"收到了大家的應援信，每一封都認真看完了 🥹 是你們讓我在舞台上發光，永遠愛你們！",null,15203,1204],
    ["che",30,"午安！剛剛去吃了傳說中的草莓鬆餅，真的名不虛傳 🍰 晚上直播見！大家敲碗的翻唱我已經在練了～",3,2874,198],
    ["bo",40,"夏天結束了，但薄荷汽水的季節不會結束 🫧",7,1880,120],
    ["yu",50,"粉絲應援影片我看了好多遍，真的哭出來了…謝謝你們一直在 💖",6,4410,377],
    ["shui",70,"深夜的海邊好安靜，水母們都睡了嗎 🌙",6,1530,98],
  ];
  const posts=raw.map((r,i)=>({id:"seed"+i,member:r[0],group:MEMBERS[r[0]].group,ts:now-r[1]*H,text:r[2],color:r[3],likes:r[4],comments:r[5]}));
  S.set(K.posts,posts);
  // 通知只從「真的存在的貼文」產生，資料不會再互相矛盾
  const notifs=posts.filter(p=>now-p.ts<48*H && !MEMBERS[p.member].official)
    .map(p=>({id:"n"+p.id,kind:"post",member:p.member,group:p.group,text:p.text.slice(0,120),postId:p.id,color:p.color,ts:p.ts}));
  S.set(K.notifs,notifs);
  // 示範留言：其他粉絲的留言，部分已被藝人回覆
  const M=60e3, c=(post,minAfter,name,g,text,reply)=>{const ts=posts[post].ts+minAfter*M;return {id:"c"+post+"_"+minAfter,postId:posts[post].id,author:"other",name,g,text,ts,reply:reply?{text:reply,ts:ts+25*M}:null}};
  S.set(K.comments,[
    c(0,40,"星光應援團 🌟",4,"LUNA 的新開場一定超美！我已經把週五的行程全部清空了 😭"),
    c(0,95,"小月亮粉 🌙",2,"彩排辛苦了！我們會在台下舉起粉紫燈海等你 💜"),
    c(0,150,"晚安露露",6,"練到半夜要記得吃宵夜喔～身體最重要！"),
    c(8,60,"星光應援團 🌟",4,"那封藍色信封的是我寫的！！希望你喜歡 🥹","我看到了！藍色信封上的星星貼紙好可愛，謝謝你 💜"),
    c(8,180,"露娜的小太陽",0,"永遠支持你！"),
    c(1,30,"晴天娃娃",5,"副歌練五十遍也太認真了吧，等不及要聽了！"),
    c(5,20,"糖粉一號",3,"糖果粉超適合你！！","謝謝～下次換什麼顏色你們來投票！"),
  ]);
  // 示範 TIE 訊息
  const w=(member,hAgo,text,from="artist",name,g)=>{const id="w"+member+hAgo+from;return {id,member,from,name,g,text,ko:KO[id],ts:now-hAgo*H}};
  S.set(K.whispers,[
    w("luna",30,"大家晚安～今天練習室的冷氣好冷，我裹著外套跳舞 🥶"),
    w("luna",29.5,"露娜要多穿一點！","other","星光應援團 🌟",4),
    w("luna",6,"彩排前偷偷跟你們說，這次的開場我有一個小驚喜 🤫"),
    w("luna",5.8,"是什麼驚喜！！好想知道","other","小月亮粉 🌙",2),
    w("luna",5.7,"我猜是新髮色？","other","晚安露露",6),
    w("luna",2,"彩排完了！好累但好開心，你們今天過得好嗎？💜"),
    w("qing",20,"錄音室的便當今天是排骨飯 🍱 好幸福"),
    w("qing",3.5,"副歌錄完了！！你們一定會喜歡的"),
    w("xing",10,"腿好痠…但想到週末就能見到你們 🥹"),
    w("meng",9,"今晚睡衣派對直播要穿什麼睡衣好呢？給我建議！"),
    w("tang",14,"糖果粉頭髮洗了兩次還沒掉色，成功 🍬"),
  ]);
  S.set(K.wRead,{}); S.set(K.wArtistRead,now-5.75*H);
  S.set(K.unread,"1");
  S.set(K.settings,{post:true,comment:true,live:true,whisper:true});
  S.set(K.seeded,true);
}

/* 第 5 步的示範直播與活動（獨立產生，不會清掉你之前玩的資料） */



/* 第 6 步的示範檢舉（獨立產生，不會清掉你之前玩的資料） */



/* 示範：藝人訊息的韓文原文（讓翻譯功能可以展示） */
const KO={
  "wluna30artist":"다들 잘 자~ 오늘 연습실 에어컨이 너무 추워서 외투 입고 춤췄어 🥶",
  "wluna6artist":"리허설 전에 몰래 말해줄게, 이번 오프닝에 작은 서프라이즈가 있어 🤫",
  "wluna2artist":"리허설 끝! 너무 피곤한데 너무 행복해, 너희는 오늘 하루 어땠어? 💜",
  "wqing20artist":"오늘 녹음실 도시락은 돈가스야 🍱 너무 행복해",
  "wqing3.5artist":"후렴 녹음 끝났어!! 너희 분명 좋아할 거야",
  "wxing10artist":"다리 너무 아파… 그래도 주말에 너희 볼 생각하니까 🥹",
  "wmeng9artist":"오늘 밤 파자마 파티 라이브에 무슨 잠옷 입을까? 추천해줘!",
  "wtang14artist":"캔디 핑크 머리 두 번 감았는데도 색이 안 빠졌어, 성공 🍬",
};





