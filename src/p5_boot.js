/* ---------- boot ---------- */
for (let k = 0; k < S.unl.plots; k++) { buildPlot(k); restorePlot(k); }
if (S.unl.coop) coopG.visible = true;
if (S.unl.kios) { kiosG.visible = true; kiosCrop = -1; syncKios(); }
syncHens(); buildPlayer(); refreshOffers();
if (S.bld) { startConVis(ofrById(S.bld.id)); const q = conPoints()[0]; ELD.k.g.position.set(q.x, 0, q.z); }
resize(); focus(FOC.overview, true); applyCam(); updateHud();
requestAnimationFrame(frame);
if (/[?&]auto/.test(location.search)) { if (!S.look) S.look = { g: false, h: 2, c: 0 }; S.nm = S.nm || 'Petani Cilik'; S.fm = S.fm || 'Kebun Ceria'; S.tour = true; buildPlayer(); startGame(); }

/* test hook (harmless in production) */
window.__farm = {
  get S() { return S; }, get T() { return T; }, get CUST() { return CUST; }, P, HENS, ELD, PL, camera, screenOf, worldOf, TK, OFR,
  picksNow: () => allPicks().map(m => { const p = screenOf(worldOf(m)); return { d: m.userData, x: p.x, y: p.y }; }),
  cellXY: (k, i) => { const c = P[k].cells[i]; return screenOf(new THREE.Vector3(c.x, .3, c.z)); },
  setState: o => { Object.assign(S, o); save(); refreshOffers(); updateHud(); }
};
