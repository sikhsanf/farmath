# Farmath

Game kebun hitung-hitungan untuk anak usia 4+ (voxel isometrik, satu file HTML). Konten matematika berdasarkan kurikulum Singapura, direview oleh Catherine.

## Main
Buka `index.html` (atau GitHub Pages dari root repo). Tambahkan `?fast` di URL untuk mempercepat timer saat tes.

## Build
```
npm install        # three@0.128.0
python3 build.py   # menulis index.html (+ dist/artifact.html)
```
Sumber ada di `src/` (p1 inti, p2 dunia, p3 gameplay, p4 intro, p5 boot). Tes otomatis headless (Playwright) ada di `test/`.
