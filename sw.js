// App-shell cache for offline support. Network-first: always try the network so a device that's
// online gets the latest deploy; only fall back to the cache when the network is unavailable.
// The {cache:'reload'} below forces a real network hit even when the browser's own HTTP cache
// (GitHub Pages sends Cache-Control: max-age=600) would otherwise still consider a stale copy fresh.
//
// IMPORTANT: browsers only know a new version of this app exists by byte-diffing THIS FILE. index.html
// changing on its own is not a signal to anyone — so bump CACHE_VERSION on every deploy you want
// existing installs to notice (which, in practice, means every deploy). Skipping this means installed
// users can sit on an old cached shell indefinitely with no "update available" banner ever appearing,
// even though network-first would otherwise have served them the latest index.html on their next visit.
const CACHE_VERSION = 'liftlog-v68';
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

self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    fetch(e.request,{cache:'reload'}).then(res=>{
      // Only keep good responses (opaque ones, e.g. cross-origin images, have status 0 and are fine).
      if(res.ok || res.type==='opaque'){
        const copy=res.clone();
        caches.open(CACHE_VERSION).then(c=>c.put(e.request,copy)).catch(()=>{});
      }
      return res;
    }).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html')))
  );
});
