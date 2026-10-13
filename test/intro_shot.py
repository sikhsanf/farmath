import os
URL = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}); ctx.add_init_script("localStorage.removeItem('farmath_v02')")
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text else None)
    pg.goto(URL+'?skip'); pg.wait_for_timeout(800); pg.screenshot(path='shots/i_title.png')
    pg.click('#btnPlay'); pg.wait_for_timeout(1500); pg.screenshot(path='shots/i_story1.png')
    for i in range(3): pg.click('#stNext'); pg.wait_for_timeout(1200); pg.screenshot(path='shots/i_story%d.png' % (i+2))
    pg.click('#stNext'); pg.wait_for_timeout(1500)
    pg.click('#cuGender .opt[data-g="1"]'); pg.click('#cuHat .opt[data-h="1"]'); pg.click('#cuCol .sw[data-c="2"]')
    pg.fill('#cuName', 'Zaid'); pg.fill('#cuFarm', 'Kebun Zaid'); pg.wait_for_timeout(800); pg.screenshot(path='shots/i_custom.png')
    pg.click('#cuGo'); pg.wait_for_timeout(2500); pg.screenshot(path='shots/i_tour1.png')
    for i in range(3): pg.click('.nextbtn'); pg.wait_for_timeout(2200); pg.screenshot(path='shots/i_tour%d.png' % (i+2))
    pg.click('.nextbtn'); pg.wait_for_timeout(2500); pg.screenshot(path='shots/i_hub.png')
    print(errs, pg.evaluate("() => [__farm.S.nm, __farm.S.fm, JSON.stringify(__farm.S.look), __farm.S.tour]"))
    b.close()
