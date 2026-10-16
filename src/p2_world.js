/* ---------- Farmath p2: world ---------- */
const GN = 16, EX = 5;   /* the playable farm is 16x16; the island is EX tiles wider on every side (room to grow, not usable yet) */
const PZ = [3.1, 6.3, 9.5, 12.7];            // z start of each 5x2 plot
const YARD = { x0: 10, x1: 14, z0: 1, z1: 5 };
const PATH_X = [7, 8];
const isWater = (x, z) => x >= 10 && x <= 12 && z >= 6 && z <= 7;
const inPlaza = (x, z) => x >= 10 && x <= 13 && z >= 11 && z <= 13;
const inYard = (x, z) => x >= YARD.x0 && x < YARD.x1 && z >= YARD.z0 && z < YARD.z1;
function tileColor(x, z) {
  const r = ((x * 73856093) ^ (z * 19349663)) >>> 0, n = (r % 100) / 100;
  if (isWater(x, z)) return 0x4db3e6;
  if (inYard(x, z)) return n < .5 ? 0xe9d78f : 0xe3cf86;
  if ((PATH_X.includes(x) && z >= 1 && z <= 14) || inPlaza(x, z)) return n < .5 ? 0xecd9a6 : 0xe5cf98;
  return n < .33 ? 0x7ccf5b : n < .66 ? 0x74c653 : 0x84d561;
}
function buildGround() {
  const tiles = new THREE.InstancedMesh(G(1, .5, 1), new THREE.MeshLambertMaterial({ color: 0xffffff }), (GN + 2 * EX) * (GN + 2 * EX));
  const m4 = new THREE.Matrix4(), col = new THREE.Color();
  let i = 0;
  for (let x = -EX; x < GN + EX; x++) for (let z = -EX; z < GN + EX; z++) {
    const y0 = isWater(x, z) ? -.72 : -.5;
    m4.makeTranslation(x + .5, y0 + .25, z + .5);
    tiles.setMatrixAt(i, m4); tiles.setColorAt(i, col.set(tileColor(x, z))); i++;
  }
  tiles.instanceMatrix.needsUpdate = true; tiles.instanceColor.needsUpdate = true;
  tiles.receiveShadow = true; scene.add(tiles);
  const W = GN + 2 * EX;
  V(scene, 0x9b6b43, W, .9, W, GN / 2, -1.4, GN / 2);
  V(scene, 0x7d5636, W - .8, .9, W - .8, GN / 2, -2.3, GN / 2);
  V(scene, 0x5f4128, W - 2, .8, W - 2, GN / 2, -3.1, GN / 2);
}

function makeTree(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
  V(g, 0x8a5a33, .5, 1.3, .5, 0, 0, 0);
  V(g, 0x3fa34d, 1.9, .9, 1.9, 0, 1.1, 0); V(g, 0x4cb85a, 1.4, .8, 1.4, 0, 1.9, 0); V(g, 0x57c765, .9, .7, .9, 0, 2.6, 0);
  V(g, 0xe53935, .2, .2, .2, .7, 1.4, .98, false); V(g, 0xe53935, .2, .2, .2, -.5, 1.9, .72, false);
  scene.add(g); return g;
}
function makeBush(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  V(g, 0x3f9e4a, .9, .55, .9, 0, 0, 0); V(g, 0x4fb85b, .6, .35, .6, .05, .55, 0);
  V(g, 0xff7aa8, .12, .12, .12, .3, .38, .46, false); V(g, 0xffe066, .12, .12, .12, -.3, .3, .46, false);
  scene.add(g);
}
function buildBarn() {
  const g = new THREE.Group(); g.position.set(1.5, 0, 1.2); scene.add(g);
  V(g, 0xc44536, 2.4, 1.5, 2.0, 0, 0, 0); V(g, 0xf2e6d0, .9, 1.05, .06, .1, 0, 1.01); V(g, 0xc44536, .08, 1.05, .08, .1, 0, 1.04); V(g, 0xf2e6d0, .9, .08, .08, .1, .5, 1.05);
  V(g, 0xf2e6d0, 2.44, .1, .1, 0, 1.4, 1.0, false);
  V(g, 0x8c2f25, 2.7, .2, 2.3, 0, 1.5, 0); V(g, 0x8c2f25, 2.0, .2, 1.9, 0, 1.7, 0); V(g, 0x8c2f25, 1.3, .2, 1.5, 0, 1.9, 0);
  V(g, 0x9bd3ff, .4, .4, .06, .85, .85, 1.01);
  V(g, 0xe9d37a, .5, .35, .5, 1.6, 0, 1.5); V(g, 0xe9d37a, .5, .35, .5, 1.75, .35, 1.4);
}
/* the wider island: a wooden fence marks the farm, the land beyond it is wild (trees, rocks, flowers) with bare plots waiting to be opened one day */
function buildBeyond() {
  const post = (x, z) => V(scene, 0x8f5d2a, .16, .7, .16, x, 0, z, false);
  const A = -.3, B = GN + .3;
  for (let i = 0; i <= 17; i++) { const t = A + i * (B - A) / 17; post(t, A); post(t, B); post(A, t); post(B, t); }
  [A, B].forEach(c => { V(scene, 0xc99a5b, B - A, .08, .07, GN / 2, .45, c, false); V(scene, 0xc99a5b, .07, .08, B - A, c, .45, GN / 2, false); });
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const out = () => { for (;;) { const x = -EX + .6 + rnd() * (GN + 2 * EX - 1.2), z = -EX + .6 + rnd() * (GN + 2 * EX - 1.2); if (x < -.9 || x > GN + .9 || z < -.9 || z > GN + .9) return [x, z]; } };
  for (let i = 0; i < 16; i++) { const q = out(); makeTree(q[0], q[1], .9 + rnd() * .4); }
  for (let i = 0; i < 14; i++) { const q = out(); makeBush(q[0], q[1]); }
  for (let i = 0; i < 9; i++) { const q = out(), r = .35 + rnd() * .4; V(scene, 0x9a9aa3, r * 1.4, r, r * 1.2, q[0], 0, q[1]); V(scene, 0xb4b4bd, r, r * .5, r * .8, q[0] + .1, r, q[1]); }
  const fc = [0xff7aa8, 0xffe066, 0xffffff, 0xc9a0ff];
  for (let i = 0; i < 80; i++) { const q = out(); V(scene, 0x3f9e4a, .04, .2, .04, q[0], 0, q[1], false); V(scene, fc[i % 4], .14, .1, .14, q[0], .2, q[1], false); }
  /* bare plots waiting for later, each with a little stake */
  [[19.4, 5.2, 4.6, 2.6], [19.4, 9.4, 4.6, 2.6], [5, 19.2, 5, 2.6]].forEach(l => {
    V(scene, 0x9a7a52, l[2], .06, l[3], l[0], 0, l[1], false);
    V(scene, 0x8f5d2a, .1, .9, .1, l[0] - l[2] / 2 + .3, 0, l[1] + l[3] / 2 - .3, false); V(scene, 0xffd34d, .5, .34, .08, l[0] - l[2] / 2 + .3, .75, l[1] + l[3] / 2 - .3, false);
  });
}
function buildEnv() {
  buildBarn(); buildBeyond();
  [[.8, 4.8, 1], [.8, 7.8, 1.05], [.8, 10.8, .95], [5, .7, 1], [8, .6, 1.1], [15.2, 2.2, 1]].forEach(t => makeTree(t[0], t[1], t[2]));
  [[14.9, 13.6], [1, 14.6], [5.5, 15.1], [9.5, 15.2], [15.1, 11.2], [14.7, 8.2]].forEach(b => makeBush(b[0], b[1]));
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const cols = [0xff7aa8, 0xffe066, 0xffffff, 0xff9c5b, 0xc9a0ff];
  for (let i = 0; i < 70; i++) {
    const side = i % 3; let x, z;
    if (side === 0) { x = .3 + rnd() * 1.2; z = 3 + rnd() * 12.5; }
    else if (side === 1) { x = 14.9 + rnd() * .9; z = .5 + rnd() * 15; }
    else { x = .3 + rnd() * 15.4; z = 14.3 + rnd() * 1.5; }
    const f = new THREE.Group(); f.position.set(x, 0, z);
    V(f, 0x3f9e4a, .04, .2, .04, 0, 0, 0, false); V(f, pick(cols), .14, .1, .14, 0, .2, 0, false);
    scene.add(f);
  }
  // pond details
  V(scene, 0x56b86a, .5, .04, .5, 11.2, -.2, 6.6, false); V(scene, 0xffa8c8, .2, .08, .2, 11.2, -.16, 6.6, false);
  V(scene, 0x56b86a, .4, .04, .4, 12.1, -.2, 7.3, false);
  [[9.7, 8.3], [13.4, 6.2], [9.8, 5.7]].forEach(p => { V(scene, 0x3d9a3d, .08, .7, .08, p[0], 0, p[1], false); V(scene, 0x3d9a3d, .08, .5, .08, p[0] + .14, 0, p[1] + .08, false); V(scene, 0x8a5a33, .1, .16, .1, p[0], .7, p[1], false); });
  // clouds
  const clouds = [];
  [[-6, 9, -5], [-1, 10, -9], [3, 9.5, -3]].forEach(c => {
    const g = new THREE.Group(); g.position.set(c[0], c[1], c[2]);
    V(g, 0xffffff, 2.6, .7, 1.4, 0, 0, 0, false); V(g, 0xffffff, 1.6, .7, 1.2, .5, .6, .1, false); V(g, 0xffffff, 1.2, .5, 1, -.7, .6, -.1, false);
    scene.add(g); clouds.push({ g, x0: c[0], ph: Math.random() * 6 });
  });
  return clouds;
}

/* ---------- plots ---------- */
const P = [];
function buildPlot(k) {
  const zs = PZ[k], g = new THREE.Group(); scene.add(g);
  V(g, 0x8a5a33, 5.2, .28, 2.2, 4.5, 0, zs + 1);
  const wc = 0xc99a5b, wd = 0xa9783c;
  V(g, wc, 5.6, .38, .14, 4.5, 0, zs - .17); V(g, wc, 5.6, .38, .14, 4.5, 0, zs + 2.17);
  V(g, wd, .14, .38, 2.5, 1.83, 0, zs + 1); V(g, wd, .14, .38, 2.5, 7.17, 0, zs + 1);
  const cells = [];
  for (let i = 0; i < 10; i++) {
    const col = i % 5, row = Math.floor(i / 5), x = 2.5 + col, z = zs + .5 + row;
    V(g, 0x5e3a1d, .62, .02, .62, x, .28, z, false);
    const hit = H(g, .98, .8, .98, x, .1, z, { kind: 'cell', plot: k, i });
    cells.push({ x, z, hit, plotG: g, crop: null, parts: null, type: -1, planted: false, stage: 'none' });
  }
  const crate = makeTray(10, 5, .34, 0xc98e4f, 0xa9783c);
  crate.position.set(8.7, 0, zs + 1); crate.visible = false; scene.add(crate);
  const crateHit = H(crate, 2.0, .6, 1.0, 0, 0, 0, { kind: 'crate', plot: k });
  const plotHit = H(g, 5.5, .6, 2.4, 4.5, 0, zs + 1, { kind: 'plot', plot: k });
  P[k] = { g, zs, cells, crate, crateHit, plotHit };
  return P[k];
}
function setStage(cell, stage, type) {
  if (stage === 'none') { if (cell.crop) cell.crop.visible = false; cell.stage = 'none'; return; }
  if (!cell.parts || cell.type !== type) {
    if (cell.crop && cell.crop.parent) cell.crop.parent.remove(cell.crop);
    cell.crop = new THREE.Group(); cell.crop.position.set(cell.x, .28, cell.z); cell.plotG.add(cell.crop);
    cell.parts = cropParts(type); cell.crop.add(cell.parts.seed, cell.parts.sprout, cell.parts.grown); cell.type = type;
  }
  cell.crop.visible = true;
  cell.parts.seed.visible = stage === 'seed'; cell.parts.sprout.visible = stage === 'sprout'; cell.parts.grown.visible = stage === 'grown';
  cell.stage = stage;
}
const STG = ['none', 'seed', 'sprout', 'grown'];
function restorePlot(k) {
  const sp = S.plots[k], p = P[k];
  p.cells.forEach((c, i) => { c.planted = sp.cs[i] > 0; setStage(c, STG[sp.cs[i]], sp.c); });
}

/* ---------- coop ---------- */
let coopG = null; const HENS = [];
function buildCoop() {
  coopG = new THREE.Group(); scene.add(coopG);
  const post = 0xb98550, rail = 0xcf9b60;
  const fence = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.round(len), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, horiz = Math.abs(z1 - z0) < .01;
    for (let i = 0; i <= n; i++) { const t = n ? i / n : 0; V(coopG, post, .16, .75, .16, lerp(x0, x1, t), 0, lerp(z0, z1, t)); }
    [.25, .5].forEach(y => V(coopG, rail, horiz ? len : .07, .1, horiz ? .07 : len, cx, y, cz));
  };
  fence(YARD.x0 - .1, YARD.z0 - .1, YARD.x1 + .1, YARD.z0 - .1);
  fence(YARD.x0 - .1, YARD.z0 - .1, YARD.x0 - .1, YARD.z1);
  fence(YARD.x1 + .1, YARD.z0 - .1, YARD.x1 + .1, YARD.z1);
  const house = new THREE.Group(); house.position.set(12, 0, 1.9); coopG.add(house);
  V(house, 0xe0a060, 2.6, 1.2, 1.4, 0, 0, 0); V(house, 0x6b4423, .62, .72, .06, 0, 0, .72); V(house, 0x9bd3ff, .4, .36, .06, 1.0, .6, .72);
  V(house, 0xb5533c, 2.9, .18, 1.7, 0, 1.2, 0); V(house, 0xb5533c, 2.2, .18, 1.3, 0, 1.38, 0); V(house, 0xb5533c, 1.5, .18, .9, 0, 1.56, 0);
  V(house, 0xe9d37a, .6, .3, .5, -1.7, 0, .5); V(house, 0xe9d37a, .5, .3, .4, 1.7, 0, .6);
  for (let i = 0; i < 3; i++) {
    const h = makeHen(); h.g.position.set(10.9 + i * 1.2, 0, 3.0 + (i % 2) * .4); h.i = i;
    h.hit = H(h.g, .9, .9, 1.0, 0, 0, 0, { kind: 'hen', i });
    h.g.visible = i < S.hens; coopG.add(h.g); HENS.push(h);
  }
  coopG.visible = false;
}

/* ---------- market stall ---------- */
let kiosG = null, kiosVeg = null, vegHit = null, eggHit = null; const KIOS = { x: 12, z: 9.4 };
function buildKios() {
  kiosG = new THREE.Group(); kiosG.position.set(KIOS.x, 0, KIOS.z); scene.add(kiosG);
  V(kiosG, 0xc98e4f, 3.8, .85, .9, 0, 0, 0); V(kiosG, 0xe6b673, 4.0, .1, 1.1, 0, .85, 0);
  V(kiosG, 0xe9d3a0, 3.8, 2.0, .1, 0, 0, -.5);
  [[-1.9, -.45], [1.9, -.45], [-1.9, .5], [1.9, .5]].forEach(p => V(kiosG, 0x8f5d2a, .14, 2.2, .14, p[0], 0, p[1]));
  for (let i = 0; i < 8; i++) {
    const c = i % 2 ? 0xffffff : 0xe8473f;
    V(kiosG, c, .5, .12, 1.8, -1.75 + i * .5, 2.2, -.1); V(kiosG, c, .5, .26, .08, -1.75 + i * .5, 1.94, .8);
  }
  // counter props
  V(kiosG, 0xffffff, .5, .26, .4, -1.3, .95, .0); V(kiosG, 0xe8473f, .5, .08, .4, -1.3, 1.21, .0);
  V(kiosG, 0x6b9fd6, .3, .4, .3, 1.4, .95, -.05); V(kiosG, 0xd9b77a, .46, .3, .3, 0, .95, -.1);
  // crates on the ground in front of the stall: left = vegetables, right = eggs
  const vc = new THREE.Group(); vc.position.set(-1.9, 0, 1.5); kiosG.add(vc);
  V(vc, 0xa9783c, 1.05, .34, .8, 0, 0, 0); V(vc, 0x7d5a2b, .93, .04, .68, 0, .34, 0, false);
  kiosVeg = vc;
  vegHit = H(vc, 1.3, 1.1, 1.0, 0, 0, 0, { kind: 'veg' });
  const ec = new THREE.Group(); ec.position.set(1.9, 0, 1.5); kiosG.add(ec);
  V(ec, 0xa9783c, 1.05, .34, .8, 0, 0, 0); V(ec, 0xe9d37a, .93, .04, .68, 0, .34, 0, false);
  [[-.25, -.12], [0, .14], [.25, -.1], [-.12, .16], [.14, .0]].forEach(p => { const e = makeEggItem(); e.position.set(p[0], .34, p[1]); ec.add(e); });
  eggHit = H(ec, 1.3, 1.1, 1.0, 0, 0, 0, { kind: 'egg' });
  kiosG.visible = false;
}
let vegItems = [];
function setVegCrate(c) {
  vegItems.forEach(o => kiosVeg.remove(o)); vegItems = [];
  [[-.3, -.14], [0, .16], [.3, -.1], [-.14, .18], [.16, .0]].forEach(p => { const it = cropParts(c).grown; it.scale.setScalar(.7); it.position.set(p[0], .36, p[1]); kiosVeg.add(it); vegItems.push(it); });
}

/* ---------- cast, sack, can ---------- */
const ELD = { k: makeElder('k'), n: makeElder('n') };
ELD.k.g.position.set(8.1, 0, 3.2); ELD.n.g.position.set(9.1, 0, 6.2);
ELD.k.hit = H(ELD.k.g, 1.0, 1.9, .8, 0, 0, 0, { kind: 'elder', who: 'k' });
ELD.n.hit = H(ELD.n.g, 1.1, 1.9, .8, 0, 0, 0, { kind: 'elder', who: 'n' });
scene.add(ELD.k.g, ELD.n.g);
const CAN = makeWateringCan(); CAN.visible = false; scene.add(CAN);
CAN.userData.hit = H(CAN, 1.2, 1.0, 1.0, 0, 0, 0, { kind: 'can' });
const SACK = makeSack(); SACK.position.set(13.3, 0, 4.5); SACK.visible = false; scene.add(SACK);
SACK.userData.hit = H(SACK, 1.2, 1.2, 1.1, 0, 0, 0, { kind: 'sack' });

/* ---------- offer ghosts (things the player can buy) ---------- */
const GHM = new THREE.MeshBasicMaterial({ color: 0xfff2a8, transparent: true, opacity: .4, depthWrite: false });
const CONM = new THREE.MeshBasicMaterial({ color: 0xe0a458, transparent: true, opacity: .75, depthWrite: false });
function makeGhost(id, w, d, h) {
  const g = new THREE.Group(); scene.add(g);
  const box = new THREE.Mesh(G(w, h, d), GHM); box.position.y = h / 2 + .02; g.add(box);
  V(g, 0x8a5a33, .1, .9, .1, -w / 2 + .15, 0, d / 2 + .15, false); V(g, 0xf2c14e, .5, .34, .08, -w / 2 + .15, .9, d / 2 + .15, false);
  const hit = H(g, w, h + .6, d, 0, 0, 0, { kind: 'offer', id });
  g.visible = false; return { g, box, hit };
}

/* ---------- walkers (customers) ---------- */
const WK = [];
function walkTo(g, x, z, speed, cb) { WK.push({ g, x, z, speed, cb, ph: 0 }); }
function stepWalkers(dt) {
  for (let i = WK.length - 1; i >= 0; i--) {
    const w = WK[i], dx = w.x - w.g.position.x, dz = w.z - w.g.position.z, d = Math.hypot(dx, dz);
    if (d > .06) { const sp = Math.min(d, w.speed * dt); w.g.position.x += dx / d * sp; w.g.position.z += dz / d * sp; w.g.rotation.y = Math.atan2(dx, dz); w.ph += dt * 12; w.g.position.y = Math.abs(Math.sin(w.ph)) * .08; }
    else { w.g.position.y = 0; WK.splice(i, 1); if (w.cb) w.cb(); }
  }
}

/* ---------- build everything ---------- */
buildGround();
const CLOUDS = buildEnv();
buildCoop();
buildKios();
