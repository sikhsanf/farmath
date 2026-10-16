import os, sys, json
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
OUT = sys.argv[1]
S0 = {'story': True, 'tour': True, 'look': {'g': False, 'h': 2, 'c': 0}, 'nm': 'Zaid', 'fm': 'Kebun Zaid', 'snd': False, 'mus': False}
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_context(viewport={'width': 390, 'height': 844}, has_touch=False).new_page()
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text else None)
    pg.add_init_script("localStorage.setItem('farmath_v02', %s)" % json.dumps(json.dumps(S0)))
    pg.goto(URL + '?fast'); pg.wait_for_timeout(800); pg.click('#btnPlay'); pg.wait_for_timeout(1500)
    pg.screenshot(path=OUT + '_1hub.png')
    # joystick drag
    x0 = pg.evaluate("[__farm.P ? 0 : 0]")
    j = pg.eval_on_selector('#joy', 'e => { const r = e.getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; }')
    pos = lambda: pg.evaluate("(() => { const q = __farm.PLpos(); return [q.x, q.z]; })()")
    a = pos(); pg.mouse.move(j[0], j[1]); pg.mouse.down(); pg.mouse.move(j[0] + 40, j[1] - 10, steps=3); pg.wait_for_timeout(900)
    pg.screenshot(path=OUT + '_2joy.png'); b2 = pos(); pg.mouse.up(); pg.wait_for_timeout(300)
    print('joy moved', a, '->', b2)
    def click_cell(i):
        c = pg.evaluate("([k,i]) => __farm.cellXY(k,i)", [0, i]); pg.mouse.click(c['x'], c['y'])
    def tut(): return pg.evaluate("__farm.S.tut")
    def wait_task():
        for _ in range(60):
            if not pg.evaluate("!!__farm.T"): return
            pg.wait_for_timeout(300)
    def run_task(kind):
        # tap cells until the task finishes
        for _ in range(40):
            T = pg.evaluate("(() => { const T=__farm.T; return T && {type:T.type,locked:T.locked,cells:T.cells,got:T.got?[...T.got]:[],sel:T.sel,k:T.k,n:T.n}; })()")
            if not T: return
            if T['locked']: pg.wait_for_timeout(400); continue
            if T['type'] == 'plant':
                e = pg.evaluate("__farm.S.plots[0].cs.map((v,i)=>v===0?i:-1).filter(i=>i>=0)")
                click_cell(e[0])
            elif T['type'] == 'water':
                i = [c for c in T['cells'] if c not in T['got']][0]; pg.wait_for_timeout(900); click_cell(i)
            elif T['type'] == 'harvest':
                i = [c for c in T['cells'] if c not in T['got']][0]
                m = pg.evaluate('([k,i]) => __farm.markXY(k,i,"star")', [0, i])
                if m and i % 2 == 0: pg.mouse.click(m['x'], m['y'])  # tap the floating star itself
                else: click_cell(i)
            pg.wait_for_timeout(500)
    for step, nm in [(0, 'plant'), (1, 'water')]:
        assert tut() == step, (tut(), step)
        cc = pg.evaluate("([k,i]) => __farm.cellXY(k,i)", [0, 0]); pg.mouse.click(cc['x'], cc['y'])
        pg.wait_for_timeout(600)
        if step == 0:
            pg.screenshot(path=OUT + '_2pick.png'); print('crop options', pg.evaluate("document.querySelectorAll('.choice.crop').length")); pg.click('.choice.crop >> nth=1'); pg.wait_for_timeout(500)
        run_task(nm); pg.wait_for_timeout(800)
        print('after', nm, 'tut=', tut())
        if step == 0: pg.screenshot(path=OUT + '_3mission2.png')
    pg.wait_for_timeout(3500)
    # step 2 -> tap growing for cheer then wait ready
    pg.screenshot(path=OUT + '_4grow.png'); print('tut', tut())
    c = pg.evaluate("([k,i]) => __farm.cellXY(k,i)", [0, 0]); pg.mouse.click(c['x'], c['y']); pg.wait_for_timeout(300); pg.screenshot(path=OUT + '_5cheer.png')
    for _ in range(40):
        if tut() == 3: break
        pg.wait_for_timeout(500)
    print('ready tut', tut()); pg.wait_for_timeout(4500)
    first = pg.evaluate("__farm.S.plots[0].cs.findIndex(v=>v===3)")
    click_cell(first); pg.wait_for_timeout(600); run_task('harvest'); pg.wait_for_timeout(1500)
    print('final tut', tut(), 'coins', pg.evaluate('__farm.S.coins')); pg.screenshot(path=OUT + '_6end.png')
    print('ERR', errs[:5]); b.close()
