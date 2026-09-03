# Home Manager 🏠

> What's in the house, what still needs buying, what you can cook tonight.
> One HTML file, no account, and by default your data never leaves your device.

**Live demo:** https://alanine4.github.io/home-manager/ ｜ **中文:** [README.zh-CN.md](README.zh-CN.md)

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

## How to use it

### Just open the URL

https://alanine4.github.io/home-manager/

Add it to your home screen and it looks and behaves like an app — and **once
installed it keeps working with no network**.

- **Android:** open in Chrome → menu → Add to Home Screen
- **iOS:** open in Safari → Share → Add to Home Screen
- **Windows / Mac:** open in Chrome/Edge → install icon in the address bar

Everything is stored on your device. Nothing leaves the browser until you set up
sync yourself.

### Or clone the repo and open index.html directly

That works too, and the interface renders correctly. But browsers refuse to
register a Service Worker over `file://`, so you get no app install and no
offline cache, and camera and microphone permissions are restricted as well.
For the full thing, use the URL above.

---

## Capability matrix

| Capability | Online | Installed, offline | `index.html` via `file://` |
|---|:---:|:---:|:---:|
| Cart / inventory / recipes / supplies | ✅ | ✅ | ✅ |
| Local storage, JSON export / import | ✅ | ✅ | ✅ |
| Styling | ✅ | ✅ | ✅ |
| Install as app, offline cache | ✅ | ✅ | — |
| Barcode scanning | Chrome / Edge / Android | scans, but no product lookup | permission-restricted |
| Voice input | ✅ | — needs network | permission-restricted |
| Receipt photo / image AI | ✅ | — needs network | needs network |
| AI assistant | ✅ | — needs network | needs network |
| Cloud sync | once configured | — needs network | once configured |
| No third-party requests when sync is off | ✅ | ✅ | ✅ |

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
- Low-stock alerts, fully independent from food inventory

### 🤖 AI Assistant (optional)
- 14 providers: Gemini, Claude, OpenAI, DeepSeek, Grok, Qwen (global and mainland),
  Kimi, GLM, MiniMax, Mistral, Groq, OpenRouter, SiliconFlow
- Model lists are pulled from your own account, so they never go stale
- Free chat with direct data actions (add to cart, save recipe, etc.)

### 🔄 Multi-device Sync (optional, off by default)
- Powered by Firebase Realtime Database
- Room code system — share one code with your partner
- Operation history with one-tap undo

---

## Where your data lives

By default everything sits in the browser's localStorage, including your AI key
and Firebase config. Nothing is uploaded, nothing is committed, and none of it
goes into the synced data.

**Which also means: clearing browser data clears your inventory.** Right now the
only reliable backup is **Settings → Data → Export**, saving a JSON file
somewhere yourself.

Known ways to lose it:
- Clearing browser cache / site data by hand
- Switching browsers or devices
- On iOS, not opening Safari for a long stretch — the system may evict site data

Automatic backup is not built yet; it is item 2 in [ROADMAP.md](ROADMAP.md).

---

## Cloud sync (optional, off by default)

Without it the app works fully, it just does not cross devices. Only turning it
on needs Firebase.

1. Create a project at console.firebase.google.com and add a Realtime Database
2. In Project settings, copy the web app config snippet
3. In the app, go to **Settings → Cloud sync** and paste it — the whole snippet
   works, whether it is JSON or the `const firebaseConfig = {...}` form
4. Paste `database.rules.json` from this repo into Firebase console → Realtime
   Database → Rules, then publish
5. Repeat step 3 on your other devices, then share your **room code**

**The Firebase SDK is only loaded once you have pasted a config.** Without one,
the page makes no third-party request at all, from open to close.

Configured sync but want one session to stay local anyway (on someone else's
computer, say)? Add `?mode=local` to the URL. The config stays put.

The config lives in your browser's localStorage, never in the repo and never in
the synced data. You edit no code, so pulling updates from upstream will not
conflict.

---

## Run your own copy

This repo contains no Firebase credentials, mine or anyone else's, so a fork
cannot accidentally write to someone else's database. Each deployment supplies
its own.

1. Fork this repo and turn on GitHub Pages for it
2. Open your site — it works right away

There is no third step. All paths are relative, so renaming the repo needs no
code changes.

---

## Stack and limits

**Stack:** vanilla HTML / CSS / JavaScript, Tailwind CSS, Firebase Realtime
Database, Open Food Facts, the BarcodeDetector API, the Web Speech API, GitHub
Pages. One HTML file plus a vendored Tailwind in `vendor/`. No build tooling.

**Limits, stated plainly:**

- **The room code is the only thing protecting your data.** Anyone who knows a
  code can read and write that room, and there is no way to revoke access or
  remove someone. Nobody can list what rooms exist, so a code you keep private
  stays private. Treat it like a password: not in a screenshot, not in a public
  post.
- Your AI API key and Firebase config are stored in `localStorage` on each
  device and are never synced or committed. Every device needs its own copy.
- Everything runs in the browser, so a provider only works if its API sends CORS
  headers. All of the listed ones do, with one exception: OpenAI's
  `/chat/completions` does not, so browser calls to it fail. Use OpenRouter if
  you want GPT models.
- **Sync pushes the whole dataset, it does not merge field by field.** If two
  people edit the same thing at once, the later save wins. Fine for groceries,
  not for heavy concurrent editing.
- localStorage is not a backup. Export regularly.
- Barcode scanning needs the browser's `BarcodeDetector` — Chrome / Edge /
  Android today, not Safari.
- Voice input needs the Web Speech API, which requires a network: the browser
  ships the audio to its vendor's servers for recognition.

---

## FAQ

**Do I need to be online?**
No. Once you have opened it from the home screen at least once, it works with
no network. Only the AI features and cloud sync need one.

**Do I need an AI key?**
No. Everything works with manual entry; the AI just makes entry faster.

**If I fork this, will it connect to your database?**
No. There is no Firebase config in the repo. Your deployment only talks to the
one you paste in yourself.

**How do I move to a new phone or computer?**
Export JSON from Settings and import it on the new device. Or turn on cloud
sync and use the same room code on both.

**What if my room code leaks?**
Switch to a new room code in Settings and push your data there. The old room's
data stays in the cloud, but you stop using it.

**Why is there no account system?**
Because that needs a server I would have to run, and the whole point of this app
is that it does not. The room code is the compromise between "no account" and
"two people can share a list". That decision gets revisited once there are
actual users — the reasoning is in [ROADMAP.md](ROADMAP.md).

---

## What's next

See [ROADMAP.md](ROADMAP.md). It also records what was decided **against**, and
why.

---

## License

MIT. See [LICENSE](LICENSE).

---

## Design goals

Lightweight, practical, mobile-first. Open it and use it: no account, no
dependencies, no build tooling. Your data stays on your device unless you
choose otherwise.

---

## Contributing

Issues and pull requests are welcome. Three things worth knowing before you
change anything:

- Tailwind ships in `vendor/`, not from a CDN, so class names work directly with
  no build and the app still renders offline. Anything added to `vendor/` must
  also go into the `SHELL` list in `sw.js`, or it will be missing offline
- User data must go through `esc()` before it is put into HTML, and through
  `jsArg()` for inline event handler arguments (both are near the top of
  `index.html`). Missing one is an XSS hole
- Adding an AI provider means adding one entry to the `PROVIDERS` registry;
  the call logic does not need to change
