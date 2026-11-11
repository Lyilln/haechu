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
print(f"built {build}: {len(cf)} css → app.css ({len(css)//1024}KB), {len(jf)} js → app.js ({len(js)//1024}KB)")
