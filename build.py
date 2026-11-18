#!/usr/bin/env python3
"""HAECHU 打包：把 src/ 裡拆開的檔案合成 App 實際載入的檔案。
   src/index.html（外殼）＋ src/css/*.css → app.css ＋ src/js/*.js → app.js → 產生 index.html、version.txt
   檔名後面的 ?v= 是內容的指紋：內容沒變就不用重新下載；手機會把它存起來，下次打開直接用。
   用法：python3 build.py        （改完 src/ 之後、發布之前跑一次）
         python3 build.py --quiet（只改管理員端：不跳全站「有新版本」提示）"""
import hashlib, glob, os, time, re, sys
R = os.path.dirname(os.path.abspath(__file__))
def cat(pat):
    fs = sorted(glob.glob(os.path.join(R, pat)))
    return "\n".join(open(f, encoding="utf-8").read() for f in fs), fs
css, cf = cat("src/css/*.css")
js, jf = cat("src/js/*.js")
h = lambda s: hashlib.sha1(s.encode()).hexdigest()[:10]
# ===== 舊 iPhone（iOS 15）向下相容 =====
# 1) 補 -webkit- 前綴：iOS 15 的 Safari 只認 -webkit-mask-image / -webkit-backdrop-filter
css = re.sub(r"([;{\s])mask-image:([^;}]+)", lambda m: f"{m.group(1)}-webkit-mask-image:{m.group(2)};mask-image:{m.group(2)}", css)
css = re.sub(r"([;{\s])backdrop-filter:([^;}]+)", lambda m: f"{m.group(1)}-webkit-backdrop-filter:{m.group(2)};backdrop-filter:{m.group(2)}", css)
# 2) color-mix() 要 iOS 16.2：把用到的地方整理成清單放進 app.js，舊手機在畫面上自己算出顏色補上（新手機不會跑）
def _cmx(src):
    t = re.sub(r"/\*.*?\*/", "", src, flags=re.S); out = []; i = 0; n = len(t)
    def block(i, media):
        while i < n:
            if t[i] == "}": return i + 1
            j = t.find("{", i); k = t.find("}", i)
            if j < 0 or (0 <= k < j): return (k + 1) if k >= 0 else n
            pre = t[i:j].strip(); d = 1; e = j + 1
            while e < n and d:
                if t[e] == "{": d += 1
                elif t[e] == "}": d -= 1
                e += 1
            body = t[j + 1:e - 1]
            if pre.startswith("@media") or pre.startswith("@supports"):
                block_inner(body, (media + " and " if media else "") + pre.split(None, 1)[1] if pre.startswith("@media") else media)
            elif not pre.startswith("@") and "color-mix(" in body:
                parts = []; dd = 0; cur = ""
                for ch in body:
                    if ch == "(": dd += 1
                    elif ch == ")": dd -= 1
                    if ch == ";" and dd == 0: parts.append(cur); cur = ""
                    else: cur += ch
                parts.append(cur)
                for dcl in parts:
                    if "color-mix(" in dcl and ":" in dcl:
                        pr, v = dcl.split(":", 1); out.append([pre, media, pr.strip(), v.strip()])
            i = e
        return n
    def block_inner(body, media):
        nonlocal t, n
        saved = (t, n); t, n = body, len(body); block(0, media); t, n = saved
    block(0, "")
    return out
import json as _json
_cm = _cmx(css)
js += "\n/* ===== 舊 iPhone（iOS 15）看不懂 color-mix：build.py 自動整理清單，由 cmxPoly() 補上算好的顏色 ===== */\nconst CMX_RULES=" + _json.dumps(_cm, ensure_ascii=False) + ";\n"
open(os.path.join(R, "app.css"), "w", encoding="utf-8").write(css)
# 舊 iPhone（iOS 15）看不懂的寫法：出現就不准產生 app.js（不然整支 App 白畫面）
_code = re.sub(r"/\*.*?\*/", "", js, flags=re.S)
for _bad, _why in [(r"\(\?<[=!]", "正規式的 (?<= / (?<!"), (r"\bstructuredClone\(", "structuredClone"), (r"\.findLast(Index)?\(", ".findLast"), (r"\.to(Sorted|Reversed|Spliced)\(", ".toSorted 之類"), (r"\b(Object|Map)\.groupBy\(", "groupBy")]:
    if re.search(_bad, _code):
        sys.exit(f"build 停止：用了 iOS 15 看不懂的 {_why}，舊 iPhone 會白畫面，請改寫")
# 要用時才載入的程式（src/lazy/*.js → lazy/*.js）：一樣擋 iOS 15 看不懂的寫法；網址指紋寫進 app.js 的 LAZY
os.makedirs(os.path.join(R, "lazy"), exist_ok=True); _lz = {}
for _f in sorted(glob.glob(os.path.join(R, "src/lazy/*.js"))):
    _n = os.path.splitext(os.path.basename(_f))[0]; _t = open(_f, encoding="utf-8").read(); _c = re.sub(r"/\*.*?\*/", "", _t, flags=re.S)
    for _bad, _why in [(r"\(\?<[=!]", "正規式的 (?<= / (?<!"), (r"\bstructuredClone\(", "structuredClone"), (r"\.findLast(Index)?\(", ".findLast"), (r"\.to(Sorted|Reversed|Spliced)\(", ".toSorted 之類")]:
        if re.search(_bad, _c): sys.exit(f"build 停止：lazy/{_n}.js 用了 iOS 15 看不懂的 {_why}")
    open(os.path.join(R, "lazy", _n + ".js"), "w", encoding="utf-8").write(_t); _lz[_n] = f"lazy/{_n}.js?v={h(_t)}"
js += "\nwindow.LAZY=" + _json.dumps(_lz) + ";\n"
open(os.path.join(R, "app.js"), "w", encoding="utf-8").write(js)
build = time.strftime("%Y%m%d%H%M%S", time.gmtime())
shell = open(os.path.join(R, "src/index.html"), encoding="utf-8").read()
shell = shell.replace("{{CSS}}", "app.css?v=" + h(css)).replace("{{JS}}", "app.js?v=" + h(js))
shell = shell.replace("<head>", f'<head>\n<script>window.HC_BUILD="{build}";</script>', 1)
open(os.path.join(R, "index.html"), "w", encoding="utf-8").write(shell)
open(os.path.join(R, "version.txt"), "w").write(build + (" quiet" if "--quiet" in sys.argv else "") + "\n")   # --quiet：只改管理員端的東西，不跳「有新版本」，大家下次回到 App 時安靜換新
# 試玩頁（try/）的樣式和手感是固定複製版，不跟 App 聯動，這裡不碰
print(f"built {build}: {len(cf)} css → app.css ({len(css)//1024}KB), {len(jf)} js → app.js ({len(js)//1024}KB)")
