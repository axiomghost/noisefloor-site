"""Draw the default link-preview image, public/images/og-default.png (1200 x 630).

Run once after a brand change (any Python with Pillow, on Windows for the fonts):
    python scripts/make-og-image.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
BG = (12, 15, 19)
CYAN, RED = (0, 229, 255), (255, 23, 68)
TEXT, MUTED, GOLD = (243, 245, 247), (154, 165, 177), (226, 184, 102)
FONTS = Path("C:/Windows/Fonts")
OUT = Path(__file__).resolve().parent.parent / "public" / "images" / "og-default.png"

img = Image.new("RGB", (W, H), BG)

# One soft cyan glow at the top, as on the site.
glow = Image.new("RGB", (W, H), BG)
ImageDraw.Draw(glow).ellipse((150, -420, 1050, 260), fill=(18, 44, 52))
img = Image.blend(img, glow.filter(ImageFilter.GaussianBlur(120)), 1.0)
d = ImageDraw.Draw(img)

# The NF logo, from public/images/nf-logo.svg (52 x 52 units), scaled.
s, ox, oy = 2.6, 96, 92
def box(x, y, w, h, c):
    d.rectangle((ox + x * s, oy + y * s, ox + (x + w) * s, oy + (y + h) * s), fill=c)
box(0, 0, 7, 52, CYAN)
d.polygon([(ox + x * s, oy + y * s) for x, y in [(0, 0), (9, 0), (28, 44), (28, 52), (19, 52), (0, 8)]], fill=CYAN)
box(23, 0, 5, 52, CYAN)
box(28, 0, 5, 52, RED)
box(33, 0, 17, 9, RED)
box(33, 22, 14, 9, RED)

mono = ImageFont.truetype(str(FONTS / "consolab.ttf"), 44)
title = ImageFont.truetype(str(FONTS / "segoeuib.ttf"), 64)
body = ImageFont.truetype(str(FONTS / "segoeui.ttf"), 32)
small = ImageFont.truetype(str(FONTS / "consola.ttf"), 26)

d.text((ox + 52 * s + 36, oy + 30), "noise-floor", font=mono, fill=TEXT)
d.text((96, 300), "Engineering notes", font=title, fill=TEXT)
d.text((96, 388), "Signal processing, acoustic sensing and wireless systems,", font=body, fill=MUTED)
d.text((96, 430), "with the maths, the code and the corrections.", font=body, fill=MUTED)
d.line((96, 520, 1104, 520), fill=(34, 43, 52), width=2)
d.text((96, 546), "axiomghost.github.io/noisefloor-site", font=small, fill=GOLD)

OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, optimize=True)
print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")
