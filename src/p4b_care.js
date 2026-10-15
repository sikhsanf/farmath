/* ---------- p4b: parental controls (daily play limit) + bedtime scenes ---------- */
/* S.pl = { lim: minutes per day (0 = no limit), day, used: seconds played today, bonus: extra minutes granted today,
            mode: 'night' | 'storm' | 'sick' | 'acak', cur: today's random pick, warned } */
const dayKey = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
function plState() {
  if (!S.pl) S.pl = { lim: 0, day: '', used: 0, bonus: 0, mode: 'acak', cur: '', warned: false };
  const p = S.pl;
  if (p.day !== dayKey()) { p.day = dayKey(); p.used = 0; p.bonus = 0; p.cur = ''; p.warned = false; save(); if (bedOn) endBed(); }
  return p;
}
const leftSec = () => { const p = plState(); return p.lim > 0 ? p.lim * 60 + p.bonus * 60 - p.used : Infinity; };
const fmtMin = s => { const m = Math.floor(s / 60); return m + ' menit'; };

/* ----- bedtime scenes ----- */
const HEMI_C = new THREE.Color(0xffffff), SUN_C = new THREE.Color(0xfff0d2), cTmp = new THREE.Color(), cTmp2 = new THREE.Color();
const BED = {
  night: { hi: .34, hc: 0x9fb2ff, si: .1, sc: 0x8faaff, icon: '🌙', who: 'n', txt: () => `Hoaam... sudah malam. Kakek, Nenek, dan ayam-ayam mau tidur. Sampai jumpa besok ya, ${S.nm || 'petani cilik'}!` },
  storm: { hi: .55, hc: 0xb8c2d0, si: .22, sc: 0xaab6c8, icon: '⛈️', who: 'k', txt: () => `Wah, hujan badai! Ayo semua berteduh di lumbung. Kita main lagi besok ya, ${S.nm || 'petani cilik'}!` },
  sick: { hi: .72, hc: 0xdde6d6, si: .45, sc: 0xe8efd8, icon: '🤒', who: 'n', txt: () => 'Aduh, Kakek dan Nenek lagi demam. Mereka harus istirahat dulu. Besok pasti sudah sembuh!' }
};
let bedMode = 'night', bedK = 0, bedGen = 0, bedCool = 0, stormT = 3, careSave = 0, musDuck = false;
const DOOR = { x: 1.6, z: 2.7 }, SITE = { barn: new THREE.Vector3(1.5, 2.5, 1.2), coop: new THREE.Vector3(12, 1.9, 1.9) };
const ZS = {}; const inside = { barn: 0, coop: 0 };
function zSite(key, html) { let e = ZS[key]; if (!e) { e = ZS[key] = document.createElement('div'); e.className = 'zz'; $('app').appendChild(e); } if (e.dataset.h !== html) { e.innerHTML = html; e.dataset.h = html; } return e; }
function careToast(txt) { const t = $('careToast'); t.textContent = txt; t.hidden = false; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show'); setTimeout(() => { t.hidden = true; }, 6500); }

function pickMode() {
  const p = plState();
  if (p.mode === 'acak') { if (!p.cur) { p.cur = pick(['night', 'storm', 'sick']); save(); } return p.cur; }
  return p.mode;
}
function beginBed(instant) {
  if (bedOn) return;
  bedOn = true; bedMode = pickMode(); bedGen++; const gen = bedGen; stormT = 2.5; inside.barn = inside.coop = 0;
  try { if (T) endTask(); } catch (e) { /* ignore */ }
  try { exitFarm(); setHL([]); hideBubble(); hideChoices(); } catch (e) { /* ignore */ }
  PL.joy = false; stopSpeech(); focus(FOC.overview);
  const app = $('app'); ['night', 'storm', 'sick'].forEach(m => app.classList.remove('bed-' + m)); app.classList.add('bedtime', 'bed-' + bedMode);
  const B = BED[bedMode]; $('bedIcon').textContent = B.icon; $('bedTxt').textContent = B.txt(); $('bed').hidden = false;
  if (instant) bedK = 1;
  const sleepers = bedMode === 'sick' ? [ELD.k, ELD.n] : [ELD.k, ELD.n, PL];
  const into = (e, i) => {
    const go = () => {
      if (gen !== bedGen) return;
      if (instant) { e.g.visible = false; inside.barn++; return; }
      elderGo(e, DOOR.x + (i - 1) * .35, DOOR.z, () => { if (gen !== bedGen) return; e.g.visible = false; inside.barn++; e.g.rotation.y = 0; });
    };
    if (instant || i === 0) go(); else setTimeout(go, i * 700);
  };
  sleepers.forEach(into);
  if (bedMode === 'sick') { if (instant) PL.g.position.set(3.4, 0, 2.9); else { setTimeout(() => { if (gen === bedGen) elderGo(PL, 3.4, 2.9, () => { PL.g.rotation.y = -Math.PI / 2.4; }); }, 400); } }
  if (bedMode !== 'sick') HENS.forEach((h, i) => {
    if (!h.g.visible) return;
    const go = () => {
      if (gen !== bedGen) return;
      if (instant) { h.g.position.set(11.2 + i * .45, 0, 2.9); h.sleep = true; inside.coop++; return; }
      h.busy = true; h.tx = 11.2 + i * .45; h.tz = 2.9; h.cb = () => { if (gen !== bedGen) return; h.sleep = true; h.busy = false; inside.coop++; };
    };
    if (instant) go(); else setTimeout(go, 500 + i * 450);
  });
  const sayIt = () => { if (gen === bedGen && S.vo) say(B.txt(), B.who); };
  setTimeout(sayIt, instant ? 600 : 1200);
  if (bedMode === 'night') cue(SFX.soft);
  if (bedMode === 'storm') cue(SFX.thunder);
}
function endBed() {
  if (!bedOn) return;
  bedOn = false; bedGen++; $('app').classList.remove('bedtime'); $('bed').hidden = true; stopSpeech(); rainOn(false);
  [ELD.k, ELD.n].forEach((e, i) => { if (!e.g.visible) { e.g.visible = true; e.g.position.set(DOOR.x + i * .5, 0, DOOR.z); } });
  elderGo(ELD.k, 8.1, 3.2); elderGo(ELD.n, 9.1, 6.2);
  if (!PL.g.visible) { PL.g.visible = true; PL.g.position.set(DOOR.x + 1, 0, DOOR.z); }
  plGo(HUB.x, HUB.z);
  HENS.forEach(h => { if (h.sleep) { h.sleep = false; h.busy = false; h.tx = null; h.head.rotation.x = 0; h.g.position.y = 0; h.wait = 1; } });
  inside.barn = inside.coop = 0; cue(SFX.rooster); cue(SFX.good);
  S.pl.cur = ''; save(); S.pl.warned = leftSec() > 60 ? false : true;
}
/* parent changed something: wake everyone up if there is time again */
function careApply() { if (bedOn && leftSec() > 0) endBed(); }

/* ----- per-frame ----- */
const rc = $('rain'), rx = rc.getContext('2d'), DROPS = [];
function rainDraw(dt, k) {
  const w = innerWidth, h = innerHeight; if (rc.width !== w || rc.height !== h) { rc.width = w; rc.height = h; }
  rx.clearRect(0, 0, w, h); if (k <= .02 || bedMode !== 'storm') return;
  while (DROPS.length < 150) DROPS.push({ x: Math.random() * (w + 200), y: Math.random() * h, l: 14 + Math.random() * 16, v: 700 + Math.random() * 400 });
  rx.strokeStyle = 'rgba(215,232,255,' + (.6 * k).toFixed(2) + ')'; rx.lineWidth = 2; rx.lineCap = 'round'; rx.beginPath();
  DROPS.forEach(d => { d.y += d.v * dt; d.x -= d.v * dt * .22; if (d.y > h) { d.y = -20; d.x = Math.random() * (w + 200); } if (d.x < -20) d.x += w + 200; rx.moveTo(d.x, d.y); rx.lineTo(d.x + d.l * .22, d.y - d.l); });
  rx.stroke();
}
let rainNode = null;
function rainOn(on) {
  const a = AC; if (!a) return; if (on && !S.snd) on = false;
  if (on && !rainNode && a.state === 'running') {
    const len = a.sampleRate * 2, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource(); src.buffer = buf; src.loop = true; const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1700; const g = a.createGain(); g.gain.setValueAtTime(0, a.currentTime); g.gain.linearRampToValueAtTime(.07, a.currentTime + 2);
    src.connect(f); f.connect(g); g.connect(a.destination); src.start(); rainNode = { src, g };
  } else if (!on && rainNode) { const n = rainNode; rainNode = null; try { n.g.gain.cancelScheduledValues(a.currentTime); n.g.gain.setValueAtTime(n.g.gain.value, a.currentTime); n.g.gain.linearRampToValueAtTime(0, a.currentTime + 1); n.src.stop(a.currentTime + 1.1); } catch (e) { /* ignore */ } }
}
function flashNow(big) {
  const f = $('flash'); f.classList.add('on'); setTimeout(() => f.classList.remove('on'), 120);
  if (big) { setTimeout(() => f.classList.add('on'), 220); setTimeout(() => f.classList.remove('on'), 330); }
  setTimeout(() => cue(SFX.thunder), 350 + Math.random() * 500);
}
function bedStep(dt) {
  bedK = clamp(bedK + (bedOn ? dt : -dt) / 2.4, 0, 1); const k = bedK * bedK * (3 - 2 * bedK), B = BED[bedMode];
  HEMI.intensity = lerp(.88, B.hi, k); HEMI.color.copy(HEMI_C).lerp(cTmp.set(B.hc), k);
  sun.intensity = lerp(.78, B.si, k); sun.color.copy(SUN_C).lerp(cTmp2.set(B.sc), k);
  if (bedK === 0 && !bedOn) { $('app').classList.remove('bed-night', 'bed-storm', 'bed-sick'); }
  if (bedMode === 'storm') { rainDraw(dt, k); rainOn(bedOn); if (bedOn) { stormT -= dt; if (stormT <= 0) { stormT = 4 + Math.random() * 5; flashNow(Math.random() < .5); } } } else { rainDraw(dt, 0); }
  /* little floating signs above the barn / coop while someone is inside */
  const sick = bedMode === 'sick';
  const bz = zSite('barn', sick ? '<b>🤒</b><b class="d1">🤧</b>' : bedMode === 'storm' ? '<b>🏠</b>' : '<i>z</i><i class="d1">Z</i><i class="d2">z</i>');
  const show = bedOn && inside.barn > 0, sb = screenOf(SITE.barn); bz.style.display = show ? '' : 'none'; bz.style.left = sb.x + 'px'; bz.style.top = sb.y + 'px';
  const cz = zSite('coop', '<i>z</i><i class="d1">Z</i><i class="d2">z</i>'), sc = screenOf(SITE.coop); cz.style.display = bedOn && inside.coop > 0 ? '' : 'none'; cz.style.left = sc.x + 'px'; cz.style.top = sc.y + 'px';
  if (AC && musBus && musDuck !== bedOn) { musDuck = bedOn; try { musBus.gain.setTargetAtTime(bedOn ? .18 : .55, AC.currentTime, .8); } catch (e) { /* ignore */ } }
}
function careTick(dt) {
  const p = plState(), active = started && !stOn && !touring;
  if (active && !paused && !bedOn && dt > 0 && !document.hidden) { p.used += dt; careSave += dt; if (careSave > 10) { careSave = 0; save(); } }
  if (active && !bedOn && p.lim > 0) {
    const left = leftSec();
    if (left <= 0) beginBed(false);
    else if (left <= 60 && !p.warned) { p.warned = true; save(); careToast('Sebentar lagi waktunya istirahat ya 🌙'); if (S.vo) say('Sebentar lagi waktunya istirahat ya!', 'n'); }
  }
  if (bedOn || bedK > 0) bedStep(dt);
}
/* tapping the sleeping farm: a small reaction */
$('bed').addEventListener('pointerdown', e => {
  if (e.target.closest('button')) return; ac();
  if (bedMode === 'storm') { flashNow(true); return; }
  SFX.soft(); const s = document.createElement('div'); s.className = 'tw'; s.textContent = bedMode === 'sick' ? '💤' : '✨'; s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px'; $('app').appendChild(s); setTimeout(() => s.remove(), 1100);
});

/* ----- parent gate + panel ----- */
let gateA = 0, gateBack = null;
function openGate(back) {
  gateBack = back || null; const a = rand(6, 9), b = rand(12, 19); gateA = a * b; $('gateQ').textContent = `Untuk orang tua: ${a} × ${b} = ?`; $('gateIn').value = ''; $('gate').hidden = false; $('gateCard').classList.remove('bad'); setTimeout(() => { try { $('gateIn').focus(); } catch (e) { /* ignore */ } }, 80);
}
function gateOk() {
  if (+$('gateIn').value === gateA) { $('gate').hidden = true; openParent(); }
  else { const c = $('gateCard'); c.classList.remove('bad'); void c.offsetWidth; c.classList.add('bad'); SFX.soft(); openGate(gateBack); }
}
$('gateGo').addEventListener('click', gateOk);
$('gateIn').addEventListener('keydown', e => { if (e.key === 'Enter') gateOk(); });
$('gateNo').addEventListener('click', () => { $('gate').hidden = true; });
const CM = [['night', '🌙', 'Malam'], ['storm', '⛈️', 'Badai'], ['sick', '🤒', 'Sakit'], ['acak', '🎲', 'Acak']];
function parentRefresh() {
  const p = plState();
  $('pLim').value = p.lim; $('pLimTxt').textContent = p.lim ? p.lim + ' menit' : 'Tanpa batas';
  const used = fmtMin(p.used), left = leftSec();
  $('pUse').textContent = p.lim ? `Hari ini sudah main ${used}. ` + (left > 0 ? `Sisa ${fmtMin(left + 59)}.` : 'Waktu hari ini habis.') + (p.bonus ? ` (tambahan ${p.bonus} menit)` : '') : `Hari ini sudah main ${used}.`;
  $('pModes').querySelectorAll('.opt').forEach(b => b.classList.toggle('on', b.dataset.m === p.mode));
}
function openParent() { parentRefresh(); $('parent').hidden = false; }
function closeParent() { $('parent').hidden = true; careApply(); if (paused) $('menu').hidden = false; }
$('pModes').innerHTML = CM.map(m => `<button class="opt" data-m="${m[0]}"><span>${m[1]}</span>${m[2]}</button>`).join('');
$('pModes').addEventListener('click', e => { const b = e.target.closest('.opt'); if (!b) return; SFX.pop(2); plState().mode = b.dataset.m; plState().cur = ''; save(); parentRefresh(); });
$('pLim').addEventListener('input', () => { const p = plState(); p.lim = +$('pLim').value; p.warned = false; save(); parentRefresh(); });
$('pPlus10').addEventListener('click', () => { SFX.good(); plState().bonus += 10; plState().warned = false; save(); parentRefresh(); careApply(); });
$('pPlus30').addEventListener('click', () => { SFX.good(); plState().bonus += 30; plState().warned = false; save(); parentRefresh(); careApply(); });
$('pReset').addEventListener('click', () => { SFX.soft(); const p = plState(); p.used = 0; p.bonus = 0; p.warned = false; save(); parentRefresh(); careApply(); });
$('pPreview').addEventListener('click', () => { $('parent').hidden = true; if (paused) setPaused(false); beginBed(false); });
$('pClose').addEventListener('click', closeParent);
$('mParent').addEventListener('click', () => { $('menu').hidden = true; openGate(); });
$('bedBtn').addEventListener('click', () => openGate());
$('gateNo').addEventListener('click', () => { if (paused) $('menu').hidden = false; });

(function stars() { const f = $('skyfx'); for (let i = 0; i < 26; i++) { const e = document.createElement('i'); e.className = 'star'; e.style.left = (Math.abs(Math.sin(i * 12.9)) * 96 + 2) + '%'; e.style.top = (Math.abs(Math.cos(i * 7.3)) * 55 + 2) + '%'; e.style.animationDelay = (i % 7) * .35 + 's'; f.appendChild(e); } })();
