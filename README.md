# Home Manager 🏠

> Shopping list, food inventory and recipes for a shared household. One HTML
> file, no build step, no account.

**🔗 Live Demo:** https://alanine4.github.io/home-manager/

---

## What it is

People sharing a kitchen buy the same thing twice, forget what is already in the
cupboard, and start cooking before noticing an ingredient is missing. This tracks
what you have, what you need to buy, and which recipes you can make right now
from what is in stock.

It is a single HTML file. Open it and it works, storing everything in your
browser. Add an AI key for receipt scanning and natural-language input. Add a
Firebase project to sync across devices. Both are optional and neither is
required to use the app.

---

## Features

### 🛒 Shopping Cart
- Group by store (Colruyt / Carrefour / Lidl) or category
- Mark as bought → batch move to inventory
- AI natural language input ("I need tomatoes and pork")

### 📦 Food Inventory
- Collapsible, sortable, pinnable categories
- Barcode scanning with auto-fill (Open Food Facts)
- Receipt photo scanning — AI reads any language (Dutch / French / English...)
- Voice input

### 🍳 Recipes
- Shows how many ingredients you already have in stock
- One tap to add missing ingredients to cart
- AI recommends recipes based on your current inventory

### 🏠 Household Supplies
- Separate tracking for toiletries / cleaning / household items
- Low-stock alerts
- Fully independent from food inventory

### 🤖 AI Assistant
- 14 providers: Gemini, Claude, OpenAI, DeepSeek, Grok, Qwen (global and mainland),
  Kimi, GLM, MiniMax, Mistral, Groq, OpenRouter, SiliconFlow
- Model lists are pulled from your own account, so they never go stale
- Free chat with direct data actions (add to cart, save recipe, etc.)

Everything runs in the browser, so a provider only works if its API sends CORS
headers. All of the above do, with one exception: OpenAI's `/chat/completions`
does not, so browser calls to it fail. Use OpenRouter if you want GPT models.

### 🔄 Real-time Multi-device Sync (optional, off by default)
- Powered by Firebase Realtime Database
- Room code system — share an invite link or let them scan a QR code
- Operation history with one-tap undo

The QR code is drawn on your own device. The room code is the only credential
guarding your data, so it is never sent to a third-party QR service. The invite
link keeps the code after the `#`, which browsers never send to a server.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla JS + Tailwind CSS |
| Sync | Firebase Realtime Database |
| AI | 14 providers, OpenAI-compatible / Anthropic / Gemini protocols |
| Hosting | GitHub Pages (PWA) |
| Build | Single HTML file, zero build tools |

---

## Install as App (PWA)

**Android:** Open in Chrome → Menu → Add to Home Screen

**iOS:** Open in Safari → Share → Add to Home Screen

**Windows / Mac:** Open in Chrome/Edge → Install icon in address bar

---

## Getting Started

1. Open https://alanine4.github.io/home-manager/
2. Go to **Settings** → paste your AI API Key
3. Start using it

Everything is stored on your device. Nothing leaves the browser until you set up
sync yourself, which is the next section.

---

## Run your own copy

This repo contains no Firebase credentials, mine or anyone else's, so a fork
cannot accidentally write to someone else's database. Each deployment supplies
its own.

1. Fork this repo and turn on GitHub Pages for it.
2. Open your site. It works right away, storing everything locally.

There is no third step. All paths are relative, so renaming the repo needs no
code changes.

That is enough for one device. To sync between phone and laptop, or with someone
you live with:

3. Create a project at console.firebase.google.com and add a Realtime Database.
4. In Project settings, copy the web app config snippet.
5. In the app, go to **Settings → Cloud sync** and paste it. The whole snippet
   works, whether it is JSON or the `const firebaseConfig = {...}` form.
6. Paste `database.rules.json` from this repo into Firebase console → Realtime
   Database → Rules, then publish.
7. On your other device, open the **invite link** (or scan the QR code) from
   Settings → Room Code. It only needs step 5 done first.

The Firebase SDK is only loaded once you have pasted a config. Without one, the
page makes no outbound requests at all, from open to close.

The config lives in your browser's localStorage, never in the repo and never in
the synced data. You edit no code, so pulling updates from upstream will not
conflict.

Want a single session to stay local even though sync is configured? Add
`?mode=local` to the URL — useful on someone else's device.

There is no build step. The whole app is one HTML file plus two vendored
libraries in `vendor/`.

## Security notes

The room code is the only thing protecting your data. Firebase rules let anyone
who knows a code read and write that room, and there is no way to revoke access
or remove someone once they have it. Nobody can list what rooms exist, so a code
you keep private stays private. Treat it like a password: don't put it in a
screenshot or a public post.

Your AI API key and your Firebase config are both stored in `localStorage` on
each device and are never synced or committed. Every device needs its own copy
of each.

If you want real per-user isolation, the next step is Firebase anonymous auth plus
a member list per room, and rules that check `auth.uid` against it. This app
doesn't do that yet.

## License

MIT. See [LICENSE](LICENSE).

## Design goals

Lightweight, practical, mobile-first. Open it and use it: no account, no
dependencies, no build tooling. Your data stays on your device unless you
choose otherwise.

## Contributing

Issues and pull requests are welcome. Two things worth knowing before you
change anything:

- Tailwind ships in `vendor/`, not from a CDN, so class names work directly with
  no build and the app still renders when offline. Anything added to `vendor/`
  must also go into the `SHELL` list in `sw.js`, or it will be missing offline
- User data must go through `esc()` before it is put into HTML, and through
  `jsArg()` for inline event handler arguments (both are near the top of
  index.html). Missing one is an XSS hole
- Adding an AI provider means adding one entry to the `PROVIDERS` registry;
  the call logic does not need to change

---

---

# Home Manager 🏠

> 合住家庭的购物清单、食物库存和食谱管理。单个 HTML 文件，无构建步骤，不用注册。

**🔗 在线体验：** https://alanine4.github.io/home-manager/

---

## 这是什么

合住的人常常重复买同一样东西，忘记柜子里已经有了，做到一半才发现缺料。这个应用
管三件事：家里有什么、还要买什么、用现有库存今天能做哪几道菜。

它就是一个 HTML 文件。打开就能用，数据存在浏览器里。填个 AI Key 可以拍小票录入和
自然语言输入，配上 Firebase 可以多设备同步——两样都是可选的，不填也不影响使用。

---

## 功能

### 🛒 购物车
- 按商店（Colruyt / Carrefour / Lidl）或分类分组
- 勾选已买 → 一键批量入库存
- AI 自然语言输入（"我要买番茄和猪肉"）

### 📦 食物库存
- 分类管理，支持折叠 / 排序 / 置顶
- 条形码扫描自动录入（Open Food Facts 数据库）
- 拍小票 / 上传图片 → AI 自动识别（支持荷文 / 法文 / 英文等所有语言）
- 语音输入

### 🍳 食谱
- 食谱库，自动显示当前库存能满足几种食材
- 一键把缺货食材加入购物车
- AI 根据当前库存推荐今天能做什么菜

### 🏠 家居必备
- 独立管理洗护 / 清洁 / 家居用品
- 低库存自动提醒
- 与食物库存完全分开

### 🤖 AI 助手
- 14 家服务商：Gemini、Claude、OpenAI、DeepSeek、Grok、通义千问（国际站 / 大陆）、
  Kimi、智谱 GLM、MiniMax、Mistral、Groq、OpenRouter、硅基流动
- 模型清单从你自己的账号拉取，不会过期
- 自由对话，可直接操作数据（加购物车、保存食谱等）

整个应用跑在浏览器里，所以服务商的接口必须返回 CORS 头才能用。上面这些都可以，
只有一个例外：OpenAI 的 `/chat/completions` 不返回，浏览器直连会失败。
想用 GPT 就走 OpenRouter 转发。

### 🔄 多设备实时同步（可选，默认关闭）
- Firebase Realtime Database 驱动
- 房间码机制：发条邀请链接，或者让对方扫个二维码
- 操作历史记录 + 一键撤销

二维码是在你自己设备上画的。房间码是保护你数据的唯一凭证，所以绝不会送去
第三方的二维码服务。邀请链接把房间码放在 `#` 后面，浏览器不会把它发给服务器。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vanilla JS + Tailwind CSS |
| 数据同步 | Firebase Realtime Database |
| AI | 14 家服务商（OpenAI 兼容 / Anthropic / Gemini 三种协议）|
| 部署 | GitHub Pages (PWA) |
| 包装 | 单文件 HTML，无构建工具 |

---

## 安装为 App（PWA）

**Android：** Chrome 打开链接 → 菜单 → 添加到主屏幕

**iOS：** Safari 打开链接 → 分享 → 添加到主屏幕

**Windows / Mac：** Chrome/Edge 打开链接 → 地址栏右侧安装图标

---

## 使用

1. 打开 https://alanine4.github.io/home-manager/
2. 进入**设置** → 填入 AI API Key
3. 开始用

数据都存在你自己设备上。不主动配置同步，就什么都不会离开浏览器。

---

## 自己部署一份

这个仓库里没有任何人的 Firebase 配置，我的也没有，所以 fork 之后不可能误写到
别人的数据库。每个部署各自填自己的。

1. Fork 这个仓库，给它打开 GitHub Pages。
2. 打开你的站点，直接就能用，数据存在本地。

没有第 3 步。路径全是相对的，仓库改名也不用动代码。

一台设备用到这里就够了。想在手机和电脑之间同步，或者和同住的人共享：

3. 去 console.firebase.google.com 建项目，加一个 Realtime Database。
4. 在项目设置里复制网页应用的配置。
5. 回到应用，**设置 → 云同步**，整段粘进去。JSON 或者控制台给的
   `const firebaseConfig = {...}` 都认。
6. 把仓库里的 `database.rules.json` 粘到 Firebase 控制台 → Realtime Database →
   规则，发布。
7. 在另一台设备上打开**设置 → 房间码**里的邀请链接，或者直接扫二维码。
   那台设备也要先做完第 5 步。

**Firebase SDK 只在你粘了配置之后才加载。** 没配置的话，这个页面从打开到关闭
不会向外发出任何一个请求。

配置存在浏览器的 localStorage 里，不进仓库，也不进同步的数据。因为你一行代码都
没改，以后拉上游更新不会冲突。

配了同步但想临时用纯本地（比如在别人电脑上）？网址后面加 `?mode=local`，
这一次就不连云。

没有构建步骤，整个应用就是一个 HTML 文件，外加 `vendor/` 里两个第三方库。

## 安全说明

房间码是保护你数据的唯一一道门。Firebase 规则允许任何知道房间码的人读写那个房间，
而且没有踢人、也没有撤销的办法。好消息是别人列举不出有哪些房间，所以只要码不外泄
就是安全的。把它当密码看：别截图发出去，别贴在公开的地方。

AI 的 API Key 和 Firebase 配置都存在每台设备各自的 `localStorage` 里，既不会
同步到云端，也不在仓库里。所以每台设备都要各填一次。

要做真正的按人隔离，下一步是 Firebase 匿名登录加房间成员名单，规则里校验
`auth.uid` 是否在名单内。目前这个应用还没做。

## 许可

MIT，见 [LICENSE](LICENSE)。

## 设计取向

轻量、实用、手机优先。打开即用，不需要注册账号，不需要安装任何依赖，也不需要
构建工具。所有数据默认留在你自己的设备上。

## 参与

欢迎 issue 和 PR。改动前有两件事值得知道：

- Tailwind 放在 `vendor/` 里而不是 CDN，直接写类名，没有编译步骤，断网也不裂。
  往 `vendor/` 加东西必须同时加进 `sw.js` 的 `SHELL` 清单，否则离线时会缺文件
- 拼 HTML 时用户数据必须过 `esc()`，事件处理器参数用 `jsArg()`（见 index.html
  顶部的工具函数）——漏一处就是一个 XSS
- 新增 AI 服务商只要往 `PROVIDERS` 注册表加一条，不用碰调用逻辑
