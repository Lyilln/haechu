/* ===== 💿 CD 盒（參考 AI Studio 的 CD 收藏品）=====
   專輯封面裝在透明 CD 盒裡，光碟從右邊露出一點；點一下光碟滑出來轉、再點收回；手指拖動整個盒子會跟著傾斜。
   用 CSS 3D 做（不用 WebGL），iPhone 7 也跑得動。用在：SNS 專輯貼文、打歌的歌曲頁 */
function cdBox(gid,title,o={}){ const cov=songCover(gid,title), g=groupOf(gid)||{};
  return `<div class="cdx ${o.sm?"sm":""}" data-a="cdxTap" role="button" aria-label="《${esc(title)}》CD，點一下拿出光碟"><div class="cdx-in">
    <div class="cdx-disc"><span class="cdx-print">${cov}</span><i class="cdx-sheen"></i><i class="cdx-ring"></i><i class="cdx-hole"></i></div>
    <div class="cdx-case"><span class="cdx-cov">${cov}</span><i class="cdx-spine"></i><i class="cdx-gloss"></i><em class="cdx-lbl">${esc(g.name||"")}<b>${esc(title)}</b></em></div>
  </div></div>`; }
/* 拖動傾斜：手指在盒子上滑，盒子跟著轉一點點（放開慢慢回正） */
document.addEventListener("pointermove",e=>{ const c=e.target.closest&&e.target.closest(".cdx"); if(!c||e.pointerType==="mouse"&&!e.buttons&&!c.matches(":hover")) return; const r=c.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; c.style.setProperty("--ry",(x*28).toFixed(1)+"deg"); c.style.setProperty("--rx",(-y*18).toFixed(1)+"deg"); },{passive:true});
document.addEventListener("pointerleave",e=>{ const c=e.target.closest&&e.target.closest(".cdx"); if(c){ c.style.setProperty("--ry","0deg"); c.style.setProperty("--rx","0deg"); } },true);
document.addEventListener("pointerup",()=>{ document.querySelectorAll(".cdx").forEach(c=>{ c.style.setProperty("--ry","0deg"); c.style.setProperty("--rx","0deg"); }); },{passive:true});
