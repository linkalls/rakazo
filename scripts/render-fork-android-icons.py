"""Reproducible fork-specific Android icons (generated PNGs, no new dependency)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math

OUT = Path(__file__).resolve().parents[1] / "apps/mobile/assets"
SIZE = 1024
SCALE = 2
N = SIZE * SCALE

def rgba(c): return tuple(c)

def background():
    im = Image.new('RGBA', (N, N))
    pix = im.load()
    for y in range(N):
        for x in range(N):
            t = (x / (N - 1) * 0.42 + (N - y - 1) / (N - 1) * 0.58)
            # violet -> midnight blue, subtle dimensionality
            pix[x, y] = (int(24 + 75*t), int(13 + 35*t), int(76 + 117*t), 255)
    return im

def art(monochrome=False):
    im = Image.new('RGBA', (N, N), (0,0,0,0))
    d = ImageDraw.Draw(im)
    # Main chat bubble. Quiet but recognisable and visually different from upstream.
    bubble = (290*SCALE, 275*SCALE, 735*SCALE, 715*SCALE)
    col = (255, 255, 255, 255) if not monochrome else (0,0,0,255)
    d.rounded_rectangle(bubble, radius=168*SCALE, fill=col)
    d.polygon([(362*SCALE,652*SCALE),(336*SCALE,786*SCALE),(474*SCALE,692*SCALE)], fill=col)
    # Inner three nodes connected as a branching team graph.
    hole = (56,33,115,255) if not monochrome else (0,0,0,0)
    # For monochrome foreground retain negative space by making alpha transparent.
    points=[(440, 459), (565, 399), (590, 569)]
    d.line([(p[0]*SCALE,p[1]*SCALE) for p in points[:2]], fill=hole, width=34*SCALE, joint='curve')
    d.line([(points[0][0]*SCALE,points[0][1]*SCALE),(points[2][0]*SCALE,points[2][1]*SCALE)], fill=hole, width=34*SCALE, joint='curve')
    for px,py in points:
        d.ellipse((px*SCALE-36*SCALE,py*SCALE-36*SCALE,px*SCALE+36*SCALE,py*SCALE+36*SCALE),fill=hole)
    return im

# Launcher icon with padding, a rounded tile, and branch artwork.
bg=background()
mask=Image.new('L', (N,N), 0)
ImageDraw.Draw(mask).rounded_rectangle((42*SCALE,42*SCALE,982*SCALE,982*SCALE),radius=220*SCALE,fill=255)
bg.putalpha(mask)
bg.alpha_composite(art())
bg.resize((SIZE,SIZE),Image.Resampling.LANCZOS).save(OUT/'fork-icon.png',optimize=True)

# Adaptive icon is transparent foreground, compatible with Android mask clipping.
art().resize((SIZE,SIZE),Image.Resampling.LANCZOS).save(OUT/'fork-adaptive-icon.png',optimize=True)
art(monochrome=True).resize((SIZE,SIZE),Image.Resampling.LANCZOS).save(OUT/'fork-monochrome-icon.png',optimize=True)
background().resize((SIZE,SIZE),Image.Resampling.LANCZOS).convert('RGB').save(OUT/'fork-icon-background.png',optimize=True)
# Splash branding also differs from the upstream application.
art().resize((SIZE,SIZE),Image.Resampling.LANCZOS).save(OUT/'fork-splash-icon.png',optimize=True)
