/* HAECHU｜共用基礎：動畫、共用資料、儲存 */
/* =========================================================
   動態效果（anime.js 4.5，檔案放在 vendor/，不靠外部 CDN）
   ・換頁：彈簧滑入，換分頁時內容一塊一塊浮上來
   ・導覽列鏡片：彈簧滑過去，滑的時候拉長一點（像果凍）
   ・彈窗、底部選單、提示：彈簧彈出
   ・按任何按鈕：按下去縮一點，放開彈回來
   ・按讚：愛心彈一下＋噴小愛心
   anime.js 還沒載好、或手機開了「減少動態效果」：全部照原本的 CSS 動畫，不會壞
   ========================================================= */
var AN={
  rm(){ try{ return matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){ return false; } },
  ok(){ return !!window.anime&&document.documentElement.classList.contains("mo")&&!AN.rm(); },
  sp(b,d){ return anime.spring({bounce:b,duration:d}); },
  clean(t,props){ (t&&t.length!=null?[...t]:[t]).forEach(e=>{ if(e&&e.style) (props||["transform","opacity"]).forEach(p=>e.style.removeProperty(p)); }); },
  run(t,p,props){ try{ return anime.animate(t,{...p,onComplete:()=>AN.clean(t,props)}); }catch(e){ AN.clean(t,props); } },
  /* 換頁 */
  page(app,pa,fixed){ if(!app) return;
    if(fixed||pa==="op") AN.run(app,{opacity:{from:0,to:1,duration:240,ease:"outQuad"}});
    else if(pa==="push"||pa==="pop"){ const s=pa==="push"?1:-1; AN.run(app,{x:{from:34*s,to:0,duration:380,ease:"outBack(1.1)"},opacity:{from:0,to:1,duration:200,ease:"outQuad"}}); }
    else AN.run(app,{opacity:{from:0,to:1,duration:200,ease:"outQuad"}});
    if(!fixed&&(pa==="fade"||pa==="op")) AN.cascade(app);
  },
  /* 換分頁：畫面裡看得到的區塊，一塊接一塊浮上來 */
  cascade(app){ let box=app.querySelector(":scope > main")||app.querySelector("main")||app;
    for(let k=0;k<3&&box.children.length===1;k++) box=box.children[0];
    const H=window.innerHeight; const kids=[...box.children].filter(e=>{ if(e.nodeType!==1) return false; const r=e.getBoundingClientRect(); if(r.height<2||r.top>H||r.bottom<0) return false; const ps=getComputedStyle(e).position; return ps!=="fixed"&&ps!=="sticky"; }).slice(0,10);
    if(kids.length<2) return;
    AN.run(kids,{y:{from:16,to:0,duration:460,ease:"outBack(1.3)"},opacity:{from:0,to:1,duration:260,ease:"outQuad"},delay:anime.stagger(38)});
  },
  /* 導覽列鏡片：從 f 滑到 i */
  lens(L,f,i){ if(!L||!(f>=0)||f===i||!AN.ok()) return false;
    try{ L.style.transition="none"; L.classList.remove("go"); L.classList.add("mo-run");
      anime.animate(L,{ x:{from:f*100+"%",to:i*100+"%",ease:AN.sp(.3,520)},
        scaleX:[{to:1.18,duration:150,ease:"outQuad"},{to:1,ease:AN.sp(.5,460)}],
        scaleY:[{to:1.08,duration:150,ease:"outQuad"},{to:1,ease:AN.sp(.5,460)}],
        onComplete:()=>{ L.style.removeProperty("transform"); L.style.transition=""; L.classList.remove("mo-run"); } });
      return true; }catch(e){ L.style.transition=""; return false; } },
  /* 彈窗、底部選單 */
  SH:".ios-sh,.mu2-sh,.pv-s,.sheet,.t-sheet,.cmx-sh",
  AL:".ios-al,.pv-d,.t-modal",
  pop(n){ if(!AN.ok()||!n||n.nodeType!==1||n.closest(".static")) return;
    const sh=n.matches(AN.SH)?[n]:[...n.querySelectorAll(AN.SH)], al=n.matches(AN.AL)?[n]:[...n.querySelectorAll(AN.AL)];
    sh.forEach(el=>{ el.style.animation="none"; AN.run(el,{y:{from:"100%",to:0,ease:AN.sp(.14,480)}},["transform"]); });
    al.forEach(el=>{ el.style.animation="none"; AN.run(el,{scale:{from:.86,to:1,ease:AN.sp(.38,420)},opacity:{from:0,to:1,duration:160,ease:"outQuad"}}); });
  },
  toastIn(el){ if(!AN.ok()) return; el.style.animation="none"; AN.run(el,{y:{from:18,to:0,ease:AN.sp(.4,460)},scale:{from:.88,to:1,ease:AN.sp(.4,460)},opacity:{from:0,to:1,duration:180,ease:"outQuad"}}); },
  toastOut(el){ if(!AN.ok()){ el.classList.add("out"); setTimeout(()=>el.remove(),260); return; }
    try{ anime.animate(el,{y:{to:8,duration:220,ease:"inQuad"},scale:{to:.94,duration:220,ease:"inQuad"},opacity:{to:0,duration:200,ease:"inQuad"},onComplete:()=>el.remove()}); }catch(e){ el.remove(); } },
  /* 按讚：愛心彈一下＋噴小愛心 */
  heart(t){ if(!AN.ok()||!t) return; const sv=t.querySelector("svg"); if(!sv) return;
    sv.style.animation="none"; anime.animate(sv,{scale:[{to:1.45,duration:130,ease:"outQuad"},{to:1,ease:AN.sp(.62,520)}],onComplete:()=>AN.clean(sv,["transform"])});
    const z=(typeof ZM==="function"?ZM():1)||1, r=sv.getBoundingClientRect(), w=document.createElement("div");
    w.className="an-burst"; w.style.left=(r.left+r.width/2)/z+"px"; w.style.top=(r.top+r.height/2)/z+"px";
    const C=["#FF7DB5","#FFB23F","#B48CFF","#FF9CC8","#8E6BFF","#FFC6E0"], N=7;
    w.innerHTML=Array.from({length:N},(_,k)=>`<i style="color:${C[k%C.length]}"><svg viewBox="0 0 24 24"><path d="M12 21C5 16 2 12 3.5 8 5 4.5 9.5 4 12 7.5 14.5 4 19 4.5 20.5 8 22 12 19 16 12 21Z" fill="currentColor"/></svg></i>`).join("");
    document.body.appendChild(w); const ps=[...w.children];
    try{ anime.animate(ps,{ x:(_,k)=>Math.cos(k/N*Math.PI*2-Math.PI/2)*(26+Math.random()*10), y:(_,k)=>Math.sin(k/N*Math.PI*2-Math.PI/2)*(26+Math.random()*10)-6,
        scale:[{from:0,to:1,duration:180,ease:"outBack"},{to:0,duration:320,delay:120,ease:"inQuad"}], rotate:()=>anime.random(-30,30), duration:620, ease:"outExpo", onComplete:()=>w.remove() }); }catch(e){ w.remove(); }
    setTimeout(()=>w.remove(),1200);
  },
};
/* 按壓回饋：按下縮一點，放開彈回來（用 CSS 的 scale，不會蓋掉元素原本的 transform） */
(function(){
  const PR="button,.btn,a[href],[data-a]", NO="input,textarea,select,label,[contenteditable],.no-press,.mr,.t-msgs,.ab-w,.gc-rit,.concert,.crp,canvas,.sn-reel1,.pm-car,.gal2,.ios-w,.scrim,.t-modal-w,.t-sheet-w,.mu2-shw,.fg-w,.t-drawer-w>.t-drawer,.nav-lens";
  let cur=null;
  const up=()=>{ const t=cur; cur=null; if(!t) return; try{ anime.animate(t,{"--mp":{to:1,ease:AN.sp(.55,380)},onComplete:()=>{ if(cur!==t){ t.classList.remove("mo-p"); t.style.removeProperty("--mp"); } }}); }catch(e){ t.classList.remove("mo-p"); t.style.removeProperty("--mp"); } };
  document.addEventListener("pointerdown",e=>{ if(!AN.ok()||e.button>0) return; const t=e.target.closest&&e.target.closest(PR); if(!t||t.closest(NO)||t.disabled) return;
    const r=t.getBoundingClientRect(), z=(typeof ZM==="function"?ZM():1)||1, h=r.height/z, w=r.width/z; if(h>220||w<1||(w>360&&h>120)) return;
    cur=t; t.style.setProperty("--mp","1"); t.classList.add("mo-p"); try{ anime.animate(t,{"--mp":{to:t.closest(".nav-in")?.86:(h<60&&w<120?.9:.96),duration:110,ease:"outQuad"}}); }catch(e){} },{passive:true,capture:true});
  document.addEventListener("pointerup",up,true); document.addEventListener("pointercancel",up,true);
  document.addEventListener("pointermove",e=>{ if(cur&&e.pointerType!=="mouse"&&Math.abs(e.movementY||0)>6) up(); },{passive:true});
})();
/* 載好 anime.js：開啟 */
window.__anReady=function(){ if(window.anime&&!AN.rm()) document.documentElement.classList.add("mo"); };
if(window.anime) __anReady();
/* 彈窗出現在 #layer、#askLayer：自動彈出 */
(function(){ const watch=el=>{ if(!el||el.__anW) return; el.__anW=1; new MutationObserver(ms=>{ if(!AN.ok()) return; for(const m of ms) for(const n of m.addedNodes) AN.pop(n); }).observe(el,{childList:true}); };
  const go=()=>{ watch(document.getElementById("layer")); watch(document.getElementById("askLayer")); };
  go(); new MutationObserver(ms=>{ for(const m of ms) for(const n of m.addedNodes) if(n.id==="askLayer") watch(n); }).observe(document.body,{childList:true});
})();
/* =========================================================
   1. 共用資料：兩端都從這裡讀，名稱只在這裡改一次
   ========================================================= */
const APP_NAME = "HAECHU";           // App 名稱，之後只要改這一行
const WHISPER_NAME = "TIE";          // 藝人私訊功能名稱，之後只要改這一行

const GRADS = [
  ["#A47BFF","#F472B6"], ["#818CF8","#C084FC"], ["#60A5FA","#A47BFF"], ["#F9A8D4","#FDBA74"],
  ["#5EEAD4","#818CF8"], ["#C084FC","#F0ABFC"], ["#FDA4AF","#C7AEFF"], ["#93C5FD","#F9A8D4"]
];
const grad = i => `linear-gradient(135deg,${GRADS[i%GRADS.length][0]},${GRADS[i%GRADS.length][1]})`;

/* 團和藝人都由管理員在「藝人與團」建立（mergeRoster 讀進來），App 本身不放任何假的團或藝人 */
const GROUPS = [];
const MEMBERS = {};
const groupOf = id => GROUPS.find(g=>g.id===id);
const ME = {name:"棉花糖粉絲", g:3};   // 示範粉絲本人
/* 粉絲的名稱：除了 TIE 聊天室裡的暱稱，其他地方（社群、留言、直播…）都用這一個，在 ME 改 */
const nickKey=()=>{ const s=(typeof ssMem!=="undefined"&&ssMem)||null; return s&&s.email?String(s.email).toLowerCase():""; };
function applyNick(){ const k=nickKey(); const n=k&&S.get(K.nicks,{})[k]; if(n) ME.name=n; }
function setNick(v){ const k=nickKey(); if(!k) return; const N=S.get(K.nicks,{}); N[k]=v; S.set(K.nicks,N); ME.name=v; }
/* 帳號：正式網站從後台讀（密碼只在後台，程式碼裡沒有）。
   Claude 預覽的本機試玩：只有帳號名稱，密碼隨便打都可以登入（資料只在這支手機，不會影響正式網站） */
const ACCOUNTS = {
  "fan":   {user:"fan",   role:"fan",   name:"棉花糖粉絲"},
  "luna":  {user:"luna",  role:"fan",   name:"露娜"},
  "husay": {user:"Husay", role:"admin", name:"HUSSEY"},
  "k1rinn":{user:"k1rinn",role:"admin", name:"k1rinn"},
};
/* 改成正式版：第一次打開時，把舊版留在手機裡的示範資料全部清掉，大家從空白開始 */
(function cleanStart(){ try{ if(localStorage.getItem("daisuki_clean_v2")) return;
  Object.keys(localStorage).filter(k=>k.startsWith("daisuki_")).forEach(k=>localStorage.removeItem(k));
  localStorage.setItem("daisuki_clean_v2","1"); }catch(e){} })();
(function mergeRoster(){   // 管理員新增的團、藝人、帳號
  try{ const r=JSON.parse(localStorage.getItem("daisuki_roster")||"null"); if(!r) return;
    (r.groups||[]).forEach(g=>{ if(!GROUPS.some(x=>x.id===g.id)) GROUPS.push(g); });
    Object.assign(MEMBERS,r.members||{}); Object.assign(ACCOUNTS,r.accounts||{}); }catch(e){}
})();

/* localStorage keys（沿用交接文件的 key） */
const K = {
  usedNames:"daisuki_used_names", snRetired:"daisuki_sn_retired",
  vsec:"daisuki_vsec", bdPush:"daisuki_bd_push", cmTr:"daisuki_cm_tr", trucks:"daisuki_trucks", tieVch:"daisuki_tie_vouchers", tkSeen:"daisuki_truck_seen", lvFix:"daisuki_lv_fix", ptRst:"daisuki_pt_rst", revB:"daisuki_rev_b", tieQ0:"daisuki_tie_q0", bgm:"daisuki_live_bgm", tieArtBg:"daisuki_tie_artbg", mPhoto:"daisuki_member_photo", wtours:"daisuki_wtours", debut:"daisuki_debut", liveTr:"daisuki_live_tr", postTr:"daisuki_post_tr", gcPity:"daisuki_gc_pity", lvMax:"daisuki_lv_max", tourTix:"daisuki_tour_tix", tourStamp:"daisuki_tour_stamp", online:"daisuki_online", news:"daisuki_news", newsHide:"daisuki_news_hide", newsEd:"daisuki_news_ed",
  ptGrants:"daisuki_pt_grants", ptGot:"daisuki_pt_got",
  albums2:"daisuki_albums2", seedAlb2:"daisuki_seed_alb2",
  pcImgs:"daisuki_pc_imgs",
  albums:"daisuki_albums", seedAlb:"daisuki_seed_alb", albBuy:"daisuki_album_buys",
  grpSeen:"daisuki_group_seen",
  gTheme:"daisuki_group_theme", pwOpen:"daisuki_pw_open", seedPriv:"daisuki_seed_priv", seedPriv2:"daisuki_seed_priv2", seedArtFan:"daisuki_seed_artfan", themes:"daisuki_themes", seedThemes:"daisuki_seed_themes", seedThemes2:"daisuki_seed_themes2", seedMascot:"daisuki_seed_mascot", seedMascot2:"daisuki_seed_mascot2", artProf:"daisuki_art_prof", gPhoto:"daisuki_group_photo", artBday:"daisuki_art_bday", tours:"daisuki_tours", tieLeft:"daisuki_tie_left", banned:"daisuki_banned", sns:"daisuki_sns2", artNSeen:"daisuki_art_nseen", mediaName:"daisuki_media_name", nicks:"daisuki_nicks", pollVotes:"daisuki_poll_votes", thOwned:"daisuki_th_owned", thCur:"daisuki_th_cur", thRot:"daisuki_th_rot", lockCfg:"daisuki_lock", vods:"daisuki_vods", seedVod:"daisuki_seed_vod", fandom:"daisuki_fandom", tieAgree:"daisuki_tie_agree", tieCele:"daisuki_tie_cele", boxKeep:"daisuki_box_keep", pickNoShow:"daisuki_pick_noshow", cmProf:"daisuki_cm_prof", bm:"daisuki_bookmarks", fanLetters:"daisuki_fan_letters", ltDraft:"daisuki_letter_draft", cmNotif:"daisuki_cm_notif", seedPhotos:"daisuki_seed_photos", seedPhotos2:"daisuki_seed_photos2", stores:"daisuki_stores", seedStores:"daisuki_seed_stores", ldGiven:"daisuki_ld_given", seedStores2:"daisuki_seed_stores2", mcGot:"daisuki_mc_got", fanPosts:"daisuki_fan_posts", mFollow:"daisuki_member_follow",
  gNotices:"daisuki_group_notices", seedGN:"daisuki_seed_gn",
  notifs:"daisuki_notifications", maint:"daisuki_maint", feed:"daisuki_feed", feedSeen:"daisuki_feed_seen", unread:"daisuki_notif_unread", fanArtists:"daisuki_fan_artists",
  posts:"daisuki_posts", session:"daisuki_session", settings:"daisuki_notif_settings",
  likes:"daisuki_liked", comments:"daisuki_comments", whispers:"daisuki_whispers", wRead:"daisuki_whisper_read", wArtistRead:"daisuki_whisper_artist_read", wSubs:"daisuki_whisper_subs", tieSubs:"daisuki_tie_passes", tieWelcome:"daisuki_tie_welcome", tieReadBy:"daisuki_tie_read_by", msPub:"daisuki_ms_public", points:"daisuki_points", seed9:"daisuki_seed_pass_v1", anns:"daisuki_announcements", seed10:"daisuki_seed_ann_v1", pick:"daisuki_promo_pick", sched:"daisuki_schedule", lightsea:"daisuki_lightsea", tieSet:"daisuki_tie_settings", tieCleared:"daisuki_tie_cleared", tieTr:"daisuki_tie_translated", tieNotice:"daisuki_tie_notice", lives:"daisuki_lives", events:"daisuki_events", seed5:"daisuki_seed_live_v1", sticks:"daisuki_lightsticks", seed12:"daisuki_seed_media_v1", seed13:"daisuki_seed_comments_v1", membership:"daisuki_membership", owned:"daisuki_owned", sales:"daisuki_sales", revShare:"daisuki_rev_share", seed14:"daisuki_seed_sales_v1", mutes:"daisuki_mutes", roster:"daisuki_roster", tieMs:"daisuki_tie_milestone_msg", msDone:"daisuki_milestones_done", bdays:"daisuki_birthdays", bdayWish:"daisuki_bday_wish", seed15:"daisuki_seed_bday_v1", cards:"daisuki_cards", gachaLog:"daisuki_gacha_log", svOpen:"daisuki_survival_open", svVotes:"daisuki_survival_votes", svMine:"daisuki_survival_mine", stubs:"daisuki_stubs", artistNick:"daisuki_artist_nick", lastEmail:"daisuki_last_email", plans:"daisuki_live_plans", seed11:"daisuki_seed_meet_v2", reports:"daisuki_reports", announce:"daisuki_announce", annSeen:"daisuki_announce_seen", seed6:"daisuki_seed_admin_v1", seeded:"daisuki_seed_v4", mshow:"daisuki_music_show", msVotes:"daisuki_music_votes", msMine:"daisuki_music_my_votes", mvLike:"daisuki_mv_like", seed16:"daisuki_seed_music_v1", aiCfg:"daisuki_ai_cfg", aiFans:"daisuki_ai_fans", aiMem:"daisuki_ai_memory", aiQ:"daisuki_ai_queue", tieTrX:"daisuki_tie_translated_x", trCfg:"daisuki_translate_cfg", fs:"daisuki_fansign", signedAlbums:"daisuki_signed_albums", seed17:"daisuki_seed_fansign_v1", demoOn:"daisuki_demo_buttons", seed18:"daisuki_seed_fansign_v3", theme:"daisuki_theme", leaks:"daisuki_tie_leaks", suspends:"daisuki_suspends", leakPolicy:"daisuki_leak_policy", onboard:"daisuki_onboard", selDone:"daisuki_select_done", cardMeta:"daisuki_card_meta", gachaSnd:"daisuki_gacha_sound", repCard:"daisuki_rep_card", annSeenA:"daisuki_announce_seen_artist", concerts:"daisuki_concerts", curGrp:"daisuki_current_group", tracks:"daisuki_tracks", rgBest:"daisuki_rhythm_best", rgLv:"daisuki_rhythm_level"
};
/* ===== 大資料（TIE 聊天室、SNS、私訊）放手機的大空間（IndexedDB，可以存幾百 MB）=====
   localStorage 只有 5MB，以前塞滿了就存不進去 → 聊天記錄整包讀不到。現在大資料只放記憶體＋大空間 */
const BIGK=k=>typeof k==="string"&&(/^daisuki_(tie:|dm:|sn_)/.test(k)||k==="daisuki_whispers");
const KVX={db:null,ok:false,ready:false,want:false,t:{},q:{}};
KVX.open=()=>KVX.db||(KVX.db=new Promise((res,rej)=>{ try{ const r=indexedDB.open("daisuki_kv",1); r.onupgradeneeded=()=>r.result.createObjectStore("kv"); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); r.onblocked=()=>rej(new Error("blocked")); }catch(e){ rej(e); } }));
function kvxPut(k,v){ KVX.q[k]={v}; clearTimeout(KVX.t[k]); KVX.t[k]=setTimeout(async()=>{ const it=KVX.q[k]; delete KVX.q[k]; if(!it) return; try{ const d=await KVX.open(), st=d.transaction("kv","readwrite").objectStore("kv"); if(it.v===undefined||it.v===null) st.delete(k); else st.put(JSON.stringify(it.v),k); }catch(e){} },250); }
async function kvxLoad(){ try{ const d=await Promise.race([KVX.open(),new Promise((_,r)=>setTimeout(()=>r(new Error("slow")),2000))]);
    await new Promise(res=>{ const to=setTimeout(res,3000); try{ const rq=d.transaction("kv").objectStore("kv").openCursor(); rq.onsuccess=()=>{ const c=rq.result; if(c){ if(!(c.key in mem)) try{ mem[c.key]=JSON.parse(c.value); }catch(e){} c.continue(); } else { clearTimeout(to); res(); } }; rq.onerror=()=>{ clearTimeout(to); res(); }; }catch(e){ clearTimeout(to); res(); } });
    KVX.ok=true;
    /* 以前放在小空間的大資料、照片語音的備份：搬到大空間後從小空間拿掉，騰出空間 */
    try{ Object.keys(localStorage).forEach(k=>{ if(BIGK(k)){ try{ if(!(k in mem)) mem[k]=JSON.parse(localStorage.getItem(k)); kvxPut(k,mem[k]); }catch(e){} localStorage.removeItem(k); } else if(k.startsWith("daisuki_m_")) localStorage.removeItem(k); }); }catch(e){}
  }catch(e){ KVX.ok=false; }
  KVX.ready=true; if(KVX.want){ KVX.want=false; try{ render(); }catch(e){} } }
const store = {
  get(k,fb){ if(KVX.ok&&BIGK(k)) return fb; try{const v=localStorage.getItem(k);return v==null?fb:JSON.parse(v)}catch{return fb}},
  set(k,v){ if(KVX.ok&&BIGK(k)){ kvxPut(k,v); return; } try{localStorage.setItem(k,JSON.stringify(v))}catch{ if(BIGK(k)) return; try{localStorage.removeItem(k)}catch{} }},   /* 小資料存不進去：把舊的那份拿掉，改用記憶體裡的新資料；大資料絕不拿掉 */
  del(k){ if(KVX.ok&&BIGK(k)){ kvxPut(k,null); return; } try{localStorage.removeItem(k)}catch{}}
};
const mem = {}; // 如果瀏覽器擋住 storage，就退回記憶體
kvxLoad();
/* ===== TIE 聊天室分開存：daisuki_tie:<藝人>，一間一份 =====
   搬家前（daisuki_tie_v2 還沒設）照舊用整包 daisuki_whispers；搬家後讀寫 K.whispers 會自動拆成一間一間
   程式其他地方完全不用改 */
const TIE_FLAG="daisuki_tie_v2", tieKey=mid=>"daisuki_tie:"+mid;
const tieRaw=k=>{ if(k in mem) return mem[k]; return store.get(k,null); };
const tie2On=()=>!!tieRaw(TIE_FLAG);
function tieRoomKeys(){ const s=new Set(Object.keys(mem).filter(k=>k.startsWith("daisuki_tie:"))); if(!KVX.ok) try{ Object.keys(localStorage).forEach(k=>{ if(k.startsWith("daisuki_tie:")) s.add(k); }); }catch(e){} return [...s]; }
function tieAllGet(){ const out=[]; tieRoomKeys().forEach(k=>{ const L=tieRaw(k); if(Array.isArray(L)) L.forEach(w=>out.push(w)); }); return out; }
function tieAllSet(L){ if(!Array.isArray(L)) return; const G={}; L.forEach(w=>{ if(w&&w.member) (G[w.member]=G[w.member]||[]).push(w); });
  const mids=new Set([...Object.keys(G),...tieRoomKeys().map(k=>k.slice(12))]);
  mids.forEach(mid=>{ const k=tieKey(mid), cur=tieRaw(k)||[], nxt=G[mid]||[]; if(JSON.stringify(cur)===JSON.stringify(nxt)) return;
    /* 保險：一次少掉很多則（例如讀到空的）就不存，不會把聊天室洗掉 */
    if(nxt.length<cur.length&&cur.length-nxt.length>5&&nxt.length<cur.length*.6){ try{ console.warn("TIE 保護：略過",mid,cur.length,"→",nxt.length); }catch(e){} return; }
    mem[k]=nxt; store.set(k,nxt); hbMark(k); }); }
/* 搬家：管理員的手機、維修模式開著時做一次 */
function tieMigrate(){ try{ if(tie2On()||!isAdminAcct()||!maintOn()) return false; if(HB_ON&&(!HB.pulled||HB.ver[K.whispers]==null)) return false;
  const L=tieRaw(K.whispers)||[], G={}; L.forEach(w=>{ if(w&&w.member) (G[w.member]=G[w.member]||[]).push(w); });
  Object.keys(G).forEach(mid=>{ const k=tieKey(mid), cur=tieRaw(k)||[], ids=new Set(cur.map(x=>x.id)), m=cur.concat(G[mid].filter(x=>!ids.has(x.id))).sort((a,b)=>a.ts-b.ts); mem[k]=m; store.set(k,m); hbMark(k); });
  const f={ts:Date.now(),n:L.length,rooms:Object.keys(G).length}; mem[TIE_FLAG]=f; store.set(TIE_FLAG,f); hbMark(TIE_FLAG);
  toast(`TIE 搬家完成：${f.rooms} 間聊天室、${f.n} 則訊息`); return true; }catch(e){ return false; } }
/* 還在用舊版的人傳到舊包裡的訊息：自動搬進新的聊天室（用 id 去重，誰的手機做都一樣） */
function tieForward(){ try{ if(!tie2On()) return; const f=tieRaw(TIE_FLAG)||{}, L=tieRaw(K.whispers)||[]; if(!L.length) return;
  const fresh=L.filter(w=>w&&w.member&&w.ts>=(f.ts||0)-60e3); if(!fresh.length) return; const G={}; fresh.forEach(w=>(G[w.member]=G[w.member]||[]).push(w));
  Object.keys(G).forEach(mid=>{ const k=tieKey(mid), cur=tieRaw(k)||[], ids=new Set(cur.map(x=>x.id)), add=G[mid].filter(x=>!ids.has(x.id)); if(!add.length) return; const m=cur.concat(add).sort((a,b)=>a.ts-b.ts); mem[k]=m; store.set(k,m); hbMark(k); }); }catch(e){} }
/* 舊包保留 30 天當備份，之後清空（管理員的手機做） */
function tieOldClear(){ try{ if(!tie2On()||!isAdminAcct()) return; const f=tieRaw(TIE_FLAG)||{}; if(!f.ts||Date.now()-f.ts<30*864e5) return; const L=tieRaw(K.whispers); if(!Array.isArray(L)||!L.length) return; tieForward(); mem[K.whispers]=[]; store.set(K.whispers,[]); hbMark(K.whispers); }catch(e){} }
setInterval(()=>{ if(tieMigrate()) try{ render(); }catch(e){} tieForward(); tieOldClear(); },15e3);
/* 每個粉絲帳號自己的資料（追蹤、TIE 券、積分、小卡、通知…）分開存：新註冊的帳號從空白開始。
   示範帳號 fan@stardream.app、管理員切換成粉絲看，都用原本的示範資料 */
const DEMO_FAN="";   // 多人版：每個帳號的資料都分開存，沒有共用的示範帳號
const PK_SET=new Set(["lvFix","ptRst","gcPity","lvMax","tourTix","tourStamp","online","ptGot","tieLeft","fanArtists","notifs","feedSeen","pollVotes","pick","unread","settings","likes","tieSubs","points","tieSet","tieCleared","tieTr","tieNotice","membership","owned","tieMs","msDone","bdayWish","cards","gachaLog","svVotes","svMine","stubs","msMine","mvLike","signedAlbums","cardMeta","repCard","albBuy","cmProf","bm","fanLetters","ltDraft","cmNotif","mcGot","mFollow","grpSeen","wRead","wSubs","annSeen","tieTrX","pwOpen","tieAgree","tieCele","boxKeep","pickNoShow","tieVch"].map(n=>K[n]).filter(Boolean));
function pk(k){ try{ if(!PK_SET.has(k)) return k; const s=SS.get(); if(!s||s.role!=="fan"||(s.admin&&!s.uni)) return k; const e=String(s.email||"").toLowerCase(); return !e||e===DEMO_FAN?k:k+"@"+e; }catch(err){ return k; } }
/* 有藝人身分的人（管理員、出道後的藝人）切到粉絲端：積分跟自己的藝人身分共用同一份（花的、賺的都記在藝人積分上） */
const uniArt=()=>{ try{ const s=SS.get(); if(!s||(s.admin&&!s.uni)) return ""; const m=s.role==="artist"?s.member:s.role==="fan"?((ACCOUNTS[s.email]||{}).member||s.home):""; return m&&MEMBERS[m]?m:""; }catch(e){ return ""; } };   /* 藝人端自己也是這一份（以前藝人端讀到的是一個大家共用、幾乎是 0 的舊欄位） */
/* 管理員、出道後的藝人：以前粉絲端那份獨立的積分，一次併進藝人積分（固定編號，不會重複加） */
function uniPtMerge(){ try{ const s=SS.get(); if(!s||!s.email||(s.admin&&!s.uni)) return false; const m=(ACCOUNTS[s.email]||{}).member||s.home; if(!m||!MEMBERS[m]) return false;   /* 還沒登入、藝人名單還沒載入：等一下再試（不要放棄） */
  if(HB_ON&&(!HB.tok||HB.ver[K.ptGrants]==null)) return false; const k=K.points+"@"+String(s.email).toLowerCase(), v=store.get(k,undefined), n=Math.round(+(v===undefined?mem[k]:v)||0); if(n<=0) return true;
  const id="ufm_"+String(s.email).toLowerCase(), L=S.get(K.ptGrants,[])||[]; if(L.some(g=>g.id===id)) return true;
  L.push({id,to:"art:"+m,mid:m,n,art:1,why:"粉絲身分的積分併入",by:"auto",ts:Date.now()}); S.set(K.ptGrants,L); return true; }catch(e){ return false; } }
{ const t0=Date.now(), iv=setInterval(()=>{ if(uniPtMerge()||Date.now()-t0>30*60e3) clearInterval(iv); },5000); }
const S = {
  get(k,fb){ if(k===K.whispers&&tie2On()) return tieAllGet(); if(k===K.points){ const m=uniArt(); if(m) return Math.max(0,((typeof pointsOf==="function"&&pointsOf(m))||{}).net||0); } k=pk(k);const v=store.get(k,undefined);return v===undefined?(k in mem?mem[k]:fb):v},
  set(k,v){ if(k===K.whispers&&tie2On()){ tieAllSet(v); return; }
    if(k===K.points){ const m=uniArt(); if(m){ const d=Math.round((+v||0)-S.get(K.points,0)); if(d){ const L=S.get(K.ptGrants,[])||[]; L.push({id:"uf_"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),to:"art:"+m,mid:m,n:d,art:1,why:d<0?"粉絲身分使用":"粉絲身分獲得",by:"auto",ts:Date.now()}); S.set(K.ptGrants,L); } return; } } try{ if(typeof kvImgSoon==="function") kvImgSoon(k); }catch(e){} k=pk(k);mem[k]=v;store.set(k,v);hbMark(k)},
  del(k){k=pk(k);delete mem[k];store.del(k);hbMark(k)}
};

