// App-shell cache for offline support. Network-first with a 3 second limit for the shell and page loads: a device
// with a good connection gets the latest deploy; on a weak or dead connection the cached copy opens instead of
// a blank wait. Trade-off: on a weak connection an older cached shell may open once, while the slow network
// response still lands in the cache in the background, so the next launch gets the latest.
// The {cache:'reload'} below forces a real network hit even when the browser's own HTTP cache
// (GitHub Pages sends Cache-Control: max-age=600) would otherwise still consider a stale copy fresh.
//
// IMPORTANT: browsers only know a new version of this app exists by byte-diffing THIS FILE. index.html
// changing on its own is not a signal to anyone — so bump CACHE_VERSION on every deploy you want
// existing installs to notice (which, in practice, means every deploy). Skipping this means installed
// users can sit on an old cached shell indefinitely with no "update available" banner ever appearing,
// even though network-first would otherwise have served them the latest index.html on their next visit.
// RELEASE: bump this together with BUILD_ID in index.html (they must be equal; scripts/check.sh checks it).
const CACHE_VERSION = 'liftlog-v71';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './favicon-32.png', './apple-touch-icon.png'];

self.addEventListener('install', e=>{
  self.skipWaiting();
  // addAll is all-or-nothing, so if it fails fall back to caching each file on its own;
  // one bad file then does not block the rest.
  e.waitUntil(caches.open(CACHE_VERSION).then(c=>
    c.addAll(SHELL).catch(()=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{}))))
  ).catch(()=>{}));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_VERSION).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

const SHELL_TIMEOUT_MS=3000;
const cachedShell=req=>caches.match(req).then(hit=>hit||caches.match('./index.html'));

self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  const isShell=e.request.mode==='navigate' || (url.origin===self.location.origin && SHELL.some(f=>new URL(f,self.location).href===url.href));
  const net=fetch(e.request,{cache:'reload'}).then(res=>{
    // Only keep good responses (opaque ones, e.g. cross-origin images, have status 0 and are fine).
    if(res.ok || res.type==='opaque'){
      const copy=res.clone();
      caches.open(CACHE_VERSION).then(c=>c.put(e.request,copy)).catch(()=>{});
    }
    return res;
  });
  if(!isShell){
    e.respondWith(net.catch(()=>cachedShell(e.request)));
    return;
  }
  // Shell and page loads: wait at most SHELL_TIMEOUT_MS for the network, then serve the cached copy. The request
  // keeps running, so a slow response still refreshes the cache for the next launch (waitUntil keeps the worker alive).
  e.waitUntil(net.catch(()=>{}));
  const slow=new Promise(r=>setTimeout(()=>r(null),SHELL_TIMEOUT_MS));
  e.respondWith(
    Promise.race([net.catch(()=>null),slow]).then(res=>res||
      // no response in time (or offline): cached copy; with nothing cached yet, keep waiting on the network
      cachedShell(e.request).then(hit=>hit||net)
    )
  );
});
