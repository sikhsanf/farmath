import os, sys, json, time
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
OUT = sys.argv[1]
S0 = {'story': True, 'tour': True, 'look': {'g': False, 'h': 2, 'c': 0}, 'nm': 'Zaid', 'fm': 'Kebun Zaid', 'snd': False, 'mus': False, 'vo': False, 'tut': 4, 'tutV': 2, 'inv': [0, 0, 3, 0], 'coins': 4, 'tutC': True, 'tutH': True}
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_context(viewport={'width': 844, 'height': 390}).new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("localStorage.setItem('farmath_v02', %s)" % json.dumps(json.dumps(S0)))
    pg.goto(URL + '?auto&fast'); pg.wait_for_timeout(1500)
    ev = lambda js: pg.evaluate(js)
    def until(js, secs=40):
        t = time.time()
        while time.time() - t < secs:
            if ev(js): return True
            pg.wait_for_timeout(300)
        return False
    def chip(txt=''):
        pg.evaluate("t => { const c=[...document.querySelectorAll('.wchip.price.tap')].find(e=>e.style.display!=='none' && e.textContent.includes(t)); if (c) c.click(); }", txt)
    def pay_all():
        until("!!__farm.T && __farm.T.type==='pay'", 10)
        for _ in range(30):
            if not ev("!!__farm.T"): return
            ev("(() => { const T=__farm.T; if (T && T.type==='pay' && !T.locked) __farm.TK.pay.coin(); })()"); pg.wait_for_timeout(250)
    print('start tut', ev("__farm.S.tut"), 'coins', ev("__farm.S.coins"))
    until("!__farm.T"); chip(); pay_all(); ok = until("__farm.S.tut===5 && __farm.S.unl.coop", 60); print('coop built, tut5:', ok); pg.screenshot(path=OUT + '_b_hen.png')
    until("!__farm.T"); pg.wait_for_timeout(1500); chip(); pay_all(); ok = until("__farm.S.tut===6", 30); print('hen bought, tut6:', ok, 'coins', ev("__farm.S.coins"))
    until("__farm.S.tut===6 && !__farm.T"); pg.wait_for_timeout(4000)
    # hungry -> tap the sack chip (the 'hg' / 'fk' one)
    for _ in range(30):
        if ev("!!__farm.T"): break
        chip(); pg.wait_for_timeout(500)
    for _ in range(14):
        if not ev("!!__farm.T"): break
        ev("(() => { const T=__farm.T; if (T && T.type==='feed' && !T.locked) __farm.TK.feed.tap({kind:'sack'}); })()"); pg.wait_for_timeout(500)
    ok = until("__farm.S.tut===7", 30); print('fed, tut7:', ok, 'eggs', ev("__farm.S.eggs"), 'coins', ev("__farm.S.coins")); pg.screenshot(path=OUT + '_c_kios.png')
    until("!__farm.T"); pg.wait_for_timeout(1500); chip(); pay_all(); ok = until("__farm.S.tut===8 && __farm.S.unl.kios", 60); print('kios built, tut8:', ok)
    until("!__farm.T")
    for _ in range(160):
        if _ % 20 == 0: print('dbg', ev("JSON.stringify({c: !!__farm.CUST, r: __farm.CUST && __farm.CUST.ready, b: __farm.CUST && __farm.CUST.busy, T: __farm.T && __farm.T.type, eggs: __farm.S.eggs, inv: __farm.S.inv, tut: __farm.S.tut})"))
        if ev("!!__farm.T"): break
        chip('Pelanggan'); pg.wait_for_timeout(500)
    for _ in range(30):
        T = ev("(() => { const T=__farm.T; return T && {type:T.type, phase:T.phase, a:T.a, b:T.b, A:T.A, B:T.B}; })()")
        if not T: break
        if T['phase'] == 'load': ev("k => 0") ; pg.evaluate("k => __farm.TK.sell.tap({kind:k})", 'veg' if T['a'] < T['A'] else 'egg')
        elif T['phase'] == 'ask':
            tot = T['A'] + T['B']
            for x in pg.query_selector_all('.choice'):
                if x.inner_text().strip() == str(tot): x.evaluate('e => e.click()')
        pg.wait_for_timeout(600)
    ok = until("!document.getElementById('tutend').hidden", 20); print('sold, tutend:', ok, 'tut', ev("__farm.S.tut"))
    pg.screenshot(path=OUT + '_e_end.png')
print('ERR', errs)
