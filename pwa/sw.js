const V='farmath-v1',CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||!/^https?:/.test(r.url))return;
  if(r.mode==='navigate'){e.respondWith(fetch(new Request(r.url,{cache:'no-store'})).then(x=>{const cp=x.clone();caches.open(V).then(c=>c.put('./index.html',cp));return x;}).catch(()=>caches.match('./index.html')));return;}
  e.respondWith(caches.match(r).then(h=>{const n=fetch(r).then(x=>{if(x&&(x.ok||x.type==='opaque')){const cp=x.clone();caches.open(V).then(c=>c.put(r,cp));}return x;}).catch(()=>h);return h||n;}));
});
