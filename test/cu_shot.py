import os, sys, json
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
OUT = sys.argv[1]
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_context(viewport={'width': 844, 'height': 390}).new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("localStorage.setItem('farmath_v02', %s)" % json.dumps(json.dumps({'story': True, 'snd': False, 'mus': False, 'vo': False})))
    pg.goto(URL + '?skip'); pg.wait_for_timeout(800); pg.click('#btnPlay', force=True); pg.wait_for_timeout(1500)
    pg.screenshot(path=OUT + '_cu_empty.png')
    pg.click('#cuGo'); pg.wait_for_timeout(300); print('still creator:', pg.evaluate("!document.getElementById('cust').hidden"))
    pg.fill('#cuName', 'Zaid'); pg.click('#cuGo'); print('farm empty, still creator:', pg.evaluate("!document.getElementById('cust').hidden"))
    pg.fill('#cuFarm', 'Kebun Z'); pg.wait_for_timeout(200); pg.screenshot(path=OUT + '_cu_full.png'); pg.click('#cuGo'); pg.wait_for_timeout(1500)
    print('creator closed:', pg.evaluate("document.getElementById('cust').hidden"), pg.evaluate("__farm.S.nm"), pg.evaluate("__farm.S.fm"))
    pg.screenshot(path=OUT + '_game.png')
print(errs)
