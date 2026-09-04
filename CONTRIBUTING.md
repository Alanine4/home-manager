# 给改代码的人 · Notes for contributors

用户看的说明在 [README.md](README.md)。这里是动代码之前该知道的事。
*(English summary at the bottom.)*

---

## 结构

整个应用就是 `index.html` 一个文件，加上：

| 文件 | 干什么的 |
|---|---|
| `vendor/tailwind.js` | Tailwind，放在仓库里而不是 CDN，断网才不裂 |
| `sw.js` | Service Worker，预缓存外壳、网络优先、断网回退 |
| `manifest.json` | PWA 清单，路径全是相对的 |
| `database.rules.json` | 用户自己粘到 Firebase 控制台的规则 |

没有构建步骤，没有 `package.json`，没有 `node_modules`。请保持这样。

## 本地跑

```bash
python3 -m http.server 5173
# 打开 http://127.0.0.1:5173/
```

不要直接双击 `index.html`：`file://` 下 Service Worker 注册会抛 `SecurityError`
（实测），装不了 PWA 也没有离线缓存；摄像头和麦克风权限也普遍受限。
`127.0.0.1` 被浏览器当作安全上下文，等于免费拿到 https 的待遇。

## 主题与图标（两条铁律）

**1. 界面上不用 emoji，只用 Lucide 线性图标。** 页面顶部 `<body>` 里有一个内联的 SVG
sprite（Lucide 子集，ISC 许可），每个图标是一个 `<symbol id="i-名字">`。用法：

```html
<svg class="ico" aria-hidden="true"><use href="#i-shopping-cart"/></svg>
```
```js
icon('shopping-cart', 'w-4 h-4')   // JS 模板里用这个 helper
```

`.ico` 的大小跟字号、颜色跟文字（`currentColor`）。要新图标就去 lucide.dev 复制
路径加一个 `<symbol>`，别引第二套图标库，别用 emoji 顶替。

**2. 分类和商店的图标是数据，不是界面。** 分类存 `icon`（`CATEGORY_ICONS` 里的名字）
和 `color`（`CAT_COLORS` 里的色号），渲染用 `catIcon(key, 'md'|'sm')`——线性图标坐在
同色系淡色底托里（tinted container）。商店只有 `color`，渲染用 `storeDot()` /
`storeBadge()`。用户只能从 `IconPicker` 里选，所以永远不会混进 emoji。
老数据里的 emoji 由 `normalizeIconData()` 在读档和云端拉取时自动迁移。

**主题**：灰底（`--bg`）白卡（`--tile`），靠明度差分层，**卡片不描边**、无投影、
12px 圆角、灰阶三档、**只有一个强调色**（`--accent`）。design tokens 在 `<style>`
开头的 `:root` / `.dark`。卡片用 `.bento-tile` 或 `.item-card`；输入框是填充式的
（卡片里灰底、页面上白底），有一条全局规则管着，标记里不用再写 `border`。主按钮用
`bg-blue-600`（映射到 `--accent`），次按钮用 `.btn-secondary`，分段控件用
`.seg` / `.seg-on`，分组标题用 `.section-hdr`（15px 粗体，数量放 `.count` 里），
列表顶上的概览卡由 `Summary.render()` 生成。语义色只在有含义的地方出现：
红 = 低库存 / 删除，琥珀 = 待确认，绿 = 一切正常。**不要再给某个板块单独配色。**

## 改之前必须知道的四条

1. **拼 HTML 时用户数据必须过 `esc()`，写进内联事件处理器的参数必须过
   `jsArg()`。** 两个工具函数在 `index.html` 顶部。漏一处就是一个 XSS。
2. **往 `vendor/` 加任何文件，必须同时加进 `sw.js` 的 `SHELL` 清单**，否则装成
   PWA 后离线时缺文件。加完顺手把 `CACHE` 版本号升一位。
3. **第三方脚本不要写死在 `<head>`。** Firebase SDK 现在是 `loadFirebaseSdk()`
   运行时按需注入的，只有存在配置才加载——没配同步的人一个外部请求都不发。
   新的第三方脚本走同一个 `injectScript()`。
4. **房间码会直接拼进 Firebase 路径 `h/<code>`**，而 `. $ # [ ] /` 在那里是非法
   字符。任何外部来源的码（手输、链接、以后扫码）都要先过 `Cloud.validCode()`。

## 常见坑

- **手机上横向溢出。** `flex-1` 的 `<input>` 必须配 `min-w-0`：flex item 默认
  `min-width:auto`，等于输入框自己的固有宽度（约 20 字符），两个并排就撑出屏幕。
  装整行卡片的容器不能是 `flex` —— 行会被当成 flex item 按内容宽度撑开。
  改完在 390px 宽的视口下逐个 tab 看一眼 `document.documentElement.scrollWidth`
  是不是等于 390。
- **AI 服务商必须返回 CORS 头**才能在浏览器里直连。`PROVIDERS` 里列的都可以，
  唯一的例外是 OpenAI 的 `/chat/completions`，浏览器直连会失败，所以 README
  让用户走 OpenRouter。
- **同步是整份数据推送**（`Cloud._buildPayload`），不是逐条合并。两个人同时改
  同一样东西，后保存的覆盖前一个。
- Tailwind 的 Play CDN 版本在 `vendor/` 里，控制台会有一条 "should not be used
  in production" 的警告。知道就行，那是它对 CDN 用法的通用提醒。

## 加东西怎么加

- **新 AI 服务商**：往 `PROVIDERS` 注册表加一条，调用逻辑不用碰。
- **新分类 / 新商店**：`CATEGORIES` / `STORES`，用户自定义的走
  `State.customCategories` / `State.customStores`。
- **新的同步状态**：`Cloud._setStatus` 的 `map`，每个状态都要带一句给用户看的解释。

## 提交前

至少在 390px 宽的手机视口下把六个 tab 都点一遍，再拔网线（DevTools → Network →
Offline）刷新一次，确认样式还在。

---

## English summary

- One file, `index.html`, plus vendored Tailwind in `vendor/`, a Service Worker,
  and a PWA manifest. No build step, no `package.json` — keep it that way.
- Serve with `python3 -m http.server 5173`; don't open `index.html` via `file://`
  (Service Worker registration throws there).
- User data must go through `esc()` for HTML and `jsArg()` for inline handler
  arguments. Missing one is an XSS.
- Anything added to `vendor/` must also be listed in `SHELL` in `sw.js`, or it
  will be missing offline.
- Third-party scripts are injected at runtime via `injectScript()`, never
  hard-coded in `<head>`. Firebase only loads when a config exists.
- Room codes are interpolated into the Firebase path `h/<code>`; validate them
  with `Cloud.validCode()` first.
- `flex-1` inputs need `min-w-0`, and a container of full-width rows must not be
  `flex` — otherwise the settings page overflows horizontally on phones.
- OpenAI's `/chat/completions` has no CORS headers; the README tells users to go
  through OpenRouter for GPT models.
- No emoji in the UI. Icons come from the inline Lucide sprite
  (`<svg class="ico"><use href="#i-name"/></svg>` or `icon(name)`); categories
  store a Lucide name + colour and render via `catIcon()`, stores render a colour
  dot. Grey page, white borderless cards, filled inputs, one accent colour;
  semantic colours only for low stock / delete, needs confirming, all good.
