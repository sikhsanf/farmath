import os, sys, json
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
OUT = sys.argv[1]; W, H = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 3 else (844, 390)
TS = [float(x) for x in (sys.argv[4].split(',') if len(sys.argv) > 4 else '0.5,1.6,2.4,3.4,4.6,6.0,7.0,8.5,10.8'.split(','))]
S0 = {'story': True, 'tour': True, 'look': {'g': False, 'h': 2, 'c': 0}, 'nm': 'Zaid', 'fm': 'Kebun Zaid', 'snd': False, 'mus': False}
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_context(viewport={'width': W, 'height': H}).new_page()
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text else None)
    pg.add_init_script("localStorage.setItem('farmath_v02', %s)" % json.dumps(json.dumps(S0)))
    pg.goto(URL + '?skip'); pg.wait_for_timeout(700)
    for t in TS:
        pg.evaluate("t => __farm.op(t)", t - 0.05); pg.wait_for_timeout(350)
        pg.screenshot(path='%s_%04.1f.png' % (OUT, t))
print('errors:', errs)
