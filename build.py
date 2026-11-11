#!/usr/bin/env python3
"""HAECHU 打包：把 src/ 裡拆開的檔案合成 App 實際載入的檔案。
   src/index.html（外殼）＋ src/css/*.css → app.css ＋ src/js/*.js → app.js → 產生 index.html、version.txt
   檔名後面的 ?v= 是內容的指紋：內容沒變就不用重新下載；手機會把它存起來，下次打開直接用。
   用法：python3 build.py        （改完 src/ 之後、發布之前跑一次）"""
import hashlib, glob, os, time, re
R = os.path.dirname(os.path.abspath(__file__))
def cat(pat):
    fs = sorted(glob.glob(os.path.join(R, pat)))
    return "\n".join(open(f, encoding="utf-8").read() for f in fs), fs
css, cf = cat("src/css/*.css")
js, jf = cat("src/js/*.js")
h = lambda s: hashlib.sha1(s.encode()).hexdigest()[:10]
open(os.path.join(R, "app.css"), "w", encoding="utf-8").write(css)
open(os.path.join(R, "app.js"), "w", encoding="utf-8").write(js)
build = time.strftime("%Y%m%d%H%M%S", time.gmtime())
shell = open(os.path.join(R, "src/index.html"), encoding="utf-8").read()
shell = shell.replace("{{CSS}}", "app.css?v=" + h(css)).replace("{{JS}}", "app.js?v=" + h(js))
shell = shell.replace("<head>", f'<head>\n<script>window.HC_BUILD="{build}";</script>', 1)
open(os.path.join(R, "index.html"), "w", encoding="utf-8").write(shell)
open(os.path.join(R, "version.txt"), "w").write(build + "\n")
# 試玩頁共用 App 的手感：src/js/00-feel.js 另外輸出一份 feel.js，試玩頁的引用自動換成最新指紋
feel = open(os.path.join(R, "src/js/00-feel.js"), encoding="utf-8").read()
open(os.path.join(R, "feel.js"), "w", encoding="utf-8").write(feel)
tp = os.path.join(R, "try/index.html"); t = open(tp, encoding="utf-8").read()
t2 = re.sub(r'\.\./feel\.js(\?v=[0-9a-f]*)?"', '../feel.js?v=' + h(feel) + '"', t)
if t2 != t: open(tp, "w", encoding="utf-8").write(t2)
print(f"built {build}: {len(cf)} css → app.css ({len(css)//1024}KB), {len(jf)} js → app.js ({len(js)//1024}KB)")
