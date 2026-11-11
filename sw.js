// App-shell cache for offline support and a fast open. Cache-first for page loads (navigations) and the SHELL
// files: the cached copy is answered at once, with no wait on the network, and a silent background request then
// refreshes the cache so a later launch shows the newest deploy. There is no update banner and nothing ever
// reloads a running page; a deploy shows up one or two launches later (owner decision 2026-11-10).
// Background refreshes use {cache:'no-cache'} (a conditional request, a 304 costs almost nothing). Install uses
// {cache:'reload'} so the first copy is never a stale one from the browser's HTTP cache (GitHub Pages sends
// Cache-Control: max-age=600). If testing ever shows no-cache handing back a stale copy, change it to 'reload'.
//
// IMPORTANT: browsers only know a new version of this app exists by byte-diffing THIS FILE. index.html
// changing on its own is not a signal to anyone, so bump CACHE_VERSION on every deploy you want existing
// installs to pick up (in practice every deploy). sw.js itself is never answered from a cache or stored by this
// worker (no respondWith for it), so the browser's update check always reaches the network.
// RELEASE: bump this together with BUILD_ID in index.html (they must be equal; scripts/check.sh checks it).
const CACHE_VERSION = 'liftlog-v85';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './favicon-32.png', './apple-touch-icon.png'];
const INDEX = new URL('./index.html', self.location).href;
const ROOT = new URL('./', self.location).href;

// './' and './index.html' are always stored from ONE response so the two copies are byte-identical.
// A page-shell response (index.html and './') is stored only if it is OK and really HTML, so a captive-portal or
// error page can never replace the cached app. Other shell files (manifest, icons) need only res.ok.
const goodShell = (url, res) => res.ok && !res.redirected &&
  ((url!==INDEX && url!==ROOT) || (res.headers.get('content-type')||'').toLowerCase().startsWith('text/html'));
const putShell = (cache, url, res) => {
  if(url===INDEX || url===ROOT) return Promise.all([cache.put(INDEX, res.clone()), cache.put(ROOT, res.clone())]);
  return cache.put(url, res);
};

self.addEventListener('install', e=>{
  self.skipWaiting();
  // Fetch each file past the HTTP cache. index.html is required: if it cannot be fetched and stored the install
  // rejects, the browser discards this worker, and the previous worker and cache keep serving. The rest is best-effort.
  e.waitUntil(caches.open(CACHE_VERSION).then(async c=>{
    try{
      const res=await fetch(INDEX,{cache:'reload'});
      if(!goodShell(INDEX,res)) throw new Error('index.html '+res.status);
      await putShell(c, INDEX, res);
    }catch(err){
      // Leave no empty cache behind (but never touch one that already holds a usable index.html).
      if(!(await c.match(INDEX))) await caches.delete(CACHE_VERSION);
      throw err;
    }
    await Promise.all(SHELL.map(f=>new URL(f,self.location).href).filter(u=>u!==INDEX && u!==ROOT).map(u=>
      fetch(u,{cache:'reload'}).then(r=>goodShell(u,r)?putShell(c,u,r):null).catch(()=>{})
    ));
  }));
});

self.addEventListener('activate', e=>{
  // Old caches go only here, and only after install proved this cache holds a usable index.html.
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_VERSION).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

// Silent refresh of one shell URL; stores only a good response, swallows every failure.
const refresh = url => fetch(url,{cache:'no-cache'}).then(res=>{
  if(!goodShell(url,res)) return;
  return caches.open(CACHE_VERSION).then(c=>putShell(c,url,res));
}).catch(()=>{});

self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.origin===self.location.origin && url.pathname.endsWith('/sw.js')) return; // never answered or stored by the worker
  const isNav=e.request.mode==='navigate';
  const isShell=isNav || (url.origin===self.location.origin && SHELL.some(f=>new URL(f,self.location).href===url.href));
  if(!isShell){
    // Other requests (for example cross-origin images): network first, remembered, cached copy only if the network fails.
    const net=fetch(e.request,{cache:'reload'}).then(res=>{
      if(res.ok || res.type==='opaque'){
        const copy=res.clone();
        caches.open(CACHE_VERSION).then(c=>c.put(e.request,copy)).catch(()=>{});
      }
      return res;
    });
    e.respondWith(net.catch(()=>caches.match(e.request).then(hit=>hit||net).catch(()=>net)));
    return;
  }
  // Shell: cached copy first, then refresh in the background. Any cache error or miss falls through to the network.
  e.waitUntil(refresh(isNav ? INDEX : url.href));
  e.respondWith(
    caches.open(CACHE_VERSION)
      .then(c=>c.match(isNav ? INDEX : e.request))
      .then(hit=>hit && hit.ok ? hit : fetch(e.request))
      .catch(()=>fetch(e.request))
  );
});
