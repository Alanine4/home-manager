# Roadmap

这个文件记录接下来打算做什么、为什么，以及**决定不做什么**。
优先级只有一条判断标准：**手机是主力场景**，电脑是次要的。

---

## 定位

一个网址（GitHub Pages），手机和电脑打开的是同一份代码。不做原生 App，
装成 PWA 加到主屏就够了。

数据默认只在本机的 localStorage。云同步是可选的、用户自己配 Firebase 的，
默认关闭。GitHub Pages 只发静态文件，它不存任何用户数据。

---

## 已完成

### 让 PWA 在手机上真的能离线用
- `sw.js` 的缓存清单原来写死 `/home-manager/`，在别人 fork 的域名下和本地
  `127.0.0.1` 上都是 404 → `addAll` 整个失败 → **什么都没缓存上，断网打开直接白屏**。
  改成相对路径。`manifest.json` 的 `start_url` / `scope` 同样问题，一起改。
- Tailwind 原来从 CDN 加载，而 Service Worker 缓存不了跨域请求，所以断网必裂。
  改成 `vendor/tailwind.js` 放在仓库里，并加进预缓存清单。

### 没配同步的人，零外部请求
- Firebase SDK 原来无条件写在 `<head>` 里，不管你用不用都会去 gstatic 拉两个脚本。
  改成运行时按需注入（`loadFirebaseSdk`），只有存在配置时才加载。
- 新增 `?mode=local`：配置照留，但这一次不连云。用于临时借别人的设备。

### 状态灯说人话
- 顶栏 `#sync-status` 四态：🔒 仅本地 / ☁️ 已同步 / 🔄 同步中 / ⚠️ 离线，
  每个都有悬停解释，点击跳到设置。
- 重点是让「仅本地」读起来是一个**完整可用的正常状态**，而不是「你还差一步没配好」。

### 房间码可以分享和扫码
- 「📤 分享链接」：手机上调系统分享面板（可直接发微信 / WhatsApp），
  桌面回落到复制到剪贴板。
- 「📱 二维码」：本机生成，`vendor/qrcode.js` 也在仓库里。
  **绝不能用在线二维码 API** —— 房间码是访问数据的唯一凭证，不能发给第三方。
- 链接形如 `…/#room=ABCD234567`。**放在 `#` 后面而不是 `?` 后面**：fragment
  浏览器不会发给服务器，所以房间码不会进 GitHub Pages 的访问日志，也不会跟着
  Referer 漏出去。这一条是从 Excalidraw 的协作链接设计抄来的。
- 打开邀请链接后立刻用 `history.replaceState` 把码从地址栏抹掉，不留在浏览历史里。
- 新增 `Cloud.validCode()`：房间码会直接拼进 Firebase 路径 `h/<code>`，
  而 `. $ # [ ] /` 在那里是非法字符，所有外部来源的码都要先过这一关。

---

## 接下来

### 1. 备份（手机优先）
localStorage 会丢：清缓存、换浏览器、iOS 长期不打开 Safari 都可能清掉。
现在只有一个手动「导出数据」按钮，不够。

- 手机：导出走 Web Share API，直接存进「文件」App 或发给自己
- 电脑（Chrome / Edge）：File System Access API，选一个网盘目录
  （iCloud / Dropbox / 坚果云）自动落盘，顺带白送一条不需要 Firebase 的多端同步
- Safari / Firefox：回落到下载目录

TiddlyWiki 折腾了二十年，结论是本地服务器和 File System Access **两条都要**，
不能只押一条。手机端注定用不了后者，所以 Web Share 那条不能省。

### 2. 电脑本地运行（加分项，不是重点）
`start.command` / `start.bat` / `start.sh`，内部就是 `python3 -m http.server 5173`。
不引 npm，不加 `node_modules`，不要构建步骤。

为什么不能直接双击 `index.html`：浏览器只把 `https` 和 `localhost` 当可信来源，
`file://` 下摄像头（条码扫描）、语音识别、Service Worker 全部不可用。

⚠️ macOS 上未签名的 `.command` 第一次双击会被 Gatekeeper 拦，必须右键 → 打开。
README 里要明写这一句，否则第一批用户全卡在这。

**这条排在备份后面**，因为它只服务电脑用户，跟"手机是重点"不符。

### 3. 等真有用户了：内置后端 + 登录
现在是「用户自己配 Firebase」，对早期用户不友好，但对项目零成本零责任。
等真有人用了，再考虑内置自己的后端，让用户打开就登录。

**决定：继续用 Firebase，不迁 Supabase。**
- 已经在用 Firebase Realtime Database，数据模型不用动
- Firebase Auth 的邮箱 + Google 登录免费到 50,000 MAU
- 改动只有三处：把自己的配置内置、加 Auth、`database.rules.json` 用
  `auth.uid` 做隔离
- 迁 Supabase 要重写 Postgres 建表、RLS、REST + Realtime，现有 `Cloud` 模块
  整个作废，换来的东西一样。除非以后要复杂查询，否则没理由换

**做这件事之前想清楚**：一旦内置自己的后端，身份就从"写工具的人"变成
"运营服务的人"。别人的家庭数据在你的库里，GDPR 适用：要能删账号、能导出数据、
要有隐私政策。这是责任问题，不是技术问题。

### 4. 配套第 3 条：端到端加密
推送到云端前用 WebCrypto 加密，密钥只出现在分享链接的 `#` 后面，不进数据库。
这样房间码泄露 ≠ 数据泄露。会改变数据格式，所以要和第 3 条一起做。

---

## 已知的坑

- **同步是整份数据推送，不是逐条合并**（见 `Cloud._buildPayload`）。两个人同时
  改同一样东西，后保存的覆盖前一个。日常买菜够用。真需要并发编辑再考虑 CRDT
  （TinyBase 零依赖、能直接引，不会破坏单文件形态）。
- 房间码是访问数据的唯一凭证，没有踢人也没有撤销。
- AI 服务商必须返回 CORS 头才能在浏览器里直连。OpenAI 的 `/chat/completions`
  不返回，要走 OpenRouter。
- 条码扫描依赖 `BarcodeDetector`，Safari 不支持。
- 语音输入依赖 Web Speech API，需要联网。
