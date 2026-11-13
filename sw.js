/* Deal Matcher offline support: always try the network first, fall back to the last copy saved on this device. */
const CACHE='deal-matcher-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./deals.json'])).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin) return;
  /* the app page and the weekly data must never come from the browser's 10-minute cache, or a fresh upload looks like it did not take */
  const fresh=e.request.mode==='navigate'||u.pathname.endsWith('/')||/\.(html|json)$/.test(u.pathname);
  e.respondWith(
    fetch(fresh?new Request(e.request.url,{cache:'no-cache'}):e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r})
      .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./')))
  );
});
