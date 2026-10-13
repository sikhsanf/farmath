/* ---------- Farmath p4: story slides, character creator, farm tour ---------- */
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const stScene = new THREE.Scene(), stCam = new THREE.PerspectiveCamera(40, 1, .5, 200);
stScene.add(new THREE.HemisphereLight(0xffffff, 0xb8d89a, .95));
{ const d = new THREE.DirectionalLight(0xfff0d2, .8); d.position.set(-5, 10, 8); stScene.add(d); }
let stRoot = null, stUpd = null, stT = 0, stOn = false, stBack = null, stLook = [0, 1.2, 0], stW = 15, stHh = 9, stOff = .12;
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
/* opening animation: seeds pop up into a field while Kakek waters, then the title comes in */
ST_SCENES.push(g => {
  stPlat(g, 14, 9); stTree(g, -5.6, -2.8); stTree(g, 5.8, -3, .9); stFlowers(g, 18, 12, 6); const cl = stClouds(g), sun = stSun(g);
  V(g, 0x8a5a33, 7.4, .28, 3.2, 0, 0, -.6, false);
  const crops = []; for (let i = 0; i < 10; i++) { const c = cropParts(i % 4).grown; c.position.set(-2.6 + (i % 5) * 1.3, .28, -1.2 + Math.floor(i / 5) * 1.3); c.scale.setScalar(.001); g.add(c); crops.push(c); }
  const k = stFace(makeElder('k')); k.g.position.set(-3.8, 0, 1.6); k.g.scale.setScalar(1.5); g.add(k.g);
  const n = stFace(makeElder('n')); n.g.position.set(3.8, 0, 1.6); n.g.scale.setScalar(1.5); g.add(n.g);
  const can = makeWateringCan(); can.scale.setScalar(1.5); can.position.set(-2.6, 1.5, 1); g.add(can);
  const back = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  return (dt, t) => {
    k.wave = 1; n.cheer = t > 3 ? 1 : 0; stepElder(k, dt, t); stepElder(n, dt, t); cl.forEach((q, i) => q.position.x = ((t * .3 + i * 5.3) % 18) - 9); sun.rotation.y = t;
    crops.forEach((c, i) => { const x = Math.max(0, Math.min(1, (t - .4 - i * .22) / .9)); c.scale.setScalar(Math.max(.001, 1.5 * back(x))); });
    const sw = Math.min(1, t / 2.6); can.position.x = -2.6 + sw * 5.2 + Math.sin(t * 2) * .1; can.position.z = .9 + Math.sin(t * 3) * .1; can.rotation.z = -.55 + Math.sin(t * 6) * .08;
  };
});
let opOn = false, opTimers = [];
/* browsers keep audio locked until the first touch, so cues only play once it is running (never a burst of late sounds) */
const cue = fn => { if (AC && AC.state === 'running') fn(); };
['pointerdown', 'touchend', 'keydown'].forEach(ev => addEventListener(ev, () => ac(), { once: true, passive: true }));
function openOpening() {
  opOn = true; stOn = true; sceneUi(true); if (stRoot) stScene.remove(stRoot);
  stRoot = new THREE.Group(); stScene.add(stRoot); stScene.background = new THREE.Color('#bfe8ff'); stT = 0; stUpd = ST_SCENES[4](stRoot);
  stLook = [0, 1.1, 0]; stW = 15; stHh = 9; stOff = -.12; $('start').classList.add('op'); $('start').hidden = false;
  startMusic(); cue(SFX.whoosh);
  const at = (s, f) => opTimers.push(setTimeout(() => cue(f), s * 1000));
  for (let i = 0; i < 10; i++) at(.7 + i * .22, () => SFX.pop(i % 5));
  for (let i = 0; i < 7; i++) at(2.5 + i * .1, () => SFX.pop(i));
  at(3.7, SFX.soft); at(4.4, SFX.good);
}
function closeOpening() {
  if (!opOn) return; opOn = false; opTimers.forEach(clearTimeout); opTimers = []; stOn = false; sceneUi(false); if (stRoot) { stScene.remove(stRoot); stRoot = null; } $('start').classList.remove('op');
}
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
  stUpd = ST_SCENES[i](stRoot); stLook = [0, 1.2, 0]; stW = 15; stHh = 9; stOff = .14;
}
function stTick(dt) {
  stT += dt; if (stUpd) stUpd(dt, stT);
  const w = innerWidth, h = innerHeight, a = w / h, d = Math.max(stW / (2 * Math.tan(20 * Math.PI / 180) * a), stHh / (2 * Math.tan(20 * Math.PI / 180)));
  stCam.aspect = a; stCam.position.set(Math.sin(stT * .3) * 1.4, stLook[1] + 2.4, d); stCam.lookAt(stLook[0], stLook[1], stLook[2]);
  stCam.setViewOffset(w, h, 0, Math.round(h * stOff), w, h); stCam.updateProjectionMatrix();
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
  cuBack = back || null; cuLook = Object.assign({ g: 0, h: 2, c: 0 }, S.look ? { g: +!!S.look.g, h: S.look.h | 0, c: S.look.c | 0 } : {});
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
