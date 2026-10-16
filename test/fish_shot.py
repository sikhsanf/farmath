import os, sys, json, time
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
OUT = sys.argv[1] if len(sys.argv) > 1 else 'shots/fish'
S0 = {'done': 40, 'coins': 40, 'inv': [3,2,0,0], 'eggs': 4, 'hens': 2, 'snd': False, 'mus': False, 'vo': False, 'av': 'b', 'story': True, 'tour': True, 'tut': 9, 'tutV': 2, 'nm': 'Zaid', 'fm': 'Kebun Z', 'look': {'g': False, 'h': 2, 'c': 0},
      'plots': [{'c': 0, 'cs': [0]*10, 'r': [0]*10}]*4, 'unl': {'plots': 2, 'coop': True, 'kios': True}}
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    ctx = b.new_context(viewport={'width': 844, 'height': 390}); ctx.add_init_script("localStorage.setItem('farmath_v02', %s)" % json.dumps(json.dumps(S0)))
    pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(URL + '?auto&fast'); pg.wait_for_timeout(1500)
    def wait(cond, to=40):
        t = time.time()
        while time.time() - t < to:
            if pg.evaluate(cond): return True
            pg.wait_for_timeout(300)
        print('TIMEOUT', cond); return False
    wait("document.getElementById('start').hidden || true")
    pg.evaluate("() => { const b=document.getElementById('btnPlay'); b && b.click(); }"); pg.wait_for_timeout(2500)
    print('offer pond visible:', pg.evaluate("() => { __farm.OFR; return 1 }"))
    pg.screenshot(path=OUT + '_0.png')
    print(pg.evaluate("() => JSON.stringify({o: __farm.OFR.map(o=>[o.id,o.ghost.g.visible,o.avail()]), T: !!__farm.T})"))
    pg.evaluate("() => { document.querySelector('.price.tap') }")
    pg.evaluate("() => { __farm.offerTap(__farm.OFR.find(o=>o.id==='pond')) }")
    wait("__farm.T && __farm.T.type==='pay'"); pg.wait_for_timeout(500); pg.screenshot(path=OUT + '_1pay.png')
    for i in range(15): pg.evaluate("() => __farm.TK.pay.coin()"); pg.wait_for_timeout(150)
    pg.wait_for_timeout(1500); print(pg.evaluate("() => JSON.stringify({T: __farm.T && {k: __farm.T.k, pr: __farm.T.price, lk: __farm.T.locked}, bld: __farm.S.bld, coins: __farm.S.coins})"))
    pg.evaluate("() => { if (__farm.S.bld) __farm.S.bld.at = Date.now() + 500; }"); wait("__farm.S.unl.pond", 30); wait("!__farm.T", 15); pg.wait_for_timeout(2500); pg.screenshot(path=OUT + '_2built.png')
    pg.evaluate("() => __farm.tryFish()"); wait("__farm.T && __farm.T.type==='fish'"); pg.wait_for_timeout(1500); pg.screenshot(path=OUT + '_3fish.png')
    N = pg.evaluate("__farm.T.N"); print('N', N, 'A', pg.evaluate("__farm.T.A"), 'R', pg.evaluate("__farm.T.R"))
    for i in range(N): pg.evaluate("() => __farm.TK.fish.catchAny()"); pg.wait_for_timeout(500)
    wait("__farm.T.phase==='ask'", 15); pg.screenshot(path=OUT + '_4ask.png')
    pg.evaluate("() => { const R=__farm.T.R; [...document.querySelectorAll('.choice')].find(b=>b.textContent==R).click(); }")
    wait("!__farm.T", 15); print('fish', pg.evaluate("__farm.S.fish"), 'coins', pg.evaluate("__farm.S.coins"))
    pg.screenshot(path=OUT + '_5done.png')
    # sell fish: force customer wanting fish
    pg.evaluate("() => { __farm.S.eggs = 0; }")
    wait("__farm.CUST && __farm.CUST.ready", 60) or pg.evaluate("() => __farm.spawnCust && __farm.spawnCust()")
    print('cust', pg.evaluate("() => __farm.CUST && __farm.CUST.k2"))
    pg.evaluate("() => __farm.trySell()"); wait("__farm.T && __farm.T.type==='sell'"); pg.wait_for_timeout(1500); pg.screenshot(path=OUT + '_6sell.png')
    for i in range(12):
        pg.evaluate("() => { const T=__farm.T; if (T && T.phase==='load') __farm.TK.sell.tap({kind: T.a<T.A ? 'veg' : (T.k2==='fish'?'fishs':'egg')}) }"); pg.wait_for_timeout(450)
    wait("__farm.T && __farm.T.phase==='ask'", 15); pg.screenshot(path=OUT + '_7sellask.png')
    pg.evaluate("() => { const t=__farm.T.A+__farm.T.B; [...document.querySelectorAll('.choice')].find(b=>b.textContent==t).click(); }")
    wait("!__farm.T", 15); print('after sell fish', pg.evaluate("__farm.S.fish"), 'coins', pg.evaluate("__farm.S.coins"))
    b.close()
print('ERRS', errs)
