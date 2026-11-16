# HAECHU 開發須知

- 原始碼在 `src/`：`src/index.html`（外殼）、`src/css/*.css`、`src/js/*.js`（照檔名數字順序合併）。
- **不要直接改** 根目錄的 `index.html`、`app.js`、`app.css`、`version.txt`：它們是 `python3 build.py` 產生的。
- 改完 `src/` → `python3 build.py` → `node --check app.js` → 測試 → commit。
- `src/js/*.js` 執行時是合成一個 `app.js` 載入的（共用同一個全域），所以檔案之間可以互相呼叫；拆檔只是為了好改。
- `sw.js`：只做推播（不攔任何網路請求；11/11 攔請求會讓 iPhone 的圖片變成每次重新下載）。
- 只改到管理員端的東西（說明文字、後台畫面）→ 用 `python3 build.py --quiet`：不跳全站「有新版本」提示，大家下次回到 App 時安靜換新。
- 有會員用 iPhone 7 Plus（iOS 15.8，Safari 15）：**不要用** 正規式的 `(?<=` `(?<!`、`structuredClone`、`.findLast`、`.toSorted` 這類 Safari 16 以後才有的寫法，會整支 App 白畫面。改完可以 `grep -c "(?<[=!]" app.js` 確認是 0。
- **每次更新都要顧 iPhone 7（iOS 15.8）**：build.py 會擋 iOS 15 看不懂的 JS、自動補 `-webkit-` 前綴、把 `color-mix()` 整理給 `cmxPoly()` 在舊手機上算成 rgba。新增 CSS 時避免 iOS 16 以後才有的東西（`@container`、CSS 巢狀 `&`、`light-dark()`、`@layer`）；測試可在頁面設 `window.__cmxForce=1; cmxPoly()` 模擬舊手機。
