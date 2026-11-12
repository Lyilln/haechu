/* HAECHU｜SNS（Instagram） */
/* =========================================================
   SNS（照 Instagram 的骨架做成真的能用）
   ・動態：追蹤的人的貼文、限時動態、按讚（點兩下也可以）、留言、收藏、分享到私訊
   ・探索：搜尋帳號、看所有貼文
   ・新貼文：從相簿選最多 10 張，寫說明文字；也可以發限時動態（24 小時）
   ・Reels：上下滑全螢幕看
   ・個人檔案：貼文數、粉絲、追蹤中、編輯個人檔案、追蹤／訊息
   ・私訊、通知
   ========================================================= */
const SNS_FANS=[];   // 正式版：沒有假的粉絲帳號
const SNS_CAPS=["今天的天空好美 ☁️","練習結束，回家路上 🌙","咖啡續命中 ☕","週末小確幸 🍰","新買的手機殼 💜","彩排後的宵夜 🍜","雨天聽歌最對味 🎧","今日穿搭 👗"];
/* SNS 資料分開存（貼文、按讚、留言、追蹤…各一份）：按一個讚不用整包重存，人多也不會互相蓋掉
   私訊：每兩個人一份（daisuki_dm:甲~乙），只有這兩個人的對話，不再混在一起 */
const SN_PARTS={posts:[],fol:{},likes:{},cms:{},saved:{},stories:[],seen:{},prof:{},rp:{},notes:{},hl:{},folTs:{},ntSeen:{},req:{},cf:{},folAt:{},intr:{},col:{},slk:{},sub:[]};
const snKey=p=>"daisuki_sn_"+p;
function snMigrate(){ try{ if(S.get("daisuki_sn_mig",false)) return; if(HB_ON&&HB.ver[K.sns]==null&&!Object.keys(HB.ver||{}).length) return;
  const old=S.get(K.sns,null); if(old&&typeof old==="object"){ Object.keys(SN_PARTS).forEach(p=>{ if(old[p]!=null&&S.get(snKey(p),null)==null) S.set(snKey(p),old[p]); });
    const dm=old.dm||{}; Object.keys(dm).forEach(k=>{ (dm[k]||[]).forEach(m=>{ if(!m||!m.from||m.from===k) return; dmAppend(m.from,k,m); }); });
    if(Object.keys(dm).length) S.set(K.sns,{...old,dm:{}}); }   /* 舊的大包裡的私訊搬走後清掉（不然大家都讀得到） */
  S.set("daisuki_sn_mig",true); }catch(e){} }
const SN_SNAP=new WeakMap();
const snDB=()=>{ snMigrate(); const d={}, snap={}; Object.keys(SN_PARTS).forEach(p=>{ const v=S.get(snKey(p),null); d[p]=v==null?JSON.parse(JSON.stringify(SN_PARTS[p])):p==="posts"&&Array.isArray(v)?v.filter(x=>x&&!x.del):v;   /* 不複製（太慢，滑動會卡）；snSave 用拿出來時記下的樣子比對，改到同一份也存得到 */   /* 已刪除的貼文記號：畫面上當作沒有 */ snap[p]=JSON.stringify(d[p]); }); SN_SNAP.set(d,snap); try{ (d.posts||[]).forEach(x=>{ if(x&&x.of) snOfFill(x); }); }catch(e){} return d; };
/* 存檔只存「這次真的改了的地方」：拿讀出來那一刻當基準，跟現在手機裡（可能剛收到別人的新限動、新貼文）合起來，
   不會因為手上拿的是舊的一份，就把別人剛發的蓋掉 */
/* 存：跟「拿出來那時候」比，有變才存。手機裡的那份如果是同一個（直接改到的）→ 直接存；如果別人的新資料已經進來（不是同一個）→ 三方合併 */
const snSave=d=>{ try{ const snap=SN_SNAP.get(d)||{}; Object.keys(SN_PARTS).forEach(p=>{ if(d[p]===undefined) return; const mine=JSON.stringify(d[p]); if(snap[p]!=null&&mine===snap[p]) return;
    const cur=S.get(snKey(p),null); let out=d[p];
    if(cur!=null&&cur!==d[p]&&snap[p]!=null){ const curJ=JSON.stringify(cur); if(curJ===mine){ snap[p]=mine; return; } if(curJ!==snap[p]) out=hbMerge(JSON.parse(snap[p]),d[p],cur); }
    out=hbKeep(snKey(p),out,cur); S.set(snKey(p),out); snap[p]=JSON.stringify(out); }); }catch(e){ toast("空間不夠，存不下來"); } };
const dmKey=(a,b)=>"daisuki_dm:"+[a,b].sort().join("~");
const dmGet=other=>S.get(dmKey(snMeId(),other),[])||[];
function dmAppend(from,to,msg){ const k=dmKey(from,to), L=S.get(k,[])||[]; L.push({...msg,from}); S.set(k,L.slice(-500)); }
function dmThreads(){ const me=snMeId(), out=[], ks=new Set(Object.keys(mem||{})); try{ Object.keys(localStorage).forEach(k=>ks.add(k)); }catch(e){}
  ks.forEach(k=>{ if(!k.startsWith("daisuki_dm:")) return; const ids=k.slice(11).split("~"); if(ids.length!==2||!ids.includes(me)) return; const L=S.get(k,[])||[]; if(L.length) out.push({id:ids[0]===me?ids[1]:ids[0],t:L}); });
  return out.sort((a,b)=>b.t[b.t.length-1].ts-a.t[a.t.length-1].ts); }
/* 預設的用戶名稱：不再用登入帳號（會洩漏大家的帳號），改用名字或隨機代號 */
const snHandle=(name,seed,pre)=>{ const a=String(name||"").toLowerCase().normalize("NFKD").replace(/[^a-z0-9._]/g,""); return a.length>=2?a:pre+"_"+(strHash(seed)%1679616).toString(36).padStart(4,"0"); };
/* ===== 粉絲帳號 → 藝人帳號 =====
   ・藝人的個人 SNS 不會馬上開：照公司規定，出道滿一段時間才解鎖
   ・原本粉絲身分的 SNS：內容清空、變成私人帳號；用過的帳號名、名稱記到後台，之後不能再用 */
const SNS_UNLOCK_MO={YG:1.5,SM:2.5,JYP:5,HYBE:3.5,PAPERMOON:2,"BLUE HOUR":3.5,"DOLPUNG Lab.":.8};
function snDebutOf(mid){ try{ const x=getDebut().filter(y=>y.status==="ok"&&(y.mid===mid||Object.values(y.mids||{}).includes(mid))).sort((a,b)=>(b.day||0)-(a.day||0))[0]; if(!x) return null; return {co:x.co||"",ts:dbRelAt(x)||x.day||0}; }catch(e){ return null; } }
function snLockOf(mid){ const d=snDebutOf(mid); if(!d||!d.ts) return null; const mo=SNS_UNLOCK_MO[d.co]; if(mo==null) return null; const until=d.ts+Math.round(mo*30*864e5); return until>Date.now()?{co:d.co,mo,until}:null; }
function snRetireCheck(){ try{ const s=session(); if(!s||s.role!=="artist"||!MEMBERS[s.member]) return; const em=String(s.email||"").toLowerCase(), a=ACCOUNTS[em]||{}; if(a.role==="admin") return; const done=S.get(K.snRetired,{})||{}; if(done[em]) return;
    const d=snDB(), uid="u:"+em, pr=d.prof[uid]||{}, nick=(S.get(K.nicks,{})||{})[em], had=(d.posts||[]).some(p=>p.uid===uid)||pr.u||nick;
    if(had){ const L=S.get(K.usedNames,[])||[]; [pr.u,nick].filter(Boolean).forEach(v=>{ if(!L.some(x=>nameKey(x.v)===nameKey(v))) L.push({v,acc:em,ts:Date.now()}); }); S.set(K.usedNames,L);
      d.posts=(d.posts||[]).filter(p=>p.uid!==uid); d.stories=(d.stories||[]).filter(x=>x.uid!==uid); if(d.notes) delete d.notes[uid]; if(d.hl) delete d.hl[uid]; d.prof[uid]={...pr,priv:true,bio:"",av:"",retired:Date.now()}; snSave(d); }
    done[em]=Date.now(); S.set(K.snRetired,done); }catch(e){} }
function snMeId(){ const s=session()||{}; if(s.role==="artist"&&MEMBERS[s.member]) return "m:"+s.member; return "u:"+String(s.email||"me").toLowerCase(); }
function snUser(id){ if(id==="o:scout") return {id,u:"haechu.scout",name:"HAECHU 星探",g:6,ver:true,bio:"✨ 尋找下一顆星",av:"",off:1};
  if(String(id).startsWith("o:co_")){ const co=ofCoOf(id.slice(5)); if(!co) return null; const c=coInfo(co); return {id,u:OF_CO[co],name:c.n,g:6,ver:true,bio:"",av:c.l||"",co,of:1}; }
  if(String(id).startsWith("o:g_")){ const gid=id.slice(4), g=groupOf(gid); if(!g||g.solo) return null; return {id,u:ofGH(g),name:g.name,g:g.g||0,ver:true,bio:coInfo(coOfGid(gid)).n,av:gPhoto(gid)||"",gid,of:1}; }
  if(String(id).startsWith("o:sc_")){ const s=scAcc(id); return s?{id,u:s.u,name:(s.co||"")+" 星探",g:6,ver:true,bio:s.bio||"",av:s.av||"",off:1}:null; } const pr=((S.get(snKey("prof"),null)||{})[id])||{};   /* 只讀簡介：不要每個頭像都把整個 SNS 拿出來（滑動會卡） */
  if(id.startsWith("m:")){ const mid=id.slice(2), m=MEMBERS[mid]; if(!m) return null; const acc=Object.keys(ACCOUNTS).find(k=>ACCOUNTS[k]&&ACCOUNTS[k].member===mid), du=snHandle(m.name,"m:"+mid,"artist"); return {id,u:pr.u||du,name:pr.name!=null?pr.name:"",g:m.g,ver:true,bio:pr.bio!=null?pr.bio:`${groupOf(m.group)?groupOf(m.group).name:""} 🎤`,av:pr.av||"",mid}; }   /* 藝人的 SNS 跟藝人個人帳號分開：名稱、頭貼都是 SNS 自己的，不跟著個人帳號 */
  if(id.startsWith("f:")){ const f=SNS_FANS.find(x=>x[0]===id.slice(2)); if(!f) return null; return {id,u:f[0],name:f[1],g:f[2],ver:false,bio:"🌙 每天都是追星日",av:"",fake:true}; }
  if(id.startsWith("u:")){ const e=id.slice(2), a=ACCOUNTS[e]||{}, me=id===snMeId(); const nm=adminView()?(a.name||e):me?ME.name:(S.get(K.nicks,{})[e]||a.name||e.split("@")[0]);
    return {id,u:pr.u||(a.role==="admin"&&!a.member?"haechu.official":snHandle("", "u:"+e,"haechu")),name:pr.name!=null?pr.name:nm,g:3,ver:a.role==="admin",bio:pr.bio||"",av:pr.av||"",acc:e}; }
  return null; }
function snAllUsers(){ const L=[]; Object.keys(MEMBERS).filter(id=>!MEMBERS[id].official&&!snLockOf(id)).forEach(id=>L.push("m:"+id)); snOfAccs().forEach(id=>L.push(id)); SNS_FANS.forEach(f=>L.push("f:"+f[0])); Object.keys(ACCOUNTS).forEach(e=>{ const a=ACCOUNTS[e]; if(a&&a.role!=="artist") L.push("u:"+e); }); L.push("o:scout"); return L.map(snUser).filter(Boolean); }
function snSeed(){ return; const d=snDB(); if(d.seeded&&d.seed2) return; if(d.seeded){ const now=Date.now(); d.notes=d.notes||{"f:moonlight_daily":{text:"今晚直播誰要一起看 🌙",ts:now-2*3600e3},"f:sunny.doll":{text:"小卡交換中～",ts:now-6*3600e3}}; d.seed2=true; snSave(d); return; }
  d.seed2=true; const now=Date.now(); let k=0;
  Object.keys(MEMBERS).filter(id=>!MEMBERS[id].official).forEach(mid=>{ for(let i=0;i<3;i++) d.posts.push({id:"sp"+(k++),uid:"m:"+mid,pics:Array.from({length:1+strHash(mid+i)%3},(_,j)=>mid+i+"_"+j),cap:SNS_CAPS[(strHash(mid)+i)%SNS_CAPS.length],ts:now-(i*30+strHash(mid)%20+2)*3600e3,base:300+strHash(mid+i)%4000}); });
  SNS_FANS.forEach(([u],i)=>{ d.posts.push({id:"sp"+(k++),uid:"f:"+u,pics:[u+"0"],cap:SNS_CAPS[i%SNS_CAPS.length],ts:now-(i*9+4)*3600e3,base:12+strHash(u)%200}); d.stories.push({id:"st"+i,uid:"f:"+u,pic:u+"s",ts:now-(i+1)*3600e3}); });
  Object.keys(MEMBERS).filter(id=>!MEMBERS[id].official).slice(0,4).forEach((mid,i)=>d.stories.push({id:"sm"+i,uid:"m:"+mid,pic:mid+"s",ts:now-(i*2+1)*3600e3}));
  d.notes={"f:moonlight_daily":{text:"今晚直播誰要一起看 🌙",ts:now-2*3600e3},"f:sunny.doll":{text:"小卡交換中～",ts:now-6*3600e3}};
  d.dm["f:moonlight_daily"]=[{from:"f:moonlight_daily",text:"你也有去昨天的直播嗎！",ts:now-5*3600e3}];
  d.dm["f:lulu.goodnight"]=[{from:"f:lulu.goodnight",text:"這張小卡可以跟你換嗎 🥺",ts:now-26*3600e3}];
  d.seeded=true; snSave(d); }
/* 預設追蹤：只追自己加入社群的那幾團的藝人（藝人帳號：自己團的團員） */
const snFolDef=()=>{ const s=session()||{}, G=s.role==="artist"&&MEMBERS[s.member]?[MEMBERS[s.member].group]:followed(); return Object.keys(MEMBERS).filter(id=>!MEMBERS[id].official&&G.includes(MEMBERS[id].group)&&"m:"+id!==snMeId()).map(id=>"m:"+id); };
const snFol=(d,uid)=>{ if(!d.fol[uid]){ d.fol[uid]=uid===snMeId()?snFolDef():[]; } return d.fol[uid]; };
/* 舊版預設是「全部藝人」：沒自己改過的，換成新的預設（只做一次） */
function snFolFix(d){ const me=snMeId(), k="daisuki_sn_folfix", done=S.get(k,{})||{}; if(done[me]) return; done[me]=1; S.set(k,done); const L=d.fol[me]; if(!L) return;
  const all=Object.keys(MEMBERS).filter(id=>!MEMBERS[id].official).map(id=>"m:"+id); if(L.length===all.length&&all.every(x=>L.includes(x))){ d.fol[me]=snFolDef(); snSave(d); } }
/* 推薦追蹤：還沒追蹤的藝人，粉絲多的排前面 */
function snSuggest(d){ const me=snMeId(), fol=snFol(d,me); let dis=[]; try{ dis=JSON.parse(localStorage.getItem("hc_sndis_"+me)||"[]"); }catch(e){} return Object.keys(MEMBERS).filter(id=>!MEMBERS[id].official&&"m:"+id!==me&&!fol.includes("m:"+id)&&!dis.includes("m:"+id)&&!snLockOf(id)).map(id=>"m:"+id).sort((a,b)=>snFollowers(d,b)-snFollowers(d,a)).slice(0,12); }
/* 私人帳號：要對方按「確認」才能追蹤；沒追蹤的人看不到貼文、限時動態 */
/* 粉絲轉成藝人：以前的一般 SNS 帳號一律是私人帳號（不能改成公開，也不會出現在別人的推薦裡） */
/* 出道後的舊粉絲帳號固定私人。管理員除外（管理員同時是粉絲、藝人、管理，粉絲帳號本來就要大家看得到；跟「出道清空舊帳號」一樣不算管理員） */
const snForcePriv=uid=>{ if(!String(uid||"").startsWith("u:")) return false; const a=ACCOUNTS[uid.slice(2)]; return !!(a&&a.role!=="admin"&&a.member&&MEMBERS[a.member]); };
const snPriv=(d,uid)=>snForcePriv(uid)||!!((d.prof[uid]||{}).priv);
/* 私人帳號：只有追蹤他的人看得到（11/12：管理員也一樣，不再例外；出道後的舊帳號也照這個規則藏起來） */
const snCanSee=(d,uid)=>{ const me=snMeId(); return uid===me||!snPriv(d,uid)||snFol(d,me).includes(uid); };
const snReqd=(d,uid)=>((d.req||{})[uid]||[]).includes(snMeId());
const snFollowers=(d,uid)=>Object.keys(d.fol).filter(k=>(d.fol[k]||[]).includes(uid)).length;
const snLikes=(d,p)=>(d.likes[p.id]||[]).length;
/* 跟 IG 一樣：帳號下面不放本名；沒追蹤的人才出現「為你推薦」＋追蹤 */
const snSugg=(d,uid)=>{ const me=snMeId(); return uid!==me&&!String(uid).startsWith("o:")&&!snFol(d,me).includes(uid); };
/* 「誰誰誰和其他 N 人都說讚」（N 跟愛心旁的數字對得起來）＋最多 3 個頭貼（優先顯示你追蹤的人） */
/* 轉發過這則的人（照 IG：照片左下角圓頭貼＋紫色轉發小章，最多兩個，追蹤中的優先） */
const snRpWho=(d,p)=>Object.keys(d.rp||{}).filter(uid=>uid!==p.uid&&(d.rp[uid]||[]).some(x=>x.id===p.id)&&snUser(uid));
const snRpN=(d,p)=>snRpWho(d,p).length;
function snRpAvs(d,p){ const fol=snFol(d,snMeId()), L=snRpWho(d,p).sort((a,b)=>(fol.includes(b)?1:0)-(fol.includes(a)?1:0)).slice(0,2); if(!L.length) return "";
  return `<div class="sn-rpav">${L.map(uid=>`<button class="sn-rpa" data-a="snsGo" data-v="profile" data-id="${uid}" aria-label="${esc(snUser(uid).u)} 已轉發">${snAv(snUser(uid),43)}<i>${si("repost")}</i></button>`).join("")}</div>`; }
function snLikedBy(d,p){ const L=(d.likes[p.id]||[]).filter(x=>snUser(x)); if(!L.length) return ""; const fol=snFol(d,snMeId()), S2=[...L.filter(x=>fol.includes(x)),...L.filter(x=>!fol.includes(x))].slice(0,3), u0=snUser(S2[0]);
  return `<p class="sn-lb" data-a="snLikers" data-id="${p.id}" role="button"><span class="sn-lbav">${S2.map(x=>snAv(snUser(x),20)).join("")}</span><span><b>${esc(u0.u)}</b>${snLikes(d,p)>1?`和其他 ${fmt(snLikes(d,p)-1)} 人都說讚`:" 說讚"}</span></p>`; }
/* 說明文字：#標籤、@帳號 可以點 */
/* 已經是 HTML 的文字（翻譯外框）：只把 @帳號、#標籤 變成可以點的 */
function snRichH(h){ return String(h||"").replace(/(^|[\s>])@([a-z0-9._]{2,30})/gi,(m,p,hd)=>`${p}<button class="sn-lnk" data-a="snAtGo" data-v="${hd.toLowerCase()}">@${hd}</button>`); }
function snRich(t){ return esc(t||"").replace(/(^|[\s>])([#＃][^\s#＃@.,，。!！?？]{1,30})|(^|[\s>])@([a-z0-9._]{2,30})/gi,(m,p1,tag,p2,h)=>tag?`${p1}<button class="sn-lnk" data-a="snTagGo" data-v="${esc(tag.slice(1).toLowerCase())}">${tag}</button>`:`${p2}<button class="sn-lnk" data-a="snAtGo" data-v="${h.toLowerCase()}">@${h}</button>`); }
const snTagsOf=p=>((p.cap||"").match(/[#＃][^\s#＃@.,，。!！?？]{1,30}/g)||[]).map(x=>x.slice(1).toLowerCase());
/* 沒有頭貼：跟 IG 一樣用灰色人形，不再用漸層＋字母 */
const SN_DFAV='<svg class="sn-dfav" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="15.6" r="7.4"/><path d="M4.8 38.5c1.6-8.6 7.7-13.2 15.2-13.2s13.6 4.6 15.2 13.2z"/></svg>';
const snAv=(u,sz=32,ring=false,seen=false,cf=false)=>{ if(!u) return ""; const im=u.av?`<span class="av-img av-bgi" style="background-image:url('${u.av}')"></span>`:"", has=!!im;
  return `<span class="sn-av ${ring?"ring":""} ${seen?"seen":""} ${ring&&cf&&!seen?"cf":""}" style="--s:${sz}px">${has?`<i class="dflt">${SN_DFAV}${im}</i>`:`<i class="dflt">${SN_DFAV}</i>`}</span>`; };
const snPic=(seed,g,cls="")=>`<span class="sn-pic ${cls}" style="background:${grad((g||0)+(strHash(String(seed))%5))}"></span>`;
const snIsVid=p=>!!(p&&p.media&&p.media.some(m=>m.type==="video"));
/* 照片／影片比例跟 IG 一樣：照第一張的原比例，最寬 1.91:1、最高 4:5（MV 這種 16:9 不會被裁成直的） */
const SN_AR={}, snArClamp=r=>Math.max(.8,Math.min(1.91,r));
function snArStyle(p){ const m=p.media&&p.media[0]; if(!m||m.type==="html") return ""; const k=m.mid||m.url, r=SN_AR[k]||(m.w&&m.h?snArClamp(m.w/m.h):0); return r&&Math.abs(r-.8)>.01?` style="aspect-ratio:${r.toFixed(4)}"`:""; }
function snArSeen(el,w,h){ try{ if(!w||!h) return; const sl=el.closest(".sn-sl"), car=el.closest(".sn-car"); if(!sl||!car||car.firstElementChild!==sl) return; const k=el.dataset.vmid||el.dataset.mid||el.getAttribute("src"), r=snArClamp(w/h); if(k) SN_AR[k]=r;
  const cur=parseFloat(car.style.aspectRatio)||.8; if(Math.abs(cur-r)<.01) return; const sn=car.closest(".sn"), b0=car.getBoundingClientRect(), h0=b0.height; car.style.aspectRatio=r.toFixed(4); const dh=car.getBoundingClientRect().height-h0;
  if(sn&&dh&&b0.bottom<=(sn.getBoundingClientRect().top+60)) sn.scrollTop+=dh; }catch(e){} }   /* 比例改了：如果這則在畫面上面（已經滑過去），把捲動位置一起補回去，畫面才不會跳 */
document.addEventListener("load",e=>{ const el=e.target; if(el&&el.tagName==="IMG"&&el.classList.contains("sn-img")) snArSeen(el,el.naturalWidth,el.naturalHeight); },true);
document.addEventListener("loadedmetadata",e=>{ const el=e.target; if(el&&el.tagName==="VIDEO"&&el.classList.contains("sn-vid")) snArSeen(el,el.videoWidth,el.videoHeight); },true);
const snMedia=(p,u,i)=>{ const m=p.media&&p.media[i]; if(!m) return snPic(p.pics?p.pics[i]:p.id+i,u?u.g:0,"fill"); if(m.type==="html") return `<div class="snof-h">${m.h}</div>`; if(m.url&&m.type!=="video") return `<img class="sn-img" src="${esc(m.url)}" alt="" loading="lazy">`;
  if(m.type==="video") return `<video class="sn-img sn-vid" data-vmid="${m.mid}" data-pmid="${m.poster||""}" muted playsinline webkit-playsinline loop preload="none"></video><button class="sn-snd" data-a="snSnd" aria-label="聲音">${snSndIc()}</button>`;
  return `<img class="sn-img" data-mid="${m.mid}" alt="">`; };
/* 格子裡的小圖：影片用封面，右上角放 Reels 圖示 */
const snThumb=(p,u)=>{ const m=p.media&&p.media[0]; if(m&&m.type==="html") return `<div class="snof-h mini"><div class="snof-sc">${m.h}</div></div>`; if(m&&m.type==="video") return `<img class="sn-img" data-mid="${m.poster||""}" alt=""><i class="sn-ri">${si("reels2","sm")}</i>`; return snMedia(p,u,0)+(snCount(p)>1?`<i class="sn-ri">${si("carousel")}</i>`:""); };
const snCount=p=>p.media?p.media.length:(p.pics||[1]).length;
/* 被 @／被標註的人收到通知（粉絲帳號＝鈴鐺通知；藝人帳號＝藝人端鈴鐺從限動／貼文資料算出來） */
function snMentNotify(ids,what){ const me=snMeId(), u=snUser(me)||{}, who=u.u||u.name||"有人"; [...new Set(ids||[])].filter(id=>id&&id!==me).forEach(id=>{ if(String(id).startsWith("u:")) feedPush({kind:"core",self:true,text:`${who} ${what}`},"u:"+id.slice(2)); }); }
const snStDel=s=>({id:s.id,uid:s.uid,ts:0,del:Date.now()});
/* 刪貼文：拿掉，同時留一個「已刪除」記號（別支手機才不會又合併回來） */
const snPDel=(d,pred)=>{ const gone=d.posts.filter(pred); d.posts=[...d.posts.filter(x=>!pred(x)),...gone.map(p=>({id:p.id,uid:p.uid,ts:0,del:Date.now()}))]; return gone.length; };   /* 刪掉的限動：留一個記號，別支手機才不會又把它合併回來 */
function snActiveStories(d){ const lim=Date.now()-864e5, me=snMeId(); return d.stories.filter(s=>!s.del&&s.ts>lim&&snCanSee(d,s.uid)&&(!s.cf||s.uid===me||((d.cf||{})[s.uid]||[]).includes(me))); }
const snStoryCf=(d,uid)=>snActiveStories(d).some(s=>s.uid===uid&&s.cf);
function snHasStory(d,uid){ return snActiveStories(d).some(s=>s.uid===uid); }
function snStorySeen(d,uid){ const me=snMeId(), st=snActiveStories(d).filter(s=>s.uid===uid); return st.length&&st.every(s=>((d.seen[me]||{})[s.id])); }
const snTabs=(p)=>{ const me=snMeId(), un=dmThreads().filter(x=>{ const l=x.t[x.t.length-1]; return l.from!==me&&!l.read; }).length;
  /* 跟 App 的導覽列同一套：液態玻璃鏡片、按住左右拖切換 */
  const K=["home","reels","dm","explore","profile"], cur=p==="thread"?"dm":p==="profile"&&route().id?"":p, i=K.indexOf(cur), f=NAVP.sns; if(i>=0) NAVP.sns=i; const go=i>=0&&f!=null&&f!==i;
  return `<nav class="nav sn-nav2" aria-label="SNS 選單"><div class="nav-in" style="--n:5">${i>=0?`<span class="nav-lens ${go?"go":""}" style="--i:${i};--f:${go?f:i}" aria-hidden="true"></span>`:""}${[["home","home"],["reels","reels2"],["dm","send"],["explore","search"]].map(([k,ic])=>`<button class="nav-btn ${cur===k?"on":""}" data-a="snsGo" data-v="${k}" aria-label="${k}"><span class="nav-ico">${si(ic)}${k==="dm"&&un?`<span class="nbadge">${un>99?"99+":un}</span>`:""}</span></button>`).join("")}<button class="nav-btn ${cur==="profile"?"on":""}" data-a="snsGo" data-v="profile" aria-label="個人檔案"><span class="nav-ico">${snAv(snUser(snMeId()),26,cur==="profile")}</span></button></div></nav>`; };
/* 公司官方帳號追蹤自己旗下（已開通 SNS）的藝人；藝人也追蹤自己的公司 */
function snCoFol(d){ try{ let ch=false; Object.keys(MEMBERS).forEach(mid=>{ const m=MEMBERS[mid]; if(!m||m.official||snLockOf(mid)) return; const cid=ofCoId(coOfGid(m.group)); if(!cid||!snUser(cid)) return; const aid="m:"+mid;
    const C=d.fol[cid]=d.fol[cid]||[]; if(!C.includes(aid)){ C.push(aid); ch=true; } const A=d.fol[aid]=d.fol[aid]||[]; if(!A.includes(cid)){ A.push(cid); ch=true; } });
  if(ch) snSave(d); }catch(e){} }
function viewSns(p,id){ snSeed(); snOfSync(); const d=snDB(); snCoFol(d);
  const body=p==="explore"?snExplore(d):p==="reels"?snReels(d,id):p==="profile"?snProfile(d,id):p==="new"?snNew(d):p==="dm"?snDmList(d):p==="thread"?snThread(d,id):p==="notif"?snNotif(d):p==="post"?snPostPage(d,id):p==="edit"?snEdit(d):p==="tag"?snTagPage(d,id):p==="cf"?snCfPage(d):p==="sug"?snSugPage(d):p==="scout"?snScoutPage(d):p==="fl"?snFlPage(d,id):snHome(d);
  setTimeout(()=>{ const c=document.querySelector(".sn-thread-b"); if(c) c.scrollTop=c.scrollHeight; },0);
  return `<div class="sn ${p==="reels"?"dark":""}">${body}${["new","thread","notif","edit","scout","cf","sug","post"].includes(p)||(p==="reels"&&ui.snReelOne&&ui.snReelOne===id)?"":snTabs(p)}</div>`; }
const snRp=(d,uid)=>d.rp&&d.rp[uid]||[];
const snN=n=>n?fmtW(n).replace(" 萬","萬"):"";   /* IG 的數字：0 不顯示、1,059、2.5萬 */

function snPostCard(d,p,by){ const u=snUser(p.uid); if(!u||p._gone) return ""; const me=snMeId(), liked=(d.likes[p.id]||[]).includes(me), saved=(d.saved[me]||[]).includes(p.id), rpd=snRp(d,me).some(x=>x.id===p.id), n=snCount(p), cms=d.cms[p.id]||[], bu=by&&snUser(by);
  return `<article class="sn-post" id="snp-${p.id}" ${p.mus&&p.mus.mid?`data-mus="${esc(p.mus.mid)}" data-pid="${p.id}"`:""}>${bu?`<div class="sn-rpby">${si("repost","sm")}<b>${esc(bu.id===me?"你":bu.u)}</b> 已轉發</div>`:""}<header><button class="sn-hu" data-a="snsGo" data-v="profile" data-id="${u.id}">${snAv(u,38,snHasStory(d,u.id),snStorySeen(d,u.id))}<span class="sn-pu"><b>${esc(u.u)}${u.ver?`${SN_VER}`:""}</b>${p.mus&&p.mus.mid?`<small>${snMusTag(p.mus,"p:"+p.id,p.uid)}</small>`:p.loc?`<small>${esc(p.loc)}</small>`:snSugg(d,u.id)?`<small>為你推薦</small>`:""}</span></button>${snSugg(d,u.id)?`<button class="sn-fb" data-a="snFollow" data-v="${u.id}">追蹤</button>`:""}<button class="sn-ib sn-pm" data-a="snMore" data-id="${p.id}" aria-label="更多">${si("menu2")}</button></header>
    <div class="sn-media"><div class="sn-car" data-a="snTap" data-id="${p.id}"${snArStyle(p)}>${Array.from({length:n},(_,i)=>`<div class="sn-sl">${snMedia(p,u,i)}</div>`).join("")}</div>${n>1?`<em class="sn-cnt">1/${n}</em>`:""}<i class="sn-heart">${si("heart")}</i>${snRpAvs(d,p)}${p.mus&&p.mus.mid?`<button class="sn-mbtn" data-a="snMusTg" data-k="p:${p.id}" data-v="${esc(p.mus.mid)}" aria-label="聲音"><i class="off">${si("mute","sm")}</i><i class="onn">${si("sound","sm")}</i></button>`:""}</div>
    ${n>1?snDotsHtml(n):""}
    <div class="sn-acts"><button class="${liked?"liked":""}" data-a="snLike" data-id="${p.id}" aria-label="讚">${si("heart")}<b>${snN(snLikes(d,p))}</b></button><button data-a="snCm" data-id="${p.id}" aria-label="留言">${si("chat")}${cms.length?`<b>${snN(cms.length)}</b>`:""}</button><button class="${rpd?"rpd":""}" data-a="snRpTg" data-id="${p.id}" aria-label="轉發">${si("repost")}${snRpN(d,p)?`<b>${snN(snRpN(d,p))}</b>`:""}</button><button data-a="snShare" data-id="${p.id}" aria-label="分享">${si("send")}</button><span class="sn-sp"></span><button class="${saved?"saved":""}" data-a="snSaveP" data-id="${p.id}" aria-label="收藏">${si("save")}</button></div>
    <div class="sn-meta">${snLikedBy(d,p)}${p.cap?`<p><b>${esc(u.u)}</b> ${snRich(p.cap)}</p>`:""}${(p.tags||[]).length?`<p class="sn-tagd">${si("tag","sm")} ${p.tags.map(snUser).filter(Boolean).map(x=>`<button class="sn-lnk" data-a="snsGo" data-v="profile" data-id="${x.id}">${esc(x.u)}</button>`).join("、")}</p>`:""}${cms.length?`<button class="sn-more" data-a="snCm" data-id="${p.id}">查看全部 ${fmt(cms.length)} 則留言</button>`:""}<small>${snsAgo(p.ts)}</small></div></article>`; }

function snHome(d){ snFolFix(d); const me=snMeId(), fol=snFol(d,me), U=snUser(me), mode=ui.snFeed||"all";
  const items=d.posts.filter(p=>(mode==="all"||p.uid===me||fol.includes(p.uid))&&snCanSee(d,p.uid)).map(p=>({p,ts:p.ts}));
  [].forEach(uid=>snRp(d,uid).forEach(x=>{ const p=d.posts.find(y=>y.id===x.id); if(p&&p.uid!==uid&&snCanSee(d,p.uid)&&snCanSee(d,uid)) items.push({p,by:uid,ts:x.ts}); }));
  items.sort((a,b)=>b.ts-a.ts);
  const sids=[...new Set(snActiveStories(d).filter(s=>s.uid!==me&&fol.includes(s.uid)).sort((a,b)=>b.ts-a.ts).map(s=>s.uid))].sort((a,b)=>snStorySeen(d,a)-snStorySeen(d,b));
  const nt=snNotifList(d).filter(x=>x.ts>((d.ntSeen||{})[me]||0)).length+((d.req||{})[me]||[]).length;
  return `<header class="sn-top"><button class="sn-ib" data-a="snsExit" aria-label="離開">${si("back")}</button><button class="sn-ib sn-tic" data-a="snCreate" aria-label="新增">${si("plusL")}</button><button class="sn-logo sn-feedsw" data-a="snFeedSw">${SNS_NAME}${si("chev","sm")}</button><button class="sn-ib sn-tic" data-a="snsGo" data-v="notif" aria-label="通知">${si("heartL")}${nt?`<i class="sn-dot2"></i>`:""}</button></header>
    ${mode==="following"?`<div class="sn-fmode">追蹤中</div>`:""}
    <div class="sn-stories"><button class="sn-st me" data-a="${snHasStory(d,me)?"snStory":"snsGo"}" data-v="${snHasStory(d,me)?me:"new"}" data-id="${snHasStory(d,me)?me:"story"}">${snAv(U,62,snHasStory(d,me),snStorySeen(d,me))}${snHasStory(d,me)?"":`<span class="sn-add">${si("plusP")}</span>`}<small>你的限時動態</small></button>${sids.map(id=>{ const u=snUser(id); return u?`<button class="sn-st" data-a="snStory" data-v="${id}">${snAv(u,62,true,snStorySeen(d,id),snStoryCf(d,id))}<small>${esc(u.u)}</small></button>`:""; }).join("")}</div>
    <main class="sn-feed">${(()=>{ const sg=snSuggest(d), row=sg.length?`<section class="sn-sug"><div class="sn-sugh"><b>為你推薦</b><button data-a="snsGo" data-v="sug">查看全部</button></div><div class="sn-sugl">${sg.map(id=>snSugCard(d,id)).join("")}</div></section>`:"";
      if(!items.length) return `<div class="sn-empty sn-welc"><span>${si("cam")}</span><b>歡迎來到 ${SNS_NAME}</b><p>追蹤帳號後，他們分享的相片和影片會出現在這裡。</p></div>`+row; const h=items.map(x=>snPostCard(d,x.p,x.by)); h.splice(Math.min(2,h.length),0,row); return h.join(""); })()}</main>`; }

/* 貼文頁（照 IG：從個人檔案點進來）：標題「貼文」＋帳號，列出他全部的貼文，畫面停在點的那則；往上滑是比較新的、往下是比較舊的 */
function snPostPage(d,id){ let p=d.posts.find(x=>x.id===id); if(p&&!snCanSee(d,p.uid)) p=null; const u=p&&snUser(p.uid);
  const L=p?d.posts.filter(x=>x.uid===p.uid&&!x._gone&&snCanSee(d,x.uid)).sort((a,b)=>(b.ts||0)-(a.ts||0)):[];   /* 他全部的貼文（新到舊），畫面停在點的那則 */
  if(p&&!L.some(x=>x.id===p.id)) L.unshift(p);
  return `<header class="sn-top sn-pvh"><button class="sn-ib" data-a="back" aria-label="返回">${si("back")}</button><div class="sn-pvt"><b>貼文</b>${u?`<small>${esc(u.u)}</small>`:""}</div><span class="sn-ib" aria-hidden="true"></span></header><main class="sn-feed sn-pvf">${p?L.map(x=>snPostCard(d,x)).join(""):`<div class="sn-empty"><b>這則貼文已刪除</b></div>`}</main>`; }
function snExplore(d){ const q=nz((ui.snQ||"").trim()), me=snMeId();
  if(/^[#＃]/.test(q)){ const k=q.slice(1), cnt={}; d.posts.forEach(p=>{ if(snPriv(d,p.uid)&&!snCanSee(d,p.uid)) return; snTagsOf(p).forEach(t=>{ if(t.includes(k)) cnt[t]=(cnt[t]||0)+1; }); });
    const T=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,30);
    return `<header class="sn-top"><label class="sn-q">${si("search")}<input id="snQ" placeholder="搜尋" autocomplete="off" value="${esc(ui.snQ||"")}"></label></header><main class="sn-ul">${T.length?T.map(([t,n])=>`<button class="sn-ur" data-a="snTagGo" data-v="${esc(t)}"><span class="sn-hash">#</span><span><b>#${esc(t)}</b><small>${fmt(n)} 則貼文</small></span></button>`).join(""):`<p class="sn-none">找不到「${esc(q)}」</p>`}</main>`; }
  const hits=q?snAllUsers().filter(u=>u.id!==me&&(nz(u.u).includes(q)||nz(u.name).includes(q))):[];
  const rec=q?[]:snRecent().map(snUser).filter(Boolean);
  const P=d.posts.filter(p=>p.uid!==me&&!snPriv(d,p.uid)).sort((a,b)=>snLikes(d,b)-snLikes(d,a));
  return `<header class="sn-top"><label class="sn-q">${si("search")}<input id="snQ" placeholder="搜尋" autocomplete="off" value="${esc(ui.snQ||"")}"></label></header>
    ${q?`<main class="sn-ul">${hits.length?hits.map(u=>`<button class="sn-ur" data-a="snsGo" data-v="profile" data-id="${u.id}" data-rec="1">${snAv(u,44)}<span><b>${esc(u.u)}${u.ver?`${SN_VER}`:""}</b><small>${esc(u.name)}</small></span></button>`).join(""):`<p class="sn-none">找不到「${esc(q)}」</p>`}</main>`
      :`${rec.length?`<div class="sn-rec"><div class="sn-rech"><b>最近搜尋</b><button data-a="snRecX">全部清除</button></div><div class="sn-recl">${rec.map(u=>`<button data-a="snsGo" data-v="profile" data-id="${u.id}">${snAv(u,52)}<small>${esc(u.u)}</small></button>`).join("")}</div></div>`:""}<main class="sn-grid ex">${P.map((p,i)=>{ const u=snUser(p.uid); return `<button class="${i%10===2?"tall":""}" data-a="snsGo" data-v="post" data-id="${p.id}">${snThumb(p,u)}</button>`; }).join("")}</main>`}`; }
/* 興趣分數：有興趣 ＋、沒興趣 －（作者、#標籤都算），追蹤的人加一點，新的加一點 */
function snScore(d,p){ const me=snMeId(), I=(d.intr||{})[me]||{}, U=I.u||{}, T=I.t||{}; let s=(p.ts-Date.now())/36e5/24; s+=(U[p.uid]||0)*3; snTagsOf(p).forEach(t=>{ s+=(T[t]||0)*2; }); if(snFol(d,me).includes(p.uid)) s+=1; s+=Math.min(3,snLikes(d,p)/10); return s; }
function snReels(d,id){ const me=snMeId(), I=(d.intr||{})[me]||{}, no=new Set(I.no||[]), V=d.posts.filter(p=>snIsVid(p)&&snCanSee(d,p.uid)&&(!no.has(p.id)||p.id===id)).sort((a,b)=>snScore(d,b)-snScore(d,a)), i0=id?V.findIndex(p=>p.id===id):-1, P=i0>0?V.slice(i0).concat(V.slice(0,i0)):V;
  const fr=ui.snRf==="fr", fo=snFol(d,me); if(fr) P.splice(0,P.length,...P.filter(p=>fo.includes(p.uid)));
  const one=!!id&&ui.snReelOne===id;
  return one?`<header class="sn-top clear sn-r1h"><button class="sn-ib" data-a="back" aria-label="返回">${si("back")}</button><span class="sn-sp"></span><button class="sn-ib" data-a="snsGo" data-v="new" aria-label="新增">${si("plusL")}</button></header>`+snReelsMain(d,P,me,one):`<header class="sn-top clear"><nav class="sn-rtab"><button class="${fr?"":"on"}" data-a="snRf" data-v="">Reels</button><button class="${fr?"on":""}" data-a="snRf" data-v="fr">朋友<span class="sn-rfav">${[...new Set(V.filter(p=>fo.includes(p.uid)).map(p=>p.uid))].slice(0,3).map(x=>snAv(snUser(x),18)).join("")}</span></button></nav><span class="sn-sp"></span><button class="sn-ib" data-a="snsGo" data-v="new" aria-label="新增">${si("cam")}</button></header>`+snReelsMain(d,P,me,false); }
addEventListener("hashchange",()=>{ try{ const r=route(); if(!(r.sub==="sns"&&r.p==="reels")) ui.snReelOne=null; }catch(e){} });
/* Reels 帳號旁的按鈕（照 IG）：沒追蹤＝「追蹤」框；在這支影片按了追蹤＝「追蹤中」框；滑走再回來＝不顯示 */
const SN_RFJ={};
const snRfBtn=(uid,pid,fo,me)=>uid===me?"":!fo?`<button class="sn-rfb" data-a="snRfFo" data-v="${uid}" data-p="${pid}">追蹤</button>`:SN_RFJ[pid]?`<button class="sn-rfb on" data-a="snRfFo" data-v="${uid}" data-p="${pid}">追蹤中</button>`:"";
function snRfSync(){ document.querySelectorAll(".sn-reel1").forEach(sec=>{ const b=sec.querySelector(".sn-rfb"), hu=sec.querySelector(".sn-rbu .sn-hu"); if(!hu) return; const uid=hu.dataset.id, pid=(sec.querySelector(".sn-rr [data-id]")||{}).dataset?.id||"";
  const d=snDB(), me=snMeId(), fo=snFol(d,me).includes(uid), h=snRfBtn(uid,pid,fo,me); if(b) b.remove(); if(h) hu.insertAdjacentHTML("afterend",h); }); }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a="snRfFo"]'); if(!t) return; e.stopImmediatePropagation(); e.preventDefault();
  const d=snDB(), me=snMeId(), L=snFol(d,me), v=t.dataset.v, pid=t.dataset.p, i=L.indexOf(v); d.req=d.req||{};
  if(i<0&&snPriv(d,v)){ const R=d.req[v]=d.req[v]||[], j=R.indexOf(me); if(j>=0) R.splice(j,1); else R.push(me); snSave(d); t.textContent=j>=0?"追蹤":"已要求"; return; }
  if(i>=0){ L.splice(i,1); delete SN_RFJ[pid]; } else { L.push(v); ((d.folAt=d.folAt||{})[me]=d.folAt[me]||{})[v]=Date.now(); SN_RFJ[pid]=1; }
  (d.folTs=d.folTs||{})[me]=Date.now(); snSave(d); snRfSync(); },true);   /* 不整頁重畫：Reels 不會跳回第一支 */
/* 滑到別支影片：剛剛按的「追蹤中」收起來，回來就跟 IG 一樣只剩頭貼和名字 */
document.addEventListener("scroll",e=>{ const r=e.target; if(!(r&&r.classList&&r.classList.contains("sn-reels"))) return; const h=r.clientHeight||1, k=Math.round(r.scrollTop/h); if(r._rk===k) return; r._rk=k;
  const secs=[...r.querySelectorAll(".sn-reel1")], cur=secs[k]; let ch=false; secs.forEach(sec=>{ if(sec===cur) return; const pid=(sec.querySelector(".sn-rr [data-id]")||{}).dataset?.id; if(pid&&SN_RFJ[pid]){ delete SN_RFJ[pid]; ch=true; } }); if(ch) snRfSync(); },true);
function snReelsMain(d,P,me,one){ return `
    <main class="sn-reels${one?" one":""}">${P.length?"":`<div class="sn-empty"><span>${si("reels2")}</span><b>還沒有 Reels</b><button data-a="snNewP" data-v="post">上傳影片</button></div>`}${P.map(p=>{ const u=snUser(p.uid); if(!u) return ""; const liked=(d.likes[p.id]||[]).includes(me), fo=snFol(d,me).includes(u.id);
      return `<section class="sn-reel1"><div class="sn-rbg" data-a="snTap" data-id="${p.id}">${snMedia(p,u,0)}</div><i class="sn-heart">${si("heart")}</i>
        <div class="sn-rr">${(()=>{ const rpN=Object.values(d.rp||{}).filter(L=>(L||[]).some(x=>x.id===p.id)).length, rpd=snRp(d,me).some(x=>x.id===p.id), svN=Object.values(d.saved||{}).filter(L=>(L||[]).includes(p.id)).length, sv=(d.saved[me]||[]).includes(p.id);
          return `<button class="${liked?"liked":""}" data-a="snLike" data-id="${p.id}">${si("heart")}<small>${snN(snLikes(d,p))}</small></button><button data-a="snCm" data-id="${p.id}">${si("chat")}<small>${snN((d.cms[p.id]||[]).length)}</small></button><button class="${rpd?"rpd":""}" data-a="snRpTg" data-id="${p.id}" aria-label="轉發">${si("repost")}<small>${snN(rpN)}</small></button><button data-a="snShare" data-id="${p.id}">${si("send")}</button><button class="${sv?"saved":""}" data-a="snSaveP" data-id="${p.id}">${si("save")}<small>${snN(svN)}</small></button><button data-a="snMore" data-id="${p.id}" aria-label="更多">${si("more2")}</button>`; })()}</div>
        <div class="sn-prog" data-id="${p.id}"><i></i></div><em class="sn-2x">2 倍速 ${si("ff","sm")}</em>
        <div class="sn-rb"><span class="sn-rbu"><button class="sn-hu" data-a="snsGo" data-v="profile" data-id="${u.id}">${snAv(u,34,snHasStory(d,u.id),snStorySeen(d,u.id))}<b>${esc(u.u)}${u.ver?SN_VER:""}</b></button>${snRfBtn(u.id,p.id,fo,me)}</span>${p.cap?`<p class="sn-rcap" data-a="snRcap" data-id="${p.id}">${esc(p.cap)}</p>`:""}<small>${si("music","sm")} ${esc(u.u)}・原創音訊</small></div>${one?`<button class="sn-r1c" data-a="snCm" data-id="${p.id}">留言……</button>`:""}</section>`; }).join("")}</main>`; }
function snHls(d,uid){ return ((d.hl||{})[uid]||[]).filter(h=>h&&h.items&&h.items.length); }
/* 限時動態／精選的小圖：照片、或分享的貼文的第一張 */
function snStThumb(d,s,g){ if(s.vid&&s.vid.poster) return `<img class="sn-img" data-mid="${s.vid.poster}" alt="">`; if(s.mid&&!s.vid) return `<img class="sn-img" data-mid="${s.mid}" alt="">`; if(s.post){ const p=d.posts.find(x=>x.id===s.post); if(p&&p.media&&p.media[0]) return `<img class="sn-img" data-mid="${p.media[0].poster||p.media[0].mid}" alt="">`; } return snPic(s.pic||s.id,g,"fill"); }
function snProfile(d,id){ { const me0=snMeId(), u0=snUser(id||me0); if(u0&&u0.mid&&u0.id!==me0&&snLockOf(u0.mid)) return `<header class="sn-top"><button class="sn-ib" data-a="back" aria-label="返回">${si("back")}</button><span class="sn-sp"></span></header><div class="sn-empty"><span>${si("user")}</span><b>無法查看這個帳號</b><p>這個帳號目前還沒開放。</p></div>`; }
  const me=snMeId(), u=snUser(id||me)||snUser(me), mine=u.id===me, P=d.posts.filter(x=>x.uid===u.id).sort((a,b)=>b.ts-a.ts), tab=ui.snTab||"grid", fo=snFol(d,me).includes(u.id);
  const base=0;
  const colF=tab==="saved"&&mine&&ui.snColF?(((d.col||{})[me]||[]).find(c=>c.id===ui.snColF)||null):null;
  const list=tab==="reels"?P.filter(snIsVid):tab==="saved"&&mine?(colF?colF.items:(d.saved[me]||[])).map(x=>d.posts.find(p=>p.id===x)).filter(Boolean):tab==="reposts"?snRp(d,u.id).map(x=>d.posts.find(p=>p.id===x.id)).filter(Boolean):tab==="tagged"?d.posts.filter(p=>(p.tags||[]).includes(u.id)&&snCanSee(d,p.uid)).sort((a,b)=>b.ts-a.ts):P;
  const see=snCanSee(d,u.id), hls=see?snHls(d,u.id):[], lockH=`<nav class="sn-pt off" aria-hidden="true"><button class="on">${si("grid")}</button><button>${si("tag")}</button></nav><div class="sn-empty sn-lock"><span>${si("lock")}</span><b>此個人檔案不公開</b><small>追蹤此個人檔案即可查看對方的相片和影片。</small></div>`;
  const empty=tab==="reels"?`<div class="sn-empty"><span>${si("reels2")}</span><b>還沒有 Reels</b>${mine?`<button data-a="snNewP" data-v="post">上傳影片</button>`:""}</div>`:tab==="tagged"?`<div class="sn-empty"><span>${si("tag")}</span><b>${mine?"有你的相片和影片":"還沒有相片"}</b></div>`:tab==="reposts"?`<div class="sn-empty"><span>${si("repost")}</span><b>還沒有轉發</b></div>`:tab==="saved"?`<div class="sn-empty"><span>${si("save")}</span><b>還沒有收藏</b></div>`
    :mine?`<div class="sn-empty sn-first"><span>${si("cam")}</span><b>建立第一則貼文</b><p>在這個空間傳達心意。</p><button class="sn-firstb" data-a="snCreate">建立</button></div>`:`<div class="sn-empty"><span>${si("cam")}</span><b>尚無貼文</b></div>`;
  return `<header class="sn-top">${mine?`<button class="sn-ib" data-a="snsExit" aria-label="離開">${si("x")}</button><button class="sn-ib" data-a="snCreate" aria-label="新增">${si("plusP")}</button><b class="sn-un c">${snPriv(d,u.id)?`<i class="sn-lk">${si("lock","sm")}</i>`:""}${esc(u.u)}${u.ver?`${SN_VER}`:""}</b><button class="sn-ib" data-a="snMenu" aria-label="選單">${si("menu")}</button>`
      :`<button class="sn-ib" data-a="back" aria-label="返回">${si("back")}</button><b class="sn-un">${snPriv(d,u.id)?`<i class="sn-lk">${si("lock","sm")}</i>`:""}${esc(u.u)}${u.ver?`${SN_VER}`:""}</b><span class="sn-sp"></span>${u.id==="o:scout"&&isAdminAcct()?`<button class="sn-ib" data-a="snsGo" data-v="scout" aria-label="星探設定">${si("menu")}</button>`:isAdminAcct()&&!u.mid?`<button class="sn-ib" data-a="snAdmUser" data-v="${u.id}" aria-label="管理">${si("dots")}</button>`:""}`}</header>
    <section class="sn-ph"><span class="sn-pav"><button class="sn-hu" data-a="${see&&snHasStory(d,u.id)?"snStory":""}" data-v="${u.id}" data-o="1">${snAv(u,86,snHasStory(d,u.id),snStorySeen(d,u.id),snStoryCf(d,u.id))}</button>${mine?`<button class="sn-padd" data-a="snNewP" data-v="story" aria-label="新增限時動態">${si("plusP")}</button>`:""}</span><div class="sn-phr">${u.name?`<b class="sn-pnm">${esc(u.name)}</b>`:""}<div class="sn-stat"><span><b>${snN(P.length)||0}</b>貼文</span><button data-a="snFl" data-v="${u.id}" data-k="fol"><b>${snN(base+snFollowers(d,u.id))||0}</b>位粉絲</button><button data-a="snFl" data-v="${u.id}" data-k="ing"><b>${snN(snFol(d,u.id).length)||0}</b>追蹤中</button></div></div></section>
    <div class="sn-bio">${u.co?`<p class="sn-cat">娛樂公司</p>`:u.gid?`<p class="sn-cat">音樂家／樂團</p>`:u.id&&u.id.startsWith("m:")?`<p class="sn-cat">藝人</p>`:""}${u.bio?`<p>${esc(u.bio)}</p>`:""}${!mine?(()=>{ const mu=snFol(d,me).filter(x=>x!==u.id&&(d.fol[x]||[]).includes(u.id)).map(snUser).filter(Boolean); return mu.length?`<button class="sn-mut" data-a="snFl" data-v="${u.id}" data-k="fol"><span class="sn-lbav">${mu.slice(0,3).map(x=>snAv(x,26)).join("")}</span><span><b>${mu.slice(0,2).map(x=>esc(x.u)).join("、")}</b>${mu.length>2?`和另外 ${mu.length-2} 人`:""}都在追蹤</span></button>`:""; })():""}</div>
    <div class="sn-btns">${mine?`<button data-a="snsGo" data-v="edit">編輯個人檔案</button><button data-a="snShareMe">分享個人檔案</button><button class="sn-bi ${ui.snSugOpen===u.id?"on":""}" data-a="snSugTg" data-v="${u.id}" aria-label="探索用戶"><svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><circle cx="9" cy="8" r="4"/><path d="M1.5 20c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5z"/><path d="M19 8v6M16 11h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>`:`<button class="${fo||snReqd(d,u.id)?"":"pri"}" data-a="snFollow" data-v="${u.id}">${fo?`追蹤中 ${si("chev","sm")}`:snReqd(d,u.id)?"已要求":"追蹤"}</button><button data-a="snsGo" data-v="thread" data-id="${u.id}">發訊息</button><button class="sn-bi ${ui.snSugOpen===u.id?"on":""}" data-a="snSugTg" data-v="${u.id}" aria-label="探索用戶"><svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><circle cx="9" cy="8" r="4"/><path d="M1.5 20c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5z"/><path d="M19 8v6M16 11h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>`}</div>
    ${ui.snSugOpen===u.id?snSugHtml(d,"探索用戶"):""}
    ${hls.length||mine?`<div class="sn-hls">${mine?`<button data-a="snHlNew"><span class="sn-hlc add">${si("plusP")}</span><small>新增</small></button>`:""}${hls.map(h=>`<button data-a="snHl" data-v="${u.id}" data-id="${h.id}"><span class="sn-hlc">${snStThumb(d,h.items[0],u.g)}</span><small>${esc(h.title)}</small></button>`).join("")}</div>`:""}
    ${see?"":lockH}${see?`<nav class="sn-pt">${[["grid","gridD","貼文"],mine?["reposts","repost","轉發"]:["reels","reels2","Reels"],["tagged","tag","被標註"]].map(([k,ic,l])=>`<button class="${tab===k?"on":""}" data-a="snsPTab" data-v="${k}" aria-label="${l}">${si(ic)}</button>`).join("")}</nav>
    ${tab==="saved"?`<div class="sn-fmode">已儲存</div>${((d.col||{})[me]||[]).length?`<nav class="sn-colf">${((d.col||{})[me]||[]).map(c=>`<button class="${ui.snColF===c.id?"on":""}" data-a="snColF" data-v="${c.id}">${esc(c.name)}<em>${c.items.length}</em></button>`).join("")}</nav>`:""}`:""}
    <main class="sn-grid ${tab==="reels"?"reels":""}">${list.length?list.map(p=>`<button data-a="snsGo" data-v="${tab==="reels"?"reels":"post"}" data-id="${p.id}">${tab==="reels"?`<img class="sn-img" data-mid="${(p.media[0]||{}).poster||""}" alt=""><i class="sn-rv">${si("heart","sm")} ${fmtW(snLikes(d,p))}</i>`:snThumb(p,snUser(p.uid))}</button>`).join(""):empty}</main>`:""}`; }

function snEdit(d){ const me=snMeId(), u=snUser(me);
  return `<header class="sn-top"><button class="sn-ib" data-a="back" aria-label="取消">${si("back")}</button><b>編輯個人檔案</b><span class="sn-sp"></span><button class="sn-next" data-a="snEditOk">完成</button></header>
    <div class="sn-edav"><label>${snAv(u,86)}<span>編輯大頭貼照</span><input type="file" accept="image/*" id="snAvIn"></label></div>
    <div class="sn-edb"><label class="sn-fb2"><small>名稱</small><input id="snNIn" maxlength="30" value="${esc(u.name||"")}" placeholder="名稱" autocomplete="off"></label>
      <label class="sn-fb2"><small>用戶名稱</small><input id="snUIn" name="sn-handle" value="${esc(u.u)}" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false"></label>
      <label class="sn-fb2"><small>簡介</small><textarea id="snBioIn" rows="3" maxlength="150" placeholder="簡介">${esc(u.bio||"")}</textarea></label></div>
    <div class="sn-edf"><button class="sn-prv ${snForcePriv(me)?"lock":""}" data-a="snPrivT"><span>私人帳號${snForcePriv(me)?`<small>出道後，舊帳號只能是私人帳號</small>`:""}</span><i class="sn-sw ${snPriv(d,me)?"on":""}"></i></button></div>`; }
function snNew(d){ const dr=ui.snDraft||(ui.snDraft={media:[],cap:"",mode:route().id==="story"?"story":route().id==="sub"?"sub":"post"}), n=dr.media.length, subU=dr.mode==="sub"?snUser(snSubTo((session()||{}).member)):null;
  return `<header class="sn-top"><button class="sn-ib" data-a="snNewX" aria-label="取消">${si("x")}</button><b>${dr.mode==="story"?"新增限時動態":dr.mode==="sub"?"投稿":"新貼文"}</b><span class="sn-sp"></span><button class="sn-next" data-a="snPost" ${n?"":"disabled"}>${dr.mode==="sub"?"送出":"分享"}</button></header>
    ${subU?`<div class="sn-subto">${snAv(subU,28)}<span>投稿到 <b>${esc(subU.u)}</b>，公司審核後會用官方帳號發布（會加上你的名字）</span></div>`:""}${isAdminAcct()&&dr.mode==="post"?`<label class="sn-asr"><span>發文身分</span><select id="snAs"><option value="">自己（${esc(snUser(snMeId()).u)}）</option>${snOfAccs().map(snUser).filter(Boolean).map(x=>`<option value="${esc(x.id)}" ${dr.as===x.id?"selected":""}>${esc(x.u)}（${esc(x.name)}）</option>`).join("")}</select></label>`:""}
    ${n?`<div class="sn-media"><div class="sn-car">${dr.media.map(x=>`<div class="sn-sl">${x.type==="video"?`<video class="sn-img" src="${x.url||""}" playsinline muted loop autoplay></video><em class="sn-vdur">${fmtDur(x.dur)}</em>`:`<img class="sn-img" data-mid="${x.mid}" alt="">`}</div>`).join("")}</div>${n>1?`<em class="sn-cnt">1/${n}</em>`:""}</div>`:`<label class="sn-pick">${si("cam")}<b>從相簿選擇</b><small>${dr.mode==="story"?`一張照片或 ${SN_VMAX} 秒內的影片`:`最多 10 張・影片 ${SN_VMAX} 秒內`}</small><input type="file" accept="image/*,video/*" ${dr.mode==="story"?"":"multiple"} id="snFile"></label>`}
    ${n&&dr.mode!=="story"&&n<10&&!dr.media.some(m=>m.type==="video")?`<label class="sn-addm">＋ 再加相片<input type="file" accept="image/*" multiple id="snFile"></label>`:""}
    ${dr.mode==="story"?"":`<textarea id="snCap" class="sn-cap" placeholder="輸入說明文字…">${esc(dr.cap)}</textarea>${dr.mode==="sub"?"":`<button class="sn-tagr" data-a="snTagPick">${si("tag","sm")}<span>標註人物</span><em>${(dr.tags||[]).map(snUser).filter(Boolean).map(x=>esc(x.u)).join("、")}</em>${si("chev","sm")}</button>`}`}
    ${dr.mode==="story"?`<div class="sn-aud"><button class="${dr.aud!=="cf"?"on":""}" data-a="snAud" data-v="all">${snAv(snUser(snMeId()),24)}你的限時動態</button><button class="cf ${dr.aud==="cf"?"on":""}" data-a="snAud" data-v="cf"><i>${si("star","sm")}</i>摯友</button></div>`:""}
    ${dr.mode==="sub"?"":dr.mus?`<div class="sn-musr"><button class="sn-musb on" data-a="snMusAdd">${si("music","sm")}<span>${esc(snMusLabel(dr.mus))}</span></button><button class="sn-ib" data-a="snMusDel" aria-label="移除音樂">${si("x")}</button></div>`:`<button class="sn-musb" data-a="snMusAdd">${si("music","sm")}<span>加入音樂</span>${si("chev","sm")}</button>`}
    ${dr.mode==="sub"?"":`<nav class="sn-mode"><button class="${dr.mode==="post"?"on":""}" data-a="snMode" data-v="post">貼文</button><button class="${dr.mode==="story"?"on":""}" data-a="snMode" data-v="story">限時動態</button></nav>`}`; }
function snDmList(d){ const me=snMeId(), q=nz((ui.snDmQ||"").trim()), TH=dmThreads(); d.dm=Object.fromEntries(TH.map(x=>[x.id,x.t])); const ids=TH.map(x=>x.id);
  const list=(q?snAllUsers().filter(u=>u.id!==me&&(nz(u.u).includes(q)||nz(u.name).includes(q))).map(u=>u.id):ids).map(snUser).filter(Boolean);
  return `<header class="sn-top"><b class="sn-un">${esc(snUser(me).u)}<i class="sn-chv dn">${si("chev","sm")}</i></b><span class="sn-sp"></span><button class="sn-ib" data-a="snDmNew" aria-label="新訊息">${si("compose")}</button></header>
    <label class="sn-q in">${si("search")}<input id="snDmQ" placeholder="搜尋" autocomplete="off" value="${esc(ui.snDmQ||"")}"></label>

    <div class="sn-dmh"><b>訊息</b></div>
    <main class="sn-dml">${list.length?list.map(u=>{ const t=d.dm[u.id]||[], last=t[t.length-1], un=last&&last.from!==me&&!last.read, nUn=un?t.filter(x=>x.from!==me&&!x.read).length:0, at=snLastAct(d,u.id,t), on=at&&Date.now()-at<5*60000, act=snActTxt(at);
      const sub=un?`${nUn>1?`${Math.min(nUn,4)}${nUn>4?"+":""} 則新訊息`:esc((last.text||"分享了一則貼文").slice(0,24))}・${snAgoS(last.ts)}`:act&&(!last||at>last.ts)?act:last?(last.from===me?`已傳送・${snAgoS(last.ts)}`:`${esc((last.text||"分享了一則貼文").slice(0,24))}・${snAgoS(last.ts)}`):esc(u.u);
      return `<button class="sn-dmr" data-a="snsGo" data-v="thread" data-id="${u.id}"><span class="sn-dmav">${snAv(u,56)}${on?`<i class="sn-onl"></i>`:""}</span><span><b class="${un?"un":""}">${esc(u.name||u.u)}</b><small class="${un?"un":""}">${sub}</small></span>${un?`<i class="sn-dot"></i>`:""}</button>`; }).join(""):`<p class="sn-none">還沒有訊息</p>`}</main>`; }

/* 私訊聊天室（照 Instagram）：上面圓形返回鍵＋頭貼名字＋電話、視訊；對方泡泡灰、自己紫藍漸層；相隔一小時以上中間顯示時間；輸入框裡面左邊相機、右邊麥克風／相片／貼圖／＋，打字後變傳送鍵 */
function snThread(d,id){ const me=snMeId(), u=snUser(id); if(!u) return snDmList(d); const t=dmGet(id); if(t.length&&t[t.length-1].from!==me&&!t[t.length-1].read){ t.forEach(x=>{ if(x.from!==me) x.read=true; }); S.set(dmKey(me,id),t); }
  const at=snLastAct(d,u.id,t), act=snActTxt(at);
  const ts=x=>{ const a=new Date(x), n=new Date(); return `${a.getFullYear()!==n.getFullYear()?a.getFullYear()+"年":""}${a.getMonth()+1}月${a.getDate()}日 ${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`; };
  const rows=t.map((x,i)=>{ const mine=x.from===me, prev=t[i-1], next=t[i+1], gap=!prev||x.ts-prev.ts>3600e3, lastOf=!next||next.from!==x.from||next.ts-x.ts>3600e3;
    const bub=`<div class="sn-bub ${mine?"me":""} ${x.mid?"pic":""}" data-a="snDmTap" data-v="${u.id}" data-i="${i}">${x.post?`<button class="sn-bpost" data-a="snsGo" data-v="post" data-id="${x.post}">${si("send","sm")} 分享了一則貼文</button>`:x.mid?`<img class="sn-img" data-mid="${x.mid}" alt="" style="aspect-ratio:${x.w||3}/${x.h||4}">`:esc(x.text)}${(x.lk||[]).length?`<i class="sn-blk">❤️</i>`:""}</div>`;
    return `${gap&&x.ts?`<div class="sn-dts">${ts(x.ts)}</div>`:""}${x.story?`<small class="sn-bst ${mine?"me":""}">${mine?"你回覆了對方的限時動態":"回覆了你的限時動態"}</small>`:""}<div class="sn-brow ${mine?"me":""} ${lastOf?"last":""}">${mine?"":`<span class="sn-bav">${lastOf?snAv(u,28):""}</span>`}${bub}</div>`; }).join("");
  return `<header class="sn-top sn-dmtop"><button class="sn-gb" data-a="back" aria-label="返回">${si("back")}</button><button class="sn-hu" data-a="snsGo" data-v="profile" data-id="${u.id}">${snAv(u,32)}<span class="sn-pu"><b>${esc(u.name||u.u)}${u.ver?SN_VER:""}<i class="sn-chv">${si("chev","sm")}</i></b><small>${esc(act||u.u)}</small></span></button><span class="sn-sp"></span><button class="sn-gb" data-a="snCallX" aria-label="語音通話">${si("phone")}</button><button class="sn-gb" data-a="snCallX" aria-label="視訊通話">${si("vcam")}</button></header>
    <main class="sn-thread-b">${t.length?`<div class="sn-dmhead">${snAv(u,86)}<b>${esc(u.name||u.u)}${u.ver?SN_VER:""}</b><small>${esc(u.u)}・HAECHU</small><button data-a="snsGo" data-v="profile" data-id="${u.id}">查看個人檔案</button></div>`+rows+(t[t.length-1].from===me&&t[t.length-1].read?`<small class="sn-seen">已查看</small>`:""):`<div class="sn-dmhead">${snAv(u,86)}<b>${esc(u.name||u.u)}${u.ver?SN_VER:""}</b><small>${esc(u.u)}・HAECHU</small><button data-a="snsGo" data-v="profile" data-id="${u.id}">查看個人檔案</button></div>`}</main>
    <form class="sn-dmf ig" id="snDmForm" data-id="${u.id}"><div class="sn-dmp"><label class="sn-dmpic" aria-label="相機">${si("cam","sm")}<input type="file" accept="image/*" id="snDmPic" data-id="${u.id}"></label><textarea rows="1" class="ag" id="snDmIn" placeholder="發送訊息……" autocomplete="off"></textarea>
      <span class="sn-dmic"><button type="button" data-a="snCallX" aria-label="語音訊息">${si("mic")}</button><label aria-label="相片">${si("img")}<input type="file" accept="image/*" class="sn-dmpic2" data-id="${u.id}"></label><button type="button" data-a="snDmStk" aria-label="貼圖">${si("stk")}</button><button type="button" data-a="snDmPlus" aria-label="更多">${si("plusC")}</button></span>
      <button type="submit" class="sn-dmsend" aria-label="傳送">${si("arrowUp")}</button></div></form>`; }
function snNotifList(d){ const me=snMeId(), mine=d.posts.filter(p=>p.uid===me), L=[];
  mine.forEach(p=>{ (d.likes[p.id]||[]).filter(x=>x!==me).forEach(x=>L.push({uid:x,t:"說你的貼文讚。",p:p.id,ts:p.ts+60e3})); (d.cms[p.id]||[]).filter(c=>c.uid!==me).forEach(c=>L.push({uid:c.uid,t:`留言：${c.text}`,p:p.id,ts:c.ts})); });

  const myU=(snUser(me)||{}).u||"";
  d.posts.forEach(p=>{ if(p.uid!==me&&(p.tags||[]).includes(me)) L.push({uid:p.uid,t:"在貼文中標註了你。",p:p.id,ts:p.ts}); if(p.uid!==me&&myU&&new RegExp("@"+myU.replace(/[.]/g,"\\.")+"(?![a-z0-9._])","i").test(p.cap||"")) L.push({uid:p.uid,t:"在貼文中提到你。",p:p.id,ts:p.ts+1});
    const C=d.cms[p.id]||[]; C.forEach(c=>{ if(c.uid===me) return; const par=c.re&&C.find(x=>x.id===c.re); if(par&&par.uid===me&&p.uid!==me) L.push({uid:c.uid,t:`回覆了你的留言：${c.text}`,p:p.id,ts:c.ts}); else if(p.uid!==me&&myU&&c.text.toLowerCase().includes("@"+myU)) L.push({uid:c.uid,t:`在留言中提到你：${c.text}`,p:p.id,ts:c.ts}); (c.lk||[]).length; }); });
  (d.stories||[]).forEach(s=>{ if(s.post&&s.uid!==me&&mine.some(p=>p.id===s.post)) L.push({uid:s.uid,t:"把你的貼文加到限時動態。",p:s.post,ts:s.ts}); if(s.uid!==me&&(s.ment||[]).some(m=>m.u===me)) L.push({uid:s.uid,t:"在限時動態中提到你。",ts:s.ts}); });
  Object.keys(d.fol).filter(k=>k!==me&&(d.fol[k]||[]).includes(me)).forEach(k=>L.push({uid:k,t:"開始追蹤你。",ts:(d.folTs||{})[k]||0}));
  return L.sort((a,b)=>b.ts-a.ts); }
function snNotif(d){ const me=snMeId(), L=snNotifList(d); (d.ntSeen=d.ntSeen||{})[me]=Date.now(); snSave(d);
  const day=Date.now()-864e5, wk=Date.now()-7*864e5, grp=[["今天",L.filter(x=>x.ts>=day)],["這週",L.filter(x=>x.ts<day&&x.ts>=wk)],["更早",L.filter(x=>x.ts<wk)]].filter(g=>g[1].length);
  const row=x=>{ const u=snUser(x.uid); if(!u) return ""; return `<div class="sn-ntr"><button class="sn-hu" data-a="snsGo" data-v="profile" data-id="${u.id}">${snAv(u,44)}</button><p><b>${esc(u.u)}</b> ${esc(x.t)} <small>${snsAgo(x.ts||Date.now())}</small></p>${x.p?`<button class="sn-ntp" data-a="snsGo" data-v="post" data-id="${x.p}">${(()=>{ const pp=d.posts.find(p=>p.id===x.p); return pp?snThumb(pp,snUser(pp.uid)):snPic(x.p,u.g,"fill"); })()}</button>`:x.t==="開始追蹤你。"?`<button class="sn-fb ${snFol(d,me).includes(u.id)?"":"pri"}" data-a="snFollow" data-v="${u.id}">${snFol(d,me).includes(u.id)?"追蹤中":"回追"}</button>`:""}</div>`; };
  return `<header class="sn-top"><button class="sn-ib" data-a="back" aria-label="返回">${si("back")}</button><b>通知</b><span class="sn-sp"></span></header>
    <main class="sn-nt">${(()=>{ const R=((d.req||{})[me]||[]).map(snUser).filter(Boolean); return R.length?`<h3 class="sn-nth">追蹤要求</h3>${R.map(u=>`<div class="sn-ntr"><button class="sn-hu" data-a="snsGo" data-v="profile" data-id="${u.id}">${snAv(u,44)}</button><p><b>${esc(u.u)}</b> 想要追蹤你。</p><button class="sn-fb pri" data-a="snReqOk" data-v="${u.id}">確認</button><button class="sn-fb" data-a="snReqNo" data-v="${u.id}">刪除</button></div>`).join("")}`:""; })()}${grp.length?grp.map(([t,g])=>`<h3 class="sn-nth">${t}</h3>${g.map(row).join("")}`).join(""):`<p class="sn-none">還沒有通知</p>`}</main>`; }

/* 留言 */
function snOpenCm(id){ const d=snDB(), p=d.posts.find(x=>x.id===id); if(!p) return; const me=snMeId(), L=d.cms[id]||[], srt=ui.snCmSort==="top"?"top":"new", old=layer.querySelector("#snCmIn"), draft=old&&layer.querySelector(".sn-sh.cm")?old.value:null, cl0=layer.querySelector(".sn-sh.cm .sn-cl"), cly=cl0?cl0.scrollTop:0, reopen=!!cl0;
  const ids=new Set(L.map(c=>c.id)), lkN=c=>(c.lk||[]).length;
  const row=(c,sub)=>{ const u=snUser(c.uid); if(!u) return ""; const lk=c.lk||[], mine=c.uid===me;
    return `<div class="sn-cr ${sub?"sub":""}"><button class="sn-cav" data-a="snsGo" data-v="profile" data-id="${u.id}" aria-label="${esc(u.u)}">${snAv(u,sub?28:38)}</button><div class="sn-cb"><p class="sn-cu"><button class="sn-cun" data-a="snsGo" data-v="profile" data-id="${u.id}">${esc(u.u)}</button><time>${snsAgo(c.ts)}</time></p><p class="sn-ct">${mine?snRich(c.text):snRichH(trT("s:"+c.id,c.text,"","span"))}</p>
      <div class="sn-ca"><button data-a="snCmRe" data-id="${id}" data-v="${c.re&&ids.has(c.re)?c.re:c.id}" data-u="${esc(u.u)}">回覆</button>${mine||isAdminAcct()||p.uid===me?`<button data-a="snCmDel" data-id="${id}" data-v="${c.id}">${mine?"刪除":"隱藏"}</button>`:""}</div></div>
      <button class="sn-clk ${lk.includes(me)?"on":""}" data-a="snCmLk" data-id="${id}" data-v="${c.id}" aria-label="讚">${si("heart")}${lk.length?`<small>${fmt(lk.length)}</small>`:""}</button></div>`; };
  const top=L.filter(c=>!c.re||!ids.has(c.re)).sort((a,b)=>srt==="top"?(lkN(b)-lkN(a))||(b.ts-a.ts):(b.ts-a.ts));
  setLayer(`<div class="sn-shw" data-a="tCloseLayer"><div class="sn-sh cm" role="dialog" aria-label="留言"><i class="sn-grab"></i><div class="sn-cmh"><b>留言</b></div>${ui.snCmCap===id&&p.cap?(()=>{ const au=snUser(p.uid)||{}; return `<div class="sn-capb"><button class="sn-cav" data-a="snsGo" data-v="profile" data-id="${au.id||""}">${snAv(au,38)}</button><div class="sn-cb"><p class="sn-cu"><b>${esc(au.u||"")}</b>${au.ver?SN_VER:""}<time>${snsAgo(p.ts)}</time></p><p class="sn-ct">${snRich(p.cap)}</p></div></div>`; })():""}
    ${L.length?`<button class="sn-sort" data-a="snCmSort" data-id="${id}">${srt==="top"?"熱門":"最新"} ${si("chev","sm")}</button>`:""}
    <div class="sn-cl">${L.length?top.map(c=>row(c)+L.filter(k=>k.re===c.id).sort((a,b)=>a.ts-b.ts).map(k=>row(k,1)).join("")).join(""):`<p class="sn-none">還沒有留言<br><small>開始對話吧。</small></p>`}</div>
    ${ui.snRe&&ui.snRe.p===id?`<div class="sn-reb"><span>正在回覆 ${esc(ui.snRe.u)}</span><button data-a="snCmReX" data-id="${id}" aria-label="取消">${si("x","sm")}</button></div>`:""}
    <div class="sn-cemo">${["❤️","🙌","🔥","👏","😢","😍","😮","😂"].map(x=>`<button data-a="snCmEmo" data-v="${x}">${x}</button>`).join("")}</div>
    <form class="sn-cf" id="snCmForm" data-id="${id}">${snAv(snUser(me),40)}<div class="sn-cpill"><textarea rows="1" class="ag" id="snCmIn" placeholder="你對此有何看法？" autocomplete="off">${draft!=null?esc(draft):ui.snRe&&ui.snRe.p===id?"@"+esc(ui.snRe.u)+" ":""}</textarea><button type="submit" class="sn-csend" aria-label="發佈"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button></div></form></div></div>`,"sncm");
  if(reopen){ const w=layer.querySelector(".sn-shw"); if(w){ w.classList.add("open"); const sh=w.querySelector(".sn-sh"); if(sh) sh.style.transition="none"; const c=w.querySelector(".sn-cl"); if(c) c.scrollTop=cly; } } else requestAnimationFrame(()=>{ const w=layer.querySelector(".sn-shw"); if(w) w.classList.add("open"); }); }
/* 留言的「排序方式」：疊在留言面板上面，不把留言面板關掉（跟 IG 一樣） */
function snCmSortSheet(id){ const w=layer.querySelector(".sn-shw"); if(!w) return; const old=w.querySelector(".sn-shw.sub"); if(old) old.remove(); const top=ui.snCmSort==="top";
  w.insertAdjacentHTML("beforeend",`<div class="sn-shw sub" data-a="snCmSortX"><div class="sn-sh srt" role="dialog" aria-label="排序方式"><i class="sn-grab"></i><div class="sn-cmh"><b>排序方式</b></div><div class="srt-g"><button data-a="snCmSortSet" data-v="new" data-id="${id}"><span>最新</span>${top?"":si("check","sm")}</button><button data-a="snCmSortSet" data-v="top" data-id="${id}"><span>熱門</span>${top?si("check","sm"):""}</button></div></div></div>`);
  requestAnimationFrame(()=>{ const s2=w.querySelector(".sn-shw.sub"); if(s2) s2.classList.add("open"); }); }
/* 限時動態 */
/* 從首頁那排點：看完會接著看下一個人；從個人檔案點：只看這個人 */
function snOpenStory(uid,only){ const d=snDB(); const order=only?[uid]:[uid,...[...new Set(snActiveStories(d).map(s=>s.uid))].filter(x=>x!==uid&&snFol(d,snMeId()).includes(x))];
  ui.snStory={order,ui:0,si:0}; snShowStory(); }
function snShowStory(){ const st=ui.snStory; if(!st) return; const d=snDB(); const uid=st.order[st.ui]; if(!uid){ layer.innerHTML=""; ui.snStory=null; clearTimeout(ui.snStT); snMusStop(); render(); return; }
  const list=st.list?st.list:snActiveStories(d).filter(s=>s.uid===uid).sort((a,b)=>a.ts-b.ts); if(!list.length){ st.ui++; st.si=0; return snShowStory(); } if(st.si>=list.length){ st.ui++; st.si=0; return snShowStory(); }
  const s=list[st.si], u=snUser(uid), me=snMeId(); d.seen[me]=d.seen[me]||{}; d.seen[me][s.id]=1; snSave(d);
  setLayer(`<div class="sn-story" role="dialog" aria-label="限時動態"><div class="sn-sbar">${list.map((x,i)=>`<i><u class="${i<st.si?"done":i===st.si?"run":""}"></u></i>`).join("")}</div>
    <header class="sn-sh2">${snAv(u,32)}<b>${esc(u.u)}</b><small>${st.title?esc(st.title):snsAgo(s.ts)}</small>${s.mus&&s.mus.mid?`<small class="sn-smus">${snMusTag(s.mus,"s:"+s.id,s.uid)}</small>`:""}<span class="sn-sp"></span>${s.cf?`<em class="sn-scf">摯友</em>`:""}${s.vid?`<button class="sn-ib" data-a="snSnd" aria-label="聲音">${snSndIc()}</button>`:""}${!st.list&&(uid===me||isAdminAcct())?`<button class="sn-ib" data-a="snStoryDel" data-v="${s.id}" aria-label="刪除">${si("dots")}</button>`:st.hid&&uid===me?`<button class="sn-ib" data-a="snHlDel" data-v="${st.hid}" aria-label="刪除精選">${si("dots")}</button>`:""}<button class="sn-ib" data-a="snStoryX" aria-label="關閉">${si("x")}</button></header>
    <div class="sn-simg">${s.mid&&s.vid?`<video class="sn-img sn-svid" playsinline webkit-playsinline ${s.vid.poster?`data-pmid="${s.vid.poster}"`:""}></video>${s.ov?`<img class="sn-sov" data-mid="${s.ov}" alt="">`:""}${stViewLayer(s)}`:s.mid?`<img class="sn-img sn-sim" alt="">${stViewLayer(s)}`:s.post?snStoryPost(d,s.post):snPic(s.pic,u.g,"fill")}</div>
    <button class="sn-sprev" data-a="snStoryNav" data-v="-1" aria-label="上一則"></button><button class="sn-snext" data-a="snStoryNav" data-v="1" aria-label="下一則"></button>
    ${uid===me&&!st.list?`<button class="sn-sviews" data-a="snStViews" data-v="${s.id}">${si("eye","sm")}已查看 ${fmt(Object.keys(d.seen).filter(x=>x!==me&&(d.seen[x]||{})[s.id]).length)}</button>`:uid!==me&&!uid.startsWith("o:")?`<div class="sn-sre"><div class="sn-semo">${["😂","😮","😍","😢","👏","🔥"].map(x=>`<button data-a="snStReact" data-v="${x}" data-u="${uid}" data-id="${s.id}">${x}</button>`).join("")}</div><form id="snStReF" data-u="${uid}" data-id="${s.id}"><textarea rows="1" class="ag" id="snStReIn" placeholder="傳送訊息……" autocomplete="off"></textarea><button type="submit" class="sn-ssend">${si("send","sm")}</button><button type="button" class="sn-shrt ${((d.slk||{})[s.id]||[]).includes(me)?"on":""}" data-a="snStHeart" data-u="${uid}" data-id="${s.id}" aria-label="喜歡">${si("heart")}</button></form></div>`:""}</div>`,"snstory");
  hydrateMedia(layer); clearTimeout(ui.snStT); if(s.mus&&s.mus.mid) snMusPlay(s.mus.mid,"st:"+s.id); else if(snMusCur) snMusStop();
  /* 照片／影片還沒下載好：先轉圈、等下載好才開始倒數；剛發的還在上傳就多試幾次（不會黑一片） */
  const stGet=(mid,el,cb)=>{ let k=0; const go=()=>mediaSrc(mid).then(u=>{ if(!el.isConnected||ui.snStory!==st) return; if(u) return cb(u); if(++k<5) return setTimeout(go,2500); const w=el.closest(".sn-simg"); if(w) w.classList.add("sn-sfail"); ui.snStT=setTimeout(()=>{ if(ui.snStory===st){ st.si++; snShowStory(); } },2500); }); go(); };
  const sim=layer.querySelector(".sn-sim"); if(sim){ stGet(s.mid,sim,u=>{ const w=sim.closest(".sn-simg"); sim.onload=()=>{ if(w) w.classList.add("sn-sok"); if(ui.snStory===st){ clearTimeout(ui.snStT); ui.snStT=setTimeout(()=>{ if(ui.snStory===st){ st.si++; snShowStory(); } },5000); } }; sim.src=u; }); return; }
  if(s.vid){ const v=layer.querySelector(".sn-svid"); if(v){ if(v.dataset.pmid) mediaSrc(v.dataset.pmid).then(u=>{ if(u&&!v.poster) v.poster=u; }); stGet(s.mid,v,u=>{ if(!v.isConnected) return; const w=v.closest(".sn-simg"); if(w) w.classList.add("sn-sok"); v.src=u; v.muted=ui.snMute!==false; v.play().catch(()=>{ v.muted=true; ui.snMute=true; v.play().catch(()=>{}); }); }); }
    ui.snStT=setTimeout(()=>{ if(ui.snStory===st){ st.si++; snShowStory(); } },Math.max(3,Math.min(61,s.vid.dur||15))*1000+800); return; }
  ui.snStT=setTimeout(()=>{ if(ui.snStory===st){ st.si++; snShowStory(); } },5000); }
/* 分享到限時動態的貼文：跟 IG 一樣是一張貼文卡，點了可以看原本的貼文 */
function snStoryPost(d,pid){ const p=d.posts.find(x=>x.id===pid), a=p&&snUser(p.uid); if(!p||!a) return `<div class="sn-spost gone"><b>這則貼文已刪除</b></div>`; const m=p.media&&p.media[0];
  return `<div class="sn-spost" style="--sg:${grad(a.g||0)}"><button class="sn-spc" data-a="snStoryPost" data-id="${p.id}"><span class="sn-spu">${snAv(a,26)}<b>${esc(a.u)}${a.ver?`${SN_VER}`:""}</b></span><span class="sn-spm">${m?`<img class="sn-img" data-mid="${m.poster||m.mid}" alt="">${m.type==="video"?`<i class="sn-ri">${si("reels2","sm")}</i>`:""}`:snPic(p.id,a.g,"fill")}</span>${p.cap?`<span class="sn-spcap"><b>${esc(a.u)}</b> ${esc(p.cap.slice(0,60))}</span>`:""}</button></div>`; }
/* 分享到私訊 */
function snOpenShare(id){ const d=snDB(), me=snMeId(), fol=snFol(d,me), th=dmThreads().map(x=>x.id), A=snAllUsers().filter(u=>u.id!==me&&!u.off), rk=u=>(th.includes(u.id)?0:fol.includes(u.id)?1:2), U=A.sort((a,b)=>rk(a)-rk(b)).slice(0,30);
  setLayer(`<div class="sn-shw" data-a="tCloseLayer"><div class="sn-sh snsr" role="dialog" aria-label="分享"><i class="sn-grab"></i><label class="snsr-q">${si("search")}<input id="snSrQ" placeholder="搜尋" autocomplete="off"></label>
    <div class="snsr-g">${U.map(u=>{ const at=snLastAct(d,u.id), on=at&&Date.now()-at<5*60000; return `<button class="snsr-u" data-a="snShareTo" data-id="${id}" data-v="${u.id}" data-q="${esc((u.u+" "+(u.name||"")).toLowerCase())}"><span class="snsr-av">${snAv(u,72)}${on?`<i class="sn-onl"></i>`:""}</span><small>${esc(u.name||u.u)}</small></button>`; }).join("")}</div>
    <div class="snsr-act"><button data-a="snToStory" data-id="${id}"><i>${si("plus")}</i><small>新增到限時動態</small></button>${navigator.share?`<button data-a="snNatShare" data-id="${id}"><i><svg class="si" viewBox="0 0 24 24"><path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5"/></svg></i><small>分享到……</small></button>`:""}<button data-a="snCopyLink" data-id="${id}"><i>${si("link")}</i><small>複製連結</small></button><button data-a="snsGo" data-v="dm"><i>${si("send")}</i><small>訊息</small></button></div></div></div>`,"snsh");
  requestAnimationFrame(()=>{ const w=layer.querySelector(".sn-shw"); if(w) w.classList.add("open"); }); }
function snFakeReply(uid){ return; if(!uid.startsWith("f:")&&!uid.startsWith("m:")) return; const R=["哈哈真的！","好喔～💜","我也這麼覺得","等等回你！","太可愛了吧 🥹"];
  setTimeout(()=>{ const d=snDB(); (d.dm[uid]=d.dm[uid]||[]).push({from:uid,text:R[Math.random()*R.length|0],ts:Date.now()}); snSave(d); if(route().sub==="sns"&&route().p==="thread"&&route().id===uid){ render(); } },2200+Math.random()*2000); }
async function snAddFiles(files){ const dr=ui.snDraft; if(!dr) return; for(const f of files){ if(f.type.startsWith("video/")||/\.(mov|mp4|m4v|webm)$/i.test(f.name||"")){ await snAddVideo(f); return; } if(!f.type.startsWith("image/")) continue; if(dr.media.some(m=>m.type==="video")){ toast("影片要單獨發一則貼文"); break; } if(dr.media.length>=(dr.mode==="story"?1:10)) break; try{ const {blob,w,h}=await prepPhoto(f), id="sn"+Date.now()+dr.media.length; await MDB.put(id,blob); dr.media.push({mid:id,w,h}); }catch(e){ toast("這張照片讀不出來"); } } render(); if(dr.mode==="story"&&dr.media.length) stEdOpen(); }
let snTapT=0;
/* 任何重畫（別人的新資料、定時檢查…）都把 SNS 的捲動位置放回去：iPhone 上換掉內容的當下設 scrollTop 常常沒用，下一格畫面再補一次 */
/* 手指最後一次碰螢幕的時間：之後才補的「放回原位置」就不做，不然會跟手指搶、畫面亂跳 */
let SN_FINGER=0; ["touchstart","touchmove","wheel"].forEach(ev=>document.addEventListener(ev,()=>{ SN_FINGER=Date.now(); },{passive:true,capture:true}));
{ let lastH=""; const R0=render; render=function(){ const h=location.hash, same=lastH===h, sn=document.querySelector(".sn"), sy=sn&&same?sn.scrollTop:0; const r=R0.apply(this,arguments); lastH=location.hash;   /* same：同一頁重畫才保留位置；換頁時舊頁的位置不能帶到新頁（以前會把新頁直接捲到最底） */
    /* 11/12：換頁後新的那頁一畫好就馬上放到對的位置（往前＝最上面、返回＝原本的位置），不會先閃一下錯的位置再跳 */
    try{ if(window.SN_PEND&&SN_PEND.h===location.hash&&Date.now()-SN_PEND.t<1500){ SN_PEND.apply(); } }catch(e){}
    try{ const sp=ui.snPop; if(sp&&Date.now()-sp.ts<600&&location.hash===h){ const el=document.querySelector(`#snp-${CSS.escape(sp.id)} .sn-heart`); if(el&&!el.classList.contains("pop")){ el.classList.add("pop"); } } }catch(e){}
    if(sy>0&&location.hash===h){ const t0=Date.now(), fix=()=>{ if(SN_FINGER>t0) return; const s2=document.querySelector(".sn"); if(s2&&Math.abs(s2.scrollTop-sy)>2) s2.scrollTop=sy; }; fix(); requestAnimationFrame(fix); setTimeout(fix,80); setTimeout(fix,250); } return r; }; }
/* SNS 換頁：新頁從最上面開始；按返回回到原本滑到的位置（跟 IG 一樣） */
{ const SNPOS={}; let navAt=0; const sc=()=>document.querySelector(".sn")||document.scrollingElement, isSn=h=>/\/sns(\?|$)/.test(h||"");
  document.addEventListener("scroll",e=>{ if(Date.now()-navAt<400||!isSn(location.hash)) return; const t=e.target; if(t===document||(t.classList&&t.classList.contains("sn"))) SNPOS[location.hash]=(t===document?document.scrollingElement:t).scrollTop; },{passive:true,capture:true});
  /* 貼文頁第一次進來：停在點的那一則（上面還有他比較新的貼文，往上滑就看得到，跟 IG 一樣） */
  const postY=()=>{ const m=/[?&]p=post&id=([^&]+)/.exec(location.hash), el=sc(); if(!m||!el) return 0; const a=document.getElementById("snp-"+decodeURIComponent(m[1])), hd=document.querySelector(".sn-pvh"); if(!a) return 0; return Math.max(0,Math.round(el.scrollTop+a.getBoundingClientRect().top-(hd?hd.getBoundingClientRect().bottom:0))); };
  addEventListener("hashchange",()=>{ if(!isSn(location.hash)) return; navAt=Date.now(); const fwd=performance.now()-(ui.navFwd||0)<300; if(fwd) delete SNPOS[location.hash]; const t0=navAt, saved=fwd?null:SNPOS[location.hash], go=()=>{ if(SN_FINGER>t0) return; const el=sc(), y=saved!=null?saved:postY(); if(el&&Math.abs(el.scrollTop-y)>2) el.scrollTop=y; }; window.SN_PEND={h:location.hash,t:Date.now(),apply:go}; go(); requestAnimationFrame(go); setTimeout(go,60); setTimeout(go,200); setTimeout(go,380); }); }
function snHeartPop(id){ ui.snPop={id,ts:Date.now()}; const el=document.querySelector(`#snp-${CSS.escape(id)} .sn-heart`)||[...document.querySelectorAll(".sn-reel1")].find(r=>r.querySelector(`[data-id="${id}"]`))?.querySelector(".sn-heart"); if(!el) return; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
/* 按讚後只改畫面上需要改的地方（愛心、數字、誰說讚那行），不重畫整頁（重畫會閃、會跳） */
function snLikeUI(id){ const d=snDB(), me=snMeId(), p=(d.posts||[]).find(x=>x.id===id); if(!p) return false; const on=(d.likes[id]||[]).includes(me), n=snN(snLikes(d,p));
  document.querySelectorAll(`[data-a="snLike"][data-id="${CSS.escape(id)}"]`).forEach(b=>{ b.classList.toggle("liked",on); const c=b.querySelector("b,small"); if(c) c.textContent=n; });
  const post=document.getElementById("snp-"+id); if(post){ const m=post.querySelector(".sn-meta"), old=m&&m.querySelector(".sn-lb"), h=snLikedBy(d,p); if(m){ if(old) old.outerHTML=h; else if(h) m.insertAdjacentHTML("afterbegin",h); } } return true; }
function snLikeBump(id){ document.querySelectorAll(`[data-a="snLike"][data-id="${CSS.escape(id)}"] .si`).forEach(el=>{ el.classList.remove("bump"); void el.getBoundingClientRect(); el.classList.add("bump"); }); }
/* 連點兩下：貼文的照片、文字、空白處都可以（按鈕、連結除外），跟 IG 一樣 */
function snDblLike(id){ const d=snDB(), had=(d.likes[id]||[]).includes(snMeId()); snToggleLike(id,true); if(!snLikeUI(id)){ const y=window.scrollY; render(); window.scrollTo(0,y); } snHeartPop(id); hap(12); if(!had){ document.querySelectorAll(`[data-a="snLike"][data-id="${CSS.escape(id)}"]`).forEach(b=>{ if(AN.ok()) AN.heart(b); else snLikeBump(id); }); } }
document.addEventListener("click",e=>{ const post=e.target.closest&&e.target.closest(".sn-post"); if(!post) return; const a=e.target.closest("[data-a],a,button,input,textarea,video"); if(a&&post.contains(a)) return;
  const id=post.id.replace(/^snp-/,""), now=Date.now(); if(now-snTapT<320&&ui.snTapId===id){ snTapT=0; snDblLike(id); } else { snTapT=now; ui.snTapId=id; } });
function snToggleLike(id,force){ const d=snDB(), me=snMeId(), L=d.likes[id]=d.likes[id]||[], i=L.indexOf(me); if(i>=0&&!force) L.splice(i,1); else if(i<0) L.push(me); snSave(d); }

/* ===== 一次性整理（管理員的手機做一次，大家共用）：
   藝人帳號：名稱、簡介、追蹤、精選全部恢復預設（藝人自己發的貼文留著）
   一般帳號：用戶名稱是登入帳號的換掉、追蹤清單拿掉不存在的帳號；發過的東西都留著
   有藝人身分的帳號 → 以前的一般帳號變成私帳（私人帳號） */
function snFix1(){ try{ if(!isAdminAcct()||S.get("daisuki_sn_fix1",false)) return; if(HB_ON&&HB.ver[snKey("posts")]==null&&HB.ver[snKey("fol")]==null) return;
  const d=snDB(), ok=id=>!!(id&&!id.startsWith("f:")&&snUser(id));
  Object.keys(d.prof).forEach(id=>{ if(id.startsWith("m:")) delete d.prof[id]; else if(id.startsWith("u:")){ const e=id.slice(2), pr=d.prof[id]; if(pr&&pr.u&&(pr.u===e||pr.u===e.split("@")[0]||pr.u===e.replace(/[^a-z0-9._]/g,""))) delete pr.u; } });
  Object.keys(d.fol).forEach(id=>{ if(!ok(id)){ delete d.fol[id]; return; } if(id.startsWith("m:")){ const m=MEMBERS[id.slice(2)]; d.fol[id]=m?Object.keys(MEMBERS).filter(x=>!MEMBERS[x].official&&MEMBERS[x].group===m.group&&"m:"+x!==id).map(x=>"m:"+x):[]; } else d.fol[id]=[...new Set(d.fol[id].filter(ok))]; });
  Object.keys(d.hl||{}).forEach(id=>{ if(id.startsWith("m:")||!ok(id)) delete d.hl[id]; });
  snPDel(d,p=>!ok(p.uid)); d.posts=d.posts.map(p=>{ if(p.del) return p; const q={...p}; delete q.base; return q; }); d.stories=d.stories.map(s=>ok(s.uid)||s.del?s:snStDel(s));
  const pid=new Set(d.posts.map(p=>p.id)); Object.keys(d.rp||{}).forEach(k=>{ d.rp[k]=(d.rp[k]||[]).filter(x=>pid.has(x.id)); });
  Object.keys(ACCOUNTS).forEach(e=>{ const a=ACCOUNTS[e]; if(a&&a.member&&MEMBERS[a.member]){ const id="u:"+String(e).toLowerCase(); (d.prof[id]=d.prof[id]||{}).priv=true; } });
  snSave(d); S.set("daisuki_sn_fix1",Date.now()); }catch(e){} }
/* 11/12：以前那次整理把「管理員的粉絲帳號」也一起設成私人帳號 → 今天限時動態照私人帳號規則藏起來後，別人就看不到管理員發的限動（看起來像被刪掉）。
   管理員的粉絲帳號改回公開（只做一次；之後管理員自己要設私人還是可以） */
function snFix2(){ try{ if(!isAdminAcct()||S.get("daisuki_sn_fix2",false)) return; if(HB_ON&&HB.ver[snKey("prof")]==null&&HB.ver[snKey("posts")]==null) return;
  const d=snDB(); let ch=false; Object.keys(ACCOUNTS).forEach(e=>{ const a=ACCOUNTS[e]; if(!a||a.role!=="admin") return; const id="u:"+String(e).toLowerCase(), pr=d.prof[id]; if(pr&&pr.priv){ pr.priv=false; ch=true; } });
  if(ch) snSave(d); S.set("daisuki_sn_fix2",Date.now()); }catch(e){} }
setTimeout(function snFixGo(){ if(typeof session==="function"&&session()&&(!HB_ON||HB.tok&&Object.keys(HB.ver||{}).length)) snFix1(), snFix2(); else setTimeout(snFixGo,5000); },7000);
/* ===== #標籤頁、粉絲／追蹤中名單、最近搜尋 ===== */
function snTagPage(d,tag){ const t=String(tag||"").toLowerCase(), P=d.posts.filter(p=>snTagsOf(p).includes(t)&&snCanSee(d,p.uid)&&!(snPriv(d,p.uid)&&p.uid!==snMeId()&&!snFol(d,snMeId()).includes(p.uid))).sort((a,b)=>snLikes(d,b)-snLikes(d,a));
  return `<header class="sn-top"><button class="sn-ib" data-a="back" aria-label="返回">${si("back")}</button><b>#${esc(t)}</b><span class="sn-sp"></span></header>
    <section class="sn-taghd"><span class="sn-hash big">#</span><div><b>#${esc(t)}</b><small>${fmt(P.length)} 則貼文</small></div></section>
    <main class="sn-grid ex">${P.map(p=>`<button data-a="snsGo" data-v="post" data-id="${p.id}">${snThumb(p,snUser(p.uid))}</button>`).join("")||`<div class="sn-empty"><span>${si("search")}</span><b>還沒有貼文</b></div>`}</main>`; }
function snFlPage(d,id){ const me=snMeId(), u=snUser(id)||snUser(me), k=ui.snFlK||"fol", see=snCanSee(d,u.id);
  let L=k==="fol"?Object.keys(d.fol).filter(x=>(d.fol[x]||[]).includes(u.id)):snFol(d,u.id).slice(); const q=nz((ui.snFlQ||"").trim()), own=u.id===me&&k==="ing";
  /* 自己的追蹤中：較少互動（很少按讚）、最常出現在動態（最近發文最多）、排序 */
  const lk=x=>d.posts.filter(p=>p.uid===x&&(d.likes[p.id]||[]).includes(me)).length, act=x=>d.posts.filter(p=>p.uid===x&&p.ts>Date.now()-30*864e5).length, at=x=>((d.folAt||{})[me]||{})[x]||0;
  const least=own?L.filter(x=>lk(x)<=1).slice(0,50):[], most=own?L.filter(x=>act(x)>0).sort((a,b)=>act(b)-act(a)).slice(0,50):[];
  if(own&&ui.snFlCat==="least") L=least; if(own&&ui.snFlCat==="most") L=most;
  const so=ui.snFlSort||"def"; if(own) L=so==="new"?L.slice().sort((a,b)=>at(b)-at(a)):so==="old"?L.slice().sort((a,b)=>at(a)-at(b)):L.slice().reverse();
  const U=L.map(snUser).filter(x=>x&&(!q||nz(x.u).includes(q)||nz(x.name).includes(q)));
  const fo=snFol(d,me);
  return `<header class="sn-top"><button class="sn-ib" data-a="back" aria-label="返回">${si("back")}</button><b>${esc(u.u)}</b><span class="sn-sp"></span></header>
    <nav class="sn-flt"><button class="${k==="fol"?"on":""}" data-a="snFlK" data-v="fol">${fmt(snFollowers(d,u.id))} 粉絲</button><button class="${k==="ing"?"on":""}" data-a="snFlK" data-v="ing">${fmt(snFol(d,u.id).length)} 追蹤中</button></nav>
    ${see&&own?`<div class="sn-flc">${!ui.snFlCat||ui.snFlCat==="least"?`<button class="${ui.snFlCat==="least"?"on":""}" data-a="snFlCat" data-v="least"><span><b>較少互動</b><small>${fmt(least.length)} 個帳號</small></span>${ui.snFlCat==="least"?si("x","sm"):si("chevR","sm")}</button>`:""}${!ui.snFlCat||ui.snFlCat==="most"?`<button class="${ui.snFlCat==="most"?"on":""}" data-a="snFlCat" data-v="most"><span><b>最常出現在動態</b><small>${fmt(most.length)} 個帳號</small></span>${ui.snFlCat==="most"?si("x","sm"):si("chevR","sm")}</button>`:""}</div>
      <div class="sn-fls"><b>排序方式：${{def:"預設",new:"最新追蹤",old:"最早追蹤"}[so]}</b><button data-a="snFlSort" aria-label="排序">⇅</button></div>`:""}
    ${see?`<main class="sn-ul">${U.map(x=>`<div class="sn-flr"><button class="sn-ur" data-a="snsGo" data-v="profile" data-id="${x.id}">${snAv(x,44)}<span><b>${esc(x.u)}${x.ver?`${SN_VER}`:""}</b><small>${esc(x.name)}</small></span></button>${x.id===me?"":`<button class="sn-fb ${fo.includes(x.id)?"":"pri"}" data-a="snFollow" data-v="${x.id}">${fo.includes(x.id)?"追蹤中":snReqd(d,x.id)?"已要求":"追蹤"}</button>`}${u.id===me&&k==="fol"?`<button class="sn-fb" data-a="snFlRm" data-v="${x.id}">移除</button>`:""}</div>`).join("")||`<p class="sn-none">${k==="fol"?"還沒有粉絲":"還沒有追蹤任何人"}</p>`}</main>`
      :`<div class="sn-empty sn-lock"><span>${si("lock")}</span><b>此個人檔案不公開</b></div>`}`; }
const snRecKey=()=>"hc_snrec_"+snMeId();
function snRecent(){ try{ return JSON.parse(localStorage.getItem(snRecKey())||"[]").slice(0,12); }catch(e){ return []; } }
function snRecAdd(id){ try{ const L=snRecent().filter(x=>x!==id); L.unshift(id); localStorage.setItem(snRecKey(),JSON.stringify(L.slice(0,12))); }catch(e){} }
/* 推薦帳號那一排（首頁、自己的個人檔案都用） */
/* 最後上線：這個人最近一次發文、限動、留言、傳訊息的時間（IG 的「3 小時前在線上」） */
function snLastAct(d,uid,th){ let t=0; (d.posts||[]).forEach(p=>{ if(p.uid===uid&&!p.del&&p.ts>t) t=p.ts; }); (d.stories||[]).forEach(x=>{ if(x.uid===uid&&!x.del&&x.ts>t) t=x.ts; });
  Object.values(d.cms||{}).forEach(L=>(L||[]).forEach(c=>{ if(c&&c.uid===uid&&c.ts>t) t=c.ts; })); (th||[]).forEach(m=>{ if(m.from===uid&&m.ts>t) t=m.ts; }); return t; }
function snActTxt(ts){ if(!ts) return ""; const m=(Date.now()-ts)/60000; if(m<5) return "目前在線上"; if(m<60) return `${Math.floor(m)} 分鐘前在線上`; if(m<1440) return `${Math.floor(m/60)} 小時前在線上`; if(m<2880) return "昨天在線上"; return ""; }
const snAgoS=ts=>{ const m=Math.floor((Date.now()-ts)/60000); return m<60?`${Math.max(1,m)} 分鐘`:m<1440?`${Math.floor(m/60)} 小時`:m<10080?`${Math.floor(m/1440)} 天`:`${Math.floor(m/10080)} 週`; };
const snMutual=(d,id)=>{ const me=snMeId(); return snFol(d,me).filter(x=>(d.fol[x]||[]).includes(id)).length; };
/* 推薦卡：跟 IG 一樣大頭貼、共同朋友的小頭像 */
/* =========================================================
   官方帳號（公司、團體）＋還沒開通個人 SNS 的藝人投稿
   ・公司官方帳號：帳號名稱照真實公司；全部自動發（出道／回歸宣傳、MV、一位祝賀、巡演、公告）
   ・團體官方帳號：「團名_official」；自動發同一套（只發自己團的），管理員可以用它手動發文
   ・SOLOIST 沒有團體帳號，宣傳在公司帳號
   ・還沒開通的藝人：投稿到團體官方帳號（SOLOIST 投公司帳號），後台自動審：沒有禁用字詞就隨機 1 分鐘～2 小時後發出
   ・貼文只存「是哪一則」，照片和文字畫面上再去拿（不重複存圖、宣傳改了這裡也跟著變）
   ========================================================= */
const OF_CO={YG:"yg_ent_official",SM:"smtown",JYP:"jypentertainment",HYBE:"hybe_labels",PAPERMOON:"papermoon_official","BLUE HOUR":"bluehour_official","DOLPUNG Lab.":"dolpung_labels"};
const ofCoKey=co=>String(co).toLowerCase().replace(/[^a-z]/g,"");
const ofCoOf=k=>Object.keys(OF_CO).find(co=>ofCoKey(co)===k)||"";
const ofCoId=co=>OF_CO[co]?"o:co_"+ofCoKey(co):"";
const ofGH=g=>(String(g.name||"").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g,"")||"group"+(strHash(String(g.id))%10000))+"_official";
const snOfAccs=()=>[...Object.keys(OF_CO).map(ofCoId),...GROUPS.filter(g=>!g.solo).map(g=>"o:g_"+g.id)];
/* 還沒開通的藝人投稿到哪：有團＝團體官方帳號；SOLOIST＝公司官方帳號 */
function snSubTo(mid){ const m=MEMBERS[mid], g=m&&groupOf(m.group); if(g&&!g.solo) return "o:g_"+g.id; return ofCoId(coOfGid(m&&m.group))||""; }
let OFM={t:0,m:null};
function snOfMap(){ if(OFM.m&&Date.now()-OFM.t<4000) return OFM.m; const m={}; try{ promoSrcs(true).flatMap(promoPlan).forEach(x=>m["cp:"+x.id]=x); }catch(e){} try{ coAnnPosts().forEach(x=>m["ca:"+x.id]=x); }catch(e){} try{ coNotePosts().forEach(x=>m["cn:"+x.id]=x); }catch(e){} OFM={t:Date.now(),m}; return m; }
const ofTag=v=>"#"+String(v||"").replace(/[\s#]+/g,"");
const ofCard=(em,b,sm,g,bg)=>`<div class="snof-card" style="--c:${(GRADS[(g||0)%GRADS.length]||[])[0]||"#8b5cf6"}">${bg?`<span class="snof-bg" style="background-image:url('${esc(bg)}')"></span>`:""}<em>${esc(em)}</em><b>${esc(b)}</b>${sm?`<small>${esc(sm)}</small>`:""}</div>`;
const ofCap=c=>c?String(c.t||"").replace(/[\u0001-\u0004]/g,"")+(c.b?"\n\n"+String(c.b).replace(/[\u0001-\u0004]/g,""):""):"";
/* 一則官方貼文的照片和文字 */
function snOfFill(p){ if(p._ofT===OFM.t&&OFM.m) return; const o=p.of, M=snOfMap(), set=(k,v)=>Object.defineProperty(p,k,{value:v,writable:true,configurable:true,enumerable:false}); let media=[], cap="", gone=false;
  try{
    if(o.t==="cp"){ const x=M["cp:"+o.id]; if(!x) gone=true; else { const s0=x.src, pr=s0.pr||{}; cap=ofCap(coCap(s0.co,x.k,s0,x));
      if(x.k==="sched") media=pr.sched?[{type:"image",url:pr.sched}]:[{type:"html",h:promoSchedCard(s0),t:"SCHEDULE"}];
      else if(x.k==="trk") media=pr.trkImg?[{type:"image",url:pr.trkImg}]:[{type:"html",h:promoTrkCard(s0),t:"TRACK LIST"}];
      else if(x.vid&&x.vid.mid&&x.k!=="rel") media=[{type:"video",mid:x.vid.mid,poster:x.vid.thumb||""}];   /* 完整 MV 不放 SNS：只放 MV Teaser、Highlight Medley 這些預告 */
      else if((x.imgs||[]).length) media=x.imgs.map(u=>({type:"image",url:u}));
      else media=[{type:"html",h:ofCard(x.k==="sc"?"SHOWCASE":PR_KIND[x.k]||"NOTICE",s0.name,s0.title?`《${s0.title}》`:"",s0.g,s0.teaser),t:PR_KIND[x.k]||""}]; } }
    else if(o.t==="ca"){ const x=M["ca:"+o.id]; if(!x) gone=true; else { const a=x.ann, src=annSrc(a), c=src?coCap(x.co,src.k==="db"?"annDb":"annCb",src,{ts:a.ts}):{t:a.text||""}; cap=ofCap(c); media=a.img?[{type:"image",url:a.img}]:[{type:"html",h:ofCard("NOTICE",coInfo(x.co).n,"",6),t:"NOTICE"}]; } }
    else if(o.t==="cn"){ const x=M["cn:"+o.id]; if(!x) gone=true; else { const n=x.note; cap=ofCap({t:n.title,b:n.body}); media=[{type:"html",h:ofCard("NOTICE",n.title||"",coInfo(x.co).n,6),t:"NOTICE"}]; } }
    else if(o.t==="win"){ const so=songOf(o.sid), g=so&&groupOf(so.gid), sh=SHOWS.find(z=>z.id===o.sh); if(!so||!g||!sh) gone=true; else { cap=`🏆 ${g.name}《${so.title}》${sh.name} 1位\n\n謝謝大家的愛與支持，這個一位是大家一起拿下的 💜\n\n${ofTag(g.name)} ${ofTag(so.title)} ${ofTag(sh.name)}`; media=[{type:"html",h:ofCard(`${sh.name} 1位`,g.name,`《${so.title}》`,g.g,gPhoto(g.id)),t:"1位"}]; } }
    else if(o.t==="tour"){ const t=getTours().find(z=>z.id===o.id), g=t&&groupOf(t.gid); if(!t||!g) gone=true; else { const Ls=tourStops(t).filter(st=>stopState(st)!=="off"); cap=`${g.name} WORLD TOUR〈${t.title}〉\n\n${Ls.map(x=>x.city).join(" · ")}\n\n購票請到 FEST →「世巡」\n${ofTag(g.name)} ${ofTag(t.title)}`; media=[{type:"html",h:ofCard("WORLD TOUR",t.title,Ls.map(x=>x.city).join(" · "),g.g,gPhoto(g.id)),t:"WORLD TOUR"}]; } }
  }catch(e){ gone=true; }
  set("media",media); set("cap",cap); set("_gone",gone); set("_ofT",OFM.t); }
/* 該有哪些官方貼文（每一則都有固定的編號：每支手機算出來都一樣，存到雲端會自動合併、不會重複） */
function snOfWant(d){ const W=[], now=Date.now(), D=864e5, add=(id,uid,ts,of)=>{ if(uid&&ts&&ts<=now) W.push({id,uid,ts,of}); };
  Object.entries(snOfMap()).forEach(([key,x])=>{ const t=key.slice(0,2), co=coOfPost(x); add(`of_c_${x.id}`,ofCoId(co),x.ts,{t,id:x.id}); const s0=x.src, g=s0&&groupOf(s0.gid); if(t==="cp"&&g&&!g.solo&&!s0.solo) add(`of_g_${x.id}`,"o:g_"+g.id,x.ts,{t,id:x.id}); });
  try{ const ms=getMShow(); Object.entries(ms.wins||{}).forEach(([wk,o])=>Object.entries(o||{}).forEach(([sh,sid])=>{ const S0=SHOWS.find(z=>z.id===sh), so=songOf(sid), g=so&&groupOf(so.gid); if(!S0||!g) return; const ts=wkDate(wk).getTime()+((S0.day+6)%7)*D+20*36e5, of={t:"win",wk,sh,sid};
    add(`of_cw_${wk}_${sh}`,ofCoId(coOfGid(g.id)),ts,of); if(!g.solo) add(`of_gw_${wk}_${sh}`,"o:g_"+g.id,ts,of); })); }catch(e){}
  try{ getTours().filter(t=>t.status==="approved").forEach(t=>{ const g=groupOf(t.gid); if(!g) return; const ts=t.okTs||t.ts, of={t:"tour",id:t.id}; add(`of_ct_${t.id}`,ofCoId(coOfGid(g.id)),ts,of); if(!g.solo) add(`of_gt_${t.id}`,"o:g_"+g.id,ts,of); }); }catch(e){}
  (d.sub||[]).forEach(x=>{ if(x.st==="ok"&&x.at<=now&&x.to) W.push({id:"of_s_"+x.id,uid:x.to,ts:x.at,media:x.media,cap:x.cap,by:"m:"+x.mid}); });
  return W; }
let OFS=0;
function snOfSync(){ if(Date.now()-OFS<20000) return; OFS=Date.now(); try{ if(HB_ON&&HB.ver[snKey("posts")]==null) { OFS=0; return; } const raw=S.get(snKey("posts"),[])||[], have=new Set(raw.map(x=>x&&x.id)), d=snDB(), W=snOfWant(d), add=W.filter(x=>!have.has(x.id));
  /* 時間改過的（例如補出道資料改回真正的出道日）：跟著改，一次存好 */
  let fix=0; const wt=new Map(W.map(x=>[x.id,x.ts])); d.posts.forEach(p=>{ if(p&&p.of&&wt.has(p.id)&&wt.get(p.id)!==p.ts){ p.ts=wt.get(p.id); fix++; } });
  if(!add.length&&!fix) return; d.posts.push(...add); snSave(d); OFM.t=0; }catch(e){} }
setInterval(()=>{ if(/\/sns(\?|$)/.test(location.hash)) snOfSync(); },60e3);
/* 還沒開通：「準備中」頁 */
function snPrepPage(mid,days){ const d=snDB(), to=snSubTo(mid), tu=snUser(to), L=(d.sub||[]).filter(x=>x.mid===mid).sort((a,b)=>b.ts-a.ts), pub=new Set((d.posts||[]).map(x=>x.id)), me=snUser(snMeId());
  return `<header class="top core-top"><div class="top-row"><button class="icon-btn" data-a="back" aria-label="返回">${I.back}</button><div class="top-title">SNS</div><span class="sh-sp"></span></div></header><main class="page sn-prep">
    <section class="card sn-prep-h">${snAv(me,72)}<b>${esc(me.u)}</b>${me.name?`<small>${esc(me.name)}</small>`:""}<p>公司跟你說再等 ${days} 天就可以開通了</p></section>
    <section class="card"><button class="list-btn" data-a="snsGo" data-v="edit">${I.edit||""}先設定個人檔案<span class="r">開通前只有你看得到</span></button>${tu?`<button class="list-btn" data-a="snSubNew">${I.star||""}投稿到 ${esc(tu.u)}<span class="r">${esc(tu.name)}</span></button>`:""}</section>
    ${L.length?`<div class="section-h">我的投稿</div><section class="card sn-subl">${L.map(x=>{ const st=x.st==="no"?["no","退回："+(x.why||"")]:pub.has("of_s_"+x.id)?["ok","已發布"]:["wait","審核中"]; return `<div class="sn-subr">${x.media&&x.media[0]?`<img class="sn-subth" data-mid="${esc(x.media[0].poster||x.media[0].mid)}" alt="">`:`<span class="sn-subth"></span>`}<span><b>${esc(String(x.cap||"").replace(/^\[[^\]]*\]\s*/,"")||"（沒有文字）")}</b><small>${ago(x.ts)}</small></span><em class="${st[0]}">${esc(st[1])}</em></div>`; }).join("")}</section>`:""}
  </main>`; }
/* 「和其他 N 人都說讚」→ 按讚的人（IG：搜尋、頭貼、帳號、名稱、追蹤／追蹤中；點人進個人檔案，不公開的帳號就看到鎖頭） */
function snLkBtn(d,uid){ const me=snMeId(); if(uid===me||String(uid).startsWith("o:")) return ""; const fo=snFol(d,me).includes(uid), rq=!fo&&snReqd(d,uid);
  return `<button class="snlk-b ${fo||rq?"on":""}" data-a="snLkFol" data-v="${uid}">${fo?"追蹤中":rq?"已要求":"追蹤"}</button>`; }
function snLikers(pid){ const d=snDB(), me=snMeId(), p=(d.posts||[]).find(x=>x.id===pid); if(!p) return; const fol=snFol(d,me), L=(d.likes[pid]||[]).filter(x=>snUser(x)), O=[...L.filter(x=>x===me),...L.filter(x=>x!==me&&fol.includes(x)),...L.filter(x=>x!==me&&!fol.includes(x))];
  setLayer(`<div class="snsh-w" data-a="snLkX"><div class="snsh big" data-a="snMiNo" role="dialog" aria-label="按讚的人"><i class="snsh-gr"></i><b class="snsh-t">${p.uid===me?"按讚數":"按讚的人"}</b>
    <label class="snlk-q">${si("search")}<input id="snLkQ" placeholder="搜尋" autocomplete="off"></label>
    <div class="snlk-l">${O.map(id=>{ const u=snUser(id); return `<div class="snlk-r" data-q="${esc((u.u+" "+(u.name||"")).toLowerCase())}"><button class="snlk-u" data-a="snsGo" data-v="profile" data-id="${id}">${snAv(u,48,snHasStory(d,id),snStorySeen(d,id))}<span><b>${esc(u.u)}${u.ver?SN_VER:""}</b>${u.name&&u.name!==u.u?`<small>${esc(u.name)}</small>`:""}</span></button>${snLkBtn(d,id)}</div>`; }).join("")||`<p class="snlk-none">還沒有人說讚</p>`}</div></div></div>`,"ios");
  requestAnimationFrame(()=>{ const w=layer.querySelector(".snsh-w"); if(w) w.classList.add("open"); }); }
document.addEventListener("change",e=>{ if(e.target.id==="snAs"&&ui.snDraft) ui.snDraft.as=e.target.value; });
document.addEventListener("input",e=>{ if(e.target.id!=="snSrQ") return; const q=e.target.value.trim().toLowerCase(); document.querySelectorAll(".snsr-u").forEach(r=>{ r.hidden=!!q&&!r.dataset.q.includes(q); }); });
document.addEventListener("input",e=>{ if(e.target.id!=="snLkQ") return; const q=e.target.value.trim().toLowerCase(); document.querySelectorAll(".snlk-r").forEach(r=>{ r.hidden=!!q&&!r.dataset.q.includes(q); }); });
function snSugCard(d,id){ const u=snUser(id); if(!u) return ""; const me=snMeId(), M=snFol(d,me).filter(x=>(d.fol[x]||[]).includes(id)), mu=M.slice(0,2).map(snUser).filter(Boolean);
  return `<div class="sn-sugc"><button class="sn-hu" data-a="snsGo" data-v="profile" data-id="${id}">${snAv(u,96)}<b>${esc(u.u)}${u.ver?`${SN_VER}`:""}</b><small>${M.length?`<span class="sn-lbav">${mu.map(x=>snAv(x,16)).join("")}</span>${M.length} 位共同朋友`:esc(u.name)}</small></button><button class="pri" data-a="snFollow" data-v="${id}">追蹤</button><button class="sn-sugx" data-a="snSugX" data-v="${id}" aria-label="關掉">${si("x","sm")}</button></div>`; }
function snSugHtml(d,title){ const sg=snSuggest(d); if(!sg.length) return ""; return `<section class="sn-sug"><div class="sn-sugh"><b>${esc(title||"推薦追蹤")}</b><button data-a="snsGo" data-v="sug">查看全部</button></div><div class="sn-sugl">${sg.map(id=>snSugCard(d,id)).join("")}</div></section>`; }
/* 探索用戶（全部） */
function snSugPage(d){ const me=snMeId(), fo=snFol(d,me), U=snAllUsers().filter(u=>u.id!==me&&!u.off&&!fo.includes(u.id)).sort((a,b)=>snMutual(d,b.id)-snMutual(d,a.id)||(b.ver?1:0)-(a.ver?1:0));
  return `<header class="sn-top"><button class="sn-ib" data-a="back" aria-label="返回">${si("back")}</button><b>探索用戶</b><span class="sn-sp"></span></header>
    <main class="sn-ul">${U.map(x=>`<div class="sn-flr"><button class="sn-ur" data-a="snsGo" data-v="profile" data-id="${x.id}">${snAv(x,48)}<span><b>${esc(x.u)}${x.ver?`${SN_VER}`:""}</b><small>${snMutual(d,x.id)?`${snMutual(d,x.id)} 位共同追蹤`:esc(x.name)}</small></span></button><button class="sn-fb ${snReqd(d,x.id)?"":"pri"}" data-a="snFollow" data-v="${x.id}">${snReqd(d,x.id)?"已要求":"追蹤"}</button></div>`).join("")||`<p class="sn-none">都追蹤了</p>`}</main>`; }
/* 摯友名單 */
function snCfPage(d){ const me=snMeId(), L=(d.cf||{})[me]||[], q=nz((ui.snCfQ||"").trim()), fol=Object.keys(d.fol).filter(x=>x!==me&&(d.fol[x]||[]).includes(me)), ids=[...new Set([...L,...fol,...snFol(d,me)])].filter(x=>x!==me);
  const U=ids.map(snUser).filter(u=>u&&!u.off&&(!q||nz(u.u).includes(q)||nz(u.name).includes(q)));
  return `<header class="sn-top"><button class="sn-ib" data-a="back" aria-label="返回">${si("back")}</button><b>摯友</b><span class="sn-sp"></span></header>
    <div class="sn-cfh"><span class="sn-cfs">${si("star")}</span><small>${fmt(L.length)} 人</small></div>
    <main class="sn-tpl sn-cfl">${U.map(u=>`<button class="${L.includes(u.id)?"on":""}" data-a="snCfT" data-v="${u.id}">${snAv(u,44)}<span><b>${esc(u.u)}</b><small>${esc(u.name)}</small></span><i></i></button>`).join("")||`<p class="sn-none">還沒有可以加的人</p>`}</main>`; }
/* 收藏集（跟 IG 一樣：收藏後跳出來，可以放進某個收藏集） */
function snColSheet(pid){ const d=snDB(), me=snMeId(), p=d.posts.find(x=>x.id===pid), C=((d.col||{})[me]||[]);
  setLayer(`<div class="sn-shw open" data-a="tCloseLayer"><div class="sn-sh sn-colsh" role="dialog" aria-label="收藏"><i class="sn-grab"></i>
    <div class="sn-colh">${p?`<span class="sn-colth">${snThumb(p,snUser(p.uid))}</span>`:""}<span><b>已儲存</b><small>只有你看得到</small></span>${si("save")}</div>
    <div class="sn-colt"><b>收藏集</b><button data-a="snColNew" data-id="${pid}">新增收藏集</button></div>
    <div class="sn-coll">${C.map(c=>{ const fp=d.posts.find(x=>x.id===c.items[0]); return `<button data-a="snColT" data-v="${c.id}" data-id="${pid}"><span class="sn-colth">${fp?snThumb(fp,snUser(fp.uid)):""}</span><span><b>${esc(c.name)}</b><small>${c.items.length} 則</small></span><i class="${c.items.includes(pid)?"on":""}">${c.items.includes(pid)?si("check","sm"):si("plusP","sm")}</i></button>`; }).join("")||`<p class="sn-none">還沒有收藏集</p>`}</div></div></div>`,"sncol"); hydrateMedia(layer); }

/* =========================================================
   SNS 的按鈕（從 10-點擊互動 拆出來：SNS 自己一個檔案，改 SNS 不會動到別的地方）
   ========================================================= */
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a; if(!/^sn/.test(a)||a==="snOpen") return;
  switch(a){
    case "snsGo": ui.snTab="grid"; if(t.dataset.v!=="new") ui.snDraft=ui.snDraft&&ui.snDraft.media.length?ui.snDraft:null; clearTimeout(ui.snStT); if(ui.snStory){ ui.snStory=null; } if(layer.innerHTML) layer.innerHTML=""; { const h="#/"+session().role+"/sns?p="+t.dataset.v+(t.dataset.id?"&id="+encodeURIComponent(t.dataset.id):""), cur=route(), tabLike=t.closest(".sn-tabs,.sn-nav,nav")&&!t.dataset.id;
      /* 下面的分頁（跟 Instagram 一樣）：從首頁切過去會留一筆，返回就回首頁；分頁之間互切不留；按首頁直接退回首頁 */
      if(tabLike&&cur.sub==="sns"){ /* 跟 App 的導覽列一樣：分頁之間直接換、不疊歷史；按目前這頁就捲回最上面 */
        const curTab=(cur.p||"home")===(t.dataset.v)&&!cur.id; if(curTab){ window.scrollTo({top:0,behavior:"smooth"}); document.querySelectorAll(".sn-reels,.sn-feed").forEach(x=>x.scrollTo&&x.scrollTo({top:0,behavior:"smooth"})); break; }
        navReplace(t.dataset.v==="home"?"#/"+session().role+"/sns":h); window.scrollTo(0,0); }
      else navTo(h); }
    window.scrollTo(0,0); break;
    case "snsPTab": ui.snTab=t.dataset.v; render(); break;
    case "snTap": { const id=t.dataset.id, now=Date.now(); if(now-snTapT<320&&ui.snTapId===id){ snTapT=0; snDblLike(id); } else { snTapT=now; ui.snTapId=id; if(t.querySelector("video.sn-vid")){ const inR=!!t.closest(".sn-reels"); setTimeout(()=>{ if(snTapT!==now) return; if(inR) snSndToggle(); else { ui.snReelOne=id; ui.snMute=false; navTo("#/"+route().role+"/sns?p=reels&id="+encodeURIComponent(id)); } },330); } } break; }
    case "snLike": { const id=t.dataset.id, d=snDB(), had=(d.likes[id]||[]).includes(snMeId()); snToggleLike(id);   /* 只改這顆按鈕，不整頁重畫（整頁重畫會跳回最上面） */
      const p=snLikeUI(id);
      if(!p){ const sc=document.querySelector(".sn-scroll,.sn-page,.sn"), y=sc?sc.scrollTop:window.scrollY; render(); if(sc&&document.querySelector(".sn-scroll,.sn-page,.sn")) document.querySelector(".sn-scroll,.sn-page,.sn").scrollTop=y; else window.scrollTo(0,y); }
      hap(had?6:12); if(!had){ document.querySelectorAll(`[data-a="snLike"][data-id="${CSS.escape(id)}"]`).forEach(b=>{ if(AN.ok()) AN.heart(b); }); if(!AN.ok()) snLikeBump(id); } else document.querySelectorAll(`[data-a="snLike"][data-id="${CSS.escape(id)}"]`).forEach(b=>AN.bounce(b)); break; }   /* 照 IG：按小愛心只有小愛心彈＋輕震，大愛心是點兩下才有 */
    case "snCm": ui.snCmCap=null; snOpenCm(t.dataset.id); break;
    case "snCmSort": { const id=t.dataset.id; if(layer.querySelector(".sn-sh.cm")){ snCmSortSheet(id); break; } snSheet([[["最新","snCmSortSet",`data-v="new" data-id="${id}"`,{on:ui.snCmSort!=="top"}],["熱門","snCmSortSet",`data-v="top" data-id="${id}"`,{on:ui.snCmSort==="top"}]]],{title:"排序方式"}); break; }
    case "snCmSortSet": { ui.snCmSort=t.dataset.v; const sub=layer.querySelector(".sn-shw.sub"); if(sub){ sub.classList.remove("open"); setTimeout(()=>{ sub.remove(); snOpenCm(t.dataset.id); },220); } else snOpenCm(t.dataset.id); break; }
    case "snCmSortX": { const sub=layer.querySelector(".sn-shw.sub"); if(sub&&e.target===sub){ sub.classList.remove("open"); setTimeout(()=>sub.remove(),220); } break; }
    case "snCmDel": { const d=snDB(), L=d.cms[t.dataset.id]||[]; d.cms[t.dataset.id]=L.filter(c=>c.id!==t.dataset.v); snSave(d); snOpenCm(t.dataset.id); toast("已刪除留言"); break; }
    case "snShare": snOpenShare(t.dataset.id); break;
    case "snShareTo": { const me=snMeId(), to=t.dataset.v; dmAppend(me,to,{text:"",post:t.dataset.id,ts:Date.now()}); layer.innerHTML=""; toast("已傳送"); snFakeReply(to); break; }
    case "snSaveP": { const d=snDB(), me=snMeId(), L=d.saved[me]=d.saved[me]||[], pid=t.dataset.id, i=L.indexOf(pid); if(i>=0){ L.splice(i,1); ((d.col||{})[me]||[]).forEach(c=>{ c.items=c.items.filter(x=>x!==pid); }); } else L.unshift(pid); snSave(d); t.classList.toggle("saved",i<0); hap(8); AN.bounce(t); document.querySelectorAll(`[data-a="snSaveP"][data-id="${CSS.escape(pid)}"]:not([data-sheet])`).forEach(b=>b.classList.toggle("saved",i<0)); if(t.dataset.sheet) layer.innerHTML="";
      /* 11/12：取消收藏不再整頁重畫（重畫會讓正在播的 Reels 從頭開始）；只有在「已儲存」清單裡才需要重畫把它拿掉 */
      if(i>=0){ toast("已從收藏移除"); if(document.querySelector(".sn-fmode")){ const y=window.scrollY; render(); window.scrollTo(0,y); } } else snColSheet(pid); break; }
    case "snMore": { const d=snDB(), p=d.posts.find(x=>x.id===t.dataset.id); if(!p) break; const me=snMeId(), fo=snFol(d,me).includes(p.uid), mine=p.uid===me, sv=(d.saved[me]||[]).includes(p.id), go=route().p!=="post"?[["前往這則貼文","snsGo",`data-v="post" data-id="${p.id}"`,{ic:"link"}]]:[];
      snSheet(mine?[[["編輯","snEditCap",`data-id="${p.id}"`,{ic:"pen"}],...go],[["刪除","snDelP",`data-id="${p.id}"`,{ic:"trash",red:1}]]]
        :[[[sv?"取消儲存":"儲存","snSaveP",`data-id="${p.id}" data-sheet="1"`,{ic:"save"}],...go],
          [["有興趣","snInt",`data-id="${p.id}" data-v="1"`,{ic:"eye"}],["沒興趣","snInt",`data-id="${p.id}" data-v="-1"`,{ic:"eyeOff"}]],
          [[fo?"取消追蹤":"追蹤","snFollow",`data-v="${p.uid}"`,{ic:fo?"userX":"userP"}],["為什麼會看到這則貼文","snWhy",`data-id="${p.id}"`,{ic:"info"}]],
          [...(isAdminAcct()?[["刪除這則（管理員）","snDelP",`data-id="${p.id}"`,{ic:"trash",red:1}]]:[]),["檢舉","snRepP",`data-id="${p.id}"`,{ic:"flag",red:1}]]]); break; }
    case "snInt": { const d=snDB(), me=snMeId(), p=d.posts.find(x=>x.id===t.dataset.id); if(!p) break; const v=+t.dataset.v, I=(d.intr=d.intr||{})[me]=d.intr[me]||{u:{},t:{},no:[]}; I.u=I.u||{}; I.t=I.t||{}; I.no=I.no||[];
      I.u[p.uid]=Math.max(-5,Math.min(5,(I.u[p.uid]||0)+v)); snTagsOf(p).forEach(x=>{ I.t[x]=Math.max(-5,Math.min(5,(I.t[x]||0)+v)); }); if(v<0&&!I.no.includes(p.id)) I.no.push(p.id); I.no=I.no.slice(-300);
      snSave(d); layer.innerHTML=""; toast(v>0?"之後會推薦更多像這樣的內容":"之後會少推薦像這樣的內容"); if(v<0) render(); break; }
    case "snWhy": { const d=snDB(), me=snMeId(), p=d.posts.find(x=>x.id===t.dataset.id); if(!p) break; const u=snUser(p.uid)||{}, I=(d.intr||{})[me]||{}, R=[];
      if(snFol(d,me).includes(p.uid)) R.push(`你追蹤了 ${u.u}`); if((I.u||{})[p.uid]>0) R.push(`你對 ${u.u} 的內容有興趣`); snTagsOf(p).filter(x=>((I.t||{})[x]||0)>0).slice(0,2).forEach(x=>R.push(`你對 #${x} 有興趣`)); if(snLikes(d,p)>=5) R.push("很多人喜歡這則"); if(!R.length) R.push("這是最近的新內容");
      layer.innerHTML=""; tieModal("為什麼會看到這則",R.map(x=>`・${esc(x)}`).join("<br>"),`<button class="t-mbtn main" data-a="tCloseLayer">知道了</button>`); break; }
    case "snRepP": { const d=snDB(), p=d.posts.find(x=>x.id===t.dataset.id); if(!p) break; const u=snUser(p.uid)||{}; layer.innerHTML="";
      ask(`檢舉 ${u.u||""} 的這則貼文？管理員會審核。`,()=>{ reportItem("sns",{wid:p.id,text:p.cap||"（沒有文字）",name:u.u||"",who:p.uid}); toast("已送出檢舉"); },{title:"檢舉",ok:"檢舉"}); break; }
    case "snCmEmo": { const i=document.getElementById("snCmIn"); if(i){ i.value+=t.dataset.v; i.focus(); } break; }
    case "snCopyLink": { const h=location.href.split("#")[0]+"#/"+session().role+"/sns?p=post&id="+encodeURIComponent(t.dataset.id); try{ navigator.clipboard.writeText(h).then(()=>toast("已複製連結"),()=>toast("複製失敗")); }catch(e){ toast("複製失敗"); } layer.innerHTML=""; break; }
    case "snColT": { const d=snDB(), me=snMeId(), C=(d.col=d.col||{})[me]=d.col[me]||[], c=C.find(x=>x.id===t.dataset.v); if(!c) break; const pid=t.dataset.id, i=c.items.indexOf(pid); if(i>=0) c.items.splice(i,1); else c.items.unshift(pid); if(i<0){ const S2=d.saved[me]=d.saved[me]||[]; if(!S2.includes(pid)) S2.unshift(pid); } snSave(d); snColSheet(pid); toast(i>=0?`已從「${c.name}」移除`:`已儲存到「${c.name}」`); break; }
    case "snColNew": layer.innerHTML=""; tieModal("新增收藏集",`<input id="snColIn" class="a-nick-in" maxlength="20" placeholder="輸入文字">`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="snColNewOk" data-id="${t.dataset.id}">新增</button>`,"row"); setTimeout(()=>{ const i=document.getElementById("snColIn"); if(i) i.focus(); },200); break;
    case "snColNewOk": { const v=((document.getElementById("snColIn")||{}).value||"").trim(); if(!v){ toast("取個名字吧"); break; } if(!isAdminAcct()&&banBlock(v)) break; const d=snDB(), me=snMeId(), C=(d.col=d.col||{})[me]=d.col[me]||[], pid=t.dataset.id; C.unshift({id:"c"+Date.now().toString(36),name:v,items:pid?[pid]:[]}); if(pid){ const S2=d.saved[me]=d.saved[me]||[]; if(!S2.includes(pid)) S2.unshift(pid); } snSave(d); layer.innerHTML=""; if(pid) snColSheet(pid); else render(); toast(pid?`已儲存到「${v}」`:"已新增收藏集"); break; }
    case "snColF": ui.snColF=ui.snColF===t.dataset.v?null:t.dataset.v; render(); break;
    case "snDelP": { const id=t.dataset.id; ask("要刪除這則貼文嗎？",()=>{ const d=snDB(); snPDel(d,x=>x.id===id); delete d.likes[id]; delete d.cms[id]; Object.values(d.saved).forEach(L=>{ const i=L.indexOf(id); if(i>=0) L.splice(i,1); }); snSave(d); layer.innerHTML=""; if(route().p==="post") navBack(); else render(); toast("已刪除"); }); break; }
    case "snFollow": { hap(8); const d=snDB(), me=snMeId(), L=snFol(d,me), v=t.dataset.v, i=L.indexOf(v); d.req=d.req||{};
      if(i<0&&snPriv(d,v)){ const R=d.req[v]=d.req[v]||[], j=R.indexOf(me); if(j>=0) R.splice(j,1); else R.push(me); snSave(d); const y=window.scrollY; render(); window.scrollTo(0,y); break; }
      if(i>=0) L.splice(i,1); else { L.push(v); ((d.folAt=d.folAt||{})[me]=d.folAt[me]||{})[v]=Date.now(); } (d.folTs=d.folTs||{})[me]=Date.now(); snSave(d); layer.innerHTML=""; const y=window.scrollY; render(); window.scrollTo(0,y); break; }
    case "snShareMe": { const u=snUser(snMeId()); try{ navigator.clipboard.writeText("@"+u.u).then(()=>toast("已複製你的用戶名稱"),()=>toast("@"+u.u)); }catch(e){ toast("@"+u.u); } break; }
    case "snEditOk": { const d=snDB(), me=snMeId(), pr=d.prof[me]=d.prof[me]||{}; const u=((document.getElementById("snUIn")||{}).value||"").trim().toLowerCase().replace(/[^a-z0-9._]/g,""), b=((document.getElementById("snBioIn")||{}).value||"").trim();
      if(u&&snAllUsers().some(x=>x.id!==me&&x.u===u)){ toast("這個用戶名稱有人用了"); break; } if(u&&nameBlock(u)) break; if(b&&!isAdminAcct()&&banBlock(b)) break; const sg=((document.getElementById("snSongIn")||{}).value||"").trim(); if(sg&&!isAdminAcct()&&banBlock(sg)) break; { const nI=document.getElementById("snNIn"); if(nI){ const nv=nI.value.trim().slice(0,30); if(nv&&!isAdminAcct()&&banBlock(nv)) break; pr.name=nv; } } if(u) pr.u=u; pr.bio=b; snSave(d); navBack(); toast("已更新個人檔案"); break; }
    case "snMode": { const dr=ui.snDraft||(ui.snDraft={media:[],cap:"",mode:"post"}); dr.mode=t.dataset.v; if(dr.mode==="story") dr.media=dr.media.slice(0,1); render(); break; }
    case "snNewX": ui.snDraft=null; navBack(); break;
    case "snPost": { const dr=ui.snDraft; if(!dr||!dr.media.length||dr.busy) break; const cap=((document.getElementById("snCap")||{}).value||dr.cap||"").trim(); if(cap&&!isAdminAcct()&&dr.mode!=="sub"&&banBlock(cap)) break;
      const vm=dr.media.find(m=>m.type==="video"); if(vm&&vm.file){ dr.cap=cap; dr.busy=1; snVidReady(vm).then(ok=>{ dr.busy=0; if(ok){ const b=document.querySelector('[data-a="snPost"]'); if(b) b.click(); else { ui.snDraft=dr; } } }); break; }
      const d=snDB(), me=snMeId();
      if(dr.mode==="sub"){ const mid=(session()||{}).member, to=snSubTo(mid), now=Date.now(), bad=!!cap&&(hasSlur(cap)||hasBanned(cap)), nm=(MEMBERS[mid]||{}).name||"";
        (d.sub=d.sub||[]).push({id:"sb"+now.toString(36),mid,to,media:dr.media.map(m=>{ const o={...m}; delete o.file; delete o.url; return o; }),cap:`[${nm}] ${cap}`.trim(),ts:now,st:bad?"no":"ok",why:bad?"內容有不能用的字詞":"",at:now+Math.round((60+Math.random()*7140)*1000)});
        snSave(d); toast(bad?"投稿被退回：內容有不能用的字詞":"已送出，公司審核後會發布"); ui.snDraft=null; navBack(); break; }
      if(dr.mode==="story"){ const m0=dr.media[0]; d.stories.push({id:"st"+Date.now(),uid:me,mid:m0.mid,ts:Date.now(),...(dr.mus?{mus:dr.mus}:{}),...(dr.ov?{ov:dr.ov}:{}),...((dr.stx||[]).length?{stx:dr.stx}:{}),...((dr.ment||[]).length?{ment:dr.ment}:{}),...(m0.type==="video"?{vid:{poster:m0.poster||"",dur:m0.dur||15,w:m0.w,h:m0.h}}:{}),...(dr.aud==="cf"?{cf:1}:{})}); toast(dr.aud==="cf"?"已分享給摯友":"已分享到限時動態"); }
      else { const as=isAdminAcct()&&dr.as&&snOfAccs().includes(dr.as)?dr.as:me; d.posts.push({id:"sp"+Date.now(),uid:as,media:dr.media.map(m=>{ const o={...m}; delete o.file; delete o.url; return o; }),cap,ts:Date.now(),...(dr.mus?{mus:dr.mus}:{}),...((dr.tags||[]).length?{tags:dr.tags.slice()}:{})}); toast("已分享"); }
      snSave(d); try{ snMentNotify(dr.mode==="story"?(dr.ment||[]).map(x=>x.u):(dr.tags||[]),dr.mode==="story"?"在限時動態中提到你":"在貼文中標註了你"); }catch(e){} ui.snDraft=null; navBackTo("#/"+session().role+"/sns"); window.scrollTo(0,0); break; }
    case "snStory": if(t.dataset.v) snOpenStory(t.dataset.v,t.dataset.o==="1"); break;
    case "snSnd": snSndToggle(); break;
    case "snCmRe": { ui.snRe={p:t.dataset.id,c:t.dataset.v,u:t.dataset.u}; const i0=document.getElementById("snCmIn"); if(i0) i0.value="@"+t.dataset.u+" "; } snOpenCm(t.dataset.id); setTimeout(()=>{ const i=document.getElementById("snCmIn"); if(i){ i.focus(); const n=i.value.length; try{ i.setSelectionRange(n,n); }catch(e){} } },60); break;
    case "snCmReX": ui.snRe=null; snOpenCm(t.dataset.id); break;
    case "snCmLk": { const d=snDB(), me=snMeId(), c=(d.cms[t.dataset.id]||[]).find(x=>x.id===t.dataset.v); if(!c) break; const L=c.lk=c.lk||[], i=L.indexOf(me); if(i>=0) L.splice(i,1); else L.push(me); snSave(d); t.classList.toggle("on",i<0); const sm=t.previousElementSibling&&t.previousElementSibling.querySelector("small"); snOpenCm(t.dataset.id); break; }
    case "snEditCap": { const d=snDB(), p=d.posts.find(x=>x.id===t.dataset.id); if(!p) break; layer.innerHTML=""; tieModal("編輯說明",`<textarea id="snCapEd" class="a-nick-in sn-caped" rows="4" placeholder="輸入文字">${esc(p.cap||"")}</textarea>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="snEditCapOk" data-id="${p.id}">完成</button>`,"row"); break; }
    case "snEditCapOk": { const v=((document.getElementById("snCapEd")||{}).value||"").trim(); if(v&&!isAdminAcct()&&banBlock(v)) break; const d=snDB(), p=d.posts.find(x=>x.id===t.dataset.id); if(!p) break; p.cap=v; p.ed=Date.now(); snSave(d); layer.innerHTML=""; render(); toast("已更新"); break; }
    case "snTagGo": layer.innerHTML=""; navTo("#/"+session().role+"/sns?p=tag&id="+encodeURIComponent(t.dataset.v)); break;
    case "snAtGo": { const u=snAllUsers().find(x=>(x.u||"").toLowerCase()===t.dataset.v); if(!u){ toast("找不到這個帳號"); break; } layer.innerHTML=""; navTo("#/"+session().role+"/sns?p=profile&id="+encodeURIComponent(u.id)); break; }
    case "snFl": ui.snFlK=t.dataset.k; ui.snFlQ=""; navTo("#/"+session().role+"/sns?p=fl&id="+encodeURIComponent(t.dataset.v)); break;
    case "snFlK": ui.snFlK=t.dataset.v; render(); break;
    case "snFlRm": { const v=t.dataset.v; ask("要移除這位粉絲嗎？對方不會收到通知。",()=>{ const d=snDB(), me=snMeId(), F=snFol(d,v), i=F.indexOf(me); if(i>=0) F.splice(i,1); snSave(d); render(); },{ok:"移除"}); break; }
    case "snRecX": try{ localStorage.removeItem(snRecKey()); }catch(e){} render(); break;
    case "snTagPick": { const dr=ui.snDraft; if(!dr) break; const cap=document.getElementById("snCap"); if(cap) dr.cap=cap.value; const me=snMeId(), d=snDB(), U=[...new Set([...snFol(d,me),...snAllUsers().map(x=>x.id)])].filter(x=>x!==me).map(snUser).filter(Boolean).slice(0,60);
      setLayer(`<div class="sn-shw" data-a="tCloseLayer"><div class="sn-sh" role="dialog" aria-label="標註人物"><i class="sn-grab"></i><b class="sn-sht">標註人物</b><div class="sn-tpl">${U.map(u=>`<button class="${(dr.tags||[]).includes(u.id)?"on":""}" data-a="snTagT" data-v="${u.id}">${snAv(u,40)}<span><b>${esc(u.u)}</b><small>${esc(u.name)}</small></span><i></i></button>`).join("")}</div><button class="sn-tpok" data-a="snTagDone">完成</button></div></div>`,"sntag");
      requestAnimationFrame(()=>{ const w=layer.querySelector(".sn-shw"); if(w) w.classList.add("open"); }); break; }
    case "snTagT": { const dr=ui.snDraft; if(!dr) break; const L=dr.tags=dr.tags||[], i=L.indexOf(t.dataset.v); if(i>=0) L.splice(i,1); else if(L.length>=20) toast("最多標註 20 人"); else L.push(t.dataset.v); t.classList.toggle("on",i<0); break; }
    case "snTagDone": layer.innerHTML=""; render(); break;
    case "snLikers": snLikers(t.dataset.id); break;
    case "snSubNew": ui.snDraft={media:[],cap:"",mode:"sub"}; navTo("#/"+session().role+"/sns?p=new&id=sub"); break;
    case "snNatShare": { const h=location.href.split("#")[0]+"#/"+session().role+"/sns?p=post&id="+encodeURIComponent(t.dataset.id); try{ navigator.share({url:h}).catch(()=>{}); }catch(e){} break; }
    case "snLkX": { layer.innerHTML=""; if(ui.snLkDirty){ ui.snLkDirty=0; render(); } break; }
    case "snLkFol": { const d=snDB(), me=snMeId(), v=t.dataset.v, L=snFol(d,me), i=L.indexOf(v); d.req=d.req||{};
      if(i<0&&snPriv(d,v)){ const R=d.req[v]=d.req[v]||[], j=R.indexOf(me); if(j>=0) R.splice(j,1); else R.push(me); }
      else if(i>=0) L.splice(i,1); else { L.push(v); ((d.folAt=d.folAt||{})[me]=d.folAt[me]||{})[v]=Date.now(); }
      (d.folTs=d.folTs||{})[me]=Date.now(); snSave(d); ui.snLkDirty=1; const n=document.createElement("div"); n.innerHTML=snLkBtn(snDB(),v); t.replaceWith(n.firstElementChild); break; }
    case "snStHeart": { const d=snDB(), me=snMeId(), id=t.dataset.id, L=(d.slk=d.slk||{})[id]=d.slk[id]||[], i=L.indexOf(me); if(i>=0) L.splice(i,1); else { L.push(me); dmAppend(me,t.dataset.u,{text:"❤️",story:id,ts:Date.now()}); snFlyHearts(t); } snSave(d); t.classList.toggle("on",i<0); break; }
    case "snStReact": { const me=snMeId(); dmAppend(me,t.dataset.u,{text:t.dataset.v,story:t.dataset.id,ts:Date.now()}); t.classList.add("pop"); toast("已傳送"); break; }
    case "snStViews": { const d=snDB(), me=snMeId(), V=Object.keys(d.seen).filter(x=>x!==me&&(d.seen[x]||{})[t.dataset.v]).map(snUser).filter(Boolean); clearTimeout(ui.snStT);
      snSheet([V.length?V.map(u=>[`${snAv(u,32)}<b>${esc(u.u)}</b>${(((d.slk||{})[t.dataset.v])||[]).includes(u.id)?`<i class="snsh-lk">${si("heart")}</i>`:""}`,"snsGo",`data-v="profile" data-id="${u.id}"`]):[["還沒有人看過","tCloseLayer",""]]],{title:V.length?`${V.length} 位看過`:""}); break; }
    case "snDmTap": { const now=Date.now(), k=t.dataset.v+":"+t.dataset.i; if(ui.snDmT&&ui.snDmT.k===k&&now-ui.snDmT.ts<320){ ui.snDmT=null; const me=snMeId(), key=dmKey(me,t.dataset.v), L=S.get(key,[])||[], x=L[+t.dataset.i]; if(!x) break; const lk=x.lk=x.lk||[], i=lk.indexOf(me); if(i>=0) lk.splice(i,1); else lk.push(me); S.set(key,L); render(); } else ui.snDmT={k,ts:now}; break; }
    case "snReqOk": case "snReqNo": { const d=snDB(), me=snMeId(), v=t.dataset.v; d.req=d.req||{}; d.req[me]=(d.req[me]||[]).filter(x=>x!==v); if(a==="snReqOk"){ const F=snFol(d,v); if(!F.includes(me)) F.push(me); } snSave(d); render(); break; }
    case "snPrivT": { const d=snDB(), me=snMeId(); if(snForcePriv(me)){ toast("你已經出道了，這個舊帳號只能維持私人帳號"); break; } const pr=d.prof[me]=d.prof[me]||{}; pr.priv=!pr.priv; if(!pr.priv&&d.req&&d.req[me]&&d.req[me].length){ d.req[me].forEach(x=>{ const F=snFol(d,x); if(!F.includes(me)) F.push(me); }); d.req[me]=[]; } snSave(d); render(); toast(pr.priv?"已改成私人帳號":"已改成公開帳號"); break; }
    case "snToStory": { const d=snDB(), me=snMeId(), p=d.posts.find(x=>x.id===t.dataset.id); if(!p) break; d.stories.push({id:"st"+Date.now(),uid:me,post:p.id,ts:Date.now()}); snSave(d); layer.innerHTML=""; render(); toast("已加到你的限時動態"); break; }
    case "snStoryPost": { clearTimeout(ui.snStT); ui.snStory=null; layer.innerHTML=""; const d=snDB(), p=d.posts.find(x=>x.id===t.dataset.id); navTo("#/"+session().role+"/sns?p="+(p&&snIsVid(p)?"reels":"post")+"&id="+encodeURIComponent(t.dataset.id)); break; }
    case "snHlPick": t.classList.toggle("on"); break;
    case "snHlDel": { const id=t.dataset.v; ask("要刪除這個精選嗎？",()=>{ const d=snDB(), me=snMeId(); d.hl=d.hl||{}; d.hl[me]=(d.hl[me]||[]).filter(h=>h.id!==id); snSave(d); clearTimeout(ui.snStT); ui.snStory=null; layer.innerHTML=""; render(); toast("已刪除精選"); }); break; }
    case "snHl": { const d=snDB(), h=snHls(d,t.dataset.v).find(x=>x.id===t.dataset.id); if(!h||!h.items.length) break; ui.snStory={order:[t.dataset.v],ui:0,si:0,list:h.items,title:h.title,hid:h.id}; snShowStory(); break; }
    case "snHlNew": { const d=snDB(), me=snMeId(), S2=d.stories.filter(x=>x.uid===me&&!x.del).sort((a,b)=>a.ts-b.ts); if(!S2.length){ toast("先發一則限時動態吧"); break; }
      tieModal("新增精選",`<input id="snHlIn" class="a-nick-in" maxlength="15" placeholder="輸入文字"><span class="sn-hlpk">${S2.slice().reverse().map((s,i)=>`<button class="${i===0?"on":""}" data-a="snHlPick" data-id="${s.id}">${snStThumb(d,s,snUser(me).g)}<i></i></button>`).join("")}</span>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="snHlOk">新增</button>`,"row sn-hlm"); hydrateMedia(layer); setTimeout(()=>{ const i=document.getElementById("snHlIn"); if(i) i.focus(); },200); break; }
    case "snHlOk": { const v=((document.getElementById("snHlIn")||{}).value||"").trim()||"精選"; if(banBlock(v)) break; const d=snDB(), me=snMeId(); d.hl=d.hl||{}; const pk=[...document.querySelectorAll(".sn-hlpk .on")].map(b=>b.dataset.id); if(!pk.length){ toast("至少選一則"); break; } (d.hl[me]=d.hl[me]||[]).push({id:"hl"+Date.now(),title:v,items:d.stories.filter(x=>x.uid===me&&pk.includes(x.id)).sort((a,b)=>a.ts-b.ts)}); snSave(d); layer.innerHTML=""; render(); toast("已新增精選"); break; }
    case "snCreate": snSheet([[["貼文","snNewP",'data-v="post"',{ic:"grid"}],["限時動態","snNewP",'data-v="story"',{ic:"plus"}]]],{title:"建立"}); break;
    case "snNewP": layer.innerHTML=""; ui.snDraft={media:[],cap:"",mode:t.dataset.v}; navTo("#/"+route().role+"/sns?p=new"+(t.dataset.v==="story"?"&id=story":"")); break;
    case "snFeedSw": snSheet([[["為你推薦","snFeedSet",'data-v="all"',{ic:"home",on:(ui.snFeed||"all")==="all"}],["追蹤中","snFeedSet",'data-v="following"',{ic:"user",on:ui.snFeed==="following"}]]]); break;
    case "snFeedSet": ui.snFeed=t.dataset.v; layer.innerHTML=""; render(); window.scrollTo(0,0); break;
    case "snMenu": snSheet([[["已儲存","snSavedTab","",{ic:"save"}],["摯友","snsGo",'data-v="cf"',{ic:"star"}]],[["分享個人檔案","snShareMe","",{ic:"send"}]]]); break;
    case "snAud": if(ui.snDraft){ ui.snDraft.aud=t.dataset.v; render(); } break;
    case "snCfT": { const d=snDB(), me=snMeId(), L=(d.cf=d.cf||{})[me]=d.cf[me]||[], i=L.indexOf(t.dataset.v); if(i>=0) L.splice(i,1); else L.push(t.dataset.v); snSave(d); t.classList.toggle("on",i<0); break; }
    case "snRf": ui.snRf=t.dataset.v; render(); window.scrollTo(0,0); break;
    case "snSugX": { const me=snMeId(); try{ const k="hc_sndis_"+me, L=JSON.parse(localStorage.getItem(k)||"[]"); L.push(t.dataset.v); localStorage.setItem(k,JSON.stringify(L.slice(-200))); }catch(e){} const y=window.scrollY; render(); window.scrollTo(0,y); break; }
    case "snFlCat": ui.snFlCat=ui.snFlCat===t.dataset.v?null:t.dataset.v; render(); break;
    case "snFlSort": snSheet([[["預設","snFlSortSet",'data-v="def"',{on:!ui.snFlSort||ui.snFlSort==="def"}],["最新追蹤","snFlSortSet",'data-v="new"',{on:ui.snFlSort==="new"}],["最早追蹤","snFlSortSet",'data-v="old"',{on:ui.snFlSort==="old"}]]],{title:"排序方式"}); break;
    case "snFlSortSet": ui.snFlSort=t.dataset.v; layer.innerHTML=""; render(); break;
    case "snSavedTab": layer.innerHTML=""; ui.snTab="saved"; render(); break;
    
    case "snStoryNav": { const st=ui.snStory; if(!st) break; clearTimeout(ui.snStT); if(+t.dataset.v<0){ if(st.si>0) st.si--; else if(st.ui>0){ st.ui--; st.si=0; } } else st.si++; snShowStory(); break; }
    case "snStoryX": clearTimeout(ui.snStT); ui.snStory=null; snMusStop(); layer.innerHTML=""; render(); break;
    case "snMusAdd": snMusList(); break;
    case "snMusUp": snMusPick(); break;
    case "snMusSong": snMusSong(t.dataset.id); break;
    case "snMusInfo": e.preventDefault(); e.stopPropagation(); snMusInfo(t.dataset.k); break;
    case "snMiNo": break;
    case "snMiX": snMiClose(true); break;
    case "snMiGo": { const o=SN_MUSK[t.dataset.k]; snMiClose(false); if(!o) break; const m=o.m;
      if(m.src==="app"&&m.sid&&songOf(m.sid)){ clearTimeout(ui.snStT); if(ui.snStory){ ui.snStory=null; snMusStop(); layer.innerHTML=""; } openSongSheet(m.sid); break; }
      const uid=m.src==="orig"&&m.uid?m.uid:o.who; if(uid){ const b=document.createElement("button"); b.dataset.a="snsGo"; b.dataset.v="profile"; b.dataset.id=uid; b.hidden=true; document.body.appendChild(b); b.click(); b.remove(); } else snMiClose(true); break; }
    case "snMiRep": { const k=t.dataset.k, o=SN_MUSK[k]; snMiClose(false); if(!o) break; const isS=k.startsWith("s:"), id=k.slice(2), u=snUser(o.who)||{};
      ask(`檢舉這則${isS?"限時動態":"貼文"}使用的音樂？管理員會審核。`,()=>{ reportItem("sns",{wid:id,text:"音樂："+snMusLabel(o.m),name:u.u||"",who:o.who}); toast("已送出檢舉"); },{title:"檢舉音樂",ok:"檢舉"});
      if(isS&&ui.snStory){ const st=ui.snStory; ui.snStT=setTimeout(()=>{ if(ui.snStory===st){ st.si++; snShowStory(); } },6000); } break; }
    case "snMusDel": if(ui.snDraft){ ui.snDraft.mus=null; render(); try{ steMusTag(); }catch(e){} } break;
    case "snEdTool": { const v=t.dataset.v; if(v==="text") steTextOpen(null); else if(v==="stk") steStkOpen(); else if(v==="men") steMenOpen(); else steDrawOpen(); break; }
    case "snEdClose": { const dr=ui.snDraft; STE=null; layer.innerHTML=""; if(dr){ dr.media=[]; dr.ov=null; } render(); break; }
    case "snEdFx": { const i=STE_FX.findIndex(f=>f[0]===(STE.fx||"")); STE.fx=STE_FX[(i+1)%STE_FX.length][0]; steTextRefresh(); break; }
    case "snEdMenAdd": { STE.items.push({t:"men",uid:t.dataset.v,x:.5,y:.55,s:1,r:0}); const p=document.getElementById("stePanel"); if(p){ p.className="ste-panel"; p.innerHTML=""; } steRender(); break; }
    case "snEdFont": STE.font=(STE.font+1)%STE_FONT.length; steTextRefresh(); break;
    case "snEdBgT": STE.bg=STE.bg?0:1; steTextRefresh(); break;
    case "snEdAlign": STE.al=STE.al==="center"?"left":STE.al==="left"?"right":"center"; steTextRefresh(); break;
    case "snEdCol": STE.col=t.dataset.v; steTextRefresh(); break;
    case "snEdTextOk": steTextOk(); break;
    case "snEdStkTab": ui.stkTab=t.dataset.v; steStkOpen(); break;
    case "snEdStkAdd": { const [sp,k]=t.dataset.v.split("|"); STE.items.push({t:"stk",tok:[sp,k],x:.5,y:.45,s:1,r:0}); const p=document.getElementById("stePanel"); if(p){ p.className="ste-panel"; p.innerHTML=""; } steRender(); break; }
    case "snEdPanelX": { const p=document.getElementById("stePanel"); if(p){ p.className="ste-panel"; p.innerHTML=""; } break; }
    case "snEdUndo": STE.strokes.pop(); steDrawAll(); break;
    case "snEdPenW": STE.pen.w=+t.dataset.v; steDrawOpen(); break;
    case "snEdPenC": STE.pen.c=t.dataset.v; steDrawOpen(); break;
    case "snEdDrawOk": { STE.tool=null; const r=document.getElementById("steRoot"); if(r) r.classList.remove("drawing"); const p=document.getElementById("stePanel"); if(p){ p.className="ste-panel"; p.innerHTML=""; } break; }
    case "snEdShare": steShare(t.dataset.v); break;
    case "snMusPv": snMusPv(); break;
    case "snMusOk": snMusOk(); break;
    case "snMusX": snMusPvStop(); snMusBuf=null; ui.snMusT=null; layer.innerHTML=""; steBack(); break;
    case "snMusTg": { ui.snMusOn=!(ui.snMusOn&&snMusCur===t.dataset.k); if(ui.snMusOn) snMusPlay(t.dataset.v,t.dataset.k); else snMusStop(); break; }
    case "snStoryDel": { const id=t.dataset.v; const d=snDB(); d.stories=d.stories.map(x=>x.id===id&&!x.del?snStDel(x):x); snSave(d); toast("已刪除限時動態"); clearTimeout(ui.snStT); if(ui.snStory){ snShowStory(); } break; }
    case "snAdmUser": { const uid=t.dataset.v; snSheet([[["刪除這個帳號的所有 SNS 貼文","snAdmWipe",`data-v="${uid}"`,{ic:"trash",red:1}]]]); break; }
    case "snAdmWipe": { const uid=t.dataset.v; ask("要刪除這個帳號在 SNS 的所有貼文和限時動態嗎？",()=>{ const d=snDB(); snPDel(d,p=>p.uid===uid); d.stories=d.stories.map(x=>x.uid===uid&&!x.del?snStDel(x):x); snSave(d); layer.innerHTML=""; render(); toast("已刪除"); }); break; }
    case "snsExit": { let f=ui.snsFrom; ui.snsFrom=null;
      /* 重新整理過不知道從哪進來：找進 SNS 之前的那一頁；找不到就回首頁（不會只退一步又停在 SNS 裡） */
      if(!f){ const cur=NAV_BASE+NAV_D; for(let i=cur-1;i>=0;i--){ if(NAV_STK[i]&&!NAV_STK[i].includes("/sns")){ f=NAV_STK[i]; break; } } }
      if(f) navBackTo(f); else navRoot("#/"+session().role); break; }
  }
});
/* 最近搜尋：從搜尋結果點進去的帳號記下來（只存在這支手機） */
document.addEventListener("click",e=>{ const t=e.target.closest('[data-rec="1"]'); if(t&&t.dataset.id) snRecAdd(t.dataset.id); },true);
/* 限時動態回覆：打字時先停住，送出變成私訊 */
document.addEventListener("focusin",e=>{ if(e.target.id==="snStReIn") clearTimeout(ui.snStT); });
document.addEventListener("submit",e=>{ if(e.target.id!=="snStReF") return; e.preventDefault(); const i=document.getElementById("snStReIn"), v=(i&&i.value||"").trim(); if(!v) return; if(!isAdminAcct()&&banBlock(v)) return;
  dmAppend(snMeId(),e.target.dataset.u,{text:v,story:e.target.dataset.id,ts:Date.now()}); i.value=""; i.blur(); toast("已傳送"); const st=ui.snStory; if(st){ clearTimeout(ui.snStT); ui.snStT=setTimeout(()=>{ if(ui.snStory===st){ st.si++; snShowStory(); } },2500); } });
/* 私訊傳照片 */
document.addEventListener("change",async e=>{ if(!(e.target.id==="snDmPic"||(e.target.classList&&e.target.classList.contains("sn-dmpic2")))) return; const f=e.target.files&&e.target.files[0], to=e.target.dataset.id; if(!f||!to) return; try{ const {blob,w,h}=await prepPhoto(f), id="sdm"+Date.now(); await MDB.put(id,blob); dmAppend(snMeId(),to,{text:"",mid:id,w,h,ts:Date.now()}); render(); }catch(err){ toast("這張照片讀不出來"); } });

/* =========================================================
   SNS 影片（Reels）＋ 雲端用量 ＋ 把 kv 裡的大圖片搬到 R2
   ・影片：60 秒以內（不限支數）；太大或 iPhone 的 HEVC 會先在手機上壓成 H.264（約 720p、5–10MB）再上傳
   ・看影片：滑到畫面上才下載、自動播放（預設靜音，點喇叭開聲音）
   ・kv 裡的 data:image（餐車照片、聊天室背景、應援棒圖、主題圖）→ 上傳到 R2，kv 只留網址
     （kv 每台手機每次打開都要整包下載，圖片放在裡面會把 Supabase 的流量吃光）
   ========================================================= */
const SN_VMAX=60, SN_VKEEP=10*1024*1024;
const snSndIc=()=>ui.snMute===false?`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>`
  :`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>`;
function snSndToggle(){ ui.snMute=ui.snMute===false; document.querySelectorAll("video.sn-vid").forEach(v=>{ v.muted=ui.snMute!==false||!!v.closest(".sn-post[data-mus]"); }); document.querySelectorAll(".sn-snd").forEach(b=>{ b.innerHTML=snSndIc(); b.classList.add("show"); clearTimeout(b._t); b._t=setTimeout(()=>b.classList.remove("show"),900); }); }
/* 畫面上的影片：看得到才下載、播放；滑走就暫停（重畫畫面時接著原本的秒數播） */
ui.snVT=ui.snVT||{};
let snVio=null;
function snVidScan(){ const L=document.querySelectorAll("video.sn-vid:not([data-ob])"); if(!L.length) return;
  if(!snVio&&"IntersectionObserver" in window) snVio=new IntersectionObserver(es=>es.forEach(e=>{ const v=e.target; if(e.isIntersecting&&e.intersectionRatio>=.6) snVidOn(v); else { if(!v.paused){ ui.snVT[v.dataset.vmid]=v.currentTime; v.pause(); } } }),{threshold:[0,.6]});
  L.forEach(v=>{ v.dataset.ob="1"; v.muted=ui.snMute!==false; if(v.dataset.pmid) mediaSrc(v.dataset.pmid).then(u=>{ if(u&&!v.poster) v.poster=u; }); v.addEventListener("timeupdate",()=>{ ui.snVT[v.dataset.vmid]=v.currentTime; }); if(snVio) snVio.observe(v); else snVidOn(v); }); }
async function snVidOn(v){ if(!v.isConnected) return; if(!v.src){ v.closest(".sn-sl,.sn-rbg")?.classList.add("vload"); const u=await mediaSrc(v.dataset.vmid); v.closest(".sn-sl,.sn-rbg")?.classList.remove("vload"); if(!u||!v.isConnected){ v.closest(".sn-sl,.sn-rbg")?.classList.add("gone"); return; } v.src=u; const t=ui.snVT[v.dataset.vmid]; if(t) try{ v.currentTime=t; }catch(e){} }
  v.muted=ui.snMute!==false||!!v.closest(".sn-post[data-mus]"); const p=v.play();   /* 有配音樂的貼文：影片一律靜音（跟 IG 一樣，聲音是那首歌），才不會把歌打斷 */ if(p&&p.catch) p.catch(()=>{ v.muted=true; ui.snMute=true; v.play().catch(()=>{}); }); }
new MutationObserver(()=>{ cancelAnimationFrame(snVidScan._r); snVidScan._r=requestAnimationFrame(snVidScan); }).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener("visibilitychange",()=>{ if(document.hidden) document.querySelectorAll("video.sn-vid").forEach(v=>v.pause()); });

/* 今天已經發了幾支影片 */

function vidLoad(src,muted=true){ return new Promise((res,rej)=>{ const v=document.createElement("video"); v.muted=muted; v.playsInline=true; v.setAttribute("playsinline",""); v.preload="auto"; v.crossOrigin="anonymous"; let ok=false; v.onloadedmetadata=()=>{ ok=true; res(v); }; v.onerror=()=>rej(new Error("video")); setTimeout(()=>{ if(!ok) rej(new Error("timeout")); },15000); v.src=src; v.load(); }); }
/* 第一個畫面當封面 */
async function vidPoster(v){ try{ await new Promise(r=>{ let done=false; const f=()=>{ if(!done){ done=true; r(); } }; v.onseeked=f; v.onloadeddata=f; try{ v.currentTime=Math.min(.15,(v.duration||1)/2); }catch(e){ f(); } setTimeout(f,2500); });
  const k=Math.min(1,720/Math.max(v.videoWidth,v.videoHeight)), c=document.createElement("canvas"); c.width=Math.max(2,Math.round(v.videoWidth*k)); c.height=Math.max(2,Math.round(v.videoHeight*k)); c.getContext("2d").drawImage(v,0,0,c.width,c.height);
  return await new Promise(r=>c.toBlob(r,"image/jpeg",.8)); }catch(e){ return null; } }
/* 選好影片：先看長度、做封面，真的壓縮等按「分享」再做（那時候可以開聲音錄） */
async function snAddVideo(f){ const dr=ui.snDraft; if(!dr) return;
  if(dr.media.length){ toast("影片要單獨發一則貼文"); return; }
  const url=URL.createObjectURL(f); let v; try{ v=await vidLoad(url); }catch(e){ URL.revokeObjectURL(url); toast("這支影片讀不出來"); return; }
  const dur=v.duration; if(!isFinite(dur)||dur>SN_VMAX+.5){ URL.revokeObjectURL(url); toast(`影片要 ${SN_VMAX} 秒以內`); return; }
  const pb=await vidPoster(v), id="snv"+Date.now(), pid=id+"p"; if(pb) await MDB.put(pid,pb);
  dr.media.push({mid:id,type:"video",w:v.videoWidth,h:v.videoHeight,dur:Math.round(dur*10)/10,poster:pb?pid:"",url,file:f}); render(); if(dr.mode==="story") stEdOpen(); }
/* 壓縮：畫到 canvas 再用 MediaRecorder 錄下來（聲音用 WebAudio 接出來） */
function vidMime(){ if(!window.MediaRecorder||!MediaRecorder.isTypeSupported) return ""; return ["video/mp4;codecs=avc1.42E01E,mp4a.40.2","video/mp4;codecs=avc1","video/mp4","video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"].find(m=>{ try{ return MediaRecorder.isTypeSupported(m); }catch(e){ return false; } })||""; }
async function vidCompress(f,prog){ const mime=vidMime(), c=document.createElement("canvas"); if(!mime||!c.captureStream) throw new Error("norec");
  const url=URL.createObjectURL(f), v=await vidLoad(url,false); const W=v.videoWidth, H=v.videoHeight, dur=v.duration, k=Math.min(1,1280/Math.max(W,H));
  c.width=Math.round(W*k/2)*2; c.height=Math.round(H*k/2)*2; const x=c.getContext("2d"), cs=c.captureStream(30); let ac=null;
  try{ const AC=window.AudioContext||window.webkitAudioContext; ac=new AC(); await ac.resume(); const src=ac.createMediaElementSource(v), dst=ac.createMediaStreamDestination(); src.connect(dst); dst.stream.getAudioTracks().forEach(t=>cs.addTrack(t)); }catch(e){ v.muted=true; }
  const vb=Math.round(Math.max(7e5,Math.min(2.5e6,8e6*8/Math.max(dur,1)-128e3)));
  const rec=new MediaRecorder(cs,{mimeType:mime,videoBitsPerSecond:vb,audioBitsPerSecond:96000}), ch=[];
  rec.ondataavailable=e=>{ if(e.data&&e.data.size) ch.push(e.data); };
  const stopped=new Promise(r=>{ rec.onstop=r; });
  let run=true; const draw=()=>{ if(!run) return; x.drawImage(v,0,0,c.width,c.height); prog&&prog(Math.min(1,v.currentTime/dur)); if(v.requestVideoFrameCallback) v.requestVideoFrameCallback(draw); else requestAnimationFrame(draw); };
  x.drawImage(v,0,0,c.width,c.height); rec.start(1000);
  try{ await v.play(); }catch(e){ run=false; try{ rec.stop(); }catch(_){} if(ac) ac.close().catch(()=>{}); URL.revokeObjectURL(url); throw new Error("play"); }
  draw(); await new Promise(r=>{ v.onended=r; v.onpause=()=>{ if(v.ended) r(); }; setTimeout(r,(dur+8)*1000); });
  run=false; try{ rec.stop(); }catch(e){} await stopped; if(ac) ac.close().catch(()=>{}); URL.revokeObjectURL(url); cs.getTracks().forEach(t=>t.stop());
  const b=new Blob(ch,{type:mime.split(";")[0]}); if(b.size<2000) throw new Error("empty"); return b; }
/* 按「分享」：需要的話壓縮，存起來（會上傳到 R2） */
async function snVidReady(m){ if(!m||m.type!=="video"||!m.file) return true; const f=m.file, mov=/quicktime|hevc/i.test(f.type)||/\.mov$/i.test(f.name||"");
  let b=f; if(f.size>SN_VKEEP||mov){
    setLayer(`<div class="sn-vbusy"><div><b>影片處理中</b><i><u id="snVPr"></u></i><small id="snVPt">0%</small></div></div>`,"snvbusy");
    try{ b=await vidCompress(f,p=>{ const u=document.getElementById("snVPr"), t=document.getElementById("snVPt"); if(u) u.style.width=Math.round(p*100)+"%"; if(t) t.textContent=Math.round(p*100)+"%"; }); }
    catch(e){ b=f.size<=30*1024*1024?f:null; }
    if(b&&b.size>f.size&&f.size<=30*1024*1024&&!mov) b=f;
    layer.innerHTML=""; }
  if(!b){ toast("影片太大，換一支短一點的"); return false; }
  await MDB.put(m.mid,b instanceof Blob&&!(b instanceof File)?b:new Blob([await b.arrayBuffer()],{type:b.type||"video/mp4"})); m.size=b.size; delete m.file; if(m.url){ URL.revokeObjectURL(m.url); delete m.url; } return true; }

/* ===== 把 kv 裡的 data:image 搬到 R2（只剩網址） ===== */
const KVI=new Set([K.trucks,K.tieArtBg,K.sticks,K.themes,K.tieSet]);
const kviId=du=>"kvi_"+strHash(du).toString(36)+strHash(du.slice(-4096)).toString(36)+"_"+du.length.toString(36);
const kviT={}, kviBusy={};
function kvImgSoon(k){ if(!KVI.has(k)) return; clearTimeout(kviT[k]); kviT[k]=setTimeout(()=>kvImgFix(k),1500); }
async function kvImgFix(k){ if(typeof HB_ON==="undefined"||!HB_ON||!HB.tok||kviBusy[k]) return; const v=S.get(k,null); if(!v||typeof v!=="object") return;
  const found=new Set(), walk=o=>{ for(const a in o){ const x=o[a]; if(typeof x==="string"){ if(x.startsWith("data:image/")&&x.length>3000) found.add(x); } else if(x&&typeof x==="object") walk(x); } }; walk(v); if(!found.size) return;
  kviBusy[k]=1; const map=new Map();
  try{ for(const du of found){ const b=b64Blob(du); if(!b) continue; const u=await hbImgUrl(kviId(du),b); if(u) map.set(du,u); } }catch(e){}
  kviBusy[k]=0; if(!map.size) return;
  const cur=S.get(k,null); if(!cur||typeof cur!=="object") return; let n=0; const rep=o=>{ for(const a in o){ const x=o[a]; if(typeof x==="string"){ if(map.has(x)){ o[a]=map.get(x); n++; } } else if(x&&typeof x==="object") rep(x); } }; rep(cur);
  if(n) S.set(k,cur); }
/* 打開 App 後：自己的聊天室背景都搬；管理員順便把大家共用的也搬 */
function kvImgAll(){ try{ kvImgFix(K.tieSet); if(isAdminAcct()) [K.trucks,K.tieArtBg,K.sticks,K.themes].forEach((k,i)=>setTimeout(()=>kvImgFix(k),i*1500)); else if((session()||{}).role==="artist") kvImgFix(K.tieArtBg); }catch(e){} }
setTimeout(function kviGo(){ if(typeof HB_ON!=="undefined"&&HB_ON&&HB.tok&&session()) kvImgAll(); else setTimeout(kviGo,6000); },9000);

/* ===== 雲端用量（管理員） ===== */
const CLOUD_LIM={kv:500*1024*1024,eg:5*1024*1024*1024,r2:10*1024*1024*1024};
const fmtB=b=>b==null?"—":b<1024?b+" B":b<1048576?(b/1024).toFixed(1)+" KB":b<1073741824?(b/1048576).toFixed(1)+" MB":(b/1073741824).toFixed(2)+" GB";
function hbRx(n){ try{ const day=new Date().toISOString().slice(0,10), o=JSON.parse(localStorage.getItem("hc_rx")||"{}"); if(o.day!==day){ o.day=day; o.b=0; o.o=0; } o.b=(o.b||0)+n; localStorage.setItem("hc_rx",JSON.stringify(o)); }catch(e){} }
function hbRxOpen(){ try{ const day=new Date().toISOString().slice(0,10), o=JSON.parse(localStorage.getItem("hc_rx")||"{}"); if(o.day!==day){ o.day=day; o.b=0; o.o=0; } o.o=(o.o||0)+1; localStorage.setItem("hc_rx",JSON.stringify(o)); }catch(e){} }
function cloudBar(v,lim){ const p=v==null?0:Math.min(100,v/lim*100); return `<i class="cu-bar ${p>80?"hot":p>50?"warm":""}"><u style="width:${p.toFixed(1)}%"></u></i>`; }
async function cloudLoad(){ ui.cloud=ui.cloud||{}; ui.cloud.busy=1; render();
  try{ const r=await fetch(MEDIA_URL+"/usage",{headers:{Authorization:"Bearer "+HB.tok}}); if(r.ok){ const j=await r.json(); ui.cloud.r2=j; } else ui.cloud.r2={err:r.status}; }catch(e){ ui.cloud.r2={err:"net"}; }
  ui.cloud.busy=0; ui.cloud.at=Date.now(); if(route().tab==="cloud") render(); }
function viewCloud(){ const c=ui.cloud||{}; if(!c.at&&!c.busy) setTimeout(cloudLoad,0);
  const kv=HB.kvSz, top=(HB.kvTop||[]).slice(0,8), rx=(()=>{ try{ return JSON.parse(localStorage.getItem("hc_rx")||"{}"); }catch(e){ return {}; } })(), r2=c.r2||{};
  return `<main class="page cu">
    <section class="card cu-c"><div class="cu-h"><b>資料（Supabase）</b><span>${fmtB(kv)} / 500 MB</span></div>${cloudBar(kv,CLOUD_LIM.kv)}
      <div class="cu-r"><span>每次打開 App 下載</span><b>${fmtB(kv)}</b></div><div class="cu-r"><span>這台手機今天下載</span><b>${fmtB(rx.b||0)}</b></div><div class="cu-r"><span>每月流量上限</span><b>5 GB</b></div></section>
    <section class="card cu-c"><div class="cu-h"><b>照片・語音・影片（R2）</b><span>${r2.bytes!=null?fmtB(r2.bytes):"—"} / 10 GB</span></div>${cloudBar(r2.bytes,CLOUD_LIM.r2)}
      <div class="cu-r"><span>檔案數</span><b>${r2.count!=null?fmt(r2.count):"—"}</b></div>${r2.kinds?Object.entries(r2.kinds).sort((a,b)=>b[1]-a[1]).map(([k,b])=>`<div class="cu-r"><span>${esc(k)}</span><b>${fmtB(b)}</b></div>`).join(""):""}${r2.err?`<div class="cu-r"><span>R2</span><b class="neg">${r2.err===404?"Worker 未更新":"讀不到"}</b></div>`:""}</section>
    ${top.length?`<div class="section-h">最大的資料</div><section class="card cu-c">${top.map(([k,b])=>`<div class="cu-r"><span>${esc(k.replace(/^daisuki_/,""))}</span><b>${fmtB(b)}</b></div>`).join("")}</section>`:""}
    <button class="btn btn-soft cu-re" data-a="cloudRe" ${c.busy?"disabled":""}>${c.busy?"讀取中…":"重新整理"}</button></main>`; }
document.addEventListener("click",e=>{ const t=e.target.closest('[data-a="cloudRe"]'); if(t) cloudLoad(); });
hbRxOpen();
/* ===== Reels：開留言／分享時影片縮到上面繼續播；長按 2 倍速；下面的進度條可以拖 ===== */
new MutationObserver(()=>{ const on=route().sub==="sns"&&route().p==="reels"&&!!layer.querySelector(".sn-shw"); document.documentElement.classList.toggle("sn-vshrink",on); }).observe(layer,{childList:true,subtree:false});
function snReelVid(el){ const r=el.closest(".sn-reel1"); return r&&r.querySelector("video.sn-vid"); }
let snLp=null;
document.addEventListener("pointerdown",e=>{ const bg=e.target.closest(".sn-reel1 .sn-rbg"); if(!bg) return; const v=snReelVid(bg); if(!v) return;
  clearTimeout(snLp&&snLp.t); snLp={v,on:false,t:setTimeout(()=>{ snLp.on=true; v.playbackRate=2; if(v.paused) v.play().catch(()=>{}); bg.closest(".sn-reel1").classList.add("x2"); },350)}; });
["pointerup","pointercancel","pointerleave"].forEach(ev=>document.addEventListener(ev,()=>{ if(!snLp) return; clearTimeout(snLp.t); if(snLp.on){ snLp.v.playbackRate=1; snLp.v.closest(".sn-reel1")?.classList.remove("x2"); snLp.skip=Date.now(); } else snLp=null; }));
/* 長按放開後的那一下點擊不算（不然會變成開關聲音） */
document.addEventListener("click",e=>{ if(snLp&&snLp.skip&&Date.now()-snLp.skip<400&&e.target.closest(".sn-reel1 .sn-rbg")){ e.stopPropagation(); e.preventDefault(); snLp=null; } },true);
document.addEventListener("timeupdate",e=>{ const v=e.target; if(!(v instanceof HTMLVideoElement)||!v.classList.contains("sn-vid")) return; const r=v.closest(".sn-reel1"); if(!r) return; const b=r.querySelector(".sn-prog i"); if(b&&v.duration) b.style.width=(v.currentTime/v.duration*100)+"%"; },true);
/* Reels 影片的位置（照 IG）：
   ・直的影片：滿版
   ・橫的影片（例如 MV Teaser）：整支看得到，放在可看區域的正中間
   ・打開留言時：影片縮到上面那塊，照影片自己的比例、置中、圓角
   直接算出影片畫面的框（不靠瀏覽器的 contain），iPhone 上也不會偏 */
let SN_SAFE_T=-1; const snSafeT=()=>{ if(SN_SAFE_T<0){ const p=document.createElement("div"); p.style.cssText="position:fixed;top:0;left:0;width:1px;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none"; document.body.appendChild(p); SN_SAFE_T=p.offsetHeight; p.remove(); } return SN_SAFE_T; };
function snVidFit(v){ try{ const bg=v.closest(".sn-rbg"); if(!bg||!v.videoWidth) return; const W=bg.offsetWidth, H=bg.offsetHeight, ar=v.videoWidth/v.videoHeight, sh=document.documentElement.classList.contains("sn-vshrink"), land=ar>1.05;
    v.classList.toggle("land",land);
    if(!sh&&!land){ v.style.cssText=""; v.classList.remove("fit"); return; }
    const pt=sh?snSafeT()+10:0, pb=sh?12:0, ph=sh?16:0, aw=W-ph*2, ah=H-pt-pb; let w=aw, h=w/ar; if(h>ah){ h=ah; w=h*ar; }
    v.classList.add("fit"); v.style.cssText=`position:absolute;left:${(W-w)/2}px;top:${pt+(ah-h)/2}px;width:${w}px;height:${h}px;object-fit:cover;border-radius:${sh?14:0}px`; }catch(e){} }
const snVidFitAll=()=>document.querySelectorAll(".sn-reel1 video.sn-vid").forEach(snVidFit);
document.addEventListener("loadedmetadata",e=>{ const v=e.target; if(v instanceof HTMLVideoElement&&v.classList.contains("sn-vid")&&v.closest(".sn-reel1")) snVidFit(v); },true);
addEventListener("resize",()=>requestAnimationFrame(snVidFitAll));
new MutationObserver(()=>{ snVidFitAll(); setTimeout(snVidFitAll,260); }).observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
/* Reels 進度條（照 IG）：手指按住拖 → 上面的按鈕、文字先藏起來，手指上方出現小預覽圖＋「0:08 / 0:30」；放開才跳到那裡 */
const snMSS=t=>{ t=Math.max(0,Math.floor(t||0)); return Math.floor(t/60)+":"+String(t%60).padStart(2,"0"); };
document.addEventListener("pointerdown",e=>{ const pg=e.target.closest(".sn-prog"); if(!pg) return; const v=snReelVid(pg); if(!v||!v.duration) return; e.preventDefault(); e.stopPropagation();
  const sec=pg.closest(".sn-reel1"); pg.classList.add("drag"); sec.classList.add("scrub"); hap(6);
  const box=document.createElement("div"); box.className="sn-scrub"; box.innerHTML=`<span class="sn-scv"><video muted playsinline webkit-playsinline preload="auto"></video></span><b></b>`; sec.appendChild(box);
  const pv=box.querySelector("video"); try{ pv.src=v.currentSrc||v.src; pv.play().then(()=>pv.pause()).catch(()=>{}); }catch(x){}
  let u=0, raf=0;
  const seek=ev=>{ const rc=pg.getBoundingClientRect(), z=rc.width/pg.offsetWidth||1; u=Math.max(0,Math.min(1,(ev.clientX-rc.left)/rc.width)); const b=pg.querySelector("i"); if(b) b.style.width=(u*100)+"%";
    const W=box.offsetWidth, x=Math.max(8,Math.min(pg.offsetWidth-W-8,u*pg.offsetWidth-W/2)); box.style.left=x+"px"; box.querySelector("b").textContent=snMSS(u*v.duration)+" / "+snMSS(v.duration);
    if(!raf) raf=requestAnimationFrame(()=>{ raf=0; try{ if(pv.readyState) pv.currentTime=u*v.duration; }catch(x){} }); };
  seek(e); const up=()=>{ window.removeEventListener("pointermove",seek); window.removeEventListener("pointerup",up); window.removeEventListener("pointercancel",up);
    try{ v.currentTime=u*v.duration; if(v.paused) v.play().catch(()=>{}); }catch(x){} pg.classList.remove("drag"); sec.classList.remove("scrub"); box.remove(); };
  window.addEventListener("pointermove",seek); window.addEventListener("pointerup",up); window.addEventListener("pointercancel",up); },true);


/* 貼文底下的小點點（照 Instagram）
   ・5 張以內：全部一樣大
   ・超過 5 張：中間 3 顆是正常大小（目前那張一定在裡面），兩邊往外一顆比一顆小（中、小），再外面的藏起來；滑到邊邊整排跟著平移
   ・長按小點點那一塊：浮出深色膠囊，手指左右拖就一張一張快速翻（放開就收起來） */
const SN_DOT=10;   /* 一顆點點＋間距 */
function snDotsHtml(n){ return `<div class="sn-dots${n>5?" win":""}" data-n="${n}" data-ws="0"><span class="sn-dpill"></span><div class="sn-dw">${Array.from({length:n},(_,i)=>`<i class="${i===0?"on":""}"></i>`).join("")}</div></div>`; }
function snDotsSet(el,i){ const n=+el.dataset.n||el.querySelectorAll(".sn-dw i").length, D=[...el.querySelectorAll(".sn-dw i")]; if(!D.length) return;
  D.forEach((x,k)=>x.classList.toggle("on",k===i)); if(n<=5) return;
  let ws=+el.dataset.ws||0; if(i<ws) ws=i; else if(i>ws+2) ws=i-2; ws=Math.max(0,Math.min(n-3,ws)); el.dataset.ws=ws;
  D.forEach((x,k)=>{ const d=k<ws?ws-k:k>ws+2?k-ws-2:0; x.style.transform=`scale(${d===0?1:d===1?.66:d===2?.38:0})`; });
  const w=el.querySelector(".sn-dw"); if(w) w.style.transform=`translateX(${-(ws+1)*SN_DOT}px)`; }
/* 一開始畫出來時就排好（不然 6 張以上第一眼全部一樣大） */
new MutationObserver(()=>{ document.querySelectorAll(".sn-dots.win:not([data-ok])").forEach(el=>{ el.dataset.ok="1"; const c=el.previousElementSibling&&el.previousElementSibling.querySelector(".sn-car"); snDotsSet(el,c?Math.round(c.scrollLeft/Math.max(1,c.clientWidth)):0); }); }).observe(document.documentElement,{childList:true,subtree:true});
(function(){ let st=null;
  const carOf=el=>el.previousElementSibling&&el.previousElementSibling.querySelector(".sn-car");
  const end=()=>{ if(!st) return; clearTimeout(st.tm); if(st.on){ st.el.classList.remove("scrub"); } st=null; };
  document.addEventListener("touchstart",e=>{ const el=e.target.closest&&e.target.closest(".sn-dots"); if(!el||e.touches.length!==1) return; const c=carOf(el); if(!c) return;
    const t=e.touches[0]; st={el,c,x0:t.clientX,y0:t.clientY,on:false,i0:0};
    st.tm=setTimeout(()=>{ if(!st) return; st.on=true; st.i0=Math.round(c.scrollLeft/Math.max(1,c.clientWidth)); st.cur=st.i0; el.classList.add("scrub"); hap(8); },280); },{passive:true});
  document.addEventListener("touchmove",e=>{ if(!st) return; const t=e.touches[0], dx=t.clientX-st.x0, dy=t.clientY-st.y0;
    if(!st.on){ if(Math.abs(dx)>8||Math.abs(dy)>8) end(); return; }
    e.preventDefault(); const z=(typeof ZM==="function"?ZM():1)||1, n=st.c.children.length, i=Math.max(0,Math.min(n-1,st.i0+Math.round(dx/z/14)));
    if(i!==st.cur){ st.cur=i; st.c.style.scrollSnapType="none"; st.c.scrollLeft=i*st.c.clientWidth; st.c.style.scrollSnapType=""; hap(4); } },{passive:false});
  document.addEventListener("touchend",end,{passive:true}); document.addEventListener("touchcancel",end,{passive:true});
  document.addEventListener("contextmenu",e=>{ if(e.target.closest&&e.target.closest(".sn-dots")) e.preventDefault(); });
})();

Object.assign(SI,{menu2:'<path d="M2.5 8h19M2.5 15.5h13"/>'});   /* IG 貼文右上的兩條線 */
