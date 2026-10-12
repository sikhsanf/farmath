#!/usr/bin/env python3
"""Build Farmath into one HTML file.
index.html          full document, served by GitHub Pages (repo root)
dist/artifact.html  page fragment for publishing as an Artifact
dist/artifact.html  page fragment for publishing as an Artifact (skeleton is added on publish)
"""
import os, re
R = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(os.path.join(R, p), encoding='utf-8').read()

three = rd('node_modules/three/build/three.min.js')
css = rd('src/style.css')
body = rd('src/body.html')
game = '\n'.join(rd('src/' + f) for f in ('p1_core.js', 'p2_world.js', 'p3_game.js', 'p4_intro.js', 'p5_boot.js'))
game = '(function(){\n"use strict";\n' + game + '\n})();'

FONT = '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap" rel="stylesheet">'
TITLE = '<title>Farmath</title>'

SW = "<script>if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));</script>\n"
import shutil
def guard(js):  # a literal </script> inside inline JS would end the tag
    return js.replace('</script', '<\\/script')

core = f'{TITLE}\n{FONT}\n<style>\n{css}\n</style>\n{body}\n<script>\n{guard(three)}\n</script>\n<script>\n{guard(game)}\n</script>\n'

os.makedirs(os.path.join(R, 'dist'), exist_ok=True)
head = ('<!doctype html>\n<html lang="id"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">'
        '<meta name="theme-color" content="#8fd0ff">'
        '<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes">'
        '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Farmath">'
        '<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="apple-touch-icon.png">'
        '<link rel="icon" type="image/png" href="icon-192.png"></head><body>\n')
open(os.path.join(R, 'index.html'), 'w', encoding='utf-8').write(head + core + SW + '</body></html>\n')
open(os.path.join(R, 'dist/artifact.html'), 'w', encoding='utf-8').write(core)
for f in os.listdir(os.path.join(R, 'pwa')):
    if not f.endswith('.py'): shutil.copy(os.path.join(R, 'pwa', f), os.path.join(R, f))
print('built index.html', os.path.getsize(os.path.join(R, 'index.html')), 'artifact.html', os.path.getsize(os.path.join(R, 'dist/artifact.html')))
