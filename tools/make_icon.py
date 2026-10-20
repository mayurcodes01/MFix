"""Draws the MFix app icon (build/icon.png and build/icon.ico). Needs: pip install pillow"""
import os
from PIL import Image, ImageDraw
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'build')
os.makedirs(OUT, exist_ok=True)
S = 1024
img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
grad = Image.new('RGBA', (S, S))
px = grad.load()
for y in range(S):
    for x in range(S):
        t = (x + y) / (2 * S)
        px[x, y] = (int(124 + (34 - 124) * t), int(92 + (211 - 92) * t), int(255 + (238 - 255) * t), 255)
mask = Image.new('L', (S, S), 0)
ImageDraw.Draw(mask).rounded_rectangle((64, 64, S - 64, S - 64), 230, fill=255)
img.paste(grad, (0, 0), mask)
d = ImageDraw.Draw(img)
d.line([(330, 700), (560, 470)], fill='white', width=96)       # wrench handle
d.ellipse((520, 230, 790, 500), outline='white', width=88)     # wrench head
d.polygon([(640, 230), (760, 230), (700, 350)], fill=(124, 92, 255, 255))  # jaw opening
img.save(os.path.join(OUT, 'icon.png'))
img.save(os.path.join(OUT, 'icon.ico'), sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
print('icon written to', OUT)
