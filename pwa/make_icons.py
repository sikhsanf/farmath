"""Generate Farmath app icons (voxel carrot on a field). Run: python3 pwa/make_icons.py"""
from PIL import Image, ImageDraw
import os
D=os.path.dirname(os.path.abspath(__file__))
def draw(size, safe=1.0, round_=False):
    S=1024; im=Image.new('RGBA',(S,S),(0,0,0,0)); d=ImageDraw.Draw(im)
    bg=Image.new('RGBA',(S,S)); b=ImageDraw.Draw(bg)
    b.rectangle([0,0,S,S],fill=(143,208,255))
    b.rectangle([0,int(S*.68),S,S],fill=(98,176,84))
    for i in range(6): b.rectangle([0,int(S*.68)+i*0,S,int(S*.68)+8],fill=(120,196,98))
    for x in range(0,S,128): b.rectangle([x+8,int(S*.8),x+60,int(S*.8)+20],fill=(80,150,70))
    b.ellipse([int(S*.7),int(S*.1),int(S*.88),int(S*.28)],fill=(255,226,110))
    im.paste(bg,(0,0))
    # carrot, voxel blocks
    u=int(S*safe/16); ox=(S-u*16)//2; oy=(S-u*16)//2
    def blk(gx,gy,w,h,c):
        d.rectangle([ox+gx*u,oy+gy*u,ox+(gx+w)*u,oy+(gy+h)*u],fill=c)
    O=(244,140,40); O2=(214,110,25)
    blk(5,5,6,2,O);blk(5,7,6,2,O);blk(6,9,4,2,O);blk(6,11,4,1,O2);blk(7,12,2,2,O2)
    blk(5,5,1,4,O2); blk(8,6,1,1,O2); blk(7,8,2,1,O2)
    G=(60,160,70);G2=(40,125,55)
    blk(6,1,2,4,G);blk(8,2,2,3,G2);blk(4,3,2,2,G2);blk(10,3,2,2,G)
    out=im.resize((size,size),Image.NEAREST if size<256 else Image.LANCZOS)
    if round_:
        m=Image.new('L',(size,size),0);ImageDraw.Draw(m).rounded_rectangle([0,0,size,size],radius=size//5,fill=255)
        out.putalpha(m)
    return out
draw(192,.9).convert('RGBA').save(f'{D}/icon-192.png')
draw(512,.9).save(f'{D}/icon-512.png')
draw(512,.62).convert('RGBA').save(f'{D}/icon-512-maskable.png')
draw(180,.9).convert('RGB').save(f'{D}/apple-touch-icon.png')
print('ok')
