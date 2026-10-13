import os
URL = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
import json, time
from playwright.sync_api import sync_playwright
S0 = {'done': 12, 'coins': 0, 'inv': [4, 0, 6, 0], 'eggs': 6, 'hens': 3, 'snd': False, 'mus': False, 'av': 'g', 'hungryAt': 0,
      'plots': [{'c': 0, 'cs': [2]*10, 'r': [int(time.time()*1000)+300000]*10}, {'c': 2, 'cs': [0]*10, 'r': [0]*10}, {'c': 1, 'cs': [0]*10, 'r': [0]*10}, {'c': 3, 'cs': [0]*10, 'r': [0]*10}],
      'unl': {'plots': 1, 'coop': True, 'kios': True}}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}); ctx.add_init_script("localStorage.setItem('farmath_v02', %s)" % json.dumps(json.dumps(S0)))
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL+'?skip'); pg.wait_for_timeout(800); pg.click('#btnPlay')
    pg.wait_for_timeout(2500); pg.screenshot(path='shots/alert_hungry.png')
    pg.wait_for_timeout(9000); pg.screenshot(path='shots/alert_cust.png')
    pg.wait_for_timeout(5000); pg.screenshot(path='shots/alert_hub.png'); print(errs)
    b.close()
