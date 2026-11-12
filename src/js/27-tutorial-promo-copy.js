/* HAECHU｜新手教學內容、宣傳排程、試玩訊息、人事異動、官方文案 */
/* =========================================================
   新手教學內容（v444 全部重寫）
   ・每一步：[要亮起來的地方, 標題, 說明]
   ・畫面上找不到的地方會自動跳過，所以可以寫得很完整
   ・教學進行中整個畫面不能滑（js/09 擋掉 touchmove／wheel）
   ========================================================= */
const COACH_INTRO={
  fan:["你是粉絲","在這裡追你喜歡的藝人：看他們的動態和直播、收他們傳給你的 TIE、幫打歌投票衝一位、搶公放席拿公放卡、收集小卡、參加簽售和演唱會、送應援餐車。接下來會一頁一頁帶你看，跟著亮起來的地方走就好。"],
  artist:["你是藝人","你可以發動態、開直播、傳 TIE 給訂閱你的粉絲、申請回歸、上音樂節目打歌、上傳結尾妖精、開演唱會、辦世巡和簽售。接下來會一頁一頁帶你看，跟著亮起來的地方走就好。"],
  admin:["你是公司方","安排賽程和打歌、審核出道和回歸、舉辦簽售、處理檢舉、發公告和加積分。你也能切換成粉絲和藝人，看看大家看到的畫面。"]};
const COACH={
  fan:[[".nav-btn[data-v=home]","LOVE","藝人的動態、直播和探索都在這裡。每天打開 App 先來這裡看看他們今天說了什麼。"],
    [".nav-btn[data-v=whisper]","TIE","你跟藝人的一對一聊天室。在 SHOP 買了 TIE 券，藝人傳的訊息就會出現在這裡，你也能回他。"],
    [".nav-btn[data-v=core]","FEST","打歌投票、小卡、SNS、新聞、演唱會、簽售、應援餐車……所有活動的入口。"],
    [".nav-btn[data-v=shop]","SHOP","用積分買 Membership、TIE 券、專輯、應援棒和主題。"],
    [".nav-btn[data-v=me]","ME","你的檔案、積分、收藏、設定都在這裡。想再看一次教學也在這裡。"],
    ['[data-a="openNotifs"]',"通知","藝人發文、回覆你、開直播、提到你、輪到你簽售，都會先在這裡通知你。"]],
  artist:[[".nav-btn[data-v=home]","LOVE","你的個人頁。發動態給粉絲、回覆他們的留言。"],
    [".nav-btn[data-v=live]","MEET","開文字直播。粉絲的留言會出現在旁邊，點一下就能回覆他。"],
    [".nav-btn[data-v=whisper]","TIE","傳訊息給所有訂閱你的粉絲。打 @@@ 的地方，每位粉絲會看到自己的名字。"],
    [".nav-btn[data-v=foc]","FOC","你的工作台：打歌、SNS、新聞、綜藝、代言、簽售、應援餐車、演唱會、世巡都在這裡。"],
    [".nav-btn[data-v=me]","ME","申請回歸、看打歌戰況、設定粉絲愛稱、做主題，也能切換到粉絲端。"]],
  admin:[[".nav-btn[data-v=home]","HOME","全站總覽和待辦。"],
    [".nav-btn[data-v=foc]","FOC","賽程、打歌、簽售、演唱會、選秀。"],
    [".nav-btn[data-v=me]","ME","帳號、外觀、重看教學。"]]};
const COACH_INTRO_UNI=["你是管理員","你同時也是藝人和粉絲。最上面的「粉絲｜藝人｜管理」隨時可以切換，不用換帳號。接下來三個畫面會分別帶你看一次。"];
const COACH_UNI=[['.uni-sw [data-v="fan"]',"粉絲","跟一般粉絲看到的一模一樣：動態、直播、TIE、打歌投票、小卡、SHOP。你的粉絲積分跟藝人積分是同一份，哪邊花掉另一邊就跟著少。"],
  ['.uni-sw [data-v="artist"]',"藝人","你自己的藝人身分：發動態、開直播、傳 TIE、申請回歸、打歌戰況。藝人和粉絲除了積分，其他東西都是分開的。"],
  ['.uni-sw [data-v="admin"]',"管理","公司的事：總覽、藝人、內容、活動、營運。旁邊的數字是還沒處理的事。"]];

const TOURS={
  /* ================= 粉絲 ================= */
  "fan:home":[['[data-a="ft"][data-v="feed"]',"動態","你追蹤的藝人發的動態都在這裡，最新的在最上面。"],
    ['[data-a="ft"][data-v="live"]',"直播","藝人開直播的時候，從這裡進去陪他。錯過的直播也有重播。"],
    ['[data-a="ft"][data-v="discover"]',"探索","還沒追蹤的團都在這裡。看到喜歡的按「加入」，他們的動態就會出現在你的動態裡。"],
    [".mf-dm","有新 TIE","藝人剛傳了新的 TIE！點「立即查看」直接打開聊天室。"],
    ['[data-a="dmNext"]',"下一則 TIE","還有別的藝人傳來的 TIE，點一下換下一則。"],
    [".hl-i","最新公告","各團的重要消息。左右滑看下一則，點進去看全文。"],
    [".post","一則動態","上面是誰發的、什麼時候發的；中間是內容、照片或影片。點照片可以放大看。"],
    ['.post [data-a="like"]',"按讚","喜歡就按愛心，藝人看得到有多少人按。"],
    ['.post [data-a="comments"]',"留言","打開留言區，跟藝人和大家說說話。藝人回覆你的時候，你會收到通知。"],
    ['.post [data-a="bmTog"]',"收藏","想留著再看的動態，按這裡收進書籤，到 ME 就找得到。"],
    [".pv-lock.ms","Membership 限定","加入這個團的 Membership 才看得到。到 SHOP 買 Membership 就能解鎖。"],
    [".pv-lock.pvk","私密貼文","藝人藏了一組密碼，猜中就能看！猜錯沒關係，可以一直猜。"],
    ['[data-a="shOpen"]',"搜尋","找藝人、找團、找以前的動態。"],
    ['[data-a="openNotifs"]',"通知","鈴鐺上有數字就是有新通知。點進去看是誰回你、誰開了直播。"]],
  "fan:cm":[["#csl","留言區","大家的留言都在這裡。藝人回覆的會特別標出來，一眼就看得到。"],
    ['[data-a="replyTo"]',"回覆","想回某一則留言，點「回覆」，對方會收到通知。"],
    ['[data-a="report"]',"檢舉","看到讓人不舒服的留言可以檢舉，管理員會處理。"],
    ["#cin","寫留言","在這裡寫下你想說的話，按送出就好。"]],
  "fan:live":[[".nc","直播中","藝人正在直播！點進去看他說話、留言、送心心。在直播間點一下畫面，可以叫出離開、聊天開關和縮小；縮小後在別的頁面也看得到直播。"],
    [".rr","重播","錯過的直播都留在這裡：左邊是封面和長度，右邊是誰、標題、哪一天。點進去可以只看藝人說的話。"]],
  "fan:grp":[[".cmx-tabs","團的社群","每個團都有自己的社群。上面一排切換：公告、行程、成員、大家的貼文、影音和商品。"],
    ['.cmx-tabs [data-v="media"]',"影音","直播重播、MV、MV Teaser 都在這裡。出道和回歸的 MV 會自動放進「MV」和「MV Teaser」兩區。"],
    [".yv-lk","MV 愛心","喜歡這支 MV 就按愛心，數字會自動加一。MV 的愛心會算進音樂節目的打歌分數。"],
    [".yv-mv","MV 觀看","點進去看 MV。實際看滿 30 秒算一次觀看，觀看數也會算進打歌分數。"],
    [".cm-abc","About","認識團裡的每一位成員，點進去看他們的個人頁。"],
    [".cmx-fab","＋","寫信給藝人，或在社群發一則貼文。"]],
  "fan:grpfab":[['.cmx-fabm [data-a="cmLetterTo"]',"粉絲信","寫一封信給整個團，或給你最喜歡的那一位 💌 藝人會在他們那邊收到。"],
    ['.cmx-fabm [data-a="cmGo"]',"社群貼文","在這個團的社群發貼文，跟其他粉絲分享。"]],
  "fan:whisper":[[".t-room","TIE 聊天室","你訂閱的藝人都在這裡，每一間都是你們兩個人的聊天室。有新訊息會有紅點。"],
    ['[data-a="shOpen"]',"搜尋","找藝人，或找以前的訊息。"],
    ['[data-a="tListClear"]',"整理","已經到期的聊天室可以在這裡清掉。"],
    ['[data-a="goSubs"]',"還沒有 TIE","去 SHOP 買一張 TIE 券，就能跟藝人開始聊。"]],
  "fan:chat":[[".t-rh h3","聊天室名稱","可以幫這個聊天室取你喜歡的名字，只有你看得到。"],
    [".t-sub","在一起的天數","你和他在一起第幾天了。紀念日會有小驚喜 🎉"],
    ['.t-rh [data-a="shOpen"]',"搜尋訊息","找以前的訊息。"],
    ['[data-a="tDrawer"]',"選單","通知、TIE BOX、照片、聊天室設定都在這裡，等一下帶你看。"],
    [".t-art .t-b","藝人的訊息","藝人傳給你的話。按住可以複製、收進 TIE BOX、看翻譯。"],
    [".t-rp","藝人的回覆","藝人回覆了某位粉絲說的話。大家都看得到回覆，但不知道原本是誰寫的。"],
    [".nick-me","你的名字","藝人叫你的地方，會變成你自己設定的暱稱。"],
    [".t-abtn","翻譯","點 A 看翻譯。"],
    [".t-me .t-b","你的訊息","你回給藝人的話。旁邊的「1」不見了，就是他看過了。"],
    [".t-recall","收回","藝人還沒看之前，可以收回。"],
    ["#win","回覆藝人","在這裡寫給他。訂閱越久，每則能寫的字越多。"],
    [".t-smile","表情","加一點表情或貼圖 😊"],
    ["#wsend","送出","寫好就送出。"],
    [".t-expired-in","已到期","TIE 券到期了，續訂就能繼續聊，以前的訊息都還在。"]],
  "fan:drawer":[['[data-a="tMute"]',"通知","這個聊天室的通知可以關掉或打開。"],
    ['[data-a="tFav"]',"我的最愛","把最常聊的藝人放到最上面。"],
    [".t-dw-b .t-acc:not(.t-acc-art)","你的暱稱","藝人叫你的名字，在這裡改。"],
    [".t-acc-art","藝人","點一下看藝人的個人頁。"],
    ['[data-a="tBox"]',"TIE BOX","收藏起來的訊息都放在這裡。"],
    ['[data-a="tGallery"]',"照片・影片","藝人傳過的照片和影片，一次看完。"],
    ['[data-a="tToSettings"]',"聊天室設定","聊天室名稱、暱稱、背景，都在這裡改。"],
    [".t-leave","離開聊天室","不想留這個聊天室了，可以離開。"]],
  "fan:core":[['[data-a="coreGo"][data-v="promo"]',"打歌","藝人上音樂節目打歌的地方。每天可以在每個節目投票，最早投的前三位還能搶到公放席、拿公放卡。"],
    ['[data-a="coreGo"][data-v="cards"]',"小卡","買專輯拆出來的小卡、公放卡、簽售卡都收在卡冊裡。"],
    ['[data-a="coreGo"][data-v="sns"]',"SNS","你的個人帳號：發照片和限時動態、追蹤朋友和藝人、傳私訊。"],
    ['[data-a="coreGo"][data-v="news"]',"新聞","出道、回歸、拿一位都會上 HAECHU 娛樂新聞。"],
    ['[data-a="coreGo"][data-v="wiki"]',"SKpedia","藝人百科：每個團和每位成員的資料。"],
    ['[data-a="coreGo"][data-v="cafe"]',"生日咖啡廳","藝人生日那天開的咖啡廳，去逛逛、幫他慶生。"],
    ['[data-a="coreGo"][data-v="show"]',"綜藝","看藝人上綜藝節目。"],
    ['[data-a="coreGo"][data-v="biz"]',"代言・雜誌","藝人接的廣告和畫報。"],
    ['[data-a="coreGo"][data-v="fsl"]',"簽售","報名簽售，抽中就能跟藝人視訊、拿簽名專輯。"],
    ['[data-a="coreGo"][data-v="truck"]',"應援餐車","訂一台餐車送給喜歡的藝人，可以自己出錢，也可以找大家一起出。"],
    ['[data-a="coreGo"][data-v="concert"]',"演唱會","演唱會開始時進場，舉起應援棒一起變成燈海。"],
    ['[data-a="coreGo"][data-v="tour"]',"世巡","藝人的世界巡演，每一站買票進場、蓋章收集。"],
    ['[data-a="coreLocked"],[data-a="coreGo"][data-v="survival"]',"選秀","選秀開始後，每天都能幫喜歡的練習生投票。"]],
  "fan:core:promo":[[".mu2-wk","這週是什麼週","每個月第一週是宣傳週（不排名、不能投票），中間是排名週，最後一週是打歌週（月底決戰）。"],
    ['[data-a="coreTip"]',"規則","分數怎麼算、什麼時候結束、三冠王是什麼，點這裡看完整規則，左右滑換頁。"],
    [".mu3-thr","這個月的王座","五台冠軍、AK、PAK，這個月拿到的團會亮在這裡。還沒有人拿到就是「虛位以待」。"],
    [".mu3-list","五個音樂節目","THE SHOW、SHOW CHAMPION、M COUNTDOWN、MUSIC BANK、INKIGAYO，每個節目各自排名、各自投票。"],
    [".mu3-hd","打開節目","點一下展開這個節目的排行榜。收起來的時候，右邊會顯示目前第一名，或上一個排名週的一位。"],
    [".mu3-end","倒數","每個節目在播出的時間自動結算，這裡顯示還剩多久。"],
    [".mu3-r","排行","名次、歌、分數。分數＝投票 ×100＋專輯 ×200＋MV 愛心 ×20＋MV 觀看 ×2。"],
    ['[data-a="muVote3"]',"投票","每個節目每天可以投 1 票。同一週同一個節目，最早投這首歌的前三位會搶到公放席，拿到一張公放卡；第四位之後就沒有了。"],
    [".mu3-song","結尾妖精","點歌名，會從這裡彈出結尾妖精的影片，配上這首歌。"],
    [".mu3-cr","三冠王","同一首歌在同一個節目拿三次一位就是三冠王，之後不能再投。"]],
  "fan:core:cards":[[".cb-tabs","卡冊","左邊是卡冊，右邊是開箱紀錄。"],
    ['[data-a="cbTab"][data-v="log"]',"開箱紀錄","每次拆專輯拿到哪些卡都記在這裡，保留最近 50 次。"],
    [".cb-al","專輯","每張專輯一格，點進去看你收集了幾張，還缺哪幾張。公放卡也收在這裡。"],
    ['[data-a="goAlbums"]',"還沒有小卡","去 SHOP 買專輯，拆開就會拿到小卡。"]],
  "fan:sns":[['[data-a="snsGo"][data-v="new"]',"限時動態","發一則 24 小時後消失的限時動態。可以放照片、文字、貼圖，還能 @ 別人，被 @ 的人會收到通知。"],
    ['[data-a="snCreate"]',"新增","發一則貼文：選照片、寫內容、@ 朋友或藝人。"],
    ['[data-a="snsGo"][data-v="notif"]',"通知","誰按了你的讚、誰留言、誰 @ 你、誰追蹤你。"],
    ['[data-a="snsGo"][data-v="home"]',"首頁","你追蹤的人發的貼文和限時動態。"],
    ['[data-a="snsGo"][data-v="reels"]',"Reels","大家的短影片，上下滑著看。"],
    ['[data-a="snsGo"][data-v="dm"]',"私訊","跟朋友一對一聊天。"],
    ['[data-a="snsGo"][data-v="explore"]',"探索","找新的人和熱門貼文。"],
    ['[data-a="snsGo"][data-v="profile"]',"個人檔案","你的頭貼、簡介、發過的貼文。"],
    ['[data-a="snsExit"]',"離開","回到 HAECHU。"]],
  "fan:core:truck":[[".trk-stage","應援餐車","手指拖一拖可以轉來轉去看，兩指可以放大。"],
    ['[data-a="tkNew"],.trk-new',"訂一台","選要送給誰、車身顏色、橫幅照片和標語、菜單、杯套、裝飾，再決定自己出錢還是找大家一起出。餐車會在藝人出道或回歸那天送到。"],
    [".trk-list,.trk-new~.section-h","我的餐車","你訂的、你一起出錢的餐車都在這裡，點一下看進度。"]],
  "fan:core:news":[['[data-a="newsF"]',"篩選","全部，或只看你追蹤的團。"],
    [".nw-row,.nw-hero","新聞","出道、回歸、拿一位，都會上 HAECHU 娛樂新聞。點進去看全文和照片。"]],
  "fan:core:wiki":[[".wk-box","SKpedia","每個團、每位成員的百科。"],['[data-a="wkRand"]',"隨機","隨便看一篇。"],['[data-a="wkMenu"]',"目錄","所有條目都在這裡。"]],
  "fan:core:fsl":[[".fs-card","簽售","正在報名的簽售都在這裡。"],['[data-a="fsJoin"]',"報名","按這裡報名，等抽籤結果。抽中會收到通知。"],['[data-a="fsBuy"]',"多一次機會","多買一張專輯，抽籤機會就多一次。"],['[data-a="fsRoom"]',"進簽售室","輪到你的時候按這裡，跟藝人視訊、拿簽名專輯。"]],
  "fan:core:concert":[[".cl-h","演唱會時間","下一場演唱會什麼時候開始。時間到了才能進場。"],[".ls-stage","你的應援棒","進場後舉起來的就是這支。手指可以轉著看。"],[".ls-buy","官方應援棒","到 SHOP 買你喜歡的團的官方應援棒，演唱會上會亮成那個團的顏色。"],['[data-a="concertOn"]',"進場","演唱會開始後按這裡進場，跟大家一起變成燈海。"],['[data-a="coreStick"]',"應援棒","買了官方應援棒，進場就會舉這一支。"],["#bdText","應援板","寫一句想對藝人說的話。互動歌的時候舉起來，藝人可能會回應你！"],[".ls-buy","還沒有應援棒","到 SHOP 買官方應援棒，演唱會就能舉起來。"]],
  "fan:core:tour":[[".tr2 .xv-hero","世巡","藝人的世界巡演，每一站都是一場演唱會。"],['[data-a="tourBuy"]',"買票","每一站要先買票才能進場。剩兩站以上可以一次全買，打 9 折。"],['.tr2 [data-a="tourOpen"]',"巡演護照","進場就會在護照上蓋章，五站蓋滿封面會變金色。"]],
  "fan:shop":[[".ws-pts","積分","你現在有多少積分。所有東西都用積分買。"],
    [".th-shop","TINT","換一套主題，整個 App 的顏色都會跟著變。"],
    [".ws-sl","推薦","現在買得到的 Membership 和專輯，左右滑看更多。"],
    [".ws-my","My Artist","看你喜歡的團有哪些商品。"],
    [".wsp-pc","商品","Membership、專輯、應援棒、周邊和 TIE 券。團體 TIE 券可以先選人數、再選天數、最後選成員。"],
    [".pass","我的 TIE 券","每張還剩幾天一目瞭然，快到期可以直接續訂。"]],
  "fan:me":[[".me-card","我的檔案","你的名字、等級、積分。等級照你現在的積分算，花掉積分等級也會跟著變。"],
    ['[data-a="meNickEd"]',"名稱","點筆可以改名字。TIE 聊天室裡的暱稱要到聊天室設定改。"],
    ['[data-a="meSec"][data-v="ms"]',"Membership","你加入的 Membership。"],
    ['[data-a="meSec"][data-v="tie"]',"TIE 券","你正在訂閱的 TIE。"],
    ['[data-a="meSec"][data-v="merch"]',"周邊","你的應援棒和周邊。"],
    ['[data-a="openCards"]',"小卡","收集到的小卡和公放卡都在卡冊裡。"],
    ['[data-a="openSigned"]',"簽名專輯","簽售拿到的簽名專輯。"],
    ['[data-a="meSec"][data-v="buy"]',"購買紀錄","買過的東西和花掉的積分。"],
    ['[data-a="settings"]',"通知設定","想收到哪些通知，你決定。"],
    ['[data-a="acctInfo"]',"帳號","你的登入帳號。"],
    ['[data-a="theme"]',"外觀","淺色、深色，或跟著手機。"],
    ['[data-a="a2h"]',"加到主畫面","把 HAECHU 加到 iPhone 主畫面，用起來就像一般 App，也收得到推播。"],
    ['[data-a="coachAgain"]',"重看教學","想再看一次這個教學，隨時點這裡。"]],
  /* ================= 藝人 ================= */
  "artist:home":[[".ap2-hero","你的個人頁","粉絲點你的名字時看到的就是這一頁。"],
    [".ap2-pen","換背景","選一張喜歡的照片當背景。"],
    [".ap2-av","頭貼","換一張頭貼，動態、直播和社群會一起換。TIE 的頭貼在 TIE 的選單裡另外換。"],
    [".ap2-fo","編輯個人檔案","背景、頭貼、名字和簡介都在這裡改。"],
    [".ap2-tabs","貼文／留言","你發過的動態，和你留過的話。"],
    [".art-fab","發表","想跟粉絲分享什麼，從這裡開始。"],
    ['.post [data-a="comments"]',"留言","看看粉絲說了什麼，也可以回覆他們，被回覆的粉絲會收到通知。"],
    ['.post [data-a="del"]',"刪除","刪掉這則動態，刪了就不能復原。"]],
  "artist:fab":[['.cmx-fabm [data-v="all"]',"貼文","所有粉絲都看得到。"],
    ['.cmx-fabm [data-v="ms"]',"Membership","只給加入 Membership 的粉絲看，其他人會看到模糊的畫面。"],
    ['.cmx-fabm [data-v="pw"]',"私密貼文","設一組密碼讓粉絲來猜，猜中的人才看得到。"]],
  "artist:write":[[".cw-t","寫內容","想說多少都可以，沒有字數限制。"],
    ['.aw-ic[aria-label="加入照片或影片"]',"照片／影片","放四張照片，或一支影片。"],
    ['[data-a="pollNew"]',"票選","出一題讓粉絲投票，選項也可以放圖片。"],
    ['[data-a="publish"],#pubBtn',"發布","寫好就發布，粉絲會收到通知。"]],
  "artist:live":[[".prep-card","準備開播","這是你的直播間。你說的每一句話，粉絲都會在畫面中間看到。"],
    ["#ltitle","直播標題","幫這場直播取個名字。"],
    ['[data-a="bgmOpen"]',"背景音樂","先放幾首歌（MP3 或 M4A，最多 8 首）。開播後按 ♪，粉絲那邊會一起聽到同一段。"],
    ['[data-a="startLive"]',"開始直播","按下去就開播！開播後點粉絲的留言，就能直接回覆他。"],
    [".lvr-h","重播","以前的直播都留在這裡。"]],
  "artist:room":[[".dl-title","直播間","你正在直播！上面是標題和你的名字。"],
    [".dl-co","連線","邀請一位別團或 SOLOIST 的藝人一起直播（一次一位）。對方在 MEET 按接受就會加入。"],
    ["#cmSpot","你說的話","你傳的每一句話，都會出現在畫面中間給粉絲看。"],
    [".host-feed","粉絲留言","粉絲的留言在這裡。點一則就能回覆他，大家都看得到。"],
    [".dl-bgm","背景音樂","按一下開始放音樂，再按一下就停，下次從停的地方接著放。"],
    ['.dl-side [data-a="dlChat"]',"留言開關","把留言收起來，畫面比較乾淨。"],
    ['.dl-side [data-a="dlMini"]',"縮小","把直播縮小去看別的地方，直播不會斷。"],
    ["#lin","說話","寫下想跟粉絲說的話，按送出。"],
    [".dl-exit","結束直播","說完再見，按這裡結束直播。"]],
  "artist:whisper":[[".t-dots","選單","點這裡打開選單，等一下帶你看看。"],
    ['[aria-label="檢舉這則訊息"]',"粉絲的回覆","粉絲回你的話在左邊。遇到不舒服的訊息，點「⋯」檢舉。"],
    [".t-arw","回覆","按粉絲訊息旁邊的箭頭，就能回覆那一句。大家都看得到你的回覆，但不會知道原本是誰說的。"],
    [".t-wait","待發送","寫好的訊息會先排著（最多 10 則），預覽後再一次送出。"],
    [".t-plus","照片／語音","傳照片或語音給粉絲。"],
    [".t-nick","@@@","打 @@@，每位粉絲看到的都會是自己的名字。"],
    ["#win","傳訊息","寫給所有訂閱你的粉絲，每個人都會收到。"]],
  "artist:drawer":[[".ad-pen","背景","粉絲點你的時候看到的背景。"],
    [".ad-av","頭貼","TIE 專用的頭貼，只有 TIE 會換。"],
    ['[data-a="artNameEd"]',"TIE 名稱","粉絲聊天室上方顯示的名字，可以跟動態的名字不一樣。"],
    ['[data-a="artBioEd"]',"個人簡介","寫幾句話介紹自己。"],
    ['[data-a="aTieBg"]',"聊天室背景","換聊天室的背景，粉絲那邊也會一起換（自己換過背景的粉絲不會變）。"],
    ['[data-a="tWelcome"]',"TIE 歡迎語","新粉絲訂閱時，第一則收到的話。"]],
  "artist:foc":[[".foc-now,.mu4-card","我的打歌","正在打歌的時候，這裡是你的歌和五個節目的名次；沒在打歌時，顯示冷卻中、可以申請回歸，或回歸倒數。點進去看完整的打歌戰況。"],
    [".foc-thr","這個月的王座","五台冠軍、AK、PAK，這個月拿到的團會亮在這裡。"],
    ['.tile[data-a="openSns"]',"SNS","你的個人帳號：發照片和限時動態、跟大家互動。"],
    ['[data-a="focGo"][data-v="news"]',"新聞","出道、回歸、拿一位的新聞。"],
    ['[data-a="focGo"][data-v="wiki"]',"SKpedia","你的百科，看看大家寫了什麼。"],
    ['[data-a="focGo"][data-v="show"]',"綜藝","收到綜藝邀請會在這裡，輪到你的時候會提醒。"],
    ['[data-a="focGo"][data-v="biz"]',"代言・雜誌","廣告和畫報的邀請。"],
    ['[data-a="focGo"][data-v="cafe"]',"生日咖啡廳","設定生日後，生日那天粉絲會幫你開咖啡廳。"],
    ['[data-a="focGo"][data-v="sign"]',"簽售","公司排好的簽售。簽售當天在這裡一位一位跟粉絲視訊。"],
    ['[data-a="focGo"][data-v="truck"]',"應援餐車","粉絲和其他藝人送你的餐車，也可以送別人。"],
    ['[data-a="focGo"][data-v="concert"]',"演唱會","排歌單、選互動歌、開演，走進燈海跟粉絲一起揮。"],
    ['[data-a="focGo"][data-v="tour"]',"世巡","申請世界巡演，排好每一站。"],
    ['[data-a="focGo"][data-v="isac"]',"偶像運動會","中秋和過年舉辦，看下一次什麼時候。"]],
  "artist:foc:honor":[[".mu4-bt","本週戰況","你的歌在五個節目各排第幾、幾分、跟第一名差多少，還有每個節目的結算倒數。分數細項：投票、專輯、MV 愛心、MV 觀看。"],
    [".fy-a","結尾妖精","每個節目每位成員一格（SOLOIST 一格）。點自己的格子放照片或影片，粉絲點你們的歌就會輪流播。"],
    [".mu4-pg","這首歌的成績","五台冠軍、AK、PAK 的進度，和每個節目拿了幾次一位（三次就是三冠王）。"],
    [".mu4-mc","MC","這個月你主持哪些節目。"],
    [".mu4-pts","打歌積分","今年的打歌積分。"],
    [".mu4-aw","獎項收藏","拿過的一位、AK、PAK、三冠王都會亮起來。"]],
  "artist:foc:truck":[['[data-a="tkTab"][data-v="in"]',"收到的","粉絲和其他藝人送你的餐車。出道或回歸那天才會送到，之前都是秘密。"],
    ['[data-a="tkTab"][data-v="out"]',"送出的","你送給其他藝人的餐車。"],
    [".trk-stage","餐車","拖一拖轉來轉去看，兩指放大。"],
    [".trk-list","每一台","點一下就能再看一次。"],
    ['[data-a="tkNew"]',"送一台","也可以送餐車給別團的藝人。"]],
  "artist:foc:concert":[["#acTitle","演唱會名稱","幫這場演唱會取個名字。"],[".lsp-songs","歌單","照順序點歌名，前面的數字就是第幾首。"],[".ls-seg","互動歌","前幾首是互動歌，粉絲會在燈海裡舉起應援板。"],['[data-a="acLater"]',"10 分鐘後開演","先通知粉絲，讓大家有時間做應援板。"],['[data-a="acNow"]',"現在開演","不用等，馬上開始。"],['[data-a="ccNow"]',"現在開始","時間到了就按這裡開始。"],['[data-a="stOn"]',"進入現場","走進燈海，拖動麥克風跟大家一起揮；點一下舉著應援板的粉絲就能回應他。"]],
  "artist:foc:tour":[['[data-a="trNew"]',"申請世巡","想辦世界巡演，從這裡開始。"],["#trTi","巡演名稱","幫這次巡演取個名字。"],["#trCity","城市","選一個城市。"],["#trWhen","時間","這一站什麼時候開演。"],['[data-a="trStopAdd"]',"加入","加進站點，最多 5 站。"],['[data-a="trSubmit"]',"送出申請","送給管理員審核，核准後粉絲就能買票。一年一次世巡。"],[".tr2 .xv-hero","你的世巡","下一站、拿到的積分和每一站都在這裡。"],['[data-a="trSay"]',"說一句話","開演前留一句話給這一站的粉絲。"]],
  "artist:foc:sign":[[".fs2 .xv-hero","簽售","公司排好的簽售，報名人數和名單都看得到。"],['[data-a="fsDesk"]',"進簽售台","開場後按這裡，一位一位跟粉絲視訊、簽名。"]],
  "artist:foc:stick":[[".ls-box","官方應援棒","你們團的應援棒，可以轉來轉去看。"]],
  "artist:foc:news":[['[data-a="newsF"]',"篩選","全部，或只看某一團。"],[".nw-row,.nw-hero","新聞","出道、回歸、拿一位，都會上 HAECHU 娛樂新聞。"]],
  "artist:sns":[['[data-a="snsGo"][data-v="new"]',"限時動態","發一則 24 小時後消失的限時動態，可以 @ 粉絲或其他藝人。"],
    ['[data-a="snCreate"]',"新增","發一則貼文。這是你藝人身分的帳號，跟你的粉絲帳號分開。"],
    ['[data-a="snsGo"][data-v="notif"]',"通知","誰按讚、留言、@ 你。"],
    ['[data-a="snsGo"][data-v="dm"]',"私訊","跟其他藝人或粉絲私訊。"],
    ['[data-a="snsGo"][data-v="profile"]',"個人檔案","你的 SNS 頭貼和簡介。"],
    ['[data-a="snsExit"]',"離開","回到 HAECHU。"]],
  "artist:me":[[".me-card,.me-lv","你的等級","照你現在的積分算。積分跟你的粉絲帳號是同一份，哪邊花掉另一邊就跟著少。"],
    ['[data-a="aNick"]',"粉絲的愛稱","幫 Membership 粉絲取一個專屬的愛稱。"],
    ['[data-a="thMine"]',"做主題","設計一套你自己的 App 主題，通過審核就會上架 SHOP。"],
    ['[data-a="cbrAsk"]',"申請回歸","填歌名、發行型態、日期，放 Teaser、MV 和 MV Teaser，送給公司審核。每間公司的冷卻期不一樣，冷卻期過了才能申請。"],
    ['[data-a="focGo"][data-v="stick"]',"官方應援棒","你們團的應援棒。"],
    ['[data-v="#/artist?tab=points"]',"積分收入","你收到了多少積分。"],
    ['[data-a="swapRole"]',"切換到粉絲","回到你的粉絲帳號，去追其他藝人。"],
    ['[data-a="theme"]',"外觀","淺色、深色，或跟著手機。"],
    ['[data-a="coachAgain"]',"重看教學","想再看一次這個教學，隨時點這裡。"]],
  /* ================= 管理 ================= */
  "admin:home":[[".uni-sw","三個畫面","粉絲、藝人、管理，點一下就切換。「管理」旁邊的數字是還沒處理的事。"],
    [".uni-empty,main.page>.card:first-of-type","要處理的事","等你處理的都排在這裡：出道和回歸申請、檢舉、主題審核、試玩訪客的訊息、3 天沒傳 TIE 的藝人。每一項都標了數字，點一下直接去處理。"],
    [".uni-stats","今天","正在直播的有幾場、24 小時內有多少新留言、接下來有幾個活動。點直播可以直接進去看。"]],
  "admin:artist":[['.list-btn[data-v="#/admin?tab=roster"]',"藝人與團","所有的團和藝人。點進去看每個團的成員、改資料、設定公司。"],
    ['.uni-top [data-v="#/admin?tab=roster&p=new"]',"新增藝人","右上角的「＋」：新增一個團體，或一位個人藝人（SOLOIST）。"],
    ['.list-btn[data-v="#/admin?tab=debut"]',"出道申請","粉絲申請出道會出現在這裡。看完 Teaser、MV 和 MV Teaser 再核准，出道當天會自動上新聞。"],
    ['.list-btn[data-v="#/admin?tab=cbreq"]',"回歸申請","藝人申請回歸會出現在這裡。核准後，回歸當天會自動上新聞、MV 放進影音區。"],
    ['.list-btn[data-v="#/admin/sns?p=scout"]',"星探","在 SNS 上看到有潛力的粉絲，先記在星探名單裡。"]],
  "admin:reports":[[".mod-seg","內容","上面三個分頁：檢舉、全部貼文、公告。"],
    [".rp","檢舉","被檢舉的內容：誰檢舉的、為什麼、被檢舉幾次。"],
    [".rp-act","處理","沒問題就駁回；有問題就刪除，或禁言、停權。"]],
  "admin:posts":[['[data-a="ag"]',"篩選","只看某一個團的貼文。"],[".ap-g,.apl","全部貼文","照藝人分好，點一下展開那位藝人的貼文。"],['[data-a="hide"]',"隱藏","先藏起來，之後還能恢復。"],['[data-a="admDel"]',"刪除","直接刪掉，刪了就不能復原。"]],
  "admin:announce":[['.uni-top [data-a="uniAnn"]',"發公告","右上角的「＋」：用 HAECHU 官方發公告給全部粉絲。"],['[data-a="annDel"],[data-a="gnDel"]',"撤下","把公告撤下來。"]],
  "admin:foc":[['.foc-fold[data-v="wk"]',"每週","每週都要做的事。點標題可以收起來，下次打開會記得。"],
    ['[data-a="focSeg"][data-v="sched"]',"賽程","設定這週是宣傳週、排名週還是打歌週；不設定就照日期走。"],
    ['[data-a="focSeg"][data-v="music"]',"打歌","五個音樂節目的一位、MC 和歌曲。節目會在播出時間自動結算，需要時可以手動改一位。"],
    ['[data-a="focSeg"][data-v="news"]',"新聞","HAECHU 娛樂新聞。出道、回歸、拿一位會自動寫，也可以自己發。"],
    ['.foc-fold[data-v="pd"]',"檔期","有檔期才辦的活動。"],
    ['[data-a="focSeg"][data-v="fs"]',"簽售","開簽售場次、審核報名、抽出中選的粉絲。"],
    ['[data-a="focSeg"][data-v="truck"]',"餐車","粉絲訂的應援餐車訂單。"],
    ['[data-a="focSeg"][data-v="show"]',"綜藝","安排綜藝節目和錄影。"],
    ['[data-a="focSeg"][data-v="biz"]',"代言・雜誌","發廣告和畫報的邀約給藝人。"],
    ['[data-a="focSeg"][data-v="cafe"]',"生日咖啡廳","藝人生日那天開的咖啡廳。"],
    ['.foc-fold[data-v="big"]',"大型活動","規模比較大的活動。收起來時，裡面有待處理的會出現小點。"],
    ['[data-a="focSeg"][data-v="concert"]',"演唱會","開演唱會、設定燈光和歌曲。"],
    ['[data-a="focSeg"][data-v="tour"]',"世巡","審核藝人申請的世界巡演。"],
    ['[data-a="focSeg"][data-v="sv"]',"選秀","舉辦選秀，粉絲每天可以投票。"],
    ['[data-a="focSeg"][data-v="isac"]',"偶像運動會","中秋和過年舉辦的偶像運動會。"]],
  "admin:ops":[['.list-btn[data-v="#/admin?tab=accounts"]',"帳號","幫新人建立帳號，也看得到所有人的帳號。"],
    ['.list-btn[data-v="#/admin?tab=ptadd"]',"加積分","每個月結算積分用：可以加、扣，或直接設定成某個數字。"],
    ['.list-btn[data-v="#/admin?tab=albums"]',"專輯與店家","店家、專輯、版本、特典（含公放卡）。"],
    ['.list-btn[data-v="#/admin/themes"]',"主題（TINT）","大家做的主題要先經過你審核，才會上架。"],
    ['.list-btn[data-v="#/admin?tab=translate"]',"翻譯服務","粉絲和藝人訊息的自動翻譯用哪一家。"],
    ['.list-btn[data-v="#/admin?tab=banned"]',"禁用字詞","放進來的字，在 App 裡就傳不出去。"],
    ['.list-btn[data-v="#/admin?tab=cloud"]',"雲端用量","資料和照片用了多少空間，離免費上限還有多遠。"],
    ['[data-a="maintToggle"]',"維修模式","打開後只有管理員能進 App，其他人會被請出去。要更新或修東西的時候用。"],
    ['.list-btn[data-v="#/admin?tab=try"]',"試玩訊息","試玩網站的訪客傳來的 TIE 訊息，可以在這裡回覆。"]],
  "admin:accounts":[["#acUser","帳號","填他們給你的帳號。"],["#acReal","本名","填他們真正的本名，只有管理員看得到。"],["#acName","暱稱","隨便填，本人之後可以自己改。"],["#acPw","密碼","填他們給你的密碼。"],['[data-a="acCreate"]',"建立帳號","四格都填好就按這裡。這裡建的都是一般粉絲帳號。"],[".ac-list","目前的帳號","大家的帳號都在這裡，點進去可以改名字、重設密碼。"]],
  "admin:roster":[['[data-v="#/admin?tab=roster&p=new"]',"新增","按右上角的「＋」新增團體或個人藝人。"],[".rs-row","團和藝人","點進去可以加成員、綁帳號、設定公司、上傳出道照和 Teaser 照。"]],
  "admin:rosternew":[[".rs-type","團體或個人","團體：先建團，再一個一個加成員。個人（SOLOIST）：一次就建好。"],["#rgName","名字","團體就填團名，個人就填藝名。"],['[data-a="rsColor"]',"代表色","社群、卡片都會用這個顏色。"],["#rsAcc","綁定帳號","選這位藝人登入用的帳號。還沒有就選「之後再選」。"],["#rsBday","生日","月-日，例如 3-14。可以之後再填。"],['[data-a="rgAdd"]',"建立","按這裡就建好了。"]],
  "admin:ptadd":[["#ptQ","找人","打帳號或名字找人，可以一次選很多個。"],['[data-a="ptSign"]',"加、扣、設定為","加積分、扣積分，或直接把積分設定成某個數字。"],["#ptN","積分","填數字就好。"],["#ptWhy","原因","對方會看到，例如「10 月積分結算」。"],['[data-a="ptGo"]',"送出","按下去就送出了，對方會收到「獲得 ○○ 積分・原因」的通知。"]],
  "admin:banned":[["#banTa","禁用字詞","大家不想看到的字，一行放一個。放進來的字，在 App 裡就傳不出去。"],['[data-a="banSave"]',"儲存","改完記得按儲存。"]]};

/* =========================================================
   新手教學的示範內容
   ・只在完整教學進行中（ui.tourDemo）才出現，而且只有在那一頁本來是空的時候才補
   ・只在讀取時加進去（S.get），寫回去時一律濾掉 tdm_ 開頭的東西 → 不會存進手機、也不會上雲端
   ========================================================= */
function tdmCtx(){ const s=session()||{}; let mid="", gid="";
  if(s.role==="artist"&&s.member&&MEMBERS[s.member]){ mid=s.member; gid=MEMBERS[mid].group; }
  else { gid=(followed()||[]).find(g=>groupOf(g)&&grpMembers(g).some(x=>MEMBERS[x]))||(GROUPS.find(g=>grpMembers(g.id).some(x=>MEMBERS[x]))||{}).id||""; mid=gid?grpMembers(gid).find(x=>MEMBERS[x])||"":""; }
  return {gid,mid,g:groupOf(gid),now:Date.now()}; }
const TDM_GEN={
  [K.news]:()=>{ const {gid,g,now}=tdmCtx(); if(!g) return []; return [
    {id:"tdm_nw1",title:`${g.name} 回歸《示範歌曲》正式開跑，主打曲 MV 同步公開`,body:"這是教學用的示範新聞。出道、回歸、拿到音樂節目一位的時候，都會自動出現在這裡。\n\n教學結束後這則新聞就會消失。",img:"",gids:[gid],ts:now-2*3600e3},
    {id:"tdm_nw2",title:`${g.name}《示範歌曲》拿下 THE SHOW 一位`,body:"這是教學用的示範新聞，教學結束就會消失。",img:"",gids:[gid],ts:now-26*3600e3}]; },
  [K.fs]:()=>{ const {gid,g,now}=tdmCtx(); if(!g) return []; const D=864e5, members=typeof fsMembersOf==="function"?fsMembersOf(gid):grpMembers(gid);
    return [{id:"tdm_fs",group:gid,type:"all",toSign:true,title:`${g.name} 示範簽售會`,startTs:now+6*D,closeTs:now+D,quota:10,specials:1,members,entries:{},names:{},notes:{},status:"open",slots:[],wait:{},cur:-1,mi:0,curStart:0,chats:{},signed:{},seen:{}}]; },
  [K.wtours]:()=>{ const {gid,mid,g,now}=tdmCtx(); if(!g) return []; const D=864e5;
    return [{id:"tdm_tr",gid,by:mid,title:`${g.name} 示範世巡`,stops:[{id:"tdm_ts1",city:"首爾",startTs:now+3*D},{id:"tdm_ts2",city:"東京",startTs:now+10*D},{id:"tdm_ts3",city:"大阪",startTs:now+12*D}],status:"approved",ts:now-2*D,okTs:now-D}]; },
  [K.trucks]:()=>{ const {mid,gid,g,now}=tdmCtx(); if(!g||!mid) return []; const me=myEmail()||"tdm";
    return [{id:"tdm_tk",mid,gid,by:me,byName:"示範粉絲",shares:1,deco:{slogan:"教學用的示範餐車",from:"示範粉絲",pal:2},ts:now-864e5,paid:[{em:me,who:"fan",name:"示範粉絲",ts:now-864e5}]}]; },
  [K.concerts]:()=>{ const {gid,g,now}=tdmCtx(); if(!g) return []; const st=now+2*3600e3;
    return [{id:"tdm_cc",gid,title:`${g.name} 示範演唱會`,startTs:st,endTs:st+90*60e3,mins:90,setlist:[],nIa:0}]; }};
(function(){ const g0=S.get, s0=S.set, isT=x=>String(x&&x.id||"").startsWith("tdm_");
  S.get=function(k,fb){ const v=g0.call(S,k,fb); if(!ui.tourDemo||!TDM_GEN[k]||!Array.isArray(v)||v.some(x=>!isT(x))) return v; try{ return [...v.filter(x=>!isT(x)),...TDM_GEN[k]()]; }catch(e){ return v; } };
  S.set=function(k,v){ if(TDM_GEN[k]&&Array.isArray(v)&&v.some(isT)) v=v.filter(x=>!isT(x)); return s0.apply(S,[k,v,...[].slice.call(arguments,2)]); };
})();

/* =========================================================
   出道／回歸的宣傳排程（公司官方帳號自動發）
   ・申請表多了：每天發布時間、排程表、曲目表、概念照（多版本）、Highlight Medley／概念影片（二選一）
   ・核准後，從隔天開始照藝人選的時間一則一則發，到出道／回歸當天「發行」
   ・發文是「算出來的」：不寫資料、不跑排程 → 兩支手機不會打架，也不會多用雲端
   ・粉絲：LOVE 動態裡跟藝人動態排在一起；通知頁置頂大卡
   ・藝人：通知頁最上面的置頂大卡
   ・照片會出現在那個團社群的「影音」→「照片」
   ・專輯可以設定「跟著發行」：發行那一刻才在 SHOP 出現
   ========================================================= */
const CO_INFO={"SM":{n:"SM Entertainment",l:"co/sm.webp"},"HYBE":{n:"HYBE",l:"co/hybe.webp"},"JYP":{n:"JYP Entertainment",l:"co/jyp.webp"},"YG":{n:"YG Entertainment",l:"co/yg.webp"},
  "PAPERMOON":{n:"PAPERMOON Entertainment",l:"co/papermoon.webp"},"BLUE HOUR":{n:"BLUE HOUR Entertainment",l:"co/bluehour.webp"},"DOLPUNG Lab.":{n:"DOLPUNG Lab.",l:"co/dolpung.webp"}};
const coInfo=co=>CO_INFO[co]||{n:APP_NAME,l:""};
const CO_IC={chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  cm:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8"/><circle cx="17" cy="9" r="2.4"/><path d="M15.8 14.4c2.3.2 4 1.8 4.6 4.6"/></svg>',
  tie:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8.5 10.5h7"/></svg>',
  sns:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".6" fill="currentColor"/></svg>',
  wk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4.5h10.5a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10.5"/><path d="M9 8.5h5"/></svg>'};
const coAv=(co,cls="")=>{ const c=coInfo(co); return `<span class="co-av ${cls}">${c.l?`<img src="${esc(c.l)}" alt="${esc(c.n)}">`:esc(c.n[0])}</span>`; };
const PR_KIND={sc:"SHOWCASE",sched:"SCHEDULE",teaser:"Teaser Image",concept:"Concept Photo",trk:"Track List",medley:"Highlight Medley",film:"Concept Film",mvt:"MV Teaser",rel:"OUT NOW"};

/* ---------- 有哪些出道／回歸要發 ---------- */
function promoSrcs(all){ const L=[], now=Date.now();
  getDebut().filter(x=>(x.status==="pre"||x.status==="ok")&&x.day&&x.appr).forEach(x=>L.push({k:"db",id:x.id,gid:x.gid||"",name:x.name,title:x.song||"",day:x.day,appr:x.appr,mv:x.mv||null,co:coOfGid(x.gid)||x.co||"",teaser:x.teaser,teasers:x.teasers||[],mvt:x.mvt,pr:x.pr||{},rtype:x.rtype||"",g:x.g||0,solo:x.kind!=="group"}));
  try{ getDf().forEach(x=>{ const g=groupOf(x.gid), day=dfDebutDay(x.gid)||x.day; L.push({k:"db",id:x.id,gid:x.gid,name:g.name,title:x.title||"",day,appr:day-PRE_ANN,mv:dfMv(x.gid),co:coOf(x.gid)||"",teaser:x.teaser,teasers:x.teasers||[],mvt:x.mvt,pr:x.pr||{},rtype:x.rtype||"",g:g.g||0,solo:!!g.solo,fill:1}); }); }catch(e){}
  /* 已經出道、但沒有出道申請也沒補資料的（例如直接開好的團）：一樣自動當成一筆出道，公司帳號照樣發；之後補資料會接著用同一個編號 */
  try{ const have=new Set(L.map(x=>x.gid)); GROUPS.forEach(g=>{ if(!g||g.id==="tdm_g"||have.has(g.id)||g.demo) return; if(getDebut().some(d=>d.gid===g.id&&d.status!=="gone")) return; const so=dfDebutSong(g.id); if(!so||so.demo) return; const day=dfDebutDay(g.id)||(songRel(so)?dayStart(songRel(so)):0); if(!day) return;
    L.push({k:"db",id:"df_"+g.id,gid:g.id,name:g.name,title:so.title||"",day,appr:day-PRE_ANN,mv:dfMv(g.id),co:coOf(g.id)||"",teaser:"",teasers:[],mvt:null,pr:{},rtype:so.rtype||"",g:g.g||0,solo:!!g.solo,fill:1,auto:1}); }); }catch(e){}
  const P=getMShow().pre||[];
  getCbr().filter(x=>x.status==="ok"&&x.done).forEach(x=>{ const g=groupOf(x.gid); if(!g) return; const p=P.find(y=>y.req===x.id); L.push({k:"cb",id:x.id,gid:x.gid,name:g.name,title:x.title,day:p?p.day:x.day,appr:x.done,mv:x.mv||null,co:coOf(x.gid),teaser:x.teaser,teasers:x.teasers||[],mvt:x.mvt,pr:x.pr||{},rtype:x.rtype||"",g:g.g||0,solo:!!g.solo}); });
  return all?L:L.filter(s=>now-s.day<45*864e5); }
/* 一筆出道／回歸的排程：核准隔天開始，平均排到前一天，最後一格是發行 */
function promoPlan(s){ const D=864e5, pr=s.pr||{}, tm=/^(\d{1,2}):(\d{2})$/.exec(pr.time||"")||[0,18,0], at=((+tm[1])*60+(+tm[2]))*60e3, it=[{k:"sched"}];
  [s.teaser,...(s.teasers||[])].filter(Boolean).forEach(u=>it.push({k:"teaser",imgs:[u]}));
  (pr.cv||[]).filter(v=>(v.ph||[]).some(Boolean)).forEach(v=>it.push({k:"concept",n:v.n||"",imgs:v.ph.filter(Boolean)}));
  if((String(pr.trk||"").trim()||pr.trkImg)&&(!s.rtype||needsTrk(s.rtype))) it.push({k:"trk"});
  if(pr.vid&&pr.vid.mid) it.push({k:pr.vk==="film"?"film":"medley",vid:pr.vid});
  if(s.mvt&&s.mvt.mid) it.push({k:"mvt",vid:s.mvt});
  const st=Math.max(s.appr,s.day-PRE_ANN), d0=dayStart(st)+D, dl=dayStart(s.day)-D, nd=Math.max(1,Math.round((dl-d0)/D)+1);
  /* 排程表：核准的當下就發；其他從隔天開始平均排 */
  const R=it.length-1; it.forEach((x,i)=>{ let ts=i===0?st:d0>dl?st+i*60e3:d0+Math.min(nd-1,Math.floor((i-1)*nd/Math.max(1,R)))*D+at; x.ts=Math.min(ts,s.day-60e3); x.id=`cp_${s.id}_${i}`; x.src=s; });
  it.push({k:"rel",ts:s.day+at,id:`cp_${s.id}_rel`,src:s,imgs:[pr.cov||s.teaser].filter(Boolean),...(s.mv&&s.mv.mid?{vid:{mid:s.mv.mid,thumb:s.mv.thumb||""}}:{})});
  { const sc=/^(\d{1,2}):(\d{2})$/.exec(pr.sc||""); if(sc){ const sat=((+sc[1])*60+(+sc[2]))*60e3; it.push({k:"sc",ts:s.day+Math.max(sat,at+60e3),id:`cp_${s.id}_sc`,src:s,imgs:[s.teaser].filter(Boolean)}); } }
  const cnt={}; it.forEach(x=>{ cnt[x.k]=(cnt[x.k]||0)+1; x.no=cnt[x.k]; }); it.forEach((x,i)=>{ x.tot=cnt[x.k]; x.idx=i; x.all=it.length; }); return it; }
const coPosts=()=>{ const now=Date.now(); return promoSrcs().flatMap(promoPlan).filter(x=>x.ts<=now).sort((a,b)=>b.ts-a.ts); };


/* 照片：給社群「照片」和置頂大卡用 */
const promoImgs=gid=>coPosts().filter(x=>x.src.gid===gid&&(x.k==="teaser"||x.k==="concept")).flatMap(x=>x.imgs.map(u=>({u,t:x.k==="concept"?(x.n||"Concept Photo"):"Teaser Image",ts:x.ts})));

/* ---------- 自動做的排程表、曲目表（沒上傳圖片時） ---------- */
function promoSchedCard(s){ const L=promoPlan(s).filter(x=>x.k!=="sched");
  return `<div class="pr-auto" style="--c:${(GRADS[s.g%GRADS.length]||[])[0]||"#8b5cf6"}">${s.teaser?`<span class="pr-abg" style="background-image:url('${esc(s.teaser)}')"></span>`:""}
    <div class="pr-ah"><em>${s.k==="db"?"DEBUT":"COMEBACK"} SCHEDULE</em><b>${esc(s.name)}</b>${s.title?`<small>《${esc(s.title)}》</small>`:""}</div>
    <ol class="pr-al">${L.map(x=>`<li><time>${mdTxt(x.ts)}${x.k==="rel"?"":" "+hm(x.ts)}</time><span>${x.k==="concept"&&x.n?`Concept Photo・${esc(x.n)}`:PR_KIND[x.k]}</span></li>`).join("")}</ol></div>`; }
/* 曲目照藝人自己排；跟出道曲／回歸歌名一樣的那一首才標 TITLE */
const trkNorm=v=>String(v||"").toLowerCase().replace(/[\s'"「」《》【】<>()（）\[\]]/g,"");
const trkIsTitle=(t,s)=>(!!s.title&&trkNorm(t)===trkNorm(s.title))||(!!(s.pr||{}).t2&&trkNorm(t)===trkNorm(s.pr.t2));
function promoTrkCard(s){ const T=String((s.pr||{}).trk||"").split("\n").map(x=>x.trim()).filter(Boolean);
  return `<div class="pr-auto trk" style="--c:${(GRADS[s.g%GRADS.length]||[])[0]||"#8b5cf6"}">${s.teaser?`<span class="pr-abg" style="background-image:url('${esc(s.teaser)}')"></span>`:""}
    <div class="pr-ah"><em>TRACK LIST</em><b>${esc(s.name)}</b>${s.rtype?`<small>${esc(s.rtype)}</small>`:""}</div>
    <ol class="pr-at">${T.map((t,i)=>`<li><i>${String(i+1).padStart(2,"0")}</i><span>${esc(t)}</span>${trkIsTitle(t,s)?`<em>TITLE</em>`:""}</li>`).join("")}</ol></div>`; }
const hm=ts=>{ const d=new Date(ts); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; };

/* ---------- 一則公司官方貼文 ---------- */
function coPostCard(x){ if(x.k==="ann"){ const a=x.ann, src=annSrc(a), cap=src?coCap(x.co,src.k==="db"?"annDb":"annCb",src,{ts:a.ts}):null; return `<article class="card post cp">${coHead(x.co,a.ts)}${cap?capHtml(cap):`<p class="cp-x cp-body">${esc(a.text)}</p>`}${a.img?`<button class="cp-img cp-aimg" data-a="cpPh" data-v="${esc(a.img)}"><img src="${esc(a.img)}" alt=""></button>`:""}</article>`; } if(x.k==="news") return coNewsCard(x); if(x.k==="note") return coNoteCard(x); const s=x.src, body=coBodyOf(x);
  const cap=coCap(s.co,x.k,s,x);
  return `<article class="card post cp" id="post-${x.id}">${coHead(s.co,x.ts)}${capHtml(cap)}${body}${relExtra(x)}</article>`; }
const relExtra=x=>{ if(x.k!=="rel") return ""; const pr=(x.src||{}).pr||{}; if(!pr.album&&!pr.desc&&!pr.credit&&!pr.lyr) return "";
  return `<div class="cp-rx">${pr.album?`<p class="cp-ra">💿 ${esc(pr.album)}</p>`:""}${pr.desc?`<p class="cp-x">${esc(pr.desc).replace(/\n/g,"<br>")}</p>`:""}${pr.credit?`<p class="cp-rc">${esc(pr.credit).replace(/\n/g,"<br>")}</p>`:""}${pr.lyr?`<details class="cp-ly"><summary>主打歌歌詞</summary><p>${esc(pr.lyr).replace(/\n/g,"<br>")}</p></details>`:""}</div>`; };
function coBodyOf(x){ const s=x.src, pr=s.pr||{}; let body="";
  if(x.k==="sched") body=pr.sched?`<button class="cp-img" data-a="cpPh" data-v="${esc(pr.sched)}"><img src="${esc(pr.sched)}" alt=""></button>`:promoSchedCard(s);
  else if(x.k==="trk") body=pr.trkImg?`<button class="cp-img" data-a="cpPh" data-v="${esc(pr.trkImg)}"><img src="${esc(pr.trkImg)}" alt=""></button>`:promoTrkCard(s);
  else if(x.vid){ const pv=s.teaser||(s.teasers||[])[0]||((pr.cv||[]).flatMap(v=>v.ph||[]).filter(Boolean)[0])||""; body=`<button class="cp-vid" data-a="cpVid" data-v="${esc(x.vid.mid)}">${x.vid.thumb?`<img data-mid="${esc(x.vid.thumb)}" alt=""${pv?` src="${esc(pv)}"`:""}>`:pv?`<img src="${esc(pv)}" alt="">`:""}<i>▶</i></button>`; }
  else if((x.imgs||[]).length) body=x.imgs.length>1?`<div class="cp-sw"><div class="cp-swr">${x.imgs.map(u=>`<button class="cp-img" data-a="cpPh" data-v="${esc(u)}"><img src="${esc(u)}" alt="" loading="lazy"></button>`).join("")}</div><div class="cp-swd">${x.imgs.map((_,i)=>`<i class="${i?"":"on"}"></i>`).join("")}</div></div>`:`<button class="cp-img cp-one" data-a="cpPh" data-v="${esc(x.imgs[0])}"><img src="${esc(x.imgs[0])}" alt="" loading="lazy"></button>`;   /* 很多張：左右滑 */
  return body; }
/* ---------- SOLOIST／團的官方帳號：同一套出道／回歸宣傳自動發到團社群（圖在上、帳號和文字在下） ---------- */
const ofAv=gid=>{ const g=groupOf(gid)||{}, ph=gPhoto(gid); return `<span class="av ofc-av" style="background:${grad(g.g||0)}">${ph?`<span class="av-img av-bgi" style="background-image:url('${esc(ph)}')"></span>`:esc(ini(g.name||"?"))}</span>`; };

const ofPromo=gid=>coPosts().filter(x=>x.src&&x.src.gid===gid&&groupOf(gid));

/* ---------- MEET•Media：每張專輯一個分區，橫滑縮圖（像 Weverse LIVE•Media） ---------- */
const dotYmd=ts=>{ const d=new Date(ts); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`; };
const albName=s=>{ const pr=s.pr||{}, nm=pr.album||s.title||""; return `${s.rtype?esc(s.rtype)+" ":s.k==="db"?"Debut ":""}${nm?`&lt;${esc(nm)}&gt;`:""}`.trim()||esc(s.name||""); };
const albTitle=x=>{ const s=x.src, q=s.title?`'${s.title}' `:""; return x.k==="concept"&&x.n?`${q}Concept Photo・${x.n}`:x.k==="rel"?`${q}${x.vid?"M/V":"OUT NOW"}`:x.k==="sched"?`${q}${s.k==="db"?"Debut":"Comeback"} Schedule`:`${q}${PR_KIND[x.k]||""}`; };
function albThumb(x){ const s=x.src, pr=s.pr||{}, imgs=x.imgs||[];
  if(x.vid){ const pv=s.teaser||(s.teasers||[])[0]||((pr.cv||[]).flatMap(v=>v.ph||[]).filter(Boolean)[0])||""; return {a:"cpVid",v:x.vid.mid,h:`${x.vid.thumb?`<img data-mid="${esc(x.vid.thumb)}" alt=""${pv?` src="${esc(pv)}"`:""}>`:pv?`<img src="${esc(pv)}" alt="">`:""}<i class="alb-p">▶</i>`}; }
  if(x.k==="sched"||x.k==="trk"){ const u=x.k==="sched"?pr.sched:pr.trkImg; if(u) return {a:"cpPh",v:u,h:`<img src="${esc(u)}" alt="" loading="lazy">`};
    return {a:"cmAlbP",v:x.id,h:`<div class="snof-sc">${x.k==="sched"?promoSchedCard(s):promoTrkCard(s)}</div>`}; }
  if(!imgs.length) return null;
  return imgs.length>1?{a:"cmAlbP",v:x.id,h:`<img src="${esc(imgs[0])}" alt="" loading="lazy"><i class="alb-n">${si("carousel","sm")}${imgs.length}</i>`}:{a:"cpPh",v:imgs[0],h:`<img src="${esc(imgs[0])}" alt="" loading="lazy">`}; }
function grpAlbums(gid){ const by={}; ofPromo(gid).forEach(x=>{ (by[x.src.id]=by[x.src.id]||{s:x.src,L:[]}).L.push(x); });
  const G=Object.values(by).sort((a,b)=>b.s.day-a.s.day); if(!G.length) return "";
  setTimeout(()=>document.querySelectorAll(".alb-t img[data-mid]:not([data-hyd])").forEach(async el=>{ el.dataset.hyd="1"; const u=await mediaSrc(el.dataset.mid); if(u) el.src=u; }),0);
  return G.map(({s,L})=>{ const C=L.sort((a,b)=>b.ts-a.ts).map(x=>{ const t=albThumb(x); return t?`<button class="alb-c" data-a="ofOpen" data-v="${esc(x.id)}"><span class="alb-t">${t.h}</span><b>${esc(albTitle(x))}</b><small>${dotYmd(x.ts)}</small></button>`:""; }).join("");
    return C?`<div class="cm-sh alb-h"><h3>${albName(s)} <span>›</span></h3></div><div class="alb-r">${C}</div>`:""; }).join(""); }

/* ---------- 官方媒體貼文（像 Weverse）：首頁動態裡跟藝人貼文混排，點開是媒體頁 ---------- */
const OFLK="daisuki_oflk", OFBM="daisuki_ofbm";
const ofLikes=id=>(S.get(OFLK,{})[id]||[]), ofMeK=()=>{ const s=session()||{}; return s.email||s.name||"me"; };
function ofLike(id){ const L=S.get(OFLK,{}), a=L[id]||[], me=ofMeK(), on=a.includes(me); L[id]=on?a.filter(x=>x!==me):[...a,me]; S.set(OFLK,L);
  document.querySelectorAll(`[data-a="ofLk"][data-v="${CSS.escape(id)}"]`).forEach(b=>{ b.classList.toggle("on",!on); const n=b.querySelector("b"); if(n) n.textContent=fmt(L[id].length); }); }
function ofBmT(id){ const B=S.get(OFBM,[]), on=B.includes(id); S.set(OFBM,on?B.filter(x=>x!==id):[...B,id]); document.querySelectorAll(`[data-a="ofBm"][data-v="${CSS.escape(id)}"]`).forEach(b=>b.classList.toggle("on",!on)); }
const ofBar=id=>{ const L=ofLikes(id), on=L.includes(ofMeK()), bm=S.get(OFBM,[]).includes(id); return `<div class="ofm-bar"><button class="ofm-lk ${on?"on":""}" data-a="ofLk" data-v="${esc(id)}" aria-label="喜歡">${OF_IC.heart}<b>${fmt(L.length)}</b></button><i class="ofm-sp"></i><button class="ofm-bm ${bm?"on":""}" data-a="ofBm" data-v="${esc(id)}" aria-label="收藏">${OF_IC.bm}</button></div>`; };
const OF_IC={send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 12 20 4l-4 16-4-7z"/><path d="m12 13 8-9"/></svg>',heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20.2s-7.6-4.7-7.6-10.4A4.4 4.4 0 0 1 12 7.1a4.4 4.4 0 0 1 7.6 2.7c0 5.7-7.6 10.4-7.6 10.4z"/></svg>',cm:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 4.2c4.6 0 8.2 3.2 8.2 7.4s-3.6 7.4-8.2 7.4c-1.1 0-2.2-.2-3.2-.5L4.6 19.8l1.2-3.6A7 7 0 0 1 3.8 11.6c0-4.2 3.6-7.4 8.2-7.4z"/></svg>',bm:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M6.5 3.8h11v16.6L12 16.3l-5.5 4.1z"/></svg>'};
const ofWhen=ts=>{ const d=new Date(ts), z=n=>String(n).padStart(2,"0"); return `${d.getMonth()+1}. ${d.getDate()}. ${z(d.getHours())}:${z(d.getMinutes())}`; };
const ofAcct=gid=>{ const g=groupOf(gid)||{}; return `<b class="ofm-n">${esc(g.name||"")} ${I.verified}</b>`; };
function ofMediaCard(x){ const t=albThumb(x); if(!t) return ""; const gid=x.src.gid;
  return `<article class="card ofm" id="post-of-${x.id}"><button class="ofm-t" data-a="ofOpen" data-v="${esc(x.id)}">${t.h}</button>
    <div class="ofm-b" data-a="ofOpen" data-v="${esc(x.id)}"><span class="ofm-h"><button class="ofm-go" data-a="ofGrp" data-v="${esc(gid)}">${ofAv(gid)}</button><span><button class="ofm-go" data-a="ofGrp" data-v="${esc(gid)}">${ofAcct(gid)}</button><small>${ofWhen(x.ts)}</small></span></span><p class="ofm-tt">${esc(albTitle(x))}</p></div>${ofBar(x.id)}</article>`; }
function ofMix(posts,ofs){ const L=[...posts.map(p=>({ts:p.ts||0,h:()=>postCard(p)})),...ofs.map(x=>({ts:x.ts,h:()=>ofMediaCard(x)}))].sort((a,b)=>b.ts-a.ts);
  setTimeout(()=>document.querySelectorAll(".ofm-t img[data-mid]:not([data-hyd])").forEach(async el=>{ el.dataset.hyd="1"; const u=await mediaSrc(el.dataset.mid); if(u) el.src=u; }),0);
  return L.map(o=>o.h()).join(""); }
function ofOpen(id){ const all=coPosts(), x=all.find(y=>y.id===id); if(!x) return; const s=x.src, pr=s.pr||{}, gid=s.gid, cap=coCap(s.co,x.k,s,x), imgs=x.imgs||[];
  let med="";
  if(x.vid) med=`<div class="ofd-v"><video playsinline controls preload="metadata" data-vmid="${esc(x.vid.mid)}"${x.vid.thumb?` data-pmid="${esc(x.vid.thumb)}"`:""}></video></div>`;
  else if(x.k==="sched"||x.k==="trk") med=`<div class="ofd-ph">${coBodyOf(x)}</div>`;
  else if(imgs.length) med=`<div class="ofd-ph">${imgs.map(u=>`<button class="cp-img" data-a="cpPh" data-v="${esc(u)}"><img src="${esc(u)}" alt="" loading="lazy"></button>`).join("")}</div>`;
  const info=`<div class="ofd-i">${albName(s)?`<span class="ofd-tag">${esc(String(albName(s)).replace(/&lt;/g,"<").replace(/&gt;/g,">"))}</span>`:""}<h2>${esc(albTitle(x))}</h2><span class="ofm-h"><button class="ofm-go" data-a="ofGrp" data-v="${esc(gid)}">${ofAv(gid)}</button><span><button class="ofm-go" data-a="ofGrp" data-v="${esc(gid)}">${ofAcct(gid)}</button></span></span><small class="ofd-d">${ofWhen(x.ts)}</small>${cap&&cap.b?`<p class="ofd-x">${capRich(cap.b)}</p>`:""}${relExtra(x)}</div>`;
  const rel=all.filter(y=>y.src&&y.src.id===s.id&&y.id!==id&&albThumb(y)), now=Date.now();
  const relH=rel.length?`<h3 class="ofd-rh">相關媒體</h3><div class="ofd-rl">${rel.map(y=>`<button class="ofd-r" data-a="ofOpen" data-v="${esc(y.id)}"><span class="alb-t">${albThumb(y).h}</span><b>${esc(albTitle(y))}</b>${now-y.ts<864e5?`<em>NEW</em>`:""}</button>`).join("")}</div>`:"";
  setLayer(`<div class="ofd" role="dialog" aria-label="${esc(albTitle(x))}"><header class="ofd-top"><button class="ofd-cl" data-a="tCloseLayer" aria-label="關閉">${XI}</button></header>
    <div class="ofd-body">${x.vid?med+info:info+med}${relH}</div>
    ${ofBar(id)}</div>`,"ofd");
  setTimeout(()=>{ const L=document.querySelector(".ofd"); if(!L) return; L.querySelectorAll("video[data-vmid]").forEach(async v=>{ const u=await mediaSrc(v.dataset.vmid); if(u) v.src=u; if(v.dataset.pmid){ const pu=await mediaSrc(v.dataset.pmid); if(pu) v.poster=pu; } });
    L.querySelectorAll(".alb-t img[data-mid]").forEach(async el=>{ const u=await mediaSrc(el.dataset.mid); if(u) el.src=u; }); },0); }
/* 打歌名單：歌名只寫「出道」的佔位歌（同一團已經有真正的出道曲）刪掉，一位紀錄移到真正那首 */
function songPhFix(){ try{ const ms=getMShow(), all=[...(ms.songs||[]),...(ms.ended||[])], ph=x=>/^\s*出道\s*$/.test(String(x.title||"")), bad=all.filter(ph); if(!bad.length) return;
  let ch=false; bad.forEach(b=>{ const same=all.filter(x=>x.gid===b.gid&&!ph(x)), keep=same.find(x=>x.debut&&x.mv)||same.find(x=>x.debut)||same.sort((a,c)=>songRel(a)-songRel(c))[0]; if(!keep) return;
    Object.values(ms.wins||{}).forEach(w=>{ if(w) Object.keys(w).forEach(k=>{ if(w[k]===b.id) w[k]=keep.id; }); });
    ms.songs=(ms.songs||[]).filter(x=>x.id!==b.id); ms.ended=(ms.ended||[]).filter(x=>x.id!==b.id); ch=true; });
  if(ch) S.set(K.mshow,ms); }catch(e){} }
setInterval(songPhFix,15e3); setTimeout(songPhFix,4e3);
/* 之前一直重複跳的「《出道》出道 MV 公開」通知：清掉 */
function ntPhClean(){ try{ const re=/《出道》出道 MV 公開/; [K.notifs,K.feed].forEach(k=>{ const L=S.get(k,[])||[], L2=L.filter(n=>!re.test(String(n&&n.text||""))); if(L2.length!==L.length) S.set(k,L2); }); }catch(e){} }
setInterval(ntPhClean,20e3); setTimeout(ntPhClean,3e3);
/* 影片只在上傳的人手機裡、雲端沒有（之前沒傳成功）：上傳的人打開 App 時自動補傳，大家才看得到 */
/* 影片封面：畫面上任何還沒載入的 data-mid 縮圖都自動載入（不靠每一頁自己記得叫） */
{ const hyd=root=>{ try{ root.querySelectorAll(".cp-vid img[data-mid]:not([data-hyd]),.alb-t img[data-mid]:not([data-hyd]),.ofm-t img[data-mid]:not([data-hyd]),.ofd-r img[data-mid]:not([data-hyd])").forEach(async el=>{ el.dataset.hyd="1"; const u=await mediaSrc(el.dataset.mid)||await (async()=>{ const b=await MDB.get(el.dataset.mid); return b?URL.createObjectURL(b):null; })(); if(u) el.src=u; }); }catch(e){} };
  let qd=0; new MutationObserver(()=>{ if(qd) return; qd=1; requestAnimationFrame(()=>{ qd=0; hyd(document); }); }).observe(document.body,{childList:true,subtree:true}); }
{ let tT=0; const SCR=new WeakMap(); ["touchstart","touchmove","wheel","pointerdown","keydown"].forEach(k=>document.addEventListener(k,()=>{ tT=Date.now(); },{passive:true,capture:true}));
  document.addEventListener("scroll",e=>{ const el=e.target; if(!(el instanceof Element)||!el.matches(".tiei-body,.tst-b,.ofd-body,.sn-cl")) return; const prev=SCR.get(el)||0, cur=el.scrollTop;
    if(cur<4&&prev>200&&Date.now()-tT>900){ el.scrollTop=prev; return; } SCR.set(el,cur); },true); }
/* 粉絲貼文加照片：縮小後放雲端（不行就先存在資料裡） */
document.addEventListener("change",async e=>{ const t=e.target; if(!t||t.id!=="cwFile") return; const fs=[...(t.files||[])].slice(0,10-(ui.cwImgs||[]).length); t.value=""; if(!fs.length) return; toast("上傳中…");
  for(const f of fs){ try{ const b=await shrinkImg(f,1080); if(!b) continue; let u=HB_ON?await hbImgUrl("fp_"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)+".jpg",b):null; if(!u) u=await new Promise(res=>{ const rd=new FileReader(); rd.onload=()=>res(rd.result); rd.readAsDataURL(b); }); (ui.cwImgs=ui.cwImgs||[]).push(u); }catch(err){} }
  const tx=(document.getElementById("cwTxt")||{}).value||""; render(); const ta=document.getElementById("cwTxt"); if(ta) ta.value=tx; const bt=document.getElementById("cwOk"); if(bt) bt.disabled=!tx.trim()&&!(ui.cwImgs||[]).length; });
/* =========================================================
   試玩訊息（/try 頁面的訪客傳給示範偶像 LUMI 的 TIE）
   ・每位訪客一份：daisuki_try_<匿名帳號>＝{nick,msgs:[{id,from:"fan"|"idol",text,ts,by,byName}]}
   ・四位管理員都看得到，誰有空誰回；回覆會以 LUMI 的身分出現在訪客那邊
   ========================================================= */
const TRY_IDOL="LUMI";
/* 訪客訊息放在媒體伺服器（haechu-media Worker 的 /try），管理員登入後每 20 秒抓一次 */
let TRYW=null, TRYT=0;
async function tryFetch(force){ try{ if(!HB_ON||!HB.tok||!MEDIA_URL||!isAdminAcct()) return; if(Date.now()-TRYT<(force?4000:20000)) return; TRYT=Date.now();
  const r=await fetch(MEDIA_URL+"/try",{headers:{Authorization:"Bearer "+HB.tok},cache:"no-store"}); if(!r.ok) return; const L=await r.json(); const before=JSON.stringify(TRYW); TRYW=Array.isArray(L)?L:[]; if(JSON.stringify(TRYW)!==before){ hbSoon(); if(ui.tryOpenK&&document.getElementById("tryBody")) tryChat(ui.tryOpenK); } }catch(e){} }
setInterval(()=>{ if(!document.hidden) tryFetch(); },20000); setTimeout(()=>tryFetch(true),4000);
function tryConvs(){ const out=new Map();
  (TRYW||[]).forEach(v=>{ if(v&&v.id&&Array.isArray(v.msgs)&&v.msgs.length) out.set("w:"+v.id,v); });
  const ks=new Set(); try{ Object.keys(localStorage).forEach(k=>{ if(k.startsWith("daisuki_try_")) ks.add(k); }); }catch(e){} Object.keys(mem||{}).forEach(k=>{ if(k.startsWith("daisuki_try_")) ks.add(k); }); try{ Object.keys(HB.ver||{}).forEach(k=>{ if(k.startsWith("daisuki_try_")) ks.add(k); }); }catch(e){}
  ks.forEach(k=>{ const v=S.get(k,null); if(v&&Array.isArray(v.msgs)&&v.msgs.length) out.set(k,v); });
  return [...out.entries()].map(([k,v])=>{ const L=v.msgs.slice().sort((a,b)=>a.ts-b.ts), last=L[L.length-1]; return {k,nick:v.nick||"訪客",msgs:L,last,wait:last.from==="fan"}; }).sort((a,b)=>b.last.ts-a.last.ts); }
const tryGet=k=>{ if(k.startsWith("w:")){ const id=k.slice(2); return (TRYW||[]).find(v=>v.id===id)||null; } return S.get(k,null); };
const tryUnread=()=>{ try{ return isAdminAcct()?tryConvs().filter(c=>c.wait).length:0; }catch(e){ return 0; } };
function viewTryInbox(){ const C=tryConvs();
  return `<main class="page"><p class="reach" style="margin:4px 2px 12px">訪客在試玩頁（${esc(location.origin+location.pathname.replace(/[^/]*$/,""))}try/）傳給 ${TRY_IDOL} 的訊息。四位管理員都看得到，你的回覆會以 ${TRY_IDOL} 的身分出現。</p>
    ${C.length?`<section class="card">${C.map(c=>`<button class="list-btn try-row" data-a="tryOpen" data-v="${esc(c.k)}"><span class="try-rl"><b>${esc(c.nick)}</b><small>${c.last.from==="fan"?"":"你們："}${esc(String(c.last.text).slice(0,40))}・${ago(c.last.ts)}</small></span><span class="r">${c.wait?`<em class="t-cnt">待回覆</em>`:"已回覆"}</span></button>`).join("")}</section>`:`<section class="card uni-empty">還沒有訪客傳訊息</section>`}</main>`; }
/* 管理員看試玩對話：跟 App 裡藝人端的 TIE 聊天室一模一樣（不含側邊抽屜）：訪客＝FROM FAN 在左邊，管理員以 LUMI 的身分＝紫色泡泡在右邊 */
function tryChat(k){ const v=tryGet(k); if(!v) return; ui.tryOpenK=k; const L=(v.msgs||[]).slice().sort((a,b)=>a.ts-b.ts), nick=v.nick||"訪客";
  let lastDay=""; const body=L.map(m=>{ const d=dayLabel(m.ts); let sep=""; if(d!==lastDay){ sep=`<div class="t-day"><span>${d}</span></div>`; lastDay=d; }
    if(m.from==="idol") return sep+`<div class="t-me"><div class="t-meta">${m.byName?`<em class="try-by">${esc(m.byName)}</em>`:""}<span>${timeHM(m.ts)}</span></div><div class="t-mecol"><div class="t-b me">${esc(m.text)}</div></div></div>`;
    return sep+`<div class="t-art"><span class="fan-av">${mascot("try:"+(v.id||k))}</span>
      <div class="t-art-c"><div class="t-art-n"><span class="from-fan">FROM FAN</span><b class="a-nick">${esc(nick)}</b><span class="try-tag">試玩</span></div>
      <div class="t-bw"><div class="t-b">${esc(m.text)}</div><span class="t-meta2"><span class="t-time">${timeHM(m.ts)}</span></span></div></div></div>`; }).join("");
  const wait=L.length&&L[L.length-1].from==="fan";
  setLayer(`<div class="tiei try-tie">${thChatBg("t-bgl")||`<div class="t-bgl t-default"></div>`}<header class="t-rh t-rh-art"><div class="t-rh-row"><button class="t-ib" data-a="tCloseLayer" aria-label="返回">${TI.back}</button><h3>${esc(TRY_IDOL)}</h3><div class="t-rh-r"></div></div></header>
    <main class="t-msgs" id="tryBody">${body||`<p class="t-none">還沒有訊息</p>`}<p class="t-wait">${wait?`${esc(nick)} 正在等你的訊息`:`以 ${esc(TRY_IDOL)} 的身分回覆 ${esc(nick)}`}</p><div id="tryEnd"></div></main>
    <form class="t-foot try-f" data-k="${esc(k)}"><div class="t-inp"><textarea rows="1" class="ag" id="tryIn" maxlength="300" autocomplete="off" placeholder="以 ${esc(TRY_IDOL)} 的身分回覆 ${esc(nick)}" aria-label="輸入訊息"></textarea></div><button class="t-send" id="trySend" type="submit" aria-label="送出">${TI.send}</button></form></div>`,"try");
  setTimeout(()=>{ const b=layer.querySelector(".try-tie"); if(b) b.scrollTop=b.scrollHeight; },30); }
/* 從手機推播點進來：直接到那則通知的頁面（跟在 App 的通知頁點它一模一樣）
   ・sw.js 收到點擊：App 開著 → 傳訊息過來；App 沒開 → 打開 App 時網址帶 ?nid=（通知代號） */
let PUSH_OPEN=null;
function pushOpenRun(){ const o=PUSH_OPEN; if(!o) return true; if(!session()||ui.resuming||ui.authBusy) return false; if(HB_ON&&!HB.pulled) return false;
  if(o.open&&String(o.open).startsWith("try:")){ if(!isAdminAcct()){ PUSH_OPEN=null; return true; } const k="w:"+String(o.open).slice(4); if(!tryGet(k)){ tryFetch(true); return false; } PUSH_OPEN=null; layer.innerHTML=""; tryChat(k); return true; }
  const n=o.id&&S.get(K.notifs,[]).find(x=>x.id===o.id); if(!n) return false;
  PUSH_OPEN=null; layer.innerHTML=""; const w=document.createElement("div"); w.hidden=true; w.innerHTML=`<button type="button" ${nfAttrs(n)}></button>`; document.body.appendChild(w); w.firstElementChild.click(); w.remove(); return true; }
function pushOpen(o){ if(!o||!(o.id||o.open||o.path)) return; PUSH_OPEN={...o,t0:Date.now()}; let k=0;
  const tick=()=>{ if(!PUSH_OPEN||pushOpenRun()) return; if(Date.now()-PUSH_OPEN.t0>15000){ const p=PUSH_OPEN.path; PUSH_OPEN=null; if(p&&/^#\//.test(p)&&session()) navTo(p); return; }
    if(++k%4===0){ try{ if(HB_ON&&HB.tok) hbSoon(); }catch(e){} } setTimeout(tick,700); }; tick(); }
try{ if("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message",e=>{ const d=e.data&&e.data.hcOpen; if(d) pushOpen(d); }); }catch(e){}
(function(){ const q=new URLSearchParams(location.search), id=q.get("nid"), op=q.get("nop"), p=q.get("np"); if(!(id||op||p)) return;
  try{ history.replaceState(history.state,"",location.pathname+location.hash); }catch(e){} setTimeout(()=>pushOpen({id,open:op,path:p}),0); })();
document.addEventListener("input",e=>{ if(e.target.id!=="tryIn") return; const b=document.getElementById("trySend"); if(b) b.classList.toggle("on",!!e.target.value.trim()); e.target.style.height="auto"; e.target.style.height=Math.min(110,e.target.scrollHeight)+"px"; });
document.addEventListener("keydown",e=>{ if(e.target.id==="tryIn"&&e.key==="Enter"&&!e.shiftKey&&!e.isComposing){ e.preventDefault(); const f=e.target.closest("form"); if(f) f.requestSubmit(); } });
document.addEventListener("submit",e=>{ const f=e.target.closest&&e.target.closest(".try-f"); if(!f) return; e.preventDefault(); const i=f.querySelector("textarea,input"), tx=(i.value||"").trim(); if(!tx) return; const k=f.dataset.k;
  if(k.startsWith("w:")){ const id=k.slice(2); i.value=""; i.disabled=true;
    fetch(MEDIA_URL+"/try/"+id+"?a=reply",{method:"POST",headers:{Authorization:"Bearer "+HB.tok,"Content-Type":"application/json"},body:JSON.stringify({text:tx})}).then(r=>r.ok?r.json():Promise.reject(r.status)).then(v=>{ TRYW=(TRYW||[]).filter(x=>x.id!==id).concat([{id,...v}]); hbSoon(); tryChat(k); }).catch(er=>{ i.disabled=false; i.value=tx; toast(er===404||er===405?"媒體伺服器還沒更新，請先重新部署 haechu-media":"沒有送出，請再試一次"); }); return; }
  const v=S.get(k,null)||{msgs:[]};
  const me=myEmail(), nm=(ACCOUNTS[me]||{}).name||(session()||{}).name||"管理員"; S.set(k,{...v,msgs:[...(v.msgs||[]),{id:"i"+Date.now().toString(36),from:"idol",text:tx,ts:Date.now(),by:me,byName:nm}]}); try{ hbSoon(); }catch(x){} tryChat(k); },true);
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t) return; if(t.dataset.a==="tryOpen"){ e.stopImmediatePropagation(); tryChat(t.dataset.v); } },true);
const MHEAL={};
async function mediaHeal(){ try{ if(!HB_ON||!HB.tok||sbxOn()||!MEDIA_URL) return; const ids=new Set();
  (S.get(K.vods,[])||[]).forEach(v=>{ if(v&&v.mid) ids.add(v.mid); if(v&&v.thumb) ids.add(v.thumb); });
  (S.get(K.debut,[])||[]).forEach(x=>{ [x.mv,x.mvt].forEach(m=>{ if(m&&m.mid) ids.add(m.mid); }); });
  try{ (getCbr()||[]).forEach(x=>{ [x.mv,x.mvt].forEach(m=>{ if(m&&m.mid) ids.add(m.mid); }); }); }catch(e){}
  (S.get(K.posts,[])||[]).forEach(p=>(p.media||[]).forEach(m=>{ if(m.mid) ids.add(m.mid); if(m.thumb) ids.add(m.thumb); }));   /* 貼文的照片／影片也一起檢查 */
  try{ (snDB().posts||[]).forEach(p=>(p.media||[]).forEach(m=>{ if(m.mid) ids.add(m.mid); if(m.poster) ids.add(m.poster); })); }catch(e){}
  for(const id of ids){ if(MHEAL[id]) continue; MHEAL[id]=1; if(!(await idbHas(id))&&!memBlobs[id]) continue;
    let st=0; try{ st=(await fetch(MEDIA_URL+"/media/"+encodeURIComponent(id),{method:"HEAD"})).status; }catch(e){ continue; }
    if(st!==404) continue; try{ const r2=await fetch(HB_URL+"/storage/v1/object/public/media/"+encodeURIComponent(id),{method:"HEAD"}); if(r2.ok) continue; }catch(e){}
    const b=await MDB.get(id); if(b){ const ok=await hbUpload(id,b); if(ok) toast("已補傳影片，其他人現在也看得到了"); } } }catch(e){} }
setTimeout(mediaHeal,15e3); setInterval(mediaHeal,3*60e3);
/* 團社群 Feed：只有藝人貼文（官方宣傳在 Media 的專輯分區） */
function grpArtMix(gid,art,n){ const L=art.map(p=>({ts:p.ts||0,h:()=>postCard(p)})).sort((a,b)=>b.ts-a.ts); setTimeout(()=>document.querySelectorAll(".cp-vid img[data-mid]:not([data-hyd])").forEach(async el=>{ el.dataset.hyd="1"; const u=await mediaSrc(el.dataset.mid); if(u) el.src=u; }),0); return (n?L.slice(0,n):L).map(o=>o.h()).join(""); }
/* 動態：藝人動態和公司官方貼文照時間排在一起 */

/* 置頂大卡用：最近 7 天的官方貼文（有照片的） */
const coPinList=()=>{ const now=Date.now(); return coFeed("",false).filter(x=>x.k!=="ann"&&now-x.ts<7*864e5).map(x=>x.k==="news"?{id:x.id,ts:x.ts,text:`${coInfo(x.co).n}｜${x.news.title}`,img:x.news.img||""}:x.k==="note"?{id:x.id,ts:x.ts,text:`${coInfo(x.co).n}｜${x.note.title}`,img:""}:({id:x.id,ts:x.ts,text:`${coInfo(x.src.co).n}｜${coCap(x.src.co,x.k,x.src,x).t}`,img:(x.imgs||[])[0]||(x.k==="sched"&&(x.src.pr||{}).sched)||(x.k==="trk"&&(x.src.pr||{}).trkImg)||x.src.teaser||"",co:x.src.co})); };

/* ---------- 申請表裡的欄位 ---------- */
/* 不是單曲／數位單曲 → 要填曲目表 */
const needsTrk=rt=>!!rt&&!["單曲","數位單曲"].includes(rt);
const promoCheck=f=>needsTrk(f.rtype)&&!String((f.pr||{}).trk||"").split("\n").some(x=>x.trim())?"請填曲目表（一行一首）":"";
/* 曲目表：選了發行型態就接在下面（單曲、數位單曲不用填） */
function promoTrk(f){ const pr=f.pr||(f.pr={time:"18:00",cv:[],vk:"",trk:""}); const img=(u,ex)=>`<button class="db-slot t sm" data-a="prImg" ${ex}>${u?`<img src="${esc(u)}" alt="">`:`<b>＋</b>`}</button>`;
  return `${needsTrk(f.rtype)?`<span class="fs-f-lab">曲目表</span><textarea id="prTrk" class="a-nick-in pr-trk" rows="4" placeholder="輸入文字">${esc(pr.trk||"")}</textarea><div class="db-up4 one">${img(pr.trkP||pr.trkImg,'data-k="trk"',"")}</div>`:""}`; }
const prImgSlot=(u,ex,lab)=>`<button class="db-slot t sm" data-a="prImg" ${ex}>${u?`<img src="${esc(u)}" alt="">`:`<b>＋</b>`}${lab?`<small>${lab}</small>`:""}</button>`;
const prOf=f=>{ const pr=f.pr||(f.pr={time:"18:00",cv:[],vk:"",trk:""}); pr.cv=pr.cv||[]; return pr; };
const prTimeF=f=>`<input id="prTime" class="a-nick-in" type="time" value="${esc(prOf(f).time||"18:00")}">`;
const prSchedF=f=>{ const pr=prOf(f); return `<div class="db-up4 one">${prImgSlot(pr.schedP||pr.sched,'data-k="sched"',"")}</div>`; };
const prCvF=f=>{ const pr=prOf(f); return `${pr.cv.map((v,i)=>`<div class="pr-cv"><div class="pr-cvh"><input id="prCv${i}" class="a-nick-in" maxlength="20" placeholder="版本名稱（例：Film、Digital）" value="${esc(v.n||"")}"><button class="pr-x" data-a="prCvDel" data-i="${i}" aria-label="刪除這個版本">${XI}</button></div><div class="db-up4">${[0,1,2,3].map(j=>prImgSlot((v.phP||[])[j]||(v.ph||[])[j],`data-k="cv" data-i="${i}" data-j="${j}"`,"")).join("")}</div></div>`).join("")}${pr.cv.length<4?`<button class="btn btn-soft btn-sm pr-add" data-a="prCvAdd">＋ 新增版本</button>`:""}`; };
const prVidF=f=>{ const pr=prOf(f); return `<div class="chips"><button class="chip ${pr.vk==="medley"?"on":""}" data-a="prVk" data-v="medley">Highlight Medley</button><button class="chip ${pr.vk==="film"?"on":""}" data-a="prVk" data-v="film">概念影片</button></div>
    ${pr.vk?`<div class="db-up"><button class="db-slot v" data-a="prVid" aria-label="${pr.vk==="film"?"概念影片":"Highlight Medley"}">${pr.vid?(pr.vidP?`<img src="${esc(pr.vidP)}" alt=""><i>▶</i>`:`<i>▶</i>`):`<b>＋</b>`}<small>${pr.vk==="film"?"概念影片":"Highlight Medley"}</small></button></div>`:""}`; };

function promoKeep(f){ const pr=f.pr||(f.pr={time:"18:00",cv:[],vk:"",trk:""}); const v=id=>{ const e=document.getElementById(id); return e?e.value:null; }; const tm=v("prTime"), tk=v("prTrk"); if(tm!=null) pr.time=tm||"18:00"; if(tk!=null) pr.trk=tk; PR_EX.forEach(k=>{ const x=v("prX_"+k); if(x!=null) pr[k]=x; }); (pr.cv||[]).forEach((c,i)=>{ const n=v("prCv"+i); if(n!=null) c.n=n; }); }
/* 存進申請：預覽用的 blob 網址不存 */
const PR_EX=["album","desc","credit","lyr","sc","fan","intro","t2"];
const promoClean=pr=>pr?{...(pr.fy&&Object.keys(pr.fy).length?{fy:Object.fromEntries(Object.entries(pr.fy).filter(([k,v])=>v&&v.m).map(([k,v])=>{ const r={...v}; delete r._pv; return [k,r]; }))}:{}),...(pr.mv2&&pr.mv2.mid&&String(pr.t2||"").trim()?{mv2:pr.mv2}:{}),...Object.fromEntries(PR_EX.filter(k=>String(pr[k]||"").trim()).map(k=>[k,String(pr[k]).trim()])),time:pr.time||"18:00",sched:pr.sched||"",...(pr.cov?{cov:pr.cov}:{}),trk:pr.trk||"",trkImg:pr.trkImg||"",cv:(pr.cv||[]).map(c=>({n:c.n||"",ph:(c.ph||[]).filter(Boolean)})).filter(c=>c.ph.length||c.n),vk:pr.vid?pr.vk:"",vid:pr.vk&&pr.vid?pr.vid:null}:null;
const promoLoad=pr=>pr?{...JSON.parse(JSON.stringify(pr)),cv:(pr.cv||[]).map(c=>({n:c.n,ph:[...(c.ph||[])]}))}:{time:"18:00",cv:[],vk:"",trk:""};
async function prImgUp(file){ const b=await shrinkImg(file,1600), prev=URL.createObjectURL(b);
  const url=(HB_ON&&await hbImgUrl("promo_"+Date.now().toString(36)+".jpg",b))||await new Promise(res=>{ const rd=new FileReader(); rd.onload=()=>res(rd.result); rd.readAsDataURL(b); }); return {url,prev}; }
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a;
  if(a==="cpPh"){ e.stopImmediatePropagation(); setLayer(`<div class="ph-view" data-a="tCloseLayer" role="dialog" aria-label="照片"><button class="ph-x" data-a="tCloseLayer" aria-label="關閉">${XI}</button><img src="${esc(t.dataset.v)}" alt=""></div>`,"photo"); return; }
  if(a==="cpVid"){ e.stopImmediatePropagation(); playVideo(t.dataset.v); return; }
  if(a==="cmAlbP"||a==="ofOpen"){ e.stopImmediatePropagation(); ofOpen(t.dataset.v); return; }
  if(a==="ofLk"){ e.stopImmediatePropagation(); ofLike(t.dataset.v); return; }
  if(a==="ofBm"){ e.stopImmediatePropagation(); ofBmT(t.dataset.v); return; }
  if(a==="ofGrp"){ e.stopImmediatePropagation(); layer.innerHTML=""; navTo(grpHash(t.dataset.v,"home")); window.scrollTo(0,0); return; }
  if(!/^pr[A-Z]/.test(a)) return; e.stopImmediatePropagation(); dbKeep(); const f=ui.dbF; if(!f) return; const pr=f.pr||(f.pr=promoLoad(null));
  if(a==="prCvAdd"){ pr.cv.push({n:"",ph:[],phP:[]}); dbReform(); return; }
  if(a==="prCvDel"){ pr.cv.splice(+t.dataset.i,1); dbReform(); return; }
  if(a==="prVk"){ if(pr.vk!==t.dataset.v){ pr.vk=t.dataset.v; pr.vid=null; pr.vidP=""; } dbReform(); return; }
  if(f.busy) return;
  if(a==="prImg"){ const inp=document.createElement("input"); inp.type="file"; inp.accept="image/*";
    inp.onchange=async()=>{ const f0=inp.files&&inp.files[0]; if(!f0) return; f.busy="上傳中…"; dbReform();
      try{ const {url,prev}=await prImgUp(f0), k=t.dataset.k;
        if(k==="sched"){ pr.sched=url; pr.schedP=prev; } else if(k==="trk"){ pr.trkImg=url; pr.trkP=prev; } else if(k==="cov"){ pr.cov=url; pr.covP=prev; }
        else { const c=pr.cv[+t.dataset.i]; if(c){ const j=+t.dataset.j; c.ph=c.ph||[]; c.phP=c.phP||[]; c.ph[j]=url; c.phP[j]=prev; } }
        f.busy=""; dbReform(); }catch(err){ f.busy=""; dbReform(); toast("這張圖讀不出來"); } }; pickClick(inp); return; }
  if(a==="prVid"){ const inp=document.createElement("input"); inp.type="file"; inp.accept="video/*";
    inp.onchange=async()=>{ const file=inp.files&&inp.files[0]; if(!file) return; f.busy="影片處理中…"; dbReform();
      try{ const id="vv"+Date.now().toString(36), th=await videoThumb(file); let thumb=null;
        if(th&&th.blob){ thumb=id+"_t"; await MDB.put(thumb,th.blob,true); if(!await hbUpload(thumb,th.blob)) thumb=null; }
        hbUploadBig.on=p=>{ f.busy=`影片上傳中… ${p}%`; const el=document.querySelector(".db-busy"); if(el) el.textContent=f.busy; }; f.busy="影片上傳中…"; dbReform();
        const ok=await hbUpload(id,file); hbUploadBig.on=null; if(!ok){ f.busy=""; dbReform(); return; } memBlobs[id]=file;
        pr.vid={mid:id,thumb,dur:th&&th.dur||0}; pr.vidP=th&&th.blob?URL.createObjectURL(th.blob):""; f.busy=""; dbReform(); }catch(err){ f.busy=""; dbReform(); toast("這部影片讀不出來，換一部試試"); } }; pickClick(inp); return; }
},true);

/* ---------- 專輯跟著發行：發行前 SHOP 看不到 ---------- */
const relSrcOf=a=>a&&a.rel?promoSrcs().find(s=>s.id===a.rel):null;
const albumOn=a=>{ if(!a||!a.rel) return true; const s=relSrcOf(a); if(!s) return true; const r=promoPlan(s).find(x=>x.k==="rel"); return Date.now()>=(r?r.ts:s.day); };
function aeRelHtml(a){ const L=promoSrcs().filter(s=>s.gid===a.gid&&(s.day>Date.now()||s.id===a.rel)); if(!L.length&&!a.rel) return "";
  return `<section class="ae-v"><div class="ae-vh"><b>上架時間</b></div><div class="chips"><button class="chip ${a.rel?"":"on"}" data-a="aeRel" data-v="">現在就上架</button>${L.map(s=>`<button class="chip ${a.rel===s.id?"on":""}" data-a="aeRel" data-v="${s.id}">跟著${s.k==="db"?"出道":"回歸"}・${mdTxt(s.day)}</button>`).join("")}</div></section>`; }
document.addEventListener("click",e=>{ const t=e.target.closest('[data-a="aeRel"]'); if(!t) return; e.stopImmediatePropagation(); const a=aeA(); if(!a) return; const L=S.get(K.albums2,[]), x=L.find(y=>y.id===a.id); if(!x) return; if(t.dataset.v) x.rel=t.dataset.v; else delete x.rel; S.set(K.albums2,L); a.rel=x.rel; layer.querySelectorAll('[data-a="aeRel"]').forEach(b=>b.classList.toggle("on",(b.dataset.v||"")===(x.rel||""))); toast(x.rel?"發行那一刻才會上架":"已上架"); },true);

/* ---------- 公司官方帳號：新聞（晚 10 分鐘轉發）、人事公告、公司頁 ---------- */
const CO_NOTE="daisuki_co_notice";   /* 管理員發的人事公告：{id,co,gid,mid,kind,title,body,ts} */
const coNotes=()=>(S.get(CO_NOTE,[])||[]).filter(x=>x&&x.id);
const coOfGid=gid=>(groupOf(gid)||{}).co||"";
const coHead=(co,ts)=>!co?`<div class="post-head">${coAv("")}<div class="who"><b>${esc(APP_NAME)} ${I.verified} <span class="badge">官方</span></b><span>${ymdhm(ts)}</span></div></div>`:`<div class="post-head"><button class="co-go" data-a="coPage" data-v="${esc(co)}" aria-label="${esc(coInfo(co).n)}">${coAv(co)}</button><button class="who co-go" data-a="coPage" data-v="${esc(co)}"><b>${esc(coInfo(co).n)} ${I.verified} <span class="badge">官方</span></b><span>${ymdhm(ts)}</span></button></div>`;
function coNewsPosts(){ const now=Date.now(), H=S.get(K.newsHide,{})||{}, E=S.get(K.newsEd,{})||{}; let N=[]; try{ N=newsAuto(true); }catch(e){}
  return N.filter(n=>n.co&&n.tag!=="hr"&&!H[n.id]&&n.ts0<=now).map(n=>{ const e=E[n.id], nn=e?{...n,...e}:n; return {k:"news",id:"cn_"+n.id,ts:n.ts0,news:nn,co:n.co,out:n.ts<=now}; }); }
const coNotePosts=()=>coNotes().filter(x=>x.ts<=Date.now()).map(x=>({k:"note",id:"cnt_"+x.id,ts:x.ts,note:x,co:x.co}));
const coOfPost=x=>x.co||(x.src&&x.src.co)||"";
/* HAECHU 的出道／回歸預告公告：算是那間公司發的 */
function annCo(a){ const t=String(a.text||""); if(a.pre==="db"||/出道預告｜/.test(t)){ const x=getDebut().find(y=>(a.ref&&y.id===a.ref)||y.annId===a.id)||getDebut().find(y=>t.includes(`「${y.name}」`)); return x?(coOfGid(x.gid)||x.co||""):""; }
  if(a.pre==="cb"||/回歸預告｜/.test(t)){ const P=getMShow().pre||[], p=P.find(y=>y.id===a.ref)||P.find(y=>t.includes(`《${y.title}》`)), c=getCbr().find(y=>y.id===(p&&p.req)); return p?coOfGid(p.gid):c?coOfGid(c.gid):""; } return ""; }
/* 預告公告是哪一筆出道／回歸 */
function annSrc(a){ const L=promoSrcs(true), t=String(a.text||""); if(a.pre==="db"||/出道預告｜/.test(t)){ const x=getDebut().find(y=>(a.ref&&y.id===a.ref)||y.annId===a.id)||getDebut().find(y=>t.includes(`「${y.name}」`)); return x?L.find(s=>s.id===x.id)||null:null; }
  const P=getMShow().pre||[], p=P.find(y=>y.id===a.ref)||P.find(y=>t.includes(`《${y.title}》`)); return p?L.find(s=>s.id===p.req)||null:null; }
const coAnnPosts=()=>getAnns().map(a=>({k:"ann",id:"ca_"+a.id,ts:a.ts,ann:a,co:annCo(a)})).filter(x=>x.co);
/* 全部官方貼文（all＝公司頁要看全部歷史） */
function coFeed(co,all){ const now=Date.now(); return [...promoSrcs(all).flatMap(promoPlan).filter(x=>x.ts<=now),...coNewsPosts(),...coNotePosts(),...coAnnPosts()].filter(x=>coOfPost(x)&&(!co||coOfPost(x)===co)).sort((a,b)=>b.ts-a.ts); }
const newsBase=()=>route().role==="artist"?"#/artist?tab=foc&p=news":"#/fan/core?p=news";
function coNewsCard(x){ const n=x.news, p=String(n.body||"").split(/\n+/).map(s=>s.trim()).filter(Boolean)[0]||"";
  return `<article class="card post cp" id="post-${x.id}">${coHead(x.co,x.ts)}<p class="cp-t">${esc(n.title)}</p>${p?`<p class="cp-x cp-clip">${esc(p)}</p>`:""}${n.img?(x.out?`<button class="cp-img cp-nimg" data-a="newsOpen" data-v="${esc(n.id)}" data-b="${newsBase()}"><img src="${esc(n.img)}" alt="" loading="lazy"></button>`:`<span class="cp-img cp-nimg"><img src="${esc(n.img)}" alt="" loading="lazy"></span>`):""}${x.out?`<button class="cp-more" data-a="newsOpen" data-v="${esc(n.id)}" data-b="${newsBase()}">閱讀全文 ›</button>`:""}</article>`; }
function coNoteCard(x){ const n=x.note;
  return `<article class="card post cp" id="post-${x.id}">${coHead(x.co,x.ts)}<p class="cp-t">${esc(n.title)}</p><p class="cp-x cp-body">${esc(n.body||"")}</p></article>`; }
/* LOVE 動態最上面：公司官方公告（置頂，左右滑） */
/* LOVE 動態置頂：只放最新的那一則（當天發什麼就是什麼）；排程表只在公司頁看 */
function coPinFeed(){ const now=Date.now(), live=new Set(annLive().map(a=>a.id)), PH=S.get(PIN_HIDE,{})||{}, x=coFeed("",false).filter(y=>!PH[y.id]&&(y.k==="ann"||y.k==="news"||y.k==="note")&&(y.k==="ann"?live.has(y.ann.id):now-y.ts<7*864e5)).sort((a,b)=>b.ts-a.ts)[0];
  return x?`<h2 class="mf-h">公司官方公告</h2><div class="cp-one-w">${coPostCard(x)}</div>`:""; }
/* 公司頁：歷來公告＋旗下藝人（只列 App 裡的團） */
function openCoPage(co,tab){ const c=coInfo(co), G=GROUPS.filter(g=>g.co===co&&!getDebut().some(x=>x.gid===g.id&&x.status==="pre")), t=tab||"ann";
  const ann=coFeed(co,true), fan=route().role==="fan", artist=route().role==="artist", open=ui.coOpen||{};
  const ic=(h,svg,l)=>h?`<button class="copg-ib" data-a="coLink" data-v="${esc(h)}" aria-label="${l}">${svg}</button>`:"";
  const snsH=m=>(fan?"#/fan/sns":artist?"#/artist/sns":"")&&`${fan?"#/fan/sns":"#/artist/sns"}?p=profile&id=${encodeURIComponent("m:"+m)}`, wk=id=>wkHash(id);
  const row=(m,solo,gid)=>`<div class="copg-r"><span class="av sm" style="background:${grad(MEMBERS[m].g||0)}">${mAvIn(m)}</span><b>${esc(stageNm(m))}</b><span class="copg-ics">${solo&&fan?ic("#/fan/grp?id="+gid,CO_IC.cm,"社群"):""}${fan?ic("#/fan/chat?m="+m,CO_IC.tie,"TIE"):""}${(fan||artist)&&!snLockOf(m)?ic(snsH(m),CO_IC.sns,"SNS"):""}${ic(wk("m:"+m),CO_IC.wk,"SKpedia")}</span></div>`;
  const art=G.map(g=>{ const ms=grpMembers(g.id).filter(m=>MEMBERS[m]&&!MEMBERS[m].official);
    return `<section class="card copg-g ${open[g.id]?"open":""}"><button class="copg-gh" data-a="coGx" data-v="${g.id}" aria-expanded="${open[g.id]?"true":"false"}"><span class="av" style="background:${grad(g.g||0)}">${gPhoto(g.id)?`<img src="${esc(gPhoto(g.id))}" alt="">`:esc(g.name[0])}</span><span class="copg-gt"><b>${esc(g.name)}</b><small>${g.solo?"SOLO":`${ms.length} 位成員`}</small></span><i class="copg-chev">${CO_IC.chev}</i></button>
      <div class="copg-x"><div class="copg-xi">${g.solo?(ms[0]?`<div class="copg-r ctr"><span class="copg-ics">${fan?ic("#/fan/grp?id="+g.id,CO_IC.cm,"社群"):""}${fan?ic("#/fan/chat?m="+ms[0],CO_IC.tie,"TIE"):""}${(fan||artist)&&!snLockOf(ms[0])?ic(snsH(ms[0]),CO_IC.sns,"SNS"):""}${ic(wk("m:"+ms[0]),CO_IC.wk,"SKpedia")}</span></div>`:""):`<div class="copg-r ctr"><span class="copg-ics">${fan?ic("#/fan/grp?id="+g.id,CO_IC.cm,"社群"):""}${ic(wk("g:"+g.id),CO_IC.wk,"SKpedia")}</span></div>${ms.map(m=>row(m,false,g.id)).join("")}`}</div></div></section>`; }).join("");
  setLayer(`<div class="tiei copg"><header class="tiei-top"><button class="icon-btn" data-a="tCloseLayer" aria-label="返回">${I.back}</button><b>${esc(c.n)}</b><span class="sh-sp"></span></header>
    <div class="tiei-body"><div class="copg-hd">${coAv(co,"lg")}<b>${esc(c.n)} ${I.verified}</b><small>官方帳號・${G.length} 組藝人</small></div>
      <div class="chips copg-tabs"><button class="chip ${t==="ann"?"on":""}" data-a="coTab" data-v="ann" data-c="${esc(co)}">公告</button><button class="chip ${t==="art"?"on":""}" data-a="coTab" data-v="art" data-c="${esc(co)}">藝人</button></div>
      ${t==="ann"?(ann.length?ann.map(coPostCard).join(""):`<p class="me-none">還沒有公告</p>`):(art||`<p class="me-none">還沒有藝人</p>`)}</div></div>`,"copg"); }
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t) return; const a=t.dataset.a;
  if(a==="coPage"){ e.stopImmediatePropagation(); openCoPage(t.dataset.v); return; }
  if(a==="coTab"){ e.stopImmediatePropagation(); const y=(layer.querySelector(".tiei-body")||{}).scrollTop||0; openCoPage(t.dataset.c,t.dataset.v); return; }
  if(a==="coGx"){ e.stopImmediatePropagation(); const id=t.dataset.v; ui.coOpen={...(ui.coOpen||{}),[id]:!(ui.coOpen||{})[id]}; const s=t.closest(".copg-g"); if(s){ s.classList.toggle("open",!!ui.coOpen[id]); t.setAttribute("aria-expanded",ui.coOpen[id]?"true":"false"); } return; }
  if(a==="coLink"){ e.stopImmediatePropagation(); { const m=/^#\/fan\/chat\?m=([^&]+)$/.exec(t.dataset.v); if(m&&tieGate(decodeURIComponent(m[1]))) return; } layer.innerHTML=""; navTo(t.dataset.v); window.scrollTo(0,0); return; }
  if(a==="newsOpen"&&t.closest("#layer")) setTimeout(()=>{ layer.innerHTML=""; },0);   /* 公司頁裡按「閱讀全文」：先把公司頁關掉 */
},true);
/* 多張照片滑動時，下面的小點跟著動 */
document.addEventListener("scroll",e=>{ const r=e.target; if(!r.classList||!r.classList.contains("cp-swr")) return; const i=Math.round(r.scrollLeft/Math.max(1,r.clientWidth)); r.parentNode.querySelectorAll(".cp-swd i").forEach((d,j)=>d.classList.toggle("on",i===j)); },true);

/* =========================================================
   人事異動（管理員：人員 → 藝人與團 → 點團 → 人事異動）
   ・合約到期不續約／提前解約 → 團變「無所屬」
   ・轉到別的公司 → 冷卻期照新公司算（coGap 讀 g.co）
   ・成員退團 → 貼文刪掉、TIE 結束（粉絲那邊照剩下的天數退積分）、帳號變回一般粉絲；退到沒人＝解散
   ・解散 → 全部成員退團，團從名單拿掉
   ・公司帳號先發聲明，新聞晚 10 分鐘（js/09 newsAuto 會從 CO_NOTE 做新聞）
   ・沒有公司的團：用 HAECHU 公告發
   ========================================================= */
const HR_DEP="daisuki_departed";   /* {"m:<mid>":{ts,name,gid}, "g:<gid>":{ts,name}} → 粉絲那邊拿來退積分 */
const HR_KIND={coEnd:"合約到期不續約",term:"提前解約",move:"轉到別的公司",leave:"成員退團",disband:"解散"};
const hrMembers=gid=>grpMembers(gid).filter(m=>MEMBERS[m]&&!MEMBERS[m].official);
const hrYmd=ts=>{ const d=new Date(ts); return `${d.getFullYear()} 年 ${d.getMonth()+1} 月 ${d.getDate()} 日`; };
/* 聲明範本（照真實公司聲明的順序：問候 → 說明 → 感謝 → 祝福 → 之後怎麼走） */
function hrDraft(o){ const g=groupOf(o.gid)||{name:""}, G=g.name, co=coInfo(g.co||"").n, co2=o.co2?coInfo(o.co2).n:"", date=hrYmd(o.eff||Date.now()), yrs=Math.max(1,Math.round((Date.now()-(idTs(o.gid,/^g/)||Date.now()))/(365*864e5))), hasCo=!!g.co;
  const who=(o.mids||[]).map(m=>stageNm(m)).join("、"), rest=hrMembers(o.gid).filter(m=>!(o.mids||[]).includes(m)).length, me=hasCo?co:APP_NAME;
  if(o.kind==="coEnd"||o.kind==="term") return {title:`[公告] ${G} 專屬合約${o.kind==="term"?"終止":"到期"}相關說明`,
    body:`您好，這裡是 ${co}。\n\n首先，感謝一直以來支持 ${G} 的粉絲們。\n\n${o.kind==="term"?`經過長時間的慎重討論，${G} 與本公司雙方協議，決定自 ${date} 起提前終止專屬合約。`:`${G} 與本公司的專屬合約已於 ${date} 到期。經過長時間的慎重討論，雙方決定不續約，並尊重彼此的選擇。`}\n\n${G} 出道以來，以真誠的音樂與舞台陪伴著大家。本公司由衷感謝 ${G} 這段期間付出的努力，也感謝始終給予支持的粉絲們。\n\n雖然與本公司的旅程在此告一段落，我們會真心為 ${G} 的新開始加油，也懇請大家繼續給予 ${G} 溫暖的支持。\n\n謝謝。`,
    newsTitle:`${G} 與 ${co} ${o.kind==="term"?"提前終止專屬合約":"合約到期，決定不續約"}`,
    newsBody:`${co} 今天發表官方聲明，宣布${o.kind==="term"?`與 ${G} 經雙方協議，自 ${date} 起提前終止專屬合約`:`與 ${G} 的專屬合約已於 ${date} 到期，雙方決定不續約`}。\n\n${co} 在聲明中感謝 ${G} 這段期間的努力，並表示會真心支持 ${G} 的新開始。\n\n${G} 今後的動向，請持續關注 HAECHU 娛樂新聞。`};
  if(o.kind==="move"&&!hasCo) return {title:`[公告] 歡迎 ${G} 加入 ${co2}`,
    body:`您好，這裡是 ${co2}。\n\n我們很高興地宣布，${G} 已與本公司簽訂專屬合約，自 ${date} 起成為 ${co2} 的一員。\n\n本公司將全力支持 ${G} 今後的活動，請大家多多期待 ${G} 在 ${co2} 的新篇章。\n\n謝謝。`,
    newsTitle:`${G} 簽約 ${co2}`, newsBody:`${co2} 今天發表官方聲明，${G} 自 ${date} 起與 ${co2} 簽訂專屬合約。\n\n${co2} 表示將全力支持 ${G} 今後的活動。`};
  if(o.kind==="move") return {title:`[公告] ${G} 專屬合約相關說明`,
    body:`您好，這裡是 ${co}。\n\n首先，感謝一直以來支持 ${G} 的粉絲們。\n\n${G} 與本公司經過長時間的討論，決定自 ${date} 起結束專屬合約，${G} 將轉往 ${co2} 繼續活動。\n\n本公司由衷感謝 ${G} 這段期間的努力，也會真心為 ${G} 的新篇章加油。懇請大家今後也繼續給予 ${G} 溫暖的支持。\n\n謝謝。`,
    welcome:`您好，這裡是 ${co2}。\n\n我們很高興地宣布，${G} 已與本公司簽訂專屬合約，自 ${date} 起成為 ${co2} 的一員。\n\n本公司將全力支持 ${G} 今後的活動，請大家多多期待 ${G} 在 ${co2} 的新篇章。\n\n謝謝。`,
    newsTitle:`${G} 簽約 ${co2}，開啟新篇章`,
    newsBody:`${co} 與 ${co2} 今天先後發表官方聲明，${G} 將自 ${date} 起結束與 ${co} 的合約，轉往 ${co2} 繼續活動。\n\n${co2} 表示將全力支持 ${G} 今後的活動。`};
  if(o.kind==="disband"||(o.kind==="leave"&&rest===0)) return {title:`[公告] ${G} 團體活動結束相關說明`,
    body:`您好，這裡是 ${me}。\n\n首先，向一直以來深愛 ${G} 的粉絲們致上深深的感謝。\n\n在此告知，${G} 將於 ${date} 結束團體活動，正式解散。${hasCo?"本公司與成員們經過長時間的討論，最終決定尊重每一位成員對未來的選擇。":""}\n\n${G} 這 ${yrs} 年來帶給大家許多珍貴的回憶，這一切都是因為有粉絲們的陪伴。突然傳達這個消息，讓大家擔心了，我們深感抱歉。\n\n雖然 ${G} 的旅程在此畫下句點，請大家記得一起度過的時光，也為成員們各自的新開始送上祝福。\n\n謝謝。`,
    newsTitle:`${G} 宣布解散，結束 ${yrs} 年團體活動`,
    newsBody:`${me} 今天發表官方聲明，宣布 ${G} 將於 ${date} 結束團體活動，正式解散。\n\n聲明中表示，這是尊重每位成員對未來的選擇後做出的決定，並感謝粉絲們一路以來的陪伴。`};
  if(o.kind==="leave") return {title:`[公告] ${G} 成員 ${who} 相關說明`,
    body:`您好，這裡是 ${me}。\n\n在此向一直以來支持 ${G} 的粉絲們，告知關於成員 ${who} 的消息。\n\n${who} 經過長時間的思考，表達了希望走上不同道路的意願。${hasCo?"本公司與成員們":"成員們"}經過多次慎重討論後，決定尊重 ${who} 的決定。${who} 將自 ${date} 起退出 ${G}${hasCo?"，並結束與本公司的專屬合約":""}。\n\n突然傳達這個消息，讓粉絲們擔心，我們深感抱歉。\n\n${G} 今後將以 ${rest} 人體制繼續活動${hasCo?"，本公司也會全力支持成員們":""}。請大家為 ${who} 的新開始，以及繼續前進的 ${G} 送上溫暖的支持。\n\n謝謝。`,
    newsTitle:`${who} 退出 ${G}，${G} 將以 ${rest} 人體制繼續活動`,
    newsBody:`${me} 今天發表官方聲明，${G} 成員 ${who} 將自 ${date} 起退出團體。\n\n聲明表示，這是尊重 ${who} 希望走上不同道路的意願後做出的決定。${G} 今後將以 ${rest} 人體制繼續活動。`};
  return {title:"",body:""}; }

/* 管理員：團的頁面最下面 */
function hrHtml(g){ if(!g) return ""; const b=(k,l,d)=>`<button class="list-btn" data-a="hrNew" data-v="${k}" data-g="${g.id}">${l}<span class="r">${d||""}</span></button>`;
  return `<div class="section-h">人事異動</div><section class="card hr-c">${g.co?b("coEnd","合約到期不續約",esc(g.co))+b("term","提前解約")+b("move","轉到別的公司"):b("move","簽約公司","無所屬")}${g.solo?"":b("leave","成員退團")}${b("disband",g.solo?"結束活動":"解散")}</section>`; }
function hrSheet(){ const o=ui.hr; if(!o) return; const g=groupOf(o.gid); if(!g) return; const ms=hrMembers(o.gid);
  if(!o.edited){ const d=hrDraft(o); o.title=d.title; o.body=d.body; }
  const opts=o.kind==="move"?`<span class="fs-f-lab">新公司</span><div class="chips wrap co-chips">${SK_COS.filter(c=>c!==g.co).map(c=>`<button class="chip ${o.co2===c?"on":""}" data-a="hrCo" data-v="${esc(c)}">${esc(c)}</button>`).join("")}</div>`
    :o.kind==="leave"?`<span class="fs-f-lab">退團的成員</span><div class="chips wrap">${ms.map(m=>`<button class="chip ${(o.mids||[]).includes(m)?"on":""}" data-a="hrMem" data-v="${m}">${esc(stageNm(m))}</button>`).join("")}</div>`:"";
  tieModal(`${esc(g.name)}・${g.co||o.kind!=="move"?HR_KIND[o.kind]:"簽約公司"}`,`${opts}<span class="fs-f-lab">生效日期</span><input id="hrEff" class="a-nick-in" type="date" value="${esc(ymdIn(o.eff||Date.now()))}">
    <span class="fs-f-lab">公告標題</span><input id="hrTi" class="a-nick-in" maxlength="60" placeholder="輸入文字" value="${esc(o.title||"")}">
    <span class="fs-f-lab">公告內容</span><textarea id="hrBody" class="a-nick-in hr-body" rows="12" placeholder="輸入文字">${esc(o.body||"")}</textarea>`,
    `<button class="t-mbtn main" data-a="hrGo">發布</button><button class="t-mbtn" data-a="tCloseLayer">取消</button>`); }
function hrKeep(){ const o=ui.hr; if(!o) return; const v=id=>{ const e=document.getElementById(id); return e?e.value:null; }, ti=v("hrTi"), bd=v("hrBody"), ef=v("hrEff");
  if(ef!=null){ const t=ymdTs(ef); if(t&&t!==o.eff){ o.eff=t; } } if(ti!=null&&bd!=null&&(ti!==o.title||bd!==o.body)){ o.title=ti; o.body=bd; o.edited=true; } }
/* 真的執行 */
function hrRemoveMember(mid,now){ const m=MEMBERS[mid]; if(!m) return; const D=S.get(HR_DEP,{})||{}; D["m:"+mid]={ts:now,name:m.name,gid:m.group}; S.set(HR_DEP,D);
  const P=S.get(K.posts,[])||[], gone=new Set(P.filter(p=>p.member===mid).map(p=>p.id)); if(gone.size){ S.set(K.posts,P.filter(p=>!gone.has(p.id))); S.set(K.comments,(S.get(K.comments,[])||[]).filter(c=>!gone.has(c.postId))); }
  Object.keys(ACCOUNTS).filter(e=>(ACCOUNTS[e]||{}).member===mid).forEach(e=>unbindArtist(e));
  saveRoster(r=>{ delete r.members[mid]; }); delete MEMBERS[mid]; }
function hrDisband(gid,now){ const g=groupOf(gid); if(!g) return; hrMembers(gid).forEach(m=>hrRemoveMember(m,now)); const D=S.get(HR_DEP,{})||{}; D["g:"+gid]={ts:now,name:g.name}; S.set(HR_DEP,D);
  saveRoster(r=>{ r.groups=(r.groups||[]).filter(x=>x.id!==gid); delete r.members[gid+"_o"]; }); const i=GROUPS.findIndex(x=>x.id===gid); if(i>=0) GROUPS.splice(i,1); delete MEMBERS[gid+"_o"]; }
function hrSetCo(gid,co){ saveRoster(r=>{ const x=(r.groups||[]).find(y=>y.id===gid); if(x){ if(co) x.co=co; else delete x.co; } }); const g=groupOf(gid); if(g){ if(co) g.co=co; else delete g.co; } }
function hrGo(){ hrKeep(); const o=ui.hr, g=o&&groupOf(o.gid); if(!g) return; const now=Date.now(), title=(o.title||"").trim(), body=(o.body||"").trim();
  if(o.kind==="move"&&!o.co2){ toast("請選新公司"); return; } if(o.kind==="leave"&&!(o.mids||[]).length){ toast("請選退團的成員"); return; } if(!title||!body){ toast("請輸入公告內容"); return; }
  const d=hrDraft(o), oldCo=g.co||"", disb=o.kind==="disband"||(o.kind==="leave"&&hrMembers(o.gid).every(m=>o.mids.includes(m))), L=S.get(CO_NOTE,[])||[];
  if(o.kind==="move"&&!oldCo) L.push({id:"hr"+now.toString(36),co:o.co2,gid:o.gid,kind:"join",title,body,ts:now,newsTitle:d.newsTitle,newsBody:d.newsBody,gname:g.name});
  else if(oldCo) L.push({id:"hr"+now.toString(36),co:oldCo,gid:o.gid,kind:o.kind,title,body,ts:now,newsTitle:d.newsTitle,newsBody:d.newsBody,gname:g.name});
  else { publishAnnounce(title); L.push({id:"hr"+now.toString(36),co:"",gid:o.gid,kind:o.kind,title,body,ts:now,newsTitle:d.newsTitle,newsBody:d.newsBody,gname:g.name}); }
  if(o.kind==="move"&&oldCo) L.push({id:"hw"+now.toString(36),co:o.co2,gid:o.gid,kind:"join",title:`[公告] 歡迎 ${g.name} 加入 ${coInfo(o.co2).n}`,body:d.welcome||"",ts:now+1000,noNews:1,gname:g.name});
  S.set(CO_NOTE,L);
  if(o.kind==="coEnd"||o.kind==="term") hrSetCo(o.gid,"");
  else if(o.kind==="move") hrSetCo(o.gid,o.co2);
  else if(disb) hrDisband(o.gid,now);
  else o.mids.forEach(m=>hrRemoveMember(m,now));
  ui.hr=null; layer.innerHTML=""; if(disb) navTo("#/admin?tab=roster"); render(); toast("已發布"); }
document.addEventListener("click",e=>{ const t=e.target.closest("[data-a]"); if(!t||!/^hr[A-Z]/.test(t.dataset.a)) return; e.stopImmediatePropagation(); const a=t.dataset.a;
  if(a==="hrNew"){ ui.hr={kind:t.dataset.v,gid:t.dataset.g,mids:[],eff:dayStart(Date.now())}; hrSheet(); return; }
  hrKeep(); const o=ui.hr; if(!o) return;
  if(a==="hrCo"){ o.co2=o.co2===t.dataset.v?"":t.dataset.v; hrSheet(); return; }
  if(a==="hrMem"){ const v=t.dataset.v; o.mids=o.mids.includes(v)?o.mids.filter(x=>x!==v):[...o.mids,v]; hrSheet(); return; }
  if(a==="hrGo"){ const g=groupOf(o.gid), n=o.kind==="leave"?(o.mids||[]).map(m=>stageNm(m)).join("、"):(g||{}).name;
    ask(o.kind==="leave"||o.kind==="disband"?`確定要發布嗎？${n} 的貼文會刪掉、TIE 會結束（粉絲照剩下的天數退積分），帳號變回一般粉絲。`:"確定要發布嗎？",hrGo); return; }
},true);
/* 選項變了、還沒自己改過內容 → 範本跟著換 */
document.addEventListener("change",e=>{ if(e.target&&e.target.id==="hrEff"&&ui.hr){ hrKeep(); if(!ui.hr.edited) hrSheet(); } });

/* ---------- 粉絲那邊：藝人退團／解散 → TIE、Membership 結束，照剩下的天數退積分 ---------- */
function hrRefund(){ try{ const D=S.get(HR_DEP,{})||{}; if(!Object.keys(D).length) return; const s=session(); if(!s) return;
  const day=864e5, tieRate=(PLANS.find(p=>p.id==="d30")||PLANS[0]), msRate=(MS_PLANS.find(p=>p.id==="m30")||MS_PLANS[0]); let pts=0; const why=[];
  const A=subs(); let ch=false; Object.keys(A).forEach(mid=>{ const d=D["m:"+mid]; if(!d) return; const left=Math.max(0,(A[mid].expires||0)-d.ts); const n=Math.round(left/day*tieRate.pts/tieRate.days); if(n>0){ pts+=n; why.push(`${d.name} 的 ${WHISPER_NAME}`); } delete A[mid]; ch=true; });
  if(ch) S.set(K.tieSubs,A);
  const M=getMS(); let cm=false; Object.keys(M).forEach(gid=>{ const d=D["g:"+gid]; if(!d) return; const left=Math.max(0,(M[gid].expires||0)-d.ts); const n=Math.round(left/day*msRate.pts/msRate.days); if(n>0){ pts+=n; why.push(`${d.name} 的 Membership`); } delete M[gid]; cm=true; });
  if(cm) S.set(K.membership,M);
  if(pts>0){ S.set(K.points,points()+pts); const L=S.get(K.notifs,[]); L.unshift({id:"n"+Date.now()+Math.random().toString(36).slice(2,5),kind:"core",direct:true,text:`退還 ${fmt(pts)} 積分・${why.join("、")}（照剩下的天數）`,ts:Date.now()}); S.set(K.notifs,L.slice(0,100)); S.set(K.unread,"1"); }
  if(ch||cm) setTimeout(()=>{ if(!document.querySelector("input:focus,textarea:focus")) render(); },0); }catch(e){} }
setTimeout(hrRefund,4000); setInterval(()=>{ if(!document.hidden) hrRefund(); },5*60e3);

/* =========================================================
   各公司的官方文案（出道／回歸預告、排程表、Teaser、概念照、曲目表、影片、發行）
   ・四大公司照真實官方帳號的寫法：
     SM   ：英文標籤式，專輯名用【】，「➫ 2025.02.24 6PM (KST)」，最後一排 hashtag
     HYBE ：Weverse 公告式（[Notice]、您好，這裡是…），內容貼文用 '單引號' 和 Ver.
     JYP  ：<專輯名>、日期後面加（星期）、M/V Teaser
     YG   ：全大寫、[專輯名]、TEASER POSTER、0AM (KST)、出道用 WHO'S NEXT?
   ・自創三間：參考中小公司，各自一種風格
     PAPERMOON   ：月亮、紙信、小寫、詩句
     BLUE HOUR   ：時刻表、倒數、時間碼
     DOLPUNG Lab.：實驗室報告、編號、進度條
   ・App 裡的時間就當作 KST
   ========================================================= */
/* App 裡的時間就當作 KST（藝人選的發布時間原樣顯示） */
const KST=ts=>{ const d=new Date(ts); return {y:d.getFullYear(),m:d.getMonth()+1,d:d.getDate(),h:d.getHours(),mi:d.getMinutes(),w:d.getDay()}; };
const p2=n=>String(n).padStart(2,"0");
const kDot=ts=>{ const k=KST(ts); return `${k.y}.${p2(k.m)}.${p2(k.d)}`; };
const kDash=ts=>{ const k=KST(ts); return `${k.y}-${p2(k.m)}-${p2(k.d)}`; };
const kAP=ts=>{ const k=KST(ts), h=k.h===0?0:(k.h%12||12); return `${h}${k.mi?":"+p2(k.mi):""}${k.h<12?"AM":"PM"}`; };   /* 午夜寫 0AM（韓國公司的寫法） */
const k24=ts=>{ const k=KST(ts); return `${p2(k.h)}:${p2(k.mi)}`; };
const kW=ts=>["SUN","MON","TUE","WED","THU","FRI","SAT"][KST(ts).w];
const kWzh=ts=>"日一二三四五六"[KST(ts).w];
const kZh=ts=>{ const k=KST(ts); return `${k.y} 年 ${k.m} 月 ${k.d} 日（${kWzh(ts)}）${k.h<12?"上午":k.h<18?"下午":"晚上"} ${k.h%12||12} 點${k.mi?` ${k.mi} 分`:""}`; };
const REL_EN={"單曲":"Single","數位單曲":"Digital Single","EP":"EP","迷你專輯":"Mini Album","正規專輯":"Album","改版專輯":"Repackage Album","電子專輯":"E-Album"};
const relEn=s=>REL_EN[s.rtype]||"";   /* 沒選發行型態就不寫，不要亂寫成 Album */
const tag=v=>"#"+String(v||"").replace(/[\s'"「」《》【】<>\[\]]/g,"");
const lc=v=>String(v||"").toLowerCase();
/* 這一則要用的時間：預告、排程表寫發行時間；其他寫自己的時間 */
function capTimes(s,x){ const plan=promoPlan(s), rel=plan.find(y=>y.k==="rel"), relTs=rel?rel.ts:s.day, days=Math.max(0,Math.ceil((relTs-((x&&x.ts)||Date.now()))/864e5)); return {relTs,days}; }

function coCap0(co,k,s,x){ x=x||{}; const N=s.name, T=s.title||N, db=s.k==="db", {relTs,days}=capTimes(s,x), n=x.no||1, tot=x.tot||1, R=relEn(s), RZ=s.rtype||"作品", R1=R?`${db?"The 1st ":""}${R} `:"";
  const kindEn={sched:"Scheduler",teaser:"Teaser Image",concept:"Concept Photo",trk:"Track List",medley:"Highlight Medley",film:"Concept Film",mvt:"MV Teaser"};
  switch(co){
  case "SM": { const hd=`${N} ${R1}【${T}】`, when=`➫ ${kDot(relTs)} ${kAP(relTs)} (KST)`, tg=`${tag(N)} ${tag(T)}`;
    if(k==="annDb") return {t:"SM NEW ARTIST",b:`${N}\n${R1}【${T}】\n\n${when}\n\n${tg}`};
    if(k==="annCb") return {t:hd,b:`${when}\n\n${tg}`};
    if(k==="rel") return {t:hd,b:`➫ NOW ON SALE\n\n${tg}`};
    if(k==="concept") return {t:hd,b:`${x.n?`'${x.n}' `:""}Concept Photo${tot>1?` #${n}`:""}\n${when}\n\n${tg}`};
    if(k==="teaser") return {t:hd,b:`Teaser Image #${n}\n${when}\n\n${tg}`};
    if(k==="mvt") return {t:hd,b:`'${T}' MV Teaser\n${when}\n\n${tg}`};
    return {t:hd,b:`${kindEn[k]}\n${when}\n\n${tg}`}; }
  case "HYBE": { const when=`${kDot(relTs)} ${kAP(relTs)} (KST)`, tg=`${tag(N)} ${tag(T)}`;
    if(k==="annDb"||k==="annCb") return {t:db?`[Notice] ${N} 出道相關公告`:`[Notice] ${N} ${RZ}《${T}》發行相關公告`,
      b:`您好，這裡是 HYBE。\n\n${db?`新人${s.solo?"SOLO 藝人":""} ${N} 將於 ${kZh(relTs)}（韓國時間）發行出道${RZ}《${T}》，正式出道。`:`${N} 將於 ${kZh(relTs)}（韓國時間）發行${RZ}《${T}》。`}\n\n發行前將陸續公開概念照、預告影片等內容，詳細日程請參考之後公開的排程表。\n\n請大家給予 ${N} 溫暖的關注與支持。\n謝謝。`};
    if(k==="rel") return {t:`${N} '${T}' Official MV`,b:`Out Now\n\n${tg}`};
    if(k==="concept") return {t:`${N} '${T}' Concept Photo`,b:`${x.n?`'${x.n}' Ver.`:`Ver. ${n}`}\n\n${when}\n${tg}`};
    if(k==="teaser") return {t:`${N} '${T}' Teaser Image`,b:`${tot>1?`#${n}\n\n`:""}${when}\n${tg}`};
    if(k==="mvt") return {t:`${N} '${T}' Official MV Teaser`,b:`${when}\n${tg}`};
    if(k==="sched") return {t:`${N} '${T}' Promotion Schedule`,b:`${when}\n${tg}`};
    return {t:`${N} '${T}' ${kindEn[k]}`,b:`${when}\n${tg}`}; }
  case "JYP": { const when=`${kDot(relTs)} (${kW(relTs)}) ${kAP(relTs)} KST`, tg=`${tag(N)} ${tag(T)}`, hd=`${N} <${T}>`;
    if(k==="annDb") return {t:"JYP NEW ARTIST",b:`${N}\n${R?`1st ${R} `:""}<${T}>\n\n${when}\n\n${tg}`};
    if(k==="annCb") return {t:hd,b:`${R?R+"\n\n":""}${when}\n\n${tg}`};
    if(k==="rel") return {t:hd,b:`"${T}" M/V\nOUT NOW\n\n${tg}`};
    if(k==="mvt") return {t:`${N} "${T}" M/V Teaser`,b:`${when}\n\n${tg}`};
    if(k==="concept") return {t:hd,b:`Concept Photo${x.n?` - ${x.n}`:` ${n}`}\n\n${when}\n\n${tg}`};
    if(k==="teaser") return {t:hd,b:`Teaser Image ${n}\n\n${when}\n\n${tg}`};
    return {t:hd,b:`${kindEn[k]}\n\n${when}\n\n${tg}`}; }
  case "YG": { const U=String(N).toUpperCase(), RU=R?((db?"1ST ":"")+R.toUpperCase()+" "):"", when=`${kDot(relTs)} ${kAP(relTs)} (KST)`, tg=`${tag(N)} ${tag(T)} #YG`;
    if(k==="annDb") return {t:"WHO'S NEXT?",b:`YG NEW ARTIST\n${U}\n\n${when}\n\n${tg}`};
    if(k==="annCb") return {t:`${U} - ${RU}[${T}]`,b:`COMING SOON\n${when}\n\n${tg}`};
    if(k==="rel") return {t:`${U} - '${T}' M/V`,b:`OUT NOW\n\n${tg}`};
    if(k==="mvt") return {t:`[${U}] '${T}' M/V TEASER`,b:`${when}\n\n${tg}`};
    if(k==="teaser") return {t:`${U} - ${RU}[${T}] TEASER POSTER`,b:`${tot>1?`#${n}\n`:""}${when}\n\n${tg}`};
    if(k==="concept") return {t:`${U} - ${RU}[${T}] ${x.n?String(x.n).toUpperCase()+" ":""}CONCEPT PHOTO`,b:`${when}\n\n${tg}`};
    if(k==="sched") return {t:`${U} - ${RU}[${T}] PROMOTION SCHEDULE`,b:`${when}\n\n${tg}`};
    return {t:`${U} - [${T}] ${kindEn[k].toUpperCase()}`,b:`${when}\n\n${tg}`}; }
  case "PAPERMOON": { const n0=lc(N), when=`${kDot(relTs)} · ${k24(relTs)}`;
    if(k==="annDb") return {t:"🌙 papermoon letter",b:`紙做的月亮上，又多了一顆星。\n\n${n0}\n「${lc(T)}」\n${when} kst\n\n一起等月亮升起吧。`};
    if(k==="annCb") return {t:"🌙 papermoon letter",b:`${n0} 寫了一封新的信。\n\n「${lc(T)}」\n${when} kst\n\n請在月亮最圓的那天打開它。`};
    if(k==="rel") return {t:`🌙 ${n0} — 「${lc(T)}」`,b:`今晚，月亮升起了。\nout now.`};
    if(k==="sched") return {t:`🌙 ${n0} — moon calendar`,b:`還有 ${days} 個夜晚。\n${when} kst`};
    if(k==="teaser") return {t:`🌙 ${n0} — 「${lc(T)}」`,b:`teaser image no.${n}\n${when} kst`};
    if(k==="concept") return {t:`🌙 ${n0} — 「${lc(T)}」`,b:`concept photo · ${lc(x.n||"no."+n)}\n${when} kst`};
    if(k==="trk") return {t:`🌙 ${n0} — tracklist`,b:`這封信裡，一共有幾首歌呢？\n${when} kst`};
    return {t:`🌙 ${n0} — 「${lc(T)}」`,b:`${lc(kindEn[k])}\n${when} kst`}; }
  case "BLUE HOUR": { const U=String(N).toUpperCase(), d=`${p2(KST(relTs).m)}.${p2(KST(relTs).d)} ${kW(relTs)} ${k24(relTs)} KST`, cd=days>0?`T-${days} DAYS`:"T-0";
    if(k==="annDb") return {t:`BLUE HOUR ── ${k24(relTs)}`,b:`[ NEW ARTIST ]\n${U}\n${T}\n\n${d}\n${cd}`};
    if(k==="annCb") return {t:`BLUE HOUR ── ${k24(relTs)}`,b:`[ ${U} ]\n${T}\n\n${d}\n${cd}`};
    if(k==="rel") return {t:`[${U}] ${T}`,b:`── 00:00:00\nNOW PLAYING`};
    if(k==="sched") return {t:`[${U}] ${T}`,b:`TIMETABLE\n${d}\n${cd}`};
    if(k==="teaser") return {t:`[${U}] ${T}`,b:`TEASER IMAGE ${n}/${tot}\n${d}\n${cd}`};
    if(k==="concept") return {t:`[${U}] ${T}`,b:`CONCEPT PHOTO ── ${String(x.n||n).toUpperCase()}\n${d}\n${cd}`};
    return {t:`[${U}] ${T}`,b:`${kindEn[k].toUpperCase()}\n${d}\n${cd}`}; }
  case "DOLPUNG Lab.": { const i=(x.idx||0)+1, all=x.all||1, pct=k==="rel"?100:Math.round(i/all*100), bar="▓".repeat(Math.round(pct/10))+"░".repeat(10-Math.round(pct/10)), rep=`REPORT #${String((strHash(s.id)%900)+100)}-${p2(i)}`, launch=`${kDash(relTs)} ${k24(relTs)} KST`;
    if(k==="annDb"||k==="annCb") return {t:`DOLPUNG Lab. ${rep}`,b:`PROJECT  ${N}\nTYPE  ${db?"DEBUT":"COMEBACK"}${R?" · "+R.toUpperCase():""}\nTITLE  ${T}\nLAUNCH  ${launch}\n\nWE BELIEVE IN INNOVATION.`};
    if(k==="rel") return {t:`DOLPUNG Lab. / ${N}`,b:`PROJECT ${N} — LAUNCHED.\n${T} OUT NOW.\nPROGRESS ${bar} 100%`};
    const f={sched:"EXPERIMENT SCHEDULE",teaser:`FILE ${p2(n)} — TEASER IMAGE`,concept:`FILE ${p2(n)} — CONCEPT PHOTO${x.n?` (${String(x.n).toUpperCase()})`:""}`,trk:"TRACK DATA",medley:"AUDIO SAMPLE — HIGHLIGHT MEDLEY",film:"VISUAL DATA — CONCEPT FILM",mvt:"VISUAL DATA — MV TEASER"}[k]||kindEn[k];
    return {t:`DOLPUNG Lab. / ${N}`,b:`${f}\nLAUNCH ${launch}\nPROGRESS ${bar} ${pct}%`}; }
  default: return {t:k==="annDb"?`✨ 出道預告｜「${N}」`:k==="annCb"?`📢 回歸預告｜${N}《${T}》`:`${N}《${T}》${PR_KIND[k]||""}`,b:k==="annDb"||k==="annCb"?`${mdTxt(relTs)} 見！`:""}; } }
/* 歌名／專輯名：不要【】<>[]「」這些括號，改用粗體特殊字；標題裡的歌名自己換一行 */
const TT0="\u0001", TT1="\u0002";
/* 歌手、團體名字也不要括號 */
function capNoBr(c,N){ if(!N) return c; const es=v=>String(v).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"), alt=[N,N.toLowerCase(),N.toUpperCase()].map(es).join("|");
  const re=new RegExp(`[【<\\[「'"]\\s*(${alt})\\s*[】>\\]」'"]`,"g"), re2=new RegExp(`(^|[^#\\w\u0003-])(${alt})(?![\\w-])`,"g"),
    f=v=>String(v||"").replace(re,"$1").replace(re2,(m,p1,g)=>p1+"\u0003"+g+"\u0004"); return {t:f(c.t),b:f(c.b)}; }
function coCap(co,k,s,x){ if(k==="sc"){ const db=s.k==="db", pr=s.pr||{}; return {t:`${s.name} ${db?"DEBUT":"COMEBACK"} SHOWCASE`,b:`${s.name}${s.title?`《${s.title}》`:""} ${db?"出道":"回歸"} Showcase 今天 ${pr.sc} 開始！\n一起見證${db?"出道":"回歸"}後的第一個舞台 💜`}; }
  const c=capNoBr(coCap0(co,k,s,x),s&&s.name), T=(s&&s.title)||""; if(!T) return c;
  const es=v=>String(v).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"), alt=[T,T.toLowerCase(),T.toUpperCase()].map(es).join("|");
  const re=new RegExp(`(^|[^#\\w-])[【<\\[「'"]?(${alt})[】>\\]」'"]?(?![\\w-])`,"g"), mark=v=>String(v||"").replace(re,(m,p1,g)=>p1+TT0+g+TT1);
  let t=mark(c.t), b=mark(c.b); const i=t.indexOf(TT0); if(i>0) t=t.slice(0,i).replace(/\s+$/,"")+"\n"+t.slice(i);
  return {t,b}; }
const capRich=v=>esc(String(v||"").replace(/「([^」《》]{1,30})」(?=[^\s，。！？、｜）)])/g,"\u0003$1\u0004 ").replace(/「([^」《》]{1,30})」/g,"\u0003$1\u0004")).replace(/\u0003([\s\S]*?)\u0004/g,'<b class="cp-nm">$1</b>').replace(/\u0001([\s\S]*?)\u0002/g,'<b class="cp-tt">$1</b>').replace(/\n/g,"<br>");

const capHtml=c=>`<p class="cp-t">${capRich(c.t)}</p>${c.b?`<p class="cp-x cp-cap">${capRich(c.b)}</p>`:""}`;

