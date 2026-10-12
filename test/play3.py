import os
URL = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
"""Auto-play Farmath v0.3 hub flow (fast timers). usage: play3.py <prefix> <seconds> [late]"""
import sys, json, time
from playwright.sync_api import sync_playwright
OUT, SECS = sys.argv[1], int(sys.argv[2]); LATE = len(sys.argv) > 3
errors, seen, log = [], set(), []
S0 = {'done': 12, 'coins': 40, 'inv': [4, 0, 6, 0], 'eggs': 6, 'hens': 3, 'snd': False, 'mus': False, 'av': 'g', 'hungryAt': 0,
      'plots': [{'c': 0, 'cs': [3]*4 + [0]*6, 'r': [0]*10}, {'c': 2, 'cs': [1]*3 + [0]*7, 'r': [0]*10}, {'c': 1, 'cs': [0]*10, 'r': [0]*10}, {'c': 3, 'cs': [0]*10, 'r': [0]*10}],
      'unl': {'plots': 2, 'coop': True, 'kios': True}}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
    ctx.add_init_script(("localStorage.setItem('farmath_v02', %s)" % json.dumps(json.dumps(S0))) if LATE else "localStorage.removeItem('farmath_v02')")
    pg = ctx.new_page()
    pg.on('console', lambda m: errors.append((m.type, m.text)) if m.type == 'error' and 'ERR_TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: errors.append(('pageerror', str(e))))
    pg.goto(URL+'?fast'); pg.wait_for_timeout(1000)
    def snap(n):
        if n in seen: return
        seen.add(n); pg.screenshot(path='%s_%s.png' % (OUT, n))
    snap('start')
    if LATE: pg.click('#btnPlay')
    else: pg.click('#btnGirl')
    def st(): return pg.evaluate("""() => { const T=__farm.T, S=__farm.S, C=__farm.CUST; return {T: T && {type:T.type,k:T.k,n:T.n,N:T.N,plot:T.plot,locked:T.locked,phase:T.phase,A:T.A,B:T.B,a:T.a,b:T.b,sel:T.sel,cells:T.cells,got:T.got?[...T.got]:null,id:T.id,price:T.price},
       done:S.done,coins:S.coins,inv:S.inv,eggs:S.eggs,hens:S.hens,bld:!!S.bld,unl:S.unl,cs:S.plots.map(p=>p.cs.join('')),hungry:S.hens>0&&Date.now()>=S.hungryAt,cust:C&&{ready:C.ready,busy:C.busy},offers:__farm.OFR.map(o=>[o.id,o.ghost.g.visible,o.price()])}; }""")
    def click_pick(kind, f=lambda d: True):
        for q in pg.evaluate("() => __farm.picksNow()"):
            if q['d']['kind'] == kind and f(q['d']):
                pg.mouse.click(q['x'], q['y']); return True
        return False
    def click_cell(k, i):
        c = pg.evaluate("([k,i]) => __farm.cellXY(k,i)", [k, i]); pg.mouse.click(c['x'], c['y'])
    t0 = time.time(); lastlog = None; idle = 0
    while time.time() - t0 < SECS:
        s = st(); T = s['T']
        key = (s['done'], s['coins'], s['hens'], T and T['type'], s['bld'])
        if key != lastlog: lastlog = key; log.append((round(time.time()-t0), s['done'], s['coins'], T and T['type'], s['cs'][0], s['unl'], s['hens'], s['bld'], s['inv'], s['eggs']))
        if T and T['locked']: pg.wait_for_timeout(400); continue
        if not T:
            pg.wait_for_timeout(1500 if idle == 0 else 300); idle += 1
            if idle < 2: snap('hub'); continue
            idle = 0
            done = False
            for o in s['offers']:
                if o[1] and s['coins'] >= o[2] and (o[0] == 'hen' or not s['bld']):
                    done = click_pick('offer', lambda d: d['id'] == o[0]); break
            if done: continue
            if s['hungry']: click_pick('sack'); continue
            if s['cust'] and s['cust']['ready'] and not s['cust']['busy']: click_pick('cust'); continue
            if not s['bld']:
                acted = False
                for st_ in (0, 1, 3):
                    for k in range(s['unl']['plots']):
                        cs = s['cs'][k]
                        if str(st_) in cs:
                            click_cell(k, cs.index(str(st_))); acted = True; break
                    if acted: break
            continue
        ty = T['type']
        if ty == 'pay':
            if 'pay' not in seen: pg.wait_for_timeout(1500)
            snap('pay_' + T['id'])
            b_ = pg.query_selector('.coinbtn'); b_ and b_.click()
        elif ty == 'plant':
            if T['k'] == 0: pg.wait_for_timeout(1500); snap('plant')
            cs = s['cs'][T['plot']]; click_pick('cell', lambda d: d['plot'] == T['plot'] and cs[d['i']] == '0')
        elif ty == 'water':
            if T['k'] == 0: pg.wait_for_timeout(1500); snap('water')
            click_pick('cell', lambda d: d['plot'] == T['plot'] and d['i'] in T['cells'] and d['i'] not in T['got']); pg.wait_for_timeout(700)
        elif ty == 'harvest':
            if T['sel'] is None:
                if T['k'] == 0: pg.wait_for_timeout(1500); snap('harvest')
                click_pick('cell', lambda d: d['plot'] == T['plot'] and d['i'] in T['cells'] and d['i'] not in T['got'])
            else: click_pick('crate')
            pg.wait_for_timeout(400)
        elif ty == 'feed':
            if 'feed' not in seen: pg.wait_for_timeout(1500); snap('feed')
            click_pick('sack')
        elif ty == 'sell':
            if T['phase'] == 'load':
                if T['a'] + T['b'] == 0: pg.wait_for_timeout(1200); snap('sell')
                click_pick('veg' if T['a'] < T['A'] else 'egg')
            elif T['phase'] == 'ask':
                tot = T['A'] + T['B']
                for bt in pg.query_selector_all('.choice'):
                    if bt.inner_text().strip() == str(tot): bt.click(); break
        pg.wait_for_timeout(450)
        if s['bld'] and 'build' not in seen: pg.wait_for_timeout(1200); snap('build')
    snap('final')
    print('LOG'); [print(l) for l in log]
    print('FINAL', json.dumps(st()))
    print('ERRORS', errors[:10])
    b.close()
