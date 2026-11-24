/* =========================================================
   SNS 標註人物（11/24，照 IG）
   ・發文時按「標註人物」→ 全螢幕看照片，點照片哪裡就標在哪裡（再選要標誰）
   ・名牌可以拖曳換位置，按名牌上的 × 拿掉；多張照片可以左右換、每張分開標
   ・存在貼文的 tagPos：{帳號:[第幾張, x%, y%]}；tags 照舊（通知、「被標註」分頁用）
   ・看貼文時：照片左下角小人像，點了名牌出現在發文的人點的位置
   ========================================================= */
const snTgUsers=()=>{ const me=snMeId(), d=snDB(); return [...new Set([...snFol(d,me),...snAllUsers().map(x=>x.id)])].filter(x=>x!==me).map(snUser).filter(Boolean); };
/* 看貼文：這一張照片上的名牌 */
function snSlTags(p,i){ const P=p.tagPos||{}, T=(p.tags||[]).filter(id=>P[id]&&(P[id][0]||0)===i).map(id=>[snUser(id),P[id]]).filter(x=>x[0]); if(!T.length) return "";
  return `<div class="sn-tagl">${T.map(([u,q])=>`<button class="sn-tagb${q[2]>82?" up":""}" style="left:${q[1]}%;top:${q[2]}%" data-a="snsGo" data-v="profile" data-id="${u.id}">${esc(u.u)}</button>`).join("")}</div>`; }
/* 發文：標註編輯畫面 */
function snTgOpen(){ const dr=ui.snDraft; if(!dr) return; const cap=document.getElementById("snCap"); if(cap) dr.cap=cap.value;
  ui.snTgW={tags:(dr.tags||[]).slice(),pos:JSON.parse(JSON.stringify(dr.tagPos||{})),i:0}; ui.snTgAt=null; snTgDraw(); }
function snTgDraw(){ const dr=ui.snDraft, W=ui.snTgW; if(!dr||!W) return; const M=dr.media||[], n=M.length, i=Math.min(W.i,n-1), x=M[i]||{};
  W.tags.forEach(id=>{ if(!W.pos[id]) W.pos[id]=[0,50,50]; });
  const L=W.tags.filter(id=>(W.pos[id][0]||0)===i).map(id=>[snUser(id),W.pos[id]]).filter(y=>y[0]);
  const at=ui.snTgAt;
  setLayer(`<div class="sntg"><header class="sntg-h"><button data-a="snTgX">取消</button><b>標註人物</b><button class="ok" data-a="snTgOk">完成</button></header>
    <div class="sntg-ph" id="sntgPh" data-a="snTgAt"${snArStyle({media:M})}>${x.type==="video"?`<video class="sn-img" src="${x.url||""}" playsinline muted loop autoplay></video>`:`<img class="sn-img" data-mid="${x.mid||""}" ${x.url?`src="${esc(x.url)}"`:""} alt="">`}
      ${L.map(([u,p])=>`<span class="sn-tagb ed${p[2]>82?" up":""}" style="left:${p[1]}%;top:${p[2]}%" data-tg="${u.id}">${esc(u.u)}<button data-a="snTgRm" data-v="${u.id}" aria-label="移除 ${esc(u.u)}">×</button></span>`).join("")}
      ${at&&(at.i===i)?`<i class="sntg-dot" style="left:${at.x}%;top:${at.y}%"></i>`:""}</div>
    ${n>1?`<div class="sntg-nav"><button data-a="snTgI" data-v="${i-1}" ${i?"":"disabled"} aria-label="上一張">‹</button><span>${i+1} / ${n}</span><button data-a="snTgI" data-v="${i+1}" ${i<n-1?"":"disabled"} aria-label="下一張">›</button></div>`:""}
    <p class="sntg-tip">${W.tags.length?`已標註 ${W.tags.length} 人・拖曳名牌可以換位置，按 × 移除`:"點一下照片，標註照片裡的人"}</p>
    ${at?`<div class="sntg-sw" data-a="snTgCancelAt"><div class="sntg-sh" data-a="snTgNo"><i class="sn-grab"></i><label class="sn-q">${si("search")}<input id="snTgQ" placeholder="搜尋" autocomplete="off" value="${esc(ui.snTgQ||"")}"></label>
      <div class="sn-tpl" id="snTgL">${snTgList()}</div></div></div>`:""}</div>`,"sntag");
  setTimeout(()=>{ const l=layer.querySelector(".sntg"); if(l) hydrateMedia(l); },0); }
function snTgList(){ const W=ui.snTgW||{tags:[]}, q=(ui.snTgQ||"").trim().toLowerCase(), U=snTgUsers().filter(u=>!W.tags.includes(u.id)&&(!q||String(u.u).toLowerCase().includes(q)||String(u.name||"").toLowerCase().includes(q))).slice(0,40);
  return U.length?U.map(u=>`<button data-a="snTgPickU" data-v="${u.id}">${snAv(u,40)}<span><b>${esc(u.u)}</b><small>${esc(u.name||"")}</small></span></button>`).join(""):`<p class="sntg-0">找不到帳號</p>`; }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest('[data-a^="snTg"]'); if(!t||!layer.contains(t)) return; const a=t.dataset.a, v=t.dataset.v, W=ui.snTgW; if(!W) return; e.stopImmediatePropagation(); e.preventDefault();
  if(a==="snTgNo") return;
  if(a==="snTgX"){ ui.snTgW=null; ui.snTgAt=null; layer.innerHTML=""; return; }
  if(a==="snTgOk"){ const dr=ui.snDraft; dr.tags=W.tags.slice(); dr.tagPos=W.pos; ui.snTgW=null; ui.snTgAt=null; layer.innerHTML=""; render(); return; }
  if(a==="snTgI"){ W.i=+v; ui.snTgAt=null; snTgDraw(); return; }
  if(a==="snTgRm"){ W.tags=W.tags.filter(x=>x!==v); delete W.pos[v]; snTgDraw(); return; }
  if(a==="snTgCancelAt"){ ui.snTgAt=null; ui.snTgQ=""; snTgDraw(); return; }
  if(a==="snTgPickU"){ const at=ui.snTgAt; if(!at) return; if(W.tags.length>=20){ toast("最多標註 20 人"); return; } W.tags.push(v); W.pos[v]=[at.i,at.x,at.y]; ui.snTgAt=null; ui.snTgQ=""; snTgDraw(); return; }
  if(a==="snTgAt"){ if(ui.snTgDrag||e.target.closest(".sn-tagb")) return; const r=t.getBoundingClientRect(), x=Math.round((e.clientX-r.left)/r.width*1000)/10, y=Math.round((e.clientY-r.top)/r.height*1000)/10; if(x<0||x>100||y<0||y>100) return;
    ui.snTgAt={i:W.i,x:Math.max(8,Math.min(92,x)),y:Math.max(4,Math.min(92,y))}; ui.snTgQ=""; snTgDraw(); return; }
},true);
document.addEventListener("input",e=>{ if(e.target&&e.target.id==="snTgQ"){ ui.snTgQ=e.target.value; const L=document.getElementById("snTgL"); if(L) L.innerHTML=snTgList(); } });
/* 拖曳名牌換位置 */
(()=>{ let dg=null;
  document.addEventListener("pointerdown",e=>{ const b=e.target.closest&&e.target.closest(".sntg .sn-tagb.ed"); if(!b||e.target.closest("button")) return; const ph=document.getElementById("sntgPh"); if(!ph) return; dg={b,ph,id:b.dataset.tg,x0:e.clientX,y0:e.clientY,mv:false}; try{ b.setPointerCapture(e.pointerId); }catch(er){} e.preventDefault(); });
  document.addEventListener("pointermove",e=>{ if(!dg) return; if(!dg.mv&&Math.hypot(e.clientX-dg.x0,e.clientY-dg.y0)<4) return; dg.mv=true; const r=dg.ph.getBoundingClientRect(), x=Math.max(8,Math.min(92,(e.clientX-r.left)/r.width*100)), y=Math.max(4,Math.min(92,(e.clientY-r.top)/r.height*100)); dg.b.style.left=x+"%"; dg.b.style.top=y+"%"; dg.b.classList.toggle("up",y>82); dg.nx=x; dg.ny=y; });
  const end=()=>{ if(!dg) return; const W=ui.snTgW; if(dg.mv&&W&&W.pos[dg.id]&&dg.nx!=null){ W.pos[dg.id]=[W.pos[dg.id][0],Math.round(dg.nx*10)/10,Math.round(dg.ny*10)/10]; ui.snTgDrag=true; setTimeout(()=>{ ui.snTgDrag=false; },60); } dg=null; };
  document.addEventListener("pointerup",end); document.addEventListener("pointercancel",end); })();
