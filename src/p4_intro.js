/* ---------- Farmath p4: story slides, character creator, farm tour ---------- */
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const stScene = new THREE.Scene(), stCam = new THREE.PerspectiveCamera(40, 1, .5, 200);
const stHemi = new THREE.HemisphereLight(0xffffff, 0xb8d89a, .95), stDir = new THREE.DirectionalLight(0xfff0d2, .8);
stDir.position.set(-5, 10, 8); stScene.add(stHemi, stDir);
let stCamFn = null, stRoot = null, stUpd = null, stT = 0, stOn = false, stBack = null, stLook = [0, 1.2, 0], stW = 15, stHh = 9, stOff = .12;
const ST_BG = ['#bfe8ff', '#d6f0b8', '#ffe8c4', '#fff0b8'];

function stPlat(g, w, d) { V(g, 0x7ccf5b, w, .5, d, 0, -.5, 0, false); V(g, 0x9b6b43, w, .9, d, 0, -1.4, 0, false); V(g, 0x7d5636, w - .8, .8, d - .8, 0, -2.2, 0, false); }
function stTree(g, x, z, s) { const t = new THREE.Group(); t.position.set(x, 0, z); t.scale.setScalar(s || 1); g.add(t); V(t, 0x8a5a33, .5, 1.3, .5, 0, 0, 0, false); V(t, 0x3fa34d, 1.9, .9, 1.9, 0, 1.1, 0, false); V(t, 0x4cb85a, 1.4, .8, 1.4, 0, 1.9, 0, false); V(t, 0x57c765, .9, .7, .9, 0, 2.6, 0, false); V(t, 0xe53935, .2, .2, .2, .7, 1.4, .98, false); }
function stBarn(g, x, z) { const b = new THREE.Group(); b.position.set(x, 0, z); g.add(b); V(b, 0xc44536, 2.8, 1.8, 2.2, 0, 0, 0, false); V(b, 0xf2e6d0, 1, 1.2, .06, 0, 0, 1.12, false); V(b, 0x8c2f25, 3.1, .22, 2.6, 0, 1.8, 0, false); V(b, 0x8c2f25, 2.3, .22, 2.1, 0, 2.02, 0, false); V(b, 0x8c2f25, 1.5, .22, 1.7, 0, 2.24, 0, false); }
function stClouds(g) { return [0, 1, 2].map(i => { const q = new THREE.Group(); q.position.set(0, 6 + i * .7, -5 - i); g.add(q); V(q, 0xffffff, 2.4, .6, 1.2, 0, 0, 0, false); V(q, 0xffffff, 1.5, .5, 1, .6, .4, 0, false); return q; }); }
function stSun(g) { const s = new THREE.Group(); s.position.set(6, 6.4, -5); g.add(s); V(s, 0xffe27a, 1.4, 1.4, 1.4, 0, 0, 0, false); return s; }
function stFlowers(g, n, w, d) { const cols = [0xff7aa8, 0xffe066, 0xffffff, 0xc9a0ff]; for (let i = 0; i < n; i++) { const x = (Math.sin(i * 12.9) * .5) * w, z = (Math.cos(i * 7.7) * .5) * d + 1; V(g, 0x3f9e4a, .05, .2, .05, x, 0, z, false); V(g, cols[i % 4], .16, .1, .16, x, .2, z, false); } }
const stFace = e => { e.g.rotation.y = 0; return e; };

const ST_SCENES = [
  g => { stPlat(g, 14, 9); stBarn(g, -3.8, -2.2); stTree(g, 4.8, -2.6); stTree(g, 5.8, -.4, .9); stFlowers(g, 24, 12, 6);
    const k = stFace(makeElder('k')), n = stFace(makeElder('n')); k.g.position.set(-1.3, 0, 1.4); n.g.position.set(1.3, 0, 1.4); k.g.scale.setScalar(1.35); n.g.scale.setScalar(1.35); g.add(k.g, n.g);
    const cl = stClouds(g), sun = stSun(g);
    return (dt, t) => { k.wave = 1; n.wave = 1; stepElder(k, dt, t); stepElder(n, dt, t); cl.forEach((q, i) => q.position.x = ((t * .3 + i * 5.3) % 18) - 9); sun.rotation.y = t; }; },
  g => { stPlat(g, 14, 9); stTree(g, -5.6, -2.8); stFlowers(g, 16, 12, 6);
    V(g, 0x8a5a33, 7, .28, 3, 0, 0, -1.2, false);
    const crops = []; for (let i = 0; i < 10; i++) { const c = cropParts(i % 4).grown; c.position.set(-2.6 + (i % 5) * 1.3, .28, -1.9 + Math.floor(i / 5) * 1.3); c.scale.setScalar(1.5); g.add(c); crops.push(c); }
    const k = stFace(makeElder('k')); k.g.position.set(0, 0, 1.8); k.g.scale.setScalar(1.45); g.add(k.g);
    const can = makeWateringCan(); can.position.set(-3.4, 0, 1.6); can.scale.setScalar(1.5); g.add(can);
    return (dt, t) => { k.cheer = 1; stepElder(k, dt, t); crops.forEach((c, i) => c.position.y = .28 + Math.max(0, Math.sin(t * 3 + i)) * .12); }; },
  g => { stPlat(g, 14, 9); stTree(g, 5.8, -3);
    V(g, 0xe9d78f, 7.2, .06, 4.4, -1.6, 0, -1.2, false);
    for (let i = 0; i <= 7; i++) { V(g, 0xb98550, .16, .75, .16, -5.2 + i, 0, -3.4, false); } V(g, 0xcf9b60, 7.2, .1, .07, -1.6, .45, -3.4, false);
    const hens = [0, 1, 2].map(i => { const h = makeHen(); h.g.position.set(-3.6 + i * 1.7, 0, -1 + (i % 2) * .6); h.g.scale.setScalar(1.5); g.add(h.g); return h; });
    [[-3.2, .3], [-1.4, .9], [.2, .1]].forEach(p => { const e = makeEggItem(); e.position.set(p[0], 0, p[1]); e.scale.setScalar(1.3); g.add(e); });
    const st = new THREE.Group(); st.position.set(4.2, 0, .6); g.add(st);
    V(st, 0xc98e4f, 2.8, .85, .9, 0, 0, 0, false); [[-1.3, -.4], [1.3, -.4]].forEach(p => V(st, 0x8f5d2a, .14, 2, .14, p[0], 0, p[1], false));
    for (let i = 0; i < 6; i++) V(st, i % 2 ? 0xffffff : 0xe8473f, .5, .12, 1.5, -1.25 + i * .5, 2, -.1, false);
    const n = stFace(makeElder('n')); n.g.position.set(1.4, 0, 2.4); n.g.scale.setScalar(1.45); g.add(n.g);
    return (dt, t) => { n.wave = 1; stepElder(n, dt, t); hens.forEach((h, i) => { h.head.rotation.x = Math.max(0, Math.sin(t * 2 + i * 2)) * 1.2; }); }; },
  g => { stPlat(g, 14, 9); stBarn(g, 4.4, -2.4); stFlowers(g, 20, 12, 6);
    V(g, 0x8a5a33, 5.6, .28, 2.6, -1.6, 0, -1.4, false);
    const k = stFace(makeElder('k')), n = stFace(makeElder('n')); k.g.position.set(-1.2, 0, 1.8); n.g.position.set(1.2, 0, 1.8); k.g.scale.setScalar(1.4); n.g.scale.setScalar(1.4); g.add(k.g, n.g);
    const coins = [0, 1, 2].map(i => { const c = new THREE.Group(); g.add(c); V(c, 0xffd34d, .7, .7, .14, 0, 0, 0, false); V(c, 0xffe58a, .4, .4, .16, 0, .15, 0, false); c.position.set(-1.8 + i * 1.8, 3.4, -.6); return c; });
    return (dt, t) => { k.cheer = 1; n.cheer = 1; stepElder(k, dt, t); stepElder(n, dt, t); coins.forEach((c, i) => { c.rotation.y = t * 2.5 + i; c.position.y = 3.4 + Math.sin(t * 2 + i) * .3; }); }; }
];
/* ---- opening animation v3: sunrise -> crops grow -> farm animals -> pull back to the whole farm ---- */
function makeCow() {
  const g = new THREE.Group(), W = 0xfaf6ee, K = 0x3a3a40, P = 0xf4a6b4;
  [[-.28, -.5], [.28, -.5], [-.28, .5], [.28, .5]].forEach(p => V(g, W, .2, .5, .2, p[0], 0, p[1]));
  [[-.28, -.5], [.28, -.5], [-.28, .5], [.28, .5]].forEach(p => V(g, 0x2b2b2b, .22, .1, .22, p[0], 0, p[1], false));
  V(g, W, .9, .75, 1.5, 0, .45, 0); V(g, K, .94, .4, .5, 0, .66, -.4); V(g, K, .5, .78, .45, 0, .45, .3); V(g, P, .3, .12, .3, 0, .36, -.1, false);
  const tail = new THREE.Group(); tail.position.set(0, 1.15, -.76); g.add(tail); V(tail, W, .07, .55, .07, 0, -.55, 0, false); V(tail, K, .12, .14, .12, 0, -.68, 0, false);
  const head = new THREE.Group(); head.position.set(0, 1.0, .8); g.add(head);
  V(head, W, .56, .5, .5, 0, -.25, .1); V(head, P, .4, .25, .12, 0, -.25, .39); V(head, K, .1, .06, .04, -.1, -.1, .46, false); V(head, K, .1, .06, .04, .1, -.1, .46, false);
  V(head, 0x222222, .07, .07, .04, -.17, .05, .36, false); V(head, 0x222222, .07, .07, .04, .17, .05, .36, false);
  V(head, 0xf2e6c8, .08, .18, .08, -.2, .25, .08, false); V(head, 0xf2e6c8, .08, .18, .08, .2, .25, .08, false);
  V(head, W, .22, .08, .14, -.38, .02, .1, false); V(head, W, .22, .08, .14, .38, .02, .1, false);
  return { g, head, tail };
}
function makeChick() {
  const h = makeHen();
  h.g.traverse(m => { if (!m.isMesh) return; const c = m.material.color.getHex(); m.material = m.material.clone(); if (c === 0xffffff || c === 0xf0f0f0 || c === 0xeaeaea) m.material.color.setHex(0xffe45e); });
  h.g.scale.setScalar(.5); return h;
}
let opQuick = false;
ST_SCENES.push(g => {
  const ease = x => x * x * (3 - 2 * x), cl01 = x => Math.max(0, Math.min(1, x)), mix = (a, b, k) => a + (b - a) * k;
  const FX = [-4.2, -3.1, -2.0, -.9, .2], ROWZ = [-.5, .8], AISLE = .15, HOMEZ = 1.9;
  const canX = t => -4.4 + 5.1 * cl01((t - 2.7) / 2.3);
  const root = g; g = new THREE.Group(); root.add(g); const far = new THREE.Group(); root.add(far); /* g = the farm (hidden during the sunrise close-up), far = hills + sky things */
  stPlat(g, 14, 9); stTree(g, -5.9, -2.8); stFlowers(g, 22, 12, 6);
  /* far hills: the sun climbs from behind them */
  const hills = [];
  [[0, -9.5, 30, 1.9, 0x5fae52], [-7, -8.5, 12, 1.7, 0x56a24b], [8, -8.8, 12, 1.5, 0x66b659]].forEach(h => { const m = V(far, h[4], h[2], h[3], 3, h[0], -.5, h[1], false); m.material = m.material.clone(); hills.push({ m, c: new THREE.Color(h[4]) }); });
  const mill = new THREE.Group(); mill.position.set(5.6, 0, -3.5); g.add(mill);
  V(mill, 0xf2e6d0, 1.3, 2.1, 1.3, 0, 0, 0, false); V(mill, 0xc44536, 1.6, .6, 1.6, 0, 2.1, 0, false); V(mill, 0x8a5a33, .5, .9, .06, 0, 0, .66, false);
  const bl = new THREE.Group(); bl.position.set(0, 1.9, .85); mill.add(bl); V(bl, 0xf6efe0, .2, 2.7, .06, 0, -1.35, 0, false); V(bl, 0xf6efe0, 2.7, .2, .06, 0, -.1, 0, false); V(bl, 0xd9c7a0, .3, .3, .1, 0, -.15, 0, false);
  const cl = stClouds(far);
  /* the sun: glowing, with slowly turning rays */
  const sunG = new THREE.Group(); far.add(sunG);
  sunG.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), new THREE.MeshBasicMaterial({ color: 0xffe27a })));
  const glow = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.1, 1), new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: .35 })); glow.rotation.z = Math.PI / 4; sunG.add(glow);
  const rayG = new THREE.Group(); sunG.add(rayG);
  for (let i = 0; i < 8; i++) { const p = new THREE.Group(); p.rotation.z = i * Math.PI / 4; const r = new THREE.Mesh(new THREE.BoxGeometry(.16, 1, .1), new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: .55 })); r.position.y = 1.55; p.add(r); rayG.add(p); }
  /* birds crossing the sky */
  const birds = [0, 1, 2].map(i => { const b = new THREE.Group(), w1 = new THREE.Group(), w2 = new THREE.Group(); b.add(w1, w2); V(b, 0x3b3b4a, .2, .14, .3, 0, 0, 0, false); V(w1, 0x3b3b4a, .5, .04, .22, -.28, 0, 0, false); V(w2, 0x3b3b4a, .5, .04, .22, .28, 0, 0, false); far.add(b); return { b, w1, w2, i }; });
  /* the field */
  V(g, 0x8a5a33, 5.8, .28, 3, -2, 0, .15, false);
  const crops = [], mounds = [];
  ROWZ.forEach(z => FX.forEach((x, ci) => {
    const c = cropParts((ci + (z > 0 ? 2 : 0)) % 4).grown; c.position.set(x, .28, z); c.scale.setScalar(.001); g.add(c); crops.push({ c, x, z, i: crops.length });
    mounds.push(V(g, 0x6e4524, .45, .1, .45, x, .28, z, false));
  }));
  /* sparkle bits */
  const sg = new THREE.BoxGeometry(.13, .13, .13), sp = [];
  const spark = (x, y, z, cols, n, up, vx0) => { for (let i = 0; i < n; i++) { const m = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color: cols[i % cols.length], transparent: true })); m.position.set(x, y, z); g.add(m); sp.push({ m, vx: (Math.random() - .5) * 2.2 + (vx0 || 0), vy: (up || 2) + Math.random() * 1.6, vz: (Math.random() - .5) * 2.2, l: 0 }); } };
  /* the animal pen */
  V(g, 0xe9d78f, 3.8, .05, 4.2, 4.9, 0, .1, false);
  for (let i = 0; i <= 5; i++) V(g, 0xb98550, .16, .75, .16, 3.1 + i * .72, 0, -1.9, false);
  V(g, 0xcf9b60, 3.7, .1, .07, 4.9, .45, -1.9, false);
  for (let i = 0; i <= 3; i++) V(g, 0xb98550, .16, .75, .16, 3.0, 0, -1.9 + i * .9, false);
  V(g, 0xcf9b60, .07, .1, 2.7, 3.0, .45, -.55, false);
  const cow = makeCow(); cow.g.position.set(4.9, 0, -.8); cow.g.scale.setScalar(1.15); g.add(cow.g);
  const hens = [[3.9, 1.1], [5.1, .5], [5.9, 1.3]].map((p, i) => { const h = makeHen(); h.g.scale.setScalar(1.3); g.add(h.g); return { h, bx: p[0], bz: p[1], i }; });
  const chicks = [[4.3, .2], [4.7, 1.5], [5.5, 1.0], [3.7, 0]].map((p, i) => { const h = makeChick(); g.add(h.g); return { h, bx: p[0], bz: p[1], i }; });
  /* the grandparents */
  const k = makeElder('k'), n = makeElder('n'); k.g.scale.setScalar(1.5); n.g.scale.setScalar(1.5); g.add(k.g, n.g);
  const can = makeWateringCan(); can.scale.setScalar(1.5); g.add(can);
  n.g.position.set(5.9, 0, .3); V(n.armL, 0xc98e4f, .42, .2, .36, 0, -.78, .05, false);
  const bfs = [0, 1, 2].map(i => { const q = new THREE.Group(), w1 = new THREE.Group(), w2 = new THREE.Group(); q.add(w1, w2); const col = [0xff9ec4, 0xffd85e, 0xc9a0ff][i]; V(w1, col, .3, .02, .28, -.15, 0, 0, false); V(w2, col, .3, .02, .28, .15, 0, 0, false); g.add(q); return { q, w1, w2, i }; });
  const walk = (e, t, on) => {
    if (on) { const s = Math.sin(t * 12); e.legL.rotation.x = s * .7; e.legR.rotation.x = -s * .7; e.armL.rotation.x = -s * .6; e.armR.rotation.x = s * .6; e.armL.rotation.z = e.armR.rotation.z = 0; e.g.position.y = Math.abs(s) * .1; }
    else { e.legL.rotation.x = e.legR.rotation.x = e.armL.rotation.x = e.armR.rotation.x = 0; e.armL.rotation.z = e.armR.rotation.z = 0; e.g.position.y = 0; }
  };
  const turn = (e, to, dt) => { e.g.rotation.y += (to - e.g.rotation.y) * Math.min(1, dt * 9); };
  const cA = new THREE.Color('#2c3a78'), cB = new THREE.Color('#ff9a6b'), cC = new THREE.Color('#ffd9a0'), cD = new THREE.Color('#bfe8ff'), tint = new THREE.Color();
  let mooAt = 6.9, mooT = -9, tossT = 0;
  const MIXC = (a, b, k) => ({ p: [mix(a.p[0], b.p[0], k), mix(a.p[1], b.p[1], k), mix(a.p[2], b.p[2], k)], l: [mix(a.l[0], b.l[0], k), mix(a.l[1], b.l[1], k), mix(a.l[2], b.l[2], k)], off: mix(a.off, b.off, k) });
  const A0 = { p: [0, .6, 10], l: [0, 3.8, -6], off: 0 }, A1 = { p: [.4, .9, 10], l: [0, 4.2, -6], off: 0 };
  /* portrait screens are narrow, so the close-ups pull back a little to keep the subject in frame */
  const FF = () => Math.max(1, Math.sqrt(1.78 / (innerWidth / innerHeight)));
  const camB = cx => ({ p: [cx + .4, 1.05 + .35 * FF(), .2 + 5.8 * FF()], l: [cx + .4, 1.05, .2], off: 0 });
  const C0 = () => ({ p: [3.3, .85 + .45 * FF(), 5.8 * FF()], l: [3.3, .85, 0], off: 0 }), C1 = () => ({ p: [5.0, .9 + .45 * FF(), 5.8 * FF()], l: [5, .9, 0], off: 0 });
  stCamFn = (t, d) => {
    const W = { p: [Math.sin(t * .3) * 1.4, stLook[1] + 2.4, d], l: [0, stLook[1], 0], off: stOff };
    let c;
    if (t < 2.2) c = MIXC(A0, A1, ease(cl01(t / 2.2)));
    else if (t < 2.8) c = MIXC(A1, camB(canX(2.8)), ease((t - 2.2) / .6));
    else if (t < 5) c = camB(canX(t));
    else if (t < 5.7) c = MIXC(camB(canX(5)), C0(), ease((t - 5) / .7));
    else if (t < 7.3) c = MIXC(C0(), C1(), ease((t - 5.7) / 1.6));
    else if (t < 9.5) c = MIXC(C1(), W, ease((t - 7.3) / 2.2));
    else c = W;
    return { px: c.p[0], py: c.p[1], pz: c.p[2], lx: c.l[0], ly: c.l[1], lz: c.l[2], off: c.off };
  };
  return (dt, t) => {
    /* sky, light and hills warm up with the sunrise */
    stScene.background.copy(cA).lerp(cB, ease(cl01(t / 1.4))).lerp(cC, ease(cl01((t - 1.2) / 1.2))).lerp(cD, ease(cl01((t - 2.4) / 2.2)));
    const lt = ease(cl01(t / 2.4)); stHemi.intensity = mix(.4, .95, lt); stDir.intensity = mix(.25, .8, lt);
    hills.forEach(h => h.m.material.color.copy(h.c).multiplyScalar(mix(.4, 1, lt)));
    const kk = ease(cl01((t - 2.4) / 7)), ya = mix(-1.8, 3.6, ease(cl01(t / 2.3)));
    sunG.position.set(mix(0, 6, kk), mix(ya, 6.4, kk), mix(-7.5, -5, kk)); sunG.scale.setScalar(mix(4.2, 1, kk)); rayG.rotation.z = t * .25;
    cl.forEach((q, i) => q.position.x = ((t * .3 + i * 5.3) % 18) - 9); bl.rotation.z = t * 1.1;
    birds.forEach(o => { const x = ((t * 1.3 + o.i * 7) % 26) - 13; o.b.position.set(x, 4.6 + o.i * .7 + Math.sin(t * 2 + o.i) * .25, -6 - o.i); const f = Math.sin(t * 13 + o.i) * .7; o.w1.rotation.z = f; o.w2.rotation.z = -f; });
    /* Kakek: walks in, pours water along the row, sets the can down, comes to the front and waves, then paces */
    const cx = canX(t); let kon = false, kv = 0;
    g.visible = t > 2.0; k.g.visible = t > 1.5;
    if (t < 2.7) { k.g.position.set(mix(-8, cx - 1, cl01((t - 1.5) / 1.2)), 0, AISLE); turn(k, Math.PI / 2, 1); kon = t > 1.5 && t < 2.7; can.visible = true; }
    else if (t < 5) { k.g.position.set(cx - 1, 0, AISLE); turn(k, Math.PI / 2, 1); kon = true; can.visible = true; }
    else if (t < 6) { const u = ease(cl01((t - 5) / 1)); k.g.position.set(mix(canX(5) - 1, -2, u), 0, mix(AISLE, HOMEZ, u)); turn(k, 0, dt); kon = u < 1; can.visible = false; }
    else if (t < 9) { k.g.position.set(-2, 0, HOMEZ); turn(k, 0, dt); }
    else { const ph = (t - 9) * .45, vx = -Math.sin(ph); k.g.position.set(-3 + Math.cos(ph), 0, HOMEZ); kv = vx; kon = Math.abs(vx) > .3; turn(k, kon ? (vx > 0 ? Math.PI / 2 : -Math.PI / 2) : 0, dt); }
    walk(k, t, kon);
    if (t < 5) { k.armL.rotation.x = -1.35; can.position.set(k.g.position.x + 1.05, 1.25 + Math.sin(t * 6) * .03, k.g.position.z + .63); can.rotation.z = t > 2.7 ? -.65 + Math.sin(t * 7) * .1 : -.15; can.rotation.y = 0; }
    else { can.position.set(canX(5) - 1 + 1.0, 0, AISLE + .75); can.rotation.set(0, .3, 0); can.visible = t > 5; }
    if (!kon && t >= 5.8) { k.armR.rotation.z = 2.5 + Math.sin(t * 12) * .45; }
    if (t > 2.8 && t < 5 && Math.random() < .7) spark(can.position.x + .75, can.position.y - .1, can.position.z, [0x7fc8ff, 0xb9e4ff], 1, .2);
    /* Nenek tosses grain to the chicks */
    n.g.visible = t > 4.4; { const u = cl01((t - 4.4) / 1.2); n.g.position.x = mix(10, 5.9, ease(u)); const arriving = u < 1; walk(n, t, arriving); turn(n, arriving ? -Math.PI / 2 : -.35, dt);
      if (!arriving) { n.armL.rotation.x = -1.25; n.armR.rotation.x = -.7 + Math.sin(t * 6) * .6; tossT -= dt; if (tossT <= 0) { tossT = .7; spark(n.g.position.x - .6, 1.35, n.g.position.z + .5, [0xf3d45a, 0xffe9a8], 4, 1.2, -1.6); } } }
    /* crops pop up where the water reaches */
    crops.forEach(o => {
      const x = cl01((canX(t) - o.x + .35) / .9), s = x <= 0 ? .001 : Math.max(.001, 1.5 * (1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2)));
      o.c.scale.setScalar(s); mounds[o.i].visible = s < .4;
      if (x > 0 && !o.c.userData.pop) { o.c.userData.pop = 1; if (!opQuick) { spark(o.x, .6, o.z, [0xffe066, 0xffffff, 0x9be37f], 6, 2.2); if (o.z > 0) cue(() => SFX.pop(o.i % 5)); } }
      o.c.rotation.z = x >= 1 ? Math.sin(t * 2 + o.i) * .05 : 0;
    });
    for (let i = sp.length - 1; i >= 0; i--) { const p = sp[i]; p.l += dt; p.vy -= 5 * dt; p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt; const r = 1 - p.l / .8; p.m.scale.setScalar(Math.max(.01, r)); p.m.material.opacity = Math.max(0, r); if (p.l > .8) { g.remove(p.m); p.m.material.dispose(); sp.splice(i, 1); } }
    /* animals */
    hens.forEach(o => { const a = t * .7 + o.i * 2.1, x = o.bx + Math.sin(a) * .4, z = o.bz + Math.cos(a * .8) * .25, vx = Math.cos(a) * .4 * .7, vz = -Math.sin(a * .8) * .25 * .56; o.h.g.position.set(x, 0, z); o.h.g.rotation.y = Math.atan2(vx, vz); o.h.head.rotation.x = Math.max(0, Math.sin(t * 5 + o.i * 2)) * 1.1; });
    chicks.forEach(o => { const a = t * 1.5 + o.i * 1.7, x = o.bx + Math.sin(a) * .5, z = o.bz + Math.cos(a * .9) * .3, vx = Math.cos(a) * .75, vz = -Math.sin(a * .9) * .27; o.h.g.position.set(x, Math.abs(Math.sin(t * 9 + o.i)) * .05, z); o.h.g.rotation.y = Math.atan2(vx, vz); o.h.head.rotation.x = Math.max(0, Math.sin(t * 7 + o.i * 3)) * 1.2; });
    if (t > mooAt) { mooT = t; mooAt = t + 11; cue(SFX.moo); }
    const mt = t - mooT, raise = mt < 1.1 ? Math.sin(Math.min(1, mt / 1.1) * Math.PI) : 0;
    cow.head.rotation.x = .38 + Math.sin(t * 1.4) * .1 - raise * .75; cow.tail.rotation.z = Math.sin(t * 2.2) * .45; cow.g.position.y = raise * .03;
    bfs.forEach(o => { const a = t * .7 + o.i * 2.2; o.q.position.set(-2 + Math.sin(a) * 4.5, 1.6 + Math.sin(a * 2) * .4, 1.2 + Math.cos(a * .8) * 1.4); o.q.rotation.y = a; const f = Math.sin(t * 22) * .9; o.w1.rotation.z = f; o.w2.rotation.z = -f; });
  };
});
let opOn = false, opTimers = [];
/* browsers keep audio locked until the first touch, so cues only play once it is running (never a burst of late sounds) */
const cue = fn => { if (AC && AC.state === 'running') fn(); };
['pointerdown', 'touchend', 'keydown'].forEach(ev => addEventListener(ev, () => ac(), { once: true, passive: true }));
function openOpening() {
  opOn = true; opQuick = false; stOn = true; sceneUi(true); if (stRoot) stScene.remove(stRoot);
  stRoot = new THREE.Group(); stScene.add(stRoot); stScene.background = new THREE.Color('#2c3a78'); stT = 0; stCamFn = null; stUpd = ST_SCENES[4](stRoot);
  stLook = [0, 1.3, 0]; stW = 13; stHh = 8; stOff = -.14; $('start').classList.remove('quick', 'ready'); $('start').classList.add('op'); $('start').hidden = false;
  startMusic(); $('title').querySelectorAll('span').forEach((s, i) => s.style.setProperty('--i', i));
  opTimers.push(setTimeout(() => $('start').classList.add('ready'), 10400));
  const at = (s, f) => opTimers.push(setTimeout(() => cue(f), s * 1000));
  at(1.0, SFX.rooster); at(2.9, SFX.water); at(3.5, SFX.water); at(4.1, SFX.water); at(4.7, SFX.water); at(5.9, SFX.cluck); at(6.5, SFX.cluck);
  for (let i = 0; i < 7; i++) at(8.2 + i * .1, () => SFX.pop(i));
  at(9.2, SFX.soft); at(9.7, SFX.good);
}
function closeOpening() {
  if (!opOn) return; opOn = false; opTimers.forEach(clearTimeout); opTimers = []; stOn = false; sceneUi(false); if (stRoot) { stScene.remove(stRoot); stRoot = null; } $('start').classList.remove('op', 'ready', 'quick'); stCamFn = null;
  stHemi.intensity = .95; stDir.intensity = .8;
}
$('opSkip').addEventListener('click', () => {
  if (!opOn) return; ac(); opTimers.forEach(clearTimeout); opTimers = []; opQuick = true; stT = Math.max(stT, 9.6);
  $('start').classList.add('quick'); SFX.whoosh(); setTimeout(() => { cue(SFX.good); }, 700);
  opTimers.push(setTimeout(() => $('start').classList.add('ready'), 1400));
});
/* "presented by" splash: white -> logo fades in -> logo fades out to white -> white lifts to reveal the opening */
let spTimers = [];
function runSplash() {
  const sp = $('splash'); let went = false;
  const go = () => { if (went) return; went = true; spTimers.forEach(clearTimeout); sp.classList.add('out'); openOpening(); sp.classList.add('gone'); setTimeout(() => sp.remove(), 1200); };
  spTimers = [setTimeout(() => { sp.classList.add('in'); cue(SFX.soft); }, 200), setTimeout(() => sp.classList.add('out'), 2500), setTimeout(go, 3500)];
  sp.addEventListener('click', go);
}
function stSet(i) {
  if (stRoot) stScene.remove(stRoot);
  stRoot = new THREE.Group(); stScene.add(stRoot); stT = 0; stScene.background = new THREE.Color(ST_BG[i % ST_BG.length]);
  stCamFn = null; stUpd = ST_SCENES[i](stRoot); stLook = [0, 1.2, 0]; stW = 15; stHh = 9; stOff = .14;
}
function stTick(dt) {
  stT += dt; if (stUpd) stUpd(dt, stT);
  const w = innerWidth, h = innerHeight, a = w / h, d = Math.max(stW / (2 * Math.tan(20 * Math.PI / 180) * a), stHh / (2 * Math.tan(20 * Math.PI / 180)));
  let px = Math.sin(stT * .3) * 1.4, py = stLook[1] + 2.4, pz = d, lx = stLook[0], ly = stLook[1], lz = stLook[2], off = stOff;
  if (stCamFn) { const r = stCamFn(stT, d); if (r.px != null) { px = r.px; py = r.py; pz = r.pz; lx = r.lx; ly = r.ly; lz = r.lz; off = r.off; } else { px = r.x; py = stLook[1] + r.y; pz = d * r.s; } }
  stCam.aspect = a; stCam.position.set(px, py, pz); stCam.lookAt(lx, ly, lz);
  stCam.setViewOffset(w, h, 0, Math.round(h * off), w, h); stCam.updateProjectionMatrix();
}
function sceneUi(on) { $('app').classList.toggle('scene-on', on); }

/* ----- story slides ----- */
const STORY = [
  ['k', 'Di pinggir desa, ada sebuah kebun kecil. Di sana tinggal Kakek dan Nenek.'],
  ['k', 'Kakek jago bertanam. Wortel, tomat, jagung, dan labu tumbuh subur di kebunnya.'],
  ['n', 'Nenek sayang sekali pada ayam-ayamnya. Telur segar dijual di kios kecil.'],
  ['n', 'Tapi sekarang Kakek dan Nenek butuh bantuan menghitung. Mau jadi petani cilik dan membantu mereka?']
];
let stI = 0;
function renderStory() {
  const last = stI === STORY.length - 1; stSet(stI);
  $('stTxt').textContent = STORY[stI][1]; say(STORY[stI][1], STORY[stI][0]);
  $('stDots').innerHTML = STORY.map((_, k) => '<i class="' + (k === stI ? 'on' : '') + '"></i>').join('');
  $('stNext').textContent = last ? 'Mulai!' : 'Lanjut'; $('stSkip').hidden = last;
}
function openStory(back) { stBack = back || null; stI = 0; stOn = true; sceneUi(true); $('story').hidden = false; renderStory(); }
function closeStory() {
  if (!stOn) return; stOn = false; $('story').hidden = true; sceneUi(false); stopSpeech(); S.story = true; save();
  if (stRoot) { stScene.remove(stRoot); stRoot = null; } const b = stBack; stBack = null; if (b) b();
}
$('stNext').addEventListener('click', () => { ac(); SFX.pop(2); if (stI >= STORY.length - 1) closeStory(); else { stI++; renderStory(); } });
$('stSkip').addEventListener('click', () => { ac(); SFX.soft(); closeStory(); });

/* ----- character creator ----- */
let cuLook = { g: 0, h: 2, c: 0 }, cuKid = null, cuBack = null;
const hex = n => '#' + n.toString(16).padStart(6, '0');
function cuBuildKid() {
  if (cuKid) stRoot.remove(cuKid.g);
  cuKid = makeKid(cuLook); cuKid.g.scale.setScalar(1.7); cuKid.g.rotation.y = 0; stRoot.add(cuKid.g);
}
function cuRefresh() {
  $('cuGender').querySelectorAll('.opt').forEach(b => b.classList.toggle('on', +b.dataset.g === cuLook.g));
  $('cuHat').querySelectorAll('.opt').forEach(b => b.classList.toggle('on', +b.dataset.h === cuLook.h));
  $('cuCol').querySelectorAll('.sw').forEach(b => b.classList.toggle('on', +b.dataset.c === cuLook.c));
  cuBuildKid();
}
(function cuInit() {
  $('cuHat').innerHTML = HATS.map((n, i) => '<button class="opt" data-h="' + i + '">' + n + '</button>').join('');
  $('cuCol').innerHTML = SHIRTS.map((c, i) => '<button class="sw" data-c="' + i + '" style="background:' + hex(c) + '" aria-label="Warna ' + (i + 1) + '"></button>').join('');
  $('cuGender').addEventListener('click', e => { const b = e.target.closest('.opt'); if (!b) return; SFX.pop(1); cuLook.g = +b.dataset.g; cuRefresh(); });
  $('cuHat').addEventListener('click', e => { const b = e.target.closest('.opt'); if (!b) return; SFX.pop(2); cuLook.h = +b.dataset.h; cuRefresh(); });
  $('cuCol').addEventListener('click', e => { const b = e.target.closest('.sw'); if (!b) return; SFX.pop(3); cuLook.c = +b.dataset.c; cuRefresh(); });
})();
function openCustom(back) {
  stCamFn = null; cuBack = back || null; cuLook = Object.assign({ g: 0, h: 2, c: 0 }, S.look ? { g: +!!S.look.g, h: S.look.h | 0, c: S.look.c | 0 } : {});
  $('cuName').value = S.nm || ''; $('cuFarm').value = S.fm || '';
  stOn = true; sceneUi(true); stRoot && stScene.remove(stRoot); stRoot = new THREE.Group(); stScene.add(stRoot); stScene.background = new THREE.Color('#d6f0b8');
  stPlat(stRoot, 9, 7); stTree(stRoot, -3.4, -2.2, .9); stFlowers(stRoot, 18, 8, 4);
  stUpd = (dt, t) => { if (cuKid) { cuKid.g.rotation.y = Math.sin(t * .9) * .6; cuKid.wave = 1; stepElder(cuKid, dt, t); } };
  stLook = [0, 1.7, 0]; stW = 6.4; stHh = 5.2; stOff = .3;
  $('cust').hidden = false; cuRefresh();
}
$('cuGo').addEventListener('click', () => {
  ac(); SFX.good();
  S.look = { g: !!cuLook.g, h: cuLook.h, c: cuLook.c }; S.nm = $('cuName').value.trim() || 'Petani Cilik'; S.fm = $('cuFarm').value.trim() || 'Kebun Ceria'; save();
  $('cust').hidden = true; stOn = false; sceneUi(false); if (stRoot) { stScene.remove(stRoot); stRoot = null; } cuKid = null;
  buildPlayer(); updateHud(); const b = cuBack; cuBack = null; if (b) b();
});

/* ----- farm tour (first visit) ----- */
let touring = false, tourI = 0;
const eFocus = (e, w, h) => ({ x: e.g.position.x, z: e.g.position.z, w: w || 9, h: h || 5.6 });
function tourSteps() {
  return [
    { who: 'k', text: `Halo ${S.nm}! Selamat datang di ${S.fm}!`, f: FOC.overview, cheer: ['k', 'n', 'p'] },
    { who: 'k', text: 'Aku Kakek. Aku mengajarimu bertanam: menanam, menyiram, dan memanen sayur.', f: eFocus(ELD.k), hl: ELD.k, cheer: ['k'] },
    { who: 'n', text: 'Aku Nenek. Aku mengurus ayam dan kios. Nanti kita jualan bareng!', f: eFocus(ELD.n), hl: ELD.n, cheer: ['n'] },
    { who: 'k', text: 'Ada 4 misi kecil untuk belajar bertani sambil berhitung. Ayo mulai! Tap tanahnya.', f: FOC.plot(0), cells: true }
  ];
}
function tourShow() {
  const st = tourSteps()[tourI]; focus(st.f); showBubble(st.who, st.text); bnum.textContent = ''; setDots([]); say(st.text, st.who);
  (st.cheer || []).forEach(w => { (w === 'p' ? PL : ELD[w]).cheer = 1.6; });
  setHL(st.hl ? [padOf(st.hl.g, 1.3, 1.3, .04)] : st.cells ? cellsIn(0, 0).map(i => cellPad(0, i)) : []);
  choicesEl.innerHTML = ''; const b = document.createElement('button'); b.className = 'choice nextbtn'; b.setAttribute('aria-label', 'Lanjut'); b.innerHTML = '<i></i>';
  b.addEventListener('click', tourNext); choicesEl.appendChild(b);
}
function tourNext() {
  ac(); SFX.pop(2); tourI++;
  if (tourI >= tourSteps().length) { touring = false; S.tour = true; save(); hideChoices(); hideBubble(); setHL([]); focus(FOC.overview); stopSpeech(); introDone = true; return; }
  tourShow();
}
function startTour() { touring = true; tourI = 0; tourShow(); }

/* ----- entry points ----- */
function startGame() {
  if (started) return; started = true; $('start').hidden = true; ac(); startMusic(); focus(FOC.overview);
  if (!S.tour) startTour();
}
function afterTitle() {
  ac(); closeOpening(); $('start').hidden = true;
  if (S.look) { startGame(); return; }
  const go = () => openCustom(() => startGame());
  if (!S.story) openStory(go); else go();
}
$('btnPlay').addEventListener('click', afterTitle);
$('mAv').addEventListener('click', () => { $('menu').hidden = true; openCustom(() => { $('menu').hidden = !paused; }); });
$('mStory').addEventListener('click', () => { $('menu').hidden = true; openStory(() => { $('menu').hidden = !paused; }); });
