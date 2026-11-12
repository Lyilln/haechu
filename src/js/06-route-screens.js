/* HAECHU｜路由、畫面、應援棒 3D、登入 */
/* =========================================================
   2. 路由
   ========================================================= */
const ui={_wd:{},feedTab:"feed",notifFilter:"all",selectDraft:null,selectFilter:"all",selectQuery:"",composeText:"",composeColor:null,focusPost:null,expanded:new Set(),loginErr:""};
/* 每個 TIE 聊天室的輸入框草稿各自保留（粉絲端每位藝人一份、藝人端一份）；記在這支手機，關掉 App 也還在 */
try{ Object.assign(ui._wd,JSON.parse(localStorage.getItem("daisuki_m_wdraft")||"{}")); }catch(e){}
Object.defineProperty(ui,"wDraft",{get(){ const r=route(), k=((session()||{}).email||"")+":"+(r.role||"")+":"+(r.m||"-"); return ui._wd[k]||""; },
  set(v){ const r=route(), k=((session()||{}).email||"")+":"+(r.role||"")+":"+(r.m||"-"); if(v) ui._wd[k]=v; else delete ui._wd[k]; clearTimeout(ui._wdT); ui._wdT=setTimeout(()=>{ try{ localStorage.setItem("daisuki_m_wdraft",JSON.stringify(ui._wd)); }catch(e){} },300); }});
function route(){
  const h=location.hash.replace(/^#\/?/,""); const [path,q]=h.split("?");
  const parts=path.split("/").filter(Boolean);
  const tab=new URLSearchParams(q||"").get("tab");
  const qs=new URLSearchParams(q||"");
  return {role:parts[0]||"auth",sub:parts[1]||null,tab,m:qs.get("m"),id:qs.get("id"),p:qs.get("p")};
}
function go(role,sub,tab){ const h="#/"+role+(sub?"/"+sub:"")+(tab?"?tab="+tab:""); if(sub) { if(location.hash===h) render(); else navTo(h); } else navRoot(h); }
/* ===== 返回的規則（三端一樣）=====
   ・底下導覽列的分頁、登入後的首頁：都是「最上層」，切換時不留紀錄
   ・從最上層點進去的頁面一層一層記下來；返回（按返回鍵、往右滑）回到「上一個頁面」
   ・在最上層就沒有上一頁（不會回到別的分頁，也不會跑出 App）
   ・App 重新整理或被系統重新載入後，還是記得原本一路點進來的頁面，返回一樣回上一頁（不會直接跳回首頁）
   ・換頁不留紀錄時，直接改網址、不經過瀏覽器事件，才不會算錯層數 */
const NAV_BOOT=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
let NAV_D=0, NAV_PEND=null, NAV_BASE=0, NAV_STK=[location.hash];

const NAV_SAVED=(()=>{ try{ const a=JSON.parse(sessionStorage.getItem("hc_nav")||"null"); return Array.isArray(a)&&a.length?a:null; }catch(e){ return null; } })();
function navSave(){ try{ sessionStorage.setItem("hc_nav",JSON.stringify(NAV_STK)); }catch(e){} }
function navSet(){ NAV_STK.length=NAV_BASE+NAV_D+1; NAV_STK[NAV_BASE+NAV_D]=location.hash; if(NAV_STK.length>40){ const cut=NAV_STK.length-40; NAV_STK=NAV_STK.slice(cut); NAV_BASE=Math.max(0,NAV_BASE-cut); } navSave(); }
function navStamp(){ const st=history.state; if(st&&st.hc===NAV_BOOT&&typeof st.d==="number") NAV_D=st.d; else { NAV_D++; try{ history.replaceState({d:NAV_D,hc:NAV_BOOT},""); }catch(e){} } navSet(); }
function navReplace(h){ ui.navUi=performance.now(); ui.navFwd=performance.now(); if(location.hash!==h){ try{ history.replaceState({d:NAV_D,hc:NAV_BOOT},"",h); }catch(e){} } navSet(); render(); }
/* 換頁不經過瀏覽器的上一頁／下一頁（11/11）：iPhone 的瀏覽器和主畫面 App 都有自己的左右滑（右滑上一頁、左滑下一頁），
   會跟 App 自己的返回手勢打架、左滑還會跑到別頁。所以頁面紀錄全部由 App 自己記（NAV_STK），瀏覽器的紀錄永遠只有一筆 → 系統的左右滑沒地方去。
   ・navTo(h)：進到下一頁（取代原本的 location.hash=h）
   ・navFire(h)：換到那頁，並照常發出 hashchange（各頁的收尾都靠它） */
function navFire(h){ ui.navUi=performance.now(); h=String(h||""); if(h&&h[0]!=="#") h="#"+h; if(location.hash===h){ navSet(); render(); return; } const o=location.href; try{ history.replaceState({d:NAV_D,hc:NAV_BOOT},"",h||location.pathname+location.search); }catch(e){ location.hash=h; return; } window.dispatchEvent(new HashChangeEvent("hashchange",{oldURL:o,newURL:location.href})); }
function navTo(h){ h=String(h||""); if(h&&h[0]!=="#") h="#"+h; if(location.hash===h) return; NAV_BASE++; ui.navFwd=performance.now(); navFire(h); }   /* navFwd：往前走的新頁，不要放回以前在這頁滑到的位置 */
function navRoot(h){ ui.navUi=performance.now(); if(NAV_D>0){ NAV_PEND=h; history.go(-NAV_D); return; } const deep=NAV_BASE>0; NAV_BASE=0; if(deep) navFire(h); else navReplace(h); }
function navBack(){ ui.navUi=performance.now(); if(NAV_D>0){ history.back(); return; }
  if(NAV_BASE>0){ NAV_BASE--; navFire(NAV_STK[NAV_BASE]); return; }   // 上一頁：照 App 自己記下來的回去
  const s=session(); if(!s) return; const r=route(), home=s.uni&&r.role==="admin"?"#/admin":"#/"+(s.uni?"fan":s.role); if(location.hash!==home) navRoot(home); }
/* 回到指定的那一頁（例如離開 SNS 回到進來前的頁面）：在記錄裡就一路退回去，不在就當作最上層打開 */
function navBackTo(h){ ui.navUi=performance.now(); const cur=NAV_BASE+NAV_D; let k=-1; if(h) for(let i=cur-1;i>=0;i--){ if(NAV_STK[i]===h){ k=i; break; } }
  if(k<0){ if(h) navRoot(h); else navBack(); return; }
  const steps=cur-k; if(steps<=NAV_D){ history.go(-steps); return; } if(NAV_D>0){ NAV_PEND=h; ui.navPendBase=k; history.go(-NAV_D); return; } NAV_BASE=k; navFire(h); }
/* 重新載入後：如果停在原本記下來的那一頁，就把前面點進來的路徑接回來 */
function navRestore(){ const a=NAV_SAVED; if(a&&a[a.length-1]===location.hash&&a.length>1){ NAV_STK=a.slice(); NAV_BASE=a.length-1; NAV_D=0; navSave(); } }
try{ history.replaceState({d:0,hc:NAV_BOOT},""); }catch(e){}
const session=()=>SS.get();

/* =========================================================
   3. 畫面
   ========================================================= */
const root=document.getElementById("root"), layer=document.getElementById("layer");
/* 同一個面板重畫時不要重播開場動畫（避免看起來像關掉又打開） */
/* 照片、影片檢視：如果已經開著一個頁面（公司頁、媒體頁…），就疊在它上面，關掉只關檢視器 */
const ovl=(()=>{ const d=document.createElement("div"); d.id="ovl"; d.style.cssText="position:relative;z-index:3"; document.body.appendChild(d); return d; })();
function ovlClose(){ ovl.querySelectorAll("video").forEach(v=>{ try{ v.pause(); }catch(e){} }); ovl.innerHTML=""; }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest("[data-a]"); if(!t||!ovl.contains(t)||t.dataset.a!=="tCloseLayer") return; if(e.target===t||t.tagName==="BUTTON"){ e.stopImmediatePropagation(); ovlClose(); } else e.stopImmediatePropagation(); },true);
function setLayer(html,key){
  if(/^\s*<div class="ph-view"/.test(html)&&layer.firstElementChild&&!layer.firstElementChild.classList.contains("ph-view")){ ovl.innerHTML=html; return; }
  if(ovl.firstElementChild) ovlClose();
  const same=!!(key&&layer.firstElementChild&&layer.firstElementChild.dataset.lk===key);
  layer.innerHTML=html; const el=layer.firstElementChild;
  if(el&&key){ el.dataset.lk=key; if(same) el.classList.add("static"); }
}


/* =========================================================
   待辦（使用者交代）：最後再一起做「DeepL 翻譯接上」——帶使用者在 Cloudflare 架 deepl-worker.js（key 放 Secret DEEPL_KEY，
     不能寫進 App），把 Worker 網址填到 管理員 → 營運 → 翻譯服務，按「測試翻譯」確認；搬到自己的網站後設 ALLOWED_ORIGIN。
   ========================================================= */

/* ===== 登入狀態：每次重新打開 App 都會先看到登入頁 ===== */
let ssMem=null;   // 只放在記憶體：關掉或重新打開就要重新登入（帳號會幫你記著）
/* 簽售報名用的「我是誰」：示範帳號沿用 fan:me，新註冊的帳號用自己的 email，報名紀錄才不會混在一起 */
const fsMeOf=v=>{ const e=v&&v.role==="fan"?String(v.email||"").toLowerCase():""; return e?"fan:"+e:"fan:me"; };
const SS={ get(){ return ssMem; }, set(v){ ssMem=v; sessSave(v); try{ FS_ME=fsMeOf(v); }catch(e){} try{ const a=v&&(!v.admin||v.uni)&&ACCOUNTS[v.email]; ME.name=(a&&a.name)||"棉花糖粉絲"; applyNick(); }catch(e){} try{ applyTheme(); }catch(e){} }, del(){ ssMem=null; sessSave(null); try{ localStorage.removeItem("daisuki_hb_auth"); }catch(e){} try{ FS_ME="fan:me"; }catch(e){} try{ ui.lk=null; lockPaint(); applyTheme(); }catch(e){} } };
/* 登入狀態：記在這支手機，3 個月內有打開過就不用重新登入（太久沒用才要再登入） */
const SESS_DAYS=90;
function sessSave(v){ try{ if(v) localStorage.setItem("daisuki_session",JSON.stringify({v,ts:Date.now()})); else localStorage.removeItem("daisuki_session"); }catch(e){} }
function sessLoad(){ try{ const o=JSON.parse(localStorage.getItem("daisuki_session")||"null"); if(!o||!o.v||Date.now()-(o.ts||0)>SESS_DAYS*864e5) return null; return o.v; }catch(e){ return null; } }
function sessTouch(){ try{ const o=JSON.parse(localStorage.getItem("daisuki_session")||"null"); if(o&&o.v&&Date.now()-(o.ts||0)>3600e3){ o.ts=Date.now(); localStorage.setItem("daisuki_session",JSON.stringify(o)); } }catch(e){} }
const isAdminAcct=()=>{ const s=session(); if(!(s&&s.admin)) return false; let k=s.email; try{ k=acctKey(s.email)||s.email; }catch(e){} const a=ACCOUNTS[k]||ACCOUNTS[s.email]; return !!(a&&a.role==="admin"); };   /* 只認後台名單上真的是管理員的帳號（測試帳號、一般粉絲就算 session 裡有 admin 也不算） */
const canModerate=()=>isAdminAcct()&&!sbxOn();   /* 管理員帳號在哪一端都能直接處理不當內容；不是管理員的帳號、試玩模式看不到 */

/* ===== 確認視窗（App 內建，取代瀏覽器的 confirm） ===== */
function ask(text,fn,{title="確認一下",ok="確定",danger=true}={}){
  ui.askFn=fn; let box=document.getElementById("askLayer"); if(!box){ box=document.createElement("div"); box.id="askLayer"; document.body.appendChild(box); }
  box.innerHTML=`<div class="t-modal-w" data-a="askX"><div class="t-modal" role="dialog" aria-label="${esc(title)}"><h3>${esc(title)}</h3><p>${esc(text)}</p>
    <div class="t-mb"><button class="t-mbtn ${danger?"danger":"main"}" data-a="askOk">${esc(ok)}</button><button class="t-mbtn" data-a="askX">取消</button></div></div></div>`;
}
const askClose=()=>{ const b=document.getElementById("askLayer"); if(b) b.innerHTML=""; };

/* ===== TIE 未讀：紅色小月亮 ===== */
const MOON='<svg viewBox="0 0 24 24"><path d="M15 3.4A8.8 8.8 0 1 0 20.6 15.6 6.4 6.4 0 0 1 15 3.4z" fill="#F43F5E" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><circle cx="18.6" cy="6.6" r="1.4" fill="#F9A8D4"/></svg>';

/* ===== 換頁動畫：進到下一層往左滑入、返回往右滑入、切分頁淡入 ===== */
function routeDepth(r,s){ if(!s) return 0; if(s.uni&&r.role==="admin"){ if(r.sub==="thedit") return 2; if(r.sub==="themes") return 1; return ["home","reports","posts","announce","foc","shopadm","people","artist","ops"].includes(r.tab||"home")?0:1; } if(r.sub==="chat") return r.p?2:1; if(["notifications","live","replay","core","select","look","themes","thmine","write"].includes(r.sub)) return 1; if(r.sub==="tint") return r.id?2:1; if(r.sub==="thedit") return 2; if(r.sub==="grp") return r.m?3:r.p==="about"?2:1; if(s.role==="artist"&&r.tab==="whisper") return 1; return 0; }
function pageAnim(){
  const r=route(), s=session(), key=location.hash+"|"+(s?s.role:""), d=routeDepth(r,s);
  if(key===ui.pgKey) return null;
  const prev=ui.pgKey; ui.pgKey=key; const pd=ui.pgDepth; ui.pgDepth=d;
  if(!prev) return "op";
  if(ui.secSw){ ui.secSw=false; return null; }   /* 管理員切換粉絲／藝人／管理：直接換，不閃 */
  /* SNS 裡切換分頁：跟 Instagram 一樣直接換，不做動畫（下面的分頁列才不會跟著跳） */
  if(r.sub==="grp"&&r.id&&!r.m&&new RegExp("/grp\\?id="+encodeURIComponent(r.id)+"(&p=(feed|media|shop))?\\|").test(prev)&&["home","feed","media","shop",null].includes(r.p||null)) return null;   // 社群 Home／Feed／MEET・Media／Shop 之間切換：直接換，不閃
  if(r.sub==="sns"&&prev.includes("/sns")) return ["home","reels","dm","explore"].includes(r.p||"home")||(r.p==="profile"&&!r.id)?null:"op";
  return d>pd?"push":d<pd?"pop":"fade";
}

/* ===== 下拉更新 ===== */
const PTR={y0:null,x0:0,pull:0,busy:false};
function ptrEl(){ let p=document.getElementById("ptr"); if(!p){ p=document.createElement("div"); p.id="ptr"; p.className="ptr"; p.setAttribute("aria-hidden","true");
  p.innerHTML=`<svg class="ptr-ring" viewBox="0 0 36 36"><circle class="ptr-bg" cx="18" cy="18" r="13"/><circle class="ptr-arc" cx="18" cy="18" r="13" pathLength="100"/></svg>`; document.body.appendChild(p); } return p; }
const ptrOk=()=>!document.getElementById("coach")&&!document.querySelector(".coach")&&!document.documentElement.classList.contains("tie2l")&&!document.querySelector(".crp")&&!!document.querySelector(".nav,.t-msgs")&&!((document.querySelector(".t-page")||{}).scrollTop>0)&&!layer.innerHTML.trim()&&!document.querySelector(".concert,.mr")&&window.scrollY<=0&&!(document.getElementById("askLayer")||{}).innerHTML;
function ptrSet(y){ const p=ptrEl(); p.style.transform=`translate(-50%,${y-56}px)`; p.style.opacity=Math.min(1,y/40); if(!p.classList.contains("spin")) p.querySelector(".ptr-arc").style.strokeDasharray=`${Math.min(85,y/72*85)} 100`; }
/* 手指下面有「自己會捲」而且已經往下捲的區塊（例如 SNS 整頁）：那是在往回捲，不是下拉更新 */
const ptrInner=t=>{ for(let el=t; el&&el!==document.body&&el.nodeType===1; el=el.parentElement){ if(el.scrollTop>0){ const oy=getComputedStyle(el).overflowY; if(oy==="auto"||oy==="scroll") return true; } } return false; };
document.addEventListener("touchstart",e=>{ if(PTR.busy||e.touches.length!==1||!ptrOk()||ptrInner(e.target)) { PTR.y0=null; return; } PTR.y0=e.touches[0].clientY; PTR.x0=e.touches[0].clientX; PTR.pull=0; },{passive:true});
document.addEventListener("touchmove",e=>{
  if(PTR.y0==null) return; const dy=e.touches[0].clientY-PTR.y0, dx=Math.abs(e.touches[0].clientX-PTR.x0);
  if(dy<=2){ if(dy<-6&&PTR.pull===0) PTR.y0=null; return; }
  if(window.scrollY>0||(document.querySelector(".t-page")||{}).scrollTop>0||(PTR.pull===0&&dx>dy)){ PTR.y0=null; return; }
  e.preventDefault(); PTR.pull=Math.min(130,dy*.5); const p=ptrEl(); p.classList.remove("back","spin","ok");
  ptrSet(PTR.pull,PTR.pull>72?"放開就更新 ✨":"下拉更新");
  const app=root.querySelector(".app"); if(app&&!document.querySelector(".t-msgs")) app.style.transform=`translateY(${PTR.pull*.35}px)`;   /* TIE 聊天室：只轉圈圈，標題列不跟著往下拉開 */
},{passive:false});
document.addEventListener("touchend",()=>{
  if(PTR.y0==null) return; PTR.y0=null; const p=ptrEl(), app=root.querySelector(".app");
  if(app){ app.style.transition="transform .3s"; app.style.transform=""; setTimeout(()=>{ if(app) app.style.transition=""; },320); }
  p.classList.add("back");
  if(PTR.pull>72){ PTR.busy=true; p.classList.add("spin"); ptrSet(64,"更新中…");
    try{ if(HB.tok) hbPoll(); }catch(e){}
    setTimeout(()=>{ const y=window.scrollY; ui.pgKey=null; render(); window.scrollTo(0,y); p.classList.remove("spin"); p.classList.add("ok"); ptrSet(64);
      setTimeout(()=>{ ptrSet(0); PTR.busy=false; setTimeout(()=>p.classList.remove("ok"),400); },650); },900);
  } else ptrSet(0);
  PTR.pull=0;
});

/* ===== 加到主畫面 ===== */
function openA2H(){
  tieModal("加到主畫面",`<ol class="a2h"><li><b>1</b><span>用 Safari 打開這個 App 的連結</span></li><li><b>2</b><span>點下方的「分享」按鈕（方框加向上箭頭）</span></li><li><b>3</b><span>往下找「加入主畫面」，名稱填「HAECHU」後按「新增」</span></li></ol>
    <p class="a2h-n">之後從主畫面的圖示就能直接打開。現在這個版本放在 Claude 的頁面裡，打開時上方還會看到瀏覽器的列；要變成完全全螢幕的 App，需要把它放到自己的網址上。</p>`,`<button class="t-mbtn main" data-a="tCloseLayer">知道了</button>`);
}

/* ===== TIE BOX：照片、語音（存在這支手機的 IndexedDB） ===== */
const memBlobs={};
/* 上傳追蹤：照片／影片放進手機後馬上傳雲端；發文前會等它傳完；傳失敗的記下來，之後自動重傳（不然別人看到的是沒有照片的貼文） */
const UPQ={}, UPQ_K="daisuki_m_upq";
const upqGet=()=>{ try{ return JSON.parse(localStorage.getItem(UPQ_K)||"[]"); }catch(e){ return []; } }, upqSet=L=>{ try{ localStorage.setItem(UPQ_K,JSON.stringify([...new Set(L)].slice(-200))); }catch(e){} };
function upTrack(id,blob){ const o=UPQ[id]={done:false,ok:false}; o.p=Promise.resolve().then(()=>hbUpload(id,blob)).then(ok=>{ o.done=true; o.ok=!!ok; if(ok) upqSet(upqGet().filter(x=>x!==id)); else upqSet([...upqGet(),id]); return o.ok; }).catch(()=>{ o.done=true; upqSet([...upqGet(),id]); return false; }); return o.p; }
async function upRetry(){ try{ if(!HB_ON||!HB.tok||sbxOn()) return; for(const id of upqGet()){ if(UPQ[id]&&!UPQ[id].done) continue; const b=memBlobs[id]||await (async()=>{ try{ const d=await MDB.open(); return await new Promise(res=>{ const q=d.transaction("m").objectStore("m").get(id); q.onsuccess=()=>{ const v=q.result; res(v&&v.ab?new Blob([v.ab],{type:v.type||""}):v||null); }; q.onerror=()=>res(null); }); }catch(e){ return null; } })(); if(!b){ upqSet(upqGet().filter(x=>x!==id)); continue; } await upTrack(id,b); } }catch(e){} }
setInterval(upRetry,30e3); setTimeout(upRetry,8e3);
async function upWait(ids){ const P=ids.filter(id=>id&&UPQ[id]).map(id=>UPQ[id].p); if(!P.length) return true; const r=await Promise.race([Promise.all(P),new Promise(res=>setTimeout(()=>res(null),90e3))]); return Array.isArray(r)&&r.every(Boolean); }
/* 發文按下去：照片／影片還在傳，就先等傳完再發 */
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="publish"],[data-a="snPost"]'); if(!t||t.dataset.upOk) return;
  const ids=t.dataset.a==="publish"?(ui.composeMedia||[]).flatMap(m=>[m.mid,m.thumb]):((ui.snDraft||{}).media||[]).flatMap(m=>[m.mid,m.poster]);
  const pend=ids.filter(id=>id&&UPQ[id]&&!UPQ[id].done); if(!pend.length) return; e.stopImmediatePropagation(); e.preventDefault(); if(t.dataset.upWait) return; t.dataset.upWait="1"; toast("照片／影片上傳中，傳完會自動發布…");
  upWait(pend).then(ok=>{ delete t.dataset.upWait; if(!ok) toast("有檔案還沒傳完，先發布，傳完後大家就看得到"); const b=t.isConnected?t:document.querySelector(`[data-a="${t.dataset.a}"]`); if(!b) return; b.dataset.upOk="1"; b.click(); delete b.dataset.upOk; }); },true);
const MDB={
  db:null,
  open(){ if(!this.db) this.db=new Promise((res,rej)=>{ try{ const r=indexedDB.open("daisuki_media",1); r.onupgradeneeded=()=>r.result.createObjectStore("m"); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }catch(e){ rej(e); } }); return this.db; },
  async put(id,blob,noUp){ memBlobs[id]=blob; if(!noUp) upTrack(id,blob);  try{ const val={ab:await blob.arrayBuffer(),type:blob.type||""};   // 存成原始資料：iPhone 上直接存檔案，重開後會讀不出來
      const d=await this.open(); await new Promise((res,rej)=>{ const tx=d.transaction("m","readwrite"); tx.objectStore("m").put(val,id); tx.oncomplete=res; tx.onerror=()=>rej(tx.error); }); }catch(e){} },
  async get(id){ if(memBlobs[id]) return memBlobs[id];
    let b=null; try{ const d=await this.open(); b=await new Promise(res=>{ const q=d.transaction("m").objectStore("m").get(id); q.onsuccess=()=>res(q.result||null); q.onerror=()=>res(null); }); }catch(e){}
    if(b&&b.ab) b=new Blob([b.ab],{type:b.type||""});
    else if(b){ try{ b=new Blob([await b.arrayBuffer()],{type:b.type||""}); }catch(e){ b=null; } }   // 舊版存的檔案：讀得出來就轉成新的，讀不出來就當作沒有
    if(!b){ try{ const du=localStorage.getItem("daisuki_m_"+id); if(du) b=b64Blob(du); }catch(e){} }
    if(!b){ b=await hbDownload(id); if(b&&b.size<45*1024*1024) this.put(id,b,true); }   /* 大影片不存進手機資料庫（iPhone 記憶體會爆） */
    if(b) memBlobs[id]=b; return b; }
};
async function idbHas(id){ try{ const d=await MDB.open(); return await new Promise(res=>{ const q=d.transaction("m").objectStore("m").get(id); q.onsuccess=()=>res(!!q.result); q.onerror=()=>res(false); }); }catch(e){ return false; } }
const mediaURL={};
async function mediaSrc(id){ if(mediaURL[id]) return mediaURL[id]; const b=await MDB.get(id); if(!b) return null; return mediaURL[id]=URL.createObjectURL(b); }
/* 圖片：記下每張圖的長寬比，畫面重畫時先把高度留好，圖還沒解碼也不會塌下去再彈回來（公司公告一閃一閃） */
const IMR=new Map(); document.addEventListener("load",e=>{ const im=e.target; if(im&&im.tagName==="IMG"&&im.naturalWidth){ const k=im.getAttribute("src"); if(k&&!IMR.has(k)) IMR.set(k,im.naturalWidth+" / "+im.naturalHeight); } },true);
function imgKeep(scope){ try{ scope.querySelectorAll("img[src]").forEach(im=>{ const r=IMR.get(im.getAttribute("src")); if(r&&!im.style.aspectRatio) im.style.aspectRatio=r; }); }catch(e){} }
/* 日期欄位：選到 min 之前／max 之後，直接拉回能選的那天（不跳提示） */
["change","input","blur"].forEach(k=>document.addEventListener(k,e=>{ const el=e.target; if(!el||el.tagName!=="INPUT"||el.type!=="date"||!el.value) return; if(el.min&&el.value<el.min) el.value=el.min; else if(el.max&&el.value>el.max) el.value=el.max; },true));
function hydrateMedia(scope){ imgKeep(scope); try{ scope.querySelectorAll(".pd button.pm-video[data-mid]").forEach(b=>setTimeout(()=>pmInline(b,false),60)); }catch(e){} scope.querySelectorAll(".t-vc[data-vid]").forEach(v=>{ mediaSrc(v.dataset.vid); });
  scope.querySelectorAll("img[data-mid]:not([data-hyd])").forEach(async el=>{ el.dataset.hyd="1"; const u=await mediaSrc(el.dataset.mid); if(u) el.src=u; else { const b=el.closest(".t-photo,button"); if(b) b.classList.add("gone"); } }); }
const fmtDur=s=>{ s=Math.max(0,Math.round(s||0)); return Math.floor(s/60)+":"+pad(s%60); };

function mediaBubble(w){
  if(w.kind==="photo") return `<button class="t-photo" data-a="tPhoto" data-mid="${w.mid}" data-ts="${w.ts}" style="aspect-ratio:${w.w||3}/${w.h||4}" aria-label="照片"><img data-mid="${w.mid}" alt="照片"></button>`;
  if(w.kind==="voice") return `<div class="t-vc" data-vid="${w.mid}" ${w.from==="artist"&&w.id&&(session()||{}).role==="fan"?`data-lp="${w.id}"`:""} data-a="tVoice" data-mid="${w.mid}" role="button" aria-label="播放語音"><span class="t-vplay">${VPLAY}</span><span class="t-wave">${[46,78,100,62,88].map(h=>`<i style="height:${h}%"></i>`).join("")}</span><em>${fmtDur2(w.dur)}</em></div>`;
  return "";
}
/* 語音播放：同一時間只播一則 */
const VP={a:null,mid:null};
const VPLAY='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.6v14.8c0 .8.9 1.3 1.6.9l12-7.4c.6-.4.6-1.3 0-1.7l-12-7.4C7.9 3.3 7 3.8 7 4.6z"/></svg>';
const VPAUSE='<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4.2" height="15" rx="1.4"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1.4"/></svg>';
const fmtDur2=s=>{ s=Math.max(0,Math.round(s||0)); return pad(Math.floor(s/60))+":"+pad(s%60); };
function vpUI(){ document.querySelectorAll(".t-vc").forEach(v=>{ const on=v.dataset.vid===VP.mid&&VP.a&&!VP.a.paused; const b=v.querySelector(".t-vplay"); if(b) b.innerHTML=on?VPAUSE:VPLAY; v.classList.toggle("playing",!!on);
  const bars=v.querySelectorAll(".t-wave i"), p=v.dataset.vid===VP.mid&&VP.a&&VP.a.duration?VP.a.currentTime/VP.a.duration:0; bars.forEach((x,i)=>x.classList.toggle("on",i/bars.length<p)); }); }
function playVoice(mid){   // iPhone 要在點下去的那一刻就開始播，所以先準備好音檔網址
  if(!VP.a){ VP.a=new Audio(); VP.a.preload="auto"; VP.a.ontimeupdate=vpUI; VP.a.onended=()=>{ VP.a.currentTime=0; vpUI(); }; VP.a.onpause=vpUI; VP.a.onplay=()=>{ vpUI(); const f=()=>{ if(VP.a&&!VP.a.paused){ vpUI(); requestAnimationFrame(f); } }; requestAnimationFrame(f); }; }
  const A=VP.a;
  if(VP.mid===mid&&A.src){ if(A.paused) A.play().catch(()=>{}); else A.pause(); vpUI(); return; }
  A.pause(); VP.mid=mid;
  const go=u=>{ A.src=u; A.currentTime=0; A.play().then(vpUI).catch(err=>{ if(err&&err.name==="NotAllowedError") toast("再點一次就能播放"); else toast("這個音檔格式無法播放，換成 m4a 或 mp3 試試"); vpUI(); }); };
  if(mediaURL[mid]) go(mediaURL[mid]);
  else { A.play().catch(()=>{}); mediaSrc(mid).then(u=>{ if(!u){ toast("這則語音已經不在這支手機上了"); return; } if(VP.mid===mid) go(u); }); }
  vpUI();
}
function openPhoto(mid,ts){
  /* TIE 裡藝人傳的照片：粉絲可以收藏到 TIE BOX */
  const w=(session()||{}).role==="fan"&&route().m?fanRoom(route().m).find(x=>x.mid===mid&&x.from==="artist"):null, kept=w&&(S.get(K.boxKeep,[])||[]).includes(w.id);
  setLayer(`<div class="ph-view" data-a="tCloseLayer" role="dialog" aria-label="照片"><button class="ph-x" data-a="tCloseLayer" aria-label="關閉">${XI}</button>${w?`<button class="ph-keep ${kept?"on":""}" data-a="${kept?"boxDel":"tKeep"}" data-id="${w.id}" aria-label="${kept?"從 TIE BOX 移除":"收藏到 TIE BOX"}">${kept?"已收藏":"收藏到 "+WHISPER_NAME+" BOX"}</button>`:""}<img data-mid="${mid}" alt="照片"><small>${ts?ymd(+ts)+" "+timeHM(+ts):""}</small></div>`,"photo");
  hydrateMedia(layer);
}
async function prepPhoto(file){   // 縮到長邊 1280，省空間
  const url=URL.createObjectURL(file); const img=await new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=url; });
  const k=Math.min(1,1080/Math.max(img.width,img.height)), c=document.createElement("canvas"); c.width=Math.round(img.width*k); c.height=Math.round(img.height*k);
  c.getContext("2d").drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(url);
  const blob=await new Promise(res=>c.toBlob(res,"image/jpeg",.8)); return {blob,w:c.width,h:c.height};
}
function audioDur(blob){ return new Promise(res=>{ const a=new Audio(), u=URL.createObjectURL(blob); let done=false; const fin=v=>{ if(done) return; done=true; URL.revokeObjectURL(u); res(v); };
  a.preload="metadata"; a.onloadedmetadata=()=>fin(isFinite(a.duration)?a.duration:0); a.onerror=()=>fin(0); setTimeout(()=>fin(0),4000); a.src=u; }); }
function sendWhisperMedia(memberId,kind,mid,meta){
  const m=MEMBERS[memberId], label=kind==="photo"?"📷 照片":"🎙️ 語音";
  S.set(K.whispers,[...S.get(K.whispers,[]),{id:"w"+Date.now(),member:memberId,from:"artist",kind,mid,text:label,ts:Date.now(),...meta}]);
  return feedPush({kind:"whisper",member:memberId,group:m.group,text:kind==="photo"?"📷 照片":"🎙️ 語音",color:null,direct:true},"tie:"+memberId);
}
function openAttach(){
  tieModal("傳照片或語音",`<div class="t-att">
    <label><span>📷</span><div>照片<small>從相簿選，或直接拍一張</small></div><input type="file" id="attPhoto" accept="image/*"></label>
    <label><span>🎙️</span><div>語音<small>選一個錄好的音檔（例如語音備忘錄）</small></div><input type="file" id="attVoice" accept="audio/*,.m4a,.mp3,.wav,.aac"></label></div>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button>`);
}
/* 側邊選單左下：藝人在你訂閱期間傳的照片、影片（訂閱前的看不到），依日期分組，一列 3 格 */
function viewTieGallery(member){ const L=fanRoom(member).filter(w=>w.from==="artist"&&(w.kind==="photo"||w.kind==="video")).sort((a,b)=>b.ts-a.ts); const by={};
  L.forEach(w=>{ const k=ymd(w.ts); (by[k]=by[k]||[]).push(w); });
  return `<div class="t-page"><header class="t-ph"><button class="t-ib" data-a="back" aria-label="返回">${TI.back}</button><h3>照片・影片</h3><span class="t-ph-sp"></span></header>
    ${L.length?Object.entries(by).map(([d,ws])=>`<h4 class="tg-d">${d}</h4><div class="tb-grid">${ws.map(w=>`<button data-a="tPhoto" data-mid="${w.mid}" data-ts="${w.ts}" aria-label="照片"><img data-mid="${w.mid}" alt="">${w.kind==="video"?`<em>▶</em>`:""}</button>`).join("")}</div>`).join("")
      :`<p class="tb-empty">還沒有收到 ${esc(artName(member,"tie"))} 的照片或影片<br><small>訂閱之前傳的照片、影片看不到喔</small></p>`}</div>`; }
/* TIE BOX（照 Bubble 的 OUR BOX）：長按藝人的訊息（文字、照片、語音都可以）收藏到這裡；最多 BOX_MAX 則 */
const BOX_MAX=9;
function viewTieBox(member){
  const KS=S.get(K.boxKeep,[])||[], room=fanRoom(member), keep=KS.map(id=>room.find(w=>w.id===id&&w.from==="artist")).filter(Boolean).reverse(), ed=!!ui.boxEdit;
  const item=w=>`<div class="ob-it ${ed?"ed":""}">${ed?`<button class="ob-x" data-a="boxDel" data-id="${w.id}" aria-label="移除">${XI}</button>`:""}
      ${w.kind==="photo"?`<button class="ob-ph" data-a="tPhoto" data-mid="${w.mid}" data-ts="${w.ts}" aria-label="照片"><img data-mid="${w.mid}" alt=""></button>`:w.kind?mediaBubble(w):`<div class="ob-tx">${nickify(esc(w.ko||w.text),member)}</div>`}
      <small>${ymd(w.ts)}</small></div>`;
  return `<div class="t-page ob"><header class="ob-h"><button class="t-ib" data-a="back" aria-label="返回">${TI.back}</button><span></span>${keep.length?`<button class="t-ib ${ed?"ob-done":""}" data-a="boxEdit" aria-label="${ed?"完成":"編輯"}">${ed?"完成":`<span class="ob-dots"><i></i><i></i><i></i></span>`}</button>`:`<span class="t-ib"></span>`}</header>
    <h2 class="ob-t">${WHISPER_NAME} BOX</h2><div class="ob-n"><b>${keep.length}</b> / ${BOX_MAX}</div>
    ${keep.length?`<div class="ob-list">${keep.map(item).join("")}</div>`:`<p class="ob-empty">沒有收藏的訊息<br>請自由收藏聊天室裡的訊息:)</p>`}</div>`;
}
/* 示範：露娜的聊天室先放一張照片、一則語音 */


