// 家庭购物管家 Service Worker
// 版本号改变时旧缓存自动清除
const CACHE = 'hsl-v1';
const SHELL = ['/home-manager/', '/home-manager/index.html'];

// 安装：预缓存主页面
self.addEventListener('install', e => {
  self.skipWaiting(); // 新版本立刻生效，不等标签页关闭
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {})
  );
});

// 激活：清理旧版本缓存
self.addEventListener('activate', e => {
  self.clients.claim();
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

// 网络优先策略：有网就取最新，断网才用缓存
self.addEventListener('fetch', e => {
  // 只处理同源请求（不拦截 Firebase / CDN）
  if (!e.request.url.startsWith(self.location.origin)) return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 拿到新版本，顺手更新缓存
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request)) // 断网时用缓存
  );
});
