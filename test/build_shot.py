import os
URL = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
import json, time
from playwright.sync_api import sync_playwright
now = int(time.time()*1000)
S0 = {'done': 12, 'coins': 3, 'inv': [0,0,0,0], 'eggs': 0, 'hens': 0, 'snd': False, 'mus': False, 'av': 'b',
      'plots': [{'c': 0, 'cs': [2]*10, 'r': [now+90000]*10}, {'c': 2, 'cs': [3]*5+[1]*5, 'r': [0]*10}, {'c': 1, 'cs': [0]*10, 'r': [0]*10}, {'c': 3, 'cs': [0]*10, 'r': [0]*10}],
      'unl': {'plots': 2, 'coop': False, 'kios': False}, 'bld': {'id': 'coop', 'at': now+60000, 'k': 2}}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}); ctx.add_init_script("localStorage.setItem('farmath_v02', %s)" % json.dumps(json.dumps(S0)))
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL+'?fast'); pg.wait_for_timeout(800); pg.click('#btnPlay'); pg.wait_for_timeout(300)
    pg.evaluate("() => { __farm.S.bld.at = Date.now() + 30000; }")
    pg.wait_for_timeout(15000); pg.screenshot(path='shots/build.png'); print(errs)
    b.close()
