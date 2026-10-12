/* ---------- Farmath p1: utilities, state, audio, three setup, voxel models ---------- */
const THREE = window.THREE;
const $ = id => document.getElementById(id);
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const EZ = {
  out: t => 1 - Math.pow(1 - t, 3),
  inout: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  lin: t => t
};
const NUM = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh'];
const PRAISE = ['Hebat!', 'Pintar!', 'Mantap!', 'Keren!', 'Bagus sekali!'];

/* ---------- save state ---------- */
const KEY = 'farmath_v02';
const DEF = () => ({
  done: 0, coins: 0, inv: [0, 0, 0, 0], eggs: 0, snd: true, mus: true, hens: 0, bld: null, av: null, hungryAt: 0, look: null, nm: '', fm: '', story: false, tour: false, tutC: false, tutH: false, tut: 0, vo: true,
  plots: [0, 1, 2, 3].map(() => ({ c: 0, cs: Array(10).fill(0), r: Array(10).fill(0) })),
  unl: { plots: 1, coop: false, kios: false }
});
function loadState() {
  try {
    const r = localStorage.getItem(KEY);
    if (r) { const o = JSON.parse(r); if (o.tut === undefined) o.tut = (o.done > 0 || (o.unl && o.unl.plots > 1)) ? 4 : 0; return Object.assign(DEF(), o); }
  } catch (e) { /* storage may be blocked */ }
  return DEF();
}
let S = loadState();
if (!S.look && S.av) { S.look = { g: S.av === 'g', h: 2, c: S.av === 'g' ? 1 : 0 }; S.nm = S.nm || 'Petani Cilik'; S.fm = S.fm || 'Kebun Ceria'; S.story = S.tour = true; }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }

const maxN = () => Math.min(10, 3 + Math.floor(S.done / 4));
const CROPS = [{ name: 'wortel', e: '🥕' }, { name: 'tomat', e: '🍅' }, { name: 'jagung', e: '🌽' }, { name: 'labu', e: '🎃' }];
const numWord = n => NUM[n] || String(n);

/* ---------- audio: procedural sfx + speech ---------- */
let AC = null;
function ac() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
  if (AC && AC.state === 'suspended') { try { AC.resume(); } catch (e) { /* ignore */ } }
  return AC;
}
function tone(f, d = .15, type = 'sine', v = .15, slide = 0, delay = 0) {
  if (!S.snd) return;
  const a = ac(); if (!a) return;
  try {
    const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f * slide), t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0008, t + d);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .05);
  } catch (e) { /* ignore */ }
}
const SFX = {
  pop: (k = 0) => tone(480 + k * 55, .13, 'triangle', .2, 1.45),
  good: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .28, 'triangle', .17, 1, i * .09)),
  soft: () => tone(320, .22, 'sine', .14, .8),
  cluck: () => { tone(760, .06, 'triangle', .13, .55); tone(560, .09, 'triangle', .12, .5, .1); tone(420, .08, 'square', .03, .8, .12); },
  hammer: () => { tone(210, .07, 'square', .07, .5); tone(140, .1, 'triangle', .1, .6, .02); },
  coin: () => { tone(988, .08, 'square', .06); tone(1319, .2, 'square', .06, 1, .07); },
  water: () => tone(900, .16, 'sine', .08, .5),
  hello: () => { tone(660, .1, 'triangle', .12); tone(880, .16, 'triangle', .12, 1, .1); },
  whoosh: () => tone(300, .18, 'sine', .08, 1.8)
};
let voice = null;
function pickVoice() {
  try { voice = speechSynthesis.getVoices().find(v => /^id/i.test(v.lang)) || null; } catch (e) { voice = null; }
}
try { if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } } catch (e) { /* ignore */ }
/* Guide voice. Browsers give no SSML, so expression is faked per phrase:
   "!" is bright and quick, "?" rises, commas lift a little, short words (counting, praise) sparkle. */
function say(text, who) {
  if (!S.vo || !window.speechSynthesis) return;
  try {
    speechSynthesis.cancel();
    const base = who === 'n' ? 1.22 : .8, parts = String(text).match(/[^.!?,]+[.!?,]*/g) || [String(text)];
    parts.forEach((raw, i) => {
      const p = raw.trim(); if (!p) return;
      const end = p.slice(-1), u = new SpeechSynthesisUtterance(p.replace(/[.!?,]+$/, ''));
      u.lang = 'id-ID'; if (voice) u.voice = voice;
      let pitch = base, rate = .86;
      if (end === '!') { pitch += .2; rate = .95; }
      else if (end === '?') { pitch += .26; rate = .88; }
      else if (end === ',') { pitch += .06; rate = .88; }
      else { pitch -= .04; rate = .82; }
      if (i === 0 && parts.length > 1) pitch += .05;
      if (p.length < 12) { pitch += .14; rate += .04; }
      u.pitch = Math.max(.1, Math.min(2, pitch)); u.rate = rate; u.volume = 1;
      speechSynthesis.speak(u);
    });
  } catch (e) { /* ignore */ }
}

/* ---------- three setup ---------- */
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, -100, 200);
const CAM_EL = THREE.MathUtils.degToRad(50), CAM_AZ = Math.PI / 4;
const camDir = new THREE.Vector3(Math.cos(CAM_EL) * Math.sin(CAM_AZ), Math.sin(CAM_EL), Math.cos(CAM_EL) * Math.cos(CAM_AZ));
const IS_SMALL = Math.min(screen.width, screen.height) < 700 || /iPhone|iPad|Android/i.test(navigator.userAgent);

scene.add(new THREE.HemisphereLight(0xffffff, 0xbad89a, .88));
const sun = new THREE.DirectionalLight(0xfff0d2, .78);
sun.position.set(0, 18, 9); sun.target.position.set(8, 0, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(IS_SMALL ? 1024 : 2048, IS_SMALL ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 60 });
sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);

const cam = { x: 8, z: 8, w: 21, h: 12, cx: 8, cz: 8, cw: 21, ch: 12 };
function camTo(x, z, w, h, instant) {
  cam.x = x; cam.z = z; cam.w = w; cam.h = h;
  if (instant) { cam.cx = x; cam.cz = z; cam.cw = w; cam.ch = h; }
}
const _tgt = new THREE.Vector3();
function applyCam() {
  const asp = innerWidth / Math.max(1, innerHeight);
  const vw = Math.max(cam.cw, cam.ch * asp), vh = vw / asp, off = vh * .07;
  camera.left = -vw / 2; camera.right = vw / 2; camera.top = vh / 2 + off; camera.bottom = -vh / 2 + off;
  camera.updateProjectionMatrix();
  _tgt.set(cam.cx, 0, cam.cz);
  camera.position.copy(_tgt).addScaledVector(camDir, 60);
  camera.lookAt(_tgt);
}
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight, false);
  applyCam();
}
window.addEventListener('resize', resize);

/* ---------- voxel helpers ---------- */
const geoC = {}, matC = {};
const G = (w, h, d) => { const k = w + '|' + h + '|' + d; return geoC[k] || (geoC[k] = new THREE.BoxGeometry(w, h, d)); };
const M = c => matC[c] || (matC[c] = new THREE.MeshLambertMaterial({ color: c }));
/* V: box with (x,y,z) = bottom centre */
function V(p, c, w, h, d, x, y, z, sh = true) {
  const m = new THREE.Mesh(G(w, h, d), M(c));
  m.position.set(x, y + h / 2, z); m.castShadow = sh; m.receiveShadow = true;
  if (p) p.add(m);
  return m;
}
const HM = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
function H(p, w, h, d, x, y, z, data) {
  const m = new THREE.Mesh(G(w, h, d), HM);
  m.position.set(x, y + h / 2, z); m.userData = data; p.add(m);
  return m;
}
function worldOf(o) { const v = new THREE.Vector3(); o.updateWorldMatrix(true, false); o.getWorldPosition(v); return v; }
function screenOf(v3) { const v = v3.clone().project(camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight }; }

/* ---------- animation + particles ---------- */
const AN = [];
function tween(dur, upd, done, delay, ez) { AN.push({ t: -(delay || 0), dur, upd, done, ez: ez || EZ.out }); }
function after(sec, fn) { tween(sec, null, fn, 0, EZ.lin); }
function stepAnims(dt) {
  for (let i = AN.length - 1; i >= 0; i--) {
    const a = AN[i]; if (!a) continue;
    a.t += dt; if (a.t < 0) continue;
    const k = Math.min(1, a.t / a.dur);
    if (a.upd) a.upd(a.ez(k));
    if (k >= 1) { const ix = AN.indexOf(a); if (ix >= 0) AN.splice(ix, 1); if (a.done) a.done(); }
  }
}
function popScale(o, from = .2, dur = .38) { o.scale.setScalar(from); tween(dur, k => o.scale.setScalar(lerp(from, 1, k)), null, 0, EZ.back); }
function wiggle(o) { const r0 = o.rotation.z; tween(.45, k => { o.rotation.z = r0 + Math.sin(k * Math.PI * 4) * .28 * (1 - k); }, () => { o.rotation.z = r0; }, 0, EZ.lin); }
function hop(o, h = .4, dur = .4) { const y0 = o.position.y; tween(dur, k => { o.position.y = y0 + Math.sin(k * Math.PI) * h; }, () => { o.position.y = y0; }, 0, EZ.lin); }
function flyTo(obj, to, dur, h, done) {
  const from = obj.position.clone();
  tween(dur, k => { obj.position.set(lerp(from.x, to.x, k), lerp(from.y, to.y, k) + Math.sin(k * Math.PI) * h, lerp(from.z, to.z, k)); }, () => { obj.position.copy(to); if (done) done(); }, 0, EZ.inout);
}
const PT = [];
function burst(pos, cols, n, sp = 3, size = .13, life = .95, g = 9) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(G(size, size, size), M(pick(cols)));
    m.position.copy(pos); scene.add(m);
    const a = Math.random() * Math.PI * 2, e = Math.random() * .8 + .3;
    PT.push({ m, vx: Math.cos(a) * sp * Math.random(), vy: sp * e * 1.25, vz: Math.sin(a) * sp * Math.random(), life, t: 0, g });
  }
}
function stepPT(dt) {
  for (let i = PT.length - 1; i >= 0; i--) {
    const p = PT[i]; p.t += dt; p.vy -= p.g * dt;
    p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt;
    const r = p.t / p.life; p.m.scale.setScalar(clamp(1 - (r - .55) / .45, 0, 1));
    if (p.t >= p.life) { scene.remove(p.m); PT.splice(i, 1); }
  }
}
const CONF = [0xffd34d, 0xff7a6b, 0x7ddc6f, 0x6bc4ff, 0xffffff, 0xd69bff];
const WATER = [0x7cc8ff, 0xa8dcff, 0x5db4f2];

/* ---------- crops ---------- */
function cropParts(type) {
  const seed = new THREE.Group(); V(seed, 0x6b4423, .22, .1, .22, 0, 0, 0); V(seed, 0xd8a23c, .1, .05, .1, 0, .1, 0);
  const sprout = new THREE.Group();
  V(sprout, 0x4caf50, .07, .24, .07, 0, 0, 0); V(sprout, 0x66cc5a, .2, .06, .11, -.11, .17, 0); V(sprout, 0x66cc5a, .2, .06, .11, .11, .23, 0);
  const grown = new THREE.Group();
  if (type === 0) { // wortel
    V(grown, 0xff8a1f, .32, .2, .32, 0, 0, 0); V(grown, 0xff9d3a, .22, .06, .22, 0, .2, 0);
    V(grown, 0x3fae3f, .08, .42, .08, 0, .22, 0); V(grown, 0x4cc04c, .08, .34, .08, -.11, .22, .05); V(grown, 0x4cc04c, .08, .36, .08, .11, .22, -.05);
  } else if (type === 1) { // tomat
    V(grown, 0x3d9a3d, .07, .4, .07, 0, 0, 0);
    V(grown, 0xe53935, .3, .3, .3, .13, .1, .08); V(grown, 0xef5350, .26, .26, .26, -.14, .26, -.08);
    V(grown, 0x4cc04c, .24, .05, .12, .0, .36, .0); V(grown, 0x2e8b2e, .14, .06, .14, .13, .4, .08);
  } else if (type === 2) { // jagung
    V(grown, 0x3d9a3d, .1, .85, .1, 0, 0, 0); V(grown, 0x4cc04c, .34, .05, .1, .17, .3, 0); V(grown, 0x4cc04c, .34, .05, .1, -.17, .5, 0);
    V(grown, 0xf6cf3a, .15, .32, .15, 0, .36, .12); V(grown, 0xd8b04a, .09, .12, .09, 0, .86, 0);
  } else { // labu
    V(grown, 0xff8f1f, .52, .34, .52, 0, 0, 0); V(grown, 0xffa23a, .4, .12, .4, 0, .34, 0);
    V(grown, 0x6b8e23, .1, .16, .1, 0, .46, 0); V(grown, 0x4cc04c, .26, .04, .2, .24, .08, .12);
  }
  return { seed, sprout, grown };
}

/* ---------- item models (for trays) ---------- */
function makeCarrotItem() { const g = new THREE.Group(); V(g, 0xff8a1f, .24, .2, .24, 0, 0, 0); V(g, 0x3fae3f, .07, .22, .07, 0, .2, 0); V(g, 0x4cc04c, .07, .16, .07, .08, .2, .02); return g; }
function makeEggItem() { const g = new THREE.Group(); V(g, 0xfff4dc, .22, .2, .22, 0, 0, 0); V(g, 0xfff9ea, .15, .08, .15, 0, .2, 0); return g; }
function makeSeedItem(col) { const g = new THREE.Group(); V(g, col, .22, .14, .22, 0, 0, 0); V(g, 0xffffff, .08, .04, .08, -.03, .14, -.02, false); return g; }

/* ---------- trays (ten-frame style crates) ---------- */
function makeTray(count, cols, sl, wood, rim) {
  const rows = Math.ceil(count / cols), g = new THREE.Group(), w = cols * sl + .22, d = rows * sl + .22;
  V(g, wood, w, .1, d, 0, 0, 0);
  V(g, rim, w, .2, .09, 0, .1, -d / 2 + .045); V(g, rim, w, .2, .09, 0, .1, d / 2 - .045);
  V(g, rim, .09, .2, d - .18, -w / 2 + .045, .1, 0); V(g, rim, .09, .2, d - .18, w / 2 - .045, .1, 0);
  const slots = [];
  for (let i = 0; i < count; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    const x = (c - (cols - 1) / 2) * sl, z = (r - (rows - 1) / 2) * sl;
    V(g, 0xf6e6bd, sl * .82, .02, sl * .82, x, .1, z, false);
    slots.push(new THREE.Vector3(x, .12, z));
  }
  g.userData.slots = slots; g.userData.items = []; g.userData.count = count;
  return g;
}
function trayPut(tray, idx, item, dur, h, cb) {
  scene.add(item);
  tray.updateWorldMatrix(true, false);
  const to = tray.localToWorld(tray.userData.slots[idx].clone());
  flyTo(item, to, dur, h, () => {
    tray.attach(item); item.position.copy(tray.userData.slots[idx]); tray.userData.items[idx] = item;
    if (cb) cb();
  });
}
function trayPlace(tray, idx, item) { tray.add(item); item.position.copy(tray.userData.slots[idx]); tray.userData.items[idx] = item; }
function trayClear(tray) { tray.userData.items.forEach(it => { if (it && it.parent) it.parent.remove(it); }); tray.userData.items = []; }

/* ---------- characters ---------- */
function makeElder(kind) {
  const g = new THREE.Group(), skin = 0xf1c9a0, k = kind === 'k';
  const legL = new THREE.Group(), legR = new THREE.Group(), armL = new THREE.Group(), armR = new THREE.Group();
  legL.position.set(-.15, .5, 0); legR.position.set(.15, .5, 0); g.add(legL, legR);
  V(legL, k ? 0x3d6fb6 : skin, .2, .45, .22, 0, -.5, 0); V(legL, 0x4a3020, .24, .1, .32, 0, -.5, .04);
  V(legR, k ? 0x3d6fb6 : skin, .2, .45, .22, 0, -.5, 0); V(legR, 0x4a3020, .24, .1, .32, 0, -.5, .04);
  if (k) {
    V(g, 0xd9633a, .64, .6, .4, 0, .5, 0); V(g, 0x3d6fb6, .5, .44, .05, 0, .5, .21);
    V(g, 0x3d6fb6, .08, .3, .05, -.18, .94, .2); V(g, 0x3d6fb6, .08, .3, .05, .18, .94, .2);
  } else {
    V(g, 0xb565a7, .8, .46, .56, 0, .22, 0); V(g, 0xb565a7, .62, .46, .4, 0, .66, 0);
    V(g, 0xffffff, .5, .4, .05, 0, .26, .29); V(g, 0xffffff, .4, .3, .05, 0, .66, .21);
  }
  armL.position.set(-.42, 1.05, 0); armR.position.set(.42, 1.05, 0); g.add(armL, armR);
  for (const a of [armL, armR]) { V(a, k ? 0xd9633a : 0xb565a7, .17, .5, .19, 0, -.48, 0); V(a, skin, .17, .14, .19, 0, -.62, 0); }
  V(g, skin, .52, .48, .5, 0, 1.1, 0);
  V(g, 0x2b2b2b, .07, .09, .04, -.12, 1.33, .26, false); V(g, 0x2b2b2b, .07, .09, .04, .12, 1.33, .26, false);
  V(g, 0xe0a47a, .09, .09, .06, 0, 1.24, .27, false);
  V(g, 0xe58a80, .1, .05, .04, -.2, 1.2, .26, false); V(g, 0xe58a80, .1, .05, .04, .2, 1.2, .26, false);
  if (k) {
    V(g, 0xf5f5f5, .32, .08, .06, 0, 1.15, .27, false); V(g, 0xf5f5f5, .06, .3, .4, -.29, 1.2, -.02); V(g, 0xf5f5f5, .06, .3, .4, .29, 1.2, -.02);
    V(g, 0xf2c14e, .94, .06, .94, 0, 1.55, 0); V(g, 0xf2c14e, .52, .2, .52, 0, 1.6, 0); V(g, 0xc0392b, .54, .06, .54, 0, 1.6, 0);
  } else {
    V(g, 0xdadade, .56, .16, .52, 0, 1.46, -.02); V(g, 0xdadade, .06, .34, .42, -.3, 1.18, -.02); V(g, 0xdadade, .06, .34, .42, .3, 1.18, -.02);
    V(g, 0xdadade, .3, .22, .3, 0, 1.62, -.06);
    V(g, 0x444444, .17, .13, .03, -.12, 1.31, .27, false); V(g, 0x444444, .17, .13, .03, .12, 1.31, .27, false); V(g, 0x444444, .06, .04, .03, 0, 1.37, .27, false);
    V(g, 0xf4a6c1, .5, .07, .52, 0, 1.12, 0, false);
  }
  g.rotation.y = Math.PI / 4;
  return { g, legL, legR, armL, armR, kind, tx: null, tz: null, cb: null, ph: 0, cheer: 0, wave: 0 };
}
function stepElder(e, dt, tm) {
  let moving = false;
  if (e.tx != null) {
    const dx = e.tx - e.g.position.x, dz = e.tz - e.g.position.z, d = Math.hypot(dx, dz);
    if (d > .06) {
      const sp = Math.min(d, 4.4 * dt);
      e.g.position.x += dx / d * sp; e.g.position.z += dz / d * sp;
      e.g.rotation.y = Math.atan2(dx, dz); moving = true;
    } else { e.tx = null; e.g.rotation.y = Math.PI / 4; const cb = e.cb; e.cb = null; if (cb) cb(); }
  }
  if (moving) {
    e.ph += dt * 11; const s = Math.sin(e.ph);
    e.legL.rotation.x = s * .7; e.legR.rotation.x = -s * .7; e.armL.rotation.x = -s * .6; e.armR.rotation.x = s * .6;
    e.armL.rotation.z = 0; e.armR.rotation.z = 0; e.g.position.y = Math.abs(s) * .07;
  } else {
    e.legL.rotation.x = 0; e.legR.rotation.x = 0; e.armL.rotation.x = 0; e.armR.rotation.x = 0;
    if (e.cheer > 0) {
      e.cheer -= dt; e.armL.rotation.z = -2.7 + Math.sin(tm * 14) * .25; e.armR.rotation.z = 2.7 - Math.sin(tm * 14) * .25;
      e.g.position.y = Math.abs(Math.sin(tm * 9)) * .2;
    } else if (e.wave > 0) {
      e.wave -= dt; e.armR.rotation.z = 2.5 + Math.sin(tm * 12) * .45; e.armL.rotation.z = 0; e.g.position.y = 0;
    } else { e.armL.rotation.z = 0; e.armR.rotation.z = 0; e.g.position.y = 0; }
  }
}

function makeHen() {
  const g = new THREE.Group();
  V(g, 0xffffff, .46, .4, .58, 0, .2, 0); V(g, 0xf0f0f0, .1, .26, .36, -.27, .3, 0); V(g, 0xf0f0f0, .1, .26, .36, .27, .3, 0);
  V(g, 0xeaeaea, .14, .34, .2, 0, .42, -.36);
  const head = new THREE.Group(); head.position.set(0, .58, .28); g.add(head);
  V(head, 0xffffff, .3, .3, .3, 0, 0, 0); V(head, 0xe53935, .08, .12, .2, 0, .3, -.02); V(head, 0xffa726, .12, .07, .12, 0, .1, .19);
  V(head, 0x222222, .05, .05, .04, -.1, .17, .15, false); V(head, 0x222222, .05, .05, .04, .1, .17, .15, false); V(head, 0xe53935, .06, .1, .05, 0, 0, .16);
  V(g, 0xffa726, .06, .2, .06, -.1, 0, .02); V(g, 0xffa726, .06, .2, .06, .1, 0, .02);
  return { g, head, tx: null, tz: null, wait: Math.random() * 2, eat: 0, busy: false, ph: Math.random() * 6, home: { x: 12, z: 3.2 } };
}
function stepHen(h, dt, tm) {
  let moving = false;
  if (h.tx != null) {
    const dx = h.tx - h.g.position.x, dz = h.tz - h.g.position.z, d = Math.hypot(dx, dz);
    if (d > .05) { const sp = Math.min(d, (h.busy ? 3.2 : 1.1) * dt); h.g.position.x += dx / d * sp; h.g.position.z += dz / d * sp; h.g.rotation.y = Math.atan2(dx, dz); moving = true; }
    else { h.tx = null; h.wait = 1 + Math.random() * 3; if (h.cb) { const cb = h.cb; h.cb = null; cb(); } }
  } else if (!h.busy) {
    h.wait -= dt;
    if (h.wait <= 0) { h.tx = rand(106, 134) / 10; h.tz = rand(29, 35) / 10; }
  }
  h.ph += dt * (moving ? 14 : 4);
  if (h.eat > 0) { h.eat -= dt; h.head.rotation.x = .5 + Math.sin(tm * 16) * .45; }
  else if (moving) { h.head.rotation.x = Math.sin(h.ph) * .15; h.g.position.y = Math.abs(Math.sin(h.ph)) * .05; }
  else { h.g.position.y = 0; h.head.rotation.x = Math.max(0, Math.sin(tm * 1.7 + h.ph) - .7) * 1.6; }
}

const SHIRTS = [0x3fae6a, 0xe8689a, 0x3b8fe0, 0xf2a93b, 0x9b6fd1, 0xe85d4d];
const HATS = ['Tanpa', 'Jerami', 'Cap', 'Rajut'];
function makeKid(look) {
  const girl = !!look.g, hat = look.h | 0, g = new THREE.Group(), skin = 0xf1c9a0, shirt = SHIRTS[look.c | 0] || SHIRTS[0], pants = girl ? shirt : 0x4b5d7a, hair = girl ? 0x6b3f1e : 0x4a3020;
  const legL = new THREE.Group(), legR = new THREE.Group(), armL = new THREE.Group(), armR = new THREE.Group();
  legL.position.set(-.15, .5, 0); legR.position.set(.15, .5, 0); g.add(legL, legR);
  for (const l of [legL, legR]) { V(l, girl ? skin : pants, .2, .45, .22, 0, -.5, 0); V(l, 0x4a3020, .24, .1, .32, 0, -.5, .04); }
  V(g, shirt, .62, .55, .4, 0, .5, 0);
  if (girl) V(g, shirt, .86, .24, .6, 0, .36, 0); else V(g, pants, .64, .2, .42, 0, .4, 0);
  armL.position.set(-.4, 1.05, 0); armR.position.set(.4, 1.05, 0); g.add(armL, armR);
  for (const a of [armL, armR]) { V(a, shirt, .17, .42, .19, 0, -.42, 0); V(a, skin, .17, .14, .19, 0, -.56, 0); }
  V(g, skin, .56, .5, .52, 0, 1.08, 0);
  V(g, 0x2b2b2b, .07, .1, .04, -.13, 1.32, .27, false); V(g, 0x2b2b2b, .07, .1, .04, .13, 1.32, .27, false);
  V(g, 0xe58a80, .1, .05, .04, -.21, 1.2, .27, false); V(g, 0xe58a80, .1, .05, .04, .21, 1.2, .27, false);
  V(g, 0xc4574d, .14, .04, .04, 0, 1.17, .27, false);
  V(g, hair, .62, .2, .58, 0, 1.46, -.02); V(g, hair, .1, .22, .5, -.32, 1.2, -.04); V(g, hair, .1, .22, .5, .32, 1.2, -.04);
  if (girl) { V(g, hair, .62, .62, .1, 0, 1.0, -.3); V(g, hair, .16, .46, .16, -.42, .78, -.1); V(g, hair, .16, .46, .16, .42, .78, -.1); V(g, 0xff7aa8, .2, .08, .2, -.42, 1.22, -.1); V(g, 0xff7aa8, .2, .08, .2, .42, 1.22, -.1); }
  if (hat === 1) { V(g, 0xf2c14e, .98, .06, .98, 0, 1.6, 0); V(g, 0xf2c14e, .56, .2, .56, 0, 1.64, 0); V(g, 0xc0392b, .58, .06, .58, 0, 1.66, 0, false); }
  else if (hat === 2) { V(g, 0xd9473f, .64, .18, .62, 0, 1.62, -.02); V(g, 0xd9473f, .54, .05, .34, 0, 1.6, .4); V(g, 0xffffff, .16, .08, .04, 0, 1.7, .31, false); }
  else if (hat === 3) { V(g, 0xf08a24, .66, .24, .64, 0, 1.6, -.02); V(g, 0xffd34d, .68, .06, .66, 0, 1.64, -.02, false); V(g, 0xffd34d, .2, .2, .2, 0, 1.84, 0); }
  g.scale.setScalar(.9); g.rotation.y = Math.PI / 4;
  return { g, legL, legR, armL, armR, kind: 'p', tx: null, tz: null, cb: null, ph: 0, cheer: 0, wave: 0 };
}

function makeVillager() {
  const g = new THREE.Group(), skin = pick([0xf1c9a0, 0xd9a577, 0xb5805a, 0xf6d7b5]), hair = pick([0x2b2118, 0x5a3a22, 0xc9893b, 0x1d1d1d]);
  const shirt = pick([0x4aa3df, 0xe85d75, 0x8bc34a, 0xf2a93b, 0x9b6fd1]), pants = pick([0x4b5d7a, 0x6b4f3a, 0x3d6fb6]);
  V(g, pants, .2, .42, .22, -.14, 0, 0); V(g, pants, .2, .42, .22, .14, 0, 0);
  V(g, shirt, .56, .5, .36, 0, .42, 0);
  V(g, shirt, .15, .42, .17, -.36, .46, 0); V(g, shirt, .15, .42, .17, .36, .46, 0);
  V(g, skin, .15, .12, .17, -.36, .36, 0); V(g, skin, .15, .12, .17, .36, .36, 0);
  V(g, skin, .46, .42, .42, 0, .92, 0); V(g, hair, .5, .16, .46, 0, 1.24, -.02); V(g, hair, .5, .3, .08, 0, 1.0, -.22);
  V(g, 0x2b2b2b, .06, .08, .04, -.1, 1.07, .22, false); V(g, 0x2b2b2b, .06, .08, .04, .1, 1.07, .22, false);
  V(g, 0xe58a80, .1, .04, .04, -.17, 1.0, .22, false); V(g, 0xe58a80, .1, .04, .04, .17, 1.0, .22, false);
  return g;
}

function makeWateringCan() {
  const g = new THREE.Group();
  V(g, 0x4a90d9, .5, .42, .4, 0, 0, 0); V(g, 0x2f6db0, .5, .06, .4, 0, .42, 0); V(g, 0x2f6db0, .08, .34, .26, -.32, .08, 0); V(g, 0x2f6db0, .3, .06, .08, -.2, .46, 0);
  V(g, 0x4a90d9, .12, .1, .5, .34, .2, 0).rotation.y = 0; V(g, 0x2f6db0, .22, .08, .22, .56, .3, 0);
  return g;
}
function makeSack() {
  const g = new THREE.Group();
  V(g, 0xd9b77a, .64, .62, .5, 0, 0, 0); V(g, 0xc9a566, .36, .16, .3, 0, .62, 0); V(g, 0xe9b949, .5, .06, .36, 0, .6, 0);
  V(g, 0xb08a4e, .66, .06, .52, 0, .3, 0); V(g, 0xe9b949, .12, .1, .1, -.15, .66, .0); V(g, 0xe9b949, .12, .1, .1, .12, .66, .05);
  return g;
}
