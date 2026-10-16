/* ---------- Farmath p3: UI, tasks, flow, input ---------- */
const bubble = $('bubble'), avatar = $('avatar'), btext = $('btext'), bnum = $('bnum'), dotsEl = $('dots'), choicesEl = $('choices');
const AV = {
  k: '<svg viewBox="0 0 64 64"><rect x="14" y="30" width="6" height="14" rx="3" fill="#f5f5f5"/><rect x="44" y="30" width="6" height="14" rx="3" fill="#f5f5f5"/><circle cx="32" cy="38" r="17" fill="#f1c9a0"/><path d="M22 46q10-7 20 0q-10 7-20 0z" fill="#f5f5f5"/><circle cx="26" cy="36" r="2.4" fill="#2b2b2b"/><circle cx="38" cy="36" r="2.4" fill="#2b2b2b"/><circle cx="21" cy="42" r="2.6" fill="#e58a80"/><circle cx="43" cy="42" r="2.6" fill="#e58a80"/><ellipse cx="32" cy="25" rx="27" ry="6" fill="#f2c14e"/><rect x="20" y="11" width="24" height="15" rx="4" fill="#f2c14e"/><rect x="20" y="20" width="24" height="5" fill="#c0392b"/></svg>',
  n: '<svg viewBox="0 0 64 64"><circle cx="32" cy="9" r="8" fill="#dadade"/><circle cx="32" cy="38" r="17" fill="#f1c9a0"/><path d="M13 40Q11 12 32 12Q53 12 51 40Q47 26 32 25Q17 26 13 40z" fill="#dadade"/><circle cx="25" cy="38" r="5.5" fill="none" stroke="#444" stroke-width="2"/><circle cx="39" cy="38" r="5.5" fill="none" stroke="#444" stroke-width="2"/><path d="M30.5 37h3" stroke="#444" stroke-width="2"/><circle cx="25" cy="38" r="1.8" fill="#2b2b2b"/><circle cx="39" cy="38" r="1.8" fill="#2b2b2b"/><path d="M26 47q6 5 12 0" fill="none" stroke="#b5533c" stroke-width="2.4" stroke-linecap="round"/><circle cx="20" cy="45" r="2.8" fill="#f2a6a0"/><circle cx="44" cy="45" r="2.8" fill="#f2a6a0"/></svg>'
};
let T = null, paused = false, started = false, tm = 0, bedOn = false;
let FM = null; /* farm mode: the plot the child is working on (plant, water, harvest without leaving) */
let picks = [];

function showBubble(who, text) {
  bubble.classList.remove('tip'); $('bname').textContent = who === 'n' ? 'Nenek' : 'Kakek';
  bubble.hidden = false; avatar.innerHTML = AV[who]; btext.textContent = text;
  bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
}
function hideBubble() { bubble.hidden = true; bubble.classList.remove('tip'); }
bubble.addEventListener('click', () => { if (bubble.classList.contains('tip') && tipT > 0) tipT = .01; });
function setDots(list) {
  dotsEl.innerHTML = '';
  list.forEach(d => { const s = document.createElement('span'); if (d === '+') { s.className = 'sep'; s.textContent = '+'; } else s.className = 'dot ' + d; dotsEl.appendChild(s); });
}
const dotsOf = (n, c) => Array.from({ length: n }, () => c);
function markDot(i, on = true) { const ds = dotsEl.querySelectorAll('.dot'); if (ds[i]) ds[i].classList.toggle('on', on); }
function header(who, text, num, dots) {
  T.who = who; T.text = text; showBubble(who, text); bnum.textContent = num == null ? '' : String(num); setDots(dots || []); say(text, who);
}
let nudgeT = 0;
function nudge(text) {
  if (!T) return; T.idle = 0; SFX.soft(); btext.textContent = text; say(text, T.who);
  clearTimeout(nudgeT); nudgeT = setTimeout(() => { if (T) btext.textContent = T.text; }, 2800);
}
function popNum(v3, text) {
  const s = screenOf(v3), d = document.createElement('div');
  d.className = 'pop-n'; d.textContent = text; d.style.left = s.x + 'px'; d.style.top = s.y + 'px';
  $('app').appendChild(d); setTimeout(() => d.remove(), 1000);
}
function hudVis() {
  const c = S.seenCoin || S.coins > 0 || S.done > 0, b = S.seenBasket || S.inv.some(v => v > 0) || S.eggs > 0;
  if (c) S.seenCoin = true; if (b) S.seenBasket = true;
  [['chipC', c], ['prog', b]].forEach(([id, on]) => { const el = $(id); const was = el.style.display !== 'none'; el.style.display = on ? '' : 'none'; if (on && !was && started) bump(id); });
}
function updateHud() {
  hudVis(); $('coinN').textContent = S.coins;
  const inv = CROPS.map((c, i) => S.inv[i] ? c.e + S.inv[i] : '').filter(Boolean);
  if (S.eggs) inv.push('🥚' + S.eggs);
  $('prog').textContent = inv.length ? inv.join(' ') : '🧺 0';
  $('wave').style.display = S.snd ? '' : 'none';
  $('btnJoy').classList.toggle('on', !!S.jy);
  $('mSound').textContent = 'Efek suara: ' + (S.snd ? 'nyala' : 'mati');
  $('mVoice').textContent = 'Suara pemandu: ' + (S.vo ? 'nyala' : 'mati');
  $('mMusic').textContent = 'Musik: ' + (S.mus ? 'nyala' : 'mati');
}
function bump(id) { const el = $(id); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
/* little icons fly from a world point into a HUD counter */
function flyToHud(html, v3, n, id) {
  const el0 = $(id); if (!el0) return; for (let i = 0; i < Math.min(n, 6); i++) setTimeout(() => {
    const t = el0.getBoundingClientRect(), s = screenOf(v3), el = document.createElement('div');
    if (!t.width) return; el.className = 'flyem'; el.innerHTML = html; el.style.left = s.x + 'px'; el.style.top = s.y + 'px'; $('app').appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transform = 'translate(' + (t.left + t.width / 2 - s.x) + 'px,' + (t.top + t.height / 2 - s.y) + 'px) scale(.55)'; }));
    setTimeout(() => { el.remove(); bump(id); }, 850);
  }, i * 130);
}
function addCoins(n) {
  S.seenCoin = true; hudVis(); const t0 = T && T.fx; if (t0) flyToHud(COIN, t0, n, 'chipC');
  const start = S.coins; S.coins += n;
  for (let i = 0; i < n; i++) setTimeout(() => { SFX.coin(); $('coinN').textContent = start + i + 1; }, 250 + i * 110);
}
function showChoices(vals, onPick) {
  choicesEl.innerHTML = '';
  vals.forEach(v => { const b = document.createElement('button'); b.className = 'choice'; b.textContent = v; b.addEventListener('click', () => onPick(v, b)); choicesEl.appendChild(b); });
}
const hideChoices = () => { choicesEl.innerHTML = ''; };


/* hint arrow */
const ARROW = new THREE.Group();
V(ARROW, 0xffc531, .16, .14, .16, 0, 0, 0, false); V(ARROW, 0xffc531, .36, .14, .36, 0, .14, 0, false); V(ARROW, 0xffc531, .56, .14, .56, 0, .28, 0, false); V(ARROW, 0xffc531, .24, .42, .24, 0, .42, 0, false);
ARROW.visible = false; scene.add(ARROW);
let arrowAt = null;
/* animated hand: shows where to tap, or a drag/swipe from A to B. Points are world Vector3 or screen {x,y}. */
const handEl = $('hand'); let HND = null;
const ptOf = p => (p.isVector3 ? screenOf(p) : p);
function showHandTap(v3) { HND = { mode: 'tap', a: v3.clone() }; handEl.hidden = false; handEl.className = 'tap'; }
function showHandDrag(a, b) { HND = { mode: 'drag', a: a.isVector3 ? a.clone() : a, b: b.isVector3 ? b.clone() : b }; handEl.hidden = false; handEl.className = 'drag'; }
function showArrow(v3) { showHandTap(v3); }
function hideArrow() { HND = null; handEl.hidden = true; }
function stepHand() {
  if (!HND) return; let x, y, o = 1;
  if (HND.mode === 'tap') { const s = ptOf(HND.a); x = s.x; y = s.y + Math.abs(Math.sin(tm * 5)) * 14; }
  else { const u = (tm * .8) % 1.9, k = Math.min(1, u / 1.15), e = k * k * (3 - 2 * k), A = ptOf(HND.a), B = ptOf(HND.b); x = lerp(A.x, B.x, e); y = lerp(A.y, B.y, e); o = u < .15 ? u / .15 : u > 1.4 ? Math.max(0, 1 - (u - 1.4) / .4) : 1; }
  handEl.style.left = x + 'px'; handEl.style.top = y + 'px'; handEl.style.opacity = o;
}
const coinBtnPt = () => { const b = document.querySelector('.coinbtn'); if (!b) return { x: innerWidth / 2, y: innerHeight - 90 }; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

const ALERT = new THREE.Group();
V(ALERT, 0xff5a4d, .22, .5, .22, 0, .2, 0, false); V(ALERT, 0xff5a4d, .22, .22, .22, 0, -.1, 0, false);
ALERT.visible = false; scene.add(ALERT);

/* tap highlights: pulsing yellow pads under whatever must be tapped */
const HLS = [];
function setHL(list) {
  while (HLS.length < list.length) { const m = new THREE.Mesh(G(1, .06, 1), new THREE.MeshBasicMaterial({ color: 0xfff04d, transparent: true, opacity: .85, depthTest: false, depthWrite: false })); m.renderOrder = 20; scene.add(m); HLS.push(m); }
  HLS.forEach((m, i) => { const o = list[i]; m.visible = !!o; if (o) { m.position.set(o.x, o.y == null ? .33 : o.y, o.z); m.userData.w = o.w || .92; m.userData.d = o.d || .92; } });
}
function stepHL() {
  const p = Math.sin(tm * 5.5);
  HLS.forEach(m => { if (!m.visible) return; m.material.opacity = .72 + .25 * p; const k = 1 + .07 * p; m.scale.set(m.userData.w * k, 1, m.userData.d * k); });
}
const padOf = (o, w, d, y) => { const v = worldOf(o); return { x: v.x, z: v.z, w, d, y: y == null ? .04 : y }; };

/* world labels (HTML chips following 3D points) */
const chips = {};
const COIN = '<span class="coin"></span>';
function setChip(key, v3, html, cls) {
  let c = chips[key];
  if (!c) { c = chips[key] = { el: document.createElement('div'), txt: '', cls: null }; $('app').appendChild(c.el); }
  if (!v3) { c.el.style.display = 'none'; return; }
  if (c.txt !== html) { c.el.innerHTML = html; c.txt = html; }
  if (c.cls !== cls) { c.el.className = 'wchip ' + (cls || ''); c.cls = cls; }
  const s = screenOf(v3); c.el.style.display = ''; c.el.style.left = s.x + 'px'; c.el.style.top = s.y + 'px';
}

/* camera presets */
const FOC = {
  overview: { x: 8.2, z: 8.6, w: 19.5, h: 11.6 },
  plot: k => ({ x: 6.2, z: PZ[k] + 1.6, w: 10.6, h: 6.6 }),
  coop: { x: 11.8, z: 3.3, w: 10, h: 7 },
  kios: { x: 11.5, z: 10.6, w: 10.5, h: 7 }
};
const focus = (f, instant) => camTo(f.x, f.z, f.w, f.h, instant);
const elderGo = (e, x, z, cb) => { e.tx = x; e.tz = z; e.cb = cb || null; };

/* ---------- the player's own avatar ---------- */
const HUB = { x: 7.6, z: 8.9 };
let PL = null;
function buildPlayer() {
  const old = PL ? PL.g.position.clone() : new THREE.Vector3(HUB.x, 0, HUB.z);
  if (PL) scene.remove(PL.g);
  PL = makeKid(S.look || { g: false, h: 0, c: 0 }); PL.g.position.copy(old); PL.hit = H(PL.g, 1.0, 1.7, .8, 0, 0, 0, { kind: 'elder', who: 'p' }); scene.add(PL.g);
}
const plGo = (x, z) => elderGo(PL, x, z);

/* ---------- game rules ---------- */
const FAST = /[?&]fast/.test(location.search);
const GROW_MS = FAST ? 4000 : 40000, BUILD_MS = FAST ? 3000 : 10000, HUNGRY_MS = FAST ? 8000 : 100000;
const cellsIn = (k, st) => S.plots[k].cs.map((v, i) => v === st ? i : -1).filter(i => i >= 0);
const cnt = (k, st) => cellsIn(k, st).length;
const plotFull = k => cnt(k, 0) === 0;
const cellPad = (k, i) => { const c = P[k].cells[i]; return { x: c.x, z: c.z, w: .94, d: .94, y: .33 }; };
const hungry = () => S.hens > 0 && Date.now() >= S.hungryAt;

/* things the player can make or buy; each has a ghost in the world */
const OFR = [
  { id: 'plot', who: 'k', verb: 'bikin', label: 'petak tanah baru', ghost: makeGhost('plot', 5.6, 2.5, .6),
    price: () => 6 + 2 * (S.unl.plots - 1), avail: () => S.tut >= TUT_N && S.unl.plots < 4 && plotFull(S.unl.plots - 1),
    pos: () => ({ x: 4.5, z: PZ[Math.min(3, S.unl.plots)] + 1 }), pl: () => ({ x: 7.9, z: PZ[Math.min(3, S.unl.plots)] + 2.7 }), focus: () => FOC.plot(Math.min(3, S.unl.plots)) },
  { id: 'coop', who: 'k', verb: 'bikin', label: 'kandang ayam', ghost: makeGhost('coop', 4, 4, 1.2),
    price: () => S.tut === 4 ? 4 : 12, avail: () => !S.unl.coop && (S.tut === 4 || (S.tut >= TUT_N && S.unl.plots >= 2)),
    pos: () => ({ x: 12, z: 3 }), pl: () => ({ x: 10.3, z: 5.5 }), focus: () => FOC.coop },
  { id: 'hen', who: 'n', verb: 'beli', label: 'ayam', ghost: makeGhost('hen', .9, .9, .8),
    price: () => S.tut === 5 ? 3 : 5, avail: () => S.unl.coop && S.hens < 3 && (S.tut === 5 || S.tut >= TUT_N),
    pos: () => ({ x: 10.9 + S.hens * 1.2, z: 3.2 + (S.hens % 2) * .4 }), pl: () => ({ x: 10.3, z: 5.5 }), focus: () => FOC.coop },
  { id: 'kios', who: 'k', verb: 'bikin', label: 'kios', ghost: makeGhost('kios', 4.2, 1.6, 2.3),
    price: () => S.tut === 7 ? 5 : 14, avail: () => S.unl.coop && S.hens >= 1 && !S.unl.kios && (S.tut === 7 || S.tut >= TUT_N),
    pos: () => ({ x: 12, z: 9.4 }), pl: () => ({ x: 8.3, z: 11.4 }), focus: () => FOC.kios }
];
const ofrById = id => OFR.find(o => o.id === id);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const LOCKS = {};
function lockFor(o) {
  if (LOCKS[o.id]) return LOCKS[o.id];
  const pr = o.ghost.box.geometry.parameters, g = new THREE.Group(); scene.add(g);
  V(g, o.id === 'plot' ? 0xa07c55 : 0xa6cf86, pr.width, .05, pr.depth, 0, 0, 0, false);
  const sx = -pr.width / 2 + .6, sz = pr.depth / 2 - .4;
  V(g, 0x8f5d2a, .12, .95, .12, sx, 0, sz, false); V(g, 0xc99a5b, .85, .55, .1, sx, .75, sz, false); V(g, 0xffd34d, .36, .36, .12, sx, .85, sz + .06, false); V(g, 0xffec99, .16, .16, .14, sx, .92, sz + .08, false);
  g.visible = false; return (LOCKS[o.id] = g);
}
/* land that is not bought yet: a big fenced, weedy lot with a padlock sign. It is visible but unusable until it is opened. */
const LOTS = [];
function lotFor(k) {
  if (LOTS[k]) return LOTS[k];
  const g = new THREE.Group(); g.position.set(4.5, 0, PZ[k] + 1); scene.add(g);
  V(g, 0xb8a679, 6.4, .06, 3.2, 0, 0, 0, false); V(g, 0xa69463, 5.6, .03, 2.4, 0, .06, 0, false);
  const post = (x, z) => V(g, 0x8f5d2a, .14, .62, .14, x, 0, z, false);
  for (let i = 0; i <= 8; i++) { const x = -3.1 + i * .775; post(x, -1.55); post(x, 1.55); }
  for (let i = 1; i < 4; i++) { const z = -1.55 + i * .775; post(-3.1, z); post(3.1, z); }
  [[0, -1.55, 6.3, .07], [0, 1.55, 6.3, .07]].forEach(r => V(g, 0xc99a5b, r[2], .08, r[3], r[0], .42, r[1], false));
  V(g, 0xc99a5b, .07, .08, 3.1, -3.1, .42, 0, false); V(g, 0xc99a5b, .07, .08, 3.1, 3.1, .42, 0, false);
  for (let i = 0; i < 16; i++) { const x = -2.6 + ((i * 37) % 53) / 10, z = -1 + ((i * 29) % 21) / 10; V(g, i % 3 ? 0x6f9a4a : 0x8cb35e, .12, .22 + (i % 4) * .06, .12, x, .06, z, false); }
  V(g, 0x9a9a9a, .5, .3, .4, 1.6, .06, .2, false); V(g, 0x8a8a8a, .3, .2, .3, 1.95, .06, -.1, false);
  const sx = -2.5, sz = 1.2;
  V(g, 0x8f5d2a, .14, 1.2, .14, sx, 0, sz, false); V(g, 0xc99a5b, 1.1, .6, .1, sx, .85, sz, false);
  V(g, 0xffd34d, .46, .34, .12, sx, .98, sz + .07, false); V(g, 0xffd34d, .08, .26, .12, sx - .14, 1.3, sz + .07, false); V(g, 0xffd34d, .08, .26, .12, sx + .14, 1.3, sz + .07, false); V(g, 0xffd34d, .36, .08, .12, sx, 1.5, sz + .07, false); V(g, 0x8f5d2a, .1, .14, .14, sx, 1.08, sz + .14, false);
  g.visible = false; return (LOTS[k] = g);
}
function refreshOffers() {
  for (let k = 1; k < 4; k++) { const lot = lotFor(k), mine = S.bld && S.bld.id === 'plot' && k === S.unl.plots, buyable = k === S.unl.plots && ofrById('plot').ghost.g.visible; lot.visible = k >= S.unl.plots && !mine && !buyable; }
  OFR.forEach(o => {
    if (o.id === 'hen' || o.id === 'plot') return;
    const built = o.id === 'plot' ? S.unl.plots >= 4 : S.unl[o.id], lk = lockFor(o);
    lk.visible = !built && !o.ghost.g.visible && !(S.bld && S.bld.id === o.id); if (lk.visible) { const q = o.pos(); lk.position.set(q.x, 0, q.z); }
  });
  OFR.forEach(o => {
    const mine = S.bld && S.bld.id === o.id, show = !mine && o.avail() && (o.id === 'hen' || !S.bld);
    o.ghost.g.visible = show; if (show) { const p = o.pos(); o.ghost.g.position.set(p.x, 0, p.z); }
  });
  SACK.visible = S.hens > 0;
}
function syncHens() { HENS.forEach((h, i) => { h.g.visible = i < S.hens; }); }

/* short messages from Kakek / Nenek while nothing is going on */
let tipT = 0, notifO = null; const NT = {};
function tip(who, text, dur) {
  if (T) { nudge(text); return; }
  showBubble(who, text); bubble.classList.add('tip'); bnum.textContent = ''; setDots([]); say(text, who); tipT = dur || 3;
}
function tipEnd() { hideBubble(); notifO = null; setHL([]); focus(FM != null ? FOC.plot(FM) : FOC.overview); }
function checkNotif() {
  if (T || tipT > 0 || FM != null || cropPick) return;
  for (const o of OFR) {
    if (!o.ghost.g.visible) continue;
    const key = o.id + ':' + S.unl.plots + ':' + S.hens;
    if (NT[key] || S.coins < o.price() || (S.bld && o.id !== 'hen')) continue;
    NT[key] = 1; notifO = o; focus(o.focus());
    const p = o.pos(), pr = o.ghost.box.geometry.parameters; setHL([{ x: p.x, z: p.z, w: pr.width, d: pr.depth, y: .06 }]);
    tip(o.who, `Koinmu sudah cukup! Yuk ${o.verb} ${o.label}.`, 4.5); return;
  }
}

/* ---------- building (Kakek works for a few seconds) ---------- */
let CON = null, conT = 0, patrolT = 0, patrolI = 0, hammerT = 0;
function startConVis(o) {
  const pr = o.ghost.box.geometry.parameters, p = o.pos(), w = pr.width, d = pr.depth;
  const g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
  const col = { plot: 0x8a5a33, coop: 0xd9a766, kios: 0xc98e4f }[o.id], h = { plot: .3, coop: 1.1, kios: 1.5 }[o.id];
  const piv = new THREE.Group(); g.add(piv); V(piv, col, w * .96, h, d * .96, 0, 0, 0); piv.scale.y = .05;
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(s => V(g, 0x8f5d2a, .14, h + .9, .14, s[0] * w / 2, 0, s[1] * d / 2));
  V(g, 0xe9d37a, .5, .3, .5, w / 2 + .5, 0, d / 2 + .3); V(g, 0xe9d37a, .5, .3, .5, w / 2 + .75, .3, d / 2 + .3);
  CON = { g, piv, o, w, d, p };
  patrolT = 0; patrolI = 0;
}
function conPoints() {
  const { p, w, d } = CON;
  return [[-w / 2 - .6, -d / 2 - .6], [w / 2 + .6, -d / 2 - .6], [w / 2 + .6, d / 2 + .6], [-w / 2 - .6, d / 2 + .6]].map(q => ({ x: clamp(p.x + q[0], .6, 15.4), z: clamp(p.z + q[1], .6, 15.4) }));
}
function startBuild(o) {
  S.bld = { id: o.id, at: Date.now() + BUILD_MS, k: S.unl.plots }; save(); startConVis(o); refreshOffers();
  const sp = o.pl(); plGo(sp.x, sp.z);
}
function stepBuild(dt) {
  if (!S.bld || !CON) return;
  const left = S.bld.at - Date.now(), pr = clamp(1 - left / BUILD_MS, 0, 1);
  CON.piv.scale.y = Math.max(.05, pr);
  conT -= dt; if (conT <= 0) { conT = .3; const { p, w, d } = CON; burst(new THREE.Vector3(p.x + (Math.random() - .5) * w, .4, p.z + (Math.random() - .5) * d), [0xf5ecd6, 0xd9c6a0, 0xa9783c], 4, 1.6, .15, .7, 4); }
  patrolT -= dt; if (patrolT <= 0) { patrolT = 2.2; const q = conPoints()[patrolI++ % 4]; elderGo(ELD.k, q.x, q.z); ELD.k.face = CON.p; }
  const e = ELD.k;
  if (e.tx == null) {
    e.g.rotation.y = Math.atan2(CON.p.x - e.g.position.x, CON.p.z - e.g.position.z);
    e.armR.rotation.x = -1.4 + Math.sin(tm * 14) * .6; e.armL.rotation.x = .2;
    hammerT -= dt; if (hammerT <= 0) { hammerT = .45; SFX.hammer(); }
  }
  setChip('bar', new THREE.Vector3(CON.p.x, 2.2, CON.p.z), '🔨<span class="bar"><i style="width:' + Math.round(pr * 100) + '%"></i></span>', 'build');
}
function finishBuild() {
  const b = S.bld; if (!b) return; S.bld = null; const o = ofrById(b.id); let fx = new THREE.Vector3(o.pos().x, 1, o.pos().z);
  if (CON) { scene.remove(CON.g); CON = null; } setChip('bar', null);
  if (b.id === 'plot') { const k = S.unl.plots; S.unl.plots++; const p = buildPlot(k); restorePlot(k); dropIn(p.g); fx = new THREE.Vector3(4.5, 1, PZ[k] + 1); }
  else if (b.id === 'coop') { S.unl.coop = true; coopG.visible = true; dropIn(coopG); }
  else { S.unl.kios = true; kiosG.visible = true; dropIn(kiosG); }
  save(); refreshOffers(); SFX.good(); burst(fx, CONF, 30, 5, .17, 1.3); ELD.k.cheer = 1.6; ELD.k.tx = null; ELD.k.armR.rotation.x = 0;
  const tutAdv = b.id === 'coop' && S.tut === 4 ? 5 : b.id === 'kios' && S.tut === 7 ? 8 : 0;
  if (!T) { focus(b.id === 'plot' ? FOC.plot(S.unl.plots - 1) : o.focus()); if (tutAdv) advTut(tutAdv); else tip('k', `Selesai! ${cap(o.label)} sudah jadi.`, 3.5); } else if (tutAdv) advTut(tutAdv);
}
function dropIn(g, cb) {
  g.position.y = 6;
  tween(.8, k => { g.position.y = lerp(6, 0, k); }, () => { g.position.y = 0; SFX.soft(); if (cb) cb(); }, 0, EZ.out);
}

/* ---------- tasks ---------- */
const TK = {};
function setText(t) { if (!T) return; T.text = t; T.idle = 0; btext.textContent = t; say(t, T.who); }
function startTask(t) {
  if (T || paused) return false;
  t.idle = 0; t.locked = false; t.k = 0; T = t; hideArrow(); setHL([]); notifO = null; tipT = 0;
  TK[t.type].start(); return true;
}
function complete(msg, coins) {
  const t = T; t.locked = true; picks = []; hideArrow(); setHL([]);
  ELD[t.who].cheer = 1.7; SFX.good(); burst(t.fx || new THREE.Vector3(8, 1.5, 8), CONF, 28, 5, .17, 1.25);
  btext.textContent = msg; say(msg, t.who); if (coins) addCoins(coins);
  after(2.1, () => { if (T === t) endTask(); });
}
function endTask() {
  const t = T; if (TK[t.type].cleanup) TK[t.type].cleanup();
  hideChoices(); hideBubble(); T = null; if (t.type !== 'pay') S.done++; save(); updateHud(); refreshOffers();
  if (FM != null && (t.type === 'plant' || t.type === 'water' || t.type === 'harvest')) focus(FOC.plot(FM)); else { focus(FOC.overview); plGo(HUB.x, HUB.z); }
  if (t.type === 'plant' && S.tut === 0) advTut(1); else if (t.type === 'water' && S.tut === 1) advTut(2); else if (t.type === 'harvest' && S.tut === 3) advTut(4);
  else if (t.type === 'pay' && t.id === 'hen' && S.tut === 5) advTut(6); else if (t.type === 'feed' && S.tut === 6) advTut(7); else if (t.type === 'sell' && S.tut === 8) advTut(9);
}
const kakekBusy = () => { if (!S.bld) return false; tip('k', `Kakek lagi bikin ${ofrById(S.bld.id).label}. Tunggu ya.`); return true; };

/* 0. PAY: count out the coins one by one */
TK.pay = {
  start() {
    const o = T.o = ofrById(T.id), p = o.pos(), pr = T.price = o.price(); T.fx = new THREE.Vector3(p.x, 1.2, p.z); T.who = o.who;
    focus(o.focus()); const sp = o.pl(); plGo(sp.x, sp.z);
    header(o.who, `${cap(o.verb)} ${o.label}! Butuh ${numWord(pr)} koin. Seret koinnya satu-satu ke tempat yang bersinar!`, pr, dotsOf(pr, 'a'));
    picks = []; const pr2 = o.ghost.box.geometry.parameters; setHL([{ x: p.x, z: p.z, w: pr2.width, d: pr2.depth, y: .06 }]);
    choicesEl.innerHTML = ''; const b = document.createElement('button'); b.className = 'choice coinbtn'; b.innerHTML = '<i></i>'; b.setAttribute('aria-label', 'Seret koin');
    b.addEventListener('pointerdown', e => TK.pay.drag(e, b)); choicesEl.appendChild(b);
    if (!S.dragSeen) { S.dragSeen = true; save(); after(.7, () => { if (T && T.type === 'pay' && !T.locked && T.k === 0) showHandDrag(coinBtnPt(), new THREE.Vector3(p.x, .6, p.z)); }); }
  },
  /* coins are spent by dragging them onto the thing being made */
  drag(e, b) {
    const t = T; if (!t || t.type !== 'pay' || t.locked || S.coins <= 0) return; e.preventDefault(); ac(); t.idle = 0; hideArrow();
    const f = document.createElement('div'); f.className = 'dragcoin'; $('app').appendChild(f); b.classList.add('lifted');
    const p = t.o.pos(), near = ev => { const sc = screenOf(new THREE.Vector3(p.x, .6, p.z)); return Math.hypot(ev.clientX - sc.x, ev.clientY - sc.y) < 110; };
    const mv = ev => { f.style.left = ev.clientX + 'px'; f.style.top = ev.clientY + 'px'; f.classList.toggle('over', near(ev)); };
    const up = ev => {
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); b.classList.remove('lifted');
      const ok = ev.type === 'pointerup' && near(ev) && T === t; f.remove();
      if (ok) TK.pay.coin(); else if (T === t) nudge('Seret koinnya ke tempat yang bersinar.');
    };
    mv(e); window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  },
  coin() {
    const t = T; if (!t || t.type !== 'pay' || t.locked || S.coins <= 0) return; t.idle = 0;
    S.coins--; t.k++; $('coinN').textContent = S.coins; SFX.coin(); markDot(t.k - 1); say(numWord(t.k), t.who);
    const p = t.o.pos(); popNum(new THREE.Vector3(p.x, 1.4, p.z), String(t.k)); burst(new THREE.Vector3(p.x, 1.2, p.z), [0xffd34d, 0xffe58a], 5, 2, .12, .6, 6);
    if (t.k === t.price) {
      hideChoices(); const o = t.o;
      if (o.id === 'hen') {
        const h = HENS[S.hens]; if (S.hens === 0) S.hungryAt = Date.now() + (FAST ? 3000 : 20000);
        S.hens++; h.g.visible = true; h.g.position.set(p.x, 0, p.z); popScale(h.g, .1, .5); SFX.cluck(); burst(new THREE.Vector3(p.x, 1, p.z), CONF, 16, 3, .14, 1, 5);
        save(); refreshOffers(); complete('Selamat datang, ayam!', 0);
      } else { startBuild(o); complete(`Terima kasih! Kakek ${o.verb} ${o.label} ya.`, 0); }
    } else save();
  },
  hint() { const p = T.o.pos(); return { drag: [coinBtnPt(), new THREE.Vector3(p.x, .6, p.z)], text: 'Seret koinnya ke tempat yang bersinar.' }; }
};

/* 1. PLANT (Kakek): tap n empty holes, counting one by one */
const hlEmpty = () => setHL(cellsIn(T.plot, 0).map(i => cellPad(T.plot, i)));
let lastCrop = -1;
TK.plant = {
  start() {
    const sp = S.plots[T.plot], p = P[T.plot];
    if (sp.cs.every(v => v === 0)) { sp.c = T.crop != null ? T.crop : pick(availCrops().filter(c => c !== lastCrop)); lastCrop = sp.c; }
    T.cn = CROPS[sp.c].name; T.fx = new THREE.Vector3(4.5, 1.2, p.zs + 1); T.who = 'k';
    elderGo(ELD.k, 8.4, p.zs - .6); plGo(7.9, p.zs + 2.7); focus(FOC.plot(T.plot));
    header('k', `Ayo tanam ${NUM[T.n]} bibit ${T.cn}!`, T.n, dotsOf(T.n, 'n'));
    picks = p.cells.map(c => c.hit); hlEmpty();
  },
  tap(d) {
    if (d.kind !== 'cell' || d.plot !== T.plot) return;
    const p = P[T.plot], sp = S.plots[T.plot], c = p.cells[d.i];
    if (sp.cs[d.i] !== 0) { nudge('Tanahnya sudah terisi.'); return; }
    if (T.k >= T.n) { nudge(`Cukup! Sudah ${NUM[T.n]}.`); return; }
    sp.cs[d.i] = 1; c.planted = true; setStage(c, 'seed', sp.c); popScale(c.parts.seed, .2, .35);
    T.k++; markDot(T.k - 1); SFX.pop(T.k); say(NUM[T.k], 'k'); popNum(new THREE.Vector3(c.x, .9, c.z), String(T.k));
    burst(new THREE.Vector3(c.x, .4, c.z), [0x8a5a33, 0xb07a45], 6, 1.6, .08, .5);
    hlEmpty(); save();
    if (T.k === T.n) complete(`${pick(PRAISE)} ${NUM[T.n]} bibit ${T.cn}!`, T.n);
  },
  hint() { const i = cellsIn(T.plot, 0)[0]; if (i == null) return null; const c = P[T.plot].cells[i]; return { pos: new THREE.Vector3(c.x, .6, c.z), text: 'Ayo, tap tanah yang bersinar.' }; }
};

/* 2. WATER (Kakek): one tap per seedling, the can goes to it */
const hlWater = () => setHL(T.cells.filter(i => !T.got.has(i)).map(i => cellPad(T.plot, i)));
TK.water = {
  start() {
    const p = P[T.plot], sp = S.plots[T.plot]; T.cells = cellsIn(T.plot, 1).slice(0, T.n); T.got = new Set(); T.cn = CROPS[sp.c].name; T.busy = 0; T.who = 'k';
    T.fx = new THREE.Vector3(4.5, 1.2, p.zs + 1);
    elderGo(ELD.k, 8.4, p.zs - .6); plGo(7.9, p.zs + 2.7); focus(FOC.plot(T.plot));
    CAN.position.set(8.0, 1.2, p.zs + 2.5); CAN.rotation.set(0, Math.PI, 0); CAN.visible = true; popScale(CAN, .2, .4);
    header('k', `Siram ${NUM[T.n]} tanaman ${T.cn}!`, T.n, dotsOf(T.n, 'n'));
    picks = T.cells.map(i => p.cells[i].hit); hlWater();
  },
  tap(d) {
    if (d.kind !== 'cell' || d.plot !== T.plot) return;
    if (!T.cells.includes(d.i)) { nudge('Siram yang bersinar ya.'); return; }
    if (T.got.has(d.i) || T.busy) return;
    const sp = S.plots[T.plot], p = P[T.plot], cell = p.cells[d.i];
    T.got.add(d.i); T.k++; T.busy = 1; markDot(T.k - 1); SFX.pop(T.k); say(NUM[T.k], 'k'); popNum(new THREE.Vector3(cell.x, 1.3, cell.z), String(T.k));
    sp.cs[d.i] = 2; sp.r[d.i] = Date.now() + GROW_MS; cell.boost = 0; save(); hlWater();
    const to = new THREE.Vector3(cell.x + .72, 1.15, cell.z);
    flyTo(CAN, to, .35, .25, () => {
      SFX.water();
      tween(.55, k => { CAN.rotation.z = -.85 * Math.sin(k * Math.PI); }, () => { CAN.rotation.z = 0; T.busy = 0; }, 0, EZ.lin);
      for (let j = 0; j < 8; j++) burst(new THREE.Vector3(cell.x + .12 + Math.random() * .1, 1.0 + Math.random() * .2, cell.z + (Math.random() - .5) * .3), WATER, 1, .3, .09, .45, 16);
      after(.25, () => { setStage(cell, 'sprout', sp.c); popScale(cell.parts.sprout, .2, .35); });
    });
    if (T.k === T.n) complete(`${pick(PRAISE)} ${NUM[T.n]} tanaman disiram!`, T.n);
  },
  cleanup() { const c = CAN; tween(.4, k => c.scale.setScalar(1 - k), () => { c.visible = false; c.scale.setScalar(1); }, 0, EZ.lin); },
  hint() { const i = T.cells.find(x => !T.got.has(x)); if (i == null) return null; const c = P[T.plot].cells[i]; return { pos: new THREE.Vector3(c.x, .9, c.z), text: 'Tap tanaman yang bersinar.' }; }
};

/* 3. HARVEST (Kakek): tap each ripe crop, one tap per crop (no dragging) */
function harvUi() {
  const tgt = T.cells.filter(i => !T.got.has(i));
  picks = tgt.map(i => P[T.plot].cells[i].hit); setHL(tgt.map(i => cellPad(T.plot, i)));
}
TK.harvest = {
  start() {
    const sp = S.plots[T.plot], p = P[T.plot]; T.cells = cellsIn(T.plot, 3).slice(0, T.n); T.got = new Set(); T.sel = null; T.cn = CROPS[sp.c].name; T.fx = new THREE.Vector3(6, 1.2, p.zs + 1.5); T.who = 'k';
    elderGo(ELD.k, 8.4, p.zs - .6); plGo(7.9, p.zs + 2.7); focus(FOC.plot(T.plot));
    trayClear(p.crate); p.crate.visible = true; popScale(p.crate, .2, .4);
    header('k', `Panen ${NUM[T.n]} ${T.cn}! Tap sayurnya satu-satu.`, T.n, dotsOf(T.n, 'n'));
    harvUi(); TK.harvest.demo(true);
  },
  tap(d) {
    if (d.kind === 'cell' && d.plot === T.plot) {
      if (!T.cells.includes(d.i) || T.got.has(d.i)) { nudge('Tap yang bersinar ya.'); return; }
      TK.harvest.take(d.i);
    }
  },
  /* one ready plant goes into the crate */
  take(i) {
    const sp = S.plots[T.plot], p = P[T.plot]; if (T.got.has(i) || !T.cells.includes(i)) return;
    T.got.add(i); if (T.sel === i) T.sel = null;
    const c = p.cells[i], it = c.parts.grown; scene.attach(it); it.scale.setScalar(.5);
    const idx = T.k; T.k++; markDot(idx); SFX.pop(T.k); say(NUM[T.k], 'k'); popNum(new THREE.Vector3(p.crate.position.x, 1.2, p.crate.position.z), String(T.k));
    flyToHud(CROPS[sp.c].e, new THREE.Vector3(c.x, 1, c.z), 1, 'prog');
    trayPut(p.crate, idx, it, .5, 1.6);
    c.parts = null; setStage(c, 'none'); c.planted = false; sp.cs[i] = 0; sp.r[i] = 0; S.inv[sp.c]++; save(); updateHud();
    T.text = `Panen ${NUM[T.n]} ${T.cn}!`; btext.textContent = T.text; hideArrow();
    if (T.k === T.n) { picks = []; setHL([]); complete(`${pick(PRAISE)} ${NUM[T.n]} ${T.cn} di peti!`, T.n); } else harvUi();
  },
  demo(on) {
    const t = T.cells.filter(i => !T.got.has(i)), p = P[T.plot]; if (!t.length) return;
    const w = i => new THREE.Vector3(p.cells[i].x, .5, p.cells[i].z);
    if (on) after(.8, () => { if (T && T.type === 'harvest' && !T.locked && T.k === 0) { showHandTap(w(t[0])); } });
  },
  cleanup() {
    const p = P[T.plot], items = p.crate.userData.items.slice();
    tween(.5, k => items.forEach(it => it && it.scale.setScalar(.5 * (1 - k))), () => { trayClear(p.crate); p.crate.visible = false; }, 0, EZ.lin);
  },
  hint() { const p = P[T.plot], r = T.cells.filter(x => !T.got.has(x)); if (!r.length) return null; return { pos: new THREE.Vector3(p.cells[r[0]].x, .5, p.cells[r[0]].z), text: 'Tap sayur yang bersinar.' }; }
};

/* 4. FEED (Nenek): number bond, 2 corn kernels per hen */
TK.feed = {
  start() {
    const N = T.N, k0 = T.k0; T.k = k0; T.fx = new THREE.Vector3(12, 1.2, 3.6); T.who = 'n';
    elderGo(ELD.n, 9.2, 4.4); plGo(10.3, 5.5); focus(FOC.coop);
    T.tray = makeTray(N, Math.min(N, 6), .4, 0xc98e4f, 0xa9783c); T.tray.position.set(12, 0, 4.2); scene.add(T.tray); popScale(T.tray, .2, .4);
    for (let i = 0; i < k0; i++) trayPlace(T.tray, i, makeSeedItem(0xf2c038));
    HENS.forEach((h, i) => { if (i >= S.hens) return; h.busy = true; h.tx = 11.1 + i * .9; h.tz = 3.5; h.cb = () => { h.g.rotation.y = 0; }; });
    const dots = [...dotsOf(k0, 'g on'), ...dotsOf(N - k0, 'add')];
    header('n', `Ayam lapar! Ayam butuh ${NUM[N]} biji jagung. Sudah ada ${NUM[k0]}. Tambah lagi ya!`, N, dots);
    picks = [SACK.userData.hit]; T.hlUi = () => setHL([padOf(SACK, 1, 1, .04)]); T.hlUi();
  },
  tap(d) {
    if (d.kind !== 'sack') return;
    if (T.k >= T.N) { nudge(`Cukup! Sudah ${NUM[T.N]}.`); return; }
    const idx = T.k; T.k++;
    const it = makeSeedItem(0xf2c038); it.position.copy(worldOf(SACK)); it.position.y += .9;
    trayPut(T.tray, idx, it, .5, 1.4);
    markDot(idx); SFX.pop(T.k); say(NUM[T.k], 'n'); popNum(new THREE.Vector3(SACK.position.x, 1.6, SACK.position.z), String(T.k)); hop(SACK, .15, .25);
    if (T.k === T.N) {
      const N = T.N, k0 = T.k0; S.eggs += S.hens; S.hungryAt = Date.now() + HUNGRY_MS; setHL([]); updateHud();
      HENS.forEach(h => { h.eat = 1.6; });
      bnum.textContent = `${k0} + ${N - k0} = ${N}`;
      T.eggs = [];
      after(.9, () => {
        for (let i = 0; i < S.hens; i++) {
          const h = HENS[i], egg = makeEggItem(); egg.position.set(h.g.position.x + .5, 0, h.g.position.z + .3); scene.add(egg); popScale(egg, .1, .4); T.eggs.push(egg);
          burst(new THREE.Vector3(egg.position.x, .5, egg.position.z), [0xffffff, 0xffe9a8], 6, 2, .1, .8);
        }
        SFX.cluck(); after(.25, SFX.cluck);
      });
      complete(`${pick(PRAISE)} ${NUM[k0]} dan ${NUM[N - k0]}, jadi ${NUM[N]}!`, N);
    } else T.hlUi();
  },
  cleanup() {
    const tray = T.tray, eggs = T.eggs || [];
    HENS.forEach(h => { h.busy = false; h.tx = null; h.wait = 1.2; });
    tween(.5, k => { tray.scale.setScalar(1 - k); eggs.forEach(e => e.scale.setScalar(1 - k)); }, () => { scene.remove(tray); eggs.forEach(e => scene.remove(e)); }, 0, EZ.lin);
  },
  hint() { return { pos: new THREE.Vector3(SACK.position.x, 1.3, SACK.position.z), text: 'Tap karung jagungnya.' }; }
};

/* 5. SELL (Nenek): load the order (stock goes down as you tap), then answer the total */
let CUST = null, custT = 4, kiosCrop = -1;
function syncKios() {
  if (!S.unl.kios) return;
  const c = T && T.type === 'sell' ? T.cr : CUST ? CUST.cr : S.inv.indexOf(Math.max(...S.inv));
  if (c !== kiosCrop) { kiosCrop = c; setVegCrate(c); }
}
function spawnCust() {
  const stock = [0, 1, 2, 3].filter(i => S.inv[i] > 0); if (!stock.length || S.eggs < 1) return;
  const mx = maxN(), cr = pick(stock), A = rand(1, Math.min(S.inv[cr], mx - 1)), B = rand(1, Math.min(S.eggs, mx - A));
  const g = makeVillager(); g.position.set(18, 0, 13.4); scene.add(g); g.hit = H(g, .9, 1.7, .9, 0, 0, 0, { kind: 'cust' });
  CUST = { g, cr, A, B, ready: false, busy: false };
  walkTo(g, 12.2, 13.4, 3.2, () => { if (CUST && CUST.g === g) { CUST.ready = true; g.rotation.y = Math.PI * .75; SFX.hello(); } });
}
function trySell() {
  if (!CUST || !CUST.ready) { tip('n', 'Belum ada pelanggan. Tunggu ya.'); return; }
  if (CUST.busy) return; CUST.busy = true; startTask({ type: 'sell', cr: CUST.cr, A: CUST.A, B: CUST.B, cust: CUST });
}
function recount() {
  const t = T; if (!t) return; const items = t.basket.userData.items.filter(Boolean);
  items.forEach((it, i) => after(1.5 + i * .62, () => {
    if (T !== t) return; SFX.pop(i + 1); say(NUM[i + 1], 'n');
    tween(.35, k => it.scale.setScalar(it.userData.s * (1 + .45 * Math.sin(k * Math.PI))), () => it.scale.setScalar(it.userData.s), 0, EZ.lin);
    popNum(worldOf(it).add(new THREE.Vector3(0, .8, 0)), String(i + 1));
  }));
}
function sellAnswer(v, btn) {
  const t = T; if (!t || t.type !== 'sell' || t.phase !== 'ask') return; t.idle = 0;
  const tot = t.A + t.B;
  if (v === tot) {
    t.phase = 'done'; btn.classList.add('ok'); bnum.textContent = `${t.A} + ${t.B} = ${tot}`;
    hop(t.cust.g, .4, .4); burst(new THREE.Vector3(t.cust.g.position.x, 1.8, t.cust.g.position.z), [0xff6b8b, 0xffb3c1], 12, 3, .15, 1.0, 3);
    after(.7, () => { if (T === t) hideChoices(); });
    complete(`${pick(PRAISE)} ${NUM[t.A]} dan ${NUM[t.B]}, jadi ${NUM[tot]}!`, tot);
    after(1.3, () => { if (T === t) walkTo(t.cust.g, 18.5, 13.4, 3.2, null); });
  } else {
    btn.classList.add('no'); setTimeout(() => btn.classList.remove('no'), 450);
    nudge('Hitung lagi ya.'); recount();
  }
}
const sellHL = () => setHL([T.a < T.A ? padOf(vegHit, 1.3, 1.0, .04) : null, T.b < T.B ? padOf(eggHit, 1.3, 1.0, .04) : null].filter(Boolean));
TK.sell = {
  start() {
    const A = T.A, B = T.B, cn = CROPS[T.cr].name; T.a = 0; T.b = 0; T.phase = 'load'; T.fx = new THREE.Vector3(12, 1.4, 11); T.who = 'n';
    syncKios();
    elderGo(ELD.n, 8.5, 10.9); plGo(15, 12.2); focus(FOC.kios);
    T.basket = makeTray(10, 5, .42, 0xc98e4f, 0xa9783c); T.basket.position.set(12, 0, 11.4); scene.add(T.basket); popScale(T.basket, .2, .4);
    header('n', `Pelanggan mau ${NUM[A]} ${cn} dan ${NUM[B]} telur.`, `${A} + ${B}`, [...dotsOf(A, 'a'), '+', ...dotsOf(B, 'b')]);
    picks = [vegHit, eggHit]; sellHL();
  },
  tap(d) {
    if (T.phase !== 'load' || (d.kind !== 'veg' && d.kind !== 'egg')) return;
    const veg = d.kind === 'veg', have = veg ? T.a : T.b, want = veg ? T.A : T.B, cn = CROPS[T.cr].name;
    if (have >= want) { nudge(veg ? `${cn} cukup, ${NUM[want]}.` : `Telurnya cukup, ${NUM[want]}.`); return; }
    if (veg) { T.a++; S.inv[T.cr]--; } else { T.b++; S.eggs--; }
    updateHud(); save();
    const cnum = veg ? T.a : T.b, dotIx = veg ? T.a - 1 : T.A + T.b - 1, idx = T.a + T.b - 1;
    const it = veg ? cropParts(T.cr).grown : makeEggItem(), s = veg ? .5 : 1, src = worldOf(veg ? vegHit : eggHit); it.userData.s = s; it.scale.setScalar(s); it.position.copy(src); it.position.y += .5;
    trayPut(T.basket, idx, it, .55, 1.6);
    markDot(dotIx); SFX.pop(cnum); say(NUM[cnum], 'n'); popNum(new THREE.Vector3(src.x, 2.2, src.z), String(cnum));
    sellHL();
    if (T.a === T.A && T.b === T.B) { setHL([]); after(.9, () => { if (T.phase === 'load') ask(); }); }
  },
  cleanup() {
    const basket = T.basket, cust = T.cust; hideChoices(); CUST = null; custT = 6;
    tween(.5, k => basket.scale.setScalar(1 - k), () => { scene.remove(basket); }, 0, EZ.lin);
    after(1.6, () => { scene.remove(cust.g); });
  },
  hint() {
    if (T.phase !== 'load') return { pos: null, text: 'Pilih angkanya ya.' };
    const veg = T.a < T.A; return { pos: worldOf(veg ? vegHit : eggHit).add(new THREE.Vector3(0, 1.1, 0)), text: veg ? `Tap ${CROPS[T.cr].name}nya.` : 'Tap telurnya.' };
  }
};
function ask() {
  const t = T; if (!t) return; t.phase = 'ask'; picks = [];
  const tot = t.A + t.B, opts = new Set([tot]);
  while (opts.size < 3) { const c = tot + pick([-2, -1, 1, 2]); if (c >= 1 && c <= 10) opts.add(c); }
  const vals = [...opts].sort(() => Math.random() - .5);
  t.text = 'Ada berapa semuanya?'; btext.textContent = t.text; say(t.text, 'n'); showChoices(vals, sellAnswer);
}

/* ---------- hub: the child decides what to do by tapping the farm ---------- */
/* which crops can be planted: 3 at first, the 4th comes with the second plot of land */
const availCrops = () => S.unl.plots >= 2 ? [0, 1, 2, 3] : [0, 1, 2];
let cropPick = false;
function closePick() { cropPick = false; tKey = ''; hideChoices(); hideBubble(); stopSpeech(); }
function pickCrop(cb) {
  cropPick = true; const q = 'Mau tanam apa? Pilih satu ya!'; showBubble('k', q); bnum.textContent = ''; setDots([]); say(q, 'k'); hideArrow();
  choicesEl.innerHTML = '';
  availCrops().forEach(c => { const b = document.createElement('button'); b.className = 'choice crop'; b.innerHTML = CROPS[c].e + '<small>' + CROPS[c].name + '</small>'; b.setAttribute('aria-label', CROPS[c].name); b.addEventListener('click', () => { ac(); SFX.pop(c); closePick(); cb(c); }); choicesEl.appendChild(b); });
}
function farmAct(k, kind) {
  if (T || kakekBusy()) return; const mx = maxN();
  if (kind === 'plant' && cnt(k, 0)) {
    const go = c => startTask({ type: 'plant', plot: k, n: rand(1, Math.min(mx, cnt(k, 0))), crop: c });
    if (S.plots[k].cs.every(v => v === 0)) pickCrop(go); else go(null);
  }
  else if (kind === 'water' && cnt(k, 1)) startTask({ type: 'water', plot: k, n: Math.min(cnt(k, 1), mx) });
  else if (kind === 'harvest' && cnt(k, 3)) startTask({ type: 'harvest', plot: k, n: Math.min(cnt(k, 3), mx, 10) });
}
function enterFarm(k) { FM = k; focus(FOC.plot(k)); plGo(7.9, P[k].zs + 2.7); if (!S.bld) elderGo(ELD.k, 8.4, P[k].zs - .6); }
function exitFarm() { if (FM == null) return; FM = null; setHL([]); focus(FOC.overview); plGo(HUB.x, HUB.z); }
function tapPlot(k, pt) {
  if (T) return;
  if (FM !== k) enterFarm(k);
  const sp = S.plots[k], p = P[k];
  const col = clamp(Math.floor(pt.x - 2), 0, 4), row = clamp(Math.floor(pt.z - p.zs), 0, 1), st = sp.cs[row * 5 + col];
  if (st === 2) { cheerCell(k, row * 5 + col); return; }
  farmAct(k, st === 0 ? 'plant' : st === 1 ? 'water' : 'harvest');
}
/* farm-mode toolbar: one bar with plant / water / harvest, the next useful one glows */
const toolsEl = $('tools'); let tKey = '';
toolsEl.innerHTML = '<div id="tooltxt"></div><div id="toolrow">' + [['plant', '🌱', 'Tanam'], ['water', '💧', 'Siram'], ['harvest', '🧺', 'Panen']].map(t => '<button class="tb" data-a="' + t[0] + '"><b class="bd"></b><span class="ti">' + t[1] + '</span><span class="tl">' + t[2] + '</span></button>').join('') + '<button class="tb tx" data-a="exit" aria-label="Selesai"><span class="ti">✕</span><span class="tl">Selesai</span></button></div>';
toolsEl.addEventListener('click', e => { const b = e.target.closest('.tb'); if (!b) return; ac(); SFX.pop(2); if (b.dataset.a === 'exit') exitFarm(); else if (FM != null) farmAct(FM, b.dataset.a); });
function toolsSync() {
  const show = started && !paused && !touring && !stOn && FM != null && !T && !cropPick && $('tutend').hidden;
  let key = '0'; if (show) key = '1:' + [0, 1, 2, 3].map(i => cnt(FM, i)).join(',');
  if (key === tKey) return; tKey = key; toolsEl.hidden = !show; if (!show) return;
  const c = [0, 1, 2, 3].map(i => cnt(FM, i)), cs = { plant: c[0], water: c[1], harvest: c[3] }, next = c[3] ? 'harvest' : c[1] ? 'water' : c[0] ? 'plant' : null;
  toolsEl.querySelectorAll('.tb[data-a]').forEach(b => { const a = b.dataset.a; if (a === 'exit') return; b.disabled = !cs[a]; b.classList.toggle('glow', a === next); b.querySelector('.bd').textContent = cs[a] || ''; });
  $('tooltxt').textContent = next ? '' : c[2] ? 'Sayurnya sedang tumbuh. Tap tanamannya biar semangat!' : '';
  $('tooltxt').style.display = $('tooltxt').textContent ? '' : 'none';
}
/* waiting is play: tapping a growing plant cheers it on and helps it grow a bit */
function cheerCell(k, i) {
  const c = P[k].cells[i], sp = S.plots[k]; if (!c || !c.parts || !c.parts.sprout) return;
  wiggle(c.parts.sprout); SFX.pop(rand(1, 5)); SFX.soft();
  burst(new THREE.Vector3(c.x, .9, c.z), [0xff8fb1, 0xffc2d6, 0x9be37f], 7, 2, .1, .8, 3);
  popNum(new THREE.Vector3(c.x, 1.2, c.z), '💚');
  c.boost = c.boost || 0; if (c.boost < 3) { c.boost++; sp.r[i] -= GROW_MS * .1; save(); }
  else if (!(c.boost++ % 3)) say('Semangat!', 'k');
}
function offerTap(o) {
  if (T) return;
  if (S.bld && o.id !== 'hen') { kakekBusy(); return; }
  const pr = o.price();
  if (S.coins < pr) { tip(o.who, `Koinnya kurang ${numWord(pr - S.coins)} lagi.`); return; }
  startTask({ type: 'pay', id: o.id });
}
function tryFeed() {
  if (T || !S.hens) return;
  if (!hungry()) { tip('n', 'Ayamnya masih kenyang.'); return; }
  startTask({ type: 'feed', N: 2 * S.hens, k0: rand(1, 2 * S.hens - 1) });
}
let lastHg = -1, lastCust = null;
function hubAlerts() {
  const waiting = CUST && CUST.ready && !CUST.busy, hg = hungry();
  if (waiting && lastCust !== CUST) { lastCust = CUST; if (!S.tutC && FM == null) { S.tutC = true; save(); focus(FOC.kios); notifO = true; tip('n', 'Ada pelanggan! Tap pelanggannya ya.', 4.5); setHL([padOf(CUST.g, 1.2, 1.2, .04)]); return; } }
  if (hg && lastHg !== S.hungryAt) { lastHg = S.hungryAt; if (!S.tutH && FM == null) { S.tutH = true; save(); focus(FOC.coop); notifO = true; tip('n', 'Ayam lapar! Tap karung jagungnya ya.', 4.5); setHL([padOf(SACK, 1, 1, .04)]); return; } }
  const l = [];
  if (S.tut < 4) {
    const tc = cellsIn(0, [0, 1, 2, 3][S.tut]); tc.forEach(i => l.push(cellPad(0, i)));
    if (tutIdle > 5 && tc.length && !HND) { const c = P[0].cells[tc[0]]; showHandTap(new THREE.Vector3(c.x, .5, c.z)); HND.tut = true; }
    else if (HND && HND.tut && (tutIdle <= 5 || !tc.length)) hideArrow();
  }
  if (hg) l.push(padOf(SACK, 1, 1, .04));
  if (waiting) l.push(padOf(CUST.g, 1.2, 1.2, .04));
  setHL(l);
}
let introDone = false, tutIdle = 0;
/* ---------- tutorial: 9 small missions (farm, chickens, shop), then it is clearly over ---------- */
const TUT_N = 9;
const TUT = [
  { ic: '🌱', t: 'Misi 1: Tanam bibit. Tap tanah yang bersinar.' },
  { ic: '💧', t: 'Misi 2: Siram bibitnya. Tap yang bersinar.' },
  { ic: '⏳', t: 'Misi 3: Tunggu tumbuh. Tap tanamannya biar semangat!' },
  { ic: '🧺', t: 'Misi 4: Panen! Tap sayurnya satu-satu.' },
  { ic: '🏠', t: 'Misi 5: Bikin kandang ayam. Seret koinnya!' },
  { ic: '🐔', t: 'Misi 6: Beli ayam. Seret koinnya!' },
  { ic: '🌽', t: 'Misi 7: Ayam lapar! Tap karung jagungnya.' },
  { ic: '🏪', t: 'Misi 8: Bikin kios. Seret koinnya!' },
  { ic: '🛒', t: 'Misi 9: Layani pelanggan. Tap pelanggannya!' }
];
const TUT_TIP = ['Ayo tanam bibit! Tap tanah yang bersinar.', 'Siram bibitnya ya! Tap yang bersinar.', 'Tap tanamannya biar semangat dan cepat tumbuh.', 'Sayurnya sudah matang! Tap sayurnya satu-satu untuk panen.',
  'Ayo bikin kandang ayam! Seret koinnya ke tempat yang bersinar.', 'Ayo beli ayam! Seret koinnya ke tempat yang bersinar.', 'Ayam lapar! Tap karung jagungnya.', 'Ayo bikin kios! Seret koinnya ke tempat yang bersinar.', 'Ada pelanggan! Tap pelanggannya ya.'];
let mKey = '';
function tutSync() {
  const show = started && !touring && S.tut < TUT_N, key = show ? 'm' + S.tut : '';
  if (key === mKey) return; mKey = key;
  const el = $('mission'); el.hidden = !show; if (!show) return;
  el.innerHTML = '<div class="msteps">' + TUT.map((s, i) => (i ? '<span class="msl"></span>' : '') + '<span class="ms ' + (i < S.tut ? 'ok' : i === S.tut ? 'on' : '') + '">' + (i < S.tut ? '✓' : s.ic) + '</span>').join('') + '</div><div class="mtxt">' + TUT[S.tut].t + '</div>';
}
function advTut(n) {
  S.tut = n; save(); tutIdle = 0; SFX.good();
  if (n >= TUT_N) { after(.7, showTutEnd); return; }
  const gift = { 4: 'coop', 5: 'hen', 7: 'kios' }[n], need = gift ? ofrById(gift).price() : 0, short = S.coins < need;
  if (short) { S.coins = need; updateHud(); }
  if (n === 8) custT = 1.5;
  if (n === 6) { S.hungryAt = Date.now() + (FAST ? 1500 : 2500); lastHg = -1; }
  const TXT = ['', 'Bagus! Sekarang siram bibitnya.', 'Bagus! Sekarang tunggu tumbuh. Tap tanamannya biar semangat!', 'Sayurnya matang! Sekarang panen.',
    (short ? 'Ini koin dari Kakek! ' : '') + 'Sekarang kita bikin kandang ayam. Seret koinnya ke tempat yang bersinar.',
    'Kandang sudah jadi! ' + (short ? 'Ini koin dari Nenek. ' : '') + 'Ayo beli ayam. Seret koinnya!',
    'Ayamnya senang! Tapi sekarang ayam lapar. Tap karung jagungnya.',
    'Ayam bertelur! ' + (short ? 'Ini koin dari Kakek. ' : '') + 'Sekarang bikin kios untuk jualan. Seret koinnya!',
    'Kios sudah jadi! Sebentar lagi ada pelanggan. Tap pelanggannya ya.'];
  tip(n >= 7 || n === 6 ? 'n' : 'k', TXT[n], 4);
}
function showTutEnd() {
  paused = true; stopSpeech(); $('tutend').hidden = false; SFX.good(); say('Hebat! Tutorial selesai! Sekarang kamu bisa bertani sendiri.', 'k');
  [ELD.k, ELD.n, PL].forEach(e => { e.cheer = 3; }); burst(new THREE.Vector3(8, 2, 8), CONF, 40, 6, .18, 1.5);
}
$('tutOk').addEventListener('click', () => { $('tutend').hidden = true; paused = false; stopSpeech(); focus(FOC.overview); });
function stepHub(dt) {
  if (T || touring) return;
  if (tipT > 0) { tipT -= dt; if (tipT <= 0) tipEnd(); }
  else { checkNotif(); hubAlerts(); }
  if (S.tut < TUT_N && started && !cropPick) { tutIdle += dt; if (tutIdle > 10) { tutIdle = 0; tip(S.tut >= 6 && S.tut !== 7 ? 'n' : 'k', TUT_TIP[S.tut], 4); } }
  if (S.unl.kios && !CUST) { custT -= dt; if (custT <= 0) { custT = 3; spawnCust(); } }
}

/* ---------- plots: growth signs, sparkles, markers ---------- */
function makeMark(kind) {
  const g = new THREE.Group();
  if (kind === 'drop') { V(g, 0x3aa0ff, .22, .3, .22, 0, 0, 0, false); V(g, 0x9fd8ff, .12, .12, .12, 0, .3, 0, false); }
  else if (kind === 'plus') { V(g, 0x58c45f, .42, .1, .13, 0, 0, 0, false); V(g, 0x58c45f, .13, .1, .42, 0, 0, 0, false); V(g, 0xbdf2a8, .13, .12, .13, 0, .1, 0, false); }
  else { V(g, 0xffd23f, .32, .32, .32, 0, 0, 0, false); V(g, 0xfff3a6, .16, .16, .16, 0, .32, 0, false); }
  g.visible = false; scene.add(g); return g;
}
let sparkT = 0;
function sparkle(c) { burst(new THREE.Vector3(c.x + (Math.random() - .5) * .5, .7 + Math.random() * .5, c.z + (Math.random() - .5) * .5), [0xffe066, 0xffffff], 2, .8, .08, .65, 2); }
function stepPlots(dt) {
  const n = Date.now(); sparkT -= dt; const sp_ = sparkT <= 0; if (sp_) sparkT = .8;
  let readyNow = false;
  for (let k = 0; k < S.unl.plots; k++) {
    const sp = S.plots[k], p = P[k];
    for (let i = 0; i < 10; i++) {
      const c = p.cells[i]; let st = sp.cs[i];
      if (st === 2) {
        if (n >= sp.r[i]) {
          sp.cs[i] = st = 3; readyNow = true; setStage(c, 'grown', sp.c); popScale(c.parts.grown, .15, .55);
          burst(new THREE.Vector3(c.x, .6, c.z), [0xffe066, 0xffffff, 0x9be37f], 6, 2, .1, .8);
        } else {
          const gr = clamp(1 - (sp.r[i] - n) / GROW_MS, 0, 1);
          if (c.parts && c.stage === 'sprout') c.parts.sprout.scale.setScalar(.8 + .9 * gr);
          if (gr > .75 && sp_ && Math.random() < .6) sparkle(c);
        }
      }
      if (st === 3 && sp_ && Math.random() < .4) sparkle(c);
      const kind = st === 1 ? 'drop' : st === 3 ? 'star' : st === 0 && started && !touring && (!T || (T.type === 'plant' && T.plot === k)) ? 'plus' : null;
      if (kind || c.mk) {
        c.mk = c.mk || {};
        ['drop', 'star', 'plus'].forEach(kd => { const m = c.mk[kd]; if (m) m.visible = kd === kind; });
        if (kind) { const m = c.mk[kind] || (c.mk[kind] = makeMark(kind)); m.visible = true; m.position.set(c.x, (kind === 'plus' ? .5 : 1.0) + Math.sin(tm * 4 + i) * .1, c.z); m.rotation.y = tm * 2; }
      }
    }
  }
  if (readyNow) { SFX.soft(); save(); }
  if (S.tut === 2 && cellsIn(0, 3).length) advTut(3);
}

/* ---------- living world: butterflies (tap to count them) and a bird passing over ---------- */
const BF = []; let bfN = 0;
for (let i = 0; i < 3; i++) {
  const g = new THREE.Group(), col = [0xff9ec4, 0xffd85e, 0xa9d8ff, 0xc9a0ff][i % 4], wl = new THREE.Group(), wr = new THREE.Group(); g.add(wl, wr);
  V(g, 0x4a3a2a, .07, .07, .26, 0, 0, 0, false); V(wl, col, .32, .02, .3, -.16, 0, 0, false); V(wr, col, .32, .02, .3, .16, 0, 0, false);
  g.position.set(rand(2, 14), 1.3, rand(2, 14)); scene.add(g);
  BF.push({ g, wl, wr, i, tx: rand(2, 14), ty: 1.2, tz: rand(2, 14), sp: .8 + Math.random() * .5, esc: 0, hit: H(g, 1.2, 1.2, 1.2, 0, 0, 0, { kind: 'bfly', i }) });
}
function stepBF(dt) {
  BF.forEach(b => {
    const p = b.g.position, dx = b.tx - p.x, dy = b.ty - p.y, dz = b.tz - p.z, d = Math.hypot(dx, dy, dz);
    if (d < .35) { b.tx = rand(1.5, 15); b.tz = rand(1.5, 15); b.ty = .9 + Math.random() * 1.4; }
    const sp = (b.esc > 0 ? 3.6 : b.sp) * dt; b.esc = Math.max(0, b.esc - dt);
    if (d > .01) { p.x += dx / d * sp; p.y += dy / d * sp + Math.sin(tm * 6 + b.i) * .006; p.z += dz / d * sp; b.g.rotation.y = Math.atan2(dx, dz); }
    const f = Math.sin(tm * 22 + b.i * 2) * .9; b.wl.rotation.z = f; b.wr.rotation.z = -f;
  });
}
function catchBf(b) {
  bfN = bfN % 10 + 1; SFX.pop(bfN % 6); say(NUM[bfN], 'k'); const p = b.g.position;
  popNum(p.clone().add(new THREE.Vector3(0, .6, 0)), String(bfN)); burst(p.clone(), [0xff8fb1, 0xffe066, 0xffffff], 9, 2.2, .1, .8, 3);
  b.esc = 1.6; b.tx = clamp(p.x + rand(-6, 6), 1.5, 15); b.tz = clamp(p.z + rand(-6, 6), 1.5, 15); b.ty = 2 + Math.random();
}
const BIRD = { g: new THREE.Group(), on: false, t: 12 };
{ const g = BIRD.g; V(g, 0x2b2d42, .55, .22, .24, 0, 0, 0, false); V(g, 0x2b2d42, .2, .2, .2, .36, .06, 0, false); V(g, 0xffb02e, .13, .06, .08, .5, .04, 0, false);
  BIRD.wl = new THREE.Group(); BIRD.wr = new THREE.Group(); g.add(BIRD.wl, BIRD.wr); V(BIRD.wl, 0x3b3d5c, .26, .04, .6, 0, .1, -.3, false); V(BIRD.wr, 0x3b3d5c, .26, .04, .6, 0, .1, .3, false); g.visible = false; scene.add(g); }
function stepBird(dt) {
  const b = BIRD;
  if (!b.on) { b.t -= dt; if (b.t <= 0) { b.on = true; b.g.visible = true; b.g.position.set(-4, 5 + Math.random() * 2, rand(3, 13)); b.g.rotation.y = 0; SFX.soft(); } return; }
  b.g.position.x += 3.4 * dt; b.g.position.y += Math.sin(tm * 2) * .004; const f = Math.sin(tm * 14) * .7; b.wl.rotation.x = f; b.wr.rotation.x = -f;
  if (b.g.position.x > 22) { b.on = false; b.g.visible = false; b.t = 25 + Math.random() * 20; }
}

/* ---------- idle hints + ambient taps ---------- */
function stepHint(dt) {
  if (!T || T.locked) return;
  T.idle += dt;
  if (T.idle > 8) {
    T.idle = 0; const h = TK[T.type].hint && TK[T.type].hint();
    if (h) { if (h.drag) showHandDrag(h.drag[0], h.drag[1]); else if (h.pos) showArrow(h.pos); say(h.text, T.who); }
  }
}
function ambientTap(d) {
  if (d.kind === 'hen') { const h = HENS[d.i]; SFX.cluck(); hop(h.g, .3, .3); h.eat = .5; }
  else if (d.kind === 'elder') { const e = d.who === 'p' ? PL : ELD[d.who]; e.wave = 1.5; if (d.who !== 'p' && !(T && T.who === d.who)) say(pick(['Halo!', 'Ayo bertani!']), d.who); }
}

/* ---------- world labels: price tags, stock counts, orders ---------- */
function hookChip(key, fn) { const c = chips[key]; if (c && !c.el.onclick) { c.el.onclick = () => { ac(); SFX.pop(2); fn(); }; c.el.onpointerdown = e => e.stopPropagation(); } }
function plotNeed(k) { const c = [0, 1, 2, 3].map(i => cnt(k, i)); return c[3] ? 'harvest' : c[1] ? 'water' : c[0] ? 'plant' : null; }
const NEEDIC = { harvest: '🧺', water: '💧', plant: '🌱' };
function updateChips() {
  for (let k = 0; k < S.unl.plots; k++) {
    const nd = plotNeed(k), show = nd && !T && FM !== k && started && !touring && !stOn;
    setChip('pb' + k, show ? new THREE.Vector3(4.5, 1.7, PZ[k] + 1) : null, NEEDIC[nd] || '', 'bub tap');
    const c = chips['pb' + k]; if (c && !c.el.onclick) { c.el.onclick = () => { if (T) return; const n = plotNeed(k); if (!n) return; ac(); SFX.pop(2); if (FM !== k) enterFarm(k); farmAct(k, n); }; c.el.onpointerdown = e => e.stopPropagation(); }
  }
  OFR.forEach(o => {
    const p = o.pos(), v = new THREE.Vector3(p.x, 1.8, p.z);
    if (!o.ghost.g.visible || (T && !(T.type === 'pay' && T.id === o.id))) { setChip('o' + o.id, null); return; }
    setChip('o' + o.id, v, COIN + o.price(), S.coins >= o.price() ? 'price tap' : 'price dim tap');
    const ce = chips['o' + o.id].el; if (!ce.onclick) { ce.onclick = () => { ac(); SFX.pop(2); offerTap(o); }; ce.onpointerdown = e => e.stopPropagation(); }
  });
  if (T && T.type === 'sell' && S.unl.kios) {
    const v = worldOf(vegHit), e = worldOf(eggHit), kc = Math.max(0, kiosCrop);
    setChip('kv', v.add(new THREE.Vector3(0, 1.1, 0)), CROPS[kc].e + ' ' + S.inv[kc], 'price tap');
    setChip('ke', e.add(new THREE.Vector3(0, 1.1, 0)), '🥚 ' + S.eggs, 'price tap');
    hookChip('kv', () => { if (T && T.type === 'sell' && !T.locked) { T.idle = 0; hideArrow(); TK.sell.tap({ kind: 'veg' }); } });
    hookChip('ke', () => { if (T && T.type === 'sell' && !T.locked) { T.idle = 0; hideArrow(); TK.sell.tap({ kind: 'egg' }); } });
  } else { setChip('kv', null); setChip('ke', null); }
  setChip('fk', T && T.type === 'feed' && !T.locked ? new THREE.Vector3(SACK.position.x, 1.9, SACK.position.z) : null, '🌽', 'price tap');
  hookChip('fk', () => { if (T && T.type === 'feed' && !T.locked) { T.idle = 0; hideArrow(); TK.feed.tap({ kind: 'sack' }); } });
  setChip('farm', started && !T && !touring && S.fm ? new THREE.Vector3(1.5, 3.4, 1.2) : null, '🌱 ' + esc(S.fm), 'sign');
  const waiting = CUST && CUST.ready && !CUST.busy && !T;
  setChip('co', waiting ? worldOf(CUST.g).add(new THREE.Vector3(0, 2.2, 0)) : null, '🛒 Pelanggan', 'price tap');
  hookChip('co', () => trySell());
  const hg = S.hens > 0 && hungry() && !T;
  setChip('hg', hg ? new THREE.Vector3(SACK.position.x, 1.9, SACK.position.z) : null, '🌾 Lapar', 'price tap');
  hookChip('hg', () => { exitFarm(); tryFeed(); });
  const bob = Math.sin(tm * 6) * .15;
  if (waiting) { ALERT.visible = true; const v = worldOf(CUST.g); ALERT.position.set(v.x, 2.6 + bob, v.z); }
  else if (hg) { ALERT.visible = true; ALERT.position.set(SACK.position.x, 1.5 + bob, SACK.position.z); }
  else ALERT.visible = false;
}

/* ---------- music: slow country, made from oscillators ---------- */
let musBus = null, musTimerId = 0, musT = 0, musStep = 0;
const M_BAR = [[98, [196, 247, 294]], [131, [262, 330, 392]], [98, [196, 247, 294]], [147, [294, 370, 440]]];
const M_MEL = [[392, 0, 494, 0, 587, 0, 494, 0], [523, 0, 659, 0, 523, 0, 392, 0], [494, 0, 587, 0, 494, 392, 0, 0], [587, 0, 0, 494, 0, 440, 0, 370]];
const EIGHTH = 60 / 66 / 2;
function pluck(f, t, d, v, type) {
  const a = AC; if (!a || !musBus) return;
  try {
    const o = a.createOscillator(), g = a.createGain(), lp = a.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1700; o.type = type || 'triangle'; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0008, t + d);
    o.connect(lp); lp.connect(g); g.connect(musBus); o.start(t); o.stop(t + d + .05);
  } catch (e) { /* ignore */ }
}
function musTick() {
  const a = AC; if (!a || a.state !== 'running' || !S.mus || paused || document.hidden) { musT = 0; return; }
  if (!musBus) { musBus = a.createGain(); musBus.gain.value = .55; musBus.connect(a.destination); }
  if (musT < a.currentTime) musT = a.currentTime + .08;
  while (musT < a.currentTime + .35) {
    const s = musStep % 8, bar = Math.floor(musStep / 8) % 4, ph = Math.floor(musStep / 32) % 4, t = musT + (s % 2 ? .035 : 0), [root, ch] = M_BAR[bar];
    if (s === 0) pluck(root, t, .7, .11, 'triangle');
    if (s === 4) pluck(root * 1.5, t, .6, .08, 'triangle');
    if (s === 2 || s === 6) ch.forEach((f, i) => pluck(f, t + i * .018, .4, .035, 'triangle'));
    const mel = M_MEL[(bar + ph) % 4][s]; if (mel && (ph > 0 || bar > 0)) pluck(mel, t, .75, .045, 'sine');
    musT += EIGHTH; musStep++;
  }
}
function startMusic() { if (!musTimerId) musTimerId = setInterval(musTick, 90); }
let cluckT = 4;

/* ---------- input ---------- */
const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
/* the floating signs over the soil (plus / drop / star) are tap targets too: a tap near one counts as a tap on its cell */
function markAt(x, y) {
  let best = null, bd = 46; const v = new THREE.Vector3();
  for (let k = 0; k < S.unl.plots; k++) P[k].cells.forEach((c, i) => {
    if (!c.mk) return;
    ['drop', 'star', 'plus'].forEach(kd => { const m = c.mk[kd]; if (!m || !m.visible) return; m.getWorldPosition(v); const s = screenOf(v), d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; best = { k, i }; } });
  });
  return best;
}
function allPicks() {
  const base = [ELD.k.hit, ELD.n.hit, PL.hit].concat(HENS.filter(h => h.g.visible).map(h => h.hit));
  if (T) return picks.concat(base);
  const hub = [];
  for (let k = 0; k < S.unl.plots; k++) hub.push(P[k].plotHit);
  OFR.forEach(o => { if (o.ghost.g.visible) hub.push(o.ghost.hit); });
  if (S.hens > 0) hub.push(SACK.userData.hit);
  if (S.unl.kios) hub.push(vegHit, eggHit);
  BF.forEach(b => hub.push(b.hit));
  if (CUST && CUST.ready && !CUST.busy) hub.push(CUST.g.hit);
  return hub.concat(base);
}
function pickAt(cx, cy) {
  const r = canvas.getBoundingClientRect();
  v2.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(v2, camera);
  const hits = ray.intersectObjects(allPicks(), false);
  return hits.length ? Object.assign({ pt: hits[0].point }, hits[0].object.userData) : null;
}
function trail(x, y) { const d = document.createElement('i'); d.className = 'trail'; d.style.left = x + 'px'; d.style.top = y + 'px'; $('app').appendChild(d); setTimeout(() => d.remove(), 450); }
canvas.addEventListener('pointerdown', e => {
  if (!started || paused || touring) return;
  ac(); tutIdle = 0;
  if (cropPick) { closePick(); return; }
  const mk = markAt(e.clientX, e.clientY);
  if (mk) {
    if (!T) { const c = P[mk.k].cells[mk.i]; tapPlot(mk.k, { x: c.x, z: c.z }); }
    else if (!T.locked && T.plot === mk.k && (T.type === 'plant' || T.type === 'water' || T.type === 'harvest')) { T.idle = 0; hideArrow(); TK[T.type].tap({ kind: 'cell', plot: mk.k, i: mk.i }); }
    return;
  }
  const d = pickAt(e.clientX, e.clientY); if (!d) return;
  if (d.kind === 'hen') { ambientTap(d); if (T) T.idle = 0; else { exitFarm(); tryFeed(); } return; }
  if (d.kind === 'elder') { ambientTap(d); if (T) T.idle = 0; return; }
  if (d.kind === 'bfly') { catchBf(BF[d.i]); return; }
  if (!T) {
    if (d.kind === 'plot') tapPlot(d.plot, d.pt);
    else if (FM != null && d.kind !== 'plot' && (exitFarm(), false)) return;
    else if (d.kind === 'offer') offerTap(ofrById(d.id));
    else if (d.kind === 'sack') tryFeed();
    else if (d.kind === 'veg' || d.kind === 'egg' || d.kind === 'cust') trySell();
    return;
  }
  if (!T.locked) { T.idle = 0; hideArrow(); TK[T.type].tap(d); }
});

/* ---------- virtual joystick: walk around the farm ---------- */
const joy = $('joy'), joyK = joy.firstElementChild; let joyId = null, jx = 0, jy = 0;
function joyAt(e) {
  const r = joy.getBoundingClientRect(), R = r.width / 2 - 10; let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); const d = Math.hypot(dx, dy);
  if (d > R) { dx *= R / d; dy *= R / d; } jx = dx / R; jy = dy / R; joyK.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
}
function joyEnd() { joyId = null; jx = jy = 0; joyK.style.transform = ''; }
joy.addEventListener('pointerdown', e => { e.preventDefault(); ac(); joyId = e.pointerId; try { joy.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } joyAt(e); tutIdle = 0; });
joy.addEventListener('pointermove', e => { if (e.pointerId === joyId) joyAt(e); });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => joy.addEventListener(n, e => { if (e.pointerId === joyId) joyEnd(); }));
const _f = new THREE.Vector3();
const rectB = (x, z, hw, hd) => ({ x0: x - hw, x1: x + hw, z0: z - hd, z1: z + hd });
const FIXED_B = [rectB(1.5, 1.2, 1.4, 1.2), rectB(11.6, 7.1, 1.5, 1.1)].concat([[.8, 4.8], [.8, 7.8], [.8, 10.8], [5, .7], [8, .6], [15.2, 2.2]].map(t => rectB(t[0], t[1], .4, .4)));
const blockers = () => {
  const b = FIXED_B.slice();
  for (let k = 0; k < S.unl.plots; k++) b.push({ x0: 1.7, x1: 7.3, z0: PZ[k] - .2, z1: PZ[k] + 2.2 });
  for (let k = S.unl.plots; k < 4; k++) b.push({ x0: 1.4, x1: 7.6, z0: PZ[k] - .6, z1: PZ[k] + 2.6 });
  if (S.unl.coop) b.push({ x0: 9.9, x1: 14.1, z0: .8, z1: 5 });
  if (S.unl.kios) b.push({ x0: 9.9, x1: 14.1, z0: 8.4, z1: 10.4 });
  return b;
};
function stepJoy(dt) {
  const ok = started && !paused && !touring && !T && !stOn && FM == null && S.jy;
  if (joy.hidden === ok) { joy.hidden = !ok; if (!ok) joyEnd(); }
  if (!ok) return;
  const mag = Math.min(1, Math.hypot(jx, jy));
  if (mag < .18) { if (PL.joy) { PL.joy = false; PL.tx = null; } return; }
  camera.getWorldDirection(_f); const n = Math.hypot(_f.x, _f.z) || 1, fx = _f.x / n, fz = _f.z / n;
  const mx = -fz * jx + fx * -jy, mz = fx * jx + fz * -jy, m = Math.hypot(mx, mz) || 1;
  PL.joy = true; PL.cb = null; PL.tx = PL.g.position.x + mx / m * .6; PL.tz = PL.g.position.z + mz / m * .6;
}
function fencePL() {
  const p = PL.g.position, R = .3; p.x = clamp(p.x, .8, 16); p.z = clamp(p.z, .8, 16.2);
  blockers().forEach(b => {
    const nx = clamp(p.x, b.x0, b.x1), nz = clamp(p.z, b.z0, b.z1), dx = p.x - nx, dz = p.z - nz, d = Math.hypot(dx, dz);
    if (d >= R) return;
    if (d > 1e-4) { p.x = nx + dx / d * R; p.z = nz + dz / d * R; return; }
    const l = p.x - b.x0, r = b.x1 - p.x, t = p.z - b.z0, u = b.z1 - p.z, m = Math.min(l, r, t, u);
    if (m === l) p.x = b.x0 - R; else if (m === r) p.x = b.x1 + R; else if (m === t) p.z = b.z0 - R; else p.z = b.z1 + R;
  });
}

/* ---------- menu, sound, start ---------- */
const stopSpeech = () => { try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } };
function setPaused(p) { paused = p; $('menu').hidden = !p; if (p) { stopSpeech(); pickVoice(); voiceLabel(); } }
$('btnPause').addEventListener('click', () => setPaused(true));
$('mResume').addEventListener('click', () => setPaused(false));
$('btnJoy').addEventListener('click', () => { S.jy = !S.jy; save(); updateHud(); SFX.pop(S.jy ? 3 : 1); });
$('btnSnd').addEventListener('click', () => { S.snd = !S.snd; save(); updateHud(); });
$('mSound').addEventListener('click', () => { S.snd = !S.snd; save(); updateHud(); });
$('mVoice').addEventListener('click', () => { S.vo = !S.vo; if (!S.vo) stopSpeech(); save(); updateHud(); if (S.vo) say('Halo! Aku Kakek.', 'k'); });
const voiceLabel = () => { const n = voices.length, i = voice ? voices.indexOf(voice) : -1; $('mVoiceSel').textContent = n ? 'Ganti suara: ' + (i + 1) + ' dari ' + n + ' (' + String(voice.name).replace(/^(Microsoft|Google)\s+/i, '').slice(0, 16) + ')' : 'Suara bawaan perangkat'; };
$('mVoiceSel').addEventListener('click', () => { if (voices.length > 1) { voice = voices[(voices.indexOf(voice) + 1) % voices.length]; S.vn = voice.name; save(); } voiceLabel(); const w = S.vo; S.vo = true; say('Halo! Aku Kakek. Ayo kita bertani bersama!', 'k'); S.vo = w; });
$('mMusic').addEventListener('click', () => { S.mus = !S.mus; save(); updateHud(); });
let resetArmed = false;
$('mReset').addEventListener('click', () => {
  if (!resetArmed) { resetArmed = true; $('mReset').textContent = 'Yakin? Ketuk lagi'; setTimeout(() => { resetArmed = false; $('mReset').textContent = 'Hapus karakter'; }, 3000); return; }
  try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  S = Object.assign(DEF(), { snd: S.snd, mus: S.mus, vo: S.vo, story: true, pl: S.pl }); save(); location.reload();
});
$('btnSay').addEventListener('click', () => { if (T) say(T.text, T.who); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { stopSpeech(); try { if (AC) AC.suspend(); } catch (e) { /* ignore */ } } else ac(); });

/* ---------- main loop ---------- */
let last = performance.now(), growT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  let dt = Math.min(.05, (now - last) / 1000); last = now; if (paused) dt = 0;
  tm += dt;
  if (stOn) { stTick(dt); renderer.render(stScene, stCam); return; }
  stepAnims(dt); stepPT(dt); stepWalkers(dt); stepElder(ELD.k, dt, tm); stepElder(ELD.n, dt, tm); stepJoy(dt); stepElder(PL, dt, tm); if (PL.joy) fencePL();
  if (S.unl.coop) HENS.forEach(h => { if (h.g.visible) stepHen(h, dt, tm); });
  CLOUDS.forEach(c => { c.g.position.x = c.x0 + Math.sin(tm * .1 + c.ph) * 1.2; });
  const k = 1 - Math.exp(-dt * 4.2);
  cam.cx += (cam.x - cam.cx) * k; cam.cz += (cam.z - cam.cz) * k; cam.cw += (cam.w - cam.cw) * k; cam.ch += (cam.h - cam.ch) * k;
  applyCam();
  stepHand();
  stepHint(dt); stepHL();
  GHM.opacity = .3 + .15 * Math.sin(tm * 3);
  careTick(dt);
  if (started && !paused && !bedOn) {
    stepPlots(dt);
    growT -= dt; if (growT <= 0) { growT = .25; refreshOffers(); syncKios(); }
    if (S.bld && Date.now() >= S.bld.at) finishBuild();
    stepBuild(dt);
    if (S.hens > 0 && S.snd) { cluckT -= dt; if (cluckT <= 0) { cluckT = 3 + Math.random() * 6; SFX.cluck(); const h = HENS[rand(0, S.hens - 1)]; hop(h.g, .15, .25); } }
    stepHub(dt); tutSync(); toolsSync(); stepBF(dt); stepBird(dt);
  }
  updateChips();
  renderer.render(scene, camera);
}

