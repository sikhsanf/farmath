import os, sys, json
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
OUT = sys.argv[1]; W, H = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 3 else (844, 390)
S0 = {'story': True, 'tour': True, 'look': {'g': False, 'h': 2, 'c': 0}, 'nm': 'Zaid', 'fm': 'Kebun Zaid', 'snd': False, 'mus': False, 'tut': 4, 'hens': 3, 'unl': {'plots': 2, 'coop': True, 'kios': False}}
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_context(viewport={'width': W, 'height': H}).new_page()
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text else None)
    pg.add_init_script("localStorage.setItem('farmath_v02', %s)" % json.dumps(json.dumps(S0)))
    pg.goto(URL + '?auto&fast'); pg.wait_for_timeout(1500)
    pg.screenshot(path=OUT + '_day.png')
    # real flow: set a 1 minute limit with 59s used -> should trigger by itself
    pg.evaluate("(() => { const p = __farm.S; p.pl = { lim: 1, day: (d=>d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate())(new Date()), used: 0, bonus: 0, mode: 'acak', cur: '', warned: false }; })()")
    pg.wait_for_timeout(300)
    pg.evaluate("(() => { __farm.S.pl.used = 59.5; })()")
    pg.wait_for_timeout(3000)
    print('bed on after limit:', pg.evaluate("__farm.care.on"), 'mode', pg.evaluate("__farm.S.pl.cur"))
    for m in ['night', 'storm', 'sick']:
        pg.evaluate("m => { __farm.care.endBed(); __farm.S.pl.mode = m; __farm.S.pl.lim = 1; __farm.S.pl.used = 59.9; }", m)
        pg.wait_for_timeout(300)
        pg.evaluate("__farm.S.pl.used = 70")
        pg.wait_for_timeout(5200)
        pg.screenshot(path=OUT + '_' + m + '.png')
    # parent flow from the bed overlay
    pg.click('#bedBtn'); pg.wait_for_timeout(200)
    q = pg.inner_text('#gateQ'); print('gate:', q)
    import re
    a, bb = map(int, re.findall(r'(\d+) × (\d+)', q)[0])
    pg.fill('#gateIn', str(a * bb + 1)); pg.click('#gateGo'); pg.wait_for_timeout(200)
    print('wrong ->parent hidden:', pg.evaluate("document.getElementById('parent').hidden"))
    q = pg.inner_text('#gateQ'); a, bb = map(int, re.findall(r'(\d+) × (\d+)', q)[0])
    pg.fill('#gateIn', str(a * bb)); pg.click('#gateGo'); pg.wait_for_timeout(300)
    pg.screenshot(path=OUT + '_parent.png')
    print('parent shown:', not pg.evaluate("document.getElementById('parent').hidden"))
    pg.click('#pPlus10'); pg.wait_for_timeout(200); pg.click('#pClose'); pg.wait_for_timeout(2500)
    print('bed on after +10:', pg.evaluate("__farm.care.on"), 'left', pg.evaluate("__farm.care.leftSec()"))
    pg.screenshot(path=OUT + '_wake.png')
    pg.wait_for_timeout(1500); pg.screenshot(path=OUT + '_after.png')
print('errors:', errs)
