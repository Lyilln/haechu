/* HAECHU｜互動、手勢 */
/* =========================================================
   4. 互動
   ========================================================= */
let toastTimer;
/* 藝人那邊的「已完成」類提示只留在 TIE：傳訊息、回覆粉絲。其他地方做完就做完，不跳提示（錯誤提醒照常） */
const OK_RE=/^(✅\s*)?已|完成|成功|設定為|換成|恢復|✨$|💜$/;
function tieToast(msg){ ui._tieOk=true; try{ toast(msg); } finally{ ui._tieOk=false; } }
function toast(msg,actLabel,actName){
  /* 「已傳送」這類完成小提醒：哪裡都不出現（TIE 裡也不要）；提醒錯誤、要你做事的照常出現 */
  try{ if(OK_RE.test(String(msg).replace(/<[^>]+>/g,"").trim())) return; }catch(e){}
  clearTimeout(toastTimer);
  const el=document.createElement("div"); el.className="toast"; if(ui.sheet||(layer&&layer.innerHTML)||document.querySelector(".fv2,.rc-w,.rg-w,.isg2,#askLayer .t-modal-w")){el.style.bottom="auto";el.style.top="calc(env(safe-area-inset-top,0px) + 14px)";}   /* 有彈窗時放上面，不要蓋到按鈕 */ el.setAttribute("role","status");
  el.innerHTML=`<i class="toast-ic" aria-hidden="true"></i><span>${msg}</span>${actLabel?`<button data-a="${actName}">${actLabel}</button>`:""}`;
  document.querySelectorAll(".toast").forEach(t=>t.remove()); document.body.appendChild(el); AN.toastIn(el);
  toastTimer=setTimeout(()=>AN.toastOut(el),actLabel?4200:3000);
}
/* 換頁就收掉提示（有按鈕的除外），才不會一直蓋著下一頁 */
window.addEventListener("hashchange",()=>{ document.querySelectorAll(".toast").forEach(t=>{ if(!t.querySelector("button")) t.remove(); }); });
/* 帳號是一般文字（不用郵箱），大小寫都可以 */
const acctKey=u=>{ const q=String(u||"").trim().toLowerCase(); if(!q) return ""; return Object.keys(ACCOUNTS).find(k=>k.toLowerCase()===q||String(ACCOUNTS[k].user||"").toLowerCase()===q)||""; };
const acctUser=k=>(ACCOUNTS[k]&&ACCOUNTS[k].user)||k||"";
function login(email,pw){
  if(HB_ON) return hbAuth(email,pw,false);
  const key=acctKey(email), a=key&&ACCOUNTS[key];
  if(!a||(a.pw!=null&&String(a.pw).toLowerCase()!==String(pw||"").trim().toLowerCase())){ ui.loginErr="帳號或密碼不正確"; return render(); }
  loginAs(key); }
function loginAs(email){ const a=ACCOUNTS[email]; if(!a) return;
  { const sp=suspendOf(email.trim()); if(sp){ ui.loginErr=`這個帳號因為外流 TIE 內容，${suspendText(sp)}`; return render(); } }
  ui.loginErr="";
  if(a.role==="admin"){ SS.set({role:"fan",email:email.trim().toLowerCase(),member:null,home:a.member||"",admin:true,uni:true}); S.set(K.lastEmail,email.trim().toLowerCase()); ME.name=a.name||"管理員"; applyNick();
    if(!followed().length){ S.set(K.fanArtists,GROUPS.map(g=>g.id)); const d=S.get(K.selDone,{}); d[email.trim().toLowerCase()]=true; S.set(K.selDone,d); }
    go("fan"); return; }
  SS.set({role:a.role,email:email.trim().toLowerCase(),member:a.member||null,home:a.member||null,admin:a.role==="admin"}); S.set(K.lastEmail,email.trim().toLowerCase());
  ME.name=a.name||"棉花糖粉絲"; applyNick();
  go(a.role);
}
function switchTo(role){   // 只有管理員帳號可以切換身分（管理員同時也是藝人和粉絲）
  if(!isAdminAcct()) return; if(isUni()){ layer.innerHTML=""; navTo(role==="artist"?"#/artist?tab=home":role==="admin"?"#/fan?tab=me":"#/fan"); return; } const em=session().email;
  SS.set(role==="artist"?{role:"artist",email:em,member:"luna",admin:true}:role==="admin"?{role:"admin",email:em,member:null,admin:true}:{role:"fan",email:em,member:null,admin:true});
  ui.sheet=null; layer.innerHTML=""; document.querySelectorAll(".toast").forEach(t=>t.remove()); go(role); window.scrollTo(0,0);
}
const canSwap=()=>{ const s=session(); return !!(s&&(s.admin||s.home)); };   // 管理員、藝人帳號都能切到粉絲端（藝人出道前也是粉絲，出道後可以互串）
function swapRole(){
  const s=session(); if(!canSwap()) return; const home=s.home||"luna";
  if(s.role==="fan") SS.set({...s,role:"artist",member:home});
  else SS.set({...s,role:"fan",member:null});
  ui.sheet=null; ui.inboxAll=false; layer.innerHTML=""; document.querySelectorAll(".toast").forEach(t=>t.remove()); go(session().role); window.scrollTo(0,0);
}

/* 搜尋規則（照 NSY）：點到搜尋列以外的任何地方，就關閉搜尋並清空關鍵字 */
document.addEventListener("pointerdown",e=>{
  if(!ui.srch||e.target.closest(".sh-head")||e.target.closest("#layer")||e.target.closest("main [data-a]")) return;   /* 點搜尋結果不要先把搜尋關掉（不然結果直接消失） */
  ui.srch=null; setTimeout(render,0);
},true);
const CLICK_NO={};   /* 點擊動作分檔（10a～10f），照順序找，第一個有的就做 */
const CLICK_GROUPS=[clickGen,clickCm,clickAdm,clickTheme,clickLive,clickTie];
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-a]"); if(!t) return;
  const a=t.dataset.a, r=route();
  for(const f of CLICK_GROUPS) if(f(a,t,e,r)!==CLICK_NO) return;   /* 動作照功能分在 10a～10f */
});
document.addEventListener("submit",e=>{
  if(e.target.classList.contains("al-form")){ e.preventDefault(); const v=e.target.querySelector(".al-in").value.trim(); const l=getLive(e.target.dataset.id); if(!v||!l) return; l.title=v; saveLive(l); render(); toast("直播主題已同步到粉絲與藝人端 ✨"); return; }
  if(e.target.id==="fsForm"){ e.preventDefault(); const i=document.getElementById("fsIn"), text=(i.value||"").trim(), room=document.querySelector(".fs-room[data-fs]"); if(!text||!room) return;
    const ev=fsGet(room.dataset.fs); if(!ev||ev.status!=="live") return; const desk=room.classList.contains("desk"), sl=fsSlot(ev);
    if(!desk&&meBlocked()) return; if(desk&&fsTalking(ev)!==session().member) return; fsSay(ev.id,desk?sl.fk:FS_ME,desk?"artist":"fan",text,desk?session().member:null); i.value=""; i.focus(); return; }
  if(e.target.id==="lform"){ e.preventDefault();
    const text=(ui.lDraft||"").trim(); if(!text) return; if(session().role==="fan"&&banBlock(text)) return; ui.lDraft="";
    const s=session(), r=route(), id=s.role==="artist"?(myLive(s.member)||{}).id:r.id; if(!id) return;
    if(s.role==="artist"){ const l=getLive(id), gst=l&&l.member!==s.member; if(l){ if(gst) l.typingG=0; else l.typingTs=0; saveLive(l); } liveSay(id,"artist",text,{reply:hostRep(),mid:gst?s.member:null}); ui.hostReply=null;
      /* 不整頁重畫：輸入框留著、鍵盤不收，上面的卡片跟留言就地更新 */
      { const n=document.getElementById("lin"), l2=getLive(id); if(n&&l2&&document.querySelector(".dl.host")){ n.value=""; n.dispatchEvent(new Event("input",{bubbles:true})); const sb=document.getElementById("lsend"); if(sb) sb.classList.remove("on"); const rb=document.querySelector(".host-rep2"); if(rb) rb.remove(); updateHost(l2); n.focus(); } else { render(); const n2=document.getElementById("lin"); if(n2) n2.focus(); } } if(!gst){ if(aiReady()) aiOnLive(id,"artist"); else scheduleFake(id); } }
    else { if(meBlocked()){ ui.lDraft=text; return; } if(!slowOk(text)){ ui.lDraft=text; return; } liveSay(id,"me",text); demoReplyToMe(id,text); aiOnLive(id,"me"); const i=document.getElementById("lin"); i.value=""; document.getElementById("lsend").classList.remove("on"); updateMeetRoom(); i.focus(); }
    return; }
  if(e.target.id==="snCmForm"){ e.preventDefault(); const id=e.target.dataset.id, inp=document.getElementById("snCmIn"), text=(inp&&inp.value||"").trim(); if(!text) return; if(!isAdminAcct()&&session().role==="fan"&&banBlock(text)) return; const d=snDB(); const re=ui.snRe&&ui.snRe.p===id?ui.snRe.c:undefined; ui.snRe=null; (d.cms[id]=d.cms[id]||[]).push({id:"sc"+Date.now(),uid:snMeId(),text,ts:Date.now(),...(re?{re}:{})}); snSave(d); if(inp) inp.value=""; snOpenCm(id); const y=window.scrollY; render(); window.scrollTo(0,y); return; }
  if(e.target.id==="snDmForm"){ e.preventDefault(); const to=e.target.dataset.id, inp=document.getElementById("snDmIn"), text=(inp&&inp.value||"").trim(); if(!text) return; if(!isAdminAcct()&&session().role==="fan"&&banBlock(text)) return; dmAppend(snMeId(),to,{text,ts:Date.now()}); render(); const n=document.getElementById("snDmIn"); if(n) n.focus(); snFakeReply(to); return; }
  if(e.target.id==="wform"){ e.preventDefault();
    const text=(ui.wDraft||"").trim(); if(!text) return;
    if(session().role==="artist"){ const mid=session().member, Q=tieQ(mid); if(Q.length>=TQ_MAX){ toast(`一次最多 ${TQ_MAX} 則，先把待發訊息送出去吧`); return; }
      const hadRe=!!ui.tReply, hadEmo=!!ui.tieEmoji; Q.push({text,rid:ui.tReply||null}); tieQSet(mid,Q); ui.wDraft=""; ui.tReply=null; ui.tieEmoji=false;
      /* 只換訊息那一塊，輸入框不重畫：鍵盤開著時畫面不會跳、不會閃 */
      if(!hadRe&&!hadEmo&&tieMsgsPatch(mid)) return;
      ui.scrollChat=true; render(); const i=document.getElementById("win"); if(i) i.focus(); }
    else { const m2=route().m; if(meBlocked()) return; if(banBlock(text)) return; if(fanQuota(m2).left<=0){ quotaBar(); return; }
      const lastMine=[...fanRoom(m2)].reverse().find(w=>w.from==="me");
      if(lastMine&&lastMine.text.trim()===text){ toast("不要重複傳一樣的訊息喔"); return; }
      if(/^(.)\1{5,}$/u.test(text.replace(/\s/g,""))||/^[\p{P}\p{S}\s]+$/u.test(text)&&!/\p{Extended_Pictographic}/u.test(text)){ toast("這則訊息好像沒有內容，換句話說說看吧"); return; } ui.wDraft=""; ui.scrollChat=true; fanReply(m2,text); ui.tieEmoji=false; render(); if(fanQuota(m2).left===0) quotaBar(); else { const i=document.getElementById("win"); if(i) i.focus(); } }
    return; }
  if(e.target.id==="cform"){ e.preventDefault();
    const text=(ui.cDraft||"").trim(); if(!text||!ui.sheet) return; ui.cDraft="";
    if(ui.sheet.cid){ const L=S.get(K.comments,[]), c=L.find(x=>x.id===ui.sheet.cid); if(!c) return; const p0=getPosts().find(x=>x.id===c.postId), art=session().role==="artist"&&p0&&session().member===p0.member;
      if(art){ if(!c.reply){ const {reached}=replyComment(c.id,text); if(c.aiFan) aiOnCommentReply(c); renderComments(); toast(reached?"已回覆，粉絲收到通知了":"已回覆"); return; }
        c.reps=[...(c.reps||[]),{id:"r"+Date.now(),author:"artist",text,ts:Date.now()}]; S.set(K.comments,L); renderComments(); toast("已回覆"); return; }
      if(meBlocked()||banBlock(text)){ ui.cDraft=text; return; }
      c.reps=[...(c.reps||[]),{id:"r"+Date.now(),author:"me",by:myEmail(),name:ME.name,g:ME.g,text,ts:Date.now()}]; S.set(K.comments,L); renderComments(); { const l=document.getElementById("csl"); if(l) l.scrollTop=l.scrollHeight; } toast("已回覆 💜"); return; }
    if(session().role==="artist"&&!ui.sheet.replyTo){ const c=addArtistComment(ui.sheet.postId,text); ui.sheet.focusC=c&&c.id; renderComments(true); toast("已留言"); return; }
    if(session().role==="artist"){
      const {c,reached}=replyComment(ui.sheet.replyTo,text); if(c&&c.aiFan) aiOnCommentReply(c); ui.sheet.replyTo=null; ui.sheet.focusC=c&&c.id; renderComments(true);
      toast(reached?"已回覆，粉絲收到通知了":"已回覆");
    } else { if(meBlocked()){ ui.cDraft=text; return; } if(banBlock(text)){ ui.cDraft=text; return; } { const c=addComment(ui.sheet.postId,text); ui.sheet.focusC=c&&c.id; } renderComments(); toast("已留言 💜"); }
    return; }
  if(e.target.id==="login"){ e.preventDefault(); login(document.getElementById("em").value,document.getElementById("pw").value); }
  if(e.target.id==="reg"){ e.preventDefault(); const em=(document.getElementById("rEm").value||"").trim().toLowerCase(), nm=(document.getElementById("rNm").value||"").trim(), pw=document.getElementById("rPw").value||"";
    if(!em||/\s/.test(em)){ ui.loginErr="帳號不能有空白"; return render(); }
    if(/[@\/\\]/.test(em)||em.length>20){ ui.loginErr="帳號不能有 @、/，最多 20 個字"; return render(); }
    if(!HB_ON&&acctKey(em)){ ui.loginErr="這個帳號已經有人用了"; return render(); }
    if(!nm){ ui.loginErr="請輸入暱稱"; return render(); } if(nameBlock(nm)||nameBlock(em)) return; if(pw.length<4){ ui.loginErr="密碼至少要 4 個字"; return render(); }
    if(HB_ON){ ui.authMode="login"; hbAuth(em,pw,true,nm); return; }
    saveRoster(r=>{ r.accounts=r.accounts||{}; r.accounts[em]={pw,role:"fan",name:nm}; }); ACCOUNTS[em]={pw,role:"fan",name:nm}; ui.authMode="login"; login(em,pw); } });
document.addEventListener("input",e=>{
  if(e.target.id==="buyNick"){ ui.buyNick=e.target.value; }
  if(e.target.id==="sq"){ ui.selectQuery=e.target.value; const pos=e.target.selectionStart; render(); const el=document.getElementById("sq"); el.focus(); el.setSelectionRange(pos,pos); }
  if(e.target.id==="shq"){ ui.srch.q=e.target.value; const pos=e.target.selectionStart; render(); const el=document.getElementById("shq"); if(el){ el.focus(); el.setSelectionRange(pos,pos); } }
  if(e.target.id==="focStage"){ ui.focStage=e.target.value; document.querySelectorAll('[data-a="focPreset"]').forEach(b=>b.classList.toggle("on",b.dataset.v===e.target.value)); }
  if(e.target.id==="atext"){ ui.aDraft=e.target.value; }
  if(e.target.id==="lsSplit"&&ui.lsDraft){ const v=+e.target.value; ui.lsDraft.ds.split=v/100; document.getElementById("lsSplitV").textContent=v+"%"; const el=document.querySelector('.ls-box[data-ls="draft"]'); if(el&&el._ls) el._ls.update(ui.lsDraft.ds); }
  if(e.target.id==="lsThr"&&ui.lsDraft){ document.getElementById("lsThrV").textContent=e.target.value; }
  if(e.target.id==="lin"){ ui.lDraft=e.target.value; const sb=document.getElementById("lsend"); if(sb){ sb.disabled=session().role==="artist"?!e.target.value.trim():false; sb.classList.toggle("on",!!e.target.value.trim()); }
    if(session().role==="artist"){ const me=session().member, l=myLive(me); if(l){ const k=l.member===me?"typingTs":"typingG"; if(!l[k]||Date.now()-l[k]>2000){ l[k]=Date.now(); saveLive(l); } } } }
  if(e.target.id==="win"){ ui.wDraft=e.target.value; document.getElementById("wsend").classList.toggle("on",!!e.target.value.trim()); }
  if(e.target.id==="tev"){ ui.tieEditVal=e.target.value; const st=tieSet(route().m), val=route().p==="name"?st.chatName:st.nickname; document.getElementById("teOk").classList.toggle("on",e.target.value!==val); }
  if(e.target.id==="cin"){ ui.cDraft=e.target.value; document.getElementById("csend").disabled=!e.target.value.trim(); }
  if(e.target.id==="plQ"||e.target.classList.contains("vt-in")||e.target.id==="plEnd"){ const d=ui.pollDraft; if(d){ if(e.target.id==="plQ") d.q=e.target.value; else if(e.target.id==="plEnd") d.end=e.target.value; else d.opts[+e.target.dataset.i].t=e.target.value; const b=document.getElementById("plOk"); if(b) b.disabled=!pollOk(); } }
  if(e.target.id==="snQ"||e.target.id==="snDmQ"){ const id=e.target.id, v=e.target.value, pos=e.target.selectionStart; if(id==="snQ") ui.snQ=v; else ui.snDmQ=v; render(); const n=document.getElementById(id); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(err){} } }
  if(e.target.id==="snCap"&&ui.snDraft) ui.snDraft.cap=e.target.value;
  if(e.target.id==="ct"){ ui.composeText=e.target.value; const b=document.getElementById("pubBtn"); if(b) b.disabled=!e.target.value.trim()&&!(ui.composeMedia||[]).length&&!ui.composePoll; }
});
/* 背景照片：縮小後存起來，避免塞爆手機儲存空間 */
document.addEventListener("change",async e=>{
  if(e.target.classList.contains("cm-file")){ const inp=e.target, f=inp.files&&inp.files[0], sid=inp.dataset.sid, sg=songOf(sid);
    if(!f){ tieModal("沒有收到檔案","手機沒有把檔案交給 App。可以再選一次，或改從「檔案」App 選音樂檔。",`<button class="t-mbtn main" data-a="tCloseLayer">知道了</button>`); return; }
    const isVid=/^video\//.test(f.type||"")||/\.(mov|mp4|m4v)$/i.test(f.name||"");
    const nm=esc(f.name||"音樂檔"), title=sg?esc(sg.title):"";
    const lim=isVid?150:40; if(f.size>lim*1024*1024){ tieModal("檔案太大了",`「${nm}」有 ${(f.size/1048576).toFixed(1)} MB，${isVid?"影片":"音樂檔"}請用 ${lim} MB 以下的。${isVid?"可以先在「照片」裡把影片前後剪短。":""}`,`<button class="t-mbtn main" data-a="tCloseLayer">知道了</button>`); inp.value=""; return; }
    tieModal("上傳中…",`正在${isVid?"從影片取出聲音":"讀取音樂"}並抓節拍，大約幾秒到半分鐘，先不要離開這個畫面。`,`<span class="up-spin"></span>`);
    let step="讀取檔案";
    try{ const ab=await f.arrayBuffer(); step="解碼音樂"; const c=audioCtx(); if(!c) throw new Error("這台裝置不支援播放音樂");
      let buf; try{ buf=await decodeAu(c,ab); }catch(err){ if(!isVid) throw err; step="從影片取出聲音"; const a=await MB.audio(f); if(!a) throw err; buf=await decodeAu(c,await a.blob.arrayBuffer()); }   /* iPhone .MOV 解不出來：用 mediabunny 先取出聲音 */
      step="抓節拍"; const an=analyzeBeats(buf); step="存到手機";
      step="存到手機"; const keep=isVid||f.size>12*1024*1024?await compactWav(buf):f; try{ await MDB.put("au_"+sid,keep,true); }catch(err){} auBuf[sid]=buf; const kept=await idbHas("au_"+sid);
      const T=getTracks(); T[sid]={...(T[sid]||{}),name:songName(sg),file:f.name||"",bpm:an.bpm,offset:an.offset,dur:an.dur,sec:analyzeSections(buf,an.bpm),chant:(T[sid]||{}).chant||[]}; delete T[sid].url; S.set(K.tracks,T); try{ localStorage.setItem("au_u_"+sid,""); }catch(e){} auShare(sid,keep);
      inp.value=""; ui.cmGid=sg?sg.gid:ui.cmGid; lsRerender();
      tieModal("上傳好了 🎵",`《${title}》<br>${fmtDur(an.dur)}・BPM ${an.bpm}<br><br>下一步：按「試玩」聽聽看音符有沒有對上拍子，再去「錄應援詞」。${kept?"":"<br><br><b>注意：這裡沒辦法把音樂長期存在手機上，關掉 App 再打開要重新上傳。</b>"}`,`<button class="t-mbtn main" data-a="cmTryM" data-v="${sid}">試玩</button><button class="t-mbtn" data-a="tCloseLayer">晚點再說</button>`);
    }catch(err){
      if(step==="解碼音樂"){ const dur=await mediaDur(f);   // 讀不出聲音（例如 iPhone 照片裡的 .MOV）→ 改用影片元件播放，拍子用手動對
        if(dur>0){ try{ await MDB.put("au_"+sid,f,true); }catch(e2){}
          const T=getTracks(); T[sid]={...(T[sid]||{}),name:songName(sg),file:f.name||"",media:true,bpm:null,offset:0,dur,chant:(T[sid]||{}).chant||[]}; delete T[sid].url; S.set(K.tracks,T); auShare(sid,f);
          inp.value=""; ui.cmGid=sg?sg.gid:ui.cmGid; lsRerender();
          tieModal("上傳好了，還差一步 🎵",`《${title}》${fmtDur(dur)}<br><br>這個檔案 App 沒辦法自己抓拍子，請你手動對一次：按「對拍子」，音樂開始後跟著鼓聲點 8 下以上就好。`,`<button class="t-mbtn main" data-a="cmTap" data-v="${sid}">對拍子</button><button class="t-mbtn" data-a="tCloseLayer">晚點再說</button>`);
          return; } }
      inp.value=""; tieModal("上傳失敗",`卡在「${step}」這一步。<br>檔案：${nm}（${esc(f.type||"未知格式")}）<br><br>${isVid?"這支影片的聲音讀不出來，可以換一支影片，或改用音樂檔（mp3、m4a、wav）。":"請換成 mp3、m4a 或 wav 再試一次。"}從 Apple Music 下載的歌有版權保護，App 讀不出來。`,`<button class="t-mbtn main" data-a="tCloseLayer">知道了</button>`); }
    return; }
  if(e.target.classList&&e.target.classList.contains("vt-file")){ const f=e.target.files&&e.target.files[0], i=+e.target.dataset.i; if(!f||!ui.pollDraft) return; try{ const b=await shrinkImg(f,480); const url=await new Promise(r=>{ const fr=new FileReader(); fr.onload=()=>r(fr.result); fr.readAsDataURL(b); }); ui.pollDraft.opts[i].img=url; setLayer(pollEdHtml(),"poll"); }catch(err){ toast("這張圖讀不出來"); } return; }
  if(e.target.id==="snFile"){ const fs=[...(e.target.files||[])]; if(fs.length){ toast("處理中…"); await snAddFiles(fs); } return; }
  if(e.target.id==="scAvIn"){ const f0=e.target.files&&e.target.files[0]; if(!f0) return; const f=await cropImg(f0,{ratio:1,round:true,max:640}); e.target.value=""; if(!f) return; try{ const b=await shrinkImg(f,320); const url=(HB_ON&&await hbImgUrl("prof_scout_"+Date.now().toString(36)+".jpg",b))||await new Promise(r=>{ const fr=new FileReader(); fr.onload=()=>r(fr.result); fr.readAsDataURL(b); }); ui.scAv=url; const l=document.querySelector(".sca-av"); if(l){ const s=l.querySelector("span,img"); if(s) s.outerHTML=`<img src="${url}" alt="">`; } }catch(err){ toast("這張照片讀不出來"); } return; }
  if(e.target.id==="snAvIn"){ const f0=e.target.files&&e.target.files[0]; if(!f0) return; const f=await cropImg(f0,{ratio:1,round:true,max:640}); e.target.value=""; if(!f) return; try{ const b=await shrinkImg(f,320); const url=await new Promise(r=>{ const fr=new FileReader(); fr.onload=()=>r(fr.result); fr.readAsDataURL(b); }); const d=snDB(), me=snMeId(); (d.prof[me]=d.prof[me]||{}).av=url; snSave(d); render(); }catch(err){ toast("這張照片讀不出來"); } return; }
  if(e.target.id==="postMedia"){ const fs=[...(e.target.files||[])]; if(!fs.length) return; toast("處理中…"); await addPostMedia(fs); const y=window.scrollY; render(); window.scrollTo(0,y); return; }
  if(e.target.id==="attPhoto"||e.target.id==="attVoice"){ const f=e.target.files&&e.target.files[0]; if(!f) return; const mid=session().member, isP=e.target.id==="attPhoto"; layer.innerHTML="";
    try{ const id="m"+Date.now(); let reached;
      if(isP){ ui.tiePh={mid,blob:f}; e.target.value=""; tiePhPrev(); return; }
      else { if(f.size>15*1024*1024){ toast("語音檔太大了，請小於 15MB"); return; } const dur=await audioDur(f); await tqAddMedia(mid,"voice",f,{dur}); }
    }catch(err){ toast(isP?"這張照片讀不出來，換一張試試":"這個音檔讀不出來，換成 m4a 或 mp3 試試"); }
    return; }
  if(e.target.id==="lsThr"&&ui.lsDraft){ const o=ui.lsDraft.ds; lsLoad(ui.lsDraft.src,+e.target.value); if(ui.lsDraft&&o) ["side","back","top","v2","front","pm","split","glow"].forEach(k=>{ if(o[k]!=null) ui.lsDraft.ds[k]=o[k]; }); lsRerender(); return; }
  if(e.target.id==="lsSheet"||e.target.id==="lsSide"||e.target.id==="lsBack"){ const f=e.target.files&&e.target.files[0], which=e.target.id; e.target.value=""; if(!f) return; const rd=new FileReader();
    rd.onload=()=>{ const im=new Image(); im.onload=()=>{ if(which==="lsSheet"){ lsFrameOpen(im); return; } if(ui.lsDraft){ lsFrameOpen(im,which==="lsSide"?"side":"back"); return; } const V=lsSplitSheet(im); if(!V.length){ toast("找不到應援棒，換一張背景單純的圖試試"); return; }
      if(which==="lsSheet"){ if(!lsLoad(V[0])){ return; } const d=ui.lsDraft; if(V[1]){ d.ds.side=lsViewURL(V[1]); if(V[2]) d.ds.back=lsViewURL(V[2]); d.ds._k=null; } lsRerender(); toast(V[1]?`找到 ${V.length} 個視圖，立體重建完成 ✨`:"只找到一個視圖，先用正面做；可以再加側面圖"); }
      else { const d=ui.lsDraft; if(!d) return; const big=V.slice().sort((a,b)=>b.width*b.height-a.width*a.height)[0]; if(which==="lsSide") d.ds.side=lsViewURL(big); else d.ds.back=lsViewURL(big); d.ds._k=null; lsRerender(); toast("已加上，轉轉看 ✨"); } };
      im.onerror=()=>toast("這個檔案打不開，換一張圖試試"); im.src=rd.result; }; rd.readAsDataURL(f); return; }
  if(e.target.id==="lsFile"){ const f=e.target.files&&e.target.files[0]; if(!f) return; const rd=new FileReader(); rd.onload=()=>{ const im=new Image(); im.onload=()=>{ if(lsLoad(im)){ lsRerender(); toast("辨識完成，可以旋轉看看 ✨"); } }; im.onerror=()=>toast("這個檔案打不開，換一張圖試試"); im.src=rd.result; }; rd.readAsDataURL(f); return; }
  if(e.target.id!=="tbgAlbum"&&e.target.id!=="tbgCam") return;
  const f0=e.target.files&&e.target.files[0], member=e.target.dataset.m; if(!f0) return; const f=await cropImg(f0,{ratio:cropPhone(),max:1400}); e.target.value=""; if(!f) return;
  const rd=new FileReader(); rd.onload=()=>{ const img=new Image(); img.onload=()=>{
    const k=Math.min(1,900/Math.max(img.width,img.height)), c=document.createElement("canvas");
    c.width=Math.round(img.width*k); c.height=Math.round(img.height*k); c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    openBgPreview(c.toDataURL("image/jpeg",.8),"tBgPvOk",member); };
    img.src=rd.result; }; rd.readAsDataURL(f);
});
/* TIE 傳照片：先看原圖，想裁再按「裁剪」 */
function tiePhPrev(){ const p=ui.tiePh; if(!p) return; if(p.url) URL.revokeObjectURL(p.url); p.url=URL.createObjectURL(p.blob);
  setLayer(`<div class="tph" role="dialog" aria-label="傳送照片"><header class="tph-h"><button data-a="tPhX" aria-label="取消">${XI}</button><b>傳送照片</b><span></span></header><div class="tph-im"><img src="${p.url}" alt=""></div>
    <footer class="tph-f"><button class="tph-c" data-a="tPhCrop">${CROP_IC}<span>裁剪</span></button><button class="tph-s" data-a="tPhSend">傳送</button></footer></div>`,"tph"); }
/* 長按訊息：複製 */
let lpTimer=null;
function showCopyMenu(el,x,y){
  const w=getWhispers().find(v=>v.id===el.dataset.lp); if(!w) return;
  if(route().sub==="chat"){ openMsgSheet(w.id); return; }
  if(w.from==="artist") return;
  /* 藝人端：長按粉絲的訊息 → 回覆／複製／檢舉（取代原本的「⋯」） */
  if((session()||{}).role==="artist"){ ui.copyText=w.ko||w.text; const L=Math.min(Math.max(x,90),window.innerWidth-90)/ZM(), T=Math.max(y-64,10)/ZM();
    layer.innerHTML=`<div class="t-ctx-w" data-a="tCloseLayer"><div class="t-ctx t-ctx3" style="left:${L}px;top:${T}px"><button data-a="tCopy">複製</button><button class="dg" data-a="tieRep" data-id="${w.id}">檢舉</button></div></div>`;
    layer.querySelectorAll(".t-ctx3 button").forEach(b=>b.addEventListener("click",()=>{ layer.innerHTML=""; })); try{ navigator.vibrate&&navigator.vibrate(10); }catch(e){} return; }
  const st=route().m?tieSet(route().m):null, text=w.ko||w.text;
  ui.copyText=text;
  layer.innerHTML=`<div class="t-ctx-w" data-a="tCloseLayer"><div class="t-ctx" style="left:${Math.min(Math.max(x,60),window.innerWidth-60)/ZM()}px;top:${Math.max(y-56,10)/ZM()}px"><button data-a="tCopy">複製</button></div></div>`;
}
document.addEventListener("contextmenu",e=>{ const el=e.target.closest("[data-lp]"); if(!el) return; e.preventDefault(); showCopyMenu(el,e.clientX,e.clientY); });
document.addEventListener("touchstart",e=>{ const el=e.target.closest("[data-lp]"); if(!el) return; const p=e.touches[0]; lpTimer=setTimeout(()=>showCopyMenu(el,p.clientX,p.clientY),550); },{passive:true});
["touchend","touchmove","touchcancel"].forEach(ev=>document.addEventListener(ev,()=>clearTimeout(lpTimer),{passive:true}));
document.addEventListener("click",e=>{ if(e.target.closest('[data-a="tCopy"]')){ const tx=ui.copyText||""; (navigator.clipboard?navigator.clipboard.writeText(tx):Promise.reject()).catch(()=>{}); layer.innerHTML=""; toast("已複製"); } });
window.addEventListener("hashchange",()=>{ if(concertTimer) concertOff(); });
window.addEventListener("hashchange",()=>{
  /* 只允許「往右滑＝返回」：瀏覽器的「往左滑＝下一頁（前進）」會跑到之前離開的頁面，看起來像返回錯地方 → 直接退回原本那頁 */
  { const st=history.state; if(!NAV_PEND&&st&&st.hc===NAV_BOOT&&typeof st.d==="number"&&st.d>NAV_D){ const back=NAV_D-st.d; ui.navUi=performance.now(); history.go(back); return; } }
  navStamp();
  if(NAV_PEND){ const h=NAV_PEND; NAV_PEND=null; NAV_BASE=ui.navPendBase||0; ui.navPendBase=0; navReplace(h); return; }
  if(performance.now()-(ui.navUi||0)>700) ui.swiped=true;   // 瀏覽器自己的返回（Safari 邊緣滑、Android 返回鍵）已經有動畫了，這邊不再疊一層
  render(); });
document.addEventListener("click",()=>{ ui.navUi=performance.now(); },true);
/* 看照片時：手指在照片視窗上滑，後面的聊天室不能跟著動 */
document.addEventListener("touchmove",e=>{ if(e.target.closest&&e.target.closest(".ph-view")&&!e.target.closest("video")&&e.cancelable) e.preventDefault(); },{passive:false});   /* 影片的進度條要能拖 */
/* TIE 藝人抽屜裡打開的視窗（顏色、簡介、名稱、頭貼…）關掉後，回到抽屜 */
document.addEventListener("click",()=>{ if(!ui.tieDrw) return; clearTimeout(ui.tieDrwT); ui.tieDrwT=setTimeout(()=>{ const mid=ui.tieDrw; if(!mid) return; if(!document.querySelector(".t-rh")||!MEMBERS[mid]){ ui.tieDrw=null; return; } if(!layer.innerHTML.trim()) openTieArtDrawer(mid,true); },360); });
addEventListener("hashchange",()=>{ ui.tieDrw=null; });
window.addEventListener("storage",render); // 同一台裝置開兩個分頁時也會同步
/* 不再每分鐘重畫整頁（會閃、浪費）：離開 App 超過一分鐘再回來時，才重畫一次讓「X 分鐘前」更新 */
{ let hid=0; document.addEventListener("visibilitychange",()=>{ if(document.hidden){ hid=Date.now(); return; } if(hid&&Date.now()-hid>60e3&&!document.querySelector("textarea:focus,input:focus")&&!layer.innerHTML){ const y=window.scrollY; render(); window.scrollTo(0,y); } }); }


(function addKo(){ const list=S.get(K.whispers,[]); let ch=false; list.forEach(w=>{ if(KO[w.id]&&!w.ko){ w.ko=KO[w.id]; ch=true; } }); if(ch) S.set(K.whispers,list); })();




/* ===== 底部選單：背景不跟著動；按住上方（灰色短線）往下拉可以關掉 ===== */
(function sheetDrag(){ const SH=".mu2-sh,.t-sheet,.sheet,.ios-sh,.cmx-sh"; let d=null;
  document.addEventListener("touchmove",e=>{ const w=e.target.closest(".mu2-shw,.t-sheet-w,.scrim,.ios-w,.cmx-shw,.cmx-fabw,.t-modal-w,.fg-w,.t-drawer-w"); if(!w) return; const sc=e.target.closest(".mu2-sh,.t-sheet,.sheet,.t-modal,.ios-sh,.cmx-sh,.t-drawer");
    if(!sc||(sc.scrollHeight<=sc.clientHeight+1&&!d)) { if(e.cancelable) e.preventDefault(); } },{passive:false});
  document.addEventListener("touchstart",e=>{ const sh=e.target.closest(SH); if(!sh) return; const handle=e.target.closest(".grab,.mu2-grab"); if(!handle&&sh.scrollTop>0) return; const t=e.touches[0]; d={sh,y0:t.clientY,t:performance.now(),dy:0,h:!!handle}; },{passive:true});
  document.addEventListener("touchmove",e=>{ if(!d) return; const dy=e.touches[0].clientY-d.y0; if(dy<0&&!d.on){ d=null; return; } if(!d.on&&dy<6) return; d.on=true; d.dy=Math.max(0,dy); d.sh.style.transition="none"; d.sh.style.transform=`translateY(${d.dy}px)`; if(e.cancelable) e.preventDefault(); },{passive:false});
  document.addEventListener("touchend",()=>{ if(!d) return; const x=d; d=null; if(!x.on) return; const v=x.dy/Math.max(1,performance.now()-x.t), close=x.dy>x.sh.offsetHeight*.3||v>.6&&x.dy>40;
    x.sh.style.transition="transform .25s cubic-bezier(.2,.8,.3,1)"; x.sh.style.transform=close?"translateY(110%)":"";
    if(close){ const w=x.sh.closest(".scrim,.t-sheet-w,.mu2-shw,.ios-w,.cmx-shw"); if(w){ w.style.transition="background-color .25s,backdrop-filter .25s"; w.style.backgroundColor="transparent"; w.style.backdropFilter="none"; } }
    if(close) setTimeout(()=>{ ui.sheet=null; layer.innerHTML=""; if(x.sh.classList.contains("sheet")) render(); },230); },{passive:true});
})();


/* ===== 返回手勢（粉絲、藝人、管理員三端都能用）=====
   只有從最左邊邊緣往右滑才算（她 10/22：畫面任何地方都能滑太糟糕）；拉開這一頁，底下露出上一頁；放開時滑過 1/3 或甩得快就返回。
   從左邊緣開始滑一定算；從中間滑時，如果手指在可以左右滑的列表（留言列、商品列、應援棒…）上，就讓給那個列表。 */
(function swipeBack(){ let st=null;
  const BACK='[data-a="back"],[aria-label="返回"],[data-a="pClose"],[data-a="gClose"],[data-a="aeClose"],[data-a="meetBack"],[data-a="snsExit"],[data-a="ltX"]';
  const vis=b=>{ if(!b) return null; const r=b.getBoundingClientRect(); return r.width&&r.height?b:null; };
  /* 最上面那一層先關：照片檢視、結尾妖精、小遊戲這種蓋在整個畫面上的，滑了就關它，不會動到底下的頁面 */
  const topOv=()=>ovl.firstElementChild||document.querySelector("body > .fv2, body > .rc-w, body > .rg-w, body > .isg2, #askLayer .t-modal-w");
  function target(){ const O=topOv(); if(O){ const b=vis(O.querySelector(BACK+',[aria-label="關閉"],[data-a="tCloseLayer"],[data-a$="Close"],[data-a$="X"],.fv2-x')); return b?{el:O,go:()=>b.click(),under:null}:null; }
    const L=layer.firstElementChild;
    if(L){ const b=vis(L.querySelector(BACK+',[data-a="tCloseLayer"].icon-btn,[aria-label="關閉"]')); return b?{el:L,go:()=>b.click(),under:null}:null; }
    const app=root.querySelector(":scope > .app"); if(!app) return null; const b=vis(app.querySelector(BACK)); if(!b) return null;
    const prev=NAVSTK.length>1?SNAP.get(NAVSTK[NAVSTK.length-2]):null; return {el:app,go:()=>b.click(),under:prev}; }
  function hScrollable(el){ for(let n=el;n&&n!==document.body;n=n.parentElement){ if(n.tagName==="CANVAS"||n.tagName==="INPUT"||n.tagName==="TEXTAREA"||n.dataset&&n.dataset.ls!=null) return true; const cs=getComputedStyle(n); if((cs.overflowX==="auto"||cs.overflowX==="scroll")&&n.scrollWidth>n.clientWidth+2&&n.scrollLeft>0) return true; if((cs.overflowX==="auto"||cs.overflowX==="scroll")&&n.scrollWidth>n.clientWidth+2&&n.scrollLeft===0&&false) return true; } return false; }
  function mkUnder(snap){ const u=document.createElement("div"); u.className="sb-under"; u.setAttribute("aria-hidden","true");
    u.innerHTML=`<div class="sb-in" style="transform:translateY(${-snap.y}px)">${snap.html}</div><span class="sb-dim"></span>`; u.querySelectorAll("#cmSpot,#heartRain,canvas").forEach(n=>n.remove()); document.body.insertBefore(u,document.body.firstChild); return u; }
  document.addEventListener("touchstart",e=>{ if(!st) document.querySelectorAll(".sb-under").forEach(u=>u.remove());   // 上一次手勢留下的「上一頁」殘影清掉
    if(e.touches.length!==1||e.target.closest(".crp,.tph")){ st=null; return; } const t=e.touches[0]; const edge=t.clientX<30; if(!edge){ st=null; return; }   // 只有從最左邊邊緣往右滑才返回（畫面中間滑不算）；瀏覽器的紀錄只有一筆，系統的滑動不會再搶（11/11）
    if(!edge&&e.target.closest(".t-page,.t-msgs,[data-sw]")) { st=null; return; }
    if(!edge&&hScrollable(e.target)) { st=null; return; } if(e.target.closest(".mu2-sh,.t-sheet,.sheet,.ios-sh,.cmx-sh,.ab-w,.cele,.gal2,.pm-car")){ st=null; return; }
    if(!edge&&e.target.closest(".seg2-pane")){ const sg=document.querySelector(".seg2"); if(sg&&!sg.querySelector("button").classList.contains("on")){ st=null; return; } }
    st={x:t.clientX,y:t.clientY,t:performance.now(),dx:0,on:false,edge}; },{passive:true});
  document.addEventListener("touchmove",e=>{ if(!st) return; const t=e.touches[0], dx=t.clientX-st.x, dy=t.clientY-st.y;
    if(!st.on){ if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){ st=null; return; } if(dx<-8){ st=null; return; } if(dx<12||dx<Math.abs(dy)*1.4) return;
      const tg=target(); if(!tg){ st=null; return; } Object.assign(st,tg); st.on=true; st.x=t.clientX-1; st.W=innerWidth/ZM();
      st.u=st.under?mkUnder(st.under):null; st.el.classList.add("sb-moving"); }
    st.dx=Math.max(0,(t.clientX-st.x)/ZM()); const p=Math.min(1,st.dx/st.W);
    st.el.style.transform=`translateX(${st.dx}px)`; if(st.u){ st.u.firstElementChild.style.translate=`${-30*(1-p)}% 0`; st.u.lastElementChild.style.opacity=.18*(1-p); }
    if(e.cancelable) e.preventDefault(); },{passive:false});
  function end(){ if(!st) return; const s=st; st=null; if(!s.on) return; const v=s.dx/Math.max(1,performance.now()-s.t), ok=s.dx>s.W*.28||(v>.4&&s.dx>40);
    const T="transform .28s cubic-bezier(.2,.8,.3,1)"; s.el.style.transition=T; s.el.style.transform=ok?`translateX(${s.W}px)`:"translateX(0)";
    if(s.u){ s.u.firstElementChild.style.transition="translate .28s cubic-bezier(.2,.8,.3,1)"; s.u.lastElementChild.style.transition="opacity .28s"; s.u.firstElementChild.style.translate=ok?"0 0":"-30% 0"; s.u.lastElementChild.style.opacity=ok?0:.18; }
    setTimeout(()=>{ if(ok){ ui.swiped=true; s.go(); requestAnimationFrame(()=>requestAnimationFrame(()=>{ if(s.u) s.u.remove(); })); }
      else { s.el.style.transition=""; s.el.style.transform=""; s.el.classList.remove("sb-moving"); if(s.u) s.u.remove(); }
      if(ok&&s.el.isConnected){ s.el.style.transition=""; s.el.style.transform=""; s.el.classList.remove("sb-moving"); } },290); }
  document.addEventListener("touchend",end,{passive:true}); document.addEventListener("touchcancel",end,{passive:true});
  window.addEventListener("hashchange",()=>setTimeout(()=>document.querySelectorAll(".sb-under").forEach(u=>u.remove()),60));
})();


/* ===== 兩段切換也能用手指左右滑：往左滑換到右邊那頁、往右滑換回左邊那頁（在左邊那頁往右滑＝返回） ===== */
(function segSwipe(){ let st=null;
  document.addEventListener("touchstart",e=>{ const pane=e.target.closest(".seg2-pane"); if(!pane||e.touches.length!==1) return; const t=e.touches[0]; st={x:t.clientX,y:t.clientY,t:performance.now()}; },{passive:true});
  document.addEventListener("touchend",e=>{ if(!st) return; const t=e.changedTouches[0], dx=t.clientX-st.x, dy=t.clientY-st.y, s0=st; st=null;
    if(Math.abs(dx)<50||Math.abs(dx)<Math.abs(dy)*1.5||performance.now()-s0.t>700) return; const seg=document.querySelector(".seg2"); if(!seg) return; const bs=[...seg.querySelectorAll("button")], i=bs.findIndex(b=>b.classList.contains("on"));
    const j=dx<0?i+1:i-1; if(j<0||j>=bs.length) return; bs[j].click(); },{passive:true});
})();

/* ===== 側邊抽屜：手指往右拉，抽屜跟著手走；放開時拉超過 1/3 或甩得快就關，不然彈回去 ===== */
(function drawerDrag(){ let d=null;
  document.addEventListener("touchstart",e=>{ const w=e.target.closest&&e.target.closest(".t-drawer-w.open"); if(!w||e.touches.length!==1){ d=null; return; } const dr=w.querySelector(".t-drawer"); if(!dr){ d=null; return; } const t=e.touches[0]; d={w,dr,x0:t.clientX,y0:t.clientY,t:performance.now(),dx:0,on:false,no:false}; },{passive:true});
  document.addEventListener("touchmove",e=>{ if(!d||d.no) return; const t=e.touches[0], dx=t.clientX-d.x0, dy=t.clientY-d.y0;
    if(!d.on){ if(Math.abs(dx)<8&&Math.abs(dy)<8) return; if(Math.abs(dy)>Math.abs(dx)||dx<0){ d.no=true; return; } d.on=true; d.dr.style.transition="none"; d.w.style.transition="none"; }
    const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1, W=d.dr.offsetWidth; d.dx=Math.max(0,dx/z);
    d.dr.style.transform=`translateX(${d.dx}px)`; d.w.style.background=`rgba(0,0,0,${(.4*(1-Math.min(1,d.dx/W))).toFixed(3)})`; if(e.cancelable) e.preventDefault(); },{passive:false});
  document.addEventListener("touchend",()=>{ if(!d) return; const x=d; d=null; if(!x.on) return; const W=x.dr.offsetWidth, v=x.dx/Math.max(1,performance.now()-x.t), close=x.dx>W*.3||(v>.5&&x.dx>30);
    x.dr.style.transition="transform .28s cubic-bezier(.2,.8,.3,1)"; x.w.style.transition="background .28s";
    if(close){ x.dr.style.transform="translateX(100%)"; x.w.style.background="rgba(0,0,0,0)"; ui.tieDrw=null; setTimeout(()=>{ if(layer.contains(x.w)) layer.innerHTML=""; },280); }
    else { x.dr.style.transform=""; x.w.style.background=""; setTimeout(()=>{ x.dr.style.transition=""; x.w.style.transition=""; },300); } },{passive:true});
})();
/* 藝人 TIE：加進待發訊息時，只更新訊息區（不重畫整頁，輸入框、鍵盤、高度都不動） */
function tieMsgsPatch(mid){ try{ const cur=document.querySelector("main.t-msgs"), inp=document.getElementById("win"); if(!cur||!inp) return false;
  const tmp=document.createElement("div"); tmp.innerHTML=viewTieArtist(mid); const nw=tmp.querySelector("main.t-msgs"); if(!nw) return false;
  cur.innerHTML=nw.innerHTML; try{ hydrateMedia(cur); }catch(e){} inp.value=""; inp.dispatchEvent(new Event("input",{bubbles:true}));
  /* 鍵盤開著時訊息區是自己捲的盒子（kbbox）：要捲那個盒子到底，不是整頁；高度一律不動 */
  requestAnimationFrame(()=>{ if(tie2Patched(cur)) return; if(cur.classList.contains("kbbox")) cur.scrollTop=cur.scrollHeight; else { try{ tieFootPad(); }catch(e){} window.scrollTo(0,document.documentElement.scrollHeight); } }); return true; }catch(e){ return false; } }
/* 底部變暗的視窗打開時：後面的頁面不能滑；簽名板、畫布上手指只畫線，畫面不跟著跑
   （只擋「沒有可以捲的東西」的滑動，視窗裡本來能捲的清單照常能捲；不動任何高度） */
document.addEventListener("touchmove",e=>{ try{ if(!layer||!layer.firstElementChild||!layer.firstElementChild.getBoundingClientRect().width) return; const t=e.target; if(!(t instanceof Element)) return;
  if(t.closest("input,textarea,select,video,audio,input[type=range]")) return; if(t.tagName!=="CANVAS"&&!layer.contains(t)) return;
  for(let el=t; el&&el!==layer; el=el.parentElement){ if(el.tagName==="CANVAS") break; const cs=getComputedStyle(el); if(/(auto|scroll)/.test(cs.overflowY+cs.overflowX)&&(el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1)) return; }
  e.preventDefault(); }catch(_){} },{passive:false});

