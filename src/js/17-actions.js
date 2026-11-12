/* HAECHU｜點擊動作 */
/* =========================================================
   點擊動作（一般、出道、抽卡）：從 10-點擊互動.js 的大 switch 搬出來，內容沒改
   回傳 CLICK_NO＝這裡沒有這個動作，交給下一份
   ========================================================= */
function clickGen(a,t,e,r){ switch(a){
    case "tryGo": tryOpen(t.dataset.v); break;
    case "tryX": tryClose(); break;
    case "tryCol": { TRY.col=t.dataset.v; SEA.color=TRY.col; try{ TRY.ls&&TRY.ls.set("glow",TRY.col); }catch(e){} document.querySelectorAll(".try-cols button").forEach(b=>b.classList.toggle("on",b===t)); const st=layer.querySelector(".try-stage"); if(st){ st.dataset.glow=TRY.col; st.querySelector(".cc-sky").style.background=`radial-gradient(120% 70% at 50% 105%,${TRY.col}66,transparent 60%),radial-gradient(80% 50% at 50% -10%,${TRY.col}33,transparent 70%),linear-gradient(#0B0820,#140B2E 55%,#1E0F3A)`; st.querySelector(".b1").style.background=`linear-gradient(${TRY.col}aa,transparent 75%)`; } break; }
    case "tryFlip": tryFlip(); break;
    case "tryPal": TRY.pal=+t.dataset.v; document.querySelectorAll(".try-pal button").forEach(b=>b.classList.toggle("on",b===t)); TRUCK3D.set(tryDeco()); break;
    case "trySend": TRUCK3D.drive&&TRUCK3D.drive(); clearTimeout(TRY.tm); TRY.tm=setTimeout(()=>{ if(TRY.k==="truck") tryOpen("end"); },2600); t.disabled=true; break;
    case "tryJoin": tryJoin(); break;
    case "authMode": ui.authMode=t.dataset.v; ui.loginErr=""; render(); break;
    case "fill": if(ui.authMode==="reg"){ ui.authMode="login"; render(); } document.getElementById("em").value=t.dataset.e; document.getElementById("pw").value=t.dataset.p; break;
    case "back": navBack(); break;
    case "tab": if(isUni()&&t.classList.contains("nav-btn")&&session().role==="admin"){ const h=UNI_ATABGO[t.dataset.v]||"#/admin"; navRoot(h); window.scrollTo(0,0); break; }
      if(isUni()&&t.classList.contains("nav-btn")&&session().role==="fan"){ ui.feedTab="feed"; ui.meSec=null; ui.shopG=null; ui.srch=null; const h=UNI_ROUTE[t.dataset.v]||"#/fan"; navRoot(h); window.scrollTo(0,0); break; }
      ui.feedTab="feed"; ui.meSec=null; ui.shopG=null; ui.srch=null; if((t.dataset.v==="whisper"||t.dataset.v==="live")&&session().role==="artist") ui.scrollChat=true; go(session().role,null,t.dataset.v==="home"?null:t.dataset.v); window.scrollTo(0,0); break;
    case "ft": ui.feedTab=t.dataset.v; render(); window.scrollTo(0,0); break;
    case "sf": ui.selectFilter=t.dataset.v; render(); break;
    case "sqClear": ui.selectQuery=""; render(); { const i=document.getElementById("sq"); if(i) i.focus(); } break;
    case "pick": { const id=t.dataset.id; ui.selectDraft.has(id)?ui.selectDraft.delete(id):ui.selectDraft.add(id); render(); break; }
    case "saveSelect": {
      const first=!followed().length||!selDoneFor(); { const d=S.get(K.selDone,{}); d[(session()||{}).email||""]=true; S.set(K.selDone,d); }
      S.set(K.fanArtists,[...ui.selectDraft]); ui.selectDraft=null; ui.selectQuery="";
      if(first){ go("fan"); toast(`已加入 ${followed().length} 個社群 💜`); } else { navBack(); toast("已更新追蹤"); }
      break; }
    case "openNotifs": {
      markAllRead(); ui.notifFilter="all"; ui.pinIdx=0; go("fan","notifications"); window.scrollTo(0,0); break; }
    case "nf": ui.notifFilter=t.dataset.v; render(); break;
    case "settings": openSettings(); break;
    case "toggleSet": { const s=getSettings(); s[t.dataset.k]=!s[t.dataset.k]; S.set(K.settings,s); t.setAttribute("aria-checked",s[t.dataset.k]); e.stopPropagation(); return; }
    case "closeLayer": if(e.target===t||t.tagName==="BUTTON") layer.innerHTML=""; break;
    case "openPost": if(t.dataset.id){
      if(t.dataset.c){ ui.feedTab="feed"; go("fan"); const c0=S.get(K.comments,[]).find(x=>x.id===t.dataset.c); if(c0&&c0.author!=="artist"){ ui.sheet={postId:t.dataset.id,focusC:t.dataset.c,cid:t.dataset.c}; renderComments(true); } else openComments(t.dataset.id,{focusC:t.dataset.c}); }
      else { ui.feedTab="feed"; ui.focusPost=t.dataset.id; ui.expanded.add(t.dataset.id); go("fan"); } } break;
    case "comments": ui.cDraft=""; openComments(t.dataset.id); break;
    case "ptOrig": { ui.ptOrig=ui.ptOrig||new Set(); const id=t.dataset.id; if(ui.ptOrig.has(id)) ui.ptOrig.delete(id); else ui.ptOrig.add(id); const p=getPosts().find(x=>x.id===id); const el=document.querySelector(`[data-ptx="${id}"]`); if(p&&el){ const cl=el.classList.contains("clamp"); t.remove(); el.outerHTML=postTextHtml(p,false,cl); } break; }
    case "replyTo": ui.cDraft=""; ui.sheet.replyTo=t.dataset.c; renderComments(true); break;
    
    case "openLive": { const id=t.dataset.lv||t.dataset.id; const l=getLive(id); if(l){ ui.lDraft=""; ui.endFor=null; if(!l.endTs){ logSelf("live",l.member,`你加入了 ${artName(l.member,"live")} 的文字直播間 🎥`,{liveId:l.id}); } navTo((l.endTs?"#/fan/replay?id=":"#/fan/live?id=")+id); } else toast("這場直播已不存在"); break; }
    case "openReplay": case "openReplayArt": ui.rpArt=a==="openReplayArt"; layer.innerHTML=""; navTo("#/"+session().role+"/replay?id="+t.dataset.id); window.scrollTo(0,0); break;
    case "tkDown": { const b=document.getElementById("cmTick"); if(b) b.scrollTo({top:b.scrollHeight,behavior:"smooth"}); t.hidden=true; ui.tkUnseen=0; break; }
    case "rpMode": { const to=t.dataset.v==="art"; if(to===!!ui.rpArt) break; segSwitch(t,()=>{ ui.rpArt=to; },to?1:-1); break; }
    case "remind": { const on=toggleRemind(t.dataset.id); if(on===null) break; const y=window.scrollY; render(); window.scrollTo(0,y); toast(on?"開播時會提醒你 ⏰":"已取消提醒"); break; }
    case "addPlan": { const ti=document.getElementById("ptitle").value.trim(), wh=document.getElementById("pwhen").value; if(!ti){ toast("請先輸入直播標題"); break; }
      const ts=new Date(wh).getTime(); if(!ts||ts<Date.now()){ toast("請選一個之後的時間"); break; }
      addPlan(session().member,ti,ts); render(); if(layer.querySelector(".plan-sheet")||true) openPlanSheet(); toast("已公布預告，粉絲可以按提醒我了 ✨"); break; }
    case "delPlan": ask("要刪除這個直播預告嗎？",()=>{ delPlan(t.dataset.id); render(); openPlanSheet(); toast("已刪除預告"); }); break;
    case "hostReplyTo": { const l=myLive(session().member); if(!l) break; const i=+t.dataset.i, x=l.msgs[i]; if(!x) break;
      ui.hostReply=ui.hostReply&&ui.hostReply.i===i?null:{i,name:x.name||"粉絲",text:x.text,from:x.from,by:x.by,ts:x.ts};
      { const hs=document.getElementById("hostFeed"), hy=hs?hs.scrollTop:0; render(); const h2=document.getElementById("hostFeed"); if(h2) h2.scrollTop=hy; }
      if(ui.hostReply){ const n=document.getElementById("lin"); if(n) n.focus({preventScroll:true}); } break; }
    case "hostReplyX": { ui.hostReply=null; const hs=document.getElementById("hostFeed"), hy=hs?hs.scrollTop:0; render(); const h2=document.getElementById("hostFeed"); if(h2) h2.scrollTop=hy; break; }
    case "meetBack": ui.justEnded=t.dataset.id; ui.endFor=null; go("fan",null,"live"); window.scrollTo(0,0); break;
    case "justClose": ui.justEnded=null; render(); break;
    case "focInfo": { const sc=getSched(); tieModal("資訊面板",`<span class="info-row"><em>本週階段</em>${esc(sc.stage)}</span>${SHOWS.map(x=>`<span class="info-row"><em>${x.name}</em>${showEndTxt(x.id)} 結束</span>`).join("")}`,`<button class="t-mbtn main" data-a="tCloseLayer">知道了</button>`); break; }
    
    case "askOk": { const f=ui.askFn; ui.askFn=null; askClose(); if(f) f(); break; }
    case "askX": if(e.target===t||t.tagName==="BUTTON"){ ui.askFn=null; askClose(); } break;
    case "a2h": openA2H(); break;
    case "tAttach": openAttach(); break;
    case "tQuota": quotaBar(); break;
    case "revSave": { const v=Math.max(0,Math.min(100,+(document.getElementById("revShare")||{}).value||0)); S.set(K.revShare,v); render(); toast(`藝人分潤比例設為 ${v}%`); break; }
    case "rsColor": ui.rsColor=+t.dataset.v; { const y=window.scrollY; const n=(document.getElementById("rgName")||{}).value; render(); window.scrollTo(0,y); const i=document.getElementById("rgName"); if(i&&n) i.value=n; } break;
    case "rsGroup": ui.rsGroup=t.dataset.v; { const y=window.scrollY, keep=["rmName","rmEmail"].map(id=>(document.getElementById(id)||{}).value||""); render(); window.scrollTo(0,y); ["rmName","rmEmail"].forEach((id,i)=>{ const el=document.getElementById(id); if(el) el.value=keep[i]; }); } break;
    case "rmEdit": { const id=t.dataset.v, m=MEMBERS[id]; if(!m) break; ui.rmEd=id; const cur=Object.keys(ACCOUNTS).find(e=>ACCOUNTS[e].member===id)||"", bd=(S.get(K.bdays,{})[id])||"";
      const opts=`<option value="">${cur?"解除綁定":"之後再選"}</option>`+(cur?`<option value="${esc(cur)}" selected>${esc(acctUser(cur))}・${esc(realName(cur)||ACCOUNTS[cur].name||"")}</option>`:"")+Object.entries(ACCOUNTS).filter(([e,a])=>e!==cur&&((a.role==="fan")||(a.role==="admin"&&!(a.member&&MEMBERS[a.member])))).map(([e,a])=>`<option value="${esc(e)}">${esc(acctUser(e))}・${esc(realName(e)||a.name||e)}</option>`).join("");
      tieModal(`編輯 ${esc(m.name)}`,"",`<span class="fs-f-lab">Teaser 照</span><div class="rg-ph"><span class="rg-ph-img tz" id="rmPhImg" style="background:${grad(m.g)}">${teaserIn(id)}</span><span class="rg-ph-r"><span class="rg-ph-b"><button class="btn btn-soft btn-sm" data-a="rmPhPick" id="rmPhBtn">${mPhoto(id)?"更換":"上傳"}</button><button class="btn btn-soft btn-sm" data-a="rmPhDel">移除</button></span></span></div><span class="fs-f-lab">藝名</span><input id="rmEdName" class="a-nick-in" maxlength="16" placeholder="輸入文字" value="${esc(m.name)}"><span class="fs-f-lab">生日（月-日）</span><input id="rmEdBday" class="a-nick-in" maxlength="5" placeholder="輸入文字" value="${esc(bd)}"><span class="fs-f-lab">用哪個帳號登入</span><select id="rmEdAcc" class="a-nick-in">${opts}</select><button class="t-mbtn main" data-a="rmEditOk">儲存</button><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break; }
    case "rmEditOk": { const id=ui.rmEd, m=MEMBERS[id]; if(!m) break; const nm=((document.getElementById("rmEdName")||{}).value||"").trim(), bd=((document.getElementById("rmEdBday")||{}).value||"").trim(), acc=((document.getElementById("rmEdAcc")||{}).value||"").trim().toLowerCase();
      if(!nm){ toast("請輸入藝名"); break; } if(nameBlock(nm)) break; if(bd&&!/^\d{1,2}-\d{1,2}$/.test(bd)){ toast("生日請用 月-日，例如 3-21"); break; }
      const g=groupOf(m.group); saveRoster(r=>{ if(r.members[id]) r.members[id].name=nm; if(g&&g.solo){ const x=(r.groups||[]).find(y=>y.id===g.id); if(x) x.name=nm; } }); m.name=nm; if(g&&g.solo) g.name=nm;
      { const all=S.get(K.bdays,{}); if(bd) all[id]=bd; else delete all[id]; S.set(K.bdays,all); }
      const cur=Object.keys(ACCOUNTS).find(e=>ACCOUNTS[e].member===id)||""; if(acc!==cur){ if(cur) unbindArtist(cur); if(acc) bindArtist(acc,id); }
      layer.innerHTML=""; lsRerender(); toast("已儲存"); break; }
    case "rgEdit": { const g=groupOf(t.dataset.v); if(!g) break; ui.rgEd=g.id; ui.rgEdC=g.g; ui.rgEdCo=g.co||""; rgEditOpen(); break; }
    case "rgEdCo": { const n=(document.getElementById("rgEdName")||{}).value, it=(document.getElementById("rgEdIntro")||{}).value; ui.rgEdCo=ui.rgEdCo===t.dataset.v?"":t.dataset.v; rgEditOpen(n,it); break; }
    case "rgEdColor": { const n=(document.getElementById("rgEdName")||{}).value, it=(document.getElementById("rgEdIntro")||{}).value; ui.rgEdC=+t.dataset.v; rgEditOpen(n,it); break; }
    case "rgPhPick": { const gid=ui.rgEd, n=(document.getElementById("rgEdName")||{}).value, it=(document.getElementById("rgEdIntro")||{}).value; const inp=document.createElement("input"); inp.type="file"; inp.accept="image/*";
      inp.onchange=async()=>{ const f0=inp.files&&inp.files[0]; if(!f0) return; const f=await cropImg(f0,{ratio:CROP_COVER}); if(!f) return; try{ const b=await shrinkImg(f,1440); GPREV[gid]=URL.createObjectURL(b); rgEditOpen(n,it); { const y=window.scrollY; render(); window.scrollTo(0,y); } toast("出道／回歸照換好了");
        const url=(HB_ON&&await hbImgUrl("gph_"+gid+"_"+Date.now().toString(36)+".jpg",b))||await new Promise(res=>{ const rd=new FileReader(); rd.onload=()=>res(rd.result); rd.readAsDataURL(b); });
        imgSwap(url,()=>{ const M={...(S.get(K.gPhoto,{})||{})}; const old=M[gid]; if(old!==url) mediaDel(old); M[gid]=url; try{ S.set(K.gPhoto,M); }catch(e){ toast("圖片太大，存不下來"); return; } delete GPREV[gid]; if(!layer.innerHTML){ const y=window.scrollY; render(); window.scrollTo(0,y); } }); }catch(e){ toast("這張圖讀不出來"); } }; pickClick(inp); break; }
    case "rgPhDel": { const gid=ui.rgEd, n=(document.getElementById("rgEdName")||{}).value, it=(document.getElementById("rgEdIntro")||{}).value; delete GPREV[gid]; const M={...(S.get(K.gPhoto,{})||{})}; mediaDel(M[gid]); delete M[gid]; S.set(K.gPhoto,M); rgEditOpen(n,it); break; }
    case "rgEditOk": { const g=groupOf(ui.rgEd); if(!g) break; const nm=((document.getElementById("rgEdName")||{}).value||"").trim(); if(!nm){ toast(g.solo?"請輸入藝名":"請輸入團名"); break; } if(nameBlock(nm)) break;
      if(GROUPS.some(x=>x.id!==g.id&&x.name===nm)){ toast("已經有這個名字了"); break; } const c=ui.rgEdC??g.g, itr=((document.getElementById("rgEdIntro")||{}).value||"").trim();
      const co=ui.rgEdCo??(g.co||""); saveRoster(r=>{ const x=(r.groups||[]).find(y=>y.id===g.id); if(x){ x.name=nm; x.g=c; if(co) x.co=co; else delete x.co; if(itr) x.intro=itr; else delete x.intro; } if(r.members[g.id+"_o"]) r.members[g.id+"_o"].name=nm+" 官方"; if(g.solo) Object.keys(r.members).forEach(k=>{ if(r.members[k].group===g.id&&!r.members[k].official) r.members[k].name=nm; }); });
      g.name=nm; g.g=c; if(co) g.co=co; else delete g.co; if(itr) g.intro=itr; else delete g.intro; if(MEMBERS[g.id+"_o"]) MEMBERS[g.id+"_o"].name=nm+" 官方"; if(g.solo) Object.keys(MEMBERS).forEach(k=>{ if(MEMBERS[k].group===g.id&&!MEMBERS[k].official) MEMBERS[k].name=nm; });
      layer.innerHTML=""; lsRerender(); toast("已儲存"); break; }
    case "debutAsk": { const d=myDebut();
      if(d&&d.status==="pre"){ tieModal("出道預告",`<span class="info-row"><em>藝名</em>${esc(d.name)}</span><span class="info-row"><em>出道日</em>${mdTxt(d.day)}（D-${dLeft(d.day)}）</span><span class="fs-f-lab">延期到</span><input id="dbLaterIn" class="a-nick-in" type="date" min="${ymdIn(d.day+864e5)}" value="${ymdIn(d.day+864e5)}">`,`<button class="t-mbtn" data-a="dbLater" data-v="${d.id}">延期</button><button class="t-mbtn main" data-a="tCloseLayer">好</button>`); break; }
      if(d&&d.status==="wait"){ tieModal("申請出道",`<span class="info-row"><em>${d.kind==="group"?"團名":"藝名"}</em>${esc(d.name)}</span>${d.co?`<span class="info-row"><em>公司</em>${esc(d.co)}</span>`:""}<span class="info-row"><em>狀態</em>審核中</span>${dbMedia(d)}`,`${d.email===myEmail()?`<button class="t-mbtn" data-a="debutCancel" data-v="${d.id}">撤回申請</button>`:""}<button class="t-mbtn main" data-a="tCloseLayer">好</button>`); hydrateMedia(layer); break; }
      debutForm(); break; }
    case "dbTeaser": { dbKeep(); const f=ui.dbF; if(!f||f.busy) break; const inp=document.createElement("input"); inp.type="file"; inp.accept="image/*";
      inp.onchange=async()=>{ const f0=inp.files&&inp.files[0]; if(!f0) return; const c=await cropImg(f0,{ratio:4/5,max:1350}); if(!c) return;
        try{ const b=await shrinkImg(c,1350); f.tPrev=URL.createObjectURL(b); f.busy="上傳中…"; dbReform();
          const url=(HB_ON&&await hbImgUrl("debut_"+Date.now().toString(36)+".jpg",b))||await new Promise(res=>{ const rd=new FileReader(); rd.onload=()=>res(rd.result); rd.readAsDataURL(b); });
          const ti=+(t.dataset.i||0); if(ti>0){ f.tx[ti-1]=url; f.txP[ti-1]=f.tPrev; f.tPrev=f.tPrev0||""; } else { if(f.teaser&&f.teaser!==url) mediaDel(f.teaser); f.teaser=url; f.tPrev0=f.tPrev; } f.busy=""; dbReform(); }catch(e){ f.busy=""; dbReform(); toast("這張圖讀不出來"); } }; pickClick(inp); break; }
    case "dbFy": { dbKeep(); const f=ui.dbF; if(!f||f.busy) break; const k=t.dataset.k; fairyPickFile(async file=>{ f.busy="結尾妖精上傳中…"; dbReform(); try{ const rec=await fairyUploadFile(file); if(rec){ const pr=prOf(f); pr.fy={...(pr.fy||{}),[k]:rec}; } }catch(e){ toast("上傳失敗，請再試一次"); } f.busy=""; dbReform(); }); break; }
    case "dbMvt": case "dbMv": case "dbMv2": { dbKeep(); const f=ui.dbF; if(!f||f.busy) break; const isT=a==="dbMvt", is2=a==="dbMv2"; const inp=document.createElement("input"); inp.type="file"; inp.accept="video/*";
      inp.onchange=async()=>{ const file=inp.files&&inp.files[0]; if(!file) return; 
        f.busy="影片處理中…"; dbReform();
        try{ const id="vv"+Date.now().toString(36), th=await videoThumb(file); let thumb=null;
          /* 先真的傳上雲端才算放好（大影片不存進手機的資料庫：iPhone 會因為記憶體不夠重新整理，檔案就不見了） */
          if(th&&th.blob){ thumb=id+"_t"; await MDB.put(thumb,th.blob,true); if(!await hbUpload(thumb,th.blob)) thumb=null; }
          const pr=document.querySelector(".db-busy"); hbUploadBig.on=p=>{ f.busy=`影片上傳中… ${p}%`; const e=document.querySelector(".db-busy"); if(e) e.textContent=f.busy; }; f.busy="影片上傳中…"; if(pr) pr.textContent=f.busy;
          const ok=await hbUpload(id,file); hbUploadBig.on=null; if(!ok){ f.busy=""; dbReform(); return; }
          memBlobs[id]=file;
          const v={mid:id,thumb,dur:th&&th.dur||0}, pv=th&&th.blob?URL.createObjectURL(th.blob):""; if(is2){ const pr=prOf(f); pr.mv2=v; pr.mv2P=pv; } else if(isT){ f.mvt=v; f.mtPrev=pv; } else { f.mv=v; f.mPrev=pv; f.au=""; mvAudioUpload(file).then(a=>{ if(ui.dbF===f&&f.mv===v) f.au=a; }); } f.busy=""; dbReform(); }catch(e){ f.busy=""; dbReform(); toast("這部影片讀不出來，換一部試試"); } }; pickClick(inp); break; }
    case "dbTsr": { const x=getDebut().find(y=>y.id===t.dataset.v); if(!x||!x.teaser) break; setLayer(`<div class="ph-view" data-a="tCloseLayer" role="dialog" aria-label="Teaser 照片"><button class="ph-x" data-a="tCloseLayer" aria-label="關閉">${XI}</button><img src="${esc(x.teaser)}" alt=""></div>`,"photo"); break; }
    case "dbMvPlay": playVideo(t.dataset.v); break;
    case "dbKind": { dbKeep(); const f=ui.dbF; if(!f) break; f.kind=t.dataset.v==="group"?"group":"solo"; debutForm(); break; }
    case "dbRel": { dbKeep(); const f=ui.dbF; if(!f) break; f.rtype=f.rtype===t.dataset.v?"":t.dataset.v; debutForm(); break; }
    case "dbCo": { dbKeep(); const f=ui.dbF; if(!f) break; f.co=f.co===t.dataset.v?"":t.dataset.v; debutForm(); break; }
    case "dbMemAdd": { dbKeep(); const f=ui.dbF; if(!f||(f.mems||[]).length>=DB_MAXM) break; f.mems.push({name:"",acc:""}); debutForm(); setTimeout(()=>{ const e=document.getElementById("dbMn"+(f.mems.length-1)); if(e) e.focus(); },60); break; }
    case "dbMemDel": { dbKeep(); const f=ui.dbF; if(!f) break; f.mems.splice(+t.dataset.i,1); if(!f.mems.length) f.mems.push({name:"",acc:""}); debutForm(); break; }
    /* 已核准（預告中）：團已經建好了，只能改公司、生日、出道日 */
    case "dbPreEdit": { const x=getDebut().find(y=>y.id===t.dataset.v); if(!x||x.status!=="pre") break; const grp=x.kind==="group";   /* 預告中：跳進同一個申請頁（填好的資料都帶進去） */
      ui.dbF={editId:x.id,pre:true,kind:grp?"group":"solo",name:grp?(x.me||""):x.name,gname:grp?x.name:"",bd:x.bd||"",song:x.song||"",rtype:x.rtype||"",co:x.co||"",date:ymdIn(x.day),mems:grp?(x.mems||[]).map(m=>({name:m.name,acc:m.email,bd:m.bd||""})):[{name:"",acc:""}],teaser:x.teaser||"",tx:[...(x.teasers||[])],txP:[],mv:x.mv,mvt:x.mvt,pr:promoLoad(x.pr),busy:""}; debutForm(); break; }
    
    
    
    case "dbAdmEdit": { const x=getDebut().find(y=>y.id===t.dataset.v); if(!x) break; const grp=x.kind==="group";   /* 管理員修改申請 */
      ui.dbF={editId:x.id,kind:grp?"group":"solo",name:grp?(x.me||""):x.name,gname:grp?x.name:"",bd:x.bd||"",song:x.song||"",rtype:x.rtype||"",co:x.co||"",date:ymdIn(x.day),mems:grp?(x.mems||[]).map(m=>({name:m.name,acc:m.email,bd:m.bd||""})):[{name:"",acc:""}],teaser:x.teaser||"",tx:[...(x.teasers||[])],txP:[],mv:x.mv,mvt:x.mvt,pr:promoLoad(x.pr),busy:""}; debutForm(); break; }
    case "debutOk": { dbKeep(); const f=ui.dbF||{}, ed=f.editId?getDebut().find(y=>y.id===f.editId):null, em=ed?ed.email:myEmail(), grp=f.kind==="group"; if(!em) break; if(f.busy){ toast(f.busy); break; }
      if(f.pre){ const L=getDebut(), x=L.find(y=>y.id===f.editId); if(!x||x.status!=="pre"){ toast("這筆已經不是預告中了"); break; }
        { const x0=getDebut().find(y=>y.id===f.editId)||{}, mn=dayStart(Math.min(Date.now()+PRE_MIN,x0.day||Infinity)), d0=ymdTs(f.date); if(!d0||d0<mn) f.date=ymdIn(mn); }
        const sg=(f.song||"").trim(), day=ymdTs(f.date); if(!sg){ toast("請輸入出道曲"); break; } if(!f.rtype){ toast("請選擇發行型態"); break; } if(!f.co){ toast("請選擇公司"); break; } 
        if(!f.teaser&&(f.tx||[]).some(Boolean)){ const k=f.tx.findIndex(Boolean); f.teaser=f.tx[k]; f.tx[k]=null; } if(!f.teaser){ toast("請至少放一張 Teaser 照片"); break; } if(!f.mv){ toast("請放上 MV"); break; } if(!f.mvt){ toast("請放上 MV Teaser"); break; } { const pe=promoCheck(f); if(pe){ toast(pe); break; } }
        const oldMv=x.mv&&x.mv.mid, oldMvt=x.mvt&&x.mvt.mid, oldT=x.teaser, moved=day!==x.day;
        Object.assign(x,{song:sg,rtype:f.rtype,co:f.co,bd:f.bd||x.bd||"",teaser:f.teaser,teasers:(f.tx||[]).filter(Boolean),mv:f.mv,mvt:f.mvt,day,pr:promoClean(f.pr),edited:Date.now()}); if(grp) (x.mems||[]).forEach((m,k)=>{ const b=((f.mems||[])[k]||{}).bd; if(b) m.bd=b; });
        S.set(K.debut,L);
        if(x.gid){ saveRoster(r=>{ const g=(r.groups||[]).find(y=>y.id===x.gid); if(g){ g.co=f.co; if((x.pr||{}).intro) g.intro=x.pr.intro; } }); const g=groupOf(x.gid)||GROUPS.find(y=>y.id===x.gid); if(g){ g.co=f.co; if((x.pr||{}).intro) g.intro=x.pr.intro; }
          if(oldT!==x.teaser){ const G={...(S.get(K.gPhoto,{})||{})}; if(G[x.gid]===oldT){ G[x.gid]=x.teaser; S.set(K.gPhoto,G); } if(x.mid){ const M={...(S.get(K.mPhoto,{})||{})}; if(M[x.mid]===oldT){ M[x.mid]=x.teaser; S.set(K.mPhoto,M); } } }
          const swap=(o,n)=>{ if(!o||!n||o===n.mid) return; S.set(K.vods,(S.get(K.vods,[])||[]).map(v=>v.mid===o?{...v,mid:n.mid,thumb:n.thumb,dur:n.dur||v.dur}:v)); }; swap(oldMv,x.mv); swap(oldMvt,x.mvt);
          if((x.pr||{}).fan){ const FD={...(S.get(K.fandom,{})||{})}; FD[x.gid]=x.pr.fan; S.set(K.fandom,FD); } }
        { const md=v=>{ const m=/^\d{4}-(\d{2})-(\d{2})$/.exec(v||""); return m?`${+m[1]}-${+m[2]}`:""; }, B={...(S.get(K.bdays,{})||{})}; let ch=false; dbEms(x).forEach(e=>{ const mid=(x.mids||{})[e]||(e===x.email?x.mid:""), b=md(e===x.email?x.bd:((x.mems||[]).find(m=>m.email===e)||{}).bd); if(mid&&b){ B[mid]=b; ch=true; } }); if(ch) S.set(K.bdays,B); }
        if(moved&&x.annId) feedPush({kind:"core",text:`📢 「${x.name}」出道日改到 ${mdTxt(day)}`},"all");
        ui.dbF=null; applyRoster(); layer.innerHTML=""; render(); toast("已儲存"); break; }
      const n=(f.name||"").trim(), gn=(f.gname||"").trim(), nm=grp?gn:n; if(grp&&!gn){ toast("請輸入團名"); break; } if(!n){ toast(grp?"請輸入你的藝名":"請輸入藝名"); break; } if(nameBlock(nm)||(grp&&nameBlock(n))) break;
      if(!f.bd){ toast("請填生日"); break; } const song=(f.song||"").trim(); if(!song){ toast("請輸入出道曲"); break; } if(!f.rtype){ toast("請選擇發行型態"); break; } if(!f.co){ toast("請選擇公司"); break; }
      let mems=[]; if(grp){ const rows=(f.mems||[]).map(x=>({name:(x.name||"").trim(),acc:normAcct(x.acc),bd:x.bd||""})).filter(x=>x.name||x.acc); if(!rows.length){ toast("團體至少要再加一位成員"); break; }
        const bad=rows.find(x=>!x.name||!x.acc); if(bad){ toast(bad.name?`請填「${bad.name}」的帳號`:"請填成員的藝名"); break; }
        const nb=rows.find(x=>!x.bd); if(nb){ toast(`請填「${nb.name}」的生日`); break; }
        const nf=rows.find(x=>!ACCOUNTS[x.acc]); if(nf){ toast(`找不到帳號「${nf.acc}」`); break; }
        const self=rows.find(x=>x.acc===em); if(self){ toast("自己不用再加一次"); break; }
        const art=rows.find(x=>ACCOUNTS[x.acc].member||ACCOUNTS[x.acc].role==="artist"); if(art){ toast(`「${art.acc}」已經是藝人了`); break; }
        const busy=rows.find(x=>getDebut().some(y=>y.id!==f.editId&&(y.status==="wait"||y.status==="pre")&&dbEms(y).includes(x.acc))); if(busy){ toast(`「${busy.acc}」已經在別的出道申請裡`); break; }
        const accs=rows.map(x=>x.acc), names=[n,...rows.map(x=>x.name)].map(x=>x.toLowerCase()); if(new Set(accs).size!==accs.length){ toast("有重複的帳號"); break; } if(new Set(names).size!==names.length){ toast("成員的藝名不能重複"); break; }
        mems=rows.map(x=>({name:x.name,email:x.acc,bd:x.bd})); }
      if(!f.teaser&&(f.tx||[]).some(Boolean)){ const i=f.tx.findIndex(Boolean); f.teaser=f.tx[i]; f.tPrev0=(f.txP||[])[i]||""; f.tx[i]=null; if(f.txP) f.txP[i]=""; } if(!f.teaser){ toast("請至少放一張 Teaser 照片"); break; } if(!f.mv){ toast("請放上 MV"); break; } if(!f.mvt){ toast("請放上 MV Teaser"); break; } { const pe=promoCheck(f); if(pe){ toast(pe); break; } }
      { const mn=dayStart(Date.now()+PRE_MIN), d0=ymdTs(f.date); if(!d0||d0<mn) f.date=ymdIn(mn); } const dday=ymdTs(f.date);
      const taken=x=>{ const low=x.toLowerCase(); return GROUPS.some(g=>g.name.toLowerCase()===low)||Object.values(MEMBERS).some(m=>!m.official&&String(m.name).toLowerCase()===low)||getDebut().some(y=>y.id!==f.editId&&(y.status==="wait"||y.status==="pre")&&(y.name.toLowerCase()===low||String(y.me||"").toLowerCase()===low||(y.mems||[]).some(m=>m.name.toLowerCase()===low))); };
      const tk=[nm,...(grp?[n,...mems.map(x=>x.name)]:[])].find(taken); if(tk){ toast(`已經有「${tk}」這個名字了`); break; }
      if(ed){ const L=getDebut(), x=L.find(y=>y.id===ed.id); if(!x) break; Object.assign(x,{kind:grp?"group":"solo",name:nm,bd:f.bd,song,rtype:f.rtype,co:f.co,teaser:f.teaser,teasers:(f.tx||[]).filter(Boolean),mv:f.mv,mvt:f.mvt,day:dday,pr:promoClean(f.pr),edited:Date.now()}); if(grp){ x.me=n; x.mems=mems; } else { delete x.me; delete x.mems; } S.set(K.debut,L); ui.dbF=null; layer.innerHTML=""; render(); toast("已修改"); break; }
      S.set(K.debut,[...getDebut(),{id:"db"+Date.now(),email:em,kind:grp?"group":"solo",name:nm,bd:f.bd,song,rtype:f.rtype,...(f.au?{au:f.au}:{}),...(grp?{me:n,mems}:{}),co:f.co,g:Math.floor(Math.random()*8),ts:Date.now(),status:"wait",teaser:f.teaser,teasers:(f.tx||[]).filter(Boolean),mv:f.mv,mvt:f.mvt,day:dday,pr:promoClean(f.pr)}]); ui.dbF=null; layer.innerHTML=""; render(); toast("已送出，等管理員核准"); break; }
    case "debutCancel": { const x0=getDebut().find(x=>x.id===t.dataset.v); if(x0&&x0.teaser) mediaDel(x0.teaser); S.set(K.debut,getDebut().filter(x=>x.id!==t.dataset.v)); layer.innerHTML=""; render(); toast("已撤回申請"); break; }
    case "dbOk": { const L=getDebut(), x=L.find(y=>y.id===t.dataset.v); if(!x||x.status!=="wait") break; const n=x.name;
      if(GROUPS.some(g=>g.name===n)||L.some(y=>y!==x&&y.status==="pre"&&y.name===n)){ toast("已經有這個名字了"); break; } const miss=dbEms(x).find(e=>!ACCOUNTS[e]); if(miss){ toast(`找不到帳號「${miss}」`); break; } const am=dbEms(x).find(e=>ACCOUNTS[e].member); if(am){ toast(`「${am}」已經是藝人了`); break; }
      dbApprove(x); S.set(K.debut,L); applyRoster(); render(); toast(`已核准「${n}」，${mdTxt(x.day)} 出道`); break; }   /* 核准＝進入出道預告，出道日到了才變成藝人（js/25） */
    case "dbLater": { const L=getDebut(), x=L.find(y=>y.id===t.dataset.v), v=ymdTs((document.getElementById("dbLaterIn")||{}).value); if(!x||x.status!=="pre") break; if(!v||v<=x.day){ toast("只能延到更晚的日期"); break; }
      x.day=v; S.set(K.debut,L); applyRoster(); feedPush({kind:"core",text:`📢 「${x.name}」出道延期到 ${mdTxt(v)}`},"all"); layer.innerHTML=""; render(); toast(`延到 ${mdTxt(v)} 了`); break; }
    case "dbWipe": { const L=getDebut(), x=L.find(y=>y.id===t.dataset.v); if(!x) break; ask(`刪除「${x.name}」的出道申請？\n預告公告、通知都會一起收回，當作沒發生過，本人可以重新申請。`,()=>{ dbWipe(x); S.set(K.debut,L); applyRoster(); render(); toast("已刪除"); }); break; }
    case "dbNo": { const L=getDebut(), x=L.find(y=>y.id===t.dataset.v); if(!x) break; ask(`不核准「${x.name}」的出道申請嗎？`,()=>{ x.status="no"; x.done=Date.now(); S.set(K.debut,L); feedPush({kind:"core",self:true,text:`「${x.name}」的出道申請這次沒有通過`},"u:"+x.email); render(); }); break; }
    case "rsType": ui.rsType=t.dataset.v; { const y=window.scrollY, n=(document.getElementById("rgName")||{}).value; render(); window.scrollTo(0,y); const i=document.getElementById("rgName"); if(i&&n) i.value=n; } break;
    case "rgAdd": { const solo=ui.rsType==="solo", n=document.getElementById("rgName").value.trim(); if(!n){ toast(solo?"請輸入藝名":"請輸入團名"); break; } if(GROUPS.some(g=>g.name===n)){ toast("已經有這個名字了"); break; }
      const id="g"+Date.now(), gc=ui.rsColor??0, g={id,name:n,g:gc,isNew:true,...(solo?{solo:true}:{})}, off={name:n+" 官方",group:id,g:gc,official:true};
      if(solo){ const mid="m"+Date.now(), m={name:n,group:id,g:gc}, em=((document.getElementById("rsAcc")||{}).value||"").trim().toLowerCase(), bd=((document.getElementById("rsBday")||{}).value||"").trim();
        if(bd&&/^\d{1,2}-\d{1,2}$/.test(bd)){ const all=S.get(K.bdays,{}); all[mid]=bd; S.set(K.bdays,all); }
        saveRoster(r=>{ r.groups.push(g); r.members[id+"_o"]=off; r.members[mid]=m; }); GROUPS.push(g); MEMBERS[id+"_o"]=off; MEMBERS[mid]=m; if(em) bindArtist(em,mid);
        ui.rsType="group"; render(); toast(`已新增 SOLOIST「${n}」`); break; }
      saveRoster(r=>{ r.groups.push(g); r.members[id+"_o"]=off; }); GROUPS.push(g); MEMBERS[id+"_o"]=off; ui.rsGroup=id; render(); toast(`已新增「${n}」`); break; }
    case "rmAdd": { const n=document.getElementById("rmName").value.trim(), em=(document.getElementById("rmEmail").value||"").trim().toLowerCase(), gid=groupOf(ui.rsGroup)?ui.rsGroup:(GROUPS[0]||{}).id;
      if(!gid) break; if(!n){ toast("請輸入藝人名稱"); break; }
      const bd=((document.getElementById("rmBday")||{}).value||"").trim(), id="m"+Date.now(), m={name:n,group:gid,g:groupOf(gid).g};
      if(bd&&/^\d{1,2}-\d{1,2}$/.test(bd)){ const all=S.get(K.bdays,{}); all[id]=bd; S.set(K.bdays,all); }
      saveRoster(r=>{ r.members[id]=m; }); MEMBERS[id]=m; const ok=em&&bindArtist(em,id); render(); toast(`已新增 ${n}`); break; }
    case "rmAcc": { const id=t.dataset.v; ui.rmAccFor=id; tieModal(`綁定 ${esc(artName(id,"feed"))} 的粉絲帳號`,`<span class="fs-f-lab">藝人原本的粉絲帳號</span><select id="raEm" class="a-nick-in">${fanAccOpts()}</select>`,`<button class="t-mbtn main" data-a="rmAccOk">綁定</button><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break; }
    case "rmAccOk": { const em=(document.getElementById("raEm").value||"").trim().toLowerCase(), id=ui.rmAccFor; if(!em){ toast("請選一個粉絲帳號"); break; }
      if(!bindArtist(em,id)){ toast("找不到這個粉絲帳號"); break; } layer.innerHTML=""; render(); toast(`已綁定 ${acctUser(em)}`); break; }
    case "rmDel": { const id=t.dataset.v; ask(`要刪除 ${MEMBERS[id].name} 嗎？他的帳號會變回一般粉絲帳號。`,()=>{ saveRoster(r=>{ delete r.members[id]; Object.keys(r.accounts).forEach(e=>{ if(r.accounts[e].member===id){ const x={...r.accounts[e],role:"fan"}; delete x.member; r.accounts[e]=x; } }); }); delete MEMBERS[id]; Object.keys(ACCOUNTS).forEach(e=>{ if(ACCOUNTS[e].member===id){ const x={...ACCOUNTS[e],role:ACCOUNTS[e].role==="admin"?"admin":"fan"}; delete x.member; ACCOUNTS[e]=x; if(HB_ON) hbSetProfile(e,{role:x.role,member:null}); } }); render(); toast("已刪除"); }); break; }
    case "rgDel": { const id=t.dataset.v; if(Object.entries(MEMBERS).some(([k,m])=>m.group===id&&!m.official)){ toast("請先刪除這個團的成員"); break; }
      ask(`要刪除「${groupOf(id).name}」嗎？`,()=>{ saveRoster(r=>{ r.groups=r.groups.filter(g=>g.id!==id); delete r.members[id+"_o"]; }); const i=GROUPS.findIndex(g=>g.id===id); if(i>=0) GROUPS.splice(i,1); delete MEMBERS[id+"_o"]; S.set(K.fanArtists,followed().filter(x=>x!==id)); render(); toast("已刪除"); }); break; }
    case "meShop": ui.shopTab=t.dataset.v; go("fan",null,"shop"); window.scrollTo(0,0); break;
    case "acctInfo": { const s2=session()||{}; const ac2=ACCOUNTS[s2.email]||{}, rl=ac2.role||s2.role; tieModal("帳號設定",`<span class="info-row"><em>登入帳號</em>${esc(acctUser(s2.email))}</span><span class="info-row"><em>身分</em>${rl==="admin"?"管理員":rl==="artist"?"藝人":"粉絲"}</span><span class="info-row"><em>密碼</em>${rl==="admin"?"到 管理 → 人員 → 帳號 可以重設":"忘記密碼請找管理員"}</span>`,`<button class="t-mbtn main" data-a="tCloseLayer">知道了</button>`); break; }
    case "cmDel": { (ui.composeMedia||[]).splice(+t.dataset.i,1); const y=window.scrollY; render(); window.scrollTo(0,y); break; }
    case "playVideo": if(t.classList.contains("pm-video")) pmInline(t,true); else playVideo(t.dataset.mid); break;
    case "wish": { const id=t.dataset.m, all=S.get(K.bdayWish,{}), k=wishKey(id), w=all[k]||{n:0}; if(w.mine) break; w.n++; w.mine=true; all[k]=w; S.set(K.bdayWish,all);
      logSelf("core",id,`你送了生日祝福給 ${artName(id,"feed")} 🎂`); const b=t.getBoundingClientRect(); confetti(b.left+b.width/2,b.top); const y=window.scrollY; render(); window.scrollTo(0,y); if(layer.querySelector(".mf-sh")) openSched(); toast("祝福送出了 🎂"); break; }
    case "passDay99": { const all=subs(), r2=all[t.dataset.m]; if(!r2) break; const nowT=Date.now(); r2.since=nowT-99*DAY-60e3; if(r2.expires<nowT+5*DAY) r2.expires=nowT+5*DAY; if(r2.periods&&r2.periods.length) r2.periods[r2.periods.length-1].start=Math.min(r2.periods[r2.periods.length-1].start,r2.since); S.set(K.tieSubs,all);
      const d=S.get(K.msDone,{}); d[t.dataset.m]=(d[t.dataset.m]||[]).filter(x=>x<100); S.set(K.msDone,d); render(); toast("示範：已經連續訂閱第 100 天，去 TIE 看看紀念日訊息","去看看","openChatFromToast"); ui.toastMember=t.dataset.m; break; }
    case "gacha": { const n=+t.dataset.v; ask(`${n===1?"單抽":"十連抽"} PHOTOCARD，使用 ${fmt(GC_COST(n))} 積分。`,()=>{ const r=drawCards(n); if(r.err){ toast(r.err); return; } gcStart(r); },{title:"抽卡",ok:"抽！",danger:false}); break; }
    case "gcTap": gcTap(); break;
    case "gcLaunch": gcLaunch(); break;
    case "gcSkip": gcSum(); break;
    case "gcAgain": { const r=drawCards(+t.dataset.v); if(r.err){ toast(r.err); break; } gcStart(r); break; }
    case "gdSnd": { S.set(K.gachaSnd,!sfxOn()); t.textContent=sfxOn()?"🔊":"🔈"; if(sfxOn()) sfx("flip"); break; }
    case "poolMiss": ui.poolMiss=t.dataset.v==="1"; openPool(); break;
    case "cbTab": segSwitch(t,()=>{ ui.cbTab=t.dataset.v; },(ui.cbTab||"book")==="book"&&t.dataset.v==="log"?1:-1); break;
    case "cardRep": { const on=S.get(K.repCard,"")===t.dataset.v; S.set(K.repCard,on?"":t.dataset.v); toast(on?"已取消代表卡":"設為代表卡了，會顯示在 ME"); openCardView(t.dataset.v); if(route().tab==="me"||route().p==="cards") lsRerender(); break; }
    case "cardGyro": cardGyro(); break;
    case "gdDone": { const got=ui.drawGot||[], nw=ui.drawFresh?ui.drawFresh.size:0; layer.innerHTML=""; lsRerender(); const r3=got.filter(c=>c.endsWith(":3")).length; toast(r3?`收進卡冊了，有 ${r3} 張流光卡 ✨`:nw?`收進卡冊了，新卡 ${nw} 張 🃏`:"收進卡冊了 🃏"); break; }
    case "cardView": openCardView(t.dataset.v); break;
    case "openCards": navTo("#/fan/core?p=cards"); window.scrollTo(0,0); break;
    case "svVote": { if(3-svToday()<=0){ toast("今天的票投完了，明天再來"); break; } const k=new Date().toDateString(), mine=S.get(K.svMine,{}); S.set(K.svMine,{day:k,n:(mine.day===k?mine.n:0)+1});
      const vv=S.get(K.svVotes,{}); vv[t.dataset.v]=svVotes()[t.dataset.v]+1; S.set(K.svVotes,vv); const tr=TRAINEES.find(x=>x.id===t.dataset.v); const b=t.getBoundingClientRect(); confetti(b.left+b.width/2,b.top);
      const y=window.scrollY; render(); window.scrollTo(0,y); toast(`投給 ${tr.name} 了！今天還有 ${3-svToday()} 票`); break; }
    case "svToggle": S.set(K.svOpen,!S.get(K.svOpen,false)); { const y=window.scrollY; render(); window.scrollTo(0,y); } toast(S.get(K.svOpen,false)?"選秀宇宙已開放，粉絲在 FEST 看得到了":"選秀宇宙已關閉"); break;
    case "svPreview": SS.set({...session(),role:"fan",member:null}); navTo("#/fan/core?p=survival"); break;
    case "chantStart": chantStart(); break;
    case "chantClose": { chantStop(); const b=document.getElementById("chant"); if(b){ b.hidden=true; b.innerHTML=""; } break; }
    case "focSeg": ui.focSeg=t.dataset.v; render(); window.scrollTo(0,0); break;
    case "focSegBack": ui.focSeg=null; render(); window.scrollTo(0,0); break;
    case "msGate": msGate(t.dataset.g); break;
    case "msiClose": { const el=layer.querySelector(".msi"); if(el){ el.classList.add("out"); setTimeout(()=>{ if(layer.querySelector(".msi.out")) layer.innerHTML=""; },260); } break; }
    case "msIntro": { const g=t.dataset.g; layer.innerHTML=""; setTimeout(()=>openMsIntro(g),160); break; }
    case "msJoin": { const g=t.dataset.g; layer.innerHTML=""; ui.prodTab="det"; ui.prodPlan=null; ui.pQty=1; openProd("ms:"+g); break; }
    case "pwOpen": openPwSheet(t.dataset.id); break;
    case "pwEye": { const i=document.getElementById("pwIn"); if(i){ i.type=i.type==="password"?"text":"password"; t.classList.toggle("on",i.type==="text"); } break; }
    case "pwGo": pwTry(t.dataset.id); break;
    case "spoil": ui.spoil=ui.spoil||new Set(); ui.spoil.add(t.dataset.id); { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "aNick": { const mid=session().member||uniMe();
      tieModal("Membership 粉絲的愛稱",`買了 ${esc(groupOf(MEMBERS[mid].group).name)} Membership 的粉絲，在你這裡會顯示這個愛稱。<span class="fs-f-lab">愛稱</span><input id="aNickIn" class="a-nick-in" maxlength="12" placeholder="輸入文字" value="${esc(artistNick(mid))}">`,`<button class="t-mbtn main" data-a="aNickSave">儲存</button><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break; }
    case "aNickSave": { const v=(document.getElementById("aNickIn")||{value:""}).value.trim(); const all=S.get(K.artistNick,{}); all[session().member||uniMe()]=v; S.set(K.artistNick,all); layer.innerHTML=""; render(); toast(v?`愛稱設定為「${v}」`:"已清除愛稱"); break; }
    case "tNickTk": { const i=document.getElementById("win"); if(!i) break; const a=i.selectionStart??i.value.length, b=i.selectionEnd??a; i.value=i.value.slice(0,a)+NICK_TK+i.value.slice(b); ui.wDraft=i.value; i.focus(); const p=a+NICK_TK.length; i.setSelectionRange(p,p); const sb=document.getElementById("wsend"); if(sb) sb.classList.add("on"); break; }
    case "tPhoto": openPhoto(t.dataset.mid,t.dataset.ts); break;
    case "tVoice": playVoice(t.dataset.mid); break;
    
    case "lsGroup": ui.lsGid=t.dataset.v; lsRerender(); break;
    case "lsSample": { const g=groupOf(ui.lsGid||GROUPS[0].id), c=GRADS[g.g%GRADS.length]; if(lsLoad(LS3D.sample(t.dataset.v,c[0],c[1],ini(g.name)))){ lsRerender(); toast("辨識完成，可以旋轉看看 ✨"); } break; }
    case "lsMode": { const d=ui.lsDraft; if(!d) break; d.ds.mode=t.dataset.v; lsRerender(); break; }
    case "lsGlow": { const d=ui.lsDraft; if(!d) break; d.ds.glow=t.dataset.v; document.querySelectorAll('[data-a="lsGlow"]').forEach(b=>b.classList.toggle("on",b===t)); const el=document.querySelector('.ls-box[data-ls="draft"]'); if(el&&el._ls) el._ls.set("glow",t.dataset.v); break; }
    case "lsCancel": ui.lsDraft=null; lsRerender(); break;
    case "lsPublish": { const d=ui.lsDraft; if(!d) break; const gid=ui.lsGid||GROUPS[0].id, g=groupOf(gid); const all=getSticks(); all[gid]={...d.ds,updatedAt:Date.now()}; S.set(K.sticks,all); ui.lsDraft=null;
      if(followed().includes(gid)){ const list=S.get(K.notifs,[]); list.unshift({id:"n"+Date.now(),kind:"core",direct:true,group:gid,text:`${g.name} 的 3D 官方應援棒上線了！到 FEST 舉起來看看 ✨`,ts:Date.now()}); S.set(K.notifs,list.slice(0,100)); S.set(K.unread,"1"); }
      lsRerender(); toast(`已發布 ${g.name} 的 3D 應援棒`); break; }
    case "lsRemove": ask("要把這團的應援棒恢復成預設款嗎？",()=>{ const all=getSticks(); delete all[ui.lsGid||GROUPS[0].id]; S.set(K.sticks,all); lsRerender(); toast("已恢復預設款"); }); break;
    case "coreStick": ui.coreStick=t.dataset.v; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "focPreset": ui.focStage=t.dataset.v; { const i=document.getElementById("focStage"); if(i) i.value=t.dataset.v; } layer.innerHTML=""; document.querySelectorAll('[data-a="focPreset"]').forEach(b=>b.classList.toggle("on",b.dataset.v===t.dataset.v)); break;
    case "focSave": { const st=document.getElementById("focStage").value.trim(), dl=((document.getElementById("focDl")||{}).value||getSched().deadline||"").trim(), nt=((document.getElementById("focNotice")||{}).value||getSched().notice||"").trim();
      if(!st||!dl){ toast("請填寫階段名稱和結算時間"); break; }
      S.set(K.sched,{stage:st,deadline:dl,notice:nt,updatedAt:Date.now(),wk:curWeek()}); ui.focStage=null;
      const list=S.get(K.notifs,[]); list.unshift({id:"n"+Date.now(),kind:"core",direct:true,text:`全站賽程更新為【${st}】，結算時間 ${dl}`,ts:Date.now()}); S.set(K.notifs,list.slice(0,100)); S.set(K.unread,"1");
      render(); toast("賽程已同步到藝人端與粉絲端 🏆"); break; }
    default: return CLICK_NO;
  } }

/* =========================================================
   點擊動作（社群、相簿、SHOP）：從 10-點擊互動.js 的大 switch 搬出來，內容沒改
   回傳 CLICK_NO＝這裡沒有這個動作，交給下一份
   ========================================================= */
function clickCm(a,t,e,r){ switch(a){
    case "openEvent": ui.feedTab=t.dataset.ek==="spot"?"spot":"party"; ui.focusEv=t.dataset.ev; go("fan"); break;
    case "reserve": { const on=toggleReserve(t.dataset.id); render(); toast(on?"已預約，活動前會提醒你 💜":"已取消預約"); break; }
    case "heart": if(ui.heartPtr){ ui.heartPtr=false; break; } sendHeart(t.dataset.id); break;
    case "startLive": { const title=(document.getElementById("ltitle")||{value:""}).value.trim(); ui.hostReply=null; const {l:nl,reached}=startLive(session().member,title); ui.lTitle=""; ui.lDraft=""; render(); window.scrollTo(0,0);
      toast(reached?"開播了！粉絲收到通知了":"開播了！"); break; }
    case "delEvent": ask("確定要刪除這個活動嗎？",()=>{ deleteEvent(t.dataset.id); render(); toast("已刪除"); }); break;
    case "shOpen": ui.srch={key:t.dataset.k,q:""}; render(); { const i=document.getElementById("shq"); if(i) i.focus(); } break;
    case "shClear": ui.srch.q=""; render(); { const i=document.getElementById("shq"); if(i) i.focus(); } break;
    case "shClose": ui.srch=null; ui.scrollChat=!!document.querySelector(".t-msgs"); render(); break;
    case "toFan": switchTo("fan"); break;
    case "toArtist": switchTo("artist"); break;
    case "toAdmin": switchTo("admin"); break;
    case "ag": ui.adminGroup=t.dataset.v; render(); break;
    case "rpRemove": resolveReport(t.dataset.id,"remove"); render(); toast("已刪除內容"); break;
    case "mute": { const key=t.dataset.v, h=t.dataset.h, all=getMutes(); all[key]=h==="ban"?{ban:true,ts:Date.now()}:{until:Date.now()+(+h)*3600e3,ts:Date.now()}; S.set(K.mutes,all); render(); toast(h==="ban"?"已停權這個帳號":`已禁言 ${+h>=168?"7 天":"24 小時"}`); break; }
    case "unmute": { const all=getMutes(); delete all[t.dataset.v]; S.set(K.mutes,all); render(); toast("已解除"); break; }
    case "amDo": amApply(t.dataset.v); break;
    case "amC": { const c=S.get(K.comments,[]).find(x=>x.id===t.dataset.c); if(!c) break; admQuick({kind:"comment",commentId:c.id,postId:c.postId,text:c.text,name:c.name,by:c.by,who:c.author==="me"?"fan:me":"fan:"+c.name}); break; }
    case "amFp": { const p=S.get(K.fanPosts,[]).find(x=>x.id===t.dataset.id); if(!p) break; admQuick({kind:"fanpost",id:p.id,text:p.text,name:p.name,by:p.by,who:p.mine?"fan:me":"fan:"+(p.name||"")}); break; }
    case "liveRep": { const l=getLive(route().id); if(!l) break; const x=l.msgs.find(m=>String(m.ts)===t.dataset.ts); if(!x) break;
      if(isAdminAcct()){ admQuick({kind:"live",ref:{liveId:l.id,ts:x.ts,by:x.by},text:x.text,name:x.name,by:x.by,who:x.from==="me"?"fan:me":"fan:"+(x.name||"")}); break; }
      ask(`檢舉「${x.name||"粉絲"}」的留言：「${x.text}」？管理員會審核。`,()=>{ reportItem("live",{liveId:l.id,ts:x.ts,text:x.text,name:x.name,by:x.by,who:x.from==="me"?"fan:me":"fan:"+(x.name||"")}); toast("已送出檢舉，謝謝你"); },{title:"檢舉留言",ok:"檢舉"}); break; }
    case "hostRep": { const l=myLive(session().member), hr=ui.hostReply; if(!l||!hr) break; const x=l.msgs[hr.i]; if(!x) break;
      if(isAdminAcct()){ ui.hostReply=null; admQuick({kind:"live",ref:{liveId:l.id,ts:x.ts,by:x.by},text:x.text,name:x.name,by:x.by,who:x.from==="me"?"fan:me":"fan:"+(x.name||"")}); break; }
      ask(`檢舉「${x.name||"粉絲"}」的留言：「${x.text}」？管理員會審核。`,()=>{ reportItem("live",{liveId:l.id,ts:x.ts,text:x.text,name:x.name,who:x.from==="me"?"fan:me":"fan:"+(x.name||"")}); ui.hostReply=null; render(); toast("已送出檢舉"); },{title:"檢舉留言",ok:"檢舉"}); break; }
    case "tieRep": { const w=getWhispers().find(x=>x.id===t.dataset.id); if(!w) break; const mid=session().member, sh=fanShown(w,mid);
      if(isAdminAcct()){ admQuick({kind:"tie",ref:{wid:w.id,mid,by:w.by},text:w.text,name:w.name||fanAlias(fanKey(w)),by:w.by,who:fanKey(w)}); break; }
      ask(`檢舉${sh.name?"「"+sh.name+"」":"這位粉絲"}傳來的訊息：「${w.text}」？管理員會審核。`,()=>{ reportItem("tie",{wid:w.id,mid,text:w.text,name:w.name||fanAlias(fanKey(w)),who:fanKey(w)}); toast("已送出檢舉"); },{title:"檢舉訊息",ok:"檢舉"}); break; }
    case "rpDismiss": resolveReport(t.dataset.id,"dismiss"); render(); toast("已駁回檢舉"); break;
    case "hide": { const p=S.get(K.posts,[]).find(x=>x.id===t.dataset.id); setHidden(t.dataset.id,!p.hidden); render(); toast(p.hidden?"已恢復貼文":"已隱藏，粉絲看不到這則貼文了"); break; }
    case "admDel": ask("確定要永久刪除這則貼文嗎？留言也會一起刪除。",()=>{ deletePost(t.dataset.id); render(); toast("已刪除貼文"); }); break;
    case "admEndLive": ask("確定要強制關閉這場直播嗎？",()=>{ endLive(t.dataset.id); render(); toast("已將直播間切換為休息狀態"); }); break;
    case "announce": { const text=document.getElementById("atext").value.trim(); if(!text){ toast("請輸入公告內容"); break; } publishAnnounce(text); ui.aDraft=""; render(); toast("已發布，粉絲收到通知了"); break; }
    case "pinDel": { const P={...(S.get(PIN_HIDE,{})||{})}; P[t.dataset.id]=Date.now(); S.set(PIN_HIDE,P); render(); toast("已撤下置頂"); break; }
    case "annDel": { const a=getAnns().find(x=>x.id===t.dataset.id); { const G={...annGone()}; G[t.dataset.id]=Date.now(); S.set(ANN_GONE,G); } S.set(K.anns,S.get(K.anns,[]).filter(x=>x.id!==t.dataset.id)); if(a) S.set(K.notifs,getNotifications().filter(n=>!(n.kind==="system"&&n.text===a.text.slice(0,120)))); render(); toast("已撤下公告"); break; }
    case "dmNext": ui.dmIdx=(ui.dmIdx||0)+1; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "exCat": ui.exCat=t.dataset.v; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "exAll": ui.exAll=!ui.exAll; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "gOpen": openGroup(t.dataset.v); break;
    case "cmGo": { const r=route(); if(!r.id) break; layer.innerHTML=""; if(t.dataset.v==="meEdit") ui.meDraft=null; if(t.dataset.v==="write") ui.cwHide=false; navTo(grpHash(r.id,t.dataset.v)); window.scrollTo(0,0); break; }
    case "cmMore": openCmMore(route().id); break;
    case "cmFab": openCmFab(route().id); break;
    case "aFab": openArtFab(); break;
    case "forgotPw": openForgot(); break;
    case "artNotifs": openArtNotifs(); break;
    
    case "mediaNmOk": { const mid=session().member, gid=MEMBERS[mid]&&MEMBERS[mid].group, v=((document.getElementById("mediaNmIn")||{}).value||"").trim(); if(!gid) break; const M=S.get(K.mediaName,{}); if(v&&v!=="LIVE・Media") M[gid]=v; else delete M[gid]; S.set(K.mediaName,M); layer.innerHTML=""; render(); toast("已更新，"+groupOf(gid).name+" 的社群都會換成新名稱"); break; }
    case "meNickEd": tieModal("名稱","",`<input id="meNickIn" class="a-nick-in" maxlength="20" placeholder="輸入文字" value="${esc(ME.name)}"><button class="t-mbtn main" data-a="meNickOk">儲存</button><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break;
    case "meNickOk": { const v=((document.getElementById("meNickIn")||{}).value||"").trim(); if(!v){ toast("名稱不能空白"); break; } if(nameBlock(v)) break; setNick(v); layer.innerHTML=""; render(); toast("已更新名稱"); break; }
    case "fgClose": if(e.target===t||t.tagName==="BUTTON") closeForgot(); break;
    case "tReplyX": ui.tReply=null; render(); break;
    case "pollNew": openPollEd(); break;
    case "pollDel": ui.composePoll=null; render(); break;
    case "pollX": layer.innerHTML=""; break;
    case "pollAdd": ui.pollDraft.opts.push({t:""}); setLayer(pollEdHtml(),"poll"); { const ins=layer.querySelectorAll(".vt-in"); if(ins.length) ins[ins.length-1].focus(); } break;
    case "pollRm": ui.pollDraft.opts.splice(+t.dataset.i,1); setLayer(pollEdHtml(),"poll"); break;
    case "pollDur": ui.pollDraft.dur=t.dataset.v; setLayer(pollEdHtml(),"poll"); break;
    case "pollOk": { const d=ui.pollDraft; if(!pollOk()) break; let end; if(d.dur==="custom"){ end=Date.parse(d.end); if(!(end>Date.now()+60e3)){ toast("結束時間要比現在晚喔"); break; } } else end=Date.now()+PL_DUR.find(x=>x[0]===d.dur)[2];
      ui.composePoll={q:d.q.trim(),opts:d.opts.filter(o=>o.t.trim()).map(o=>({t:o.t.trim(),img:o.img||""})),end,dur:d.dur,endIn:d.end}; layer.innerHTML=""; render(); break; }
    case "pollVote": { const V=S.get(K.pollVotes,{}), p=getPosts().find(x=>x.id===t.dataset.id); if(!p||!p.poll||V[p.id]!=null) break; if(Date.now()>=p.poll.end){ toast("票選已經結束了"); break; } V[p.id]=+t.dataset.i; S.set(K.pollVotes,V); { const PL=S.get(K.posts,[]), q=PL.find(x=>x.id===p.id); if(q&&q.poll){ q.poll.base=q.poll.opts.map((o,i)=>((q.poll.base&&q.poll.base[i])||0)+(i===+t.dataset.i?1:0)); S.set(K.posts,PL); } } { const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    case "fabClose": if(e.target===t||t.tagName==="BUTTON") closeFab(); break;
    case "aWrite": { const v=ART_W[t.dataset.v]?t.dataset.v:"all"; ui.composeVis=v; ui.composeText=""; ui.composeMedia=[]; ui.composePw=""; ui.composeColor=null; layer.innerHTML=""; navTo("#/artist/write?p="+v); window.scrollTo(0,0); break; }
    case "cmLetterTo": openLetterTo(t.dataset.v); break;
    case "cmLetter": { const r=route(); layer.innerHTML=""; ui.ltTpl=null; navTo(grpHash(r.id,"letter",t.dataset.v)); window.scrollTo(0,0); break; }
    case "ltTpl": { ui.ltTpl=+t.dataset.v; const tx=document.getElementById("ltTxt"), keep=tx?tx.value:""; render(); const n=document.getElementById("ltTxt"); if(n) n.value=keep; break; }
    case "ltX": { const tx=(document.getElementById("ltTxt")||{}).value||""; if(!tx.trim()){ navBack(); break; } ui.ltHold=tx; tieModal("確定要取消撰寫嗎？","取消時，截至目前撰寫的內容不會儲存。",`<button class="t-mbtn" data-a="ltDiscard">取消撰寫</button><button class="t-mbtn main" data-a="ltSave">臨時儲存</button><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break; }
    case "ltDiscard": { const r=route(), D=S.get(K.ltDraft,{}); delete D[ltKey(r.id,r.m)]; S.set(K.ltDraft,D); layer.innerHTML=""; navBack(); break; }
    case "ltSave": { const r=route(), D=S.get(K.ltDraft,{}); D[ltKey(r.id,r.m)]={text:ui.ltHold||"",tpl:ui.ltTpl||0}; S.set(K.ltDraft,D); layer.innerHTML=""; toast("已臨時儲存"); navBack(); break; }
    case "ltDone": { const tx=((document.getElementById("ltTxt")||{}).value||"").trim(); if(!tx){ toast("先寫點什麼吧"); break; } const gid=t.dataset.g, to=t.dataset.v, L=S.get(K.fanLetters,[]); L.push({id:"lt"+Date.now(),gid,to,text:tx,tpl:ui.ltTpl||0,ts:Date.now()}); S.set(K.fanLetters,L); const D=S.get(K.ltDraft,{}); delete D[ltKey(gid,to)]; S.set(K.ltDraft,D); toast(`粉絲信已送給 ${MEMBERS[to]?artName(to,"feed"):groupOf(gid).name} 💌`); navBack(); break; }
    case "cwHide": t.classList.toggle("on"); ui.cwHide=t.classList.contains("on"); t.setAttribute("aria-checked",ui.cwHide); break;
    case "cwPost": { const tx=((document.getElementById("cwTxt")||{}).value||"").trim(); if(!tx&&!(ui.cwImgs||[]).length) break; const gid=t.dataset.v, L=S.get(K.fanPosts,[]); L.push({id:"fp"+Date.now(),gid,text:tx,ts:Date.now(),name:cmProf(gid).nick,g:3,mine:true,by:myEmail(),hideArt:!!ui.cwHide,...((ui.cwImgs||[]).length?{imgs:ui.cwImgs.slice()}:{})}); S.set(K.fanPosts,L); ui.cwImgs=[]; ui.cmFeed="fan"; toast("已發布 💜"); navBack(); break; }   /* 發完回到原本的社群，不留下「撰寫貼文」那一頁 */
    case "cmMeTab": ui.cmMeTab=t.dataset.v; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "meHide": t.classList.toggle("on"); t.setAttribute("aria-checked",t.classList.contains("on")); break;
    case "meSave": { const gid=t.dataset.v, P=S.get(K.cmProf,{}), x=cmProf(gid), nk=((document.getElementById("meNick")||{}).value||"").trim(); if(!nk){ toast("暱稱不能空白"); break; } if(!isAdminAcct()&&banBlock(nk)) break; cmNkPub(gid,nk.slice(0,20)); P[gid]={...x,own:1,nick:nk.slice(0,20),intro:((document.getElementById("meIntro")||{}).value||""),hide:!!document.querySelector('[data-a="meHide"].on')}; S.set(K.cmProf,P); ui.meDraft=null; toast("已儲存"); navBack(); break; }
    case "bmTog": { const k=t.dataset.v, L=S.get(K.bm,[]), on=L.includes(k); S.set(K.bm,on?L.filter(x=>x!==k):[...L,k]); t.classList.toggle("on",!on); if(on) toast("已移除書籤"); else toast(String(k).startsWith("p:")||String(k).startsWith("f:")?"書籤已新增。<br>請在社群 > 查看更多 > 書籤中查看。":"書籤已新增"); break; }
    case "bmTab": ui.bmTab=t.dataset.v; render(); break;
    case "cnTog": { const gid=route().id, M=S.get(K.cmNotif,{}), N=cnGet(gid); N[t.dataset.v]=N[t.dataset.v]?0:1; M[gid]=N; S.set(K.cmNotif,M); t.classList.toggle("on",!!N[t.dataset.v]); t.setAttribute("aria-checked",!!N[t.dataset.v]); { const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    case "cnAll": { const gid=route().id, M=S.get(K.cmNotif,{}), N=cnGet(gid); CN_GROUPS[+t.dataset.v][1].forEach(([k])=>N[k]=+t.dataset.on); M[gid]=N; S.set(K.cmNotif,M); { const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    case "cmNt": ui.cmNt=t.dataset.v; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "cmNtL": ui.cmNt=t.dataset.v; openNoticeList(route().id); break;
    case "snOpen": { const n=grpShopNotices(route().id).find(x=>x.id===t.dataset.v); if(n) tieModal(n.title,esc(n.body).replace(/\n/g,"<br>"),`<button class="t-mbtn main" data-a="tCloseLayer">知道了</button>`); break; }
    case "pmGal": ui.cDraft=""; openComments(t.dataset.v); break;
    case "pdView": openGallery(t.dataset.v,+t.dataset.i||0); break;
    case "galX": { const bk=ui.galBack; ui.galBack=null; if(bk&&bk.sheet){ ui.sheet=bk.sheet; renderComments(true); } else layer.innerHTML=""; break; }
    case "galGo": { const sc=document.getElementById("galS"); if(sc) sc.scrollTo({left:(+t.dataset.i)*sc.clientWidth,behavior:"smooth"}); break; }
    case "galDl": { const sc=document.getElementById("galS"); if(!sc) break; ui.galK=Math.round(sc.scrollLeft/Math.max(1,sc.clientWidth));
      const sh=document.getElementById("galSh"); if(sh){ sh.remove(); break; }
      sc.parentElement.insertAdjacentHTML("beforeend",`<div class="gal2-sh" id="galSh"><button data-a="galSave" data-v="one">僅儲存此檔案</button>${sc.children.length>1?`<button data-a="galSave" data-v="all">儲存所有可下載的檔案</button>`:""}</div>`); break; }
    case "galSave": { const sc=document.getElementById("galS"), sh=document.getElementById("galSh"); if(sh) sh.remove(); if(!sc) break;
      const imgs=[...sc.querySelectorAll(".gal2-i img")].filter((im,i)=>t.dataset.v==="all"||i===ui.galK).filter(im=>im.src); if(!imgs.length){ toast("照片還在載入"); break; }
      (async()=>{ try{ const files=await Promise.all(imgs.map(async(im,i)=>{ const b=await (await fetch(im.src)).blob(); return new File([b],`HAECHU_${Date.now()}_${i+1}.jpg`,{type:b.type||"image/jpeg"}); }));
          if(navigator.canShare&&navigator.canShare({files})){ await navigator.share({files}); return; }
          files.forEach(f=>{ const u=URL.createObjectURL(f), a2=document.createElement("a"); a2.href=u; a2.download=f.name; document.body.appendChild(a2); a2.click(); a2.remove(); setTimeout(()=>URL.revokeObjectURL(u),4000); });
        }catch(err){ if(!(err&&err.name==="AbortError")) toast("沒有存成功，長按照片也可以儲存"); } })(); break; }
    case "pdBack": if(ui.sheet&&ui.sheet.cid){ ui.sheet.cid=null; ui.cDraft=""; renderComments(true); } else { ui.sheet=null; ui.cDraft=""; layer.innerHTML=""; const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "pdRLike": { const L=S.get(K.comments,[]), c=L.find(x=>x.id===t.dataset.c); if(!c) break; const me=myEmail(), rid=t.dataset.r; let o=null; if(rid===c.id+"_r"&&c.reply) o=c.reply; else o=(c.reps||[]).find(r=>r.id===rid); if(!o) break; const A=o.likedBy=o.likedBy||[], i=A.indexOf(me); if(i>=0) A.splice(i,1); else A.push(me); S.set(K.comments,L);
      t.classList.toggle("on",i<0); const sp=t.querySelector("span"); if(A.length){ if(sp) sp.textContent=fmt(A.length); else t.insertAdjacentHTML("beforeend",`<span>${fmt(A.length)}</span>`); } else if(sp) sp.remove(); break; }
    case "pdOpenRep": if(ui.sheet){ ui.sheet.cid=t.dataset.c; ui.cDraft=""; renderComments(true); } break;
    case "pdFold": { ui.pdFold=ui.pdFold||{}; ui.pdFold[t.dataset.v]=!ui.pdFold[t.dataset.v]; renderComments(); break; }
    case "pdGrp": { const gid=t.dataset.v; ui.sheet=null; layer.innerHTML=""; openGroup(gid); break; }
    case "pdShare": { const p0=ui.sheet&&getPosts().find(x=>x.id===ui.sheet.postId); try{ navigator.share({title:APP_NAME,text:p0?artName(p0.member,"feed")+"：「"+(p0.text||"").slice(0,60)+"」":APP_NAME,url:location.origin+location.pathname}).catch(()=>{}); }catch(err){} break; }
    case "pdCLike": { const L=S.get(K.comments,[]), c=L.find(x=>x.id===t.dataset.c); if(!c) break; const me=myId()||"me", b=new Set(c.likedBy||[]); if(b.has(me)) b.delete(me); else b.add(me); c.likedBy=[...b]; S.set(K.comments,L); renderComments(); break; }
    case "pdRep": { const c=S.get(K.comments,[]).find(x=>x.id===t.dataset.c); if(!c) break; if(reportedByMe(c.id)){ toast("已經檢舉過了"); break; } iosSheet([["檢舉這則留言","report",`data-c="${c.id}" data-post="${c.postId}"`]]); break; }
    case "cmTab": { const r=route(); navReplace(grpHash(r.id,t.dataset.v)); window.scrollTo(0,0); break; }   // 社群裡 Home／Feed／LIVE／Shop 之間切換不留紀錄
    case "cmShop": { const r=route(); ui.shopCat="all"; navTo(grpHash(r.id,"shop")); window.scrollTo(0,0); break; }
    case "cmAbout": { const r=route(); ui.abOpen=null; navTo(grpHash(r.id,"about")); window.scrollTo(0,0); break; }
    case "cmAbMem": { const r=route(), m=t.dataset.v; ui.abOpen=m; navTo(grpHash(r.id,"about")); window.scrollTo(0,0); setTimeout(()=>{ const el=document.getElementById("ab-"+m); if(el) el.scrollIntoView({block:"center"}); },80); break; }
    case "cmMem": { const r=route(); ui.mpTab="post"; navTo(grpHash(r.id,"about",t.dataset.v)); window.scrollTo(0,0); break; }
    case "cmNotices": openNoticeList(route().id); break;
    case "cmCal": ui.calMo=0; ui.calDay=null; openCal(route().id); break;
    case "calMo": ui.calMo=(ui.calMo||0)+(+t.dataset.v); ui.calDay=null; openCal(t.dataset.g); break;
    case "calDay": ui.calDay=ui.calDay===+t.dataset.v?null:+t.dataset.v; openCal(t.dataset.g); break;
    case "abTog": ui.abOpen=ui.abOpen===t.dataset.v?null:t.dataset.v; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "mFollow": { const m=t.dataset.v, f=S.get(K.mFollow,{}); if(f[m]) delete f[m]; else f[m]=Date.now(); S.set(K.mFollow,f); toast(f[m]?`已追蹤 ${artName(m,"feed")}`:"已取消追蹤"); const y=window.scrollY; render(); window.scrollTo(0,y); break; }
    case "mpTab": { ui.mpTab=t.dataset.v; const h=document.getElementById("apHero"), y=window.scrollY, lim=h?h.offsetHeight-70:0; render(); window.scrollTo(0,Math.min(y,Math.max(lim,0)+1)); break; }
    case "mpSort": { ui.mpOld=!ui.mpOld; const y=window.scrollY; render(); window.scrollTo(0,y); break; }
    case "artProfEdit": iosSheet([["名稱","artNameEd",'data-v="feed"']]); break;
    case "cmFeed": ui.cmFeed=t.dataset.v; render(); break;
    case "cmFan": ui.cmFeed="fan"; render(); window.scrollTo(0,0); break;
    case "cmMed": ui.cmMed=t.dataset.v; render(); break;
    case "cmVc": ui.cmVc=t.dataset.v; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "cmCat": ui.shopCat=t.dataset.v; render(); break;
    case "cmMs": ui.prodTab="det"; ui.prodPlan=null; ui.pQty=1; openProd("ms:"+t.dataset.v); break;

    case "gClose": layer.innerHTML=""; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "gJoin": { const id=t.dataset.v; if(!followed().includes(id)) S.set(K.fanArtists,[...followed(),id]); ui.feedTab="feed";   /* 加入後回到 LOVE 就是「動態」，看得到剛加入的團 */ toast(`已加入 ${groupOf(id).name} 💜`); if(layer.querySelector(".tiei.grp-old")) openGroup(id); else { const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    case "gLeave": { const id=t.dataset.v; ask(`要退出「${groupOf(id).name}」社群嗎？`,()=>{ S.set(K.fanArtists,followed().filter(x=>x!==id)); layer.innerHTML=""; render(); toast("已退出社群"); },{title:"退出社群",ok:"退出"}); break; }
    case "shopG": ui.shopG=t.dataset.v; ui.shopCat="all"; layer.innerHTML=""; render(); window.scrollTo(0,0); break;
    case "shopBack": ui.shopG=null; render(); window.scrollTo(0,0); break;
    case "shopCat": ui.shopCat=t.dataset.v; render(); break;
    case "pOpen": ui.prodTab="det"; ui.prodPlan=null; ui.pQty=1; openProd(t.dataset.v); break;
    case "pClose": ui.prod=null; layer.innerHTML=""; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "pTab": ui.prodTab=t.dataset.v; openProd(ui.prod); break;
    case "pPlan": ui.prodPlan=t.dataset.v; openProd(ui.prod); break;
    case "pGroup": ui.prod=null; layer.innerHTML=""; ui.shopG=t.dataset.v; ui.shopCat="all"; if(route().tab!=="shop") go("fan",null,"shop"); else render(); window.scrollTo(0,0); break;
    case "pBuy": { const p=prodBy(t.dataset.v); if(!p) break; const g=groupOf(p.gid); if(isSelfGid(p.gid)){ toast(selfBuyMsg()); break; }
      if(p.kind==="tie"&&p.grp){ ui.prod=null; layer.innerHTML=""; ui.tg={gid:p.gid,n:1,plan:"d30",sel:[]}; tgSheet(); break; }
      if(p.kind==="tie"){ ui.prod=null; layer.innerHTML=""; openBuySheet(p.mid); break; }
      if(p.kind==="album"){ const r=buyAlbumV(p.aid,p.vid,ui.pQty||1,ui.pStore); if(r.err){ toast(r.err); break; } ui.prod=null; ui.pQty=1; abStart(r,0); break; }
      if(p.kind==="ms"){ const pid=ui.prodPlan||MS_PLANS[0].id; if(!buyMS(p.gid,pid)){ toast("積分不夠，先補充積分吧"); break; } toast(`已加入 ${g.name} Membership 💎`); }
      else { const it=MERCH.find(x=>x.k===p.k); if(points()<it.pts){ toast("積分不夠，先補充積分吧"); break; } S.set(K.points,points()-it.pts); recordSale("merch",{gid:p.gid,pts:it.pts,label:`${g.name}・${it.name}`}); const o=S.get(K.owned,{}); o[p.gid]={...(o[p.gid]||{}),[it.k]:Date.now()}; S.set(K.owned,o);
        logSelf("core",null,`你買了 ${g.name} 的${it.name}`); toast(it.k==="stick"?`已擁有 ${g.name} 官方應援棒，演唱會時可以舉起來了 ✨`:`已購買 ${g.name}・${it.name}`); }
      { const y=window.scrollY; render(); window.scrollTo(0,y); } openProd(p.id); break; }
    case "apDel": { e.preventDefault(); const key=t.dataset.v; PIMG.del(key).then(()=>{ if(layer.querySelector(".ae")) openAlbumEditor(ui.aeId); toast("已刪除照片"); }); break; }
    case "s3Flip": if(ui.s3) ui.s3.flip(); break;
    case "s3Close": { const v=document.querySelector(".s3v"); if(v) v.remove(); if(ui.s3) ui.s3.stop(); ui.s3=null; break; }
    case "abFlip": abFlip(+t.dataset.v); break;
    case "abSkip": abSkip(); break;
    case "abAgain": { const st=ui.ab; if(!st) break; if(isSelfGid((albumOf(st.r.aid)||{}).gid)){ toast(selfBuyMsg()); break; } const r=buyAlbumV(st.r.aid,st.r.vid,1,st.r.sid); if(r.err){ toast(r.err); break; } abStart(r,0); break; }
    case "abEnv": abEnv(); break;
    case "pStore": ui.pStore=t.dataset.v; { const sc=layer.querySelector(".tiei-body"), y=sc?sc.scrollTop:0; openProd(ui.prod); const b=layer.querySelector(".tiei-body"); if(b) b.scrollTop=y; } break;
    case "stAdd": { const L=getStores(); L.push({id:uid("st"),name:"新店家"}); S.set(K.stores,L); render(); break; }
    case "stDel": { const id=t.dataset.v, st=storeOf(id); ask(`要刪除「${st?st.name:""}」嗎？這家店的預購特典和 Lucky Draw 也會一起刪掉。`,()=>{ S.set(K.stores,getStores().filter(x=>x.id!==id)); const L=S.get(K.albums2,[]); L.forEach(a=>a.ex=(a.ex||[]).filter(e=>e.store!==id)); S.set(K.albums2,L); render(); toast("已刪除店家"); },{title:"刪除店家",ok:"刪除"}); break; }
    case "abNext": { const st=ui.ab; if(!st) break; abStart(st.r,st.idx+1); break; }
    case "abSumV": { const w=document.getElementById("abW"); if(!w) break; const v=document.createElement("div"); v.className="s3v"; v.innerHTML=`<button class="ph-x" data-a="s3Close" aria-label="關閉">${XI}</button><div class="s3">${item3d(t.dataset.v,Math.min(260,innerWidth*.62))}</div><p class="s3-l">${esc(itemName(t.dataset.v))}</p><div class="s3-btns"><button class="btn btn-soft btn-sm" data-a="s3Flip">翻面</button></div>`; w.appendChild(v); ui.s3=spin3d(v.querySelector(".s3-obj"),v.querySelector(".s3"),{rx:-4,ry:-18}); C3.upItem(v.querySelector(".s3"),t.dataset.v,Math.min(260,innerWidth*.62)); break; }
    case "pQty": { ui.pQty=Math.max(1,Math.min(20,(ui.pQty||1)+(+t.dataset.v))); const p=prodBy(ui.prod); const q=document.getElementById("pQ"); if(q) q.textContent=ui.pQty; const b=layer.querySelector('[data-a="pBuy"]'); if(b&&p) b.textContent=`${storeOf(ui.pStore)?"在 "+storeOf(ui.pStore).name+" 買":"買"} ${ui.pQty} 張・${fmt(p.pts*ui.pQty)} 積分`; break; }
    case "aeNew": { const gid=ui.albG||GROUPS[0].id, a={id:uid("ab"),gid,title:"新專輯",ord:"The 1st Mini Album",ts:Date.now(),vers:[{id:uid("v"),name:"A Ver.",shape:"book",w:19,h:25,t:2.2,pts:9000,preEnd:0,inc:[{id:uid("i"),k:"pc",name:"隨機小卡",w:5.5,h:8.5,n:1,pool:[]}]}],ex:[]}; saveAlbum(a); openAlbumEditor(a.id); break; }
    case "aeOpen": openAlbumEditor(t.dataset.v); break;
    case "aeClose": ui.aeId=null; layer.innerHTML=""; render(); break;
    case "aeVAdd": { const a=aeA(); a.vers.push({id:uid("v"),name:`${String.fromCharCode(65+a.vers.length)} Ver.`,shape:"cd",w:14.2,h:12.5,t:1,pts:7000,preEnd:0,inc:[{id:uid("i"),k:"pc",name:"隨機小卡",w:5.5,h:8.5,n:1,pool:[]}]}); saveAlbum(a); openAlbumEditor(a.id); break; }
    case "aeVDel": { const a=aeA(); if(a.vers.length<=1){ toast("至少要留一個版本"); break; } ask("要刪除這個版本嗎？",()=>{ a.vers=a.vers.filter(v=>v.id!==t.dataset.v); saveAlbum(a); openAlbumEditor(a.id); },{title:"刪除版本",ok:"刪除"}); break; }
    case "aeShape": { const a=aeA(), v=verOf(a,t.dataset.i), sh=shapeOf(t.dataset.v); v.shape=sh.k; if(sh.k!=="custom"){ v.w=sh.w; v.h=sh.h; v.t=sh.t; } saveAlbum(a); openAlbumEditor(a.id); break; }
    case "aeIAdd": { const a=aeA(), v=verOf(a,t.dataset.v); v.inc.push({id:uid("i"),k:"postcard",name:"明信片",w:10,h:15,n:1,pool:[]}); saveAlbum(a); openAlbumEditor(a.id); break; }
    case "aeIK": { const a=aeA(), r=itemOf(a,t.dataset.i), d=incOf(t.dataset.v); r.it.k=d.k; r.it.name=d.n; r.it.w=d.w; r.it.h=d.h; saveAlbum(a); openAlbumEditor(a.id); break; }
    case "aeIDel": { const a=aeA(); ask("要刪除這一項嗎？",()=>{ a.vers.forEach(v=>v.inc=v.inc.filter(x=>x.id!==t.dataset.v)); a.ex=(a.ex||[]).filter(x=>x.id!==t.dataset.v); saveAlbum(a); openAlbumEditor(a.id); },{title:"刪除",ok:"刪除"}); break; }
    case "aePAdd": { const a=aeA(), r=itemOf(a,t.dataset.v); r.it.pool=[...(r.it.pool||[]),{id:uid("p"),mid:null,sp:false}]; saveAlbum(a); openAlbumEditor(a.id); break; }
    case "aePSp": { const a=aeA(), r=itemOf(a,t.dataset.i), ph=photoOf(r.it,t.dataset.v); ph.sp=!ph.sp; saveAlbum(a); openAlbumEditor(a.id); break; }
    case "aePDel": { const a=aeA(), r=itemOf(a,t.dataset.i); r.it.pool=r.it.pool.filter(x=>x.id!==t.dataset.v); saveAlbum(a); openAlbumEditor(a.id); break; }
    case "aeXAdd": { const a=aeA(), r=t.dataset.v; a.ex=[...(a.ex||[]),{id:uid("i"),rule:r,k:"pc",name:EXR[r].n,w:5.5,h:8.5,pool:[],...(EXR[r].st?{store:t.dataset.s}:{}),...(r==="ld"?{cap:20,odds:10}:{})}]; saveAlbum(a); openAlbumEditor(a.id); break; }
    case "abClose": ui.ab=null; cancelAnimationFrame(gcRaf); layer.innerHTML=""; { const y=window.scrollY; render(); window.scrollTo(0,y); } toast("收進卡冊了 🃏"); break;
    case "goAlbums": { const f=followed(); ui.shopG=f[0]||null; ui.shopCat="album"; go("fan",null,"shop"); window.scrollTo(0,0); break; }
    case "albG": ui.albG=t.dataset.v; render(); break;
    case "albDel": ask("要下架這張專輯嗎？已經收到的小卡會保留。",()=>{ S.set(K.albums2,S.get(K.albums2,[]).filter(a=>a.id!==t.dataset.v)); render(); toast("已下架"); },{title:"下架專輯",ok:"下架"}); break;
    case "tieIntro": if(MEMBERS[t.dataset.m]&&isSelfGid(MEMBERS[t.dataset.m].group)){ toast(selfBuyMsg()); break; } if(MEMBERS[t.dataset.m]&&groupArtists(MEMBERS[t.dataset.m].group).length===1){ tieStore(MEMBERS[t.dataset.m].group); break; } openTieIntro(t.dataset.m); break;
    case "tieIntroGo": layer.innerHTML=""; openBuySheet(t.dataset.m); break;
    case "gnOpen": openGNotice(t.dataset.v); break;
    case "gnG": ui.gnG=t.dataset.v; render(); break;
    case "gnPost": { const ti=(document.getElementById("gnTitle")||{}).value||"", bo=(document.getElementById("gnBody")||{}).value||"", gid=ui.gnG||GROUPS[0].id; if(!ti.trim()||!bo.trim()){ toast("標題和內容都要填喔"); break; }
      S.set(K.gNotices,[{id:"gn"+Date.now(),group:gid,title:ti.trim(),body:bo.trim(),ts:Date.now()},...S.get(K.gNotices,[])]);
      const off=Object.keys(MEMBERS).find(id=>MEMBERS[id].official&&MEMBERS[id].group===gid); if(off) feedPush({kind:"post",member:off,group:gid,text:"📢 "+ti.trim()},"g:"+gid);
      render(); toast("團體公告已發布"); break; }
    case "gnDel": { const L=S.get(K.gNotices,[])||[], n=L.find(x=>x.id===t.dataset.v), G={...gnGone()}; G[t.dataset.v]=Date.now(); if(n&&n.mv) G["mv:"+n.mv]=Date.now(); S.set(GN_GONE,G); S.set(K.gNotices,L.filter(x=>x.id!==t.dataset.v)); render(); toast("已撤下"); break; }
    
    
    
    case "fpGo": { const id=t.dataset.id; if((session()||{}).role==="artist"){ fpOpen(id); break; } ui.cDraft=""; ui.sheet={postId:id}; renderComments(true); break; }
    case "cwImgX": { (ui.cwImgs||[]).splice(+t.dataset.v,1); const tx=(document.getElementById("cwTxt")||{}).value||""; render(); const ta=document.getElementById("cwTxt"); if(ta){ ta.value=tx; } const b=document.getElementById("cwOk"); if(b) b.disabled=!tx.trim()&&!(ui.cwImgs||[]).length; break; }
    case "fpRep": { const p=S.get(K.fanPosts,[]).find(x=>x.id===t.dataset.id); if(!p) break; fpOpen(p.id,true); break; }
    case "fpClose": layer.innerHTML=""; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "fpRepOk": { const tx=((document.getElementById("fpRepIn")||{}).value||"").trim(); if(!tx) break; const mid=(session()||{}).member, L=S.get(K.fanPosts,[]), p=L.find(x=>x.id===t.dataset.id); if(!p||!mid) break; if(!isAdminAcct()&&banBlock(tx)) break;
      p.rep=[...(p.rep||[]),{id:"fr"+Date.now(),mid,text:tx,ts:Date.now()}]; S.set(K.fanPosts,L); if(p.by) feedPush({kind:"core",member:mid,group:p.gid,text:`💬 ${artName(mid,"feed")}回覆了你的貼文：${tx.slice(0,60)}`,direct:true},"u:"+p.by); fpOpen(p.id,false); { const y=scrollY; render(); scrollTo(0,y); } break; }
    case "preAnn": { const x=getAnns().find(y=>y.id===t.dataset.id); if(!x) break; const pk=annPre(x); tieModal(pk?(pk.k==="cb"?"📢 即將回歸":"📢 即將出道"):"📌 公告",`${x.img?`<img class="pre-img" src="${esc(x.img)}" alt="">`:""}<p class="pre-tx">${esc(x.text)}</p><small class="pre-ts">${ymdhm(x.ts)}</small>`,`<button class="t-mbtn main" data-a="tCloseLayer">知道了</button>`,"pre-m"); break; }
    
    case "notifClear": ask("要清除所有一般通知嗎？置頂公告不會被清掉。",()=>{ S.set(K.notifs,getNotifications().filter(n=>n.kind==="system")); markAllRead(); render(); toast("已清除通知"); }); break;
    case "report": ask("要檢舉這則留言嗎？管理員會審核。",()=>{ reportComment(t.dataset.c,t.dataset.post); renderComments(true); toast("已送出檢舉，謝謝你"); }); break;
    case "goCore": go("fan",null,"core"); window.scrollTo(0,0); break;
    case "goNotifs": go("fan","notifications"); break;
    case "rmPhPick": { const id=ui.rmEd; if(!id) break; const inp=document.createElement("input"); inp.type="file"; inp.accept="image/*";
      inp.onchange=async()=>{ const f0=inp.files&&inp.files[0]; if(!f0) return; const f=await cropImg(f0,{ratio:4/5,max:1350}); if(!f) return;
        try{ const b=await shrinkImg(f,1350); MPREV[id]=URL.createObjectURL(b); const el=document.getElementById("rmPhImg"); if(el) el.innerHTML=teaserIn(id); const bt=document.getElementById("rmPhBtn"); if(bt) bt.textContent="更換"; { const y=window.scrollY; render(); window.scrollTo(0,y); } toast("Teaser 照換好了");
          const url=(HB_ON&&await hbImgUrl("gph_m_"+id+"_"+Date.now().toString(36)+".jpg",b))||await new Promise(res=>{ const rd=new FileReader(); rd.onload=()=>res(rd.result); rd.readAsDataURL(b); });
          imgSwap(url,()=>{ const M={...(S.get(K.mPhoto,{})||{})}; const old=M[id]; if(old!==url) mediaDel(old); M[id]=url; try{ S.set(K.mPhoto,M); }catch(e){ toast("圖片太大，存不下來"); return; } delete MPREV[id]; if(!layer.innerHTML){ const y=window.scrollY; render(); window.scrollTo(0,y); } }); }catch(e){ toast("這張圖讀不出來"); } }; pickClick(inp); break; }
    case "rmPhDel": { const id=ui.rmEd; if(!id) break; delete MPREV[id]; const M={...(S.get(K.mPhoto,{})||{})}; mediaDel(M[id]); delete M[id]; S.set(K.mPhoto,M); const el=document.getElementById("rmPhImg"); if(el) el.innerHTML=teaserIn(id); { const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    case "cmCrop": { const L=ui.composeMedia||[], i=+t.dataset.i, x=L[i]; if(!x||x.kind!=="photo") break; (async()=>{ const b0=await MDB.get(x.mid); if(!b0){ toast("找不到這張照片"); return; } const b=await cropImg(b0,{free:true,max:1280}); if(!b) return;
      const id="pp"+Date.now()+i, im=await new Promise(res=>{ const u=URL.createObjectURL(b), q=new Image(); q.onload=()=>{ res(q); URL.revokeObjectURL(u); }; q.src=u; }); await MDB.put(id,b); L[i]={...x,mid:id,w:im.naturalWidth,h:im.naturalHeight}; const y=window.scrollY; render(); window.scrollTo(0,y); })(); break; }
    case "tPhCrop": { const p=ui.tiePh; if(!p) break; (async()=>{ const b=await cropImg(p.blob,{free:true,max:1280}); if(!b) return; p.blob=b; tiePhPrev(); })(); break; }
    case "tPhSend": { const p=ui.tiePh; ui.tiePh=null; layer.innerHTML=""; if(!p) break; (async()=>{ try{ const {blob,w,h}=await prepPhoto(p.blob); await tqAddMedia(p.mid,"photo",blob,{w,h}); }catch(e){ toast("這張照片讀不出來，換一張試試"); } })(); break; }
    case "tPhX": ui.tiePh=null; layer.innerHTML=""; break;
    default: return CLICK_NO;
  } }

/* =========================================================
   點擊動作（世巡、影音、帳號管理）：從 10-點擊互動.js 的大 switch 搬出來，內容沒改
   回傳 CLICK_NO＝這裡沒有這個動作，交給下一份
   ========================================================= */
function clickAdm(a,t,e,r){ switch(a){
    case "tourOpen": navTo("#/fan/core?p=tour&id="+encodeURIComponent(t.dataset.v)); window.scrollTo(0,0); break;
    case "openTour": navTo("#/fan/core?p=tour"+(t.dataset.id?"&id="+encodeURIComponent(t.dataset.id):"")); window.scrollTo(0,0); break;
    case "tourBuy": tourBuyAsk(t.dataset.v,t.dataset.s); break;
    case "tourBuyOk": { const tr=tourOf(t.dataset.v), st=tr&&tr.stops.find(x=>x.id===t.dataset.s); layer.innerHTML=""; if(!st) break; const tx=myTix(); if(tx[st.id]){ toast("已經有這一站的票了"); break; }
      if(points()<TOUR_TIX){ toast("積分不夠，先補充積分吧"); break; } S.set(K.points,points()-TOUR_TIX); tx[st.id]=Date.now(); S.set(K.tourTix,tx); recordSale("tour",{gid:tr.gid,pts:TOUR_TIX,label:`${tr.title}・${st.city}站門票`});
      toast(`買到${st.city}站的票了，時間到就能進場`); lsRerender(); break; }
    case "tourBuyAll": { const tr=tourOf(t.dataset.v); layer.innerHTML=""; if(!tr) break; if(isSelfGid(tr.gid)){ toast(selfBuyMsg()); break; } const rest=tourRest(tr); if(rest.length<2) break; const cost=Math.round(rest.length*TOUR_TIX*.9);
      if(points()<cost){ toast("積分不夠，先補充積分吧"); break; } S.set(K.points,points()-cost); const tx=myTix(); rest.forEach(s=>tx[s.id]=Date.now()); S.set(K.tourTix,tx); recordSale("tour",{gid:tr.gid,pts:cost,label:`${tr.title}・全部站門票（${rest.length} 站）`});
      toast(`買到 ${rest.length} 站的票了，時間到就能進場`); lsRerender(); break; }
    case "trNew": ui.trDraft={title:"",stops:[],city:TOUR_CITIES[0][0],when:""}; lsRerender(); break;
    case "trCancel": ui.trDraft=null; lsRerender(); break;
    case "trStopAdd": { trKeep(); const d=ui.trDraft; if(!d) break; const ts=d.when?new Date(d.when).getTime():NaN; if(!ts||isNaN(ts)){ toast("請選日期和時間"); break; } if(ts<Date.now()+36e5){ const m=new Date(Date.now()+36e5); toast(`要選 ${m.getMonth()+1}/${m.getDate()} ${pad(m.getHours())}:${pad(m.getMinutes())} 以後`); break; }
      if(d.stops.length>=TOUR_MAX_STOPS){ toast(`一次世巡最多 ${TOUR_MAX_STOPS} 站`); break; } if(d.stops.some(x=>Math.abs(x.startTs-ts)<TOUR_MINS*60e3)){ toast("跟另一站的時間太近了"); break; } d.stops.push({id:"ts"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),city:d.city,startTs:ts}); d.when=""; lsRerender(); break; }
    case "trStopDel": { trKeep(); const d=ui.trDraft; if(d) d.stops=d.stops.filter(x=>x.id!==t.dataset.v); lsRerender(); break; }
    case "trSubmit": { trKeep(); const d=ui.trDraft, mid=session().member||uniMe(); if(!d||!mid) break; if(!d.title.trim()){ toast("請輸入巡演名稱"); break; } if(!d.stops.length){ toast("至少要有一站"); break; } { const gid=MEMBERS[mid].group, y=new Date(d.stops.slice().sort((a,b)=>a.startTs-b.startTs)[0].startTs).getFullYear(); if(tourYearTaken(gid,y)){ toast(`${y} 年已經有一個世巡了，一年一次`); break; } }
      const tr={id:"tr"+Date.now(),gid:MEMBERS[mid].group,by:mid,title:d.title.trim(),stops:d.stops.slice().sort((a,b)=>a.startTs-b.startTs),status:"pending",ts:Date.now()};
      S.set(K.wtours,[...(S.get(K.wtours,[])||[]),tr]); ui.trDraft=null; lsRerender(); toast("已送出，等管理員核准"); break; }
    case "trApprove": tourApprove(t.dataset.v); lsRerender(); break;
    case "trReject": { const all=S.get(K.wtours,[])||[], tr=all.find(x=>x.id===t.dataset.v); if(!tr) break; tr.status="rejected"; S.set(K.wtours,all); lsRerender(); toast("已退回"); break; }
    case "trStopRm": { const all=S.get(K.wtours,[])||[], tr=all.find(x=>x.id===t.dataset.v); if(!tr) break; const st=tr.stops.find(x=>x.id===t.dataset.s); if(!st) break;
      if(st.cid) saveConcerts(S.get(K.concerts,[]).filter(c=>c.id!==st.cid)); tr.stops=tr.stops.filter(x=>x.id!==st.id); if(!tr.stops.length) tr.status="rejected"; S.set(K.wtours,all); lsRerender(); toast(`${st.city}站已刪除`); break; }
    case "trEnd": { const all=S.get(K.wtours,[])||[], tr=all.find(x=>x.id===t.dataset.v); if(!tr) break; const ids=new Set(tr.stops.map(x=>x.cid).filter(Boolean)), n=Date.now();
      saveConcerts(S.get(K.concerts,[]).filter(c=>!ids.has(c.id)||c.startTs<=n)); tr.stops=tr.stops.filter(x=>{ const c=stopCC(x); return c&&c.startTs<=n; }); tr.status=tr.stops.length?"approved":"rejected"; S.set(K.wtours,all); lsRerender(); toast("剩下的站已取消"); break; }
    case "trSay": { const tr=tourOf(t.dataset.v), st=tr&&tr.stops.find(x=>x.id===t.dataset.s); if(!st) break;
      iosAlert(`${esc(st.city)}站・開場前說一句話`,"買票的粉絲會收到通知",`<button data-a="tCloseLayer">取消</button><button data-a="trSayOk" data-v="${tr.id}" data-s="${st.id}">送出</button>`,`<label class="field tr-say"><input id="trSayIn" maxlength="60" placeholder="輸入文字"></label>`); setTimeout(()=>{ const i=document.getElementById("trSayIn"); if(i) i.focus(); },50); break; }
    case "trSayOk": { const txt=((document.getElementById("trSayIn")||{}).value||"").trim(); if(!txt){ toast("請輸入文字"); break; } const all=S.get(K.wtours,[])||[], tr=all.find(x=>x.id===t.dataset.v), st=tr&&tr.stops.find(x=>x.id===t.dataset.s); layer.innerHTML=""; if(!st) break;
      const mid=session().member||uniMe(); st.msg=txt; st.msgBy=mid; st.msgTs=Date.now(); S.set(K.wtours,all); feedPush({kind:"tour",member:mid,group:tr.gid,text:`${st.city}站・${txt}`,tourId:tr.id,direct:true},"tix:"+st.id); lsRerender(); toast("已送出"); break; }
    case "abLink": { const k=t.dataset.k, gid=t.dataset.g, mm=t.dataset.m; layer.innerHTML="";
      if(k==="sns"){ ui.snsFrom=location.hash; navTo(mm?"#/fan/sns?p=profile&id="+encodeURIComponent("m:"+mm):"#/fan/sns"); }
      else if(k==="tie"){ if(mm&&tieGate(mm)){} else if(mm){ ui.srch=null; ui.tieEmoji=false; ui.scrollChat=true; navTo("#/fan/chat?m="+mm); } else go("fan",null,"whisper"); }
      else { ui.shopG=gid; ui.shopCat="all"; go("fan",null,"shop"); }
      window.scrollTo(0,0); break; }
    case "goArtist": { const mm=MEMBERS[t.dataset.v]; if(!mm) break; layer.innerHTML=""; ui.sheet=null; ui.mpTab="post"; navTo(grpHash(mm.group,"about",t.dataset.v)); window.scrollTo(0,0); break; }
    case "newsF": ui.newsF=t.dataset.v; lsRerender(); break;
    case "newsOpen": navTo(t.dataset.b+"&id="+encodeURIComponent(t.dataset.v)); window.scrollTo(0,0); break;
    case "openNews": navTo("#/fan/core?p=news"+(t.dataset.id?"&id="+encodeURIComponent(t.dataset.id):"")); window.scrollTo(0,0); break;
    case "nwG": { nwKeep(); const d=ui.nwDraft, v=t.dataset.v; d.gids=d.gids.includes(v)?d.gids.filter(x=>x!==v):[...d.gids,v]; lsRerender(); break; }
    case "nwImg": { nwKeep(); const inp=document.createElement("input"); inp.type="file"; inp.accept="image/*";
      inp.onchange=async()=>{ const f0=inp.files&&inp.files[0]; if(!f0) return; const f=await cropImg(f0,{ratio:16/9}); if(!f) return; ui.nwBusy=true; lsRerender();
        try{ const b=await shrinkImg(f,1600); const url=(HB_ON&&await hbImgUrl("gph_news_"+Date.now().toString(36)+".jpg",b))||await new Promise(res=>{ const rd=new FileReader(); rd.onload=()=>res(rd.result); rd.readAsDataURL(b); }); if(ui.nwDraft) ui.nwDraft.img=url; }catch(e){ toast("這張圖讀不出來"); }
        ui.nwBusy=false; lsRerender(); }; pickClick(inp); break; }
    case "nwEd": { const n=newsOf(t.dataset.v); if(!n) break; ui.nwDraft={title:n.title||"",body:n.body||"",gids:(n.gids||[]).filter(groupOf),img:n.img||"",editId:n.id,auto:!!n.auto,img0:n.img||""}; lsRerender(); setTimeout(()=>{ const f=document.getElementById("nwForm"); if(f) f.scrollIntoView({behavior:"smooth",block:"start"}); },30); break; }
    case "nwEdX": { const d=ui.nwDraft; if(d&&d.img&&d.img!==d.img0) mediaDel(d.img); ui.nwDraft=null; lsRerender(); break; }
    case "nwImgDel": { nwKeep(); const d=ui.nwDraft; if(d){ if(!d.editId||d.img!==d.img0) mediaDel(d.img); d.img=""; } lsRerender(); break; }
    case "nwPost": { nwKeep(); const d=ui.nwDraft; if(!d||!d.title.trim()||!d.body.trim()){ toast("標題和內容都要填"); break; }
      if(d.editId){ const up={title:d.title.trim(),body:d.body.trim(),img:d.img||"",gids:d.gids.filter(groupOf)};
        if(d.auto){ if(up.img===d.img0) delete up.img; const E={...(S.get(K.newsEd,{})||{})}; E[d.editId]=up; S.set(K.newsEd,E); }
        else { S.set(K.news,getNewsM().map(x=>x.id===d.editId?{...x,...up}:x)); if(d.img0&&d.img0!==up.img) mediaDel(d.img0); }
        ui.nwDraft=null; lsRerender(); toast("已更新"); break; }
      const n={id:"nw"+Date.now(),title:d.title.trim(),body:d.body.trim(),img:d.img||"",gids:d.gids.filter(groupOf),ts:Date.now()};
      S.set(K.news,[n,...getNewsM()].slice(0,200)); feedPush({kind:"news",group:n.gids[0]||"",text:n.title.slice(0,80),newsId:n.id,direct:true},n.gids.length?"gs:"+n.gids.join(","):"all");
      ui.nwDraft=null; lsRerender(); toast("已發布"); break; }
    case "nwDel": { const id=t.dataset.v, n=getNewsM().find(x=>x.id===id); if(n&&n.img) mediaDel(n.img); S.set(K.news,getNewsM().filter(x=>x.id!==id)); S.set(K.notifs,S.get(K.notifs,[]).filter(x=>x.newsId!==id)); lsRerender(); toast("已刪除"); break; }
    case "nwHide": { const id=t.dataset.v, H={...(S.get(K.newsHide,{})||{})}; if(H[id]) delete H[id]; else H[id]=1; S.set(K.newsHide,H); lsRerender(); toast(H[id]?"已撤下":"已恢復"); break; }
    case "meSec": ui.meSec=t.dataset.v; render(); window.scrollTo(0,0); break;
    case "meSecBack": ui.meSec=null; render(); window.scrollTo(0,0); break;
    case "muOpen": case "muSheet": openSongSheet(t.dataset.v); break;
    case "goExplore": ui.feedTab="discover"; go("fan",null,"home"); window.scrollTo(0,0); break;
    case "coreLocked": toast("選秀暫未開啟，請隨時關注社群公告"); break;
    case "coreGo": ui.srch=null; navTo(t.dataset.v==="sns"?"#/fan/sns":"#/fan/core?p="+t.dataset.v); window.scrollTo(0,0); break;
    case "openSns": ui.snsFrom=location.hash; navTo("#/"+(route().role||session().role)+"/sns"); window.scrollTo(0,0); break;
    case "focGo": navTo("#/artist?tab=foc&p="+t.dataset.v); window.scrollTo(0,0); break;
    case "vPlay": { setTimeout(()=>{ try{ const v1=vodOf(t.dataset.v), pv=layer.querySelector(".ph-view"); if(v1&&v1.mid&&vodIsMV(v1)&&pv&&!pv.querySelector(".pv-like")){ const on=mvLikedV(v1.id); pv.insertAdjacentHTML("beforeend",`<button class="pv-like ${on?"on":""}" data-a="mvLikeV" data-v="${v1.id}">${on?"♥":"♡"} ${fmt(mvLikesV(v1.id))}</button>`); } }catch(e){} },30); const v0=vodOf(t.dataset.v); if(v0&&v0.mid){ playVideo(v0.mid); vodViewWatch(v0.id); break; } openVodPlayer(t.dataset.v,t.dataset.pl); break; }
    case "vsAdd": case "vsEd": { const gid=t.dataset.g, sid=t.dataset.v||"", cur=sid?(getSecs(gid).find(x=>x.id===sid)||{}).title||"":""; ui.vsFor={gid,sid};
      tieModal(sid?"分區名稱":"新增分區","",`<input id="vsTi" class="a-nick-in" maxlength="20" placeholder="輸入文字" value="${esc(cur)}"><button class="t-mbtn main" data-a="vsSave">儲存</button>${sid?`<button class="t-mbtn danger" data-a="vsDel">刪除分區</button>`:""}<button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break; }
    case "vsSave": { const f=ui.vsFor, v=((document.getElementById("vsTi")||{}).value||"").trim(); if(!f) break; if(!v){ toast("名稱不能空白"); break; } if(nameBlock&&nameBlock(v)) break;
      const M=S.get(K.vsec,{})||{}, L=[...(M[f.gid]||[])]; if(f.sid){ const x=L.find(y=>y.id===f.sid); if(x) x.title=v; } else L.push({id:uid("s"),title:v}); M[f.gid]=L; S.set(K.vsec,M); layer.innerHTML=""; lsRerender(); break; }
    case "vsDel": { const f=ui.vsFor; if(!f||!f.sid) break; const has=getVods(f.gid).some(v=>v.sec===f.sid); if(has){ toast("先把這個分區裡的影片刪掉"); break; } const M=S.get(K.vsec,{})||{}; M[f.gid]=(M[f.gid]||[]).filter(x=>x.id!==f.sid); S.set(K.vsec,M); layer.innerHTML=""; lsRerender(); break; }
    case "vsUp": { ui.vsFor={gid:t.dataset.g,sid:t.dataset.v}; ui.vsUp={ti:"",file:null,pv:"",dur:0,th:null,busy:""}; vsUpPage(); break; }
    case "vsSec": { const u=ui.vsUp, f=ui.vsFor; if(!u||!f) break; u.ti=((document.getElementById("vsVt")||{}).value||u.ti); f.sid=t.dataset.v; vsUpPage(); break; }
    case "vsFy": { const u=ui.vsUp; if(!u||u.busy) break; u.ti=((document.getElementById("vsVt")||{}).value||u.ti); const k=t.dataset.k; fairyPickFile(async file=>{ u.busy="結尾妖精上傳中…"; vsUpPage(); try{ const rec=await fairyUploadFile(file); if(rec) u.fy={...(u.fy||{}),[k]:rec}; }catch(e){ toast("上傳失敗，請再試一次"); } u.busy=""; vsUpPage(); }); break; }
    case "vsPick": { const u=ui.vsUp; if(!u||u.busy) break; u.ti=((document.getElementById("vsVt")||{}).value||u.ti); const inp=document.createElement("input"); inp.type="file"; inp.accept="video/*";
      inp.onchange=async()=>{ const file=inp.files&&inp.files[0]; if(!file) return; u.busy="讀取影片中…"; vsUpPage(); try{ const th=await videoThumb(file); u.file=file; u.th=th&&th.blob||null; u.pv=u.th?URL.createObjectURL(u.th):""; u.dur=th&&th.dur||0; }catch(e){ toast("這部影片讀不出來，換一部試試"); } u.busy=""; vsUpPage(); }; pickClick(inp); break; }
    case "vsUpOk": { const f=ui.vsFor, u=ui.vsUp; if(!f||!u||u.busy) break; const ti=((document.getElementById("vsVt")||{}).value||"").trim(); if(!u.file){ toast("先選一部影片"); break; } if(!ti){ toast("請輸入影片標題"); break; }
      u.ti=ti; u.busy="上傳中…"; vsUpPage();
      (async()=>{ try{ const id="vv"+Date.now().toString(36); let thumb=null;
          if(u.th){ thumb=id+"_t"; await MDB.put(thumb,u.th,true); if(!await hbUpload(thumb,u.th)) thumb=null; }
          hbUploadBig.on=pc=>{ u.busy=`上傳中… ${pc}%`; const e=document.querySelector(".db-busy"); if(e) e.textContent=u.busy; };
          const ok=(HB_ON&&!sbxOn())?await hbUpload(id,u.file):(await MDB.put(id,u.file),true); hbUploadBig.on=null; if(!ok){ u.busy=""; vsUpPage(); toast("上傳失敗，再試一次"); return; }
          memBlobs[id]=u.file; const L=S.get(K.vods,[]); L.push({id:uid("v"),gid:f.gid,sec:f.sid,title:ti,mid:id,thumb,dur:u.dur||0,ts:Date.now(),views:0,by:session().member||uniMe(),...(u.fy&&Object.keys(u.fy).length?{fy:Object.fromEntries(Object.entries(u.fy).map(([k,r])=>{ const o={...r}; delete o._pv; return [k,o]; }))}:{})}); S.set(K.vods,L);
          ui.vsUp=null; layer.innerHTML=""; try{ mvSongTick(); }catch(e){} lsRerender(); toast("影片上傳好了");
          { const vf=u.file, vid0=L[L.length-1].id; if(isMvLabel((getSecs(f.gid).find(x=>x.id===f.sid)||{}).title)||vodIsMV(L[L.length-1])) mvAudioUpload(vf).then(aid=>{ if(!aid) return; const V=S.get(K.vods,[])||[], v=V.find(y=>y.id===vid0); if(v){ v.au=aid; S.set(K.vods,V); } const m=getMShow(), so=[...m.songs,...(m.ended||[])].find(y=>y.mv===vid0); if(so) songAuSet(so.id,aid); }).catch(()=>{}); } }catch(e){ hbUploadBig.on=null; u.busy=""; vsUpPage(); toast("這部影片讀不出來，換一部試試"); } })(); break; }
    case "vsVDel": { const id=t.dataset.v; ask("要刪除這部影片嗎？",()=>{ S.set(K.vods,S.get(K.vods,[]).filter(v=>v.id!==id)); lsRerender(); toast("已刪除"); },{title:"刪除影片",ok:"刪除"}); break; }
    case "vodG": ui.vodG=t.dataset.v; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "vodNewCat": ui.vodNewCat=t.dataset.v; { const y=window.scrollY, ti=(document.getElementById("vdTitle")||{}).value, li=(document.getElementById("vdLink")||{}).value; render(); window.scrollTo(0,y); const a=document.getElementById("vdTitle"), b=document.getElementById("vdLink"); if(a&&ti) a.value=ti; if(b&&li) b.value=li; } break;
    case "vodAdd": { const ti=(document.getElementById("vdTitle").value||"").trim(), li=(document.getElementById("vdLink").value||"").trim(); if(!ti){ toast("請輸入影片標題"); break; } if(li&&!/^https:\/\//.test(li)){ toast("網址要用 https:// 開頭"); break; }
      const L=S.get(K.vods,[]), gid=ui.vodG||GROUPS[0].id, cat=ui.vodNewCat||"MV"; L.push({id:uid("v"),gid,cat,title:ti,album:document.getElementById("vdAlbum").value,ts:Date.now(),views:0,dur:cat==="SHOW"?1200:cat==="BEHIND"?480:200,link:li}); S.set(K.vods,L); toast("已新增影片，記得上傳縮圖"); { const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    case "vodDel": { const id=t.dataset.v; ask("要刪除這部影片嗎？",()=>{ S.set(K.vods,S.get(K.vods,[]).filter(v=>v.id!==id)); render(); toast("已刪除"); },{title:"刪除影片",ok:"刪除"}); break; }

    case "promoPick": { const was=S.get(K.pick,null); S.set(K.pick,t.dataset.v); try{ hap([35,15,35]); }catch(err){}
      const r0=t.getBoundingClientRect(); const sid=t.dataset.s; if(sid&&layer.querySelector(".mu2-sh")){ lsRerender(); openSongSheet(sid); } else render(); if(was!==t.dataset.v) confetti(r0.left+r0.width/2,r0.top+r0.height/2); break; }
    case "appReload": { try{ navSave&&navSave(); }catch(e){} location.replace(location.pathname+"?v="+encodeURIComponent(ui.verNew||Date.now().toString(36))+location.hash); break; }   /* 帶新版本號重新載入，才不會拿到瀏覽器暫存的舊版 */
    case "pushToggle": if(ui.pushOn) pushDisable(); else pushEnable(); break;
    case "maintToggle": { const on=maintOn(); ask(on?"要結束維修，讓大家可以登入嗎？":"要開始維修嗎？除了管理員，大家都不能登入，正在用的人也會被登出。",()=>{ S.set(K.maint,{on:!on,ts:Date.now()}); lsRerender(); toast(on?"維修結束":"維修中"); },{title:on?"結束維修":"開始維修",ok:on?"結束":"開始",danger:!on}); break; }
    case "acCreate": { const un=(document.getElementById("acUser").value||"").trim(), rn=((document.getElementById("acReal")||{}).value||"").trim(), nm=(document.getElementById("acName").value||"").trim(), pw=(document.getElementById("acPw").value||"").trim();
      if(!un||/[\s@\/\\]/.test(un)||un.length>20){ toast("帳號不能有空白、@、/，最多 20 個字"); break; } if(!rn){ toast("請輸入本名"); break; } if(!nm){ toast("請輸入暱稱"); break; } if(nameBlock(nm)||nameBlock(un)) break; if(pw.length<4){ toast("密碼至少要 4 個字"); break; }
      const key=un.toLowerCase(); if(acctKey(un)){ toast("這個帳號已經有人用了"); break; }
      ui.acBusy=true; ui.acDraft={un,rn,nm,pw}; lsRerender();
      const role="fan";   // 只建一般帳號（不再從這裡新增管理員）
      acCall({action:"create",username:key,name:nm,password:pw,role}).then(async r=>{ ui.acBusy=false;
        if(r.error){ lsRerender(); toast(r.error); return; }
        if(r.local){ ACCOUNTS[key]={user:un,pw,role,name:nm}; saveRoster(x=>{ x.accounts=x.accounts||{}; x.accounts[key]=ACCOUNTS[key]; }); }
        else { try{ await hbLoadProfiles(); }catch(e){} }
        await setNote(key,{real_name:rn,pw}); ui.acDraft=null; render(); toast(`已建立 ${un}`); }); break; }
    
    case "calClr": { const c={...(ui.calF||{})}; delete c[t.dataset.v]; ui.calF=c; const y=scrollY; render(); scrollTo(0,y); break; }
    case "calAll": { ui.calAll={...(ui.calAll||{}),[t.dataset.v]:!(ui.calAll||{})[t.dataset.v]}; const y=scrollY; render(); scrollTo(0,y); break; }
    case "acEdit": { const k=t.dataset.v, a=ACCOUNTS[k]||{}; ui.acFor=k; const pw=knownPw(k)||(a.pw||""), self=k===String((session()||{}).email||"").toLowerCase();
      const row=(l,v)=>`<div class="acm-r"><em>${l}</em><b>${v}</b></div>`;
      tieModal(esc(acctUser(k)),"",`<div class="acm-info">${row("帳號",esc(acctUser(k)))}${row("密碼",pw?`<span class="ac-pw">${esc(pw)}</span>`:`<span class="acm-mute">下次登入後顯示</span>`)}${row("身分",ROLE_ZH[a.role]||"粉絲")}${row("暱稱",esc(a.name||""))}</div>
        <label class="acm-f"><span>本名</span><input id="acRealIn" maxlength="20" autocomplete="off" placeholder="只有管理員看得到" value="${esc(realName(k))}"></label>
        <label class="acm-f"><span>重設密碼</span><input id="acNewPw" maxlength="40" autocomplete="new-password" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="不改就留空"></label>
        <div class="acm-btns"><button class="t-mbtn main" data-a="acEditOk">儲存</button>${self?"":`<button class="t-mbtn danger" data-a="acDel" data-v="${esc(k)}">刪除帳號</button>`}<button class="t-mbtn" data-a="tCloseLayer">取消</button></div>`,"acm"); break; }
    case "acDel": { const k=t.dataset.v; ui.acFor=k; tieModal(`刪除 ${esc(acctUser(k))}？`,"刪掉之後這個帳號就不能登入了，他的個人資料也會一起刪掉，不能復原。",`<button class="t-mbtn danger" data-a="acDelOk">刪除</button><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break; }
    case "acDelOk": { const k=ui.acFor; if(!k||k===String((session()||{}).email||"").toLowerCase()) break; layer.innerHTML="";
      acCall({action:"delete",username:k}).then(async r=>{ if(r.error){ toast(r.error); return; } const a=ACCOUNTS[k]; if(a&&a.member&&!HB_ON) unbindArtist(k); delete ACCOUNTS[k]; if(r.local) saveRoster(x=>{ if(x.accounts) delete x.accounts[k]; }); try{ delete REAL[k]; delete PWS[k]; }catch(e){} if(!HB_ON) await setNote(k,{real_name:"",pw:""}); lsRerender(); toast(`已刪除 ${acctUser(k)}`); }); break; }
    case "acEditOk": { const k=ui.acFor, rn=((document.getElementById("acRealIn")||{}).value||"").trim(), np=((document.getElementById("acNewPw")||{}).value||"").trim();
      if(np&&np.length<4){ toast("密碼至少要 4 個字"); break; } layer.innerHTML="";
      (async()=>{ if(np){ const r=await acCall({action:"reset",username:k,password:np}); if(r.error){ toast(r.error); return; } if(r.local&&ACCOUNTS[k]) ACCOUNTS[k].pw=np; }
        const ok=await setNote(k,np?{real_name:rn,pw:np}:{real_name:rn}); lsRerender(); toast(np?(ok?"已儲存，新密碼是「"+np+"」":"新密碼「"+np+"」設好了，但後台沒記下來（請跑第六段 SQL）"):(ok?"已儲存":"沒存到後台（請跑第五、六段 SQL）")); })(); break; }
    
    case "acResetOk": { const k=ui.acFor, pw=((document.getElementById("acNewPw")||{}).value||"").trim(); if(pw.length<4){ toast("密碼至少要 4 個字"); break; }
      layer.innerHTML=""; acCall({action:"reset",username:k,password:pw}).then(r=>{ if(r.error){ toast(r.error); return; } if(r.local&&ACCOUNTS[k]){ ACCOUNTS[k].pw=pw; if(ACCOUNTS[k].role!=="admin") saveRoster(x=>{ x.accounts=x.accounts||{}; x.accounts[k]={...(x.accounts[k]||ACCOUNTS[k]),pw}; }); } toast(`${acctUser(k)} 的新密碼設好了`); }); break; }
    case "trSave": { const v=(document.getElementById("trUrl").value||"").trim(); if(v&&!/^https:\/\//.test(v)){ toast("網址要用 https:// 開頭"); break; } S.set(K.trCfg,{url:v}); lsRerender(); toast(v?"已改用 DeepL 翻譯":"已改回 Claude 翻譯"); break; }
    case "trTest": { toast("翻譯中…"); translateMany(["今天的舞台好棒！@@@ 辛苦了 💜"],"ko").then(o=>{ toast(o&&o[0]?`${trEngine()}：${o[0]}`:(HB_ON?"DeepL 還沒接好（後台的 deepl 和 DEEPL_KEY）":useDeepL()?"連不到 DeepL 中繼站（在 claude.ai 裡會被擋，搬到自己的網站後才會通）":"翻譯服務還沒連上")); }); break; }
    case "muWk": { const n=+t.dataset.v, k=shiftWeek(ui.muWk||curWeek(),n); if(k>curWeek()) break; ui.muWk=k; lsRerender(); break; }
    case "muWin": { if(t.disabled) break; const sid=t.dataset.v||null, sh=t.dataset.s; setWinner(sh,sid,null,true); lsRerender(); if(sid) toast(`已公布 ${SHOWS.find(x=>x.id===sh).name} 一位，粉絲會收到通知`); break; }
    case "muMc": { const ms=getMShow(), mon=t.dataset.mon, sh=t.dataset.s, id=t.dataset.v; ms.mc[mon]={...(ms.mc[mon]||{})}; const l=ms.mc[mon][sh]||[]; ms.mc[mon][sh]=l.includes(id)?l.filter(x=>x!==id):[...l,id]; S.set(K.mshow,ms); lsRerender(); break; }
    
    case "muPreDel": { const ms=getMShow(); ms.pre=(ms.pre||[]).filter(p=>p.id!==t.dataset.v); S.set(K.mshow,ms); lsRerender(); break; }
    
    case "muSongDel": { const sg=songOf(t.dataset.v); if(!sg) break; ask(`${songName(sg)} 要結束打歌嗎？過去的一位紀錄會保留在積分裡。`,()=>{ const ms=getMShow(); ms.ended=[...(ms.ended||[]),sg]; ms.songs=ms.songs.filter(x=>x.id!==sg.id); S.set(K.mshow,ms); lsRerender(); toast("已結束打歌"); },{ok:"結束打歌"}); break; }
    case "muAlbum": { const g=groupOf(t.dataset.v); if(owns(g.id,"album")){ toast("你已經收藏這張專輯了 💿"); break; } ui.shopTab="merch"; go("fan",null,"shop"); window.scrollTo(0,0); break; }
    case "mvLikeV": { const on=mvLikeToggle(t.dataset.v); if(t.closest(".mu2-sh")){ const s=songOf(t.dataset.s); if(s) openSongSheet(s.id); lsRerender(); } else document.querySelectorAll(`[data-a="mvLikeV"][data-v="${t.dataset.v}"]`).forEach(b=>{ if(b.closest(".mu2-sh")) return; b.classList.toggle("on",on); b.innerHTML=b.classList.contains("yv-lk")?`${si("heart")}<span>${fmt(mvLikesV(t.dataset.v))}</span>`:`${on?"♥":"♡"} ${fmt(mvLikesV(t.dataset.v))}`; }); break; }
    case "mvLike": { const l=S.get(K.mvLike,{}), g=t.dataset.v; if(l[g]) delete l[g]; else l[g]=Date.now(); S.set(K.mvLike,l);
      if(t.closest(".player,.yv-pw")){ t.classList.toggle("on",!!l[g]); t.innerHTML=`${l[g]?"♥":"♡"} ${fmt(mvLikes(g))}`; } else if(t.closest(".mu2-sh")){ t.classList.toggle("on",!!l[g]); t.innerHTML=`<span>${l[g]?"♥":"♡"}</span>MV ${fmt(mvLikes(g))}`; lsRerender(); } else lsRerender(); break; }
    case "muVote": openVote(t.dataset.v); break;
    case "muVoteGo": { if(t.disabled) break; if(String(t.dataset.v).startsWith("demo_")){ const sid=t.dataset.v, sh=t.dataset.s, k=myVoteKey(sh); ui.dmMine=ui.dmMine||{}; if(ui.dmMine[k]) break; ui.dmMine[k]=sid; ui.dmV=ui.dmV||{}; ui.dmV[sid]=(ui.dmV[sid]||0)+1; ui.dmV2=ui.dmV2||{}; ui.dmV2[sh]={...(ui.dmV2[sh]||{}),[sid]:((ui.dmV2[sh]||{})[sid]||0)+1};   /* 示範：只記在這次打開 */
        const r0=t.getBoundingClientRect(); confetti(r0.left+r0.width/2,r0.top+r0.height/2); openVote(sid); { const y=window.scrollY; render(); window.scrollTo(0,y); } const so=songOf(sid); toast(`已在 ${SHOWS.find(x=>x.id===sh).name} 投給${songName(so)}`); break; }
      if(meBlocked()) break; const sid=t.dataset.v, sh=t.dataset.s, wk=curWeek(), v=S.get(K.msVotes,{}), m=S.get(K.msMine,{});
      if(m[myVoteKey(sh)]) break; if(showEnded(sh,wk)){ toast("這個節目這週已經結束了"); break; } addShowVote(sid,sh); m[myVoteKey(sh)]=sid; S.set(K.msMine,m);
      const r0=t.getBoundingClientRect(); confetti(r0.left+r0.width/2,r0.top+r0.height/2); openVote(sid); { const y=window.scrollY; render(); window.scrollTo(0,y); } { const so=songOf(sid), mc=so&&giveMcCard(so.gid,sh); toast(mc?`已在 ${SHOWS.find(x=>x.id===sh).name} 投給${songName(so)}・拿到 ${itemName(mc)} 🎤`:`已在 ${SHOWS.find(x=>x.id===sh).name} 投給${songName(so)}`); } break; }
    case "openSigned": layer.innerHTML=""; navTo("#/fan/core?p=signed"); window.scrollTo(0,0); break;
    default: return CLICK_NO;
  } }

/* =========================================================
   點擊動作（教學、主題、藝人頁、簽售）：從 10-點擊互動.js 的大 switch 搬出來，內容沒改
   回傳 CLICK_NO＝這裡沒有這個動作，交給下一份
   ========================================================= */
function clickTheme(a,t,e,r){ switch(a){
    case "coachNext": if(ui.coach){ if(ui.coach.kind==="welcome"||ui.coach.kind==="next"){ ui.coach=null; fullTourStart(); break; } ui.coach.i++; coachShow(); } break;
    case "coachSkip": coachEnd(); break;
    case "coachSkipSec": if(ui.coach&&ui.coach.kind==="full") fullNext(); else coachEnd(); break;
    case "coachAgain": { const e=(session()||{}).email||"", d=S.get(K.onboard,{}), T=S.get(K.tours,{}); Object.keys(d).forEach(k=>{ if(k===e||k.startsWith(e+"|")) delete d[k]; }); Object.keys(T).forEach(k=>{ if(k.startsWith(e+"|")) delete T[k]; }); S.set(K.onboard,d); S.set(K.tours,T); window.scrollTo(0,0); coachWelcome(); break; }
    case "theme": navTo("#/"+session().role+"/look"); break;
    case "thStore": navTo("#/"+session().role+"/tint"); break;
    case "thOpen": ui.thPvDark=document.documentElement.getAttribute("data-theme")==="dark"; navTo("#/"+session().role+"/tint?id="+t.dataset.v); break;
    case "thPv": ui.thPvDark=t.dataset.v==="1"; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "thLook": navTo("#/"+session().role+"/look"); break;
    case "thBuy": { const x=thById(t.dataset.v); if(!x) break; if(!x.price){ thBuy(x.id); break; } iosAlert("購買主題",`用 ${fmt(x.price)} 積分購買「${esc(x.name)}」？`,`<button data-a="tCloseLayer">取消</button><button data-a="thBuyOk" data-v="${x.id}">購買</button>`); break; }
    case "thBuyOk": thBuy(t.dataset.v); break;
    case "thUse": thUse(t.dataset.v); break;
    case "thDel": { const id=t.dataset.v, x=thById(id); iosAlert("刪除主題",`要刪除「${esc(x?x.name:"")}」嗎？刪除後要重新到 ${TH_STORE} 下載。`,`<button data-a="tCloseLayer">取消</button><button data-a="thDelOk" data-v="${id}" class="danger">刪除</button>`); break; }
    case "thDelOk": { const id=t.dataset.v; S.set(acK(K.thOwned),S.get(acK(K.thOwned),[]).filter(x=>x!==id)); { const R0=thRot(); S.set(acK(K.thRot),{...R0,sel:R0.sel.filter(x=>x!==id)}); } if(S.get(acK(K.thCur),"")===id) S.set(acK(K.thCur),""); layer.innerHTML=""; applyTheme(); render(); break; }
    case "thRotSw": { const R0=thRot(); const sel=R0.sel.length?R0.sel:[thCurId()]; S.set(acK(K.thRot),{...R0,on:!R0.on,sel,last:R0.on?R0.last:Date.now()}); { const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    case "thRotPick": { const R0=thRot(), id=t.dataset.v, sel=R0.sel.includes(id)?R0.sel.filter(x=>x!==id):[...R0.sel,id]; S.set(acK(K.thRot),{...R0,sel}); { const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    case "thEveryOpen": iosSheet(TH_EVERY.map(([h,l])=>[l+(thRot().every===h?"  ✓":""),"thEvery",`data-v="${h}"`])); break;
    case "thEditMode": ui.thEditMode=!ui.thEditMode; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "thEdV": ui.thEdV=t.dataset.v; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "thEvery": { S.set(acK(K.thRot),{...thRot(),every:+t.dataset.v}); layer.innerHTML=""; { const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    
    
    
    case "lkKey": lockKey(t.dataset.v); break;
    case "lkCancel": ui.lk=null; lockPaint(); break;
    case "lkForgot": iosAlert("忘記密碼","登出後重新登入，密碼鎖就會關掉。",`<button data-a="tCloseLayer">取消</button><button data-a="lkReset">登出</button>`); break;
    case "lkReset": S.set(acK(K.lockCfg),{on:false,pin:""}); ui.lk=null; lockPaint(); layer.innerHTML=""; SS.del(); go("auth"); break;
    case "thAdmin": navTo("#/admin/themes"); break;
    case "thMine": navTo("#/artist/thmine"); break;
    case "thNew": ui.thDraft=null; ui.thImportRep=null; navTo("#/"+session().role+"/thedit"); break;
    case "thEdit": ui.thDraft=null; ui.thImportRep=null; navTo("#/"+session().role+"/thedit?id="+t.dataset.v); break;
    case "thScope": { const d=thDraft(r.id); d.scope=t.dataset.v; { const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    case "thWho": { const d=thDraft(r.id); if(d.scope==="group") d.gid=t.dataset.v; else { d.mid=t.dataset.v; d.gid=MEMBERS[d.mid]?MEMBERS[d.mid].group:d.gid; } { const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    case "thModes": { const d=thDraft(r.id); d.modes=t.dataset.v; { const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    case "thImgX": { const d=thDraft(r.id); thSetF(d,t.dataset.f,""); if(d.meta) delete d.meta[t.dataset.f]; if(t.dataset.f.startsWith("icons.")) delete d.icons[t.dataset.f.slice(6)]; { const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    case "thSave": thSave(t.dataset.v||null); break;
    case "tArtDrawer": openTieArtDrawer(t.dataset.m||session().member); break;
    case "artBioEd": { const mid=session().member||uniMe(); ui.artPl=t.dataset.v==="tie"?"tie":""; ui.artFromDrawer=!!t.closest(".t-drawer-w"); tieModal("個人簡介",ui.artPl?"粉絲在 TIE 點你的頭貼時會看到。":"",`<textarea id="artBioIn" class="t-wel-ta" placeholder="輸入文字">${esc(ui.artPl?tieProf(mid).bio:(artProf(mid).bio||""))}</textarea><button class="t-mbtn main" data-a="artBioOk">儲存</button><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break; }
    case "artColorEd": { const mid=session().member||uniMe(), cur=artColor(mid); tieModal("我的顏色",`<span class="ac-pick">${ART_COLORS.map(([c,n])=>`<button class="${c===cur?"on":""}" data-a="artColorSet" data-v="${c}"><i style="background:${c}"></i><span class="t-badge" style="background:${c}">ARTIST</span><small>${n}</small></button>`).join("")}</span>`,`<button class="t-mbtn" data-a="tCloseLayer">完成</button>`); break; }
    case "artColorSet": { const mid=session().member||uniMe(); setArtProf(mid,{color:t.dataset.v}); layer.innerHTML=""; openTieArtDrawer(mid); { const y=window.scrollY; render(); window.scrollTo(0,y); } toast("已換成"+ART_COLORS.find(x=>x[0]===t.dataset.v)[1]); break; }
    case "artBioOk": { const mid=session().member||uniMe(); if(banBlock((document.getElementById("artBioIn")||{value:""}).value)) break; setArtProf(mid,{[ui.artPl==="tie"?"bio_tie":"bio"]:(document.getElementById("artBioIn")||{value:""}).value.trim()}); layer.innerHTML=""; render(); if(ui.artFromDrawer&&ui.artPl==="tie") openTieArtDrawer(mid,true); toast("已更新簡介"); break; }
    case "artProfOpen": openArtistProfile(t.dataset.m); break;
    case "apfClose": { const el=layer.querySelector(".apf"); if(el){ el.classList.add("out"); setTimeout(()=>{ if(layer.querySelector(".apf.out")) layer.innerHTML=""; },240); } break; }
    case "banSave": { const L=(document.getElementById("banTa")||{value:""}).value.split("\n").map(x=>x.trim()).filter(Boolean); S.set(K.banned,L); toast("已儲存 "+L.length+" 個禁用字詞"); break; }
    case "artNameEd": { const mid=session().member||uniMe(), k=ART_NK[t.dataset.v]?t.dataset.v:"tie"; ui.artFromDrawer=!!t.closest(".t-drawer-w"); tieModal(ART_NK[k],"",`<input id="artNameIn" class="a-nick-in" data-k="${k}" maxlength="16" placeholder="輸入文字" value="${esc(artName(mid,k))}"><button class="t-mbtn main" data-a="artNameOk">儲存</button><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break; }
    case "artNameOk": { const mid=session().member||uniMe(), el=document.getElementById("artNameIn")||{value:"",dataset:{}}, k=ART_NK[el.dataset.k]?el.dataset.k:"tie", v=el.value.trim(); if(!v){ toast("名稱不能空白"); break; } if(nameBlock(v)) break;
      setArtProf(mid,{[artNKey(k)]:v===MEMBERS[mid].name?"":v}); layer.innerHTML=""; render(); if(ui.artFromDrawer&&k==="tie") openTieArtDrawer(mid,true); toast("已更新"+ART_NK[k]); break; }
    case "artCoverEd": case "artAvEd": { const mid=session().member||uniMe(), cov=a==="artCoverEd"; ui.artPl=t.dataset.v==="tie"?"tie":""; ui.artFromDrawer=!!t.closest(".t-drawer-w"); const p=artProf(mid), has=ui.artPl?(cov?p.cover_tie:p.av_tie):(cov?p.cover:p.avatar); if(has){ iosSheet([[cov?"換一張背景":"換一張頭貼",cov?"artPickCover":"artPickAv"],["恢復預設",cov?"artResetCover":"artResetAv"]]); break; } }   // 還沒換過：直接打開相簿，不用多一層選單
    case "artPickCover": case "artPickAv": { const mid=session().member||uniMe(), cov=a==="artPickCover"||a==="artCoverEd"; const back=()=>{ if(ui.artFromDrawer&&ui.artPl==="tie") openTieArtDrawer(mid,true); }; if(!(ui.artFromDrawer&&layer.querySelector(".t-drawer-w"))) layer.innerHTML=""; const inp=document.createElement("input"); inp.oncancel=()=>{ if(!layer.querySelector(".t-drawer-w")) back(); }; inp.type="file"; inp.accept="image/*";
      inp.onchange=async()=>{ const f0=inp.files&&inp.files[0]; if(!f0) return; const f=await cropImg(f0,cov?{ratio:CROP_PROF}:{ratio:1,round:true,max:1080}); if(!f){ back(); return; } try{ let b=await shrinkImg(f,cov?1400:1080); if(!cov) b=await squareImg(b,1080); const tie=ui.artPl==="tie", fld=cov?(tie?"cover_tie":"cover"):(tie?"av_tie":"avatar");
        PREV[mid]={...(PREV[mid]||{}),[fld]:URL.createObjectURL(b)}; { const y=window.scrollY; render(); window.scrollTo(0,y); } back(); toast(cov?"已換上新背景":"已換上新頭貼");
        const url=(HB_ON&&await hbImgUrl("prof_"+mid+"_"+(cov?"c":"a")+"_"+Date.now().toString(36)+".jpg",b))||await new Promise(res=>{ const rd=new FileReader(); rd.onload=()=>res(rd.result); rd.readAsDataURL(b); });
        imgSwap(url,()=>{ if(PREV[mid]) delete PREV[mid][fld]; const old=((S.get(K.artProf,{})||{})[mid]||{})[fld]; if(setArtProf(mid,{[fld]:url})&&old!==url) mediaDel(old); const typing=document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName); if(!typing){ const y=window.scrollY; render(); window.scrollTo(0,y); } }); }catch(e){ toast("這張圖讀不出來"); } }; pickClick(inp); break; }
    case "artResetCover": case "artResetAv": { const mid=session().member||uniMe(), tie=ui.artPl==="tie"; delete PREV[mid]; mediaDel(((S.get(K.artProf,{})||{})[mid]||{})[a==="artResetCover"?(tie?"cover_tie":"cover"):(tie?"av_tie":"avatar")]); setArtProf(mid,a==="artResetCover"?{[tie?"cover_tie":"cover"]:""}:{[tie?"av_tie":"avatar"]:""}); layer.innerHTML=""; render(); if(ui.artFromDrawer&&tie) openTieArtDrawer(mid,true); break; }
    case "uniSec": { const r0=route(); ui.secLast=ui.secLast||{}; ui.secLast[r0.role]=location.hash; const h=ui.secLast[t.dataset.v]||UNI_SEC[t.dataset.v]; layer.innerHTML=""; ui.secSw=true; navRoot(h); window.scrollTo(0,0); break; }
    case "tLeave": openLeaveRoom(t.dataset.m); break;
    case "tLeaveOk": { const m0=t.dataset.m, L=tieLeft(); L[m0]=tiePeriod(m0); S.set(K.tieLeft,L); layer.innerHTML=""; go("fan",null,"whisper"); toast("已離開聊天室"); break; }
    case "tExpired": iosAlert("TIE 券已到期","續訂後就能再傳訊息、收到新訊息。",`<button data-a="tCloseLayer">取消</button><button data-a="goSubs">前往續訂</button>`); break;
    case "uniGo": layer.innerHTML=""; ui.sheet=null; navTo(t.dataset.v); break;
    case "uniSeg": navRoot(t.dataset.v); break;
    case "uniAnn": uniAnnOpen(); break;
    case "uniAnnTo": uniAnnKeep(); ui.annDraft.to=t.dataset.v; uniAnnOpen(); break;
    case "uniAnnGo": { uniAnnKeep(); const d=ui.annDraft; if(!d.body.trim()||(d.to!=="all"&&!d.title.trim())){ toast(d.to==="all"?"請輸入公告內容":"標題和內容都要填"); break; }
      iosAlert("確定用HAECHU官方發布嗎？",`發給：${d.to==="all"?"全部粉絲":esc(groupOf(d.to).name)+" 的粉絲"}<br><br>${esc(d.to==="all"?d.body:d.title)}`,`<button data-a="uniAnnBack">再改一下</button><button data-a="uniAnnOk">發布</button>`); break; }
    case "uniAnnBack": uniAnnOpen(); break;
    case "uniAnnOk": { const d=ui.annDraft; if(d.to==="all") publishAnnounce(d.body.trim()); else S.set(K.gNotices,[{id:"gn"+Date.now(),group:d.to,title:d.title.trim(),body:d.body.trim(),ts:Date.now()},...S.get(K.gNotices,[])]);
      ui.annDraft=null; layer.innerHTML=""; render(); toast("已用HAECHU官方發布"); break; }
    case "focFold": { const o=focFoldGet(); o[t.dataset.v]=o[t.dataset.v]?0:1; try{ localStorage.setItem(FOC_FOLD_K,JSON.stringify(o)); }catch(e){} hap(8); lsRerender(); break; }
    case "ptFold": ui.ptOpen=!ui.ptOpen; hap(8); lsRerender(); break;
    case "uniLives": { const L=getLives().filter(l=>!l.endTs&&l.member!==uniMe()); if(!L.length){ toast("現在沒有人在直播"); break; } iosSheet(L.map(l=>[`強制結束・${esc(artName(l.member,"feed"))}「${esc(l.title)}」`,"admEndLive",`data-id="${l.id}"`])); break; }
    case "ptP": ui.ptP=t.dataset.v; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "ptShare": iosAlert("藝人分得比例","藝人收到的積分裡，有幾 % 歸藝人（其餘是扣除的部分）",`<button data-a="tCloseLayer">取消</button><button data-a="ptShareOk">儲存</button>`,`<label class="pt-in"><input id="ptShareIn" type="number" inputmode="numeric" min="0" max="100" value="${revShare()}"><span>%</span></label>`); break;
    case "ptShareOk": { const v=Math.max(0,Math.min(100,parseInt((document.getElementById("ptShareIn")||{}).value,10)||0)); S.set(K.revShare,v); layer.innerHTML=""; render(); toast(`已改成 ${v}%`); break; }
    case "postMod": { const p=getPosts().find(x=>x.id===t.dataset.id); if(!p||!canModerate()) break; iosSheet([[p.hidden?"恢復顯示":"隱藏這則","hide",`data-id="${p.id}"`],["刪除","admDel",`data-id="${p.id}"`]]); break; }
    case "thGuide": openThGuide(); break;
    case "thAutoCol": { const d=thDraft(r.id); thAutoColor(d).then(()=>{ const y=window.scrollY; render(); window.scrollTo(0,y); }); break; }
    case "thDarkGen": { const d=thDraft(r.id); thDarkFrom(d); ui.thEdV="dark"; { const y=window.scrollY; render(); window.scrollTo(0,y); } toast("已產生深色版，可以再微調"); break; }
    case "thOk": case "thNo": case "thOnOff": { const L=getThemes(), x=L.find(z=>z.id===t.dataset.v); if(!x) break; x.status=a==="thOk"?"on":a==="thNo"?"rejected":x.status==="on"?"off":"on"; saveThemes(L); applyTheme(); { const y=window.scrollY; render(); window.scrollTo(0,y); } toast(a==="thOk"?"已通過，上架到 "+TH_STORE:a==="thNo"?"已退回":x.status==="on"?"已上架":"已下架"); break; }
    case "themeSet": S.set(K.theme,t.dataset.v); applyTheme(); layer.innerHTML=""; render(); break;
    case "fsView": openSignedView(t.dataset.v); break;
    case "fsDemoFan": fsDemoLive(false); navTo("#/fan/core?p=fansign&id=fsshow"); window.scrollTo(0,0); break;
    case "fsDemoDesk": fsDemoLive(true); navTo("#/artist?tab=foc&p=fansign&id=fsshow"); window.scrollTo(0,0); break;
    case "fsJoin": if(fsJoin(t.dataset.v,t.dataset.m)){ const y=window.scrollY; render(); window.scrollTo(0,y); toast(`報名成功${t.dataset.m?"（"+artName(t.dataset.m,"feed")+"）":""}！目前 1 次機會 💜`); } break;
    case "fsBuy": { const ev=fsGet(t.dataset.v), mid=t.dataset.m; if(!ev) break; ask(`買一張 ${esc(fsName(ev))} 專輯（${fmt(MERCH.find(x=>x.k==="album").pts)} 積分），${mid?esc(artName(mid,"feed"))+" 的":""}抽籤機會多 1 次。`,()=>{ if(fsBuy(ev.id,mid)){ const y=window.scrollY; render(); window.scrollTo(0,y); toast(`目前 ${fsEntries(fsGet(ev.id),mid)[FS_ME]} 次機會 💿`); } },{title:"買專輯增加機會",ok:"買專輯",danger:false}); break; }
    case "fsNote": { const ev=fsGet(t.dataset.v); if(!ev) break; const x=(fsMySlots(ev)[0]||{}).s||{}; ui.fsGreet=[...(x.greet||[])];
      tieModal(ev.toSign?"簽售資料":"想問的話",`${ev.toSign?`<span class="fs-f-lab">To 簽的名字（只能用韓文或英文，不能有符號）</span><input id="fsToIn" class="a-nick-in" maxlength="12" placeholder="輸入文字" value="${esc(x.toName||"")}">
        <span class="fs-f-lab">想要的祝福語（最多選 2 個，不選就交給成員發揮）</span><span class="fs-greets">${FS_GREETS.map(g=>`<button class="chip ${ui.fsGreet.includes(g)?"on":""}" data-a="fsGreet" data-v="${g}">${g}</button>`).join("")}</span>`:""}
        <span class="fs-f-lab">想問的話（通話開始前會先給成員看）</span><textarea id="fsNoteIn" class="t-wel-ta" placeholder="輸入文字">${esc(x.note||"")}</textarea>`,`<button class="t-mbtn main" data-a="fsNoteSave" data-v="${ev.id}">儲存</button><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break; }
    case "fsGreet": { const g=t.dataset.v, l=ui.fsGreet||(ui.fsGreet=[]); if(l.includes(g)) l.splice(l.indexOf(g),1); else { if(l.length>=2){ toast("最多選 2 個"); break; } l.push(g); } t.classList.toggle("on",l.includes(g)); break; }
    case "fsNoteSave": { const ev=fsGet(t.dataset.v); if(!ev) break; const v=(document.getElementById("fsNoteIn").value||"").trim(), ti=document.getElementById("fsToIn"), to=ti?ti.value.trim():"";
      if(ti&&!fsToOk(to)){ toast("To 名字只能用韓文或英文，1～12 個字"); break; }
      ev.slots.forEach(x=>{ if(x.fk===FS_ME){ x.note=v; if(ti){ x.toName=to; x.greet=[...(ui.fsGreet||[])]; } } }); fsSave(ev); layer.innerHTML=""; const y=window.scrollY; render(); window.scrollTo(0,y); toast("存好了 📝"); break; }
    case "fsRoom": layer.innerHTML=""; navTo("#/fan/core?p=fansign&id="+t.dataset.v); window.scrollTo(0,0); break;
    case "fsDesk": navTo("#/artist?tab=foc&p=fansign&id="+t.dataset.v); break;
    case "fsTo": ui.fsCreate={...(ui.fsCreate||{}),title:(document.getElementById("fsTitle")||{}).value||"",start:(document.getElementById("fsStartAt")||{}).value,toSign:t.dataset.v==="1"}; lsRerender(); break;
    case "fsType": case "fsGid": case "fsQuota": case "fsSpecials": { const k={fsType:"type",fsGid:"gid",fsQuota:"quota",fsSpecials:"specials"}[a]; ui.fsCreate={...(ui.fsCreate||{}),title:(document.getElementById("fsTitle")||{}).value||"",start:(document.getElementById("fsStartAt")||{}).value,[k]:/^\d+$/.test(t.dataset.v)?+t.dataset.v:t.dataset.v}; lsRerender(); break; }
    case "fsCreate": { const cr=ui.fsCreate||{}, gid=cr.gid||(GROUPS.find(g=>fsActiveGroup(g.id))||{}).id, ti=document.getElementById("fsTitle").value.trim(), st=new Date(document.getElementById("fsStartAt").value).getTime();
      if(!gid||!fsActiveGroup(gid)){ toast("這團現在不是歌曲活動期，不能開簽售"); break; } if(!ti){ toast("請輸入簽售名稱"); break; }
      if(!(st-5*864e5>Date.now())){ toast("簽售開始要在 5 天以後（開始前 5 天要截止報名抽籤）"); break; }
      fsCreate({gid,type:cr.type||"all",title:ti,startTs:st,quota:cr.quota||10,specials:cr.specials??3,toSign:cr.toSign!==false}); ui.fsCreate=null; lsRerender(); toast("簽售開放報名，粉絲收到通知 ✍️"); break; }
    case "fsDraw": ask("現在就截止報名並抽籤嗎？",()=>{ const ev=fsDraw(fsGet(t.dataset.v)); lsRerender(); toast(ev.slots.length?`抽出 ${ev.slots.length} 位 🎉`:"沒有人報名"); },{ok:"抽籤",danger:false}); break;
    case "fsStartAdm": fsStart(t.dataset.v); lsRerender(); toast("簽售開始了，藝人可以進簽售台"); break;
    case "fsAdmSkip": ask("這位粉絲缺席了嗎？會由候補遞補到最後面。",()=>{ const sub=fsSkip(t.dataset.v); lsRerender(); toast(sub?`由候補 ${sub.name} 遞補`:"沒有候補了，直接換下一位"); },{ok:"缺席",danger:false}); break;
    case "fsAdmNext": fsNext(t.dataset.v,{wholeFan:true}); lsRerender(); break;
    case "fsAdmEnd": ask("要提早結束這場簽售嗎？還沒輪到的粉絲就簽不到了。",()=>{ const ev=fsGet(t.dataset.v); if(ev){ ev.status="done"; fsSave(ev); } lsRerender(); },{ok:"結束簽售"}); break;
    case "fsDel": ask("確定要刪除這場簽售嗎？",()=>{ S.set(K.fs,fsAll().filter(e=>e.id!==t.dataset.v)); lsRerender(); }); break;
    case "fsPad": openSignPad(t.dataset.v); break;
    case "fsPen": ui.fsPen=t.dataset.v; layer.querySelectorAll('[data-a="fsPen"]').forEach(b=>b.classList.toggle("on",b===t)); break;
    case "fsPadClear": { if(ui.kp&&ui.kp.alive()) ui.kp.clear(); const cv=document.getElementById("fsCanvas"); if(cv){ cv.getContext("2d").clearRect(0,0,cv.width,cv.height); ui.fsInk=false; } break; }
    case "fsPadDone": { const cv=document.getElementById("fsCanvas"), ev=fsGet(t.dataset.v); if(!cv||!ev) break; if(ui.kp&&ui.kp.alive()){ ui.fsInk=ui.kp.has(); if(ui.fsInk) ui.kp.exportTo(cv); } if(!ui.fsInk){ toast("還沒有簽名喔"); break; }
      const o=document.createElement("canvas"); o.width=300; o.height=300; o.getContext("2d").drawImage(cv,0,0,300,300);
      const s2=fsSlot(ev), m0=((document.getElementById("fsPadMsg")||{}).value||"").trim(); fsSign(ev.id,fsSignKey(ev,s2),session().member,{sig:o.toDataURL("image/png"),msg:m0}); layer.innerHTML=""; toast(`簽好了，${s2.name} 會收到簽名專輯 ✍️`); break; }
    case "demoToggle": S.set(K.demoOn,!demoOn()); lsRerender(); toast(demoOn()?"示範按鈕顯示中":"示範按鈕已隱藏，成員看不到了"); break;
    default: return CLICK_NO;
  } }

/* =========================================================
   點擊動作（直播間與演唱會）：從 10-點擊互動.js 的大 switch 搬出來，內容沒改
   回傳 CLICK_NO＝這裡沒有這個動作，交給下一份
   ========================================================= */
function clickLive(a,t,e,r){ switch(a){
    case "coreTip": tieModal("打歌規則",MUSIC_RULES()+`<br>本週：${esc(weekType())}・結算 ${esc(getSched().deadline)}`,`<button class="t-mbtn main" data-a="tCloseLayer">我知道了</button>`); break;
    case "concertOn": concertOn(); break;
    case "dlTap": { const ev=window.event, tg=ev&&ev.target; if(tg&&tg.closest&&tg.closest("form,input,.cm-tick,.host-feed,.sp-card,.dl-ask")) break; t.classList.toggle("ui-on"); ui.dlUi=t.classList.contains("ui-on"); break; }
    case "bgmTap": bgmTap(t.dataset.id); break;
    case "bgmAdd": ui.bgmPick=true; bgmRefresh(); break;   /* 先選：檔案或照片圖庫（iPhone 一個按鈕只能開其中一種） */
    case "bgmAddF": ui.bgmPick=false; bgmAdd(); break;
    case "bgmAddV": ui.bgmPick=false; bgmAdd(true); break;
    case "rpBgm": rpBgm(t.dataset.v); break;
    case "bgmUp": { const mid=session().member, A=S.get(K.bgm,{}), L=(A[mid]||[]).slice(), i=+t.dataset.i; if(i<1) break; [L[i-1],L[i]]=[L[i],L[i-1]]; A[mid]=L; S.set(K.bgm,A);   /* 藝人自己排播放順序 */
      const lv=myLive(mid); if(lv&&!lv.endTs&&(lv.bgm||[]).length){ const B=lv.bgm.slice(), j=B.findIndex(x=>x.mid===L[i-1].mid), k=B.findIndex(x=>x.mid===L[i].mid); if(j>=0&&k>=0){ [B[j],B[k]]=[B[k],B[j]]; bgmKeep(lv,()=>{ lv.bgm=B; }); saveLive(lv); } }
      bgmRefresh(); break; }
    case "bgmDel": { const mid=session().member, A=S.get(K.bgm,{}), L=(A[mid]||[]).slice(); L.splice(+t.dataset.i,1); A[mid]=L; S.set(K.bgm,A); bgmRefresh(); break; }
    case "bgmOpen": openBgmSheet(); break;
    case "dlChat": { ui.dlChatOff=!ui.dlChatOff; const r0=document.querySelector(".dl"); if(r0) r0.classList.toggle("chat-off",ui.dlChatOff); break; }
    case "dlLeave": { const host=!!document.querySelector(".dl.host"), r0=document.querySelector(".dl"); if(!r0) break; r0.querySelector(".dl-ask")?.remove(); const l0=getLive(t.dataset.id), gst=host&&l0&&l0.member!==session().member;
      const w=document.createElement("div"); w.className="dl-ask"; w.innerHTML=`<div class="dl-ask-c"><b>${gst?"離開連線":host?"結束直播":"離開直播"}</b><p>${gst?"要離開這場連線嗎？":host?"要結束直播嗎？":"要離開直播嗎？"}</p><div><button data-a="dlAskX">取消</button><button class="on" data-a="${gst?"coLeave":host?"dlEnd":"dlOut"}" data-id="${t.dataset.id}">${gst?"離開":host?"結束":"離開"}</button></div></div>`; r0.appendChild(w); break; }
    case "coLeave": { const l=getLive(t.dataset.id); if(l&&l.co){ l.co.st="left"; saveLive(l); } ui.hostReply=null; ui.dlUi=false; render(); toast("已離開連線"); break; }
    case "coMenu": { const l=getLive(t.dataset.id); if(!l) break; if(l.co&&(l.co.st==="inv"||l.co.st==="on")){ iosSheet([[l.co.st==="on"?`結束和 ${MEMBERS[l.co.mid]?MEMBERS[l.co.mid].name:""} 的連線`:"取消邀請","coStop",`data-id="${l.id}"`]]); break; }
      const me=session().member, L=Object.keys(MEMBERS).filter(id=>id!==me&&MEMBERS[id]&&!MEMBERS[id].official&&groupOf(MEMBERS[id].group)&&Object.values(ACCOUNTS).some(a=>a&&a.member===id));
      if(!L.length){ toast("還沒有其他藝人可以連線"); break; }
      const myG=MEMBERS[me]&&MEMBERS[me].group, busy=id=>liveNow(id)?"直播中":liveGuestOf(id)?"連線中":"", tag=id=>{ const g=groupOf(MEMBERS[id].group); return g.id===myG?"同團":g.solo?"SOLOIST":g.name; };
      L.sort((a,b)=>(MEMBERS[b].group===myG)-(MEMBERS[a].group===myG)||!!busy(a)-!!busy(b));
      tieModal("邀請連線","",`<div class="co-l">${L.map(id=>{ const bz=busy(id); return `<button class="co-r ${bz?"off":""}" ${bz?"disabled":`data-a="coPick" data-id="${l.id}" data-v="${id}"`}><i class="dl-av" style="background:${grad(MEMBERS[id].g)}">${mAvIn(id)}</i><b>${esc(MEMBERS[id].name)}</b><small>${bz?`<em class="co-bz">${bz}</em>`:esc(tag(id))}</small></button>`; }).join("")}</div><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break; }
    case "coPick": { const l=getLive(t.dataset.id); if(!l||l.endTs) break; l.co={mid:t.dataset.v,st:"inv",ts:Date.now()}; saveLive(l); layer.innerHTML=""; toast(`已邀請 ${MEMBERS[t.dataset.v].name}，等對方接受`); render(); break; }
    case "coStop": { const l=getLive(t.dataset.id); if(l&&l.co){ l.co.st="left"; saveLive(l); } layer.innerHTML=""; render(); break; }
    case "coYes": { const me=session().member, l=getLive(t.dataset.id); if(!l||l.endTs||!l.co||l.co.mid!==me){ toast("這場直播已經結束了"); render(); break; } if(liveNow(me)){ toast("你正在直播，先結束自己的直播"); break; }
      l.co.st="on"; l.co.was=1; l.co.at=Date.now(); saveLive(l); const gm=MEMBERS[me]; try{ feedPush({kind:"live",member:l.member,guest:me,group:gm.group,text:l.title,liveId:l.id,color:null},"g:"+gm.group); }catch(e){} go("artist",null,"live"); break; }
    case "coNo": { const l=getLive(t.dataset.id); if(l&&l.co&&l.co.mid===session().member){ l.co.st="no"; saveLive(l); } render(); break; }
    case "dlAskX": document.querySelector(".dl-ask")?.remove(); break;
    case "dlOut": ui.dlUi=false; navBack(); break;
    case "dlEnd": endLive(t.dataset.id); ui.hostReply=null; ui.dlUi=false; render(); window.scrollTo(0,0); toast("直播已結束，可以在重播裡回顧"); break;
    case "dlMini": { ui.lvMini=t.dataset.id; ui.dlUi=false; const ss=session(); if(ss.role==="artist"&&!isUni()) go("artist",null,"home"); else if(document.querySelector(".dl.host")) navTo("#/artist?tab=home"); else { history.length>1?navBack():go(ss.role); } setTimeout(lvMiniMount,60); break; }
    case "lvMiniOpen": { const l=getLive(ui.lvMini); const ss=session(); if(!l){ ui.lvMini=null; lvMiniMount(); break; } const host=ss.role==="artist"||(isUni()&&route().role==="artist"); ui.lvMini=null; lvMiniMount(); if(host&&l.member===(ss.member||uniMe())) navTo("#/artist?tab=live"); else navTo("#/"+(isUni()?"fan":ss.role)+"/live?id="+l.id); break; }
    case "lvMiniX": ui.lvMini=null; lvMiniMount(); break;
    case "rpSort": ui.rpSort=t.dataset.v; { const y=window.scrollY; render(); window.scrollTo(0,y); } break;
    case "stOff": stOff(); break;
    case "stMenu": stMenu(); break;
    case "stNoop": break;
    case "stShX": { const w=layer.querySelector(".st-shw"); if(w){ w.classList.remove("open"); setTimeout(()=>w.remove(),220); } break; }
    case "stColor": lsCtl({color:t.dataset.v||null}); stRefresh(); break;
    case "stFx": lsCtl({fx:t.dataset.v}); stRefresh(); break;
    case "stCmd": { const v=t.dataset.v; if(v==="text"){ stSheet(`<b class="st-sht">全場排字</b><input id="stTxt" class="st-in" maxlength="6" placeholder="例如：LUNA ♡"><button class="st-ok" data-a="stTextOk">開始排字</button><button class="st-cancel" data-a="stShX">取消</button>`); setTimeout(()=>{ const i=document.getElementById("stTxt"); if(i) i.focus(); },250); break; }
      if(v==="mission") lsCmd("mission",{target:3000}); else lsCmd(v); stRefresh(); break; }
    case "stTextOk": { const v=(document.getElementById("stTxt")||{value:""}).value.trim(); if(!v) break; lsCmd("text",{text:v}); layer.querySelector(".st-shw")?.remove(); stRefresh(); break; }
    case "stBd": { const id=t.dataset.v, x=bdAll().find(y=>y.id===id); if(!x||x.ans) break; const a=BD_ACTS.find(y=>y[0]===x.act); if(a){ stReply(id,a[2]); break; }
      stSheet(`<div class="st-bdq">${bdHtml(x,(curConcert()||{}).gid,true)}</div><input id="stRep" class="st-in" maxlength="30" placeholder="回應這塊板子"><button class="st-ok" data-a="stRepOk" data-v="${id}">送出</button><button class="st-cancel" data-a="stShX">取消</button>`); break; }
    case "stRepOk": { const v=(document.getElementById("stRep")||{value:""}).value.trim(); if(!v) break; if(!isAdminAcct()&&banBlock(v)) break; stReply(t.dataset.v,v); layer.querySelector(".st-shw")?.remove(); break; }
    case "stCo": { const c=curConcert(); if(!c||c.demo) break; const L=S.get(K.concerts,[]), x=L.find(y=>y.id===c.id); if(!x) break; x.co=x.co===t.dataset.v?null:t.dataset.v; saveConcerts(L); layer.querySelector(".st-shw")?.remove(); toast(x.co?`${artName(x.co,"feed")} 會跟你一起控燈`:"已取消"); break; }
    case "stPlay": { const sid=t.dataset.v; if(!sid){ lsCtl({play:null}); } else { if(sid==="demo"){ ui.rgDemoG=MEMBERS[ui.stMid].group; trackBuffer("demo"); } lsCtl({play:{sid,at:Date.now()+3000}}); } layer.querySelector(".st-shw")?.remove(); toast(sid?"3 秒後開始":"已停止"); break; }
    case "stEnd": { const c=curConcert(); layer.querySelector(".st-shw")?.remove(); if(!c) break; if(c.demo){ ui.lsDemo=null; stOff(); break; } const L=S.get(K.concerts,[]), x=L.find(y=>y.id===c.id); if(x){ x.ended=true; x.endTs=Math.min(x.endTs,Date.now()); saveConcerts(L); } stOff(); toast("演唱會結束了，辛苦了 💜"); break; }
    case "stOn": artStageOn(); break;

    case "bdOpen": { const c=bdConcert(); if(!c){ toast("開演前 10 分鐘才能製作應援板"); break; } ui.bdC=c.id; if(!ui.bd||ui.bdFor!==c.id){ const ms=grpMembers(c.gid).filter(x=>!MEMBERS[x].official); ui.bd={tg:ms[0]||"all",act:"heart",custom:false,text:"",bg:0,br:"solid",st:"💜"}; ui.bdFor=c.id; } let el=document.getElementById("bdLayer"); if(!el){ el=document.createElement("div"); el.id="bdLayer"; el.className="bd-layer"; document.body.appendChild(el); } bdRender(); break; }
    case "bdClose": bdClose(); break;
    case "bdSet": { const el=document.getElementById("bdText"); if(el) ui.bd.text=el.value; const k=t.dataset.k, v=t.dataset.v; if(k==="act"){ if(v===""){ ui.bd.custom=true; ui.bd.act=null; } else { ui.bd.custom=false; ui.bd.act=v; } } else if(k==="bg") ui.bd.bg=+v; else ui.bd[k]=v; bdRender(); break; }
    case "bdSave": { const el=document.getElementById("bdText"); if(el) ui.bd.text=el.value; const d=ui.bd, L=bdAll(); if(d.custom&&!(d.text||"").trim()){ toast("先寫一句話"); break; } if(d.custom&&!isAdminAcct()&&banBlock(d.text)) break; if(L.filter(x=>x.cid===ui.bdC&&x.mine).length>=3){ toast("最多 3 塊，先刪掉一塊"); break; } L.push({id:"bd"+Date.now(),cid:ui.bdC,tg:d.tg,act:d.custom?null:d.act,text:d.custom?d.text.trim().slice(0,15):"",bg:d.bg,br:d.br,st:d.st,up:false,mine:true,ts:Date.now()}); bdSave(L); bdRender(); toast("已儲存，互動歌的時候可以舉起來"); break; }
    case "bdHold": { const L=bdAll(), x=L.find(y=>y.id===t.dataset.v), c=bdFind(ui.bdC); if(!x||!c) break; if(x.ans){ toast("這塊已經被回應過了，做一塊新的吧"); break; } if(x.up){ x.up=false; } else { if(!bdHoldOk(c)){ toast("互動歌的時候才能舉牌"); break; } L.forEach(y=>{ if(y.mine&&y.cid===x.cid) y.up=false; }); x.up=true; x.ts=Date.now(); toast("舉起來了，等藝人回應"); } bdSave(L); bdRender(); break; }
    case "bdDel": { bdSave(bdAll().filter(y=>y.id!==t.dataset.v)); bdRender(); break; }
    case "bdPick": { ui.bdSel=t.dataset.v; const c=curConcert(), ss=session(), w=document.getElementById("bdWall"), r=document.getElementById("bdRep"); if(c&&w&&r){ w.innerHTML=bdWallHtml(c,ss.member); r.innerHTML=bdRepHtml(c,ss.member); } break; }
    case "bdReply": { const L=bdAll(), x=L.find(y=>y.id===ui.bdSel), ss=session(); if(!x) break; let txt; if(x.act){ txt=BD_ACTS.find(a=>a[0]===x.act)[2]; } else { const el=document.getElementById("bdRepText"); txt=((el&&el.value)||"").trim(); if(!txt){ toast("先打字再送出"); break; } } x.ans={by:ss.member,text:txt,ts:Date.now()}; x.up=false; bdSave(L); ui.bdSel=null; const c=curConcert(), w=document.getElementById("bdWall"), r=document.getElementById("bdRep"); if(c&&w&&r){ w.innerHTML=bdWallHtml(c,ss.member); r.innerHTML=""; } toast("已回應"); break; }
    case "ccMenu": { const c=layer.querySelector(".concert2"); if(c) c.classList.toggle("menu-on"); break; }
    case "rgJoin": { const v=ui.rgInv; const iv=document.getElementById("ccInv"); if(iv) iv.hidden=true; if(v){ audioUnlock(); rgStart({sid:v.sid,at:v.at,mode:"concert"}); } break; }
    case "acSong": { const el=document.getElementById("acTitle"); if(el) ui.acTitle=el.value; const v=t.dataset.v, set=(ui.acSet||[]).slice(), k=set.indexOf(v); if(k>=0) set.splice(k,1); else set.push(v); ui.acSet=set; if(ui.acIa!=null) ui.acIa=Math.min(ui.acIa,set.length); { const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    case "acIa": { const el=document.getElementById("acTitle"); if(el) ui.acTitle=el.value; const len=(ui.acSet||[]).length, cur=ui.acIa==null?Math.min(2,len):ui.acIa; ui.acIa=Math.max(0,Math.min(len,cur+(+t.dataset.v))); { const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    case "acNow": case "acLater": { const el=document.getElementById("acTitle"), title=((el&&el.value)||"").trim(), mid=session().member, set=ui.acSet||[]; if(!title){ toast("先填演唱會名稱"); break; } if(!set.length){ toast("先選至少 1 首歌"); break; } const gid=MEMBERS[mid].group, nIa=ui.acIa==null?Math.min(2,set.length):ui.acIa; if(set.includes("demo")){ ui.rgDemoG=gid; trackBuffer("demo"); } const r=concertCreate({gid,title,startTs:t.dataset.a==="acLater"?Date.now()+600000:Date.now()-1000,mins:120,host:mid,setlist:set.map(sid=>({sid})),nIa}); if(r.err){ toast(r.err); break; } ui.acTitle=""; ui.acSet=[]; ui.acIa=null; concertTick(); render(); if(t.dataset.a==="acLater") toast("已排定 10 分鐘後開演，粉絲現在可以做應援板"); else setTimeout(artStageOn,120); break; }
    
    case "rgLv": { S.set(K.rgLv,rgLv()==="easy"?"normal":"easy"); t.textContent="音樂難度："+(rgLv()==="easy"?"輕鬆":"普通"); toast(rgLv()==="easy"?"輕鬆：兩拍揮一次，下一首開始生效":"普通：每一拍都揮，下一首開始生效"); break; }
    case "rgQuit": { const st=ui.rg; if(st&&!st.ended&&st.mode==="concert"){ rgFinish(true); } else rgClose(); break; }
    case "rgClose": rgClose(); break;
    case "rgAgain": { const sid=t.dataset.v; rgClose(); audioUnlock(); rgStart({sid,at:Date.now()+2000,mode:"preview"}); break; }
    case "cmGroup": ui.cmGid=t.dataset.v; lsRerender(); break;
    case "cmTry": { const sid=t.dataset.v; if(sid!=="demo"&&getTracks()[sid]&&!getTracks()[sid].bpm){ tpOpen(sid); toast("先對好拍子才能試玩"); break; } if(sid==="demo") ui.rgDemoG=ui.cmGid||GROUPS[0].id; audioUnlock(); rgStart({sid,at:Date.now()+2000,mode:"preview"}); break; }
    case "cmChant": rcOpen(t.dataset.v); break;
    case "cmBpm": { const T=getTracks(), x=T[t.dataset.v]; if(!x) break; x.bpm=Math.round((x.bpm+(+t.dataset.d))*100)/100; S.set(K.tracks,T); lsRerender(); break; }
    case "cmOff": { const T=getTracks(), x=T[t.dataset.v]; if(!x) break; x.offset=Math.max(0,Math.round((x.offset+(+t.dataset.d))*1000)/1000); S.set(K.tracks,T); lsRerender(); toast(`拍子位置 ${x.offset.toFixed(2)} 秒`); break; }
    case "rcStart": rcStart(); break;
    case "rcKick": rcKick(); break;
    case "sndTest": sndTest(t.dataset.v); break;
    case "stRun": stRun(); break;
    case "stClose": { const w=document.getElementById("stW"); if(w) w.remove(); if(ui.st&&ui.st.url) URL.revokeObjectURL(ui.st.url); ui.st=null; break; }
    case "cmTap": layer.innerHTML=""; tpOpen(t.dataset.v); break;
    case "tpClose": tpClose(); break;
    case "tpSave": tpSave(); break;
    case "tpRedo": { const sid=ui.tp&&ui.tp.sid; tpClose(); if(sid) tpOpen(sid); break; }
    case "rcUndo": { const rc=ui.rc; if(rc&&rc.times.length){ rc.times.pop(); rcPaint(); } break; }
    case "rcEnd": rcEnd(); break;
    case "rcRedo": { const rc=ui.rc; if(!rc) break; const sid=rc.sid, txt=rc.lines.join("\n"); rcClose(); rcOpen(sid); const ta=document.getElementById("rcTxt"); if(ta) ta.value=txt; break; }
    case "rcSave": rcSave(); break;
    case "rcClose": rcClose(); break;
    case "lsDemo": { if(MEMBERS[demoMid()]){ const g=MEMBERS[demoMid()].group; ui.lsDemo={id:"demo",demo:true,gid:g,title:"示範演唱會",startTs:Date.now(),endTs:Date.now()+15*60e3}; lsRerender(); setTimeout(artStageOn,120); break; }
      const T=getTracks(), ids=Object.keys(T).filter(id=>songOf(id));
      if(!ids.length){ demoConcert("demo"); break; }
      tieModal("選一首歌試玩",`這支手機上已經上傳的歌：`,ids.map(id=>`<button class="t-mbtn" data-a="lsDemoPlay" data-v="${id}">《${esc(songOf(id).title)}》<small style="display:block;font-size:11px;opacity:.7">${esc(groupOf(songOf(id).gid).name)}</small></button>`).join("")+`<button class="t-mbtn" data-a="lsDemoPlay" data-v="demo">示範曲</button><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break; }
    case "lsDemoPlay": layer.innerHTML=""; demoConcert(t.dataset.v); break;
    case "cmTryM": { const sid=t.dataset.v; layer.innerHTML=""; if(getTracks()[sid]&&!getTracks()[sid].bpm){ tpOpen(sid); break; } audioUnlock(); rgStart({sid,at:Date.now()+2000,mode:"preview"}); break; }
    case "ccNow": { const list=S.get(K.concerts,[]), c=list.find(x=>x.id===t.dataset.id); if(!c) break; const len=c.endTs-c.startTs, n=Date.now();
      if(list.some(x=>x.id!==c.id&&!x.ended&&x.startTs<n+len&&x.endTs>n)){ toast("跟另一場演唱會時間重疊了"); break; }
      c.startTs=n; c.endTs=n+len; saveConcerts(list); concertTick(); lsRerender(); toast("演唱會開始了"); break; }
    case "ccDel": ask("要刪除這場演唱會嗎？",()=>{ saveConcerts(S.get(K.concerts,[]).filter(x=>x.id!==t.dataset.id)); lsRerender(); toast("已刪除"); },{title:"刪除演唱會",ok:"刪除"}); break;
    case "concertOff": concertOff(); break;
    case "goSubs": layer.innerHTML=""; ui.srch=null; go("fan",null,"shop"); window.scrollTo(0,0); break;
    case "buyOpen": openBuySheet(t.dataset.m); break;
    case "buyPlan": { ui.buyPlan=t.dataset.v; const pl=tiePlans(t.dataset.m).find(x=>x.id===ui.buyPlan)||PLANS[1];
      layer.querySelectorAll(".plan").forEach(b=>{ const on=b.dataset.v===ui.buyPlan; b.classList.toggle("on",on); b.setAttribute("aria-pressed",on); });
      const ok=layer.querySelector('[data-a="buyOk"]'); if(ok) ok.textContent=(pl.id==="grp"?!pl.pts:tieFree(t.dataset.m))?"免費訂閱":`用 ${fmt(pl.pts)} 積分購買`; break; }
    case "buyOk": { const mid=t.dataset.m, m=MEMBERS[mid], pl=tiePlans(mid).find(x=>x.id===(ui.buyPlan||"d30"))||PLANS[1]; if(m&&isSelfGid(m.group)){ layer.innerHTML=""; toast(selfBuyMsg()); break; }
      const ni=document.getElementById("buyNick"); if(ni){ const v=ni.value.trim(); if(!v){ toast("請先設定你的暱稱"); ni.focus(); break; } if(nameBlock(v)) break; saveTieSet(mid,{nickname:v}); } ui.buyNick=null;
      if(pl.id==="grp"){ if(points()<pl.pts){ layer.innerHTML=""; toast("積分不足，先補充積分吧"); break; } const nick=(S.get(K.tieSet,{})[mid]||{}).nickname;
        pl.ids.forEach(id=>{ if(nick&&!(S.get(K.tieSet,{})[id]||{}).nickname) saveTieSet(id,{nickname:nick}); buyTie(id,30,tieFree(id)?0:TIE_GRP); });
        layer.innerHTML=""; render(); toast(`已訂閱 ${groupOf(m.group).name} 全團 TIE（30 天）💜`); break; }
      const res=buyTie(mid,pl.days,planPts(mid,pl)); layer.innerHTML="";
      if(res.type==="nopts"){ toast("積分不足，先補充積分吧"); break; }
      render();
      if(res.type==="renew") toast(`已續訂 ${artName(mid,"tie")}，愛心天數保留 +${res.days} 💜`);
      break; }
    default: return CLICK_NO;
  } }

/* =========================================================
   點擊動作（TIE、餐車、貼文）：從 10-點擊互動.js 的大 switch 搬出來，內容沒改
   回傳 CLICK_NO＝這裡沒有這個動作，交給下一份
   ========================================================= */
function clickTie(a,t,e,r){ switch(a){
    case "openChatFromToast": document.querySelectorAll(".toast").forEach(x=>x.remove()); ui.srch=null; ui.scrollChat=true; navTo("#/fan/chat?m="+ui.toastMember); break;
    case "passExpire": { const all=subs(), r2=all[t.dataset.m]; r2.seenUntil=Math.max(r2.seenUntil||0,Date.now()); r2.expires=Date.now()-(t.dataset.v==="long"?25:1)*3600e3; if(r2.since>r2.expires) r2.since=r2.expires-DAY; S.set(K.tieSubs,all); render();
      toast(t.dataset.v==="long"?"示範：這張券已到期超過 24 小時":"示範：這張券剛到期（1 小時前）"); break; }
    case "wsPlus": ui.banF="all"; openAllBan(); break;
    case "banF": ui.banF=t.dataset.v; openAllBan(); break;
    case "banGo": layer.innerHTML=""; openProd(t.dataset.v); break;
    case "addPts": S.set(K.points,points()+3000); render(); toast("示範：已補充 3,000 積分"); break;
    case "tWelcome": { const cur=welcomeOf(session().member||uniMe());
      tieModal("TIE歡迎語","粉絲新訂閱你的 TIE 時，系統會立刻用你的名義送出這句話。打 @@@ 的地方，每位粉絲看到的會是自己的暱稱。",`<textarea id="welTxt" class="t-wel-ta" maxlength="200" placeholder="輸入文字">${esc(cur)}</textarea><button type="button" class="t-nick wel-nick" data-a="welNick">@@@ 插入粉絲暱稱</button><button class="t-mbtn main" data-a="tWelcomeSave">儲存</button><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break; }
    case "welNick": { const ta=document.getElementById("welTxt"); if(!ta) break; const a0=ta.selectionStart??ta.value.length, b0=ta.selectionEnd??a0; ta.value=ta.value.slice(0,a0)+"@@@"+ta.value.slice(b0); ta.focus(); ta.selectionStart=ta.selectionEnd=a0+3; break; }
    case "tWelcomeSave": { const v=document.getElementById("welTxt").value.trim(); if(!v){ toast("歡迎語不能空白"); break; }
      const w2=S.get(K.tieWelcome,{}); w2[session().member||uniMe()]=v; S.set(K.tieWelcome,w2); layer.innerHTML=""; toast("已儲存歡迎語"); break; }
    case "openChat": if(tieGate(t.dataset.m)) break; ui.srch=null; ui.tieEmoji=false; ui.scrollChat=true; layer.innerHTML="";
      navTo("#/fan/chat?m="+t.dataset.m);
      { const m1=t.dataset.m; if(!S.get(K.tieNotice,false)||(isActive(m1)&&!tieAgreed(m1))) setTimeout(()=>openTieAgree(m1,true),250); }
      break;
    
    case "tCloseLayer": if(e.target===t||t.tagName==="BUTTON"){ const d=layer.querySelector(".t-drawer-w"); if(d){ ui.tieDrw=null; d.classList.remove("open"); setTimeout(()=>layer.innerHTML="",280); } else layer.innerHTML=""; } break;
    case "tListClear": tieModal("清除對話列表","清除後，聊天室裡的舊訊息會先隱藏。之後可以到聊天室設定的「載入歷史對話」找回來。",`<button class="t-mbtn danger" data-a="tListClearOk">確定清除</button><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break;
    case "tListClearOk": clearRooms(); layer.innerHTML=""; render(); toast("已清除對話列表"); break;
    case "tDrawer": openTieDrawer(route().m); break;
    case "tMute": { const st=tieSet(t.dataset.m); saveTieSet(t.dataset.m,{muted:!st.muted}); openTieDrawer(t.dataset.m); toast(!st.muted?"已關閉這個聊天室的通知":"已開啟通知"); break; }
    case "tFav": { const st=tieSet(t.dataset.m); saveTieSet(t.dataset.m,{fav:!st.fav}); openTieDrawer(t.dataset.m); toast(!st.fav?"已加入我的最愛 ⭐":"已移出我的最愛"); break; }
    case "tTrToggle": { const st=tieSet(t.dataset.m); saveTieSet(t.dataset.m,{translate:!st.translate}); const inDrawer=!!t.closest(".t-drawer"); render(); if(inDrawer){ openTieDrawer(t.dataset.m); } break; }
    case "tBox": { const m2=route().m; layer.innerHTML=""; ui.boxEdit=false; if(m2) navTo("#/fan/chat?m="+m2+"&p=box"); break; }
    case "tGallery": layer.innerHTML=""; navTo("#/fan/chat?m="+t.dataset.m+"&p=gallery"); window.scrollTo(0,0); break;
    case "tToSettings": layer.innerHTML=""; navTo("#/fan/chat?m="+t.dataset.m+"&p=settings"); break;
    case "tTranslate": { const id=t.dataset.id, lang=tieSet(route().m).trLang||"zh"; const done=()=>{ const s2=new Set(S.get(K.tieTr,[])); s2.add(id); S.set(K.tieTr,[...s2]); const y=window.scrollY; render(); window.scrollTo(0,y); };
      const wl=getWhispers().find(x=>x.id===id); if(wl&&wl.welcome){ if(welTr(wl,lang)) done(); else { t.classList.add("busy"); welTranslate(id,lang).then(()=>{ t.classList.remove("busy"); if(welTr(wl,lang)) done(); else toast("翻譯失敗，等一下再試試"); }); } break; }
      t.classList.add("busy"); tieTrBoth(id,lang).then(ok=>{ t.classList.remove("busy"); if(ok) done(); }); break; }
    case "tLang": { const m2=t.dataset.m, cur=tieSet(m2).trLang||"zh"; tieModal("翻譯結果語言",`<span class="t-langs">${Object.entries(TR_LANGS).map(([k,v])=>`<button class="t-lang ${cur===k?"on":""}" data-a="tLangSet" data-m="${m2}" data-v="${k}">${v}${cur===k?" ✓":""}</button>`).join("")}</span>`,`<button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break; }
    case "tLangSet": { saveTieSet(t.dataset.m,{trLang:t.dataset.v}); S.set(K.tieTr,[]); layer.innerHTML=""; render(); toast("翻譯會改成 "+TR_LANGS[t.dataset.v]); break; }
    case "tRecall": recallWhisper(t.dataset.id); { const y=window.scrollY; render(); window.scrollTo(0,y); } toast("已收回訊息"); break;
    case "stkTab": { ui.stkTab=t.dataset.v; const pn=document.querySelector("#stkDock .stk-pan"); if(pn) pn.outerHTML=stkPanel(); break; }
    case "stkSend": { const tok=t.dataset.v; if(!stkOf(tok)) break; const s=session();
      if(s.role==="artist"){ const mid=s.member, Q=tieQ(mid); if(Q.length>=TQ_MAX){ toast(`一次最多 ${TQ_MAX} 則，先把待發訊息送出去吧`); break; } Q.push({text:tok,rid:ui.tReply||null}); tieQSet(mid,Q); ui.tReply=null; ui.scrollChat=true; const y=window.scrollY; render(); window.scrollTo(0,y); break; }
      const m2=route().m; if(!m2||meBlocked()) break; if(fanQuota(m2).left<=0){ quotaBar(); break; } ui.scrollChat=true; fanReply(m2,tok); render(); if(fanQuota(m2).left===0) quotaBar(); break; }
    case "tEmojiToggle": { const i=document.getElementById("win"); if(i) ui.wDraft=i.value; if(stkDockOn()){ stkDock(false); if(i) i.focus(); } else { if(i) i.blur(); stkDock(true); } break; }
    
    
    case "tEmoji": { const i=document.getElementById("win"); ui.wDraft=(i?i.value:"")+t.dataset.v; i.value=ui.wDraft; document.getElementById("wsend").classList.add("on"); i.focus(); break; }
    case "tEditName": ui.tieEditVal=null; navTo("#/fan/chat?m="+t.dataset.m+"&p=name"); break;
    case "tEditNick": ui.tieEditVal=null; navTo("#/fan/chat?m="+t.dataset.m+"&p=nick"); break;
    case "tEditBack": { const st=tieSet(t.dataset.m), val=t.dataset.w==="name"?st.chatName:st.nickname;
      if(ui.tieEditVal!=null&&ui.tieEditVal!==val) tieModal("不保存更改？","",`<button class="t-mbtn" data-a="tCloseLayer">取消</button><button class="t-mbtn main" data-a="tEditDiscard">確認</button>`,"row");
      else { ui.tieEditVal=null; navBack(); } break; }
    case "tEditDiscard": layer.innerHTML=""; ui.tieEditVal=null; navBack(); break;
    case "tEditSave": { const v=(ui.tieEditVal||"").trim(); if(!v){ toast("名稱不能空白"); break; } if(nameBlock(v)) break;
      saveTieSet(t.dataset.m,t.dataset.w==="name"?{chatName:v}:{nickname:v}); ui.tieEditVal=null; navBack(); toast("已儲存"); break; }
    case "tBgMenu": { const m2=t.dataset.m; if(!document.getElementById("tbgAlbum")){ const d=document.createElement("div"); d.innerHTML=`<input type="file" id="tbgAlbum" accept="image/*" hidden data-m="${m2}"><input type="file" id="tbgCam" accept="image/*" capture="environment" hidden data-m="${m2}">`; root.querySelector(".app").appendChild(d); }
      iosSheet([["選擇照片","tPickAlbum"],["變更背景顏色","tBgColor",`data-m="${m2}"`]]); break; }
    case "tBgColor": layer.innerHTML=""; ui.bgPick=null; ui.bgcTab="color"; navTo("#/fan/chat?m="+t.dataset.m+"&p=bgc"); break;
    case "bgcTab": ui.bgcTab=t.dataset.v; render(); break;
    case "bgcPick": ui.bgPick={mode:t.dataset.mode,v:t.dataset.v}; render(); break;
    case "tBgcOk": { const pk=ui.bgPick; if(!pk) break; const u={bgMode:pk.mode}; if(pk.mode==="color") u.bgColor=pk.v; else u.bgPattern=+pk.v; saveTieSet(t.dataset.m,u); ui.bgPick=null; toast("已變更背景"); navBack(); break; }
    case "tAgree": { const m2=t.dataset.m, A=S.get(K.tieAgree,{}); if(isActive(m2)) A[m2]=tiePeriod(m2); S.set(K.tieAgree,A); S.set(K.tieNotice,true); layer.innerHTML="";
      if(t.dataset.v==="enter") setTimeout(()=>tieCeleCheck(m2),250); else setTimeout(()=>{ const i=document.getElementById("win"); if(i) i.focus(); },50); break; }
    case "celeClose": clearTimeout(ui.celeT); layer.innerHTML=""; break;
    case "tPickSel": { const id=t.dataset.v, gid=t.dataset.g, mode=t.dataset.mode, k=mode==="new"?tpkK(gid):groupArtists(gid).filter(isActive).length, L=Array.isArray(ui.pickSet)?ui.pickSet:[];
      if(mode==="new"&&L.includes(id)&&isActive(id)){ toast("這位已經在訂閱中"); break; }
      if(L.includes(id)) ui.pickSet=L.filter(x=>x!==id); else if(L.length<k) ui.pickSet=[...L,id]; else { toast(`最多選 ${k} 位，先取消一位再選`); break; } render(); break; }
    case "pickClose": { const c=document.getElementById("pickNo"); if(c&&c.checked) S.set(K.pickNoShow,true); layer.innerHTML=""; const go=ui.pickGo; ui.pickGo=null; if(go) go(); break; }
    case "pickMore": { const c=document.getElementById("pickNo"); if(c&&c.checked) S.set(K.pickNoShow,true); layer.innerHTML=""; tieModal("更改藝人",`一張 ${WHISPER_NAME} 券在使用期間，可以把收訊息的成員換成同一團的另一位，只能換 1 次。<br>換過去之後，聊天室會變成新成員的；券到期、重新購買後，可以再換 1 次。`,`<button class="t-mbtn main" data-a="pickMoreOk">知道了</button>`); break; }
    case "pickMoreOk": { layer.innerHTML=""; const go=ui.pickGo; ui.pickGo=null; if(go) go(); break; }
    case "tPickSave": { const gid=t.dataset.g, mode=t.dataset.mode, own=groupArtists(gid).filter(isActive), sel=Array.isArray(ui.pickSet)?ui.pickSet:own, k=mode==="new"?tpkK(gid):own.length;
      if(sel.length<k){ toast(`還要再選 ${k-sel.length} 位`); break; }
      if(mode==="new"){ tpkBuyDone(gid,sel.filter(x=>!own.includes(x))); break; }
      const out=own.filter(x=>!sel.includes(x)), inn=sel.filter(x=>!own.includes(x)); if(!out.length){ navBack(); break; }
      const L=subs(), used=out.filter(x=>(L[x]||{}).swapPer===tiePeriod(x)); if(used.length){ toast(`${used.map(x=>MEMBERS[x].name).join("、")} 的券這段期間已經換過 1 次了`); break; }
      const from=t.dataset.m; openPickNotice(()=>{ out.forEach((x,i)=>{ const rec=L[x], to=inn[i]; if(!rec||!to) return; L[to]={...rec,since:Date.now(),periods:[{start:Date.now(),end:null}],swapPer:Date.now()}; delete L[x]; }); S.set(K.tieSubs,L); ui.pickSet=null; toast("已更改藝人 💜"); navTo("#/fan/chat?m="+(sel.includes(from)?from:inn[0])); }); break; }
    case "tPickGo": ui.pickSet=null; navTo("#/fan/chat?m="+t.dataset.m+"&p=pick"); break;
    case "tKeep": { const L=S.get(K.boxKeep,[])||[], id=t.dataset.id, m0=route().m, room=m0?fanRoom(m0):[]; layer.innerHTML="";
      if(L.includes(id)){ toast(`已經在 ${WHISPER_NAME} BOX 裡了`); break; }
      if(L.filter(x=>room.some(w=>w.id===x)).length>=BOX_MAX){ toast(`${WHISPER_NAME} BOX 最多收藏 ${BOX_MAX} 則，先移除一些再收藏`); break; }
      L.push(id); S.set(K.boxKeep,L); toast(`已收藏到 ${WHISPER_NAME} BOX`); break; }
    case "ptTo": { const d=ui.ptD; if(!d) break; const v=t.dataset.v; d.to=d.to.includes(v)?d.to.filter(x=>x!==v):[...d.to,v]; lsRerender(); break; }
    case "ptSign": if(ui.ptD){ ui.ptD.sign=+t.dataset.v; lsRerender(); } break;
    case "ptGo": { const d=ui.ptD; if(!d) break; const n=Math.round(+String(d.n).replace(/[^\d]/g,"")); if(!d.to.length){ toast("先選要給誰"); break; } if(!n){ toast("積分要填數字"); break; }
      const set=d.sign===0, amt=set?n:n*d.sign, by=myEmail(), now=Date.now(), L=S.get(K.ptGrants,[])||[];
      d.to.forEach((e,i)=>L.push({id:"g"+now.toString(36)+i+Math.random().toString(36).slice(2,5),to:e,n:amt,why:d.why.trim(),by,ts:now,...(set?{set:true}:{})}));
      S.set(K.ptGrants,L.slice(-2000)); toast(set?`已把 ${d.to.length} 個帳號的積分設定為 ${fmt(n)}`:`已${amt>=0?"加":"扣"} ${fmt(n)} 積分給 ${d.to.length} 個帳號`); ui.ptD={to:[],n:"",why:"",q:"",sign:1}; lsRerender(); break; }
    case "apFold": { const y=scrollY; ui.apOpen={...(ui.apOpen||{}),[t.dataset.v]:!(ui.apOpen||{})[t.dataset.v]}; render(); scrollTo(0,y); break; }
    case "apMore": { const y=scrollY; ui.apMore={...(ui.apMore||{}),[t.dataset.v]:!(ui.apMore||{})[t.dataset.v]}; render(); scrollTo(0,y); break; }
    case "snRpTg": { const d=snDB(), me=snMeId(), id=t.dataset.id; d.rp=d.rp||{}; const L=d.rp[me]||[], on=L.some(x=>x.id===id); d.rp[me]=on?L.filter(x=>x.id!==id):[{id,ts:Date.now()},...L]; snSave(d); toast(on?"已取消轉發":"已轉發到你的個人檔案"); hap(on?6:10);
      /* 只改這顆按鈕和數字（不整頁重畫，畫面不會跳） */
      const P=d.posts.find(x=>x.id===id), btns=document.querySelectorAll(`[data-a="snRpTg"][data-id="${CSS.escape(id)}"]`);
      if(btns.length&&P){ const n=snRpN(d,P); btns.forEach(b=>{ b.classList.toggle("rpd",!on); b.classList.toggle("on",!on); let c=b.querySelector("b"); if(n){ if(!c){ c=document.createElement("b"); b.appendChild(c); } c.textContent=snN(n); } else if(c&&b.closest(".sn-acts")) c.remove(); AN.bounce(b); }); }
      else { const sc=document.querySelector(".sn"), y=sc?sc.scrollTop:scrollY; render(); const s2=document.querySelector(".sn"); if(s2) s2.scrollTop=y; else scrollTo(0,y); } break; }
    case "snSugTg": ui.snSugOpen=ui.snSugOpen===t.dataset.v?null:t.dataset.v; { const y=scrollY; render(); scrollTo(0,y); } break;
    case "iosStkX": { if(e.target===t||t.tagName==="BUTTON"){ const w=t.closest(".ios-w.stk"); if(w) w.remove(); ui.amItem=null; } break; }
    case "snDmNew": { const i=document.getElementById("snDmQ"); if(i){ i.focus(); } break; }
    case "snCallX": toast("SNS 的通話和語音訊息還沒開放"); break;
    case "snDmStk": { const i=document.getElementById("snDmIn"); if(i){ i.value+=["💜","🥹","✨","😆","🫶"][Math.floor(Math.random()*5)]; i.dispatchEvent(new Event("input",{bubbles:true})); i.focus(); } break; }
    case "snDmPlus": { const f=document.querySelector(".sn-dmpic2"); if(f) f.click(); break; }
    case "boxEdit": ui.boxEdit=!ui.boxEdit; render(); break;
    case "boxDel": { if(t.closest(".ph-view,.ios-w")) layer.innerHTML=""; S.set(K.boxKeep,(S.get(K.boxKeep,[])||[]).filter(x=>x!==t.dataset.id)); if(!(S.get(K.boxKeep,[])||[]).length) ui.boxEdit=false; render(); break; }
    case "tTrSheet": { layer.innerHTML=""; const b=document.querySelector(`[data-a="tTranslate"][data-id="${t.dataset.id}"]`); if(b) b.click(); else { const s2=new Set(S.get(K.tieTr,[])); s2.add(t.dataset.id); S.set(K.tieTr,[...s2]); const y=window.scrollY; render(); window.scrollTo(0,y); } break; }
    case "tBgTab": ui.tieBgTab=t.dataset.v; openTieBgMenu(t.dataset.m); break;
    case "tBgSet": { const mode=t.dataset.mode, u={bgMode:mode};
      if(mode==="color") u.bgColor=t.dataset.v; if(mode==="pattern") u.bgPattern=Number(t.dataset.v);
      saveTieSet(t.dataset.m,u); layer.innerHTML=""; render(); break; }
    case "aTieBg": openArtTieBg(); break;
    case "trAsk": { ui.trAsk=ui.trAsk||new Set(); const k=t.dataset.k; ui.trAsk.add(k); const s=ui.trSrc[k]; t.textContent="翻譯中…"; if(cmTrGet(k)) trPaint(k); else if(s) trNeedT(k,s.text); break; }
    case "pdJump": { const l=document.getElementById("csl"); if(l) l.scrollTo({top:l.scrollHeight,behavior:"smooth"}); break; }
    case "trOrig": { ui.ptOrig=ui.ptOrig||new Set(); const k=t.dataset.k; if(ui.ptOrig.has(k)) ui.ptOrig.delete(k); else ui.ptOrig.add(k); trPaint(k); break; }
    case "tieArw": { ui.tReply=t.dataset.id; render(); const i=document.getElementById("win"); if(i) i.focus(); break; }
    
    case "tqDel": { const mid=session().member, Q=tieQ(mid); Q.splice(+t.dataset.i,1); tieQSet(mid,Q); layer.innerHTML=""; render(); break; }
    case "tqPreview": openTieQPreview(); break;
    case "tvAsk": tvUseAsk(t.dataset.v); break;
    case "tvUse": tvUse(t.dataset.v,t.dataset.m); break;
    case "meSecGo": ui.meSec=t.dataset.v; navTo("#/fan?tab=me"); render(); window.scrollTo(0,0); break;
    case "tqBack": layer.innerHTML=""; break;
    case "tqSend": iosAlert(`要傳送 ${WHISPER_NAME} 嗎？`,"確認後，訊息會一起傳送。",`<button data-a="tCloseLayer">取消</button><button data-a="tqSendOk">確認</button>`); break;
    case "tqSendOk": { const mid=session().member, Q=tieQ(mid); layer.innerHTML=""; if(!Q.length||ui.tqBusy) break; ui.tqBusy=mid; ui.scrollChat=true; render();
      (async()=>{ const up={}; await Promise.all(Q.filter(q=>q.kind).map(async q=>{ try{ const b=await MDB.get(q.mid); up[q.mid]=!!b&&await hbUpload(q.mid,b); }catch(_){} }));   /* 照片、語音先一起上傳完，訊息再照順序一次送出 */
        tieQSet(mid,[]); ui.tqBusy=null;
        for(const q of Q){ try{ if(q.kind){ if(!up[q.mid]) continue; sendWhisperMedia(mid,q.kind,q.mid,q.kind==="photo"?{w:q.w,h:q.h}:{dur:q.dur}); } else sendWhisper(mid,q.text,q.rid); }catch(_){} await new Promise(r=>setTimeout(r,8)); }
        ui.scrollChat=true; render(); tieToast("已傳送"); })(); break; }
    case "tkNew": { const ms=tkTargets(); ui.tkD={mid:ms[0]||null,shares:1,deco:{...TRUCK_DECO0(),from:tkNm()||""}}; render(); window.scrollTo(0,0); break; }
    case "tkMid": tkKeep(); ui.tkD.mid=t.dataset.v; render(); break;
    case "tkPal": tkKeep(); ui.tkD.deco.pal=+t.dataset.v; render(); break;
    case "tkTog": tkKeep(); ui.tkD.deco[t.dataset.v]=!ui.tkD.deco[t.dataset.v]; render(); break;
    case "tkShares": tkKeep(); ui.tkD.shares=Math.max(1,Math.min(5,ui.tkD.shares+(+t.dataset.v))); render(); break;
    case "tkCancel": ui.tkD=null; render(); break;
    case "tkImg": { tkKeep(); const k=t.dataset.v, inp=document.createElement("input"); inp.type="file"; inp.accept="image/*";
      inp.onchange=async()=>{ const f0=inp.files&&inp.files[0]; if(!f0||!ui.tkD) return; const f=await cropImg(f0,{ratio:TK_IMG_R[k]||1,max:1200}); if(!f) return; const b=await shrinkImg(f,560), du=b&&await blobDU(b); if(du&&ui.tkD){ ui.tkD.deco[k]=du; render(); } };
      pickClick(inp); break; }
    case "tkGo": { tkKeep(); const d=ui.tkD; if(!d||!d.mid){ toast("先選要送給誰"); break; } const share=Math.ceil(TRUCK_PRICE/d.shares), m=tkM(d.mid);
      ask(d.shares>1?`發起 ${d.shares} 人分攤，送餐車給 ${m.name}？你先付 ${fmt(share)} 積分，其他人可以在「一起出錢」加入。`:`送一台應援餐車給 ${m.name}？要 ${fmt(share)} 積分。`,()=>{ const tk=tkBuy(d.deco,d.mid,d.shares); if(!tk) return; ui.tkD=null; ui.tkView=tk.id; render(); window.scrollTo(0,0);
        toast(tkFunded(tk)?(tkState(tk)==="done"?"餐車送到了！":`餐車準備好了，等${tkKind(tk)}那天送到`):"發起分攤了，等大家一起出錢"); },{title:"應援餐車",ok:"確定",danger:false}); break; }
    case "tkTab": { const v=t.dataset.v; segSwitch(t,()=>{ ui.tkTab=v; ui.tkView=null; },v==="out"?1:-1); break; }
    case "tkView": { if(e.target.closest('[data-a="tkJoin"]')) break; ui.tkView=t.dataset.v; render(); window.scrollTo({top:0,behavior:"smooth"}); break; }
    case "tkJoin": { const tk=getTrucks().find(x=>x.id===t.dataset.v); if(!tk) break; ask(`一起出錢送餐車給 ${MEMBERS[tk.mid].name}？要 ${fmt(tkShare(tk))} 積分。`,()=>{ if(tkJoin(tk.id)){ ui.tkView=tk.id; render(); toast(tkFunded(getTrucks().find(x=>x.id===tk.id))?"湊齊了！":"出錢成功"); } },{title:"應援餐車",ok:"確定",danger:false}); break; }
    case "tkDel": ask("要刪除這台餐車嗎？",()=>{ S.set(K.trucks,(S.get(K.trucks,[])||[]).filter(x=>x.id!==t.dataset.v)); render(); toast("已刪除"); }); break;
    case "tieQuietList": { const L=tieQuiet(); tieModal("TIE 3 天沒傳訊息","",`${L.map(x=>`<span class="info-row"><em>${esc(MEMBERS[x.mid].name)}</em>${x.days} 天${x.last?"・最後一則 "+ymd(x.last):"・還沒傳過"}</span>`).join("")}<button class="t-mbtn" data-a="tCloseLayer">關閉</button>`); break; }
    case "aBgTab": ui.tieBgTab=t.dataset.v; openArtTieBg(); break;
    case "aBgSet": { const mid=session().member, A=S.get(K.tieArtBg,{})||{}, mode=t.dataset.mode;
      if(mode==="default") delete A[mid]; else A[mid]={bgMode:mode,...(mode==="color"?{bgColor:t.dataset.v}:{bgPattern:Number(t.dataset.v)})};
      S.set(K.tieArtBg,A); layer.innerHTML=""; render(); toast("已變更聊天室背景"); break; }
    case "aBgAlbum": { const inp=document.createElement("input"); inp.type="file"; inp.accept="image/*";
      inp.onchange=async()=>{ const f0=inp.files&&inp.files[0]; if(!f0) return; const f=await cropImg(f0,{ratio:cropPhone(),max:1400}); if(!f) return;
        const rd=new FileReader(); rd.onload=()=>{ const img=new Image(); img.onload=()=>{ const k=Math.min(1,900/Math.max(img.width,img.height)), c=document.createElement("canvas");
          c.width=Math.round(img.width*k); c.height=Math.round(img.height*k); c.getContext("2d").drawImage(img,0,0,c.width,c.height);
          openBgPreview(c.toDataURL("image/jpeg",.78),"aBgPvOk"); }; img.src=rd.result; }; rd.readAsDataURL(f); };
      pickClick(inp); break; }
    case "tPickAlbum": document.getElementById("tbgAlbum").click(); break;
    case "tBgPvOk": { if(ui.bgPv) saveTieSet(t.dataset.m,{bgMode:"photo",bgImage:ui.bgPv}); ui.bgPv=null; layer.innerHTML=""; render(); toast("已換上新背景"); break; }
    case "aBgPvOk": { if(ui.bgPv){ const A=S.get(K.tieArtBg,{})||{}; A[session().member]={bgMode:"photo",bgImage:ui.bgPv}; S.set(K.tieArtBg,A); } ui.bgPv=null; layer.innerHTML=""; render(); toast("已變更聊天室背景"); break; }
    
    case "tBadge": { const m2=t.dataset.m, st=tieSet(m2);
      iosAlert(`ARTIST 徽章設置為 OFF 時，${WHISPER_NAME} 對話窗內不顯示 ARTIST 徽章。`,"",`<button data-a="tBadgeSet" data-m="${m2}" data-v="0">OFF</button><button data-a="tBadgeSet" data-m="${m2}" data-v="1">ON</button>`); break; }
    case "tBadgeSet": saveTieSet(t.dataset.m,{badge:t.dataset.v==="1"}); layer.innerHTML=""; render(); break;
    case "tHistory": { const m2=t.dataset.m;
      tieModal("載入歷史對話","會重新下載這個聊天室的全部對話，建議在 Wi-Fi 環境下進行。要載入嗎？",`<button class="t-mbtn main" data-a="tHistoryOk" data-m="${m2}">確認載入</button><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); break; }
    case "tHistoryOk": { const m2=t.dataset.m; tieModal("載入歷史對話","正在載入…",`<span class="t-spin"></span>`);
      setTimeout(()=>{ restoreRoom(m2); layer.innerHTML=""; render(); toast("已載入所有歷史對話"); },1200); break; }
    case "closeSheet": if(e.target===t||t.tagName==="BUTTON"){ ui.sheet=null; layer.innerHTML=""; render(); } break;
    case "expand": ui.expanded.add(t.dataset.id); render(); break;
    case "like": {
      const res=toggleLike(t.dataset.id); if(!res) break;
      t.classList.toggle("liked",res.liked); t.setAttribute("aria-pressed",res.liked); t.querySelector("span").textContent=fmt(res.likes);
      t.classList.remove("pop"); void t.offsetWidth; if(res.liked){ t.classList.add("pop"); AN.heart(t); } break; }
    case "publish": {
      const text=ui.composeText.trim(); if(!text&&!(ui.composeMedia||[]).length&&!ui.composePoll) break;
      if(ui.composeVis==="pw"&&!String(ui.composePw||"").trim()){ toast("私密貼文要設定密碼"); break; }
      const {post:np,reached}=createPost(session().member,text,ui.composeColor,ui.composeTag,ui.composeMedia,ui.composeVis,String(ui.composePw||"").trim(),ui.composePoll); ui.composePoll=null; ui.composeTag="日常"; ui.composeMedia=[]; ui.composeVis="all"; ui.composePw="";
      ui.composeText=""; ui.composeColor=null; if(route().sub==="write") navBack(); else render();
      toast(reached?"已發布，粉絲收到通知了":"已發布"); break; }
    case "del": ask("確定要刪除這則動態嗎？",()=>{ deletePost(t.dataset.id); render(); toast("已刪除"); }); break;
    case "swapRole": swapRole(); break;
    case "reset": ask("要清除所有示範資料、回到初始狀態嗎？",()=>{ ui.sheet=null; layer.innerHTML=""; Object.values(K).forEach(k=>S.del(k)); SS.del(); try{ Object.keys(localStorage).filter(k=>k.startsWith("daisuki_")&&k.includes("@")).forEach(k=>localStorage.removeItem(k)); }catch(err){} ui.expanded=new Set(); 
seedStores(); seedStores2(); seedMascots(); ui.selectDraft=null; ui.feedTab="feed"; go("auth"); }); break;
    case "logout": if(document.getElementById("coach")){ ui.coach=null; document.getElementById("coach").remove(); } SS.del(); if(HB_ON) hbLogout(); VP.a&&VP.a.pause(); ui.sheet=null; layer.innerHTML=""; ui.selectDraft=null; go("auth"); break;
    default: return CLICK_NO;
  } }

